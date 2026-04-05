<script lang="ts">
	interface CourseModule {
		number: number;
		title: string;
		duration: number;
		badge?: string;
	}

	const modules: CourseModule[] = [
		{ number: 1, title: 'The Foundation', duration: 240, badge: 'Start here' },
		{ number: 2, title: 'Reactivity', duration: 260 },
		{ number: 3, title: 'Components & Props', duration: 220 },
		{ number: 4, title: 'Control Flow', duration: 200 },
		{ number: 5, title: 'Events & Interaction', duration: 220 }
	];

	function formatDuration(minutes: number): string {
		const hours = Math.floor(minutes / 60);
		const rest = minutes % 60;
		return `${hours}h ${rest}m`;
	}
</script>

<svelte:head>
	<title>Lesson 1.8 · Interfaces · Ultimate Frontend</title>
	<meta
		name="description"
		content="Lesson 1.8 mini-build: a typed list of course modules rendered from a CourseModule[] interface."
	/>
</svelte:head>

<section class="page stack">
	<nav class="crumbs" aria-label="Breadcrumb">
		<a href="/modules/01-foundation">← Module 1</a>
	</nav>

	<header>
		<p class="eyebrow">Lesson 1.8 · Mini-build</p>
		<h1>A list that cannot drift</h1>
		<p class="lede">
			Every module below conforms to the <code>CourseModule</code> interface. Delete a field
			in the script and TypeScript will refuse to compile.
		</p>
	</header>

	<ol class="modules">
		{#each modules as module (module.number)}
			<li class="module">
				<span class="module__number">M{module.number}</span>
				<div class="module__body">
					<h2 class="module__title">{module.title}</h2>
					<p class="module__duration">{formatDuration(module.duration)}</p>
				</div>
				{#if module.badge}
					<span class="module__badge">{module.badge}</span>
				{/if}
			</li>
		{/each}
	</ol>
</section>

<style>
	section {
		--color-brand: oklch(68% 0.2 180);
	}

	.crumbs {
		font-size: var(--text-sm);

		& a {
			color: var(--color-text-muted);
			text-decoration: none;

			&:hover {
				color: var(--color-brand);
			}
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

	.modules {
		list-style: none;
		padding: 0;
		margin: 0;
		display: grid;
		gap: var(--space-sm);
	}

	.module {
		display: grid;
		grid-template-columns: auto 1fr auto;
		align-items: center;
		gap: var(--space-md);
		padding: var(--space-md) var(--space-lg);
		background: var(--color-surface-2);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		min-block-size: 44px;
	}

	.module__number {
		font-family: ui-monospace, monospace;
		font-size: var(--text-sm);
		color: var(--color-brand);
		font-weight: 700;
	}

	.module__body {
		min-inline-size: 0;
	}

	.module__title {
		font-size: var(--text-base);
		font-weight: 600;
		margin: 0;
	}

	.module__duration {
		font-size: var(--text-xs);
		color: var(--color-text-muted);
		margin: 0;
	}

	.module__badge {
		font-size: var(--text-xs);
		padding: 0.2em 0.7em;
		background: var(--color-brand);
		color: oklch(15% 0.02 180);
		border-radius: var(--radius-full);
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}
</style>
