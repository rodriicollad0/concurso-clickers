import { 
  Controller, 
  Get, 
  Post, 
  Put, 
  Delete, 
  Body, 
  Param, 
  ParseIntPipe,
  HttpCode,
  HttpStatus 
} from '@nestjs/common';
import { QuizService } from './quiz.service';
import { CreateQuizDto, UpdateQuizDto, CreateQuestionDto, SubmitAnswerDto } from './dto';

@Controller('quiz')
export class QuizController {
  constructor(private readonly quizService: QuizService) {}

  // =============== QUIZ ENDPOINTS ===============

  @Post()
  async createQuiz(@Body() createQuizDto: CreateQuizDto) {
    return await this.quizService.createQuiz(createQuizDto);
  }

  @Get()
  async findAllQuizzes() {
    return await this.quizService.findAllQuizzes();
  }

  @Get(':id')
  async findQuizById(@Param('id', ParseIntPipe) id: number) {
    return await this.quizService.findQuizById(id);
  }

  @Put(':id')
  async updateQuiz(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateQuizDto: UpdateQuizDto,
  ) {
    return await this.quizService.updateQuiz(id, updateQuizDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteQuiz(@Param('id', ParseIntPipe) id: number) {
    return await this.quizService.deleteQuiz(id);
  }

  @Post(':id/start')
  async startQuiz(@Param('id', ParseIntPipe) id: number) {
    return await this.quizService.startQuiz(id);
  }

  @Post(':id/end')
  async endQuiz(@Param('id', ParseIntPipe) id: number) {
    return await this.quizService.endQuiz(id);
  }

  @Get(':id/results')
  async getQuizResults(@Param('id', ParseIntPipe) id: number) {
    return await this.quizService.getQuizResults(id);
  }

  // =============== QUESTION ENDPOINTS ===============

  @Post(':id/questions')
  async createQuestion(
    @Param('id', ParseIntPipe) quizId: number,
    @Body() createQuestionDto: CreateQuestionDto,
  ) {
    createQuestionDto.quizId = quizId;
    return await this.quizService.createQuestion(createQuestionDto);
  }

  @Get(':id/questions')
  async findQuestionsByQuizId(@Param('id', ParseIntPipe) quizId: number) {
    return await this.quizService.findQuestionsByQuizId(quizId);
  }

  @Post(':quizId/questions/:questionId/start')
  async startQuestion(
    @Param('quizId', ParseIntPipe) quizId: number,
    @Param('questionId', ParseIntPipe) questionId: number,
  ) {
    return await this.quizService.startQuestion(quizId, questionId);
  }

  @Post(':id/questions/end')
  async endQuestion(@Param('id', ParseIntPipe) quizId: number) {
    return await this.quizService.endQuestion(quizId);
  }

  @Get('questions/:id')
  async findQuestionById(@Param('id', ParseIntPipe) id: number) {
    return await this.quizService.findQuestionById(id);
  }

  @Get('questions/:id/answers')
  async getAnswersByQuestionId(@Param('id', ParseIntPipe) questionId: number) {
    return await this.quizService.getAnswersByQuestionId(questionId);
  }

  @Put('questions/:id')
  async updateQuestion(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateQuestionDto: CreateQuestionDto,
  ) {
    return await this.quizService.updateQuestion(id, updateQuestionDto);
  }

  @Delete('questions/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteQuestion(@Param('id', ParseIntPipe) id: number) {
    return await this.quizService.deleteQuestion(id);
  }

  // =============== ANSWER ENDPOINTS ===============

  @Post('answers')
  async submitAnswer(@Body() submitAnswerDto: SubmitAnswerDto) {
    return await this.quizService.submitAnswer(submitAnswerDto);
  }

  // =============== PARTICIPANT ENDPOINTS ===============

  @Get('participants/all')
  async findAllParticipants() {
    return await this.quizService.findAllParticipants();
  }

  @Post('participants/register')
  async registerParticipant(@Body() body: { clickerId: string; name?: string }) {
    return await this.quizService.registerParticipant(body.clickerId, body.name);
  }

  @Get('participants/:clickerId/stats')
  async getParticipantStats(@Param('clickerId') clickerId: string) {
    return await this.quizService.getParticipantStats(clickerId);
  }

  @Delete('participants/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteParticipant(@Param('id', ParseIntPipe) id: number) {
    return await this.quizService.deleteParticipant(id);
  }
}
