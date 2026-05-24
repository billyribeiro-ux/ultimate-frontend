# Module 5 — Events: Video Lecture Script Outlines

> **Recording note:** Set editor font to 18px minimum. Keep browser Console and Elements panels accessible. Demonstrate all click/keyboard/touch events with visible cursor tracking or keyboard overlay for screen recording.

---

## Lesson 5.1 — Event handlers in Svelte 5 (lowercase `onclick`)

**Duration:** 11 minutes
**Screen setup:** Editor with `.svelte` file, browser showing interactive buttons

### Hook (30 seconds)
"You built beautiful, reactive, component-based UIs. They look perfect. And they do absolutely nothing when you click them. Events are how your app listens to the human on the other side of the screen. In Svelte 5, the syntax changed — lowercase `onclick`, no colon, no `on:` directive. If you've seen the old syntax, forget it now."

### Demo sequence
1. **[0:30-2:30] Show the problem** — A button with no handler. Click it. Nothing happens. "The button exists. The human clicks. Nothing is wired up. Events bridge the gap."
2. **[2:30-5:00] Introduce onclick** — Add `onclick={() => count++}` to the button. Click — count increments. Show that it's a standard HTML attribute in Svelte 5, not a directive. "Lowercase. No colon. Just `onclick`, `onmouseover`, `onkeydown` — standard DOM event names as attributes."
3. **[5:00-7:30] Inline vs function reference** — Show inline handler: `onclick={() => count++}`. Show function reference: `onclick={handleClick}`. Show when to use each: simple actions inline, complex logic in named functions. "Inline for one-liners. Named functions for anything more than one statement."
4. **[7:30-9:30] The event object** — Show `onclick={(e) => console.log(e.target, e.clientX)}`. Explain `MouseEvent`, `KeyboardEvent`, `InputEvent`. Show accessing event properties. "Every handler receives the native DOM event object. Everything you know about DOM events applies."
5. **[9:30-10:30] Edge case / gotcha** — "If you see `on:click` in a tutorial, it's Svelte 4. Svelte 5 uses `onclick`. The colon syntax was removed. Mixing old and new syntax in the same component produces confusing errors."

### Key moments (timestamps the editor should chapter-mark)
- 0:30 — "Static UI does nothing"
- 2:30 — "onclick in Svelte 5"
- 5:00 — "Inline vs named handlers"
- 7:30 — "The event object"
- 9:30 — "on:click is dead"

### Callout graphics
- Svelte 4 vs Svelte 5 event syntax comparison
- DOM event object properties cheat sheet
- Decision: inline handler vs named function

### Outro (30 seconds)
"Event handlers connect your UI to user actions. The syntax is simple — lowercase attribute, function value. Next lesson, we go deeper on JavaScript functions themselves: parameters, return values, arrow functions, and the patterns you'll use in every handler."

---

## Lesson 5.2 — JavaScript functions deeply

**Duration:** 12 minutes
**Screen setup:** Editor with `.ts` file and `.svelte` file, Console for demonstrations

### Hook (30 seconds)
"Every event handler is a function. Every `$derived` callback is a function. Every API call wrapper is a function. If you don't understand parameters, return values, closures, and arrow syntax deeply, you'll be guessing at why your code works — or doesn't. Let's fix that."

### Demo sequence
1. **[0:30-3:00] Function anatomy** — Write a named function: `function add(a: number, b: number): number { return a + b; }`. Label each part: name, parameters, types, return type, body, return statement. "Five parts. Every function has them, whether you write them explicitly or let TypeScript infer them."
2. **[3:00-5:30] Arrow functions** — Rewrite as `const add = (a: number, b: number): number => a + b`. Show the implicit return for single expressions. Show the explicit return with braces: `(a, b) => { const result = a + b; return result; }`. "Arrow functions are shorter syntax. Single expression = implicit return. Multiple statements = braces + explicit return."
3. **[5:30-8:00] Functions as values** — Assign to a variable. Pass as an argument. Return from another function. Show that functions are first-class citizens in JavaScript. "This is why you can write `onclick={handleClick}` — you're passing a function as a value."
4. **[8:00-10:00] Default parameters and rest** — Show `function greet(name: string, greeting = 'Hello')`. Show rest parameters: `function log(...args: string[])`. "Defaults and rest parameters reduce boilerplate. You'll use both in component callbacks and utility functions."
5. **[10:00-11:30] Edge case / gotcha** — "Arrow functions don't have their own `this`. In a class method used as an event handler, `this` inside an arrow function refers to the class instance. In a regular function, `this` refers to the element. In Svelte 5, you almost never need `this` — use the event target instead."

### Key moments (timestamps the editor should chapter-mark)
- 0:30 — "Function anatomy"
- 3:00 — "Arrow functions"
- 5:30 — "Functions as values"
- 8:00 — "Default and rest parameters"
- 10:00 — "The `this` trap in handlers"

### Callout graphics
- Function anatomy diagram with labeled parts
- Arrow function syntax variations
- Functions as values flow diagram

### Outro (30 seconds)
"Functions are the building blocks of every interactive feature you'll build. Next lesson, we type our event handlers with TypeScript event types — MouseEvent, KeyboardEvent, and beyond."

---

## Lesson 5.3 — TypeScript event types

**Duration:** 10 minutes
**Screen setup:** Editor with `.svelte` file, TypeScript IntelliSense showing event properties

### Hook (30 seconds)
"You write `onclick={(e) => ...}` and try `e.key`. Red squiggly. It's a `MouseEvent`, not a `KeyboardEvent` — there's no `.key` property on a mouse event. TypeScript event types catch this mismatch before your user encounters a runtime error."

### Demo sequence
1. **[0:30-2:30] Show the problem** — Access `.key` on a mouse event. Access `.clientX` on a keyboard event. Both are runtime errors that TypeScript could have prevented. "Different events have different properties. TypeScript knows which is which."
2. **[2:30-5:00] Built-in event types** — Show `MouseEvent`, `KeyboardEvent`, `InputEvent`, `FocusEvent`, `SubmitEvent`, `TouchEvent`. Demonstrate IntelliSense on each: `.clientX` on MouseEvent, `.key` on KeyboardEvent, `.currentTarget.value` on InputEvent. "Each event type has specific properties. TypeScript gives you autocomplete for all of them."
3. **[5:00-7:00] Typing handler functions** — Write a named handler: `function handleClick(e: MouseEvent & { currentTarget: HTMLButtonElement }) { ... }`. Show that `currentTarget` is now typed as a button. "Add `currentTarget` typing for the specific element. This is how you get `.value`, `.checked`, `.files` with type safety."
4. **[7:00-8:30] Generic event handler type** — Show `EventHandler<MouseEvent, HTMLButtonElement>` from `svelte/elements`. "Svelte provides event handler types that combine the event type and the element type."
5. **[8:30-9:30] Edge case / gotcha** — "`e.target` is typed as `EventTarget | null`, not as the specific element. Use `e.currentTarget` for the element the handler is attached to — it has the correct type. `e.target` is whatever the user actually clicked, which might be a child element."

### Key moments (timestamps the editor should chapter-mark)
- 0:30 — "Wrong event type, wrong property"
- 2:30 — "The event type hierarchy"
- 5:00 — "Typing currentTarget"
- 7:00 — "Svelte's EventHandler type"
- 8:30 — "target vs currentTarget"

### Callout graphics
- Event type hierarchy diagram
- IntelliSense screenshot for each event type
- target vs currentTarget diagram on nested elements

### Outro (30 seconds)
"Typed events prevent property-access mistakes at compile time. Next lesson, we learn two essential DOM methods that control event behavior: `preventDefault` and `stopPropagation`."

---

## Lesson 5.4 — `preventDefault` and `stopPropagation`

**Duration:** 10 minutes
**Screen setup:** Editor with `.svelte` file, browser showing form submission and event bubbling

### Hook (30 seconds)
"You submit a form. The page refreshes. Your single-page app state is gone. That full-page reload is the browser's DEFAULT behavior for forms — and `preventDefault` is how you stop it. This one method call is the difference between an SPA that works and one that resets on every form submission."

### Demo sequence
1. **[0:30-2:30] Show the problem** — A form with an `onsubmit` handler. Submit it — page refreshes. "The browser's default: POST the form data and reload the page. In a SvelteKit app with client-side routing, this destroys your app state."
2. **[2:30-5:00] preventDefault** — Add `e.preventDefault()` at the top of the handler. Submit — no page refresh. Data handled in JavaScript. "One line. The default behavior is cancelled. Your handler takes full control."
3. **[5:00-7:30] stopPropagation** — Create nested divs with click handlers. Click the inner div — both handlers fire (bubbling). Add `e.stopPropagation()` to the inner handler — only the inner fires. "Events bubble up from child to parent. `stopPropagation` stops the bubble. Use it when a child's click shouldn't trigger the parent's handler."
4. **[7:30-8:30] Common patterns** — `<a onclick={(e) => { e.preventDefault(); goto('/custom') }}>` — prevent navigation, use SvelteKit's router instead. `<button onclick={(e) => { e.stopPropagation(); closeModal() }}>` — close modal without triggering the backdrop click. "Two methods, dozens of use cases. Know when to use each."
5. **[8:30-9:30] Edge case / gotcha** — "Don't `preventDefault()` on every event reflexively. Some defaults are useful: keyboard navigation, link behavior for accessibility, form validation popups. Only prevent when you're replacing the default behavior with something better."

### Key moments (timestamps the editor should chapter-mark)
- 0:30 — "The page-refresh problem"
- 2:30 — "preventDefault — stopping defaults"
- 5:00 — "stopPropagation — stopping bubbling"
- 7:30 — "Common patterns"
- 8:30 — "Don't over-prevent"

### Callout graphics
- Event bubbling diagram with stopPropagation cutoff
- Form submission flow: with vs without preventDefault
- Decision: when to prevent, when to let default happen

### Outro (30 seconds)
"Control default behaviors and event bubbling with two methods. Next lesson: how to forward events from a child component to its parent — the bridge between isolated components."

---

## Lesson 5.5 — Forwarding events from child to parent

**Duration:** 10 minutes
**Screen setup:** Editor with parent and child component files, browser showing nested interactions

### Hook (30 seconds)
"A Button component wraps a `<button>`. The parent needs to know when it's clicked. In Svelte 5, event forwarding is automatic — every event handler attribute passes through to the child. But understanding the mechanism saves you from a class of bugs."

### Demo sequence
1. **[0:30-2:30] Show the problem** — Parent tries `<Button onclick={handleClick} />`. The handler doesn't fire because Button doesn't forward it to its internal `<button>`. "The parent's handler is a prop. The child's `<button>` doesn't know about it."
2. **[2:30-5:00] Forwarding with rest props** — In Button: `let { children, ...rest } = $props()`. On the internal button: `<button {...rest}>{@render children?.()}</button>`. Parent's `onclick` now works. "Rest props forward everything — including event handlers. This is the standard pattern."
3. **[5:00-7:00] Explicit forwarding** — Show `let { onclick, ...rest } = $props()`. Use `<button onclick={onclick}>`. Add wrapping logic: `<button onclick={(e) => { /* child logic */; onclick?.(e) }}>`. "Explicit forwarding lets you intercept the event, do child-specific work, then call the parent's handler."
4. **[7:00-8:30] Build the mini-build** — Create a `ConfirmButton` that shows a confirmation dialog before calling the parent's handler. "The child adds behavior (confirmation) while still forwarding the event to the parent."
5. **[8:30-9:30] Edge case / gotcha** — "If you destructure `onclick` from props and also put `onclick` on the element, the explicit handler wins. Rest-spread and explicit attributes don't merge — last one wins. Be explicit about which handler you're attaching."

### Key moments (timestamps the editor should chapter-mark)
- 0:30 — "The forwarding gap"
- 2:30 — "Rest props forward events"
- 5:00 — "Explicit forwarding with interception"
- 7:00 — "ConfirmButton mini-build"
- 8:30 — "Handler override precedence"

### Callout graphics
- Event flow diagram: parent handler -> child prop -> internal element
- Rest props spreading illustration
- Handler precedence: explicit vs spread

### Outro (30 seconds)
"Event forwarding connects isolated components to parent logic. Next lesson, closures in event handlers — the JavaScript feature that makes handler functions remember their context."

---

## Lesson 5.6 — Closures in event handlers

**Duration:** 11 minutes
**Screen setup:** Editor with `.svelte` file, browser showing a list with per-item handlers

### Hook (30 seconds)
"You render a list of items. Each item has a delete button. The handler needs to know WHICH item to delete. How does a function defined inside a loop remember its specific item? Closures — JavaScript's most powerful and most misunderstood feature."

### Demo sequence
1. **[0:30-2:30] Show the problem** — Attempt without closure: a single handler that doesn't know which item was clicked. "All buttons call the same function. None of them know their item."
2. **[2:30-5:30] Closures explained** — Show `{#each items as item}<button onclick={() => deleteItem(item.id)}>Delete</button>{/each}`. The arrow function captures `item` from the surrounding scope. "A closure is a function that remembers the variables from the scope where it was created. Each iteration creates a new function with its own `item`."
3. **[5:30-8:00] Closure with index** — Show `{#each items as item, i}<button onclick={() => console.log(i, item.name)}>`. Each button logs its own index and name. "The closure captures both `item` and `i` — each button has its own private copy of these values."
4. **[8:00-9:30] Build the mini-build** — Create an image gallery where each thumbnail has a click handler that opens a modal with that specific image. The handler captures the image URL, title, and description. "Five images, five closures, five handlers that each know their image."
5. **[9:30-10:30] Edge case / gotcha** — "Closures capture variables, not values. If `item` is reassigned after the closure is created, the closure sees the new value. In `{#each}`, this isn't a problem because each iteration creates a fresh variable. But in a `for` loop with `var` (not `let`), all closures share the same variable."

### Key moments (timestamps the editor should chapter-mark)
- 0:30 — "Which item was clicked?"
- 2:30 — "Closures: functions that remember"
- 5:30 — "Capturing index and item"
- 8:00 — "Gallery modal mini-build"
- 9:30 — "var vs let in closures"

### Callout graphics
- Closure scope diagram: outer scope -> function -> captured variables
- Each iteration creating its own closure
- var vs let loop behavior comparison

### Outro (30 seconds)
"Closures let each handler function remember its own context. Master this and per-item handlers will never confuse you again. Next lesson: debouncing and throttling — controlling how often your handlers fire."

---

## Lesson 5.7 — Debouncing and throttling

**Duration:** 11 minutes
**Screen setup:** Editor with `.svelte` file, browser showing a search input with network requests

### Hook (30 seconds)
"A user types 'javascript' into a search box. That's 10 keystrokes. Without debouncing, you fire 10 API requests — 'j', 'ja', 'jav', 'java'... Your server handles 10 requests when it only needed one. Debouncing waits until the user stops typing. Throttling limits how often the handler fires. Both save bandwidth, CPU, and your API bill."

### Demo sequence
1. **[0:30-2:30] Show the problem** — Search input with `oninput` that fetches on every keystroke. Network tab shows 10 requests for a 10-character query. "Ten requests. Nine are wasted. Your server is doing 10x the work. Your user is paying for 10x the data."
2. **[2:30-5:00] Debouncing** — Implement: `let timeout: ReturnType<typeof setTimeout>; function debounce(fn, ms) { clearTimeout(timeout); timeout = setTimeout(fn, ms); }`. Apply to the search handler. Type 'javascript' — one request fires 300ms after the last keystroke. "Debounce waits for silence. The function only runs after the user pauses."
3. **[5:00-7:30] Throttling** — Implement: `let last = 0; function throttle(fn, ms) { if (Date.now() - last > ms) { fn(); last = Date.now(); } }`. Apply to a scroll handler. Show it fires at most once per 100ms. "Throttle limits frequency. The function runs at most once per interval, regardless of how many events fire."
4. **[7:30-9:30] Build the mini-build** — Create a live search component: debounced input -> fetch -> display results. Show the network tab: one request per pause, not per keystroke. Add a loading indicator during the debounce wait. "A production-quality search input in 20 lines."
5. **[9:30-10:30] Edge case / gotcha** — "Clean up your timeout on component unmount. If the component destroys while a debounced call is pending, the callback fires on a dead component. Use `$effect` cleanup: `return () => clearTimeout(timeout)`."

### Key moments (timestamps the editor should chapter-mark)
- 0:30 — "10 requests for one query"
- 2:30 — "Debouncing: wait for silence"
- 5:00 — "Throttling: limit frequency"
- 7:30 — "Live search mini-build"
- 9:30 — "Cleanup on unmount"

### Callout graphics
- Timeline: keystroke events vs debounced/throttled fires
- Debounce vs throttle comparison diagram
- Network tab: before and after debouncing

### Outro (30 seconds)
"Debouncing and throttling prevent event-handler overload. Use debounce for search/resize/typing. Use throttle for scroll/drag/animation frames. Next: custom events and the callback prop pattern."

---

## Lesson 5.8 — Custom events and the callback prop pattern

**Duration:** 11 minutes
**Screen setup:** Editor with parent and child files, browser showing custom interactions

### Hook (30 seconds)
"DOM events cover clicks, keystrokes, and mouse moves. But what about 'itemSelected', 'filterChanged', 'wizardCompleted'? These are YOUR domain events — things that happen in YOUR app. In Svelte 5, the callback prop pattern replaces custom events with something simpler and fully typed."

### Demo sequence
1. **[0:30-2:30] Show the problem** — A child component needs to notify the parent when a user completes a multi-step wizard. There's no DOM event called 'wizardCompleted'. "Native events cover browser interactions. Your app's domain events need a different mechanism."
2. **[2:30-5:00] Callback prop pattern** — In child: `let { onComplete }: { onComplete: (data: WizardData) => void } = $props()`. Call it: `onComplete({ step: 3, result: formData })`. In parent: `<Wizard onComplete={handleWizardComplete} />`. "A typed function prop. The child calls it when the event occurs. The parent defines what happens."
3. **[5:00-7:30] Multiple callbacks** — Show a DataTable with `onSort`, `onFilter`, `onRowClick`, `onPageChange` — all as callback props. Type each one. "Each callback has its own specific type. TypeScript enforces the contract at both ends."
4. **[7:30-9:30] Build the mini-build** — Create a StarRating component with `onRate: (rating: number) => void`. Parent logs the rating and saves it. Show the full interaction: user clicks stars, callback fires, parent updates state. "A reusable StarRating that communicates its value through a typed callback."
5. **[9:30-10:30] Edge case / gotcha** — "Make callback props optional if the parent might not care: `onRate?: (rating: number) => void`. Always call with optional chaining: `onRate?.(value)`. If you call `onRate(value)` when it's undefined, you get a runtime error."

### Key moments (timestamps the editor should chapter-mark)
- 0:30 — "Beyond DOM events"
- 2:30 — "The callback prop pattern"
- 5:00 — "Multiple typed callbacks"
- 7:30 — "StarRating mini-build"
- 9:30 — "Optional callbacks"

### Callout graphics
- Callback prop flow: child -> callback prop -> parent handler
- TypeScript function type annotation diagram
- StarRating component with callback arrows

### Outro (30 seconds)
"Callback props are Svelte 5's answer to custom events: simpler, typed, and explicit. Next lesson: touch events and mobile interaction patterns."

---

## Lesson 5.9 — Touch events and mobile interaction

**Duration:** 11 minutes
**Screen setup:** Editor with `.svelte` file, mobile emulation in Chrome DevTools

### Hook (30 seconds)
"More than half your users are on mobile. They don't click — they tap, swipe, pinch, and long-press. If your app only handles `onclick`, you're ignoring the primary input method of most of the internet. Touch events fill the gap."

### Demo sequence
1. **[0:30-2:30] Show the problem** — Open DevTools mobile emulation. Tap a hover-dependent dropdown — nothing happens. "Hover doesn't exist on touch screens. CSS `:hover` fires on tap and STAYS until the user taps elsewhere. Touch needs its own handling."
2. **[2:30-5:00] Touch event fundamentals** — `ontouchstart`, `ontouchmove`, `ontouchend`, `ontouchcancel`. Show the `Touch` object: `e.touches[0].clientX`, `e.touches[0].clientY`. "Touch events give you finger positions. Multiple fingers = multiple touch points in the `touches` array."
3. **[5:00-7:30] Building a swipe detector** — Track `touchstart` position. On `touchend`, calculate the delta. If horizontal delta > 50px, it's a swipe left/right. Apply to a carousel component. "A basic swipe detector: start position, end position, compare the difference."
4. **[7:30-9:30] Pointer events** — Introduce `onpointerdown`, `onpointermove`, `onpointerup` — the unified API that handles mouse, touch, and pen. "Pointer events are the modern answer. One set of events for all input types. Use these unless you need multi-touch."
5. **[9:30-10:30] Edge case / gotcha** — "Touch events and click events BOTH fire on mobile tap. The touch event fires first, then a synthetic click event ~300ms later. If you handle both, your action runs twice. Use either touch events OR pointer events — not both alongside click."

### Key moments (timestamps the editor should chapter-mark)
- 0:30 — "Half your users are tapping"
- 2:30 — "Touch event basics"
- 5:00 — "Building a swipe detector"
- 7:30 — "Pointer events — unified input"
- 9:30 — "The double-fire trap"

### Callout graphics
- Touch event lifecycle: touchstart -> touchmove -> touchend
- Swipe detection geometry diagram
- Pointer events unifying mouse/touch/pen

### Outro (30 seconds)
"Touch and pointer events make your app truly interactive on every device. Last lesson of this module: form accessibility and keyboard navigation — making sure every user can interact with your app."

---

## Lesson 5.10 — Form accessibility and keyboard navigation

**Duration:** 12 minutes
**Screen setup:** Editor with `.svelte` file, browser with screen reader active or accessibility audit running

### Hook (30 seconds)
"A user navigates your form with Tab key. They press Enter to submit. They use a screen reader to hear field labels. If your form isn't accessible, these users can't use your app at all. And in many jurisdictions, that's not just bad UX — it's illegal."

### Demo sequence
1. **[0:30-2:30] Show the problem** — A form built with `<div onclick>` instead of `<button>`. Try to Tab to it — can't focus. Try to press Enter — nothing happens. Screen reader announces nothing useful. "Divs are not interactive elements. The keyboard and screen reader can't see them."
2. **[2:30-5:00] Semantic elements** — Replace with `<button>`, `<input>`, `<label>`, `<fieldset>`, `<legend>`. Tab through — focus moves naturally. Enter submits. Screen reader announces labels. "Use the right HTML elements. They come with keyboard handling and screen reader support built in."
3. **[5:00-7:30] ARIA labels and roles** — Add `aria-label`, `aria-describedby`, `aria-required`, `aria-invalid` to form fields. Show screen reader reading the error message. "ARIA fills gaps when HTML semantics aren't enough. Use it to describe errors, required fields, and complex widgets."
4. **[7:30-10:00] Keyboard navigation patterns** — Implement: Tab between fields. Enter to submit. Escape to cancel. Arrow keys for radio groups and select alternatives. Show `onkeydown` handler checking `e.key`. "A keyboard-navigable form works for power users, screen reader users, and users with motor impairments."
5. **[10:00-11:30] Edge case / gotcha** — "Don't trap focus. If a user tabs through your form and can't Tab out, they're stuck. Modal dialogs should trap focus (intentionally). Forms should not. Test by tabbing through your entire page — can you reach the footer?"

### Key moments (timestamps the editor should chapter-mark)
- 0:30 — "The div-as-button failure"
- 2:30 — "Semantic elements are accessible by default"
- 5:00 — "ARIA for error messages and descriptions"
- 7:30 — "Keyboard navigation patterns"
- 10:00 — "The focus trap problem"

### Callout graphics
- Semantic element accessibility features table
- ARIA attribute reference for forms
- Keyboard navigation flow diagram
- Focus order illustration

### Outro (30 seconds)
"Accessible forms work for everyone — keyboard users, screen reader users, and mouse users alike. Module 5 is complete: you can handle clicks, keyboard events, touch, custom domain events, and make them all accessible. Module 6 takes on styling: layers, transitions, animations, and motion."

---
