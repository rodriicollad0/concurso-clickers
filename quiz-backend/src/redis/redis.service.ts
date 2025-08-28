import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, RedisClientType } from 'redis';

export interface QuizState {
  id: number;
  title: string;
  status: string;
  currentQuestionId: number | null;
  totalQuestions: number;
  participants: string[];
  startedAt: Date | null;
}

export interface QuestionState {
  id: number;
  quizId: number;
  questionText: string;
  options: {
    A: string;
    B: string;
    C: string;
    D: string;
  };
  correctAnswer: string;
  timeLimit: number | null;
  startedAt: Date | null;
  isActive: boolean;
}

export interface ParticipantScore {
  clickerId: string;
  score: number;
  correctAnswers: number;
  totalAnswers: number;
  lastAnswerTime: Date;
}

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  private redisClient: RedisClientType;
  private subscriber: RedisClientType;

  constructor(private configService: ConfigService) {}

  async onModuleInit() {
    await this.connect();
  }

  async onModuleDestroy() {
    await this.disconnect();
  }

  private async connect() {
    try {
      const redisUrl = this.configService.get<string>('REDIS_URL') || 'redis://localhost:6379';
      
      // Cliente principal
      this.redisClient = createClient({
        url: redisUrl,
        socket: {
          reconnectStrategy: (retries) => Math.min(retries * 50, 1000),
        },
      });

      // Cliente para subscripciones
      this.subscriber = createClient({
        url: redisUrl,
        socket: {
          reconnectStrategy: (retries) => Math.min(retries * 50, 1000),
        },
      });

      this.redisClient.on('error', (err) => {
        this.logger.error('Redis Client Error:', err);
      });

      this.subscriber.on('error', (err) => {
        this.logger.error('Redis Subscriber Error:', err);
      });

      await this.redisClient.connect();
      await this.subscriber.connect();
      
      this.logger.log('✅ Redis connected successfully');
    } catch (error) {
      this.logger.error('❌ Failed to connect to Redis:', error);
      throw error;
    }
  }

  private async disconnect() {
    try {
      await this.redisClient?.disconnect();
      await this.subscriber?.disconnect();
      this.logger.log('Redis disconnected');
    } catch (error) {
      this.logger.error('Error disconnecting Redis:', error);
    }
  }

  // =============== GENERIC REDIS OPERATIONS ===============

  async get(key: string): Promise<string | null> {
    try {
      return await this.redisClient.get(key);
    } catch (error) {
      this.logger.error(`Error getting key ${key}:`, error);
      return null;
    }
  }

  async set(key: string, value: string, ttl?: number): Promise<boolean> {
    try {
      if (ttl) {
        await this.redisClient.setEx(key, ttl, value);
      } else {
        await this.redisClient.set(key, value);
      }
      return true;
    } catch (error) {
      this.logger.error(`Error setting key ${key}:`, error);
      return false;
    }
  }

  async del(key: string): Promise<boolean> {
    try {
      await this.redisClient.del(key);
      return true;
    } catch (error) {
      this.logger.error(`Error deleting key ${key}:`, error);
      return false;
    }
  }

  async exists(key: string): Promise<boolean> {
    try {
      const result = await this.redisClient.exists(key);
      return result === 1;
    } catch (error) {
      this.logger.error(`Error checking existence of key ${key}:`, error);
      return false;
    }
  }

  // =============== LIST OPERATIONS ===============

  async lpush(key: string, value: string): Promise<number> {
    try {
      return await this.redisClient.lPush(key, value);
    } catch (error) {
      this.logger.error(`Error lpush to ${key}:`, error);
      return 0;
    }
  }

  async lrange(key: string, start: number, stop: number): Promise<string[]> {
    try {
      return await this.redisClient.lRange(key, start, stop);
    } catch (error) {
      this.logger.error(`Error lrange ${key}:`, error);
      return [];
    }
  }

  async llen(key: string): Promise<number> {
    try {
      return await this.redisClient.lLen(key);
    } catch (error) {
      this.logger.error(`Error llen ${key}:`, error);
      return 0;
    }
  }

  // =============== SORTED SET OPERATIONS (LEADERBOARDS) ===============

  async zadd(key: string, score: number, member: string): Promise<number> {
    try {
      return await this.redisClient.zAdd(key, { score, value: member });
    } catch (error) {
      this.logger.error(`Error zadd to ${key}:`, error);
      return 0;
    }
  }

  async zrevrange(key: string, start: number, stop: number): Promise<string[]> {
    try {
      return await this.redisClient.zRange(key, start, stop, { REV: true });
    } catch (error) {
      this.logger.error(`Error zrevrange ${key}:`, error);
      return [];
    }
  }

  async zrevrangeWithScores(key: string, start: number, stop: number): Promise<Array<{value: string, score: number}>> {
    try {
      const results = await this.redisClient.zRangeWithScores(key, start, stop, { REV: true });
      return results.map(result => ({
        value: result.value,
        score: result.score,
      }));
    } catch (error) {
      this.logger.error(`Error zrevrangeWithScores ${key}:`, error);
      return [];
    }
  }

  async zscore(key: string, member: string): Promise<number | null> {
    try {
      return await this.redisClient.zScore(key, member);
    } catch (error) {
      this.logger.error(`Error zscore ${key} ${member}:`, error);
      return null;
    }
  }

  // =============== HASH OPERATIONS ===============

  async hset(key: string, field: string, value: string): Promise<number> {
    try {
      return await this.redisClient.hSet(key, field, value);
    } catch (error) {
      this.logger.error(`Error hset ${key} ${field}:`, error);
      return 0;
    }
  }

  async hget(key: string, field: string): Promise<string | null> {
    try {
      return await this.redisClient.hGet(key, field);
    } catch (error) {
      this.logger.error(`Error hget ${key} ${field}:`, error);
      return null;
    }
  }

  async hgetall(key: string): Promise<Record<string, string>> {
    try {
      return await this.redisClient.hGetAll(key);
    } catch (error) {
      this.logger.error(`Error hgetall ${key}:`, error);
      return {};
    }
  }

  async hmset(key: string, data: Record<string, string>): Promise<boolean> {
    try {
      await this.redisClient.hSet(key, data);
      return true;
    } catch (error) {
      this.logger.error(`Error hmset ${key}:`, error);
      return false;
    }
  }

  // =============== PUB/SUB OPERATIONS ===============

  async publish(channel: string, message: string): Promise<number> {
    try {
      return await this.redisClient.publish(channel, message);
    } catch (error) {
      this.logger.error(`Error publishing to ${channel}:`, error);
      return 0;
    }
  }

  async subscribe(channel: string, callback: (message: string) => void): Promise<void> {
    try {
      if (!this.subscriber || !this.subscriber.isReady) {
        this.logger.warn(`Subscriber not ready for channel ${channel}, skipping...`);
        return;
      }
      
      await this.subscriber.subscribe(channel, callback);
    } catch (error) {
      this.logger.error(`Error subscribing to ${channel}:`, error);
    }
  }

  // =============== QUIZ-SPECIFIC METHODS ===============

  // Estado del Quiz
  async setQuizState(quizId: number, state: QuizState): Promise<boolean> {
    const key = `quiz:${quizId}:state`;
    return await this.set(key, JSON.stringify(state));
  }

  async getQuizState(quizId: number): Promise<QuizState | null> {
    const key = `quiz:${quizId}:state`;
    const data = await this.get(key);
    return data ? JSON.parse(data) : null;
  }

  async setActiveQuiz(quizId: number): Promise<boolean> {
    return await this.set('quiz:active', quizId.toString());
  }

  async getActiveQuiz(): Promise<number | null> {
    const data = await this.get('quiz:active');
    return data ? parseInt(data) : null;
  }

  // Estado de la Pregunta
  async setQuestionState(questionId: number, state: QuestionState, ttl?: number): Promise<boolean> {
    const key = `question:${questionId}:state`;
    return await this.set(key, JSON.stringify(state), ttl);
  }

  async getQuestionState(questionId: number): Promise<QuestionState | null> {
    const key = `question:${questionId}:state`;
    const data = await this.get(key);
    return data ? JSON.parse(data) : null;
  }

  async setActiveQuestion(quizId: number, questionId: number, ttl?: number): Promise<boolean> {
    const key = `quiz:${quizId}:current_question`;
    return await this.set(key, questionId.toString(), ttl);
  }

  async getActiveQuestion(quizId: number): Promise<number | null> {
    const key = `quiz:${quizId}:current_question`;
    const data = await this.get(key);
    return data ? parseInt(data) : null;
  }

  // Respuestas en tiempo real
  async addAnswer(questionId: number, answer: any): Promise<number> {
    const key = `answers:question:${questionId}`;
    return await this.lpush(key, JSON.stringify({
      ...answer,
      timestamp: new Date().toISOString(),
    }));
  }

  async getAnswers(questionId: number): Promise<any[]> {
    const key = `answers:question:${questionId}`;
    const answers = await this.lrange(key, 0, -1);
    return answers.map(answer => JSON.parse(answer));
  }

  async getAnswerCount(questionId: number): Promise<number> {
    const key = `answers:question:${questionId}`;
    return await this.llen(key);
  }

  // Estadísticas en tiempo real
  async incrementAnswerStat(questionId: number, option: string): Promise<number> {
    const key = `stats:question:${questionId}:${option}`;
    try {
      return await this.redisClient.incr(key);
    } catch (error) {
      this.logger.error(`Error incrementing stat ${key}:`, error);
      return 0;
    }
  }

  async getAnswerStats(questionId: number): Promise<{A: number, B: number, C: number, D: number}> {
    try {
      const [A, B, C, D] = await Promise.all([
        this.redisClient.get(`stats:question:${questionId}:A`),
        this.redisClient.get(`stats:question:${questionId}:B`),
        this.redisClient.get(`stats:question:${questionId}:C`),
        this.redisClient.get(`stats:question:${questionId}:D`),
      ]);

      return {
        A: parseInt(A || '0'),
        B: parseInt(B || '0'),
        C: parseInt(C || '0'),
        D: parseInt(D || '0'),
      };
    } catch (error) {
      this.logger.error(`Error getting answer stats for question ${questionId}:`, error);
      return { A: 0, B: 0, C: 0, D: 0 };
    }
  }

  // Leaderboard
  async updateParticipantScore(quizId: number, clickerId: string, score: number): Promise<number> {
    const key = `leaderboard:quiz:${quizId}`;
    return await this.zadd(key, score, clickerId);
  }

  async getLeaderboard(quizId: number, limit: number = 10): Promise<Array<{clickerId: string, score: number}>> {
    const key = `leaderboard:quiz:${quizId}`;
    const results = await this.zrevrangeWithScores(key, 0, limit - 1);
    return results.map(result => ({
      clickerId: result.value,
      score: result.score,
    }));
  }

  async getParticipantRank(quizId: number, clickerId: string): Promise<number | null> {
    const key = `leaderboard:quiz:${quizId}`;
    try {
      // Usar zRevRank para obtener el ranking de mayor a menor
      const allMembers = await this.zrevrangeWithScores(key, 0, -1);
      const memberIndex = allMembers.findIndex(member => member.value === clickerId);
      return memberIndex !== -1 ? memberIndex + 1 : null; // 1-indexed
    } catch (error) {
      this.logger.error(`Error getting rank for ${clickerId}:`, error);
      return null;
    }
  }

  // Participantes conectados
  async addParticipant(quizId: number, clickerId: string): Promise<number> {
    const key = `participants:quiz:${quizId}`;
    try {
      return await this.redisClient.sAdd(key, clickerId);
    } catch (error) {
      this.logger.error(`Error adding participant ${clickerId}:`, error);
      return 0;
    }
  }

  async removeParticipant(quizId: number, clickerId: string): Promise<number> {
    const key = `participants:quiz:${quizId}`;
    try {
      return await this.redisClient.sRem(key, clickerId);
    } catch (error) {
      this.logger.error(`Error removing participant ${clickerId}:`, error);
      return 0;
    }
  }

  async getParticipants(quizId: number): Promise<string[]> {
    const key = `participants:quiz:${quizId}`;
    try {
      return await this.redisClient.sMembers(key);
    } catch (error) {
      this.logger.error(`Error getting participants for quiz ${quizId}:`, error);
      return [];
    }
  }

  async getParticipantCount(quizId: number): Promise<number> {
    const key = `participants:quiz:${quizId}`;
    try {
      return await this.redisClient.sCard(key);
    } catch (error) {
      this.logger.error(`Error getting participant count for quiz ${quizId}:`, error);
      return 0;
    }
  }

  // Limpieza de datos
  async clearQuizData(quizId: number): Promise<void> {
    try {
      const keys = [
        `quiz:${quizId}:state`,
        `quiz:${quizId}:current_question`,
        `leaderboard:quiz:${quizId}`,
        `participants:quiz:${quizId}`,
      ];

      // También buscar preguntas y respuestas relacionadas
      const questionKeys = await this.redisClient.keys(`question:*:quiz:${quizId}`);
      const answerKeys = await this.redisClient.keys(`answers:question:*`);
      const statKeys = await this.redisClient.keys(`stats:question:*`);

      const allKeys = [...keys, ...questionKeys, ...answerKeys, ...statKeys];
      
      if (allKeys.length > 0) {
        await this.redisClient.del(allKeys);
      }
      
      this.logger.log(`Cleared Redis data for quiz ${quizId}`);
    } catch (error) {
      this.logger.error(`Error clearing quiz data for ${quizId}:`, error);
    }
  }
}
