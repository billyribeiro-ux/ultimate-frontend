---
module: 7
lesson: 7.1
title: What GSAP is and when to reach for it
duration: 30 minutes
prerequisites:
  - Module 6 complete (especially 6.10–6.18)
learning_objectives:
  - Name the four layers of animation available in a modern Svelte app
  - Identify the specific problem class GSAP is best at solving
  - Explain why GSAP still exists in 2026 alongside CSS, Svelte transitions, and svelte/motion
  - Decide between a Svelte built-in and GSAP for a given interaction
  - Recognise when reaching for GSAP is overkill
status: ready
---

# Lesson 7.1 — What GSAP is and when to reach for it

## 1. Concept — Four layers of animation, each with a job

By the end of Module 6 you had three distinct animation tools in your hands. Module 7 introduces a fourth. Before we install anything, it is critical to understand where each tool shines, because the biggest mistake students make with GSAP is reaching for it to solve problems that Svelte's built-ins already solve better.

### 1.1 The four layers

**Layer 1 — Native CSS transitions.** Lesson 6.10. Cheap, composited, declarative. Use for every hover, focus, press, and class toggle on elements that stay in the DOM.

**Layer 2 — Svelte transition directives.** Lessons 6.11 and 6.12. Built on top of CSS transitions but triggered by DOM mount/unmount. Use for `{#if}`, `{#each}`, modals, notifications, accordion panels.

**Layer 3 — `svelte/motion` primitives.** Lessons 6.14 and 6.15. `Tween` and `Spring` wrap a raw value and interpolate it over time. Use for progress bars, cursor followers, and any time you need an animated value inside your JavaScript.

**Layer 4 — GSAP.** This module. A professional animation library with features the first three layers cannot offer: named timelines with complex sequencing, scroll-triggered animations, plugin ecosystems for morphing SVG, drawing SVG paths, and 3D hooks.

### 1.2 What GSAP is

GSAP is the GreenSock Animation Platform. It is a JavaScript library with roots going back to 2008 (originally written for Flash). It runs in every modern browser, weighs about 50KB gzipped for its core, and is the de-facto standard for complex web animation. Agencies, ad studios, and premium marketing sites use it because it lets you express multi-step, multi-element, scroll-driven animation in a compact and reliable way.

GSAP is not a framework. It does not manage state, it does not render components, it does not know what Svelte is. It takes DOM elements (or plain objects) and a configuration object, and it animates their properties over time. Your job as the Svelte developer is to bridge GSAP to the component lifecycle so it cleans up properly — that is the subject of Lessons 7.5 through 7.7.

### 1.3 What GSAP is best at

GSAP's killer features, in order of frequency:

1. **Complex timelines.** "Move A 100px, then *at the same time* rotate B 45 degrees, then *0.2 seconds later* fade C in, then *when C is halfway* start D scaling." Expressing that with CSS or `svelte/motion` is painful; GSAP does it in one readable chain.
2. **ScrollTrigger.** Tying an animation's progress directly to the user's scroll position. The user scrolls one percent, the animation advances one percent. This is impossible with Svelte built-ins.
3. **Stagger with fine control.** GSAP's stagger handles 2D grid positions, "from: 'center'" directions, random offsets, and grouped batching. Svelte's stagger (Lesson 6.17) is just `delay: index * 60`.
4. **Plugins.** MotionPath (animate along an SVG curve), MorphSVG (interpolate between two SVG shapes), DrawSVG, Flip (GSAP's own version of FLIP), SplitText, Observer. Each covers a specific expensive problem.

### 1.4 What GSAP is NOT best at

- **Micro-interactions on elements that stay in the DOM.** Hover, focus, active — CSS transitions are better. Cheaper, declarative, composited.
- **Simple enter/exit animations of components.** Svelte `transition:` is better. It is tied to the component lifecycle automatically.
- **Animating a single reactive value.** `svelte/motion` `Tween` is better. Less setup, works with runes out of the box.

A rule of thumb: **reach for GSAP only when the animation spans multiple elements, needs scroll-driven progress, or has sequencing you cannot express in CSS**. If you catch yourself using GSAP for a single hover state, put it down and use CSS.

### 1.5 GSAP's license (important)

GSAP's **core** (`gsap`) and most plugins including **ScrollTrigger, Flip, Observer, ScrollTo, Text, EasePack** are **free for any use, including commercial**, under the standard GSAP license as of GSAP 3.13 (released May 2024 when GreenSock joined Webflow). A few specialty plugins (MorphSVG, DrawSVG, SplitText, InertiaPlugin, etc.) were previously "Club GreenSock only" but also became free at that time. You can use everything in this course without a subscription.

### 1.6 Runtime vs compile cost

GSAP *is* a runtime framework — it ships 50KB of JavaScript that lives alongside your app. That is a real cost, and it is why you should not install GSAP just because an interaction "would be nice". You install it when you need it, tree-shake the plugins you do not use, and lazy-load it on routes that do not need it. We will cover lazy-loading in Lesson 7.9 when we introduce ScrollTrigger.





### The TypeScript angle

GSAP's bundled types give full IntelliSense for `gsap.to()`, `gsap.timeline()`, and all plugin APIs.

> **In production sidebar.** On a 100K-daily-user marketing site, auditing animations showed 70% were simple hover effects CSS handled better. Lazy-loading GSAP only on routes that needed timelines/ScrollTrigger reduced the initial bundle by 50KB for 85% of page views.

### Common interview question

**Q: When should you use GSAP instead of CSS transitions or Svelte built-in transitions?**

**Model answer:** Use GSAP for complex multi-element sequencing, scroll-driven animation, advanced staggers, or plugin features. For simple hover states, use CSS transitions. For mount/unmount, use Svelte transitions. GSAP's 50KB cost is justified only when simpler tools cannot express the animation.

## Going Deeper

**Official documentation:**
- [GSAP docs](https://gsap.com/docs/v3/)
- [GSAP: Why GSAP?](https://gsap.com/why-gsap/)
- [Svelte docs: svelte/transition](https://svelte.dev/docs/svelte/svelte-transition)

**Advanced pattern:** Build a "decision tree" component that asks 3 yes/no questions and recommends which animation layer to use based on the answers.

**Challenge question:** (Combines Lessons 7.1, 6.10, and 6.11) Build a demo page with 4 animated elements, each using a different layer: a CSS-transitioned hover card, a Svelte-transitioned modal, a Tweened counter, and a GSAP-animated hero headline. Label each with the tool used and the bundle cost.

## Deep Dive

**Why this matters at scale.** Choosing wrong animation tools creates debt. CSS handles states, Svelte handles lifecycle, GSAP handles everything else: timelines, scroll, physics.

**The mental model.** Four-layer stack: CSS transitions, CSS keyframes, Svelte transitions, GSAP. Each more powerful but more expensive. Use the lowest layer that meets your needs.

**Edge cases.** If you need 3+ coordinated elements, GSAP timeline is right. Single element fade on mount? Svelte transition. Scroll-driven? Always GSAP ScrollTrigger.

**Performance implications.** GSAP core is ~25KB gzipped. 50 active tweens cost under 1ms per frame. 200+ simultaneous tweens is the danger zone — consider Canvas.

**Connection to other modules.** Module 6 provides CSS/Svelte baseline. Module 12 measures GSAP cost. Module 8 uses GSAP for page transitions.

## 2. Style it — A comparison table with a gold brand

The mini-build is a four-row comparison table with a gold brand hue (`oklch(78% 0.17 85)`). Each row describes one of the four layers and shows when to use it. The table animates into view with a stagger using Svelte's built-in `transition:fly` — a tiny object lesson in "pick the right tool". Mobile-first: table becomes a stack of cards on narrow screens.

## 3. Interact — Reading the decision tree

No GSAP code yet. The mini-build is a reading exercise: look at each of the four layers, look at the example interactions, and practice classifying new ones. The component itself uses only Svelte built-ins, reinforcing that you do not need GSAP until the problem calls for it.

## 4. Mini-build — The four-layer decision table

**File:** `src/routes/modules/07-gsap/01-what-is-gsap/+page.svelte`

A section with a headline, four cards in a grid. Each card lists the layer name, the bundle cost ("0KB" for CSS, "Built into Svelte" for transitions, etc.), a "use when" bullet list, and a representative example. The final paragraph says "Next lesson: install GSAP."

### DevTools verification

1. Open DevTools → **Network** tab. Reload. Confirm there is no gsap-related file being downloaded — we have not installed it yet on this route.
2. Open Elements and confirm the stagger on the four cards is running via Svelte's `transition:fly` with a per-index delay.

## 5. Check your understanding

<details>
<summary><strong>Q1.</strong> What are the four layers of animation in a modern Svelte app?</summary>

(1) CSS transitions, (2) Svelte transition directives (`transition:`, `in:`, `out:`), (3) `svelte/motion` primitives (`Tween`, `Spring`), (4) GSAP.
</details>

<details>
<summary><strong>Q2.</strong> What is GSAP best at compared to Svelte's built-ins?</summary>

Complex multi-element, multi-step timelines; scroll-triggered animation (ScrollTrigger); advanced stagger with 2D layout awareness; plugins for SVG path drawing, morphing, text splitting, and motion along paths.
</details>

<details>
<summary><strong>Q3.</strong> When should you NOT reach for GSAP?</summary>

For simple micro-interactions (hover, focus, press), for single-element enter/exit animations, and for animating a single reactive value. Those are better handled by CSS transitions, Svelte `transition:` directives, and `svelte/motion` respectively.
</details>

<details>
<summary><strong>Q4.</strong> Is GSAP free to use commercially in 2026?</summary>

Yes. Since GSAP 3.13 (May 2024), GSAP core and all plugins (including the previously paid-only MorphSVG, DrawSVG, SplitText) are free for any use under the standard GSAP license.
</details>

<details>
<summary><strong>Q5.</strong> Roughly how large is GSAP core and why does that matter?</summary>

About 50KB gzipped. It matters because GSAP is a runtime library that ships with your app — every user downloads and parses it. Install only when needed, tree-shake unused plugins, and lazy-load on routes that don't use it.
</details>

## 6. Common mistakes

- **Using GSAP for simple hover states.** A 50KB dependency for something `:hover { transform: … }` solves for free.
- **Thinking GSAP replaces Svelte's transitions.** They coexist. Svelte handles mount/unmount; GSAP handles complex sequenced motion.
- **Ignoring bundle size.** Import only the plugins you use, and only on the routes that use them.
- **Assuming GSAP "just works" inside components.** It does not — you must integrate it with the component lifecycle (covered in Lessons 7.5–7.7).

## 7. What's next

Lesson 7.2 installs GSAP via pnpm, wires up the TypeScript types, and verifies the first import works inside a SvelteKit component.
