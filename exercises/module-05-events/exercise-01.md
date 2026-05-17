---
module: 5
exercise: 1
title: Click Handler Patterns
difficulty: beginner
estimated_time: 10
skills_tested:
  - onclick attribute
  - TypeScript MouseEvent typing
  - inline vs extracted handlers
---

# Exercise 5.1 — Click Handler Patterns

## Brief

Build a page that demonstrates five different ways to attach click handlers in Svelte 5: inline arrow function, named function reference, parameterized handler factory, handler with event object access, and handler with modifier behavior (preventDefault).

## Requirements

1. Create `src/routes/exercises/05-events/01/+page.svelte`
2. Button 1: inline arrow — `onclick={() => count++}`
3. Button 2: named function reference — `onclick={handleClick}`
4. Button 3: parameterized — `onclick={() => addItem('apple')}` (closure over parameter)
5. Button 4: event access — handler that logs `event.clientX`, `event.clientY` with proper `MouseEvent` type
6. Button 5: a link with `onclick` that calls `event.preventDefault()` to stop navigation
7. Display a log of all events showing which pattern was used
8. TypeScript strict — all handlers properly typed

## Constraints

- No `on:click` (Svelte 4 syntax)
- All handlers must have explicit TypeScript types where a function is extracted
- No event modifiers (they do not exist in Svelte 5) — use explicit `preventDefault()`

## Hints (progressive)

<details>
<summary>Hint 1 (free)</summary>

In Svelte 5, events are just element attributes: `onclick={handler}`. The handler receives the native DOM event. For TypeScript, type it as `MouseEvent`.
</details>

<details>
<summary>Hint 2 (conceptual)</summary>

A named handler is `function handleClick(e: MouseEvent): void { ... }`. A parameterized handler uses a closure: `onclick={() => doSomething(param)}`. For preventDefault, access the event in the handler and call `e.preventDefault()`.
</details>

<details>
<summary>Hint 3 (code sketch)</summary>

```svelte
<script lang="ts">
  let log: string[] = $state([]);
  function addLog(msg: string): void { log = [...log, msg]; }

  function handleNamed(e: MouseEvent): void {
    addLog(`Named handler at (${e.clientX}, ${e.clientY})`);
  }

  function handleLink(e: MouseEvent): void {
    e.preventDefault();
    addLog('Link click prevented');
  }
</script>

<button onclick={() => addLog('Inline')}>Inline</button>
<button onclick={handleNamed}>Named</button>
<a href="/somewhere" onclick={handleLink}>Prevented Link</a>
```
</details>

## Solution

<details>
<summary>Full solution (click to reveal)</summary>

```svelte
<script lang="ts">
  let log: string[] = $state([]);
  let count: number = $state(0);

  function addLog(msg: string): void {
    log = [msg, ...log].slice(0, 20);
  }

  function handleNamed(): void {
    count++;
    addLog(`Named function: count is now ${count}`);
  }

  function addItem(item: string): void {
    addLog(`Parameterized: added "${item}"`);
  }

  function handleWithEvent(e: MouseEvent): void {
    addLog(`Event access: clicked at (${e.clientX}, ${e.clientY})`);
  }

  function handlePreventDefault(e: MouseEvent): void {
    e.preventDefault();
    addLog('preventDefault: navigation stopped');
  }
</script>

<main class="page">
  <h1>Click Handler Patterns</h1>

  <div class="buttons">
    <button onclick={() => { count++; addLog(`Inline: count = ${count}`); }}>
      1. Inline Arrow ({count})
    </button>

    <button onclick={handleNamed}>
      2. Named Function
    </button>

    <button onclick={() => addItem('apple')}>
      3. Parameterized (apple)
    </button>

    <button onclick={handleWithEvent}>
      4. Event Object Access
    </button>

    <a href="https://example.com" onclick={handlePreventDefault}>
      5. Prevented Link
    </a>
  </div>

  <section class="log">
    <h2>Event Log</h2>
    {#if log.length === 0}
      <p class="empty">Click buttons above to see events...</p>
    {:else}
      <ul>
        {#each log as entry}
          <li>{entry}</li>
        {/each}
      </ul>
    {/if}
  </section>
</main>

<style>
  .page {
    max-inline-size: var(--prose-max);
    margin-inline: auto;
    padding: var(--space-xl) var(--space-md);
  }

  h1 { font-size: var(--text-2xl); margin-block-end: var(--space-lg); }
  h2 { font-size: var(--text-lg); margin-block-end: var(--space-sm); }

  .buttons {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-sm);
    margin-block-end: var(--space-xl);
  }

  button, a {
    padding: var(--space-sm) var(--space-md);
    background: var(--color-brand);
    color: oklch(100% 0 0);
    font-weight: 600;
    border-radius: var(--radius-md);
    font-size: var(--text-sm);
    text-decoration: none;
  }

  .log {
    background: var(--color-surface-2);
    padding: var(--space-lg);
    border-radius: var(--radius-lg);
  }

  .log ul {
    list-style: none;
    padding: 0;
    display: grid;
    gap: var(--space-xs);
  }

  .log li {
    font-size: var(--text-xs);
    font-family: ui-monospace, monospace;
    padding: var(--space-xs) var(--space-sm);
    background: var(--color-surface);
    border-radius: var(--radius-sm);
  }

  .empty { color: var(--color-text-muted); font-style: italic; }
</style>
```

### Explanation

Svelte 5 simplifies events to plain DOM attributes. There is no special event directive syntax. `onclick={fn}` is identical to setting `element.onclick = fn` conceptually, but Svelte optimizes it via delegation. The key patterns: inline for simple one-liners, named functions for reusable/testable handlers, closures for parameterized handlers, and direct `event.preventDefault()` for modifier behavior. TypeScript types the event parameter as the native DOM event type (`MouseEvent`, `KeyboardEvent`, etc.), giving you full autocomplete on event properties.
</details>
