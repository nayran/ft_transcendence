import { IGame } from 'src/game/game.interface';
import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { UserEntity } from './users.entity';
import { UserDTO } from './users.dto';
import { HttpService } from '@nestjs/axios';
export { UserEntity }
import { createWriteStream } from 'fs';
import { v4 as uuidv4 } from 'uuid';
import * as fs from 'fs';
import { In, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { EncryptService } from 'src/services/encrypt.service';
import { Game } from 'src/game/game';
import { StatsService } from 'src/stats/stats.service';
import { UserInterface } from './users.interface';
import { ChatService } from 'src/chat/chat.service';

/*
** This is basically a the Database... We will implement TypeORM.
*/

@Injectable()
export class UsersService {

	constructor(
		@InjectRepository(UserEntity)
		private userRepository: Repository<UserEntity>,
		private readonly httpService: HttpService,
		private readonly encrypt: EncryptService,
		@Inject(forwardRef(() => StatsService))
		private statsService: StatsService
	) { }

	async getUser(intra_id: number): Promise<UserDTO | null> {

		const results = await this.userRepository.findOneBy({
			id: intra_id,
		}).then((ret) => {
			if (!ret)
				return (null);
			return (UserDTO.fromEntity(ret));
		});
		return (results);
	}

	async getUserById(id: number): Promise<UserEntity> {
		if (!(id))
			return null
		return await this.userRepository.findOneBy({ id: id });
	}

	async getUniqueUsername(username: string) {
		let i: number = 0;
		let new_user: string;
		username = username.substring(0, 10);
		if (!(username))
			username = "user";
		while (username.length < 3)
			username = username + "0";
		let alreadyExist = await this.userRepository.findOneBy({ username: username });
		if (!alreadyExist)
			return (username);
		if (username.length > 6)
			username = username.substring(0, 6);
		new_user = username;
		while (await this.userRepository.findOneBy({ username: new_user }))
			new_user = username + "" + (++i);
		return (new_user);
	}

	async createUser(intra_id: number, login: string, displayname: string, image_url: string): Promise<UserDTO> {

		const ext = '.' + image_url.split('.').pop();
		let filename = uuidv4() + ext;
		try {
			const writer = createWriteStream('uploads/profileimages/' + filename)
			const response = await this.httpService.axiosRef({
				url: image_url,
				method: 'GET',
				responseType: 'stream',
			});
			response.data.pipe(writer);
		} catch {
			filename = 'default.jpg'
		}
		image_url = 'user/image/' + filename;

		const user: UserEntity = await this.userRepository.create({
			id: intra_id,
			username: await this.getUniqueUsername(login),
			fullname: displayname,
			avatar_url: image_url
		});
		const results = await this.userRepository.save(user)
			.then((ret) => UserDTO.fromEntity(ret));
		return results;
	}

	async updateRefreshToken(id: number, token: string): Promise<void> {
		let user = await this.userRepository.findOneBy({ id: id });
		user.refreshtoken = this.encrypt.encode(token);
		const results = await this.userRepository.save(user);
		return;
	}

	async updateUrlAvatar(id: number, url: string): Promise<void> {
		let user = await this.userRepository.findOneBy({ id: id });
		user.avatar_url = url;
		const results = await this.userRepository.save(user);
		return;
	}

	async updateUsername(id: number, username: string): Promise<string> {
		let alreadyExist = await this.userRepository.findOneBy({ username: username });
		if (alreadyExist)
			return "";
		let user = await this.userRepository.findOneBy({ id: id });
		let oldUsername = user.username;
		user.username = username;
		const results = await this.userRepository.save(user);
		return username;
	}

	async updateLoginCount(id: number) {
		let user = await this.userRepository.findOneBy({ id: id });
		user.login_count++;
		const results = await this.userRepository.save(user);
		await this.statsService.loginAchievements(id);
	}

	async getIdByUsername(username: string) {
		let user = await this.userRepository.findOneBy({ username: username });
		return (user?.id);
	}

	async getUserByUsername(username: string) {
		let user = await this.userRepository.findOneBy({ username: username });
		return (user);
	}

	async getUserByID(id: number): Promise<UserEntity> {
		let user = await this.userRepository.findOneBy({ id: id });
		return (user);
	}

	async getUsername(id: number) {
		let user = await this.userRepository.findOneBy({ id: id });
		return (user?.username);
	}

	async getUrlAvatar(id: number): Promise<string> {
		let user = await this.userRepository.findOneBy({ id: id });
		return (user?.avatar_url);
	}

	async getRefreshToken(id: number): Promise<string> {
		let user = await this.userRepository.findOneBy({ id: id });
		if (!user)
			return (null);
		return (this.encrypt.decode(user.refreshtoken));
	}

	async isUsernameTaken(username: string) {
		let count = await this.userRepository.countBy({ username: username })
		return count == 0 ? false : true;
	}

	async enable2FASecret(id: number, enable: boolean = true): Promise<void> {
		let user = await this.userRepository.findOneBy({ id: id });
		user.tfa_enabled = enable;
		const results = await this.userRepository.save(user);
		return;
	}

	async set2FASecret(id: number, secret: string): Promise<void> {
		let user = await this.userRepository.findOneBy({ id: id });
		if (user) {
			user.tfa_code = this.encrypt.encode(secret);
			const results = await this.userRepository.save(user);
		}
		return;
	}

	async disable2FASecret(id: number, secret: string): Promise<void> {
		let user = await this.userRepository.findOneBy({ id: id });
		user.tfa_enabled = false;
		const results = await this.userRepository.save(user);
		return;
	}

	async getTfaEnabled(id: number): Promise<boolean> {
		let user = await this.userRepository.findOneBy({ id: id });
		return (user.tfa_enabled);
	}

	async getTfaCode(id: number): Promise<string> {
		let user = await this.userRepository.findOneBy({ id: id });
		return (this.encrypt.decode(user.tfa_code));
	}

	async getAllUSername(): Promise<string[]> {
		let users = await this.userRepository.find();
		let username: string[] = [];
		users.forEach(user => username.push(user.username));
		username.sort();
		return username;
	}

	async getAllUsers(): Promise<UserEntity[]> {
		return await this.userRepository.find();
	}

	async getUserByMemberId(memberId: number): Promise<UserEntity> {
		return this.userRepository.findOne({
			where: { 'members': { 'id': memberId } }
		})
	}
}
