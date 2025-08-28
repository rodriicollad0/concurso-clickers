import { IsString, IsOptional, IsEnum, IsNumber, Min } from 'class-validator';
import { QuizStatus } from '../entities';

export class CreateQuizDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(QuizStatus)
  status?: QuizStatus = QuizStatus.DRAFT;
}

export class UpdateQuizDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(QuizStatus)
  status?: QuizStatus;

  @IsOptional()
  @IsNumber()
  @Min(1)
  currentQuestionId?: number;
}
