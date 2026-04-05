---
module: 1
lesson: 1.5
title: PE7 CSS architecture — @layer, OKLCH tokens, mobile-first baseline
duration: 60 minutes
prerequisites:
  - Lesson 1.3 — Comfortable with the style block
  - Lesson 1.4 — Basic TypeScript annotations
learning_objectives:
  - Explain what @layer does and why PE7 uses six named layers
  - Read and write an OKLCH colour by its three coordinates
  - Declare a design token as a CSS custom property and consume it with var()
  - Write a mobile-first media query using min-width only
  - Identify which layer a given rule should live in
status: ready
---

# Lesson 1.5 — PE7 CSS architecture: @layer, OKLCH tokens, mobile-first baseline

## 1. Concept — Why real codebases need a CSS architecture

### 1.1 The problem: CSS was never designed for large applications

CSS is a declarative language that was designed in 1996 to style documents, not applications. It has two features that make large applications difficult: specificity and source order. Specificity decides which rule wins when two rules target the same element; source order decides which wins when two rules have the same specificity. Both rules sound simple. In practice, they produce endless small accidents. A component library declares `.button { padding: 1rem }`, a page-level stylesheet overrides it with `.page .button { padding: 2rem }`, and then a third file that loads last writes `.button { padding: 0.5rem }` and the whole carefully tuned cascade collapses into a fight. The solution developers reached for historically was to pile on `!important`, or to use pre-processors like Sass, or to abandon CSS entirely in favour of CSS-in-JS runtimes. Each of these has its own cost.

In 2022, browsers added a native feature called **CSS cascade layers** — the `@layer` rule — that solved the problem properly. You declare layers up front, in the order you want them to win. Any rule inside layer `reset` is *always* overridden by any rule inside layer `components`, regardless of specificity or source order. The cascade is no longer an accident. It is a contract you control.

PE7 — the CSS system this course uses everywhere — is built entirely around `@layer`. Six named layers, declared once in `src/app.css`, decide the order of every rule in the entire application. Once you understand those six layers, you will never fight specificity again.

### 1.2 The six PE7 layers, in order

```css
@layer reset, tokens, base, layout, components, animations;
```

A later layer wins over an earlier layer. So:

1. **reset** — The smallest possible cross-browser reset. `box-sizing: border-box`, margin removal on headings, inheritable font resets. Loses to everything.
2. **tokens** — The design system. Every variable (`--color-brand`, `--space-md`, `--text-lg`) is declared here on `:root`. Tokens never "apply" directly to elements; they only exist to be consumed by later layers.
3. **base** — Document-level defaults. `html`, `body`, `h1`..`h6`, `p`, `code`. This is where your baseline typography and background colour live.
4. **layout** — Generic layout primitives that work anywhere: `.page`, `.stack`, `.cluster`. No component-specific rules. These are the Lego baseplates.
5. **components** — Actual component styles. Everything you write inside a `<style>` block in a `.svelte` file ends up here. This is where 95% of your CSS lives.
6. **animations** — The *last* layer, so it wins over everything, because it contains the global `prefers-reduced-motion` override that must beat any opinionated animation in the rest of the app.

The crucial insight: because `components` wins over `base`, you can never *accidentally* override a component's style with a base paragraph rule. Because `animations` wins over `components`, a user's reduced-motion preference is always respected no matter how excited your component is about its transitions.

### 1.3 OKLCH, briefly

PE7 uses OKLCH — a perceptually uniform colour space — for every colour. An OKLCH colour has three coordinates:

- **L (lightness)**, 0% to 100%. 0 is pure black, 100 is pure white.
- **C (chroma)**, roughly 0 to 0.4. 0 is grey; higher is more saturated.
- **H (hue)**, 0 to 360 degrees around the colour wheel. 0 is red, 120 is green, 240 is blue, 270 is violet.

```css
--color-brand: oklch(65% 0.22 270);
```

This reads "a fairly light, fairly saturated violet". The reason PE7 insists on OKLCH (and forbids hex, rgb, hsl) is that OKLCH's lightness coordinate matches *actual* perceived brightness, which hex and hsl do not. Two OKLCH colours with the same L will look equally bright to the human eye. Two hsl colours with the same L will not — blue will look darker than yellow even at identical "lightness" values. This matters enormously for accessibility and for building colour scales that stay readable across hues.

You do not have to become an OKLCH expert today. You just need to know: every colour in this course lives inside one `oklch(...)` call in `app.css`, and every `<style>` block refers to those colours by their `--color-*` token name.

### 1.4 Design tokens are CSS custom properties

A **design token** is a named value — a colour, a spacing, a radius, a shadow — that is declared once and consumed everywhere. CSS custom properties (the `--foo` syntax) are how PE7 stores tokens. They have three superpowers:

1. **They cascade.** If you override `--color-brand` on a specific element, every descendant sees the new value. This is the basis of per-page colour personalities (Lesson 6.9).
2. **They are dynamic.** Unlike Sass variables which are compiled away, custom properties are live values in the browser. You can change them with JavaScript, with `@media` queries, or with user preferences.
3. **They work with `calc()` and modern functions.** `calc(var(--space-md) * 2)` is legal and real.

In PE7, every colour, every spacing, every font size, every radius, every shadow is a token. You will almost never see a raw value in a component's style block.

### 1.5 Mobile-first — why only `min-width`

PE7's last non-negotiable rule: all `@media` queries use `min-width`, never `max-width`. The base styles — the ones outside any media query — are the mobile styles. You enhance *upward* for larger screens:

```css
.card {
    padding: var(--space-md);
}
@media (min-width: 480px) {
    .card {
        padding: var(--space-lg);
    }
}
```

Reading the file top to bottom, you see mobile first and progressively add desktop. This matches the progressive enhancement model of the web: less-capable devices should get a working experience even if they ignore media queries, and more-capable devices should get extra polish on top.

Mixing `min-width` and `max-width` in the same codebase produces "dead zones" where neither query matches, or "double zones" where both apply. It is a solved problem if you pick one direction and stick to it. This course picks `min-width` and sticks to it forever.

## 2. Style it — The tokens in action

The mini-build is a token inspector that reads three PE7 tokens — `--color-brand`, `--space-lg`, `--radius-lg` — and demonstrates a scoped override. The top-level `section` overrides `--color-brand` so every descendant inside this lesson's card sees a custom hue without any other file changing. Mobile baseline is single-column; `@media (min-width: 480px)` introduces a two-column layout.

## 3. Interact — A typed list of tokens

The script block declares a `Token` interface and a typed array of tokens. The markup iterates over the array and renders a preview row for each. Here is the mistake:

```ts
const tokens = [
    { name: 'brand', value: '--color-brand' },
    { name: 'spacing-lg' }
];
```

TypeScript would accept this because the inferred type of `tokens` is the union of the two shapes, and one object is missing a `value`. You could accidentally render `undefined` in the UI. With an explicit interface the error is caught immediately:

```ts
interface Token { name: string; value: string; }
const tokens: Token[] = [
    { name: 'brand', value: '--color-brand' },
    { name: 'spacing-lg' } // Error: Property 'value' is missing.
];
```

Interfaces get their own lesson at 1.8. For now, notice that typing an array with `Token[]` forces every element to satisfy the same contract.

## 4. Mini-build — A token inspector

**File:** `src/routes/modules/01-foundation/05-pe7-architecture/+page.svelte`

The page renders a grid of token chips. Each chip shows a token's name and a visual preview — a coloured swatch for colour tokens, a sized bar for spacing tokens. Every value comes from PE7's `var(--...)` references, not raw literals.

### DevTools verification

1. Open DevTools → Elements → Computed.
2. Inspect the top-level `section` and filter for `--color-`. You should see both the global PE7 brand value *and* the scoped override.
3. Inspect a swatch and see that its `background-color` resolves to the overridden brand colour.

## 5. Check your understanding

<details>
<summary><strong>Q1.</strong> In your own words, what does <code>@layer</code> solve that ordinary CSS specificity cannot?</summary>

`@layer` lets you declare a global order of precedence that is independent of selector specificity and source order. Without layers, a rule with `id + class + tag` selectors beats one with just `class`, regardless of where it appears. With layers, a whole set of rules can be guaranteed to always win or always lose, regardless of their specificity.
</details>

<details>
<summary><strong>Q2.</strong> Why does PE7 use OKLCH instead of hex, rgb, or hsl?</summary>

Because OKLCH's lightness coordinate is perceptually uniform: two colours with the same L look equally bright to the eye. hex/rgb/hsl do not have this property, so building accessible colour scales with them requires hand-tuning. OKLCH lets you shift the hue while keeping contrast consistent.
</details>

<details>
<summary><strong>Q3.</strong> In which layer would you put a <code>.card</code> component style?</summary>

`components`. That is where all component-level CSS lives. When you write a rule inside a `<style>` block in a `.svelte` file, Svelte ensures it lands in the components layer.
</details>

<details>
<summary><strong>Q4.</strong> Why does PE7 forbid <code>max-width</code> in <code>@media</code> queries?</summary>

To enforce one-direction progressive enhancement. Base styles are mobile; `min-width` media queries add desktop features on top. Mixing `max-width` and `min-width` in the same codebase leads to dead zones (no query matches) and double zones (both match) which are hard to reason about.
</details>

<details>
<summary><strong>Q5.</strong> What happens if you declare <code>--color-brand</code> inside a scoped <code>&lt;style&gt;</code> block on a specific element?</summary>

Every descendant of that element inherits the overridden value via the normal custom-property cascade. Elements outside that subtree still see the original `:root` value. This is how PE7's per-page colour personalities work.
</details>

## 6. Common mistakes

- **Writing raw colour values in component styles.** `background: oklch(60% 0.2 200)` inside a `<style>` block defeats the entire token system. Use `var(--color-brand)` and override the token instead.
- **Using `max-width` media queries.** They look natural but they are backwards in a mobile-first system. Flip them to `min-width` and reorder the file.
- **Putting component rules in the `base` layer.** The `base` layer is for raw HTML tag defaults (`h1`, `p`, `code`). Anything with a class goes in `components`.
- **Overriding tokens globally inside a component file.** If you put `:root { --color-brand: red }` in a component, you just repainted every other page in the app. Scope the override to the component's top-level element instead.

## 7. What's next

Lesson 1.6 explains why PE7's type and spacing tokens are wrapped in `clamp()` — the fluid sizing technique that lets one declaration look good on every screen size.
