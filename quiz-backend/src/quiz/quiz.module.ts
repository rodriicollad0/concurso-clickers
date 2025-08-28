import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QuizService } from './quiz.service';
import { QuizController } from './quiz.controller';
import { QuizGateway } from './quiz.gateway';
import { Quiz, Question, Answer, Participant } from './entities';

@Module({
  imports: [
    TypeOrmModule.forFeature([Quiz, Question, Answer, Participant]),
  ],
  providers: [QuizService, QuizGateway],
  controllers: [QuizController],
  exports: [QuizService],
})
export class QuizModule {}
