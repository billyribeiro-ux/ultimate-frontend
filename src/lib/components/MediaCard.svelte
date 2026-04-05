<!--
	MediaCard.svelte — Module 3, Lesson 3.10.
	A responsive-by-container component: a card whose layout reshapes based on its
	own rendered width via @container queries, not media queries.
-->
<script lang="ts">
	interface Props {
		title: string;
		description: string;
	}

	let { title, description }: Props = $props();
</script>

<article class="media-card">
	<div class="media-card__thumb" aria-hidden="true"></div>
	<div class="media-card__body">
		<h3 class="media-card__title">{title}</h3>
		<p class="media-card__desc">{description}</p>
	</div>
</article>

<style>
	.media-card {
		container-type: inline-size;
		display: flex;
		flex-direction: column;
		background: var(--color-surface-2);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-lg);
		overflow: hidden;
		--pad: var(--space-sm);
		--font: var(--text-base);
	}

	.media-card__thumb {
		aspect-ratio: 16 / 9;
		background: linear-gradient(
			135deg,
			var(--color-brand),
			oklch(from var(--color-brand) 60% c calc(h + 30))
		);
	}

	.media-card__body {
		padding: var(--pad);
		display: flex;
		flex-direction: column;
		gap: var(--space-xs);
	}

	.media-card__title {
		font-size: var(--font);
		margin: 0;
	}

	.media-card__desc {
		font-size: var(--text-sm);
		color: var(--color-text-muted);
		margin: 0;
	}

	@container (min-width: 420px) {
		.media-card {
			flex-direction: row;
			--pad: var(--space-md);
			--font: var(--text-lg);
		}

		.media-card__thumb {
			inline-size: 40%;
			aspect-ratio: auto;
		}

		.media-card__body {
			flex: 1;
		}
	}

	@container (min-width: 640px) {
		.media-card {
			--pad: var(--space-lg);
			--font: var(--text-xl);
		}

		.media-card__thumb {
			inline-size: 50%;
		}
	}
</style>
