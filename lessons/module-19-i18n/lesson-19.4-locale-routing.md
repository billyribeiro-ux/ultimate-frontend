---
module: 19
lesson: 19.4
title: Locale routing strategies
duration: 55 minutes
prerequisites:
  - "19.3 — Paraglide.js with SvelteKit"
  - "8.6 — Dynamic routes"
  - "8.9 — hooks.server.ts"
learning_objectives:
  - Implement URL-prefix locale routing using SvelteKit's [locale] dynamic parameter
  - Configure root path detection that reads Accept-Language and redirects to the best locale
  - Build a locale switcher component that changes the URL prefix while preserving the current path
  - Handle locale persistence with cookies so return visits auto-select the preferred locale
  - Explain the tradeoffs between URL-prefix, subdomain, and domain-based locale strategies
status: ready
---

# Lesson 19.4 — Locale routing strategies

> **Atomic lesson format** — every lesson in this course follows the same four parts: **Concept**, **Style it**, **Interact**, **Mini-build**.

## 1. Concept — Making the URL reflect the user's language

### 1.1 The problem: where does the locale live?

Your application supports English, Portuguese, and Arabic. When a user navigates to the pricing page, which URL do they see? Three strategies exist:

1. **URL prefix:** `/en/pricing`, `/pt-BR/pricing`, `/ar/pricing`. The locale is the first path segment.
2. **Subdomain:** `en.example.com/pricing`, `pt-br.example.com/pricing`. Each locale gets its own subdomain.
3. **Separate domain:** `example.com/pricing`, `example.com.br/pricing`, `example.sa/pricing`. Each locale gets its own domain.

Each strategy has tradeoffs. Subdomains require DNS configuration and separate SSL certificates (or a wildcard certificate). Separate domains require separate hosting. URL prefix requires no infrastructure changes — the same SvelteKit application serves all locales from the same deployment. It is also the only strategy that works with static site generation on a single origin.

For these reasons, URL prefix is the dominant strategy for SvelteKit applications, and it is the approach Paraglide's SvelteKit adapter supports out of the box. This lesson implements it.

### 1.2 How SvelteKit dynamic routes enable locale prefixes

SvelteKit's file-based routing maps directory names to URL segments. A `[locale]` directory creates a dynamic parameter that captures the locale from the URL:

```
src/routes/
  [locale]/
    +layout.ts
    +page.svelte
    pricing/
      +page.svelte
    blog/
      +page.svelte
```

The `[locale]` parameter is available in `load` functions, hooks, and components. The layout's `load` function validates the locale and sets it as the active language:

```typescript
// src/routes/[locale]/+layout.ts
import { setLanguageTag, availableLanguageTags } from '$lib/paraglide/runtime';
import { error } from '@sveltejs/kit';
import type { LayoutLoad } from './$types';

export const load: LayoutLoad = ({ params }) => {
  const locale = params.locale;
  if (!availableLanguageTags.includes(locale)) {
    error(404, `Unknown locale: ${locale}`);
  }
  setLanguageTag(locale);
  return { locale };
};
```

### 1.3 Root path detection and redirect

When a user visits the bare root (`/`), the application must decide which locale to show. The best approach reads the browser's `Accept-Language` header and redirects to the best matching locale:

```typescript
// src/routes/+page.server.ts
import { redirect } from '@sveltejs/kit';
import { availableLanguageTags, sourceLanguageTag } from '$lib/paraglide/runtime';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = ({ request }) => {
  const acceptLanguage = request.headers.get('accept-language') ?? '';
  const preferred = negotiateLocale(acceptLanguage, availableLanguageTags);
  redirect(307, `/${preferred}`);
};

function negotiateLocale(header: string, available: string[]): string {
  const requested = header.split(',')
    .map(part => {
      const [lang, q] = part.trim().split(';q=');
      return { lang: lang.trim(), quality: q ? parseFloat(q) : 1 };
    })
    .sort((a, b) => b.quality - a.quality);

  for (const { lang } of requested) {
    const exact = available.find(a => a.toLowerCase() === lang.toLowerCase());
    if (exact) return exact;
    const prefix = available.find(a => a.toLowerCase().startsWith(lang.split('-')[0].toLowerCase()));
    if (prefix) return prefix;
  }
  return sourceLanguageTag;
}
```

### 1.4 The locale switcher component

A locale switcher must change the URL prefix while preserving the rest of the path. If the user is on `/en/pricing/enterprise` and switches to Portuguese, they should land on `/pt-BR/pricing/enterprise`, not `/pt-BR`.

The implementation reads the current path, replaces the locale segment, and navigates:

```typescript
import { page } from '$app/state';
import { goto } from '$app/navigation';
import { availableLanguageTags } from '$lib/paraglide/runtime';

function switchLocale(newLocale: string): void {
  const currentPath = page.url.pathname;
  const segments = currentPath.split('/');
  segments[1] = newLocale; // Replace the locale segment
  goto(segments.join('/'));
}
```

### 1.5 Cookie persistence

After the user explicitly selects a locale, you should remember their preference. Set a cookie in the switcher's click handler:

```typescript
function switchLocale(newLocale: string): void {
  document.cookie = `locale=${newLocale};path=/;max-age=${60 * 60 * 24 * 365};SameSite=Lax`;
  const segments = page.url.pathname.split('/');
  segments[1] = newLocale;
  goto(segments.join('/'));
}
```

Then in the root redirect handler, check the cookie before falling back to Accept-Language:

```typescript
const cookieLocale = cookies.get('locale');
if (cookieLocale && availableLanguageTags.includes(cookieLocale)) {
  redirect(307, `/${cookieLocale}`);
}
```

### Deep Dive — Paraglide's reroute hook and the invisible locale prefix

Paraglide's SvelteKit adapter offers an alternative to explicit `[locale]` directories: the `reroute` hook. Instead of nesting all routes under `[locale]/`, you keep your routes flat and let Paraglide's middleware strip and restore the locale prefix:

```typescript
// vite.config.ts
paraglide({
  project: './project.inlang',
  outdir: './src/lib/paraglide',
  strategy: 'prefix'
})
```

With this configuration, your routes stay at `src/routes/pricing/+page.svelte` (no `[locale]` wrapper). Paraglide's handle hook reads the first path segment, determines the locale, and reroutes the request to the flat route. On the client, Paraglide intercepts navigation and manages the prefix automatically.

This approach has two advantages: your route directory structure stays clean (no `[locale]` nesting), and you do not need to pass `locale` through layout data — Paraglide's runtime already knows the active locale from the URL.

The tradeoff is that you depend on Paraglide's middleware for routing, which couples your routing to the i18n library. If you ever migrate away from Paraglide, you need to add the `[locale]` directories and update every internal link. The explicit `[locale]` approach is more portable but requires more boilerplate.

For this course, we teach both approaches. The mini-build uses the explicit `[locale]` strategy because it is transparent and teaches the underlying mechanics. The module project offers the Paraglide reroute strategy as a stretch goal.

A subtle detail: when the source locale is the default, some applications prefer to omit the prefix. `/pricing` serves English, `/pt-BR/pricing` serves Portuguese. This is configured in Paraglide with `defaultLanguageTag` and `prefixDefaultLanguage: 'never'`. Search engines see `/pricing` and `/pt-BR/pricing` as distinct pages, which is what you want for hreflang. But if you omit the prefix for the default locale, you must ensure internal links always include the prefix for non-default locales. Paraglide's link rewriting handles this automatically.

## 2. Style it — PE7 applied to the locale router mini-build

The mini-build simulates locale routing with a visual URL bar and page content that changes per locale. The URL bar uses `var(--color-surface)` with `border: 1px solid var(--color-border)` and `var(--radius-md)`. The locale prefix segment is highlighted with `var(--color-brand)` background. The locale switcher buttons use PE7 button styles with the active locale in `var(--color-brand)` solid and others in outline.

Page content areas use `var(--color-surface-2)` containers with `var(--space-lg)` padding. Direction changes for Arabic are handled by the `dir` attribute on the content container, with all spacing using logical properties.

## 3. Interact — building a locale-aware router simulator

The problem: demonstrating locale routing without actually configuring SvelteKit routes requires simulating the router behavior.

```typescript
let currentLocale: string = $state('en');
let currentPage: string = $state('home');

const locales: string[] = ['en', 'pt-BR', 'ar'];
const pages: string[] = ['home', 'pricing', 'blog'];

let simulatedUrl: string = $derived(`/${currentLocale}/${currentPage}`);

let direction: 'ltr' | 'rtl' = $derived(currentLocale === 'ar' ? 'rtl' : 'ltr');

const translations: Record<string, Record<string, string>> = {
  'en': { home: 'Welcome', pricing: 'Choose your plan', blog: 'Latest posts' },
  'pt-BR': { home: 'Bem-vindo', pricing: 'Escolha seu plano', blog: 'Ultimos artigos' },
  'ar': { home: 'مرحبا', pricing: 'اختر خطتك', blog: 'آخر المقالات' }
};

let pageTitle: string = $derived(translations[currentLocale]?.[currentPage] ?? 'Unknown');
```

Clicking a locale button updates `currentLocale`, which triggers `simulatedUrl`, `direction`, and `pageTitle` to recalculate.

## 4. Mini-build — Locale routing simulator

**File path:** `src/routes/modules/19-i18n/04-locale-routing/+page.svelte`

The simulator displays a URL bar showing the current path, a locale switcher (three buttons for en/pt-BR/ar), page navigation tabs, and a content area with locale-appropriate text and direction. The Arabic locale flips the layout direction. The URL bar updates reactively to show the prefix change.

**DevTools moment:** Inspect the content container when switching to Arabic. The `dir="rtl"` attribute should appear. Check that all margin and padding use logical properties (`inline-start`, `inline-end`) so the layout reverses correctly without any physical property overrides.

## 5. Check your understanding — 5 questions

<details>
<summary><strong>Q1.</strong> What are the three main locale routing strategies, and which is best suited for SvelteKit?</summary>

URL prefix (`/en/page`), subdomain (`en.example.com/page`), and separate domain (`example.com` vs `example.com.br`). URL prefix is best for SvelteKit because it requires no infrastructure changes, works with static site generation, and is supported by Paraglide's SvelteKit adapter out of the box.
</details>

<details>
<summary><strong>Q2.</strong> How does the locale switcher preserve the current page path when changing locales?</summary>

It reads the current URL path, splits it into segments, replaces the first segment (the locale prefix) with the new locale, and navigates to the reassembled path. For example, `/en/pricing/enterprise` becomes `/pt-BR/pricing/enterprise`.
</details>

<details>
<summary><strong>Q3.</strong> Why should the root path (`/`) redirect with a 307 status code rather than a 301?</summary>

A 307 is a temporary redirect, meaning browsers will re-request the root path on each visit. This allows the server to detect locale changes (e.g., from cookie updates or Accept-Language changes). A 301 is permanent — browsers cache it and never re-request, so the user would be stuck with the first locale they were redirected to.
</details>

<details>
<summary><strong>Q4.</strong> How does cookie-based locale persistence interact with Accept-Language detection?</summary>

The cookie takes priority. When a user explicitly selects a locale via the switcher, a cookie is set. On subsequent visits, the server checks the cookie first. If it matches a valid locale, it redirects there without reading Accept-Language. If there is no cookie (first visit), Accept-Language is used as the fallback.
</details>

<details>
<summary><strong>Q5.</strong> What is the advantage of Paraglide's reroute hook over explicit [locale] directories?</summary>

The reroute hook keeps the route directory structure flat — no `[locale]` nesting. Routes live at `src/routes/pricing/` instead of `src/routes/[locale]/pricing/`. This reduces boilerplate and avoids passing the locale through layout data. The tradeoff is coupling your routing to Paraglide's middleware, making migration harder.
</details>

## 6. Common mistakes — 4 pitfalls

1. **Using 301 (permanent) redirect for root locale detection.** Browsers cache 301 redirects aggressively. If a user's Accept-Language changes or they clear their locale cookie, the browser still follows the cached redirect. Use 307 (temporary) for locale detection.

2. **Hardcoding locale in internal links.** Writing `<a href="/en/pricing">` instead of `<a href="/{locale}/pricing">` means the link always goes to English regardless of the active locale. Use the reactive locale variable or Paraglide's link rewriting.

3. **Forgetting to validate the locale parameter.** Without validation in the layout load function, a URL like `/xyz/pricing` would render with an invalid locale instead of returning a 404. Always check `params.locale` against `availableLanguageTags`.

4. **Not setting the dir attribute for RTL locales.** Changing the locale to Arabic without setting `dir="rtl"` on the HTML element or a container means the text direction stays LTR. Screen readers also rely on `dir` for correct reading order.

## 7. What's next — one sentence

Next, you will learn to format dates, numbers, and currencies using the `Intl` API with locale-aware precision.
