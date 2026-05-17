<script lang="ts">
	import HeadlessListbox from '$lib/components/advanced/HeadlessListbox.svelte';

	interface Framework {
		value: string;
		label: string;
		disabled?: boolean;
	}

	const frameworks: Framework[] = [
		{ value: 'svelte', label: 'Svelte 5' },
		{ value: 'react', label: 'React 19' },
		{ value: 'vue', label: 'Vue 3' },
		{ value: 'angular', label: 'Angular 18' },
		{ value: 'solid', label: 'SolidJS', disabled: true }
	];

	let selectedFramework: string = $state('svelte');

	function handleChange(value: string): void {
		selectedFramework = value;
	}
</script>

<svelte:head>
	<title>18.3 — Headless Components · Advanced Patterns</title>
</svelte:head>

<section class="page stack">
	<header>
		<p class="eyebrow">Lesson 18.3 · Mini-build</p>
		<h1>Headless Components</h1>
		<p class="lede">
			UI logic without UI. The same behavior drives completely different
			visual implementations.
		</p>
	</header>

	<section class="demo" aria-labelledby="dropdown-heading">
		<h2 id="dropdown-heading">Dropdown Implementation</h2>
		<p class="demo-description">
			This uses HeadlessListbox with a traditional dropdown visual.
		</p>

		<HeadlessListbox options={frameworks} value={selectedFramework} onchange={handleChange}>
			{#snippet children(state, actions)}
				<div class="dropdown">
					<button
						class="dropdown__trigger"
						aria-haspopup="listbox"
						aria-expanded={state.isOpen}
						onclick={actions.toggle}
					>
						<span>{state.options.find(o => o.value === state.selectedValue)?.label ?? 'Select...'}</span>
						<span class="dropdown__chevron" aria-hidden="true">
							{state.isOpen ? '▲' : '▼'}
						</span>
					</button>

					{#if state.isOpen}
						<ul class="dropdown__menu" role="listbox">
							{#each state.options as option (option.value)}
								<li
									class="dropdown__item"
									class:dropdown__item--highlighted={state.options.indexOf(option) === state.highlightedIndex}
									class:dropdown__item--selected={option.value === state.selectedValue}
									class:dropdown__item--disabled={option.disabled}
									role="option"
									aria-selected={option.value === state.selectedValue}
									aria-disabled={option.disabled}
								>
									<button
										class="dropdown__item-btn"
										onclick={() => actions.select(option.value)}
										onpointerenter={() => actions.highlight(state.options.indexOf(option))}
										disabled={option.disabled}
									>
										{#if option.value === state.selectedValue}
											<span class="dropdown__check" aria-hidden="true">&#10003;</span>
										{/if}
										{option.label}
									</button>
								</li>
							{/each}
						</ul>
					{/if}
				</div>
			{/snippet}
		</HeadlessListbox>
	</section>

	<section class="demo" aria-labelledby="cards-heading">
		<h2 id="cards-heading">Card Grid Implementation</h2>
		<p class="demo-description">
			Same HeadlessListbox, completely different visual. Cards instead of a dropdown.
		</p>

		<HeadlessListbox options={frameworks} value={selectedFramework} onchange={handleChange}>
			{#snippet children(state, actions)}
				<div class="card-selector" role="listbox" aria-label="Select a framework">
					{#each state.options as option (option.value)}
						<button
							class="card-option"
							class:card-option--selected={option.value === state.selectedValue}
							class:card-option--disabled={option.disabled}
							role="option"
							aria-selected={option.value === state.selectedValue}
							aria-disabled={option.disabled}
							disabled={option.disabled}
							onclick={() => actions.select(option.value)}
						>
							<span class="card-option__label">{option.label}</span>
							{#if option.value === state.selectedValue}
								<span class="card-option__badge">Selected</span>
							{/if}
						</button>
					{/each}
				</div>
			{/snippet}
		</HeadlessListbox>

		<p class="selection-display">
			Current selection: <strong>{selectedFramework}</strong>
		</p>
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

	.demo-description {
		font-size: var(--text-sm);
		color: var(--color-text-muted);
		margin-block-end: var(--space-md);
	}

	.dropdown {
		position: relative;
		max-inline-size: 20rem;
	}

	.dropdown__trigger {
		display: flex;
		align-items: center;
		justify-content: space-between;
		inline-size: 100%;
		padding: var(--space-sm) var(--space-md);
		min-block-size: 44px;
		background: var(--color-surface);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		font-size: var(--text-base);
		color: var(--color-text);
		cursor: pointer;
		transition: border-color var(--dur-fast) var(--ease-out);
	}

	.dropdown__trigger:hover {
		border-color: var(--color-brand);
	}

	.dropdown__chevron {
		font-size: var(--text-xs);
		color: var(--color-text-muted);
	}

	.dropdown__menu {
		position: absolute;
		inset-block-start: calc(100% + var(--space-xs));
		inset-inline: 0;
		list-style: none;
		padding: var(--space-xs);
		margin: 0;
		background: var(--color-surface);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		box-shadow: var(--shadow-lg);
		z-index: 10;
	}

	.dropdown__item {
		border-radius: var(--radius-sm);
	}

	.dropdown__item-btn {
		inline-size: 100%;
		padding: var(--space-sm) var(--space-md);
		min-block-size: 44px;
		display: flex;
		align-items: center;
		gap: var(--space-sm);
		font-size: var(--text-sm);
		text-align: start;
		cursor: pointer;
		border-radius: var(--radius-sm);
		transition: background var(--dur-instant) var(--ease-out);
	}

	.dropdown__item--highlighted .dropdown__item-btn {
		background: var(--color-brand);
		color: var(--color-surface);
	}

	.dropdown__item--selected .dropdown__item-btn {
		font-weight: 600;
	}

	.dropdown__item--disabled .dropdown__item-btn {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.dropdown__check {
		color: var(--color-success);
		font-weight: 700;
	}

	.card-selector {
		display: grid;
		gap: var(--space-sm);
		grid-template-columns: repeat(auto-fill, minmax(min(100%, 10rem), 1fr));
	}

	.card-option {
		padding: var(--space-md);
		min-block-size: 44px;
		background: var(--color-surface);
		border: 2px solid var(--color-border);
		border-radius: var(--radius-md);
		cursor: pointer;
		text-align: center;
		display: grid;
		gap: var(--space-xs);
		align-content: center;
		transition:
			border-color var(--dur-fast) var(--ease-out),
			transform var(--dur-fast) var(--ease-expressive);
	}

	.card-option:hover:not(:disabled) {
		border-color: var(--color-brand);
		transform: translateY(-2px);
	}

	.card-option--selected {
		border-color: var(--color-brand);
		background: var(--color-brand);
		color: var(--color-surface);
	}

	.card-option--disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.card-option__label {
		font-weight: 600;
		font-size: var(--text-sm);
	}

	.card-option__badge {
		font-size: var(--text-xs);
		text-transform: uppercase;
		letter-spacing: 0.05em;
		opacity: 0.8;
	}

	.selection-display {
		margin-block-start: var(--space-md);
		font-size: var(--text-sm);
		color: var(--color-text-muted);
	}

	@media (prefers-reduced-motion: reduce) {
		.card-option {
			transition: none;
		}
	}
</style>
