# Module 21 — Vite & Vitest Internals: Video Lecture Script Outlines

> **Recording note:** Set editor font to 18px minimum. Split-screen: editor (left), terminal or browser (right). Show Vite's terminal output for config and build topics.

---

## Lesson 21.1 — What Vite does

**Duration:** 10 minutes
**Screen setup:** Slides for architecture, terminal showing Vite startup

### Hook (30 seconds)
"You run `pnpm dev` and your app starts in 300 milliseconds. You save a file and the change appears instantly. Vite makes this possible with native ES modules in development and Rollup-based bundling for production. This lesson opens the hood."

### Demo sequence
1. **[0:30-2:30] The dev server** — Vite serves files as native ES modules. No bundling in development. Show the raw module requests.
2. **[2:30-5:00] Pre-bundling** — Vite pre-bundles node_modules with esbuild. Show the .vite directory. Explain why.
3. **[5:00-7:00] Production build** — Rollup bundles, tree-shakes, and minifies for production. Show the build output.
4. **[7:00-8:30] Build the mini-build** — Diagram showing dev flow vs build flow side by side.
5. **[8:30-9:30] Edge case / gotcha** — "Dev and production use different tools (esbuild vs Rollup). Rarely, code works in dev but breaks in the build. Always test production builds."

### Key moments
- 0:30 — "300ms startup"
- 2:30 — "Pre-bundling with esbuild"
- 5:00 — "Rollup production build"
- 7:00 — "Dev vs build flow"
- 8:30 — "Dev/prod differences"

### Callout graphics
- Dev server architecture
- Pre-bundling pipeline
- Dev vs production comparison

### Outro (30 seconds)
"Vite uses native modules for speed and Rollup for optimization. Next lesson: configuring Vite."

---

## Lesson 21.2 — Vite config

**Duration:** 10 minutes
**Screen setup:** Editor with vite.config.ts, terminal showing config effects

### Hook (30 seconds)
"vite.config.ts is your build tool's control panel. Plugins, aliases, server options, build targets, CSS processing — all configured in one typed file. SvelteKit extends this with its own plugin, but you can add your own configuration on top."

### Demo sequence
1. **[0:30-2:30] Config file anatomy** — defineConfig, plugins, resolve.alias, server options. Show the structure.
2. **[2:30-5:00] Common options** — CSS preprocessors, build targets, proxy configuration for API development.
3. **[5:00-7:00] SvelteKit integration** — How SvelteKit's Vite plugin works alongside your custom config.
4. **[7:00-8:30] Build the mini-build** — Custom config with CSS module support, development proxy, and custom alias.
5. **[8:30-9:30] Edge case / gotcha** — "SvelteKit manages certain Vite settings (entry points, SSR config). Do not override them — it breaks the build. Check SvelteKit docs for which settings are managed."

### Key moments
- 0:30 — "The control panel"
- 2:30 — "Common options"
- 5:00 — "SvelteKit integration"
- 7:00 — "Custom config"
- 8:30 — "Managed settings"

### Callout graphics
- Config file sections
- Common options reference
- SvelteKit managed settings

### Outro (30 seconds)
"vite.config.ts controls your build pipeline. Next lesson: environment variables."

---

## Lesson 21.3 — Environment variables

**Duration:** 11 minutes
**Screen setup:** Editor with .env files and env imports, browser showing variables

### Hook (30 seconds)
"VITE_ prefix. PUBLIC_ prefix. import.meta.env. $env/static/private. Four ways to access environment variables, each with different security implications. This lesson maps the entire landscape so you never accidentally ship a secret to the client."

### Demo sequence
1. **[0:30-2:30] .env files** — .env, .env.local, .env.development, .env.production. Loading order.
2. **[2:30-5:00] Vite's import.meta.env** — VITE_ prefix exposes to client. MODE, DEV, PROD, SSR built-in variables.
3. **[5:00-7:30] SvelteKit's $env modules** — $env/static/private, $env/static/public. Build-time enforcement.
4. **[7:30-9:30] Build the mini-build** — Environment audit: show which variables are exposed where.
5. **[9:30-10:30] Edge case / gotcha** — "Dynamic env variables ($env/dynamic/*) are read at request time, not build time. Use them when your deployment platform sets variables at runtime (Cloudflare Workers, Docker)."

### Key moments
- 0:30 — "Four access patterns"
- 2:30 — "Vite's import.meta.env"
- 5:00 — "SvelteKit's $env modules"
- 7:30 — "Environment audit"
- 9:30 — "Dynamic vs static"

### Callout graphics
- .env file precedence
- Variable exposure matrix
- Static vs dynamic env

### Outro (30 seconds)
"Understand the env landscape to keep secrets safe. Next lesson: the Vite plugin system."

---

## Lesson 21.4 — Plugin system

**Duration:** 11 minutes
**Screen setup:** Editor with custom plugin, terminal showing plugin output

### Hook (30 seconds)
"Vite's power comes from plugins. The Svelte plugin transforms .svelte files. PostCSS plugin processes styles. You can write your own: transform code, provide virtual modules, hook into the build lifecycle. Plugins are the extension point."

### Demo sequence
1. **[0:30-2:30] Plugin anatomy** — A plugin is an object with hooks: resolveId, load, transform, buildStart, buildEnd.
2. **[2:30-5:00] Virtual modules** — Create a plugin that provides `virtual:app-version`. Show resolveId + load pattern.
3. **[5:00-7:30] Transform hook** — Transform source code during compilation. Add logging, inject analytics, modify imports.
4. **[7:30-9:30] Build the mini-build** — Plugin that injects a build banner comment into every JS file.
5. **[9:30-10:30] Edge case / gotcha** — "Plugin order matters. Plugins run in array order. Vite pre-plugins run before Vite's core transforms, post-plugins run after. Use the `enforce` field."

### Key moments
- 0:30 — "Extensibility through plugins"
- 2:30 — "Virtual modules"
- 5:00 — "Transform hook"
- 7:30 — "Build banner plugin"
- 9:30 — "Plugin order"

### Callout graphics
- Plugin hook lifecycle
- Virtual module pattern
- Plugin order with enforce

### Outro (30 seconds)
"The plugin system makes Vite infinitely extensible. Next lesson: HMR and the dev experience."

---

## Lesson 21.5 — HMR & dev experience

**Duration:** 11 minutes
**Screen setup:** Editor with HMR examples, browser showing instant updates

### Hook (30 seconds)
"You change a CSS color. The page updates in 50ms — no reload, no state loss. Hot Module Replacement is the feature that makes development feel instant. But HMR has rules about propagation, boundaries, and state preservation."

### Demo sequence
1. **[0:30-2:30] How HMR works** — File change → Vite notifies browser via WebSocket → module replaced → UI updates.
2. **[2:30-5:00] Svelte HMR boundaries** — Each .svelte file is a boundary. Edit a component → only that component updates.
3. **[5:00-7:30] Non-boundary modules** — Edit a .ts utility → HMR propagates up to the nearest Svelte boundary.
4. **[7:30-9:30] Build the mini-build** — Visualize HMR propagation: edit files and see which components update.
5. **[9:30-10:30] Edge case / gotcha** — "State in $state is preserved during HMR. But if you change the initial value of $state, the existing state is not reset — you might see stale state during development."

### Key moments
- 0:30 — "50ms updates"
- 2:30 — "Svelte boundaries"
- 5:00 — "Propagation through .ts files"
- 7:30 — "HMR visualizer"
- 9:30 — "Stale state during dev"

### Callout graphics
- HMR pipeline
- Boundary propagation diagram
- State preservation behavior

### Outro (30 seconds)
"HMR makes development instant. Next lesson: build analysis."

---

## Lesson 21.6 — Build analysis

**Duration:** 10 minutes
**Screen setup:** Terminal with build output, browser showing bundle visualizer

### Hook (30 seconds)
"Your production build is 2MB. Where is the weight? Is it a huge dependency? Unshaken dead code? Duplicate modules? Build analysis tools give you a treemap of every byte — so you know exactly what to cut."

### Demo sequence
1. **[0:30-2:30] Build output** — Run `pnpm build`. Read the chunk sizes in the terminal. Identify the largest chunks.
2. **[2:30-5:00] Bundle visualizer** — Use rollup-plugin-visualizer. Show the treemap. Identify heavy dependencies.
3. **[5:00-7:00] Optimization** — Remove unused dependencies, use dynamic imports for heavy modules, check tree-shaking.
4. **[7:00-8:30] Build the mini-build** — Analyze a project, find a heavy dependency, lazy-load it, compare before/after.
5. **[8:30-9:30] Edge case / gotcha** — "Source maps increase build size but are not shipped to users. Do not count them in your bundle budget."

### Key moments
- 0:30 — "Where is the weight?"
- 2:30 — "Treemap visualization"
- 5:00 — "Optimization strategies"
- 7:00 — "Before/after comparison"
- 8:30 — "Source maps are not shipped"

### Callout graphics
- Bundle treemap example
- Optimization checklist
- Before/after comparison

### Outro (30 seconds)
"Build analysis reveals optimization opportunities. Next lesson: Vitest fundamentals."

---

## Lesson 21.7 — Vitest fundamentals

**Duration:** 11 minutes
**Screen setup:** Editor with test file, terminal with Vitest output

### Hook (30 seconds)
"Vitest is Vite's testing framework. Same config, same transforms, same speed. Tests run in milliseconds because Vitest reuses Vite's module resolution. If you know Jest, you know 90% of Vitest — but faster."

### Demo sequence
1. **[0:30-2:30] describe, it, expect** — The testing vocabulary. Show a simple test file.
2. **[2:30-5:00] Assertions** — toBe, toEqual, toContain, toThrow, toHaveLength. Show common assertion patterns.
3. **[5:00-7:30] Setup and teardown** — beforeEach, afterEach, beforeAll, afterAll. Test isolation.
4. **[7:30-9:30] Build the mini-build** — Test suite for a string utility library: capitalize, slugify, truncate.
5. **[9:30-10:30] Edge case / gotcha** — "Vitest runs tests in parallel by default. Shared mutable state between test files will cause flaky tests. Keep test files independent."

### Key moments
- 0:30 — "Jest, but faster"
- 2:30 — "Assertion patterns"
- 5:00 — "Setup and teardown"
- 7:30 — "String utility tests"
- 9:30 — "Parallel test isolation"

### Callout graphics
- Vitest vs Jest comparison
- Assertion reference
- Test lifecycle hooks

### Outro (30 seconds)
"Vitest provides fast, Vite-integrated testing. Next lesson: mocking and spying."

---

## Lesson 21.8 — Mocking & spying

**Duration:** 11 minutes
**Screen setup:** Editor with mock setup, terminal showing test results

### Hook (30 seconds)
"Your function calls a database. Your test should not. vi.mock() replaces the database module with a fake. vi.fn() creates a spy that tracks calls. Mocking isolates the code under test from its dependencies."

### Demo sequence
1. **[0:30-2:30] vi.fn()** — Create a mock function. Track calls, arguments, return values.
2. **[2:30-5:00] vi.mock()** — Mock an entire module. Replace exports with controlled implementations.
3. **[5:00-7:30] Spy on real implementations** — vi.spyOn() wraps a real function to track calls without changing behavior.
4. **[7:30-9:30] Build the mini-build** — Test a user service that calls a database module. Mock the database, test the service logic.
5. **[9:30-10:30] Edge case / gotcha** — "vi.mock() is hoisted to the top of the file. You cannot use variables defined below it in the mock factory. Use vi.hoisted() or define mock values before vi.mock()."

### Key moments
- 0:30 — "Isolate from dependencies"
- 2:30 — "Module-level mocking"
- 5:00 — "Spying on real code"
- 7:30 — "User service tests"
- 9:30 — "Mock hoisting"

### Callout graphics
- Mock vs spy comparison
- vi.mock() hoisting diagram
- Mock factory pattern

### Outro (30 seconds)
"Mocking isolates your tests from external dependencies. Next lesson: snapshot testing."

---

## Lesson 21.9 — Snapshot testing

**Duration:** 10 minutes
**Screen setup:** Editor with snapshot tests, terminal showing updates

### Hook (30 seconds)
"toMatchSnapshot() serializes a value and compares it to a stored snapshot file. If the output changes, the test fails. You review the diff, decide if it is intentional, and update or fix. Snapshots catch unintended changes in serialized output."

### Demo sequence
1. **[0:30-2:30] toMatchSnapshot** — First run creates the snapshot file. Second run compares. Show a passing snapshot.
2. **[2:30-5:00] toMatchInlineSnapshot** — Snapshot stored directly in the test file. Best for small outputs. Show inline snapshots.
3. **[5:00-7:00] Updating snapshots** — `--update` flag. Review the diff before updating. When to update vs when to fix.
4. **[7:00-8:30] Build the mini-build** — Snapshot tests for a configuration parser: known-good output for various inputs.
5. **[8:30-9:30] Edge case / gotcha** — "Snapshots are not tests — they are change detectors. If developers update snapshots without reading the diff, the safety net has holes. Code review must include snapshot review."

### Key moments
- 0:30 — "Serialized change detection"
- 2:30 — "Inline snapshots"
- 5:00 — "Update workflow"
- 7:00 — "Config parser snapshots"
- 8:30 — "Review, don't rubber-stamp"

### Callout graphics
- Snapshot workflow
- Inline vs file snapshots
- Review process diagram

### Outro (30 seconds)
"Snapshots catch unintended changes. Last lesson: the Svelte playground."

---

## Lesson 21.10 — Svelte playground

**Duration:** 10 minutes
**Screen setup:** Browser with Svelte REPL, editor with integration code

### Hook (30 seconds)
"The Svelte Playground lets you write, compile, and run Svelte components in the browser — no setup needed. It is perfect for prototyping, sharing bugs, and teaching. This lesson shows you how to use it and how to embed it in your own projects."

### Demo sequence
1. **[0:30-2:30] The playground** — Open svelte.dev/playground. Write a component. See it compile and run.
2. **[2:30-5:00] Sharing** — Share URLs for bug reports, examples, and teaching. Show how the URL encodes the code.
3. **[5:00-7:00] Compiled output** — Switch to the JS output tab. See what the Svelte compiler produces from your code.
4. **[7:00-8:30] Build the mini-build** — Create a shareable playground example demonstrating $state, $derived, and $effect.
5. **[8:30-9:30] Edge case / gotcha** — "The playground uses the latest Svelte version. If your project uses an older version, the playground code might not work in your project."

### Key moments
- 0:30 — "Browser-based Svelte"
- 2:30 — "Shareable URLs"
- 5:00 — "Compiler output inspection"
- 7:00 — "Runes playground example"
- 8:30 — "Version mismatch"

### Callout graphics
- Playground interface anatomy
- URL encoding of code
- Compiler output tabs

### Outro (30 seconds)
"The Svelte playground is your sandbox for experimentation. Module 21 is complete — you understand Vite and Vitest from configuration to testing to debugging."

---
