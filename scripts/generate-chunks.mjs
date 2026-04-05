#!/usr/bin/env node
import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const chunks = [
	['component-architecture', 'Component Architecture', '3'],
	['global-token-system', 'Global PE7 Token System', '1, 6'],
	['mobile-first-layout', 'Mobile-First Layout', '6'],
	['container-queries', 'Container Queries', '6'],
	['page-routing-setup', 'Page Routing Setup', '8'],
	['ssr-hydration', 'SSR + Hydration', '8'],
	['load-function-typing', 'Typed load() Functions', '9A'],
	['remote-query-setup', 'Remote Query Setup', '9B'],
	['query-batch-pattern', 'query.batch() Pattern', '9B'],
	['form-remote-validation', 'Form Remote + Valibot', '9B, 10'],
	['gsap-timeline', 'GSAP Timeline', '7'],
	['scroll-trigger-setup', 'ScrollTrigger + SvelteKit', '7'],
	['reveal-action', 'use:revealOnScroll action', '7'],
	['tanstack-table-setup', 'TanStack Table Setup', '11'],
	['shared-state-store', 'Shared Reactive Class Store', '11'],
	['optimistic-ui-pattern', 'Optimistic UI Pattern', '11'],
	['error-boundaries', '<svelte:boundary> Error Boundaries', '12'],
	['seo-component', 'Typed SEO Component + JSON-LD', '13'],
	['sitemap-endpoint', 'Dynamic Sitemap Endpoint', '13'],
	['accessibility-audit', 'Accessibility Audit', '12']
];

const root = new URL('..', import.meta.url).pathname;
const chunksRoot = join(root, 'lessons/capstone/chunks');

for (const [id, title, module] of chunks) {
	const dir = join(chunksRoot, id);
	await mkdir(dir, { recursive: true });

	await writeFile(
		join(dir, 'brief.md'),
		`---
chunk: ${id}
title: ${title}
module: ${module}
---

# ${title} — Brief

> **TODO (capstone content pass):** describe what this chunk asks the student to build in the context of the capstone project. Include:
> - The exact files that need to exist at the end
> - The behaviours that must work
> - The acceptance criteria
> - How it connects to the rest of the capstone

This chunk tests skills from **Module ${module}**.
`,
		'utf8'
	);

	await writeFile(
		join(dir, 'hint.md'),
		`---
chunk: ${id}
level: 1
penalty: 0
---

# ${title} — Level 1 Hint (free)

> **TODO (capstone content pass):** write a short written clue that points toward the concept without revealing code. Example shape:
>
> "Think about what X gives you that Y doesn't. The answer involves …"
`,
		'utf8'
	);

	await writeFile(
		join(dir, 'concept.md'),
		`---
chunk: ${id}
level: 2
penalty: medium
---

# ${title} — Level 2 Concept Reveal

> **TODO (capstone content pass):** explain the concept in the specific context of this capstone problem. Include pseudocode if helpful, but do NOT reveal the exact code solution yet. This unlocks only after the 15-minute time gate has elapsed and the student has used (or skipped) the hint.
`,
		'utf8'
	);

	await writeFile(
		join(dir, 'code.md'),
		`---
chunk: ${id}
level: 3
penalty: high
---

# ${title} — Level 3 Code Reveal

> **TODO (capstone content pass):** the exact working code for this chunk. Nothing else. The rest of the capstone stays hidden. This unlocks only after the student has used Level 2.

\`\`\`svelte
<!-- TODO: exact code for this chunk -->
\`\`\`
`,
		'utf8'
	);
}

console.log(`Generated ${chunks.length} chunk folders.`);
