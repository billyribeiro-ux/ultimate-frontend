# Module 2 — Reactivity — Module Project

## Project: Interactive Dashboard

Build a client-side dashboard that tracks three independent counters, shows derived totals and statistics, persists its state to `localStorage`, and can be reset with a single click. Every rune from Module 2 makes an appearance: `$state` for primary state, `$derived` for totals, `$effect` for persistence, and `$effect` cleanup for a ticking session timer.

## Learning objectives

- Compose primary state, derived values, and effects into a cohesive UI
- Persist reactive state with `$effect` and `$state.snapshot` + `JSON.stringify`
- Restore reactive state at mount from persisted storage
- Type every piece of state, every derived value, and every handler with no `any`
- Keep the dashboard under 50 KB gzipped (no dependencies required)

## Required features

1. **Three counters** (e.g. "Coffees", "Push-ups", "Tasks"). Each counter is a typed `Counter` interface with `id`, `label`, `value`, `goal`. The whole list lives in a single `counters: Counter[] = $state([...])`.
2. **Per-counter controls.** Each counter has `−1`, `+1`, and `reset` buttons with 44×44 touch targets.
3. **Derived totals.** Three `$derived` values: the total of all counter values, the number of counters that have hit their goal, and the average progress percentage across all counters.
4. **Progress bars.** Each counter shows a progress bar whose width is driven by a `style:--progress` custom property computed from `value / goal`.
5. **Session timer.** A ticking clock in the header shows how long the dashboard has been open. Uses `setInterval` inside an `$effect` with proper cleanup.
6. **localStorage persistence.** An `$effect` runs on every counter change and writes `$state.snapshot(counters)` to `localStorage`. On mount, the initial state reads from `localStorage` and falls back to defaults if the key is missing or malformed.
7. **Reset everything.** A "Reset all" button wipes `localStorage` and reinitialises the counters to defaults.
8. **Dark/light aware colours.** Uses PE7 tokens throughout and overrides `--color-brand` for this page's personality.

## Acceptance criteria

- [ ] File at `src/routes/modules/02-reactivity/project/+page.svelte`
- [ ] Every state variable is typed, every handler has a `void` return type
- [ ] No `any`, no `$:` reactive statements, no `on:click`, no `createEventDispatcher`
- [ ] Persistence round-trips: refresh the page and the counters come back
- [ ] Session timer ticks continuously and is cleaned up on unmount
- [ ] Reset clears both state and `localStorage`
- [ ] Lighthouse mobile accessibility: 100
- [ ] Reduced-motion users see no transitions on the progress bars

## Suggested structure

```ts
interface Counter {
    id: string;
    label: string;
    value: number;
    goal: number;
}

const STORAGE_KEY = 'ultimate-frontend/dashboard-v1';

function loadInitial(): Counter[] {
    if (typeof localStorage === 'undefined') return defaults;
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return defaults;
        const parsed: unknown = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.every(isCounter)) return parsed;
    } catch { /* fall through */ }
    return defaults;
}

const counters: Counter[] = $state(loadInitial());

const total: number = $derived(counters.reduce((a, c) => a + c.value, 0));
const metGoals: number = $derived(counters.filter((c) => c.value >= c.goal).length);
const avgProgress: number = $derived(
    counters.reduce((a, c) => a + Math.min(1, c.value / c.goal), 0) / counters.length * 100
);

$effect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify($state.snapshot(counters)));
});

let sessionSeconds: number = $state(0);

$effect(() => {
    const id = setInterval(() => { sessionSeconds += 1; }, 1000);
    return () => clearInterval(id);
});
```

## Suggested timeline

- **30 min.** Design the `Counter` interface and defaults.
- **45 min.** Build the UI — counter cards, progress bars, PE7 styling.
- **30 min.** Wire up `$derived` totals.
- **30 min.** Add persistence with `$effect` + `$state.snapshot`.
- **20 min.** Add session timer with cleanup.
- **15 min.** Manual test: refresh persistence, reset, reduced motion, 44px targets.

## Stretch goals

- Add a fourth counter dynamically via an "Add counter" button (uses `todos.push`-style pattern from Lesson 2.4).
- Export the current dashboard state as a downloadable JSON file.
- Show a notification for one second using `$effect` and a timeout when a counter reaches its goal.

## Deliverable

Commit the route. Module 3 will teach you to refactor this dashboard into typed components with props, and Module 8 will move the persistence to the URL so it survives across devices.
