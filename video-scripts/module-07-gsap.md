# Module 7 — GSAP Animation: Video Lecture Script Outlines

> **Recording note:** Set editor font to 18px minimum. Record at 60fps for smooth animation capture. Use Chrome DevTools Animations panel for timeline inspection. Have GSAP docs open for reference.

---

## Lesson 7.1 — What GSAP is and when to reach for it

**Duration:** 12 minutes
**Screen setup:** Split-screen: slides with animation layer diagram (left), browser showing animation examples (right)

### Hook (30 seconds)
"You need a hero section where the headline slides in, then the subtitle fades up, then three feature cards stagger in from below, and all of this is tied to the user's scroll position. CSS transitions can't sequence. Svelte transitions can't scroll-drive. GSAP can do both — and it's been doing it since before most frameworks existed."

### Demo sequence
1. **[0:30-3:00] The four animation layers** — Diagram: Layer 1 CSS transitions (hover/focus), Layer 2 Svelte transitions (mount/unmount), Layer 3 svelte/motion (value interpolation), Layer 4 GSAP (timelines, scroll, stagger). "Each layer has a job. GSAP is for when the first three can't express what you need."
2. **[3:00-5:30] What GSAP does** — Show a GSAP timeline: headline slides in, subtitle follows, cards stagger. All in one readable chain. "Multi-element, multi-step, precise timing — GSAP's sweet spot."
3. **[5:30-8:00] When NOT to use GSAP** — Show hover effects done with CSS (better). Show mount/unmount with Svelte transitions (better). Show single-value animation with svelte/motion (better). "Don't install a 50KB library for a hover effect."
4. **[8:00-10:00] GSAP's license and ecosystem** — All free as of 2024. Core + plugins. 50KB gzipped. Tree-shakeable.
5. **[10:00-11:30] Edge case / gotcha** — "GSAP is a runtime library. It ships JavaScript to the browser. Every kilobyte matters for Core Web Vitals. Lazy-load GSAP on routes that need it, not globally."

### Key moments (timestamps the editor should chapter-mark)
- 0:30 — "When CSS and Svelte aren't enough"
- 3:00 — "GSAP in action"
- 5:30 — "When GSAP is overkill"
- 8:00 — "License and ecosystem"
- 10:00 — "Bundle size responsibility"

### Callout graphics
- Four animation layers pyramid diagram
- GSAP timeline visualization
- Decision flowchart: CSS -> Svelte -> svelte/motion -> GSAP

### Outro (30 seconds)
"GSAP fills the gap between built-in animations and production-quality motion design. Next lesson, we install it with pnpm and set up TypeScript types."

---

## Lesson 7.2 — Installing GSAP with pnpm and TypeScript types

**Duration:** 10 minutes
**Screen setup:** Terminal for installation, then editor showing imports and types

### Hook (30 seconds)
"Three commands. That's all it takes to go from zero to a fully typed GSAP installation in your SvelteKit project. But the third command — registering plugins — is where most tutorials stop and most bugs start."

### Demo sequence
1. **[0:30-2:30] Installation** — `pnpm add gsap`. Show package.json update. Show node_modules size.
2. **[2:30-5:00] TypeScript types** — GSAP ships built-in types. Import `gsap` — show full IntelliSense. Show type hints for `gsap.to()`, `gsap.timeline()`.
3. **[5:00-7:30] Plugin registration** — `import { ScrollTrigger } from 'gsap/ScrollTrigger'; gsap.registerPlugin(ScrollTrigger)`. Explain why: tree-shaking. Unregistered plugins don't work.
4. **[7:30-8:30] SvelteKit SSR safety** — GSAP requires `window`. Wrap in `browser` check or use in `$effect` (client-only). Show the SSR error and the fix.
5. **[8:30-9:30] Edge case / gotcha** — "Import from `gsap/dist/gsap` if you get ESM/CJS conflicts. SvelteKit uses ESM; some GSAP builds default to CJS. The `/dist/` path forces the correct module format."

### Key moments (timestamps the editor should chapter-mark)
- 0:30 — "Three commands to install"
- 2:30 — "Built-in TypeScript types"
- 5:00 — "Plugin registration"
- 7:30 — "SSR safety"
- 8:30 — "Module format conflicts"

### Callout graphics
- Installation command sequence
- Plugin registration diagram
- SSR guard pattern

### Outro (30 seconds)
"GSAP is installed and typed. Next lesson, we animate: `gsap.to()`, `gsap.from()`, `gsap.fromTo()` — the three core methods."

---

## Lesson 7.3 — `gsap.to()`, `gsap.from()`, `gsap.fromTo()`

**Duration:** 12 minutes
**Screen setup:** Editor with `.svelte` file, browser showing animated elements

### Hook (30 seconds)
"Three methods. Every GSAP animation you'll ever write uses one of them. `to` animates TO a state. `from` animates FROM a state. `fromTo` animates between two explicit states. Master these three and you control motion."

### Demo sequence
1. **[0:30-3:00] gsap.to()** — `gsap.to('.box', { x: 200, rotation: 360, duration: 1 })`. Show the box moving and rotating. Explain properties: x, y, rotation, scale, opacity.
2. **[3:00-5:30] gsap.from()** — `gsap.from('.title', { y: -50, opacity: 0, duration: 0.8 })`. Title starts invisible and above, animates to its natural position. "The element's CSS defines the end state. `from` defines the start."
3. **[5:30-8:00] gsap.fromTo()** — `gsap.fromTo('.card', { scale: 0.5, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.6 })`. Explicit start AND end. "When you need full control over both states."
4. **[8:00-10:00] Build the mini-build** — Create a hero section: logo scales in (fromTo), headline types in (to with text plugin concept), subtitle fades from below (from), CTA button pulses (to with repeat).
5. **[10:00-11:30] Edge case / gotcha** — "`gsap.from()` sets the element to the start state immediately, then animates to its CSS state. If the element flashes its final state before `gsap.from()` runs, add `immediateRender: true` (default for `from`) or hide the element with CSS initially."

### Key moments (timestamps the editor should chapter-mark)
- 0:30 — "Three methods to rule them all"
- 3:00 — "gsap.from() — animate FROM"
- 5:30 — "gsap.fromTo() — full control"
- 8:00 — "Hero section mini-build"
- 10:00 — "The flash-of-final-state"

### Callout graphics
- Three methods comparison diagram
- GSAP property reference (x, y, rotation, scale, opacity)
- Hero section animation sequence

### Outro (30 seconds)
"Three methods cover every GSAP animation. But sequencing them — making one start after another — requires timelines. That's next."

---

## Lesson 7.4 — GSAP Timelines — sequencing multiple animations

**Duration:** 12 minutes
**Screen setup:** Editor with `.svelte` file, browser showing sequenced multi-element animations

### Hook (30 seconds)
"Move A, then rotate B, then fade C, but start D halfway through C. Without timelines, you're calculating delays by hand — changing one duration breaks every delay after it. GSAP timelines sequence animations with labels and relative positioning. Change any step, and everything downstream adjusts automatically."

### Demo sequence
1. **[0:30-2:30] The delay problem** — Four animations with manual delays: `delay: 0`, `delay: 0.5`, `delay: 1`, `delay: 1.2`. Change the first duration — all subsequent delays are wrong.
2. **[2:30-5:30] Timeline basics** — `const tl = gsap.timeline(); tl.to(a, {...}).to(b, {...}).to(c, {...})`. Sequential by default. Change any duration — everything adjusts.
3. **[5:30-8:00] Position parameter** — `tl.to(b, {...}, '<')` — same time as previous. `tl.to(c, {...}, '-=0.2')` — 0.2s before previous ends. `tl.to(d, {...}, '+=0.5')` — 0.5s after previous ends. Labels: `tl.addLabel('cards').to(card1, {...}, 'cards')`.
4. **[8:00-10:00] Build the mini-build** — Landing page entrance: navbar slides down, hero text types in, subtitle fades up (overlapping hero by 0.3s), cards stagger in (starting at a label).
5. **[10:00-11:30] Edge case / gotcha** — "Timelines accumulate. If you create a new timeline on every button click without killing the old one, animations stack. Store the timeline in a variable and call `tl.kill()` before creating a new one."

### Key moments (timestamps the editor should chapter-mark)
- 0:30 — "The manual delay nightmare"
- 2:30 — "Timeline sequencing"
- 5:30 — "Position parameters"
- 8:00 — "Landing page entrance"
- 10:00 — "Timeline accumulation"

### Callout graphics
- Timeline visualization with positioned animations
- Position parameter syntax reference
- Landing page animation sequence diagram

### Outro (30 seconds)
"Timelines make complex animation sequences maintainable. But GSAP needs DOM elements to animate — and in Svelte, getting those references requires `bind:this`. That's next."

---

## Lesson 7.5 — `bind:this` — getting DOM element references in Svelte

**Duration:** 11 minutes
**Screen setup:** Editor with `.svelte` file, browser Console showing element references

### Hook (30 seconds)
"GSAP needs a DOM element. `gsap.to(element, {...})`. But in Svelte, you don't write `document.querySelector`. You use `bind:this` — Svelte's way to hand you a direct reference to the real DOM node, typed and ready."

### Demo sequence
1. **[0:30-2:30] The problem** — `document.querySelector('.box')` — fragile, global, can match wrong elements. "Querying by class in a component-scoped framework is asking for collisions."
2. **[2:30-5:00] bind:this** — `let box: HTMLDivElement; <div bind:this={box}>`. Log `box` in `$effect` — it's the actual DOM node. Pass it to GSAP: `gsap.to(box, { x: 100 })`.
3. **[5:00-7:30] Multiple elements** — Array of refs: `let cards: HTMLElement[] = []`. In `{#each}`: `<div bind:this={cards[i]}>`. Pass array to GSAP stagger: `gsap.to(cards, { y: 0, stagger: 0.1 })`.
4. **[7:30-9:30] Build the mini-build** — Animate a card grid: each card bound to a ref, passed to a GSAP timeline that staggers them in on mount.
5. **[9:30-10:30] Edge case / gotcha** — "`bind:this` is `undefined` until the component mounts. Never access it in the script's top-level code — always inside `$effect`, which runs after mount."

### Key moments (timestamps the editor should chapter-mark)
- 0:30 — "GSAP needs DOM nodes"
- 2:30 — "bind:this — typed element refs"
- 5:00 — "Array of refs for lists"
- 7:30 — "Animated card grid"
- 9:30 — "Ref is undefined until mount"

### Callout graphics
- querySelector vs bind:this comparison
- Lifecycle: mount -> bind:this available -> $effect runs
- Array of refs pattern diagram

### Outro (30 seconds)
"Element references connect GSAP to Svelte's DOM. Next lesson: `$effect` as the bridge — triggering GSAP animations from reactive state changes."

---

## Lesson 7.6 — `$effect` as the bridge — triggering GSAP from reactive state

**Duration:** 11 minutes
**Screen setup:** Editor with `.svelte` file, browser showing state-driven animations

### Hook (30 seconds)
"A slider controls the rotation of a 3D card. A toggle controls whether elements are visible. State changes, and GSAP should respond. `$effect` watches your reactive state and triggers GSAP animations in response — it's the bridge between Svelte's reactivity and GSAP's animation engine."

### Demo sequence
1. **[0:30-2:30] The pattern** — `$effect(() => { gsap.to(box, { rotation: angle }) })`. Change `angle` with a slider — the box rotates smoothly. "$effect runs when `angle` changes. GSAP animates the box."
2. **[2:30-5:00] Reactive GSAP animations** — Show multiple state values driving different animations. Color picker controlling hue. Slider controlling position. Toggle controlling visibility.
3. **[5:00-7:30] Conditional animations** — `$effect(() => { if (isOpen) { gsap.to(menu, { height: 'auto' }) } else { gsap.to(menu, { height: 0 }) } })`. Toggle-driven expand/collapse.
4. **[7:30-9:30] Build the mini-build** — Interactive control panel: three sliders controlling x-position, y-position, and rotation of an element. All driven through `$effect` + GSAP.
5. **[9:30-10:30] Edge case / gotcha** — "Don't create timelines inside `$effect` without cleaning them up. Every state change creates a new timeline. The old one keeps running. Use cleanup (next lesson) to prevent animation accumulation."

### Key moments (timestamps the editor should chapter-mark)
- 0:30 — "The bridge pattern"
- 2:30 — "Multiple reactive animations"
- 5:00 — "Conditional GSAP"
- 7:30 — "Control panel mini-build"
- 9:30 — "Timeline accumulation warning"

### Callout graphics
- Bridge diagram: $state -> $effect -> GSAP -> DOM
- Control panel wireframe
- Animation accumulation problem illustration

### Outro (30 seconds)
"$effect bridges Svelte state to GSAP animations. But every animation you create needs to be cleaned up when state changes or the component unmounts. That's next: GSAP cleanup."

---

## Lesson 7.7 — GSAP cleanup in `$effect` return functions

**Duration:** 11 minutes
**Screen setup:** Editor with `.svelte` file, browser Performance Monitor

### Hook (30 seconds)
"Navigate away from a page with GSAP animations. The animations keep running in the background — animating elements that no longer exist, consuming CPU, throwing errors. GSAP cleanup in `$effect` return functions prevents every one of these problems."

### Demo sequence
1. **[0:30-2:30] Show the problem** — Create GSAP animations without cleanup. Navigate away. Show console errors: "Cannot tween a DOM element that doesn't exist."
2. **[2:30-5:00] $effect cleanup** — `$effect(() => { const tl = gsap.timeline(); tl.to(...); return () => tl.kill(); })`. Navigate away — no errors. "The return function runs on unmount. `tl.kill()` stops everything."
3. **[5:00-7:30] ScrollTrigger cleanup** — `return () => { tl.kill(); ScrollTrigger.getAll().forEach(st => st.kill()); }`. "ScrollTrigger creates observers that persist. Kill them explicitly."
4. **[7:30-9:30] Build the mini-build** — A page with entrance animation, scroll animations, and hover effects — all with proper cleanup. Navigate away and back — everything works fresh.
5. **[9:30-10:30] Edge case / gotcha** — "`gsap.context()` is GSAP's built-in cleanup tool. `const ctx = gsap.context(() => { ... }, container)`. Cleanup: `ctx.revert()`. It kills all GSAP animations created within the context. Cleaner than manual kill."

### Key moments (timestamps the editor should chapter-mark)
- 0:30 — "Zombie animations"
- 2:30 — "$effect return for cleanup"
- 5:00 — "ScrollTrigger cleanup"
- 7:30 — "Full page with proper cleanup"
- 9:30 — "gsap.context() shortcut"

### Callout graphics
- Cleanup lifecycle: mount -> animate -> unmount -> kill
- gsap.context() usage pattern
- Memory leak before/after comparison

### Outro (30 seconds)
"Clean up every GSAP animation on unmount. Use `$effect` returns or `gsap.context()`. Next lesson: stagger animations — making groups of elements animate with cascading delays."

---

## Lesson 7.8 — Stagger animations

**Duration:** 11 minutes
**Screen setup:** Editor with `.svelte` file, browser showing staggered grid animations

### Hook (30 seconds)
"Twelve cards appear on screen. All at once? Boring. One by one from top-left? Better. Radiating from the center outward? Now we're talking. GSAP's stagger goes far beyond Svelte's `delay: i * 60` — 2D grids, directional origins, and random offsets."

### Demo sequence
1. **[0:30-2:30] Basic stagger** — `gsap.from('.card', { y: 50, opacity: 0, stagger: 0.1 })`. Cards cascade in, each 100ms after the last.
2. **[2:30-5:00] Stagger object** — `stagger: { each: 0.1, from: 'center', grid: [3, 4] }`. Cards radiate from center. Change to `from: 'end'`, `from: 'edges'`, `from: 'random'`.
3. **[5:00-7:30] Grid stagger** — `stagger: { grid: 'auto', from: 'center', axis: 'y', each: 0.08 }`. Show column-by-column, row-by-row, and radial patterns.
4. **[7:30-9:30] Build the mini-build** — Product grid entrance: cards stagger from center with scale and opacity. On filter change, remaining cards re-stagger into position.
5. **[9:30-10:30] Edge case / gotcha** — "Stagger with `from: 'center'` on an odd-numbered grid doesn't have a true center element. GSAP calculates the center mathematically and applies delays based on distance. The result is smooth, but test visually."

### Key moments (timestamps the editor should chapter-mark)
- 0:30 — "Beyond linear stagger"
- 2:30 — "Stagger from center, edges, random"
- 5:00 — "2D grid stagger"
- 7:30 — "Product grid entrance"
- 9:30 — "Odd grid center calculation"

### Callout graphics
- Stagger direction comparison: start, end, center, edges, random
- Grid stagger visualization
- Product grid animation sequence

### Outro (30 seconds)
"GSAP's stagger handles 2D grids and directional origins with a single configuration object. Next lesson: ScrollTrigger — tying animation progress to the user's scroll position."

---

## Lesson 7.9 — ScrollTrigger — installing and configuring with SvelteKit

**Duration:** 13 minutes
**Screen setup:** Editor with `.svelte` file, browser showing scroll-triggered animations

### Hook (30 seconds)
"The user scrolls down your page. A section enters the viewport. An animation plays — but only at 60% scroll progress. Scroll back up, and it reverses. This isn't possible with CSS or Svelte alone. ScrollTrigger ties GSAP animations to scroll position with pixel-level precision."

### Demo sequence
1. **[0:30-3:00] Installation and registration** — `import { ScrollTrigger } from 'gsap/ScrollTrigger'; gsap.registerPlugin(ScrollTrigger)`. SSR guard: only in `$effect`.
2. **[3:00-6:00] Basic ScrollTrigger** — `gsap.from('.section', { y: 100, opacity: 0, scrollTrigger: { trigger: '.section', start: 'top 80%' } })`. Section animates in when its top hits 80% viewport height.
3. **[6:00-9:00] Scrubbing** — `scrollTrigger: { scrub: true }`. Animation progress tied 1:1 to scroll position. Scroll down = play forward. Scroll up = play backward. Show with a progress bar that fills based on scroll.
4. **[9:00-11:00] Pin** — `scrollTrigger: { pin: true, start: 'top top', end: '+=500' }`. Section stays pinned for 500px of scroll while animation plays. "Pinning creates those 'scroll-jacking' effects — use sparingly."
5. **[11:00-12:30] Edge case / gotcha** — "ScrollTrigger caches element positions on creation. If your layout shifts after ScrollTrigger initializes (images loading, dynamic content), call `ScrollTrigger.refresh()`. Without it, trigger positions are wrong."

### Key moments (timestamps the editor should chapter-mark)
- 0:30 — "Scroll-driven animation"
- 3:00 — "Basic ScrollTrigger"
- 6:00 — "Scrubbing — scroll = progress"
- 9:00 — "Pinning sections"
- 11:00 — "Layout shift and refresh()"

### Callout graphics
- ScrollTrigger start/end position diagram
- Scrub timeline visualization
- Pin behavior illustration

### Outro (30 seconds)
"ScrollTrigger adds scroll-driven dimension to your animations. Next lesson: handling ScrollTrigger correctly across SvelteKit's client-side navigation."

---

## Lesson 7.10 — ScrollTrigger with SvelteKit navigation

**Duration:** 11 minutes
**Screen setup:** Editor with route files, browser showing navigation between pages with scroll animations

### Hook (30 seconds)
"Page A has ScrollTrigger animations. Navigate to Page B and back. The ScrollTrigger positions are wrong — they were calculated for the first visit. SvelteKit's client-side navigation doesn't reload the page, so ScrollTrigger's cached positions go stale. Here's the fix."

### Demo sequence
1. **[0:30-2:30] Show the problem** — Navigate between pages with ScrollTrigger. Return to the first page — animations trigger at wrong positions or don't trigger at all.
2. **[2:30-5:00] The fix** — Kill all ScrollTriggers in `$effect` cleanup: `return () => { ScrollTrigger.getAll().forEach(st => st.kill()); }`. Recreate on mount. "Clean slate on every navigation. Each page creates its own ScrollTriggers."
3. **[5:00-7:30] afterNavigate pattern** — Use SvelteKit's `afterNavigate` to call `ScrollTrigger.refresh()` after the new page layout is stable.
4. **[7:30-9:30] Build the mini-build** — Two pages with different scroll animations. Navigate between them — all animations work correctly, every time.
5. **[9:30-10:30] Edge case / gotcha** — "If you use `scrollTrigger: { pin: true }` and the page height changes on navigation, the pin spacer div might not be removed. Always kill pinned ScrollTriggers explicitly."

### Key moments (timestamps the editor should chapter-mark)
- 0:30 — "Stale ScrollTrigger positions"
- 2:30 — "Kill and recreate pattern"
- 5:00 — "afterNavigate refresh"
- 7:30 — "Multi-page scroll animations"
- 9:30 — "Pin spacer cleanup"

### Callout graphics
- SvelteKit navigation lifecycle with ScrollTrigger hooks
- Kill/recreate pattern diagram
- Pin spacer cleanup illustration

### Outro (30 seconds)
"ScrollTrigger and SvelteKit navigation require explicit cleanup. Next lesson: Svelte's `use:` actions — a pattern for encapsulating DOM behavior in reusable directives."

---

## Lesson 7.11 — Svelte `use:` actions and the attachment pattern

**Duration:** 11 minutes
**Screen setup:** Editor with `.svelte` file and action `.ts` file

### Hook (30 seconds)
"You need click-outside detection on five different components. Copy-paste the event listener code five times? Or write it once as an action — `use:clickOutside` — and apply it to any element with two words. Actions are Svelte's way to package reusable DOM behavior."

### Demo sequence
1. **[0:30-2:30] What actions are** — A function that takes an element and returns a lifecycle object: `{ update?, destroy? }`. Applied with `use:actionName`.
2. **[2:30-5:00] Build a clickOutside action** — `function clickOutside(node, callback) { ... addEventListener ... return { destroy() { removeEventListener } } }`. Use: `<div use:clickOutside={closeMenu}>`.
3. **[5:00-7:30] Action parameters and update** — Show the `update` function: called when the parameter changes. Build a `tooltip` action: `use:tooltip={{ text: dynamicText }}`. Text updates reactively.
4. **[7:30-9:30] Build the mini-build** — Create three actions: `use:clickOutside`, `use:tooltip`, `use:autoFocus`. Apply all three to a dropdown component.
5. **[9:30-10:30] Edge case / gotcha** — "Actions run on the client only — they receive a real DOM node. In SSR, the action doesn't execute. Don't put critical logic in actions that must run server-side."

### Key moments (timestamps the editor should chapter-mark)
- 0:30 — "Reusable DOM behavior"
- 2:30 — "Building clickOutside"
- 5:00 — "Parameters and update lifecycle"
- 7:30 — "Three practical actions"
- 9:30 — "SSR limitations"

### Callout graphics
- Action lifecycle: mount -> update -> destroy
- clickOutside event flow diagram
- Action anatomy with labeled parts

### Outro (30 seconds)
"Actions package DOM behavior into reusable directives. Next lesson: we combine actions with GSAP to build a scroll-reveal action."

---

## Lesson 7.12 — Building a scroll reveal action

**Duration:** 11 minutes
**Screen setup:** Editor with action file and page file, browser showing scroll-reveal effects

### Hook (30 seconds)
"Elements fade in as you scroll down. It's on every modern marketing site. Instead of writing ScrollTrigger code on every element, build a `use:reveal` action. Two words on any element, and it animates into view on scroll."

### Demo sequence
1. **[0:30-2:30] The concept** — Show the verbose ScrollTrigger setup for one element. Now imagine doing it for 20 elements. "Repetitive boilerplate. The perfect candidate for an action."
2. **[2:30-5:30] Build the action** — `function reveal(node, params) { gsap.from(node, { y: 50, opacity: 0, scrollTrigger: { trigger: node, start: 'top 85%' } }); return { destroy() { ... } } }`.
3. **[5:30-8:00] Parameters** — `use:reveal={{ y: 100, duration: 0.8, delay: 0.2 }}`. Merge with defaults. Show different configurations on different elements.
4. **[7:30-9:30] Build the mini-build** — A marketing page with 10+ sections, each using `use:reveal` with different parameters. Scroll through — smooth, staggered reveals.
5. **[9:30-10:30] Edge case / gotcha** — "The action creates a GSAP animation on mount. If the element is above the fold, it starts invisible (opacity: 0) and then reveals — causing a flash of invisible content. For above-fold elements, skip the action or use `from` with `immediateRender: false`."

### Key moments (timestamps the editor should chapter-mark)
- 0:30 — "Scroll reveal everywhere"
- 2:30 — "Building the action"
- 5:30 — "Configurable parameters"
- 7:30 — "Marketing page mini-build"
- 9:30 — "Above-the-fold flash"

### Callout graphics
- Action + GSAP integration diagram
- Scroll reveal trigger positions
- Above-fold fix pattern

### Outro (30 seconds)
"A scroll-reveal action gives you a two-word API for one of the most common animation patterns. Next lesson: combining GSAP animations with Svelte transitions in the same component."

---

## Lesson 7.13 — GSAP + Svelte transitions together

**Duration:** 11 minutes
**Screen setup:** Editor with `.svelte` file, browser showing both GSAP and Svelte animations

### Hook (30 seconds)
"Mount/unmount? Svelte transitions. Complex sequences? GSAP timelines. But what about a modal that fades in with Svelte `transition:fade` and then has its content animate with a GSAP timeline? Both systems can coexist — if you understand the timing."

### Demo sequence
1. **[0:30-2:30] Two systems, one component** — Show a component with both `transition:fly` on the container and GSAP animating internal elements. Both work simultaneously.
2. **[2:30-5:00] Timing coordination** — Use Svelte's `on:introend` to trigger GSAP after the transition completes. "Svelte transition finishes, then GSAP takes over for the internal choreography."
3. **[5:00-7:30] Build the mini-build** — Modal component: `transition:fade` on backdrop, `transition:fly` on dialog container. After `introend`, GSAP timeline animates form fields staggering in.
4. **[7:30-9:30] Exit coordination** — On close: GSAP reverse timeline first, then trigger Svelte transition out. Use GSAP's `onComplete` callback.
5. **[9:30-10:30] Edge case / gotcha** — "If the user closes the modal before the GSAP intro finishes, both animations try to control the same elements simultaneously. Kill the GSAP timeline before starting the exit transition."

### Key moments (timestamps the editor should chapter-mark)
- 0:30 — "Two animation systems"
- 2:30 — "Timing: introend -> GSAP"
- 5:00 — "Modal with both systems"
- 7:30 — "Exit coordination"
- 9:30 — "Race condition on close"

### Callout graphics
- Timeline: Svelte transition -> introend -> GSAP sequence
- Modal animation architecture
- Race condition and fix diagram

### Outro (30 seconds)
"GSAP and Svelte transitions complement each other when you coordinate their timing. Next lesson: an introduction to Threlte — bringing 3D to your Svelte app."

---

## Lesson 7.14 — Introducing Threlte — 3D in Svelte

**Duration:** 13 minutes
**Screen setup:** Editor with `.svelte` file, browser showing a 3D scene

### Hook (30 seconds)
"A spinning cube. A floating product model. A particle field that responds to mouse movement. Three.js can do all of this — but it takes 60 lines of imperative JavaScript. Threlte wraps Three.js in Svelte components. A cube is `<T.Mesh>`. A light is `<T.PointLight>`. The same declarative approach you already know."

### Demo sequence
1. **[0:30-3:00] The Three.js problem** — Show 40 lines of vanilla Three.js: scene, renderer, camera, geometry, material, mesh, animation loop, resize handler. "All this for a spinning cube."
2. **[3:00-6:00] Threlte equivalent** — `<Canvas><T.Mesh><T.BoxGeometry /><T.MeshStandardMaterial color="hotpink" /></T.Mesh><T.AmbientLight /><T.PointLight position={[5, 5, 5]} /></Canvas>`. Same cube, 8 lines. Declarative.
3. **[6:00-9:00] Reactive 3D** — Bind color to a `$state` variable. Add a slider controlling rotation. The 3D scene updates reactively, just like 2D UI.
4. **[9:00-11:00] Build the mini-build** — A product showcase: 3D model on a slowly rotating platform with ambient lighting. GSAP animates the camera on scroll.
5. **[11:00-12:30] Edge case / gotcha** — "Threlte requires client-side rendering. Wrap `<Canvas>` in `{#if browser}` from `$app/environment`. Server-side rendering crashes without a WebGL context."

### Key moments (timestamps the editor should chapter-mark)
- 0:30 — "3D with Svelte syntax"
- 3:00 — "Threlte vs vanilla Three.js"
- 6:00 — "Reactive 3D properties"
- 9:00 — "Product showcase"
- 11:00 — "SSR safety"

### Callout graphics
- Three.js imperative vs Threlte declarative comparison
- Threlte component tree: Canvas -> Scene -> Mesh
- SSR guard pattern

### Outro (30 seconds)
"Threlte brings 3D into the Svelte ecosystem with the same component patterns you already know. Module 7 is complete. You can now animate with CSS, Svelte, GSAP, and render 3D scenes. Module 8 introduces SvelteKit routing — the system that turns your components into a real multi-page application."

---
