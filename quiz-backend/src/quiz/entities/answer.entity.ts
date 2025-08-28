import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Question } from './question.entity';
import { Participant } from './participant.entity';
import { AnswerOption } from './enums';

@Entity('answers')
export class Answer {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'question_id' })
  questionId: number;

  @Column({ name: 'participant_id', nullable: true })
  participantId: number;

  @Column({ name: 'clicker_id', length: 10 })
  clickerId: string;

  @Column({
    name: 'selected_answer',
    type: 'enum',
    enum: AnswerOption,
    enumName: 'answer_option_enum',
  })
  selectedAnswer: AnswerOption;

  @Column({ name: 'is_correct' })
  isCorrect: boolean;

  @Column({ name: 'response_time', type: 'float', nullable: true })
  responseTime: number | null; // en segundos (puede incluir decimales)

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ManyToOne(() => Question, (question) => question.answers, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'question_id' })
  question: Question;

  @ManyToOne(() => Participant, (participant) => participant.answers, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  @JoinColumn({ name: 'participant_id' })
  participant: Participant;
}
