---
module: 13
exercise: 4
title: Core Web Vitals Optimization
difficulty: expert
estimated_time: 45
skills_tested:
  - LCP optimization
  - CLS prevention
  - INP optimization
  - web-vitals library
---

# Exercise 13.4 — Core Web Vitals Optimization

## Brief

Build a page that demonstrates and measures all three Core Web Vitals (LCP, CLS, INP) using the `web-vitals` library. The page intentionally triggers poor scores, then provides a fixed version that achieves good scores, with real-time metric display.

## Requirements

1. Create `src/routes/vitals/+page.svelte` with a real-time Core Web Vitals dashboard
2. Integrate the `web-vitals` library to measure LCP, CLS, and INP in the browser
3. Display each metric with its current value, threshold (good/needs improvement/poor), and a color-coded status badge
4. Include a "Problem Gallery" section showing three common CWV issues with before/after code
5. Problem 1 (CLS): Image without dimensions vs with dimensions
6. Problem 2 (LCP): Unoptimized hero image vs optimized with fetchpriority
7. Problem 3 (INP): Blocking click handler vs debounced/deferred handler
8. Each problem shows the affected metric and the fix

## Constraints

- Use the official `web-vitals` library for measurement
- Metrics must update in real-time as the user interacts
- Threshold values must match Google's official thresholds
- All styles use PE7 tokens

## Hints (progressive)

<details>
<summary>Hint 1 (free)</summary>

Install `web-vitals` and import `onLCP`, `onCLS`, `onINP`. Each function accepts a callback that receives a metric object with `value`, `rating`, and `name`. Call them in `onMount` since they require the browser.
</details>

<details>
<summary>Hint 2 (conceptual)</summary>

Google's thresholds: LCP good < 2.5s, CLS good < 0.1, INP good < 200ms. Display the metric value, the threshold range, and a green/yellow/red badge. Store metrics in `$state` and update them as the library reports.
</details>

<details>
<summary>Hint 3 (code sketch)</summary>

```svelte
<script lang="ts">
  import { onMount } from 'svelte';

  let lcpValue = $state<number | null>(null);
  let clsValue = $state<number | null>(null);
  let inpValue = $state<number | null>(null);

  onMount(async () => {
    const { onLCP, onCLS, onINP } = await import('web-vitals');
    onLCP((metric) => { lcpValue = metric.value; });
    onCLS((metric) => { clsValue = metric.value; });
    onINP((metric) => { inpValue = metric.value; });
  });
</script>
```
</details>

## Solution

<details>
<summary>Full solution</summary>

```svelte
<!-- src/routes/vitals/+page.svelte -->
<script lang="ts">
  import { onMount } from 'svelte';

  interface VitalMetric {
    name: string;
    value: number | null;
    unit: string;
    good: number;
    poor: number;
  }

  let metrics = $state<VitalMetric[]>([
    { name: 'LCP', value: null, unit: 'ms', good: 2500, poor: 4000 },
    { name: 'CLS', value: null, unit: '', good: 0.1, poor: 0.25 },
    { name: 'INP', value: null, unit: 'ms', good: 200, poor: 500 }
  ]);

  function getRating(metric: VitalMetric): 'good' | 'needs-improvement' | 'poor' {
    if (metric.value === null) return 'good';
    if (metric.value <= metric.good) return 'good';
    if (metric.value <= metric.poor) return 'needs-improvement';
    return 'poor';
  }

  function formatValue(metric: VitalMetric): string {
    if (metric.value === null) return 'Measuring...';
    if (metric.name === 'CLS') return metric.value.toFixed(3);
    return `${Math.round(metric.value)}${metric.unit}`;
  }

  onMount(async () => {
    const { onLCP, onCLS, onINP } = await import('web-vitals');

    onLCP((m) => {
      const lcp = metrics.find((v) => v.name === 'LCP');
      if (lcp) lcp.value = m.value;
    });

    onCLS((m) => {
      const cls = metrics.find((v) => v.name === 'CLS');
      if (cls) cls.value = m.value;
    });

    onINP((m) => {
      const inp = metrics.find((v) => v.name === 'INP');
      if (inp) inp.value = m.value;
    });
  });

  const problems = [
    {
      metric: 'CLS',
      title: 'Image without dimensions',
      bad: '<img src="hero.jpg" />',
      good: '<img src="hero.jpg" width="800" height="450" />',
      explanation: 'Without width/height, the browser cannot reserve space. When the image loads, everything below it shifts.'
    },
    {
      metric: 'LCP',
      title: 'Unoptimized hero image',
      bad: '<img src="hero-4k.jpg" loading="lazy" />',
      good: '<img src="hero-800.jpg" fetchpriority="high" />',
      explanation: 'The LCP element should load immediately with high priority. Using loading="lazy" on the hero delays it.'
    },
    {
      metric: 'INP',
      title: 'Blocking click handler',
      bad: 'onclick={() => { heavySync(); }}',
      good: 'onclick={() => { requestIdleCallback(heavy); }}',
      explanation: 'Synchronous computation blocks the main thread, increasing interaction-to-next-paint time.'
    }
  ];
</script>

<div class="vitals-page">
  <h1>Core Web Vitals</h1>

  <div class="metrics-grid">
    {#each metrics as metric}
      <div class="metric-card" data-rating={getRating(metric)}>
        <span class="metric-name">{metric.name}</span>
        <span class="metric-value">{formatValue(metric)}</span>
        <span class="metric-badge">{getRating(metric).replace('-', ' ')}</span>
        <span class="metric-threshold">
          Good: &lt;{metric.name === 'CLS' ? metric.good : metric.good + 'ms'}
        </span>
      </div>
    {/each}
  </div>

  <section class="problems">
    <h2>Common Problems & Fixes</h2>
    {#each problems as problem}
      <div class="problem-card">
        <div class="problem-header">
          <span class="problem-metric">{problem.metric}</span>
          <h3>{problem.title}</h3>
        </div>
        <div class="code-comparison">
          <div class="code-block bad">
            <span class="code-label">Before</span>
            <pre><code>{problem.bad}</code></pre>
          </div>
          <div class="code-block good">
            <span class="code-label">After</span>
            <pre><code>{problem.good}</code></pre>
          </div>
        </div>
        <p class="problem-explanation">{problem.explanation}</p>
      </div>
    {/each}
  </section>
</div>

<style>
  .vitals-page { max-inline-size: 48rem; margin-inline: auto; padding: var(--space-lg); }
  h1 { font-size: var(--text-2xl); margin-block-end: var(--space-xl); }
  h2 { font-size: var(--text-xl); margin-block-end: var(--space-lg); }

  .metrics-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: var(--space-md); margin-block-end: var(--space-2xl); }

  .metric-card { background: var(--color-surface-2); border: 1px solid var(--color-border); border-radius: var(--radius-md); padding: var(--space-lg); text-align: center; display: flex; flex-direction: column; gap: var(--space-xs); }

  .metric-card[data-rating='good'] { border-color: oklch(55% 0.2 145); }
  .metric-card[data-rating='needs-improvement'] { border-color: oklch(70% 0.15 80); }
  .metric-card[data-rating='poor'] { border-color: oklch(55% 0.2 25); }

  .metric-name { font-size: var(--text-sm); font-weight: 700; color: var(--color-text-muted); text-transform: uppercase; letter-spacing: 0.05em; }
  .metric-value { font-size: var(--text-2xl); font-weight: 700; }
  .metric-badge { font-size: var(--text-xs); padding: var(--space-2xs) var(--space-xs); border-radius: var(--radius-full); text-transform: capitalize; }
  .metric-card[data-rating='good'] .metric-badge { background: oklch(90% 0.1 145); color: oklch(35% 0.15 145); }
  .metric-card[data-rating='needs-improvement'] .metric-badge { background: oklch(90% 0.1 80); color: oklch(35% 0.15 80); }
  .metric-card[data-rating='poor'] .metric-badge { background: oklch(90% 0.1 25); color: oklch(35% 0.15 25); }
  .metric-threshold { font-size: var(--text-xs); color: var(--color-text-muted); }

  .problem-card { background: var(--color-surface-2); border: 1px solid var(--color-border); border-radius: var(--radius-md); padding: var(--space-lg); margin-block-end: var(--space-md); }
  .problem-header { display: flex; align-items: center; gap: var(--space-sm); margin-block-end: var(--space-md); }
  .problem-metric { font-size: var(--text-xs); font-weight: 700; background: var(--color-surface-3); padding: var(--space-2xs) var(--space-xs); border-radius: var(--radius-full); }
  .problem-header h3 { font-size: var(--text-base); }

  .code-comparison { display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-sm); margin-block-end: var(--space-md); }
  .code-block { border-radius: var(--radius-sm); padding: var(--space-sm); }
  .code-block.bad { background: oklch(95% 0.03 25); }
  .code-block.good { background: oklch(95% 0.03 145); }
  .code-label { font-size: var(--text-xs); font-weight: 700; text-transform: uppercase; display: block; margin-block-end: var(--space-2xs); }
  .bad .code-label { color: oklch(45% 0.15 25); }
  .good .code-label { color: oklch(45% 0.15 145); }
  pre { margin: 0; font-size: var(--text-xs); overflow-x: auto; }

  .problem-explanation { font-size: var(--text-sm); color: var(--color-text-muted); line-height: 1.5; }
</style>
```

### Explanation

Core Web Vitals are the three metrics Google uses to measure real user experience: LCP (loading), CLS (visual stability), and INP (interactivity). The `web-vitals` library measures these in the browser and reports them as the user navigates and interacts. Displaying them in real-time helps developers understand the impact of their changes. The problem gallery connects specific code patterns to specific metrics — this is the mental model that makes performance optimization systematic rather than guesswork. Every fix demonstrated here is a pattern that appears throughout the course: image dimensions from Module 12, deferred loading from Module 12, and responsive images from Module 6.
</details>
