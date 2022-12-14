import { Component, OnChanges, OnDestroy, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { MatSelectionList, MatSelectionListChange } from '@angular/material/list';
import { PageEvent } from '@angular/material/paginator';
import { Subscription, tap } from 'rxjs';
import { RoomInterface, RoomType } from 'src/app/model/room.interface';
import { MatDialog } from '@angular/material/dialog';
import { faKey, faUserGroup, faUsers, faComments, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import { UserService } from 'src/app/services/user.service';
import { UserInterface } from 'src/app/model/user.interface';
import { ChatService } from './chat.service';
import { AlertsService } from 'src/app/alerts/alerts.service';
import { DialogNewRoomComponent } from './dialogs/dialog-new-room/dialog-new-room.component';
import { DialogPasswordComponent } from './dialogs/dialog-password/dialog-password.component';
import { DialogSearchUserComponent } from './dialogs/dialog-search-user/dialog-search-user.component';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss']
})
export class ChatComponent implements OnInit, OnDestroy {

  @ViewChild('roomsAvailable')
  roomsAvailable!: MatSelectionList;

  @ViewChild('listDirectRoom')
  listDR!: MatSelectionList;

  @ViewChild('listChatRoom')
  listCR!: MatSelectionList;


  unreadRooms$ = this.chatService.getUnreadRooms();
  unreadRooms: number[] = [];

  myDirectRooms$ = this.chatService.getMyDirectRoomsPaginate();
  myChatRooms$ = this.chatService.getMyChatRoomsPaginate();

  publicRooms$ = this.chatService.getPublicRooms();

  allMyRooms$ = this.chatService.getAllMyRooms();
  allMyRooms: RoomInterface[] = [];

  allPublicRooms$ = this.chatService.getAllPublicRooms();
  allPublicRooms: RoomInterface[] = [];

  myUser$ = this.userService.getMyUser();
  myUser!: UserInterface;

  subscription1$!: Subscription;
  subscription2$!: Subscription;
  subscription3$!: Subscription;

  selectedRoomNulled: RoomInterface = { id: 0, name: '', type: RoomType.Public }
  selectedRoom: RoomInterface = this.selectedRoomNulled;
  selectedPublicRoom: RoomInterface = this.selectedRoomNulled;

  faKey = faKey;
  faComments = faComments;
  faUserGroup = faUserGroup;
  faUsers = faUsers;
  faEyeSlash = faEyeSlash;
  
  constructor(
	  private chatService: ChatService,
	  public dialog: MatDialog,
	  private userService: UserService,
	  private alertService: AlertsService) {
	}
	
	async ngOnInit() {
		this.chatService.emitPaginateRooms(10, 0);
		this.chatService.emitPaginatePublicRooms(10, 0);
		this.chatService.emitGetAllMyRooms();
		this.chatService.emitGetPublicRooms();
		
		this.subscription1$ = this.myUser$.subscribe(user => {
			this.myUser = user;
		});
		
		this.subscription2$ = this.allMyRooms$.subscribe(rooms => {
			this.allMyRooms = rooms;
			this.updateRoom();
		});
		
		this.subscription3$ = this.allPublicRooms$.subscribe(rooms => {
			this.allPublicRooms = rooms;
			if (!rooms.find(room => room.id == this.selectedPublicRoom.id))
			this.selectedPublicRoom = this.selectedRoomNulled;
		});
		
		this.unreadRooms$.subscribe(rooms => {
			this.unreadRooms = rooms;
		})
		this.chatService.emitGetUnreadRooms();
		
	}
	
	updateRoom() {
		let room;
		let tmp = this.allMyRooms || [];
		if (room = tmp.find(room => room.id == this.selectedRoom.id))
      this.selectedRoom = room;
    else
      this.selectedRoom = this.selectedRoomNulled;
  }

  ngOnDestroy(): void {
	if (this.subscription1$)
    	this.subscription1$.unsubscribe();
	if (this.subscription2$)
    	this.subscription2$.unsubscribe();
  }

  selectRoom(room: RoomInterface) {
    this.selectedRoom = room;
	if (!this.isSelectRoomNull())
	{
		this.unreadRooms = this.unreadRooms.filter((val) => val != room.id );
	}
  }

  selectPublicRoom(room: RoomInterface) {
    this.selectedPublicRoom = room;
  }

  onSelectRoom(event: MatSelectionListChange) {
    this.selectedRoom = event.source.selectedOptions.selected[0].value;
  }

  onSelectPublicRoom(event: MatSelectionListChange) {
    this.selectedPublicRoom = event.source.selectedOptions.selected[0].value;
  }

  onPaginateRooms(pageEvent: PageEvent) {
    this.chatService.emitPaginateRooms(pageEvent.pageSize, pageEvent.pageIndex);
  }

  onPaginatePublicRooms(pageEvent: PageEvent) {
    this.chatService.emitPaginatePublicRooms(pageEvent.pageSize, pageEvent.pageIndex);
  }

  openDialogNewRoom() {
    const dialogRef = this.dialog.open(DialogNewRoomComponent);

    dialogRef.afterClosed().subscribe(ret => {
      if (ret) {
        this.chatService.emitGetAllMyRooms();
        this.allMyRooms$.subscribe(rooms => {
          let selectedRoom: RoomInterface | undefined;
          if (selectedRoom = rooms.find(room => room.name == ret.data.name)) {
            this.selectedRoom = selectedRoom;
            this.allMyRooms.push(this.selectedRoom);
          }
        });
      }
    });
  }

  openDialogPassword() {
    const dialogRef = this.dialog.open(DialogPasswordComponent, {
      data: { room: this.selectedPublicRoom }
    });
  }

  async onJoinRoom(selectedPublicRoom: RoomInterface | null) {

    if (selectedPublicRoom != null) {
      if (this.allMyRooms.find(room => room.id == selectedPublicRoom.id)) {
        this.selectRoom(this.selectedPublicRoom);
        this.alertService.info("You are already a member of this chat room");
        this.selectPublicRoom(this.selectedRoomNulled);
        return;
      }
      if (this.isBanned(selectedPublicRoom)) {
        this.alertService.warning("You are banned from this chat room.");
        this.selectPublicRoom(this.selectedRoomNulled);
        return;
      }
      if (selectedPublicRoom.type == RoomType.Protected) {
        this.openDialogPassword();
      }
      else {
        this.chatService.joinRoom(selectedPublicRoom).subscribe(
          (response) => {
            this.alertService.success("You have successfully joined the chat room");
            this.allMyRooms.push(selectedPublicRoom);
            this.selectRoom(selectedPublicRoom);
            this.selectPublicRoom(this.selectedRoomNulled);
          },
          (error) => {
            this.alertService.danger("We could not add you to the chat room");
          }
        )
      }
    }
  }

  onLeaveRoom(selectedRoom: RoomInterface) {
    if (selectedRoom != this.selectedRoomNulled) {
      this.chatService.leaveRoom(selectedRoom);
      this.nulledSelectedRoom();
    }
  }

  isProtected(type: RoomType) {
    return type == RoomType.Protected;
  }

  isConversation(room: RoomInterface) {
    return room.type == RoomType.Direct;
  }

  isPrivate(room: RoomType) {
    return room == RoomType.Private;
  }

  isPublic(room: RoomType) {
    return room == RoomType.Public;
  }

  async onSearchUser() {
    const dialogRef = this.dialog.open(DialogSearchUserComponent);

    dialogRef.afterClosed().subscribe(ret => {
      let selectedRoom: RoomInterface | undefined;
      if (ret) {
        if (ret.data)
          selectedRoom = this.allMyRooms.find(room => room.id == ret.data.id || room.name == ret.data.name)
        if (selectedRoom)
          this.selectedRoom = selectedRoom;
      }
    });
  }

  nulledSelectedRoom() {
    this.selectedRoom = this.selectedRoomNulled;
    this.selectedPublicRoom = this.selectedRoomNulled;
  }

  isSelectRoomNull() {
    return this.selectedRoom === this.selectedRoomNulled;
  }

  selectPublicRoomNull() {
    return this.selectedPublicRoom === this.selectedRoomNulled;
  }

  isBanned(selectedRoom: RoomInterface): boolean {
    const room = this.allPublicRooms.find(room => room.id == selectedRoom.id);
    if (room) {
      const member = room.members?.find(member => member.user?.id == this.myUser.id);
      if (member) {
        const now = new Date().toISOString();
        if (member.banUntil && member.banUntil?.toString() > now) {
          return (true);
        }
      }
    }
    return (false);
  }

  isUnreadMessage(room: RoomInterface): boolean {
	if (!(this.isSelectRoomNull()))
		return (this.unreadRooms.includes(room.id));
	return (false);
	}


}

