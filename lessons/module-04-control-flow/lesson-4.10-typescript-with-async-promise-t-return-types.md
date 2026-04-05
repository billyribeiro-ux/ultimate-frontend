---
module: 4
lesson: 4.10
title: "TypeScript with async — Promise<T> return types"
duration: 45 minutes
prerequisites:
  - Lesson 4.9 (error handling)
  - Lesson 4.8 ({#await})
learning_objectives:
  - Annotate every async function with an explicit `Promise<T>` return type
  - Use the `Awaited<T>` helper to unwrap a Promise type
  - Watch TypeScript flow a return type through `await`, `{#await}`, and `{:then value}`
  - Write a generic `fetchJson<T>()` helper that is type-safe end to end
  - Validate untrusted JSON at the runtime boundary before trusting the compile-time type
status: ready
---

# Lesson 4.10 — TypeScript with async: Promise<T> return types

## 1. Concept — Types that travel across the async boundary

### 1.1 The problem: `any` loves async

The quickest way to write a broken async function in TypeScript is to write one without an explicit return type:

```ts
async function loadProducts() {
    const res = await fetch('/api/products');
    return res.json();
}
```

Hover this in your editor. The inferred return type is `Promise<any>`. Why? Because `Response.json()` is typed as `Promise<any>` — the browser cannot know in advance what JSON you are going to parse, so it gives up and returns `any`. That `any` propagates to your function. Every caller of `loadProducts()` gets `any`. Every downstream use of the result gets `any`. Strict mode is effectively off in the entire data-loading layer.

The fix is to always annotate the return type of an async function.

### 1.2 Annotating the return type

An async function's return type is always a `Promise<T>` where `T` is the fulfilled value. Annotate it explicitly:

```ts
async function loadProducts(): Promise<Product[]> {
    const res: Response = await fetch('/api/products');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
}
```

Now every caller gets `Product[]`. Every downstream use is typed. A bug like `products.nme` becomes a red squiggle.

### 1.3 `Awaited<T>`: unwrapping a Promise type

Sometimes you have a function whose return type is a `Promise<T>` and you want the `T` without retyping it. TypeScript provides a helper:

```ts
type Loader = () => Promise<Product[]>;
type Loaded = Awaited<ReturnType<Loader>>;   // Product[]
```

`Awaited<T>` unwraps a Promise, and it is smart about recursive promises (`Promise<Promise<X>>` becomes `X`). You will use it mostly in generic helpers and library code.

### 1.4 Type flow through `{#await}`

Svelte's `{#await}` block carries types automatically when the source is typed:

```svelte
<script lang="ts">
    let promise: Promise<Product[]> = $state(loadProducts());
</script>

{#await promise}
    <p>Loading…</p>
{:then products}
    <!-- products is Product[] -->
{:catch err}
    <!-- err is unknown -->
{/await}
```

Inside the `{:then}` branch, `products` has the exact type your Promise was annotated with. Inside `{:catch}`, the error is `unknown`. The compiler enforces both ends.

### 1.5 A generic `fetchJson<T>()` helper

A common helper in real codebases is a typed wrapper around `fetch`:

```ts
export async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
    const res: Response = await fetch(url, init);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return (await res.json()) as T;
}
```

Callers pass the expected type as a generic argument:

```ts
const products: Product[] = await fetchJson<Product[]>('/api/products');
```

This is a nice API, but the `as T` cast hides a lie: the runtime JSON might not actually match `T`. If the API returns `{ products: [...] }` instead of `[...]`, your code will happily read fields from a wrong object until something crashes. The compiler cannot save you at the network boundary.

### 1.6 Validation at the boundary

The correct pattern for untrusted data is **runtime validation** — a small check that the parsed JSON actually has the shape you expect. Module 10.6 teaches this in depth with **Valibot**, the validation library this course uses. For now, hand-write a tiny guard:

```ts
function isProduct(value: unknown): value is Product {
    if (typeof value !== 'object' || value === null) return false;
    const v = value as Record<string, unknown>;
    return typeof v.id === 'string'
        && typeof v.name === 'string'
        && typeof v.price === 'number';
}

async function loadProducts(): Promise<Product[]> {
    const data: unknown = await fetchJson<unknown>('/api/products');
    if (!Array.isArray(data) || !data.every(isProduct)) {
        throw new Error('Malformed product list');
    }
    return data;
}
```

After the guard, TypeScript narrows `data` to `Product[]` automatically. Any wrong-shaped response throws a clean error instead of producing silent bugs down the line.

### 1.7 Why this matters so much

Type errors caught at the async boundary are bugs that never reach the user. Every product you have ever used has shipped a bug where the client expected one shape and the server returned another. A strict `Promise<T>` contract plus runtime validation closes that entire class of bugs.

## 2. Style it — Same grid, invisible improvements

The mini-build looks identical to Lesson 4.8 — a product grid with a skeleton and an error panel. The difference is under the hood: `fetchJson<Product[]>()` is generic, `loadProducts()` has an explicit return type, and a tiny `isProduct` guard validates the payload before trusting it. The user notices nothing. The codebase notices everything.

## 3. Interact — Break the JSON on purpose

Edit `static/products.json` to break a field — change `"name"` to `"nom"` on one entry. Reload. The validator fires, the `{:catch}` branch shows "Malformed product list", and the grid never renders. Now put the field back and reload. Everything works. You just built a boundary that catches bad data before it reaches your components.

## 4. Mini-build — A typed async helper

### File

`src/routes/modules/04-control-flow/10-typed-async/+page.svelte`

### DevTools verification

1. Hover `products` inside the `{:then}` branch in VS Code. The tooltip shows `Product[]`.
2. Temporarily change the `isProduct` guard to always return `false`. Reload. The catch branch shows "Malformed product list".
3. Inspect `loadProducts` in the editor. Its signature shows `Promise<Product[]>` — the full end-to-end contract.

## 5. Check your understanding

<details>
<summary><strong>Q1.</strong> Why does the inferred return type of an un-annotated async function that calls `res.json()` become `Promise<any>`?</summary>

Because `Response.json()` is typed as `Promise<any>` (the browser cannot know your schema). Without an explicit annotation on your function, the `any` propagates.
</details>

<details>
<summary><strong>Q2.</strong> What does `Awaited<T>` do?</summary>

It unwraps a Promise type. `Awaited<Promise<Product[]>>` is `Product[]`. It is recursive.
</details>

<details>
<summary><strong>Q3.</strong> Why is `return (await res.json()) as T` inside `fetchJson<T>()` a lie at runtime?</summary>

Because the runtime JSON might not actually have shape `T`. The `as` cast only affects the type checker. At runtime, malformed data will pass the cast and break later.
</details>

<details>
<summary><strong>Q4.</strong> What is a user-defined type guard and why is it useful at the network boundary?</summary>

A function like `function isProduct(v: unknown): v is Product` that returns a boolean and, via the `v is Product` predicate, narrows `v` to `Product` in the caller. At the network boundary it turns untrusted data into typed data with a runtime check.
</details>

<details>
<summary><strong>Q5.</strong> Inside `{:then products}` with `Promise<Product[]>`, what is the type of `products`?</summary>

`Product[]`. Svelte's `{#await}` flows the Promise's resolved type into the `{:then}` variable automatically.
</details>

## 6. Common mistakes

- **Not annotating async return types.** Infers `Promise<any>` and silently kills strict mode.
- **Casting JSON to a type without validation.** The cast is a lie. Validate.
- **Reaching for `any` when a type is tricky.** Use `unknown` instead and narrow.
- **Skipping validation because it is tedious.** Module 10.6 introduces Valibot, which makes validation a one-liner per schema.

## 7. What's next

Module 4 is complete. The module project, **Dynamic Product Listing**, assembles everything: a filterable searchable product grid with `{#each}` + keys, `{#if}` filters, `{#await}` loading states with skeletons, and typed error handling. Module 5 then moves on to events, handlers, and the JavaScript model that makes forms and interactions work.
