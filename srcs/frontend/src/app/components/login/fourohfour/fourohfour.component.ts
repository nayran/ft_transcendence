import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
	selector: 'app-fourohfour',
	templateUrl: './fourohfour.component.html',
	styleUrls: ['./fourohfour.component.scss']
})
export class FourohfourComponent {

	constructor(
		private router: Router
	) { }

	returnHome() {
		this.router.navigate(['/home']);
	}

}
