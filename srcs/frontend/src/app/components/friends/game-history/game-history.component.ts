import { Component, OnInit } from '@angular/core';
import { FriendsService } from '../friends.service';

@Component({
  selector: 'app-game-history',
  templateUrl: './game-history.component.html',
  styleUrls: ['./game-history.component.scss']
})
export class GameHistoryComponent implements OnInit {

  constructor(protected friendsService: FriendsService) { }
  
  ngOnInit(): void {}

  getScoreClass(winner: string) {
    if (this.friendsService.selectedUser.value == winner)
    {
      return ({'game-won': true});
    }
    return ({'game-lost': true});
  }

  
}
