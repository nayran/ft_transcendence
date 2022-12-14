import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginpageComponent } from './components/login/loginpage/loginpage.component';
import { LoginCallbackComponent } from './components/login/callback/callback.component';
import { ButtonComponent } from './components/button/button.component';
import { AuthModule } from './auth/auth.module';
import { HomeComponent } from './components/home/home.component';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { AuthInterceptor } from './auth/auth.interceptor';
import { TwofactorComponent } from './components/login/twofactor/twofactor.component';
import { ReactiveFormsModule } from '@angular/forms';
import { AuthguardService } from './auth/guards/authguard.service';
import { NavbarComponent } from './components/navbar/navbar.component';
import { GameComponent } from './components/game/game.component';
import { ChatComponent } from './components/chat/chat.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { DialogAvatarComponent } from './components/profile/dialogs/dialog-avatar/dialog-avatar.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatDialogModule } from '@angular/material/dialog';
import { DialogUsernameComponent } from './components/profile/dialogs/dialog-username/dialog-username.component';
import { MatInputModule } from '@angular/material/input';
import { ProfileComponent } from './components/profile/profile.component';
import { OnlineGameComponent } from './components/game/online-game/online-game.component';
import { AlertsModule } from './alerts/alerts.module';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { FriendsComponent } from './components/friends/friends.component';
import { GameHistoryComponent } from './components/friends/game-history/game-history.component';
import { FriendsListComponent } from './components/friends/friends-list/friends-list.component';
import { DialogNewRoomComponent } from './components/chat/dialogs/dialog-new-room/dialog-new-room.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatChipsModule } from '@angular/material/chips';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatToolbarModule } from '@angular/material/toolbar';
import { DialogPasswordComponent } from './components/chat/dialogs/dialog-password/dialog-password.component';
import { DialogSearchUserComponent } from './components/chat/dialogs/dialog-search-user/dialog-search-user.component';
import { ChatRoomComponent } from './components/chat/chat-room/chat-room.component';
import { ChatMessageComponent } from './components/chat/chat-message/chat-message.component';
import { ChatModule } from './components/chat/chat.module';
import { DoubleLoginComponent } from './components/login/double-login/double-login.component';
import { AchievementsComponent } from './components/friends/achievements/achievements.component';
import { FriendProfileComponent } from './components/friends/friend-profile/friend-profile.component';
import { GameStatsComponent } from './components/friends/game-stats/game-stats.component';
import { FriendStatsComponent } from './components/friends/friend-stats/friend-stats.component';
import { GameRankingComponent } from './components/friends/game-ranking/game-ranking.component';
import { MatRadioModule } from '@angular/material/radio';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { DialogRoomSettingComponent } from './components/chat/dialogs/dialog-room-setting/dialog-room-setting.component';
import { PanelChatRoomComponent } from './components/chat/panel-chat-room/panel-chat-room.component';
import { ThumbnailComponent } from './components/friends/thumbnail/thumbnail.component';
import { FloatingballsComponent } from './components/login/floatingballs/floatingballs.component';
import { FourohfourComponent } from './components/login/fourohfour/fourohfour.component';


@NgModule({
  declarations: [
    AppComponent,
    LoginpageComponent,
    LoginCallbackComponent,
    ButtonComponent,
    HomeComponent,
    TwofactorComponent,
    NavbarComponent,
    GameComponent,
    ChatComponent,
    DialogAvatarComponent,
    DialogUsernameComponent,
    ProfileComponent,
    OnlineGameComponent,
    FriendsComponent,
    GameHistoryComponent,
    FriendsListComponent,
    DialogNewRoomComponent,
    DialogPasswordComponent,
    DialogSearchUserComponent,
    ChatRoomComponent,
    ChatMessageComponent,
    DoubleLoginComponent,
    AchievementsComponent,
    FriendProfileComponent,
    GameStatsComponent,
    FriendStatsComponent,
    GameRankingComponent,
    DialogRoomSettingComponent,
    ThumbnailComponent,
    FloatingballsComponent,
    FourohfourComponent,
    PanelChatRoomComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    ReactiveFormsModule,
    AuthModule.forRoot(),
    ChatModule,
    FontAwesomeModule,
    BrowserAnimationsModule,
    MatDialogModule,
    MatInputModule,
    ReactiveFormsModule,
    AlertsModule,
    MatPaginatorModule,
    MatCardModule,
    MatButtonModule,
    MatListModule,
    MatFormFieldModule,
    MatSelectModule,
    MatIconModule,
    MatSnackBarModule,
    MatChipsModule,
    MatAutocompleteModule,
    MatToolbarModule,
    MatRadioModule,
    MatButtonToggleModule,
    MatTooltipModule
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true,
    },
    AuthguardService,
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
