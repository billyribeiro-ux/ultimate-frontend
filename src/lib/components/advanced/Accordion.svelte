<script lang="ts">
	import { setContext } from 'svelte';
	import type { Snippet } from 'svelte';

	interface AccordionProps {
		multiple?: boolean;
		children: Snippet;
	}

	let { multiple = false, children }: AccordionProps = $props();

	let openItems: Set<string> = $state(new Set());

	function toggle(id: string): void {
		const next = new Set(openItems);
		if (next.has(id)) {
			next.delete(id);
		} else {
			if (!multiple) {
				next.clear();
			}
			next.add(id);
		}
		openItems = next;
	}

	function isOpen(id: string): boolean {
		return openItems.has(id);
	}

	setContext('accordion', {
		toggle,
		isOpen,
		get openItems() { return openItems; }
	});
</script>

<div class="accordion">
	{@render children()}
</div>

<style>
	.accordion {
		display: flex;
		flex-direction: column;
		border: 1px solid var(--color-border);
		border-radius: var(--radius-lg);
		overflow: hidden;
	}
</style>
