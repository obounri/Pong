import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { UserDto } from 'src/user/entities/user.dto';

@Injectable()
export class Jwt2faAuthStrategy extends PassportStrategy(Strategy, 'jwt-2fa') {
  constructor(private readonly configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        Jwt2faAuthStrategy.extractJwt,
      ]),
      ignoreExpiration: false,
      secretOrKey: configService.get('2FA_JWT_SECRET_KEY') || 'jwt-key',
    });
  }

  async validate(payload: any): Promise<UserDto> {
    const validatedUser: UserDto = {
      uuid: payload.user.uuid,
      username: payload.user.username,
      firstName: payload.user.first_name,
      lastName: payload.user.last_name,
      avatarUrl: payload.user.avatarUrl,
      email: payload.user.email,
      firstLogin: payload.user.first_login,
      _2fa: payload.user._2fa,
      status: payload.user.status,
    };
    return validatedUser;
  }

  private static extractJwt(req: Request): string | null {
    if (req.cookies && req.cookies['jwt-2fa'] && req.cookies['jwt-2fa'].length)
      return req.cookies['jwt-2fa'];
    return null;
  }
}
