import { IsDateString, IsEnum, IsNotEmpty, IsNumber, IsUUID } from 'class-validator';
import { FriendshipStatus } from '../entities/friend.entity';

export class CreateFriendshipDto {
  @IsUUID()
  user_id: string;
  
  @IsUUID()
  friend_id: string;
  
  @IsEnum(FriendshipStatus)
  status?: FriendshipStatus;

  @IsDateString()
  timestamp?: string;
}

export class IdDto {
  @IsUUID()
  @IsNotEmpty()
  id: string;
}