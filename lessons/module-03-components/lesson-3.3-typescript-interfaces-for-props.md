---
module: 3
lesson: 3.3
title: TypeScript interfaces for props
duration: 45 minutes
prerequisites:
  - Lesson 3.2 ($props() basics)
  - Module 1.8 (TypeScript interfaces)
learning_objectives:
  - Write an `interface Props` that exactly describes a component's inputs
  - Attach that interface to the `$props()` rune via a type annotation
  - Read and fix the exact TypeScript error produced by passing a wrong-typed prop
  - Use string literal union types to constrain a prop to a small set of values
  - Recognise the difference between `interface` and `type` aliases, and why this course uses `interface` for props
status: ready
---

# Lesson 3.3 — TypeScript interfaces for props

## 1. Concept — Types are a contract between parent and child

### 1.1 The problem: unchecked props are silent bombs

In Lesson 3.2 our `MetricCard` component declared props like this:

```svelte
<script lang="ts">
    let { label = '', value = '' } = $props();
</script>
```

Because both defaults were empty strings, TypeScript inferred `label: string` and `value: string`. That is fine until a parent gets creative:

```svelte
<MetricCard label="Users" value={12384} />   <!-- number, not string -->
<MetricCard lable="Users" value="12,384" />   <!-- typo in prop name -->
<MetricCard label="Users" />                  <!-- forgot value entirely -->
```

Each of these is a small bug that could reach production. The first renders `12384` as a number instead of a nicely formatted string. The second silently passes an unknown prop `lable` and leaves `label` undefined. The third defaults to `''`. None are caught by the compiler because we never told the compiler what `MetricCard` actually expects.

An **interface** is how you tell the compiler exactly that. It is a contract: "a parent rendering `MetricCard` **must** pass these props, with these types, and anything else is an error." Once the contract exists, TypeScript refuses to compile parent code that violates it.

### 1.2 The exact shape

An interface for props looks like this:

```svelte
<script lang="ts">
    interface Props {
        label: string;
        value: string;
    }

    let { label, value }: Props = $props();
</script>
```

Four things happen here:

1. `interface Props` declares a named shape — a contract with two required fields, both of type `string`.
2. The `: Props` after the destructure tells the compiler, "the object returned by `$props()` is this shape."
3. Because `label` and `value` are declared **required** (no `?`), omitting one in a parent causes a compile error.
4. Because they are typed **`string`**, passing a number or boolean causes a compile error.

You do not need `export` on the interface. It is local to the file. Svelte will read it internally to generate the `.d.ts` declaration for your component so that parent files can see the types when they import it.

### 1.3 Why `interface` and not `type`

TypeScript has two ways to name a shape: `interface Foo { ... }` and `type Foo = { ... }`. For props, this course uses `interface` for three reasons:

- **It is what the Svelte documentation uses.** Matching the docs reduces friction when you copy examples.
- **It opens cleanly for extension.** If two components share a common set of props you can `interface CardProps extends BaseProps { ... }`.
- **Error messages are slightly friendlier.** TypeScript prefers printing the name `Props` in errors when you used an interface.

Both forms produce the same runtime behaviour — types are erased during compilation. The choice is stylistic but consistent.

### 1.4 String literal unions: a prop with a small, closed set of values

A common need is to say "this prop can be one of three specific strings — nothing else." You do it with a **string literal union type**:

```ts
type Tone = 'neutral' | 'brand' | 'success' | 'warning' | 'error';

interface Props {
    tone: Tone;
}
```

Now a parent writing `<Badge tone="succsess" />` (typo) will see a red squiggle before the code even runs. The compiler checks the string character by character against the allowed list. This feature alone has eliminated a large class of bugs in component libraries.

### 1.5 Optional props with `?`

If a prop has a sensible default, mark it optional with a trailing `?` on the field and give it a default value in the destructure:

```ts
interface Props {
    label: string;
    tone?: Tone;       // optional
}
```

Lesson 3.4 is entirely dedicated to optional props and defaults, so keep the first mini-build in this lesson focused on the basic required interface.

### 1.6 What the error looks like

Let's deliberately break things so you recognise the error. Inside the parent, change `<MetricCard label="Users" value="12,384" />` to `<MetricCard label="Users" value={12384} />`. Your editor immediately shows:

```
Type 'number' is not assignable to type 'string'.
```

That is a TypeScript error at authoring time. It does not compile, does not reach the browser, and you fix it before the bug exists.

### 1.7 How this connects to what you already know

You wrote interfaces in Lesson 1.8 for plain objects (`interface User { id: number; name: string; }`). A Props interface is exactly the same idea applied to the object that `$props()` returns. There is no new TypeScript feature here — just a new place to put one.

## Deep Dive

**Why this matters at scale.** In a 50-component production app, props interfaces are the API documentation that never goes stale. When a new developer joins and needs to use `MetricCard`, they hover it in their editor and see the full typed interface — required fields, optional fields, allowed values. No wiki page to find, no Storybook to boot up, no Slack message to send. The interface *is* the documentation. At scale, teams that type every prop interface rigorously can refactor confidently: rename a prop, and every call site that uses the old name fails to compile. Teams without typed props discover rename failures in QA — or in production.

**The mental model.** Think of a Props interface as a restaurant order form. The form has boxes for each item you can order (the fields), some boxes are mandatory (required props), some are optional (optional props marked with `?`), and each box specifies what goes in it (the type). A waiter (the compiler) checks your form before sending it to the kitchen (the component). If you left a mandatory box blank, the waiter tells you immediately — the order never reaches the kitchen in a broken state. This front-loading of validation is exactly what TypeScript does: catch the mistake at the call site, not inside the component.

**Edge cases.** A subtle gotcha: if your Props interface has a field typed as a union (`variant: 'solid' | 'outline'`) and the parent passes a variable typed as `string`, TypeScript rejects it because `string` is wider than the union. The fix is to type the parent's variable with the same union, or use `as const` on a literal. Another edge case: props that accept `undefined` vs props that are optional. `{ value: string | undefined }` requires the parent to explicitly pass `value={undefined}`, while `{ value?: string }` allows the parent to omit the attribute entirely. For component APIs, optional (`?`) is almost always what you want. Finally, Svelte generates `.d.ts` files for your components automatically — if your Props interface is wrong, the generated declarations will be wrong, and consumers in other packages will get incorrect type information.

**Performance implications.** Props interfaces are pure TypeScript — they are erased at compile time and add zero bytes to the bundle. However, the *pattern* of using interfaces enables a performance-relevant practice: when you constrain a prop to a literal union (`'sm' | 'md' | 'lg'`), Svelte's compiler can potentially optimise the component knowing that only three values are possible. More importantly, explicit types enable tree-shaking: if a variant is never used in your app, bundlers can potentially eliminate the code paths that handle it (though this depends on how the component is structured).

**Cross-module connections.** Props interfaces reappear every time you build a component from here forward. Module 5 adds callback props (typed as function signatures in the interface). Module 9 types load-function return values that become page props. Module 11 types context values that flow through the component tree. The skill of reading an interface and knowing exactly what a component expects is the single most transferable TypeScript skill in frontend development — it applies equally to React, Vue, and any typed component system.

### 1.8 Common interview question

**Q: "Why should you always type your component props with an explicit interface rather than relying on inference?"**

**Model answer:** Inference from default values gives you types, but they can be too wide or too loose. `let { label = '' } = $props()` infers `label: string`, which accepts any string including ones the component cannot handle. An explicit interface like `interface Props { label: string; tone: 'brand' | 'success' | 'error' }` constrains `tone` to exactly three values, catching typos at compile time. More importantly, the interface becomes the component's public API documentation. Any developer hovering the component tag in their editor sees the full interface — required fields, optional fields, types — without opening the component file. At scale, explicit interfaces enable safe refactoring: renaming a prop lights up every call site. Implicit inference does not provide that guarantee.

## Going Deeper

**Official docs to read next:**

- [svelte.dev/docs/svelte/typescript](https://svelte.dev/docs/svelte/typescript) — typing props with interfaces in Svelte 5.
- [svelte.dev/docs/svelte/$props](https://svelte.dev/docs/svelte/$props) — the `$props()` rune and how to attach a type annotation.
- [typescriptlang.org/docs/handbook/2/objects.html](https://www.typescriptlang.org/docs/handbook/2/objects.html) — object types, interfaces, and excess property checking.

**Advanced pattern: extending a base interface for component variants.** When multiple components share common props:

```ts
interface BaseCardProps {
    children: Snippet;
    class?: string;
}

interface MetricCardProps extends BaseCardProps {
    label: string;
    value: string;
    tone: 'brand' | 'success' | 'warning' | 'error';
}

interface UserCardProps extends BaseCardProps {
    user: User;
    showAvatar?: boolean;
}
```

Both card types inherit `children` and `class` from the base. Adding a new common prop to `BaseCardProps` propagates to all variants automatically.

**Challenge question (combines Lesson 3.3 + Lesson 1.8 + Lesson 3.2):** A component accepts `variant: 'solid' | 'outline' | 'ghost'` as a prop. A parent passes `variant={dynamicValue}` where `dynamicValue` is typed as `string`. Explain why TypeScript rejects this, what the error message says, and two ways to fix it (one at the parent, one at the component).

## 2. Style it — Tone-variant cards

The mini-build shows four cards, each with a different `tone` prop driving a different-coloured accent strip. The `tone` string selects a CSS class (`.metric-card--success`, `.metric-card--warning`, etc.) and each class remaps a single custom property (`--accent`) on the card, not the whole palette. One interface field, four visually distinct cards.

## 3. Interact — Break the contract on purpose

Write the component with a strict `Props` interface. From the parent, intentionally call it with a wrong type: `<TonedMetricCard label="Users" value={12384} tone="brand" />`. Watch TypeScript refuse. Hover the squiggle and read the exact message. Then fix it and the page renders. Repeat with a typo in a prop name (`lable` instead of `label`). Watch TypeScript refuse again.

## 4. Mini-build — Four tone-variant metric cards

### Files

- `src/lib/components/TonedMetricCard.svelte`
- `src/routes/modules/03-components/03-typed-props/+page.svelte`

### Key excerpt

```svelte
<!-- TonedMetricCard.svelte -->
<script lang="ts">
    type Tone = 'neutral' | 'brand' | 'success' | 'warning' | 'error';

    interface Props {
        label: string;
        value: string;
        tone: Tone;
    }

    let { label, value, tone }: Props = $props();
</script>

<article class="metric-card metric-card--{tone}">
    <p class="metric-card__label">{label}</p>
    <p class="metric-card__value">{value}</p>
</article>
```

### DevTools verification

1. Open DevTools → Svelte tab → click one `TonedMetricCard`.
2. Props panel shows `label: string`, `value: string`, `tone: 'success'` (or whichever variant).
3. In VS Code, hover the component tag in the parent file. The tooltip shows the exact interface inherited from the component, confirming that strict mode works across file boundaries.

## 5. Check your understanding

<details>
<summary><strong>Q1.</strong> Why is an untyped prop a "silent bomb"?</summary>

Because a bug passes without warning. The compiler accepts any value, the component runs with whatever it got, and the mistake only shows up visually — or worse, not at all. A typed prop makes the mistake refuse to compile, so it cannot reach the browser.
</details>

<details>
<summary><strong>Q2.</strong> What does a string literal union type like `'sm' | 'md' | 'lg'` buy you that `string` does not?</summary>

It restricts the allowed values to exactly three strings. Typos, unexpected casing, and unrelated strings become compile errors. The editor can even autocomplete the three allowed values.
</details>

<details>
<summary><strong>Q3.</strong> Why does this course use `interface Props` rather than `type Props = { ... }`?</summary>

The Svelte docs use `interface`, it extends cleanly with `extends`, and its error messages print the name a bit more readably. Both forms work identically at runtime.
</details>

<details>
<summary><strong>Q4.</strong> What is the exact TypeScript error when you pass `value={12384}` to a component expecting `value: string`?</summary>

`Type 'number' is not assignable to type 'string'.` The editor underlines the offending attribute and refuses to compile until it is fixed.
</details>

<details>
<summary><strong>Q5.</strong> Does the Props interface need to be exported?</summary>

No. It is a local declaration inside the component file. Svelte reads it internally when generating the component's public type surface, so parent files still see the types without any explicit export.
</details>

## 6. Common mistakes

- **Typing a prop as `any`.** This is explicitly banned by the course style guide. `any` silences the compiler and brings back every silent-bomb problem we just solved. If you do not know the type yet, use `unknown` and narrow it.
- **Forgetting the annotation on the destructure.** Writing `let { label, value } = $props();` *without* `: Props` means the compiler has to infer types from defaults — which often infers `any`. Always annotate: `let { label, value }: Props = $props();`.
- **Putting non-prop state inside the interface.** Local `$state` values do not belong in `Props`. Only things that flow *in* from the parent belong there.
- **Exporting the interface.** It is local. Exporting is unnecessary and creates an import surface you do not want.

## 7. What's next

Lesson 3.4 adds optional props and default values so a parent can omit fields your component knows how to fill in sensibly.
