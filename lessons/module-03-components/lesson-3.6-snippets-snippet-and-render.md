---
module: 3
lesson: 3.6
title: Snippets — {#snippet} and {@render}
duration: 55 minutes
prerequisites:
  - Lesson 3.5 ($bindable)
  - Lesson 3.3 (interface Props)
learning_objectives:
  - Explain why a component sometimes needs to let its parent supply markup
  - Use `{#snippet name(args)}…{/snippet}` to declare a reusable block of markup
  - Use `{@render name(args)}` to instantiate that block in the page
  - Accept children from a parent by declaring a `children: Snippet` prop
  - Distinguish Svelte 5 snippets from Svelte 3/4 `<slot>` and explain why they were redesigned
status: ready
---

# Lesson 3.6 — Snippets: {#snippet} and {@render}

## 1. Concept — The hole in the component

### 1.1 The problem: a Card that wants different contents every time

Every component we have built so far produces *all* its own markup. `InfoCard` renders a label and a value. `Avatar` renders an image or initials. `Input` renders a label and an input. None of them ask the parent: "what do you want me to put *inside* me?"

But imagine a `Card` component — a box with a border, a header, a body, a footer, padding, and a shadow. The *chrome* is fixed. The *contents* are different every time you use it. One card contains a product summary; another contains a chart; a third contains a sign-in form. The card cannot possibly pre-declare markup for all of those. The card needs a **hole** — a place in its own markup where the parent drops in whatever it wants to render there.

Every UI framework has a mechanism for this hole. React calls it `children`. Vue calls it `<slot>`. Svelte 3 and 4 called it `<slot>` too. Svelte 5 redesigned it around a feature called **snippets**, and by April 2026 snippets are the only idiomatic way to solve this problem in new code.

### 1.2 What a snippet is

A **snippet** is a named, parameterised block of markup that can be declared, passed around, and rendered. You can think of it as "a function that returns HTML". You declare one with `{#snippet name(args)}…{/snippet}`, and you render one with `{@render name(args)}`. The arguments are optional — a snippet can take zero, one, or several parameters, and each parameter can be typed with TypeScript.

```svelte
{#snippet greeting(name: string)}
    <p>Hello, {name}!</p>
{/snippet}

{@render greeting('Ada')}
{@render greeting('Grace')}
```

That example declares a snippet called `greeting` and renders it twice with two different arguments. The output is two `<p>` elements. The snippet exists only inside the file that declared it — unless we pass it into another component as a prop, which is what Lesson 3.7 is about.

### 1.3 The `children` snippet: Svelte's special name for "what's inside the tag"

There is one snippet name with built-in meaning: `children`. When a parent writes content *between* the opening and closing tags of a component, Svelte collects that content into a snippet called `children` and passes it as a prop:

```svelte
<!-- Parent -->
<Card>
    <h2>Today's revenue</h2>
    <p>$41,200</p>
</Card>
```

```svelte
<!-- Card.svelte -->
<script lang="ts">
    import type { Snippet } from 'svelte';

    interface Props {
        children: Snippet;
    }

    let { children }: Props = $props();
</script>

<article class="card">
    {@render children()}
</article>
```

The parent's `<h2>` and `<p>` do not go into thin air — they become the body of a snippet named `children`, which the `Card` component receives as a prop and renders with `{@render children()}`.

### 1.4 The `Snippet` type from `svelte`

To type a snippet prop, import the `Snippet` type from `svelte`:

```ts
import type { Snippet } from 'svelte';
```

A parameterless snippet has the type `Snippet`. A snippet that takes arguments has the type `Snippet<[Arg1, Arg2, ...]>` — we will use the parameterised form heavily in Lesson 3.7. For this lesson, the unparameterised `Snippet` is all we need.

### 1.5 Why snippets replaced `<slot>`

In Svelte 3 and 4, the same problem was solved with `<slot>`. It worked, but it had three long-standing sharp edges:

- **Slots could not take typed parameters.** If you wanted a slot to render different content based on data the child had, you used "slot props" — a parallel, awkward API.
- **Slots were invisible to TypeScript.** They did not show up in the component's type surface, so you could not express "this component requires a slot called header".
- **Slots were part of HTML markup, not JavaScript.** You could not pass a slot around as a value, store it in an array, or decide at runtime which slot to render.

Snippets fix all three. A snippet is a first-class value with a real TypeScript type. It can be parameterised, stored, passed, and conditionally rendered. `<slot>` still works in Svelte 5's legacy mode, but it is deprecated, and it never appears in this course.

### 1.6 Multiple snippets at once

A component can accept more than one snippet. The most common case is a `Card` with a `header`, `children` (body), and `footer`:

```ts
interface Props {
    header?: Snippet;
    children: Snippet;
    footer?: Snippet;
}
```

The parent declares additional snippets inside the component tag with `{#snippet header()}…{/snippet}` — we will do exactly that in the mini-build below.

### 1.7 Snippets as first-class values

Unlike Svelte 3/4 slots, snippets are first-class JavaScript values. You can store them in variables, put them in arrays, pass them through multiple levels of components, and conditionally select which one to render at runtime:

```svelte
<script lang="ts">
    import type { Snippet } from 'svelte';
    
    let { variant = 'default', headerA, headerB }: {
        variant: 'a' | 'b';
        headerA?: Snippet;
        headerB?: Snippet;
    } = $props();
    
    const activeHeader: Snippet | undefined = $derived(
        variant === 'a' ? headerA : headerB
    );
</script>

{#if activeHeader}
    {@render activeHeader()}
{/if}
```

This power means you can build advanced patterns like "slot registries" where a layout collects snippets from deeply nested children and renders them in a portal-like location. The pattern is advanced and rare, but knowing snippets are values (not magic markup holes) gives you confidence to compose them freely.

### 1.8 When to use snippets vs when to use components

A common question: if both snippets and components let you reuse markup, when do you choose which?

- **Use a component** when the reusable piece has its own state, its own effects, its own lifecycle, or its own encapsulated logic. A `Modal` that manages its own open/closed state is a component.
- **Use a snippet** when you need to inject *caller-defined* markup into a component's layout without creating a new file. The `Card`'s header, body, and footer are snippets because the Card does not own that content — the caller does.

The rule of thumb: components encapsulate behavior; snippets delegate appearance. A component says "I know what to do." A snippet says "you tell me what to show."

## Deep Dive

**Why this matters at scale.** In a production component library, the snippet pattern (passing caller-defined markup into a component) appears in every compound component: dialogs (title, body, actions), tabs (tab label, tab content), tables (header cell, body cell), and data lists (item renderer). Without a typed mechanism for this, teams resort to untyped string props, render functions with complex signatures, or worse — inline HTML in JavaScript. Snippets give you type-safe, IDE-supported, syntax-highlighted markup injection that the compiler checks at build time. A library of 20 components might define 60 snippet props total. Every one of them shows up in autocomplete, is checked for typos, and renders with full Svelte template features.

**The mental model.** Think of a snippet as a *stencil*. A component is a painting — self-contained, complete, cannot be altered. A snippet is a stencil — a shape you hand to someone else so they can spray-paint through it. The `Card` component is a frame; it does not know what picture goes inside. The caller provides the stencil (the snippet), and the component applies it at render time. This separation means you can change the content without touching the frame, and change the frame without touching the content.

**Edge cases.** A snippet declared inside a component tag is scoped to that tag. You cannot reference it from a sibling or from outside. If you declare a snippet at the file's top level, it is available everywhere in that file but cannot be exported as a module. Parameterized snippets (`{#snippet row(item: Item)}`) must have their argument types match what the child component passes to `{@render row(item)}` — a type mismatch is a compile-time error. Another edge case: rendering a snippet that might be `undefined`. Always guard with `{#if snippet}{@render snippet()}{/if}` or make the prop required.

**Performance implications.** Snippets have zero runtime overhead compared to inline markup. The compiler treats a snippet render site the same as any other template expression — it creates the DOM nodes directly, no virtual DOM, no extra function call overhead. The only "cost" is the function object itself (a few bytes in memory per snippet instance), which is negligible. Compared to the React pattern of passing render functions (`renderItem={(item) => <div>...</div>}`), which creates a new function on every render and triggers child re-renders, Svelte snippets are referentially stable and do not cause unnecessary updates.

**Connection to other modules.** Snippets are the foundation of the advanced patterns in Lesson 3.7 (passing snippets as props with parameters — the render-prop pattern). Module 4 uses snippets inside `{#each}` for custom list rendering. Module 6's transition system works with snippet-based component boundaries. Module 11's TanStack Table integration uses parameterized snippets for cell renderers. Module 12's error boundaries use the `failed` snippet for fallback UI. Snippets are Svelte 5's answer to every pattern that other frameworks solve with render props, higher-order components, or scoped slots.

## 2. Style it — Card chrome that never changes

`Card.svelte` owns the chrome — border, radius, padding, optional header and footer styling. The content styling is the parent's responsibility. This is the classic *container/content* separation: the card guarantees consistent chrome across every card in the app while parents retain complete freedom over what goes inside.

## 3. Interact — The two-shape trap, then the snippet fix

Try to pre-declare a `Card` that supports two layouts — "with header" and "without header" — by adding boolean props. It works for two layouts. Now add "with footer", "with header and footer", "with title only", "with actions". Five booleans later, your component has 32 possible combinations and most of them are undertested. Snippets flip the problem: instead of the card knowing every possible layout, the card provides three holes (`header`, `children`, `footer`) and the *caller* chooses which ones to fill. Two optional snippets replace five booleans.

## 4. Mini-build — Three cards, one Card component

### Files

- `src/lib/components/Card.svelte` (already in repo)
- `src/routes/modules/03-components/06-snippets/+page.svelte`

### Key excerpt

```svelte
<!-- Card.svelte -->
<script lang="ts">
    import type { Snippet } from 'svelte';

    interface Props {
        header?: Snippet;
        children: Snippet;
        footer?: Snippet;
    }

    let { header, children, footer }: Props = $props();
</script>

<article class="card">
    {#if header}
        <header class="card__header">{@render header()}</header>
    {/if}
    <div class="card__body">{@render children()}</div>
    {#if footer}
        <footer class="card__footer">{@render footer()}</footer>
    {/if}
</article>
```

```svelte
<!-- +page.svelte -->
<Card>
    {#snippet header()}
        <h2>Revenue</h2>
    {/snippet}

    <p class="metric">$41,200</p>
    <p class="delta">+12% vs last week</p>

    {#snippet footer()}
        <small>Updated 5 minutes ago</small>
    {/snippet}
</Card>
```

### DevTools verification

1. Open Svelte DevTools and click a `Card` node. The **Props** panel now shows `header`, `children`, and `footer` entries — each labelled as a snippet. That is proof snippets are first-class typed values.
2. In the Elements panel, find the `.card__header` and `.card__footer` elements. They exist only for the cards where the parent provided a snippet; cards without a header do not render the empty wrapper. That is the `{#if header}` guard working.

## 5. Check your understanding

<details>
<summary><strong>Q1.</strong> In your own words, what is a snippet?</summary>

A named, parameterised block of markup that a parent can declare and a child can render. It is like a function that returns HTML: you call it with `{@render name(args)}`.
</details>

<details>
<summary><strong>Q2.</strong> What is special about the snippet name `children`?</summary>

Svelte automatically collects any markup written *between* a component's opening and closing tags into a snippet called `children` and passes it as a prop. It is the modern replacement for default slot content.
</details>

<details>
<summary><strong>Q3.</strong> Why did Svelte 5 replace `<slot>` with snippets?</summary>

Slots had no TypeScript surface, could not be passed around as values, and had a separate awkward API for typed parameters. Snippets are first-class typed values with a single uniform syntax.
</details>

<details>
<summary><strong>Q4.</strong> How do you declare a prop that accepts a snippet?</summary>

Import `type { Snippet } from 'svelte'` and list the prop in your interface: `interface Props { children: Snippet }`. A parameterised snippet uses `Snippet<[...]>`, covered in Lesson 3.7.
</details>

<details>
<summary><strong>Q5.</strong> A `Card` component has optional `header` and `footer` snippets. A caller only provides `header`. What does the rendered DOM contain?</summary>

The card's header wrapper and its body are rendered. The footer wrapper is not rendered at all, because the `{#if footer}` guard skips over it.
</details>

## 6. Common mistakes

- **Forgetting `{@render}`.** Writing `{children}` does not work — you have to *call* the snippet with `{@render children()}`. Without the parentheses and the `@render` keyword, nothing is rendered.
- **Assuming `<slot>` still works.** It works in legacy mode only. In runes mode (what this course uses), `<slot>` is not allowed and a snippet + `{@render}` is the only path.
- **Making `children` optional when you really need it.** If a component is meaningless without content, make `children: Snippet` required.
- **Declaring snippets inside the wrong level.** A snippet declared inside a component tag is scoped to that tag. A snippet declared at the top level of a file can be rendered anywhere in that file.

## 7. What's next

Lesson 3.7 moves snippets into props — you will pass a snippet from parent to child, use the parameterised `Snippet<[T]>` type, and learn the render-prop pattern that powers list components, tables, and dialogs.
