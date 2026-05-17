---
module: 1
lesson: 1.8
title: TypeScript interfaces — defining object shapes
duration: 45 minutes
prerequisites:
  - Lesson 1.4 — Type annotations on primitive variables
learning_objectives:
  - Define an interface that describes an object's expected properties and types
  - Annotate a variable, a function parameter, and an array with an interface type
  - Distinguish between required and optional properties using `?`
  - Explain the difference between an interface and a type alias in one sentence
  - Read a "Property X is missing in type Y" error and fix it
status: ready
---

# Lesson 1.8 — TypeScript interfaces: defining object shapes

## 1. Concept — Naming the shape of your data

### 1.1 The problem: an object has many fields and TypeScript needs to know all of them

A primitive type like `string` or `number` describes a single value. But most real data in a UI is not a single value — it is a *bundle*. A product has a name, a price, an ID, a category, an image URL, a stock count, and a description. A user has an email, a display name, a timezone, and a role. A lesson has a number, a title, a duration, and a list of learning objectives. Every one of these is an object with a specific shape, and every place you handle one, TypeScript needs to know that shape in order to catch mistakes.

You could, in principle, write the shape inline every single time:

```ts
const product: { id: string; name: string; price: number } = {
    id: 'p-1', name: 'Notebook', price: 4.5
};
```

That works for one declaration. It falls apart the moment a second function wants to accept the same shape, because you would have to re-type the whole shape annotation, and if you ever add a field, you have to update every copy. The inline-shape approach does not scale beyond three lines.

### 1.2 Interfaces give a shape a name

TypeScript's answer is the **interface**: a named, reusable description of an object's shape.

```ts
interface Product {
    id: string;
    name: string;
    price: number;
}

const pen: Product = { id: 'p-1', name: 'Pen', price: 1.5 };
const books: Product[] = [
    { id: 'b-1', name: 'The Pragmatic Programmer', price: 29.95 },
    { id: 'b-2', name: 'Clean Code', price: 24.5 }
];

function formatPrice(product: Product): string {
    return `$${product.price.toFixed(2)}`;
}
```

Four things happened:

1. The `Product` interface was declared once.
2. A single product was annotated with `: Product`.
3. An array of products was annotated with `: Product[]`.
4. A function's parameter was annotated with `: Product` so it accepts only objects of that shape.

If any of these sites tries to use a product missing a field, TypeScript will stop you with a clear error: `Property 'price' is missing in type ... but required in type 'Product'`.

### 1.3 Required, optional, and readonly fields

Every property in an interface is required by default. To mark a property optional, add `?`:

```ts
interface Product {
    id: string;
    name: string;
    price: number;
    discountPercent?: number; // optional — may be undefined
}
```

When you read an optional field, TypeScript forces you to handle the undefined case, usually with a default value (`product.discountPercent ?? 0`) or an `if` check.

To mark a property as unmodifiable after creation, add `readonly`:

```ts
interface Product {
    readonly id: string;
    name: string;
    price: number;
}
```

You can still *read* `product.id`, but `product.id = 'x'` becomes a compile error. Use `readonly` for identifiers, timestamps, and any field that is "the identity of the thing".

### 1.4 Interface vs type alias — one line of difference

TypeScript has a second way to name a shape called a **type alias**:

```ts
type Product = {
    id: string;
    name: string;
    price: number;
};
```

For object shapes, `interface` and `type` are almost interchangeable. The main practical difference is that interfaces can be **extended** and **re-opened**: if you write a second `interface Product` later, TypeScript merges the fields together. Type aliases cannot be merged. Also, type aliases can name things that are not object shapes — unions, tuples, primitives, mapped types — while interfaces cannot. This course uses `interface` for object shapes (component props, data models, configuration) and `type` for union types (like the `ShipmentStatus` in Lesson 1.4) and utility compositions. That is the convention most real Svelte codebases follow.

### 1.5 Reading a "property missing" error

```
Argument of type '{ id: string; name: string; }' is not assignable to parameter of type 'Product'.
  Property 'price' is missing in type '{ id: string; name: string; }' but required in type 'Product'.
```

Three beats again. What was expected? A value assignable to `Product`. What did you provide? An object with `id` and `name` but no `price`. What to fix? Add the missing field, or make it optional in the interface if it legitimately sometimes does not exist.

This is the single most common TypeScript error in a Svelte codebase once you start using interfaces, and reading it fluently will save you hours.

### 1.6 Why interfaces matter more in Svelte than in plain JS

From Module 3 onwards, every Svelte component's props are declared via an interface:

```svelte
<script lang="ts">
    interface Props {
        title: string;
        subtitle?: string;
        count: number;
    }

    let { title, subtitle, count }: Props = $props();
</script>
```

That `Props` interface is the contract between this component and every other component that uses it. If a parent passes the wrong type, the type checker catches it. If you later add a field to `Props`, every callsite that is missing it lights up in red. You will use this pattern hundreds of times in this course. Learning interfaces today is the investment that makes Module 3 frictionless.

## Deep Dive

**Why this matters at scale.** In a 50-component production app, data flows through many layers: an API returns JSON, a load function shapes it, a parent component passes it as props, a child component renders it. At every boundary, the shape of the data must be agreed upon. Without interfaces, each layer guesses what the data looks like, and silent mismatches accumulate. With interfaces, you declare the shape once in a shared `types.ts` file, import it at every boundary, and the compiler guarantees consistency end-to-end. When a backend migration renames a field, a single change to the interface lights up every file that needs updating — no grep, no guessing, no production 500 errors.

**The mental model.** An interface is a blueprint, not a factory. It does not create objects; it describes what an object must look like to be considered valid. Think of it as a passport template: "must have a photo field, a name field, and an expiry field." Any document that has those fields — regardless of how it was produced — is a valid passport. TypeScript's type system is *structural*, not *nominal*: it cares about what fields exist, not what constructor created the object. This means two interfaces with identical fields are interchangeable, which is powerful for testing (you can pass a plain object literal anywhere the interface is expected, no mock library needed).

**Edge cases.** Index signatures (`[key: string]: unknown`) let you describe objects with dynamic keys, but they weaken type safety because any string key is now valid. Prefer explicit fields whenever possible. Another edge case: excess property checking. TypeScript only checks for extra properties on *literal* objects passed directly to a typed context. If you assign a literal to an untyped variable first, then pass it, the extra properties silently survive. This is a frequent source of confusion in Svelte props — passing an object variable with extra fields compiles fine, but passing a literal with extra fields does not. Finally, `interface extends` is additive only: you cannot remove a field from a parent interface in a child. If you need to omit fields, use the `Omit<>` utility type.

**Performance implications.** Like all TypeScript constructs, interfaces are erased at compile time. They add zero bytes to the production bundle and zero milliseconds to runtime execution. The compile-time cost is also minimal — TypeScript's structural checker is heavily optimised for interface comparison. Even codebases with thousands of interfaces compile in seconds. The real performance benefit is indirect: interfaces prevent the kind of shape-mismatch bugs that cause runtime `undefined` access, which in turn prevents the "cannot read property of undefined" crashes that tank user experience and waste debugging time.

**Cross-module connections.** Interfaces are the connective tissue of this entire course. Module 3 uses them for `Props` declarations on every component. Module 5 uses them to type event payloads. Module 9 uses them for load function return shapes and PageData types. Module 10 uses them for form action data. Module 11 uses them for shared reactive state shapes. The pattern is always the same: declare the shape, import it at boundaries, let the compiler enforce consistency. Mastering interfaces here makes every subsequent module's type patterns feel familiar rather than foreign.

## 2. Style it — A list of typed cards

The mini-build renders a list of "course modules" from a typed array. Each module has a number, a title, a duration, and an optional badge. The PE7 card style is the same one you built in Lesson 1.7. No new styling — focus on the types.

## 3. Interact — The cost of not typing an object

The mistake:

```ts
const modules = [
    { number: 1, title: 'The Foundation', duration: 240 },
    { number: 2, title: 'Reactivity' } // forgot duration
];
```

TypeScript's inference gives `modules` a loose union type, so the second object's missing `duration` is silently accepted. Later in the markup, `{module.duration}` renders `undefined` for Module 2 and nobody notices until QA.

The fix:

```ts
interface Module {
    number: number;
    title: string;
    duration: number;
    badge?: string;
}

const modules: Module[] = [
    { number: 1, title: 'The Foundation', duration: 240 },
    { number: 2, title: 'Reactivity' } // Error: Property 'duration' is missing.
];
```

One interface, one annotation, one caught bug.

## 4. Mini-build — A typed list of modules

**File:** `src/routes/modules/01-foundation/08-interfaces/+page.svelte`

### DevTools verification

1. Hover the code in your editor: TypeScript's tooltip shows `Module[]` as the inferred type of the array.
2. Delete a required field from one of the module literals. Your editor and your dev server immediately flag it.

## 5. Check your understanding

<details>
<summary><strong>Q1.</strong> What does an interface do that a plain inline object annotation does not?</summary>

It gives the shape a name that can be reused across many declarations, function signatures, and type annotations. Without an interface you would have to re-type the whole shape every time, and adding a field would mean updating every copy.
</details>

<details>
<summary><strong>Q2.</strong> How do you mark a property optional?</summary>

Add a `?` after its name: `discountPercent?: number`. TypeScript then allows the field to be absent and forces you to handle the `undefined` case wherever you read it.
</details>

<details>
<summary><strong>Q3.</strong> When would you prefer <code>type</code> over <code>interface</code>?</summary>

When the thing you are naming is not an object shape — for example, a union of literal strings like `'loading' | 'success' | 'error'`, a tuple, or a mapped type. Interfaces cannot describe those; type aliases can.
</details>

<details>
<summary><strong>Q4.</strong> Read this error: "Property 'price' is missing in type '{ id: string; name: string; }' but required in type 'Product'." What should you do?</summary>

Add a `price` field to the object literal (if the price really should exist), or mark `price?` optional in the `Product` interface (if it is legitimately absent in some cases).
</details>

<details>
<summary><strong>Q5.</strong> Why do Svelte components in this course always declare their props via an interface?</summary>

Because props are a contract between components. Naming that contract with an interface makes the expected shape explicit, catches typos and missing fields at compile time, and makes refactors safe — if you add a prop, every callsite missing it becomes a red error immediately.
</details>

## 6. Common mistakes

- **Re-declaring the same interface in multiple files instead of importing it.** Put shared interfaces in `src/lib/types.ts` and import them. Copy-paste is drift waiting to happen.
- **Confusing `?` with `| undefined`.** `foo?: string` and `foo: string | undefined` are subtly different: the first makes the property *itself* optional (it may be absent from the object), the second requires the property to exist but allows its value to be undefined. Prefer `?` when the field may legitimately be absent.
- **Forgetting that `readonly` only protects the top level.** `readonly items: Product[]` prevents reassigning `items`, but you can still call `items.push(...)`. For fully frozen arrays, use `readonly Product[]` or `ReadonlyArray<Product>`.
- **Using `any` as a shortcut when you are not sure what the shape is.** If you genuinely do not know, use `unknown` — it forces you to narrow before using the value, which is much safer.

## 7. What's next

Lesson 1.9 puts interfaces to work in the markup block, showing every template expression pattern Svelte supports.
