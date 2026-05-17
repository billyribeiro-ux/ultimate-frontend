<script lang="ts">
	// Mirror of the home page module list; kept separate so this URL can be
	// deep-linked and indexed independently.
	interface ModuleSummary {
		id: string;
		number: string;
		title: string;
		href: string;
	}

	const modules: ModuleSummary[] = [
		{ id: '01', number: '1', title: 'The Foundation', href: '/modules/01-foundation' },
		{ id: '02', number: '2', title: 'Reactivity', href: '/modules/02-reactivity' },
		{ id: '03', number: '3', title: 'Components & Props', href: '/modules/03-components' },
		{ id: '04', number: '4', title: 'Control Flow', href: '/modules/04-control-flow' },
		{ id: '05', number: '5', title: 'Events & Interaction', href: '/modules/05-events' },
		{ id: '06', number: '6', title: 'Styling Mastery', href: '/modules/06-styling' },
		{ id: '07', number: '7', title: 'GSAP & Threlte', href: '/modules/07-gsap' },
		{ id: '08', number: '8', title: 'Routing & Layouts', href: '/modules/08-routing' },
		{ id: '09a', number: '9A', title: 'Data Loading (load)', href: '/modules/09a-load' },
		{ id: '09b', number: '9B', title: 'Remote Functions', href: '/modules/09b-remote' },
		{ id: '10', number: '10', title: 'API Routes & Forms', href: '/modules/10-api-forms' },
		{ id: '11', number: '11', title: 'State at Scale', href: '/modules/11-state' },
		{ id: '12', number: '12', title: 'Performance & Production', href: '/modules/12-performance' },
		{ id: '13', number: '13', title: 'SEO', href: '/modules/13-seo' },
		{ id: '14', number: '14', title: '3D with Threlte', href: '/modules/14-threlte' }
	];
</script>

<svelte:head>
	<title>Modules · Ultimate Frontend</title>
</svelte:head>

<section class="page stack">
	<h1>Modules</h1>
	<ol class="module-list">
		{#each modules as m (m.id)}
			<li>
				<a href={m.href}>
					<span class="tag">M{m.number}</span>
					{m.title}
				</a>
			</li>
		{/each}
	</ol>
</section>

<style>
	.module-list {
		list-style: none;
		padding: 0;
		margin: 0;
		display: grid;
		gap: var(--space-sm);
	}

	.module-list a {
		display: flex;
		align-items: center;
		gap: var(--space-sm);
		padding: var(--space-sm) var(--space-md);
		background: var(--color-surface-2);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		text-decoration: none;
		color: var(--color-text);
		min-block-size: 44px;
	}

	.tag {
		font-size: var(--text-xs);
		font-weight: 700;
		color: var(--color-brand);
		letter-spacing: 0.08em;
	}
</style>
