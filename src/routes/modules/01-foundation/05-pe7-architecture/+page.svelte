<script lang="ts">
	type TokenKind = 'color' | 'space' | 'radius';

	interface Token {
		name: string;
		cssVar: string;
		kind: TokenKind;
	}

	const tokens: Token[] = [
		{ name: 'brand', cssVar: '--color-brand', kind: 'color' },
		{ name: 'surface', cssVar: '--color-surface', kind: 'color' },
		{ name: 'surface-2', cssVar: '--color-surface-2', kind: 'color' },
		{ name: 'text', cssVar: '--color-text', kind: 'color' },
		{ name: 'border', cssVar: '--color-border', kind: 'color' },
		{ name: 'space-sm', cssVar: '--space-sm', kind: 'space' },
		{ name: 'space-md', cssVar: '--space-md', kind: 'space' },
		{ name: 'space-lg', cssVar: '--space-lg', kind: 'space' },
		{ name: 'radius-sm', cssVar: '--radius-sm', kind: 'radius' },
		{ name: 'radius-lg', cssVar: '--radius-lg', kind: 'radius' }
	];
</script>

<svelte:head>
	<title>Lesson 1.5 · PE7 architecture · Ultimate Frontend</title>
	<meta
		name="description"
		content="Lesson 1.5 mini-build: a visual inspector for the PE7 @layer, OKLCH and token system."
	/>
</svelte:head>

<section class="page stack">
	<nav class="crumbs" aria-label="Breadcrumb">
		<a href="/modules/01-foundation">← Module 1</a>
	</nav>

	<header>
		<p class="eyebrow">Lesson 1.5 · Mini-build</p>
		<h1>The PE7 tokens, visible</h1>
		<p class="lede">
			Six layers, OKLCH colours, fluid spacing, mobile-first. Every value below reads
			straight from <code>app.css</code> via <code>var()</code>.
		</p>
	</header>

	<ul class="tokens">
		{#each tokens as token (token.name)}
			<li class="token" data-kind={token.kind}>
				<span class="token__name">{token.name}</span>
				<span class="token__var">{token.cssVar}</span>
				<span class="token__preview" style:--token-value="var({token.cssVar})"></span>
			</li>
		{/each}
	</ul>
</section>

<style>
	section {
		--color-brand: oklch(68% 0.2 220);
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

	.tokens {
		list-style: none;
		padding: 0;
		margin: 0;
		display: grid;
		gap: var(--space-sm);

		@media (min-width: 480px) {
			grid-template-columns: repeat(2, 1fr);
		}
	}

	.token {
		display: grid;
		grid-template-columns: 1fr auto;
		align-items: center;
		gap: var(--space-sm);
		padding: var(--space-md);
		background: var(--color-surface-2);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		min-block-size: 44px;
	}

	.token__name {
		font-weight: 600;
	}

	.token__var {
		font-family: ui-monospace, monospace;
		font-size: var(--text-xs);
		color: var(--color-text-muted);
		grid-column: 1;
	}

	.token__preview {
		grid-row: 1 / 3;
		grid-column: 2;
		inline-size: 3rem;
		block-size: 3rem;
		border-radius: var(--radius-sm);
		border: 1px solid var(--color-border);
	}

	.token[data-kind='color'] .token__preview {
		background: var(--token-value);
	}

	.token[data-kind='space'] .token__preview {
		background: var(--color-brand);
		inline-size: var(--token-value);
		block-size: 1rem;
		align-self: center;
	}

	.token[data-kind='radius'] .token__preview {
		background: var(--color-brand);
		border-radius: var(--token-value);
	}
</style>
