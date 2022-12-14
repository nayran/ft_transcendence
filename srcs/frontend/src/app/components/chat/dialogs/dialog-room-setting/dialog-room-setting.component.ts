import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatRadioChange } from '@angular/material/radio';
import { debounceTime, finalize, Subscription, switchMap, tap } from 'rxjs';
import { AuthService } from 'src/app/auth/auth.service';
import { ChatService } from '../../chat.service';
import { MemberInterface, MemberRole } from 'src/app/model/member.interface';
import { RoomType } from 'src/app/model/room.interface';
import { isRoomNameTaken } from 'src/app/validators/async-room-name.validator';
import { AlertsService } from 'src/app/alerts/alerts.service';

@Component({
  selector: 'app-dialog-room-setting',
  templateUrl: './dialog-room-setting.component.html',
  styleUrls: ['./dialog-room-setting.component.scss']
})
export class DialogRoomSettingComponent implements OnInit, OnDestroy {

  disabledAddButton = true;

  filteredUsers!: any;

  form: FormGroup = new FormGroup({
    name: new FormControl(null,
      [Validators.minLength(3), Validators.maxLength(20),
      Validators.pattern('^[a-zA-Z0-9]*$'),],
      [isRoomNameTaken(this.chatService)]),
    description: new FormControl(null, [Validators.maxLength(30), Validators.pattern('^[a-zA-Z0-9 ]*$')]),
    password: new FormControl(null, [Validators.minLength(8)]),
    radioPassword: new FormControl(null)
  });

  formUser: FormGroup = new FormGroup({
    searchUsersCtrl: new FormControl(null)
  });

  hide = true;
  isLoading = false;

  members$ = this.chatService.getMembersOfRoom();
  members: MemberInterface[] = [];

  myMember!: MemberInterface;

  subscription1$!: Subscription;
  subscription2$!: Subscription;
  subscription3$!: Subscription;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private authService: AuthService,
    private chatService: ChatService,
    private alertService: AlertsService,
    private dialogRef: MatDialogRef<DialogRoomSettingComponent>) {
  }

  ngOnInit(): void {
    this.subscription1$ = this.chatService.getMyMemberOfRoom(this.data.room.id)
      .subscribe((member: MemberInterface) => {
        this.myMember = member;
        if (this.myMember?.role != MemberRole.Owner)
          this.form.controls['password'].disable();
      });

    this.chatService.emitGetMembersOfRooms(this.data.room.id);


    if (this.data.room.type == RoomType.Direct)
      this.formUser.controls['searchUsersCtrl'].disable();
    if (this.data.room.type == RoomType.Direct)
      this.form.controls['password'].disable();
    if (this.data.room.type != RoomType.Protected)
      this.form.controls['password'].disable();


    this.subscription2$ = this.authService.getLogoutStatus.subscribe((data) => {
      if (data === true)
        this.dialogRef.close();
    });

    this.subscription3$ = this.searchUsersCtrl.valueChanges
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

    this.members$.subscribe(members => {
      members.forEach(member => {
        this.members.push(member);
      })
    });
  };

  ngOnDestroy(): void {
	if (this.subscription1$)
    	this.subscription1$.unsubscribe();
	if (this.subscription2$)
    	this.subscription2$.unsubscribe();
	if (this.subscription3$)
    	this.subscription3$.unsubscribe();
  }

  get description(): FormControl {
    return this.form.get('description') as FormControl;
  }

  get name(): FormControl {
    return this.form.get('name') as FormControl;
  }

  get password(): FormControl {
    return this.form.get('password') as FormControl;
  }

  get searchUsersCtrl(): FormControl {
    return this.formUser.get('searchUsersCtrl') as FormControl;
  }

  checkIfAlreadyAdded() {
    let user = this.searchUsersCtrl.value;
    if (user) {
      let member = this.members.find(member => member.user.username == user.username)
      if (!member) {
        this.chatService.addUserToRoom(this.data.room, user).subscribe(
          (response) => {
            this.alertService.success(user.username + " has been successfully added to the chatroom");
          },
          (error) => {
            this.alertService.danger(user.username + " could not be added to the room");
          }
        )
      }
      else
        this.alertService.info(user.username + " is already a member of this chat room");
    }
  }

  getUsername(value: any): string {
    if (value)
      return (value.username);
    return ("");
  }

  isPrivateRoom(): boolean {
    return (this.data.room.type == RoomType.Private);
  }

  isDirectRoom(): boolean {
    return (this.data.room.type == RoomType.Direct);
  }

  isProtected(): boolean {
    return (this.data.room.type == RoomType.Protected);
  }

  onInputChange() {
    this.disabledAddButton = true;
  }

  isOwner(): boolean {
    return (this.myMember?.role == MemberRole.Owner);
  }

  radioButtonChange(data: MatRadioChange) {
    if (data.value == "on") {
      this.form.controls['password'].enable();
    }
    else {
      this.form.controls['password'].disable();
      this.form.controls['password'].reset();
    }
  }

  submitChanges() {
    if (this.form.valid) {
      this.chatService.changeSettingsRoom(this.data.room.id, this.form.getRawValue()).subscribe(
        (response) => {
          this.alertService.success("The chat room's settings has been successfully saved");
          this.dialogRef.close({ data: this.form.getRawValue() });
        },
        (error) => {
          this.alertService.danger("The chat room's settings could not be saved");
        }
      )
    }
  }

  updateMySelection() {
    this.disabledAddButton = false;
  }
}
