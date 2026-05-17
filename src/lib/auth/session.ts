/**
 * In-memory session management for teaching purposes.
 *
 * In production you would use a database (PostgreSQL, Redis, etc.) to store
 * sessions. This in-memory Map is sufficient for learning session mechanics
 * but resets every time the dev server restarts.
 */

import type { Session } from './types';

const SESSION_DURATION_MS: number = 1000 * 60 * 60 * 24; // 24 hours

const sessions: Map<string, Session> = new Map();

function generateId(): string {
	return crypto.randomUUID();
}

/**
 * Create a new session for the given user ID.
 * Returns the session object including the session ID (used as cookie value).
 */
export function createSession(userId: string): Session {
	const session: Session = {
		id: generateId(),
		userId,
		expiresAt: new Date(Date.now() + SESSION_DURATION_MS),
		createdAt: new Date()
	};

	sessions.set(session.id, session);
	return session;
}

/**
 * Retrieve a session by its ID.
 * Returns null if the session does not exist or has expired.
 */
export function getSession(sessionId: string): Session | null {
	const session: Session | undefined = sessions.get(sessionId);
	if (!session) return null;

	if (session.expiresAt < new Date()) {
		sessions.delete(sessionId);
		return null;
	}

	return session;
}

/**
 * Delete a session (logout).
 */
export function deleteSession(sessionId: string): void {
	sessions.delete(sessionId);
}

/**
 * Get all active sessions (for debugging/teaching).
 */
export function getAllSessions(): Session[] {
	return Array.from(sessions.values()).filter(
		(session: Session) => session.expiresAt >= new Date()
	);
}
