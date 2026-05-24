# Module 6 — Styling & Animation: Video Lecture Script Outlines

> **Recording note:** Set editor font to 18px minimum. For animation lessons, record at 60fps to capture smooth motion. Use Chrome DevTools Animations panel for slow-motion playback. Browser preview should be large enough to see transitions clearly.

---

## Lesson 6.1 — PE7 `@layer` architecture in full depth

**Duration:** 13 minutes
**Screen setup:** Editor with global CSS file, browser DevTools Styles panel

### Hook (30 seconds)
"You add a third-party CSS library. Suddenly, half your components look wrong. The library's styles have higher specificity than yours — or they don't, and you can't figure out WHY some styles override others. `@layer` makes the cascade predictable. You define the order once, and specificity wars end forever."

### Demo sequence
1. **[0:30-3:00] Show the problem** — Import a CSS library. Show conflicting styles. Toggle `!important` back and forth. "This is specificity whack-a-mole. Every fix creates a new problem."
2. **[3:00-6:00] Layer architecture** — Define `@layer reset, tokens, base, components, utilities;`. Explain cascade order. Write conflicting styles in different layers — show that layer order always wins. Show that specificity within layers still matters, but layers trump specificity between layers.
3. **[6:00-9:00] Practical setup** — Structure the app's CSS: reset layer (box-sizing, margin reset), tokens layer (custom properties), base layer (typography, body styles), components layer (per-component styles), utilities layer (spacing, display helpers).
4. **[9:00-11:00] Third-party integration** — Wrap vendor CSS in `@layer vendor`. Place vendor between reset and tokens. "Now vendor styles never override your component styles, regardless of their specificity."
5. **[11:00-12:30] Edge case / gotcha** — "Unlayered CSS beats ALL layers. If you import a stylesheet without wrapping it in a layer, its styles have the highest priority. Always wrap third-party CSS in a layer."

### Key moments (timestamps the editor should chapter-mark)
- 0:30 — "The specificity war"
- 3:00 — "Layer cascade order"
- 6:00 — "Five-layer architecture"
- 9:00 — "Taming third-party CSS"
- 11:00 — "Unlayered CSS overrides everything"

### Callout graphics
- Layer cascade diagram with priority arrows
- Five-layer architecture with file structure
- Unlayered vs layered CSS priority comparison

### Outro (30 seconds)
"Layer architecture makes your CSS cascade predictable and maintainable. Next lesson, we dive deep into OKLCH — the color system that actually looks the way you expect it to."

---

## Lesson 6.2 — OKLCH color system in depth

**Duration:** 12 minutes
**Screen setup:** Editor with CSS custom properties, browser showing color swatches and comparisons

### Hook (30 seconds)
"Pick two colors with the same HSL lightness value. Put them side by side. One looks darker than the other. HSL lies about brightness. OKLCH — Oklab Lightness Chroma Hue — gives you perceptually uniform color. Same lightness number = same perceived brightness. This changes how you build color systems."

### Demo sequence
1. **[0:30-2:30] The HSL problem** — Show `hsl(60, 100%, 50%)` (yellow) and `hsl(240, 100%, 50%)` (blue) side by side. Both have 50% lightness. The yellow looks much lighter. "Same L value. Different perceived brightness. HSL's model doesn't match human vision."
2. **[2:30-5:30] OKLCH explained** — Break down: L (Lightness 0-1), C (Chroma 0-0.4), H (Hue 0-360). Show `oklch(65% 0.25 260)`. Adjust L — brightness changes uniformly. Adjust C — saturation changes. Adjust H — hue rotates. "Three intuitive axes. L controls brightness truthfully."
3. **[5:30-8:00] Building a color system** — Create a palette: `--primary: oklch(65% 0.25 260)`. Generate shades by adjusting only L: 95%, 85%, 75%, 65%, 55%, 45%, 35%, 25%. "A full shade ramp from one hue. Just change lightness. Every shade is harmonious."
4. **[8:00-10:00] Gamut mapping** — Explain that some OKLCH colors can't be displayed on sRGB screens. Show `color-mix(in oklch, ...)`. Browser gamut-maps automatically. "Not every OKLCH color exists on your screen. The browser finds the closest displayable color."
5. **[10:00-11:30] Edge case / gotcha** — "OKLCH hue 0 and hue 360 are the same (red). But interpolating from hue 350 to hue 10 goes the long way around (350 -> 0 -> 10 = 20 degrees, not 350 -> 360 -> 10 via shorter route). Use `in oklch shorter hue` in gradients."

### Key moments (timestamps the editor should chapter-mark)
- 0:30 — "HSL lies about brightness"
- 2:30 — "OKLCH: perceptually uniform color"
- 5:30 — "Building a shade ramp"
- 8:00 — "Gamut mapping"
- 10:00 — "Hue interpolation direction"

### Callout graphics
- HSL vs OKLCH perceptual comparison swatches
- OKLCH color space 3D diagram
- Shade ramp generated from one hue
- Gradient interpolation: shorter vs longer hue path

### Outro (30 seconds)
"OKLCH gives you a truthful, intuitive color system. Next lesson, we build the complete design token system — spacing, typography, motion, radii, shadows — all as CSS custom properties."

---

## Lesson 6.3 — The design token system in depth

**Duration:** 13 minutes
**Screen setup:** Editor with token CSS file, browser showing components using tokens

### Hook (30 seconds)
"You want to change the border radius from 8px to 12px. In how many files? If the answer is more than one, you don't have a design token system. Tokens are the single source of truth for every visual decision in your app — and they take 30 minutes to set up and save thousands of hours."

### Demo sequence
1. **[0:30-3:00] What tokens are** — Show hardcoded values scattered across components: `border-radius: 8px`, `padding: 16px`, `color: #3b82f6`. "Magic numbers. No meaning, no consistency, no way to change them globally."
2. **[3:00-6:00] Build the token system** — Create custom properties: spacing (`--space-xs` through `--space-3xl`), typography (`--text-sm` through `--text-4xl`), radii (`--radius-sm` through `--radius-full`), shadows (`--shadow-sm` through `--shadow-xl`), motion (`--duration-fast`, `--ease-out`). "Every visual decision is a custom property. Components reference tokens, never raw values."
3. **[6:00-9:00] Using tokens in components** — Refactor three components to use tokens. Show that changing `--space-md` updates all three simultaneously. "One change, global effect. This is the promise of tokens."
4. **[9:00-11:00] Semantic tokens** — Layer semantic tokens on top: `--color-action: var(--primary-600)`, `--space-card-padding: var(--space-lg)`. "Primitive tokens define the scale. Semantic tokens define the purpose. Change the primitive, all semantic tokens update."
5. **[11:00-12:30] Edge case / gotcha** — "Don't create tokens for everything. A one-off `margin-top: 2px` nudge doesn't need a token. Tokens are for repeated decisions. If a value appears in two or more places, make it a token."

### Key moments (timestamps the editor should chapter-mark)
- 0:30 — "Magic numbers everywhere"
- 3:00 — "Building the token system"
- 6:00 — "Tokens in action"
- 9:00 — "Semantic tokens"
- 11:00 — "Token vs one-off value"

### Callout graphics
- Token hierarchy: primitives -> semantic -> component
- Before/after: hardcoded values vs token references
- Complete token reference table

### Outro (30 seconds)
"A design token system makes your app consistent and maintainable. Next lesson: native CSS nesting in Svelte's `<style>` blocks — cleaner selectors with less repetition."

---

## Lesson 6.4 — Native CSS nesting in Svelte `<style>` blocks

**Duration:** 10 minutes
**Screen setup:** Editor with `.svelte` file showing nested CSS, browser DevTools Styles panel

### Hook (30 seconds)
"You write `.card {}`, `.card .title {}`, `.card .title:hover {}`, `.card .body {}`, `.card .body p {}`. The word 'card' appears five times. With native CSS nesting, you write `.card {}` once and nest everything inside. Less repetition. Clearer hierarchy. And it works in Svelte right now."

### Demo sequence
1. **[0:30-2:00] Show the repetition** — A `<style>` block with 10 selectors all starting with `.card`. "Ten repetitions of the same prefix. Change the class name and you miss three of them."
2. **[2:00-5:00] Native nesting** — Rewrite with nesting: `.card { & .title { ... } & .body { p { ... } } &:hover { ... } }`. Show identical output in DevTools. "The `&` represents the parent selector. Nesting mirrors your markup structure."
3. **[5:00-7:30] Nesting patterns** — Show pseudo-classes: `&:hover`, `&:focus`. Media queries inside selectors: `@media (min-width: 768px) { ... }`. Container queries nested. "Anything you can nest in modern CSS works inside Svelte's `<style>` blocks."
4. **[7:30-8:30] DevTools verification** — Show compiled output — Svelte compiles nested CSS to flat selectors with scoping hashes. "Under the hood, it's still flat CSS with Svelte's scoping. Nesting is syntactic sugar that the compiler handles."
5. **[8:30-9:30] Edge case / gotcha** — "Deep nesting is a code smell. Three levels deep is usually the max. If you're nesting five levels, your component probably needs to be split into smaller components."

### Key moments (timestamps the editor should chapter-mark)
- 0:30 — "Selector repetition"
- 2:00 — "Native nesting syntax"
- 5:00 — "Nesting media and container queries"
- 7:30 — "Compiled output"
- 8:30 — "Nesting depth limit"

### Callout graphics
- Before/after: flat selectors vs nested
- Nesting syntax reference with & placement
- Warning: max 3 levels of nesting

### Outro (30 seconds)
"Native CSS nesting reduces selector repetition and mirrors your markup hierarchy. Next lesson: logical properties — writing CSS that works in any text direction."

---

## Lesson 6.5 — Logical properties

**Duration:** 10 minutes
**Screen setup:** Editor with CSS, browser showing LTR and RTL layouts side by side

### Hook (30 seconds)
"`margin-left` is wrong. Not syntactically — semantically. In a right-to-left language like Arabic, your 'left' margin should be on the right. Logical properties replace physical directions with flow-relative ones: `margin-inline-start` instead of `margin-left`. One property, every language."

### Demo sequence
1. **[0:30-2:30] Show the problem** — A page with `padding-left: 2rem`, `text-align: left`. Switch to RTL (`dir="rtl"`) — the layout is broken. Padding is on the wrong side.
2. **[2:30-5:00] Logical properties** — Replace `padding-left` with `padding-inline-start`. Replace `margin-right` with `margin-inline-end`. Replace `width` with `inline-size`. Switch to RTL — layout mirrors perfectly.
3. **[5:00-7:00] The full mapping** — Table: top->block-start, bottom->block-end, left->inline-start, right->inline-end. Width->inline-size, height->block-size. "Inline axis = text flow direction. Block axis = perpendicular."
4. **[7:00-8:30] Practical conversion** — Convert a card component from physical to logical properties. Show it working in both LTR and RTL.
5. **[8:30-9:30] Edge case / gotcha** — "Some properties don't have logical equivalents yet — like `background-position`. And `border-radius` uses `border-start-start-radius` (block-start, inline-start) which is verbose but correct."

### Key moments (timestamps the editor should chapter-mark)
- 0:30 — "margin-left is wrong"
- 2:30 — "Logical property replacements"
- 5:00 — "The complete mapping"
- 7:00 — "Converting a component"
- 8:30 — "Properties without logical equivalents"

### Callout graphics
- Physical to logical property mapping table
- LTR vs RTL layout comparison
- Block axis vs inline axis diagram

### Outro (30 seconds)
"Logical properties make your CSS language-agnostic. Next lesson: CSS Grid — the responsive layout engine that replaces most of your media queries."

---

## Lesson 6.6 — Responsive layout — CSS Grid

**Duration:** 13 minutes
**Screen setup:** Editor with CSS, browser showing grid layouts resizing

### Hook (30 seconds)
"You need a 3-column layout on desktop, 2 on tablet, 1 on mobile. The old way: three media queries, three `grid-template-columns` declarations. The new way: `grid-template-columns: repeat(auto-fit, minmax(300px, 1fr))`. One line. Zero breakpoints. It just works."

### Demo sequence
1. **[0:30-3:00] Grid fundamentals** — Create a grid container. Explain `grid-template-columns`, `grid-template-rows`, `gap`. Build a basic 3-column layout. "Grid is a 2D layout system. Columns AND rows. Flexbox is 1D."
2. **[3:00-6:00] auto-fit and minmax** — Replace fixed columns with `repeat(auto-fit, minmax(300px, 1fr))`. Resize browser — columns wrap automatically. "Items are at least 300px. If there's room for more, they share it equally. If not, they stack."
3. **[6:00-9:00] Grid areas** — Name areas: `grid-template-areas: "header header" "sidebar content" "footer footer"`. Assign children: `grid-area: header`. Rearrange layout with media queries by changing only the areas string. "Named areas make complex layouts readable and rearrangeable."
4. **[9:00-11:00] Build the mini-build** — Build a dashboard layout: header spanning full width, sidebar, main content area with a responsive card grid inside. All responsive, minimal breakpoints.
5. **[11:00-12:30] Edge case / gotcha** — "`auto-fit` vs `auto-fill`: `auto-fit` collapses empty tracks, `auto-fill` preserves them. With `auto-fit`, three items in a wide container stretch to fill. With `auto-fill`, they leave empty columns. Use `auto-fit` for most cases."

### Key moments (timestamps the editor should chapter-mark)
- 0:30 — "Responsive layout in one line"
- 3:00 — "auto-fit and minmax"
- 6:00 — "Named grid areas"
- 9:00 — "Dashboard layout mini-build"
- 11:00 — "auto-fit vs auto-fill"

### Callout graphics
- Grid line diagram with labeled tracks
- auto-fit vs auto-fill comparison
- Dashboard layout wireframe with grid areas

### Outro (30 seconds)
"CSS Grid handles 2D layouts with minimal code. Next lesson: Flexbox — the 1D layout tool that complements Grid for inline content distribution."

---

## Lesson 6.7 — Responsive layout — Flexbox

**Duration:** 11 minutes
**Screen setup:** Editor with CSS, browser showing flex layouts

### Hook (30 seconds)
"A navbar with a logo on the left, links in the center, and a user menu on the right. CSS Grid could do it, but Flexbox does it in three lines. Flexbox excels at distributing items along a single axis — and understanding when to use it instead of Grid is a senior-level skill."

### Demo sequence
1. **[0:30-2:30] Flex fundamentals** — Create a flex container. Explain `justify-content`, `align-items`, `gap`. Build a centered navbar.
2. **[2:30-5:00] flex-wrap and responsive behavior** — Add `flex-wrap: wrap`. Show items wrapping to the next line when the container shrinks. "Flex-wrap gives you responsive behavior without media queries."
3. **[5:00-7:30] flex-grow, flex-shrink, flex-basis** — Explain the shorthand `flex: 1 0 200px`. Show how items grow and shrink. Build a sidebar + content layout where the sidebar is fixed and content grows.
4. **[7:30-9:30] Grid vs Flexbox decision** — Table: Grid for 2D layouts, Flexbox for 1D distribution. Grid for page layout, Flexbox for component internals. "Grid for the big picture. Flexbox for the details."
5. **[9:30-10:30] Edge case / gotcha** — "`flex-basis: 0` vs `flex-basis: auto` changes how `flex-grow` distributes space. With `0`, extra space is distributed from zero (items become equal width). With `auto`, extra space is distributed from the content width (items maintain proportional difference)."

### Key moments (timestamps the editor should chapter-mark)
- 0:30 — "1D layout champion"
- 2:30 — "flex-wrap for responsiveness"
- 5:00 — "The flex shorthand"
- 7:30 — "Grid vs Flexbox"
- 9:30 — "flex-basis: 0 vs auto"

### Callout graphics
- Flex axis diagram with labeled properties
- Grid vs Flexbox decision table
- flex shorthand breakdown

### Outro (30 seconds)
"Flexbox handles 1D distribution; Grid handles 2D layouts. Together they cover every responsive design pattern. Next lesson: container queries — component-level responsiveness."

---

## Lesson 6.8 — Container queries

**Duration:** 11 minutes
**Screen setup:** Editor with `.svelte` file, browser showing component in different container widths

### Hook (30 seconds)
"Media queries ask 'how wide is the browser?' Container queries ask 'how wide is my parent?' The same card in a sidebar and a main content area should look different — and container queries make that happen without JavaScript."

### Demo sequence
1. **[0:30-2:30] Container setup** — Add `container-type: inline-size` to a wrapper. Write `@container (min-width: 400px) { ... }`. Show the component switching layouts based on its container.
2. **[2:30-5:00] Named containers** — Use `container-name: card-wrapper`. Target specific containers: `@container card-wrapper (min-width: 400px)`. "Named containers prevent ambiguity when you have nested containers."
3. **[5:00-7:30] Container query units** — Use `cqi`, `cqb` for sizing relative to the container. Build fluid spacing that scales with the container.
4. **[7:30-9:30] Build the mini-build** — Create a responsive card that switches from vertical to horizontal layout based on its container. Place it in two different contexts.
5. **[9:30-10:30] Edge case / gotcha** — "`container-type: inline-size` removes the element from its own container sizing. If the container has no explicit or intrinsic width, children using container queries may collapse to zero width."

### Key moments (timestamps the editor should chapter-mark)
- 0:30 — "Component-level responsiveness"
- 2:30 — "Named containers"
- 5:00 — "Container query units"
- 7:30 — "Responsive card mini-build"
- 9:30 — "Width collapse trap"

### Callout graphics
- Media query vs container query comparison
- Named container targeting diagram
- Container query units reference

### Outro (30 seconds)
"Container queries make components self-aware and context-responsive. Next lesson: per-page color personalities — giving each route its own visual identity."

---

## Lesson 6.9 — Per-page color personalities

**Duration:** 10 minutes
**Screen setup:** Editor with route files, browser showing different pages with different color schemes

### Hook (30 seconds)
"Your homepage feels warm and inviting. Your pricing page feels confident and bold. Your docs feel clean and focused. Same app, same components, different emotional signatures. Per-page color personalities make each route feel intentional — and it takes exactly one CSS custom property per page."

### Demo sequence
1. **[0:30-2:30] The concept** — Show a multi-page app where every page looks identical. "Same blue, same feel, same personality. Every page blends together. Users can't tell where they are."
2. **[2:30-5:00] Hue-based personalities** — Set `--page-hue` in each route's `+layout.svelte`. Homepage: warm orange (40). Pricing: confident violet (280). Docs: calm blue (220). Show all components adapting.
3. **[5:00-7:30] Build the system** — Component tokens reference `--page-hue`: `--color-accent: oklch(65% 0.2 var(--page-hue))`. Every component that uses `--color-accent` changes hue per page.
4. **[7:30-8:30] Transitions between pages** — Navigate between routes — the hue shifts smoothly using CSS transitions on the custom property.
5. **[8:30-9:30] Edge case / gotcha** — "Not all hues have the same chroma range. Yellow (90) supports less chroma than blue (260). Your accent color might look washed out on some pages. Test each hue and adjust chroma if needed."

### Key moments (timestamps the editor should chapter-mark)
- 0:30 — "Every page looks the same"
- 2:30 — "One custom property per page"
- 5:00 — "Component tokens adapt automatically"
- 7:30 — "Smooth page transitions"
- 8:30 — "Hue-chroma mismatch"

### Callout graphics
- Four pages with different hue values
- Token chain: --page-hue -> --color-accent -> component styles
- OKLCH chroma range per hue

### Outro (30 seconds)
"Per-page color personalities give each route emotional identity through a single custom property. Next lesson, we start animating: CSS transitions with motion tokens."

---

## Lesson 6.10 — CSS transitions with motion tokens

**Duration:** 11 minutes
**Screen setup:** Editor with CSS, browser showing hover/focus transitions

### Hook (30 seconds)
"A button hovers. The color shifts instantly — like a light switch. Add a CSS transition and it fades smoothly — like a dimmer. Transitions are the smallest possible animation: one property, changing over time. And with motion tokens, every transition in your app shares the same rhythm."

### Demo sequence
1. **[0:30-2:30] Before transitions** — Show a button with `:hover` changing background color. Instant switch. "Jarring. Mechanical. No personality."
2. **[2:30-5:00] Add transitions** — `transition: background-color var(--duration-fast) var(--ease-out)`. Show smooth fade. Explain: property, duration, easing.
3. **[5:00-7:30] Motion tokens** — Create `--duration-fast: 150ms`, `--duration-normal: 300ms`, `--duration-slow: 500ms`, `--ease-out: cubic-bezier(0.16, 1, 0.3, 1)`. Apply consistently.
4. **[7:30-9:30] Multiple properties** — `transition: background-color, color, box-shadow;` — each with the same timing. Show all three transitioning together.
5. **[9:30-10:30] Edge case / gotcha** — "`transition: all` seems convenient but transitions EVERY property — including `height`, `width`, and layout properties that cause jank. Always list specific properties."

### Key moments (timestamps the editor should chapter-mark)
- 0:30 — "Instant vs smooth"
- 2:30 — "CSS transition basics"
- 5:00 — "Motion tokens"
- 7:30 — "Multi-property transitions"
- 9:30 — "Never transition 'all'"

### Callout graphics
- Transition anatomy: property, duration, easing, delay
- Motion token reference table
- Easing curve visualizations

### Outro (30 seconds)
"CSS transitions handle state changes on existing elements. Next lesson: Svelte's `transition:` directive — animations for elements entering and leaving the DOM."

---

## Lesson 6.11 — Svelte `transition:` directive — fade, fly, slide, scale, blur, draw

**Duration:** 13 minutes
**Screen setup:** Editor with `.svelte` file, browser showing mount/unmount animations

### Hook (30 seconds)
"Click 'show'. An element appears — fading in, sliding from the side, scaling up from nothing. Click 'hide'. It reverses. CSS transitions can't do this because the element doesn't EXIST before it mounts. Svelte's `transition:` directive handles enter AND exit animations tied to the component lifecycle."

### Demo sequence
1. **[0:30-2:30] Show the problem** — Toggle an element with `{#if}`. It pops in and out instantly. "No animation on mount/unmount. CSS transitions need the element to exist first."
2. **[2:30-5:30] Built-in transitions** — Import `fade`, `fly`, `slide`, `scale`, `blur`, `draw` from `svelte/transition`. Apply `transition:fade`. Then show each one. "Six built-in transitions. Each handles both enter and exit. Import, apply, done."
3. **[5:30-8:00] Parameters** — `transition:fly={{ y: -20, duration: 300 }}`. Customize offset, duration, delay, easing. Show different configurations.
4. **[8:00-10:30] Build the mini-build** — Create a notification toast that flies in from the top, stays for 3 seconds, then fades out. Show multiple toasts stacking with staggered delays.
5. **[10:30-12:30] Edge case / gotcha** — "Transitions are aborted if the condition changes before the transition completes. A rapid show/hide/show skips to the final state. For interruptible animations, use `fly` with shorter durations."

### Key moments (timestamps the editor should chapter-mark)
- 0:30 — "Mount/unmount animation gap"
- 2:30 — "Six built-in transitions"
- 5:30 — "Customizing parameters"
- 8:00 — "Notification toast mini-build"
- 10:30 — "Interrupted transition behavior"

### Callout graphics
- All six transitions demonstrated side by side
- Parameter reference for each transition
- Toast notification component diagram

### Outro (30 seconds)
"Svelte's built-in transitions handle the mount/unmount animation lifecycle automatically. Next lesson: different animations for enter and exit with `in:` and `out:` directives."

---

## Lesson 6.12 — `in:` and `out:` — different enter and exit animations

**Duration:** 10 minutes
**Screen setup:** Editor with `.svelte` file, browser showing asymmetric enter/exit animations

### Hook (30 seconds)
"An element flies in from the left. But when it leaves, it should fade out — not fly back left. `transition:` uses the same animation for both directions. `in:` and `out:` let you choose different animations for enter and exit."

### Demo sequence
1. **[0:30-2:00] The limitation** — `transition:fly` enters and exits with the same fly animation. "Sometimes enter and exit should feel different."
2. **[2:00-5:00] Separate in and out** — `in:fly={{ x: -100 }} out:fade`. Enter: slides from left. Exit: fades. Show the asymmetry.
3. **[5:00-7:00] Use cases** — Modal: `in:scale` (draws attention), `out:fade` (dismissive). Dropdown: `in:slide` (from trigger), `out:fade` (quick dismiss).
4. **[7:00-8:30] Combined with custom timing** — Different durations: `in:fly={{ duration: 500 }} out:fade={{ duration: 200 }}`. Exit is faster than enter — "enters with ceremony, leaves quickly."
5. **[8:30-9:30] Edge case / gotcha** — "You can use `transition:` OR `in:`/`out:` but not both on the same element. They're mutually exclusive. If you use `in:` without `out:`, there's no exit animation."

### Key moments (timestamps the editor should chapter-mark)
- 0:30 — "Asymmetric animations"
- 2:00 — "in: and out: directives"
- 5:00 — "Real-world use cases"
- 7:00 — "Custom timing per direction"
- 8:30 — "Mutual exclusivity"

### Callout graphics
- Enter vs exit animation comparison
- Modal animation pattern diagram
- transition: vs in:/out: decision

### Outro (30 seconds)
"Separate enter and exit animations add polish and intentionality. Next lesson: `animate:flip` — smooth reordering animations for lists."

---

## Lesson 6.13 — `animate:flip` — list reordering animations

**Duration:** 11 minutes
**Screen setup:** Editor with `.svelte` file, browser showing sortable list with smooth animations

### Hook (30 seconds)
"Drag to reorder a list. The items teleport to their new positions. No motion, no continuity — the user loses track of what moved where. FLIP animation makes items smoothly slide to their new positions, maintaining spatial awareness."

### Demo sequence
1. **[0:30-2:30] Show the problem** — Sort a list — items jump instantly. "The brain can't track instant teleportation. Motion gives the brain time to follow."
2. **[2:30-5:00] animate:flip** — Import `flip` from `svelte/animate`. Add `animate:flip` to items inside a keyed `{#each}`. Sort — items smoothly slide. "FLIP: First, Last, Invert, Play. Svelte measures start/end positions, inverts the change, then animates."
3. **[5:00-7:30] Parameters** — `animate:flip={{ duration: 300 }}`. Custom easing. Delay. Show different configurations.
4. **[7:30-9:30] Build the mini-build** — Create a sortable task list: drag handle, reorder, items animate to new positions. Add a sort-by-priority button that triggers a smooth rearrangement.
5. **[9:30-10:30] Edge case / gotcha** — "`animate:flip` only works inside a keyed `{#each}` block. Without keys, Svelte can't track which item is which, and the animation has no 'from' and 'to' to interpolate between."

### Key moments (timestamps the editor should chapter-mark)
- 0:30 — "The teleportation problem"
- 2:30 — "FLIP animation"
- 5:00 — "Animation parameters"
- 7:30 — "Sortable task list"
- 9:30 — "Keys are mandatory"

### Callout graphics
- FLIP algorithm steps diagram
- Sortable list with animation arrows
- Keyed vs unkeyed animation comparison

### Outro (30 seconds)
"FLIP animations make list reordering feel smooth and intentional. Next lesson: `svelte/motion` — animating values over time with `tweened`."

---

## Lesson 6.14 — `svelte/motion` — `tweened` for value interpolation

**Duration:** 11 minutes
**Screen setup:** Editor with `.svelte` file, browser showing animated progress bar and counters

### Hook (30 seconds)
"A progress bar jumps from 30% to 80%. The number counter leaps from 1,000 to 5,000. There's no sense of journey — just departure and arrival. `Tween` from `svelte/motion` interpolates between values over time, turning every numeric change into a smooth animation."

### Demo sequence
1. **[0:30-2:30] Show the problem** — Change a reactive number from 30 to 80. The UI jumps instantly. "Numbers don't have mount/unmount — `transition:` can't help here."
2. **[2:30-5:00] Introduce Tween** — `import { Tween } from 'svelte/motion'`. Create `const progress = new Tween(30)`. Set `progress.target = 80`. Show smooth interpolation.
3. **[5:00-7:30] Configuration** — Duration, easing, delay. Show different easing curves. Show the `Tween` class's `current` property for reading the animated value.
4. **[7:30-9:30] Build the mini-build** — Create a stats dashboard: three numbers (users, revenue, uptime) that animate when data updates. Progress bars that smoothly fill.
5. **[9:30-10:30] Edge case / gotcha** — "`Tween` works with numbers and objects/arrays of numbers. It can't interpolate strings or colors directly. For color interpolation, decompose into numeric components (L, C, H) and interpolate those."

### Key moments (timestamps the editor should chapter-mark)
- 0:30 — "The jumping value problem"
- 2:30 — "Tween: smooth value interpolation"
- 5:00 — "Duration and easing"
- 7:30 — "Stats dashboard mini-build"
- 9:30 — "What Tween can't interpolate"

### Callout graphics
- Value interpolation timeline
- Easing curve comparison chart
- Stats dashboard layout

### Outro (30 seconds)
"Tweened values bring numeric changes to life. Next lesson: `Spring` — physics-based motion that responds to user interaction with bounce and overshoot."

---

## Lesson 6.15 — `svelte/motion` — `Spring` for physics-based motion

**Duration:** 11 minutes
**Screen setup:** Editor with `.svelte` file, browser showing springy cursor follower

### Hook (30 seconds)
"Move your mouse. A circle follows it — but not rigidly. It overshoots, bounces back, settles. It feels ALIVE, like it has mass and momentum. That's spring physics, and `Spring` from `svelte/motion` gives you this effect with three numbers: stiffness, damping, and precision."

### Demo sequence
1. **[0:30-2:30] Tween vs Spring** — Show a tween following the mouse — smooth but robotic. Switch to Spring — bouncy, organic. "Tween follows a fixed curve. Spring simulates physics."
2. **[2:30-5:00] Spring parameters** — Stiffness (higher = snappier), damping (higher = less bounce), precision (when to stop). Show each parameter's effect on the animation.
3. **[5:00-7:30] Build the mini-build** — Create a cursor follower: `Spring` tracking mouse x and y. A card that tilts based on mouse position using spring physics. Show the natural overshoot and settle.
4. **[7:30-9:30] Practical use cases** — Draggable elements that snap back with spring. Slider thumbs with spring response. Modal scale-in with spring bounce.
5. **[9:30-10:30] Edge case / gotcha** — "Spring animations don't have a fixed duration — they run until the spring settles (determined by precision). Don't mix Spring with fixed-duration expectations. If you need a specific duration, use Tween."

### Key moments (timestamps the editor should chapter-mark)
- 0:30 — "Physics-based motion"
- 2:30 — "Stiffness, damping, precision"
- 5:00 — "Cursor follower mini-build"
- 7:30 — "Practical spring use cases"
- 9:30 — "No fixed duration"

### Callout graphics
- Spring physics diagram: stiffness, damping, equilibrium
- Tween vs Spring comparison animation
- Parameter effect visualization

### Outro (30 seconds)
"Spring physics makes interactions feel natural and responsive. Next lesson: custom transition functions — building your own animations from scratch."

---

## Lesson 6.16 — Custom transition functions

**Duration:** 11 minutes
**Screen setup:** Editor with `.svelte` file and custom transition `.ts` file

### Hook (30 seconds)
"The six built-in transitions cover most cases. But what about a typewriter effect? A curtain reveal? A glitch animation? Custom transitions let you write any animation as a function — full control over every CSS property at every point in time."

### Demo sequence
1. **[0:30-2:30] Anatomy of a transition function** — Show the signature: `(node: HTMLElement, params: any) => { duration: number, css: (t: number) => string }`. Explain `t` goes from 0 to 1 on enter, 1 to 0 on exit.
2. **[2:30-5:00] Build a typewriter transition** — Custom function that reveals text character by character using `clip-path` or `max-width`. Show it in action.
3. **[5:00-7:30] Build a curtain reveal** — Custom function that uses `clip-path: inset()` to reveal content from center outward. Show parameters for direction.
4. **[7:30-9:30] The tick function** — Show the `tick` alternative to `css`: `tick: (t) => { node.style.opacity = t }`. Explain when to use `css` (composited, performant) vs `tick` (imperative, flexible).
5. **[9:30-10:30] Edge case / gotcha** — "Custom transitions using `css` run on the compositor thread (smooth). Using `tick` runs on the main thread (can jank). Always prefer `css` unless you need to modify non-CSS properties."

### Key moments (timestamps the editor should chapter-mark)
- 0:30 — "Beyond built-in transitions"
- 2:30 — "Typewriter effect"
- 5:00 — "Curtain reveal"
- 7:30 — "css vs tick"
- 9:30 — "Performance implications"

### Callout graphics
- Transition function anatomy diagram
- t parameter: 0 to 1 timeline
- css (compositor) vs tick (main thread) comparison

### Outro (30 seconds)
"Custom transitions unlock any animation you can imagine. Next lesson: transition parameters, easing functions, and stagger patterns for polished, production-quality animations."

---

## Lesson 6.17 — Transition parameters, easing, and stagger patterns

**Duration:** 11 minutes
**Screen setup:** Editor with `.svelte` file, browser showing staggered list animations

### Hook (30 seconds)
"A list of items fades in. All at once. It looks okay, but not great. Now imagine each item fading in 60 milliseconds after the previous one — a smooth cascade from top to bottom. That's stagger, and combined with easing, it turns basic transitions into cinematic sequences."

### Demo sequence
1. **[0:30-2:30] Easing functions** — Import `cubicOut`, `elasticOut`, `backOut` from `svelte/easing`. Show each applied to a `fly` transition. "Easing controls the acceleration curve. Linear is robotic. Ease-out decelerates naturally."
2. **[2:30-5:00] Stagger with delay** — `{#each items as item, i}` with `transition:fly={{ delay: i * 60 }}`. Show cascade effect.
3. **[5:00-7:30] Advanced stagger** — Stagger from center: `delay: Math.abs(i - center) * 60`. Stagger with random offset: `delay: i * 60 + Math.random() * 40`.
4. **[7:30-9:30] Build the mini-build** — Create a card grid that staggers in with `fly` from below, each card delayed. On filter, remaining cards animate:flip to new positions.
5. **[9:30-10:30] Edge case / gotcha** — "Long stagger lists (100+ items) can feel slow — the last item waits 6+ seconds. Cap the maximum delay: `delay: Math.min(i * 60, 800)`. After the cap, remaining items enter together."

### Key moments (timestamps the editor should chapter-mark)
- 0:30 — "Stagger: the cascade effect"
- 2:30 — "Easing functions"
- 5:00 — "Advanced stagger patterns"
- 7:30 — "Staggered card grid"
- 9:30 — "Long-list delay cap"

### Callout graphics
- Easing function curves comparison chart
- Stagger timeline visualization
- Center-out stagger diagram

### Outro (30 seconds)
"Easing and stagger transform basic transitions into polished animations. Last lesson of this module: respecting users who prefer reduced motion."

---

## Lesson 6.18 — `@media (prefers-reduced-motion: reduce)` — accessible animation

**Duration:** 10 minutes
**Screen setup:** Editor with CSS, System Settings showing reduced-motion toggle

### Hook (30 seconds)
"Some users get physically nauseous from screen animations. Vestibular disorders, motion sensitivity, migraines — your fancy parallax effect can make someone sick. `prefers-reduced-motion` is the operating system's way of telling you: tone it down. Ignoring it is both bad UX and an accessibility failure."

### Demo sequence
1. **[0:30-2:30] The accessibility case** — Show OS settings toggling "Reduce motion". Explain vestibular disorders and motion sensitivity. "This isn't a preference — for some users, it's a medical necessity."
2. **[2:30-5:00] The media query** — `@media (prefers-reduced-motion: reduce) { * { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; } }`. Show animations stopping instantly.
3. **[5:00-7:00] Svelte transitions with reduced motion** — Create a utility: check `window.matchMedia('(prefers-reduced-motion: reduce)')`. Conditionally set `transition:fade={{ duration: prefersReduced ? 0 : 300 }}`.
4. **[7:00-8:30] Graceful degradation** — Instead of removing all motion, reduce it: fade only (no fly), shorter durations, no parallax. "Reduced motion doesn't mean no motion. It means less motion."
5. **[8:30-9:30] Edge case / gotcha** — "Don't check `prefers-reduced-motion` once on mount and cache it. Users can toggle it mid-session. Use `matchMedia.addEventListener('change', ...)` to react dynamically."

### Key moments (timestamps the editor should chapter-mark)
- 0:30 — "Motion can cause physical harm"
- 2:30 — "The prefers-reduced-motion query"
- 5:00 — "Svelte transitions with reduced motion"
- 7:00 — "Graceful degradation vs removal"
- 8:30 — "Dynamic preference changes"

### Callout graphics
- OS reduced-motion settings screenshot
- Before/after: full motion vs reduced motion
- Graceful degradation strategy table

### Outro (30 seconds)
"Respecting motion preferences is non-negotiable accessibility. Module 6 is complete — you've mastered CSS architecture, responsive layout, color systems, and every animation technique Svelte offers. Module 7 introduces GSAP for animations that go beyond what CSS and Svelte can do alone."

---
