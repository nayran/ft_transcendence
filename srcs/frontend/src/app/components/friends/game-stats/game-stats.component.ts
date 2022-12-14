import { Component } from '@angular/core';
import { UsersOnlineService } from 'src/app/services/users-online.service';
import { FriendsService } from '../friends.service';

@Component({
  selector: 'app-game-stats',
  templateUrl: './game-stats.component.html',
  styleUrls: ['./game-stats.component.scss']
})
export class GameStatsComponent {
	constructor(
		protected friendsService: FriendsService,
		protected onlineService: UsersOnlineService
	) {}
}
