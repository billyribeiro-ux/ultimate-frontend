# Module 4 Project — Dynamic Product Listing

## Brief

Build a filterable, searchable product listing page that combines every technique from Module 4: conditional rendering, keyed iteration, `{#key}` for animation replay, `{#await}` for async data, typed error handling, and runtime validation at the network boundary. The result is a page that feels like a small e-commerce catalogue and behaves correctly through every happy and unhappy path.

## Required features

### Data

- `static/products.json` contains at least **12 products** across **3 categories**. Each product has `id` (string), `name` (string), `category` (string), `price` (number), and `inStock` (boolean).
- A generic `fetchJson<T>(url)` helper with explicit `Promise<T>` return type.
- A `loadProducts()` function that returns `Promise<Product[]>` and validates every entry with a user-defined type guard before returning.

### Page

Create `src/routes/modules/04-control-flow/project/+page.svelte` with the following sections:

1. **Loading state** — while products are being fetched, show a skeleton grid with at least four shimmering placeholder rows.
2. **Error state** — if `loadProducts()` throws, show a panel with the message and a "Retry" button that reassigns the Promise to trigger another attempt.
3. **Search bar** — an `Input` component bound via `$bindable()` that filters products by name (case-insensitive substring).
4. **Category filter** — a row of buttons, one per category plus an "All" button. Clicking one sets the active category; the visible list is filtered by both search text and category.
5. **Stock toggle** — a checkbox that, when checked, hides out-of-stock products.
6. **Product grid** — a keyed `{#each}` over the filtered list. Key by `product.id`. Display `name`, `category` as a `Badge`, and `price` formatted to two decimals.
7. **Empty state** — `{:else}` on the `{#each}` that renders a friendly "No products match your filters" message.
8. **Animated count** — above the grid, a "{count} products" label wrapped in `{#key filteredCount}` so its fade-in animation replays every time the filter changes.

## Required techniques (checklist)

- [ ] `{#await}` with full `{:then}` and `{:catch}` branches
- [ ] `{#each}` with an explicit `(product.id)` key
- [ ] `{:else}` on `{#each}` for the empty state
- [ ] `{#if}` / `{:else if}` chain for at least one multi-branch UI state
- [ ] `{#key}` wrapping the count label (or another element) with a replayable animation
- [ ] Reactive filtering using `$derived` that composes search + category + stock toggle
- [ ] A `Promise<Product[]>` stored in `$state` so a "Retry" button can reassign it
- [ ] Runtime validation of the loaded JSON with a `function is...(v: unknown): v is T` guard
- [ ] Typed error narrowing in `{:catch err}` using `err instanceof Error`

## Constraints

- TypeScript strict, zero `any`. Every function and prop is typed.
- Svelte 5 runes only. No `export let`, no `<slot>`, no `on:click`.
- PE7 CSS — tokens only, mobile-first, `prefers-reduced-motion` respected.
- Reuse `Input`, `Button`, `Badge`, and `Card` components from Module 3's library.
- `svelte-autofixer` reports zero issues.

## Acceptance criteria

- [ ] Fresh page load shows the skeleton, then the full grid.
- [ ] Typing in the search bar filters the grid live without resetting focus.
- [ ] Changing category preserves the search text.
- [ ] Toggling "in stock only" combines with search and category correctly.
- [ ] The product count label replays its fade-in animation every time the filter changes.
- [ ] Changing `products.json` to have a malformed entry causes the error panel to appear with the validation message.
- [ ] Clicking Retry after an error clears the error and re-fetches.
- [ ] Every button has `min-block-size: 44px` and a visible focus ring.
- [ ] Lighthouse mobile Accessibility score is 100.

## Stretch goals

- Debounce the search input with 200 ms delay (Module 5 teaches this but you can implement it early with `setTimeout`).
- Persist the current filter in `window.sessionStorage` so it survives a reload.
- Sort the grid by price or name with a dropdown.
- Add a per-product `Modal` that opens on click and shows additional fields.
