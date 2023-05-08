import {
  Body,
  Controller,
  Get,
  Inject,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { FortyTwoAuthGuard } from '../utils/FortyTwoAuthGuard';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from 'src/jwt/jwt-auth.guard';
import { UserDecorator } from 'src/user/user.decorater';
import { UserDto, CodeDto } from 'src/user/entities/user.dto';
import { GoogleAuthGuard } from './googleAuth.guard';
import { Jwt2faAuthGuard } from 'src/jwt/2fa-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(
    private configService: ConfigService,
    @Inject('AUTH_SERVICE') private readonly authService: AuthService,
  ) {}

  @Get('42/login')
  @UseGuards(FortyTwoAuthGuard)
  handleLogin(): void {}

  @Get('42/redirect')
  @UseGuards(FortyTwoAuthGuard)
  async handleRedirect(
    @UserDecorator() user: UserDto,
    @Req() request: any,
    @Res({ passthrough: true }) res: Response,
  ): Promise<void> {
    await this.authService.autenticateUser(user, res);
  }

  @Get('google')
  @UseGuards(GoogleAuthGuard)
  async handleGoogleLogin(
    @UserDecorator() user: UserDto,
    @Req() request: any,
    @Res({ passthrough: true }) res: Response,
  ): Promise<void> {
    await this.authService.autenticateUser(user, res);
  }

  @Get('status')
  @UseGuards(JwtAuthGuard)
  user(@Req() request: any): { msg: string } {
    if (request.user) {
      return { msg: 'Authenticated' };
    } else {
      return { msg: 'Not Authenticated' };
    }
  } // testing purposes

  @Get('logout')
  @UseGuards(JwtAuthGuard)
  logout(@Req() req: any, @Res({ passthrough: true }) res: Response): void {
    res.clearCookie('jwt', { httpOnly: true });
  }

  @Post('/enable2fa')
  @UseGuards(JwtAuthGuard)
  enable2fa(
    @UserDecorator() user: UserDto,
    @Res({ passthrough: true }) res: Response,
  ): void {
    this.authService.setJWT2faCookie(user, res);
  }

  @Post('/2faLogin')
  @UseGuards(Jwt2faAuthGuard)
  async login2faCode(
    @UserDecorator() user: UserDto,
    @Body() data: CodeDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<{ success: boolean; msg: string }> {
    const isValid = await this.authService.is2faCodeValid(user, data.code);
    if (isValid.error)
      return {
        success: false,
        msg: 'Wrong Code',
      };
    await this.authService.set2faTrue(user);
    this.authService.setJWTCookie(user, res);
    return {
      success: true,
      msg: 'Succeded',
    };
  }
}
