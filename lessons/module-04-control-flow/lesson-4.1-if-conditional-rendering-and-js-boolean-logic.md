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

## Deep Dive

**Why this matters at scale.** In a 50-component production app, conditional rendering is the mechanism behind every loading state, every permission gate, every feature flag, and every error boundary. A dashboard with 10 widgets might have 30+ `{#if}` blocks controlling what the user sees based on their role, their subscription tier, and whether data has loaded. If developers misunderstand the creation/destruction semantics of `{#if}` — particularly that state inside a destroyed block is lost — they introduce bugs where form inputs lose their values when a parent condition toggles. Clear understanding of "not rendered means not existing" prevents an entire class of state-loss bugs.

**The mental model.** Think of `{#if condition}` as a light switch connected to a demolition crew. When the switch is ON, the crew builds the room (creates DOM nodes, initialises component state). When the switch is OFF, the crew demolishes the room entirely — furniture, wiring, plumbing, everything. Next time the switch goes ON, they build a *new* room from scratch. There is no "pause" — only build and demolish. This is fundamentally different from CSS `display: none`, which hides the room but leaves it standing. If you need the room to persist while hidden, use CSS visibility or the `hidden` attribute instead of `{#if}`.

**Edge cases.** A common surprise: `{#if value}` where `value` is the number `0`. Because `0` is falsy in JavaScript, the block does not render — even though `0` is a valid, meaningful number. If you want to render when the value exists (including `0`), use `{#if value !== undefined && value !== null}` or `{#if value != null}`. Another edge case: reactive state declared inside an `{#if}` block is scoped to that block's lifetime. When the condition becomes false, the state is destroyed. When it becomes true again, a fresh instance is created with the initial value. This catches developers who expect the state to "remember" between toggles. A third edge case: `{#if}` combined with `transition:` (Module 6) — the transition runs before destruction, giving you an animation window, but the node is still ultimately destroyed.

**Performance implications.** `{#if}` creates and destroys DOM nodes, which is more expensive than toggling visibility. For content that toggles frequently (a tooltip that shows on hover), CSS visibility may be more performant because it avoids the creation/destruction cost. For content that toggles rarely (a login gate, an error state), `{#if}` is superior because the invisible nodes do not occupy memory or participate in layout calculations. The general rule: use `{#if}` for infrequent transitions and CSS for frequent ones. Svelte's compiled `{#if}` blocks are extremely lightweight — the creation path is a direct DOM `insertBefore`, not a virtual DOM diff — so even frequent toggling is acceptable for simple content.

**Cross-module connections.** Conditional rendering is foundational for Module 4's entire progression (`{:else}`, `{:else if}`, `{#await}`). Module 8 uses it for route-based conditional content. Module 9 uses it for loading/error/success states in load functions. Module 12 uses it with `{#await}` for progressive rendering. The concept of "existence vs visibility" also underpins Module 6's transition system, which animates the creation and destruction events that `{#if}` triggers.

### 1.7 What the compiler does with `{#if}`

The compiler transforms `{#if}` into conditional DOM creation code:

```svelte
{#if isSignedOut}
    <aside class="banner"><p>Welcome, guest!</p></aside>
{/if}
```

Compiles to roughly:

```js
// Simplified
let banner_fragment = null;

$.effect(() => {
    if ($.get(isSignedOut)) {
        if (!banner_fragment) {
            banner_fragment = create_banner();
            insert(anchor, banner_fragment);
        }
    } else {
        if (banner_fragment) {
            detach(banner_fragment);
            banner_fragment = null;
        }
    }
});
```

The key detail: the DOM fragment is *created* when the condition becomes true and *destroyed* when it becomes false. It is not hidden — it is gone. Any components inside the block are fully destroyed (their effects cleaned up, their state lost) when the condition becomes false.

### 1.8 "In production" — permission gates with `{#if}`

At a 50-developer enterprise app, the admin panel had features visible only to specific user roles. The initial implementation used `display: none` via a CSS class. A security audit revealed that users could inspect the hidden admin buttons in DevTools, modify the HTML to remove the `display: none`, and click them. Although the server rejected unauthorized requests, the visible (even if hidden) admin UI was a security concern.

After switching to `{#if user.role === 'admin'}`, the admin buttons did not exist in the DOM at all for non-admin users. DevTools showed nothing to inspect. The UI was not hidden — it was structurally absent. This is the security benefit of conditional rendering over conditional visibility: the browser's DOM cannot reveal markup that was never created.

### 1.9 Comparison: `{#if}` vs ternary vs `display: none`

| Approach | DOM when false | State preserved? | Screen readers | Performance |
|---|---|---|---|---|
| `{#if}` | Not in DOM | No — recreated fresh | Cannot find it | Best for infrequent toggles |
| Ternary in attribute | Element exists | Yes | Can find it | N/A (attributes only) |
| `display: none` | In DOM, hidden | Yes | May announce it | Best for frequent toggles |
| `hidden` attribute | In DOM, hidden | Yes | Hidden from AT | Same as `display: none` |

### 1.10 Common interview question

**Q: "What is the difference between conditional rendering (`{#if}`) and conditional visibility (`display: none`), and when should you use each?"**

**Model answer:** Conditional rendering removes the element from the DOM entirely when the condition is false. It does not exist — no memory, no event handlers, no accessibility tree entry. Use it for content that is logically absent (a login prompt that does not exist when logged in, an error message that does not exist when there is no error). Conditional visibility keeps the element in the DOM but hides it visually. Use it for content that toggles frequently (a tooltip, a dropdown) where the creation/destruction cost would cause visible jank, or when you need to preserve state (a form tab whose inputs should retain their values when the user switches tabs). The rule of thumb: `{#if}` for infrequent, logical absence. CSS visibility for frequent, visual toggling.

## Going Deeper

**Official docs to read next:**

- [svelte.dev/docs/svelte/if](https://svelte.dev/docs/svelte/if) — the `{#if}` block reference.
- [svelte.dev/docs/svelte/logic-blocks](https://svelte.dev/docs/svelte/logic-blocks) — all logic blocks overview.
- [svelte.dev/docs/svelte/transition](https://svelte.dev/docs/svelte/transition) — animating elements as they enter and leave via `{#if}`.

**Advanced pattern: `{#if}` with `transition:` for animated enter/leave.** Module 6 teaches transitions in full, but the preview: adding `transition:fade` to an element inside `{#if}` makes Svelte animate the element's opacity when the condition changes:

```svelte
{#if isVisible}
    <div transition:fade={{ duration: 200 }}>
        Now you see me...
    </div>
{/if}
```

The element fades in when `isVisible` becomes true and fades out before being destroyed when it becomes false. The `{#if}` still destroys the element — but the transition delays the destruction long enough for the animation to play.

**Challenge question (combines Lesson 4.1 + Lesson 2.2 + Lesson 1.9):** A component shows a "loading" spinner when `isLoading` is true and the content when it is false. Write the `{#if}` block. Then explain what happens to any `$state` variables declared *inside* the loading spinner block when `isLoading` flips to false and back to true. Why does this matter for a spinner that counts elapsed seconds?

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
