/**
 * Auth type definitions for Module 15 — Authentication.
 * These interfaces are used across all auth-related lessons and the module project.
 */

export interface User {
	id: string;
	email: string;
	name: string;
	passwordHash: string;
	createdAt: Date;
}

export interface Session {
	id: string;
	userId: string;
	expiresAt: Date;
	createdAt: Date;
}

export interface SafeUser {
	id: string;
	email: string;
	name: string;
	createdAt: Date;
}

export interface RegisterInput {
	email: string;
	name: string;
	password: string;
}

export interface LoginInput {
	email: string;
	password: string;
}

export function toSafeUser(user: User): SafeUser {
	return {
		id: user.id,
		email: user.email,
		name: user.name,
		createdAt: user.createdAt
	};
}
