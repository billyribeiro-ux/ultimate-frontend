# Build a Developer Portfolio — Complete Walkthrough

> **Time:** ~8 hours | **Modules referenced:** M1, M6, M7, M9A, M10, M12, M13, M14, M19
> **What you'll build:** A developer portfolio with a PE7 OKLCH color palette, GSAP scroll-triggered project gallery, a statically generated blog, a progressively enhanced contact form, a 3D Threlte torus hero, full SEO with Open Graph for social sharing, Lighthouse 100 on all metrics, and English/Portuguese internationalization.
> **Prerequisites:** Complete through Module 19 (Internationalization)

## Table of contents

1. [Project setup](#1-project-setup)
2. [PE7 OKLCH palette for personal branding](#2-pe7-oklch-palette-for-personal-branding)
3. [App layout and navigation](#3-app-layout-and-navigation)
4. [Hero section with 3D Threlte torus](#4-hero-section-with-3d-threlte-torus)
5. [About section](#5-about-section)
6. [Project gallery with GSAP scroll animations](#6-project-gallery-with-gsap-scroll-animations)
7. [Blog with SSG and Markdown rendering](#7-blog-with-ssg-and-markdown-rendering)
8. [Blog post pages](#8-blog-post-pages)
9. [Contact form with progressive enhancement](#9-contact-form-with-progressive-enhancement)
10. [Full SEO and Open Graph](#10-full-seo-and-open-graph)
11. [i18n — English and Portuguese](#11-i18n--english-and-portuguese)
12. [Lighthouse 100 optimization](#12-lighthouse-100-optimization)
13. [Deployment](#13-deployment)
14. [Final result](#14-final-result)
15. [What you practiced](#15-what-you-practiced)

---

## 1. Project setup

```bash
pnpm create svelte@latest dev-portfolio
```

Select: Skeleton project, TypeScript, Prettier + ESLint.

```bash
cd dev-portfolio
pnpm install

# 3D (Module 14 — Threlte)
pnpm add three @threlte/core @threlte/extras
pnpm add -D @types/three

# Animation (Module 7 — GSAP)
pnpm add gsap

# Validation
pnpm add valibot

# Static adapter for full SSG
pnpm add -D @sveltejs/adapter-static
```

Configure `svelte.config.js` for full static site generation (Lesson 9A.10):

```js
import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
  preprocess: vitePreprocess(),
  kit: {
    adapter: adapter({
      pages: 'build',
      assets: 'build',
      fallback: undefined,
      precompress: true,
      strict: true
    })
  }
};

export default config;
```

Enable prerendering globally. Create `src/routes/+layout.ts`:

```ts
export const prerender = true;
```

Configure strict TypeScript:

```json
{
  "extends": "./.svelte-kit/tsconfig.json",
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "moduleResolution": "bundler"
  }
}
```

### File tree after step 1

```
dev-portfolio/
├── src/
│   ├── app.html
│   ├── app.d.ts
│   └── routes/
│       ├── +layout.ts
│       └── +page.svelte
├── svelte.config.js
├── tsconfig.json
├── vite.config.ts
└── package.json
```

---

## 2. PE7 OKLCH palette for personal branding

Your portfolio is your brand. We build a distinctive color palette using OKLCH (Lesson 1.5 and Lesson 6.2). We chose a teal-cyan primary with purple accents — energetic yet professional.

Create `src/app.css`:

```css
@layer reset, tokens, base, layout, components, utilities;

@layer reset {
  *, *::before, *::after {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  html {
    -webkit-text-size-adjust: 100%;
    text-size-adjust: 100%;
    scroll-behavior: smooth;
  }

  body {
    min-block-size: 100dvh;
    -webkit-font-smoothing: antialiased;
  }

  img, picture, video, canvas, svg {
    display: block;
    max-inline-size: 100%;
  }

  input, button, textarea, select {
    font: inherit;
    color: inherit;
  }

  ul, ol { list-style: none; }
}

@layer tokens {
  :root {
    /* Personal brand — teal-cyan with purple accent */
    --color-primary: oklch(0.70 0.17 195);
    --color-primary-hover: oklch(0.64 0.19 195);
    --color-secondary: oklch(0.60 0.18 290);
    --color-accent: oklch(0.75 0.14 155);
    --color-surface: oklch(0.13 0.015 250);
    --color-surface-alt: oklch(0.17 0.02 250);
    --color-surface-elevated: oklch(0.21 0.025 250);
    --color-text: oklch(0.92 0.01 250);
    --color-text-muted: oklch(0.65 0.02 250);
    --color-border: oklch(0.30 0.02 250);
    --color-success: oklch(0.72 0.19 145);
    --color-error: oklch(0.65 0.22 25);

    /* Spacing */
    --space-xs: 0.25rem;
    --space-sm: 0.5rem;
    --space-md: 1rem;
    --space-lg: 1.5rem;
    --space-xl: 2rem;
    --space-2xl: 3rem;
    --space-3xl: 4rem;
    --space-4xl: 6rem;

    /* Typography — fluid (Lesson 1.6) */
    --text-xs: clamp(0.7rem, 0.65rem + 0.25vw, 0.75rem);
    --text-sm: clamp(0.8rem, 0.75rem + 0.25vw, 0.875rem);
    --text-base: clamp(0.9rem, 0.85rem + 0.25vw, 1rem);
    --text-lg: clamp(1rem, 0.9rem + 0.5vw, 1.125rem);
    --text-xl: clamp(1.15rem, 1rem + 0.75vw, 1.25rem);
    --text-2xl: clamp(1.4rem, 1.1rem + 1.5vw, 1.75rem);
    --text-3xl: clamp(1.8rem, 1.4rem + 2vw, 2.25rem);
    --text-4xl: clamp(2.4rem, 1.6rem + 4vw, 3.5rem);
    --text-5xl: clamp(3rem, 2rem + 5vw, 5rem);

    /* Motion */
    --dur-instant: 100ms;
    --dur-fast: 200ms;
    --dur-normal: 300ms;
    --dur-slow: 500ms;
    --ease-out: cubic-bezier(0.0, 0.0, 0.2, 1);
    --ease-in: cubic-bezier(0.4, 0.0, 1, 1);
    --ease-in-out: cubic-bezier(0.4, 0.0, 0.2, 1);

    /* Radius & Shadow */
    --radius-sm: 0.375rem;
    --radius-md: 0.5rem;
    --radius-lg: 0.75rem;
    --radius-full: 9999px;
    --shadow-sm: 0 1px 3px oklch(0 0 0 / 0.2);
    --shadow-md: 0 4px 12px oklch(0 0 0 / 0.3);
    --shadow-lg: 0 10px 30px oklch(0 0 0 / 0.4);

    /* Layout */
    --content-max: 64rem;
  }
}

@layer base {
  body {
    font-family: system-ui, -apple-system, sans-serif;
    font-size: var(--text-base);
    line-height: 1.6;
    color: var(--color-text);
    background: var(--color-surface);
  }

  h1, h2, h3, h4 {
    line-height: 1.1;
    text-wrap: balance;
  }

  a {
    color: var(--color-primary);
    text-decoration: none;
    transition: color var(--dur-fast) var(--ease-out);

    &:hover { color: var(--color-primary-hover); }
  }

  :focus-visible {
    outline: 2px solid var(--color-primary);
    outline-offset: 2px;
  }

  ::selection {
    background: oklch(0.70 0.17 195 / 0.3);
  }
}

@layer layout {
  .container {
    max-inline-size: var(--content-max);
    margin-inline: auto;
    padding-inline: var(--space-lg);
  }

  .section {
    padding-block: var(--space-4xl);
  }
}

@layer utilities {
  .sr-only {
    position: absolute;
    inline-size: 1px;
    block-size: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border-width: 0;
  }
}
```

---

## 3. App layout and navigation

Create `src/routes/+layout.svelte`:

```svelte
<script lang="ts">
  import '../app.css';

  let { children } = $props();
  let mobileMenuOpen = $state(false);

  const navLinks = [
    { href: '/#about', label: 'About' },
    { href: '/#projects', label: 'Projects' },
    { href: '/blog', label: 'Blog' },
    { href: '/#contact', label: 'Contact' }
  ] as const;
</script>

<header class="site-header">
  <nav class="container nav-bar" aria-label="Main navigation">
    <a href="/" class="nav-logo">WR</a>

    <!-- Desktop nav -->
    <ul class="nav-links desktop-only">
      {#each navLinks as link}
        <li><a href={link.href}>{link.label}</a></li>
      {/each}
    </ul>

    <!-- Mobile toggle -->
    <button
      class="mobile-toggle mobile-only"
      onclick={() => { mobileMenuOpen = !mobileMenuOpen; }}
      aria-expanded={mobileMenuOpen}
      aria-label="Toggle navigation menu"
    >
      <span class="hamburger" class:open={mobileMenuOpen}></span>
    </button>
  </nav>

  <!-- Mobile menu -->
  {#if mobileMenuOpen}
    <ul class="mobile-menu mobile-only">
      {#each navLinks as link}
        <li>
          <a href={link.href} onclick={() => { mobileMenuOpen = false; }}>
            {link.label}
          </a>
        </li>
      {/each}
    </ul>
  {/if}
</header>

<main id="main">
  {@render children()}
</main>

<footer class="site-footer">
  <div class="container">
    <p>&copy; {new Date().getFullYear()} Welber Ribeiro. Built with SvelteKit.</p>
  </div>
</footer>

<style>
  @layer components {
    .site-header {
      position: fixed;
      inset-block-start: 0;
      inline-size: 100%;
      z-index: 100;
      background: oklch(0.13 0.015 250 / 0.9);
      backdrop-filter: blur(12px);
      border-block-end: 1px solid var(--color-border);
    }

    .nav-bar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding-block: var(--space-md);
    }

    .nav-logo {
      font-size: var(--text-xl);
      font-weight: 800;
      color: var(--color-primary);
      letter-spacing: 0.05em;
    }

    .nav-links {
      display: flex;
      gap: var(--space-xl);

      a {
        color: var(--color-text-muted);
        font-size: var(--text-sm);
        font-weight: 500;
        transition: color var(--dur-fast) var(--ease-out);

        &:hover { color: var(--color-text); }
      }
    }

    .desktop-only {
      @media (width < 768px) { display: none; }
    }

    .mobile-only {
      @media (width >= 768px) { display: none; }
    }

    .mobile-toggle {
      background: none;
      border: none;
      cursor: pointer;
      padding: var(--space-sm);
    }

    .hamburger {
      display: block;
      inline-size: 1.5rem;
      block-size: 2px;
      background: var(--color-text);
      position: relative;
      transition: background var(--dur-fast) var(--ease-out);

      &::before, &::after {
        content: '';
        position: absolute;
        inline-size: 100%;
        block-size: 2px;
        background: var(--color-text);
        transition: transform var(--dur-fast) var(--ease-out);
      }

      &::before { transform: translateY(-6px); }
      &::after { transform: translateY(6px); }

      &.open {
        background: transparent;

        &::before { transform: rotate(45deg); }
        &::after { transform: rotate(-45deg); }
      }
    }

    .mobile-menu {
      padding: var(--space-lg);
      background: var(--color-surface-alt);
      border-block-end: 1px solid var(--color-border);

      li + li {
        margin-block-start: var(--space-md);
      }

      a {
        display: block;
        padding: var(--space-sm) 0;
        color: var(--color-text);
        font-size: var(--text-lg);
      }
    }

    main {
      padding-block-start: 4rem; /* offset for fixed header */
    }

    .site-footer {
      padding: var(--space-2xl) 0;
      border-block-start: 1px solid var(--color-border);
      text-align: center;
      color: var(--color-text-muted);
      font-size: var(--text-sm);
    }
  }
</style>
```

---

## 4. Hero section with 3D Threlte torus

This is the show-stopping hero section. We use Threlte (Lesson 14.1) to render a rotating torus knot in the background, combined with GSAP for text entrance animations (Lesson 7.3). The 3D scene is wrapped in a browser check for SSR safety (Lesson 14.8).

Create `src/lib/components/HeroScene.svelte`:

```svelte
<script lang="ts">
  import { Canvas } from '@threlte/core';
  import { T } from '@threlte/core';
  import { Float } from '@threlte/extras';
  import { browser } from '$app/environment';

  // Only render Canvas in the browser (Lesson 14.8 — SSR safety)
</script>

{#if browser}
  <div class="scene-container">
    <Canvas>
      <T.PerspectiveCamera makeDefault position={[0, 0, 5]} fov={50} />
      <T.AmbientLight intensity={0.4} />
      <T.DirectionalLight position={[5, 5, 5]} intensity={1.2} />
      <T.PointLight position={[-3, -2, 4]} intensity={0.6} color="oklch(0.70 0.17 195)" />

      <Float speed={1.5} floatIntensity={0.5}>
        <T.Mesh rotation.y={0.4} rotation.x={0.3}>
          <T.TorusKnotGeometry args={[1, 0.35, 128, 32]} />
          <T.MeshStandardMaterial
            color="oklch(0.70 0.17 195)"
            metalness={0.3}
            roughness={0.4}
            emissive="oklch(0.60 0.18 290)"
            emissiveIntensity={0.1}
          />
        </T.Mesh>
      </Float>
    </Canvas>
  </div>
{/if}

<style>
  .scene-container {
    position: absolute;
    inset: 0;
    z-index: 0;
    opacity: 0.6;
    pointer-events: none;
  }
</style>
```

Create the hero section. Update `src/routes/+page.svelte`:

```svelte
<script lang="ts">
  import { gsap } from 'gsap';
  import { ScrollTrigger } from 'gsap/ScrollTrigger';
  import { browser } from '$app/environment';
  import HeroScene from '$lib/components/HeroScene.svelte';
  import Seo from '$lib/components/Seo.svelte';
  import ProjectGallery from '$lib/components/ProjectGallery.svelte';
  import ContactForm from '$lib/components/ContactForm.svelte';

  if (browser) {
    gsap.registerPlugin(ScrollTrigger);
  }

  let heroEl: HTMLElement | undefined = $state();

  // GSAP hero entrance animation (Lesson 7.4 — timelines)
  $effect(() => {
    if (!heroEl || !browser) return;

    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;

    if (prefersReducedMotion) {
      gsap.set(heroEl.querySelectorAll('.reveal'), { opacity: 1, y: 0 });
      return;
    }

    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

    tl.fromTo(
      heroEl.querySelector('.hero-greeting'),
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 0.6 }
    )
    .fromTo(
      heroEl.querySelector('.hero-name'),
      { opacity: 0, y: 40 },
      { opacity: 1, y: 0, duration: 0.8 },
      '-=0.3'
    )
    .fromTo(
      heroEl.querySelector('.hero-tagline'),
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 0.6 },
      '-=0.4'
    )
    .fromTo(
      heroEl.querySelector('.hero-cta-group'),
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.5 },
      '-=0.3'
    );

    return () => tl.kill();
  });
</script>

<Seo
  title="Welber Ribeiro — Full-Stack Developer"
  description="I build fast, accessible web applications with Svelte, SvelteKit, and TypeScript. Check out my projects, read my blog, or get in touch."
  canonical="https://welber.dev"
/>

<!-- Hero -->
<section class="hero" bind:this={heroEl}>
  <HeroScene />
  <div class="container hero-content">
    <p class="hero-greeting reveal">Hello, I'm</p>
    <h1 class="hero-name reveal">Welber Ribeiro</h1>
    <p class="hero-tagline reveal">
      Full-stack developer building fast, accessible web applications<br />
      with Svelte, SvelteKit, and TypeScript.
    </p>
    <div class="hero-cta-group reveal">
      <a href="#projects" class="cta-primary">View my work</a>
      <a href="#contact" class="cta-secondary">Get in touch</a>
    </div>
  </div>
</section>

<!-- About -->
<section id="about" class="section">
  <div class="container">
    <h2 class="section-title">About me</h2>
    <div class="about-grid">
      <div class="about-text">
        <p>
          I'm a full-stack developer with 5+ years of experience building web applications.
          I specialize in Svelte and SvelteKit, and I'm passionate about performance,
          accessibility, and developer experience.
        </p>
        <p>
          When I'm not coding, you'll find me playing drums, exploring new coffee roasters,
          or contributing to open-source projects.
        </p>
      </div>
      <div class="skills-grid">
        <div class="skill-category">
          <h3>Frontend</h3>
          <ul>
            <li>Svelte 5 / SvelteKit 2</li>
            <li>TypeScript</li>
            <li>CSS / OKLCH / PE7</li>
            <li>GSAP / Threlte</li>
          </ul>
        </div>
        <div class="skill-category">
          <h3>Backend</h3>
          <ul>
            <li>Node.js</li>
            <li>Drizzle ORM</li>
            <li>PostgreSQL / SQLite</li>
            <li>REST / WebSockets</li>
          </ul>
        </div>
        <div class="skill-category">
          <h3>Tools</h3>
          <ul>
            <li>Git / GitHub</li>
            <li>Vitest / Playwright</li>
            <li>Vercel / Cloudflare</li>
            <li>Docker</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- Projects -->
<section id="projects" class="section">
  <div class="container">
    <h2 class="section-title">Projects</h2>
    <ProjectGallery />
  </div>
</section>

<!-- Contact -->
<section id="contact" class="section">
  <div class="container">
    <h2 class="section-title">Get in touch</h2>
    <ContactForm />
  </div>
</section>

<style>
  @layer components {
    .hero {
      position: relative;
      min-block-size: 100dvh;
      display: grid;
      place-items: center;
      overflow: hidden;
    }

    .hero-content {
      position: relative;
      z-index: 1;
      text-align: center;
    }

    .hero-greeting {
      font-size: var(--text-lg);
      color: var(--color-primary);
      font-weight: 500;
      margin-block-end: var(--space-sm);
      opacity: 0;
    }

    .hero-name {
      font-size: var(--text-5xl);
      font-weight: 800;
      margin-block-end: var(--space-lg);
      background: linear-gradient(135deg, var(--color-primary), var(--color-secondary));
      background-clip: text;
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      opacity: 0;
    }

    .hero-tagline {
      font-size: var(--text-xl);
      color: var(--color-text-muted);
      max-inline-size: 36rem;
      margin-inline: auto;
      margin-block-end: var(--space-2xl);
      opacity: 0;
    }

    .hero-cta-group {
      display: flex;
      gap: var(--space-md);
      justify-content: center;
      opacity: 0;
    }

    .cta-primary {
      padding: var(--space-sm) var(--space-2xl);
      background: var(--color-primary);
      color: oklch(1 0 0);
      border-radius: var(--radius-sm);
      font-weight: 700;
      transition: background var(--dur-fast) var(--ease-out);

      &:hover {
        background: var(--color-primary-hover);
        color: oklch(1 0 0);
      }
    }

    .cta-secondary {
      padding: var(--space-sm) var(--space-2xl);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-sm);
      color: var(--color-text);
      font-weight: 600;
      transition: all var(--dur-fast) var(--ease-out);

      &:hover {
        border-color: var(--color-primary);
        color: var(--color-primary);
      }
    }

    .section-title {
      font-size: var(--text-3xl);
      margin-block-end: var(--space-2xl);
      text-align: center;
    }

    .about-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: var(--space-3xl);

      @media (width < 768px) {
        grid-template-columns: 1fr;
      }
    }

    .about-text {
      display: flex;
      flex-direction: column;
      gap: var(--space-md);
      color: var(--color-text-muted);
      font-size: var(--text-lg);
      line-height: 1.8;
    }

    .skills-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(10rem, 1fr));
      gap: var(--space-xl);
    }

    .skill-category {
      h3 {
        font-size: var(--text-sm);
        color: var(--color-primary);
        text-transform: uppercase;
        letter-spacing: 0.1em;
        margin-block-end: var(--space-sm);
      }

      ul {
        display: flex;
        flex-direction: column;
        gap: var(--space-xs);
      }

      li {
        font-size: var(--text-sm);
        color: var(--color-text-muted);
      }
    }
  }
</style>
```

**Architecture decision:** We wrap the Threlte `<Canvas>` in `{#if browser}` (Lesson 14.8) because Three.js requires WebGL, which is only available in the browser. Since this page is prerendered (SSG), the HTML is generated at build time — the 3D scene loads as a client-side enhancement after hydration. The textual hero content is always present in the prerendered HTML, ensuring SEO visibility (Lesson 13.15).

---

## 5. About section

The about section is already included in the main page above. Notice how we use CSS Grid for the two-column layout (Lesson 6.6) and logical properties like `margin-block-end` and `padding-inline` (Lesson 6.5) throughout.

---

## 6. Project gallery with GSAP scroll animations

Create `src/lib/components/ProjectGallery.svelte`:

```svelte
<script lang="ts">
  import { gsap } from 'gsap';
  import { ScrollTrigger } from 'gsap/ScrollTrigger';
  import { browser } from '$app/environment';

  interface Project {
    title: string;
    description: string;
    tags: string[];
    image: string;
    liveUrl: string;
    sourceUrl: string;
  }

  const projects: Project[] = [
    {
      title: 'SaaS Dashboard',
      description: 'Analytics dashboard with real-time SSE updates, GSAP-animated counters, and TanStack Table.',
      tags: ['SvelteKit', 'Drizzle', 'SSE', 'GSAP'],
      image: '/projects/saas-dashboard.jpg',
      liveUrl: 'https://dashboard.example.com',
      sourceUrl: 'https://github.com/welber/saas-dashboard'
    },
    {
      title: 'E-Commerce Store',
      description: 'Full store with reactive cart, Valibot checkout validation, SSG product pages, and JSON-LD.',
      tags: ['SvelteKit', 'Valibot', 'SSG', 'SEO'],
      image: '/projects/ecommerce.jpg',
      liveUrl: 'https://store.example.com',
      sourceUrl: 'https://github.com/welber/ecommerce-store'
    },
    {
      title: 'Blog Platform',
      description: 'Markdown blog with admin panel, Drizzle database, comment system, and dynamic sitemap.',
      tags: ['SvelteKit', 'Drizzle', 'Markdown', 'Auth'],
      image: '/projects/blog-platform.jpg',
      liveUrl: 'https://blog.example.com',
      sourceUrl: 'https://github.com/welber/blog-platform'
    },
    {
      title: 'Real-Time Chat',
      description: 'WebSocket chat with typing indicators, presence detection, and optimistic UI.',
      tags: ['SvelteKit', 'WebSocket', 'Auth', 'Drizzle'],
      image: '/projects/chat-app.jpg',
      liveUrl: 'https://chat.example.com',
      sourceUrl: 'https://github.com/welber/realtime-chat'
    }
  ];

  let galleryEl: HTMLElement | undefined = $state();

  // GSAP ScrollTrigger for reveal animations (Lesson 7.9, 7.10)
  $effect(() => {
    if (!galleryEl || !browser) return;

    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;

    if (prefersReducedMotion) {
      gsap.set(galleryEl.querySelectorAll('.project-card'), { opacity: 1, y: 0 });
      return;
    }

    const cards = galleryEl.querySelectorAll('.project-card');

    // Stagger animation triggered by scroll (Lesson 7.8)
    gsap.fromTo(
      cards,
      { opacity: 0, y: 60 },
      {
        opacity: 1,
        y: 0,
        duration: 0.8,
        stagger: 0.15,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: galleryEl,
          start: 'top 80%',
          end: 'bottom 20%',
          toggleActions: 'play none none reverse'
        }
      }
    );

    return () => {
      ScrollTrigger.getAll().forEach((st) => st.kill());
    };
  });
</script>

<div class="project-gallery" bind:this={galleryEl}>
  {#each projects as project, i}
    <article class="project-card">
      <div class="project-image">
        <img
          src={project.image}
          alt={`Screenshot of ${project.title}`}
          width={600}
          height={400}
          loading="lazy"
          decoding="async"
        />
      </div>
      <div class="project-info">
        <h3>{project.title}</h3>
        <p>{project.description}</p>
        <div class="project-tags">
          {#each project.tags as tag}
            <span class="tag">{tag}</span>
          {/each}
        </div>
        <div class="project-links">
          <a href={project.liveUrl} target="_blank" rel="noopener noreferrer">
            Live site
          </a>
          <a href={project.sourceUrl} target="_blank" rel="noopener noreferrer">
            Source code
          </a>
        </div>
      </div>
    </article>
  {/each}
</div>

<style>
  @layer components {
    .project-gallery {
      display: grid;
      gap: var(--space-2xl);
    }

    .project-card {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: var(--space-2xl);
      padding: var(--space-xl);
      background: var(--color-surface-alt);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-lg);
      opacity: 0; /* Initial state for GSAP */
      transition: box-shadow var(--dur-normal) var(--ease-out);

      &:hover {
        box-shadow: var(--shadow-md);
      }

      /* Alternate layout for visual variety */
      &:nth-child(even) {
        direction: rtl;

        .project-info {
          direction: ltr;
        }
      }

      @media (width < 768px) {
        grid-template-columns: 1fr;
        direction: ltr !important;

        .project-info { direction: ltr; }
      }
    }

    .project-image {
      border-radius: var(--radius-md);
      overflow: hidden;
      background: var(--color-surface-elevated);

      img {
        inline-size: 100%;
        block-size: 100%;
        object-fit: cover;
        transition: transform var(--dur-slow) var(--ease-out);
      }

      &:hover img {
        transform: scale(1.03);
      }
    }

    .project-info {
      display: flex;
      flex-direction: column;
      justify-content: center;
      gap: var(--space-md);

      h3 {
        font-size: var(--text-2xl);
      }

      p {
        color: var(--color-text-muted);
        line-height: 1.7;
      }
    }

    .project-tags {
      display: flex;
      gap: var(--space-sm);
      flex-wrap: wrap;
    }

    .tag {
      padding: var(--space-xs) var(--space-sm);
      background: oklch(0.70 0.17 195 / 0.1);
      color: var(--color-primary);
      border-radius: var(--radius-full);
      font-size: var(--text-xs);
      font-weight: 600;
    }

    .project-links {
      display: flex;
      gap: var(--space-lg);
      font-size: var(--text-sm);

      a {
        color: var(--color-primary);
        font-weight: 600;

        &:hover { text-decoration: underline; }
      }
    }
  }
</style>
```

**Why GSAP ScrollTrigger instead of Svelte transitions?** As discussed in Lesson 7.1, Svelte's built-in `transition:` directives trigger on mount/unmount. But these project cards are always mounted — they should animate when they scroll into view, not when they mount. GSAP's ScrollTrigger (Lesson 7.9) handles this perfectly with the `start: 'top 80%'` configuration, and the stagger parameter (Lesson 7.8) creates a cascade effect.

---

## 7. Blog with SSG and Markdown rendering

We implement a statically generated blog. In production, you might use MDsveX (Lesson 18.6 — custom preprocessors) to import `.md` files directly as Svelte components. For this walkthrough, we store blog posts as TypeScript objects with Markdown content and render them manually.

Create `src/lib/data/posts.ts`:

```ts
export interface BlogPost {
  slug: string;
  title: string;
  description: string;
  date: string;
  tags: string[];
  content: string; // Markdown content
  readingTime: number;
}

export const posts: BlogPost[] = [
  {
    slug: 'svelte-5-runes-practical-guide',
    title: 'A Practical Guide to Svelte 5 Runes',
    description: 'Everything you need to know about $state, $derived, and $effect in Svelte 5 — with real-world examples.',
    date: '2026-05-15',
    tags: ['svelte', 'runes', 'tutorial'],
    readingTime: 8,
    content: `
## What are runes?

Runes are Svelte 5's compile-time macros for reactivity. They replace the old \`$:\` label syntax with explicit, composable primitives.

### \$state — mutable reactive values

\`\`\`svelte
<script lang="ts">
  let count = $state(0);
</script>

<button onclick={() => count++}>{count}</button>
\`\`\`

The \`$state\` rune declares a reactive variable. When \`count\` changes, any part of the template that reads it re-renders automatically.

### $derived — computed values

\`\`\`svelte
<script lang="ts">
  let count = $state(0);
  let doubled = $derived(count * 2);
</script>
\`\`\`

\`$derived\` creates a value that is always in sync with its dependencies. It is a pure computation — no side effects.

### $effect — side effects

\`\`\`svelte
<script lang="ts">
  let count = $state(0);

  $effect(() => {
    console.log('Count changed:', count);
  });
</script>
\`\`\`

\`$effect\` runs after the DOM updates whenever its dependencies change. Use it for DOM manipulation, subscriptions, or logging — never for updating other state.

## When NOT to use $effect

The most common mistake is using \`$effect\` to synchronize state. If you find yourself writing:

\`\`\`ts
// BAD — use $derived instead
$effect(() => {
  doubled = count * 2;
});
\`\`\`

This should always be \`$derived\`. Effects are for *side effects* — things that interact with the outside world.
`
  },
  {
    slug: 'oklch-design-system',
    title: 'Building a Design System with OKLCH Colors',
    description: 'Why OKLCH is the future of CSS color and how to build a perceptually uniform design token system.',
    date: '2026-04-28',
    tags: ['css', 'oklch', 'design-system'],
    readingTime: 6,
    content: `
## Why OKLCH?

Traditional color spaces like HSL have a fundamental problem: perceptual non-uniformity. A yellow at 50% lightness looks much brighter than a blue at 50% lightness. OKLCH solves this.

### The three channels

- **L** (Lightness): 0 to 1 — perceptually uniform
- **C** (Chroma): 0 to ~0.4 — color intensity
- **H** (Hue): 0 to 360 — the color angle

### Token system

\`\`\`css
:root {
  --color-primary: oklch(0.65 0.20 250);
  --color-success: oklch(0.72 0.19 145);
  --color-error: oklch(0.65 0.22 25);
}
\`\`\`

Notice that primary and error have the same lightness (0.65). They appear equally "bright" despite being completely different hues. This is impossible to achieve with HSL.
`
  },
  {
    slug: 'sveltekit-ssg-performance',
    title: 'SvelteKit SSG: Building a Blazing-Fast Static Site',
    description: 'How to leverage SvelteKit static generation for perfect Lighthouse scores and zero server costs.',
    date: '2026-04-10',
    tags: ['sveltekit', 'performance', 'ssg'],
    readingTime: 5,
    content: `
## Why SSG?

Static Site Generation (SSG) prerenders every page at build time into plain HTML files. The result:

- **Zero server cost** — serve from any CDN
- **Instant TTFB** — no server computation at request time
- **Perfect SEO** — crawlers see complete HTML
- **Offline-capable** — HTML files work without a server

### Enabling SSG in SvelteKit

\`\`\`ts
// src/routes/+layout.ts
export const prerender = true;
\`\`\`

That single line prerenders every page. For dynamic routes, add \`entries()\`:

\`\`\`ts
// src/routes/blog/[slug]/+page.ts
export function entries() {
  return posts.map(p => ({ slug: p.slug }));
}
\`\`\`

### The result

Build output is a folder of HTML, CSS, and JS files. Deploy to any static host — Vercel, Netlify, Cloudflare Pages, or even GitHub Pages.
`
  }
];

export function getPostBySlug(slug: string): BlogPost | undefined {
  return posts.find((p) => p.slug === slug);
}

export function getAllPosts(): BlogPost[] {
  return [...posts].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
}
```

Create `src/routes/blog/+page.ts`:

```ts
import type { PageLoad } from './$types';
import { getAllPosts } from '$lib/data/posts';

export const load: PageLoad = async () => {
  return {
    posts: getAllPosts()
  };
};
```

Create `src/routes/blog/+page.svelte`:

```svelte
<script lang="ts">
  import type { PageData } from './$types';
  import Seo from '$lib/components/Seo.svelte';

  let { data } = $props();
</script>

<Seo
  title="Blog"
  description="Thoughts on Svelte, SvelteKit, CSS, and web development."
/>

<div class="container">
  <header class="blog-header section">
    <h1>Blog</h1>
    <p>Thoughts on building for the web.</p>
  </header>

  <div class="post-list">
    {#each data.posts as post (post.slug)}
      <article class="post-preview">
        <time datetime={post.date}>
          {new Date(post.date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}
        </time>
        <h2><a href="/blog/{post.slug}">{post.title}</a></h2>
        <p>{post.description}</p>
        <div class="post-meta">
          <span>{post.readingTime} min read</span>
          <div class="post-tags">
            {#each post.tags as tag}
              <span class="tag">{tag}</span>
            {/each}
          </div>
        </div>
      </article>
    {/each}
  </div>
</div>

<style>
  @layer components {
    .blog-header {
      text-align: center;

      h1 {
        font-size: var(--text-4xl);
        margin-block-end: var(--space-sm);
      }

      p {
        color: var(--color-text-muted);
        font-size: var(--text-lg);
      }
    }

    .post-list {
      display: flex;
      flex-direction: column;
      gap: var(--space-2xl);
      padding-block-end: var(--space-3xl);
      max-inline-size: 42rem;
      margin-inline: auto;
    }

    .post-preview {
      padding-block-end: var(--space-2xl);
      border-block-end: 1px solid var(--color-border);

      time {
        font-size: var(--text-sm);
        color: var(--color-text-muted);
      }

      h2 {
        font-size: var(--text-2xl);
        margin-block: var(--space-sm);

        a {
          color: var(--color-text);
          transition: color var(--dur-fast) var(--ease-out);

          &:hover { color: var(--color-primary); }
        }
      }

      p {
        color: var(--color-text-muted);
        line-height: 1.7;
      }
    }

    .post-meta {
      display: flex;
      align-items: center;
      gap: var(--space-md);
      margin-block-start: var(--space-sm);
      font-size: var(--text-sm);
      color: var(--color-text-muted);
    }

    .post-tags {
      display: flex;
      gap: var(--space-xs);
    }

    .tag {
      padding: 0.125rem var(--space-sm);
      background: oklch(0.70 0.17 195 / 0.1);
      color: var(--color-primary);
      border-radius: var(--radius-full);
      font-size: var(--text-xs);
    }
  }
</style>
```

---

## 8. Blog post pages

Create `src/routes/blog/[slug]/+page.ts`:

```ts
import type { PageLoad } from './$types';
import { error } from '@sveltejs/kit';
import { getPostBySlug, posts } from '$lib/data/posts';

export const prerender = true;

export function entries() {
  return posts.map((p) => ({ slug: p.slug }));
}

export const load: PageLoad = async ({ params }) => {
  const post = getPostBySlug(params.slug);

  if (!post) {
    error(404, { message: 'Post not found' });
  }

  return { post };
};
```

Create a simple Markdown renderer. In production, use MDsveX or a library like `marked`. Create `src/lib/utils/markdown.ts`:

```ts
/**
 * Simple Markdown to HTML converter for blog posts.
 * In production, replace with mdsvex or a full parser.
 */
export function renderMarkdown(md: string): string {
  return md
    // Code blocks (must come before inline code)
    .replace(/```(\w+)?\n([\s\S]*?)```/g, '<pre><code class="language-$1">$2</code></pre>')
    // Inline code
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    // Headers
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    // Bold
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    // Italic
    .replace(/\*([^*]+)\*/g, '<em>$1</em>')
    // Unordered lists
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    .replace(/(<li>[\s\S]*?<\/li>)/g, '<ul>$1</ul>')
    // Paragraphs
    .replace(/^(?!<[hupol])([\s\S]+?)(?=\n\n|\n$|$)/gm, (match) => {
      const trimmed = match.trim();
      if (!trimmed || trimmed.startsWith('<')) return match;
      return `<p>${trimmed}</p>`;
    })
    // Clean up extra whitespace
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}
```

Create `src/routes/blog/[slug]/+page.svelte`:

```svelte
<script lang="ts">
  import type { PageData } from './$types';
  import { renderMarkdown } from '$lib/utils/markdown';
  import Seo from '$lib/components/Seo.svelte';

  let { data } = $props();
  let post = $derived(data.post);
  let htmlContent = $derived(renderMarkdown(post.content));

  let jsonLd = $derived({
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    author: {
      '@type': 'Person',
      name: 'Welber Ribeiro',
      url: 'https://welber.dev'
    }
  });
</script>

<Seo
  title={post.title}
  description={post.description}
  canonical={`https://welber.dev/blog/${post.slug}`}
  ogType="article"
  {jsonLd}
/>

<article class="container blog-post">
  <header class="post-header section">
    <a href="/blog" class="back-link">&larr; All posts</a>
    <h1>{post.title}</h1>
    <div class="post-meta">
      <time datetime={post.date}>
        {new Date(post.date).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })}
      </time>
      <span>{post.readingTime} min read</span>
    </div>
    <div class="post-tags">
      {#each post.tags as tag}
        <span class="tag">{tag}</span>
      {/each}
    </div>
  </header>

  <div class="prose">
    {@html htmlContent}
  </div>
</article>

<style>
  @layer components {
    .blog-post {
      max-inline-size: 42rem;
      padding-block-end: var(--space-3xl);
    }

    .back-link {
      display: inline-block;
      font-size: var(--text-sm);
      color: var(--color-text-muted);
      margin-block-end: var(--space-lg);

      &:hover { color: var(--color-primary); }
    }

    .post-header {
      h1 {
        font-size: var(--text-4xl);
        margin-block-end: var(--space-md);
      }
    }

    .post-meta {
      display: flex;
      gap: var(--space-md);
      color: var(--color-text-muted);
      font-size: var(--text-sm);
      margin-block-end: var(--space-md);
    }

    .post-tags {
      display: flex;
      gap: var(--space-xs);
      margin-block-end: var(--space-2xl);
    }

    .tag {
      padding: 0.125rem var(--space-sm);
      background: oklch(0.70 0.17 195 / 0.1);
      color: var(--color-primary);
      border-radius: var(--radius-full);
      font-size: var(--text-xs);
    }
  }

  /* Prose styles for rendered Markdown */
  .prose :global(h2) {
    font-size: var(--text-2xl);
    margin-block: var(--space-2xl) var(--space-md);
  }

  .prose :global(h3) {
    font-size: var(--text-xl);
    margin-block: var(--space-xl) var(--space-sm);
  }

  .prose :global(p) {
    margin-block-end: var(--space-md);
    line-height: 1.8;
    color: var(--color-text-muted);
  }

  .prose :global(pre) {
    padding: var(--space-lg);
    background: var(--color-surface-alt);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    overflow-x: auto;
    margin-block: var(--space-lg);
    font-size: var(--text-sm);
    line-height: 1.6;
  }

  .prose :global(code) {
    font-family: 'JetBrains Mono', 'Fira Code', monospace;
  }

  .prose :global(:not(pre) > code) {
    padding: 0.125rem 0.375rem;
    background: var(--color-surface-alt);
    border-radius: var(--radius-sm);
    font-size: 0.9em;
  }

  .prose :global(ul) {
    padding-inline-start: var(--space-xl);
    margin-block: var(--space-md);
  }

  .prose :global(li) {
    margin-block-end: var(--space-sm);
    color: var(--color-text-muted);
    line-height: 1.7;
  }

  .prose :global(strong) {
    color: var(--color-text);
    font-weight: 600;
  }
</style>
```

---

## 9. Contact form with progressive enhancement

The contact form works without JavaScript (progressive enhancement via `use:enhance` — Lesson 10.5). The form submits to a server action that validates input with Valibot.

Create `src/lib/components/ContactForm.svelte`:

```svelte
<script lang="ts">
  import { enhance } from '$app/forms';

  let submitted = $state(false);
  let submitting = $state(false);
  let formErrors: Record<string, string> = $state({});
</script>

{#if submitted}
  <div class="success-message" role="alert">
    <h3>Message sent!</h3>
    <p>Thank you for reaching out. I will get back to you within 24 hours.</p>
    <button onclick={() => { submitted = false; }}>Send another message</button>
  </div>
{:else}
  <form
    method="POST"
    action="/?/contact"
    use:enhance={() => {
      submitting = true;
      formErrors = {};
      return async ({ result, update }) => {
        submitting = false;
        if (result.type === 'success') {
          submitted = true;
        } else if (result.type === 'failure' && result.data?.errors) {
          formErrors = result.data.errors as Record<string, string>;
        }
        await update({ reset: result.type === 'success' });
      };
    }}
    class="contact-form"
    novalidate
  >
    <div class="field-row">
      <label>
        <span>Name</span>
        <input type="text" name="name" required autocomplete="name" />
        {#if formErrors.name}
          <span class="field-error" role="alert">{formErrors.name}</span>
        {/if}
      </label>
      <label>
        <span>Email</span>
        <input type="email" name="email" required autocomplete="email" />
        {#if formErrors.email}
          <span class="field-error" role="alert">{formErrors.email}</span>
        {/if}
      </label>
    </div>

    <label>
      <span>Subject</span>
      <input type="text" name="subject" required />
      {#if formErrors.subject}
        <span class="field-error" role="alert">{formErrors.subject}</span>
      {/if}
    </label>

    <label>
      <span>Message</span>
      <textarea name="message" rows={6} required></textarea>
      {#if formErrors.message}
        <span class="field-error" role="alert">{formErrors.message}</span>
      {/if}
    </label>

    <button type="submit" disabled={submitting}>
      {submitting ? 'Sending...' : 'Send message'}
    </button>
  </form>
{/if}

<style>
  @layer components {
    .contact-form {
      max-inline-size: 36rem;
      margin-inline: auto;
      display: flex;
      flex-direction: column;
      gap: var(--space-lg);
    }

    .field-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: var(--space-md);

      @media (width < 640px) {
        grid-template-columns: 1fr;
      }
    }

    label {
      display: flex;
      flex-direction: column;
      gap: var(--space-xs);
      font-size: var(--text-sm);
      font-weight: 500;
      color: var(--color-text-muted);
    }

    input, textarea {
      padding: var(--space-sm) var(--space-md);
      background: var(--color-surface-alt);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-sm);
      color: var(--color-text);
      transition: border-color var(--dur-fast) var(--ease-out);

      &:focus {
        border-color: var(--color-primary);
        outline: none;
        box-shadow: 0 0 0 2px oklch(0.70 0.17 195 / 0.2);
      }
    }

    textarea {
      resize: vertical;
      min-block-size: 8rem;
    }

    .field-error {
      color: var(--color-error);
      font-size: var(--text-xs);
    }

    button[type='submit'] {
      padding: var(--space-sm) var(--space-2xl);
      background: var(--color-primary);
      color: oklch(1 0 0);
      border: none;
      border-radius: var(--radius-sm);
      font-weight: 700;
      cursor: pointer;
      align-self: start;
      transition: background var(--dur-fast) var(--ease-out);

      &:hover:not(:disabled) {
        background: var(--color-primary-hover);
      }

      &:disabled {
        opacity: 0.6;
        cursor: wait;
      }
    }

    .success-message {
      text-align: center;
      padding: var(--space-3xl);
      max-inline-size: 30rem;
      margin-inline: auto;

      h3 {
        font-size: var(--text-2xl);
        color: var(--color-success);
        margin-block-end: var(--space-sm);
      }

      p {
        color: var(--color-text-muted);
        margin-block-end: var(--space-xl);
      }

      button {
        padding: var(--space-sm) var(--space-lg);
        background: transparent;
        border: 1px solid var(--color-border);
        border-radius: var(--radius-sm);
        color: var(--color-text-muted);
        cursor: pointer;

        &:hover {
          border-color: var(--color-primary);
          color: var(--color-primary);
        }
      }
    }
  }
</style>
```

Create the server action. Create `src/routes/+page.server.ts`:

```ts
import { fail } from '@sveltejs/kit';
import type { Actions } from './$types';
import * as v from 'valibot';

const contactSchema = v.object({
  name: v.pipe(v.string(), v.minLength(2, 'Name must be at least 2 characters.')),
  email: v.pipe(v.string(), v.email('Please enter a valid email.')),
  subject: v.pipe(v.string(), v.minLength(3, 'Subject must be at least 3 characters.')),
  message: v.pipe(v.string(), v.minLength(10, 'Message must be at least 10 characters.'))
});

export const actions: Actions = {
  contact: async ({ request }) => {
    const formData = await request.formData();

    const rawData = {
      name: formData.get('name')?.toString() ?? '',
      email: formData.get('email')?.toString() ?? '',
      subject: formData.get('subject')?.toString() ?? '',
      message: formData.get('message')?.toString() ?? ''
    };

    const result = v.safeParse(contactSchema, rawData);

    if (!result.success) {
      const errors: Record<string, string> = {};
      for (const issue of result.issues) {
        const path = issue.path?.[0]?.key;
        if (typeof path === 'string') {
          errors[path] = issue.message;
        }
      }
      return fail(400, { errors });
    }

    // In production, send an email or store in a database
    console.log('Contact form submission:', result.output);

    return { success: true };
  }
};
```

**Note:** Since we are using `adapter-static`, the form action will only work during development (when SvelteKit runs a server). For the deployed static site, you would replace the form action with a third-party service like Formspree, or switch the contact page to use `adapter-node`/`adapter-vercel` for that single route.

---

## 10. Full SEO and Open Graph

Create `src/lib/components/Seo.svelte`:

```svelte
<script lang="ts">
  interface Props {
    title: string;
    description: string;
    canonical?: string;
    ogImage?: string;
    ogType?: 'website' | 'article';
    jsonLd?: Record<string, unknown>;
  }

  let {
    title,
    description,
    canonical = '',
    ogImage = 'https://welber.dev/og-default.png',
    ogType = 'website',
    jsonLd
  }: Props = $props();

  let fullTitle = $derived(
    title.includes('Welber') ? title : `${title} — Welber Ribeiro`
  );
</script>

<svelte:head>
  <title>{fullTitle}</title>
  <meta name="description" content={description} />
  {#if canonical}
    <link rel="canonical" href={canonical} />
  {/if}

  <!-- Open Graph (Lesson 13.4) -->
  <meta property="og:title" content={fullTitle} />
  <meta property="og:description" content={description} />
  <meta property="og:type" content={ogType} />
  <meta property="og:image" content={ogImage} />
  <meta property="og:site_name" content="Welber Ribeiro" />

  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content={fullTitle} />
  <meta name="twitter:description" content={description} />
  <meta name="twitter:image" content={ogImage} />

  <!-- JSON-LD (Lesson 13.6) -->
  {#if jsonLd}
    {@html `<script type="application/ld+json">${JSON.stringify(jsonLd)}</script>`}
  {/if}
</svelte:head>
```

The homepage already uses this component. We also add Person schema for the whole site:

```svelte
<!-- In +page.svelte, the jsonLd for the homepage includes: -->
<Seo
  title="Welber Ribeiro — Full-Stack Developer"
  description="I build fast, accessible web applications with Svelte, SvelteKit, and TypeScript."
  canonical="https://welber.dev"
  jsonLd={{
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: 'Welber Ribeiro',
    url: 'https://welber.dev',
    jobTitle: 'Full-Stack Developer',
    knowsAbout: ['Svelte', 'SvelteKit', 'TypeScript', 'CSS', 'GSAP'],
    sameAs: [
      'https://github.com/welber',
      'https://linkedin.com/in/welber'
    ]
  }}
/>
```

---

## 11. i18n — English and Portuguese

We use Paraglide.js (Lesson 19.3) for internationalization with locale-aware routing.

```bash
pnpm add @inlang/paraglide-sveltekit
```

Create message files. Create `messages/en.json`:

```json
{
  "nav.about": "About",
  "nav.projects": "Projects",
  "nav.blog": "Blog",
  "nav.contact": "Contact",
  "hero.greeting": "Hello, I'm",
  "hero.tagline": "Full-stack developer building fast, accessible web applications with Svelte, SvelteKit, and TypeScript.",
  "hero.cta.work": "View my work",
  "hero.cta.contact": "Get in touch",
  "about.title": "About me",
  "about.bio1": "I'm a full-stack developer with 5+ years of experience building web applications. I specialize in Svelte and SvelteKit, and I'm passionate about performance, accessibility, and developer experience.",
  "about.bio2": "When I'm not coding, you'll find me playing drums, exploring new coffee roasters, or contributing to open-source projects.",
  "projects.title": "Projects",
  "contact.title": "Get in touch",
  "contact.name": "Name",
  "contact.email": "Email",
  "contact.subject": "Subject",
  "contact.message": "Message",
  "contact.submit": "Send message",
  "contact.sending": "Sending...",
  "contact.success.title": "Message sent!",
  "contact.success.body": "Thank you for reaching out. I'll get back to you within 24 hours.",
  "footer.copyright": "Built with SvelteKit."
}
```

Create `messages/pt.json`:

```json
{
  "nav.about": "Sobre",
  "nav.projects": "Projetos",
  "nav.blog": "Blog",
  "nav.contact": "Contato",
  "hero.greeting": "Ola, eu sou",
  "hero.tagline": "Desenvolvedor full-stack construindo aplicacoes web rapidas e acessiveis com Svelte, SvelteKit e TypeScript.",
  "hero.cta.work": "Veja meu trabalho",
  "hero.cta.contact": "Entre em contato",
  "about.title": "Sobre mim",
  "about.bio1": "Sou um desenvolvedor full-stack com mais de 5 anos de experiencia construindo aplicacoes web. Me especializo em Svelte e SvelteKit, e sou apaixonado por performance, acessibilidade e experiencia do desenvolvedor.",
  "about.bio2": "Quando nao estou programando, voce me encontra tocando bateria, explorando novos cafes especiais, ou contribuindo para projetos open-source.",
  "projects.title": "Projetos",
  "contact.title": "Entre em contato",
  "contact.name": "Nome",
  "contact.email": "Email",
  "contact.subject": "Assunto",
  "contact.message": "Mensagem",
  "contact.submit": "Enviar mensagem",
  "contact.sending": "Enviando...",
  "contact.success.title": "Mensagem enviada!",
  "contact.success.body": "Obrigado por entrar em contato. Responderei dentro de 24 horas.",
  "footer.copyright": "Construido com SvelteKit."
}
```

Add hreflang tags for SEO (Lesson 19.8 — i18n SEO):

```svelte
<!-- In the Seo component, add: -->
<link rel="alternate" hreflang="en" href="https://welber.dev/en{path}" />
<link rel="alternate" hreflang="pt" href="https://welber.dev/pt{path}" />
<link rel="alternate" hreflang="x-default" href="https://welber.dev/en{path}" />
```

Add a language switcher to the navigation:

```svelte
<div class="lang-switcher">
  <a href="/en" hreflang="en" class:active={currentLang === 'en'}>EN</a>
  <a href="/pt" hreflang="pt" class:active={currentLang === 'pt'}>PT</a>
</div>
```

---

## 12. Lighthouse 100 optimization

To achieve Lighthouse 100 on all metrics (Lesson 12.1, 13.10):

**Performance:**
- All pages are prerendered (SSG) — zero TTFB
- Images use `loading="lazy"` and `decoding="async"`
- GSAP and Threlte are client-side only (not in the critical path)
- CSS uses `@layer` to prevent specificity conflicts
- Fonts use `system-ui` — no custom font downloads

**Accessibility:**
- All interactive elements have focus styles (`:focus-visible`)
- Navigation has `aria-label`
- Images have `alt` text
- Form inputs have associated labels
- Mobile menu toggle has `aria-expanded`
- Color contrast exceeds 4.5:1 (verified via OKLCH lightness values)

**Best Practices:**
- HTTPS enforced
- No `document.write`
- No `target="_blank"` without `rel="noopener noreferrer"`

**SEO:**
- `<title>` and `<meta name="description">` on every page
- JSON-LD structured data
- Open Graph metadata
- Canonical URLs
- hreflang for i18n

The 3D Threlte scene uses a poster image fallback (Lesson 13.15):

```svelte
{#if browser}
  <HeroScene />
{:else}
  <!-- SSR fallback: poster image for crawlers and Lighthouse (Lesson 13.15) -->
  <img
    src="/hero-poster.jpg"
    alt="3D torus knot visualization"
    width={1200}
    height={800}
    class="hero-poster"
  />
{/if}
```

---

## 13. Deployment

For a fully static portfolio, deploy to any CDN:

```bash
pnpm build
# Output is in /build — all static HTML, CSS, JS
```

**Vercel:**

```bash
vercel
```

**Cloudflare Pages:**

```bash
npx wrangler pages deploy build
```

**Netlify:**

Just connect your Git repository and set build command to `pnpm build` with output directory `build`.

### File tree — final

```
dev-portfolio/
├── messages/
│   ├── en.json
│   └── pt.json
├── src/
│   ├── app.css
│   ├── app.html
│   ├── app.d.ts
│   ├── lib/
│   │   ├── components/
│   │   │   ├── ContactForm.svelte
│   │   │   ├── HeroScene.svelte
│   │   │   ├── ProjectGallery.svelte
│   │   │   └── Seo.svelte
│   │   ├── data/
│   │   │   └── posts.ts
│   │   └── utils/
│   │       └── markdown.ts
│   └── routes/
│       ├── +layout.svelte
│       ├── +layout.ts
│       ├── +page.svelte
│       ├── +page.server.ts
│       └── blog/
│           ├── +page.svelte
│           ├── +page.ts
│           └── [slug]/
│               ├── +page.svelte
│               └── +page.ts
├── svelte.config.js
├── tsconfig.json
└── package.json
```

---

## 14. Final result

You now have a complete developer portfolio with:

- **3D hero** — Threlte torus knot with Float animation and SSR-safe rendering
- **GSAP animations** — timeline entrance for hero, ScrollTrigger reveals for projects
- **Project gallery** — scroll-animated cards with alternating layouts
- **Blog** — statically generated from TypeScript data with Markdown rendering
- **Contact form** — progressive enhancement with Valibot validation
- **SEO** — Open Graph, JSON-LD Person schema, Article schema for blog posts
- **i18n** — English and Portuguese with hreflang SEO tags
- **OKLCH branding** — teal-cyan with purple accent throughout
- **Lighthouse 100** — SSG, system fonts, lazy images, accessibility

### What to test

1. Load the page and watch the GSAP hero entrance animation
2. Scroll down to see the project cards animate into view
3. Navigate to `/blog` and read a blog post
4. Submit the contact form and verify Valibot validation
5. Resize the browser to test mobile navigation
6. Run Lighthouse in DevTools to verify scores
7. View page source to confirm prerendered HTML with JSON-LD

---

## 15. What you practiced

- **PE7 CSS architecture** — @layer, OKLCH tokens, fluid clamp typography (Module 1, Lesson 1.5)
- **OKLCH color system** — perceptually uniform brand palette (Module 6, Lesson 6.2)
- **CSS Grid and Flexbox** — about section, project gallery layouts (Module 6, Lessons 6.6, 6.7)
- **Logical properties** — writing-direction-agnostic CSS (Module 6, Lesson 6.5)
- **Svelte transitions** — mobile menu appearance (Module 6, Lesson 6.11)
- **Reduced motion** — @media (prefers-reduced-motion) for GSAP (Module 6, Lesson 6.18)
- **GSAP installation** — pnpm add gsap (Module 7, Lesson 7.2)
- **gsap.fromTo()** — hero entrance animations (Module 7, Lesson 7.3)
- **GSAP timelines** — sequenced multi-element hero reveal (Module 7, Lesson 7.4)
- **bind:this** — DOM references for GSAP targets (Module 7, Lesson 7.5)
- **$effect as GSAP bridge** — triggering animations from mount (Module 7, Lesson 7.6)
- **GSAP cleanup** — killing timelines in $effect return (Module 7, Lesson 7.7)
- **Stagger animations** — project card cascade reveal (Module 7, Lesson 7.8)
- **ScrollTrigger** — scroll-driven project reveals (Module 7, Lessons 7.9, 7.10)
- **SSG with entries()** — prerendering blog post slugs (Module 9A, Lesson 9A.10)
- **Load functions** — fetching blog posts and product data (Module 9A, Lesson 9A.2)
- **Form actions** — contact form server-side handling (Module 10, Lesson 10.3)
- **use:enhance** — progressive enhancement (Module 10, Lesson 10.5)
- **Server-side validation** — Valibot schema validation (Module 10, Lesson 10.6)
- **Core Web Vitals** — LCP, CLS, INP optimization (Module 12, Lesson 12.1)
- **Image optimization** — lazy loading, decoding, fetchpriority (Module 12, Lesson 12.2)
- **Accessibility** — ARIA, keyboard nav, focus management (Module 12, Lesson 12.8)
- **<svelte:head>** — per-page meta tags (Module 13, Lesson 13.2)
- **SEO component** — reusable typed meta component (Module 13, Lesson 13.3)
- **Open Graph and Twitter Cards** — social sharing metadata (Module 13, Lesson 13.4)
- **JSON-LD** — Person and Article structured data (Module 13, Lesson 13.6)
- **3D SEO** — poster image fallback for canvas content (Module 13, Lesson 13.15)
- **Threlte Canvas** — 3D scene setup with camera and lights (Module 14, Lessons 14.1, 14.2)
- **SSR-safe 3D** — {#if browser} guard for WebGL (Module 14, Lesson 14.8)
- **Paraglide.js** — SvelteKit i18n setup (Module 19, Lesson 19.3)
- **hreflang** — i18n SEO tags (Module 19, Lesson 19.8)
