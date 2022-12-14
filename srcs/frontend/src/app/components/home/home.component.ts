import { FriendsService } from './../friends/friends.service';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/auth/auth.service';
import { User } from 'src/app/auth/user.model';
import io from "socket.io-client";
import { UsersOnlineService } from 'src/app/services/users-online.service';
import { UserInterface } from 'src/app/model/user.interface';
import { ChatService } from '../chat/chat.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  myRooms$ = this.chatService.getPublicRooms();
  UsersOnline: UserInterface[] = [];
  currentUser: User | null = null;
  data: any = null;

  constructor(
    private http: HttpClient,
    private friendsService: FriendsService,
    private authService: AuthService,
    protected userOnlineService: UsersOnlineService,
    private chatService: ChatService
  ) { }

  ngOnInit(): void {}

}
