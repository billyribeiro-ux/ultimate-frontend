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
