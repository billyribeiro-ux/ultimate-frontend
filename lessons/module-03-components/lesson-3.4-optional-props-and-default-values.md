---
module: 3
lesson: 3.4
title: Optional props and default values
duration: 40 minutes
prerequisites:
  - Lesson 3.3 (TypeScript interfaces for props)
learning_objectives:
  - Mark a prop as optional using the `?` syntax inside a Props interface
  - Provide default values in the `$props()` destructure so the component always has a usable value
  - Understand why "optional" and "nullable" are different concepts in TypeScript
  - Design a component API where 80% of calls pass the minimum number of props
  - Use an optional `src` + fallback pattern for an avatar that gracefully degrades when the image is missing
status: ready
---

# Lesson 3.4 — Optional props and default values

## 1. Concept — A great component is easy to use in the simple case

### 1.1 The problem: too many required props make the common case painful

Once you start putting real interfaces on your components, a new temptation appears: mark *everything* required. "The caller should always tell me the size, the colour, the variant, the alt text, the aria-label, and the icon." This feels rigorous. In practice it makes the component exhausting to use. Every `<Button>` call turns into eight attributes, most of which are the same value every time. Developers start copy-pasting the "full form" from one place and editing just one attribute — which is exactly the copy-paste problem Lesson 3.1 warned us about, reintroduced through the API design.

A well-designed component has a small number of **required** props — the ones the component cannot function without — and a larger number of **optional** props with **sensible defaults** for everything else. When a caller needs the default behaviour, they leave the prop off. When they need something different, they pass it.

### 1.2 How TypeScript spells "optional"

You already saw the `?` syntax in Lesson 1.8 for regular object properties. It works identically in a Props interface:

```ts
interface Props {
    name: string;             // required
    src?: string;             // optional — may be undefined
    size?: 'sm' | 'md' | 'lg'; // optional — may be undefined
}
```

A field with `?` has the implicit type `T | undefined`. The component must handle the case where the value is missing — either by providing a default in the destructure, or by branching on `src === undefined` in the markup.

### 1.3 How Svelte spells "default value"

Defaults live in the destructure, not in the interface:

```svelte
<script lang="ts">
    interface Props {
        name: string;
        src?: string;
        size?: 'sm' | 'md' | 'lg';
    }

    let { name, src, size = 'md' }: Props = $props();
</script>
```

Three important details:

- `name` has no default because it is required — the compiler guarantees a value is always passed.
- `src` has no default; it will be `undefined` if omitted. That is fine because the markup will handle both cases.
- `size` has a default of `'md'`. This means inside the component, `size` is never `undefined` — it is always one of the three allowed strings. The type narrows from `'sm' | 'md' | 'lg' | undefined` to `'sm' | 'md' | 'lg'` the moment you provide the default.

### 1.4 "Optional" vs "nullable": a subtle distinction worth getting right

TypeScript distinguishes between *optional* (`src?: string`, which allows the key to be absent or the value to be `undefined`) and *nullable* (`src: string | null`, which requires the key to be present but allows the value to be `null`). They look similar and behave differently.

In this course we prefer **optional** for props because the natural way a parent "says nothing" in Svelte is to leave the attribute off, which results in `undefined`, not `null`. Use `null` only if you are explicitly modelling "the user chose to clear this field" semantics, which is rare at the prop level.

### 1.5 Designing defaults that make the common case trivial

Think about the three most likely calls of your component. If each of those three calls requires the caller to repeat the same value, that value should be the default. Examples from the course component library:

- `Button` has `variant = 'solid'`, `size = 'md'`, `type = 'button'`. The common case is `<Button>Save</Button>`. Anyone who wants an outlined large submit button writes it out explicitly — and that is a small minority of uses.
- `Avatar` has `size = 'md'`. Most avatars are medium. You pass `size="lg"` only in the header where it is deliberately larger.
- `Badge` has `tone = 'neutral'`. Most badges are informational; the coloured ones are highlights.

If your "common case" call site is longer than three attributes, your defaults are probably wrong.

### 1.6 What it means when an optional prop is omitted at runtime

When a parent writes `<Avatar name="Lee" />`, Svelte's compiled code passes `{ name: 'Lee' }` to the component — there is no `src` key at all. Inside the child, `src` destructures to `undefined`, and `size` destructures to its default `'md'`. The fallback rendering path kicks in and the avatar displays initials instead of an image. The caller never had to think about the `src` case.

This is the "sensible default" pattern in action: the caller stays short, the component stays safe, and the user sees something reasonable in every scenario including the scenario the parent forgot to consider.

## Deep Dive

**Why this matters at scale.** In a production component library used across 50+ pages, the number of required props directly determines developer velocity. Every required prop is a decision the caller must make. A Button with 8 required props means every developer writing a button stops to think 8 times. A Button with 2 required props and 6 optional defaults means most developers write one line and move on. At enterprise scale, multiplied across hundreds of call sites and dozens of developers, the difference between a well-defaulted API and an over-required one is hours of productivity per sprint.

**The mental model.** Think of optional props as knobs on an appliance. A microwave has one required input (what you put inside) and many optional knobs (power level defaults to high, time defaults to 30 seconds, mode defaults to heat). Most users press Start without touching any knob. Power users tune every setting. A well-designed component is the same: the common case requires minimal input, and the advanced cases expose more knobs. If you find yourself always passing the same value for a prop, it should be the default.

**Edge cases.** A common TypeScript trap: destructuring an optional prop without a default leaves it typed as `T | undefined`, and you must handle the undefined case everywhere you use it. Providing a default in the destructure narrows the type to just `T`, eliminating the need for null checks in the rest of the component. Another edge case: `undefined` vs not-passed. In JavaScript, `{ a: undefined }` and `{}` are different — `'a' in obj` returns true for the first and false for the second. Svelte's `$props()` treats both as "the prop was not given a value," so your default kicks in either way. A third edge case: passing `null` explicitly does *not* trigger the default — defaults only apply for `undefined`. If a caller writes `<Avatar src={null} />`, the component receives `null`, not the default.

**Performance implications.** Defaults are evaluated once at component creation time and have negligible cost. However, default values that are *objects* or *arrays* (`items = []`) create a new instance per component mount. For primitives this is irrelevant. For complex defaults, be aware that each instance gets its own copy — which is usually correct (you do not want components sharing a mutable default array) but worth knowing when profiling memory in apps with thousands of instances.

**Cross-module connections.** Optional props with defaults are the backbone of every component API in this course. Module 6's transition components use defaults for duration and easing. Module 7's GSAP action components default animation parameters. Module 12's performance-optimised components use defaults to enable lazy behaviour without opt-in. The principle "require the minimum, default the rest" is a design philosophy that extends beyond props — it applies to function parameters, configuration objects, and API designs throughout the course.

### 1.7 Common interview question

**Q: "What is the difference between an optional prop (`size?: Size`) and a required prop with a default value?"**

**Model answer:** In TypeScript, `size?: Size` means the property can be absent from the object. Inside the component, `size` is typed as `Size | undefined` until you provide a default. A required prop with no `?` must always be passed by the caller — omitting it is a compile error. The Svelte pattern combines both: mark the field optional in the interface (`size?: Size`), then provide a default in the destructure (`size = 'md'`). This gives you the best of both worlds: callers can omit the prop (optional), but inside the component the type is narrowed to `Size` (never undefined). The key insight is that the `?` lives in the interface (the contract) and the default lives in the destructure (the behaviour). Keep them separate.

## Going Deeper

**Official docs to read next:**

- [svelte.dev/docs/svelte/$props](https://svelte.dev/docs/svelte/$props) — default values in the `$props()` destructure.
- [svelte.dev/docs/svelte/typescript](https://svelte.dev/docs/svelte/typescript) — how optional props interact with TypeScript.
- [typescriptlang.org/docs/handbook/2/objects.html#optional-properties](https://www.typescriptlang.org/docs/handbook/2/objects.html#optional-properties) — the `?` modifier reference.

**Advanced pattern: the "80/20" API design.** Design your component's required props to cover the 80% use case with minimum friction:

```ts
// Bad: too many required props
interface ButtonProps {
    label: string;
    variant: 'solid' | 'outline' | 'ghost';
    size: 'sm' | 'md' | 'lg';
    type: 'button' | 'submit' | 'reset';
    disabled: boolean;
}

// Good: one required prop, sensible defaults for the rest
interface ButtonProps {
    children: Snippet;
    variant?: 'solid' | 'outline' | 'ghost';   // defaults to 'solid'
    size?: 'sm' | 'md' | 'lg';                  // defaults to 'md'
    type?: 'button' | 'submit' | 'reset';       // defaults to 'button'
    disabled?: boolean;                           // defaults to false
}
```

The first design requires every caller to think about five decisions. The second requires only one (what text to display). Defaults handle the common case.

**Challenge question (combines Lesson 3.4 + Lesson 3.3 + Lesson 1.4):** Design an `Alert` component with `message` (required), `tone` (optional, defaults to `'info'`), `dismissible` (optional, defaults to `false`), and `onDismiss` (optional callback). Write the interface and the `$props()` destructure. Explain what TypeScript enforces if a caller passes `dismissible={true}` without providing `onDismiss`.

## 2. Style it — Avatar sizes via remapped custom property

The mini-build's `Avatar` component exposes a `size` prop whose only job is to swap the value of `--avatar-size` (a custom property) between `2rem`, `2.75rem`, and `4rem`. Everything else — padding, typography scaling, border radius — is derived from that one variable. Three sizes, one knob.

## 3. Interact — Long call sites, then short ones

Start by writing the `Avatar` with every prop required. Rendering ten avatars means specifying `name`, `src`, and `size` ten times, with `src` often being the same empty string. Now make `src` and `size` optional with `size = 'md'` as the default. Rewrite the parent to pass only `name` for most avatars and add `size="lg"` for one hero avatar. Count the characters you saved. More importantly, imagine a designer asking you to make medium the new default size tomorrow — you edit one line.

## 4. Mini-build — A team list of avatars with initials fallback

### Files

- `src/lib/components/Avatar.svelte` (already scaffolded in the repo — this lesson is when we teach it)
- `src/routes/modules/03-components/04-optional-props/+page.svelte`

### Key excerpt

```svelte
<!-- Avatar.svelte -->
<script lang="ts">
    type Size = 'sm' | 'md' | 'lg';

    interface Props {
        name: string;      // required
        src?: string;      // optional — fall back to initials
        size?: Size;       // optional — defaults to 'md'
    }

    let { name, src, size = 'md' }: Props = $props();

    const initials: string = name
        .split(' ')
        .map((part: string): string => part.charAt(0))
        .join('')
        .slice(0, 2)
        .toUpperCase();
</script>

<span class="avatar avatar--{size}" aria-label={name}>
    {#if src}
        <img {src} alt="" />
    {:else}
        <span class="avatar__initials">{initials}</span>
    {/if}
</span>
```

### DevTools verification

1. Open the page. The first avatar is large and uses an image URL; the rest are medium and fall back to initials.
2. In the Svelte DevTools, click an avatar that omitted `src`. The **Props** panel shows `name: "..."`, `size: "md"`, and `src: undefined`. That undefined is the default-value mechanism working correctly.
3. Hover the `<Avatar>` tag in the parent file. The tooltip distinguishes required vs optional fields with `?`.

## 5. Check your understanding

<details>
<summary><strong>Q1.</strong> What is the difference between `src?: string` and `src: string | undefined`?</summary>

`src?: string` allows the *key itself* to be absent from the parent's call. `src: string | undefined` requires the key to be present but lets the value be undefined. For Svelte props, `?` is the natural form because a missing attribute results in an absent key.
</details>

<details>
<summary><strong>Q2.</strong> Why put the default value in the destructure, not in the interface?</summary>

The interface describes the *shape* of the input — the contract. Defaults are *behaviour* of the component and belong in the runtime script. Keeping them separate means one interface can be shared across components with different defaults.
</details>

<details>
<summary><strong>Q3.</strong> A designer says "make medium the default size for avatars". Where do you make the change?</summary>

One place: the destructure `let { ..., size = 'md' }: Props = $props();`. Every caller that did not specify a size immediately picks up the new default.
</details>

<details>
<summary><strong>Q4.</strong> When you provide a default for an optional prop, what happens to its type inside the component body?</summary>

The type narrows. If the interface says `size?: 'sm' | 'md' | 'lg'`, the raw type is `'sm' | 'md' | 'lg' | undefined`. Once you write `size = 'md'` in the destructure, inside the body `size` has type `'sm' | 'md' | 'lg'` — `undefined` has been eliminated.
</details>

<details>
<summary><strong>Q5.</strong> When is it okay to make *every* prop required?</summary>

Almost never. The only case is an internal, single-purpose component used in exactly one place where you want the type system to force the caller to think about every field. For any reusable component, required props should be the smallest set that the component literally cannot work without.
</details>

## 6. Common mistakes

- **Putting the default value inside the interface.** `size?: 'md' | 'sm' | 'lg' = 'md'` is not valid TypeScript syntax. Defaults live in the destructure, never in the interface.
- **Making an optional prop but never handling `undefined`.** `src?: string` means `src` can be undefined. Either provide a default or branch on its presence in the markup.
- **Defaulting to an empty string to "avoid undefined".** `label = ''` is a code smell if an empty label produces a visual bug. Better to leave it required, or model "no label" with a boolean `hidden?` prop.
- **Marking too many props as required because it feels thorough.** Rigour without ergonomics makes a component nobody wants to use. Default aggressively; require only what is truly essential.

## 7. What's next

Lesson 3.5 introduces `$bindable()` — the one carefully controlled way a child can write back to a parent's state, enabling two-way bindings on form inputs.
