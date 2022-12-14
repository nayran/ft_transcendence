import { GameEntity } from './game.entity';
import { UsersService } from 'src/users/users.service';
import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Game } from './game';
import { IGame } from './game.interface';
import { Repository } from 'typeorm';
import { StatsService } from 'src/stats/stats.service';

@Injectable()
export class GameService {

    constructor(
        private usersService: UsersService,
        private statsService: StatsService,
        @InjectRepository(GameEntity) private gameRepository: Repository<GameEntity>,
    ) { }

    async addGame(game: Game) {
        if (! game || !game.winner || !game.player1 || !game.player2)
            return;
		const exists = await this.gameRepository
			.createQueryBuilder('g')
			.where('g.socketP1 = :s1', { s1: game.player1.socket})
			.andWhere('g.socketP2 = :s2', { s2: game.player2.socket})
			.getMany();
		if (exists.length)
			return ;
        const gameEntity = new GameEntity;
        gameEntity.usernameP1 = game.player1.username;
        gameEntity.usernameP2 = game.player2.username;
        gameEntity.scoreP1 = game.player1.score;
        gameEntity.scoreP2 = game.player2.score;
        gameEntity.isChallenge = game.challenge;
		gameEntity.socketP1 = game.player1.socket;
		gameEntity.socketP2 = game.player2.socket;
        gameEntity.winner = await this.usersService.getUserByUsername(game.winner.username);
        gameEntity.idP1 = await this.usersService.getUserByUsername(gameEntity.usernameP1);
        gameEntity.idP2 = await this.usersService.getUserByUsername(gameEntity.usernameP2);
		if (gameEntity && gameEntity.idP1 && gameEntity.idP2 && gameEntity.winner)
		{
			if (!(gameEntity.isChallenge))
				await this.statsService.updateRating(gameEntity);
				await this.gameRepository.save(gameEntity);
				await this.statsService.gameAchievements(gameEntity.idP1.id);
				await this.statsService.gameAchievements(gameEntity.idP2.id);
		}
    }

}
