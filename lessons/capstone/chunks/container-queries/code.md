---
chunk: container-queries
level: 3
penalty: high
---

# Container Queries — Level 3 Code Reveal

**`src/lib/components/Card.svelte`** (style block only — the script and markup from `component-architecture` stay the same)

```svelte
<style>
	.card {
		container-type: inline-size;
		container-name: card;

		display: grid;
		gap: var(--space-sm);
		padding: var(--space-lg);
		background: var(--color-surface-2);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-lg);
	}

	.card__title {
		font-size: var(--text-lg);
		margin: 0;
	}

	.card__body {
		font-size: var(--text-base);
		color: var(--color-text-muted);
	}

	@container card (min-inline-size: 28rem) {
		.card {
			grid-template-columns: 14rem 1fr;
			align-items: start;
			gap: var(--space-lg);
		}
		.card__title {
			font-size: var(--text-xl);
		}
	}
</style>
```
