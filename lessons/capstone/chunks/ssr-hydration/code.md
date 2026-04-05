---
chunk: ssr-hydration
level: 3
penalty: high
---

# SSR + Hydration — Level 3 Code Reveal

**`src/routes/dashboard/+page.server.ts`**

```ts
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = () => {
	const renderedAt: string = new Date().toISOString();
	return { renderedAt };
};
```

**`src/routes/dashboard/+page.svelte`**

```svelte
<script lang="ts">
	import type { PageData } from './$types';

	const { data }: { data: PageData } = $props();
	let count = $state(0);
</script>

<section class="page stack">
	<h1>Dashboard</h1>
	<p>Rendered on the server at <time datetime={data.renderedAt}>{data.renderedAt}</time></p>
	<button type="button" class="btn" onclick={() => count++}>Count: {count}</button>
</section>

<style>
	.btn {
		min-block-size: 44px;
		padding-inline: var(--space-md);
		background: var(--color-brand);
		color: oklch(98% 0.01 0);
		border-radius: var(--radius-md);
		font-weight: 600;
	}
</style>
```
