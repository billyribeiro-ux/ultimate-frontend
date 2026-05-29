<script lang="ts">
	const nodeVersion: string = '22';
	const packageManager: string = 'pnpm';
	const typescriptStrict: boolean = true;
	const sveltekitVersion: string = '2.55+';
</script>

<svelte:head>
	<title>Lesson 1.2 · Project setup · Ultimate Frontend</title>
	<meta
		name="description"
		content="Lesson 1.2 mini-build: a checklist confirming your pnpm + SvelteKit 2 + TypeScript strict toolchain works."
	/>
</svelte:head>

<section class="page stack">
	<nav class="crumbs" aria-label="Breadcrumb">
		<a href="/modules/01-foundation">← Module 1</a>
	</nav>

	<header>
		<p class="eyebrow">Lesson 1.2 · Mini-build</p>
		<h1>Your toolchain is working</h1>
		<p class="lede">
			If this page is rendering, every piece of the May 2026 Svelte stack is installed,
			compiled, and served correctly on your machine.
		</p>
	</header>

	<ul class="checks">
		<li>
			<span class="checks__label">Node</span>
			<span class="checks__value">{nodeVersion}+</span>
		</li>
		<li>
			<span class="checks__label">Package manager</span>
			<span class="checks__value">{packageManager}</span>
		</li>
		<li>
			<span class="checks__label">SvelteKit</span>
			<span class="checks__value">{sveltekitVersion}</span>
		</li>
		<li>
			<span class="checks__label">TypeScript strict</span>
			<span class="checks__value">{typescriptStrict ? 'on' : 'off'}</span>
		</li>
	</ul>
</section>

<style>
	section {
		--color-brand: oklch(70% 0.18 150);
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

	.checks {
		list-style: none;
		padding: 0;
		margin: 0;
		display: grid;
		gap: var(--space-sm);
	}

	.checks li {
		display: grid;
		grid-template-columns: 1fr auto;
		align-items: center;
		gap: var(--space-md);
		padding-block: var(--space-sm);
		padding-inline: var(--space-md);
		background: var(--color-surface-2);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		min-block-size: 44px;

		@media (min-width: 480px) {
			grid-template-columns: 16rem 1fr;
		}
	}

	.checks__label {
		font-size: var(--text-sm);
		color: var(--color-text-muted);
		text-transform: uppercase;
		letter-spacing: 0.06em;
	}

	.checks__value {
		font-size: var(--text-base);
		font-weight: 600;
		color: var(--color-brand);
		font-family: ui-monospace, monospace;
	}
</style>
