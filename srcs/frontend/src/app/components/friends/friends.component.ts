import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Router, ParamMap, ActivatedRoute } from '@angular/router';
import { faMagnifyingGlass, IconDefinition } from '@fortawesome/free-solid-svg-icons';
import { BehaviorSubject } from 'rxjs';
import { AlertsService } from 'src/app/alerts/alerts.service';
import { AuthService } from 'src/app/auth/auth.service';
import { UsersOnlineService } from 'src/app/services/users-online.service';
import { FriendsService } from './friends.service';
import { GameHistoryComponent } from './game-history/game-history.component';
import { OnlineGameService } from '../game/game.service';

@Component({
	selector: 'app-friends',
	templateUrl: './friends.component.html',
	styleUrls: ['./friends.component.scss']
})
export class FriendsComponent implements OnInit {

	constructor(
		protected friendsService: FriendsService,
		private authService: AuthService,
		protected router: Router,
		private route: ActivatedRoute,
		private alertService: AlertsService,
		private gameService: OnlineGameService
	) { }

	ngOnInit(): void {
		if (this.router.url == "/home") {
			this.friendsService.selectedUser.next(this.authService.userSubject.value?.username);
		} else {
			this.friendsService.selectedUser.next(null);
		}
		this.friendsService.selectedUser.subscribe(res => {
			this.friendsService.update();
		});
		this.route.paramMap.subscribe((params: ParamMap) => {
			if (this.router.url != "/home") {
				if (params.get('id') == this.authService.userSubject.value?.username)
					this.router.navigate(['/home']);
				else
					this.friendsService.selectedUser.next(params.get('id'));
			}
		})
	}
}
