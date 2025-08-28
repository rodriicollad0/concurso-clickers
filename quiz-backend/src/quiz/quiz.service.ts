import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Quiz, Question, Answer, Participant, QuizStatus, AnswerOption } from './entities';
import { CreateQuizDto, UpdateQuizDto, CreateQuestionDto, SubmitAnswerDto } from './dto';
import { RedisService } from '../redis/redis.service';

@Injectable()
export class QuizService {
  constructor(
    @InjectRepository(Quiz)
    private quizRepository: Repository<Quiz>,
    @InjectRepository(Question)
    private questionRepository: Repository<Question>,
    @InjectRepository(Answer)
    private answerRepository: Repository<Answer>,
    @InjectRepository(Participant)
    private participantRepository: Repository<Participant>,
    private redisService: RedisService,
  ) {}

  // =============== QUIZ METHODS ===============
  
  async createQuiz(createQuizDto: CreateQuizDto): Promise<Quiz> {
    const quiz = this.quizRepository.create(createQuizDto);
    const savedQuiz = await this.quizRepository.save(quiz);
    
    // 🚀 REDIS: Cachear estado inicial del quiz
    await this.redisService.setQuizState(savedQuiz.id, {
      id: savedQuiz.id,
      title: savedQuiz.title,
      status: savedQuiz.status,
      currentQuestionId: null,
      totalQuestions: 0,
      participants: [],
      startedAt: null,
    });
    
    return savedQuiz;
  }

  async findAllQuizzes(): Promise<Quiz[]> {
    return await this.quizRepository.find({
      relations: ['questions'],
      order: { createdAt: 'DESC' },
    });
  }

  async findQuizById(id: number): Promise<Quiz> {
    // 🚀 REDIS: Intentar obtener del cache primero
    const cachedQuiz = await this.redisService.getQuizState(id);
    
    const quiz = await this.quizRepository.findOne({
      where: { id },
      relations: ['questions'],
    });

    if (!quiz) {
      throw new NotFoundException(`Quiz with ID ${id} not found`);
    }

    // 🚀 REDIS: Actualizar cache si no existe o está desactualizado
    if (!cachedQuiz) {
      await this.redisService.setQuizState(id, {
        id: quiz.id,
        title: quiz.title,
        status: quiz.status,
        currentQuestionId: quiz.currentQuestionId,
        totalQuestions: quiz.questions?.length || 0,
        participants: await this.redisService.getParticipants(id),
        startedAt: quiz.createdAt,
      });
    }

    return quiz;
  }

  async updateQuiz(id: number, updateQuizDto: UpdateQuizDto): Promise<Quiz> {
    const quiz = await this.findQuizById(id);
    Object.assign(quiz, updateQuizDto);
    const updatedQuiz = await this.quizRepository.save(quiz);
    
    // 🚀 REDIS: Actualizar cache
    await this.redisService.setQuizState(id, {
      id: updatedQuiz.id,
      title: updatedQuiz.title,
      status: updatedQuiz.status,
      currentQuestionId: updatedQuiz.currentQuestionId,
      totalQuestions: quiz.questions?.length || 0,
      participants: await this.redisService.getParticipants(id),
      startedAt: updatedQuiz.createdAt,
    });
    
    return updatedQuiz;
  }

  async deleteQuiz(id: number): Promise<void> {
    const quiz = await this.findQuizById(id);
    await this.quizRepository.remove(quiz);
    
    // 🚀 REDIS: Limpiar todos los datos del cache
    await this.redisService.clearQuizData(id);
  }

  async startQuiz(id: number): Promise<Quiz> {
    const quiz = await this.findQuizById(id);
    quiz.status = QuizStatus.ACTIVE;
    
    // Establecer la primera pregunta como actual
    if (quiz.questions && quiz.questions.length > 0) {
      const firstQuestion = quiz.questions.sort((a, b) => a.orderIndex - b.orderIndex)[0];
      quiz.currentQuestionId = firstQuestion.id;
      
      // 🚀 REDIS: Establecer pregunta activa
      await this.redisService.setActiveQuestion(id, firstQuestion.id);
    }
    
    const updatedQuiz = await this.quizRepository.save(quiz);
    
    // 🚀 REDIS: Marcar como quiz activo y actualizar estado
    await this.redisService.setActiveQuiz(id);
    await this.redisService.setQuizState(id, {
      id: updatedQuiz.id,
      title: updatedQuiz.title,
      status: updatedQuiz.status,
      currentQuestionId: updatedQuiz.currentQuestionId,
      totalQuestions: quiz.questions?.length || 0,
      participants: await this.redisService.getParticipants(id),
      startedAt: new Date(),
    });
    
    return updatedQuiz;
  }

  async endQuiz(id: number): Promise<Quiz> {
    const quiz = await this.findQuizById(id);
    quiz.status = QuizStatus.COMPLETED;
    quiz.currentQuestionId = null;
    const updatedQuiz = await this.quizRepository.save(quiz);
    
    // 🚀 REDIS: Actualizar estado y limpiar quiz activo
    await this.redisService.del('quiz:active');
    await this.redisService.setQuizState(id, {
      id: updatedQuiz.id,
      title: updatedQuiz.title,
      status: updatedQuiz.status,
      currentQuestionId: null,
      totalQuestions: quiz.questions?.length || 0,
      participants: await this.redisService.getParticipants(id),
      startedAt: updatedQuiz.createdAt,
    });
    
    return updatedQuiz;
  }

  // =============== QUESTION METHODS ===============

  async createQuestion(createQuestionDto: CreateQuestionDto): Promise<Question> {
    const question = this.questionRepository.create(createQuestionDto);
    return await this.questionRepository.save(question);
  }

  async findQuestionsByQuizId(quizId: number): Promise<Question[]> {
    return await this.questionRepository.find({
      where: { quizId },
      order: { orderIndex: 'ASC' },
    });
  }

  async findQuestionById(id: number): Promise<Question> {
    const question = await this.questionRepository.findOne({
      where: { id },
      relations: ['quiz', 'answers'],
    });

    if (!question) {
      throw new NotFoundException(`Question with ID ${id} not found`);
    }

    return question;
  }

  async updateQuestion(id: number, updateQuestionDto: CreateQuestionDto): Promise<Question> {
    const question = await this.findQuestionById(id);
    Object.assign(question, updateQuestionDto);
    return await this.questionRepository.save(question);
  }

  async deleteQuestion(id: number): Promise<void> {
    const question = await this.findQuestionById(id);
    await this.questionRepository.remove(question);
  }

  async startQuestion(quizId: number, questionId: number): Promise<Question> {
    const quiz = await this.findQuizById(quizId);
    quiz.currentQuestionId = questionId;
    await this.quizRepository.save(quiz);
    
    const question = await this.findQuestionById(questionId);
    
    // 🚀 REDIS: Establecer pregunta activa con TTL si tiene tiempo límite
    const ttl = question.timeLimit ? question.timeLimit : undefined;
    await this.redisService.setActiveQuestion(quizId, questionId, ttl);
    
    // 🚀 REDIS: Guardar estado de la pregunta
    await this.redisService.setQuestionState(questionId, {
      id: question.id,
      quizId: question.quizId,
      questionText: question.questionText,
      options: {
        A: question.optionA,
        B: question.optionB,
        C: question.optionC,
        D: question.optionD,
      },
      correctAnswer: question.correctAnswer,
      timeLimit: question.timeLimit,
      startedAt: new Date(),
      isActive: true,
    }, ttl);
    
    // 🚀 REDIS: Limpiar respuestas anteriores
    await this.redisService.del(`answers:question:${questionId}`);
    
    return question;
  }

  async endQuestion(quizId: number): Promise<Quiz> {
    const quiz = await this.findQuizById(quizId);
    const currentQuestionId = quiz.currentQuestionId;
    
    quiz.currentQuestionId = null;
    const updatedQuiz = await this.quizRepository.save(quiz);
    
    // 🚀 REDIS: Limpiar pregunta activa
    await this.redisService.del(`quiz:${quizId}:current_question`);
    
    // 🚀 REDIS: Marcar pregunta como inactiva
    if (currentQuestionId) {
      const questionState = await this.redisService.getQuestionState(currentQuestionId);
      if (questionState) {
        questionState.isActive = false;
        await this.redisService.setQuestionState(currentQuestionId, questionState);
      }
    }
    
    return updatedQuiz;
  }

  // =============== ANSWER METHODS ===============

  async submitAnswer(submitAnswerDto: SubmitAnswerDto): Promise<Answer> {
    const { clickerId, questionId, selectedAnswer, responseTime } = submitAnswerDto;

    // 🚀 REDIS: Verificar que la pregunta esté activa
    const questionState = await this.redisService.getQuestionState(questionId);
    if (!questionState || !questionState.isActive) {
      throw new NotFoundException(`Question ${questionId} is not active`);
    }

    // 🚀 REDIS: Verificar respuesta duplicada en cache primero
    const existingAnswers = await this.redisService.getAnswers(questionId);
    const existingAnswer = existingAnswers.find(answer => answer.clickerId === clickerId);

    let answer: Answer;
    const isCorrect = selectedAnswer === questionState.correctAnswer;

    if (existingAnswer) {
      // Actualizar respuesta existente en BD
      const dbAnswer = await this.answerRepository.findOne({
        where: { clickerId, questionId },
      });
      
      if (dbAnswer) {
        dbAnswer.selectedAnswer = selectedAnswer;
        dbAnswer.responseTime = responseTime || null;
        dbAnswer.isCorrect = isCorrect;
        answer = await this.answerRepository.save(dbAnswer);
      } else {
        // Crear nueva si no existe en BD pero sí en Redis (caso edge)
        const question = await this.findQuestionById(questionId);
        let participant = await this.participantRepository.findOne({
          where: { clickerId },
        });

        if (!participant) {
          participant = this.participantRepository.create({
            clickerId,
            quizId: question.quizId,
          });
          participant = await this.participantRepository.save(participant);
          
          // 🚀 REDIS: Agregar participante
          await this.redisService.addParticipant(question.quizId, clickerId);
        }

        answer = this.answerRepository.create({
          questionId,
          participantId: participant.id,
          clickerId,
          selectedAnswer,
          isCorrect,
          responseTime,
        });
        answer = await this.answerRepository.save(answer);
      }
    } else {
      // Crear nueva respuesta
      const question = await this.findQuestionById(questionId);
      
      // Buscar o crear participante
      let participant = await this.participantRepository.findOne({
        where: { clickerId },
      });

      if (!participant) {
        participant = this.participantRepository.create({
          clickerId,
          quizId: question.quizId,
        });
        participant = await this.participantRepository.save(participant);
        
        // 🚀 REDIS: Agregar participante
        await this.redisService.addParticipant(question.quizId, clickerId);
      }

      answer = this.answerRepository.create({
        questionId,
        participantId: participant.id,
        clickerId,
        selectedAnswer,
        isCorrect,
        responseTime,
      });
      answer = await this.answerRepository.save(answer);
    }

    // 🚀 REDIS: Almacenar respuesta en cache INMEDIATAMENTE
    await this.redisService.addAnswer(questionId, {
      clickerId,
      selectedAnswer,
      isCorrect,
      responseTime,
      answerId: answer.id,
    });

    // 🚀 REDIS: Actualizar estadísticas en tiempo real
    await this.redisService.incrementAnswerStat(questionId, selectedAnswer);

    // 🚀 REDIS: Actualizar leaderboard si es correcta
    if (isCorrect) {
      const question = await this.findQuestionById(questionId);
      const currentScore = await this.redisService.zscore(`leaderboard:quiz:${question.quizId}`, clickerId) || 0;
      await this.redisService.updateParticipantScore(question.quizId, clickerId, currentScore + 1);
    }

    return answer;
  }

  async getAnswersByQuestionId(questionId: number): Promise<Answer[]> {
    // 🚀 REDIS: Intentar obtener de cache primero
    const cachedAnswers = await this.redisService.getAnswers(questionId);
    
    if (cachedAnswers.length > 0) {
      // Convertir respuestas de Redis a formato Answer (para compatibilidad)
      return cachedAnswers.map(cachedAnswer => ({
        id: cachedAnswer.answerId,
        questionId,
        participantId: null,
        clickerId: cachedAnswer.clickerId,
        selectedAnswer: cachedAnswer.selectedAnswer,
        isCorrect: cachedAnswer.isCorrect,
        responseTime: cachedAnswer.responseTime,
        createdAt: new Date(cachedAnswer.timestamp),
        updatedAt: new Date(cachedAnswer.timestamp),
        participant: null,
        question: null,
      })) as Answer[];
    }

    // Fallback a BD si no hay en cache
    return await this.answerRepository.find({
      where: { questionId },
      relations: ['participant'],
      order: { createdAt: 'ASC' },
    });
  }

  async getQuizResults(quizId: number): Promise<{
    quiz: Quiz;
    results: Array<{
      questionId: number;
      questionText: string;
      correctAnswer: AnswerOption;
      totalAnswers: number;
      correctCount: number;
      stats: { A: number; B: number; C: number; D: number };
      answers: Array<{
        clickerId: string;
        selectedAnswer: AnswerOption;
        isCorrect: boolean;
        responseTime: number | null;
        createdAt: Date;
      }>;
    }>;
  }> {
    const quiz = await this.findQuizById(quizId);
    const questions = await this.findQuestionsByQuizId(quizId);
    
    const results: Array<{
      questionId: number;
      questionText: string;
      correctAnswer: AnswerOption;
      totalAnswers: number;
      correctCount: number;
      stats: { A: number; B: number; C: number; D: number };
      answers: Array<{
        clickerId: string;
        selectedAnswer: AnswerOption;
        isCorrect: boolean;
        responseTime: number | null;
        createdAt: Date;
      }>;
    }> = [];
    
    for (const question of questions) {
      // 🚀 REDIS: Usar estadísticas de cache para mayor velocidad
      const stats = await this.redisService.getAnswerStats(question.id);
      const answers = await this.getAnswersByQuestionId(question.id);
      
      const correctCount = answers.filter(a => a.isCorrect).length;
      
      results.push({
        questionId: question.id,
        questionText: question.questionText,
        correctAnswer: question.correctAnswer,
        totalAnswers: answers.length,
        correctCount,
        stats,
        answers: answers.map(a => ({
          clickerId: a.clickerId,
          selectedAnswer: a.selectedAnswer,
          isCorrect: a.isCorrect,
          responseTime: a.responseTime,
          createdAt: a.createdAt,
        })),
      });
    }
    
    return {
      quiz,
      results,
    };
  }

  // =============== REDIS-POWERED REAL-TIME METHODS ===============

  async getQuizLeaderboard(quizId: number, limit: number = 10): Promise<Array<{
    clickerId: string;
    score: number;
    rank: number;
  }>> {
    const leaderboard = await this.redisService.getLeaderboard(quizId, limit);
    return leaderboard.map((entry, index) => ({
      clickerId: entry.clickerId,
      score: entry.score,
      rank: index + 1,
    }));
  }

  async getParticipantRank(quizId: number, clickerId: string): Promise<{
    rank: number | null;
    score: number | null;
    totalParticipants: number;
  }> {
    const rank = await this.redisService.getParticipantRank(quizId, clickerId);
    const score = await this.redisService.zscore(`leaderboard:quiz:${quizId}`, clickerId);
    const totalParticipants = await this.redisService.getParticipantCount(quizId);

    return {
      rank,
      score,
      totalParticipants,
    };
  }

  async getQuestionStatsRealTime(questionId: number): Promise<{
    totalAnswers: number;
    stats: { A: number; B: number; C: number; D: number };
    answerCount: number;
  }> {
    const stats = await this.redisService.getAnswerStats(questionId);
    const answerCount = await this.redisService.getAnswerCount(questionId);
    const totalAnswers = stats.A + stats.B + stats.C + stats.D;

    return {
      totalAnswers,
      stats,
      answerCount,
    };
  }

  async getActiveQuizInfo(): Promise<{
    quizId: number | null;
    quizState: any;
    currentQuestionId: number | null;
    questionState: any;
    participantCount: number;
  }> {
    const activeQuizId = await this.redisService.getActiveQuiz();
    
    if (!activeQuizId) {
      return {
        quizId: null,
        quizState: null,
        currentQuestionId: null,
        questionState: null,
        participantCount: 0,
      };
    }

    const quizState = await this.redisService.getQuizState(activeQuizId);
    const currentQuestionId = await this.redisService.getActiveQuestion(activeQuizId);
    const questionState = currentQuestionId ? await this.redisService.getQuestionState(currentQuestionId) : null;
    const participantCount = await this.redisService.getParticipantCount(activeQuizId);

    return {
      quizId: activeQuizId,
      quizState,
      currentQuestionId,
      questionState,
      participantCount,
    };
  }

  // =============== PARTICIPANT METHODS ===============

  async registerParticipant(clickerId: string, name?: string): Promise<Participant> {
    let participant = await this.participantRepository.findOne({
      where: { clickerId },
    });

    if (participant) {
      if (name && name !== participant.name) {
        participant.name = name;
        participant = await this.participantRepository.save(participant);
      }
      
      // 🚀 REDIS: Asegurar que esté registrado en el quiz activo
      const activeQuizId = await this.redisService.getActiveQuiz();
      if (activeQuizId) {
        await this.redisService.addParticipant(activeQuizId, clickerId);
      }
      
      return participant;
    }

    participant = this.participantRepository.create({
      clickerId,
      name,
    });

    const savedParticipant = await this.participantRepository.save(participant);
    
    // 🚀 REDIS: Registrar en el quiz activo si existe
    const activeQuizId = await this.redisService.getActiveQuiz();
    if (activeQuizId) {
      await this.redisService.addParticipant(activeQuizId, clickerId);
      // Inicializar score en 0
      await this.redisService.updateParticipantScore(activeQuizId, clickerId, 0);
    }

    return savedParticipant;
  }

  async findAllParticipants(): Promise<Participant[]> {
    return await this.participantRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async getParticipantStats(clickerId: string) {
    // 🚀 REDIS: Obtener estadísticas del quiz activo primero
    const activeQuizId = await this.redisService.getActiveQuiz();
    
    if (activeQuizId) {
      const rankInfo = await this.getParticipantRank(activeQuizId, clickerId);
      const participant = await this.participantRepository.findOne({
        where: { clickerId },
      });
      
      if (participant) {
        return {
          participant: {
            clickerId: participant.clickerId,
            name: participant.name,
            createdAt: participant.createdAt,
          },
          currentQuizStats: {
            score: rankInfo.score || 0,
            rank: rankInfo.rank,
            totalParticipants: rankInfo.totalParticipants,
          },
          historicalStats: await this.getHistoricalParticipantStats(clickerId),
        };
      }
    }

    // Fallback a estadísticas históricas
    const participant = await this.participantRepository.findOne({
      where: { clickerId },
      relations: ['answers'],
    });

    if (!participant) {
      throw new NotFoundException(`Participant with clicker ID ${clickerId} not found`);
    }

    return {
      participant: {
        clickerId: participant.clickerId,
        name: participant.name,
        createdAt: participant.createdAt,
      },
      currentQuizStats: null,
      historicalStats: await this.getHistoricalParticipantStats(clickerId),
    };
  }

  private async getHistoricalParticipantStats(clickerId: string) {
    const participant = await this.participantRepository.findOne({
      where: { clickerId },
      relations: ['answers'],
    });

    if (!participant) {
      return null;
    }

    const totalAnswers = participant.answers.length;
    const correctAnswers = participant.answers.filter(a => a.isCorrect).length;
    const accuracy = totalAnswers > 0 ? (correctAnswers / totalAnswers) * 100 : 0;

    return {
      totalAnswers,
      correctAnswers,
      accuracy: Math.round(accuracy * 100) / 100,
      answers: participant.answers.map(a => ({
        questionId: a.questionId,
        selectedAnswer: a.selectedAnswer,
        isCorrect: a.isCorrect,
        responseTime: a.responseTime,
        createdAt: a.createdAt,
      })),
    };
  }

  async deleteParticipant(id: number): Promise<void> {
    const participant = await this.participantRepository.findOne({
      where: { id },
    });

    if (!participant) {
      throw new NotFoundException(`Participant with ID ${id} not found`);
    }

    // 🚀 REDIS: Remover de todos los quizzes activos
    const activeQuizId = await this.redisService.getActiveQuiz();
    if (activeQuizId) {
      await this.redisService.removeParticipant(activeQuizId, participant.clickerId);
    }

    await this.participantRepository.remove(participant);
  }
}
