/**
 * In-memory user store for teaching purposes.
 *
 * In production you would use a real database. This Map resets
 * every time the dev server restarts — perfect for experimentation.
 */

import type { User, RegisterInput } from './types';
import { hashPassword } from './password';

const users: Map<string, User> = new Map();

function generateId(): string {
	return crypto.randomUUID();
}

/**
 * Find a user by email address.
 */
export function findUserByEmail(email: string): User | null {
	for (const user of users.values()) {
		if (user.email === email) return user;
	}
	return null;
}

/**
 * Find a user by their ID.
 */
export function findUserById(id: string): User | null {
	return users.get(id) ?? null;
}

/**
 * Create a new user. Returns the user or null if email already exists.
 */
export async function createUser(input: RegisterInput): Promise<User | null> {
	if (findUserByEmail(input.email)) return null;

	const passwordHash: string = await hashPassword(input.password);
	const user: User = {
		id: generateId(),
		email: input.email,
		name: input.name,
		passwordHash,
		createdAt: new Date()
	};

	users.set(user.id, user);
	return user;
}

/**
 * Get all users (for debugging/teaching).
 */
export function getAllUsers(): User[] {
	return Array.from(users.values());
}
