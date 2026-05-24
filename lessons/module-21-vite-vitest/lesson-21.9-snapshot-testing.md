---
module: 21
lesson: 21.9
title: Snapshot and inline snapshot testing
duration: 45 minutes
prerequisites:
  - "21.7 — Vitest fundamentals"
  - "21.8 — Mocking and spying"
  - "20.4 — Component testing with @testing-library/svelte"
learning_objectives:
  - Use toMatchSnapshot() to capture and compare serialized output across test runs
  - Use toMatchInlineSnapshot() to store snapshots directly in the test file
  - Identify when snapshot testing helps and when it becomes a maintenance burden
  - Update snapshots safely using vitest --update
  - Test Svelte component rendered output with snapshots while avoiding brittle tests
status: ready
---

# Lesson 21.9 — Snapshot and inline snapshot testing

> **Atomic lesson format** — every lesson in this course follows the same four parts: **Concept**, **Style it**, **Interact**, **Mini-build**.

## 1. Concept — Freezing output to detect change

### 1.1 The problem: changes you did not intend

You refactor a utility function. Tests pass. You deploy. Users report that the product page shows prices without decimal places — "$42" instead of "$42.00". Your refactoring changed the output format, but no test caught it because no test asserted on the exact output format.

**Snapshot testing** solves this by capturing the exact output of a function or component and saving it. On future runs, the test compares the current output to the saved snapshot. If anything changes — even a single character — the test fails. You then decide: was this change intentional (update the snapshot) or a bug (fix the code)?

### 1.2 toMatchSnapshot() — file-based snapshots

The simplest form of snapshot testing:

```typescript
import { describe, it, expect } from 'vitest';

describe('formatProductCard', () => {
    it('renders correct HTML structure', () => {
        const html: string = formatProductCard({
            name: 'Widget',
            price: 42,
            inStock: true
        });

        expect(html).toMatchSnapshot();
    });
});
```

On the first run, Vitest creates a `__snapshots__` directory next to the test file and writes the snapshot to a `.snap` file:

```
// Vitest Snapshot v1

exports[`formatProductCard > renders correct HTML structure 1`] = `
"<div class="product-card">
  <h3>Widget</h3>
  <p class="price">$42.00</p>
  <span class="badge badge--in-stock">In Stock</span>
</div>"
`;
```

On subsequent runs, Vitest compares the current output to this saved snapshot. If they match, the test passes. If they differ, the test fails and shows a diff.

### 1.3 toMatchInlineSnapshot() — snapshots in the test file

Instead of saving snapshots to a separate file, inline snapshots store the expected output directly in the test:

```typescript
it('formats currency', () => {
    expect(formatCurrency(42.5, 'USD')).toMatchInlineSnapshot(`"$42.50"`);
});
```

On the first run (when the inline snapshot is empty), Vitest **writes the output into the test file itself**. This is a remarkable feature: Vitest edits your source code to insert the snapshot value. On subsequent runs, it compares the current output to the inline value.

Inline snapshots have two advantages: (1) you see the expected output right next to the assertion, making the test easier to read, and (2) you do not need to navigate to a separate `.snap` file. They work best for small outputs (single values, short strings). For large HTML structures, file-based snapshots are more practical.

### 1.4 When snapshots help

Snapshot testing excels at:

- **Detecting unintended output changes.** Any change to the serialized output — even a formatting change — triggers a failure. This catches regressions that assertion-based tests might miss because they only check specific properties.
- **Testing serialized structures.** HTML output, JSON responses, AST nodes, and formatted strings are natural fits because they have well-defined serialized forms.
- **Quick coverage of complex output.** Writing assertions for every property of a large object is tedious. A snapshot captures the entire structure in one line.

### 1.5 When snapshots become maintenance burdens

Snapshot testing fails when:

- **The output changes frequently.** If the component's HTML changes on every refactor, snapshot tests break constantly. Developers update snapshots reflexively without reviewing the diff, which means the test provides no value — it is always up-to-date but never catches bugs.
- **The snapshot is too large.** A 500-line HTML snapshot is unreviable. No one will read a 500-line diff to verify that a change is intentional. Large snapshots pass in reviews without scrutiny.
- **The output includes dynamic values.** Timestamps, random IDs, and order-dependent object keys cause snapshots to fail on every run. You must sanitize dynamic values before snapshotting.
- **The snapshot captures implementation details.** Snapshotting the full DOM tree including class hashes, data attributes, and internal wrapper elements makes the test brittle. It breaks on any structural change, even if the user-visible output is unchanged.

### 1.6 Updating snapshots

When a snapshot test fails because you intentionally changed the output, update the snapshots:

```bash
pnpm vitest --update     # or -u flag
pnpm vitest run --update # single-run mode
```

This overwrites all outdated snapshots with the current output. **Always review the diff before updating.** If you update blindly, you may accept a bug as the new "expected" output. In CI, never use `--update` — snapshots should only be updated locally by a developer who reviews the changes.

### 1.7 Testing Svelte component rendered output

Combine `@testing-library/svelte` with snapshots to test component rendering:

```typescript
import { render } from '@testing-library/svelte';
import { describe, it, expect } from 'vitest';
import Card from './Card.svelte';

describe('Card component', () => {
    it('renders with title and description', () => {
        const { container } = render(Card, {
            props: { title: 'Hello', description: 'World' }
        });

        expect(container.innerHTML).toMatchSnapshot();
    });
});
```

A better approach is to snapshot only the meaningful content, not the entire container:

```typescript
it('renders the title', () => {
    const { getByRole } = render(Card, {
        props: { title: 'Hello', description: 'World' }
    });

    expect(getByRole('heading').textContent).toMatchInlineSnapshot(`"Hello"`);
});
```

This is less brittle because it captures the user-visible text, not the internal HTML structure.

### 1.8 "In production" — the snapshot that caught a localization bug

A team used inline snapshots for their currency formatting utility. After upgrading the `Intl` polyfill, a snapshot test failed:

```diff
- expect(formatCurrency(1234.5, 'de-DE')).toMatchInlineSnapshot(`"1.234,50 €"`);
+ Received: "1.234,50 €" // non-breaking space changed to regular space
```

The diff was subtle — a non-breaking space (U+00A0) had changed to a regular space (U+0020). Without the snapshot, this would have been invisible in manual testing and would have broken the layout of price tags in the German locale (non-breaking spaces prevent prices from wrapping across lines). The snapshot caught a single-character change that no handwritten assertion would have tested.

### 1.9 The TypeScript angle

`toMatchSnapshot()` and `toMatchInlineSnapshot()` work with any serializable value. TypeScript does not constrain what you pass — `expect(anyValue).toMatchSnapshot()` always type-checks. However, you can use `toMatchSnapshot<Type>()` (with Vitest's extended types) to document the expected shape. More practically, type your test data with explicit interfaces to ensure the snapshot captures a known shape:

```typescript
const productData: Product = {
    id: '1',
    name: 'Widget',
    price: 42
};

expect(renderProduct(productData)).toMatchSnapshot();
```

If `Product` gains a new required property, this test fails at the TypeScript level (missing property) before it ever runs, catching the problem earlier.

### 1.10 Common interview question

**Q: "When would you use snapshot testing and when would you use explicit assertions? What are the risks of over-relying on snapshots?"**

**Model answer:** I use snapshot testing for serialized output that is hard to assert on property by property — HTML structures, formatted strings, JSON responses, and AST nodes. Snapshots are fast to write and catch any unintended change. I use explicit assertions (`toBe`, `toEqual`) when I care about specific properties or behaviors, not the entire output — for example, testing that a function returns the correct discount percentage. The risk of over-relying on snapshots is that they become maintenance noise: developers update them reflexively without reviewing the diff, which means the test passes even when the change is a bug. Large snapshots (>50 lines) are particularly dangerous because no one reads a 500-line diff carefully. The best practice is to keep snapshots small (prefer inline snapshots for short values) and use explicit assertions for critical behavior.

## Deep Dive

**How snapshot serialization works.** Vitest uses `pretty-format` (the same library Jest uses) to serialize values into human-readable strings. Objects are serialized with indentation, arrays show each element on its own line, and strings are quoted. Custom serializers can be registered via `test.snapshotSerializers` in the config — useful for stripping dynamic attributes (like Svelte's `svelte-xxxxx` class hashes) before comparing:

```typescript
// vitest.config.ts
test: {
    snapshotSerializers: ['./tests/serializers/strip-svelte-hash.ts']
}
```

A custom serializer implements `serialize(val)` and `test(val)` methods. The `test` method returns `true` if this serializer handles the value; the `serialize` method returns the string representation.

**Snapshot format and git.** File-based snapshots (`.snap` files) should be committed to git. They are part of the test suite and must be reviewed in PRs like any other test change. A PR that updates 20 snapshots deserves the same scrutiny as a PR that changes 20 assertions. If snapshots are updated without review, they provide no regression protection.

**Property matchers.** For objects that contain dynamic values, use property matchers to replace dynamic parts with type checks:

```typescript
expect(user).toMatchSnapshot({
    id: expect.any(String),
    createdAt: expect.any(Date),
    name: 'Ada' // exact match
});
```

This snapshot expects `name` to be exactly `'Ada'`, but allows `id` and `createdAt` to be any string and any date. The snapshot file stores the matchers, not the dynamic values.

**Snapshot testing vs visual regression testing.** Snapshots test the serialized HTML/text output — the DOM structure. Visual regression testing (Lesson 20.9) captures screenshots and compares pixel-by-pixel. Snapshots catch structural changes (missing elements, changed text). Visual regression catches visual changes (wrong colors, broken layouts, overlapping elements). They are complementary, not alternatives.

**Connection to other lessons.** Lesson 20.9 covered visual regression testing with screenshots. Lesson 20.4 covered component testing with `@testing-library/svelte`. This lesson adds snapshot techniques to the testing toolkit for the module project's comprehensive test suite.

## Going Deeper

**Official docs to read next:**

- [vitest.dev/guide/snapshot](https://vitest.dev/guide/snapshot) — Vitest's snapshot testing guide.
- [vitest.dev/api/expect#tomatchsnapshot](https://vitest.dev/api/expect#tomatchsnapshot) — API reference for snapshot matchers.
- [vitest.dev/config/#snapshotserializers](https://vitest.dev/config/) — configuring custom snapshot serializers.

**Advanced pattern: snapshot-driven development.** Some teams use inline snapshots as a development tool. They write the test first with an empty `toMatchInlineSnapshot()`, run it once to populate the snapshot, review the output, and commit. This is faster than writing assertions manually for complex output, and the snapshot serves as executable documentation of the expected output.

**Challenge question (combines Lesson 21.9 + Lesson 21.8 + Lesson 20.4):** You are testing a `DataTable` Svelte component that renders rows from a prop. The component adds row IDs and timestamps to the DOM as data attributes. Write a snapshot test strategy that captures the meaningful structure (headers, row content, column count) without breaking on dynamic attributes. Describe which serializer or matcher approach you would use.

## 2. Style it — PE7 applied to the snapshot viewer

The mini-build is a snapshot comparison viewer. The "expected" panel uses `var(--color-surface-2)` background. The "received" panel uses `var(--color-surface)`. Diff highlights use `var(--color-success)` background for additions and `var(--color-error)` background for deletions. Code text uses monospace `var(--text-xs)`.

## 3. Interact — comparing snapshots side by side

The problem: understanding snapshot diffs requires seeing them in context.

```typescript
interface SnapshotComparison {
    testName: string;
    expected: string;
    received: string;
    isMatch: boolean;
}
```

The interactive element shows two code panels side by side. Students can edit the "received" output and see the diff highlight in real time, demonstrating how snapshot comparison works.

## 4. Mini-build — Snapshot comparison viewer

**File:** `src/routes/modules/21-vite-vitest/09-snapshot-testing/+page.svelte`

This page shows a snapshot comparison interface. Students see the "expected" snapshot, can modify the "received" output, and see differences highlighted.

### Run it

```bash
pnpm dev
```

Then open `http://localhost:5173/modules/21-vite-vitest/09-snapshot-testing`.

### Prove the concept

1. Create a snapshot test in your project and run it once to create the snapshot file.
2. Check the `__snapshots__` directory for the `.snap` file.
3. Change the code that generates the output, re-run the test, and see the diff in the terminal.
4. Run `pnpm vitest --update` to accept the new snapshot.

## 5. Check your understanding

<details>
<summary><strong>Q1.</strong> What is the difference between file-based and inline snapshots?</summary>

File-based snapshots (`toMatchSnapshot()`) save the expected output in a separate `.snap` file in a `__snapshots__` directory. Inline snapshots (`toMatchInlineSnapshot()`) store the expected output directly in the test file as a string argument. Inline snapshots are easier to read (the expected value is right next to the assertion) but work best for small outputs. File-based snapshots handle large outputs better.
</details>

<details>
<summary><strong>Q2.</strong> Why should you never run vitest --update in CI?</summary>

`--update` overwrites outdated snapshots with the current output without human review. If the output changed because of a bug, `--update` would accept the bug as the new expected output. Snapshots should only be updated locally by a developer who reviews the diff to confirm the change is intentional.
</details>

<details>
<summary><strong>Q3.</strong> When does snapshot testing become a maintenance burden?</summary>

When the output changes frequently (every refactor breaks the snapshot), when snapshots are too large to review (500+ lines), when they include dynamic values (timestamps, random IDs), or when they capture implementation details (class name hashes, internal wrapper elements). In these cases, developers update snapshots reflexively without review, which eliminates the test's regression protection value.
</details>

<details>
<summary><strong>Q4.</strong> How do property matchers solve the dynamic value problem in snapshots?</summary>

Property matchers like `expect.any(String)` replace specific fields in the snapshot with type checks instead of exact values. The snapshot verifies that the field exists and has the correct type without asserting on its exact value. This prevents snapshots from failing on dynamic values like timestamps and IDs while still capturing the rest of the structure.
</details>

<details>
<summary><strong>Q5.</strong> Why is snapshotting container.innerHTML less ideal than snapshotting specific element text?</summary>

`container.innerHTML` captures the entire DOM tree including internal wrapper elements, class name hashes, data attributes, and structural details that are implementation concerns. Changes to any of these break the snapshot even when the user-visible output is unchanged. Snapshotting specific elements (like heading text or button labels) captures what users actually see and survives structural refactors.
</details>

## 6. Common mistakes

- **Committing snapshot updates without reviewing the diff.** Snapshot updates should be reviewed with the same scrutiny as code changes. If a snapshot changed, ask: was this intentional? If yes, update and commit. If no, fix the bug.
- **Snapshotting entire component trees.** Large snapshots are unreviable. Prefer targeted snapshots of specific elements or inline snapshots of small values.
- **Not sanitizing dynamic values.** Timestamps, random IDs, and platform-specific strings cause snapshot failures on every run. Use property matchers or custom serializers to strip them.
- **Using snapshots as the only assertion.** Snapshots catch output changes but do not test behavior. Combine them with explicit assertions: snapshot the output structure, assert the behavior separately.

## 7. What's next

Lesson 21.10 introduces the Svelte Playground — the browser-based REPL at svelte.dev/playground and how to build a minimal in-app playground using the `svelte/compiler` API.
