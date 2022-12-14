import { ConnectedUserEntity } from "src/chat/entities/connected-user.entity";
import { RoomEntity } from "src/chat/entities/room.entity";

export interface UserInterface {
  id?: number;
  username?: string;
  fullname?: string;
  avatar_url?: string;
  refreshtoken?: string;
  tfa_enabled?: boolean;
  tfa_code?: string;
  rooms?: RoomEntity[];
  created_at?: Date;
  updated_at?: Date;
}
