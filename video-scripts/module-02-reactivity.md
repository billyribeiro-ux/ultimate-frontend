# Module 2 — Reactivity: Video Lecture Script Outlines

> **Recording note:** Set editor font to 18px minimum. Use a dark theme with high contrast. Keep browser DevTools Console open for reactive value logging. Terminal font 16px.

---

## Lesson 2.1 — What state is and why it exists

**Duration:** 11 minutes
**Screen setup:** Split-screen: editor (left), browser with a counter app (right)

### Hook (30 seconds)
"Click a button. A number goes up. Click again. It goes up again. Trivial, right? Except that number lives in JavaScript memory, the screen shows HTML pixels, and somehow they need to stay in sync — forever, instantly, without you manually calling `document.querySelector` every time. That 'somehow' is state management, and it's the hardest problem in frontend."

### Demo sequence
1. **[0:30-2:30] Show the problem** — Write vanilla JS: `let count = 0; button.onclick = () => { count++; span.textContent = count; }`. "This works. But you're the sync engine. Forget one `.textContent` update and your UI lies to the user. Now imagine 50 variables across 30 components."
2. **[2:30-5:00] Define state** — Diagram overlay: "State = any data that, when it changes, should cause the UI to update." Walk through examples: a counter, a user's name, a list of todos, whether a modal is open. "If changing it should change pixels on screen, it's state."
3. **[5:00-8:00] How Svelte tracks state** — Write `let count = $state(0)` in a `.svelte` file. Show the markup: `<p>{count}</p>`. Add a button that increments. Click it — the number updates. "You declared the state. You changed it with plain JavaScript. Svelte handled the rest. No `.textContent`. No virtual DOM diffing. The compiler wired it up at build time."
4. **[8:00-10:00] The mental model** — B-roll diagram: "Signal graph." Show a `$state` node connected to DOM nodes that read it. "When `count` changes, Svelte knows exactly which DOM nodes read `count` and updates only those. Not the whole page. Not the whole component. Just the specific text node."
5. **[10:00-10:30] Edge case / gotcha** — "State without `$state` is just a plain variable. `let count = 0` in Svelte 5 is NOT reactive. The template won't update when you change it. If your UI isn't updating, check: did you forget `$state()`?"

### Key moments (timestamps the editor should chapter-mark)
- 0:30 — "The manual sync problem"
- 2:30 — "Defining state"
- 5:00 — "Your first $state"
- 8:00 — "The signal graph mental model"
- 10:00 — "The #1 reactivity mistake"

### Callout graphics
- Diagram: vanilla JS manual DOM sync vs Svelte automatic sync
- Signal graph: $state node -> DOM text nodes
- Comparison: `let count = 0` vs `let count = $state(0)`

### Outro (30 seconds)
"State is the bridge between your data and your UI. `$state()` is how you declare it in Svelte 5. Next lesson, we explore `$state` with every primitive type — strings, numbers, booleans — and see exactly how the compiler tracks each change."

---

## Lesson 2.2 — `$state` with primitive types

**Duration:** 11 minutes
**Screen setup:** Editor with `.svelte` file, browser preview, DevTools Console open

### Hook (30 seconds)
"A string changes. A number increments. A boolean flips. These three operations power 80% of every UI you've ever used. Svelte's `$state` rune makes each one reactive in a single function call — but understanding what 'reactive' actually means under the hood separates beginners from professionals."

### Demo sequence
1. **[0:30-2:30] Show the problem** — Write three plain variables: `let name = 'Ada'`, `let count = 0`, `let active = false`. Reference all three in markup. Change them in a button handler — nothing updates. "Plain variables are invisible to Svelte's reactivity system. The template rendered once and moved on."
2. **[2:30-5:00] Convert to $state** — Wrap each: `let name = $state('Ada')`, `let count = $state(0)`, `let active = $state(false)`. Same button handler, same changes — now the UI updates instantly. "One function call. That's all it takes. `$state` tells the compiler: track this, and update anything that reads it."
3. **[5:00-7:30] Reassignment is the trigger** — Show that `count++` works (sugar for `count = count + 1`). Show `name = 'Grace'` works. Show that `count` without reassignment (just reading) doesn't trigger anything. "Reactivity fires on assignment. `count = count + 1` triggers. `someFunction(count)` does not trigger an update — it just reads."
4. **[7:30-9:30] DevTools verification** — Add `$effect(() => console.log('count is', count))` to show reactive tracking in the console. Click the button — see the log fire. "This `$effect` is a sneak preview from Lesson 2.9. For now, just notice: Svelte knows exactly when `count` changes and can run code in response."
5. **[9:30-10:30] Edge case / gotcha** — "`$state` returns the value, not a wrapper object. `typeof count` is `'number'`, not `'object'`. You can pass it to any function that expects a number. This is NOT like React's `useState` which returns an array — it's a transparent proxy for primitives."

### Key moments (timestamps the editor should chapter-mark)
- 0:30 — "Why plain variables fail"
- 2:30 — "Wrapping with $state"
- 5:00 — "Assignment triggers reactivity"
- 7:30 — "Proving it in DevTools"
- 9:30 — "$state is NOT a wrapper"

### Callout graphics
- Side-by-side: plain variable vs $state variable behavior
- Diagram: reassignment -> compiler notification -> DOM update
- Comparison table: Svelte $state vs React useState

### Outro (30 seconds)
"Primitives with `$state` give you reactive strings, numbers, and booleans. But most real-world data lives in objects. Next lesson, we tackle `$state` with objects — and discover that Svelte makes the entire object deeply reactive by default."

---

## Lesson 2.3 — `$state` with objects

**Duration:** 12 minutes
**Screen setup:** Editor with `.svelte` file, browser preview, Console open for logging

### Hook (30 seconds)
"You have a user object with name, email, and settings. You change `user.settings.theme` from 'light' to 'dark'. In React, you'd need to spread the entire object into a new reference. In Svelte, you just... change it. The property mutation triggers a UI update. Here's why that works and when it doesn't."

### Demo sequence
1. **[0:30-2:30] Show the problem** — In React pseudocode, show the spread pattern: `setUser({ ...user, settings: { ...user.settings, theme: 'dark' } })`. "Three levels of spreading for one property change. This is immutable update boilerplate. Svelte doesn't require it."
2. **[2:30-5:30] Deep reactivity** — Create `let user = $state({ name: 'Ada', settings: { theme: 'light' } })`. In markup, show `{user.settings.theme}`. Button that sets `user.settings.theme = 'dark'` — UI updates. "Svelte wraps the object in a deep reactive proxy. Mutate any nested property, at any depth, and the UI updates."
3. **[5:30-8:00] Adding and removing properties** — Show `user.age = 30` — UI can read it. Show `delete user.age` — it disappears. "The proxy intercepts property addition and deletion too. This is JavaScript Proxy under the hood — the same mechanism Vue 3 uses."
4. **[8:00-10:00] DevTools verification** — Log `user` in the console — show it's a Proxy object. Use `$state.snapshot(user)` to get a plain object for logging. "When you `console.log` a `$state` object, you see the Proxy wrapper. Use `$state.snapshot()` when you need the raw data — we'll cover that in Lesson 2.6."
5. **[10:00-11:30] Edge case / gotcha** — "Deep reactivity has a cost. If you have an object with 10,000 properties — like a large dataset — wrapping it in `$state` creates 10,000 proxy traps. For large, read-heavy data, use `$state.raw()` instead. That's Lesson 2.5."

### Key moments (timestamps the editor should chapter-mark)
- 0:30 — "The immutable update tax"
- 2:30 — "Deep reactive objects"
- 5:30 — "Dynamic properties"
- 8:00 — "Inspecting proxies in DevTools"
- 10:00 — "When deep reactivity is too expensive"

### Callout graphics
- Comparison: React spread update vs Svelte direct mutation
- Diagram: Proxy wrapping nested object properties
- Console screenshot: Proxy object vs $state.snapshot output

### Outro (30 seconds)
"Svelte's deep reactivity means you can mutate objects naturally — no spreading, no immer, no boilerplate. Next lesson, we apply the same principle to arrays and discover how every JavaScript array method integrates with Svelte's reactivity."

---

## Lesson 2.4 — `$state` with arrays: JS array methods

**Duration:** 12 minutes
**Screen setup:** Editor with `.svelte` file showing a todo list, browser preview

### Hook (30 seconds)
"Push, pop, splice, filter, map — you already know these array methods from JavaScript. In React, half of them don't trigger re-renders because they mutate in place. In Svelte, every single one of them works reactively out of the box. Let me show you why."

### Demo sequence
1. **[0:30-2:30] Show the problem** — React pattern: `setItems([...items, newItem])` for push, `setItems(items.filter(i => i.id !== id))` for remove. "In React, you create a new array every time. Mutating methods like `.push()` and `.splice()` are forbidden because React compares references."
2. **[2:30-5:30] Mutating methods work** — Create `let todos = $state(['Buy milk', 'Write code'])`. Use `todos.push('Ship app')` — UI updates. Use `todos.splice(0, 1)` — first item removed, UI updates. Use `todos[1] = 'Deploy'` — index assignment works. "Svelte's proxy traps `.push()`, `.splice()`, index assignment — all of them trigger reactivity."
3. **[5:30-8:00] Non-mutating methods** — Show `todos.filter(t => t.includes('code'))` — returns a new array but doesn't change `todos`. To filter in place: `todos = todos.filter(...)`. Show `.map()`, `.sort()`, `.reverse()` — explain which mutate and which return new arrays. "Know your JS methods. Mutating methods trigger automatically. Non-mutating methods need reassignment."
4. **[8:00-10:00] Building the mini-build** — Build a simple todo list: input + button to add, click-to-remove, counter showing `{todos.length}`. Show all three operations working reactively. "A functional todo list in 15 lines of Svelte. No state library. No reducer. No dispatch."
5. **[10:00-11:30] Edge case / gotcha** — "`.sort()` and `.reverse()` mutate in place AND return the array. They trigger reactivity. But if you chain `.sort().reverse()` the intermediate state may flash in the UI. For complex transformations, build the final array and assign once: `todos = [...todos].sort().reverse()`."

### Key moments (timestamps the editor should chapter-mark)
- 0:30 — "React's immutable array tax"
- 2:30 — "Mutating methods just work"
- 5:30 — "Non-mutating methods need reassignment"
- 8:00 — "Building a reactive todo list"
- 10:00 — "The .sort() flash gotcha"

### Callout graphics
- Table: JS array methods — mutating vs non-mutating
- Code comparison: React array updates vs Svelte array updates
- Todo list component architecture diagram

### Outro (30 seconds)
"Arrays with `$state` give you the full power of JavaScript's array API with automatic reactivity. But sometimes deep reactivity is too much. Next lesson, we learn `$state.raw()` — for when you want reactivity on the reference but not the contents."

---

## Lesson 2.5 — `$state.raw()` — non-deep reactive state

**Duration:** 10 minutes
**Screen setup:** Editor with `.svelte` file, Performance tab in DevTools

### Hook (30 seconds)
"You just loaded 50,000 rows from an API. Wrapping them in `$state()` creates 50,000 proxy traps — one for every property of every object. Your app freezes for 200 milliseconds on load. `$state.raw()` gives you reactivity on the array reference without proxying every single element inside it."

### Demo sequence
1. **[0:30-2:30] Show the problem** — Create a large array: `let data = $state(Array.from({ length: 50000 }, (_, i) => ({ id: i, name: 'Item ' + i })))`. Show a performance measurement — proxy creation time. "Deep reactivity on 50K objects is expensive. Every property gets a trap. Most of the time, you're replacing the whole array, not mutating individual items."
2. **[2:30-5:00] Introduce $state.raw()** — Replace with `let data = $state.raw([...])`. Show the same performance measurement — significantly faster. Explain: "Raw state is reactive on reassignment only. `data = newArray` triggers. `data[0].name = 'changed'` does NOT trigger."
3. **[5:00-7:30] When to use raw** — Table overlay: use `$state()` for small objects you mutate frequently (form data, UI state). Use `$state.raw()` for large datasets you replace wholesale (API responses, search results, table data). "The decision is simple: do you mutate individual properties, or do you replace the whole thing?"
4. **[7:30-9:00] DevTools verification** — Log both types. `$state()` shows Proxy. `$state.raw()` shows a plain array/object. "Raw state is plain JavaScript. No proxy. You can pass it to any library that doesn't understand proxies — like a charting library or a WebGL renderer."
5. **[9:00-9:30] Edge case / gotcha** — "If you use `$state.raw()` and then try to mutate a nested property expecting the UI to update, nothing happens. No error, no warning — just silence. If your UI isn't updating, check whether you used raw when you meant deep."

### Key moments (timestamps the editor should chapter-mark)
- 0:30 — "The 50K proxy problem"
- 2:30 — "$state.raw() — reference-only reactivity"
- 5:00 — "When to use raw vs deep"
- 7:30 — "Proving the difference in DevTools"
- 9:00 — "The silent mutation trap"

### Callout graphics
- Performance comparison: $state vs $state.raw on large arrays
- Decision table: $state vs $state.raw criteria
- Diagram: proxy wrapping vs plain reference tracking

### Outro (30 seconds)
"Use `$state.raw()` for large, read-heavy datasets you replace wholesale. Use `$state()` for everything else. Next lesson, we learn `$state.snapshot()` — how to get a plain JavaScript copy of reactive state for serialization, logging, or sending to APIs."

---

## Lesson 2.6 — `$state.snapshot()` — serializing reactive state

**Duration:** 10 minutes
**Screen setup:** Editor with `.svelte` file, browser Console tab

### Hook (30 seconds)
"You need to send your reactive user object to an API. You call `JSON.stringify(user)`. It works — but you're stringifying a Proxy, and some edge cases produce unexpected output. `$state.snapshot()` gives you a clean, plain JavaScript copy — no proxies, no traps, no surprises."

### Demo sequence
1. **[0:30-2:30] Show the problem** — Create a `$state` object. `console.log(user)` — shows Proxy in console, hard to inspect. Try to use `structuredClone(user)` — may throw because Proxy objects aren't always cloneable. "Reactive state is wrapped. Sometimes you need to unwrap it."
2. **[2:30-5:00] Introduce $state.snapshot()** — Call `$state.snapshot(user)` — get a plain object. Log it — clean output. `JSON.stringify($state.snapshot(user))` — perfect JSON. "Snapshot strips all reactive wrappers and returns a deep clone of the current state."
3. **[5:00-7:00] Use cases** — Send to API: `fetch('/api', { body: JSON.stringify($state.snapshot(form)) })`. Store in localStorage: `localStorage.setItem('user', JSON.stringify($state.snapshot(user)))`. Pass to non-Svelte library. "Anytime you leave the Svelte world — APIs, storage, third-party libraries — snapshot first."
4. **[7:00-8:30] It's a snapshot, not a reference** — Change the original state after snapshotting. Show the snapshot doesn't change. "It's a deep clone at that point in time. The snapshot is frozen — changes to the original don't propagate."
5. **[8:30-9:30] Edge case / gotcha** — "Don't use `$state.snapshot()` inside reactive computations or `$derived`. It creates a new object every time, breaking reference equality checks. Snapshot is for output boundaries — API calls, logging, serialization — not for reactive pipelines."

### Key moments (timestamps the editor should chapter-mark)
- 0:30 — "The Proxy serialization problem"
- 2:30 — "Clean data with $state.snapshot()"
- 5:00 — "Three real use cases"
- 7:00 — "Snapshot is a frozen clone"
- 8:30 — "Where NOT to use snapshot"

### Callout graphics
- Console screenshot: Proxy vs snapshot output
- Data flow diagram: $state -> snapshot -> API/storage
- Warning callout: "Don't snapshot inside $derived"

### Outro (30 seconds)
"Snapshot gives you clean, serializable data from reactive state. With `$state`, `$state.raw`, and `$state.snapshot`, you control exactly how Svelte tracks and exposes your data. Next lesson, we build on state with `$derived` — computed values that update automatically."

---

## Lesson 2.7 — `$derived()` — pure functions introduced naturally

**Duration:** 12 minutes
**Screen setup:** Editor with `.svelte` file, browser showing a shopping cart

### Hook (30 seconds)
"You have a cart with items. Each item has a price and quantity. The total? It's `price * quantity`, summed across all items. You could recalculate it in every event handler. Or you could declare it once and let Svelte keep it in sync forever. That's `$derived` — computed state that never goes stale."

### Demo sequence
1. **[0:30-2:30] Show the problem** — Manual total calculation: update it in the 'add item' handler, the 'remove item' handler, the 'change quantity' handler. Forget one and the total is wrong. "Three places to update one value. Miss one, and your checkout page shows the wrong price. This is why derived state exists."
2. **[2:30-5:00] Introduce $derived** — Create `let items = $state([...])`. Create `let total = $derived(items.reduce((sum, item) => sum + item.price * item.qty, 0))`. Show the total updating automatically when items change. "One declaration. Zero manual updates. The expression re-runs whenever any `$state` it reads changes."
3. **[5:00-7:30] Pure functions** — Explain why `$derived` must be a pure expression — no side effects, no API calls, no DOM manipulation. "Svelte can re-run this expression at any time, as many times as needed. If it had side effects — like sending an email — you'd send emails on every keystroke. Side effects go in `$effect`, not `$derived`."
4. **[7:30-10:00] Build the mini-build** — Create a shopping cart: list of items with qty controls, derived `total`, derived `itemCount`, derived `isEmpty`. Show all three updating as items are added/removed. "Three derived values, all staying perfectly in sync with one source of truth."
5. **[10:00-11:30] Edge case / gotcha** — "`$derived` caches. If the inputs haven't changed, the expression doesn't re-run. But if your derived value reads a `$state` array and you push to it, the derived DOES re-run because the array proxy detects the mutation. Caching is based on reactive dependency tracking, not value comparison."

### Key moments (timestamps the editor should chapter-mark)
- 0:30 — "The stale total bug"
- 2:30 — "Declaring derived state"
- 5:00 — "Why purity matters"
- 7:30 — "Shopping cart with derived values"
- 10:00 — "How $derived caching works"

### Callout graphics
- Dependency graph: items -> total, items -> itemCount, items -> isEmpty
- Pure function diagram: inputs in, value out, no side effects
- Shopping cart component architecture

### Outro (30 seconds)
"Derived state is state you don't manage — it manages itself. For simple expressions, `$derived()` is all you need. But what about multi-line computations with intermediate variables? That's `$derived.by()`, next lesson."

---

## Lesson 2.8 — `$derived.by()` — complex derived computations

**Duration:** 11 minutes
**Screen setup:** Editor with `.svelte` file, browser showing a data dashboard

### Hook (30 seconds)
"Your derived value needs three steps to compute: filter out inactive users, sort by last login, then take the top 10. That's three lines of code. `$derived()` only accepts a single expression. Enter `$derived.by()` — the multi-statement version that handles real-world complexity."

### Demo sequence
1. **[0:30-2:30] Show the limitation** — Try to write `let top = $derived(users.filter(...).sort(...).slice(0, 10))` — works as one chain but becomes unreadable fast. What if you need intermediate variables or conditional logic? "Single-expression derived works for simple computations. Real apps need more."
2. **[2:30-5:00] Introduce $derived.by()** — Rewrite as `let top = $derived.by(() => { const active = users.filter(u => u.active); active.sort((a, b) => b.lastLogin - a.lastLogin); return active.slice(0, 10); })`. "Pass a function. Use as many statements as you need. Return the result. Same reactive tracking, same caching."
3. **[5:00-7:30] Complex example** — Build a dashboard metric: `let stats = $derived.by(() => { ... })` that computes min, max, average, and median from a reactive dataset. Return an object with all four values. Use them in the template: `{stats.average}`, `{stats.median}`. "One derived computation, four outputs, all reactive."
4. **[7:30-9:30] DevTools verification** — Add logging inside the `$derived.by` function to show it only re-runs when dependencies change. Change an unrelated piece of state — show the derived doesn't re-run. Change the data it depends on — show it does. "Svelte tracks which `$state` values you actually read inside the function. Nothing else triggers it."
5. **[9:30-10:30] Edge case / gotcha** — "Don't put side effects in `$derived.by()`. No `console.log` in production (it re-runs unpredictably), no API calls, no DOM manipulation. If you need to DO something when data changes, use `$effect()` — that's next lesson."

### Key moments (timestamps the editor should chapter-mark)
- 0:30 — "When single-expression derived isn't enough"
- 2:30 — "$derived.by() — the multi-statement version"
- 5:00 — "Dashboard metrics example"
- 7:30 — "Proving selective re-runs"
- 9:30 — "Side effects don't belong here"

### Callout graphics
- Comparison: $derived (one expression) vs $derived.by (function body)
- Dependency tracking diagram
- Code example with highlighted return statement

### Outro (30 seconds)
"Use `$derived` for one-liners, `$derived.by` for multi-step computations. Both are purely reactive and side-effect-free. Next lesson, we cross the line into side effects with `$effect()` — the rune that reacts to state changes by DOING things."

---

## Lesson 2.9 — `$effect()` — side effects and the JS execution model

**Duration:** 13 minutes
**Screen setup:** Editor with `.svelte` file, browser Console and Network tabs open

### Hook (30 seconds)
"A user toggles dark mode. The theme state changes. Now you need to update `document.body.classList`, save the preference to localStorage, and maybe even tell an analytics service. None of that is 'derived state' — it's work that happens BECAUSE state changed. That's a side effect, and `$effect()` is how Svelte handles them."

### Demo sequence
1. **[0:30-2:30] Show the problem** — Try to put localStorage writes inside `$derived` — it re-runs unpredictably, stores redundant writes. "Derived is for computing values, not for doing work. Side effects need their own primitive."
2. **[2:30-5:30] Introduce $effect** — Write `$effect(() => { document.body.classList.toggle('dark', theme === 'dark'); localStorage.setItem('theme', theme); })`. Toggle `theme` — body class and localStorage both update. "The function runs whenever any `$state` or `$derived` value read inside it changes. It runs after the DOM updates."
3. **[5:30-8:00] The JS execution model** — Diagram: microtask queue, `$effect` timing. Show that `$effect` runs asynchronously, after the current synchronous block completes and the DOM has been updated. "Effects don't run inline with your assignment. They're batched and scheduled after the DOM is consistent. This prevents the 'read stale DOM' problem."
4. **[8:00-10:30] Build the mini-build** — Create a theme switcher: `$state('light')` theme, an effect that syncs to body class, an effect that persists to localStorage, and on mount it reads localStorage to restore the preference. Show the full cycle working.
5. **[10:30-12:30] Edge case / gotcha** — "Infinite loops. If your effect writes to a `$state` that it also reads, it creates a cycle: read -> change -> re-run -> read -> change. Svelte will warn you, but the damage is done. Rule: effects should READ reactive state and WRITE to the outside world (DOM, localStorage, APIs) — not back to reactive state."

### Key moments (timestamps the editor should chapter-mark)
- 0:30 — "Side effects vs derived state"
- 2:30 — "Your first $effect"
- 5:30 — "When effects actually run"
- 8:00 — "Building a theme switcher"
- 10:30 — "The infinite loop trap"

### Callout graphics
- Diagram: derived (pure) vs effect (side effect) decision tree
- Timeline: state change -> DOM update -> $effect runs
- Warning diagram: $effect reading and writing same $state

### Outro (30 seconds)
"Effects bridge your reactive state to the outside world — DOM, storage, APIs, analytics. But they run AFTER the DOM updates. What if you need to run code BEFORE the DOM updates? That's `$effect.pre()`, next lesson."

---

## Lesson 2.10 — `$effect.pre()` — pre-DOM-update effects

**Duration:** 10 minutes
**Screen setup:** Editor with `.svelte` file, browser showing a chat scroll behavior

### Hook (30 seconds)
"New messages arrive in a chat. The container's scroll position needs to be measured BEFORE the new messages are rendered, so you can decide whether to auto-scroll or show a 'new messages' badge. `$effect()` runs AFTER the DOM updates — too late. `$effect.pre()` runs BEFORE, exactly when you need it."

### Demo sequence
1. **[0:30-2:00] Show the problem** — Chat component with messages. Use `$effect` to check scroll position — by the time it runs, the DOM already has the new messages and the scroll measurement is wrong. "The DOM changed before we could measure. We need pre-update timing."
2. **[2:00-5:00] Introduce $effect.pre** — Replace with `$effect.pre(() => { ... })`. Measure `container.scrollHeight` and `container.scrollTop` before new messages render. Decide whether to auto-scroll. "Pre-effects run after state changes are batched but before Svelte updates the DOM. You get the old DOM state."
3. **[5:00-7:30] Chat auto-scroll mini-build** — Build the pattern: `$effect.pre` saves scroll position, messages render, `$effect` restores scroll or shows badge. Show both effects logging their timing. "Pre-effect measures. Post-effect acts. Two effects, one complete behavior."
4. **[7:30-8:30] DevTools verification** — Log timestamps inside both effects. Show `$effect.pre` fires first. Show the DOM hasn't changed yet inside pre. "The console proves the ordering: pre -> DOM update -> post."
5. **[8:30-9:30] Edge case / gotcha** — "`$effect.pre()` is rare. In 95% of cases, `$effect()` is what you want. Use `$effect.pre()` only when you need to measure the DOM before it changes — scroll positions, element dimensions, animation starting points."

### Key moments (timestamps the editor should chapter-mark)
- 0:30 — "The scroll measurement timing problem"
- 2:00 — "$effect.pre — before DOM updates"
- 5:00 — "Chat auto-scroll pattern"
- 7:30 — "Proving the timing"
- 8:30 — "When you actually need this"

### Callout graphics
- Timeline: state change -> $effect.pre -> DOM update -> $effect
- Chat component scroll behavior diagram
- Decision flowchart: $effect vs $effect.pre

### Outro (30 seconds)
"Pre-effects fill a narrow but critical niche: measuring the DOM before it changes. Next lesson, we tackle the most important responsibility of any effect — cleaning up after itself to prevent memory leaks."

---

## Lesson 2.11 — `$effect` cleanup — preventing memory leaks

**Duration:** 11 minutes
**Screen setup:** Editor with `.svelte` file, browser Performance/Memory tab

### Hook (30 seconds)
"Your component sets up an interval, adds an event listener, opens a WebSocket connection. The user navigates away. The component unmounts. But the interval keeps firing, the listener keeps listening, the socket stays open — consuming memory, CPU, and bandwidth. That's a memory leak, and `$effect` cleanup prevents every single one."

### Demo sequence
1. **[0:30-2:30] Show the problem** — Create a component with `setInterval` in `$effect` — no cleanup. Mount and unmount it several times. Open the Performance Monitor — show memory climbing. "Every mount adds another interval. None of them stop. This is the #1 source of memory leaks in component-based frameworks."
2. **[2:30-5:00] Return a cleanup function** — Add `return () => { clearInterval(id); }` to the effect. Mount and unmount — memory stays flat. "The function you return from `$effect` runs when the effect re-runs or the component unmounts. It's your cleanup hook."
3. **[5:00-7:30] Three cleanup patterns** — Pattern 1: clear an interval. Pattern 2: remove an event listener (`document.addEventListener` / `removeEventListener`). Pattern 3: abort a fetch (`AbortController`). Show all three with cleanup. "Any resource you acquire, you release. The cleanup function is your guarantee."
4. **[7:30-9:30] Re-run cleanup** — Show that cleanup also fires when the effect's dependencies change and it re-runs. The old cleanup runs, then the new effect runs. "If your effect re-runs because `userId` changed, the old interval for the old user is cleared before the new one starts."
5. **[9:30-10:30] Edge case / gotcha** — "If your cleanup captures stale state via closure, you might clear the wrong resource. The cleanup closure captures values from the SAME run as the effect. Don't reference variables from outside the effect body — keep cleanup self-contained."

### Key moments (timestamps the editor should chapter-mark)
- 0:30 — "The mounting memory leak"
- 2:30 — "The cleanup return function"
- 5:00 — "Three cleanup patterns"
- 7:30 — "Cleanup on re-run"
- 9:30 — "Stale closure in cleanup"

### Callout graphics
- Memory usage graph: with cleanup vs without cleanup
- Three cleanup patterns side by side (interval, listener, fetch)
- Lifecycle diagram: mount -> effect -> re-run -> cleanup -> effect -> unmount -> cleanup

### Outro (30 seconds)
"Always clean up what you start. Return a function from your `$effect` and Svelte handles the rest. Next lesson, we connect reactivity to CSS — dynamic styles and class bindings that change with your state."

---

## Lesson 2.12 — Reactivity with CSS: dynamic styles and class bindings

**Duration:** 11 minutes
**Screen setup:** Editor with `.svelte` file, browser with live style changes visible

### Hook (30 seconds)
"A button is active — it should be blue. A form field has an error — it should have a red border. A sidebar is collapsed — it needs a different width. Your state changes; your styles need to follow. Svelte gives you three ways to bind CSS to reactive state, and picking the right one matters."

### Demo sequence
1. **[0:30-2:30] Show the problem** — Vanilla JS: `element.classList.toggle('active', isActive)`. Multiple elements, multiple conditions, manual sync everywhere. "Same manual sync problem we solved with `$state` — but for styles."
2. **[2:30-5:00] class: directive** — Show `class:active={isActive}` on an element. Toggle `isActive` — class toggles. Show multiple: `class:active class:error={hasError} class:large={size === 'lg'}`. "The `class:` directive binds a CSS class to a boolean expression. True? Class added. False? Class removed."
3. **[5:00-7:30] style: directive** — Show `style:color={textColor}` and `style:font-size="{size}px"`. Change the reactive values — styles update. "For one-off dynamic styles that don't merit a CSS class. Don't abuse this — if you're using more than two `style:` directives, create a CSS class instead."
4. **[7:30-9:30] CSS custom properties** — Show `style:--brand-hue={hue}` to pass reactive values as CSS custom properties. Use them in `<style>`: `color: oklch(65% 0.25 var(--brand-hue))`. "Custom properties are the bridge between JavaScript state and CSS. Change the property, the entire component re-paints."
5. **[9:30-10:30] Edge case / gotcha** — "The `class` attribute and `class:` directive can coexist: `<div class='card' class:active>`. But don't mix `class={dynamicString}` with `class:` — they compete. Use one approach or the other."

### Key moments (timestamps the editor should chapter-mark)
- 0:30 — "Styles that follow state"
- 2:30 — "class: directive"
- 5:00 — "style: directive"
- 7:30 — "CSS custom properties bridge"
- 9:30 — "Mixing class approaches"

### Callout graphics
- Three approaches comparison table: class:, style:, CSS custom properties
- Before/after: manual classList toggle vs Svelte class:
- Color picker showing reactive custom property changing hue

### Outro (30 seconds)
"Dynamic classes, inline styles, and CSS custom properties — three tools for binding CSS to reactive state. Use `class:` for conditional classes, `style:` for one-offs, and custom properties for theme-level values. Final lesson of this module: TypeScript with reactive state."

---

## Lesson 2.13 — TypeScript with reactive state

**Duration:** 11 minutes
**Screen setup:** Editor with `.svelte` file, TypeScript error panel visible

### Hook (30 seconds)
"You write `$state(0)` and TypeScript knows it's a number. But what about `$state<string | null>(null)`? What about a `$derived` that returns a union type? What about an `$effect` that only runs for certain state shapes? TypeScript and runes work together — if you type your state correctly."

### Demo sequence
1. **[0:30-2:30] Inference with $state** — Show `let count = $state(0)` — TypeScript infers `number`. Show `let name = $state('Ada')` — infers `string`. "For simple cases, inference handles everything. You don't need explicit generics."
2. **[2:30-5:00] Explicit generics** — Show `let user = $state<User | null>(null)` — starts null, will be set after fetch. Without the generic, TypeScript infers `null` and errors when you assign a `User`. "When the initial value doesn't represent the full type, provide the generic explicitly."
3. **[5:00-7:30] Typing $derived** — Show `let total = $derived(items.reduce(...))` — TypeScript infers `number` from the expression. Show a more complex `$derived.by` with an explicit return type. Show that TypeScript catches errors in the derived expression. "Derived types are inferred from the return value. Add an explicit return type annotation inside `$derived.by` for documentation."
4. **[7:30-9:30] Typing $effect** — Show that `$effect` doesn't return a value — its type is `void`. Show narrowing inside effects: `if (user) { /* user is User, not null */ }`. "Effects are about side effects, not computed values. TypeScript's narrowing works inside them just like any function."
5. **[9:30-10:30] Edge case / gotcha** — "`$state()` with no argument creates `$state<undefined>(undefined)`. If you meant `$state<string>('')`, say so. An undefined state that's supposed to be a string will cause 'possibly undefined' errors everywhere you read it."

### Key moments (timestamps the editor should chapter-mark)
- 0:30 — "Type inference with runes"
- 2:30 — "Explicit generics for $state"
- 5:00 — "Typing $derived expressions"
- 7:30 — "Narrowing inside $effect"
- 9:30 — "The undefined state trap"

### Callout graphics
- Table: rune type inference — what's inferred vs what needs explicit typing
- Generic syntax diagram: `$state<Type>(initialValue)`
- TypeScript narrowing example inside $effect

### Outro (30 seconds)
"TypeScript and runes are designed to work together. Type your state, let inference handle derived values, and narrow inside effects. Module 2 is complete — you now understand Svelte's entire reactivity system. Module 3 introduces components: reusable, typed, composable building blocks."

---
