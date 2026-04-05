<script lang="ts">
	interface Message {
		id: string;
		text: string;
		time: string;
	}

	const messages: Message[] = $state([
		{ id: '1', text: 'Welcome to the chat log demo.', time: '12:00' },
		{ id: '2', text: 'Scroll me and then send new messages.', time: '12:01' }
	]);

	let container: HTMLElement | null = $state(null);
	let wasAtBottom: boolean = $state(true);

	$effect.pre(() => {
		// Access messages.length to register as a dependency.
		messages.length;
		if (container) {
			const slack =
				container.scrollHeight - container.clientHeight - container.scrollTop;
			wasAtBottom = slack < 8;
		}
	});

	$effect(() => {
		messages.length;
		if (container && wasAtBottom) {
			container.scrollTop = container.scrollHeight;
		}
	});

	let draft: string = $state('');

	function send(): void {
		const text = draft.trim();
		if (text.length === 0) return;
		const now = new Date();
		const time = `${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}`;
		messages.push({ id: crypto.randomUUID(), text, time });
		draft = '';
	}

	function spam(): void {
		const now = new Date();
		const time = `${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}`;
		messages.push({ id: crypto.randomUUID(), text: `Auto message #${messages.length + 1}`, time });
	}
</script>

<svelte:head>
	<title>Lesson 2.10 · $effect.pre · Ultimate Frontend</title>
	<meta
		name="description"
		content="Lesson 2.10 mini-build: a sticky-bottom chat log using $effect.pre for scroll anchoring."
	/>
</svelte:head>

<section class="page stack">
	<nav class="crumbs" aria-label="Breadcrumb">
		<a href="/modules/02-reactivity">← Module 2</a>
	</nav>

	<header>
		<p class="eyebrow">Lesson 2.10 · Mini-build</p>
		<h1>Sticky-bottom chat log</h1>
		<p class="lede">
			New messages snap to the bottom only if you were already there. Scroll up to pause
			auto-scroll; scroll down to resume.
		</p>
	</header>

	<div class="log" bind:this={container}>
		{#each messages as message (message.id)}
			<article class="msg">
				<p class="msg__time">{message.time}</p>
				<p class="msg__text">{message.text}</p>
			</article>
		{/each}
	</div>

	<form class="composer" onsubmit={(e) => { e.preventDefault(); send(); }}>
		<input type="text" bind:value={draft} placeholder="Type a message…" />
		<button type="submit">Send</button>
		<button type="button" onclick={spam}>Auto</button>
	</form>
</section>

<style>
	section {
		--color-brand: oklch(68% 0.2 230);
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

	.log {
		block-size: 18rem;
		overflow-y: auto;
		padding: var(--space-md);
		background: var(--color-surface-2);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-lg);
		display: grid;
		gap: var(--space-sm);
		align-content: start;
	}

	.msg {
		padding: var(--space-sm) var(--space-md);
		background: var(--color-surface);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
	}

	.msg__time {
		font-size: var(--text-xs);
		color: var(--color-text-muted);
		font-family: ui-monospace, monospace;
		margin: 0;
	}

	.msg__text {
		margin: 0;
	}

	.composer {
		display: flex;
		gap: var(--space-sm);
	}

	.composer input {
		flex: 1;
		min-block-size: 44px;
		padding-inline: var(--space-md);
		background: var(--color-surface);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
	}

	.composer button {
		min-block-size: 44px;
		padding-inline: var(--space-md);
		background: var(--color-brand);
		color: var(--color-surface);
		border-radius: var(--radius-md);
		font-weight: 600;
	}
</style>
