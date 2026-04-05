/**
 * Vitest unit tests for the cart store.
 * Module 12 Lesson 12.9.
 *
 * Run with: pnpm vitest (requires a vitest.config.ts — added in the
 * Module 12 project pass).
 */
import { flushSync } from 'svelte';
import { beforeEach, describe, expect, it } from 'vitest';
import { cart } from './cart.svelte';

describe('CartStore', () => {
	beforeEach(() => {
		cart.clear();
		flushSync();
	});

	it('starts empty', () => {
		expect(cart.isEmpty).toBe(true);
		expect(cart.count).toBe(0);
		expect(cart.total).toBe(0);
	});

	it('adds a single item', () => {
		cart.add({ id: 'a', name: 'Torus', price: 19 });
		flushSync();
		expect(cart.count).toBe(1);
		expect(cart.items.length).toBe(1);
		expect(cart.total).toBe(19);
	});

	it('bumps quantity on duplicate add', () => {
		cart.add({ id: 'a', name: 'Torus', price: 19 });
		cart.add({ id: 'a', name: 'Torus', price: 19 });
		flushSync();
		expect(cart.count).toBe(2);
		expect(cart.items.length).toBe(1);
		expect(cart.total).toBe(38);
	});

	it('removes an item by id', () => {
		cart.add({ id: 'a', name: 'Torus', price: 19 });
		cart.add({ id: 'b', name: 'Cube', price: 24 });
		cart.remove('a');
		flushSync();
		expect(cart.items.length).toBe(1);
		expect(cart.items[0]?.id).toBe('b');
	});

	it('setQuantity to zero removes the item', () => {
		cart.add({ id: 'a', name: 'Torus', price: 19 });
		cart.setQuantity('a', 0);
		flushSync();
		expect(cart.isEmpty).toBe(true);
	});

	it('clear empties the cart', () => {
		cart.add({ id: 'a', name: 'Torus', price: 19 });
		cart.add({ id: 'b', name: 'Cube', price: 24 });
		cart.clear();
		flushSync();
		expect(cart.isEmpty).toBe(true);
		expect(cart.count).toBe(0);
	});
});
