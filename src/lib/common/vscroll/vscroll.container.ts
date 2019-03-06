import { EventEmitter } from '@angular/core';
import { isUndefined, isNumber, isFunction } from 'ng2-qgrid/core/utility/kit';
import { IVscrollSettings } from './vscroll.settings';
import { AppError } from 'ng2-qgrid/core/infrastructure/error';

export const rAF = window.requestAnimationFrame || window.webkitRequestAnimationFrame;

export class VscrollContainer {
	constructor(private settings: IVscrollSettings) {
	}

	count = 0;
	total = 0;
	position = 0;
	cursor = 0;
	lastPage = 0;
	items = [];
	force = true;
	resetEvent = new EventEmitter<{ handled: boolean, source: string }>();
	updateEvent = new EventEmitter<{ force: boolean }>();
	drawEvent = new EventEmitter<{ position: number }>();

	tick(f: () => void) {
		rAF(f);
	}

	read(f: () => void) {
		f();
	}

	write(f: () => void) {
		f();
	}

	apply(f: () => void, emit: (f: () => void) => void) {
		emit(f);
	}

	get currentPage() {
		const threshold = this.settings.threshold;
		const cursor = this.cursor;
		return Math.ceil((cursor + threshold) / threshold) - 1;
	}

	update(count: number) {
		const settings = this.settings;

		if (this.count !== count) {
			console.log('UPDATE: ' + count);

			this.count = count;
			this.total = Math.max(this.total, count);
			this.updateEvent.emit({
				force: this.force
					|| (isNumber(settings.rowHeight) && settings.rowHeight > 0)
					|| (isNumber(settings.columnWidth) && settings.columnWidth > 0)
			});
		}

		const { lastPage, currentPage } = this;
		if (currentPage > lastPage) {
			this.fetchPage(currentPage);
		}
	}

	fetchPage(page: number) {
		console.log('FETCH: ' + page);
		const { settings, lastPage } = this;
		const { threshold } = settings;

		this.lastPage = page;

		new Promise<number>((resolve, reject) => {
			const deferred = { resolve, reject };
			if (page === 0) {
				settings.fetch(0, threshold, deferred);
			} else {
				const skip = (lastPage + 1) * threshold;
				if (this.total < skip) {
					deferred.resolve(this.total);
				} else {
					const take = (page - lastPage) * threshold;
					settings.fetch(skip, take, deferred);
				}
			}
		}).then(count => {
			if (count > this.total) {
				this.force = true;
				this.update(count);
			}
		});
	}

	reset() {
		this.count = 0;
		this.total = 0;
		this.position = 0;
		this.cursor = 0;
		this.lastPage = 0;
		this.items = [];
		this.force = true;

		const e = { handled: false, source: 'container' };
		this.resetEvent.emit(e);

		this.fetchPage(0);
	}
}

export type VscrollSize = (element: HTMLElement, index: number) => number;

export function sizeFactory(
	size: number | VscrollSize,
	container: VscrollContainer,
	element: HTMLElement,
	index: number
): () => number {
	if (isFunction(size)) {
		return () => (size as VscrollSize)(element, container.position + index);
	}

	if (isNumber(size)) {
		return () => size as number;
	}

	throw new AppError('vscroll.utility', `Invalid size ${size}`);
}
