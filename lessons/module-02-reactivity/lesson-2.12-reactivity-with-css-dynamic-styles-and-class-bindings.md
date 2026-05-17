---
module: 2
lesson: 2.12
title: Reactivity with CSS — dynamic styles and class bindings
duration: 40 minutes
prerequisites:
  - Lesson 2.2 — $state primitives
  - Lesson 1.9 — Template expressions, class: and style: directives
learning_objectives:
  - Bind a class conditionally using class:name={expr}
  - Bind an inline style property using style:property={value}
  - Bind a CSS custom property using style:--name={value}
  - Compose multiple class bindings with data attributes for more expressive state
  - Keep PE7 tokens as the single source of truth while reactive state drives the values
status: ready
---

# Lesson 2.12 — Reactivity with CSS: dynamic styles and class bindings

## 1. Concept — Letting data drive appearance

### 1.1 The problem: visual state must follow data state

So far in Module 2 you have learned how to hold reactive values in `$state`, derive from them with `$derived`, and react to them with `$effect`. The next step is to make the UI *visually* follow the data. When `count >= 10`, the card turns green. When `isDragging` is true, the element lifts on a shadow. When `temperature` rises, the progress bar's colour shifts from blue to red. These are not special cases; they are the entire reason state exists.

Svelte gives you three compact directives for making CSS react to state: `class:name={expr}`, `style:property={value}`, and `style:--variable={value}`. All three were introduced in Lesson 1.9 for static values. This lesson connects them to reactive state.

### 1.2 `class:` — conditional classes

```svelte
<article class="card" class:card--hot={temperature > 30} class:card--cold={temperature < 10}>
```

`card--hot` is added when `temperature > 30`; `card--cold` is added when `temperature < 10`; both disappear when the temperature is in between. The classes are just names — you still define them in your `<style>` block. Svelte handles the add/remove dance as state changes.

Multiple `class:` directives on the same element compose naturally. You can also use the shorthand `class:isOpen` (equivalent to `class:isOpen={isOpen}`) when the class name matches the variable name.

### 1.3 `style:` — direct inline style properties

```svelte
<article style:background-color={bgColor} style:transform={`rotate(${angle}deg)`}>
```

Sets the inline `background-color` to whatever `bgColor` is, and the `transform` to a rotation based on `angle`. When either value changes, Svelte updates the inline style property on that element in place.

Use `style:` when you need to set a single property dynamically and you do not want to write a class for every possible value. For a temperature slider where the hue is a continuous function of the value, `style:` is the right tool. For a two-state toggle, a class is cleaner.

### 1.4 `style:--variable` — CSS custom property as the bridge

The most powerful of the three. Reactive state sets a CSS custom property on the element, and scoped `<style>` rules read it:

```svelte
<article style:--progress={progressValue}>
    <!-- inside the style block: -->
    <!-- .bar { width: calc(var(--progress) * 1%); } -->
</article>
```

You can drive gradients, filter values, transform components, and complex computed styles without ever writing inline property-per-property code. This is the canonical bridge between PE7 tokens (which live in CSS) and reactive state (which lives in TypeScript). Every per-page colour personality in Module 1 used the static form of this pattern; now you can drive the custom property from state that changes at runtime.

### 1.5 When to reach for which directive

| Situation | Directive |
| --- | --- |
| Two or three discrete visual states | `class:` |
| One continuous CSS property driven by a number | `style:` |
| Complex styling that reads the value in multiple places | `style:--` |
| Set multiple properties from one boolean | `class:` (hook into a class's rules) |
| Animation input from reactive state | `style:--` driving a `calc()`-based rule |

If in doubt, prefer classes — they keep the CSS cohesive in the `<style>` block. Only drop to `style:` when a class cannot express the continuous case.

## Deep Dive

**Why this matters at scale.** In a 50-component production app, virtually every component has some visual state: active tabs, selected rows, loading indicators, progress bars, theme variants. If the team lacks a clear convention for how data drives appearance, you end up with three incompatible patterns in the same codebase: string-concatenated classes, inline style objects, and imperative DOM manipulation. Svelte's three directives (`class:`, `style:`, `style:--`) provide exactly three tools for three distinct situations, eliminating the decision fatigue and producing consistent, reviewable code.

**The mental model.** Think of your component as having two parallel layers: the *data layer* (reactive state and derived values in the script) and the *visual layer* (CSS rules in the style block). The three directives are *wires* connecting these layers. `class:` is a binary switch — it connects a boolean to a class. `style:` is a direct pipe — it connects a value to a single CSS property. `style:--` is a broadcast channel — it publishes a value that any number of CSS rules can tune into via `var(--name)`. Choosing the right wire depends on how many CSS rules need the value and whether the value is discrete or continuous.

**Edge cases.** A common surprise: `class:active` (shorthand) only works when the variable in scope is named *exactly* `active`. If your state is named `isActive`, you must use the full form `class:active={isActive}`. Another edge case: `style:` directives set inline styles, which have the highest specificity. If you also have a class-based rule setting the same property, the inline `style:` always wins — even if the class rule has `!important` in some cases (though `!important` on a stylesheet rule does beat inline). This can create confusing specificity fights. Prefer `class:` for properties that your style block already manages. A third edge case: setting `style:--custom={undefined}` does not remove the custom property — it sets it to the string "undefined". Use an empty string or a fallback in your CSS `var(--custom, fallback)`.

**Performance implications.** All three directives compile to direct DOM property updates — `element.classList.toggle()`, `element.style.setProperty()`. These are single DOM API calls with no virtual DOM overhead, no diffing, no reconciliation. Svelte batches multiple directive updates on the same element into a single microtask, so even a component with ten class bindings and five style bindings performs only one reflow. The cost is proportional to the number of *changed* bindings, not the total number of bindings. For animations driven by `$state` (like a draggable element updating `style:transform` on every mousemove), the update path is fast enough to hit 60fps without requestAnimationFrame because Svelte's signal notification is synchronous.

**Cross-module connections.** These directives are the bridge between every module that produces state and every module that produces visual output. Module 6 uses `class:` extensively for transition states. Module 7 pairs `style:--` with GSAP to pass animation progress from the JavaScript runtime into CSS for hybrid animations. Module 9 uses `class:` for loading/error/success states driven by load function results. Module 13 uses `style:--` for per-page colour personalities that enhance SEO through visual distinctiveness. Mastering the three directives here means you will never fight CSS-in-JS again.

## 2. Style it — A thermometer

The mini-build is a thermometer. The user drags a slider from 0 to 40 °C. Three visual effects follow the value:

1. `class:` adds `thermo--cold`, `thermo--warm`, or `thermo--hot` based on bucket ranges.
2. `style:--fill` sets the fill percentage (`calc(var(--fill) * 1%)` in CSS).
3. `style:--hue` sets the OKLCH hue so the fill gradient shifts smoothly from blue to red.

All three bindings run from a single `temperature` state.

## 3. Interact — One state, three views

```ts
let temperature: number = $state(20);

const fillPercent: number = $derived(Math.min(100, Math.max(0, (temperature / 40) * 100)));
const hue: number = $derived(240 - (temperature / 40) * 240); // 240 = blue, 0 = red
```

In the markup:

```svelte
<article
    class="thermo"
    class:thermo--cold={temperature < 10}
    class:thermo--warm={temperature >= 10 && temperature < 30}
    class:thermo--hot={temperature >= 30}
    style:--fill={fillPercent}
    style:--hue={hue}
>
```

## 4. Mini-build — Reactive thermometer

**File:** `src/routes/modules/02-reactivity/12-reactive-css/+page.svelte`

### DevTools verification

1. Drag the slider. Inspect the thermometer element in DevTools.
2. Observe the `class` attribute toggling between `thermo--cold`, `thermo--warm`, `thermo--hot`.
3. Observe the `style` attribute carrying `--fill` and `--hue` values that update live.

## 5. Check your understanding

<details>
<summary><strong>Q1.</strong> When would you prefer a <code>class:</code> binding over a <code>style:</code> binding?</summary>

When the visual change is a discrete state (on/off, three tiers, success/error) that corresponds to a set of CSS rules you can write once. Classes keep the styling in the `<style>` block and are easier to theme.
</details>

<details>
<summary><strong>Q2.</strong> Why is <code>style:--variable</code> the best choice for gradient or filter values driven by state?</summary>

Because the custom property can be referenced inside complex CSS expressions (gradients, `calc()`, `filter` chains) that a single inline property cannot express. The style block reads the variable, and the state block updates it.
</details>

<details>
<summary><strong>Q3.</strong> Can you put multiple <code>class:</code> directives on the same element?</summary>

Yes. Each one evaluates independently, and they compose naturally. Svelte adds or removes each class based on its own boolean.
</details>

<details>
<summary><strong>Q4.</strong> How do you avoid fighting PE7's token system when using dynamic styles?</summary>

Keep the tokens in CSS (`--color-brand`, `--space-lg`) and let reactive state drive *a different set* of custom properties (`--fill`, `--hue`). The component's scoped CSS reads both and combines them. Never overwrite PE7 tokens from reactive state.
</details>

<details>
<summary><strong>Q5.</strong> If <code>isOpen</code> is a boolean state, what is the shorthand for <code>class:isOpen={isOpen}</code>?</summary>

`class:isOpen`. Svelte matches the class name to the variable in scope automatically.
</details>

## 6. Common mistakes

- **Generating class strings by hand.** `class="card {status}"` works but the directive form `class:hot={status === 'hot'}` is cleaner and safer.
- **Overwriting PE7 tokens from reactive state.** Use your own custom property names (`--fill`, `--progress`) rather than writing over `--color-brand`.
- **Putting computation in the directive.** `style:--hue={computeHueFrom(temperature)}` runs on every render. Put the computation in a `$derived` and reference the derived value in the directive.
- **Forgetting that `style:` sets inline styles.** Specificity is high. If another rule in the style block sets the same property, the inline style wins. Use classes when you want CSS to own the value.

## 7. What's next

Lesson 2.13 closes Module 2 with the TypeScript patterns for typing reactive state — generic helpers, utility types, and how to keep strict mode green as your state grows.
