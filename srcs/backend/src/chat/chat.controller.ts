import { Body, Controller, Get, NotFoundException, Param, Post, Request, UseGuards } from '@nestjs/common';
import { of } from 'rxjs';
import { ChatService } from './chat.service';
import { JwtGuard } from 'src/auth/jwt/jwt.guard';
import { ConnectedUsersService } from 'src/services/connected-user/connected-user.service';
import { CreateRoomDto } from './dto/createRoom.dto';
import { EncryptService } from 'src/services/encrypt.service';
import { UsersService } from 'src/users/users.service';
import { MemberRole } from './models/memberRole.model';
import { ChatGateway } from './chat.gateway';
import { BanMemberDto } from './dto/banMember.dto';
import { BlockUserDto } from './dto/blockUser.dto';
import { ChangeSettingRoomDto } from './dto/changeSettingRoom.dto';
import { CreateMessageDto } from './dto/createMessage.dto';
import { JoinRoomDto } from './dto/joinRoom.dto';
import { MuteMemberDto } from './dto/muteMember.dto';
import { SetAdminDto } from './dto/setAdmin.dto';

@Controller('chat')
export class ChatController {

    constructor(
        private chatService: ChatService,
        private connectedUsersService: ConnectedUsersService,
        private encrypt: EncryptService,
        private userService: UsersService,
        private connectedUser: ConnectedUsersService,
        private readonly chatGateway: ChatGateway
    ) { }

    @UseGuards(JwtGuard)
    @Get('is-room-name-taken/:name')
    async isUsernameTaken(@Param('name') roomName) {
        return of(await this.chatService.isRoomNameTaken(roomName))
    }

    @UseGuards(JwtGuard)
    @Get('searchusers/:username')
    async getUsers(@Param('username') username, @Request() req) {
        let ret = await this.chatService.searchUsers(username, req.user.username, req.user.id);
        return (JSON.stringify(ret));
    }

    @UseGuards(JwtGuard)
    @Get('get_all_my_rooms_as_text')
    async getAllMyRoomsAsText(@Request() req) {
        return of(await this.chatService.getAllMyRoomsAsText(req.user.id));
    }

    @UseGuards(JwtGuard)
    @Get('get_my_rooms')
    async getMyRooms(@Request() req) {
        return of(await this.chatService.getMyRooms(req.user.id));
    }

    @Post('verify_password')
    async verifyPassword(@Body() body): Promise<Object> {
        return of(await this.chatService.verifyPassword(body.roomId, body.password));
    }

    @UseGuards(JwtGuard)
    @Get('get_non_added_users')
    async getNonAddedUsers(@Request() req) {
        return of(await this.chatService.getNonAddedUsers(req.user.id));
    }

    @UseGuards(JwtGuard)
    @Get('get_my_member_of_room/:roomId')
    async getMyMemberOfRoom(@Param('roomId') roomId, @Request() req) {
        return of(await this.chatService.getMyMemberOfRoom(roomId, req.user.id));
    }

    @UseGuards(JwtGuard)
    @Get("is_blocked/:userId")
    async isBlockedUser(@Param('userId') userId, @Request() req) {
        return of(await this.chatService.isBlockedUser(+req.user.id, +userId));
    }

    @UseGuards(JwtGuard)
    @Post('create_room')
    async createRoom(@Body() new_room: CreateRoomDto, @Request() req) {
        const room = CreateRoomDto.from(new_room);

        if (room.password) { room.password = this.encrypt.encode(room.password); }

        const connected_user = await this.connectedUser.getByUserId(+req.user.id);
        if (!connected_user) { throw new NotFoundException('item_not_found'); }

        const owner = await this.userService.getUser(+req.user.id);
        if (!owner) { throw new NotFoundException('item_not_found'); }

        const member = await this.chatService.createMember(owner.toEntity(), connected_user.socketId, MemberRole.Owner);
        if (!member) { throw new NotFoundException('item_not_found'); }

        await this.chatService.createRoom(room.toEntity(), [member]);
        await this.chatGateway.emitRooms(+req.user.id, connected_user.socketId);

        const publicRooms = await this.chatService.getPublicAndProtectedRooms({ page: 1, limit: 10 });

        const connectedUsers = await this.connectedUsersService.getAllConnectedUsers();
        if (!connectedUsers) { throw new NotFoundException('item_not_found'); }

        connectedUsers.forEach(user => {
            this.chatGateway.server.to(user.socketId).emit('publicRooms', publicRooms);
        })
    }

    @UseGuards(JwtGuard)
    @Post('create_direct_room')
    async createDirectRoom(@Body() data: { room: CreateRoomDto, user_id: number }, @Request() req) {
        const room = CreateRoomDto.from(data.room);

        const connected_user = await this.connectedUser.getByUserId(+req.user.id);
        if (!connected_user) { throw new NotFoundException('item_not_found'); }

        const owner = await this.userService.getUser(+req.user.id);
        if (!owner) { throw new NotFoundException('item_not_found'); }

        const ownerMember = await this.chatService.createMember(owner.toEntity(), connected_user.socketId, MemberRole.Member);
        if (!ownerMember) { throw new NotFoundException('item_not_found'); }

        const invited = await this.userService.getUser(data.user_id);
        if (!invited) { throw new NotFoundException('item_not_found'); }

        const socketId_invited = (await this.connectedUsersService.getByUserId(invited.id)).socketId;
        if (!socketId_invited) { throw new NotFoundException('item_not_found'); }

        const invitedMember = await this.chatService.createMember(invited.toEntity(), socketId_invited, MemberRole.Member);
        if (!invitedMember) { throw new NotFoundException('item_not_found'); }

        if (await this.chatService.getDirectRoom(owner.username, invited.username) == null) {
            await this.chatService.createRoom(room.toEntity(), [ownerMember, invitedMember]);
            await this.chatGateway.emitRooms(owner.id, ownerMember.socketId);
            await this.chatGateway.emitRooms(invited.id, invitedMember.socketId);
        }
    }

    @UseGuards(JwtGuard)
    @Post('set_ban')
    async setBan(@Body() data: BanMemberDto, @Request() req) {
        const member = await this.chatService.getMemberById(data.memberId);
        if (!member) { throw new NotFoundException('item_not_found'); }
        await this.chatService.setBan(member, data.banTime);

        const room = await this.chatService.getRoomById(data.roomId);
        if (!room) { throw new NotFoundException('item_not_found'); }
        await this.chatService.removeMemberFromRoom(room, member);

        const members = await this.chatService.getMembersByRoom(room);
        if (!members) { throw new NotFoundException('item_not_found'); }

        for (const member of members) {
            this.chatGateway.server.to(member.socketId).emit('members_room', members);
        }
        await this.chatGateway.emitRooms(member.user.id, member.socketId);

        const all_rooms = await this.chatService.getAllMyRooms(+member.user.id);
        this.chatGateway.server.to(member.socketId).emit('all_my_rooms', all_rooms);

        const all_public_rooms = await this.chatService.getAllPublicRooms();
        this.chatGateway.server.to(member.socketId).emit('all_public_rooms', all_public_rooms);
    }

    @UseGuards(JwtGuard)
    @Post('block_user')
    async blockUser(@Body() blockUserDto: BlockUserDto, @Request() req) {
        await this.chatService.addBlockedUser(+req.user.id, blockUserDto.blockedUserId);

        const member = await this.chatService.getMemberByUserId(blockUserDto.blockedUserId);
        if (!member) { throw new NotFoundException('item_not_found'); }

        const connected_user = await this.connectedUser.getByUserId(+req.user.id);
        if (!connected_user) { throw new NotFoundException('item_not_found'); }

        let blockerUserId: number[] = [];
        (await this.chatService.getBlockerUser(+req.user.id)).forEach(blockerUser => {
            blockerUserId.push(blockerUser.userId);
        });
        this.chatGateway.server.to(connected_user.socketId).emit('blocker_users', blockerUserId);
        this.chatGateway.server.to(member.socketId).emit('blocker_users', blockerUserId);

        let blockedUserId: number[] = [];
        (await this.chatService.getBlockedUser(+req.user.id)).forEach(blockedUser => {
            blockedUserId.push(blockedUser.blockedUserId);
        });
        this.chatGateway.server.to(connected_user.socketId).emit('blocked_users', blockedUserId);
        this.chatGateway.server.to(member.socketId).emit('blocked_users', blockedUserId);
    }

    @UseGuards(JwtGuard)
    @Post('unblock_user')
    async unblockUser(@Body() blockUserDto: BlockUserDto, @Request() req) {
        await this.chatService.removeBlockedUser(+req.user.id, blockUserDto.blockedUserId);

        const member = await this.chatService.getMemberByUserId(blockUserDto.blockedUserId);
        if (!member) { throw new NotFoundException('item_not_found'); }

        const connected_user = await this.connectedUser.getByUserId(+req.user.id);
        if (!connected_user) { throw new NotFoundException('item_not_found'); }

        let blockerUserId: number[] = [];
        (await this.chatService.getBlockerUser(+req.user.id)).forEach(blockerUser => {
            blockerUserId.push(blockerUser.userId);
        });
        this.chatGateway.server.to(connected_user.socketId).emit('blocker_users', blockerUserId);
        this.chatGateway.server.to(member.socketId).emit('blocker_users', blockerUserId);

        let blockedUserId: number[] = [];
        (await this.chatService.getBlockedUser(+req.user.id)).forEach(blockedUser => {
            blockedUserId.push(blockedUser.blockedUserId);
        });
        this.chatGateway.server.to(connected_user.socketId).emit('blocked_users', blockedUserId);
        this.chatGateway.server.to(member.socketId).emit('blocked_users', blockedUserId);
    }

    @UseGuards(JwtGuard)
    @Post('change_settings_room')
    async changeSettingsRoom(@Body() data: ChangeSettingRoomDto, @Request() req) {
        if (data.roomId) {
            const room = await this.chatService.getRoomById(data.roomId);
            if (!room) { throw new NotFoundException('item_not_found'); }

            if (data.name)
                await this.chatService.updateRoomName(room, data.name);
            if (data.description)
                await this.chatService.updateRoomDescription(room, data.description);
            if (data.radioPassword && data.radioPassword == "on" && data.password)
                await this.chatService.updateOrCreateRoomPassword(room, data.password);
            else if (data.radioPassword && data.radioPassword == "off")
                await this.chatService.removeRoomPassword(room);

            const members = await this.chatService.getMembersByRoom(room);
            if (members) {
                for (const member of members) {
                    const rooms = await this.chatService.getRoomsOfMember(member.user.id, { page: 1, limit: 10 });
                    const allMyRooms = await this.chatService.getAllMyRooms(member.user.id);
                    this.chatGateway.server.to(member.socketId).emit('rooms_nondirect', rooms);
                    this.chatGateway.server.to(member.socketId).emit('all_my_rooms', allMyRooms);
                }
            }
        }
        const publicRooms = await this.chatService.getPublicAndProtectedRooms({ page: 1, limit: 10 });
        const connectedUsers = await this.connectedUsersService.getAllConnectedUsers();
        if (connectedUsers) {
            connectedUsers.forEach(user => {
                this.chatGateway.server.to(user.socketId).emit('publicRooms', publicRooms);
            });
        }
    }

    @UseGuards(JwtGuard)
    @Post('add_message')
    async onAddMessage(@Body() createMessage: CreateMessageDto, @Request() req) {
        const message = CreateMessageDto.from(createMessage);

        const user = await this.userService.getUserById(+req.user.id);
        if (!user) { throw new NotFoundException('item_not_found'); }

        const room = await this.chatService.getRoomById(createMessage.room.id);
        if (!room) { throw new NotFoundException('item_not_found'); }

        const member = await this.chatService.getMemberByRoomAndUser(room, user);
        if (!member) { throw new NotFoundException('item_not_found'); }

        const this_room = await this.chatService.getRoomById(createMessage.room.id);
        if (!this_room) { throw new NotFoundException('item_not_found'); }

        const createdMessage = await this.chatService.createMessage(message.toEntity(), member);

        let blockerUsers: number[] = [];
        (await this.chatService.getBlockerUser(+req.user.id)).forEach(user => {
            blockerUsers.push(user.userId);
        });

        const members = await this.chatService.getMembersByRoom(this_room);
        if (members) {
            for (const member of members) {
                if (!blockerUsers.includes(member.user.id))
                    this.chatGateway.server.to(member.socketId).emit('message_added', createdMessage);
            }
        }
    }

    @UseGuards(JwtGuard)
    @Post('join_room')
    async onJoinRoom(@Body() joinRoomDto: JoinRoomDto, @Request() req) {
        const user = await this.userService.getUser(+req.user.id);
        if (!user) { throw new NotFoundException('item_not_found'); }

        const room = await this.chatService.getRoomById(joinRoomDto.roomId);
        if (!room) { throw new NotFoundException('item_not_found'); }

        const connected_user = await this.connectedUser.getByUserId(+req.user.id);
        if (!connected_user) { throw new NotFoundException('item_not_found'); }

        let member = await this.chatService.getMemberByRoomAndUser(room, user.toEntity());
        if (member == null) {
            member = await this.chatService.createMember(user.toEntity(), connected_user.socketId, MemberRole.Member);
            await this.chatService.addMemberToRoom(room, member);
        }
        else
            await this.chatService.rejoinMemberToRoom(member);

        await this.chatGateway.emitRooms(user.id, connected_user.socketId);
        const members = await this.chatService.getMembersByRoom(room);
        this.chatGateway.server.to(connected_user.socketId).emit('members_room', members);
    }

    @UseGuards(JwtGuard)
    @Post('add_user_to_room')
    async addUserToRoom(@Body() joinRoomDto: JoinRoomDto, @Request() req) {
        const user = await this.userService.getUser(joinRoomDto.userId);
        if (!user) { throw new NotFoundException('item_not_found'); }

        const connected_user = await this.connectedUsersService.getByUserId(user.id);
        if (!connected_user) { throw new NotFoundException('item_not_found'); }

        const member = await this.chatService.createMember(user.toEntity(), connected_user.socketId, MemberRole.Member);
        if (!member) { throw new NotFoundException('item_not_found'); }

        const room = await this.chatService.getRoomById(joinRoomDto.roomId);
        if (!room) { throw new NotFoundException('item_not_found'); }

        await this.chatService.addMemberToRoom(room, member);
        await this.chatGateway.emitRooms(user.id, connected_user.socketId);

        const myconnecteduser = await this.connectedUsersService.getByUserId(+req.user.id);
        if (!myconnecteduser) { throw new NotFoundException('item_not_found'); }

        const members = await this.chatService.getMembersByRoom(room);
        this.chatGateway.server.to(myconnecteduser.socketId).emit('members_room', members);
    }

    @UseGuards(JwtGuard)
    @Post('set_mute')
    async setMute(@Body() data: MuteMemberDto, @Request() req) {
        const member = await this.chatService.getMemberById(data.memberId);
        if (!member) { throw new NotFoundException('item_not_found'); }

        await this.chatService.setMute(member, data.muteTime);

        const room = await this.chatService.getRoomById(data.roomId);
        if (!room) { throw new NotFoundException('item_not_found'); }

        const members = await this.chatService.getMembersByRoom(room);
        this.chatGateway.server.to(member?.socketId).emit('members_room', members);
    }

    @UseGuards(JwtGuard)
    @Post('set_as_admin')
    async setAsAdmin(@Body() data: SetAdminDto, @Request() req) {
        const room = await this.chatService.getRoomById(data.roomId);
        if (!room) { throw new NotFoundException('item_not_found'); }

        const user = await this.userService.getUserById(data.userId);
        if (!user) { throw new NotFoundException('item_not_found'); }

        const member = await this.chatService.getMemberByRoomAndUser(room, user);
        if (!member) { throw new NotFoundException('item_not_found'); }
        await this.chatService.setAdmin(member);

        const members = await this.chatService.getMembersByRoom(room);
        if (members) {
            for (const member of members) {
                this.chatGateway.server.to(member.socketId).emit('members_room', members);
            }
        }
    }

    @UseGuards(JwtGuard)
    @Post('unset_as_admin')
    async unsetAdmin(@Body() data: SetAdminDto, @Request() req) {
        const room = await this.chatService.getRoomById(data.roomId);
        if (!room) { throw new NotFoundException('item_not_found'); }

        const user = await this.userService.getUserById(data.userId);
        if (!user) { throw new NotFoundException('item_not_found'); }

        const member = await this.chatService.getMemberByRoomAndUser(room, user);
        if (!member) { throw new NotFoundException('item_not_found'); }
        await this.chatService.unsetAdmin(member);

        const members = await this.chatService.getMembersByRoom(room);
        if (members) {
            for (const member of members) {
                this.chatGateway.server.to(member.socketId).emit('members_room', members);
            }
        }
    }
}
