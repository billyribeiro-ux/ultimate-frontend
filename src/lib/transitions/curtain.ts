import type { TransitionConfig } from 'svelte/transition';
import { cubicOut } from 'svelte/easing';

export type CurtainParams = {
	duration?: number;
	delay?: number;
};

/**
 * A custom CSS-based Svelte transition that reveals an element with a
 * horizontal clip-path wipe. Runs on the compositor.
 */
export function curtain(
	_node: HTMLElement,
	{ duration = 500, delay = 0 }: CurtainParams = {}
): TransitionConfig {
	return {
		delay,
		duration,
		easing: cubicOut,
		css: (t) => `clip-path: inset(0 ${(1 - t) * 100}% 0 0); opacity: ${t};`
	};
}

export type TypewriterParams = {
	speed?: number;
};

/**
 * A custom tick-based Svelte transition that reveals text one character at a
 * time. Only works on elements whose only child is a text node.
 */
export function typewriter(
	node: HTMLElement,
	{ speed = 1 }: TypewriterParams = {}
): TransitionConfig {
	const valid = node.childNodes.length === 1 && node.childNodes[0].nodeType === Node.TEXT_NODE;
	if (!valid) {
		throw new Error('typewriter only works on elements with a single text-node child');
	}
	const text = node.textContent ?? '';
	const duration = Math.max(200, text.length / (speed * 0.02));
	return {
		duration,
		tick: (t) => {
			const i = Math.floor(text.length * t);
			node.textContent = text.slice(0, i);
		}
	};
}
