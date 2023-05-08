import { PartialType } from '@nestjs/mapped-types';
import {
  IsBoolean,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsNumberString,
  IsString,
  IsUrl,
  IsUUID,
  Length,
} from 'class-validator';
import { UserStatus } from './user.entity';

export class UserDto {
  // @IsNumber()
  // readonly id?: number;

  @IsUUID()
  readonly uuid?: string;

  @IsString()
  readonly firstName: string;

  @IsString()
  readonly lastName: string;

  @IsString()
  readonly username: string;

  @IsEmail()
  readonly email: string;

  @IsBoolean()
  readonly firstLogin?: boolean;

  @IsBoolean()
  readonly _2fa?: boolean;

  @IsUrl()
  readonly avatarUrl: string;

  @IsEnum(UserStatus)
  readonly status: UserStatus;

  @IsNumber()
  xp?: number;
}

export class UpdateUserDto extends PartialType(UserDto) {}

export class CodeDto {
  @IsNotEmpty()
  @IsNumberString()
  @Length(6)
  code: string;
}
