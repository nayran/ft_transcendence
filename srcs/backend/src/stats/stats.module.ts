import { forwardRef, Module } from '@nestjs/common';
import { StatsService } from './stats.service';
import { StatsController } from './stats.controller';
import { HttpModule } from '@nestjs/axios';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GameEntity } from 'src/game/game.entity';
import { Repository } from 'typeorm';
import { UserEntity } from 'src/users/users.entity';
import { UsersModule } from 'src/users/users.module';
import { AchievementsEntity } from './achievements.entity';
import { FriendsEntity } from 'src/friends/friends.entity';
import { UsersService } from 'src/users/users.service';
import { FriendsService } from 'src/friends/friends.service';
import { EncryptService } from 'src/services/encrypt.service';

@Module({
    imports: [
        HttpModule,
        TypeOrmModule.forFeature([AchievementsEntity, GameEntity, UserEntity, FriendsEntity]),
    ],
    providers: [StatsService, EncryptService, UsersService],
    exports: [StatsService],
    controllers: [StatsController]
})

export class StatsModule { }
