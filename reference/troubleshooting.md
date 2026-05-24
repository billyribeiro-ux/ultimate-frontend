# Troubleshooting Encyclopedia

> 50+ common errors you will encounter while building with Svelte 5, SvelteKit 2, TypeScript, and the PE7 stack. Each entry tells you what went wrong, why, and exactly how to fix it.

---

## Svelte Compiler Errors

### Error: "Cannot use runes in non-runes mode"

**When you see it:** You added `$state()`, `$derived()`, or `$effect()` to a `.svelte` file or a `.ts` file that Svelte does not recognize as runes-enabled.
**What it means:** Svelte 5 introduced runes as a new reactivity system, but they are only available in files that opt in. A `.svelte` file opts in automatically when you use a rune, but plain `.ts` files must be named `.svelte.ts` to signal that they contain reactive Svelte code.
**The fix:**
```svelte
// Before (broken) — state.ts
export const count = $state(0);

// After (fixed) — state.svelte.ts
export const count = $state(0);
```
**Why it happens:** The Svelte compiler only processes runes in files it knows about. Regular `.ts` files are handled by TypeScript alone, which does not understand `$state`. Renaming to `.svelte.ts` tells the bundler to route the file through Svelte's transform pipeline first.
**Related lessons:** Lesson 2.2, Lesson 11.3

---

### Error: "{@const} must be the immediate child of {#if}, {:else if}, {:else}, {#each}, {:then}, {:catch}, or {#snippet}"

**When you see it:** You placed a `{@const}` declaration at the top level of your template or inside a plain HTML element.
**What it means:** `{@const}` is a compile-time local variable that only works inside block-level Svelte constructs. It cannot appear in arbitrary positions because the compiler needs a deterministic scope boundary to wire up the declaration.
**The fix:**
```svelte
<!-- Before (broken) -->
<div>
  {@const fullName = `${first} ${last}`}
  <p>{fullName}</p>
</div>

<!-- After (fixed) — wrap in a snippet or use $derived in <script> -->
<script lang="ts">
  let { first, last } = $props();
  let fullName = $derived(`${first} ${last}`);
</script>
<div>
  <p>{fullName}</p>
</div>
```
**Why it happens:** `{@const}` exists to create local bindings inside iteration and conditional blocks where you cannot reach back into the `<script>` tag. Outside those blocks, `$derived` is the correct tool because it sits in the reactive scope of the component instance.
**Related lessons:** Lesson 2.7, Lesson 4.3

---

### Error: "Unexpected end of input — `<script>` was left open"

**When you see it:** You forgot the closing `</script>` tag, or you accidentally nested another `<script>` tag inside the first one (perhaps via `{@html}`).
**What it means:** The Svelte parser reached the end of the file while still inside a `<script>` block. Unlike browsers, which are lenient about unclosed tags, the Svelte compiler requires every block to be explicitly closed.
**The fix:**
```svelte
<!-- Before (broken) -->
<script lang="ts">
  let count = $state(0);

<h1>{count}</h1>

<!-- After (fixed) -->
<script lang="ts">
  let count = $state(0);
</script>

<h1>{count}</h1>
```
**Why it happens:** Svelte parses the file in a single pass. When it encounters `<script>`, it collects everything until `</script>`. If that closing tag is missing, the entire rest of the file — including your HTML — is treated as JavaScript, which produces a cascade of confusing errors.
**Related lessons:** Lesson 1.3

---

### Error: "Snippet cannot be used as an attribute value directly"

**When you see it:** You tried to pass a `{#snippet}` block as an attribute on a component, like `<Card header={#snippet}>`.
**What it means:** Snippets are template-level constructs — they produce renderable content, not JavaScript values. You cannot assign them with `=` attribute syntax. Instead, you pass them as children or named slots using the snippet-as-child-content pattern.
**The fix:**
```svelte
<!-- Before (broken) -->
<Card header={#snippet headerContent}...{/snippet} />

<!-- After (fixed) -->
<Card>
  {#snippet header()}
    <h2>My Header</h2>
  {/snippet}
  <p>Body content</p>
</Card>
```
**Why it happens:** Snippets are compiled into render functions internally, but the attribute parser cannot embed block syntax. Svelte resolves this by treating snippet names as implicit props — the child component declares `let { header, children } = $props()` and calls `{@render header?.()}` where it wants that content placed.
**Related lessons:** Lesson 3.6, Lesson 3.7

---

### Error: "Each block should have a unique key"

**When you see it:** You used `{#each items as item}` without a key expression, and the list can be reordered, filtered, or mutated.
**What it means:** Without a key, Svelte uses index-based diffing. When items shift positions, Svelte reassigns data to existing DOM nodes instead of moving them. This causes visual glitches, broken animations, and stale event handlers.
**The fix:**
```svelte
<!-- Before (broken) -->
{#each todos as todo}
  <TodoItem {todo} />
{/each}

<!-- After (fixed) -->
{#each todos as todo (todo.id)}
  <TodoItem {todo} />
{/each}
```
**Why it happens:** Index-based diffing is fast but semantically wrong for dynamic lists. When you splice an item from position 2, every item after it gets re-associated with a different DOM node. Keys let Svelte track identity across mutations, so it moves existing DOM nodes rather than patching them with new data.
**Related lessons:** Lesson 4.4, Lesson 6.13

---

### Error: "$effect is running in an infinite loop — aborting"

**When you see it:** Your `$effect` reads a reactive value and also writes to it (or to a value that triggers a re-read), creating a cycle.
**What it means:** Svelte tracks which reactive values an `$effect` reads. When one of those values changes, the effect re-runs. If the effect itself causes the same value to change, it triggers itself again, creating an infinite loop. Svelte detects this and aborts after a safety threshold.
**The fix:**
```svelte
<script lang="ts">
  // Before (broken) — writes to what it reads
  let count = $state(0);
  $effect(() => {
    count = count + 1; // reads count, then writes count → loop
  });

  // After (fixed) — use $derived for transformations
  let count = $state(0);
  let doubled = $derived(count * 2);
</script>
```
**Why it happens:** The reactive graph in Svelte 5 is pull-based with eager scheduling. When an effect writes to a signal it depends on, the scheduler sees a dirty dependency and queues the effect again. After enough iterations without convergence, Svelte aborts. The solution is to separate reads from writes — use `$derived` for pure transformations and reserve `$effect` for side effects that do not feed back into their own dependencies.
**Related lessons:** Lesson 2.9, Lesson 2.11

---

### Error: "$derived expression must not have side effects"

**When you see it:** You tried to perform a mutation, DOM manipulation, or API call inside a `$derived()` or `$derived.by()` block.
**What it means:** `$derived` is meant to be a pure computation — it takes reactive inputs and produces a value. Side effects (like writing to other state, fetching data, or logging) violate this contract and can cause unpredictable behavior because `$derived` may re-evaluate at any time and in any order.
**The fix:**
```svelte
<script lang="ts">
  // Before (broken)
  let items = $state([1, 2, 3]);
  let total = $derived.by(() => {
    console.log('recalculating'); // side effect!
    document.title = `${items.length} items`; // side effect!
    return items.reduce((a, b) => a + b, 0);
  });

  // After (fixed) — pure derived, effect for side effects
  let items = $state([1, 2, 3]);
  let total = $derived(items.reduce((a, b) => a + b, 0));
  $effect(() => {
    document.title = `${items.length} items`;
  });
</script>
```
**Why it happens:** Svelte's reactive system can memoize, batch, and skip `$derived` evaluations. If a derived value has side effects, those effects might run zero times, once, or multiple times depending on when the runtime decides to re-evaluate. Keeping derived values pure makes the reactive graph deterministic.
**Related lessons:** Lesson 2.7, Lesson 2.8

---

### Error: "Type 'string' is not assignable to bind:value of type 'number'"

**When you see it:** You used `bind:value` on an `<input type="number">` with a `$state<number>` variable, but somewhere the types diverge.
**What it means:** Svelte's two-way binding expects the bound variable and the element's value to have compatible types. HTML inputs always produce strings, but Svelte's `<input type="number">` binding automatically coerces to number. The error appears when your state type and the element type do not match.
**The fix:**
```svelte
<script lang="ts">
  // Before (broken) — binding a string state to a number input
  let price = $state('0');
</script>
<input type="number" bind:value={price} />

<script lang="ts">
  // After (fixed) — state type matches input type
  let price = $state(0);
</script>
<input type="number" bind:value={price} />
```
**Why it happens:** Svelte generates code that writes the input's value back to your variable. If your variable is typed as `string` but the input coerces to `number`, TypeScript catches the mismatch at compile time. This is a feature — it prevents runtime bugs where you accidentally do math on strings.
**Related lessons:** Lesson 2.2, Lesson 3.5

---

### Error: "Component has unused prop 'variant' — if this is expected, declare it with $props()"

**When you see it:** You pass a prop to a child component, but the child's `<script>` does not destructure that prop from `$props()`.
**What it means:** Svelte warns when a parent passes data that the child never uses. This usually means either the parent is passing something unnecessary, or the child forgot to declare the prop. Either way, the data is silently discarded.
**The fix:**
```svelte
<!-- Child — Before (broken) -->
<script lang="ts">
  let { label } = $props();  // 'variant' is not destructured
</script>

<!-- Child — After (fixed) -->
<script lang="ts">
  let { label, variant = 'primary' } = $props();
</script>
```
**Why it happens:** Svelte 5's `$props()` destructuring pattern explicitly declares the component's public API. Any prop not listed in the destructuring is treated as unknown. If you genuinely need to accept arbitrary props (for example, for spreading onto a DOM element), use the rest pattern: `let { label, ...rest } = $props()`.
**Related lessons:** Lesson 3.2, Lesson 3.4

---

### Error: "Unused CSS selector '.card-header'"

**When you see it:** You defined a CSS rule in your component's `<style>` block, but no element in that component's template matches the selector.
**What it means:** Svelte scopes CSS to the component and tree-shakes unused rules at compile time. If the compiler cannot find a matching element, it warns you that the rule will be stripped from the output.
**The fix:**
```svelte
<!-- Before (broken) — class is on a child component's internal element -->
<style>
  .card-header { color: red; } /* no .card-header in THIS template */
</style>
<Card />

<!-- After (fixed) — use :global() to reach into children -->
<style>
  :global(.card-header) { color: red; }
</style>
<Card />
```
**Why it happens:** Svelte adds a unique hash attribute to each component's elements and rewrites CSS selectors to include that hash. A selector that does not match any local element will never match anything after scoping, so Svelte warns you. If you need to style elements inside child components, use `:global()` deliberately.
**Related lessons:** Lesson 1.7, Lesson 6.1

---

### Error: "A11y: <img> element should have an alt attribute"

**When you see it:** You used an `<img>` tag without providing an `alt` attribute. Svelte's built-in accessibility checks flag this during compilation.
**What it means:** Screen readers and search engine crawlers rely on `alt` text to understand images. A missing `alt` attribute makes your page inaccessible to visually impaired users and can hurt SEO. Svelte enforces this by default because accessibility should not be an afterthought.
**The fix:**
```svelte
<!-- Before (broken) -->
<img src="/hero.jpg" />

<!-- After (fixed) — descriptive alt for content images -->
<img src="/hero.jpg" alt="Team members collaborating at a whiteboard" />

<!-- Or for decorative images — empty alt -->
<img src="/divider.svg" alt="" />
```
**Why it happens:** The Svelte compiler includes a set of a11y linting rules inspired by eslint-plugin-jsx-a11y. These run at compile time, not as a separate lint step, so you catch issues immediately. The `alt` warning is the most common one, but Svelte also checks for missing labels, invalid ARIA attributes, and more.
**Related lessons:** Lesson 12.8, Lesson 5.10

---

### Error: "$state variable 'data' shadows an existing declaration"

**When you see it:** You declared a `$state` variable with the same name as a parameter, import, or outer-scope variable.
**What it means:** Variable shadowing creates ambiguity — when you reference `data`, which `data` do you mean? Svelte warns about this specifically for reactive state because shadowed reactive variables can cause subtle bugs where you think you are updating reactive state but you are actually mutating a non-reactive copy.
**The fix:**
```svelte
<script lang="ts">
  // Before (broken) — 'data' shadows the prop
  let { data } = $props();  // PageData from SvelteKit
  let data = $state([]);     // Compiler error: shadows 'data'

  // After (fixed) — distinct names
  let { data: pageData } = $props();
  let localItems = $state([]);
</script>
```
**Why it happens:** Svelte's reactivity system compiles `$state` into getter/setter pairs. If a `$state` variable shadows another binding, the compiled output can reference the wrong binding in closures, leading to reactivity that silently fails. The compiler catches this to prevent hard-to-debug issues.
**Related lessons:** Lesson 2.2, Lesson 9A.3

---

### Error: "$props() destructuring must use an object pattern"

**When you see it:** You tried to assign `$props()` to a single variable instead of destructuring it, or you used array destructuring.
**What it means:** `$props()` always returns an object. Svelte requires you to destructure it with `{ }` syntax so that it can track which props your component uses. This is how Svelte generates type-safe prop declarations and warns about unused props.
**The fix:**
```svelte
<script lang="ts">
  // Before (broken) — assigning to a single variable
  let props = $props();

  // After (fixed) — object destructuring
  let { title, description, variant = 'primary' } = $props();

  // If you need all props as an object, use rest:
  let { title, ...rest } = $props();
</script>
```
**Why it happens:** The compiler statically analyzes the destructuring pattern to determine the component's prop interface. Without destructuring, it cannot infer which props the component accepts, which breaks type generation, unused-prop warnings, and the developer experience in editors. The rest pattern (`...rest`) is allowed because the named props are still explicitly listed.
**Related lessons:** Lesson 3.2, Lesson 3.3

---

### Error: "{@html} can lead to XSS — ensure content is sanitized"

**When you see it:** You used `{@html someVariable}` in your template. This is a warning, not a hard error, but it appears in some linting configurations and Svelte's documentation prominently.
**What it means:** `{@html}` renders raw HTML strings directly into the DOM without any escaping. If `someVariable` contains user-supplied content, an attacker can inject `<script>` tags or event handlers to steal cookies, redirect users, or worse.
**The fix:**
```svelte
<script lang="ts">
  import DOMPurify from 'dompurify';

  let { rawHtml } = $props();

  // Before (broken) — unsanitized
  // {@html rawHtml}

  // After (fixed) — sanitized
  let safeHtml = $derived(DOMPurify.sanitize(rawHtml));
</script>

{@html safeHtml}
```
**Why it happens:** Svelte's normal `{expression}` syntax automatically escapes HTML entities, making XSS impossible. `{@html}` bypasses that protection intentionally — it exists for rendering trusted HTML like markdown output from a CMS. The warning reminds you that you are opting out of Svelte's built-in XSS protection and must sanitize manually.
**Related lessons:** Lesson 4.1, Lesson 15.1

---

### Error: "Transition on element that is no longer in the DOM"

**When you see it:** You applied a Svelte `transition:` directive to an element that was removed from the DOM before the transition could complete, often due to rapid state changes or navigation.
**What it means:** Svelte transitions animate elements as they enter or leave the DOM. If the component is destroyed (e.g., by navigating away) while a transition is still running, Svelte cannot complete the animation because the element no longer exists. This can cause visual artifacts or JavaScript errors.
**The fix:**
```svelte
<script lang="ts">
  import { fade } from 'svelte/transition';
  let visible = $state(true);
</script>

<!-- Before (broken) — long transition on a component that might unmount -->
<div transition:fade={{ duration: 2000 }}>...</div>

<!-- After (fixed) — use local transitions to cancel on unmount -->
<div transition:fade|local={{ duration: 300 }}>...</div>
```
**Why it happens:** By default, Svelte transitions are "global" — they play even when a parent component is being destroyed. The `|local` modifier tells Svelte to only play the transition when the element's own `{#if}` or `{#each}` block changes, not when an ancestor unmounts. For SvelteKit page transitions, keep durations short and use `|local` to avoid conflicts with navigation.
**Related lessons:** Lesson 6.11, Lesson 8.11

---

## SvelteKit Runtime Errors

### Error: "Hydration mismatch — server rendered HTML differs from client"

**When you see it:** The page loads with SSR, but when SvelteKit hydrates it on the client, the DOM does not match what the server rendered. This often happens with dates, random values, or browser-only APIs.
**What it means:** SvelteKit renders your component on the server first, sends HTML to the browser, then "hydrates" it by attaching event listeners and reactivity. If the component produces different output on the server vs. the client, the DOM and the virtual representation diverge, which can cause broken interactivity.
**The fix:**
```svelte
<script lang="ts">
  import { browser } from '$app/environment';

  // Before (broken) — different value on server and client
  let now = $state(new Date().toLocaleTimeString());

  // After (fixed) — initialize after hydration
  let now = $state('');
  $effect(() => {
    now = new Date().toLocaleTimeString();
  });
</script>
```
**Why it happens:** The server runs at one point in time and the client runs moments later. `new Date()` produces different values on each. Similarly, `window.innerWidth`, `Math.random()`, and `localStorage` do not exist on the server. The fix is to defer browser-only values to `$effect`, which only runs on the client after hydration.
**Related lessons:** Lesson 8.2, Lesson 8.3

---

### Error: "404 Not Found" on client-side navigation

**When you see it:** A page works when you navigate to it directly (full page load) but returns 404 when using SvelteKit's client-side router (clicking an `<a>` tag or calling `goto()`).
**What it means:** SvelteKit's client-side router looks for a matching `+page.svelte` file in the routes directory. If your file is named incorrectly, placed in the wrong directory, or uses a parameter that does not match, the router cannot find it.
**The fix:**
```
# Before (broken) — wrong directory structure
src/routes/blog-post/[slug]/+page.svelte

# After (fixed) — correct naming convention
src/routes/blog/[slug]/+page.svelte
```
```svelte
<!-- Also check: are you using correct links? -->
<!-- Before (broken) — external URL pattern -->
<a href="https://mysite.com/blog/hello">Read</a>

<!-- After (fixed) — relative path for internal navigation -->
<a href="/blog/hello">Read</a>
```
**Why it happens:** SvelteKit generates a manifest of all routes at build time. Client-side navigation uses this manifest to match URLs to components without a server round-trip. If the route is not in the manifest (wrong filename, missing file), the client router falls through to a 404. Direct navigation works because the server can sometimes handle it differently via hooks or redirects.
**Related lessons:** Lesson 8.4, Lesson 8.6

---

### Error: "load function must return a value"

**When you see it:** Your `+page.ts` or `+page.server.ts` load function does not explicitly return an object, or returns `undefined` in some code path.
**What it means:** SvelteKit expects every `load` function to return a plain object that becomes `data` in the page component. If the function returns `undefined` (which happens when you forget a `return` statement or have an early `return` without a value), SvelteKit cannot provide data to the page.
**The fix:**
```typescript
// Before (broken) — missing return in else branch
export const load = async ({ params }) => {
  if (params.slug === 'about') {
    return { title: 'About' };
  }
  // implicitly returns undefined
};

// After (fixed) — always return an object
export const load = async ({ params }) => {
  if (params.slug === 'about') {
    return { title: 'About' };
  }
  return { title: 'Default Page' };
};
```
**Why it happens:** TypeScript can catch this if your `load` function's return type is properly annotated, but when using implicit return types, an early exit without a value slips through. SvelteKit serializes the return value and sends it to the client — it cannot serialize `undefined`.
**Related lessons:** Lesson 9A.1, Lesson 9A.2

---

### Error: "redirect() can only be used during request handling"

**When you see it:** You called `redirect()` from `$app/navigation` or `@sveltejs/kit` inside a component's `<script>` block, an `$effect`, or an event handler instead of inside a `load` function, form action, or hook.
**What it means:** `redirect()` is a server-side control flow mechanism that throws a special object to short-circuit request handling. It is not a general-purpose navigation function — it only works in contexts where SvelteKit is processing a request (load functions, form actions, hooks).
**The fix:**
```svelte
<script lang="ts">
  import { goto } from '$app/navigation';
  // import { redirect } from '@sveltejs/kit'; // wrong context!

  // Before (broken) — using redirect in a component
  // redirect(303, '/login');

  // After (fixed) — use goto() for client-side navigation
  function handleClick() {
    goto('/login');
  }
</script>
```
```typescript
// redirect() is correct HERE — in a load function
import { redirect } from '@sveltejs/kit';
export const load = async ({ locals }) => {
  if (!locals.user) {
    redirect(303, '/login');
  }
  return { user: locals.user };
};
```
**Why it happens:** `redirect()` works by throwing a `Redirect` object that SvelteKit's request handler catches. Outside of that handler (in client-side component code), nothing catches the thrown object, so it becomes an unhandled error. Use `goto()` for client-side navigation and `redirect()` for server-side request handling.
**Related lessons:** Lesson 9A.8, Lesson 8.8

---

### Error: "error() was called with status 200 — use a 4xx or 5xx status"

**When you see it:** You called `error(200, 'Something')` thinking it would display a message to the user.
**What it means:** The `error()` helper from `@sveltejs/kit` creates an HTTP error response. A 200 status code means "success," which contradicts the purpose of an error. SvelteKit requires you to use proper error status codes (400-599) so that browsers, search engines, and monitoring tools can correctly identify failures.
**The fix:**
```typescript
// Before (broken) — wrong status code
import { error } from '@sveltejs/kit';
error(200, 'Item not found');

// After (fixed) — correct error status
import { error } from '@sveltejs/kit';
error(404, 'Item not found');
```
**Why it happens:** HTTP status codes have semantic meaning. Search engines treat 200 as a valid page and may index your error message. Monitoring tools ignore 200s. Browsers cache 200 responses differently than errors. Using the correct status code ensures the entire web ecosystem handles your response appropriately.
**Related lessons:** Lesson 9A.8, Lesson 10.1

---

### Error: "Can't find +page.svelte for route /dashboard"

**When you see it:** You created a `+page.server.ts` or `+page.ts` file but forgot to create the corresponding `+page.svelte` template.
**What it means:** SvelteKit requires a `+page.svelte` file for every route that renders a page. The load function provides data, but without a template, SvelteKit does not know what to render. This is different from API routes, which only need `+server.ts`.
**The fix:**
```
# Before (broken) — only the data loader exists
src/routes/dashboard/+page.server.ts

# After (fixed) — add the page component
src/routes/dashboard/+page.server.ts
src/routes/dashboard/+page.svelte    ← add this
```
**Why it happens:** SvelteKit treats `+page.svelte` as the authoritative signal that a route is a "page" (as opposed to an API endpoint or layout). The load functions are optional — they provide data to the page. But the page itself must exist. If you only want a data endpoint without a UI, use `+server.ts` instead.
**Related lessons:** Lesson 8.4, Lesson 9A.1

---

### Error: "Cannot use $app/state on the server — use $app/stores instead (or check $app/environment)"

**When you see it:** You imported from `$app/state` and accessed `page.url` or similar in a server-side context (`+page.server.ts`, `hooks.server.ts`, or during SSR at the top level of a component).
**What it means:** `$app/state` provides reactive state objects that depend on the browser's runtime. During SSR, these objects do not exist because there is no browser. Server-side code should use the `event` parameter in load functions or hooks, not the client-side state modules.
**The fix:**
```typescript
// Before (broken) — in +page.server.ts
import { page } from '$app/state';
const slug = page.params.slug; // Error: cannot use on server

// After (fixed) — use the event parameter
export const load = async ({ params }) => {
  const slug = params.slug;
  return { slug };
};
```
**Why it happens:** `$app/state` uses Svelte 5 runes internally, which are a client-side reactivity mechanism. On the server, there is no reactive context. SvelteKit provides the same information through the `event` object in load functions and hooks, which works in both environments.
**Related lessons:** Lesson 8.7, Lesson 9A.2

---

### Error: "fetch in load must use the provided fetch, not global fetch"

**When you see it:** You called `fetch('/api/data')` directly in a load function instead of using the `fetch` parameter that SvelteKit provides.
**What it means:** SvelteKit provides a special `fetch` to load functions that handles cookie forwarding, relative URLs, and server-side request deduplication. Using the global `fetch` bypasses these features, which can cause authentication failures (no cookies), incorrect URLs (relative paths do not work on the server), and redundant network requests.
**The fix:**
```typescript
// Before (broken) — using global fetch
export const load = async () => {
  const res = await fetch('/api/products'); // global fetch
  return { products: await res.json() };
};

// After (fixed) — using SvelteKit's fetch
export const load = async ({ fetch }) => {
  const res = await fetch('/api/products'); // SvelteKit fetch
  return { products: await res.json() };
};
```
**Why it happens:** On the server, `fetch('/api/products')` would try to call `http://localhost:undefined/api/products` because there is no browser origin. SvelteKit's fetch knows the server's address and can make internal calls without a network round-trip. It also forwards the user's cookies from the incoming request, maintaining authentication context.
**Related lessons:** Lesson 9A.4, Lesson 10.1

---

### Error: "Set-Cookie header was ignored — check SameSite and Secure flags"

**When you see it:** You set a cookie in a `+server.ts` or `hooks.server.ts` file, but the browser does not store it. You see a warning in DevTools about the cookie being blocked.
**What it means:** Modern browsers enforce strict cookie policies. If your cookie lacks proper `SameSite`, `Secure`, and `Path` attributes, the browser silently ignores it. This is especially common in development when using HTTP instead of HTTPS.
**The fix:**
```typescript
// Before (broken) — missing attributes
cookies.set('session', token, { path: '/' });

// After (fixed) — all required attributes
cookies.set('session', token, {
  path: '/',
  httpOnly: true,
  sameSite: 'lax',
  secure: !dev,  // true in production, false in dev
  maxAge: 60 * 60 * 24 * 7 // 7 days
});
```
**Why it happens:** Since Chrome 80, cookies default to `SameSite=Lax`. Without explicitly setting `SameSite`, cookies sent in cross-origin contexts are blocked. The `Secure` flag requires HTTPS, which is not available in local dev — so you conditionally set it. SvelteKit's `cookies.set()` API mirrors the `Set-Cookie` header spec.
**Related lessons:** Lesson 15.1, Lesson 10.7

---

### Error: "No action found for POST request to /checkout"

**When you see it:** You submitted a form to a route that has a `+page.server.ts` file but that file does not export an `actions` object.
**What it means:** SvelteKit form actions require you to export an `actions` object from `+page.server.ts`. If the file only exports `load`, SvelteKit does not know how to handle POST requests. The form submission has nowhere to go.
**The fix:**
```typescript
// Before (broken) — +page.server.ts without actions
export const load = async () => {
  return { products: [] };
};

// After (fixed) — add actions export
import type { Actions } from './$types';

export const load = async () => {
  return { products: [] };
};

export const actions: Actions = {
  default: async ({ request }) => {
    const data = await request.formData();
    // process form...
    return { success: true };
  }
};
```
**Why it happens:** SvelteKit routes form POSTs to the `actions` export, not to the `load` function. The `load` function only handles GET requests. If `actions` is missing, there is no handler for POST, and SvelteKit returns a 404 for the action. Named actions (using `?/actionName` in the form's action attribute) also require the matching key in the `actions` object.
**Related lessons:** Lesson 10.3, Lesson 10.4

---

### Error: "Cannot prerender route /dashboard — it accesses request data"

**When you see it:** You set `export const prerender = true` on a page whose load function accesses `cookies`, `request`, `url.searchParams`, or other request-specific data.
**What it means:** Prerendering generates static HTML at build time. At build time, there is no user request — no cookies, no query parameters, no authentication headers. If your load function depends on request data, it cannot be prerendered because the output would be different for every user.
**The fix:**
```typescript
// Before (broken) — prerender with dynamic data
export const prerender = true;
export const load = async ({ cookies }) => {
  const user = cookies.get('session');
  return { user }; // Error: cannot prerender
};

// After (fixed) — choose one:
// Option 1: Remove prerender
export const prerender = false;
export const load = async ({ cookies }) => {
  const user = cookies.get('session');
  return { user };
};

// Option 2: Remove dynamic data for truly static pages
export const prerender = true;
export const load = async () => {
  return { title: 'About Us' };
};
```
**Why it happens:** SvelteKit's prerenderer crawls your app at build time, calling each load function once. If the function reads cookies or headers, the prerendered HTML would embed the build machine's state (no cookies, no user). SvelteKit prevents this to avoid shipping incorrect static HTML that leaks information or breaks for real users.
**Related lessons:** Lesson 9A.10, Lesson 8.12

---

### Error: "hooks.server.ts is not being executed"

**When you see it:** You created a `hooks.server.ts` file but your `handle` function never runs. Requests bypass it entirely.
**What it means:** The file must be at `src/hooks.server.ts` — not inside a route directory, not inside `lib`, and not named `hook.server.ts` (singular). SvelteKit looks for this file at a specific path, and if it is misplaced or misnamed, it is silently ignored.
**The fix:**
```
# Before (broken) — wrong location
src/routes/hooks.server.ts
src/lib/hooks.server.ts
src/hook.server.ts

# After (fixed) — correct location
src/hooks.server.ts
```
```typescript
// src/hooks.server.ts
import type { Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
  console.log(`Request: ${event.url.pathname}`);
  return resolve(event);
};
```
**Why it happens:** SvelteKit's convention-based architecture relies on exact file names and locations. Unlike routes, which are auto-discovered by directory structure, hooks are loaded from a single well-known path. There is no error when the file is missing because hooks are optional — SvelteKit simply uses default behavior. This means a misplaced hooks file fails silently.
**Related lessons:** Lesson 8.9, Lesson 15.1

---

## TypeScript Errors

### Error: "Type 'any' is not assignable to parameter of type 'never' (strict mode)"

**When you see it:** You have `strict: true` in your `tsconfig.json` and a variable's type could not be inferred, falling back to `any`. In strict mode, `any` is not silently accepted.
**What it means:** TypeScript strict mode enables `noImplicitAny`, which means every variable must have an explicit or inferable type. When TypeScript cannot figure out what type a variable is, it would normally use `any` as a fallback — but strict mode forbids this, forcing you to be explicit.
**The fix:**
```typescript
// Before (broken) — untyped parameter
function processItems(items) { // items is implicitly 'any'
  return items.map(item => item.name);
}

// After (fixed) — explicit type
interface Item {
  name: string;
  price: number;
}
function processItems(items: Item[]): string[] {
  return items.map(item => item.name);
}
```
**Why it happens:** Strict mode is a compile-time safety net. Without it, TypeScript lets `any` propagate silently, which defeats the purpose of type checking. The Ultimate Frontend course uses strict mode throughout because it catches bugs at compile time that would otherwise surface as runtime errors in production.
**Related lessons:** Lesson 1.2, Lesson 1.4

---

### Error: "Property 'title' does not exist on type 'PageData'"

**When you see it:** You access `data.title` in your `+page.svelte` but your load function does not return a `title` property, or the auto-generated types are out of date.
**What it means:** SvelteKit auto-generates `PageData` types based on what your load functions return. If you access a property that is not in the return type, TypeScript flags it. This is one of SvelteKit's best features — end-to-end type safety from server to client.
**The fix:**
```typescript
// +page.server.ts — make sure the load function returns 'title'
export const load = async () => {
  return {
    title: 'Dashboard',  // ← this creates the type
    items: []
  };
};
```
```svelte
<!-- +page.svelte -->
<script lang="ts">
  let { data } = $props();
  // data.title is now typed as string ✓
</script>
<h1>{data.title}</h1>
```
**Why it happens:** SvelteKit generates `$types.d.ts` files inside `.svelte-kit/types` based on your load function's return type. If the dev server is not running, these files may be stale. Run `pnpm dev` or `pnpm check` to regenerate them. Also check that your load function actually returns the property in all code paths.
**Related lessons:** Lesson 9A.3, Lesson 10.2

---

### Error: "Property 'user' does not exist on type 'App.Locals'"

**When you see it:** You access `event.locals.user` in a load function or hook, but `App.Locals` has not been extended to include `user`.
**What it means:** SvelteKit uses TypeScript's declaration merging to let you add custom properties to `event.locals`. By default, `App.Locals` is an empty interface. You must explicitly declare what properties you are adding.
**The fix:**
```typescript
// src/app.d.ts
declare global {
  namespace App {
    interface Locals {
      user: {
        id: string;
        email: string;
      } | null;
    }
  }
}
export {};
```
```typescript
// src/hooks.server.ts
export const handle: Handle = async ({ event, resolve }) => {
  const session = event.cookies.get('session');
  event.locals.user = session ? await getUser(session) : null;
  return resolve(event);
};
```
**Why it happens:** SvelteKit uses `app.d.ts` as the single source of truth for your app's type extensions. Without declaring `user` in `App.Locals`, TypeScript does not know the property exists, even though your hook sets it at runtime. This pattern ensures type safety across the entire request lifecycle.
**Related lessons:** Lesson 8.9, Lesson 15.1

---

### Error: "Type 'Snippet<[string]>' is not assignable to type 'Snippet<[number]>'"

**When you see it:** You pass a snippet to a component that expects different type parameters, or your snippet's parameter types do not match the component's declaration.
**What it means:** Svelte 5 snippets are strongly typed. A `Snippet<[string]>` takes one string parameter when rendered. If the component expects `Snippet<[number]>`, the types are incompatible.
**The fix:**
```svelte
<!-- Parent — Before (broken) -->
<DataTable>
  {#snippet cell(value: string)}  <!-- string, but DataTable expects number -->
    <td>{value}</td>
  {/snippet}
</DataTable>

<!-- Parent — After (fixed) — match the expected type -->
<DataTable>
  {#snippet cell(value: number)}
    <td>{value.toFixed(2)}</td>
  {/snippet}
</DataTable>
```
```svelte
<!-- DataTable.svelte -->
<script lang="ts">
  import type { Snippet } from 'svelte';
  let { cell }: { cell: Snippet<[number]> } = $props();
</script>
```
**Why it happens:** Snippets compile into typed functions. The generic parameter `Snippet<[T]>` defines the argument tuple the snippet receives when called with `{@render cell(42)}`. TypeScript enforces that the argument types match between the call site and the definition, preventing runtime type mismatches.
**Related lessons:** Lesson 3.6, Lesson 3.7

---

### Error: "Generic type inference failure on component — explicit type argument required"

**When you see it:** You built a generic component using TypeScript generics, but the compiler cannot infer the generic type from the props you passed.
**What it means:** Svelte 5 supports generic components via the `generics` attribute on `<script>`. However, TypeScript's inference has limits — if the generic type is not directly used in a prop value, the compiler cannot infer it and requires an explicit annotation.
**The fix:**
```svelte
<!-- GenericList.svelte -->
<script lang="ts" generics="T">
  import type { Snippet } from 'svelte';
  let { items, renderItem }: {
    items: T[];
    renderItem: Snippet<[T]>;
  } = $props();
</script>

{#each items as item}
  {@render renderItem(item)}
{/each}
```
```svelte
<!-- Usage — After (fixed) — TypeScript infers T from items -->
<GenericList items={users}>
  {#snippet renderItem(user)}
    <p>{user.name}</p>  <!-- user is inferred as User -->
  {/snippet}
</GenericList>
```
**Why it happens:** TypeScript infers generics from the call site. For Svelte components, the "call site" is the template usage. If `items` is typed as `User[]`, TypeScript can infer `T = User`. But if you pass items through an intermediate variable without explicit typing, inference fails. The solution is to ensure at least one prop clearly carries the generic type.
**Related lessons:** Lesson 3.3, Lesson 18.8

---

### Error: "Type 'ColumnDef<User>[]' has type parameter incompatibility with TanStack Table"

**When you see it:** You define TanStack Table column definitions but the generic parameter does not match your data type, or you mix up `ColumnDef`, `AccessorColumnDef`, and `DisplayColumnDef`.
**What it means:** TanStack Table v9 has a precise generic system. `ColumnDef<TData, TValue>` must match the data type you pass to `useTable()`. If `TData` is `User` in your column defs but `Product` in your table options, TypeScript catches the mismatch.
**The fix:**
```typescript
// Before (broken) — wrong generic
import type { ColumnDef } from '@tanstack/table-core';
const columns: ColumnDef<Product>[] = [
  { accessorKey: 'name', header: 'Name' }
];
// But table uses User[]...

// After (fixed) — consistent generic
import type { ColumnDef } from '@tanstack/table-core';

interface User {
  id: string;
  name: string;
  email: string;
}

const columns: ColumnDef<User>[] = [
  { accessorKey: 'name', header: 'Name' },
  { accessorKey: 'email', header: 'Email' }
];

const table = createSvelteTable({
  data: users,       // User[]
  columns,           // ColumnDef<User>[]
  getCoreRowModel: getCoreRowModel()
});
```
**Why it happens:** TanStack Table uses generics to create a type-safe pipeline from raw data to rendered cells. If the generic parameters diverge at any point, TypeScript catches it because the accessor functions, cell renderers, and sort comparators all depend on the same `TData` type. This prevents runtime errors where you try to access `row.email` on a `Product` object that has no `email` field.
**Related lessons:** Lesson 11.7, Lesson 11.9

---

### Error: "Type 'Updater<T>' is not assignable — expected (value: T) => T"

**When you see it:** You try to update TanStack Table state (sorting, pagination, filtering) but pass a direct value instead of an updater function.
**What it means:** TanStack Table uses the `Updater<T>` pattern where state setters accept either a direct value or a function `(prev: T) => T`. When TypeScript expects the function form and you pass a raw value (or vice versa), the types clash.
**The fix:**
```typescript
// Before (broken) — passing value directly
let sorting = $state<SortingState>([]);

onSortingChange: (newSorting) => {
  sorting = newSorting; // Error: newSorting is Updater<SortingState>
}

// After (fixed) — handle both forms
onSortingChange: (updater) => {
  sorting = typeof updater === 'function'
    ? updater(sorting)
    : updater;
}
```
**Why it happens:** The `Updater<T>` pattern allows TanStack Table to batch state changes and avoid stale closures. The updater might be a function that reads the previous state, or it might be a direct replacement value. Your handler must check which form was passed and act accordingly. This pattern is common in React's `setState` and has been adopted by TanStack for framework-agnostic consistency.
**Related lessons:** Lesson 11.8, Lesson 11.9

---

### Error: "Type 'string' is not assignable to type 'Brand<string, 'UserId'>'"

**When you see it:** You used branded types (nominal typing) and tried to assign a plain string to a branded type variable.
**What it means:** Branded types add a phantom type tag to primitive types to prevent accidental mixing. A `UserId` and an `OrderId` are both strings, but they represent different concepts. The brand prevents you from passing an `OrderId` where a `UserId` is expected.
**The fix:**
```typescript
// Type definitions
type Brand<T, B> = T & { __brand: B };
type UserId = Brand<string, 'UserId'>;
type OrderId = Brand<string, 'OrderId'>;

// Before (broken) — raw string
const userId: UserId = 'abc123'; // Error

// After (fixed) — create with constructor function
function createUserId(id: string): UserId {
  return id as UserId;
}
const userId = createUserId('abc123'); // OK
```
**Why it happens:** TypeScript uses structural typing — two types are compatible if they have the same shape. Since `UserId` and `OrderId` are both `string`, they would be interchangeable without branding. The `__brand` property creates a structural difference that TypeScript can check, even though the property does not exist at runtime. This is a zero-cost abstraction.
**Related lessons:** Lesson 18.8, Lesson 1.8

---

## Build and Deploy Errors

### Error: "Vite pre-bundling — stuck in loop, restarting"

**When you see it:** The dev server keeps restarting because Vite discovers new dependencies during pre-bundling and restarts the process, creating an infinite loop.
**What it means:** Vite pre-bundles dependencies (converting CJS to ESM) on first run. If a dependency dynamically imports another dependency that was not in the initial scan, Vite adds it and restarts. Some libraries with complex dependency trees cause this loop.
**The fix:**
```typescript
// vite.config.ts
export default defineConfig({
  optimizeDeps: {
    include: [
      'problematic-library',
      'problematic-library/submodule'
    ]
  }
});
```
**Why it happens:** Vite scans your source code for import statements to build a dependency list for pre-bundling. Dynamic imports, conditional imports, and re-exports that Vite cannot statically analyze cause dependencies to be discovered at runtime. Adding them to `optimizeDeps.include` tells Vite to pre-bundle them upfront, breaking the loop.
**Related lessons:** Lesson 21.1, Lesson 21.2

---

### Error: "'process' is not defined" in the browser

**When you see it:** A library you imported uses `process.env.NODE_ENV` or other Node.js globals, and the code runs in the browser.
**What it means:** `process` is a Node.js global that does not exist in browsers. Some npm libraries were written for Node.js and assume `process` is always available. When SvelteKit runs this code on the client, it crashes.
**The fix:**
```typescript
// vite.config.ts
export default defineConfig({
  define: {
    'process.env.NODE_ENV': JSON.stringify('production')
  }
});

// Or better — use SvelteKit's $env modules instead
// $env/static/public for public env vars
// $env/static/private for server-only env vars
```
**Why it happens:** Vite replaces `process.env.NODE_ENV` with a literal string during the build via its `define` feature. But if the library accesses `process` in other ways (like `process.cwd()` or `process.versions`), you need to either find a browser-compatible alternative or ensure the code only runs on the server using dynamic imports or `$app/environment.browser` checks.
**Related lessons:** Lesson 21.2, Lesson 21.3

---

### Error: "Adapter mismatch — adapter-static cannot handle server routes"

**When you see it:** You use `@sveltejs/adapter-static` but have `+server.ts` files or server-side load functions that need a runtime server.
**What it means:** `adapter-static` generates a fully static site — HTML, CSS, and JS files with no server component. If your app has API routes, form actions, or server-only load functions, these cannot be prerendered. You need an adapter that provides a server runtime.
**The fix:**
```typescript
// svelte.config.js — Before (broken)
import adapter from '@sveltejs/adapter-static';

// After (fixed) — choose the right adapter
import adapter from '@sveltejs/adapter-node';    // self-hosted
// OR
import adapter from '@sveltejs/adapter-vercel';   // Vercel
// OR
import adapter from '@sveltejs/adapter-cloudflare'; // Cloudflare
```
**Why it happens:** Each SvelteKit adapter targets a different deployment environment. `adapter-static` outputs files for a static file host (GitHub Pages, S3). `adapter-node` creates a Node.js server. `adapter-vercel` creates serverless functions. The adapter must match your app's runtime requirements — if you use any server-side feature, you need a server-capable adapter.
**Related lessons:** Lesson 12.11, Lesson 8.12

---

### Error: "Environment variable VITE_API_KEY is undefined"

**When you see it:** You reference `import.meta.env.VITE_API_KEY` or `$env/static/public.PUBLIC_API_KEY` but the value is `undefined` at runtime.
**What it means:** SvelteKit has strict rules about environment variables. Only variables prefixed with `PUBLIC_` are available to client-side code via `$env/static/public`. Server-side code uses `$env/static/private`. The legacy `VITE_` prefix works through `import.meta.env` but is not recommended in SvelteKit.
**The fix:**
```
# .env — Before (broken)
API_KEY=secret123

# .env — After (fixed)
PUBLIC_API_KEY=not-secret  # available on client
PRIVATE_API_KEY=secret123  # server only
```
```typescript
// Client-side code
import { PUBLIC_API_KEY } from '$env/static/public';

// Server-side code (+page.server.ts, +server.ts, hooks.server.ts)
import { PRIVATE_API_KEY } from '$env/static/private';
```
**Why it happens:** SvelteKit deliberately separates public and private environment variables to prevent secret leakage. The `$env` modules are compile-time imports — SvelteKit statically replaces them with values during the build. If a variable is not prefixed correctly, it is not exposed to the corresponding module, and you get `undefined`.
**Related lessons:** Lesson 10.7, Lesson 21.3

---

### Error: "Chunk size exceeds 500 kB — consider code splitting"

**When you see it:** Vite warns during `pnpm build` that a generated JavaScript chunk exceeds the recommended size limit.
**What it means:** Large chunks slow down initial page load because the browser must download, parse, and execute all the JavaScript before the page is interactive. Vite warns you so you can split the code into smaller, lazily-loaded chunks.
**The fix:**
```typescript
// Before (broken) — importing everything eagerly
import { Chart } from 'chart-library'; // 300 kB
import { Editor } from 'rich-editor';   // 250 kB

// After (fixed) — dynamic imports for heavy libraries
const Chart = await import('chart-library').then(m => m.Chart);

// Or in Svelte — lazy component loading
{#await import('./HeavyComponent.svelte') then { default: Component }}
  <Component />
{/await}
```
**Why it happens:** Vite bundles all statically imported modules into chunks based on shared dependencies. If you import two large libraries on the same page, they may end up in one chunk. Dynamic imports create separate chunks that load on demand. SvelteKit's route-based code splitting handles most of this automatically, but manual splitting is needed for large third-party libraries.
**Related lessons:** Lesson 12.3, Lesson 21.6

---

### Error: "Cannot use 'window' during SSR — add browser check"

**When you see it:** A library you imported accesses `window`, `document`, or `navigator` at import time, and SvelteKit tries to load it during server-side rendering.
**What it means:** Node.js does not have browser globals like `window` or `document`. If a library accesses these at the module level (outside a function), it crashes during SSR. This is common with animation libraries, charting libraries, and anything that manipulates the DOM.
**The fix:**
```svelte
<script lang="ts">
  import { browser } from '$app/environment';
  import { onMount } from 'svelte';

  // Before (broken) — top-level import of browser-only lib
  // import confetti from 'canvas-confetti';

  // After (fixed) — dynamic import inside onMount or $effect
  let confetti: typeof import('canvas-confetti').default;

  $effect(() => {
    import('canvas-confetti').then(mod => {
      confetti = mod.default;
    });
  });
</script>
```
**Why it happens:** When SvelteKit renders a page on the server, it imports all component modules and runs their `<script>` blocks. Static imports at the top of `<script>` are executed during module evaluation. If the imported library accesses `window` at module level, it crashes before your component code even runs. Dynamic imports inside `$effect` only run on the client.
**Related lessons:** Lesson 8.2, Lesson 12.3

---

### Error: "Module not found: Cannot resolve 'shared-lib' in monorepo workspace"

**When you see it:** You have a pnpm workspace monorepo and one package cannot import from another workspace package.
**What it means:** In a monorepo, workspace packages need to be properly linked. If the package is not listed as a dependency in `package.json` or the workspace protocol is wrong, the module resolver cannot find it.
**The fix:**
```json
// apps/web/package.json — Before (broken)
{
  "dependencies": {
    "shared-lib": "^1.0.0"  // tries npm registry
  }
}

// After (fixed) — workspace protocol
{
  "dependencies": {
    "shared-lib": "workspace:*"  // links to local workspace
  }
}
```
```
# Then run:
pnpm install
```
**Why it happens:** pnpm workspaces use a special `workspace:` protocol to link local packages. Without it, pnpm looks for the package on the npm registry instead of in your monorepo. The `workspace:*` syntax tells pnpm to use whatever version exists in the local workspace, creating a symlink in `node_modules`.
**Related lessons:** Lesson 18.10, Lesson 21.2

---

### Error: "Rolldown missing export — named export 'X' not found in module"

**When you see it:** During production build with Vite 8 (which uses Rolldown), a named import cannot be found in the target module.
**What it means:** Rolldown, the Rust-based bundler used by Vite 8, is stricter about named exports than the development server. In dev mode, Vite uses native ESM and browser module resolution, which can be more lenient. The production bundler performs static analysis and catches missing exports.
**The fix:**
```typescript
// Before (broken) — importing a named export that doesn't exist
import { helperFunction } from 'some-library';
// The library actually exports it as a default export

// After (fixed) — check the library's actual exports
import someLibrary from 'some-library';
const { helperFunction } = someLibrary;

// Or use the correct named export
import { actualExportName } from 'some-library';
```
**Why it happens:** Some libraries use CommonJS internally, and the CJS-to-ESM interop layer handles named exports differently between development (esbuild) and production (Rolldown). Check the library's `package.json` for its `exports` field, and verify which exports are actually available. You can inspect a module's exports with `pnpm ls --json` or by checking `node_modules/package-name/package.json`.
**Related lessons:** Lesson 21.1, Lesson 21.6

---

## CSS and Styling Issues

### Error: Styles not applying — Svelte CSS scoping eating your selectors

**When you see it:** You wrote CSS in your `<style>` block, it looks correct, but the styles do not appear on the page. Inspecting the element in DevTools shows the selector has a hash suffix that does not match.
**What it means:** Svelte scopes all CSS to the component by adding a unique class (like `.svelte-abc123`) to elements and selectors. If you are trying to style an element that lives inside a child component, your scoped selector cannot reach it because the child has a different hash.
**The fix:**
```svelte
<!-- Before (broken) — trying to style child's internals -->
<style>
  .child-element {
    color: red; /* never applies — wrong scope */
  }
</style>
<ChildComponent />

<!-- After (fixed) — use :global() deliberately -->
<style>
  :global(.child-element) {
    color: red; /* applies globally — use with care */
  }

  /* Or scope it to this component's subtree: */
  .wrapper :global(.child-element) {
    color: red; /* only affects .child-element inside .wrapper */
  }
</style>
<div class="wrapper">
  <ChildComponent />
</div>
```
**Why it happens:** CSS scoping is one of Svelte's core features — it prevents style leakage between components. But it means you cannot style child component internals from a parent. The `:global()` modifier removes scoping for specific selectors. Best practice is to use CSS custom properties as the styling API between components, keeping the actual rules encapsulated.
**Related lessons:** Lesson 1.7, Lesson 3.9

---

### Error: `:global()` overreach — styles bleeding everywhere

**When you see it:** You used `:global(.some-class)` and now that style affects every instance of `.some-class` across your entire app, not just the component you intended.
**What it means:** `:global()` removes CSS scoping entirely for the matched selector. If `.some-class` is a common class name (like `.title`, `.button`, `.container`), your styles contaminate every component that uses that class.
**The fix:**
```svelte
<!-- Before (broken) — global with common class name -->
<style>
  :global(.title) {
    font-size: 2rem; /* affects EVERY .title in the app */
  }
</style>

<!-- After (fixed) — scope the global to a local wrapper -->
<style>
  .my-component :global(.title) {
    font-size: 2rem; /* only .title elements inside .my-component */
  }
</style>
<div class="my-component">
  <RichTextRenderer />
</div>
```
**Why it happens:** `:global()` is a sharp tool. It exists for legitimate cases like styling third-party library output, markdown-rendered content, or elements injected by `{@html}`. But without a scoping wrapper, it becomes a global stylesheet declaration. Always nest `:global()` inside a scoped parent selector to limit its blast radius.
**Related lessons:** Lesson 1.7, Lesson 6.1

---

### Error: OKLCH colors not displaying in older browsers

**When you see it:** Your carefully crafted OKLCH color tokens appear as transparent or fallback to the browser's default. This only happens in Safari 15 and older, or browsers that have not been updated.
**What it means:** OKLCH is a modern CSS color space supported in Chrome 111+, Safari 16.4+, and Firefox 113+. Older browsers do not understand the `oklch()` function and ignore the declaration entirely, leaving the element with no background or text color.
**The fix:**
```css
/* Before (broken) — no fallback */
.card {
  background: oklch(0.7 0.15 250);
}

/* After (fixed) — progressive enhancement with fallback */
.card {
  background: hsl(220, 60%, 55%);          /* fallback for old browsers */
  background: oklch(0.7 0.15 250);          /* modern browsers use this */
}

/* Or use @supports for complex cases */
@supports (color: oklch(0 0 0)) {
  .card {
    background: oklch(0.7 0.15 250);
  }
}
```
**Why it happens:** CSS parsers skip declarations they do not understand. When a browser encounters `oklch()` and does not recognize it, it ignores the entire declaration. By placing a fallback HSL value before the OKLCH value, old browsers use the fallback and modern browsers override it with OKLCH (last declaration wins).
**Related lessons:** Lesson 1.5, Lesson 6.2

---

### Error: Container query not triggering — layout does not respond to container size

**When you see it:** You wrote `@container` rules but the layout does not change when you resize the container. The styles seem to be ignored entirely.
**What it means:** Container queries require the container element to have `container-type` set. Without it, the browser does not track the element's size and the `@container` rules never match.
**The fix:**
```css
/* Before (broken) — no container-type */
.card-grid {
  display: grid;
}
@container (min-width: 400px) {
  .card { flex-direction: row; }
}

/* After (fixed) — declare the container */
.card-grid {
  display: grid;
  container-type: inline-size;  /* REQUIRED */
  container-name: card-grid;    /* optional but recommended */
}
@container card-grid (min-width: 400px) {
  .card { flex-direction: row; }
}
```
**Why it happens:** Container queries are fundamentally different from media queries. Media queries respond to the viewport, which the browser always tracks. Container queries respond to a specific element's size, which requires the browser to set up size containment. The `container-type` property tells the browser to track this element's dimensions and make them available to `@container` rules. Without it, the browser has nothing to query against.
**Related lessons:** Lesson 3.10, Lesson 6.8

---

### Error: `@layer` order wrong — your component styles losing to reset styles

**When you see it:** You defined `@layer` declarations but your component styles have lower specificity than your reset or utility layers because the layer order is reversed.
**What it means:** CSS cascade layers are resolved in the order they are first declared. Styles in later layers override earlier layers regardless of specificity. If your reset layer is declared after your component layer, reset styles win.
**The fix:**
```css
/* Before (broken) — wrong order */
@layer components {
  .btn { padding: 1rem; }
}
@layer reset {
  * { padding: 0; }  /* This wins because reset is declared AFTER components */
}

/* After (fixed) — declare order first, then fill */
@layer reset, tokens, base, components, utilities;

@layer reset {
  * { padding: 0; }
}
@layer components {
  .btn { padding: 1rem; }  /* Wins because components is after reset */
}
```
**Why it happens:** The `@layer` order declaration (`@layer reset, tokens, base, components, utilities;`) sets the cascade priority. Later layers have higher priority. The PE7 architecture uses this order: reset < tokens < base < components < utilities. This means utility classes always win over component styles, and component styles always win over the reset — which is exactly what you want.
**Related lessons:** Lesson 1.5, Lesson 6.1

---

### Error: Fluid `clamp()` producing negative values at small viewports

**When you see it:** Your fluid typography or spacing uses `clamp()` with a preferred value that goes negative at very small viewport widths, causing text to disappear or elements to collapse.
**What it means:** The `clamp(min, preferred, max)` function constrains a value between min and max, but the preferred value (usually a `calc()` with viewport units) can produce values below the minimum. While `clamp()` will catch this, the preferred calculation itself might cause layout issues in intermediate states.
**The fix:**
```css
/* Before (broken) — aggressive scaling */
.heading {
  font-size: clamp(1rem, -2rem + 10vw, 4rem);
  /* At 320px viewport: -2rem + 32px = very small or negative */
}

/* After (fixed) — gentler slope, always positive preferred */
.heading {
  font-size: clamp(1rem, 0.5rem + 2.5vw, 4rem);
  /* At 320px: 0.5rem + 8px = always comfortable */
}
```
**Why it happens:** Fluid type formulas use the pattern `clamp(min, base + slope * vw, max)`. If the base is too negative or the slope too aggressive, the preferred value dips below the minimum at small viewports. While `clamp()` enforces the minimum, the jump from preferred to minimum can be jarring. Use a fluid type calculator tool to generate slopes that produce smooth scaling across the 320px-1440px range.
**Related lessons:** Lesson 1.6, Lesson 6.3

---

### Error: `prefers-reduced-motion` not respected — animations still playing

**When you see it:** Users with motion sensitivity still see full animations because your CSS and JavaScript do not check the `prefers-reduced-motion` media query.
**What it means:** The `prefers-reduced-motion` media query reports when users have enabled "Reduce motion" in their OS settings. Ignoring it is an accessibility failure — vestibular motion disorders can cause nausea, dizziness, and migraines from animated content.
**The fix:**
```css
/* CSS — respect the preference */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```
```svelte
<!-- Svelte — conditional transitions -->
<script lang="ts">
  import { fade } from 'svelte/transition';
  const reduceMotion = $state(
    typeof window !== 'undefined'
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
      : false
  );
</script>

{#if visible}
  <div transition:fade={{ duration: reduceMotion ? 0 : 300 }}>
    Content
  </div>
{/if}
```
```typescript
// GSAP — respect the preference
import gsap from 'gsap';
if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  gsap.globalTimeline.timeScale(20); // effectively instant
}
```
**Why it happens:** Neither CSS nor JavaScript automatically respects the preference — you must check it explicitly. Svelte transitions, GSAP timelines, and CSS animations all need separate handling. The PE7 CSS architecture includes a motion token layer that centralizes this check, so you only write the media query once and all motion tokens reference it.
**Related lessons:** Lesson 6.18, Lesson 7.1, Lesson 12.8

---

## Bonus: Multi-Category Gotchas

### Error: "$effect" running on the server during SSR

**When you see it:** Your `$effect` reads `window` or `document` and throws a ReferenceError during SSR.
**What it means:** `$effect` runs on the client only — it does not run during SSR. However, the code inside the effect's closure is still evaluated during module loading if it references top-level variables. The error occurs when you set up values outside the effect that depend on browser APIs.
**The fix:**
```svelte
<script lang="ts">
  // Before (broken) — browser API at top level
  const width = window.innerWidth; // crashes on server
  $effect(() => {
    console.log(width);
  });

  // After (fixed) — browser API inside effect
  let width = $state(0);
  $effect(() => {
    width = window.innerWidth;
    const handleResize = () => { width = window.innerWidth; };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  });
</script>
```
**Why it happens:** During SSR, Svelte executes the `<script>` block to initialize component state, but skips `$effect` callbacks. Any code at the top level of the script runs on both server and client. Moving browser API calls into `$effect` ensures they only run on the client. This is the SSR-safe pattern for all browser-specific code.
**Related lessons:** Lesson 2.9, Lesson 8.2

---

### Error: "Cannot read properties of undefined (reading 'then')" — async load without await

**When you see it:** Your load function calls an async function but forgets `await`, returning a Promise instead of the resolved data.
**What it means:** Without `await`, you return a raw `Promise` object as your page data. When the component tries to access properties on it (like `data.title`), it gets `undefined` because `Promise` objects do not have a `title` property. The actual data is trapped inside the unresolved promise.
**The fix:**
```typescript
// Before (broken) — missing await
export const load = async ({ fetch }) => {
  const products = fetch('/api/products').then(r => r.json());
  return { products }; // products is a Promise, not data
};

// After (fixed) — await the result
export const load = async ({ fetch }) => {
  const res = await fetch('/api/products');
  const products = await res.json();
  return { products }; // products is actual data
};
```
**Why it happens:** JavaScript's `async/await` is syntactic sugar over Promises. If you forget `await`, the function continues with the Promise object instead of waiting for it to resolve. TypeScript can catch this if you annotate your return type, because `Promise<Product[]>` is not assignable to `Product[]`. Always use `await` and annotate return types in load functions.
**Related lessons:** Lesson 4.7, Lesson 9A.1

---

### Error: "SvelteKit form action returned HTML instead of JSON"

**When you see it:** Your `use:enhance` form submission receives an HTML error page instead of the expected ActionData JSON. The page flashes or shows raw HTML.
**What it means:** The form action threw an unhandled error, and SvelteKit's error page (HTML) was returned instead of the expected JSON response. `use:enhance` expects JSON, so it cannot parse the HTML error page.
**The fix:**
```typescript
// +page.server.ts — Before (broken) — unhandled error
export const actions = {
  default: async ({ request }) => {
    const data = await request.formData();
    const result = await db.insert(data); // throws if DB is down
    return { success: true };
  }
};

// After (fixed) — proper error handling
import { fail } from '@sveltejs/kit';

export const actions = {
  default: async ({ request }) => {
    const data = await request.formData();
    try {
      const result = await db.insert(data);
      return { success: true };
    } catch (e) {
      return fail(500, { error: 'Database error. Please try again.' });
    }
  }
};
```
**Why it happens:** When an action throws, SvelteKit catches it and renders the error page. But `use:enhance` expects the response to be JSON (serialized ActionData). The `fail()` helper returns a proper error response with a status code that `use:enhance` can handle gracefully. Always wrap action logic in try/catch and use `fail()` for expected errors.
**Related lessons:** Lesson 10.3, Lesson 10.5

---

### Error: "Cannot read properties of null (reading 'subscribe')" — mixing $app/stores with $app/state

**When you see it:** You imported from `$app/stores` (the Svelte 4 API) in a Svelte 5 runes-mode component, or vice versa.
**What it means:** Svelte 5 introduced `$app/state` as the runes-based replacement for `$app/stores`. The two APIs are incompatible — stores use `.subscribe()` and the `$` auto-subscription prefix, while state objects are plain reactive objects. Mixing them causes type errors and runtime crashes.
**The fix:**
```svelte
<script lang="ts">
  // Before (broken) — Svelte 4 stores API in Svelte 5
  import { page } from '$app/stores';
  $: currentPath = $page.url.pathname;

  // After (fixed) — Svelte 5 state API
  import { page } from '$app/state';
  let currentPath = $derived(page.url.pathname);
</script>
```
**Why it happens:** `$app/stores` returns Svelte stores (objects with `.subscribe()`). `$app/state` returns reactive proxy objects powered by runes. In runes mode, the `$:` reactive declaration and `$store` auto-subscription syntax are disabled, so stores do not work. Always use `$app/state` in Svelte 5 runes-mode components.
**Related lessons:** Lesson 8.7, Lesson 2.2

---

### Error: "Warning: dynamic data in prerendered page will be stale"

**When you see it:** You prerender a page that fetches data from an API. The data was correct at build time but is now outdated in production.
**What it means:** Prerendered pages are generated once at build time and served as static files. If the underlying data changes after deployment (new products, updated prices, modified content), the prerendered HTML shows stale information until you rebuild and redeploy.
**The fix:**
```typescript
// Option 1: Switch to SSR for frequently-changing data
export const prerender = false;
export const ssr = true;

// Option 2: Use ISR-style revalidation (adapter-dependent)
// With adapter-vercel:
export const config = {
  isr: {
    expiration: 60 // revalidate every 60 seconds
  }
};

// Option 3: Client-side refresh after hydration
// Prerender for initial speed, then fetch fresh data
export const prerender = true;
```
**Why it happens:** Prerendering trades freshness for speed. Static files are served from CDN edge locations with zero server processing, giving the fastest possible Time to First Byte. But the content is frozen at build time. For pages where data changes frequently (prices, inventory, user-specific content), SSR or ISR is more appropriate. For truly static content (blog posts, documentation), prerendering is ideal.
**Related lessons:** Lesson 9A.10, Lesson 8.12

---

### Error: "TypeError: Failed to fetch" in $effect — race condition with component lifecycle

**When you see it:** Your `$effect` fires an API call, but the component unmounts before the response arrives, causing an error or a state update on an unmounted component.
**What it means:** When users navigate quickly, components mount and unmount rapidly. If an `$effect` starts an async operation, the component might be destroyed before the operation completes. Trying to update state on a destroyed component is a memory leak and can cause errors.
**The fix:**
```svelte
<script lang="ts">
  let data = $state<string | null>(null);

  // Before (broken) — no cleanup
  $effect(() => {
    fetch('/api/data')
      .then(r => r.json())
      .then(d => { data = d; }); // component might be gone
  });

  // After (fixed) — AbortController for cleanup
  $effect(() => {
    const controller = new AbortController();

    fetch('/api/data', { signal: controller.signal })
      .then(r => r.json())
      .then(d => { data = d; })
      .catch(e => {
        if (e.name !== 'AbortError') throw e;
      });

    return () => controller.abort();
  });
</script>
```
**Why it happens:** The `$effect` cleanup function (the returned function) runs when the effect re-runs or the component is destroyed. `AbortController` cancels in-flight fetch requests, preventing state updates on unmounted components. This is the same pattern used in React's `useEffect` cleanup and is essential for any async operation in a reactive context.
**Related lessons:** Lesson 2.11, Lesson 9A.4

---

### Error: "Valibot: Invalid type — expected string, received undefined"

**When you see it:** Your Valibot schema validation fails because a form field is missing from the submitted FormData.
**What it means:** Valibot schemas are strict by default. If you define a field as `v.string()`, it must be present and be a string. `undefined` (missing field) and `null` are not strings. HTML forms with unchecked checkboxes or empty optional fields often submit `undefined`.
**The fix:**
```typescript
import * as v from 'valibot';

// Before (broken) — all fields required
const schema = v.object({
  name: v.string(),
  email: v.string(),
  phone: v.string(),  // crashes if phone field is empty
});

// After (fixed) — optional fields handled
const schema = v.object({
  name: v.pipe(v.string(), v.minLength(1, 'Name is required')),
  email: v.pipe(v.string(), v.email('Invalid email')),
  phone: v.optional(v.string()),  // undefined is OK
});

// In your form action:
const formData = await request.formData();
const raw = Object.fromEntries(formData);
const result = v.safeParse(schema, raw);
if (!result.success) {
  return fail(400, { errors: result.issues });
}
```
**Why it happens:** HTML forms submit key-value pairs. If a field has no value, `formData.get('phone')` returns `null`, not an empty string. Converting to an object with `Object.fromEntries()` turns missing fields into `undefined`. Valibot's `v.optional()` wrapper explicitly allows `undefined`, while `v.nullable()` allows `null`. Use the appropriate wrapper based on how your form submits data.
**Related lessons:** Lesson 10.6, Lesson 9B.5

---

### Error: "Expected server-rendered HTML to contain matching element" — conditional rendering mismatch

**When you see it:** You use `{#if browser}` or `{#if mounted}` to conditionally render content, and SvelteKit warns about hydration mismatches.
**What it means:** The server renders the component once (without `browser` being true), producing HTML without the conditional content. The client then hydrates and immediately evaluates the condition as true, producing different HTML. This mismatch confuses the hydration algorithm.
**The fix:**
```svelte
<script lang="ts">
  // Before (broken) — immediate browser check
  import { browser } from '$app/environment';
</script>
{#if browser}
  <BrowserOnlyWidget />  <!-- not in SSR HTML, causes mismatch -->
{/if}

<!-- After (fixed) — defer with $effect -->
<script lang="ts">
  let mounted = $state(false);
  $effect(() => { mounted = true; });
</script>
{#if mounted}
  <BrowserOnlyWidget />  <!-- renders after hydration, no mismatch -->
{/if}
```
**Why it happens:** `browser` from `$app/environment` is `false` on the server and `true` on the client. If you use it directly in markup, the server renders without the content and the client renders with it — a mismatch. Using `$effect` to set a `mounted` flag ensures the flag is `false` during both SSR and initial client render (hydration), then switches to `true` after hydration completes. This produces matching HTML during hydration.
**Related lessons:** Lesson 8.2, Lesson 8.3

---

### Error: "`$inspect` value is deeply nested — performance may be degraded"

**When you see it:** You used `$inspect()` on a large reactive object (like a table dataset with thousands of rows) and the browser DevTools slows to a crawl.
**What it means:** `$inspect()` serializes the entire reactive value every time it changes and logs it to the console. For deeply nested or large objects, this serialization is expensive. Unlike `console.log`, which lazily evaluates, `$inspect` eagerly snapshots the value.
**The fix:**
```svelte
<script lang="ts">
  // Before (broken) — inspecting a huge dataset
  let data = $state(hugeArray); // 10,000 items
  $inspect(data); // serializes all 10,000 items on every change

  // After (fixed) — inspect a slice or derived summary
  let data = $state(hugeArray);
  let summary = $derived({ length: data.length, first: data[0] });
  $inspect(summary); // lightweight

  // Or remove $inspect entirely — it's dev-only anyway
</script>
```
**Why it happens:** `$inspect` uses `$state.snapshot()` internally to create a deep clone of the value for logging. For large arrays or deeply nested objects, this clone operation is O(n) and runs on every mutation. `$inspect` is a development tool — it is automatically stripped from production builds. But during development, it can make your app unusable if applied to large datasets.
**Related lessons:** Lesson 2.6, Lesson 2.9

---

### Error: "Cannot stringify a function" — passing functions through page data

**When you see it:** Your load function returns an object containing a function, and SvelteKit throws when trying to serialize it for client-side hydration.
**What it means:** SvelteKit serializes load function return values to send them from server to client during hydration. Functions cannot be serialized to JSON. You must only return plain data (strings, numbers, booleans, arrays, objects, dates) from load functions.
**The fix:**
```typescript
// Before (broken) — returning a function from load
export const load = async () => {
  return {
    title: 'Dashboard',
    formatPrice: (n: number) => `$${n.toFixed(2)}` // cannot serialize
  };
};

// After (fixed) — move functions to the component or a shared module
// +page.server.ts
export const load = async () => {
  return { title: 'Dashboard' };
};

// utils.ts
export function formatPrice(n: number): string {
  return `$${n.toFixed(2)}`;
}

// +page.svelte
<script lang="ts">
  import { formatPrice } from '$lib/utils';
  let { data } = $props();
</script>
```
**Why it happens:** SvelteKit uses `devalue` to serialize data, which handles more types than JSON (dates, RegExps, Maps, Sets, BigInts, cyclic references) but still cannot serialize functions or class instances with methods. Functions are code, not data — they cannot round-trip through serialization. Keep load function returns as pure data and define utility functions in shared modules.
**Related lessons:** Lesson 9A.1, Lesson 11.3

---

### Error: "import.meta.hot is not available in production"

**When you see it:** You used `import.meta.hot` for HMR without checking that it exists first, and the code crashes in production.
**What it means:** `import.meta.hot` is Vite's Hot Module Replacement API, only available during development. In production builds, it is `undefined`. Any code that accesses it without a guard will throw.
**The fix:**
```typescript
// Before (broken) — no guard
import.meta.hot.accept(() => {
  console.log('Module updated');
});

// After (fixed) — guard with conditional
if (import.meta.hot) {
  import.meta.hot.accept(() => {
    console.log('Module updated');
  });
}
```
**Why it happens:** Vite strips `import.meta.hot` in production builds when you use the conditional guard pattern. The `if (import.meta.hot)` block is treated as dead code and removed entirely by the bundler. Without the guard, the code survives into production where `import.meta.hot` is `undefined`, causing a crash. Always wrap HMR code in this guard.
**Related lessons:** Lesson 21.5, Lesson 21.2

---

### Error: "querySelector returned null" in Svelte action

**When you see it:** Your `use:` action calls `document.querySelector()` and the target element does not exist yet or has been removed.
**What it means:** Svelte actions receive the element they are attached to as a parameter — you do not need `querySelector` to find the element. If you are querying for other elements, they might not be in the DOM yet when the action initializes.
**The fix:**
```svelte
<script lang="ts">
  // Before (broken) — querySelector in action
  function highlight(node: HTMLElement) {
    const target = document.querySelector('.highlight-target');
    target!.style.color = 'red'; // null if element doesn't exist
  }

  // After (fixed) — use the node parameter
  function highlight(node: HTMLElement) {
    node.style.color = 'red'; // node is guaranteed to exist
    return {
      destroy() {
        node.style.color = ''; // cleanup
      }
    };
  }
</script>

<div use:highlight>Highlighted</div>
```
**Why it happens:** Actions are called when the element is mounted to the DOM, so the `node` parameter is always valid. But `document.querySelector()` searches the entire DOM, and the target element might not exist (it could be in a different component, conditionally rendered, or not yet mounted). If you need to coordinate between elements, use reactive state or the context API instead of DOM queries.
**Related lessons:** Lesson 7.11, Lesson 12.6

---

### Error: "Svelte component imported but not used" — tree-shaking confusion

**When you see it:** You import a component for its side effects (like registering a global style or animation) but Svelte warns it is unused and the build might tree-shake it away.
**What it means:** Svelte and Vite's tree-shaking removes imports that are not referenced in the template or script. If you import a component purely for its side effects (no `<ComponentName />` in the template), the bundler considers it dead code.
**The fix:**
```svelte
<!-- Before (broken) — import without usage -->
<script lang="ts">
  import GlobalStyles from './GlobalStyles.svelte';
  // Never referenced in template — gets tree-shaken
</script>

<!-- After (fixed) — render it in the template -->
<script lang="ts">
  import GlobalStyles from './GlobalStyles.svelte';
</script>

<GlobalStyles />
<slot />

<!-- Or if it truly has no visual output, render it hidden -->
<GlobalStyles />
```
**Why it happens:** Tree-shaking is a critical optimization that removes unused code from production bundles. Svelte components are functions — if a function is imported but never called, the bundler removes it. The fix is simple: if a component needs to exist, render it. Even if it produces no visual output, rendering it ensures it is included in the bundle and its lifecycle effects run.
**Related lessons:** Lesson 21.6, Lesson 3.1

---

### Error: "pnpm: WARN  deprecated" — outdated dependency in lockfile

**When you see it:** Running `pnpm install` shows deprecation warnings for packages in your dependency tree.
**What it means:** One of your dependencies (or a dependency of a dependency) has been deprecated on npm. This could mean the package has a security vulnerability, has been superseded by a better alternative, or the maintainer has abandoned it. Deprecated packages still work but should be replaced.
**The fix:**
```bash
# Find which package depends on the deprecated one
pnpm why deprecated-package

# Check for updates
pnpm outdated

# Update to a version without the deprecated dependency
pnpm update parent-package

# Or override the transitive dependency
# package.json
{
  "pnpm": {
    "overrides": {
      "deprecated-package": "npm:replacement-package@^1.0.0"
    }
  }
}
```
**Why it happens:** npm's ecosystem has deep dependency trees. When a leaf dependency is deprecated, every package that depends on it (transitively) triggers the warning. The `pnpm.overrides` field lets you replace transitive dependencies without waiting for the parent package to update. Use this sparingly — overrides bypass the parent package's tested dependency versions.
**Related lessons:** Lesson 21.2, Lesson 12.11

---

### Error: "Svelte runtime version mismatch between compiler and runtime"

**When you see it:** After updating Svelte, you see errors about version mismatches or unexpected runtime behavior.
**What it means:** The Svelte compiler (which runs at build time) and the Svelte runtime (which runs in the browser) must be the same version. If your lockfile pins different versions of `svelte` in different parts of the dependency tree, you get mismatches.
**The fix:**
```bash
# Check for duplicate Svelte versions
pnpm why svelte

# If duplicates exist, deduplicate
pnpm dedupe

# Or force a specific version
# package.json
{
  "pnpm": {
    "overrides": {
      "svelte": "5.55.0"
    }
  }
}
```
```bash
# Then clean and reinstall
rm -rf node_modules .svelte-kit
pnpm install
pnpm dev
```
**Why it happens:** pnpm's strict node_modules structure normally prevents duplicates, but workspace packages or packages with peer dependency ranges can pull in different Svelte versions. The compiler generates code targeting a specific runtime API — if the runtime is a different version, the generated code calls functions that do not exist or have different signatures. Always ensure a single Svelte version across your entire project.
**Related lessons:** Lesson 1.2, Lesson 21.1

---

### Error: "Cannot access 'Component' before initialization" — circular dependency

**When you see it:** Two or more Svelte components or modules import each other, creating a circular dependency chain. The JavaScript module system cannot resolve the initialization order.
**What it means:** When Module A imports Module B and Module B imports Module A, one of them will be partially initialized when the other tries to access it. This causes `undefined` values or initialization errors because JavaScript evaluates modules top-down and cannot time-travel.
**The fix:**
```typescript
// Before (broken) — circular dependency
// componentA.svelte imports componentB.svelte
// componentB.svelte imports componentA.svelte

// After (fixed) — extract shared code to a third module
// shared.svelte.ts — no circular imports
export const sharedState = $state({ count: 0 });

// componentA.svelte
import { sharedState } from './shared.svelte.ts';

// componentB.svelte
import { sharedState } from './shared.svelte.ts';
```
**Why it happens:** JavaScript's ES module system evaluates imports depth-first. When it encounters a cycle, it provides the partially-evaluated module to break the deadlock. If you try to access a variable that has not been initialized yet (because the module is still evaluating), you get `undefined` or a TDZ (Temporal Dead Zone) error. The fix is to restructure your code so that shared dependencies flow from a common module rather than between siblings.
**Related lessons:** Lesson 11.3, Lesson 18.10

---

### Error: "TypeError: Cannot read properties of undefined (reading 'map')" — data not loaded yet

**When you see it:** Your component tries to call `.map()` on `data.items` but `data.items` is `undefined` because the load function has not completed yet, or the page was accessed without the expected data.
**What it means:** This is a timing issue. During SSR, the load function completes before the component renders, so data is always available. But during client-side navigation, there can be a brief moment where the data is not yet available, especially if you are using streaming or deferred loading.
**The fix:**
```svelte
<script lang="ts">
  let { data } = $props();
</script>

<!-- Before (broken) — assumes data.items always exists -->
{#each data.items as item}
  <p>{item.name}</p>
{/each}

<!-- After (fixed) — defensive rendering -->
{#if data.items}
  {#each data.items as item (item.id)}
    <p>{item.name}</p>
  {/each}
{:else}
  <p>Loading...</p>
{/if}
```
**Why it happens:** SvelteKit guarantees that load function data is available when the page renders during normal navigation. But edge cases exist: direct URL access with malformed params, invalidation during navigation, or custom data flows that bypass load. Defensive rendering with `{#if}` guards is a best practice that costs nothing and prevents crashes.
**Related lessons:** Lesson 4.1, Lesson 9A.1

---

### Error: "SvelteKit does not support top-level await in components"

**When you see it:** You used `await` at the top level of a `<script>` block in a `.svelte` file.
**What it means:** While JavaScript supports top-level await in ES modules, Svelte components are not standard ES modules — they are compiled into component classes. Top-level await would block the entire component tree from rendering, which is not how Svelte's rendering model works.
**The fix:**
```svelte
<script lang="ts">
  // Before (broken) — top-level await
  const data = await fetch('/api/data').then(r => r.json());

  // After (fixed) — use load function for initial data
  let { data } = $props(); // data comes from +page.ts load function
</script>
```
```typescript
// +page.ts — load function handles async
export const load = async ({ fetch }) => {
  const res = await fetch('/api/data');
  const data = await res.json();
  return { data };
};
```
**Why it happens:** Svelte components render synchronously during SSR. If a component could `await` at the top level, the entire rendering pipeline would stall. SvelteKit's load functions are the designated place for async data fetching — they run before the component renders, ensuring data is always available synchronously in the component.

Note: With Svelte 5 and SvelteKit's remote functions using `query`, async SSR (`await` directly in components) is being introduced. See Lesson 9B.9 for the new pattern.
**Related lessons:** Lesson 9A.1, Lesson 9B.9

---

### Error: "Form data lost on validation failure — form fields reset to empty"

**When you see it:** A user fills out a long form, submits it, server-side validation fails, and all form fields are cleared. The user has to re-enter everything.
**What it means:** By default, a form submission causes a full page reload. When validation fails, the server sends back error messages, but the original form values are lost unless you explicitly return them in the action response and repopulate the form.
**The fix:**
```typescript
// +page.server.ts
import { fail } from '@sveltejs/kit';

export const actions = {
  default: async ({ request }) => {
    const formData = await request.formData();
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;

    if (!email.includes('@')) {
      // Return the submitted values so the form can repopulate
      return fail(400, {
        error: 'Invalid email',
        values: { name, email }  // send back what they typed
      });
    }

    return { success: true };
  }
};
```
```svelte
<!-- +page.svelte -->
<script lang="ts">
  let { form } = $props();
</script>

<form method="POST">
  <input name="name" value={form?.values?.name ?? ''} />
  <input name="email" value={form?.values?.email ?? ''} />
  {#if form?.error}
    <p class="error">{form.error}</p>
  {/if}
  <button>Submit</button>
</form>
```
**Why it happens:** HTML forms do not preserve state across submissions by default. `use:enhance` solves this by preventing full-page reloads, but without it, you must manually return and repopulate form values. This is a fundamental web platform behavior, not a SvelteKit limitation. Always return submitted values alongside error messages in `fail()` responses.
**Related lessons:** Lesson 10.5, Lesson 10.6

---

### Error: "Svelte transition: `deferred` is not a valid transition modifier"

**When you see it:** You tried to use a transition modifier that does not exist, possibly confusing Svelte 4 syntax with Svelte 5 or inventing a modifier.
**What it means:** Svelte transitions support specific modifiers: `|local` and `|global` (the default). There is no `|deferred`, `|lazy`, or other custom modifier. If you need deferred transitions, use Svelte's crossfade or animate directives.
**The fix:**
```svelte
<!-- Before (broken) — invalid modifier -->
<div transition:fade|deferred>...</div>

<!-- After (fixed) — valid modifiers only -->
<div transition:fade|local={{ duration: 300 }}>...</div>

<!-- For cross-component transitions, use crossfade -->
<script lang="ts">
  import { crossfade } from 'svelte/transition';
  const [send, receive] = crossfade({ duration: 300 });
</script>

{#each items as item (item.id)}
  <div in:receive={{ key: item.id }} out:send={{ key: item.id }}>
    {item.name}
  </div>
{/each}
```
**Why it happens:** Svelte's transition system is designed around two modifiers: `|local` restricts the transition to the element's immediate conditional block, and `|global` (default) plays the transition even when a parent block is being destroyed. Other effects like deferred transitions or stagger are achieved through different mechanisms (crossfade, GSAP, CSS animation-delay) rather than transition modifiers.
**Related lessons:** Lesson 6.11, Lesson 6.12

---

### Error: SvelteKit endpoint returning wrong Content-Type

**When you see it:** Your `+server.ts` API route returns data, but the client receives it as plain text instead of JSON, or the browser displays it incorrectly.
**What it means:** HTTP responses need a `Content-Type` header to tell the client how to interpret the body. If you return a `Response` object without setting the header, or if you use `new Response(JSON.stringify(data))` without specifying `application/json`, the browser defaults to `text/plain`.
**The fix:**
```typescript
// +server.ts — Before (broken)
export const GET = async () => {
  const data = { message: 'hello' };
  return new Response(JSON.stringify(data));
  // Content-Type defaults to text/plain
};

// After (fixed) — Option 1: set header manually
export const GET = async () => {
  const data = { message: 'hello' };
  return new Response(JSON.stringify(data), {
    headers: { 'Content-Type': 'application/json' }
  });
};

// After (fixed) — Option 2: use json() helper (recommended)
import { json } from '@sveltejs/kit';
export const GET = async () => {
  return json({ message: 'hello' });
};
```
**Why it happens:** The `Response` constructor from the Fetch API does not assume any content type. SvelteKit's `json()` helper is a convenience that wraps `new Response()` with the correct `Content-Type: application/json` header and handles serialization. Always use `json()` for JSON responses and `text()` for text responses.
**Related lessons:** Lesson 10.1, Lesson 10.2

---

*Total entries: 50+ across 5 categories. Each error includes the exact message, context, plain-English explanation, before/after fix, underlying mechanism, and related lessons. Bookmark this page and search by error message when you get stuck.*
