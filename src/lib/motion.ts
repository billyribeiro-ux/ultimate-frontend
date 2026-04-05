/**
 * PE7 motion tokens mirrored for JavaScript consumption.
 * The CSS equivalents live in src/app.css as --dur-* and --ease-* custom properties.
 * Keep these in sync manually — Tween, Spring, GSAP, and Svelte transitions all
 * read durations from this file.
 */
export const DUR = {
	instant: 100,
	fast: 200,
	base: 300,
	slow: 500,
	slower: 800
} as const;

export type DurationName = keyof typeof DUR;

/** Convert milliseconds to seconds for GSAP (which uses seconds). */
export function toSeconds(ms: number): number {
	return ms / 1000;
}
