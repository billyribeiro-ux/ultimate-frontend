---
module: 4
exercise: 5
title: Typed Fetch Pipeline
difficulty: principal
estimated_time: 60
skills_tested:
  - generic fetch wrapper
  - TypeScript type narrowing
  - discriminated union results
  - composable async patterns
  - error type hierarchies
---

# Exercise 4.5 — Typed Fetch Pipeline

## Brief

Design a type-safe fetch pipeline utility that wraps the Fetch API with proper TypeScript generics, discriminated union results (success/error), and composable middleware (logging, caching, retry). Then build a UI that demonstrates the pipeline with multiple concurrent fetches, each showing its pipeline stage in real-time.

## Requirements

1. Create `src/lib/exercises/04/fetchPipeline.ts` — the utility
2. Create `src/routes/exercises/04-control-flow/05/+page.svelte` — the demo UI
3. The pipeline returns `Result<T, E>` — a discriminated union: `{ ok: true; data: T } | { ok: false; error: E }`
4. Support middleware: `retry(n)`, `timeout(ms)`, `cache(key)`
5. Full TypeScript generics: `fetchPipeline<T>(url, schema) => Promise<Result<T, FetchError>>`
6. The UI fetches 3 different endpoints simultaneously
7. Each fetch shows its current stage: 'idle' | 'fetching' | 'retrying' | 'cached' | 'success' | 'error'
8. Use `{#await}` in combination with reactive state to show real-time stage updates
9. Demonstrate type narrowing: after checking `result.ok`, TypeScript knows the type
10. The pipeline must be composable (chainable configuration)

## Constraints

- No external fetch libraries (axios, ky, etc.)
- Result type must be a proper discriminated union (not exceptions)
- Error types must be specific: `NetworkError | TimeoutError | ParseError | HttpError`
- The pipeline must work on both server and client (no browser-only APIs beyond fetch)
- TypeScript strict — zero `any`

## Hints (progressive)

<details>
<summary>Hint 1 (free)</summary>

A `Result<T, E>` type forces the consumer to check `.ok` before accessing `.data` or `.error`. This replaces try/catch with type narrowing: `if (result.ok) { result.data /* typed as T */ }`.
</details>

<details>
<summary>Hint 2 (conceptual)</summary>

The pipeline is a builder pattern: `createPipeline<User>('/api/users').retry(3).timeout(5000).cache('users').execute()`. Each method returns the pipeline instance. The `execute` method runs the fetch with all configured middleware in order. Use an error type hierarchy with a `kind` discriminant.
</details>

<details>
<summary>Hint 3 (code sketch)</summary>

```typescript
type FetchError =
  | { kind: 'network'; message: string }
  | { kind: 'timeout'; ms: number }
  | { kind: 'http'; status: number; statusText: string }
  | { kind: 'parse'; message: string };

type Result<T, E> = { ok: true; data: T } | { ok: false; error: E };

function createPipeline<T>(url: string) {
  let retries = 0;
  let timeoutMs = 30000;

  return {
    retry(n: number) { retries = n; return this; },
    timeout(ms: number) { timeoutMs = ms; return this; },
    async execute(): Promise<Result<T, FetchError>> {
      // implementation
    }
  };
}
```
</details>

## Solution

<details>
<summary>Full solution (click to reveal)</summary>

**`src/lib/exercises/04/fetchPipeline.ts`**

```typescript
export type FetchError =
  | { kind: 'network'; message: string }
  | { kind: 'timeout'; ms: number }
  | { kind: 'http'; status: number; statusText: string }
  | { kind: 'parse'; message: string };

export type Result<T, E = FetchError> =
  | { ok: true; data: T }
  | { ok: false; error: E };

export type PipelineStage = 'idle' | 'fetching' | 'retrying' | 'cached' | 'success' | 'error';

export interface PipelineOptions {
  retries: number;
  timeoutMs: number;
  cacheKey: string | null;
  onStageChange?: (stage: PipelineStage) => void;
}

const cache = new Map<string, { data: unknown; timestamp: number }>();
const CACHE_TTL = 60_000; // 1 minute

export function createPipeline<T>(url: string) {
  const options: PipelineOptions = {
    retries: 0,
    timeoutMs: 30_000,
    cacheKey: null,
    onStageChange: undefined
  };

  const pipeline = {
    retry(n: number) {
      options.retries = n;
      return pipeline;
    },
    timeout(ms: number) {
      options.timeoutMs = ms;
      return pipeline;
    },
    cache(key: string) {
      options.cacheKey = key;
      return pipeline;
    },
    onStage(fn: (stage: PipelineStage) => void) {
      options.onStageChange = fn;
      return pipeline;
    },
    async execute(): Promise<Result<T>> {
      const setStage = options.onStageChange ?? (() => {});

      // Check cache
      if (options.cacheKey) {
        const cached = cache.get(options.cacheKey);
        if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
          setStage('cached');
          return { ok: true, data: cached.data as T };
        }
      }

      let lastError: FetchError | null = null;

      for (let attempt = 0; attempt <= options.retries; attempt++) {
        if (attempt > 0) {
          setStage('retrying');
          await new Promise((r) => setTimeout(r, Math.pow(2, attempt - 1) * 1000));
        } else {
          setStage('fetching');
        }

        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), options.timeoutMs);

          const response = await fetch(url, { signal: controller.signal });
          clearTimeout(timeoutId);

          if (!response.ok) {
            lastError = { kind: 'http', status: response.status, statusText: response.statusText };
            continue;
          }

          let data: T;
          try {
            data = await response.json() as T;
          } catch {
            setStage('error');
            return { ok: false, error: { kind: 'parse', message: 'Invalid JSON response' } };
          }

          // Cache success
          if (options.cacheKey) {
            cache.set(options.cacheKey, { data, timestamp: Date.now() });
          }

          setStage('success');
          return { ok: true, data };
        } catch (err) {
          if (err instanceof DOMException && err.name === 'AbortError') {
            lastError = { kind: 'timeout', ms: options.timeoutMs };
          } else {
            lastError = { kind: 'network', message: err instanceof Error ? err.message : 'Unknown error' };
          }
        }
      }

      setStage('error');
      return { ok: false, error: lastError! };
    }
  };

  return pipeline;
}
```

**`src/routes/exercises/04-control-flow/05/+page.svelte`**

```svelte
<script lang="ts">
  import { createPipeline, type Result, type FetchError, type PipelineStage } from '$lib/exercises/04/fetchPipeline';

  interface Post {
    id: number;
    title: string;
    body: string;
  }

  interface FetchDemo {
    label: string;
    stage: PipelineStage;
    promise: Promise<Result<Post[]>>;
  }

  let demos: FetchDemo[] = $state([]);

  function runDemos(): void {
    demos = [
      {
        label: 'Standard Fetch',
        stage: 'idle',
        promise: createPipeline<Post[]>('https://jsonplaceholder.typicode.com/posts?_limit=3')
          .timeout(5000)
          .onStage((s) => { demos[0].stage = s; })
          .execute()
      },
      {
        label: 'With Retry (bad URL)',
        stage: 'idle',
        promise: createPipeline<Post[]>('https://jsonplaceholder.typicode.com/invalid-endpoint')
          .retry(2)
          .timeout(3000)
          .onStage((s) => { demos[1].stage = s; })
          .execute()
      },
      {
        label: 'Cached Fetch',
        stage: 'idle',
        promise: createPipeline<Post[]>('https://jsonplaceholder.typicode.com/posts?_limit=3')
          .cache('posts-cache')
          .timeout(5000)
          .onStage((s) => { demos[2].stage = s; })
          .execute()
      }
    ];
  }

  function errorDisplay(error: FetchError): string {
    switch (error.kind) {
      case 'network': return `Network: ${error.message}`;
      case 'timeout': return `Timeout after ${error.ms}ms`;
      case 'http': return `HTTP ${error.status}: ${error.statusText}`;
      case 'parse': return `Parse: ${error.message}`;
    }
  }

  // Auto-run on mount
  runDemos();
</script>

<main class="page">
  <h1>Typed Fetch Pipeline</h1>
  <button onclick={runDemos}>Re-run All</button>

  <div class="demos">
    {#each demos as demo, i}
      <article class="demo-card">
        <header>
          <h2>{demo.label}</h2>
          <span class="stage" data-stage={demo.stage}>{demo.stage}</span>
        </header>

        {#await demo.promise}
          <div class="loading">
            <div class="spinner"></div>
            <p>Stage: {demo.stage}</p>
          </div>
        {:then result}
          {#if result.ok}
            <ul class="results">
              {#each result.data as post (post.id)}
                <li>
                  <strong>{post.title.slice(0, 40)}...</strong>
                </li>
              {/each}
            </ul>
          {:else}
            <div class="error">
              <p>{errorDisplay(result.error)}</p>
            </div>
          {/if}
        {:catch err}
          <div class="error">
            <p>Unexpected: {err}</p>
          </div>
        {/await}
      </article>
    {/each}
  </div>
</main>

<style>
  .page {
    max-inline-size: var(--content-max);
    margin-inline: auto;
    padding: var(--space-xl) var(--space-md);
  }

  h1 { font-size: var(--text-2xl); margin-block-end: var(--space-lg); }
  h2 { font-size: var(--text-base); font-weight: 600; }

  button {
    padding: var(--space-sm) var(--space-md);
    background: var(--color-brand);
    color: oklch(100% 0 0);
    font-weight: 600;
    border-radius: var(--radius-md);
    margin-block-end: var(--space-lg);
  }

  .demos {
    display: grid;
    gap: var(--space-lg);
  }

  @media (min-width: 768px) {
    .demos { grid-template-columns: repeat(3, 1fr); }
  }

  .demo-card {
    background: var(--color-surface-2);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-lg);
    padding: var(--space-lg);
    display: grid;
    gap: var(--space-md);
  }

  header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .stage {
    font-size: var(--text-xs);
    font-weight: 700;
    padding: var(--space-xs) var(--space-sm);
    border-radius: var(--radius-full);
    text-transform: uppercase;
    background: var(--color-surface);
  }

  .stage[data-stage="success"] { color: var(--color-success); }
  .stage[data-stage="error"] { color: var(--color-error); }
  .stage[data-stage="fetching"] { color: var(--color-brand); }
  .stage[data-stage="retrying"] { color: var(--color-warning); }
  .stage[data-stage="cached"] { color: var(--color-success); }

  .loading {
    display: grid;
    place-items: center;
    gap: var(--space-sm);
    padding: var(--space-lg);
  }

  .spinner {
    inline-size: 2rem;
    block-size: 2rem;
    border: 3px solid var(--color-border);
    border-block-start-color: var(--color-brand);
    border-radius: var(--radius-full);
    animation: spin 0.8s linear infinite;
  }

  .results {
    list-style: none;
    padding: 0;
    display: grid;
    gap: var(--space-xs);
    font-size: var(--text-sm);
  }

  .error {
    color: var(--color-error);
    font-size: var(--text-sm);
    padding: var(--space-md);
    background: oklch(95% 0.02 25);
    border-radius: var(--radius-md);
  }

  @keyframes spin {
    to { rotate: 360deg; }
  }

  @media (prefers-reduced-motion: reduce) {
    .spinner { animation: none; opacity: 0.5; }
  }
</style>
```

### Explanation

This exercise introduces a production-grade pattern: the `Result<T, E>` discriminated union replaces exceptions with explicit error handling. After checking `result.ok`, TypeScript narrows the type — you get `result.data` (typed as `T`) or `result.error` (typed as `FetchError`). The builder pattern for pipeline configuration is type-safe and chainable. The `FetchError` union with `kind` discriminant lets consumers handle specific error types differently (show a retry button for network errors, redirect for 401s, etc.). This pattern is used in production by libraries like Effect, neverthrow, and fp-ts. The pipeline's `onStage` callback demonstrates how to bridge imperative async operations with reactive UI state.
</details>
