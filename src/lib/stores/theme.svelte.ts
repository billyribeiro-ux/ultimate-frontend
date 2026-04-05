/**
 * Typed theme store backed by a reactive class. This is the object
 * we pass through Svelte's context API in Lesson 11.2 so that every
 * descendant component can read and write the current theme without
 * prop drilling.
 */

export type ThemeMode = 'light' | 'dark' | 'auto';

class ThemeStore {
	mode = $state<ThemeMode>('auto');
	accent = $state<string>('oklch(72% 0.2 85)');

	readonly isDark = $derived(
		this.mode === 'dark' ||
			(this.mode === 'auto' &&
				typeof window !== 'undefined' &&
				window.matchMedia('(prefers-color-scheme: dark)').matches)
	);

	setMode(mode: ThemeMode): void {
		this.mode = mode;
	}

	setAccent(accent: string): void {
		this.accent = accent;
	}
}

export const theme = new ThemeStore();

/**
 * The context key used by Lesson 11.2. Using a `Symbol` guarantees
 * that context keys from different files can never collide by name.
 */
export const THEME_KEY: symbol = Symbol('theme');
export type ThemeContext = ThemeStore;
