# Ultimate Frontend — Interview Preparation Guide

100 interview questions organized by topic, each with a model answer, interviewer intent, and red flags to avoid. All answers reflect the May 2026 Svelte 5.55+ / SvelteKit 2.60+ stack taught in this course.

---

## Svelte Core (Questions 1–20)

---

### Q1. What are runes and why did Svelte switch to them?

**Model answer:**

Runes are Svelte 5's compiler-recognized function-like primitives — `$state`, `$derived`, `$effect`, `$props`, `$bindable`, `$inspect`, and `$host` — that replace the implicit reactivity system from Svelte 3/4. In older Svelte, reactivity was triggered by top-level `let` declarations and the `$:` label syntax. The compiler silently transformed assignments into reactive updates, which meant reactivity was invisible: you had to know that `let count = 0` inside a `.svelte` file was reactive but the same line inside a `.ts` file was not.

Runes solve three problems. First, they make reactivity explicit. When you write `let count = $state(0)`, any developer reading the code — regardless of whether they know Svelte — can see that `count` is reactive state. Second, runes work everywhere: in `.svelte` files, in `.svelte.ts` modules, and inside classes. This means you can extract reactive logic out of components into standalone modules and test them in isolation with Vitest. Third, runes give the compiler richer semantic information. Because `$state` and `$derived` are syntactically distinct, the compiler can generate more efficient update code, avoid unnecessary re-renders, and provide better TypeScript integration without relying on ambient type declarations.

The migration path was deliberate. Svelte 4 served as a transitional release that aligned the component API with the new model without introducing runes. Svelte 5 then introduced runes as the default while keeping legacy mode available behind a flag. By 2026, legacy mode is deprecated and the ecosystem has standardized on runes. The takeaway is that runes did not change what Svelte can do — they changed how clearly and portably it does it.

**What interviewers are really testing:** Whether you understand the motivation behind the design shift, not just the API surface. They want to hear you articulate the problems with implicit reactivity.

**Red flag answers to avoid:**
- "Runes are just React hooks for Svelte." (They are compiler directives, not runtime hooks. There are no rules-of-hooks constraints.)
- Failing to mention that runes work outside `.svelte` files — this is one of their primary benefits.

---

### Q2. Explain the difference between `$state`, `$state.raw`, and `$state.snapshot`.

**Model answer:**

These three cover different points on the reactivity-versus-performance spectrum. `$state(value)` creates deeply reactive state. If `value` is an object or array, Svelte wraps it in a reactive proxy so that any mutation — even nested ones like `user.address.city = 'Oslo'` — triggers fine-grained updates. This is the default you reach for in most UI scenarios: form fields, toggles, small data structures that you mutate in place.

`$state.raw(value)` creates shallow reactive state. The variable itself is reactive — reassigning it triggers updates — but the contents are not proxied. You cannot mutate properties and expect Svelte to notice; you must replace the entire value. This is ideal for large datasets you receive from an API and never mutate in place, like a list of 10,000 rows you feed to TanStack Table. Because there is no proxy overhead, reads and writes are faster and memory usage is lower.

`$state.snapshot(value)` does not create state at all. It takes an existing reactive proxy and returns a plain, structurally cloned JavaScript object. You use it when you need to pass reactive state to something that cannot handle proxies: `JSON.stringify`, `structuredClone`, a Web Worker `postMessage`, or `console.log` during debugging. Without `$state.snapshot`, logging a reactive object would show you the proxy wrapper, not the data.

The mental model is: `$state` is deep reactivity, `$state.raw` is reference-only reactivity, and `$state.snapshot` is an escape hatch from reactivity altogether.

**What interviewers are really testing:** Whether you understand proxy-based reactivity and can make performance-aware choices about state granularity.

**Red flag answers to avoid:**
- Saying `$state.raw` is "the same as `$state` but faster" without explaining why (no proxy, no mutation tracking).
- Not knowing what `$state.snapshot` is for or confusing it with creating a new reactive state.

---

### Q3. How does `$derived` differ from `$effect`? When would you use each?

**Model answer:**

`$derived` and `$effect` both react to changes in reactive state, but they serve fundamentally different purposes. `$derived` computes a value. It takes an expression (or a function body with `$derived.by`) and returns a reactive, read-only value that stays in sync with its dependencies. It is a pure function: given the same inputs, it always produces the same output, and it never causes side effects. You use `$derived` whenever one piece of state can be calculated from another — a filtered list, a computed total, a boolean flag like `isValid`.

`$effect` performs a side effect. It runs a callback whenever its dependencies change, but it does not return a value. Side effects are things that reach outside the reactive graph: manipulating the DOM directly, subscribing to a WebSocket, calling `localStorage.setItem`, starting a GSAP animation, or sending an analytics event. An `$effect` callback can also return a cleanup function that runs before the next invocation or when the component is destroyed.

The critical rule is: never use `$effect` to update `$state` when `$derived` would work. If you find yourself writing `$effect(() => { someState = computedValue })`, that is a code smell — you should use `$derived` instead. Using `$effect` to synchronize state creates unnecessary update cycles, makes the data flow harder to follow, and can introduce subtle bugs where the derived value is briefly stale between renders.

In summary: `$derived` is for computing values (declarative, pure, returns data), `$effect` is for performing actions (imperative, side-effectful, returns nothing).

**What interviewers are really testing:** Whether you understand the difference between pure derivation and side effects, and whether you know the anti-pattern of using `$effect` to set state.

**Red flag answers to avoid:**
- "I use `$effect` to keep two pieces of state in sync." (Use `$derived` instead.)
- Not mentioning the cleanup function in `$effect`.

---

### Q4. What happens under the hood when you call `$state()`?

**Model answer:**

`$state()` is not a runtime function call — it is a compiler directive. When the Svelte compiler encounters `let x = $state(0)`, it transforms the code during compilation. The compiled output creates a reactive signal: an internal data structure that holds the current value and tracks which effects and derived computations depend on it.

For primitive values (numbers, strings, booleans), the signal stores the value directly. When you read `x`, the compiled code calls a getter that registers the current subscriber (the running `$effect` or `$derived` computation). When you assign to `x`, the compiled code calls a setter that updates the stored value and schedules all registered subscribers for re-execution.

For objects and arrays, `$state` wraps the value in a `Proxy`. The proxy intercepts property reads (to register dependencies at the property level) and property writes (to trigger granular updates). This means `user.name = 'Ada'` does not invalidate subscribers that only read `user.age`. The deep proxying is recursive: nested objects are proxied lazily when accessed.

The compiler also performs static analysis to determine which template expressions depend on which signals, allowing it to emit surgical DOM update code. Rather than diffing a virtual DOM, Svelte generates direct DOM manipulation instructions like `element.textContent = x` wrapped in a reactive context. This is why Svelte updates are fast: the compiler has already figured out the update paths at build time.

The key insight is that `$state` is not a function that exists at runtime in the way `React.useState` does. It is a syntactic marker that the compiler replaces with signal machinery. This is why you cannot pass `$state` around as a reference or call it dynamically — it must appear as a direct assignment target.

**What interviewers are really testing:** Depth of understanding of compiler-driven frameworks versus runtime frameworks. They want to see that you know Svelte is not interpreting runes at runtime.

**Red flag answers to avoid:**
- "It creates a store" (Stores are the Svelte 3/4 mechanism; runes replace them).
- Describing a virtual DOM diffing process.

---

### Q5. How does Svelte's scoped CSS work?

**Model answer:**

Every `<style>` block in a `.svelte` file is scoped to that component by default. The compiler analyzes the CSS selectors and the template markup, then adds a unique hash-based class (like `.svelte-1a2b3c`) to both the generated DOM elements and the CSS selectors. A rule like `h1 { color: red }` becomes `h1.svelte-1a2b3c { color: red }`, and the `<h1>` in that component's markup gets the `svelte-1a2b3c` class added automatically.

This means styles cannot leak out to parent or sibling components, and parent styles cannot accidentally bleed into child components. The hash is deterministic — it is derived from the file content — so it remains stable across builds unless the component changes.

There are escape hatches. The `:global()` modifier lets you write rules that bypass scoping: `:global(body) { margin: 0 }` emits an unscoped rule. You can also use `:global` on a block to make all rules inside it unscoped. This is useful for styling third-party library markup that you do not control.

In the context of the PE7 design system, the `@layer` cascade interacts with scoped styles naturally. Token custom properties defined at the `:root` level (in the `tokens` layer) are inherited by all scoped components, so you reference `var(--color-primary)` inside a scoped `<style>` block and it resolves correctly. The scoping hash does not affect custom property inheritance because custom properties are inherited through the DOM tree, not through CSS selector matching.

One important detail: Svelte's scoping is purely additive. It only adds classes; it never uses Shadow DOM. This means scoped components still participate in the normal CSS cascade and can be affected by `:global` rules, `!important`, or styles injected by third-party scripts.

**What interviewers are really testing:** Whether you know the mechanism (hash classes, not Shadow DOM) and the edge cases (`:global`, custom property inheritance, third-party markup).

**Red flag answers to avoid:**
- "Svelte uses Shadow DOM for scoping." (It does not.)
- Not knowing how to break out of scoping with `:global()`.

---

### Q6. What is the Svelte compiler actually doing?

**Model answer:**

The Svelte compiler is a build-time tool that transforms `.svelte` files into optimized JavaScript modules. It runs during `vite build` or `vite dev` (via `vite-plugin-svelte`) and produces output that contains no framework runtime overhead for features that can be resolved statically.

The compilation pipeline has several phases. First, it parses the `.svelte` file into an AST (Abstract Syntax Tree), separating the `<script>`, markup, and `<style>` blocks. Second, it performs static analysis: it identifies reactive declarations (`$state`, `$derived`, `$effect`), traces dependencies between signals and template expressions, and determines which DOM nodes need update logic. Third, it performs code generation: it emits a JavaScript module that creates DOM nodes imperatively (using `document.createElement` or `template.cloneNode`), sets up reactive subscriptions between signals and DOM update functions, and exports the component class.

For CSS, the compiler scopes selectors by appending hash classes, tree-shakes unused rules (selectors that do not match any element in the template are removed), and can extract the CSS into separate `.css` files for production.

The result is that a Svelte component compiles down to vanilla JavaScript that directly manipulates the DOM. There is no virtual DOM, no diffing algorithm, and no runtime scheduler (other than microtask batching for effects). The "framework" is the compiler itself — what ships to the browser is just the app code. This is why Svelte bundles tend to be smaller than equivalent React or Vue bundles, especially for smaller apps where the fixed cost of a runtime framework is proportionally large.

**What interviewers are really testing:** Whether you understand the fundamental architectural difference between a compiler-based framework and a runtime-based one.

**Red flag answers to avoid:**
- Describing Svelte as having a "lightweight runtime" without acknowledging that the compiler does most of the work.
- Saying Svelte "compiles to Web Components" (it can, but that is not the default behavior).

---

### Q7. How do you handle component lifecycle in Svelte 5?

**Model answer:**

Svelte 5 does not have explicit lifecycle hooks like `onMount`, `onDestroy`, `beforeUpdate`, or `afterUpdate` in the way Svelte 3/4 did. Instead, lifecycle behavior emerges from runes. When you need code to run after the component mounts, you use `$effect`, which runs after the DOM is painted and re-runs whenever its dependencies change. The first run of an `$effect` is effectively `onMount`. When you return a cleanup function from `$effect`, that cleanup runs when the component is destroyed — effectively `onDestroy`. If you need code to run before the DOM updates, you use `$effect.pre`.

However, `onMount` and `onDestroy` still exist as imports from `'svelte'` for backward compatibility and for cases where you specifically want one-time setup/teardown without dependency tracking. `onMount` is still the idiomatic way to run browser-only code that should execute exactly once (like initializing a third-party library), because an `$effect` with no reactive dependencies will also run once but semantically communicates "reactive side effect" rather than "initialization."

The practical shift is that lifecycle in Svelte 5 is less about phases and more about reactive relationships. You think in terms of "when this state changes, do that" rather than "when this lifecycle phase fires, do that." This makes the mental model simpler: there are fewer concepts to learn, and the ones that remain are more composable because `$effect` can be used inside `.svelte.ts` modules and classes, not just inside component `<script>` blocks.

**What interviewers are really testing:** Whether you have migrated your mental model from lifecycle hooks to rune-based reactivity, and whether you know when `onMount` is still appropriate.

**Red flag answers to avoid:**
- Listing `onMount`, `onDestroy`, `beforeUpdate`, `afterUpdate` as the primary lifecycle API without mentioning runes.
- Saying lifecycle hooks are removed entirely (they still exist for compatibility and specific use cases).

---

### Q8. What is `$inspect` and when should you use it?

**Model answer:**

`$inspect` is a development-only rune for debugging reactive state. You call it with one or more reactive values — `$inspect(count, user)` — and it logs those values to the console every time any of them change. It is the reactive equivalent of `console.log`, but with automatic dependency tracking: you do not need to manually place log statements in every code path that might change the value.

The key distinction is that `$inspect` is stripped from production builds by the Svelte compiler. This means you can leave `$inspect` calls in your codebase during development without worrying about accidentally shipping console noise to users. You can also chain `.with(callback)` to customize the logging behavior — for example, `$inspect(state).with(console.trace)` to get a stack trace on every change.

You should use `$inspect` whenever you are confused about when or why a reactive value is changing. It replaces the common Svelte 3 pattern of `$: console.log(value)` which had the disadvantage of being easy to forget in production code. You should not use `$inspect` as a substitute for proper debugging with breakpoints or DevTools, and you should not use it to trigger side effects — it is purely for observation.

**What interviewers are really testing:** Whether you know Svelte's debugging tools and whether you understand that `$inspect` is dev-only.

**Red flag answers to avoid:**
- Using `$effect` with `console.log` for debugging instead of `$inspect`.
- Not knowing that `$inspect` is stripped in production.

---

### Q9. Explain `$props()` and how it replaces `export let`.

**Model answer:**

In Svelte 3/4, component props were declared with `export let propName: Type = defaultValue`. This was unique syntax that no other framework or JavaScript context used, and it overloaded the `export` keyword in a non-standard way. It also made destructuring awkward and required the `$$props` and `$$restProps` escape hatches.

Svelte 5 replaces this with `$props()`. You call it once at the top of your `<script>` block and destructure the result: `let { title, count = 0, ...rest } = $props<{ title: string; count?: number }>()`. This gives you native JavaScript destructuring with defaults, rest props built in, and full TypeScript generic support for type-checking the prop interface.

The advantages are significant. TypeScript integration is first-class: the generic parameter on `$props<T>()` defines the contract, and the compiler enforces it at the call site. Default values use standard JavaScript destructuring defaults, not a Svelte-specific mechanism. Rest props (`...rest`) replace `$$restProps` and work exactly like you would expect from JavaScript. And because `$props()` returns a plain object, the mental model is simpler: props come in as an object, you destructure what you need.

One subtlety: the destructured values are reactive. If a parent changes a prop, the child's destructured variable updates. This is because `$props()` is a compiler directive, not a normal function — the compiler transforms the destructuring into reactive bindings under the hood.

**What interviewers are really testing:** Whether you have migrated from `export let` and understand the TypeScript integration.

**Red flag answers to avoid:**
- Using `export let` syntax and not knowing it is deprecated.
- Not knowing how to type props with the generic parameter.

---

### Q10. What is `$bindable()` and when do you use it?

**Model answer:**

`$bindable()` marks a prop as eligible for two-way binding from the parent. In Svelte 5, when you declare props with `$props()`, any prop can be read by the parent. But for a parent to use `bind:propName`, the child must explicitly opt in by wrapping that prop's default value in `$bindable()`: `let { value = $bindable('') } = $props()`.

This is an intentional design choice. Two-way binding creates a tight coupling between parent and child: either side can mutate the value, which makes data flow harder to reason about. By requiring `$bindable()`, Svelte forces the component author to consciously decide which props support mutation from outside, documenting the component's contract explicitly.

The typical use case is form-like components: an `<Input>` component that accepts `bind:value`, a `<Select>` with `bind:selected`, or a `<Modal>` with `bind:open`. For most other props — labels, configuration flags, display data — one-way data flow is preferable and `$bindable` is not needed.

The fallback value you pass to `$bindable()` is used when the parent does not provide the prop and does not bind to it. If the parent uses `bind:value`, the fallback is ignored because the parent's value takes precedence.

**What interviewers are really testing:** Whether you understand controlled versus uncontrolled component patterns and when two-way binding is appropriate versus callback-based communication.

**Red flag answers to avoid:**
- Making every prop `$bindable` by default (this defeats the purpose of explicit opt-in).
- Not knowing the difference between `$bindable` and a callback prop pattern.

---

### Q11. How do snippets work in Svelte 5 and what did they replace?

**Model answer:**

Snippets (`{#snippet}` and `{@render}`) replaced slots in Svelte 5. In Svelte 3/4, you used `<slot>` to allow parents to inject content into a child component, and `<slot name="header">` for named slots. The problem with slots was that they were not first-class values: you could not pass them around, store them in variables, or conditionally compose them in complex ways.

Snippets are declared with `{#snippet name(params)}...{/snippet}` and rendered with `{@render name(args)}`. A snippet is essentially a reusable block of markup that can accept parameters, like a lightweight template function. You can declare snippets inside a component and render them anywhere in that component's markup. You can also pass snippets as props to child components, giving the child the ability to render parent-defined markup with child-provided data — the same pattern as render props in React but with cleaner syntax.

The typed snippet prop pattern is: `let { header }: { header: Snippet<[{ title: string }]> } = $props()`. The child then calls `{@render header({ title: 'Hello' })}`. This gives full type safety — the parent and child agree on the data contract at compile time.

Snippets are more powerful than slots because they are values: you can store them in variables, pass them through context, conditionally choose which snippet to render, and compose them programmatically. They also eliminate the confusion around slot forwarding in deeply nested component trees.

**What interviewers are really testing:** Whether you can explain component composition patterns and understand the shift from slots to snippets.

**Red flag answers to avoid:**
- Still using `<slot>` syntax (deprecated in Svelte 5).
- Not knowing how to type snippet props with the `Snippet` type.

---

### Q12. How does Svelte handle events in Svelte 5?

**Model answer:**

Svelte 5 switched from the `on:` directive syntax to standard HTML-like lowercase event attributes. Instead of `<button on:click={handler}>`, you write `<button onclick={handler}>`. This applies to all DOM events: `onmouseover`, `onkeydown`, `onsubmit`, `onfocus`, and so on.

This change aligns Svelte with the HTML standard and eliminates a custom syntax layer. The lowercase attributes are not the same as inline HTML event handlers (which evaluate strings) — they accept function references and are compiled to `addEventListener` calls. But the syntax looks familiar to anyone who knows HTML or React (which uses camelCase like `onClick`; Svelte uses all-lowercase like the HTML spec).

For component events, Svelte 5 uses the callback prop pattern. Instead of `createEventDispatcher` and `on:customevent`, you declare a prop that accepts a function: `let { onchange }: { onchange: (value: string) => void } = $props()`. The parent passes a function: `<MyInput onchange={(v) => console.log(v)} />`. This is simpler, more explicit, and fully type-safe.

Event modifiers like `|preventDefault` and `|stopPropagation` are also removed. You call those methods directly in your handler: `onclick={(e) => { e.preventDefault(); doSomething(); }}`. This is more explicit and avoids the need to learn Svelte-specific modifier syntax.

**What interviewers are really testing:** Whether you are current with Svelte 5 conventions and can explain why the shift from `on:` to lowercase attributes happened.

**Red flag answers to avoid:**
- Using `on:click` syntax or `createEventDispatcher` (Svelte 3/4 patterns).
- Not knowing how to handle event modifiers without the `|` syntax.

---

### Q13. What are Svelte actions (`use:`) and when would you use them?

**Model answer:**

Actions are functions that run when a DOM element is created, providing a way to encapsulate reusable DOM behavior. You apply them with the `use:` directive: `<div use:myAction={params}>`. The action function receives the element and optional parameters, and can return an object with `update` and `destroy` methods.

Actions are the right tool when you need to interact with the DOM imperatively in a way that is reusable across components. Common examples: a `clickOutside` action that detects clicks outside an element, a `tooltip` action that attaches a tooltip library, a `scrollReveal` action that triggers GSAP animations when an element enters the viewport, or an `autoFocus` action that focuses an input on mount.

The `update` method is called whenever the parameter changes, and `destroy` is called when the element is removed from the DOM. This lifecycle maps cleanly to setup/teardown patterns.

In Svelte 5, actions coexist with the newer attachment pattern. Attachments (using `{@attach}`) provide a similar capability but integrate more tightly with the rune system. However, `use:` actions remain widely used, well-documented, and are the standard way to bridge Svelte with imperative DOM libraries like GSAP, Tippy.js, or browser APIs like IntersectionObserver and ResizeObserver.

**What interviewers are really testing:** Whether you know when to encapsulate DOM behavior into a reusable action versus inline `$effect` code, and whether you understand action lifecycle.

**Red flag answers to avoid:**
- Confusing actions with component lifecycle hooks.
- Putting GSAP or DOM manipulation directly in `$effect` when an action would be reusable.

---

### Q14. How do you handle forms in Svelte 5?

**Model answer:**

Svelte 5 provides several layers for form handling depending on complexity. At the simplest level, you use `bind:value` on inputs to create two-way bindings to `$state` variables. For groups of checkboxes or radios, you use `bind:group`. For selects, `bind:value` works on the `<select>` element.

For validation, the course teaches Valibot for schema-based validation. You define a schema, validate user input against it, and display errors reactively. The pattern is: create a `$state` for form data, a `$derived` for validation results, and render errors conditionally.

For server-side form handling, SvelteKit provides form actions (`+page.server.ts` with an `actions` export) and the `use:enhance` directive for progressive enhancement. `use:enhance` intercepts the native form submission, sends it via `fetch`, and updates the page without a full reload — while still working without JavaScript for accessibility.

In the May 2026 version, remote functions provide another option. `form` remote functions handle server-side validation and mutation with Valibot schemas, file uploads, and streaming responses. They are a more modern alternative to form actions for new projects.

The key principle is progressive enhancement: the form should work without JavaScript, then enhance with client-side validation and instant feedback.

**What interviewers are really testing:** Whether you understand progressive enhancement, server-side validation, and the different form handling mechanisms in SvelteKit.

**Red flag answers to avoid:**
- Client-side-only validation without server-side validation.
- Not knowing about `use:enhance` or form actions.

---

### Q15. What is the difference between `.svelte` files and `.svelte.ts` files?

**Model answer:**

A `.svelte` file is a component — it has markup, styles, and script, and it renders UI. A `.svelte.ts` file (or `.svelte.js`) is a module file that can use runes but does not render anything. It is a plain TypeScript file with reactive superpowers.

The Svelte compiler processes `.svelte.ts` files and transforms rune syntax (`$state`, `$derived`, `$effect`) into signal code, just like it does in `.svelte` components. But because there is no template or style block, these files are purely for logic: shared reactive state, reactive utility functions, class-based state managers, and reusable business logic.

This is one of the most important innovations in Svelte 5. In Svelte 3/4, reactive state could only exist inside components. If you wanted shared state, you used stores (`writable`, `readable`). Now, you can export a `$state` variable from a `.svelte.ts` file and import it into multiple components — they all share the same reactive instance. You can also define reactive classes in `.svelte.ts` files, encapsulating state and derived values in an object-oriented pattern.

The naming convention (`.svelte.ts` not just `.ts`) is significant: it tells the Svelte compiler to process the file. A plain `.ts` file cannot use runes.

**What interviewers are really testing:** Whether you understand the distinction between component files and logic modules, and whether you know how to share reactive state across components.

**Red flag answers to avoid:**
- Trying to use runes in plain `.ts` files (the compiler will not process them).
- Still using Svelte stores for new shared state instead of `.svelte.ts` modules.

---

### Q16. How does Svelte handle conditional rendering and list iteration?

**Model answer:**

Svelte uses template syntax blocks for control flow. `{#if condition}...{:else if other}...{:else}...{/if}` for conditional rendering, and `{#each array as item, index (key)}...{/each}` for list iteration. There is also `{#key expression}...{/key}` which destroys and recreates its contents whenever the expression changes.

The `{#each}` block's key expression (in parentheses) is critical for performance and correctness. Without a key, Svelte uses array index, which can cause bugs when items are reordered, inserted, or removed — the DOM nodes get recycled incorrectly. With a key (typically `item.id`), Svelte tracks which DOM node belongs to which data item and can update the list efficiently.

For async data, Svelte provides `{#await promise}...{:then value}...{:catch error}...{/await}`, which handles the three states of a Promise declaratively in the template. In Svelte 5.55+ with remote functions, you can also `await` directly in server-rendered components using async SSR.

Compared to React's JSX approach (where you use JavaScript expressions like `array.map()` and ternary operators), Svelte's block syntax is more readable for complex nesting and does not require explicit `key` prop management — the key is part of the `{#each}` syntax itself.

**What interviewers are really testing:** Whether you understand keyed iteration and why it matters for DOM reconciliation.

**Red flag answers to avoid:**
- Not knowing about keys in `{#each}` or why they matter.
- Using `{#each}` without keys for dynamic lists.

---

### Q17. What is `<svelte:boundary>` and how do error boundaries work?

**Model answer:**

`<svelte:boundary>` is Svelte's error boundary mechanism, stabilized in SvelteKit 2.54+. It catches errors thrown during rendering (and in `$effect` callbacks) within its child tree, preventing the entire page from crashing. Instead, it renders a fallback UI defined by a `failed` snippet.

The usage pattern is: `<svelte:boundary onerror={handler}>{#snippet failed(error, reset)}<p>Something went wrong</p><button onclick={reset}>Retry</button>{/snippet}...normal content...</svelte:boundary>`. The `failed` snippet receives the error object and a `reset` function that re-tries rendering the child tree.

Error boundaries work on the server side as well. During SSR, if a child component throws, the boundary catches it and renders the fallback snippet server-side. This is particularly valuable for Threlte scenes — WebGL APIs are not available on the server, so wrapping a `<Canvas>` in a `<svelte:boundary>` with a static fallback (like a poster image) ensures SSR does not fail while still rendering 3D content on the client.

The `onerror` callback is useful for logging: sending the error to a monitoring service like Sentry. It receives the error and a metadata object with information about where the error occurred.

**What interviewers are really testing:** Whether you know how to build resilient UIs that degrade gracefully, and whether you understand SSR implications.

**Red flag answers to avoid:**
- Not knowing that error boundaries work during SSR.
- Wrapping every component in a boundary (use them strategically at feature boundaries).

---

### Q18. How does Svelte's `transition:` directive work under the hood?

**Model answer:**

Svelte's `transition:` directive applies enter/exit animations when elements are added to or removed from the DOM via control flow blocks (`{#if}`, `{#each}`). When you write `<div transition:fade={{ duration: 300 }}>`, the compiler generates code that intercepts the element's insertion and removal.

On enter, the transition function receives the DOM node and parameters, and returns an object describing the animation: `duration`, `delay`, `easing`, and a `css` function that returns a CSS string for each animation tick (from `t = 0` to `t = 1`). Svelte creates a `@keyframes` animation from these frames and applies it via CSS, which means the animation runs on the compositor thread and does not block the main thread.

On exit, the process reverses: the element is kept in the DOM during the out-transition (even though the `{#if}` condition is false) until the animation completes, then removed.

You can split enter and exit with `in:` and `out:` directives. Built-in transitions include `fade`, `fly`, `slide`, `scale`, `blur`, and `draw` (for SVG). You can also write custom transition functions.

The `animate:flip` directive handles list reordering — it uses the FLIP (First, Last, Invert, Play) technique to smoothly animate elements from their old position to their new position when the array order changes.

**What interviewers are really testing:** Whether you understand that Svelte transitions use generated CSS keyframes (not JavaScript animation loops) and how they coordinate with DOM insertion/removal.

**Red flag answers to avoid:**
- Saying transitions use `requestAnimationFrame` JavaScript loops (they use CSS animations by default).
- Not knowing the difference between `transition:`, `in:/out:`, and `animate:`.

---

### Q19. What is the relationship between Svelte and Vite?

**Model answer:**

Vite is the build tool and dev server that powers SvelteKit. The `vite-plugin-svelte` plugin integrates the Svelte compiler into Vite's pipeline. During development, Vite serves `.svelte` files as ES modules — when your browser requests a component, Vite compiles it on the fly with the Svelte compiler and serves the JavaScript output, using Hot Module Replacement (HMR) to update the browser without a full page reload when you edit a file.

During production builds, Vite bundles the compiled output with Rollup (or the experimental Rolldown bundler in Vite 8), performing tree-shaking, code splitting, and minification. The Svelte compiler runs as part of this pipeline, transforming every `.svelte` and `.svelte.ts` file before bundling.

SvelteKit adds an additional layer on top of Vite: the `@sveltejs/kit` Vite plugin handles server-side rendering, routing, code splitting per route, and adapter-based deployment. When you run `pnpm dev`, SvelteKit starts a Vite dev server with SSR middleware. When you run `pnpm build`, SvelteKit uses Vite to produce both client-side bundles and server-side handlers.

The key takeaway is that Svelte is the compiler, Vite is the build tool, and SvelteKit is the application framework that orchestrates both. You configure Vite in `vite.config.ts` and SvelteKit in `svelte.config.js`.

**What interviewers are really testing:** Whether you understand the toolchain and can troubleshoot build issues.

**Red flag answers to avoid:**
- Confusing Vite with Webpack or thinking Svelte has its own bundler.
- Not knowing that SvelteKit sits on top of Vite.

---

### Q20. How do you test Svelte components?

**Model answer:**

The Svelte testing stack has two layers: unit testing with Vitest and end-to-end testing with Playwright. Vitest runs in Node.js and uses `@testing-library/svelte` to mount components in a simulated DOM (jsdom or happy-dom). You write tests that render a component, interact with it (click buttons, type in inputs), and assert on the DOM output. Vitest also tests `.svelte.ts` modules directly — since reactive logic lives in modules, you can test business logic without rendering any UI.

Playwright runs a real browser and navigates to actual pages. It tests the full SvelteKit application including routing, SSR, data loading, and form submission. You write tests that navigate to URLs, interact with pages, and assert on visible content. Playwright is essential for testing SSR hydration, navigation transitions, and any behavior that depends on a real browser environment.

The testing strategy for a SvelteKit app is: unit test reactive logic and component behavior with Vitest, integration test API routes and load functions with Vitest (making real HTTP requests to a test server), and E2E test critical user journeys with Playwright.

For type safety, the `$types` auto-generated types ensure that your test fixtures match the real data shapes your load functions return. Valibot schemas used for validation can also be reused in tests to generate valid test data.

**What interviewers are really testing:** Whether you have a practical testing strategy and know the right tool for each level of testing.

**Red flag answers to avoid:**
- Only mentioning one type of testing (unit or E2E, not both).
- Not knowing about `@testing-library/svelte`.

---

## SvelteKit (Questions 21–40)

---

### Q21. Explain SSR vs SSG vs CSR. When do you use each?

**Model answer:**

These are SvelteKit's three primary rendering modes, configurable per route. Server-Side Rendering (SSR) generates HTML on the server for every request. The server runs the `load` function, renders the component tree to HTML, sends it to the browser, and then the client-side JavaScript hydrates the page to make it interactive. SSR is the default in SvelteKit and is best for dynamic content that changes per request (user-specific pages, search results, real-time data).

Static Site Generation (SSG) renders HTML at build time. SvelteKit calls the `load` function during `pnpm build`, generates static HTML files, and deploys them to a CDN. Pages are served as static files with no server involved. SSG is best for content that rarely changes: marketing pages, documentation, blog posts. You enable it with `export const prerender = true` in the page or layout.

Client-Side Rendering (CSR) sends a minimal HTML shell and renders everything in the browser with JavaScript. SvelteKit enables this with `export const ssr = false`. CSR is appropriate for pages that cannot be server-rendered (heavy WebGL scenes, authenticated dashboards where the shell is meaningless without user data) and where SEO is not a concern.

SvelteKit's power is that you can mix these modes per route. A marketing landing page can be SSG, the dashboard can be SSR, and the 3D configurator can be CSR — all in the same application, sharing the same layout and navigation. The `+page.ts` or `+layout.ts` file controls the rendering mode with the `prerender`, `ssr`, and `csr` exports.

**What interviewers are really testing:** Whether you can make architecture decisions about rendering based on the content and requirements of each page.

**Red flag answers to avoid:**
- Saying SvelteKit is "only SSR" or "only static."
- Not knowing you can mix rendering modes per route.

---

### Q22. What is hydration and what can go wrong?

**Model answer:**

Hydration is the process where client-side JavaScript takes over a server-rendered HTML page and makes it interactive. When SvelteKit renders a page with SSR, the browser receives complete HTML that is immediately visible. Then the JavaScript bundle loads, Svelte "hydrates" the page by walking the existing DOM, attaching event listeners, and connecting reactive state to DOM nodes — without re-creating the DOM elements.

The critical requirement is that the client-side render must produce the same DOM as the server-side render. If they differ, you get a hydration mismatch. Common causes include: using `Date.now()` or `Math.random()` in rendering (different values on server versus client), accessing `window` or `document` during SSR (they do not exist on the server), rendering based on client-only state like `localStorage`, or conditional logic based on browser features.

Hydration mismatches can cause visual glitches (the page flashes as the client re-renders), broken event handlers (events attached to the wrong nodes), and console warnings. In development, Svelte logs hydration mismatch warnings.

To avoid mismatches: use `$effect` for browser-only code (it only runs on the client), use `import { browser } from '$app/environment'` to conditionally execute browser-specific logic, and ensure your `load` functions return the same data on server and client. For inherently client-only content like Threlte `<Canvas>`, use `{#if browser}` guards or `<svelte:boundary>` with a fallback.

**What interviewers are really testing:** Whether you have dealt with SSR/hydration issues in practice and know the common causes and solutions.

**Red flag answers to avoid:**
- Not knowing what hydration is or confusing it with SSR.
- Using `typeof window !== 'undefined'` in rendering instead of `$effect` or `browser`.

---

### Q23. How do load functions work? Explain universal vs server load functions.

**Model answer:**

Load functions are SvelteKit's primary data-fetching mechanism. They run before a page renders and provide data to the component via the `data` prop. There are two types.

Universal load functions live in `+page.ts` (or `+layout.ts`). They run on the server during SSR and on the client during subsequent navigation. They have access to a special `fetch` function that deduplicates requests, handles cookies during SSR, and allows relative URLs. Because they run on both environments, they cannot use server-only APIs (databases, file system, secrets). They can return non-serializable data like component constructors, functions, and class instances.

Server load functions live in `+page.server.ts` (or `+layout.server.ts`). They only run on the server. They have access to server-only resources: databases, environment variables via `$env/static/private`, session cookies, and file system. Their return values must be serializable because the data is sent to the client as JSON. They receive a `locals` object from hooks, which is where you typically put authenticated user data.

The execution order is: layout load functions run first (top to bottom), then page load functions. If both a universal and server load function exist for the same route, the server load runs first and its data is available to the universal load via `data` in the event object.

SvelteKit automatically generates `$types` for load functions, giving you end-to-end type safety from the load function's return type to the component's `data` prop — with zero manual type declarations.

**What interviewers are really testing:** Whether you understand the dual execution environment and can make the right choice about where to put data-fetching logic.

**Red flag answers to avoid:**
- Putting database queries in universal load functions (they run on the client too).
- Not knowing about `$types` and manually typing load function return values.

---

### Q24. What are remote functions and when would you use them vs `load()`?

**Model answer:**

Remote functions are a major SvelteKit feature introduced in the May 2026 release. They allow components to call server-side functions directly, without defining API routes or load functions. There are three types: `query` for reading data, `command` for mutations, and `form` for form handling with validation.

A `query` remote function is defined with `import { query } from '$app/server'`. It runs on the server and returns data that the component can use. Unlike load functions, queries can be called from any component (not just pages), they can accept arguments, and they integrate with async SSR — you can `await` a query directly in a component's script during server-side rendering.

The key difference from `load()` is the mental model. Load functions are route-level: one load function per page, data flows down via props. Remote functions are component-level: any component can fetch its own data, enabling a more compositional architecture. Load functions are ideal for page-level data that defines the page's content, SEO metadata, and initial state. Remote functions are ideal for component-level data fetching, on-demand queries, and mutations.

`command` remote functions handle mutations (create, update, delete) with optimistic UI patterns. `form` remote functions provide server-side form validation with Valibot schemas and support file upload streaming.

There is also `query.batch()` which batches multiple server calls into a single HTTP request, reducing round trips. And `query.set()` provides server-driven reactive state that pushes updates from the server.

**What interviewers are really testing:** Whether you understand the architectural tradeoffs between route-level and component-level data fetching.

**Red flag answers to avoid:**
- Saying remote functions replace load functions entirely (they complement them).
- Not knowing about the three types (query, command, form).

---

### Q25. How does SvelteKit handle authentication?

**Model answer:**

SvelteKit does not prescribe a specific authentication library, but it provides the primitives to build secure auth flows. The central mechanism is `hooks.server.ts`, which exports a `handle` function that runs on every server request. This is where you validate session tokens, decode JWTs, or check cookies, and populate `event.locals` with the authenticated user.

The typical flow: the user logs in via a form action or API route, which sets an HTTP-only, secure, SameSite cookie. On subsequent requests, the `handle` hook reads the cookie, validates the session (against a database or by verifying a JWT signature), and sets `event.locals.user`. Server load functions and form actions then read `event.locals.user` to gate access. Protected routes check for the user in the load function and throw `redirect(303, '/login')` if absent.

For the client side, the layout server load function returns the user object (or null), which is available to all pages and components via `$page.data`. This avoids fetching the user on every page navigation.

Security considerations: cookies must be `httpOnly` (not readable by JavaScript), `secure` (only sent over HTTPS), and `sameSite: 'lax'` or `'strict'` (CSRF protection). For form actions, SvelteKit provides built-in CSRF protection. Sensitive operations should always validate the session server-side — never trust client-side state for authorization.

Popular libraries that integrate with SvelteKit include Lucia (lightweight sessions), Auth.js (OAuth providers), and custom JWT implementations.

**What interviewers are really testing:** Whether you understand session management, cookie security, and the hooks-based architecture.

**Red flag answers to avoid:**
- Storing tokens in `localStorage` instead of HTTP-only cookies.
- Not knowing about `hooks.server.ts` and `event.locals`.

---

### Q26. How does SvelteKit's file-based routing work?

**Model answer:**

SvelteKit maps the file system inside `src/routes/` to URL paths. Each directory can contain special files that define a route segment. `+page.svelte` renders the page UI, `+page.ts` or `+page.server.ts` provides data loading, `+layout.svelte` defines a layout wrapper, `+error.svelte` handles errors, and `+server.ts` defines API endpoints.

Dynamic segments use square brackets: `src/routes/blog/[slug]/+page.svelte` matches `/blog/hello-world` and provides `params.slug`. Rest parameters use `[...rest]`: `src/routes/docs/[...path]/+page.svelte` matches `/docs/a/b/c` and provides `params.path` as `'a/b/c'`. Optional parameters use double brackets: `[[lang]]/about` matches both `/about` and `/en/about`.

Layouts are nested automatically. A `+layout.svelte` at `src/routes/` wraps all pages. A `+layout.svelte` at `src/routes/dashboard/` wraps all dashboard pages, and inherits the root layout. You can break out of layout nesting with `(group)` directories or `@` layout resets.

Route groups (directories in parentheses like `(auth)`) organize routes without affecting the URL. `src/routes/(auth)/login/+page.svelte` maps to `/login`, not `/(auth)/login`. This is useful for applying a shared layout to a group of routes without adding a URL segment.

**What interviewers are really testing:** Whether you can design a URL structure using the file system and handle edge cases like dynamic routes, groups, and layout resets.

**Red flag answers to avoid:**
- Not knowing about route groups or layout resets.
- Confusing `+page.ts` with `+page.server.ts`.

---

### Q27. What is `$app/state` and how does it differ from the old `$app/stores`?

**Model answer:**

`$app/state` is the modern way to access SvelteKit's runtime state in Svelte 5. It exports reactive objects — `page`, `navigating`, and `updated` — that you can read directly without store subscriptions. `page` contains the current URL, route parameters, data from load functions, form action results, and error information. `navigating` is non-null when a navigation is in progress (useful for showing loading indicators). `updated` indicates when a new version of the app is available.

In Svelte 3/4, the equivalent was `$app/stores`, which exported Svelte stores (`$page`, `$navigating`, `$updated`). You had to use the `$` prefix to subscribe to them, and they were tied to the store contract. With runes in Svelte 5, stores are no longer the idiomatic reactive primitive, so `$app/state` provides the same data as plain reactive objects that integrate naturally with `$derived` and `$effect`.

For example, to reactively compute something from the URL: `let isActive = $derived(page.url.pathname === '/about')`. With stores, you had to write `$: isActive = $page.url.pathname === '/about'`. The new API is cleaner and works in `.svelte.ts` modules where store auto-subscriptions are not available.

`$app/stores` still exists for backward compatibility but is deprecated.

**What interviewers are really testing:** Whether you are using the current API and understand the migration from stores to reactive objects.

**Red flag answers to avoid:**
- Using `$page` with the store subscription syntax instead of the reactive `page` object from `$app/state`.
- Not knowing that `page.data` contains load function data.

---

### Q28. Explain `hooks.server.ts` and its lifecycle.

**Model answer:**

`hooks.server.ts` is SvelteKit's server-side middleware layer. It exports functions that intercept every server request, allowing you to add authentication, logging, error handling, and request transformation.

The primary export is `handle({ event, resolve })`. It receives the request event and a `resolve` function. You can modify the event (setting `event.locals`), add response headers, or short-circuit the response entirely. To continue normal processing, you call `resolve(event)` and return its result. You can compose multiple handlers with the `sequence` helper from `@sveltejs/kit/hooks`.

`handleFetch({ event, request, fetch })` intercepts `fetch` calls made inside load functions during SSR. This is useful for rewriting URLs (pointing internal API calls to an internal service address instead of the public URL) or adding authentication headers.

`handleError({ error, event, status, message })` catches unexpected errors during request handling. It is where you send errors to monitoring services like Sentry. It can return a custom error object that is shown to the user.

The lifecycle order is: `handle` runs first, then route matching, then load functions (which may trigger `handleFetch`), then rendering. If anything throws, `handleError` catches it.

There is also `hooks.client.ts` for client-side hooks, and `instrumentation.server.ts` for OpenTelemetry integration introduced in SvelteKit 2.60+.

**What interviewers are really testing:** Whether you understand where server-side middleware logic lives in SvelteKit and how to implement cross-cutting concerns.

**Red flag answers to avoid:**
- Putting authentication logic in individual load functions instead of centralizing it in `handle`.
- Not knowing about `sequence` for composing multiple hooks.

---

### Q29. How does SvelteKit handle errors?

**Model answer:**

SvelteKit has a layered error handling system. Expected errors are thrown explicitly using the `error()` helper: `throw error(404, 'Not found')`. These set the HTTP status code and render the nearest `+error.svelte` page. The error page receives `$page.error` and `$page.status`.

Unexpected errors (runtime exceptions) are caught by SvelteKit, logged, and converted to a generic "Internal Error" to avoid leaking sensitive information. The `handleError` hook in `hooks.server.ts` intercepts these before the generic error page renders, letting you log them to an error tracking service and optionally return a custom error shape.

The `+error.svelte` hierarchy follows the layout tree. If `src/routes/dashboard/+error.svelte` exists, it handles errors in the dashboard. If not, SvelteKit walks up the tree to `src/routes/+error.svelte`. If no custom error page exists, SvelteKit renders a built-in fallback.

For granular error handling within a page, `<svelte:boundary>` catches rendering errors in a subtree without replacing the entire page. This is useful for isolating third-party components, 3D canvases, or user-generated content that might fail.

In load functions, you can also throw `redirect(status, url)` to redirect the user, which is technically implemented as a special type of error that SvelteKit intercepts and converts to an HTTP redirect.

**What interviewers are really testing:** Whether you have a strategy for both expected and unexpected errors, and whether you know the error boundary hierarchy.

**Red flag answers to avoid:**
- Using try/catch in the page component to handle load function errors (use `+error.svelte`).
- Not distinguishing between expected errors (`error()`) and unexpected runtime exceptions.

---

### Q30. What is `+server.ts` and when would you use it?

**Model answer:**

`+server.ts` defines API endpoints — standalone HTTP handlers that respond to requests at a specific route without rendering a Svelte component. You export functions named after HTTP methods: `GET`, `POST`, `PUT`, `PATCH`, `DELETE`. Each receives a `RequestEvent` and returns a `Response` object.

Use cases: building a REST API consumed by external clients or mobile apps, creating webhook endpoints for third-party services, serving dynamically generated files (PDFs, CSVs, images), handling Stripe webhooks, or implementing an SSE (Server-Sent Events) endpoint.

`+server.ts` can coexist with `+page.svelte` in the same directory. When a request to that route includes an `Accept: application/json` header (or is a non-GET request without a form content type), SvelteKit routes it to the `+server.ts` handler. Otherwise, it renders the page.

Compared to load functions: load functions provide data to a rendered page, while `+server.ts` returns raw HTTP responses. Compared to remote functions: remote functions are component-callable RPC, while `+server.ts` is traditional endpoint-based API design. Use `+server.ts` when you need fine-grained control over HTTP responses, need to serve non-HTML/JSON content, or need endpoints accessible from outside SvelteKit (mobile apps, third-party integrations).

**What interviewers are really testing:** Whether you understand SvelteKit's full server capabilities beyond just rendering pages.

**Red flag answers to avoid:**
- Using `+server.ts` for data that should be provided via load functions or remote functions.
- Not returning a proper `Response` object.

---

### Q31. Explain `depends()` and `invalidate()` in SvelteKit.

**Model answer:**

`depends()` and `invalidate()` are SvelteKit's manual cache invalidation system. In a load function, you call `depends('app:todos')` to register a dependency on a custom identifier. Later, from any component, you call `invalidate('app:todos')` to tell SvelteKit to re-run all load functions that depend on that identifier.

This is useful when data changes outside the normal navigation flow. For example, after creating a new todo via a remote function or form action, you call `invalidate('app:todos')` to refresh the todo list. Without this, SvelteKit would not re-run the load function because the URL has not changed.

`invalidateAll()` re-runs all load functions for the current page, regardless of dependencies. It is a blunt instrument but useful when multiple data sources might have changed.

Load functions also automatically depend on any URLs they fetch. If your load function calls `fetch('/api/todos')`, then `invalidate('/api/todos')` or `invalidate((url) => url.pathname === '/api/todos')` will trigger a re-run.

The common pattern in form actions and remote function commands is: perform the mutation, then `invalidate` the relevant dependency to refresh the UI. This separates the mutation concern from the data-fetching concern and keeps your architecture clean.

**What interviewers are really testing:** Whether you understand SvelteKit's data revalidation model and can manage cache invalidation without full-page reloads.

**Red flag answers to avoid:**
- Forcing a full page reload to refresh data after mutations.
- Not knowing the difference between `invalidate()` and `invalidateAll()`.

---

### Q32. How does SvelteKit handle streaming and progressive rendering?

**Model answer:**

SvelteKit supports streaming SSR in two ways. First, in traditional load functions, you can return a nested promise (not awaited) that the page renders progressively. The load function returns immediately with the available data, and the promise resolves later. In the component, you use `{#await data.slowPromise}` to show a loading state for the deferred data while the rest of the page is already interactive. SvelteKit streams the HTML in chunks — the initial chunk contains the synchronous content, and subsequent chunks contain resolved promise content.

Second, with remote functions and async SSR (Svelte 5.55+), you can `await` server queries directly in component scripts. The server renders as much as it can, streams the initial HTML, and fills in async content as it resolves. This gives a better developer experience because you write straightforward `await` syntax instead of managing `{#await}` blocks.

Streaming is important for performance because it reduces Time to First Byte (TTFB) — the browser starts receiving and rendering HTML before all data is ready. It also improves perceived performance: the user sees the page structure and fast-loading content immediately while slow database queries or API calls resolve in the background.

The trade-off is complexity. Streaming requires the deployment platform to support HTTP streaming (most modern platforms do, but some serverless environments buffer the full response). You also need to design your UI to handle the loading/resolved/error states gracefully.

**What interviewers are really testing:** Whether you understand modern SSR performance techniques and can explain the user experience benefits of streaming.

**Red flag answers to avoid:**
- Thinking all data must resolve before SSR can send any HTML.
- Not knowing that SvelteKit can stream HTML chunks.

---

### Q33. What are SvelteKit adapters and how do you choose one?

**Model answer:**

Adapters are SvelteKit's deployment abstraction layer. They transform the build output into a format that a specific hosting platform can run. SvelteKit generates a platform-agnostic build, and the adapter converts it to the target format.

`@sveltejs/adapter-auto` detects the deployment platform automatically (Vercel, Netlify, Cloudflare Pages) and applies the right adapter. It is the default for new projects and works well for most deployments.

`@sveltejs/adapter-node` produces a standalone Node.js server. Use it for self-hosted deployments, Docker containers, VPS instances, or any environment where you run your own Node.js process.

`@sveltejs/adapter-static` produces pure static files (HTML, CSS, JS). Every page must be prerenderable. Use it for fully static sites deployed to GitHub Pages, S3, or a CDN.

`@sveltejs/adapter-vercel`, `@sveltejs/adapter-netlify`, and `@sveltejs/adapter-cloudflare` provide platform-specific optimizations like edge functions, ISR (Incremental Static Regeneration), and platform-native APIs.

The choice depends on your deployment target and requirements. If you need SSR with WebSocket support, use `adapter-node`. If every page is static, use `adapter-static`. If you deploy to a managed platform, use the platform-specific adapter or `adapter-auto`.

You configure the adapter in `svelte.config.js` and it runs automatically during `pnpm build`.

**What interviewers are really testing:** Whether you understand deployment architecture and can make informed platform choices.

**Red flag answers to avoid:**
- Not knowing what adapters are or that SvelteKit needs one for deployment.
- Using `adapter-node` for a fully static marketing site (use `adapter-static`).

---

### Q34. How does SvelteKit handle environment variables?

**Model answer:**

SvelteKit provides four modules for environment variables, split along two axes: static vs dynamic, and public vs private.

`$env/static/private` — private variables baked in at build time. Imported as named exports. Only available in server-side code (`+page.server.ts`, `+server.ts`, `hooks.server.ts`). The compiler inlines the values, enabling dead-code elimination. Example: `import { DATABASE_URL } from '$env/static/private'`.

`$env/static/public` — public variables baked in at build time. Available everywhere, including client-side code. Must be prefixed with `PUBLIC_`. Example: `import { PUBLIC_API_URL } from '$env/static/public'`.

`$env/dynamic/private` — private variables read at runtime from `process.env`. Use for values that differ between staging and production without rebuilding. Only server-side.

`$env/dynamic/public` — public variables read at runtime. Must be prefixed with `PUBLIC_`. Available client-side.

The static/dynamic distinction matters for performance and security. Static variables are inlined at build time, so they are faster but require a rebuild to change. Dynamic variables can change without rebuilding, which is useful in containerized deployments where environment variables are injected at runtime.

The private/public distinction is a security boundary. Private variables are never sent to the browser — the compiler enforces this. If you accidentally import `$env/static/private` in a client-side module, the build fails with an error.

**What interviewers are really testing:** Whether you understand the security implications of environment variables in a full-stack framework.

**Red flag answers to avoid:**
- Using `process.env` directly instead of SvelteKit's `$env` modules.
- Exposing secrets by using `PUBLIC_` prefix on sensitive values.

---

### Q35. Explain the difference between `+page.ts` and `+page.server.ts`.

**Model answer:**

`+page.ts` defines a universal load function that runs on both server (during SSR) and client (during client-side navigation). It cannot access server-only resources like databases, file systems, or private environment variables. However, it can return non-serializable data: component constructors, functions, class instances, and other JavaScript objects that cannot survive JSON serialization.

`+page.server.ts` defines a server-only load function. It only runs on the server — during SSR and when SvelteKit fetches data for client-side navigation (via an internal API call). It has access to `event.locals` (populated by hooks), private environment variables, databases, and file system APIs. Its return value must be serializable (JSON-compatible) because it is sent to the client over the wire.

`+page.server.ts` can also export `actions` for form handling, which `+page.ts` cannot.

If both files exist in the same route directory, the server load function runs first, and its data is passed to the universal load function via the `data` property of the event. This is useful when you need server-only data fetching (database query in `+page.server.ts`) combined with non-serializable data processing (constructing component instances in `+page.ts`).

The rule of thumb: if you need server-only access, use `+page.server.ts`. If you need to return non-serializable data, use `+page.ts`. If you need both, use both.

**What interviewers are really testing:** Whether you understand the execution environments and serialization constraints.

**Red flag answers to avoid:**
- Not knowing that `+page.ts` runs on the client during navigation.
- Putting database queries in `+page.ts`.

---

### Q36. How do you implement page transitions in SvelteKit?

**Model answer:**

Page transitions in SvelteKit animate the visual change between routes during navigation. The approach involves intercepting SvelteKit's navigation lifecycle and applying Svelte transitions or GSAP animations to the outgoing and incoming page content.

The standard pattern uses the `navigating` state from `$app/state` to detect when navigation starts and ends, combined with a `{#key}` block that triggers transitions when the route changes. In the layout: `{#key page.url.pathname}<div in:fade out:fade><slot /></div>{/key}`. The `{#key}` block destroys and recreates the content when the key changes, which triggers the `in:` and `out:` transitions.

For more complex transitions, you can use the `onNavigate` lifecycle from `$app/navigation` to hook into the View Transitions API (where supported). SvelteKit has built-in support for the View Transitions API, which lets the browser animate between DOM states with CSS. You return a promise from `onNavigate` to coordinate the old and new page rendering.

For GSAP-based transitions, you would use `onNavigate` to trigger GSAP timelines that animate elements out before navigation completes, and `$effect` in the destination page to animate elements in.

Important considerations: respect `prefers-reduced-motion` by checking the media query and disabling or simplifying animations. Keep transitions short (200-400ms) to avoid feeling sluggish. Ensure the transition does not delay content visibility for users who need it immediately.

**What interviewers are really testing:** Whether you can implement smooth navigation experiences while respecting performance and accessibility.

**Red flag answers to avoid:**
- Long, blocking transitions that delay content rendering.
- Not respecting `prefers-reduced-motion`.

---

### Q37. What is `$app/navigation` and what are its key functions?

**Model answer:**

`$app/navigation` provides programmatic navigation functions for SvelteKit applications. The key exports are:

`goto(url, options)` navigates to a new URL programmatically. Options include `replaceState` (replaces the history entry instead of pushing), `noScroll` (prevents scrolling to top), `keepFocus` (maintains focus on the current element), and `invalidateAll` (re-runs all load functions). Use it for navigation after form submissions, authentication redirects, or any imperative navigation needs.

`invalidate(dependency)` re-runs load functions that depend on a specific URL or custom identifier. `invalidateAll()` re-runs all load functions. These are the primary tools for refreshing data after mutations.

`beforeNavigate(callback)` registers a callback that runs before navigation occurs. You can cancel the navigation by calling `cancel()` on the event — useful for "unsaved changes" prompts. It also fires before the browser's `beforeunload` event.

`afterNavigate(callback)` runs after navigation completes, with information about the source and destination. Useful for analytics, scroll restoration, or resetting focus.

`onNavigate(callback)` is a newer hook that runs during navigation and can return a promise. It integrates with the View Transitions API for smooth visual transitions between routes.

`preloadData(url)` and `preloadCode(url)` trigger preloading of the data and JavaScript for a route, respectively. SvelteKit uses these internally for `data-sveltekit-preload-data` on links but you can call them manually.

**What interviewers are really testing:** Whether you know the full navigation API beyond just `goto`.

**Red flag answers to avoid:**
- Using `window.location.href` for navigation instead of `goto` (loses SPA behavior).
- Not knowing about `beforeNavigate` for unsaved-changes guards.

---

### Q38. How do you handle SEO in SvelteKit?

**Model answer:**

SvelteKit has inherent SEO advantages because it renders pages on the server by default, producing complete HTML that search engine crawlers can index immediately. But you need to actively manage several SEO concerns.

Metadata management uses `<svelte:head>` to inject `<title>`, `<meta name="description">`, Open Graph tags, Twitter Card tags, and canonical URLs into the document head. The best practice is a reusable SEO component that accepts typed props and renders all the tags consistently.

Structured data uses JSON-LD scripts (also injected via `<svelte:head>`) to provide machine-readable information to search engines. Common schemas include `Article`, `Organization`, `BreadcrumbList`, `FAQPage`, and `Course`.

Sitemaps are generated dynamically with a `+server.ts` endpoint that produces XML listing all routes with their last-modified dates and change frequencies.

Core Web Vitals (LCP, CLS, INP) are ranking factors. SvelteKit's SSR and streaming help with LCP (content is visible fast), but you need to manage image optimization, font loading, and JavaScript payload size to keep scores high.

For the 2026 landscape, AI Search Optimization (AEO/GEO) is increasingly important. Structured content, clear headings, FAQ schemas, and E-E-A-T signals (expertise, experience, authoritativeness, trustworthiness) help your content appear in AI-generated search summaries.

**What interviewers are really testing:** Whether you have a comprehensive SEO strategy beyond just adding meta tags.

**Red flag answers to avoid:**
- Thinking SSR alone is sufficient for SEO without explicit metadata management.
- Not knowing about structured data or Core Web Vitals.

---

### Q39. How does SvelteKit handle prerendering?

**Model answer:**

Prerendering is SvelteKit's Static Site Generation (SSG) mechanism. When you export `export const prerender = true` from a `+page.ts`, `+page.server.ts`, or `+layout.ts`, SvelteKit renders that page at build time and writes the HTML to a static file.

During `pnpm build`, SvelteKit crawls your application starting from the entry points, runs load functions, renders pages, and outputs static HTML files. For dynamic routes (`/blog/[slug]`), SvelteKit discovers pages by following links in the rendered HTML. You can also provide explicit paths via the `entries` function in `+page.server.ts` if the pages are not discoverable through links.

Prerendered pages are served as static files — no server needed. They can be deployed to any static hosting (CDN, S3, GitHub Pages). The JavaScript still loads and hydrates the page, making it interactive after the initial static render.

You can mix prerendered and server-rendered routes in the same app. Marketing pages and documentation can be prerendered for maximum performance, while dynamic pages (dashboards, user profiles) remain server-rendered.

Configuration options include `export const prerender = true` (always prerender), `export const prerender = 'auto'` (prerender if possible, fall back to SSR), and setting `prerender` in `+layout.ts` to prerender all routes in a subtree.

**What interviewers are really testing:** Whether you understand the tradeoffs of prerendering and when it is appropriate.

**Red flag answers to avoid:**
- Trying to prerender pages with user-specific or request-specific data.
- Not knowing that prerendering happens at build time, not request time.

---

### Q40. What is the difference between `use:enhance` and a regular form submission?

**Model answer:**

A regular HTML form submission causes a full-page navigation: the browser sends the form data, the server processes it, and the browser loads the response as a new page. This works without JavaScript but results in a full page reload.

`use:enhance` is SvelteKit's progressive enhancement directive for forms. When applied to a `<form>`, it intercepts the native submission, sends the data via `fetch` instead of a full navigation, and updates the page without reloading. The form still works without JavaScript (graceful degradation), but with JavaScript, it provides a seamless single-page experience.

By default, `use:enhance` resets the form, invalidates all load functions (to refresh data), and updates the `form` prop with the action's return data. You can customize this behavior by passing a callback: `use:enhance={({ formData, action, cancel, submitter }) => { ... return async ({ result, update }) => { ... } }}`.

In the callback, you can modify the form data before submission, show a loading state, implement optimistic UI (update the UI before the server responds), handle specific result types differently, or cancel the submission entirely. This makes it possible to build sophisticated form experiences that still respect the progressive enhancement principle.

The pattern pairs with SvelteKit's form actions (`+page.server.ts` `actions` export), which handle server-side validation and return structured responses.

**What interviewers are really testing:** Whether you understand progressive enhancement and can explain how `use:enhance` bridges the gap between traditional forms and modern SPA forms.

**Red flag answers to avoid:**
- Preventing native form submission with `event.preventDefault()` and using `fetch` manually instead of `use:enhance`.
- Not knowing that `use:enhance` falls back to native form submission without JavaScript.

---

## CSS & Design Systems (Questions 41–55)

---

### Q41. What is OKLCH and why is it better than HSL?

**Model answer:**

OKLCH is a perceptually uniform color space that represents colors as Lightness (0–100%), Chroma (saturation intensity), and Hue (angle in degrees). The "OK" prefix comes from Bjorn Ottosson's improved Lab color space, and "LCH" stands for Lightness, Chroma, Hue.

The key advantage over HSL is perceptual uniformity. In HSL, a lightness of 50% looks dramatically different depending on the hue: HSL yellow at 50% lightness appears much brighter to the human eye than HSL blue at 50% lightness. This means you cannot create a consistent color palette by simply changing the hue while keeping lightness and saturation constant — the colors will look uneven.

OKLCH solves this. If you keep the L and C values constant and rotate the hue, all resulting colors have the same perceived brightness. This makes it trivial to create harmonious palettes, consistent dark/light themes, and accessible color contrast ratios. You set a lightness that guarantees WCAG contrast against your background, pick a chroma for vibrancy, and rotate the hue freely.

For the PE7 design system, OKLCH tokens look like `oklch(65% 0.22 270)`. Changing the theme is as simple as adjusting the hue angle on your brand color tokens — the derived success, warning, and error colors remain perceptually consistent because they share the same lightness and chroma.

Browser support is excellent in 2026: all modern browsers support `oklch()` in CSS. For the rare legacy browser, you provide an HSL fallback using `@supports`.

**What interviewers are really testing:** Whether you understand color theory and can explain the practical benefits of perceptual uniformity for design system work.

**Red flag answers to avoid:**
- Saying OKLCH is "just HSL with a different name."
- Not being able to explain perceptual uniformity.

---

### Q42. Explain the `@layer` cascade strategy.

**Model answer:**

CSS `@layer` gives you explicit control over the cascade order, independent of selector specificity and source order. You declare layers in order — `@layer reset, tokens, base, layout, components, utilities;` — and any rule inside a later layer wins over any rule in an earlier layer, regardless of specificity.

This solves a long-standing CSS problem: specificity wars. Without layers, a utility class like `.text-red` (specificity 0,1,0) loses to a component rule like `#sidebar .nav-item a` (specificity 1,1,2). With layers, utilities are in a higher layer than components, so `.text-red` always wins even with lower specificity.

The PE7 design system uses six layers. `reset` normalizes browser defaults. `tokens` defines CSS custom properties for colors, spacing, typography, and motion. `base` sets element-level typography and defaults. `layout` handles page-level grid and container structure. `components` contains reusable component styles. `utilities` provides single-purpose override classes.

Rules inside a layer always have lower priority than unlayered rules, which is useful for third-party CSS — you can wrap it in a layer so your own rules always take precedence: `@layer third-party { @import 'library.css'; }`.

In Svelte, `@layer` works inside scoped `<style>` blocks. You can place your component styles in the `components` layer, ensuring they interact predictably with the global token and utility layers.

**What interviewers are really testing:** Whether you understand the cascade beyond just specificity and can design a maintainable style architecture.

**Red flag answers to avoid:**
- Using `!important` to solve specificity issues instead of layers.
- Not knowing the interaction between layers and specificity.

---

### Q43. When do you use container queries vs media queries?

**Model answer:**

Media queries respond to the viewport size: `@media (min-width: 768px)`. They are global — every element on the page sees the same viewport width. This works well for page-level layout decisions (single column on mobile, sidebar on desktop) but breaks down for reusable components that might appear in different containers.

Container queries respond to the size of the component's parent container: `@container (min-width: 400px)`. They are local — a component adapts based on how much space it has, regardless of the viewport. A card component in a narrow sidebar stays compact even on a wide screen, while the same card in a main content area expands.

To use container queries, the parent element must declare a containment context: `container-type: inline-size`. Then child elements can use `@container` queries to adapt. You can name containers with `container-name: sidebar` and target them specifically: `@container sidebar (min-width: 300px)`.

The rule of thumb: use media queries for page layout (how many columns, sidebar visibility, navigation style). Use container queries for component layout (how a card, form, or widget arranges its internal content based on available space). In a design system, container queries are essential because components are used in unpredictable contexts — you do not know whether a card will be in a full-width grid or a narrow sidebar.

In Svelte, container queries work naturally in scoped `<style>` blocks. The PE7 system uses media queries for page layout and container queries for component responsiveness.

**What interviewers are really testing:** Whether you understand component-level responsive design and can choose the right tool.

**Red flag answers to avoid:**
- Using only media queries for everything.
- Not knowing that container queries require `container-type` on the parent.

---

### Q44. How do CSS logical properties help with internationalization?

**Model answer:**

CSS logical properties replace physical direction properties (left, right, top, bottom) with flow-relative equivalents that adapt to the writing direction. `margin-left` becomes `margin-inline-start`, `padding-right` becomes `padding-inline-end`, `border-top` becomes `border-block-start`, `width` becomes `inline-size`, and `height` becomes `block-size`.

In left-to-right (LTR) languages like English, `margin-inline-start` equals `margin-left`. In right-to-left (RTL) languages like Arabic and Hebrew, it equals `margin-right`. This means a single CSS rule handles both directions without any code duplication or `[dir="rtl"]` overrides.

Beyond RTL, logical properties also handle vertical writing modes (used in Chinese, Japanese, and Mongolian). `inline` refers to the text flow direction and `block` refers to the perpendicular direction. In vertical writing, these swap — `inline-size` becomes the height and `block-size` becomes the width.

For a global product, using logical properties from the start means you can add RTL language support by simply setting `dir="rtl"` on the `<html>` element — no CSS changes needed. This saves enormous effort compared to retrofitting physical properties.

The PE7 design system uses logical properties exclusively. All spacing tokens are applied with `margin-inline`, `padding-block`, `inset-inline-start`, etc. This is a future-proof decision that costs nothing in LTR-only products but saves weeks of work if RTL support is ever needed.

**What interviewers are really testing:** Whether you write internationally-aware CSS and understand the inline/block axis model.

**Red flag answers to avoid:**
- Using `margin-left`/`margin-right` instead of `margin-inline-start`/`margin-inline-end`.
- Not knowing what "inline" and "block" mean in CSS.

---

### Q45. What is the `clamp()` function in CSS and how do you use it for fluid typography?

**Model answer:**

`clamp(min, preferred, max)` returns the middle value clamped between a minimum and maximum. For fluid typography, the preferred value uses a viewport unit so the text scales with the screen size: `font-size: clamp(1rem, 0.5rem + 1.5vw, 2rem)`. At narrow viewports, the font size is at least `1rem`. As the viewport grows, it scales at `0.5rem + 1.5vw`. At wide viewports, it caps at `2rem`.

This eliminates the need for multiple media query breakpoints to adjust font sizes. Instead of defining `font-size: 16px` at mobile, `18px` at tablet, and `24px` at desktop with three media queries, a single `clamp()` declaration smoothly scales the text across all viewport widths.

The same technique works for spacing: `padding: clamp(var(--space-sm), 2vw, var(--space-xl))`. And for container widths: `max-inline-size: clamp(320px, 80vw, 1200px)`.

In the PE7 system, fluid values are defined as tokens in the `tokens` layer. Typography tokens use `clamp()` with a `rem` base (ensuring accessibility when users change their browser font size), a `vw` scaling component, and min/max bounds. The formula is typically: `min + (max - min) * (viewport - minViewport) / (maxViewport - minViewport)`, simplified into the three-value `clamp()` syntax.

**What interviewers are really testing:** Whether you understand fluid design principles and can create smooth scaling without breakpoint jumps.

**Red flag answers to avoid:**
- Using `px` as the minimum (not accessible; use `rem`).
- Using only `vw` without a `rem` base (text becomes too small or unreadable at extremes).

---

### Q46. How does native CSS nesting work in Svelte?

**Model answer:**

Native CSS nesting allows you to write nested selectors without a preprocessor. Instead of writing separate rules for `.card` and `.card .title`, you nest them: `.card { color: var(--color-text); .title { font-size: 1.25rem; } }`. The nested `.title` selector is equivalent to `.card .title`.

In Svelte's scoped `<style>` blocks, native CSS nesting works without any additional configuration. The Svelte compiler processes the nested rules and applies its scoping hash to each generated selector. You can nest element selectors, class selectors, pseudo-classes, pseudo-elements, and media queries.

The `&` symbol refers to the parent selector, useful for pseudo-classes: `.button { &:hover { background: var(--color-primary); } &:disabled { opacity: 0.5; } }`. It is also required when the nested selector needs to be appended to the parent: `.card { &--large { padding: var(--space-xl); } }` generates `.card--large`.

Native CSS nesting reduces repetition, improves readability by grouping related styles, and makes refactoring easier because the structure mirrors the markup hierarchy. Combined with Svelte's scoping, you can write clean, structured CSS without preprocessors like Sass or PostCSS — the browser handles nesting natively, and the Svelte compiler handles scoping.

**What interviewers are really testing:** Whether you know modern CSS features and can write structured styles without preprocessors.

**Red flag answers to avoid:**
- Still using Sass/SCSS for nesting in Svelte components (native nesting is supported).
- Not knowing the `&` syntax for parent references.

---

### Q47. Explain the `prefers-reduced-motion` media query and why it matters.

**Model answer:**

`prefers-reduced-motion` is a CSS media query that detects if the user has requested reduced motion in their operating system settings. Many users enable this setting because animations can trigger vestibular disorders (dizziness, nausea), seizures, or simply distraction. Ignoring this preference is both an accessibility failure and potentially harmful.

The implementation approach: design your animations as an enhancement, not a requirement. Your baseline CSS should work without animation. Then add animations inside a query that checks for no preference: `@media (prefers-reduced-motion: no-preference) { .element { transition: transform 300ms ease; } }`. Alternatively, you can remove animations when the user prefers reduced motion: `@media (prefers-reduced-motion: reduce) { *, *::before, *::after { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; } }`.

In Svelte, this affects the `transition:`, `in:`, `out:`, and `animate:` directives. The PE7 system approach is to wrap all motion in a `(prefers-reduced-motion: no-preference)` check. For GSAP animations, you check the preference in JavaScript: `const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches` and skip or simplify animations accordingly.

Crucially, "reduced motion" does not mean "no motion." A fade transition (opacity change) is usually acceptable because it does not involve spatial movement. What triggers vestibular issues is movement: sliding, zooming, parallax scrolling. When the user prefers reduced motion, replace movement-based animations with fades or instant state changes.

**What interviewers are really testing:** Whether you build accessible experiences and understand that motion is a medical accessibility concern, not just a preference.

**Red flag answers to avoid:**
- Ignoring `prefers-reduced-motion` entirely.
- Removing all visual feedback when reduced motion is enabled (use fades instead).

---

### Q48. How do CSS custom properties (CSS variables) work with Svelte components?

**Model answer:**

CSS custom properties are inherited through the DOM tree, which makes them powerful for theming Svelte components. A parent component can set `--card-bg: var(--color-surface)` in its styles, and any child component that reads `var(--card-bg)` will receive that value — even though Svelte's scoped CSS normally prevents style leakage.

Svelte provides a specific syntax for passing custom properties to components: `<Card --card-bg="oklch(90% 0.01 250)" />`. Under the hood, Svelte wraps the component in a `<div style="display: contents; --card-bg: oklch(90% 0.01 250)">` so the property is set on a DOM node that the component's children inherit from.

This pattern is the recommended way to create themeable components. Instead of exposing props for every style value, you define a set of CSS custom property "slots" that consumers can override. The component's `<style>` block uses these properties with fallbacks: `background: var(--card-bg, var(--color-surface))`.

In the PE7 design system, global tokens are defined at `:root` in the `tokens` layer. Components read these tokens and also define their own component-level custom properties. Page-specific color personalities are achieved by overriding token values on a per-route basis, cascading naturally through the component tree.

**What interviewers are really testing:** Whether you understand the inheritance-based theming model and Svelte's component custom property syntax.

**Red flag answers to avoid:**
- Using props and inline styles for all component theming instead of custom properties.
- Not knowing that custom properties cascade through the DOM even with scoped styles.

---

### Q49. What is the `display: contents` CSS value and when would you use it?

**Model answer:**

`display: contents` makes an element "disappear" from the box model. The element itself does not generate a box — it does not participate in layout — but its children are laid out as if they were direct children of the element's parent. The element is still in the DOM (events still work, attributes are accessible), but visually it has no box, no padding, no border, no dimensions.

Svelte uses `display: contents` internally when passing CSS custom properties to components (the wrapping `<div>` uses `display: contents` so it does not interfere with the parent's layout).

In your own code, `display: contents` is useful when you need a semantic wrapper element for accessibility or logic purposes but do not want it to affect layout. For example, a grid parent expects direct children as grid items, but you want to wrap some items in a `<section>` for semantic HTML. Setting `display: contents` on the `<section>` makes its children participate directly in the grid.

Caution: `display: contents` has accessibility concerns in some browser/screen-reader combinations — elements with `display: contents` may lose their semantic role. Always test with screen readers, especially for tables, lists, and interactive elements.

**What interviewers are really testing:** Whether you know this useful but nuanced layout tool and its accessibility implications.

**Red flag answers to avoid:**
- Confusing `display: contents` with `display: none` (contents is still rendered, just no box).
- Using it on interactive or semantic elements without testing accessibility.

---

### Q50. How would you build a dark mode toggle with OKLCH tokens?

**Model answer:**

The OKLCH approach to dark mode is elegant: you define your color tokens at two lightness levels and swap them based on a preference. In the `tokens` layer, you define light-mode colors as default values on `:root`: `--color-surface: oklch(98% 0.01 250)` (very light). Then, under `@media (prefers-color-scheme: dark)` or a `.dark` class on the root element, you redefine the same tokens: `--color-surface: oklch(15% 0.01 250)` (very dark).

Because OKLCH is perceptually uniform, you can systematically transform your palette: dark mode inverts the lightness axis while keeping chroma and hue constant. A light surface at L=98% becomes a dark surface at L=15%. Text color at L=10% becomes L=95%. Brand colors may need chroma adjustment (highly saturated colors can look garish on dark backgrounds), but the hue stays the same.

The toggle implementation: store the user's preference in `localStorage`, apply a `.dark` class to `document.documentElement`, and sync with the OS preference using `prefers-color-scheme`. On the server side, you can read the preference from a cookie (set in `hooks.server.ts`) to avoid a flash of the wrong theme during SSR.

The key insight is that every component already uses `var(--color-surface)`, `var(--color-text)`, etc. Switching to dark mode only changes the token definitions — not a single component style changes. This is the power of a well-designed token system.

**What interviewers are really testing:** Whether you can implement dark mode systematically with tokens rather than ad-hoc color overrides per component.

**Red flag answers to avoid:**
- Defining separate dark-mode styles for every component.
- Not handling the SSR flash (theme applied too late on the client).

---

### Q51. What is CSS Grid's `subgrid` and when would you use it?

**Model answer:**

`subgrid` allows a grid item's children to align to the parent grid's tracks. Without subgrid, nested grids define their own independent tracks that do not align with the parent. With subgrid, a child grid inherits the parent's column or row tracks.

The classic use case is a card grid where each card has a title, body, and footer. Without subgrid, the title heights may differ across cards, causing the bodies and footers to misalign. With subgrid, you set `grid-template-rows: subgrid` on the card (which is a grid item spanning 3 rows), and the card's internal elements align to the parent grid's row tracks — titles align across all cards, bodies align, footers align.

The syntax: the parent defines explicit tracks. The child grid item sets `display: grid` and `grid-template-rows: subgrid` (or `grid-template-columns: subgrid`). The child's children then participate in the parent's tracks.

Subgrid is fully supported in modern browsers as of 2024+. It eliminates the need for JavaScript-based equal-height solutions and complex flexbox workarounds. In the PE7 design system, subgrid is used for form layouts (aligning labels and inputs across rows), card grids, and navigation menus.

**What interviewers are really testing:** Whether you know advanced CSS Grid features and can solve alignment problems without JavaScript.

**Red flag answers to avoid:**
- Using JavaScript to equalize heights instead of subgrid.
- Confusing subgrid with nested grids.

---

### Q52. How do you implement a design token system from scratch?

**Model answer:**

A design token system defines every visual decision as a named CSS custom property, organized into semantic layers. The process starts with primitive tokens — raw values with no semantic meaning: `--gray-100: oklch(95% 0.01 250)`, `--space-4: 1rem`. Then you create semantic tokens that reference primitives and encode purpose: `--color-surface: var(--gray-100)`, `--space-md: var(--space-4)`. Finally, component tokens reference semantic tokens: `--card-padding: var(--space-md)`.

The three tiers ensure that changing a design decision propagates consistently. Updating `--color-surface` changes every surface in the app. Updating `--gray-100` changes every semantic token that references it.

In the PE7 system, tokens are defined in the `@layer tokens` CSS layer and scoped to `:root`. Categories include: colors (OKLCH), spacing (rem-based scale), typography (fluid `clamp()` values for font sizes, line heights, font weights), radii (border-radius values), shadows (layered box-shadows), and motion (duration and easing values for transitions).

Implementation in SvelteKit: create a `tokens.css` file imported in `+layout.svelte`. Use `@layer tokens { :root { ... } }` to place all token definitions in the correct layer. Components reference tokens by name — never use raw values. Dark mode, per-page themes, and responsive adjustments all work by redefining token values at different scopes, never by changing component styles.

**What interviewers are really testing:** Whether you can build a scalable, maintainable CSS architecture, not just write individual styles.

**Red flag answers to avoid:**
- Hard-coding color values in components instead of using tokens.
- Not having a layered token architecture (primitives, semantics, components).

---

### Q53. What is `color-mix()` in CSS and how do you use it?

**Model answer:**

`color-mix()` blends two colors in a specified color space. The syntax is `color-mix(in oklch, var(--color-primary) 80%, transparent)` — this produces a color that is 80% of the primary color mixed with 20% transparent, effectively creating a lighter variant.

This is powerful for design systems because you can derive color variants without defining them manually. From a single brand color token, you can generate hover states (`color-mix(in oklch, var(--color-primary) 85%, black)`), disabled states (`color-mix(in oklch, var(--color-primary) 40%, var(--color-surface))`), and overlay colors (`color-mix(in oklch, var(--color-primary) 10%, transparent)`).

The `in oklch` part is important — it specifies the interpolation color space. Mixing in OKLCH produces perceptually smooth transitions, while mixing in sRGB can produce muddy intermediate colors (especially between complementary hues). Always mix in OKLCH or OKLAB for predictable results.

In the PE7 design system, `color-mix()` reduces the number of tokens you need to define. Instead of defining `--color-primary-100` through `--color-primary-900`, you define `--color-primary` and derive variants with `color-mix()`. This keeps the token set small while providing a rich palette.

**What interviewers are really testing:** Whether you know modern CSS color manipulation and can reduce design system complexity.

**Red flag answers to avoid:**
- Using Sass color functions (`darken()`, `lighten()`) instead of native CSS.
- Mixing colors in sRGB and getting muddy results.

---

### Q54. How do you handle responsive images in a SvelteKit application?

**Model answer:**

Responsive images use the `<picture>` element and `srcset`/`sizes` attributes to serve appropriately sized images based on the device's viewport width and pixel density. The basic pattern: `<img srcset="image-400.webp 400w, image-800.webp 800w, image-1200.webp 1200w" sizes="(max-width: 600px) 100vw, (max-width: 1200px) 50vw, 33vw" src="image-800.webp" alt="Description" />`. The browser calculates which image to download based on the viewport and display density.

In SvelteKit, the `@sveltejs/enhanced-img` package (or Vite image plugins) can automate image optimization. It generates multiple sizes and formats (WebP, AVIF) at build time and produces the correct `srcset` markup.

For dynamic images (user uploads, CMS content), you use an image CDN like Cloudinary, Imgix, or Vercel Image Optimization that serves resized images on-demand via URL parameters.

Key practices: always set explicit `width` and `height` attributes (or `aspect-ratio` in CSS) to prevent Cumulative Layout Shift (CLS). Use `loading="lazy"` for below-the-fold images. Use `fetchpriority="high"` for the Largest Contentful Paint (LCP) image. Serve modern formats (AVIF, WebP) with a `<picture>` fallback to JPEG. Keep image file sizes under performance budgets.

For Threlte scenes, the "hero image" is often a WebGL canvas, which presents LCP challenges — use a static poster image as the initial content and hydrate the 3D scene after load.

**What interviewers are really testing:** Whether you understand the full image optimization pipeline and its impact on Core Web Vitals.

**Red flag answers to avoid:**
- Serving a single large image regardless of viewport size.
- Not setting dimensions and causing CLS.

---

### Q55. What is the `:has()` CSS pseudo-class and how do you use it?

**Model answer:**

`:has()` is a relational pseudo-class that selects an element based on its descendants or subsequent siblings. It is often called the "parent selector" because it allows you to style a parent based on what children it contains — something CSS could never do before.

Examples: `form:has(:invalid) { border-color: var(--color-error); }` styles a form with a red border if any input inside it is invalid. `.card:has(img) { grid-template-rows: auto 1fr; }` adjusts the card layout only when it contains an image. `label:has(+ input:focus) { color: var(--color-primary); }` highlights a label when its adjacent input is focused.

`:has()` is fully supported in modern browsers as of 2024. It eliminates many cases where you previously needed JavaScript to toggle classes on parent elements based on child state.

In Svelte, `:has()` works in scoped `<style>` blocks but requires attention to scoping. Since Svelte adds hash classes to elements, a selector like `.parent:has(.child)` works when both elements are in the same component. For cross-component relationships, you may need `:global()`.

Common use cases in the PE7 system: styling form groups based on validation state, adjusting navigation layout based on content, conditional grid layouts based on the presence of optional elements.

**What interviewers are really testing:** Whether you know modern CSS and can solve problems declaratively that previously required JavaScript.

**Red flag answers to avoid:**
- Using JavaScript to add/remove classes on parents based on child state when `:has()` would work.
- Not knowing browser support status (it is well supported in 2026).

---

## JavaScript/TypeScript (Questions 56–75)

---

### Q56. Explain closures with a real Svelte example.

**Model answer:**

A closure is a function that retains access to variables from its enclosing scope, even after that scope has finished executing. In JavaScript, every function forms a closure over the variables in scope where it was defined.

In Svelte, closures appear constantly in event handlers. Consider this pattern:

```svelte
{#each items as item}
  <button onclick={() => selectItem(item)}>
    {item.name}
  </button>
{/each}
```

Each iteration of the `{#each}` block creates a new scope with its own `item` variable. The arrow function `() => selectItem(item)` closes over that specific `item`. When the button is clicked, the function still has access to the correct `item` — even though the `{#each}` block has long finished executing. Without closures, every button would reference the same (last) `item`.

Closures also appear in `$effect` cleanup functions. When you write `$effect(() => { const id = setInterval(tick, 1000); return () => clearInterval(id); })`, the cleanup function closes over `id`, retaining access to the specific interval that needs to be cleared.

A common closure pitfall in JavaScript (not in Svelte's `{#each}`, which handles it correctly) is the classic `for` loop with `var`: all closures share the same variable. The Svelte compiler avoids this by using block-scoped variables in its generated code.

Understanding closures is fundamental to understanding how event handlers, callbacks, and effects capture state in Svelte.

**What interviewers are really testing:** Whether you understand lexical scoping and can explain why closures make reactive event handlers work.

**Red flag answers to avoid:**
- Not being able to define what a closure is.
- Explaining closures only in abstract terms without a practical example.

---

### Q57. What are discriminated unions and where do you use them?

**Model answer:**

A discriminated union (also called a tagged union) is a TypeScript pattern where a union type has a common property (the discriminant) whose literal type narrows the rest of the type. Each variant of the union has a different value for the discriminant.

```typescript
type LoadState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: User[] }
  | { status: 'error'; error: Error };
```

The `status` property is the discriminant. When you check `if (state.status === 'success')`, TypeScript narrows the type and knows that `state.data` exists. Without the discriminated union, you would need type assertions or unsafe property access.

In Svelte, discriminated unions are ideal for modeling component state machines: loading states, form submission states, authentication states, and multi-step wizard flows. You store the state in a `$state<LoadState>` variable and use `{#if state.status === 'loading'}` in the template to render the correct UI for each state. TypeScript guarantees that you handle all variants and that you only access properties that exist in each branch.

The pattern also prevents impossible states. Without a discriminated union, you might have `isLoading: boolean, data: User[] | null, error: Error | null` — but what does it mean if `isLoading` is true and `data` is non-null? The discriminated union makes it impossible to represent that invalid combination.

**What interviewers are really testing:** Whether you use TypeScript to model domain logic precisely and prevent bugs at the type level.

**Red flag answers to avoid:**
- Using multiple boolean flags instead of a discriminated union for state.
- Not knowing the term "discriminant" or how narrowing works.

---

### Q58. How does async/await work under the hood?

**Model answer:**

`async/await` is syntactic sugar over Promises and generators. An `async` function always returns a Promise. When you `await` an expression, the function pauses execution at that point, yields control back to the event loop, and resumes when the awaited Promise settles.

Under the hood, the JavaScript engine transforms an `async` function into a state machine. Each `await` is a state transition: the code before the first `await` runs synchronously, then the function suspends. When the Promise resolves, the engine schedules the next state (the code after the `await`) as a microtask. Microtasks execute before the next macrotask (like `setTimeout` or user input), which is why `await` resumes quickly.

The event loop processes microtasks (Promise callbacks, `queueMicrotask`) after the current synchronous code finishes but before rendering or processing macrotasks. This means a chain of `await` calls executes efficiently without yielding to rendering between each step.

In SvelteKit, this matters for load functions and remote functions. A load function is an `async` function that SvelteKit awaits before rendering the page. If you `await` multiple sequential fetches, each one suspends execution — making them run serially. To parallelize, you use `Promise.all([fetch1(), fetch2()])` so both requests start simultaneously.

Error handling with try/catch wraps `await` naturally: if the awaited Promise rejects, the `catch` block executes, just like a synchronous throw.

**What interviewers are really testing:** Whether you understand the event loop, microtasks, and can reason about async execution order.

**Red flag answers to avoid:**
- Saying `await` "blocks" the thread (it suspends the function, not the thread).
- Not knowing about `Promise.all` for parallel async operations.

---

### Q59. What are branded types?

**Model answer:**

Branded types are a TypeScript pattern for creating nominal types from structural ones. TypeScript's type system is structural — two types with the same shape are considered identical. But sometimes you need to distinguish between values that have the same shape: a `UserId` should not be interchangeable with an `OrderId`, even though both are strings.

A branded type adds a phantom property that exists only at the type level:

```typescript
type UserId = string & { readonly __brand: 'UserId' };
type OrderId = string & { readonly __brand: 'OrderId' };
```

The `__brand` property never exists at runtime — it is a compile-time marker. You create values using a constructor function: `function createUserId(id: string): UserId { return id as UserId; }`. Once created, a `UserId` cannot be passed where an `OrderId` is expected, even though both are runtime strings.

In a SvelteKit application, branded types are useful for IDs from different database tables, validated strings (like `EmailAddress` that has been validated against a regex), monetary amounts in different currencies, and any domain where type confusion could cause bugs.

Combined with Valibot for validation, you can create a pipeline: raw string input is validated and then branded, ensuring that branded values always satisfy their constraints.

**What interviewers are really testing:** Whether you can use TypeScript's type system beyond basic annotations to enforce domain invariants.

**Red flag answers to avoid:**
- Not knowing how to create a branded type.
- Confusing branded types with runtime type guards (branding is compile-time only).

---

### Q60. Explain the `Proxy` object in JavaScript and why it matters for Svelte.

**Model answer:**

A `Proxy` wraps an object and intercepts fundamental operations: property reads (`get`), property writes (`set`), deletion (`deleteProperty`), and more, via handler traps. You create one with `new Proxy(target, handler)`.

Svelte 5 uses Proxies as the foundation of deep reactive state. When you write `let user = $state({ name: 'Ada', age: 36 })`, the compiled code wraps the object in a Proxy. When any component or effect reads `user.name`, the Proxy's `get` trap fires, registering a dependency. When you write `user.name = 'Grace'`, the Proxy's `set` trap fires, notifying all subscribers that depend on `user.name`.

This is why `$state` provides deep, fine-grained reactivity for objects and arrays. Every property access and mutation is intercepted. Nested objects are also proxied (lazily, when accessed), so `user.address.city = 'Oslo'` also triggers granular updates.

The Proxy-based approach is why `$state.raw` exists — sometimes you do not want the overhead of deep proxying. It is also why `$state.snapshot` exists — when you need to pass state to code that cannot handle Proxies (like `JSON.stringify` or `postMessage`), you need to unwrap the Proxy back to a plain object.

Understanding Proxies helps you debug unexpected behavior: if you log a reactive object and see `Proxy {}` in the console, that is the Proxy wrapper. Use `$inspect` or `$state.snapshot` to see the actual data.

**What interviewers are really testing:** Whether you understand the runtime mechanism behind Svelte's reactivity and can debug Proxy-related issues.

**Red flag answers to avoid:**
- Not knowing what a Proxy is.
- Not connecting Proxies to Svelte's `$state` reactivity system.

---

### Q61. What is the difference between `type` and `interface` in TypeScript?

**Model answer:**

Both `type` aliases and `interface` declarations define object shapes in TypeScript, but they have different capabilities. Interfaces support declaration merging — you can define the same interface name multiple times and TypeScript merges them. Types do not merge; redefining a type name is a compile error. Interfaces can be extended with `extends`. Types can create unions (`A | B`), intersections (`A & B`), mapped types, conditional types, and template literal types — none of which interfaces can do.

For object shapes (props, API responses, database models), both work equally well. The convention in the Svelte ecosystem — and the one this course follows — is to use `interface` for object shapes that might be extended or implemented by classes, and `type` for unions, intersections, utility types, and anything that is not purely an object shape.

In component props, `$props<MyProps>()` works with both interfaces and types. The generated `$types` in SvelteKit use types for load function return types because they need intersection types.

Performance-wise, interfaces are slightly better for the TypeScript compiler when dealing with large codebases because they are cached by name, while complex type aliases may need to be re-evaluated. In practice, the difference is negligible for most projects.

The practical advice: be consistent within your project. Pick a convention and stick to it. The important thing is that every value has a type, not which keyword you used to define it.

**What interviewers are really testing:** Whether you understand the nuances and can make a reasoned choice rather than randomly alternating.

**Red flag answers to avoid:**
- Saying they are "exactly the same."
- Not knowing about declaration merging or union types.

---

### Q62. How does TypeScript's `strict` mode work and why does this course require it?

**Model answer:**

TypeScript's `strict` mode enables a collection of strict type-checking flags: `strictNullChecks` (null/undefined are not assignable to other types), `strictFunctionTypes` (function parameter types are checked contravariantly), `strictBindCallApply` (bind/call/apply are strongly typed), `strictPropertyInitialization` (class properties must be initialized), `noImplicitAny` (every value must have an explicit or inferred type), `noImplicitThis` (this must be typed), and `alwaysStrict` (emits "use strict" in every file).

The most impactful flag is `strictNullChecks`. Without it, every type implicitly includes `null` and `undefined`, which means `string` is really `string | null | undefined`. This hides bugs: you can access `.length` on a possibly-null value without TypeScript warning you. With strict null checks, you must explicitly handle the null case — `if (user) { user.name }` — which catches null pointer errors at compile time.

This course requires `strict: true` because it is the professional standard. Real-world codebases with strict mode catch entire categories of bugs at compile time that would otherwise become runtime errors. In SvelteKit specifically, strict mode ensures that load function return types, component prop types, and form action types are fully sound.

The initial cost is higher — you need more type annotations, more null checks, more explicit handling. But the payoff is enormous: fewer runtime errors, better autocomplete, safer refactoring, and more reliable code. Every production SvelteKit application should use strict mode.

**What interviewers are really testing:** Whether you actually work in strict mode and understand why it matters, or whether you have been using loose TypeScript.

**Red flag answers to avoid:**
- Setting `strict: false` or using `// @ts-ignore` liberally.
- Not knowing what `strictNullChecks` does.

---

### Q63. Explain the `Map` and `Set` data structures and when to use them.

**Model answer:**

`Map` is a key-value collection where keys can be any type (not just strings like plain objects). It maintains insertion order, provides O(1) lookups with `.get(key)`, and has a `.size` property. Use `Map` when you need non-string keys (objects, numbers, symbols), when insertion order matters, or when you frequently add/remove entries (Maps are optimized for this).

`Set` is a collection of unique values. Adding a duplicate value has no effect. It provides O(1) lookups with `.has(value)`, maintains insertion order, and has a `.size` property. Use `Set` when you need to track unique items: selected IDs, visited pages, tags without duplicates.

In Svelte 5, `Map` and `Set` work with `$state` for reactive state. When you create `let selected = $state(new Set<string>())`, the Proxy wraps the Set and intercepts method calls. `selected.add(id)` triggers reactive updates in any component or effect that reads the Set. The same applies to Maps.

Practical Svelte use cases: a `Set` of selected row IDs in a TanStack Table, a `Map` from entity ID to entity for O(1) lookups in a normalized data store, a `Set` of expanded accordion panels. Compared to arrays, Sets provide faster membership testing (`set.has(id)` is O(1) vs `array.includes(id)` is O(n)) and automatic deduplication.

**What interviewers are really testing:** Whether you reach for the right data structure instead of defaulting to arrays and objects for everything.

**Red flag answers to avoid:**
- Using arrays to track unique values (use Set).
- Using plain objects when you need non-string keys (use Map).

---

### Q64. What are generics in TypeScript and how do you use them in Svelte?

**Model answer:**

Generics allow you to write functions, classes, and types that work with any data type while preserving type safety. Instead of using `any` (which disables type checking) or duplicating code for each type, you parameterize the type: `function first<T>(items: T[]): T | undefined { return items[0]; }`. The `T` is determined by usage: `first([1, 2, 3])` infers `T = number`, `first(['a', 'b'])` infers `T = string`.

In Svelte, generics appear in several places. `$props<T>()` uses a generic to type the component's prop interface. `$state<T>(initial)` can be explicitly generic when TypeScript cannot infer the right type (e.g., `$state<User | null>(null)`). Snippet types use generics: `Snippet<[{ item: T }]>`. Svelte also supports generic components with the `generics` attribute: `<script lang="ts" generics="T extends { id: string }">`, allowing a component to work with any data type that satisfies a constraint.

Generic components are powerful for building reusable UI: a `<DataTable>` component that works with any row type, a `<Select>` that preserves the type of the selected value, or a `<List>` that passes typed items to a render snippet. Without generics, these components would use `any` or require the consumer to cast types manually.

The `extends` keyword constrains generics: `T extends { id: string }` means `T` must have an `id` property. This ensures the generic component can safely access `item.id`.

**What interviewers are really testing:** Whether you can write reusable, type-safe code and understand type parameters.

**Red flag answers to avoid:**
- Using `any` instead of generics for flexible components.
- Not knowing about generic constraints with `extends`.

---

### Q65. How does destructuring work in JavaScript and where do you use it in Svelte?

**Model answer:**

Destructuring extracts values from objects and arrays into individual variables. Object destructuring: `const { name, age } = user`. Array destructuring: `const [first, second] = items`. You can rename: `const { name: userName } = user`. You can set defaults: `const { role = 'viewer' } = user`. You can use rest syntax: `const { name, ...rest } = user`.

In Svelte 5, destructuring is fundamental to the component API. `$props()` returns an object that you destructure: `let { title, count = 0, ...rest } = $props<Props>()`. This is the only way to access props in Svelte 5 — there is no alternative syntax.

Destructuring also appears in `{#each}` blocks: `{#each users as { name, email }}` destructures each array element. In load functions: `export async function load({ fetch, params, url })` destructures the event object. In form actions: `export const actions = { default: async ({ request, locals }) => { ... } }`.

Nested destructuring handles complex objects: `const { address: { city, zip } } = user`. Combined with TypeScript, destructured parameters can have type annotations: `function greet({ name, age }: { name: string; age: number })`.

Understanding destructuring is essential for reading Svelte code because it appears in nearly every file — props, load functions, event handlers, actions, and template blocks all use it extensively.

**What interviewers are really testing:** Whether destructuring is second nature to you and you can read/write it fluently.

**Red flag answers to avoid:**
- Accessing props with `props.name` instead of destructuring from `$props()`.
- Not knowing about rest syntax or defaults in destructuring.

---

### Q66. Explain `Promise.all`, `Promise.allSettled`, `Promise.race`, and `Promise.any`.

**Model answer:**

These are Promise combinators for handling multiple async operations. `Promise.all(promises)` waits for all promises to resolve and returns an array of results. If any promise rejects, it immediately rejects with that error. Use it when you need all results and any failure is fatal: loading a page's data from multiple APIs.

`Promise.allSettled(promises)` waits for all promises to settle (resolve or reject) and returns an array of `{ status, value/reason }` objects. It never rejects. Use it when you want to attempt multiple operations and handle each result independently: sending notifications to multiple services where individual failures should not abort the others.

`Promise.race(promises)` resolves or rejects with the first promise that settles. Use it for timeout patterns: `Promise.race([fetchData(), timeout(5000)])`. Whichever finishes first determines the result.

`Promise.any(promises)` resolves with the first promise that fulfills (resolves). It ignores rejections unless all promises reject, in which case it rejects with an `AggregateError`. Use it when you have multiple sources for the same data: try the cache, CDN, and origin simultaneously, use whichever responds first.

In SvelteKit load functions, `Promise.all` is the primary tool for parallel data loading: `const [users, posts] = await Promise.all([fetchUsers(), fetchPosts()])`. This sends both requests simultaneously instead of waiting for one before starting the other, reducing the total load time. SvelteKit also has built-in parallel data loading across layout and page load functions.

**What interviewers are really testing:** Whether you can handle concurrent async operations and choose the right combinator for each scenario.

**Red flag answers to avoid:**
- Only knowing `Promise.all` and not the other combinators.
- Sequentially awaiting independent fetches instead of using `Promise.all`.

---

### Q67. What is the `satisfies` operator in TypeScript?

**Model answer:**

The `satisfies` operator validates that an expression matches a type without widening or narrowing the inferred type. It provides type checking without type assertion.

Consider: `const config = { theme: 'dark', timeout: 3000 } satisfies Config`. This checks that the object matches the `Config` type (compile error if it has missing or extra required properties or wrong types) while preserving the literal types of the values. TypeScript knows `config.theme` is `'dark'` (literal type), not just `string`. With a type annotation (`const config: Config = { ... }`), TypeScript would widen `'dark'` to `string`.

This matters for autocomplete, exhaustiveness checks, and downstream type inference. If `Config` allows `theme: 'dark' | 'light' | 'auto'`, using `satisfies` means TypeScript knows this particular config uses `'dark'` — you can use it in a switch statement with exhaustiveness checking.

In Svelte/SvelteKit, `satisfies` is useful for route configuration objects, design token definitions, and any constant configuration where you want validation against a type while preserving literal type inference. It is also useful for load function return values when you want to check the shape but preserve specific types for the component.

**What interviewers are really testing:** Whether you understand the difference between type annotations (widens), type assertions (unsafe), and `satisfies` (validates without widening).

**Red flag answers to avoid:**
- Using `as Config` (type assertion, unsafe) when you should use `satisfies Config`.
- Not knowing the difference between annotation and `satisfies`.

---

### Q68. How do you handle errors in TypeScript without using `any`?

**Model answer:**

In TypeScript, `catch` clause variables are typed as `unknown` in strict mode (not `any`). This means you cannot access `.message` or `.stack` without first narrowing the type. The proper pattern is:

```typescript
try {
  await riskyOperation();
} catch (err: unknown) {
  if (err instanceof Error) {
    console.error(err.message);  // TypeScript knows it's an Error
  } else {
    console.error('Unknown error:', String(err));
  }
}
```

For application-level errors, define custom error classes: `class NotFoundError extends Error { constructor(public resource: string) { super(`${resource} not found`); } }`. Then narrow with `instanceof`: `if (err instanceof NotFoundError) { ... }`.

In SvelteKit, the `error()` helper throws a specific error type that SvelteKit catches and converts to an HTTP response. For load function errors, you typically throw using `error(404, 'Not found')` rather than `throw new Error()`.

For Valibot validation errors, you narrow with `if (err instanceof ValiError)` to access the structured error details.

The key principle is: never use `catch (err: any)` or `catch (err)` with implicit `any`. Always narrow `unknown` to the specific error type before accessing properties. This catches real bugs — you might catch a string, a number, a null, or a custom error object, and each needs different handling.

**What interviewers are really testing:** Whether you handle errors type-safely and understand the `unknown` type.

**Red flag answers to avoid:**
- Using `catch (err: any)` and accessing `err.message` without narrowing.
- Not defining custom error types for different failure modes.

---

### Q69. What are template literal types in TypeScript?

**Model answer:**

Template literal types use the same backtick syntax as JavaScript template literals but at the type level: `` type EventName = `on${string}` `` creates a type that matches any string starting with "on". Combined with unions, you can generate complex string types: `` type Color = 'red' | 'blue'; type BgColor = `bg-${Color}` `` produces `'bg-red' | 'bg-blue'`.

This is powerful for type-safe APIs that use string patterns. In a design system: `` type SpacingToken = `--space-${'xs' | 'sm' | 'md' | 'lg' | 'xl'}` `` ensures you can only reference valid token names. In a route system: `` type Route = `/blog/${string}` | `/users/${number}` `` constrains URL shapes.

Template literal types work with mapped types to generate exhaustive type mappings. You can create a type that maps every event name to its handler type, or every token name to its value type.

In Svelte, template literal types are useful for typing action parameters, dynamic CSS class generators, and API URL builders. They provide compile-time validation for string-based APIs that would otherwise accept any string and fail at runtime.

**What interviewers are really testing:** Whether you can leverage TypeScript's advanced type system for string-based APIs.

**Red flag answers to avoid:**
- Typing string parameters as `string` when a template literal type would be more precise.
- Not knowing this feature exists.

---

### Q70. Explain the event loop, microtasks, and macrotasks.

**Model answer:**

The JavaScript event loop is the execution model that enables non-blocking async behavior in a single-threaded environment. It processes work in a specific order: run all synchronous code in the current call stack, then process all microtasks, then process one macrotask, then check for rendering updates, then repeat.

Microtasks include Promise callbacks (`.then`, `.catch`, `.finally`), `queueMicrotask()`, and `MutationObserver`. They are processed exhaustively — every microtask queued during microtask processing is also processed before moving on.

Macrotasks include `setTimeout`, `setInterval`, `requestAnimationFrame`, I/O callbacks, and UI events (click, keypress). Only one macrotask is processed per event loop iteration.

This ordering has practical implications in Svelte. When you update `$state`, Svelte batches DOM updates as microtasks. If you update multiple state variables synchronously, the DOM only updates once — after all synchronous code finishes and during microtask processing. This batching is why Svelte is efficient: `count++; name = 'Ada'; list.push(item)` produces a single DOM update, not three.

In `$effect`, reading the DOM immediately after a state change may read the old value because the DOM update microtask has not run yet. This is why `$effect.pre` exists — it runs before the DOM update, and regular `$effect` runs after.

**What interviewers are really testing:** Whether you understand JavaScript's execution model and can reason about the timing of async operations and DOM updates.

**Red flag answers to avoid:**
- Thinking JavaScript is multi-threaded.
- Not knowing the difference between microtasks and macrotasks.

---

### Q71. What is `unknown` vs `any` in TypeScript?

**Model answer:**

`any` disables type checking entirely. A value of type `any` can be assigned to any type and any property can be accessed on it without error. It is an escape hatch from the type system. `unknown` is the type-safe counterpart — a value of type `unknown` can hold any value, but you cannot do anything with it until you narrow it to a specific type.

The difference matters for safety. With `any`: `const x: any = fetchData(); x.foo.bar.baz()` — this compiles but may crash at runtime if `foo` does not exist. With `unknown`: `const x: unknown = fetchData(); x.foo` — this is a compile error. You must narrow first: `if (typeof x === 'object' && x !== null && 'foo' in x)`.

Use `unknown` when you receive data from an external source (API responses, `JSON.parse`, user input, event handler arguments) and want TypeScript to force you to validate it before using it. Use `any` almost never — the only legitimate use is during incremental migration of a JavaScript codebase where you cannot type everything at once.

In SvelteKit, `catch` blocks, `JSON.parse` results, and form data are all `unknown`. The pattern is: receive `unknown`, validate with Valibot or type guards, and then work with the validated, typed result. This is why `any` is banned in this course — every `unknown` must be explicitly narrowed.

**What interviewers are really testing:** Whether you enforce type safety at boundaries and avoid `any`.

**Red flag answers to avoid:**
- Using `any` for API response types.
- Not knowing the difference between `any` and `unknown`.

---

### Q72. How do you use `const` assertions in TypeScript?

**Model answer:**

A `const` assertion (`as const`) tells TypeScript to infer the narrowest possible types for a value. Arrays become readonly tuples, objects become readonly with literal property types, and string/number values become literal types instead of widened primitives.

Without `as const`: `const colors = ['red', 'blue']` has type `string[]`. With `as const`: `const colors = ['red', 'blue'] as const` has type `readonly ['red', 'blue']`. Each element is a string literal type, not just `string`.

This is powerful for defining exhaustive option sets: `const ROLES = ['admin', 'editor', 'viewer'] as const; type Role = typeof ROLES[number]`. The `Role` type is `'admin' | 'editor' | 'viewer'` — derived directly from the runtime array, keeping the values and types in sync.

In Svelte/SvelteKit, `as const` is useful for route definitions, theme options, status enums, and any constant configuration where you want TypeScript to preserve the specific values. Combined with `satisfies`, you can validate a configuration object against a type while preserving its literal types: `const config = { theme: 'dark' } as const satisfies Config`.

**What interviewers are really testing:** Whether you can use `as const` to derive types from values, avoiding duplication between runtime data and type definitions.

**Red flag answers to avoid:**
- Defining a type and a separate constant array for the same set of values (use `as const` to derive one from the other).
- Not knowing about `as const` on objects.

---

### Q73. What is the `infer` keyword in TypeScript?

**Model answer:**

`infer` is used within conditional types to extract a type from a pattern. It declares a type variable that TypeScript fills in during type matching: `type ReturnType<T> = T extends (...args: any[]) => infer R ? R : never`. Here, `infer R` captures the return type of the function. If `T` matches the function pattern, `R` is extracted; otherwise, the result is `never`.

This enables powerful type transformations. You can extract element types from arrays (`T extends Array<infer E> ? E : never`), unwrap Promises (`T extends Promise<infer V> ? V : never`), extract component prop types, and build type-level parsers.

In SvelteKit, `infer` appears in utility types that extract data types from load functions, action return types, and component prop interfaces. The auto-generated `$types` system uses similar inference patterns to flow types from server to client.

While most developers do not write `infer` types daily, understanding it is crucial for reading library types, debugging complex type errors, and building advanced type utilities for your team. It is the tool you reach for when you need to "destructure" a type at the type level.

**What interviewers are really testing:** Whether you can read and understand advanced TypeScript types, even if you do not write them frequently.

**Red flag answers to avoid:**
- Not knowing what `infer` does or where it is used.
- Overusing `infer` in application code (it belongs in library/utility types).

---

### Q74. Explain the difference between `for...of` and `for...in` loops.

**Model answer:**

`for...of` iterates over values of an iterable (arrays, strings, Maps, Sets, generators). `for (const item of items)` gives you each element directly. This is the loop you use 99% of the time in modern JavaScript.

`for...in` iterates over enumerable property keys of an object (including inherited ones). `for (const key in obj)` gives you string keys. It is designed for plain objects, not arrays. Using `for...in` on an array iterates over index strings (`'0'`, `'1'`, `'2'`), includes any enumerable properties added to the array prototype, and is generally unreliable for array iteration.

In Svelte, `{#each}` is the idiomatic way to iterate arrays in templates. In `<script>` blocks and `.svelte.ts` modules, use `for...of` for arrays, Maps, and Sets. Use `for...in` only for iterating object keys, and always pair it with `Object.hasOwn(obj, key)` to skip inherited properties — or better yet, use `Object.keys(obj)`, `Object.values(obj)`, or `Object.entries(obj)` with `for...of`.

The practical rule: if you are iterating values, use `for...of`. If you are iterating object keys and know what you are doing, use `for...in` or (preferably) `Object.entries()`.

**What interviewers are really testing:** Whether you know the difference and will not introduce bugs by using the wrong loop.

**Red flag answers to avoid:**
- Using `for...in` on arrays.
- Not knowing that `for...in` includes inherited properties.

---

### Q75. What are type guards and how do you write custom ones?

**Model answer:**

Type guards are expressions that narrow a type within a conditional block. Built-in type guards include `typeof x === 'string'`, `x instanceof Error`, and `'property' in obj`. After a type guard, TypeScript knows the narrower type within the branch.

Custom type guards use the `is` return type: `function isUser(value: unknown): value is User { return typeof value === 'object' && value !== null && 'name' in value && typeof (value as any).name === 'string'; }`. When this function returns `true`, TypeScript narrows the value to `User` in the calling code.

In Svelte, type guards are essential for handling discriminated unions in templates. You might write `function isSuccess(state: LoadState): state is { status: 'success'; data: User[] }` and use it in `{#if isSuccess(state)}...{/if}`. Inside the block, `state.data` is typed correctly.

Type guards are also critical at application boundaries: validating API responses, form data, URL parameters, and any external input. Valibot's `parse` function acts as a type guard — if it does not throw, the returned value is guaranteed to match the schema type.

The `asserts` keyword creates assertion functions: `function assertUser(value: unknown): asserts value is User`. Instead of returning a boolean, it throws if the value does not match, and TypeScript narrows the type for all subsequent code (not just within an `if` block).

**What interviewers are really testing:** Whether you can enforce types at boundaries where TypeScript's static analysis cannot help.

**Red flag answers to avoid:**
- Using type assertions (`as User`) instead of type guards (unsafe).
- Not validating external data at the boundary.

---

## Performance & Architecture (Questions 76–90)

---

### Q76. Walk me through optimizing a slow SvelteKit page.

**Model answer:**

I start with measurement, not guessing. I run a Lighthouse audit (mobile mode) to get Core Web Vitals scores: LCP (Largest Contentful Paint), CLS (Cumulative Layout Shift), and INP (Interaction to Next Paint). I check the Performance panel in DevTools for long tasks, layout shifts, and blocking resources.

For slow LCP: identify the LCP element (usually a hero image or heading). If it is an image, add `fetchpriority="high"`, ensure it is properly sized with `srcset`, and serve it in WebP/AVIF format. If the LCP is blocked by JavaScript, move data fetching to a server load function so the HTML arrives with content. Use streaming to send the above-fold content immediately while slow data loads in the background.

For poor INP: find the interaction that is slow. Common causes: expensive `$derived` computations re-running on every keystroke, large list re-renders without keyed `{#each}`, and synchronous `$effect` callbacks doing heavy work. Solutions: debounce input handlers, use `$state.raw` for large datasets, virtualize long lists, and move heavy computation to a Web Worker.

For CLS: ensure images and embeds have explicit dimensions, avoid dynamically injected content above the fold, and use CSS `aspect-ratio` for responsive containers.

For bundle size: use dynamic imports for below-the-fold components, audit dependencies with `pnpm why`, tree-shake unused library code, and lazy-load Threlte canvases.

For data loading: parallelize independent fetches with `Promise.all`, use streaming for slow queries, cache responses with appropriate headers, and preload data for likely navigation targets.

**What interviewers are really testing:** Whether you have a systematic approach to performance optimization, not just a bag of tricks.

**Red flag answers to avoid:**
- Starting with code optimization before measuring.
- Focusing only on bundle size and ignoring runtime performance.

---

### Q77. How would you design a component library for a team of 10?

**Model answer:**

I would start with the design system foundations: a shared token set (colors, spacing, typography, motion) defined in a `tokens.css` file, a component contract (TypeScript interfaces for every component's props), and naming conventions.

Architecture: the library lives in a separate package (or a monorepo workspace). Each component is a directory containing the `.svelte` file, a `.svelte.ts` file for any shared logic, a types file, and a test file. Components are generic where appropriate (e.g., `<DataTable<T>>`) and compose via snippets rather than a fixed internal structure.

API design principles: props use TypeScript interfaces with JSDoc descriptions. Every prop has a sensible default. Interactive components use `$bindable()` for values the parent needs to control. Styling uses CSS custom properties as the customization API — not class name overrides. The library provides a `@layer` structure that integrates with consuming projects.

Documentation: Storybook or Histoire for interactive component demos, with stories covering all variants, states, and edge cases. TypeScript types serve as the primary API documentation.

Testing: Vitest with `@testing-library/svelte` for component behavior, Playwright for visual regression testing. Every component has tests for default rendering, prop variations, keyboard navigation, screen reader announcements, and responsive behavior.

Versioning and release: semantic versioning, a changelog generated from conventional commits, and a CI/CD pipeline that runs tests, builds the package, and publishes to the private registry.

For the team of 10: a component contribution guide, PR review checklist (accessibility, mobile-first, token usage), and an RFC process for new components.

**What interviewers are really testing:** Whether you can think about architecture, developer experience, and team collaboration, not just individual component code.

**Red flag answers to avoid:**
- Not mentioning testing or accessibility.
- Designing a component API that uses class names or inline styles for customization.

---

### Q78. What is your testing strategy for a SvelteKit app?

**Model answer:**

I use a three-layer testing pyramid. Unit tests form the base, integration tests the middle, and E2E tests the top.

Unit tests (Vitest): test reactive logic in `.svelte.ts` modules, utility functions, Valibot schemas, and individual component behavior with `@testing-library/svelte`. These are fast, focused, and numerous. I test that components render correctly, respond to user interactions, and display the right state for each variant. For reactive state, I test the logic in isolation without rendering any UI.

Integration tests (Vitest with SvelteKit test helpers): test load functions, form actions, and API routes by making real HTTP requests to a test server. These verify the data flow from server to component without a browser. I test that load functions return the right data for different parameters, that form actions validate input and return appropriate errors, and that API routes respond correctly.

E2E tests (Playwright): test critical user journeys through the full application in a real browser. Login flow, form submission, navigation between pages, error handling, and any behavior that depends on client-side JavaScript (transitions, dynamic content, WebGL). These are slow but catch integration bugs that unit tests miss: SSR/hydration mismatches, cookie handling, and cross-page state.

Coverage targets: I aim for high coverage on business logic (domain rules, validation, state machines) and critical paths (authentication, payment). I do not chase 100% coverage on presentational components — the E2E tests cover them.

Test data: use factories that produce valid, typed test data. Share Valibot schemas between production code and tests.

**What interviewers are really testing:** Whether you have a practical, not theoretical, testing strategy that balances thoroughness with speed.

**Red flag answers to avoid:**
- Only E2E tests (too slow, brittle) or only unit tests (miss integration bugs).
- No mention of testing SSR or load functions.

---

### Q79. How do you handle state that needs to persist across navigation?

**Model answer:**

There are several approaches depending on the state's scope and lifetime.

URL search parameters (`$page.url.searchParams`): ideal for filter state, sort order, pagination, and any state that should be shareable via URL. The state survives navigation, browser back/forward, and page refreshes. Users can bookmark filtered views and share links. Use `goto` with `replaceState: true` to update parameters without adding history entries.

Layout data: state loaded in `+layout.server.ts` or `+layout.ts` persists across navigations within that layout. User session data, global settings, and feature flags are typically loaded here.

Shared reactive modules: a `.svelte.ts` module that exports `$state` persists for the lifetime of the SPA session. If you import `cartStore` from `'$lib/stores/cart.svelte.ts'` in multiple components, they share the same instance. The state survives client-side navigations but is lost on full page reload.

`localStorage`/`sessionStorage`: for state that should persist across page reloads (theme preference, dismissed notifications, draft form data). Access in `$effect` to avoid SSR issues.

Cookies: for state that needs to be available server-side (authentication tokens, language preferences). Set in form actions or API routes, read in `hooks.server.ts`.

The choice depends on: should the state be in the URL (shareable, bookmarkable)? Should it survive page reloads (localStorage, cookies)? Should it be available server-side (cookies, load functions)? Is it per-session or permanent?

**What interviewers are really testing:** Whether you can choose the right persistence mechanism based on requirements.

**Red flag answers to avoid:**
- Using only one mechanism (e.g., only localStorage) for all state.
- Not considering SSR implications of client-only storage.

---

### Q80. How would you implement optimistic UI in SvelteKit?

**Model answer:**

Optimistic UI updates the interface immediately when the user performs an action, before the server confirms the change. If the server rejects the action, the UI rolls back to the previous state. This makes the app feel instant, even with network latency.

The implementation pattern in SvelteKit with remote functions:

1. Store the current state as the "last known good" state.
2. When the user acts (e.g., toggles a favorite), immediately update the local `$state` to reflect the change.
3. Send the mutation to the server via a `command` remote function or form action.
4. If the server confirms, the optimistic update is already in place — no additional UI change needed.
5. If the server rejects, roll back the local state to the "last known good" state and show an error.

```typescript
let items = $state<Item[]>(data.items);

async function toggleFavorite(id: string) {
  const previous = $state.snapshot(items);
  items = items.map(i => i.id === id ? { ...i, favorited: !i.favorited } : i);
  
  try {
    await commands.toggleFavorite(id);
  } catch {
    items = previous;  // rollback
    toast.error('Failed to update');
  }
}
```

For form actions with `use:enhance`, the callback pattern provides the same capability: update the UI in the submit callback, and roll back in the result callback if the action failed.

Key considerations: race conditions (user clicks twice fast), conflict resolution (another user changed the same data), and indicating that the optimistic state is unconfirmed (subtle opacity change or pending indicator).

**What interviewers are really testing:** Whether you can build responsive UIs while handling failure gracefully.

**Red flag answers to avoid:**
- Not implementing rollback on server failure.
- Not considering race conditions.

---

### Q81. What are Core Web Vitals and how does SvelteKit help with each?

**Model answer:**

Core Web Vitals are Google's metrics for user experience quality, used as ranking signals. There are three:

LCP (Largest Contentful Paint) measures loading speed — how quickly the largest visible content element renders. Target: under 2.5 seconds. SvelteKit helps with SSR (HTML arrives with content, no JavaScript needed to render), streaming (above-fold content sent first), and preloading (data and code for likely navigations are fetched in advance via `data-sveltekit-preload-data`).

CLS (Cumulative Layout Shift) measures visual stability — how much the page layout shifts during loading. Target: under 0.1. SvelteKit helps because SSR renders complete layouts (no content-shifting hydration). You help by setting explicit dimensions on images/embeds, using CSS `aspect-ratio`, and avoiding dynamically injected content above the fold.

INP (Interaction to Next Paint) measures responsiveness — how quickly the page responds to user interactions. Target: under 200ms. SvelteKit helps by producing small, efficient JavaScript (Svelte's compiler generates minimal code). You help by avoiding expensive synchronous operations in event handlers, debouncing inputs, virtualizing large lists, and using `$state.raw` for large datasets to avoid proxy overhead.

The combination of SSR, compiler-optimized JavaScript, and fine-grained reactivity gives SvelteKit applications a structural advantage. But the framework can only provide the foundation — you still need to optimize images, manage third-party scripts, and avoid layout shifts.

**What interviewers are really testing:** Whether you understand performance metrics that matter for real users and SEO, and how framework choice affects them.

**Red flag answers to avoid:**
- Not knowing what LCP, CLS, or INP stand for.
- Thinking SvelteKit automatically produces 100 Lighthouse scores without any developer effort.

---

### Q82. How do you implement code splitting in SvelteKit?

**Model answer:**

SvelteKit implements code splitting automatically at the route level. Each page (`+page.svelte`) and its associated load functions are bundled into separate chunks. When the user navigates to a route, only that route's JavaScript is loaded. This means the initial page load only includes the code for the current route plus shared layout code.

Beyond automatic route-based splitting, you can use dynamic imports for heavy components: `const HeavyChart = await import('$lib/components/Chart.svelte')`. In Svelte, you can use `{#await}` to show a loading state: `{#await import('./Chart.svelte') then { default: Chart }}<Chart />{/await}`.

For Threlte (3D) scenes, lazy loading is essential because Three.js is large. You dynamically import the Threlte components and render them only when needed: `{#if visible}{#await import('./Scene.svelte') then { default: Scene }}<Scene />{/await}{/if}`.

SvelteKit also supports preloading. The `data-sveltekit-preload-data` attribute on links tells SvelteKit to fetch the route's data when the user hovers over (or touches) a link, before they click. `data-sveltekit-preload-code` preloads just the JavaScript. This makes navigations feel instant even with code splitting.

You can analyze your bundle with `vite-plugin-visualizer` or the `--bundleAnalysis` flag to identify large dependencies that should be dynamically imported.

**What interviewers are really testing:** Whether you actively manage bundle size and understand the tradeoffs of eager versus lazy loading.

**Red flag answers to avoid:**
- Not knowing that SvelteKit code-splits by route automatically.
- Importing all heavy libraries at the top level.

---

### Q83. How would you handle real-time data in a SvelteKit application?

**Model answer:**

There are several real-time patterns depending on the data freshness requirements:

Server-Sent Events (SSE): the server pushes updates to the client over a single HTTP connection. Implement with a `+server.ts` endpoint that returns a streaming `Response` with `text/event-stream` content type. The client uses the `EventSource` API to subscribe. Good for one-way server-to-client updates: notifications, live feeds, dashboards.

WebSocket: bidirectional communication for chat, collaborative editing, or any feature requiring client-to-server real-time messaging. SvelteKit does not include WebSocket support natively, but you can integrate Socket.IO or ws via a custom server (using `adapter-node` with a custom `server.ts`).

`query.set()` (remote functions, May 2026): server-driven reactive state that pushes updates from server to client. This is the most SvelteKit-native approach for real-time data, handling connection management and reconnection automatically.

Polling with `invalidate()`: for less time-sensitive data, set an interval that calls `invalidate('app:dashboard')` every N seconds. The load function re-runs and the UI updates. Simple to implement, works with any deployment target, but not truly real-time.

Long polling: the client sends a request that the server holds open until data changes. Less common now that SSE is well-supported.

The choice depends on latency requirements, deployment constraints (serverless platforms may not support long-lived connections), and complexity budget.

**What interviewers are really testing:** Whether you know multiple real-time approaches and can choose based on constraints.

**Red flag answers to avoid:**
- Only knowing WebSocket and not SSE or polling.
- Not considering serverless deployment limitations.

---

### Q84. How do you design a SvelteKit application for accessibility?

**Model answer:**

Accessibility is not a feature you add at the end — it is a design constraint from the start. The approach spans semantic HTML, keyboard navigation, screen reader support, and visual accessibility.

Semantic HTML: use `<nav>`, `<main>`, `<article>`, `<section>`, `<header>`, `<footer>`, `<aside>` to define page landmarks. Use headings in order (`<h1>` through `<h6>`). Use `<button>` for actions and `<a>` for navigation. Use `<label>` with `for` attributes on form inputs.

Keyboard navigation: every interactive element must be reachable with Tab and activatable with Enter or Space. Custom components (dropdowns, modals, tabs) must implement the ARIA authoring patterns: arrow keys for navigation within a widget, Escape to close, focus trapping in modals.

ARIA attributes: use `aria-label` for elements without visible text, `aria-describedby` for additional context, `role` for custom widgets, `aria-live` for dynamic content announcements, and `aria-expanded`/`aria-selected` for state.

Focus management: when navigation occurs in a SPA, focus must be moved to the new content. SvelteKit handles this with announcements, but you may need custom focus management for modals, drawers, and dynamic content.

Color contrast: OKLCH makes it easy to verify contrast by checking the lightness difference. Use WCAG AA (4.5:1 for normal text) or AAA (7:1) ratios.

Motion: respect `prefers-reduced-motion` for all animations, transitions, and scroll-triggered effects.

Testing: use Lighthouse accessibility audit (target 100), axe-core for automated checks, and manual testing with screen readers (VoiceOver, NVDA).

**What interviewers are really testing:** Whether accessibility is integral to your development process, not an afterthought.

**Red flag answers to avoid:**
- Not mentioning keyboard navigation.
- Treating accessibility as a checklist to run at the end.

---

### Q85. How would you structure a large SvelteKit application?

**Model answer:**

For a large application, I organize code by feature domain, not by file type. Instead of `components/`, `stores/`, `utils/` at the top level, I use `$lib/features/auth/`, `$lib/features/dashboard/`, `$lib/features/settings/` — each containing its own components, state modules, types, and utilities.

The directory structure:

- `src/routes/` — thin routing layer. Each route file imports from `$lib/features/` and wires up the page. Load functions call domain services. Pages compose feature components.
- `src/lib/features/` — domain modules. Each feature is self-contained with components, `.svelte.ts` state modules, types, and tests.
- `src/lib/components/` — shared UI components (Button, Modal, Input) that are not specific to any feature.
- `src/lib/server/` — server-only utilities (database, auth, email). SvelteKit prevents importing these from client code.
- `src/lib/types/` — shared type definitions.

State management: each feature manages its own state in `.svelte.ts` modules. Cross-feature communication uses SvelteKit's URL-based state, layout data, or context API — never direct imports between features.

Configuration: `+layout.ts` and `+layout.server.ts` define the data boundary for each route group. Route groups `(marketing)`, `(app)`, `(admin)` share layouts and guards within their group.

Dependency management: strict boundaries between features (no circular imports). A feature can depend on shared components but not on other features directly. Feature-to-feature communication goes through the routing layer or shared state.

**What interviewers are really testing:** Whether you can design a codebase that stays maintainable as the team and feature set grow.

**Red flag answers to avoid:**
- Putting everything in a flat `components/` directory.
- Not having any organizational principle beyond file type.

---

### Q86. How do you handle database access patterns in SvelteKit?

**Model answer:**

SvelteKit is agnostic about database choice, but the patterns are consistent. Database access only happens in server-side code: `+page.server.ts`, `+server.ts`, `hooks.server.ts`, and server-side remote functions. Never in `+page.ts` or client-side code.

The architecture: define a database client in `$lib/server/db.ts` (using Drizzle, Prisma, or a raw client). Export typed query functions that encapsulate the SQL/ORM logic. Load functions and form actions call these query functions, never raw database calls.

Connection management: use a singleton connection pool instantiated at module load time. In serverless environments, use connection pooling services (PgBouncer, Neon's serverless driver, PlanetScale's fetch API) because each request may start a new instance.

Type safety: Drizzle and Prisma generate types from the database schema. These types flow through load functions into components via SvelteKit's `$types` system, giving end-to-end type safety from database schema to component template.

Security: always use parameterized queries (never string concatenation). Validate all user input with Valibot before using it in queries. Apply the principle of least privilege — the database user should only have the permissions the application needs.

For real-time: use database triggers with LISTEN/NOTIFY (PostgreSQL) or change streams (MongoDB) to push updates to connected clients via SSE or `query.set()`.

**What interviewers are really testing:** Whether you understand server-side data access patterns, security, and type safety in a full-stack context.

**Red flag answers to avoid:**
- Accessing the database from client-side code.
- Using string concatenation in SQL queries.

---

### Q87. What is your approach to error monitoring and observability in production?

**Model answer:**

Observability in a SvelteKit application spans three areas: error tracking, performance monitoring, and logging.

Error tracking: integrate Sentry (or a similar service) via `hooks.server.ts` `handleError` for server errors and `hooks.client.ts` `handleError` for client errors. The hooks receive the error, stack trace, and request context. Source maps are uploaded during CI/CD so errors are mapped to original TypeScript source lines. Set up alerts for new error types and error rate spikes.

Performance monitoring: Core Web Vitals are collected client-side using the `web-vitals` library and sent to an analytics endpoint. Server-side performance uses OpenTelemetry via `instrumentation.server.ts` (SvelteKit 2.60+) — tracing request duration, load function execution time, and database query performance. Set up dashboards and alerts for performance regression.

Logging: structured logging (JSON) in server code with context (request ID, user ID, route). Use a logging library that supports log levels (debug, info, warn, error) and integrates with log aggregation services (Datadog, Grafana Loki). In production, log at info level and above; in development, log at debug level.

Health checks: a `+server.ts` endpoint at `/health` that verifies database connectivity and returns service status. Used by load balancers and uptime monitors.

The key principle: instrument in development (so you understand what to monitor), alert on anomalies in production (not on every error), and review dashboards weekly to catch gradual degradation.

**What interviewers are really testing:** Whether you think about production reliability, not just feature development.

**Red flag answers to avoid:**
- Using only `console.log` for production monitoring.
- Not knowing about SvelteKit's `handleError` hooks.

---

### Q88. How do you handle internationalization (i18n) in SvelteKit?

**Model answer:**

Internationalization in SvelteKit involves language detection, content translation, URL structure, and locale-aware formatting.

URL strategy: use a `[lang]` parameter in routes — `src/routes/[lang]/about/+page.svelte`. A hook in `hooks.server.ts` detects the language from the URL, falls back to the `Accept-Language` header or a cookie, and sets `event.locals.lang`. The layout load function provides the language to all pages.

Translation: use a library like `paraglide-js` (from the Inlang project) or `svelte-i18n`. Translations are JSON files per language. Components use a `t('key')` function or a reactive message store. The translation function should be type-safe — unknown keys produce TypeScript errors.

Formatting: use `Intl.NumberFormat`, `Intl.DateTimeFormat`, and `Intl.RelativeTimeFormat` for locale-aware number, date, and relative time formatting. These are browser-native APIs that handle locale-specific formatting rules.

CSS: use logical properties (`margin-inline-start` instead of `margin-left`) so layouts automatically adapt to RTL languages. Set the `dir` attribute on `<html>` based on the locale.

SEO: each language version has its own URL, `<html lang="xx">` attribute, `hreflang` link tags pointing to alternate language versions, and a sitemap with language alternates.

Content: for a content-heavy site, use a headless CMS with localization support rather than maintaining translation JSON files manually.

**What interviewers are really testing:** Whether you can design an i18n architecture that handles the full scope: URL routing, translations, formatting, RTL, and SEO.

**Red flag answers to avoid:**
- Hard-coding strings in components.
- Not considering RTL languages.

---

### Q89. How do you manage environment-specific configuration in SvelteKit?

**Model answer:**

SvelteKit provides `$env` modules for environment variables, but configuration management is broader than just env vars. A comprehensive approach:

Environment variables: use `$env/static/private` for build-time server secrets (database URL, API keys), `$env/static/public` for build-time client configuration (API base URL, feature flags). Use `$env/dynamic/private` and `$env/dynamic/public` when values differ between environments without rebuilding (containerized deployments).

Feature flags: implement a feature flag system that reads from environment variables, a configuration service, or a database. Use a typed config object: `const features = { newDashboard: env.FEATURE_NEW_DASHBOARD === 'true' } satisfies FeatureFlags`. Pass flags through layout data so all components can access them.

Per-environment configuration: use `.env`, `.env.production`, `.env.staging` files. Vite loads the appropriate file based on the `--mode` flag. Never commit `.env` files with secrets — use `.env.example` with placeholder values.

Runtime configuration: for values that change without redeployment (maintenance mode, rate limits), read from a database or configuration service in `hooks.server.ts` and cache with a short TTL.

Validation: validate all environment variables at startup using Valibot. If a required variable is missing, fail fast with a clear error message rather than crashing later with a confusing undefined value.

**What interviewers are really testing:** Whether you manage configuration systematically and securely across environments.

**Red flag answers to avoid:**
- Hard-coding environment-specific values.
- Committing secrets to version control.

---

### Q90. How do you implement rate limiting and security headers in SvelteKit?

**Model answer:**

Security in SvelteKit is implemented primarily in `hooks.server.ts` and server configuration.

Rate limiting: implement in the `handle` hook. Track request counts per IP (or per user for authenticated routes) using an in-memory Map with TTL, Redis, or a platform-specific rate limiting service. Return a `429 Too Many Requests` response when the limit is exceeded. Apply different limits to different routes: stricter for login/registration, relaxed for static content.

Security headers: set them in the `handle` hook or via the adapter's configuration. Essential headers: `Content-Security-Policy` (restrict script/style sources), `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY` (prevent clickjacking), `Strict-Transport-Security` (enforce HTTPS), `Referrer-Policy: strict-origin-when-cross-origin`, and `Permissions-Policy` (restrict browser features).

CSRF protection: SvelteKit provides built-in CSRF protection for form actions by checking the `Origin` header. For API routes, validate tokens or use the `SameSite` cookie attribute.

Input validation: validate all user input server-side with Valibot. Never trust client-side validation alone. Sanitize HTML output to prevent XSS (Svelte auto-escapes template expressions, but `{@html}` is dangerous without sanitization).

Authentication: HTTP-only, Secure, SameSite cookies. Never store tokens in localStorage. Validate sessions in the `handle` hook.

Dependency security: run `pnpm audit` in CI/CD. Keep dependencies updated. Use `pnpm overrides` to patch vulnerable transitive dependencies.

**What interviewers are really testing:** Whether you think about security as part of application architecture, not as an afterthought.

**Red flag answers to avoid:**
- Not knowing about Content-Security-Policy.
- Implementing rate limiting on the client side (easily bypassed).

---

## 3D & Animation (Questions 91–100)

---

### Q91. When would you use GSAP vs Svelte transitions?

**Model answer:**

Svelte's built-in transitions (`transition:`, `in:`, `out:`, `animate:`) are the right choice for element enter/exit animations and list reordering. They integrate with Svelte's control flow (`{#if}`, `{#each}`), run via CSS keyframes (compositor thread, no main thread blocking), handle cleanup automatically when elements are removed, and require zero additional dependencies.

GSAP is the right choice when you need: complex multi-step sequences (timelines with overlapping, staggered animations), scroll-driven animations (ScrollTrigger), fine-grained control over animation progress (scrubbing, reversing, seeking), physics-based motion with complex easing, animating values that are not CSS properties (SVG morphing, canvas drawing, counting numbers), or coordinating animations across multiple components.

The boundary is clear: if an element appears, disappears, or reorders in a list, use Svelte transitions. If you need a 12-step animation sequence triggered by scroll position, use GSAP. If you need a 3D object rotating based on scroll, use GSAP with Threlte.

In practice, many projects use both. Svelte transitions handle the common cases (fade in a modal, slide in a notification), and GSAP handles the showcase moments (hero animations, marketing page scroll sequences, interactive data visualizations).

The integration point is `$effect` and `use:` actions. GSAP animations are triggered from `$effect` callbacks and cleaned up in the return function, or encapsulated in reusable actions like `use:scrollReveal`.

**What interviewers are really testing:** Whether you can choose the right tool and not over-engineer simple animations or under-engineer complex ones.

**Red flag answers to avoid:**
- Using GSAP for simple show/hide animations that Svelte transitions handle natively.
- Not knowing about GSAP timelines for complex sequences.

---

### Q92. How do you make a Threlte scene SSR-safe?

**Model answer:**

Threlte (Three.js) requires WebGL, which is only available in the browser. During SSR, there is no `window`, no `document`, no `WebGLRenderingContext`. If you render a Threlte `<Canvas>` component during SSR, it will crash.

The primary solution is conditional rendering: `{#if browser}<Canvas>...</Canvas>{/if}`, where `browser` is imported from `$app/environment`. This skips the 3D scene during SSR entirely and only renders it on the client after hydration.

For better user experience, provide a visual fallback during SSR: a static poster image that matches the 3D scene's appearance. This image renders server-side, giving the user immediate visual content while the 3D scene loads. When hydration completes, replace the poster with the live canvas.

The `<svelte:boundary>` approach is more robust: wrap the Threlte scene in an error boundary with a fallback snippet. If the canvas fails to render (SSR or browser without WebGL), the fallback renders instead. This handles both SSR safety and graceful degradation for browsers that lack WebGL support.

For SEO: canvas content is invisible to crawlers. Add textual descriptions of the 3D content in regular HTML elements (not inside the canvas). Use `<noscript>` tags to provide alternative content for users without JavaScript. The poster image should have descriptive `alt` text.

For LCP: if the 3D scene is the hero, the poster image is the LCP element. Load it eagerly with `fetchpriority="high"` and proper sizing. Lazy-load the Threlte JavaScript to avoid blocking the critical rendering path.

**What interviewers are really testing:** Whether you can build SSR-compatible applications with client-only dependencies and handle graceful degradation.

**Red flag answers to avoid:**
- Not knowing that Three.js/Threlte requires browser APIs.
- Disabling SSR for the entire page just because it has a 3D element.

---

### Q93. What is FLIP animation?

**Model answer:**

FLIP stands for First, Last, Invert, Play — a technique for animating layout changes performantly. It was coined by Paul Lewis (Google) and is the basis of Svelte's `animate:flip` directive.

The process: First — record the current position/size of elements before the change. Last — apply the change (reorder a list, move an element) and record the new position/size. Invert — calculate the difference and apply a CSS transform that moves elements from their new position back to their old position (so visually, nothing has changed). Play — remove the inversion transform with a CSS transition, causing elements to smoothly animate from old position to new position.

The key insight is that CSS transforms (translate, scale) are cheap — they run on the GPU compositor thread without triggering layout or paint. By converting a layout change (which is expensive) into a transform animation (which is cheap), FLIP achieves smooth 60fps animations for operations that would otherwise cause jank.

In Svelte, `animate:flip` automates this entire process for `{#each}` blocks. When the array order changes, Svelte records each element's position, applies the new order, and animates the positional differences using FLIP. You just add `animate:flip={{ duration: 300 }}` to the element inside `{#each}`.

FLIP is also used internally by shared element transitions, list reordering animations, and layout transition libraries. Understanding the principle helps you implement custom FLIP animations for cases Svelte does not handle natively.

**What interviewers are really testing:** Whether you understand why certain animations are performant (compositor-only) and can explain the FLIP technique step by step.

**Red flag answers to avoid:**
- Animating layout properties (`top`, `left`, `width`, `height`) directly instead of using transforms.
- Not knowing what the FLIP acronym stands for.

---

### Q94. How do you optimize a GSAP ScrollTrigger animation in SvelteKit?

**Model answer:**

ScrollTrigger in SvelteKit requires careful setup because of SSR and SPA navigation. The key challenges are: ScrollTrigger depends on the DOM (SSR-unsafe), scroll positions reset during navigation, and ScrollTrigger instances must be cleaned up to avoid memory leaks.

Setup: import ScrollTrigger dynamically or guard with `browser` check. Register it with `gsap.registerPlugin(ScrollTrigger)` inside an `$effect` or `onMount`. Never register it at the module top level.

Cleanup: every ScrollTrigger instance must be killed when the component unmounts. Use `$effect` with a cleanup return: `$effect(() => { const trigger = ScrollTrigger.create({...}); return () => trigger.kill(); })`. For page-level cleanup, use `ScrollTrigger.getAll().forEach(t => t.kill())` in the cleanup.

Navigation: when SvelteKit navigates between pages (client-side), the DOM changes but the window scroll position may persist. Call `ScrollTrigger.refresh()` after navigation completes (in `afterNavigate`) to recalculate trigger positions.

Performance: use `will-change: transform` on animated elements to promote them to compositor layers. Pin sparingly — pinned elements can cause layout recalculations. Use `scrub: true` for scroll-linked animations (smoother than trigger-based). Set `markers: true` during development to visualize trigger positions.

Accessibility: wrap scroll animations in a `prefers-reduced-motion` check. If the user prefers reduced motion, skip the animation and show the content in its final state immediately: `if (prefersReducedMotion) { gsap.set(element, { opacity: 1 }); return; }`.

**What interviewers are really testing:** Whether you can integrate GSAP with SvelteKit's lifecycle without memory leaks or SSR crashes.

**Red flag answers to avoid:**
- Not cleaning up ScrollTrigger instances on navigation.
- Forgetting to handle SSR safety.

---

### Q95. How does the Threlte `<Canvas>` component work?

**Model answer:**

Threlte's `<Canvas>` component is the root of a 3D scene. It creates an HTML `<canvas>` element, initializes a Three.js `WebGLRenderer`, and provides a reactive scene graph context to its children. Every Threlte component (`<T.Mesh>`, `<T.PerspectiveCamera>`, `<T.DirectionalLight>`) must be a descendant of `<Canvas>`.

Under the hood, `<Canvas>` sets up a render loop using `requestAnimationFrame`. On each frame, it traverses the scene graph and calls `renderer.render(scene, camera)`. Threlte's reactivity integration means that when you change a prop on a `<T.Mesh>` component (position, rotation, material color), the scene graph updates and the next frame reflects the change.

The `<T.*>` components are auto-generated wrappers for Three.js classes. `<T.Mesh>` wraps `THREE.Mesh`, `<T.BoxGeometry>` wraps `THREE.BoxGeometry`, and so on. Props map to constructor arguments and properties: `<T.Mesh position={[0, 1, 0]}>` sets `mesh.position.set(0, 1, 0)`.

Performance controls include: `frameloop="demand"` (only re-render when state changes, not every frame), DPR (device pixel ratio) clamping to limit resolution on high-DPI screens, and `size` props to control canvas dimensions.

For SvelteKit integration: `<Canvas>` must be rendered client-side only (guarded with `{#if browser}` or `<svelte:boundary>`). The canvas does not produce semantic HTML, so textual content for SEO must be rendered outside the canvas.

**What interviewers are really testing:** Whether you understand the relationship between Threlte's declarative components and the imperative Three.js API underneath.

**Red flag answers to avoid:**
- Not knowing that Threlte wraps Three.js (thinking it is a standalone 3D engine).
- Not knowing about `frameloop="demand"` for performance.

---

### Q96. What is the difference between `tweened` and `spring` in `svelte/motion`?

**Model answer:**

Both `tweened` and `spring` create animated reactive values that transition smoothly when their target changes, but they use different animation models.

`tweened` uses time-based interpolation. You set a value, and it animates from the current value to the new value over a fixed duration with an easing function: `const progress = tweened(0, { duration: 400, easing: cubicOut })`. Setting `progress.set(100)` animates from 0 to 100 over 400ms with a cubic-out ease. The animation is deterministic — you know exactly how long it takes and what the value is at any point.

`spring` uses physics-based simulation. You configure stiffness (how aggressively it pulls toward the target) and damping (how quickly oscillations die out): `const position = spring(0, { stiffness: 0.15, damping: 0.8 })`. Setting `position.set(100)` animates using a spring model that can overshoot, oscillate, and settle naturally. The duration is not fixed — it depends on the physics parameters and the distance traveled.

Use `tweened` for: progress bars, counters, opacity transitions, and any animation where predictable timing matters. Use `spring` for: draggable elements, touch interactions, cursor followers, and any motion that should feel physically natural with bounce and overshoot.

In Svelte 5, both integrate with the rune system. You can use them in `$effect` callbacks and bind their values to template expressions. They work with numbers, arrays, objects, and any structure where intermediate values can be interpolated.

**What interviewers are really testing:** Whether you understand the difference between time-based and physics-based animation and can choose appropriately.

**Red flag answers to avoid:**
- Confusing `tweened` and `spring` or not knowing the difference.
- Using `tweened` for drag interactions where spring physics would feel more natural.

---

### Q97. How do you handle post-processing effects in Threlte?

**Model answer:**

Post-processing applies full-screen visual effects to the rendered 3D scene — bloom (glow on bright areas), vignette (darkened edges), chromatic aberration (color fringing), depth of field, and color grading. In Threlte, post-processing uses the `@threlte/extras` package which provides declarative components for Three.js's EffectComposer.

The setup: wrap your scene content in an `<EffectComposer>` component, and add effect components as children. `<Bloom intensity={1.5} luminanceThreshold={0.8} />` adds a bloom effect to any pixel brighter than the threshold. `<Vignette offset={0.5} darkness={0.5} />` adds edge darkening. Effects are composable — you can stack multiple effects in order.

Performance considerations: each post-processing pass renders the scene to a texture and applies a shader. Multiple passes multiply the GPU cost. On mobile, limit post-processing to one or two effects. Use `frameloop="demand"` so post-processing only runs when the scene changes.

Accessibility: bright bloom effects can be problematic for photosensitive users. Respect `prefers-reduced-motion` by disabling or toning down post-processing effects. Provide a quality setting (low/medium/high) that users can control.

Integration with PE7: post-processing colors should align with your OKLCH design tokens. Use the same brand hue in your bloom and color grading effects to maintain visual consistency between the 3D scene and the 2D UI.

**What interviewers are really testing:** Whether you can build visually impressive 3D scenes while being mindful of performance and accessibility.

**Red flag answers to avoid:**
- Stacking many post-processing effects without considering performance.
- Not providing a way to disable effects for accessibility.

---

### Q98. How do you implement scroll-driven 3D animations?

**Model answer:**

Scroll-driven 3D animations connect scroll position to 3D scene properties — camera position, mesh rotation, material opacity, light intensity. The approach combines GSAP ScrollTrigger with Threlte's reactive props.

The pattern: create a reactive scroll progress value (0 to 1) using ScrollTrigger's `scrub` mode. Bind Threlte component props to derived values from the scroll progress. As the user scrolls, ScrollTrigger updates the progress, which reactively updates the 3D scene.

Implementation: in the component script, use `$effect` to create a ScrollTrigger that drives a `$state` value. Threlte components bind to `$derived` values computed from that state.

```typescript
let progress = $state(0);

$effect(() => {
  const trigger = ScrollTrigger.create({
    trigger: scrollContainer,
    start: 'top top',
    end: 'bottom bottom',
    scrub: 1,
    onUpdate: (self) => { progress = self.progress; }
  });
  return () => trigger.kill();
});

let cameraY = $derived(2 + progress * 8);
let meshRotation = $derived(progress * Math.PI * 2);
```

The `<T.PerspectiveCamera>` receives `position.y={cameraY}` and the mesh receives `rotation.y={meshRotation}`.

Performance: use `scrub: true` (or a small scrub value like 0.5) for smooth interpolation. Set `frameloop="demand"` on the Threlte canvas but call `invalidate()` from the Threlte `useFrame` hook when scroll progress changes. This avoids rendering 60fps when the user is not scrolling.

**What interviewers are really testing:** Whether you can integrate browser scroll behavior with 3D rendering efficiently.

**Red flag answers to avoid:**
- Re-rendering the 3D scene every frame regardless of scroll activity.
- Using a raw scroll event listener instead of ScrollTrigger (no throttling, no smoothing).

---

### Q99. How do you handle 3D model loading and optimization?

**Model answer:**

3D models in Threlte are loaded as GLTF/GLB files using `useGltf` from `@threlte/extras`. The loading process is asynchronous and needs careful handling for UX and performance.

Loading states: `useGltf` returns a reactive value that is initially `undefined` and resolves to the model data. Show a loading indicator (spinner, skeleton, or progress bar) while the model loads. For hero 3D scenes, show a poster image as the initial content and swap to the 3D scene after loading.

Model optimization: use `gltf-transform` or `glTF-Pipeline` to optimize models before shipping. Compress textures with KTX2/Basis Universal (dramatic size reduction with minimal quality loss). Use Draco compression for geometry. Remove unused materials, animations, and metadata. Keep models under 1-2MB for web delivery.

Level of Detail (LOD): for models that appear at different distances, provide multiple resolution versions and swap based on camera distance. Close-up scenes use the detailed model; distant views use a simplified version.

Caching: browsers cache GLB files like any other static asset. Set appropriate `Cache-Control` headers. For frequently used models, preload them with `<link rel="preload">` or dynamic imports.

Error handling: wrap model loading in `<svelte:boundary>` to catch loading failures gracefully. Show a fallback UI if the model fails to load (network error, corrupt file, unsupported format).

Memory management: Three.js does not automatically dispose GPU resources. When a component with a 3D model unmounts, call `dispose()` on geometries, materials, and textures to free GPU memory. Threlte handles some disposal automatically, but complex scenes may need manual cleanup.

**What interviewers are really testing:** Whether you understand the full pipeline from 3D model creation to optimized web delivery.

**Red flag answers to avoid:**
- Loading unoptimized 50MB models without compression.
- Not handling loading states or errors.

---

### Q100. How do you profile and debug performance issues in a Threlte scene?

**Model answer:**

3D performance debugging requires tools beyond the standard web performance panel. The key metrics are: frame rate (target 60fps), draw calls (number of render passes), triangle count, and GPU memory usage.

Browser DevTools: the Performance panel shows frame timings. Long frames (>16ms) indicate dropped frames. Look for long "Render" sections (GPU-bound) or long "Script" sections (CPU-bound). Chrome's `chrome://gpu` page shows GPU capabilities and active features.

Three.js stats: add a stats panel (`import Stats from 'three/examples/jsm/libs/stats.module'`) that shows FPS, frame time, and memory usage in real-time. In Threlte, attach it to the canvas with a `useFrame` hook.

Renderer info: `renderer.info` provides draw call count, triangle count, texture count, and geometry count. Log these values to identify scenes with too many draw calls (batch similar materials, use instancing) or too many triangles (simplify geometry, use LOD).

GPU profiling: Chrome's WebGL inspector or Spector.js shows every WebGL call per frame, texture memory, and shader compilation. Use these to find expensive shaders or unnecessary state changes.

Common optimizations: merge meshes that share materials (reduces draw calls), use instanced rendering for repeated objects (trees, particles), cull objects outside the camera frustum, limit shadow map resolution, reduce post-processing passes, and use `frameloop="demand"` to avoid rendering when nothing changes.

DPR clamping: on high-DPI screens, rendering at native resolution (3x on some phones) is expensive. Clamp DPR to 1.5 or 2 with `<Canvas dpr={[1, 2]}>`.

**What interviewers are really testing:** Whether you can diagnose and fix 3D performance issues systematically, not just guess.

**Red flag answers to avoid:**
- Not knowing how to check draw call count or triangle count.
- Optimizing blindly without profiling first.

---

*End of Interview Preparation Guide — 100 questions covering Svelte Core, SvelteKit, CSS & Design Systems, JavaScript/TypeScript, Performance & Architecture, and 3D & Animation.*
