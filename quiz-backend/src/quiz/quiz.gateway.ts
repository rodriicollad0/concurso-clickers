import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { QuizService } from './quiz.service';
import { SubmitAnswerDto } from './dto';

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5174',
    methods: ['GET', 'POST'],
    credentials: true,
  },
})
export class QuizGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(QuizGateway.name);
  private connectedClients = new Map<string, { socket: Socket; clickerId?: string }>();

  constructor(private readonly quizService: QuizService) {}

  // =============== CONNECTION MANAGEMENT ===============

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
    this.connectedClients.set(client.id, { socket: client });
    
    // Enviar estado inicial
    this.server.to(client.id).emit('connection:established', {
      clientId: client.id,
      timestamp: new Date().toISOString(),
    });
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
    const clientData = this.connectedClients.get(client.id);
    
    if (clientData?.clickerId) {
      // Notificar que el clicker se desconectó
      this.server.emit('clicker:disconnected', {
        clickerId: clientData.clickerId,
        timestamp: new Date().toISOString(),
      });
    }
    
    this.connectedClients.delete(client.id);
  }

  @SubscribeMessage('answer:submit')
  async handleAnswerSubmit(
    @MessageBody() data: SubmitAnswerDto,
    @ConnectedSocket() client: Socket,
  ) {
    try {
      // Guardar respuesta en la base de datos
      const answer = await this.quizService.submitAnswer(data);
      
      this.logger.log(`Answer submitted: ${data.clickerId} -> ${data.selectedAnswer} for question ${data.questionId}`);
      
      // Notificar a todos los clientes sobre la nueva respuesta
      this.server.emit('answer:received', {
        questionId: data.questionId,
        clickerId: data.clickerId,
        selectedAnswer: data.selectedAnswer,
        isCorrect: answer.isCorrect,
        responseTime: data.responseTime,
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
}
