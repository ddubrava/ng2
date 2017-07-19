import {Command} from './command';

export declare class Action {
	constructor(command: Command, title: string, icon: string);
	command: Command;
	title: string;
	icon: string;
}