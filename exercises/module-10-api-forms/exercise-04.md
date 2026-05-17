---
module: 10
exercise: 4
title: Server-Side Validation Pipeline
difficulty: expert
estimated_time: 45
skills_tested:
  - Valibot schema validation
  - fail() with ActionData
  - inline field errors
  - form repopulation
---

# Exercise 10.4 — Server-Side Validation Pipeline

## Brief

Build a user registration form with comprehensive server-side validation using Valibot. The form handles multiple field types, shows per-field inline errors, preserves submitted values on failure, and displays a success state on completion.

## Requirements

1. Create a Valibot schema validating: `username` (3-20 chars, alphanumeric only), `email` (valid format), `password` (min 8 chars, at least one uppercase, one number), `confirmPassword` (matches password), `role` (enum: 'developer' | 'designer' | 'manager'), and `agreeToTerms` (must be true)
2. Create a form action that validates against the schema using `v.safeParse()`
3. On failure, return `fail(400, { errors, fields })` where `errors` is a record of field names to error messages
4. On success, return `{ success: true, username }` and clear the form
5. The page shows inline errors under each field using `aria-describedby`
6. All previously entered values repopulate on validation failure (except passwords)
7. A password strength indicator shows weak/medium/strong based on the input

## Constraints

- All validation is server-side only — no client-side validation
- Use Valibot's `v.pipe()` for composable validation chains
- Passwords must never be returned in ActionData (security)
- All styles use PE7 tokens

## Hints (progressive)

<details>
<summary>Hint 1 (free)</summary>

Valibot's `v.pipe()` chains multiple validators: `v.pipe(v.string(), v.minLength(3), v.maxLength(20), v.regex(/^[a-zA-Z0-9]+$/))`. For password confirmation, use `v.forward(v.check(...))` to attach the error to the confirmPassword field.
</details>

<details>
<summary>Hint 2 (conceptual)</summary>

Return all field values except passwords in the `fail()` response so the form can repopulate. Map Valibot's issues array to a `Record<string, string>` for easy template access. The password strength indicator is a client-side `$derived` — it does not affect server validation.
</details>

<details>
<summary>Hint 3 (code sketch)</summary>

```typescript
const result = v.safeParse(schema, data);
if (!result.success) {
  const errors: Record<string, string> = {};
  for (const issue of result.issues) {
    const key = issue.path?.[0]?.key;
    if (typeof key === 'string' && !errors[key]) {
      errors[key] = issue.message;
    }
  }
  return fail(400, { errors, fields: { username, email, role } });
}
```
</details>

## Solution

<details>
<summary>Full solution</summary>

```typescript
// src/routes/register/+page.server.ts
import { fail } from '@sveltejs/kit';
import * as v from 'valibot';
import type { Actions } from './$types';

const RegisterSchema = v.pipe(
  v.object({
    username: v.pipe(
      v.string(),
      v.minLength(3, 'Username must be at least 3 characters'),
      v.maxLength(20, 'Username must be 20 characters or fewer'),
      v.regex(/^[a-zA-Z0-9]+$/, 'Username can only contain letters and numbers')
    ),
    email: v.pipe(
      v.string(),
      v.email('Please enter a valid email address')
    ),
    password: v.pipe(
      v.string(),
      v.minLength(8, 'Password must be at least 8 characters'),
      v.regex(/[A-Z]/, 'Password must contain at least one uppercase letter'),
      v.regex(/[0-9]/, 'Password must contain at least one number')
    ),
    confirmPassword: v.string(),
    role: v.picklist(['developer', 'designer', 'manager'], 'Please select a valid role'),
    agreeToTerms: v.pipe(
      v.boolean(),
      v.check((v) => v === true, 'You must agree to the terms')
    )
  }),
  v.forward(
    v.check(
      (input) => input.password === input.confirmPassword,
      'Passwords do not match'
    ),
    ['confirmPassword']
  )
);

export const actions: Actions = {
  default: async ({ request }) => {
    const formData = await request.formData();

    const raw = {
      username: formData.get('username') as string ?? '',
      email: formData.get('email') as string ?? '',
      password: formData.get('password') as string ?? '',
      confirmPassword: formData.get('confirmPassword') as string ?? '',
      role: formData.get('role') as string ?? '',
      agreeToTerms: formData.get('agreeToTerms') === 'on'
    };

    const result = v.safeParse(RegisterSchema, raw);

    if (!result.success) {
      const errors: Record<string, string> = {};
      for (const issue of result.issues) {
        const key = issue.path?.[0]?.key;
        if (typeof key === 'string' && !errors[key]) {
          errors[key] = issue.message;
        }
      }

      return fail(400, {
        errors,
        fields: {
          username: raw.username,
          email: raw.email,
          role: raw.role
        }
      });
    }

    return { success: true, username: result.output.username };
  }
};
```

```svelte
<!-- src/routes/register/+page.svelte -->
<script lang="ts">
  import { enhance } from '$app/forms';
  import type { ActionData } from './$types';

  let { form }: { form: ActionData } = $props();

  let password = $state('');
  let strength = $derived<'weak' | 'medium' | 'strong'>(
    password.length >= 8 && /[A-Z]/.test(password) && /[0-9]/.test(password) ? 'strong' :
    password.length >= 6 ? 'medium' : 'weak'
  );
  let submitting = $state(false);
</script>

<div class="register-page">
  <h1>Create Account</h1>

  {#if form?.success}
    <div class="success-banner" role="alert">
      <h2>Welcome, {form.username}!</h2>
      <p>Your account has been created successfully.</p>
    </div>
  {:else}
    <form method="POST" use:enhance={() => {
      submitting = true;
      return async ({ update }) => {
        submitting = false;
        await update({ reset: false });
      };
    }}>
      <div class="field" class:has-error={form?.errors?.username}>
        <label for="username">Username</label>
        <input id="username" name="username" type="text" value={form?.fields?.username ?? ''}
          aria-invalid={!!form?.errors?.username} aria-describedby={form?.errors?.username ? 'username-err' : undefined} />
        {#if form?.errors?.username}<p class="error" id="username-err">{form.errors.username}</p>{/if}
      </div>

      <div class="field" class:has-error={form?.errors?.email}>
        <label for="email">Email</label>
        <input id="email" name="email" type="email" value={form?.fields?.email ?? ''}
          aria-invalid={!!form?.errors?.email} aria-describedby={form?.errors?.email ? 'email-err' : undefined} />
        {#if form?.errors?.email}<p class="error" id="email-err">{form.errors.email}</p>{/if}
      </div>

      <div class="field" class:has-error={form?.errors?.password}>
        <label for="password">Password</label>
        <input id="password" name="password" type="password" bind:value={password}
          aria-invalid={!!form?.errors?.password} aria-describedby={form?.errors?.password ? 'password-err' : undefined} />
        {#if password}
          <div class="strength-bar" data-strength={strength}>
            <div class="strength-fill"></div>
            <span class="strength-label">{strength}</span>
          </div>
        {/if}
        {#if form?.errors?.password}<p class="error" id="password-err">{form.errors.password}</p>{/if}
      </div>

      <div class="field" class:has-error={form?.errors?.confirmPassword}>
        <label for="confirmPassword">Confirm Password</label>
        <input id="confirmPassword" name="confirmPassword" type="password"
          aria-invalid={!!form?.errors?.confirmPassword} aria-describedby={form?.errors?.confirmPassword ? 'confirm-err' : undefined} />
        {#if form?.errors?.confirmPassword}<p class="error" id="confirm-err">{form.errors.confirmPassword}</p>{/if}
      </div>

      <div class="field" class:has-error={form?.errors?.role}>
        <label for="role">Role</label>
        <select id="role" name="role">
          <option value="">Select a role</option>
          <option value="developer" selected={form?.fields?.role === 'developer'}>Developer</option>
          <option value="designer" selected={form?.fields?.role === 'designer'}>Designer</option>
          <option value="manager" selected={form?.fields?.role === 'manager'}>Manager</option>
        </select>
        {#if form?.errors?.role}<p class="error">{form.errors.role}</p>{/if}
      </div>

      <div class="field checkbox-field" class:has-error={form?.errors?.agreeToTerms}>
        <label>
          <input type="checkbox" name="agreeToTerms" />
          I agree to the Terms of Service
        </label>
        {#if form?.errors?.agreeToTerms}<p class="error">{form.errors.agreeToTerms}</p>{/if}
      </div>

      <button type="submit" class="submit-btn" disabled={submitting}>
        {submitting ? 'Creating account...' : 'Create Account'}
      </button>
    </form>
  {/if}
</div>

<style>
  .register-page { max-inline-size: 28rem; margin-inline: auto; padding: var(--space-lg); }
  h1 { font-size: var(--text-2xl); margin-block-end: var(--space-xl); }

  .success-banner { background: oklch(90% 0.1 145); color: oklch(30% 0.1 145); padding: var(--space-lg); border-radius: var(--radius-md); text-align: center; }
  .success-banner h2 { font-size: var(--text-xl); margin-block-end: var(--space-xs); }

  form { display: flex; flex-direction: column; gap: var(--space-lg); }
  .field { display: flex; flex-direction: column; gap: var(--space-2xs); }
  label { font-size: var(--text-sm); font-weight: 600; color: var(--color-text); }
  input[type='text'], input[type='email'], input[type='password'], select {
    padding: var(--space-sm); border: 1px solid var(--color-border); border-radius: var(--radius-sm);
    font-size: var(--text-base); background: var(--color-surface-1); color: var(--color-text);
  }
  .has-error input, .has-error select { border-color: oklch(55% 0.2 25); }
  .error { font-size: var(--text-sm); color: oklch(55% 0.2 25); }

  .checkbox-field label { display: flex; align-items: center; gap: var(--space-xs); font-weight: 400; }

  .strength-bar { display: flex; align-items: center; gap: var(--space-sm); }
  .strength-fill { block-size: 4px; border-radius: var(--radius-full); flex: 1; }
  .strength-bar[data-strength='weak'] .strength-fill { background: oklch(55% 0.2 25); inline-size: 33%; }
  .strength-bar[data-strength='medium'] .strength-fill { background: oklch(70% 0.15 80); inline-size: 66%; }
  .strength-bar[data-strength='strong'] .strength-fill { background: oklch(55% 0.2 145); inline-size: 100%; }
  .strength-label { font-size: var(--text-xs); color: var(--color-text-muted); text-transform: capitalize; }

  .submit-btn { padding: var(--space-sm) var(--space-lg); background: oklch(55% 0.2 250); color: white; border: none; border-radius: var(--radius-sm); font-size: var(--text-base); font-weight: 600; cursor: pointer; }
  .submit-btn:disabled { opacity: 0.7; cursor: wait; }
</style>
```

### Explanation

Server-side validation is the only validation that matters for security — client-side validation is a UX convenience. Valibot's `v.pipe()` composes validators into readable chains, and `v.forward()` attaches cross-field checks (like password confirmation) to a specific field's error. The pattern of returning `{ errors, fields }` in `fail()` lets the template show per-field errors and repopulate values. Passwords are deliberately excluded from the returned `fields` for security. The strength indicator is a client-side `$derived` that provides instant feedback without affecting server validation.
</details>
