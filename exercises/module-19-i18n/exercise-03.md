---
module: 19
exercise: 3
title: Locale Routing
difficulty: advanced
estimated_time: 30
skills_tested:
  - URL-based locale detection
  - SvelteKit route parameters
  - layout-level locale setting
  - locale persistence
  - redirect for default locale
---

# Exercise 19.3 — Locale Routing

## Brief

Implement URL-based locale routing where the locale is the first path segment: `/en/about`, `/es/about`, `/fr/about`. The locale is detected from the URL, set in the layout, and persisted in a cookie. Users without a locale prefix are redirected to their preferred locale. This exercise teaches the production pattern for multilingual URL structures.

## Requirements

1. Create a route group `src/routes/exercises/19-i18n/03/[locale]/` with a `+layout.server.ts`
2. The layout load function must validate the `locale` param against supported locales
3. If the locale is invalid, redirect to the default locale (English)
4. Pass the validated locale to the layout and all child pages
5. Set a `preferred_locale` cookie so returning users get their last-used locale
6. Create `src/routes/exercises/19-i18n/03/+page.server.ts` that reads the cookie and redirects to the appropriate locale
7. Create pages: `[locale]/+page.svelte` (home), `[locale]/about/+page.svelte` (about)
8. The layout must include a locale switcher that navigates to the same page in a different locale
9. All text content must use the translation function with the URL-based locale
10. Style with PE7 tokens

## Constraints

- Locale detection must happen server-side (in load functions, not client-side)
- The URL must always contain the locale prefix (no locale-less URLs except the redirect root)
- TypeScript strict mode
- Navigation between locales must preserve the current page path

## Hints (progressive)

<details>
<summary>Hint 1 (free)</summary>

The `[locale]` route parameter captures the first path segment. In the layout load function, check if `params.locale` is in your supported locales array. If not, `throw redirect(303, '/exercises/19-i18n/03/en')`. Pass the locale to child pages via layout data.
</details>

<details>
<summary>Hint 2 (conceptual)</summary>

The locale switcher builds URLs by replacing the locale segment in the current path. If the current URL is `/exercises/19-i18n/03/es/about`, switching to English navigates to `/exercises/19-i18n/03/en/about`. Use `$page.url.pathname` to get the current path and string replacement to swap the locale.
</details>

<details>
<summary>Hint 3 (code sketch)</summary>

```typescript
// [locale]/+layout.server.ts
const SUPPORTED_LOCALES = ['en', 'es', 'fr'] as const;

export const load: LayoutServerLoad = async ({ params, cookies }) => {
  const locale = params.locale;
  if (!SUPPORTED_LOCALES.includes(locale as any)) {
    redirect(303, '/exercises/19-i18n/03/en');
  }
  cookies.set('preferred_locale', locale, { path: '/', maxAge: 60 * 60 * 24 * 365 });
  return { locale };
};
```
</details>

## Solution

<details>
<summary>Full solution (click to reveal)</summary>

**`src/routes/exercises/19-i18n/03/+page.server.ts`**

```typescript
import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

const SUPPORTED_LOCALES = ['en', 'es', 'fr'] as const;
type Locale = (typeof SUPPORTED_LOCALES)[number];

export const load: PageServerLoad = async ({ cookies }) => {
  const preferred = cookies.get('preferred_locale') as Locale | undefined;
  const locale = preferred && SUPPORTED_LOCALES.includes(preferred) ? preferred : 'en';
  redirect(303, `/exercises/19-i18n/03/${locale}`);
};
```

**`src/routes/exercises/19-i18n/03/[locale]/+layout.server.ts`**

```typescript
import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

const SUPPORTED_LOCALES = ['en', 'es', 'fr'] as const;
type Locale = (typeof SUPPORTED_LOCALES)[number];

const messages: Record<Locale, Record<string, string>> = {
  en: { home: 'Home', about: 'About', greeting: 'Welcome', about_title: 'About Us', about_text: 'We build for the global web.', switch_locale: 'Language', current: 'Current locale' },
  es: { home: 'Inicio', about: 'Acerca de', greeting: 'Bienvenido', about_title: 'Sobre nosotros', about_text: 'Construimos para la web global.', switch_locale: 'Idioma', current: 'Idioma actual' },
  fr: { home: 'Accueil', about: 'A propos', greeting: 'Bienvenue', about_title: 'A propos de nous', about_text: 'Nous construisons pour le web mondial.', switch_locale: 'Langue', current: 'Langue actuelle' }
};

export const load: LayoutServerLoad = async ({ params, cookies }) => {
  const locale = params.locale as Locale;

  if (!SUPPORTED_LOCALES.includes(locale)) {
    redirect(303, '/exercises/19-i18n/03/en');
  }

  cookies.set('preferred_locale', locale, {
    path: '/',
    maxAge: 60 * 60 * 24 * 365,
    httpOnly: false,
    sameSite: 'lax'
  });

  return {
    locale,
    messages: messages[locale],
    supportedLocales: SUPPORTED_LOCALES
  };
};
```

**`src/routes/exercises/19-i18n/03/[locale]/+layout.svelte`**

```svelte
<script lang="ts">
  import type { Snippet } from 'svelte';
  import { page } from '$app/state';

  interface Props {
    data: {
      locale: string;
      messages: Record<string, string>;
      supportedLocales: readonly string[];
    };
    children: Snippet;
  }

  let { data, children }: Props = $props();

  function switchLocalePath(newLocale: string): string {
    const currentPath = page.url.pathname;
    return currentPath.replace(`/exercises/19-i18n/03/${data.locale}`, `/exercises/19-i18n/03/${newLocale}`);
  }
</script>

<div class="i18n-layout">
  <header class="topbar">
    <nav class="nav">
      <a href="/exercises/19-i18n/03/{data.locale}">{data.messages.home}</a>
      <a href="/exercises/19-i18n/03/{data.locale}/about">{data.messages.about}</a>
    </nav>

    <div class="locale-switch">
      <span class="label">{data.messages.switch_locale}:</span>
      {#each data.supportedLocales as loc}
        <a
          href={switchLocalePath(loc)}
          class="locale-link"
          class:active={data.locale === loc}
          aria-current={data.locale === loc ? 'page' : undefined}
        >
          {loc.toUpperCase()}
        </a>
      {/each}
    </div>
  </header>

  <main class="content">
    {@render children()}
  </main>
</div>

<style>
  .i18n-layout { min-block-size: 100vh; display: grid; grid-template-rows: auto 1fr; }

  .topbar { display: flex; justify-content: space-between; align-items: center; padding: var(--space-sm) var(--space-md); background: var(--color-surface-2); border-block-end: 1px solid var(--color-border); flex-wrap: wrap; gap: var(--space-sm); }

  .nav { display: flex; gap: var(--space-md); }
  .nav a { font-size: var(--text-sm); color: var(--color-text); text-decoration: none; font-weight: 600; }

  .locale-switch { display: flex; align-items: center; gap: var(--space-sm); }
  .label { font-size: var(--text-xs); color: var(--color-text-muted); }
  .locale-link { font-size: var(--text-xs); font-weight: 700; padding: var(--space-xs) var(--space-sm); border-radius: var(--radius-sm); text-decoration: none; color: var(--color-text-muted); border: 1px solid transparent; }
  .locale-link.active { background: var(--color-brand); color: var(--color-surface); }
  .locale-link:hover:not(.active) { border-color: var(--color-border); }

  .content { max-inline-size: var(--content-max); margin-inline: auto; padding: var(--space-xl) var(--space-md); inline-size: 100%; }
</style>
```

**`src/routes/exercises/19-i18n/03/[locale]/+page.svelte`**

```svelte
<script lang="ts">
  interface Props {
    data: { locale: string; messages: Record<string, string> };
  }
  let { data }: Props = $props();
</script>

<h1>{data.messages.greeting}</h1>
<p class="locale-info">{data.messages.current}: <strong>{data.locale}</strong></p>

<style>
  h1 { font-size: var(--text-2xl); margin-block-end: var(--space-sm); }
  .locale-info { font-size: var(--text-sm); color: var(--color-text-muted); }
  strong { color: var(--color-brand); }
</style>
```

**`src/routes/exercises/19-i18n/03/[locale]/about/+page.svelte`**

```svelte
<script lang="ts">
  interface Props {
    data: { locale: string; messages: Record<string, string> };
  }
  let { data }: Props = $props();
</script>

<h1>{data.messages.about_title}</h1>
<p>{data.messages.about_text}</p>

<style>
  h1 { font-size: var(--text-2xl); margin-block-end: var(--space-md); }
  p { font-size: var(--text-base); color: var(--color-text-muted); }
</style>
```

### Explanation

URL-based locale routing (`/en/about`, `/es/about`) is the SEO-optimal i18n pattern because search engines treat each locale path as a distinct indexable page. The `[locale]` dynamic segment captures the locale from the URL. The layout load function validates it against supported locales and redirects invalid locales to English. Setting a `preferred_locale` cookie allows the root redirect page to send returning users to their last-used language. The locale switcher replaces the locale segment in the current path, preserving the page context (switching from `/es/about` goes to `/fr/about`, not `/fr`). All messages are loaded server-side and passed via layout data — this means the page is fully rendered in the correct language on first paint (SSR-compatible). In production, you would use a more sophisticated locale detection strategy: check the `Accept-Language` header, then the cookie, then fall back to the default locale.
</details>
