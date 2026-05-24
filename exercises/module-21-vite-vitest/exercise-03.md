---
module: 21
exercise: 3
title: HMR Boundary Understanding
difficulty: advanced
estimated_time: 35
skills_tested:
  - HMR propagation rules
  - accept boundaries
  - state preservation vs reset
  - module graph understanding
---

# Exercise 21.3 — HMR Boundary Understanding

## Brief

Hot Module Replacement (HMR) is the feature that makes development fast — you change a file, and the browser updates without a full page reload. But HMR has rules about how changes propagate through the module graph, and misunderstanding these rules leads to stale state, phantom bugs, and "just refresh the page" habits. In this exercise, you will map the HMR propagation path for a realistic module graph and predict which components re-render when specific files change.

## Requirements

1. Create `src/routes/exercises/21-vite-vitest/03/+page.svelte` that visualizes the following module dependency graph:

   ```
   +layout.svelte
   ├── Header.svelte (imports: theme.svelte.ts, nav-items.ts)
   ├── +page.svelte
   │   ├── ProductList.svelte (imports: product-store.svelte.ts, format-price.ts)
   │   │   └── ProductCard.svelte (imports: format-price.ts, product-store.svelte.ts)
   │   └── FilterPanel.svelte (imports: product-store.svelte.ts)
   └── Footer.svelte (imports: theme.svelte.ts)
   ```

2. Build an interactive tool where the user clicks a file to "edit" it, and the UI highlights:
   - Which modules receive the HMR update (direct importers)
   - Which modules are HMR boundaries (Svelte components accept their own updates)
   - Whether state is preserved or reset in each affected component
3. Include a sidebar that explains the HMR propagation rules for each scenario
4. Handle these specific scenarios:
   - Editing `format-price.ts` (a pure utility — no HMR boundary, propagates up)
   - Editing `ProductCard.svelte` (HMR boundary — only this component updates)
   - Editing `product-store.svelte.ts` (shared reactive state — all consumers update)
   - Editing `theme.svelte.ts` (shared across layout children — Header and Footer update)
5. Use keyed `{#each}` for all list rendering

## Constraints

- No external dependencies
- All file nodes must be typed with a TypeScript interface
- PE7 tokens for all styling
- Color-code nodes: green for "updated", yellow for "propagation path", gray for "unaffected"

## Hints (progressive)

<details>
<summary>Hint 1 (free)</summary>

Svelte components are HMR boundaries — they accept their own updates. When you edit `ProductCard.svelte`, only that component re-renders. But when you edit a `.ts` file (like `format-price.ts`), it has no HMR boundary of its own, so the update propagates up to all components that import it.
</details>

<details>
<summary>Hint 2 (conceptual)</summary>

Model the dependency graph as a list of nodes with `importedBy` relationships. When a file is "edited", walk up the `importedBy` chain until you hit an HMR boundary (a `.svelte` file). Those boundaries are the components that re-render. State in those components is preserved unless the component's `<script>` block changed.
</details>

<details>
<summary>Hint 3 (code sketch)</summary>

```svelte
<script lang="ts">
  interface FileNode {
    id: string;
    name: string;
    type: 'svelte' | 'ts' | 'svelte.ts';
    importedBy: string[];
    isBoundary: boolean;
  }

  const files: FileNode[] = [
    { id: 'format-price', name: 'format-price.ts', type: 'ts', importedBy: ['product-list', 'product-card'], isBoundary: false },
    { id: 'product-card', name: 'ProductCard.svelte', type: 'svelte', importedBy: ['product-list'], isBoundary: true },
    // ...
  ];

  let editedFileId: string | null = $state(null);
  // Walk the graph to find affected boundaries
</script>
```
</details>

## Solution

<details>
<summary>Full solution (click to reveal)</summary>

```svelte
<script lang="ts">
  type FileType = 'svelte' | 'ts' | 'svelte.ts';

  interface FileNode {
    id: string;
    name: string;
    fileType: FileType;
    imports: string[];
    importedBy: string[];
    isBoundary: boolean;
  }

  const files: FileNode[] = [
    { id: 'layout', name: '+layout.svelte', fileType: 'svelte', imports: ['header', 'footer'], importedBy: [], isBoundary: true },
    { id: 'header', name: 'Header.svelte', fileType: 'svelte', imports: ['theme', 'nav-items'], importedBy: ['layout'], isBoundary: true },
    { id: 'page', name: '+page.svelte', fileType: 'svelte', imports: ['product-list', 'filter-panel'], importedBy: ['layout'], isBoundary: true },
    { id: 'product-list', name: 'ProductList.svelte', fileType: 'svelte', imports: ['product-store', 'format-price', 'product-card'], importedBy: ['page'], isBoundary: true },
    { id: 'product-card', name: 'ProductCard.svelte', fileType: 'svelte', imports: ['format-price', 'product-store'], importedBy: ['product-list'], isBoundary: true },
    { id: 'filter-panel', name: 'FilterPanel.svelte', fileType: 'svelte', imports: ['product-store'], importedBy: ['page'], isBoundary: true },
    { id: 'footer', name: 'Footer.svelte', fileType: 'svelte', imports: ['theme'], importedBy: ['layout'], isBoundary: true },
    { id: 'theme', name: 'theme.svelte.ts', fileType: 'svelte.ts', imports: [], importedBy: ['header', 'footer'], isBoundary: false },
    { id: 'nav-items', name: 'nav-items.ts', fileType: 'ts', imports: [], importedBy: ['header'], isBoundary: false },
    { id: 'product-store', name: 'product-store.svelte.ts', fileType: 'svelte.ts', imports: [], importedBy: ['product-list', 'product-card', 'filter-panel'], isBoundary: false },
    { id: 'format-price', name: 'format-price.ts', fileType: 'ts', imports: [], importedBy: ['product-list', 'product-card'], isBoundary: false }
  ];

  let editedFileId: string | null = $state(null);

  function findAffectedBoundaries(fileId: string): string[] {
    const file: FileNode | undefined = files.find(f => f.id === fileId);
    if (!file) return [];
    if (file.isBoundary) return [file.id];

    const boundaries: string[] = [];
    const visited: Set<string> = new Set();

    function walk(currentId: string): void {
      if (visited.has(currentId)) return;
      visited.add(currentId);
      const current: FileNode | undefined = files.find(f => f.id === currentId);
      if (!current) return;
      for (const parentId of current.importedBy) {
        const parent: FileNode | undefined = files.find(f => f.id === parentId);
        if (parent?.isBoundary) {
          boundaries.push(parent.id);
        } else {
          walk(parentId);
        }
      }
    }

    walk(fileId);
    return boundaries;
  }

  let affectedBoundaries: string[] = $derived(
    editedFileId ? findAffectedBoundaries(editedFileId) : []
  );

  function getNodeStatus(fileId: string): 'edited' | 'updated' | 'propagation' | 'unaffected' {
    if (fileId === editedFileId) return 'edited';
    if (affectedBoundaries.includes(fileId)) return 'updated';
    return 'unaffected';
  }
</script>

<section class="page stack">
  <h1>HMR Boundary Visualizer</h1>
  <p>Click a file to simulate editing it and see how HMR propagates.</p>

  <div class="graph">
    {#each files as file (file.id)}
      <button
        type="button"
        class="node node--{getNodeStatus(file.id)} node--{file.fileType}"
        onclick={() => { editedFileId = file.id; }}
      >
        <span class="node__name">{file.name}</span>
        <span class="node__type">{file.isBoundary ? 'boundary' : 'propagates'}</span>
      </button>
    {/each}
  </div>

  {#if editedFileId}
    <div class="explanation">
      <h2>Editing: {files.find(f => f.id === editedFileId)?.name}</h2>
      <p>Affected boundaries: {affectedBoundaries.map(id => files.find(f => f.id === id)?.name).join(', ') || 'none (self-contained)'}</p>
    </div>
  {/if}
</section>

<style>
  .graph {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(10rem, 1fr));
    gap: var(--space-sm);
  }

  .node {
    padding: var(--space-sm);
    background: var(--color-surface-2);
    border: 2px solid var(--color-border);
    border-radius: var(--radius-md);
    text-align: start;
    min-block-size: 44px;
  }

  .node--edited { border-color: var(--color-brand); background: oklch(90% 0.08 270); }
  .node--updated { border-color: oklch(60% 0.18 145); background: oklch(90% 0.06 145); }
  .node--unaffected { opacity: 0.6; }

  .node__name { display: block; font-weight: 600; font-size: var(--text-sm); }
  .node__type { font-size: var(--text-xs); color: var(--color-text-muted); }
</style>
```

### Explanation

HMR propagation follows the module graph upward from the edited file. Svelte components are natural HMR boundaries — they accept their own updates via Vite's HMR API. When you edit a non-boundary file (`.ts` or `.svelte.ts`), the update propagates up through `importedBy` relationships until it reaches a Svelte component boundary. All reached boundaries re-render. This is why editing a shared utility like `format-price.ts` causes `ProductList` and `ProductCard` to update, while editing `ProductCard.svelte` only updates itself. Understanding this graph is essential for debugging "why isn't my change showing up?" issues during development.
</details>
