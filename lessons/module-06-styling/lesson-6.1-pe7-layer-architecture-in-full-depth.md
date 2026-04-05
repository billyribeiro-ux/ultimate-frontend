---
module: 6
lesson: 6.1
title: PE7 @layer architecture in full depth
duration: 55 minutes
prerequisites:
  - Module 1 (PE7 introduction in Lesson 1.5)
learning_objectives:
  - Explain what the CSS @layer rule does and why it changed how stylesheets are organised
  - Name the six PE7 layers in order and describe the role of each
  - Predict which rule wins when two selectors of equal specificity live in different layers
  - Add a new rule to the correct layer without breaking the cascade
  - Explain why an unlayered rule wins over a layered one
status: ready
---

# Lesson 6.1 — PE7 `@layer` architecture in full depth

## 1. Concept — A cascade you can reason about

### 1.1 The problem: every big CSS codebase becomes a war zone

CSS is beautiful when you are building a small personal site. It gets ugly when four people work on the same stylesheet and the button on the marketing page keeps changing colour because someone added a utility in an "animations" file at the bottom. Every project ends up inventing its own convention — BEM, SMACSS, ITCSS, Atomic — to impose order on the cascade. These conventions help but they are rules in your head, not rules in the browser. The browser still applies the cascade the same way it has since 1996: by specificity, by source order, with `!important` as the nuclear option.

The **`@layer`** rule, finalised in 2022 and shipped in every browser, changed that. It lets you declare explicit *cascade layers* and tell the browser the order they should win in. A rule in a later layer beats any rule in an earlier layer, no matter how specific the earlier rule is. For the first time in the history of CSS, you can organise styles by **purpose** rather than by file order, and the browser will honour your organisation.

### 1.2 The PE7 six-layer stack

The PE7 architecture used throughout this course declares six layers in one line at the top of `app.css`:

```css
@layer reset, tokens, base, layout, components, animations;
```

The order of names in this declaration is the order of *priority*, from lowest to highest. Later wins. Every rule file is wrapped in one of these layer blocks, and the browser composes them cleanly:

1. **`reset`** — the lowest-priority layer. It contains the minimal modern reset (box-sizing, margins off, image defaults). Any rule in any higher layer can override it. Reset lives at the bottom so you never have to fight it.
2. **`tokens`** — the design-system variables. OKLCH colours, fluid type scale, spacing, motion, radii, shadows, breakpoints. Tokens do not contain selectors that style elements; they define the `:root` custom properties every other layer reads.
3. **`base`** — document defaults. Typography for `h1`–`h4`, body colour, line-height, `code` styles. Everything a bare `<article>` should look like before you add classes.
4. **`layout`** — generic layout primitives: `.page`, `.stack`, `.cluster`, `.grid`. These are the reusable spacing helpers used across routes.
5. **`components`** — specific component styles. Buttons, cards, forms, navigation. These can freely override `layout` and `base` because `components` wins the cascade over both.
6. **`animations`** — the highest-priority layer. It contains only one thing in the baseline: the `prefers-reduced-motion` block that forces every transition and animation to near-zero duration. That rule has to beat every other rule in every other layer — hence it lives at the top.

### 1.3 The golden rule: later wins, no matter the specificity

Without layers, the cascade obeys specificity. A selector with an ID (specificity 100) always beats a selector with only classes (specificity 10–90). With layers, the layer order takes precedence over specificity. A rule in `components` with specificity `0.1.0` beats a rule in `base` with specificity `0.2.0`. The layer comes first, the specificity is tie-breaking within a layer.

This is what lets PE7 use low-specificity class selectors everywhere. You do not need to increase specificity to win a cascade fight — you just put the rule in a later layer. That keeps the codebase flat, readable, and refactorable.

### 1.4 Unlayered rules win over layered ones

There is one important wrinkle. Any CSS written *outside* a `@layer` block is treated as belonging to an implicit top layer that beats every explicit layer. Svelte component `<style>` blocks are unlayered by default. This is actually what you want most of the time: a component's own styles should beat the global component layer because the component is the most specific context.

In PE7 we deliberately leave Svelte `<style>` blocks unlayered so that component-scoped styles (themselves hashed for scoping) always win over the global `@layer components` rules. If you ever need a global Svelte rule to live *inside* the layer stack, you can wrap it in `:global() { @layer components { ... } }` — but in this course we almost never do.

### 1.5 How to decide where a new rule goes

Ask four questions in order:

1. **Does it set a custom property?** → `tokens`.
2. **Does it target a bare element (h1, p, input) with no class?** → `base`.
3. **Is it a layout helper (.page, .stack, .grid)?** → `layout`.
4. **Does it target a class that names a UI pattern (.btn, .card, .toast)?** → `components`.

If the rule is a scoped component style, it goes in the component's own `<style>` block and does not need a layer at all.

### 1.6 Debugging the cascade

DevTools in Chrome 120+ shows a "Layers" badge next to each rule in the Styles panel and lists them in resolution order. When a rule is overridden, the strike-through shows you which layer won. This is a new debugging experience — earlier CSS had no way to display *why* a rule lost — and it is worth opening a page and poking at the badges once so you know where they live.

## 2. Style it — A small comparison component

The mini-build is a three-column demo showing the same button styled by a `base` rule, a `components` rule, and an animation override. Toggling a checkbox disables the components layer to prove visually that the fallback comes from `base`. Per-page colour: `oklch(65% 0.22 280)` (deep violet).

## 3. Interact — A layer swap you can see

Add a checkbox that toggles a class which moves a style between layers. The button's visual appearance changes because the cascade now resolves differently. You get a live, in-browser demonstration of the layer stack working.

## 4. Mini-build — Layer stack inspector

**File:** `src/routes/modules/06-styling/01-layer-architecture/+page.svelte`

The page renders three buttons with identical markup but different parent classes. Each class triggers a different layer-level rule. A table next to the buttons shows which rules are active and which layer they come from.

### DevTools verification

Open Chrome DevTools → Elements → Styles. You will see a small **"Layer"** label next to each rule. The order confirms: `animations` beats `components` beats `layout` beats `base` beats `reset`. Any rule inside the Svelte `<style>` block has no layer label at all and wins over everything.

## 5. Check your understanding

<details>
<summary><strong>Q1.</strong> Name the six PE7 layers in priority order (lowest to highest).</summary>

`reset`, `tokens`, `base`, `layout`, `components`, `animations`.
</details>

<details>
<summary><strong>Q2.</strong> A rule in `base` has specificity <code>0.2.0</code>. A rule in `components` has specificity <code>0.1.0</code>. Which wins?</summary>

The `components` rule. Layer order beats specificity; `components` sits above `base` in the declaration.
</details>

<details>
<summary><strong>Q3.</strong> Why does Svelte component <code>&lt;style&gt;</code> win over global <code>@layer components</code>?</summary>

Because unlayered CSS belongs to an implicit top layer that beats every explicitly-declared layer. Svelte's scoped styles are unlayered by default.
</details>

<details>
<summary><strong>Q4.</strong> Why does the `prefers-reduced-motion` rule live in the `animations` layer instead of `reset`?</summary>

Because it needs to beat every other rule, including component-level transition durations. `animations` is the highest-priority layer in the PE7 stack.
</details>

<details>
<summary><strong>Q5.</strong> Where does a new <code>.toast</code> class go?</summary>

In the `components` layer, because it names a UI pattern targeted by a class.
</details>

## 6. Common mistakes

- **Skipping the layer declaration line.** Without `@layer reset, tokens, ...;` the browser has no priority order and layers fall back to source order.
- **Writing global rules outside any layer.** Unlayered rules beat everything, which is rarely what you want in a global stylesheet. Reserve the unlayered space for Svelte component styles.
- **Fighting specificity instead of using layers.** If you find yourself adding IDs or `!important` to win a cascade, move the rule to a higher layer instead.
- **Confusing layer order with the order lines appear in a file.** Only the `@layer reset, tokens, ...;` line defines priority. Later use of `@layer components { ... }` contributes to the existing layer regardless of where it appears in the file.

## 7. What's next

Lesson 6.2 dives into OKLCH colour theory — why the course refuses hex and rgb, and how L, C, and H combine to give you a perceptually uniform palette.
