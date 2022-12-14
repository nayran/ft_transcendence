import { Component, ElementRef, Input, OnChanges, OnDestroy, OnInit, SimpleChanges, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { combineLatest, map, Observable, startWith, Subscription, tap } from 'rxjs';
import { MessageInterface, MessagePaginateInterface } from 'src/app/model/message.interface';
import { RoomInterface, RoomType } from 'src/app/model/room.interface';
import { MemberInterface, MemberRole } from 'src/app/model/member.interface';
import { UserInterface } from 'src/app/model/user.interface';
import { MatDialog } from '@angular/material/dialog';
import { DialogRoomSettingComponent } from '../dialogs/dialog-room-setting/dialog-room-setting.component';
import { MatSelectionListChange } from '@angular/material/list';
import { faStar as fasStar, faGears } from '@fortawesome/free-solid-svg-icons';
import { faStar as farStar } from '@fortawesome/free-regular-svg-icons';
import { OnlineGameService } from '../../game/game.service';
import { FriendsService } from '../../friends/friends.service';
import { ChatService } from '../chat.service';
import { AlertsService } from 'src/app/alerts/alerts.service';

@Component({
  selector: 'app-chat-room',
  templateUrl: './chat-room.component.html',
  styleUrls: ['./chat-room.component.scss'],
})
export class ChatRoomComponent implements OnInit, OnChanges, OnDestroy {

  @Input()
  chatRoom!: RoomInterface;

  @Input()
  myUser!: UserInterface;

  @ViewChild('messagesScroller')
  private messagesScroller!: ElementRef;

  chatMessage: FormControl = new FormControl(null, [Validators.required]);

  faGears = faGears;
  fasStar = fasStar;
  farStar = farStar;

  selectedRoomNulled: RoomInterface = { id: 0, name: '', type: RoomType.Public }

  ownerName!: string;
  members$ = this.chatService.getMembersOfRoom();
  members: MemberInterface[] = [];
  myMember!: MemberInterface;

  selectedMember!: MemberInterface | null;

  subscription1$!: Subscription;
  subscription2$!: Subscription;

  messagesPaginate$: Observable<MessageInterface[]> =
	combineLatest([this.chatService.getMessages(), this.chatService.getAddedMessage().pipe(startWith(null))])
		.pipe(
		map(([allMessages, addedMessage]) => {
			if (addedMessage && addedMessage.room?.id === this.chatRoom?.id &&
			!allMessages.some(m => m.id === addedMessage.id)) {
				allMessages.push(addedMessage);
			}
			const items = allMessages
				.sort((a, b) => new Date(a.created_at ?? 0).getTime() - new Date(b.created_at ?? 0).getTime());
			allMessages = items;
			return allMessages;
		}),
		tap(() => this.scrollToBottom())
		);

  constructor(private chatService: ChatService,
    private gameService: OnlineGameService,
    private friendService: FriendsService,
    public dialog: MatDialog,
    private alertService: AlertsService,) {
  }

  ngOnInit(): void {
    this.chatService.emitGetMembersOfRooms(this.chatRoom?.id);
    this.chatService.emitGetBlockedUsers();
    this.chatService.emitGetBlockerUsers();
    this.subscription2$ = this.members$.subscribe(members => {
      this.members.splice(0);
      let unselect = true;
      members.forEach(member => {
        if (member.role == MemberRole.Owner)
          this.ownerName = member.user.username;
        if (this.selectedMember?.id == member.id) {
          unselect = false;
          this.selectedMember = member;
        }
        if (this.myMember?.id == member?.id) {
          this.myMember = member;
        }
        if (member.user.id != this.myUser.id) {
          if (!this.members.some(thismember => thismember.user.id == member.user.id))
            this.members.push(member);
        }
		if (member && this.myMember?.id != member?.id && this.chatRoom?.id && this.chatRoom.type == RoomType.Direct)
			this.chatService.emitReadRoomMessages(this.chatRoom?.id, member?.id ?? 0);
      });
      if (unselect)
        this.selectedMember = null;
    });
  }

  ngOnDestroy(): void {
	if (this.subscription1$)
    	this.subscription1$.unsubscribe();
	if (this.subscription2$)
    	this.subscription2$.unsubscribe();
  }

  ngOnChanges(): void {
    this.selectedMember = null;
    if (this.chatRoom?.id)
      this.chatService.requestMessages(this.chatRoom?.id);
    this.chatService.emitGetMembersOfRooms(this.chatRoom?.id);
    this.members.splice(0);

    this.chatMessage.setValue("");

    this.subscription1$ = this.chatService.getMyMemberOfRoom(this.chatRoom?.id)
      .subscribe(member => {
        this.myMember = member;
      });
  }

  sendMessage() {
    const now = new Date().toISOString();
    if (this.myMember.muteUntil && this.myMember.muteUntil?.toString() > now) {
      this.alertService.info("You are muted");
    }
    else if (this.chatRoom && this.chatMessage.value) {
      this.chatService.sendMessage(this.chatMessage.value, this.chatRoom).subscribe(
        (response) => {
			if (this.isConversation(this.chatRoom))
				this.chatService.emitMessage(this.chatRoom.id);
			},
			(error) => {
				this.alertService.danger("Message could not be send");
			}
			)
	  this.chatMessage.reset();
	}
  }

  isConversation(room: RoomInterface): boolean {
    return (room.type == RoomType.Direct);
  }

  isOwner(member: MemberInterface): boolean {
    return (member && member.role == MemberRole.Owner);
  }

  isAdmin(member: MemberInterface): boolean {
    return (member && member.role == MemberRole.Administrator);
  }

  scrollToBottom(): void {
    this.messagesScroller.nativeElement.scrollTop =
      this.messagesScroller.nativeElement.scrollHeight;
  }

  canOpenRoomSetting(member: MemberInterface): boolean {
    return ((this.isOwner(member) || this.isAdmin(member)) &&
      !this.isConversation(this.chatRoom));
  }

  isRoomNulled(): boolean {
    return (this.chatRoom.id == -1 || this.chatRoom.name == '__NULLED__');
  }

  onOpenRoomSetting() {
    const dialogRef = this.dialog.open(DialogRoomSettingComponent, {
      data: { room: this.chatRoom }
    });
  }

  onMemberChange(event: MatSelectionListChange) {
    this.selectedMember = event.source.selectedOptions.selected[0].value;
  }

  challenge(username: string) {
    this.gameService.challenge(username);
  }

  profile(username: string) {
    this.friendService.loadUser(username);
  }

  blockUser(userId: number) {
    this.chatService.blockUser(userId);
  }

  unblockUser(userId: number) {
    this.chatService.unblockUser(userId);
  }

  setAsAdmin(member: MemberInterface) {
    this.chatService.setAsAdmin(member.user.id, this.chatRoom.id);
  }

  unsetAdmin(member: MemberInterface) {
    this.chatService.unsetAdmin(member.user.id, this.chatRoom.id);
  }

  displaySetAsAdmin(member: MemberInterface): boolean {
    if (this.myMember.role == MemberRole.Owner || this.myMember.role == MemberRole.Administrator) {
      if (member.role == MemberRole.Administrator || member.role == MemberRole.Owner)
        return (false);
      return (true);
    }
    return (false);
  }
}
