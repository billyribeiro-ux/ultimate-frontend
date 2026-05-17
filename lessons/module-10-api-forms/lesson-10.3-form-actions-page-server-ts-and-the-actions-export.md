---
module: 10
lesson: 10.3
title: Form actions — +page.server.ts and the actions export
duration: 60 minutes
prerequisites:
  - Module 8 — routing
  - Lesson 10.1 — `+server.ts` basics
learning_objectives:
  - Export an `actions` object from a `+page.server.ts` file
  - Write a default action that reads `FormData`
  - Use the `fail()` helper to return validation errors to the page
  - Access `form` data in the component via `$props()` destructuring
  - Explain how form actions progressively enhance from zero JavaScript
status: ready
---

# Lesson 10.3 — Form actions — `+page.server.ts` and the `actions` export

## 1. Concept — The pattern that works before JavaScript arrives

### 1.1 Why form actions still matter

Remote `form()` functions (Module 9B.5) and classic form actions both let you handle HTML form submissions on the server. The remote version is newer, more type-safe, and is the direction of travel. But classic form actions have one enormous virtue that still matters: **they are the idiomatic SvelteKit pattern for a form that works without any JavaScript at all**. They predate remote functions, the Svelte team maintains them as a stable primary API, and for a lot of existing projects they are *the* way forms are handled.

This module teaches them because:

- You will meet them in every existing SvelteKit codebase.
- They are still the shortest path to a signup/login form that gracefully degrades.
- They anchor the mental model that Svelte's full remote form pattern is built on top of.

### 1.2 The shape: `actions` in `+page.server.ts`

A form action lives in `+page.server.ts` next to a `+page.svelte`. You export an `actions` object with named handlers:

```ts
// src/routes/login/+page.server.ts
import { fail, redirect } from '@sveltejs/kit';
import type { Actions } from './$types';

export const actions: Actions = {
    default: async ({ request }) => {
        const data = await request.formData();
        const email = data.get('email');
        if (typeof email !== 'string' || email.length === 0) {
            return fail(400, { email, missing: true });
        }
        // ... log the user in
        return { success: true };
    }
};
```

The `default` action runs when the form posts to the page's own URL without a query-string action selector (we meet named actions in 10.4). The handler receives a `RequestEvent`, reads `await request.formData()`, and returns one of three things:

- A **plain object** — becomes `form` in the component, informational only.
- A **`fail(status, data)` result** — becomes `form` in the component, but with a non-success status code.
- A **`redirect(status, location)` throw** — sends the user somewhere else.

### 1.3 The component side

```svelte
<!-- src/routes/login/+page.svelte -->
<script lang="ts">
    import type { PageProps } from './$types';
    let { form }: PageProps = $props();
</script>

<form method="POST">
    <label>
        Email
        <input name="email" type="email" value={form?.email ?? ''} />
    </label>
    {#if form?.missing}<p class="err">Email is required</p>{/if}
    <button>Log in</button>
</form>

{#if form?.success}<p class="ok">Logged in.</p>{/if}
```

Four things make this work **without JavaScript**:

1. `<form method="POST">` with no `action` attribute posts to the current URL.
2. The `default` action runs on the server.
3. Whatever it returns is merged into the page's `form` prop on the next render.
4. The page re-renders with `form` populated, showing the success message or error, with the user's email preserved in the input via `value={form?.email}`.

Turn off JavaScript in DevTools and the flow still works. That is why this pattern exists.

### 1.4 Where `fail()` fits

`fail(status, data)` is the counterpart to `error(status, message)` from `+server.ts`. Instead of throwing and rendering an error page, it **returns** a structured failure that becomes `form` in the component with a non-success HTTP status. Use it for validation errors — the user sees their form again with messages.

### 1.5 Where `redirect()` fits

`redirect(303, '/account')` throws and is caught by SvelteKit, which responds with a 303 and the new location. Use it after a successful action — log the user in, then redirect them to their dashboard. `303` is the right code for "I received a POST, please see a GET at this URL" and avoids accidentally re-submitting on refresh.

### 1.6 Progressive enhancement, the old way

Without `use:enhance` (Lesson 10.5), classic form actions still work — they just reload the page on each submit. With `use:enhance`, they get the fetch-driven progressive enhancement that turns a full-page reload into a fetch + patch. Lesson 10.5 is the hands-on add-on; this lesson establishes the no-JS baseline first.

### 1.7 Form actions vs remote functions — when to use which

Both form actions and remote `form()` functions handle form submissions. The choice depends on your requirements:

- **Form actions** are the correct choice when: you need the form to work without JavaScript (progressive enhancement), you want the simplest possible code path for a standard HTML form, or you are working in an existing codebase that already uses them.
- **Remote `form()` functions** (Module 9B.5) are the correct choice when: you want end-to-end type safety from schema to component, you want the Valibot validation to be shared between client and server automatically, or you are building a new project and want the most modern pattern.

In this course, we teach form actions first because they are more fundamental — they demonstrate how HTML forms actually work, and they build the mental model that remote functions abstract over. Understanding form actions makes remote functions easier to appreciate; the reverse is not true.

### 1.8 The `form` prop lifecycle

The `form` prop in the component has a specific lifecycle worth understanding:

1. **Initial page load**: `form` is `null` (no form has been submitted yet).
2. **After a submission**: `form` contains whatever the action returned (success data or `fail()` data).
3. **After navigating away and back**: `form` resets to `null` (it does not persist across navigations).
4. **After a second submission**: `form` is replaced with the new return value.

This means `form` is always either `null` or the result of the *most recent* submission. You do not need to manually clear it — navigating away handles that. But if you want to dismiss a success message after a timeout, you need to set up a timer in `onMount` that clears a local display flag.

## Deep Dive

**Why this matters at scale.** In a production app with 10+ forms (login, signup, settings, search, contact, admin CRUD operations), form actions provide a consistent, framework-sanctioned pattern for every mutation. Teams that invent their own form-handling patterns (manual fetch, custom state machines, third-party form libraries) end up with inconsistent error handling, duplicated validation logic, and forms that break when JavaScript fails. Form actions give you one pattern that works with and without JavaScript, with built-in error handling via `fail()`, with built-in redirect via `redirect()`, and with a typed `form` prop for displaying results.

**The mental model.** Form actions model the original web: a form submits data to a URL, the server processes it and responds. The response either shows a success state or re-renders the page with errors. This is how the web worked in 1996, and it still works exactly the same way. SvelteKit's form actions are not a new invention — they are a typed, framework-integrated version of PHP's `$_POST` handler, Django's form view, or Rails' controller action. The difference is end-to-end type safety and seamless progressive enhancement via `use:enhance`.

**Edge cases.** Form actions only run on POST requests. If a user bookmarks a URL that was the result of a form action redirect, they get the GET version of the page (the load function runs, not the action). File uploads in form actions use the `FormData` API — `data.get('file')` returns a `File` object on the server. Large file uploads can timeout; set `maxBodySize` in your adapter config. Another edge case: if two forms on the same page both POST to the same URL without a named action selector, they both trigger the `default` action — use named actions (Lesson 10.4) to disambiguate.

**Performance implications.** Without `use:enhance`, every form submission is a full-page navigation: the browser sends a POST, receives a full HTML response, and re-renders the entire page. This is fast on modern connections but costs a full round trip plus SSR time. With `use:enhance` (Lesson 10.5), the submission becomes a fetch request, and only the changed data is patched into the existing page — eliminating the full re-render and giving instant feedback. The base form-action pattern (without enhance) is still faster than a manual client-side fetch because the server re-renders with the new `form` prop, avoiding a loading state entirely.

**Connection to other modules.** Form actions build on Module 8 (routing — actions live in `+page.server.ts`). Module 9B's remote `form()` functions are the typed successor. Module 10 Lesson 10.5 adds `use:enhance` for progressive enhancement. Module 11's optimistic UI can wrap form actions with local state for instant feedback. Module 12 validates that forms remain accessible (ARIA, keyboard navigation). The pattern is foundational: even if you ultimately use remote functions, understanding form actions gives you the mental model for how mutations flow from client to server and back.

## 2. Style it — A clean form with inline error messages

Per-page brand is an ocean blue. Inputs that have a validation error get `border-color: var(--color-error)`. No JavaScript required for the error styling — we key off `form?.missing` in the component.

## 3. Interact — Submit with JavaScript disabled

Disable JavaScript in DevTools (Command Menu → "Disable JavaScript"). Submit the form. You see the full-page reload. The validation messages appear. Type a valid value. Submit again. The success message appears. Re-enable JavaScript. Submit again. Same experience, no reload — because with JS enabled the `use:enhance` in Lesson 10.5 will take over; without JS, the browser does the work.

## 4. Mini-build — The Notes app, part 1: create

This is the first mini-build of the module-long **Full CRUD Note-Taking App** project. We use the same in-memory store across lessons 10.3–10.6 and add features progressively.

### File tree

```
src/routes/modules/10-api-forms/03-form-actions/
├── +page.svelte
├── +page.server.ts       (default action: create note)
└── _lib/notes-store.ts   (shared in-memory notes array)
```

The store lives at `_lib/notes-store.ts` inside the route directory. The underscore prefix marks it as a non-route file. In later lessons we will import it from sibling routes.

### DevTools moment

1. Disable JavaScript. Submit an empty title. The page reloads. The error message shows.
2. Submit a valid title. The page reloads. The success message shows and the input is cleared by the re-render.
3. Re-enable JavaScript. Repeat — it still works. No `use:enhance` yet, so the page still reloads, just faster.

## 5. Check your understanding

<details>
<summary><strong>Q1.</strong> Where do form actions live?</summary>

In a `+page.server.ts` file next to the `+page.svelte` that contains the form. You export an `actions` object.
</details>

<details>
<summary><strong>Q2.</strong> What is the difference between <code>fail()</code> and <code>error()</code>?</summary>

`fail()` returns structured data with a non-success status and lets the component re-render with it. `error()` throws and renders the nearest error boundary. Use `fail` for validation, `error` for exceptions.
</details>

<details>
<summary><strong>Q3.</strong> Why use 303 for the post-action redirect?</summary>

303 "See Other" is the correct status for "I received your POST, please issue a GET at this URL". It prevents the browser from resubmitting the form on refresh.
</details>

<details>
<summary><strong>Q4.</strong> How does the component receive the action's return value?</summary>

As the `form` prop in `$props()`. It is typed automatically from `./$types`.
</details>

<details>
<summary><strong>Q5.</strong> Can a form action work without JavaScript?</summary>

Yes — that is the entire point. Classic form actions submit via a normal browser POST and the server re-renders the page with the updated `form` prop.
</details>

## 6. Common mistakes

- **Forgetting <code>method="POST"</code>.** Form actions only run on POST. GET forms are treated as navigations to query-string URLs.
- **Returning a <code>Response</code> object.** Form actions return plain data or throw `redirect`/`error`. Do not construct a `Response` yourself.
- **Reading <code>FormData</code> without checking types.** `data.get('email')` returns `FormDataEntryValue | null`. Narrow with `typeof === 'string'` before using.
- **Putting the action in <code>+page.ts</code> instead of <code>+page.server.ts</code>.** Only `.server.ts` files run exclusively on the server; `+page.ts` runs on both server and client and cannot contain mutations.

## 7. What's next

Lesson 10.4 adds a second form on the same page — the delete button — using named actions.
