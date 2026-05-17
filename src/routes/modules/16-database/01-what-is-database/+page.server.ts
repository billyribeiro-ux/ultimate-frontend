import { db } from '$lib/server/db';
import { sql } from 'drizzle-orm';
import type { Actions, PageServerLoad } from './$types';

// In-memory counter — resets on server restart
let memoryCount: number = 0;

export const load: PageServerLoad = async () => {
	// Ensure a counter row exists in the database
	db.run(sql`CREATE TABLE IF NOT EXISTS lesson_counters (key TEXT PRIMARY KEY, value INTEGER NOT NULL DEFAULT 0)`);
	db.run(sql`INSERT OR IGNORE INTO lesson_counters (key, value) VALUES ('db_counter', 0)`);

	const row = db.get<{ value: number }>(sql`SELECT value FROM lesson_counters WHERE key = 'db_counter'`);
	const dbCount: number = row?.value ?? 0;

	return { memoryCount, dbCount };
};

export const actions: Actions = {
	incrementMemory: async () => {
		memoryCount += 1;
		return { incremented: 'memory' as const };
	},
	incrementDb: async () => {
		db.run(sql`UPDATE lesson_counters SET value = value + 1 WHERE key = 'db_counter'`);
		return { incremented: 'db' as const };
	}
};
