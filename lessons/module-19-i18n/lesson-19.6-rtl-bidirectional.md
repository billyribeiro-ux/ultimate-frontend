---
module: 19
lesson: 19.6
title: RTL and bidirectional text
duration: 55 minutes
prerequisites:
  - "19.4 — Locale routing strategies"
  - "6.5 — Logical properties"
  - "CSS Grid and Flexbox fundamentals"
learning_objectives:
  - Apply dir="rtl" at the correct level (html or layout container) and explain how it affects layout and text
  - Convert physical CSS properties (left, right, margin-left) to logical properties (inline-start, inline-end, margin-inline-start)
  - Handle bidirectional text (LTR content embedded in RTL context) using the Unicode bidi algorithm and the bdi element
  - Test RTL layouts by toggling direction without switching locale in DevTools
  - Build a card layout that renders correctly in both LTR and RTL without duplicate CSS
status: ready
---

# Lesson 19.6 — RTL and bidirectional text

> **Atomic lesson format** — every lesson in this course follows the same four parts: **Concept**, **Style it**, **Interact**, **Mini-build**.

## 1. Concept — When the entire world flips

### 1.1 The problem: your layout assumes left-to-right

You build a navigation sidebar on the left side of the screen. The search icon sits to the left of the search input. Breadcrumbs flow left to right with `>` separators. A progress bar fills from left to right. All of this is correct for English, French, German, and most of the world's languages. Then you add Arabic, Hebrew, or Urdu support, and everything is backwards.

Right-to-left (RTL) languages do not just reverse text direction. They reverse the entire visual flow. A sidebar that was on the left moves to the right. Icons that were on the left side of inputs move to the right. Progress bars fill from right to left. Breadcrumbs flow right to left. If your CSS uses `margin-left`, `padding-right`, `text-align: left`, or `float: left`, every single one must be mirrored.

### 1.2 How logical properties solve it

CSS logical properties replace physical direction words (left, right, top, bottom) with flow-relative words (inline-start, inline-end, block-start, block-end). When the document direction is LTR, `inline-start` equals left. When the direction is RTL, `inline-start` equals right. The same CSS works in both directions without any changes.

The mapping:

| Physical property | Logical property |
|---|---|
| `margin-left` | `margin-inline-start` |
| `margin-right` | `margin-inline-end` |
| `padding-left` | `padding-inline-start` |
| `padding-right` | `padding-inline-end` |
| `text-align: left` | `text-align: start` |
| `text-align: right` | `text-align: end` |
| `left: 0` | `inset-inline-start: 0` |
| `right: 0` | `inset-inline-end: 0` |
| `border-left` | `border-inline-start` |
| `width` | `inline-size` |
| `height` | `block-size` |

If you have followed PE7 since Module 1, your styles already use logical properties. This lesson ensures you understand the full scope and handle the edge cases.

### 1.3 The dir attribute

The `dir` attribute tells the browser which direction text flows. It can appear on any element, but the most common placement is on `<html>`:

```html
<html lang="ar" dir="rtl">
```

Setting `dir="rtl"` on `<html>` flips the entire page. All logical properties, all flex and grid layouts (which respect direction by default), and all text alignment reverse. You can also set `dir` on individual elements to create LTR islands within an RTL page:

```html
<div dir="rtl">
  <p>هذا نص عربي</p>
  <code dir="ltr">const x = 42;</code>
</div>
```

The `<code>` block renders left-to-right because code is always LTR, regardless of the page language.

### 1.4 Bidirectional text and the bdi element

**Bidirectional (bidi) text** occurs when LTR and RTL scripts appear in the same line. This is common in real applications: an Arabic user's timeline might show "أحب الفيلم Spider-Man: No Way Home" — Arabic text surrounding an English movie title.

The Unicode Bidirectional Algorithm (UBA) handles most of these cases automatically. But it can fail when a neutral character (like a colon or parenthesis) sits between RTL and LTR text. The browser might assign it to the wrong direction, producing garbled output.

The `<bdi>` (Bidirectional Isolate) element solves this by isolating a span of text from its surrounding directional context:

```html
<p>المستخدم <bdi>{username}</bdi> أرسل رسالة</p>
```

Without `<bdi>`, a username like "user123:" might have its colon pulled into the RTL flow, appearing on the wrong side. With `<bdi>`, the username is treated as a self-contained directional unit.

### 1.5 Flexbox and Grid in RTL

CSS Flexbox and Grid respect the `direction` property by default. A `flex-direction: row` container lays out items from inline-start to inline-end. In LTR that is left to right; in RTL it is right to left. You do not need separate RTL styles for flex layouts.

However, `flex-direction: row-reverse` in RTL produces a left-to-right layout (it reverses the already-reversed direction). This is almost never what you want. Avoid `row-reverse` and `column-reverse` in multilingual applications.

Grid's `grid-template-columns` also respects direction. Columns defined as `200px 1fr` place the 200px column on the inline-start side — left in LTR, right in RTL. Grid areas defined with `grid-template-areas` also reverse.

### Deep Dive — Testing RTL without switching locale and handling edge cases

You do not need Arabic translations to test RTL layout. Open DevTools, select the `<html>` element, and add `dir="rtl"`. The entire page flips. This is the fastest way to verify your layout handles RTL correctly.

Common edge cases to test:

**Icons with directional meaning.** A forward arrow (`→`) should flip in RTL to point left. An arrow indicating "next" points inline-end. Use CSS `transform: scaleX(-1)` conditioned on `[dir="rtl"]`, or use icons that work in both directions (like a chevron that you rotate with CSS logical transforms).

**Scrollbars.** Horizontal scrollbars appear on the left side of the container in RTL. This is automatic in modern browsers but can surprise developers during testing.

**Absolute positioning.** `position: absolute; left: 0` does not flip in RTL because `left` is a physical property. Replace with `inset-inline-start: 0`. This is the single most common RTL bug in existing codebases.

**Background gradients.** `linear-gradient(to right, ...)` does not flip. Use `linear-gradient(to inline-end, ...)` — but note this is not yet supported in all browsers. The workaround is `[dir="rtl"] & { background: linear-gradient(to left, ...); }`.

**Border-radius.** `border-radius: 8px 0 0 8px` (round left corners) must become `border-radius: 0 8px 8px 0` in RTL. The logical equivalent is `border-start-start-radius: 8px; border-end-start-radius: 8px;` which respects direction automatically.

**Box shadows.** A shadow offset of `4px 0` casts a shadow to the right. In RTL, it should cast to the left. There is no logical equivalent for box-shadow — you must use a `[dir="rtl"]` selector to negate the horizontal offset.

For testing, use the pseudo-locale trick: create a "mirror" locale that loads English text but sets `dir="rtl"`. This lets you verify layout without needing translations. The text will be grammatically wrong (English in RTL) but the layout will reveal every physical-property bug.

## 2. Style it — PE7 applied to the RTL toggle mini-build

The mini-build is a card layout that the student can toggle between LTR and RTL. All styles use logical properties from PE7 tokens: `var(--space-md)` for `padding-inline`, `var(--radius-lg)` for border-radius. The card has an icon on the inline-start side, text content, and an action button on the inline-end side. In RTL mode, the entire card mirrors without any style changes because every property is logical.

The direction toggle uses `var(--color-brand)` for the active state button. The LTR/RTL indicator uses `var(--text-xs)` with `var(--color-text-muted)`.

## 3. Interact — building a direction-aware card layout

The problem: proving that logical properties eliminate the need for separate RTL styles.

```typescript
let direction: 'ltr' | 'rtl' = $state('ltr');

function toggleDirection(): void {
  direction = direction === 'ltr' ? 'rtl' : 'ltr';
}

interface CardItem {
  id: string;
  title: string;
  description: string;
  icon: string;
}

let cards: CardItem[] = $state([
  { id: '1', title: 'Dashboard', description: 'View your analytics and metrics', icon: '📊' },
  { id: '2', title: 'Settings', description: 'Configure your preferences', icon: '⚙️' },
  { id: '3', title: 'Messages', description: 'Read and send messages', icon: '💬' }
]);
```

The card layout is styled entirely with logical properties. Toggling `direction` causes the same CSS to produce a mirrored layout.

## 4. Mini-build — RTL toggle card layout

**File path:** `src/routes/modules/19-i18n/06-rtl-bidirectional/+page.svelte`

A card list with an LTR/RTL toggle. Each card has an icon on the inline-start side, text content in the middle, and an arrow icon on the inline-end side. Toggling direction flips the entire layout. Arabic sample text is included to show real bidirectional content.

**DevTools moment:** Inspect a card in RTL mode. Open the Computed styles panel and search for "margin." Verify that only logical properties appear (margin-inline-start, margin-inline-end) — no physical left/right. Then toggle `dir` on the `<html>` element directly in the Elements panel and watch the layout flip without any JavaScript running.

## 5. Check your understanding — 5 questions

<details>
<summary><strong>Q1.</strong> Why are CSS logical properties essential for RTL support?</summary>

Physical properties like `margin-left` always refer to the left side of the element, regardless of text direction. In RTL, what was visually "left" should become "right." Logical properties like `margin-inline-start` automatically adapt to the current direction — inline-start is left in LTR and right in RTL. Without logical properties, you need separate CSS for each direction, doubling maintenance.
</details>

<details>
<summary><strong>Q2.</strong> What is the <bdi> element and when do you need it?</summary>

The `<bdi>` (Bidirectional Isolate) element isolates a span of text from its surrounding directional context. You need it when inserting user-generated content or dynamic values into text with a different direction — for example, an English username in an Arabic sentence. Without `<bdi>`, neutral characters like colons and parentheses may be assigned to the wrong direction, producing garbled output.
</details>

<details>
<summary><strong>Q3.</strong> Does Flexbox automatically reverse in RTL, and if so, are there any exceptions?</summary>

Yes, `flex-direction: row` reverses in RTL — items flow from right to left. The exception is `row-reverse`, which reverses the already-reversed direction, producing left-to-right in RTL. This double reversal is almost never the desired behavior. Avoid `row-reverse` and `column-reverse` in multilingual applications.
</details>

<details>
<summary><strong>Q4.</strong> How can you test RTL layout without having Arabic translations?</summary>

Open DevTools, select the `<html>` element, and add `dir="rtl"`. The entire layout flips using existing English text. This reveals any physical-property bugs (elements stuck on the left side, wrong icon positions, misaligned absolute elements) without requiring translations. You can also create a "mirror" pseudo-locale that loads English text but sets `dir="rtl"`.
</details>

<details>
<summary><strong>Q5.</strong> Why does `position: absolute; left: 0` not flip in RTL, and what is the fix?</summary>

Because `left` is a physical CSS property — it always means the left side of the containing block, regardless of text direction. The fix is to replace `left: 0` with `inset-inline-start: 0`, which maps to "left" in LTR and "right" in RTL. This is the single most common RTL bug in existing codebases because developers use `left`/`right` for positioning without considering direction.
</details>

## 6. Common mistakes — 4 pitfalls

1. **Using physical properties for absolute positioning.** `left`, `right`, `top`, `bottom` do not flip in RTL. Always use `inset-inline-start`, `inset-inline-end`, `inset-block-start`, `inset-block-end`.

2. **Forgetting to flip directional icons.** A "forward" arrow should point inline-end. Use CSS `transform: scaleX(-1)` with a `[dir="rtl"]` selector, or use bidirectional icons from a library that supports RTL.

3. **Mixing physical and logical properties.** Using `padding-inline-start: 1rem; padding-right: 1rem` on the same element produces inconsistent behavior. Audit your styles for physical property remnants when adding RTL support.

4. **Setting dir on every element.** Setting `dir="rtl"` on the `<html>` element is sufficient for the entire page. Adding it to individual elements creates unnecessary complexity and can conflict with the page direction. Only use per-element `dir` for intentional LTR islands (like code blocks) within an RTL page.

## 7. What's next — one sentence

Next, you will master pluralization rules and grammatical gender handling using ICU MessageFormat's full plural and select syntax across multiple languages.
