---
module: 21
lesson: 21.10
title: The Svelte Playground and REPL
duration: 55 minutes
prerequisites:
  - "1.1 — What Svelte is and why it compiles"
  - "21.4 — The plugin system"
  - "21.1 — What Vite actually does"
learning_objectives:
  - Use svelte.dev/playground for bug reproduction, sharing examples, and rapid prototyping
  - Explain how the playground works internally — in-browser compiler, virtual filesystem, iframe preview
  - Use the svelte/compiler API including compile(), parse(), and preprocess()
  - Build a minimal in-app playground that compiles Svelte code client-side and shows JS output
  - Embed playground links in documentation and issue reports for reproducible examples
status: ready
---

# Lesson 21.10 — The Svelte Playground and REPL

> **Atomic lesson format** — every lesson in this course follows the same four parts: **Concept**, **Style it**, **Interact**, **Mini-build**.

## 1. Concept — The compiler in your browser

### 1.1 The problem: explaining Svelte code without running a dev server

You find a bug. You want to show a colleague. You want to test whether a specific rune behavior works the way you expect. You want to prototype a component idea without creating files, configuring a project, or waiting for a dev server to start. Or you want to include a live, editable example in your documentation.

The **Svelte Playground** (svelte.dev/playground) solves all of these by running the Svelte compiler directly in the browser. You type Svelte code, and instantly see the rendered preview, the compiled JavaScript output, and the generated CSS. No installation, no build step, no server. The compiler runs in a Web Worker, the preview renders in a sandboxed iframe, and the entire state is serializable as a shareable URL.

### 1.2 How the playground works internally

The playground is a remarkable piece of engineering. It runs the full Svelte compiler client-side using these components:

1. **Editor** — a code editor (CodeMirror) with Svelte syntax highlighting and autocomplete. You type `.svelte` code here.

2. **Compiler Worker** — the Svelte compiler (`svelte/compiler`) runs in a Web Worker. When you type, the editor sends the source code to the worker, which calls `compile()` and sends back the compiled JavaScript and CSS. Running in a worker keeps the main thread responsive.

3. **Virtual filesystem** — the playground simulates a filesystem with multiple files (App.svelte, Child.svelte, etc.). Each file is compiled independently, and imports between files are resolved virtually. This lets you test multi-component interactions.

4. **Preview iframe** — the compiled JavaScript is injected into a sandboxed iframe that renders the component. The iframe is isolated from the playground page, preventing component code from accessing the playground's DOM or state.

5. **URL serialization** — the playground state (all files, active file, selected view) is encoded into the URL hash. Sharing the URL gives the recipient an exact replica of your playground state.

### 1.3 Using the playground for development workflows

**Bug reproduction.** When filing a bug report against Svelte or a Svelte library, include a playground link. This gives maintainers a one-click reproduction — no cloning repos, installing dependencies, or guessing at your environment. The playground URL captures the exact code that demonstrates the bug.

**Sharing examples.** When teaching or answering questions, a playground link is worth more than a code block. The recipient can edit the code and see the result instantly, turning your example into an interactive tutorial.

**Rapid prototyping.** Test a rune behavior, try a CSS animation, or experiment with a snippet syntax before adding it to your project. The playground starts instantly — no `pnpm dev` wait, no file creation.

**Testing rune behavior.** The playground shows the compiled output alongside the source. You can write `$state(0)` and immediately see the signal read/write calls the compiler generates. This builds deep intuition for how runes work at the compilation level.

### 1.4 The svelte/compiler API

The playground uses three functions from `svelte/compiler`:

**`compile(source, options)`** — transforms Svelte source code into JavaScript and CSS. Returns an object with `js` (the compiled JavaScript) and `css` (the scoped CSS):

```typescript
import { compile } from 'svelte/compiler';

const result = compile(`
    <script lang="ts">
        let count: number = $state(0);
    </script>
    <button onclick={() => count++}>{count}</button>
`, {
    generate: 'client',
    filename: 'App.svelte'
});

console.log(result.js.code);  // compiled JavaScript
console.log(result.css?.code); // scoped CSS
```

**`parse(source, options)`** — parses Svelte source code into an Abstract Syntax Tree (AST) without compiling. Useful for analysis tools, linters, and documentation generators:

```typescript
import { parse } from 'svelte/compiler';

const ast = parse(`<h1>Hello</h1>`);
// ast.html.children[0] is the <h1> element node
```

**`preprocess(source, preprocessors, options)`** — runs preprocessors (TypeScript, Sass, Markdown) on the source code before compilation. The playground uses this to strip TypeScript types before passing to `compile()`:

```typescript
import { preprocess } from 'svelte/compiler';
import { typescript } from 'svelte-preprocess';

const processed = await preprocess(source, [typescript()], {
    filename: 'App.svelte'
});
```

### 1.5 Building a minimal in-app playground

You can embed a Svelte compiler in your own application. The key insight: `svelte/compiler` is designed to run in any JavaScript environment — Node.js, browsers, or workers. For a browser-based playground:

1. Import `compile` from `svelte/compiler` (the browser-compatible build).
2. Accept user input in a textarea.
3. Call `compile()` with the input and display the output.
4. Optionally render the preview in a sandboxed iframe.

The compile step is synchronous and fast (milliseconds for typical components). For a responsive editor experience, debounce the compilation — compile 300ms after the user stops typing.

### 1.6 Security considerations

Embedding a compiler and executing user-provided code has security implications:

- **Sandboxed iframe.** Always render compiled output in an iframe with `sandbox="allow-scripts"`. This prevents the compiled code from accessing the parent page's DOM, cookies, or JavaScript scope.
- **No server execution.** The playground compiles and renders entirely client-side. There is no server evaluating user code. This eliminates server-side injection attacks.
- **Content Security Policy.** If your app has a strict CSP, you may need to allow `blob:` URLs and `unsafe-eval` for the iframe's script execution. Consider using a separate origin for the preview iframe.

### 1.7 Embedding playground links in documentation

Many Svelte libraries embed playground links directly in their documentation. The pattern is:

1. Create a playground with the example code.
2. Copy the URL (the state is in the hash).
3. Embed the link as a "Try it" button or an inline iframe.

For the `svelte.dev/playground` specifically, you can construct URLs programmatically by encoding the file contents as base64 in the hash:

```typescript
const code: string = `<h1>Hello</h1>`;
const encoded: string = btoa(JSON.stringify({ files: [{ name: 'App.svelte', source: code }] }));
const url: string = `https://svelte.dev/playground#${encoded}`;
```

### 1.8 "In production" — how a playground in docs reduced support tickets by 40%

A component library team embedded playground links in every documentation page. Each component's API docs included a "Live Example" button that opened the playground with a pre-configured example. Before the playground links, 60% of support questions on Discord were "how do I use X?" — questions the docs already answered but that required mental effort to translate from static code to running examples. After adding playground links, those questions dropped by 40% within a month. The key insight: interactive examples are not just nice to have — they are a support cost reduction tool.

### 1.9 The TypeScript angle

The `svelte/compiler` API is fully typed. The `compile()` function returns a `CompileResult` object with typed `js` and `css` properties. The `parse()` function returns an `AST` type with typed nodes for elements, text, expressions, and control flow blocks. These types are published in `svelte/types/compiler`:

```typescript
import type { CompileResult, CompileOptions } from 'svelte/compiler';

const options: CompileOptions = {
    generate: 'client',
    filename: 'App.svelte',
    dev: false
};

const result: CompileResult = compile(source, options);
```

When building tooling on top of the compiler, these types prevent you from accessing properties that do not exist on AST nodes and provide autocomplete for compile options.

### 1.10 Common interview question

**Q: "How does the Svelte Playground manage to compile and render Svelte components entirely in the browser, without a server?"**

**Model answer:** The Svelte compiler (`svelte/compiler`) is a JavaScript library that can run in any JS environment, including browsers. The playground imports it into a Web Worker for non-blocking compilation. When the user types code, it is sent to the worker, which calls `compile()` to produce JavaScript and CSS. The compiled JavaScript is injected into a sandboxed iframe via a blob URL or `srcdoc`. The iframe executes the compiled component using a minimal Svelte runtime. The virtual filesystem handles multi-file projects by resolving imports to other compiled modules in memory. No server is needed because the entire transform pipeline — parsing, compiling, and rendering — runs in the browser's JavaScript engine.

## Deep Dive

**Compile options in depth.** The `compile()` function accepts an options object with several important properties: `generate` controls whether to produce client-side (`'client'`) or server-side (`'server'`) output. `dev` enables development mode with extra runtime checks and component inspector support. `css` can be `'injected'` (CSS is inlined in the JS, applied at runtime) or `'external'` (CSS is returned separately). `filename` is used for error messages and source maps. `runes` controls whether runes mode is enabled (in Svelte 5.55+, it is enabled by default for `.svelte` files).

**The AST structure.** `parse()` returns an AST with three top-level nodes: `module` (the `<script context="module">` block), `instance` (the `<script>` block), and `html` (the markup). Each node contains child nodes typed as `Element`, `Text`, `MustacheTag`, `IfBlock`, `EachBlock`, etc. Walking the AST programmatically enables building custom linters, documentation generators, and code transformation tools.

**Compile-time vs runtime cost.** Running the compiler in the browser has a CPU cost. Compiling a typical component takes 5-20ms. For a playground with a single file and debounced input, this is imperceptible. For compiling hundreds of components (like an in-browser documentation site), consider using a Web Worker pool or pre-compiling components and caching the results in IndexedDB.

**The Svelte REPL vs the Playground.** Historically, svelte.dev hosted a "REPL" (Read-Eval-Print Loop). The playground is its successor, with the same functionality plus improved URL sharing, multi-file support, and Svelte 5 rune support. Both terms refer to the same tool.

**Connection to other lessons.** Lesson 1.1 introduced the concept of Svelte as a compiler. Lesson 21.4 showed how the Svelte plugin uses `compile()` inside Vite's `transform` hook. This lesson brings the compiler directly to the student's hands — not mediated by Vite, but called directly in the browser. The module project uses this technique for the embedded playground page at `/toolkit/playground`.

## Going Deeper

**Official docs to read next:**

- [svelte.dev/playground](https://svelte.dev/playground) — the live playground.
- [svelte.dev/docs/svelte/svelte-compiler](https://svelte.dev/docs/svelte/svelte-compiler) — the compiler API reference.
- [github.com/sveltejs/svelte/tree/main/packages/svelte/src/compiler](https://github.com/sveltejs/svelte) — the compiler source code.

**Advanced pattern: building a component preview system.** Documentation sites for component libraries often need live previews. Build a component preview system by: (1) compiling the component source with `compile()`, (2) evaluating the compiled JS using `new Function()` or a blob URL in an iframe, (3) mounting the component with `mount(Component, { target: element })`. The preview updates instantly when the source changes. Add a "copy playground link" button to let users take the example to the full playground for further experimentation.

**Challenge question (combines Lesson 21.10 + Lesson 21.4 + Lesson 1.1):** Design a Vite plugin that reads `.svelte` files from a `docs/examples/` directory, compiles them at build time using `svelte/compiler`, and generates a `virtual:examples` module that exports the source code, compiled JS, and compiled CSS for each example. Describe the plugin hooks and the module's TypeScript interface.

## 2. Style it — PE7 applied to the in-app playground

The mini-build is a simplified REPL. The editor area uses monospace font on `var(--color-surface-2)` background. The output tabs (JS Output, CSS Output) use `var(--color-surface)` with `var(--radius-lg)`. The active tab has a `var(--color-brand)` bottom border. Error messages use `var(--color-error)` text on `var(--color-surface-2)` background.

## 3. Interact — compiling Svelte code and seeing the output

The problem: students have never seen the compiler's output directly.

```typescript
interface CompileOutput {
    jsCode: string;
    cssCode: string;
    error: string | null;
}
```

The interactive element is a textarea where students type Svelte code and see the simulated compiled JavaScript output on the right. This makes the compilation process tangible — students see exactly what the compiler produces for each line of Svelte source.

## 4. Mini-build — Simplified Svelte REPL

**File:** `src/routes/modules/21-vite-vitest/10-svelte-playground/+page.svelte`

This page provides a simplified REPL experience. Students type Svelte source code in an editor area and see simulated compilation output (JS and CSS) in an adjacent panel. The page also links to the official Svelte Playground for full functionality.

### Run it

```bash
pnpm dev
```

Then open `http://localhost:5173/modules/21-vite-vitest/10-svelte-playground`.

### Prove the concept

1. Visit [svelte.dev/playground](https://svelte.dev/playground) and type a simple component with `$state`.
2. Click the "JS Output" tab to see the compiled JavaScript.
3. Notice how `$state(0)` compiles to signal read/write calls — the reactive system is generated by the compiler.
4. Share the playground URL with a colleague and confirm they see the exact same code.

## 5. Check your understanding

<details>
<summary><strong>Q1.</strong> How does the Svelte Playground compile code without a server?</summary>

The Svelte compiler (`svelte/compiler`) is a JavaScript library that runs in the browser. The playground imports it into a Web Worker, sends the user's source code to the worker, calls `compile()`, and receives the compiled JavaScript and CSS back. The compiled output is rendered in a sandboxed iframe. The entire process is client-side.
</details>

<details>
<summary><strong>Q2.</strong> What are the three main functions exported by svelte/compiler?</summary>

`compile(source, options)` transforms Svelte source into JavaScript and CSS. `parse(source, options)` converts source into an AST without compiling. `preprocess(source, preprocessors, options)` runs preprocessors (TypeScript, Sass) before compilation. `compile` is the most commonly used; `parse` is for analysis tools.
</details>

<details>
<summary><strong>Q3.</strong> Why should a browser-based playground render compiled code in a sandboxed iframe?</summary>

A sandboxed iframe isolates the user's compiled code from the host page. Without sandboxing, the compiled code could access the host page's DOM, cookies, and JavaScript scope — a security risk when running untrusted user input. The `sandbox="allow-scripts"` attribute allows JavaScript execution within the iframe while blocking access to the parent page.
</details>

<details>
<summary><strong>Q4.</strong> What is the difference between compile()'s generate: 'client' and generate: 'server' options?</summary>

`generate: 'client'` produces JavaScript intended for the browser — it creates and updates DOM elements directly. `generate: 'server'` produces JavaScript intended for server-side rendering — it generates HTML strings without creating DOM elements. SvelteKit uses both: server rendering for the initial page load (SSR) and client rendering for interactive updates after hydration.
</details>

<details>
<summary><strong>Q5.</strong> How can you share a specific playground state as a URL?</summary>

The playground serializes all file contents, the active file, and the selected view into the URL hash (typically as a base64-encoded JSON string). Copying and sharing this URL gives the recipient an exact replica of the playground state. This makes playground links ideal for bug reports, documentation examples, and teaching.
</details>

## 6. Common mistakes

- **Trying to use svelte/compiler in a server-only context when you need client compilation.** Make sure you import the browser-compatible build of the compiler. In SvelteKit, the compiler is typically available on both server and client, but dynamic imports may be needed for tree-shaking on client-side-only pages.
- **Not debouncing compilation in an interactive editor.** Compiling on every keystroke wastes CPU and can cause the UI to lag. Debounce compilation by 200-300ms after the user stops typing.
- **Omitting the sandbox attribute on preview iframes.** Without sandboxing, user-provided code can access the parent page's scope. Always use `sandbox="allow-scripts"` at minimum.
- **Expecting the playground to support node_modules imports.** The playground's virtual filesystem does not include npm packages. Only Svelte itself and its built-in modules are available. For testing with third-party libraries, use a local dev server.

## 7. What's next

This is the final lesson in Module 21. The module project — **Custom Dev Toolkit** — combines everything from this module: a custom Vite plugin, Vitest test suite, environment variable management, bundle analysis, and an embedded Svelte playground.
