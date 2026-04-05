/**
 * Capstone Chunk Registry
 * ------------------------------------------------------------------
 * The capstone is a single production-grade SvelteKit application.
 * It is pre-divided into the 20 chunks below so that a student who
 * gets stuck on one piece can request a progressive reveal (hint →
 * concept → code) without abandoning the rest of the project.
 *
 * Reveal rules:
 *   - A student must spend at least `minMinutesBeforeReveal` actively
 *     working on a chunk before concept or code reveals unlock.
 *   - Level 1 (hint) is free and does not reduce the score.
 *   - Level 2 (concept) reduces the score for that chunk.
 *   - Level 3 (code) reduces the score further but the student still
 *     receives credit for completing the chunk.
 *
 * This file is the single source of truth for the reveal UI and the
 * score tracker described in `lessons/capstone/platform-spec.md`.
 */

export interface ChunkScoring {
	/** Solved independently — full credit. */
	independent: number;
	/** Used Level 1 hint — still full credit. */
	hint: number;
	/** Used Level 2 concept reveal — partial credit. */
	concept: number;
	/** Used Level 3 code reveal — reduced credit but still counted. */
	code: number;
}

export interface CapstoneChunk {
	id: string;
	title: string;
	module: string; // which course module this chunk tests
	skillArea: string;
	/** Minimum minutes of active work before Level 2/3 unlocks. */
	minMinutesBeforeReveal: number;
	scoring: ChunkScoring;
}

const DEFAULT_SCORING: ChunkScoring = {
	independent: 100,
	hint: 100,
	concept: 70,
	code: 40
};

const GATE_MINUTES = 15;

export const chunks: readonly CapstoneChunk[] = [
	{
		id: 'component-architecture',
		title: 'Component Architecture',
		module: '3',
		skillArea: 'Component composition',
		minMinutesBeforeReveal: GATE_MINUTES,
		scoring: DEFAULT_SCORING
	},
	{
		id: 'global-token-system',
		title: 'Global PE7 Token System',
		module: '1, 6',
		skillArea: 'PE7 tokens and @layer architecture',
		minMinutesBeforeReveal: GATE_MINUTES,
		scoring: DEFAULT_SCORING
	},
	{
		id: 'mobile-first-layout',
		title: 'Mobile-First Layout',
		module: '6',
		skillArea: 'Responsive layout',
		minMinutesBeforeReveal: GATE_MINUTES,
		scoring: DEFAULT_SCORING
	},
	{
		id: 'container-queries',
		title: 'Container Queries',
		module: '6',
		skillArea: 'Component-level responsiveness',
		minMinutesBeforeReveal: GATE_MINUTES,
		scoring: DEFAULT_SCORING
	},
	{
		id: 'page-routing-setup',
		title: 'Page Routing Setup',
		module: '8',
		skillArea: 'File-based routing',
		minMinutesBeforeReveal: GATE_MINUTES,
		scoring: DEFAULT_SCORING
	},
	{
		id: 'ssr-hydration',
		title: 'SSR + Hydration',
		module: '8',
		skillArea: 'Rendering model',
		minMinutesBeforeReveal: GATE_MINUTES,
		scoring: DEFAULT_SCORING
	},
	{
		id: 'load-function-typing',
		title: 'Typed load() Functions',
		module: '9A',
		skillArea: 'Auto-generated $types',
		minMinutesBeforeReveal: GATE_MINUTES,
		scoring: DEFAULT_SCORING
	},
	{
		id: 'remote-query-setup',
		title: 'Remote Query Setup',
		module: '9B',
		skillArea: 'query from $app/server',
		minMinutesBeforeReveal: GATE_MINUTES,
		scoring: DEFAULT_SCORING
	},
	{
		id: 'query-batch-pattern',
		title: 'query.batch() Pattern',
		module: '9B',
		skillArea: 'Batched server calls',
		minMinutesBeforeReveal: GATE_MINUTES,
		scoring: DEFAULT_SCORING
	},
	{
		id: 'form-remote-validation',
		title: 'Form Remote + Valibot',
		module: '9B, 10',
		skillArea: 'Server-side form validation',
		minMinutesBeforeReveal: GATE_MINUTES,
		scoring: DEFAULT_SCORING
	},
	{
		id: 'gsap-timeline',
		title: 'GSAP Timeline',
		module: '7',
		skillArea: 'Timeline sequencing',
		minMinutesBeforeReveal: GATE_MINUTES,
		scoring: DEFAULT_SCORING
	},
	{
		id: 'scroll-trigger-setup',
		title: 'ScrollTrigger + SvelteKit',
		module: '7',
		skillArea: 'Scroll-driven animation with navigation-safe cleanup',
		minMinutesBeforeReveal: GATE_MINUTES,
		scoring: DEFAULT_SCORING
	},
	{
		id: 'reveal-action',
		title: 'use:revealOnScroll action',
		module: '7',
		skillArea: 'Reusable Svelte actions',
		minMinutesBeforeReveal: GATE_MINUTES,
		scoring: DEFAULT_SCORING
	},
	{
		id: 'tanstack-table-setup',
		title: 'TanStack Table Setup',
		module: '11',
		skillArea: 'Headless table logic',
		minMinutesBeforeReveal: GATE_MINUTES,
		scoring: DEFAULT_SCORING
	},
	{
		id: 'shared-state-store',
		title: 'Shared Reactive Class Store',
		module: '11',
		skillArea: '.svelte.ts reactive classes',
		minMinutesBeforeReveal: GATE_MINUTES,
		scoring: DEFAULT_SCORING
	},
	{
		id: 'optimistic-ui-pattern',
		title: 'Optimistic UI Pattern',
		module: '11',
		skillArea: 'Optimistic updates with rollback',
		minMinutesBeforeReveal: GATE_MINUTES,
		scoring: DEFAULT_SCORING
	},
	{
		id: 'error-boundaries',
		title: '<svelte:boundary> Error Boundaries',
		module: '12',
		skillArea: 'Scoped error recovery',
		minMinutesBeforeReveal: GATE_MINUTES,
		scoring: DEFAULT_SCORING
	},
	{
		id: 'seo-component',
		title: 'Typed SEO Component + JSON-LD',
		module: '13',
		skillArea: 'Structured data and Open Graph',
		minMinutesBeforeReveal: GATE_MINUTES,
		scoring: DEFAULT_SCORING
	},
	{
		id: 'sitemap-endpoint',
		title: 'Dynamic Sitemap Endpoint',
		module: '13',
		skillArea: '+server.ts XML response',
		minMinutesBeforeReveal: GATE_MINUTES,
		scoring: DEFAULT_SCORING
	},
	{
		id: 'accessibility-audit',
		title: 'Accessibility Audit',
		module: '12',
		skillArea: 'ARIA, keyboard nav, focus management',
		minMinutesBeforeReveal: GATE_MINUTES,
		scoring: DEFAULT_SCORING
	}
] as const;

export const CHUNK_COUNT = chunks.length; // should be 20

export function getChunk(id: string): CapstoneChunk | undefined {
	return chunks.find((c) => c.id === id);
}
