import { GameService } from './game.service';
import { Game } from './game';
import { UseGuards } from '@nestjs/common';
import { WebSocketGateway, SubscribeMessage, WebSocketServer, MessageBody, ConnectedSocket } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { TfaGuard } from 'src/auth/tfa/tfa.guard';
import { randomInt } from 'crypto';

@WebSocketGateway({ cors: '*:*', namespace: 'game', transports: ['websocket', 'polling'] })
export class GameGateway {

  constructor(private gameService: GameService) { }

  @WebSocketServer()
  server: Server;

  player1: any;
  player2: any;
  games: Game[] = [];

  @SubscribeMessage('liveGames')
  async liveGames(@MessageBody() data: string, @ConnectedSocket() client: Socket) {
    let liveGames: Game[] = [];
    this.games.forEach(game => {
      if (!game.finished && game.connected >= 2)
        liveGames.push(game);
    });
    this.server.to(client.id).emit("games", liveGames);
    liveGames.length = 0;
  }

  @SubscribeMessage('watchGame')
  async watchGame(@MessageBody() data: string, @ConnectedSocket() client: Socket) {
    const game = this.findGameBySocketId(data);
    if (game && !game.finished) {
      game.connected += 1;
      client.join(game.gameID)
      client.rooms.add(game.gameID)
      this.server.to(game.gameID).emit("specs", game.player1, game.player2);
    }
    else {
      this.server.to(client.id).emit("gameUnavailable", 'You are too late');
    }
  }

  @SubscribeMessage('joinGame')
  async joinGame(@MessageBody() data: string, @ConnectedSocket() client: Socket) {
    let customGame = data[0];
    let username = data[1];
    let challenged = data[2];
    let gameIndex = '';
    if (!challenged)
      gameIndex = this.checkGameArray(customGame, false);
    else
      gameIndex = this.checkChallengeArray(customGame, true, challenged, username);
    this.setPlayers(client, gameIndex, username);
  }

  checkChallengeArray(customGame: string, challenge: boolean, challenged: string, username: string) {
    if (this.games.length > 0) {
      for (let index = 0; index < this.games.length; index++) {
        let game = this.games[index];
        if (game && game.challenged === username) {
          if (game.player1.socket == '' || game.player2.socket == '') {
            return game.gameID;
          }
        }
      };
    }
    let gameID = this.checkGameID(randomInt(1024).toString());
    this.games.push(new Game(gameID, customGame, challenge, challenged));
    return gameID;
  }

  checkGameArray(customGame: string, challenge: boolean) {
    if (this.games.length > 0) {
      for (let index = 0; index < this.games.length; index++) {
        let game = this.games[index];
        if (game && game.isCustom === customGame && !game.challenge) {
          if (game.player1.socket == '' || game.player2.socket == '') {
            return game.gameID;
          }
        }
      };
    }
    let gameID = this.checkGameID(randomInt(1024).toString());
    this.games.push(new Game(gameID, customGame, challenge, ''));
    return gameID;
  }

  checkGameID(id: string) {
    for (let index = 0; index < this.games.length; index++) {
      let game = this.games[index];
      if (game && game.gameID === id) {
        id = (Number(id) + 1).toString();
        index = 0;
      }
    }
    return id;
  }

  setPlayers(client, gameID, username) {
    const game = this.findGameByGameId(gameID);
    if (game) {
      if (!game.player1.socket) {
        game.player1.socket = client.id;
        game.player1.username = username;
      }
      else if (!game.player2.socket) {
        game.player2.socket = client.id;
        game.player2.username = username;
      }
      client.join(game.gameID)
      client.rooms.add(game.gameID)
      game.connected += 1;
      if (game.challenge && game.player1.username == game.challenged) {
        this.server.to(game.gameID).emit("gameUnavailable", "You are too late")
      }
      if (game.player1.socket && game.player2.socket) {
        if (client.id == game.player1.socket || client.id == game.player2.socket) {
          this.server.to(game.gameID).emit("players", game.player1, game.player2);
        }
      }
    }
  }

  findGameByGameId(gameID) {
    for (let index = 0; index < this.games.length; index++) {
      let game = this.games[index];
      if (game && game.gameID === gameID)
        return (game);
    }
  }

  @SubscribeMessage('setPaddles')
  async setPaddles(@MessageBody() data: string, @ConnectedSocket() client: Socket,) {
    const game = this.findGameBySocketId(client.id);
    if (game) {
      if (this.isPlayer1(game.gameID, client.id)) {
        game.player1.height = Number(data[0]);
        game.player1.y = Number(data[1]);
        game.player2.height = Number(data[2]);
        game.player2.y = Number(data[3]);
      }
      this.server.to(game.gameID).emit('updatePaddle', game.player1, game.player2)
    }
  }

  @SubscribeMessage('resetPaddles')
  async resetPaddles(@MessageBody() data: string, @ConnectedSocket() client: Socket,) {
    const game = this.findGameBySocketId(client.id);
    if (game) {
      let player1 = game.player1;
      let player2 = game.player2;
      player1.y = 360 - (player1.height / 2);
      player1.x = 20;
      player2.y = 360 - (player2.height / 2);
      player2.x = 1280 - player2.width - 20;
      player1.height = 150;
      player2.height = 150;
      this.server.to(game.gameID).emit('updatePaddle', player1, player2)
    }
  }

  @SubscribeMessage('syncBall')
  async syncBall(@MessageBody() data: string, @ConnectedSocket() client: Socket,) {
    const game = this.findGameBySocketId(client.id);
    if (game && this.isPlayer1(game.gameID, client.id)) {
      game.ball = data;
      this.server.to(game.gameID).emit("ball", game.ball);
      this.server.to(game.gameID).emit("updateScore", game.player1.score, game.player2.score, game.finished);
    }
  }

  @SubscribeMessage('move')
  async move(@MessageBody() data: string, @ConnectedSocket() client: Socket,) {
    const game = this.findGameBySocketId(client.id);
    if (game) {
      let command = data[0];
      game.ball = data[1];
      let player: any;
      if (client.id == game.player1.socket)
        player = game.player1;
      else if (client.id == game.player2.socket)
        player = game.player2;
      switch (command) {
        case "up":
          if (player.y > 0) {
            player.y -= 30;
            this.server.to(game.gameID).emit("updatePaddle", game.player1, game.player2);
          }
          break;
        case "down":
          if (player.y < (720 - player.height))
            player.y += 30;
          this.server.to(game.gameID).emit("updatePaddle", game.player1, game.player2);
          break;
      }
    }
  }

  @UseGuards(TfaGuard)
  async handleDisconnect(client: Socket, ...args: any[]) {
    const game = this.findGameBySocketId(client.id);
    if (game) {
      const gameID = game.gameID;
      game.connected -= 1;
      if (client.id == game.player1.socket || client.id == game.player2.socket) {
        this.server.to(gameID).emit("endGame", client.id);
        game.finished = true;
        if (client.id == game.player1.socket && !game.player2.socket) {
          this.deleteGameById(gameID)
        }
        else if (client.id == game.player1.socket) {
          game.player1.disconnected = true;
        }
        else if (client.id == game.player2.socket) {
			game.player2.disconnected = true;
        }
	}
	if (game.player1.disconnected && game.player2.disconnected) {
		await this.gameService.addGame(game);
        this.server.in(gameID).socketsLeave(gameID);
        this.server.in(gameID).disconnectSockets();
        this.deleteGameById(gameID);
      }
    }
  }

  deleteGameById(gameID: string) {
    for (let index = 0; index < this.games.length; index++) {
      let game = this.games[index];
      if (game && game.gameID == gameID) {
        delete this.games[index];
        this.games.splice(index, 1);
      }
    }
  }

  findGameBySocketId(socketID: string) {
    for (let index = 0; index < this.games.length; index++) {
      let game = this.games[index];
      if (game && (game.player1.socket == socketID || game.player2.socket == socketID))
        return (game);
    }
  }

  @SubscribeMessage('score')
  async score(@MessageBody() data: string, @ConnectedSocket() client: Socket) {
    const game = this.findGameBySocketId(client.id);
    if (game && this.isPlayer1(game.gameID, client.id)) {
      let scoreP1 = data[0];
      let scoreP2 = data[1];
      let finished = data[2];
      game.finished = Boolean(finished);
      game.player1.score = Number(scoreP1);
      game.player2.score = Number(scoreP2);
      this.server.to(game.gameID).emit("updateScore", scoreP1, scoreP2, finished);
    }
  }

  @SubscribeMessage('powerUp')
  async powerUp(@MessageBody() data: string, @ConnectedSocket() client: Socket) {
    const game = this.findGameBySocketId(client.id);
    if (game && this.isPlayer1(game.gameID, client.id)) {
      game.powerUp = data;
      this.server.to(game.gameID).emit("updatePowerUp", game.powerUp);
    }
  }

  @SubscribeMessage('finishMessage')
  async finishMessage(@MessageBody() data: string, @ConnectedSocket() client: Socket) {
    const game = this.findGameBySocketId(client.id);
    if (game) {
      game.finished = true;
      if (data[1] == '1')
        game.winner = game.player1;
      else if (data[1] == '2')
        game.winner = game.player2;
      else
        game.winner = null;
	this.server.to(game.gameID).emit("winner", data[0]);
    }
  }

  isPlayer1(gameID: string, id: any) {
    const game = this.findGameBySocketId(id);
    if (game && game.player1 && id == game.player1.socket)
      return true;
    return false;
  }

  @SubscribeMessage('challenge')
  async challenge(@MessageBody() data: string, @ConnectedSocket() client: Socket) {
    let challenger = data[0];
    let challenged = data[1];
    let powerUps = data[2];
    this.server.emit("notifyChallenge", challenger, challenged, powerUps);
  }

  @SubscribeMessage('cancelChallenge')
  async cancelChallenge(@MessageBody() data: string, @ConnectedSocket() client: Socket) {
    let challenger = data[0];
    let challenged = data[1];
    const game = this.findGameByChallenged(challenged);
    if (game && data[2])
      this.server.to(game.gameID).emit("gameUnavailable", challenged + " refused your challenge!")
    else
      this.server.emit("removeChallenge", challenger, challenged, data[2]);
  }

  findGameByChallenged(challenged: string) {
    for (let index = 0; index < this.games.length; index++) {
      let game = this.games[index];
      if (game && game.challenged == challenged)
        return (game);
    }
  }

  @SubscribeMessage('getBall')
  async getBall(@MessageBody() data: string, @ConnectedSocket() client: Socket) {
    const game = this.findGameBySocketId(data);
    if (game){
    	this.server.to(client.id).emit("ball", game.ball);
    }
  }

  @SubscribeMessage('getPowerup')
  async getPowerUp(@MessageBody() data: string, @ConnectedSocket() client: Socket) {
    const game = this.findGameBySocketId(data);
    if (game) {
      this.server.to(client.id).emit("updatePowerUp", game.powerUp);
    }
  }
}
