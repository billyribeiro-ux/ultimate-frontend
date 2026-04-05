import type { Action } from 'svelte/action';

const FOCUSABLE =
	'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export const focusTrap: Action<HTMLElement> = (node) => {
	const previouslyFocused =
		typeof document !== 'undefined'
			? (document.activeElement as HTMLElement | null)
			: null;

	function getFocusable(): HTMLElement[] {
		return Array.from(node.querySelectorAll<HTMLElement>(FOCUSABLE));
	}

	function handle(event: KeyboardEvent): void {
		if (event.key !== 'Tab') return;
		const focusable = getFocusable();
		if (focusable.length === 0) return;
		const first = focusable[0];
		const last = focusable[focusable.length - 1];
		if (event.shiftKey && document.activeElement === first) {
			last.focus();
			event.preventDefault();
		} else if (!event.shiftKey && document.activeElement === last) {
			first.focus();
			event.preventDefault();
		}
	}

	if (typeof queueMicrotask !== 'undefined') {
		queueMicrotask(() => {
			getFocusable()[0]?.focus();
		});
	}

	node.addEventListener('keydown', handle);

	return {
		destroy(): void {
			node.removeEventListener('keydown', handle);
			previouslyFocused?.focus();
		}
	};
};
