---
module: 5
lesson: 5.2
title: JavaScript functions deeply — declarations, arrows, first-class values
duration: 50 minutes
prerequisites:
  - Lesson 5.1 (lowercase onclick)
  - Module 1 (TypeScript type annotations)
learning_objectives:
  - Write a function declaration, a function expression, and an arrow function and explain when each is idiomatic
  - Type every parameter and every return value of a function with TypeScript
  - Explain what "first-class functions" means and why it matters for event handlers
  - Use a function as a value — store it in a variable, pass it as an argument, return it from another function
  - Recognise the implicit return form of arrow functions and when to prefer it
status: ready
---

# Lesson 5.2 — JavaScript functions deeply

## 1. Concept — The single most important value in JavaScript

### 1.1 Why this lesson exists in the middle of an events module

In Lesson 5.1 you wrote `onclick={increment}` and passed a function to the DOM. That act — passing a function around as if it were a number or a string — is the engine that powers every handler, every callback, every effect, and every snippet in the rest of the course. Before you write more handlers, we need to slow down and make sure you really understand what a function *is* in JavaScript, what shapes it can take, and how TypeScript describes it.

A front-end developer who is vague about functions will spend years confused about closures, binding, higher-order components, promises, and event handlers. A front-end developer who is precise about functions will find that all those topics become mechanical.

### 1.2 Three shapes, one idea

In modern JavaScript, a function is **a value you can run**. That is the whole definition. A number stores a count. A string stores text. A function stores a block of code that can be executed later. There are three common ways to write one, and all three produce the same kind of value.

**Shape 1 — function declaration.** The classic form, introduced at the start of the language.

```ts
function add(a: number, b: number): number {
    return a + b;
}
```

**Shape 2 — function expression stored in a variable.** Use when you want to treat the function as data from the moment it is created.

```ts
const add = function (a: number, b: number): number {
    return a + b;
};
```

**Shape 3 — arrow function.** Introduced in 2015. Shorter, and — crucially — it does not have its own `this`. For event handlers and array methods this is almost always what you want.

```ts
const add = (a: number, b: number): number => a + b;
```

The three `add` values behave identically when you call them. The difference is ergonomic: declarations are hoisted to the top of their scope and read as "statements"; expressions and arrows are values that live exactly where you write them and must be defined before you use them.

### 1.3 First-class values — the rule that changes everything

JavaScript functions are **first-class values**. That phrase means: anywhere you can put a number, you can put a function. You can assign a function to a variable. You can pass a function as an argument to another function. You can return a function from a function. You can store functions inside arrays and objects. You can compare them with `===`. You cannot do those things in every language — in Java before Java 8, you had to wrap every callable in an anonymous class, which is exactly the ugly ceremony first-class functions save you from.

First-class functions are what make `onclick={increment}` legal. You are storing a function value in an attribute. The DOM later pulls that value out and runs it. No magic, no framework trick — the same mechanism you use when you pass a callback to `array.map()`.

```ts
const numbers: number[] = [1, 2, 3];
const doubled: number[] = numbers.map((n: number): number => n * 2);
// doubled is [2, 4, 6]
```

`map` takes a function as an argument and calls it once per element. `onclick` takes a function as an attribute and calls it once per click. Same idea, different runner.

### 1.4 Typing functions — every input, every output

In a TypeScript-strict project, every function parameter must have a type and every function must have a declared or inferred return type. This course uses **explicit return types** for named functions because they catch bugs early: if you return the wrong thing from the wrong branch, TypeScript underlines it before you run the code.

```ts
function greet(name: string): string {
    return `Hello, ${name}`;
}

function logWarning(message: string): void {
    console.warn(message);
}
```

`void` is the return type for a function that does not return a value. Event handlers are almost always `void` — you change some state, you log something, you call `preventDefault()`, but you do not return anything.

You can also type a whole function as a value:

```ts
type ClickHandler = (event: MouseEvent) => void;
const handleClick: ClickHandler = (event) => console.log(event.clientX);
```

Using a type alias like `ClickHandler` is a trick you will return to when you start passing handlers as props in Lesson 5.5.

### 1.5 Implicit return in arrows — a short and a long form

Arrow functions have two bodies. A block body (`{ ... }`) behaves like a normal function: you must write `return` to return a value. An expression body (no braces) implicitly returns the expression.

```ts
const square1 = (n: number): number => {
    return n * n;
};

const square2 = (n: number): number => n * n;
```

Both are legal. The expression form is shorter for one-liners. The block form is clearer when the body has multiple statements. Pick the one that reads best for the specific function.

### 1.6 Why arrow functions are the default for event handlers

Arrow functions inherit `this` from the surrounding code instead of binding their own. In old OO-heavy JavaScript, the wrong `this` inside a handler was a famous source of bugs — you would write `element.addEventListener('click', this.doSomething)` and then `this` inside `doSomething` would refer to the DOM element, not your class instance. Arrow functions fixed that by refusing to have their own `this` in the first place. In this course you will almost never write `this` at all (we prefer Svelte runes to classes), but knowing the rule protects you from surprises when you read other people's code.

## Deep Dive

**Why this matters at scale.** In a 50-component production app, functions are the connective tissue. Every event handler is a function. Every derived computation calls a function. Every API interaction is wrapped in a function. A team that writes functions poorly — missing return types, unclear parameter contracts, side effects hidden in pure-looking helpers — produces a codebase that is hard to test, hard to refactor, and hard to onboard into. Understanding functions deeply (parameters, return values, closures, purity) is not academic — it is the difference between a codebase that scales to 20 developers and one that collapses under its own complexity.

**The mental model.** Think of a function as a vending machine. It has input slots (parameters), a mechanism inside (the body), and an output tray (the return value). You put the exact items the machine expects into the slots; it processes them; it gives you back exactly what it promises. An arrow function is a compact vending machine — same inputs, same outputs, just physically smaller. The machine never reaches outside itself to grab items from the room (that would be a side effect). If it does, it is a different kind of machine — an effectful one — and you should label it clearly (by putting it in `$effect` rather than `$derived`).

**Edge cases.** A subtle trap with arrow functions: `const fn = () => ({ key: 'value' })`. If you forget the parentheses around the object literal, JavaScript interprets the braces as a function body and `key:` as a label statement — returning `undefined`. This is a silent bug that TypeScript catches only if you annotate the return type. Another edge case: default parameter values are evaluated fresh on each call, not once at definition time. `function add(items: string[] = [])` creates a new array per call, which is correct but different from Python's mutable-default trap. A third subtlety: rest parameters (`...args: string[]`) must be last and create a real array, unlike the old `arguments` object which was array-like but not a real array.

**Performance implications.** Function creation in JavaScript is cheap — a few hundred nanoseconds for a closure allocation. Creating inline arrow functions in Svelte templates (`onclick={() => handleClick(id)}`) creates a new function reference on every render, but because Svelte does not do reference-equality checks for event handlers (unlike React's `useCallback`), this is perfectly fine. There is no unnecessary re-render triggered by a new function reference. The main performance consideration is the function body itself — keep event handlers lean and move expensive computation into `$derived` where it is cached.

**Cross-module connections.** Functions are the medium through which every module communicates. Module 5 continues with event handlers (functions that receive DOM events). Module 9's load functions are functions with specific signatures. Module 10's form actions are functions that process form data. Module 11's reactive helpers are functions that create and return state. The distinction between pure functions (safe for `$derived`) and effectful functions (belong in `$effect`) is the single most important function-classification skill in Svelte development.

## 2. Style it — A row of themed buttons

The mini-build is a row of buttons, each wired to a different arithmetic function. Reuse the button styles from Lesson 5.1 and add a per-page personality (warm orange this time). Keep all tokens, keep the 44 px minimum target, keep the reduced-motion safety net.

## 3. Interact — Handler as a value you can swap

The lesson's JS concept is that handlers are swappable values. Store three arithmetic functions in a lookup object and pass the *selected* one to `onclick`. A single `apply(name)` helper looks the function up and runs it, so each button's `onclick` is a one-line arrow.

```ts
type Operation = (n: number) => number;

const operations: Record<string, Operation> = {
    double: (n) => n * 2,
    increment: (n) => n + 1,
    square: (n) => n * n
};
```

## 4. Mini-build — A function playground

**File:** `src/routes/modules/05-events/02-functions-deeply/+page.svelte`

Highlights:

- Three named functions — a declaration, an expression, and an arrow — all typed `(n: number) => number`.
- A `Record<string, Operation>` lookup so the button wiring is one arrow per button.
- A live-updating `$state` number that each button mutates.
- A visible list of "last 5 operations" so you can see handlers running as values.

### Run it

```bash
pnpm dev
```

Open `http://localhost:5173/modules/05-events/02-functions-deeply`.

### DevTools verification

Open the Console and type `typeof $0.onclick` after selecting one of the buttons in the Elements panel. The answer is `"function"` — the attribute literally holds a function value.

## 5. Check your understanding

<details>
<summary><strong>Q1.</strong> What does "first-class functions" mean and why does it matter for <code>onclick</code>?</summary>

It means a function is a value that can be stored, passed, and returned like any other value. `onclick={handle}` is only legal because you can use a function as the value of an attribute.
</details>

<details>
<summary><strong>Q2.</strong> Write a TypeScript type for a function that takes two numbers and returns a number.</summary>

`type BinaryOp = (a: number, b: number) => number;`
</details>

<details>
<summary><strong>Q3.</strong> What is the difference between <code>const f = () => 1</code> and <code>const f = () => { 1 }</code>?</summary>

The first uses expression-body form and returns `1`. The second uses block-body form and returns `undefined` — `1` is a statement whose value is discarded because there is no `return`.
</details>

<details>
<summary><strong>Q4.</strong> When should a handler's return type be <code>void</code>?</summary>

When it does not return a value — almost always. Handlers mutate state, call `preventDefault()`, or log things; they do not produce a computed result.
</details>

<details>
<summary><strong>Q5.</strong> Why are arrow functions the usual choice for event handlers?</summary>

They do not have their own `this` binding, which avoids a historical class of bugs when passing methods to `addEventListener`. In a rune-based codebase this is mostly a consistency concern, but arrow functions remain the safe default.
</details>

## 6. Common mistakes

- **Leaving parameters untyped.** `function handle(event) { ... }` makes `event` implicitly `any` and fails strict type checking.
- **Forgetting the return type on non-trivial functions.** Inference works, but explicit return types catch bugs where one branch forgets to return.
- **Block-body arrows for one-liners.** `(n) => { return n * 2; }` is longer than `(n) => n * 2` for no benefit.
- **Relying on hoisting between declarations and expressions at the top of a script.** Write code top-to-bottom in the order you use it.

## 7. What's next

Lesson 5.3 teaches the full set of TypeScript DOM event types — `MouseEvent`, `KeyboardEvent`, `InputEvent`, `SubmitEvent`, `FocusEvent` — and how to narrow `event.target` safely.
