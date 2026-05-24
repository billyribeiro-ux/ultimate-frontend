---
module: 21
exercise: 5
title: Snapshot Testing Judgment Call
difficulty: principal
estimated_time: 60
skills_tested:
  - toMatchSnapshot vs toMatchInlineSnapshot
  - when to use and avoid snapshots
  - snapshot maintenance strategy
  - test readability trade-offs
---

# Exercise 21.5 — Snapshot Testing Judgment Call

## Brief

Snapshot testing is powerful but divisive. Used well, it catches unintended changes to serialized output. Used poorly, it creates brittle tests that break on every refactor and train developers to blindly update snapshots. In this exercise, you will evaluate a series of testing scenarios, decide whether a snapshot test is appropriate for each, implement the tests you approve, and write justifications for the ones you reject.

## Requirements

1. Create `src/routes/exercises/21-vite-vitest/05/` with the following test files:
2. **Scenario A — API response transformer**: A function `transformApiResponse(raw: RawProduct): DisplayProduct` reshapes API data. Write a test in `transform.test.ts`.
   - Decision: Is a snapshot appropriate here?
3. **Scenario B — Error message catalog**: A map of error codes to user-facing messages. Write a test in `errors.test.ts`.
   - Decision: Is a snapshot appropriate here?
4. **Scenario C — Component render output**: A `<PriceTag>` component renders a formatted price with currency symbol. Write a test in `price-tag.test.ts`.
   - Decision: Is a snapshot appropriate here?
5. **Scenario D — Generated CSS class names**: A utility generates CSS class strings from variant/size props. Write a test in `classnames.test.ts`.
   - Decision: Is a snapshot appropriate here?
6. **Scenario E — Database query builder output**: A function builds a SQL query string from filter parameters. Write a test in `query-builder.test.ts`.
   - Decision: Is a snapshot appropriate here?
7. For each scenario, include a comment block at the top of the test file with your decision (APPROVE or REJECT snapshot), your reasoning (3-5 sentences), and what you would use instead if you reject.
8. Create `src/routes/exercises/21-vite-vitest/05/+page.svelte` that summarizes all five decisions in a table

## Constraints

- Minimum 5 test cases across the approved scenarios
- Use `toMatchInlineSnapshot()` for small outputs and `toMatchSnapshot()` for large ones
- Every rejection must include an alternative assertion strategy
- TypeScript strict mode for all files

## Hints (progressive)

<details>
<summary>Hint 1 (free)</summary>

Good candidates for snapshots: stable serialized output, large structures where writing individual assertions is tedious, output that changes rarely but you want to catch when it does. Bad candidates: frequently changing output, output where specific values matter more than structure, output that includes timestamps or random IDs.
</details>

<details>
<summary>Hint 2 (conceptual)</summary>

The API transformer (A) is a good snapshot candidate — the output shape is well-defined and changes should be intentional. The component render (C) is risky — internal markup changes break the snapshot but are not bugs. The SQL query builder (E) is an excellent snapshot candidate — the exact query string matters and changes should be reviewed carefully.
</details>

<details>
<summary>Hint 3 (code sketch)</summary>

```typescript
// DECISION: APPROVE snapshot
// REASONING: The transformer output is a stable contract between the API layer
// and the UI layer. Any unintended change to this shape would cause bugs in
// every component that consumes it. A snapshot catches structural drift that
// individual assertions might miss.

import { describe, it, expect } from 'vitest';
import { transformApiResponse } from './transform';

describe('transformApiResponse', () => {
  it('transforms a complete product', () => {
    const raw = { id: 1, product_name: 'Widget', price_cents: 2999, in_stock: true };
    const result = transformApiResponse(raw);
    expect(result).toMatchInlineSnapshot(`
      {
        "id": 1,
        "name": "Widget",
        "formattedPrice": "$29.99",
        "available": true,
      }
    `);
  });
});
```
</details>

## Solution

<details>
<summary>Full solution (click to reveal)</summary>

**`transform.test.ts` — APPROVE**

```typescript
/*
 * DECISION: APPROVE snapshot
 * REASONING: The transformer defines a stable contract between the API layer and
 * the UI. Any structural change is likely intentional and should be reviewed. A
 * snapshot catches field renames, missing fields, and format changes that individual
 * assertions might miss. The output is small enough for inline snapshots.
 * ALTERNATIVE IF REJECTED: Individual expect().toBe() for each field.
 */

import { describe, it, expect } from 'vitest';

interface RawProduct {
  id: number;
  product_name: string;
  price_cents: number;
  in_stock: boolean;
  category_id: number | null;
}

interface DisplayProduct {
  id: number;
  name: string;
  formattedPrice: string;
  available: boolean;
  categoryId: number | null;
}

function transformApiResponse(raw: RawProduct): DisplayProduct {
  return {
    id: raw.id,
    name: raw.product_name,
    formattedPrice: `$${(raw.price_cents / 100).toFixed(2)}`,
    available: raw.in_stock,
    categoryId: raw.category_id
  };
}

describe('transformApiResponse', () => {
  it('transforms a complete product', () => {
    const raw: RawProduct = {
      id: 1,
      product_name: 'Widget',
      price_cents: 2999,
      in_stock: true,
      category_id: 5
    };

    expect(transformApiResponse(raw)).toMatchInlineSnapshot(`
      {
        "available": true,
        "categoryId": 5,
        "formattedPrice": "$29.99",
        "id": 1,
        "name": "Widget",
      }
    `);
  });

  it('handles null category', () => {
    const raw: RawProduct = {
      id: 2,
      product_name: 'Gadget',
      price_cents: 0,
      in_stock: false,
      category_id: null
    };

    expect(transformApiResponse(raw)).toMatchInlineSnapshot(`
      {
        "available": false,
        "categoryId": null,
        "formattedPrice": "$0.00",
        "id": 2,
        "name": "Gadget",
      }
    `);
  });
});
```

**`errors.test.ts` — APPROVE**

```typescript
/*
 * DECISION: APPROVE snapshot
 * REASONING: The error catalog is a stable reference that changes infrequently.
 * When it does change, the exact wording matters — a snapshot review forces the
 * developer to read the new message. The full catalog snapshot also catches
 * accidental deletions of error codes.
 * ALTERNATIVE IF REJECTED: Individual assertions per error code.
 */

import { describe, it, expect } from 'vitest';

const ERROR_MESSAGES: Record<string, string> = {
  AUTH_EXPIRED: 'Your session has expired. Please sign in again.',
  AUTH_INVALID: 'Invalid email or password.',
  NOT_FOUND: 'The requested resource was not found.',
  RATE_LIMITED: 'Too many requests. Please wait a moment and try again.',
  SERVER_ERROR: 'Something went wrong. Please try again later.',
  VALIDATION: 'Please check your input and try again.'
};

describe('error message catalog', () => {
  it('matches the complete catalog', () => {
    expect(ERROR_MESSAGES).toMatchSnapshot();
  });

  it('has a message for every expected error code', () => {
    const expectedCodes: string[] = [
      'AUTH_EXPIRED', 'AUTH_INVALID', 'NOT_FOUND',
      'RATE_LIMITED', 'SERVER_ERROR', 'VALIDATION'
    ];

    for (const code of expectedCodes) {
      expect(ERROR_MESSAGES[code]).toBeDefined();
    }
  });
});
```

**`price-tag.test.ts` — REJECT**

```typescript
/*
 * DECISION: REJECT snapshot
 * REASONING: Component render output (HTML) changes frequently due to CSS class
 * renames, wrapper element changes, and accessibility improvements — none of which
 * are bugs. Snapshot tests on rendered HTML create noise: every refactor requires
 * a snapshot update, and developers learn to blindly approve updates. This erodes
 * the value of the entire snapshot suite.
 * ALTERNATIVE: Assert specific behaviors — the formatted text content, the
 * aria-label, the data-testid — not the full HTML structure.
 */

import { describe, it, expect } from 'vitest';

interface PriceTagProps {
  amount: number;
  currency: string;
  locale: string;
}

function formatPrice(props: PriceTagProps): string {
  return new Intl.NumberFormat(props.locale, {
    style: 'currency',
    currency: props.currency
  }).format(props.amount / 100);
}

describe('PriceTag behavior', () => {
  it('formats USD correctly', () => {
    const result: string = formatPrice({ amount: 2999, currency: 'USD', locale: 'en-US' });
    expect(result).toBe('$29.99');
  });

  it('formats EUR correctly', () => {
    const result: string = formatPrice({ amount: 1550, currency: 'EUR', locale: 'de-DE' });
    expect(result).toContain('15,50');
    expect(result).toContain('€');
  });

  it('handles zero', () => {
    const result: string = formatPrice({ amount: 0, currency: 'USD', locale: 'en-US' });
    expect(result).toBe('$0.00');
  });
});
```

**`classnames.test.ts` — REJECT**

```typescript
/*
 * DECISION: REJECT snapshot
 * REASONING: CSS class names are implementation details. A snapshot test on class
 * strings couples tests to naming conventions rather than behavior. If you rename
 * "btn--primary" to "button--primary", the snapshot breaks but nothing is wrong.
 * The test should verify that the right classes ARE applied (via explicit assertions),
 * not the exact string shape.
 * ALTERNATIVE: Use toBe() or toContain() for specific class names that matter.
 */

import { describe, it, expect } from 'vitest';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

function buildClassName(variant: Variant, size: Size, disabled: boolean): string {
  const classes: string[] = ['btn', `btn--${variant}`, `btn--${size}`];
  if (disabled) classes.push('btn--disabled');
  return classes.join(' ');
}

describe('buildClassName', () => {
  it('includes the variant class', () => {
    const result: string = buildClassName('primary', 'md', false);
    expect(result).toContain('btn--primary');
  });

  it('includes the size class', () => {
    const result: string = buildClassName('ghost', 'lg', false);
    expect(result).toContain('btn--lg');
  });

  it('adds disabled class when disabled', () => {
    const result: string = buildClassName('secondary', 'sm', true);
    expect(result).toContain('btn--disabled');
  });

  it('omits disabled class when not disabled', () => {
    const result: string = buildClassName('danger', 'md', false);
    expect(result).not.toContain('btn--disabled');
  });

  it('always includes the base btn class', () => {
    const result: string = buildClassName('primary', 'sm', false);
    expect(result).toMatch(/\bbtn\b/);
  });
});
```

**`query-builder.test.ts` — APPROVE**

```typescript
/*
 * DECISION: APPROVE snapshot
 * REASONING: SQL query strings are a critical contract with the database. Any
 * unintended change to the query structure — missing WHERE clause, wrong JOIN,
 * changed column name — is a potential data bug or security issue. Snapshot tests
 * force the developer to explicitly review query changes. The exact string matters.
 * ALTERNATIVE IF REJECTED: Individual string assertions with toContain().
 */

import { describe, it, expect } from 'vitest';

interface QueryFilter {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  search?: string;
}

function buildProductQuery(filters: QueryFilter): string {
  const conditions: string[] = [];
  const parts: string[] = ['SELECT p.id, p.name, p.price, p.stock'];
  parts.push('FROM products p');

  if (filters.category) {
    parts.push('JOIN categories c ON c.id = p.category_id');
    conditions.push(`c.slug = '${filters.category}'`);
  }

  if (filters.minPrice !== undefined) {
    conditions.push(`p.price >= ${filters.minPrice}`);
  }

  if (filters.maxPrice !== undefined) {
    conditions.push(`p.price <= ${filters.maxPrice}`);
  }

  if (filters.inStock !== undefined) {
    conditions.push(`p.stock > 0`);
  }

  if (filters.search) {
    conditions.push(`p.name ILIKE '%${filters.search}%'`);
  }

  if (conditions.length > 0) {
    parts.push('WHERE ' + conditions.join(' AND '));
  }

  parts.push('ORDER BY p.name ASC');
  parts.push('LIMIT 50');

  return parts.join('\n');
}

describe('buildProductQuery', () => {
  it('builds a basic query with no filters', () => {
    expect(buildProductQuery({})).toMatchInlineSnapshot(`
      "SELECT p.id, p.name, p.price, p.stock
      FROM products p
      ORDER BY p.name ASC
      LIMIT 50"
    `);
  });

  it('builds a query with category filter', () => {
    expect(buildProductQuery({ category: 'electronics' })).toMatchSnapshot();
  });

  it('builds a query with price range', () => {
    expect(buildProductQuery({ minPrice: 10, maxPrice: 100 })).toMatchSnapshot();
  });

  it('builds a complex query with all filters', () => {
    expect(buildProductQuery({
      category: 'tools',
      minPrice: 5,
      maxPrice: 200,
      inStock: true,
      search: 'hammer'
    })).toMatchSnapshot();
  });
});
```

**`+page.svelte`**

```svelte
<script lang="ts">
  interface Decision {
    scenario: string;
    fileName: string;
    verdict: 'approve' | 'reject';
    reasoning: string;
    alternative: string;
  }

  const decisions: Decision[] = [
    {
      scenario: 'A — API Response Transformer',
      fileName: 'transform.test.ts',
      verdict: 'approve',
      reasoning: 'Stable contract between API and UI. Structural drift should be caught.',
      alternative: 'Individual field assertions'
    },
    {
      scenario: 'B — Error Message Catalog',
      fileName: 'errors.test.ts',
      verdict: 'approve',
      reasoning: 'Infrequent changes, exact wording matters. Catches accidental deletions.',
      alternative: 'Per-code assertions'
    },
    {
      scenario: 'C — Component Render Output',
      fileName: 'price-tag.test.ts',
      verdict: 'reject',
      reasoning: 'HTML changes frequently (classes, wrappers). Not bugs. Creates noise.',
      alternative: 'Assert text content, aria-labels, and data-testid attributes'
    },
    {
      scenario: 'D — Generated CSS Class Names',
      fileName: 'classnames.test.ts',
      verdict: 'reject',
      reasoning: 'Implementation detail. Renaming classes breaks snapshots but is not a bug.',
      alternative: 'toContain() for specific class names'
    },
    {
      scenario: 'E — Database Query Builder',
      fileName: 'query-builder.test.ts',
      verdict: 'approve',
      reasoning: 'Exact SQL matters. Unintended changes cause data bugs or security issues.',
      alternative: 'toContain() for query fragments'
    }
  ];
</script>

<section class="page stack">
  <h1>Snapshot Testing Decisions</h1>
  <table class="decision-table">
    <thead>
      <tr>
        <th>Scenario</th>
        <th>Verdict</th>
        <th>Reasoning</th>
      </tr>
    </thead>
    <tbody>
      {#each decisions as decision (decision.scenario)}
        <tr>
          <td>{decision.scenario}</td>
          <td>
            <span class="verdict verdict--{decision.verdict}">
              {decision.verdict.toUpperCase()}
            </span>
          </td>
          <td>{decision.reasoning}</td>
        </tr>
      {/each}
    </tbody>
  </table>
</section>

<style>
  .decision-table {
    inline-size: 100%;
    border-collapse: collapse;
    font-size: var(--text-sm);
  }

  th, td {
    padding: var(--space-sm);
    text-align: start;
    border-block-end: 1px solid var(--color-border);
  }

  th { background: var(--color-surface-2); font-weight: 700; }

  .verdict {
    font-weight: 700;
    font-size: var(--text-xs);
    padding: 0.2em 0.5em;
    border-radius: var(--radius-full);
    text-transform: uppercase;
  }

  .verdict--approve {
    background: oklch(85% 0.1 145);
    color: oklch(30% 0.1 145);
  }

  .verdict--reject {
    background: oklch(85% 0.1 25);
    color: oklch(30% 0.1 25);
  }
</style>
```

### Explanation

The judgment call is the most important skill: snapshots are excellent for stable data contracts (API transforms, error catalogs, SQL queries) where the exact output matters and changes should be reviewed explicitly. They are poor for implementation details (CSS classes, HTML structure) where refactoring is expected and not a bug. The anti-pattern is "snapshot everything" — it creates a test suite where developers learn to `--update` without reading, destroying the safety net. The principal-level skill is knowing WHEN each tool is appropriate, not just how to use it.
</details>
