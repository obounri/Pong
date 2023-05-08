import { IsInt, IsNotEmpty, IsString , IsEmpty, IsIn, IsBoolean} from "class-validator";

export class PrivateMessageDto {
  @IsString()
  @IsNotEmpty()
  receiverId: string;

  @IsString()
  @IsNotEmpty()
  message: string;
}

export class GroupMessageDto {
  @IsInt()
  @IsNotEmpty()
  groupId: number;

  @IsString()
  @IsNotEmpty()
  message: string;
}

export class GroupJoinDto {
  @IsInt()
  @IsNotEmpty()
  groupId: number;

  @IsString()
  password: string;
}


export class GroupLeaveDto {
  @IsInt()
  @IsNotEmpty()
  groupId: number;
}

export class ActionMemberDto{
  @IsInt()
  @IsNotEmpty()
  group_id : number;

  @IsString()
  member_id : string;

  @IsBoolean()
  @IsNotEmpty()
  is_ban : boolean;

  @IsInt()
  mute_time_minute : number | undefined 
}

export class KickMemberDto{
  @IsInt()
  @IsNotEmpty()
  group_id : number;

  @IsString()
  member_id : string;
}


export class onKickedDto {
  @IsInt()
  @IsNotEmpty()
  group_id : number;

  @IsString()
  member_id : string;
}
