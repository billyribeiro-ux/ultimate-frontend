---
module: 11
lesson: 11.1
title: The prop drilling problem
duration: 45 minutes
prerequisites:
  - Module 3 — components and $props()
  - Module 2 — $state and $derived
learning_objectives:
  - Define prop drilling in your own words and recognise it in a component tree
  - Explain why prop drilling hurts maintainability, typing, and refactor safety
  - Name the three solutions Svelte offers (context, .svelte.ts stores, reactive classes)
  - Pick the right solution for a given scope (tree-local, route-local, app-global)
  - Diagnose a prop-drilling smell in your own code and sketch a refactor path
status: ready
---

# Lesson 11.1 — The prop drilling problem

> **Atomic lesson format** — Concept, Style it, Interact, Mini-build. This lesson opens Module 11 by establishing the *pain* that every other lesson in the module solves. You will meet three specific solutions (context, `.svelte.ts` stores, reactive classes) in the lessons that follow.

## 1. Concept — Why passing props through six components is a symptom, not a feature

### 1.1 The problem, in one sentence

Imagine you are building a dashboard. In the top-left corner is a small avatar showing the currently signed-in user. Nine levels deep inside a table cell, a button needs to know that user's ID so it can attach it to an "assigned by" field. The user lives in the root layout. The button lives inside `Table → Row → Cell → ActionMenu → Button`. How does the ID get from the root to the button?

The obvious answer — **pass it as a prop, through every component in between** — is exactly what this lesson teaches you to stop doing. The obvious answer is **prop drilling**, and while it works, it ruins your codebase in four specific ways.

### 1.2 What prop drilling actually costs you

Prop drilling means a prop exists on a component that does not *use* the prop. The component accepts it only so it can forward it downward. If your `Table` component takes a `currentUserId` prop but never reads it — only passes it into `Row` — then `Table` is drilled. So is `Row` if it forwards it to `Cell`. So is `Cell`, and `ActionMenu`, and so on. By the time the ID reaches the button, five intermediate components have been polluted with a prop that has nothing to do with their own responsibility.

The four costs:

1. **Every intermediate type gets dirty.** In TypeScript-strict mode, every component in the chain must declare the forwarded prop in its `$props()` interface. Add one new global value and you edit eight files. Remove one and you edit eight files again. The type surface of your application balloons.
2. **Refactors become dangerous.** If you decide `Row` should no longer render `Cell` and instead render a snippet, you now have to remember to move the prop too. Forgetting silently breaks deeply-nested children because TypeScript cannot warn you about props that were never supposed to exist on `Row` in the first place.
3. **Unrelated components become coupled.** `Table` now depends on the *existence* of `currentUserId` even though `Table` renders rows and cells and has no business knowing about authentication. A component that depends on values it does not use is a component that cannot be reused in another project.
4. **The component tree lies about the data flow.** A new developer reading `Table.svelte` sees a `currentUserId` prop and assumes the table actually does something with it. They spend twenty minutes searching for where. The prop is only drilling, but the code does not admit it. Your code should never lie to its next reader.

### 1.3 The three solutions Svelte gives you

Svelte 5 solves prop drilling three different ways, each appropriate for a different *scope*. Pick the smallest scope that fits your problem; do not reach for a global store when a context would do.

1. **Svelte's `setContext` / `getContext` API (Lesson 11.2).** Context is the right answer when the state belongs to a *subtree* of your component tree. A form and its fields. A modal and its slots. A table and its rows. The parent calls `setContext(KEY, value)` once; any descendant — no matter how deep — calls `getContext(KEY)` to read it. No components in between have to know the value exists. Context is not global; a sibling subtree cannot see it. That is a feature, not a limitation.

2. **`.svelte.ts` files with module-level `$state` (Lessons 11.3 and 11.4).** Sometimes the state genuinely is app-wide. A shopping cart persists across every page of a store. A colour theme applies to every component on screen. For this scope, write a `.svelte.ts` file — a TypeScript module with the special `.svelte.ts` extension that tells the Svelte compiler *"the runes in this file should be processed"*. Export a singleton. Every component that imports it sees the same live object. Navigation across routes keeps it alive because modules are evaluated once per JS runtime.

3. **Reactive classes with runes (Lesson 11.5).** If a feature is more than a bag of values — if it has methods, derived computations, and encapsulated rules like *"adding an item that already exists should bump the quantity"* — wrap the state in a class. Put `$state` on class fields; put `$derived` on fields whose value depends on other fields; put business logic in methods. Instantiate once in a `.svelte.ts` file and export the instance. You now have a testable, typed, reusable store with zero ceremony.

### 1.4 What is *not* a solution

A few things that look like solutions but are not:

- **A plain `.ts` file with `let cart: Cart[] = []`.** The runes compiler does not process files without the `.svelte.ts` extension. The variable will not be reactive; updates will not re-render. Lesson 11.3 explains exactly why in terms of how the compiler works.
- **A store library copied from a React tutorial.** Svelte 5 does not need Redux, Zustand, or MobX. Runes already solve the problem, and they integrate with the compiler in ways external libraries cannot.
- **A global `window` property.** Besides being untyped and untestable, it breaks server-side rendering — there is no `window` on the server.

### 1.5 A word on testability

One of the reasons prop drilling is a smell is that deeply-drilled props become untestable in isolation. To unit-test the deepest component, you have to construct every intermediate parent with all its intermediate props, just to deliver a single value. Contexts, module stores, and reactive classes each let you substitute the dependency directly in the test: render the component under test inside a harness that provides a fake context, or import the store and set its initial state before the test runs. Module 12's testing lessons will show you both patterns.

The habit to build is this: **every time you add a prop to a component, ask whether that component actually *uses* the prop or merely *forwards* it.** If it forwards, stop and pick one of the three solutions above.

## 2. Style it — A "bad tree" visual that makes the smell visible

The mini-build renders a diagram of a drilled tree in red and a fixed tree in green, so that students can see the difference on the page. Styling rules:

- Per-page brand colour: `--color-brand: oklch(72% 0.2 25)` (warm red, because this lesson is the *problem*).
- Two columns on desktop (`min-width: 768px`), stacked on mobile.
- Each "component" in the diagram is a 44px-minimum-height rounded box for touch-target parity.
- The arrow connector is an OKLCH-tinted `::before` pseudo-element; under `prefers-reduced-motion` it fades in with a single transition of 0.01ms (effectively off) instead of sliding.

## 3. Interact — Seeing the smell in five components

The mini-build shows five named components, `App → Layout → Page → Section → Button`. Clicking the "drill me" toggle animates a red `currentUserId` prop being passed through every box. Clicking "fix it" shows the same value reaching the `Button` directly, without touching any intermediate box, because the `Button` reads it from a context. No new rune appears in this lesson — the fix itself is taught in 11.2 — but the student sees why the fix matters before they learn how to write it.

## 4. Mini-build — A diagrammed "prop drilling visualiser"

**File:** `src/routes/modules/11-state/01-prop-drilling/+page.svelte`

The page renders two side-by-side trees. The left tree shows the drilled version, highlighting every intermediate node that receives `currentUserId` only to forward it. The right tree shows the fixed version, where intermediate nodes have *no extra prop* and the leaf node has a green "read from context" badge. A button toggles between the two so the student can flip back and forth.

### DevTools moment

Open the DevTools Elements panel and inspect an intermediate node (`Layout`, `Page`, `Section`). On the drilled tree, every intermediate `<article>` carries a `data-has-id="true"` attribute — the student can literally *see* the prop travelling through nodes that do not use it. On the fixed tree, only the root and the leaf carry that attribute. The absence of the attribute on the middle is the whole point.

## 5. Check your understanding

<details>
<summary><strong>Q1.</strong> Define prop drilling in your own words without using the word "drill".</summary>

Prop drilling is when a component declares a prop that it does not itself read — the prop exists on the component only so it can be forwarded to a child. The prop is travelling through a component that has no interest in it.
</details>

<details>
<summary><strong>Q2.</strong> Why is prop drilling worse in TypeScript-strict mode than in untyped JavaScript?</summary>

In strict TypeScript, every intermediate component must declare the forwarded prop in its `$props()` interface, so adding or removing a single drilled value requires editing every file in the chain. Untyped JavaScript does not force the edit, but it also does not catch mistakes. Strict TypeScript makes the cost of drilling visible, which is a feature — it reveals the design smell instead of hiding it.
</details>

<details>
<summary><strong>Q3.</strong> You need to share a value between a parent and one deeply-nested descendant — but only inside that one subtree. Which of the three solutions is correct?</summary>

Svelte's context API (`setContext` / `getContext`, Lesson 11.2). It is the smallest-scope solution and exactly matches the requirement of "this subtree only". A module-level store would make the value visible from anywhere in the app, which is a larger scope than needed.
</details>

<details>
<summary><strong>Q4.</strong> Why can't you use a plain <code>.ts</code> file to hold <code>$state</code>?</summary>

The runes compiler only processes files with the `.svelte` or `.svelte.ts` extension. In a plain `.ts` file, `$state` is not recognised — it becomes either a syntax error or, worse, a plain variable that never triggers reactivity. Lesson 11.3 explains the compiler mechanism in detail.
</details>

<details>
<summary><strong>Q5.</strong> Give one reason a global <code>window.cart</code> is worse than an exported singleton from a <code>.svelte.ts</code> file.</summary>

Several acceptable answers: it breaks SSR (there is no `window` on the server), it is untyped, it leaks into other scripts on the page, and it cannot be imported or tested in isolation. A `.svelte.ts` singleton is typed, SSR-safe, import-only, and trivially mockable in tests.
</details>

## 6. Common mistakes

- **Reaching for context when plain props would do.** If a value only needs to go from a direct parent to its direct child, pass it as a prop. Context has a small cost in indirection; use it when drilling *starts*, not for every shared value.
- **Using module-level stores for subtree-local state.** Module stores are global by construction. A modal's "is open" state should not be a module store — two modals open at once would collide. Use context for modal state.
- **Mutating a reactive class instance from outside the class.** If your `CartStore` has an `add()` method, always call `cart.add(item)`. Never reach in and do `cart.items.push(item)` from a component. The former respects the encapsulation you designed; the latter turns a testable class into a fancy global variable.
- **Assuming context survives navigation.** Context is bound to the component subtree that called `setContext`. Navigating to a new route destroys and recreates the tree. Cart data that must persist across routes belongs in a `.svelte.ts` module store, not in context.

## 7. What's next

Lesson 11.2 introduces Svelte's typed context API — the smallest-scope fix for prop drilling inside a single component subtree.
