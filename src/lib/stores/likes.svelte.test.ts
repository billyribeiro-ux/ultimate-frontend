/**
 * Vitest unit tests for the optimistic-UI likes store.
 * Module 12 Lesson 12.9.
 */
import { flushSync } from 'svelte';
import { describe, expect, it } from 'vitest';
import { likes } from './likes.svelte';

describe('LikesStore optimistic toggle', () => {
	it('applies the optimistic value on success', async () => {
		likes.seed('p-success', { liked: false, count: 10 });
		await likes.toggle('p-success', async () => true);
		flushSync();
		expect(likes.get('p-success').liked).toBe(true);
		expect(likes.get('p-success').count).toBe(11);
	});

	it('rolls back on server failure', async () => {
		likes.seed('p-fail', { liked: false, count: 20 });
		await likes.toggle('p-fail', async () => false);
		flushSync();
		expect(likes.get('p-fail').liked).toBe(false);
		expect(likes.get('p-fail').count).toBe(20);
		expect(likes.lastError).not.toBeNull();
	});

	it('rolls back on thrown error', async () => {
		likes.seed('p-throw', { liked: true, count: 5 });
		await likes.toggle('p-throw', async () => {
			throw new Error('network down');
		});
		flushSync();
		expect(likes.get('p-throw').liked).toBe(true);
		expect(likes.get('p-throw').count).toBe(5);
		expect(likes.lastError).toBe('network down');
	});
});
