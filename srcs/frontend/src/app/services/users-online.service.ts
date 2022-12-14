import { Injectable } from '@angular/core';
import { ChatSocket } from '../components/chat/chat-socket';

export const OFFLINE = 0;
export const ONLINE = 1;
export const INGAME = 2;
export const WATCHING = 3;
export interface UserI {
	username: string,
	status: string,
}

@Injectable({
	providedIn: 'root'
})
export class UsersOnlineService {

	constructor(private socket: ChatSocket) {
		this.socket.on('chatStatus', (users: any) => {
			this.users = users;
		})
		this.getUsers()
	}

	public users: UserI[] = []

	ngOnInit(): void { }

	getUsers() {
		this.socket.emit('getStatus')
	}

	getOnlineCount(): number {
		let count: number = 0;
		this.users.forEach(user => {
			if (user.status != "offline") {
				count++;
			}
		});
		return count;
	}
	
	setStatus(username: string, status: string) {
		this.socket.emit('setStatus', username, status)
	}

	getOnline(username: string): string {
		let status = "offline";
		this.users.forEach(user => {
			if (user.username == username) {
				status = user.status;
				return;
			}
		});
		return status;
	}
}
