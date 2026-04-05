---
module: 11
lesson: 11.2
title: Svelte context API — setContext and getContext
duration: 50 minutes
prerequisites:
  - Lesson 11.1 — the prop drilling problem
  - Module 3 — $props, TypeScript interfaces for props
learning_objectives:
  - Use setContext and getContext with typed generics to share subtree state
  - Explain why context is scoped to a component subtree, not the whole app
  - Create a Symbol-based context key to guarantee no naming collisions
  - Wrap getContext in a typed helper so every consumer gets the right type
  - Decide when context is the right tool versus a module store
status: ready
---

# Lesson 11.2 — Svelte context API — setContext and getContext

> **Atomic lesson format** — Concept, Style it, Interact, Mini-build. This is the first of three prop-drilling fixes. It solves the subtree-local case: a parent and a descendant need to share state, and no one else in the app is allowed to see it.

## 1. Concept — Context as a typed tunnel through the component tree

### 1.1 The problem context solves

Lesson 11.1 showed you the smell: props that pass through components that never use them. The smallest and most surgical fix is Svelte's **context API**. Context creates a tunnel from a parent component to any descendant, no matter how deep, that does not touch a single component in between. The parent calls `setContext(KEY, value)` inside its `<script>` block. Any descendant — even five or ten levels down — calls `getContext(KEY)` and gets the exact same value back.

Context is *not* global. A sibling subtree under a different parent cannot read the context you set. That is the most important property of the API and the reason it is a better fit for subtree state than a module store. Two unrelated parts of your app can each set a context with the same key, and each subtree sees only its own.

### 1.2 The API in one paragraph

Svelte ships two functions from the `'svelte'` package:

```ts
import { setContext, getContext } from 'svelte';
```

`setContext<T>(key, value)` stores a value under `key` on the current component instance's context map. `getContext<T>(key)` returns the value stored under that key by the *nearest ancestor* that called `setContext` with the same key. Both functions must be called during component initialisation — at the top level of a `<script>`, not inside an event handler, not inside a `$effect` that fires later. If you call them later, Svelte throws a clear error: *"setContext must be called during component initialisation"*.

The `<T>` in those signatures is a TypeScript generic. You should always provide it explicitly. Without it, `getContext` returns `unknown`, and TypeScript-strict will force you to either cast or check the value before using it — both of which defeat the purpose of typed context.

### 1.3 Why your key should be a Symbol, not a string

The `key` parameter can be any value, but you should always use a `Symbol`. A string key like `'theme'` has one property that causes real bugs in real codebases: **two files can declare the same string.** If `ComponentA.svelte` calls `setContext('theme', ...)` and an unrelated `ComponentB.svelte` deep inside calls `getContext<WrongType>('theme')`, TypeScript has no way to know the keys were meant to point at different things. They collide at runtime.

A `Symbol` is a JavaScript primitive whose identity is unique. `Symbol('theme')` called twice produces two different symbols. Export the symbol from a central module (for example `src/lib/stores/theme.svelte.ts`) and every consumer imports *that one symbol* — collisions are impossible by construction.

```ts
// src/lib/stores/theme.svelte.ts
export const THEME_KEY: symbol = Symbol('theme');
export interface ThemeContext {
	mode: 'light' | 'dark';
	accent: string;
}
```

```svelte
<!-- Parent.svelte -->
<script lang="ts">
	import { setContext } from 'svelte';
	import { THEME_KEY, type ThemeContext } from '$lib/stores/theme.svelte';
	const theme: ThemeContext = $state({ mode: 'dark', accent: 'oklch(72% 0.2 85)' });
	setContext<ThemeContext>(THEME_KEY, theme);
</script>
```

```svelte
<!-- DeepChild.svelte -->
<script lang="ts">
	import { getContext } from 'svelte';
	import { THEME_KEY, type ThemeContext } from '$lib/stores/theme.svelte';
	const theme = getContext<ThemeContext>(THEME_KEY);
</script>
```

Notice two things. First, the type parameter on `getContext<ThemeContext>` gives the descendant a fully-typed object without a cast. Second, because `theme` is a reactive `$state` object, *mutating* it from the child (for example `theme.mode = 'light'`) propagates back up and causes every component that reads `theme.mode` to re-render. Context delivers the *reference*; the reactivity comes from runes.

### 1.4 Wrap getContext in a typed helper

The pattern above duplicates the generic argument everywhere. A small helper removes the duplication and guarantees every consumer gets the correct type:

```ts
// src/lib/stores/theme.svelte.ts
import { getContext, setContext } from 'svelte';

export const THEME_KEY: symbol = Symbol('theme');
export interface ThemeContext { mode: 'light' | 'dark'; accent: string; }

export function setTheme(value: ThemeContext): ThemeContext {
	return setContext<ThemeContext>(THEME_KEY, value);
}

export function getTheme(): ThemeContext {
	const value = getContext<ThemeContext | undefined>(THEME_KEY);
	if (!value) throw new Error('getTheme() called outside a <ThemeProvider>');
	return value;
}
```

Every consumer writes `const theme = getTheme()` and knows exactly what it gets. The thrown error is the *best possible* thing that can happen when a provider is missing: a clear runtime message at the place where you forgot the setup step, instead of a silent `undefined` that causes a crash three frames later.

### 1.5 Context vs module store — a mental model

Ask this question: *if I render this component twice on the same page, should both instances see the same data or different data?*

- **Same data** → module store (Lesson 11.3). One cart; every cart icon in the app shows the same number.
- **Different data** → context. One modal per subtree. One form per subtree. One colour theme per dashboard tile.

Context is per-subtree by design. Module stores are per-app by design. Picking the wrong one is the single most common architectural mistake new Svelte developers make.

## 2. Style it — Per-card accents proven by scoped context

The mini-build renders three dashboard cards, each wrapped in its own provider that sets a different accent OKLCH hue. Every descendant inside a card reads the accent via `getTheme()` and applies it as a CSS custom property on its root element, proving the per-subtree scope visually.

- Per-page brand colour: `--color-brand: oklch(72% 0.2 200)`.
- Each card overrides `--color-brand` via inline style from the theme context value.
- Cards are a mobile-stacked grid, switching to 3 columns at `min-width: 768px`.
- `prefers-reduced-motion` disables the hover transition entirely.

## 3. Interact — Typed context in practice

Each card carries a button that mutates the context object's `accent` field. Because the context value is a `$state` proxy, the mutation re-renders every descendant that reads `theme.accent` — but only in *that card*. The other two cards remain on their original hue. This proves scope visually in three lines of code.

## 4. Mini-build — Three theme-scoped dashboard cards

**File:** `src/routes/modules/11-state/02-context-api/+page.svelte`

The page renders three sections. Each calls `setTheme(...)` with a different accent. Each section contains a deeply-nested badge element that calls `getTheme()` and uses the value to paint itself. Clicking the per-card button cycles the accent through three OKLCH hues.

### DevTools moment

Open the Elements panel and inspect one of the badges. You will see that its computed background resolves to the *context accent*, not to the page-level `--color-brand`. Switch to a different card's badge and see that its computed background is different. Now inspect the parent `<article>` — you will see no `accent` attribute and no forwarded prop. The child received its value through a tunnel that bypassed every parent in between.

## 5. Check your understanding

<details>
<summary><strong>Q1.</strong> Why must setContext and getContext be called during component initialisation?</summary>

Svelte attaches context to the component instance when it is being created. After initialisation, the context map is frozen for that instance. Calling either function later throws because there is no instance under construction to attach to. If you need a value that is computed later, put a reactive `$state` inside the context object and mutate the state — the context reference stays stable.
</details>

<details>
<summary><strong>Q2.</strong> Why is a Symbol a better context key than a string?</summary>

Two files can accidentally declare the same string key without knowing about each other, and TypeScript cannot catch the collision because both strings have type `string`. A Symbol, exported from one central module, is unique by construction. Every consumer that imports the same Symbol references the same identity, and two different Symbols can never collide even if their descriptions match.
</details>

<details>
<summary><strong>Q3.</strong> If a parent in +page.svelte sets a context and the user navigates to a different page, does the new page see the context?</summary>

No. Context is bound to the subtree that called `setContext`, and the old `+page.svelte` is destroyed on navigation. For values that must survive arbitrary navigation, move the provider up to a `+layout.svelte` that stays mounted, or use a `.svelte.ts` module store instead.
</details>

<details>
<summary><strong>Q4.</strong> Why does the <code>getTheme()</code> helper throw an error when no provider is present?</summary>

Throwing immediately turns a distant, confusing crash into a clear, local error message that names the exact missing setup step. This is a general rule of defensive API design: fail as close to the mistake as possible, with a message that tells the next developer what they forgot.
</details>

<details>
<summary><strong>Q5.</strong> How does context deliver reactivity if setContext is called only once during initialisation?</summary>

Context delivers a *reference*, not a value. If the reference points at a `$state` object, every descendant that reads a field of that object subscribes to the rune's normal reactivity. Mutating the object updates every reader. Context is the delivery mechanism; runes provide the reactivity.
</details>

## 6. Common mistakes

- **Passing a plain object instead of `$state`.** `setContext(KEY, { mode: 'dark' })` delivers a plain object. Children who read `theme.mode` will never re-render when you mutate it. Always wrap the context value in `$state`.
- **Calling setContext inside an `onclick` handler.** Svelte throws with *"setContext must be called during component initialisation"*. If the click needs to *change* something, mutate the reactive state inside the context instead of re-setting the context.
- **Using the same Symbol for two unrelated features.** Symbol identity is what scopes the lookup. If two features both need a theme, export `THEME_KEY` and `CARD_THEME_KEY` separately.
- **Forgetting the provider.** A child that calls `getTheme()` with no ancestor provider gets `undefined` from the raw API. Always wrap consumers in a typed helper that throws.

## 7. What's next

Lesson 11.3 introduces `.svelte.ts` files — the second fix for prop drilling, for state that must live outside any component subtree.
