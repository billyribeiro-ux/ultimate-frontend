# Module 12 — Performance, Testing & Deployment: Video Lecture Script Outlines

> **Recording note:** Set editor font to 18px minimum. Keep Lighthouse/DevTools Performance panel visible. Split-screen: editor (left), browser (right).

---

## Lesson 12.1 — Performance fundamentals — Core Web Vitals (LCP, CLS, INP)

**Duration:** 12 minutes
**Screen setup:** Browser with Lighthouse panel, slides for metric definitions

### Hook (30 seconds)
"Google ranks your site by three numbers: how fast the largest element appears (LCP), how much the layout shifts (CLS), and how quickly the page responds to input (INP). These are Core Web Vitals — and they affect your search ranking, your bounce rate, and your revenue."

### Demo sequence
1. **[0:30-3:00] The three metrics** — Define LCP, CLS, INP with thresholds: good, needs improvement, poor.
2. **[3:00-5:30] Measuring in DevTools** — Run Lighthouse. Show the Web Vitals overlay in DevTools Performance panel.
3. **[5:30-8:00] Common causes** — LCP: unoptimized images, render-blocking CSS. CLS: images without dimensions, dynamic content. INP: heavy JavaScript handlers.
4. **[8:00-10:00] Build the mini-build** — Dashboard displaying the three metrics with color-coded scores.
5. **[10:00-11:30] Edge case / gotcha** — "Lab metrics (Lighthouse) differ from field metrics (real users). Always check both. Chrome UX Report gives you field data."

### Key moments
- 0:30 — "Three numbers that matter"
- 3:00 — "Measuring with DevTools"
- 5:30 — "Common performance killers"
- 8:00 — "Metrics dashboard mini-build"
- 10:00 — "Lab vs field data"

### Callout graphics
- Core Web Vitals threshold chart
- LCP/CLS/INP visual examples
- Lab vs field comparison

### Outro (30 seconds)
"Core Web Vitals measure real user experience. Next lesson: image optimization."

---

## Lesson 12.2 — Image optimization

**Duration:** 11 minutes
**Screen setup:** Editor with image component, Network tab showing image sizes

### Hook (30 seconds)
"Images are 50% of page weight. A 4MB hero image on a phone with 3G is a 12-second load. Proper image optimization — format, sizing, lazy loading, and srcset — can cut that to under 1 second."

### Demo sequence
1. **[0:30-2:30] The problem** — Show a page with unoptimized images. Network tab: 4MB total.
2. **[2:30-5:00] Modern formats** — WebP, AVIF. Show the same image in JPEG (200KB), WebP (80KB), AVIF (50KB).
3. **[5:00-7:30] Responsive images** — `srcset` and `sizes`. Serve smaller images to smaller screens.
4. **[7:30-9:30] Build the mini-build** — Image gallery with lazy loading, responsive srcset, and format fallbacks.
5. **[9:30-10:30] Edge case / gotcha** — "Always set width and height attributes on images to prevent CLS. Even for responsive images, the aspect ratio from width/height prevents layout shift."

### Key moments
- 0:30 — "50% of page weight"
- 2:30 — "Modern image formats"
- 5:00 — "Responsive srcset"
- 7:30 — "Gallery mini-build"
- 9:30 — "Width/height for CLS"

### Callout graphics
- Format comparison table
- srcset/sizes explanation
- Before/after Network tab

### Outro (30 seconds)
"Optimized images dramatically improve LCP. Next lesson: code splitting and lazy loading."

---

## Lesson 12.3 — Code splitting and lazy loading

**Duration:** 10 minutes
**Screen setup:** Editor, Network tab showing chunk loading

### Hook (30 seconds)
"Your app has 50 pages. The user visits one. Why ship all 50 pages' JavaScript? SvelteKit automatically code-splits by route. You load only what you need, when you need it."

### Demo sequence
1. **[0:30-2:30] Automatic route splitting** — Show Network tab: only the current page's JS loads. Navigate — new chunks load on demand.
2. **[2:30-5:00] Dynamic imports** — `import()` for heavy components. Load a chart library only when the user clicks "Show chart".
3. **[5:00-7:00] Preloading** — `data-sveltekit-preload-data` for link hover preloading. Show chunks loading before the click.
4. **[7:00-8:30] Build the mini-build** — Page with a lazily loaded markdown renderer that only loads when "Preview" is clicked.
5. **[8:30-9:30] Edge case / gotcha** — "Dynamic imports create new chunks. Too many small chunks hurt performance due to HTTP overhead. Bundle related components together."

### Key moments
- 0:30 — "Load what you need"
- 2:30 — "Dynamic imports"
- 5:00 — "Hover preloading"
- 7:00 — "Lazy preview mini-build"
- 8:30 — "Chunk granularity"

### Callout graphics
- Route-based code splitting diagram
- Dynamic import pattern
- Preloading strategies

### Outro (30 seconds)
"Code splitting ensures users only download what they need. Next lesson: effect performance."

---

## Lesson 12.4 — $effect performance — avoiding unnecessary re-runs

**Duration:** 10 minutes
**Screen setup:** Editor with effects, browser console showing re-run counts

### Hook (30 seconds)
"An effect that runs on every keystroke. An effect that triggers another effect. An effect that reads state it should not track. Bad effect patterns waste CPU cycles and cause infinite loops. Good effects are surgical — they run only when necessary."

### Demo sequence
1. **[0:30-2:30] Over-tracking** — An effect that reads too many reactive values. Show it re-running unnecessarily.
2. **[2:30-5:00] Narrowing dependencies** — Extract the specific value. Use `untrack()` for values the effect should read but not track.
3. **[5:00-7:00] Effect chains** — Effect A sets state that triggers Effect B. Show the cascade. "Use $derived instead."
4. **[7:00-8:30] Build the mini-build** — Before/after: same feature with a wasteful effect pattern and an optimized one. Show re-run counts.
5. **[8:30-9:30] Edge case / gotcha** — "untrack() is for performance optimization. If you find yourself using it constantly, you probably have a design problem — reconsider whether the effect is the right tool."

### Key moments
- 0:30 — "Effects that run too often"
- 2:30 — "Narrowing with untrack"
- 5:00 — "Effect chain anti-pattern"
- 7:00 — "Before/after comparison"
- 8:30 — "When untrack is a code smell"

### Callout graphics
- Effect dependency tracking visualization
- untrack() usage pattern
- Effect vs $derived decision

### Outro (30 seconds)
"Surgical effects prevent wasted work. Next lesson: memoization with $derived."

---

## Lesson 12.5 — Memoization with $derived

**Duration:** 10 minutes
**Screen setup:** Editor with derived computations, performance timeline

### Hook (30 seconds)
"An expensive computation runs on every state change — even when the inputs have not changed. $derived automatically memoizes: it only recalculates when its dependencies actually change. Free memoization from the compiler."

### Demo sequence
1. **[0:30-2:30] Expensive computation** — Sorting 10,000 items on every keystroke in an unrelated input. Show the jank.
2. **[2:30-5:00] $derived memoization** — Wrap in $derived. Show that it only recalculates when the items array changes, not on every keystroke.
3. **[5:00-7:00] $derived.by() for complex logic** — Multi-step derivation with early returns and conditional logic.
4. **[7:00-8:30] Build the mini-build** — Filtered and sorted product list where the sort only recalculates when sort criteria change.
5. **[8:30-9:30] Edge case / gotcha** — "$derived is not a cache. It recalculates when dependencies change, even if the result is the same. For true caching (avoid recalculation on same output), you need manual memoization."

### Key moments
- 0:30 — "Unnecessary recalculation"
- 2:30 — "$derived stops the waste"
- 5:00 — "Complex derivations"
- 7:00 — "Product list mini-build"
- 8:30 — "Memoization vs caching"

### Callout graphics
- Dependency tracking flow
- Before/after performance comparison
- $derived vs manual memoization

### Outro (30 seconds)
"$derived gives you automatic memoization. Next lesson: reusable Svelte actions."

---

## Lesson 12.6 — Reusable Svelte actions (use:)

**Duration:** 11 minutes
**Screen setup:** Editor with action code, browser showing action behavior

### Hook (30 seconds)
"You need click-outside detection on three components. You need intersection observer on five images. You need focus trap on every modal. Actions let you write DOM behavior once and attach it to any element with use:actionName."

### Demo sequence
1. **[0:30-2:30] Anatomy of an action** — Function that receives a node, returns `{ update?, destroy? }`. Attach with `use:`.
2. **[2:30-5:00] Click outside** — Build a clickOutside action. Attach it to a dropdown.
3. **[5:00-7:30] Intersection observer** — Build a lazyLoad action that loads images when they enter the viewport.
4. **[7:30-9:30] Build the mini-build** — Tooltip action: hover shows a tooltip, configurable position and text.
5. **[9:30-10:30] Edge case / gotcha** — "The `update` function fires when the action's parameter changes. If you pass a reactive value, the action stays in sync automatically."

### Key moments
- 0:30 — "Reusable DOM behavior"
- 2:30 — "Click outside action"
- 5:00 — "Intersection observer action"
- 7:30 — "Tooltip action mini-build"
- 9:30 — "Reactive parameters"

### Callout graphics
- Action lifecycle diagram
- Action API: function → { update, destroy }
- Three action examples

### Outro (30 seconds)
"Actions encapsulate DOM behavior for reuse. Next lesson: error boundaries."

---

## Lesson 12.7 — Error boundaries — <svelte:boundary>

**Duration:** 10 minutes
**Screen setup:** Editor with error boundary, browser showing error recovery

### Hook (30 seconds)
"A component throws an error. Without a boundary, the entire page crashes. With `<svelte:boundary>`, the error is caught, a fallback is shown, and the rest of the page continues working. Graceful degradation, not catastrophic failure."

### Demo sequence
1. **[0:30-2:30] The crash problem** — A component throws. The entire page goes blank.
2. **[2:30-5:00] svelte:boundary** — Wrap the risky component. Show the fallback rendering when the error occurs.
3. **[5:00-7:00] Error recovery** — Provide a retry button that resets the component.
4. **[7:00-8:30] Build the mini-build** — Dashboard with isolated error boundaries around each widget.
5. **[8:30-9:30] Edge case / gotcha** — "Error boundaries catch render errors only, not errors in event handlers or async code. Use try/catch for those."

### Key moments
- 0:30 — "Page crash"
- 2:30 — "Catch with boundary"
- 5:00 — "Retry and recovery"
- 7:00 — "Dashboard widgets"
- 8:30 — "Render errors only"

### Callout graphics
- Error boundary wrapping diagram
- Fallback rendering flow
- What boundaries catch vs what they don't

### Outro (30 seconds)
"Error boundaries prevent crashes from spreading. Next lesson: accessibility."

---

## Lesson 12.8 — Accessibility — ARIA, keyboard navigation, focus management

**Duration:** 12 minutes
**Screen setup:** Editor with accessible component, screen reader demo

### Hook (30 seconds)
"15% of the world lives with a disability. If your app is not accessible, you are excluding hundreds of millions of people — and potentially violating legal requirements. Accessibility is not a feature. It is a baseline."

### Demo sequence
1. **[0:30-3:00] ARIA roles and attributes** — role, aria-label, aria-labelledby, aria-live. Show screen reader output.
2. **[3:00-5:30] Keyboard navigation** — Tab order, focus management, keyboard shortcuts. Show tabbing through a form.
3. **[5:30-8:00] Focus trapping** — Modal focus trap: Tab stays inside the modal, Escape closes it.
4. **[8:00-10:00] Build the mini-build** — Accessible dropdown menu: keyboard navigation, ARIA, focus management.
5. **[10:00-11:30] Edge case / gotcha** — "Do not add aria-label to elements that already have visible text. The label overrides the visible text for screen readers, causing confusion."

### Key moments
- 0:30 — "Accessibility is baseline"
- 3:00 — "Keyboard navigation"
- 5:30 — "Focus trapping"
- 8:00 — "Dropdown mini-build"
- 10:00 — "aria-label vs visible text"

### Callout graphics
- ARIA attributes reference
- Tab order visualization
- Focus trap diagram

### Outro (30 seconds)
"Accessibility makes your app usable by everyone. Next lesson: unit testing with Vitest."

---

## Lesson 12.9 — Testing with Vitest — unit testing

**Duration:** 11 minutes
**Screen setup:** Editor with test file and source file, terminal showing test output

### Hook (30 seconds)
"Your function calculates tax. Does it handle edge cases? Zero amounts? Negative values? International currencies? A unit test runs the function 50 times with different inputs and tells you in 200 milliseconds. No manual testing needed."

### Demo sequence
1. **[0:30-2:30] Vitest setup** — Configure Vitest in a SvelteKit project. Write the first test.
2. **[2:30-5:00] Testing functions** — Test a utility function with multiple inputs. Show describe/it/expect pattern.
3. **[5:00-7:30] Testing stores** — Import a .svelte.ts store. Call methods. Assert state changes.
4. **[7:30-9:30] Build the mini-build** — Test suite for a shopping cart store: add, remove, total, empty.
5. **[9:30-10:30] Edge case / gotcha** — "Vitest runs in Node.js, not the browser. DOM APIs are not available unless you configure jsdom or happy-dom."

### Key moments
- 0:30 — "50 tests in 200ms"
- 2:30 — "Testing functions"
- 5:00 — "Testing stores"
- 7:30 — "Cart store test suite"
- 9:30 — "No DOM in Node.js"

### Callout graphics
- Test file structure
- describe/it/expect pattern
- Store testing flow

### Outro (30 seconds)
"Unit tests catch bugs before users do. Next lesson: E2E testing with Playwright."

---

## Lesson 12.10 — E2E testing with Playwright

**Duration:** 11 minutes
**Screen setup:** Editor with Playwright test, browser showing automated interaction

### Hook (30 seconds)
"Unit tests verify functions. E2E tests verify user journeys. 'Sign up, add a product, checkout, verify the order confirmation.' Playwright drives a real browser through your actual app — clicking, typing, navigating — and verifies the result."

### Demo sequence
1. **[0:30-2:30] Playwright setup** — Configure Playwright with SvelteKit. Write the first test.
2. **[2:30-5:00] User interaction** — Click buttons, fill forms, navigate pages. Assert text content and element states.
3. **[5:00-7:30] Page objects** — Organize selectors and actions into page object classes for maintainable tests.
4. **[7:30-9:30] Build the mini-build** — E2E test for a login flow: visit login page, fill credentials, submit, verify dashboard.
5. **[9:30-10:30] Edge case / gotcha** — "E2E tests are slow. Run them in CI, not on every save. Reserve E2E for critical user paths."

### Key moments
- 0:30 — "Real browser testing"
- 2:30 — "User interactions"
- 5:00 — "Page objects"
- 7:30 — "Login flow test"
- 9:30 — "Speed trade-off"

### Callout graphics
- E2E test anatomy
- Page object pattern
- Test pyramid: unit → integration → E2E

### Outro (30 seconds)
"E2E tests verify complete user journeys. Next lesson: deployment adapters."

---

## Lesson 12.11 — Deployment — adapters and platforms

**Duration:** 11 minutes
**Screen setup:** Terminal showing build output, deployment platform dashboard

### Hook (30 seconds)
"Your app works locally. Now deploy it. SvelteKit adapters transform your app for Vercel, Cloudflare, Node.js, or static hosting. One config change, and your app runs anywhere."

### Demo sequence
1. **[0:30-2:30] What adapters do** — Adapters transform the SvelteKit build output for a specific platform's runtime.
2. **[2:30-5:00] adapter-auto** — The default. Detects Vercel, Netlify, Cloudflare automatically.
3. **[5:00-7:30] Platform-specific adapters** — adapter-node (self-hosted), adapter-static (no server), adapter-cloudflare (edge).
4. **[7:30-9:30] Build the mini-build** — Deploy to two platforms: static (GitHub Pages) and edge (Cloudflare).
5. **[9:30-10:30] Edge case / gotcha** — "adapter-static cannot handle dynamic routes, form actions, or API routes. If your app needs server-side features, use a server-capable adapter."

### Key moments
- 0:30 — "Adapters bridge build to platform"
- 2:30 — "adapter-auto detection"
- 5:00 — "Platform adapters"
- 7:30 — "Dual deployment"
- 9:30 — "Static limitations"

### Callout graphics
- Adapter selection flowchart
- Platform comparison table
- Build output structure

### Outro (30 seconds)
"Adapters deploy your SvelteKit app anywhere. Last lesson: 3D performance with Threlte."

---

## Lesson 12.12 — 3D performance with Threlte — lazy canvas, DPR, frameloop demand

**Duration:** 11 minutes
**Screen setup:** Editor with Threlte scene, browser showing performance metrics

### Hook (30 seconds)
"3D is expensive. A Three.js scene runs 60 frames per second — even when nothing is moving. Threlte gives you tools to render only when needed: lazy canvas loading, DPR scaling, and demand-driven frame loops that idle when static."

### Demo sequence
1. **[0:30-2:30] The cost of 3D** — Show GPU usage of a static 3D scene running at 60fps. "The GPU is working hard to render nothing."
2. **[2:30-5:00] Frameloop demand** — Set frameloop to 'demand'. The scene only re-renders when something changes. Show GPU usage drop to near zero.
3. **[5:00-7:30] DPR scaling** — Lower the device pixel ratio on high-DPI screens. Show the visual trade-off vs performance gain.
4. **[7:30-9:30] Build the mini-build** — Product viewer with demand-driven rendering: rotates on interaction, idles when untouched.
5. **[9:30-10:30] Edge case / gotcha** — "Demand frameloop requires you to manually invalidate when state changes. Use `useThrelte().invalidate()` to request a re-render."

### Key moments
- 0:30 — "The 60fps cost"
- 2:30 — "Demand-driven rendering"
- 5:00 — "DPR trade-offs"
- 7:30 — "Product viewer mini-build"
- 9:30 — "Manual invalidation"

### Callout graphics
- Frameloop comparison: always vs demand
- DPR scaling visual comparison
- GPU usage before/after

### Outro (30 seconds)
"Demand-driven rendering makes 3D scenes efficient. Module 12 is complete — you now have performance optimization, testing, deployment, and 3D performance tools."

---
