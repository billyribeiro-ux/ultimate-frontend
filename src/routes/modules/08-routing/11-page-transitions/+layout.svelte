<!--
	Lesson 8.11 — local layout that wires up the View Transitions API via
	SvelteKit's onNavigate hook. Only wraps pages inside
	src/routes/modules/08-routing/11-page-transitions.
-->
<script lang="ts">
	import { onNavigate } from '$app/navigation';
	import type { Snippet } from 'svelte';

	interface Props {
		children: Snippet;
	}

	let { children }: Props = $props();

	onNavigate((navigation) => {
		if (typeof document === 'undefined') return;
		// Feature-detect. Browsers without the API fall through to the default
		// SvelteKit instant navigation.
		const doc = document as Document & {
			startViewTransition?: (cb: () => Promise<void> | void) => { finished: Promise<void> };
		};
		if (!doc.startViewTransition) return;

		return new Promise<void>((resolve) => {
			doc.startViewTransition!(async () => {
				resolve();
				await navigation.complete;
			});
		});
	});
</script>

{@render children()}

<style>
	:global(::view-transition-old(root)) {
		animation: fade-out 180ms cubic-bezier(0.4, 0, 0.2, 1) both;
	}

	:global(::view-transition-new(root)) {
		animation: fade-in 220ms cubic-bezier(0, 0, 0.2, 1) both;
	}

	@keyframes fade-out {
		to {
			opacity: 0;
		}
	}

	@keyframes fade-in {
		from {
			opacity: 0;
		}
	}
</style>
