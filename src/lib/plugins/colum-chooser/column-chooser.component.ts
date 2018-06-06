import { Component, Optional, Input, Output, ElementRef, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { RootService } from '../../infrastructure/component/root.service';
import { PluginComponent } from '../plugin.component';
import { ColumnChooserView } from 'ng2-qgrid/plugin/column-chooser/column.chooser.view';
import { FocusAfterRender } from '../../common/focus/focus.service';

const ColumnChooserName = 'qGridColumnChooser';

@Component({
	selector: 'q-grid-column-chooser',
	templateUrl: './column-chooser.component.html',
	providers: [FocusAfterRender]
})
export class ColumnChooserComponent extends PluginComponent implements OnInit {
	@Input('canAggregate') columnChooserCanAggregate: boolean;
	@Output('submit') submitEvent = new EventEmitter<any>();
	@Output('cancel') cancelEvent = new EventEmitter<any>();

	constructor(
		@Optional() root: RootService, 
		focusAfterRender: FocusAfterRender,
		private element: ElementRef) {
		super(root);

		this.models = ['columnChooser'];
	}

	ngOnInit() {
		const model = this.model;

		const element = this.element.nativeElement;
		// model.style().classList.forEach(cssClass => {
		// 	element.classList.add(cssClass);
		// });
	}

	onReady() {
		const context = {
			name: ColumnChooserName
		};

		const columnChooser = new ColumnChooserView(this.model, context);
		columnChooser.submitEvent.on(() => this.submitEvent.emit());
		columnChooser.cancelEvent.on(() => this.cancelEvent.emit());

		this.context = { $implicit: columnChooser };
	}
}
