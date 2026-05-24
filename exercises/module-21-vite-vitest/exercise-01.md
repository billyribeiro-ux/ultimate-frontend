---
module: 21
exercise: 1
title: Environment Variable Security Audit
difficulty: beginner
estimated_time: 15
skills_tested:
  - $env/static/private vs $env/static/public
  - Vite env variable exposure rules
  - SvelteKit environment module conventions
---

# Exercise 21.1 — Environment Variable Security Audit

## Brief

You have inherited a SvelteKit project with environment variables scattered across `.env`, `vite.config.ts`, and various source files. Some secrets are accidentally exposed to the client bundle. Your job is to audit the codebase, identify every leaked secret, and fix each one by moving it to the correct import path.

## Requirements

1. Create a file at `src/routes/exercises/21-vite-vitest/01/+page.svelte` that displays an audit report
2. Given the following `.env` file, identify which variables are safe for the client and which must remain server-only:
   ```
   PUBLIC_APP_NAME=MyApp
   DATABASE_URL=postgres://user:pass@db.internal:5432/prod
   PUBLIC_API_BASE=https://api.example.com
   STRIPE_SECRET_KEY=sk_live_abc123
   VITE_ANALYTICS_ID=UA-12345
   SESSION_SECRET=super-secret-session-key
   PUBLIC_FEATURE_FLAGS=dark-mode,beta-search
   ```
3. For each variable, specify whether it should be imported from `$env/static/private`, `$env/static/public`, or `$env/dynamic/private`
4. Create a typed interface `AuditEntry` with fields: `name: string`, `currentLocation: string`, `correctLocation: string`, `isLeaked: boolean`, `severity: 'critical' | 'warning' | 'safe'`
5. Render the audit as a table with color-coded severity indicators using PE7 tokens
6. Show a summary count: how many critical, warning, and safe variables

## Constraints

- No raw color values — only PE7 token references
- All variables and data structures must be typed with TypeScript
- The component must clearly explain WHY each variable is or is not safe

## Hints (progressive)

<details>
<summary>Hint 1 (free)</summary>

Variables prefixed with `PUBLIC_` are accessible via `$env/static/public` and are safe to expose to the client. Variables prefixed with `VITE_` are also exposed to the client by Vite's built-in behavior — this is a common source of accidental leaks. All other variables are server-only and must use `$env/static/private`.
</details>

<details>
<summary>Hint 2 (conceptual)</summary>

`DATABASE_URL`, `STRIPE_SECRET_KEY`, and `SESSION_SECRET` are server-only secrets. If any code imports them via `import.meta.env.VITE_*` or `$env/static/public`, they are leaked. The `VITE_ANALYTICS_ID` is exposed to the client by Vite automatically — if the analytics ID is not sensitive, this is fine, but it bypasses SvelteKit's explicit `PUBLIC_` convention.
</details>

<details>
<summary>Hint 3 (code sketch)</summary>

```svelte
<script lang="ts">
  interface AuditEntry {
    name: string;
    currentLocation: string;
    correctLocation: string;
    isLeaked: boolean;
    severity: 'critical' | 'warning' | 'safe';
  }

  const auditResults: AuditEntry[] = [
    {
      name: 'DATABASE_URL',
      currentLocation: 'import.meta.env',
      correctLocation: '$env/static/private',
      isLeaked: true,
      severity: 'critical'
    },
    // ... more entries
  ];
</script>
```
</details>

## Solution

<details>
<summary>Full solution (click to reveal)</summary>

```svelte
<script lang="ts">
  interface AuditEntry {
    name: string;
    currentLocation: string;
    correctLocation: string;
    isLeaked: boolean;
    severity: 'critical' | 'warning' | 'safe';
    reason: string;
  }

  const auditResults: AuditEntry[] = [
    {
      name: 'PUBLIC_APP_NAME',
      currentLocation: '$env/static/public',
      correctLocation: '$env/static/public',
      isLeaked: false,
      severity: 'safe',
      reason: 'PUBLIC_ prefix — intentionally client-visible.'
    },
    {
      name: 'DATABASE_URL',
      currentLocation: 'import.meta.env',
      correctLocation: '$env/static/private',
      isLeaked: true,
      severity: 'critical',
      reason: 'Database credentials must never reach the client. Use $env/static/private and access only in +page.server.ts or +server.ts.'
    },
    {
      name: 'PUBLIC_API_BASE',
      currentLocation: '$env/static/public',
      correctLocation: '$env/static/public',
      isLeaked: false,
      severity: 'safe',
      reason: 'PUBLIC_ prefix — the API base URL is not a secret.'
    },
    {
      name: 'STRIPE_SECRET_KEY',
      currentLocation: 'import.meta.env',
      correctLocation: '$env/static/private',
      isLeaked: true,
      severity: 'critical',
      reason: 'Stripe secret key grants full API access. Must be server-only.'
    },
    {
      name: 'VITE_ANALYTICS_ID',
      currentLocation: 'import.meta.env',
      correctLocation: '$env/static/public (rename to PUBLIC_ANALYTICS_ID)',
      isLeaked: false,
      severity: 'warning',
      reason: 'VITE_ prefix exposes to client via Vite, bypassing SvelteKit convention. Rename to PUBLIC_ANALYTICS_ID for consistency.'
    },
    {
      name: 'SESSION_SECRET',
      currentLocation: 'import.meta.env',
      correctLocation: '$env/static/private',
      isLeaked: true,
      severity: 'critical',
      reason: 'Session signing secret must be server-only. Exposure allows session forgery.'
    },
    {
      name: 'PUBLIC_FEATURE_FLAGS',
      currentLocation: '$env/static/public',
      correctLocation: '$env/static/public',
      isLeaked: false,
      severity: 'safe',
      reason: 'PUBLIC_ prefix — feature flag names are not sensitive.'
    }
  ];

  const criticalCount: number = auditResults.filter(e => e.severity === 'critical').length;
  const warningCount: number = auditResults.filter(e => e.severity === 'warning').length;
  const safeCount: number = auditResults.filter(e => e.severity === 'safe').length;
</script>

<section class="audit">
  <h1>Environment Variable Security Audit</h1>

  <div class="summary">
    <span class="badge badge--critical">{criticalCount} critical</span>
    <span class="badge badge--warning">{warningCount} warning</span>
    <span class="badge badge--safe">{safeCount} safe</span>
  </div>

  <table>
    <thead>
      <tr>
        <th>Variable</th>
        <th>Current</th>
        <th>Correct</th>
        <th>Severity</th>
        <th>Reason</th>
      </tr>
    </thead>
    <tbody>
      {#each auditResults as entry (entry.name)}
        <tr class="row--{entry.severity}">
          <td><code>{entry.name}</code></td>
          <td><code>{entry.currentLocation}</code></td>
          <td><code>{entry.correctLocation}</code></td>
          <td><span class="badge badge--{entry.severity}">{entry.severity}</span></td>
          <td>{entry.reason}</td>
        </tr>
      {/each}
    </tbody>
  </table>
</section>

<style>
  .audit {
    padding: var(--space-lg);
  }

  .summary {
    display: flex;
    gap: var(--space-sm);
    margin-block-end: var(--space-lg);
  }

  .badge {
    font-size: var(--text-xs);
    font-weight: 700;
    padding: 0.2em 0.6em;
    border-radius: var(--radius-full);
    text-transform: uppercase;
  }

  .badge--critical {
    background: oklch(85% 0.12 25);
    color: oklch(30% 0.12 25);
  }

  .badge--warning {
    background: oklch(88% 0.1 85);
    color: oklch(30% 0.1 85);
  }

  .badge--safe {
    background: oklch(85% 0.1 145);
    color: oklch(30% 0.1 145);
  }

  table {
    inline-size: 100%;
    border-collapse: collapse;
    font-size: var(--text-sm);
  }

  th, td {
    padding: var(--space-sm);
    text-align: start;
    border-block-end: 1px solid var(--color-border);
  }

  th {
    background: var(--color-surface-2);
    font-weight: 700;
  }
</style>
```

### Explanation

The key insight is SvelteKit's three-tier environment variable system: `$env/static/public` for client-safe values (must have `PUBLIC_` prefix), `$env/static/private` for server-only secrets, and `$env/dynamic/*` for values that change between requests. Vite's own `VITE_` prefix convention also exposes variables to the client, but SvelteKit's `PUBLIC_` convention is preferred because it is explicit and enforced at build time. Any variable without `PUBLIC_` that ends up in client code is a security leak.
</details>
