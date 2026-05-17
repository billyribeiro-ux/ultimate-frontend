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

### 1.9 The event delegation question

Some frameworks (React, Solid) use event delegation: they attach a single listener on the document root and route events to the correct handler based on the target. Svelte 5 does **not** use delegation by default. Each element gets its own handler directly on the DOM node. This makes DevTools inspection clearer (you see the listener on the exact element), avoids the complications of delegation (portals, shadow DOM, stopped propagation), and has negligible performance difference for typical component trees. For lists with thousands of items where attaching thousands of listeners would be wasteful, you can manually delegate inside an `$effect` — but that is an advanced optimization you will rarely need.

## Deep Dive

**Why this matters at scale.** In a 50-component app, event handlers are the primary mechanism for user interaction. Consistency in how handlers are written — lowercase attributes, no parentheses, proper typing, arrow wrappers for arguments — is what makes a codebase readable across a team. A codebase that mixes `on:click` (old), `onClick` (React habit), and `onclick` (correct) is a maintenance nightmare. Svelte 5's alignment with the platform means new team members who know HTML already know the attribute names. There is nothing framework-specific to teach them.

**The mental model.** Think of event attributes as plugging a cable into a socket. The socket is the DOM element. The cable is your function. You plug in one cable (one handler reference) and the socket fires the function when activated. If you accidentally call the function (`handleClick()` with parentheses), you are not plugging in the cable — you are running electricity through it in your hand, right now, before it is connected. The DOM never gets the cable, and you get shocked (infinite re-render loop). Always plug, never run.

**Edge cases.** Custom elements (web components) may dispatch custom events with non-standard names like `ontoggle-detail`. Svelte 5 passes any `on*` attribute through to the DOM, so you can write `ontoggle-detail={handler}` and it works. However, TypeScript may not recognize the attribute type — you may need a type assertion or a `// @ts-ignore` for truly custom event names. Another edge case: `onsubmit` on a form fires even if the submit is triggered programmatically via `form.requestSubmit()`, but not via `form.submit()`. Always use `requestSubmit()` if you want your handler to fire.

**Performance implications.** Each event handler is a property assignment — O(1), essentially free. Even a page with 500 buttons has negligible handler setup cost. The performance concern is not in attaching handlers but in what the handlers *do*. An `onclick` handler that synchronously filters 10,000 items will block the main thread and worsen INP (Module 12). The handler itself should be fast; heavy work should be deferred with `requestAnimationFrame`, debounce (Lesson 5.7), or moved off the main thread.

**Connection to other modules.** Events are the input side of the reactivity system. Module 2 (state) provides the values that handlers modify. Module 3 (components) teaches callback props — functions passed as props that children call as event handlers. Module 5 continues with `preventDefault`, closures, debounce, and custom events. Module 7 (GSAP) uses event handlers to trigger animations. Module 10 (forms) uses `onsubmit` with progressive enhancement. Understanding the handler reference pattern taught here is required for every subsequent lesson that involves user interaction.

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
