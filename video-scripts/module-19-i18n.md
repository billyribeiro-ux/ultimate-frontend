# Module 19 — Internationalization: Video Lecture Script Outlines

> **Recording note:** Set editor font to 18px minimum. Show browser language switching. Have multiple locale examples ready.

---

## Lesson 19.1 — What i18n means

**Duration:** 10 minutes
**Screen setup:** Slides for concepts, browser showing multilingual sites

### Hook (30 seconds)
"Your app works in English. Your users speak 30 languages. i18n (internationalization) is the architecture that makes your app translatable. l10n (localization) is the actual translation. This lesson separates code from content so translators can work without touching your Svelte files."

### Demo sequence
1. **[0:30-2:30] i18n vs l10n** — Internationalization is the framework. Localization is the content. Define both.
2. **[2:30-5:00] What needs translating** — Text, dates, numbers, plurals, images, layout direction. Show the full scope.
3. **[5:00-7:00] Message files** — Separate translatable strings from code. Key-value files per language.
4. **[7:00-8:30] Build the mini-build** — Same page in English and Spanish, switching via button.
5. **[8:30-9:30] Edge case / gotcha** — "Never concatenate translated strings: `greeting + name` breaks in languages where word order differs. Use parameterized messages: `Hello, {name}!`"

### Key moments
- 0:30 — "Code separate from content"
- 2:30 — "Full scope of translation"
- 5:00 — "Message files"
- 7:00 — "Language switch"
- 8:30 — "No string concatenation"

### Callout graphics
- i18n vs l10n diagram
- Translation scope checklist
- Parameterized message pattern

### Outro (30 seconds)
"i18n separates content from code. Next lesson: message extraction and ICU format."

---

## Lesson 19.2 — Message extraction & ICU format

**Duration:** 10 minutes
**Screen setup:** Editor with ICU messages, browser showing rendered output

### Hook (30 seconds)
"ICU MessageFormat is the industry standard for translatable messages. It handles plurals, gender, select, and nested formatting. '{count, plural, one {# item} other {# items}}' — one format string, every language's plural rules."

### Demo sequence
1. **[0:30-2:30] ICU syntax** — Basic messages, variables, plural, select. Show examples.
2. **[2:30-5:00] Plural rules** — English has 2 plural forms. Arabic has 6. ICU handles all of them.
3. **[5:00-7:00] Message extraction** — Tools that scan your code and extract translatable strings into message files.
4. **[7:00-8:30] Build the mini-build** — Cart summary with proper pluralization in English and Japanese.
5. **[8:30-9:30] Edge case / gotcha** — "Not all languages have the same plural categories. Test with languages that have many forms (Arabic, Polish) to catch missing cases."

### Key moments
- 0:30 — "Industry standard format"
- 2:30 — "Plural rules per language"
- 5:00 — "Automated extraction"
- 7:00 — "Cart pluralization"
- 8:30 — "Test with complex languages"

### Callout graphics
- ICU syntax reference
- Plural category comparison
- Extraction pipeline

### Outro (30 seconds)
"ICU MessageFormat handles complex translation scenarios. Next lesson: Paraglide with SvelteKit."

---

## Lesson 19.3 — Paraglide + SvelteKit

**Duration:** 11 minutes
**Screen setup:** Editor with Paraglide setup, browser showing translations

### Hook (30 seconds)
"Paraglide is a compile-time i18n library. It tree-shakes unused translations, provides type-safe message functions, and integrates with SvelteKit routing. Your English bundle does not ship French translations."

### Demo sequence
1. **[0:30-2:30] Installation** — Install Paraglide. Configure the SvelteKit plugin. Set up message files.
2. **[2:30-5:00] Message functions** — Import generated functions. Call them in components. Show type safety.
3. **[5:00-7:30] Language switching** — Change locale. Show the page re-rendering with new translations.
4. **[7:30-9:30] Build the mini-build** — Multi-language landing page with Paraglide.
5. **[9:30-10:30] Edge case / gotcha** — "Paraglide generates JavaScript from message files. If you change a message file, the dev server must recompile. Watch for stale translations during development."

### Key moments
- 0:30 — "Compile-time i18n"
- 2:30 — "Type-safe messages"
- 5:00 — "Language switching"
- 7:30 — "Landing page"
- 9:30 — "Recompilation on changes"

### Callout graphics
- Paraglide compilation flow
- Tree-shaking visualization
- Message function types

### Outro (30 seconds)
"Paraglide gives you type-safe, tree-shaken i18n. Next lesson: locale-based routing."

---

## Lesson 19.4 — Locale routing

**Duration:** 10 minutes
**Screen setup:** Editor with locale routing, browser showing /en/ and /es/ routes

### Hook (30 seconds)
"/en/about and /es/about serve the same page in different languages. Locale-based routing gives each language its own URL — good for SEO, good for sharing, good for bookmarks."

### Demo sequence
1. **[0:30-2:30] URL structure** — `/[locale]/` prefix. Route parameter extracts the language.
2. **[2:30-5:00] Layout-level locale** — Read the locale in the layout. Set the document language. Pass to all pages.
3. **[5:00-7:00] Language negotiation** — Detect user's preferred language from Accept-Language header. Redirect to the right locale.
4. **[7:00-8:30] Build the mini-build** — Site with /en/ and /es/ prefixes, automatic detection, and language switcher.
5. **[8:30-9:30] Edge case / gotcha** — "Do not redirect based on IP geolocation. Users traveling abroad see the wrong language. Use Accept-Language header and let users override."

### Key moments
- 0:30 — "Language in the URL"
- 2:30 — "Layout-level locale"
- 5:00 — "Accept-Language detection"
- 7:00 — "Locale routing"
- 8:30 — "No geo-based redirect"

### Callout graphics
- URL structure diagram
- Language negotiation flow
- Language switcher component

### Outro (30 seconds)
"Locale routing gives each language a shareable URL. Next lesson: formatting dates and numbers."

---

## Lesson 19.5 — Formatting dates & numbers

**Duration:** 10 minutes
**Screen setup:** Editor with Intl formatting, browser showing locale differences

### Hook (30 seconds)
"12/05/2024 — is that December 5th or May 12th? $1,234.56 — is that one thousand or one point two three four? Dates and numbers format differently in every locale. The Intl API handles this correctly."

### Demo sequence
1. **[0:30-2:30] Intl.DateTimeFormat** — Format dates for different locales. Show US vs European vs Japanese formats.
2. **[2:30-5:00] Intl.NumberFormat** — Format currency, percentages, compact numbers. Show locale variations.
3. **[5:00-7:00] Relative time** — "2 hours ago", "in 3 days". Intl.RelativeTimeFormat.
4. **[7:00-8:30] Build the mini-build** — Product page with locale-aware pricing, dates, and units.
5. **[8:30-9:30] Edge case / gotcha** — "Intl output varies by browser and OS. Use a polyfill or server-side formatting for consistent results across platforms."

### Key moments
- 0:30 — "Culture-specific formats"
- 2:30 — "Numbers and currency"
- 5:00 — "Relative time"
- 7:00 — "Product page formatting"
- 8:30 — "Browser inconsistencies"

### Callout graphics
- Date format comparison table
- Number format comparison
- Intl API reference

### Outro (30 seconds)
"Intl APIs format dates and numbers correctly for every locale. Next lesson: RTL and bidirectional text."

---

## Lesson 19.6 — RTL & bidirectional text

**Duration:** 10 minutes
**Screen setup:** Editor with RTL styles, browser showing Arabic/Hebrew layout

### Hook (30 seconds)
"Arabic reads right-to-left. Hebrew reads right-to-left. Your entire layout must flip: navigation moves to the right, text aligns right, margins reverse. CSS logical properties make this almost automatic — if you have been using them from the start."

### Demo sequence
1. **[0:30-2:30] dir="rtl"** — Set the dir attribute. Show the layout flipping.
2. **[2:30-5:00] Logical properties** — `margin-inline-start` instead of `margin-left`. Show how they adapt to direction.
3. **[5:00-7:00] Bidirectional text** — Mixed LTR and RTL text in the same sentence. Unicode bidi algorithm.
4. **[7:00-8:30] Build the mini-build** — Dashboard that switches between LTR and RTL with proper layout.
5. **[8:30-9:30] Edge case / gotcha** — "Icons with directional meaning (arrows, progress bars) must also flip in RTL. But some icons (like a checkmark) should not flip."

### Key moments
- 0:30 — "Layout flipping"
- 2:30 — "Logical properties"
- 5:00 — "Bidirectional text"
- 7:00 — "RTL dashboard"
- 8:30 — "Icon directionality"

### Callout graphics
- LTR vs RTL layout comparison
- Logical property mapping
- Icon flip rules

### Outro (30 seconds)
"Logical properties make RTL support almost automatic. Next lesson: pluralization and gender."

---

## Lesson 19.7 — Pluralization & gender

**Duration:** 10 minutes
**Screen setup:** Editor with plural/gender messages, browser showing variations

### Hook (30 seconds)
"English: 1 item, 2 items. Arabic: 0 items, 1 item, 2 items, 3 items, 11 items, 100 items — six different plural forms. Gender: 'She liked your post' vs 'He liked your post' vs 'They liked your post.' ICU MessageFormat handles all of this."

### Demo sequence
1. **[0:30-2:30] Plural categories** — zero, one, two, few, many, other. Show which languages use which.
2. **[2:30-5:00] ICU plural syntax** — `{count, plural, one {# message} other {# messages}}`. Test with multiple languages.
3. **[5:00-7:00] Gender with select** — `{gender, select, female {She} male {He} other {They}} liked your post`.
4. **[7:00-8:30] Build the mini-build** — Notification: "{actor} liked {count} of your {count, plural, one {photo} other {photos}}" with gender.
5. **[8:30-9:30] Edge case / gotcha** — "Always include the 'other' category. It is the fallback. Without it, unexpected values cause runtime errors."

### Key moments
- 0:30 — "Six plural forms"
- 2:30 — "ICU plural syntax"
- 5:00 — "Gender with select"
- 7:00 — "Notification message"
- 8:30 — "Always include 'other'"

### Callout graphics
- Plural category per language
- ICU plural syntax reference
- Select for gender

### Outro (30 seconds)
"ICU handles plural and gender complexity. Last lesson: i18n, SEO, and performance."

---

## Lesson 19.8 — i18n SEO & performance

**Duration:** 10 minutes
**Screen setup:** Editor with hreflang tags, Lighthouse results

### Hook (30 seconds)
"Google needs to know that /en/about and /es/about are the same page in different languages. Without hreflang tags, Google might treat them as duplicate content. And your translated bundle should not ship every language to every user."

### Demo sequence
1. **[0:30-2:30] hreflang tags** — `<link rel="alternate" hreflang="es" href="/es/about">`. Tell Google about language alternatives.
2. **[2:30-5:00] Language-specific sitemaps** — Sitemap with hreflang annotations for every page in every language.
3. **[5:00-7:00] Bundle performance** — Tree-shaking unused translations. Loading translations on demand per locale.
4. **[7:00-8:30] Build the mini-build** — SEO component with hreflang tags for all supported locales.
5. **[8:30-9:30] Edge case / gotcha** — "hreflang must be bidirectional. If /en/about points to /es/about, then /es/about must point back to /en/about. Missing reciprocal links are ignored."

### Key moments
- 0:30 — "Google and language alternatives"
- 2:30 — "Sitemap hreflang"
- 5:00 — "Translation tree-shaking"
- 7:00 — "hreflang component"
- 8:30 — "Bidirectional requirement"

### Callout graphics
- hreflang tag relationships
- Sitemap hreflang format
- Translation bundle sizes

### Outro (30 seconds)
"Proper i18n SEO and performance complete your internationalization. Module 19 is complete — your app can serve users in any language, direction, and locale."

---
