/**
 * Reusable IntersectionObserver-backed action.
 * Used by Module 12 lessons 12.6 and 12.12.
 */
import type { Action } from 'svelte/action';

export interface IntersectParams {
	onEnter?: () => void;
	onLeave?: () => void;
	rootMargin?: string;
	threshold?: number;
	once?: boolean;
}

export const intersect: Action<HTMLElement, IntersectParams | undefined> = (
	node,
	initial
) => {
	let params: IntersectParams = initial ?? {};

	if (typeof window === 'undefined' || typeof IntersectionObserver === 'undefined') {
		return {
			update(next: IntersectParams | undefined): void {
				params = next ?? {};
			},
			destroy(): void {
				/* noop on server */
			}
		};
	}

	const observer = new IntersectionObserver(
		(entries) => {
			for (const entry of entries) {
				if (entry.isIntersecting) {
					params.onEnter?.();
					if (params.once) observer.disconnect();
				} else {
					params.onLeave?.();
				}
			}
		},
		{
			rootMargin: params.rootMargin ?? '0px',
			threshold: params.threshold ?? 0
		}
	);

	observer.observe(node);

	return {
		update(next: IntersectParams | undefined): void {
			params = next ?? {};
		},
		destroy(): void {
			observer.disconnect();
		}
	};
};
