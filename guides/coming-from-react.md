# Coming from React: A Comprehensive Migration Guide to Svelte 5

> **Who this is for:** Experienced React developers (hooks era) who want to learn Svelte 5 with SvelteKit. You will find side-by-side code comparisons, mental model shifts, and a practical "first 48 hours" plan.

---

## Table of Contents

1. [The Big Picture](#the-big-picture)
2. [State: useState to $state](#state-usestate-to-state)
3. [Derived Values: useMemo to $derived](#derived-values-usememo-to-derived)
4. [Side Effects: useEffect to $effect](#side-effects-useeffect-to-effect)
5. [Context: useContext to Svelte Context](#context-usecontext-to-svelte-context)
6. [Component Props](#component-props)
7. [Children and Composition: JSX Children to Snippets](#children-and-composition-jsx-children-to-snippets)
8. [Conditional Rendering](#conditional-rendering)
9. [List Rendering](#list-rendering)
10. [Event Handling](#event-handling)
11. [Refs and DOM Access](#refs-and-dom-access)
12. [Forms and Two-Way Binding](#forms-and-two-way-binding)
13. [Memoization and Performance](#memoization-and-performance)
14. [Global State: Redux/Zustand to .svelte.ts](#global-state-reduxzustand-to-sveltets)
15. [Data Fetching: React Query to SvelteKit Load Functions](#data-fetching-react-query-to-sveltekit-load-functions)
16. [Routing: Next.js to SvelteKit](#routing-nextjs-to-sveltekit)
17. [Styling](#styling)
18. [TypeScript Differences](#typescript-differences)
19. [Common Gotchas](#common-gotchas)
20. [Your First 48 Hours](#your-first-48-hours)

---

## The Big Picture

React and Svelte solve the same problem — building reactive user interfaces — but with fundamentally different philosophies.

**React** is a runtime library. Your JSX compiles to function calls (`React.createElement`) that build a virtual DOM. On every state change, React re-runs your component function, diffs the virtual DOM against the previous version, and patches the real DOM. You write code that describes what the UI should look like, and React figures out how to get there.

**Svelte** is a compiler. Your `.svelte` files compile to imperative JavaScript that surgically updates exactly the DOM nodes that changed. There is no virtual DOM, no diffing, no re-running of component functions. When `count` changes, Svelte generates code that updates the text node that displays `count` — nothing else runs.

What this means for you:
- **No re-render mental model.** In React, you think about "when does this component re-render?" In Svelte, you think about "when does this value change?"
- **No dependency arrays.** React's `useEffect`, `useMemo`, and `useCallback` require you to manually specify dependencies. Svelte's `$effect` and `$derived` track dependencies automatically.
- **No rules of hooks.** No ordering requirements, no "don't call hooks conditionally." Svelte runes work anywhere in the script block.
- **Smaller bundles.** The compiled output ships only the code your components need. No 40KB+ runtime.

---

## State: useState to $state

### React

```tsx
import { useState } from 'react';

function Counter() {
  const [count, setCount] = useState(0);

  return (
    <button onClick={() => setCount(count + 1)}>
      Clicked {count} times
    </button>
  );
}
```

### Svelte 5

```svelte
<script lang="ts">
  let count: number = $state(0);
</script>

<button onclick={() => { count += 1; }}>
  Clicked {count} times
</button>
```

**Key differences:**
- No setter function. You mutate `count` directly. The compiler tracks the assignment and updates the DOM.
- No destructuring. `$state(0)` returns the value, not a `[value, setter]` tuple.
- Object and array state is deeply reactive. You do not need `setItems([...items, newItem])` — you can `items.push(newItem)` and the UI updates.

### Deep reactivity

```tsx
// React: must create new references
const [user, setUser] = useState({ name: 'Ada', score: 0 });
setUser({ ...user, score: user.score + 1 }); // new object required
```

```svelte
<!-- Svelte: mutate in place -->
<script lang="ts">
  let user = $state({ name: 'Ada', score: 0 });
  user.score += 1; // just works
</script>
```

---

## Derived Values: useMemo to $derived

### React

```tsx
import { useState, useMemo } from 'react';

function PriceDisplay({ items }: { items: Item[] }) {
  const total = useMemo(
    () => items.reduce((sum, item) => sum + item.price, 0),
    [items]
  );

  return <p>Total: ${total.toFixed(2)}</p>;
}
```

### Svelte 5

```svelte
<script lang="ts">
  let { items }: { items: Item[] } = $props();

  let total: number = $derived(
    items.reduce((sum: number, item: Item) => sum + item.price, 0)
  );
</script>

<p>Total: ${total.toFixed(2)}</p>
```

**Key differences:**
- No dependency array. Svelte tracks which reactive values `$derived` reads and recalculates automatically when any of them change.
- `$derived` is for computed values, not memoization for performance. Every `$derived` value recalculates when its dependencies change — but since Svelte does not re-run the entire component, this is already efficient.

For complex derivations, use `$derived.by()`:

```svelte
<script lang="ts">
  let total: number = $derived.by(() => {
    let sum: number = 0;
    for (const item of items) {
      if (item.inStock) {
        sum += item.price * item.quantity;
      }
    }
    return sum;
  });
</script>
```

---

## Side Effects: useEffect to $effect

### React

```tsx
import { useState, useEffect } from 'react';

function DocumentTitle({ title }: { title: string }) {
  useEffect(() => {
    document.title = title;
  }, [title]);

  return null;
}

function Timer() {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setSeconds(s => s + 1);
    }, 1000);

    return () => clearInterval(id); // cleanup
  }, []);

  return <p>{seconds}s</p>;
}
```

### Svelte 5

```svelte
<script lang="ts">
  let { title }: { title: string } = $props();

  $effect(() => {
    document.title = title;
    // Dependencies tracked automatically — re-runs when `title` changes
  });
</script>
```

```svelte
<script lang="ts">
  let seconds: number = $state(0);

  $effect(() => {
    const id: ReturnType<typeof setInterval> = setInterval(() => {
      seconds += 1;
    }, 1000);

    return () => clearInterval(id); // cleanup works the same way
  });
</script>

<p>{seconds}s</p>
```

**Key differences:**
- No dependency array. Svelte tracks what `$effect` reads and re-runs it when those values change.
- No stale closure problem. In React, `useEffect` captures values from the render when it was created, leading to stale closures if you forget dependencies. Svelte always reads the current value.
- `$effect` runs after the DOM updates (like `useEffect`, not `useLayoutEffect`).

**Gotcha:** Do not use `$effect` to synchronize state. If you find yourself writing `$effect(() => { derivedValue = compute(source) })`, use `$derived` instead. This is the Svelte equivalent of the React anti-pattern of "useEffect to sync state."

---

## Context: useContext to Svelte Context

### React

```tsx
// theme-context.tsx
import { createContext, useContext, useState } from 'react';

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be inside ThemeProvider');
  return ctx;
}
```

### Svelte 5

```svelte
<!-- ThemeProvider.svelte (parent) -->
<script lang="ts">
  import { setContext } from 'svelte';
  import type { Snippet } from 'svelte';

  let { children }: { children: Snippet } = $props();

  let currentTheme: 'light' | 'dark' = $state('light');

  setContext('theme', {
    get current() { return currentTheme; },
    toggle() { currentTheme = currentTheme === 'light' ? 'dark' : 'light'; }
  });
</script>

{@render children()}
```

```svelte
<!-- Consumer.svelte -->
<script lang="ts">
  import { getContext } from 'svelte';

  interface ThemeContext {
    readonly current: 'light' | 'dark';
    toggle: () => void;
  }

  const theme: ThemeContext = getContext('theme');
</script>

<p>Theme: {theme.current}</p>
<button onclick={theme.toggle}>Toggle</button>
```

**Key differences:**
- No provider component wrapper required (though you can use one for organization).
- Context is set with `setContext()` and read with `getContext()` — no `createContext` + `useContext` two-step.
- Context is available to all descendants, not just those inside a `<Provider>` JSX wrapper.
- To make context reactive, use a getter or pass a reactive object. Plain values are not reactive through context.

---

## Component Props

### React

```tsx
interface ButtonProps {
  variant?: 'primary' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  onClick?: (e: React.MouseEvent) => void;
  children: React.ReactNode;
}

function Button({
  variant = 'primary',
  size = 'md',
  disabled = false,
  onClick,
  children
}: ButtonProps) {
  return (
    <button
      className={`btn btn--${variant} btn--${size}`}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
```

### Svelte 5

```svelte
<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
    variant?: 'primary' | 'secondary';
    size?: 'sm' | 'md' | 'lg';
    disabled?: boolean;
    onclick?: (e: MouseEvent) => void;
    children: Snippet;
  }

  let {
    variant = 'primary',
    size = 'md',
    disabled = false,
    onclick,
    children
  }: Props = $props();
</script>

<button
  class="btn btn--{variant} btn--{size}"
  {disabled}
  {onclick}
>
  {@render children()}
</button>
```

**Key differences:**
- Props are destructured from `$props()`, not from function arguments.
- Default values work naturally with destructuring defaults.
- `children` is a `Snippet`, not `React.ReactNode`. You render it with `{@render children()}`.
- Event handlers use lowercase DOM names: `onclick` not `onClick`.

---

## Children and Composition: JSX Children to Snippets

### React

```tsx
function Card({ header, children, footer }: {
  header: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <div className="card">
      <div className="card-header">{header}</div>
      <div className="card-body">{children}</div>
      {footer && <div className="card-footer">{footer}</div>}
    </div>
  );
}

// Usage
<Card
  header={<h2>Title</h2>}
  footer={<button>Save</button>}
>
  <p>Content here</p>
</Card>
```

### Svelte 5

```svelte
<!-- Card.svelte -->
<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
    header: Snippet;
    children: Snippet;
    footer?: Snippet;
  }

  let { header, children, footer }: Props = $props();
</script>

<div class="card">
  <div class="card-header">{@render header()}</div>
  <div class="card-body">{@render children()}</div>
  {#if footer}
    <div class="card-footer">{@render footer()}</div>
  {/if}
</div>
```

```svelte
<!-- Usage -->
<Card>
  {#snippet header()}
    <h2>Title</h2>
  {/snippet}

  <p>Content here</p>

  {#snippet footer()}
    <button>Save</button>
  {/snippet}
</Card>
```

**Key differences:**
- React uses props for passing JSX; Svelte uses named snippets.
- `children` is the default snippet — content placed directly inside the component tags.
- Snippets can accept parameters, enabling render props-like patterns.

---

## Conditional Rendering

### React

```tsx
function Status({ isOnline }: { isOnline: boolean }) {
  return (
    <div>
      {isOnline ? (
        <span className="online">Online</span>
      ) : (
        <span className="offline">Offline</span>
      )}
    </div>
  );
}
```

### Svelte 5

```svelte
<div>
  {#if isOnline}
    <span class="online">Online</span>
  {:else}
    <span class="offline">Offline</span>
  {/if}
</div>
```

Svelte also supports `{:else if condition}` for chains. No need for nested ternaries.

---

## List Rendering

### React

```tsx
function TodoList({ todos }: { todos: Todo[] }) {
  return (
    <ul>
      {todos.map(todo => (
        <li key={todo.id}>{todo.text}</li>
      ))}
    </ul>
  );
}
```

### Svelte 5

```svelte
<ul>
  {#each todos as todo (todo.id)}
    <li>{todo.text}</li>
  {/each}
</ul>
```

**Key differences:**
- `{#each}` is a template block, not a `.map()` call.
- The key goes in parentheses after the iteration variable: `(todo.id)`.
- Always use a key expression for lists that change. Svelte calls this a "keyed each block."

---

## Event Handling

### React

```tsx
function Form() {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // handle submit
  };

  return (
    <form onSubmit={handleSubmit}>
      <button type="submit">Submit</button>
    </form>
  );
}
```

### Svelte 5

```svelte
<script lang="ts">
  function handleSubmit(e: SubmitEvent): void {
    e.preventDefault();
    // handle submit
  }
</script>

<form onsubmit={handleSubmit}>
  <button type="submit">Submit</button>
</form>
```

**Key differences:**
- Event handler names are lowercase: `onclick`, `onsubmit`, `onkeydown`.
- No synthetic event system. You get native DOM events.
- Event modifiers like `preventDefault` are done manually in the handler (Svelte 5 removed the `|preventDefault` modifier syntax from Svelte 4).

---

## Refs and DOM Access

### React

```tsx
import { useRef, useEffect } from 'react';

function AutoFocus() {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  return <input ref={inputRef} />;
}
```

### Svelte 5

```svelte
<script lang="ts">
  let inputEl: HTMLInputElement | undefined = $state();

  $effect(() => {
    inputEl?.focus();
  });
</script>

<input bind:this={inputEl} />
```

**Key differences:**
- `bind:this` replaces `ref`.
- The bound variable is reactive — when the element mounts, `$effect` sees the change and runs.

---

## Forms and Two-Way Binding

### React

```tsx
function NameInput() {
  const [name, setName] = useState('');

  return (
    <input
      value={name}
      onChange={(e) => setName(e.target.value)}
    />
  );
}
```

### Svelte 5

```svelte
<script lang="ts">
  let name: string = $state('');
</script>

<input bind:value={name} />
```

**Key differences:**
- `bind:value` is genuine two-way binding. No `onChange` handler needed.
- Also works for `bind:checked` (checkboxes), `bind:group` (radio groups), `bind:files` (file inputs).
- This is one of the largest DX improvements over React for form-heavy applications.

---

## Memoization and Performance

### React

```tsx
import { memo, useMemo, useCallback } from 'react';

const ExpensiveList = memo(function ExpensiveList({ items }: { items: Item[] }) {
  const sorted = useMemo(
    () => [...items].sort((a, b) => a.name.localeCompare(b.name)),
    [items]
  );

  return (
    <ul>
      {sorted.map(item => <li key={item.id}>{item.name}</li>)}
    </ul>
  );
});

// Parent must use useCallback to prevent re-renders
function Parent() {
  const handleClick = useCallback(() => { /* ... */ }, []);
  return <Child onClick={handleClick} />;
}
```

### Svelte 5

```svelte
<script lang="ts">
  let { items }: { items: Item[] } = $props();

  let sorted: Item[] = $derived(
    [...items].sort((a: Item, b: Item) => a.name.localeCompare(b.name))
  );
</script>

<ul>
  {#each sorted as item (item.id)}
    <li>{item.name}</li>
  {/each}
</ul>
```

**Key differences:**
- No `React.memo`. Svelte components do not re-render — they update specific DOM nodes. There is nothing to memoize at the component level.
- No `useCallback`. Since there is no re-rendering, function identity stability is irrelevant.
- No `useMemo`. Use `$derived` for computed values. It serves the purpose of expressing derived data, and performance is handled by the compiler.

This is perhaps the most liberating difference for React developers. The entire category of "unnecessary re-render" bugs and their `memo`/`useCallback`/`useMemo` mitigation strategies simply does not exist in Svelte.

---

## Global State: Redux/Zustand to .svelte.ts

### React (with Zustand)

```tsx
// store.ts
import { create } from 'zustand';

interface CartStore {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  total: () => number;
}

const useCartStore = create<CartStore>((set, get) => ({
  items: [],
  addItem: (item) => set((state) => ({
    items: [...state.items, item]
  })),
  removeItem: (id) => set((state) => ({
    items: state.items.filter(i => i.id !== id)
  })),
  total: () => get().items.reduce((sum, i) => sum + i.price, 0)
}));
```

### Svelte 5

```typescript
// cart.svelte.ts
interface CartItem {
  id: string;
  name: string;
  price: number;
}

class CartStore {
  items: CartItem[] = $state([]);

  get total(): number {
    return this.items.reduce((sum: number, item: CartItem) => sum + item.price, 0);
  }

  addItem(item: CartItem): void {
    this.items.push(item);
  }

  removeItem(id: string): void {
    this.items = this.items.filter((item: CartItem) => item.id !== id);
  }
}

export const cart = new CartStore();
```

```svelte
<!-- Cart.svelte -->
<script lang="ts">
  import { cart } from '$lib/cart.svelte';
</script>

<p>Total: ${cart.total.toFixed(2)}</p>
<ul>
  {#each cart.items as item (item.id)}
    <li>
      {item.name} — ${item.price}
      <button onclick={() => cart.removeItem(item.id)}>Remove</button>
    </li>
  {/each}
</ul>
```

**Key differences:**
- No store library needed. A `.svelte.ts` file with `$state` and class getters gives you reactive global state.
- No selectors, no subscriptions, no `useStore` hooks. Import and use directly.
- Deep reactivity means `items.push(item)` triggers updates — no need to spread into a new array.

---

## Data Fetching: React Query to SvelteKit Load Functions

### React (with React Query)

```tsx
import { useQuery } from '@tanstack/react-query';

function ProductPage({ slug }: { slug: string }) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['product', slug],
    queryFn: () => fetch(`/api/products/${slug}`).then(r => r.json())
  });

  if (isLoading) return <Skeleton />;
  if (error) return <ErrorMessage error={error} />;
  return <ProductDetail product={data} />;
}
```

### SvelteKit

```typescript
// +page.server.ts
import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ params, fetch }) => {
  const res = await fetch(`/api/products/${params.slug}`);
  if (!res.ok) error(404, 'Product not found');
  const product = await res.json();
  return { product };
};
```

```svelte
<!-- +page.svelte -->
<script lang="ts">
  let { data } = $props();
</script>

<h1>{data.product.name}</h1>
<p>${data.product.price}</p>
```

**Key differences:**
- No loading states to manage. Data is available before the component renders.
- No client-side fetching library needed. Load functions run on the server (SSR) and during navigation.
- Full SEO — data is in the HTML on first load.
- Type-safe end-to-end via auto-generated `$types`.
- For mutations, SvelteKit offers form actions and remote functions instead of `useMutation`.

---

## Routing: Next.js to SvelteKit

| Next.js (App Router) | SvelteKit | Notes |
|---|---|---|
| `app/page.tsx` | `src/routes/+page.svelte` | Home page |
| `app/about/page.tsx` | `src/routes/about/+page.svelte` | Static route |
| `app/blog/[slug]/page.tsx` | `src/routes/blog/[slug]/+page.svelte` | Dynamic route |
| `app/layout.tsx` | `src/routes/+layout.svelte` | Root layout |
| `app/blog/layout.tsx` | `src/routes/blog/+layout.svelte` | Nested layout |
| `app/api/users/route.ts` | `src/routes/api/users/+server.ts` | API route |
| `app/loading.tsx` | Not needed (data loads before render) | Load functions solve this |
| `app/error.tsx` | `src/routes/+error.svelte` | Error boundary |
| `generateStaticParams()` | `entries()` in `+page.ts` | SSG dynamic routes |
| `'use server'` | `+page.server.ts` or remote functions | Server actions |
| Middleware | `hooks.server.ts` | Request hooks |

**Key differences:**
- SvelteKit uses `+page.svelte` (with a `+` prefix) instead of `page.tsx`.
- Layouts use `+layout.svelte` and automatically wrap child routes.
- Data loading is explicit via `+page.server.ts` / `+page.ts` files, not mixed into components.
- No "use client" / "use server" directives. The file name determines where code runs.

---

## Styling

### React

```tsx
// CSS Modules
import styles from './Button.module.css';
<button className={styles.primary}>Click</button>

// Tailwind
<button className="bg-blue-500 text-white px-4 py-2 rounded">Click</button>

// styled-components
const StyledButton = styled.button`
  background: blue;
  color: white;
`;
```

### Svelte 5

```svelte
<button class="primary">Click</button>

<style>
  .primary {
    background: var(--color-brand);
    color: oklch(100% 0 0);
    padding: var(--space-sm) var(--space-md);
    border-radius: var(--radius-md);
  }
</style>
```

**Key differences:**
- Styles are scoped by default. The `.primary` class only applies to elements in this component.
- No CSS modules, no styled-components, no CSS-in-JS library needed.
- Use `class` not `className`.
- The PE7 architecture uses CSS custom properties (design tokens) for all values, making theming and consistency automatic.

---

## TypeScript Differences

- React uses `.tsx` extension; Svelte uses `.svelte` with `<script lang="ts">`.
- React types come from `@types/react`; Svelte types are built-in.
- Props: React uses function parameter types; Svelte uses `$props()` with an interface.
- Events: React uses synthetic events (`React.MouseEvent`); Svelte uses native DOM events (`MouseEvent`).
- SvelteKit auto-generates types for load functions via `$types` — no manual type wiring.

---

## Common Gotchas

### 1. Forgetting that state is deeply reactive
In React, you must create new objects/arrays to trigger re-renders. In Svelte, mutations work. But this means you must be careful about unintended mutations — if two variables reference the same object, mutating one affects both.

### 2. Using $effect to derive state
If you catch yourself writing `$effect(() => { computed = fn(source) })`, replace it with `$derived`. Effects are for side effects (DOM manipulation, API calls, logging), not for computing values.

### 3. Expecting components to "re-render"
In React, you debug by asking "why did this re-render?" In Svelte, components do not re-render. Individual DOM nodes update when their reactive dependencies change. Debug by asking "why did this value change?"

### 4. Using className instead of class
Svelte uses the standard HTML `class` attribute, not React's `className`.

### 5. Forgetting the key in {#each}
```svelte
<!-- Wrong -->
{#each items as item}
  <p>{item.name}</p>
{/each}

<!-- Right -->
{#each items as item (item.id)}
  <p>{item.name}</p>
{/each}
```

### 6. Trying to return JSX
Svelte components do not return JSX. The template is the component's output. There is no `return` statement.

### 7. Looking for useReducer
Use a class with `$state` and methods instead. The class approach is more natural and provides the same encapsulation.

### 8. Event handler naming
It is `onclick`, not `onClick`. All lowercase, matching the DOM.

---

## Your First 48 Hours

### Hour 0-2: Setup and orientation
- [ ] Run `pnpm create svelte@latest my-app` and choose the TypeScript skeleton
- [ ] Open `src/routes/+page.svelte` — notice the three blocks: `<script>`, markup, `<style>`
- [ ] Replace the default content with a counter using `$state`
- [ ] Open the browser — changes hot-reload instantly

### Hour 2-6: Core runes
- [ ] Build a todo list with `$state` (array of objects)
- [ ] Add a `$derived` computed value (e.g., items remaining)
- [ ] Add an `$effect` that saves to localStorage
- [ ] Style everything with scoped CSS and PE7 tokens

### Hour 6-12: Components and props
- [ ] Extract the todo item into its own component with `$props()`
- [ ] Pass a callback prop for deletion
- [ ] Create a `{#snippet}` for custom rendering
- [ ] Use `{#each}` with keys for the list

### Hour 12-20: Routing and data loading
- [ ] Create `src/routes/about/+page.svelte` — you now have routing
- [ ] Create `src/routes/blog/[slug]/+page.svelte` with a dynamic parameter
- [ ] Add a `+page.server.ts` load function that returns data
- [ ] Use `let { data } = $props()` in the page component
- [ ] Add a `+layout.svelte` with a navigation bar

### Hour 20-30: Forms and state management
- [ ] Build a form with `bind:value` and form actions
- [ ] Create a `.svelte.ts` file for shared state (replace Redux/Zustand)
- [ ] Use `setContext`/`getContext` for component-tree-scoped state

### Hour 30-48: Real-world patterns
- [ ] Add error handling with `+error.svelte`
- [ ] Implement authentication with hooks (`hooks.server.ts`)
- [ ] Deploy to Vercel or Cloudflare with the appropriate adapter
- [ ] Read the official Svelte tutorial at https://svelte.dev/tutorial

### Mental model checklist
- [ ] I no longer think about "re-renders"
- [ ] I use `$derived` instead of `$effect` for computed values
- [ ] I mutate arrays and objects directly
- [ ] I use `bind:value` instead of onChange + setState
- [ ] I use `class` not `className`
- [ ] I use lowercase event handlers (`onclick`)
- [ ] I know data loads before components render in SvelteKit

---

## Lifecycle: useEffect Cleanup Patterns

### React

```tsx
function WebSocketChat({ roomId }: { roomId: string }) {
  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    const ws = new WebSocket(`wss://api.example.com/rooms/${roomId}`);
    ws.onmessage = (e) => {
      setMessages(prev => [...prev, JSON.parse(e.data)]);
    };
    return () => ws.close(); // cleanup on unmount or roomId change
  }, [roomId]);

  return (
    <ul>
      {messages.map(msg => <li key={msg.id}>{msg.text}</li>)}
    </ul>
  );
}
```

### Svelte 5

```svelte
<script lang="ts">
  let { roomId }: { roomId: string } = $props();
  let messages: Message[] = $state([]);

  $effect(() => {
    const ws = new WebSocket(`wss://api.example.com/rooms/${roomId}`);
    ws.onmessage = (e: MessageEvent) => {
      messages.push(JSON.parse(e.data));
    };
    return () => ws.close(); // cleanup works the same way
  });
</script>

<ul>
  {#each messages as msg (msg.id)}
    <li>{msg.text}</li>
  {/each}
</ul>
```

**Key differences:**
- Cleanup return function works identically in both frameworks.
- No dependency array — Svelte tracks that the effect reads `roomId` and re-runs automatically when it changes.
- `messages.push()` mutates in place instead of `setMessages(prev => [...prev, item])`.

---

## Error Boundaries

### React

```tsx
class ErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback: React.ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('Caught:', error, info);
  }

  render() {
    if (this.state.hasError) return this.props.fallback;
    return this.props.children;
  }
}

// Usage
<ErrorBoundary fallback={<p>Something went wrong</p>}>
  <RiskyComponent />
</ErrorBoundary>
```

### Svelte 5

```svelte
<svelte:boundary onerror={(error) => console.error('Caught:', error)}>
  <RiskyComponent />

  {#snippet failed(error, reset)}
    <p>Something went wrong: {error.message}</p>
    <button onclick={reset}>Try again</button>
  {/snippet}
</svelte:boundary>
```

**Key differences:**
- React requires a class component for error boundaries (no hook equivalent).
- Svelte uses `<svelte:boundary>` — a declarative template element.
- Svelte's `{#snippet failed}` provides both the error and a `reset` function to retry.
- No class component ceremony. The boundary is just a template block.

---

## Async Data Patterns (Suspense vs {#await})

### React

```tsx
import { Suspense } from 'react';

function App() {
  return (
    <Suspense fallback={<Skeleton />}>
      <UserProfile />
    </Suspense>
  );
}

// UserProfile uses a data fetching library with Suspense support
function UserProfile() {
  const user = use(fetchUser()); // React 19+ use() hook
  return <h1>{user.name}</h1>;
}
```

### Svelte 5

```svelte
<script lang="ts">
  const userPromise: Promise<User> = fetchUser();
</script>

{#await userPromise}
  <Skeleton />
{:then user}
  <h1>{user.name}</h1>
{:catch error}
  <p>Failed to load: {error.message}</p>
{/await}
```

**Key differences:**
- React's Suspense is a component boundary that catches thrown promises. It requires library support.
- Svelte's `{#await}` is a template block that handles any Promise directly.
- Svelte's version includes built-in error handling via `{:catch}` — React's Suspense requires a separate ErrorBoundary for errors.
- No special library integration needed in Svelte — any Promise works.

---

## Animations and Transitions

### React

```tsx
// React does not have built-in transitions.
// Most teams use framer-motion:
import { motion, AnimatePresence } from 'framer-motion';

function Modal({ isOpen }: { isOpen: boolean }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.3 }}
        >
          Modal content
        </motion.div>
      )}
    </AnimatePresence>
  );
}
```

### Svelte 5

```svelte
<script lang="ts">
  import { fade, fly } from 'svelte/transition';

  let isOpen: boolean = $state(false);
</script>

{#if isOpen}
  <div transition:fly={{ y: 20, duration: 300 }}>
    Modal content
  </div>
{/if}
```

**Key differences:**
- React needs a third-party library (framer-motion, react-spring) for mount/unmount animations.
- Svelte has built-in transitions: `fade`, `fly`, `slide`, `scale`, `blur`, `draw`.
- Apply with `transition:name` (both enter and exit), `in:name` (enter only), or `out:name` (exit only).
- Transitions are declared on the element, not wrapped in animation components.
- Custom transitions are functions — you can create your own with CSS or JavaScript-based animations.

---

## Portals / Teleport

### React

```tsx
import { createPortal } from 'react-dom';

function Modal({ children }: { children: React.ReactNode }) {
  return createPortal(
    <div className="modal-overlay">{children}</div>,
    document.body
  );
}
```

### Svelte 5

Svelte does not have a built-in portal/teleport. The most common approach is a Svelte action:

```svelte
<script lang="ts">
  function portal(node: HTMLElement, target: string = 'body') {
    const container: Element | null = document.querySelector(target);
    if (container) container.appendChild(node);

    return {
      destroy() {
        node.remove();
      }
    };
  }
</script>

<div use:portal={'body'} class="modal-overlay">
  Modal content
</div>
```

Alternatively, since SvelteKit renders the entire page, many "portal" use cases are solved by rendering the modal at the root layout level and controlling visibility via a store.

---

## Pattern Summary Table

| React | Svelte 5 | Category |
|-------|----------|----------|
| `useState` | `$state` | State |
| `useReducer` | Class with `$state` + methods | State |
| `useMemo` | `$derived` | Derived |
| `useCallback` | Not needed | Performance |
| `React.memo` | Not needed | Performance |
| `useEffect` | `$effect` | Side effects |
| `useRef` (DOM) | `bind:this` | DOM access |
| `useRef` (value) | Regular `let` variable | Persistent value |
| `useContext` | `getContext` | Context |
| `createContext` | `setContext` | Context |
| `forwardRef` | `bind:this` on component | Ref forwarding |
| `useImperativeHandle` | Export functions from script | Component API |
| `Suspense` | `{#await}` | Async |
| `ErrorBoundary` | `<svelte:boundary>` | Error handling |
| `createPortal` | Action or root-level render | DOM teleport |
| `lazy()` | `import()` in load functions | Code splitting |
| `StrictMode` | Not needed | Development |
| JSX | Template syntax | Rendering |
| `className` | `class` | Styling |
| `onClick` | `onclick` | Events |
| `key={id}` | `(id)` in `{#each}` | List identity |
| `dangerouslySetInnerHTML` | `{@html}` | Raw HTML |
| `React.Fragment` | Not needed (Svelte supports multiple root elements) | Fragment |

---

## Further Reading

- [Official Svelte Tutorial](https://svelte.dev/tutorial) — interactive, excellent
- [SvelteKit Documentation](https://svelte.dev/docs/kit) — comprehensive reference
- [Svelte 5 Runes RFC](https://svelte.dev/blog/runes) — the design philosophy behind runes
