
import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/auth/auth.service';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-dialog-avatar',
  templateUrl: './dialog-avatar.component.html',
  styleUrls: ['./dialog-avatar.component.scss']
})
export class DialogAvatarComponent implements OnInit {

  // Variable to store shortLink from api response
  loading: boolean = false; // Flag variable
  file: any = null; // Variable to store file
  errorMsg: string = ""
  editmode: boolean = false;

  // Inject service 
  constructor(private userService: UserService,
    public authService: AuthService) { }

  ngOnInit(): void {
  }

  // On file Select
  onChange(event: any) {
    this.editmode = true;
    this.errorMsg = ""
    const ext = event.target.files[0].name.split('.').pop().toLowerCase();
    if (ext !== 'jpg' && ext !== 'jpeg' && ext !== 'png') {
      this.editmode = false;
      this.errorMsg = "You can only upload a jpg, jpeg or png file."
    }
    else if (event.target.files[0].size > 2000000) {
      this.editmode = false;
      this.errorMsg = "You can only upload a file less than 2MB."
    }
    else {
      this.file = event.target.files[0];
    }
  }

  // OnClick of button Upload
  onUpload() {
    if (this.file == null) {
      return;
    }
    this.loading = !this.loading;
    this.userService.uploadProfilePicture(this.file).subscribe(
      (event: any) => {
        if (typeof (event) === 'object') {
          this.loading = false;
          this.authService.updateUser();
        }
      }
    );
  }
}
