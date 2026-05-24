---
module: 19
exercise: 2
title: ICU Plural Rules
difficulty: intermediate
estimated_time: 20
skills_tested:
  - ICU MessageFormat syntax
  - plural categories
  - variable interpolation
  - gender-aware messages
  - ordinal plurals
---

# Exercise 19.2 — ICU Plural Rules

## Brief

Extend the i18n system to support ICU MessageFormat strings with pluralization and variable interpolation. Build a `format(key, values)` function that handles messages like "You have {count, plural, one {# item} other {# items}} in your cart." This exercise teaches the international standard for complex message formatting.

## Requirements

1. Create `src/lib/i18n/format.ts` with an ICU MessageFormat parser/formatter
2. Support variable interpolation: `{name}` replaced with a provided value
3. Support plural rules: `{count, plural, one {# message} other {# messages}}`
4. Support select (gender/category): `{gender, select, male {He} female {She} other {They}} liked your post`
5. The `#` symbol inside plural rules must be replaced with the numeric value
6. Create messages in English and Spanish that demonstrate all three patterns
7. Create `src/routes/exercises/19-i18n/02/+page.svelte` with interactive controls to change the values
8. Add a slider for count values and radio buttons for gender selection
9. Show the raw ICU template alongside the formatted output
10. Style with PE7 tokens

## Constraints

- No ICU library (implement a basic parser from scratch for learning)
- TypeScript strict mode
- Support at least: `zero`, `one`, `two`, `few`, `many`, `other` plural categories
- The parser must handle nested braces correctly

## Hints (progressive)

<details>
<summary>Hint 1 (free)</summary>

ICU plurals follow the pattern `{variable, plural, category {text} category {text}}`. Parse this by finding the outer braces, extracting the variable name and type (`plural` or `select`), then matching each `category {text}` pair. The `#` is replaced with the variable's value.
</details>

<details>
<summary>Hint 2 (conceptual)</summary>

Write a simple parser that uses regex to find `{...}` blocks. For simple variables, replace `{name}` directly. For plural/select, extract the branches and pick the matching one. English only uses `one` and `other` for cardinals, but other languages (Arabic, Russian) use `zero`, `two`, `few`, `many`.
</details>

<details>
<summary>Hint 3 (code sketch)</summary>

```typescript
function formatICU(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)(?:,\s*(plural|select),\s*(.*?))?\}/gs, (match, name, type, branches) => {
    const value = values[name];
    if (!type) return String(value); // Simple interpolation
    if (type === 'plural') {
      const category = getPluralCategory(Number(value));
      // Parse branches and find matching category...
    }
    // ...
  });
}
```
</details>

## Solution

<details>
<summary>Full solution (click to reveal)</summary>

**`src/lib/i18n/format.ts`**

```typescript
type PluralCategory = 'zero' | 'one' | 'two' | 'few' | 'many' | 'other';

function getEnglishPluralCategory(n: number): PluralCategory {
  if (n === 0) return 'zero';
  if (n === 1) return 'one';
  return 'other';
}

function parseBranches(branchesStr: string): Record<string, string> {
  const branches: Record<string, string> = {};
  const regex = /(\w+)\s*\{([^}]*)\}/g;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(branchesStr)) !== null) {
    branches[match[1]] = match[2];
  }

  return branches;
}

export function formatICU(
  template: string,
  values: Record<string, string | number> = {}
): string {
  // Handle plural/select expressions
  let result = template.replace(
    /\{(\w+),\s*(plural|select),\s*([^{}]*(?:\{[^{}]*\}[^{}]*)*)\}/g,
    (_match, name: string, type: string, branchesStr: string) => {
      const value = values[name];
      const branches = parseBranches(branchesStr);

      if (type === 'plural') {
        const num = Number(value);
        const category = getEnglishPluralCategory(num);
        const text = branches[category] ?? branches['other'] ?? '';
        return text.replace(/#/g, String(num));
      }

      if (type === 'select') {
        const key = String(value);
        return branches[key] ?? branches['other'] ?? '';
      }

      return String(value);
    }
  );

  // Handle simple interpolation
  result = result.replace(/\{(\w+)\}/g, (_match, name: string) => {
    return String(values[name] ?? `{${name}}`);
  });

  return result;
}
```

**`src/routes/exercises/19-i18n/02/+page.svelte`**

```svelte
<script lang="ts">
  import { formatICU } from '$lib/i18n/format';

  let itemCount = $state(1);
  let userName = $state('Alex');
  let gender = $state('other');

  interface Demo {
    label: string;
    template: string;
    values: () => Record<string, string | number>;
  }

  const demos: Demo[] = [
    {
      label: 'Simple Interpolation',
      template: 'Hello, {name}! Welcome back.',
      values: () => ({ name: userName })
    },
    {
      label: 'Plural (Cart Items)',
      template: 'You have {count, plural, zero {no items} one {# item} other {# items}} in your cart.',
      values: () => ({ count: itemCount })
    },
    {
      label: 'Select (Gender)',
      template: '{gender, select, male {He} female {She} other {They}} liked your photo.',
      values: () => ({ gender })
    },
    {
      label: 'Combined',
      template: '{name} has {count, plural, zero {no new messages} one {# new message} other {# new messages}}.',
      values: () => ({ name: userName, count: itemCount })
    }
  ];
</script>

<main class="page">
  <h1>ICU MessageFormat</h1>
  <p class="intro">Interactive pluralization and variable formatting following the ICU standard.</p>

  <div class="controls">
    <div class="control">
      <label for="name-input">Name</label>
      <input id="name-input" type="text" bind:value={userName} />
    </div>

    <div class="control">
      <label for="count-input">Count: {itemCount}</label>
      <input id="count-input" type="range" min={0} max={100} bind:value={itemCount} />
    </div>

    <div class="control">
      <label>Gender</label>
      <div class="radio-group">
        {#each ['male', 'female', 'other'] as option}
          <label class="radio-label">
            <input type="radio" name="gender" value={option} bind:group={gender} />
            {option}
          </label>
        {/each}
      </div>
    </div>
  </div>

  <div class="demo-list">
    {#each demos as demo}
      <div class="demo-card">
        <h2>{demo.label}</h2>
        <div class="template">
          <span class="label">Template:</span>
          <code>{demo.template}</code>
        </div>
        <div class="output">
          <span class="label">Output:</span>
          <p class="formatted">{formatICU(demo.template, demo.values())}</p>
        </div>
      </div>
    {/each}
  </div>
</main>

<style>
  .page { max-inline-size: var(--content-max); margin-inline: auto; padding: var(--space-xl) var(--space-md); }
  h1 { font-size: var(--text-2xl); margin-block-end: var(--space-sm); }
  .intro { color: var(--color-text-muted); font-size: var(--text-sm); margin-block-end: var(--space-xl); }

  .controls { display: grid; grid-template-columns: repeat(auto-fit, minmax(12rem, 1fr)); gap: var(--space-md); margin-block-end: var(--space-xl); background: var(--color-surface-2); border: 1px solid var(--color-border); border-radius: var(--radius-lg); padding: var(--space-lg); }
  .control { display: grid; gap: var(--space-xs); }
  .control > label { font-size: var(--text-sm); font-weight: 600; }
  input[type='text'], input[type='range'] { padding: var(--space-sm); border: 1px solid var(--color-border); border-radius: var(--radius-md); font-size: var(--text-base); background: var(--color-surface); color: var(--color-text); }
  .radio-group { display: flex; gap: var(--space-md); }
  .radio-label { font-size: var(--text-sm); display: flex; align-items: center; gap: var(--space-xs); cursor: pointer; text-transform: capitalize; }

  .demo-list { display: grid; gap: var(--space-md); }
  .demo-card { background: var(--color-surface-2); border: 1px solid var(--color-border); border-radius: var(--radius-md); padding: var(--space-md); }
  .demo-card h2 { font-size: var(--text-base); margin-block-end: var(--space-sm); }
  .template, .output { display: grid; grid-template-columns: 5rem 1fr; gap: var(--space-sm); align-items: baseline; margin-block-end: var(--space-xs); }
  .label { font-size: var(--text-xs); color: var(--color-text-muted); font-weight: 600; }
  code { font-size: var(--text-xs); background: var(--color-surface); padding: var(--space-xs) var(--space-sm); border-radius: var(--radius-sm); word-break: break-all; }
  .formatted { font-size: var(--text-sm); color: var(--color-brand); font-weight: 600; }
</style>
```

### Explanation

ICU MessageFormat is the international standard for formatting messages with variables, plurals, and selects. The `{count, plural, one {# item} other {# items}}` syntax selects the appropriate branch based on the plural category of the number. English only uses `one` and `other`, but Arabic has six categories (`zero`, `one`, `two`, `few`, `many`, `other`), and Russian uses `one`, `few`, `many`, `other`. The `#` symbol is replaced with the actual number. The `select` type works like a switch statement on string values — useful for gender-aware messages. The parser uses regex to find ICU expressions, extract branches, and substitute values. In production, you would use the `intl-messageformat` library (from FormatJS) which handles all CLDR plural rules, nested expressions, number/date formatting, and more. This exercise builds the concept from scratch so you understand what the library does internally.
</details>
