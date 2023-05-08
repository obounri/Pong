import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
} from 'typeorm';

export enum FriendshipStatus {
  NONE = 'none',
  FRIEND = 'friend',
  PENDING = 'pending_invite',
  BLOCKED = 'blocked',
}

@Entity({ name: 'friends' })
export class Friend {
  @PrimaryGeneratedColumn('uuid')
  uuid: string;

  @Column()
  user_id: string;

  @Column()
  friend_id: string;

  @Column({
    type: 'enum',
    enum: FriendshipStatus,
    default: FriendshipStatus.PENDING,
  })
  status: FriendshipStatus;

  @Column({ nullable: true, default: null })
  timestamp: string;
}
