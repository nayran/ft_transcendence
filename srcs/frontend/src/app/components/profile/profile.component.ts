import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { DialogUsernameComponent } from './dialogs/dialog-username/dialog-username.component'
import { UserService } from 'src/app/services/user.service';
import { faEdit } from '@fortawesome/free-solid-svg-icons';
import { DialogAvatarComponent } from './dialogs/dialog-avatar/dialog-avatar.component';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/auth/auth.service';
import { HttpClient } from '@angular/common/http';
import { AlertsService } from 'src/app/alerts/alerts.service';
import { BehaviorSubject } from 'rxjs';
import { User } from 'src/app/auth/user.model';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {

  tfa_enabled: boolean | undefined = false;
  image: string = "";
  faEdit = faEdit;
  public userSubject: BehaviorSubject<User | null>;

  constructor(
    public dialog: MatDialog,
    private userService: UserService,
    private router: Router,
    private authService: AuthService,
    private http: HttpClient,
    private alertservice: AlertsService
  ) {
    this.userSubject = this.authService.userSubject;
  }

  ngOnInit(): void {
    this.tfa_enabled = this.authService.userSubject.value?.tfa_enabled;
  }

  openDialogAvatar() {
    const dialogRef = this.dialog.open(DialogAvatarComponent, {
      data: { title: 'Change your profile picture' }
    });
    dialogRef.afterClosed().subscribe(
      () => this.image = this.userService.avatar
    );
  }



  enableTfa() {
    this.router.navigate(['/enable2fa']);
  }

  async disableTfa() {
    this.http.post('/backend/auth/tfa_disable', null, { withCredentials: true }).subscribe(async (result) => {
      let res = result;
      if (res) {
        await this.authService.updateUser();
        this.tfa_enabled = this.authService.userSubject.value?.tfa_enabled;
      }
      if (!(this.tfa_enabled)) {
        this.alertservice.success('TFA Successfully Disabled');
		this.router.navigateByUrl('/home', { skipLocationChange: true }).then(() => {
			this.router.navigate(['/profile']);
		  });
      } else {
        this.alertservice.warning('Failed disabling TFA');
      }
    });
  }

  logOut() {
    this.authService.logout();
  }


}
