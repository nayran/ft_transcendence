import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http'
import { CookieService } from 'ngx-cookie-service'
import { Router } from '@angular/router'
import { Observable, BehaviorSubject, firstValueFrom } from 'rxjs';
import { User } from './user.model';

@Injectable({
	providedIn: 'root'
})

/*
** Observables and BehaviourSubject are used to let any
** module subscribed to these components know if there is 
** any change to it.
*/

export class AuthService {

	constructor(
		private cookieService: CookieService,
		private router: Router,
		private http: HttpClient
	) {
		this.userSubject = new BehaviorSubject<User | null>(this.getUserFromLocalStorage());
		this.user = this.userSubject.asObservable();
	}

	public userSubject: BehaviorSubject<User | null>;
	public user: Observable<User | null>;
	private logoutStatus = new BehaviorSubject(false);
	getLogoutStatus = this.logoutStatus.asObservable();

	isAuthenticated(): boolean {
		if (!(this.userSubject.value) || !(this.userSubject.value.tfa_fulfilled))
			return false;
		return (true);
	}

	isJwtAuthenticated(): boolean {
		if (!(this.userSubject.value) || !(this.userSubject.value.id))
			return false;
		return (true);
	}

	serverLogout() {
		return (this.http.get('/backend/auth/logout', { withCredentials: true }));
	}

	refreshToken() {
		return (this.http.get<any>('/backend/auth/refreshtoken', { withCredentials: true }));
	}

	performLogout(): Promise<any> {
		this.userSubject.next(null);
		localStorage.removeItem('user');
		localStorage.removeItem('token');
		this.logoutStatus.next(true);
		return this.router.navigate(['/login']);
	}

	simulateLogout() {
		this.logoutStatus.next(true);
		this.logoutStatus.next(false);
	}

	logout(): void {
		this.serverLogout();
		this.performLogout();
	}

	async getUser() {
		return firstValueFrom(this.http.get<User>('/backend/auth/profile', { withCredentials: true }));
	}

	async updateUser() {
		let x = await this.getUser();
		this.userSubject.next(x);
		localStorage.removeItem('user');
		localStorage.setItem('user', JSON.stringify(x));
	}

	getUserFromLocalStorage(): User | null {
		let user: string | null = localStorage.getItem('user');
		if (user) {
			let result: User = JSON.parse(user);
			return (result);
		}
		return (null);
	}

	tryLogin(): boolean {
		let result: User | null = this.getUserFromLocalStorage();
		this.userSubject.next(result);
		if (result)
			return (true);
		return (false);
	}
}
