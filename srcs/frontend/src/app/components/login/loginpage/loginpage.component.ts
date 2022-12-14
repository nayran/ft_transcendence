import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { EventManager } from '@angular/platform-browser';
import { interval } from 'rxjs';
import { AlertsService } from 'src/app/alerts/alerts.service';
import { AuthService } from 'src/app/auth/auth.service';


class Ball {
	public x: number = 0;
	public y: number = 0;
	public radius: number = 0;
	public color: string = '';
	public vx: number = 0;
	public vy: number = 0;
	public removing: boolean = false;
	public alpha: number = 500;
	private colors = ["#111111", "#333333", "#7777777", "#999999", "#bbbbbb", "#dddddd", "#ffffff", "#f47b37", "#fcb338", "#fcc816"];

	constructor(canvas_x: number, canvas_y: number, x: number = 0, y: number = 0) {
		var rndColor = Math.floor((Math.random() * this.colors.length) + 1);
		this.vx = ((Math.random() * 9) + 1) * (Math.floor(Math.random() * 2) ? 1 : -1);
		this.vy = ((Math.random() * 9) + 1) * (Math.floor(Math.random() * 2) ? 1 : -1);;
		this.color = this.colors[rndColor];
		this.radius = Math.floor((Math.random() * 5) + 1);
		this.x = x;
		this.y = y;
		if (this.x == 0) this.x = Math.floor((Math.random() * canvas_x - 40) + 20);
		if (this.y == 0) this.y = Math.floor((Math.random() * canvas_y - 40) + 20);
	}

	update(canvas_x: number, canvas_y: number) {
		this.x += this.vx;
		this.y += this.vy;
		if (this.y <= 10 || this.y >= canvas_y)
			this.vy = -this.vy;
		if (this.x <= 10 || this.x >= canvas_x)
			this.vx = -this.vx;
		if (this.removing && this.alpha > 0)
			this.alpha -= 1;
	}

}

@Component({
	selector: 'app-loginpage',
	templateUrl: './loginpage.component.html',
	styleUrls: ['./loginpage.component.scss']
})
export class LoginpageComponent {

	constructor() { }

	login() {
		window.location.href = '/auth/login';
	}
}
