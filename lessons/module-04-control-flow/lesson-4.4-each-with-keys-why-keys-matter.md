---
module: 4
lesson: 4.4
title: "{#each} with keys — why keys matter"
duration: 50 minutes
prerequisites:
  - Lesson 4.3 ({#each} basics)
  - Module 2.4 ($state with arrays)
learning_objectives:
  - Explain why Svelte needs a key to reuse DOM nodes when a list changes
  - Write the `(expression)` key syntax on `{#each}` and choose a stable identifier
  - Demonstrate that a keyed list preserves form state across reorders
  - Recognise why the array index is a poor choice of key
  - Diagnose the "focus jumped" or "input cleared" bug that a bad key causes
status: ready
---

# Lesson 4.4 — {#each} with keys: why keys matter

## 1. Concept — Svelte needs to know *which* item is which

### 1.1 The problem: the list shuffled and the inputs reset

You have a list of tasks, each rendered with an `<input>` for the title. The user types into the second input. Then a new task is added at the top of the list. Suddenly the text the user was typing appears in a different row, or vanishes entirely. You did not change that text. So why did it move?

Because Svelte, without a key, assumes the items at position 0, 1, 2 in the old list correspond to positions 0, 1, 2 in the new list. The old position 1 was "buy milk". The new position 1 is "call mom". Svelte looks at the DOM at position 1 and says, "keep this `<input>` alive but change its `value`". The DOM node is reused, but its content was actually associated with the wrong item.

The symptom is surprising: focus jumps, typed characters appear under a different row, animations play on the wrong element. The underlying cause is always the same: Svelte did not know which rendered node belongs to which data item, so it matched them positionally.

### 1.2 The fix: tell Svelte the unique identity of each item

A **key** is an expression that uniquely identifies an item in the source array. You put it in parentheses right after the entry variable:

```svelte
{#each tasks as task (task.id)}
    <li>
        <input bind:value={task.title} />
    </li>
{/each}
```

The `(task.id)` tells Svelte: "this item's identity is `task.id`. If an item with this id was rendered before, reuse its DOM node. If the id is new, create a fresh node. If an old id is gone, destroy its node." The positional matching goes away. Rearranging the array moves DOM nodes around instead of destroying and rebuilding them. Typed text stays with the right task. Focus stays on the right input. Animations play on the right element.

### 1.3 What makes a good key

Three rules:

1. **Unique.** Every item in the array has a different key. Duplicate keys are an error.
2. **Stable.** The key for an item does not change over the item's lifetime. A database id is perfect; `Math.random()` is terrible.
3. **Intrinsic to the data.** The key should come from the item itself, not from its position. The item's id is part of its identity; its index is part of the list's layout.

Almost every real data source provides something suitable: a database id, a slug, a UUID, a user-supplied unique string, a URL. Use it.

### 1.4 Why the index is a poor key

You may see examples online using `{#each items as item, i (i)}`. The index is *technically* unique within a single render, but it changes every time the list reorders. If an item moves from position 0 to position 2, its key changes from `0` to `2`, so Svelte thinks it was destroyed and a new item was created — the exact bug we were trying to fix. The only time an index key is safe is when the list is purely append-only and never reorders, never inserts in the middle, never filters.

### 1.5 How Svelte uses the key internally

Before a re-render, Svelte has a map from old keys to old DOM nodes. During the re-render, it walks the new array; for each new item, it looks up the new key in the old map. If the node exists, Svelte moves it into its new position without destroying it. If not, it creates a new node. Any old nodes whose keys are missing from the new list are destroyed. The result is a **minimal set of DOM operations** — exactly what we want for performance and for preserving focus, selection, form state, and animation.

### 1.6 How this connects to the `animate:flip` lesson later

Module 6 introduces `animate:flip`, an animation directive that only works on keyed `{#each}` blocks. It uses the key to track which item moved from where to where and computes a smooth transition. Everything about good list animation in Svelte depends on keys being correct.

## 2. Style it — Stripes and a focus ring that stays put

The mini-build is a to-do list with alternating row backgrounds and a strong focus ring on the inputs. Both visual cues make the keyed behaviour visible: with keys, the focus ring follows the task you focused on even after you rotate the list.

## 3. Interact — See the bug, then fix it with one expression

Start with an unkeyed `{#each}`. Type "urgent" into one of the inputs. Click a button that moves that row to the top. Watch the typed text appear under the *wrong* row. Now add `(task.id)` to the each block. Repeat. The text follows the task. The fix is four characters plus parentheses, and it is the single most important habit you can form for list rendering.

## 4. Mini-build — A reorderable keyed list

### File

`src/routes/modules/04-control-flow/04-each-keys/+page.svelte`

### Key excerpt

```svelte
<script lang="ts">
    interface Task { id: string; title: string; }

    let tasks: Task[] = $state([
        { id: 't1', title: 'Buy milk' },
        { id: 't2', title: 'Call mom' },
        { id: 't3', title: 'Write docs' }
    ]);

    function rotate(): void {
        const [first, ...rest] = tasks;
        tasks = [...rest, first];
    }
</script>

<ul>
    {#each tasks as task (task.id)}
        <li><input bind:value={task.title} /></li>
    {/each}
</ul>
```

### DevTools verification

1. Type a new value into the second input and leave it focused.
2. Click **Rotate**. The focused input moves to a new position *with your text and focus preserved*.
3. Temporarily change the key to `(i)` (the index) and repeat. The focus and typed text stay at the same visual position while the data rotates — the wrong behaviour, proving why index keys are unsafe.

## 5. Check your understanding

<details>
<summary><strong>Q1.</strong> What is a key on an `{#each}` block and why does Svelte need one?</summary>

A key is a unique, stable identifier for each item that lets Svelte match old DOM nodes to new data positions. Without it, Svelte matches positionally and reuses nodes for the wrong items, causing focus, input values, and animations to jump.
</details>

<details>
<summary><strong>Q2.</strong> Why is the array index a poor key?</summary>

Because it changes whenever items reorder, insert, or filter. A stable identifier should follow the item through moves; an index follows the position.
</details>

<details>
<summary><strong>Q3.</strong> What happens if two items share the same key?</summary>

Svelte raises a runtime error about duplicate keys. The invariant "one key, one DOM node" cannot be maintained.
</details>

<details>
<summary><strong>Q4.</strong> If you reorder a keyed list, does Svelte destroy and rebuild the DOM nodes?</summary>

No. Svelte moves the existing DOM nodes into their new positions. Destruction only happens for items whose key is no longer present in the new array.
</details>

<details>
<summary><strong>Q5.</strong> When is it safe to key by index?</summary>

Only when the list is strictly append-only and never reorders, inserts, or filters. That is rare, and defaulting to a real id is almost always simpler.
</details>

## 6. Common mistakes

- **Forgetting the key altogether.** Works until the list reorders; then bugs appear in the worst places — form state and animations.
- **Keying by index.** The classic beginner trap.
- **Generating a key with `Math.random()` or `Date.now()`.** Different every render, so Svelte destroys every node on every update.
- **Keying by a field that can change.** If a user can edit the key field, Svelte thinks the item has been replaced and rebuilds its DOM. Key by a field that is immutable for the item's lifetime.

## 7. What's next

Lesson 4.5 nests `{#each}` inside another `{#each}` to iterate nested data — categories of products, conversations of messages.
