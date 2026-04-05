<!--
	Lesson 3.8 mini-build — Composition patterns.
	Toolbar composes Buttons; PrimaryButton wraps Button with hard-wired decisions;
	rest-props spread forwards native HTML attributes (onclick, disabled, aria-*).
-->
<script lang="ts">
	import Button from '$lib/components/Button.svelte';
	import PrimaryButton from '$lib/components/PrimaryButton.svelte';
	import Toolbar from '$lib/components/Toolbar.svelte';

	let saving: boolean = $state(false);
	let status: string = $state('All changes saved.');

	function cancel(): void {
		status = 'Canceled.';
	}

	function save(): void {
		saving = true;
		status = 'Saving…';
		setTimeout((): void => {
			saving = false;
			status = 'All changes saved.';
		}, 600);
	}
</script>

<svelte:head>
	<title>Lesson 3.8 · Composition · Ultimate Frontend</title>
	<meta
		name="description"
		content="Lesson 3.8 mini-build: Toolbar composes Button and PrimaryButton; rest-props forward native attributes like disabled and onclick."
	/>
</svelte:head>

<section class="page stack">
	<nav class="crumbs" aria-label="Breadcrumb">
		<a href="/modules/03-components">← Module 3</a>
	</nav>

	<header>
		<p class="eyebrow">Lesson 3.8 · Mini-build</p>
		<h1>A settings toolbar, composed</h1>
		<p class="lede">
			Three components working together. <code>Toolbar</code> handles layout.
			<code>PrimaryButton</code> bakes in the primary decisions. Rest-props forwarding
			carries <code>disabled</code> and <code>onclick</code> through to the native button.
		</p>
	</header>

	<p class="status" aria-live="polite">{status}</p>

	<Toolbar align="end">
		<Button variant="ghost" onclick={cancel}>Cancel</Button>
		<PrimaryButton onclick={save} disabled={saving} aria-label="Save changes">
			{saving ? 'Saving…' : 'Save changes'}
		</PrimaryButton>
	</Toolbar>
</section>

<style>
	section {
		--color-brand: oklch(68% 0.2 260);
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
		color: var(--color-text-muted);
		max-inline-size: 60ch;
	}

	.status {
		font-size: var(--text-sm);
		color: var(--color-text-muted);
	}
</style>
