---
module: 8
lesson: 8.5
title: Nested layouts and route groups
duration: 55 minutes
prerequisites:
  - Lesson 8.4 — File-based routing
learning_objectives:
  - Write a +layout.svelte that wraps multiple pages in a shared shell
  - Explain how layouts nest down the route tree
  - Use the children prop and snippets to render the page inside a layout
  - Use route groups (group) to share a layout between siblings without changing URLs
  - Know when to break out of a layout chain
status: ready
---

# Lesson 8.5 — Nested layouts and route groups

## 1. Concept — A shell that wraps many pages

### 1.1 The problem — duplication of the site shell

Every page on a typical website has the same navigation bar at the top, the same footer at the bottom, and probably the same sidebar on desktop. If you copied those three pieces into every `+page.svelte`, you would have the same twenty lines of markup in thirty different files. When the footer copyright year needs updating you would edit thirty files, and at least one of them would be missed.

The fix is a **layout**: a component that wraps one or more pages in a shared shell. SvelteKit picks layouts up from the folder tree using the same convention as pages. You drop a `+layout.svelte` into a folder, and every page in that folder and every subfolder is rendered inside that layout. Change the layout, change every page that lives under it, all at once.

### 1.2 The children prop

A layout receives a single prop, `children`, which is a Svelte **snippet** — a piece of markup passed in from outside that the layout can render wherever it wants. The pattern is:

```svelte
<script lang="ts">
    let { children } = $props();
</script>

<header>My site</header>
<main>
    {@render children()}
</main>
<footer>© 2026</footer>
```

`{@render children()}` is where the page goes. Everything outside that call is the shell.

In April 2026 the snippets API is stable and mandatory. You will not see `<slot />` in any modern SvelteKit code — that was Svelte 4.

### 1.3 Nesting — layouts compose down the tree

Layouts nest. If you have `src/routes/+layout.svelte` (site-wide shell) and `src/routes/blog/+layout.svelte` (blog-specific shell), a request for `/blog/hello` renders three components from the outside in:

```
root layout
    blog layout
        blog/[slug] page
```

Each layout gets its own `children` prop. The root layout's children is the blog layout; the blog layout's children is the page. This lets you share a global nav at the root and a blog-specific sub-nav at the `blog/` level, without either file knowing anything about the other.

### 1.4 Route groups — sharing a layout without sharing a URL

Sometimes you want to share a layout between pages that live at different URLs. For example, you might want the same marketing chrome on `/`, `/about` and `/pricing`, but a different app chrome on `/dashboard` and `/settings`. Both sets of pages are direct children of the root, so you cannot nest one set inside a folder without changing their URLs.

**Route groups** solve this. A folder name wrapped in parentheses, like `(marketing)` or `(app)`, is ignored by the URL but is still a real folder in the tree. That means you can put a layout inside the group and it wraps only the pages inside that group:

```
src/routes/
├── (marketing)/
│   ├── +layout.svelte      ← marketing chrome
│   ├── +page.svelte        ← /
│   ├── about/+page.svelte  ← /about
│   └── pricing/+page.svelte ← /pricing
├── (app)/
│   ├── +layout.svelte       ← dashboard chrome
│   ├── dashboard/+page.svelte  ← /dashboard
│   └── settings/+page.svelte   ← /settings
```

The URLs do not include `(marketing)` or `(app)`. Route groups are a pure organisational tool — they say "these pages share a layout, even though they do not share a URL prefix".

### 1.5 Breaking out of the layout chain

Occasionally you want a page that does not inherit any of its ancestor layouts. The classic example is a login page that should not show the app's nav bar. You break the chain by renaming the page file to `+page@.svelte` — the `@` marker tells SvelteKit to reset the layout chain.

You can also target a specific ancestor: `+page@(app).svelte` means "use the `(app)` group's layout, not any deeper layouts". This is an escape hatch; most pages never need it.

### 1.6 What layouts are good for, and what they are not

Layouts are for **structural shell** and **data that every child page needs** (loaded via `+layout.ts` or `+layout.server.ts`, Lesson 9A.5). They are not for "global state" — that is `$state` in a `.svelte.ts` module, Module 11.



## Going Deeper

**Official documentation:**
- [SvelteKit docs: Layouts](https://svelte.dev/docs/kit/routing#layout)
- [SvelteKit docs: Route groups](https://svelte.dev/docs/kit/advanced-routing#Route-groups)
- [SvelteKit docs: Breaking out of layouts](https://svelte.dev/docs/kit/advanced-routing#Breaking-out-of-layouts)

**Advanced pattern:** Build a 3-level nested layout chain (root → section → page) with visible borders at each level to show the nesting.

**Challenge question:** (Combines Lessons 8.5, 8.4, and 6.9) Build a site with two route groups: `(marketing)` with a full-width layout and `(app)` with a sidebar layout. Give each group a different `--color-brand` override. Verify that navigating between groups changes the layout AND the accent colour.

## Deep Dive

**Why this matters at scale.** Layouts define shells that persist across navigations, preventing unnecessary re-renders and providing consistent UI structure.

**The mental model.** Layouts compose: root layout wraps group layout wraps page. Each layout receives children as a snippet and renders it. Data flows through layout load functions into child pages.

**Edge cases.** Layout resets (@) break the inheritance chain. Route groups apply different layouts without affecting URLs. The most common mistake is putting page-specific UI in layouts.

**Performance implications.** Layouts re-render only when their own data changes. Navigation between pages in the same layout only swaps the page content, preserving layout state and DOM.

**Connection to other modules.** Module 9's layout data loads once and shares across child pages. Module 11's context is often provided at the layout level. Module 6's styling scopes to layout boundaries.

## 2. Style it — PE7 for a three-layer shell

The mini-build shows a nested layout live. The outer layout is a pink/magenta (`oklch(72% 0.18 340)`) panel containing an inner teal panel, which contains the page. Each layer has a labelled border so you can see where one ends and the next begins. Mobile-first: layers stack vertically; no media queries needed.

## 3. Interact — children as a snippet prop

```svelte
<script lang="ts">
    import type { Snippet } from 'svelte';

    interface Props {
        children: Snippet;
    }

    let { children }: Props = $props();
</script>

{@render children()}
```

The `Snippet` type comes from `svelte`. Typing `children` explicitly is optional (TypeScript infers it), but in a teaching file we annotate it so students can see the type.

## 4. Mini-build — a visible layout chain

**Paths:**

- `src/routes/modules/08-routing/05-nested-layouts/+layout.svelte`
- `src/routes/modules/08-routing/05-nested-layouts/+page.svelte`

The layout wraps the page in a labelled box. Open `/modules/08-routing/05-nested-layouts` and look at the nested borders: each border is a different layer of the chain.

### Prove nesting

1. Open `/modules/08-routing/05-nested-layouts`. You see one "Lesson layout" box wrapping the page content.
2. Navigate up to `/modules/08-routing`. The same site-wide PE7 base styles still apply, but the "Lesson layout" box is gone — because that layout lives inside the lesson folder and only wraps pages there.
3. In DevTools, inspect the DOM. You will see the page's HTML nested inside the layout's HTML. That nesting is exactly what SvelteKit compiled from the folder tree.

## 5. Check your understanding

<details>
<summary><strong>Q1.</strong> What is the role of <code>{@render children()}</code> in a layout?</summary>

It is the placeholder where the child page (or the next-deeper layout) renders. Every layout must include it or the page below would not be displayed.
</details>

<details>
<summary><strong>Q2.</strong> If you place <code>+layout.svelte</code> at <code>src/routes/blog/</code>, which pages does it wrap?</summary>

Every page at or below `src/routes/blog/` — `/blog`, `/blog/hello`, `/blog/2026/april`, and so on. It does not wrap `/` or `/about`, because those are outside the `blog/` folder.
</details>

<details>
<summary><strong>Q3.</strong> What is the difference between a folder named <code>blog</code> and a folder named <code>(blog)</code>?</summary>

`blog` adds `/blog` to the URL. `(blog)` is a route group — the name is ignored in the URL, but the folder still exists for organisation and for sharing a layout among siblings.
</details>

<details>
<summary><strong>Q4.</strong> How do you make a single page render without its ancestor layout?</summary>

Rename the file with an `@` marker: `+page@.svelte` resets the layout chain entirely, and `+page@groupName.svelte` targets a specific ancestor group.
</details>

<details>
<summary><strong>Q5.</strong> In SvelteKit 2.50+, how does a layout receive the page content — through a <code>&lt;slot /&gt;</code> or through a <code>children</code> prop?</summary>

Through a `children` prop that is a snippet, rendered with `{@render children()}`. `<slot />` is the old Svelte 4 API and is no longer used in runes-mode SvelteKit code.
</details>

## 6. Common mistakes

- **Forgetting `{@render children()}`** in the layout. The page will mount but nothing from it will display, because the layout never tells Svelte where to put it.
- **Using `<slot />` in a runes-mode layout.** The compiler will warn. Use the `children` snippet prop instead.
- **Writing page-specific styles in `+layout.svelte`.** Those styles leak to every descendant page. Put them in the page file instead.
- **Using route groups to change behaviour, not just styling.** Groups are purely organisational — they do not change URLs or add route segments. If you need a URL prefix, use a real folder.

## 7. What's next

Lesson 8.6 introduces dynamic route segments — `[slug]`, `[...rest]`, optional params and matchers — so a single folder can match many URLs.
