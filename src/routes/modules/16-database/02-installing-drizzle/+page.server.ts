import { db } from '$lib/server/db';
import { sql } from 'drizzle-orm';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const versionRow = db.get<{ version: string }>(sql`SELECT sqlite_version() as version`);
	const walRow = db.get<{ journal_mode: string }>(sql`PRAGMA journal_mode`);
	const tablesResult = db.all<{ name: string }>(
		sql`SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' AND name NOT LIKE '__drizzle%' ORDER BY name`
	);

	const tables: string[] = tablesResult.map((r) => r.name);

	return {
		dbInfo: {
			path: 'data/dev.db',
			sqliteVersion: versionRow?.version ?? 'unknown',
			walMode: walRow?.journal_mode ?? 'unknown',
			tableCount: tables.length,
			tables
		}
	};
};
