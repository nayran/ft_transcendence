import { ActivatedRoute, Router } from '@angular/router';
import { Component, OnInit, Output } from '@angular/core';
import { AuthService } from 'src/app/auth/auth.service';
import { CookieService } from 'ngx-cookie-service';
import { User } from 'src/app/auth/user.model';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { ThisReceiver } from '@angular/compiler';
import { AlertsService } from 'src/app/alerts/alerts.service';

@Component({
	selector: 'app-callback',
	templateUrl: './callback.component.html',
	styleUrls: ['./callback.component.scss']
})

/*
** the Callback component is called by the backend, after JWT was completed (or unsuccessful),
** and will determine wether the user is logged in or if the authentication failed.
*/

export class LoginCallbackComponent implements OnInit {

	currentUser: User | null = null;
	dataSubject: BehaviorSubject<any>;
	need_tfa: boolean = false;

	constructor(
		private activatedRoute: ActivatedRoute,
		private authService: AuthService,
		private cookieService: CookieService,
		private http: HttpClient,
		private router: Router,
		private alertservice: AlertsService
	) {
		this.authService.user.subscribe(user => this.currentUser = user);
		this.dataSubject = new BehaviorSubject<any>(null);
	}

	logOut() {
		this.authService.logout();
	}

	ngOnInit() {
		this.getToken();
	}

	async getToken() {
		this.activatedRoute.queryParams.subscribe(params => {
			const code = params['code'];
			if (!(code)) {
				this.alertservice.danger('Login failed. Is everything OK with the intranet?')
				this.router.navigate(['/login']);
				return;
			}
			this.http.get<any>('/backend/auth/token/' + code).subscribe(result => {
				if (!(result) || !(result.token)) {
					this.alertservice.info('Invalid token. What are you trying to do here?')
					this.router.navigate(['/login']);
					return;
				}
				localStorage.setItem('token', result.token);
				this.getUser();
			});
		});
	}

	/*
	** the functions below must be implemented in other services, like User service
	*/
	async getUser() {
		let x = await this.authService.updateUser();
		if (this.authService.isAuthenticated())
		{
			if (+(this.authService.userSubject.value?.login_count ?? 0) <= 1)
			{	
				this.router.navigate(['/profile']);
			} else {
			this.router.navigate(['/']);
			}
		}
		else if (this.authService.isJwtAuthenticated())
			this.need_tfa = true;
	}

	async getData() {
		this.http.get<User>('/backend/auth/data', { withCredentials: true }).subscribe(result => {
			this.dataSubject.next(result);
		});
	}

	async refreshToken() {
		this.http.get<User>('/backend/auth/refreshtoken', { withCredentials: true }).subscribe(result => {
		});
	}
}


/*
** https://blog.logrocket.com/jwt-authentication-best-practices/
** 
*/
