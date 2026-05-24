# Module 9B — Remote Functions: Video Lecture Script Outlines

> **Recording note:** Set editor font to 18px minimum. Split-screen: editor (left), browser with Network tab (right). Show the distinction between remote function calls and traditional fetch.

---

## Lesson 9B.1 — What remote functions are and why they exist

**Duration:** 11 minutes
**Screen setup:** Split-screen: slides/diagrams (left), code editor (right)

### Hook (30 seconds)
"You want to call a server function from a component. Not fetch an API endpoint. Not submit a form. Just call a function — and have it run on the server. Remote functions make server code feel like local function calls, with type safety from end to end."

### Demo sequence
1. **[0:30-2:30] The problem** — Show the boilerplate of creating an API endpoint, fetching it, parsing the response, handling errors. "That is a lot of ceremony for calling one server function."
2. **[2:30-5:00] Remote functions** — Create a remote function. Call it from a component. Show that it runs on the server but types flow to the client automatically.
3. **[5:00-7:30] How it works under the hood** — Show the Network tab. Remote functions compile to fetch calls. "The DX is function calls. The reality is HTTP. The compiler bridges the gap."
4. **[7:30-9:30] When to use them** — Decision table: load functions for page data, form actions for forms, remote functions for everything else (mutations, side effects, on-demand queries).
5. **[9:30-10:30] Edge case / gotcha** — "Remote functions always run on the server. Do not put browser APIs inside them. The compiler does not warn you — the code simply fails at runtime."

### Key moments
- 0:30 — "The API endpoint ceremony"
- 2:30 — "Remote functions: server code, local DX"
- 5:00 — "Under the hood: compiled to fetch"
- 7:30 — "When to use which data strategy"
- 9:30 — "Server-only: no browser APIs"

### Callout graphics
- Comparison: API endpoint vs remote function boilerplate
- Remote function compilation diagram
- Decision table: load vs actions vs remote

### Outro (30 seconds)
"Remote functions eliminate the boilerplate between client and server. Next lesson: query remote functions for reading data."

---

## Lesson 9B.2 — Query remote functions — reading data

**Duration:** 11 minutes
**Screen setup:** Editor with remote function and component, browser showing data

### Hook (30 seconds)
"Your component needs data that is not tied to the page URL — a user's notification count, a product recommendation, search results. Query remote functions let you read server data on demand, from any component, with full type safety."

### Demo sequence
1. **[0:30-2:30] Creating a query** — Define a query remote function that reads from a database. Show the return type flowing to the component.
2. **[2:30-5:00] Calling from a component** — Import and call the query. Show the data appearing. Demonstrate the loading and error states.
3. **[5:00-7:30] Automatic caching** — Call the same query twice. Show that the second call uses cached data. Explain the caching behavior.
4. **[7:30-9:30] Build the mini-build** — Notification badge that queries unread count on component mount.
5. **[9:30-10:30] Edge case / gotcha** — "Query remote functions cache by default. If you need fresh data every time, use the invalidation mechanism."

### Key moments
- 0:30 — "On-demand server data"
- 2:30 — "Query in a component"
- 5:00 — "Automatic caching"
- 7:30 — "Notification badge mini-build"
- 9:30 — "Cache invalidation"

### Callout graphics
- Query remote function data flow
- Caching behavior diagram
- Loading/error state patterns

### Outro (30 seconds)
"Query remote functions give you type-safe server data on demand. Next lesson: parameterized queries with arguments."

---

## Lesson 9B.3 — Query with arguments — parameterized queries

**Duration:** 10 minutes
**Screen setup:** Editor with parameterized query, browser showing filtered results

### Hook (30 seconds)
"You need products filtered by category, users searched by name, orders filtered by date. Your query needs arguments. Parameterized queries let you pass typed arguments from the client to the server, with validation built in."

### Demo sequence
1. **[0:30-2:30] Adding parameters** — Add typed parameters to a query function. Show TypeScript enforcing the argument types at the call site.
2. **[2:30-5:00] Reactive queries** — Pass reactive state as arguments. When the state changes, the query re-runs automatically.
3. **[5:00-7:00] Validation** — Add server-side validation to query parameters. Show error handling for invalid arguments.
4. **[7:00-8:30] Build the mini-build** — Search input that queries products by search term, with debouncing.
5. **[8:30-9:30] Edge case / gotcha** — "Arguments must be serializable — no functions, no class instances. Stick to primitives, plain objects, and arrays."

### Key moments
- 0:30 — "Queries need arguments"
- 2:30 — "Reactive argument passing"
- 5:00 — "Server-side validation"
- 7:00 — "Search with debounce"
- 8:30 — "Serialization constraint"

### Callout graphics
- Parameterized query type flow
- Reactive argument reactivity diagram
- Serialization rules

### Outro (30 seconds)
"Parameterized queries give you type-safe, validated server data with reactive arguments. Next lesson: batching multiple queries."

---

## Lesson 9B.4 — Query batch — batching multiple server calls

**Duration:** 10 minutes
**Screen setup:** Editor with multiple queries, Network tab showing batched requests

### Hook (30 seconds)
"Your dashboard needs user data, recent orders, and notification count. Three queries, three HTTP requests, three round trips. Query batching combines them into a single request — same data, one-third the latency."

### Demo sequence
1. **[0:30-2:30] The waterfall problem** — Three separate queries firing sequentially in the Network tab.
2. **[2:30-5:00] Batching** — Use query batch to combine the three queries. Show a single request in the Network tab.
3. **[5:00-7:00] Error handling in batches** — One query fails. Show that the others still resolve. "Batching uses Promise.allSettled semantics."
4. **[7:00-8:30] Build the mini-build** — Dashboard with four batched queries: user, orders, notifications, recommendations.
5. **[8:30-9:30] Edge case / gotcha** — "Batching only combines queries made in the same tick. If queries are triggered by different user actions, they are separate batches."

### Key moments
- 0:30 — "Three queries, three round trips"
- 2:30 — "One batch, one request"
- 5:00 — "Partial failure handling"
- 7:00 — "Dashboard mini-build"
- 8:30 — "Same-tick batching rule"

### Callout graphics
- Waterfall vs batch timeline
- Batch request/response structure
- Error handling in batches

### Outro (30 seconds)
"Batching reduces latency by combining multiple queries into a single request. Next lesson: form remote functions for server-side form handling."

---

## Lesson 9B.5 — Form remote functions — server-side form handling with Valibot

**Duration:** 12 minutes
**Screen setup:** Editor with form and remote function, browser showing validation

### Hook (30 seconds)
"Forms need server-side validation. Always. Client-side validation is for UX — server-side validation is for security. Form remote functions combine form handling with schema validation using Valibot, giving you validated, type-safe form processing."

### Demo sequence
1. **[0:30-3:00] Form remote function** — Create a form remote function that receives FormData, validates with Valibot, and returns the result.
2. **[3:00-5:30] Valibot schema** — Define a validation schema. Show how validation errors map to field-level error messages.
3. **[5:30-8:00] Progressive enhancement** — The form works without JavaScript. Show it submitting as a standard HTML form, then with JS for enhanced UX.
4. **[8:00-10:00] Build the mini-build** — Contact form with name, email, and message fields, validated with Valibot schemas.
5. **[10:00-11:30] Edge case / gotcha** — "Valibot schemas run on the server only. Do not import them in client code — they increase bundle size. Use type inference to share the types without the runtime code."

### Key moments
- 0:30 — "Server-side validation is non-negotiable"
- 3:00 — "Valibot schema validation"
- 5:30 — "Progressive enhancement"
- 8:00 — "Contact form mini-build"
- 10:00 — "Schema import boundaries"

### Callout graphics
- Form remote function data flow
- Valibot schema to error mapping
- Progressive enhancement diagram

### Outro (30 seconds)
"Form remote functions give you validated, progressively enhanced forms. Next lesson: file uploads in form remote functions."

---

## Lesson 9B.6 — File upload streaming in form remote functions

**Duration:** 11 minutes
**Screen setup:** Editor with file upload form, browser showing upload progress

### Hook (30 seconds)
"Users need to upload avatars, documents, images. File uploads in form remote functions handle multipart form data on the server, with streaming for large files and validation for file types and sizes."

### Demo sequence
1. **[0:30-2:30] Basic file upload** — Form with file input. Remote function receives the file as a `File` object on the server.
2. **[2:30-5:00] Validation** — Check file type, file size, and dimensions before processing. Return errors for invalid files.
3. **[5:00-7:30] Streaming large files** — Handle large uploads without loading the entire file into memory. Stream to disk or cloud storage.
4. **[7:30-9:30] Build the mini-build** — Avatar upload with preview, file type validation, and size limit.
5. **[9:30-10:30] Edge case / gotcha** — "File uploads are limited by the server's body size limit. Configure this in your SvelteKit config or deployment platform."

### Key moments
- 0:30 — "File uploads in forms"
- 2:30 — "Server-side file validation"
- 5:00 — "Streaming large files"
- 7:30 — "Avatar upload mini-build"
- 9:30 — "Body size limits"

### Callout graphics
- File upload data flow
- Validation checklist (type, size, dimensions)
- Streaming vs buffering comparison

### Outro (30 seconds)
"File uploads with validation and streaming keep your server safe and responsive. Next lesson: command remote functions for mutations."

---

## Lesson 9B.7 — Command remote functions — mutations

**Duration:** 11 minutes
**Screen setup:** Editor with command function, browser showing mutation effects

### Hook (30 seconds)
"Queries read data. Commands change it. Delete a user, update a setting, send an email. Command remote functions handle mutations with type-safe arguments, server-side validation, and automatic cache invalidation."

### Demo sequence
1. **[0:30-2:30] Creating a command** — Define a command remote function that updates a database record. Show the mutation executing on the server.
2. **[2:30-5:00] Cache invalidation** — After a mutation, related queries need fresh data. Show automatic and manual cache invalidation strategies.
3. **[5:00-7:30] Error handling** — Handle mutation failures gracefully. Show rollback patterns and user-facing error messages.
4. **[7:30-9:30] Build the mini-build** — Todo list with add, toggle, and delete commands. Each mutation invalidates the todo query.
5. **[9:30-10:30] Edge case / gotcha** — "Commands should be idempotent when possible. Network retries can cause duplicate mutations if the command is not idempotent."

### Key moments
- 0:30 — "Commands change data"
- 2:30 — "Cache invalidation after mutation"
- 5:00 — "Error handling and rollback"
- 7:30 — "Todo list with CRUD commands"
- 9:30 — "Idempotency matters"

### Callout graphics
- Command execution flow
- Cache invalidation strategies
- Idempotency examples

### Outro (30 seconds)
"Command remote functions handle mutations with type safety and cache invalidation. Next lesson: query sets for server-driven reactive state."

---

## Lesson 9B.8 — Query set — server-driven reactive state

**Duration:** 11 minutes
**Screen setup:** Editor with query set, browser showing reactive updates

### Hook (30 seconds)
"Your component needs a collection of queries that update together — a dashboard where changing a date range updates all charts simultaneously. Query sets group related queries into a single reactive unit with coordinated loading states."

### Demo sequence
1. **[0:30-2:30] The coordination problem** — Multiple independent queries with separate loading states. Messy UX when some resolve before others.
2. **[2:30-5:00] Query sets** — Group queries into a set. Show coordinated loading — all queries show loading until all resolve.
3. **[5:00-7:30] Shared parameters** — Pass shared parameters to the set. Change the date range — all queries re-run with the new range.
4. **[7:30-9:30] Build the mini-build** — Analytics dashboard with revenue, users, and orders queries sharing a date range parameter.
5. **[9:30-10:30] Edge case / gotcha** — "Query sets resolve as a unit. If one query is slow, all queries appear to be loading. Consider whether independent loading states are better for your UX."

### Key moments
- 0:30 — "Coordinated query loading"
- 2:30 — "Query sets: grouped queries"
- 5:00 — "Shared parameters"
- 7:30 — "Analytics dashboard"
- 9:30 — "Slow query blocking"

### Callout graphics
- Query set coordination diagram
- Shared parameter flow
- Independent vs coordinated loading UX

### Outro (30 seconds)
"Query sets coordinate multiple queries for unified loading and shared parameters. Next lesson: async SSR with await in components."

---

## Lesson 9B.9 — Async SSR — await directly in components

**Duration:** 11 minutes
**Screen setup:** Editor with async component, browser showing SSR output

### Hook (30 seconds)
"What if you could write `await` directly in your Svelte component's markup, and have it work during SSR? Async SSR lets components fetch their own data inline — the server awaits the promises, renders the HTML, and sends it to the client. No loading spinners on first load."

### Demo sequence
1. **[0:30-2:30] The pattern** — Write `{#await}` with an inline fetch in the component. Show that SSR waits for the promise to resolve before sending HTML.
2. **[2:30-5:00] Comparison with load functions** — Show the same data loading with a load function vs async SSR. When each pattern is appropriate.
3. **[5:00-7:30] Nested async components** — A parent renders a child that also has async data. Show the waterfall implications and how to mitigate.
4. **[7:30-9:30] Build the mini-build** — User profile card that fetches user data inline with async SSR.
5. **[9:30-10:30] Edge case / gotcha** — "Async SSR creates server-side waterfalls when nested. Prefer load functions for page-level data and reserve async SSR for isolated, self-contained components."

### Key moments
- 0:30 — "Await in the template"
- 2:30 — "Load functions vs async SSR"
- 5:00 — "Nested waterfall warning"
- 7:30 — "Profile card mini-build"
- 9:30 — "When to use which"

### Callout graphics
- Async SSR server rendering timeline
- Load function vs async SSR comparison
- Waterfall diagram for nested components

### Outro (30 seconds)
"Async SSR lets components own their data, but watch for waterfalls. Last lesson: choosing the right tool — remote functions vs load functions vs server.ts."

---

## Lesson 9B.10 — Remote functions vs load vs +server.ts — choosing the right tool

**Duration:** 12 minutes
**Screen setup:** Slides with decision tree, editor for live examples

### Hook (30 seconds)
"Load functions, form actions, API routes, remote functions — SvelteKit gives you four ways to run server code. Each has a purpose. Choosing the wrong one means fighting the framework. This lesson gives you the decision tree."

### Demo sequence
1. **[0:30-3:00] The four tools** — Overview of load functions, form actions, +server.ts API routes, and remote functions. One sentence each.
2. **[3:00-5:30] Decision tree** — Walk through the tree: "Does the data belong to this page?" (yes → load function), "Is it a form submission?" (yes → form action), "Do external services need to call it?" (yes → API route), "Everything else?" (remote function).
3. **[5:30-8:00] Real-world scenarios** — Apply the decision tree to 5 scenarios: product page data, contact form, webhook endpoint, notification count, order creation.
4. **[8:00-10:00] Combining them** — Show a page that uses a load function for page data, a form action for the comment form, and a remote function for the like button.
5. **[10:00-11:30] Edge case / gotcha** — "Do not use remote functions for page data that affects SEO. Load functions run before render — remote functions run after mount. Search engines see load function data. They do not see remote function data."

### Key moments
- 0:30 — "Four tools, one purpose"
- 3:00 — "The decision tree"
- 5:30 — "Five real-world scenarios"
- 8:00 — "Combining all four"
- 10:00 — "SEO implications"

### Callout graphics
- Decision tree flowchart
- Comparison table: all four tools
- SEO visibility matrix

### Outro (30 seconds)
"Each tool has its place. Load functions for page data, form actions for forms, API routes for external consumers, remote functions for everything else. Module 9B is complete — you can now call server code from anywhere in your SvelteKit app."

---
