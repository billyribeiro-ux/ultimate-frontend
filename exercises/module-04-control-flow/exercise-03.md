---
module: 4
exercise: 3
title: Nested Data Tree
difficulty: advanced
estimated_time: 30
skills_tested:
  - recursive iteration
  - nested {#each} blocks
  - tree data structures
  - TypeScript recursive types
---

# Exercise 4.3 — Nested Data Tree

## Brief

Build a file explorer component that renders a recursive tree structure. Each node can be a file or a folder (which contains children). Folders are collapsible. The component must handle arbitrary nesting depth using a self-referencing Svelte component pattern.

## Requirements

1. Create `src/lib/exercises/04/TreeNode.svelte` — recursive component
2. Create `src/routes/exercises/04-control-flow/03/+page.svelte`
3. Define a recursive TypeScript type: `TreeItem = { name: string; type: 'file' | 'folder'; children?: TreeItem[] }`
4. Render folders with a toggle (click to expand/collapse)
5. Render files with an appropriate icon indicator
6. Indentation must increase with depth (use CSS, not markup)
7. At least 3 levels of nesting in the sample data
8. Expanded/collapsed state must be local to each folder instance
9. TypeScript strict — recursive types must be correct

## Constraints

- Must use a self-referencing component (recursive `<svelte:self>` or import self)
- No external tree/treeview libraries
- Indentation via CSS `padding-inline-start` per depth level (passed as prop)
- No `{@html}` — all rendering through components

## Hints (progressive)

<details>
<summary>Hint 1 (free)</summary>

A recursive component renders itself for children. In Svelte 5, you import the component and use it in its own template. Pass a `depth` prop that increments by 1 each level.
</details>

<details>
<summary>Hint 2 (conceptual)</summary>

Each TreeNode instance holds its own `expanded` state via `$state(false)`. If the item is a folder, render a button that toggles `expanded`. If expanded and children exist, iterate children with `{#each}` and render `<TreeNode>` for each. The depth prop controls indentation via an inline style or CSS variable.
</details>

<details>
<summary>Hint 3 (code sketch)</summary>

```svelte
<!-- TreeNode.svelte -->
<script lang="ts">
  import TreeNode from './TreeNode.svelte';
  interface TreeItem { name: string; type: 'file' | 'folder'; children?: TreeItem[]; }
  interface Props { item: TreeItem; depth?: number; }
  const { item, depth = 0 }: Props = $props();
  let expanded: boolean = $state(false);
</script>

<div style="padding-inline-start: {depth * 1.5}rem">
  {#if item.type === 'folder'}
    <button onclick={() => expanded = !expanded}>{expanded ? '▼' : '▶'} {item.name}</button>
    {#if expanded && item.children}
      {#each item.children as child}
        <TreeNode item={child} depth={depth + 1} />
      {/each}
    {/if}
  {:else}
    <span>📄 {item.name}</span>
  {/if}
</div>
```
</details>

## Solution

<details>
<summary>Full solution (click to reveal)</summary>

**`src/lib/exercises/04/TreeNode.svelte`**

```svelte
<script lang="ts">
  import TreeNode from './TreeNode.svelte';

  interface TreeItem {
    name: string;
    type: 'file' | 'folder';
    children?: TreeItem[];
  }

  interface Props {
    item: TreeItem;
    depth?: number;
  }

  const { item, depth = 0 }: Props = $props();

  let expanded: boolean = $state(false);

  function toggle(): void {
    expanded = !expanded;
  }
</script>

<div class="node" style="--depth: {depth}">
  {#if item.type === 'folder'}
    <button class="folder" onclick={toggle} aria-expanded={expanded}>
      <span class="icon">{expanded ? '▼' : '▶'}</span>
      <span class="name">{item.name}</span>
      {#if item.children}
        <span class="count">({item.children.length})</span>
      {/if}
    </button>
    {#if expanded && item.children}
      {#each item.children as child (child.name)}
        <TreeNode item={child} depth={depth + 1} />
      {/each}
    {/if}
  {:else}
    <span class="file">
      <span class="icon">─</span>
      <span class="name">{item.name}</span>
    </span>
  {/if}
</div>

<style>
  .node {
    padding-inline-start: calc(var(--depth, 0) * var(--space-md));
  }

  .folder {
    display: flex;
    align-items: center;
    gap: var(--space-xs);
    padding: var(--space-xs) var(--space-sm);
    font-weight: 600;
    color: var(--color-text);
    border-radius: var(--radius-sm);
    inline-size: 100%;
    text-align: start;
    transition: background var(--dur-fast) var(--ease-out);
  }

  .folder:hover {
    background: var(--color-surface-2);
  }

  .file {
    display: flex;
    align-items: center;
    gap: var(--space-xs);
    padding: var(--space-xs) var(--space-sm);
    font-size: var(--text-sm);
    color: var(--color-text-muted);
  }

  .icon {
    font-size: var(--text-xs);
    inline-size: 1em;
    text-align: center;
    flex-shrink: 0;
  }

  .count {
    font-size: var(--text-xs);
    color: var(--color-text-muted);
    font-weight: 400;
  }
</style>
```

**`src/routes/exercises/04-control-flow/03/+page.svelte`**

```svelte
<script lang="ts">
  import TreeNode from '$lib/exercises/04/TreeNode.svelte';

  interface TreeItem {
    name: string;
    type: 'file' | 'folder';
    children?: TreeItem[];
  }

  const fileSystem: TreeItem = {
    name: 'src',
    type: 'folder',
    children: [
      {
        name: 'routes',
        type: 'folder',
        children: [
          { name: '+page.svelte', type: 'file' },
          { name: '+layout.svelte', type: 'file' },
          {
            name: 'blog',
            type: 'folder',
            children: [
              { name: '+page.svelte', type: 'file' },
              { name: '+page.server.ts', type: 'file' },
              {
                name: '[slug]',
                type: 'folder',
                children: [
                  { name: '+page.svelte', type: 'file' },
                  { name: '+page.ts', type: 'file' }
                ]
              }
            ]
          }
        ]
      },
      {
        name: 'lib',
        type: 'folder',
        children: [
          { name: 'utils.ts', type: 'file' },
          {
            name: 'components',
            type: 'folder',
            children: [
              { name: 'Button.svelte', type: 'file' },
              { name: 'Card.svelte', type: 'file' }
            ]
          }
        ]
      },
      { name: 'app.css', type: 'file' },
      { name: 'app.html', type: 'file' }
    ]
  };
</script>

<main class="page">
  <h1>File Explorer</h1>
  <div class="tree">
    <TreeNode item={fileSystem} />
  </div>
</main>

<style>
  .page {
    max-inline-size: var(--prose-max);
    margin-inline: auto;
    padding: var(--space-xl) var(--space-md);
  }

  h1 { font-size: var(--text-2xl); margin-block-end: var(--space-lg); }

  .tree {
    background: var(--color-surface-2);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-lg);
    padding: var(--space-md);
    font-family: ui-monospace, monospace;
  }
</style>
```

### Explanation

Recursive components are Svelte's answer to rendering tree-shaped data. Each `TreeNode` instance manages its own `expanded` state — this is component-local state at its best, since each folder's open/close status is independent. The `depth` prop drives indentation through a CSS custom property, keeping the logic clean. The key expression `(child.name)` ensures correct DOM reuse when siblings are reordered. This pattern extends to comments threads, org charts, menu systems, and any hierarchical UI. At scale, you would add virtualization for trees with thousands of nodes.
</details>
