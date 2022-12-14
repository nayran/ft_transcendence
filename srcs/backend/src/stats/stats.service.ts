import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { Brackets, Repository } from 'typeorm';
import { GameEntity } from 'src/game/game.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from 'src/users/users.entity';
import { AchievementsEntity } from './achievements.entity';
import { UsersService } from 'src/users/users.service';
import { FriendsEntity } from 'src/friends/friends.entity';
import { AchievementsDTO, GameStatsDTO, HistoryDTO, StatsDTO } from './stats.dto';

@Injectable()
export class StatsService {

  constructor(
    @InjectRepository(GameEntity)
    private gameRepository: Repository<GameEntity>,
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
    @InjectRepository(FriendsEntity)
    private friendsRepository: Repository<FriendsEntity>,
    @InjectRepository(AchievementsEntity)
    private achievementsRepository: Repository<AchievementsEntity>,
    @Inject(forwardRef(() => UsersService))
    private UsersService: UsersService
  ) {
    this.achievements["g1"] = "play 1 game";
    this.achievements["g2"] = "play 3 games";
    this.achievements["g3"] = "play 5 games";
    this.achievements["g4"] = "win 1 game";
    this.achievements["g5"] = "win 3 games";
    this.achievements["g6"] = "win 5 games";
    this.achievements["g7"] = "win 2 games in a row";
    this.achievements["g8"] = "win 3 games in a row";
    this.achievements["g9"] = "win 5 games in a row";
    this.achievements["f1"] = "make 1 friend";
    this.achievements["f2"] = "make 3 friends";
    this.achievements["f3"] = "make 5 friends";
    this.achievements["l1"] = "login 3 times";
    this.achievements["l2"] = "login 5 times";
    this.achievements["l3"] = "login 10 times";
    this.achievements["r1"] = "reach rating 850";
    this.achievements["r2"] = "reach rating 900";
    this.achievements["r3"] = "reach rating 1000";
  }

  private achievements: { [name: string]: string; } = {};


  async getHistory(username: string): Promise<HistoryDTO[]> {

    let res = await this.gameRepository.find({
      relations: ['idP1', 'idP2', 'winner'],
      where: [{ idP1: { username: username } },
      { idP2: { username: username } }],
    })
    return (HistoryDTO.fromEntities(res));
  }

  /*
  ** Achievements, History, Stats, Info
  */
  async getUserStats(username: string): Promise<StatsDTO> {
    let user = await this.userRepository.findOneBy({ username: username });
    let dto: StatsDTO = StatsDTO.fromEntity(user);
    if (user) {
      dto.achievements = await this.getAchievements(user.username);
      dto.history = await this.getHistory(user.username);
      dto.games_played = dto.history.length;
      dto.games_won = 0;
      for (let i = 0; i < dto.history.length; i++) {
        if (dto.history[i].winner == user.username) { dto.games_won++; }
      }
    }
    return (dto);
  }

  _expectedProbability(ratingA: number, ratingB: number): number {
    return (1.0 / (1.0 + Math.pow(10, ((ratingB - ratingA) / 400))));
  }

  _newRating(ratingA: number, ratingB: number, scoreA: number): number {
    return Math.round(ratingA + (32 * (scoreA - this._expectedProbability(ratingA, ratingB))));
  }

  async updateRating(game: GameEntity) {
	if (game)
	{
		let user1 = game.idP1;
		let user2 = game.idP2;
		if (user1 && user2)
		{
			let tmpU1 = this._newRating(user1.rating, user2.rating, (game.winner.id == game.idP1.id ? 1 : 0));
			let tmpU2 = this._newRating(user2.rating, user1.rating, (game.winner.id == game.idP2.id ? 1 : 0));
			user1.rating = (tmpU1 > 100) ? tmpU1 : 100;
			user2.rating = (tmpU2 > 100) ? tmpU2 : 100;
			await user1.save();
			await user2.save();
			await this.ratingAchievements(user1.id);
			await this.ratingAchievements(user2.id);
		}
	}
  }

  async getAchievements(username: string): Promise<AchievementsDTO[]> {
    const user_id: number = await this.UsersService.getIdByUsername(username);
    if (user_id) {
      const achievements = await this.achievementsRepository
        .createQueryBuilder('f')
        .leftJoinAndSelect("f.user", "user")
        .where('user.id = :v1', { v1: user_id })
        .getMany();
      return (AchievementsDTO.fromEntities(achievements));
    }
    return [];
  }

  async addAchievement(user_id: number, achievement: string) {
    const query = this.achievementsRepository
      .createQueryBuilder('f')
	  .leftJoin('f.user', 'user')
      .where('user.id = :v1', { v1: user_id })
	  .andWhere('f.achievement = :v2', { v2: achievement })
    let exists = await query.getMany();
    if (exists.length) {
      return null;
    } else {
      let friendship: AchievementsEntity = this.achievementsRepository.create({
        user: await this.UsersService.getUserByID(user_id),
        achievement: achievement,
        description: this.achievements[achievement]
      });
      const res = await this.achievementsRepository.save(friendship);
      return (res);
    }
  }

  async gameAchievements(user_id: number) {
    const games: number = await this.gameRepository
      .createQueryBuilder('f')
      .where('f.idP1 = :v1', { v1: user_id })
	  .orWhere('f.idP2 = :v2', { v2: user_id })
      .getCount();
    if (games >= 1) { await this.addAchievement(user_id, "g1") };
    if (games >= 3) { await this.addAchievement(user_id, "g2") };
    if (games >= 5) { await this.addAchievement(user_id, "g3") };
    const wins: number = await this.gameRepository
      .createQueryBuilder('f')
      .andWhere('f.winner = :v2', { v2: user_id })
      .getCount();
    if (wins >= 1) { await this.addAchievement(user_id, "g4") };
    if (wins >= 3) { await this.addAchievement(user_id, "g5") };
    if (wins >= 5) { await this.addAchievement(user_id, "g6") };
  }

  async friendsAchievements(user_id: number) {
    const friends: number = await this.friendsRepository
      .createQueryBuilder('f')
	  .leftJoin('f.user1', 'user1')
	  .leftJoin('f.user2', 'user2')
      .where(
		new Brackets(qb => {
			qb.where('user1 = :v1', { v1: user_id })
			.orWhere('user2 = :v2', { v2: user_id })
		}))
	  .andWhere('f.accepted = :accepted', {accepted: true})
      .getCount();
    if (friends >= 1) { this.addAchievement(user_id, "f1") };
    if (friends >= 3) { this.addAchievement(user_id, "f2") };
    if (friends >= 5) { this.addAchievement(user_id, "f3") };
  }

  async ratingAchievements(user_id: number) {
    const user: UserEntity = await this.UsersService.getUserByID(user_id);
    if (user) {
      if (user.rating >= 850) { this.addAchievement(user_id, "r1") };
      if (user.rating >= 900) { this.addAchievement(user_id, "r2") };
	  if (user.rating >= 1000) { this.addAchievement(user_id, "r3") };
    }
  }

  async loginAchievements(user_id: number) {
    const user: UserEntity = await this.UsersService.getUserByID(user_id);
    if (user) {
      if (user.login_count >= 3) { this.addAchievement(user_id, "l1") };
      if (user.login_count >= 5) { this.addAchievement(user_id, "l2") };
      if (user.login_count >= 10) { this.addAchievement(user_id, "l3") };
    }
  }

  async getLadderRanking(): Promise<any[]> {
    let users = await this.userRepository.createQueryBuilder('u')
      .select(['u.username', 'u.avatar_url', 'u.rating'])
      .orderBy('u.rating', 'DESC')
      .getMany();
    return users;
  }

  async getGameStats(): Promise<GameStatsDTO> {
    let users = await this.userRepository.createQueryBuilder('u')
      .select('SUM(u.login_count)', 'logins')
	  .addSelect('COUNT(*)', 'count')
      .getRawOne();
	let stats: GameStatsDTO = new GameStatsDTO;
	stats.logins = +users.logins;
	stats.users = +users.count;
    let games = await this.gameRepository.createQueryBuilder('u')
	  .select('COUNT(*)', 'count')
      .getRawOne();
	stats.matches = +games.count;
    return stats;
  }

}
