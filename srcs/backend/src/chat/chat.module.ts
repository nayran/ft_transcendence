import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EncryptService } from 'src/services/encrypt.service';
import { UserEntity } from 'src/users/users.entity';
import { UsersModule } from 'src/users/users.module';
import { RoomEntity } from './entities/room.entity';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';
import { MessageEntity } from './entities/message.entity';
import { ChatGateway } from './chat.gateway';
import { ConnectedUsersService } from 'src/services/connected-user/connected-user.service';
import { ConnectedUserEntity } from './entities/connected-user.entity';
import { MemberEntity } from './entities/member.entity';
import { UsersService } from 'src/users/users.service';
import { HttpModule } from '@nestjs/axios';
import { StatsService } from 'src/stats/stats.service';
import { GameEntity } from 'src/game/game.entity';
import { FriendsEntity } from 'src/friends/friends.entity';
import { AchievementsEntity } from 'src/stats/achievements.entity';
import { BlockedUserEntity } from './entities/blocked_user.entity';

@Module({
    imports: [
        UsersModule,
        HttpModule,
        TypeOrmModule.forFeature([UserEntity, RoomEntity, MessageEntity, ConnectedUserEntity, MemberEntity, GameEntity, FriendsEntity, AchievementsEntity, BlockedUserEntity])],
    providers: [ChatGateway, ChatService, EncryptService, ConnectedUsersService, UsersService, StatsService],
    exports: [ChatService],
    controllers: [ChatController]
})

export class ChatModule { }
