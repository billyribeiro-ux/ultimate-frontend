---
module: 10
exercise: 2
title: Form Action CRUD
difficulty: intermediate
estimated_time: 20
skills_tested:
  - default and named form actions
  - ActionData
  - form method POST
---

# Exercise 10.2 — Form Action CRUD

## Brief

Build a notes manager with full CRUD using SvelteKit form actions. A default action creates notes, and named actions handle update and delete. The page uses `ActionData` to show success/error feedback after each operation.

## Requirements

1. Create `src/routes/notes/+page.server.ts` with three actions: `default` (create), `update`, and `delete`
2. The `default` action reads `title` from FormData, validates it is not empty, and adds a note
3. The `update` action reads `id` and `title`, finds the note, and updates it
4. The `delete` action reads `id` and removes the note
5. All actions return success/error status via `ActionData`
6. Create a load function that returns the current notes list
7. Create `src/routes/notes/+page.svelte` with a create form, and each note has edit/delete forms

## Constraints

- All mutations use `<form method="POST">` — no `fetch()` calls
- Named actions use `?/actionName` in the form `action` attribute
- No JavaScript required for basic functionality

## Hints (progressive)

<details>
<summary>Hint 1 (free)</summary>

Export a `default` action for create, and named actions as `export const actions = { default: ..., update: ..., delete: ... }`. Named actions are triggered by setting the form's `action` to `?/update` or `?/delete`.
</details>

<details>
<summary>Hint 2 (conceptual)</summary>

Each action receives `{ request }` with a `FormData` body. For `delete`, include a hidden input with the note ID. The action returns data that becomes available as `form` prop in the page. After any action, SvelteKit automatically reruns the load function.
</details>

<details>
<summary>Hint 3 (code sketch)</summary>

```typescript
export const actions = {
  default: async ({ request }) => {
    const data = await request.formData();
    const title = data.get('title') as string;
    // validate and create
    return { success: true };
  },
  delete: async ({ request }) => {
    const data = await request.formData();
    const id = Number(data.get('id'));
    // find and delete
    return { success: true };
  }
};
```
</details>

## Solution

<details>
<summary>Full solution</summary>

```typescript
// src/routes/notes/+page.server.ts
import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

interface Note {
  id: number;
  title: string;
  createdAt: string;
}

let nextId = 4;
const notes: Note[] = [
  { id: 1, title: 'Learn form actions', createdAt: '2026-05-01' },
  { id: 2, title: 'Build CRUD interface', createdAt: '2026-05-02' },
  { id: 3, title: 'Add validation', createdAt: '2026-05-03' }
];

export const load: PageServerLoad = () => {
  return { notes: structuredClone(notes) };
};

export const actions: Actions = {
  default: async ({ request }) => {
    const data = await request.formData();
    const title = (data.get('title') as string)?.trim();

    if (!title) {
      return fail(400, { error: 'Title is required', title: '' });
    }

    notes.push({ id: nextId++, title, createdAt: new Date().toISOString().split('T')[0] });
    return { success: true, message: 'Note created' };
  },

  update: async ({ request }) => {
    const data = await request.formData();
    const id = Number(data.get('id'));
    const title = (data.get('title') as string)?.trim();

    if (!title) {
      return fail(400, { error: 'Title is required', id });
    }

    const note = notes.find((n) => n.id === id);
    if (!note) {
      return fail(404, { error: 'Note not found' });
    }

    note.title = title;
    return { success: true, message: 'Note updated' };
  },

  delete: async ({ request }) => {
    const data = await request.formData();
    const id = Number(data.get('id'));
    const index = notes.findIndex((n) => n.id === id);

    if (index === -1) {
      return fail(404, { error: 'Note not found' });
    }

    notes.splice(index, 1);
    return { success: true, message: 'Note deleted' };
  }
};
```

```svelte
<!-- src/routes/notes/+page.svelte -->
<script lang="ts">
  import type { PageData, ActionData } from './$types';

  let { data, form }: { data: PageData; form: ActionData } = $props();
</script>

<div class="notes-page">
  <h1>Notes</h1>

  {#if form?.success}
    <div class="toast success" role="alert">{form.message}</div>
  {/if}
  {#if form?.error}
    <div class="toast error" role="alert">{form.error}</div>
  {/if}

  <form method="POST" class="create-form">
    <input type="text" name="title" placeholder="New note title..." required />
    <button type="submit">Add Note</button>
  </form>

  <ul class="note-list">
    {#each data.notes as note (note.id)}
      <li class="note-item">
        <form method="POST" action="?/update" class="edit-form">
          <input type="hidden" name="id" value={note.id} />
          <input type="text" name="title" value={note.title} />
          <button type="submit" class="btn-update">Save</button>
        </form>
        <form method="POST" action="?/delete">
          <input type="hidden" name="id" value={note.id} />
          <button type="submit" class="btn-delete">Delete</button>
        </form>
      </li>
    {/each}
  </ul>
</div>

<style>
  .notes-page { max-inline-size: 36rem; margin-inline: auto; padding: var(--space-lg); }
  h1 { font-size: var(--text-2xl); margin-block-end: var(--space-lg); }

  .toast { padding: var(--space-sm) var(--space-md); border-radius: var(--radius-md); margin-block-end: var(--space-md); font-size: var(--text-sm); font-weight: 600; }
  .toast.success { background: oklch(90% 0.1 145); color: oklch(30% 0.1 145); }
  .toast.error { background: oklch(90% 0.1 25); color: oklch(30% 0.1 25); }

  .create-form { display: flex; gap: var(--space-sm); margin-block-end: var(--space-xl); }
  .create-form input { flex: 1; padding: var(--space-sm); border: 1px solid var(--color-border); border-radius: var(--radius-sm); font-size: var(--text-base); background: var(--color-surface-1); color: var(--color-text); }
  .create-form button { padding: var(--space-sm) var(--space-md); background: oklch(55% 0.2 250); color: white; border: none; border-radius: var(--radius-sm); font-weight: 600; cursor: pointer; }

  .note-list { list-style: none; padding: 0; display: flex; flex-direction: column; gap: var(--space-sm); }
  .note-item { display: flex; gap: var(--space-sm); align-items: center; background: var(--color-surface-2); border: 1px solid var(--color-border); border-radius: var(--radius-md); padding: var(--space-sm) var(--space-md); }
  .edit-form { display: flex; gap: var(--space-xs); flex: 1; }
  .edit-form input[type='text'] { flex: 1; padding: var(--space-xs) var(--space-sm); border: 1px solid transparent; border-radius: var(--radius-sm); background: transparent; color: var(--color-text); }
  .edit-form input[type='text']:focus { border-color: var(--color-border); background: var(--color-surface-1); }

  .btn-update, .btn-delete { padding: var(--space-2xs) var(--space-sm); border: none; border-radius: var(--radius-sm); font-size: var(--text-xs); font-weight: 600; cursor: pointer; }
  .btn-update { background: var(--color-surface-3); color: var(--color-text); }
  .btn-delete { background: oklch(90% 0.1 25); color: oklch(40% 0.15 25); }
</style>
```

### Explanation

Form actions are SvelteKit's native pattern for handling form submissions. The `default` action handles `<form method="POST">` without a specific `action` attribute. Named actions use `action="?/update"` or `action="?/delete"`. After any action completes, SvelteKit automatically reruns the page's load function, so the note list refreshes without manual refetching. The `fail()` helper returns validation errors with a non-2xx status. This entire flow works without JavaScript — the browser submits the form, the server processes it, and redirects back to the page.
</details>
