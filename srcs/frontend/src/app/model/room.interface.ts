import { MemberInterface } from "./member.interface";
import { MessageInterface } from "./message.interface";
import { Meta } from "./meta.interface";

export interface RoomInterface {
    id: number;
    name: string;
    name2?: string;
    description?: string;
    type: RoomType;
    password?: string;
    messages?: MessageInterface[];
    members?: MemberInterface[];
    created_at?: Date;
    updated_at?: Date;
	unread?: boolean;
}

export interface RoomPaginateInterface {
    items: RoomInterface[];
    meta: Meta;
}

export enum RoomType {
    Public = 1,
    Private = 2,
    Protected = 3,
    Direct = 4
}
