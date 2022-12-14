
import { MemberInterface } from "./member.interface";
import { Meta } from "./meta.interface";
import { RoomInterface } from "./room.interface";

export interface MessageInterface {
    id?: number;
    message: string;
    member: MemberInterface;
    room: RoomInterface;
    read: boolean;
	created_at?: Date;
}

export interface MessagePaginateInterface {
    items: MessageInterface[];
    meta: Meta;
}
