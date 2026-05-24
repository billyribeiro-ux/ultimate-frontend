# Build an E-Commerce Store — Complete Walkthrough

> **Time:** ~10 hours | **Modules referenced:** M2, M4, M6, M8, M9A, M10, M11, M12, M13, M15
> **What you'll build:** A complete e-commerce store with product listings using `{#each}` with keys, dynamic `[slug]` product detail pages, a reactive shopping cart built as a class in `.svelte.ts`, checkout with Valibot validation, SSG for product pages, SSR for search, JSON-LD Product schema, optimized images, and OKLCH-branded product cards with container queries.
> **Prerequisites:** Complete through Module 13 (SEO)

## Table of contents

1. [Project setup](#1-project-setup)
2. [PE7 CSS tokens with brand personality](#2-pe7-css-tokens-with-brand-personality)
3. [Product data layer](#3-product-data-layer)
4. [Product listing with {#each} and keys](#4-product-listing-with-each-and-keys)
5. [Product detail with [slug] dynamic route](#5-product-detail-with-slug-dynamic-route)
6. [Shopping cart as a reactive class](#6-shopping-cart-as-a-reactive-class)
7. [Cart sidebar component](#7-cart-sidebar-component)
8. [Checkout form with Valibot validation](#8-checkout-form-with-valibot-validation)
9. [SSG for product pages, SSR for search](#9-ssg-for-product-pages-ssr-for-search)
10. [Search page with SSR](#10-search-page-with-ssr)
11. [JSON-LD Product schema](#11-json-ld-product-schema)
12. [Image optimization with srcset](#12-image-optimization-with-srcset)
13. [OKLCH-branded product cards with container queries](#13-oklch-branded-product-cards-with-container-queries)
14. [Stripe-style payment flow mock](#14-stripe-style-payment-flow-mock)
15. [Performance and accessibility audit](#15-performance-and-accessibility-audit)
16. [Deployment](#16-deployment)
17. [Final result](#17-final-result)
18. [What you practiced](#18-what-you-practiced)

---

## 1. Project setup

```bash
pnpm create svelte@latest ecommerce-store
```

Select: Skeleton project, TypeScript, Prettier + ESLint.

```bash
cd ecommerce-store
pnpm install
pnpm add valibot
pnpm add -D @sveltejs/adapter-static @sveltejs/adapter-node
```

Configure strict TypeScript:

```json
{
  "extends": "./.svelte-kit/tsconfig.json",
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "moduleResolution": "bundler"
  }
}
```

Update `svelte.config.js`:

```js
import adapter from '@sveltejs/adapter-node';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
  preprocess: vitePreprocess(),
  kit: {
    adapter: adapter()
  }
};

export default config;
```

### File tree after step 1

```
ecommerce-store/
├── src/
│   ├── app.html
│   ├── app.d.ts
│   └── routes/
│       └── +page.svelte
├── svelte.config.js
├── tsconfig.json
├── vite.config.ts
└── package.json
```

---

## 2. PE7 CSS tokens with brand personality

This store uses a warm, luxury brand palette. We choose OKLCH hues in the amber-gold range (Lesson 6.2 — OKLCH color system in depth) to create an inviting shopping atmosphere. This is the per-page color personality concept from Lesson 6.9.

Create `src/app.css`:

```css
@layer reset, tokens, base, layout, components, utilities;

@layer reset {
  *, *::before, *::after {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  html {
    -webkit-text-size-adjust: 100%;
    text-size-adjust: 100%;
  }

  body {
    min-block-size: 100dvh;
    -webkit-font-smoothing: antialiased;
  }

  img, picture, video, canvas, svg {
    display: block;
    max-inline-size: 100%;
  }

  input, button, textarea, select {
    font: inherit;
    color: inherit;
  }

  ul, ol { list-style: none; }
}

@layer tokens {
  :root {
    /* Brand colors — warm amber OKLCH palette */
    --color-primary: oklch(0.68 0.14 65);
    --color-primary-hover: oklch(0.62 0.16 65);
    --color-secondary: oklch(0.55 0.08 30);
    --color-accent: oklch(0.75 0.12 85);
    --color-surface: oklch(0.98 0.005 80);
    --color-surface-alt: oklch(1 0 0);
    --color-surface-elevated: oklch(0.96 0.008 75);
    --color-text: oklch(0.20 0.02 60);
    --color-text-muted: oklch(0.50 0.02 60);
    --color-border: oklch(0.88 0.01 70);
    --color-success: oklch(0.72 0.19 145);
    --color-warning: oklch(0.80 0.18 85);
    --color-error: oklch(0.65 0.22 25);

    /* Spacing */
    --space-xs: 0.25rem;
    --space-sm: 0.5rem;
    --space-md: 1rem;
    --space-lg: 1.5rem;
    --space-xl: 2rem;
    --space-2xl: 3rem;
    --space-3xl: 4rem;

    /* Typography */
    --text-xs: clamp(0.7rem, 0.65rem + 0.25vw, 0.75rem);
    --text-sm: clamp(0.8rem, 0.75rem + 0.25vw, 0.875rem);
    --text-base: clamp(0.9rem, 0.85rem + 0.25vw, 1rem);
    --text-lg: clamp(1rem, 0.9rem + 0.5vw, 1.125rem);
    --text-xl: clamp(1.15rem, 1rem + 0.75vw, 1.25rem);
    --text-2xl: clamp(1.4rem, 1.1rem + 1.5vw, 1.75rem);
    --text-3xl: clamp(1.8rem, 1.4rem + 2vw, 2.25rem);
    --text-4xl: clamp(2.2rem, 1.6rem + 3vw, 3rem);

    /* Motion */
    --dur-instant: 100ms;
    --dur-fast: 200ms;
    --dur-normal: 300ms;
    --dur-slow: 500ms;
    --ease-out: cubic-bezier(0.0, 0.0, 0.2, 1);
    --ease-in: cubic-bezier(0.4, 0.0, 1, 1);
    --ease-in-out: cubic-bezier(0.4, 0.0, 0.2, 1);

    /* Radius */
    --radius-sm: 0.375rem;
    --radius-md: 0.5rem;
    --radius-lg: 0.75rem;
    --radius-full: 9999px;

    /* Shadows */
    --shadow-sm: 0 1px 3px oklch(0 0 0 / 0.08);
    --shadow-md: 0 4px 12px oklch(0 0 0 / 0.1);
    --shadow-lg: 0 8px 30px oklch(0 0 0 / 0.12);

    /* Layout */
    --content-max: 72rem;
  }
}

@layer base {
  body {
    font-family: system-ui, -apple-system, sans-serif;
    font-size: var(--text-base);
    line-height: 1.6;
    color: var(--color-text);
    background: var(--color-surface);
  }

  h1, h2, h3, h4 {
    line-height: 1.2;
    text-wrap: balance;
  }

  a {
    color: var(--color-primary);
    text-decoration: none;
    transition: color var(--dur-fast) var(--ease-out);

    &:hover { color: var(--color-primary-hover); }
  }

  :focus-visible {
    outline: 2px solid var(--color-primary);
    outline-offset: 2px;
  }
}

@layer layout {
  .container {
    max-inline-size: var(--content-max);
    margin-inline: auto;
    padding-inline: var(--space-lg);
  }
}

@layer utilities {
  .sr-only {
    position: absolute;
    inline-size: 1px;
    block-size: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border-width: 0;
  }
}
```

---

## 3. Product data layer

For this walkthrough, we use a static product catalog stored in a TypeScript module. In production, this would come from a CMS or database (Module 16). Using a typed static catalog lets us focus on the frontend patterns without infrastructure overhead.

Create `src/lib/data/products.ts`:

```ts
export interface Product {
  id: string;
  slug: string;
  name: string;
  description: string;
  longDescription: string;
  price: number;
  compareAtPrice?: number;
  currency: string;
  images: {
    src: string;
    alt: string;
    width: number;
    height: number;
  }[];
  category: string;
  tags: string[];
  inStock: boolean;
  rating: number;
  reviewCount: number;
  brand: string;
  sku: string;
}

export const products: Product[] = [
  {
    id: 'prod-001',
    slug: 'artisan-leather-tote',
    name: 'Artisan Leather Tote',
    description: 'Hand-stitched full-grain leather tote with brass hardware.',
    longDescription: 'Crafted from the finest full-grain Italian leather, this tote bag features hand-stitched seams, solid brass hardware, and a cotton canvas lining. The generous interior includes a zippered pocket and two slip pockets for organization. Each bag develops a unique patina with use, making it truly one of a kind.',
    price: 285,
    compareAtPrice: 350,
    currency: 'USD',
    images: [
      { src: '/products/leather-tote-1.jpg', alt: 'Artisan Leather Tote — front view', width: 800, height: 1000 },
      { src: '/products/leather-tote-2.jpg', alt: 'Artisan Leather Tote — detail of brass clasp', width: 800, height: 1000 }
    ],
    category: 'bags',
    tags: ['leather', 'handmade', 'tote'],
    inStock: true,
    rating: 4.8,
    reviewCount: 124,
    brand: 'Atelier Craft',
    sku: 'AC-LT-001'
  },
  {
    id: 'prod-002',
    slug: 'merino-wool-scarf',
    name: 'Merino Wool Scarf',
    description: 'Ultra-soft merino wool scarf in heathered charcoal.',
    longDescription: 'Woven from 100% Australian merino wool, this scarf is incredibly soft against the skin. The heathered charcoal colorway pairs with everything from denim to tailoring. Finished with subtle fringe edges and a hand-rolled hem.',
    price: 95,
    currency: 'USD',
    images: [
      { src: '/products/wool-scarf-1.jpg', alt: 'Merino Wool Scarf — draped view', width: 800, height: 1000 }
    ],
    category: 'accessories',
    tags: ['wool', 'scarf', 'winter'],
    inStock: true,
    rating: 4.6,
    reviewCount: 89,
    brand: 'Atelier Craft',
    sku: 'AC-WS-002'
  },
  {
    id: 'prod-003',
    slug: 'ceramic-pour-over-set',
    name: 'Ceramic Pour-Over Set',
    description: 'Handmade ceramic dripper and carafe for precision coffee.',
    longDescription: 'This pour-over set is wheel-thrown by artisan potters and finished with a food-safe matte glaze. The dripper features a spiral ridge pattern that guides water flow for even extraction. The carafe holds 600ml — perfect for two generous cups.',
    price: 68,
    currency: 'USD',
    images: [
      { src: '/products/pour-over-1.jpg', alt: 'Ceramic Pour-Over Set — dripper and carafe', width: 800, height: 1000 }
    ],
    category: 'home',
    tags: ['ceramic', 'coffee', 'handmade'],
    inStock: true,
    rating: 4.9,
    reviewCount: 203,
    brand: 'Earth & Fire',
    sku: 'EF-PO-003'
  },
  {
    id: 'prod-004',
    slug: 'linen-camp-shirt',
    name: 'Linen Camp Shirt',
    description: 'Relaxed-fit camp collar shirt in washed Belgian linen.',
    longDescription: 'Cut from washed Belgian linen for a soft, lived-in feel from day one. The camp collar and boxy relaxed fit make it effortless for warm weather. Features a single chest pocket and coconut shell buttons. Machine washable — gets softer with every wash.',
    price: 135,
    compareAtPrice: 160,
    currency: 'USD',
    images: [
      { src: '/products/linen-shirt-1.jpg', alt: 'Linen Camp Shirt — front view', width: 800, height: 1000 }
    ],
    category: 'clothing',
    tags: ['linen', 'shirt', 'summer'],
    inStock: true,
    rating: 4.7,
    reviewCount: 67,
    brand: 'Atelier Craft',
    sku: 'AC-LS-004'
  },
  {
    id: 'prod-005',
    slug: 'walnut-cutting-board',
    name: 'Walnut Cutting Board',
    description: 'End-grain walnut board with juice groove and hand-rubbed finish.',
    longDescription: 'This end-grain cutting board is crafted from sustainably harvested American black walnut. The end-grain construction is gentle on knife edges and self-healing. Features a deep juice groove and rubber feet for stability. Finished with food-safe mineral oil and beeswax.',
    price: 120,
    currency: 'USD',
    images: [
      { src: '/products/cutting-board-1.jpg', alt: 'Walnut Cutting Board — top view', width: 800, height: 1000 }
    ],
    category: 'home',
    tags: ['walnut', 'kitchen', 'handmade'],
    inStock: false,
    rating: 4.9,
    reviewCount: 156,
    brand: 'Earth & Fire',
    sku: 'EF-CB-005'
  },
  {
    id: 'prod-006',
    slug: 'brass-desk-lamp',
    name: 'Brass Desk Lamp',
    description: 'Adjustable solid brass lamp with linen shade.',
    longDescription: 'A timeless desk lamp in solid unlacquered brass that develops a warm patina over time. The articulating arm allows precise positioning, while the linen drum shade diffuses light softly. Compatible with standard E26 bulbs up to 60W or any LED equivalent.',
    price: 195,
    currency: 'USD',
    images: [
      { src: '/products/desk-lamp-1.jpg', alt: 'Brass Desk Lamp — angled view', width: 800, height: 1000 }
    ],
    category: 'home',
    tags: ['brass', 'lighting', 'desk'],
    inStock: true,
    rating: 4.5,
    reviewCount: 42,
    brand: 'Atelier Craft',
    sku: 'AC-DL-006'
  }
];

export function getProductBySlug(slug: string): Product | undefined {
  return products.find((p) => p.slug === slug);
}

export function getProductsByCategory(category: string): Product[] {
  return products.filter((p) => p.category === category);
}

export function searchProducts(query: string): Product[] {
  const lower = query.toLowerCase();
  return products.filter(
    (p) =>
      p.name.toLowerCase().includes(lower) ||
      p.description.toLowerCase().includes(lower) ||
      p.tags.some((t) => t.includes(lower))
  );
}

export const categories = [...new Set(products.map((p) => p.category))];
```

---

## 4. Product listing with {#each} and keys

The product listing page uses `{#each}` with keyed iteration (Lesson 4.4 — why keys matter). Keys are critical here because when we filter or sort products, Svelte needs to know which DOM elements to reuse versus recreate.

Create `src/routes/+page.svelte`:

```svelte
<script lang="ts">
  import type { PageData } from './$types';
  import ProductCard from '$lib/components/ProductCard.svelte';
  import Seo from '$lib/components/Seo.svelte';

  let { data } = $props();
  let selectedCategory = $state('all');

  // Filter products reactively (Lesson 2.8 — $derived.by)
  let filteredProducts = $derived.by(() => {
    if (selectedCategory === 'all') return data.products;
    return data.products.filter((p) => p.category === selectedCategory);
  });
</script>

<Seo
  title="Shop Handcrafted Goods"
  description="Discover artisan-made leather goods, ceramics, textiles, and home accessories. Each piece is crafted with care."
/>

<div class="container">
  <header class="page-header">
    <h1>Our Collection</h1>
    <p>Handcrafted goods made to last a lifetime.</p>
  </header>

  <!-- Category filter -->
  <nav class="category-filter" aria-label="Filter by category">
    <button
      class="filter-btn"
      class:active={selectedCategory === 'all'}
      onclick={() => { selectedCategory = 'all'; }}
    >
      All
    </button>
    {#each data.categories as category}
      <button
        class="filter-btn"
        class:active={selectedCategory === category}
        onclick={() => { selectedCategory = category; }}
      >
        {category.charAt(0).toUpperCase() + category.slice(1)}
      </button>
    {/each}
  </nav>

  <!-- Product grid — keyed {#each} (Lesson 4.4) -->
  <div class="product-grid">
    {#each filteredProducts as product (product.id)}
      <ProductCard {product} />
    {:else}
      <p class="empty-state">No products found in this category.</p>
    {/each}
  </div>
</div>

<style>
  @layer components {
    .page-header {
      text-align: center;
      padding: var(--space-3xl) 0 var(--space-2xl);

      h1 {
        font-size: var(--text-4xl);
        margin-block-end: var(--space-sm);
      }

      p {
        color: var(--color-text-muted);
        font-size: var(--text-lg);
      }
    }

    .category-filter {
      display: flex;
      justify-content: center;
      gap: var(--space-sm);
      margin-block-end: var(--space-2xl);
      flex-wrap: wrap;
    }

    .filter-btn {
      padding: var(--space-xs) var(--space-lg);
      background: transparent;
      border: 1px solid var(--color-border);
      border-radius: var(--radius-full);
      cursor: pointer;
      font-size: var(--text-sm);
      transition: all var(--dur-fast) var(--ease-out);

      &:hover {
        border-color: var(--color-primary);
        color: var(--color-primary);
      }

      &.active {
        background: var(--color-primary);
        border-color: var(--color-primary);
        color: oklch(1 0 0);
      }
    }

    .product-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(18rem, 1fr));
      gap: var(--space-xl);
      padding-block-end: var(--space-3xl);
    }

    .empty-state {
      grid-column: 1 / -1;
      text-align: center;
      color: var(--color-text-muted);
      padding: var(--space-3xl);
    }
  }
</style>
```

Create `src/routes/+page.ts`:

```ts
import type { PageLoad } from './$types';
import { products, categories } from '$lib/data/products';

export const load: PageLoad = async () => {
  return {
    products,
    categories
  };
};
```

**Why `(product.id)` as the key?** As you learned in Lesson 4.4, Svelte uses the key expression to match old DOM elements with new data when the array changes. Without a key, Svelte uses index-based matching, which causes visual glitches when items are filtered or reordered — the wrong product image might flash before updating. Using `product.id` guarantees stable identity.

---

## 5. Product detail with [slug] dynamic route

Dynamic routes (Lesson 8.6) let us create a page for every product without writing individual files. The `[slug]` segment captures the URL parameter.

Create `src/routes/products/[slug]/+page.ts`:

```ts
import type { PageLoad } from './$types';
import { error } from '@sveltejs/kit';
import { getProductBySlug } from '$lib/data/products';

export const load: PageLoad = async ({ params }) => {
  const product = getProductBySlug(params.slug);

  if (!product) {
    error(404, { message: 'Product not found' });
  }

  return { product };
};
```

Create `src/routes/products/[slug]/+page.svelte`:

```svelte
<script lang="ts">
  import type { PageData } from './$types';
  import Seo from '$lib/components/Seo.svelte';
  import ProductImage from '$lib/components/ProductImage.svelte';
  import { cart } from '$lib/stores/cart.svelte';

  let { data } = $props();
  let product = $derived(data.product);

  let quantity = $state(1);
  let selectedImageIndex = $state(0);

  let formattedPrice = $derived(
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: product.currency
    }).format(product.price)
  );

  let formattedComparePrice = $derived(
    product.compareAtPrice
      ? new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: product.currency
        }).format(product.compareAtPrice)
      : null
  );

  let discount = $derived(
    product.compareAtPrice
      ? Math.round((1 - product.price / product.compareAtPrice) * 100)
      : 0
  );

  // JSON-LD Product schema (Lesson 13.6)
  let jsonLd = $derived({
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    image: product.images.map((img) => `https://store.example.com${img.src}`),
    brand: {
      '@type': 'Brand',
      name: product.brand
    },
    sku: product.sku,
    offers: {
      '@type': 'Offer',
      price: product.price,
      priceCurrency: product.currency,
      availability: product.inStock
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
      url: `https://store.example.com/products/${product.slug}`
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: product.rating,
      reviewCount: product.reviewCount
    }
  });

  function addToCart() {
    cart.add(product, quantity);
    quantity = 1;
  }
</script>

<Seo
  title={product.name}
  description={product.description}
  canonical={`https://store.example.com/products/${product.slug}`}
  ogImage={product.images[0]?.src}
  ogType="website"
  {jsonLd}
/>

<div class="container">
  <nav class="breadcrumb" aria-label="Breadcrumb">
    <ol>
      <li><a href="/">Shop</a></li>
      <li><span aria-current="page">{product.name}</span></li>
    </ol>
  </nav>

  <article class="product-detail">
    <div class="product-gallery">
      <!-- Main image with optimization (Lesson 12.2) -->
      {#if product.images[selectedImageIndex]}
        <ProductImage image={product.images[selectedImageIndex]} priority />
      {/if}

      <!-- Thumbnail strip -->
      {#if product.images.length > 1}
        <div class="thumbnails" role="listbox" aria-label="Product images">
          {#each product.images as image, i (image.src)}
            <button
              class="thumbnail"
              class:active={i === selectedImageIndex}
              onclick={() => { selectedImageIndex = i; }}
              role="option"
              aria-selected={i === selectedImageIndex}
              aria-label={image.alt}
            >
              <img src={image.src} alt="" width={80} height={100} loading="lazy" />
            </button>
          {/each}
        </div>
      {/if}
    </div>

    <div class="product-info">
      <p class="brand">{product.brand}</p>
      <h1>{product.name}</h1>

      <div class="price-block">
        <span class="price">{formattedPrice}</span>
        {#if formattedComparePrice}
          <span class="compare-price">{formattedComparePrice}</span>
          <span class="discount-badge">-{discount}%</span>
        {/if}
      </div>

      <div class="rating" aria-label={`Rated ${product.rating} out of 5 from ${product.reviewCount} reviews`}>
        <span class="stars" aria-hidden="true">
          {'★'.repeat(Math.round(product.rating))}{'☆'.repeat(5 - Math.round(product.rating))}
        </span>
        <span class="review-count">({product.reviewCount} reviews)</span>
      </div>

      <p class="description">{product.longDescription}</p>

      <div class="add-to-cart">
        <label class="quantity-label">
          <span class="sr-only">Quantity</span>
          <input
            type="number"
            bind:value={quantity}
            min={1}
            max={10}
            class="quantity-input"
          />
        </label>

        <button
          class="add-btn"
          onclick={addToCart}
          disabled={!product.inStock}
        >
          {product.inStock ? 'Add to cart' : 'Out of stock'}
        </button>
      </div>

      <div class="tags">
        {#each product.tags as tag}
          <span class="tag">{tag}</span>
        {/each}
      </div>
    </div>
  </article>
</div>

<style>
  @layer components {
    .breadcrumb {
      padding: var(--space-lg) 0;

      ol {
        display: flex;
        gap: var(--space-sm);
        font-size: var(--text-sm);
        color: var(--color-text-muted);
      }

      li + li::before {
        content: '/';
        margin-inline-end: var(--space-sm);
      }

      span[aria-current] {
        color: var(--color-text);
      }
    }

    .product-detail {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: var(--space-3xl);
      padding-block-end: var(--space-3xl);

      @media (width < 768px) {
        grid-template-columns: 1fr;
        gap: var(--space-xl);
      }
    }

    .product-gallery {
      display: flex;
      flex-direction: column;
      gap: var(--space-md);
    }

    .thumbnails {
      display: flex;
      gap: var(--space-sm);
    }

    .thumbnail {
      border: 2px solid transparent;
      border-radius: var(--radius-sm);
      overflow: hidden;
      cursor: pointer;
      padding: 0;
      background: none;
      transition: border-color var(--dur-fast) var(--ease-out);

      &.active {
        border-color: var(--color-primary);
      }

      img {
        object-fit: cover;
      }
    }

    .product-info {
      display: flex;
      flex-direction: column;
      gap: var(--space-md);
    }

    .brand {
      font-size: var(--text-sm);
      text-transform: uppercase;
      letter-spacing: 0.1em;
      color: var(--color-text-muted);
    }

    h1 {
      font-size: var(--text-3xl);
    }

    .price-block {
      display: flex;
      align-items: center;
      gap: var(--space-sm);
    }

    .price {
      font-size: var(--text-2xl);
      font-weight: 700;
    }

    .compare-price {
      font-size: var(--text-lg);
      color: var(--color-text-muted);
      text-decoration: line-through;
    }

    .discount-badge {
      padding: var(--space-xs) var(--space-sm);
      background: oklch(0.65 0.22 25 / 0.1);
      color: var(--color-error);
      border-radius: var(--radius-sm);
      font-size: var(--text-xs);
      font-weight: 700;
    }

    .rating {
      display: flex;
      align-items: center;
      gap: var(--space-sm);

      .stars {
        color: var(--color-accent);
        letter-spacing: 0.1em;
      }

      .review-count {
        font-size: var(--text-sm);
        color: var(--color-text-muted);
      }
    }

    .description {
      color: var(--color-text-muted);
      line-height: 1.8;
    }

    .add-to-cart {
      display: flex;
      gap: var(--space-md);
      padding-block: var(--space-md);
    }

    .quantity-input {
      inline-size: 4rem;
      padding: var(--space-sm);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-sm);
      text-align: center;
      font-variant-numeric: tabular-nums;
    }

    .add-btn {
      flex: 1;
      padding: var(--space-sm) var(--space-xl);
      background: var(--color-primary);
      color: oklch(1 0 0);
      border: none;
      border-radius: var(--radius-sm);
      font-weight: 700;
      cursor: pointer;
      transition: background var(--dur-fast) var(--ease-out);

      &:hover:not(:disabled) {
        background: var(--color-primary-hover);
      }

      &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
    }

    .tags {
      display: flex;
      gap: var(--space-sm);
      flex-wrap: wrap;
    }

    .tag {
      padding: var(--space-xs) var(--space-sm);
      background: var(--color-surface-elevated);
      border-radius: var(--radius-full);
      font-size: var(--text-xs);
      color: var(--color-text-muted);
    }
  }
</style>
```

---

## 6. Shopping cart as a reactive class

We build the cart as a reactive class in a `.svelte.ts` file (Lesson 11.3, 11.5). This is a critical architectural decision.

**Why a reactive class instead of context?** Context (Lesson 11.2) is scoped to a component tree — you set it in a layout and read it in children. But the cart needs to persist across page navigations and be accessible from any component (the header badge, the product page, the cart sidebar, the checkout page). A `.svelte.ts` reactive class is a module-level singleton that survives navigation and can be imported anywhere.

Create `src/lib/stores/cart.svelte.ts`:

```ts
import type { Product } from '$lib/data/products';

export interface CartItem {
  product: Product;
  quantity: number;
}

class CartStore {
  items = $state<CartItem[]>([]);

  // Derived values (Lesson 2.7 — $derived for pure computed values)
  totalItems = $derived(
    this.items.reduce((sum, item) => sum + item.quantity, 0)
  );

  totalPrice = $derived(
    this.items.reduce((sum, item) => sum + item.product.price * item.quantity, 0)
  );

  formattedTotal = $derived(
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(this.totalPrice)
  );

  isEmpty = $derived(this.items.length === 0);

  add(product: Product, quantity: number = 1) {
    const existing = this.items.find((item) => item.product.id === product.id);

    if (existing) {
      // Mutate the existing item (Lesson 2.4 — $state with arrays)
      existing.quantity += quantity;
    } else {
      this.items.push({ product, quantity });
    }
  }

  remove(productId: string) {
    this.items = this.items.filter((item) => item.product.id !== productId);
  }

  updateQuantity(productId: string, quantity: number) {
    const item = this.items.find((item) => item.product.id === productId);
    if (item) {
      if (quantity <= 0) {
        this.remove(productId);
      } else {
        item.quantity = quantity;
      }
    }
  }

  clear() {
    this.items = [];
  }
}

// Module-level singleton — survives page navigation (Lesson 11.4)
export const cart = new CartStore();
```

**Architecture note:** We use `$state<CartItem[]>([])` with deep reactivity so that mutations like `existing.quantity += quantity` are tracked automatically. If we used `$state.raw` (Lesson 2.5), we would need to replace the entire array on every change. Deep reactivity is the right choice here because individual cart items are mutated frequently (quantity changes).

---

## 7. Cart sidebar component

Create `src/lib/components/CartSidebar.svelte`:

```svelte
<script lang="ts">
  import { cart } from '$lib/stores/cart.svelte';
  import { fly } from 'svelte/transition';

  interface Props {
    open: boolean;
    onclose: () => void;
  }

  let { open, onclose }: Props = $props();

  // Close on Escape key (Lesson 5.10 — keyboard navigation)
  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape') onclose();
  }
</script>

{#if open}
  <!-- Backdrop -->
  <div
    class="backdrop"
    onclick={onclose}
    onkeydown={handleKeydown}
    role="presentation"
    transition:fly={{ duration: 200 }}
  ></div>

  <!-- Sidebar panel -->
  <aside
    class="cart-sidebar"
    role="dialog"
    aria-label="Shopping cart"
    aria-modal="true"
    transition:fly={{ x: 300, duration: 300, easing: (t) => 1 - Math.pow(1 - t, 3) }}
  >
    <header class="cart-header">
      <h2>Your Cart ({cart.totalItems})</h2>
      <button class="close-btn" onclick={onclose} aria-label="Close cart">
        &times;
      </button>
    </header>

    {#if cart.isEmpty}
      <div class="cart-empty">
        <p>Your cart is empty.</p>
        <a href="/" onclick={onclose}>Continue shopping</a>
      </div>
    {:else}
      <ul class="cart-items">
        {#each cart.items as item (item.product.id)}
          <li class="cart-item">
            <img
              src={item.product.images[0]?.src}
              alt={item.product.images[0]?.alt ?? item.product.name}
              width={60}
              height={75}
              loading="lazy"
            />
            <div class="item-details">
              <h3>{item.product.name}</h3>
              <p class="item-price">
                {new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency: item.product.currency
                }).format(item.product.price)}
              </p>
              <div class="item-controls">
                <button
                  onclick={() => cart.updateQuantity(item.product.id, item.quantity - 1)}
                  aria-label={`Decrease quantity of ${item.product.name}`}
                >
                  &minus;
                </button>
                <span class="item-qty">{item.quantity}</span>
                <button
                  onclick={() => cart.updateQuantity(item.product.id, item.quantity + 1)}
                  aria-label={`Increase quantity of ${item.product.name}`}
                >
                  +
                </button>
                <button
                  class="remove-btn"
                  onclick={() => cart.remove(item.product.id)}
                  aria-label={`Remove ${item.product.name} from cart`}
                >
                  Remove
                </button>
              </div>
            </div>
          </li>
        {/each}
      </ul>

      <footer class="cart-footer">
        <div class="cart-total">
          <span>Total</span>
          <span class="total-amount">{cart.formattedTotal}</span>
        </div>
        <a href="/checkout" class="checkout-btn" onclick={onclose}>
          Proceed to checkout
        </a>
      </footer>
    {/if}
  </aside>
{/if}

<style>
  @layer components {
    .backdrop {
      position: fixed;
      inset: 0;
      background: oklch(0 0 0 / 0.5);
      z-index: 100;
    }

    .cart-sidebar {
      position: fixed;
      inset-block: 0;
      inset-inline-end: 0;
      inline-size: min(100%, 24rem);
      background: var(--color-surface-alt);
      z-index: 101;
      display: flex;
      flex-direction: column;
      box-shadow: var(--shadow-lg);
    }

    .cart-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: var(--space-lg);
      border-block-end: 1px solid var(--color-border);

      h2 { font-size: var(--text-lg); }
    }

    .close-btn {
      background: none;
      border: none;
      font-size: var(--text-2xl);
      cursor: pointer;
      color: var(--color-text-muted);
      padding: var(--space-xs);
      line-height: 1;

      &:hover { color: var(--color-text); }
    }

    .cart-empty {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: var(--space-md);
      color: var(--color-text-muted);

      a {
        padding: var(--space-sm) var(--space-lg);
        background: var(--color-primary);
        color: oklch(1 0 0);
        border-radius: var(--radius-sm);
      }
    }

    .cart-items {
      flex: 1;
      overflow-y: auto;
      padding: var(--space-md);
    }

    .cart-item {
      display: flex;
      gap: var(--space-md);
      padding: var(--space-md) 0;
      border-block-end: 1px solid var(--color-border);

      img {
        border-radius: var(--radius-sm);
        object-fit: cover;
      }
    }

    .item-details {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: var(--space-xs);

      h3 { font-size: var(--text-sm); }
    }

    .item-price {
      font-weight: 600;
      font-size: var(--text-sm);
    }

    .item-controls {
      display: flex;
      align-items: center;
      gap: var(--space-sm);

      button {
        inline-size: 1.75rem;
        block-size: 1.75rem;
        display: grid;
        place-items: center;
        background: var(--color-surface);
        border: 1px solid var(--color-border);
        border-radius: var(--radius-sm);
        cursor: pointer;
        font-size: var(--text-sm);

        &:hover { background: var(--color-surface-elevated); }
      }
    }

    .item-qty {
      font-size: var(--text-sm);
      font-variant-numeric: tabular-nums;
      min-inline-size: 1.5rem;
      text-align: center;
    }

    .remove-btn {
      margin-inline-start: auto;
      inline-size: auto !important;
      padding-inline: var(--space-sm);
      color: var(--color-error) !important;
      border-color: transparent !important;
      background: transparent !important;
      font-size: var(--text-xs) !important;

      &:hover { text-decoration: underline; }
    }

    .cart-footer {
      padding: var(--space-lg);
      border-block-start: 1px solid var(--color-border);
    }

    .cart-total {
      display: flex;
      justify-content: space-between;
      margin-block-end: var(--space-md);
      font-size: var(--text-lg);
    }

    .total-amount { font-weight: 700; }

    .checkout-btn {
      display: block;
      text-align: center;
      padding: var(--space-sm) var(--space-xl);
      background: var(--color-primary);
      color: oklch(1 0 0);
      border-radius: var(--radius-sm);
      font-weight: 700;
      transition: background var(--dur-fast) var(--ease-out);

      &:hover {
        background: var(--color-primary-hover);
        color: oklch(1 0 0);
      }
    }
  }
</style>
```

Integrate the cart into the root layout. Update `src/routes/+layout.svelte`:

```svelte
<script lang="ts">
  import '../app.css';
  import { cart } from '$lib/stores/cart.svelte';
  import CartSidebar from '$lib/components/CartSidebar.svelte';

  let { children } = $props();
  let cartOpen = $state(false);
</script>

<header class="store-header">
  <nav class="container header-nav" aria-label="Main navigation">
    <a href="/" class="logo">Atelier</a>
    <div class="nav-actions">
      <a href="/search">Search</a>
      <button class="cart-toggle" onclick={() => { cartOpen = true; }} aria-label="Open cart">
        Cart ({cart.totalItems})
      </button>
    </div>
  </nav>
</header>

<main>
  {@render children()}
</main>

<CartSidebar open={cartOpen} onclose={() => { cartOpen = false; }} />

<style>
  @layer components {
    .store-header {
      border-block-end: 1px solid var(--color-border);
      position: sticky;
      inset-block-start: 0;
      background: var(--color-surface-alt);
      z-index: 50;
    }

    .header-nav {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding-block: var(--space-md);
    }

    .logo {
      font-size: var(--text-xl);
      font-weight: 700;
      color: var(--color-text);
      letter-spacing: 0.1em;
      text-transform: uppercase;
    }

    .nav-actions {
      display: flex;
      align-items: center;
      gap: var(--space-lg);

      a {
        color: var(--color-text-muted);
        font-size: var(--text-sm);

        &:hover { color: var(--color-text); }
      }
    }

    .cart-toggle {
      background: none;
      border: none;
      cursor: pointer;
      font-size: var(--text-sm);
      color: var(--color-text-muted);
      transition: color var(--dur-fast) var(--ease-out);

      &:hover { color: var(--color-text); }
    }
  }
</style>
```

---

## 8. Checkout form with Valibot validation

The checkout form uses form actions with Valibot validation (Lesson 10.6) and `use:enhance` for progressive enhancement (Lesson 10.5). Valibot gives us a single schema that works for both client-side preview validation and server-side enforcement.

Create `src/lib/schemas/checkout.ts`:

```ts
import * as v from 'valibot';

export const checkoutSchema = v.object({
  email: v.pipe(v.string(), v.email('Please enter a valid email address.')),
  firstName: v.pipe(v.string(), v.minLength(1, 'First name is required.')),
  lastName: v.pipe(v.string(), v.minLength(1, 'Last name is required.')),
  address: v.pipe(v.string(), v.minLength(5, 'Please enter your full address.')),
  city: v.pipe(v.string(), v.minLength(1, 'City is required.')),
  state: v.pipe(v.string(), v.minLength(1, 'State is required.')),
  zip: v.pipe(v.string(), v.regex(/^\d{5}(-\d{4})?$/, 'Please enter a valid ZIP code.')),
  cardNumber: v.pipe(
    v.string(),
    v.regex(/^\d{4}\s?\d{4}\s?\d{4}\s?\d{4}$/, 'Please enter a valid card number.')
  ),
  expiry: v.pipe(
    v.string(),
    v.regex(/^(0[1-9]|1[0-2])\/\d{2}$/, 'Please enter a valid expiry (MM/YY).')
  ),
  cvc: v.pipe(v.string(), v.regex(/^\d{3,4}$/, 'Please enter a valid CVC.'))
});

export type CheckoutData = v.InferOutput<typeof checkoutSchema>;
```

Create `src/routes/checkout/+page.svelte`:

```svelte
<script lang="ts">
  import { enhance } from '$app/forms';
  import { cart } from '$lib/stores/cart.svelte';
  import Seo from '$lib/components/Seo.svelte';

  let { form } = $props();
  let submitting = $state(false);
</script>

<Seo title="Checkout" description="Complete your purchase." />

<div class="container">
  <h1>Checkout</h1>

  {#if cart.isEmpty}
    <div class="empty-cart">
      <p>Your cart is empty.</p>
      <a href="/">Continue shopping</a>
    </div>
  {:else}
    <div class="checkout-layout">
      <form
        method="POST"
        use:enhance={() => {
          submitting = true;
          return async ({ update }) => {
            submitting = false;
            await update();
          };
        }}
        novalidate
      >
        <fieldset>
          <legend>Contact</legend>
          <label>
            <span>Email</span>
            <input
              type="email"
              name="email"
              required
              value={form?.data?.email ?? ''}
              autocomplete="email"
            />
            {#if form?.errors?.email}
              <span class="field-error">{form.errors.email}</span>
            {/if}
          </label>
        </fieldset>

        <fieldset>
          <legend>Shipping Address</legend>
          <div class="field-row">
            <label>
              <span>First name</span>
              <input
                type="text"
                name="firstName"
                required
                value={form?.data?.firstName ?? ''}
                autocomplete="given-name"
              />
              {#if form?.errors?.firstName}
                <span class="field-error">{form.errors.firstName}</span>
              {/if}
            </label>
            <label>
              <span>Last name</span>
              <input
                type="text"
                name="lastName"
                required
                value={form?.data?.lastName ?? ''}
                autocomplete="family-name"
              />
              {#if form?.errors?.lastName}
                <span class="field-error">{form.errors.lastName}</span>
              {/if}
            </label>
          </div>

          <label>
            <span>Address</span>
            <input
              type="text"
              name="address"
              required
              value={form?.data?.address ?? ''}
              autocomplete="street-address"
            />
            {#if form?.errors?.address}
              <span class="field-error">{form.errors.address}</span>
            {/if}
          </label>

          <div class="field-row field-row-3">
            <label>
              <span>City</span>
              <input
                type="text"
                name="city"
                required
                value={form?.data?.city ?? ''}
                autocomplete="address-level2"
              />
              {#if form?.errors?.city}
                <span class="field-error">{form.errors.city}</span>
              {/if}
            </label>
            <label>
              <span>State</span>
              <input
                type="text"
                name="state"
                required
                value={form?.data?.state ?? ''}
                autocomplete="address-level1"
              />
              {#if form?.errors?.state}
                <span class="field-error">{form.errors.state}</span>
              {/if}
            </label>
            <label>
              <span>ZIP</span>
              <input
                type="text"
                name="zip"
                required
                value={form?.data?.zip ?? ''}
                autocomplete="postal-code"
                inputmode="numeric"
              />
              {#if form?.errors?.zip}
                <span class="field-error">{form.errors.zip}</span>
              {/if}
            </label>
          </div>
        </fieldset>

        <fieldset>
          <legend>Payment</legend>
          <label>
            <span>Card number</span>
            <input
              type="text"
              name="cardNumber"
              required
              inputmode="numeric"
              placeholder="1234 5678 9012 3456"
              autocomplete="cc-number"
            />
            {#if form?.errors?.cardNumber}
              <span class="field-error">{form.errors.cardNumber}</span>
            {/if}
          </label>
          <div class="field-row">
            <label>
              <span>Expiry</span>
              <input
                type="text"
                name="expiry"
                required
                placeholder="MM/YY"
                autocomplete="cc-exp"
              />
              {#if form?.errors?.expiry}
                <span class="field-error">{form.errors.expiry}</span>
              {/if}
            </label>
            <label>
              <span>CVC</span>
              <input
                type="text"
                name="cvc"
                required
                inputmode="numeric"
                placeholder="123"
                autocomplete="cc-csc"
              />
              {#if form?.errors?.cvc}
                <span class="field-error">{form.errors.cvc}</span>
              {/if}
            </label>
          </div>
        </fieldset>

        <button type="submit" class="place-order-btn" disabled={submitting}>
          {submitting ? 'Processing...' : `Pay ${cart.formattedTotal}`}
        </button>
      </form>

      <!-- Order summary -->
      <aside class="order-summary">
        <h2>Order Summary</h2>
        <ul>
          {#each cart.items as item (item.product.id)}
            <li class="summary-item">
              <span>{item.product.name} x {item.quantity}</span>
              <span>
                {new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency: 'USD'
                }).format(item.product.price * item.quantity)}
              </span>
            </li>
          {/each}
        </ul>
        <div class="summary-total">
          <span>Total</span>
          <span>{cart.formattedTotal}</span>
        </div>
      </aside>
    </div>
  {/if}
</div>

<style>
  @layer components {
    h1 {
      font-size: var(--text-3xl);
      padding-block: var(--space-2xl);
    }

    .checkout-layout {
      display: grid;
      grid-template-columns: 1fr 20rem;
      gap: var(--space-3xl);
      padding-block-end: var(--space-3xl);

      @media (width < 768px) {
        grid-template-columns: 1fr;
      }
    }

    fieldset {
      border: none;
      display: flex;
      flex-direction: column;
      gap: var(--space-md);
      margin-block-end: var(--space-xl);

      legend {
        font-size: var(--text-lg);
        font-weight: 700;
        margin-block-end: var(--space-md);
      }
    }

    label {
      display: flex;
      flex-direction: column;
      gap: var(--space-xs);
      font-size: var(--text-sm);
      font-weight: 500;
    }

    input {
      padding: var(--space-sm) var(--space-md);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-sm);
      font-size: var(--text-base);
      transition: border-color var(--dur-fast) var(--ease-out);

      &:focus {
        border-color: var(--color-primary);
        outline: none;
        box-shadow: 0 0 0 2px oklch(0.68 0.14 65 / 0.2);
      }
    }

    .field-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: var(--space-md);
    }

    .field-row-3 {
      grid-template-columns: 2fr 1fr 1fr;
    }

    .field-error {
      color: var(--color-error);
      font-size: var(--text-xs);
    }

    .place-order-btn {
      inline-size: 100%;
      padding: var(--space-md);
      background: var(--color-primary);
      color: oklch(1 0 0);
      border: none;
      border-radius: var(--radius-sm);
      font-weight: 700;
      font-size: var(--text-lg);
      cursor: pointer;
      transition: background var(--dur-fast) var(--ease-out);

      &:hover:not(:disabled) {
        background: var(--color-primary-hover);
      }

      &:disabled {
        opacity: 0.6;
        cursor: wait;
      }
    }

    .order-summary {
      padding: var(--space-xl);
      background: var(--color-surface-elevated);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-md);
      align-self: start;
      position: sticky;
      inset-block-start: 5rem;

      h2 {
        font-size: var(--text-lg);
        margin-block-end: var(--space-lg);
      }

      ul { margin-block-end: var(--space-lg); }
    }

    .summary-item {
      display: flex;
      justify-content: space-between;
      padding-block: var(--space-sm);
      font-size: var(--text-sm);
      border-block-end: 1px solid var(--color-border);
    }

    .summary-total {
      display: flex;
      justify-content: space-between;
      font-size: var(--text-lg);
      font-weight: 700;
    }

    .empty-cart {
      text-align: center;
      padding: var(--space-3xl);
      color: var(--color-text-muted);

      a {
        display: inline-block;
        margin-block-start: var(--space-md);
        padding: var(--space-sm) var(--space-lg);
        background: var(--color-primary);
        color: oklch(1 0 0);
        border-radius: var(--radius-sm);
      }
    }
  }
</style>
```

Create `src/routes/checkout/+page.server.ts`:

```ts
import { fail, redirect } from '@sveltejs/kit';
import type { Actions } from './$types';
import * as v from 'valibot';
import { checkoutSchema } from '$lib/schemas/checkout';

export const actions: Actions = {
  default: async ({ request }) => {
    const formData = await request.formData();

    const rawData = {
      email: formData.get('email')?.toString() ?? '',
      firstName: formData.get('firstName')?.toString() ?? '',
      lastName: formData.get('lastName')?.toString() ?? '',
      address: formData.get('address')?.toString() ?? '',
      city: formData.get('city')?.toString() ?? '',
      state: formData.get('state')?.toString() ?? '',
      zip: formData.get('zip')?.toString() ?? '',
      cardNumber: formData.get('cardNumber')?.toString() ?? '',
      expiry: formData.get('expiry')?.toString() ?? '',
      cvc: formData.get('cvc')?.toString() ?? ''
    };

    // Validate with Valibot (Lesson 10.6 — server-side validation)
    const result = v.safeParse(checkoutSchema, rawData);

    if (!result.success) {
      const errors: Record<string, string> = {};
      for (const issue of result.issues) {
        const path = issue.path?.[0]?.key;
        if (typeof path === 'string') {
          errors[path] = issue.message;
        }
      }
      return fail(400, { errors, data: rawData });
    }

    // In production, process payment via Stripe here
    // For this walkthrough, we simulate a successful payment
    console.log('Order placed:', result.output);

    redirect(303, '/checkout/success');
  }
};
```

Create `src/routes/checkout/success/+page.svelte`:

```svelte
<script lang="ts">
  import { cart } from '$lib/stores/cart.svelte';
  import { onMount } from 'svelte';

  // Clear cart on mount
  onMount(() => {
    cart.clear();
  });
</script>

<div class="container success-page">
  <div class="success-content">
    <h1>Order confirmed!</h1>
    <p>Thank you for your purchase. We will send a confirmation email shortly.</p>
    <a href="/" class="continue-link">Continue shopping</a>
  </div>
</div>

<style>
  @layer components {
    .success-page {
      display: grid;
      place-items: center;
      min-block-size: 60vh;
    }

    .success-content {
      text-align: center;

      h1 {
        font-size: var(--text-3xl);
        color: var(--color-success);
        margin-block-end: var(--space-md);
      }

      p {
        color: var(--color-text-muted);
        margin-block-end: var(--space-xl);
      }
    }

    .continue-link {
      display: inline-block;
      padding: var(--space-sm) var(--space-xl);
      background: var(--color-primary);
      color: oklch(1 0 0);
      border-radius: var(--radius-sm);
      font-weight: 600;
    }
  }
</style>
```

---

## 9. SSG for product pages, SSR for search

This is a critical architectural decision that combines two rendering modes (Lesson 8.12) in a single application.

**Product pages use SSG** (Lesson 9A.10): Product data rarely changes, so we prerender every product page at build time. This means zero server cost for product traffic and instant TTFB.

**The search page uses SSR**: Search queries are dynamic and cannot be prerendered. SSR ensures the page works without JavaScript (progressive enhancement) and returns correct HTML for SEO.

For SSG, add `entries()` to the product detail load function. Update `src/routes/products/[slug]/+page.ts`:

```ts
import type { PageLoad } from './$types';
import { error } from '@sveltejs/kit';
import { getProductBySlug, products } from '$lib/data/products';

// Prerender all product pages at build time (Lesson 9A.10)
export const prerender = true;

// Tell SvelteKit which [slug] values exist (Lesson 9A.10 — entries)
export function entries() {
  return products.map((p) => ({ slug: p.slug }));
}

export const load: PageLoad = async ({ params }) => {
  const product = getProductBySlug(params.slug);

  if (!product) {
    error(404, { message: 'Product not found' });
  }

  return { product };
};
```

The homepage can also be prerendered since the product catalog is static. Add to `src/routes/+page.ts`:

```ts
export const prerender = true;
```

---

## 10. Search page with SSR

Create `src/routes/search/+page.ts`:

```ts
import type { PageLoad } from './$types';
import { searchProducts } from '$lib/data/products';

// SSR — not prerendered because search queries are dynamic
export const prerender = false;

export const load: PageLoad = async ({ url }) => {
  const query = url.searchParams.get('q') ?? '';
  const results = query ? searchProducts(query) : [];

  return {
    query,
    results
  };
};
```

Create `src/routes/search/+page.svelte`:

```svelte
<script lang="ts">
  import type { PageData } from './$types';
  import ProductCard from '$lib/components/ProductCard.svelte';
  import Seo from '$lib/components/Seo.svelte';
  import { goto } from '$app/navigation';
  import { debounce } from '$lib/utils/debounce';

  let { data } = $props();
  let searchInput = $state(data.query);

  // Debounced search (Lesson 5.7 — debouncing)
  const debouncedSearch = debounce((value: string) => {
    const url = new URL(window.location.href);
    if (value) {
      url.searchParams.set('q', value);
    } else {
      url.searchParams.delete('q');
    }
    goto(url.toString(), { replaceState: true, keepFocus: true });
  }, 300);

  function handleInput(e: Event) {
    const value = (e.target as HTMLInputElement).value;
    searchInput = value;
    debouncedSearch(value);
  }
</script>

<Seo
  title={data.query ? `Search: ${data.query}` : 'Search'}
  description="Search our collection of handcrafted goods."
/>

<div class="container">
  <header class="search-header">
    <h1>Search</h1>
    <div class="search-bar">
      <input
        type="search"
        placeholder="Search products..."
        value={searchInput}
        oninput={handleInput}
        autofocus
        aria-label="Search products"
      />
    </div>
  </header>

  {#if data.query}
    <p class="results-count">
      {data.results.length} result{data.results.length === 1 ? '' : 's'} for "{data.query}"
    </p>
  {/if}

  <div class="product-grid">
    {#each data.results as product (product.id)}
      <ProductCard {product} />
    {:else}
      {#if data.query}
        <p class="empty-state">No products match your search.</p>
      {:else}
        <p class="empty-state">Start typing to search our collection.</p>
      {/if}
    {/each}
  </div>
</div>

<style>
  @layer components {
    .search-header {
      padding: var(--space-2xl) 0 var(--space-xl);

      h1 {
        font-size: var(--text-3xl);
        margin-block-end: var(--space-lg);
      }
    }

    .search-bar input {
      inline-size: 100%;
      padding: var(--space-md);
      border: 2px solid var(--color-border);
      border-radius: var(--radius-md);
      font-size: var(--text-lg);
      transition: border-color var(--dur-fast) var(--ease-out);

      &:focus {
        border-color: var(--color-primary);
        outline: none;
      }
    }

    .results-count {
      color: var(--color-text-muted);
      font-size: var(--text-sm);
      margin-block-end: var(--space-xl);
    }

    .product-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(18rem, 1fr));
      gap: var(--space-xl);
      padding-block-end: var(--space-3xl);
    }

    .empty-state {
      grid-column: 1 / -1;
      text-align: center;
      color: var(--color-text-muted);
      padding: var(--space-3xl);
    }
  }
</style>
```

Create the debounce utility at `src/lib/utils/debounce.ts`:

```ts
export function debounce<T extends (...args: Parameters<T>) => void>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}
```

---

## 11. JSON-LD Product schema

We already added JSON-LD to the product detail page in section 5. Let us also add Organization schema to the root layout for the entire site (Lesson 13.6).

Create `src/routes/+layout.ts`:

```ts
export const load = async () => {
  return {
    siteJsonLd: {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: 'Atelier Craft',
      url: 'https://store.example.com',
      logo: 'https://store.example.com/logo.png',
      description: 'Handcrafted goods made to last a lifetime.'
    }
  };
};
```

---

## 12. Image optimization with srcset

Create `src/lib/components/ProductImage.svelte` (Lesson 12.2):

```svelte
<script lang="ts">
  interface ProductImageData {
    src: string;
    alt: string;
    width: number;
    height: number;
  }

  interface Props {
    image: ProductImageData;
    priority?: boolean;
  }

  let { image, priority = false }: Props = $props();

  // Generate srcset paths from the base image path
  // In production, this would use an image CDN (Cloudinary, Imgix, Vercel Image Optimization)
  let basePath = $derived(image.src.replace(/\.[^.]+$/, ''));
  let extension = $derived(image.src.match(/\.[^.]+$/)?.[0] ?? '.jpg');
</script>

<picture>
  <source
    srcset="{basePath}-400.avif 400w, {basePath}-800.avif 800w"
    type="image/avif"
    sizes="(min-width: 768px) 50vw, 100vw"
  />
  <source
    srcset="{basePath}-400.webp 400w, {basePath}-800.webp 800w"
    type="image/webp"
    sizes="(min-width: 768px) 50vw, 100vw"
  />
  <img
    src={image.src}
    alt={image.alt}
    width={image.width}
    height={image.height}
    loading={priority ? 'eager' : 'lazy'}
    decoding={priority ? 'sync' : 'async'}
    fetchpriority={priority ? 'high' : undefined}
    class="product-img"
  />
</picture>

<style>
  @layer components {
    .product-img {
      inline-size: 100%;
      block-size: auto;
      object-fit: cover;
      border-radius: var(--radius-md);
      background: var(--color-surface-elevated);
    }
  }
</style>
```

**Why `fetchpriority="high"` on hero images?** As discussed in Lesson 12.1 (Core Web Vitals), the Largest Contentful Paint (LCP) element is often the main product image. Setting `fetchpriority="high"` tells the browser to prioritize downloading this image, improving LCP scores. We only do this for the main product detail image (`priority = true`), not for grid thumbnails.

---

## 13. OKLCH-branded product cards with container queries

Create `src/lib/components/ProductCard.svelte` using container queries (Lesson 6.8 and Lesson 3.10):

```svelte
<script lang="ts">
  import type { Product } from '$lib/data/products';

  interface Props {
    product: Product;
  }

  let { product }: Props = $props();

  let formattedPrice = $derived(
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: product.currency
    }).format(product.price)
  );

  let hasDiscount = $derived(
    product.compareAtPrice !== undefined && product.compareAtPrice > product.price
  );
</script>

<a href="/products/{product.slug}" class="product-card">
  <div class="card-image">
    <img
      src={product.images[0]?.src}
      alt={product.images[0]?.alt ?? product.name}
      width={400}
      height={500}
      loading="lazy"
      decoding="async"
    />
    {#if !product.inStock}
      <span class="badge sold-out">Sold out</span>
    {:else if hasDiscount}
      <span class="badge sale">Sale</span>
    {/if}
  </div>

  <div class="card-info">
    <p class="card-brand">{product.brand}</p>
    <h3 class="card-name">{product.name}</h3>
    <p class="card-description">{product.description}</p>
    <div class="card-price">
      <span class="price">{formattedPrice}</span>
      {#if hasDiscount && product.compareAtPrice}
        <span class="compare-price">
          {new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: product.currency
          }).format(product.compareAtPrice)}
        </span>
      {/if}
    </div>
  </div>
</a>

<style>
  @layer components {
    .product-card {
      display: flex;
      flex-direction: column;
      border-radius: var(--radius-md);
      overflow: hidden;
      background: var(--color-surface-alt);
      border: 1px solid var(--color-border);
      transition: box-shadow var(--dur-normal) var(--ease-out),
                  transform var(--dur-normal) var(--ease-out);
      text-decoration: none;
      color: inherit;
      /* Container query context (Lesson 6.8) */
      container-type: inline-size;
      container-name: product-card;

      &:hover {
        box-shadow: var(--shadow-md);
        transform: translateY(-2px);
      }
    }

    .card-image {
      position: relative;
      aspect-ratio: 4 / 5;
      overflow: hidden;
      /* Brand-tinted background while loading — using OKLCH (Lesson 6.2) */
      background: oklch(0.94 0.02 65);

      img {
        inline-size: 100%;
        block-size: 100%;
        object-fit: cover;
        transition: transform var(--dur-slow) var(--ease-out);
      }

      &:hover img {
        transform: scale(1.05);
      }
    }

    .badge {
      position: absolute;
      inset-block-start: var(--space-sm);
      inset-inline-start: var(--space-sm);
      padding: var(--space-xs) var(--space-sm);
      border-radius: var(--radius-sm);
      font-size: var(--text-xs);
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;

      &.sale {
        background: var(--color-error);
        color: oklch(1 0 0);
      }

      &.sold-out {
        background: oklch(0.30 0.01 60);
        color: oklch(0.85 0.01 60);
      }
    }

    .card-info {
      padding: var(--space-md);
      display: flex;
      flex-direction: column;
      gap: var(--space-xs);
    }

    .card-brand {
      font-size: var(--text-xs);
      text-transform: uppercase;
      letter-spacing: 0.1em;
      color: var(--color-text-muted);
    }

    .card-name {
      font-size: var(--text-base);
      font-weight: 600;
    }

    .card-description {
      font-size: var(--text-sm);
      color: var(--color-text-muted);
      display: none;
    }

    /* Container query: show description when card is wide enough (Lesson 6.8) */
    @container product-card (inline-size > 20rem) {
      .card-description {
        display: block;
      }

      .card-info {
        padding: var(--space-lg);
      }

      .card-name {
        font-size: var(--text-lg);
      }
    }

    .card-price {
      display: flex;
      align-items: center;
      gap: var(--space-sm);
      margin-block-start: var(--space-xs);
    }

    .price {
      font-weight: 700;
      font-size: var(--text-base);
    }

    .compare-price {
      font-size: var(--text-sm);
      color: var(--color-text-muted);
      text-decoration: line-through;
    }
  }
</style>
```

**Why container queries instead of media queries?** As you learned in Lesson 6.8, media queries respond to the viewport width, but a product card might appear in a two-column grid on desktop (narrow cards) or a single-column layout on mobile (wide cards). Container queries let the card adapt to its own container width, not the viewport. The `@container product-card (inline-size > 20rem)` rule shows the description only when the card is wide enough to display it comfortably.

---

## 14. Stripe-style payment flow mock

The checkout form above includes a payment section that mimics Stripe's patterns. In production, you would integrate Stripe Elements. Here is how the integration would work using the auth patterns from Lesson 15:

Create `src/lib/server/payments.ts`:

```ts
// This is a mock payment processor.
// In production, replace with Stripe SDK:
//   import Stripe from 'stripe';
//   const stripe = new Stripe(SECRET_STRIPE_KEY);

export interface PaymentResult {
  success: boolean;
  transactionId: string;
  error?: string;
}

export async function processPayment(
  amount: number,
  currency: string,
  _cardDetails: { number: string; expiry: string; cvc: string }
): Promise<PaymentResult> {
  // Simulate processing delay
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // Simulate 95% success rate
  if (Math.random() > 0.05) {
    return {
      success: true,
      transactionId: `txn_${crypto.randomUUID().slice(0, 12)}`
    };
  }

  return {
    success: false,
    transactionId: '',
    error: 'Payment declined. Please try a different card.'
  };
}
```

---

## 15. Performance and accessibility audit

Create `src/lib/components/Seo.svelte`:

```svelte
<script lang="ts">
  interface Props {
    title: string;
    description: string;
    canonical?: string;
    ogImage?: string;
    ogType?: 'website' | 'article';
    jsonLd?: Record<string, unknown>;
  }

  let {
    title,
    description,
    canonical = '',
    ogImage = '/og-default.png',
    ogType = 'website',
    jsonLd
  }: Props = $props();

  let fullTitle = $derived(`${title} | Atelier`);
</script>

<svelte:head>
  <title>{fullTitle}</title>
  <meta name="description" content={description} />
  {#if canonical}
    <link rel="canonical" href={canonical} />
  {/if}
  <meta property="og:title" content={fullTitle} />
  <meta property="og:description" content={description} />
  <meta property="og:type" content={ogType} />
  <meta property="og:image" content={ogImage} />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content={fullTitle} />
  <meta name="twitter:description" content={description} />
  {#if jsonLd}
    {@html `<script type="application/ld+json">${JSON.stringify(jsonLd)}</script>`}
  {/if}
</svelte:head>
```

### Accessibility checklist (Lesson 12.8)

- All images have descriptive `alt` text
- The cart sidebar has `role="dialog"`, `aria-label`, and `aria-modal="true"`
- Form inputs have associated labels
- The category filter uses `aria-label` for navigation
- Color contrast ratios exceed 4.5:1 (verified by OKLCH lightness values)
- Focus styles are visible via `:focus-visible` in the base layer
- The product grid uses semantic `{#each}` with keys for correct focus management
- Quantity buttons have `aria-label` descriptions

---

## 16. Deployment

For an e-commerce store, we recommend `adapter-node` with a CDN in front, since product pages are prerendered and search needs SSR:

```bash
pnpm build
node build/index.js
```

For Vercel, switch to `adapter-vercel`:

```js
// svelte.config.js
import adapter from '@sveltejs/adapter-vercel';
export default { kit: { adapter: adapter() } };
```

The prerendered product pages will be served from the CDN edge. Search pages will be server-rendered on demand.

### File tree — final

```
ecommerce-store/
├── src/
│   ├── app.css
│   ├── app.html
│   ├── app.d.ts
│   ├── lib/
│   │   ├── components/
│   │   │   ├── CartSidebar.svelte
│   │   │   ├── ProductCard.svelte
│   │   │   ├── ProductImage.svelte
│   │   │   └── Seo.svelte
│   │   ├── data/
│   │   │   └── products.ts
│   │   ├── schemas/
│   │   │   └── checkout.ts
│   │   ├── server/
│   │   │   └── payments.ts
│   │   ├── stores/
│   │   │   └── cart.svelte.ts
│   │   └── utils/
│   │       └── debounce.ts
│   └── routes/
│       ├── +layout.svelte
│       ├── +layout.ts
│       ├── +page.svelte
│       ├── +page.ts
│       ├── checkout/
│       │   ├── +page.svelte
│       │   ├── +page.server.ts
│       │   └── success/
│       │       └── +page.svelte
│       ├── products/
│       │   └── [slug]/
│       │       ├── +page.svelte
│       │       └── +page.ts
│       └── search/
│           ├── +page.svelte
│           └── +page.ts
├── svelte.config.js
├── tsconfig.json
└── package.json
```

---

## 17. Final result

You now have a complete e-commerce store with:

- **Product catalog** — 6 products with full data, typed with TypeScript interfaces
- **Product listing** — filterable by category, rendered with keyed `{#each}`
- **Product detail** — dynamic `[slug]` routes with image gallery, price formatting, and add-to-cart
- **Shopping cart** — reactive class in `.svelte.ts` with add, remove, quantity update, and clear
- **Cart sidebar** — slide-out panel with Svelte transitions, keyboard accessible
- **Checkout** — multi-step form with Valibot validation on both client and server
- **Search** — debounced live search with SSR
- **SSG + SSR hybrid** — product pages prerendered, search server-rendered
- **JSON-LD** — Product schema on every detail page for rich Google results
- **Image optimization** — `<picture>` with AVIF/WebP `srcset`, lazy loading, `fetchpriority`
- **Container queries** — product cards adapt layout based on their container width
- **OKLCH branding** — consistent warm amber palette throughout

### What to test

1. Browse the product grid and filter by category
2. Click a product to see the detail page with full description
3. Add items to the cart and verify the header count updates
4. Open the cart sidebar, change quantities, and remove items
5. Complete the checkout flow and verify Valibot validation errors
6. Use the search page to find products by name or tag
7. View page source on a product page to see prerendered HTML and JSON-LD
8. Resize the browser to see container queries adapt the product card layout

---

## 18. What you practiced

- **$state with objects and arrays** — cart items as reactive state (Module 2, Lessons 2.3, 2.4)
- **$derived and $derived.by** — computed prices, totals, formatted values (Module 2, Lessons 2.7, 2.8)
- **$effect** — connecting to SSE, debounced search (Module 2, Lesson 2.9)
- **Dynamic styles and class bindings** — active filters, sale badges (Module 2, Lesson 2.12)
- **{#each} with keys** — product grid with stable DOM identity (Module 4, Lesson 4.4)
- **{#if}/{:else}** — conditional rendering for stock status, discounts (Module 4, Lessons 4.1, 4.2)
- **Debouncing** — search input with delayed URL update (Module 5, Lesson 5.7)
- **Keyboard navigation** — cart sidebar Escape to close (Module 5, Lesson 5.10)
- **OKLCH color system** — warm amber brand palette (Module 6, Lesson 6.2)
- **Container queries** — adaptive product card layout (Module 6, Lesson 6.8)
- **Per-page color personality** — brand-specific token overrides (Module 6, Lesson 6.9)
- **Svelte transitions** — cart sidebar fly animation (Module 6, Lesson 6.11)
- **File-based routing** — product pages, checkout flow (Module 8, Lesson 8.4)
- **Dynamic routes [slug]** — product detail pages (Module 8, Lesson 8.6)
- **Rendering modes** — SSG for products, SSR for search (Module 8, Lesson 8.12)
- **SSG with entries()** — prerendering all product slugs (Module 9A, Lesson 9A.10)
- **Load functions** — data fetching for products, search (Module 9A, Lesson 9A.2)
- **Form actions** — checkout server-side mutation (Module 10, Lesson 10.3)
- **use:enhance** — progressive enhancement for forms (Module 10, Lesson 10.5)
- **Server-side validation** — Valibot schema validation (Module 10, Lesson 10.6)
- **Reactive classes with runes** — CartStore class (Module 11, Lesson 11.5)
- **.svelte.ts files** — universal reactive cart state (Module 11, Lesson 11.3)
- **Shared state across pages** — cart singleton module (Module 11, Lesson 11.4)
- **Image optimization** — srcset, lazy loading, AVIF/WebP (Module 12, Lesson 12.2)
- **Core Web Vitals** — fetchpriority, loading, decoding (Module 12, Lesson 12.1)
- **Accessibility** — ARIA labels, roles, keyboard nav (Module 12, Lesson 12.8)
- **<svelte:head>** — per-page meta tags (Module 13, Lesson 13.2)
- **SEO component** — reusable typed meta component (Module 13, Lesson 13.3)
- **Open Graph** — social sharing images and metadata (Module 13, Lesson 13.4)
- **JSON-LD** — Product structured data schema (Module 13, Lesson 13.6)
- **PE7 CSS** — @layer architecture, OKLCH tokens, fluid clamp typography (Module 1, Lesson 1.5)
