import { ChatSocket } from 'src/app/components/chat/chat-socket';
import { AuthService } from 'src/app/auth/auth.service';
import { Component, ViewChild, ElementRef, OnInit, HostListener, Input, OnDestroy, Output, EventEmitter } from '@angular/core';
import io from "socket.io-client";
import { OnlineGameService } from './online-game.service';
import { FriendsService } from '../../friends/friends.service';
import { UsersOnlineService } from 'src/app/services/users-online.service';


@Component({
  selector: 'app-online-game',
  templateUrl: './online-game.component.html',
  styleUrls: ['./online-game.component.scss']
})
export class OnlineGameComponent implements OnInit, OnDestroy {

  @ViewChild("game")
  private gameCanvas!: ElementRef;
  private canvas: any;
  @Input() mode: any;
  @Input() powerUps: any;
  @Input() specGame: any;
  @Input() challenged!: string;
  @Output() quit: EventEmitter<boolean> = new EventEmitter();;
  socket: any;
  isWaiting: boolean = true;
  currentAnimationFrameId?: number;
  finishedMessage: string = '';
  scoreP1: number = 0;
  scoreP2: number = 0;
  finished: boolean = false;
  player1: any;
  player2: any;
  ball: any;
  username: string = "";
  powerUp: any;

  constructor(
    public gameService: OnlineGameService,
    private auth: AuthService,
    private chatSocket: ChatSocket,
  ) {
    this.ball = gameService.getBall();
  }

  @HostListener('window:keydown', ['$event'])
  keyEvent(event: KeyboardEvent) {
    if (event.code == 'Escape') {
      if (this.isWaiting || this.finished || this.mode == 'spec') {
        this.esc();
      }
    }
  }

  @HostListener('document:visibilitychange', ['$event'])
  visibilitychange() {
    if (document.hidden && !this.finished && this.mode != 'spec' && !this.isWaiting && !this.finishedMessage) {
      this.socket.disconnect();
      window.cancelAnimationFrame(this.currentAnimationFrameId as number);
      this.canvas.clearRect(0, 0, this.gameCanvas.nativeElement.width, this.gameCanvas.nativeElement.height);
      this.canvas.font = '10vh Roboto, Futura, sans-serif';
      this.canvas.textBaseline = 'middle';
      this.canvas.textAlign = 'center';
      this.canvas.fillText("DISCONNECTED", 640, 360);
      this.canvas.font = '3vh Roboto, Futura, sans-serif';
      this.canvas.fillText('You must stay in the game', 640, 420);
      this.finished = true;
    }
  }

  ngOnInit(): void {
    this.socket = io("/game");

    this.username = this.auth.userSubject.value?.username ?? '';
    if (this.mode == 'spec') {
      this.chatSocket.emit('setStatus', this.username, "watching")
      this.socket.emit("watchGame", this.specGame);
      this.gameUnavailable()
    }
    else if (this.mode == 'friend') {
      if (this.username != this.challenged) {
        this.socket.emit("challenge", this.username, this.challenged, this.powerUps)
      }
      this.socket.emit("joinGame", this.powerUps, this.username, this.challenged);
      this.gameUnavailable()
    }
    else {
      this.socket.emit("joinGame", this.powerUps, this.username, this.challenged);
    }
    this.gameService.setMode(this.mode)
    this.gameService.setCustom(this.powerUps)

    window.onbeforeunload = async () => {
      await this.socket.emit("cancelChallenge", this.username, this.challenged)
    };
  }

  async ngOnDestroy() {
    this.gameService.setFinished();
    this.finished = true;
    window.cancelAnimationFrame(this.currentAnimationFrameId as number);
    this.gameService.reset();
    this.chatSocket.emit('setStatus', this.username, "online")
    await this.socket.emit("cancelChallenge", this.username, this.challenged)
    await this.socket.disconnect();
  }

  ngAfterViewInit() {
    this.canvas = this.gameCanvas.nativeElement.getContext("2d");
    this.canvas.fillStyle = "white";
    if (this.mode != 'spec')
      this.players();
    else
      this.specs();
  }

  players() {
    this.socket.once("players", (player1: any, player2: any) => {
      this.setPlayers(player1, player2)
      this.chatSocket.emit('setStatus', this.username, "ingame")
      this.isWaiting = false;
      this.gameService.start()
      this.listeners();
      this.update();
    })
  }


  listeners() {
    	this.socket.on('updatePowerUp', (newPowerUp: any) => {
    	 this.powerUp = newPowerUp;
    	})
    this.updateScore();
  }

  specs() {
    this.gameService.setGameSocket(this.socket);
    this.socket.once("specs", (player1: any, player2: any) => {
      this.player1 = player1;
      this.player2 = player2;
      this.isWaiting = false;
      this.watchGame();
    })
  }

  gameUnavailable() {
    this.socket.once('gameUnavailable', (msg: any) => {
      this.finished = true;
      this.isWaiting = false;
      this.finishedMessage = msg;
      this.finish('down', 0)
    })
  }

  watchGame() {
	 this.gameService.listeners();
    this.socket.on("updatePaddle", (player1: any, player2: any) => {
      this.player1 = player1;
      this.player2 = player2;
    });
    this.socket.on('updatePowerUp', (newPowerUp: any) => {
     this.powerUp = newPowerUp;
    })
    this.socket.on("ball", (ball: any) => {
      this.canvas.clearRect(0, 0, this.gameCanvas.nativeElement.width, this.gameCanvas.nativeElement.height);
      this.updateScore();
      this.drawLines();
      this.drawScore();
      this.drawNames();
      this.drawPowerUp(this.powerUp);
      if (!this.finished)
        this.drawBall(ball);
      this.updatePaddles(this.player1, this.player2);
    })
    this.socket.emit('getBall', this.specGame);
	this.socket.emit('getPowerup', this.specGame)
    this.endGame();
    this.currentAnimationFrameId = window.requestAnimationFrame(this.update.bind(this));
  }

  setPlayers(player1: any, player2: any) {

    if (player1.socket) {
      this.gameService.setP1Socket(player1.socket);
      this.gameService.setP1Username(player1.username)
    }
    if (player2.socket) {
      this.gameService.setP2Socket(player2.socket);
      this.gameService.setP2Username(player2.username)
    }
    if (player1.socket && player2.socket) {
      this.gameService.setGameSocket(this.socket);
      this.player1 = this.gameService.getPlayer1();
      this.player2 = this.gameService.getPlayer2();
    }
  }

  update() {
    this.gameService.run();
    this.draw();
    this.endGame();
    this.currentAnimationFrameId = window.requestAnimationFrame(this.update.bind(this));
  }

  draw() {
    this.canvas.clearRect(0, 0, this.gameCanvas.nativeElement.width, this.gameCanvas.nativeElement.height);
    this.drawLines();
    this.drawScore();
    this.drawNames();
    this.drawPowerUp(this.powerUp)

    if (!this.finished)
      this.drawBall(this.gameService.getBall());
    this.updatePaddles(this.gameService.getPlayer1(), this.gameService.getPlayer2());
  }

  updateScore() {
    this.socket.on("updateScore", (scoreP1: any, scoreP2: any, finished: any) => {
      this.scoreP1 = scoreP1;
      this.scoreP2 = scoreP2;
      this.finished = finished;
      if (finished) {
        this.finish('score', 0);
      }
    })
  }

  endGame() {
    this.socket.once('connect_error', () => {
      this.finished = true;
      this.finishedMessage = 'Server is off';
      this.finish('down', 0)
    })
    this.socket.once("endGame", (disconnected: any) => {
      this.finished = true;
      this.finish('disconnect', disconnected);
    })
  }

  finish(reason: any, disconnected: any) {
    if (reason == 'down') {
      this.drawFinish();
      //this.socket.disconnect();
    }
    else if (this.mode != 'spec' && !(this.finishedMessage))
      this.socket.emit("finishMessage", this.gameService.getFinalMessage(reason, disconnected), this.gameService.getWinner(reason, disconnected));
    this.socket.once("winner", (message: any) => {
	if (!this.finishedMessage)
      		this.finishedMessage = message;
      this.drawFinish();
      this.chatSocket.emit('setStatus', this.username, "online")
      //this.socket.removeAllListeners();
      //this.socket.disconnect();
    })
  }

  drawFinish() {
    window.cancelAnimationFrame(this.currentAnimationFrameId as number);
    this.canvas.clearRect(0, 0, this.gameCanvas.nativeElement.width, this.gameCanvas.nativeElement.height);
    this.updatePaddles(this.gameService.getPlayer1(), this.gameService.getPlayer2());
    this.drawScore();
    if (this.player1 && this.player2)
      this.drawNames();
    this.canvas.font = '10vh Roboto, Futura, sans-serif';
    this.canvas.textBaseline = 'middle';
    this.canvas.textAlign = 'center';
    this.canvas.fillText(this.finishedMessage, 640, 360);
    this.canvas.font = '3vh Roboto, Futura, sans-serif';
  }

  updatePaddles(P1: any, P2: any) {
    this.canvas.fillRect(P1.x, P1.y, P1.width, P1.height);
    this.canvas.fillRect(P2.x, P2.y, P2.width, P2.height);
  }

  drawBall(ball: any) {
    this.canvas.beginPath();
    this.canvas.arc(ball.x, ball.y, ball.radius * 2, 0, Math.PI * 2, true);
    this.canvas.closePath();
    this.canvas.fill();
  }

  drawLines() {
    this.gameCanvas.nativeElement.getContext("2d").fillStyle = "#999999";
    for (let x = 3; x < 720;) {
      this.gameCanvas.nativeElement.getContext("2d").fillRect(640, x, 12, 10);
      x += 20;
    }
    this.gameCanvas.nativeElement.getContext("2d").fillStyle = "white";
  }

  drawPowerUp(powerUp: any) {
    let ctx = this.gameCanvas.nativeElement.getContext("2d");
    if (powerUp && powerUp.show) {
      var img = document.getElementById("powerUp");
      ctx.drawImage(img, powerUp.x, powerUp.y, 100, 100);
    }
  }

  drawScore() {
    this.canvas.font = '80px Roboto, Futura, sans-serif';
    this.canvas.textBaseline = 'middle';
    this.canvas.textAlign = 'center';
    this.canvas.fillText(this.scoreP1, 320, 50);
    this.canvas.fillText(this.scoreP2, 960, 50);
  }

  drawNames() {
    this.canvas.font = '30px Roboto, Futura, sans-serif';
    this.canvas.textBaseline = 'middle';
    this.canvas.textAlign = 'center';
    this.canvas.fillText(this.player1.username, 320, 680);
    this.canvas.fillText(this.player2.username, 960, 680);
  }

  cancelChallenge() {
    this.socket.emit("cancelChallenge", this.username, this.challenged)
    window.location.reload();
    this.socket.once("removeChallenge", () => {
      window.location.reload();
    })
  }

  esc() {
    if (this.challenged)
      this.cancelChallenge()
    else
      window.location.reload();
  }
}
