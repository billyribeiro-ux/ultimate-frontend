---
module: 12
lesson: 12.8
title: Accessibility — ARIA, keyboard navigation, focus management
duration: 60 minutes
prerequisites:
  - Module 5 — keyboard and form accessibility
learning_objectives:
  - Use semantic HTML as the first and best accessibility tool
  - Add ARIA roles and labels only where semantic HTML falls short
  - Build a focus trap inside a modal using a Svelte action
  - Announce async updates with aria-live regions
  - Add a skip link and visible focus styles that every user can see
status: ready
---

# Lesson 12.8 — Accessibility — ARIA, keyboard navigation, focus management

> **Atomic lesson format** — Concept, Style it, Interact, Mini-build. Accessibility is not a "nice to have" bolted on at the end. It is the baseline of a professional web application. This lesson teaches you the five patterns that cover 90 percent of real accessibility work.

## 1. Concept — Five patterns, in order of importance

### 1.1 Semantic HTML beats every ARIA trick

The single best thing you can do for accessibility is write HTML that names what it is. A `<button>` is a button. A `<nav>` is a navigation. A `<main>` is the primary content. Assistive technology (screen readers, switch controllers, voice software) understands those tags natively, and every browser exposes them through the accessibility tree without configuration.

The ARIA spec has a famous line: *"If you can use a native HTML element … then do so."* A `<div role="button" tabindex="0">` can be made *almost* as accessible as a `<button>`, but doing so requires you to reimplement Enter and Space activation, focus styles, disabled state, and a handful of keyboard details that every browser already handles for real buttons. Use the native element and you get all of that free.

This is the 80/20 rule of accessibility. The rest of this lesson covers the 20 percent — ARIA attributes, focus management, live regions — that fills in the places semantic HTML cannot reach.

### 1.2 ARIA: role, label, and state

ARIA attributes annotate the accessibility tree where native HTML is insufficient. The three categories you will use daily:

1. **Roles** (`role="alert"`, `role="status"`, `role="dialog"`, `role="tablist"`). These tell assistive tech what a custom element *is*. Use a role only when no native element matches. A `<button>` does not need `role="button"`; a custom tab panel does need `role="tabpanel"`.
2. **Labels** (`aria-label`, `aria-labelledby`, `aria-describedby`). A button with only an icon ("×") has no text content, so screen readers read "button" and nothing else. `aria-label="Close"` gives it a name. For fields with an off-screen label, `aria-labelledby` points to the element that serves as the label.
3. **State** (`aria-expanded`, `aria-selected`, `aria-disabled`, `aria-pressed`). These announce dynamic state changes that CSS alone cannot express. A toggle button with `aria-pressed="true"` is announced as "pressed" by screen readers; a disclosure widget with `aria-expanded="false"` is announced as "collapsed".

Rule: **every interactive element must have a computed accessible name.** You can verify this in Chrome DevTools → Elements → Accessibility pane, which shows the computed name for any selected element. If the name is blank, the element is invisible to assistive tech.

### 1.3 Focus management inside dialogs and modals

When a modal opens, focus should move inside the modal. When it closes, focus should return to whatever triggered it. While the modal is open, Tab should cycle among the modal's focusable elements without escaping. This pattern is called a **focus trap**, and it is essential for keyboard users.

The action:

```ts
import type { Action } from 'svelte/action';

export const focusTrap: Action<HTMLElement> = (node) => {
	const previouslyFocused = document.activeElement as HTMLElement | null;

	function getFocusable(): HTMLElement[] {
		return Array.from(
			node.querySelectorAll<HTMLElement>(
				'a[href], button:not([disabled]), input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])'
			)
		);
	}

	function handle(event: KeyboardEvent): void {
		if (event.key !== 'Tab') return;
		const focusable = getFocusable();
		if (focusable.length === 0) return;
		const first = focusable[0];
		const last = focusable[focusable.length - 1];
		if (event.shiftKey && document.activeElement === first) {
			last.focus();
			event.preventDefault();
		} else if (!event.shiftKey && document.activeElement === last) {
			first.focus();
			event.preventDefault();
		}
	}

	// Move focus into the modal on mount.
	queueMicrotask(() => {
		getFocusable()[0]?.focus();
	});

	node.addEventListener('keydown', handle);

	return {
		destroy(): void {
			node.removeEventListener('keydown', handle);
			previouslyFocused?.focus();
		}
	};
};
```

Attach with `<div role="dialog" aria-modal="true" aria-labelledby="title" use:focusTrap>`. The action moves focus inside on open, traps Tab, and returns focus to the trigger on close. Combined with `role="dialog"` and `aria-modal="true"`, this is the minimum correct modal.

### 1.4 `aria-live` regions for async updates

When your app changes content without a full page reload — a toast, a search result count, a saved-status indicator — sighted users see the change, but screen reader users do not unless you tell the screen reader to announce it. `aria-live` regions solve this.

```svelte
<div role="status" aria-live="polite">
	{#if message}
		<p>{message}</p>
	{/if}
</div>
```

`aria-live="polite"` means "announce the change the next time the screen reader is idle". `aria-live="assertive"` means "interrupt whatever is being announced and say this immediately" — use it only for genuinely critical messages (errors, warnings). Polite is almost always the right choice.

Rule: **every dynamically-updated status message belongs inside a live region.** Form errors, save confirmations, "3 new results found", anything the user would want to know about without having to manually refocus to find it.

### 1.5 Skip links and visible focus

A **skip link** is a hidden-until-focused link at the top of the page that jumps keyboard users past the navigation and into the main content. Without it, a keyboard user must Tab through every nav link on every page to reach the content.

```svelte
<a href="#main" class="skip-link">Skip to main content</a>

<style>
	.skip-link {
		position: absolute;
		inset-block-start: -100%;
		inset-inline-start: 0;
		background: var(--color-brand);
		color: oklch(15% 0 0);
		padding: var(--space-sm) var(--space-md);

		&:focus-visible {
			inset-block-start: 0;
		}
	}
</style>
```

The link is positioned off-screen until focused, at which point it slides into view. Combined with an `id="main"` on the main content, it gives keyboard users a one-Tab shortcut.

Visible focus is equally important. The PE7 reset already includes a global `:focus-visible` outline in the brand colour; do not remove it. `outline: none` without a replacement is one of the most common accessibility failures on the web, and it is entirely avoidable.

### 1.6 Test with a keyboard, then with a screen reader

Close your mouse. Tab through your page. Can you reach every interactive element? Does focus move in a logical order? Can you close a modal with Escape? If any of those answers is no, the page is not accessible.

Open VoiceOver (macOS ⌘F5) or NVDA (Windows, free) and read your page linearly. Does every element announce a useful name? Are headings in order? Are live regions announcing updates? This is the final acceptance test; nothing substitutes for actually hearing the page read aloud.

### 1.x What the browser does under the hood with ARIA

ARIA (Accessible Rich Internet Applications) attributes communicate widget semantics to assistive technologies:

1. **Screen readers** build an accessibility tree from the DOM. ARIA attributes modify this tree: `role="dialog"` tells the reader "this is a dialog," `aria-expanded="true"` tells it "this section is open," `aria-label="Close"` provides a text label for an icon button.
2. **Focus management** determines what keyboard users can reach. `tabindex="0"` makes an element focusable. `tabindex="-1"` makes it programmatically focusable (via `element.focus()`) but removes it from the tab order.
3. **Live regions** (`aria-live="polite"` or `aria-live="assertive"`) announce dynamic content changes to screen readers without requiring focus to move. Use for toasts, status updates, and error messages.

In Svelte, managing focus after navigation requires a manual `$effect` because SvelteKit's client-side navigation does not automatically move focus to the new content:

```svelte
<script lang="ts">
    import { afterNavigate } from '$app/navigation';
    let mainContent: HTMLElement;
    afterNavigate(() => { mainContent?.focus(); });
</script>
<main bind:this={mainContent} tabindex="-1">...</main>
```

> **In production sidebar.** We ran an accessibility audit on our SvelteKit app and found 23 ARIA violations. The top three: (1) icon buttons without `aria-label` — screen readers announced them as "button" with no description. (2) Dynamic content updates without `aria-live` regions — screen readers missed toast notifications entirely. (3) Focus not returning to the trigger after closing a modal — keyboard users were lost on the page. Fixing all 23 took two days. The hardest fix was focus management after SvelteKit navigations — we added an `afterNavigate` hook that moves focus to the main content area, which screen readers announce as the new page.

### 1.x Common interview question

**Q: "How do you manage focus after a SvelteKit client-side navigation for keyboard and screen reader users?"**

**Model answer:** SvelteKit's client-side navigation does not trigger a full page load, so the browser does not automatically reset focus to the top of the page. Keyboard and screen reader users can be "lost" — their focus stays on the old page's element. The fix: use the `afterNavigate` callback from `$app/navigation` to programmatically move focus to the main content area. Give the `<main>` element `tabindex="-1"` (so it is programmatically focusable but not in the tab order) and call `mainElement.focus()` after each navigation. Some teams add a visually-hidden "skip to content" link at the top of each page and focus it after navigation instead. The key principle: every navigation must move focus to a meaningful location so keyboard users know where they are.

## Deep Dive

**Why this matters at scale.** Accessibility shapes component architecture from the beginning. Five patterns: semantic HTML, ARIA roles, keyboard navigation, focus management, screen reader announcements.

**The mental model.** Use <button> not <div onclick>. Add role, aria-label, aria-describedby. Handle Tab, Enter, Escape, Arrow keys. Manage focus on open/close. Announce changes with aria-live.

**Edge cases.** Focus traps must wrap at both ends. Escape should close modals. ARIA attributes must reference existing IDs. Test with VoiceOver/NVDA, not just visual inspection.

**Performance implications.** Semantic HTML has zero overhead. ARIA attributes are parsed once. Keyboard listeners are standard DOM events. Accessibility does not cost performance.

**Connection to other modules.** Module 6.18 handles reduced motion. Module 10's forms generate accessible error patterns.


## Going Deeper

- Check the relevant section in the official [Svelte](https://svelte.dev/docs) or [SvelteKit](https://svelte.dev/docs/kit) documentation.
- Apply the pattern from this lesson to a real project and measure the impact.
- Explore the advanced patterns described in the Deep Dive section above.

## 2. Style it — Accessibility as design, not afterthought

The mini-build renders a small form with three fields, a modal, a live region, and a skip link. Per-page accent: `oklch(68% 0.18 180)` (accessible teal).

- Every form field has a visible `<label>`.
- Every button has an accessible name (icon-only buttons use `aria-label`).
- Visible focus rings are preserved via `:focus-visible`.
- A `prefers-reduced-motion` guard disables the modal slide-in animation.

## 3. Interact — Open, trap, close

The student opens the modal with a button, Tab cycles inside the modal, Escape closes it, and focus returns to the trigger. A toast appears after form submission, and its content is announced by the live region.

## 4. Mini-build — Accessible form with a focus-trapped modal

**File:** `src/routes/modules/12-performance/08-accessibility/+page.svelte`

Includes: a skip link, a semantic form with labels, an icon button with `aria-label`, a focus-trapped modal backed by the `focusTrap` action from Section 1.3, and an `aria-live="polite"` toast that announces submissions.

### DevTools moment

Open the Accessibility pane (Elements → Accessibility). Click through each interactive element and confirm the computed name is non-empty and correct. Tab through the page with the keyboard closed and confirm the tab order matches the visual order. Enable VoiceOver or NVDA and listen to the page — every change should be announced when it happens.

## 5. Check your understanding

<details>
<summary><strong>Q1.</strong> Why is semantic HTML more valuable than ARIA?</summary>

Native elements come with all their keyboard behaviour, focus styles, and accessibility tree metadata for free. A `<button>` handles Enter and Space, announces as "button", disables correctly, and integrates with form submission. A `<div role="button">` requires you to reimplement all of that, and you will get at least one detail wrong. Use the native element whenever possible.
</details>

<details>
<summary><strong>Q2.</strong> What does a focus trap do?</summary>

It keeps Tab focus inside a dialog or modal, so that keyboard users cannot accidentally tab out of it to background content they cannot see. On close, it returns focus to the element that triggered the modal.
</details>

<details>
<summary><strong>Q3.</strong> What is the difference between <code>aria-live="polite"</code> and <code>aria-live="assertive"</code>?</summary>

Polite waits until the screen reader is idle and then announces the change. Assertive interrupts the current announcement to deliver the message immediately. Use polite for almost everything; reserve assertive for genuinely critical alerts.
</details>

<details>
<summary><strong>Q4.</strong> Why is a skip link important?</summary>

A keyboard user lands on every page and must Tab through the navigation before reaching the content. A skip link gives them a one-Tab shortcut directly to `#main`. Without it, getting to the main content on every page is a significant barrier.
</details>

<details>
<summary><strong>Q5.</strong> Is it acceptable to remove focus outlines because they look ugly?</summary>

No. Removing `:focus-visible` with `outline: none` and providing no replacement makes the page unusable with a keyboard. If you dislike the default outline, replace it with a custom focus style that is still clearly visible — the PE7 reset already does this.
</details>

## 6. Common mistakes

- **`<div onclick>` instead of `<button onclick>`.** A div is not keyboard-accessible, not focus-styled, and not announced as clickable.
- **Icon button with no `aria-label`.** Screen reader users hear "button" with no hint of what the button does.
- **`outline: none` without a replacement.** Kills keyboard visibility.
- **Toast messages outside a live region.** Sighted users see them; screen reader users never know they happened.

## 7. What's next

Lesson 12.9 moves from writing accessible code to verifying it (and everything else) works — unit testing with Vitest.
