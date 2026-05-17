---
chunk: accessibility-audit
level: 3
penalty: high
---

# Accessibility Audit — Level 3 Code Reveal

**`src/lib/components/SkipLink.svelte`**

```svelte
<script lang="ts">
	function skipToMain(): void {
		const main = document.getElementById('main-content');
		if (main) {
			main.focus();
		}
	}
</script>

<a class="skip-link" href="#main-content" onclick={skipToMain}>
	Skip to main content
</a>

<style>
	.skip-link {
		position: fixed;
		inset-block-start: var(--space-sm);
		inset-inline-start: var(--space-sm);
		z-index: 9999;
		padding: var(--space-sm) var(--space-md);
		background: var(--color-brand);
		color: oklch(98% 0.01 0);
		border-radius: var(--radius-md);
		font-weight: 600;
		text-decoration: none;
		transform: translateY(-200%);
		transition: transform var(--dur-fast) var(--ease-out);
	}

	.skip-link:focus-visible {
		transform: translateY(0);
	}
</style>
```

**`src/lib/utils/focus-trap.svelte.ts`**

```ts
const FOCUSABLE =
	'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export class FocusTrap {
	#container: HTMLElement | undefined = $state();
	#trigger: HTMLElement | undefined = $state();

	open(container: HTMLElement, trigger: HTMLElement): void {
		this.#container = container;
		this.#trigger = trigger;
		const first = container.querySelector<HTMLElement>(FOCUSABLE);
		first?.focus();
		container.addEventListener('keydown', this.#handleKeydown);
	}

	close(): void {
		this.#container?.removeEventListener('keydown', this.#handleKeydown);
		this.#trigger?.focus();
		this.#container = undefined;
		this.#trigger = undefined;
	}

	#handleKeydown = (e: KeyboardEvent): void => {
		if (e.key === 'Escape') {
			this.close();
			return;
		}
		if (e.key !== 'Tab' || !this.#container) return;

		const focusable = [...this.#container.querySelectorAll<HTMLElement>(FOCUSABLE)];
		if (focusable.length === 0) return;

		const first = focusable[0];
		const last = focusable[focusable.length - 1];

		if (e.shiftKey && document.activeElement === first) {
			e.preventDefault();
			last.focus();
		} else if (!e.shiftKey && document.activeElement === last) {
			e.preventDefault();
			first.focus();
		}
	};
}
```

**`src/routes/+layout.svelte`** (relevant additions)

```svelte
<script lang="ts">
	import SkipLink from '$lib/components/SkipLink.svelte';
	import { page } from '$app/state';
	import type { Snippet } from 'svelte';

	let { children }: { children: Snippet } = $props();
</script>

<SkipLink />

<nav aria-label="Main navigation">
	<ul>
		<li><a href="/" aria-current={page.url.pathname === '/' ? 'page' : undefined}>Home</a></li>
		<li><a href="/dashboard" aria-current={page.url.pathname.startsWith('/dashboard') ? 'page' : undefined}>Dashboard</a></li>
		<li><a href="/contact" aria-current={page.url.pathname === '/contact' ? 'page' : undefined}>Contact</a></li>
	</ul>
</nav>

<main id="main-content" tabindex="-1">
	{@render children()}
</main>
```

**`src/lib/components/TableStatus.svelte`** (live region for the data table)

```svelte
<script lang="ts">
	let { visibleCount, totalCount }: { visibleCount: number; totalCount: number } = $props();

	const announcement = $derived(
		`Showing ${visibleCount} of ${totalCount} row${totalCount === 1 ? '' : 's'}`
	);
</script>

<p aria-live="polite" aria-atomic="true" class="sr-only">
	{announcement}
</p>

<style>
	.sr-only {
		position: absolute;
		width: 1px;
		height: 1px;
		padding: 0;
		margin: -1px;
		overflow: hidden;
		clip: rect(0, 0, 0, 0);
		white-space: nowrap;
		border: 0;
	}
</style>
```
