<script lang="ts">
	type CacheStatus = 'fresh' | 'cached' | 'stale' | 'regenerating';

	interface ProductPage {
		title: string;
		price: number;
		renderedAt: number;
		cacheStatus: CacheStatus;
	}

	let ttlSeconds: number = $state(10);
	let product: ProductPage = $state({
		title: 'Wireless Headphones Pro',
		price: 149.99,
		renderedAt: Date.now(),
		cacheStatus: 'fresh'
	});
	let countdown: number = $state(0);
	let requestCount: number = $state(0);
	let timerHandle: ReturnType<typeof setInterval> | null = $state(null);

	function formatTime(timestamp: number): string {
		return new Date(timestamp).toLocaleTimeString();
	}

	function startCountdown(): void {
		if (timerHandle) clearInterval(timerHandle);
		countdown = ttlSeconds;
		product.cacheStatus = 'fresh';
		timerHandle = setInterval(() => {
			countdown -= 1;
			if (countdown <= 0) {
				product.cacheStatus = 'stale';
				if (timerHandle) clearInterval(timerHandle);
				timerHandle = null;
			}
		}, 1000);
	}

	function requestPage(): void {
		requestCount += 1;

		if (product.cacheStatus === 'stale') {
			product.cacheStatus = 'regenerating';
			// Simulate background regeneration
			setTimeout(() => {
				product = {
					...product,
					renderedAt: Date.now(),
					price: Math.round((140 + Math.random() * 20) * 100) / 100,
					cacheStatus: 'fresh'
				};
				startCountdown();
			}, 1500);
		} else if (product.cacheStatus === 'fresh' || product.cacheStatus === 'cached') {
			product.cacheStatus = 'cached';
		}
	}

	function resetSimulation(): void {
		if (timerHandle) clearInterval(timerHandle);
		timerHandle = null;
		requestCount = 0;
		countdown = 0;
		product = {
			title: 'Wireless Headphones Pro',
			price: 149.99,
			renderedAt: Date.now(),
			cacheStatus: 'fresh'
		};
	}

	let statusColor: string = $derived(
		product.cacheStatus === 'fresh' ? 'var(--color-brand)' :
		product.cacheStatus === 'cached' ? 'var(--color-success)' :
		product.cacheStatus === 'stale' ? 'var(--color-warning)' :
		'var(--color-brand)'
	);
</script>

<svelte:head>
	<title>22.3 — Vercel Edge Functions · DevOps & Edge Deployment</title>
</svelte:head>

<section class="page stack">
	<header>
		<p class="eyebrow">Lesson 22.3 · Mini-build</p>
		<h1>ISR Product Page Simulator</h1>
		<p class="lede">
			Configure a TTL, request the page, and watch the stale-while-revalidate
			pattern in action.
		</p>
	</header>

	<div class="controls">
		<label class="control-group">
			<span class="control-group__label">Revalidation TTL (seconds)</span>
			<input
				type="range"
				min="5"
				max="30"
				bind:value={ttlSeconds}
				class="control-group__input"
			/>
			<span class="control-group__value">{ttlSeconds}s</span>
		</label>
		<div class="control-actions">
			<button type="button" class="btn btn--primary" onclick={requestPage}>
				Request Page
			</button>
			<button type="button" class="btn btn--secondary" onclick={startCountdown}>
				Start Cache TTL
			</button>
			<button type="button" class="btn btn--ghost" onclick={resetSimulation}>
				Reset
			</button>
		</div>
	</div>

	<article class="product-card">
		<div class="product-card__status" style="--status-color: {statusColor}">
			<span class="status-badge">{product.cacheStatus.toUpperCase()}</span>
			{#if countdown > 0}
				<span class="countdown">{countdown}s until stale</span>
			{/if}
		</div>
		<h2 class="product-card__title">{product.title}</h2>
		<p class="product-card__price">${product.price.toFixed(2)}</p>
		<dl class="product-card__meta">
			<dt>Rendered at</dt>
			<dd>{formatTime(product.renderedAt)}</dd>
			<dt>Total requests</dt>
			<dd>{requestCount}</dd>
		</dl>
	</article>
</section>

<style>
	.eyebrow {
		font-size: var(--text-sm);
		color: var(--color-brand);
		letter-spacing: 0.08em;
		text-transform: uppercase;
		font-weight: 700;
	}

	.lede {
		font-size: var(--text-lg);
		color: var(--color-text-muted);
		max-inline-size: 50ch;
	}

	.controls {
		display: grid;
		gap: var(--space-md);
	}

	.control-group {
		display: flex;
		align-items: center;
		gap: var(--space-sm);
		flex-wrap: wrap;
	}

	.control-group__label {
		font-size: var(--text-sm);
		font-weight: 600;
		min-inline-size: 12ch;
	}

	.control-group__input {
		flex: 1;
		min-inline-size: 120px;
	}

	.control-group__value {
		font-family: ui-monospace, monospace;
		font-size: var(--text-sm);
		min-inline-size: 4ch;
		text-align: end;
	}

	.control-actions {
		display: flex;
		gap: var(--space-sm);
		flex-wrap: wrap;
	}

	.btn {
		padding: var(--space-xs) var(--space-md);
		border-radius: var(--radius-md);
		font-weight: 600;
		font-size: var(--text-sm);
		min-block-size: 44px;
		transition: background var(--dur-fast) var(--ease-out);
	}

	.btn--primary {
		background: var(--color-brand);
		color: oklch(100% 0 0);
	}

	.btn--primary:hover {
		background: var(--color-brand-dim);
	}

	.btn--secondary {
		background: var(--color-surface-2);
		color: var(--color-text);
		border: 1px solid var(--color-border);
	}

	.btn--ghost {
		color: var(--color-brand);
	}

	.product-card {
		background: var(--color-surface-2);
		border-radius: var(--radius-lg);
		padding: var(--space-lg);
		box-shadow: var(--shadow-md);
	}

	.product-card__status {
		display: flex;
		align-items: center;
		gap: var(--space-sm);
		margin-block-end: var(--space-md);
	}

	.status-badge {
		display: inline-block;
		padding: var(--space-xs) var(--space-sm);
		background: var(--status-color, var(--color-brand));
		color: oklch(100% 0 0);
		border-radius: var(--radius-full);
		font-size: var(--text-xs);
		font-weight: 700;
		letter-spacing: 0.05em;
	}

	.countdown {
		font-size: var(--text-sm);
		color: var(--color-text-muted);
		font-family: ui-monospace, monospace;
	}

	.product-card__title {
		font-size: var(--text-xl);
	}

	.product-card__price {
		font-size: var(--text-2xl);
		font-weight: 700;
		color: var(--color-brand);
	}

	.product-card__meta {
		display: grid;
		grid-template-columns: auto 1fr;
		gap: var(--space-xs) var(--space-md);
		margin-block-start: var(--space-md);
		font-size: var(--text-sm);
	}

	.product-card__meta dt {
		color: var(--color-text-muted);
		font-weight: 600;
	}

	.product-card__meta dd {
		margin: 0;
	}
</style>
