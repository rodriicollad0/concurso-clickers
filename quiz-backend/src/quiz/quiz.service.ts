import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Quiz, Question, Answer, Participant, QuizStatus, AnswerOption } from './entities';
import { CreateQuizDto, UpdateQuizDto, CreateQuestionDto, SubmitAnswerDto } from './dto';

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
  ) {}

  // =============== QUIZ METHODS ===============
  
  async createQuiz(createQuizDto: CreateQuizDto): Promise<Quiz> {
    const quiz = this.quizRepository.create(createQuizDto);
    return await this.quizRepository.save(quiz);
  }

  async findAllQuizzes(): Promise<Quiz[]> {
    return await this.quizRepository.find({
      relations: ['questions'],
      order: { createdAt: 'DESC' },
    });
  }

  async findQuizById(id: number): Promise<Quiz> {
    const quiz = await this.quizRepository.findOne({
      where: { id },
      relations: ['questions'],
    });

    if (!quiz) {
      throw new NotFoundException(`Quiz with ID ${id} not found`);
    }

    return quiz;
  }

  async updateQuiz(id: number, updateQuizDto: UpdateQuizDto): Promise<Quiz> {
    const quiz = await this.findQuizById(id);
    Object.assign(quiz, updateQuizDto);
    return await this.quizRepository.save(quiz);
  }

  async deleteQuiz(id: number): Promise<void> {
    const quiz = await this.findQuizById(id);
    await this.quizRepository.remove(quiz);
  }

  async startQuiz(id: number): Promise<Quiz> {
    const quiz = await this.findQuizById(id);
    quiz.status = QuizStatus.ACTIVE;
    
    // Establecer la primera pregunta como actual
    if (quiz.questions && quiz.questions.length > 0) {
      const firstQuestion = quiz.questions.sort((a, b) => a.orderIndex - b.orderIndex)[0];
      quiz.currentQuestionId = firstQuestion.id;
    }
    
    return await this.quizRepository.save(quiz);
  }

  async endQuiz(id: number): Promise<Quiz> {
    const quiz = await this.findQuizById(id);
    quiz.status = QuizStatus.COMPLETED;
    quiz.currentQuestionId = null;
    return await this.quizRepository.save(quiz);
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
    
    return await this.findQuestionById(questionId);
  }

  async endQuestion(quizId: number): Promise<Quiz> {
    const quiz = await this.findQuizById(quizId);
    quiz.currentQuestionId = null;
    return await this.quizRepository.save(quiz);
  }

  // =============== ANSWER METHODS ===============

  async submitAnswer(submitAnswerDto: SubmitAnswerDto): Promise<Answer> {
    const { clickerId, questionId, selectedAnswer, responseTime } = submitAnswerDto;

    // Verificar si ya existe una respuesta de este clicker para esta pregunta
    const existingAnswer = await this.answerRepository.findOne({
      where: { clickerId, questionId },
    });

    if (existingAnswer) {
      // Actualizar respuesta existente (permitir cambio de respuesta)
      existingAnswer.selectedAnswer = selectedAnswer;
      existingAnswer.responseTime = responseTime || null;
      
      // Recalcular si es correcta
      const question = await this.findQuestionById(questionId);
      existingAnswer.isCorrect = selectedAnswer === question.correctAnswer;
      
      return await this.answerRepository.save(existingAnswer);
    }

    // Crear nueva respuesta
    const question = await this.findQuestionById(questionId);
    const isCorrect = selectedAnswer === question.correctAnswer;

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
    }

    const answer = this.answerRepository.create({
      questionId,
      participantId: participant.id,
      clickerId,
      selectedAnswer,
      isCorrect,
      responseTime,
    });

    return await this.answerRepository.save(answer);
  }

  async getAnswersByQuestionId(questionId: number): Promise<Answer[]> {
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
      const answers = await this.getAnswersByQuestionId(question.id);
      
      const stats = {
        A: 0, B: 0, C: 0, D: 0,
      };
      
      let correctCount = 0;
      
      answers.forEach(answer => {
        stats[answer.selectedAnswer]++;
        if (answer.isCorrect) correctCount++;
      });
      
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
      return participant;
    }

    participant = this.participantRepository.create({
      clickerId,
      name,
    });

    return await this.participantRepository.save(participant);
  }

  async findAllParticipants(): Promise<Participant[]> {
    return await this.participantRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async getParticipantStats(clickerId: string) {
    const participant = await this.participantRepository.findOne({
      where: { clickerId },
      relations: ['answers'],
    });

    if (!participant) {
      throw new NotFoundException(`Participant with clicker ID ${clickerId} not found`);
    }

    const totalAnswers = participant.answers.length;
    const correctAnswers = participant.answers.filter(a => a.isCorrect).length;
    const accuracy = totalAnswers > 0 ? (correctAnswers / totalAnswers) * 100 : 0;

    return {
      participant: {
        clickerId: participant.clickerId,
        name: participant.name,
        createdAt: participant.createdAt,
      },
      stats: {
        totalAnswers,
        correctAnswers,
        accuracy: Math.round(accuracy * 100) / 100,
      },
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

    await this.participantRepository.remove(participant);
  }
}
