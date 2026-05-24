# Module 1 — Foundation: Video Lecture Script Outlines

> **Recording note:** Set editor font to 18px minimum. Use a dark theme with high contrast. Terminal font 16px. Browser DevTools undocked to a separate monitor if possible.

---

## Lesson 1.1 — What Svelte is and why it compiles

**Duration:** 12 minutes
**Screen setup:** Split-screen: slides/diagrams (left), browser showing a real-world site performance waterfall (right)

### Hook (30 seconds)
"Open your phone's browser right now and visit any popular web app. That loading spinner you're staring at? That's 80 kilobytes of framework code being parsed by a CPU that costs a fraction of your laptop's. Svelte asked a radical question in 2019: what if the framework just... disappeared before it reached the user?"

### Demo sequence
1. **[0:30-2:30] Show the problem** — Open Chrome DevTools on a React demo app. Navigate to the Network tab, filter by JS. Highlight the vendor bundle size (react + react-dom). Then open the Performance tab and show the parse/compile cost. "See that orange bar? That's your user's phone working just to understand React before a single pixel of YOUR code runs."
2. **[2:30-5:00] Introduce the compiler concept** — Switch to a diagram overlay: "Runtime vs Compiler" side-by-side. Show the flow: `.svelte` file -> Svelte compiler -> vanilla JS + CSS. Open a simple `.svelte` file in the editor. Then open the compiled output in `.svelte-kit/generated`. "No runtime. No virtual DOM. Just the exact instructions this specific component needs."
3. **[5:00-8:00] Walk through the ecosystem** — Diagram: Svelte (compiler) -> SvelteKit (framework) -> Vite (dev server) -> Node.js (runtime). Open `package.json` and point to each dependency. Run `pnpm dev` and show Vite starting. "These four pieces form your development stack. Svelte compiles. SvelteKit routes. Vite serves. Node runs it all."
4. **[8:00-10:00] The three blocks** — Open a `.svelte` file. Highlight `<script lang="ts">`, the markup section, and `<style>`. Create the simplest possible component: a heading with a scoped style. Show the compiled CSS class hash in DevTools Elements panel.
5. **[10:00-11:30] Edge case / gotcha** — "If you Google 'Svelte tutorial' right now, half the results will show you `export let` syntax. That's Svelte 4. It's dead. We use runes — `$state`, `$derived`, `$effect`. If a tutorial doesn't have those, close the tab."

### Key moments (timestamps the editor should chapter-mark)
- 0:30 — "The cost of a runtime framework"
- 2:30 — "The compiler approach"
- 5:00 — "The four-piece ecosystem"
- 8:00 — "The three blocks of every .svelte file"
- 10:00 — "How to spot outdated tutorials"

### Callout graphics
- Side-by-side diagram: "Runtime (React) vs Compiler (Svelte)" data flow
- Bundle size comparison bar chart (React vs Svelte for equivalent app)
- Ecosystem diagram: Node.js -> Vite -> SvelteKit -> Svelte
- Screenshot of compiled CSS class hash in DevTools

### Outro (30 seconds)
"Svelte compiles your components into surgical DOM updates with zero runtime overhead. Next lesson, we set up a real project from scratch — pnpm, SvelteKit 2, TypeScript strict mode, everything you need to follow along for the rest of this course. Don't skip it."

---

## Lesson 1.2 — Project setup with pnpm + SvelteKit 2 + TypeScript strict mode

**Duration:** 14 minutes
**Screen setup:** Terminal full-screen for first half, then split editor + terminal

### Hook (30 seconds)
"Every 'quick start' tutorial skips the setup that matters — strict TypeScript, proper package management, the config files that save you 40 hours of debugging later. In the next 14 minutes, you'll set up a project the way a senior developer would on day one of a production app."

### Demo sequence
1. **[0:30-3:00] Why pnpm, not npm** — Terminal: `npm install` on a sample project, show node_modules size. Then `pnpm install` on the same project, show the difference. Explain the content-addressable store. "Every dependency installed once on your machine, ever. Symlinked, not copied."
2. **[3:00-6:00] Scaffold the project** — Run `pnpm create svelte@latest ultimate-frontend`. Walk through each prompt: TypeScript (yes), ESLint (yes), Prettier (yes). Show the generated file tree. Open `svelte.config.js`, `tsconfig.json`, `vite.config.ts` — explain each in one sentence.
3. **[6:00-9:00] TypeScript strict mode** — Open `tsconfig.json`. Set `"strict": true`. Explain what strict mode catches: implicit any, null checks, unused locals. Write a function without a return type — show the red squiggly. Add the type — show it go green. "This one line in your config catches bugs before they reach your users."
4. **[9:00-12:00] First dev server run** — `pnpm dev`. Open browser to localhost:5173. Show the welcome page. Edit `+page.svelte`, save, watch HMR update in under 100ms. "That instant reload? That's Vite. Every save, every time, for the rest of this course."
5. **[12:00-13:30] Edge case / gotcha** — "If you see 'Cannot find module' errors after setup, you probably used npm or yarn. SvelteKit's workspace resolution assumes pnpm. Run `pnpm install` and the errors vanish."

### Key moments (timestamps the editor should chapter-mark)
- 0:30 — "Why pnpm matters"
- 3:00 — "Scaffolding with create svelte"
- 6:00 — "TypeScript strict mode"
- 9:00 — "Your first dev server"
- 12:00 — "The #1 setup mistake"

### Callout graphics
- Terminal comparison: npm vs pnpm node_modules size
- File tree diagram of a fresh SvelteKit project
- tsconfig.json key fields highlighted

### Outro (30 seconds)
"You now have a production-grade SvelteKit project with strict TypeScript. Next lesson, we open our first `.svelte` file and learn the three blocks that every Svelte component is built from. See you there."

---

## Lesson 1.3 — The three blocks: script, markup, style

**Duration:** 11 minutes
**Screen setup:** Editor with a single `.svelte` file open, browser preview on right

### Hook (30 seconds)
"React has JSX. Vue has SFCs with `<template>`. Angular has separate HTML, CSS, and TS files. Svelte puts everything in one file — but it's not chaos. It's the most organized component format in frontend, and understanding these three blocks is the key to everything that follows."

### Demo sequence
1. **[0:30-2:30] Show the problem** — Open a React component with JSX mixing logic and markup. Then open an Angular component with three separate files. "Both extremes have friction. Svelte found the middle ground." Open a blank `.svelte` file. Type the three blocks: `<script lang="ts">`, markup, `<style>`.
2. **[2:30-5:00] The script block** — Write a variable: `let name: string = 'World';`. Explain `lang="ts"`. Show that the script runs once on component mount. Import another file. "This is your logic. It runs once. Everything reactive comes from runes, which we'll learn in Module 2."
3. **[5:00-7:30] The markup block** — Write `<h1>Hello {name}</h1>`. Show the curly brace syntax for expressions. Add a paragraph with `{name.length} characters`. "Anything in curly braces is JavaScript. Any JavaScript expression — not just variables."
4. **[7:30-9:30] The style block** — Add `<style>` with `h1 { color: steelblue; }`. Show in DevTools that Svelte generated a scoping class like `.s-abc123`. Create another component with `h1` styled differently. Show both render without conflict. "Scoped by default. No CSS modules. No BEM. No naming conventions needed."
5. **[9:30-10:30] Edge case / gotcha** — "The order matters for readability but not for Svelte. However, the community convention is script-markup-style, top to bottom. Break this convention and your PR reviewer will ask you to move things around."

### Key moments (timestamps the editor should chapter-mark)
- 0:30 — "Why Svelte's format wins"
- 2:30 — "The script block"
- 5:00 — "The markup block"
- 7:30 — "The style block and auto-scoping"
- 9:30 — "Block ordering convention"

### Callout graphics
- Three-block diagram with color-coded sections
- DevTools screenshot showing scoped class hash
- Comparison: React JSX vs Svelte SFC structure

### Outro (30 seconds)
"Script for logic, markup for structure, style for appearance — all in one file, all scoped automatically. Next lesson, we add TypeScript type annotations to our variables and see how the compiler catches mistakes before runtime."

---

## Lesson 1.4 — TypeScript type annotations on variables

**Duration:** 11 minutes
**Screen setup:** Editor with `.svelte` file, TypeScript error panel visible at bottom

### Hook (30 seconds)
"You just wrote `let name = 'World'` and TypeScript already knows it's a string. So why bother with type annotations? Because implicit types break the moment your code gets complex — and by then, the bug is three files away from where TypeScript could have caught it."

### Demo sequence
1. **[0:30-2:30] Show the problem** — Write a function that takes `data` with no type. Call it with a number, then a string, then an object. "TypeScript lets all three through because it inferred `any`. In strict mode, this is an error. But even without strict mode, you've lost all IntelliSense."
2. **[2:30-5:00] Basic annotations** — Annotate primitives: `let count: number = 0`, `let name: string = ''`, `let active: boolean = false`. Show IntelliSense autocomplete on `name.` — all string methods appear. Remove the annotation — same result. "TypeScript infers simple types. Annotations are documentation for humans, not just the compiler."
3. **[5:00-7:30] When inference fails** — Show a variable initialized as `let items = []` — TypeScript infers `never[]`. Push a string — error. Annotate as `let items: string[] = []` — push works. Show union types: `let value: string | number = 'hello'`. "Inference is smart, but not psychic. Arrays and unions need your help."
4. **[7:30-9:30] Function parameter types** — Write a function: `function greet(name: string): string`. Show that calling `greet(42)` is a red squiggly. Show return type annotation. "Parameters always need types. Return types are optional but recommended — they catch silent bugs when your function evolves."
5. **[9:30-10:30] Edge case / gotcha** — "Don't over-annotate. `let count: number = 0` — the `: number` is redundant because TypeScript infers it from `0`. Annotate when the type isn't obvious from the value: function parameters, empty arrays, union types, and object shapes."

### Key moments (timestamps the editor should chapter-mark)
- 0:30 — "Why explicit types matter"
- 2:30 — "Basic type annotations"
- 5:00 — "When inference needs help"
- 7:30 — "Function signatures"
- 9:30 — "When NOT to annotate"

### Callout graphics
- Table: "Inferred vs Explicit — when to annotate"
- Screenshot of IntelliSense dropdown on a typed variable

### Outro (30 seconds)
"Type annotations are your contract with future-you. They cost seconds to write and save hours of debugging. Next lesson, we build the CSS foundation for the entire course — layers, OKLCH tokens, and a mobile-first baseline that handles every screen size."

---

## Lesson 1.5 — PE7 CSS architecture: @layer, OKLCH tokens, mobile-first baseline

**Duration:** 14 minutes
**Screen setup:** Editor with CSS file on left, browser showing rendered page on right

### Hook (30 seconds)
"Most CSS courses teach you properties. This course teaches you architecture. By the end of this lesson, you'll have a layered token system that makes every style you write for the rest of this course predictable, overridable, and maintainable. This is how design systems at Stripe and Linear actually work."

### Demo sequence
1. **[0:30-3:00] Show the problem** — Open a CSS file with 500 lines of tangled specificity. Show a case where `.card .title` overrides `.title` unexpectedly. "Specificity wars. Every CSS codebase eventually devolves into `!important` chains. Layers solve this permanently."
2. **[3:00-6:00] @layer explained** — Create `@layer reset, tokens, base, components, utilities;`. Explain cascade order. Write conflicting styles in different layers — show that layer order wins over specificity. "A utility in the `utilities` layer beats a component style, even if the component has higher specificity. Layers override the cascade."
3. **[6:00-9:00] OKLCH color tokens** — Explain OKLCH: Lightness, Chroma, Hue. Create CSS custom properties: `--color-primary: oklch(65% 0.25 260);`. Show how changing just the hue creates a cohesive palette. Compare to HSL — show OKLCH's perceptual uniformity. "Same lightness value in OKLCH actually looks the same brightness. HSL lies to you."
4. **[9:00-12:00] Mobile-first baseline** — Write base styles with `min-width` media queries. Show the flow: mobile default -> tablet override -> desktop override. Add fluid spacing with `clamp()`. "Design for the smallest screen first. Everything else is enhancement. This is not philosophy — it's fewer lines of CSS."
5. **[12:00-13:30] Edge case / gotcha** — "If you import a third-party CSS library that doesn't use layers, its styles land in the 'unlayered' zone — which beats ALL your layers. Wrap third-party CSS in a layer: `@layer vendor { @import 'library.css'; }`"

### Key moments (timestamps the editor should chapter-mark)
- 0:30 — "The specificity war problem"
- 3:00 — "@layer: the solution"
- 6:00 — "OKLCH color tokens"
- 9:00 — "Mobile-first baseline"
- 12:00 — "Third-party CSS trap"

### Callout graphics
- Layer cascade diagram showing override order
- OKLCH color wheel diagram vs HSL comparison
- Mobile-first breakpoint flow diagram

### Outro (30 seconds)
"You now have a CSS architecture that scales from a side project to a design system. Next lesson, we go deeper on fluid typography with `clamp()` — making text that scales smoothly from phone to ultrawide without a single breakpoint."

---

## Lesson 1.6 — Fluid typography and spacing with clamp()

**Duration:** 11 minutes
**Screen setup:** Editor on left, browser on right with viewport resizing visible

### Hook (30 seconds)
"Resize your browser window right now. See how the text jumps at each breakpoint? That jagged snap is a relic of the responsive-design era. `clamp()` gives you text that scales like water — smoothly, continuously, from 320px to 2560px. One line of CSS, zero breakpoints."

### Demo sequence
1. **[0:30-2:30] Show the problem** — Create heading styles with media query breakpoints: 1.5rem on mobile, 2rem on tablet, 3rem on desktop. Resize the browser slowly — show the abrupt jumps at each breakpoint. "Three sizes. Two breakpoints. Looks fine at the breakpoints, looks wrong everywhere in between."
2. **[2:30-5:00] Introduce clamp()** — Replace with `font-size: clamp(1.5rem, 1rem + 2vw, 3rem)`. Resize the browser slowly — show smooth scaling. Explain the three values: minimum, preferred (viewport-relative), maximum. "One line. Smooth scaling. Minimum and maximum as guardrails."
3. **[5:00-8:00] Build a type scale** — Create CSS custom properties: `--text-sm`, `--text-base`, `--text-lg`, `--text-xl`, `--text-2xl`, `--text-3xl` — all using `clamp()`. Apply them to headings and body text. Show the entire page scaling harmoniously. "A complete type scale in six custom properties. Every text element in your app references these."
4. **[8:00-10:00] Fluid spacing** — Apply the same principle to padding and margins: `--space-md: clamp(1rem, 0.5rem + 1.5vw, 2rem)`. Show a card component with fluid padding that grows on wider screens. "Typography and spacing scale together. The proportions stay perfect at every viewport width."
5. **[10:00-10:30] Edge case / gotcha** — "Never use `clamp()` with just `vw` as the preferred value — `clamp(1rem, 4vw, 3rem)`. The middle value should combine a fixed unit with a viewport unit: `1rem + 2vw`. Without the fixed part, users who zoom in/out get unexpected behavior."

### Key moments (timestamps the editor should chapter-mark)
- 0:30 — "The breakpoint jump problem"
- 2:30 — "clamp() — one line, smooth scaling"
- 5:00 — "Building a fluid type scale"
- 8:00 — "Fluid spacing tokens"
- 10:00 — "The zoom gotcha"

### Callout graphics
- Graph showing font-size vs viewport-width: stepped (breakpoints) vs smooth (clamp)
- Visual of the clamp() formula with labeled parts
- Type scale table with all custom property values

### Outro (30 seconds)
"Fluid typography and spacing eliminate breakpoint-driven design jumps. Your text and whitespace now scale as a continuous function of viewport width. Next up: how Svelte scopes your styles automatically and why you'll never fight a CSS naming collision again."

---

## Lesson 1.7 — Scoped `<style>` blocks: how Svelte's CSS scoping works

**Duration:** 11 minutes
**Screen setup:** Editor with two `.svelte` files side by side, browser DevTools Elements panel visible

### Hook (30 seconds)
"You write `h1 { color: red }` in one component and `h1 { color: blue }` in another. In vanilla HTML, the last one wins. In CSS Modules, you're writing `.styles.heading` everywhere. In Svelte, both styles work, in the same page, with zero configuration. Here's the engineering behind the magic."

### Demo sequence
1. **[0:30-2:30] Show the problem** — Create two components, both styling `h1`. Import both into a page. In plain CSS, show the conflict. "Last loaded wins. Unless one has higher specificity. Unless someone adds `!important`. This is why CSS has a reputation for being unpredictable."
2. **[2:30-5:00] Show Svelte's solution** — Same two components in Svelte. Both `h1` styles work independently. Open DevTools Elements tab — show the generated class: `svelte-abc123`. "Svelte adds a unique hash class to every element and every selector. Your `h1` becomes `h1.svelte-abc123`. Scoped. Automatic. Zero config."
3. **[5:00-7:30] How the compiler does it** — Open the compiled CSS output. Show the hash-appended selectors. Explain that Svelte analyzes your markup and only scopes selectors that match elements in your template. "If you write a `.sidebar` style but have no element with that class in your markup, Svelte warns you — unused CSS."
4. **[7:30-9:30] The :global() escape hatch** — Show `:global(body)` for styles that must escape scoping. Show `:global(.prose h1)` for styling inside rendered HTML from a CMS. "Use `:global()` sparingly. If you're using it on every other selector, rethink your component boundaries."
5. **[9:30-10:30] Edge case / gotcha** — "Svelte's unused CSS warning is aggressive. If you dynamically add a class with JavaScript and Svelte doesn't see it in the static markup, it flags the style as unused. The fix: use the `class:` directive instead of string concatenation."

### Key moments (timestamps the editor should chapter-mark)
- 0:30 — "The global CSS collision problem"
- 2:30 — "Svelte's automatic scoping"
- 5:00 — "Inside the compiled CSS"
- 7:30 — ":global() — the escape hatch"
- 9:30 — "Dynamic classes and unused CSS warnings"

### Callout graphics
- Before/after diagram: global CSS vs scoped CSS
- DevTools screenshot showing hashed class names
- Diagram of how the compiler rewrites selectors

### Outro (30 seconds)
"Svelte's CSS scoping gives you the isolation of CSS Modules with the simplicity of plain CSS. Next lesson, we level up our TypeScript with interfaces — defining the exact shape of the objects our components will work with."

---

## Lesson 1.8 — TypeScript interfaces: defining object shapes

**Duration:** 11 minutes
**Screen setup:** Editor with a `.svelte` file and a `.ts` type file, IntelliSense popups visible

### Hook (30 seconds)
"Your API returns a user object with 12 fields. You typo `user.emial` instead of `user.email`. JavaScript happily gives you `undefined`. Your UI shows a blank space. Your user submits a support ticket. TypeScript interfaces catch that typo before you even save the file."

### Demo sequence
1. **[0:30-2:30] Show the problem** — Create an object `let user = { name: 'Ada', email: 'ada@example.com' }`. Access `user.emial` — no error in plain JS. Show the UI rendering blank. "Silent failure. The most dangerous kind of bug."
2. **[2:30-5:00] Define an interface** — Write `interface User { name: string; email: string; age: number; }`. Type a variable with it: `let user: User = { ... }`. Try accessing `user.emial` — red squiggly instantly. Show IntelliSense listing all valid properties. "The interface is a contract. Break it, and TypeScript stops you cold."
3. **[5:00-7:30] Optional and readonly properties** — Add `bio?: string` (optional). Add `readonly id: string`. Show that `user.id = 'new'` is an error. Show that `user.bio` might be `undefined` and TypeScript forces you to handle it. "Optional means you must check. Readonly means you can't mutate. Both prevent real bugs."
4. **[7:30-9:30] Nested interfaces** — Create `interface Address { street: string; city: string; }`. Add `address: Address` to `User`. Show deep IntelliSense: `user.address.city` autocompletes. "Interfaces compose. Complex data structures get full type coverage at every level."
5. **[9:30-10:30] Edge case / gotcha** — "`interface` vs `type` — you'll see both in Svelte codebases. For object shapes, prefer `interface` — it's extendable and gives better error messages. Use `type` for unions (`type Status = 'active' | 'inactive'`) and computed types."

### Key moments (timestamps the editor should chapter-mark)
- 0:30 — "The silent typo bug"
- 2:30 — "Your first interface"
- 5:00 — "Optional and readonly"
- 7:30 — "Nested interfaces"
- 9:30 — "interface vs type"

### Callout graphics
- Code comparison: untyped vs typed object access
- Interface syntax diagram with labels for each part
- Decision flowchart: "interface vs type — which to use"

### Outro (30 seconds)
"Interfaces turn your data into documented, autocompleted, error-checked contracts. In our final foundation lesson, we wire data into Svelte templates using expression syntax — the curly braces that make your markup dynamic."

---

## Lesson 1.9 — Passing data into the template with `{}` expressions

**Duration:** 11 minutes
**Screen setup:** Editor with `.svelte` file, browser preview showing live updates

### Hook (30 seconds)
"HTML is static. It can't show a user's name, calculate a total, or format a date. Svelte's curly brace expressions bridge that gap — any JavaScript expression, right inside your markup, updated automatically when the data changes. This is the single most-used feature in every Svelte app."

### Demo sequence
1. **[0:30-2:30] Show the problem** — Write plain HTML: `<p>Hello, USER_NAME</p>`. "This never changes. It's a string in a text file. To make it dynamic, you'd need `document.querySelector` and `.textContent =` ... or you use Svelte's expression syntax."
2. **[2:30-5:00] Basic expressions** — Write `let name = 'Ada'` in the script. Write `<p>Hello, {name}</p>` in markup. Show it renders. Change the value — show it updates (preview live). Show expressions in attributes: `<img alt={name} />`. "Curly braces mean: evaluate this JavaScript and put the result here."
3. **[5:00-7:30] Expression variety** — Show string interpolation: `{'Hello, ' + name}`. Math: `{price * quantity}`. Ternary: `{active ? 'On' : 'Off'}`. Method calls: `{name.toUpperCase()}`. Template literals: `` {`${count} items`} ``. "Any JavaScript expression works. Not statements — no `if`, no `for`, no `let` — just expressions that produce a value."
4. **[7:30-9:30] Shorthand attributes** — Show that `<input value={value}>` can be shortened to `<input {value}>` when the attribute name matches the variable name. Show this with `id`, `class`, `title`. "Svelte shorthand. Less typing, same result. You'll see this pattern constantly in real Svelte code."
5. **[9:30-10:30] Edge case / gotcha** — "Expressions are NOT the same as statements. `{let x = 5}` is an error. `{if (true) 'yes'}` is an error. You want a ternary: `{condition ? 'yes' : 'no'}`. For complex logic, use `{#if}` blocks — which is Module 4."

### Key moments (timestamps the editor should chapter-mark)
- 0:30 — "Static HTML's limitation"
- 2:30 — "Your first expression"
- 5:00 — "What you can put inside {}"
- 7:30 — "Shorthand attributes"
- 9:30 — "Expressions vs statements"

### Callout graphics
- Syntax diagram: expression inside curly braces with labeled parts
- Table of valid expressions: math, ternary, method calls, template literals
- Shorthand attribute before/after comparison

### Outro (30 seconds)
"Curly brace expressions are how data flows from your script into your markup. You'll use them in every single component you build. With that, Module 1 is complete — you have a project, a CSS architecture, TypeScript types, and dynamic templates. Module 2 unlocks reactivity: making your UI respond to change."

---
