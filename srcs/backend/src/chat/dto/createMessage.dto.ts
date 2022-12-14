import { MemberEntity } from "../entities/member.entity";
import { MessageEntity } from "../entities/message.entity";
import { RoomEntity } from "../entities/room.entity";
import { IsAscii, IsNotEmpty } from "class-validator"


export class CreateMessageDto {
    @IsNotEmpty()
    message: string;
    room: RoomEntity;
    member: MemberEntity;
	read: boolean;

    constructor(message: string = "", room: RoomEntity = new RoomEntity(), member: MemberEntity = new MemberEntity) {
        this.message = message;
        this.room = room;
        this.member = member;
    }

    public static from(dto: Partial<CreateMessageDto>) {
        const message = new CreateMessageDto();
        message.message = dto.message;
        message.room = dto.room;
        message.member = dto.member;
		message.read = dto.read;
        return (message);
    }

    public static fromEntity(entity: MessageEntity) {
        const message = new CreateMessageDto();
        message.message = entity.message;
        message.room = entity.room;
        message.member = entity.member;
		message.read = entity.read;
        return (message);
    }

    public toEntity() {
        const message = new MessageEntity();
        message.message = this.message;
        message.room = this.room;
        message.member = this.member;
		message.read = this.read;
        return (message);
    }
}