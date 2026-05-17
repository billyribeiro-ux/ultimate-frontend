# TypeScript Patterns Cheat Sheet

## Type Annotations vs Inference — The Rule

| Situation | Annotate? | Example |
|-----------|-----------|---------|
| Function parameters | **Always** | `function add(a: number, b: number)` |
| Function return types (exported) | **Yes** | `export function load(): PageData` |
| Function return types (local) | Infer | TypeScript infers from return statement |
| `let` with initializer | Infer | `let count = $state(0)` → inferred as `number` |
| `let` without initializer | **Annotate** | `let el: HTMLElement \| undefined` |
| Complex object literals | **Annotate** | `let config: Config = { ... }` |
| Generic function calls | Annotate if not inferable | `$state<string[]>([])` |

## interface vs type alias

| Use `interface` | Use `type` |
|-----------------|------------|
| Object shapes (Props, Data, Entities) | Unions, intersections, mapped types |
| When you need `extends` inheritance | Discriminated unions |
| API contracts / public surfaces | Utility type compositions |
| Merging/augmenting (declaration merging) | Conditional types |

```ts
// interface — object shapes
interface User { id: string; name: string; email: string }

// type — unions and complex types
type Status = 'idle' | 'loading' | 'done' | 'error';
type Result<T> = { ok: true; data: T } | { ok: false; error: Error };
```

## Generic Components

```svelte
<script lang="ts" generics="T">
  interface Props {
    items: T[];
    selected: T | null;
    onselect: (item: T) => void;
  }
  let { items, selected, onselect }: Props = $props();
</script>
```

## Discriminated Unions for State Machines

```ts
type AsyncState<T> =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'error'; error: Error };

// TypeScript narrows automatically on the discriminant:
function render(state: AsyncState<User>) {
  if (state.status === 'success') {
    state.data // ✓ TypeScript knows `data` exists here
  }
}
```

## Utility Types

| Type | What It Does | Example |
|------|-------------|---------|
| `Partial<T>` | All properties optional | `Partial<User>` for patch updates |
| `Required<T>` | All properties required | `Required<Config>` for validated config |
| `Pick<T, K>` | Subset of properties | `Pick<User, 'id' \| 'name'>` |
| `Omit<T, K>` | All except named keys | `Omit<User, 'password'>` |
| `Record<K, V>` | Object with typed keys/values | `Record<string, number>` |
| `Awaited<T>` | Unwrap Promise type | `Awaited<ReturnType<typeof load>>` |
| `ReturnType<T>` | Return type of function | `ReturnType<typeof createStore>` |
| `Parameters<T>` | Tuple of function params | `Parameters<typeof handler>` |
| `NonNullable<T>` | Remove null/undefined | `NonNullable<string \| null>` → `string` |

## Type Narrowing Patterns

```ts
// typeof — primitives
function format(val: string | number) {
  if (typeof val === 'string') return val.toUpperCase();
  return val.toFixed(2);
}

// instanceof — classes/errors
if (error instanceof TypeError) { error.message }

// in — checking property existence
if ('data' in result) { result.data }

// Custom type guard
function isUser(obj: unknown): obj is User {
  return typeof obj === 'object' && obj !== null && 'id' in obj;
}
```

## The Props Pattern

```svelte
<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
    title: string;
    count?: number;
    variant?: 'primary' | 'secondary';
    onclick?: (e: MouseEvent) => void;
    children: Snippet;
  }

  let { title, count = 0, variant = 'primary', onclick, children }: Props = $props();
</script>
```

## Typing Events

| Event | Type | Common Target |
|-------|------|---------------|
| Click | `MouseEvent` | `HTMLButtonElement` |
| Keyboard | `KeyboardEvent` | `HTMLInputElement` |
| Submit | `SubmitEvent` | `HTMLFormElement` |
| Input | `Event & { currentTarget: HTMLInputElement }` | `HTMLInputElement` |
| Pointer | `PointerEvent` | `HTMLElement` |
| Focus | `FocusEvent` | `HTMLElement` |
| Drag | `DragEvent` | `HTMLElement` |

```svelte
<button onclick={(e: MouseEvent) => { e.currentTarget; /* HTMLButtonElement */ }}>
<input oninput={(e) => { (e.target as HTMLInputElement).value }}>
<form onsubmit={(e: SubmitEvent) => { e.preventDefault(); }}>
```

## Typing Refs

```svelte
<script lang="ts">
  let canvas: HTMLCanvasElement | undefined = $state();
  let dialog: HTMLDialogElement | undefined = $state();
  let wrapper: HTMLDivElement | undefined = $state();

  $effect(() => {
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    // ...
  });
</script>

<canvas bind:this={canvas}></canvas>
<dialog bind:this={dialog}></dialog>
```

## Typing Stores (.svelte.ts files)

```ts
// src/lib/stores/counter.svelte.ts
export class CounterStore {
  count = $state(0);
  doubled = $derived(this.count * 2);

  increment() { this.count++; }
  reset() { this.count = 0; }
}

export const counter = new CounterStore();
```

```ts
// src/lib/stores/auth.svelte.ts
interface User { id: string; name: string; role: 'admin' | 'user' }

class AuthStore {
  user: User | null = $state(null);
  isLoggedIn = $derived(this.user !== null);
  isAdmin = $derived(this.user?.role === 'admin');

  login(user: User) { this.user = user; }
  logout() { this.user = null; }
}

export const auth = new AuthStore();
```

## Common Mistakes

- **Using `any` instead of `unknown`** — `unknown` forces you to narrow, `any` disables all checks.
- **Forgetting to narrow before access** — `state.data` without checking `state.status` first.
- **Using `as` casts excessively** — prefer type guards; casts hide bugs.
- **Not typing `$props()` with an interface** — loses autocomplete and catch missing props.
- **Typing `$state()` redundantly** — `$state<number>(0)` is unnecessary when `$state(0)` infers `number`.
- **Exporting types from .svelte files** — extract shared types to `.ts` files for reuse.
- **Using `Function` type** — use specific signatures: `(arg: Type) => ReturnType`.
- **Confusing `interface` extension with `type` intersection** — `&` creates a new type, `extends` inherits.
