# Svelte 5 Runes Cheat Sheet

## Rune Reference

| Rune | Signature | Returns | Purpose |
|------|-----------|---------|---------|
| `$state` | `$state<T>(initial: T)` | `T` (reactive) | Declare reactive mutable state |
| `$state.raw` | `$state.raw<T>(initial: T)` | `T` (shallow reactive) | State without deep reactivity (objects replaced, not mutated) |
| `$state.snapshot` | `$state.snapshot(value)` | `T` (plain) | Get a non-reactive snapshot for logging/serialization |
| `$derived` | `$derived(expression)` | `T` (reactive, readonly) | Computed value from a single expression |
| `$derived.by` | `$derived.by(() => T)` | `T` (reactive, readonly) | Computed value from a function body (multi-line logic) |
| `$effect` | `$effect(() => void)` | `void` | Side effect that re-runs when dependencies change |
| `$effect.pre` | `$effect.pre(() => void)` | `void` | Effect that runs before DOM update |
| `$props` | `$props<T>()` | `T` | Declare component props |
| `$bindable` | `$bindable(fallback?)` | `T` | Mark a prop as two-way bindable |
| `$inspect` | `$inspect(value, ...more)` | `void` | Dev-only reactive console.log (stripped in prod) |
| `$host` | `$host()` | `HTMLElement` | Access the custom element host node |

## When to Use / When NOT to Use

| Rune | Use When | Do NOT Use When |
|------|----------|-----------------|
| `$state` | Mutable UI state (forms, toggles, counters) | Derived/computed values |
| `$state.raw` | Large arrays/objects replaced wholesale, never mutated | You need to push/splice items reactively |
| `$derived` | Value computable from other reactive values | Side effects needed, async logic |
| `$derived.by` | Multi-statement derivation logic | Simple single-expression derivation |
| `$effect` | DOM manipulation, subscriptions, logging | Updating other `$state` (use `$derived`) |
| `$effect.pre` | Must read/write DOM before paint | Most cases (prefer `$effect`) |
| `$props` | Every component that accepts props | Module scripts, .svelte.ts files |
| `$bindable` | Parent needs two-way binding (bind:value) | One-way data flow suffices |

## Common Patterns

### Counter

```svelte
<script lang="ts">
  let count = $state(0);
  let doubled = $derived(count * 2);
</script>

<button onclick={() => count++}>{count} (x2 = {doubled})</button>
```

### Async State Machine

```svelte
<script lang="ts">
  type State = { status: 'idle' } | { status: 'loading' } | { status: 'done'; data: string } | { status: 'error'; error: Error };
  let state: State = $state({ status: 'idle' });

  async function load() {
    state = { status: 'loading' };
    try {
      const res = await fetch('/api/data');
      state = { status: 'done', data: await res.text() };
    } catch (e) {
      state = { status: 'error', error: e as Error };
    }
  }
</script>
```

### Form State

```svelte
<script lang="ts">
  interface Props { initial?: string }
  let { initial = '' }: Props = $props();

  let value = $state(initial);
  let dirty = $derived(value !== initial);
  let valid = $derived(value.length >= 3);
</script>
```

### Derived Chain

```svelte
<script lang="ts">
  let items = $state<string[]>([]);
  let filtered = $derived(items.filter(i => i.length > 0));
  let count = $derived(filtered.length);
  let summary = $derived(`${count} item${count === 1 ? '' : 's'}`);
</script>
```

## Migration Table: Svelte 4 to Svelte 5

| Svelte 4 | Svelte 5 | Notes |
|-----------|-----------|-------|
| `export let prop` | `let { prop } = $props()` | Destructure all props at once |
| `export let prop = 'default'` | `let { prop = 'default' } = $props()` | Defaults in destructuring |
| `$: doubled = x * 2` | `let doubled = $derived(x * 2)` | Reactive declarations become derivations |
| `$: { ... }` | `$effect(() => { ... })` | Reactive statements become effects |
| `$: if (x) { ... }` | `$effect(() => { if (x) { ... } })` | Conditional reactive blocks |
| `let x = writable(0)` | `let x = $state(0)` | No store import needed |
| `$store` | Direct access | No $ prefix for store subscription |
| `createEventDispatcher()` | Callback props `let { onclick } = $props()` | Events are just props now |
| `<slot />` | `{@render children()}` | Snippets replace slots |
| `<slot name="header" />` | `{@render header()}` | Named snippets replace named slots |
| `bind:this={el}` | `bind:this={el}` (same) | Still works identically |
| `onMount(() => {})` | `$effect(() => {})` | Or keep onMount for non-reactive setup |
| `beforeUpdate / afterUpdate` | `$effect.pre` / `$effect` | Lifecycle replaced by runes |

## Reactive Graph Mental Model

```
Signals (sources)         Derivations (computed)        Effects (side effects)
─────────────────         ────────────────────          ─────────────────────
$state            ──────► $derived            ──────►   $effect
$state.raw                $derived.by                   $effect.pre
$props (read)
$bindable (read/write)
```

- **Signals** (`$state`, `$state.raw`): Source nodes. Push notifications downstream.
- **Derivations** (`$derived`, `$derived.by`): Pure computations. Lazy — only recompute when read AND dependencies changed.
- **Effects** (`$effect`, `$effect.pre`): Leaf nodes. Re-run automatically. Cannot be read by other nodes.

Rules:
1. Effects track dependencies automatically at runtime (no explicit dep arrays).
2. Derivations are synchronous and pure — never put side effects in them.
3. Writing to `$state` inside `$effect` that reads the same state = infinite loop.

## Common Mistakes

- **Mutating `$state.raw` objects** — won't trigger updates; must reassign the whole value.
- **Using `$effect` to sync state** — creates cascading updates; use `$derived` instead.
- **Forgetting cleanup in `$effect`** — return a teardown function for subscriptions/timers.
- **Accessing `$state.snapshot` in production code** — it's for debugging; use structuredClone if you need a copy.
- **Declaring `$derived` with side effects** — derivations must be pure; move side effects to `$effect`.
- **Using `$inspect` and shipping to prod** — it's stripped, but don't rely on it for logic.
- **Destructuring props without `$props()`** — plain destructuring loses reactivity.
