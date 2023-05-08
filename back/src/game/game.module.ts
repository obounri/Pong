import { Module } from '@nestjs/common';
import { GameService } from './game.service';
import { GameGateway } from './game.gateway';
import { JwtAuthModule } from 'src/jwt/jwt-auth.module';
import { WsJwtGuard } from 'src/jwt/jwt-ws.guard';
import { UsersModule } from 'src/user/user.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Game } from './entities/game.entity';
import { GameController } from './game.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Game]), JwtAuthModule, UsersModule],
  providers: [GameGateway, GameService],
  controllers: [GameController],
})
export class GameModule {}
