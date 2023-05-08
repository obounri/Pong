import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user/entities/user.entity';
import { ReadUsersProfileView } from './views.entity';
import { PassportModule } from '@nestjs/passport';
import { UsersModule } from './user/user.module';
import { MessagesModule } from './messages/messages.module';
import { JwtAuthModule } from './jwt/jwt-auth.module';
import { GameModule } from './game/game.module';
import { FriendsModule } from './friends/friends.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    AuthModule,
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'db',
      port: 5432,
      username: 'postgres',
      password: 'pass123',
      database: 'postgres',
      autoLoadEntities: true,
      entities: [User, ReadUsersProfileView],
      synchronize: true,
    }),
    // PassportModule.register({ session: true }),
    UsersModule,
    MessagesModule,
    JwtAuthModule,
    GameModule,
    FriendsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
