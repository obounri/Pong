import { Group, Message } from './../../messages/entities/message.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

export enum UserStatus {
  online = 'online',
  offline = 'offline',
  inGame = 'inGame',
}

@Entity({ name: 'users' })
export class User {
  @PrimaryGeneratedColumn('uuid')
  uuid: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column()
  username: string;

  @Column()
  email: string;

  @Column({ default: 0 })
  xp: number;

  @Column({
    type: 'enum',
    enum: UserStatus,
    default: UserStatus.offline,
  })
  status: UserStatus;

  @Column()
  avatarUrl: string;

  @Column({ default: false })
  _2fa: boolean;

  @Column({ nullable: true })
  _2faSecret: string;

  @Column({ default: true })
  firstLogin: boolean;
  // Youssef changes:
  // @ManyToMany(() => Group, (group) => group.members)

  @JoinTable()
  groups: Group[];

  @OneToMany(() => Message, (message) => message.sender)
  sentMessages: Message[];

  @OneToMany(() => Message, (message) => message.recipient)
  receivedMessages: Message[];

  @CreateDateColumn()
  t_joined: Date;
}
