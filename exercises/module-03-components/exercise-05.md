---
module: 3
exercise: 5
title: Headless Combobox
difficulty: principal
estimated_time: 60
skills_tested:
  - render delegation
  - keyboard navigation
  - ARIA combobox pattern
  - TypeScript generics
  - snippet composition
---

# Exercise 3.5 — Headless Combobox

## Brief

Design a headless (unstyled logic-only) combobox component that manages filtering, keyboard navigation, selection, and ARIA attributes — but delegates ALL rendering to the consumer via snippets. The consumer provides snippets for the trigger button, the option list, and individual options. This is the ultimate test of component API design.

## Requirements

1. Create `src/lib/exercises/03/Combobox.svelte` — headless logic component
2. Create `src/routes/exercises/03-components/05/+page.svelte` — styled consumer
3. Generic over item type `T` — works with any data shape
4. Props: `items: T[]`, `filterFn: (item: T, query: string) => boolean`, `labelFn: (item: T) => string`
5. Snippet props: `trigger`, `listbox`, `option` — each receives relevant state
6. Keyboard: ArrowDown/Up moves highlight, Enter selects, Escape closes, typing filters
7. ARIA: `role="combobox"`, `aria-expanded`, `aria-activedescendant`, `role="option"`, `aria-selected`
8. Bindable `selected` prop for the chosen item
9. The consumer page demonstrates with a country selector — fully styled with PE7 tokens
10. Focus management: opening the listbox moves focus correctly

## Constraints

- The Combobox component must have ZERO styling (no `<style>` block)
- All visual decisions belong to the consumer
- Must work with keyboard-only navigation (no mouse required)
- TypeScript generics must prevent type mismatches between items and snippet params
- No external combobox/dropdown libraries

## Hints (progressive)

<details>
<summary>Hint 1 (free)</summary>

A headless component exports logic and state through snippet parameters. The trigger snippet receives `{ open, toggle, selectedLabel }`. The option snippet receives `{ item, highlighted, selected, select }`. The component manages the internal state machine.
</details>

<details>
<summary>Hint 2 (conceptual)</summary>

Internal state: `isOpen`, `query`, `highlightedIndex`, `filteredItems` (derived). The keyboard handler lives on the wrapping div and delegates based on key. The filtered items list is a `$derived` from `items` + `query` + `filterFn`. Pass a rich state object to each snippet so the consumer can style highlighted/selected states.
</details>

<details>
<summary>Hint 3 (code sketch)</summary>

```svelte
<script lang="ts" generics="T">
  import type { Snippet } from 'svelte';

  interface Props {
    items: T[];
    filterFn: (item: T, query: string) => boolean;
    labelFn: (item: T) => string;
    selected?: T | null;
    trigger: Snippet<[{ open: boolean; toggle: () => void; label: string }]>;
    option: Snippet<[{ item: T; highlighted: boolean; selected: boolean; select: () => void }]>;
  }

  let { items, filterFn, labelFn, selected = $bindable(null), trigger, option }: Props = $props();
  let isOpen: boolean = $state(false);
  let query: string = $state('');
  let highlightedIndex: number = $state(0);
  let filtered: T[] = $derived(items.filter(i => filterFn(i, query)));
</script>
```
</details>

## Solution

<details>
<summary>Full solution (click to reveal)</summary>

**`src/lib/exercises/03/Combobox.svelte`**

```svelte
<script lang="ts" generics="T">
  import type { Snippet } from 'svelte';

  interface Props {
    items: T[];
    filterFn: (item: T, query: string) => boolean;
    labelFn: (item: T) => string;
    selected?: T | null;
    trigger: Snippet<[{ open: boolean; toggle: () => void; label: string }]>;
    option: Snippet<[{ item: T; highlighted: boolean; selected: boolean; select: () => void }]>;
    placeholder?: string;
  }

  let {
    items,
    filterFn,
    labelFn,
    selected = $bindable(null),
    trigger,
    option,
    placeholder = 'Select...'
  }: Props = $props();

  let isOpen: boolean = $state(false);
  let query: string = $state('');
  let highlightedIndex: number = $state(0);

  let filtered: T[] = $derived(
    query ? items.filter((item) => filterFn(item, query)) : items
  );

  let selectedLabel: string = $derived(
    selected ? labelFn(selected) : placeholder
  );

  function toggle(): void {
    isOpen = !isOpen;
    if (isOpen) {
      query = '';
      highlightedIndex = 0;
    }
  }

  function selectItem(item: T): void {
    selected = item;
    isOpen = false;
    query = '';
  }

  function handleKeydown(e: KeyboardEvent): void {
    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        isOpen = true;
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        highlightedIndex = Math.min(highlightedIndex + 1, filtered.length - 1);
        break;
      case 'ArrowUp':
        e.preventDefault();
        highlightedIndex = Math.max(highlightedIndex - 1, 0);
        break;
      case 'Enter':
        e.preventDefault();
        if (filtered[highlightedIndex]) {
          selectItem(filtered[highlightedIndex]);
        }
        break;
      case 'Escape':
        e.preventDefault();
        isOpen = false;
        break;
    }
  }
</script>

<div
  role="combobox"
  aria-expanded={isOpen}
  aria-haspopup="listbox"
  aria-activedescendant={isOpen ? `option-${highlightedIndex}` : undefined}
  onkeydown={handleKeydown}
>
  {@render trigger({ open: isOpen, toggle, label: selectedLabel })}

  {#if isOpen}
    <input
      type="text"
      bind:value={query}
      placeholder="Type to filter..."
      aria-label="Filter options"
    />
    <ul role="listbox">
      {#each filtered as item, i}
        <li
          id="option-{i}"
          role="option"
          aria-selected={selected === item}
        >
          {@render option({
            item,
            highlighted: i === highlightedIndex,
            selected: selected === item,
            select: () => selectItem(item)
          })}
        </li>
      {/each}
      {#if filtered.length === 0}
        <li role="option" aria-disabled="true">No results</li>
      {/if}
    </ul>
  {/if}
</div>
```

**`src/routes/exercises/03-components/05/+page.svelte`**

```svelte
<script lang="ts">
  import Combobox from '$lib/exercises/03/Combobox.svelte';

  interface Country {
    code: string;
    name: string;
    flag: string;
  }

  const countries: Country[] = [
    { code: 'US', name: 'United States', flag: '🇺🇸' },
    { code: 'GB', name: 'United Kingdom', flag: '🇬🇧' },
    { code: 'DE', name: 'Germany', flag: '🇩🇪' },
    { code: 'FR', name: 'France', flag: '🇫🇷' },
    { code: 'JP', name: 'Japan', flag: '🇯🇵' },
    { code: 'AU', name: 'Australia', flag: '🇦🇺' },
    { code: 'CA', name: 'Canada', flag: '🇨🇦' },
    { code: 'BR', name: 'Brazil', flag: '🇧🇷' }
  ];

  let selectedCountry: Country | null = $state(null);

  function filterCountry(country: Country, query: string): boolean {
    return country.name.toLowerCase().includes(query.toLowerCase());
  }

  function labelCountry(country: Country): string {
    return `${country.flag} ${country.name}`;
  }
</script>

<main class="page">
  <h1>Headless Combobox</h1>

  <div class="demo">
    <Combobox
      items={countries}
      filterFn={filterCountry}
      labelFn={labelCountry}
      bind:selected={selectedCountry}
    >
      {#snippet trigger({ open, toggle, label })}
        <button class="trigger" onclick={toggle} aria-label="Select country">
          <span>{label}</span>
          <span class="chevron" class:open>{open ? '▲' : '▼'}</span>
        </button>
      {/snippet}

      {#snippet option({ item, highlighted, selected, select })}
        <button
          class="option"
          class:highlighted
          class:selected
          onclick={select}
        >
          <span class="flag">{item.flag}</span>
          <span class="name">{item.name}</span>
          <span class="code">{item.code}</span>
          {#if selected}
            <span class="check" aria-hidden="true">✓</span>
          {/if}
        </button>
      {/snippet}
    </Combobox>

    {#if selectedCountry}
      <p class="selection">
        Selected: <strong>{selectedCountry.flag} {selectedCountry.name}</strong> ({selectedCountry.code})
      </p>
    {/if}
  </div>
</main>

<style>
  .page {
    max-inline-size: var(--prose-max);
    margin-inline: auto;
    padding: var(--space-xl) var(--space-md);
  }

  h1 { font-size: var(--text-2xl); margin-block-end: var(--space-lg); }

  .demo {
    display: grid;
    gap: var(--space-lg);
  }

  .trigger {
    display: flex;
    align-items: center;
    justify-content: space-between;
    inline-size: 100%;
    padding: var(--space-sm) var(--space-md);
    background: var(--color-surface-2);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    font-size: var(--text-base);
    cursor: pointer;
    transition: border-color var(--dur-fast) var(--ease-out);
  }

  .trigger:hover { border-color: var(--color-brand); }

  .chevron { font-size: var(--text-xs); color: var(--color-text-muted); }

  .option {
    display: flex;
    align-items: center;
    gap: var(--space-sm);
    inline-size: 100%;
    padding: var(--space-sm) var(--space-md);
    text-align: start;
    border-radius: var(--radius-sm);
    transition: background var(--dur-instant) var(--ease-out);
    cursor: pointer;
  }

  .option.highlighted { background: var(--color-surface-2); }
  .option.selected { color: var(--color-brand); font-weight: 600; }

  .flag { font-size: var(--text-lg); }
  .name { flex: 1; }
  .code { font-size: var(--text-xs); color: var(--color-text-muted); font-family: ui-monospace, monospace; }
  .check { color: var(--color-brand); font-weight: 700; }

  .selection {
    padding: var(--space-md);
    background: var(--color-surface-2);
    border-radius: var(--radius-md);
  }
</style>
```

### Explanation

The headless pattern is the most powerful component abstraction. The Combobox owns all the complex logic (keyboard navigation, ARIA state, filtering, open/close state machine) but renders nothing visual itself. The consumer provides snippets that receive rich state objects — `highlighted`, `selected`, `select` — and can style them however they want. This means one headless Combobox component can power a country selector, a font picker, a color chooser, or any filterable selection UI without any code changes to the logic component. The generic `T` ensures type safety flows through: the `option` snippet knows it receives a `Country` object, not an `any`. This is the same architectural pattern used by Headless UI, Radix, and Melt UI.
</details>
