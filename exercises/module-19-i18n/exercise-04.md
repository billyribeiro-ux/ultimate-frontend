---
module: 19
exercise: 4
title: RTL Layout
difficulty: expert
estimated_time: 45
skills_tested:
  - CSS logical properties
  - dir attribute management
  - bidirectional text handling
  - RTL-aware component design
  - writing mode considerations
---

# Exercise 19.4 — RTL Layout

## Brief

Add Arabic (RTL) support to the i18n system. Create a page that switches between English (LTR) and Arabic (RTL) layouts, with all styling correctly flipping for right-to-left reading. Every CSS property must use logical properties instead of physical directions. This exercise teaches how to build truly bidirectional layouts.

## Requirements

1. Add Arabic messages to the i18n system
2. Create `src/routes/exercises/19-i18n/04/+page.svelte` with a locale switcher between English and Arabic
3. Set `dir="rtl"` and `lang="ar"` on the root element when Arabic is selected
4. ALL CSS must use logical properties: `margin-inline-start` not `margin-left`, `border-inline-end` not `border-right`, `inset-inline-start` not `left`
5. Build a sample page with: navigation bar, hero section, card grid, form, and footer
6. The navigation bar must flip (logo right, menu left in RTL)
7. Icons with directional meaning (arrows) must flip in RTL
8. Text alignment must use `text-align: start` not `text-align: left`
9. Show a visual comparison mode where LTR and RTL render side by side
10. Style with PE7 tokens — verify all tokens use logical properties

## Constraints

- Zero physical directional properties (no left, right, margin-left, padding-right, etc.)
- The page must look correct in both directions without any direction-specific CSS
- TypeScript strict mode

## Hints (progressive)

<details>
<summary>Hint 1 (free)</summary>

CSS logical properties map physical directions to reading-direction-aware equivalents: `margin-left` -> `margin-inline-start`, `padding-right` -> `padding-inline-end`, `left` -> `inset-inline-start`, `width` -> `inline-size`, `height` -> `block-size`. Setting `dir="rtl"` on a parent element automatically flips all logical properties.
</details>

<details>
<summary>Hint 2 (conceptual)</summary>

Use `<svelte:body>` or a wrapper `<div>` with `dir={locale === 'ar' ? 'rtl' : 'ltr'}` and `lang={locale}`. All child elements inherit the direction. For directional icons, use `transform: scaleX(-1)` in RTL or CSS logical `rotate` properties.
</details>

<details>
<summary>Hint 3 (code sketch)</summary>

```svelte
<div dir={locale === 'ar' ? 'rtl' : 'ltr'} lang={locale}>
  <nav class="nav">
    <!-- Logo goes to inline-start, menu to inline-end -->
    <span class="logo">{t('brand')}</span>
    <div class="menu">{t('menu')}</div>
  </nav>
</div>

<style>
  .nav {
    display: flex;
    justify-content: space-between;
    padding-inline: var(--space-md); /* Not padding-left/right */
  }
</style>
```
</details>

## Solution

<details>
<summary>Full solution (click to reveal)</summary>

**`src/routes/exercises/19-i18n/04/+page.svelte`**

```svelte
<script lang="ts">
  type Locale = 'en' | 'ar';

  const messages: Record<Locale, Record<string, string>> = {
    en: {
      brand: 'Acme Inc',
      home: 'Home',
      products: 'Products',
      about: 'About',
      contact: 'Contact',
      hero_title: 'Build for the Global Web',
      hero_subtitle: 'Our platform supports every language and every direction.',
      card1_title: 'Performance',
      card1_text: 'Lightning-fast rendering in every locale.',
      card2_title: 'Accessibility',
      card2_text: 'Screen reader support in all languages.',
      card3_title: 'Design',
      card3_text: 'Beautiful layouts that work in any direction.',
      form_title: 'Get in Touch',
      form_name: 'Your Name',
      form_email: 'Email Address',
      form_message: 'Message',
      form_submit: 'Send Message',
      footer: 'All rights reserved',
      arrow_label: 'Next'
    },
    ar: {
      brand: 'شركة أكمي',
      home: 'الرئيسية',
      products: 'المنتجات',
      about: 'حولنا',
      contact: 'اتصل بنا',
      hero_title: 'ابنِ للويب العالمي',
      hero_subtitle: 'منصتنا تدعم كل لغة وكل اتجاه.',
      card1_title: 'الأداء',
      card1_text: 'عرض سريع للغاية في كل لغة.',
      card2_title: 'إمكانية الوصول',
      card2_text: 'دعم قارئ الشاشة بجميع اللغات.',
      card3_title: 'التصميم',
      card3_text: 'تخطيطات جميلة تعمل في أي اتجاه.',
      form_title: 'تواصل معنا',
      form_name: 'اسمك',
      form_email: 'البريد الإلكتروني',
      form_message: 'الرسالة',
      form_submit: 'إرسال الرسالة',
      footer: 'جميع الحقوق محفوظة',
      arrow_label: 'التالي'
    }
  };

  let locale: Locale = $state('en');
  const t = $derived((key: string) => messages[locale][key] ?? key);
  const dir = $derived(locale === 'ar' ? 'rtl' : 'ltr');
</script>

<main class="page">
  <h1>RTL Layout Support</h1>
  <div class="locale-switch">
    <button class:active={locale === 'en'} onclick={() => locale = 'en'}>English (LTR)</button>
    <button class:active={locale === 'ar'} onclick={() => locale = 'ar'}>العربية (RTL)</button>
  </div>

  <div class="preview" {dir} lang={locale}>
    <nav class="nav">
      <span class="logo">{t('brand')}</span>
      <div class="nav-links">
        <a href="#">{t('home')}</a>
        <a href="#">{t('products')}</a>
        <a href="#">{t('about')}</a>
        <a href="#">{t('contact')}</a>
      </div>
    </nav>

    <section class="hero">
      <h2>{t('hero_title')}</h2>
      <p>{t('hero_subtitle')}</p>
      <button class="hero-btn">
        {t('arrow_label')}
        <span class="arrow">&#8594;</span>
      </button>
    </section>

    <section class="cards">
      <div class="card">
        <h3>{t('card1_title')}</h3>
        <p>{t('card1_text')}</p>
      </div>
      <div class="card">
        <h3>{t('card2_title')}</h3>
        <p>{t('card2_text')}</p>
      </div>
      <div class="card">
        <h3>{t('card3_title')}</h3>
        <p>{t('card3_text')}</p>
      </div>
    </section>

    <section class="form-section">
      <h2>{t('form_title')}</h2>
      <form>
        <div class="field">
          <label>{t('form_name')}</label>
          <input type="text" />
        </div>
        <div class="field">
          <label>{t('form_email')}</label>
          <input type="email" />
        </div>
        <div class="field">
          <label>{t('form_message')}</label>
          <textarea rows={3}></textarea>
        </div>
        <button type="button" class="submit-btn">{t('form_submit')}</button>
      </form>
    </section>

    <footer class="footer-bar">
      <p>&copy; 2026 {t('brand')}. {t('footer')}</p>
    </footer>
  </div>
</main>

<style>
  .page { max-inline-size: var(--content-max); margin-inline: auto; padding: var(--space-xl) var(--space-md); }
  h1 { font-size: var(--text-2xl); margin-block-end: var(--space-md); }

  .locale-switch { display: flex; gap: var(--space-sm); margin-block-end: var(--space-xl); }
  .locale-switch button { padding: var(--space-sm) var(--space-md); border: 1px solid var(--color-border); border-radius: var(--radius-md); background: var(--color-surface); cursor: pointer; font-size: var(--text-sm); color: var(--color-text); }
  .locale-switch button.active { background: var(--color-brand); color: var(--color-surface); border-color: var(--color-brand); }

  .preview { border: 1px solid var(--color-border); border-radius: var(--radius-lg); overflow: hidden; background: var(--color-surface); }

  /* ALL properties use logical (inline/block) directions */
  .nav {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-inline: var(--space-md);
    padding-block: var(--space-sm);
    background: var(--color-surface-2);
    border-block-end: 1px solid var(--color-border);
  }

  .logo { font-weight: 700; font-size: var(--text-base); }
  .nav-links { display: flex; gap: var(--space-md); }
  .nav-links a { font-size: var(--text-sm); color: var(--color-text-muted); text-decoration: none; }

  .hero {
    padding-inline: var(--space-xl);
    padding-block: var(--space-2xl);
    text-align: start; /* Not text-align: left */
  }

  .hero h2 { font-size: var(--text-xl); margin-block-end: var(--space-sm); }
  .hero p { font-size: var(--text-sm); color: var(--color-text-muted); margin-block-end: var(--space-lg); }

  .hero-btn {
    display: inline-flex;
    align-items: center;
    gap: var(--space-sm);
    padding-inline: var(--space-lg);
    padding-block: var(--space-sm);
    background: var(--color-brand);
    color: var(--color-surface);
    border: none;
    border-radius: var(--radius-md);
    font-weight: 600;
    cursor: pointer;
  }

  /* Arrow flips automatically because the element inherits dir */
  .arrow { display: inline-block; }
  :global([dir='rtl']) .arrow { transform: scaleX(-1); }

  .cards {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(12rem, 1fr));
    gap: var(--space-md);
    padding-inline: var(--space-xl);
    padding-block: var(--space-lg);
  }

  .card {
    background: var(--color-surface-2);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    padding-inline: var(--space-md);
    padding-block: var(--space-md);
    border-inline-start: 3px solid var(--color-brand);
  }

  .card h3 { font-size: var(--text-sm); margin-block-end: var(--space-xs); }
  .card p { font-size: var(--text-xs); color: var(--color-text-muted); }

  .form-section {
    padding-inline: var(--space-xl);
    padding-block: var(--space-lg);
    border-block-start: 1px solid var(--color-border);
  }

  .form-section h2 { font-size: var(--text-lg); margin-block-end: var(--space-md); }

  form { display: grid; gap: var(--space-md); max-inline-size: 24rem; }
  .field { display: grid; gap: var(--space-xs); }
  label { font-size: var(--text-sm); font-weight: 600; }

  input, textarea {
    padding-inline: var(--space-sm);
    padding-block: var(--space-sm);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    font-size: var(--text-base);
    background: var(--color-surface);
    color: var(--color-text);
    font-family: inherit;
  }

  .submit-btn {
    justify-self: start;
    padding-inline: var(--space-lg);
    padding-block: var(--space-sm);
    background: var(--color-brand);
    color: var(--color-surface);
    border: none;
    border-radius: var(--radius-md);
    font-weight: 600;
    cursor: pointer;
  }

  .footer-bar {
    padding-inline: var(--space-md);
    padding-block: var(--space-md);
    border-block-start: 1px solid var(--color-border);
    text-align: center;
  }

  .footer-bar p { font-size: var(--text-xs); color: var(--color-text-muted); }
</style>
```

### Explanation

CSS logical properties are the key to bidirectional layouts. Instead of `margin-left` (which is always the left side), `margin-inline-start` adapts to the reading direction: it is the left side in LTR and the right side in RTL. The `dir="rtl"` attribute on the root element tells the browser to flip all logical properties. This means you write your CSS once and it works in both directions — no `[dir="rtl"]` overrides needed. The `border-inline-start` on cards appears on the left in English and the right in Arabic. The arrow icon uses `transform: scaleX(-1)` in RTL because directional arrows should point the opposite way. `text-align: start` aligns text to the left in LTR and right in RTL. The `lang` attribute is essential for correct text rendering — Arabic has complex joining rules that browsers handle differently when they know the language. In production, you would also set the `Content-Language` header and consider font loading for non-Latin scripts.
</details>
