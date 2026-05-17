---
module: 15
lesson: 15.3
title: Registration
duration: 50 minutes
prerequisites:
  - Lesson 15.2 (hooks, event.locals)
  - Module 10 (form actions)
  - TypeScript interfaces (Module 1)
learning_objectives:
  - Build a registration form that works without JavaScript (progressive enhancement)
  - Write a SvelteKit form action that validates input with a schema
  - Hash passwords using PBKDF2 via crypto.subtle
  - Return typed form action responses for success and error states
  - Display validation errors inline next to form fields
status: ready
---

# Lesson 15.3 — Registration

> **Atomic lesson format** — every lesson in this course follows the same four parts: **Concept**, **Style it**, **Interact**, **Mini-build**.

## 1. Concept — Letting users create accounts safely

### 1.1 The problem: collecting credentials without disaster

Registration is where users trust you with their email and password. Get it wrong — store the password in plain text, accept absurdly short passwords, or fail to validate the email format — and you have a security incident waiting to happen.

A good registration flow does four things:

1. **Validates input on the server** (client validation is a courtesy; server validation is the law)
2. **Hashes the password** before storing it (never store plain text, never store reversible encryption)
3. **Checks for duplicates** (two accounts with the same email causes chaos)
4. **Returns clear, typed error responses** so the UI can show exactly what went wrong

### 1.2 Form actions: the server-first approach

In SvelteKit, a form action is a function that runs on the server when a `<form>` is submitted via POST. The form works without JavaScript — the browser submits it natively, the server processes it, and the page reloads with the result. When JavaScript is available, `use:enhance` intercepts the submission and updates the page without a full reload.

```typescript
// src/routes/register/+page.server.ts
import type { Actions } from './$types';

export const actions: Actions = {
    default: async ({ request }) => {
        const formData: FormData = await request.formData();
        // validate, hash, store, respond
    }
};
```

The action receives the full `RequestEvent`, giving you access to `request`, `cookies`, `locals`, and more.

### 1.3 Validation with schemas

We validate registration input using a schema library. The pattern is:

1. Define the shape you expect (email format, password minimum length, name not empty)
2. Parse the form data through the schema
3. If parsing fails, return the errors to the form
4. If parsing succeeds, proceed with the hashed password and user creation

For this course, we use a simple validation function that checks field requirements. In production you would use Valibot or Zod for comprehensive schema validation.

### 1.4 Password hashing with PBKDF2

You must never store a password as plain text. Instead, you run it through a one-way hashing function that produces a fixed-length string. Even if someone steals your database, they cannot reverse the hash to find the original password.

Our `$lib/auth/password.ts` uses PBKDF2 via `crypto.subtle`:

- **Salt:** A random 16-byte value unique to each password. Without a salt, identical passwords produce identical hashes, making them vulnerable to rainbow table attacks.
- **Iterations:** 100,000 rounds of the hash function. This makes brute-force attacks computationally expensive.
- **Output:** A string in the format `salt:hash`, both hex-encoded.

In production, Argon2 (via `@node-rs/argon2`) is the gold standard because it is memory-hard — it requires significant RAM to compute, making GPU-based attacks impractical. We teach PBKDF2 because it uses built-in APIs and requires no native dependencies.

### 1.5 Typed action responses

SvelteKit form actions can return data that the page receives. We type these responses to ensure the form can display errors correctly:

```typescript
return fail(400, {
    error: 'Email already registered',
    email: email, // return the email so the form can pre-fill it
    name: name
});
```

The `fail()` helper sets the HTTP status and makes the data available to the page via `form` — a prop that contains the action's return value after submission.

## 2. Style it — The registration form card

The registration form uses a centered card layout:

- Max width `28rem` for comfortable reading
- `var(--space-lg)` padding inside the card
- Input fields with full width, `var(--radius-md)` rounding, and `var(--space-sm)` padding
- Error messages in `var(--color-error)` immediately below the relevant field
- Submit button spanning full width with 44px minimum height
- The brand color personality: `oklch(65% 0.18 160)` (security green)

## 3. Interact — async/await and the fail() helper

The core TypeScript pattern is **async form processing with typed error returns**. The action must be `async` because password hashing is asynchronous (it uses `crypto.subtle.deriveBits` which returns a Promise).

Here is the mistake first:

```typescript
// BROKEN — synchronous call to an async function
export const actions: Actions = {
    default: async ({ request }) => {
        const data = await request.formData();
        const password = data.get('password') as string;
        const hash = hashPassword(password); // Missing await!
        // hash is a Promise, not a string — user creation fails
    }
};
```

The fix:

```typescript
const hash: string = await hashPassword(password);
```

Every step in the registration pipeline might be async (form data parsing, validation, hashing, database writes). Missing a single `await` produces a subtle bug where you store a `[object Promise]` string instead of the actual hash.

## 4. Mini-build — Registration form

**File:** `src/routes/modules/15-auth/03-registration/+page.svelte`

This mini-build is a complete registration form with server-side validation, password hashing, and typed error display.

```svelte
<script lang="ts">
    import { enhance } from '$app/forms';

    interface Props {
        form: {
            error?: string;
            errors?: { email?: string; name?: string; password?: string };
            email?: string;
            name?: string;
            success?: boolean;
        } | null;
    }

    let { form }: Props = $props();
</script>

<svelte:head>
    <title>Lesson 15.3 · Registration</title>
</svelte:head>

<section class="page stack">
    <header>
        <p class="eyebrow">Lesson 15.3 · Mini-build</p>
        <h1>Register</h1>
    </header>

    {#if form?.success}
        <article class="success-card">
            <h2>Account created</h2>
            <p>You can now <a href="/modules/15-auth/04-login">log in</a>.</p>
        </article>
    {:else}
        <form method="POST" use:enhance class="register-form">
            {#if form?.error}
                <p class="form-error">{form.error}</p>
            {/if}

            <div class="field">
                <label for="name">Name</label>
                <input
                    type="text"
                    id="name"
                    name="name"
                    value={form?.name ?? ''}
                    required
                    autocomplete="name"
                />
                {#if form?.errors?.name}
                    <p class="field-error">{form.errors.name}</p>
                {/if}
            </div>

            <div class="field">
                <label for="email">Email</label>
                <input
                    type="email"
                    id="email"
                    name="email"
                    value={form?.email ?? ''}
                    required
                    autocomplete="email"
                />
                {#if form?.errors?.email}
                    <p class="field-error">{form.errors.email}</p>
                {/if}
            </div>

            <div class="field">
                <label for="password">Password</label>
                <input
                    type="password"
                    id="password"
                    name="password"
                    required
                    minlength="8"
                    autocomplete="new-password"
                />
                {#if form?.errors?.password}
                    <p class="field-error">{form.errors.password}</p>
                {/if}
            </div>

            <button type="submit">Create account</button>
        </form>
    {/if}
</section>
```

### DevTools moment

1. Disable JavaScript in DevTools (Settings > Debugger > Disable JavaScript).
2. Submit the form. It still works — the browser POSTs natively, the server processes the action, and the page reloads with the result. This is progressive enhancement.
3. Re-enable JavaScript. Now the form submits without a full page reload thanks to `use:enhance`.

## 5. Check your understanding

<details>
<summary><strong>Q1.</strong> Why must password validation happen on the server even if you also validate on the client?</summary>

Client-side validation is a convenience for the user but provides zero security. Anyone can disable JavaScript, use curl, or modify the DOM to bypass client checks. The server is the only place where validation is enforced — the client can be forged, the server cannot.
</details>

<details>
<summary><strong>Q2.</strong> What is a salt and why is it necessary for password hashing?</summary>

A salt is a random value unique to each password that is combined with the password before hashing. Without it, two users with the same password would produce identical hashes, making them vulnerable to precomputed rainbow table attacks. The salt ensures every hash is unique even for identical passwords.
</details>

<details>
<summary><strong>Q3.</strong> What does fail(400, { error: '...' }) do in a form action?</summary>

It sets the HTTP response status to 400 (Bad Request) and makes the provided data available to the page component via the `form` prop. The page does not redirect — it re-renders with the error data so the user can correct their input.
</details>

<details>
<summary><strong>Q4.</strong> Why is the hashPassword function async?</summary>

It uses `crypto.subtle.deriveBits()` which returns a Promise because cryptographic operations can be computationally expensive. Making them async prevents blocking the server's event loop during the 100,000 PBKDF2 iterations.
</details>

<details>
<summary><strong>Q5.</strong> What happens if you store the result of hashPassword(password) without awaiting it?</summary>

You store a Promise object (serialized as `[object Promise]`) instead of the actual hash string. When the user later tries to log in, password verification will always fail because it is comparing against a meaningless string, not a real hash.
</details>

## 6. Common mistakes

- **Storing passwords in plain text.** Never, under any circumstances. Always hash. Even for "just a teaching project." Build the habit now.
- **Forgetting to check for duplicate emails before creating the user.** Without this check, the second registration with the same email either crashes (unique constraint) or creates a duplicate account that can never log in correctly.
- **Not returning the submitted values on error.** If validation fails and you return only the error message, the user's form is wiped clean. Always return the non-sensitive values (email, name — never the password) so the form can pre-fill them.
- **Using `GET` for the registration form.** Form actions only respond to POST. A GET request loads the page; a POST triggers the action. If your `<form>` has no `method="POST"`, it will GET and your action never runs.

## 7. What's next

Lesson 15.4 builds the login form — comparing the submitted password against the stored hash and creating a session cookie that the hook from Lesson 15.2 will read on subsequent requests.
