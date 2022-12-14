import { Component } from '@angular/core';
import { AuthService } from 'src/app/auth/auth.service';
import { FriendsService } from '../friends.service';

@Component({
  selector: 'app-friend-profile',
  templateUrl: './friend-profile.component.html',
  styleUrls: ['./friend-profile.component.scss']
})
export class FriendProfileComponent {

	constructor(
		protected friendsService: FriendsService,
		protected authService: AuthService) { }

}
