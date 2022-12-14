import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { debounceTime, finalize, Subscription, switchMap, tap } from 'rxjs';
import { AuthService } from 'src/app/auth/auth.service';
import { RoomInterface, RoomType } from 'src/app/model/room.interface';
import { UserService } from 'src/app/services/user.service';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { UserInterface } from 'src/app/model/user.interface';
import { ChatService } from '../../chat.service';
import { AlertsService } from 'src/app/alerts/alerts.service';

@Component({
  selector: 'app-dialog-search-user',
  templateUrl: './dialog-search-user.component.html',
  styleUrls: ['./dialog-search-user.component.scss']
})
export class DialogSearchUserComponent implements OnInit, OnDestroy {

  disabledChatButton = true;

  filteredUsers!: any;

  isLoading = false;

  myRooms$ = this.chatService.getAllMyRooms();
  myRooms: RoomInterface[] = [];

  myUser$ = this.userService.getMyUser();
  myUser!: UserInterface;

  searchUsersCtrl = new FormControl();

  subscription1$!: Subscription;
  subscription2$!: Subscription;
  subscription3$!: Subscription;
  subscription4$!: Subscription;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private userService: UserService,
    protected chatService: ChatService,
    private authService: AuthService,
    private dialogRef: MatDialogRef<DialogSearchUserComponent>,
    private alertService: AlertsService) {
  }

  async ngOnInit() {

    this.chatService.emitGetAllMyRooms();
    this.subscription1$ = this.authService.getLogoutStatus.subscribe((res) => {
      if (res == true)
        this.dialogRef.close();
    });

    this.subscription2$ = this.myUser$.subscribe(user => {
      this.myUser = user;
    });

    this.subscription3$ = this.myRooms$.subscribe(rooms => {
      this.myRooms = rooms;
    });

    this.subscription4$ = this.searchUsersCtrl.valueChanges
      .pipe(
        debounceTime(500),
        tap(() => {
          this.filteredUsers = [];
          this.isLoading = true;
        }),
        switchMap(value => this.chatService.getUserList(value)
          .pipe(
            finalize(() => {
              this.isLoading = false;
            }),
          )
        )
      )
      .subscribe(res => {
        if (res == undefined) {
          this.filteredUsers = [];
        }
        else {
          this.filteredUsers = res;
        }
      });
  }

  ngOnDestroy(): void {
	if (this.subscription1$)
    	this.subscription1$.unsubscribe();
	if (this.subscription2$)
    	this.subscription2$.unsubscribe();
	if (this.subscription3$)
    	this.subscription3$.unsubscribe();
	if (this.subscription4$)
    	this.subscription4$.unsubscribe();
  }

  checkIfAlreadyExist() {
    let user = this.searchUsersCtrl.value;
    if (user) {
      let room = this.myRooms.find(room => room.name == user.username ||
        room.name2 == user.username)
      if (room)
        this.dialogRef.close({ data: room })
      else
        this.createPrivateChat();
    }
  }

  createPrivateChat() {
    let username = this.searchUsersCtrl.value;
    if (username && this.myUser) {
      let user_username = username.username;
      let myUser_username = this.myUser.username;
      let user_id = username.id;
      let room: RoomInterface = {
        id: NaN,
        name: myUser_username,
        name2: user_username,
        description: "Conversation between " + myUser_username + " and " + user_username,
        type: RoomType.Direct
      };
      this.chatService.createDirectRoom(room, user_id).subscribe(
        (response) => {
          this.alertService.success("The chat room has been successfully created");
          this.dialogRef.close({ data: room });
        },
        (error) => {
          this.alertService.danger("The chat room could not be created");
        }
      )
    }
  }

  getUsername(value: any): string {
    return (value?.username);
  }

  onInputChange() {
    this.disabledChatButton = true;
  }

  updateMySelection() {
    this.disabledChatButton = false;
  }
}
