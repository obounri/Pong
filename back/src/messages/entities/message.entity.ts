import { User } from 'src/user/entities/user.entity';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  CreateDateColumn
} from 'typeorm';

@Entity()
export class Group {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  isPasswordProtected: boolean;

  @Column({default : false})
  isPrivate : boolean;

  @Column({ nullable: true })
  password: string;
}

@Entity()
export class GroupMembers {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  group_id : number;

  @Column()
  member_id : string;

  @Column({default : false})
  is_owner : boolean;

  @Column({default : false})
  is_admin : boolean;

  @Column({default : false})
  is_ban : boolean;

  @CreateDateColumn()
  mute_time : Date;

  @CreateDateColumn()
  joined_at : Date;

  @CreateDateColumn()
  updated_at : Date;
}

@Entity()
export class GroupMessage {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  content: string;

  @Column()
  senderId: string;

  @Column()
  groupId : number;

  @CreateDateColumn()
  created_at : Date;
}

@Entity()
export class Message {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  content: string;

  @CreateDateColumn()
  timestamp: Date;

  @CreateDateColumn()
  created_at : Date;

  @ManyToOne(() => User, (user) => user.sentMessages)
  sender: User;

  @ManyToOne(() => User, (user) => user.receivedMessages)
  recipient: User;

}
