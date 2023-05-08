import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/jwt/jwt-auth.guard';
import { UserDto } from 'src/user/entities/user.dto';
import { UserDecorator } from 'src/user/user.decorater';
import { CreateGameDto } from './dto/create-game.dto';
import { GameService } from './game.service';

@Controller('games')
export class GameController {
  constructor(private readonly gameService: GameService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  async getMyGames(@UserDecorator() user: UserDto) {
    return await this.gameService.findUserGames(user.uuid);
  }

  @Get(':uuid')
  @UseGuards(JwtAuthGuard)
  async getUserGames(@Param('uuid') uuid: string) {
    return await this.gameService.findUserGames(uuid);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  async createGame(@Body() createGameDto: CreateGameDto) {
    return await this.gameService.create(createGameDto);
  }
}
