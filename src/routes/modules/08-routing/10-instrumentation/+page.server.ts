// Lesson 8.10 — a stand-in for a real OpenTelemetry span.
// We measure the load function's own duration with performance.now() and
// return it alongside a simulated small amount of work. In a real project,
// this number would be the duration of a child span whose parent is the
// request span created in hooks.server.ts via tracer.startActiveSpan().

import type { PageServerLoad } from './$types';

interface TraceData {
	loadDuration: number;
	simulatedWork: number;
	timestamp: string;
}

export const load: PageServerLoad = async (): Promise<TraceData> => {
	const start = performance.now();
	// Simulated work so the number is visible in the UI.
	const simulatedWork = 25 + Math.random() * 25;
	await new Promise((resolve) => setTimeout(resolve, simulatedWork));
	const loadDuration = performance.now() - start;

	return {
		loadDuration,
		simulatedWork,
		timestamp: new Date().toISOString()
	};
};
