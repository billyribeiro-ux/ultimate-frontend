---
module: 9
exercise: 3
title: Form Remote Function with Validation
difficulty: advanced
estimated_time: 30
skills_tested:
  - form remote functions
  - Valibot schema validation
  - server-side error handling
  - progressive enhancement
---

# Exercise 9b.3 — Form Remote Function with Validation

## Brief

Build a contact form that uses a form remote function for server-side submission with Valibot schema validation. The form works without JavaScript (progressive enhancement) and shows inline validation errors returned from the server.

## Requirements

1. Create a Valibot schema in `src/lib/schemas/contact.ts` validating `name` (min 2 chars), `email` (valid email), and `message` (min 10 chars, max 500 chars)
2. Create a form remote function in `src/lib/server/actions/contact.ts` that validates the form data against the schema
3. On validation failure, return the field errors and submitted values so the form repopulates
4. On success, return a success message
5. Create `src/routes/contact/+page.svelte` with a `<form>` that submits to the remote function
6. Display inline validation errors next to each field
7. Show a success banner when the form submits successfully

## Constraints

- The form must work with JavaScript disabled (server round-trip)
- Use Valibot (not Zod) for schema validation
- No client-side validation — all validation happens server-side
- All styles use PE7 tokens

## Hints (progressive)

<details>
<summary>Hint 1 (free)</summary>

Form remote functions handle `<form>` submissions on the server. Define a Valibot schema with `v.object()`, `v.string()`, `v.pipe()`, `v.minLength()`, `v.email()`, etc. In the function, parse the FormData against the schema and return structured errors if it fails.
</details>

<details>
<summary>Hint 2 (conceptual)</summary>

The remote function receives `FormData`. Extract fields with `.get()`. Run `v.safeParse(schema, data)` — if it fails, return `{ success: false, issues: result.issues, fields: data }`. The page reads these and renders inline errors. If it succeeds, return `{ success: true }`.
</details>

<details>
<summary>Hint 3 (code sketch)</summary>

```typescript
import * as v from 'valibot';

const ContactSchema = v.object({
  name: v.pipe(v.string(), v.minLength(2, 'Name must be at least 2 characters')),
  email: v.pipe(v.string(), v.email('Invalid email address')),
  message: v.pipe(v.string(), v.minLength(10, 'Message too short'), v.maxLength(500, 'Message too long'))
});
```
</details>

## Solution

<details>
<summary>Full solution</summary>

```typescript
// src/lib/schemas/contact.ts
import * as v from 'valibot';

export const ContactSchema = v.object({
  name: v.pipe(v.string(), v.minLength(2, 'Name must be at least 2 characters')),
  email: v.pipe(v.string(), v.email('Please enter a valid email address')),
  message: v.pipe(
    v.string(),
    v.minLength(10, 'Message must be at least 10 characters'),
    v.maxLength(500, 'Message must be 500 characters or fewer')
  )
});

export type ContactData = v.InferOutput<typeof ContactSchema>;
```

```typescript
// src/lib/server/actions/contact.ts
import * as v from 'valibot';
import { ContactSchema } from '$lib/schemas/contact';

interface ContactResult {
  success: boolean;
  message?: string;
  issues?: Record<string, string>;
  fields?: Record<string, string>;
}

export async function submitContact(formData: FormData): Promise<ContactResult> {
  const raw = {
    name: formData.get('name') as string ?? '',
    email: formData.get('email') as string ?? '',
    message: formData.get('message') as string ?? ''
  };

  const result = v.safeParse(ContactSchema, raw);

  if (!result.success) {
    const issues: Record<string, string> = {};
    for (const issue of result.issues) {
      const path = issue.path?.[0]?.key;
      if (typeof path === 'string' && !issues[path]) {
        issues[path] = issue.message;
      }
    }
    return { success: false, issues, fields: raw };
  }

  // Simulate sending email
  await new Promise((r) => setTimeout(r, 500));

  return { success: true, message: 'Thank you! Your message has been sent.' };
}
```

```svelte
<!-- src/routes/contact/+page.svelte -->
<script lang="ts">
  import { submitContact } from '$lib/server/actions/contact';

  let result = $state<{
    success: boolean;
    message?: string;
    issues?: Record<string, string>;
    fields?: Record<string, string>;
  } | null>(null);

  let submitting = $state(false);

  async function handleSubmit(e: SubmitEvent) {
    e.preventDefault();
    submitting = true;

    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    result = await submitContact(formData);

    if (result.success) {
      form.reset();
    }

    submitting = false;
  }
</script>

<div class="contact-page">
  <h1>Contact Us</h1>

  {#if result?.success}
    <div class="success-banner" role="alert">
      <p>{result.message}</p>
    </div>
  {/if}

  <form onsubmit={handleSubmit} novalidate>
    <div class="field" class:has-error={result?.issues?.name}>
      <label for="name">Name</label>
      <input
        id="name"
        name="name"
        type="text"
        value={result?.fields?.name ?? ''}
        aria-invalid={!!result?.issues?.name}
        aria-describedby={result?.issues?.name ? 'name-error' : undefined}
      />
      {#if result?.issues?.name}
        <p class="error" id="name-error">{result.issues.name}</p>
      {/if}
    </div>

    <div class="field" class:has-error={result?.issues?.email}>
      <label for="email">Email</label>
      <input
        id="email"
        name="email"
        type="email"
        value={result?.fields?.email ?? ''}
        aria-invalid={!!result?.issues?.email}
        aria-describedby={result?.issues?.email ? 'email-error' : undefined}
      />
      {#if result?.issues?.email}
        <p class="error" id="email-error">{result.issues.email}</p>
      {/if}
    </div>

    <div class="field" class:has-error={result?.issues?.message}>
      <label for="message">Message</label>
      <textarea
        id="message"
        name="message"
        rows="5"
        aria-invalid={!!result?.issues?.message}
        aria-describedby={result?.issues?.message ? 'message-error' : undefined}
      >{result?.fields?.message ?? ''}</textarea>
      {#if result?.issues?.message}
        <p class="error" id="message-error">{result.issues.message}</p>
      {/if}
    </div>

    <button type="submit" class="submit-btn" disabled={submitting}>
      {submitting ? 'Sending...' : 'Send Message'}
    </button>
  </form>
</div>

<style>
  .contact-page {
    max-inline-size: 32rem;
    margin-inline: auto;
    padding: var(--space-lg);
  }

  h1 {
    font-size: var(--text-2xl);
    margin-block-end: var(--space-xl);
  }

  .success-banner {
    background: oklch(90% 0.1 145);
    color: oklch(30% 0.1 145);
    padding: var(--space-md);
    border-radius: var(--radius-md);
    margin-block-end: var(--space-lg);
    font-weight: 600;
  }

  form {
    display: flex;
    flex-direction: column;
    gap: var(--space-lg);
  }

  .field {
    display: flex;
    flex-direction: column;
    gap: var(--space-2xs);
  }

  label {
    font-size: var(--text-sm);
    font-weight: 600;
    color: var(--color-text);
  }

  input, textarea {
    padding: var(--space-sm);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-sm);
    font-size: var(--text-base);
    background: var(--color-surface-1);
    color: var(--color-text);
    font-family: inherit;
  }

  .has-error input,
  .has-error textarea {
    border-color: oklch(55% 0.2 25);
  }

  .error {
    font-size: var(--text-sm);
    color: oklch(55% 0.2 25);
  }

  .submit-btn {
    padding: var(--space-sm) var(--space-lg);
    background: oklch(55% 0.2 250);
    color: white;
    border: none;
    border-radius: var(--radius-sm);
    font-size: var(--text-base);
    font-weight: 600;
    cursor: pointer;
  }

  .submit-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
</style>
```

### Explanation

Form remote functions combine the simplicity of traditional form submissions with the power of server-side validation. Valibot provides a schema-first approach where the validation rules are defined once and shared between client and server. The key pattern is returning both the issues and the submitted field values on failure, so the form can repopulate and show inline errors without losing user input. The `aria-invalid` and `aria-describedby` attributes ensure screen readers announce validation errors. In production, the success handler would send an actual email or write to a database.
</details>
