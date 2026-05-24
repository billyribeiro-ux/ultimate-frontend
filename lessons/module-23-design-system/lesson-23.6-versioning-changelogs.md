---
module: 23
lesson: 23.6
title: Versioning & changelogs
duration: 50 minutes
prerequisites:
  - "23.5 — Visual regression in CI"
  - "23.3 — Component API design"
  - "Basic Git knowledge (branches, commits, PRs)"
learning_objectives:
  - Apply semantic versioning (semver) rules to a component library
  - Classify changes as patch, minor, or major based on their impact on consumers
  - Describe the Changesets workflow for managing versioned releases
  - Detect breaking changes in component APIs programmatically
  - Generate changelogs that help consumers understand what changed and why
status: ready
---

# Lesson 23.6 — Versioning & changelogs

> **Atomic lesson format** — every lesson in this course follows the same four parts: **Concept**, **Style it**, **Interact**, **Mini-build**.

## 1. Concept — Telling your users what changed

### 1.1 The problem: "which version broke my app?"

A product team imports `@org/ui` version 1.4.2. It works perfectly. They run `pnpm update` and get version 1.6.0. Their build breaks because the `Button` component renamed the `type` prop to `variant`. They have 47 Button usages. Each one needs updating.

Two questions arise: (1) How were they supposed to know that `type` was renamed to `variant`? (2) Why did a breaking change happen in a minor version (1.4 → 1.6)?

The answers: a changelog should have documented the rename, and the version bump should have been a major release (1.4 → 2.0) because the prop rename is a breaking change. Proper versioning and changelogs prevent this scenario.

### 1.2 Semantic versioning for component libraries

Semantic versioning (semver) uses three numbers: **MAJOR.MINOR.PATCH**.

- **PATCH** (1.4.2 → 1.4.3): Bug fixes that do not change the API. A button's hover color was wrong and is now correct. A screen reader announcement was missing and is now present. Consumers upgrade safely with no code changes.

- **MINOR** (1.4.2 → 1.5.0): New features that do not break existing usage. A new `loading` prop is added to Button. A new `Toast` component is added to the library. Consumers who do not use the new features see no changes.

- **MAJOR** (1.4.2 → 2.0.0): Breaking changes that require consumer code modifications. A prop is renamed (`type` → `variant`). A prop type changes (`size: string` → `size: 'sm' | 'md' | 'lg'`). A component is removed. A default value changes in a way that affects existing usage.

For design systems, visual changes are tricky. If you change the border-radius of all buttons from 8px to 4px, is that a patch (bug fix), minor (visual enhancement), or major (breaking change)? The answer depends on whether consumers rely on the exact pixel values. If they do (pixel-perfect layouts, visual regression tests), it is a breaking change. If they do not, it is a minor change. Document your policy in the design system's contribution guidelines.

### 1.3 The Changesets workflow

Changesets is a tool for managing versioned releases in JavaScript packages. It works alongside Git and your CI pipeline:

1. **Developer creates a changeset.** When a PR includes a change to the design system, the developer runs `pnpm changeset` and answers: which packages changed, is it a patch/minor/major, and what is the changelog entry. This creates a Markdown file in `.changeset/` describing the change.

2. **Changesets accumulate.** Over multiple PRs, multiple changeset files accumulate in `.changeset/`. Each one describes one change.

3. **Release PR is created.** When the team is ready to release, a GitHub Action consumes all pending changesets, determines the appropriate version bump (the highest bump wins: if any changeset is `major`, the release is major), updates `package.json`, generates the changelog, and opens a "Version Packages" PR.

4. **Team reviews and merges.** The PR shows the version bump, the generated changelog, and the combined effect of all changes. After review, merging the PR triggers the npm publish.

### 1.4 Breaking change detection

Some breaking changes are detectable programmatically:

- **Removed exports.** The package's previous version exported `Button`, `Input`, `Card`. The new version does not export `Card`. This is a breaking change.
- **Changed prop types.** `Button` previously accepted `variant: string`. Now it accepts `variant: 'primary' | 'secondary'`. Code passing `variant="custom"` will now fail TypeScript checks.
- **Removed props.** `Button` previously accepted `type`. Now it does not. All usages of `type` will produce TypeScript errors.

Tools like `arethetypeswrong` and custom TypeScript comparison scripts can detect these changes by comparing the public API surface of two package versions. Adding such checks to CI prevents accidental breaking changes from being released as patch or minor versions.

### 1.5 Writing good changelog entries

A changelog entry should tell the consumer three things: **what** changed, **why** it changed, and **what they need to do** (if anything).

Bad: "Updated Button styles."
Good: "Changed Button border-radius from 8px to 4px to align with the updated brand guidelines. No code changes required — this is a visual-only change."

Bad: "Breaking: renamed prop."
Good: "BREAKING: Renamed Button `type` prop to `variant` for consistency with other components. Find and replace `type=` with `variant=` in all Button usages. A codemod is available: `npx @org/ui-codemod rename-button-type`."

The best changelog entries include migration instructions and, for major changes, a codemod (an automated code transformation tool) that updates consumer code.

### 1.6 "In Production" — versioning discipline at a design system team

A design system team served 12 product teams across a 300-person engineering organization. They released weekly: minor versions for new features and patches for bug fixes. They released quarterly: major versions for breaking changes, always accompanied by migration guides and codemods. Each major release had a 3-month deprecation period: deprecated components continued working with console warnings, giving product teams time to migrate. This cadence balanced innovation (new features weekly) with stability (breaking changes quarterly, with advance notice). The team's changelog was the most-read internal document — product teams checked it every Monday to see what was new.

### 1.7 The TypeScript angle

TypeScript's type system enables compile-time detection of breaking changes:

```typescript
// v1 API
interface ButtonPropsV1 {
    type: 'primary' | 'secondary' | 'ghost';
    size: 'sm' | 'md' | 'lg';
    children: Snippet;
}

// v2 API
interface ButtonPropsV2 {
    variant: 'primary' | 'secondary' | 'ghost' | 'danger';
    size: 'sm' | 'md' | 'lg';
    children: Snippet;
}

// Type compatibility check:
// type IsCompatible = ButtonPropsV1 extends ButtonPropsV2 ? true : false;
// This would be `false` because V1 has `type` but V2 expects `variant`
```

### 1.8 Common interview question

**Q: "How do you decide whether a change to a design system component is a patch, minor, or major version bump?"**

**Model answer:** Patch for bug fixes that do not change the API or expected behavior — fixing a broken hover state, correcting an accessibility label. Minor for additive changes — new props with default values, new components, new variants. Major for breaking changes — removing props, renaming props, changing prop types, removing components, changing default values that affect existing usage. Visual-only changes are judgment calls: if consumers have visual regression tests that would break, treat it as major. If the visual change is a correction (fixing a color that was off-spec), treat it as patch. Document the policy so the team applies it consistently.

## Deep Dive

**Pre-release versions.** Semver supports pre-release identifiers: `2.0.0-beta.1`, `2.0.0-rc.1`. Use these for major version testing: publish `2.0.0-beta.1`, let early-adopter teams test it, fix issues, publish `2.0.0-beta.2`, and eventually release `2.0.0` stable. Pre-release versions are never installed by default (`pnpm install @org/ui` installs the latest stable version, not the beta).

**Codemods for migration.** A codemod is a script that automatically transforms consumer code to work with a new API. For the `type` → `variant` rename, a codemod using `jscodeshift` or `ts-morph` would find all `<Button type=` usages and replace them with `<Button variant=`. Codemods dramatically reduce migration cost for major versions.

**Deprecation pattern.** Before removing a prop in a major version, deprecate it in a minor version. The deprecated prop continues to work but emits a console warning: "The `type` prop is deprecated. Use `variant` instead. `type` will be removed in v3.0." This gives consumers a migration window.

**Lockfile discipline.** When a product team pins `@org/ui: "^1.4.2"`, pnpm resolves this to the latest 1.x version. If the design system accidentally releases a breaking change as a minor version, the product team's build breaks on the next `pnpm install`. This is why correct semver classification is critical — incorrect version bumps can break builds across the organization.

**Connection to other lessons.** Lesson 23.3 defined the component API that versioning protects. Lesson 23.5 covered visual regression tests that validate visual changes. Lesson 23.8 covers npm publishing, which is where versions become concrete.

## Going Deeper

**Official docs to read next:**

- [semver.org](https://semver.org/) — the semantic versioning specification.
- [github.com/changesets/changesets](https://github.com/changesets/changesets) — Changesets documentation and workflow.
- [arethetypeswrong.github.io](https://arethetypeswrong.github.io/) — tool for checking package type correctness.

**Advanced pattern: API surface diffing in CI.** Run a script that extracts the public API surface (exported types, component props, function signatures) from the current code and the previous release, diffs them, and flags any changes that would constitute a breaking change. If a PR includes a breaking change and the changeset says "minor," the CI check fails.

**Challenge question (combines Lesson 23.6 + Lesson 23.3 + Lesson 23.5):** You need to rename Button's `type` prop to `variant` (a breaking change). Design a migration path that: (a) maintains backward compatibility during a transition period, (b) warns consumers about the deprecation, (c) provides a codemod for automated migration, and (d) removes the old prop in the next major version. What changesets would you create, and what version numbers would result?

## 2. Style it — PE7 applied to the changelog generator

The mini-build is a changelog generator displaying version entries. Each version section has a header with version number in `var(--text-xl)` and date in `var(--text-sm)` muted. Change entries are categorized with colored badges: `var(--color-error)` for breaking, `var(--color-brand)` for features, `var(--color-success)` for fixes. The entry descriptions use `var(--text-base)`. A form for creating new entries uses `var(--color-surface-2)` inputs with `var(--radius-md)`.

## 3. Interact — creating changelog entries and generating version bumps

The problem: semver rules are abstract until you practice classifying changes. The interactive element presents a list of simulated changes and lets the student classify each as patch, minor, or major. A `$derived` computation determines the resulting version number based on the highest classification. The student can also create custom changelog entries.

```typescript
interface ChangeEntry {
    id: string;
    description: string;
    classification: 'patch' | 'minor' | 'major';
    component: string;
    breaking: boolean;
}
```

## 4. Mini-build — changelog generator

**File:** `src/routes/modules/23-design-system/06-versioning-changelogs/+page.svelte`

This page renders an interactive changelog generator. The student classifies changes as patch, minor, or major and sees the resulting version number and formatted changelog. The tool demonstrates how individual change classifications determine the overall version bump.

### Run it

```bash
pnpm dev
```

Then open `http://localhost:5173/modules/23-design-system/06-versioning-changelogs`.

### Prove the concept

1. Review the pre-populated changes and their classifications. Note the computed version number.
2. Change a classification from "minor" to "major" and watch the version number jump from 1.x to 2.0.0.
3. Add a new changelog entry using the form and see it appear in the formatted changelog.
4. In Svelte DevTools, observe `$derived` recalculating the version number whenever classifications change.

## 5. Check your understanding

<details>
<summary><strong>Q1.</strong> A Button component gets a new `loading` prop with a default value of `false`. What version bump is this?</summary>

Minor. It is a new feature (additive change) that does not break existing usage. Consumers who do not use the `loading` prop see no changes because it defaults to `false`.
</details>

<details>
<summary><strong>Q2.</strong> The Button component's `variant` prop changes from `'primary' | 'secondary'` to `'primary' | 'secondary' | 'ghost'`. What version bump is this?</summary>

Minor. Adding a new option to a union type is additive — existing consumers using `'primary'` or `'secondary'` are unaffected. Only consumers who want the new `'ghost'` variant need to update.
</details>

<details>
<summary><strong>Q3.</strong> The Button component's default `size` changes from `'md'` to `'lg'`. What version bump is this?</summary>

Major. Consumers who relied on the default size being `'md'` (without explicitly setting `size="md"`) will see their buttons change size. This is a breaking change in behavior even though the API signature has not changed.
</details>

<details>
<summary><strong>Q4.</strong> What is a changeset, and how does it relate to the final changelog?</summary>

A changeset is a Markdown file created during development (one per PR) that describes what changed, which packages are affected, and whether it is a patch, minor, or major change. During a release, all pending changesets are combined: the highest bump level determines the version, and all descriptions are compiled into the changelog entry for that version.
</details>

<details>
<summary><strong>Q5.</strong> Why is a deprecation period important before removing a prop?</summary>

A deprecation period gives consumers time to migrate before the breaking change takes effect. During the deprecation period, the old prop still works but emits a console warning pointing to the replacement. This prevents surprise breakage — consumers can migrate at their own pace rather than being forced to update immediately when the major version drops.
</details>

## 6. Common mistakes

- **Releasing breaking changes as minor versions.** This breaks consumer builds on `pnpm install`. Always classify prop removals, prop renames, type changes, and behavior changes as major version bumps.
- **Writing vague changelog entries like "updated styles."** Consumers need to know what changed, why, and what they need to do. Specific entries save support time and build trust.
- **Not using lockfiles in consumer projects.** Without a lockfile, `pnpm install` resolves to the latest version. If a breaking change was accidentally released as minor, consumers without lockfiles get broken builds. Always commit `pnpm-lock.yaml`.
- **Skipping changesets for "small" changes.** Every change should have a changeset, even patches. The changelog is the complete record of what changed between versions. Missing entries make debugging version-specific issues difficult.

## 7. What's next

Lesson 23.7 explores multi-theme architecture — going beyond light and dark to support brand themes, white-labeling, and customer-specific overrides.
