import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { Subscription } from 'rxjs';
import { AlertsService } from 'src/app/alerts/alerts.service';
import { AuthService } from 'src/app/auth/auth.service';
import { isRoomNameTaken } from 'src/app/validators/async-room-name.validator';
import { ChatService } from '../../chat.service';

@Component({
  selector: 'app-dialog-new-room',
  templateUrl: './dialog-new-room.component.html',
  styleUrls: ['./dialog-new-room.component.scss']
})
export class DialogNewRoomComponent implements OnInit, OnDestroy {

  hide = true;
  IsProtected: boolean = true;

  form: FormGroup = new FormGroup({
    name: new FormControl(null,
      [Validators.minLength(3), Validators.maxLength(20),
      Validators.pattern('^[a-zA-Z0-9]*$'),],
      [isRoomNameTaken(this.chatService)]),
    description: new FormControl(null, [Validators.required, Validators.maxLength(30), Validators.pattern('^[a-zA-Z0-9 ]*$')]),
    type: new FormControl(null, [Validators.required]),
    password: new FormControl(null, [Validators.required, Validators.minLength(8)])
  });

  subscription1$!: Subscription;

  constructor(private chatService: ChatService,
    private authService: AuthService,
    private dialogRef: MatDialogRef<DialogNewRoomComponent>,
    private alertService: AlertsService) {
  }

  ngOnInit(): void {
    this.form.controls['password'].disable();

    this.subscription1$ = this.authService.getLogoutStatus.subscribe((data) => {
      if (data === true) {
        this.dialogRef.close();
      }
    });
  }

  ngOnDestroy(): void {
	if (this.subscription1$)
    	this.subscription1$.unsubscribe();
  }

  get description(): FormControl {
    return (this.form.get('description') as FormControl);
  }

  get name(): FormControl {
    return (this.form.get('name') as FormControl);
  }

  get password(): FormControl {
    return (this.form.get('password') as FormControl);
  }

  get type(): FormControl {
    return (this.form.get('type') as FormControl);
  }

  createChatroom() {
    if (this.form.valid)
      this.chatService.createRoom(this.form.getRawValue()).subscribe(
        (response) => {
          this.alertService.success("The chat room has been successfully created");
          this.dialogRef.close({ data: this.form.getRawValue() });
        },
        (error) => {
          this.alertService.danger("The chat room could not be created");
        }
      )
  }

  OnSelectChange(input: string) {
    switch (input) {
      case "3": {
        this.form.controls['password'].enable();
        break;
      }
      default: {
        this.form.controls['password'].disable();
        this.form.controls['password'].reset();
        break;
      }
    }
  }
}
