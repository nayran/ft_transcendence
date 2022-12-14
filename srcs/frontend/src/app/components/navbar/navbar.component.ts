import { Component, OnInit } from '@angular/core';
import { faGears, faHome, faTableTennis, faComments, faStar, faRightFromBracket, IconDefinition } from '@fortawesome/free-solid-svg-icons';
import { AuthService } from 'src/app/auth/auth.service';
import { UserService } from 'src/app/services/user.service';
import { BehaviorSubject } from 'rxjs';
import { User } from 'src/app/auth/user.model';
import { ChatService } from '../chat/chat.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit {

  public userSubject: BehaviorSubject<User | null>;

  constructor(
    private authService: AuthService,
    private userService: UserService,
    private chatService: ChatService
  ) {
    this.userSubject = this.authService.userSubject;
  }

  icons: IconDefinition[] = [
    faHome,
    faTableTennis,
    faComments,
    faStar,
    faGears,
    faRightFromBracket,
  ];

  logout() {
    this.chatService.disconnect();
    this.authService.logout();
  }

  ngOnInit(): void {
    if (!this.chatService.isSocketActive) {
      this.chatService.connect();
    }
  }
};