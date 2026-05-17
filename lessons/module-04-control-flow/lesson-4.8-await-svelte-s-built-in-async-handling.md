---
module: 4
lesson: 4.8
title: "{#await} — Svelte's built-in async handling"
duration: 45 minutes
prerequisites:
  - Lesson 4.7 (Promises and async/await)
  - Lesson 4.2 (multi-branch logic)
learning_objectives:
  - Replace manual idle/loading/success/error state with a single `{#await}` block
  - Use the `{:then value}` and `{:catch error}` branches correctly
  - Understand the shorter `{#await promise then value}` form and when to use it
  - Type the `then` and `catch` variables with TypeScript
  - Decide between `{#await}` and SvelteKit's `load()` function at a beginner level
status: ready
---

# Lesson 4.8 — {#await}: Svelte's built-in async handling

## 1. Concept — The three states of a Promise, rendered in place

### 1.1 The problem: Lesson 4.7 was a lot of bookkeeping

In Lesson 4.7 you drove four UI states with a manual status string, four state variables, and a `try`/`catch`. That works, but it is boilerplate. Every async operation in the app would need the same four variables, the same state transitions. Svelte offers a block that encodes that pattern directly into the template so you do not have to repeat it. It is called `{#await}`, and it takes a Promise as input.

### 1.2 The full form

```svelte
{#await promise}
    <p>Loading…</p>
{:then value}
    <ul>
        {#each value as product (product.id)}
            <li>{product.name}</li>
        {/each}
    </ul>
{:catch error}
    <p>Failed: {error instanceof Error ? error.message : 'Unknown error'}</p>
{/await}
```

Three branches, matching the three Promise states. Svelte subscribes to the Promise and renders whichever branch matches the current state. When pending, the first branch renders. When it settles fulfilled, Svelte switches to `{:then}` and binds the resolved value to whatever name you give it. When it rejects, Svelte switches to `{:catch}` and binds the error.

### 1.3 The shorter forms

`{#await}` supports three abbreviations:

```svelte
{#await promise then value}
    <p>{value}</p>
{/await}
```

Drop the pending branch entirely when the promise is usually settled by the time the component mounts.

```svelte
{#await promise catch error}
    <p>{error instanceof Error ? error.message : 'Error'}</p>
{/await}
```

Only show something on error. Rare but occasionally useful.

### 1.4 Where the Promise comes from

Any expression that evaluates to a Promise. The three common sources:

- **A reactive `$state` variable holding a Promise.** Assigning a new Promise to it automatically drives the `{#await}` block back to the pending branch.
- **A function call that returns a Promise.** Calling it inside the template is fine, but be careful — every re-render will call it again. Usually you store the returned Promise in `$state`.
- **An async top-level expression.** Svelte 5 supports async components in runes mode (Module 9). For Module 4 we stick to explicit Promises in `$state`.

### 1.5 Typing the `then` and `catch` variables

TypeScript can infer both, but it is clearer to annotate the source:

```svelte
<script lang="ts">
    interface Product { id: string; name: string; }
    let promise: Promise<Product[]> = $state(loadProducts());
</script>

{#await promise}
    <p>Loading…</p>
{:then products}
    <!-- products is Product[] -->
    <ul>{#each products as product (product.id)}<li>{product.name}</li>{/each}</ul>
{:catch error}
    <!-- error is unknown — narrow it -->
    <p>{error instanceof Error ? error.message : 'Unknown error'}</p>
{/await}
```

**The error is typed `unknown`, not `Error`**. You cannot assume the thrown value is an `Error` instance — JavaScript lets you throw strings, numbers, or any object. Narrow it with `instanceof Error` before reading `.message`.

### 1.6 `{#await}` vs SvelteKit's `load()` function

SvelteKit provides a separate mechanism called `load()` (Module 9A) and a newer one called remote functions (Module 9B). Both are designed for *page-level* data loading: the data is fetched on the server during SSR, shipped to the client as already-resolved props, and the template does not have to deal with pending or error states at all. That is the right tool for primary page data.

`{#await}` is for *component-level* deferred data: something fetched after the user clicks a button, a comment section that loads when it scrolls into view, a chart that renders only after the user opens a tab. For these cases the data does not belong in `load()` because the page can render fully without it.

Rule of thumb:

- Primary page data? `load()` or remote functions (Module 9).
- Secondary, interactive, or lazy data? `{#await}`.

## Deep Dive

**Why this matters at scale.** In a 50-component production app, at least half of the components fetch or depend on asynchronous data. Without a declarative async primitive, every component independently implements the loading/error/success pattern with manual `$state` flags (`isLoading`, `error`, `data`). This leads to inconsistent error handling, forgotten loading states, and race conditions where a slow response arrives after the user has navigated away. `{#await}` standardises the pattern into a single declarative block that is impossible to get wrong structurally — every state is handled, every transition is automatic.

**The mental model.** Think of `{#await promise}` as a progress bar with three positions: pending, resolved, and rejected. The block automatically moves between positions as the promise's lifecycle progresses. You cannot accidentally show "loading" and "data" at the same time because Svelte enforces mutual exclusivity. You cannot accidentally forget the error state because `{:catch}` is right there in the syntax, prompting you to handle it. The block is a state machine with exactly three states, and Svelte manages all transitions.

**Edge cases.** A critical race condition: if you reassign the promise (e.g., the user triggers a new search while the old one is still pending), Svelte drops the old promise's result. The block immediately returns to the `{:then}`/`{:catch}` state of the *new* promise. The old promise's resolution is silently ignored. This is correct behaviour — you want the latest request, not a stale one — but it means you cannot use `{#await}` for fire-and-forget promises where you want to accumulate results. Another edge case: `{#await}` with a synchronously resolved promise (e.g., `Promise.resolve(value)`). Svelte renders the `{:then}` branch immediately without ever showing the pending branch. A third subtlety: the promise itself must be reactive. If you store it in a `$state` variable and reassign it, the block re-evaluates. If you store it in a plain `const`, it never changes and the block resolves once.

**Performance implications.** `{#await}` creates the pending branch's DOM immediately and swaps it for the resolved/rejected branch's DOM when the promise settles. The swap cost is identical to an `{#if}` toggle — old nodes destroyed, new nodes created. There is no virtual DOM diff and no extra memory for "optimistic" pre-rendering of the resolved state. For promises that resolve quickly (under 100ms), the pending state may flash briefly — consider adding a minimum display time or a delay before showing the loading indicator (a common UX pattern covered in Module 12).

**Cross-module connections.** `{#await}` is the client-side complement to SvelteKit's server-side `load` functions (Module 9). While `load` resolves data before the page renders (no loading state visible), `{#await}` handles data fetched after the initial render — search results, infinite scroll, lazy-loaded panels. Module 9's streaming pattern (`promise` returns from load functions) renders with the same `{#await}` mechanism internally. Module 12 covers when to choose server-side loading vs client-side `{#await}` based on Core Web Vitals implications.

## 2. Style it — The same four states, rewritten in five lines of markup

The mini-build loads the same products JSON as Lesson 4.7 but with `{#await}` instead of a manual `status` variable. The visual states (skeleton, grid, error panel) are identical to the previous lesson. The difference is in the code: four `$state` variables collapse into one, the `try`/`catch` disappears.

## 3. Interact — Throw the old code away

Open the Lesson 4.7 mini-build in another tab. Compare the scripts. Both do the same thing. Count the lines. `{#await}` wins. This is the moment the new tool becomes part of your reflexes.

## 4. Mini-build — Same data, less code

### File

`src/routes/modules/04-control-flow/08-await/+page.svelte`

### Key excerpt

```svelte
<script lang="ts">
    interface Product { id: string; name: string; price: number; }

    async function loadProducts(): Promise<Product[]> {
        const res: Response = await fetch('/products.json');
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
    }

    let promise: Promise<Product[]> = $state(loadProducts());

    function reload(): void {
        promise = loadProducts();
    }
</script>

<button type="button" onclick={reload}>Reload</button>

{#await promise}
    <p>Loading…</p>
{:then products}
    <ul>
        {#each products as product (product.id)}
            <li>{product.name} — ${product.price.toFixed(2)}</li>
        {/each}
    </ul>
{:catch error}
    <p>{error instanceof Error ? error.message : 'Unknown error'}</p>
{/await}
```

### DevTools verification

1. Throttle the network to "Slow 3G" in DevTools, then click **Reload**. Watch the skeleton appear for a visible moment before the products arrive.
2. Assigning `promise = loadProducts()` resets the block to pending automatically because the `{#await}` source expression has a new value. There is no `status = 'loading'` line in your code.

## 5. Check your understanding

<details>
<summary><strong>Q1.</strong> What are the three branches of a full `{#await}` block?</summary>

The pending branch, the fulfilled branch (`{:then value}`), and the rejected branch (`{:catch error}`). They correspond exactly to the three states of a Promise.
</details>

<details>
<summary><strong>Q2.</strong> Why is the `error` in `{:catch error}` typed `unknown` instead of `Error`?</summary>

JavaScript lets you throw any value — a string, a number, an arbitrary object. The compiler cannot prove the thrown value is an `Error`, so it types it `unknown` to force narrowing.
</details>

<details>
<summary><strong>Q3.</strong> What does assigning a new Promise to the `{#await}` source variable do?</summary>

Svelte subscribes to the new Promise and resets the block to the pending branch. When the new Promise settles, the block switches to `{:then}` or `{:catch}` accordingly.
</details>

<details>
<summary><strong>Q4.</strong> When should you use `{#await}` instead of SvelteKit's `load()`?</summary>

For component-level, secondary, or lazy data — data fetched after user interaction or when a section scrolls into view.
</details>

<details>
<summary><strong>Q5.</strong> Why does calling `loadProducts()` inside the template expression directly often cause problems?</summary>

Svelte may re-evaluate the expression on any reactive update, creating a brand new Promise and resetting the block to pending. Store the Promise in `$state` so it stays stable.
</details>

## 6. Common mistakes

- **Recreating the Promise on every render.** Place it in `$state`; do not inline `loadProducts()` directly in `{#await loadProducts()}`.
- **Assuming `error` is an `Error`.** Narrow with `instanceof Error` or provide a string fallback.
- **Forgetting `{:catch}`.** Plan for failure visibly.
- **Using `{#await}` for primary page data.** SvelteKit's `load()` is usually better because it runs on the server and eliminates the loading flash entirely.

## 7. What's next

Lesson 4.9 deepens the error story — combining `{:catch}`, `try`/`catch`, and typed `Error` subclasses to handle failures professionally.
