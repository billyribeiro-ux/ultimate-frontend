<script lang="ts">
	interface Lesson {
		id: string;
		number: string;
		title: string;
		href: string;
	}

	const lessons: Lesson[] = [
		{ id: '15.1', number: '15.1', title: 'What authentication is', href: '/modules/15-auth/01-what-is-auth' },
		{ id: '15.2', number: '15.2', title: 'SvelteKit hooks for auth', href: '/modules/15-auth/02-hooks-for-auth' },
		{ id: '15.3', number: '15.3', title: 'Registration', href: '/modules/15-auth/03-registration' },
		{ id: '15.4', number: '15.4', title: 'Login', href: '/modules/15-auth/04-login' },
		{ id: '15.5', number: '15.5', title: 'Protected routes', href: '/modules/15-auth/05-protected-routes' },
		{ id: '15.6', number: '15.6', title: 'Logout', href: '/modules/15-auth/06-logout' },
		{ id: '15.7', number: '15.7', title: 'OAuth basics', href: '/modules/15-auth/07-oauth-basics' },
		{ id: '15.8', number: '15.8', title: 'Auth patterns in production', href: '/modules/15-auth/08-auth-production-patterns' }
	];
</script>

<svelte:head>
	<title>Module 15 · Authentication · Ultimate Frontend</title>
	<meta
		name="description"
		content="Module 15 of Ultimate Frontend: implement production-grade authentication in SvelteKit from scratch."
	/>
</svelte:head>

<section class="page stack">
	<header>
		<p class="eyebrow">Module 15</p>
		<h1>Authentication</h1>
		<p class="lede">
			By the end of this module you will implement production-grade authentication in SvelteKit
			from scratch — registration, login, protected routes, logout, and OAuth — without magic
			auth libraries hiding the fundamentals.
		</p>
	</header>

	<section aria-labelledby="lessons-heading">
		<h2 id="lessons-heading">Lessons</h2>
		<ol class="lessons">
			{#each lessons as lesson (lesson.id)}
				<li>
					<a href={lesson.href}>
						<span class="lesson__num">{lesson.number}</span>
						<span class="lesson__title">{lesson.title}</span>
						<span class="lesson__state lesson__state--ready">Ready</span>
					</a>
				</li>
			{/each}
		</ol>
	</section>
</section>

<style>
	section.page {
		--color-brand: oklch(65% 0.2 160);
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

	.lessons {
		list-style: none;
		padding: 0;
		margin: 0;
		display: grid;
		gap: var(--space-sm);
	}

	.lessons > li > a {
		display: grid;
		grid-template-columns: auto 1fr auto;
		align-items: center;
		gap: var(--space-md);
		padding: var(--space-sm) var(--space-md);
		background: var(--color-surface-2);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		text-decoration: none;
		color: var(--color-text);
		min-block-size: 44px;
		transition: border-color var(--dur-fast) var(--ease-out);
	}

	.lessons > li > a:hover {
		border-color: var(--color-brand);
	}

	.lesson__num {
		font-family: ui-monospace, monospace;
		font-size: var(--text-sm);
		color: var(--color-brand);
	}

	.lesson__state {
		font-size: var(--text-xs);
		padding: 0.15em 0.6em;
		border-radius: var(--radius-full);
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.lesson__state--ready {
		background: var(--color-success);
		color: oklch(15% 0.02 145);
	}

	@media (prefers-reduced-motion: reduce) {
		.lessons > li > a {
			transition: none;
		}
	}
</style>
