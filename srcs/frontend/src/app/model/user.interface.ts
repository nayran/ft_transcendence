import { RoomInterface } from "./room.interface";

export interface UserInterface {
    id: number;
    username: string;
    fullname: string;
    avatar_url: string;
    refreshtoken?: string;
    tfa_enabled?: boolean;
    tfa_code?: string;
    rooms?: RoomInterface[];
    created_at?: Date;
    updated_at?: Date;
}
