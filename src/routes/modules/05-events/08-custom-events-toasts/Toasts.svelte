<!--
    Toasts container — Lesson 5.8.
    A pure reader of the toast store.
-->
<script lang="ts">
	import { toasts, dismiss } from './toasts.svelte';
</script>

<ul class="toasts" role="status" aria-live="polite" aria-atomic="false">
	{#each toasts as toast (toast.id)}
		<li class="toast toast--{toast.kind}">
			<span class="toast__msg">{toast.message}</span>
			<button
				type="button"
				class="toast__close"
				aria-label="Dismiss notification"
				onclick={() => dismiss(toast.id)}
			>
				×
			</button>
		</li>
	{/each}
</ul>

<style>
	.toasts {
		position: fixed;
		inset-block-end: var(--space-md);
		inset-inline-end: var(--space-md);
		margin: 0;
		padding: 0;
		list-style: none;
		display: grid;
		gap: var(--space-sm);
		max-inline-size: 22rem;
		z-index: 100;
	}

	.toast {
		display: flex;
		align-items: center;
		gap: var(--space-sm);
		padding: var(--space-sm) var(--space-md);
		border-radius: var(--radius-md);
		box-shadow: var(--shadow-lg);
		background: var(--color-surface-2);
		border-inline-start: 4px solid var(--color-brand);
		color: var(--color-text);
		animation: slide-in var(--dur-base) var(--ease-expressive);
	}

	.toast--success {
		border-inline-start-color: var(--color-success);
	}

	.toast--error {
		border-inline-start-color: var(--color-error);
	}

	.toast--info {
		border-inline-start-color: var(--color-brand);
	}

	.toast__msg {
		flex: 1 1 auto;
	}

	.toast__close {
		min-inline-size: 44px;
		min-block-size: 44px;
		font-size: var(--text-lg);
		color: var(--color-text-muted);
	}

	.toast__close:hover {
		color: var(--color-text);
	}

	@keyframes slide-in {
		from {
			opacity: 0;
			transform: translateY(8px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.toast {
			animation: none;
		}
	}
</style>
