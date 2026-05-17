---
module: 2
lesson: 2.13
title: TypeScript with reactive state
duration: 45 minutes
prerequisites:
  - Lesson 2.2 — $state primitives
  - Lesson 2.3 — $state objects
  - Lesson 2.7 — $derived
  - Lesson 1.8 — Interfaces
learning_objectives:
  - Type $state, $derived, and $effect variables correctly
  - Use interfaces and union types to constrain reactive objects
  - Avoid `any` in reactive code with `unknown` and narrowing
  - Extract a typed state into a .svelte.ts file for reuse
  - Build a typed reactive store helper without losing strict mode
status: ready
---

# Lesson 2.13 — TypeScript with reactive state

## 1. Concept — Runes do not break your types

### 1.1 The problem: keeping strict mode green as state grows

Module 2 has shown you a lot of patterns: primitives, objects, arrays, raw state, snapshots, derivations, effects, cleanup. Every one of them plays nicely with TypeScript, but a handful of small mistakes can turn a clean type-checked component into a soup of implicit `any` types. This lesson collects every TypeScript pattern for reactive state in one place so that when you leave Module 2 you have a checklist you can return to.

### 1.2 Typing `$state`

The type of `$state(value)` is the same as the type of `value`. So the three canonical patterns are:

```ts
// Primitive — explicit annotation for clarity.
let count: number = $state(0);

// Object — interface + annotation.
interface Profile { name: string; email: string; }
const profile: Profile = $state({ name: 'Ada', email: 'a@b.c' });

// Array — interface + array type.
interface Todo { id: string; text: string; done: boolean; }
const todos: Todo[] = $state([]);
```

You could rely on inference in many cases, but the explicit annotation is valuable in Module 2 because it makes the shape visible and it guides the editor when you later add fields.

**Empty arrays and objects are the danger case.** `const todos = $state([])` infers `never[]`, which is almost never what you want. Always annotate empty arrays: `const todos: Todo[] = $state([])`.

### 1.3 Typing `$derived`

`$derived(expr)` takes the type of `expr`. `$derived.by(fn)` takes the return type of `fn`. You can annotate the variable or the function:

```ts
const subtotal: number = $derived(items.reduce((a, i) => a + i.price, 0));

const groups: Group[] = $derived.by((): Group[] => {
    // ...
    return result;
});
```

Annotating the variable is usually cleaner. The function form is useful when the arrow's body would otherwise widen to an ambiguous type.

### 1.4 Typing `$effect`

The function passed to `$effect` is `() => void` for a plain effect or `() => () => void` for an effect with cleanup. TypeScript infers both, but you can annotate the parameter for clarity:

```ts
$effect((): (() => void) => {
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
});
```

Almost always, inference is sufficient. Only annotate when you are refactoring and the inference drifts.

### 1.5 Avoiding `any` — reach for `unknown`

If a value's type is genuinely unknown at the point you declare it — for example, the result of `JSON.parse` — use `unknown`, not `any`. `unknown` is the safe counterpart of `any`: the compiler forces you to narrow before using it.

```ts
function load(json: string): Profile | null {
    const parsed: unknown = JSON.parse(json);
    if (
        typeof parsed === 'object' &&
        parsed !== null &&
        'name' in parsed &&
        'email' in parsed &&
        typeof (parsed as Record<string, unknown>).name === 'string' &&
        typeof (parsed as Record<string, unknown>).email === 'string'
    ) {
        return parsed as Profile;
    }
    return null;
}
```

The narrowing is verbose but it means every path that returns a `Profile` is actually a `Profile`. Module 4 (control flow) will introduce the **Valibot** library for concise, schema-driven validation; for now, hand-narrowing is fine.

### 1.6 Extracting state into a `.svelte.ts` file

If two components need to share reactive state, put it in a `.svelte.ts` file. The `.svelte.ts` extension tells Svelte to process the file with the rune compiler, so `$state`, `$derived`, and `$effect` all work:

```ts
// src/lib/counter.svelte.ts
interface CounterState {
    count: number;
    step: number;
}

export const counter: CounterState = $state({
    count: 0,
    step: 1
});

export function increment(): void {
    counter.count += counter.step;
}
```

Two important rules:

1. You cannot export a reassignable reactive variable directly (`export let x = $state(0)` does not work across module boundaries). Either export it as a `const` object whose fields are mutated, or expose it through a getter function.
2. Import it from a component and use it as you would local state — the types carry through correctly.

Module 11 covers this pattern in depth with context API integration. For Module 2, the takeaway is: *reactive state does not have to live in the component*, and TypeScript follows it wherever it goes.

### 1.7 A small typed helper

Here is a useful pattern you will see again in Module 11: a typed function that creates a counter state and returns helpers.

```ts
interface Counter {
    readonly value: number;
    increment: () => void;
    decrement: () => void;
    reset: () => void;
}

export function createCounter(initial: number = 0): Counter {
    let count = $state(initial);
    return {
        get value() { return count; },
        increment: () => { count++; },
        decrement: () => { count--; },
        reset: () => { count = initial; }
    };
}
```

The `get value()` method is the key trick: every time you read `counter.value`, TypeScript returns a `number`, but under the hood the read is a signal read that registers a subscription. You can export `createCounter` from a `.svelte.ts` file and use it anywhere.

## Deep Dive

**Why this matters at scale.** In a 50-component production app with strict TypeScript, type errors in reactive code are the most common CI failure. Developers add a field to a state interface and suddenly ten components fail because they destructure without the new field, or they pass the state to a function expecting the old shape. A team that has internalised the patterns in this lesson — annotating empty arrays, using `unknown` over `any`, exposing state through getter objects — spends minutes fixing type errors instead of hours. Type discipline in reactive code is what separates "TypeScript as a burden" from "TypeScript as a guardrail."

**The mental model.** Think of TypeScript and Svelte's rune system as two independent verification layers that happen to agree on the same variable. TypeScript verifies *shape* — does this object have the right fields of the right types? Svelte verifies *reactivity* — is this value being tracked and updated correctly? Neither layer interferes with the other because `$state`, `$derived`, and `$effect` are erased at compile time from TypeScript's perspective. The variable's type is whatever you annotated; the variable's reactivity is whatever the Svelte compiler wired up. This independence means you can reason about types and reactivity separately, which reduces cognitive load.

**Edge cases.** The `never[]` inference on empty arrays is the single most common TypeScript surprise in Svelte code. It happens because TypeScript has no information to infer the element type from an empty literal. The fix is always explicit annotation. Another edge case: discriminated unions in state. If your state is `type Status = { kind: 'loading' } | { kind: 'done'; data: Result }`, TypeScript narrows correctly inside `{#if status.kind === 'done'}` blocks — Svelte's template compiler cooperates with TypeScript's control flow analysis. But if you try to narrow inside an `$effect`, the narrowing does not persist across the async boundary of the effect's re-execution. Store the narrowed value in a `$derived` instead. A third edge case: generic reactive helpers. When you write `function createList<T>(initial: T[])`, the generic `T` flows through `$state` correctly, but you must ensure the `.svelte.ts` file extension is used so the compiler processes the runes.

**Performance implications.** TypeScript annotations have zero runtime cost — they are erased during compilation. However, the *patterns* you choose have performance implications. The getter pattern (`get value() { return count; }`) creates a property accessor that is marginally slower than a direct field access (one extra function call per read). In practice this is unmeasurable for UI state, but for tight inner loops (iterating 10,000 items), prefer direct field access on a reactive object over getter-based abstractions. The `.svelte.ts` shared-state pattern has no extra cost over component-local state — the signals are identical; only the module boundary differs.

**Cross-module connections.** The typing patterns in this lesson are the foundation for Module 3's typed props (every component prop is an interface field), Module 9's typed load functions (return types flow into PageData), Module 10's typed form actions (ActionData is an interface), and Module 11's typed reactive classes (class fields are annotated state). The getter pattern specifically reappears in Module 11 as the primary API for shared reactive stores. If you master these patterns now, every subsequent module's TypeScript integration will feel like a natural extension rather than a new challenge.

### 1.8 Common interview question

**Q: "What is the `never[]` problem with empty arrays in TypeScript, and how do you solve it in Svelte 5?"**

**Model answer:** When you write `const items = $state([])`, TypeScript infers the type as `never[]` because the empty array literal contains no elements for inference. `never` is the bottom type — no value is assignable to it. Attempting `items.push({ id: '1', text: 'Hello', done: false })` fails because the argument is not assignable to `never`. The fix is to annotate the variable explicitly: `const items: Todo[] = $state([])`. This tells TypeScript the array will hold `Todo` elements, even though it starts empty. This is the single most common TypeScript surprise in Svelte code, and annotating empty collections is the habit that prevents it.

## Going Deeper

**Official docs to read next:**

- [svelte.dev/docs/svelte/typescript](https://svelte.dev/docs/svelte/typescript) — the full Svelte + TypeScript guide.
- [svelte.dev/docs/svelte/$state](https://svelte.dev/docs/svelte/$state) — typing patterns for all `$state` variants.
- [svelte.dev/docs/svelte/svelte-files](https://svelte.dev/docs/svelte/svelte-files) — the `.svelte.ts` file extension and how the compiler processes it.

**Advanced pattern: generic reactive stores with full type inference.** Build a typed, reusable reactive list store:

```ts
// src/lib/stores/list.svelte.ts
export function createList<T>(initial: T[] = []) {
    const items: T[] = $state(initial);
    
    return {
        get items() { return items; },
        get length() { return items.length; },
        add(item: T) { items.push(item); },
        remove(predicate: (item: T) => boolean) {
            const index = items.findIndex(predicate);
            if (index >= 0) items.splice(index, 1);
        },
        clear() { items.length = 0; }
    };
}
```

Usage: `const todos = createList<Todo>()`. The generic `T` flows through every method. `todos.add({ wrong: 'shape' })` is a compile error. The store is reusable, type-safe, and reactive.

**Challenge question (combines Lesson 2.13 + Lesson 2.7 + Lesson 2.3):** Create a `createCounter` function in a `.svelte.ts` file that returns an object with a `value` getter, `increment`, `decrement`, and `reset` methods. Type the return type with an interface. Import it into two different components and verify that both components share the same reactive counter. Explain why the getter pattern (`get value()`) is necessary for reactivity to cross module boundaries.

## 2. Style it — A two-panel comparison

The mini-build shows two panels side-by-side: one typed with explicit annotations, one relying on inference. They produce the same UI. The exercise is to see the difference in the code, not the browser.

## 3. Interact — An empty-array gotcha

The mistake:

```ts
const todos = $state([]);
todos.push({ id: '1', text: 'Hello', done: false });
// Error: Argument of type '{ ... }' is not assignable to parameter of type 'never'.
```

Inference gave `todos` the type `never[]`, so nothing can be pushed. The fix:

```ts
interface Todo { id: string; text: string; done: boolean; }
const todos: Todo[] = $state([]);
```

One annotation, problem solved.

## 4. Mini-build — Typed counter with getter pattern

**File:** `src/routes/modules/02-reactivity/13-typescript-reactive/+page.svelte`

The page demonstrates the getter pattern above with a typed counter component.

### DevTools verification

1. Hover the `counter.value` in your editor. TypeScript should show `number`.
2. Try to assign to `counter.value`. TypeScript should refuse because it is a read-only getter.
3. Click the buttons. The value updates via the helper functions.

## 5. Check your understanding

<details>
<summary><strong>Q1.</strong> What is the inferred type of <code>const todos = $state([])</code>?</summary>

`never[]`. You must annotate empty arrays explicitly with their intended item type: `const todos: Todo[] = $state([])`.
</details>

<details>
<summary><strong>Q2.</strong> Why should you prefer <code>unknown</code> to <code>any</code> for values like <code>JSON.parse</code> results?</summary>

`unknown` forces you to narrow the type before using the value, catching shape mismatches at compile time. `any` silently turns off the type checker for that value, letting bugs through.
</details>

<details>
<summary><strong>Q3.</strong> Why can't you directly export a reassignable reactive variable from a <code>.svelte.ts</code> file?</summary>

Because the Svelte compiler rewrites references to reactive variables into `get`/`set` calls, and those rewrites only happen inside the module where the variable is declared. Another module importing the variable would receive a plain value, not a live signal. Instead, export a `const` object whose fields are mutated, or expose it through a getter.
</details>

<details>
<summary><strong>Q4.</strong> What is the point of the <code>get value()</code> pattern in a typed helper?</summary>

It lets you return an object whose fields look like plain properties but are actually signal reads. Consumers see a clean `counter.value` interface; internally, each read registers a reactive subscription.
</details>

<details>
<summary><strong>Q5.</strong> When should you annotate the variable vs annotate the function body in <code>$derived.by</code>?</summary>

Annotating the variable is cleaner for most cases: `const result: Result = $derived.by(() => { ... })`. Use a function return-type annotation when the arrow body would otherwise widen to an unhelpful type or when the function is factored out into a named helper.
</details>

## 6. Common mistakes

- **Leaving empty arrays un-annotated.** The `never[]` inference bites every learner exactly once.
- **Reaching for `any` when narrowing feels verbose.** Narrowing is the job. Take the time.
- **Trying to export `let x = $state(0)` from a module.** Use `const obj = $state({ x: 0 })` or a getter helper.
- **Over-annotating.** Once a shape is clear, letting TypeScript infer locally is fine. The goal is correctness, not verbosity.

## 7. What's next

Module 2 ends here. Module 3 introduces components and props — where the typed patterns you just learned become the contracts that let components talk to each other.
