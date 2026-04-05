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
