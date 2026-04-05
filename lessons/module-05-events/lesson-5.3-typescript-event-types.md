---
module: 5
lesson: 5.3
title: TypeScript event types — MouseEvent, KeyboardEvent, InputEvent, SubmitEvent, FocusEvent
duration: 50 minutes
prerequisites:
  - Lesson 5.1 (lowercase onclick)
  - Lesson 5.2 (typed functions)
learning_objectives:
  - Name the most common DOM event types and the attributes that fire them
  - Type a handler parameter correctly for click, key, input, change, focus, and submit events
  - Narrow event.target to a specific HTMLElement subclass and read its properties safely
  - Explain the difference between event.target and event.currentTarget
  - Read values from inputs without using bind:value
status: ready
---

# Lesson 5.3 — TypeScript event types

## 1. Concept — The DOM is a type system

### 1.1 The problem: `e.target.value` is a lie (in strict TypeScript)

If you come from JavaScript tutorials, you have seen this line a thousand times:

```ts
function handleInput(e) {
    console.log(e.target.value);
}
```

Open the same code in a TypeScript-strict project and your editor lights up red. Two errors. First, the parameter `e` is implicitly `any`. Second, even if you type `e` as `Event`, `e.target` is `EventTarget | null`, and `EventTarget` has no `value` property. TypeScript is right to refuse: an event can fire on anything, and not every "anything" has a value. Making it compile requires telling TypeScript exactly what event you expect and exactly what element the event came from.

### 1.2 The DOM event hierarchy

Every DOM event is an instance of some class in a hierarchy. At the top sits `Event` — the bare minimum, with `type`, `target`, and methods like `preventDefault`. Below it sit specialised subclasses, each adding fields relevant to that flavour of interaction:

- **`MouseEvent`** extends `Event`. Fires on `click`, `dblclick`, `mousedown`, `mouseup`, `mouseenter`, `mouseleave`. Adds `clientX`, `clientY`, `button`, `shiftKey`, `ctrlKey`, etc.
- **`PointerEvent`** extends `MouseEvent`. The unified pointer model (mouse, touch, pen). Adds `pointerType`, `pressure`, `tiltX`, `tiltY`. Lesson 5.9 uses this one.
- **`KeyboardEvent`** extends `Event`. Fires on `keydown`, `keyup`. Adds `key`, `code`, `altKey`, `ctrlKey`, `metaKey`, `shiftKey`, `repeat`.
- **`InputEvent`** extends `Event`. Fires on `input`. Adds `data` (the characters that were inserted) and `inputType`.
- **`Event`** (generic) is what fires for `change`, `focus`, `blur`, `scroll`, `load`, and many more.
- **`FocusEvent`** extends `Event`. Fires on `focus`, `blur`, `focusin`, `focusout`. Adds `relatedTarget`.
- **`SubmitEvent`** extends `Event`. Fires on form `submit`. Adds `submitter`.

The rule of thumb: type the parameter as the *most specific* class that gives you the fields you need. For a click, use `MouseEvent`. For a key press, use `KeyboardEvent`. For a form submission, use `SubmitEvent`.

### 1.3 Typing a handler in Svelte 5

```svelte
<script lang="ts">
    function handleClick(event: MouseEvent): void {
        console.log(event.clientX, event.clientY);
    }

    function handleKey(event: KeyboardEvent): void {
        if (event.key === 'Enter') console.log('enter pressed');
    }

    function handleSubmit(event: SubmitEvent): void {
        event.preventDefault();
    }
</script>

<button onclick={handleClick}>Click</button>
<input onkeydown={handleKey} />
<form onsubmit={handleSubmit}>...</form>
```

Because `onclick`, `onkeydown`, and `onsubmit` are real HTML attributes with well-known event shapes, Svelte infers the type automatically *if* you use an inline arrow function: `onclick={(e) => console.log(e.clientX)}` — `e` is already `MouseEvent`. When you pull the handler out into a named function, you must type it yourself.

### 1.4 Narrowing `event.target` safely

`event.target` is typed as `EventTarget | null`. That is the *most general* type, because any event can target any DOM node — a comment, a text node, a window, anything. To read `value` off an `<input>`, you must tell TypeScript that *this particular target* is actually an `HTMLInputElement`.

The idiomatic way is a type assertion with `as`:

```ts
function handleInput(event: InputEvent): void {
    const target = event.target as HTMLInputElement;
    console.log(target.value);
}
```

`as` is a promise to TypeScript: "trust me, I know what this is". Use it honestly. If you assert `HTMLInputElement` but the event actually fires on a `<textarea>`, you will silently get the wrong element at runtime.

A safer alternative for mixed-target scenarios is an `instanceof` narrow:

```ts
function handleInput(event: InputEvent): void {
    const target = event.target;
    if (target instanceof HTMLInputElement) {
        console.log(target.value);
    }
}
```

This version asks the browser at runtime whether the target really is an input, and only reads `value` if it is. Use it when one handler can legitimately fire on several element types.

### 1.5 `event.target` vs `event.currentTarget`

A subtle but important distinction. `event.target` is the deepest element where the event actually happened — it can be a child of the element you attached the listener to. `event.currentTarget` is the element whose listener is currently running. If you click a `<span>` inside a `<button>` that has `onclick={handle}`:

- `event.target` is the `<span>`.
- `event.currentTarget` is the `<button>`.

For most handlers you want `currentTarget` because that is the element you chose to listen on. Its type is also more helpful: inside an `onclick` attached to a `<button>`, TypeScript knows `currentTarget` is `HTMLButtonElement` without you having to assert.

## 2. Style it — A form-ish card with a brand-blue personality

The mini-build is a small demo showing an input, a button, and a keystroke display. Use PE7 tokens. Per-page brand colour: cool blue `oklch(68% 0.18 240)`. The input needs a `min-block-size: 44px`, a visible `:focus-visible` ring that uses `var(--color-brand)`, and a clear placeholder. Mobile first.

## 3. Interact — Reading `value` without `bind:value`

Svelte has a `bind:value` directive that does the typing for you, but learning to read `event.target.value` by hand makes `bind:value` feel magical later and prepares you for handlers that need richer data than a single value. Start with the broken untyped version:

```ts
// BROKEN: e is implicit any, target has no value
function onInput(e) {
    text = e.target.value;
}
```

Fix it with a type annotation and a narrowing cast:

```ts
function onInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    text = target.value;
}
```

## 4. Mini-build — A typed input / key / click demo

**File:** `src/routes/modules/05-events/03-typescript-event-types/+page.svelte`

The page shows:

- An `<input>` whose value is read through `onInput` with a cast to `HTMLInputElement`.
- A `<button>` whose `onClick` reports `event.clientX` from a `MouseEvent`.
- A `<div tabindex="0">` that captures `keydown` and displays the `event.key` plus modifier flags.

Each event panel displays the current event's data live so you can see the types come alive.

### DevTools verification

Open the Elements panel, inspect the input, then in the Console type:

```
$0 instanceof HTMLInputElement
```

`true` — the browser confirms what TypeScript needed you to assert. Type `$0.value` to prove the narrowing was correct.

## 5. Check your understanding

<details>
<summary><strong>Q1.</strong> Why is <code>event.target.value</code> a type error in strict TypeScript?</summary>

`event.target` is `EventTarget | null`, and the base `EventTarget` type does not have a `value` property. TypeScript does not know that this particular target is actually an input until you narrow it with `as HTMLInputElement` or `instanceof HTMLInputElement`.
</details>

<details>
<summary><strong>Q2.</strong> What is the difference between <code>MouseEvent</code> and <code>PointerEvent</code>?</summary>

`PointerEvent` extends `MouseEvent` and unifies mouse, touch, and pen input into one API. It adds fields like `pointerType`, `pressure`, and `tiltX`. For modern input handling you usually prefer pointer events.
</details>

<details>
<summary><strong>Q3.</strong> What is the difference between <code>event.target</code> and <code>event.currentTarget</code>?</summary>

`target` is the deepest element where the event actually happened (can be a child of the listening element). `currentTarget` is the element whose listener is running. Inside an `onclick` handler attached to a button, `currentTarget` is always that button.
</details>

<details>
<summary><strong>Q4.</strong> When is <code>instanceof</code> safer than <code>as</code>?</summary>

When one handler can legitimately fire on several element types. `instanceof` checks at runtime and only enters the branch if the check passes; `as` is a blind promise that fails silently at runtime if wrong.
</details>

<details>
<summary><strong>Q5.</strong> What event type fires on <code>&lt;form onsubmit&gt;</code>?</summary>

`SubmitEvent` — a subclass of `Event` that adds a `submitter` field telling you which button inside the form triggered the submission.
</details>

## 6. Common mistakes

- **Typing the parameter as `Event` when you need a subclass.** If you need `clientX`, `Event` does not have it — you need `MouseEvent`.
- **Asserting the wrong element type.** `event.target as HTMLButtonElement` when the target is really an `<a>` compiles, but fails at runtime the moment you read a button-only property.
- **Reading `event.target.value` on a button.** Buttons do not have a `.value` that means anything useful. You probably want `event.currentTarget.dataset.something` instead.
- **Forgetting that `event.target` can be `null`.** In generic `Event` handlers it can be. Narrow first.

## 7. What's next

Lesson 5.4 teaches `event.preventDefault()` and `event.stopPropagation()` — the two methods every form and every dropdown on the web depends on.
