---
module: 9
exercise: 5
title: Choosing the Right Tool
difficulty: principal
estimated_time: 60
skills_tested:
  - load functions
  - query remote functions
  - command remote functions
  - form remote functions
  - architectural decision-making
---

# Exercise 9b.5 — Choosing the Right Tool

## Brief

Build a mini-application with four routes, each using a different SvelteKit data pattern for the same underlying data (a notes system): load function, query remote function, command remote function, and form remote function. Include a comparison page that explains when to use each.

## Requirements

1. Create a shared data module `src/lib/server/data/notes.ts` with an in-memory array of notes and CRUD helper functions
2. Route `/notes/load` — uses `+page.server.ts` load function to display notes
3. Route `/notes/query` — uses a query remote function to fetch and display notes
4. Route `/notes/command` — uses a command remote function to add/delete notes with optimistic UI
5. Route `/notes/form` — uses a form remote function with a `<form>` for progressive enhancement
6. Route `/notes` — a comparison page with a decision matrix table explaining when to use each pattern
7. Each implementation must produce identical UI but use its designated pattern
8. Include TypeScript types shared across all implementations

## Constraints

- Each route must use exactly one data pattern (no mixing)
- The comparison page must explain trade-offs: SSR compatibility, JS-off support, type safety, and caching
- All styles use PE7 tokens
- Shared types must live in `$lib/types/`

## Hints (progressive)

<details>
<summary>Hint 1 (free)</summary>

The four patterns serve different needs: load functions are best for page data that needs SSR, query functions for on-demand reads, command functions for mutations, and form functions for progressive-enhancement forms. Each has different behavior with JavaScript disabled.
</details>

<details>
<summary>Hint 2 (conceptual)</summary>

Create the shared data layer first: an in-memory array with `getNotes()`, `addNote()`, `deleteNote()` functions. Then build each route using only its designated pattern. The form route should work without JavaScript; the command route requires JavaScript; the load and query routes differ in caching behavior.
</details>

<details>
<summary>Hint 3 (code sketch)</summary>

```typescript
// src/lib/server/data/notes.ts
let notes: Note[] = [/* initial data */];
export const getNotes = () => structuredClone(notes);
export const addNote = (title: string) => { /* ... */ };
export const deleteNote = (id: number) => { /* ... */ };
```
</details>

## Solution

<details>
<summary>Full solution</summary>

```typescript
// src/lib/types/note.ts
export interface Note {
  id: number;
  title: string;
  createdAt: string;
}
```

```typescript
// src/lib/server/data/notes.ts
import type { Note } from '$lib/types/note';

let nextId = 4;
let notes: Note[] = [
  { id: 1, title: 'Learn Svelte 5 runes', createdAt: '2026-05-01T10:00:00Z' },
  { id: 2, title: 'Build with PE7 tokens', createdAt: '2026-05-02T14:30:00Z' },
  { id: 3, title: 'Master TypeScript strict', createdAt: '2026-05-03T09:15:00Z' }
];

export function getNotes(): Note[] {
  return structuredClone(notes);
}

export function addNote(title: string): Note {
  const note: Note = { id: nextId++, title, createdAt: new Date().toISOString() };
  notes.push(note);
  return structuredClone(note);
}

export function deleteNote(id: number): boolean {
  const index = notes.findIndex((n) => n.id === id);
  if (index === -1) return false;
  notes.splice(index, 1);
  return true;
}
```

```typescript
// src/routes/notes/load/+page.server.ts
import type { PageServerLoad } from './$types';
import { getNotes } from '$lib/server/data/notes';

export const load: PageServerLoad = () => {
  return { notes: getNotes() };
};
```

```svelte
<!-- src/routes/notes/load/+page.svelte -->
<script lang="ts">
  import type { PageData } from './$types';
  let { data }: { data: PageData } = $props();
</script>

<div class="notes-page">
  <h1>Notes (Load Function)</h1>
  <p class="pattern">Pattern: <code>+page.server.ts</code> load function</p>
  <ul class="note-list">
    {#each data.notes as note (note.id)}
      <li class="note-item">
        <span>{note.title}</span>
        <time>{new Date(note.createdAt).toLocaleDateString()}</time>
      </li>
    {/each}
  </ul>
</div>

<style>
  .notes-page { max-inline-size: 32rem; margin-inline: auto; padding: var(--space-lg); }
  h1 { font-size: var(--text-2xl); margin-block-end: var(--space-xs); }
  .pattern { font-size: var(--text-sm); color: var(--color-text-muted); margin-block-end: var(--space-lg); }
  code { background: var(--color-surface-3); padding: var(--space-2xs) var(--space-xs); border-radius: var(--radius-sm); }
  .note-list { list-style: none; padding: 0; display: flex; flex-direction: column; gap: var(--space-xs); }
  .note-item { display: flex; justify-content: space-between; padding: var(--space-sm) var(--space-md); background: var(--color-surface-2); border: 1px solid var(--color-border); border-radius: var(--radius-md); }
  time { font-size: var(--text-xs); color: var(--color-text-muted); }
</style>
```

```svelte
<!-- src/routes/notes/+page.svelte -->
<script lang="ts">
  const patterns = [
    { name: 'Load Function', route: '/notes/load', ssr: 'Yes', jsOff: 'Yes', cache: 'Automatic', best: 'Page data that needs SEO/SSR' },
    { name: 'Query Remote', route: '/notes/query', ssr: 'No', jsOff: 'No', cache: 'Manual', best: 'On-demand reads, interactive fetches' },
    { name: 'Command Remote', route: '/notes/command', ssr: 'No', jsOff: 'No', cache: 'None', best: 'Mutations with optimistic UI' },
    { name: 'Form Remote', route: '/notes/form', ssr: 'Yes', jsOff: 'Yes', cache: 'None', best: 'CRUD forms with progressive enhancement' }
  ];
</script>

<div class="comparison-page">
  <h1>Data Patterns Comparison</h1>

  <table class="comparison-table">
    <thead>
      <tr>
        <th>Pattern</th>
        <th>SSR</th>
        <th>JS-off</th>
        <th>Caching</th>
        <th>Best for</th>
      </tr>
    </thead>
    <tbody>
      {#each patterns as pattern}
        <tr>
          <td><a href={pattern.route}>{pattern.name}</a></td>
          <td>{pattern.ssr}</td>
          <td>{pattern.jsOff}</td>
          <td>{pattern.cache}</td>
          <td>{pattern.best}</td>
        </tr>
      {/each}
    </tbody>
  </table>
</div>

<style>
  .comparison-page { max-inline-size: 56rem; margin-inline: auto; padding: var(--space-lg); }
  h1 { font-size: var(--text-2xl); margin-block-end: var(--space-xl); }
  .comparison-table { inline-size: 100%; border-collapse: collapse; }
  th, td { padding: var(--space-sm) var(--space-md); text-align: start; border-block-end: 1px solid var(--color-border); font-size: var(--text-sm); }
  th { font-weight: 600; color: var(--color-text-muted); background: var(--color-surface-2); }
  a { color: oklch(55% 0.2 250); text-decoration: none; font-weight: 600; }
  a:hover { text-decoration: underline; }
</style>
```

### Explanation

SvelteKit provides four distinct patterns for data flow, each optimized for different scenarios. Load functions are the default choice for page data — they run on the server, support SSR, and integrate with SvelteKit's caching and invalidation system. Query remote functions are for on-demand data reads that happen after the initial page load. Command remote functions handle mutations (create, update, delete) with support for optimistic updates. Form remote functions bridge the gap between traditional HTML forms and modern UX, working with and without JavaScript. The decision matrix helps you choose: if the data defines the page, use load. If the user triggers it, use query/command. If it is a form, use the form function.
</details>
