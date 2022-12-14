
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { forbiddenNameValidator } from './forbidden-name.directive';
import { UserService } from 'src/app/services/user.service';
import { isUsernameTaken } from 'src/app/validators/async-username.validator';
import { AuthService } from 'src/app/auth/auth.service';
import { Router } from '@angular/router';
import { UsersOnlineService } from 'src/app/services/users-online.service';

@Component({
  selector: 'app-dialog-username',
  templateUrl: './dialog-username.component.html',
  styleUrls: ['./dialog-username.component.scss']
})
export class DialogUsernameComponent implements OnInit {

  form: FormGroup = new FormGroup({
    username: new FormControl(null, [Validators.required,
    Validators.minLength(3),
    Validators.maxLength(10),
    Validators.pattern('^[a-z0-9]+$'),
    forbiddenNameValidator(this.userService.username),
    forbiddenNameValidator('admin')
    ], [isUsernameTaken(this.userService)])
  });

  constructor(private userService: UserService,
    private authService: AuthService,
	private onlineService: UsersOnlineService
	) { }

  ngOnInit(): void {
  }

  get username(): FormControl {
    return this.form.get('username') as FormControl;
  }

  // OnClick of button Upload
  updateName(username: string) {
	let oldUsername = this.authService.userSubject.value?.username ?? '';
    this.userService.updateUsername(username).subscribe(
      (event: any) => {
        if (event.username != '') {
          this.userService.username = event.username;
          this.authService.updateUser();
		  if (oldUsername)
		  	this.onlineService.setStatus(oldUsername, 'offline'); 
		  this.onlineService.setStatus(event.username, 'online');
		}
      }
    )
  }
}
