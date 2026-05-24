# Module 10 — API Routes & Form Actions: Video Lecture Script Outlines

> **Recording note:** Set editor font to 18px minimum. Split-screen: editor (left), browser with Network tab (right). Show form submissions in both Network tab and server terminal.

---

## Lesson 10.1 — +server.ts — building API endpoints

**Duration:** 11 minutes
**Screen setup:** Editor with +server.ts file, browser/Postman for testing endpoints

### Hook (30 seconds)
"SvelteKit is not just a frontend framework — it is a full-stack platform. `+server.ts` files let you build API endpoints that handle GET, POST, PUT, DELETE. Same routing system, same type safety, same deployment. No separate backend needed."

### Demo sequence
1. **[0:30-2:30] Creating an endpoint** — Create `src/routes/api/health/+server.ts` with a GET handler. Hit it in the browser. "That is a live API endpoint."
2. **[2:30-5:00] HTTP methods** — Add POST, PUT, DELETE handlers. Show how the file exports named functions for each method.
3. **[5:00-7:30] Request and response** — Parse request body, read headers, set response headers, return JSON. Show the `RequestEvent` object.
4. **[7:30-9:30] Build the mini-build** — CRUD API for a todos resource: GET /api/todos, POST /api/todos, DELETE /api/todos/[id].
5. **[9:30-10:30] Edge case / gotcha** — "API routes and page routes share the same routing system. A folder can have both +page.svelte and +server.ts, but the API route only responds to fetch requests with Accept: application/json, not browser navigation."

### Key moments
- 0:30 — "Full-stack in one framework"
- 2:30 — "HTTP method handlers"
- 5:00 — "Request and response patterns"
- 7:30 — "CRUD API mini-build"
- 9:30 — "Routing coexistence"

### Callout graphics
- +server.ts file structure
- HTTP method mapping diagram
- Request/Response flow

### Outro (30 seconds)
"API routes give you a complete backend. Next lesson: TypeScript patterns for type-safe API routes."

---

## Lesson 10.2 — TypeScript in API routes

**Duration:** 10 minutes
**Screen setup:** Editor with typed API route and client-side consumer

### Hook (30 seconds)
"An API endpoint returns JSON. The client parses it. But what shape is the JSON? Without types, you are guessing. TypeScript in API routes gives you type-safe request bodies, validated responses, and shared types between server and client."

### Demo sequence
1. **[0:30-2:30] Typing the response** — Define an interface for the response. Type the return value of the handler.
2. **[2:30-5:00] Typing the request body** — Parse and validate the request body against a TypeScript interface. Handle malformed input.
3. **[5:00-7:00] Shared types** — Create types in `$lib/types` and import them in both the API route and the consuming component.
4. **[7:00-8:30] Build the mini-build** — Typed API route with shared Product interface used in both server and client code.
5. **[8:30-9:30] Edge case / gotcha** — "TypeScript types are erased at runtime. Your API can still receive invalid data from external callers. Always validate at runtime — types are for DX, not security."

### Key moments
- 0:30 — "Typing the full stack"
- 2:30 — "Request body validation"
- 5:00 — "Shared types"
- 7:00 — "Typed product API"
- 8:30 — "Runtime validation still needed"

### Callout graphics
- Type flow: shared interface → API route → client
- Request validation pattern
- Types vs runtime validation

### Outro (30 seconds)
"Shared types give you end-to-end type safety. Next lesson: form actions — the SvelteKit way to handle form submissions."

---

## Lesson 10.3 — Form actions — +page.server.ts and the actions export

**Duration:** 12 minutes
**Screen setup:** Editor with form action and page component, browser showing form submission

### Hook (30 seconds)
"HTML forms have worked since 1993. They work without JavaScript. SvelteKit's form actions build on this foundation: your form submits to a server function, the server processes it, and the page updates. Progressive enhancement that works even when JavaScript fails."

### Demo sequence
1. **[0:30-3:00] Default action** — Create a form with `method="POST"` and a default action in `+page.server.ts`. Submit it. Show the server processing.
2. **[3:00-5:30] Returning data** — Return success/failure data from the action. Access it in the page via `form` prop.
3. **[5:30-8:00] The form lifecycle** — Submission → server action → return data → page re-renders with result. Show the full cycle.
4. **[8:00-10:00] Build the mini-build** — Guestbook: form to add an entry, action to save it, page displays all entries.
5. **[10:00-11:30] Edge case / gotcha** — "Form actions only work with `method='POST'`. GET forms do not trigger actions — they are handled by load functions via URL search params."

### Key moments
- 0:30 — "Forms since 1993"
- 3:00 — "Returning data from actions"
- 5:30 — "The form lifecycle"
- 8:00 — "Guestbook mini-build"
- 10:00 — "POST only"

### Callout graphics
- Form action lifecycle diagram
- Data flow: form → action → page
- Progressive enhancement layers

### Outro (30 seconds)
"Form actions give you server-side form processing with progressive enhancement. Next lesson: named actions for multiple forms on one page."

---

## Lesson 10.4 — Named actions — multiple forms on one page

**Duration:** 10 minutes
**Screen setup:** Editor with multiple named actions, browser with two forms

### Hook (30 seconds)
"A settings page has a profile form and a password form. Both need server processing. But there is only one +page.server.ts. Named actions let you define multiple server handlers and route each form to the right one."

### Demo sequence
1. **[0:30-2:30] Named actions** — Export `actions` object with named functions: `{ updateProfile, changePassword }`. Each is a separate handler.
2. **[2:30-5:00] Form routing** — `<form method="POST" action="?/updateProfile">`. The `?/` syntax routes to the named action.
3. **[5:00-7:00] Independent results** — Each action returns its own data. Show how `form` data changes based on which form was submitted.
4. **[7:00-8:30] Build the mini-build** — Settings page with profile update and password change, each routed to a named action.
5. **[8:30-9:30] Edge case / gotcha** — "When using named actions, you cannot also have a default action. It is either all named or one default."

### Key moments
- 0:30 — "Multiple forms, one page"
- 2:30 — "?/ routing syntax"
- 5:00 — "Independent action results"
- 7:00 — "Settings page mini-build"
- 8:30 — "Named or default, not both"

### Callout graphics
- Named action routing diagram
- Multiple forms routing to different actions
- Action result data flow

### Outro (30 seconds)
"Named actions handle multiple forms cleanly. Next lesson: use:enhance for progressive enhancement."

---

## Lesson 10.5 — use:enhance — progressive enhancement

**Duration:** 11 minutes
**Screen setup:** Editor with enhanced form, browser showing the difference

### Hook (30 seconds)
"Your form works without JavaScript — that is the baseline. Now add `use:enhance` and the form submits without a page reload, shows pending states, and handles errors inline. Same form, upgraded UX, zero JavaScript framework lock-in."

### Demo sequence
1. **[0:30-2:30] Basic enhance** — Add `use:enhance` to a form. Submit it. Show: no page reload, data updates inline.
2. **[2:30-5:00] Custom enhance callback** — Pass a function to `use:enhance` for custom behavior: show loading state, handle errors, reset form.
3. **[5:00-7:30] Pending state** — Show how to display a spinner or disable the button during submission.
4. **[7:30-9:30] Build the mini-build** — Comment form with inline submission, loading indicator, and error handling.
5. **[9:30-10:30] Edge case / gotcha** — "use:enhance calls `update()` by default, which re-runs load functions and updates the page. If you provide a custom callback, you must call `update()` yourself or the page data will be stale."

### Key moments
- 0:30 — "Progressive enhancement"
- 2:30 — "Custom enhance callback"
- 5:00 — "Pending UI states"
- 7:30 — "Comment form mini-build"
- 9:30 — "The update() call"

### Callout graphics
- With and without enhance comparison
- Custom callback flow
- Pending state patterns

### Outro (30 seconds)
"use:enhance upgrades forms from page reloads to inline updates. Next lesson: server-side validation with ActionData."

---

## Lesson 10.6 — Server-side validation and ActionData

**Duration:** 11 minutes
**Screen setup:** Editor with validation logic, browser showing error messages

### Hook (30 seconds)
"Client-side validation is a nice-to-have. Server-side validation is a must-have. A malicious user can bypass your JavaScript. SvelteKit's ActionData sends validation errors back to the form, keeping the user's input intact."

### Demo sequence
1. **[0:30-2:30] Server validation** — Validate form fields in the action. Return `fail(400, { errors, values })` for invalid input.
2. **[2:30-5:00] ActionData in the page** — Access the returned errors via `form` prop. Display inline error messages next to each field.
3. **[5:00-7:30] Preserving input** — Return the submitted values so the form re-renders with the user's input, not empty fields.
4. **[7:30-9:30] Build the mini-build** — Registration form with email, password, and confirmation. Server validates all fields and returns specific errors.
5. **[9:30-10:30] Edge case / gotcha** — "ActionData is `null` on first page load and populated after a form submission. Always check for `null` before accessing error fields."

### Key moments
- 0:30 — "Server validation is mandatory"
- 2:30 — "ActionData for error display"
- 5:00 — "Preserving user input"
- 7:30 — "Registration form mini-build"
- 9:30 — "Null check on ActionData"

### Callout graphics
- Validation flow: form → server → errors → page
- fail() return shape
- Error display patterns

### Outro (30 seconds)
"Server-side validation with ActionData gives you secure, user-friendly error handling. Next lesson: environment variables in SvelteKit."

---

## Lesson 10.7 — Environment variables in SvelteKit

**Duration:** 10 minutes
**Screen setup:** Editor with .env file and SvelteKit env imports

### Hook (30 seconds)
"Your app needs API keys, database URLs, feature flags. Some are secrets. Some are public. SvelteKit's environment variable system ensures secrets never reach the client bundle — enforced at build time, not by convention."

### Demo sequence
1. **[0:30-2:30] The four env modules** — `$env/static/private`, `$env/static/public`, `$env/dynamic/private`, `$env/dynamic/public`. Explain each.
2. **[2:30-5:00] Static vs dynamic** — Static: inlined at build time, tree-shakeable. Dynamic: read at runtime, needed for per-request values.
3. **[5:00-7:00] Security enforcement** — Try importing `$env/static/private` in a client file. SvelteKit throws a build error. "This is not a convention — it is a compile-time guarantee."
4. **[7:00-8:30] Build the mini-build** — Page that displays public config and uses private API keys in the load function.
5. **[8:30-9:30] Edge case / gotcha** — "Variables with the `PUBLIC_` prefix are the only ones available via `$env/static/public`. The `VITE_` prefix also works (from Vite) but bypasses SvelteKit's explicit opt-in system."

### Key moments
- 0:30 — "Secrets vs public config"
- 2:30 — "Static vs dynamic"
- 5:00 — "Compile-time security"
- 7:00 — "Config display mini-build"
- 8:30 — "PUBLIC_ vs VITE_ prefix"

### Callout graphics
- Four env modules comparison table
- Static vs dynamic decision tree
- Build-time security enforcement

### Outro (30 seconds)
"SvelteKit's env system protects your secrets at build time. Last lesson: file uploads via form actions."

---

## Lesson 10.8 — File uploads via form actions

**Duration:** 11 minutes
**Screen setup:** Editor with file upload form and action, browser showing upload

### Hook (30 seconds)
"Users upload avatars, resumes, images. HTML file inputs give you a File object in the browser. Form actions give you that same File on the server — processed, validated, and stored without a third-party upload library."

### Demo sequence
1. **[0:30-2:30] File input basics** — `<input type="file">` in a form with `enctype="multipart/form-data"`. Access the file in the action via `request.formData()`.
2. **[2:30-5:00] Server-side validation** — Check file size, MIME type, and extension on the server. Return errors for invalid files.
3. **[5:00-7:30] Saving the file** — Write the file to disk or upload to cloud storage (S3, Cloudflare R2). Show the full pipeline.
4. **[7:30-9:30] Build the mini-build** — Image upload with preview, validation, and success confirmation.
5. **[9:30-10:30] Edge case / gotcha** — "Large files can exhaust server memory if loaded entirely into a buffer. For production, stream directly to storage instead of buffering the entire file."

### Key moments
- 0:30 — "File uploads with forms"
- 2:30 — "Server-side file validation"
- 5:00 — "Storage pipeline"
- 7:30 — "Image upload mini-build"
- 9:30 — "Memory and streaming"

### Callout graphics
- File upload data flow
- Validation checklist
- Buffering vs streaming diagram

### Outro (30 seconds)
"File uploads via form actions give you a complete server-side file pipeline. Module 10 is complete — you can now build API endpoints, handle forms, validate data, and process file uploads in SvelteKit."

---
