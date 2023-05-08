import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy, VerifyCallback } from 'passport-google-oauth20';
import { Inject, Injectable } from '@nestjs/common';
import { UserDto } from 'src/user/entities/user.dto';
import { ConfigService } from '@nestjs/config';
import { AuthService } from 'src/auth/auth.service';
import { UserStatus } from 'src/user/entities/user.entity';

@Injectable()
export class GoogleAuthStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(
    @Inject('AUTH_SERVICE') private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {
    super({
      clientID: configService.get('GOOGLE_CLIENT_ID'),
      clientSecret: configService.get('GOOGLE_CLIENT_SECRET'),
      callbackURL: 'http://localhost:3300/auth/google',
      scope: ['email', 'profile'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: Profile,
    done: VerifyCallback,
  ): Promise<any> {
    const { given_name, family_name } = profile._json;
    const newUser: UserDto = {
      username: `${profile._json.email.split('@')[0]}G`,
      firstName: given_name,
      lastName: family_name,
      email: profile._json.email,
      avatarUrl: profile._json.picture,
      status: UserStatus.offline,
    };
    const user = await this.authService.validateUser(newUser);
    done(null, user);
  }
}
