/**
 * Shared real-time message types for Module 17.
 *
 * All WebSocket and SSE messages use discriminated unions so TypeScript
 * can narrow the type based on the `type` field alone.
 */

// ---------------------------------------------------------------------------
// SSE Event Types
// ---------------------------------------------------------------------------

export interface SSEEvent<T = unknown> {
	readonly id?: string;
	readonly event?: string;
	readonly data: T;
	readonly retry?: number;
}

export interface TimeTickData {
	readonly iso: string;
	readonly unix: number;
}

export interface CounterData {
	readonly count: number;
	readonly startedAt: string;
}

export type NotificationType = 'info' | 'success' | 'warning' | 'error';

export interface NotificationData {
	readonly id: string;
	readonly type: NotificationType;
	readonly title: string;
	readonly body: string;
	readonly timestamp: string;
}

// ---------------------------------------------------------------------------
// WebSocket Message Types (discriminated union)
// ---------------------------------------------------------------------------

export type WSClientMessage =
	| { readonly type: 'chat:send'; readonly payload: ChatSendPayload }
	| { readonly type: 'cursor:move'; readonly payload: CursorMovePayload }
	| { readonly type: 'presence:join'; readonly payload: PresenceJoinPayload }
	| { readonly type: 'presence:leave'; readonly payload: PresenceLeavePayload };

export type WSServerMessage =
	| { readonly type: 'chat:message'; readonly payload: ChatMessagePayload }
	| { readonly type: 'cursor:update'; readonly payload: CursorUpdatePayload }
	| { readonly type: 'presence:list'; readonly payload: PresenceListPayload }
	| { readonly type: 'presence:joined'; readonly payload: PresenceJoinedPayload }
	| { readonly type: 'presence:left'; readonly payload: PresenceLeftPayload }
	| { readonly type: 'error'; readonly payload: ErrorPayload };

export interface ChatSendPayload {
	readonly text: string;
}

export interface ChatMessagePayload {
	readonly id: string;
	readonly userId: string;
	readonly username: string;
	readonly text: string;
	readonly timestamp: string;
}

export interface CursorMovePayload {
	readonly x: number;
	readonly y: number;
}

export interface CursorUpdatePayload {
	readonly userId: string;
	readonly username: string;
	readonly x: number;
	readonly y: number;
	readonly color: string;
}

export interface PresenceJoinPayload {
	readonly username: string;
}

export interface PresenceLeavePayload {
	readonly reason?: string;
}

export interface PresenceJoinedPayload {
	readonly userId: string;
	readonly username: string;
}

export interface PresenceLeftPayload {
	readonly userId: string;
	readonly username: string;
}

export interface PresenceListPayload {
	readonly users: ReadonlyArray<{ readonly userId: string; readonly username: string }>;
}

export interface ErrorPayload {
	readonly code: string;
	readonly message: string;
}
