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

### 1.6 Why architecture matters more than any single rule

A common question from beginners is "why do I need six layers and a whole system when I am just building a simple website?" The answer is time. A simple website, if it is successful, becomes a complex website. One page becomes twenty. One developer becomes four. One component library version becomes five. Without a CSS architecture, every new developer and every new sprint adds rules that fight existing rules. The first sprint is fine; the tenth sprint is a minefield of `!important` overrides, orphaned selectors, and dead code nobody dares delete because nobody knows what depends on it.

PE7 is an answer to that decay. Its six layers, its strict token discipline, its one-directional media queries, and its insistence on OKLCH are not opinions for the sake of opinions — they are constraints that prevent an entire category of maintenance problems. You pay a small learning cost now, and you avoid a compounding maintenance cost for the lifetime of the project.

Think of it this way: a house built without a foundation still has walls and a roof. It even looks like a house. But when the soil shifts — when a team scales, when brand requirements change, when dark mode needs to be added — the foundation-less house cracks. PE7 is the foundation. It does not make your walls look different from the outside, but it makes every future remodel cheaper, safer, and faster.

### 1.7 How PE7 compares to other CSS methodologies

You may have encountered BEM, ITCSS, Tailwind, or CSS Modules elsewhere. PE7 is not in opposition to all of them — it borrows and synthesises the best parts:

- **From ITCSS** it borrows the idea of layers ordered by specificity, but uses native `@layer` instead of relying on file concatenation order.
- **From BEM** it borrows the double-underscore naming for child elements (`.card__title`), because clear naming reduces ambiguity. But it does not use BEM modifiers — PE7 uses CSS custom properties for variants instead.
- **From Tailwind** it borrows nothing at the implementation level but shares the philosophy of "design tokens that constrain choices." Where Tailwind does this through utility classes, PE7 does it through custom properties.
- **From CSS Modules** it borrows scoping — but Svelte's built-in hash-based scoping is better because it does not require extra tooling.

The result is a system that requires no pre-processor, no PostCSS plugin, no special bundler configuration. Everything PE7 uses is native CSS from the Baseline 2023 set: `@layer`, `oklch()`, `clamp()`, custom properties, native nesting, container queries, and `min-width` media queries. If it runs in a 2023 browser, PE7 works.

### 1.8 The token naming convention

Every PE7 token follows a predictable naming pattern: `--{category}-{name}`. Categories include:

- `--color-*` — colours (`--color-brand`, `--color-surface`, `--color-text-muted`)
- `--space-*` — spacing values (`--space-xs` through `--space-3xl`)
- `--text-*` — font sizes (`--text-sm`, `--text-base`, `--text-lg`, `--text-xl`)
- `--radius-*` — border radii (`--radius-sm`, `--radius-md`, `--radius-lg`)
- `--shadow-*` — box shadows (`--shadow-sm`, `--shadow-md`, `--shadow-lg`)
- `--dur-*` — animation/transition durations (`--dur-fast`, `--dur-normal`, `--dur-slow`)
- `--ease-*` — easing functions (`--ease-out`, `--ease-expressive`)

Naming consistency has a real payoff. When you see `var(--space-lg)` in a style block, you know immediately that it is a spacing value from the token system. You do not have to look up what `1.5rem` means in context. You do not have to wonder whether the person who wrote it meant "large by this component's standard" or "large by the global standard." The name carries the meaning, and the meaning is global. Every `--space-lg` in the project is the same distance. Every `--color-brand` in the project is the same hue.

## Deep Dive

**Why this matters at scale.** In a 50-component production app, CSS architecture is the difference between "I can change the brand colour in one minute" and "I need to search 200 files, and some of them have raw hex values that do not match." PE7's token + layer system means a rebrand — changing `--color-brand` from violet to teal — is a single-line change in `app.css`. Every component in the project picks it up automatically. Dark mode is the same story: override six surface/text tokens in a `prefers-color-scheme` media query and every component adapts. Without architecture, a dark-mode feature request becomes a six-sprint project of manually rewriting colour values in every file.

**The mental model.** Think of PE7 as a vending machine with fixed slots. The tokens layer stocks the machine with named values. The base, layout, and components layers are the customers who buy from the machine by name. Nobody reaches behind the glass to grab an unnamed raw value. If you want a new colour, you stock it in the machine first; every component that needs it requests it by name. This indirection is the entire value: you can restock the machine (change token values) without modifying a single customer (component).

**Edge cases.** The main gotcha is unlayered CSS. Svelte's scoped `<style>` blocks are unlayered by default, which means they beat every global `@layer` rule. This is usually correct — you want a component's own styles to win — but it can surprise you when a global token override in `@layer components` seems to "not work" on a specific element. The fix is to remember the cascade hierarchy: unlayered > `animations` > `components` > `layout` > `base` > `tokens` > `reset`. If you need a global rule to beat a scoped style, you probably need to restructure the component's relationship with the token, not escalate specificity.

**Performance implications.** CSS custom properties have essentially zero runtime cost in modern browsers. The browser resolves them during style calculation, which is already a per-frame operation. Having 80 tokens declared on `:root` does not measurably affect style-calc time. The `@layer` rule itself has zero runtime cost — it is purely a parse-time cascade decision. The only potential performance concern is extremely deep nesting of `var()` calls (e.g., `var(--a)` resolving to `var(--b)` resolving to `var(--c)` ten levels deep), which some browsers handle less efficiently. PE7 keeps token resolution to one or two levels of indirection, so this is never a concern in practice.

**Connection to other modules.** PE7's architecture appears in every single module of this course. Module 3 (components) uses CSS custom properties as the "knob" pattern for variant styling. Module 6 dives deep into each layer. Module 7 uses tokens to drive GSAP animation values. Module 8 shows how tokens survive the SSR/hydration boundary unchanged. Module 12 shows how the token system aids performance by preventing cascade fights that force browser repaints. Module 13 uses the same token-based color system to maintain contrast ratios for accessibility-related SEO signals. Understanding PE7 deeply here is an investment that pays dividends in every subsequent module.

### 1.9 "In production" — one variable, one rebrand

At a 50-developer e-commerce company, the marketing team requested a brand colour change from violet (hue 270) to teal (hue 180). In the old codebase, the brand colour appeared as hex values (`#7c3aed`, `#6d28d9`, `#8b5cf6`) scattered across 94 CSS files. A search-and-replace was risky because some hex values were close but not identical — hover states, disabled states, and transparency variants were all different hex strings. The rebrand took three sprints and introduced four visual regressions.

After adopting PE7, the same rebrand was a one-line change: `--color-brand: oklch(65% 0.22 180)` instead of `oklch(65% 0.22 270)`. Every surface, hover state, and transparency variant derived from that single token updated automatically. The rebrand took 10 minutes and introduced zero regressions. Dark mode — which derived its accent colour from the same token — also updated without any additional work.

### 1.10 The TypeScript angle — typing token lookups

While CSS tokens live in stylesheets, you sometimes need to reference token *names* in TypeScript — for example, when building a component API that accepts a `tone` prop:

```ts
type Tone = 'brand' | 'success' | 'warning' | 'error' | 'neutral';

interface Props {
    tone?: Tone;
}
```

TypeScript ensures that a caller cannot write `tone="sucess"` (typo). The Tone type acts as a bridge between your token naming convention and your component API. If you add a new token `--color-info`, you add `'info'` to the Tone union, and every component that handles tones gets a type error until it handles the new case. This is the TypeScript equivalent of PE7's single-source-of-truth principle applied to component APIs.

### 1.11 Comparison: PE7 vs other CSS methodologies

| Feature | PE7 | BEM | Tailwind | CSS Modules |
|---|---|---|---|---|
| Naming convention | `--category-name` tokens | `.block__element--modifier` | Utility classes | Auto-generated hashes |
| Specificity management | `@layer` (native cascade) | Convention only | `@layer` (v4) | Module scope |
| Colour system | OKLCH (perceptually uniform) | No opinion | oklch (v4) | No opinion |
| Responsive approach | `min-width` + `clamp()` fluid | No opinion | Responsive prefixes | No opinion |
| Runtime cost | Zero (native CSS) | Zero (native CSS) | Zero (native CSS) | Zero (build-time) |
| Svelte compatibility | Excellent (scoped + tokens) | Works but verbose | Works but fights scoping | Redundant (Svelte scopes natively) |

### 1.12 Common interview question

**Q: "What is a CSS cascade layer (`@layer`), and how does it solve the specificity problem in large applications?"**

**Model answer:** `@layer` lets you declare a fixed ordering of style groups. Rules in a later layer always beat rules in an earlier layer, regardless of selector specificity. For example, if you declare `@layer reset, tokens, base, components`, a `.card { color: red }` rule in the `components` layer beats a `#main .section .card { color: blue }` rule in the `base` layer — even though the `base` rule has higher specificity — because `components` comes after `base` in the layer order. This eliminates the most common source of CSS bugs in large apps: developers writing increasingly specific selectors to override rules they did not write, eventually resorting to `!important`. With layers, you structure the cascade intentionally and specificity within each layer only matters for rules within that same layer.

## Going Deeper

**Official docs to read next:**

- [svelte.dev/docs/svelte/styling](https://svelte.dev/docs/svelte/styling) — how Svelte handles `<style>` blocks and integrates with CSS features.
- [developer.mozilla.org/en-US/docs/Web/CSS/@layer](https://developer.mozilla.org/en-US/docs/Web/CSS/@layer) — the MDN reference for cascade layers.
- [developer.mozilla.org/en-US/docs/Web/CSS/color_value/oklch](https://developer.mozilla.org/en-US/docs/Web/CSS/color_value/oklch) — the OKLCH colour function reference.

**Advanced pattern: dark mode with token overrides.** PE7's token system makes dark mode a small set of overrides rather than a rewrite. Inside `app.css`, add a media query that reassigns surface and text tokens:

```css
@layer tokens {
    @media (prefers-color-scheme: dark) {
        :root {
            --color-surface: oklch(15% 0.01 270);
            --color-surface-2: oklch(20% 0.015 270);
            --color-text: oklch(92% 0.01 270);
            --color-text-muted: oklch(65% 0.01 270);
            --color-border: oklch(30% 0.02 270);
        }
    }
}
```

Every component that reads these tokens adapts automatically. You never write a single line of dark-mode CSS inside a component.

**Challenge question (combines Lesson 1.5 + Lesson 1.7 + Lesson 1.9):** A component uses `background: oklch(60% 0.2 200)` directly in its style block instead of `var(--color-brand)`. Explain three concrete problems this causes when the project grows: one related to rebranding, one related to dark mode, and one related to accessibility contrast requirements.

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
