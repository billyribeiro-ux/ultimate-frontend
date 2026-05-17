---
module: 1
exercise: 1
title: Profile Card from Scratch
difficulty: beginner
estimated_time: 10
skills_tested:
  - three-block file structure
  - template expressions
  - scoped styles with PE7 tokens
---

# Exercise 1.1 — Profile Card from Scratch

## Brief

Build a single Svelte component that renders a profile card with a name, role, and avatar placeholder. The card must use PE7 tokens for all styling values and demonstrate the three-block structure (script, markup, style).

## Requirements

1. Create a file at `src/routes/exercises/01-foundation/01/+page.svelte`
2. Define a TypeScript interface `ProfileData` with `name: string`, `role: string`, and `avatarUrl: string`
3. Declare a variable typed as `ProfileData` with your own data
4. Render the name in an `<h1>`, the role in a `<p>`, and the avatar as an `<img>`
5. Style the card using only PE7 tokens (no raw color values, no raw spacing values)
6. The card must have a visible border, rounded corners, and a shadow
7. The component must pass TypeScript strict mode with zero errors

## Constraints

- No external component libraries
- No raw OKLCH, hex, or pixel values — only `var(--token-name)` references
- No inline styles

## Hints (progressive)

<details>
<summary>Hint 1 (free)</summary>

Your file needs exactly three blocks: `<script lang="ts">`, the HTML markup, and `<style>`. Define the interface inside the script block, then use curly braces in the template to interpolate values.
</details>

<details>
<summary>Hint 2 (conceptual)</summary>

The interface defines the shape. The variable holds the data. The template reads from the variable using `{variable.property}` syntax. For styling, reference tokens like `var(--color-surface-2)` for backgrounds, `var(--radius-md)` for corners, and `var(--shadow-md)` for elevation.
</details>

<details>
<summary>Hint 3 (code sketch)</summary>

```svelte
<script lang="ts">
  interface ProfileData { name: string; role: string; avatarUrl: string }
  const profile: ProfileData = { /* your data */ }
</script>

<article class="card">
  <img src={profile.avatarUrl} alt="{profile.name} avatar" />
  <h1>{profile.name}</h1>
  <p>{profile.role}</p>
</article>

<style>
  .card {
    background: var(--color-surface-2);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-md);
    padding: var(--space-lg);
    /* center content */
  }
</style>
```
</details>

## Solution

<details>
<summary>Full solution (click to reveal)</summary>

```svelte
<script lang="ts">
  interface ProfileData {
    name: string;
    role: string;
    avatarUrl: string;
  }

  const profile: ProfileData = {
    name: 'Ada Lovelace',
    role: 'Principal Engineer',
    avatarUrl: 'https://api.dicebear.com/8.x/shapes/svg?seed=ada'
  };
</script>

<article class="card">
  <img class="avatar" src={profile.avatarUrl} alt="{profile.name} avatar" />
  <h1>{profile.name}</h1>
  <p class="role">{profile.role}</p>
</article>

<style>
  .card {
    background: var(--color-surface-2);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-md);
    padding: var(--space-lg);
    max-inline-size: 20rem;
    text-align: center;
  }

  .avatar {
    inline-size: 5rem;
    block-size: 5rem;
    border-radius: var(--radius-full);
    margin-inline: auto;
    margin-block-end: var(--space-md);
  }

  h1 {
    font-size: var(--text-lg);
    color: var(--color-text);
    margin-block-end: var(--space-xs);
  }

  .role {
    font-size: var(--text-sm);
    color: var(--color-text-muted);
  }
</style>
```

### Explanation

This solution demonstrates the fundamental Svelte 5 pattern: a typed script block providing data, markup consuming that data via template expressions, and scoped styles referencing PE7 design tokens. The `interface` ensures type safety at compile time. Every visual property uses a token — this means the card automatically adapts to dark mode (since the tokens have dark-mode overrides in `app.css`) and fluid viewport scaling. The scoped `<style>` block means these class names cannot leak to other components.
</details>
