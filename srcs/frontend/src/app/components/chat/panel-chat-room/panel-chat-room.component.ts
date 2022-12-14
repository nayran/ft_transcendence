import { Component, Input, OnChanges, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { RoomInterface } from 'src/app/model/room.interface';
import { MemberInterface, MemberRole } from 'src/app/model/member.interface';
import { UserInterface } from 'src/app/model/user.interface';
import { MatDialog } from '@angular/material/dialog';
import { faStar as fasStar, faTableTennisPaddleBall, faAddressCard, faLock, faUnlock } from '@fortawesome/free-solid-svg-icons';
import { faStar as farStar } from '@fortawesome/free-regular-svg-icons';
import { FriendsService } from '../../friends/friends.service';
import { ChatService } from '../chat.service';
import { OnlineGameService } from '../../game/game.service';
import { AlertsService } from 'src/app/alerts/alerts.service';

@Component({
  selector: 'app-panel-chat-room',
  templateUrl: './panel-chat-room.component.html',
  styleUrls: ['./panel-chat-room.component.scss']
})
export class PanelChatRoomComponent implements OnInit, OnChanges, OnDestroy {

  @Input()
  chatRoom!: RoomInterface;

  @Input()
  myUser!: UserInterface;

  @Input()
  selectedMember!: MemberInterface;

  @Input()
  myMember!: MemberInterface;

  amIOwner = false;
  amIAdmin = false;

  blockedUsers$ = this.chatService.getBlockedUsers();

  faLock = faLock;
  faPaddle = faTableTennisPaddleBall;
  faProfile = faAddressCard;
  farStar = farStar;
  fasStar = fasStar;
  faUnlock = faUnlock;

  isAdmin = false;
  isBlocked = false;
  isOwner = false;

  subscription1$!: Subscription;

  constructor(private chatService: ChatService,
    private gameService: OnlineGameService,
    private friendService: FriendsService,
    public dialog: MatDialog,
    private alertService: AlertsService) {
    this.chatService.emitGetBlockedUsers();
  }

  ngOnInit(): void {
    if (this.myMember.role == MemberRole.Owner)
      this.amIOwner = true;
    else if (this.myMember.role == MemberRole.Administrator)
      this.amIAdmin = true;

    this.subscription1$ = this.blockedUsers$.subscribe(blockedUsers => {
      blockedUsers.forEach(user => {
        if (user == this.selectedMember.user.id)
          this.isBlocked = true;
      });
    });
  }

  ngOnDestroy(): void {
	if (this.subscription1$)
    	this.subscription1$.unsubscribe();
	}

  ngOnChanges() {
    this.chatService.emitGetBlockedUsers();
    this.isOwner = this.selectedMember.role == MemberRole.Owner ? true : false;
    this.isAdmin = this.selectedMember.role == MemberRole.Administrator ? true : false;
    this.amIOwner = this.myMember.role == MemberRole.Owner ? true : false;
    this.amIAdmin = this.myMember.role == MemberRole.Administrator ? true : false;
  }

  blockUser(member: MemberInterface) {
    if (member) {
      this.chatService.blockUser(member.user.id).subscribe(
        (response) => {
          this.alertService.success(member.user.username + " has been successfully blocked");
          this.isBlocked = true;
        },
        (error) => {
          this.alertService.danger("Block could not be configured");
        }
      )
    }
  }

  challenge(username: string) {
    this.gameService.challenge(username);
  }

  displaySetAsAdmin(member: MemberInterface) {
    if (this.myMember?.role == MemberRole.Owner ||
      this.myMember?.role == MemberRole.Administrator) {
      if (member.role == MemberRole.Administrator || member.role == MemberRole.Owner)
        return (false);
      return (true);
    }
    return (false);
  }

  isMyMember() {
    return (this.myMember.id == this.selectedMember.id);
  }

  profile(username: string) {
    this.friendService.loadUser(username);
  }

  setAsAdmin(member: MemberInterface) {
    this.chatService.setAsAdmin(member.user.id, this.chatRoom.id).subscribe(
      (response) => {
        this.alertService.success(member.user.username + " is now an administrator");
        this.isAdmin = true;
      },
      (error) => {
        this.alertService.danger("Admin role could not be configured");
      }
    )
  }

  setBan(duration: string) {
    let banTime = new Date();
    if (this.selectedMember.id) {
	  if (duration == "1min")
        banTime.setMinutes(banTime.getMinutes() + 1);
      else if (duration == "5min")
        banTime.setMinutes(banTime.getMinutes() + 5);
      else if (duration == "1h")
        banTime.setHours(banTime.getHours() + 1);
      else if (duration == "24h")
        banTime.setHours(banTime.getHours() + 24);
      this.chatService.setBan(this.selectedMember.id, this.chatRoom.id, banTime).subscribe(
        (response) => {
          this.alertService.success(this.selectedMember.user.username + " has been banned for " + duration);
          this.chatService.emitGetMembersOfRooms(this.chatRoom.id);
        },
        (error) => {
          this.alertService.danger("Ban could not be configured");
        }
      )
    }
  }

  setMute(duration: string) {
    let muteTime = new Date();
    if (this.selectedMember.id && duration) {
	  if (duration == "1min")
		muteTime.setMinutes(muteTime.getMinutes() + 1);
      else if (duration == "5min")
        muteTime.setMinutes(muteTime.getMinutes() + 5);
      else if (duration == "1h")
        muteTime.setHours(muteTime.getHours() + 1);
      else if (duration == "24h")
        muteTime.setHours(muteTime.getHours() + 24);
      this.chatService.setMute(this.selectedMember.id, this.chatRoom.id, muteTime).subscribe(
        (response) => {
          this.alertService.success(this.selectedMember.user.username + " has been muted for " + duration);
        },
        (error) => {
          this.alertService.danger("Mute could not be configured");
        }
      )
    }
  }

  unblockUser(member: MemberInterface) {
    if (member) {
      this.chatService.unblockUser(member.user.id).subscribe(
        (response) => {
          this.alertService.success(member.user.username + " has been successfully unblocked");
          this.isBlocked = false;
        },
        (error) => {
          this.alertService.danger("Unblock could not be configured");
        }
      )
    }
  }

  unsetAdmin(member: MemberInterface) {
    this.chatService.unsetAdmin(member.user.id, this.chatRoom.id).subscribe(
      (response) => {
        this.alertService.success(member.user.username + " has been remove as administrator");
        this.isAdmin = false;
      },
      (error) => {
        this.alertService.danger("Admin role could not be configured");
      }
    )
  }
}
