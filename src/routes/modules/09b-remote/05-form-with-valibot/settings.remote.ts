import * as v from 'valibot';
import { form } from '$app/server';

// Shared schema definition. NOTE: this schema is used server-side only.
// The preflight schema lives in +page.svelte's <script module>.
const schema = v.object({
	displayName: v.pipe(
		v.string(),
		v.minLength(2, 'Display name must be at least 2 characters'),
		v.maxLength(40, 'Display name must be at most 40 characters')
	),
	theme: v.picklist(['light', 'dark', 'system'], 'Pick a theme'),
	notifications: v.optional(v.boolean(), false)
});

export interface Settings {
	readonly displayName: string;
	readonly theme: 'light' | 'dark' | 'system';
	readonly notifications: boolean;
}

// Module-level store. Resets on dev reload. Replace with a database in production.
let current: Settings = {
	displayName: 'Ada',
	theme: 'system',
	notifications: true
};

export const updateSettings = form(schema, async (data) => {
	// Simulate a tiny write delay so the pending state is visible.
	await new Promise((r) => setTimeout(r, 200));
	current = { ...data };
	return { ok: true as const, saved: current };
});
