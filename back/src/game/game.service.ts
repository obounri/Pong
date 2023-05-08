import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateGameDto } from './dto/create-game.dto';
import { UpdateGameDto } from './dto/update-game.dto';
import { Game } from './entities/game.entity';

@Injectable()
export class GameService {
  constructor(
    @InjectRepository(Game)
    private readonly gamesRepo: Repository<Game>,
  ) {}

  async create(createGameDto: CreateGameDto) {
    const newGame = this.gamesRepo.create(createGameDto);
    return {
      success: true,
      data: await this.gamesRepo.save(newGame),
    };
  }

  async findUserGames(
    user_uuid: string,
  ): Promise<{ success: boolean; data: Game[]; ngames: number; xp: number }> {
    const [games, ngames]: [Game[], number] = await this.gamesRepo
      .createQueryBuilder('game')
      .select()
      .where('game.playerone = :user_uuid OR game.playertwo = :user_uuid', {
        user_uuid: user_uuid,
      })
      .getManyAndCount();
    let xp = 0;
    games.forEach((game) => {
      if (game.winner === user_uuid) xp += 5;
    });
    return { success: true, data: games, ngames: ngames, xp: xp };
  }

  async findOne(id: string) {
    const game = await this.gamesRepo.findOneBy({ game_id: id });
    return game
      ? { success: true, data: game }
      : { success: false, msg: 'Game not found' };
  }

  async update(id: string, updateGameDto: UpdateGameDto) {
    const game = await this.gamesRepo.preload({
      game_id: id,
      ...updateGameDto,
    });
    return game
      ? { success: true, data: await this.gamesRepo.save(game) }
      : { success: false, msg: 'Game not found' };
  }

  // remove(id: number) {
  //   return `This action removes a #${id} game`;
  // }
}
