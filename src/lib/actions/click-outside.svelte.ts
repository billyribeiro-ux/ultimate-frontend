import type { Action } from 'svelte/action';

export interface ClickOutsideParams {
	onOutside: () => void;
	enabled?: boolean;
}

export const clickOutside: Action<HTMLElement, ClickOutsideParams> = (node, initial) => {
	let params = initial;

	function handle(event: MouseEvent): void {
		if (params.enabled === false) return;
		if (!node.contains(event.target as Node)) {
			params.onOutside();
		}
	}

	if (typeof document !== 'undefined') {
		document.addEventListener('click', handle, true);
	}

	return {
		update(next: ClickOutsideParams): void {
			params = next;
		},
		destroy(): void {
			if (typeof document !== 'undefined') {
				document.removeEventListener('click', handle, true);
			}
		}
	};
};
