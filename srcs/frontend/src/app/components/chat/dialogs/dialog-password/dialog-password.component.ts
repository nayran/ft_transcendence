import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ChatService } from '../../chat.service';
import { AuthService } from 'src/app/auth/auth.service';
import { Subscription } from 'rxjs';
import { AlertsService } from 'src/app/alerts/alerts.service';

@Component({
  selector: 'app-dialog-password',
  templateUrl: './dialog-password.component.html',
  styleUrls: ['./dialog-password.component.scss']
})
export class DialogPasswordComponent implements OnInit, OnDestroy {

  invalidPassword = false;

  form: FormGroup = new FormGroup({
    password: new FormControl(null, [Validators.required])
  });

  subscription1$!: Subscription;
  subscription2$!: Subscription;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<DialogPasswordComponent>,
    private alertService: AlertsService,
    private chatService: ChatService,
    private authService: AuthService) { }

  ngOnInit(): void {
    this.subscription1$ = this.authService.getLogoutStatus.subscribe((data) => {
      if (data == true)
        this.dialogRef.close();
    });
  }

  ngOnDestroy(): void {
	if (this.subscription1$)
    	this.subscription1$.unsubscribe();
	if (this.subscription2$)
    	this.subscription2$.unsubscribe();
  }

  get password(): FormControl {
    return (this.form.get('password') as FormControl);
  }

  async verifyPassword() {
    this.subscription2$ = this.chatService
      .verifyPassword(this.data.room, this.form.getRawValue().password)
      .subscribe((event: any) => {
        if (event == false) {
          this.alertService.warning("The password is incorrect")
        }
        else {
          this.chatService.joinRoom(this.data.room).subscribe(
            (response) => {
              this.alertService.success("You have successfully joined the chat room")
              this.dialogRef.close();
            },
            (error) => {
              this.alertService.danger("We could not add you to the chat room");
            }
          )
        }
      });
  }
}
