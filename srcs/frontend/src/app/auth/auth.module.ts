import { ModuleWithProviders, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from './auth.service';
import { HttpClientModule } from '@angular/common/http';
import { User } from "./user.model"

@NgModule({
	declarations: [],
	imports: [
		CommonModule,
		HttpClientModule,
	]
})

export class AuthModule {
	static forRoot(): ModuleWithProviders<AuthModule> {
		return {
			ngModule: AuthModule,
			providers: [
				AuthService
			]
		}
	}
}

export function getUserId(): string {
	let user: string | null = localStorage.getItem('user');
	if (user) {
		let result: User = JSON.parse(user);
		let ret = result.id?.toString();
		return ret;
	}
	return "-1"
}
