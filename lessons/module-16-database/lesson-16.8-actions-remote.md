---
module: 16
lesson: 16.8
title: Database in form actions and remote functions
duration: 55 minutes
prerequisites:
  - Lesson 16.7 (database in load functions)
  - Module 10 form actions (actions export, use:enhance)
  - Module 9b remote functions (command type)
  - Lesson 16.6 (relations for multi-table writes)
learning_objectives:
  - Write form actions that insert, update, and delete database records
  - Wrap multi-table writes in db.transaction() for atomicity
  - Expose the same CRUD operations as remote functions with the command type
  - Validate form data before database operations and return typed errors
  - Combine load functions with actions on the same +page.server.ts file
status: ready
---

# Lesson 16.8 — Database in form actions and remote functions

> **Atomic lesson format** — every lesson in this course follows the same four parts: **Concept**, **Style it**, **Interact**, **Mini-build**.

## 1. Concept — Writing to the database from user interactions

### 1.1 What the problem is

Lesson 16.7 solved reading: load functions query the database and pass data to components. But a notes app also needs to create, edit, and delete notes. These writes must come from user actions — form submissions, button clicks, inline edits. The challenge is doing this safely: validate input, handle errors, maintain data integrity across related tables, and keep the page in sync with the database.

### 1.2 Form actions with database writes

Form actions (the `actions` export in `+page.server.ts`) are SvelteKit's primary mechanism for handling form submissions. They work without JavaScript and re-render the page with fresh data after each action:

```typescript
import { fail } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { notes } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
    return { notes: db.query.notes.findMany({ with: { user: true } }) };
};

export const actions: Actions = {
    create: async ({ request }) => {
        const formData = await request.formData();
        const title = formData.get('title');
        const content = formData.get('content');

        if (typeof title !== 'string' || title.trim().length === 0) {
            return fail(400, { error: 'Title is required', title: '', content: content?.toString() ?? '' });
        }

        const inserted = db.insert(notes).values({
            title: title.trim(),
            content: typeof content === 'string' ? content : '',
            userId: 1
        }).returning().get();

        return { success: true, noteId: inserted.id };
    },

    delete: async ({ request }) => {
        const formData = await request.formData();
        const id = Number(formData.get('id'));

        if (Number.isNaN(id)) {
            return fail(400, { error: 'Invalid note ID' });
        }

        db.delete(notes).where(eq(notes.id, id)).run();
        return { deleted: true };
    }
};
```

After the action completes, SvelteKit automatically re-runs the `load` function and the page re-renders with fresh data. The user sees the updated list without any manual refetch logic.

### 1.3 Transactions — atomic multi-table writes

When creating a note with tags, you need to write to both the `notes` table and the `notes_tags` junction table. If the junction insert fails, you do not want an orphaned note. This is where **transactions** solve the problem:

```typescript
db.transaction((tx) => {
    const note = tx.insert(notes).values({
        title: 'Tagged note',
        content: 'Has tags',
        userId: 1
    }).returning().get();

    for (const tagId of selectedTagIds) {
        tx.insert(notesTags).values({ noteId: note.id, tagId }).run();
    }
});
```

If any operation inside the transaction throws an error, all writes are rolled back — the note disappears, the junction rows disappear, and the database returns to its previous state. This is the "A" (Atomicity) in ACID.

The `tx` parameter is a transaction-scoped database handle. Use it instead of `db` for all operations that must be atomic. Operations on `tx` are not visible to other queries until the transaction completes successfully.

### 1.4 Remote functions — the client-side alternative

SvelteKit remote functions (Module 9b) let you call server-side code from the client without form submissions. For a notes app, this enables features like inline editing, optimistic UI, and real-time saves:

```typescript
// src/routes/notes/+page.server.ts
import { command } from '@sveltejs/kit';

export const createNote = command(async (title: string, content: string) => {
    if (title.trim().length === 0) {
        return { error: 'Title is required' } as const;
    }

    const note = db.insert(notes).values({
        title: title.trim(),
        content,
        userId: 1
    }).returning().get();

    return { success: true, note } as const;
});

export const deleteNote = command(async (id: number) => {
    db.delete(notes).where(eq(notes.id, id)).run();
    return { deleted: true } as const;
});
```

On the client side, these functions are called like regular async functions:

```svelte
<script lang="ts">
    import { createNote, deleteNote } from './+page.server.ts';

    async function handleCreate() {
        const result = await createNote('My note', 'Content here');
        if (result.success) {
            // Update UI or invalidate data
        }
    }
</script>
```

Remote functions are typed end-to-end — the parameters and return type flow from the server definition to the client call site. No manual API types needed.

### 1.5 When to use form actions vs remote functions

| Scenario | Use form actions | Use remote functions |
|----------|:---:|:---:|
| Must work without JavaScript | Yes | No |
| Inline editing (no full-page reload) | No | Yes |
| File uploads | Yes | Possible but more complex |
| Simple CRUD forms | Yes | Either |
| Real-time save-as-you-type | No | Yes |
| Accessible by default | Yes | Requires more work |

The best approach is **both**: build with form actions first (progressive enhancement), then layer remote functions on top for enhanced UX when JavaScript is available.

### 1.6 The complete pattern — load + actions + remote on one page

A single `+page.server.ts` can export `load`, `actions`, and remote functions. The load provides initial data, actions handle form submissions, and remote functions enable enhanced client interactions. All three share the same database connection and schema types:

```typescript
// All in one file: +page.server.ts
export const load: PageServerLoad = async () => { /* read */ };
export const actions: Actions = { create: async () => { /* write */ } };
export const createNote = command(async () => { /* write from client */ });
```

## 2. Style it — The full CRUD form

The mini-build has a complete create/edit/delete interface. PE7 styling:

- Create form with `var(--color-brand)` left border accent (same pattern as Module 10)
- Delete buttons: `var(--color-error)` background, `min-block-size: 44px` touch target
- Success/error toasts with appropriate semantic colors
- Form fields with clear focus states using `var(--color-brand)` outline
- Per-page personality: `--color-brand: oklch(62% 0.18 35)` — a warm coral suggesting action and creation

## 3. Interact — Discriminated unions for action results

The TypeScript concept is **discriminated unions** for action return types. Form actions can return different shapes depending on what happened — a validation error, a success, or a server error. Using a discriminated union makes the component code handle each case safely:

```typescript
// The action returns one of these shapes:
type ActionResult =
    | { error: string; title: string; content: string }  // validation failed
    | { success: true; noteId: number }                   // created successfully
    | { deleted: true };                                   // deleted successfully

// In the component:
if (form?.error) {
    // TypeScript narrows: form is { error: string; title: string; content: string }
    showError(form.error);
} else if (form?.success) {
    // TypeScript narrows: form is { success: true; noteId: number }
    showSuccess(`Created note #${form.noteId}`);
}
```

The key property (`error`, `success`, `deleted`) acts as a discriminant — TypeScript uses it to narrow the type in each branch. This eliminates the need for type assertions and ensures you handle every possible case.

## 4. Mini-build — Full CRUD notes page with actions and remote functions

**File:** `src/routes/modules/16-database/08-actions-remote/+page.server.ts`
**File:** `src/routes/modules/16-database/08-actions-remote/+page.svelte`

This page combines everything: a load function that fetches notes, form actions for create and delete, and the same operations available as remote functions. The student experiences both the progressive-enhancement flow (forms work without JS) and the enhanced flow (remote calls update the UI inline).

### Run it

```bash
pnpm dev
```

Navigate to `http://localhost:5173/modules/16-database/08-actions-remote`.

### DevTools verification

1. Disable JavaScript in DevTools (Settings → Debugger → Disable JavaScript). Create and delete notes using the forms. Everything still works — progressive enhancement in action.
2. Re-enable JavaScript. Now creates happen inline without full-page reloads (remote functions handle the enhanced path).
3. Open the Network tab. Form submissions show as POST requests to the same URL. Remote function calls show as POST requests with a specific content type.
4. Check the database file after several operations. Use `sqlite3 data/dev.db "SELECT * FROM notes"` to verify records match what you see in the UI.

## 5. Check your understanding

<details>
<summary><strong>Q1.</strong> Why does SvelteKit re-run the load function after a form action completes?</summary>

To keep the page data in sync with the database. The action modified the data (inserted, updated, or deleted a row), so the load function must re-query to get the current state. SvelteKit handles this automatically — after an action completes, it calls load again and sends the fresh data to the component. The user sees the updated state without manual refetch code.
</details>

<details>
<summary><strong>Q2.</strong> What is the purpose of wrapping multi-table writes in <code>db.transaction()</code>?</summary>

Transactions guarantee atomicity — all operations inside succeed together or fail together. If inserting a note succeeds but inserting its tag relationships fails (e.g., a foreign key violation), the transaction rolls back the note insert too. Without a transaction, you could end up with a note that has no tags or orphaned junction rows, violating data integrity.
</details>

<details>
<summary><strong>Q3.</strong> What does <code>fail(400, { error: 'Title required' })</code> do differently from <code>return { error: 'Title required' }</code>?</summary>

`fail(400, data)` sets the HTTP status code to 400 (Bad Request) and makes the data available as the `form` prop in the component. A plain `return { ... }` sets a 200 status. The difference matters for accessibility (screen readers announce error states), for monitoring (4xx responses show in error tracking), and for `use:enhance` callbacks that distinguish success from failure.
</details>

<details>
<summary><strong>Q4.</strong> Describe a scenario where you would choose remote functions over form actions.</summary>

An inline note editor where the user types and the content saves automatically every few seconds (autosave). Form actions require a full form submission and page rerender, which would interrupt the user's typing. Remote functions let you call `saveNote(id, content)` from a debounced input handler without any visible page navigation — the save happens silently in the background.
</details>

<details>
<summary><strong>Q5.</strong> Why should you validate form data on the server even if you also validate on the client?</summary>

Client-side validation can be bypassed — a user can disable JavaScript, use curl, or modify the DOM. The server is the only trustworthy validation layer. If invalid data reaches the database (e.g., an empty title for a NOT NULL column), SQLite throws a constraint error that is harder to present to the user than a clean validation message. Always validate on the server; client validation is a UX convenience, not a security measure.
</details>

## 6. Common mistakes

- **Forgetting to convert FormData values to the right type.** `formData.get('id')` returns `string | null`, not `number`. You must explicitly convert: `const id = Number(formData.get('id'))` and check `Number.isNaN(id)`. Passing a string to `eq(notes.id, '5')` causes a type error because the schema declares `id` as `integer`.
- **Not handling the transaction callback error.** If `db.transaction()` throws (e.g., a constraint violation inside), you need to catch it and return a meaningful error to the user. An unhandled throw inside an action causes a 500 error with no useful message.
- **Mutating data after returning it from load.** Load data is serialized and sent to the client. If you return a reference to an object and then mutate it in an action, the mutation does not reach the client. Always re-query in load rather than trying to reuse objects across load/action boundaries.
- **Using `db` instead of `tx` inside a transaction.** Operations on the global `db` instance are not part of the transaction. If you accidentally write `db.insert(...)` instead of `tx.insert(...)` inside the callback, that insert commits immediately regardless of whether the transaction rolls back. Always use the `tx` parameter.

## 7. What's next

This completes Module 16. You now have a fully typed, database-backed SvelteKit application with schema definitions, migrations, CRUD operations, relational queries, and both form actions and remote functions for writes. The module project brings it all together as a production-quality Full-Stack Notes App.
