---
module: 5
exercise: 4
title: Closure Puzzle
difficulty: expert
estimated_time: 45
skills_tested:
  - closure debugging
  - event handler identity
---

# Exercise 5.4 — Closure Puzzle

## Brief

Solve a series of closure-related bugs in event handlers. Each bug demonstrates a common mistake: stale closures in loops, capturing the wrong variable, and the difference between capturing a value vs a reference. Build a fix for each.

## Requirements

1. Create `src/routes/exercises/05-events/04/+page.svelte`
2. Bug 1: A list of buttons created in a loop where all buttons alert the same (last) index — fix it
3. Bug 2: A counter that shows stale values because the handler captured initial state — fix it
4. Bug 3: An interval setup inside a handler that creates multiple intervals because the cleanup reference is stale — fix it
5. Show the broken version and fixed version side by side for each bug
6. Each fix must have an explanation of WHY the closure was stale
7. TypeScript strict throughout

## Constraints

- Each bug must be demonstrated with actual broken behavior
- Fixes must not change the fundamental approach (e.g., do not replace a loop with hardcoded elements)
- All explanations must reference JavaScript's closure scoping rules
- No external linting tools — understand the bug conceptually

## Hints (progressive)

<details>
<summary>Hint 1 (free)</summary>

A closure captures variables, not values. If you create a function inside a loop that references the loop variable, all functions share the same variable (which ends at the final value after the loop completes).
</details>

<details>
<summary>Hint 2 (conceptual)</summary>

Bug 1 fix: Use let in the loop (block scoping) or capture the index in the closure at creation time. Bug 2 fix: Read state inside the handler body (Svelte's reactivity ensures fresh values). Bug 3 fix: Store the interval ID in a  variable so cleanup always references the current one.
</details>

<details>
<summary>Hint 3 (code sketch)</summary>

\`\`\`svelte
<!-- Bug 1: Stale loop variable -->
<!-- BROKEN: all buttons alert 5 -->
{#each Array(5) as _, i}
  <button onclick={() => alert(i)}>Button {i}</button>
{/each}
<!-- Actually, in Svelte this works correctly because {#each} creates a new scope!
     The real bug is in imperative JS loops that create handlers: -->

<script lang="ts">
  // BROKEN in vanilla JS — but Svelte's {#each} avoids this.
  // Show the vanilla JS version to explain WHY {#each} with keys matters.
</script>
\`\`\`
</details>

## Solution

<details>
<summary>Full solution (click to reveal)</summary>

\`\`\`svelte
<script lang="ts">
  // Bug 1: Loop closure — all handlers share the final value of a var-scoped variable
  // In Svelte's {#each}, this is actually handled correctly by block scoping.
  // We demonstrate the bug with a manually constructed handler array.

  let bug1Broken: string[] = \$state([]);
  let bug1Fixed: string[] = \$state([]);

  // BROKEN: Using a shared mutable reference
  let handlers: (() => void)[] = [];
  let sharedIndex: number = 0;
  for (sharedIndex = 0; sharedIndex < 5; sharedIndex++) {
    handlers.push(() => { bug1Broken = [...bug1Broken, \`Clicked: \${sharedIndex}\`]; });
  }
  // All handlers will log "5" because sharedIndex is 5 after the loop

  // FIXED: Capture the value at creation time
  let fixedHandlers: (() => void)[] = [];
  for (let i = 0; i < 5; i++) {
    fixedHandlers.push(() => { bug1Fixed = [...bug1Fixed, \`Clicked: \${i}\`]; });
  }

  // Bug 2: Stale state in setTimeout
  let count2: number = \$state(0);
  let staleResult: string = \$state('');
  let freshResult: string = \$state('');

  function staleBug(): void {
    const captured = count2; // captures current value
    setTimeout(() => {
      staleResult = \`Stale saw: \${captured} (was captured before increment)\`;
    }, 1000);
    count2++;
  }

  // Bug 3: Multiple intervals
  let intervalCount: number = \$state(0);
  let activeIntervals: number = \$state(0);
  let intervalId: ReturnType<typeof setInterval> | null = \$state(null);

  function brokenStartInterval(): void {
    // BUG: never clears old interval, creates duplicates
    activeIntervals++;
    setInterval(() => { intervalCount++; }, 1000);
  }

  function fixedStartInterval(): void {
    if (intervalId) clearInterval(intervalId);
    else activeIntervals++;
    intervalId = setInterval(() => { intervalCount++; }, 1000);
  }

  function stopInterval(): void {
    if (intervalId) {
      clearInterval(intervalId);
      intervalId = null;
      activeIntervals--;
    }
  }
</script>

<main class="page">
  <h1>Closure Puzzle</h1>

  <section>
    <h2>Bug 1: Loop Variable Capture</h2>
    <div class="side-by-side">
      <div>
        <h3>Broken (var scoping)</h3>
        {#each handlers as handler, i}
          <button onclick={handler}>Button {i}</button>
        {/each}
        <pre>{bug1Broken.join('\\n')}</pre>
      </div>
      <div>
        <h3>Fixed (let scoping)</h3>
        {#each fixedHandlers as handler, i}
          <button onclick={handler}>Button {i}</button>
        {/each}
        <pre>{bug1Fixed.join('\\n')}</pre>
      </div>
    </div>
  </section>

  <section>
    <h2>Bug 2: Stale State in Timeout</h2>
    <p>Count: {count2}</p>
    <button onclick={staleBug}>Increment + Delayed Log</button>
    <p>{staleResult}</p>
    <p class="explanation">The setTimeout captured count2's value at call time, not at execution time.</p>
  </section>

  <section>
    <h2>Bug 3: Leaked Intervals</h2>
    <p>Counter: {intervalCount} | Active: {activeIntervals}</p>
    <button onclick={brokenStartInterval}>Start (broken — leaks!)</button>
    <button onclick={fixedStartInterval}>Start (fixed)</button>
    <button onclick={stopInterval}>Stop</button>
  </section>
</main>

<style>
  .page { max-inline-size: var(--content-max); margin-inline: auto; padding: var(--space-xl) var(--space-md); }
  h1 { font-size: var(--text-2xl); margin-block-end: var(--space-lg); }
  h2 { font-size: var(--text-lg); margin-block: var(--space-xl) var(--space-md); }
  h3 { font-size: var(--text-base); margin-block-end: var(--space-sm); }
  section { padding: var(--space-lg); background: var(--color-surface-2); border-radius: var(--radius-lg); margin-block-end: var(--space-lg); }
  .side-by-side { display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-lg); }
  button { padding: var(--space-xs) var(--space-sm); background: var(--color-brand); color: oklch(100% 0 0); border-radius: var(--radius-sm); margin: var(--space-xs); font-size: var(--text-sm); }
  pre { font-size: var(--text-xs); background: var(--color-surface); padding: var(--space-sm); border-radius: var(--radius-sm); margin-block-start: var(--space-sm); }
  .explanation { font-size: var(--text-sm); color: var(--color-warning); font-style: italic; }
</style>
\`\`\`

### Explanation

Closures capture variables by reference, not by value. In a `var`-scoped loop, all closures share one variable that ends at the final value. With `let`, each iteration creates a new binding. In reactive frameworks, the equivalent bug is capturing stale state — Svelte's reactive system helps by re-creating handlers when dependencies change, but setTimeout/setInterval still capture at call time.
</details>
