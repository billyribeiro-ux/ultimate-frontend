---
module: 21
lesson: 21.4
title: The plugin system
duration: 55 minutes
prerequisites:
  - "21.1 — What Vite actually does"
  - "21.2 — vite.config.ts in depth"
  - "TypeScript interfaces and function types"
learning_objectives:
  - Describe the Vite Plugin interface and the role of each core hook
  - Trace a file through the resolveId, load, and transform pipeline
  - Read and understand an existing plugin like vite-plugin-svelte
  - Write a minimal virtual module plugin that exposes build metadata
  - Register a custom plugin in vite.config.ts and import its virtual module
status: ready
---

# Lesson 21.4 — The plugin system

> **Atomic lesson format** — every lesson in this course follows the same four parts: **Concept**, **Style it**, **Interact**, **Mini-build**.

## 1. Concept — Teaching Vite new tricks

### 1.1 The problem: Vite does not know about your custom needs

Vite knows how to serve JavaScript, TypeScript, CSS, JSON, and static assets. The Svelte plugin teaches it how to handle `.svelte` files. But what if you need something that no existing plugin provides? Maybe you want to inject build metadata (git hash, timestamp) into your app. Maybe you want to generate a virtual module that lists all routes. Maybe you want to transform Markdown files into Svelte components.

Plugins are how you extend Vite. They are not mysterious black boxes — they are plain JavaScript objects with named methods. Learning to read and write plugins is the difference between being limited by what others have built and being able to build exactly what you need.

### 1.2 The Plugin interface

A Vite plugin is an object with a `name` property (a string identifier) and one or more **hook methods**. Each hook corresponds to a phase in Vite's processing pipeline:

```typescript
interface Plugin {
    name: string;
    resolveId?(source: string, importer: string | undefined): string | null;
    load?(id: string): string | null;
    transform?(code: string, id: string): string | null;
    configureServer?(server: ViteDevServer): void;
    config?(config: UserConfig, env: { mode: string; command: string }): UserConfig | null;
    buildStart?(): void;
    buildEnd?(): void;
}
```

The hooks run in a specific order:

1. **`config`** — modify the Vite config before it is finalized. This is how `sveltekit()` adds its aliases and server middleware.
2. **`configureServer`** — access the dev server instance to add custom middleware or WebSocket handlers.
3. **`buildStart`** — runs once when the build starts (or when the dev server starts).
4. **`resolveId`** — given an import specifier (like `'virtual:build-info'`), return a resolved ID (a file path or a virtual marker). Return `null` to pass the resolution to the next plugin.
5. **`load`** — given a resolved ID, return the file contents as a string. Return `null` to let Vite read the file from disk. This is how virtual modules work — they have no file on disk, so the plugin provides the content.
6. **`transform`** — given the loaded source code and its ID, return transformed source code. The Svelte plugin uses this hook to compile `.svelte` files into JavaScript.
7. **`buildEnd`** — runs once when the build finishes.

### 1.3 Virtual modules — files that do not exist

A **virtual module** is a module that has no corresponding file on disk. You import it like any other module (`import data from 'virtual:build-info'`), but the plugin creates its contents on the fly. This is useful for injecting build-time data, generated code, or computed values.

The convention is to prefix virtual module IDs with `virtual:` and to prepend a `\0` marker to the resolved ID (this tells other plugins and Vite itself to skip filesystem operations for this module):

```typescript
function buildInfoPlugin(): Plugin {
    const virtualModuleId: string = 'virtual:build-info';
    const resolvedVirtualModuleId: string = '\0' + virtualModuleId;

    return {
        name: 'build-info',

        resolveId(id: string): string | undefined {
            if (id === virtualModuleId) {
                return resolvedVirtualModuleId;
            }
        },

        load(id: string): string | undefined {
            if (id === resolvedVirtualModuleId) {
                return `export const buildTime = ${JSON.stringify(new Date().toISOString())};
export const commitHash = ${JSON.stringify('abc123')};`;
            }
        }
    };
}
```

When any file in your project writes `import { buildTime } from 'virtual:build-info'`, Vite calls `resolveId` with `'virtual:build-info'`, the plugin returns the resolved ID, then Vite calls `load` with that resolved ID, and the plugin returns the module source code.

### 1.4 Reading an existing plugin: vite-plugin-svelte

Understanding how `@sveltejs/vite-plugin-svelte` works demystifies the entire Svelte compilation process:

1. **`resolveId`**: intercepts imports from `svelte` and `svelte/*` to ensure they resolve to the correct package locations.
2. **`load`**: for certain internal modules (like the HMR runtime), provides virtual module content.
3. **`transform`**: this is the main hook. When a `.svelte` file is loaded, the plugin runs `svelte.compile()` on the source code, producing JavaScript and CSS. It also injects HMR acceptance code so Svelte components can be hot-replaced without a full page reload.
4. **`configureServer`**: adds dev-time middleware for Svelte Inspector (the "click to open source" overlay) and configures the HMR handler for `.svelte` files.

The key insight: everything Svelte does — compiling templates, scoping CSS, generating reactive updates — is a `transform` hook. The compiler runs inside a Vite plugin hook, not in the browser. This is why Svelte is a "compile-time framework."

### 1.5 Writing a real plugin: virtual:build-info

Let us build a practical plugin that exposes build metadata to your application. The plugin will provide a virtual module exporting the git commit hash, build timestamp, Node.js version, and whether the build is a development or production build:

```typescript
import { execSync } from 'child_process';
import type { Plugin } from 'vite';

export function buildInfoPlugin(): Plugin {
    const virtualModuleId: string = 'virtual:build-info';
    const resolvedId: string = '\0' + virtualModuleId;

    return {
        name: 'vite-plugin-build-info',

        resolveId(id: string): string | undefined {
            if (id === virtualModuleId) {
                return resolvedId;
            }
        },

        load(id: string): string | undefined {
            if (id === resolvedId) {
                let gitHash: string = 'unknown';
                try {
                    gitHash = execSync('git rev-parse --short HEAD')
                        .toString()
                        .trim();
                } catch {
                    // Not a git repo or git not available
                }

                const buildTime: string = new Date().toISOString();
                const nodeVersion: string = process.version;

                return [
                    `export const gitHash = ${JSON.stringify(gitHash)};`,
                    `export const buildTime = ${JSON.stringify(buildTime)};`,
                    `export const nodeVersion = ${JSON.stringify(nodeVersion)};`
                ].join('\n');
            }
        }
    };
}
```

Register it in `vite.config.ts`:

```typescript
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import { buildInfoPlugin } from './src/lib/plugins/build-info';

export default defineConfig({
    plugins: [sveltekit(), buildInfoPlugin()]
});
```

Now any component can import from it:

```svelte
<script lang="ts">
    import { gitHash, buildTime } from 'virtual:build-info';
</script>

<footer>Build {gitHash} at {buildTime}</footer>
```

### 1.6 TypeScript declarations for virtual modules

TypeScript does not know about your virtual module. You need a type declaration file:

```typescript
// src/virtual-build-info.d.ts
declare module 'virtual:build-info' {
    export const gitHash: string;
    export const buildTime: string;
    export const nodeVersion: string;
}
```

This file tells TypeScript the shape of the virtual module, enabling autocomplete and type checking for imports.

### 1.7 Plugin execution order

Plugins run in the order they appear in the `plugins` array, but with an important nuance: Vite categorizes plugins into three phases using an optional `enforce` property:

- `enforce: 'pre'` — runs before Vite's core plugins
- No `enforce` — runs in normal order (default)
- `enforce: 'post'` — runs after Vite's core plugins

Within each phase, plugins run in array order. For most custom plugins, the default (no `enforce`) is correct. You would use `enforce: 'pre'` if your plugin needs to resolve imports before Vite's built-in resolver, or `enforce: 'post'` if it needs to transform output after all other plugins.

### 1.8 "In production" — a plugin that saved deployment debugging

A fintech company deployed a SvelteKit application to multiple environments (staging, canary, production). When bugs were reported, it was difficult to determine which build was running in each environment. They wrote a `virtual:build-info` plugin that exposed the git hash, branch name, build timestamp, and CI pipeline ID. A `<BuildFooter />` component displayed this information to internal users. When a bug report came in, support could immediately ask "What build hash do you see in the footer?" and correlate it to a specific commit. This eliminated hours of "which version is deployed where?" debugging per week.

### 1.9 The TypeScript angle

Plugin hooks are fully typed in Vite's TypeScript definitions. When you write a plugin factory function, annotate its return type as `Plugin` (imported from `vite`) to get full IntelliSense for hook names and parameter types:

```typescript
import type { Plugin, ViteDevServer } from 'vite';

function myPlugin(): Plugin {
    return {
        name: 'my-plugin',
        configureServer(server: ViteDevServer): void {
            // TypeScript knows the full shape of 'server'
        }
    };
}
```

The `resolveId` and `load` hooks can return `string | null | undefined`. Returning `null` or `undefined` means "I do not handle this" and passes control to the next plugin. Returning a string means "I handle this" and stops the chain (for `resolveId`) or provides the content (for `load`).

### 1.10 Common interview question

**Q: "Describe how a Vite plugin works and walk through the lifecycle of a virtual module from import to execution."**

**Model answer:** A Vite plugin is an object with a `name` and hook methods. For a virtual module, three hooks are involved. First, when the bundler encounters an import like `import { x } from 'virtual:my-module'`, it calls `resolveId` on each plugin. The plugin that handles this ID returns a resolved path (conventionally prefixed with `\0` to signal it is virtual). Second, the bundler calls `load` with the resolved ID. The plugin returns a string of JavaScript source code — this is the "file content" for the virtual module. Third, if any other plugin has a `transform` hook that matches the ID, it can further modify the source. The module then enters the module graph like any other import. In development, if the virtual module's source changes (e.g., a new git hash after a commit), the plugin can use `server.moduleGraph.invalidateModule()` to trigger HMR updates.

## Deep Dive

**The full hook lifecycle.** Beyond the core hooks (`resolveId`, `load`, `transform`), Vite plugins have access to build-phase hooks inherited from Rollup: `options` (modify build options), `buildStart`, `buildEnd`, `closeBundle` (runs after the bundle is written to disk), `renderChunk` (modify individual chunks before they are written), and `generateBundle` (access the complete bundle object). For dev-specific behavior, `configureServer` provides access to the Vite dev server, letting you add Express-style middleware, listen for WebSocket events, or access the module graph.

**How vite-plugin-svelte handles HMR.** When the Svelte plugin compiles a component, it appends HMR acceptance code to the output. This code uses `import.meta.hot.accept()` to register the component as an HMR boundary. When the component file changes, Vite's HMR system sends the updated module to the browser. The acceptance code receives the new module, creates a new component class from it, and replaces the old one — preserving the component's `$state` values and DOM position. This is why editing a counter component does not reset the count: the state lives in the reactive system, not in the component class.

**Plugin composition patterns.** Complex plugins often split into multiple sub-plugins by returning an array from the factory function. Each sub-plugin handles a specific concern: one for resolving, one for transforming, one for dev-server middleware. Vite flattens arrays in the `plugins` option, so returning `[pluginA, pluginB]` from a factory is equivalent to listing them separately. The `sveltekit()` factory uses this pattern — it returns an array containing the Svelte plugin, the SvelteKit routing plugin, and several dev-time helpers.

**Hot-updating virtual modules.** Virtual modules are tricky with HMR because they have no file on disk to watch. To update a virtual module (e.g., regenerating build metadata after a git commit), your plugin can use `configureServer` to access the dev server and manually invalidate the virtual module:

```typescript
configureServer(server: ViteDevServer): void {
    // Watch for git changes and invalidate the virtual module
    const mod = server.moduleGraph.getModuleById(resolvedId);
    if (mod) {
        server.moduleGraph.invalidateModule(mod);
        server.ws.send({ type: 'full-reload' });
    }
}
```

**Connection to other lessons.** This lesson's `virtual:build-info` plugin is used in the module project's `<BuildFooter />` component. Lesson 21.5 explains how HMR boundaries (set up by plugins) enable state-preserving updates. Lesson 21.6 shows how to analyze the build output that the plugin pipeline produces.

## Going Deeper

**Official docs to read next:**

- [vite.dev/guide/api-plugin](https://vite.dev/guide/api-plugin) — the complete Vite plugin API reference.
- [rolldown.rs/guide/plugin](https://rolldown.rs/) — Rolldown's plugin documentation (compatible with Vite plugins).
- [github.com/sveltejs/vite-plugin-svelte](https://github.com/sveltejs/vite-plugin-svelte) — the Svelte plugin source code; reading the `transform` hook is illuminating.

**Advanced pattern: conditional virtual module content.** You can make a virtual module return different content in dev vs production by checking `this.meta.watchMode` (true in dev) inside the `load` hook, or by using the `configResolved` hook to capture the resolved mode:

```typescript
let resolvedMode: string;

return {
    name: 'conditional-plugin',
    configResolved(config) {
        resolvedMode = config.mode;
    },
    load(id: string) {
        if (id === resolvedId) {
            const isDev = resolvedMode === 'development';
            return `export const debug = ${isDev};`;
        }
    }
};
```

**Challenge question (combines Lesson 21.4 + Lesson 21.1 + Lesson 21.2):** Design a plugin that creates a `virtual:route-manifest` module exporting an array of all SvelteKit routes (path, has load function, has server load, has actions). The plugin should scan `src/routes` at build time and regenerate on file changes in dev mode. Describe which hooks you would use and why.

## 2. Style it — PE7 applied to the build-info footer

The mini-build shows the build-info plugin working live. The footer component uses `var(--color-surface-2)` background with `var(--radius-lg)`. The git hash is styled with monospace font at `var(--text-xs)`. The build timestamp uses `var(--color-text-muted)`. A subtle top border uses `var(--color-border)`.

## 3. Interact — seeing the plugin lifecycle in action

The problem: the plugin hook pipeline is abstract until you see data flowing through it.

```typescript
interface PluginHookCall {
    hook: string;
    input: string;
    output: string;
    timestamp: number;
}
```

The interactive element simulates a file import flowing through the plugin pipeline. Students type an import path, and the page shows which hooks fire, what each receives, and what each returns. This makes the abstract pipeline concrete.

## 4. Mini-build — Build-info plugin live demo

**File:** `src/routes/modules/21-vite-vitest/04-plugin-system/+page.svelte`

This page simulates a Vite plugin lifecycle, showing how a virtual module import flows through `resolveId`, `load`, and `transform` hooks. It also displays simulated build metadata (commit hash, build time) in a footer component pattern.

### Run it

```bash
pnpm dev
```

Then open `http://localhost:5173/modules/21-vite-vitest/04-plugin-system`.

### Prove the concept

1. Look at the footer area. It shows a simulated git hash, build timestamp, and Node version.
2. In a real project, these values would come from the `virtual:build-info` plugin described in this lesson.
3. Open DevTools and search for the git hash in the source — in a real build, it would be inlined as a string literal, not computed at runtime.

## 5. Check your understanding

<details>
<summary><strong>Q1.</strong> What are the three core hooks needed to implement a virtual module?</summary>

`resolveId` (maps the virtual module ID to a resolved ID, conventionally prefixed with `\0`), `load` (returns the module's source code as a string), and optionally `transform` (modifies the source after loading). Most virtual modules only need `resolveId` and `load`.
</details>

<details>
<summary><strong>Q2.</strong> Why do virtual module resolved IDs conventionally start with \0?</summary>

The `\0` prefix is a convention that tells Vite (and other plugins) that this module has no corresponding file on disk. Vite skips filesystem operations (stat, read) for modules with this prefix, and other plugins know not to try to resolve it as a file path.
</details>

<details>
<summary><strong>Q3.</strong> In what order do the core plugin hooks execute for a normal file import?</summary>

`resolveId` runs first to convert the import specifier into a file path. Then `load` runs to read the file contents (or return virtual content). Then `transform` runs to modify the source code (e.g., compiling Svelte, stripping TypeScript). Each hook runs through all plugins in order before moving to the next hook.
</details>

<details>
<summary><strong>Q4.</strong> How does vite-plugin-svelte use the transform hook?</summary>

When a `.svelte` file is loaded, the plugin's `transform` hook receives the raw Svelte source code. It runs `svelte.compile()` on it, producing JavaScript and CSS output. It also injects HMR acceptance code so the component can be hot-replaced without a full page reload. The transformed JavaScript is what the browser actually executes.
</details>

<details>
<summary><strong>Q5.</strong> What does the enforce property do on a plugin?</summary>

`enforce` controls when the plugin runs relative to Vite's core plugins. `enforce: 'pre'` runs before core plugins (useful for resolving imports before Vite's resolver). `enforce: 'post'` runs after core plugins (useful for transforming output after Vite's built-in transforms). The default (no `enforce`) runs in normal order with other user plugins.
</details>

## 6. Common mistakes

- **Forgetting the \0 prefix on virtual module resolved IDs.** Without it, Vite tries to read the module from the filesystem, fails, and throws a confusing "file not found" error. Always prefix resolved virtual IDs with `\0`.
- **Not creating a TypeScript declaration file for virtual modules.** TypeScript will error on `import { x } from 'virtual:build-info'` unless you create a `.d.ts` file declaring the module's exports. This is a one-time setup that is easy to forget.
- **Running synchronous shell commands in transform hooks.** The `transform` hook runs for every file, so synchronous operations like `execSync('git rev-parse HEAD')` would block the dev server on every file change. Put expensive operations in `buildStart` or `load` (which runs only once per module) instead.
- **Modifying the module graph without invalidation.** If your plugin's virtual module should change when source files change, you must manually invalidate the module in the dev server's module graph. Otherwise, the browser will cache the old version until a full page reload.

## 7. What's next

Lesson 21.5 dives deep into HMR — the WebSocket protocol that makes Svelte's instant-update development experience possible, and why some changes preserve component state while others trigger a full reload.
