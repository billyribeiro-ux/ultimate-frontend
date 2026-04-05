---
module: 5
lesson: 5.10
title: Form accessibility and keyboard navigation
duration: 60 minutes
prerequisites:
  - Lesson 5.3 (typed events)
  - Lesson 5.9 (pointer events)
learning_objectives:
  - Associate every input with a label using explicit htmlFor / id
  - Use aria-describedby to link error messages to inputs
  - Use aria-invalid to mark fields as failed validation
  - Build a keyboard-navigable custom select with arrow keys and typeahead
  - Manage focus correctly on submit, on error, and on close
status: ready
---

# Lesson 5.10 — Form accessibility and keyboard navigation

## 1. Concept — The web is a keyboard first

### 1.1 The problem: forms that trap their users

Millions of people navigate the web without a mouse. Some use a keyboard because a screen reader drives their browsing. Some use it because they have motor impairments that make a trackpad painful. Some are power users who never leave the home row. All of them depend on the same set of browser conventions: tab to move forward, shift-tab to move back, space or enter to activate, escape to close, arrow keys to navigate lists. A form that ignores these conventions is a form those users cannot complete.

Worse — and this is the part most developers learn the hard way — a lot of beautiful custom form widgets silently break these conventions. A `<div>` styled to look like a `<select>` does not respond to arrow keys. A toast that steals focus but never returns it leaves the user stranded. A submit button that fires without ever announcing the result to a screen reader passes silently for a user who cannot see the page.

This lesson teaches the small set of attributes and handlers that make a form work for everyone. It is short in code and long in impact.

### 1.2 Native first, always

Rule zero: use the built-in element whenever it exists. `<button>`, `<input>`, `<select>`, `<textarea>`, `<form>`, `<fieldset>`, `<legend>`, and `<label>` come with keyboard handling, focus management, screen reader labels, and browser autofill built in — all for free. The moment you reach for a `<div>` to emulate one of them, you are taking on the burden of re-implementing fifteen behaviours the browser would have given you.

### 1.3 Labels — the foundation

Every input must have a visible label that is *programmatically associated* with it. Two ways:

```svelte
<!-- Explicit: label has for="X", input has id="X" -->
<label for="email">Email</label>
<input id="email" type="email" />

<!-- Implicit: input is nested inside label -->
<label>
    Email
    <input type="email" />
</label>
```

Both are correct. The explicit form is required when the label needs to sit visually far from the input. The implicit form is convenient when they are next to each other. Do not use `placeholder` as a label — placeholders disappear on focus, they lack contrast, and they are not announced by screen readers.

### 1.4 Describing errors with `aria-describedby` and `aria-invalid`

When a field fails validation, you need to tell the user three things: *that* it failed, *why* it failed, and *that* it specifically is the field at fault.

```svelte
<label for="email">Email</label>
<input
    id="email"
    type="email"
    aria-invalid={emailError !== ''}
    aria-describedby="email-error"
/>
<p id="email-error" class="error" aria-live="polite">
    {emailError}
</p>
```

- **`aria-invalid`** marks the field as failed. Screen readers announce "invalid" when the user focuses it.
- **`aria-describedby`** points at the id of the explanatory text. When the user focuses the input, the screen reader reads the label *and* the description.
- **`aria-live="polite"`** on the error paragraph means updates are announced as they happen, without interrupting current speech.

Style the field visually too — a red border under `:where([aria-invalid="true"])` is enough — but never rely on colour alone. A user with red-green colour blindness needs the text explanation.

### 1.5 Focus management on submit

When the user submits a form with errors, the page should move focus to the first invalid field. That saves tab presses and tells screen readers exactly where to start. The pattern:

```ts
function onSubmit(event: SubmitEvent): void {
    event.preventDefault();
    const firstError = document.querySelector<HTMLInputElement>('[aria-invalid="true"]');
    if (firstError !== null) {
        firstError.focus();
        return;
    }
    // ... all good, actually submit
}
```

Similarly, after a successful submit, focus should move somewhere meaningful — usually a confirmation message with `tabindex="-1"` on its container so it can receive programmatic focus.

### 1.6 Keyboard-navigable custom widgets

Sometimes the native element is not enough. A searchable combobox, a multi-select with chips, a date picker — these need custom markup. The rules:

1. **Tabindex.** The widget's "tab stop" is the main button/input with `tabindex="0"`. Internal options are not in the tab order; arrow keys move between them.
2. **Keyboard handlers.** At a minimum, arrow up/down navigate, enter/space select, escape close, home/end jump to ends. Lesson 5.10's mini-build implements all of these.
3. **ARIA roles.** The container is `role="listbox"`, each option is `role="option"`, the active option has `aria-selected="true"` and `aria-activedescendant` on the listbox.
4. **Focus ring.** `:focus-visible` on the widget container; do not hide it.

### 1.7 Return focus when something closes

If opening a menu moves focus into it, closing the menu must return focus to the button that opened it. Store a reference before opening, restore on close. This is the single most-missed accessibility detail in custom widgets, and the one that makes keyboard users rage-quit.

## 2. Style it — A clean labelled form + a custom select

Per-page colour: `oklch(65% 0.18 260)` (cool indigo). Labels are `var(--text-sm)`, uppercase, `letter-spacing: 0.06em`, and always sit *above* the input. Inputs are 44 px minimum, full width, with a 2 px focus ring via `:focus-visible`. Error text is `var(--color-error)`.

## 3. Interact — Keyboard all the way

Add `onkeydown` to a custom listbox. On arrow down, increment the active index (wrapping). On arrow up, decrement. On enter, select. On escape, close. Prevent default on all of these so the page does not scroll.

## 4. Mini-build — A tiny accessible form with a custom select

**File:** `src/routes/modules/05-events/10-form-a11y-keyboard/+page.svelte`

Contents:

- A labelled email input with live error text.
- A password input with minimum-length validation.
- A custom listbox select for "favourite framework" with full keyboard support.
- A submit button. On submit with errors, focus moves to the first invalid field. On submit with no errors, a success panel appears and receives focus.

### DevTools verification

Navigate the form with Tab and Shift+Tab only — never touch the mouse. Try to complete the whole form, submit it, and read the success message. If you can do it blind, the form passes. Then run Lighthouse → Accessibility; aim for 100.

## 5. Check your understanding

<details>
<summary><strong>Q1.</strong> What is wrong with using <code>placeholder</code> as the only label?</summary>

Placeholders disappear when the user starts typing, usually have poor contrast, and are not reliably announced by screen readers. Use a real `<label>`.
</details>

<details>
<summary><strong>Q2.</strong> How do you programmatically associate an error message with an input?</summary>

Give the error element an `id` and reference it from the input with `aria-describedby`. Also set `aria-invalid="true"` on the input so screen readers announce the failed state.
</details>

<details>
<summary><strong>Q3.</strong> After a failed submit, where should focus go?</summary>

To the first invalid field. That saves the user tab presses and tells screen readers exactly where to begin correcting.
</details>

<details>
<summary><strong>Q4.</strong> Which ARIA role marks a container as a listbox and which marks its options?</summary>

`role="listbox"` on the container and `role="option"` on each child option. The currently-highlighted option has `aria-selected="true"`.
</details>

<details>
<summary><strong>Q5.</strong> Why should the focus ring never be hidden under <code>@media (hover: hover)</code>?</summary>

Because keyboard users need the focus ring on every device, including desktops with mice. The correct selector is `:focus-visible`, which shows the ring only when focus arrived via keyboard.
</details>

## 6. Common mistakes

- **`<div>` instead of `<button>`.** No keyboard activation, no focus, no announcement. Always use `<button type="button">`.
- **Focus lost after closing a dialog.** Focus falls back to the body and the user is stranded. Always restore focus to the element that opened the dialog.
- **Colour-only error signal.** Colourblind users see nothing. Always pair colour with text.
- **Labels tied only with visual proximity.** A label must be a real `<label>` element with `for` or nest the input. Anything else is invisible to screen readers.

## 7. What's next

Module 5 ends here. The **module project** — an Interactive Form with Live Validation — asks you to combine everything: debounced validation, typed callback props for child fields, pointer-friendly custom controls, full keyboard navigation, and a final accessible submit flow.
