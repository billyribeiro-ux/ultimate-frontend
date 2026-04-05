---
module: 11
lesson: 11.5
title: Reactive classes with runes
duration: 50 minutes
prerequisites:
  - Lesson 11.3 — .svelte.ts files
  - Module 2 — $state, $derived
learning_objectives:
  - Put $state on class fields and $derived on read-only computed fields
  - Keep business logic inside methods so every caller agrees on the rules
  - Share a class instance across components via an exported singleton
  - Unit-test a reactive class in isolation
  - Explain why binding method references needs the correct this
status: ready
---

# Lesson 11.5 — Reactive classes with runes

> **Atomic lesson format** — Concept, Style it, Interact, Mini-build. Classes are the bridge between raw reactive state and a clean, testable API. This lesson is the canonical pattern you will repeat in every future module store.

## 1. Concept — State with methods, because rules belong next to data

### 1.1 Why a class and not a plain object

A module store can be as simple as a loose object with a few `$state` fields. For a small feature, that is fine. But as soon as the feature has *rules* — "adding a duplicate item bumps the quantity", "removing the last item clears the summary", "total is price × quantity summed across items" — you need those rules to live in one place. If every component that touches the cart has to remember the rule, you will get one component that forgets it, and you will spend an afternoon debugging a stale total.

A class collects the state, the derived values, and the methods that enforce the rules in a single unit. The compiler knows about `$state` and `$derived` on class fields just as it knows about them inside a component's `<script>`. The result is a small, self-contained API that feels exactly like an object literal to callers but gives you type-checked methods, encapsulated logic, and direct testability.

### 1.2 The canonical pattern, dissected

```ts
// src/lib/stores/cart.svelte.ts
export interface CartItem {
	id: string;
	name: string;
	price: number;
	quantity: number;
}

class CartStore {
	items = $state<CartItem[]>([]);

	readonly count = $derived(
		this.items.reduce((sum, item) => sum + item.quantity, 0)
	);

	readonly total = $derived(
		this.items.reduce((sum, item) => sum + item.price * item.quantity, 0)
	);

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

	clear(): void {
		this.items.length = 0;
	}
}

export const cart = new CartStore();
```

Read it top to bottom:

1. **`items = $state<CartItem[]>([])`** — a reactive class field. The TypeScript type parameter (`<CartItem[]>`) is mandatory in strict mode; runes can infer from an initial value, but for empty arrays or nullable fields you should always annotate.
2. **`readonly count = $derived(...)`** — a derived class field. `readonly` tells TypeScript that callers cannot reassign it, which matches the compiler's behaviour (derived values are computed from their inputs and cannot be written directly). Every time `items` changes, `count` is recomputed lazily on the next read.
3. **`add()`, `remove()`, `clear()`** — methods that enforce the rules. Notice that `add` knows to bump the quantity when the item already exists. No component has to remember that rule.
4. **`export const cart = new CartStore()`** — singleton export. The module is evaluated once, so every import of this file in the app receives the same reference.

### 1.3 Why $derived on class fields just works

The runes compiler rewrites each `$state` field into a pair of accessor descriptors that track reads (to build the dependency graph) and writes (to notify subscribers). A `$derived` field is rewritten into a lazy getter: the expression runs on first read, caches the result, and re-runs only if one of its reactive dependencies has changed. The result is identical to what you would write inside a component's `<script>`, which is the point — the compiler treats class fields the same way it treats top-level bindings in a Svelte file.

One practical note: `$derived` fields see `this` inside their expression. In the example above, `this.items.reduce(...)` works because the expression is evaluated in the context of the class instance. If you instead wrote `items.reduce(...)` you would get a compile error — class fields must use `this` just like methods do.

### 1.4 The method-binding trap

If a template passes a method reference directly to an event handler, `this` is lost. This code looks right but crashes:

```svelte
<!-- WRONG -->
<button onclick={cart.clear}>Clear cart</button>
```

When the button fires, `cart.clear` is called with no `this`, so `this.items` is undefined. TypeScript does not catch the bug because the signature is compatible. The fix is to wrap the call in an arrow function:

```svelte
<!-- CORRECT -->
<button onclick={() => cart.clear()}>Clear cart</button>
```

The arrow preserves `this` by closing over `cart`. For consistency, always wrap method calls in arrows inside templates. If you find yourself doing this for every method, you can alternatively bind in the constructor:

```ts
class CartStore {
	// ...
	constructor() {
		this.clear = this.clear.bind(this);
	}
}
```

But the arrow pattern is the idiomatic one in Svelte 5 templates.

### 1.5 Testing a reactive class

One of the quiet wins of the class pattern is how easy the store is to test. A Vitest unit test can import the class, construct an instance, and assert on its fields:

```ts
// cart.svelte.test.ts
import { flushSync } from 'svelte';
import { describe, it, expect } from 'vitest';
import { cart } from '$lib/stores/cart.svelte';

describe('CartStore', () => {
	it('bumps quantity on duplicate add', () => {
		cart.clear();
		cart.add({ id: 'a', name: 'Torus', price: 19 });
		cart.add({ id: 'a', name: 'Torus', price: 19 });
		flushSync();
		expect(cart.count).toBe(2);
		expect(cart.items.length).toBe(1);
	});
});
```

`flushSync()` from the `'svelte'` package ensures any pending reactive work has been applied before you assert on the derived values. Lesson 12.9 teaches Vitest in detail; for now, know that testability is one of the reasons the class pattern is worth the extra lines.

### 1.6 When to open a second instance

You will sometimes want more than one instance of a store-like class. A "current cart" and a "saved for later" can both be instances of `CartStore`. In that case, do not export a singleton from the module — export the class and have each consumer construct it inside a context or a page. The same class, two instances, two independent reactive graphs. The Svelte compiler treats each instance as a fully separate subject.

## 2. Style it — A live cart with count, total, and actions

The mini-build displays a product list on the left and a cart card on the right showing three reactive fields: `count`, `total`, and `items.length`. Styling uses the PE7 grocery green accent (`oklch(70% 0.2 145)`), a sticky cart card on desktop, and a `prefers-reduced-motion`-safe pulse on the count badge.

## 3. Interact — Methods vs direct mutation

Students write two versions of an "add" button: one that calls `cart.add(product)` and one that does `cart.items.push(...)` directly. Both work, but only the first one respects the "bump quantity on duplicate" rule. This is the whole argument for encapsulation in three lines of code.

## 4. Mini-build — A cart page you could ship

**File:** `src/routes/modules/11-state/05-reactive-classes/+page.svelte`

The page reuses the singleton from `src/lib/stores/cart.svelte.ts` and demonstrates every method: `add`, `setQuantity`, `remove`, `clear`. Every button is wrapped in an arrow function to preserve `this`.

### DevTools moment

Open the Svelte DevTools and watch the `cart.items` array expand as you click add. Notice that `cart.count` and `cart.total` update in the same frame — because they are `$derived`, not recomputed by hand. Now delete the arrow wrapper from one of the buttons and watch the console throw `TypeError: Cannot read property 'length' of undefined`. That is the `this`-binding trap from Section 1.4, live.

## 5. Check your understanding

<details>
<summary><strong>Q1.</strong> Why mark <code>$derived</code> class fields as <code>readonly</code>?</summary>

Derived values are computed from their dependencies and cannot be assigned to directly. Marking the field `readonly` tells TypeScript to reject any attempt to assign to it, which matches the runtime behaviour. Without `readonly`, callers could write `cart.total = 99` and get a compile-clean but runtime-silent no-op — or worse, a confusing error.
</details>

<details>
<summary><strong>Q2.</strong> What goes wrong when you bind a method reference directly to an event handler?</summary>

The method loses its `this`. Inside the method, `this.items` becomes `undefined`, and any read crashes. Wrap the call in an arrow function (`onclick={() => cart.clear()}`) or bind the method in the constructor.
</details>

<details>
<summary><strong>Q3.</strong> Why should business rules like "bump quantity on duplicate" live in a method rather than in every component that adds an item?</summary>

If the rule lives in one place, it cannot be forgotten. If each component re-implements it, one component will eventually skip it (or implement it slightly differently), and the bug is very hard to find because every call site looks correct in isolation. Encapsulation is how you stop this class of bug before it happens.
</details>

<details>
<summary><strong>Q4.</strong> How can you have two independent instances of CartStore?</summary>

Export the class itself (not a singleton) and have each consumer call `new CartStore()`. Each instance has its own reactive state and its own derived values. This is how you build a "current cart" and a "saved for later" without copying code.
</details>

<details>
<summary><strong>Q5.</strong> Why is the class pattern easier to unit-test than a loose module-level $state object?</summary>

You can import the class, construct a fresh instance in each test, and assert on its fields. No global mutation, no shared state between tests. With `flushSync()` from `svelte`, derived values update synchronously so assertions are deterministic. Testing a loose object requires resetting global module state between tests, which is fragile.
</details>

## 6. Common mistakes

- **Direct array mutation from outside the class.** `cart.items.push(...)` bypasses the rules in `add()`. Use the method.
- **Forgetting to wrap template method calls in arrows.** The `this`-binding trap. Always wrap.
- **Declaring `$derived` as `get count() { ... }`.** That is a plain getter; it does not register as a reactive dependency. Use `readonly count = $derived(...)`.
- **Assigning to a `$derived` field.** Compile error in TypeScript, runtime error at runtime. Change the inputs instead.

## 7. What's next

Lesson 11.6 takes state out of JavaScript entirely and into the URL, so users can bookmark filtered views and share them with a link.
