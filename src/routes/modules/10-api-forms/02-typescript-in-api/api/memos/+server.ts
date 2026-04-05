import * as v from 'valibot';
import { json, error, type RequestHandler } from '@sveltejs/kit';

export interface Memo {
	readonly id: string;
	readonly title: string;
	readonly createdAt: string;
}

export interface CreateMemoResponse {
	readonly memo: Memo;
}

export interface ListMemosResponse {
	readonly memos: Memo[];
}

const createMemoSchema = v.object({
	title: v.pipe(v.string(), v.minLength(1, 'Title is required'), v.maxLength(100))
});

// Module-level store. Resets on dev reload. Replace with a database in production.
const memos: Memo[] = [
	{ id: 'seed', title: 'First memo', createdAt: new Date('2026-04-01').toISOString() }
];

export const GET: RequestHandler = async () => {
	const body: ListMemosResponse = { memos: [...memos].reverse() };
	return json(body);
};

export const POST: RequestHandler = async ({ request }) => {
	const raw: unknown = await request.json().catch(() => null);
	const parsed = v.safeParse(createMemoSchema, raw);
	if (!parsed.success) {
		error(400, parsed.issues[0]?.message ?? 'Invalid body');
	}
	const memo: Memo = {
		id: crypto.randomUUID(),
		title: parsed.output.title,
		createdAt: new Date().toISOString()
	};
	memos.push(memo);
	const body: CreateMemoResponse = { memo };
	return json(body, { status: 201 });
};
