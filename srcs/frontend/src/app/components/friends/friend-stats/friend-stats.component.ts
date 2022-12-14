import { ThisReceiver } from '@angular/compiler';
import { Component } from '@angular/core';
import { BehaviorSubject, min } from 'rxjs';
import { AlertsService } from 'src/app/alerts/alerts.service';
import { FriendsService } from '../friends.service';

@Component({
  selector: 'app-friend-stats',
  templateUrl: './friend-stats.component.html',
  styleUrls: ['./friend-stats.component.scss']
})
export class FriendStatsComponent {
	constructor(
			protected friendsService: FriendsService,
			protected alertService: AlertsService
		) {
		this.rating_image = new BehaviorSubject<string>('');
	 }

	public rating_image: BehaviorSubject<string>;

	  ngOnInit(): void {
		this.friendsService.stats.subscribe(res => {
		  this.rating_image.next(this.friendsService.getRankingImage(this.friendsService.stats.value?.rating));
		});
	  }
}
