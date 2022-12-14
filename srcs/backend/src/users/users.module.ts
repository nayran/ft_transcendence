import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { HttpModule, HttpService } from '@nestjs/axios';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from './users.service';
import { EncryptService } from 'src/services/encrypt.service';
import { ConnectedUsersService } from 'src/services/connected-user/connected-user.service';
import { ConnectedUserEntity } from 'src/chat/entities/connected-user.entity';
import { ChatService } from 'src/chat/chat.service';
import { RoomEntity } from 'src/chat/entities/room.entity';
import { MessageEntity } from 'src/chat/entities/message.entity';
import { MemberEntity } from 'src/chat/entities/member.entity';
import { ChatModule } from 'src/chat/chat.module';
import { StatsService } from 'src/stats/stats.service';
import { GameEntity } from 'src/game/game.entity';
import { FriendsEntity } from 'src/friends/friends.entity';
import { AchievementsEntity } from 'src/stats/achievements.entity';
import { BlockedUserEntity } from 'src/chat/entities/blocked_user.entity';

@Module({
    imports: [
        HttpModule,
        TypeOrmModule.forFeature([UserEntity, RoomEntity, MessageEntity, ConnectedUserEntity, MemberEntity, GameEntity, FriendsEntity, AchievementsEntity, BlockedUserEntity])
    ],
    providers: [UsersService, EncryptService, ChatService, ConnectedUsersService, StatsService],
    exports: [UsersService],
    controllers: [UsersController]
})

export class UsersModule { }
