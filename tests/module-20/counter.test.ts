/**
 * Module 20 — Example unit test for a reactive counter store.
 *
 * This file demonstrates the test patterns taught in Lesson 20.3.
 * In a real project, the CounterStore would live in src/lib/stores/counter.svelte.ts
 * and be imported here. For this example, we define it inline.
 */
import { describe, it, expect } from 'vitest';

// Simulated store interface (in a real project, import from $lib)
interface CounterStore {
	count: number;
	doubled: number;
	increment(): void;
	decrement(): void;
	reset(): void;
}

// Factory for test isolation — each test gets a fresh instance
function createCounterStore(initial: number = 0): CounterStore {
	let count: number = initial;
	return {
		get count() {
			return count;
		},
		set count(value: number) {
			count = value;
		},
		get doubled() {
			return count * 2;
		},
		increment() {
			count += 1;
		},
		decrement() {
			count = Math.max(0, count - 1);
		},
		reset() {
			count = 0;
		}
	};
}

describe('CounterStore', () => {
	it('starts at zero by default', () => {
		const store = createCounterStore();
		expect(store.count).toBe(0);
	});

	it('starts at provided initial value', () => {
		const store = createCounterStore(10);
		expect(store.count).toBe(10);
	});

	it('increments the count by one', () => {
		const store = createCounterStore();
		store.increment();
		expect(store.count).toBe(1);
	});

	it('decrements the count by one', () => {
		const store = createCounterStore(5);
		store.decrement();
		expect(store.count).toBe(4);
	});

	it('does not decrement below zero', () => {
		const store = createCounterStore(0);
		store.decrement();
		expect(store.count).toBe(0);
	});

	it('computes doubled correctly', () => {
		const store = createCounterStore(3);
		expect(store.doubled).toBe(6);
	});

	it('updates doubled after increment', () => {
		const store = createCounterStore();
		store.increment();
		store.increment();
		expect(store.doubled).toBe(4);
	});

	it('resets count to zero', () => {
		const store = createCounterStore(42);
		store.reset();
		expect(store.count).toBe(0);
	});

	it('handles multiple operations in sequence', () => {
		const store = createCounterStore();
		store.increment();
		store.increment();
		store.increment();
		store.decrement();
		expect(store.count).toBe(2);
		expect(store.doubled).toBe(4);
	});
});
