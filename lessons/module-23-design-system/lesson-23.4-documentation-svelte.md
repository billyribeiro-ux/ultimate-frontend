---
module: 23
lesson: 23.4
title: Documentation with Svelte
duration: 55 minutes
prerequisites:
  - "23.3 — Component API design"
  - "23.1 — What a design system is"
  - "8.4 — File-based routing — how files become pages"
learning_objectives:
  - Build a documentation page that renders live Svelte components alongside their source code
  - Implement a component documentation pattern without MDsveX dependency
  - Create prop tables generated from TypeScript interfaces
  - Design a documentation layout with navigation, previews, and code blocks
  - Explain why living documentation that runs real components is superior to static screenshots
status: ready
---

# Lesson 23.4 — Documentation with Svelte

> **Atomic lesson format** — every lesson in this course follows the same four parts: **Concept**, **Style it**, **Interact**, **Mini-build**.

## 1. Concept — Documentation that runs

### 1.1 The problem: stale screenshots and outdated examples

Traditional design system documentation uses screenshots and code snippets. A technical writer captures a screenshot of a Button, pastes it into a Markdown file, and writes example code below it. Six weeks later, the Button component changes — its border radius increases, its loading state animation changes. The documentation is now stale: the screenshot shows the old Button, the code example might still work or might not.

The root problem is that the documentation and the component are separate artifacts. They can drift apart, and there is no automated check to catch the drift.

### 1.2 Living documentation

Living documentation embeds the actual component in the documentation page. Instead of a screenshot of a Button, the documentation page renders a real `<Button>` component. When the Button changes, the documentation updates automatically because it runs the same component code.

This approach has three advantages:

1. **Always accurate.** The documentation shows the current component, not a snapshot from weeks ago.
2. **Interactive.** Visitors can interact with the component — hover over it, click it, tab to it — just like they would in the real application.
3. **Copy-pasteable.** The code example is verified to work because it is literally running on the page.

### 1.3 Building docs in SvelteKit without MDsveX

MDsveX (Markdown + Svelte) was the traditional approach for component documentation — write Markdown with embedded Svelte components. But MDsveX adds a build dependency and introduces its own syntax that is neither standard Markdown nor standard Svelte.

An alternative approach uses pure SvelteKit: each component's documentation is a `+page.svelte` file that imports and renders the component alongside code examples. This approach requires no extra tooling, is fully type-checked, and uses the same file-based routing you already know.

```svelte
<!-- src/routes/docs/button/+page.svelte -->
<script lang="ts">
    import Button from '$lib/components/Button.svelte';

    const exampleCode: string = `<Button variant="primary" size="md">Click me</Button>`;
</script>

<section class="doc-page">
    <h1>Button</h1>
    <p>A clickable element that triggers an action.</p>

    <div class="preview">
        <Button variant="primary" size="md">Click me</Button>
    </div>

    <pre><code>{exampleCode}</code></pre>
</section>
```

### 1.4 Prop tables from TypeScript

A documentation page should list every prop with its type, default value, and description. You can generate this from the TypeScript interface:

```typescript
interface PropDoc {
    name: string;
    type: string;
    defaultValue: string;
    required: boolean;
    description: string;
}

const buttonProps: PropDoc[] = [
    {
        name: 'variant',
        type: "'primary' | 'secondary' | 'ghost' | 'danger'",
        defaultValue: "'primary'",
        required: false,
        description: 'Visual style of the button'
    },
    {
        name: 'size',
        type: "'sm' | 'md' | 'lg'",
        defaultValue: "'md'",
        required: false,
        description: 'Physical size affecting padding and font size'
    }
];
```

A reusable `<PropTable>` component renders this data consistently across all documentation pages.

### 1.5 The documentation layout

A documentation site needs navigation — a sidebar listing all components, organized by category (Forms, Feedback, Layout, Navigation). SvelteKit's nested layout system handles this naturally:

```
src/routes/docs/
    +layout.svelte      ← sidebar navigation
    +page.svelte         ← docs home
    button/+page.svelte  ← Button docs
    input/+page.svelte   ← Input docs
    card/+page.svelte    ← Card docs
```

The layout file renders the sidebar and the main content area. Each component page imports and documents one component.

### 1.6 Interactive examples with state

Static examples show the component in one state. Interactive examples let the visitor manipulate props and see the component change. The API playground from Lesson 23.3 is a documentation pattern — embed a playground on each component's documentation page.

The pattern: a collapsible "Playground" section at the top of each doc page with prop controls, and a "Examples" section below with static examples for common use cases (primary button, disabled button, loading button, button with icon).

### 1.7 "In Production" — documentation as the onboarding tool

A fintech company onboarded 8 new engineers in Q1 2026. Previously, onboarding took 2 weeks because new engineers spent days reading component source code to understand how to use each component. After launching their living documentation site, onboarding dropped to 3 days. New engineers browsed the docs, saw live examples, copied code snippets, and started building. The documentation site was deployed alongside the design system and updated automatically on every release. The team estimated that the documentation site saved 40 engineering hours per new hire.

### 1.8 The TypeScript angle

The documentation system itself is typed. A `ComponentDoc` interface ensures every documentation page includes the required sections:

```typescript
interface ComponentDoc {
    name: string;
    description: string;
    category: 'forms' | 'feedback' | 'layout' | 'navigation' | 'data-display';
    props: PropDoc[];
    examples: Example[];
    accessibilityNotes: string[];
    relatedComponents: string[];
}

interface Example {
    title: string;
    description: string;
    code: string;
}
```

### 1.9 Common interview question

**Q: "Why is living documentation better than screenshots and static code examples?"**

**Model answer:** Living documentation embeds the actual component, so it is always accurate — when the component changes, the documentation updates automatically. Screenshots become stale and require manual updates. Living documentation is interactive, allowing visitors to click, hover, and tab through the component. Static code examples may become invalid after component API changes, while live-rendered code is verified to compile and run on every build. The trade-off is build cost: documentation pages must import and render components, which adds to build time and bundle size. But for a design system serving a team, the accuracy benefit far outweighs the cost.

## Deep Dive

**Rendering source code alongside live components.** A common pattern is a "code-preview" component that shows a live preview above and the source code below. The source code can be stored as a string constant or loaded from a file at build time using a Vite virtual module. Highlighting the code is done with a syntax highlighter like Shiki (which runs at build time) or a client-side highlighter.

**Search in documentation.** For large design systems with 50+ components, navigation alone is insufficient. Add client-side search using a lightweight search index (Pagefind, Fuse.js) that indexes component names, prop names, descriptions, and categories. This lets developers type "loading" and find every component that has a loading state.

**Version-specific documentation.** When the design system is versioned, documentation should show the docs for the version the consumer is using. Deploy docs per version: `docs.example.com/v1/button`, `docs.example.com/v2/button`. This prevents confusion when a team using v1 reads v2 docs.

**Accessibility documentation patterns.** Each component's doc page should include: keyboard navigation instructions, required ARIA attributes (automatically applied by the component), screen reader announcements, and WCAG success criteria the component satisfies. This information is essential for teams building accessible products.

**Connection to other lessons.** Lesson 23.3 built the API playground pattern. Lesson 8.4 covered file-based routing used for the docs structure. Lesson 23.5 adds visual regression testing to ensure documentation screenshots remain accurate. Lesson 23.8 covers publishing the documentation alongside the npm package.

## Going Deeper

**Official docs to read next:**

- [svelte.dev/docs/kit/routing](https://svelte.dev/docs/kit/routing) — SvelteKit routing for documentation structure.
- [shiki.style](https://shiki.style/) — Shiki syntax highlighter for code blocks.
- [storybook.js.org/docs/svelte](https://storybook.js.org/docs/svelte/) — Storybook for Svelte (an alternative to custom documentation).

**Advanced pattern: automated prop documentation from source.** Use a build-time script that parses Svelte component files, extracts the `$props()` interface, and generates the `PropDoc` data automatically. This eliminates manual prop table maintenance — when you add a new prop, the documentation updates on the next build.

**Challenge question (combines Lesson 23.4 + Lesson 23.3 + Lesson 23.5):** You add a new `loading` prop to the Button component. How would you ensure that: (a) the documentation page shows the loading state, (b) the prop table includes the new prop, and (c) the visual regression test catches the new visual state? Design a workflow where adding a prop triggers all three updates.

## 2. Style it — PE7 applied to the component doc page

The mini-build is a documentation page with preview and source sections. The preview area uses a `var(--color-surface)` background with dashed `var(--color-border)` and `var(--radius-lg)` corners. Code blocks use `var(--color-surface-2)` with monospace font at `var(--text-sm)`. The prop table uses `var(--color-surface-2)` striped rows. Navigation sidebar uses `var(--color-surface-2)` background with `var(--color-brand)` active indicator. The layout uses a sidebar/main split at `min-width: 768px`.

## 3. Interact — live component preview with source code toggle

The problem: developers want to see both the component and the code that produces it, and toggle between multiple examples. The interactive element renders a Button in multiple states (primary, disabled, loading) with collapsible source code blocks. A `$state` tracks which code blocks are expanded.

```typescript
interface DocExample {
    id: string;
    title: string;
    code: string;
    showCode: boolean;
}
```

## 4. Mini-build — component doc page with live preview

**File:** `src/routes/modules/23-design-system/04-documentation-svelte/+page.svelte`

This page renders a documentation page for a simulated Button component. It shows live component previews alongside collapsible source code, a prop table, and usage guidelines. The page demonstrates the documentation pattern that would be applied to every component in a design system.

### Run it

```bash
pnpm dev
```

Then open `http://localhost:5173/modules/23-design-system/04-documentation-svelte`.

### Prove the concept

1. See the live Button previews rendered in the preview areas — these are real interactive elements, not screenshots.
2. Click "Show code" to expand the source code for each example.
3. Review the prop table — every prop has a type, default, and description.
4. Interact with the Button previews (hover, click, tab) to verify they behave like real components.

## 5. Check your understanding

<details>
<summary><strong>Q1.</strong> Why is a live component preview better than a screenshot in documentation?</summary>

A live preview is always accurate because it renders the actual component code. When the component changes, the preview updates automatically. Screenshots become stale and must be manually updated. Live previews are also interactive — visitors can hover, click, and keyboard-navigate, which screenshots cannot demonstrate.
</details>

<details>
<summary><strong>Q2.</strong> How does SvelteKit's file-based routing help with documentation structure?</summary>

Each component's documentation is a `+page.svelte` file in a route directory. A shared `+layout.svelte` provides sidebar navigation. Adding a new component's documentation is as simple as creating a new directory with a `+page.svelte` file. No routing configuration needed — the file system is the router.
</details>

<details>
<summary><strong>Q3.</strong> What information should a prop table include for each prop?</summary>

Name, TypeScript type (with union values listed explicitly), default value, whether it is required, and a description explaining the prop's purpose. Some design systems also include "since" (the version the prop was added) and "deprecated" (if the prop is being phased out).
</details>

<details>
<summary><strong>Q4.</strong> What is the advantage of building documentation in SvelteKit vs using Storybook?</summary>

SvelteKit documentation uses the same tooling, same build system, and same routing patterns as the application. There is no additional build tool to configure and maintain. The documentation is a SvelteKit app itself, so it benefits from SSR, prerendering, and all SvelteKit features. Storybook is a separate tool with its own configuration, plugin ecosystem, and build process. The trade-off: Storybook provides more built-in features (addon ecosystem, viewport simulation, accessibility checks), while SvelteKit documentation is simpler but requires building those features manually.
</details>

<details>
<summary><strong>Q5.</strong> How do you prevent documentation from becoming stale?</summary>

Use living documentation that renders actual components instead of screenshots. Generate prop tables from TypeScript interfaces so they update when props change. Include visual regression tests (Lesson 23.5) that fail if the component's appearance changes without updating the documentation. Run documentation as part of the CI pipeline — if documentation pages fail to build, the PR cannot merge.
</details>

## 6. Common mistakes

- **Showing only the "happy path" in documentation.** Documentation should show error states, empty states, loading states, and disabled states — not just the primary success case. Developers need to know how to handle every scenario.
- **Not including accessibility information.** Every component doc page should list keyboard navigation, ARIA attributes, and screen reader behavior. Without this, developers using the component may create inaccessible UIs.
- **Writing documentation that does not compile.** If code examples are stored as strings, they can become invalid after API changes. Either render the actual component (living documentation) or run code examples through the TypeScript compiler in CI.
- **Burying the most useful information.** Lead with the most common use case, then show variants and advanced options. Do not start with the edge cases.

## 7. What's next

Lesson 23.5 introduces visual regression testing — using Playwright screenshots to automatically detect when a component's appearance changes unexpectedly.
