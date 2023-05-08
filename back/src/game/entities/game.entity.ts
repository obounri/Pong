import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity({ name: 'games' })
export class Game {
  @PrimaryGeneratedColumn('uuid')
  game_id: string;

  @Column()
  playerone: string;

  @Column()
  playertwo: string;

  @Column({ nullable: true })
  winner: string;

  @Column({ default: 0 })
  playeroneScore: number;

  @Column({ default: 0 })
  playertwoScore: number;

  @Column({ default: true })
  status: boolean;

  @CreateDateColumn()
  timestamp: Date;
}
