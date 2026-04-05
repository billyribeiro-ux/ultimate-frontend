---
module: 3
lesson: 3.7
title: Passing snippets as props (Snippet<T>)
duration: 55 minutes
prerequisites:
  - Lesson 3.6 (declaring and rendering snippets)
  - Lesson 3.3 (interface Props)
learning_objectives:
  - Pass a snippet from a parent into a child as a named prop
  - Use the parameterised `Snippet<[T]>` type from svelte to type a snippet that receives arguments
  - Build a generic List component whose item rendering is supplied by the caller
  - Understand why this is called the "render prop" pattern and what problem it solves
  - Recognise when a component should expose a snippet prop vs hard-coding the content
status: ready
---

# Lesson 3.7 — Passing snippets as props (Snippet<T>)

## 1. Concept — The component that cannot know how to render its own contents

### 1.1 The problem: a list of *things*, where the caller knows best

You are building a generic `List` component. Its job is to lay items out in a grid, add spacing between them, animate on hover, and stripe every second row. It is *not* the list's job to know what a *Product* looks like, or what a *User* looks like, or what an *Invoice* looks like. Every caller needs the same laid-out grid but with completely different item markup.

In Lesson 3.6 we accepted snippets as content — `children`, `header`, `footer`. Those snippets were rendered with no arguments. But the `List` component has a new twist: it knows the *items*, it knows the *index*, but it does not know how to render each one. It needs to say to the caller: "here is item number 3, render it however you want, and give it back to me as markup."

That is the **render-prop pattern**: the child exposes a hole, the parent fills the hole with a function-that-returns-markup, and the child invokes the function once per item. Snippets are how Svelte 5 does render props.

### 1.2 Typing a parameterised snippet

A snippet that takes arguments has the type `Snippet<[A, B, ...]>`, where the type inside the square brackets is a tuple of the argument types:

```ts
import type { Snippet } from 'svelte';

interface Props<T> {
    items: T[];
    item: Snippet<[T, number]>;  // receives the item and its index
}
```

This says: `item` is a snippet that expects two arguments — a `T` (the generic item type) and a `number` (the index).

### 1.3 Generic components in Svelte

Svelte supports generics on components via the `generics` attribute on the `<script>` tag:

```svelte
<script lang="ts" generics="T">
    import type { Snippet } from 'svelte';

    interface Props {
        items: T[];
        item: Snippet<[T, number]>;
    }

    let { items, item }: Props = $props();
</script>
```

The `generics="T"` declaration makes `T` available inside the script like a type parameter on a function. Each instance of the `List` component is bound to a specific `T` at the call site: one list is `List<Product>`, another is `List<User>`. The compiler threads the type through the snippet parameter too, so the caller's snippet parameters are correctly typed without any casting.

### 1.4 Rendering a parameterised snippet

Once you have the snippet as a prop, call it with arguments:

```svelte
<ul>
    {#each items as entry, i (i)}
        <li>
            {@render item(entry, i)}
        </li>
    {/each}
</ul>
```

Every iteration calls the `item` snippet with the current `entry` and `i`. The caller's markup is produced and inserted into the `<li>`. The list knows the layout; the caller knows the content.

### 1.5 The caller side: declare a snippet and pass it by name

On the consumer:

```svelte
{#snippet productItem(product: Product, index: number)}
    <article>
        <span class="index">{index + 1}</span>
        <h3>{product.name}</h3>
        <p>{product.price}</p>
    </article>
{/snippet}

<List items={products} item={productItem} />
```

Three things to notice:

- `productItem` is declared at the top level of the consumer file with `{#snippet name(args)}…{/snippet}`.
- Its parameters are typed with the same types `List` expects (`Product`, `number`).
- It is passed to `List` by name, just like any other prop: `item={productItem}`.

The parent supplies structure, the parent supplies content, the list in the middle supplies layout. This separation is what makes a generic list useful across a dozen different pages.

### 1.6 Why this pattern is worth learning early

Once you recognise the render-prop pattern, you will see it everywhere in modern component libraries: TanStack Table, tabs, dropdowns, virtualised lists, autocomplete pickers, form builders. Each of them provides structure and behaviour and asks the caller to provide the content via a typed snippet. Svelte 5's snippets are the cleanest implementation of this pattern of any framework today, and by the end of this lesson you will be able to read and write it confidently.

## 2. Style it — Stripes, gaps, and a single-knob hover accent

The `List` owns the visual rhythm: alternating row backgrounds via `:nth-child(even)`, a gap from `--space-sm`, and a subtle `:hover` outline that borrows `--color-brand` from whatever personality the consumer set. The consumer's snippet controls everything *inside* each row but touches none of the row chrome.

## 3. Interact — One List, two callers, two completely different rows

Build a `List<T>` with a single `item: Snippet<[T, number]>` prop. Render it once with a product snippet — image, name, price — and once with a user snippet — avatar, name, email. The file size of `List.svelte` never changes; only the consumer snippets differ. Now try to achieve the same effect without snippets — your only option would be a boolean `kind: 'product' | 'user'` prop and a giant `{#if}` inside the list, which defeats the point of a reusable list.

## 4. Mini-build — Generic List + two different callers

### Files

- `src/lib/components/List.svelte` (new)
- `src/routes/modules/03-components/07-snippet-props/+page.svelte`

### Key excerpt

```svelte
<!-- List.svelte -->
<script lang="ts" generics="T">
    import type { Snippet } from 'svelte';

    interface Props {
        items: T[];
        item: Snippet<[T, number]>;
    }

    let { items, item }: Props = $props();
</script>

<ul class="list">
    {#each items as entry, i (i)}
        <li class="list__row">
            {@render item(entry, i)}
        </li>
    {/each}
</ul>
```

```svelte
<!-- +page.svelte -->
<script lang="ts">
    import List from '$lib/components/List.svelte';

    interface Product { id: string; name: string; price: string; }
    interface User { id: string; name: string; email: string; }

    const products: Product[] = [ /* … */ ];
    const users: User[] = [ /* … */ ];
</script>

{#snippet productRow(p: Product, i: number)}
    <span class="num">{i + 1}</span>
    <strong>{p.name}</strong>
    <span class="price">{p.price}</span>
{/snippet}

{#snippet userRow(u: User, i: number)}
    <span class="num">{i + 1}</span>
    <strong>{u.name}</strong>
    <span class="email">{u.email}</span>
{/snippet}

<List items={products} item={productRow} />
<List items={users}    item={userRow} />
```

### DevTools verification

1. In the Svelte DevTools, click a `List` instance. The **Props** panel shows `items: [...]` and `item: <Snippet>`.
2. Hover the `<List>` tag in your parent file. The tooltip shows the exact inferred type — `List<Product>` on one instance and `List<User>` on the other. That is Svelte's generics in action: the same component file, two different concrete types, zero casts.

## 5. Check your understanding

<details>
<summary><strong>Q1.</strong> What is a render prop and what problem does it solve?</summary>

A render prop is a callable value (in Svelte 5, a snippet) that a parent hands to a child so the child can invoke it to produce markup for each item it owns. It solves the problem of a reusable component that knows layout and behaviour but not content.
</details>

<details>
<summary><strong>Q2.</strong> What does `Snippet<[Product, number]>` mean?</summary>

A snippet that expects two arguments: a `Product` and a `number`, in that order. The tuple inside the angle brackets is the argument list.
</details>

<details>
<summary><strong>Q3.</strong> How do you make a Svelte component generic over the type of its items?</summary>

Declare `generics="T"` on the `<script lang="ts">` tag. Inside the script, `T` is usable as a type parameter everywhere: `items: T[]`, `Snippet<[T, number]>`, etc.
</details>

<details>
<summary><strong>Q4.</strong> A caller passes `item={productRow}` and `productRow` is declared with `p: Product`. The list's `items` is a `User[]`. Does this compile?</summary>

No. The generic `T` is inferred from `items` as `User`, which means `item` must be `Snippet<[User, number]>`. A snippet expecting `Product` is rejected by the type checker.
</details>

<details>
<summary><strong>Q5.</strong> Why is it better to use a snippet prop here than to hard-code a `kind: 'product' | 'user'` prop and branch inside the List?</summary>

The branching version only supports the cases the List author thought of. Every new type requires editing the list. A snippet prop supports an unlimited number of types, and the list's source code never changes.
</details>

## 6. Common mistakes

- **Omitting the `generics` attribute.** Without it, `T` is not a type parameter and `items: T[]` is either `any[]` or a syntax error. Add `generics="T"` to the `<script>` tag.
- **Forgetting the `@render` + arguments.** Writing `{item}` does nothing. Write `{@render item(entry, i)}`.
- **Passing a function instead of a snippet.** A plain TypeScript function that returns a string is not a snippet. Snippets are declared with `{#snippet}`. Do not confuse them with callback props.
- **Reusing a snippet name across scopes.** A snippet declared inside a component tag is scoped to that tag. A snippet declared at the top of the file is scoped to the file. Keep names distinct to avoid shadowing.

## 7. What's next

Lesson 3.8 combines everything so far into component composition patterns — spreading props, building component hierarchies, and wrapping one component inside another.
