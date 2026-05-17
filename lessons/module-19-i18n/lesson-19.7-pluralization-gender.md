---
module: 19
lesson: 19.7
title: Pluralization and gender
duration: 50 minutes
prerequisites:
  - "19.2 — Message extraction and ICU MessageFormat"
  - "19.5 — Formatting dates, numbers, and currencies"
learning_objectives:
  - Implement ICU plural rules for languages with more than two plural forms (Polish, Arabic, Russian)
  - Use ICU select syntax for grammatical gender in languages that require it (French, German, Arabic)
  - Nest plural and select branches for complex messages that depend on both count and gender
  - Test plural messages with edge-case values (0, 1, 2, 5, 11, 21, 100) that trigger different CLDR categories
  - Build a component that displays pluralized strings with correct ordinal forms
status: ready
---

# Lesson 19.7 — Pluralization and gender

> **Atomic lesson format** — every lesson in this course follows the same four parts: **Concept**, **Style it**, **Interact**, **Mini-build**.

## 1. Concept — When "1 item / 2 items" is not enough

### 1.1 The problem: English plural rules are the exception, not the norm

English has two plural forms: singular ("1 item") and plural ("2 items," "0 items," "100 items"). As an English speaker, you might assume all languages work this way. They do not.

**Polish** has three forms: one (1 wiadomość), few (2-4 wiadomości, but not 12-14), and many/other (5+ wiadomości, including 12-14). The "few" category applies when the last two digits of the number are 02, 03, or 04, but not 12, 13, or 14. So "22 wiadomości" uses the few form, but "12 wiadomości" uses the many form.

**Arabic** has six forms: zero, one, two, few (3-10), many (11-99), and other (100+). Each form uses a different noun ending.

**Japanese** has one form: there is no plural distinction at all. "1 item" and "100 items" use the same word.

If you hardcode plural logic with a ternary operator (`count === 1 ? 'item' : 'items'`), your application produces grammatically incorrect text in most languages. The CLDR (Unicode Common Locale Data Repository) defines the rules for every language, and the ICU `plural` selector applies them correctly.

### 1.2 How ICU plural categories work

ICU defines six plural categories: `zero`, `one`, `two`, `few`, `many`, and `other`. Every language uses a subset of these categories. The `other` category is mandatory for all languages — it is the fallback. English uses `one` and `other`. Arabic uses all six.

The categories do not correspond to simple numeric ranges. They are defined by mathematical rules applied to the integer value, the number of visible fraction digits, and other numeric properties. For example, Polish "few" is defined as:

```
n % 10 in 2..4 AND n % 100 NOT in 12..14
```

You never implement these rules yourself. `Intl.PluralRules` applies them:

```typescript
const pr = new Intl.PluralRules('pl');
pr.select(1);   // "one"
pr.select(2);   // "few"
pr.select(5);   // "other" (Polish uses "other" for what ICU calls "many")
pr.select(12);  // "other"
pr.select(22);  // "few"
```

In an ICU message, you provide a branch for each category the language needs:

```
{count, plural,
  one {# wiadomość}
  few {# wiadomości}
  other {# wiadomości}
}
```

### 1.3 Exact value matches

ICU allows exact-value matching with the `=N` syntax. This is useful for special cases that override the CLDR category:

```
{count, plural,
  =0 {Your inbox is empty}
  =1 {You have one message}
  other {You have # messages}
}
```

The `=0` branch matches the exact value 0, even though 0 falls into the `other` category in English. Exact matches take priority over category matches.

### 1.4 Gender with select

Grammatical gender affects pronouns, adjective endings, and verb forms in many languages. French distinguishes between "Il a mis à jour son profil" (he/his) and "Elle a mis à jour son profil" (she/her). German goes further with three genders: masculine, feminine, and neuter.

The ICU `select` handles gender:

```
{gender, select,
  female {{name} a mis à jour son profil}
  male {{name} a mis à jour son profil}
  other {{name} a mis à jour son profil}
}
```

In French, the possessive pronoun "son" happens to be the same for both genders in this context. But for other sentences, the branches would differ.

### 1.5 Nesting plural inside select

When both count and gender affect the message, you nest selectors:

```
{gender, select,
  female {{count, plural,
    one {{name} a publié # article}
    other {{name} a publié # articles}
  }}
  male {{count, plural,
    one {{name} a publié # article}
    other {{name} a publié # articles}
  }}
  other {{count, plural,
    one {{name} a publié # article}
    other {{name} a publié # articles}
  }}
}
```

In French, the verb form does not change with gender here, so the branches look identical. But in Arabic, both the verb conjugation and the plural noun form change with gender, making nesting essential.

### 1.6 Ordinal plurals

Ordinal numbers (1st, 2nd, 3rd, 4th) have their own plural categories. English ordinals use four forms: `one` (1st, 21st, 31st), `two` (2nd, 22nd, 32nd), `few` (3rd, 23rd, 33rd), `other` (4th, 5th, 11th, 12th, 13th).

ICU handles ordinals with `selectordinal`:

```
{position, selectordinal,
  one {#st place}
  two {#nd place}
  few {#rd place}
  other {#th place}
}
```

### Deep Dive — Building a plural rule tester and handling edge cases

A plural rule tester is an essential development tool. It takes a locale and a range of numbers and shows which CLDR category each number falls into:

```typescript
function testPluralRules(locale: string, numbers: number[]): Map<string, number[]> {
  const pr = new Intl.PluralRules(locale);
  const result = new Map<string, number[]>();

  for (const n of numbers) {
    const category = pr.select(n);
    if (!result.has(category)) result.set(category, []);
    result.get(category)!.push(n);
  }

  return result;
}
```

Running this for Arabic with numbers 0-110 reveals the full picture:

- `zero`: [0]
- `one`: [1]
- `two`: [2]
- `few`: [3, 4, 5, 6, 7, 8, 9, 10, 103, 104, ...]
- `many`: [11, 12, ..., 99]
- `other`: [100, 101, 102, ...]

The edge cases that trip up developers:

**Decimal numbers.** `Intl.PluralRules` considers the number of fraction digits. In some locales, "1.0" may use the `other` category instead of `one` because it has visible fraction digits. Always test with both integer and decimal values.

**Zero.** English treats 0 as "other" (0 items, not 0 item). But some languages have a dedicated `zero` category. Do not assume `=0` and the `zero` category are the same — `=0` is an exact match that takes priority.

**Large numbers.** Numbers like 1,000,000 are typically `other` in all languages, but the grouping separators and digit forms change. Arabic uses Eastern Arabic numerals by default: ١٬٠٠٠٬٠٠٠.

**Negative numbers.** Plural rules apply to the absolute value. -1 uses the `one` category, not a special "negative" form. But the minus sign interacts with RTL text direction — use `<bdi>` for negative numbers in RTL contexts.

For testing, always test these values: 0, 1, 2, 3, 4, 5, 10, 11, 12, 13, 14, 20, 21, 22, 100, 101, 102. These hit the boundaries of every language's plural rules. If your translations are correct for these values, they are correct for all values.

## 2. Style it — PE7 applied to the pluralization tester mini-build

The mini-build is a plural rule explorer. Number badges display in a grid using `var(--color-surface-2)` cards. Each CLDR category has a distinct accent color: `one` uses `var(--color-brand)`, `few` uses `var(--color-success)`, `many` uses `var(--color-warning)`, `other` uses `var(--color-text-muted)`, `zero` and `two` use `var(--color-error)`. The locale selector and number input use PE7 form styles.

The grid uses `gap: var(--space-xs)` with badges at `min-inline-size: 3rem` centered. The category legend uses `var(--text-xs)` with colored dots.

## 3. Interact — building an interactive plural category explorer

```typescript
let locale: string = $state('en');
let maxNumber: number = $state(30);

const testNumbers: number[] = $derived(
  Array.from({ length: maxNumber + 1 }, (_, i) => i)
);

interface CategorizedNumber {
  value: number;
  category: string;
}

let categorized: CategorizedNumber[] = $derived.by(() => {
  const pr = new Intl.PluralRules(locale);
  return testNumbers.map(n => ({ value: n, category: pr.select(n) }));
});

let categories: string[] = $derived(
  [...new Set(categorized.map(c => c.category))].sort()
);
```

The student selects a locale, adjusts the range, and sees every number color-coded by its CLDR plural category.

## 4. Mini-build — Plural rule explorer

**File path:** `src/routes/modules/19-i18n/07-pluralization-gender/+page.svelte`

A locale selector and number range slider at the top. Below, a grid of numbered badges color-coded by CLDR plural category. A legend explains each category. The student can switch between cardinal and ordinal modes. Selecting Arabic reveals six categories; selecting Japanese reveals one.

**DevTools moment:** Open the Console and run `new Intl.PluralRules('ar').select(3)` then `new Intl.PluralRules('ar').select(11)`. Observe "few" vs "many." Try `new Intl.PluralRules('pl').select(22)` and `new Intl.PluralRules('pl').select(12)` to see Polish's surprising "few" vs "other" distinction.

## 5. Check your understanding — 5 questions

<details>
<summary><strong>Q1.</strong> Why does the ternary count === 1 ? 'item' : 'items' fail for Polish?</summary>

Polish has three plural forms: `one` (1), `few` (2-4, 22-24, etc., excluding 12-14), and `other` (everything else including 5-21). The ternary only distinguishes between 1 and "not 1," producing incorrect Polish grammar for numbers like 2 (which needs the `few` form) vs 5 (which needs the `other` form).
</details>

<details>
<summary><strong>Q2.</strong> What is the difference between the =0 exact match and the "zero" plural category?</summary>

The `=0` syntax matches only when the numeric value is exactly 0 and takes priority over category matching. The `zero` category is a CLDR-defined plural category that some languages use (like Arabic) and others do not. In English, 0 falls into the `other` category, not `zero`. Using `=0` in English is a convenience override, while the `zero` category is a linguistic classification.
</details>

<details>
<summary><strong>Q3.</strong> How many plural categories does Arabic use, and can you give the approximate numeric ranges for each?</summary>

Arabic uses all six: `zero` (0), `one` (1), `two` (2), `few` (3-10 and numbers ending in 03-10), `many` (11-99 and numbers ending in 11-99), `other` (100, 101, 102, and numbers ending in 00-02 from 100 up). The exact rules are defined by the CLDR and applied by `Intl.PluralRules`.
</details>

<details>
<summary><strong>Q4.</strong> When do you need to nest a plural selector inside a select selector?</summary>

When the message depends on both a numeric value and a categorical value (like gender) and the language requires different plural forms for different categories. In Arabic, verb conjugation changes with gender, and noun plural forms also change with count. Nesting lets each gender branch define its own plural forms.
</details>

<details>
<summary><strong>Q5.</strong> What is selectordinal and how does it differ from plural?</summary>

`selectordinal` selects branches based on ordinal plural rules (1st, 2nd, 3rd, 4th) rather than cardinal rules (1 item, 2 items). English ordinals use `one` (1st, 21st), `two` (2nd, 22nd), `few` (3rd, 23rd), and `other` (4th, 5th, 11th, 12th). Cardinal English only uses `one` and `other`. The ordinal rules are defined separately in the CLDR.
</details>

## 6. Common mistakes — 4 pitfalls

1. **Providing only "one" and "other" for all languages.** Many languages need "few," "many," "two," or "zero" branches. Missing branches fall back to "other," producing grammatically incorrect text. Check the CLDR plural rules for every target locale.

2. **Testing only with English numbers (0, 1, 2).** The edge cases that reveal bugs are numbers like 12 (which is "other" in Polish, not "few"), 22 (which is "few"), and 101 (which is "one" in some languages). Test with the full set: 0, 1, 2, 3, 5, 11, 12, 21, 22, 100.

3. **Confusing cardinal and ordinal plurals.** English cardinal "one" matches only 1, but ordinal "one" matches 1, 21, 31, etc. Using cardinal rules for ordinal text produces "21th" instead of "21st."

4. **Hardcoding gender assumptions.** Not all users identify with binary gender. ICU's `select` requires an `other` fallback that uses gender-neutral language. Always provide the `other` branch and use it as the default when gender is unknown.

## 7. What's next — one sentence

Next, you will optimize your internationalized application for search engines with hreflang tags, locale-specific sitemaps, and performance strategies for multi-locale bundles.
