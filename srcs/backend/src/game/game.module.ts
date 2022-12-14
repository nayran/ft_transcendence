import { UsersModule } from '../users/users.module';
import { GameEntity } from 'src/game/game.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';
import { GameService } from './game.service';
import { GameGateway } from './game.gateway';
import { StatsService } from 'src/stats/stats.service';
import { AchievementsEntity } from 'src/stats/achievements.entity';
import { FriendsEntity } from 'src/friends/friends.entity';
import { StatsModule } from 'src/stats/stats.module';
import { FriendsService } from 'src/friends/friends.service';
import { HttpModule } from '@nestjs/axios';
import { UserEntity } from 'src/users/users.entity';

@Module({
  imports: [TypeOrmModule.forFeature([GameEntity, UserEntity, AchievementsEntity]), UsersModule, StatsModule],
  providers: [GameGateway, GameService],
  exports: [GameService]
})
export class GameModule { }
