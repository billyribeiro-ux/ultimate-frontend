---
module: 9B
lesson: 9B.5
title: form remote functions — server-side form handling with Valibot
duration: 70 minutes
prerequisites:
  - Lesson 9B.3 — Valibot schemas
  - Module 5 — event handlers and forms
learning_objectives:
  - Declare a `form()` remote function with a Valibot schema
  - Spread a form object onto a `<form>` element with `{...formName}`
  - Use `fields.<name>.as('text' | 'number' | 'checkbox' | ...)` helpers
  - Render per-field `issues()` for validation errors
  - Add a client-side preflight schema for instant feedback
status: ready
---

# Lesson 9B.5 — `form` remote functions — server-side form handling with Valibot

## 1. Concept — Forms that work without JavaScript and better with it

### 1.1 The job of `form`

`form` is the remote function flavour you use when the user **submits an HTML form**. Unlike `command` (which we meet in 9B.7), `form` is bound to a real `<form>` element and degrades gracefully: if JavaScript fails to load, the browser does a full-page `POST`, and your server handler still runs. When JavaScript *is* available, SvelteKit progressively enhances the form — it intercepts the submit, sends the data with `fetch`, validates the response, and updates the page without a reload.

`form` takes two arguments:

1. A **Valibot schema** describing the shape of the form data.
2. An `async` handler that receives the validated data and returns a result (or throws a redirect).

```ts
// src/routes/modules/09b-remote/05-form-with-valibot/settings.remote.ts
import * as v from 'valibot';
import { form } from '$app/server';

const schema = v.object({
    displayName: v.pipe(v.string(), v.minLength(2, 'Too short'), v.maxLength(40, 'Too long')),
    theme: v.picklist(['light', 'dark', 'system']),
    notifications: v.optional(v.boolean(), false)
});

// Module-level store (resets on dev reload). In production, use a database.
let current = {
    displayName: 'Ada',
    theme: 'system' as 'light' | 'dark' | 'system',
    notifications: true
};

export const updateSettings = form(schema, async (data) => {
    current = { ...data };
    return { ok: true, saved: current };
});
```

### 1.2 Spreading the form into your markup

The `updateSettings` export is both the submit handler *and* an object you spread onto a `<form>` element:

```svelte
<script lang="ts">
    import { updateSettings } from './settings.remote';
    const { displayName, theme, notifications } = updateSettings.fields;
</script>

<form {...updateSettings}>
    <label>
        Display name
        <input {...displayName.as('text')} />
    </label>
    {#each displayName.issues() as issue}
        <p class="err">{issue.message}</p>
    {/each}

    <label>
        Theme
        <select {...theme.as('select')}>
            <option value="light">Light</option>
            <option value="dark">Dark</option>
            <option value="system">System</option>
        </select>
    </label>

    <label>
        <input {...notifications.as('checkbox')} />
        Email me
    </label>

    <button>Save</button>
</form>

{#if updateSettings.result?.ok}
    <p class="ok">Saved.</p>
{/if}
```

Three things happen when you spread `updateSettings` onto a `<form>`:

1. It sets `method="POST"` and an auto-generated `action` URL — the form works without JavaScript.
2. It attaches a Svelte [attachment](https://svelte.dev/docs/svelte/@attach) that intercepts submit events and sends the data over `fetch` when JS is available.
3. It wires up reactive `result`, `issues`, and `pending` properties that you can read from the template.

`fields.<name>.as('text')` returns the right `name`, `type`, `value`, and `aria-invalid` attributes for an `<input>`. If validation fails, every invalid field's `issues()` returns an array of `{ message: string }` objects — no `page.form.errors.displayName` wrangling, no prop drilling.

### 1.3 Client-side preflight for instant feedback

By default, validation runs on the server. That is correct, secure, and slow-feeling — the user has to wait for a round trip to learn that "Ada" is too short. You can add a **preflight** schema that runs in the browser before the submit fires:

```svelte
<script lang="ts" module>
    import * as v from 'valibot';
    export const preflight = v.object({
        displayName: v.pipe(v.string(), v.minLength(2)),
        theme: v.picklist(['light', 'dark', 'system']),
        notifications: v.optional(v.boolean(), false)
    });
</script>

<script lang="ts">
    import { updateSettings } from './settings.remote';
    import { preflight } from './+page.svelte';
</script>

<form {...updateSettings.preflight(preflight)}>
    <!-- ... -->
</form>
```

Note the `<script module>`. You **cannot export a Valibot schema from a `.remote.ts` file** — that file is server-only. So either put the preflight schema in a shared `.ts` module or inline it in a `<script module>` block of the component. The preflight does the same checks the server will do, catches errors in the browser, and prevents the submit from firing at all until the form is valid.

### 1.4 Progressive enhancement, really

Turn off JavaScript in DevTools. Submit the form. It still works: the browser posts to the auto-generated URL, the server runs the handler, the page reloads with the new state. Turn JavaScript back on. The form now submits without a reload, the `pending` property flips to `true` while the request is in flight, and `result` arrives with the server's return value. **Same code, same validation, two user experiences — both correct.**

### 1.5 Security

Server-side validation is the security boundary. The preflight is a convenience for the user, not a guarantee. Never assume preflight-passed data is valid — the server schema is always the final word.

## 2. Style it — A settings card with inline errors

Per-page brand is a deep violet. Invalid fields get a `--color-error` border and the `aria-invalid="true"` attribute (set automatically by `.as('text')`), which we match in CSS with `[aria-invalid='true']`.

## 3. Interact — The `fields` object and the `issues` loop

Write the wrong version first: put `{ onsubmit: handleSubmit }` on the form, pull values from a `FormData` by hand, validate manually, track errors in `$state`. Ten lines of boilerplate per field. Now delete it: spread `{...updateSettings}`, use `.as('text')`, loop `.issues()`. Three lines per field. The lesson is *how much ceremony disappears*.

## 4. Mini-build — A "user settings" form

### File tree

```
src/routes/modules/09b-remote/05-form-with-valibot/
├── +page.svelte        (form + preflight in <script module>)
└── settings.remote.ts  (form() with Valibot schema + in-memory state)
```

### DevTools moment

1. Submit the form with an empty display name. The `displayName` field shows a red error border and an inline message. **No network request** — the preflight caught it in the browser.
2. Submit with a valid name. You see one request to the form's auto-generated endpoint.
3. Open Application → Disable JavaScript in DevTools settings. Reload. Submit. The page reloads with the same validation behaviour — because the server is always the authority.

## 5. Check your understanding

<details>
<summary><strong>Q1.</strong> What are the two arguments to <code>form()</code>?</summary>

A Valibot schema and an async handler. The schema describes the shape of the submitted data; the handler receives the validated data and produces a result.
</details>

<details>
<summary><strong>Q2.</strong> Why can't you export the preflight schema from the <code>.remote.ts</code> file?</summary>

Because `.remote.ts` is server-only. The client bundle never imports from it. You put the preflight schema in a shared `.ts` module or a `<script module>` block in the component.
</details>

<details>
<summary><strong>Q3.</strong> What does <code>.as('text')</code> return?</summary>

An object of HTML attributes (`name`, `type`, `value`, `aria-invalid`) that you spread onto an `<input>`. It wires the input to the correct field in the form's data model.
</details>

<details>
<summary><strong>Q4.</strong> What happens if you submit the form with JavaScript disabled?</summary>

The browser performs a normal POST to the auto-generated action URL. The server handler runs the same schema and logic. The page reloads with the result. Progressive enhancement at work.
</details>

<details>
<summary><strong>Q5.</strong> Is client-side preflight validation a replacement for server-side validation?</summary>

No. Preflight is a UX convenience. Server validation is the security boundary. The server schema is always the authority.
</details>

## 6. Common mistakes

- **Binding to `value` instead of spreading `.as('text')`.** `<input bind:value={name}>` bypasses the form's internal state, so `issues()`, `pending`, and `result` stop working.
- **Forgetting `v.optional(v.boolean(), false)` on checkboxes.** Unchecked checkboxes are absent from `FormData` entirely, so a plain `v.boolean()` schema will fail validation.
- **Trying to export a Valibot schema from a `.remote.ts` file.** The build system refuses. Put the schema in a plain `.ts` or `<script module>` block.
- **Returning sensitive data from the form handler.** `result` is sent back to the browser. Do not put passwords, tokens, or hashed credentials in it.

## 7. What's next

Lesson 9B.6 adds the hardest part of form handling: streaming file uploads that make progress visible while the bytes are still in flight.
