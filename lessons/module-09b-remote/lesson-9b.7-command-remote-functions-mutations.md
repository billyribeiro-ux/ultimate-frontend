---
module: 9B
lesson: 9B.7
title: command remote functions — mutations
duration: 60 minutes
prerequisites:
  - Lesson 9B.5 — `form` remote functions
  - Module 2 — `$state`
learning_objectives:
  - Declare a `command()` remote function with a Valibot schema
  - Call it from a Svelte event handler as a plain async function
  - Implement a create/update/delete flow on an in-memory store
  - Apply optimistic UI updates with `.withOverride()`
  - Explain why `command` should not be the first choice — prefer `form` when possible
status: ready
---

# Lesson 9B.7 — `command` remote functions — mutations

## 1. Concept — When the mutation is not a form

### 1.1 The job of `command`

`form` is for HTML forms that degrade gracefully. `command` is for everything else: a "delete" button in a dropdown, a "mark as read" checkbox in a notification list, a keyboard shortcut that renames a file. Commands are **JS-only**. If JavaScript fails to load, a command cannot run. This is fine for interactive UI affordances; it is not fine for the primary "submit this order" action on a checkout page.

> **Rule of thumb:** If the mutation lives inside a `<form>` a user could conceivably submit without JS, use `form`. Otherwise, use `command`.

```ts
// src/routes/modules/09b-remote/07-command-mutations/notes.remote.ts
import * as v from 'valibot';
import { query, command } from '$app/server';

export interface Note {
    readonly id: string;
    readonly text: string;
    readonly createdAt: Date;
}

let notes: Note[] = [];

export const listNotes = query(async (): Promise<Note[]> => notes);

export const addNote = command(v.pipe(v.string(), v.minLength(1)), async (text) => {
    const note: Note = { id: crypto.randomUUID(), text, createdAt: new Date() };
    notes = [note, ...notes];
    await listNotes().refresh();
    return note;
});

export const deleteNote = command(v.string(), async (id) => {
    notes = notes.filter((n) => n.id !== id);
    await listNotes().refresh();
});
```

Three things to notice.

- Commands are imported just like queries and called from any event handler as normal async functions.
- Inside the handler you can call `listNotes().refresh()` on the **server** side of the query to push fresh data back to every client rendering that query. This is **single-flight mutation** — one HTTP request mutates *and* refreshes the reading query.
- Unlike `form`, commands do not auto-invalidate everything. You refresh only what you mean to.

### 1.2 Calling a command from the client

```svelte
<script lang="ts">
    import { addNote, deleteNote, listNotes } from './notes.remote';
    let draft: string = $state('');
</script>

<form onsubmit={async (e) => { e.preventDefault(); if (draft) { await addNote(draft); draft = ''; } }}>
    <input bind:value={draft} />
    <button>Add</button>
</form>

{#await listNotes() then notes}
    <ul>
        {#each notes as n (n.id)}
            <li>
                {n.text}
                <button onclick={() => deleteNote(n.id)}>×</button>
            </li>
        {/each}
    </ul>
{/await}
```

### 1.3 Optimistic UI with `.withOverride`

Network latency makes mutations feel slow. An **optimistic UI** updates the local view *before* the server responds, rolling back if the server rejects. Remote functions support this directly on `command` results:

```svelte
<button onclick={async () => {
    await deleteNote(n.id).updates(
        listNotes().withOverride((current) => current.filter((x) => x.id !== n.id))
    );
}}>×</button>
```

`withOverride` takes a pure function that transforms the current cached value into the predicted post-mutation value. The override is used immediately, the real server update runs in the background, and if the server returns something different the cache is reconciled when the command completes. The user sees instant feedback.

### 1.4 When not to command

- **Anything the user should be able to do without JS.** Use `form`.
- **Anything that cascades across many queries.** Use `form` for the automatic invalidation, or call `refresh()` on each query explicitly.
- **Anything that takes more than a few seconds.** Show a progress state; consider a background job.

## 2. Style it — A notes list with fade-out on delete

Per-page brand is a warm amber. Deletion uses the Svelte `fade` transition with `out:fade` respecting reduced motion — the element disappears in sync with the optimistic update.

## 3. Interact — Optimistic delete

Delete a note. The item should vanish *instantly*, not 200 ms later. If you remove the `.updates(listNotes().withOverride(...))` call and rely on refresh alone, the delay becomes visible. Toggle it on and off to feel the difference.

## 4. Mini-build — In-memory notes CRUD

### File tree

```
src/routes/modules/09b-remote/07-command-mutations/
├── +page.svelte       (list + add + delete with optimistic UI)
└── notes.remote.ts    (listNotes query + addNote/deleteNote commands)
```

### DevTools moment

1. Add a note. One network request fires (`addNote`). Open its response: the command returned the new note, and the listNotes cache updated in the same response.
2. Delete a note. Same: one request, the list refreshes instantly because `withOverride` ran before the round trip.
3. Throttle the network to "Slow 3G" in DevTools and try again. The optimistic update still feels instant; only the loading spinner on the delete button betrays the latency.

## 5. Check your understanding

<details>
<summary><strong>Q1.</strong> Why should you prefer <code>form</code> over <code>command</code> when possible?</summary>

`form` works without JavaScript. `command` requires JS. If the mutation can be expressed as an HTML form, that is the more robust choice.
</details>

<details>
<summary><strong>Q2.</strong> How do you refresh a query from inside a command handler?</summary>

Call the query function directly on the server — e.g. `await listNotes().refresh()`. The refreshed data rides back on the same HTTP response as the command result.
</details>

<details>
<summary><strong>Q3.</strong> What does <code>.withOverride(...)</code> do?</summary>

It applies a pure function to the cached query value immediately, producing a "predicted" value for the UI to render while the server is still working.
</details>

<details>
<summary><strong>Q4.</strong> What happens if an optimistic override turns out to be wrong?</summary>

When the server responds, SvelteKit reconciles the cache with the real value. The UI flickers to the correct state. For most mutations this only happens when the server rejects the operation.
</details>

<details>
<summary><strong>Q5.</strong> Is a <code>command</code> safer than a <code>+server.ts</code> POST endpoint?</summary>

They have identical security exposure — both are HTTP endpoints. The command simply gives you better ergonomics (type-safe calls, Valibot validation). Auth and authorisation logic are still entirely your responsibility.
</details>

## 6. Common mistakes

- **Calling commands during render.** Commands mutate state and cannot run during SSR or component initialisation. Call them from event handlers only.
- **Forgetting to refresh affected queries.** Commands do not auto-invalidate. If you add a note but do not `refresh()` the list, the UI goes stale.
- **Using an impure override function.** `withOverride` must be a pure function from old state to new state. Reading other reactive values inside it leads to weird cache behaviour.
- **Returning giant payloads from a command.** The return value is meant for small acknowledgements. Put large reads behind a `query` instead.

## 7. What's next

Lesson 9B.8 goes deeper into `query.set()` and `query.refresh()` — the two mechanisms that turn server state into client-reactive state.
