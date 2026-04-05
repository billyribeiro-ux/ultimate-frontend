#!/usr/bin/env node
// One-shot scaffold generator. Creates stub markdown files for every lesson in
// every module, plus module READMEs, plus capstone chunk folders. Run once,
// then delete this script (or leave it as a reference for future passes).

import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';

const root = new URL('..', import.meta.url).pathname;
const lessonsRoot = join(root, 'lessons');

/** @type {Record<string, { title: string; goal: string; lessons: [string, string][] }>} */
const modules = {
	'module-01-foundation': {
		title: 'Module 1 — The Foundation',
		goal: 'Student writes their first typed, styled, mobile-first Svelte component.',
		lessons: [
			['1.1', 'What Svelte is and why it compiles'],
			['1.2', 'Project setup with pnpm + SvelteKit 2 + TypeScript strict mode'],
			['1.3', 'The three blocks: <script lang="ts">, markup, <style>'],
			['1.4', 'TypeScript type annotations on variables'],
			['1.5', 'PE7 CSS architecture: @layer, OKLCH tokens, mobile-first baseline'],
			['1.6', 'Fluid typography and spacing with clamp()'],
			['1.7', 'Scoped <style> blocks — how Svelte\'s CSS scoping works'],
			['1.8', 'TypeScript interfaces — defining object shapes'],
			['1.9', 'Passing data into the template with {} expressions']
		]
	},
	'module-02-reactivity': {
		title: 'Module 2 — Reactivity',
		goal: 'Student understands Svelte\'s rune system and the JS data model deeply.',
		lessons: [
			['2.1', 'What state is and why it exists'],
			['2.2', '$state with primitive types'],
			['2.3', '$state with objects'],
			['2.4', '$state with arrays — JS array methods'],
			['2.5', '$state.raw() — non-deep reactive state'],
			['2.6', '$state.snapshot() — serializing reactive state'],
			['2.7', '$derived() — pure functions introduced naturally'],
			['2.8', '$derived.by() — complex derived computations'],
			['2.9', '$effect() — side effects and the JS execution model'],
			['2.10', '$effect.pre() — pre-DOM-update effects'],
			['2.11', '$effect cleanup — preventing memory leaks'],
			['2.12', 'Reactivity with CSS — dynamic styles and class bindings'],
			['2.13', 'TypeScript with reactive state']
		]
	},
	'module-03-components': {
		title: 'Module 3 — Components & Props',
		goal: 'Student builds reusable, typed components — the foundation of every real Svelte app.',
		lessons: [
			['3.1', 'What components are and why they exist'],
			['3.2', '$props() — passing data into components'],
			['3.3', 'TypeScript interfaces for props'],
			['3.4', 'Optional props and default values'],
			['3.5', '$bindable() — two-way data binding'],
			['3.6', 'Snippets — {#snippet} and {@render}'],
			['3.7', 'Passing snippets as props'],
			['3.8', 'Component composition patterns'],
			['3.9', 'CSS custom properties as the bridge'],
			['3.10', 'Responsive components with container queries']
		]
	},
	'module-04-control-flow': {
		title: 'Module 4 — Control Flow',
		goal: 'Student controls what renders, when it renders, and handles async data.',
		lessons: [
			['4.1', '{#if} — conditional rendering and JS boolean logic'],
			['4.2', '{:else if} and {:else} — multi-branch logic'],
			['4.3', '{#each} — array iteration and destructuring'],
			['4.4', '{#each} with keys — why keys matter'],
			['4.5', 'Nested {#each} — iterating nested data'],
			['4.6', '{#key} block — forcing re-renders'],
			['4.7', 'Promises and async/await — the JS async model'],
			['4.8', '{#await} — Svelte\'s built-in async handling'],
			['4.9', 'Error handling with {:catch} and try/catch'],
			['4.10', 'TypeScript with async — Promise<T> return types']
		]
	},
	'module-05-events': {
		title: 'Module 5 — Events & Interaction',
		goal: 'Student handles all user interaction patterns with fully typed events.',
		lessons: [
			['5.1', 'Event handlers in Svelte 5 (lowercase attributes)'],
			['5.2', 'JS functions deeply — parameters, return values, arrow functions'],
			['5.3', 'TypeScript event types'],
			['5.4', 'preventDefault and stopPropagation'],
			['5.5', 'Forwarding events from child to parent'],
			['5.6', 'Closures in event handlers'],
			['5.7', 'Debouncing and throttling'],
			['5.8', 'Custom events and the callback prop pattern'],
			['5.9', 'Touch events and mobile interaction patterns'],
			['5.10', 'Form accessibility and keyboard navigation']
		]
	},
	'module-06-styling': {
		title: 'Module 6 — Styling Mastery',
		goal: 'Student masters PE7 CSS architecture in full depth and Svelte\'s animation system.',
		lessons: [
			['6.1', 'PE7 @layer architecture in full depth'],
			['6.2', 'OKLCH color system in depth'],
			['6.3', 'Design token system — spacing, typography, motion, radii, shadows'],
			['6.4', 'Native CSS nesting in Svelte <style> blocks'],
			['6.5', 'Logical properties — writing-direction-agnostic CSS'],
			['6.6', 'Responsive layout patterns — CSS Grid'],
			['6.7', 'Responsive layout patterns — Flexbox'],
			['6.8', 'Container queries — component-level responsiveness'],
			['6.9', 'Per-page color personalities'],
			['6.10', 'CSS transitions with motion tokens'],
			['6.11', 'Svelte transition: directive — fade, fly, slide, scale, blur, draw'],
			['6.12', 'in: and out: — different enter and exit animations'],
			['6.13', 'animate:flip — list reordering animations'],
			['6.14', 'svelte/motion — tweened for value interpolation'],
			['6.15', 'svelte/motion — spring for physics-based motion'],
			['6.16', 'Custom transition functions'],
			['6.17', 'Transition parameters, easing, and stagger patterns'],
			['6.18', '@media (prefers-reduced-motion) — accessible animation']
		]
	},
	'module-07-gsap': {
		title: 'Module 7 — GSAP & Threlte',
		goal: 'Student learns where Svelte\'s built-in animation ceiling ends and GSAP/3D begins.',
		lessons: [
			['7.1', 'What GSAP is and when to reach for it'],
			['7.2', 'Installing GSAP with pnpm and TypeScript types'],
			['7.3', 'gsap.to(), gsap.from(), gsap.fromTo()'],
			['7.4', 'GSAP Timelines — sequencing multiple animations'],
			['7.5', 'bind:this — getting DOM element references in Svelte'],
			['7.6', '$effect as the bridge — triggering GSAP from reactive state'],
			['7.7', 'GSAP cleanup in $effect return functions'],
			['7.8', 'Stagger animations'],
			['7.9', 'ScrollTrigger — installing and configuring with SvelteKit'],
			['7.10', 'ScrollTrigger with SvelteKit navigation'],
			['7.11', 'Svelte use: actions and the attachment pattern'],
			['7.12', 'Building a scroll reveal action'],
			['7.13', 'GSAP + Svelte transitions together'],
			['7.14', 'Introducing Threlte — 3D in Svelte (WebGL, Three.js, <Canvas>)']
		]
	},
	'module-08-routing': {
		title: 'Module 8 — SvelteKit Routing & Layouts',
		goal: 'Student understands file-based routing, SSR, hydration, and SvelteKit architecture.',
		lessons: [
			['8.1', 'What SvelteKit adds to Svelte'],
			['8.2', 'What SSR actually is'],
			['8.3', 'What Hydration actually is'],
			['8.4', 'File-based routing — how files become pages'],
			['8.5', 'Nested layouts'],
			['8.6', 'Dynamic routes — [slug] and [...rest]'],
			['8.7', '$app/state — reactive page state'],
			['8.8', '$app/navigation — programmatic navigation'],
			['8.9', 'hooks.server.ts — server-side request lifecycle'],
			['8.10', 'instrumentation.server.ts — OpenTelemetry support'],
			['8.11', 'Page transitions — animating between routes'],
			['8.12', 'The four rendering modes in depth']
		]
	},
	'module-09a-load': {
		title: 'Module 9A — Data Loading (traditional load())',
		goal: 'Student masters SvelteKit\'s server-driven data layer with full TypeScript safety.',
		lessons: [
			['9A.1', 'What load functions are and why they exist'],
			['9A.2', '+page.ts vs +page.server.ts'],
			['9A.3', 'Auto-generated $types — end-to-end type safety'],
			['9A.4', 'fetch inside load — SvelteKit\'s enhanced fetch'],
			['9A.5', 'Layout data — +layout.ts and +layout.server.ts'],
			['9A.6', 'Parallel data loading'],
			['9A.7', 'depends() and invalidate() — manual cache control'],
			['9A.8', 'Error handling in load — error() and redirect()'],
			['9A.9', 'Streaming with Promise returns — progressive rendering'],
			['9A.10', 'SSG — Static Site Generation with prerender']
		]
	},
	'module-09b-remote': {
		title: 'Module 9B — Remote Functions',
		goal: 'Student learns SvelteKit\'s modern server communication paradigm.',
		lessons: [
			['9B.1', 'What Remote Functions are and why they exist'],
			['9B.2', 'query remote functions — reading data'],
			['9B.3', 'query with arguments — parameterized queries'],
			['9B.4', 'query.batch() — batching multiple server calls'],
			['9B.5', 'form remote functions — server-side form handling with Valibot'],
			['9B.6', 'File upload streaming in form remote functions'],
			['9B.7', 'command remote functions — mutations'],
			['9B.8', 'query.set() — server-driven reactive state'],
			['9B.9', 'Async SSR — await directly in components'],
			['9B.10', 'Remote functions vs load() vs +server.ts — choosing the right tool']
		]
	},
	'module-10-api-forms': {
		title: 'Module 10 — API Routes & Forms',
		goal: 'Student builds the full SvelteKit server layer.',
		lessons: [
			['10.1', '+server.ts — building API endpoints'],
			['10.2', 'TypeScript in API routes'],
			['10.3', 'Form actions — +page.server.ts and the actions export'],
			['10.4', 'Named actions — multiple forms on one page'],
			['10.5', 'use:enhance — progressive enhancement'],
			['10.6', 'Server-side validation and ActionData'],
			['10.7', 'Environment variables in SvelteKit'],
			['10.8', 'File uploads via form actions']
		]
	},
	'module-11-state': {
		title: 'Module 11 — State Management at Scale',
		goal: 'Student shares state across the component tree and application without prop drilling.',
		lessons: [
			['11.1', 'The prop drilling problem'],
			['11.2', 'Svelte context API — setContext and getContext'],
			['11.3', '.svelte.ts files — universal reactive state'],
			['11.4', 'Shared $state across pages'],
			['11.5', 'Reactive classes with runes'],
			['11.6', 'URL as state — $page.url.searchParams'],
			['11.7', 'TanStack Table — headless table logic'],
			['11.8', 'TanStack Table — sorting, filtering, pagination'],
			['11.9', 'TanStack Table with TypeScript — advanced typing'],
			['11.10', 'Optimistic UI — updating before the server responds']
		]
	},
	'module-12-performance': {
		title: 'Module 12 — Performance & Production Patterns',
		goal: 'Student builds production-ready, accessible, tested, deployed SvelteKit applications.',
		lessons: [
			['12.1', 'Performance fundamentals — Core Web Vitals (LCP, CLS, INP)'],
			['12.2', 'Image optimization'],
			['12.3', 'Code splitting and lazy loading'],
			['12.4', '$effect performance — avoiding unnecessary re-runs'],
			['12.5', 'Memoization with $derived'],
			['12.6', 'Reusable Svelte actions — use:'],
			['12.7', 'Error boundaries — <svelte:boundary>'],
			['12.8', 'Accessibility — ARIA, keyboard navigation, focus management'],
			['12.9', 'Testing with Vitest — unit testing'],
			['12.10', 'E2E testing with Playwright'],
			['12.11', 'Deployment — adapters and platforms'],
			['12.12', '3D Performance with Threlte — lazy canvas, DPR, frameloop="demand"']
		]
	},
	'module-13-seo': {
		title: 'Module 13 — SEO',
		goal: 'Student builds SEO-optimized SvelteKit applications aligned with April 2026 Google updates.',
		lessons: [
			['13.1', 'Why SvelteKit is already an SEO advantage'],
			['13.2', '<svelte:head> — the foundation'],
			['13.3', 'Building a reusable typed SEO component'],
			['13.4', 'Open Graph & Twitter Cards — social sharing'],
			['13.5', 'SEO data from load() functions'],
			['13.6', 'JSON-LD Structured Data — rich results'],
			['13.7', 'E-E-A-T signals in markup'],
			['13.8', 'Dynamic Sitemap generation'],
			['13.9', 'Robots.txt'],
			['13.10', 'Core Web Vitals optimization in SvelteKit'],
			['13.11', 'Prerendering for SEO'],
			['13.12', 'AI Search Optimization (AEO/GEO)'],
			['13.13', 'Trailing slashes, redirects, canonical issues'],
			['13.14', 'Google Search Console integration'],
			['13.15', '3D & SEO — invisible canvas content and LCP fixes']
		]
	}
};

const lessonStub = (num, title, moduleTitle) => `---
module: ${moduleTitle}
lesson: ${num}
title: ${title.replace(/"/g, '\\"')}
status: stub
---

# Lesson ${num} — ${title}

> **TODO (content pass):** write this lesson using the atomic lesson format defined in \`TEMPLATE-lesson.md\`:
> 1. Learning objectives
> 2. Prerequisites
> 3. **Concept** — university-level explanation in plain English (~800–1200 words)
> 4. **Style it** — PE7 styling applied to the mini-build
> 5. **Interact** — the JS/TS concept introduced through a real UI problem
> 6. **Mini-build** — complete working code that runs in \`pnpm dev\`
> 7. Check-your-understanding questions (5)
> 8. Common mistakes (3–4)
> 9. What's next

**April 2026 syntax note:** ensure every example uses current runes and APIs. No \`export let\`, no \`<script>\` without \`lang="ts"\`, no \`on:click\` (use \`onclick\`), no \`createEventDispatcher\` (use callback props).
`;

const moduleReadme = (slug, info) => {
	const filename1_1 = slug === 'module-01-foundation' ? 'lesson-1.1-what-is-svelte.md' : null;
	const lessonList = info.lessons
		.map(([num, title]) => {
			const filename = `lesson-${num.toLowerCase()}-${slugify(title)}.md`;
			const link =
				filename1_1 && num === '1.1'
					? `[Lesson ${num} — ${title}](./${filename1_1}) ✅ ready`
					: `[Lesson ${num} — ${title}](./${filename}) — stub`;
			return `- ${link}`;
		})
		.join('\n');

	return `# ${info.title}

**Goal:** ${info.goal}

## Lessons

${lessonList}

## Module project

See \`module-project.md\` (stub) — produced in a later content pass.
`;
};

function slugify(s) {
	return s
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '')
		.slice(0, 60);
}

async function writeFileP(path, content) {
	await mkdir(dirname(path), { recursive: true });
	await writeFile(path, content, 'utf8');
}

for (const [slug, info] of Object.entries(modules)) {
	const moduleDir = join(lessonsRoot, slug);

	// README
	await writeFileP(join(moduleDir, 'README.md'), moduleReadme(slug, info));

	// module-project stub
	await writeFileP(
		join(moduleDir, 'module-project.md'),
		`# ${info.title} — Module Project\n\n> **TODO (content pass):** brief and full spec.\n`
	);

	// Lesson stubs
	for (const [num, title] of info.lessons) {
		// Skip 1.1 — already fully written
		if (slug === 'module-01-foundation' && num === '1.1') continue;
		const filename = `lesson-${num.toLowerCase()}-${slugify(title)}.md`;
		await writeFileP(join(moduleDir, filename), lessonStub(num, title, info.title));
	}
}

console.log('Stub generation complete.');
