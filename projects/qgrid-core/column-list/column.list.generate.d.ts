import { ColumnModel } from '../column-type/column.model';
import { Model } from '../model/model';

export declare interface ColumnListGenerationSettings {
	columnFactory: (type: string) => ColumnModel;
	deep: boolean;
	cohort: boolean;
	rows: any[];
	testNumber: number;
}

export declare function generateFactory(model: Model): () => { hasChanges: boolean, columns: any[] };
export declare function generate(settings: ColumnListGenerationSettings): ColumnModel[];