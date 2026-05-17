<script lang="ts">
	import type { SafeUser } from '$lib/auth/types';

	interface Props {
		data: {
			user: SafeUser | null;
			hookRanAt: string;
		};
	}

	let { data }: Props = $props();
</script>

<svelte:head>
	<title>Lesson 15.2 · Hooks for auth</title>
</svelte:head>

<section class="page stack">
	<header>
		<p class="eyebrow">Lesson 15.2 · Mini-build</p>
		<h1>Hook diagnostic panel</h1>
	</header>

	<article class="hook-panel">
		<h2>Request lifecycle</h2>
		<dl class="hook-info">
			<dt>Hook ran at</dt>
			<dd class="mono">{data.hookRanAt}</dd>

			<dt>Auth status</dt>
			<dd>
				<span class="status-badge" class:status-badge--authed={data.user !== null}>
					{data.user ? 'Authenticated' : 'Unauthenticated'}
				</span>
			</dd>

			<dt>User</dt>
			<dd class="mono">{data.user ? data.user.email : 'null'}</dd>
		</dl>
	</article>

	<article class="explanation-card">
		<h2>How it works</h2>
		<ol class="steps">
			<li>hooks.server.ts reads the <code>session_id</code> cookie</li>
			<li>If found, looks up the session in the in-memory store</li>
			<li>If valid, fetches the user and sets <code>event.locals.user</code></li>
			<li>The load function passes <code>locals.user</code> into page data</li>
		</ol>
		<p class="hint">Register and log in via Lessons 15.3-15.4 to see this panel change.</p>
	</article>
</section>

<style>
	section.page {
		--color-brand: oklch(65% 0.18 160);
	}

	.eyebrow {
		font-size: var(--text-sm);
		color: var(--color-brand);
		text-transform: uppercase;
		letter-spacing: 0.08em;
	}

	.hook-panel {
		padding: var(--space-lg);
		background: var(--color-surface-2);
		border-inline-start: 4px solid var(--color-brand);
		border-radius: var(--radius-md);
	}

	.hook-info {
		display: grid;
		grid-template-columns: auto 1fr;
		gap: var(--space-xs) var(--space-md);
		margin-block-start: var(--space-sm);
	}

	.hook-info dt {
		font-size: var(--text-sm);
		color: var(--color-text-muted);
		text-transform: uppercase;
		min-block-size: 44px;
		display: flex;
		align-items: center;
	}

	.hook-info dd {
		margin: 0;
		display: flex;
		align-items: center;
		min-block-size: 44px;
	}

	.mono {
		font-family: ui-monospace, monospace;
		font-size: var(--text-sm);
	}

	.status-badge {
		font-size: var(--text-xs);
		padding: 0.2em 0.8em;
		border-radius: var(--radius-full);
		background: var(--color-error);
		color: oklch(98% 0 0);
	}

	.status-badge--authed {
		background: var(--color-success);
		color: oklch(15% 0.02 145);
	}

	.explanation-card {
		padding: var(--space-lg);
		background: var(--color-surface-2);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-lg);
	}

	.steps {
		padding-inline-start: var(--space-md);
	}

	.steps li {
		padding-block: var(--space-xs);
	}

	.hint {
		margin-block-start: var(--space-sm);
		font-size: var(--text-sm);
		color: var(--color-text-muted);
		font-style: italic;
	}
</style>
