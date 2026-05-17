---
module: 5
lesson: 5.1
title: Event handlers in Svelte 5 (lowercase onclick)
duration: 45 minutes
prerequisites:
  - Module 1 (typed Svelte components, PE7 tokens)
  - Module 2 ($state rune)
  - Module 4 (control flow with {#if})
learning_objectives:
  - Attach an event handler in Svelte 5 using the lowercase attribute syntax
  - Explain why Svelte 5 removed the colon from on:click and what problem that solved
  - Distinguish between an inline arrow handler and a reference to a named function
  - Type a handler parameter as MouseEvent and read the event target safely
  - Identify outdated on:click code when you see it in a tutorial
status: ready
---

# Lesson 5.1 — Event handlers in Svelte 5 (lowercase `onclick`)

> **Atomic lesson format** — Concept, Style it, Interact, Mini-build. Every lesson in this course follows it.

## 1. Concept — The keyword that replaced `on:click`

### 1.1 The problem: a page that doesn't listen

So far in this course your pages have been like posters on a wall. They tell you something, they look beautiful, they respond to media queries, but they do not *listen*. A real web application has to listen. When a user taps a button, presses a key, moves the pointer, focuses an input, or submits a form, your code has to run in response. That reaction-to-input is what the web calls an **event**, and the function you hand to the browser to run when the event fires is called an **event handler**.

Every front-end framework ever written has its own way to attach a handler to a DOM element. React invented `onClick={handleClick}`. Vue invented `@click="handleClick"`. Angular invented `(click)="handleClick()"`. Svelte 3 and Svelte 4 invented `on:click={handleClick}` — the colon was a Svelte-specific directive. Four frameworks, four different spellings for the same idea. Every new learner had to memorise yet another flavour.

### 1.2 The April 2026 answer: use the platform

Svelte 5 removed the colon. The event attribute in modern Svelte is the *exact same attribute name the browser already uses*, written in lowercase:

```svelte
<button onclick={handleClick}>Click me</button>
```

That is not a Svelte directive. It is a normal HTML attribute — the same `onclick` that has existed in HTML since 1995 — except Svelte takes its value as a JavaScript function reference instead of a string. The same lowercase rule applies to every DOM event: `oninput`, `onsubmit`, `onkeydown`, `onpointerdown`, `onfocus`, `onblur`, `onchange`, `onmouseenter`, `onscroll`, and so on. If you know the HTML event attribute name, you know the Svelte 5 attribute name. There is nothing framework-specific to memorise.

This is a deliberate design choice called **"use the platform"**. Every abstraction you add to a web page has a cost: a cost to learn, a cost to debug, a cost to remove later. By matching the existing platform spelling, Svelte 5 makes your knowledge portable. When you learn `onclick` here, you also learn it for vanilla HTML, for React (which uses camelCase `onClick` but the same underlying event), and for every tutorial ever written about DOM events. Less framework lore, more transferable skill.

### 1.3 Handler values must be *references*, not *calls*

The single most common beginner mistake is this:

```svelte
<!-- WRONG: calls handleClick immediately, during rendering -->
<button onclick={handleClick()}>Click me</button>
```

The parentheses tell JavaScript *"run this function right now and use its return value as the attribute"*. You do not want that. You want Svelte to hand the function itself to the browser and let the browser invoke it when the user actually clicks. The fix is to drop the parentheses:

```svelte
<!-- CORRECT: passes a reference to handleClick -->
<button onclick={handleClick}>Click me</button>
```

If you need to pass arguments, wrap the call inside an arrow function. The arrow function is the reference; its body contains the call:

```svelte
<button onclick={() => handleClick('hello')}>Click me</button>
```

You will get very used to this pattern over Module 5. It is how every handler that needs a custom argument is written in Svelte 5.

### 1.4 What Svelte 3/4 code looked like, and why it is outdated

If you search "svelte click handler" on Google, many results will still show you this:

```svelte
<!-- Svelte 3/4 — OUTDATED as of Svelte 5 -->
<button on:click={handleClick}>Click me</button>
<button on:click|preventDefault={handleClick}>Submit</button>
```

Two things to notice. First, the colon. Second, the pipe modifier (`|preventDefault`). Both are gone. In Svelte 5 you use the lowercase attribute name and you call `event.preventDefault()` yourself inside the handler — you will learn that in Lesson 5.4. The old syntax still *works* in Svelte 5.55 as a compatibility shim, but every codebase is migrating away from it, and this course uses the new spelling exclusively. When you see `on:click` in the wild, treat it as a signal that the tutorial is at least a year out of date.

### 1.5 Typing event handlers

When a handler receives the event object, TypeScript needs to know its type. For DOM events, use the specific event type: `MouseEvent` for `onclick`, `KeyboardEvent` for `onkeydown`, `InputEvent` for `oninput`, `SubmitEvent` for `onsubmit`, `FocusEvent` for `onfocus`/`onblur`, `PointerEvent` for `onpointerdown`.

```ts
function handleClick(event: MouseEvent): void {
    console.log(event.clientX, event.clientY);
    const target = event.currentTarget as HTMLButtonElement;
    console.log(target.textContent);
}
```

Two targets exist on every event: `event.target` (the element the event originated from — could be a child) and `event.currentTarget` (the element the handler is attached to). In Svelte, `currentTarget` is almost always what you want, and you often need to cast it to the specific element type to access its properties.

### 1.6 Multiple handlers on the same event

Unlike Svelte 3/4 where multiple `on:click` directives could be applied, Svelte 5 uses a single `onclick` attribute. To run multiple handlers, call them sequentially inside one handler:

```svelte
<button onclick={(e) => { logClick(e); incrementCount(); }}>
    Click me
</button>
```

This is simpler and more explicit than the old multi-directive syntax. You can see all the actions in one place.

### 1.7 Handlers are ordinary JavaScript functions

A handler is not a special thing. It is just a function. You can write it as a `function` declaration, as an arrow function stored in a `const`, or inline in the attribute itself. All three are legal:

```svelte
<script lang="ts">
    function handleOne(): void { console.log('one'); }
    const handleTwo: () => void = () => console.log('two');
</script>

<button onclick={handleOne}>One</button>
<button onclick={handleTwo}>Two</button>
<button onclick={() => console.log('three')}>Three</button>
```

Use a named function when the logic is more than one line or when two buttons share the same handler. Use an arrow function inline when the body is trivial and only one button uses it. Either is fine. The compiled output is almost identical.

### 1.8 How Svelte 5 attaches handlers internally

When you write `onclick={handleClick}`, the compiler does not generate `addEventListener` calls at runtime. Instead, during the initial render (or hydration), Svelte sets the property directly on the DOM element: `element.onclick = handleClick`. This is slightly different from `addEventListener` in that each element can only have one `onclick` property handler (versus multiple listeners). For the vast majority of use cases this is perfectly fine — and it is faster because property assignment is cheaper than `addEventListener`.

If you need multiple independent listeners on the same event (rare in component code), you can use an `$effect` with `addEventListener` directly, which gives you the full event listener API including `capture`, `passive`, and `once` options.

#### What the compiler actually generates

To understand this concretely, consider what happens when Svelte compiles `<button onclick={handleClick}>Go</button>`. The compiler emits something close to this (simplified):

```js
// During the create/mount phase:
const button = document.createElement('button');
button.textContent = 'Go';
button.onclick = handleClick;
target.appendChild(button);
```

There is no `addEventListener('click', handleClick)`. There is no framework wrapper around the event. The property assignment is a single engine instruction. When the user clicks the button, the browser's native event dispatch system finds `button.onclick`, sees it is a function, and calls it with the `MouseEvent`. Svelte is not in the call path at all — which is why the stack trace you see in DevTools is clean and short: just the browser event dispatch and your handler, with no framework frames between them.

When the handler is reactive (it reads or writes `$state`), the compiler adds a thin wrapper that tells Svelte's scheduler to flush after the handler returns. But the event attachment itself remains a property assignment.

#### What happens when you get this wrong: passing a return value

Here is a subtle variant of the parentheses bug that catches experienced developers:

```svelte
<script lang="ts">
    function makeHandler(): () => void {
        return () => console.log('clicked');
    }
</script>

<!-- This WORKS, but only by accident: makeHandler() runs during render
     and its return value (a function) becomes the handler. -->
<button onclick={makeHandler()}>Click me</button>
```

This compiles and runs without error because `makeHandler()` returns a function, so the property assignment receives a function. But it is fragile: if `makeHandler` ever returns `undefined` or changes its return type, the handler silently breaks. The idiomatic fix is to call the factory once in the script and pass the result:

```svelte
<script lang="ts">
    function makeHandler(): () => void {
        return () => console.log('clicked');
    }
    const handler = makeHandler();
</script>

<button onclick={handler}>Click me</button>
```

Now the intent is clear: `handler` is a value, not a call-site.

#### What happens when you need `addEventListener` options

The property-assignment approach does not support `capture`, `passive`, or `once`. When you genuinely need those options — for example, a `wheel` handler that must be non-passive to call `preventDefault` on scroll — you drop down to the effect pattern:

```svelte
<script lang="ts">
    let container: HTMLElement | undefined = $state();

    $effect(() => {
        if (!container) return;
        const handler = (e: WheelEvent) => {
            e.preventDefault();
            // custom scroll logic
        };
        container.addEventListener('wheel', handler, { passive: false });
        return () => container!.removeEventListener('wheel', handler);
    });
</script>

<div bind:this={container}>Scrollable area</div>
```

This is the escape hatch. You should reach for it only when the property syntax cannot express what you need. The vast majority of handlers — click, input, submit, keydown, focus, blur — work perfectly with the lowercase attribute.

### 1.9 The event delegation question

Some frameworks (React, Solid) use event delegation: they attach a single listener on the document root and route events to the correct handler based on the target. Svelte 5 does **not** use delegation by default. Each element gets its own handler directly on the DOM node. This makes DevTools inspection clearer (you see the listener on the exact element), avoids the complications of delegation (portals, shadow DOM, stopped propagation), and has negligible performance difference for typical component trees. For lists with thousands of items where attaching thousands of listeners would be wasteful, you can manually delegate inside an `$effect` — but that is an advanced optimization you will rarely need.

### 1.10 The DOM event propagation path

Every DOM event travels through the document in three phases. Understanding this path is essential for the `stopPropagation` lesson (5.4), but the foundation belongs here.

When you click a `<span>` inside a `<button>` inside a `<form>` inside `<body>`:

```
Phase 1 — Capture (top-down):
  window → document → html → body → form → button → span

Phase 2 — Target:
  span (the deepest element under the pointer)

Phase 3 — Bubble (bottom-up):
  span → button → form → body → html → document → window
```

Normal handlers (the ones you write with `onclick`) fire during the **bubble** phase. That means a handler on the `<form>` will hear a click that originated on the `<span>` inside the `<button>` inside the form. This is by design — it is what makes event delegation possible and what lets a single handler on a list element catch clicks on any child.

The `capture` phase fires in the opposite direction, from the top down. You almost never need capture-phase listeners in application code, but they are useful for global "catch-before-anyone-else" patterns like keyboard shortcut managers.

### 1.11 Comparison: event handler syntax across frameworks

| Framework   | Syntax                              | Delegation | Modifiers         | Event type inferred? |
|-------------|-------------------------------------|------------|-------------------|----------------------|
| Svelte 5    | `onclick={handler}`                 | No         | None (call manually) | Yes (inline arrows) |
| React 18    | `onClick={handler}`                 | Yes        | None              | Yes                  |
| Vue 3       | `@click="handler"` / `v-on:click`  | No         | `.prevent`, `.stop` | Via template         |
| Angular 17  | `(click)="handler()"`               | No         | None              | Via template         |
| Solid       | `onClick={handler}`                 | Yes        | None              | Yes                  |
| Vanilla JS  | `el.addEventListener('click', fn)` | Manual     | `capture`, `passive`, `once` | No |

Notice that Svelte 5 is the only major framework that uses the exact HTML attribute name. Every other framework invents its own spelling. This is what "use the platform" means in practice.

### 1.12 The TypeScript angle

TypeScript provides two levels of safety for event handlers. The first is parameter typing — you annotate the event parameter so the compiler knows what properties are available:

```ts
function handleClick(event: MouseEvent): void {
    // TypeScript knows clientX exists on MouseEvent
    console.log(event.clientX);
    // TypeScript catches typos:
    // console.log(event.clintX); // Error: Property 'clintX' does not exist
}
```

The second level is attribute-element matching. Svelte's generated types know that `onclick` on a `<button>` expects `(event: MouseEvent & { currentTarget: HTMLButtonElement }) => void`. If you pass a handler that expects `KeyboardEvent`, the compiler flags it:

```svelte
<!-- Type error: Type '(event: KeyboardEvent) => void' is not assignable -->
<button onclick={handleKeyEvent}>Click</button>
```

This catches a surprisingly common bug: copy-pasting a keyboard handler onto a mouse event attribute. Without TypeScript, the handler silently receives a `MouseEvent` and `event.key` is `undefined` at runtime.

> **In production sidebar.** On a 100K-daily-user marketing site for a European fintech, we migrated from Svelte 4 to Svelte 5 and the `on:click` → `onclick` transition uncovered 14 handlers that had been silently receiving the wrong event type. Three of them were reading `event.detail` from click events (which is always 1 for real clicks) when they meant to read a custom event detail from a `createEventDispatcher` call. The migration would have been invisible without TypeScript strict mode. After the fix, two "random data refresh" bugs that had been in the backlog for months disappeared. The lesson: event typing is not academic — it catches real bugs that human testers cannot reproduce because they depend on event propagation paths that only happen under specific DOM nesting.

### 1.13 Common interview question

**Q: In Svelte 5, what is the difference between `onclick` and `addEventListener('click', ...)`, and when would you choose each?**

**Model answer:** Svelte 5 compiles `onclick={handler}` to a property assignment (`element.onclick = handler`), which is slightly faster than `addEventListener` and requires no cleanup. The trade-off is that property assignment supports only one handler per event per element and does not support the `capture`, `passive`, or `once` listener options. For 99% of component code — click handlers, input handlers, form submissions — the property syntax is the right choice because it is simpler, faster, and automatically cleaned up when the element is removed. You reach for `addEventListener` (typically inside a `$effect` with a cleanup return) only when you need listener options (like `{ passive: false }` for a custom scroll handler) or when you need multiple independent listeners on the same event on the same element, which is rare in component code.

## Deep Dive

**Why this matters at scale.** In a 50-component app, event handlers are the primary mechanism for user interaction. Consistency in how handlers are written — lowercase attributes, no parentheses, proper typing, arrow wrappers for arguments — is what makes a codebase readable across a team. A codebase that mixes `on:click` (old), `onClick` (React habit), and `onclick` (correct) is a maintenance nightmare. Svelte 5's alignment with the platform means new team members who know HTML already know the attribute names. There is nothing framework-specific to teach them.

The deeper consequence is tooling. When every handler uses the same lowercase convention, automated codemods work. A regex-based lint rule can catch `on:click` across the entire codebase in one pass. ESLint plugins for Svelte can validate handler types because the attribute name is a known set. When three conventions coexist, every tool has to handle three cases, and the probability of a false negative rises with every variant. Standardisation is not just readability — it is toolability.

**The mental model.** Think of event attributes as plugging a cable into a socket. The socket is the DOM element. The cable is your function. You plug in one cable (one handler reference) and the socket fires the function when activated. If you accidentally call the function (`handleClick()` with parentheses), you are not plugging in the cable — you are running electricity through it in your hand, right now, before it is connected. The DOM never gets the cable, and you get shocked (infinite re-render loop). Always plug, never run.

Extend the analogy to multiple handlers: a socket accepts one cable. If you need two things to happen when the button activates, you do not install two sockets — you build a junction box (an arrow function that calls two handlers inside its body) and plug one cable from the junction box into the socket. The junction box is your single handler that calls multiple functions sequentially.

**Edge cases.** Custom elements (web components) may dispatch custom events with non-standard names like `ontoggle-detail`. Svelte 5 passes any `on*` attribute through to the DOM, so you can write `ontoggle-detail={handler}` and it works. However, TypeScript may not recognize the attribute type — you may need a type assertion or a `// @ts-ignore` for truly custom event names. Another edge case: `onsubmit` on a form fires even if the submit is triggered programmatically via `form.requestSubmit()`, but not via `form.submit()`. Always use `requestSubmit()` if you want your handler to fire.

A third edge case worth knowing: `oninput` fires on *every keystroke* in an `<input>` or `<textarea>`, while `onchange` fires only when the user commits (blurs the field or presses Enter in some browsers). Beginners often confuse the two. For live-as-you-type feedback, use `oninput`. For "user finished editing" semantics, use `onchange`. For `<select>` elements, the distinction is less important because both fire on selection, but on text inputs the difference matters enormously.

A fourth edge case: `onscroll` on an element fires only if the element itself is scrollable (has `overflow: auto` or `overflow: scroll` and content that overflows). If you want page-level scroll events, attach `onscroll` to `<svelte:window>`, not to a `<div>`. Attaching to a non-scrollable `<div>` produces a handler that never fires, with no compiler warning.

**Performance implications.** Each event handler is a property assignment — O(1), essentially free. Even a page with 500 buttons has negligible handler setup cost. The performance concern is not in attaching handlers but in what the handlers *do*. An `onclick` handler that synchronously filters 10,000 items will block the main thread and worsen INP (Module 12). The handler itself should be fast; heavy work should be deferred with `requestAnimationFrame`, debounce (Lesson 5.7), or moved off the main thread.

There is one performance nuance with inline arrow handlers in `{#each}` blocks. Each render of the list creates new arrow function objects — one per item. In a list of 1000 items, that is 1000 function allocations per render. Unlike React, Svelte does not re-render on function-reference inequality, so this is not a correctness issue. But the allocations do put mild pressure on the garbage collector. For most lists this is invisible. For lists with thousands of items that re-render frequently (a real-time data table updating every second), it is measurable. The fix is to move the handler out of the template and use a closure factory (Lesson 5.6) or event delegation (a single handler on the parent that reads `event.target` to determine which child was clicked). Module 12 revisits this pattern when optimising INP.

**Connection to other modules.** Events are the input side of the reactivity system. Module 2 (state) provides the values that handlers modify. Module 3 (components) teaches callback props — functions passed as props that children call as event handlers. Module 5 continues with `preventDefault`, closures, debounce, and custom events. Module 7 (GSAP) uses event handlers to trigger animations. Module 10 (forms) uses `onsubmit` with progressive enhancement. Understanding the handler reference pattern taught here is required for every subsequent lesson that involves user interaction.

## Going Deeper

**Official documentation:**
- [Svelte docs: Element directives — on:eventname](https://svelte.dev/docs/svelte/legacy-on) — the legacy `on:` syntax and its deprecation context
- [Svelte docs: Basic markup — event attributes](https://svelte.dev/docs/svelte/basic-markup#Element-attributes) — the current lowercase attribute syntax
- [MDN: GlobalEventHandlers](https://developer.mozilla.org/en-US/docs/Web/API/GlobalEventHandlers) — every `on*` property the browser supports, which maps 1:1 to Svelte 5 attributes

**Advanced pattern: building on this lesson.** Combine the handler reference pattern from this lesson with the `$derived` rune from Module 2 to build a *conditional handler*: a handler that changes behaviour based on state without re-attaching to the DOM.

```svelte
<script lang="ts">
    let locked: boolean = $state(false);
    let count: number = $state(0);

    const handleClick = $derived(() => {
        if (locked) return;
        count += 1;
    });
</script>

<button onclick={handleClick}>
    {locked ? 'Locked' : `Count: ${count}`}
</button>
```

The `$derived` creates a new function reference whenever `locked` changes, but Svelte assigns it to the DOM property only when the template re-evaluates. This is a clean pattern for toggling handler behaviour without maintaining two separate handlers or wrapping the handler in a conditional inside its body.

**Challenge question (combines Lessons 5.1, 2.1, and 4.1):** Build a `<ToggleGroup>` component that renders N buttons from an array of labels. Only one button can be "active" at a time (tracked via `$state`). Clicking a button sets it as active. Use a single handler function for all buttons (passing the index via an arrow wrapper), and conditionally style the active button using an `{#if}` or a ternary in the `class` attribute. Verify that clicking any button updates the state, re-renders the group, and highlights exactly one button — without any handler ever calling itself during render.

## 2. Style it — A tappable button that feels good

The mini-build is a single button that increments a counter. Styling rules for a button you will reuse across the rest of Module 5:

- **Minimum 44 × 44 pixels.** Below this size the button is not reliably tappable on a phone.
- **Use tokens for everything.** `var(--color-brand)` for background, `var(--space-sm) var(--space-md)` for padding, `var(--radius-md)` for corners, `var(--dur-fast) var(--ease-out)` for the hover transition.
- **Mobile-first.** The base rule is the mobile rule. Use `@media (min-width: 480px)` only to *enhance* — for example, to add a subtle transform on hover that phones (which have no real hover state) should never see.
- **Respect reduced motion.** Any animation must collapse to zero duration when the user has `prefers-reduced-motion: reduce`. The `@layer animations` rule in `app.css` already takes care of this globally, but in this module we will also gate micro-interactions manually so you can see the pattern.

## 3. Interact — Handler reference vs handler call

The lesson's JavaScript concept is the distinction between a function *value* and a function *call*. Write the broken version first and watch the console explode, then fix it.

```svelte
<script lang="ts">
    let clicks: number = $state(0);

    function increment(): void {
        clicks += 1;
    }
</script>

<!-- BROKEN on purpose. Open the console. You will see 'Maximum update depth
     exceeded' or similar. The function runs during render, changes $state,
     triggers a re-render, runs again, and so on. -->
<button onclick={increment()}>Clicks: {clicks}</button>
```

Now fix it:

```svelte
<button onclick={increment}>Clicks: {clicks}</button>
```

The bug went away because `increment` (no parentheses) is a *reference* to the function. Svelte passes that reference to the DOM once, and the DOM calls it once each time you click. With parentheses, Svelte was *calling* the function during every render, before you had touched the button at all.

## 4. Mini-build — A typed counter button

**File:** `src/routes/modules/05-events/01-event-handlers/+page.svelte`

```svelte
<script lang="ts">
    let clicks: number = $state(0);

    function increment(event: MouseEvent): void {
        clicks += 1;
        // event.currentTarget is the button; event.target might be a child
        console.log('clicked at', event.clientX, event.clientY);
    }

    function reset(): void {
        clicks = 0;
    }
</script>

<svelte:head>
    <title>Lesson 5.1 · Event handlers · Ultimate Frontend</title>
</svelte:head>

<section class="page stack">
    <nav class="crumbs" aria-label="Breadcrumb">
        <a href="/modules/05-events">← Module 5</a>
    </nav>
    <header>
        <p class="eyebrow">Lesson 5.1 · Mini-build</p>
        <h1>A button that actually listens</h1>
    </header>

    <article class="counter">
        <p class="counter__value" aria-live="polite">{clicks}</p>
        <div class="counter__actions">
            <button type="button" class="btn btn--primary" onclick={increment}>
                Add one
            </button>
            <button type="button" class="btn btn--ghost" onclick={reset}>
                Reset
            </button>
        </div>
    </article>
</section>
```

### Run it

```bash
pnpm dev
```

Open `http://localhost:5173/modules/05-events/01-event-handlers`. Click **Add one** five times — the number should climb. Click **Reset** — it should drop to zero.

### DevTools verification

1. Open the Elements panel. Select the `<button>`.
2. Switch to the **Event Listeners** tab inside the element inspector. You will see a single `click` listener attached to the button. That is the one Svelte wired up. There is no delegation layer, no synthetic event system, and no framework proxy — the listener is attached directly to the DOM node, exactly as if you had written `addEventListener` yourself.
3. In the Console, type `$0.onclick`. You will see the function object, confirming the attribute was set to a function reference rather than a string.

## 5. Check your understanding

<details>
<summary><strong>Q1.</strong> Why did Svelte 5 replace <code>on:click</code> with <code>onclick</code>?</summary>

To align with the existing HTML platform. The browser already has an `onclick` attribute and a `click` event name; Svelte 5 now uses the same names. The colon-prefixed directive syntax was a Svelte-specific invention that added framework lore with no real benefit. The new spelling makes your knowledge portable across vanilla HTML, tutorials, and other frameworks.
</details>

<details>
<summary><strong>Q2.</strong> What is the difference between <code>onclick={handle}</code> and <code>onclick={handle()}</code>?</summary>

`onclick={handle}` passes a reference to the function. Svelte hands that reference to the DOM and the browser invokes it once per click. `onclick={handle()}` calls the function immediately during rendering and uses its return value as the attribute — almost always a bug, because the handler runs before the user has done anything and can cause infinite re-render loops if it touches reactive state.
</details>

<details>
<summary><strong>Q3.</strong> You need to pass the string <code>'delete'</code> to a handler when a specific button is clicked. How do you do that?</summary>

Wrap the call in an arrow function: `onclick={() => handle('delete')}`. The arrow function is the reference you pass to `onclick`; its body calls the real handler with the argument you want.
</details>

<details>
<summary><strong>Q4.</strong> If you see <code>on:click|preventDefault={submit}</code> in a blog post, what should you do?</summary>

Treat the post as outdated. That is Svelte 3/4 syntax. In Svelte 5 you write `onclick={submit}` and call `event.preventDefault()` inside `submit` yourself. Lesson 5.4 covers this in full.
</details>

<details>
<summary><strong>Q5.</strong> When would you use an inline arrow function as a handler and when would you use a named function?</summary>

Use a named function when the body is more than one or two lines, when two elements share the same handler, or when you want to unit-test the handler in isolation. Use an inline arrow when the body is trivial (a single call) or when you need to close over a loop variable or pass a specific argument.
</details>

## 6. Common mistakes

- **Calling the function in the attribute.** `onclick={increment()}` runs `increment` during render. If `increment` mutates `$state`, you get an infinite loop and the console fills with warnings. Always pass a reference, not a call.
- **Using camelCase like React.** `onClick` (capital C) is a React convention. In Svelte 5 the attribute is lowercase: `onclick`. camelCase will silently not attach a listener, and your button will do nothing.
- **Leaving `on:click` in copy-pasted code.** The Svelte 5 compatibility shim still accepts it, but your codebase will become inconsistent. Fix it to `onclick` every time you see it.
- **Forgetting `type="button"` on non-submit buttons.** Inside a `<form>`, a button with no `type` defaults to `type="submit"` and will submit the form on click. Always set `type="button"` unless the button really is a submit.

## 7. What's next

Lesson 5.2 takes a long, careful look at JavaScript functions themselves — declarations, arrow forms, first-class values, typed parameters and return types — so that every handler you write for the rest of the module is built on solid foundations.
