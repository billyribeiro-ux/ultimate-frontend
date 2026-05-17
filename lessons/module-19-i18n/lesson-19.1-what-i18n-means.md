---
module: 19
lesson: 19.1
title: What i18n means and why it's hard
duration: 45 minutes
prerequisites:
  - "8.6 — Dynamic routes"
  - "1.8 — TypeScript interfaces"
  - "Basic understanding of HTML lang attribute"
learning_objectives:
  - Define internationalization (i18n) and localization (l10n) and explain how they differ
  - Identify the five categories of locale-sensitive content (text, dates, numbers, direction, cultural conventions)
  - Explain why string concatenation fails for multilingual content and what message syntax solves
  - Audit an existing SvelteKit page to find every hardcoded string that would need extraction
  - Describe the compile-time vs runtime tradeoff for i18n libraries in SvelteKit
status: ready
---

# Lesson 19.1 — What i18n means and why it's hard

> **Atomic lesson format** — every lesson in this course follows the same four parts: **Concept**, **Style it**, **Interact**, **Mini-build**.

## 1. Concept — Why your app does not speak only one language

### 1.1 The problem: your users are not all like you

You build a SvelteKit application. It works perfectly. Every button says "Submit," every date reads "May 17, 2026," every price shows "$49.99." Then your company launches in Brazil, Japan, and Saudi Arabia. Suddenly "Submit" needs to be "Enviar," "May 17" needs to be "17 de maio," "$49.99" needs to be "R$ 49,99" (note the comma, not a period), and the entire layout needs to flip from left-to-right to right-to-left for Arabic readers.

This is not a feature request you can solve by adding a few `if` statements. It touches every layer of your application: markup, styles, data formatting, routing, SEO meta tags, and even the direction text flows on screen. This is why it is hard.

### 1.2 Internationalization vs localization

These two terms sound interchangeable but mean different things:

**Internationalization (i18n)** is the engineering work of making your code capable of supporting multiple locales. You extract hardcoded strings into message files. You replace `new Date().toLocaleDateString()` calls with locale-aware formatters. You switch your CSS from `margin-left` to `margin-inline-start` so it works in both LTR and RTL. i18n is done once, by developers.

**Localization (l10n)** is the content work of adapting the application for a specific locale. A translator writes the Portuguese message file. A cultural consultant reviews the Arabic date formats. l10n is done per locale, by translators and regional experts.

The abbreviations come from the number of letters between the first and last: i-nternationalizatio-n has 18 letters in between, hence i18n. l-ocalizatio-n has 10, hence l10n.

### 1.3 The five categories of locale-sensitive content

Every piece of content in your application falls into one of five categories:

1. **Text strings.** Button labels, headings, error messages, placeholder text. These are the most obvious. A naive approach concatenates them: `"You have " + count + " items"`. This breaks immediately in languages where the number goes at the end, the noun changes form based on the number, or the sentence structure is entirely different. Message syntax (like ICU MessageFormat) solves this by letting translators rearrange placeholders.

2. **Dates and times.** "5/17/2026" is May 17 in the United States but could be read as the 5th of the 17th month (nonsensical) or misinterpreted in locales that use day-first ordering. The `Intl.DateTimeFormat` API handles this, but you must always pass the correct locale.

3. **Numbers and currencies.** The number 1,234.56 uses a period as the decimal separator in English, a comma in Portuguese, and a middle dot in some Asian locales. Currency symbols go before the number in some locales, after in others. `Intl.NumberFormat` handles all of this.

4. **Text direction.** Arabic, Hebrew, and several other scripts read right-to-left (RTL). This affects not just text flow but also layout: a sidebar on the left in English should appear on the right in Arabic. CSS logical properties (`inline-start`, `inline-end`, `block-start`, `block-end`) solve this without writing separate stylesheets.

5. **Cultural conventions.** Names are family-name-first in Japan. Addresses put the postal code before the city in some countries. Colors have different connotations — red means luck in China but danger in the West. These are the hardest to systematize because they require human judgment.

### 1.4 Why string concatenation fails

Consider this template:

```svelte
<p>You have {count} {count === 1 ? 'item' : 'items'} in your cart.</p>
```

This works for English but fails for:
- **Polish:** which has three plural forms (1 item, 2-4 items with one word, 5+ items with a different word)
- **Arabic:** which has six plural forms (zero, one, two, few, many, other)
- **Japanese:** which has no plural forms at all

The ICU MessageFormat syntax handles this with a `plural` selector:

```
{count, plural,
  =0 {Your cart is empty.}
  one {You have # item in your cart.}
  other {You have # items in your cart.}
}
```

Each language provides its own version of this message with the correct plural categories. The runtime evaluates the `count` against the locale's plural rules (defined by the Unicode CLDR standard) and selects the correct branch. You will learn the full ICU MessageFormat syntax in Lesson 19.2.

### 1.5 Compile-time vs runtime i18n

In SvelteKit, you have a choice of when translation happens:

**Runtime libraries** (like `svelte-i18n`) load all translations as JSON at runtime and look up keys in a reactive store. Every page ships the entire translation dictionary. This is simple to set up but costs bundle size and lookup time.

**Compile-time libraries** (like Paraglide.js from Inlang) transform message keys into direct function calls during the build. Instead of `$t('greeting')` doing a dictionary lookup, the compiler generates `greeting()` as a function that returns the string directly. Only the current locale's messages are included in the bundle. This is the approach we will use in this course because it aligns with Svelte's compile-time philosophy.

### Deep Dive — The Unicode CLDR and how plural rules actually work

The Unicode Common Locale Data Repository (CLDR) is a massive database maintained by the Unicode Consortium that contains locale-specific data for every language and region. It defines plural rules, date format patterns, number grouping separators, currency symbols, and hundreds of other locale conventions.

Plural rules are the most misunderstood part. English has two plural categories: `one` (for the number 1) and `other` (for everything else). But the CLDR defines up to six categories: `zero`, `one`, `two`, `few`, `many`, and `other`. Arabic uses all six. Russian uses `one`, `few`, `many`, and `other`. Welsh uses `zero`, `one`, `two`, `few`, `many`, and `other`.

The rules are not simply about the integer value. The CLDR specifies rules based on the absolute value of the integer part, the number of visible fraction digits, and the absolute value of the fraction. For example, the Polish `few` category applies when the last two digits are 02-04 but not 12-14. The rule is: `n % 10 in 2..4 and n % 100 not in 12..14`.

When you use `Intl.PluralRules`, the browser applies these CLDR rules automatically. You do not need to implement them yourself. But you do need to understand that a translator must provide translations for every plural category their language uses. If you only provide `one` and `other` and the language has a `few` category, the ICU runtime will fall back to `other`, which may produce grammatically incorrect output.

The CLDR also defines ordinal plural rules (1st, 2nd, 3rd, 4th in English) and range plural rules ("1-3 items"). These are less commonly needed but available through `Intl.PluralRules` with the `type: 'ordinal'` option.

Modern i18n tools like Paraglide validate your message files against the CLDR to warn when a required plural category is missing. This catch happens at build time, not when an Arabic user encounters a broken string in production.

## 2. Style it — PE7 applied to the locale audit mini-build

The mini-build is an audit tool that highlights hardcoded strings in a simulated page. Each detected string is wrapped in a colored badge using `var(--color-warning)` background with `var(--color-text)` text. Already-extracted strings (those using a message key) display with `var(--color-success)`. The container uses `var(--color-surface-2)` with `var(--radius-lg)`.

Typography for the simulated page content uses `var(--text-base)`, while the audit annotations use `var(--text-xs)` to stay unobtrusive. Spacing between items uses `var(--space-sm)`. The layout is a single column on mobile, with a side panel for audit results appearing at `min-width: 768px`.

## 3. Interact — building a string extraction auditor

The problem: you need to identify every hardcoded string in a component before extracting them for translation. Scanning visually is error-prone and slow.

The solution is a reactive audit tool. The component state holds an array of content items, each with a `text` property and an `extracted` boolean:

```typescript
interface AuditItem {
  id: string;
  text: string;
  extracted: boolean;
  key: string | null;
}

let items: AuditItem[] = $state([
  { id: '1', text: 'Welcome to our platform', extracted: false, key: null },
  { id: '2', text: 'Submit', extracted: false, key: null },
  { id: '3', text: 'Loading...', extracted: false, key: null }
]);
```

Clicking an item marks it as extracted and generates a suggested message key:

```typescript
function extractItem(id: string): void {
  items = items.map(item =>
    item.id === id
      ? { ...item, extracted: true, key: generateKey(item.text) }
      : item
  );
}

function generateKey(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');
}
```

A `$derived` value tracks progress:

```typescript
let progress: number = $derived(
  items.filter(i => i.extracted).length / items.length
);
```

## 4. Mini-build — i18n string extraction audit tool

**File path:** `src/routes/modules/19-i18n/01-what-i18n-means/+page.svelte`

The audit tool shows a simulated page with hardcoded strings. Each string is clickable — clicking it marks it as "extracted" and generates a message key. A progress bar at the top shows extraction coverage. The student adds new strings via an input field and sees the generated message key file grow in real time.

**DevTools moment:** Inspect the progress bar element. Notice it uses `inline-size` with a percentage value and `transition: inline-size var(--dur-base) var(--ease-out)`. As you click items, the bar smoothly expands. Open the Svelte DevTools extension and watch the `progress` derived value update from 0 to 1 as you extract all strings.

## 5. Check your understanding — 5 questions

<details>
<summary><strong>Q1.</strong> What is the difference between internationalization (i18n) and localization (l10n)?</summary>

Internationalization is the engineering work of making code locale-agnostic: extracting strings, using locale-aware formatters, adopting logical CSS properties. It is done once by developers. Localization is the content work of adapting the application for a specific locale: translating strings, reviewing cultural appropriateness, adjusting formats. It is done per locale by translators and regional experts.
</details>

<details>
<summary><strong>Q2.</strong> Why does string concatenation like "You have " + count + " items" fail for multilingual content?</summary>

Different languages have different word orders (the number might come at the end), different plural rules (Polish has three forms, Arabic has six), and different grammatical structures (Japanese has no plural forms at all). Concatenation hard-codes English word order and English plural logic. ICU MessageFormat lets each language define its own sentence structure and plural branches.
</details>

<details>
<summary><strong>Q3.</strong> Name the five categories of locale-sensitive content and give one example of each.</summary>

1. Text strings (button labels like "Submit" vs "Enviar"). 2. Dates and times ("5/17/2026" vs "17/05/2026"). 3. Numbers and currencies ("$1,234.56" vs "R$ 1.234,56"). 4. Text direction (LTR for English, RTL for Arabic). 5. Cultural conventions (family-name-first in Japan, color connotations).
</details>

<details>
<summary><strong>Q4.</strong> What advantage does a compile-time i18n library like Paraglide have over a runtime library like svelte-i18n?</summary>

Compile-time libraries transform message keys into direct function calls during the build, so only the current locale's messages are included in the bundle. There is no runtime dictionary lookup. Runtime libraries ship the entire translation dictionary and perform key lookups at runtime, costing bundle size and lookup time. The compile-time approach aligns with Svelte's philosophy of doing work at build time rather than in the browser.
</details>

<details>
<summary><strong>Q5.</strong> How many plural categories does Arabic have, and what are they?</summary>

Arabic has six plural categories defined by the Unicode CLDR: zero, one, two, few, many, and other. Each category has specific numeric rules — for example, "few" applies to numbers 3-10, "many" applies to numbers 11-99. A translation file for Arabic must provide strings for all six categories or the ICU runtime falls back to "other," which may be grammatically incorrect.
</details>

## 6. Common mistakes — 4 pitfalls

1. **Hardcoding plural logic in templates.** Writing `{count === 1 ? 'item' : 'items'}` works for English but breaks for languages with more than two plural forms. Always use `Intl.PluralRules` or ICU MessageFormat for pluralization.

2. **Using margin-left instead of margin-inline-start.** Physical CSS properties break RTL layouts. Logical properties adapt automatically. If you have already been following PE7 since Module 1, your styles should already use logical properties — but double-check third-party component CSS.

3. **Forgetting to set the lang attribute.** The `<html lang="en">` attribute is essential for screen readers and search engines. When the locale changes, this attribute must update. In SvelteKit, set it in `app.html` or dynamically in a layout.

4. **Assuming date formats are universal.** Writing "05/17/2026" is ambiguous: it could be May 17 or the 5th day of the 17th month. Always use `Intl.DateTimeFormat` with an explicit locale rather than formatting dates manually.

## 7. What's next — one sentence

Next, you will learn ICU MessageFormat — the industry-standard syntax for writing translatable messages with variables, plurals, and gender selection.
