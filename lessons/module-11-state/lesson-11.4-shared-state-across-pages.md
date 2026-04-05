---
module: 11
lesson: 11.4
title: Shared $state across pages — module singleton + persistence
duration: 45 minutes
prerequisites:
  - Lesson 11.3 — .svelte.ts files
  - Module 8 — SvelteKit navigation
learning_objectives:
  - Verify that a module store survives SvelteKit navigation
  - Hydrate a store from localStorage on the client, SSR-safely
  - Persist changes back to localStorage with a single $effect
  - Avoid the double-write bug that corrupts storage on first render
  - Explain why the store pattern is NOT a cross-tab sync primitive by default
status: ready
---

# Lesson 11.4 — Shared $state across pages — module singleton + persistence

> **Atomic lesson format** — Concept, Style it, Interact, Mini-build. Lesson 11.3 taught you that module stores survive navigation. This lesson adds the *persistence* layer so that a reload does not throw away the user's work.

## 1. Concept — Surviving navigation is not the same as surviving reload

### 1.1 Two different lifetimes

A module store lives as long as the JavaScript runtime. For a SvelteKit app that means "from the moment the browser loads your bundle to the moment the user closes or reloads the tab". Every navigation inside the app — `goto('/cart')`, `<a href="/checkout">`, a form action — keeps the runtime alive. Every reload or hard refresh kills it. Everything the store knew at that moment is gone.

For many kinds of state that is fine. A modal's open/closed flag does not need to survive a reload. A filter panel's draft values probably do not either. But a shopping cart does. A half-finished blog post does. A theme preference does. For those cases, you layer **persistence** on top of the store: a `$effect` that writes the store to `localStorage`, and an initialiser that reads from `localStorage` when the store is first constructed.

### 1.2 The SSR trap

The first mistake every beginner makes is this:

```ts
// WRONG — crashes on the server
const items = $state<CartItem[]>(JSON.parse(localStorage.getItem('cart') ?? '[]'));
```

On the server there is no `localStorage`. The expression throws the moment the module is imported. SvelteKit's SSR pipeline then fails with a cryptic error and the page never renders. The rule is simple and absolute: **any code that touches browser-only APIs must be guarded by a runtime check or delayed until the client is mounted.**

The standard guard looks like this:

```ts
function readInitial(): CartItem[] {
	if (typeof window === 'undefined') return [];
	try {
		const raw = window.localStorage.getItem('cart');
		return raw ? (JSON.parse(raw) as CartItem[]) : [];
	} catch {
		return [];
	}
}
```

`typeof window === 'undefined'` is true on the server, false in the browser. The `try`/`catch` protects against two real-world failures: a user in private browsing mode who has `localStorage` disabled, and a key whose contents have been corrupted by a previous bug. Both should fall back to an empty cart, not crash the store.

### 1.3 Writing back — one $effect is enough

Once the store is constructed with its initial value, persistence is a single `$effect` that serialises the state whenever it changes:

```ts
class CartStore {
	items = $state<CartItem[]>(readInitial());

	constructor() {
		if (typeof window === 'undefined') return;
		$effect.root(() => {
			$effect(() => {
				window.localStorage.setItem('cart', JSON.stringify(this.items));
			});
		});
	}
}
```

Two things in that snippet deserve a careful look. First, `$effect.root` creates an effect scope that is not tied to any component — because this store exists at module scope, not inside a component. Without `$effect.root`, calling `$effect` at module scope throws. Second, the inner `$effect` reads `this.items` and therefore re-runs any time any item is added, removed, or mutated. Each re-run serialises the full array and writes it to storage. That is the full persistence layer: five lines of code.

### 1.4 The double-write bug and how to avoid it

New students often write a *separate* effect that also reads from `localStorage` on every change, or they call the serialiser twice (once in the constructor and once in the effect). The result is a race: the initialiser reads an old value, the effect runs and writes the old value back, and any change that happened between the two is silently overwritten. The fix is to read exactly once (in the constructor) and write exactly once (in the effect).

A subtler variant of the same bug: if two tabs are open, they each have their own runtime and their own module store. Tab A adds an item; its effect writes to `localStorage`. Tab B, which has no idea anything happened, continues to think the cart is empty. When Tab B's effect next runs — for example because the user added a different item — it writes tab B's state to storage, overwriting tab A's additions. Cross-tab sync is *not free*. If you need it, layer a `BroadcastChannel` or a `storage` event listener on top of the store. That is out of scope for this lesson, but it is called out in the check-your-understanding questions so you know the trap is there.

### 1.5 SSR-safe default values

The cleanest way to stay SSR-safe is to give every store a static default value that is identical on the server and on the client, and then hydrate from storage in a client-only effect once the app is mounted:

```ts
class CartStore {
	items = $state<CartItem[]>([]);

	hydrate(): void {
		if (typeof window === 'undefined') return;
		const raw = window.localStorage.getItem('cart');
		if (raw) this.items = JSON.parse(raw) as CartItem[];
	}
}

export const cart = new CartStore();
```

Then in the root `+layout.svelte`, call `cart.hydrate()` inside a `$effect` — which only runs on the client. The SSR snapshot contains an empty cart; the client replaces it the moment hydration completes. The hydration mismatch is invisible because both snapshots agree on "empty", and the real value appears immediately after the handshake.

### 1.6 When to reach for something else

Persistence via `localStorage` is the right tool for small, non-sensitive, client-owned state (cart, draft text, theme, last-visited tab). It is the wrong tool for anything server-owned. If a logged-in user's cart must survive across devices, the cart lives in a database, and the client merely displays what the server returns from `load()`. In that case the module store is still useful — as a *cache* that mirrors the server data — but the source of truth is the server, and you write through the API, not through `localStorage`.

## 2. Style it — A persistent cart widget

The mini-build renders a compact product list and a persistent cart widget that survives navigation *and* reloads. Per-page accent: `oklch(70% 0.18 160)` (mint). The cart badge has a subtle `--shadow-md` and a `transition: transform var(--dur-fast) var(--ease-out)` that is disabled under `prefers-reduced-motion`.

## 3. Interact — Reload and see it survive

The whole lesson is one experiment: add an item, reload the page, still see the item. The store's `hydrate()` method is called inside a client-only `$effect` in the page; the `constructor` registers a write effect via `$effect.root`; everything else is automatic.

## 4. Mini-build — The cart that survives reload

**File:** `src/routes/modules/11-state/04-shared-state-across-pages/+page.svelte`

The page imports the same `cart` singleton from Lesson 11.3 and adds a hydration call. It also displays a "reload me" button so students can test persistence without touching the browser UI.

### DevTools moment

Open DevTools → Application → Local Storage. You will see a key (`cart`) whose value is a JSON string of the array. Add an item: the value updates in real time. Reload the page: the cart reappears. Clear the key manually and reload: the cart is empty. Now open a second tab at the same URL and add an item there — notice that the first tab does *not* update until you reload it. That is the cross-tab limitation from Section 1.4.

## 5. Check your understanding

<details>
<summary><strong>Q1.</strong> Why does reading localStorage at the top of a .svelte.ts file crash SSR?</summary>

The module file is imported on the server as well as the client. On the server, `localStorage` does not exist — the `window` global itself is undefined. Reading `localStorage.getItem(...)` throws `ReferenceError: window is not defined` or `localStorage is not defined`, and SvelteKit's SSR pipeline fails to render the page. The fix is to guard any browser-only access with `typeof window !== 'undefined'` or to delay the access until a client-only `$effect` fires.
</details>

<details>
<summary><strong>Q2.</strong> Why is <code>$effect.root</code> necessary inside the store's constructor?</summary>

`$effect` without `$effect.root` must be called inside a component or inside another root effect, because Svelte needs a scope to bind the effect's cleanup to. A module-level class has no component scope, so calling `$effect` directly throws. `$effect.root` creates that scope on the fly and returns a cleanup function you can call if the store is ever torn down (rare, but useful in tests).
</details>

<details>
<summary><strong>Q3.</strong> Does the module store automatically sync between two browser tabs?</summary>

No. Each tab has its own JavaScript runtime and its own copy of the module store. Writing to `localStorage` from one tab does not update the reactive state in another tab. If cross-tab sync matters, layer a `BroadcastChannel` or a `storage` event listener on top of the store and mutate the reactive state in response to messages from the other tab.
</details>

<details>
<summary><strong>Q4.</strong> Why wrap the JSON parse in a try/catch?</summary>

Two real-world failures: a browser in private mode that refuses access to `localStorage`, and a previously-stored value that has been corrupted by a bug or an incompatible schema version. Either should gracefully fall back to a safe default (empty array) instead of crashing the store. Always wrap storage reads in `try`/`catch`.
</details>

<details>
<summary><strong>Q5.</strong> A user's cart must sync across devices. Should it live in a module store with localStorage?</summary>

Not as the source of truth. Cross-device means cross-machine, which means a server. The source of truth is a database; `load()` returns the cart on each navigation; mutations go to the server via a form action or a remote function. A module store can still exist as a *local cache* that mirrors the server state — useful for optimistic UI (Lesson 11.10) — but it is not the authority.
</details>

## 6. Common mistakes

- **Top-level `localStorage` access.** Crashes SSR. Always guard.
- **Writing to storage inside every component's `$effect`.** Every component that reads the store runs its own serialiser. The store should own persistence, not the consumers.
- **Forgetting the try/catch around JSON.parse.** A single corrupted key crashes the page for that user forever. Always fall back.
- **Assuming persistence equals cross-tab sync.** It does not. See Section 1.4.

## 7. What's next

Lesson 11.5 gives the module store's class a full rune-based API: reactive class fields, derived fields, and methods — the complete pattern.
