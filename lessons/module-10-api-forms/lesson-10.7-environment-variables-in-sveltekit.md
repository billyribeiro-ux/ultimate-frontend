---
module: 10
lesson: 10.7
title: Environment variables in SvelteKit
duration: 45 minutes
prerequisites:
  - Lesson 10.1 — `+server.ts`
learning_objectives:
  - Distinguish the four `$env` modules: `$env/static/private`, `$env/static/public`, `$env/dynamic/private`, `$env/dynamic/public`
  - Add variables to `.env` files safely and know which prefix makes them public
  - Use a private env var inside an action without leaking it to the browser
  - Use `%sveltekit.version%` in `app.html` for cache-busting
  - Recognise the security implications of each `$env` flavour
status: ready
---

# Lesson 10.7 — Environment variables in SvelteKit

## 1. Concept — Secrets belong on the server; knobs can go anywhere

### 1.1 The four $env modules

SvelteKit gives you exactly four places to read environment variables from. Each has a purpose:

| Module                   | When                     | Can the browser see it? |
| ------------------------ | ------------------------ | ----------------------- |
| `$env/static/private`    | Build-time, server-only  | No                      |
| `$env/static/public`     | Build-time, public       | Yes (only `PUBLIC_*`)   |
| `$env/dynamic/private`   | Run-time, server-only    | No                      |
| `$env/dynamic/public`    | Run-time, public         | Yes (only `PUBLIC_*`)   |

**Static** vs **dynamic** is about *when* the value is read. Static values are inlined into the build output — they change only when you rebuild. Dynamic values are read from `process.env` at runtime — they change on restart without a rebuild.

**Private** vs **public** is about *where* the value can be read. Private modules throw a build error if you import them into any file that ends up in the client bundle. Public modules can be imported from anywhere but only expose variables whose name starts with `PUBLIC_`.

The combination gives you sensible defaults:

- Database URL, API keys, third-party secrets → `$env/static/private` or `$env/dynamic/private`.
- Feature flags, analytics IDs, public endpoint URLs → `$env/static/public` or `$env/dynamic/public`.

### 1.2 The `.env` file

Create a `.env` file at the project root. SvelteKit reads it via Vite:

```bash
# .env
DATABASE_URL="postgres://localhost/notes"
PUBLIC_SITE_NAME="Ultimate Frontend"
```

- `DATABASE_URL` is available at `$env/static/private` (build-time) or `$env/dynamic/private` (runtime). It **cannot** be imported into a client file.
- `PUBLIC_SITE_NAME` is available via `$env/static/public` or `$env/dynamic/public`. It **can** be imported from a `.svelte` file — but only because its name starts with `PUBLIC_`.

Never commit `.env` to Git. The project has `.env` in `.gitignore` by default.

### 1.3 Using a private env var in an action

```ts
// +page.server.ts
import { WEBHOOK_SECRET } from '$env/static/private';
import { error, type Actions } from '@sveltejs/kit';

export const actions: Actions = {
    default: async ({ request }) => {
        const sig = request.headers.get('x-signature');
        if (sig !== WEBHOOK_SECRET) error(401, 'Bad signature');
        // ... handle the request
    }
};
```

If you accidentally import `WEBHOOK_SECRET` into a `.svelte` file or a `+page.ts`, the build **fails**. This is the guard rail that prevents the classic "oh no, I leaked our Stripe key" accident.

### 1.4 Static vs dynamic — when to pick which

Prefer **static** — it is faster (value is inlined), it makes build-time errors visible, and it lets the bundler dead-code-eliminate branches based on the value. Use **dynamic** only when:

- You deploy the same build to multiple environments and need to change values without rebuilding (common for Docker-based deployments).
- The value is set by your hosting platform at runtime and is not available at build time.

### 1.5 `%sveltekit.version%` and `app.html`

SvelteKit also exposes a small set of template placeholders for `src/app.html`:

- `%sveltekit.version%` — a content hash that changes on every build.
- `%sveltekit.body%` — where the app mounts.
- `%sveltekit.head%` — where head tags injected by components go.
- `%sveltekit.nonce%` — a Content Security Policy nonce.

`%sveltekit.version%` is useful for cache-busting a static asset referenced directly in `app.html`, such as a favicon or an analytics script URL.

### 1.6 What SvelteKit does under the hood

SvelteKit's environment variable system is built on top of Vite's `import.meta.env` but with important additions:

**Build-time static variables (`$env/static/private` and `$env/static/public`):**

1. During `pnpm build`, Vite reads `.env`, `.env.local`, `.env.production`, etc. (following Vite's standard env file resolution).
2. Variables are injected as string constants via `define` in the Vite config. This means the actual value is inlined into the compiled JavaScript at build time.
3. For `$env/static/private`, the build system enforces a **server-only boundary**. If any file that ends up in the client bundle tries to import from this module, the build fails with a clear error. The enforcement works by checking the module graph: if a `.svelte` file, a `+page.ts`, or any module imported by client code tries to resolve `$env/static/private`, the plugin throws.
4. For `$env/static/public`, variables must start with `PUBLIC_`. The build system only exposes variables with this prefix. Other variables are silently excluded.

**Run-time dynamic variables (`$env/dynamic/private` and `$env/dynamic/public`):**

1. These are read from `process.env` at request time, not at build time. The values are not inlined.
2. The same server-only / public split applies: `$env/dynamic/private` is server-only, `$env/dynamic/public` only exposes `PUBLIC_*` variables.
3. Dynamic variables update without rebuilding — restart the server with new env vars and the code reads the new values.

### 1.7 The TypeScript angle

SvelteKit generates type declarations for your environment variables. When `svelte-kit sync` runs, it reads `.env` and generates types in `.svelte-kit/types/$env/`:

```ts
// Auto-generated: .svelte-kit/types/$env/static/private.d.ts
declare module '$env/static/private' {
    export const DATABASE_URL: string;
    export const WEBHOOK_SECRET: string;
}
```

This means you get autocomplete and type checking for your env variables. If you typo `DATABSE_URL`, TypeScript catches it. If you access a variable that does not exist in `.env`, you get a compile error.

After adding a new variable to `.env`, run `pnpm svelte-kit sync` (or restart `pnpm dev`) to regenerate the types.

### 1.8 Comparison: SvelteKit env vs other frameworks

| Aspect | SvelteKit `$env` | Next.js `process.env` | Vite `import.meta.env` |
| --- | --- | --- | --- |
| Server/client boundary | Enforced at build time | `NEXT_PUBLIC_` convention (not enforced) | `VITE_` prefix (convention) |
| Build error on leak | Yes (`$env/static/private`) | No (silent leak) | No (silent leak) |
| Static vs dynamic | Four distinct modules | `process.env` (always dynamic) | `import.meta.env` (static) |
| Type generation | Automatic from `.env` | Via `next-env.d.ts` | Via `vite-env.d.ts` |
| Tree-shaking | Yes (unused vars eliminated) | Partial | Yes |

SvelteKit's approach is the most secure of the three because the build fails if you try to use a private variable in client code. Next.js relies on naming conventions that developers can accidentally violate.

> **In production sidebar.** A team we consulted for had a Next.js app where a developer accidentally used `process.env.STRIPE_SECRET_KEY` in a client component. The key was exposed in the client bundle for three weeks before someone noticed. SvelteKit's `$env/static/private` build-time enforcement would have caught this on the first build. The lesson: convention-based security (naming prefixes) is weaker than enforcement-based security (build errors). Always prefer the system that makes the wrong thing impossible, not just unlikely.

### 1.9 Common interview question

**Q: "How does SvelteKit prevent you from accidentally leaking a secret environment variable to the browser?"**

**Model answer:** SvelteKit provides four `$env` modules, split along two axes: static/dynamic and private/public. Private modules (`$env/static/private` and `$env/dynamic/private`) are enforced as server-only at build time. If any file that ends up in the client bundle imports from a private module, the build fails with a clear error. This is enforced by SvelteKit's Vite plugin, which traces the module graph and checks that private env imports only appear in server-only files (`+page.server.ts`, `+server.ts`, `hooks.server.ts`, `.remote.ts`). Public modules only expose variables whose names start with `PUBLIC_` — other variables are silently excluded. The combination of build-time enforcement and naming conventions makes accidental secret leaks nearly impossible.

## Deep Dive

**Environment file priority.** Vite reads `.env` files in a specific order, with later files overriding earlier ones:
1. `.env` — always loaded
2. `.env.local` — always loaded, gitignored by convention
3. `.env.[mode]` — only when running in that mode (e.g., `.env.development`, `.env.production`)
4. `.env.[mode].local` — only when running in that mode, gitignored

For SvelteKit, `mode` is `development` during `pnpm dev` and `production` during `pnpm build`.

**The `env()` function (adapter-specific).** Some adapters (like `adapter-node`) provide a runtime `env()` function for reading variables that are set by the hosting platform at deploy time and are not available during build:

```ts
import { env } from '$env/dynamic/private';
const dbUrl = env.DATABASE_URL; // read at runtime, not build time
```

This is essential for Docker deployments where one image serves multiple environments.

## Going Deeper

- **SvelteKit docs:** [Modules — $env](https://svelte.dev/docs/kit/$env-static-private) covers all four modules.
- **Advanced pattern:** Create a `config.server.ts` module that imports all private env vars and exports a typed, validated configuration object. Validate with Valibot at startup to fail fast if a required variable is missing.
- **Challenge:** Create a `.env` with both `SECRET_KEY=abc` and `PUBLIC_SITE_NAME=MySite`. Try importing `SECRET_KEY` from `$env/static/public`. What happens? (Answer: it is not there — only `PUBLIC_*` variables are exposed by the public modules. You need `$env/static/private`.)

## 2. Style it — An environment info panel

Per-page brand is a pale gold. The mini-build reads one public and one private variable (safely, through a load function for the private one) and displays them in a table, with a warning icon next to the private value indicating "this came from the server, not the bundle".

## 3. Interact — See the build guard rails

Try to import `$env/static/private` directly from a `+page.svelte` file. Save. Observe the Vite error in the terminal: "Cannot import $env/static/private into client-side code". Delete the import. The error disappears. Move the same variable into a `+page.server.ts` `load()` and return it via `data`. It works.

## 4. Mini-build — Display site name + a private flag (via load)

### File tree

```
src/routes/modules/10-api-forms/07-env-vars/
├── +page.svelte       (renders the values)
└── +page.server.ts    (reads private env in load, exposes a redacted summary)
```

**Note to students**: this mini-build reads from fake env variables that the repo sets for teaching. In a real project you would add them to your own `.env`.

### DevTools moment

1. View the page. Open the Network response for the HTML. The public value is inlined in the page markup. The private value is only visible via a server-rendered label — you cannot find the raw value in the client bundle.
2. Search the built JS files (after `pnpm build`) for the private value. It is not there. Search for the public value. It is there.

## 5. Check your understanding

<details>
<summary><strong>Q1.</strong> Which <code>$env</code> module should you use for a database URL?</summary>

`$env/static/private` (preferred) or `$env/dynamic/private` if you need runtime flexibility. Never a public module.
</details>

<details>
<summary><strong>Q2.</strong> What prefix must public variables have?</summary>

`PUBLIC_`. Variables without that prefix are not exposed by the public modules.
</details>

<details>
<summary><strong>Q3.</strong> What happens if you import <code>$env/static/private</code> into a <code>.svelte</code> file?</summary>

The build fails with a clear error. This is a guard rail that prevents accidental leakage to the browser.
</details>

<details>
<summary><strong>Q4.</strong> When should you prefer dynamic over static?</summary>

When the value must change between deployments without rebuilding — typically in containerised deployments where the same image runs in multiple environments.
</details>

<details>
<summary><strong>Q5.</strong> What does <code>%sveltekit.version%</code> expand to?</summary>

A content hash representing the current build. It is useful in `app.html` for cache-busting external assets tied to the app version.
</details>

## 6. Common mistakes

- **Committing <code>.env</code>.** Double-check it is in <code>.gitignore</code>. Use <code>.env.example</code> as a documented template without real values.
- **Using a <code>PUBLIC_</code> prefix for a secret.** Anything with that prefix is exposed in the bundle. The prefix is consent.
- **Importing <code>$env/static/private</code> in a <code>+page.ts</code>.** <code>.ts</code> (not <code>.server.ts</code>) files run on both client and server, so the import is refused.
- **Mixing static and dynamic for the same variable.** Pick one per variable and use it consistently.

## 7. What's next

Lesson 10.8 closes the module with file uploads through classic form actions — the old-fashioned way that still works for simple cases, with a signpost back to the streaming remote form pattern from 9B.6.
