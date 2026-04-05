---
chunk: component-architecture
level: 2
penalty: medium
---

# Component Architecture — Level 2 Concept Reveal

A Svelte 5 component library is a collection of `.svelte` files where each file exports exactly one component, and every component has one typed `Props` interface declared inside its `<script lang="ts">` block. The interface is the contract between the component and every caller.

The Svelte 5 building blocks you will use in every component:

- **`$props()`** — declares the component's inputs. Always destructured against a typed interface.
- **`$bindable()`** — marks a prop that can be two-way bound by the parent via `bind:`. Use for form inputs.
- **Snippets** (`{#snippet name()}…{/snippet}`) and `{@render name()}` — reusable markup fragments. The default `children` prop is a snippet representing what the parent put between your component's tags.
- **Callback props** — functions passed in as props, invoked on events. Replace `createEventDispatcher` in Svelte 5.

### Button (pseudocode)

```
interface ButtonProps {
    variant?: 'primary' | 'secondary' | 'ghost'   // default 'primary'
    type?: 'button' | 'submit' | 'reset'          // default 'button'
    disabled?: boolean
    onclick?: (event: MouseEvent) => void
    children: Snippet                              // required
}

render:
    <button type={type} disabled={disabled} class="btn btn--{variant}" onclick={onclick}>
        {@render children()}
    </button>

style:
    min-block-size 44px, padding from --space tokens,
    per-variant background from --color-brand (primary),
    --color-surface-2 (secondary), transparent (ghost).
```

### Input (pseudocode)

```
interface InputProps {
    label: string
    name: string
    value: string                 // $bindable
    type?: 'text' | 'email' | 'password'
    error?: string
}

render:
    <label for={name}>{label}</label>
    <input id={name} name={name} type={type} bind:value />
    {#if error}<p class="input__error">{error}</p>{/if}
```

### PageShell (pseudocode)

```
interface PageShellProps {
    children: Snippet
}

render:
    <a href="#main" class="skip-link">Skip to content</a>
    <header> … nav … </header>
    <main id="main">{@render children()}</main>
    <footer> … </footer>
```

The root `+layout.svelte` imports `PageShell` and passes its own `{ children }` prop into it. That is the single shell for the entire capstone.

### Connecting it to the capstone

Every later chunk imports one or more of these components. The dashboard `Card` wraps the TanStack Table output. The contact form renders `Input` then `Button type="submit"`. The landing page hero's CTA is `Button variant="primary"`. Keep your interfaces minimal at this chunk; you extend them as later chunks demand new props.
