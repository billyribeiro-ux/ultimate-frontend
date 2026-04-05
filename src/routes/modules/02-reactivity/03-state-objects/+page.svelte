<script lang="ts">
	type Theme = 'light' | 'dark';

	interface Profile {
		name: string;
		email: string;
		theme: Theme;
		notifications: {
			emailAlerts: boolean;
			smsAlerts: boolean;
		};
	}

	const profile: Profile = $state({
		name: 'Ada Lovelace',
		email: 'ada@example.org',
		theme: 'dark',
		notifications: {
			emailAlerts: true,
			smsAlerts: false
		}
	});

	function toggleTheme(): void {
		profile.theme = profile.theme === 'dark' ? 'light' : 'dark';
	}
</script>

<svelte:head>
	<title>Lesson 2.3 · $state objects · Ultimate Frontend</title>
	<meta
		name="description"
		content="Lesson 2.3 mini-build: a settings panel driven by one deep reactive state object."
	/>
</svelte:head>

<section class="page stack" data-theme={profile.theme}>
	<nav class="crumbs" aria-label="Breadcrumb">
		<a href="/modules/02-reactivity">← Module 2</a>
	</nav>

	<header>
		<p class="eyebrow">Lesson 2.3 · Mini-build</p>
		<h1>Deep reactive profile</h1>
		<p class="lede">
			Every input below binds to a property of a single <code>$state</code> object.
			Nested fields update without any reassignment.
		</p>
	</header>

	<form class="panel" onsubmit={(e) => e.preventDefault()}>
		<label class="field">
			<span>Name</span>
			<input type="text" bind:value={profile.name} />
		</label>

		<label class="field">
			<span>Email</span>
			<input type="email" bind:value={profile.email} />
		</label>

		<label class="field field--inline">
			<input type="checkbox" bind:checked={profile.notifications.emailAlerts} />
			<span>Email alerts</span>
		</label>

		<label class="field field--inline">
			<input type="checkbox" bind:checked={profile.notifications.smsAlerts} />
			<span>SMS alerts</span>
		</label>

		<button type="button" onclick={toggleTheme} class="theme-btn">
			Theme: {profile.theme}
		</button>
	</form>

	<aside class="preview">
		<h2>Live preview</h2>
		<dl>
			<dt>Name</dt>
			<dd>{profile.name}</dd>
			<dt>Email</dt>
			<dd>{profile.email}</dd>
			<dt>Email alerts</dt>
			<dd>{profile.notifications.emailAlerts ? 'On' : 'Off'}</dd>
			<dt>SMS alerts</dt>
			<dd>{profile.notifications.smsAlerts ? 'On' : 'Off'}</dd>
		</dl>
	</aside>
</section>

<style>
	section {
		--color-brand: oklch(70% 0.2 200);
	}

	section[data-theme='dark'] {
		--color-brand: oklch(72% 0.22 260);
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

	.panel {
		display: grid;
		gap: var(--space-md);
		padding: var(--space-lg);
		background: var(--color-surface-2);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-lg);
	}

	.field {
		display: grid;
		gap: var(--space-xs);
	}

	.field span {
		font-size: var(--text-sm);
		color: var(--color-text-muted);
		text-transform: uppercase;
		letter-spacing: 0.06em;
	}

	.field input[type='text'],
	.field input[type='email'] {
		padding-block: var(--space-sm);
		padding-inline: var(--space-md);
		background: var(--color-surface);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		min-block-size: 44px;
	}

	.field--inline {
		display: flex;
		align-items: center;
		gap: var(--space-sm);
	}

	.field--inline input {
		inline-size: 1.25rem;
		block-size: 1.25rem;
	}

	.theme-btn {
		padding: var(--space-sm) var(--space-md);
		background: var(--color-brand);
		color: var(--color-surface);
		border-radius: var(--radius-md);
		font-weight: 600;
		min-block-size: 44px;
	}

	.preview {
		padding: var(--space-lg);
		border-inline-start: 4px solid var(--color-brand);
		background: var(--color-surface-2);
		border-radius: var(--radius-md);
	}

	.preview h2 {
		font-size: var(--text-lg);
		margin-block-end: var(--space-sm);
	}

	.preview dl {
		display: grid;
		grid-template-columns: 1fr;
		gap: var(--space-xs);
		margin: 0;

		@media (min-width: 480px) {
			grid-template-columns: 10rem 1fr;
		}
	}

	.preview dt {
		font-size: var(--text-sm);
		color: var(--color-text-muted);
	}

	.preview dd {
		margin: 0;
		font-weight: 600;
	}
</style>
