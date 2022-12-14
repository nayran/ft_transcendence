import { Component } from '@angular/core';
import { FriendsService } from '../friends.service';

@Component({
  selector: 'app-game-ranking',
  templateUrl: './game-ranking.component.html',
  styleUrls: ['./game-ranking.component.scss']
})
export class GameRankingComponent {
	constructor(protected friendsService: FriendsService) {};

	getOrdinal(i: number): string {
		if (i == 1) { return 'st'; }
		else if (i == 2) { return 'nd'; }
		else if (i == 3) { return 'rd'; }
		else { return 'th'; };
	}

}
