import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { QuizService } from './quiz.service';
import { SubmitAnswerDto } from './dto';
import { RedisService } from '../redis/redis.service';

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL || ['http://localhost:5173', 'http://localhost:5174'],
    methods: ['GET', 'POST'],
    credentials: true,
  },
})
export class QuizGateway implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(QuizGateway.name);
  private connectedClients = new Map<string, { socket: Socket; clickerId?: string }>();

  constructor(
    private readonly quizService: QuizService,
    private readonly redisService: RedisService,
  ) {}

  // =============== GATEWAY LIFECYCLE ===============

  afterInit(server: Server) {
    this.logger.log('WebSocket Gateway initialized');
    this.setupRedisSubscriptions();
  }

  private async setupRedisSubscriptions() {
    // REDIS: Subscribirse a eventos de respuestas
    await this.redisService.subscribe('quiz:answer:received', (message) => {
      const data = JSON.parse(message);
      this.server.emit('answer:received', data);
    });

    // REDIS: Subscribirse a cambios de estado del quiz
    await this.redisService.subscribe('quiz:state:changed', (message) => {
      const data = JSON.parse(message);
      this.server.emit('quiz:state:changed', data);
    });

    // REDIS: Subscribirse a cambios de pregunta
    await this.redisService.subscribe('quiz:question:changed', (message) => {
      const data = JSON.parse(message);
      this.server.emit('quiz:question:changed', data);
    });

    // REDIS: Subscribirse a actualizaciones del leaderboard
    await this.redisService.subscribe('quiz:leaderboard:updated', (message) => {
      const data = JSON.parse(message);
      this.server.emit('quiz:leaderboard:updated', data);
    });

    this.logger.log('Redis subscriptions configured');
  }

  // =============== CONNECTION MANAGEMENT ===============

  async handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
    this.connectedClients.set(client.id, { socket: client });
    
    // REDIS: Enviar estado actual del quiz
    const activeQuizInfo = await this.quizService.getActiveQuizInfo();
    
    this.server.to(client.id).emit('connection:established', {
      clientId: client.id,
      timestamp: new Date().toISOString(),
      activeQuiz: activeQuizInfo,
    });
  }

  async handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
    const clientData = this.connectedClients.get(client.id);
    
    if (clientData?.clickerId) {
      // REDIS: Remover del quiz activo
      const activeQuizId = await this.redisService.getActiveQuiz();
      if (activeQuizId) {
        await this.redisService.removeParticipant(activeQuizId, clientData.clickerId);
      }
      
      // Notificar que el clicker se desconectó
      this.server.emit('clicker:disconnected', {
        clickerId: clientData.clickerId,
        timestamp: new Date().toISOString(),
      });
    }
    
    this.connectedClients.delete(client.id);
  }

  // =============== MESSAGE HANDLERS ===============

  @SubscribeMessage('answer:submit')
  async handleAnswerSubmit(
    @MessageBody() data: SubmitAnswerDto,
    @ConnectedSocket() client: Socket,
  ) {
    try {
      // ULTRA-RÁPIDO: Respuesta se guarda en Redis primero
      const answer = await this.quizService.submitAnswer(data);
      
      this.logger.log(`Answer submitted: ${data.clickerId} -> ${data.selectedAnswer} for question ${data.questionId}`);
      
      // REDIS: Publicar evento para múltiples servidores
      const answerEvent = {
        questionId: data.questionId,
        clickerId: data.clickerId,
        selectedAnswer: data.selectedAnswer,
        isCorrect: answer.isCorrect,
        responseTime: data.responseTime,
        timestamp: new Date().toISOString(),
      };

      await this.redisService.publish('quiz:answer:received', JSON.stringify(answerEvent));
      
      // Obtener estadísticas actualizadas en tiempo real
      const stats = await this.quizService.getQuestionStatsRealTime(data.questionId);
      
      // Emitir estadísticas actualizadas
      this.server.emit('question:stats:updated', {
        questionId: data.questionId,
        stats: stats.stats,
        totalAnswers: stats.totalAnswers,
        timestamp: new Date().toISOString(),
      });

      // REDIS: Actualizar leaderboard si es correcta
      if (answer.isCorrect) {
        const question = await this.quizService.findQuestionById(data.questionId);
        const leaderboard = await this.quizService.getQuizLeaderboard(question.quizId, 10);
        
        await this.redisService.publish('quiz:leaderboard:updated', JSON.stringify({
          quizId: question.quizId,
          leaderboard,
          timestamp: new Date().toISOString(),
        }));
      }
      
      // Confirmar al cliente que envió
      client.emit('answer:submit:success', {
        questionId: data.questionId,
        isCorrect: answer.isCorrect,
        timestamp: new Date().toISOString(),
      });
      
    } catch (error) {
      this.logger.error(`Error submitting answer:`, error);
      client.emit('answer:submit:error', {
        questionId: data.questionId,
        error: error.message,
        timestamp: new Date().toISOString(),
      });
    }
  }

  @SubscribeMessage('clicker:register')
  async handleClickerRegister(
    @MessageBody() data: { clickerId: string; name?: string },
    @ConnectedSocket() client: Socket,
  ) {
    try {
      // Registrar participante
      const participant = await this.quizService.registerParticipant(data.clickerId, data.name);
      
      // Actualizar información del cliente
      const clientData = this.connectedClients.get(client.id);
      if (clientData) {
        clientData.clickerId = data.clickerId;
        this.connectedClients.set(client.id, clientData);
      }
      
      this.logger.log(`Clicker registered: ${data.clickerId}`);
      
      // Obtener estadísticas del participante
      const stats = await this.quizService.getParticipantStats(data.clickerId);
      
      client.emit('clicker:register:success', {
        clickerId: data.clickerId,
        participant,
        stats,
        timestamp: new Date().toISOString(),
      });
      
      // Notificar a otros clientes
      this.server.emit('clicker:connected', {
        clickerId: data.clickerId,
        name: data.name,
        timestamp: new Date().toISOString(),
      });
      
    } catch (error) {
      this.logger.error(`Error registering clicker:`, error);
      client.emit('clicker:register:error', {
        error: error.message,
        timestamp: new Date().toISOString(),
      });
    }
  }

  @SubscribeMessage('clicker:auto-register')
  async handleClickerAutoRegister(
    @MessageBody() data: { clickerId: string; name?: string },
    @ConnectedSocket() client: Socket,
  ) {
    try {
      this.logger.log(`Auto-registering clicker: ${data.clickerId}`);
      
      // Registrar participante automáticamente
      const participant = await this.quizService.registerParticipant(data.clickerId, data.name);
      
      // Actualizar información del cliente
      const clientData = this.connectedClients.get(client.id);
      if (clientData) {
        clientData.clickerId = data.clickerId;
        this.connectedClients.set(client.id, clientData);
      }
      
      this.logger.log(`Clicker auto-registered: ${data.clickerId}`);
      
      // Obtener estadísticas del participante
      const stats = await this.quizService.getParticipantStats(data.clickerId);
      
      client.emit('clicker:auto-register:success', {
        clickerId: data.clickerId,
        participant,
        stats,
        timestamp: new Date().toISOString(),
      });
      
      // Notificar a otros clientes que se conectó un clicker automáticamente
      this.server.emit('clicker:auto-connected', {
        clickerId: data.clickerId,
        name: data.name || data.clickerId,
        timestamp: new Date().toISOString(),
      });
      
    } catch (error) {
      this.logger.error(`Error auto-registering clicker:`, error);
      client.emit('clicker:auto-register:error', {
        error: error.message,
        timestamp: new Date().toISOString(),
      });
    }
  }

  @SubscribeMessage('quiz:get-status')
  async handleGetQuizStatus(@ConnectedSocket() client: Socket) {
    try {
      const activeQuizInfo = await this.quizService.getActiveQuizInfo();
      
      client.emit('quiz:status', {
        ...activeQuizInfo,
        timestamp: new Date().toISOString(),
      });
      
    } catch (error) {
      this.logger.error(`Error getting quiz status:`, error);
      client.emit('quiz:status:error', {
        error: error.message,
        timestamp: new Date().toISOString(),
      });
    }
  }

  @SubscribeMessage('question:get-stats')
  async handleGetQuestionStats(
    @MessageBody() data: { questionId: number },
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const stats = await this.quizService.getQuestionStatsRealTime(data.questionId);
      
      client.emit('question:stats', {
        questionId: data.questionId,
        ...stats,
        timestamp: new Date().toISOString(),
      });
      
    } catch (error) {
      this.logger.error(`Error getting question stats:`, error);
      client.emit('question:stats:error', {
        questionId: data.questionId,
        error: error.message,
        timestamp: new Date().toISOString(),
      });
    }
  }

  @SubscribeMessage('leaderboard:get')
  async handleGetLeaderboard(
    @MessageBody() data: { quizId: number; limit?: number },
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const leaderboard = await this.quizService.getQuizLeaderboard(data.quizId, data.limit || 10);
      
      client.emit('leaderboard:data', {
        quizId: data.quizId,
        leaderboard,
        timestamp: new Date().toISOString(),
      });
      
    } catch (error) {
      this.logger.error(`Error getting leaderboard:`, error);
      client.emit('leaderboard:error', {
        quizId: data.quizId,
        error: error.message,
        timestamp: new Date().toISOString(),
      });
    }
  }
}
