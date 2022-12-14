import { RoomEntity } from 'src/chat/entities/room.entity';
import { UserEntity } from './users.entity';

export class UserDTO {
	id: number;
	username: string;
	fullname: string;
	avatar_url: string;
	tfa_fulfilled?: boolean = false;
	tfa_enabled?: boolean = false;
	login_count?: number = 0;

	constructor(id: number = 0, username: string = '', fullname: string = '', avatar_url: string = '') {
		this.id = id;
		this.username = username;
		this.fullname = fullname;
		this.avatar_url = avatar_url;
	}

	public static from(dto: Partial<UserDTO>) {
		const user = new UserDTO();
		if (dto) {
			user.id = dto.id;
			user.username = dto.username;
			user.fullname = dto.fullname;
			user.avatar_url = dto.avatar_url;
			user.tfa_fulfilled = dto.tfa_fulfilled;
			user.tfa_enabled = dto.tfa_enabled;
			user.login_count = dto.login_count;
		}
		return (user);
	}

	public static fromEntity(entity: UserEntity) {
		const user = new UserDTO();
		user.id = entity.id;
		user.username = entity.username;
		user.fullname = entity.fullname;
		user.avatar_url = entity.avatar_url;
		user.tfa_enabled = entity.tfa_enabled;
		user.login_count = entity.login_count;
		return (user);
	}

	public toEntity() {
		const user = new UserEntity();
		user.id = this.id;
		user.username = this.username;
		user.fullname = this.fullname;
		user.avatar_url = this.avatar_url;
		return (user);
	}
}
