---
module: 10
lesson: 10.5
title: use:enhance — progressive enhancement
duration: 55 minutes
prerequisites:
  - Lesson 10.4 — named actions
learning_objectives:
  - Apply `use:enhance` to a form to avoid full-page reloads
  - Customise it with a `SubmitFunction` that returns a post-submit callback
  - Use `applyAction` and `invalidateAll` inside a custom enhance
  - Type the callbacks with `SubmitFunction` from `./$types`
  - Explain how `use:enhance` keeps the no-JS fallback intact
status: ready
---

# Lesson 10.5 — `use:enhance` — progressive enhancement

## 1. Concept — Upgrade the form, don't replace it

### 1.1 What `use:enhance` does

Classic form actions already work without JavaScript (Lessons 10.3 and 10.4). `use:enhance` is the directive you add to a `<form>` to **upgrade** that experience when JavaScript is available:

- Submit happens via `fetch`, not a full-page reload.
- The form element is automatically reset on success.
- `invalidateAll()` is called, re-running `load()` functions so the page shows fresh data.
- On a redirect response, the client-side navigator takes over (no document reload).
- On an error, the nearest `+error.svelte` renders inside the current layout.
- Focus is reset accessibly.

The magic is that the `<form>` still has `method="POST"` and still has a valid `action`. If JavaScript fails to load, the browser falls back to the classic submit. `use:enhance` is additive — never a replacement.

### 1.2 The simplest possible use

```svelte
<script lang="ts">
    import { enhance } from '$app/forms';
    let { form } = $props();
</script>

<form method="POST" action="?/create" use:enhance>
    <input name="title" />
    <button>Create</button>
</form>
```

One import, one directive. Done. Submissions no longer reload the page.

### 1.3 Customising with a `SubmitFunction`

When you need more control — for example, to show a spinner while a submit is in flight — pass a callback to `use:enhance`. The callback is a `SubmitFunction`: it runs **before** the submit, receives the form metadata, and optionally returns a second callback that runs **after** the submit.

```svelte
<script lang="ts">
    import { enhance } from '$app/forms';
    import type { SubmitFunction } from './$types';

    let submitting: boolean = $state(false);

    const handle: SubmitFunction = ({ cancel }) => {
        submitting = true;
        // Optionally call cancel() here to stop the submission.
        return async ({ update }) => {
            await update(); // runs the default post-submit behaviour
            submitting = false;
        };
    };
</script>

<form method="POST" use:enhance={handle}>
    <button disabled={submitting}>{submitting ? 'Working…' : 'Save'}</button>
</form>
```

The inner `update()` triggers the default behaviour (reset the form, call `invalidateAll`, apply `form` prop). Without it, you take over completely — you get the raw `result` object and decide what to do.

### 1.4 `applyAction` and `invalidateAll`

If you skip `update()`, you can still apply the action's result manually via `applyAction` from `$app/forms`. Combined with `invalidateAll` from `$app/navigation`, you have fine-grained control over what happens post-submit:

```ts
return async ({ result }) => {
    if (result.type === 'success') {
        await invalidateAll();
    }
    await applyAction(result);
};
```

This is the escape hatch. 90% of the time, `update()` (or no custom callback at all) is enough.

### 1.5 When `use:enhance` is the wrong tool

- **Forms posting to a `+server.ts` endpoint.** `use:enhance` only works with forms that target a `+page.server.ts` action. For a plain endpoint, write your own fetch handler.
- **Forms that must show upload progress.** Use the remote function pattern from Lesson 9B.6 — `enhance` does not expose upload progress.
- **Forms that do not need progressive enhancement at all.** If your app is a JS-only dashboard behind a login wall, you can pick the remote function pattern (`form()` from Module 9B.5) and skip the classic action entirely.

### 1.6 What SvelteKit does under the hood — the enhance lifecycle

Here is exactly what happens when you add `use:enhance` to a form and the user clicks submit:

**Step 1 — Interception.** The `use:enhance` action attaches a `submit` event listener to the form. When the user submits, the listener calls `event.preventDefault()`, stopping the browser's default full-page POST.

**Step 2 — Pre-submit callback.** If you passed a `SubmitFunction` to `use:enhance`, it runs now. The callback receives `{ formElement, formData, action, cancel, submitter }`. You can modify `formData`, cancel the submission entirely, or set up loading state.

**Step 3 — Fetch.** `use:enhance` sends a `fetch` POST to the action URL. The request includes:
- The form's `FormData` as the body
- A `x-sveltekit-action: true` header (so the server knows this is an enhanced submission)
- The session cookies (standard browser behavior)

**Step 4 — Server processing.** The server runs the action handler identically to a no-JS submission. It returns the action's result (success data or `fail()` data).

**Step 5 — Post-submit callback.** If your `SubmitFunction` returned a callback, it runs now with `{ result, update, formElement, formData }`:
- `result.type` is `'success'` | `'failure'` | `'redirect'` | `'error'`
- `update()` runs the default post-submit behavior
- You can skip `update()` and handle the result yourself

**Step 6 — Default behavior (if `update()` is called):**
- Form is reset (inputs cleared)
- `invalidateAll()` is called (all load functions re-run)
- `applyAction(result)` updates the `form` prop on the component
- If the result is a redirect, `goto(url)` navigates client-side
- If the result is an error, the nearest `+error.svelte` renders

**What HTML the user submits without JS vs what enhance does:**

Without JS: Browser sends `Content-Type: application/x-www-form-urlencoded` (or `multipart/form-data` for file uploads), receives a full HTML page response, and replaces the entire document.

With enhance: Browser sends the same data via `fetch`, receives a JSON-like response (the serialised action result), and patches the page in place. Same data, different transport. The server code is identical.

### 1.7 The TypeScript angle

The `SubmitFunction` type is generated per-route in `./$types`:

```ts
import type { SubmitFunction } from './$types';

const handle: SubmitFunction = ({ formData, cancel }) => {
    // formData: FormData — the form's data, modifiable
    // cancel: () => void — call to abort the submission
    
    if (!formData.get('title')) {
        // Client-side validation: cancel if title is empty
        cancel();
        return;
    }
    
    submitting = true;
    
    return async ({ result, update }) => {
        // result.type: 'success' | 'failure' | 'redirect' | 'error'
        if (result.type === 'success') {
            showToast('Saved!');
        }
        await update(); // run default behavior
        submitting = false;
    };
};
```

The `result` object is typed based on your action's return value. If the action returns `{ ok: true, noteId: string }`, then `result.data` has that type when `result.type === 'success'`.

### 1.8 Comparison: use:enhance vs manual fetch vs remote form()

| Aspect | `use:enhance` | Manual `fetch` in handler | Remote `form()` |
| --- | --- | --- | --- |
| Progressive enhancement | Yes (form works without JS) | No (JS required) | Yes (form works without JS) |
| Automatic invalidation | Yes (`invalidateAll()`) | Manual | Automatic (targeted) |
| Form reset on success | Yes (automatic) | Manual | Manual |
| Loading state | Manual (`SubmitFunction`) | Manual | Automatic (`.pending`) |
| Per-field validation | Manual | Manual | Automatic (`.issues()`) |
| TypeScript | `SubmitFunction` from `$types` | Manual typing | Full schema inference |
| Code verbosity | Low | High | Lowest |
| Best for | Classic form actions | Non-action forms | New projects |

> **In production sidebar.** We have 12 forms across our app. Eight use `use:enhance` with classic form actions. Four were migrated to remote `form()` functions when we adopted remote functions. The `use:enhance` forms work reliably and the code is minimal — the simplest forms are literally `<form method="POST" use:enhance>`. The remote form versions are even shorter and have better per-field error handling. For new forms, we use remote `form()`. For existing forms, we leave `use:enhance` in place — there is no urgency to migrate, and both patterns coexist without conflict.

### 1.9 Common interview question

**Q: "What does `use:enhance` do under the hood, and how does it maintain progressive enhancement?"**

**Model answer:** `use:enhance` is a Svelte action that intercepts form submissions and replaces the browser's default full-page POST with a `fetch` request. When JavaScript is available, it prevents the page reload, sends the form data via fetch to the same action URL, processes the server's response, resets the form, re-runs all load functions via `invalidateAll()`, and updates the `form` prop on the component — all without a page reload. The key to progressive enhancement is that `use:enhance` does not change the form's HTML structure. The form still has `method="POST"` and a valid `action` URL. If JavaScript fails to load (network error, CSP block, user preference), the browser falls back to the standard form submission flow — the same URL receives the same data, the same server handler runs, and the page reloads with the result. The developer writes the form once; `use:enhance` upgrades the experience when possible.

## Deep Dive

**Custom enhance for optimistic UI.** You can use `SubmitFunction` to implement optimistic updates with classic form actions:

```svelte
<script lang="ts">
    import { enhance } from '$app/forms';
    import type { SubmitFunction } from './$types';

    let optimisticNotes = $derived(data.notes);

    const handle: SubmitFunction = ({ formData }) => {
        // Optimistic: add the note locally before the server responds
        const title = formData.get('title') as string;
        optimisticNotes = [...optimisticNotes, { id: 'temp', title, body: '' }];

        return async ({ update }) => {
            await update(); // Server response replaces the optimistic data
        };
    };
</script>
```

This is more manual than remote functions' `withOverride`, but it works with classic form actions.

**The `update({ reset: false })` option.** By default, `update()` resets the form (clears all inputs). If you want to keep the form values after submission (e.g., a search form where the user wants to refine their query), pass `{ reset: false }`:

```ts
return async ({ update }) => {
    await update({ reset: false });
};
```

## Going Deeper

- **SvelteKit docs:** [Form actions — Progressive enhancement](https://svelte.dev/docs/kit/form-actions#Progressive-enhancement) covers `use:enhance` in detail.
- **Advanced pattern:** Wrap `use:enhance` in a reusable Svelte action that adds standard loading, error, and success toast behaviors across all forms in your app.
- **Challenge:** Create a form with `use:enhance` and a custom `SubmitFunction` that adds a 2-second artificial delay before calling `update()`. Watch the loading state. Now remove the `return async () => { await update(); }` and just return nothing from the `SubmitFunction`. What happens? (Answer: the default behavior runs, but you lose the ability to control timing or add post-submit logic.)

## 2. Style it — The same notes form from 10.4, with a pending state

Per-page brand is a dusk purple. The `submitting` state dims the button and shows "Saving…" — tiny UI, but the feel is dramatically different from the full-page reload baseline.

## 3. Interact — Watch the reload disappear

Load the mini-build and submit the create form first *without* `use:enhance`. The page flickers. Add `use:enhance`. Submit again. No flicker, no scroll-to-top, no lost input focus. Same server code; the enhancement is purely on the client.

## 4. Mini-build — Notes app, part 3: enhanced create/delete

### File tree

```
src/routes/modules/10-api-forms/05-use-enhance/
├── +page.svelte              (create + delete with use:enhance)
├── +page.server.ts           (same actions as 10.4)
└── _lib/notes-store.ts
```

### DevTools moment

1. Submit the create form. In the Network tab you see one `POST` request. The page does **not** reload (document frame stays the same).
2. Submit with a throttled network profile. The button stays disabled and shows "Saving…" until the request completes.
3. Disable JavaScript. Submit. The page reloads. The form still works, proving the baseline is intact.

## 5. Check your understanding

<details>
<summary><strong>Q1.</strong> What does <code>use:enhance</code> do when called with no arguments?</summary>

It intercepts submissions and runs them via `fetch`, resets the form, calls `invalidateAll()` to rerun `load()` functions, applies redirects via the client router, and renders errors through the nearest `+error` boundary.
</details>

<details>
<summary><strong>Q2.</strong> When does the callback returned by a <code>SubmitFunction</code> run?</summary>

After the server has responded. It receives the `result` and an `update` function that triggers the default post-submit behaviour.
</details>

<details>
<summary><strong>Q3.</strong> Does <code>use:enhance</code> break the no-JS fallback?</summary>

No. The form still has `method="POST"` and a valid `action`. Without JavaScript, the browser performs a normal submit.
</details>

<details>
<summary><strong>Q4.</strong> Where does <code>SubmitFunction</code> come from?</summary>

`./$types` — the per-route generated type module. It carries the correct shape for your specific route's actions.
</details>

<details>
<summary><strong>Q5.</strong> What does <code>update()</code> inside the post-submit callback do?</summary>

It runs the default post-submit behaviour: reset the form, call `invalidateAll`, apply the `form` prop. Skip it only if you want to take over those steps yourself.
</details>

## 6. Common mistakes

- **Forgetting <code>action="?/name"</code> on enhanced forms.** <code>use:enhance</code> needs an action; without one it falls back to default, which may not exist.
- **Returning a plain value from the <code>SubmitFunction</code> instead of a callback.** The return must be <code>void</code> or an async function. Returning data does nothing useful.
- **Mixing <code>use:enhance</code> with <code>+server.ts</code>.** <code>use:enhance</code> only knows about <code>+page.server.ts</code> actions.
- **Assuming <code>use:enhance</code> shows upload progress.** It does not. Use remote form functions from Module 9B.6 for that.

## 7. What's next

Lesson 10.6 formalises the type flow of validation errors with `ActionData` and the generated `./$types` module.
