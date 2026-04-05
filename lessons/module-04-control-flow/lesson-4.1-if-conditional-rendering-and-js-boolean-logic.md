---
module: 4
lesson: 4.1
title: "{#if} — conditional rendering and JS boolean logic"
duration: 45 minutes
prerequisites:
  - Module 2 ($state)
  - Module 3.4 (optional props with defaults)
learning_objectives:
  - Explain why declarative conditional rendering beats imperative `display: none`
  - Use `{#if}` to include or exclude a block of markup based on a boolean
  - Distinguish truthy and falsy values in JavaScript and predict what each evaluates to in an `{#if}`
  - Build a sign-in banner that appears or disappears without any manual DOM manipulation
  - Recognise the difference between conditional rendering and conditional visibility
status: ready
---

# Lesson 4.1 — {#if}: conditional rendering and JS boolean logic

## 1. Concept — Markup that appears when it should, and does not exist when it should not

### 1.1 The problem: "show this banner, but only when the user is signed out"

Every real application has parts of the page that exist only sometimes. A "Sign in" banner appears only when the visitor is not logged in. A loading spinner appears only while a request is in flight. An error message appears only when something failed. A cart summary appears only when the cart has items.

The naive way to build this is to render *everything* all the time and hide the parts you do not want with `display: none`. It works visually. But it has three problems:

1. The hidden markup still exists in the DOM. Screen readers may still announce it. Keyboard navigation may still tab through it. Event handlers inside it still fire. A sign-in form hidden with `display: none` can be submitted by a keyboard-only user who tabs into it by mistake.
2. The hidden markup still costs CPU and memory. Every element is parsed, every handler is attached, every bound state is evaluated — for content nobody can see.
3. The hidden markup still has to exist in your source code, intertwined with everything else. You lose the ability to reason about what the page contains by reading it top to bottom.

**Conditional rendering** flips the model. Instead of always rendering and sometimes hiding, you only include the markup when it belongs. If the condition is false, the markup does not exist in the DOM at all. Svelte provides this with the `{#if}…{/if}` block.

### 1.2 The syntax of `{#if}`

`{#if}` is one of Svelte's **logic blocks**. Logic blocks start with `{#…}`, may contain `{:…}` continuations, and end with `{/…}`.

```svelte
{#if isSignedOut}
    <aside class="banner">
        <p>Welcome, guest!</p>
        <a href="/sign-in">Sign in</a>
    </aside>
{/if}
```

`isSignedOut` is any JavaScript expression that evaluates to a boolean. If it is `true`, Svelte inserts the `<aside>` into the DOM. If it is `false`, the `<aside>` does not exist — not hidden, not empty, *not there*. When the expression later flips from false to true, Svelte creates the DOM node and inserts it, running any components inside it for the first time. When it flips back, Svelte removes it and tears down those components.

### 1.3 Booleans and "truthiness"

`{#if}` asks for a boolean, but in JavaScript any value can be coerced to a boolean with the rules of **truthiness**. Understanding these rules is critical because `{#if name}` means different things depending on whether `name` is a string, a number, or something else.

The **falsy** values in JavaScript are: `false`, `0`, `-0`, `0n` (BigInt zero), `''` (empty string), `null`, `undefined`, and `NaN`. Every other value — any non-empty string, any non-zero number, any object, any array even if empty — is **truthy**.

Two surprises to remember:

- **An empty array `[]` is truthy.** `{#if items}` where `items = []` renders the block. If you meant "when there are items", write `{#if items.length > 0}`.
- **A whitespace-only string `' '` is truthy.** Only the exact empty string `''` is falsy.

In a university-level course we prefer **explicit** conditions over relying on truthiness. `{#if name !== ''}` and `{#if items.length > 0}` make the intent obvious to anyone reading the code three months later.

### 1.4 Why declarative beats imperative

In the old days you would write JavaScript to hide and show elements by hand: `document.getElementById('banner').style.display = 'none'`. That is **imperative**: "execute these commands". Svelte's `{#if}` is **declarative**: "this block exists when this is true". The browser's state and the JavaScript's state are always in sync because Svelte manages the relationship for you. There is no way to forget to update the DOM because there is no DOM update to write.

### 1.5 How `{#if}` interacts with `$state`

Because `{#if}` takes a plain JavaScript expression, it works with any reactive value — a `$state` variable, a `$derived` value, a prop, or a combination. When any of those inputs change, Svelte re-evaluates the condition and adds or removes the block accordingly. You do not write any "update" code. The reactive graph handles it.

```svelte
<script lang="ts">
    let isSignedIn: boolean = $state(false);
</script>

<button onclick={() => (isSignedIn = !isSignedIn)}>Toggle</button>

{#if !isSignedIn}
    <p>Please sign in.</p>
{/if}
```

Click the button, `isSignedIn` flips, the `{#if}` expression flips with it, and the `<p>` is created or destroyed.

### 1.6 Conditional rendering vs conditional visibility

Sometimes you want the node to exist but be invisible — for example, you want a fade-out animation before it disappears, or you want tab navigation to skip it without destroying its state. For those cases, `{#if}` is not the right tool. You hide with `hidden` or `aria-hidden="true"` or a CSS class. Module 6 teaches `transition:` which is the cleanest way to animate a node as it is conditionally rendered in and out. For now, the default tool is `{#if}`, and the default assumption is "if it should not be there, it should not exist".

## 2. Style it — A banner that enters and leaves cleanly

The mini-build is a small banner above the main content. When present, it has a coloured left border (from `--color-brand`), generous padding, and a subtle background. When absent, the content below moves up smoothly because the banner's DOM is gone — not hidden. The page never leaves a gap for a node that does not exist.

## 3. Interact — Toggle it once, then toggle it right

Write an `isSignedIn: boolean = $state(false)` and a button that toggles it. Render the banner inside `{#if !isSignedIn}`. Watch the banner appear and disappear as you click. Then deliberately write the buggy version — `{#if isSignedIn}` — and observe that the banner shows when signed in, the opposite of what you wanted. Fix the operator and move on. This is how you build boolean intuition: make the mistake, read the result, fix it.

## 4. Mini-build — A sign-in banner

### File

`src/routes/modules/04-control-flow/01-if/+page.svelte`

### Key excerpt

```svelte
<script lang="ts">
    let isSignedIn: boolean = $state(false);

    function toggle(): void {
        isSignedIn = !isSignedIn;
    }
</script>

<button type="button" onclick={toggle}>
    {isSignedIn ? 'Sign out' : 'Sign in'}
</button>

{#if !isSignedIn}
    <aside class="banner">
        <p><strong>Welcome, guest.</strong> Sign in to save your progress.</p>
    </aside>
{/if}
```

### DevTools verification

1. Open the Elements panel and expand the section body. When signed out, the `<aside class="banner">` is present.
2. Click **Sign in**. Watch the `<aside>` disappear from the Elements tree. It is not hidden — it is removed.
3. Click **Sign out**. The `<aside>` reappears. Svelte created a fresh DOM node for it.

## 5. Check your understanding

<details>
<summary><strong>Q1.</strong> Why is conditional rendering (`{#if}`) usually better than hiding with `display: none`?</summary>

Hidden elements are still in the DOM — they consume memory, keep event handlers attached, remain reachable by assistive technology, and can be tabbed into. Conditional rendering removes the element entirely when the condition is false.
</details>

<details>
<summary><strong>Q2.</strong> What are the falsy values in JavaScript?</summary>

`false`, `0`, `-0`, `0n`, `''`, `null`, `undefined`, and `NaN`. Every other value — including empty arrays and empty objects — is truthy.
</details>

<details>
<summary><strong>Q3.</strong> `items = []`. What does `{#if items}` render?</summary>

The block renders because an empty array is truthy. If you want "only render when there are items", write `{#if items.length > 0}`.
</details>

<details>
<summary><strong>Q4.</strong> What happens inside Svelte when an `{#if}` condition flips from false to true?</summary>

Svelte creates the DOM nodes for the block, attaches any event listeners, and initialises any components inside. When it flips back to false, Svelte destroys them.
</details>

<details>
<summary><strong>Q5.</strong> Does `{#if}` care whether its expression comes from `$state`, `$derived`, a prop, or a plain constant?</summary>

It does not care. Any JavaScript expression works. Reactivity kicks in automatically when any reactive value the expression reads changes.
</details>

## 6. Common mistakes

- **Using truthiness where an explicit check is clearer.** `{#if name}` passes for any non-empty string, but `{#if name !== ''}` states intent.
- **Assuming an empty array is falsy.** It is not. Check `items.length > 0`.
- **Mixing `{#if}` with `display: none` for the same decision.** Pick one model per decision.
- **Forgetting to close the block.** Every `{#if}` needs a matching `{/if}`. A missing closing tag is a compile error with the exact line.

## 7. What's next

Lesson 4.2 adds `{:else if}` and `{:else}` to handle multi-branch logic without stacking `{#if}` blocks.
