# Module 9A — Module Project: Weather Dashboard

## Brief

Build a responsive weather dashboard that displays current conditions and a short hourly forecast for three cities using the public, no-auth Open-Meteo API (`https://api.open-meteo.com`). The project demonstrates every concept in Module 9A: universal vs server loads, auto-generated `$types`, the enhanced fetch, layout data, parallel loading, manual cache control, typed errors, streamed slow data, and a prerendered "about" page.

## Goals

You will demonstrate mastery of:

- `+page.ts` / `+page.server.ts` / `+layout.ts` picking the right file for the right job
- Auto-generated `PageLoad`, `PageServerLoad`, `LayoutLoad`, `PageProps` types
- SvelteKit's enhanced `fetch` inside loads
- Layout data plus `parent()` for shared preferences
- `Promise.all` for parallel city fetches
- `depends()` + `invalidate()` for a refresh button
- `error()` from `@sveltejs/kit` for friendly failures
- Streaming a slow "long-range outlook" promise in with `{#await}`
- `prerender = true` for a static About page
- PE7 mobile-first styles with per-city OKLCH accents
- Accessibility — 44px targets, reduced motion, Lighthouse 100 on accessibility

## Required routes

```
src/routes/weather/
├── +layout.svelte             ← shell with unit toggle and refresh button
├── +layout.ts                 ← loads user preferences (unit, cities)
├── +page.svelte               ← dashboard of three cities
├── +page.ts                   ← Promise.all over three cities + streamed outlook
├── about/+page.svelte         ← prerendered about page
├── about/+page.ts             ← prerender = true
└── [city]/
    ├── +page.svelte           ← city detail page
    ├── +page.ts               ← load one city (uses parent() for units)
    └── +error.svelte          ← error boundary for a missing city
```

## Requirements

### 1. Layout data

- `+layout.ts` returns a `preferences` object: `{ unit: 'celsius' | 'fahrenheit', cities: City[] }`. `City` is `{ id: string, name: string, lat: number, lon: number, accent: string }`.
- The list of cities is hard-coded (Berlin, Lisbon, Reykjavík). A real app would read it from a cookie; this exercise uses a constant so no backend is needed.
- The layout shell shows a unit toggle and a refresh button.

### 2. Parallel dashboard load

- `src/routes/weather/+page.ts` uses `await parent()` to read `preferences.cities`, then fires one fetch per city in parallel via `Promise.all`.
- Each fetch hits `https://api.open-meteo.com/v1/forecast?latitude=...&longitude=...&current=temperature_2m,weather_code,wind_speed_10m&hourly=temperature_2m&forecast_days=1`.
- Type the response with a local `interface OpenMeteoResponse`.
- `depends('app:weather')` so the refresh button can re-run.
- Record the total elapsed time with `performance.now()` and return it for display.

### 3. Streaming slow outlook

- `+page.ts` also returns a **non-awaited** promise called `outlook` that simulates a 1.5-second "machine-learning long-range outlook" computation.
- Render it in the component with `{#await data.outlook}<Skeleton />{:then o}<OutlookCard {o} />{/await}`.
- The skeleton is a PE7 shimmer placeholder respecting `prefers-reduced-motion`.

### 4. City detail page

- `src/routes/weather/[city]/+page.ts` reads `params.city` and uses `await parent()` to find the matching `City` object.
- If no match, throws `error(404, 'Unknown city')`.
- Fetches the same Open-Meteo endpoint for that city's coordinates and returns the forecast.
- `+error.svelte` renders a friendly 404 reading `page.status` and `page.error?.message` from `$app/state`.

### 5. Refresh button

- In the layout, a button calls `invalidate('app:weather')` on click. The dashboard re-fetches without a full page reload.
- Show a small spinner (respecting reduced motion) while the invalidation is in flight, using `navigating.to` from `$app/state`.

### 6. Unit toggle

- The layout has a toggle between Celsius and Fahrenheit. Toggling updates `$state` on the layout and the components convert temperatures on the fly via a `$derived` function.
- Storing the choice is out of scope (it resets on reload). The point is to practice reading layout data reactively.

### 7. About page (prerendered)

- `src/routes/weather/about/+page.ts` exports `prerender = true`.
- Returns a static object with the data sources, contributors, and last-updated date.
- `pnpm build` must produce a static HTML file for this route.

### 8. PE7 compliance

- Each city card has its own accent color (blue, coral, aqua). Pass the accent via a CSS custom property.
- Temperature card uses `--text-2xl` or `--text-hero`.
- Mobile-first: cards stack, grid activates at `min-width: 480px`.
- 44px minimum block size on every button and toggle.
- `prefers-reduced-motion` respected for the shimmer skeleton and any hover transitions.

## Grading rubric (100 points)

| Criterion                                                             | Points |
| --------------------------------------------------------------------- | ------ |
| `+page.ts` and `+layout.ts` both use generated `$types`               | 10     |
| Enhanced `fetch` used inside every load                               | 5      |
| `Promise.all` parallelises the three city fetches                    | 10     |
| `parent()` used in the city detail and dashboard                     | 10     |
| `depends('app:weather')` + working refresh button via `invalidate`   | 10     |
| Typed `error(404, ...)` for unknown city, with `+error.svelte`        | 10     |
| Streamed outlook with `{#await}` and accessible skeleton              | 15     |
| Prerendered About page confirmed in the build output                  | 5      |
| Typed `interface OpenMeteoResponse` used consistently                 | 5      |
| Mobile-first PE7 styling with per-city accents                        | 10     |
| Lighthouse mobile Accessibility = 100                                 | 10     |

## Stretch goals

- Add a second layout `+layout.server.ts` that would read unit preference from a cookie (write-only, no real backend).
- Add a `/weather/[city]/hourly` sub-route with a tiny sparkline chart of the next 24 hours (prerender = false).
- Use `preloadData` from `$app/navigation` on hover over a city card to make detail-page navigation instant.
- Add a "stale data" banner that appears when the dashboard's `data.elapsedAt` is older than 5 minutes.
