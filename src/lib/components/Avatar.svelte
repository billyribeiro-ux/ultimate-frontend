<!--
	Avatar.svelte — UI component library
	Introduced in Lesson 3.4 (optional props / default values).
-->
<script lang="ts">
	type Size = 'sm' | 'md' | 'lg';

	interface Props {
		name: string;
		src?: string;
		size?: Size;
	}

	let { name, src, size = 'md' }: Props = $props();

	// $derived so initials recompute if the `name` prop changes.
	const initials: string = $derived(
		name
			.split(' ')
			.map((part: string): string => part.charAt(0))
			.join('')
			.slice(0, 2)
			.toUpperCase()
	);
</script>

<span class="avatar avatar--{size}" aria-label={name}>
	{#if src}
		<img {src} alt="" />
	{:else}
		<span class="avatar__initials">{initials}</span>
	{/if}
</span>

<style>
	.avatar {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		inline-size: var(--avatar-size, 2.5rem);
		block-size: var(--avatar-size, 2.5rem);
		border-radius: var(--radius-full);
		background: var(--color-surface-2);
		color: var(--color-brand);
		font-weight: 700;
		overflow: hidden;
		border: 1px solid var(--color-border);
	}

	.avatar--sm {
		--avatar-size: 2rem;
		font-size: var(--text-xs);
	}

	.avatar--md {
		--avatar-size: 2.75rem;
		font-size: var(--text-sm);
	}

	.avatar--lg {
		--avatar-size: 4rem;
		font-size: var(--text-lg);
	}

	img {
		inline-size: 100%;
		block-size: 100%;
		object-fit: cover;
	}
</style>
