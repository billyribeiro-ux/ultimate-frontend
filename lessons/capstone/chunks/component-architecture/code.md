---
chunk: component-architecture
level: 3
penalty: high
---

# Component Architecture — Level 3 Code Reveal

**`src/lib/components/Button.svelte`**

```svelte
<script lang="ts" module>
	import type { Snippet } from 'svelte';

	export interface ButtonProps {
		variant?: 'primary' | 'secondary' | 'ghost';
		type?: 'button' | 'submit' | 'reset';
		disabled?: boolean;
		onclick?: (event: MouseEvent) => void;
		children: Snippet;
	}
</script>

<script lang="ts">
	const {
		variant = 'primary',
		type = 'button',
		disabled = false,
		onclick,
		children
	}: ButtonProps = $props();
</script>

<button {type} {disabled} class="btn btn--{variant}" {onclick}>
	{@render children()}
</button>

<style>
	.btn {
		min-block-size: 44px;
		padding-inline: var(--space-md);
		padding-block: var(--space-sm);
		border-radius: var(--radius-md);
		font-weight: 600;
		transition: transform var(--dur-fast) var(--ease-out);
	}
	.btn:hover:not(:disabled) { transform: translateY(-1px); }
	.btn:disabled { opacity: 0.5; cursor: not-allowed; }
	.btn--primary { background: var(--color-brand); color: oklch(98% 0.01 0); }
	.btn--secondary { background: var(--color-surface-2); color: var(--color-text); border: 1px solid var(--color-border); }
	.btn--ghost { background: transparent; color: var(--color-brand); }
</style>
```

**`src/lib/components/Input.svelte`**

```svelte
<script lang="ts" module>
	export interface InputProps {
		label: string;
		name: string;
		value: string;
		type?: 'text' | 'email' | 'password';
		error?: string;
	}
</script>

<script lang="ts">
	let { label, name, value = $bindable(), type = 'text', error }: InputProps = $props();
</script>

<label class="field">
	<span class="field__label">{label}</span>
	<input id={name} {name} {type} bind:value class:has-error={!!error} />
	{#if error}<p class="field__error">{error}</p>{/if}
</label>

<style>
	.field { display: grid; gap: var(--space-xs); }
	.field__label { font-size: var(--text-sm); color: var(--color-text-muted); }
	input {
		min-block-size: 44px;
		padding-inline: var(--space-sm);
		background: var(--color-surface);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
	}
	input.has-error { border-color: var(--color-error); }
	.field__error { color: var(--color-error); font-size: var(--text-sm); margin: 0; }
</style>
```

**`src/lib/components/Card.svelte`**

```svelte
<script lang="ts" module>
	import type { Snippet } from 'svelte';
	export interface CardProps {
		title: string;
		children: Snippet;
	}
</script>

<script lang="ts">
	const { title, children }: CardProps = $props();
</script>

<article class="card">
	<h2 class="card__title">{title}</h2>
	<div class="card__body">{@render children()}</div>
</article>

<style>
	.card {
		padding: var(--space-lg);
		background: var(--color-surface-2);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-lg);
	}
	.card__title { font-size: var(--text-lg); margin: 0 0 var(--space-sm); }
</style>
```

**`src/lib/components/PageShell.svelte`**

```svelte
<script lang="ts" module>
	import type { Snippet } from 'svelte';
	export interface PageShellProps {
		children: Snippet;
	}
</script>

<script lang="ts">
	const { children }: PageShellProps = $props();
</script>

<a class="skip" href="#main">Skip to content</a>
<header class="shell__header">
	<a class="shell__brand" href="/">PE7 SaaS</a>
	<nav aria-label="Primary">
		<a href="/">Home</a>
		<a href="/dashboard">Dashboard</a>
		<a href="/contact">Contact</a>
	</nav>
</header>
<main id="main">{@render children()}</main>
<footer class="shell__footer"><small>© PE7 SaaS</small></footer>

<style>
	.skip { position: absolute; inset-block-start: -100px; inset-inline-start: 0; padding: var(--space-sm); background: var(--color-brand); color: oklch(98% 0.01 0); }
	.skip:focus { inset-block-start: 0; }
	.shell__header { display: flex; justify-content: space-between; padding: var(--space-md); background: var(--color-surface-2); border-block-end: 1px solid var(--color-border); }
	.shell__header nav { display: flex; gap: var(--space-md); }
	.shell__footer { padding: var(--space-md); text-align: center; color: var(--color-text-muted); }
</style>
```
