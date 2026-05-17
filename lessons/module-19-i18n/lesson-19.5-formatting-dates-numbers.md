---
module: 19
lesson: 19.5
title: Formatting dates, numbers, and currencies
duration: 50 minutes
prerequisites:
  - "19.4 — Locale routing strategies"
  - "TypeScript type narrowing"
learning_objectives:
  - Use Intl.DateTimeFormat to render dates in locale-appropriate formats with full type safety
  - Use Intl.NumberFormat to format numbers, currencies, and percentages for any locale
  - Use Intl.RelativeTimeFormat to display human-readable relative times like "3 days ago"
  - Build reusable Svelte components that accept a locale prop and format content accordingly
  - Explain why manual date/number formatting fails for international audiences
status: ready
---

# Lesson 19.5 — Formatting dates, numbers, and currencies

> **Atomic lesson format** — every lesson in this course follows the same four parts: **Concept**, **Style it**, **Interact**, **Mini-build**.

## 1. Concept — The Intl API: your browser already speaks every language

### 1.1 The problem: formatting is not just about language

You build a pricing page that shows "$49.99/month." For a Brazilian user, this should be "R$ 49,99/mês." Notice four things changed: the currency symbol ($ to R$), the decimal separator (period to comma), the grouping separator (comma to period in larger numbers), and the word for "month." If you handle all four with string manipulation, you write fragile code that breaks when you add a new locale.

Dates are worse. "05/17/2026" means May 17 in the US, but a European reader expects day-first: "17/05/2026." Japan uses year-first: "2026/05/17." Some locales spell out the month: "17 mai 2026" (French). Some use non-Gregorian calendars: the Islamic calendar, the Hebrew calendar, the Japanese imperial calendar. Handling all of these manually is impossible.

### 1.2 How the Intl API solves it

The JavaScript `Intl` namespace provides locale-aware formatting built into every modern browser. No library needed, no bundle cost, no runtime download. The three formatters you will use most:

**`Intl.DateTimeFormat`** formats dates and times. You pass a locale and options describing which parts to include:

```typescript
const formatter = new Intl.DateTimeFormat('pt-BR', {
  year: 'numeric',
  month: 'long',
  day: 'numeric'
});
formatter.format(new Date(2026, 4, 17)); // "17 de maio de 2026"
```

**`Intl.NumberFormat`** formats numbers, currencies, and percentages:

```typescript
const currency = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL'
});
currency.format(49.99); // "R$ 49,99"

const percent = new Intl.NumberFormat('en', { style: 'percent' });
percent.format(0.15); // "15%"
```

**`Intl.RelativeTimeFormat`** formats relative times like "3 days ago" or "in 2 hours":

```typescript
const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
rtf.format(-1, 'day');  // "yesterday"
rtf.format(-3, 'day');  // "3 days ago"
rtf.format(2, 'hour');  // "in 2 hours"
```

### 1.3 Caching formatters for performance

Creating an `Intl.DateTimeFormat` instance is moderately expensive because the browser must look up locale data and compile the format pattern. If you format dates in an `{#each}` loop rendering 100 items, creating 100 formatter instances wastes time.

The solution is to create the formatter once and reuse it:

```typescript
let locale: string = $state('en');

let dateFormatter: Intl.DateTimeFormat = $derived(
  new Intl.DateTimeFormat(locale, { dateStyle: 'long' })
);

// In the template, reuse the single instance:
// {dateFormatter.format(item.createdAt)}
```

Because `dateFormatter` is `$derived`, it only recreates when `locale` changes — not on every render.

### 1.4 Building reusable formatting components

Rather than repeating `Intl.DateTimeFormat` calls throughout your application, build small, focused components:

```svelte
<!-- FormattedDate.svelte -->
<script lang="ts">
  let { date, locale, options }: {
    date: Date;
    locale: string;
    options?: Intl.DateTimeFormatOptions;
  } = $props();

  let formatted: string = $derived(
    new Intl.DateTimeFormat(locale, options).format(date)
  );
</script>

<time datetime={date.toISOString()}>{formatted}</time>
```

The `<time>` element provides semantic HTML and machine-readable dates for search engines and assistive technology.

### 1.5 Edge cases and pitfalls

Time zones are the most common source of formatting bugs. `new Date('2026-05-17')` creates a date at midnight UTC, which is "May 16" in US time zones. Always pass dates as UTC timestamps or use `timeZone: 'UTC'` in the formatter options when the date has no time component.

Currency formatting requires knowing both the locale and the currency code. A Brazilian user viewing a US-priced product should see "US$ 49.99" (locale `pt-BR`, currency `USD`), not "R$ 49.99." The locale controls the formatting (separators, symbol position), and the currency code controls the symbol and precision.

### Deep Dive — Building a FormattedNumber component with unit support

The `Intl.NumberFormat` API supports a `unit` style (since ES2020) that formats values with unit labels:

```typescript
new Intl.NumberFormat('en', { style: 'unit', unit: 'kilometer' }).format(42);
// "42 km"

new Intl.NumberFormat('de', { style: 'unit', unit: 'liter', unitDisplay: 'long' }).format(3.5);
// "3,5 Liter"
```

This is invaluable for applications that display measurements, data sizes, or scientific values. The `unitDisplay` option controls whether to show the short form ("km"), narrow form ("km"), or long form ("kilometers").

A reusable `FormattedNumber` component can handle all number formatting needs:

```svelte
<script lang="ts">
  let { value, locale, style = 'decimal', currency, unit, ...rest }: {
    value: number;
    locale: string;
    style?: 'decimal' | 'currency' | 'percent' | 'unit';
    currency?: string;
    unit?: string;
    [key: string]: unknown;
  } = $props();

  let options: Intl.NumberFormatOptions = $derived.by(() => {
    const opts: Intl.NumberFormatOptions = { style };
    if (style === 'currency' && currency) opts.currency = currency;
    if (style === 'unit' && unit) opts.unit = unit;
    return opts;
  });

  let formatted: string = $derived(
    new Intl.NumberFormat(locale, options).format(value)
  );
</script>

<span>{formatted}</span>
```

The component uses `$derived.by()` to build the options object only when its inputs change, then formats the value. This avoids creating a new formatter on every render.

For applications that display large datasets (tables with hundreds of rows), consider using `Intl.NumberFormat.prototype.formatToParts()`. This returns an array of parts (integer digits, group separators, decimal, fraction digits) that you can render with custom markup — for example, dimming the decimal portion or highlighting negative values with color.

Performance note: browsers cache `Intl.NumberFormat` instances internally when the same locale and options are used repeatedly. However, creating new instances with different options does not benefit from this cache. For table rendering, create one formatter per column (since all cells in a column share the same format) and reuse it across rows.

## 2. Style it — PE7 applied to the formatting showcase mini-build

The mini-build shows a table of values formatted across multiple locales. Table cells use `var(--text-sm)` with `font-variant-numeric: tabular-nums` for aligned numbers. The locale column headers use `var(--color-brand)` text. Currency values that exceed a threshold display in `var(--color-error)`. The table container uses `var(--color-surface-2)` with `var(--radius-lg)` and horizontal scroll on mobile via `overflow-x: auto`.

## 3. Interact — building a multi-locale formatting comparison

The problem: understanding how the same value renders differently across locales requires seeing all formats side by side.

```typescript
let value: number = $state(1234567.89);
let date: Date = $state(new Date(2026, 4, 17, 14, 30));

const locales: string[] = ['en', 'pt-BR', 'ar', 'de', 'ja'];

interface FormatRow {
  locale: string;
  number: string;
  currency: string;
  date: string;
  relative: string;
}

let rows: FormatRow[] = $derived(
  locales.map(locale => ({
    locale,
    number: new Intl.NumberFormat(locale).format(value),
    currency: new Intl.NumberFormat(locale, { style: 'currency', currency: 'USD' }).format(value),
    date: new Intl.DateTimeFormat(locale, { dateStyle: 'long' }).format(date),
    relative: new Intl.RelativeTimeFormat(locale, { numeric: 'auto' }).format(-3, 'day')
  }))
);
```

The student adjusts the `value` slider and `date` picker, and all rows update simultaneously.

## 4. Mini-build — Multi-locale formatting comparison table

**File path:** `src/routes/modules/19-i18n/05-formatting-dates-numbers/+page.svelte`

A table showing the same number, currency, date, and relative time formatted across five locales. Controls above the table let the student change the value, date, and currency code. All rows update reactively. The student can add more locales via a dropdown.

**DevTools moment:** Open the Console and type `new Intl.NumberFormat('ar-EG', { style: 'currency', currency: 'EGP' }).format(1234.5)`. Observe the Arabic-Indic numerals and the Egyptian Pound symbol. Compare with `new Intl.NumberFormat('ar-SA', { style: 'currency', currency: 'SAR' }).format(1234.5)` for Saudi Riyal.

## 5. Check your understanding — 5 questions

<details>
<summary><strong>Q1.</strong> Why should you cache Intl formatter instances using $derived instead of creating new ones in each template expression?</summary>

Creating an `Intl.DateTimeFormat` or `Intl.NumberFormat` instance requires the browser to look up locale data and compile the format pattern. In a loop rendering 100 items, this creates 100 instances unnecessarily. Using `$derived`, the formatter is created once and only recreates when the locale changes. The same instance is reused for all format calls.
</details>

<details>
<summary><strong>Q2.</strong> What is the difference between the locale and the currency code in Intl.NumberFormat?</summary>

The locale controls formatting conventions: decimal separator, grouping separator, symbol position (before or after the number). The currency code specifies which currency symbol to display and the number of decimal places (e.g., USD uses 2, JPY uses 0). A Brazilian user viewing US prices would use locale `pt-BR` with currency code `USD`, producing "US$ 49,99".
</details>

<details>
<summary><strong>Q3.</strong> Why does new Date('2026-05-17') sometimes display as May 16 in US time zones?</summary>

The string '2026-05-17' is parsed as midnight UTC. In US time zones (UTC-5 to UTC-8), midnight UTC is the previous day's evening. The date formatter uses the local time zone by default, showing May 16 instead of May 17. Use `timeZone: 'UTC'` in the formatter or pass dates with explicit time components to avoid this.
</details>

<details>
<summary><strong>Q4.</strong> How does Intl.RelativeTimeFormat handle the value -1 for "day" differently with numeric: 'auto' vs numeric: 'always'?</summary>

With `numeric: 'auto'`, `-1` for "day" produces "yesterday" — a natural language expression. With `numeric: 'always'`, it produces "1 day ago" — a numeric expression. The `auto` option is more natural for recent dates but can be confusing for larger values where "2 days ago" and "the day before yesterday" are both valid.
</details>

<details>
<summary><strong>Q5.</strong> Why is the <time> element important when displaying formatted dates?</summary>

The `<time>` element with a `datetime` attribute provides a machine-readable date to search engines, screen readers, and browser features (like auto-adding events to calendars). The displayed text can be locale-formatted ("17 de maio de 2026") while the `datetime` attribute contains the ISO format ("2026-05-17T00:00:00Z"), ensuring both human and machine consumers get the correct value.
</details>

## 6. Common mistakes — 3 pitfalls

1. **Creating Intl formatters inside {#each} blocks.** Each iteration creates a new formatter instance. Move the formatter creation to a `$derived` declaration outside the loop and reuse it for all items.

2. **Using the locale as the currency code.** Writing `currency: 'pt-BR'` instead of `currency: 'BRL'` throws a RangeError. Locale tags and currency codes are different standards (BCP 47 vs ISO 4217).

3. **Ignoring time zone in date-only values.** Formatting a date-only value without `timeZone: 'UTC'` can shift the displayed date by one day depending on the user's local time zone. Always specify the time zone for dates without time components.

## 7. What's next — one sentence

Next, you will tackle one of the hardest challenges in i18n: building layouts that work seamlessly in right-to-left languages like Arabic and Hebrew.
