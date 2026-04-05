/**
 * Shared reactive cart store — Module 11 canonical example of a
 * reactive class with runes. Imported from any component in the app;
 * because `$state` is written inside a `.svelte.ts` file, the runes
 * compiler turns the class fields into reactive proxies and every
 * consumer sees the same live data.
 *
 * Used by:
 *   Lesson 11.3 — .svelte.ts files
 *   Lesson 11.4 — shared $state across pages
 *   Lesson 11.5 — reactive classes with runes
 *   Module project — Admin Dashboard
 */

export interface CartItem {
	id: string;
	name: string;
	price: number;
	quantity: number;
}

class CartStore {
	items = $state<CartItem[]>([]);

	readonly count = $derived(this.items.reduce((sum, item) => sum + item.quantity, 0));
	readonly total = $derived(
		this.items.reduce((sum, item) => sum + item.price * item.quantity, 0)
	);
	readonly isEmpty = $derived(this.items.length === 0);

	add(item: Omit<CartItem, 'quantity'>, quantity: number = 1): void {
		const existing = this.items.find((i) => i.id === item.id);
		if (existing) {
			existing.quantity += quantity;
			return;
		}
		this.items.push({ ...item, quantity });
	}

	remove(id: string): void {
		const index = this.items.findIndex((i) => i.id === id);
		if (index !== -1) this.items.splice(index, 1);
	}

	setQuantity(id: string, quantity: number): void {
		const item = this.items.find((i) => i.id === id);
		if (!item) return;
		if (quantity <= 0) {
			this.remove(id);
			return;
		}
		item.quantity = quantity;
	}

	clear(): void {
		this.items.length = 0;
	}
}

export const cart = new CartStore();
