import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { AlertsService } from 'src/app/alerts/alerts.service';
import { AuthService } from 'src/app/auth/auth.service';
import { GameStatsDTO, StatsDTO } from './stats.dto';

@Injectable({
  providedIn: 'root'
})
export class FriendsService {

  constructor(
    private http: HttpClient,
    private alertService: AlertsService,
    private authService: AuthService,
    private router: Router
  ) {
    this.selectedUser = new BehaviorSubject<string | undefined | null>(null);
    this.gamesPlayed = new BehaviorSubject<number>(0);
    this.gamesWon = new BehaviorSubject<number>(0);
    this.userInfo = new BehaviorSubject<any | null>(null);
    this.userList = new BehaviorSubject<any[]>([]);
    this.friendsList = new BehaviorSubject<any[]>([]);
    this.requestsList = new BehaviorSubject<any[]>([]);
    this.rankingList = new BehaviorSubject<any[]>([]);
    this.friendStatus = new BehaviorSubject<number>(0);
    this.achievements = new BehaviorSubject<any[]>([]);
    this.stats = new BehaviorSubject<StatsDTO | null>(null);
	this.gameStats = new BehaviorSubject<GameStatsDTO>({matches: 0, logins: 0, users: 0});
	this.friendBlocked = new BehaviorSubject<boolean>(false);

}

  public selectedUser: BehaviorSubject<string | undefined | null>;
  public history: any[] = [];
  public gamesPlayed: BehaviorSubject<number>;
  public gamesWon: BehaviorSubject<number>;
  public friendStatus: BehaviorSubject<number>;
  public userInfo: BehaviorSubject<any | null>;
  public userList: BehaviorSubject<any[]>;
  public friendsList: BehaviorSubject<any[]>;
  public requestsList: BehaviorSubject<any[]>;
  public achievements: BehaviorSubject<any[]>;
  public stats: BehaviorSubject<StatsDTO | null>;
  public rankingList: BehaviorSubject<any[]>;
  public gameStats: BehaviorSubject<GameStatsDTO>;
  public friendBlocked: BehaviorSubject<boolean>;


  ngOnInit(): void {}

  loadUser(username: string) {
    this.selectedUser.next(username);
    if (username == this.authService.userSubject.value?.username)
      this.router.navigate(['/home']);
    else
      this.router.navigate(['/friends', username]);
  }

  getUserStats(): Observable<StatsDTO> {
    return this.http.get<StatsDTO>('/backend/stats/' + this.selectedUser.value, { withCredentials: true });
  }

  getGameStats(): Observable<GameStatsDTO> {
    return this.http.get<GameStatsDTO>('/backend/stats/gamestats', { withCredentials: true });
  }

  getHistory(): Observable<any> {
    return this.http.get('/backend/stats/history/' + this.selectedUser.value, { withCredentials: true });
  }

  getAchievements(): Observable<any> {
    return this.http.get('/backend/stats/achievements/' + this.selectedUser.value, { withCredentials: true });
  }

  getUserInfo(): Observable<any> {
    return this.http.get('/backend/stats/userinfo/' + this.selectedUser.value, { withCredentials: true });
  }

  getFriendBlocked(): Observable<boolean> {
    return this.http.get<boolean>('/backend/friends/isblocked/' + this.selectedUser.value, { withCredentials: true });
  }
  
  setFriendBlocked(): Observable<boolean> {
    return this.http.post<boolean>('/backend/friends/block/' + this.selectedUser.value, { withCredentials: true });
  }

  setFriendUnblocked(): Observable<boolean> {
    return this.http.post<boolean>('/backend/friends/unblock/' + this.selectedUser.value, { withCredentials: true });
  }

  getStatus(username: string) { }

  setStatus(username: string, status: string) { }

  getUserList(filter: string): Observable<any> {
    return this.http.get('/backend/friends/searchusers/' + filter, { withCredentials: true });
  }

  getRequestsList(): Observable<any> {
    return this.http.get('/backend/friends/getrequests/', { withCredentials: true });
  }

  getFriendsList(): Observable<any> {
    return this.http.get('/backend/friends/getfriends/', { withCredentials: true });
  }

  getRankingList(): Observable<any> {
    return this.http.get('/backend/stats/ranking', { withCredentials: true });
  }

  getFriendshipStatus(username: any): Observable<any> {
    return this.http.get('/backend/friends/friendshipstatus/' + username, { withCredentials: true });
  }

  requestFriendship(username: string): Observable<any> {
    return this.http.post('/backend/friends/requestfriendship/' + username, { withCredentials: true });
  }

  cancelFriendship(username: string): Observable<any> {
    return this.http.post('/backend/friends/removefriendship/' + username, { withCredentials: true });
  }

  confirmFriendship(username: string): Observable<any> {
    return this.http.post('/backend/friends/acceptfriendship/' + username, { withCredentials: true });
  }


  getRankingImage(rating: number = 0): string {
    let max_rank = 2000;
    let min_rank = 400;
    let badges = 23;
    if (!rating) { rating = this.stats.value?.rating || 0 }
    if (rating <= min_rank) { rating = min_rank };
    if (rating >= max_rank) { rating = max_rank };

    rating = Math.floor((rating - min_rank) / ((max_rank - min_rank) / badges)) + 1;
    return ('/assets/images/ranking/' + rating + '.png');
  }

  async acceptFriendship(username: string = '') {
    if (username == '') { username = this.selectedUser.value || '' };
    this.confirmFriendship(username).subscribe((res) => {
      if ((res.status == 3)) { this.alertService.success("friendship accepted"); }
      else { this.alertService.warning("friendship could not be accepted"); }
      this.update();
    });
  }

  async addFriendship() {
    this.requestFriendship(this.selectedUser.value || '').subscribe((res) => {
      if ((res.status == 4)) { this.alertService.success(res.message); }
      else { this.alertService.warning(res.message); }
      this.update();
    });
  }

  async delFriendship(username: string = '') {
    if (username == '') { username = this.selectedUser.value || '' };
    this.cancelFriendship(username).subscribe((res) => {
      if ((res.status == 0)) { this.alertService.success(res.message); }
      else { this.alertService.warning('friendship could not be cancelled'); }
      this.update();
    });
  }

  async blockUser() {
    this.setFriendBlocked().subscribe((res) => {
      if (res) { this.alertService.success("User blocked"); }
      else { this.alertService.warning("user could not be blocked"); }
      this.update();
    });
  }

  async unblockUser() {
    this.setFriendUnblocked().subscribe((res) => {
      if (res) { this.alertService.success("User unblocked"); }
      else { this.alertService.warning("user could not be unblocked"); }
      this.update();
    });
  }

  async update() {

    await this.updateFriendsList();
    await this.updateRequestsList();

    if (this.selectedUser.value) {
      await this.updateUserStats();
      await this.updateFriendshipStatus();
	  await this.updateFriendBlocked();
      if (this.selectedUser.value == this.authService.userSubject.value?.username)
	  {
        await this.updateRanking();
	    await this.updateGameStats();  
	  }
    }
  }

  async updateFriendBlocked() {
    this.getFriendBlocked().subscribe((res: boolean) => {
      this.friendBlocked.next(res);
    })
  }

  async updateGameStats() {
    this.getGameStats().subscribe((res: GameStatsDTO) => {
      this.gameStats.next(res);
    })
  }

  async updateUserStats() {
    this.getUserStats().subscribe((res: StatsDTO) => {
      this.stats.next(res);
      if (!(res.username)) { this.selectedUser.next(null); }
    })
  }

  async updateFriendshipStatus() {
    this.getFriendshipStatus(this.selectedUser.value).subscribe((res: any) => {
      this.friendStatus.next(res.status);
    })
  }

  async filterUserList(filter: string) {
    if (filter.length < 3) {
      this.userList.next([]);
      return;
    }
    this.getUserList(filter).subscribe((res: any[]) => {
      this.userList.next(res);
    })
  }

  async updateFriendsList() {
    this.getFriendsList().subscribe((res: any[]) => {
      this.friendsList.next(res);
    })
  }

  async updateRequestsList() {
    this.getRequestsList().subscribe((res: any[]) => {
      this.requestsList.next(res);
    })
  }

  async updateRanking() {
    this.getRankingList().subscribe((res: any[]) => {
      this.rankingList.next(res);
    })
  }


}
