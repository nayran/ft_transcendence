import { Injectable } from '@angular/core';
import * as game from './game'
@Injectable({
  providedIn: 'root'
})
export class OnlineGameService {

  constructor() { }

  getBall() {
    return game.ball;
  }

  getPowerUp() {
    return game.powerUp;
  }

  getPlayer1() {
    return game.player1;
  }

  getPlayer2() {
    return game.player2;
  }

  setP1Socket(socket: any) {
    game.setP1Socket(socket);
  }

  setP2Socket(socket: any) {
    game.setP2Socket(socket);
  }

  setP1Username(username: any) {
    game.setP1Username(username);
  }

  setP2Username(username: any) {
    game.setP2Username(username);
  }

  run() {
    game.update();
  }

  listeners(){
  	game.listeners();
  }

  start() {
    game.gameStart();
  }

  setGameSocket(socket: any) {
    game.setGameSocket(socket)
  }

  setMode(mode: any) {
    game.setMode(mode);
  }

  setCustom(custom: boolean) {
    game.setCustom(custom);
  }

  getFinalMessage(reason: any, disconnected: any): string {
    let res: string = '';
    if (reason == 'disconnect') {
      if (game.player1.socket == disconnected)
        res = game.player1.username + ' disconnected!';
      else if (game.player2.socket == disconnected)
        res = game.player2.username + ' disconnected!';
    }
    else if (reason == 'score') {
      if (game.player1.score > game.player2.score)
        res = game.player1.username + ' won!';
      else
        res = game.player2.username + ' won!';
    }
    return res;
  }

  getWinner(reason: any, disconnected: any): number {
    let res: number = 0;
    if (reason == 'down')
      return 3;
    if (reason == 'disconnect') {
      if (game.player1.socket == disconnected)
        res = 2;
      else if (game.player2.socket == disconnected)
        res = 1;
    }
    else {
      if (game.player1.score > game.player2.score)
        res = 1;
      else
        res = 2;
    }
    game.setFinished();
    return res;
  }

  setFinished() {
    game.setFinished();
  }

  reset() {
    game.setStarted(false);
  }

}
