import * as v from 'valibot';
import { query, command } from '$app/server';

// Module-level state. Resets on dev reload. Replace with real storage in production.
let count = 0;

export const getCount = query(async (): Promise<number> => count);

export const increment = command(
	v.optional(v.number(), 1),
	async (delta): Promise<number> => {
		count += delta;
		// Push the new value directly into the cache — no query handler re-run.
		getCount().set(count);
		return count;
	}
);

export const reset = command(async (): Promise<number> => {
	count = 0;
	// Use refresh() to show the alternative path.
	await getCount().refresh();
	return count;
});
