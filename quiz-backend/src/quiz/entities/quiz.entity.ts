import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Question } from './question.entity';
import { QuizStatus } from './enums';

@Entity('quizzes')
export class Quiz {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 255 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({
    type: 'enum',
    enum: QuizStatus,
    enumName: 'quiz_status_enum',
    default: QuizStatus.DRAFT,
  })
  status: QuizStatus;

  @Column({ name: 'current_question_id', type: 'integer', nullable: true })
  currentQuestionId: number | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(() => Question, (question) => question.quiz, {
    cascade: true,
    eager: false,
  })
  questions: Question[];
}
