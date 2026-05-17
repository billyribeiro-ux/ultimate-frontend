---
module: 9
exercise: 1
title: Query Remote Function
difficulty: beginner
estimated_time: 10
skills_tested:
  - query remote function
  - server-only data fetching
  - typed return values
---

# Exercise 9b.1 — Query Remote Function

## Brief

Create a simple query remote function that fetches a list of team members from the server and renders them in the page. The query function lives in a server file, runs only on the server, and its return type flows automatically to the component.

## Requirements

1. Create `src/lib/server/queries/team.ts` exporting a query function that returns an array of team members
2. Each team member has `id: number`, `name: string`, `role: string`, and `department: string`
3. The query function simulates a 200ms database call with a delay
4. Create `src/routes/team/+page.svelte` that calls the query function and renders the result
5. Show a loading state while the query resolves
6. Display members in a responsive grid of cards with PE7 tokens
7. The TypeScript types must flow end-to-end without manual annotation in the page

## Constraints

- The query function must be in a `server/` directory — it cannot run in the browser
- No `+page.server.ts` load function — use the remote function pattern directly
- No `any` types

## Hints (progressive)

<details>
<summary>Hint 1 (free)</summary>

Remote functions in SvelteKit are server-only functions that can be called from components. They are defined in files under `$lib/server/` and imported with the `$lib/server/` alias. SvelteKit automatically handles the RPC boundary.
</details>

<details>
<summary>Hint 2 (conceptual)</summary>

Define the function in a `.ts` file inside `$lib/server/`. Export it as a regular async function. In the component, import it and call it — SvelteKit transforms the call into a fetch request at build time. The return type is preserved across the boundary.
</details>

<details>
<summary>Hint 3 (code sketch)</summary>

```typescript
// src/lib/server/queries/team.ts
export async function getTeamMembers() {
  await new Promise(r => setTimeout(r, 200));
  return [
    { id: 1, name: 'Ada Lovelace', role: 'Principal Engineer', department: 'Core' }
  ];
}
```
</details>

## Solution

<details>
<summary>Full solution</summary>

```typescript
// src/lib/server/queries/team.ts
interface TeamMember {
  id: number;
  name: string;
  role: string;
  department: string;
}

export async function getTeamMembers(): Promise<TeamMember[]> {
  await new Promise((r) => setTimeout(r, 200));

  return [
    { id: 1, name: 'Ada Lovelace', role: 'Principal Engineer', department: 'Core' },
    { id: 2, name: 'Grace Hopper', role: 'Staff Engineer', department: 'Infrastructure' },
    { id: 3, name: 'Alan Turing', role: 'Senior Engineer', department: 'Security' },
    { id: 4, name: 'Margaret Hamilton', role: 'Engineering Manager', department: 'Platform' },
    { id: 5, name: 'Linus Torvalds', role: 'Principal Engineer', department: 'Core' }
  ];
}
```

```svelte
<!-- src/routes/team/+page.svelte -->
<script lang="ts">
  import { getTeamMembers } from '$lib/server/queries/team';

  const membersPromise = getTeamMembers();
</script>

<div class="team-page">
  <h1>Our Team</h1>

  {#await membersPromise}
    <div class="loading">Loading team members...</div>
  {:then members}
    <div class="members-grid">
      {#each members as member (member.id)}
        <article class="member-card">
          <h2>{member.name}</h2>
          <p class="role">{member.role}</p>
          <span class="department">{member.department}</span>
        </article>
      {/each}
    </div>
  {:catch error}
    <p class="error">Failed to load team: {error.message}</p>
  {/await}
</div>

<style>
  .team-page {
    max-inline-size: 60rem;
    margin-inline: auto;
    padding: var(--space-lg);
  }

  h1 {
    font-size: var(--text-2xl);
    color: var(--color-text);
    margin-block-end: var(--space-xl);
  }

  .loading {
    text-align: center;
    padding: var(--space-2xl);
    color: var(--color-text-muted);
  }

  .members-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(16rem, 1fr));
    gap: var(--space-md);
  }

  .member-card {
    background: var(--color-surface-2);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    padding: var(--space-lg);
  }

  .member-card h2 {
    font-size: var(--text-lg);
    color: var(--color-text);
    margin-block-end: var(--space-2xs);
  }

  .role {
    font-size: var(--text-sm);
    color: var(--color-text-muted);
    margin-block-end: var(--space-sm);
  }

  .department {
    font-size: var(--text-xs);
    padding: var(--space-2xs) var(--space-xs);
    background: var(--color-surface-3);
    border-radius: var(--radius-full);
    color: var(--color-text-muted);
  }

  .error {
    color: oklch(55% 0.2 25);
    text-align: center;
    padding: var(--space-lg);
  }
</style>
```

### Explanation

Query remote functions are SvelteKit's way of calling server-only code directly from components without defining a separate API route or load function. The function lives in `$lib/server/`, which means it can access databases, secrets, and other server-only resources. SvelteKit transforms the import into an RPC call at build time. The TypeScript return type crosses the boundary automatically, giving you end-to-end type safety without manual type definitions on the client side.
</details>
