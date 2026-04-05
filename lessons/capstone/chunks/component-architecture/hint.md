---
chunk: component-architecture
level: 1
penalty: 0
---

# Component Architecture — Level 1 Hint (free)

Start with the smallest component, not the biggest. `Button` is the smallest thing that has variants, so nailing its prop shape teaches you the pattern you will reuse in every other component.

Think about three questions before you type a line of code:

1. Which props are **data** (strings, numbers) and which are **UI slots** (snippets)?
2. Which props have **sensible defaults** and which must be **required**?
3. Which props need **two-way binding** (`$bindable`) and which are strictly parent → child?

In Svelte 5, the `children` prop is no longer a slot — it is a snippet you render with `{@render children()}`. Every component that contains text or other components accepts `children`. For `Input`, you do not need a children snippet; for `Button`, you do. For `PageShell`, absolutely.

Touch targets: 44 px minimum is non-negotiable. If a button feels smaller than that, add vertical padding until `block-size` meets the bar. Same rule for every interactive element in your component library — this chunk establishes the habit.
