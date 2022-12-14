import { OnlineGameService } from './game.service';
import { Component, OnInit } from '@angular/core';
import io from "socket.io-client";
import { AuthService } from 'src/app/auth/auth.service';
import { AlertsService } from 'src/app/alerts/alerts.service';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.scss']
})
export class GameComponent implements OnInit {

  private socket: any;
  menu: boolean = true;
  cmenu: boolean = false;
  paused: boolean = false;
  mode: string = '';
  powerUps: boolean = false;
  showLiveGames: boolean = false;
  liveGames: any;
  toWatch: any;
  challenged: string = "";

  constructor(protected gameService: OnlineGameService, private auth: AuthService, private alert: AlertsService) { }

  async ngOnDestroy() {
    this.gameService.challenged = null;
    await this.socket.disconnect();
  }

  public async ngOnInit() {
    this.socket = io("/game");
    if (this.gameService.challenged) {
      this.cmenu = true;
      this.challenged = this.gameService.challenged;
      this.powerUps = this.gameService.powerUps;
      let username;
      await this.auth.getUser().then(data => {
        username = data.username;
      });
      if (username == this.challenged) {
        this.startGame('friend')
        this.alert.clear()
      }
    }
    if (this.gameService.p1Username) {
      this.specGame(this.gameService.p1Username)
    }
  }

  startGame(mode: string) {
    this.mode = mode;
    this.menu = false;
  }

  togglePowerUps() {
    this.powerUps = !this.powerUps;
  }

  toggleLiveGames() {
    this.showLiveGames = true;
    this.liveGames = undefined;
    this.socket.emit("liveGames");
    this.socket.on("games", (games: any) => {
      if (games.length > 0)
        this.liveGames = games;
    });
  }

  toggleInstructions() {
    this.showLiveGames = false;
  }

  watchGame(player1: any) {
    this.menu = false;
    this.mode = 'spec';
    this.toWatch = player1;
  }

  specGame(username: string) {
    this.socket.emit("liveGames");
    this.socket.on("games", (games: any[]) => {
      if (games) {
        for (let index = 0; index < games.length; index++) {
          if (games[index].player1.username == username || games[index].player2.username == username) {
            this.watchGame(games[index].player1.socket)
          }
        }
      }
    });
  }

  quit(event: boolean) {
    this.menu = true;
    this.mode = 'quit';
  }
}
