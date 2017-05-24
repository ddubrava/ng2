import {View} from '../view';
import * as columnService from '../column/column.service';
import {Aggregation} from '../services';
import {AppError, Log} from '../infrastructure';
import {Node} from '../node';
import {getFactory as valueFactory, set as setValue} from '../services/value';
import {getFactory as labelFactory, set as setLabel} from '../services/label';

export class BodyView extends View {
	constructor(model, table) {
		super(model);

		this.table = table;
		this.rows = [];
		this.columns = [];

		model.viewChanged.watch(() => this.invalidate(model));
	}

	invalidate(model) {
		Log.info('view.body', 'invalidate');

		this.invalidateRows(model);
		this.invalidateColumns(model);
	}

	invalidateRows(model) {
		this.table.view.removeLayer('blank');
		this.rows = model.view().rows;
		if (!this.rows.length) {
			const layerState = model.layer();
			if (layerState.resource.data.hasOwnProperty('blank')) {
				const layer = this.table.view.addLayer('blank');
				layer.resource('blank', layerState.resource);
			}
		}
	}

	invalidateColumns(model) {
		const columns = model.view().columns;
		this.columns = columnService.lineView(columns);
	}

	valueFactory(column) {
		const model = this.model;
		const getValue = valueFactory(column);

		return row => {
			if (row instanceof Node) {
				const node = row;
				const rows = model.data().rows;
				switch (node.type) {
					case 'group': {
						const aggregation = column.aggregation;
						if (aggregation) {
							if (!Aggregation.hasOwnProperty(aggregation)) {
								throw new AppError(
									'view.body',
									`Aggregation ${aggregation} is not registered`);
							}

							const groupRows = node.rows.map(i => rows[i]);
							return Aggregation[aggregation](groupRows, getValue, column.aggregationOptions);
						}

						return null;
					}
					case 'row': {
						const rowIndex = node.rows[0];
						return getValue(rows[rowIndex], column);
					}
					default:
						throw new AppError(
							'view.body',
							`Invalid node type ${node.type}`
						);
				}
			}

			return getValue(row);
		};
	}

	labelFactory(column) {
		const getLabel = labelFactory(column);
		return row => getLabel(row);
	}

	value(row, column, value) {
		if (arguments.length == 3) {
			setValue(row, column, value);
			return;
		}

		const getValue = this.valueFactory(column);
		return getValue(row);
	}

	label(row, column, value) {
		if (arguments.length === 3) {
			setLabel(row, column, value);
			return;
		}

		const getLabel = labelFactory(column);
		return getLabel(row);
	}
}