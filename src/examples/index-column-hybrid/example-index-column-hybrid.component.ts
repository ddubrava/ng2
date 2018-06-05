import { Component, OnInit } from '@angular/core';
import { DataService, Atom } from '../data.service';
import { Observable } from 'rxjs';

@Component({
	selector: 'example-index-column-hybrid',
	templateUrl: 'example-index-column-hybrid.component.html',
	styleUrls: ['example-index-column-hybrid.component.scss'],
	providers: [DataService]
})
export class ExampleIndexColumnHybridComponent {
	rows: Observable<Atom[]>;

	constructor(dataService: DataService) {
		this.rows = dataService.getAtoms();
	}
}