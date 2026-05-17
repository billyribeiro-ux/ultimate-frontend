---
module: 19
lesson: 19.2
title: Message extraction and ICU MessageFormat
duration: 55 minutes
prerequisites:
  - "19.1 — What i18n means and why it's hard"
  - "TypeScript template literal types"
learning_objectives:
  - Write ICU MessageFormat messages with simple variables, plural selectors, and select (gender/enum) selectors
  - Nest plural and select selectors to handle complex grammatical structures
  - Extract hardcoded strings from a Svelte component into a structured message file
  - Use the # symbol in ICU plural branches as a numeric placeholder
  - Validate message files against CLDR plural categories for a target locale
status: ready
---

# Lesson 19.2 — Message extraction and ICU MessageFormat

> **Atomic lesson format** — every lesson in this course follows the same four parts: **Concept**, **Style it**, **Interact**, **Mini-build**.

## 1. Concept — The grammar of translatable messages

### 1.1 The problem: variables in translated strings

Suppose your application shows a notification: "Alice liked your photo." This string has two moving parts: the user name and the object (photo, comment, post). A naive approach uses string interpolation:

```typescript
const message: string = `${userName} liked your ${objectType}.`;
```

This fails the moment a translator needs to restructure the sentence. In Japanese, the equivalent structure places the verb at the end and the object before the verb: "Alice-san ga anata no shashin wo iine shimashita." The translator cannot rearrange a template literal — the variable positions are fixed in code. What you need is a message format that lets the translator control the entire sentence structure, including where variables appear.

### 1.2 How ICU MessageFormat solves it

ICU MessageFormat is a syntax standard created by the International Components for Unicode (ICU) project. It treats every translatable string as a pattern that the translator fully controls. Variables are named placeholders enclosed in curly braces:

```
{userName} liked your {objectType}.
```

The translator can rearrange these freely:

```
あなたの{objectType}に{userName}さんがいいねしました。
```

The runtime receives the pattern and a set of named values, then produces the final string. The key insight is that **the translator owns the sentence structure, not the developer**. The developer only defines which variables are available.

### 1.3 Plural selectors

The `plural` selector is the most powerful ICU feature. It selects a message branch based on a numeric value and the locale's CLDR plural rules:

```
{count, plural,
  =0 {No notifications}
  one {# notification}
  other {# notifications}
}
```

The `#` symbol is a special placeholder that inserts the numeric value. The `=0` branch matches the exact value zero. The `one` and `other` branches match CLDR plural categories. For English, `one` matches the number 1 and `other` matches everything else. For Arabic, you would add `two`, `few`, and `many` branches.

Crucially, the plural categories are not the same as numeric ranges. In Polish, `few` applies to numbers whose last two digits are 02-04 (excluding 12-14). You do not need to memorize these rules — the CLDR and `Intl.PluralRules` handle them. But you do need to provide a translation for every category the target language uses.

### 1.4 Select selectors

The `select` selector chooses a branch based on a string value. The most common use is grammatical gender:

```
{gender, select,
  female {{name} updated her profile}
  male {{name} updated his profile}
  other {{name} updated their profile}
}
```

The `other` branch is required as a fallback. You can use `select` for any enum-like value, not just gender:

```
{role, select,
  admin {You have full access to {resource}}
  editor {You can edit {resource}}
  other {You can view {resource}}
}
```

### 1.5 Nesting selectors

ICU MessageFormat allows nesting plural inside select and vice versa. This handles complex cases like "She has 3 new messages":

```
{gender, select,
  female {{count, plural,
    =0 {{name} has no new messages}
    one {{name} has # new message}
    other {{name} has # new messages}
  }}
  male {{count, plural,
    =0 {{name} has no new messages}
    one {{name} has # new message}
    other {{name} has # new messages}
  }}
  other {{count, plural,
    =0 {{name} has no new messages}
    one {{name} has # new message}
    other {{name} has # new messages}
  }}
}
```

In English the gender does not change the plural part, so the branches look identical. But in French, German, or Arabic, the plural forms change depending on gender, making nesting essential.

### 1.6 Message extraction workflow

The extraction workflow for a SvelteKit project follows these steps:

1. **Identify** every hardcoded string in your templates and scripts.
2. **Create a message key** for each string. Use dot-notation namespacing: `pages.pricing.title`, `components.button.submit`.
3. **Write the source message** in your default locale's message file (typically `messages/en.json`).
4. **Replace the hardcoded string** with a message function call.
5. **Send message files to translators** for each target locale.
6. **Validate** that each locale file provides all required plural categories.

Tools like Paraglide's CLI automate steps 1-4 by scanning your codebase and generating message files. You will learn Paraglide specifically in Lesson 19.3.

### Deep Dive — The anatomy of a message file and typed message keys

A well-structured message file is not just a flat key-value map. It uses namespacing to organize messages by feature, page, or component:

```json
{
  "common": {
    "submit": "Submit",
    "cancel": "Cancel",
    "loading": "Loading..."
  },
  "pricing": {
    "title": "Choose your plan",
    "perMonth": "{price}/month",
    "features": "{count, plural, one {# feature} other {# features}} included"
  },
  "notifications": {
    "liked": "{userName} liked your {objectType}",
    "commented": "{userName} commented on your {objectType}"
  }
}
```

With Paraglide, these keys become TypeScript functions with typed parameters. If a message has `{userName}` and `{count}` placeholders, the generated function requires both arguments:

```typescript
// Auto-generated by Paraglide
export function pricing_features(params: { count: number }): string;
export function notifications_liked(params: { userName: string; objectType: string }): string;
```

This means a typo in a message key or a missing parameter is caught at compile time, not in production. If a translator adds a new placeholder `{discount}` to the Portuguese version but forgets to add it to the English version, the type checker flags the inconsistency.

The message file format also supports metadata via the Inlang project format (`.inlang/`). Metadata includes: the source locale, target locales, plural categories for each locale, and which messages are machine-translated versus human-reviewed. This metadata drives validation rules — the build fails if a Polish message file is missing a `few` branch for a plural message.

Best practices for message keys: never use the English text as the key (`"Submit": "Submit"` becomes confusing when the English text changes); use stable, descriptive IDs that outlast UI rewrites; prefix with the component or page name to avoid collisions; and keep keys under five segments deep for readability.

## 2. Style it — PE7 applied to the message editor mini-build

The mini-build is a live ICU message editor. The input area uses `var(--color-surface)` background with a monospace font at `var(--text-sm)`. Syntax highlighting colors variables with `var(--color-brand)`, plural/select keywords with `var(--color-success)`, and branch labels with `var(--color-warning)`. The output preview panel uses `var(--color-surface-2)` with `var(--radius-lg)`.

Error messages for invalid ICU syntax use `var(--color-error)` text with a `var(--radius-sm)` badge. The variable input fields are laid out in a horizontal row with `var(--space-sm)` gap, wrapping on mobile.

## 3. Interact — building a live ICU MessageFormat evaluator

The problem: understanding ICU syntax requires immediate feedback. Reading documentation is not enough — you need to type a pattern, provide variable values, and see the result instantly.

The solution is a reactive message evaluator. The component state holds the message pattern and variable values:

```typescript
let pattern: string = $state('{count, plural, =0 {No items} one {# item} other {# items}}');

interface Variable {
  name: string;
  value: string;
  type: 'string' | 'number';
}

let variables: Variable[] = $state([
  { name: 'count', value: '3', type: 'number' }
]);
```

A `$derived` value evaluates the pattern. Because we cannot import a full ICU parser in this mini-build, we implement a simplified evaluator that handles the subset of ICU we have taught: simple variables, `plural` with `=N`, `one`, and `other`, and `select`:

```typescript
let result: string = $derived.by(() => {
  try {
    return evaluatePattern(pattern, variables);
  } catch (e) {
    return `Error: ${(e as Error).message}`;
  }
});
```

As the student types in the pattern or adjusts variable values, the output updates immediately.

## 4. Mini-build — Live ICU MessageFormat playground

**File path:** `src/routes/modules/19-i18n/02-message-extraction-icu/+page.svelte`

The playground has three panels: a message pattern input (textarea), a variable editor (name/value/type rows), and a live output preview. The student types ICU patterns and sees the evaluated result. Preset examples (simple variable, plural, select, nested) can be loaded with a button click. Invalid patterns show a red error message.

**DevTools moment:** Open the Svelte DevTools extension and watch the `result` derived value. Type `{count, plural, =0 {empty} one {# thing} other {# things}}` and change the `count` variable from 0 to 1 to 5. Notice that `result` re-evaluates each time, but only the `result` derivation runs — not the entire component.

## 5. Check your understanding — 5 questions

<details>
<summary><strong>Q1.</strong> Why can't you use JavaScript template literals for translatable strings?</summary>

Template literals fix the position of variables in the string. A translator cannot rearrange the sentence structure because the interpolation positions are determined by the code, not the translation. ICU MessageFormat gives the translator full control over where variables appear in the sentence, allowing different word orders for different languages.
</details>

<details>
<summary><strong>Q2.</strong> What does the # symbol mean inside an ICU plural branch?</summary>

The `#` symbol is a placeholder that inserts the numeric value that triggered the plural selection. In `{count, plural, one {# item} other {# items}}`, if `count` is 5, the `#` in the `other` branch renders as "5", producing "5 items."
</details>

<details>
<summary><strong>Q3.</strong> Why is the "other" branch required in both plural and select selectors?</summary>

The `other` branch is the fallback. For `plural`, it handles any number that does not match a specific category or exact value. For `select`, it handles any string value that does not match a named branch. Without `other`, the message would produce an error for unmatched values. The ICU specification mandates it.
</details>

<details>
<summary><strong>Q4.</strong> When would you nest a plural selector inside a select selector?</summary>

When the plural form depends on the select value. For example, in French, the plural suffix of a noun can change based on the grammatical gender of the subject. "Il a 2 messages" vs "Elle a 2 messages" — both use the same plural form in French, but in languages like Arabic or German, the plural endings change based on grammatical gender. Nesting lets each gender branch define its own plural forms.
</details>

<details>
<summary><strong>Q5.</strong> Why should you avoid using the English text as the message key?</summary>

If the English text changes (e.g., "Submit" becomes "Save"), the key changes too, breaking all other locale files. Stable, descriptive keys like `form.submit_button` survive UI rewrites. They also avoid confusion when two messages have similar English text but different contexts and therefore different translations.
</details>

## 6. Common mistakes — 4 pitfalls

1. **Forgetting the `other` branch.** Every `plural` and `select` block requires an `other` fallback. Omitting it causes a runtime error when the value does not match any explicit branch.

2. **Using English plural categories for all languages.** Providing only `one` and `other` works for English but produces incorrect output for languages with `few`, `many`, or `two` categories. Always check the CLDR plural rules for each target locale.

3. **Unmatched braces in ICU patterns.** ICU uses `{` and `}` for both variable references and branch delimiters. A missing closing brace produces cryptic parsing errors. Use a linter or the Paraglide VS Code extension to catch these.

4. **Concatenating ICU patterns.** Combining two ICU patterns with `+` breaks the syntax. If you need a compound message, combine them inside a single ICU pattern or use two separate message calls rendered adjacently.

## 7. What's next — one sentence

Next, you will integrate Paraglide.js with SvelteKit to replace message function calls with type-safe, compile-time-optimized translations.
