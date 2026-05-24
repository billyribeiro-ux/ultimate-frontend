---
module: 19
exercise: 1
title: Message Extraction
difficulty: beginner
estimated_time: 10
skills_tested:
  - message catalog structure
  - key-based translation lookup
  - locale loading
  - type-safe message access
---

# Exercise 19.1 — Message Extraction

## Brief

Create a simple internationalization system with message catalogs for English and Spanish. Build a translation function `t(key)` that returns the correct message for the current locale. This exercise teaches the foundational i18n pattern: separating text content from component markup.

## Requirements

1. Create `src/lib/i18n/messages/en.ts` with English messages as a typed object
2. Create `src/lib/i18n/messages/es.ts` with Spanish translations (same keys)
3. Create `src/lib/i18n/index.ts` that exports a `t(key)` function and a `setLocale(locale)` function
4. Define at least 10 messages covering common UI text: greeting, navigation items, form labels, button text, error messages
5. The `t` function must be type-safe — passing an invalid key should be a TypeScript error
6. Create `src/routes/exercises/19-i18n/01/+page.svelte` with a locale switcher and translated content
7. Switching locale must immediately update all displayed text
8. Use `$state` for the current locale so changes are reactive
9. Style with PE7 tokens

## Constraints

- No i18n libraries — build the system from scratch
- TypeScript strict mode — the message key type must be derived from the catalog
- Fallback to English if a key is missing in the current locale

## Hints (progressive)

<details>
<summary>Hint 1 (free)</summary>

Define messages as `const messages = { greeting: 'Hello', ... } as const`. Export the type `type MessageKey = keyof typeof messages`. The `t` function looks up `catalogs[currentLocale][key]` with a fallback to `catalogs['en'][key]`.
</details>

<details>
<summary>Hint 2 (conceptual)</summary>

Store the locale in a `.svelte.ts` file using `$state` so it is reactive. The `t` function reads from this reactive state, which means components re-render when the locale changes. Use `satisfies Record<MessageKey, string>` on the Spanish catalog to ensure it has all keys.
</details>

<details>
<summary>Hint 3 (code sketch)</summary>

```typescript
// en.ts
export const en = {
  greeting: 'Welcome',
  nav_home: 'Home',
  nav_about: 'About',
  // ...
} as const;

export type MessageKey = keyof typeof en;

// es.ts
import type { MessageKey } from './en';
export const es: Record<MessageKey, string> = {
  greeting: 'Bienvenido',
  nav_home: 'Inicio',
  nav_about: 'Acerca de',
  // ...
};
```
</details>

## Solution

<details>
<summary>Full solution (click to reveal)</summary>

**`src/lib/i18n/messages/en.ts`**

```typescript
export const en = {
  greeting: 'Welcome to our application',
  nav_home: 'Home',
  nav_about: 'About',
  nav_contact: 'Contact',
  nav_settings: 'Settings',
  form_name: 'Full Name',
  form_email: 'Email Address',
  form_submit: 'Submit',
  form_cancel: 'Cancel',
  error_required: 'This field is required',
  error_invalid_email: 'Please enter a valid email',
  success_saved: 'Changes saved successfully',
  footer_rights: 'All rights reserved'
} as const;

export type MessageKey = keyof typeof en;
```

**`src/lib/i18n/messages/es.ts`**

```typescript
import type { MessageKey } from './en';

export const es: Record<MessageKey, string> = {
  greeting: 'Bienvenido a nuestra aplicacion',
  nav_home: 'Inicio',
  nav_about: 'Acerca de',
  nav_contact: 'Contacto',
  nav_settings: 'Configuracion',
  form_name: 'Nombre completo',
  form_email: 'Correo electronico',
  form_submit: 'Enviar',
  form_cancel: 'Cancelar',
  error_required: 'Este campo es obligatorio',
  error_invalid_email: 'Introduce un correo valido',
  success_saved: 'Cambios guardados correctamente',
  footer_rights: 'Todos los derechos reservados'
};
```

**`src/lib/i18n/index.svelte.ts`**

```typescript
import { en, type MessageKey } from './messages/en';
import { es } from './messages/es';

type Locale = 'en' | 'es';

const catalogs: Record<Locale, Record<MessageKey, string>> = { en, es };

let currentLocale: Locale = $state('en');

export function t(key: MessageKey): string {
  return catalogs[currentLocale]?.[key] ?? catalogs.en[key] ?? key;
}

export function setLocale(locale: Locale): void {
  currentLocale = locale;
}

export function getLocale(): Locale {
  return currentLocale;
}

export const locales: { code: Locale; label: string }[] = [
  { code: 'en', label: 'English' },
  { code: 'es', label: 'Espanol' }
];
```

**`src/routes/exercises/19-i18n/01/+page.svelte`**

```svelte
<script lang="ts">
  import { t, setLocale, getLocale, locales } from '$lib/i18n/index.svelte';
</script>

<main class="page">
  <header class="header">
    <h1>{t('greeting')}</h1>
    <div class="locale-switcher">
      {#each locales as locale}
        <button
          class="locale-btn"
          class:active={getLocale() === locale.code}
          onclick={() => setLocale(locale.code)}
        >
          {locale.label}
        </button>
      {/each}
    </div>
  </header>

  <nav class="nav-demo">
    <a href="#">{t('nav_home')}</a>
    <a href="#">{t('nav_about')}</a>
    <a href="#">{t('nav_contact')}</a>
    <a href="#">{t('nav_settings')}</a>
  </nav>

  <section class="form-demo">
    <h2>{t('form_name')}</h2>
    <div class="field">
      <label>{t('form_name')}</label>
      <input type="text" placeholder={t('form_name')} />
      <p class="error">{t('error_required')}</p>
    </div>
    <div class="field">
      <label>{t('form_email')}</label>
      <input type="email" placeholder={t('form_email')} />
      <p class="error">{t('error_invalid_email')}</p>
    </div>
    <div class="actions">
      <button class="btn primary">{t('form_submit')}</button>
      <button class="btn secondary">{t('form_cancel')}</button>
    </div>
  </section>

  <footer class="footer">
    <p>{t('footer_rights')}</p>
  </footer>
</main>

<style>
  .page { max-inline-size: var(--content-max); margin-inline: auto; padding: var(--space-xl) var(--space-md); }

  .header { display: flex; justify-content: space-between; align-items: center; margin-block-end: var(--space-xl); flex-wrap: wrap; gap: var(--space-md); }
  h1 { font-size: var(--text-2xl); }

  .locale-switcher { display: flex; gap: var(--space-xs); }
  .locale-btn { padding: var(--space-xs) var(--space-sm); border: 1px solid var(--color-border); border-radius: var(--radius-md); background: var(--color-surface); font-size: var(--text-sm); cursor: pointer; color: var(--color-text); }
  .locale-btn.active { background: var(--color-brand); color: var(--color-surface); border-color: var(--color-brand); }

  .nav-demo { display: flex; gap: var(--space-md); margin-block-end: var(--space-xl); padding: var(--space-md); background: var(--color-surface-2); border-radius: var(--radius-md); }
  .nav-demo a { font-size: var(--text-sm); color: var(--color-text); text-decoration: none; font-weight: 600; }

  .form-demo { background: var(--color-surface-2); border: 1px solid var(--color-border); border-radius: var(--radius-lg); padding: var(--space-lg); margin-block-end: var(--space-xl); }
  .form-demo h2 { font-size: var(--text-lg); margin-block-end: var(--space-md); }
  .field { display: grid; gap: var(--space-xs); margin-block-end: var(--space-md); }
  label { font-size: var(--text-sm); font-weight: 600; }
  input { padding: var(--space-sm); border: 1px solid var(--color-border); border-radius: var(--radius-md); font-size: var(--text-base); background: var(--color-surface); color: var(--color-text); }
  .error { font-size: var(--text-xs); color: var(--color-error); }
  .actions { display: flex; gap: var(--space-sm); }
  .btn { padding: var(--space-sm) var(--space-lg); border: none; border-radius: var(--radius-md); font-weight: 600; cursor: pointer; font-size: var(--text-sm); }
  .btn.primary { background: var(--color-brand); color: var(--color-surface); }
  .btn.secondary { background: var(--color-surface); color: var(--color-text); border: 1px solid var(--color-border); }

  .footer { text-align: center; padding-block-start: var(--space-xl); border-block-start: 1px solid var(--color-border); }
  .footer p { font-size: var(--text-xs); color: var(--color-text-muted); }
</style>
```

### Explanation

This solution demonstrates the simplest viable i18n architecture: message catalogs as typed objects with a reactive lookup function. The English catalog defines the canonical keys using `as const`, and `MessageKey` is derived from it — this means adding a new key to English immediately creates a TypeScript error in all other locale files until they add the translation. The `t()` function reads from the reactive `currentLocale` state, so calling `setLocale('es')` triggers re-renders in every component that calls `t()`. The fallback chain (`current locale -> English -> key name`) ensures the app never shows a blank string. In production, you would load translations asynchronously (to avoid bundling all locales), use ICU MessageFormat for plurals and variables, and store the locale preference in a cookie or URL parameter.
</details>
