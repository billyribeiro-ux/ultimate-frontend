---
module: 1
lesson: 1.9
title: Passing data into the template with {} expressions
duration: 40 minutes
prerequisites:
  - Lesson 1.3 — The three blocks
  - Lesson 1.8 — Interfaces and typed arrays
learning_objectives:
  - Interpolate a script-block value into markup using curly braces
  - Pass a dynamic value into an HTML attribute
  - Use a ternary expression inside a template
  - Use the style:, class:, and style:-- directive forms
  - Explain why an expression cannot contain a statement
status: ready
---

# Lesson 1.9 — Passing data into the template with `{}` expressions

## 1. Concept — How TypeScript values become DOM content

### 1.1 The problem: the markup block needs a hotline to the script block

You have a typed value in your script block. You want to show it on the page. Plain HTML has no idea what a TypeScript variable is — HTML is text. So there must be some syntax that says "at *this* position in the DOM, evaluate *this* TypeScript expression and insert its result". Every template language has such a syntax. React uses `{ }` for both text and attributes but requires `{variableName}`. Vue uses `{{ }}` for text and `:attr="expr"` for attributes. Angular uses `{{ }}` and square brackets. Each language picked its own shape.

Svelte picked single curly braces everywhere: `{expression}` for text, `attr={expression}` for attributes, and specialised directive forms for common cases (style, class, CSS custom properties). A single rule: **anything inside `{ }` is a TypeScript expression evaluated at runtime, and its result is converted to a string and placed in the DOM**.

### 1.2 Interpolation in text

The simplest case. Your script declares a constant; your markup wraps it in braces:

```svelte
<script lang="ts">
    const name: string = 'Ada';
</script>

<h1>Hello, {name}</h1>
```

Renders as `<h1>Hello, Ada</h1>`. Any expression works — not just variables. You can call functions, do arithmetic, use ternaries, access object properties:

```svelte
<p>{2 + 2}</p>
<p>{user.email.toLowerCase()}</p>
<p>{isOnline ? 'Online' : 'Offline'}</p>
<p>{products.length} products</p>
```

What you cannot do inside `{ }` is write a **statement**. A statement is a line of code that *does* something without producing a value — `let x = 5`, `if (condition) { ... }`, `for (const item of items)`. Statements do not return a value, so there is nothing for Svelte to insert into the DOM. If you need conditional or looping behaviour, you use Svelte's block tags instead: `{#if}`, `{#each}`, `{#await}` (Module 4). For quick conditionals inline, the **ternary** operator is an expression and is fully supported: `{condition ? a : b}`.

### 1.3 Interpolation in attributes

Attributes accept the same expressions, with two forms. The shorthand:

```svelte
<a href={url}>Click</a>
```

And the template-string form when you need to build a string from parts:

```svelte
<a href={`/user/${user.id}`}>Profile</a>
<img src={imageUrl} alt={`${user.name}'s avatar`} />
```

Boolean attributes (`disabled`, `checked`, `readonly`) take a boolean expression and are present or absent accordingly:

```svelte
<button disabled={!isValid}>Submit</button>
```

If `isValid` is false, the rendered element is `<button disabled>`; otherwise the attribute is omitted entirely. This is how you want HTML to work, and Svelte handles it for you.

### 1.4 The `style:` and `class:` directives

Two very common attribute patterns got shortcuts because they were worth optimising. The `class:` directive adds a class conditionally:

```svelte
<button class:active={isActive}>Toggle</button>
```

Reads as "add class `active` if `isActive` is true". Much cleaner than concatenating a class string.

The `style:` directive sets a single style property:

```svelte
<article style:color={textColor}>
```

And a special form lets you set a CSS custom property directly, which you have already used throughout this module:

```svelte
<article style:--accent-color={brandHue}>
```

This last form is the bridge between your typed script state and PE7's custom-property-based styling system. You will use it constantly.

### 1.5 `{@const}` — declaring a value inside markup

Sometimes you want to compute a value once per iteration of an `{#each}` loop and reuse it twice in the markup. Rather than calling the function twice, you can declare a markup-scoped constant with `{@const}`:

```svelte
{#each products as product (product.id)}
    {@const discounted = product.price * 0.9}
    <p>Was {product.price}, now {discounted}</p>
{/each}
```

`{@const}` is the only way to bind a name inside the markup block. It can only appear at the top of a block (`{#each}`, `{#if}`, `{#await}`, `<Component>`). It is not a general-purpose `let`.

### 1.6 The April 2026 difference

Svelte 3 and 4 used the same `{ }` syntax, but reactive assignments inside a component relied on a quirky `$:` syntax that is now replaced by the `$derived` rune (Module 2). The `{ }` interpolation itself has not changed — if you see `{value}` in an old tutorial, it still works exactly the same way. What has changed is *what goes inside*: you no longer write `{count * 2}` hoping it re-evaluates. It always re-evaluates because in Svelte 5 reactivity is explicit and the compiler knows which values are reactive. This will become crystal clear in Lesson 2.2.

## Deep Dive

**Why this matters at scale.** In a 50-component production app, template expressions are the primary mechanism by which data reaches the user. If a team does not have clear conventions around when to use `class:`, when to use `style:`, and when to use `style:--`, the codebase develops inconsistent patterns: some components concatenate class strings, others use directives, others inline entire style objects. Code review slows down because reviewers must mentally parse three different approaches. Standardising on Svelte's directive forms — `class:` for conditional classes, `style:` for dynamic properties, `style:--` for design-token bridges — produces a codebase where any developer can read any template and immediately understand the data flow from script to DOM.

**The mental model.** Think of `{expression}` as a one-way pipe from your script block to the DOM. Data flows down through the pipe; nothing flows back up. The expression is evaluated whenever its reactive dependencies change (you will learn exactly how in Module 2), and the result is serialised into the DOM as a string. This "evaluate, serialise, insert" pipeline is the same for text nodes, attributes, and directives. The only difference is *where* in the DOM the result lands — text content, attribute value, or class/style list.

**Edge cases.** A subtle trap: `{null}` and `{undefined}` render as empty strings in text positions, but in attribute positions they *remove* the attribute entirely. This is usually what you want (an undefined `href` should not render `href="undefined"`) but can surprise you if you expect the attribute to persist with an empty value. Another edge case: objects and arrays in text positions are coerced via `.toString()`, which produces `[object Object]` — almost never what you want. Always access a specific property or use JSON.stringify for debugging. TypeScript helps here: if you accidentally pass an object where a string is expected, the type checker warns you in strict mode.

**Performance implications.** Svelte's template expressions are compiled into fine-grained DOM update instructions. When `name` changes, Svelte updates only the specific text node that references `name` — it does not re-render the entire component or diff a virtual DOM. This granularity means that having many `{expressions}` in a template is cheap: each one is an independent update path. The cost is proportional to the number of *changed* expressions, not the total number of expressions in the template. For a component with 20 expressions where only one changes, Svelte performs exactly one DOM write. This is why Svelte components feel instantaneous even on low-powered devices.

**Cross-module connections.** Template expressions are the bridge you will use in every module. Module 2 connects them to reactive state (`$state` values inside `{}`). Module 4 extends them with control flow blocks that handle conditions and loops. Module 6 uses `style:--` extensively for dynamic theming. Module 7 uses `bind:this` (a special expression form) to get DOM references for GSAP animations. The skill of reading a template and tracing each `{}` back to its source declaration is foundational — it is how you debug rendering issues, reason about reactivity, and review pull requests effectively.

## 2. Style it — A user card with dynamic class, style, and style:--

The mini-build renders a user profile card whose content comes from a typed constant and whose appearance changes based on a `tier` value. The tier drives three different directive forms: a `class:` toggle for a "pro" badge, a `style:` directive for the border colour, and a `style:--accent` custom property for a nested gradient.

## 3. Interact — Three ways to express "this is the tier colour"

The mistake: you write the conditional class by hand.

```svelte
<article class="card {user.tier === 'pro' ? 'card--pro' : ''}">
```

This works but it is error-prone — a typo or an extra space silently produces an invalid class string. The fix is the `class:` directive:

```svelte
<article class="card" class:card--pro={user.tier === 'pro'}>
```

Now the rule is declarative. Svelte adds or removes the class and handles the string formatting for you. For the border colour, a `style:` directive is the cleanest tool:

```svelte
<article style:border-color={tierColor}>
```

And for a value you want *any* descendant to read — like a gradient colour — the `style:--` form is the bridge:

```svelte
<article style:--accent={tierColor}>
```

Three directive forms, three different jobs, one typed source of truth in the script.

## 4. Mini-build — A typed user card

**File:** `src/routes/modules/01-foundation/09-template-expressions/+page.svelte`

### DevTools verification

1. Open DevTools → Elements and inspect the card.
2. Verify the `class` attribute contains `card--pro` when the tier is `'pro'`, and not otherwise.
3. Verify the `style` attribute contains the custom property `--accent`.
4. Change the tier in the script. Vite hot-reloads; the classes and styles update instantly.

## 5. Check your understanding

<details>
<summary><strong>Q1.</strong> Why can you not put an <code>if</code> statement inside <code>{}</code>?</summary>

Because `{}` evaluates an expression, and an `if` statement is not an expression — it does not return a value. For branching inside markup, use the ternary `? :` operator (which is an expression) or the `{#if}` block.
</details>

<details>
<summary><strong>Q2.</strong> Write the HTML Svelte produces for <code>&lt;button disabled={true}&gt;</code> and for <code>&lt;button disabled={false}&gt;</code>.</summary>

`<button disabled>` and `<button>` respectively. Boolean attributes are either present or absent; Svelte handles the conversion.
</details>

<details>
<summary><strong>Q3.</strong> When should you prefer <code>class:foo={expr}</code> over <code>class="foo {expr ? 'bar' : ''}"</code>?</summary>

Almost always. The directive form is declarative, less error-prone, and does not require you to hand-format the class string. Only fall back to the string form when you are computing the class name itself dynamically.
</details>

<details>
<summary><strong>Q4.</strong> What is <code>{@const}</code> for?</summary>

To declare a constant local to a single iteration or branch inside the markup block. It is useful when you want to compute a value once and reuse it multiple times without calling the function repeatedly.
</details>

<details>
<summary><strong>Q5.</strong> Why is the <code>style:--foo={value}</code> directive especially useful in this course?</summary>

Because PE7 styling is built on CSS custom properties. Setting a custom property from typed script state is the canonical bridge between your data and your design tokens — every page-level colour personality and dynamic theme uses it.
</details>

## 6. Common mistakes

- **Forgetting the braces.** `<p>Hello name</p>` renders the literal text "Hello name". You wanted `<p>Hello {name}</p>`.
- **Wrapping strings in quotes *inside* the braces.** `href={"/user"}` works but `href="/user"` works too — the braces are only needed when the value is a TypeScript expression, not a literal string.
- **Trying to declare a variable in the markup with `let`.** `let x = ...` is a statement and statements cannot live in markup. Move it to the script or use `{@const}`.
- **Concatenating class strings by hand.** `class="btn {isLoading ? 'loading' : ''} {size}"` is fragile. Prefer `class:` directives (`class:loading={isLoading}`) and keep the static part in the `class` attribute.

## 7. What's next

Module 1 ends here. Module 2 opens by asking the single biggest question in client-side programming: what is state, and why does a component need it?
