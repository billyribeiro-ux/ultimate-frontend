---
module: 1
lesson: 1.7
title: Scoped style blocks — how Svelte's CSS scoping works
duration: 45 minutes
prerequisites:
  - Lesson 1.3 — The three blocks of a .svelte file
  - Lesson 1.5 — PE7 tokens and layers
learning_objectives:
  - Explain in plain English how Svelte scopes CSS at compile time
  - Read a compiled class attribute and identify the hash suffix
  - Predict which selectors will apply to which elements in a scoped style block
  - Use :global() deliberately and understand when it is the right tool
  - Diagnose "my rule does not apply to this element" problems
status: ready
---

# Lesson 1.7 — Scoped `<style>` blocks: how Svelte's CSS scoping works

## 1. Concept — One `.card` class in every file, zero conflicts

### 1.1 The problem: global CSS is a shared namespace

Every `<style>` tag on a traditional web page is part of a single, global stylesheet. If one file declares `.card { background: blue }` and another declares `.card { background: red }`, the last one loaded wins, and the first author's intent is silently erased. The dominant workaround for twenty years was a naming convention called **BEM** (`block__element--modifier`) — authors wrote long, prefixed class names like `product-card__title--featured` to reduce collisions. BEM works, but it puts the burden on human memory: you have to remember to prefix every class, every day, in every file, forever. One forgotten prefix causes a silent bug.

Svelte removes the burden entirely. When you write a `<style>` block inside a `.svelte` file, Svelte rewrites your CSS at compile time so that every selector is guaranteed unique to *this file*. You can have a `.card` class in `Navbar.svelte`, another `.card` class in `Footer.svelte`, and a third `.card` class in `ProductList.svelte`. They are three completely separate rules that never interact. You do not have to name them `.navbar-card` and `.footer-card`. The compiler handles it.

This mechanism has a short, memorable name: **scoped styles**.

### 1.2 What Svelte actually does at compile time

When Svelte compiles a component, it generates a unique class name based on a hash of the file's contents — something like `svelte-1a2b3c4`. Then:

1. **Every selector in the `<style>` block** is rewritten to include that hash. `.card` becomes `.card.svelte-1a2b3c4`.
2. **Every matching element in the markup** has the same hash added to its `class` attribute. `<article class="card">` becomes `<article class="card svelte-1a2b3c4">`.

After the rewrite, `.card.svelte-1a2b3c4` only matches elements that have both classes — which, by construction, only happens inside the component where the style was declared. A `.card` element in a different component has a different hash, so the selectors never overlap.

This is a compile-time, zero-runtime mechanism. The browser is doing ordinary CSS selector matching on ordinary classes. There is no JavaScript watching anything. There is no shadow DOM. There is no runtime style injection. It is just a clever use of the standard class system.

### 1.3 Which selectors get scoped

Svelte scopes selectors that target elements *in this file's markup*. A few subtleties:

- Plain element selectors (`h1`, `p`, `button`) are scoped. `p` becomes `p.svelte-hash` and only matches paragraphs this component authored.
- Class and attribute selectors are scoped the same way. `.card[data-open]` becomes `.card[data-open].svelte-hash`.
- `:hover`, `:focus`, and most pseudo-classes are scoped as expected.
- **Global selectors are not scoped.** `:root`, `html`, `body`, and anything wrapped in `:global(...)` are left alone.
- **Keyframes, CSS custom properties, and `@media` queries are scoped too** — each rule inside them passes through the same rewriter.

### 1.4 The `:global()` escape hatch

Sometimes you need to style an element that your component does not own. The classic case is a child component whose internal markup you cannot reach, or a piece of HTML rendered by `{@html someString}` which the compiler cannot see. For these cases Svelte provides `:global(selector)`:

```svelte
<style>
    .card :global(a) {
        color: var(--color-brand);
    }
</style>
```

Read it carefully: "inside any `.card` *that this component owns*, any `<a>` element — including ones this component does not own — should be this colour". The `.card` part is still scoped; only the `a` inside `:global()` is global. This **hybrid scoping** is the right tool 90% of the time when you need to break scope.

You can also mark an entire selector global: `:global(.card)`. Use this sparingly — if you find yourself writing it often, you have probably structured your component wrong.

### 1.5 When scoping seems to fail but is actually correct

Three common "bugs" that turn out to be scoping working correctly:

1. **"My rule does not apply to the element in the child component."** Correct. Scoping stops at component boundaries. The child has its own scope. Either pass a CSS custom property into the child (Module 3) or use `:global()` deliberately.
2. **"I removed a class from my markup and now the CSS rule shows an 'unused selector' warning."** Correct. Svelte is smart enough to know a selector can never match and warns you to delete dead code.
3. **"The compiled class has a weird suffix I did not write."** Correct. That is the hash Svelte added. Do not remove it in DevTools to "clean things up" — it is the entire mechanism.

### 1.6 Why scoping is better than the alternatives

CSS-in-JS libraries (styled-components, Emotion, vanilla-extract) also solve the global namespace problem, but at a cost: they ship runtime JavaScript that assembles styles in the browser, which adds bundle size, slows down first paint, and complicates SSR. Svelte's scoping has none of those costs. It runs at compile time only. There is no runtime code, no JavaScript parsing of CSS, no style injection. The browser receives a normal `.css` file with normal selectors and does normal selector matching. The scoping is invisible to the runtime.

This is the same "no runtime" philosophy you met in Lesson 1.1, applied to styles instead of components. It is why Svelte applications stay lean even when they have hundreds of components, each with its own fully scoped styles.

## 2. Style it — Two components, two `.card` classes, zero conflict

The mini-build has a single page component, but it defines a `.card` class *and* simulates what would happen if another component on the page also had a `.card` class. The simulation uses a deliberately global `:global(.card)` rule for comparison — so you can visually see what scoped vs global feels like.

## 3. Interact — A typed list you can iterate and style

The script block declares a list of "sibling pages" that share a `.card` class name. The markup renders them using an `{#each}` block. Because every card is inside this file's `<style>` scope, the styles apply exactly as written. Open DevTools and confirm the compiled `class="card svelte-xxxxxx"`.

Now imagine you wanted these cards to look different from another component's `.card`. In plain CSS you'd rename. In Svelte you don't have to.

## 4. Mini-build — Three scoped cards and a proof-of-scope demo

**File:** `src/routes/modules/01-foundation/07-scoped-styles/+page.svelte`

The page renders three cards using a scoped `.card` rule, and below them a note element that *deliberately* uses `:global(.global-note)` to show what a global class looks like in the compiled output.

### DevTools verification

1. Open DevTools → Elements.
2. Click one of the cards. Look at its `class` attribute. You will see `card svelte-XXXXXX`.
3. Click the global note. You will see only `global-note` — no hash suffix, because the selector was declared global.
4. Open the Styles panel and confirm the `.card` rule lists the hash, while the `.global-note` rule does not.

## 5. Check your understanding

<details>
<summary><strong>Q1.</strong> In one sentence, how does Svelte achieve CSS scoping without a runtime?</summary>

At compile time, Svelte appends a unique hash class to every selector in a component's `<style>` block and to every matching element in its markup, so the selectors only match elements this component authored.
</details>

<details>
<summary><strong>Q2.</strong> You have a rule <code>p { color: red }</code> in one component's style block. Does it affect paragraphs inside a child component that this component renders?</summary>

No. The child component has its own scope and its paragraphs have a different hash. If you really need to reach into the child, use `:global(p)` (but usually the right answer is to let the child style its own paragraphs).
</details>

<details>
<summary><strong>Q3.</strong> Why does Svelte warn you about "unused selector" in a style block?</summary>

Because Svelte statically analyses your markup and your selectors at compile time. If a selector in your style block cannot possibly match any element in your markup, Svelte tells you so you can delete it or fix the class name. It is dead-code detection for CSS.
</details>

<details>
<summary><strong>Q4.</strong> When should you reach for <code>:global()</code>?</summary>

When you legitimately need to style an element that this component does not own — for example, content rendered by `{@html}`, or deep children in a library component. Prefer hybrid scoping (`.card :global(a)`) over fully global selectors whenever you can.
</details>

<details>
<summary><strong>Q5.</strong> Does Svelte's scoping rely on shadow DOM?</summary>

No. Svelte uses a simple hash-based class rewrite. There is no shadow DOM, no custom element wrapper, no runtime logic — just clever compile-time CSS and class generation.
</details>

## 6. Common mistakes

- **Expecting styles to leak into child components.** They do not. If you need to style inside a child, pass a custom property as a prop (Module 3) or use `:global()` deliberately.
- **Using `:global()` to avoid thinking about scope.** If every rule in your style block starts with `:global()`, you have re-created the global CSS problem. Use it for specific, justified cases.
- **Removing the hash suffix in DevTools to "see what's really going on".** The hash IS what's going on. Removing it breaks the rule match.
- **Writing global reset styles in a component.** Global resets belong in `src/app.css`, not in a component's `<style>` block. Putting them in a component makes them appear and disappear as the component mounts and unmounts.

## 7. What's next

Lesson 1.8 introduces TypeScript interfaces — the tool you need for typing lists of objects like the ones you have been rendering in these mini-builds.
