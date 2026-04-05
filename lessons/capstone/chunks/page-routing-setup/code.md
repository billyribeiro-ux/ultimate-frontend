---
chunk: page-routing-setup
level: 3
penalty: high
---

# Page Routing Setup — Level 3 Code Reveal

**`svelte.config.js`** (kit section)

```js
import adapter from '@sveltejs/adapter-auto';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

const config = {
	preprocess: vitePreprocess(),
	kit: {
		adapter: adapter(),
		trailingSlash: 'never'
	}
};
export default config;
```

**`src/routes/+layout.svelte`**

```svelte
<script lang="ts">
	import '../app.css';
	import PageShell from '$lib/components/PageShell.svelte';
	let { children } = $props();
</script>

<PageShell>
	{@render children()}
</PageShell>
```

**`src/routes/+page.svelte`**

```svelte
<section class="page stack">
	<h1>PE7 SaaS</h1>
	<p>Marketing home placeholder.</p>
</section>
```

**`src/routes/dashboard/+page.svelte`**

```svelte
<section class="page stack">
	<h1>Dashboard</h1>
	<p>Dashboard placeholder.</p>
</section>
```

**`src/routes/contact/+page.svelte`**

```svelte
<section class="page stack">
	<h1>Contact</h1>
	<p>Contact form placeholder.</p>
</section>
```

**`src/routes/blog/+page.svelte`**

```svelte
<section class="page stack">
	<h1>Blog</h1>
	<p>Blog index placeholder.</p>
</section>
```

**`src/routes/blog/[slug]/+page.svelte`**

```svelte
<script lang="ts">
	import { page } from '$app/state';
</script>

<section class="page stack">
	<h1>Post: {page.params.slug}</h1>
</section>
```

**`src/routes/+error.svelte`**

```svelte
<script lang="ts">
	import { page } from '$app/state';
</script>

<section class="page stack">
	<h1>Something went wrong</h1>
	<p>Status: {page.status}</p>
	<p>{page.error?.message}</p>
	<a href="/">← Back home</a>
</section>
```
