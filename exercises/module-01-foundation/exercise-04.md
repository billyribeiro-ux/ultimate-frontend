---
module: 1
exercise: 4
title: Fluid Pricing Table
difficulty: expert
estimated_time: 45
skills_tested:
  - clamp() fluid values
  - OKLCH color system
  - CSS Grid layout
  - TypeScript generics
  - mobile-first responsive design
---

# Exercise 1.4 — Fluid Pricing Table

## Brief

Build a pricing table component that renders 3 tiers from typed data. The table must be fully fluid (no breakpoints for the card sizing — only for the column count), use OKLCH-based color personalities per tier, and accept its data through a generic typed prop structure.

## Requirements

1. Create `src/routes/exercises/01-foundation/04/+page.svelte`
2. Define a generic interface `PricingTier<T extends string>` with: `id: T`, `name: string`, `price: number`, `currency: string`, `period: 'month' | 'year'`, `features: string[]`, `highlighted: boolean`
3. Create an array of 3 tiers: Basic, Pro (highlighted), Enterprise
4. Render as a CSS Grid — 1 column on mobile, 3 columns at `min-width: 768px`
5. The highlighted tier must have a distinct OKLCH color personality (different hue)
6. All typography must use `clamp()` via the PE7 fluid tokens
7. Each tier card shows: name, price with currency symbol, period, feature list with checkmarks, and a CTA button
8. The price number must be visually dominant (largest text on the card)
9. Feature list items must use a CSS `::before` pseudo-element for the checkmark (no emoji, no SVG)
10. The entire layout must be usable at 320px without overflow

## Constraints

- No flexbox for the main grid layout (CSS Grid only)
- No hardcoded pixel font sizes
- No media queries except one for column count
- Maximum one component file (everything in the page)
- TypeScript strict — no `any`, no `as` casts

## Hints (progressive)

<details>
<summary>Hint 1 (free)</summary>

Define the generic interface so the `id` field is constrained to a union of literal strings. Then your array can be typed as `PricingTier<'basic' | 'pro' | 'enterprise'>[]`. Use a conditional class on the highlighted card.
</details>

<details>
<summary>Hint 2 (conceptual)</summary>

For the color personality, override `--color-brand` on the highlighted card using a scoped CSS custom property. Set it to a different OKLCH hue (e.g., `oklch(65% 0.22 145)` for green). The `::before` checkmark can use `content: '✓'` with appropriate font styling and color.
</details>

<details>
<summary>Hint 3 (code sketch)</summary>

```svelte
<script lang="ts">
  interface PricingTier<T extends string> {
    id: T;
    name: string;
    price: number;
    currency: string;
    period: 'month' | 'year';
    features: string[];
    highlighted: boolean;
  }

  type TierId = 'basic' | 'pro' | 'enterprise';
  const tiers: PricingTier<TierId>[] = [ /* ... */ ];
</script>

<div class="pricing-grid">
  {#each tiers as tier}
    <article class="tier" class:highlighted={tier.highlighted}>
      <!-- name, price, features, button -->
    </article>
  {/each}
</div>

<style>
  .pricing-grid { display: grid; gap: var(--space-lg); }
  @media (min-width: 768px) { .pricing-grid { grid-template-columns: repeat(3, 1fr); } }
  .highlighted { --color-brand: oklch(65% 0.22 145); }
</style>
```
</details>

## Solution

<details>
<summary>Full solution (click to reveal)</summary>

```svelte
<script lang="ts">
  interface PricingTier<T extends string> {
    id: T;
    name: string;
    price: number;
    currency: string;
    period: 'month' | 'year';
    features: string[];
    highlighted: boolean;
  }

  type TierId = 'basic' | 'pro' | 'enterprise';

  const tiers: PricingTier<TierId>[] = [
    {
      id: 'basic',
      name: 'Basic',
      price: 9,
      currency: '$',
      period: 'month',
      features: ['5 projects', 'Basic analytics', 'Email support'],
      highlighted: false
    },
    {
      id: 'pro',
      name: 'Pro',
      price: 29,
      currency: '$',
      period: 'month',
      features: ['Unlimited projects', 'Advanced analytics', 'Priority support', 'Custom domains', 'API access'],
      highlighted: true
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: 99,
      currency: '$',
      period: 'month',
      features: ['Everything in Pro', 'SSO', 'Dedicated account manager', 'SLA guarantee', '24/7 phone support', 'Custom integrations'],
      highlighted: false
    }
  ];
</script>

<main class="page">
  <h1>Choose Your Plan</h1>
  <div class="pricing-grid">
    {#each tiers as tier}
      <article class="tier" class:highlighted={tier.highlighted}>
        {#if tier.highlighted}
          <span class="badge">Most Popular</span>
        {/if}
        <h2 class="tier-name">{tier.name}</h2>
        <div class="price">
          <span class="currency">{tier.currency}</span>
          <span class="amount">{tier.price}</span>
          <span class="period">/{tier.period}</span>
        </div>
        <ul class="features">
          {#each tier.features as feature}
            <li class="feature">{feature}</li>
          {/each}
        </ul>
        <button class="cta">
          {tier.highlighted ? 'Start Free Trial' : 'Get Started'}
        </button>
      </article>
    {/each}
  </div>
</main>

<style>
  .page {
    max-inline-size: var(--content-max);
    margin-inline: auto;
    padding: var(--space-xl) var(--space-md);
    text-align: center;
  }

  h1 {
    font-size: var(--text-2xl);
    margin-block-end: var(--space-xl);
  }

  .pricing-grid {
    display: grid;
    gap: var(--space-lg);
    align-items: start;
  }

  @media (min-width: 768px) {
    .pricing-grid {
      grid-template-columns: repeat(3, 1fr);
    }
  }

  .tier {
    position: relative;
    background: var(--color-surface-2);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-lg);
    padding: var(--space-xl) var(--space-lg);
    display: grid;
    gap: var(--space-md);
    text-align: start;
  }

  .highlighted {
    --tier-accent: oklch(65% 0.22 145);
    border-color: var(--tier-accent);
    border-width: 2px;
    box-shadow: var(--shadow-lg);
  }

  .badge {
    position: absolute;
    inset-block-start: calc(-1 * var(--space-sm));
    inset-inline-start: 50%;
    translate: -50% 0;
    background: var(--tier-accent, var(--color-brand));
    color: oklch(100% 0 0);
    font-size: var(--text-xs);
    font-weight: 700;
    padding: var(--space-xs) var(--space-sm);
    border-radius: var(--radius-full);
    white-space: nowrap;
  }

  .tier-name {
    font-size: var(--text-lg);
    color: var(--color-text);
  }

  .price {
    display: flex;
    align-items: baseline;
    gap: 0.1em;
  }

  .currency {
    font-size: var(--text-lg);
    color: var(--color-text-muted);
  }

  .amount {
    font-size: var(--text-hero);
    font-weight: 800;
    line-height: 1;
    color: var(--color-text);
  }

  .period {
    font-size: var(--text-sm);
    color: var(--color-text-muted);
  }

  .features {
    list-style: none;
    padding: 0;
    display: grid;
    gap: var(--space-xs);
  }

  .feature {
    font-size: var(--text-sm);
    color: var(--color-text);
    padding-inline-start: 1.5em;
    position: relative;
  }

  .feature::before {
    content: '\2713';
    position: absolute;
    inset-inline-start: 0;
    color: var(--tier-accent, var(--color-success));
    font-weight: 700;
  }

  .cta {
    padding: var(--space-sm) var(--space-md);
    background: var(--tier-accent, var(--color-brand));
    color: oklch(100% 0 0);
    font-weight: 600;
    font-size: var(--text-base);
    border-radius: var(--radius-md);
    transition: background var(--dur-fast) var(--ease-out);
    cursor: pointer;
  }

  .cta:hover {
    background: oklch(55% 0.18 145);
  }

  .tier:not(.highlighted) .cta:hover {
    background: var(--color-brand-dim);
  }
</style>
```

### Explanation

This exercise combines nearly every Module 1 concept. The generic interface `PricingTier<T>` constrains the `id` field to a known set of literal types, preventing typos and enabling discriminated unions if needed later. The CSS Grid layout uses a single breakpoint for column count, while all internal spacing and typography remains fully fluid via `clamp()`-based tokens. The highlighted card demonstrates CSS custom property scoping — by setting `--tier-accent` only on `.highlighted`, child elements can reference it with a fallback for non-highlighted cards. The `::before` pseudo-element approach for checkmarks is more maintainable than inline SVGs and requires zero JavaScript.
</details>
