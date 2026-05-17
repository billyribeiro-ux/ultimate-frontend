---
module: 12
exercise: 5
title: Deployment Configuration
difficulty: principal
estimated_time: 60
skills_tested:
  - adapter selection
  - environment configuration
  - build optimization
  - production checklist
---

# Exercise 12.5 — Deployment Configuration

## Brief

Configure a SvelteKit application for three different deployment targets (Node.js server, static hosting, and serverless), documenting the adapter configuration, environment variables, and build output for each. Create a deployment checklist component that validates the configuration.

## Requirements

1. Create three `svelte.config.js` example files (as TypeScript objects in a data file) showing adapter-node, adapter-static, and adapter-auto configurations
2. Create `src/lib/data/deployment.ts` with typed deployment target metadata
3. Create `src/routes/deploy/+page.svelte` that renders a comparison table of all three targets
4. Show for each target: adapter name, output directory, environment variables needed, supported features (SSR, prerender, API routes, form actions), and estimated cold-start time
5. Create a "Pre-deployment Checklist" section with checkable items: environment variables set, build succeeds, error pages exist, SEO meta tags present, images optimized
6. Each checklist item shows its verification command
7. Add a build output analyzer section that explains what files Vite produces

## Constraints

- No actual deployment — this is a documentation and comparison exercise
- All configuration examples must be valid SvelteKit syntax
- The comparison must be accurate for current SvelteKit
- All styles use PE7 tokens

## Hints (progressive)

<details>
<summary>Hint 1 (free)</summary>

The three main adapters are: `@sveltejs/adapter-node` (self-hosted Node.js), `@sveltejs/adapter-static` (CDN/static hosting), and `@sveltejs/adapter-auto` (auto-detects platform). Each has different capabilities and configuration options.
</details>

<details>
<summary>Hint 2 (conceptual)</summary>

`adapter-node` produces a Node.js server in `/build`. `adapter-static` produces static files in `/build` (requires all pages to be prerenderable). `adapter-auto` detects the platform (Vercel, Netlify, Cloudflare) and uses the appropriate adapter. Create a typed data structure that captures these differences.
</details>

<details>
<summary>Hint 3 (code sketch)</summary>

```typescript
interface DeployTarget {
  name: string;
  adapter: string;
  output: string;
  features: { ssr: boolean; prerender: boolean; apiRoutes: boolean; formActions: boolean };
  envVars: string[];
  coldStart: string;
}
```
</details>

## Solution

<details>
<summary>Full solution</summary>

```typescript
// src/lib/data/deployment.ts
export interface DeployTarget {
  name: string;
  adapter: string;
  installCmd: string;
  output: string;
  features: {
    ssr: boolean;
    prerender: boolean;
    apiRoutes: boolean;
    formActions: boolean;
    streaming: boolean;
  };
  envVars: string[];
  coldStart: string;
  bestFor: string;
  configExample: string;
}

export const targets: DeployTarget[] = [
  {
    name: 'Node.js Server',
    adapter: '@sveltejs/adapter-node',
    installCmd: 'pnpm add -D @sveltejs/adapter-node',
    output: 'build/',
    features: { ssr: true, prerender: true, apiRoutes: true, formActions: true, streaming: true },
    envVars: ['PORT', 'HOST', 'ORIGIN', 'DATABASE_URL'],
    coldStart: '~50ms',
    bestFor: 'Self-hosted, Docker, VPS, full control',
    configExample: `import adapter from '@sveltejs/adapter-node';
export default {
  kit: {
    adapter: adapter({
      out: 'build',
      precompress: true,
      envPrefix: ''
    })
  }
};`
  },
  {
    name: 'Static Site',
    adapter: '@sveltejs/adapter-static',
    installCmd: 'pnpm add -D @sveltejs/adapter-static',
    output: 'build/',
    features: { ssr: false, prerender: true, apiRoutes: false, formActions: false, streaming: false },
    envVars: ['PUBLIC_API_URL'],
    coldStart: '0ms (CDN)',
    bestFor: 'Blogs, docs, marketing sites, GitHub Pages',
    configExample: `import adapter from '@sveltejs/adapter-static';
export default {
  kit: {
    adapter: adapter({
      pages: 'build',
      assets: 'build',
      fallback: '404.html',
      precompress: true,
      strict: true
    })
  }
};`
  },
  {
    name: 'Auto (Platform)',
    adapter: '@sveltejs/adapter-auto',
    installCmd: 'pnpm add -D @sveltejs/adapter-auto',
    output: 'varies by platform',
    features: { ssr: true, prerender: true, apiRoutes: true, formActions: true, streaming: true },
    envVars: ['platform-specific'],
    coldStart: '~100-300ms (serverless)',
    bestFor: 'Vercel, Netlify, Cloudflare Pages',
    configExample: `import adapter from '@sveltejs/adapter-auto';
export default {
  kit: {
    adapter: adapter()
  }
};`
  }
];

export interface ChecklistItem {
  label: string;
  command: string;
  critical: boolean;
}

export const checklist: ChecklistItem[] = [
  { label: 'Build succeeds without errors', command: 'pnpm build', critical: true },
  { label: 'Environment variables configured', command: 'printenv | grep -E "^(PUBLIC_|DATABASE)"', critical: true },
  { label: 'Error pages exist (+error.svelte)', command: 'find src/routes -name "+error.svelte"', critical: true },
  { label: 'SEO meta tags on all pages', command: 'grep -r "svelte:head" src/routes/', critical: true },
  { label: 'Images have width/height attributes', command: 'grep -rn "<img" src/ | grep -v "width"', critical: false },
  { label: 'No console.log in production code', command: 'grep -rn "console.log" src/lib/ src/routes/', critical: false },
  { label: 'TypeScript strict mode enabled', command: 'grep "strict" tsconfig.json', critical: false },
  { label: 'Preview works locally', command: 'pnpm preview', critical: true }
];
```

```svelte
<!-- src/routes/deploy/+page.svelte -->
<script lang="ts">
  import { targets, checklist } from '$lib/data/deployment';

  let checked = $state(new Set<number>());

  function toggleCheck(index: number) {
    if (checked.has(index)) checked.delete(index);
    else checked.add(index);
  }

  let completedCount = $derived(checked.size);
  let totalCount = $derived(checklist.length);
</script>

<div class="deploy-page">
  <h1>Deployment Guide</h1>

  <section class="comparison">
    <h2>Adapter Comparison</h2>
    <div class="table-wrapper">
      <table>
        <thead>
          <tr>
            <th>Feature</th>
            {#each targets as target}
              <th>{target.name}</th>
            {/each}
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Adapter</td>
            {#each targets as t}<td><code>{t.adapter}</code></td>{/each}
          </tr>
          <tr>
            <td>SSR</td>
            {#each targets as t}<td class:yes={t.features.ssr} class:no={!t.features.ssr}>{t.features.ssr ? 'Yes' : 'No'}</td>{/each}
          </tr>
          <tr>
            <td>API Routes</td>
            {#each targets as t}<td class:yes={t.features.apiRoutes} class:no={!t.features.apiRoutes}>{t.features.apiRoutes ? 'Yes' : 'No'}</td>{/each}
          </tr>
          <tr>
            <td>Streaming</td>
            {#each targets as t}<td class:yes={t.features.streaming} class:no={!t.features.streaming}>{t.features.streaming ? 'Yes' : 'No'}</td>{/each}
          </tr>
          <tr>
            <td>Cold Start</td>
            {#each targets as t}<td>{t.coldStart}</td>{/each}
          </tr>
          <tr>
            <td>Best For</td>
            {#each targets as t}<td>{t.bestFor}</td>{/each}
          </tr>
        </tbody>
      </table>
    </div>
  </section>

  <section class="checklist-section">
    <h2>Pre-deployment Checklist ({completedCount}/{totalCount})</h2>
    <ul class="checklist">
      {#each checklist as item, i}
        <li class:checked={checked.has(i)} class:critical={item.critical}>
          <button class="check-btn" onclick={() => toggleCheck(i)}>
            <span class="check-box">{checked.has(i) ? '&#10003;' : ''}</span>
            <span class="check-label">{item.label}</span>
            {#if item.critical}<span class="critical-badge">required</span>{/if}
          </button>
          <code class="check-command">{item.command}</code>
        </li>
      {/each}
    </ul>
  </section>
</div>

<style>
  .deploy-page { max-inline-size: 56rem; margin-inline: auto; padding: var(--space-lg); }
  h1 { font-size: var(--text-2xl); margin-block-end: var(--space-xl); }
  h2 { font-size: var(--text-xl); margin-block-end: var(--space-lg); }

  .table-wrapper { overflow-x: auto; margin-block-end: var(--space-2xl); }
  table { inline-size: 100%; border-collapse: collapse; }
  th, td { padding: var(--space-sm) var(--space-md); text-align: start; border-block-end: 1px solid var(--color-border); font-size: var(--text-sm); }
  th { font-weight: 600; background: var(--color-surface-2); color: var(--color-text-muted); }
  code { background: var(--color-surface-3); padding: var(--space-2xs) var(--space-xs); border-radius: var(--radius-sm); font-size: var(--text-xs); }
  .yes { color: oklch(45% 0.2 145); font-weight: 600; }
  .no { color: var(--color-text-muted); }

  .checklist { list-style: none; padding: 0; display: flex; flex-direction: column; gap: var(--space-sm); }
  .checklist li { background: var(--color-surface-2); border: 1px solid var(--color-border); border-radius: var(--radius-md); padding: var(--space-md); }
  .checklist li.checked { opacity: 0.6; }
  .check-btn { display: flex; align-items: center; gap: var(--space-sm); background: none; border: none; cursor: pointer; inline-size: 100%; text-align: start; font-size: var(--text-sm); color: var(--color-text); padding: 0; }
  .check-box { display: grid; place-items: center; inline-size: 1.25rem; block-size: 1.25rem; border: 2px solid var(--color-border); border-radius: var(--radius-sm); font-size: var(--text-xs); flex-shrink: 0; }
  .checked .check-box { background: oklch(55% 0.2 145); border-color: oklch(55% 0.2 145); color: white; }
  .critical-badge { font-size: var(--text-xs); background: oklch(90% 0.1 25); color: oklch(40% 0.15 25); padding: var(--space-2xs) var(--space-xs); border-radius: var(--radius-full); }
  .check-command { display: block; margin-block-start: var(--space-xs); margin-inline-start: 2rem; }
</style>
```

### Explanation

Choosing the right SvelteKit adapter is a deployment architecture decision. `adapter-node` gives full control and the fastest cold starts for self-hosted environments. `adapter-static` produces zero-runtime files ideal for CDN hosting but sacrifices SSR and API routes. `adapter-auto` is the default and auto-detects the platform, which is convenient but hides the configuration. The pre-deployment checklist catches the most common issues: missing error pages, unset environment variables, console.log leaks, and missing image dimensions. Running these checks before every deployment prevents the kind of issues that only surface in production.
</details>
