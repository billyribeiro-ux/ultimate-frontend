# State Management Decision Tree

> A flowchart for choosing the right state management pattern in SvelteKit applications. Start at the top and follow the branches based on your requirements.

---

## The Decision Tree

```
START: You have state to manage
  |
  +-- Is it local to ONE component?
  |     +-- YES --> $state() in the component. Done.
  |
  +-- Shared between PARENT and CHILD?
  |     +-- One-way down --> $props()
  |     +-- Two-way --> $bindable()
  |
  +-- Shared across a SUBTREE (not the whole app)?
  |     +-- YES --> setContext() / getContext()
  |
  +-- Shared across the ENTIRE APP?
  |     +-- Simple value --> .svelte.ts module with $state
  |     +-- Complex with methods --> Reactive class in .svelte.ts
  |
  +-- Needs to SURVIVE page navigation?
  |     +-- In the URL --> searchParams via goto()
  |     +-- Not in URL --> .svelte.ts singleton (module-level)
  |
  +-- Needs to SURVIVE page refresh?
  |     +-- User preference --> cookie (via hooks.server.ts)
  |     +-- Form data --> URL searchParams
  |     +-- Persistent data --> database (Drizzle)
  |
  +-- Needs REAL-TIME sync across users?
        +-- Low frequency --> SSE + invalidate()
        +-- High frequency --> WebSocket + $state
```

---

## Node Explanations

### $state() in the Component

**When:** A counter, a form input value, a toggle, a loading flag — anything that only this component cares about.

Use `$state()` directly in your component's `<script>` block. This is the simplest and most performant option because the reactive state is scoped to a single component instance. When the component is destroyed, the state is garbage collected. No global coordination, no context providers, no shared modules. If you are unsure where state belongs, start here. You can always lift it later if another component needs access. Premature state lifting is a common over-engineering mistake — most state is genuinely local to one component. Form inputs, animation progress, dropdown open/closed, tooltip visibility, and scroll position are all local state.

### $props() — One-Way Down

**When:** A parent component needs to pass data to a child component, and the child should not modify it directly.

`$props()` is Svelte's primary data-flow mechanism. It creates a one-way binding: parent sets the value, child reads it. When the parent's state changes, the child's props update automatically because Svelte's reactivity propagates through the component tree. This is the correct pattern for most parent-child communication. The child can compute derived values from props using `$derived` but should not attempt to mutate them. If the child needs to communicate back to the parent, use a callback prop (a function passed as a prop that the child calls with the new value).

### $bindable() — Two-Way Binding

**When:** A parent and child need to share a value that either side can modify, like a form input component that wraps `<input>`.

`$bindable()` creates a two-way binding between parent and child. When the child updates the value, the parent's state updates too, and vice versa. Use this sparingly — two-way bindings create implicit data flow that is harder to debug than explicit callbacks. The primary use case is form components: a `<TextInput>` component that wraps `<input bind:value>` needs `$bindable()` so the parent can both read and set the input value. Avoid using `$bindable()` for complex state — if two components need to share and mutate a complex object, use a shared reactive class via context or a module instead.

### setContext() / getContext() — Subtree Scope

**When:** Multiple components in a subtree need access to shared state, but different subtrees need different instances. Example: a form context that provides validation state to all fields within a `<Form>` component.

Context is scoped to the component tree. When you call `setContext()` in a parent component, only descendants of that parent can call `getContext()` to access the value. This makes context perfect for "provider" patterns where a wrapper component supplies state to its children. Critical: pass a reactive object (a class with `$state` fields), not a primitive value. If you pass `setContext('count', count)` where `count` is a number, the context receives the number value at that moment — it is not reactive. Pass `setContext('count', { value: $state(0) })` or a reactive class instead.

### .svelte.ts Module with $state — App-Wide Simple State

**When:** A single value needs to be accessible from any component in the app, and the value is simple (a boolean, string, number, or small object).

Create a `.svelte.ts` file that exports a `$state` variable. Because ES modules are singletons, every import gets the same instance. This is the simplest way to share state across the entire app without context providers or prop drilling. Example use cases: a global `isLoading` flag, the current user's preferred color scheme, or a notification count. The `.svelte.ts` extension tells the Svelte compiler to process the file, enabling runes. A plain `.ts` file cannot use `$state`. For server-side rendering, be aware that module-level singletons persist across requests — do not store user-specific data in module state on the server.

### Reactive Class in .svelte.ts — App-Wide Complex State

**When:** The shared state has multiple related values and operations. Example: a shopping cart with items, quantities, a total, add/remove methods, and persistence logic.

A reactive class encapsulates state and behavior. Properties use `$state`, computed values use `$derived`, and methods provide a clean API for mutations. Export a singleton instance from the `.svelte.ts` file. This is the Svelte 5 equivalent of a Zustand or Pinia store, but with no library dependency — just classes and runes. The class pattern is more maintainable than scattered `$state` exports because it groups related state and operations, is easily testable (instantiate the class, call methods, assert state), and provides a clear public API that documents what operations are available.

### URL searchParams via goto() — Survives Navigation

**When:** State needs to survive client-side navigation AND be shareable via URL. Example: search filters, sort order, pagination, active tab.

URL state is the most durable client-side state mechanism. It survives navigation, is bookmarkable, is shareable (copy the URL and paste it), and is visible to search engines. Use `goto()` with `url.searchParams` to update the URL, and read params in your load function or with `$app/state`. URL state is ideal for any state that answers the question "what is the user looking at?" — the current page of results, the active filter, the selected category. Avoid putting sensitive data (tokens, user IDs) or large data (form contents) in the URL.

### .svelte.ts Singleton — Survives Navigation but Not Refresh

**When:** State needs to persist across page navigations but does not need to be in the URL or survive a full page refresh.

Module-level state in `.svelte.ts` files persists as long as the JavaScript runtime is alive — which means it survives SvelteKit's client-side navigations but is lost on full page refresh (F5) or new tab. Use this for ephemeral app state like "the user expanded this sidebar panel" or "the user has seen this onboarding tooltip." If the state needs to survive refresh, it belongs in a cookie, localStorage, or the database instead.

### Cookie via hooks.server.ts — Survives Refresh

**When:** User preferences that should persist across sessions and be available during SSR. Example: theme preference (dark/light), preferred language, collapsed sidebar state.

Cookies are sent with every HTTP request, so they are available during server-side rendering — unlike localStorage, which only exists in the browser. Set cookies in `hooks.server.ts` or form actions, and read them in load functions. This makes cookies ideal for preferences that affect initial page rendering (theme, locale) because the server can render the correct version immediately instead of showing a flash of wrong content. Keep cookie values small (4KB limit per cookie, 20 cookies per domain). Do not store complex objects — use a single-character flag or a short string.

### URL searchParams for Form Data — Survives Refresh

**When:** Form data that the user might want to bookmark or share. Example: a search query with multiple filters that produces a results page.

Encoding form state in the URL means users can bookmark their search, share it with colleagues, and use the browser's back/forward buttons to navigate between searches. This is the standard pattern for search pages, product listing filters, and report parameters. Use `method="GET"` on the form (the default) to automatically encode form fields into the URL. SvelteKit's load functions receive these parameters and can use them to query the database.

### Database (Drizzle) — Persistent Data

**When:** Data that must survive indefinitely, be consistent across devices, and be authoritative. Example: user profiles, orders, content, settings that sync across devices.

The database is the source of truth for persistent data. Use Drizzle ORM to read and write data in load functions and form actions. The database is the only state mechanism that provides durability (data survives server restarts), consistency (all users see the same data), and atomicity (transactions prevent partial updates). If you find yourself building increasingly complex client-side persistence (localStorage + sync + conflict resolution), you probably need a database instead.

### SSE + invalidate() — Low-Frequency Real-Time

**When:** State needs to stay fresh across multiple users but updates infrequently (1-10 updates per minute). Example: notification badges, order status updates, dashboard metrics.

Server-Sent Events push updates from server to client over a single HTTP connection. When the server sends an event, the client calls `invalidate()` to re-run the relevant load function and refresh the data. This pattern is simple: the SSE connection is a trigger mechanism, not a data transport. The actual data still flows through your existing load functions, keeping your data flow consistent and type-safe. The browser's `EventSource` API handles reconnection automatically.

### WebSocket + $state — High-Frequency Real-Time

**When:** State needs to be synchronized across users in real-time with sub-second latency and potentially hundreds of updates per second. Example: live chat, collaborative editing, multiplayer games, live trading dashboards.

WebSocket provides full-duplex communication — both client and server can send messages at any time. Incoming messages update `$state` directly, triggering instant re-renders without going through load functions. This is the most performant real-time pattern but also the most complex: you need connection management, reconnection logic, message queuing during disconnects, and potentially conflict resolution for concurrent edits. Only use WebSocket when SSE is genuinely insufficient — most "real-time" features work fine with SSE at 1-5 second update intervals.

---

## Quick Reference Table

| State Type | Mechanism | Survives Navigation | Survives Refresh | Shareable via URL | Available in SSR |
|---|---|---|---|---|---|
| Component-local | `$state()` | No | No | No | N/A |
| Parent-to-child | `$props()` | No | No | No | Yes |
| Subtree-shared | `setContext()` | No | No | No | Yes |
| App-wide | `.svelte.ts` | Yes | No | No | Careful* |
| URL state | `searchParams` | Yes | Yes | Yes | Yes |
| Preference | Cookie | Yes | Yes | No | Yes |
| Persistent | Database | Yes | Yes | No | Yes |
| Real-time (low) | SSE | Yes | Yes | No | N/A |
| Real-time (high) | WebSocket | Yes | No | No | No |

*Module-level `$state` in `.svelte.ts` files persists across requests on the server, which can leak state between users. Use context or request-scoped patterns for user-specific state during SSR.

---

## Common Mistakes

**Over-lifting state.** Not everything needs to be global. If only one component uses a value, keep it in that component. Lifting state "just in case" creates unnecessary coupling and makes components harder to reuse.

**Using context for app-wide state.** Context requires being inside a component tree. If you need state in a utility function, an API route handler, or a test, context is inaccessible. Use `.svelte.ts` modules for app-wide state.

**Storing derived data.** If a value can be computed from other state, use `$derived` — do not store it separately. Storing derived data means you must keep it in sync, which is a bug waiting to happen. Let `$derived` handle the synchronization automatically.

**Using localStorage for preferences that affect SSR.** If the user's theme preference is in localStorage, the server cannot read it during SSR. The page renders with the wrong theme and flashes to the correct one after hydration. Use cookies instead — they are sent with every request and available during SSR.

**Putting everything in the URL.** URL state is powerful but has limits: 2,000-character URL length limit in some browsers, visible to users, logged by servers, and cached by proxies. Complex form state, large datasets, and sensitive data do not belong in the URL.

---

*When in doubt, start with the simplest option (`$state` in the component) and only move to more complex patterns when you have a concrete reason. State management complexity should grow with your application's requirements, not ahead of them.*
