# Coming from Vue: A Comprehensive Migration Guide to Svelte 5

> **Who this is for:** Experienced Vue 3 developers (Composition API era) who want to learn Svelte 5 with SvelteKit. You will find side-by-side code comparisons for every major concept, mental model shifts, and a practical "first 48 hours" plan.

---

## Table of Contents

1. [The Big Picture](#the-big-picture)
2. [Reactivity: ref/reactive to $state](#reactivity-refreactive-to-state)
3. [Computed: computed() to $derived](#computed-computed-to-derived)
4. [Watchers: watch/watchEffect to $effect](#watchers-watchwatcheffect-to-effect)
5. [Props: defineProps to $props](#props-defineprops-to-props)
6. [Events: defineEmits to Callback Props](#events-defineemits-to-callback-props)
7. [Slots to Snippets](#slots-to-snippets)
8. [Template Syntax Comparison](#template-syntax-comparison)
9. [Conditional and List Rendering](#conditional-and-list-rendering)
10. [Two-Way Binding: v-model to bind:](#two-way-binding-v-model-to-bind)
11. [Template Refs](#template-refs)
12. [Lifecycle Hooks](#lifecycle-hooks)
13. [Provide/Inject to setContext/getContext](#provideinject-to-setcontextgetcontext)
14. [Global State: Pinia to .svelte.ts](#global-state-pinia-to-sveltets)
15. [Routing: Nuxt to SvelteKit](#routing-nuxt-to-sveltekit)
16. [Styling: Scoped Styles Comparison](#styling-scoped-styles-comparison)
17. [Directives: Vue Directives to Svelte Actions](#directives-vue-directives-to-svelte-actions)
18. [Transitions and Animations](#transitions-and-animations)
19. [Common Gotchas](#common-gotchas)
20. [Your First 48 Hours](#your-first-48-hours)

---

## The Big Picture

Vue and Svelte are closer in philosophy than either is to React. Both compile templates, both have built-in reactivity systems, and both offer scoped styles out of the box. The migration is smoother than from React.

**Vue** uses a runtime reactivity system based on JavaScript Proxies. Your component is a JavaScript object (or `<script setup>` block) that Vue wraps in proxies to track property access and trigger re-renders. The Virtual DOM diffs changes.

**Svelte** is a compiler. Your `.svelte` file compiles to imperative JavaScript that directly updates the DOM nodes that changed. No virtual DOM, no proxies, no runtime reactivity system.

What this means for you:
- **No `.value` unwrapping.** Vue's `ref()` requires `.value` in JavaScript and auto-unwraps in templates. Svelte's `$state` has no wrapper — the variable IS the value.
- **No `reactive()` vs `ref()` decision.** In Vue, you choose between `ref()` for primitives and `reactive()` for objects. In Svelte, `$state` works for everything and provides deep reactivity.
- **Simpler mental model.** No Proxy, no Ref unwrapping, no `toRefs()`, no `unref()`, no `isRef()`. Just variables.
- **Smaller bundles.** No runtime framework shipped to the browser.

---

## Reactivity: ref/reactive to $state

### Vue 3

```vue
<script setup lang="ts">
import { ref, reactive } from 'vue';

const count = ref<number>(0);
const user = reactive<{ name: string; score: number }>({
  name: 'Ada',
  score: 0
});

function increment(): void {
  count.value += 1;    // .value required in JS
  user.score += 1;     // reactive() — no .value needed
}
</script>

<template>
  <p>Count: {{ count }}</p>    <!-- auto-unwrapped in template -->
  <p>Score: {{ user.score }}</p>
  <button @click="increment">+1</button>
</template>
```

### Svelte 5

```svelte
<script lang="ts">
  let count: number = $state(0);
  let user = $state({ name: 'Ada', score: 0 });

  function increment(): void {
    count += 1;         // just assign
    user.score += 1;    // deep reactivity, just mutate
  }
</script>

<p>Count: {count}</p>
<p>Score: {user.score}</p>
<button onclick={increment}>+1</button>
```

**Key differences:**
- No `.value`. Ever. The variable is the value.
- No `ref()` vs `reactive()` distinction. `$state` works for primitives, objects, and arrays.
- No auto-unwrapping in templates because there is nothing to unwrap.
- Deep reactivity is automatic — `user.score += 1` triggers an update.

### Arrays

```vue
<!-- Vue -->
<script setup lang="ts">
import { ref } from 'vue';
const items = ref<string[]>([]);
items.value.push('new item');  // works because array is proxied
</script>
```

```svelte
<!-- Svelte -->
<script lang="ts">
  let items: string[] = $state([]);
  items.push('new item');  // just works
</script>
```

---

## Computed: computed() to $derived

### Vue 3

```vue
<script setup lang="ts">
import { ref, computed } from 'vue';

const items = ref<CartItem[]>([]);

const total = computed<number>(() =>
  items.value.reduce((sum, item) => sum + item.price, 0)
);

const itemCount = computed<number>(() => items.value.length);
</script>

<template>
  <p>{{ itemCount }} items, total: ${{ total.toFixed(2) }}</p>
</template>
```

### Svelte 5

```svelte
<script lang="ts">
  let items: CartItem[] = $state([]);

  let total: number = $derived(
    items.reduce((sum: number, item: CartItem) => sum + item.price, 0)
  );

  let itemCount: number = $derived(items.length);
</script>

<p>{itemCount} items, total: ${total.toFixed(2)}</p>
```

**Key differences:**
- `$derived` replaces `computed()`. Same concept, different syntax.
- No `.value` needed to read the computed value.
- Dependencies are tracked automatically, just like Vue's `computed()`.
- For multi-line computations, use `$derived.by(() => { ... })`.

```svelte
<script lang="ts">
  let expensiveTotal: number = $derived.by(() => {
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

## Watchers: watch/watchEffect to $effect

### Vue 3

```vue
<script setup lang="ts">
import { ref, watch, watchEffect, onUnmounted } from 'vue';

const searchQuery = ref<string>('');
const results = ref<SearchResult[]>([]);

// watchEffect — auto-tracks dependencies
watchEffect(() => {
  document.title = `Search: ${searchQuery.value}`;
});

// watch — explicit source, with old value
watch(searchQuery, (newVal, oldVal) => {
  console.log(`Changed from "${oldVal}" to "${newVal}"`);
  fetchResults(newVal).then(r => { results.value = r; });
});

// watch with cleanup
const intervalId = setInterval(() => { /* ... */ }, 1000);
onUnmounted(() => clearInterval(intervalId));
</script>
```

### Svelte 5

```svelte
<script lang="ts">
  let searchQuery: string = $state('');
  let results: SearchResult[] = $state([]);

  // Like watchEffect — auto-tracks dependencies
  $effect(() => {
    document.title = `Search: ${searchQuery}`;
  });

  // Like watch — runs when dependencies change, with cleanup
  $effect(() => {
    fetchResults(searchQuery).then((r: SearchResult[]) => {
      results = r;
    });
  });

  // With cleanup (return function, like watchEffect's onCleanup)
  $effect(() => {
    const id: ReturnType<typeof setInterval> = setInterval(() => {
      /* ... */
    }, 1000);
    return () => clearInterval(id);
  });
</script>
```

**Key differences:**
- `$effect` replaces both `watch` and `watchEffect`. There is no need for two different APIs.
- No `onUnmounted` needed — return a cleanup function from `$effect`, just like `watchEffect`'s `onCleanup`.
- No `.value` access — Svelte automatically tracks which reactive values the effect reads.
- To get the previous value (like `watch`'s `(newVal, oldVal)`), store it yourself in a variable.

**Gotcha:** Do not use `$effect` to synchronize state. If you find yourself writing `$effect(() => { derivedValue = compute(source) })`, use `$derived` instead. This is the equivalent of the Vue anti-pattern of using `watch` to set a ref when `computed` would be more appropriate.

---

## Props: defineProps to $props

### Vue 3

```vue
<script setup lang="ts">
interface Props {
  variant?: 'primary' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'primary',
  size: 'md',
  disabled: false
});
</script>

<template>
  <button :class="`btn btn--${props.variant} btn--${props.size}`" :disabled="props.disabled">
    <slot />
  </button>
</template>
```

### Svelte 5

```svelte
<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
    variant?: 'primary' | 'secondary';
    size?: 'sm' | 'md' | 'lg';
    disabled?: boolean;
    children: Snippet;
  }

  let {
    variant = 'primary',
    size = 'md',
    disabled = false,
    children
  }: Props = $props();
</script>

<button class="btn btn--{variant} btn--{size}" {disabled}>
  {@render children()}
</button>
```

**Key differences:**
- `$props()` with destructuring replaces `defineProps<>()` + `withDefaults()`.
- Default values are JavaScript destructuring defaults — no separate `withDefaults` call.
- Props are directly accessible as variables, not on a `props` object.
- Children content is a `Snippet` type, rendered with `{@render children()}`.

---

## Events: defineEmits to Callback Props

### Vue 3

```vue
<script setup lang="ts">
const emit = defineEmits<{
  (e: 'update', value: string): void;
  (e: 'delete'): void;
}>();

function handleSave(): void {
  emit('update', 'new value');
}
</script>

<template>
  <button @click="handleSave">Save</button>
  <button @click="emit('delete')">Delete</button>
</template>
```

### Svelte 5

```svelte
<script lang="ts">
  interface Props {
    onupdate?: (value: string) => void;
    ondelete?: () => void;
  }

  let { onupdate, ondelete }: Props = $props();

  function handleSave(): void {
    onupdate?.('new value');
  }
</script>

<button onclick={handleSave}>Save</button>
<button onclick={ondelete}>Delete</button>
```

**Key differences:**
- No `emit` system. Svelte uses callback props — pass functions down, call them up.
- Event handler props are just regular props with function types.
- Convention: prefix with `on` (e.g., `onupdate`, `ondelete`).
- Simpler to type, simpler to understand, and directly callable as functions.

---

## Slots to Snippets

### Vue 3

```vue
<!-- Card.vue -->
<template>
  <div class="card">
    <div class="card-header">
      <slot name="header" />
    </div>
    <div class="card-body">
      <slot />
    </div>
    <div class="card-footer">
      <slot name="footer" :count="itemCount" />
    </div>
  </div>
</template>
```

```vue
<!-- Usage -->
<Card>
  <template #header>
    <h2>Title</h2>
  </template>

  <p>Default slot content</p>

  <template #footer="{ count }">
    <p>{{ count }} items</p>
  </template>
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
    footer: Snippet<[number]>;
  }

  let { header, children, footer }: Props = $props();

  let itemCount: number = $state(5);
</script>

<div class="card">
  <div class="card-header">{@render header()}</div>
  <div class="card-body">{@render children()}</div>
  <div class="card-footer">{@render footer(itemCount)}</div>
</div>
```

```svelte
<!-- Usage -->
<Card>
  {#snippet header()}
    <h2>Title</h2>
  {/snippet}

  <p>Default snippet content</p>

  {#snippet footer(count)}
    <p>{count} items</p>
  {/snippet}
</Card>
```

**Key differences:**
- Vue's `<slot>` becomes Svelte's `{@render snippet()}`.
- Vue's named slots (`<template #name>`) become Svelte's named snippets (`{#snippet name()}`).
- Vue's scoped slots (`<slot :data="value">`) become snippet parameters (`{#snippet name(value)}`).
- Default slot content maps to the `children` snippet.
- Snippets are typed — `Snippet<[number]>` means the snippet receives a number parameter.

---

## Template Syntax Comparison

| Vue | Svelte | Notes |
|-----|--------|-------|
| `{{ value }}` | `{value}` | Single curly braces |
| `:class="expr"` | `class={expr}` | No colon prefix |
| `:class="{ active: isActive }"` | `class:active={isActive}` | Class directive |
| `:style="{ color: c }"` | `style:color={c}` | Style directive |
| `v-if="show"` | `{#if show}` | Block syntax |
| `v-else` | `{:else}` | Block continuation |
| `v-else-if="other"` | `{:else if other}` | Block continuation |
| `v-for="item in items" :key="item.id"` | `{#each items as item (item.id)}` | Keyed iteration |
| `v-model="value"` | `bind:value` | Two-way binding |
| `v-on:click="handler"` / `@click` | `onclick={handler}` | Event binding |
| `v-html="rawHtml"` | `{@html rawHtml}` | Raw HTML |
| `v-show="visible"` | No direct equivalent | Use `class:hidden` or `{#if}` |
| `<Teleport to="body">` | Use a portal action or DOM API | No built-in Teleport |
| `<Transition>` | `transition:fade` | Built-in transitions |
| `<KeepAlive>` | No direct equivalent | Not needed (no VDOM) |

---

## Conditional and List Rendering

### Vue 3

```vue
<template>
  <div v-if="status === 'loading'">Loading...</div>
  <div v-else-if="status === 'error'">Error: {{ errorMessage }}</div>
  <div v-else>
    <ul>
      <li v-for="item in items" :key="item.id">
        {{ item.name }}
      </li>
    </ul>
  </div>
</template>
```

### Svelte 5

```svelte
{#if status === 'loading'}
  <div>Loading...</div>
{:else if status === 'error'}
  <div>Error: {errorMessage}</div>
{:else}
  <div>
    <ul>
      {#each items as item (item.id)}
        <li>{item.name}</li>
      {/each}
    </ul>
  </div>
{/if}
```

**Key differences:**
- Vue uses directives on elements (`v-if`, `v-for`); Svelte uses block syntax (`{#if}`, `{#each}`).
- Svelte's block syntax can wrap multiple elements without a container — no need for `<template>` wrapper.
- The key in `{#each}` goes in parentheses after the variable declaration, not as a separate attribute.

---

## Two-Way Binding: v-model to bind:

### Vue 3

```vue
<script setup lang="ts">
import { ref } from 'vue';
const name = ref<string>('');
const agreed = ref<boolean>(false);
const selected = ref<string>('option-a');
</script>

<template>
  <input v-model="name" />
  <input type="checkbox" v-model="agreed" />
  <select v-model="selected">
    <option value="option-a">A</option>
    <option value="option-b">B</option>
  </select>
</template>
```

### Svelte 5

```svelte
<script lang="ts">
  let name: string = $state('');
  let agreed: boolean = $state(false);
  let selected: string = $state('option-a');
</script>

<input bind:value={name} />
<input type="checkbox" bind:checked={agreed} />
<select bind:value={selected}>
  <option value="option-a">A</option>
  <option value="option-b">B</option>
</select>
```

**Key differences:**
- `v-model` becomes `bind:value` for inputs and selects, `bind:checked` for checkboxes.
- `bind:group` handles radio button groups (similar to `v-model` on radio buttons).
- `bind:files` for file inputs — Vue has no direct equivalent.
- Both frameworks provide genuine two-way binding. The mental model is nearly identical.

---

## Template Refs

### Vue 3

```vue
<script setup lang="ts">
import { ref, onMounted } from 'vue';

const inputEl = ref<HTMLInputElement | null>(null);

onMounted(() => {
  inputEl.value?.focus();
});
</script>

<template>
  <input ref="inputEl" />
</template>
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
- `ref="name"` becomes `bind:this={variable}`.
- No `onMounted` needed — `$effect` runs after DOM updates and detects when `inputEl` becomes defined.

---

## Lifecycle Hooks

| Vue 3 | Svelte 5 | Notes |
|-------|----------|-------|
| `onMounted()` | `$effect` / `onMount` | `$effect` covers most cases |
| `onUnmounted()` | `onDestroy` / `$effect` return | Return cleanup from `$effect` |
| `onBeforeMount()` | Top-level script code | Runs during component initialization |
| `onUpdated()` | `$effect` | Runs after reactive updates |
| `onBeforeUpdate()` | `$effect.pre` | Runs before DOM updates |
| `onErrorCaptured()` | `<svelte:boundary>` | Error boundary component |

---

## Provide/Inject to setContext/getContext

### Vue 3

```vue
<!-- Parent.vue -->
<script setup lang="ts">
import { provide, ref } from 'vue';

const theme = ref<'light' | 'dark'>('light');
provide('theme', theme);
</script>

<!-- Child.vue -->
<script setup lang="ts">
import { inject } from 'vue';
import type { Ref } from 'vue';

const theme = inject<Ref<'light' | 'dark'>>('theme')!;
</script>

<template>
  <p>Theme: {{ theme }}</p>
</template>
```

### Svelte 5

```svelte
<!-- Parent.svelte -->
<script lang="ts">
  import { setContext } from 'svelte';

  let currentTheme: 'light' | 'dark' = $state('light');

  setContext('theme', {
    get current() { return currentTheme; },
    toggle() { currentTheme = currentTheme === 'light' ? 'dark' : 'light'; }
  });
</script>
```

```svelte
<!-- Child.svelte -->
<script lang="ts">
  import { getContext } from 'svelte';

  interface ThemeContext {
    readonly current: 'light' | 'dark';
    toggle: () => void;
  }

  const theme: ThemeContext = getContext('theme');
</script>

<p>Theme: {theme.current}</p>
```

**Key differences:**
- `provide()` becomes `setContext()`; `inject()` becomes `getContext()`.
- Vue automatically makes provided refs reactive. In Svelte, use a getter to expose reactive state through context.
- Context keys can be strings or symbols in both frameworks.

---

## Global State: Pinia to .svelte.ts

### Vue 3 (Pinia)

```typescript
// stores/cart.ts
import { defineStore } from 'pinia';

export const useCartStore = defineStore('cart', () => {
  const items = ref<CartItem[]>([]);

  const total = computed(() =>
    items.value.reduce((sum, item) => sum + item.price, 0)
  );

  function addItem(item: CartItem): void {
    items.value.push(item);
  }

  function removeItem(id: string): void {
    items.value = items.value.filter(i => i.id !== id);
  }

  return { items, total, addItem, removeItem };
});
```

```vue
<!-- Cart.vue -->
<script setup lang="ts">
import { useCartStore } from '@/stores/cart';

const cart = useCartStore();
</script>

<template>
  <p>Total: ${{ cart.total.toFixed(2) }}</p>
</template>
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
```

**Key differences:**
- No store library needed. `.svelte.ts` files with `$state` replace Pinia entirely.
- No `defineStore`, no store plugins, no `storeToRefs()`.
- Class getters replace `computed()` — same caching behavior.
- Direct mutation works — `items.push(item)` triggers updates.
- Import the store directly — no `useStore()` composable needed.

---

## Routing: Nuxt to SvelteKit

| Nuxt 3 | SvelteKit | Notes |
|--------|-----------|-------|
| `pages/index.vue` | `src/routes/+page.svelte` | Home page |
| `pages/about.vue` | `src/routes/about/+page.svelte` | Static page |
| `pages/blog/[slug].vue` | `src/routes/blog/[slug]/+page.svelte` | Dynamic route |
| `layouts/default.vue` | `src/routes/+layout.svelte` | Root layout |
| `server/api/users.ts` | `src/routes/api/users/+server.ts` | API route |
| `useFetch()` / `useAsyncData()` | `+page.server.ts` load function | Data loading |
| `definePageMeta({ middleware })` | `hooks.server.ts` | Request middleware |
| `useState()` | `$state` in `.svelte.ts` | Shared state |
| `<NuxtLink>` | `<a>` (enhanced automatically) | SvelteKit enhances all `<a>` tags |
| `app.config.ts` | `+layout.server.ts` | App-level config/data |

**Key difference:** In Nuxt, data fetching happens inside components with `useFetch()`. In SvelteKit, data fetching is separated into `+page.server.ts` files. Data is available before the component renders — no loading states needed for initial data.

---

## Styling: Scoped Styles Comparison

### Vue 3

```vue
<style scoped>
.button {
  background: blue;
  color: white;
}

/* Deep selector to style child components */
:deep(.child-class) {
  color: red;
}
</style>
```

### Svelte 5

```svelte
<style>
  .button {
    background: var(--color-brand);
    color: oklch(100% 0 0);
  }

  /* Global selector to escape scoping */
  :global(.child-class) {
    color: oklch(60% 0.22 25);
  }
</style>
```

**Key differences:**
- Svelte styles are scoped by default — no `scoped` attribute needed.
- Vue's `:deep()` maps to Svelte's `:global()`.
- Both frameworks use the same mechanism: adding unique attributes to elements and selectors at compile time.
- The PE7 architecture uses CSS custom properties for all values, avoiding raw colors.

---

## Directives: Vue Directives to Svelte Actions

### Vue 3

```typescript
// directives/clickOutside.ts
const vClickOutside: Directive = {
  mounted(el, binding) {
    el._handler = (e: Event) => {
      if (!el.contains(e.target as Node)) binding.value();
    };
    document.addEventListener('click', el._handler);
  },
  unmounted(el) {
    document.removeEventListener('click', el._handler);
  }
};
```

```vue
<div v-click-outside="closeMenu">Menu content</div>
```

### Svelte 5

```typescript
// actions/clickOutside.ts
export function clickOutside(node: HTMLElement, callback: () => void) {
  function handler(e: MouseEvent): void {
    if (!node.contains(e.target as Node)) callback();
  }
  document.addEventListener('click', handler);

  return {
    destroy() {
      document.removeEventListener('click', handler);
    }
  };
}
```

```svelte
<div use:clickOutside={closeMenu}>Menu content</div>
```

**Key differences:**
- Vue directives use lifecycle-based hooks (`mounted`, `updated`, `unmounted`). Svelte actions use a simpler API: a function that returns `{ update?, destroy? }`.
- Vue uses `v-directive`; Svelte uses `use:action`.
- Svelte actions are simpler to write and reason about — they are just functions.

---

## Transitions and Animations

### Vue 3

```vue
<template>
  <Transition name="fade">
    <div v-if="show">Content</div>
  </Transition>
</template>

<style>
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>
```

### Svelte 5

```svelte
<script lang="ts">
  import { fade } from 'svelte/transition';

  let show: boolean = $state(true);
</script>

{#if show}
  <div transition:fade={{ duration: 300 }}>Content</div>
{/if}
```

**Key differences:**
- Svelte has built-in transition functions (`fade`, `fly`, `slide`, `scale`, `blur`, `draw`).
- No CSS classes to write — transitions are configured via JavaScript parameters.
- `transition:` applies to both enter and exit. Use `in:` and `out:` for separate animations.
- Custom transitions are functions that return CSS or tick-based animations.

---

## Common Gotchas

### 1. No .value
The biggest habit to break. `count` is the value, not `count.value`.

### 2. class not :class
Svelte uses `class="..."` and `class:name={condition}`, not `:class`.

### 3. onclick not @click
Event handlers are lowercase HTML attributes: `onclick`, `onsubmit`, `onkeydown`.

### 4. No v-show
Svelte has no `v-show` directive. Use `{#if}` for conditional rendering, or toggle a CSS class: `class:hidden={!visible}`.

### 5. No KeepAlive
Svelte has no `<KeepAlive>` equivalent. Since there is no virtual DOM, the concept does not apply in the same way. If you need to preserve component state, lift it to a parent or use a `.svelte.ts` store.

### 6. Template expressions use single curly braces
Vue: `{{ value }}`. Svelte: `{value}`. Double curlies will not work.

### 7. No defineExpose
Svelte components do not expose methods by default. Use callback props or shared state instead of calling methods on child components.

### 8. Snippet parameters vs scoped slots
If you are used to scoped slots passing data up to the parent, the equivalent is snippet parameters — but the syntax is different: `{#snippet name(param)}` in the parent, `{@render name(value)}` in the child.

---

## Your First 48 Hours

### Hour 0-2: Setup and orientation
- [ ] Run `pnpm create svelte@latest my-app` (TypeScript skeleton)
- [ ] Notice the `.svelte` file structure — it will feel familiar from `.vue` SFCs
- [ ] Build a counter with `$state` — notice no `.value` needed
- [ ] Apply scoped styles with PE7 tokens

### Hour 2-6: Core runes
- [ ] Build a todo list: `$state` for items, `$derived` for count, `$effect` for localStorage
- [ ] Notice how `$state` replaces both `ref()` and `reactive()`
- [ ] Notice how `$derived` replaces `computed()` without `.value`
- [ ] Notice how `$effect` replaces both `watch()` and `watchEffect()`

### Hour 6-12: Components
- [ ] Extract components with `$props()` (replaces `defineProps`)
- [ ] Pass callback props (replaces `defineEmits`)
- [ ] Use snippets (replaces slots)
- [ ] Use `bind:value` (replaces `v-model`)

### Hour 12-20: Routing and data
- [ ] Create routes in `src/routes/` (replaces `pages/` directory)
- [ ] Add `+page.server.ts` load functions (replaces `useFetch()`)
- [ ] Create layouts with `+layout.svelte`
- [ ] Add API routes with `+server.ts`

### Hour 20-30: State management
- [ ] Create a `.svelte.ts` store (replaces Pinia)
- [ ] Use `setContext`/`getContext` (replaces provide/inject)
- [ ] Build a form with `bind:value` and form actions

### Hour 30-48: Advanced patterns
- [ ] Create a Svelte action (replaces Vue directives)
- [ ] Use built-in transitions (`fade`, `fly`, `slide`)
- [ ] Deploy with a SvelteKit adapter
- [ ] Read the official Svelte tutorial at https://svelte.dev/tutorial

### Mental model checklist
- [ ] I no longer type `.value` after refs
- [ ] I use `$derived` instead of `computed()`
- [ ] I use `{value}` not `{{ value }}` in templates
- [ ] I use `onclick` not `@click`
- [ ] I use `class:active` not `:class="{ active }"`
- [ ] I use `bind:value` not `v-model`
- [ ] I use callback props not `$emit`
- [ ] I use snippets not slots

---

## Composables to Svelte Patterns

Vue composables (use-prefixed functions) are a popular pattern for reusable stateful logic. Svelte achieves the same with different tools.

### Vue 3 (Composable)

```typescript
// composables/useMousePosition.ts
import { ref, onMounted, onUnmounted } from 'vue';

export function useMousePosition() {
  const x = ref(0);
  const y = ref(0);

  function update(e: MouseEvent) {
    x.value = e.clientX;
    y.value = e.clientY;
  }

  onMounted(() => window.addEventListener('mousemove', update));
  onUnmounted(() => window.removeEventListener('mousemove', update));

  return { x, y };
}

// Usage in component
const { x, y } = useMousePosition();
```

### Svelte 5 (Class or function in .svelte.ts)

```typescript
// mouse.svelte.ts
class MousePosition {
  x: number = $state(0);
  y: number = $state(0);

  constructor() {
    $effect(() => {
      const update = (e: MouseEvent) => {
        this.x = e.clientX;
        this.y = e.clientY;
      };
      window.addEventListener('mousemove', update);
      return () => window.removeEventListener('mousemove', update);
    });
  }
}

export function useMousePosition(): MousePosition {
  return new MousePosition();
}
```

```svelte
<script lang="ts">
  import { useMousePosition } from '$lib/mouse.svelte';

  const mouse = useMousePosition();
</script>

<p>Mouse: {mouse.x}, {mouse.y}</p>
```

**Key differences:**
- Vue composables use `ref()` + lifecycle hooks. Svelte uses `$state` + `$effect`.
- Svelte's class-based approach provides natural encapsulation with getters for computed values.
- Both approaches achieve reusable, composable stateful logic.
- The `.svelte.ts` extension is required for runes (`$state`, `$effect`) outside `.svelte` files.

---

## Error Handling

### Vue 3

```vue
<script setup lang="ts">
import { onErrorCaptured, ref } from 'vue';

const error = ref<Error | null>(null);

onErrorCaptured((err: Error) => {
  error.value = err;
  return false; // prevent propagation
});
</script>

<template>
  <div v-if="error">Error: {{ error.message }}</div>
  <slot v-else />
</template>
```

### Svelte 5

```svelte
<svelte:boundary onerror={(err) => console.error(err)}>
  <RiskyComponent />

  {#snippet failed(error, reset)}
    <div>Error: {error.message}</div>
    <button onclick={reset}>Retry</button>
  {/snippet}
</svelte:boundary>
```

**Key differences:**
- Vue uses `onErrorCaptured` composition function. Svelte uses `<svelte:boundary>` template element.
- Svelte's boundary provides a built-in `reset` function for retry, which Vue does not have out of the box.
- Both catch errors in child components during rendering.

---

## Async Data (Suspense vs {#await})

### Vue 3

```vue
<template>
  <Suspense>
    <template #default>
      <AsyncComponent />
    </template>
    <template #fallback>
      <LoadingSpinner />
    </template>
  </Suspense>
</template>
```

### Svelte 5

```svelte
{#await dataPromise}
  <LoadingSpinner />
{:then result}
  <DataDisplay data={result} />
{:catch error}
  <ErrorMessage {error} />
{/await}
```

**Key differences:**
- Vue's `<Suspense>` catches async setup functions. Svelte's `{#await}` handles any Promise.
- Svelte's version includes built-in error handling via `{:catch}`.
- No component boundary needed — `{#await}` works inline in any template.

---

## Teleport to Root-Level Rendering

### Vue 3

```vue
<template>
  <Teleport to="body">
    <div class="modal">Modal content</div>
  </Teleport>
</template>
```

### Svelte 5

Svelte does not have a built-in `<Teleport>`. Common alternatives:

1. **Render in the root layout** — Control modal visibility via a store. The layout renders the modal at the document level.
2. **Svelte action** — Move an element to a different parent at mount time.

```svelte
<script lang="ts">
  function teleport(node: HTMLElement, target: string = 'body') {
    const container = document.querySelector(target);
    if (container) container.appendChild(node);
    return {
      destroy() { node.remove(); }
    };
  }
</script>

<div use:teleport={'body'} class="modal">
  Modal content
</div>
```

---

## Pattern Summary Table

| Vue 3 | Svelte 5 | Category |
|-------|----------|----------|
| `ref()` | `$state` | Primitive state |
| `reactive()` | `$state` (deep) | Object state |
| `computed()` | `$derived` | Derived values |
| `watch()` | `$effect` | Side effects |
| `watchEffect()` | `$effect` | Auto-tracked effects |
| `defineProps()` | `$props()` | Component props |
| `defineEmits()` | Callback props | Child-to-parent |
| `v-model` | `bind:value` | Two-way binding |
| `v-if` / `v-else` | `{#if}` / `{:else}` | Conditional |
| `v-for` | `{#each}` | List rendering |
| `v-on` / `@` | `on*` attributes | Events |
| `v-bind` / `:` | `attr={expr}` | Attribute binding |
| `v-show` | `class:hidden` | Visibility toggle |
| `<slot>` | `{@render children()}` | Content projection |
| `<slot name="x">` | `{#snippet x()}` | Named slots |
| Scoped slots | Snippet parameters | Render props |
| `ref="el"` | `bind:this={el}` | Template refs |
| `provide()` | `setContext()` | Provide data |
| `inject()` | `getContext()` | Consume data |
| Pinia | `.svelte.ts` class | Global state |
| `onMounted()` | `$effect` / `onMount` | Mount lifecycle |
| `onUnmounted()` | `$effect` return | Cleanup |
| `<Transition>` | `transition:fade` | Animations |
| `<Teleport>` | Action or layout-level | DOM teleport |
| `<Suspense>` | `{#await}` | Async loading |
| `<KeepAlive>` | Not needed | Component caching |
| Vue directive | Svelte action (`use:`) | DOM behavior |
| `.value` | Not needed | Value access |
| `{{ }}` | `{ }` | Interpolation |
| `@click` | `onclick` | Click handler |
| `:class` | `class:name` | Dynamic class |

---

## Further Reading

- [Official Svelte Tutorial](https://svelte.dev/tutorial) — interactive, excellent
- [SvelteKit Documentation](https://svelte.dev/docs/kit) — comprehensive reference
- [Svelte 5 Runes](https://svelte.dev/blog/runes) — the design philosophy
