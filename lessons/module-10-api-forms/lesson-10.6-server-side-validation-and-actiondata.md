---
module: 10
lesson: 10.6
title: Server-side validation and ActionData
duration: 55 minutes
prerequisites:
  - Lesson 10.5 — `use:enhance`
learning_objectives:
  - Validate form data on the server with Valibot inside an action
  - Return typed validation errors with `fail(status, data)`
  - Consume the errors in the component via the `ActionData` type from `./$types`
  - Repopulate form fields after a failed submit
  - Update (edit) a resource through an action, completing the CRUD loop
status: ready
---

# Lesson 10.6 — Server-side validation and `ActionData`

## 1. Concept — The server is the source of truth; the component is typed against it

### 1.1 Why server-side validation is non-negotiable

Any validation you do in the browser is a *convenience*. The server must re-validate everything, because a determined user can submit any payload they like with `curl` or a browser extension. This is true whether you use remote functions (Module 9B) or classic form actions. The difference is where the validation lives: `form()` validates automatically from a Valibot schema; classic actions validate manually inside the handler.

### 1.2 A Valibot schema inside an action

```ts
// src/routes/notes/+page.server.ts
import * as v from 'valibot';
import { fail, type Actions } from '@sveltejs/kit';
import { addNote, updateNote } from './_lib/notes-store';

const noteSchema = v.object({
    title: v.pipe(v.string(), v.minLength(1, 'Title is required'), v.maxLength(100)),
    body: v.pipe(v.string(), v.minLength(1, 'Body is required'), v.maxLength(1000))
});

export const actions: Actions = {
    update: async ({ request }) => {
        const data = await request.formData();
        const raw = Object.fromEntries(data) as Record<string, unknown>;
        const result = v.safeParse(noteSchema, raw);
        if (!result.success) {
            return fail(400, {
                values: raw,
                issues: result.issues.map((i) => ({ field: String(i.path?.[0]?.key), message: i.message }))
            });
        }
        const id = data.get('id');
        if (typeof id !== 'string') return fail(400, { issues: [{ field: 'id', message: 'Id required' }] });
        updateNote(id, result.output.title, result.output.body);
        return { ok: true };
    }
};
```

Three things matter here.

- `Object.fromEntries(data)` is a convenient way to turn `FormData` into a plain object for the validator. It loses files, but for text fields it is fine.
- `v.safeParse` returns a discriminated result — `{ success: true, output }` or `{ success: false, issues }`. The issues include the path that failed, which you turn into a per-field map on the way back.
- `fail(400, data)` returns the errors as the `form` prop. Everything in `data` is typed automatically from the action's return.

### 1.3 `ActionData` — the typed return value

Svelte generates a type called `ActionData` in `./$types` for every `+page.server.ts` that exports `actions`. It is the **union of every possible return value** of every named action, including `fail(...)` results. You use it to type the `form` prop in the component:

```svelte
<script lang="ts">
    import type { PageProps } from './$types';
    let { data, form }: PageProps = $props();
    // form has type ActionData — the union of all possible action returns.
</script>
```

Because it is a discriminated union, you narrow it with normal TypeScript. If every action includes a `which: 'create' | 'update' | 'remove'` discriminator (as we set up in Lesson 10.4), the component can safely branch on it and see only the relevant fields.

### 1.4 Repopulating fields after a failed submit

When a submit fails, you want the user to see their own invalid input — not an empty form. Two parts:

1. In the action, include the raw values in the `fail()` data: `fail(400, { values: raw, issues: [...] })`.
2. In the component, read them back: `<input name="title" value={form?.values?.title ?? ''}>`.

For file inputs this is impossible (you cannot preserve file data across a failed submit). For every other field it is polite and expected.

### 1.5 The full CRUD loop

This lesson is where the Notes app reaches feature parity with a grown-up CRUD app: **Create**, **Read**, **Update**, **Delete**. Update is a third named action, and it comes with full server-side validation. Lesson 10.6 is the "everything fits together" lesson of Module 10 — everything after this is specialisation (env vars, file uploads) and tooling.

### 1.6 What SvelteKit does under the hood

The validation and ActionData pipeline works as follows:

1. **Form submits.** The browser sends `FormData` to the action URL.
2. **Handler reads data.** `await request.formData()` returns the raw form data. Each field is `string | File | null`.
3. **Validation runs.** `v.safeParse(schema, data)` checks every field. If any fail, the handler returns `fail(400, { values, issues })`.
4. **SvelteKit processes the return.** For `fail()`, SvelteKit sets the HTTP status to 400 and serialises the data with `devalue`. For a plain return, it sets status 200 and serialises.
5. **Component receives `form`.** The serialised data becomes the `form` prop. `ActionData` (the generated type) is the union of all possible returns from all named actions.
6. **The page re-renders.** If `use:enhance` is active, only the `form` prop changes. Without it, the full page reloads with the new `form`.

### 1.7 The TypeScript angle — ActionData deep dive

`ActionData` is auto-generated and represents the **union** of all possible action returns:

```ts
// If your actions are:
export const actions: Actions = {
    create: async () => {
        // Can return:
        return fail(400, { values: {...}, issues: [...] });
        // Or:
        return { ok: true, which: 'create' as const };
    },
    update: async () => {
        return fail(400, { values: {...}, issues: [...] });
        // Or:
        return { ok: true, which: 'update' as const };
    }
};

// ActionData becomes:
type ActionData =
    | { values: Record<string, unknown>; issues: { field: string; message: string }[] }
    | { ok: true; which: 'create' }
    | { ok: true; which: 'update' }
    | null;
```

The `null` case represents "no action has been submitted yet" (initial page load). Always check for `null` before accessing `form` properties.

### 1.8 Comparison: Valibot validation in actions vs remote forms

| Aspect | Valibot in form actions | Valibot in remote `form()` |
| --- | --- | --- |
| Where schema is defined | Inside the action handler | As first argument to `form()` |
| Validation timing | Manual (`v.safeParse(schema, data)`) | Automatic (before handler runs) |
| Error format | Custom (you build the issues array) | Standardised (`fields.name.issues()`) |
| Field repopulation | Manual (`fail(400, { values: raw })`) | Automatic (via `.as('text')` state) |
| Client preflight | Manual (`onsubmit` handler) | Built-in (`.preflight(schema)`) |
| TypeScript flow | Manual (safeParse result -> fail data) | Automatic (schema -> handler param) |

> **In production sidebar.** We converted our most complex form — a 14-field product editor — from manual validation in a form action to a Valibot schema. The manual version was 62 lines of `typeof` checks, range validations, and regex matches. The Valibot version was 18 lines of schema definition plus 3 lines of `safeParse` / `fail` logic. The schema also serves as documentation: any developer can read the schema and know exactly what the form accepts. We kept the form action (did not migrate to remote `form()`) because the page already had `use:enhance` wired up and the migration cost was not worth it for an existing, working form.

### 1.9 Common interview question

**Q: "How does SvelteKit's `ActionData` type work, and why is a discriminated union important when a page has multiple form actions?"**

**Model answer:** `ActionData` is a TypeScript type auto-generated by SvelteKit for every page with an `actions` export. It represents the union of all possible return values from all named actions, plus `null` for the initial state. When a page has multiple actions (create, update, delete), each can return a different shape. Without a discriminator, the component cannot tell which action produced the current `form` value — TypeScript shows the full union and you cannot access action-specific fields safely. Adding a literal discriminator field (like `which: 'create' as const`) lets TypeScript narrow the union in `{#if}` blocks: checking `form.which === 'create'` narrows the type to just the create action's return, making action-specific fields accessible without optional chaining or type casts.

## Deep Dive

**Multi-value fields.** `Object.fromEntries(formData)` loses multi-value fields. If a form has multiple checkboxes with the same `name`, only the last value survives. Use `formData.getAll(name)` for multi-select and checkbox groups:

```ts
const categories = formData.getAll('category');
// categories: FormDataEntryValue[] — an array of strings
```

Validate with Valibot's array validator:

```ts
const schema = v.object({
    categories: v.pipe(v.array(v.string()), v.minLength(1, 'Select at least one'))
});
```

**The `fail()` vs `error()` distinction.** Both communicate failure, but to different parts of the system:
- `fail(400, data)` returns to the same page as `form` data. The user sees their form with error messages. No navigation happens.
- `error(400, message)` renders the nearest `+error.svelte`. The form disappears. The user sees an error page.

Use `fail()` for validation errors (the user can fix their input). Use `error()` for system errors (the user cannot do anything about it).

## Going Deeper

- **SvelteKit docs:** [Form actions — Validation](https://svelte.dev/docs/kit/form-actions#Validation) covers `fail()` and `ActionData`.
- **Advanced pattern:** Create a `validateFormData<T>(schema: Schema<T>, formData: FormData): { ok: true; data: T } | { ok: false; fail: ActionFailure }` utility that standardises the validation + fail pattern across all actions.
- **Challenge:** Create an action that validates with Valibot and returns all issues (not just the first one). Render each issue next to its corresponding field. Use Valibot's `path` on each issue to determine which field it belongs to.

## 2. Style it — An inline edit form per note

Per-page brand is a muted bronze. When the user clicks "Edit" on a note, the card flips into an inline form with the same PE7 tokens. Saving clears the edit state; cancelling reverts.

## 3. Interact — The issues array, the fields, the render

The entire mental model is: server validates → `fail()` with values and issues → component reads `form` → render errors next to the fields. Trace through one field (the title) from the schema definition to the rendered error message. Once you see the thread, every other field follows the same pattern.

## 4. Mini-build — Notes app, part 4: edit with validation

### File tree

```
src/routes/modules/10-api-forms/06-validation-actiondata/
├── +page.svelte
├── +page.server.ts          (create, update, remove actions + schema)
└── _lib/notes-store.ts
```

### DevTools moment

1. Click **Edit** on a note. The card becomes an inline form.
2. Clear the title. Click **Save**. The form re-renders with "Title is required" next to the title field — the values you typed are still there.
3. Enter a valid title and body. Click **Save**. The card flips back to display mode with the new values.
4. Disable JavaScript. Repeat. Every step still works; the only difference is a full-page reload per action.

## 5. Check your understanding

<details>
<summary><strong>Q1.</strong> What is <code>ActionData</code> and where does it come from?</summary>

It is a TypeScript type generated in `./$types` for every page with an `actions` export. It is the union of every possible return value from every action and becomes the type of the `form` prop.
</details>

<details>
<summary><strong>Q2.</strong> How do you repopulate fields after a failed submit?</summary>

Include the raw values in the `fail()` data and read them back via `form?.values?.title` (or similar) in the component.
</details>

<details>
<summary><strong>Q3.</strong> Why must server-side validation exist even if you already preflight on the client?</summary>

Because anyone can bypass the client — with curl, with a disabled JavaScript runtime, with a browser extension. The server is the only trustworthy enforcer.
</details>

<details>
<summary><strong>Q4.</strong> What does <code>Object.fromEntries(formData)</code> lose?</summary>

Files. And multi-value fields (like multi-select) — those need `formData.getAll(name)`.
</details>

<details>
<summary><strong>Q5.</strong> Can you use Valibot inside a form action without installing anything extra?</summary>

Yes — Valibot is already a project dependency for Module 9B's remote forms. The same package serves both styles.
</details>

## 6. Common mistakes

- **Casting <code>FormData</code> directly to your interface.** You are lying to the compiler. Always run the data through <code>safeParse</code>.
- **Forgetting to include values in the <code>fail</code> payload.** Users lose their work. Always send back at least the text fields they typed.
- **Reading <code>form?.issues[0]</code> without optional chaining.** If no action ran yet, <code>form</code> is <code>null</code>.
- **Mixing a default action with named actions.** SvelteKit will refuse. Pick one style.

## 7. What's next

Lesson 10.7 steps sideways into environment variables — how to give the form actions access to secrets without leaking them to the browser.
