import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
} from 'typeorm';
import { Answer } from './answer.entity';
import { ParticipantStatus } from './enums';

@Entity('participants')
export class Participant {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'clicker_id', length: 10, unique: true })
  clickerId: string;

  @Column({ length: 100, nullable: true })
  name: string;

  @Column({ length: 255, nullable: true })
  email: string;

  @Column({ name: 'quiz_id', nullable: true })
  quizId: number;

  @Column({
    type: 'enum',
    enum: ParticipantStatus,
    default: ParticipantStatus.ACTIVE,
  })
  status: ParticipantStatus;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @OneToMany(() => Answer, (answer) => answer.participant)
  answers: Answer[];
}
