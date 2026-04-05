<script lang="ts">
	type ShipmentStatus = 'loading' | 'success' | 'error';

	const currentStatus: ShipmentStatus = 'success';
	const trackingNumber: string = 'PE7-2026-04-05-001';
	const itemCount: number = 3;
	const expedited: boolean = true;

	const statusLabels: Record<ShipmentStatus, string> = {
		loading: 'In transit',
		success: 'Delivered',
		error: 'Delivery failed'
	};

	const statusTokens: Record<ShipmentStatus, string> = {
		loading: 'var(--color-warning)',
		success: 'var(--color-success)',
		error: 'var(--color-error)'
	};
</script>

<svelte:head>
	<title>Lesson 1.4 · Type annotations · Ultimate Frontend</title>
	<meta
		name="description"
		content="Lesson 1.4 mini-build: a shipment status card whose TypeScript union type refuses to hold an invalid value."
	/>
</svelte:head>

<section class="page stack">
	<nav class="crumbs" aria-label="Breadcrumb">
		<a href="/modules/01-foundation">← Module 1</a>
	</nav>

	<header>
		<p class="eyebrow">Lesson 1.4 · Mini-build</p>
		<h1>A status card that cannot lie</h1>
		<p class="lede">
			The <code>ShipmentStatus</code> type has exactly three allowed values. Try typing a
			fourth one in the script block and watch TypeScript refuse.
		</p>
	</header>

	<article class="card" style:--status-color={statusTokens[currentStatus]}>
		<p class="card__status">{statusLabels[currentStatus]}</p>
		<dl class="card__meta">
			<dt>Tracking</dt>
			<dd>{trackingNumber}</dd>
			<dt>Items</dt>
			<dd>{itemCount}</dd>
			<dt>Expedited</dt>
			<dd>{expedited ? 'Yes' : 'No'}</dd>
		</dl>
	</article>
</section>

<style>
	section {
		--color-brand: oklch(70% 0.18 30);
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
		background: var(--color-surface-2);
		border: 1px solid var(--color-border);
		border-inline-start: 6px solid var(--status-color);
		border-radius: var(--radius-lg);
		box-shadow: var(--shadow-md);
	}

	.card__status {
		font-size: var(--text-xl);
		font-weight: 700;
		color: var(--status-color);
		margin: 0 0 var(--space-md) 0;
	}

	.card__meta {
		display: grid;
		grid-template-columns: 1fr;
		gap: var(--space-xs);
		margin: 0;

		@media (min-width: 480px) {
			grid-template-columns: 10rem 1fr;
			gap: var(--space-xs) var(--space-md);
		}
	}

	.card__meta dt {
		font-size: var(--text-sm);
		color: var(--color-text-muted);
		text-transform: uppercase;
		letter-spacing: 0.06em;
	}

	.card__meta dd {
		margin: 0;
		font-size: var(--text-base);
		font-weight: 600;
	}
</style>
