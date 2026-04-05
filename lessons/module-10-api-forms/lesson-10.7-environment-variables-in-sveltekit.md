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
