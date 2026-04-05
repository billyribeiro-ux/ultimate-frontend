<!--
	Lesson 4.1 mini-build — {#if} conditional rendering.
	A banner appears when `isSignedIn` is false and is removed from the DOM (not
	hidden) when it flips to true. Watch the Elements panel to see the node
	appear and disappear.
-->
<script lang="ts">
	let isSignedIn: boolean = $state(false);

	function toggle(): void {
		isSignedIn = !isSignedIn;
	}
</script>

<svelte:head>
	<title>Lesson 4.1 · if block · Ultimate Frontend</title>
	<meta
		name="description"
		content="Lesson 4.1 mini-build: conditional rendering with Svelte's #if block and JavaScript truthiness rules."
	/>
</svelte:head>

<section class="page stack">
	<nav class="crumbs" aria-label="Breadcrumb">
		<a href="/modules/04-control-flow">← Module 4</a>
	</nav>

	<header>
		<p class="eyebrow">Lesson 4.1 · Mini-build</p>
		<h1>A banner that exists only when it should</h1>
		<p class="lede">
			Click the button to flip <code>isSignedIn</code>. When it is <code>false</code>, the
			banner exists in the DOM. When it is <code>true</code>, the banner is gone — not
			hidden.
		</p>
	</header>

	<button type="button" class="btn" onclick={toggle}>
		{isSignedIn ? 'Sign out' : 'Sign in'}
	</button>

	{#if !isSignedIn}
		<aside class="banner" aria-live="polite">
			<p><strong>Welcome, guest.</strong> Sign in to save your progress.</p>
		</aside>
	{/if}

	<article class="content">
		<h2>Main content</h2>
		<p>
			The content below stays put. When the banner disappears, the layout reflows because the
			node is truly removed.
		</p>
	</article>
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
		color: var(--color-text-muted);
		max-inline-size: 60ch;
	}

	.btn {
		align-self: flex-start;
		min-block-size: 44px;
		padding-inline: var(--space-md);
		background: var(--color-brand);
		color: oklch(99% 0 0);
		border-radius: var(--radius-md);
		font-weight: 600;
	}

	.banner {
		padding: var(--space-md);
		background: var(--color-surface-2);
		border-inline-start: 4px solid var(--color-brand);
		border-radius: var(--radius-md);
	}

	.banner p {
		margin: 0;
	}

	.content {
		padding: var(--space-md);
		background: var(--color-surface-2);
		border-radius: var(--radius-md);
	}
</style>
