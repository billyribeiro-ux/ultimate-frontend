<script lang="ts">
	let direction = $state<'ltr' | 'rtl'>('ltr');

	interface CardItem {
		id: string;
		title: string;
		titleAr: string;
		description: string;
		descriptionAr: string;
		icon: string;
	}

	let cards: CardItem[] = $state([
		{ id: '1', title: 'Dashboard', titleAr: 'لوحة القيادة', description: 'View your analytics and metrics in real time.', descriptionAr: 'عرض التحليلات والمقاييس في الوقت الفعلي.', icon: '📊' },
		{ id: '2', title: 'Settings', titleAr: 'الإعدادات', description: 'Configure your account and preferences.', descriptionAr: 'تكوين حسابك وتفضيلاتك.', icon: '⚙' },
		{ id: '3', title: 'Messages', titleAr: 'الرسائل', description: 'Read and send messages to your team.', descriptionAr: 'قراءة وإرسال الرسائل إلى فريقك.', icon: '✉' }
	]);

	function toggleDirection(): void {
		direction = direction === 'ltr' ? 'rtl' : 'ltr';
	}

	let isRtl: boolean = $derived(direction === 'rtl');
</script>

<svelte:head>
	<title>19.6 — RTL &amp; Bidirectional Text · Internationalization</title>
</svelte:head>

<section class="page stack">
	<header>
		<p class="eyebrow">Lesson 19.6 · Mini-build</p>
		<h1>RTL &amp; Bidirectional Text</h1>
		<p class="lede">
			Toggle between LTR and RTL to see how CSS logical properties
			make the same layout work in both directions.
		</p>
	</header>

	<section class="toggle-section" aria-label="Direction toggle">
		<button class="toggle-btn" onclick={toggleDirection}>
			Switch to {direction === 'ltr' ? 'RTL' : 'LTR'}
		</button>
		<span class="direction-badge">
			Current: <strong>dir="{direction}"</strong>
		</span>
	</section>

	<section class="card-list" dir={direction} aria-labelledby="cards-heading">
		<h2 id="cards-heading" class="sr-only">Navigation Cards</h2>
		{#each cards as card (card.id)}
			<article class="card">
				<span class="card__icon">{card.icon}</span>
				<div class="card__content">
					<h3 class="card__title">
						{isRtl ? card.titleAr : card.title}
					</h3>
					<p class="card__description">
						{isRtl ? card.descriptionAr : card.description}
					</p>
				</div>
				<span class="card__arrow" aria-hidden="true">
					{isRtl ? '←' : '→'}
				</span>
			</article>
		{/each}
	</section>

	<section class="bidi-demo" aria-labelledby="bidi-heading">
		<h2 id="bidi-heading">Bidirectional Text Demo</h2>
		<div class="bidi-example" dir="rtl">
			<p>المستخدم <bdi>alice_dev</bdi> أرسل رسالة جديدة.</p>
			<p>شاهدت فيلم <bdi>Spider-Man: No Way Home</bdi> أمس.</p>
			<p>الإصدار <bdi>v3.2.1</bdi> متاح الآن.</p>
		</div>
		<p class="bidi-note">
			The <code>&lt;bdi&gt;</code> element isolates LTR text (usernames, version
			numbers, English titles) from the surrounding RTL context.
		</p>
	</section>

	<section class="explanation" aria-labelledby="how-heading">
		<h2 id="how-heading">Logical Properties Used</h2>
		<ol class="steps">
			<li><code>padding-inline-start</code> / <code>padding-inline-end</code> instead of left/right</li>
			<li><code>margin-inline-start</code> instead of <code>margin-left</code></li>
			<li><code>text-align: start</code> instead of <code>text-align: left</code></li>
			<li><code>border-inline-start</code> instead of <code>border-left</code></li>
			<li>Flexbox <code>row</code> direction auto-reverses with <code>dir</code></li>
		</ol>
	</section>
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

	.toggle-section {
		display: flex;
		align-items: center;
		gap: var(--space-md);
		flex-wrap: wrap;
	}

	.toggle-btn {
		padding: var(--space-xs) var(--space-md);
		background: var(--color-brand);
		color: oklch(100% 0 0);
		border: 1px solid var(--color-brand);
		border-radius: var(--radius-md);
		font-size: var(--text-sm);
		font-weight: 600;
		min-block-size: 44px;
		transition: background var(--dur-fast) var(--ease-out);
	}

	.toggle-btn:hover {
		background: var(--color-brand-dim);
	}

	.direction-badge {
		font-size: var(--text-sm);
		color: var(--color-text-muted);
		font-family: ui-monospace, 'SF Mono', Menlo, Consolas, monospace;
	}

	.card-list {
		display: grid;
		gap: var(--space-sm);
	}

	.card {
		display: flex;
		align-items: center;
		gap: var(--space-md);
		padding: var(--space-md);
		background: var(--color-surface-2);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-lg);
		transition: border-color var(--dur-fast) var(--ease-out);
	}

	.card:hover {
		border-color: var(--color-brand);
	}

	.card__icon {
		font-size: var(--text-xl);
		flex-shrink: 0;
	}

	.card__content {
		flex: 1;
	}

	.card__title {
		font-size: var(--text-base);
		font-weight: 600;
		margin-block-end: 0.15rem;
	}

	.card__description {
		font-size: var(--text-sm);
		color: var(--color-text-muted);
	}

	.card__arrow {
		font-size: var(--text-lg);
		color: var(--color-text-muted);
		flex-shrink: 0;
	}

	.bidi-demo {
		padding: var(--space-lg);
		background: var(--color-surface-2);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-lg);
	}

	.bidi-example {
		padding: var(--space-md);
		background: var(--color-surface);
		border-radius: var(--radius-md);
		margin-block-end: var(--space-md);
	}

	.bidi-example p {
		margin-block-end: var(--space-sm);
		font-size: var(--text-base);
		line-height: 1.8;
	}

	.bidi-example p:last-child {
		margin-block-end: 0;
	}

	.bidi-note {
		font-size: var(--text-sm);
		color: var(--color-text-muted);
	}

	.explanation {
		padding: var(--space-lg);
		background: var(--color-surface-2);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-lg);
	}

	.steps {
		padding-inline-start: var(--space-md);
		display: grid;
		gap: var(--space-sm);
		font-size: var(--text-sm);
	}

	.sr-only {
		position: absolute;
		inline-size: 1px;
		block-size: 1px;
		padding: 0;
		margin: -1px;
		overflow: hidden;
		clip: rect(0, 0, 0, 0);
		white-space: nowrap;
		border-width: 0;
	}
</style>
