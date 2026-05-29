# Ultimate Frontend — Complete Glossary

A-Z reference of every technical term used in the course. Each entry notes where the concept is first introduced.

---

## A

**Accessibility (a11y)** — The practice of designing web applications so they can be used by people with disabilities, including visual, motor, auditory, and cognitive impairments. (First introduced: Module 5, Lesson 5.10)

**Action (Svelte)** — A reusable function applied to a DOM element via the `use:` directive that encapsulates imperative DOM behavior such as focus management, scroll detection, or third-party library integration. (First introduced: Module 7, Lesson 7.11)

**Action (SvelteKit Form)** — A server-side function exported from `+page.server.ts` that handles form submissions, performing validation, mutations, and returning responses. (First introduced: Module 10, Lesson 10.3)

**ActionData** — The type of data returned from a SvelteKit form action, available in the component via the `form` prop after a form submission. (First introduced: Module 10, Lesson 10.6)

**Adapter** — A SvelteKit build plugin that transforms the platform-agnostic build output into a format compatible with a specific deployment target (Node.js, Vercel, Netlify, Cloudflare, static hosting). (First introduced: Module 12, Lesson 12.11)

**AEO (Answer Engine Optimization)** — The practice of optimizing content to appear in AI-generated search answers and summaries, such as Google's AI Overviews. (First introduced: Module 13, Lesson 13.12)

**AmbientLight** — A Three.js/Threlte light source that illuminates all objects equally from all directions, providing baseline illumination without shadows. (First introduced: Module 14, Lesson 14.2)

**`animate:flip`** — A Svelte directive that animates list item position changes using the FLIP (First, Last, Invert, Play) technique when an `{#each}` block's array is reordered. (First introduced: Module 6, Lesson 6.13)

**ARIA (Accessible Rich Internet Applications)** — A set of HTML attributes (`role`, `aria-label`, `aria-expanded`, etc.) that provide semantic information to assistive technologies for custom interactive widgets. (First introduced: Module 12, Lesson 12.8)

**Arrow function** — A concise JavaScript function syntax (`() => {}`) that lexically binds `this`, commonly used for event handlers and callbacks in Svelte. (First introduced: Module 5, Lesson 5.2)

**AST (Abstract Syntax Tree)** — A tree representation of source code structure that the Svelte compiler generates during parsing and uses for analysis and code generation. (First introduced: Module 1, Lesson 1.1)

**Async SSR** — A Svelte 5.55+ feature allowing components to `await` server-side data directly in their script block during server-side rendering, without load functions. (First introduced: Module 9B, Lesson 9B.9)

**`async/await`** — JavaScript syntax for writing asynchronous code in a synchronous-looking style, where `async` marks a function as returning a Promise and `await` pauses execution until a Promise settles. (First introduced: Module 4, Lesson 4.7)

**Attachment** — A newer Svelte pattern (alongside `use:` actions) for attaching imperative behavior to DOM elements, using the `{@attach}` syntax for tighter rune integration. (First introduced: Module 7, Lesson 7.11)

**`await` block** — Svelte's `{#await promise}...{:then}...{:catch}...{/await}` template syntax for declaratively handling the three states of a Promise in the markup. (First introduced: Module 4, Lesson 4.8)

---

## B

**`$bindable()`** — A Svelte 5 rune that marks a component prop as eligible for two-way binding from the parent via `bind:propName`, requiring explicit opt-in. (First introduced: Module 3, Lesson 3.5)

**Bloom** — A post-processing effect in Threlte/Three.js that adds a glow around bright areas of a 3D scene, simulating light bleed from overexposed surfaces. (First introduced: Module 14, Lesson 14.6)

**Branded type** — A TypeScript pattern that creates nominal types from structural ones by adding a phantom property, preventing accidental interchangeability of same-shaped values like `UserId` and `OrderId`. (First introduced: Module 5, Lesson 5.3)

**BreadcrumbList** — A JSON-LD structured data schema that describes a page's position within the site hierarchy for search engine display. (First introduced: Module 13, Lesson 13.6)

**`browser`** — A boolean imported from `$app/environment` that is `true` when code is running in the browser and `false` during SSR, used to guard browser-only operations. (First introduced: Module 8, Lesson 8.2)

---

## C

**`<Canvas>`** — Threlte's root component that creates an HTML canvas element, initializes the Three.js WebGL renderer, and provides scene context to all child 3D components. (First introduced: Module 7, Lesson 7.14)

**Cascade (CSS)** — The algorithm that determines which CSS rules apply when multiple rules target the same element, based on origin, `@layer`, specificity, and source order. (First introduced: Module 1, Lesson 1.5)

**Chromatic aberration** — A post-processing effect that simulates lens color fringing by separating the red, green, and blue channels of the rendered image. (First introduced: Module 14, Lesson 14.6)

**`clamp()`** — A CSS function `clamp(min, preferred, max)` that returns the preferred value bounded between a minimum and maximum, used for fluid typography and spacing. (First introduced: Module 1, Lesson 1.6)

**Class binding** — Svelte's syntax for conditionally applying CSS classes: `class:active={isActive}` adds the `active` class when `isActive` is truthy. (First introduced: Module 2, Lesson 2.12)

**Client-Side Rendering (CSR)** — A rendering mode where HTML is generated entirely in the browser by JavaScript, with the server sending only a minimal shell. Enabled with `export const ssr = false`. (First introduced: Module 8, Lesson 8.12)

**Closure** — A JavaScript function that retains access to variables from its enclosing lexical scope, even after that scope has finished executing. (First introduced: Module 5, Lesson 5.6)

**CLS (Cumulative Layout Shift)** — A Core Web Vital metric measuring visual stability by quantifying how much visible content shifts during page loading. Target: under 0.1. (First introduced: Module 12, Lesson 12.1)

**Code splitting** — The practice of dividing application JavaScript into smaller chunks loaded on demand, reducing initial page load size. SvelteKit splits by route automatically. (First introduced: Module 12, Lesson 12.3)

**Collider** — A Threlte/Rapier physics component that defines the shape used for collision detection on a rigid body (box, sphere, capsule, trimesh). (First introduced: Module 14, Lesson 14.7)

**`color-mix()`** — A CSS function that blends two colors in a specified color space, used to derive hover states, disabled states, and tint variations from a base color token. (First introduced: Module 6, Lesson 6.2)

**Command (remote function)** — A SvelteKit remote function type for performing server-side mutations (create, update, delete operations). (First introduced: Module 9B, Lesson 9B.7)

**Compiler (Svelte)** — A build-time tool that transforms `.svelte` and `.svelte.ts` files into optimized JavaScript that directly manipulates the DOM without a virtual DOM runtime. (First introduced: Module 1, Lesson 1.1)

**Component** — A reusable, self-contained unit of UI defined in a `.svelte` file, containing script logic, markup template, and scoped styles. (First introduced: Module 3, Lesson 3.1)

**Composition** — A design pattern where complex UIs are built by combining smaller, focused components rather than building monolithic ones. (First introduced: Module 3, Lesson 3.8)

**Conditional rendering** — Showing or hiding UI elements based on state using `{#if}`, `{:else if}`, and `{:else}` template blocks. (First introduced: Module 4, Lesson 4.1)

**`const` assertion** — TypeScript's `as const` syntax that infers the narrowest possible types (literal types, readonly tuples, readonly objects) from a value expression. (First introduced: Module 2, Lesson 2.13)

**Container query** — A CSS feature (`@container`) that applies styles based on the size of a parent container rather than the viewport, enabling component-level responsive design. (First introduced: Module 3, Lesson 3.10)

**`container-type`** — A CSS property set on a parent element to establish a containment context for container queries; typically `inline-size`. (First introduced: Module 3, Lesson 3.10)

**Context API** — Svelte's `setContext(key, value)` and `getContext(key)` functions for passing data through the component tree without prop drilling. (First introduced: Module 11, Lesson 11.2)

**Core Web Vitals** — Google's set of performance metrics (LCP, CLS, INP) that measure real-user experience and serve as SEO ranking signals. (First introduced: Module 12, Lesson 12.1)

**CSRF (Cross-Site Request Forgery)** — An attack where a malicious site tricks a user's browser into making requests to another site where the user is authenticated. SvelteKit provides built-in CSRF protection for form actions. (First introduced: Module 10, Lesson 10.5)

**CSS custom property** — A variable defined with `--name: value` and referenced with `var(--name)`, inheriting through the DOM tree for theming and token systems. (First introduced: Module 1, Lesson 1.5)

**CSS Grid** — A two-dimensional layout system for creating complex page and component layouts with rows and columns. (First introduced: Module 6, Lesson 6.6)

**CSS nesting** — Native browser support for nesting CSS selectors within parent selectors, eliminating the need for preprocessors like Sass for nested rules. (First introduced: Module 6, Lesson 6.4)

**Custom transition** — A user-defined Svelte transition function that returns duration, delay, easing, and a CSS or tick function for custom enter/exit animations. (First introduced: Module 6, Lesson 6.16)

---

## D

**Debouncing** — A technique that delays executing a function until a specified time has passed since the last invocation, used to limit the rate of expensive operations like search-as-you-type. (First introduced: Module 5, Lesson 5.7)

**Declaration merging** — A TypeScript feature where multiple declarations of the same `interface` name are automatically combined into a single interface. (First introduced: Module 1, Lesson 1.8)

**Deep reactivity** — Svelte's `$state` behavior for objects and arrays where the value is wrapped in a Proxy to track mutations at any nesting depth. (First introduced: Module 2, Lesson 2.3)

**`depends()`** — A function called inside SvelteKit load functions to register a custom dependency key that can later be invalidated with `invalidate()`. (First introduced: Module 9A, Lesson 9A.7)

**`$derived()`** — A Svelte 5 rune that creates a reactive, read-only value computed from a single expression, re-evaluated when its dependencies change. (First introduced: Module 2, Lesson 2.7)

**`$derived.by()`** — A variant of `$derived` that accepts a function body for multi-line derived computations that cannot fit in a single expression. (First introduced: Module 2, Lesson 2.8)

**Design token** — A named CSS custom property representing a single visual design decision (color, spacing, typography size, radius, shadow, motion duration) that ensures consistency across the application. (First introduced: Module 1, Lesson 1.5)

**Destructuring** — JavaScript syntax for extracting values from objects (`const { name } = obj`) and arrays (`const [first] = arr`) into individual variables. (First introduced: Module 4, Lesson 4.3)

**DevTools** — Browser developer tools used to inspect DOM elements, debug JavaScript, profile performance, audit accessibility, and analyze network requests. (First introduced: Module 1, Lesson 1.1)

**DirectionalLight** — A Three.js/Threlte light source that emits parallel rays in a specific direction, simulating sunlight and casting shadows. (First introduced: Module 14, Lesson 14.2)

**Discriminated union** — A TypeScript pattern where a union type uses a common literal property (discriminant) to enable type narrowing in conditional branches, preventing impossible states. (First introduced: Module 2, Lesson 2.13)

**`display: contents`** — A CSS value that removes an element from the box model while keeping its children in the layout flow, used internally by Svelte for component CSS custom property passing. (First introduced: Module 3, Lesson 3.9)

**Dispose** — The process of freeing GPU resources (geometries, materials, textures) in Three.js/Threlte when they are no longer needed, preventing memory leaks. (First introduced: Module 14, Lesson 14.8)

**DPR (Device Pixel Ratio)** — The ratio between physical pixels and CSS pixels on a display. Clamping DPR in Threlte limits rendering resolution on high-DPI screens for performance. (First introduced: Module 12, Lesson 12.12)

**Draco compression** — A geometry compression algorithm for 3D models that significantly reduces GLTF/GLB file sizes at the cost of a small decompression step. (First introduced: Module 14, Lesson 14.3)

**Dynamic import** — JavaScript's `import()` expression that loads a module asynchronously at runtime, enabling code splitting and lazy loading. (First introduced: Module 12, Lesson 12.3)

**Dynamic route** — A SvelteKit route segment that matches variable URL parts, using `[param]` for single segments, `[...rest]` for multiple segments, and `[[optional]]` for optional segments. (First introduced: Module 8, Lesson 8.6)

---

## E

**E-E-A-T** — Google's content quality framework: Experience, Expertise, Authoritativeness, and Trustworthiness, used as quality signals for search ranking. (First introduced: Module 13, Lesson 13.7)

**Easing** — A mathematical function that controls the acceleration curve of an animation, such as `cubicOut`, `elasticInOut`, or `linear`. (First introduced: Module 6, Lesson 6.17)

**`{#each}`** — Svelte's template block for iterating over arrays, supporting destructuring, index access, and key expressions for efficient DOM updates. (First introduced: Module 4, Lesson 4.3)

**`$effect()`** — A Svelte 5 rune that runs a side-effect callback when its reactive dependencies change, with an optional cleanup function for teardown. (First introduced: Module 2, Lesson 2.9)

**`$effect.pre()`** — A variant of `$effect` that runs before the DOM is updated, for cases where you need to read or write DOM state before paint. (First introduced: Module 2, Lesson 2.10)

**EffectComposer** — A Threlte/Three.js component that manages a chain of post-processing passes (bloom, vignette, etc.) applied to the rendered 3D scene. (First introduced: Module 14, Lesson 14.6)

**Enhanced fetch** — SvelteKit's modified `fetch` function available in load functions that handles cookie forwarding, request deduplication, and relative URLs during SSR. (First introduced: Module 9A, Lesson 9A.4)

**Environment variable** — A configuration value provided at build time or runtime, accessed in SvelteKit via `$env/static/private`, `$env/static/public`, `$env/dynamic/private`, or `$env/dynamic/public`. (First introduced: Module 10, Lesson 10.7)

**Error boundary** — A `<svelte:boundary>` component that catches rendering errors in its child tree and displays a fallback UI instead of crashing the entire page. (First introduced: Module 12, Lesson 12.7)

**`error()`** — A SvelteKit helper function that throws an expected error with an HTTP status code and message, rendering the nearest `+error.svelte` page. (First introduced: Module 9A, Lesson 9A.8)

**Event loop** — The JavaScript execution model that processes synchronous code, then microtasks, then one macrotask, enabling non-blocking async operations in a single-threaded environment. (First introduced: Module 4, Lesson 4.7)

---

## F

**File-based routing** — SvelteKit's convention where the directory structure inside `src/routes/` determines URL paths, with special files (`+page.svelte`, `+layout.svelte`, `+server.ts`) defining route behavior. (First introduced: Module 8, Lesson 8.4)

**FLIP** — An animation technique (First, Last, Invert, Play) that records element positions before and after a change, then animates the difference using GPU-accelerated transforms. (First introduced: Module 6, Lesson 6.13)

**Flexbox** — A one-dimensional CSS layout system for arranging items along a single axis (row or column) with flexible sizing and alignment. (First introduced: Module 6, Lesson 6.7)

**Fluid typography** — A responsive typography approach using `clamp()` with viewport units to smoothly scale text sizes between minimum and maximum values without breakpoints. (First introduced: Module 1, Lesson 1.6)

**Focus management** — The practice of programmatically controlling which element receives keyboard focus, essential for modals, navigation, and dynamic content updates. (First introduced: Module 5, Lesson 5.10)

**`for...of`** — A JavaScript loop that iterates over values of an iterable (arrays, strings, Maps, Sets), preferred over `for...in` for array iteration. (First introduced: Module 4, Lesson 4.3)

**Form action** — A server-side function in SvelteKit's `+page.server.ts` that processes form submissions with validation and mutations. (First introduced: Module 10, Lesson 10.3)

**`form` (remote function)** — A SvelteKit remote function type for server-side form handling with Valibot schema validation and file upload streaming support. (First introduced: Module 9B, Lesson 9B.5)

**`frameloop`** — A Threlte `<Canvas>` prop controlling when the render loop runs: `"always"` (every frame), `"demand"` (only when invalidated), or `"never"` (manual control). (First introduced: Module 12, Lesson 12.12)

**Frustum culling** — The automatic removal of objects outside the camera's view volume from the rendering pipeline, a default Three.js optimization. (First introduced: Module 14, Lesson 14.8)

---

## G

**Generics** — TypeScript type parameters (`<T>`) that allow functions, classes, and types to work with any data type while preserving type safety at call sites. (First introduced: Module 3, Lesson 3.3)

**GEO (Generative Engine Optimization)** — Optimization techniques for ensuring content is accurately represented in AI-generated search results and summaries. (First introduced: Module 13, Lesson 13.12)

**GLB/GLTF** — Standard file formats for 3D models, where GLTF is JSON-based (with separate binary and texture files) and GLB is a single binary package containing all data. (First introduced: Module 14, Lesson 14.3)

**`:global()`** — A Svelte CSS modifier that escapes scoped styling, allowing a rule to apply globally: `:global(body) { margin: 0 }`. (First introduced: Module 1, Lesson 1.7)

**`goto()`** — A SvelteKit navigation function from `$app/navigation` for programmatic client-side navigation with options for history replacement, scroll control, and data invalidation. (First introduced: Module 8, Lesson 8.8)

**GSAP (GreenSock Animation Platform)** — A professional JavaScript animation library for complex timelines, scroll-driven animations, and high-performance motion that extends beyond Svelte's built-in transitions. (First introduced: Module 7, Lesson 7.1)

**`gsap.from()`** — A GSAP method that animates an element from specified values to its current CSS state. (First introduced: Module 7, Lesson 7.3)

**`gsap.fromTo()`** — A GSAP method that animates an element from one set of values to another, with full control over both start and end states. (First introduced: Module 7, Lesson 7.3)

**`gsap.to()`** — A GSAP method that animates an element from its current CSS state to specified target values. (First introduced: Module 7, Lesson 7.3)

---

## H

**`handle()`** — The primary export from SvelteKit's `hooks.server.ts` that intercepts every server request for authentication, logging, header modification, and request transformation. (First introduced: Module 8, Lesson 8.9)

**`handleError()`** — A hook in `hooks.server.ts` (and `hooks.client.ts`) that catches unexpected errors for logging to monitoring services and optional custom error shaping. (First introduced: Module 8, Lesson 8.9)

**`handleFetch()`** — A SvelteKit hook that intercepts `fetch` calls made inside load functions during SSR, allowing URL rewriting and header modification. (First introduced: Module 8, Lesson 8.9)

**`:has()`** — A CSS relational pseudo-class that selects an element based on its descendants or siblings, often called the "parent selector." (First introduced: Module 6, Lesson 6.8)

**Hash (CSS scoping)** — The deterministic class suffix (e.g., `.svelte-1a2b3c`) that the Svelte compiler adds to elements and CSS selectors to scope styles to a single component. (First introduced: Module 1, Lesson 1.7)

**Headless UI** — A component architecture where the logic (state, accessibility, keyboard navigation) is provided without predetermined styles, as used by TanStack Table. (First introduced: Module 11, Lesson 11.7)

**HMR (Hot Module Replacement)** — Vite's development feature that updates modules in the browser without a full page reload when source files change, preserving application state. (First introduced: Module 1, Lesson 1.2)

**`hooks.client.ts`** — SvelteKit's client-side hook file for catching client-side errors with `handleError`. (First introduced: Module 8, Lesson 8.9)

**`hooks.server.ts`** — SvelteKit's server-side hook file that intercepts every server request, providing middleware functionality for auth, logging, and request processing. (First introduced: Module 8, Lesson 8.9)

**`$host()`** — A Svelte 5 rune that accesses the custom element's host node when a Svelte component is compiled as a web component. (First introduced: Module 2, Lesson 2.1)

**Hydration** — The client-side process where JavaScript takes over server-rendered HTML, attaching event listeners and connecting reactive state to existing DOM nodes without re-creating them. (First introduced: Module 8, Lesson 8.3)

**Hydration mismatch** — An error that occurs when client-side rendering produces different DOM than the server-rendered HTML, causing visual glitches and potential bugs. (First introduced: Module 8, Lesson 8.3)

---

## I

**`{#if}`** — Svelte's template block for conditional rendering, supporting `{:else if}` and `{:else}` branches for multi-path logic. (First introduced: Module 4, Lesson 4.1)

**Immutable** — A value that cannot be changed after creation; in TypeScript, enforced with `readonly` properties, `ReadonlyArray`, or `as const`. (First introduced: Module 2, Lesson 2.5)

**`in:` / `out:`** — Svelte transition directives that define separate enter and exit animations for an element, unlike `transition:` which uses the same animation for both. (First introduced: Module 6, Lesson 6.12)

**`$inspect()`** — A development-only Svelte 5 rune that reactively logs values to the console when they change, automatically stripped from production builds. (First introduced: Module 2, Lesson 2.9)

**`Intl` API** — JavaScript's built-in internationalization API (`Intl.NumberFormat`, `Intl.DateTimeFormat`, `Intl.RelativeTimeFormat`) for locale-aware formatting. (First introduced: Module 6, Lesson 6.5)

**INP (Interaction to Next Paint)** — A Core Web Vital metric measuring responsiveness — the time from user interaction (click, tap, key press) to the next visual update. Target: under 200ms. (First introduced: Module 12, Lesson 12.1)

**`instrumentation.server.ts`** — A SvelteKit file for configuring OpenTelemetry tracing and observability instrumentation on the server. (First introduced: Module 8, Lesson 8.10)

**`invalidate()`** — A SvelteKit function from `$app/navigation` that triggers re-running of load functions matching a URL pattern or custom dependency key. (First introduced: Module 9A, Lesson 9A.7)

**`invalidateAll()`** — A SvelteKit function that re-runs all load functions for the current page, regardless of their dependency registrations. (First introduced: Module 9A, Lesson 9A.7)

**Intersection** — A TypeScript type operator (`A & B`) that combines two types, requiring a value to satisfy both simultaneously. (First introduced: Module 1, Lesson 1.8)

**IntersectionObserver** — A browser API that asynchronously detects when an element enters or exits the viewport, used for lazy loading, infinite scroll, and scroll-triggered animations. (First introduced: Module 7, Lesson 7.12)

---

## J

**JSON-LD** — JavaScript Object Notation for Linked Data, a structured data format embedded in `<script type="application/ld+json">` tags for search engine machine-readable content. (First introduced: Module 13, Lesson 13.6)

---

## K

**Key expression** — The value in parentheses in Svelte's `{#each array as item (item.id)}` that uniquely identifies each item for efficient DOM updates during list changes. (First introduced: Module 4, Lesson 4.4)

**`{#key}`** — A Svelte template block that destroys and recreates its content whenever its expression value changes, useful for triggering transitions on route changes. (First introduced: Module 4, Lesson 4.6)

**KTX2** — A GPU-ready texture compression format used with Three.js/Threlte for dramatically smaller texture file sizes and faster GPU uploads. (First introduced: Module 14, Lesson 14.3)

---

## L

**`@layer`** — A CSS cascade feature that organizes rules into named layers with explicit priority order, eliminating specificity wars: `@layer reset, tokens, base, layout, components, utilities`. (First introduced: Module 1, Lesson 1.5)

**Lazy loading** — Deferring the loading of resources (images, components, modules) until they are needed, reducing initial page load time. (First introduced: Module 12, Lesson 12.3)

**Layout** — A SvelteKit `+layout.svelte` file that wraps child pages with shared UI (navigation, footer), providing consistent structure across routes. (First introduced: Module 8, Lesson 8.5)

**Layout data** — Data loaded in `+layout.ts` or `+layout.server.ts` that is available to the layout component and all its child pages. (First introduced: Module 9A, Lesson 9A.5)

**LCP (Largest Contentful Paint)** — A Core Web Vital metric measuring loading speed — the time until the largest visible content element is rendered. Target: under 2.5 seconds. (First introduced: Module 12, Lesson 12.1)

**Lighthouse** — An automated auditing tool built into Chrome DevTools that scores pages on Performance, Accessibility, Best Practices, and SEO. (First introduced: Module 12, Lesson 12.1)

**Load function** — A SvelteKit function in `+page.ts` or `+page.server.ts` that fetches data before a page renders, providing it to the component via the `data` prop. (First introduced: Module 9A, Lesson 9A.1)

**`locals`** — An object on SvelteKit's `RequestEvent` populated in `hooks.server.ts` and accessible in load functions and form actions, typically used for authenticated user data. (First introduced: Module 8, Lesson 8.9)

**Logical properties** — CSS properties that use flow-relative directions (`inline-start`, `inline-end`, `block-start`, `block-end`) instead of physical directions (`left`, `right`, `top`, `bottom`), automatically adapting to writing direction. (First introduced: Module 6, Lesson 6.5)

**LOD (Level of Detail)** — A 3D optimization technique that uses lower-polygon models for objects far from the camera and higher-polygon models for close objects. (First introduced: Module 14, Lesson 14.8)

---

## M

**Macrotask** — An event loop task from sources like `setTimeout`, `setInterval`, user events, and I/O callbacks, processed one at a time between microtask flushes. (First introduced: Module 4, Lesson 4.7)

**Mapped type** — A TypeScript type that transforms each property of an existing type, such as `Partial<T>`, `Required<T>`, or custom mappings using `{ [K in keyof T]: NewType }`. (First introduced: Module 2, Lesson 2.13)

**`MeshStandardMaterial`** — A Three.js/Threlte material that uses physically-based rendering (PBR) for realistic lighting with metalness and roughness properties. (First introduced: Module 14, Lesson 14.2)

**Microtask** — An event loop task from sources like Promise callbacks, `queueMicrotask`, and `MutationObserver`, processed exhaustively before the next macrotask. (First introduced: Module 4, Lesson 4.7)

**Mini-build** — A complete, runnable code artifact produced in each lesson that the student can see in the browser, designed to compound into the module project. (First introduced: Module 1, Lesson 1.1)

**Mobile-first** — A CSS methodology where base styles target mobile screens and larger screens are enhanced with `@media (min-width: ...)` queries. (First introduced: Module 1, Lesson 1.5)

**Module project** — A larger project at the end of each module that integrates all mini-builds and concepts from the module's lessons. (First introduced: Module 1, Lesson 1.9)

**Motion token** — A design token defining animation duration and easing values (e.g., `--duration-fast: 150ms`, `--ease-out: cubic-bezier(0.33, 1, 0.68, 1)`) for consistent motion across components. (First introduced: Module 6, Lesson 6.3)

---

## N

**Named action** — Multiple form actions in a single `+page.server.ts`, distinguished by name and targeted via the form's `action` attribute: `action="?/delete"`. (First introduced: Module 10, Lesson 10.4)

**Narrowing** — TypeScript's ability to refine a broad type to a more specific one within a conditional block, using type guards like `typeof`, `instanceof`, or discriminant checks. (First introduced: Module 4, Lesson 4.1)

**`<noscript>`** — An HTML element that renders content only when JavaScript is disabled or unavailable, used as a fallback for JS-dependent features like Threlte scenes. (First introduced: Module 13, Lesson 13.15)

---

## O

**OKLCH** — A perceptually uniform color space using Lightness, Chroma, and Hue, where equal numeric changes produce equal perceived visual changes, making it ideal for design token systems. (First introduced: Module 1, Lesson 1.5)

**`onMount`** — A Svelte lifecycle function from `'svelte'` for one-time browser-only initialization code, still available in Svelte 5 alongside `$effect` for specific use cases. (First introduced: Module 7, Lesson 7.5)

**`onNavigate`** — A SvelteKit lifecycle hook from `$app/navigation` that runs during navigation, integrating with the View Transitions API for cross-page visual transitions. (First introduced: Module 8, Lesson 8.11)

**Open Graph** — A metadata protocol (`<meta property="og:...">`) that controls how URLs are previewed when shared on social media platforms. (First introduced: Module 13, Lesson 13.4)

**OpenTelemetry** — An observability framework for distributed tracing, metrics, and logs, integrated with SvelteKit via `instrumentation.server.ts`. (First introduced: Module 8, Lesson 8.10)

**Optimistic UI** — A pattern that updates the user interface immediately when the user performs an action, before the server confirms, rolling back if the server rejects the change. (First introduced: Module 11, Lesson 11.10)

**OrbitControls** — A Threlte/Three.js camera controller that lets users rotate, pan, and zoom the camera around a target point using mouse or touch input. (First introduced: Module 14, Lesson 14.2)

---

## P

**`page`** — A reactive object from `$app/state` containing the current URL, route parameters, load function data, form action results, and error information. (First introduced: Module 8, Lesson 8.7)

**PE7** — The CSS architecture system taught in this course, using `@layer` cascade ordering, OKLCH color tokens, fluid `clamp()` values, logical properties, and mobile-first responsive design. (First introduced: Module 1, Lesson 1.5)

**Perceptual uniformity** — A property of color spaces like OKLCH where equal numeric steps in lightness, chroma, or hue produce equally perceived visual differences to the human eye. (First introduced: Module 1, Lesson 1.5)

**`PerspectiveCamera`** — A Three.js/Threlte camera that simulates human vision with perspective projection, where distant objects appear smaller. (First introduced: Module 14, Lesson 14.2)

**Physics (Rapier)** — A physics simulation engine integrated with Threlte via `@threlte/rapier`, providing rigid body dynamics, collision detection, and gravity simulation for 3D scenes. (First introduced: Module 14, Lesson 14.7)

**Playwright** — An end-to-end testing framework that runs tests in real browsers, used for testing full SvelteKit application behavior including SSR, navigation, and user interactions. (First introduced: Module 12, Lesson 12.10)

**`pnpm`** — The package manager used exclusively in this course, offering faster installation, stricter dependency management, and more efficient disk usage than npm or yarn. (First introduced: Module 1, Lesson 1.2)

**Post-processing** — Full-screen visual effects applied to a rendered 3D scene (bloom, vignette, chromatic aberration) using EffectComposer in Threlte. (First introduced: Module 14, Lesson 14.6)

**`prefers-color-scheme`** — A CSS media query that detects the user's system-level dark/light theme preference for automatic theme matching. (First introduced: Module 6, Lesson 6.9)

**`prefers-reduced-motion`** — A CSS media query that detects if the user has requested reduced animation, essential for vestibular accessibility. (First introduced: Module 6, Lesson 6.18)

**Preloading** — SvelteKit's mechanism for fetching route data and code before the user navigates, triggered by `data-sveltekit-preload-data` on links. (First introduced: Module 8, Lesson 8.8)

**Prerendering** — SvelteKit's Static Site Generation (SSG) that renders pages at build time to static HTML files, enabled with `export const prerender = true`. (First introduced: Module 9A, Lesson 9A.10)

**Progressive enhancement** — A design philosophy where applications work with basic HTML forms and enhance with JavaScript for a smoother experience, implemented in SvelteKit with `use:enhance`. (First introduced: Module 10, Lesson 10.5)

**`Promise<T>`** — A TypeScript-typed JavaScript object representing an eventual async result, parameterized with the resolved value type. (First introduced: Module 4, Lesson 4.10)

**`Promise.all()`** — A Promise combinator that waits for all input promises to resolve, returning an array of results; rejects immediately if any promise rejects. (First introduced: Module 4, Lesson 4.7)

**`Promise.allSettled()`** — A Promise combinator that waits for all promises to settle (resolve or reject), returning status objects for each; never rejects. (First introduced: Module 4, Lesson 4.7)

**Prop** — Data passed from a parent component to a child component, declared in Svelte 5 with `$props()` and typed via the generic parameter. (First introduced: Module 3, Lesson 3.2)

**Prop drilling** — The anti-pattern of passing data through many intermediate components that do not use it, solved by context, URL state, or shared modules. (First introduced: Module 11, Lesson 11.1)

**`$props()`** — A Svelte 5 rune for declaring component props, replacing `export let`, with TypeScript generic support and native destructuring. (First introduced: Module 3, Lesson 3.2)

**Proxy** — A JavaScript object wrapper that intercepts fundamental operations (get, set, delete) via handler traps, used by Svelte's `$state` for deep reactive tracking. (First introduced: Module 2, Lesson 2.3)

---

## Q

**`query` (remote function)** — A SvelteKit remote function type for reading server-side data from any component, with argument support and async SSR integration. (First introduced: Module 9B, Lesson 9B.2)

**`query.batch()`** — A remote function method that batches multiple server queries into a single HTTP request, reducing network round trips. (First introduced: Module 9B, Lesson 9B.4)

**`query.set()`** — A remote function method that provides server-driven reactive state, pushing updates from server to client for real-time data. (First introduced: Module 9B, Lesson 9B.8)

---

## R

**Rapier** — A physics engine for the web, integrated with Threlte via `@threlte/rapier` for rigid body simulation, collision detection, and physics-based interactions. (First introduced: Module 14, Lesson 14.7)

**Raycasting** — A technique in Three.js/Threlte for determining which 3D objects the user's cursor or touch point intersects, enabling pointer-based interactivity. (First introduced: Module 14, Lesson 14.4)

**Reactive class** — A TypeScript class in a `.svelte.ts` file that uses runes (`$state`, `$derived`, `$effect`) in its properties and methods for encapsulated reactive state management. (First introduced: Module 11, Lesson 11.5)

**`redirect()`** — A SvelteKit helper that throws a redirect error with a status code and URL, used in load functions and form actions to redirect the user. (First introduced: Module 9A, Lesson 9A.8)

**Remote function** — A SvelteKit feature (May 2026) that allows components to call server-side functions directly, available as `query`, `command`, and `form` types. (First introduced: Module 9B, Lesson 9B.1)

**`@render`** — Svelte 5's template tag `{@render snippetName(args)}` for rendering a declared snippet with optional arguments. (First introduced: Module 3, Lesson 3.6)

**`{@render}`** — See `@render`. (First introduced: Module 3, Lesson 3.6)

**Rest parameter** — The `...rest` syntax in destructuring or function parameters that collects remaining values into an array or object. (First introduced: Module 3, Lesson 3.2)

**RigidBody** — A Threlte/Rapier physics component that gives a 3D object physical properties (mass, velocity, friction) for physics simulation. (First introduced: Module 14, Lesson 14.7)

**Route group** — A SvelteKit directory in parentheses like `(auth)` that organizes routes and shares layouts without adding a URL segment. (First introduced: Module 8, Lesson 8.5)

**Rune** — A Svelte 5 compiler-recognized function-like primitive (`$state`, `$derived`, `$effect`, `$props`, `$bindable`, `$inspect`, `$host`) that provides explicit reactivity. (First introduced: Module 2, Lesson 2.1)

---

## S

**`satisfies`** — A TypeScript operator that validates an expression matches a type without widening the inferred types, combining type checking with literal type preservation. (First introduced: Module 2, Lesson 2.13)

**Scene graph** — The hierarchical tree structure of objects in a 3D scene (meshes, lights, cameras), where child transforms are relative to parent transforms. (First introduced: Module 14, Lesson 14.1)

**Scoped CSS** — Svelte's default CSS behavior where styles in a `<style>` block are scoped to that component via hash-based class additions, preventing style leakage. (First introduced: Module 1, Lesson 1.7)

**ScrollTrigger** — A GSAP plugin that creates animations driven by scroll position, supporting trigger points, scrubbing, pinning, and progress callbacks. (First introduced: Module 7, Lesson 7.9)

**`sequence()`** — A SvelteKit utility from `@sveltejs/kit/hooks` that composes multiple `handle` functions into a single handler chain. (First introduced: Module 8, Lesson 8.9)

**Server load function** — A SvelteKit load function in `+page.server.ts` that runs only on the server, with access to databases, private env vars, and `event.locals`. (First introduced: Module 9A, Lesson 9A.2)

**Server-Sent Events (SSE)** — A browser API for receiving push updates from the server over a single HTTP connection using the `text/event-stream` content type. (First introduced: Module 9B, Lesson 9B.8)

**`+server.ts`** — A SvelteKit file that defines API endpoints with exported HTTP method handlers (`GET`, `POST`, `PUT`, `DELETE`) returning `Response` objects. (First introduced: Module 10, Lesson 10.1)

**Shadow DOM** — A browser API for encapsulated DOM trees with style isolation; notably, Svelte does not use Shadow DOM for its scoped CSS (it uses hash classes instead). (First introduced: Module 1, Lesson 1.7)

**Signal** — An internal reactive primitive created by the Svelte compiler from `$state` declarations, holding a value and tracking dependent effects and derivations. (First introduced: Module 2, Lesson 2.1)

**Sitemap** — An XML file listing all indexable URLs of a site with metadata (last modified, change frequency), generated dynamically in SvelteKit via a `+server.ts` endpoint. (First introduced: Module 13, Lesson 13.8)

**`{#snippet}`** — Svelte 5's template block for declaring reusable markup fragments with optional parameters, replacing the slot mechanism from Svelte 3/4. (First introduced: Module 3, Lesson 3.6)

**`Snippet<T>`** — A TypeScript type for snippet props, parameterized with a tuple of argument types, enabling type-safe snippet passing between components. (First introduced: Module 3, Lesson 3.7)

**Source map** — A file that maps compiled/minified code back to original source code, enabling meaningful stack traces and debugging in production. (First introduced: Module 12, Lesson 12.11)

**`spring`** — A `svelte/motion` store that uses physics-based spring simulation for natural-feeling value interpolation with configurable stiffness and damping. (First introduced: Module 6, Lesson 6.15)

**SSG (Static Site Generation)** — A rendering mode where pages are generated as static HTML at build time, deployable to any static hosting without a server. (First introduced: Module 8, Lesson 8.12)

**SSR (Server-Side Rendering)** — A rendering mode where HTML is generated on the server for each request, providing immediate content visibility and SEO benefits before client-side hydration. (First introduced: Module 8, Lesson 8.2)

**`$state()`** — A Svelte 5 rune that declares reactive mutable state with deep proxy-based tracking for objects and arrays. (First introduced: Module 2, Lesson 2.2)

**`$state.raw()`** — A Svelte 5 rune that creates shallow reactive state without deep proxy wrapping, where the variable is reactive but its contents are not mutation-tracked. (First introduced: Module 2, Lesson 2.5)

**`$state.snapshot()`** — A Svelte 5 function that returns a plain, non-reactive clone of a reactive proxy value, for use with `JSON.stringify`, `postMessage`, or logging. (First introduced: Module 2, Lesson 2.6)

**Stagger** — A GSAP animation pattern that applies the same animation to multiple elements with incremental delays, creating a wave or cascade visual effect. (First introduced: Module 7, Lesson 7.8)

**Static analysis** — The Svelte compiler's examination of source code at build time to identify reactive dependencies, template bindings, and unused CSS for optimization. (First introduced: Module 1, Lesson 1.1)

**Streaming (SSR)** — SvelteKit's ability to send HTML in chunks, delivering above-fold content immediately while slower data resolves and streams later. (First introduced: Module 9A, Lesson 9A.9)

**Strict mode (TypeScript)** — TypeScript's `"strict": true` configuration that enables comprehensive type checking including `strictNullChecks`, `noImplicitAny`, and other safety flags. (First introduced: Module 1, Lesson 1.4)

**`structuredClone`** — A browser API for deep-cloning JavaScript values, supporting more types than `JSON.parse(JSON.stringify())` but not cloning reactive proxies (use `$state.snapshot` instead). (First introduced: Module 2, Lesson 2.6)

**Structured data** — Machine-readable information embedded in HTML (typically as JSON-LD) that helps search engines understand page content for rich results. (First introduced: Module 13, Lesson 13.6)

**Subgrid** — A CSS Grid feature (`grid-template-rows: subgrid`) that allows a grid item's children to align to the parent grid's track definitions. (First introduced: Module 6, Lesson 6.6)

**`<svelte:boundary>`** — See Error boundary. (First introduced: Module 12, Lesson 12.7)

**`<svelte:head>`** — A Svelte special element that injects its contents into the document `<head>`, used for meta tags, titles, Open Graph tags, and JSON-LD. (First introduced: Module 13, Lesson 13.2)

**`.svelte.ts`** — A TypeScript module file processed by the Svelte compiler, enabling rune usage (`$state`, `$derived`, `$effect`) outside of component files for shared reactive logic. (First introduced: Module 11, Lesson 11.3)

**SvelteKit** — A full-stack application framework built on Svelte and Vite, providing routing, SSR, data loading, form handling, and deployment adapters. (First introduced: Module 8, Lesson 8.1)

---

## T

**`<T.*>`** — Threlte's auto-generated wrapper components for Three.js classes (e.g., `<T.Mesh>`, `<T.BoxGeometry>`, `<T.PointLight>`), providing declarative scene graph construction. (First introduced: Module 14, Lesson 14.1)

**TanStack Table** — A headless table library providing sorting, filtering, pagination, and column management logic without any UI, styled and rendered by the consuming component. (First introduced: Module 11, Lesson 11.7)

**Template literal type** — A TypeScript type using backtick syntax (`` `prefix-${string}` ``) to define string types with pattern constraints. (First introduced: Module 5, Lesson 5.3)

**Threlte** — A declarative Three.js framework for Svelte 5 that provides reactive 3D scene components (`<Canvas>`, `<T.*>`) with rune integration. (First introduced: Module 7, Lesson 7.14)

**Three.js** — A JavaScript library for creating and displaying 3D graphics in the browser using WebGL, abstracted by Threlte for Svelte integration. (First introduced: Module 7, Lesson 7.14)

**Throttling** — A technique that limits a function to execute at most once per specified time interval, used for scroll and resize handlers. (First introduced: Module 5, Lesson 5.7)

**Timeline (GSAP)** — A GSAP sequencing tool that orchestrates multiple animations with precise timing, overlaps, labels, and control methods (play, pause, reverse, seek). (First introduced: Module 7, Lesson 7.4)

**Token** — See Design token. (First introduced: Module 1, Lesson 1.5)

**`transition:`** — A Svelte directive that applies enter and exit animations when elements are added to or removed from the DOM via control flow blocks. (First introduced: Module 6, Lesson 6.11)

**Tree-shaking** — A build optimization that removes unused code (dead code elimination) from the final bundle, based on ES module static imports. (First introduced: Module 12, Lesson 12.3)

**`try/catch`** — JavaScript's error handling syntax for catching exceptions thrown in synchronous code or `await`ed Promises. (First introduced: Module 4, Lesson 4.9)

**`tweened`** — A `svelte/motion` store that interpolates values over a fixed duration with an easing function for time-based animations. (First introduced: Module 6, Lesson 6.14)

**Type assertion** — TypeScript's `as Type` syntax that overrides the compiler's inferred type; should be avoided in favor of type guards or `satisfies`. (First introduced: Module 2, Lesson 2.13)

**Type guard** — An expression or function that narrows a type within a conditional block, using `typeof`, `instanceof`, `in`, or a custom `value is Type` return type. (First introduced: Module 4, Lesson 4.1)

**Type inference** — TypeScript's ability to automatically determine the type of a value from its initialization or usage context, reducing the need for explicit annotations. (First introduced: Module 1, Lesson 1.4)

**`$types`** — SvelteKit's auto-generated type definitions that provide end-to-end type safety between load functions and page components, requiring zero manual type declarations. (First introduced: Module 9A, Lesson 9A.3)

---

## U

**Union type** — A TypeScript type that allows a value to be one of several types, written with the `|` operator: `string | number`. (First introduced: Module 1, Lesson 1.4)

**Universal load function** — A SvelteKit load function in `+page.ts` that runs on both server (SSR) and client (navigation), unable to access server-only resources but able to return non-serializable data. (First introduced: Module 9A, Lesson 9A.2)

**`unknown`** — A TypeScript type that represents any value but requires type narrowing before use, the type-safe alternative to `any`. (First introduced: Module 4, Lesson 4.9)

**`use:` directive** — Svelte's syntax for applying actions to DOM elements: `<div use:action={params}>`, providing lifecycle-managed imperative behavior. (First introduced: Module 7, Lesson 7.11)

**`use:enhance`** — A SvelteKit directive that progressively enhances native form submissions with `fetch`-based submission, avoiding full page reloads while maintaining no-JS fallback. (First introduced: Module 10, Lesson 10.5)

**`useFrame`** — A Threlte hook that registers a callback to run on every animation frame, used for continuous animations and physics updates. (First introduced: Module 14, Lesson 14.5)

**`useGltf`** — A Threlte hook from `@threlte/extras` for asynchronously loading GLTF/GLB 3D models with reactive loading state and error handling. (First introduced: Module 14, Lesson 14.3)

---

## V

**Valibot** — A TypeScript-first schema validation library used in this course for form validation, API response validation, and type-safe data parsing with small bundle size. (First introduced: Module 9B, Lesson 9B.5)

**View Transitions API** — A browser API for animating visual changes between DOM states, integrated with SvelteKit via `onNavigate` for smooth page transitions. (First introduced: Module 8, Lesson 8.11)

**Vignette** — A post-processing effect that darkens the edges and corners of the rendered image, drawing the viewer's eye toward the center. (First introduced: Module 14, Lesson 14.6)

**Virtual DOM** — A programming concept (used by React and Vue) where a lightweight copy of the DOM is maintained in memory for diffing; notably, Svelte does not use a virtual DOM. (First introduced: Module 1, Lesson 1.1)

**Vitest** — A Vite-native testing framework used for unit and integration testing of Svelte components, `.svelte.ts` modules, and SvelteKit server code. (First introduced: Module 12, Lesson 12.9)

**Vite** — The build tool and development server that powers SvelteKit, providing fast HMR, ES module serving, and production bundling via Rollup. (First introduced: Module 1, Lesson 1.2)

**`vite-plugin-svelte`** — The Vite plugin that integrates the Svelte compiler into Vite's build pipeline for development and production. (First introduced: Module 1, Lesson 1.2)

---

## W

**Web Worker** — A browser API for running JavaScript in a background thread, used for offloading heavy computations without blocking the main thread or UI updates. (First introduced: Module 12, Lesson 12.4)

**WebGL** — A browser API for rendering 2D and 3D graphics using the GPU, the underlying technology behind Three.js and Threlte. (First introduced: Module 7, Lesson 7.14)

**`will-change`** — A CSS property that hints to the browser which properties will be animated, allowing it to optimize by promoting the element to a compositor layer. (First introduced: Module 6, Lesson 6.10)

---

## X

**XSS (Cross-Site Scripting)** — A security vulnerability where malicious scripts are injected into web pages; Svelte auto-escapes template expressions, but `{@html}` requires manual sanitization. (First introduced: Module 12, Lesson 12.8)

---

## Z

**z-index** — A CSS property controlling the stacking order of positioned elements, best managed through design tokens for consistency: `--z-dropdown: 100`, `--z-modal: 200`. (First introduced: Module 6, Lesson 6.6)

---

*End of Glossary — approximately 200 entries covering all technical terms used across all 14 modules and the capstone project.*
