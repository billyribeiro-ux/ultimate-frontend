import type { RequestHandler } from '@sveltejs/kit';
import { createSSEStream, delay } from '$lib/realtime/sse.js';
import type { NotificationData, NotificationType, SSEEvent } from '$lib/realtime/types.js';

const NOTIFICATION_TITLES: Record<NotificationType, string[]> = {
	info: ['New collaborator joined', 'Board updated', 'Export ready'],
	success: ['File saved', 'Changes deployed', 'Tests passed'],
	warning: ['Connection unstable', 'Rate limit approaching', 'Session expiring'],
	error: ['Upload failed', 'Sync conflict detected', 'Permission denied']
};

const NOTIFICATION_BODIES: Record<NotificationType, string[]> = {
	info: ['A new user has joined the collaboration board.', 'The board state was updated by another user.', 'Your export is ready to download.'],
	success: ['All changes have been persisted.', 'Your latest changes are live.', 'All 42 tests passed in 1.2s.'],
	warning: ['Retrying connection in 3 seconds.', 'You have used 80% of your quota.', 'Your session will expire in 5 minutes.'],
	error: ['The file could not be uploaded. Try again.', 'Two users edited the same item.', 'You do not have access to this resource.']
};

function randomNotification(): NotificationData {
	const types: NotificationType[] = ['info', 'success', 'warning', 'error'];
	const type = types[Math.floor(Math.random() * types.length)]!;
	const titles = NOTIFICATION_TITLES[type];
	const bodies = NOTIFICATION_BODIES[type];
	const idx = Math.floor(Math.random() * titles.length);

	return {
		id: crypto.randomUUID(),
		type,
		title: titles[idx]!,
		body: bodies[idx]!,
		timestamp: new Date().toISOString()
	};
}

/**
 * GET /modules/17-realtime/04-notification-feed/api/notifications
 *
 * Streams random notifications every 3-6 seconds.
 * Demonstrates a realistic notification feed with typed events.
 */
export const GET: RequestHandler = () => {
	let eventId = 0;

	return createSSEStream<NotificationData>(async function* (signal) {
		// Initial welcome notification
		yield {
			id: String(eventId++),
			event: 'notification',
			data: {
				id: crypto.randomUUID(),
				type: 'info' as const,
				title: 'Connected to notification feed',
				body: 'You will receive real-time notifications here.',
				timestamp: new Date().toISOString()
			},
			retry: 5000
		} satisfies SSEEvent<NotificationData>;

		while (!signal.aborted) {
			const delayMs = 3000 + Math.floor(Math.random() * 3000);
			try {
				await delay(delayMs, signal);
			} catch {
				break;
			}

			yield {
				id: String(eventId++),
				event: 'notification',
				data: randomNotification()
			} satisfies SSEEvent<NotificationData>;
		}
	});
};
