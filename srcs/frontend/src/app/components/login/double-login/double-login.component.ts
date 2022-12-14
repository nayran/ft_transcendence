import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { fromEvent, Observable } from 'rxjs';
import { AlertsService } from 'src/app/alerts/alerts.service';
import { AuthService } from 'src/app/auth/auth.service';

@Component({
	selector: 'app-double-login',
	templateUrl: './double-login.component.html',
	styleUrls: ['./double-login.component.scss']
})
export class DoubleLoginComponent {


	constructor(
		private alertService: AlertsService,
		private router: Router,
		private authService: AuthService
	) {
		history.pushState(null, '', location.href);
		window.onpopstate = function () {
			history.go(1);
		};
	}

	returnHome() {
		this.router.navigate(['/home']);
	}
	ngOnInit() {
		this.alertService.clear();
		this.alertService.info("You have logged out because you were connected to another browser. Please log in again.")
		this.authService.logout();
	}

}
