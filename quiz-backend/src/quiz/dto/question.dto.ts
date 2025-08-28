import { IsString, IsEnum, IsNumber, Min, Max, IsOptional } from 'class-validator';
import { AnswerOption } from '../entities';

export class CreateQuestionDto {
  @IsNumber()
  @Min(1)
  quizId: number;

  @IsString()
  questionText: string;

  @IsString()
  optionA: string;

  @IsString()
  optionB: string;

  @IsString()
  optionC: string;

  @IsString()
  optionD: string;

  @IsEnum(AnswerOption)
  correctAnswer: AnswerOption;

  @IsNumber()
  @Min(5)
  @Max(300)
  timeLimit: number = 30;

  @IsNumber()
  @Min(1)
  orderIndex: number;
}

export class SubmitAnswerDto {
  @IsString()
  clickerId: string;

  @IsNumber()
  @Min(1)
  questionId: number;

  @IsEnum(AnswerOption)
  selectedAnswer: AnswerOption;

  @IsOptional()
  @IsNumber()
  @Min(0)
  responseTime?: number | null;
}
