---
module: 11
exercise: 5
title: Optimistic UI Pattern
difficulty: principal
estimated_time: 60
skills_tested:
  - optimistic updates
  - rollback mechanisms
  - pending state tracking
  - error recovery
---

# Exercise 11.5 — Optimistic UI Pattern

## Brief

Build a kanban board where dragging cards between columns uses optimistic updates. The move happens instantly in the UI, a server mutation runs in the background, and failed moves animate back to their original position with an error toast.

## Requirements

1. Create a `Board` reactive class in `src/lib/state/board.svelte.ts` managing three columns: "Todo", "In Progress", "Done"
2. Each card has `id`, `title`, `column`, and `order` fields
3. Implement `moveCard(cardId, targetColumn)` that optimistically moves the card, calls a server mutation, and rolls back on failure
4. Track pending moves with a `Set<string>` of card IDs currently being moved
5. Cards with pending moves show a subtle loading indicator
6. Failed moves show an error toast with the card title and target column
7. Build the kanban board UI with three columns and draggable cards
8. Simulate server mutations with random 15% failure rate and 500ms delay

## Constraints

- No drag-and-drop libraries — use button-based column movement
- The board state must be a reactive class with `$state` and `$derived`
- Optimistic update must happen before `await`
- All styles use PE7 tokens

## Hints (progressive)

<details>
<summary>Hint 1 (free)</summary>

The optimistic pattern: save the current column, update the card's column immediately, call the server in a try/catch, and restore the original column in the catch block. A `pendingMoves` set tracks which cards are mid-flight.
</details>

<details>
<summary>Hint 2 (conceptual)</summary>

Derive columns from the flat card array: `todoCards = $derived(cards.filter(c => c.column === 'todo'))`. When a card moves, just update its `column` field — the derived arrays recalculate automatically. The rollback is simply restoring the original `column` value.
</details>

<details>
<summary>Hint 3 (code sketch)</summary>

```typescript
class Board {
  cards = $state<Card[]>([/* ... */]);
  pendingMoves = $state(new Set<string>());
  todoCards = $derived(this.cards.filter(c => c.column === 'todo'));

  async moveCard(cardId: string, target: Column) {
    const card = this.cards.find(c => c.id === cardId)!;
    const prev = card.column;
    card.column = target; // optimistic
    this.pendingMoves.add(cardId);
    try { await serverMove(cardId, target); }
    catch { card.column = prev; /* rollback */ }
    finally { this.pendingMoves.delete(cardId); }
  }
}
```
</details>

## Solution

<details>
<summary>Full solution</summary>

```typescript
// src/lib/state/board.svelte.ts
type Column = 'todo' | 'in-progress' | 'done';

interface Card {
  id: string;
  title: string;
  column: Column;
}

async function serverMoveCard(cardId: string, targetColumn: Column): Promise<void> {
  await new Promise((r) => setTimeout(r, 500));
  if (Math.random() < 0.15) {
    throw new Error('Server error: failed to persist move');
  }
}

class Board {
  cards = $state<Card[]>([
    { id: 'c1', title: 'Design token audit', column: 'todo' },
    { id: 'c2', title: 'Build login form', column: 'todo' },
    { id: 'c3', title: 'Write API tests', column: 'todo' },
    { id: 'c4', title: 'Set up CI pipeline', column: 'in-progress' },
    { id: 'c5', title: 'Review PR #42', column: 'in-progress' },
    { id: 'c6', title: 'Deploy staging', column: 'done' }
  ]);

  pendingMoves = $state(new Set<string>());
  lastError = $state<string | null>(null);

  todoCards = $derived(this.cards.filter((c) => c.column === 'todo'));
  inProgressCards = $derived(this.cards.filter((c) => c.column === 'in-progress'));
  doneCards = $derived(this.cards.filter((c) => c.column === 'done'));

  async moveCard(cardId: string, target: Column): Promise<void> {
    const card = this.cards.find((c) => c.id === cardId);
    if (!card || card.column === target || this.pendingMoves.has(cardId)) return;

    const previousColumn = card.column;
    card.column = target;
    this.pendingMoves.add(cardId);
    this.lastError = null;

    try {
      await serverMoveCard(cardId, target);
    } catch {
      card.column = previousColumn;
      this.lastError = `Failed to move "${card.title}" to ${target}`;
      setTimeout(() => { if (this.lastError) this.lastError = null; }, 3000);
    } finally {
      this.pendingMoves.delete(cardId);
    }
  }
}

export const board = new Board();
export type { Column, Card };
```

```svelte
<!-- src/routes/board/+page.svelte -->
<script lang="ts">
  import { board, type Column } from '$lib/state/board.svelte';

  const columns: { key: Column; label: string }[] = [
    { key: 'todo', label: 'Todo' },
    { key: 'in-progress', label: 'In Progress' },
    { key: 'done', label: 'Done' }
  ];

  function getCards(col: Column) {
    if (col === 'todo') return board.todoCards;
    if (col === 'in-progress') return board.inProgressCards;
    return board.doneCards;
  }

  function getTargets(current: Column): Column[] {
    return columns.filter((c) => c.key !== current).map((c) => c.key);
  }
</script>

<div class="board-page">
  <h1>Kanban Board</h1>

  <div class="board">
    {#each columns as col}
      <section class="column">
        <h2 class="column-header">
          {col.label}
          <span class="column-count">{getCards(col.key).length}</span>
        </h2>

        <div class="card-list">
          {#each getCards(col.key) as card (card.id)}
            <div class="card" class:pending={board.pendingMoves.has(card.id)}>
              <span class="card-title">{card.title}</span>
              {#if board.pendingMoves.has(card.id)}
                <span class="card-spinner" aria-label="Moving"></span>
              {:else}
                <div class="card-actions">
                  {#each getTargets(col.key) as target}
                    <button onclick={() => board.moveCard(card.id, target)} class="move-btn">
                      {target === 'todo' ? 'Todo' : target === 'in-progress' ? 'Progress' : 'Done'}
                    </button>
                  {/each}
                </div>
              {/if}
            </div>
          {/each}
        </div>
      </section>
    {/each}
  </div>

  {#if board.lastError}
    <div class="error-toast" role="alert">{board.lastError}</div>
  {/if}
</div>

<style>
  .board-page { padding: var(--space-lg); max-inline-size: 72rem; margin-inline: auto; }
  h1 { font-size: var(--text-2xl); margin-block-end: var(--space-lg); }

  .board { display: grid; grid-template-columns: repeat(3, 1fr); gap: var(--space-md); }

  .column { background: var(--color-surface-2); border-radius: var(--radius-md); padding: var(--space-md); min-block-size: 20rem; }

  .column-header { font-size: var(--text-base); font-weight: 600; display: flex; justify-content: space-between; align-items: center; margin-block-end: var(--space-md); padding-block-end: var(--space-sm); border-block-end: 2px solid var(--color-border); }

  .column-count { font-size: var(--text-xs); background: var(--color-surface-3); padding: var(--space-2xs) var(--space-xs); border-radius: var(--radius-full); color: var(--color-text-muted); }

  .card-list { display: flex; flex-direction: column; gap: var(--space-xs); }

  .card { background: var(--color-surface-1); border: 1px solid var(--color-border); border-radius: var(--radius-sm); padding: var(--space-sm); transition: opacity 150ms ease; }
  .card.pending { opacity: 0.6; }

  .card-title { font-size: var(--text-sm); display: block; margin-block-end: var(--space-xs); }

  .card-actions { display: flex; gap: var(--space-2xs); }

  .move-btn { padding: var(--space-2xs) var(--space-xs); font-size: var(--text-xs); border: 1px solid var(--color-border); border-radius: var(--radius-sm); background: var(--color-surface-2); cursor: pointer; color: var(--color-text-muted); }
  .move-btn:hover { background: var(--color-surface-3); color: var(--color-text); }

  .card-spinner { display: inline-block; inline-size: 0.75rem; block-size: 0.75rem; border: 2px solid var(--color-border); border-block-start-color: oklch(55% 0.2 250); border-radius: var(--radius-full); animation: spin 600ms linear infinite; }

  @keyframes spin { to { transform: rotate(360deg); } }
  @media (prefers-reduced-motion: reduce) { .card-spinner { animation: none; opacity: 0.5; } }

  .error-toast { position: fixed; inset-block-end: var(--space-lg); inset-inline-start: 50%; transform: translateX(-50%); background: oklch(90% 0.1 25); color: oklch(35% 0.15 25); padding: var(--space-sm) var(--space-lg); border-radius: var(--radius-md); box-shadow: var(--shadow-lg); font-size: var(--text-sm); font-weight: 600; }
</style>
```

### Explanation

The optimistic update pattern in a reactive class creates a seamless user experience. The `Board` class encapsulates all state, derived views, and mutation logic in one testable unit. Derived arrays (`todoCards`, `inProgressCards`, `doneCards`) automatically recalculate when any card's `column` field changes, so both the optimistic move and the rollback immediately update the UI. The `pendingMoves` set provides per-card loading state without a separate loading variable per card. This pattern scales to any application where perceived latency must be near-zero: drag-and-drop, inline editing, voting, and more.
</details>
