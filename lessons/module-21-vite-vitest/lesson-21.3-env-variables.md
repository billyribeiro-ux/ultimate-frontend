---
module: 21
lesson: 21.3
title: Environment variables and modes
duration: 50 minutes
prerequisites:
  - "21.2 — vite.config.ts in depth"
  - "10.7 — Environment variables in SvelteKit"
learning_objectives:
  - Explain the .env file loading order and precedence rules
  - Distinguish between VITE_* client-exposed variables and private server-only variables
  - Use all four SvelteKit env modules correctly and know when each applies
  - Configure custom modes for staging, testing, and preview environments
  - Identify which variables leak to the client bundle and prevent accidental exposure of secrets
status: ready
---

# Lesson 21.3 — Environment variables and modes

> **Atomic lesson format** — every lesson in this course follows the same four parts: **Concept**, **Style it**, **Interact**, **Mini-build**.

## 1. Concept — The invisible lines between public and private

### 1.1 The problem: secrets that accidentally become public

A developer stores a database password in `VITE_DB_PASSWORD` and imports it in a component. The app works perfectly in development. Then they deploy. The database password is now in the client-side JavaScript bundle, visible to anyone who opens DevTools. Every user on the planet can read it.

This is not hypothetical. It happens regularly — not because developers are careless, but because the boundary between server-side and client-side variables is invisible unless you understand how the tooling works. Environment variables are one of the most security-critical parts of any web application, and the rules are different depending on whether you are using Vite directly, SvelteKit's env modules, or the HTML template.

### 1.2 How Vite loads .env files

Vite reads `.env` files from your project root when it starts. The loading order (from lowest to highest precedence) is:

1. **`.env`** — always loaded. Shared defaults.
2. **`.env.local`** — always loaded, higher precedence. Personal overrides. Added to `.gitignore` by default.
3. **`.env.[mode]`** — loaded only when the mode matches. Example: `.env.production` loads when `mode === 'production'`.
4. **`.env.[mode].local`** — mode-specific personal overrides. Highest precedence.

The "mode" defaults to `'development'` for `pnpm dev` and `'production'` for `pnpm build`. You can set custom modes with `--mode`: `pnpm build -- --mode staging` loads `.env.staging`.

Each file contains key-value pairs:

```bash
# .env
PUBLIC_APP_NAME=Ultimate Frontend
VITE_API_URL=http://localhost:8080
DATABASE_URL=postgresql://localhost:5432/mydb
```

### 1.3 The VITE_ prefix — the client-side gate

Vite has a hard security boundary: **only variables prefixed with `VITE_` are exposed to client-side code.** Variables without the prefix are available only in server-side code (Node.js).

In client-side code, you access Vite variables through `import.meta.env`:

```typescript
// Available in the browser:
const apiUrl: string = import.meta.env.VITE_API_URL;

// NOT available in the browser (undefined):
const dbUrl: string = import.meta.env.DATABASE_URL; // undefined!
```

Vite performs this filtering at compile time by statically replacing `import.meta.env.VITE_*` references with their string values. Variables without `VITE_` are never injected into the client bundle — they simply do not exist in the output.

### 1.4 SvelteKit's four env modules

SvelteKit adds four dedicated modules that provide a more structured, type-safe way to access environment variables. These are virtual modules — they do not exist as files on disk; SvelteKit generates them at build time.

**`$env/static/private`** — server-only, compile-time. Importing in a client-side file (`+page.svelte`) causes a build error. Values are inlined at build time, enabling dead-code elimination.

```typescript
// Only in +page.server.ts, +server.ts, hooks.server.ts
import { DATABASE_URL } from '$env/static/private';
```

**`$env/static/public`** — client-safe, compile-time. Only variables prefixed with `PUBLIC_` are available. Values are inlined at build time.

```typescript
// In any file, including +page.svelte
import { PUBLIC_APP_NAME } from '$env/static/public';
```

**`$env/dynamic/private`** — server-only, runtime. Values are read at request time, not build time. Use this when variables change between deploys without rebuilding (e.g., platform-injected secrets).

```typescript
// Only in server-side files
import { env } from '$env/dynamic/private';
const dbUrl: string = env.DATABASE_URL;
```

**`$env/dynamic/public`** — client-safe, runtime. Only `PUBLIC_` variables. Values are loaded at runtime.

```typescript
// In any file
import { env } from '$env/dynamic/public';
const appName: string = env.PUBLIC_APP_NAME;
```

### 1.5 Static vs dynamic: when does it matter?

**Static** (`$env/static/*`) inlines values at build time. The variable reference is replaced with a string literal in the output: `const name = "Ultimate Frontend"`. This enables tree-shaking — if an `if` branch checks a static env var that is falsy, the entire branch can be removed from the bundle.

**Dynamic** (`$env/dynamic/*`) reads values at runtime from `process.env` (Node.js) or the platform's equivalent. The value can change between deployments without rebuilding. This is important for platforms like Docker where you build once and deploy to multiple environments with different env vars.

Use static when: the value is known at build time and does not change between deployments. Use dynamic when: the value changes between environments and you deploy the same build artifact to multiple targets.

### 1.6 The PUBLIC_ prefix in SvelteKit

SvelteKit uses `PUBLIC_` (not `VITE_`) as the prefix for client-safe variables. Both prefixes work, but they have different behaviors:

- `VITE_*` — accessible via `import.meta.env.VITE_*` in any file. No type safety.
- `PUBLIC_*` — accessible via `$env/static/public` and `$env/dynamic/public`. Fully typed. Importing in server code generates a warning suggesting `$env/static/private` instead.

Prefer `PUBLIC_` in SvelteKit projects. The `$env` modules provide type safety, clear server/client boundaries, and build-time errors when you accidentally import a server variable on the client.

### 1.7 The app.html template placeholder

SvelteKit's `src/app.html` supports a special placeholder: `%sveltekit.env.PUBLIC_PREFIX%`. This injects public environment variables into the HTML before JavaScript loads, useful for values needed during the initial HTML render (like a theme or locale):

```html
<!-- src/app.html -->
<html lang="%sveltekit.env.PUBLIC_LANG%">
```

The placeholder is replaced at render time with the value of the `PUBLIC_LANG` environment variable. This works for SSR and prerendering.

### 1.8 Security: what leaks and what does not

| Variable | Where it ends up | Safe for secrets? |
|---|---|---|
| `DATABASE_URL` (no prefix) | Server only | Yes |
| `VITE_API_KEY` | Client bundle (inlined) | No |
| `PUBLIC_APP_NAME` | Client bundle (static) or runtime (dynamic) | No |
| `SECRET_KEY` (via `$env/static/private`) | Server only, build error if imported on client | Yes |
| `PUBLIC_ANALYTICS_ID` (via `$env/static/public`) | Client bundle | No |

The rule is simple: **anything the client can see, the world can see.** Never put passwords, API keys with write access, database URLs, or signing secrets in variables that reach the client. If you are unsure, use `$env/static/private` — SvelteKit will throw a build error if you accidentally import it in client code.

### 1.9 "In production" — the env variable that cost a company $50,000

A SaaS startup stored their Stripe secret key in `VITE_STRIPE_KEY` because "it was easier to access in the component." A security researcher found the key in the minified client bundle, reported it through the company's bug bounty program, and received $2,000. The company had to rotate all keys, audit six months of transactions, and notify affected customers. The total cost — engineering time, legal review, and customer communication — exceeded $50,000. The fix was renaming the variable to `STRIPE_SECRET_KEY` (no `VITE_` prefix) and accessing it only in `+page.server.ts` via `$env/static/private`. Five characters prevented a five-figure incident.

### 1.10 The TypeScript angle

SvelteKit auto-generates types for all four `$env` modules. When you add a variable to `.env`, the types in `$env/static/private` and `$env/static/public` update automatically (after restarting the dev server). This means your editor shows autocomplete for environment variable names and flags typos at compile time:

```typescript
import { PUBLIC_APP_NAMEE } from '$env/static/public';
// TypeScript error: Module has no exported member 'PUBLIC_APP_NAMEE'
// Did you mean 'PUBLIC_APP_NAME'?
```

This type safety is one of the strongest reasons to prefer SvelteKit's `$env` modules over raw `import.meta.env`.

### 1.11 Common interview question

**Q: "Explain the difference between $env/static/private and $env/dynamic/private in SvelteKit. When would you use each?"**

**Model answer:** Both provide server-only environment variables that never reach the client bundle. `$env/static/private` inlines values at build time — the variable reference becomes a string literal in the output. This enables tree-shaking but means the value is baked into the build and cannot change without rebuilding. `$env/dynamic/private` reads values at runtime from the platform's environment. The value can change between deployments without rebuilding. I use static for values that are consistent across all environments running the same build (like feature flags decided at CI time). I use dynamic for values that differ between environments sharing the same build artifact (like database URLs in a Docker deployment where the same image runs in staging and production with different env vars).

## Deep Dive

**The .env file parser.** Vite uses the `dotenv` library to parse `.env` files. The parser supports multiline values (wrap in double quotes), variable expansion (`DB_URL=postgres://${DB_HOST}:${DB_PORT}/mydb`), and comments (`# this is a comment`). However, there are edge cases: values with `#` in them must be quoted (`PASSWORD="abc#123"`), and single-quoted values do not expand variables (`KEY='$HOME'` is literal `$HOME`). Variable expansion uses the `dotenv-expand` library and resolves references in order — a variable can reference another variable defined earlier in the same file or in a lower-precedence file.

**Mode-driven configuration patterns.** Teams commonly use three modes: `development` (local dev), `staging` (pre-production testing), and `production` (live). Each has its own `.env.[mode]` file. The CI/CD pipeline passes `--mode staging` or `--mode production` to `pnpm build`. This pattern lets you define different API endpoints, feature flags, and logging levels per environment while keeping the codebase identical. Some teams add a `preview` mode for `pnpm preview`, which serves the production build locally.

**How SvelteKit prevents accidental exposure.** SvelteKit's `$env/static/private` module uses Vite's `resolveId` hook to intercept imports. When the module graph shows that a server-only module is imported by a client-side file (a `+page.svelte` or a file transitively imported by one), SvelteKit throws a build-time error: `Cannot import $env/static/private into client-side code`. This is a hard guarantee — it is not a warning that can be ignored. The enforcement happens at the module graph level, so it catches transitive imports too (importing a utility that imports a private env var).

**Platform-specific env var injection.** Different deployment platforms inject environment variables differently. Vercel, Netlify, and Cloudflare Workers set `process.env` at runtime. Docker passes them via `-e` flags or `.env` files. AWS Lambda uses the Lambda console or SSM Parameter Store. SvelteKit's `$env/dynamic/private` abstracts over all of these — it reads from whatever `process.env` (or the platform adapter's equivalent) provides at request time.

**Connection to other lessons.** Lesson 21.2 showed where env-related options live in `vite.config.ts` (`define`, `envPrefix`). Lesson 10.7 introduced environment variables in the context of API routes. This lesson provides the comprehensive picture of how all the pieces fit together.

## Going Deeper

**Official docs to read next:**

- [vite.dev/guide/env-and-mode](https://vite.dev/guide/env-and-mode) — Vite's environment variable and mode documentation.
- [svelte.dev/docs/kit/$env-static-private](https://svelte.dev/docs/kit/$env-static-private) — SvelteKit's `$env/static/private` module reference.
- [svelte.dev/docs/kit/$env-dynamic-private](https://svelte.dev/docs/kit/$env-dynamic-private) — SvelteKit's `$env/dynamic/private` module reference.

**Advanced pattern: validated env vars.** Use Valibot or Zod to validate environment variables at startup, failing fast with a clear error message if a required variable is missing or has an invalid format:

```typescript
import { object, string, url, parse } from 'valibot';
import { env } from '$env/dynamic/private';

const EnvSchema = object({
    DATABASE_URL: string([url()]),
    REDIS_URL: string([url()])
});

const validatedEnv = parse(EnvSchema, env);
```

**Challenge question (combines Lesson 21.3 + Lesson 21.2 + Lesson 10.7):** Your team deploys the same Docker image to three environments (staging, production, demo). Each environment has different API URLs, feature flags, and analytics keys. Design the `.env` file structure, SvelteKit env module usage, and Vite mode configuration that makes this work with a single build artifact.

## 2. Style it — PE7 applied to the env debugger

The mini-build is an env debugger page. Variable cards use `var(--color-surface-2)` with a left border colored by type: `var(--color-success)` for public (safe), `var(--color-error)` for private (server-only), and `var(--color-warning)` for VITE_ prefixed. The key name uses monospace font at `var(--text-sm)`. The layout stacks vertically on mobile and uses a two-column grid on desktop.

## 3. Interact — visualizing which variables are accessible where

The problem: developers do not have a clear mental model of which env modules work in which files.

```typescript
interface EnvVariable {
    key: string;
    value: string;
    source: string;
    isPublic: boolean;
    accessibleIn: string[];
}
```

The interactive element lets students add variables with different prefixes and see where each variable is accessible — server-only files, client files, or both. Adding a variable without `PUBLIC_` or `VITE_` prefix shows it only in the server column. Adding a `PUBLIC_` variable shows it in both columns.

## 4. Mini-build — Environment variable debugger

**File:** `src/routes/modules/21-vite-vitest/03-env-variables/+page.svelte`

This page shows which environment variables are available in the current context, their prefixes, and which SvelteKit `$env` module provides access to each. It visualizes the boundary between server and client, helping students understand the security implications of variable naming.

### Run it

```bash
pnpm dev
```

Then open `http://localhost:5173/modules/21-vite-vitest/03-env-variables`.

### Prove the concept

1. Create a `.env` file in your project root with `MY_SECRET=hunter2` and `PUBLIC_APP_NAME=TestApp`.
2. Restart `pnpm dev` (env files are loaded at startup).
3. In a `+page.server.ts`, import both from `$env/static/private` and `$env/static/public`. Both work.
4. In `+page.svelte`, try importing from `$env/static/private`. You will get a build error.

## 5. Check your understanding

<details>
<summary><strong>Q1.</strong> In what order does Vite load .env files and which takes precedence?</summary>

From lowest to highest precedence: `.env`, `.env.local`, `.env.[mode]`, `.env.[mode].local`. Higher-precedence files override values from lower-precedence files. `.local` files are for personal overrides and are gitignored by default.
</details>

<details>
<summary><strong>Q2.</strong> Why is storing a database password in a VITE_ variable dangerous?</summary>

Any variable prefixed with `VITE_` is inlined into the client-side JavaScript bundle at compile time. The client bundle is downloaded by every user's browser, so the password becomes publicly visible to anyone who opens DevTools or reads the source. Database passwords must never have the `VITE_` or `PUBLIC_` prefix.
</details>

<details>
<summary><strong>Q3.</strong> What is the difference between $env/static/public and $env/dynamic/public?</summary>

`$env/static/public` inlines variable values at build time — the values are baked into the output and cannot change without rebuilding. `$env/dynamic/public` reads values at runtime from the platform's environment. Static is faster (no runtime lookup) and enables tree-shaking. Dynamic is flexible (values can change per deployment without rebuilding).
</details>

<details>
<summary><strong>Q4.</strong> How does SvelteKit enforce the server/client boundary for $env/static/private?</summary>

SvelteKit intercepts the import at the module graph level during compilation. If a client-side file (like `+page.svelte`) imports `$env/static/private` — directly or transitively through another module — SvelteKit throws a build-time error. This is a hard guarantee, not a warning.
</details>

<details>
<summary><strong>Q5.</strong> When would you use a custom Vite mode like 'staging'?</summary>

When you need a separate set of environment variables for a pre-production environment. Running `pnpm build -- --mode staging` loads `.env.staging` and `.env.staging.local`, letting you configure different API URLs, feature flags, and logging levels for staging without affecting the production or development configurations.
</details>

## 6. Common mistakes

- **Prefixing secrets with VITE_ or PUBLIC_ for convenience.** This is a security vulnerability. Any prefixed variable is exposed to the client. Use unprefixed names for secrets and access them only in server-side files via `$env/static/private` or `$env/dynamic/private`.
- **Forgetting to restart the dev server after editing .env files.** Vite loads `.env` files at startup. Changes require restarting `pnpm dev`. Unlike source file changes, env file changes are not picked up by HMR.
- **Using import.meta.env instead of SvelteKit's $env modules.** `import.meta.env.VITE_*` works but provides no type safety and no server/client enforcement. SvelteKit's `$env` modules provide autocomplete, type checking, and build-time errors for accidental client-side exposure.
- **Committing .env.local to git.** The `.local` suffix indicates personal overrides (developer-specific API keys, local database URLs). These files should be in `.gitignore`. The base `.env` file with non-secret defaults can be committed.

## 7. What's next

Lesson 21.4 opens the hood on the plugin system — you will learn how Vite plugins work and write your own `virtual:build-info` plugin that exposes git hash and build timestamp.
