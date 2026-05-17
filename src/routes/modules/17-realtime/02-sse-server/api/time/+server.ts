import type { RequestHandler } from '@sveltejs/kit';
import { createSSEStream, delay } from '$lib/realtime/sse.js';
import type { TimeTickData, SSEEvent } from '$lib/realtime/types.js';

/**
 * GET /modules/17-realtime/02-sse-server/api/time
 *
 * Streams the current server time every second as an SSE event.
 * Each event has an incrementing id so clients can resume after disconnect.
 */
export const GET: RequestHandler = () => {
	let counter = 0;

	return createSSEStream<TimeTickData>(async function* (signal) {
		// Send retry instruction on first event
		yield {
			id: String(counter),
			event: 'time',
			data: {
				iso: new Date().toISOString(),
				unix: Date.now()
			},
			retry: 3000
		} satisfies SSEEvent<TimeTickData>;
		counter++;

		while (!signal.aborted) {
			try {
				await delay(1000, signal);
			} catch {
				break;
			}

			yield {
				id: String(counter),
				event: 'time',
				data: {
					iso: new Date().toISOString(),
					unix: Date.now()
				}
			} satisfies SSEEvent<TimeTickData>;
			counter++;
		}
	});
};
