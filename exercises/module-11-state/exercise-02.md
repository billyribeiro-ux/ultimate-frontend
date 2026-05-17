---
module: 11
exercise: 2
title: Reactive Class State
difficulty: intermediate
estimated_time: 20
skills_tested:
  - $state in classes
  - $derived in classes
  - encapsulated reactive logic
---

# Exercise 11.2 — Reactive Class State

## Brief

Build a shopping cart as a reactive TypeScript class using Svelte 5 runes. The class encapsulates all cart logic (add, remove, update quantity) with reactive state and derived values. Multiple components share the same cart instance.

## Requirements

1. Create `src/lib/state/cart.svelte.ts` with a `Cart` class using `$state` and `$derived`
2. The class manages an array of `CartItem` objects with `id`, `name`, `price`, and `quantity`
3. Implement methods: `add(product)`, `remove(id)`, `updateQuantity(id, qty)`, `clear()`
4. Derived getters: `totalItems` (sum of quantities), `totalPrice` (sum of price * qty), `isEmpty`
5. Export a singleton instance: `export const cart = new Cart()`
6. Create a product listing page that adds items to the cart
7. Create a cart sidebar component that displays the cart contents and totals

## Constraints

- All state must use `$state` runes inside the class
- All computed values must use `$derived`
- The class must be in a `.svelte.ts` file (runes require it)
- No external state management libraries

## Hints (progressive)

<details>
<summary>Hint 1 (free)</summary>

In a `.svelte.ts` file, you can use `$state` and `$derived` inside class fields. `items = $state<CartItem[]>([])` creates a reactive array. Methods that mutate `items` trigger reactivity automatically.
</details>

<details>
<summary>Hint 2 (conceptual)</summary>

Use `$derived` for computed getters: `totalItems = $derived(this.items.reduce((sum, item) => sum + item.quantity, 0))`. The class acts as both the store and the logic layer. Import the singleton in any component to read or modify the cart.
</details>

<details>
<summary>Hint 3 (code sketch)</summary>

```typescript
// src/lib/state/cart.svelte.ts
class Cart {
  items = $state<CartItem[]>([]);
  totalItems = $derived(this.items.reduce((s, i) => s + i.quantity, 0));
  totalPrice = $derived(this.items.reduce((s, i) => s + i.price * i.quantity, 0));

  add(product: Product) {
    const existing = this.items.find(i => i.id === product.id);
    if (existing) { existing.quantity++; }
    else { this.items.push({ ...product, quantity: 1 }); }
  }
}

export const cart = new Cart();
```
</details>

## Solution

<details>
<summary>Full solution</summary>

```typescript
// src/lib/state/cart.svelte.ts
interface Product {
  id: string;
  name: string;
  price: number;
}

interface CartItem extends Product {
  quantity: number;
}

class Cart {
  items = $state<CartItem[]>([]);

  totalItems = $derived(
    this.items.reduce((sum, item) => sum + item.quantity, 0)
  );

  totalPrice = $derived(
    this.items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  );

  isEmpty = $derived(this.items.length === 0);

  add(product: Product): void {
    const existing = this.items.find((item) => item.id === product.id);
    if (existing) {
      existing.quantity++;
    } else {
      this.items.push({ ...product, quantity: 1 });
    }
  }

  remove(id: string): void {
    const index = this.items.findIndex((item) => item.id === id);
    if (index !== -1) {
      this.items.splice(index, 1);
    }
  }

  updateQuantity(id: string, quantity: number): void {
    const item = this.items.find((i) => i.id === id);
    if (item) {
      if (quantity <= 0) {
        this.remove(id);
      } else {
        item.quantity = quantity;
      }
    }
  }

  clear(): void {
    this.items.length = 0;
  }
}

export const cart = new Cart();
export type { Product, CartItem };
```

```svelte
<!-- src/lib/components/CartSidebar.svelte -->
<script lang="ts">
  import { cart } from '$lib/state/cart.svelte';

  const formatter = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });
</script>

<aside class="cart-sidebar">
  <h2>Cart ({cart.totalItems})</h2>

  {#if cart.isEmpty}
    <p class="empty">Your cart is empty</p>
  {:else}
    <ul class="cart-items">
      {#each cart.items as item (item.id)}
        <li class="cart-item">
          <div class="item-info">
            <span class="item-name">{item.name}</span>
            <span class="item-price">{formatter.format(item.price)}</span>
          </div>
          <div class="item-controls">
            <button onclick={() => cart.updateQuantity(item.id, item.quantity - 1)}>-</button>
            <span class="qty">{item.quantity}</span>
            <button onclick={() => cart.updateQuantity(item.id, item.quantity + 1)}>+</button>
            <button class="remove" onclick={() => cart.remove(item.id)}>Remove</button>
          </div>
        </li>
      {/each}
    </ul>

    <div class="cart-footer">
      <div class="total">
        <span>Total</span>
        <span class="total-price">{formatter.format(cart.totalPrice)}</span>
      </div>
      <button class="clear-btn" onclick={() => cart.clear()}>Clear Cart</button>
    </div>
  {/if}
</aside>

<style>
  .cart-sidebar { background: var(--color-surface-2); border: 1px solid var(--color-border); border-radius: var(--radius-md); padding: var(--space-lg); }
  h2 { font-size: var(--text-lg); margin-block-end: var(--space-md); }
  .empty { color: var(--color-text-muted); font-size: var(--text-sm); }
  .cart-items { list-style: none; padding: 0; display: flex; flex-direction: column; gap: var(--space-sm); }
  .cart-item { padding-block-end: var(--space-sm); border-block-end: 1px solid var(--color-border); }
  .item-info { display: flex; justify-content: space-between; margin-block-end: var(--space-xs); }
  .item-name { font-weight: 600; font-size: var(--text-sm); }
  .item-price { color: var(--color-text-muted); font-size: var(--text-sm); }
  .item-controls { display: flex; align-items: center; gap: var(--space-xs); }
  .item-controls button { padding: var(--space-2xs) var(--space-xs); border: 1px solid var(--color-border); border-radius: var(--radius-sm); background: var(--color-surface-1); cursor: pointer; font-size: var(--text-sm); color: var(--color-text); }
  .remove { color: oklch(55% 0.2 25) !important; border-color: transparent !important; background: none !important; }
  .qty { font-weight: 600; min-inline-size: 1.5rem; text-align: center; }
  .cart-footer { margin-block-start: var(--space-md); padding-block-start: var(--space-md); border-block-start: 1px solid var(--color-border); }
  .total { display: flex; justify-content: space-between; font-weight: 700; margin-block-end: var(--space-md); }
  .total-price { color: oklch(55% 0.2 145); }
  .clear-btn { inline-size: 100%; padding: var(--space-xs); background: var(--color-surface-3); border: none; border-radius: var(--radius-sm); cursor: pointer; font-size: var(--text-sm); color: var(--color-text); }
</style>
```

```svelte
<!-- src/routes/shop/+page.svelte -->
<script lang="ts">
  import { cart, type Product } from '$lib/state/cart.svelte';
  import CartSidebar from '$lib/components/CartSidebar.svelte';

  const products: Product[] = [
    { id: 'p1', name: 'Svelte Handbook', price: 39.99 },
    { id: 'p2', name: 'TypeScript Guide', price: 29.99 },
    { id: 'p3', name: 'CSS Masterclass', price: 49.99 },
    { id: 'p4', name: 'GSAP Animations', price: 34.99 }
  ];

  const formatter = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });
</script>

<div class="shop">
  <main class="products">
    <h1>Products</h1>
    <div class="product-grid">
      {#each products as product (product.id)}
        <div class="product-card">
          <h2>{product.name}</h2>
          <p class="price">{formatter.format(product.price)}</p>
          <button onclick={() => cart.add(product)}>Add to Cart</button>
        </div>
      {/each}
    </div>
  </main>

  <CartSidebar />
</div>

<style>
  .shop { display: grid; grid-template-columns: 1fr 20rem; gap: var(--space-lg); padding: var(--space-lg); max-inline-size: 64rem; margin-inline: auto; }
  h1 { font-size: var(--text-2xl); margin-block-end: var(--space-lg); }
  .product-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(14rem, 1fr)); gap: var(--space-md); }
  .product-card { background: var(--color-surface-2); border: 1px solid var(--color-border); border-radius: var(--radius-md); padding: var(--space-lg); text-align: center; }
  .product-card h2 { font-size: var(--text-base); margin-block-end: var(--space-sm); }
  .price { font-size: var(--text-lg); font-weight: 700; color: oklch(55% 0.2 145); margin-block-end: var(--space-md); }
  .product-card button { padding: var(--space-xs) var(--space-md); background: oklch(55% 0.2 250); color: white; border: none; border-radius: var(--radius-sm); cursor: pointer; font-weight: 600; }
</style>
```

### Explanation

Reactive classes in Svelte 5 combine the encapsulation of OOP with the reactivity of runes. `$state` fields track changes automatically, and `$derived` getters recompute when their dependencies change. The singleton pattern (`export const cart = new Cart()`) shares one instance across all components that import it, making it behave like a global store but with methods that enforce business logic. Unlike plain objects with `$state`, classes let you co-locate state, computed values, and mutations in a single, testable unit.
</details>
