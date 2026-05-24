# Module 11 — State Management: Video Lecture Script Outlines

> **Recording note:** Set editor font to 18px minimum. Keep DevTools visible to show state changes. Split-screen: editor (left), browser (right).

---

## Lesson 11.1 — The prop drilling problem

**Duration:** 10 minutes
**Screen setup:** Editor with deeply nested components, browser showing data flow

### Hook (30 seconds)
"Your root layout loads the user. A button five components deep needs the user's name. You pass it through four components that do not use it. This is prop drilling — and it is the symptom that tells you state management patterns are needed."

### Demo sequence
1. **[0:30-2:30] The problem** — Build a 5-level component tree. Pass `user` through every level. Show how every intermediate component has a prop it does not use.
2. **[2:30-5:00] Why it hurts** — Refactoring pain: adding a field to `user` means updating 5 components. Type changes cascade. Code reviews become noisy.
3. **[5:00-7:00] Three solutions preview** — Context (component tree), .svelte.ts files (global), URL state (shareable). "Each solves drilling, each has trade-offs."
4. **[7:00-8:30] Build the mini-build** — Visualize the drilling: each component shows what props it passes through vs what it uses.
5. **[8:30-9:30] Edge case / gotcha** — "One or two levels of prop passing is normal and healthy. Do not reach for context or stores for data that only travels one level."

### Key moments
- 0:30 — "Five levels deep"
- 2:30 — "Refactoring pain"
- 5:00 — "Three solutions"
- 7:00 — "Drilling visualizer"
- 8:30 — "When drilling is fine"

### Callout graphics
- Component tree with prop drilling arrows
- Three solution comparison table
- Decision: when to stop drilling

### Outro (30 seconds)
"Prop drilling is the signal that you need a state management pattern. Next lesson: Svelte's Context API."

---

## Lesson 11.2 — Svelte Context API — setContext and getContext

**Duration:** 11 minutes
**Screen setup:** Editor with context provider and consumer, browser showing data flow

### Hook (30 seconds)
"Context lets a parent component provide data to ALL descendants — without passing props through every level. setContext in the parent, getContext in any child. No prop drilling. No wrapper components. No ceremony."

### Demo sequence
1. **[0:30-2:30] setContext** — Parent calls `setContext('key', value)`. Show the context being established.
2. **[2:30-5:00] getContext** — Deeply nested child calls `getContext('key')`. Show the data appearing without prop drilling.
3. **[5:00-7:30] Reactive context** — Pass a reactive object (with getters). Show that changes in the parent flow to consumers automatically.
4. **[7:30-9:30] Build the mini-build** — Theme context: parent sets theme, nested components read and display themed styles.
5. **[9:30-10:30] Edge case / gotcha** — "Context is scoped to the component tree, not global. Two instances of the same parent component have independent contexts. This is a feature, not a limitation."

### Key moments
- 0:30 — "Data to all descendants"
- 2:30 — "getContext in any child"
- 5:00 — "Reactive context values"
- 7:30 — "Theme context mini-build"
- 9:30 — "Tree-scoped, not global"

### Callout graphics
- Context flow through component tree
- Reactive context pattern
- Tree scoping diagram

### Outro (30 seconds)
"Context eliminates prop drilling for tree-scoped data. Next lesson: .svelte.ts files for global reactive state."

---

## Lesson 11.3 — .svelte.ts files — universal reactive state

**Duration:** 11 minutes
**Screen setup:** Editor with .svelte.ts store file and consuming components

### Hook (30 seconds)
"Context is tree-scoped. But some state is truly global — the current user, a shopping cart, theme preferences. .svelte.ts files let you create reactive state that any component can import and use. No provider wrappers. No setup. Just import and go."

### Demo sequence
1. **[0:30-2:30] Creating a .svelte.ts store** — Create a file with `$state` and exported functions. Import it in a component. Show reactivity working.
2. **[2:30-5:00] Class-based stores** — Use a class with `$state` properties and methods. Show getters as computed values.
3. **[5:00-7:30] Multiple consumers** — Import the same store in two different components. Mutate in one, see the update in both.
4. **[7:30-9:30] Build the mini-build** — Shopping cart store: add items from a product list, see the cart update in the header.
5. **[9:30-10:30] Edge case / gotcha** — "SSR warning: module-level state is shared across requests on the server. For user-specific state, use context instead. Module-level stores are safe for client-only state."

### Key moments
- 0:30 — "Global reactive state"
- 2:30 — "Class-based stores"
- 5:00 — "Shared across components"
- 7:30 — "Shopping cart mini-build"
- 9:30 — "SSR shared state warning"

### Callout graphics
- .svelte.ts file structure
- Class store with $state and getters
- SSR shared state warning diagram

### Outro (30 seconds)
".svelte.ts files give you global reactive state without any framework ceremony. Next lesson: sharing state across pages."

---

## Lesson 11.4 — Shared state across pages

**Duration:** 10 minutes
**Screen setup:** Editor with shared store, browser navigating between pages

### Hook (30 seconds)
"You navigate from /products to /cart. The cart state must survive the navigation. Layout data handles some cases, but for client-side state that persists across route changes, you need patterns that outlive individual pages."

### Demo sequence
1. **[0:30-2:30] The problem** — Navigate between pages. Component state resets. "Page components are destroyed and recreated on navigation."
2. **[2:30-5:00] .svelte.ts persistence** — Module-level state survives navigation because the module stays in memory. Show cart items persisting across pages.
3. **[5:00-7:00] Layout-level state** — Store state in a layout component's context. Show it surviving child page navigation.
4. **[7:00-8:30] Build the mini-build** — Multi-step form wizard where each step is a different route, but form data persists.
5. **[8:30-9:30] Edge case / gotcha** — "Refreshing the page resets all client-side state. For true persistence, sync to localStorage, cookies, or the server."

### Key moments
- 0:30 — "State across navigations"
- 2:30 — "Module persistence"
- 5:00 — "Layout-level state"
- 7:00 — "Form wizard mini-build"
- 8:30 — "Page refresh resets state"

### Callout graphics
- Navigation lifecycle and state persistence
- Module vs component lifetime
- Persistence strategy comparison

### Outro (30 seconds)
"Module-level stores and layout context persist state across page navigations. Next lesson: reactive classes with runes."

---

## Lesson 11.5 — Reactive classes with runes

**Duration:** 11 minutes
**Screen setup:** Editor with reactive class, browser showing live updates

### Hook (30 seconds)
"A class with $state properties is reactive. A class with getter methods is computed. A class with regular methods is your API. This is the most natural state management pattern in Svelte 5 — and it replaces Redux, Zustand, and Pinia with plain TypeScript."

### Demo sequence
1. **[0:30-2:30] Reactive properties** — Class with `$state` properties. Show mutations triggering UI updates.
2. **[2:30-5:00] Computed getters** — Add `get` accessors that derive values from state. Show automatic recalculation.
3. **[5:00-7:30] Methods as API** — Add methods that encapsulate state mutations. Show the clean API surface.
4. **[7:30-9:30] Build the mini-build** — Timer class: start, stop, reset, with elapsed time as a derived getter.
5. **[9:30-10:30] Edge case / gotcha** — "Arrow function methods in classes do not have the correct `this` binding when used as callbacks. Use regular methods or bind explicitly."

### Key moments
- 0:30 — "Classes as state containers"
- 2:30 — "Computed getters"
- 5:00 — "Methods as the public API"
- 7:30 — "Timer class mini-build"
- 9:30 — "this binding in callbacks"

### Callout graphics
- Reactive class anatomy
- $state + getter + method pattern
- Comparison: class store vs Redux

### Outro (30 seconds)
"Reactive classes give you encapsulated, type-safe state with zero dependencies. Next lesson: URL as state."

---

## Lesson 11.6 — URL as state — $page.url.searchParams

**Duration:** 10 minutes
**Screen setup:** Editor with URL state management, browser showing URL changes

### Hook (30 seconds)
"Filters, sort order, pagination, search queries — this state belongs in the URL. When users share links, the recipient sees the same view. When users press Back, the previous state restores. The URL is the most shareable, bookmarkable state container you have."

### Demo sequence
1. **[0:30-2:30] Reading URL state** — Access `$page.url.searchParams` to read current filters from the URL.
2. **[2:30-5:00] Writing URL state** — Use `goto()` with updated search params. Show the URL changing without a full page reload.
3. **[5:00-7:00] Sync with load functions** — Load functions read search params. Changing the URL triggers a new load. Data updates automatically.
4. **[7:00-8:30] Build the mini-build** — Product list with sort/filter controls that update the URL. Shareable, bookmarkable, back-button-friendly.
5. **[8:30-9:30] Edge case / gotcha** — "Avoid storing large amounts of data in the URL. Search params have practical limits (~2000 characters). Use them for filter/sort/page state, not data."

### Key moments
- 0:30 — "Shareable, bookmarkable state"
- 2:30 — "Writing to the URL"
- 5:00 — "Load function integration"
- 7:00 — "Filterable product list"
- 8:30 — "URL length limits"

### Callout graphics
- URL state flow: UI → URL → load → data → UI
- Before/after: URL-driven vs component-driven state
- goto() options reference

### Outro (30 seconds)
"The URL is your most shareable state container. Next lesson: TanStack Table for headless table logic."

---

## Lesson 11.7 — TanStack Table — headless table logic

**Duration:** 12 minutes
**Screen setup:** Editor with TanStack Table setup, browser showing rendered table

### Hook (30 seconds)
"You need a table with sorting, filtering, pagination, and column resizing. Building this from scratch takes weeks. TanStack Table gives you the logic — headless, renderless, framework-agnostic. You provide the UI. It provides the brains."

### Demo sequence
1. **[0:30-3:00] What headless means** — TanStack Table has zero UI. It calculates rows, pages, sort order. You render the `<table>`, `<tr>`, `<td>` elements yourself.
2. **[3:00-5:30] Basic setup** — Install, define columns, create a table instance. Render rows with `{#each}`.
3. **[5:30-8:00] Column definitions** — Define columns with accessors, headers, and cell renderers. Show TypeScript types flowing from data to columns.
4. **[8:00-10:00] Build the mini-build** — User table with name, email, role, and status columns.
5. **[10:00-11:30] Edge case / gotcha** — "TanStack Table re-creates row objects on every state change. Use row.id for keyed each blocks, not the row index."

### Key moments
- 0:30 — "Headless means no UI"
- 3:00 — "Basic table setup"
- 5:30 — "Column definitions"
- 8:00 — "User table mini-build"
- 10:00 — "Row identity for keys"

### Callout graphics
- Headless architecture diagram
- Column definition anatomy
- Data flow: source → table instance → rendered rows

### Outro (30 seconds)
"TanStack Table gives you the logic, you provide the UI. Next lesson: adding sorting, filtering, and pagination."

---

## Lesson 11.8 — TanStack Table — sorting, filtering, pagination

**Duration:** 12 minutes
**Screen setup:** Editor with table features, browser showing interactive table

### Hook (30 seconds)
"Click a column header to sort. Type in a search box to filter. Navigate pages. These three features turn a static table into a data exploration tool. TanStack Table handles the logic — you wire up the UI."

### Demo sequence
1. **[0:30-3:00] Sorting** — Enable sorting on columns. Add click handlers to headers. Show ascending/descending/none toggle.
2. **[3:00-5:30] Filtering** — Add a global filter input. Show rows filtering as you type. Then add per-column filters.
3. **[5:30-8:00] Pagination** — Set page size. Add previous/next buttons. Show page count and current page.
4. **[8:00-10:00] Build the mini-build** — Full-featured data table: 50 rows, sortable columns, global search, 10 rows per page.
5. **[10:00-11:30] Edge case / gotcha** — "Sorting and filtering happen in order: filter first, then sort. If your filter removes rows, the sort applies to the filtered set. This is usually what you want."

### Key moments
- 0:30 — "Three essential features"
- 3:00 — "Filtering implementation"
- 5:30 — "Pagination controls"
- 8:00 — "Full-featured table"
- 10:00 — "Filter-then-sort order"

### Callout graphics
- Sort state cycle diagram
- Filter + sort pipeline
- Pagination controls anatomy

### Outro (30 seconds)
"Sorting, filtering, and pagination transform your table into a data tool. Next lesson: advanced TypeScript patterns for TanStack Table."

---

## Lesson 11.9 — TanStack Table with TypeScript — advanced typing

**Duration:** 11 minutes
**Screen setup:** Editor with typed table configuration, TypeScript hover info

### Hook (30 seconds)
"TanStack Table is fully generic. Your table knows it renders `User[]`, and TypeScript enforces that column accessors match User fields, cell renderers receive the correct types, and sort functions compare the right value types. Zero runtime errors."

### Demo sequence
1. **[0:30-2:30] Generic table instance** — `createSvelteTable<User>()`. Show how the generic parameter flows to column definitions.
2. **[2:30-5:00] Typed accessors** — Column accessor functions receive `User` and return the cell value. TypeScript autocompletes field names.
3. **[5:00-7:30] Custom cell renderers** — Type-safe cell renderers that know the column's value type.
4. **[7:30-9:30] Build the mini-build** — Typed product inventory table with number columns (quantity, price) and string columns (name, category).
5. **[9:30-10:30] Edge case / gotcha** — "When using `accessorFn`, TypeScript cannot infer the return type automatically. Explicitly type the column definition or the accessor function return type."

### Key moments
- 0:30 — "Generic tables"
- 2:30 — "Typed accessors"
- 5:00 — "Custom cell renderers"
- 7:30 — "Inventory table mini-build"
- 9:30 — "accessorFn type inference"

### Callout graphics
- Generic type flow diagram
- Column definition type anatomy
- TypeScript hover showing inferred types

### Outro (30 seconds)
"Full TypeScript integration gives you zero-error tables. Last lesson: optimistic UI patterns."

---

## Lesson 11.10 — Optimistic UI — updating before the server responds

**Duration:** 11 minutes
**Screen setup:** Editor with optimistic update pattern, browser showing instant feedback

### Hook (30 seconds)
"You click Like. The count increases immediately. The request to the server happens in the background. If it fails, the count rolls back. This is optimistic UI — assume success, handle failure. It makes your app feel instant."

### Demo sequence
1. **[0:30-2:30] The latency problem** — Click a button, wait 500ms for the server, then update. "Users perceive this delay as sluggishness."
2. **[2:30-5:00] Optimistic pattern** — Update state immediately. Send the request. If it fails, revert. Show the instant feel.
3. **[5:00-7:30] Rollback strategy** — Save the previous state before the optimistic update. On error, restore it. Show a graceful error message.
4. **[7:30-9:30] Build the mini-build** — Like button with instant count update, background server request, and error rollback.
5. **[9:30-10:30] Edge case / gotcha** — "Optimistic updates are risky for destructive actions (delete). For those, show a confirmation or wait for the server. Reserve optimistic UI for additive, low-risk actions."

### Key moments
- 0:30 — "Perceived latency"
- 2:30 — "Update then confirm"
- 5:00 — "Rollback on failure"
- 7:30 — "Like button mini-build"
- 9:30 — "Not for destructive actions"

### Callout graphics
- Optimistic update timeline
- Rollback flow diagram
- Risk assessment: when to use optimistic UI

### Outro (30 seconds)
"Optimistic UI makes your app feel instant. Module 11 is complete — you now have context, stores, URL state, TanStack Table, and optimistic updates in your toolkit."

---
