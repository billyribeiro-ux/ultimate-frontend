# Module 18 — Advanced Patterns: Video Lecture Script Outlines

> **Recording note:** Set editor font to 18px minimum. These lessons are conceptually dense — use diagrams and slides more than live coding. Split-screen: editor (left), browser or slides (right).

---

## Lesson 18.1 — Compound components

**Duration:** 11 minutes
**Screen setup:** Editor with compound component code, browser showing composed UI

### Hook (30 seconds)
"A `<Tabs>` component needs `<TabList>`, `<Tab>`, and `<TabPanel>`. They must share state: which tab is active. Compound components are a set of components designed to work together, sharing state through context while presenting a clean API to consumers."

### Demo sequence
1. **[0:30-2:30] The pattern** — Parent component sets context. Children read context. Together they form a compound unit.
2. **[2:30-5:00] Building Tabs** — Tabs, TabList, Tab, TabPanel. Context shares the active tab ID.
3. **[5:00-7:30] Consumer API** — Show how clean the usage is: `<Tabs><TabList><Tab>A</Tab></TabList><TabPanel>Content A</TabPanel></Tabs>`.
4. **[7:30-9:30] Build the mini-build** — Accessible compound Tabs with keyboard navigation and ARIA.
5. **[9:30-10:30] Edge case / gotcha** — "Compound components must validate their context. If `<Tab>` is used outside `<Tabs>`, throw a helpful error, not a cryptic 'cannot read undefined'."

### Key moments
- 0:30 — "Components that work together"
- 2:30 — "Context-based state sharing"
- 5:00 — "Clean consumer API"
- 7:30 — "Accessible Tabs"
- 9:30 — "Context validation"

### Callout graphics
- Compound component architecture
- Context flow between components
- Consumer API example

### Outro (30 seconds)
"Compound components share state through context. Next lesson: polymorphic components."

---

## Lesson 18.2 — Polymorphic components

**Duration:** 10 minutes
**Screen setup:** Editor with polymorphic component, browser showing different renderings

### Hook (30 seconds)
"A `<Button>` that sometimes renders as an `<a>` tag for navigation. A `<Text>` that renders as `<p>`, `<span>`, or `<h1>` depending on context. Polymorphic components change their HTML element while keeping the same API."

### Demo sequence
1. **[0:30-2:30] The need** — Button that navigates should be an `<a>`, not a `<button>`. Semantics matter for accessibility.
2. **[2:30-5:00] Implementation** — `as` prop that changes the rendered element. TypeScript union for allowed elements.
3. **[5:00-7:00] Type safety** — Ensure that props match the element: `href` only available when `as="a"`.
4. **[7:00-8:30] Build the mini-build** — Polymorphic Button: renders as button, a, or div with correct attributes.
5. **[8:30-9:30] Edge case / gotcha** — "Polymorphic components are complex to type correctly. In many cases, creating separate `<Button>` and `<LinkButton>` components is simpler and equally effective."

### Key moments
- 0:30 — "One component, multiple elements"
- 2:30 — "The as prop"
- 5:00 — "Type-safe attributes"
- 7:00 — "Polymorphic Button"
- 8:30 — "Simplicity vs flexibility"

### Callout graphics
- Polymorphic rendering
- TypeScript type narrowing
- Separate components alternative

### Outro (30 seconds)
"Polymorphic components flex their HTML element. Next lesson: headless components."

---

## Lesson 18.3 — Headless components

**Duration:** 11 minutes
**Screen setup:** Editor with headless component, browser showing custom rendering

### Hook (30 seconds)
"A combobox needs keyboard navigation, focus management, ARIA attributes, and filtering logic. Building all of that is complex. A headless component provides the behavior and accessibility — you provide the visual design. Logic without opinions."

### Demo sequence
1. **[0:30-2:30] What headless means** — The component manages state and accessibility. You render the UI with snippets.
2. **[2:30-5:00] Building a headless toggle** — State, ARIA, keyboard handling inside. UI outside via render props/snippets.
3. **[5:00-7:30] Headless combobox** — Search, filter, select logic inside. Custom dropdown UI outside.
4. **[7:30-9:30] Build the mini-build** — Headless toggle group used with two completely different visual styles.
5. **[9:30-10:30] Edge case / gotcha** — "Headless components must expose enough state for any visual design. If you hide state, consumers cannot style conditional states."

### Key moments
- 0:30 — "Behavior without UI"
- 2:30 — "Headless toggle"
- 5:00 — "Headless combobox"
- 7:30 — "Two visual styles, one component"
- 9:30 — "Expose enough state"

### Callout graphics
- Headless architecture
- Snippet-based rendering
- State exposure API

### Outro (30 seconds)
"Headless components separate behavior from presentation. Next lesson: state machines."

---

## Lesson 18.4 — State machines with runes

**Duration:** 11 minutes
**Screen setup:** Editor with state machine, browser showing state transitions

### Hook (30 seconds)
"A form can be idle, submitting, success, or error. A media player can be playing, paused, buffering, or ended. State machines make these states explicit and transitions predictable. With runes, you can build them in pure TypeScript."

### Demo sequence
1. **[0:30-2:30] Why state machines** — Boolean flags create impossible states (loading AND error). State machines eliminate them.
2. **[2:30-5:00] Building with runes** — $state for current state, methods for transitions, guards for valid transitions.
3. **[5:00-7:30] Async transitions** — Loading → success/error based on async results.
4. **[7:30-9:30] Build the mini-build** — Fetch state machine: idle → loading → success/error, with retry.
5. **[9:30-10:30] Edge case / gotcha** — "State machines add complexity upfront. Use them for components with 3+ states and complex transitions. For simple toggle states, a boolean is fine."

### Key moments
- 0:30 — "Impossible states"
- 2:30 — "Runes-based machine"
- 5:00 — "Async transitions"
- 7:30 — "Fetch machine"
- 9:30 — "When to use"

### Callout graphics
- State transition diagram
- Boolean flags vs state machine
- Async state machine flow

### Outro (30 seconds)
"State machines eliminate impossible states. Next lesson: micro-frontends."

---

## Lesson 18.5 — Micro-frontends with SvelteKit

**Duration:** 10 minutes
**Screen setup:** Slides for architecture, editor for integration code

### Hook (30 seconds)
"Multiple teams, one product. Team A builds the checkout in Svelte. Team B builds the dashboard in React. Micro-frontends let each team deploy independently. But the complexity cost is high — and most teams should not use them."

### Demo sequence
1. **[0:30-2:30] What micro-frontends are** — Independent deployable frontend modules composed at runtime.
2. **[2:30-5:00] Integration patterns** — Module federation, iframes, web components. Trade-offs of each.
3. **[5:00-7:00] SvelteKit as a shell** — Using SvelteKit as the host application that loads micro-frontend modules.
4. **[7:00-8:30] Build the mini-build** — Architecture diagram with decision tree: monolith vs micro-frontend.
5. **[8:30-9:30] Edge case / gotcha** — "Micro-frontends are for organizational scaling (many teams), not technical scaling. If you have one team, a monolith is simpler and faster."

### Key moments
- 0:30 — "Independent team deployment"
- 2:30 — "Integration patterns"
- 5:00 — "SvelteKit as shell"
- 7:00 — "Decision tree"
- 8:30 — "Organizational, not technical"

### Callout graphics
- Micro-frontend architecture
- Integration pattern comparison
- Decision tree: mono vs micro

### Outro (30 seconds)
"Micro-frontends solve organizational scaling. Next lesson: custom preprocessors."

---

## Lesson 18.6 — Custom preprocessors

**Duration:** 10 minutes
**Screen setup:** Editor with preprocessor code, showing transformation

### Hook (30 seconds)
"Svelte preprocessors transform your source code before compilation. TypeScript is a preprocessor. PostCSS is a preprocessor. You can write your own: transform markup, inject styles, generate code — anything that runs at build time."

### Demo sequence
1. **[0:30-2:30] How preprocessors work** — Source code → preprocessor → transformed code → Svelte compiler.
2. **[2:30-5:00] Building one** — A preprocessor that auto-imports common utilities. Show the markup and script transforms.
3. **[5:00-7:00] Style preprocessors** — Transform CSS: add vendor prefixes, inject variables.
4. **[7:00-8:30] Build the mini-build** — Preprocessor that adds debug borders in development mode.
5. **[8:30-9:30] Edge case / gotcha** — "Preprocessors run at build time, not runtime. They cannot access runtime data. And they run before type checking, so TypeScript cannot validate preprocessor output."

### Key moments
- 0:30 — "Build-time code transformation"
- 2:30 — "Auto-import preprocessor"
- 5:00 — "Style transforms"
- 7:00 — "Debug borders"
- 8:30 — "Build-time only"

### Callout graphics
- Preprocessor pipeline
- Transform hooks
- Build-time vs runtime

### Outro (30 seconds)
"Preprocessors transform code before compilation. Next lesson: Vite plugins for build-time data."

---

## Lesson 18.7 — Build-time data with Vite plugins

**Duration:** 10 minutes
**Screen setup:** Editor with Vite plugin, browser showing generated data

### Hook (30 seconds)
"Your app needs a list of all blog posts. At runtime, you query a database. At build time, you can read Markdown files, parse frontmatter, and inject the post list as a virtual module. Zero runtime cost. Zero database needed. Build-time data generation."

### Demo sequence
1. **[0:30-2:30] Virtual modules recap** — Vite plugins can provide modules that do not exist as files.
2. **[2:30-5:00] Reading files at build time** — Scan a directory, read Markdown frontmatter, generate a JSON module.
3. **[5:00-7:00] Import in components** — Import the virtual module. TypeScript declarations for type safety.
4. **[7:00-8:30] Build the mini-build** — Blog index generated at build time from Markdown files.
5. **[8:30-9:30] Edge case / gotcha** — "Build-time data is static. Changes require a rebuild. Use this for content that changes with deployments, not user data."

### Key moments
- 0:30 — "Data without a database"
- 2:30 — "File scanning at build time"
- 5:00 — "Virtual module import"
- 7:00 — "Blog index"
- 8:30 — "Static, needs rebuild"

### Callout graphics
- Build-time data pipeline
- Virtual module flow
- Static vs dynamic data

### Outro (30 seconds)
"Build-time data eliminates runtime costs for static content. Next lesson: advanced TypeScript patterns."

---

## Lesson 18.8 — Advanced TypeScript patterns

**Duration:** 11 minutes
**Screen setup:** Editor with TypeScript code, type hover information

### Hook (30 seconds)
"Generics, conditional types, mapped types, template literal types. These TypeScript features let you build component APIs where the types adapt to the data — autocomplete that knows your column names, event handlers typed to your event map."

### Demo sequence
1. **[0:30-2:30] Generic components** — A `<List>` component generic over the item type. Show autocomplete adapting.
2. **[2:30-5:00] Discriminated unions** — Props that change shape based on a type field. Show TypeScript narrowing.
3. **[5:00-7:30] Template literal types** — Event handler types from a union: `on${Capitalize<Event>}`.
4. **[7:30-9:30] Build the mini-build** — Type-safe form builder where field types infer validation rules.
5. **[9:30-10:30] Edge case / gotcha** — "Advanced types improve DX but increase complexity. If your team spends more time reading type definitions than component code, you have over-typed."

### Key moments
- 0:30 — "Types that adapt"
- 2:30 — "Discriminated unions"
- 5:00 — "Template literal types"
- 7:30 — "Form builder types"
- 9:30 — "Over-typing"

### Callout graphics
- Generic component type flow
- Discriminated union narrowing
- Template literal type generation

### Outro (30 seconds)
"Advanced TypeScript creates adaptive component APIs. Next lesson: performance profiling."

---

## Lesson 18.9 — Performance profiling

**Duration:** 11 minutes
**Screen setup:** Browser DevTools Performance panel, editor for optimization

### Hook (30 seconds)
"Your app feels slow. Where? The Performance panel shows you exactly: which functions take the longest, which render cycles are excessive, which memory allocations pile up. Profiling turns 'feels slow' into 'this function takes 47ms.'"

### Demo sequence
1. **[0:30-2:30] Recording a profile** — Start recording in Performance panel. Interact with the app. Stop and analyze.
2. **[2:30-5:00] Reading the flame chart** — Identify long tasks, layout thrashing, excessive paints.
3. **[5:00-7:30] Memory profiling** — Heap snapshots. Finding memory leaks. Detached DOM nodes.
4. **[7:30-9:30] Build the mini-build** — Profile a slow list rendering, identify the bottleneck, fix it, show the improvement.
5. **[9:30-10:30] Edge case / gotcha** — "Profile in production builds, not development. Dev mode adds overhead that skews results."

### Key moments
- 0:30 — "'Feels slow' to 'takes 47ms'"
- 2:30 — "Flame chart reading"
- 5:00 — "Memory leaks"
- 7:30 — "Profile and fix"
- 9:30 — "Production builds only"

### Callout graphics
- Performance panel anatomy
- Flame chart reading guide
- Memory leak detection flow

### Outro (30 seconds)
"Profiling turns intuition into data. Last lesson: monorepo architecture."

---

## Lesson 18.10 — Monorepo architecture

**Duration:** 11 minutes
**Screen setup:** Editor showing monorepo structure, terminal with workspace commands

### Hook (30 seconds)
"Your organization has a design system, three apps, and shared utilities. Separate repos mean version drift, duplicate dependencies, and painful cross-repo changes. A monorepo puts everything in one repository with shared tooling, atomic commits, and coordinated releases."

### Demo sequence
1. **[0:30-2:30] What a monorepo is** — Single repo, multiple packages, shared tooling. Not a monolith.
2. **[2:30-5:00] pnpm workspaces** — Configure pnpm-workspace.yaml. Share dependencies. Cross-package imports.
3. **[5:00-7:30] Turborepo** — Task orchestration, caching, parallel builds. Show build time improvements.
4. **[7:30-9:30] Build the mini-build** — Monorepo with a design system package and a SvelteKit app that imports it.
5. **[9:30-10:30] Edge case / gotcha** — "Monorepos increase CI complexity. Without build caching (Turborepo), every PR rebuilds everything. Configure caching from day one."

### Key moments
- 0:30 — "One repo, many packages"
- 2:30 — "pnpm workspaces"
- 5:00 — "Turborepo caching"
- 7:30 — "DS + app monorepo"
- 9:30 — "CI caching"

### Callout graphics
- Monorepo structure
- Dependency graph
- Build caching flow

### Outro (30 seconds)
"Monorepos unify your codebase. Module 18 is complete — you have advanced patterns for building complex applications."

---
