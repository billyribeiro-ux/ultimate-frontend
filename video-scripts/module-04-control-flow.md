# Module 4 — Control Flow: Video Lecture Script Outlines

> **Recording note:** Set editor font to 18px minimum. Keep browser preview visible for all lessons. Use slow, deliberate typing when demonstrating control flow blocks to show the template syntax clearly.

---

## Lesson 4.1 — {#if}: conditional rendering and JS boolean logic

**Duration:** 11 minutes
**Screen setup:** Editor with `.svelte` file, browser preview showing toggling content

### Hook (30 seconds)
"A user is logged in — show the dashboard. Logged out — show the login form. A cart is empty — show 'Your cart is empty'. Not empty — show the items. Every app is built on conditions, and `{#if}` is how Svelte decides what to render. But the real skill is understanding the JavaScript boolean logic underneath."

### Demo sequence
1. **[0:30-2:30] Show the problem** — In vanilla JS: `if (loggedIn) container.innerHTML = dashboardHTML; else container.innerHTML = loginHTML`. "Manual DOM swapping. Fragile, imperative, and loses component state every time."
2. **[2:30-5:00] Introduce {#if}** — Write `{#if loggedIn}<Dashboard />{/if}`. Toggle `loggedIn` — component mounts/unmounts. Show that the DOM element is completely removed, not hidden. "This is NOT `display: none`. The component doesn't exist in the DOM when the condition is false. Resources are freed, effects are cleaned up."
3. **[5:00-7:30] JS boolean logic** — Explain truthy/falsy: `0`, `''`, `null`, `undefined`, `NaN` are falsy. Everything else is truthy. Show common patterns: `{#if items.length}` (truthy if non-empty), `{#if user?.name}` (optional chaining + truthy). "Know your truthiness. Svelte doesn't have special template booleans — it's plain JavaScript."
4. **[7:30-9:30] Build the mini-build** — Create a feature flag system: `{#if features.darkMode}` shows a theme toggle. `{#if features.notifications}` shows a bell icon. Each feature independently conditional. Show toggling features on and off.
5. **[9:30-10:30] Edge case / gotcha** — "`{#if array}` is ALWAYS true — even for an empty array, because arrays are objects and objects are truthy. You want `{#if array.length}`. This catches people coming from Python where empty lists are falsy."

### Key moments (timestamps the editor should chapter-mark)
- 0:30 — "Every app runs on conditions"
- 2:30 — "{#if} removes, not hides"
- 5:00 — "JavaScript truthy/falsy rules"
- 7:30 — "Feature flag system"
- 9:30 — "The empty array trap"

### Callout graphics
- Truthy/falsy reference table
- DOM comparison: {#if} vs CSS display:none
- Feature flag component diagram

### Outro (30 seconds)
"The `{#if}` block conditionally renders entire sections of your UI. But most real conditions have more than two branches. Next lesson: `{:else if}` and `{:else}` for multi-branch logic."

---

## Lesson 4.2 — {:else if} and {:else}: multi-branch logic

**Duration:** 10 minutes
**Screen setup:** Editor with `.svelte` file, browser showing status indicators

### Hook (30 seconds)
"Your order status can be 'pending', 'processing', 'shipped', or 'delivered'. Four states, four different UIs. Nesting `{#if}` blocks inside each other turns your template into a pyramid of doom. `{:else if}` keeps it flat, readable, and maintainable."

### Demo sequence
1. **[0:30-2:00] Show the problem** — Nested `{#if}` blocks: three levels deep, indentation creeping right. "This is the if-else pyramid. Each branch adds indentation. By the fourth condition, you're reading code sideways."
2. **[2:00-5:00] Flatten with {:else if}** — Rewrite: `{#if status === 'pending'}...{:else if status === 'processing'}...{:else if status === 'shipped'}...{:else}...{/if}`. Show all four states rendering correctly. "Flat, sequential, readable. Each branch is at the same indentation level."
3. **[5:00-7:30] The {:else} catch-all** — Show that `{:else}` handles any unmatched case. Use it for error states or fallback content. Show what happens without `{:else}` when status is unexpected: nothing renders. "Always have a fallback. `{:else}` is your safety net for values you didn't anticipate."
4. **[7:30-8:30] DevTools verification** — Toggle through each status value. Show the DOM changing: old elements removed, new elements inserted. "Each branch completely replaces the previous one. No hidden elements stacking up in the DOM."
5. **[8:30-9:30] Edge case / gotcha** — "Type narrowing works inside branches. If you check `{#if user}`, TypeScript knows `user` is non-null inside that block. If you check `{:else}`, TypeScript knows `user` is `null | undefined`. Use this for safe access without `!` assertions."

### Key moments (timestamps the editor should chapter-mark)
- 0:30 — "The multi-state problem"
- 2:00 — "{:else if} keeps it flat"
- 5:00 — "The {:else} safety net"
- 7:30 — "DOM replacement in action"
- 8:30 — "TypeScript narrowing in branches"

### Callout graphics
- Before/after: nested {#if} vs flat {:else if}
- Status indicator component showing all four states
- TypeScript narrowing diagram inside conditional blocks

### Outro (30 seconds)
"Multi-branch conditions with `{:else if}` keep your templates flat and readable. Next lesson, we iterate: `{#each}` turns arrays into rendered lists, and you'll learn the JavaScript destructuring that makes it clean."

---

## Lesson 4.3 — {#each}: array iteration and destructuring

**Duration:** 12 minutes
**Screen setup:** Editor with `.svelte` file, browser showing a rendered list

### Hook (30 seconds)
"You have an array of 50 products. You need to render a card for each one. In vanilla JavaScript, that's a `for` loop, `createElement`, `appendChild`, and about 30 lines of code. In Svelte, it's `{#each products as product}` — four words, and every card renders itself."

### Demo sequence
1. **[0:30-2:30] Show the problem** — Vanilla JS: `products.forEach(p => { const div = document.createElement('div'); ... container.appendChild(div); })`. "Imperative DOM construction. No one wants to write this. No one wants to read this."
2. **[2:30-5:00] Introduce {#each}** — Write `{#each products as product}<Card title={product.name} />{/each}`. Show 50 cards rendering. Change the array — cards update. "Declarative iteration. One line to iterate, one line to render."
3. **[5:00-7:30] Destructuring** — Replace `product` with `{ name, price, image }` directly in the `as` clause. Use `{name}` instead of `{product.name}`. Add the index: `{#each products as { name, price }, i}`. "Destructuring in the each clause. Less typing, more readable. The optional second parameter is the index."
4. **[7:30-10:00] Build the mini-build** — Build a product grid: `{#each}` over products, destructure name/price/image, use the index for alternating row colors. Add an empty-state: `{:else}<p>No products found.</p>`. "The `{:else}` block on `{#each}` handles empty arrays. No separate `{#if}` needed."
5. **[10:00-11:30] Edge case / gotcha** — "Mutating the array source while iterating can cause unexpected behavior. If you filter and reassign in a handler, the `{#each}` block re-runs with the new array. But if you splice inside an effect that reads the array, you might trigger infinite reactivity. Keep mutations in event handlers, not effects."

### Key moments (timestamps the editor should chapter-mark)
- 0:30 — "50 products, one line"
- 2:30 — "Declarative iteration with {#each}"
- 5:00 — "Destructuring in the as clause"
- 7:30 — "Product grid with empty state"
- 10:00 — "Array mutation timing"

### Callout graphics
- Comparison: imperative forEach vs declarative {#each}
- Destructuring syntax diagram in {#each}
- Empty state with {:else} on {#each}

### Outro (30 seconds)
"Iterating arrays with `{#each}` is one of the most-used patterns in Svelte. But there's a critical detail we skipped: keys. Next lesson explains why `{#each}` without keys can cause subtle, devastating bugs."

---

## Lesson 4.4 — {#each} with keys: why keys matter

**Duration:** 12 minutes
**Screen setup:** Editor with `.svelte` file, browser showing a sortable list with input fields

### Hook (30 seconds)
"Sort a list of items. Each item has an input field the user typed in. After sorting, the input values are attached to the WRONG items. The text didn't move with its item. This is the keyed-list bug, and it's been biting developers since React introduced it in 2013. Svelte has the same requirement — and the same fix."

### Demo sequence
1. **[0:30-3:00] Show the problem** — Create a list of items with input fields, no keys. Type values into the inputs. Sort the list. Show that the input values stay in place while the items move — mismatched. "The DOM nodes stayed. The data moved. Without keys, Svelte reuses DOM nodes by position, not identity."
2. **[3:00-5:30] Add keys** — Change to `{#each items as item (item.id)}`. Sort again — input values now move with their items. "The parenthesized expression `(item.id)` tells Svelte: this item IS its id. When the list reorders, Svelte moves the DOM nodes instead of reusing them."
3. **[5:30-8:00] What makes a good key** — Show: database IDs (good), UUIDs (good), index (bad — it changes on reorder), stringified objects (bad — expensive and fragile). "Keys must be unique and stable. If two items have the same key, Svelte can't tell them apart."
4. **[8:00-10:00] DevTools verification** — Open Elements panel. Sort the list WITH keys — watch DOM nodes move (flashing in DevTools). Sort WITHOUT keys — watch DOM nodes stay put while text content changes. "DevTools proves it: keyed lists move elements, unkeyed lists mutate in place."
5. **[10:00-11:30] Edge case / gotcha** — "If your items don't have IDs, generate them on creation — `crypto.randomUUID()`. Don't use array index as a key. It's the default behavior anyway, and it's what causes the bug. If you explicitly write `(i)` as the key, you've just opted into the broken behavior with more typing."

### Key moments (timestamps the editor should chapter-mark)
- 0:30 — "The input value mismatch bug"
- 3:00 — "Keys fix the identity problem"
- 5:30 — "Good keys vs bad keys"
- 8:00 — "DevTools proof: move vs mutate"
- 10:00 — "Never use index as key"

### Callout graphics
- Animation: unkeyed reorder (DOM stays, data moves) vs keyed (DOM moves with data)
- Good key vs bad key reference table
- DevTools screenshot showing element reorder highlighting

### Outro (30 seconds)
"Keys bind DOM nodes to data identity. Always key your `{#each}` blocks when items can reorder, be added, or be removed. Next lesson: nested `{#each}` for iterating over data within data — the pattern behind every table, nested menu, and category-product list."

---

## Lesson 4.5 — Nested {#each}: iterating nested data

**Duration:** 11 minutes
**Screen setup:** Editor with `.svelte` file, browser showing a categorized product list

### Hook (30 seconds)
"Categories with products. Departments with employees. Folders with files. Real data is nested, and your templates need to match that structure. Nested `{#each}` blocks let you iterate over data within data — and the trick is keeping it readable."

### Demo sequence
1. **[0:30-2:30] Show the data structure** — Display a JSON structure: `categories: [{ name: 'Electronics', products: [...] }, { name: 'Books', products: [...] }]`. "Two levels of arrays. The outer array is categories. Each category contains an inner array of products."
2. **[2:30-5:00] Nested iteration** — Write `{#each categories as category}{#each category.products as product}...{/each}{/each}`. Show the rendered output: category headers with product lists underneath. "Outer loop renders the category. Inner loop renders its products. Each level has its own `as` variable."
3. **[5:00-7:30] Keys at both levels** — Add keys: `(category.id)` on the outer loop, `(product.id)` on the inner loop. Explain why both levels need keys. "If categories reorder, the outer key handles it. If products within a category reorder, the inner key handles it."
4. **[7:30-9:30] Build the mini-build** — Build a FAQ page: `{#each sections as section (section.id)}` renders section headings. `{#each section.questions as question (question.id)}` renders question/answer pairs. Add accordion behavior for the questions. "Real-world nested data, rendered with nested iteration, interactive with state."
5. **[9:30-10:30] Edge case / gotcha** — "Watch your variable names. `{#each items as item}{#each item.children as item}` shadows the outer `item`. Use distinct names: `parent`, `child`, or descriptive names like `category`, `product`. Shadowing causes subtle bugs where you reference the wrong level."

### Key moments (timestamps the editor should chapter-mark)
- 0:30 — "Real data is nested"
- 2:30 — "Nested {#each} blocks"
- 5:00 — "Keys at every level"
- 7:30 — "FAQ accordion mini-build"
- 9:30 — "Variable shadowing trap"

### Callout graphics
- Nested data structure visualization
- Nested {#each} with labeled scope boundaries
- FAQ component tree diagram

### Outro (30 seconds)
"Nested `{#each}` handles hierarchical data naturally. Next lesson: `{#key}` — a powerful block that forces entire subtrees to rebuild when a value changes, useful for animations and component resets."

---

## Lesson 4.6 — {#key}: forcing a subtree to rebuild

**Duration:** 10 minutes
**Screen setup:** Editor with `.svelte` file, browser showing transition animations

### Hook (30 seconds)
"You navigate between user profiles. The URL changes from `/user/1` to `/user/2`. But the component doesn't remount — it just updates its props. The enter animation doesn't replay. The form doesn't reset. The scroll position stays. `{#key}` fixes all of this by destroying and recreating the entire subtree."

### Demo sequence
1. **[0:30-2:30] Show the problem** — A profile component that transitions in on mount. Navigate between profiles — the transition only plays on the first load. "Svelte is smart. Same component, different props — it reuses the instance. But sometimes you WANT a fresh start."
2. **[2:30-5:00] Introduce {#key}** — Wrap with `{#key userId}<Profile {user} />{/key}`. Navigate between users — the component destroys and recreates on every userId change. Transition plays every time. "When the key expression changes, Svelte tears down the entire content and rebuilds it from scratch."
3. **[5:00-7:30] Use cases** — Show three: (1) replaying enter animations on data change, (2) resetting form state when switching between 'edit user A' and 'edit user B', (3) forcing a third-party component to reinitialize. "Key blocks are the nuclear option. Use them when you need a completely fresh component instance."
4. **[7:30-8:30] DevTools verification** — Watch the Elements panel. On key change, the entire subtree is removed and re-inserted. "Complete DOM teardown and rebuild. Every `$effect` cleanup runs. Every `$state` resets to initial values."
5. **[8:30-9:30] Edge case / gotcha** — "`{#key}` destroys ALL state in the subtree. If a child component has unsaved form data, it's gone. Use `{#key}` deliberately — it's the right tool for animations and resets, but the wrong tool when you want to preserve state."

### Key moments (timestamps the editor should chapter-mark)
- 0:30 — "The stale component problem"
- 2:30 — "{#key} — the rebuild trigger"
- 5:00 — "Three real use cases"
- 7:30 — "DOM teardown proof"
- 8:30 — "The state loss warning"

### Callout graphics
- Lifecycle diagram: key change -> destroy subtree -> create fresh subtree
- Three use cases illustrated side by side
- Warning: unsaved state is lost

### Outro (30 seconds)
"The `{#key}` block is your reset button for subtrees. Use it for animations, form resets, and forced re-initialization. Next lesson, we leave the template and dive into JavaScript's async model — Promises and async/await."

---

## Lesson 4.7 — Promises and async/await: the JavaScript async model

**Duration:** 13 minutes
**Screen setup:** Editor with `.ts` file, browser Console open for promise demonstrations

### Hook (30 seconds)
"You call an API. The response takes 800 milliseconds. Does JavaScript freeze for 800 milliseconds? No — it fires the request, moves on, and comes back when the response arrives. This is asynchronous programming, and if you don't understand Promises, every `fetch` call, every database query, every file read in this course will confuse you."

### Demo sequence
1. **[0:30-3:00] Show the problem** — Write a synchronous simulation: `const data = fetch('/api')`. Log `data` — it's a Promise, not the data. "JavaScript doesn't wait. `fetch` returns immediately with a Promise — a placeholder for a future value."
2. **[3:00-6:00] Promises explained** — Diagram: Promise states — pending, fulfilled, rejected. Show `.then()` and `.catch()`: `fetch('/api').then(res => res.json()).then(data => console.log(data)).catch(err => console.error(err))`. "A Promise is a state machine. It starts pending, then resolves or rejects. `.then()` handles success, `.catch()` handles failure."
3. **[6:00-9:00] async/await** — Rewrite with async/await: `const res = await fetch('/api'); const data = await res.json()`. Show it reads like synchronous code but runs asynchronously. Wrap in a try/catch for error handling. "Async/await is sugar over Promises. Same behavior, cleaner syntax. Every `await` pauses the function — not the browser — until the Promise resolves."
4. **[9:00-11:00] Build the mini-build** — Create a function that fetches a user, then fetches their posts, then fetches comments on the first post. Show the sequential await pattern. Then show `Promise.all` for parallel fetching. "Sequential when each step depends on the previous. Parallel when they're independent."
5. **[11:00-12:30] Edge case / gotcha** — "`await` only pauses inside an `async` function. At the top level of a `<script>` block, you can't use `await` directly (in most contexts). Use an `$effect` or a load function to trigger async work. We'll see both patterns in the next lessons."

### Key moments (timestamps the editor should chapter-mark)
- 0:30 — "Why JavaScript doesn't wait"
- 3:00 — "The Promise state machine"
- 6:00 — "async/await — cleaner syntax"
- 9:00 — "Sequential vs parallel async"
- 11:00 — "Where you can use await"

### Callout graphics
- Promise state diagram: pending -> fulfilled/rejected
- .then() chain vs async/await comparison
- Sequential vs Promise.all data flow diagram

### Outro (30 seconds)
"Promises and async/await are the foundation of every network request in your app. Next lesson, Svelte takes over: `{#await}` handles loading, success, and error states directly in your template — no manual state management required."

---

## Lesson 4.8 — {#await}: Svelte's built-in async handling

**Duration:** 12 minutes
**Screen setup:** Editor with `.svelte` file, browser showing loading/data/error states

### Hook (30 seconds)
"Loading spinner... data appears... network fails... error message. Every async operation has three states: pending, resolved, rejected. Most frameworks make you manage these with three separate boolean flags. Svelte's `{#await}` block handles all three declaratively, in one template construct."

### Demo sequence
1. **[0:30-2:30] Show the problem** — Manual approach: `let loading = true; let data = null; let error = null;` plus an effect that fetches and sets all three. `{#if loading}...{:else if error}...{:else}...{/if}`. "Three state variables for one async operation. And you have to reset all three when the user retries."
2. **[2:30-5:30] Introduce {#await}** — Write `{#await fetchUsers()}<p>Loading...</p>{:then users}<UserList {users} />{:catch error}<p>{error.message}</p>{/await}`. Show all three states rendering as the promise progresses. "One block. Three states. Zero state variables. The promise IS the state."
3. **[5:30-8:00] Shorthand forms** — Show `{#await promise then data}` — skips the loading state (waits silently). Show `{#await promise}...{:then data}...{/await}` — skips the error state. "Choose the form that matches your UX. Sometimes you want a loading indicator. Sometimes you don't."
4. **[8:00-10:00] Build the mini-build** — Build a user profile page: `{#await loadUser(userId)}` shows a skeleton loader, `{:then user}` shows the profile, `{:catch}` shows a retry button that reassigns the promise. Show the retry pattern: `promise = loadUser(userId)`. "Reassigning the promise restarts the `{#await}` block from the loading state. Built-in retry with one line."
5. **[10:00-11:30] Edge case / gotcha** — "If `fetchUsers()` is called directly in the template, it re-runs on every render. Assign the promise to a variable first: `let promise = fetchUsers()`. Then use `{#await promise}`. Otherwise you'll fire a new request on every re-render."

### Key moments (timestamps the editor should chapter-mark)
- 0:30 — "Three states, three variables?"
- 2:30 — "{#await} — one block, three states"
- 5:30 — "Shorthand forms"
- 8:00 — "Profile page with retry"
- 10:00 — "The re-render request storm"

### Callout graphics
- Three-state diagram: loading -> data -> error
- {#await} block syntax with labeled sections
- Retry pattern diagram: button click -> reassign promise -> {#await} restarts

### Outro (30 seconds)
"The `{#await}` block is Svelte's declarative answer to async state management. Next lesson, we handle the unhappy path: error handling with `{:catch}` and JavaScript's `try/catch`."

---

## Lesson 4.9 — Error handling with {:catch} and try/catch

**Duration:** 11 minutes
**Screen setup:** Editor with `.svelte` file, browser showing error states, Network tab with failed requests

### Hook (30 seconds)
"Your API returns a 500. Your JSON is malformed. The network drops. Your user sees... nothing. Or worse, a broken half-rendered page. Error handling is not optional — it's the difference between a professional app and a prototype."

### Demo sequence
1. **[0:30-2:30] Show the problem** — Fetch data without error handling. Simulate a network failure. Show the blank page / unhandled rejection in console. "No error handling = no UI feedback. The user doesn't know what happened. They can't recover."
2. **[2:30-5:00] {:catch} in {#await}** — Add `{:catch error}<div class="error"><p>{error.message}</p><button onclick={retry}>Try again</button></div>{/await}`. Simulate failure — error UI appears. Click retry — loading state, then success. "The `{:catch}` block catches any rejection from the promise. You get the error object, you render helpful UI."
3. **[5:00-7:30] try/catch in async functions** — Show `try { const res = await fetch(...); if (!res.ok) throw new Error(res.statusText); } catch (e) { ... }`. Explain: fetch doesn't throw on HTTP errors — only on network failures. You must check `res.ok`. "The #1 fetch mistake: assuming `fetch` throws on 404 or 500. It doesn't. Only network errors throw."
4. **[7:30-9:30] Build the mini-build** — Create a data fetcher with three error scenarios: network failure (no internet), 404 (wrong URL), 500 (server crash). Handle each differently in the catch block. Show user-friendly error messages for each case. "Different errors deserve different messages. 'Check your internet' for network errors. 'Item not found' for 404. 'Server error, try later' for 500."
5. **[9:30-10:30] Edge case / gotcha** — "Errors in `$effect` are silent by default — they log to the console but don't crash the component. Use `<svelte:boundary>` (Module 12) to catch component-level errors. For now, always wrap async code in try/catch."

### Key moments (timestamps the editor should chapter-mark)
- 0:30 — "The blank-page failure"
- 2:30 — "{:catch} for template-level errors"
- 5:00 — "try/catch and the fetch(ok) trap"
- 7:30 — "Differentiated error handling"
- 9:30 — "Silent $effect errors"

### Callout graphics
- Error handling flow: request -> response check -> try/catch -> user feedback
- fetch() does NOT throw on 4xx/5xx — diagram
- Three error types with different user messages

### Outro (30 seconds)
"Error handling turns crashes into recovery opportunities. Handle network errors, HTTP errors, and parse errors separately. Last lesson of this module: TypeScript with async — typing Promises and return values."

---

## Lesson 4.10 — TypeScript with async: Promise<T> return types

**Duration:** 10 minutes
**Screen setup:** Editor with `.ts` file, TypeScript error panel visible

### Hook (30 seconds)
"Your async function fetches a user and returns... what? TypeScript says `Promise<any>`. That means every consumer of this function gets zero type checking on the result. One explicit return type — `Promise<User>` — and suddenly every `.then()`, every `await`, every `{:then}` block knows exactly what data it's working with."

### Demo sequence
1. **[0:30-2:30] Show the problem** — Async function without return type: `async function fetchUser(id: string) { ... }`. Hover over it — TypeScript shows `Promise<any>`. The caller gets no type help. "Any means anything. Any means nothing. You lose all safety."
2. **[2:30-5:00] Add the return type** — `async function fetchUser(id: string): Promise<User> { ... }`. Now the caller gets full `User` type after `await`. IntelliSense shows all User properties. "One annotation on the function. Full type safety for every consumer."
3. **[5:00-7:00] Generic fetch wrapper** — Build a typed fetch helper: `async function api<T>(url: string): Promise<T>`. Use it: `const user = await api<User>('/api/user/1')`. "A generic API wrapper. Specify the expected response type at the call site. TypeScript carries it through."
4. **[7:00-8:30] Error types** — Show that `catch` gives `unknown` by default. Narrow with `if (error instanceof Error)`. Create a custom `ApiError` class with `status` and `message`. "Type your errors too. `catch (e: unknown)` forces you to narrow before accessing properties."
5. **[8:30-9:30] Edge case / gotcha** — "If your API returns a different shape than your TypeScript type, TypeScript won't catch it at runtime — it trusts your type assertion. Use a validation library like Valibot or Zod at the boundary to ensure runtime data matches the compile-time type."

### Key moments (timestamps the editor should chapter-mark)
- 0:30 — "The Promise<any> problem"
- 2:30 — "Explicit Promise<T> return types"
- 5:00 — "Generic fetch wrapper"
- 7:00 — "Typing catch blocks"
- 8:30 — "Runtime vs compile-time type safety"

### Callout graphics
- Type flow diagram: function return type -> await -> variable type
- Generic api<T> function signature with labeled parts
- Compile-time vs runtime type checking comparison

### Outro (30 seconds)
"Typed async functions give you end-to-end type safety from API call to template rendering. Module 4 is complete — you can now conditionally render, iterate, handle async data, and type it all. Module 5 introduces events: responding to user interaction."

---
