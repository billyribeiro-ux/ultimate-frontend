---
module: 5
exercise: 5
title: Keyboard-Accessible Widget
difficulty: principal
estimated_time: 60
skills_tested:
  - ARIA widget patterns
  - roving tabindex
---

# Exercise 5.5 — Keyboard-Accessible Widget

## Brief

Build a fully keyboard-accessible toolbar widget following the WAI-ARIA Toolbar pattern. Implements roving tabindex, arrow key navigation, Home/End keys, and proper focus management. Works identically with mouse and keyboard.

## Requirements

1. Create `src/lib/exercises/05/Toolbar.svelte`
2. Create `src/routes/exercises/05-events/05/+page.svelte`
3. Toolbar implements WAI-ARIA Toolbar pattern (role="toolbar")
4. Roving tabindex: only one button has tabindex="0" at a time
5. Arrow keys move focus between buttons
6. Home/End jump to first/last button
7. Each button triggers an action (bold, italic, underline, align-left, align-center, align-right)
8. Visual focus indicator must meet WCAG 2.2 contrast requirements
9. Works identically with mouse and keyboard
10. A text area below the toolbar that the buttons act upon

## Constraints

- No external component libraries (Radix, Melt UI, etc.)
- Must follow WAI-ARIA Toolbar specification exactly
- Keyboard navigation must work without JavaScript for basic form submission
- No tabindex values other than 0 and -1
- Reduced motion must be respected

## Hints (progressive)

<details>
<summary>Hint 1 (free)</summary>

Roving tabindex means only one element in the group has tabindex=0 (focusable with Tab). All others have tabindex=-1 (focusable via JavaScript but not Tab). Arrow keys programmatically move focus AND update tabindex values.
</details>

<details>
<summary>Hint 2 (conceptual)</summary>

Track the active index in $state. On ArrowRight, increment index and call `buttons[newIndex].focus()`. On ArrowLeft, decrement. Update tabindex attributes reactively based on which index is active. Use a $effect to manage focus when activeIndex changes.
</details>

<details>
<summary>Hint 3 (code sketch)</summary>

\`\`\`svelte
<script lang="ts">
  let activeIndex: number = \$state(0);
  let buttons: HTMLButtonElement[] = \$state([]);

  function handleKeydown(e: KeyboardEvent): void {
    switch (e.key) {
      case 'ArrowRight':
        activeIndex = (activeIndex + 1) % buttons.length;
        break;
      case 'ArrowLeft':
        activeIndex = (activeIndex - 1 + buttons.length) % buttons.length;
        break;
      case 'Home':
        activeIndex = 0;
        break;
      case 'End':
        activeIndex = buttons.length - 1;
        break;
    }
    buttons[activeIndex]?.focus();
  }
</script>
\`\`\`
</details>

## Solution

<details>
<summary>Full solution (click to reveal)</summary>

\`\`\`svelte
<script lang="ts">
  interface ToolbarItem {
    id: string;
    label: string;
    icon: string;
    action: () => void;
  }

  let text: string = \$state('Select some text and use the toolbar to format it.');
  let activeIndex: number = \$state(0);
  let buttons: HTMLButtonElement[] = \$state([]);

  const items: ToolbarItem[] = [
    { id: 'bold', label: 'Bold', icon: 'B', action: () => { text = \`**\${text}**\`; } },
    { id: 'italic', label: 'Italic', icon: 'I', action: () => { text = \`_\${text}_\`; } },
    { id: 'underline', label: 'Underline', icon: 'U', action: () => { text = \`<u>\${text}</u>\`; } },
    { id: 'align-left', label: 'Align Left', icon: '⫷', action: () => {} },
    { id: 'align-center', label: 'Align Center', icon: '⫸', action: () => {} },
    { id: 'align-right', label: 'Align Right', icon: '⫸', action: () => {} }
  ];

  function handleKeydown(e: KeyboardEvent): void {
    let newIndex = activeIndex;

    switch (e.key) {
      case 'ArrowRight':
        e.preventDefault();
        newIndex = (activeIndex + 1) % items.length;
        break;
      case 'ArrowLeft':
        e.preventDefault();
        newIndex = (activeIndex - 1 + items.length) % items.length;
        break;
      case 'Home':
        e.preventDefault();
        newIndex = 0;
        break;
      case 'End':
        e.preventDefault();
        newIndex = items.length - 1;
        break;
      default:
        return;
    }

    activeIndex = newIndex;
    buttons[newIndex]?.focus();
  }
</script>

<main class="page">
  <h1>Keyboard-Accessible Toolbar</h1>

  <div
    class="toolbar"
    role="toolbar"
    aria-label="Text formatting"
    onkeydown={handleKeydown}
  >
    {#each items as item, i}
      <button
        bind:this={buttons[i]}
        aria-label={item.label}
        tabindex={i === activeIndex ? 0 : -1}
        class="tool-btn"
        class:active={i === activeIndex}
        onclick={item.action}
      >
        {item.icon}
      </button>
    {/each}
  </div>

  <textarea class="editor" bind:value={text} rows={6}></textarea>

  <p class="instructions">
    Tab into the toolbar, then use Arrow keys to move between buttons.
    Home/End jump to first/last. Enter or Space activates.
  </p>
</main>

<style>
  .page { max-inline-size: var(--prose-max); margin-inline: auto; padding: var(--space-xl) var(--space-md); }
  h1 { font-size: var(--text-2xl); margin-block-end: var(--space-lg); }

  .toolbar {
    display: flex;
    gap: var(--space-xs);
    padding: var(--space-sm);
    background: var(--color-surface-2);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    margin-block-end: var(--space-md);
  }

  .tool-btn {
    inline-size: 2.5rem;
    block-size: 2.5rem;
    display: grid;
    place-items: center;
    border-radius: var(--radius-sm);
    font-weight: 700;
    font-size: var(--text-base);
    background: var(--color-surface);
    border: 1px solid transparent;
    transition: all var(--dur-fast) var(--ease-out);
  }

  .tool-btn:hover { background: var(--color-brand); color: oklch(100% 0 0); }
  .tool-btn:focus-visible { outline: 2px solid var(--color-brand); outline-offset: 2px; }
  .tool-btn.active { border-color: var(--color-brand); }

  .editor {
    inline-size: 100%;
    padding: var(--space-md);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    font-size: var(--text-base);
    font-family: inherit;
    resize: vertical;
  }

  .instructions { font-size: var(--text-sm); color: var(--color-text-muted); margin-block-start: var(--space-md); }

  @media (prefers-reduced-motion: reduce) {
    .tool-btn { transition: none; }
  }
</style>
\`\`\`

### Explanation

The roving tabindex pattern is the WAI-ARIA standard for keyboard navigation in composite widgets. Only one element is in the tab order (tabindex=0) — the rest are tabindex=-1. Arrow keys programmatically move focus and update which element has tabindex=0. This gives keyboard users efficient navigation: one Tab press enters the toolbar, arrows navigate within it, another Tab leaves. Without this, each button would be a separate tab stop, requiring 6 Tab presses to pass through.
</details>
