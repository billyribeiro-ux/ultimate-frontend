---
module: 7
lesson: 7.2
title: Installing GSAP with pnpm and TypeScript types
duration: 20 minutes
prerequisites:
  - Lesson 1.2 (project setup with pnpm)
  - Lesson 7.1 (what GSAP is)
learning_objectives:
  - Install GSAP using pnpm
  - Confirm GSAP's TypeScript types are bundled and available
  - Import GSAP from a Svelte component and see zero type errors
  - Understand why GSAP ships as ESM and CJS and which Vite uses
  - Verify tree-shaking is working by inspecting the Vite bundle
status: ready
---

# Lesson 7.2 — Installing GSAP with pnpm and TypeScript types

## 1. Concept — The cleanest install GSAP has ever had

For most of its history, installing GSAP involved either pasting a CDN script tag or dealing with a confusing npm package that needed type definitions from a separate `@types/gsap` package. Since version 3, GSAP has shipped as a proper ES Module with TypeScript definitions built into the main package. Installation is now one pnpm command and your editor gets full IntelliSense immediately.

### 1.1 The install command

From the repo root:

```bash
pnpm add gsap
```

That is it. `pnpm` records `gsap` in `dependencies` (not `devDependencies`, because it is used in your runtime bundle, not just at build time). The lockfile pins a specific version. A typical May 2026 entry:

```json
"dependencies": {
	"gsap": "^3.14.2"
}
```

### 1.2 Why no `@types/gsap`

The `@types/gsap` package used to exist for older versions where types lived separately. Since GSAP 3, types are bundled in the main package — you can see them in `node_modules/gsap/types/` after install. Installing `@types/gsap` today would either fail or install a stale stub. Do not install it.

### 1.3 Importing GSAP in a Svelte component

```svelte
<script lang="ts">
	import { gsap } from 'gsap';
	// or: import gsap from 'gsap';
</script>
```

Both forms work because the GSAP package exports `gsap` as both a named export and a default export. The named form is preferred in this course because it is explicit and plays better with tree-shaking tools. TypeScript immediately knows the shape of `gsap.to`, `gsap.from`, `gsap.timeline`, etc.

### 1.4 What Vite does with the import

SvelteKit uses Vite under the hood. Vite reads `gsap`'s `package.json` and follows the `"module"` or `"exports"` field, which points to the ESM build. Tree-shaking is then up to Rollup (Vite's production bundler), and anything you do not import is not included in your final bundle. If you only use `gsap.to()` and `gsap.timeline()`, only those bits end up in the build. The ScrollTrigger plugin (Lesson 7.9) is a separate import — `import { ScrollTrigger } from 'gsap/ScrollTrigger'` — which means you pay its bundle cost only on routes that use it.

### 1.5 SSR concerns

GSAP does nothing dangerous at import time. It reads feature flags from `window` when available, but guards against SSR — you can `import { gsap } from 'gsap'` at the top of a `+page.svelte` file and SvelteKit's server-side render will not crash. The animations themselves must only run on the client, which is what the `$effect` rune gives you for free. We cover that in Lesson 7.6. For now, trust that the import is safe.

### 1.6 Verifying the install

Three-step smoke test:

1. `pnpm add gsap`
2. Edit any existing `+page.svelte` and add `import { gsap } from 'gsap';` to the `<script>`. Save.
3. Run `pnpm dev`. The page should load with no errors. Open DevTools → Network → filter "gsap". You will see a gsap chunk on first load (dev server bundles differently from production). Confirm it is there.





### The TypeScript angle

After installing, verify types by hovering over `gsap.to` — the signature should show `(target: TweenTarget, vars: TweenVars): Tween`.

> **In production sidebar.** On a 100K-daily-user e-commerce site, installing `@types/gsap` alongside `gsap` caused type conflicts. Removing it fixed IntelliSense instantly.

### Common interview question

**Q: How do you install GSAP in a SvelteKit project?**

**Model answer:** `pnpm add gsap` — types are bundled since v3. No `@types/gsap` needed. Import with `import { gsap } from "gsap"`. Put it in `dependencies` (not devDependencies). The import is SSR-safe; animations must run inside `$effect`.

## Going Deeper

**Official documentation:**
- [GSAP: Installation](https://gsap.com/docs/v3/Installation)
- [GSAP: TypeScript](https://gsap.com/docs/v3/TypeScript/)
- [Vite: Dependency pre-bundling](https://vite.dev/guide/dep-pre-bundling)

**Advanced pattern:** After installing, open the console and type `gsap.version` to verify. Then check `node_modules/gsap/types/index.d.ts` to see the bundled type definitions.

**Challenge question:** (Combines Lessons 7.2, 7.1, and 1.2) Install GSAP, import it in a page, and display `gsap.version` in the DOM. Verify in DevTools Network tab that the gsap chunk loads. Then import ScrollTrigger from `gsap/ScrollTrigger` and verify it adds a separate chunk.

## Deep Dive

**Why this matters at scale.** Incorrect installation causes duplicate instances, missing types, or SSR crashes. Clean install with TS types ensures type-checked calls and single-instance loading.

**The mental model.** GSAP is client-side. All code runs inside $effect or onMount, never at top level. TypeScript types are bundled since v3.10.

**Edge cases.** Common mistake: importing ScrollTrigger at top level triggers SSR errors. Use dynamic import inside onMount. Vite handles GSAP's ES module tree-shaking.

**Performance implications.** GSAP core is always fully included. Plugins are tree-shakeable. Verify with Vite's bundle analyzer that only used plugins are included.

**Connection to other modules.** Module 6 taught CSS/Svelte animation. This bridges to GSAP. Module 12 revisits bundle impact.

## 2. Style it — A status card with a turquoise brand

The mini-build is a single status card with a turquoise brand (`oklch(72% 0.13 180)`). The card shows "GSAP installed: yes/no", "GSAP version", and "Console log check". The card lifts on hover (CSS transition — still the right tool). The install check runs in `onMount` equivalent (`$effect`) and logs to the browser console.

## 3. Interact — Reading `gsap.version` to prove the import works

The simplest test that GSAP loaded correctly is to read `gsap.version` — a string constant exposed by the library — and display it in the page. If this string appears, the module resolution, the ESM export, and the TypeScript types all worked.

## 4. Mini-build — GSAP install verification card

**File:** `src/routes/modules/07-gsap/02-install/+page.svelte`

The script imports `gsap`, reads `gsap.version` into a `const`, and renders it into a card alongside a big green checkmark. A small `<pre>` block shows the exact import line the student can copy. Below, a note explains how to inspect the `node_modules/gsap/types/` folder to see the bundled types.

### DevTools verification

1. Open DevTools → **Console**. Reload. No errors.
2. Type `gsap.version` in the console — you should see the same version string the card displays.
3. Open **Sources** → find `node_modules/.vite/deps/gsap.js` (or similar Vite dep). That is the pre-bundled ESM version of GSAP that your dev server serves. You have confirmed the install worked.
4. Open `node_modules/gsap/types/index.d.ts` in your editor — those are the TypeScript definitions that gave you IntelliSense on `gsap.to`.

## 5. Check your understanding

<details>
<summary><strong>Q1.</strong> What single command installs GSAP for a SvelteKit project?</summary>

<code>pnpm add gsap</code>. Nothing else is required — types are bundled in the main package since GSAP 3.
</details>

<details>
<summary><strong>Q2.</strong> Why should you not install <code>@types/gsap</code>?</summary>

Types are bundled in the `gsap` package itself. Installing `@types/gsap` either fails or pulls in stale type stubs that conflict with the real ones.
</details>

<details>
<summary><strong>Q3.</strong> Should GSAP be in <code>dependencies</code> or <code>devDependencies</code>?</summary>

<code>dependencies</code>. GSAP ships as part of the runtime bundle and is executed in the browser when your app runs, not only at build time.
</details>

<details>
<summary><strong>Q4.</strong> How do you import GSAP such that Vite can tree-shake it?</summary>

Use the named import: <code>import { gsap } from 'gsap';</code>. Plugins are separate imports like <code>import { ScrollTrigger } from 'gsap/ScrollTrigger';</code> — you only pay for what you import.
</details>

<details>
<summary><strong>Q5.</strong> Is it safe to import GSAP in a file that is server-side rendered?</summary>

Yes. GSAP guards against missing browser globals at import time. Running an animation requires a DOM, which is why we always put GSAP calls inside a `$effect` that only runs on the client.
</details>

## 6. Common mistakes

- **Installing `@types/gsap`.** It is unnecessary and harmful. Remove it if you have it.
- **Importing from a subpath that doesn't exist.** `gsap/core` and `gsap/gsap-core` are internal paths; use `gsap` for the main import.
- **Adding to devDependencies.** You will hit "gsap is not defined" in production if GSAP is not installed when the app actually runs.
- **Using a CDN script tag.** Mixing a global `<script>` GSAP with a bundled ESM GSAP causes version drift and type confusion. Pick one (bundled).

## 7. What's next

Lesson 7.3 writes your first `gsap.to()`, `gsap.from()`, and `gsap.fromTo()` animations against a DOM element.
