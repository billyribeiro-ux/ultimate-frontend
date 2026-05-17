---
module: 3
lesson: 3.9
title: CSS custom properties as the bridge (component variant systems)
duration: 50 minutes
prerequisites:
  - Lesson 3.8 (component composition)
  - Module 1.5 (PE7 token system)
learning_objectives:
  - Explain why scoped CSS prevents a parent from directly changing a child's styles
  - Use CSS custom properties as the sanctioned channel between parent and child styles
  - Design a component with an internal "knob" variable that external rules can retune
  - Build a variant system where each variant remaps a small number of custom properties
  - Override a component's look from a parent without editing the component file
status: ready
---

# Lesson 3.9 — CSS custom properties as the bridge

## 1. Concept — Scoped CSS works, and therefore a parent cannot style a child directly

### 1.1 The problem: the `Button` is green and you need a red one

You built a `Button` component. It is carefully styled with scoped CSS, PE7 tokens, focus rings, hover states. A page now needs a destructive variant — same layout, same size, same behaviour, just red. You try the obvious thing: add a class on the parent and target the button's internal class from outside.

```svelte
<div class="danger">
    <Button>Delete</Button>
</div>
```

```css
/* parent.css */
.danger .btn { background: var(--color-error); }
```

It does not work. Open DevTools and you see why: Svelte compiled the inner class as `.btn.svelte-abc123`, and your `.danger .btn` selector does not match it. Scoping worked exactly as promised — and it blocks you exactly where you wanted to reach in.

You could escape scoping with `:global(.btn)`, but now you have given up the guarantee that button styles stay inside the button file. The next time somebody adds a different `.btn` class anywhere in the app, your "danger" selector will hit it unexpectedly. `:global()` is a nuclear option. We need a scalpel.

### 1.2 The scalpel: CSS custom properties

CSS custom properties — variables whose names start with `--` — cross the scoping boundary freely. A child can *read* any custom property defined on any ancestor, because custom properties follow the normal cascade. They are not subject to Svelte's scoping hash. This asymmetry is exactly what we want: the child's class names stay private, but its colours and sizes become negotiable.

The technique is a convention the component author sets up: expose a small number of **knob variables** inside the component, with sensible defaults. Any parent can retune them by setting the same variable on an ancestor element.

```svelte
<!-- Button.svelte -->
<style>
    .btn {
        background: var(--btn-bg, var(--color-brand));
        color: var(--btn-fg, oklch(99% 0 0));
    }
</style>
```

```svelte
<!-- Parent -->
<div class="danger-zone">
    <Button>Delete</Button>
</div>

<style>
    .danger-zone {
        --btn-bg: var(--color-error);
    }
</style>
```

The button reads `--btn-bg`. The parent sets `--btn-bg` on an ancestor. Cascade does the rest. The button's private class names never leave the file, the parent never escapes scoping, and the "danger zone" can restyle every button inside it with one line.

### 1.3 Why this is the cleanest pattern in any framework

Most frameworks solve this problem with props — `<Button color="red">` — or with special prop-forwarding systems. Those work but they bind the customisation surface to what the component author *thought of in advance*. CSS custom properties take a different approach: the component declares "these knobs exist", but *any* ancestor — the parent, the grand-parent, the route, the `<body>`, even the `:root` — can retune them from anywhere in the cascade. And because custom properties respect specificity and media queries, you can scope your overrides by breakpoint, theme, section, or element-level `style` attribute without the component ever being aware.

It is also how every modern CSS framework (OpenProps, CSS Zero, even Tailwind v4) layers tokens on top of components. Learn this pattern once and it appears everywhere.

### 1.4 Designing a knob

Three rules for a good custom-property knob:

1. **Name it after the component, not the theme.** `--btn-bg`, not `--brand-bg`. The knob belongs to the button; the theme is what fills it in.
2. **Give it a default inside the component.** `var(--btn-bg, var(--color-brand))`. Without a fallback, a forgetful caller leaves the button unstyled.
3. **Keep the knob count small.** Three to five knobs per component is plenty. If you find yourself exposing ten, the component is probably trying to be a design system on its own.

### 1.5 Variants as knob presets

Your existing `Button` already uses this pattern for variants: `.btn--outline` remaps `--btn-bg`, `--btn-fg`, and `--btn-bg-hover` to produce the outline look. Each variant is a named preset of knob values. This is why a well-designed variant system adds a new look in about five lines: you add a class, you remap the three knobs, the existing `.btn` rule picks them up.

### 1.6 Where this pattern will take you next

In Module 6 you will see how PE7 uses this same mechanism at the page level for "per-page colour personalities" — a route sets `--color-brand` on its own `<section>`, and every component inside picks it up. The mechanism is identical to what you are learning now; the scope is broader. Learning the knob pattern in Module 3 at the component level sets you up for Module 6's route-level patterns, Module 7's GSAP-driven dynamic knobs, and Module 11's theme switchers.

## Deep Dive

**Why this matters at scale.** In a 50-component design system, every component needs to be re-skinnable without forking. A Button used in a "danger zone" needs red tones. The same Button in a "success flow" needs green. Without custom-property knobs, you either add a `color` prop for every possible override (bloating the API) or you escape scoping with `:global()` (breaking encapsulation). Custom properties are the only mechanism that preserves encapsulation, follows the cascade, and requires zero JavaScript. At enterprise scale with hundreds of pages and dozens of theme contexts, this pattern is the only one that remains maintainable.

**The mental model.** Think of CSS custom properties as exposed API ports on a sealed device. The component is a sealed box — you cannot open it and rewire its internals (scoped CSS prevents that). But the box has labelled ports on the outside (`--btn-bg`, `--btn-radius`, `--btn-shadow`). You plug values into those ports from the outside, and the internals read them. If you do not plug anything in, the box uses its own defaults. This is exactly the Open/Closed Principle from software engineering: the component is closed for modification (you cannot edit its CSS from outside) but open for extension (you can tune its knobs from any ancestor).

**Edge cases.** A common pitfall: custom properties are inherited, which means setting `--btn-bg` on a parent affects *all* descendant buttons, not just direct children. If you set `--btn-bg: red` on a page wrapper, every button on that page turns red — even ones nested inside other components. To scope the override precisely, set it on the closest wrapper element. Another edge case: custom properties with fallbacks (`var(--btn-bg, var(--color-brand))`) evaluate at computed-value time. If `--btn-bg` is set to `initial`, it does *not* trigger the fallback — `initial` is a valid value. Use an empty string check pattern or avoid setting `initial`. A third subtlety: custom properties cannot be animated with CSS transitions (except with `@property` registration and browser support). If you need animated colour transitions between variants, use `transition` on the property that reads the variable, not on the variable itself.

**Performance implications.** CSS custom properties are resolved by the browser's style engine during the cascade computation — there is no JavaScript involved. Setting a custom property on an ancestor and having 100 descendants read it costs essentially nothing beyond what the cascade already does. The performance advantage over prop-driven styling is significant: prop-driven styles require JavaScript to run on every state change, trigger component re-renders, and produce inline style attributes. Custom-property-driven styles require only a single DOM style mutation on the ancestor, and the browser's native cascade propagates the change to all descendants without any JavaScript re-execution.

**Cross-module connections.** This lesson's pattern is the bridge between PE7's global token system (Module 1) and component-level customisation. Module 6 uses custom properties for per-page colour personalities. Module 7 passes GSAP animation values into CSS via custom properties for hybrid CSS/JS animations. Module 9 and 13 use them for dynamic theming based on page data. The principle "components expose knobs, parents tune them" is the CSS equivalent of "components expose props, parents pass them" — two parallel API surfaces, one for data and one for style.

### 1.7 Common interview question

**Q: "How do CSS custom properties cross Svelte's scoping boundary, and why is this the preferred way to style a child component from a parent?"**

**Model answer:** Svelte's scoping adds a hash suffix to class selectors, preventing a parent's `.btn` from matching a child's `.btn`. But CSS custom properties (variables starting with `--`) are not class selectors — they follow the normal CSS cascade. A parent can set `--btn-bg: red` on any ancestor element, and the child's `.btn { background: var(--btn-bg, var(--color-brand)) }` reads it through the cascade. The parent never touches the child's internal class names or markup. This preserves encapsulation: the child's structure stays private, but its *appearance* is negotiable through published knobs. The alternative — using `:global()` to target the child's internal classes — breaks encapsulation and creates fragile cross-file dependencies that break when the child renames its classes.

## Going Deeper

**Official docs to read next:**

- [svelte.dev/docs/svelte/styling](https://svelte.dev/docs/svelte/styling) — how custom properties work with scoped styles.
- [svelte.dev/docs/svelte/component-directives](https://svelte.dev/docs/svelte/component-directives) — the `--style-props` syntax for passing custom properties to components.
- [developer.mozilla.org/en-US/docs/Web/CSS/Using_CSS_custom_properties](https://developer.mozilla.org/en-US/docs/Web/CSS/Using_CSS_custom_properties) — the MDN guide to custom properties.

**Advanced pattern: the `--style-props` shorthand.** Svelte provides a shorthand for setting custom properties on component instances:

```svelte
<Button --btn-bg="red" --btn-fg="white">Delete</Button>
```

This compiles to wrapping the component in a `<div style="display: contents; --btn-bg: red; --btn-fg: white;">`. The `display: contents` ensures the wrapper does not affect layout. The custom properties cascade into the component's internal styles. This syntax is cleaner than wrapping the component in a styled `<div>`.

**Challenge question (combines Lesson 3.9 + Lesson 1.5 + Lesson 3.8):** A `Button` component exposes three knobs: `--btn-bg`, `--btn-fg`, `--btn-radius`. A `PrimaryButton` wrapper hardcodes `--btn-bg` and `--btn-fg`. A page sets `--btn-radius` on a parent section. Trace the cascade: which custom property values does the final rendered button use? What happens if a parent also sets `--btn-bg` on the section — does the PrimaryButton's hardcoded value or the section's value win?

## 2. Style it — A single component, four danger zones

The mini-build renders the same `Button` four times inside four wrapper divs. Each wrapper sets `--btn-bg`, `--btn-fg`, and `--btn-bg-hover` to a different OKLCH-derived set. The button file is never touched. Every preset is three lines of CSS.

## 3. Interact — Try it wrong first

Write the override using a `:global(.btn)` rule from the parent. Note the warning it produces. Now rewrite it using the knob approach: one `--btn-bg` remap on the wrapper. Compare the DevTools Elements panel: with `:global` you can see the cross-file style attached to the compiled class, which is exactly the kind of leak scoping exists to prevent. With the knob approach, the button's class rules remain untouched; only the custom property cascade changes.

## 4. Mini-build — Four themed button zones

### Files

- `src/routes/modules/03-components/09-css-variables-bridge/+page.svelte`
- (`Button.svelte` already exposes `--btn-bg`, `--btn-fg`, `--btn-bg-hover` from Module 3's earlier lessons)

### Key excerpt

```svelte
<div class="zone zone--danger">
    <Button>Delete</Button>
</div>
<div class="zone zone--success">
    <Button>Publish</Button>
</div>

<style>
    .zone--danger {
        --btn-bg: var(--color-error);
        --btn-fg: oklch(99% 0 0);
        --btn-bg-hover: oklch(from var(--color-error) 45% c h);
    }
    .zone--success {
        --btn-bg: var(--color-success);
        --btn-fg: oklch(15% 0.02 145);
        --btn-bg-hover: oklch(from var(--color-success) 55% c h);
    }
</style>
```

### DevTools verification

1. Inspect the "Delete" button. In the Styles panel, find the `--btn-bg` line on the `.zone--danger` element. Click it. DevTools shows the computed value cascading into the `.btn` rule inside `Button.svelte`. That chain — ancestor declares, descendant reads — is the whole trick.
2. Remove the `--btn-bg` declaration from the `.zone--danger` rule live in DevTools. The button snaps back to its default `--color-brand` — proof that the fallback in `var(--btn-bg, var(--color-brand))` kicks in.

## 5. Check your understanding

<details>
<summary><strong>Q1.</strong> Why can't a parent directly target a child's internal class with a normal CSS rule?</summary>

Because Svelte adds a hash to every selector inside a component's scoped `<style>` block. The parent's un-hashed selector never matches the child's hashed class, so the rule has no effect. This is scoping working correctly.
</details>

<details>
<summary><strong>Q2.</strong> Why do CSS custom properties cross the scoping boundary?</summary>

Custom properties are part of the cascade, not the scoped class system. A child reads any `--var` declared on any ancestor. Svelte's hash applies to class names, not to variable lookups.
</details>

<details>
<summary><strong>Q3.</strong> What is the purpose of a fallback value in `var(--btn-bg, var(--color-brand))`?</summary>

It guarantees the component has a usable style even when no parent sets the knob. Without the fallback, an unstyled button would render when no override is supplied.
</details>

<details>
<summary><strong>Q4.</strong> Why name the knob `--btn-bg` instead of `--brand-bg`?</summary>

The knob belongs to the component — it is the button's private surface for receiving a colour. The *theme* is what fills the knob in. Naming by component keeps every component's knobs independent.
</details>

<details>
<summary><strong>Q5.</strong> What is wrong with using `:global(.btn)` from a parent to override a component's look?</summary>

`:global` escapes scoping entirely. Your override will now match *every* `.btn` class in the entire project, including ones you did not mean to touch. The knob pattern is local, explicit, and safe.
</details>

## 6. Common mistakes

- **Omitting the fallback inside the component.** `var(--btn-bg)` without a second argument evaluates to nothing when no parent has set it, giving you an unstyled element.
- **Using `:global(.btn)` from a parent.** Works today, breaks tomorrow. Never reach into another component's scoped class names.
- **Exposing too many knobs.** If your button has fifteen custom properties, it is not a button any more, it is a styling API. Pick three to five high-value knobs.
- **Naming knobs after themes.** `--primary-color` is a theme-level name; on a button it should be `--btn-bg`. Theme tokens are inputs to knobs, not the knobs themselves.

## 7. What's next

Lesson 3.10 adds container queries — the CSS feature that lets a component respond to its *own* size rather than the viewport, which is the final piece of a truly reusable UI library.
