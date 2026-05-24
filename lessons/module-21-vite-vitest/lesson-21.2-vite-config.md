---
module: 21
lesson: 21.2
title: vite.config.ts in depth
duration: 50 minutes
prerequisites:
  - "21.1 — What Vite actually does"
  - "1.4 — TypeScript type annotations on variables"
  - "8.1 — What SvelteKit adds to Svelte"
learning_objectives:
  - Read and modify vite.config.ts with confidence, knowing what each option controls
  - Configure server.proxy to route API requests during development
  - Set build.target and build.rolldownOptions for production output control
  - Use optimizeDeps to control dependency pre-bundling behavior
  - Apply environment-specific configuration using the mode parameter
status: ready
---

# Lesson 21.2 — vite.config.ts in depth

> **Atomic lesson format** — every lesson in this course follows the same four parts: **Concept**, **Style it**, **Interact**, **Mini-build**.

## 1. Concept — The single file that controls everything Vite does

### 1.1 The problem: your tooling is a black box

You have been using `vite.config.ts` since Lesson 1.2. SvelteKit generated it for you with a single line — `plugins: [sveltekit()]` — and it worked. But "it works" is not the same as "I understand it." The moment you need to proxy API requests during development, change the output target for older browsers, or add a new plugin, the black box becomes a wall. This lesson opens that box.

`vite.config.ts` is the single configuration file that controls everything Vite does — in development, in production, and in testing. It is a TypeScript file (not JSON, not YAML) because it exports a function or an object, and that function can compute configuration dynamically based on the environment, the platform, and any logic you need.

### 1.2 The shape of the config file

Every `vite.config.ts` exports a default value. That value can be a plain object or a function that returns an object. The function form receives `{ mode, command }` — where `mode` is the Vite mode (`'development'`, `'production'`, or a custom string) and `command` is either `'serve'` (for `pnpm dev`) or `'build'` (for `pnpm build`).

```typescript
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig(({ mode, command }) => {
    return {
        plugins: [sveltekit()],
        // ... other options
    };
});
```

The `defineConfig` wrapper is optional — it provides TypeScript autocompletion and type-checking for the config object. Without it, the types still work, but your editor's IntelliSense is less helpful.

### 1.3 plugins — the most important option

The `plugins` array determines which transformations Vite applies to your files. In a SvelteKit project, `sveltekit()` is always the first (and often the only) plugin. It internally registers the Svelte compiler plugin, the SvelteKit routing plugin, and various dev-time helpers.

You can add additional plugins after `sveltekit()`. Each plugin is an object (or a function that returns an object) with a `name` property and one or more hook methods. Plugins run in array order for most hooks, so order matters when two plugins transform the same file type.

```typescript
plugins: [
    sveltekit(),
    myCustomPlugin(),      // runs after SvelteKit
    anotherPlugin({ opt: true })
]
```

### 1.4 server — controlling the dev experience

The `server` section controls the Vite development server:

- **`server.port`** — the port number (default 5173). If the port is taken, Vite picks the next available one unless you set `server.strictPort: true`.
- **`server.host`** — set to `'0.0.0.0'` or `true` to expose the dev server on your local network, useful for testing on a phone.
- **`server.proxy`** — routes specific URL paths to a different server during development. This is essential when your SvelteKit app talks to a separate API server.

```typescript
server: {
    port: 5173,
    host: true,
    proxy: {
        '/api/external': {
            target: 'http://localhost:8080',
            changeOrigin: true,
            rewrite: (path: string) => path.replace(/^\/api\/external/, '')
        }
    }
}
```

The proxy only applies in dev mode. In production, you configure your deployment platform (Nginx, Cloudflare, Vercel) to handle routing.

### 1.5 resolve.alias — making imports cleaner

SvelteKit already configures `$lib` as an alias for `src/lib`. If you need additional aliases, you define them in `resolve.alias`:

```typescript
resolve: {
    alias: {
        '$components': '/src/lib/components',
        '$utils': '/src/lib/utils'
    }
}
```

Note: in SvelteKit projects, prefer using `$lib` subpaths (`$lib/components/Card.svelte`) over custom aliases. Custom aliases require additional TypeScript path configuration in `tsconfig.json`, while `$lib` works out of the box.

### 1.6 build — controlling the production output

The `build` section controls how Vite produces the production bundle:

- **`build.target`** — the browser compatibility target. Defaults to `'esnext'` (latest ES features). Set to `'es2020'` or a browserslist query to support older browsers. Vite uses esbuild to downlevel syntax.
- **`build.rolldownOptions`** — passes options directly to Rolldown (the production bundler). Use this for advanced output control like manual chunk splitting, external dependencies, and output format.
- **`build.chunkSizeWarningLimit`** — the threshold (in kB) at which Vite warns about oversized chunks. Default is 500 kB.
- **`build.sourcemap`** — `true` generates source maps for debugging production issues. Use `'hidden'` to generate maps but not reference them in the output (for error tracking services like Sentry).

```typescript
build: {
    target: 'es2020',
    sourcemap: 'hidden',
    chunkSizeWarningLimit: 600,
    rolldownOptions: {
        output: {
            manualChunks: {
                vendor: ['svelte', 'svelte/transition']
            }
        }
    }
}
```

### 1.7 optimizeDeps — controlling pre-bundling

The `optimizeDeps` section controls which dependencies Vite pre-bundles with esbuild:

- **`optimizeDeps.include`** — force-include dependencies that Vite's scanner missed. Use this when a dependency uses dynamic `require()` or conditional imports that the static scanner cannot detect.
- **`optimizeDeps.exclude`** — prevent a dependency from being pre-bundled. Use this for dependencies that must remain as individual ESM files (rare, but some packages break when pre-bundled).

```typescript
optimizeDeps: {
    include: ['lodash-es', 'date-fns'],
    exclude: ['@sveltejs/kit']
}
```

### 1.8 css — preprocessor and module configuration

The `css` section controls how Vite handles stylesheets:

- **`css.preprocessorOptions`** — passes options to CSS preprocessors (Sass, Less, Stylus). If you use Sass for PE7 token generation, this is where you inject shared variables.
- **`css.modules`** — controls CSS Modules behavior (class name generation, scoping). Svelte's built-in scoping makes CSS Modules unnecessary in `.svelte` files, but they are useful in plain `.module.css` files.

```typescript
css: {
    preprocessorOptions: {
        scss: {
            additionalData: '@use "src/styles/tokens" as *;'
        }
    }
}
```

### 1.9 define — compile-time constants

The `define` option replaces global identifiers with constant values at compile time. This is how you inject values that should be inlined into the output, not loaded at runtime:

```typescript
define: {
    __APP_VERSION__: JSON.stringify('2.1.0'),
    __BUILD_DATE__: JSON.stringify(new Date().toISOString())
}
```

Every occurrence of `__APP_VERSION__` in your source code is replaced with `'2.1.0'` during compilation. This enables dead-code elimination: `if (__DEV__)` branches can be removed entirely in production builds.

### 1.10 Environment-specific config with mode

The function form of `defineConfig` receives the current `mode`, letting you apply different settings for different environments:

```typescript
export default defineConfig(({ mode }) => {
    const isProd: boolean = mode === 'production';
    return {
        plugins: [sveltekit()],
        build: {
            sourcemap: isProd ? 'hidden' : true
        }
    };
});
```

Custom modes work too: `pnpm build -- --mode staging` sets `mode` to `'staging'`, letting you load `.env.staging` and apply staging-specific config.

### 1.11 "In production" — when config knowledge saved a deploy

A team deployed a SvelteKit app to a corporate intranet where users ran Internet Explorer 11 compatibility mode in Edge. The app crashed on load because Vite's default `build.target` of `'esnext'` emitted optional chaining (`?.`) and nullish coalescing (`??`), which the compatibility mode did not support. The fix was one line: `build: { target: 'es2018' }`. Without understanding `vite.config.ts`, the team would have spent hours debugging a syntax error in minified production code. The lesson: your config file is not boilerplate — it is the contract between your source code and the browsers that will run it.

### 1.12 The TypeScript angle

`vite.config.ts` is itself a TypeScript file, and Vite provides the `UserConfig` type for full IntelliSense. The `defineConfig` helper is a passthrough function that exists solely for type inference:

```typescript
import type { UserConfig } from 'vite';

const config: UserConfig = {
    plugins: [],
    // TypeScript will autocomplete every option here
};
```

When writing conditional config (the function form), TypeScript infers the return type from `defineConfig`, so you get autocomplete inside the returned object without any extra type annotations.

### 1.13 Common interview question

**Q: "Walk me through the key sections of a vite.config.ts file and explain when you would need to modify each one."**

**Model answer:** A `vite.config.ts` has several key sections. `plugins` registers build transforms — in SvelteKit you always have `sveltekit()` and may add custom plugins. `server` controls the dev server — I modify `server.port` to avoid collisions and `server.proxy` to route API requests to a backend during development. `build` controls production output — I set `build.target` for browser compatibility, `build.sourcemap` for error tracking, and `build.rolldownOptions` for chunk splitting. `optimizeDeps` controls dependency pre-bundling — I use `optimizeDeps.include` when a dependency is not auto-detected by Vite's scanner. `resolve.alias` creates import shortcuts. `define` injects compile-time constants. `css.preprocessorOptions` passes options to Sass or other preprocessors. The function form of the config receives `mode` and `command`, letting me apply different settings for dev, staging, and production.

## Deep Dive

**The full lifecycle of config resolution.** When Vite starts, it resolves `vite.config.ts` through several steps. First, it uses esbuild to transpile the TypeScript config file into JavaScript (this is why your config can use TypeScript without any additional setup). Then it evaluates the config, calling the function form with `{ mode, command }` if applicable. Next, it merges the config with any inline config from the CLI (e.g., `--port 3000` overrides `server.port`). Finally, each plugin's `config` hook runs, allowing plugins to modify the config before Vite uses it. This is how `sveltekit()` adds its own `resolve.alias` entries — it does not require you to set them manually.

**server.proxy deep dive.** The proxy is powered by `http-proxy`, a battle-tested Node.js library. When a request matches a proxy rule, Vite forwards it to the target server, rewrites the path if configured, and passes the response back to the browser. The `changeOrigin` option rewrites the `Host` header to match the target, which is necessary when the target server uses virtual hosts. The `rewrite` function transforms the URL path before forwarding. You can also configure `secure: false` to allow proxying to HTTPS servers with self-signed certificates (common in corporate environments).

**build.rolldownOptions vs build.rollupOptions.** Vite 8 supports both keys during the transition period. `build.rollupOptions` is the legacy key that passes options to Rollup. `build.rolldownOptions` is the new key that passes options to Rolldown. When both are present, `build.rolldownOptions` takes precedence. The option schemas are nearly identical because Rolldown deliberately mirrors Rollup's API. The most commonly used sub-options are `output.manualChunks` (for controlling code splitting), `external` (for marking dependencies as external), and `output.entryFileNames` / `output.chunkFileNames` (for controlling output file naming).

**Config validation and debugging.** If your config has a typo or an invalid value, Vite logs a warning but often continues with defaults. To debug config issues, run `pnpm vite --debug config` — Vite will log the resolved config object after all merging and plugin modifications. This is the single most useful debugging command for config problems.

**Performance implications of config choices.** `build.target` affects both bundle size and compatibility. Setting it to `'es2015'` generates larger output because modern syntax (like arrow functions and template literals) is downleveled to older equivalents. Setting it to `'esnext'` produces the smallest output but excludes older browsers. For most SvelteKit apps targeting modern browsers, `'es2020'` is the sweet spot — it supports optional chaining and BigInt while excluding truly legacy browsers. The `optimizeDeps.include` array can dramatically affect cold start time: if Vite's scanner misses a dependency, it discovers it at request time and has to re-run pre-bundling, causing a visible delay and sometimes a page reload.

## Going Deeper

**Official docs to read next:**

- [vite.dev/config](https://vite.dev/config/) — the complete configuration reference with every option documented.
- [vite.dev/config/server-options](https://vite.dev/config/server-options) — server options in detail, including WebSocket, HTTPS, and CORS configuration.
- [vite.dev/config/build-options](https://vite.dev/config/build-options) — build options including Rolldown integration.

**Advanced pattern: conditional plugins.** You can conditionally include plugins based on mode:

```typescript
export default defineConfig(({ mode }) => ({
    plugins: [
        sveltekit(),
        mode === 'development' && myDevOnlyPlugin()
    ].filter(Boolean)
}));
```

This pattern uses the short-circuit `&&` operator — if the condition is false, the expression evaluates to `false`, and `.filter(Boolean)` removes it from the array.

**Challenge question (combines Lesson 21.2 + Lesson 21.3 + Lesson 21.4):** You are building a SvelteKit app that talks to three different API servers during development (auth, content, analytics). Each server runs on a different port. In production, all three are behind a single reverse proxy at `/api`. Write the `server.proxy` configuration that routes requests correctly in development while requiring zero code changes for production.

## 2. Style it — PE7 applied to the config explorer

The mini-build is a config explorer page. Each config section is a card with `var(--color-surface-2)` background, `var(--radius-lg)` corners, and `var(--shadow-sm)` shadow. The active section highlights with a `var(--color-brand)` left border. Code examples use `var(--text-sm)` with monospace font on `var(--color-surface)` background. The layout uses a sidebar navigation on desktop (`min-width: 768px`) and a vertical accordion on mobile.

## 3. Interact — exploring config options interactively

The problem: there are dozens of config options and remembering what each one does is impractical without a reference.

```typescript
interface ConfigOption {
    key: string;
    section: string;
    description: string;
    example: string;
    defaultValue: string;
}
```

The interactive element is a searchable config explorer. Students type a config key or keyword, and the matching options appear with their descriptions, default values, and code examples. Selecting an option shows a detailed explanation.

## 4. Mini-build — Config explorer page

**File:** `src/routes/modules/21-vite-vitest/02-vite-config/+page.svelte`

This page renders a searchable reference of Vite config options relevant to SvelteKit. Each option shows its key path, description, default value, and a code snippet. Students can filter by section (server, build, plugins, etc.) and search by keyword.

### Run it

```bash
pnpm dev
```

Then open `http://localhost:5173/modules/21-vite-vitest/02-vite-config`.

### Prove the concept

1. Open your project's actual `vite.config.ts` file.
2. Compare its contents with the config explorer. Every option in your file should appear in the explorer with an explanation.
3. Try adding `server: { port: 3000 }` to your config, restart `pnpm dev`, and confirm the server starts on port 3000.
4. Revert the change — the mini-build is the reference, your actual config should stay minimal.

## 5. Check your understanding

<details>
<summary><strong>Q1.</strong> What is the difference between the object form and the function form of vite.config.ts?</summary>

The object form exports a static configuration that is the same regardless of environment. The function form receives `{ mode, command }` as parameters, letting you compute different configurations for development vs production, or for custom modes like staging. The function form is necessary when you need conditional plugins, different proxy targets per environment, or mode-dependent build settings.
</details>

<details>
<summary><strong>Q2.</strong> When would you use server.proxy and why does it only work in development?</summary>

You use `server.proxy` when your SvelteKit app needs to talk to a separate API server during development. It routes matching requests to the target server, avoiding CORS issues. It only works in development because it is part of the Vite dev server — in production, there is no Vite server. You configure your deployment platform (Nginx, Vercel, Cloudflare) to handle API routing in production.
</details>

<details>
<summary><strong>Q3.</strong> What does optimizeDeps.include do and when would you use it?</summary>

`optimizeDeps.include` forces Vite to pre-bundle specific dependencies with esbuild, even if Vite's static scanner did not detect them. You use it when a dependency uses dynamic `require()` or conditional imports that the scanner cannot detect statically, causing Vite to discover the dependency at request time and trigger a slow re-optimization.
</details>

<details>
<summary><strong>Q4.</strong> What is the practical difference between build.target 'esnext' and 'es2020'?</summary>

`'esnext'` emits the latest JavaScript syntax with no downleveling, producing the smallest bundles but requiring the latest browsers. `'es2020'` downlevels newer syntax (like top-level await and class static blocks) to ES2020 equivalents, producing slightly larger bundles but supporting a wider range of browsers. For most production apps, `'es2020'` offers a good balance of size and compatibility.
</details>

<details>
<summary><strong>Q5.</strong> Why should you avoid adding both svelte() and sveltekit() to the plugins array?</summary>

`sveltekit()` internally registers the Svelte plugin (`@sveltejs/vite-plugin-svelte`). Adding `svelte()` separately causes the Svelte compiler to run twice on every `.svelte` file, producing duplicate transforms, confusing error messages, and broken HMR. In a SvelteKit project, always use only `sveltekit()`.
</details>

## 6. Common mistakes

- **Editing vite.config.ts without restarting the dev server.** Unlike source files, changes to `vite.config.ts` require restarting `pnpm dev`. Vite does not hot-reload its own config. If your changes do not take effect, check that you restarted.
- **Using build.rollupOptions when Rolldown is the bundler.** In Vite 8, Rolldown is the default production bundler. While `build.rollupOptions` still works during the transition, prefer `build.rolldownOptions` to avoid confusion and ensure forward compatibility.
- **Setting server.proxy paths that conflict with SvelteKit routes.** If you proxy `/api` but also have a SvelteKit route at `src/routes/api/+server.ts`, the proxy takes precedence in dev mode but the SvelteKit route wins in production. This causes dev/prod behavior differences. Avoid overlapping paths.

## 7. What's next

Lesson 21.3 explores environment variables — `.env` files, modes, and the critical security boundary between server-side and client-side variables in SvelteKit.
