import { Component } from '@angular/core';
import { FriendsService } from '../friends.service';

@Component({
  selector: 'app-achievements',
  templateUrl: './achievements.component.html',
  styleUrls: ['./achievements.component.scss']
})
export class AchievementsComponent {
	constructor(protected friendsService: FriendsService) { }

}
