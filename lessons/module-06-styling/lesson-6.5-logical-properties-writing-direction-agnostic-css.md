---
module: 6
lesson: 6.5
title: Logical properties — writing-direction-agnostic CSS
duration: 40 minutes
prerequisites:
  - Lesson 6.4 (nesting)
learning_objectives:
  - Name the four logical direction axes (inline-start, inline-end, block-start, block-end)
  - Translate physical properties (margin-left, padding-top) to their logical equivalents
  - Build a component that works unchanged in LTR and RTL layouts
  - Use inset-inline-start and inset-block-start to position elements correctly in any writing mode
  - Decide when a physical property is still the correct choice
status: ready
---

# Lesson 6.5 — Logical properties

## 1. Concept — Writing CSS for every language

### 1.1 The problem: your "left" is not everyone's left

Arabic reads right-to-left. Hebrew reads right-to-left. Japanese vertical text reads top-to-bottom, then right-to-left. When a site is translated to one of these languages, designers expect the layout to *flip* — the sidebar that was on the left should now be on the right, the padding that was `padding-left` should now be `padding-right`, the arrow that pointed to the "next" item should reverse direction.

In old CSS this was a nightmare. You had to ship one stylesheet for LTR and another for RTL, or use a postprocessor like RTLCSS that rewrote every `left` to `right`. Both approaches doubled your CSS and invited inconsistency. The modern answer is **logical properties** — CSS properties that name their direction by content flow rather than by physical screen orientation.

### 1.2 Inline and block axes

CSS introduced two logical axes:

- **Inline axis** — the direction text runs along. In English or French, that is horizontal left-to-right. In Arabic, that is horizontal right-to-left. In vertical Japanese, that is vertical top-to-bottom.
- **Block axis** — perpendicular to the inline axis. In most Western scripts, block is vertical and inline is horizontal. In vertical Japanese, it is the other way around.

Each axis has a **start** and an **end**. For LTR English, `inline-start` is left, `inline-end` is right, `block-start` is top, `block-end` is bottom. For RTL Arabic, `inline-start` is right, `inline-end` is left, with block unchanged. You write `inline-start` once and the browser picks the correct physical side based on the element's writing mode.

### 1.3 The property translations

Every physical property has a logical equivalent:

| Physical | Logical |
|---|---|
| `margin-left` | `margin-inline-start` |
| `margin-right` | `margin-inline-end` |
| `margin-top` | `margin-block-start` |
| `margin-bottom` | `margin-block-end` |
| `margin: 0 auto` | `margin-inline: auto` |
| `padding-left/right` | `padding-inline-start/end` or shorthand `padding-inline` |
| `padding-top/bottom` | `padding-block-start/end` or shorthand `padding-block` |
| `border-left` | `border-inline-start` |
| `top` | `inset-block-start` |
| `right` | `inset-inline-end` (LTR) |
| `width` | `inline-size` |
| `height` | `block-size` |
| `text-align: left` | `text-align: start` |

Shorthand forms are common and more readable:

```css
padding-inline: var(--space-md);     /* left and right */
padding-block: var(--space-sm);      /* top and bottom */
margin-inline: auto;                  /* center horizontally */
inset-inline: 0;                      /* stretch to both horizontal edges */
```

### 1.4 Sizing logically too

`width` and `height` have logical counterparts: `inline-size` and `block-size`. In English they are the same as width and height. In vertical writing modes they swap. This matters for components that should stay the same shape regardless of the language context (e.g., an avatar that should always be square).

### 1.5 When physical still makes sense

Logical properties are the default in this course, with one honest exception: when you are styling something that is tied to the physical screen rather than to content flow. A "fixed footer" at the bottom of the viewport is physical bottom, not `block-end`. A drop shadow is physical. A `transform: translateX()` is physical. For those cases, physical properties are the correct choice because the intent is physical.

The rule of thumb: *if you would still want the thing to be on the same side of the screen in Arabic*, use physical. *If it should follow the content direction*, use logical. Ninety percent of the time, use logical.

### 1.6 Testing RTL without speaking Arabic

Add `dir="rtl"` to the `<html>` element of your page (or to a specific `<section>`) and watch what happens. Everything using logical properties flips. Everything using physical properties stays. Switch back and forth to find places you missed.




### The TypeScript angle

Logical properties have no direct TypeScript integration, but you can enforce their use with an ESLint/Stylelint rule that flags physical properties like `margin-left` and suggests `margin-inline-start`.

### Comparison: physical vs logical properties

| Physical | Logical | RTL behaviour |
|----------|---------|---------------|
| `margin-left` | `margin-inline-start` | Flips to right |
| `padding-right` | `padding-inline-end` | Flips to left |
| `width` | `inline-size` | Same (horizontal) |
| `text-align: left` | `text-align: start` | Flips to right |

> **In production sidebar.** On a 100K-daily-user fintech app expanding into Arabic-speaking markets, adopting logical properties reduced the RTL launch timeline from 3 months to 2 weeks. Of 200 components, 180 worked in RTL without any changes.

### Common interview question

**Q: What are CSS logical properties and why should you use them instead of physical properties?**

**Model answer:** Logical properties name directions by content flow (inline-start, block-end) instead of physical screen position (left, bottom). In English, inline-start is left; in Arabic, inline-start is right. Components using logical properties automatically flip for RTL layouts without CSS changes. Use physical properties only for things tied to the screen itself (fixed viewport elements, transforms, shadows).

## Going Deeper

**Official documentation:**
- [MDN: CSS logical properties](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_logical_properties_and_values)
- [web.dev: Logical properties](https://web.dev/articles/learn/css/logical-properties)
- [Svelte docs: Styling](https://svelte.dev/docs/svelte/styling)

**Advanced pattern:** Build a card component that works in LTR, RTL, and vertical writing mode (`writing-mode: vertical-rl`). Test all three by toggling `dir` and `writing-mode` on the parent.

**Challenge question:** (Combines Lessons 6.5, 6.4, and 6.3) Create a "direction toggle" demo page. Use logical properties for all layout, nesting for state variants, and tokens for all values. Add `dir="rtl"` and `dir="ltr"` buttons. Verify that everything flips correctly except the site logo (which should use physical positioning).

## Deep Dive

**Why this matters at scale.** In a product serving 30 countries, logical properties eliminate an entire class of RTL bugs. Switching to logical properties reduced one company's RTL bug count by 85% and eliminated 2,000 lines of override CSS.

**The mental model.** Content flows like water through a pipe. The inline axis is the flow direction; block is perpendicular. You never say 'left' — you say 'start.' The browser maps start to left in English, right in Arabic, top in vertical Japanese.

**Edge cases.** Float has no logical equivalent in all browsers yet. Transforms are always physical. Mixed-directionality content respects the element's own direction value, so logical properties nest correctly.

**Performance implications.** Zero performance cost. The browser resolves logical-to-physical mapping once during style computation. Eliminating duplicate LTR/RTL stylesheets halves CSS download size for international sites.

**Connection to other modules.** Module 6.1's PE7 tokens use logical properties. Module 8's layouts use inline-size and block-size. Module 12's accessibility benefits from logical properties matching content flow order.

## 2. Style it — A card that flips

The mini-build is a card with an avatar, text, and a "next" arrow, all laid out with logical properties. A toggle button switches the parent's `dir` attribute between `ltr` and `rtl`. The whole layout flips instantly; no rules change.

## 3. Interact — Flip it live

The JS concept is trivial — toggle a single attribute. The whole lesson is about the CSS. But watching the flip happen live is the moment the concept clicks.

## 4. Mini-build — Direction toggle

**File:** `src/routes/modules/06-styling/05-logical-properties/+page.svelte`

### DevTools verification

Inspect any element with `padding-inline: var(--space-md)`. In the Computed panel, look at `padding-left` and `padding-right` — they will both show the same value, derived from the logical shorthand. Toggle `dir="rtl"` on the parent and the border-inline-start and inline-end swap physical sides.

## 5. Check your understanding

<details>
<summary><strong>Q1.</strong> What is the difference between the inline axis and the block axis?</summary>

The inline axis is the direction text runs along; the block axis is perpendicular to it. In English these are horizontal and vertical; in vertical Japanese they are swapped.
</details>

<details>
<summary><strong>Q2.</strong> What is the logical equivalent of <code>margin-left</code>?</summary>

`margin-inline-start`.
</details>

<details>
<summary><strong>Q3.</strong> You want to horizontally centre a block. What is the logical way?</summary>

`margin-inline: auto`.
</details>

<details>
<summary><strong>Q4.</strong> When is it OK to use physical properties?</summary>

When the positioning is tied to the physical screen rather than content flow — for example, a fixed footer at the viewport bottom or a transform translateX. The rule: if you would still want the thing on the same side in Arabic, physical is correct.
</details>

<details>
<summary><strong>Q5.</strong> How do you test RTL without speaking the language?</summary>

Add `dir="rtl"` to an element (or `<html>`) and observe which rules flip and which do not. Anything that stays in place while you expected it to flip is still using physical properties.
</details>

## 6. Common mistakes

- **Mixing physical and logical in the same component.** Half the component flips, half doesn't. Stick to logical everywhere or nowhere.
- **Using `width` instead of `inline-size`.** Works in horizontal modes, behaves unexpectedly in vertical writing modes.
- **Using `text-align: left`.** Correct is `text-align: start`.
- **Assuming RTL users want exact visual mirroring.** Icons like arrows should flip; brand logos and numbers should not. Inspect each case.

## 7. What's next

Lesson 6.6 introduces responsive layout with CSS Grid — `auto-fill`, `auto-fit`, and `minmax` — the three patterns that cover 90% of real grids.
