---
module: 11
lesson: 11.3
title: .svelte.ts files — universal reactive state
duration: 50 minutes
prerequisites:
  - Lesson 11.2 — context API
  - Module 2 — $state, $derived
learning_objectives:
  - Explain why runes work in .svelte.ts files but not in plain .ts files
  - Create a module-level reactive store exported as a singleton
  - Import a .svelte.ts store from a component and see live updates
  - Distinguish .svelte.ts files (reactive) from .ts files (non-reactive)
  - Avoid the circular-import and SSR pitfalls that module stores introduce
status: ready
---

# Lesson 11.3 — .svelte.ts files — universal reactive state

> **Atomic lesson format** — Concept, Style it, Interact, Mini-build. This is the second of three prop-drilling fixes. It solves the app-wide case: state that must be visible everywhere and survive navigation.

## 1. Concept — One file, one source of truth, fully reactive

### 1.1 The problem a .svelte.ts file solves

Context is perfect for subtree-local state, but it is the wrong tool when the same state needs to be visible from every corner of the app. A shopping cart is the canonical example: the header shows a count badge, the cart page shows a full list, the checkout button shows a total, and all three need to agree. You could hoist a context provider all the way up to the root `+layout.svelte`, but that still couples the state to the tree. The cleanest answer is a **module-level store**: one TypeScript file that declares the state once, exports it, and lets every component import it directly.

In React this would mean reaching for Redux or Zustand. In Svelte 5 the answer is built into the compiler — a file with the `.svelte.ts` extension.

### 1.2 Why the extension matters

Svelte's runes (`$state`, `$derived`, `$effect`) are not regular JavaScript functions. They are *compiler hints*. When the Svelte compiler sees `let x = $state(0)`, it does not literally call a function named `$state`; it rewrites the declaration into a reactive getter/setter pair that emits dependency signals. That rewrite only happens inside files the compiler is aware of.

By default, the compiler processes:

1. Every `.svelte` file.
2. Every file whose name ends in `.svelte.ts` (or `.svelte.js`).

If you write `let count = $state(0)` in a plain `counter.ts`, the compiler never touches the file. The identifier `$state` is either undefined at runtime or, if you imported it, a function that returns a wrapped value but without any compiler-inserted reactivity glue. Your component will not re-render when you mutate `count`. This is the single most confusing mistake beginners make, and the fix is a single character: rename the file to `counter.svelte.ts`.

So: **`.svelte.ts` is a signal to the compiler, not a naming convention.** It says *"treat this file like the script block of a Svelte component — process the runes."* Everything else about the file is ordinary TypeScript. You export functions, classes, types, constants; you import from other modules; you get full type-checking and full tree-shaking.

### 1.3 The canonical pattern

A module store is one file with three parts: a type, some reactive state, and the exports that components will use.

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

	add(item: Omit<CartItem, 'quantity'>): void {
		const existing = this.items.find((i) => i.id === item.id);
		if (existing) existing.quantity += 1;
		else this.items.push({ ...item, quantity: 1 });
	}
}

export const cart = new CartStore();
```

The store is a class for the reasons Lesson 11.5 will explain in detail: methods keep the rules next to the data, `$derived` fields avoid duplicating logic across components, and `$state` on class fields works exactly the way it works in a component. For now, focus on the last line — `export const cart = new CartStore()`. That `const` is evaluated exactly once per JavaScript module graph, which means every import of this file in the app sees the same instance. Singletons, for free, with full types.

Any component uses it like this:

```svelte
<script lang="ts">
	import { cart } from '$lib/stores/cart.svelte';
</script>

<button onclick={() => cart.add({ id: 'p1', name: 'Torus', price: 19 })}>
	Add ({cart.count})
</button>
```

Notice there is no subscription, no unsubscribe, no `.subscribe()` callback. The component reads `cart.count` inside its markup, and Svelte's rune compiler wires the dependency automatically. When `cart.items` changes, anything that reads `cart.count` re-renders.

### 1.4 Why .svelte.ts is not a .ts file

It is worth making the rule explicit before you write your first one, because the failure mode is silent and infuriating:

| File                     | `$state` works? | Why                                                         |
| ------------------------ | --------------- | ----------------------------------------------------------- |
| `Component.svelte`        | Yes             | Compiler processes the script block                         |
| `store.svelte.ts`         | Yes             | Compiler processes the whole file                           |
| `store.ts`                | **No**          | Compiler ignores the file                                    |
| `store.svelte.js`         | Yes             | JS counterpart of `.svelte.ts`                              |
| `store.mjs`, `store.cjs`  | No              | Compiler ignores the file                                    |

If you ever find yourself writing `let count = $state(0)` in a non-Svelte-aware file, you will see either a silent failure (no re-render) or a clear error from `svelte-check`. Either way, rename the file.

### 1.5 SSR safety — read this twice

Module stores have one caveat: they are per-runtime, not per-request. On a server that handles many requests, the module is evaluated once, and every request sees the *same* store instance. That is fine for a client-only app, but it is a data leak waiting to happen on the server. If user A's cart mutates the module-level `cart` during SSR, user B's next request inherits it.

Two rules keep you safe:

1. **Never put user-specific data in a module store that is read during SSR.** User-specific data lives in `load()` functions (Module 9A) or in context keyed by the request (`event.locals`).
2. **Treat module stores as browser-only unless you know exactly what you are doing.** You can guard code with `if (typeof window !== 'undefined')` when you need to touch browser APIs inside the store (for example, to hydrate from `localStorage`). Do that guard once in an initialiser, not on every read.

A shopping cart that only exists after the user clicks "add" is safe, because the server never reads it. A cart that is prefilled from a session on the server is not — it must live in `+layout.server.ts` or `+layout.ts` and flow down through `load()` data.

### 1.6 Connecting context, modules, and runes

Context, module stores, and reactive classes are not three alternatives to the same problem. They are three tools for three scopes:

- **Context** — data belongs to a component subtree.
- **Module store (.svelte.ts)** — data belongs to the app and survives navigation.
- **Reactive class** — the shape of the data includes methods and derived rules.

You will often combine them: a `.svelte.ts` file exports a reactive class, and a `+layout.svelte` optionally wraps it in a context so tests can substitute a mock. The lessons that follow walk through exactly that composition.

## 2. Style it — A cart that looks real

The mini-build renders a three-product shop card on the left and a persistent cart summary on the right (stacked on mobile). Styling is PE7 throughout, with a per-page accent of `oklch(70% 0.2 145)` — grocery green.

- Product cards have a 44px minimum touch target on the add button.
- The cart summary is sticky on desktop (`position: sticky; top: var(--space-md)`) and flows inline on mobile.
- `prefers-reduced-motion` disables the cart badge's pop transition.

## 3. Interact — Importing a singleton

The whole lesson is one import. `import { cart } from '$lib/stores/cart.svelte';` and then calling `cart.add(product)` from a button. The student sees the count badge change in the header *and* in the summary on the side *and* in any other component that references `cart.count`, all updating in the same frame without a single prop being passed.

## 4. Mini-build — A real-feeling shop with a shared cart

**File:** `src/routes/modules/11-state/03-svelte-ts-stores/+page.svelte`

The page imports the cart store from `src/lib/stores/cart.svelte.ts` (already written in the lesson 11.1 pass for you to read). It renders three products, a cart summary, and an item list. Every button and badge reads from the singleton.

### DevTools moment

Open two browser tabs pointed at the same URL. Add an item in tab A. Tab B does not update — because module stores are per-runtime, and each tab has its own JavaScript runtime. This is the correct behaviour and the key mental model for Lesson 11.4, which discusses cross-tab persistence. Now add an item in tab A, navigate to `/modules/11-state` and back — the cart is still there, because the module graph is still the same in that runtime.

## 5. Check your understanding

<details>
<summary><strong>Q1.</strong> Why does <code>$state</code> fail silently in a plain <code>.ts</code> file?</summary>

Runes are compiler hints, not runtime functions. The Svelte compiler only processes `.svelte` and `.svelte.ts` files by default. In a plain `.ts` file, the `$state` identifier is never rewritten, so the value is not reactive. Your code either crashes at import time or compiles into a non-reactive variable that updates silently without re-rendering anything.
</details>

<details>
<summary><strong>Q2.</strong> Why is <code>export const cart = new CartStore()</code> a singleton?</summary>

JavaScript evaluates each module exactly once per module graph. The first time any file imports `cart.svelte.ts`, the class is instantiated and assigned to `cart`. Every subsequent import returns the same binding — the same reference. This is true in the browser and in Node, which is why the SSR caveat in Section 1.5 matters.
</details>

<details>
<summary><strong>Q3.</strong> What happens to a module store when the user navigates between pages?</summary>

Nothing. The module graph persists for the lifetime of the browser runtime. Navigation between SvelteKit routes unmounts and remounts components, but the module store's state is untouched. That is exactly why module stores are the right tool for cross-route state.
</details>

<details>
<summary><strong>Q4.</strong> Why should user-specific data not live in a module store that is read during SSR?</summary>

On the server, the module is evaluated once per Node process, and every request shares the same instance. If request A sets a user-specific value and request B reads it, request B sees request A's data. This is a data leak. User-specific data belongs in request-scoped storage (`event.locals`) or in `load()` functions that return per-request data.
</details>

<details>
<summary><strong>Q5.</strong> Why use a class in <code>cart.svelte.ts</code> instead of exporting a loose object?</summary>

A class keeps the state, the derived values, and the methods in one place. `this.items`, `this.count`, and `this.add(...)` all belong together. You can test the class by instantiating it in a Vitest file. You get typed method signatures for free. And if you ever need a second instance (for example, a "saved for later" cart), you can construct another one without rewriting the API.
</details>

## 6. Common mistakes

- **Naming the file `.ts` instead of `.svelte.ts`.** Silent failure. Rename the file and restart `pnpm dev` if Vite does not pick it up automatically.
- **Exporting the class instead of an instance.** `export class CartStore` requires every consumer to call `new CartStore()`, which defeats the singleton. Export `new CartStore()` directly, or provide a factory function if you need DI for tests.
- **Putting user auth tokens in a module store read during SSR.** See Section 1.5. Guard SSR-sensitive reads or keep the token in `event.locals`.
- **Expecting cross-tab sync.** Module stores are per-runtime. Two tabs are two runtimes. If you need cross-tab sync, layer a `BroadcastChannel` or `localStorage` event on top of the store — covered in Lesson 11.4.

## 7. What's next

Lesson 11.4 shows how to persist a module store across page navigation and (optionally) across tabs and reloads using `localStorage`.
