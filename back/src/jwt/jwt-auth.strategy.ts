import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UserDto } from 'src/user/entities/user.dto';
import { Request } from 'express';

@Injectable()
export class JwtAuthStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(protected readonly configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([JwtAuthStrategy.extractJwt]),
      ignoreExpiration: false,
      secretOrKey: configService.get('JWT_SECRET_KEY') || 'jwt-key',
    });
  }

  async validate(payload: any): Promise<UserDto> {
    const validatedUser: UserDto = {
      uuid: payload.user.uuid,
      username: payload.user.username,
      firstName: payload.user.firstName,
      lastName: payload.user.lastName,
      avatarUrl: payload.user.avatarUrl,
      email: payload.user.email,
      firstLogin: payload.user.firstLogin,
      _2fa: payload.user._2fa,
      status: payload.user.status,
    };
    return validatedUser;
  }

  private static extractJwt(req: Request): string | null {
    if (req.cookies?.jwt && req.cookies.jwt.length) return req.cookies.jwt;
    return null;
  }
}
