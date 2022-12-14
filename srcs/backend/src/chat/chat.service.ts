import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IPaginationOptions, paginate, Pagination, PaginationTypeEnum } from 'nestjs-typeorm-paginate';
import { EncryptService } from 'src/services/encrypt.service';
import { UserEntity } from 'src/users/users.entity';
import { UsersService } from 'src/users/users.service';
import { Brackets, Repository } from 'typeorm';
import { CreateMemberDto } from './dto/createMember.dto';
import { CreateMessageDto } from './dto/createMessage.dto';
import { BlockedUserEntity } from './entities/blocked_user.entity';
import { ConnectedUserEntity } from './entities/connected-user.entity';
import { MemberEntity } from './entities/member.entity';
import { MessageEntity } from './entities/message.entity';
import { RoomEntity } from './entities/room.entity';
import { MemberRole } from './models/memberRole.model';
import { RoomType } from './models/typeRoom.model';

@Injectable()
export class ChatService {

    constructor(
        @InjectRepository(RoomEntity)
        private roomRepository: Repository<RoomEntity>,
        @InjectRepository(MessageEntity)
        private messageRepository: Repository<MessageEntity>,
        @InjectRepository(MemberEntity)
        private memberRepository: Repository<MemberEntity>,
        @InjectRepository(UserEntity)
        private userRepository: Repository<UserEntity>,
        @InjectRepository(BlockedUserEntity)
        private blockedUserRepository: Repository<BlockedUserEntity>,
        private readonly encrypt: EncryptService,
        private UsersService: UsersService) { }

    async addMemberToRoom(room: RoomEntity, member: MemberEntity): Promise<RoomEntity> {
        room.members.push(member);
        return await this.roomRepository.save(room);
    }

    async createRoom(room: RoomEntity, members: MemberEntity[]): Promise<RoomEntity> {
        room.members = [];
        members[0].role = MemberRole.Owner;
        members.forEach(member => {
            room.members.push(member);
        })
        return await this.roomRepository.save(room);
    }

    async createMember(user: UserEntity, socketId: string, role: MemberRole): Promise<MemberEntity> {
        const member = new CreateMemberDto(user, socketId, role);
        return await this.memberRepository.save(member.toEntity());
    }

    async getMembersByUserId(userId: number): Promise<MemberEntity[]> {
        return await this.memberRepository.find({
            where: { 'user': { 'id': userId } },
            relations: { user: true, rooms: true }
        });
    }

    async getMemberByUserId(userId: number): Promise<MemberEntity> {
        return await this.memberRepository.findOne({
            where: { 'user': { 'id': userId } },
            relations: { user: true, rooms: true }
        });
    }

    async getMemberByRoomAndUser(room: RoomEntity, user: UserEntity): Promise<MemberEntity | null> {
        const member = await this.memberRepository
            .createQueryBuilder('member')
            .leftJoinAndSelect("member.user", "user")
            .leftJoinAndSelect("member.rooms", "rooms")
            .where("rooms.id = :roomId", { roomId: room.id })
            .andWhere("user.id = :userId", { userId: user.id })
            .getOne()

        return (member);
    }

    async rejoinMemberToRoom(member: MemberEntity) {
        member.isMember = true;
        await this.memberRepository.save(member);
    }

    async updateSocketIdMember(socketId: string, members: MemberEntity[]): Promise<MemberEntity[]> {
        let membersUpdated = [];
        for (var member of members) {
            member.socketId = socketId;
            let ret = await this.memberRepository.save(member);
            membersUpdated.push(ret);
        }
        return (membersUpdated);
    }

    async getAllMyRoomsAsText(userId: number): Promise<String[]> {
        const rooms = await this.roomRepository
            .createQueryBuilder('room')
            .leftJoinAndSelect('room.members', 'member')
            .leftJoinAndSelect('member.user', 'user')
            .where('user.id = :userId', { userId })
            .andWhere("room.type IN (:...types)", { types: [RoomType.Public, RoomType.Protected] })
            .getMany();
        let myRooms: string[] = [];
        rooms.forEach(room => {
            myRooms.push(room.name);
        })
        return (myRooms);
    }

    async getMyRooms(userId: number): Promise<RoomEntity[]> {
        return await this.roomRepository
            .createQueryBuilder('room')
            .leftJoinAndSelect('room.members', 'member')
            .leftJoinAndSelect('member.user', 'user')
            .where('user.id = :userId', { userId })
            .getMany();
    }

    async getPublicAndProtectedRooms(options: IPaginationOptions): Promise<Pagination<RoomEntity>> {
        const query = this.roomRepository
            .createQueryBuilder('room')
            .where("room.type IN (:...types)", { types: [RoomType.Public, RoomType.Protected] });
        let pages = await paginate(query, options);
        pages.meta.currentPage -= 1;
        return (pages);
    }

    async getRoomById(roomId: number): Promise<RoomEntity> {
        return this.roomRepository.findOne({
            where: { id: roomId },
            relations: { members: true }
        });
    }

    async getRoomsOfMember(userId: number, options: IPaginationOptions, roomType: RoomType | null = null): Promise<Pagination<RoomEntity>> {
        const subquery = this.roomRepository
            .createQueryBuilder('room')
            .select("room.id", "room_id")
            .leftJoin('room.members', 'member')
            .leftJoin('member.user', 'user')
            .where('user.id = :userId', { userId })
            .andWhere('member.isMember = :isMember', { isMember: true })
        if (roomType !== null && roomType === RoomType.Direct)
            subquery.andWhere('room.type = :type1', { type1: RoomType.Direct })
        else if (roomType !== null && roomType !== RoomType.Direct)
            subquery.andWhere('room.type != :type2', { type2: RoomType.Direct })

        const query = this.roomRepository
            .createQueryBuilder('room')
            .leftJoinAndSelect('room.members', 'member')
            .leftJoinAndSelect('member.user', 'user')
            .where('room.id IN (' + subquery.getQuery() + ')')
            .setParameters(subquery.getParameters())

        const totalItems = await query.getCount();
        let opt: IPaginationOptions = {
            limit: options.limit,
            page: options.page,
            paginationType: PaginationTypeEnum.TAKE_AND_SKIP,
            metaTransformer: ({ currentPage, itemCount, itemsPerPage }) => {
                const totalPages = Math.ceil(totalItems / itemsPerPage);
                return {
                    currentPage,
                    itemCount,
                    itemsPerPage,
                    totalItems,
                    totalPages,
                };
            }
        }
        let pages = await paginate(query, opt);
        pages.meta.currentPage -= 1;
        return (pages);
    }

    async isRoomNameTaken(roomName: string) {
        let count = await this.roomRepository.countBy({ name: roomName });
        return count == 0 ? false : true;
    }

    async removeMemberFromRoom(room: RoomEntity, member: MemberEntity): Promise<string> {
        if (member.role == MemberRole.Owner) {
            member.role = MemberRole.Member;
            const admins = room.members.sort((a, b) => a.created_at.getTime() - b.created_at.getTime())
                .filter((obj) => obj.isMember == true && obj.role == MemberRole.Administrator && obj.id != member.id);
            if (admins.length > 0) {
                admins[0].role = MemberRole.Owner;
                await this.memberRepository.save(admins[0]);
            }
            else {
                let members = room.members.filter((obj) => obj.isMember == true && obj.id != member.id && obj.role != MemberRole.Owner);
                if (members.length > 0) {
                    members[0].role = MemberRole.Owner;
                    await this.memberRepository.save(members[0]);
                }
                else {
                    if (await this.roomRepository.remove(room)) {
                        await this.memberRepository.remove(member);
                        return ("delete_room");
                    }
                }
            }
        }

        member.role = MemberRole.Member;
        member.isMember = false;
        await this.memberRepository.save(member);
        return ("");
    }

    async verifyPassword(roomId: number, password: string): Promise<boolean> {
        const room = await this.getRoomById(roomId);
        if (room && room.type == RoomType.Protected) {
            let encryptedPass = this.encrypt.encode(password);
            if (encryptedPass == room.password)
                return true;
        }
        return false;
    }

    async createMessage(createMessage: MessageEntity, member: MemberEntity): Promise<MessageEntity> {
        createMessage.member = member;
        let message = this.messageRepository.create(createMessage);
        return await message.save();
    }

    async findMessagesForRoom(room: RoomEntity, userId: number): Promise<MessageEntity[]> {

        let blockedUsers: number[] = [];
        (await this.getBlockedUser(userId)).forEach(user => {
            blockedUsers.push(user.blockedUserId);
        });

        let usersToSend: number[] = [];
        (await this.getMembersByRoom(room)).forEach(member => {
            if (!blockedUsers.includes(member.user.id))
                usersToSend.push(member.user.id);
        });

        return this.messageRepository
            .createQueryBuilder('message')
            .leftJoin('message.room', 'room')
            .where('room.id = :roomId', { roomId: room.id })
            .leftJoinAndSelect('message.member', 'member')
            .leftJoinAndSelect('member.user', 'user')
            .andWhere('user.id IN (:...usersToSend)', { usersToSend: usersToSend })
			.orderBy('message.created_at', 'ASC')
			.getMany()
    }

    async getMembersByRoom(room: RoomEntity): Promise<MemberEntity[]> {
        return await this.memberRepository
            .createQueryBuilder('member')
            .leftJoinAndSelect("member.user", "user")
            .leftJoinAndSelect("member.rooms", "rooms")
            .where("rooms.id = :roomId", { roomId: room.id })
            .andWhere("member.isMember = :isMember", { isMember: true })
            .orderBy('member.role', 'ASC')
            .getMany()
    }

    async getAllAddedUsers(user: UserEntity) {
        const type = RoomType.Direct;
        const username = user.username;
        let users: UserEntity[] = [];
        const rooms = await this.roomRepository
            .createQueryBuilder('room')
            .leftJoinAndSelect('room.members', 'member')
            .where('room.type = :type', { type })
            .getMany();

        for await (var room of rooms) {
            for await (var member of room.members) {
                const user = await this.UsersService.getUserByMemberId(member.id)
                if (user != null && user.username != username)
                    users.push(user);
            }
        }
        return (users);
    }

    async getNonAddedUsers(userId: number) {
        const user = await this.UsersService.getUserById(userId);
        const allUsers = await this.UsersService.getAllUsers();
        const allAddedUsers = await this.getAllAddedUsers(user);

        const nonAddedUsers = allUsers.filter(x => !allAddedUsers.map(y => y.id).includes(x.id));
        nonAddedUsers.forEach((element, index) => {
            if (element.id == user.id)
                nonAddedUsers.splice(index, 1);
        });

        return (nonAddedUsers);
    }

    async searchUsers(search: string, me: string, userId: number) {

        let blockedUsers: number[] = [];
        (await this.getBlockedUser(userId)).forEach(user => {
            blockedUsers.push(user.blockedUserId);
        });

        let blockerUsers: number[] = [];
        (await this.getBlockerUser(userId)).forEach(user => {
            blockerUsers.push(user.userId);
        });

        let nonBlockedUsers: number[] = [];
        (await this.UsersService.getAllUsers()).forEach(user => {
            if (!blockedUsers.includes(user.id) && !blockerUsers.includes(user.id))
                nonBlockedUsers.push(user.id);
        });

        let query = this.userRepository
            .createQueryBuilder("user")
            .select(['user.username', 'user.avatar_url', 'user.id'])
            .where('user.username != :me', { me: me })
            .andWhere("user.username like :name", { name: `%${search}%` })
        if (nonBlockedUsers.length > 0) {
            query.andWhere("user.id IN (:...users)", { users: nonBlockedUsers })
        }
        const users = await query.getMany();
        return users;
    }

    async getMyMemberOfRoom(roomId: number, userId: number): Promise<MemberEntity> {
        let room = await this.roomRepository.findOne({
            relations: ['members', 'members.user'],
            where: { id: roomId }
        });
        if (room) {
            let member = room.members.find(member => member.user.id == userId)
            if (member) {
                return (member);
            }
        }
        return (null);
    }

    async updateRoomName(room: RoomEntity, name: string) {
        room.name = name;
        await this.roomRepository.save(room);
    }

    async updateRoomDescription(room: RoomEntity, description: string) {
        room.description = description;
        await this.roomRepository.save(room);
    }

    async updateOrCreateRoomPassword(room: RoomEntity, password: string) {
        const encodedPassword = this.encrypt.encode(password);
        room.password = encodedPassword;
        room.type = RoomType.Protected;
        await this.roomRepository.save(room);
    }

    async removeRoomPassword(room: RoomEntity) {
        room.password = null;
        room.type = RoomType.Public;
        await this.roomRepository.save(room);
    }

    async addBlockedUser(userId: number, BlockedUserId: number) {
        await this.blockedUserRepository.save({ userId: userId, blockedUserId: BlockedUserId });
    }

    async removeBlockedUser(userId: number, BlockedUserId: number) {
        const blockedUser = await this.blockedUserRepository.find({ where: { userId: userId, blockedUserId: BlockedUserId } });
        await this.blockedUserRepository.remove(blockedUser);
    }

    async isBlockedUser(userId: number, BlockedUserId: number): Promise<boolean> {
        const count = await this.blockedUserRepository.count({ where: { userId: userId, blockedUserId: BlockedUserId } });
        if (count > 0)
            return (true);
        return (false);
    }

    async getBlockedUser(userId: number): Promise<BlockedUserEntity[]> {
        return (await this.blockedUserRepository.find({ where: { userId: userId } }));
    }

    async getBlockerUser(userId: number): Promise<BlockedUserEntity[]> {
        return (await this.blockedUserRepository.find({ where: { blockedUserId: userId } }));
    }

    async getAllMyRooms(userId: number): Promise<RoomEntity[]> {
        const rooms = await this.roomRepository
            .createQueryBuilder('room')
            .leftJoin('room.members', 'member')
            .leftJoin('member.user', 'user')
            .where('user.id = :userId', { userId })
            .andWhere('member.isMember = :isMember', { isMember: true })
            .getMany();
        return (rooms);
    }

    async getAllPublicRooms(): Promise<RoomEntity[]> {
        const rooms = await this.roomRepository
            .createQueryBuilder('room')
            .leftJoinAndSelect('room.members', "members")
            .leftJoinAndSelect('members.user', "user")
            .where("room.type IN (:...types)", { types: [RoomType.Public, RoomType.Protected] })
            .getMany();
        return (rooms);
    }

    async getDirectRoom(user_1: string, user_2: string): Promise<RoomEntity> {
        const room = await this.roomRepository
            .createQueryBuilder('room')
            .leftJoin('room.members', 'member')
            .leftJoin('member.user', 'user')
            .where('room.type = :DirectType', { DirectType: RoomType.Direct })
            .andWhere(new Brackets(qb => {
                qb.andWhere(new Brackets(qb => {
                    qb.where('room.name = :username1', { username1: user_1 })
                        .andWhere('room.name2 = :username2', { username2: user_2 })
                }))
                    .orWhere(new Brackets(qb => {
                        qb.where('room.name = :username2', { username2: user_2 })
                            .andWhere('room.name2 = :username1', { username1: user_1 })
                    }))
            }))
            .getOne()
        return (room);
    }

    async setAdmin(member: MemberEntity) {
        member.role = MemberRole.Administrator;
        await this.memberRepository.save(member);
    }

    async unsetAdmin(member: MemberEntity) {
        member.role = MemberRole.Member;
        await this.memberRepository.save(member);
    }

    async getMemberById(memberId: number) {
        return await this.memberRepository.findOne({
            where: { id: memberId },
            relations: { user: true, rooms: true }
        });
    }

    async setMute(member: MemberEntity, muteTime: Date) {
        if (muteTime) {
            member.muteUntil = muteTime;
            await this.memberRepository.save(member);
        }
    }

    async setBan(member: MemberEntity, banTime: Date) {
        if (member && banTime) {
            member.banUntil = banTime;
            await this.memberRepository.save(member);
        }
    }

	async setReadRoom(room_id: number, member_id: number) {
		try {
			await this.messageRepository.createQueryBuilder()
				.update()
				.set({read: true})
				.where('room = :room', { room: room_id })
				.andWhere('member = :member', { member: member_id })
				.execute();
		} catch {};
	}

	async setReadMessage(message_id: number) {
		let message = await this.messageRepository.createQueryBuilder('message')
			.leftJoinAndSelect('message.member', 'member')
			.leftJoinAndSelect('message.room', 'room')
			.where('message.id = :id', { id: message_id })
			.getOne()

		if (message && message.room && message.member)
		{
			let allmessages = await this.messageRepository.createQueryBuilder()
				.update()
				.set({read: true})
				.where('room = :room', { room: message.room.id })
				.andWhere('member = :member', { member: message.member.id })
				.execute();
		}
	}

	async getUnreadRoomsOfMember(userId: number): Promise<number[]> {
		const msgs = await this.messageRepository
			.createQueryBuilder('message')
			.innerJoinAndSelect('message.room', 'room')
			.innerJoin('message.member', 'creator')
			.innerJoin('creator.user', 'creator_user')
			.where("creator_user.id != :myself", {myself: userId})
			.andWhere('message.read = :read', { read: false })
			.getMany();
		let list: number[] = [];
		msgs.forEach(message => {
			if (!(list.includes(message.room.id)))
				list.push(message.room.id);
		})
		return list;
    }
}
