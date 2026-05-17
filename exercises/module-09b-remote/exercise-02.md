---
module: 9
exercise: 2
title: Batch Query Optimization
difficulty: intermediate
estimated_time: 20
skills_tested:
  - multiple queries
  - parallel execution
  - deduplication patterns
---

# Exercise 9b.2 — Batch Query Optimization

## Brief

Build a project dashboard that fetches project details, team members, and recent commits using three separate query functions, but batches them for parallel execution. Compare the sequential vs parallel approach visually with timing displays.

## Requirements

1. Create three query functions in `src/lib/server/queries/`: `getProject()`, `getProjectMembers(projectId)`, `getProjectCommits(projectId)`
2. Each function has a simulated delay (project: 150ms, members: 250ms, commits: 200ms)
3. Create `src/routes/project/[id]/+page.server.ts` that calls all three in parallel using `Promise.all`
4. The load function measures and returns the total load time
5. Create the page with three sections: project info, members list, and commit log
6. Display a "Sequential would take Xms, parallel took Yms" comparison
7. Type all function parameters and return values explicitly

## Constraints

- Each query function must accept typed parameters
- No sequential awaits in the load function
- All styles use PE7 tokens

## Hints (progressive)

<details>
<summary>Hint 1 (free)</summary>

Create separate files for each query function under `$lib/server/queries/`. In the load function, call all three without `await`, collect the promises, then pass them to `Promise.all`.
</details>

<details>
<summary>Hint 2 (conceptual)</summary>

The load function receives `params.id`. Pass it to each query function. The sequential time is the sum of all delays (600ms), but `Promise.all` completes in the time of the slowest query (250ms). Return both numbers for the comparison display.
</details>

<details>
<summary>Hint 3 (code sketch)</summary>

```typescript
export const load: PageServerLoad = async ({ params }) => {
  const start = performance.now();
  const [project, members, commits] = await Promise.all([
    getProject(params.id),
    getProjectMembers(params.id),
    getProjectCommits(params.id)
  ]);
  const duration = Math.round(performance.now() - start);
  return { project, members, commits, loadTime: duration, sequentialEstimate: 600 };
};
```
</details>

## Solution

<details>
<summary>Full solution</summary>

```typescript
// src/lib/server/queries/project.ts
export interface Project {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'archived' | 'paused';
}

export async function getProject(id: string): Promise<Project> {
  await new Promise((r) => setTimeout(r, 150));
  return {
    id,
    name: 'Ultimate Frontend',
    description: 'A comprehensive Svelte 5 course project',
    status: 'active'
  };
}
```

```typescript
// src/lib/server/queries/project-members.ts
export interface ProjectMember {
  id: number;
  name: string;
  role: string;
}

export async function getProjectMembers(projectId: string): Promise<ProjectMember[]> {
  await new Promise((r) => setTimeout(r, 250));
  return [
    { id: 1, name: 'Ada Lovelace', role: 'Lead' },
    { id: 2, name: 'Grace Hopper', role: 'Engineer' },
    { id: 3, name: 'Alan Turing', role: 'Engineer' }
  ];
}
```

```typescript
// src/lib/server/queries/project-commits.ts
export interface Commit {
  sha: string;
  message: string;
  author: string;
  date: string;
}

export async function getProjectCommits(projectId: string): Promise<Commit[]> {
  await new Promise((r) => setTimeout(r, 200));
  return [
    { sha: 'a1b2c3d', message: 'feat: add streaming support', author: 'Ada', date: '2 hours ago' },
    { sha: 'e4f5g6h', message: 'fix: resolve type error in load', author: 'Grace', date: '5 hours ago' },
    { sha: 'i7j8k9l', message: 'refactor: extract query functions', author: 'Alan', date: '1 day ago' }
  ];
}
```

```typescript
// src/routes/project/[id]/+page.server.ts
import type { PageServerLoad } from './$types';
import { getProject } from '$lib/server/queries/project';
import { getProjectMembers } from '$lib/server/queries/project-members';
import { getProjectCommits } from '$lib/server/queries/project-commits';

export const load: PageServerLoad = async ({ params }) => {
  const start = performance.now();

  const [project, members, commits] = await Promise.all([
    getProject(params.id),
    getProjectMembers(params.id),
    getProjectCommits(params.id)
  ]);

  const loadTime = Math.round(performance.now() - start);

  return {
    project,
    members,
    commits,
    loadTime,
    sequentialEstimate: 600
  };
};
```

```svelte
<!-- src/routes/project/[id]/+page.svelte -->
<script lang="ts">
  import type { PageData } from './$types';

  let { data }: { data: PageData } = $props();

  let savings = $derived(data.sequentialEstimate - data.loadTime);
</script>

<div class="project-page">
  <header>
    <h1>{data.project.name}</h1>
    <div class="timing">
      <span class="parallel">Parallel: {data.loadTime}ms</span>
      <span class="sequential">Sequential would be: {data.sequentialEstimate}ms</span>
      <span class="savings">Saved {savings}ms</span>
    </div>
  </header>

  <div class="grid">
    <section class="card">
      <h2>Project Info</h2>
      <p>{data.project.description}</p>
      <span class="status" data-status={data.project.status}>{data.project.status}</span>
    </section>

    <section class="card">
      <h2>Team ({data.members.length})</h2>
      <ul class="member-list">
        {#each data.members as member (member.id)}
          <li>
            <span class="member-name">{member.name}</span>
            <span class="member-role">{member.role}</span>
          </li>
        {/each}
      </ul>
    </section>

    <section class="card">
      <h2>Recent Commits</h2>
      <ul class="commit-list">
        {#each data.commits as commit}
          <li>
            <code class="sha">{commit.sha}</code>
            <span class="msg">{commit.message}</span>
            <time>{commit.date}</time>
          </li>
        {/each}
      </ul>
    </section>
  </div>
</div>

<style>
  .project-page {
    max-inline-size: 64rem;
    margin-inline: auto;
    padding: var(--space-lg);
  }

  header {
    margin-block-end: var(--space-xl);
  }

  h1 {
    font-size: var(--text-2xl);
    margin-block-end: var(--space-sm);
  }

  .timing {
    display: flex;
    gap: var(--space-md);
    font-size: var(--text-sm);
  }

  .parallel { color: oklch(55% 0.2 145); font-weight: 600; }
  .sequential { color: var(--color-text-muted); }
  .savings { color: oklch(55% 0.2 250); font-weight: 600; }

  .grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(18rem, 1fr));
    gap: var(--space-md);
  }

  .card {
    background: var(--color-surface-2);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    padding: var(--space-lg);
  }

  .card h2 {
    font-size: var(--text-lg);
    margin-block-end: var(--space-md);
  }

  .status {
    display: inline-block;
    margin-block-start: var(--space-sm);
    padding: var(--space-2xs) var(--space-xs);
    border-radius: var(--radius-full);
    font-size: var(--text-xs);
    font-weight: 600;
    text-transform: uppercase;
  }

  .status[data-status='active'] { background: oklch(85% 0.15 145); color: oklch(30% 0.1 145); }
  .status[data-status='archived'] { background: var(--color-surface-3); color: var(--color-text-muted); }

  .member-list, .commit-list {
    list-style: none;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: var(--space-xs);
  }

  .member-list li {
    display: flex;
    justify-content: space-between;
    font-size: var(--text-sm);
  }

  .member-role { color: var(--color-text-muted); }

  .commit-list li {
    display: flex;
    flex-direction: column;
    gap: var(--space-2xs);
    font-size: var(--text-sm);
    padding-block-end: var(--space-xs);
    border-block-end: 1px solid var(--color-border);
  }

  .sha {
    font-size: var(--text-xs);
    color: oklch(55% 0.2 250);
  }

  time {
    font-size: var(--text-xs);
    color: var(--color-text-muted);
  }
</style>
```

### Explanation

Batching queries with `Promise.all` is the most common and impactful optimization for load functions. By running independent queries concurrently, the total load time equals the slowest individual query rather than the sum. This exercise makes the savings visible and measurable. In production, replace simulated delays with real database calls or API requests. The same principle applies to any load function — layout or page — and composing small, focused query functions makes testing and reuse straightforward.
</details>
