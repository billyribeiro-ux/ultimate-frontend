<script lang="ts">
	interface TransformResult {
		css: string;
		tokenCount: number;
		errors: string[];
	}

	const defaultJson: string = `{
  "color": {
    "brand": {
      "$value": "oklch(65% 0.22 270)",
      "$type": "color"
    },
    "surface": {
      "$value": "oklch(98% 0.01 270)",
      "$type": "color"
    },
    "text": {
      "$value": "oklch(20% 0.02 270)",
      "$type": "color"
    },
    "error": {
      "$value": "oklch(60% 0.22 25)",
      "$type": "color"
    }
  },
  "space": {
    "sm": {
      "$value": "clamp(0.5rem, 2vw, 1rem)",
      "$type": "dimension"
    },
    "md": {
      "$value": "clamp(1rem, 3vw, 1.5rem)",
      "$type": "dimension"
    },
    "lg": {
      "$value": "clamp(1.5rem, 4vw, 2.5rem)",
      "$type": "dimension"
    }
  },
  "radius": {
    "md": {
      "$value": "0.5rem",
      "$type": "dimension"
    }
  }
}`;

	let jsonInput: string = $state(defaultJson);

	interface DesignToken {
		$value: string;
		$type: string;
		$description?: string;
	}

	interface TokenGroup {
		[key: string]: DesignToken | TokenGroup;
	}

	function isToken(node: unknown): node is DesignToken {
		return typeof node === 'object' && node !== null && '$value' in node;
	}

	function transformTokens(json: string): TransformResult {
		const errors: string[] = [];
		let parsed: TokenGroup;

		try {
			parsed = JSON.parse(json) as TokenGroup;
		} catch (e: unknown) {
			return { css: '', tokenCount: 0, errors: [`JSON parse error: ${e instanceof Error ? e.message : String(e)}`] };
		}

		const lines: string[] = ['@layer tokens {', '  :root {'];
		let tokenCount: number = 0;

		function traverse(group: TokenGroup, prefix: string): void {
			for (const [key, value] of Object.entries(group)) {
				if (isToken(value)) {
					const varName: string = `--${prefix}${key}`;
					lines.push(`    ${varName}: ${value.$value};`);
					tokenCount += 1;
				} else if (typeof value === 'object' && value !== null) {
					traverse(value as TokenGroup, `${prefix}${key}-`);
				}
			}
		}

		traverse(parsed, '');
		lines.push('  }', '}');

		return { css: lines.join('\n'), tokenCount, errors };
	}

	let result: TransformResult = $derived(transformTokens(jsonInput));
</script>

<svelte:head>
	<title>23.2 — Token Pipeline · Design System Engineering</title>
</svelte:head>

<section class="page stack">
	<header>
		<p class="eyebrow">Lesson 23.2 · Mini-build</p>
		<h1>Token Transformer</h1>
		<p class="lede">
			Edit JSON design tokens on the left and see the generated CSS custom
			properties on the right.
		</p>
	</header>

	<div class="transformer-layout">
		<div class="panel">
			<h2 class="panel__title">JSON Tokens (DTCG format)</h2>
			<textarea
				class="panel__input"
				bind:value={jsonInput}
				spellcheck="false"
				rows="20"
			></textarea>
		</div>

		<div class="panel">
			<h2 class="panel__title">
				Generated CSS
				<span class="token-count">{result.tokenCount} tokens</span>
			</h2>
			{#if result.errors.length > 0}
				{#each result.errors as error (error)}
					<p class="error-msg">{error}</p>
				{/each}
			{:else}
				<pre class="panel__output"><code>{result.css}</code></pre>
			{/if}
		</div>
	</div>
</section>

<style>
	.eyebrow {
		font-size: var(--text-sm);
		color: var(--color-brand);
		letter-spacing: 0.08em;
		text-transform: uppercase;
		font-weight: 700;
	}

	.lede {
		font-size: var(--text-lg);
		color: var(--color-text-muted);
		max-inline-size: 50ch;
	}

	.transformer-layout {
		display: grid;
		gap: var(--space-lg);
	}

	@media (min-width: 768px) {
		.transformer-layout {
			grid-template-columns: 1fr 1fr;
		}
	}

	.panel__title {
		display: flex;
		justify-content: space-between;
		align-items: center;
		font-size: var(--text-base);
		margin-block-end: var(--space-sm);
	}

	.token-count {
		font-size: var(--text-xs);
		color: var(--color-brand);
		font-weight: 600;
	}

	.panel__input {
		inline-size: 100%;
		min-block-size: 400px;
		padding: var(--space-md);
		background: var(--color-surface-2);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		font-family: ui-monospace, monospace;
		font-size: var(--text-sm);
		line-height: 1.6;
		resize: vertical;
		color: var(--color-text);
	}

	.panel__output {
		padding: var(--space-md);
		background: var(--color-surface-2);
		border: 1px solid var(--color-border);
		border-block-start: 3px solid var(--color-brand);
		border-radius: var(--radius-md);
		font-size: var(--text-sm);
		line-height: 1.6;
		overflow-x: auto;
		min-block-size: 400px;
	}

	.error-msg {
		padding: var(--space-sm);
		background: var(--color-surface-2);
		border-inline-start: 3px solid var(--color-error);
		border-radius: var(--radius-sm);
		font-size: var(--text-sm);
		color: var(--color-error);
	}
</style>
