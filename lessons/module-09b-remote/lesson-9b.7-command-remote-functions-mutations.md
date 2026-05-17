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

### 1.5 What SvelteKit does under the hood — the command RPC mechanism

A `command()` is a remote function optimized for mutations. Here is the full lifecycle:

**Build time:**

1. SvelteKit generates a unique endpoint for each exported command (e.g., `/_remote/addNote-m3n4o5`).
2. A client stub is generated that wraps the endpoint in a typed async function.

**Runtime — client calls `addNote('Buy milk')`:**

1. The client stub serialises the argument with `devalue` and sends a `POST` to the endpoint.
2. The server deserialises the argument, runs it through the Valibot schema, and calls the handler.
3. Inside the handler, `await listNotes().refresh()` triggers a re-run of the `listNotes` query handler on the same server request. The fresh query result is attached to the response.
4. The response contains **both** the command's return value **and** any refreshed query data. This is the "single-flight mutation" — one HTTP round trip carries the mutation result and the updated read data.
5. The client receives the response. The command's promise resolves with the return value. The `listNotes` cache is updated with the fresh data from the response.
6. Every component rendering `listNotes()` re-renders with the new data.

**The `.withOverride()` timeline:**

When optimistic UI is used, the timeline changes:

```
t=0ms    User clicks "Delete"
t=0ms    withOverride runs: listNotes cache updated optimistically (item removed)
t=0ms    UI re-renders — item disappears instantly
t=0ms    deleteNote(id) request starts
t=200ms  Server receives, validates, deletes, refreshes listNotes
t=400ms  Response arrives with real data
t=400ms  Cache reconciled: if server data matches override, nothing changes
         If server rejected (e.g., permission error), cache rolls back to pre-override state
```

The user sees the item disappear at t=0ms. The network latency (400ms) is invisible. If the server disagrees, the item reappears — a brief UI "flash" that is far preferable to a 400ms delay on every delete.

### 1.6 The TypeScript angle

Commands are fully typed from schema to return value:

```ts
export const addNote = command(
    v.pipe(v.string(), v.minLength(1)),  // Input type: string
    async (text) => {                     // text: string (inferred from schema)
        const note: Note = { id: crypto.randomUUID(), text, createdAt: new Date() };
        notes = [note, ...notes];
        await listNotes().refresh();
        return note;                      // Return type: Note
    }
);
```

On the client:

```ts
const result = await addNote('Buy milk');
// result: Note (typed from handler's return)
// result.id: string
// result.createdAt: Date (preserved by devalue)
```

The `withOverride` function is typed against the query's return type:

```ts
listNotes().withOverride(
    (current) => current.filter(x => x.id !== id)
    // current: Note[] (typed from listNotes query's return type)
    // return: Note[] (must match the query's type)
);
```

TypeScript ensures the override function returns the same type as the query. If you accidentally return `string[]` instead of `Note[]`, the compiler catches it.

### 1.7 Comparison: command vs form vs +server.ts POST

| Aspect | `command()` | Remote `form()` | Classic form action | `+server.ts` POST |
| --- | --- | --- | --- | --- |
| Progressive enhancement | No (JS required) | Yes | Yes | No (JS required) |
| Schema validation | Valibot (automatic) | Valibot (automatic) | Manual | Manual |
| Optimistic UI | `.withOverride()` | Not built-in | Not built-in | Manual |
| Single-flight mutation | `.refresh()` / `.set()` | Automatic invalidation | `invalidateAll()` | Manual |
| Best for | Button clicks, menus | HTML forms | Legacy form handling | Public endpoints |
| Type safety | Full | Full | Via `ActionData` | Manual |

> **In production sidebar.** We use commands for every mutation that does not involve an HTML form: deleting items, toggling favorites, reordering lists, marking notifications as read. The optimistic UI via `withOverride` makes these feel instant even on 3G connections. The single biggest win was our "mark all as read" button: without optimistic UI, the notification badges stayed visible for 300-500ms after clicking. With `withOverride`, all badges clear at t=0ms. Users noticed the difference and commented positively in feedback surveys. Small latency improvements compound into significantly better perceived performance.

### 1.8 Common interview question

**Q: "What is optimistic UI and how does SvelteKit's `command` support it? What happens if the server rejects the mutation?"**

**Model answer:** Optimistic UI updates the local view immediately when the user triggers a mutation, before the server responds. This makes the UI feel instant because the user does not wait for a network round trip. SvelteKit's `command` supports this via `.withOverride()`, which takes a pure function that transforms the current cached query value into the predicted post-mutation value. The override is applied to the cache immediately, causing all components reading that query to re-render with the predicted state. The actual server request runs in the background. When the server responds, the cache is reconciled: if the server's response matches the override, nothing changes. If the server rejected the mutation (e.g., permission denied, constraint violation), the cache rolls back to the pre-override value, and the UI updates to reflect the real state. The user sees a brief "flash" as the item reappears, which is the correct behavior — it communicates that the action failed.

## Deep Dive

**Single-flight mutation in detail.** The `await listNotes().refresh()` call inside a command handler is special. When called on the server, it does not make an HTTP request. It calls the query's handler function directly (in-process), gets the fresh result, and attaches it to the command's HTTP response. The client receives one response containing both the command result and the refreshed query data. This collapses what would normally be two round trips (command + query refresh) into one.

You can refresh multiple queries in a single command:

```ts
export const moveTask = command(schema, async ({ taskId, targetColumnId }) => {
    await db.tasks.update({ where: { id: taskId }, data: { columnId: targetColumnId } });
    await getColumn(sourceColumnId).refresh();
    await getColumn(targetColumnId).refresh();
    await getProjectSummary(projectId).refresh();
    // All three refreshes ride back on one HTTP response
});
```

**When NOT to use optimistic UI.** Optimistic UI is wrong when the prediction is unreliable. If there is a meaningful chance the server will reject the mutation (complex permission logic, race conditions with other users, quota limits), the rollback flash confuses users. In those cases, show a loading state instead and wait for the server's confirmation.

## Going Deeper

- **SvelteKit docs:** [Remote functions — command](https://svelte.dev/docs/kit/remote-functions#command) covers the full API.
- **Advanced pattern:** Create a `createOptimisticCommand` utility that wraps any command with automatic optimistic UI: it takes the command, the affected query, and an override function, and returns a new function that handles the `withOverride` wiring.
- **Challenge:** Create a command that intentionally fails 50% of the time (using `Math.random()`). Add optimistic UI via `withOverride`. Click the button rapidly and watch the cache reconcile. How many "rollback flashes" do you see? Does the final state always match the server state?

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
