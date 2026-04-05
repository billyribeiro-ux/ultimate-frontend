import type { Action } from 'svelte/action';
import { gsap } from 'gsap';
import { prefersReducedMotion } from 'svelte/motion';

export type RevealParams = {
	y?: number;
	duration?: number;
	delay?: number;
	threshold?: number;
	rootMargin?: string;
};

/**
 * Reveal an element the first time it intersects the viewport. Uses
 * IntersectionObserver for cheap scroll observation and GSAP for the
 * actual tween. Honours reduced motion by skipping the animation entirely.
 */
export const revealOnScroll: Action<HTMLElement, RevealParams | undefined> = (
	node,
	params
) => {
	const {
		y = 40,
		duration = 0.7,
		delay = 0,
		threshold = 0,
		rootMargin = '0px 0px -10% 0px'
	} = params ?? {};

	if (!prefersReducedMotion.current) {
		gsap.set(node, { y, opacity: 0 });
	}

	const observer = new IntersectionObserver(
		(entries) => {
			for (const entry of entries) {
				if (!entry.isIntersecting) continue;

				if (prefersReducedMotion.current) {
					gsap.set(node, { y: 0, opacity: 1 });
				} else {
					gsap.to(node, {
						y: 0,
						opacity: 1,
						duration,
						delay,
						ease: 'power2.out'
					});
				}
				observer.unobserve(node);
			}
		},
		{ threshold, rootMargin }
	);

	observer.observe(node);

	return {
		destroy() {
			observer.disconnect();
			gsap.killTweensOf(node);
		}
	};
};
