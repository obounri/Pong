import {
  Body,
  Controller,
  Get,
  Query,
  Param,
  Patch,
  UseGuards,
  Post,
  ParseBoolPipe,
  Res,
  NotFoundException,
  ParseUUIDPipe,
} from '@nestjs/common';
import { isNotEmptyObject } from 'class-validator';
import { JwtAuthGuard } from 'src/jwt/jwt-auth.guard';
import { UpdateUserDto, UserDto } from 'src/user/entities/user.dto';
import { UserDecorator } from './user.decorater';
import { UserService } from './user.service';
import { SearchDto } from './dto/search.dto';
import { Response } from 'express';
import { Jwt2faAuthGuard } from 'src/jwt/2fa-auth.guard';
import { authenticator } from 'otplib';
import { toDataURL } from 'qrcode';
import { User } from './entities/user.entity';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  async allUsers(): Promise<User[]> {
    const users = await this.userService.findAll();
    users.forEach((user) => {
      delete user._2faSecret;
      delete user._2fa;
    });
    return users;
  }

  @Get('search')
  @UseGuards(JwtAuthGuard)
  async UsersSearch(@Query() query: SearchDto, @UserDecorator() user : UserDto): Promise<User[]> {
    return await this.userService.search(query.search, user.uuid);
  }

  @Patch()
  @UseGuards(JwtAuthGuard)
  async updateUser(
    @UserDecorator() user: UserDto,
    @Body() body: UpdateUserDto,
  ): Promise<{ success: boolean; data?: User; msg?: string }> {
    if (
      isNotEmptyObject(body) &&
      (await this.userService.usernameIsUnique(user.uuid, body.username))
    ) {
      const data = await this.userService.update(user.uuid, body);
      if (data.success === false) return data;
      else
        return {
          success: true,
          data: data.data,
        };
    } else
      return {
        success: false,
        msg: 'Username taken',
      };
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async me(@UserDecorator() user: UserDto): Promise<any> {
    const me = (await this.userService.me(user.uuid))[0];
    delete me?._2faSecret;
    delete me?._2fa;
    return me;
  }

  @Get(':uuid')
  @UseGuards(JwtAuthGuard)
  async findUser(
    @Param('uuid', ParseUUIDPipe) uuid: string,
    @UserDecorator() user: UserDto,
  ): Promise<UserDto[]> {
    return await this.userService.readUserProfile(user.uuid, uuid);
  }

  @Post('/getQr')
  @UseGuards(Jwt2faAuthGuard)
  async getQr(
    @UserDecorator() user: UserDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<{ data: string }> {
    const secret = await this.userService.get2faSecret(user.uuid);
    if (secret) {
      const otpAuthUrl: string = authenticator.keyuri(
        user.username,
        'Pong',
        secret,
      );
      const qrCode: string = await toDataURL(otpAuthUrl);
      return { data: qrCode };
    } else throw new NotFoundException('Secret is not set');
  }

  @Post('2fa')
  @UseGuards(JwtAuthGuard)
  async onOff2fa(
    @UserDecorator() user: UserDto,
    @Body('_2fa', ParseBoolPipe) _2fa: boolean,
    @Res({ passthrough: true }) res: Response,
  ): Promise<void> {
    await this.userService.set2fa(user, _2fa);
  }
}
