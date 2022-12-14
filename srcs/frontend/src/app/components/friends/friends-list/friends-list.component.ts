import { ChatSocket } from 'src/app/components/chat/chat-socket';
import { UserI } from './../../../services/users-online.service';
import { Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { IconDefinition, faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons';
import { FriendsService } from '../friends.service';
import { OnlineGameService } from '../../game/game.service';
import { UsersOnlineService } from 'src/app/services/users-online.service';
import io from "socket.io-client";

@Component({
  selector: 'app-friends-list',
  templateUrl: './friends-list.component.html',
  styleUrls: ['./friends-list.component.scss']
})
export class FriendsListComponent implements OnInit {

  constructor(protected friendsService: FriendsService,
	protected gameService: OnlineGameService,
	protected router: Router, 
	protected onlineService: UsersOnlineService
	) { }
  searchIcon: IconDefinition = faMagnifyingGlass;
  socket: any;

  ngOnInit(): void { }

  updateUserList(event: any) {
    const search: string = event.target.value;
    this.friendsService.filterUserList(search);
  }

  challenge(player: any) {
    this.gameService.challenge(player);
  }
}
