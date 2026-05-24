---
module: 21
exercise: 2
title: Custom Vite Plugin — Build Timestamp
difficulty: intermediate
estimated_time: 25
skills_tested:
  - Vite plugin API
  - virtual modules
  - transform hooks
  - TypeScript module declarations
---

# Exercise 21.2 — Custom Vite Plugin — Build Timestamp

## Brief

Build a custom Vite plugin that injects a virtual module `virtual:build-info` into your SvelteKit project. The module exports the build timestamp, Git commit hash (if available), and Node.js version. Import the module in a footer component to display "Built at {timestamp} from {commit}".

## Requirements

1. Create a Vite plugin in `src/lib/vite-plugins/build-info.ts`
2. The plugin must provide a virtual module `virtual:build-info` with these exports:
   - `buildTimestamp: string` (ISO 8601 format)
   - `gitCommit: string` (short hash, or 'unknown' if not in a Git repo)
   - `nodeVersion: string`
3. Create a TypeScript declaration file `src/lib/vite-plugins/build-info.d.ts` so imports are type-safe
4. Create `src/routes/exercises/21-vite-vitest/02/+page.svelte` that imports from `virtual:build-info` and displays all three values
5. The plugin must use the `resolveId` and `load` hooks
6. Style the output as a footer-style info bar using PE7 tokens

## Constraints

- The plugin must return a proper `Plugin` type from Vite
- No external dependencies beyond Node.js built-ins and Vite
- TypeScript strict mode compliance
- The Git commit must be obtained via `child_process.execSync` with error handling

## Hints (progressive)

<details>
<summary>Hint 1 (free)</summary>

A Vite virtual module plugin has two hooks: `resolveId` intercepts the import and returns a prefixed ID (convention: `\0virtual:build-info`), and `load` returns the module source code as a string when that ID is requested.
</details>

<details>
<summary>Hint 2 (conceptual)</summary>

The `resolveId` hook checks if `id === 'virtual:build-info'` and returns `'\0virtual:build-info'`. The `load` hook checks if `id === '\0virtual:build-info'` and returns `export const buildTimestamp = "${new Date().toISOString()}";` etc. The `\0` prefix is a Rollup convention that tells other plugins not to try to resolve this ID.
</details>

<details>
<summary>Hint 3 (code sketch)</summary>

```typescript
import type { Plugin } from 'vite';
import { execSync } from 'child_process';

export function buildInfoPlugin(): Plugin {
  const virtualModuleId = 'virtual:build-info';
  const resolvedVirtualModuleId = '\0' + virtualModuleId;

  return {
    name: 'build-info',
    resolveId(id: string) {
      if (id === virtualModuleId) return resolvedVirtualModuleId;
    },
    load(id: string) {
      if (id === resolvedVirtualModuleId) {
        let gitCommit = 'unknown';
        try {
          gitCommit = execSync('git rev-parse --short HEAD').toString().trim();
        } catch { /* not a git repo */ }

        return `
          export const buildTimestamp = "${new Date().toISOString()}";
          export const gitCommit = "${gitCommit}";
          export const nodeVersion = "${process.version}";
        `;
      }
    }
  };
}
```
</details>

## Solution

<details>
<summary>Full solution (click to reveal)</summary>

**`src/lib/vite-plugins/build-info.ts`**

```typescript
import type { Plugin } from 'vite';
import { execSync } from 'child_process';

export function buildInfoPlugin(): Plugin {
  const virtualModuleId: string = 'virtual:build-info';
  const resolvedId: string = '\0' + virtualModuleId;

  return {
    name: 'vite-plugin-build-info',

    resolveId(id: string): string | undefined {
      if (id === virtualModuleId) return resolvedId;
      return undefined;
    },

    load(id: string): string | undefined {
      if (id !== resolvedId) return undefined;

      const buildTimestamp: string = new Date().toISOString();

      let gitCommit: string = 'unknown';
      try {
        gitCommit = execSync('git rev-parse --short HEAD', {
          encoding: 'utf-8',
          timeout: 5000
        }).trim();
      } catch {
        // Not in a Git repository or git not installed
      }

      const nodeVersion: string = process.version;

      return [
        `export const buildTimestamp = ${JSON.stringify(buildTimestamp)};`,
        `export const gitCommit = ${JSON.stringify(gitCommit)};`,
        `export const nodeVersion = ${JSON.stringify(nodeVersion)};`
      ].join('\n');
    }
  };
}
```

**`src/lib/vite-plugins/build-info.d.ts`**

```typescript
declare module 'virtual:build-info' {
  export const buildTimestamp: string;
  export const gitCommit: string;
  export const nodeVersion: string;
}
```

**`src/routes/exercises/21-vite-vitest/02/+page.svelte`**

```svelte
<script lang="ts">
  import { buildTimestamp, gitCommit, nodeVersion } from 'virtual:build-info';

  interface BuildField {
    label: string;
    value: string;
  }

  const fields: BuildField[] = [
    { label: 'Built at', value: buildTimestamp },
    { label: 'Commit', value: gitCommit },
    { label: 'Node.js', value: nodeVersion }
  ];
</script>

<footer class="build-bar">
  {#each fields as field (field.label)}
    <span class="build-field">
      <span class="build-label">{field.label}</span>
      <code class="build-value">{field.value}</code>
    </span>
  {/each}
</footer>

<style>
  .build-bar {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-md);
    padding: var(--space-sm) var(--space-md);
    background: var(--color-surface-2);
    border-block-start: 1px solid var(--color-border);
    font-size: var(--text-xs);
  }

  .build-field {
    display: flex;
    gap: var(--space-xs);
  }

  .build-label {
    color: var(--color-text-muted);
  }

  .build-value {
    color: var(--color-brand);
    font-weight: 600;
  }
</style>
```

### Explanation

Vite's plugin API is based on Rollup's plugin interface with Vite-specific extensions. Virtual modules let you generate code at build time without a physical file. The `\0` prefix convention prevents other plugins from interfering. The `resolveId` hook intercepts the import, and `load` provides the content. Using `JSON.stringify()` for values ensures proper escaping of special characters. The TypeScript declaration file makes the virtual module type-safe across the project.
</details>
