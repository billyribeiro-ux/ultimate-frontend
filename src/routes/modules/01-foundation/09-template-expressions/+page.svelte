<script lang="ts">
	type Tier = 'free' | 'pro' | 'enterprise';

	interface User {
		name: string;
		email: string;
		tier: Tier;
		loginsThisWeek: number;
	}

	const user: User = {
		name: 'Ada Lovelace',
		email: 'ada@example.org',
		tier: 'pro',
		loginsThisWeek: 14
	};

	const tierColors: Record<Tier, string> = {
		free: 'oklch(70% 0.02 270)',
		pro: 'oklch(68% 0.2 300)',
		enterprise: 'oklch(60% 0.22 30)'
	};

	const tierLabels: Record<Tier, string> = {
		free: 'Free',
		pro: 'Pro member',
		enterprise: 'Enterprise'
	};

	const isPro: boolean = user.tier === 'pro';
</script>

<svelte:head>
	<title>Lesson 1.9 · Template expressions · Ultimate Frontend</title>
	<meta
		name="description"
		content="Lesson 1.9 mini-build: a user card that uses expressions, class:, style:, and style:-- directives."
	/>
</svelte:head>

<section class="page stack">
	<nav class="crumbs" aria-label="Breadcrumb">
		<a href="/modules/01-foundation">← Module 1</a>
	</nav>

	<header>
		<p class="eyebrow">Lesson 1.9 · Mini-build</p>
		<h1>One typed object, many template forms</h1>
		<p class="lede">
			Text interpolation, ternary, conditional class, dynamic style, and a CSS custom
			property — all reading from a single <code>User</code> object.
		</p>
	</header>

	<article
		class="card"
		class:card--pro={isPro}
		style:border-color={tierColors[user.tier]}
		style:--accent={tierColors[user.tier]}
	>
		<header class="card__header">
			<h2 class="card__name">{user.name}</h2>
			<p class="card__email">{user.email}</p>
		</header>

		<dl class="card__stats">
			<dt>Tier</dt>
			<dd>{tierLabels[user.tier]}</dd>
			<dt>Logins this week</dt>
			<dd>{user.loginsThisWeek}</dd>
			<dt>Status</dt>
			<dd>{user.loginsThisWeek > 5 ? 'Active' : 'Quiet'}</dd>
		</dl>
	</article>
</section>

<style>
	section {
		--color-brand: oklch(70% 0.2 300);
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

	.card {
		padding: var(--space-lg);
		background: linear-gradient(135deg, var(--color-surface-2), oklch(from var(--accent) 95% 0.05 h));
		border: 2px solid var(--color-border);
		border-radius: var(--radius-lg);
		box-shadow: var(--shadow-md);
	}

	.card--pro {
		outline: 2px solid var(--accent);
		outline-offset: 4px;
	}

	.card__header {
		margin-block-end: var(--space-md);
	}

	.card__name {
		font-size: var(--text-xl);
		color: var(--accent);
		margin: 0;
	}

	.card__email {
		font-size: var(--text-sm);
		color: var(--color-text-muted);
		margin: 0;
	}

	.card__stats {
		display: grid;
		grid-template-columns: 1fr;
		gap: var(--space-xs);
		margin: 0;

		@media (min-width: 480px) {
			grid-template-columns: 14rem 1fr;
			gap: var(--space-xs) var(--space-md);
		}
	}

	.card__stats dt {
		font-size: var(--text-sm);
		color: var(--color-text-muted);
		text-transform: uppercase;
		letter-spacing: 0.06em;
	}

	.card__stats dd {
		margin: 0;
		font-weight: 600;
	}
</style>
