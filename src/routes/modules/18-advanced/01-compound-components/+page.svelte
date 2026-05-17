<script lang="ts">
	import Tabs from '$lib/components/advanced/Tabs.svelte';
	import Tab from '$lib/components/advanced/Tab.svelte';
	import TabPanel from '$lib/components/advanced/TabPanel.svelte';
	import Accordion from '$lib/components/advanced/Accordion.svelte';
	import AccordionItem from '$lib/components/advanced/AccordionItem.svelte';
</script>

<svelte:head>
	<title>18.1 — Compound Components · Advanced Patterns</title>
</svelte:head>

<section class="page stack">
	<header>
		<p class="eyebrow">Lesson 18.1 · Mini-build</p>
		<h1>Compound Components</h1>
		<p class="lede">
			A parent coordinates state while children own their rendering.
			No prop drilling, infinite composability.
		</p>
	</header>

	<section class="demo" aria-labelledby="tabs-heading">
		<h2 id="tabs-heading">Tabs Demo</h2>
		<Tabs defaultValue="overview">
			<div class="tab-bar" role="tablist">
				<Tab id="overview">Overview</Tab>
				<Tab id="features">Features</Tab>
				<Tab id="code">Code Example</Tab>
			</div>

			<TabPanel id="overview">
				<div class="panel-content">
					<h3>What are compound components?</h3>
					<p>
						A set of components that work together through shared context.
						The parent owns the state, children read it through getContext.
					</p>
				</div>
			</TabPanel>

			<TabPanel id="features">
				<div class="panel-content">
					<h3>Key features</h3>
					<ul>
						<li>Zero prop drilling — context handles coordination</li>
						<li>Full composability — insert any markup between parts</li>
						<li>Type-safe — TypeScript interfaces enforce the contract</li>
						<li>Accessible — ARIA attributes built into each piece</li>
					</ul>
				</div>
			</TabPanel>

			<TabPanel id="code">
				<div class="panel-content">
					<h3>Usage</h3>
					<pre><code>&lt;Tabs defaultValue="first"&gt;
  &lt;Tab id="first"&gt;First&lt;/Tab&gt;
  &lt;Tab id="second"&gt;Second&lt;/Tab&gt;
  &lt;TabPanel id="first"&gt;Content 1&lt;/TabPanel&gt;
  &lt;TabPanel id="second"&gt;Content 2&lt;/TabPanel&gt;
&lt;/Tabs&gt;</code></pre>
				</div>
			</TabPanel>
		</Tabs>
	</section>

	<section class="demo" aria-labelledby="accordion-heading">
		<h2 id="accordion-heading">Accordion Demo</h2>
		<Accordion>
			<AccordionItem id="what" title="What is the compound pattern?">
				<p>
					A compound component splits complex UI into cooperating parts.
					Each part is a real component with its own styles, behavior, and lifecycle.
					The parent coordinates shared state through Svelte context.
				</p>
			</AccordionItem>

			<AccordionItem id="why" title="Why not use a single component with props?">
				<p>
					A monolithic component with 20+ props becomes impossible to maintain.
					Compound components keep each part simple (3-5 props max) while
					enabling infinite customization through composition.
				</p>
			</AccordionItem>

			<AccordionItem id="when" title="When should I reach for this pattern?">
				<p>
					Use compound components when you have a multi-part UI where
					the parts need to coordinate state but the user needs control
					over the rendering of each part. Tabs, Accordions, Menus,
					Dialogs, Steppers — all benefit from this pattern.
				</p>
			</AccordionItem>
		</Accordion>
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

	.tab-bar {
		display: flex;
		gap: var(--space-xs);
		border-block-end: 1px solid var(--color-border);
		margin-block-end: var(--space-md);
	}

	.panel-content {
		padding: var(--space-md);
	}

	.panel-content h3 {
		margin-block-end: var(--space-sm);
	}

	.panel-content ul {
		padding-inline-start: var(--space-md);
		display: grid;
		gap: var(--space-xs);
	}

	.panel-content pre {
		background: var(--color-surface);
		padding: var(--space-md);
		border-radius: var(--radius-md);
		overflow-x: auto;
		font-size: var(--text-sm);
	}
</style>
