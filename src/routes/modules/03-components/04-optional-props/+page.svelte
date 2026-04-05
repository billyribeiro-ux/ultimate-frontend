<!--
	Lesson 3.4 mini-build — A team list of avatars.
	Demonstrates optional props (`src?`, `size?`) and default values in the destructure.
	The common case is a one-attribute call; the hero avatar adds `size="lg"`.
-->
<script lang="ts">
	import Avatar from '$lib/components/Avatar.svelte';

	interface TeamMember {
		id: string;
		name: string;
		src?: string;
	}

	const team: TeamMember[] = [
		{ id: 'a', name: 'Ada Lovelace' },
		{ id: 'b', name: 'Alan Turing' },
		{ id: 'c', name: 'Grace Hopper' },
		{ id: 'd', name: 'Edsger Dijkstra' },
		{ id: 'e', name: 'Barbara Liskov' },
		{ id: 'f', name: 'Donald Knuth' }
	];
</script>

<svelte:head>
	<title>Lesson 3.4 · Optional props · Ultimate Frontend</title>
	<meta
		name="description"
		content="Lesson 3.4 mini-build: optional props and default values on the Avatar component, with an initials fallback."
	/>
</svelte:head>

<section class="page stack">
	<nav class="crumbs" aria-label="Breadcrumb">
		<a href="/modules/03-components">← Module 3</a>
	</nav>

	<header>
		<p class="eyebrow">Lesson 3.4 · Mini-build</p>
		<h1>A team without photos</h1>
		<p class="lede">
			The hero avatar is large. Every other avatar uses the default size and falls back to
			initials because <code>src</code> is optional. Notice how short the call sites are.
		</p>
	</header>

	<div class="hero">
		<Avatar name="Ada Lovelace" size="lg" />
		<div>
			<p class="hero__name">Ada Lovelace</p>
			<p class="hero__role">Team Lead</p>
		</div>
	</div>

	<ul class="team">
		{#each team as member (member.id)}
			<li>
				<Avatar name={member.name} />
				<span>{member.name}</span>
			</li>
		{/each}
	</ul>
</section>

<style>
	section {
		--color-brand: oklch(66% 0.2 320);
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

	.hero {
		display: flex;
		align-items: center;
		gap: var(--space-md);
		padding: var(--space-md);
		background: var(--color-surface-2);
		border-radius: var(--radius-lg);
	}

	.hero__name {
		font-size: var(--text-lg);
		font-weight: 700;
		margin: 0;
	}

	.hero__role {
		font-size: var(--text-sm);
		color: var(--color-text-muted);
		margin: 0;
	}

	.team {
		list-style: none;
		padding: 0;
		margin: 0;
		display: grid;
		grid-template-columns: 1fr;
		gap: var(--space-sm);

		@media (min-width: 480px) {
			grid-template-columns: 1fr 1fr;
		}

		@media (min-width: 768px) {
			grid-template-columns: 1fr 1fr 1fr;
		}

		& li {
			display: flex;
			align-items: center;
			gap: var(--space-sm);
			padding: var(--space-sm);
			background: var(--color-surface-2);
			border-radius: var(--radius-md);
			min-block-size: 44px;
		}
	}
</style>
