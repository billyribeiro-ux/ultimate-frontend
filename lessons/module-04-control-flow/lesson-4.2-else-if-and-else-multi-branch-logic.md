---
module: 4
lesson: 4.2
title: "{:else if} and {:else} — multi-branch logic"
duration: 40 minutes
prerequisites:
  - Lesson 4.1 ({#if} and truthiness)
learning_objectives:
  - Handle three-or-more-way branching without nesting `{#if}` blocks
  - Use a string-literal union type to model mutually-exclusive UI states
  - Understand why `{:else}` is an exhaustive fallback and how to tell the compiler you have covered every case
  - Read and write the full `{#if} / {:else if} / {:else} / {/if}` structure
  - Design the order of branches so the most specific case comes first
status: ready
---

# Lesson 4.2 — {:else if} and {:else}: multi-branch logic

## 1. Concept — Mutually-exclusive states need a single `{#if}` chain, not a stack of them

### 1.1 The problem: more than two outcomes

A fetch request is in exactly one of four states at any moment: **idle** (nothing has been requested yet), **loading** (request in flight), **success** (data arrived), or **error** (request failed). Four states, exactly one at a time. Your UI needs to show one of four different things.

With only `{#if}` you could write this:

```svelte
{#if status === 'idle'}
    <p>Click the button to load.</p>
{/if}
{#if status === 'loading'}
    <p>Loading…</p>
{/if}
{#if status === 'success'}
    <p>Here is the data.</p>
{/if}
{#if status === 'error'}
    <p>Something went wrong.</p>
{/if}
```

It works, but it has two problems. First, Svelte evaluates every `{#if}` independently, so the reader cannot see at a glance that the four cases are *mutually exclusive*. Second, if you add a fifth state later, you have to remember to add a fifth `{#if}` — nothing enforces exhaustiveness. You can write three cases, forget one, and the UI will be silently blank for the missing state.

### 1.2 The fix: one block, many branches

`{:else if}` and `{:else}` turn a stack of independent tests into a single chain:

```svelte
{#if status === 'idle'}
    <p>Click the button to load.</p>
{:else if status === 'loading'}
    <p>Loading…</p>
{:else if status === 'success'}
    <p>Here is the data.</p>
{:else}
    <p>Something went wrong.</p>
{/if}
```

Three things change:

1. **It is one block**, not four. The reader sees immediately that these four branches are alternatives and exactly one will render.
2. **`{:else}` is the fallback**. If none of the earlier branches matched, `{:else}` fires. That guarantees *something* always renders. No silent-blank bug.
3. **Branches are evaluated top to bottom.** The first one that matches wins, and the rest are skipped.

### 1.3 Order matters: specific before general

If two branches would match, the first one wins. So write specific cases first and general fallbacks last:

```svelte
{#if count === 0}
    <p>The cart is empty.</p>
{:else if count === 1}
    <p>One item in the cart.</p>
{:else}
    <p>{count} items in the cart.</p>
{/if}
```

Swap the first two branches and `count === 0` would never be reached because the check would fall through to the `{:else}` covering the "many" case. The compiler will not warn you — the bug is logical, not syntactic.

### 1.4 Modelling states with a string literal union

In Lesson 3.3 you learned string literal union types. This is where they pay off most:

```ts
type Status = 'idle' | 'loading' | 'success' | 'error';
let status: Status = $state('idle');
```

Every branch in the `{:else if}` chain compares `status` to one of the four allowed strings. Because the compiler knows `status` is a `Status`, a typo like `status === 'sucess'` becomes a type error. The `{:else}` at the end can be dropped, but then TypeScript cannot prove you handled every case — you lose **exhaustiveness**. For UI branching the safest pattern is: explicit `{:else if}` for every known state, and either a final `{:else}` to catch the impossible, or a TypeScript "exhaustiveness check" helper (covered in the advanced appendix).

### 1.5 How reactivity works with `{:else if}` chains

Exactly as you would hope: Svelte tracks every reactive value read by every branch's condition and its body. When any of them change, Svelte re-evaluates the whole chain and switches branches if needed. The DOM for the losing branch is torn down, the DOM for the winning branch is created. Nothing is hidden, nothing leaks.

### 1.6 Combining conditions with `&&` and `||`

Each branch's expression can use any JavaScript logical operator. A common pattern is a second condition that refines the first:

```svelte
{#if status === 'success' && items.length === 0}
    <p>No results for that search.</p>
{:else if status === 'success'}
    <ul>{#each items as item (item.id)}<li>{item.name}</li>{/each}</ul>
{/if}
```

Put the **more specific** condition first — otherwise the more general `status === 'success'` will swallow it. This is the same "specific before general" rule stated a different way.

## Deep Dive

**Why this matters at scale.** In production UIs, multi-state components are everywhere: a request can be idle, loading, succeeded, or failed. A subscription can be free, trial, active, past-due, or cancelled. A wizard step can be incomplete, current, or completed. Each state needs different markup, different styling, and different accessibility attributes. In a 50-component app, you might have 20+ multi-branch blocks. If developers use nested `{#if}` blocks instead of `{:else if}` chains, the template becomes deeply indented and hard to verify for exhaustiveness. Clean `{:else if}` chains make the state machine visible in the markup and make it obvious when a state is unhandled.

**The mental model.** Think of `{#if}/{:else if}/{:else}` as a railway switch yard. A train (the reactive value) arrives at the yard. The first switch checks "are you condition A?" If yes, the train goes down track A. If no, the next switch checks "are you condition B?" And so on. The final `{:else}` is the catch-all siding. Exactly one track is active at any time. This is a pattern-matching operation, and thinking of it as "which track does this value take?" helps you design conditions that are mutually exclusive and exhaustive.

**Edge cases.** A subtle bug: overlapping conditions. If your first condition is `{#if score > 50}` and your second is `{:else if score > 80}`, the second branch is unreachable because any score above 80 also satisfies the first condition. Order matters — put the most specific condition first. Another edge case: TypeScript narrowing inside branches. If you check `{#if user.role === 'admin'}`, TypeScript narrows `user.role` to `'admin'` inside that branch, enabling safe access to admin-only fields. This works with Svelte 5's template type checking. A third edge case: reactive expressions in conditions. If the condition calls a function that modifies state, the function runs on every re-evaluation, which can cause infinite loops.

**Performance implications.** Svelte compiles `{#if}/{:else if}` chains into conditional checks that short-circuit on the first match. Only the matching branch's DOM is created; other branches contribute zero DOM and zero memory. When the active branch changes, Svelte destroys the old branch and creates the new one — a swap, not a diff. For branches with heavy content, the swap cost is the creation time of the new branch. If you need instant switching between pre-rendered branches (like tabs), consider rendering all branches and toggling visibility with CSS instead.

**Cross-module connections.** Multi-branch rendering is the visual expression of discriminated unions from TypeScript. Module 8 uses it for different layouts based on route data. Module 9 uses `{#if}` chains for load/error/success patterns. Module 12 covers the trade-off between conditional rendering and CSS visibility for tab interfaces. The skill of designing clean, exhaustive condition chains translates to pattern matching in any language.

## 2. Style it — A single panel whose face changes

The mini-build has one bordered panel whose inner content switches between an idle prompt, a loading spinner, a success list, and an error message. The outer chrome — border, radius, padding — never changes, so the layout stays put. Only the inside swaps. This is what the user sees as a smooth state change rather than the whole layout reshuffling.

## 3. Interact — Deliberately rearrange and break

Write the chain in the correct order (idle → loading → success → error). It works. Now move the `{:else}` error case to the top — every request will look like an error because the first branch always matches. Fix it. Move the `{:else if status === 'loading'}` below the `{:else if status === 'success'}`. Because Svelte reacts to `status` changing from `'loading'` to `'success'`, the loading message will briefly fail to appear on the first click. Fix it. Every mistake teaches you that order is part of the contract.

## 4. Mini-build — A fetch-status panel

### File

`src/routes/modules/04-control-flow/02-else-if/+page.svelte`

### Key excerpt

```svelte
<script lang="ts">
    type Status = 'idle' | 'loading' | 'success' | 'error';
    let status: Status = $state('idle');

    function simulate(result: 'success' | 'error'): void {
        status = 'loading';
        setTimeout(() => { status = result; }, 800);
    }
</script>

<div class="panel">
    {#if status === 'idle'}
        <p>Press a button to simulate a request.</p>
    {:else if status === 'loading'}
        <p>Loading…</p>
    {:else if status === 'success'}
        <p>Success! Data arrived.</p>
    {:else}
        <p>Something went wrong.</p>
    {/if}
</div>
```

### DevTools verification

1. Click **Succeed**. In the Elements panel, watch the inner `<p>` of `.panel` swap from "Loading…" to "Success!" at the end of the timeout. Svelte destroys one text node and creates another.
2. Click **Fail**. The same swap happens with the error branch. Confirm the panel's outer `<div>` does not change — only its child.

## 5. Check your understanding

<details>
<summary><strong>Q1.</strong> Why is `{:else if}` preferable to a stack of independent `{#if}` blocks for mutually-exclusive states?</summary>

It communicates intent — only one branch will render — and it guarantees exhaustiveness with `{:else}`. Independent `{#if}`s could all match or all miss, and the reader has no visual cue that they are alternatives.
</details>

<details>
<summary><strong>Q2.</strong> What does `{:else}` do when none of the earlier branches match?</summary>

It renders its block as a fallback. It is Svelte's guarantee that exactly one branch of the chain will render, no matter what the inputs are.
</details>

<details>
<summary><strong>Q3.</strong> Branches are evaluated in source order. Why does that matter?</summary>

Because the first branch that matches wins. A general condition placed before a specific one will shadow the specific case — a logical bug the compiler cannot catch.
</details>

<details>
<summary><strong>Q4.</strong> How does a string-literal union type make an `{:else if}` chain safer?</summary>

TypeScript rejects typos and unknown strings at compile time, so you cannot write a branch testing a state that does not exist. Combined with a final `{:else}`, you also guarantee a visible UI for every possible value.
</details>

<details>
<summary><strong>Q5.</strong> Can you nest an `{#if}` inside a branch of another `{#if}` chain?</summary>

Yes. Each branch can contain any markup, including another logic block. Nest only when the inner decision is truly secondary — otherwise flatten the conditions into one combined expression for readability.
</details>

## 6. Common mistakes

- **Placing general before specific.** The specific case never runs. Order specific branches first.
- **Forgetting the closing `{/if}`.** The compiler error is clear, but easy to miss in a long chain.
- **Using multiple `{#if}` blocks where one `{:else if}` chain is correct.** You lose the exclusivity guarantee and make the reader hunt for the relationship.
- **Skipping `{:else}` when you should catch the impossible.** If your state union has five values and you branch on four, the fifth case renders nothing. Add `{:else}` or an exhaustiveness check.

## 7. What's next

Lesson 4.3 introduces `{#each}` — the block that iterates over arrays and renders one item per entry, with destructuring and typed index variables.
