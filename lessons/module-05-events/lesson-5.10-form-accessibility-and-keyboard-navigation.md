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


### 1.8 The TypeScript angle — typing ARIA attributes

Svelte 5 supports ARIA attributes natively on HTML elements. TypeScript validates them through the `HTMLAttributes` interface. Key typed patterns:

```ts
// aria-invalid accepts boolean | 'true' | 'false' | 'grammar' | 'spelling'
<input aria-invalid={hasError} />

// aria-describedby accepts a string (space-separated IDs)
<input aria-describedby="email-error email-help" />

// aria-expanded accepts boolean
<button aria-expanded={isOpen} />

// aria-activedescendant accepts a string (element ID)
<div role="listbox" aria-activedescendant={activeId} />
```

TypeScript will warn if you pass the wrong type — for example, passing a number to `aria-describedby` or a string to `aria-expanded`.

### 1.9 Comparison: native elements vs custom ARIA widgets

| Feature | Native `<select>` | Custom listbox with ARIA |
|---------|-------------------|-------------------------|
| Keyboard navigation | Free | You implement arrow keys, Enter, Escape, Home, End |
| Screen reader support | Free | You implement `role`, `aria-selected`, `aria-activedescendant` |
| Focus management | Free | You implement `tabindex` roving |
| Styling | Limited (OS-dependent) | Full control |
| Autofill integration | Free | Not available |
| Mobile UX | Native picker (iOS wheel, Android dropdown) | Your custom rendering |
| Development cost | Zero | 200+ lines of accessible code |

The table makes the case for native elements. Every time you build a custom widget, you are volunteering to re-implement behaviour that browsers have spent decades perfecting. Build custom only when the native element truly cannot meet the design requirement.

> **In production sidebar.** On a 100K-daily-user government services portal subject to WCAG 2.1 AA compliance audits, we replaced a custom `<div>`-based select component with the native `<select>` element and added a thin CSS wrapper for styling. The custom component had 340 lines of JavaScript for keyboard navigation, ARIA attributes, and focus management. After the audit, it still had 7 accessibility violations (missing `aria-owns`, incorrect `tabindex` roving on iOS VoiceOver, and no support for the Home/End keys). The native `<select>` passed every test with zero JavaScript and took 15 minutes to style. The 340 lines were deleted. Sometimes the best code is no code.

### 1.10 Common interview question

**Q: You are building a custom dropdown component. What ARIA roles and properties do you need, and what keyboard interactions must you support?**

**Model answer:** The trigger button needs `role="combobox"` (or just be a `<button>`), `aria-expanded` (true/false), and `aria-haspopup="listbox"`. The dropdown list needs `role="listbox"`. Each option needs `role="option"` and `aria-selected="true"` on the active one. The trigger also needs `aria-activedescendant` pointing to the ID of the currently highlighted option (so the screen reader announces it without moving DOM focus). Keyboard interactions: Arrow Down/Up navigate options, Enter/Space select, Escape closes, Home jumps to first, End to last. Tab should close the dropdown and move focus to the next focusable element. When the dropdown closes, focus must return to the trigger button. The most commonly missed requirement is returning focus — without it, keyboard users are stranded after closing the dropdown.

## Deep Dive

**Why this matters at scale.** In a 50-component production app, accessibility is not a feature — it is a legal requirement in many jurisdictions (ADA, EAA, WCAG). Every form that lacks proper labels, every custom widget that traps keyboard focus, and every interactive element that is not reachable via Tab is a compliance failure and a usability barrier for the 15-20% of users who rely on assistive technology. At enterprise scale, retrofitting accessibility is 10x more expensive than building it in from the start. This lesson establishes the patterns that make every subsequent form and interactive widget accessible by default.

**The mental model.** Think of keyboard navigation as a directed graph. Each focusable element is a node. Tab moves forward along the graph; Shift+Tab moves backward. Arrow keys move within a composite widget (like radio buttons or tabs). Escape dismisses overlays and returns focus to the trigger. This graph must be fully connected — every interactive element must be reachable — and it must be predictable. Users build a mental model of the focus graph as they navigate, and any violation (a focus trap, a skip, an unexpected jump) breaks that model and causes confusion. Your job as a developer is to ensure the graph is logical, complete, and consistent.

**Edge cases.** A common mistake: making a `<div>` interactive with `onclick` but forgetting `role`, `tabindex`, and `onkeydown`. Screen readers announce it as generic content; keyboard users cannot reach it. Always use semantic elements (`<button>`, `<a>`, `<input>`) when possible — they come with free keyboard and screen-reader support. When custom widgets are unavoidable (custom dropdowns, date pickers, colour pickers), follow the ARIA Authoring Practices Guide exactly. Another edge case: `tabindex="-1"` makes an element focusable via JavaScript but removes it from the Tab order. Use this for elements that should receive programmatic focus (like a modal container) but should not interrupt the natural Tab flow. A third subtlety: `aria-live` regions announce dynamic content changes to screen readers. Without them, toast notifications and validation messages are invisible to non-sighted users.

**Performance implications.** Accessibility features have zero runtime performance cost in most cases — ARIA attributes are static metadata the browser exposes to the accessibility tree. The only performance consideration is focus management in large lists: calling `element.focus()` synchronously during a render can trigger forced reflow. Schedule focus changes with `tick()` (Svelte's microtask utility) to batch them with other DOM updates. For virtualized lists where the focused element might be destroyed on scroll, maintain a `tabindex` roving pattern that keeps one visible element focusable at all times.

**Cross-module connections.** Accessibility patterns established here carry through Module 6 (transitions with `aria-hidden` for animated content), Module 7 (focus management after GSAP animations complete), Module 8 (route-change focus announcements), Module 10 (form validation error announcement), Module 12 (dedicated accessibility audit lesson), and Module 13 (ARIA landmarks for SEO and assistive navigation). The principle "every interactive element must be keyboard-reachable and screen-reader-announced" is a quality gate that applies to every component in the course.


## Going Deeper

**Official documentation:**
- [WAI-ARIA Authoring Practices Guide](https://www.w3.org/WAI/ARIA/apg/) — the authoritative reference for custom widget patterns
- [MDN: ARIA roles reference](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Roles) — every role with its required properties
- [Svelte docs: Accessibility warnings](https://svelte.dev/docs/svelte/accessibility-warnings) — compiler-level a11y checks in Svelte

**Advanced pattern: roving tabindex.** In a composite widget (tabs, radio group, toolbar), only one child element has `tabindex="0"` at a time. Arrow keys move the `tabindex="0"` to the next/previous child and call `.focus()` on it. Tab moves focus out of the widget entirely. This "roving" pattern keeps the Tab order clean while giving arrow-key navigation inside the widget.

**Challenge question (combines Lessons 5.10, 5.4, and 5.3):** Build an accessible `<Tabs>` component. The tab list has `role="tablist"`. Each tab button has `role="tab"`, `aria-selected`, and `aria-controls` (pointing to the panel ID). Each panel has `role="tabpanel"` and `aria-labelledby` (pointing to the tab ID). Implement roving tabindex: only the active tab has `tabindex="0"`. Arrow Left/Right navigate tabs. On keydown, call `preventDefault` to stop the page from scrolling. Type the keydown handler as `(event: KeyboardEvent) => void` and narrow `event.currentTarget` to `HTMLButtonElement`.

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
