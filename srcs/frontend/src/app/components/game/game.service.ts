import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class OnlineGameService {

  challenged: any;
  powerUps: any;
  p1Username: any;

  constructor() { }

  challenge(username: any) {
    this.challenged = username;
  }

  togglePowerUps(powerUps: any) {
    this.powerUps = powerUps;
  }

  spec(username: string) {
    this.p1Username = username;
  }
}
