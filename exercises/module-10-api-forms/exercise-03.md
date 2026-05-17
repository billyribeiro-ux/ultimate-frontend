---
module: 10
exercise: 3
title: Progressive Enhancement with use:enhance
difficulty: advanced
estimated_time: 30
skills_tested:
  - use:enhance directive
  - pending state management
  - custom enhance callback
  - optimistic updates
---

# Exercise 10.3 — Progressive Enhancement with use:enhance

## Brief

Take the form action CRUD from Exercise 10.2 and enhance it with `use:enhance`. Add pending states during submission, prevent page flicker, and implement a custom enhance callback that handles optimistic delete with undo capability.

## Requirements

1. Add `use:enhance` to all forms from the notes CRUD
2. The create form shows a "Creating..." state on the submit button while the action runs
3. The delete action uses a custom `use:enhance` callback that optimistically removes the note from the DOM before the server responds
4. Add an "Undo" toast after delete that re-adds the note if clicked within 3 seconds
5. The update form shows inline "Saving..." feedback
6. All enhanced forms must still work if `use:enhance` fails to load (graceful degradation)
7. No full-page reload after any action

## Constraints

- Import `enhance` from `$app/forms`
- The custom callback must call `update()` or handle the response manually
- Pending states must use reactive `$state` variables
- All styles use PE7 tokens

## Hints (progressive)

<details>
<summary>Hint 1 (free)</summary>

`use:enhance` accepts an optional callback: `use:enhance={() => { /* before submit */ return async ({ result, update }) => { /* after response */ }; }}`. Return a function to handle the response manually, or call `update()` to apply the default behavior.
</details>

<details>
<summary>Hint 2 (conceptual)</summary>

Set a `submitting` flag to `true` before the request. In the returned callback, set it to `false` and call `update()`. For optimistic delete, hide the item immediately in the "before" callback, and restore it in the "after" callback if the result is a failure.
</details>

<details>
<summary>Hint 3 (code sketch)</summary>

```svelte
<form method="POST" action="?/delete"
  use:enhance={() => {
    deletingId = note.id;
    return async ({ result, update }) => {
      deletingId = null;
      if (result.type === 'success') {
        showUndo(note);
      }
      await update();
    };
  }}
>
```
</details>

## Solution

<details>
<summary>Full solution</summary>

```svelte
<!-- src/routes/notes/+page.svelte (enhanced version) -->
<script lang="ts">
  import { enhance } from '$app/forms';
  import type { PageData, ActionData } from './$types';

  let { data, form }: { data: PageData; form: ActionData } = $props();

  let creating = $state(false);
  let updatingId = $state<number | null>(null);
  let deletingId = $state<number | null>(null);

  let undoNote = $state<{ id: number; title: string } | null>(null);
  let undoTimer = $state<ReturnType<typeof setTimeout> | null>(null);

  function showUndo(note: { id: number; title: string }) {
    undoNote = note;
    if (undoTimer) clearTimeout(undoTimer);
    undoTimer = setTimeout(() => { undoNote = null; }, 3000);
  }

  async function handleUndo() {
    if (!undoNote) return;
    await fetch('?/default', {
      method: 'POST',
      body: new URLSearchParams({ title: undoNote.title })
    });
    undoNote = null;
    if (undoTimer) clearTimeout(undoTimer);
  }
</script>

<div class="notes-page">
  <h1>Notes (Enhanced)</h1>

  {#if form?.success}
    <div class="toast success" role="alert">{form.message}</div>
  {/if}

  <form method="POST"
    use:enhance={() => {
      creating = true;
      return async ({ update }) => {
        creating = false;
        await update({ reset: true });
      };
    }}
    class="create-form"
  >
    <input type="text" name="title" placeholder="New note title..." required disabled={creating} />
    <button type="submit" disabled={creating}>
      {creating ? 'Creating...' : 'Add Note'}
    </button>
  </form>

  <ul class="note-list">
    {#each data.notes as note (note.id)}
      <li class="note-item" class:deleting={deletingId === note.id}>
        <form method="POST" action="?/update"
          use:enhance={() => {
            updatingId = note.id;
            return async ({ update }) => {
              updatingId = null;
              await update();
            };
          }}
          class="edit-form"
        >
          <input type="hidden" name="id" value={note.id} />
          <input type="text" name="title" value={note.title} />
          <button type="submit" class="btn-update" disabled={updatingId === note.id}>
            {updatingId === note.id ? 'Saving...' : 'Save'}
          </button>
        </form>

        <form method="POST" action="?/delete"
          use:enhance={() => {
            deletingId = note.id;
            return async ({ result, update }) => {
              if (result.type === 'success') {
                showUndo({ id: note.id, title: note.title });
              }
              deletingId = null;
              await update();
            };
          }}
        >
          <input type="hidden" name="id" value={note.id} />
          <button type="submit" class="btn-delete" disabled={deletingId === note.id}>
            {deletingId === note.id ? '...' : 'Delete'}
          </button>
        </form>
      </li>
    {/each}
  </ul>

  {#if undoNote}
    <div class="undo-toast" role="alert">
      Deleted "{undoNote.title}"
      <button class="undo-btn" onclick={handleUndo}>Undo</button>
    </div>
  {/if}
</div>

<style>
  .notes-page { max-inline-size: 36rem; margin-inline: auto; padding: var(--space-lg); }
  h1 { font-size: var(--text-2xl); margin-block-end: var(--space-lg); }

  .toast { padding: var(--space-sm) var(--space-md); border-radius: var(--radius-md); margin-block-end: var(--space-md); font-size: var(--text-sm); font-weight: 600; }
  .toast.success { background: oklch(90% 0.1 145); color: oklch(30% 0.1 145); }

  .create-form { display: flex; gap: var(--space-sm); margin-block-end: var(--space-xl); }
  .create-form input { flex: 1; padding: var(--space-sm); border: 1px solid var(--color-border); border-radius: var(--radius-sm); font-size: var(--text-base); background: var(--color-surface-1); color: var(--color-text); }
  .create-form button { padding: var(--space-sm) var(--space-md); background: oklch(55% 0.2 250); color: white; border: none; border-radius: var(--radius-sm); font-weight: 600; cursor: pointer; min-inline-size: 7rem; }
  .create-form button:disabled { opacity: 0.7; cursor: wait; }

  .note-list { list-style: none; padding: 0; display: flex; flex-direction: column; gap: var(--space-sm); }
  .note-item { display: flex; gap: var(--space-sm); align-items: center; background: var(--color-surface-2); border: 1px solid var(--color-border); border-radius: var(--radius-md); padding: var(--space-sm) var(--space-md); transition: opacity 200ms ease; }
  .note-item.deleting { opacity: 0.4; }

  .edit-form { display: flex; gap: var(--space-xs); flex: 1; }
  .edit-form input[type='text'] { flex: 1; padding: var(--space-xs) var(--space-sm); border: 1px solid transparent; border-radius: var(--radius-sm); background: transparent; color: var(--color-text); }

  .btn-update, .btn-delete { padding: var(--space-2xs) var(--space-sm); border: none; border-radius: var(--radius-sm); font-size: var(--text-xs); font-weight: 600; cursor: pointer; }
  .btn-update { background: var(--color-surface-3); color: var(--color-text); min-inline-size: 4rem; }
  .btn-delete { background: oklch(90% 0.1 25); color: oklch(40% 0.15 25); }
  .btn-update:disabled, .btn-delete:disabled { opacity: 0.6; cursor: wait; }

  .undo-toast { position: fixed; inset-block-end: var(--space-lg); inset-inline-start: 50%; transform: translateX(-50%); display: flex; align-items: center; gap: var(--space-md); padding: var(--space-sm) var(--space-lg); background: var(--color-surface-1); border: 1px solid var(--color-border); border-radius: var(--radius-md); box-shadow: var(--shadow-lg); font-size: var(--text-sm); }
  .undo-btn { background: oklch(55% 0.2 250); color: white; border: none; border-radius: var(--radius-sm); padding: var(--space-2xs) var(--space-sm); font-weight: 600; cursor: pointer; }
</style>
```

### Explanation

`use:enhance` transforms a standard HTML form into a progressively enhanced one. Without JavaScript, the form still works via full-page POST. With JavaScript, `use:enhance` intercepts the submission, sends it via `fetch`, and applies the result without a page reload. The custom callback pattern gives you a "before" phase (set loading states) and an "after" phase (clear states, handle results). The undo pattern saves the deleted item's data before the server processes the request, then offers a time-limited restore option. This is the core of production-grade form UX in SvelteKit.
</details>
