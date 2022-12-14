export class HistoryDTO {
	constructor () {};
	user1: string = '';
	user2: string = '';
	user1_avatar_url: string = '';
	user2_avatar_url: string = '';
	score_p1: number = 0;
	score_p2: number = 0;
	winner: string = '';
	is_challenge: boolean = false;
}

export class AchievementsDTO {
	constructor () {};
	achievement: string = '';
	description: string = '';
}

export class StatsDTO {

	constructor (username: string = '') {};
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

