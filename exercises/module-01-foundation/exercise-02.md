---
module: 1
exercise: 2
title: Typed Contact Form
difficulty: intermediate
estimated_time: 20
skills_tested:
  - TypeScript interfaces
  - PE7 fluid spacing
  - form markup structure
  - token-based styling
---

# Exercise 1.2 — Typed Contact Form

## Brief

Create a contact form component that defines its field configuration through a TypeScript interface. The form must be fully styled with PE7 tokens, use fluid spacing between fields, and render labels, inputs, and a submit button. This is a static form — no reactivity or submission logic yet.

## Requirements

1. Create `src/routes/exercises/01-foundation/02/+page.svelte`
2. Define an interface `FormField` with properties: `id: string`, `label: string`, `type: 'text' | 'email' | 'textarea'`, `required: boolean`
3. Define an array of `FormField` objects representing Name, Email, and Message fields
4. Render each field with a proper `<label>` linked to its input via `for`/`id`
5. The Message field must render as a `<textarea>`, others as `<input>`
6. All spacing must use `var(--space-*)` tokens
7. Inputs must have visible focus states using `var(--color-brand)`
8. The form must be readable on mobile (320px) without horizontal scroll

## Constraints

- No JavaScript form libraries
- No `$state` or reactivity (this is pure rendering)
- No media queries — rely on fluid tokens for responsiveness
- No raw spacing or color values

## Hints (progressive)

<details>
<summary>Hint 1 (free)</summary>

Use an `{#each}` block to iterate over the fields array and render them. Check the `type` property to decide whether to render `<input>` or `<textarea>`.
</details>

<details>
<summary>Hint 2 (conceptual)</summary>

The TypeScript union type `'text' | 'email' | 'textarea'` lets you branch in the template with an `{#if}` block. The `for` attribute on a `<label>` must match the `id` on its corresponding input. Use `display: grid` with `gap` for the form layout — fluid tokens handle spacing automatically.
</details>

<details>
<summary>Hint 3 (code sketch)</summary>

```svelte
<script lang="ts">
  interface FormField {
    id: string;
    label: string;
    type: 'text' | 'email' | 'textarea';
    required: boolean;
  }
  const fields: FormField[] = [
    { id: 'name', label: 'Name', type: 'text', required: true },
    // ...
  ];
</script>

<form class="contact-form">
  {#each fields as field}
    <div class="field">
      <label for={field.id}>{field.label}</label>
      {#if field.type === 'textarea'}
        <textarea id={field.id} required={field.required}></textarea>
      {:else}
        <input id={field.id} type={field.type} required={field.required} />
      {/if}
    </div>
  {/each}
  <button type="submit">Send</button>
</form>
```
</details>

## Solution

<details>
<summary>Full solution (click to reveal)</summary>

```svelte
<script lang="ts">
  interface FormField {
    id: string;
    label: string;
    type: 'text' | 'email' | 'textarea';
    required: boolean;
  }

  const fields: FormField[] = [
    { id: 'name', label: 'Your Name', type: 'text', required: true },
    { id: 'email', label: 'Email Address', type: 'email', required: true },
    { id: 'message', label: 'Message', type: 'textarea', required: true }
  ];
</script>

<main class="page">
  <h1>Contact Us</h1>
  <form class="contact-form">
    {#each fields as field}
      <div class="field">
        <label for={field.id}>
          {field.label}
          {#if field.required}<span class="required" aria-label="required">*</span>{/if}
        </label>
        {#if field.type === 'textarea'}
          <textarea
            id={field.id}
            name={field.id}
            required={field.required}
            rows={5}
          ></textarea>
        {:else}
          <input
            id={field.id}
            name={field.id}
            type={field.type}
            required={field.required}
          />
        {/if}
      </div>
    {/each}
    <button type="submit">Send Message</button>
  </form>
</main>

<style>
  .page {
    max-inline-size: var(--prose-max);
    margin-inline: auto;
    padding: var(--space-xl) var(--space-md);
  }

  h1 {
    font-size: var(--text-xl);
    margin-block-end: var(--space-lg);
  }

  .contact-form {
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

  .required {
    color: var(--color-error);
    margin-inline-start: 0.2em;
  }

  input,
  textarea {
    padding: var(--space-sm);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    background: var(--color-surface);
    color: var(--color-text);
    font-size: var(--text-base);
    transition: border-color var(--dur-fast) var(--ease-out);
  }

  input:focus,
  textarea:focus {
    outline: 2px solid var(--color-brand);
    outline-offset: 2px;
    border-color: var(--color-brand);
  }

  textarea {
    resize: vertical;
    min-block-size: 8rem;
  }

  button {
    padding: var(--space-sm) var(--space-lg);
    background: var(--color-brand);
    color: oklch(100% 0 0);
    font-weight: 600;
    border-radius: var(--radius-md);
    font-size: var(--text-base);
    transition: background var(--dur-fast) var(--ease-out);
  }

  button:hover {
    background: var(--color-brand-dim);
  }
</style>
```

### Explanation

This combines multiple Module 1 concepts: TypeScript interfaces define the data shape, `{#each}` iterates the fields, and PE7 tokens handle all spacing and color. The form is inherently responsive because fluid tokens scale with the viewport — no media queries needed. The `display: grid` with `gap` pattern replaces margin-based spacing, making the layout predictable. The button's white text uses an explicit OKLCH value because it represents a one-off override, not a token (in practice, you might add a `--color-on-brand` token).
</details>
