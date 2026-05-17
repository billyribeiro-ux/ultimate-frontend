<script lang="ts">
	type ButtonVariant = 'solid' | 'outline' | 'ghost' | 'link';

	interface BaseButtonProps {
		variant: ButtonVariant;
		disabled?: boolean;
	}

	interface LinkButtonProps extends BaseButtonProps {
		variant: 'link';
		href: string;
	}

	interface ActionButtonProps extends BaseButtonProps {
		variant: 'solid' | 'outline' | 'ghost';
		href?: never;
	}

	type ButtonProps = LinkButtonProps | ActionButtonProps;

	let examples: ButtonProps[] = $state([
		{ variant: 'solid', disabled: false },
		{ variant: 'outline', disabled: false },
		{ variant: 'link', href: 'https://svelte.dev' },
		{ variant: 'ghost', disabled: true }
	]);

	let selectedIndex: number = $state(0);

	let currentExample: ButtonProps = $derived(examples[selectedIndex]);

	let typeNarrowingResult: string = $derived.by(() => {
		const btn = currentExample;
		if (btn.variant === 'link') {
			return `LinkButtonProps — href is required: "${btn.href}"`;
		}
		return `ActionButtonProps — variant: "${btn.variant}", no href allowed`;
	});

	function isLinkButton(props: ButtonProps): props is LinkButtonProps {
		return props.variant === 'link';
	}

	type EventMap = {
		click: { x: number; y: number };
		submit: { formData: Record<string, string> };
		navigate: { path: string };
	};

	type EventHandler<K extends keyof EventMap> = (payload: EventMap[K]) => void;

	let eventLog: string[] = $state([]);

	function emit<K extends keyof EventMap>(event: K, payload: EventMap[K]): void {
		eventLog = [...eventLog, `${event}: ${JSON.stringify(payload)}`];
	}
</script>

<svelte:head>
	<title>18.8 — Advanced TypeScript Patterns · Advanced Patterns</title>
</svelte:head>

<section class="page stack">
	<header>
		<p class="eyebrow">Lesson 18.8 · Mini-build</p>
		<h1>Advanced TypeScript Patterns</h1>
		<p class="lede">
			Discriminated unions, conditional props, branded types, and mapped event
			systems — TypeScript as a design tool for component APIs.
		</p>
	</header>

	<section class="demo" aria-labelledby="union-heading">
		<h2 id="union-heading">Discriminated Union Props</h2>
		<p class="demo__desc">
			Click a button variant to see TypeScript narrow the type at runtime:
		</p>
		<div class="variant-buttons">
			{#each examples as example, i}
				<button
					class="variant-btn"
					class:variant-btn--active={selectedIndex === i}
					onclick={() => selectedIndex = i}
				>
					{example.variant}
					{#if isLinkButton(example)}
						<span class="variant-btn__badge">link</span>
					{/if}
				</button>
			{/each}
		</div>
		<div class="narrowing-result">
			<code>{typeNarrowingResult}</code>
		</div>
	</section>

	<section class="demo" aria-labelledby="events-heading">
		<h2 id="events-heading">Mapped Type Event Bus</h2>
		<p class="demo__desc">
			A type-safe event system where each event name maps to a specific payload type:
		</p>
		<div class="event-buttons">
			<button class="btn" onclick={() => emit('click', { x: Math.round(Math.random() * 500), y: Math.round(Math.random() * 500) })}>
				Emit click
			</button>
			<button class="btn" onclick={() => emit('submit', { formData: { name: 'Ada', email: 'ada@example.com' } })}>
				Emit submit
			</button>
			<button class="btn" onclick={() => emit('navigate', { path: '/dashboard' })}>
				Emit navigate
			</button>
		</div>
		{#if eventLog.length > 0}
			<ul class="event-log">
				{#each eventLog as entry, i}
					<li class="event-log__entry"><code>{entry}</code></li>
				{/each}
			</ul>
		{/if}
		{#if eventLog.length > 0}
			<button class="btn btn--small" onclick={() => eventLog = []}>Clear log</button>
		{/if}
	</section>

	<section class="explanation" aria-labelledby="patterns-heading">
		<h2 id="patterns-heading">Patterns Demonstrated</h2>
		<ol class="steps">
			<li><strong>Discriminated unions</strong> — variant field narrows the entire prop type</li>
			<li><strong>Conditional props</strong> — href is required for link, forbidden for others</li>
			<li><strong>Type predicates</strong> — <code>props is LinkButtonProps</code> narrows in conditionals</li>
			<li><strong>Mapped types</strong> — EventMap keys constrain handler payloads</li>
			<li><strong>Generic constraints</strong> — <code>K extends keyof EventMap</code> ensures type safety</li>
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

	.demo {
		padding: var(--space-lg);
		background: var(--color-surface-2);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-lg);
	}

	.demo__desc {
		font-size: var(--text-sm);
		color: var(--color-text-muted);
		margin-block-end: var(--space-md);
	}

	.variant-buttons, .event-buttons {
		display: flex;
		gap: var(--space-xs);
		flex-wrap: wrap;
		margin-block-end: var(--space-md);
	}

	.variant-btn {
		padding: var(--space-xs) var(--space-md);
		border: 2px solid var(--color-border);
		border-radius: var(--radius-md);
		font-size: var(--text-sm);
		font-weight: 600;
		min-block-size: 44px;
		transition: border-color var(--dur-fast) var(--ease-out);
		display: flex;
		align-items: center;
		gap: var(--space-xs);
	}

	.variant-btn:hover {
		border-color: var(--color-brand);
	}

	.variant-btn--active {
		border-color: var(--color-brand);
		background: var(--color-brand);
		color: oklch(100% 0 0);
	}

	.variant-btn__badge {
		font-size: var(--text-xs);
		background: var(--color-surface);
		color: var(--color-brand);
		padding: 0.1em 0.4em;
		border-radius: var(--radius-sm);
	}

	.narrowing-result {
		padding: var(--space-md);
		background: var(--color-surface);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		font-size: var(--text-sm);
	}

	.btn {
		padding: var(--space-xs) var(--space-md);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		font-size: var(--text-sm);
		font-weight: 600;
		min-block-size: 44px;
		transition: border-color var(--dur-fast) var(--ease-out);
	}

	.btn:hover {
		border-color: var(--color-brand);
	}

	.btn--small {
		padding: var(--space-xs) var(--space-sm);
		font-size: var(--text-xs);
		min-block-size: auto;
	}

	.event-log {
		list-style: none;
		padding: 0;
		margin: 0;
		display: grid;
		gap: var(--space-xs);
		margin-block-end: var(--space-sm);
		max-block-size: 12rem;
		overflow-y: auto;
	}

	.event-log__entry {
		padding: var(--space-xs) var(--space-sm);
		background: var(--color-surface);
		border-radius: var(--radius-sm);
		font-size: var(--text-xs);
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
</style>
