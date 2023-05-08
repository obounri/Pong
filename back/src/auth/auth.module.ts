import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { FortyTwoStartegy } from '../utils/FortyTwoStrategy';
import { AuthService } from './auth.service';
import { UsersModule } from 'src/user/user.module';
import { JwtAuthModule } from 'src/jwt/jwt-auth.module';
import { GoogleAuthStrategy } from './googleAuth.strategy';
import { Jwt2faAuthModule } from 'src/jwt/2fa-auth.module';

@Module({
  imports: [UsersModule, JwtAuthModule, Jwt2faAuthModule],
  controllers: [AuthController],
  providers: [
    FortyTwoStartegy,
    GoogleAuthStrategy,
    {
      provide: 'AUTH_SERVICE',
      useClass: AuthService,
    },
  ],
})
export class AuthModule {}
