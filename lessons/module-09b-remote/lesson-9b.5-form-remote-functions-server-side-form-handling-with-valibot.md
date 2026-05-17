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

### 1.6 What SvelteKit does under the hood — the progressive enhancement lifecycle

Understanding the full lifecycle of a remote `form()` submission reveals why this pattern is so powerful. Here is what happens at each stage:

**Without JavaScript (no-JS fallback):**

1. The user fills in the form and clicks "Save".
2. The browser reads the `method="POST"` and `action` attributes that `{...updateSettings}` spread onto the `<form>`. The action is an auto-generated URL pointing to the form's server endpoint.
3. The browser constructs a `FormData` from all named inputs and submits a standard multipart POST.
4. The server receives the request. SvelteKit's runtime extracts the form data, runs it through the Valibot schema, and either returns the handler's result or returns validation errors.
5. The server re-renders the page with the `form` result populated. The user sees a full-page reload with the success message or validation errors.

**With JavaScript (progressive enhancement):**

1. The user fills in the form and clicks "Save".
2. The Svelte attachment (set by `{...updateSettings}`) intercepts the submit event and calls `event.preventDefault()`.
3. If a preflight schema was provided via `.preflight(schema)`, the form data is validated in the browser first. If validation fails, the `issues()` arrays populate immediately — no network request.
4. If preflight passes (or no preflight exists), the attachment serialises the form data and sends a `fetch` POST to the same auto-generated endpoint.
5. The `pending` property on `updateSettings` flips to `true`. The template can show a spinner.
6. The server validates with the authoritative Valibot schema. If it fails, the 400 response carries the issues. If it passes, the handler runs and returns the result.
7. The response arrives. `pending` flips to `false`. Either `result` is populated (success) or the per-field `issues()` arrays are populated (failure).
8. No page reload. No scroll-to-top. No lost input focus.

The key insight is that **the same form, the same validation, the same handler** works in both paths. You write one Valibot schema on the server, optionally mirror it as a preflight on the client, and both JS-on and JS-off users get the same experience — just with different performance characteristics.

### 1.7 The TypeScript angle

The `form()` function's type signature is:

```ts
function form<Schema, Result>(
    schema: StandardSchema<Schema>,
    handler: (data: Schema) => Promise<Result>
): FormRemoteFunction<Schema, Result>;
```

The return type `FormRemoteFunction<Schema, Result>` is both:
- A spreadable object (for `{...updateSettings}` on the form element)
- A reactive state container with `result: Result | null`, `pending: boolean`, and `fields`

The `fields` object is derived from the schema. For `v.object({ displayName: v.string(), theme: v.picklist([...]) })`, the fields are:
- `fields.displayName` with `.as('text')`, `.as('textarea')`, `.issues()`
- `fields.theme` with `.as('select')`, `.issues()`

Each field's `.as()` method returns the correct HTML attributes including `name`, `type`, `value`, and `aria-invalid`. The `aria-invalid` attribute is set to `"true"` when that field has validation issues, which is both an accessibility feature and a CSS hook.

### 1.8 Comparison: remote `form()` vs classic form actions

| Aspect | Remote `form()` | Classic form actions |
| --- | --- | --- |
| Validation | Valibot schema (automatic) | Manual `FormData` parsing |
| Type safety | Schema -> handler -> result (automatic) | Manual `ActionData` typing |
| Progressive enhancement | Built-in (attachment intercepts) | Via `use:enhance` (manual) |
| Per-field errors | `fields.name.issues()` (automatic) | Manual error mapping |
| Client preflight | `.preflight(schema)` | Manual `onsubmit` handler |
| Field helpers | `.as('text')`, `.as('checkbox')`, etc. | Manual `name`/`type` attributes |
| No-JS fallback | Yes (standard POST) | Yes (standard POST) |
| Existing codebase support | Requires `experimental.remoteFunctions` | Built-in since SvelteKit 1.0 |

> **In production sidebar.** We rebuilt our settings page from classic form actions to remote `form()` functions. The original code was 180 lines across `+page.server.ts` (manual FormData parsing, manual validation, manual error mapping) and `+page.svelte` (manual error display, manual field repopulation). The remote form version is 65 lines across `settings.remote.ts` (schema + handler) and `+page.svelte` (spread + fields). The validation is more thorough (Valibot catches edge cases our manual checks missed), the error display is more precise (per-field via `.issues()`), and the code is 64% shorter. The one trade-off: the preflight schema must live outside the `.remote.ts` file, which adds one small file.

### 1.9 Common interview question

**Q: "Explain progressive enhancement in the context of SvelteKit forms. How does a remote `form()` function achieve it?"**

**Model answer:** Progressive enhancement means the form works at the baseline level (no JavaScript) and gets better when JavaScript is available. A remote `form()` function achieves this by generating a real HTML form with `method="POST"` and an auto-generated `action` URL. Without JavaScript, the browser submits the form normally, the server validates and processes it, and the page reloads with the result. With JavaScript, a Svelte attachment intercepts the submit, runs an optional client-side preflight validation for instant feedback, then sends the data via `fetch` in the background. The page updates reactively without a reload — showing validation errors per-field, displaying a pending state during submission, and rendering the result when it arrives. The same Valibot schema validates on both sides, ensuring consistency. The developer writes the form once; SvelteKit delivers two user experiences from the same code.

## Deep Dive

**The preflight schema placement problem.** A `.remote.ts` file is server-only. Its code never ships to the client. But a preflight schema must run in the browser. This creates a tension: you want one schema (DRY), but the schema must exist in two bundles. The solution is to put the shared schema in a plain `.ts` file (not `.remote.ts`) that both sides can import:

```ts
// src/routes/settings/settings-schema.ts (plain .ts — both sides can import)
import * as v from 'valibot';
export const settingsSchema = v.object({ ... });
```

```ts
// src/routes/settings/settings.remote.ts (server-only)
import { form } from '$app/server';
import { settingsSchema } from './settings-schema';
export const updateSettings = form(settingsSchema, async (data) => { ... });
```

```svelte
<!-- src/routes/settings/+page.svelte (client) -->
<script lang="ts">
    import { updateSettings } from './settings.remote';
    import { settingsSchema } from './settings-schema';
</script>
<form {...updateSettings.preflight(settingsSchema)}>
```

One schema, shared between server validation and client preflight, with zero duplication.

**The `pending` property for UX.** `updateSettings.pending` is a reactive boolean. Use it to disable the submit button and show a spinner:

```svelte
<button disabled={updateSettings.pending}>
    {updateSettings.pending ? 'Saving...' : 'Save'}
</button>
```

This is automatic — no `$state` management, no manual flag toggling.

## Going Deeper

- **SvelteKit docs:** [Remote functions — form](https://svelte.dev/docs/kit/remote-functions#form) covers the full API.
- **Advanced pattern:** Compose multiple `form()` exports in the same `.remote.ts` file for pages with multiple forms. Each form has its own schema, handler, and `result` — they do not interfere.
- **Challenge:** Create a form with a `v.optional(v.boolean(), false)` checkbox field. Submit the form with the checkbox unchecked. What does the server receive? (Answer: `false`, because `v.optional` with a default handles the missing-checkbox edge case. Without the default, an unchecked checkbox is absent from FormData and would fail validation.)

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
