<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	type ValidElement = 'a' | 'button' | 'div' | 'span' | 'section' | 'article' | 'nav' | 'header' | 'footer' | 'main' | 'aside' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'ul' | 'ol' | 'li';

	interface AsProps {
		as?: ValidElement;
		class?: string;
		href?: string;
		children: Snippet;
		[key: string]: unknown;
	}

	let { as = 'div', class: className = '', href, children, ...rest }: AsProps = $props();
</script>

<svelte:element this={as} class={className} {href} {...rest}>
	{@render children()}
</svelte:element>
