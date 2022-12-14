import { OnlineGameService } from '../components/game/game.service';
import { Router, ActivatedRoute } from '@angular/router';
import { Component, Input, OnInit } from '@angular/core';
import { AlertModel } from './alerts.model';
import { AlertsService } from './alerts.service';
import io from "socket.io-client";
import { AuthService } from '../auth/auth.service';

@Component({
  selector: 'app-alerts',
  templateUrl: './alerts.component.html',
  styleUrls: ['./alerts.component.scss']
})

export class AlertsComponent implements OnInit {

  socket: any;

  constructor(
    private alertsService: AlertsService,
    private auth: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private gameService: OnlineGameService
  ) { }
  alerts: AlertModel[] = [];

  ngOnInit(): void {
    this.alertsService.getAlerts().subscribe(messages => {
      this.alerts = messages;
    });
    if (this.router.url === '/login') { return; };
    if (this.auth.isAuthenticated()) {
      this.socket = io("/game");
      this.socket.connect()
      let username: any;
      this.auth.getUser().then(data => {
        username = data.username;
        this.socket.on("notifyChallenge", (challenger: any, challenged: any, powerUps: any) => {
          if (challenged == username) {
            this.alertsService.challenge(challenger,
              {
                accept_click: () => {
                  this.router.navigateByUrl('/friends', { skipLocationChange: true }).then(() => {
                    this.gameService.challenge(username);
                    this.gameService.togglePowerUps(powerUps);
                    this.router.navigate(['/pong']);
                  });
                },
                deny_click: () => {
                  this.alertsService.cancelChallenge(challenger);
                  this.socket.emit("cancelChallenge", challenger, username, true)
                }
              }
            );
          }
          this.socket.off('notifyChallenge', this.socket);
        });
        this.socket.on("removeChallenge", (challenger: any, challenged: any) => {
          if (challenged == username) {
            this.alertsService.cancelChallenge(challenger);
          }
        });
      })
    }
  }

  onClosed(dismissedAlert: any): void {
    this.alertsService.remove(dismissedAlert);
  }

}
