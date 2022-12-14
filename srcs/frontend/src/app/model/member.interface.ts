import { MessageInterface } from "./message.interface";
import { UserInterface } from "./user.interface";

export interface MemberInterface {
    id?: number;
    muteUntil?: Date;
    banUntil?: Date;
    user: UserInterface;
    role: MemberRole;
    socketId?: string;
    messages?: MessageInterface[];
    created_at?: Date;
}

export enum MemberRole {
    Owner = 1,
    Administrator = 2,
    Member = 3
}
