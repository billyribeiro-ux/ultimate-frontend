---
module: 1
lesson: 1.4
title: TypeScript type annotations on variables
duration: 45 minutes
prerequisites:
  - Lesson 1.2 — A running TypeScript-strict project
  - Lesson 1.3 — Comfortable with the three blocks of a .svelte file
learning_objectives:
  - Distinguish between explicit type annotations and type inference
  - Annotate variables with string, number, boolean, and literal types
  - Explain what TypeScript's "inferred" type is and when to override it
  - Use `const` assertions to narrow a value to its literal type
  - Read a TypeScript error message and find the line that caused it
status: ready
---

# Lesson 1.4 — TypeScript type annotations on variables

## 1. Concept — Types are promises you make to your future self

### 1.1 The problem: JavaScript lets you do anything, and that is a problem

Plain JavaScript is a remarkably permissive language. A variable that holds the number `5` one line can hold the string `'hello'` the next, and the engine will not complain until the string is used in a context where a number was expected — which may be hours later in a completely different file. A function that expects an object with a `name` property will happily accept an object with no `name`, and crash at runtime with `Cannot read property 'name' of undefined`. These are not exotic bugs. In a team codebase, they are the single most common kind of bug.

The root cause is that JavaScript's values carry no *contract*. There is no way to look at a variable declaration and know what the programmer *intended* it to hold. TypeScript's entire purpose is to add that contract. When you write `let score: number = 0`, the `: number` part is the contract. You are telling yourself, your teammates, your editor, and the compiler that `score` will only ever hold numbers. If anyone — including you, five minutes later — tries to assign a string to it, the type checker stops you before the code runs.

Contracts, types, annotations — these are three words for the same thing. They are promises. The compiler's job is to verify those promises on every save.

### 1.2 The three primitive types you need today

Three types cover almost everything in Module 1:

- `string` — text enclosed in quotes. `'hello'`, `"world"`, `` `template ${value}` ``.
- `number` — integers and decimals. `42`, `3.14`, `-7`, `0`.
- `boolean` — exactly two values: `true` or `false`.

Annotate a variable by writing its name, a colon, its type, and then its initial value:

```ts
const title: string = 'Ultimate Frontend';
const price: number = 99.5;
const inStock: boolean = true;
```

You will use `const` most of the time because most of your values do not change. When they do need to change, use `let`:

```ts
let currentStep: number = 1;
currentStep = 2; // OK
currentStep = 'two'; // Error: Type 'string' is not assignable to type 'number'.
```

### 1.3 Inference: TypeScript can read your code too

TypeScript is clever. If you write `const price = 99.5`, TypeScript notices the initial value is a number and *infers* that `price: number` without you having to write it. This is called **type inference**, and in a large codebase you rely on it constantly. There is no point typing `const price: number = 99.5` when `const price = 99.5` gives you the exact same safety for half the characters.

So why does Lesson 1.1 write the type explicitly? Two reasons. First, because a beginner needs to *see* the type on the page to learn what types feel like. Second, because sometimes inference is *wrong in a useful way* — it picks a type that is too wide, and you want a narrower one.

For example:

```ts
let status = 'loading'; // inferred as: string
```

TypeScript infers `string`, which is correct but very wide. In reality `status` can only hold `'loading'`, `'success'`, or `'error'`. A real application would want the type checker to yell if someone writes `status = 'loadnig'` (typo). To get that, you narrow the type yourself:

```ts
let status: 'loading' | 'success' | 'error' = 'loading';
status = 'loaded'; // Error: Type '"loaded"' is not assignable.
```

The `'loading' | 'success' | 'error'` part is a **union of literal types** — a set of exact allowed values. This is one of the most valuable features in TypeScript and you will use it from Module 3 onwards. For now, just know it exists.

### 1.4 When to write the annotation and when to let inference work

A short rule that will serve you well for years:

- **Let inference do its work when the initial value already expresses your intent.** `const max = 100` is fine. So is `const greeting = 'Hello'`.
- **Annotate when the inferred type would be too wide or too narrow.** `let status: 'loading' | 'success' | 'error' = 'loading'`.
- **Always annotate function parameters, function return types, and component props.** These are contracts across boundaries, and TypeScript deliberately does not infer across them. (Module 3 for props; Module 5 for functions.)
- **In Module 1**, annotate everything explicitly so the types are visible on the page while you are still learning. From Lesson 1.5 onwards you are allowed to rely on inference for simple cases.

### 1.5 Reading a TypeScript error

TypeScript error messages look scary but follow a simple pattern: *what it expected*, *what it got*, *where*. For example:

```
src/lib/cart.ts:12:3 - error TS2322: Type 'string' is not assignable to type 'number'.

12   total = 'ninety-nine';
     ~~~~~
```

Read it in three beats. Where? `src/lib/cart.ts`, line 12, column 3. What is wrong? A value of type `string` is being assigned to a variable declared as `number`. What to fix? Either change the variable's type to `string` (unlikely — `total` should be numeric) or change the value to an actual number. Once you internalise this three-beat reading, TypeScript errors stop being frightening.

## Deep Dive

**Why this matters at scale.** In a production codebase with 50+ components, type annotations are the first line of defence against silent breakage during refactors. When a backend team renames a field from `total` to `grandTotal`, every component that referenced `total` lights up in red instantly — before anyone opens a browser. Without annotations, JavaScript silently renders `undefined` and you discover the bug from a customer screenshot. At enterprise scale, this single property of TypeScript — catching shape mismatches at compile time — saves more engineering hours than any other tool in the stack.

**The mental model.** Think of a type annotation as a customs declaration form. When a value crosses a boundary — entering a function, leaving an API, arriving in a component's props — the annotation is the declaration form that says "I am carrying exactly these things, of exactly these types." The compiler is the customs officer. If the form does not match the contents, you are stopped before you enter the country. This metaphor extends: you do not need a customs form for items that stay inside your own house (local inference handles those). You need one whenever something crosses a boundary.

**Edge cases.** TypeScript's literal narrowing catches many beginners off guard. `const x = 'hello'` infers the literal type `'hello'`, not `string`, because `const` cannot be reassigned. But `let x = 'hello'` infers `string` because `let` *can* be reassigned to any string. This distinction matters when you pass the value to a function expecting a specific literal union. Another edge case: `null` and `undefined`. With `strictNullChecks` enabled (which this course requires), `let name: string = null` is an error. You must explicitly opt in with `string | null`. This catches an enormous category of runtime crashes — the dreaded "cannot read property of null" — at compile time.

**Performance implications.** Type annotations have zero runtime cost. TypeScript is erased entirely during compilation — the JavaScript that reaches the browser contains no trace of your types. This means you can annotate as aggressively as you want without worrying about bundle size. The only cost is compile time, and even in codebases with thousands of files, `tsc` runs in seconds on modern hardware. The Svelte compiler reads your TypeScript, type-checks it, strips the types, and emits plain JavaScript. There is no runtime type-checking library shipped to the user.

**Cross-module connections.** Type annotations are the foundation for everything that follows. Module 3 uses interfaces (which are named annotations) for component props. Module 5 uses them for event handler parameters. Module 9 uses them for load function return types. Module 11 uses them for shared state stores. Every time you see a `: SomeType` in this course, you are looking at the same mechanism you learned here — a contract that the compiler enforces. The investment you make in learning to read annotations today pays compound interest across all thirteen modules.

## 2. Style it — A traffic-light colour per status

The mini-build displays a single value — a shipment status — and colours a card according to whether it is `'loading'`, `'success'`, or `'error'`. Each status maps to a PE7 colour token (`--color-warning`, `--color-success`, `--color-error`). The colour token is applied via a `style:` directive tied to the value, so if you add a fourth status to the union, TypeScript will force you to either handle it or explicitly mark it as unsupported.

Mobile-first layout: the card stacks vertically and the status text is big enough to be read at arm's length. At `min-width: 480px` the card switches to a horizontal label-and-value layout.

## 3. Interact — A union type catches a typo

The mistake first:

```ts
let status = 'loading';
// ...later, somewhere else in the file...
status = 'loadnig'; // typo — compiles fine, runtime bug.
```

Because `status` is inferred as the wide type `string`, `'loadnig'` is a perfectly valid string and TypeScript does not complain. The typo slips through and the UI silently breaks.

Now the fix:

```ts
type ShipmentStatus = 'loading' | 'success' | 'error';

let status: ShipmentStatus = 'loading';
status = 'loadnig';
// ^ Type '"loadnig"' is not assignable to type 'ShipmentStatus'.
```

One annotation, one prevented bug. This is the pattern you will use hundreds of times.

## 4. Mini-build — A status card whose type refuses to lie

**File:** `src/routes/modules/01-foundation/04-type-annotations/+page.svelte`

The script block declares a `ShipmentStatus` type alias and a typed constant. The markup block renders a card with the status label. The style block uses a `style:` directive (which you met briefly in Lesson 1.3) to map the status value to a PE7 colour token.

Open the route. Change the `currentStatus` constant to `'error'` and save. The colour should change instantly. Now change it to `'errror'` (three r's). Your editor should immediately underline the value in red and your dev server should print a type error in the terminal. This is the contract doing its job.

### DevTools verification

1. Open DevTools → Elements.
2. Hover the card. Confirm its `style` attribute contains the CSS custom property that the status drove.
3. In your editor, introduce a typo in the status. Confirm the red squiggly appears *before* you save.

## 5. Check your understanding

<details>
<summary><strong>Q1.</strong> What is the difference between an <em>explicit</em> type annotation and <em>type inference</em>?</summary>

An explicit annotation is one you write yourself, e.g. `const x: number = 5`. Type inference is TypeScript guessing the type from the initial value, e.g. `const x = 5` which it infers as `number`. Both are equally safe — the annotation just makes the intent visible on the page.
</details>

<details>
<summary><strong>Q2.</strong> Why is <code>let status: 'loading' | 'success' | 'error' = 'loading'</code> safer than <code>let status = 'loading'</code>?</summary>

The first version restricts `status` to exactly three allowed strings, so a typo like `'loadnig'` is caught at compile time. The second version infers the wide `string` type, under which `'loadnig'` is a perfectly valid value and no error is reported.
</details>

<details>
<summary><strong>Q3.</strong> Read this error and explain what is wrong in one sentence: <code>Type 'string' is not assignable to type 'number'</code>.</summary>

Somewhere in your code you are assigning a string value to a variable or parameter that was declared as a number. Fix it by either changing the declared type (rare) or by producing a numeric value (common, e.g. `Number(input)` or `parseInt(input, 10)`).
</details>

<details>
<summary><strong>Q4.</strong> When should you <em>not</em> write an explicit type annotation?</summary>

When the inferred type already matches your intent exactly. Writing `const price: number = 99.5` adds nothing that `const price = 99.5` does not already say. Keep annotations for function parameters, return types, component props, and places where inference would be too wide.
</details>

<details>
<summary><strong>Q5.</strong> If <code>const x = 5</code> and you try <code>x = 6</code>, what error do you get and why?</summary>

`Cannot assign to 'x' because it is a constant.` This is a JavaScript error (not a type error): `const` bindings cannot be reassigned. TypeScript inherits this behaviour from plain JavaScript and additionally enforces it at compile time.
</details>

## 6. Common mistakes

- **Using `any` to silence an error.** `let data: any = ...` turns off the type checker for that variable. It is a hatch you should never reach for as a student. Fix the real type.
- **Annotating literals redundantly.** `const name: string = 'Ada'` is verbose where `const name = 'Ada'` says the same thing. Fine to write while learning; drop the annotation in real code.
- **Forgetting that `let x = 'a'` infers `string`, not `'a'`.** If you want the literal type, you must annotate it or use `const`. `const x = 'a'` infers the literal `'a'` because `const` bindings cannot change; `let x = 'a'` can be reassigned so TypeScript widens it to `string`.
- **Ignoring red squigglies.** The editor shows you errors the moment they appear. Do not save-and-hope — fix the type error before moving on. Every minute you delay, you pile on more errors that depend on the first one.

## 7. What's next

Lesson 1.5 leaves TypeScript alone for a while and builds the PE7 CSS architecture you have been using without really understanding it.
