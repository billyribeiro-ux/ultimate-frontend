<script lang="ts">
	import SEO from '$lib/components/SEO.svelte';
	import JsonLd from '$lib/components/JsonLd.svelte';

	interface FaqItem {
		question: string;
		answer: string;
	}

	const faqs: FaqItem[] = [
		{
			question: 'What is AEO?',
			answer:
				'AEO stands for Answer Engine Optimization — the practice of structuring content so AI answer engines cite it in generated summaries.'
		},
		{
			question: 'How is AEO different from SEO?',
			answer:
				'Classic SEO targets the ten blue links. AEO targets the three citations inside the AI Overview above them.'
		},
		{
			question: 'Which queries trigger AI Overviews in April 2026?',
			answer:
				'Informational, how-to, definitional, and comparative queries trigger Overviews most often. Transactional and navigational queries rarely do.'
		}
	];

	const faqSchema = {
		'@context': 'https://schema.org',
		'@type': 'FAQPage',
		mainEntity: faqs.map((f) => ({
			'@type': 'Question',
			name: f.question,
			acceptedAnswer: { '@type': 'Answer', text: f.answer }
		}))
	};
</script>

<SEO
	title="AEO and GEO · Lesson 13.12"
	description="How to structure pages so AI answer engines extract and cite your content — FAQPage schema, explicit answers, topical depth."
/>
<JsonLd data={faqSchema} />

<section class="page stack">
	<p class="eyebrow">Lesson 13.12 · Mini-build</p>
	<h1>FAQ that doubles as AEO fuel</h1>
	<p>
		Every question below is an extractable answer for an AI engine and a rich-result candidate
		for Google at the same time.
	</p>
	<ul class="faq">
		{#each faqs as item (item.question)}
			<li>
				<details>
					<summary>{item.question}</summary>
					<p>{item.answer}</p>
				</details>
			</li>
		{/each}
	</ul>
</section>

<style>
	section {
		--color-brand: oklch(68% 0.2 330);
	}

	.eyebrow {
		font-size: var(--text-sm);
		color: var(--color-brand);
		text-transform: uppercase;
		letter-spacing: 0.08em;
	}

	.faq {
		list-style: none;
		padding: 0;
		margin: 0;
		display: grid;
		gap: var(--space-sm);
	}

	.faq details {
		padding: var(--space-md);
		background: var(--color-surface-2);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
	}

	.faq summary {
		font-weight: 600;
		cursor: pointer;
		min-block-size: 44px;
		display: flex;
		align-items: center;
	}

	.faq p {
		margin-block-start: var(--space-sm);
		color: var(--color-text-muted);
	}
</style>
