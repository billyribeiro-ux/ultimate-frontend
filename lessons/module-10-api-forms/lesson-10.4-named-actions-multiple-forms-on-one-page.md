---
module: 10
lesson: 10.4
title: Named actions — multiple forms on one page
duration: 50 minutes
prerequisites:
  - Lesson 10.3 — default actions
learning_objectives:
  - Export multiple named actions from `+page.server.ts`
  - Target a named action with `action="?/name"` on a form
  - Use `formaction` on a button to override the parent form's target
  - Handle "which form was submitted?" when processing `form`
  - Recognise why named and default actions cannot coexist
status: ready
---

# Lesson 10.4 — Named actions — multiple forms on one page

## 1. Concept — When "one action per page" is not enough

### 1.1 The problem

The create form from Lesson 10.3 uses a `default` action. That is fine until you need more than one form on the page. A notes app needs at least **create**, **update**, and **delete**. If every form has `method="POST"` and no `action` attribute, SvelteKit cannot tell them apart.

### 1.2 Named actions

A `+page.server.ts` can export multiple named actions inside the same `actions` object:

```ts
// src/routes/notes/+page.server.ts
import { fail, type Actions } from '@sveltejs/kit';
import { addNote, deleteNote, updateNote, listNotes } from './_lib/notes-store';

export const actions: Actions = {
    create: async ({ request }) => {
        const data = await request.formData();
        const title = data.get('title');
        if (typeof title !== 'string' || !title) return fail(400, { error: 'Title required' });
        addNote(title, '');
        return { ok: true, which: 'create' as const };
    },
    remove: async ({ request }) => {
        const data = await request.formData();
        const id = data.get('id');
        if (typeof id !== 'string') return fail(400, { error: 'Id required' });
        deleteNote(id);
        return { ok: true, which: 'remove' as const };
    }
};
```

To target a named action from a form, set its `action` attribute to `?/<name>`:

```svelte
<form method="POST" action="?/create">
    <input name="title" />
    <button>Create</button>
</form>

<form method="POST" action="?/remove">
    <input type="hidden" name="id" value={note.id} />
    <button>Delete</button>
</form>
```

### 1.3 Named and default cannot coexist

The SvelteKit docs are explicit: once a page has named actions, you cannot also have a `default`. The reason is a subtle URL-state issue: if you POST to a named action without a redirect, the query parameter `?/name` sticks in the URL. The next default POST would unintentionally target the named action. To avoid the footgun, the framework enforces "all named or one default".

### 1.4 `formaction` on a button

One form can submit to different actions depending on which button was pressed. Use the HTML `formaction` attribute on the button itself:

```svelte
<form method="POST">
    <input name="email" />
    <button formaction="?/login">Log in</button>
    <button formaction="?/register">Register</button>
</form>
```

Both buttons share the same `<form>`, the same `FormData`, but they land on different handlers. This is a tiny feature with an outsized effect on page complexity — you do not need a separate `<form>` per button.

### 1.5 Which form returned `form`?

After a submit, the component's `form` prop contains the return value of *whichever* action ran. If two forms can both return data, add a discriminator field (`which: 'create' as const`) and branch on it in the component.

### 1.6 What SvelteKit does under the hood

Named actions use the URL query string as the action discriminator. Here is the full lifecycle:

**When the user submits a form with `action="?/create"`:**

1. The browser constructs a POST request to the current page URL with `?/create` appended as a query parameter.
2. SvelteKit's server receives the request. It reads the query string `?/create` and maps it to the `create` key in the `actions` object.
3. The `create` handler runs. It receives the full `RequestEvent` with access to `request.formData()`.
4. The handler returns a plain object (success) or `fail(status, data)` (validation error).
5. SvelteKit sets the `form` prop on the page component to the handler's return value.
6. The page re-renders. If `use:enhance` is active, only the `form` prop updates (no full reload). Without `use:enhance`, the page reloads entirely.

**The URL persistence issue:** After a form submission without a redirect, the URL shows `?/create`. This is why named and default actions cannot coexist — if a default action were to submit next, the stale `?/create` query would route to the wrong handler. The Svelte team prevents this by refusing to register both patterns on the same page.

### 1.7 The TypeScript angle

When multiple named actions exist, the `ActionData` type becomes a union of all possible return values:

```ts
// +page.server.ts
export const actions: Actions = {
    create: async () => {
        return { ok: true, which: 'create' as const, noteId: '123' };
    },
    remove: async () => {
        return { ok: true, which: 'remove' as const };
    }
};

// ActionData becomes:
// | { ok: true; which: 'create'; noteId: string }
// | { ok: true; which: 'remove' }
// | { error: string }  (from fail() calls)
// | null (no submission yet)
```

In the component, narrow the union with the discriminator:

```svelte
{#if form?.which === 'create'}
    <p>Note {form.noteId} created!</p>  <!-- noteId is available here -->
{:else if form?.which === 'remove'}
    <p>Note removed.</p>  <!-- noteId does NOT exist here — TypeScript knows -->
{/if}
```

This is a textbook discriminated union. The `which` field narrows the type, and TypeScript knows exactly which fields are available in each branch.

> **In production sidebar.** Our admin panel has a page with 4 named actions: create, update, archive, and delete. Each returns a different shape. Without discriminated unions, the component code was a mess of optional chaining and type casts. After adding `which` discriminators to every action return, TypeScript narrowed perfectly and the component became straightforward. The lesson: always add a literal discriminator field to every named action return value. It costs one field and saves hours of type wrangling.

### 1.8 Common interview question

**Q: "You have a page with a 'Create' form and a 'Delete' button on each item. How do you set up the form actions so SvelteKit knows which action to run?"**

**Model answer:** Export named actions from `+page.server.ts`: `create` and `remove` (or `delete` — though `delete` is a reserved word in JavaScript, it works as an object key). The create form uses `action="?/create"` and the delete form (or button with `formaction`) uses `action="?/remove"`. Each form's POST targets a different action by including the name in the query string. The `form` prop in the component receives whichever action's return value was most recent. Add a `which` discriminator field to each return value so the component can tell them apart. Named and default actions cannot coexist on the same page — once you have any named action, all actions must be named.

## Deep Dive

**The `formaction` pattern for inline buttons.** `formaction` on a `<button>` is a native HTML feature that overrides the parent form's `action`. This means one form can submit to different handlers:

```svelte
<form method="POST">
    <input name="id" type="hidden" value={note.id} />
    <button formaction="?/archive">Archive</button>
    <button formaction="?/remove">Delete</button>
</form>
```

Both buttons share the same hidden `id` input but submit to different actions. This is cleaner than having two separate forms side by side, especially when the buttons share form data.

**The URL state after submission.** After a named action runs, the URL changes to include `?/actionName`. This persists until the next navigation. It is harmless for the user (the page renders the same way) but can be surprising in automated tests. If you want a clean URL, redirect after the action: `throw redirect(303, '/notes')`.

## Going Deeper

- **SvelteKit docs:** [Form actions — Named actions](https://svelte.dev/docs/kit/form-actions#Named-actions) covers the `?/name` syntax.
- **Advanced pattern:** Create a `handleAction` wrapper that standardises the return shape across all named actions, ensuring every action returns `{ which, ok, data?, errors? }` for consistent component handling.
- **Challenge:** Create a page with three named actions. Use `formaction` on buttons inside a single form so all three share the same input fields. Which action runs when the user presses Enter in the form? (Answer: the first `<button>` in the form's DOM order, because the browser treats it as the default submit button.)

## 2. Style it — A two-column layout: create on the left, list + delete on the right

Per-page brand is a forest green. The create form is boxed in the brand colour; each note in the list carries its own tiny delete form aligned to the card's inline-end.

## 3. Interact — Two actions, one store

Lesson 10.4's mini-build adds a `remove` action to the Notes app. Delete a note: the page reloads (no JS) or re-renders (with JS), the note disappears, and the returned `form.which === 'remove'` lets you show a "Deleted" toast distinct from "Created".

## 4. Mini-build — Notes app, part 2: create + delete

### File tree

```
src/routes/modules/10-api-forms/04-named-actions/
├── +page.svelte
├── +page.server.ts              (actions: create, remove)
└── _lib/notes-store.ts          (reused from 10.3)
```

We reuse the shared store from Lesson 10.3's directory by copying it into this lesson's `_lib`. In a real app the store would live in `src/lib/server` and every lesson would import the same module.

### DevTools moment

1. Submit the create form. The URL becomes `/modules/10-api-forms/04-named-actions?/create` for a split second, then the page re-renders.
2. Click delete on a note. The URL briefly shows `?/remove`. The note disappears.
3. Disable JavaScript. Both forms still work. This is the point.

## 5. Check your understanding

<details>
<summary><strong>Q1.</strong> How do you target a named action from a form?</summary>

Set the form's `action` attribute to `?/<name>`, e.g. `action="?/create"`.
</details>

<details>
<summary><strong>Q2.</strong> Why can named and default actions not coexist?</summary>

Because `?/name` persists in the URL after a POST without redirect, and the next default POST would silently target the named action.
</details>

<details>
<summary><strong>Q3.</strong> What does <code>formaction</code> on a button do?</summary>

It overrides the parent form's `action` attribute for that button's submit. It lets one form submit to different handlers depending on which button was clicked.
</details>

<details>
<summary><strong>Q4.</strong> How do you know which named action produced the <code>form</code> prop?</summary>

Add a discriminator field in each action's return value (e.g. `which: 'create'`) and branch on it in the component.
</details>

<details>
<summary><strong>Q5.</strong> Can two different named actions return different shapes?</summary>

Yes, but the TypeScript type of `form` becomes the union of both shapes. Discriminated unions (via a literal `which` field) are the idiomatic way to narrow.
</details>

## 6. Common mistakes

- **Keeping `default` alongside named actions.** SvelteKit will refuse to run the page. Pick one style per route.
- **Forgetting <code>name="id"</code> on hidden inputs.** If you inline the note id as `value` without a name, it will not be in `FormData`.
- **Pluralising the action name inconsistently.** "delete" is a reserved word in some contexts; the Svelte team uses `remove` in examples. Pick a convention and stick to it.
- **Relying on <code>form.something</code> without a discriminator.** If two actions both return <code>ok: true</code>, you cannot tell them apart. Always add a <code>which</code> field.

## 7. What's next

Lesson 10.5 introduces `use:enhance`, which turns the full-page reload of form actions into a fetch-driven patch — progressive enhancement, the Svelte way.
