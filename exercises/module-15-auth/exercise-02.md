---
module: 15
exercise: 2
title: Registration Form
difficulty: intermediate
estimated_time: 20
skills_tested:
  - SvelteKit form actions
  - server-side validation
  - password handling best practices
  - progressive enhancement
  - error display patterns
---

# Exercise 15.2 — Registration Form

## Brief

Build a user registration form using SvelteKit form actions. The form collects name, email, and password, validates all fields server-side, and sets a session cookie on successful registration. This exercise teaches the full form action pipeline with security-conscious patterns.

## Requirements

1. Create `src/routes/exercises/15-auth/02/+page.svelte` with a registration form
2. Create `src/routes/exercises/15-auth/02/+page.server.ts` with a `register` form action
3. The form must have fields: `name` (min 2 chars), `email` (valid format), `password` (min 8 chars, must contain a number)
4. Validate all fields server-side in the form action — return `fail(400, { errors })` for invalid input
5. Display field-level error messages below each input when validation fails
6. On successful validation, hash the password (use a simple hash placeholder — do not implement bcrypt)
7. Set a `session` cookie with the user data using `cookies.set()`
8. Redirect to a success page or show a success message after registration
9. The form must work without JavaScript (progressive enhancement)
10. Pre-fill fields with previously submitted values on validation failure using `form` prop
11. Style the form with PE7 tokens — use proper spacing, error colors, and focus states

## Constraints

- No client-side validation (server-only for this exercise)
- No storing passwords in plain text — at minimum, demonstrate the hashing boundary
- TypeScript strict mode with zero errors
- The form must use `method="POST"` and SvelteKit's `use:enhance` for progressive enhancement

## Hints (progressive)

<details>
<summary>Hint 1 (free)</summary>

Form actions receive `{ request, cookies }`. Use `request.formData()` to get the submitted values. Return `fail(400, { errors, values })` for validation errors. The page component receives these via the `form` prop.
</details>

<details>
<summary>Hint 2 (conceptual)</summary>

Define a `validate` function that returns an object of field-level errors. Check each field and collect all errors before returning. If the errors object is empty, the form is valid. Use `cookies.set('session', JSON.stringify(userData), { path: '/', httpOnly: true })` to set the session cookie. Import `enhance` from `$app/forms` for progressive enhancement.
</details>

<details>
<summary>Hint 3 (code sketch)</summary>

```typescript
// +page.server.ts
import { fail, redirect } from '@sveltejs/kit';
import type { Actions } from './$types';

export const actions: Actions = {
  register: async ({ request, cookies }) => {
    const data = await request.formData();
    const name = data.get('name')?.toString() ?? '';
    const email = data.get('email')?.toString() ?? '';
    const password = data.get('password')?.toString() ?? '';

    const errors: Record<string, string> = {};
    if (name.length < 2) errors.name = 'Name must be at least 2 characters';
    // ... more validation

    if (Object.keys(errors).length > 0) {
      return fail(400, { errors, values: { name, email } });
    }

    // Hash password, create user, set cookie...
    cookies.set('session', JSON.stringify({ id: crypto.randomUUID(), name, email }), {
      path: '/', httpOnly: true, maxAge: 60 * 60 * 24 * 7
    });

    redirect(303, '/exercises/15-auth/02?registered=true');
  }
};
```
</details>

## Solution

<details>
<summary>Full solution (click to reveal)</summary>

**`src/routes/exercises/15-auth/02/+page.server.ts`**

```typescript
import { fail, redirect } from '@sveltejs/kit';
import type { Actions } from './$types';

interface ValidationErrors {
  name?: string;
  email?: string;
  password?: string;
}

interface FormValues {
  name: string;
  email: string;
}

function validateRegistration(name: string, email: string, password: string): ValidationErrors {
  const errors: ValidationErrors = {};

  if (name.length < 2) {
    errors.name = 'Name must be at least 2 characters';
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    errors.email = 'Please enter a valid email address';
  }

  if (password.length < 8) {
    errors.password = 'Password must be at least 8 characters';
  } else if (!/\d/.test(password)) {
    errors.password = 'Password must contain at least one number';
  }

  return errors;
}

function hashPassword(password: string): string {
  // Placeholder: In production, use bcrypt or argon2
  // This demonstrates the boundary where hashing should occur
  return `hashed_${btoa(password).slice(0, 24)}`;
}

export const actions: Actions = {
  register: async ({ request, cookies }) => {
    const formData = await request.formData();
    const name = formData.get('name')?.toString().trim() ?? '';
    const email = formData.get('email')?.toString().trim() ?? '';
    const password = formData.get('password')?.toString() ?? '';

    const errors = validateRegistration(name, email, password);

    if (Object.keys(errors).length > 0) {
      return fail(400, {
        errors,
        values: { name, email } satisfies FormValues
      });
    }

    const _hashedPassword = hashPassword(password);

    const user = {
      id: crypto.randomUUID(),
      name,
      email
    };

    cookies.set('session', JSON.stringify(user), {
      path: '/',
      httpOnly: true,
      sameSite: 'lax',
      secure: true,
      maxAge: 60 * 60 * 24 * 7 // 7 days
    });

    redirect(303, '/exercises/15-auth/02?registered=true');
  }
};
```

**`src/routes/exercises/15-auth/02/+page.svelte`**

```svelte
<script lang="ts">
  import { enhance } from '$app/forms';
  import { page } from '$app/state';

  interface Props {
    form: {
      errors?: { name?: string; email?: string; password?: string };
      values?: { name: string; email: string };
    } | null;
  }

  let { form }: Props = $props();

  const registered = $derived(page.url.searchParams.has('registered'));
</script>

<main class="page">
  {#if registered}
    <div class="card success">
      <h1>Registration Complete</h1>
      <p>Your account has been created and you are now logged in.</p>
    </div>
  {:else}
    <div class="card">
      <h1>Create Account</h1>
      <p class="subtitle">Join us to get started.</p>

      <form method="POST" action="?/register" use:enhance>
        <div class="field">
          <label for="name">Name</label>
          <input
            id="name"
            name="name"
            type="text"
            required
            value={form?.values?.name ?? ''}
            aria-invalid={form?.errors?.name ? 'true' : undefined}
            aria-describedby={form?.errors?.name ? 'name-error' : undefined}
          />
          {#if form?.errors?.name}
            <p id="name-error" class="error">{form.errors.name}</p>
          {/if}
        </div>

        <div class="field">
          <label for="email">Email</label>
          <input
            id="email"
            name="email"
            type="email"
            required
            value={form?.values?.email ?? ''}
            aria-invalid={form?.errors?.email ? 'true' : undefined}
            aria-describedby={form?.errors?.email ? 'email-error' : undefined}
          />
          {#if form?.errors?.email}
            <p id="email-error" class="error">{form.errors.email}</p>
          {/if}
        </div>

        <div class="field">
          <label for="password">Password</label>
          <input
            id="password"
            name="password"
            type="password"
            required
            minlength={8}
            aria-invalid={form?.errors?.password ? 'true' : undefined}
            aria-describedby={form?.errors?.password ? 'password-error' : undefined}
          />
          {#if form?.errors?.password}
            <p id="password-error" class="error">{form.errors.password}</p>
          {/if}
        </div>

        <button type="submit" class="btn">Create Account</button>
      </form>
    </div>
  {/if}
</main>

<style>
  .page {
    max-inline-size: var(--content-max);
    margin-inline: auto;
    padding: var(--space-xl) var(--space-md);
    display: grid;
    place-items: center;
    min-block-size: 70vh;
  }

  .card {
    background: var(--color-surface-2);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-lg);
    padding: var(--space-xl);
    max-inline-size: 24rem;
    inline-size: 100%;
    box-shadow: var(--shadow-md);
  }

  .success {
    text-align: center;
  }

  .success h1 {
    color: var(--color-success);
  }

  h1 {
    font-size: var(--text-xl);
    margin-block-end: var(--space-xs);
  }

  .subtitle {
    font-size: var(--text-sm);
    color: var(--color-text-muted);
    margin-block-end: var(--space-lg);
  }

  form {
    display: grid;
    gap: var(--space-md);
  }

  .field {
    display: grid;
    gap: var(--space-xs);
  }

  label {
    font-size: var(--text-sm);
    font-weight: 600;
    color: var(--color-text);
  }

  input {
    padding: var(--space-sm);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    font-size: var(--text-base);
    background: var(--color-surface);
    color: var(--color-text);
    transition: border-color var(--dur-fast) var(--ease-out);
  }

  input:focus {
    outline: 2px solid var(--color-brand);
    outline-offset: 1px;
    border-color: var(--color-brand);
  }

  input[aria-invalid='true'] {
    border-color: var(--color-error);
  }

  .error {
    font-size: var(--text-xs);
    color: var(--color-error);
  }

  .btn {
    padding: var(--space-sm) var(--space-lg);
    background: var(--color-brand);
    color: var(--color-surface);
    border: none;
    border-radius: var(--radius-md);
    font-weight: 600;
    font-size: var(--text-sm);
    cursor: pointer;
    margin-block-start: var(--space-sm);
  }

  .btn:hover {
    opacity: 0.9;
  }
</style>
```

### Explanation

This solution demonstrates the complete SvelteKit form action pipeline. The form submits to a named action (`?/register`), which processes the data server-side. The `validateRegistration` function collects all errors before returning, so the user sees every issue at once instead of fixing them one at a time. When validation fails, `fail(400, ...)` returns the errors and previously submitted values to the page via the `form` prop — this is how SvelteKit implements progressive enhancement. The `use:enhance` directive progressively enhances the form to submit via fetch instead of a full page reload, but the form works without JavaScript too. The password hashing function is a placeholder — in production, you would use `bcrypt` or `argon2` from a server-side library. The cookie is set with `httpOnly` (prevents XSS access), `sameSite: 'lax'` (CSRF protection), and `secure: true` (HTTPS only). The `aria-invalid` and `aria-describedby` attributes ensure screen readers announce field errors properly.
</details>
