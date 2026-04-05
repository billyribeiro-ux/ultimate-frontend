<!--
    Lesson 5.7 — Debouncing and throttling, from scratch.
-->
<script lang="ts">
	type AnyFn = (...args: never[]) => void;

	function debounce<F extends AnyFn>(fn: F, delay: number): F {
		let timer: ReturnType<typeof setTimeout> | undefined;
		return ((...args: Parameters<F>): void => {
			if (timer !== undefined) clearTimeout(timer);
			timer = setTimeout(() => fn(...args), delay);
		}) as F;
	}

	function throttle<F extends AnyFn>(fn: F, delay: number): F {
		let lastRun: number = 0;
		return ((...args: Parameters<F>): void => {
			const now: number = Date.now();
			if (now - lastRun >= delay) {
				lastRun = now;
				fn(...args);
			}
		}) as F;
	}

	let query: string = $state('');
	let searchRuns: number = $state(0);
	let searchResult: string = $state('(no search yet)');

	let pointerUpdates: number = $state(0);
	let pointerX: number = $state(0);
	let pointerY: number = $state(0);
	let rawPointerEvents: number = $state(0);

	const sendQuery = debounce((q: string): void => {
		searchRuns += 1;
		searchResult = q === '' ? '(empty query)' : `pretend results for "${q}"`;
	}, 300);

	function onSearchInput(event: Event): void {
		const target = event.target as HTMLInputElement;
		query = target.value;
		sendQuery(query);
	}

	const updatePointer = throttle((x: number, y: number): void => {
		pointerUpdates += 1;
		pointerX = x;
		pointerY = y;
	}, 100);

	function onPointerMove(event: PointerEvent): void {
		rawPointerEvents += 1;
		const target = event.currentTarget as HTMLElement;
		const rect = target.getBoundingClientRect();
		updatePointer(Math.round(event.clientX - rect.left), Math.round(event.clientY - rect.top));
	}
</script>

<svelte:head>
	<title>Lesson 5.7 · Debounce & throttle · Ultimate Frontend</title>
	<meta
		name="description"
		content="Mini-build for Lesson 5.7: debounce and throttle built from scratch using closures and setTimeout."
	/>
</svelte:head>

<section class="page stack">
	<nav class="crumbs" aria-label="Breadcrumb">
		<a href="/modules/05-events">← Module 5</a>
	</nav>

	<header>
		<p class="eyebrow">Lesson 5.7 · Mini-build</p>
		<h1>Debounce and throttle, from scratch</h1>
		<p class="lede">
			Two closures, two setTimeouts, zero libraries. Every framework reinvents these; you only
			need to write them once.
		</p>
	</header>

	<article class="demo">
		<h2>Debounced search (300&nbsp;ms)</h2>
		<label class="field">
			<span>Search</span>
			<input type="text" placeholder="type svelte..." oninput={onSearchInput} value={query} />
		</label>
		<p>Requests sent: <strong>{searchRuns}</strong></p>
		<p>Last result: <code>{searchResult}</code></p>
	</article>

	<article class="demo">
		<h2>Throttled pointer (100&nbsp;ms)</h2>
		<div
			class="pad"
			role="presentation"
			onpointermove={onPointerMove}
		>
			Move your pointer inside this box
		</div>
		<p>Raw pointermove events: <strong>{rawPointerEvents}</strong></p>
		<p>Throttled updates: <strong>{pointerUpdates}</strong></p>
		<p>Last position: <code>x={pointerX}, y={pointerY}</code></p>
	</article>
</section>

<style>
	section {
		--color-brand: oklch(70% 0.2 90);
	}

	.crumbs {
		font-size: var(--text-sm);

		& a {
			color: var(--color-text-muted);
			text-decoration: none;
		}
	}

	.eyebrow {
		font-size: var(--text-sm);
		color: var(--color-brand);
		text-transform: uppercase;
		letter-spacing: 0.08em;
	}

	.lede {
		font-size: var(--text-lg);
		color: var(--color-text-muted);
		max-inline-size: 60ch;
	}

	.demo {
		padding: var(--space-md);
		background: var(--color-surface-2);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);

		& h2 {
			font-size: var(--text-lg);
			color: var(--color-brand);
			margin: 0 0 var(--space-sm);
		}

		& p {
			margin: var(--space-xs) 0;
		}
	}

	.field {
		display: grid;
		gap: var(--space-xs);
		margin-block-end: var(--space-sm);

		& span {
			font-size: var(--text-sm);
			color: var(--color-text-muted);
		}

		& input {
			min-block-size: 44px;
			padding-inline: var(--space-sm);
			border: 1px solid var(--color-border);
			border-radius: var(--radius-md);
			background: var(--color-surface);
			color: var(--color-text);
		}

		& input:focus-visible {
			outline: 2px solid var(--color-brand);
			outline-offset: 2px;
		}
	}

	.pad {
		display: grid;
		place-items: center;
		min-block-size: 12rem;
		padding: var(--space-md);
		margin-block-end: var(--space-sm);
		background: var(--color-surface);
		border: 2px dashed var(--color-border);
		border-radius: var(--radius-md);
		color: var(--color-text-muted);
		touch-action: none;
	}
</style>
