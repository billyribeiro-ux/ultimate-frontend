---
module: 4
lesson: 4.5
title: "Nested {#each} — iterating nested data"
duration: 40 minutes
prerequisites:
  - Lesson 4.4 (keyed {#each})
learning_objectives:
  - Model nested data with TypeScript — a parent type containing an array of child types
  - Write an `{#each}` inside another `{#each}` to render a two-level hierarchy
  - Choose correct keys for both the outer and inner loops
  - Recognise when nested iteration should become a child component instead of inline markup
  - Understand that TypeScript types flow across nest levels without re-annotation
status: ready
---

# Lesson 4.5 — Nested {#each}: iterating nested data

## 1. Concept — When the list contains lists

### 1.1 The problem: categories of products

Your product catalogue is organised into categories: *Stationery*, *Tools*, *Accessories*. Each category has its own list of products. You could flatten them into a single array with a `category` field on every product, and that is sometimes the right representation — but for rendering, the natural structure is a tree:

```ts
interface Product { id: string; name: string; }
interface Category { id: string; name: string; products: Product[]; }
const catalogue: Category[] = [/* … */];
```

The page needs to render each category as a section, and within each section render each product as a row. That is *two* levels of iteration.

### 1.2 The syntax: one `{#each}` inside another

Svelte has nothing special for nested lists — you write an `{#each}` inside the body of another `{#each}`. Both loops follow the same rules: a typed entry variable, an optional index, and — most importantly — a key.

```svelte
{#each catalogue as category (category.id)}
    <section>
        <h2>{category.name}</h2>
        <ul>
            {#each category.products as product (product.id)}
                <li>{product.name}</li>
            {/each}
        </ul>
    </section>
{/each}
```

Two keys, two loops, zero ceremony. The inner loop iterates `category.products` — the categories' own field — so the inner list naturally contains exactly the products for that category.

### 1.3 Why both keys matter independently

The outer key (`category.id`) ensures that when a category is reordered or renamed, Svelte reuses its `<section>`. The inner key (`product.id`) ensures that when a product is reordered within its category, Svelte reuses its `<li>`. If you forget either key, you get the "focus jumps" bug from Lesson 4.4, just at the level where you forgot. Every level always needs a key.

### 1.4 When nested iteration becomes a component

At two levels, inline nested `{#each}` is readable. At three levels, it starts to get crowded. At four, it becomes unreadable. The clean fix is to extract the inner loop into its own component:

```svelte
<!-- CategorySection.svelte -->
<script lang="ts">
    interface Props { category: Category; }
    let { category }: Props = $props();
</script>

<section>
    <h2>{category.name}</h2>
    <ul>
        {#each category.products as product (product.id)}
            <li>{product.name}</li>
        {/each}
    </ul>
</section>
```

```svelte
<!-- +page.svelte -->
{#each catalogue as category (category.id)}
    <CategorySection {category} />
{/each}
```

The page now reads at one level of nesting; the component handles its own level. The rule of thumb: **extract a component whenever you find yourself nesting deeper than two `{#each}` blocks in one file**.

### 1.5 Type flow across the nest

Because the outer `category` is typed as `Category`, `category.products` is typed as `Product[]`, and the inner `product` variable is typed as `Product`. TypeScript carries the types across the nest without you re-annotating anything. If you rename `Product.name` to `Product.title`, the inner `{product.name}` becomes a red squiggle immediately.

### 1.6 Reactivity across nests

If `catalogue` is `$state`, both levels react. Adding a product to a category updates only that category's inner list. Adding a whole new category adds a new outer section. As long as your keys are correct, Svelte does the minimum DOM work.

## Deep Dive

**Why this matters at scale.** In production applications, data is rarely flat. Product catalogues have categories containing products. Org charts have departments containing teams containing people. Navigation menus have sections containing items containing sub-items. A 50-component app dealing with hierarchical data needs nested iteration in at least 5-10 places. If developers flatten the data structure to avoid nested `{#each}` (a common anti-pattern), they lose the structural relationship and must reconstruct it with brittle grouping logic in every template. Nested iteration keeps the template aligned with the data shape, making the code self-documenting.

**The mental model.** Think of nested `{#each}` as reading a book's table of contents. The outer loop iterates over chapters (categories). For each chapter, the inner loop iterates over sections (items). The template indentation mirrors the data nesting — two levels of `{#each}` for two levels of nesting. Each level has its own `as` binding and its own optional key. The key principle is that the outer and inner iterations are independent: adding a section to chapter 3 does not affect chapter 4's rendering at all.

**Edge cases.** Variable shadowing is the most common mistake in nested loops. If both the outer and inner item have a `name` field and you destructure both as `{ name }`, the inner one shadows the outer one. Use renaming (`as { name: categoryName }` in the outer loop) or avoid destructuring the outer item when its fields conflict with the inner item. Another edge case: deeply reactive nested data. If your outer array is `$state` and each item contains a reactive inner array, mutations at any level trigger only the appropriate subscriptions — the outer `{#each}` does not re-render its entire body when an inner item changes. Keys at both levels ensure correct DOM reuse.

**Performance implications.** Nested `{#each}` creates DOM nodes proportional to the product of the outer and inner array lengths. For 10 categories × 20 items = 200 DOM nodes, this is trivial. For 100 × 1000 = 100,000 DOM nodes, you need virtualisation. The important optimisation insight: Svelte's reactivity is granular per-node, so updating one inner item touches only that item's DOM — it does not re-render the entire nested structure. This granularity means nested iteration performs well even with moderately large datasets, as long as updates are localised.

**Cross-module connections.** Nested iteration appears in Module 9 (rendering grouped API results), Module 11 (TanStack Table with grouped rows), and Module 13 (generating nested sitemap XML). The pattern of "outer container provides structure, inner content provides detail" mirrors the snippet-prop pattern from Module 3 — sometimes you combine both, with the outer loop providing the container and a snippet prop providing each item's rendering.

## 2. Style it — Sticky category headers

The mini-build uses PE7 tokens for section padding and a small `position: sticky` trick for category headers. As you scroll, each category header stays pinned until the next one pushes it off.

## 3. Interact — Build the nest, then extract the leaf

Start with the whole catalogue inside the page file as two nested `{#each}` blocks. Notice the indentation. Now extract `CategorySection.svelte` and move the inner loop into it. The page file shrinks. The component file gains focus. The rendered HTML is identical.

## 4. Mini-build — A nested catalogue

### Files

- `src/lib/components/CategorySection.svelte` (new)
- `src/routes/modules/04-control-flow/05-nested-each/+page.svelte`

### Key excerpt

```svelte
<script lang="ts">
    import CategorySection from '$lib/components/CategorySection.svelte';
    /* interfaces and data omitted */
</script>

{#each catalogue as category (category.id)}
    <CategorySection {category} />
{/each}
```

### DevTools verification

1. Inspect the DOM. You should see one `<section>` per category and one `<li>` per product, matching the data shape.
2. Scroll the page. The category `<h2>` headers stick to the top until the next category pushes them off.

## 5. Check your understanding

<details>
<summary><strong>Q1.</strong> Does Svelte need anything special for nested loops?</summary>

No. You write one `{#each}` inside another. The only non-obvious rule is that both levels need their own keys.
</details>

<details>
<summary><strong>Q2.</strong> Why is a key required at every level?</summary>

Because each level is an independent list. Reorders, inserts, and deletes can happen at either level. Without a key at that level, Svelte matches positionally and you get the "focus jumps" bug for that level's items.
</details>

<details>
<summary><strong>Q3.</strong> When should you extract the inner loop into a component?</summary>

When the nesting depth passes two levels in one file, when the inner loop reuses markup you want on other pages, or when the inner loop has its own state or handlers.
</details>

<details>
<summary><strong>Q4.</strong> How does TypeScript handle types across a nested loop?</summary>

It carries them through automatically. The outer `category: Category` makes `category.products` a `Product[]`, which makes the inner `product: Product`.
</details>

<details>
<summary><strong>Q5.</strong> If the outer list changes but no inner list changes, does Svelte re-render the inner markup?</summary>

Only for categories whose keys changed. For categories that are still present, Svelte reuses their existing inner DOM entirely.
</details>

## 6. Common mistakes

- **Missing the inner key.** Focus inside the inner loop jumps on inner reorders.
- **Reusing the same variable name at two levels.** `{#each categories as item}{#each item.items as item}` shadows and confuses everyone.
- **Flattening when the tree is correct.** Not every nested render should become a flat list. If the UI is a tree, model it as a tree.
- **Not extracting when the nest grows.** Keep the rule "more than two levels → extract a component" front of mind.

## 7. What's next

Lesson 4.6 introduces `{#key}` — a block that forces Svelte to recreate a subtree when a value changes, useful for resetting animations or destroying stale state.
