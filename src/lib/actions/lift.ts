import type { Action } from 'svelte/action';
import { gsap } from 'gsap';
import { prefersReducedMotion } from 'svelte/motion';

export type LiftParams = {
	distance?: number;
	duration?: number;
};

/**
 * Svelte use: action that lifts an element on pointer enter or focus using GSAP.
 * Cleans up both listeners and the GSAP tweens on element unmount.
 */
export const lift: Action<HTMLElement, LiftParams | undefined> = (node, params) => {
	const state = { distance: params?.distance ?? -6, duration: params?.duration ?? 0.2 };

	const up = (): void => {
		if (prefersReducedMotion.current) {
			gsap.set(node, { y: state.distance });
			return;
		}
		gsap.to(node, { y: state.distance, duration: state.duration, ease: 'power2.out' });
	};

	const down = (): void => {
		if (prefersReducedMotion.current) {
			gsap.set(node, { y: 0 });
			return;
		}
		gsap.to(node, { y: 0, duration: state.duration, ease: 'power2.out' });
	};

	node.addEventListener('pointerenter', up);
	node.addEventListener('pointerleave', down);
	node.addEventListener('focusin', up);
	node.addEventListener('focusout', down);

	return {
		update(newParams) {
			state.distance = newParams?.distance ?? -6;
			state.duration = newParams?.duration ?? 0.2;
		},
		destroy() {
			node.removeEventListener('pointerenter', up);
			node.removeEventListener('pointerleave', down);
			node.removeEventListener('focusin', up);
			node.removeEventListener('focusout', down);
			gsap.killTweensOf(node);
		}
	};
};
