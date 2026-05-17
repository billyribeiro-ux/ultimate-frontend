---
module: 4
lesson: 4.3
title: "{#each} — array iteration and destructuring"
duration: 50 minutes
prerequisites:
  - Module 2.4 ($state with arrays)
  - Lesson 4.1 ({#if})
learning_objectives:
  - Iterate over any array with `{#each items as entry}`
  - Access the current index with `{#each items as entry, i}`
  - Destructure the entry inline
  - Render an empty-state fallback with `{:else}` inside `{#each}`
  - Type the array so the entry variable carries the element's exact type
status: ready
---

# Lesson 4.3 — {#each}: array iteration and destructuring

## 1. Concept — Rendering a list without hand-writing every row

### 1.1 The problem: a grid of products where the number of rows is not known in advance

Your product catalogue has ten items today. Tomorrow it has twelve. Next week it has one hundred. You cannot pre-write one hundred `<article>` blocks in your template. You need a loop: "for each product in the list, render one `<article>`". Every framework has such a loop. In Svelte 5 it is `{#each}`.

### 1.2 The basic form

```svelte
<script lang="ts">
    interface Product {
        id: string;
        name: string;
        price: number;
    }

    const products: Product[] = [
        { id: 'p1', name: 'Notebook', price: 18 },
        { id: 'p2', name: 'Pen', price: 42 },
        { id: 'p3', name: 'Journal', price: 65 }
    ];
</script>

<ul>
    {#each products as product}
        <li>{product.name} — ${product.price}</li>
    {/each}
</ul>
```

`{#each products as product}` reads "for each entry in `products`, call it `product` inside this block". Svelte renders one `<li>` per product and keeps the rendered list in sync when the array changes.

The name after `as` is yours to choose. `product`, `item`, `entry`, `row`, `it` — all valid. We prefer `product` because it matches the element type; a generic name like `item` is fine for generic components but noisier in concrete code.

### 1.3 Accessing the index

A second variable gives you the zero-based index:

```svelte
{#each products as product, i}
    <li>{i + 1}. {product.name}</li>
{/each}
```

`i` is a `number`, inferred automatically. The index is often needed for display ("Item 3 of 10"), accessibility (`aria-setsize`, `aria-posinset`), or keys (but see Lesson 4.4 — the *index* is almost never a good key).

### 1.4 Inline destructuring

If each entry is an object and you only need some of its fields, destructure in the `as` clause:

```svelte
{#each products as { id, name, price }}
    <li>{name} — ${price}</li>
{/each}
```

This is exactly the same as JavaScript's `const { id, name, price } = product;`. TypeScript carries the types through: `name` is `string`, `price` is `number`, because `products` is `Product[]`. Destructuring is a style choice — it reduces noise when you access many fields, and adds noise when you only touch one. Use it when it clarifies the body; skip it when it does not.

### 1.5 The `{:else}` branch for empty arrays

Svelte extends `{#each}` with an elegant empty-state fallback:

```svelte
{#each products as product (product.id)}
    <li>{product.name}</li>
{:else}
    <li class="empty">No products yet.</li>
{/each}
```

When `products.length === 0`, the `{:else}` block runs instead of any iterations. This replaces the common pattern of "check length first, then loop, then fall back". One block, one fallback, zero boilerplate.

### 1.6 TypeScript carries through

Because your source array has a type (`Product[]`), the entry variable and every field you destructure are typed. In an editor with TypeScript, you can hover `product.price` and see `number`. A typo like `product.piece` is a red squiggle. The loop is as strict as the rest of your code; you do not have to re-annotate anything.

### 1.7 When the array is reactive

If the array comes from `$state`, `{#each}` reacts to changes: adding an item renders a new row, removing one destroys its row. In this lesson we use a constant array to keep the focus on the iteration mechanics. The next lesson covers how to do this *correctly* when the array reorders or filters — that is where keys come in.

## Deep Dive

**Why this matters at scale.** In a 50-component production app, list rendering accounts for the majority of DOM output. Product grids, user tables, notification feeds, sidebar navigation — these are all `{#each}` blocks. If developers misunderstand how iteration interacts with reactivity (particularly when items are added, removed, or reordered), they introduce performance problems (unnecessary DOM recreation) and correctness bugs (stale state attached to the wrong item). Mastering `{#each}` with destructuring and proper typing is prerequisite knowledge for every data-driven component you will ever build.

**The mental model.** Think of `{#each items as item, i}` as a factory production line. Each item on the conveyor belt (the array) passes through a stamping machine (the template body) that produces one DOM fragment per item. The `as item` clause names the current piece on the belt. The `, i` clause reads the position counter. Destructuring (`as { name, price }`) is like the stamping machine having labelled input slots — it pulls specific parts from each piece without needing to reference the whole object. The factory runs once on initial render and then responds to inventory changes: new items get stamped, removed items get their output discarded.

**Edge cases.** A common trap: using the index `i` as a key (or relying on the default behaviour, which is index-based). If items reorder, Svelte reuses DOM nodes by position rather than identity, causing visual glitches where input state (typed text, checkbox state) appears attached to the wrong item. Lesson 4.4 fixes this with explicit keys. Another edge case: destructuring with renaming. `{#each items as { name: productName }}` renames the destructured variable — useful when the field name would shadow an outer variable. A third subtlety: `{#each}` with an empty array renders nothing and adds zero DOM nodes, which is correct but means you need an `{:else}` or a surrounding `{#if}` to show an empty state message.

**Performance implications.** `{#each}` without keys uses index-based reconciliation. This is fastest for append-only lists (new items at the end) because Svelte only creates new nodes without touching existing ones. For lists that reorder, filter, or insert in the middle, index-based reconciliation is both slower and incorrect — it reuses nodes for the wrong items and must update every node after the insertion point. Keyed `{#each}` (Lesson 4.4) solves both problems. The creation cost per item is one DOM fragment creation — Svelte does not use a virtual DOM, so each item's template compiles to direct `createElement`/`insertBefore` calls.

**Cross-module connections.** `{#each}` is the rendering primitive for every list-based UI in the course. Module 9 renders API results with `{#each}`. Module 11's TanStack Table renders rows with `{#each}`. Module 12 optimises large lists by combining `{#each}` with virtual scrolling and `$state.raw`. Module 6 animates list item transitions using `{#each}` with keys and the `animate:flip` directive. The combination of `{#each}`, keys, and transitions is one of Svelte's most powerful patterns for production list UIs.

## 2. Style it — A clean grid with alternating row backgrounds

The mini-build lays out the list as a striped set of rows inside a single bordered container. PE7 tokens control the gaps and the `:nth-child(even)` stripe.

## 3. Interact — Loop it, destructure it, break it

Write the simplest form first — `{#each products as product}` — and render `product.name`. Extend to `product, i` and show the one-based position. Switch to destructuring with `{#each products as { name, price }}`. Delete every entry from the array so it is empty, observe that the page renders nothing, then add a `{:else}` branch and see the empty-state message replace the missing rows. Each step is a small working piece.

## 4. Mini-build — A product grid with fallback

### File

`src/routes/modules/04-control-flow/03-each/+page.svelte`

### Key excerpt

```svelte
<ul class="grid">
    {#each products as { id, name, price }, i (id)}
        <li class="item">
            <span class="num">{i + 1}</span>
            <strong>{name}</strong>
            <span class="price">${price.toFixed(2)}</span>
        </li>
    {:else}
        <li class="empty">No products yet.</li>
    {/each}
</ul>
```

### DevTools verification

1. Inspect the `<ul>` and count the children. It matches `products.length`.
2. Hover a `<li>` and look at its scoped class hash — every `<li>` has the same hash because they come from the same `{#each}` block.
3. In the source, temporarily replace `products` with an empty array. Reload. The `{:else}` branch renders a single "No products yet." row.

## 5. Check your understanding

<details>
<summary><strong>Q1.</strong> What does `{#each products as product, i}` give you?</summary>

For each entry in `products`, a local variable `product` bound to that entry and a local `i` bound to its zero-based index.
</details>

<details>
<summary><strong>Q2.</strong> When should you destructure inside the `as` clause?</summary>

When you use multiple fields of each entry in the body. Destructuring reduces noise. If you access only one field, a normal `product.name` reads more clearly.
</details>

<details>
<summary><strong>Q3.</strong> What does the `{:else}` branch of `{#each}` do?</summary>

It renders once when the source array is empty, in place of any iterations.
</details>

<details>
<summary><strong>Q4.</strong> What type does `product` have inside `{#each products as product}` when `products: Product[]`?</summary>

`Product`. TypeScript carries the element type through the loop automatically.
</details>

<details>
<summary><strong>Q5.</strong> Can the expression after `each` be any iterable, or does it have to be an array?</summary>

Svelte's `{#each}` iterates any array-like or iterable the ECMAScript language supports. In practice, stick to arrays for type clarity.
</details>

## 6. Common mistakes

- **Rendering `product` directly.** `{product}` on an object tries to stringify it and usually produces `[object Object]`. Render a specific field.
- **Destructuring a field that might be missing.** If `price` is optional and sometimes absent, destructuring to `{ price }` yields `undefined`. Handle it with a default in the destructure: `{ price = 0 }`.
- **Confusing the index with a key.** The second variable after the comma is the *index*, not a key. Keys come next, in Lesson 4.4, with a `(expression)` after the `as`.
- **Forgetting the closing `{/each}`.** The error tells you which line, but the habit of closing blocks immediately prevents it.

## 7. What's next

Lesson 4.4 teaches *keys* — the piece Svelte needs to reuse DOM nodes efficiently when items are reordered, inserted, or removed.
