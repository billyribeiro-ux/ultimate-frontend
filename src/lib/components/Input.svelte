<!--
	Input.svelte — UI component library
	Introduced in Lesson 3.5 ($bindable two-way binding).
-->
<script lang="ts">
	interface Props {
		value: string;
		label: string;
		id: string;
		type?: 'text' | 'email' | 'search' | 'password';
		placeholder?: string;
		disabled?: boolean;
	}

	let {
		value = $bindable(),
		label,
		id,
		type = 'text',
		placeholder = '',
		disabled = false
	}: Props = $props();
</script>

<div class="field">
	<label for={id}>{label}</label>
	<input {id} {type} {placeholder} {disabled} bind:value />
</div>

<style>
	.field {
		display: flex;
		flex-direction: column;
		gap: var(--space-xs);
	}

	label {
		font-size: var(--text-sm);
		font-weight: 600;
		color: var(--color-text-muted);
	}

	input {
		min-block-size: 44px;
		padding-inline: var(--space-md);
		padding-block: var(--space-sm);
		background: var(--color-surface);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		color: var(--color-text);
		font-size: var(--text-base);
		transition: border-color var(--dur-fast) var(--ease-out);

		&:focus-visible {
			border-color: var(--color-brand);
			outline: 2px solid var(--color-brand);
			outline-offset: 1px;
		}

		&:disabled {
			opacity: 0.55;
			cursor: not-allowed;
		}
	}
</style>
