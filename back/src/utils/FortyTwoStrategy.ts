import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, Profile, verify } from 'passport-42';
import { AuthService } from '../auth/auth.service';

@Injectable()
export class FortyTwoStartegy extends PassportStrategy(Strategy, '42') {
  constructor(
    private configService: ConfigService,
    @Inject('AUTH_SERVICE') private readonly authService: AuthService,
  ) {
    super({
      clientID: configService.get<string>('42_CLIENT_ID'),
      clientSecret: configService.get<string>('42_CLIENT_SECRET'),
      callbackURL: 'http://localhost:3300/auth/42/redirect',
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: Profile,
    done: verify,
  ): Promise<void> {
    try {
      const user = await this.authService.validateUser({
        last_name: profile.name.familyName,
        first_name: profile.name.givenName,
        username: profile.username,
        email: profile.emails[0].value,
        avatarUrl: profile._json.image.link,
      });
      done(null, user);
    } catch (error) {
      done(error, false);
    }
  }
}
