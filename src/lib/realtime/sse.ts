/**
 * Typed SSE helpers for Module 17.
 *
 * createSSEStream() returns a Response with `text/event-stream` content type
 * and all the correct headers for Server-Sent Events. It accepts a generator
 * function that yields SSEEvent objects.
 */

import type { SSEEvent } from './types.js';

/**
 * Formats a single SSE event into the wire format.
 * Each field is a line: "field: value\n". The event ends with "\n\n".
 */
export function formatSSEEvent<T>(event: SSEEvent<T>): string {
	const lines: string[] = [];

	if (event.id !== undefined) {
		lines.push(`id: ${event.id}`);
	}
	if (event.event !== undefined) {
		lines.push(`event: ${event.event}`);
	}
	if (event.retry !== undefined) {
		lines.push(`retry: ${event.retry}`);
	}

	const dataStr = typeof event.data === 'string' ? event.data : JSON.stringify(event.data);
	// SSE spec: multi-line data needs each line prefixed with "data: "
	const dataLines = dataStr.split('\n');
	for (const line of dataLines) {
		lines.push(`data: ${line}`);
	}

	return lines.join('\n') + '\n\n';
}

/**
 * Options for creating an SSE stream.
 */
export interface CreateSSEStreamOptions {
	/** Headers to include in the response. */
	readonly headers?: Record<string, string>;
	/** Called when the client disconnects. Use for cleanup. */
	readonly onClose?: () => void;
}

/**
 * Creates an SSE Response from an async generator that yields SSE events.
 *
 * Usage in a +server.ts GET handler:
 *
 * ```ts
 * export const GET: RequestHandler = () => {
 *   return createSSEStream(async function* (signal) {
 *     while (!signal.aborted) {
 *       yield { data: { time: Date.now() } };
 *       await delay(1000);
 *     }
 *   });
 * };
 * ```
 */
export function createSSEStream<T>(
	generator: (signal: AbortSignal) => AsyncGenerator<SSEEvent<T>, void, unknown>,
	options: CreateSSEStreamOptions = {}
): Response {
	const controller = new AbortController();
	const { signal } = controller;

	const stream = new ReadableStream<Uint8Array>({
		async start(streamController) {
			const encoder = new TextEncoder();
			try {
				for await (const event of generator(signal)) {
					if (signal.aborted) break;
					const formatted = formatSSEEvent(event);
					streamController.enqueue(encoder.encode(formatted));
				}
			} catch (err) {
				if (!signal.aborted) {
					streamController.error(err);
				}
			} finally {
				try {
					streamController.close();
				} catch {
					// Already closed
				}
				options.onClose?.();
			}
		},
		cancel() {
			controller.abort();
			options.onClose?.();
		}
	});

	return new Response(stream, {
		headers: {
			'Content-Type': 'text/event-stream',
			'Cache-Control': 'no-cache',
			Connection: 'keep-alive',
			'X-Accel-Buffering': 'no',
			...options.headers
		}
	});
}

/**
 * Promise-based delay helper. Rejects if signal is aborted.
 */
export function delay(ms: number, signal?: AbortSignal): Promise<void> {
	return new Promise((resolve, reject) => {
		if (signal?.aborted) {
			reject(new DOMException('Aborted', 'AbortError'));
			return;
		}
		const timer = setTimeout(resolve, ms);
		signal?.addEventListener(
			'abort',
			() => {
				clearTimeout(timer);
				reject(new DOMException('Aborted', 'AbortError'));
			},
			{ once: true }
		);
	});
}
