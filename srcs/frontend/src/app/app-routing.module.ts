import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginpageComponent } from './components/login/loginpage/loginpage.component';
import { LoginCallbackComponent } from './components/login/callback/callback.component';
import { AuthguardService } from './auth/guards/authguard.service';
import { TwofactorComponent } from './components/login/twofactor/twofactor.component';
import { GameComponent } from './components/game/game.component';
import { ChatComponent } from './components/chat/chat.component';
import { FriendsComponent } from './components/friends/friends.component';
import { ProfileComponent } from './components/profile/profile.component';
import { DoubleLoginComponent } from './components/login/double-login/double-login.component';
import { FourohfourComponent } from './components/login/fourohfour/fourohfour.component';

const routes: Routes = [
	{ path: 'home', component: FriendsComponent, canActivate: [AuthguardService], pathMatch: 'full' },
	{ path: 'login', component: LoginpageComponent, pathMatch: 'full' },
	{ path: 'login/callback', component: LoginCallbackComponent, pathMatch: 'full' },
	{ path: 'enable2fa', component: TwofactorComponent, canActivate: [AuthguardService], pathMatch: 'full' },
	{ path: 'doublelogin', component: DoubleLoginComponent, pathMatch: 'full' },
	{ path: 'pong', component: GameComponent, canActivate: [AuthguardService], pathMatch: 'full' },
	{ path: 'letschat', component: ChatComponent, canActivate: [AuthguardService], pathMatch: 'full' },
	{ path: 'friends/:id', component: FriendsComponent, canActivate: [AuthguardService], pathMatch: 'full' },
	{ path: 'friends', component: FriendsComponent, canActivate: [AuthguardService], pathMatch: 'full' },
	{ path: 'profile', component: ProfileComponent, canActivate: [AuthguardService], pathMatch: 'full' },
	{ path: '', redirectTo: 'home', pathMatch: 'full' },
	{ path: '**', component: FourohfourComponent, pathMatch: 'full' }

];

@NgModule({
	imports: [RouterModule.forRoot(routes)],
	exports: [RouterModule]
})

export class AppRoutingModule { }
