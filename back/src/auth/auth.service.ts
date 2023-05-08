import { Injectable } from '@nestjs/common';
import { JwtAuthService } from 'src/jwt/jwt-auth.service';
import { UserDto } from 'src/user/entities/user.dto';
import { UserService } from 'src/user/user.service';
import { Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { Jwt2faAuthService } from 'src/jwt/2fa-auth.service';
import { authenticator } from 'otplib';
import { User } from 'src/user/entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtAuthService: JwtAuthService,
    private readonly jwt2faAuthService: Jwt2faAuthService,
    private readonly userService: UserService,
    private configService: ConfigService,
  ) {}

  setJWT2faCookie(user: UserDto, res: Response): void {
    const accessToken: string = this.jwt2faAuthService.set2faJwt(user);
    res.cookie('jwt-2fa', accessToken, { httpOnly: true });
    res.clearCookie('jwt', { httpOnly: true }); // >>
  }

  setJWTCookie(user: UserDto, res: Response): void {
    const accessToken: string = this.jwtAuthService.setJwt(user);
    res.cookie('jwt', accessToken, { httpOnly: true });
    res.clearCookie('jwt-2fa', { httpOnly: true });
  }

  async autenticateUser(user: UserDto, res: Response): Promise<void> {
    const _user: UserDto = await this.userService.findUser(user.uuid);
    this.setJWTCookie(_user, res);
    if (_user.firstLogin === true) {
      res.redirect(`${this.configService.get<string>('CLIENT_IP')}/register`);
    } else if (
      (await this.userService.secretIsSet(_user.uuid)) === true &&
      _user._2fa === false
    ) {
      res.redirect(
        `${this.configService.get<string>('CLIENT_IP')}/twofactor?2fa=true`,
      );
    } else if (_user._2fa === true) {
      res.redirect(`${this.configService.get<string>('CLIENT_IP')}/twofactor`);
    } else {
      res.redirect(`${this.configService.get<string>('CLIENT_IP')}/dashboard`);
    }
  }

  async is2faCodeValid(
    user: UserDto,
    code: string,
  ): Promise<{ error?: string; data?: boolean }> {
    const secret = await this.userService.get2faSecret(user.uuid);
    const valid = authenticator.verify({ token: code, secret: secret });
    if (!valid) return { error: 'Wrong authentication code' };
    return { data: true };
  }

  async validateUser(userDetails: any): Promise<User | User[]> {
    return this.userService.validateUser(userDetails);
  }

  async set2faTrue(user: UserDto): Promise<{ data: boolean }> {
    return await this.userService.set2faTrue(user);
  }
}
