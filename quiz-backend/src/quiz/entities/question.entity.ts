import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { Quiz } from './quiz.entity';
import { Answer } from './answer.entity';
import { AnswerOption } from './enums';

@Entity('questions')
export class Question {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'quiz_id' })
  quizId: number;

  @Column({ name: 'question_text', type: 'text' })
  questionText: string;

  @Column({ name: 'option_a', length: 255 })
  optionA: string;

  @Column({ name: 'option_b', length: 255 })
  optionB: string;

  @Column({ name: 'option_c', length: 255 })
  optionC: string;

  @Column({ name: 'option_d', length: 255 })
  optionD: string;

  @Column({
    name: 'correct_answer',
    type: 'enum',
    enum: AnswerOption,
    enumName: 'answer_option_enum',
  })
  correctAnswer: AnswerOption;

  @Column({ name: 'time_limit', default: 30 })
  timeLimit: number;

  @Column({ name: 'order_index' })
  orderIndex: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ManyToOne(() => Quiz, (quiz) => quiz.questions, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'quiz_id' })
  quiz: Quiz;

  @OneToMany(() => Answer, (answer) => answer.question, {
    cascade: true,
  })
  answers: Answer[];
}
