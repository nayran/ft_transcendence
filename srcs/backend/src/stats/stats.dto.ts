import { GameEntity } from "src/game/game.entity";
import { UserEntity } from "src/users/users.entity";
import { Entity } from "typeorm";
import { AchievementsEntity } from "./achievements.entity";

export class HistoryDTO {
	user1: string = '';
	user2: string = '';
	user1_avatar_url: string = '';
	user2_avatar_url: string = '';
	score_p1: number = 0;
	score_p2: number = 0;
	winner: string = '';
	is_challenge: boolean = false;

	public static fromEntity(entity: GameEntity) {
		const history = new HistoryDTO();
		history.user1 = entity?.idP1?.username || '';
		history.user2 = entity?.idP2?.username || '';
		history.user1_avatar_url = entity?.idP1?.avatar_url || '';
		history.user2_avatar_url = entity?.idP2?.avatar_url || '';
		history.score_p1 = entity?.scoreP1 || 0;
		history.score_p2 = entity?.scoreP2 || 0;
		history.winner = entity?.winner?.username || '';
		history.is_challenge = entity?.isChallenge || false;
		return (history);
	}
	public static fromEntities(entity: GameEntity[]): HistoryDTO[] {
		let history: HistoryDTO[] = [];
		for (let item of entity) {
			history.push(HistoryDTO.fromEntity(item));
		}
		return (history);
	}
}
export class AchievementsDTO {
	achievement: string;
	description: string;

	constructor(achievement: string = '', description: string = '') {
		this.achievement = achievement;
		this.description = description;
	}

	public static fromEntity(entity: AchievementsEntity) {
		const achievement = new AchievementsDTO();
		achievement.achievement = entity.achievement;
		achievement.description = entity.description;
		return (achievement);
	}
	public static fromEntities(entity: AchievementsEntity[]): AchievementsDTO[] {
		let achievements: AchievementsDTO[] = [];
		for (let item of entity) {
			achievements.push(AchievementsDTO.fromEntity(item));
		}
		return (achievements);
	}

}

export class StatsDTO {

	public static fromEntity(entity: UserEntity) {
		const stats = new StatsDTO();
		stats.username = entity?.username || '';
		stats.fullname = entity?.fullname || '';
		stats.avatar_url = entity?.avatar_url || '';
		stats.created_at = entity?.created_at || '';
		stats.rating = entity?.rating || 0;
		return (stats);
	}

	username: string = '';
	fullname: string = '';
	avatar_url: string = '';
	created_at: any = '';
	rating: number = 0;
	achievements: AchievementsDTO[] = [];
	history: HistoryDTO[] = [];
	games_played: number = 0;
	games_won: number = 0;
}

export class GameStatsDTO {
	matches: number = 0;
	users: number = 0;
	logins: number = 0;
}
