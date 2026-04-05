---
chunk: reveal-action
level: 3
penalty: high
---

# use:revealOnScroll action — Level 3 Code Reveal

**`src/lib/actions/revealOnScroll.ts`**

```ts
import type { Action } from 'svelte/action';

export interface RevealOptions {
	offset?: string;
	once?: boolean;
}

export const revealOnScroll: Action<HTMLElement, RevealOptions | undefined> = (
	node,
	params
) => {
	const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
	if (reduced) {
		node.dataset.reveal = 'visible';
		return { destroy() {} };
	}

	node.dataset.reveal = 'pending';
	const once = params?.once ?? true;

	const observer = new IntersectionObserver(
		(entries) => {
			for (const entry of entries) {
				if (entry.isIntersecting) {
					node.dataset.reveal = 'visible';
					if (once) observer.unobserve(entry.target);
				} else if (!once) {
					node.dataset.reveal = 'pending';
				}
			}
		},
		{ rootMargin: params?.offset ?? '0px 0px -10% 0px' }
	);

	observer.observe(node);

	return {
		destroy() {
			observer.disconnect();
		}
	};
};
```

**Global CSS (add to `app.css` `components` layer or a dedicated file)**

```css
[data-reveal='pending'] {
	opacity: 0;
	transform: translateY(20px);
}
[data-reveal='visible'] {
	opacity: 1;
	transform: translateY(0);
	transition:
		opacity 600ms var(--ease-out),
		transform 600ms var(--ease-out);
}
```

**Usage in any component**

```svelte
<script lang="ts">
	import { revealOnScroll } from '$lib/actions/revealOnScroll';
</script>

<article use:revealOnScroll>
	<h3>Revealed when scrolled into view</h3>
</article>
```
