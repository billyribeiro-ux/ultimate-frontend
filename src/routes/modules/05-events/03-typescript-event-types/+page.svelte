<!--
    Lesson 5.3 — TypeScript event types.
    Mini-build: three live event panels demonstrating MouseEvent,
    KeyboardEvent, and Event with HTMLInputElement target narrowing.
-->
<script lang="ts">
	let text: string = $state('');
	let lastClick: string = $state('(none yet)');
	let lastKey: string = $state('(none yet)');

	function onInput(event: Event): void {
		const target = event.target as HTMLInputElement;
		text = target.value;
	}

	function onClick(event: MouseEvent): void {
		lastClick = `x=${event.clientX}, y=${event.clientY}, button=${event.button}`;
	}

	function onKey(event: KeyboardEvent): void {
		const mods: string[] = [];
		if (event.shiftKey) mods.push('shift');
		if (event.ctrlKey) mods.push('ctrl');
		if (event.altKey) mods.push('alt');
		if (event.metaKey) mods.push('meta');
		lastKey = `key="${event.key}"${mods.length > 0 ? ' + ' + mods.join('+') : ''}`;
	}
</script>

<svelte:head>
	<title>Lesson 5.3 · TypeScript event types · Ultimate Frontend</title>
	<meta
		name="description"
		content="Mini-build for Lesson 5.3: live panels showing MouseEvent, KeyboardEvent, and target narrowing."
	/>
</svelte:head>

<section class="page stack">
	<nav class="crumbs" aria-label="Breadcrumb">
		<a href="/modules/05-events">← Module 5</a>
	</nav>

	<header>
		<p class="eyebrow">Lesson 5.3 · Mini-build</p>
		<h1>Every event has a type</h1>
		<p class="lede">
			<code>MouseEvent</code>, <code>KeyboardEvent</code>, <code>Event</code> with a narrowed
			target — three handlers, three shapes, zero <code>any</code>.
		</p>
	</header>

	<article class="panels">
		<section class="panel">
			<h2>Event (input)</h2>
			<label class="field">
				<span>Type here</span>
				<input type="text" placeholder="type anything" oninput={onInput} />
			</label>
			<p class="panel__readout">text: <code>{text || '(empty)'}</code></p>
		</section>

		<section class="panel">
			<h2>MouseEvent (click)</h2>
			<button type="button" class="btn" onclick={onClick}>Click me</button>
			<p class="panel__readout">last click: <code>{lastClick}</code></p>
		</section>

		<section class="panel">
			<h2>KeyboardEvent (keydown)</h2>
			<div
				class="key-catcher"
				tabindex="0"
				role="textbox"
				aria-label="Keyboard event catcher"
				onkeydown={onKey}
			>
				Focus me and press a key
			</div>
			<p class="panel__readout">last key: <code>{lastKey}</code></p>
		</section>
	</article>
</section>

<style>
	section {
		--color-brand: oklch(68% 0.18 240);
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

	.panels {
		display: grid;
		gap: var(--space-md);

		@media (min-width: 768px) {
			grid-template-columns: repeat(3, 1fr);
		}
	}

	.panel {
		padding: var(--space-md);
		background: var(--color-surface-2);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		display: grid;
		gap: var(--space-sm);

		& h2 {
			font-size: var(--text-lg);
			color: var(--color-brand);
			margin: 0;
		}
	}

	.field {
		display: grid;
		gap: var(--space-xs);

		& span {
			font-size: var(--text-sm);
			color: var(--color-text-muted);
		}

		& input {
			min-block-size: 44px;
			padding-inline: var(--space-sm);
			border: 1px solid var(--color-border);
			border-radius: var(--radius-md);
			background: var(--color-surface);
			color: var(--color-text);
		}

		& input:focus-visible {
			outline: 2px solid var(--color-brand);
			outline-offset: 2px;
		}
	}

	.btn {
		min-block-size: 44px;
		padding-inline: var(--space-md);
		padding-block: var(--space-sm);
		border-radius: var(--radius-md);
		background: var(--color-brand);
		color: oklch(98% 0.01 240);
		font-weight: 600;
	}

	.key-catcher {
		min-block-size: 44px;
		padding: var(--space-sm);
		border: 2px dashed var(--color-border);
		border-radius: var(--radius-md);
		color: var(--color-text-muted);
		text-align: center;
	}

	.key-catcher:focus-visible {
		outline: 2px solid var(--color-brand);
		border-color: var(--color-brand);
		color: var(--color-text);
	}

	.panel__readout {
		margin: 0;
		font-size: var(--text-sm);
		color: var(--color-text-muted);
	}
</style>
