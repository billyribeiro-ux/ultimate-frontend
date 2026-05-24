# Module 3 — Components: Video Lecture Script Outlines

> **Recording note:** Set editor font to 18px minimum. Have two `.svelte` files open side-by-side (parent and child) for most lessons. Browser preview with DevTools Elements panel accessible.

---

## Lesson 3.1 — What components are and why they exist

**Duration:** 11 minutes
**Screen setup:** Editor showing a single monolithic `.svelte` file (300+ lines), then split into components

### Hook (30 seconds)
"You're staring at a 500-line `.svelte` file. There's a navbar, a hero section, a card grid, a footer — all tangled together. You need to change the card's border radius and you're terrified of breaking the navbar. Components exist because no human should maintain a 500-line single file. Let me show you the split."

### Demo sequence
1. **[0:30-2:30] Show the problem** — Scroll through a monolithic page with repeated patterns. Highlight three identical card blocks with copy-pasted code. "Copy-paste is a maintenance bomb. Change one card, forget the others, ship a broken UI."
2. **[2:30-5:00] Extract the first component** — Create `Card.svelte`. Move the card markup, styles, and logic. Import it in the parent: `import Card from './Card.svelte'`. Use it: `<Card />`. Show it renders identically. "One file per concern. Every component owns its markup, its logic, and its styles."
3. **[5:00-7:30] Reuse** — Use `<Card />` three times. Change the border radius in the component file — all three update. "Change once, update everywhere. This is the fundamental promise of components."
4. **[7:30-9:30] Component mental model** — Diagram overlay: components as a tree. Page -> Layout -> Navbar, Content -> Card, Card, Card. "Your app is a tree of components. Data flows down through props. Events flow up through callbacks. Each node is isolated and reusable."
5. **[9:30-10:30] Edge case / gotcha** — "Don't over-componentize. A `<Button>` makes sense. A `<ButtonTextInsideTheButton>` does not. If a piece of UI is used once and is tightly coupled to its parent, leaving it inline is fine. Components should represent reusable or logically distinct units."

### Key moments (timestamps the editor should chapter-mark)
- 0:30 — "The 500-line file problem"
- 2:30 — "Extracting your first component"
- 5:00 — "Reuse: change once, update everywhere"
- 7:30 — "The component tree mental model"
- 9:30 — "When NOT to componentize"

### Callout graphics
- Before/after: monolithic file vs component tree
- Component tree diagram with data flow arrows
- Rule of thumb: "Extract when it's reused OR logically distinct"

### Outro (30 seconds)
"Components are the atoms of your UI. Next lesson, we make them configurable with `$props()` — passing data from parent to child so each instance can be unique."

---

## Lesson 3.2 — $props(): passing data into components

**Duration:** 12 minutes
**Screen setup:** Editor with parent and child `.svelte` files side by side, browser preview

### Hook (30 seconds)
"Three cards. Same component. Different titles, different images, different descriptions. How does one component render three different ways? Props — the inputs that make components flexible. In Svelte 5, you declare them with `$props()`, and the syntax is cleaner than any framework."

### Demo sequence
1. **[0:30-2:30] Show the problem** — Three hardcoded `<Card />` components, all showing the same content. "Right now, Card is a stamp — the same image every time. Props turn it into a template."
2. **[2:30-5:30] Introduce $props()** — In `Card.svelte`: `let { title, description, image } = $props()`. Use them in markup: `<h2>{title}</h2>`. In parent: `<Card title="First" description="..." image="..." />`. Show three cards with different content. "Destructured from `$props()`. Clean, explicit, and TypeScript-ready."
3. **[5:30-8:00] Rest props** — Show `let { title, ...rest } = $props()`. Spread onto an element: `<div {...rest}>`. Pass `class`, `id`, `data-*` attributes from parent — they appear on the div. "Rest props forward any attribute the parent passes that the component doesn't explicitly declare."
4. **[8:00-10:30] Build the mini-build** — Create a `ProfileCard` component with name, role, avatar, and social links props. Use it three times with different data. Show a responsive grid of profile cards. "A real-world component: multiple props, used multiple times, each instance unique."
5. **[10:30-11:30] Edge case / gotcha** — "Accessing a prop you didn't destructure silently gives `undefined`. There's no runtime error. Enable TypeScript interfaces (next lesson) so the compiler catches missing props before the page renders."

### Key moments (timestamps the editor should chapter-mark)
- 0:30 — "The stamp problem"
- 2:30 — "Declaring props with $props()"
- 5:30 — "Rest props and spreading"
- 8:00 — "Building a real component"
- 10:30 — "Missing prop = silent undefined"

### Callout graphics
- Data flow diagram: parent -> $props() -> child markup
- Rest props spreading diagram
- ProfileCard component anatomy

### Outro (30 seconds)
"Props make components flexible and reusable. But right now, TypeScript doesn't know what props your component accepts. Next lesson, we add interfaces — turning props into a typed contract between parent and child."

---

## Lesson 3.3 — TypeScript interfaces for props

**Duration:** 11 minutes
**Screen setup:** Editor with parent and child files, TypeScript error popups visible

### Hook (30 seconds)
"You pass `titl` instead of `title` to a component. No error. The component renders with a blank heading. You don't notice for three days. TypeScript interfaces on props catch that typo instantly — a red squiggly in the parent, before you even save."

### Demo sequence
1. **[0:30-2:30] Show the problem** — Pass a mistyped prop to an untyped component. No error, blank output. "Silent failure, again. The same class of bug we solved with interfaces in Lesson 1.8 — now applied to component boundaries."
2. **[2:30-5:00] Type the props** — Define: `interface Props { title: string; description: string; count: number; }`. Destructure: `let { title, description, count }: Props = $props()`. Pass a wrong type from parent — red squiggly. "The interface is the API contract of your component. Every consumer gets autocomplete and error checking."
3. **[5:00-7:30] IntelliSense in the parent** — Show that the parent component now has autocomplete when typing `<Card `. All valid props listed. Mouse over — see types. "Your component is self-documenting. The interface IS the documentation."
4. **[7:30-9:30] Exporting types** — Show how to export the interface for use in other files: define in a separate `.ts` file, import in both parent and child. "For complex apps, keep prop interfaces in a shared types file. Every component that uses `User` imports the same definition."
5. **[9:30-10:30] Edge case / gotcha** — "Don't use `interface Props` with rest props and expect TypeScript to catch unknown attributes. Use `interface Props` for your explicit props and `[key: string]: any` for the rest — or use `ComponentProps<Card>` to extract the type from a component."

### Key moments (timestamps the editor should chapter-mark)
- 0:30 — "The mistyped prop trap"
- 2:30 — "Typing props with interfaces"
- 5:00 — "Autocomplete in parent components"
- 7:30 — "Sharing interfaces across files"
- 9:30 — "Typing rest props"

### Callout graphics
- Before/after: untyped vs typed prop error catching
- IntelliSense screenshot in parent component
- Shared types file diagram

### Outro (30 seconds)
"Typed props give you compile-time guarantees across component boundaries. Next lesson: not every prop is required. We'll add optional props and default values so components work even when parents don't pass everything."

---

## Lesson 3.4 — Optional props and default values

**Duration:** 10 minutes
**Screen setup:** Editor with component file, showing optional prop syntax

### Hook (30 seconds)
"A Button component needs a `label`. But `variant`? That should default to 'primary'. `disabled`? Default to false. `size`? Default to 'md'. Making every prop required forces every parent to pass values that are almost always the same. Defaults fix that."

### Demo sequence
1. **[0:30-2:30] Show the problem** — A component with five required props. Every usage passes all five, even though three are always the same value. "Boilerplate at every call site. If the default is 'primary' for 90% of uses, make it the default."
2. **[2:30-5:00] Optional props with defaults** — Show: `let { label, variant = 'primary', size = 'md', disabled = false }: Props = $props()`. Mark in interface: `variant?: 'primary' | 'secondary'`. Use the component with just `<Button label="Submit" />` — defaults kick in. "Optional in the interface, defaulted in the destructuring. Two pieces, one clean API."
3. **[5:00-7:30] Override defaults** — Show `<Button label="Cancel" variant="secondary" size="lg" />` — overrides take effect. Show in browser that the default component looks different from the overridden one. "Defaults are just that — defaults. Pass a value and it wins."
4. **[7:30-8:30] DevTools verification** — Inspect the rendered buttons. Show the correct classes/styles applied based on defaults vs overrides. "The DOM proves the defaults are working. Each button has the correct variant class."
5. **[8:30-9:30] Edge case / gotcha** — "Default values are evaluated once when the component mounts — they're not reactive. If you need a default that changes based on other state, use `$derived`: `let computedVariant = $derived(variant ?? (isError ? 'danger' : 'primary'))`."

### Key moments (timestamps the editor should chapter-mark)
- 0:30 — "The required-prop tax"
- 2:30 — "Defaults in destructuring"
- 5:00 — "Overriding defaults"
- 7:30 — "Verifying in DevTools"
- 8:30 — "Reactive defaults"

### Callout graphics
- Component API table: prop, type, default, required?
- Code comparison: with vs without defaults at the call site

### Outro (30 seconds)
"Optional props with defaults create clean, flexible component APIs. Most of the time, data flows one way — parent to child. But sometimes you need two-way binding. Next lesson: `$bindable()` and the controlled-component pattern."

---

## Lesson 3.5 — $bindable(): two-way data binding

**Duration:** 11 minutes
**Screen setup:** Editor with parent and child component, browser showing form inputs

### Hook (30 seconds)
"A parent renders an input component. The user types. The value lives in the child. But the parent needs it for form submission. Do you lift state up with callbacks? Fire custom events? In Svelte, you `bind:` — and the child's internal state syncs back to the parent automatically."

### Demo sequence
1. **[0:30-2:30] Show the problem** — Parent passes `value` to child input. User types — child updates locally. Parent still shows the old value. "One-way data flow means the parent is out of date. You need the value to flow back up."
2. **[2:30-5:00] Introduce $bindable** — In child: `let { value = $bindable('') }: Props = $props()`. In parent: `<Input bind:value={name} />`. Type in the input — parent's `name` updates in real time. "Two-way binding. The parent and child share the same piece of state."
3. **[5:00-7:30] Multiple bindings** — Show a color picker component with `bind:hue`, `bind:saturation`, `bind:lightness`. All three values sync bidirectionally. "Each bindable prop is an independent two-way channel."
4. **[7:30-9:30] Build the mini-build** — Create a reusable `TextInput` component with `bind:value`, label, error message, and validation. Use three instances in a form — all bound to parent state. Show form submission using the parent's bound values. "A real form with three input components, all synced to the parent's form state."
5. **[9:30-10:30] Edge case / gotcha** — "Two-way binding creates tight coupling between parent and child. Use it for form inputs and UI controls. Don't use it for data that should flow one way — like a user ID from a database. If in doubt, use a callback prop instead."

### Key moments (timestamps the editor should chapter-mark)
- 0:30 — "The one-way data gap"
- 2:30 — "$bindable and bind:"
- 5:00 — "Multiple bindings"
- 7:30 — "Building a real form"
- 9:30 — "When NOT to bind"

### Callout graphics
- Data flow diagram: one-way (props) vs two-way (bind)
- Form component architecture with bind arrows
- Decision: "bind: vs callback prop"

### Outro (30 seconds)
"Two-way binding with `$bindable()` is Svelte's answer to controlled inputs. Clean, typed, and automatic. Next lesson, we go beyond props with Snippets — Svelte's way to pass markup, not just data, between components."

---

## Lesson 3.6 — Snippets: {#snippet} and {@render}

**Duration:** 12 minutes
**Screen setup:** Editor with parent and child files, browser showing rendered slots/snippets

### Hook (30 seconds)
"You build a Card component. It has a header, a body, and a footer. But the CONTENT of each section is different for every use case — sometimes plain text, sometimes an image gallery, sometimes a form. You can't pass HTML as a string prop. You need to pass markup as a first-class concept. That's what Snippets do."

### Demo sequence
1. **[0:30-2:30] Show the problem** — Try passing HTML as a string prop: `<Card body="<strong>Bold</strong>" />`. It renders as escaped text, not HTML. "Props are values, not markup. You need a way to pass renderable content."
2. **[2:30-5:30] Introduce {#snippet}** — In parent: define `{#snippet body()}<p>Custom content with <strong>bold text</strong></p>{/snippet}`. In child: receive as a prop and render with `{@render body()}`. Show the rendered output with proper HTML. "Snippets are named, reusable blocks of markup that you pass as props. Think of them as 'template fragments.'"
3. **[5:30-8:00] Children snippet** — Show the default `children` snippet: `<Card><p>This becomes the children snippet</p></Card>`. In Card: `{@render children?.()}`. "Content between component tags is automatically available as the `children` snippet — no explicit naming needed."
4. **[8:00-10:30] Multiple named snippets** — Create a Card with `header`, `body`, and `footer` snippets. Parent provides all three. Show each rendering in its designated section. "Named snippets give you complete control over multiple insertion points in a component."
5. **[10:30-11:30] Edge case / gotcha** — "Snippets replace Svelte 4's `<slot>` syntax entirely. If you see `<slot>` in a tutorial, it's outdated. Snippets are more powerful — they can accept parameters, which we cover next lesson."

### Key moments (timestamps the editor should chapter-mark)
- 0:30 — "Passing markup, not strings"
- 2:30 — "Your first snippet"
- 5:30 — "The children shorthand"
- 8:00 — "Multiple named snippets"
- 10:30 — "Slots are dead, long live snippets"

### Callout graphics
- Diagram: snippet flow from parent to child render point
- Children snippet shorthand illustration
- Multi-snippet Card layout diagram

### Outro (30 seconds)
"Snippets let you compose components with markup, not just data. Next lesson, we level up by passing snippets with parameters — typed template fragments that receive data from the child and render it in the parent's context."

---

## Lesson 3.7 — Passing snippets as props (Snippet<T>)

**Duration:** 11 minutes
**Screen setup:** Editor with parent and child files showing typed snippet parameters

### Hook (30 seconds)
"A DataTable component iterates over rows. But you — the parent — decide how each cell renders. The child has the data. The parent has the template. Typed snippets bridge both: the child passes row data UP through the snippet parameter, and the parent renders it however it wants."

### Demo sequence
1. **[0:30-2:30] Show the problem** — A table component that hardcodes cell rendering. To change how a column displays, you'd have to modify the component itself. "Tight coupling. Every display variation requires editing the library component."
2. **[2:30-5:30] Snippet with parameters** — In parent: `{#snippet row(item: User)}<td>{item.name}</td><td>{item.email}</td>{/snippet}`. In child: `{@render row(user)}` inside a loop. "The child provides the data. The parent provides the template. Both are typed."
3. **[5:30-8:00] Typing with Snippet<T>** — Import `Snippet` from `'svelte'`. In child props: `row: Snippet<[User]>`. Show TypeScript catching wrong parameter types. "The generic ensures the snippet receives the right data type. Pass a `number` when it expects `User` — compile error."
4. **[8:00-9:30] Build the mini-build** — Create a generic List component: accepts `items` and a `row` snippet. Parent defines how each item renders. Use it for a user list and a product list — same component, different rendering. "One List component. Two completely different visual outputs. This is the render-prop pattern, Svelte-style."
5. **[9:30-10:30] Edge case / gotcha** — "Snippets have access to the parent's scope, not the child's. If you need data from the child, it MUST come through the snippet parameter. Don't try to access the child's local variables — they don't exist in the snippet's closure."

### Key moments (timestamps the editor should chapter-mark)
- 0:30 — "The hardcoded rendering problem"
- 2:30 — "Snippets with parameters"
- 5:30 — "Typing with Snippet<T>"
- 8:00 — "Generic list component"
- 9:30 — "Scope boundaries"

### Callout graphics
- Data flow diagram: child data -> snippet parameter -> parent template -> rendered output
- Snippet<T> type annotation syntax
- Render-prop pattern comparison: React vs Svelte

### Outro (30 seconds)
"Typed snippets give you the flexibility of render props with the type safety of generics. Next lesson, we explore component composition patterns — how to combine components into larger, more powerful structures."

---

## Lesson 3.8 — Component composition patterns

**Duration:** 12 minutes
**Screen setup:** Editor with multiple component files, browser showing composed UI

### Hook (30 seconds)
"A Tabs component needs Tab children. A Form needs FormField children. A Dialog needs a trigger, a title, and content. These aren't simple parent-child relationships — they're coordinated ensembles. Component composition patterns give you the vocabulary to build them right."

### Demo sequence
1. **[0:30-2:30] Show the problem** — A monolithic Tabs component that takes arrays of `titles` and `contents` as props. Adding a new tab means updating three arrays in sync. "Parallel arrays are fragile. One index off and the wrong content shows under the wrong tab."
2. **[2:30-5:00] Container + item pattern** — Create `<Tabs>` and `<Tab>` components. Usage: `<Tabs><Tab title="Info">...</Tab><Tab title="Settings">...</Tab></Tabs>`. The container manages state, the items declare content. "The container owns the logic. The items own the content. They compose naturally."
3. **[5:00-7:30] Wrapper pattern** — Create a `<Card>` that wraps children with consistent padding, border, shadow. Use it to wrap arbitrary content: forms, images, text. "Wrappers add layout and style without knowing or caring about their children."
4. **[7:30-10:00] Build the mini-build** — Build a complete `Accordion` with `AccordionItem` children. Container tracks which item is open. Items handle their own trigger and content. Context API connects them. Show expand/collapse with animation. "Container, items, context — the composition triad. Master this and you can build any compound component."
5. **[10:00-11:30] Edge case / gotcha** — "Composition works with the component tree. If you dynamically create components with `{#each}`, make sure keys are stable. Unstable keys cause components to remount, losing their internal state."

### Key moments (timestamps the editor should chapter-mark)
- 0:30 — "The parallel-arrays anti-pattern"
- 2:30 — "Container + Item"
- 5:00 — "Wrapper pattern"
- 7:30 — "Accordion mini-build"
- 10:00 — "Key stability matters"

### Callout graphics
- Three composition patterns: Container+Item, Wrapper, Compound
- Accordion component tree diagram
- Context API data flow in compound components

### Outro (30 seconds)
"Composition patterns let you build complex UIs from simple, reusable pieces. Next lesson, we use CSS custom properties as the bridge — passing style tokens from parent to child without breaking encapsulation."

---

## Lesson 3.9 — CSS custom properties as the bridge

**Duration:** 10 minutes
**Screen setup:** Editor with parent and child files, browser showing themed components

### Hook (30 seconds)
"Your Card component has a blue border. But on the pricing page, you need it orange. On the error page, red. Do you add a `borderColor` prop? A `variant` prop with five values? What about the next color someone needs? CSS custom properties let the parent set any style without the child knowing every possibility."

### Demo sequence
1. **[0:30-2:30] Show the problem** — A component with a `variant` prop that maps to colors. Adding a new variant requires editing the component, adding CSS, adding to the type union. "Every new color is a code change in the component library. That doesn't scale."
2. **[2:30-5:00] Pass custom properties** — Parent: `<Card --card-border="oklch(70% 0.2 30)" />`. Child: uses `var(--card-border, oklch(65% 0.25 260))` in its styles. "The parent sets the property. The child uses it with a fallback default. No prop, no variant, no component change."
3. **[5:00-7:30] Theming with properties** — Pass multiple properties: `--card-bg`, `--card-text`, `--card-radius`. Show a card that looks completely different based on parent-set properties. "Full visual customization without a single prop. The component's styles are open for extension but closed for modification."
4. **[7:30-8:30] DevTools verification** — Inspect the component in DevTools. Show the `style` attribute on the wrapper element with the custom properties. Show the computed values in the Styles panel. "Custom properties are visible in DevTools. You can tweak them live."
5. **[8:30-9:30] Edge case / gotcha** — "Svelte applies `--custom-property` as a `style` attribute on a wrapper `<div>`. If you don't want the extra wrapper, use `<svelte:element>` or apply the property to an existing element. The extra div can break flex/grid layouts."

### Key moments (timestamps the editor should chapter-mark)
- 0:30 — "The variant explosion problem"
- 2:30 — "Custom properties from parent"
- 5:00 — "Full theming"
- 7:30 — "Inspecting in DevTools"
- 8:30 — "The wrapper div trap"

### Callout graphics
- Comparison: variant props vs custom properties approach
- DevTools screenshot showing custom properties
- Diagram: parent sets property -> child reads with fallback

### Outro (30 seconds)
"CSS custom properties are the styling escape hatch that keeps components flexible without bloating their API. Last lesson of this module: responsive components that adapt to their container, not the viewport."

---

## Lesson 3.10 — Responsive components with container queries

**Duration:** 11 minutes
**Screen setup:** Editor with component file, browser showing component in different container widths

### Hook (30 seconds)
"Media queries ask: 'How wide is the viewport?' Container queries ask: 'How wide is MY container?' A card in a full-width layout should look different from the same card in a sidebar. The viewport didn't change — the container did. Container queries make components truly self-aware."

### Demo sequence
1. **[0:30-2:30] Show the problem** — Same Card component in a sidebar (300px) and a main content area (800px). Media queries show/hide based on viewport — but the card in the sidebar needs the 'narrow' layout even on a wide screen. "Media queries are page-aware. Components need to be self-aware."
2. **[2:30-5:00] Introduce container queries** — Add `container-type: inline-size` to a wrapper. Write `@container (min-width: 400px) { ... }`. Show the card switching from stacked to horizontal layout based on its container width. "The card responds to its own container, not the browser window. Resize the sidebar — the card adapts."
3. **[5:00-7:30] Container query units** — Use `cqi` (container inline size) for fluid sizing within the container. `font-size: clamp(0.875rem, 3cqi, 1.25rem)`. "Container query units: `cqi`, `cqb`, `cqmin`, `cqmax`. Fluid sizing relative to the component's container."
4. **[7:30-9:30] Build the mini-build** — Create a `ProductCard` that shows a vertical layout in narrow containers and a horizontal layout in wide containers. Place it in a 2-column grid and a single-column sidebar. Same component, adaptive layout. "One component. No props for layout. It just knows."
5. **[9:30-10:30] Edge case / gotcha** — "`container-type: inline-size` creates a new containing block for absolutely positioned children. If you have `position: absolute` elements inside, they'll now be positioned relative to the container, not the page. This can break existing layouts."

### Key moments (timestamps the editor should chapter-mark)
- 0:30 — "Media query blindness"
- 2:30 — "Container queries: self-aware components"
- 5:00 — "Container query units"
- 7:30 — "Adaptive ProductCard"
- 9:30 — "The positioning side effect"

### Callout graphics
- Side-by-side: media query vs container query behavior
- Container query unit reference (cqi, cqb, cqmin, cqmax)
- ProductCard layout switch diagram

### Outro (30 seconds)
"Container queries make components respond to their context, not the global viewport. Module 3 is complete — you can now build typed, composable, styled, responsive components. Module 4 introduces control flow: conditional rendering, loops, and async data handling."

---
