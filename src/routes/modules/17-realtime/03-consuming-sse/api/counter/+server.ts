import type { RequestHandler } from '@sveltejs/kit';
import { createSSEStream, delay } from '$lib/realtime/sse.js';
import type { CounterData, SSEEvent } from '$lib/realtime/types.js';

/**
 * GET /modules/17-realtime/03-consuming-sse/api/counter
 *
 * Streams an incrementing counter every 2 seconds.
 * Used by Lesson 17.3 to demonstrate consuming SSE in Svelte 5
 * with $state and $effect.
 */
export const GET: RequestHandler = () => {
	let count = 0;
	const startedAt = new Date().toISOString();

	return createSSEStream<CounterData>(async function* (signal) {
		yield {
			id: String(count),
			event: 'counter',
			data: { count, startedAt },
			retry: 5000
		} satisfies SSEEvent<CounterData>;

		while (!signal.aborted) {
			try {
				await delay(2000, signal);
			} catch {
				break;
			}
			count++;

			yield {
				id: String(count),
				event: 'counter',
				data: { count, startedAt }
			} satisfies SSEEvent<CounterData>;
		}
	});
};
