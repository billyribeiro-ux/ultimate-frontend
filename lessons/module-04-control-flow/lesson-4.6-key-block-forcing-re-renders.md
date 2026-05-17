---
module: 4
lesson: 4.6
title: "{#key} — forcing a subtree to rebuild"
duration: 35 minutes
prerequisites:
  - Lesson 4.4 (keys on {#each})
  - Module 2.9 ($effect)
learning_objectives:
  - Explain why Svelte reuses DOM nodes by default and when that reuse is wrong
  - Use `{#key expr}…{/key}` to force a subtree to unmount and remount when `expr` changes
  - Apply `{#key}` to reset a CSS animation, unmount a component with stale state, or rerun an $effect
  - Distinguish the `{#key}` block from the `(expression)` key on `{#each}` — they do different things
  - Recognise when `{#key}` is a code smell hiding a deeper state-management problem
status: ready
---

# Lesson 4.6 — {#key}: forcing a subtree to rebuild

## 1. Concept — Sometimes reuse is exactly wrong

### 1.1 The problem: a CSS animation that plays once and never again

You built a profile card. When the user changes their colour palette, the new palette flips in with a CSS `@keyframes` animation. It works the first time. The second time, the animation does not play, because Svelte reused the same element — it only swapped the custom property that drives the gradient. The animation only runs when the element is *created*, and no new element was created.

You could solve this with JavaScript — remove and re-add a class, force a reflow, add and remove a `data-animate` attribute. All of those are fiddly. What you actually want is to tell Svelte: "when the palette id changes, treat the new tile as a completely new element. Destroy the old one, create a fresh one, run all its creation lifecycle." That is what `{#key}` does.

### 1.2 The syntax of `{#key}`

```svelte
{#key expression}
    <!-- this subtree is destroyed and rebuilt whenever `expression` changes -->
{/key}
```

Whenever `expression` produces a value different from the last render, Svelte unmounts everything inside the block, creates fresh DOM, runs `$effect` functions again, and restarts any transitions. If the expression is unchanged, the block behaves like ordinary markup and nothing is rebuilt.

### 1.3 Three canonical uses

1. **Resetting an animation.** Wrap the animated element in `{#key paletteId}` and the animation restarts every time the id changes.
2. **Discarding stale local state.** If a child component has internal `$state` that should reset when a prop changes — for example, a settings form that loads different data — wrap it in `{#key userId}` so the component is remounted when the user changes, wiping its local state.
3. **Re-running an effect.** Usually `$effect` re-runs when its reactive dependencies change. But if you want to rerun a side effect on a *specific* trigger that is not one of the effect's dependencies, wrapping the component in `{#key trigger}` forces a remount and reruns the effect.

### 1.4 `{#key}` vs the `(expression)` key on `{#each}`

These are two different features with the unfortunate name collision "key". They do different things:

- **`{#each items as item (item.id)}`** — an *identity key* for list items. Tells Svelte which DOM node belongs to which data item so it can reuse nodes across reorders. Default behaviour is to preserve and match.
- **`{#key expression}…{/key}`** — a *rebuild key* for a subtree. Tells Svelte to destroy and recreate the subtree when the expression changes. Default behaviour is to rebuild whenever the key changes.

One preserves, the other destroys. Choose based on which behaviour you need.

### 1.5 When `{#key}` is a code smell

Every time you reach for `{#key}`, ask yourself: "am I working around a state-management problem?" If a child component holds state that should reset when a prop changes, you can often fix it by making the state derive from the prop instead of being initialised from it. `{#key}` is a hammer that works on every nail, including the ones you should have unscrewed.

Good uses of `{#key}`:

- CSS animations that should replay on input change.
- True "fresh instance of this component" semantics where resetting every internal piece of state manually would be error-prone.
- Re-running transitions or `$effect` functions when a non-dependency changes.

Suspect uses:

- Resetting a form input (bind it to a prop instead).
- Forcing a chart to redraw (use `$effect` with the right dependency).
- Avoiding a bug whose real cause you have not found yet.

## Deep Dive

**Why this matters at scale.** In production apps, you occasionally encounter components or third-party widgets that have internal state which cannot be reset via props alone. A rich text editor, a canvas-based chart, or a map widget might cache internal state that persists even when you change the data prop. In a 50-component app, you might need `{#key}` in 3-5 places where forcing a clean re-instantiation is the only reliable way to reset a component. The alternative — adding `reset()` methods to every stateful component — is fragile and requires cooperation from the component author. `{#key}` works universally.

**The mental model.** Think of `{#key value}` as a kill-and-replace switch. When the key value changes, Svelte destroys everything inside the block (including all component instances and their state) and rebuilds it from scratch. It is the nuclear option for state reset. Unlike `{#if}` which toggles existence based on a boolean, `{#key}` toggles based on *identity* — when the identity value changes, the old instance dies and a new one is born, even though "something should still be rendered."

**Edge cases.** A dangerous pattern: using a rapidly-changing value as the key (like a counter that increments every second). This destroys and recreates the entire DOM subtree every time, which is extremely expensive and causes visual flicker. Only use `{#key}` with values that change infrequently and intentionally (a selected user ID, a step number, a route parameter). Another edge case: `{#key}` combined with transitions. When the key changes, the old content gets an "out" transition and the new content gets an "in" transition — this is a clean way to animate content swaps. A third subtlety: component cleanup (`$effect` return functions) runs when a `{#key}` block destroys its contents, so any subscriptions or timers are properly cleaned up.

**Performance implications.** `{#key}` is expensive by design — it destroys and creates an entire DOM subtree. For a block containing a simple text node, the cost is negligible. For a block containing a complex component tree with 50 nodes, the cost is the full creation time of that tree. Never put a `{#key}` around a large section of your page unless you genuinely need full re-instantiation. If you only need to re-run an effect or reset one piece of state, use a more targeted approach (reassigning a `$state` variable, or calling a reset function).

**Cross-module connections.** `{#key}` appears in Module 7 (forcing GSAP timelines to reinitialise when source data changes), Module 8 (page transitions where the key is the route URL), and Module 12 (as a potential performance anti-pattern to watch for in audits). The `{#key}` block is also the mechanism behind `{#each}` with keys — internally, keyed each blocks track item identity and destroy/recreate items whose keys disappear or appear. Understanding `{#key}` helps you understand why each-block keys matter.

## 2. Style it — A tile that fades in on every change

The mini-build shows a gradient tile whose hue is driven by a custom property. A button cycles through four palettes. Without `{#key}`, the gradient changes silently. With `{#key current.id}`, the tile fades in from scale 0.96 with a soft animation — respecting `prefers-reduced-motion`.

## 3. Interact — Replay the animation on demand

Write the markup without `{#key}`. Click the button. The tile changes instantly. Add `{#key current.id}` around the tile. Click again. The tile fades in. One line of Svelte makes a CSS animation replayable with no JavaScript tricks.

## 4. Mini-build — A tile with replayable fade

### File

`src/routes/modules/04-control-flow/06-key-block/+page.svelte`

### Key excerpt

```svelte
{#key current.id}
    <div class="tile" style:--hue={current.hue}>{current.label}</div>
{/key}

<style>
    .tile { animation: fade-in var(--dur-base) var(--ease-out); }
    @keyframes fade-in {
        from { opacity: 0; transform: scale(0.96); }
        to   { opacity: 1; transform: scale(1); }
    }
    @media (prefers-reduced-motion: reduce) {
        .tile { animation: none; }
    }
</style>
```

### DevTools verification

1. Open the Elements panel and click **Next palette**. The existing tile `<div>` disappears and a new one appears in its place.
2. Open the Animations panel. Each click fires a fresh `fade-in` animation.
3. Remove the `{#key}` wrapper and repeat. The tile updates but the animation never replays.

## 5. Check your understanding

<details>
<summary><strong>Q1.</strong> What does `{#key expression}…{/key}` do when `expression` changes?</summary>

It destroys every DOM node inside the block and creates fresh ones, rerunning any `$effect` calls and restarting any transitions.
</details>

<details>
<summary><strong>Q2.</strong> How is `{#key}` different from the `(expression)` key on `{#each}`?</summary>

The `{#each}` key *preserves* DOM nodes by matching identity across reorders. The `{#key}` block *destroys* DOM nodes when the expression changes to force a rebuild.
</details>

<details>
<summary><strong>Q3.</strong> Give a good reason to reach for `{#key}`.</summary>

Replaying a CSS animation on prop change, wiping the internal state of a child component when the parent's id prop changes, or rerunning an `$effect` on a trigger that is not one of its dependencies.
</details>

<details>
<summary><strong>Q4.</strong> When is `{#key}` a code smell?</summary>

When it is used to paper over a state-management issue that should be solved by deriving state from a prop instead of initialising from it.
</details>

<details>
<summary><strong>Q5.</strong> Does `{#key}` affect performance?</summary>

Yes — every change destroys and recreates every node inside the block. Use it where that cost is intentional, not to wrap a large list.
</details>

## 6. Common mistakes

- **Wrapping a large subtree.** Scope `{#key}` tightly.
- **Using an unstable expression.** `{#key Math.random()}` rebuilds on every render.
- **Using `{#key}` on an `{#each}` list.** Lists want identity keys.
- **Reaching for `{#key}` to "fix" a form component.** Usually the fix is to bind the form to a prop.

## 7. What's next

Lesson 4.7 steps outside Svelte's blocks and teaches the JavaScript async model — promises and `async`/`await` — which the remaining lessons of this module build on.
