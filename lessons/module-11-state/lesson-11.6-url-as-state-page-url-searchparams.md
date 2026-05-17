---
module: 11
lesson: 11.6
title: URL as state — page.url.searchParams
duration: 50 minutes
prerequisites:
  - Module 8 — $app/state and $app/navigation
  - Lesson 11.3 — reactive module stores
learning_objectives:
  - Read current query parameters via page.url.searchParams from $app/state
  - Write query parameters with goto() and keepFocus/replaceState/noScroll options
  - Build a $derived view of the current filter that updates on navigation
  - Sync a form input to the URL without an infinite update loop
  - Explain why URL-as-state beats module-as-state for shareable views
status: ready
---

# Lesson 11.6 — URL as state — `page.url.searchParams`

> **Atomic lesson format** — Concept, Style it, Interact, Mini-build. Not all state belongs in JavaScript memory. Filters, pagination, sort order, tab selection — anything the user would expect to survive a reload or a shared link — belongs in the URL.

## 1. Concept — The URL is the oldest and best store

### 1.1 Why the URL is a great place to keep state

Think about what makes a good URL. It is a plain string, readable by humans, copy-pasteable into a chat message, bookmarkable, back-button-aware, crawlable by search engines, and restored automatically on reload. Every one of those properties is free. When you put filter state (`?role=admin&sort=joined&page=3`) in the URL, your users can share exact views, reload without losing context, go back with the browser button, and forward a link that "just works" to a teammate. None of those things happen if the filter lives in a module store.

The question to ask for any piece of state is: *would a user expect this to be in the URL?* If the answer is yes — filters, search, pagination, active tab, sort — put it in the URL. If the answer is no — a cart, an open modal, a draft that the user has not submitted yet — keep it in memory.

### 1.2 Reading the URL in Svelte 5 + SvelteKit 2.55+

The reactive page object lives in `$app/state`:

```svelte
<script lang="ts">
	import { page } from '$app/state';

	const role = $derived(page.url.searchParams.get('role') ?? 'all');
	const sort = $derived(page.url.searchParams.get('sort') ?? 'name');
	const pageNum = $derived(Number(page.url.searchParams.get('page') ?? '1'));
</script>

<p>Showing {role} sorted by {sort}, page {pageNum}.</p>
```

A note on history. SvelteKit 2 deprecated the older `$app/stores` module (which exposed `$page`) in favour of `$app/state` (which exposes `page` as a reactive object). The new form is a rune-compatible reactive object; you read its properties directly without a leading `$`. Tutorials that use `$page.url.searchParams` are the *older* pattern. They still work, but `page.url.searchParams` from `$app/state` is the April 2026 recommendation and the one you will use in this course.

Every time the URL changes — whether via a link click, the back button, or a programmatic `goto()` — the `page` object updates reactively, and any `$derived` that reads `page.url.searchParams` recomputes. There is no subscription to manage.

### 1.3 Writing the URL with `goto()`

To change a parameter from code, use `goto()` from `$app/navigation`:

```svelte
<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';

	function setRole(role: string): void {
		const url = new URL(page.url);
		if (role === 'all') url.searchParams.delete('role');
		else url.searchParams.set('role', role);
		url.searchParams.set('page', '1'); // reset pagination on filter change
		goto(url, { keepFocus: true, noScroll: true, replaceState: true });
	}
</script>
```

Four options on `goto()` are worth knowing and using:

- **`keepFocus: true`** — keeps the currently focused element focused across navigation. Essential for keyboard users adjusting a filter.
- **`noScroll: true`** — prevents SvelteKit from scrolling the page to the top. You almost always want this when you are only changing a filter.
- **`replaceState: true`** — replaces the current history entry instead of pushing a new one. Use this when the user is actively adjusting a control (sliding a range, typing into a search box); otherwise every keystroke piles onto the back-button stack.
- **`invalidateAll: true`** — forces `load()` functions to re-run. Useful if the filter needs to fetch fresh data from the server; unnecessary if the filter is purely client-side.

### 1.4 The infinite loop trap

A naive sync looks like this and never stops:

```ts
// WRONG
$effect(() => {
	const current = page.url.searchParams.get('q') ?? '';
	search.query = current;
});

$effect(() => {
	const url = new URL(page.url);
	url.searchParams.set('q', search.query);
	goto(url);
});
```

Effect A reads the URL and writes `search.query`. Effect B reads `search.query` and writes the URL via `goto()`. Each `goto()` changes the URL, which re-runs Effect A, which re-runs Effect B. Infinite loop.

The fix is to pick one direction as the source of truth: **the URL is the state, and the form input is a controlled value.** Read from `page.url` with a `$derived`; write to `page.url` inside an `onchange` handler. No effect in either direction.

```svelte
<script lang="ts">
	import { page } from '$app/state';
	import { goto } from '$app/navigation';

	const q = $derived(page.url.searchParams.get('q') ?? '');

	function onInput(event: Event): void {
		const value = (event.currentTarget as HTMLInputElement).value;
		const url = new URL(page.url);
		if (value) url.searchParams.set('q', value);
		else url.searchParams.delete('q');
		goto(url, { keepFocus: true, noScroll: true, replaceState: true });
	}
</script>

<input type="search" value={q} oninput={onInput} />
```

`value={q}` is a one-way binding — the URL flows into the input. `oninput` is a one-way write — the input flows into the URL. No bind:value, no effect, no loop.

### 1.5 Debouncing URL writes

Every keystroke pushing a `goto()` is wasteful. For text inputs, debounce the write so that only one update hits the history stack per burst:

```ts
let timer: ReturnType<typeof setTimeout> | null = null;
function onInput(event: Event): void {
	const value = (event.currentTarget as HTMLInputElement).value;
	if (timer) clearTimeout(timer);
	timer = setTimeout(() => {
		const url = new URL(page.url);
		if (value) url.searchParams.set('q', value);
		else url.searchParams.delete('q');
		goto(url, { keepFocus: true, noScroll: true, replaceState: true });
	}, 250);
}
```

`replaceState: true` is especially important here — without it, a ten-letter word would create ten history entries.

### 1.6 What to keep out of the URL

Two things do not belong:

- **Secrets.** Anything you would not want in a server log, an HTTP referrer header, or a screenshot. URLs are public.
- **Large blobs.** Browsers limit URL length (about 2 000 characters in practice). Do not stuff a selected-IDs array into the URL once it gets beyond a handful. Use pagination or a cursor token.

Everything else you might be tempted to reach for a store for — active tab, filter, sort, search query, page number — belongs in the URL.

### 1.x What SvelteKit does under the hood

URL state in SvelteKit works through the reactive `page` object from `$app/state`:

1. When the URL changes (link click, `goto()`, back button), SvelteKit's router updates the internal `page` state.
2. The `page` object is a Svelte 5 reactive proxy. Reading any property creates a dependency.
3. `$derived(page.url.searchParams.get('q'))` creates a computed value that automatically recomputes whenever the URL changes.
4. `goto()` with search params creates a new history entry (or replaces the current one with `replaceState: true`). SvelteKit does not reload the page — it updates the `page` proxy, which triggers reactive updates.

The key insight: URL changes are reactive events in SvelteKit. You do not need event listeners or subscriptions. Reading `page.url.searchParams` inside a `$derived` or component markup is sufficient.

### 1.x Comparison: URL state vs memory state vs localStorage

| Aspect | URL (searchParams) | Memory ($state) | localStorage |
| --- | --- | --- | --- |
| Survives reload | Yes | No | Yes |
| Shareable via link | Yes | No | No |
| Back button aware | Yes | No | No |
| SEO crawlable | Yes | No | No |
| Data types | Strings only | Any | JSON-serializable |
| Max size | ~2000 chars (URL limit) | Unlimited | ~5-10 MB |
| Best for | Filters, pagination, sort, search | UI state, drafts, toggles | Preferences, cart, auth tokens |

> **In production sidebar.** We moved all filter state to the URL in our admin dashboard. The immediate wins: (1) Users share filtered views by copying the URL. (2) The back button undoes filter changes. (3) Page reloads preserve the exact filter state. (4) Google indexes filtered views as separate pages, improving long-tail search traffic. The one gotcha: we had to add `replaceState: true` to rapid-fire inputs (search-as-you-type) to avoid polluting the browser history with 50 entries per search query.

### 1.x Common interview question

**Q: "When should state live in the URL versus in JavaScript memory?"**

**Model answer:** State belongs in the URL when users would expect to bookmark, share, or reload it — filters, pagination, sort order, search queries, active tabs. State belongs in memory when it is transient or private — open/closed toggles, draft inputs before submission, animation progress, modal visibility. The test: if a user copies the URL and sends it to a colleague, should the colleague see the same view? If yes, the state belongs in the URL. URL state has the additional benefit of being back-button-aware and SEO-crawlable, which memory state is not.

## Deep Dive

**Why this matters at scale.** The URL is the most robust state container: survives navigation, reload, sharing, and bookmarking. Zero client-side persistence code.

**The mental model.** Read from page.url.searchParams. Write via goto('?key=value', { replaceState: true }). Every URL change triggers reactive updates.

**Edge cases.** replaceState: true prevents history pollution from filter changes. Not all state belongs in the URL — passwords, sensitive data, and transient UI state should use $state.

**Performance implications.** goto() with replaceState is near-instant: no network request, no load function rerun (unless the URL change triggers invalidation).

**Connection to other modules.** Module 8's goto() API drives URL updates. Module 9A's invalidation responds to URL changes.


## Going Deeper

- **Svelte docs:** Check the relevant section in the [Svelte documentation](https://svelte.dev/docs).
- **Challenge:** Apply the pattern from this lesson to a real component in your own project. Measure the before and after in terms of code lines and type safety.

## 2. Style it — A URL-driven filter bar

The mini-build renders a filter bar above a list of members. Every control — a role `<select>`, a search `<input>`, and a sort `<select>` — writes to the URL on change. Per-page accent: `oklch(72% 0.18 240)` (URL blue). Inputs have minimum 44px touch targets.

## 3. Interact — The URL updates as you type

Typing in the search field updates the URL after a 250 ms debounce. Changing the role select updates immediately. Clicking back returns to the previous filter state — because every change is a navigation.

## 4. Mini-build — A URL-driven member filter

**File:** `src/routes/modules/11-state/06-url-as-state/+page.svelte`

Imports the `members` dataset from `$lib/stores/members.ts`, reads `page.url.searchParams` for role/search/sort, computes a `$derived` filtered list, and renders the result. Every control writes back to the URL.

### DevTools moment

Open the address bar, type into the search field, and watch the URL update in real time after the debounce. Click back in the browser — the filter resets to the previous value and the result list updates. Copy the URL, open a new tab, paste it — the same filter is restored instantly. That is URL-as-state paying off.

## 5. Check your understanding

<details>
<summary><strong>Q1.</strong> Why should a filter live in the URL rather than a module store?</summary>

A filter in the URL is bookmarkable, shareable, survives a reload, integrates with the back button, and is crawlable. None of those properties are free with a module store. Any state a user would expect to be in the URL should be in the URL.
</details>

<details>
<summary><strong>Q2.</strong> What is the difference between <code>$app/stores</code> and <code>$app/state</code>?</summary>

`$app/stores` is the older module, which exposed `$page` as a Svelte 3/4-style store (read with a leading `$`). `$app/state` is the April 2026 replacement, which exposes `page` as a rune-compatible reactive object (read without the `$`). Use `$app/state` in new code. Tutorials that use `$page.url.searchParams` are using the older pattern.
</details>

<details>
<summary><strong>Q3.</strong> How does two-way URL sync cause an infinite loop, and how do you prevent it?</summary>

One effect reads the URL and writes local state; another effect reads local state and writes the URL. Each write triggers the other's read, which triggers its own write, forever. Prevent it by picking a single source of truth: read from the URL with a `$derived`, write to the URL from an event handler. No effect is ever needed in either direction.
</details>

<details>
<summary><strong>Q4.</strong> Why use <code>replaceState: true</code> when debouncing a search input?</summary>

Without it, every debounced update pushes a new history entry. Ten search queries become ten back-button steps that the user must press to leave the page. `replaceState` rewrites the current entry instead, keeping the history clean.
</details>

<details>
<summary><strong>Q5.</strong> Name two things that must not go in the URL.</summary>

Secrets (URLs end up in server logs, referrer headers, and screenshots) and large blobs (browsers limit URL length around 2 000 characters). Anything else is fair game.
</details>

## 6. Common mistakes

- **`bind:value` on a URL-backed input.** Two-way binding fights the URL write. Use `value={q}` + `oninput`.
- **Forgetting `noScroll: true`.** Every filter change scrolls the page to the top.
- **Stacking history entries on every keystroke.** Use `replaceState: true` when debouncing.
- **Reading `$page.url` instead of `page.url` from `$app/state`.** April 2026 uses the new module.

## 7. What's next

Lesson 11.7 introduces TanStack Table — the headless library that gives you sort, filter, and pagination without you writing the algorithms yourself.
