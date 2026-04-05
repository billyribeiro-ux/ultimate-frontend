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
