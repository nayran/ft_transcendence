import { Component, Input } from '@angular/core';
import { UsersOnlineService } from 'src/app/services/users-online.service';
import { FriendsService } from '../friends.service';
import { faEllipsisVertical, faTableTennisPaddleBall, faTv, faIdCard, faLock, faUnlock, IconDefinition } from '@fortawesome/free-solid-svg-icons';
import { AuthService } from 'src/app/auth/auth.service';
import { Router } from '@angular/router';
import { OnlineGameService } from '../../game/game.service';

@Component({
	selector: 'app-thumbnail',
	templateUrl: './thumbnail.component.html',
	styleUrls: ['./thumbnail.component.scss']
})
export class ThumbnailComponent {

	constructor(
		protected onlineService: UsersOnlineService,
		protected friendService: FriendsService,
		protected authService: AuthService,
		protected gameService: OnlineGameService,
		protected router: Router
	) { }

	protected icon: IconDefinition[] = [faEllipsisVertical, faTableTennisPaddleBall, faTv, faIdCard, faLock, faUnlock]
	@Input() username: string = '';
	@Input() avatar: string = '';
	@Input() size: string = 'medium';
	@Input() dropdown: boolean = true;
	@Input() light: boolean = false;

	ngOnInit(): void { }

	challenge(player: any) {
		this.gameService.challenge(player);
	}
	
	specFriend(username: string) {
		this.gameService.spec(username);
		this.router.navigate(['/pong']);
	}
}
