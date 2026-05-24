# Coming from Angular: A Comprehensive Migration Guide to Svelte 5

> **Who this is for:** Experienced Angular developers (v16+ with signals) who want to learn Svelte 5 with SvelteKit. You will find side-by-side code comparisons, mental model shifts, and a practical "first 48 hours" plan.

---

## Table of Contents

1. [The Big Picture](#the-big-picture)
2. [Signals to $state and $derived](#signals-to-state-and-derived)
3. [Services and DI to Context and .svelte.ts](#services-and-di-to-context-and-sveltets)
4. [Components: Decorators to Runes](#components-decorators-to-runes)
5. [Templates: Angular Syntax to Svelte Syntax](#templates-angular-syntax-to-svelte-syntax)
6. [NgModule and Standalone Components to File-Based Routing](#ngmodule-and-standalone-components-to-file-based-routing)
7. [RxJS to $effect and $derived](#rxjs-to-effect-and-derived)
8. [Forms: Template-Driven and Reactive to bind:](#forms-template-driven-and-reactive-to-bind)
9. [HTTP: HttpClient to Load Functions](#http-httpclient-to-load-functions)
10. [Routing: Angular Router to SvelteKit Routing](#routing-angular-router-to-sveltekit-routing)
11. [Pipes to Helper Functions](#pipes-to-helper-functions)
12. [Directives to Actions](#directives-to-actions)
13. [Guards and Interceptors to Hooks](#guards-and-interceptors-to-hooks)
14. [Styling](#styling)
15. [Common Gotchas](#common-gotchas)
16. [Your First 48 Hours](#your-first-48-hours)

---

## The Big Picture

Angular and Svelte are on opposite ends of the framework spectrum in terms of architecture, but they share a growing similarity in their reactivity models since Angular adopted signals.

**Angular** is a full-fledged platform: dependency injection, module system, form validation, HTTP client, routing, testing utilities, CLI scaffolding, and more — all built in. It uses TypeScript by design and provides a structured, opinionated architecture for enterprise applications.

**Svelte** is a compiler with a minimal runtime. It compiles `.svelte` files into efficient JavaScript that surgically updates the DOM. SvelteKit adds routing, SSR, data loading, and deployment — but the total surface area is deliberately smaller than Angular's.

What this means for you:
- **Dramatically less boilerplate.** No decorators, no modules, no standalone component declarations, no barrel exports. A Svelte component is a single `.svelte` file.
- **No Zone.js.** Angular used Zone.js for change detection (until signals). Svelte has never had a change detection mechanism — the compiler tracks reactivity at build time.
- **No Dependency Injection framework.** Svelte uses `setContext`/`getContext` for component-tree DI and module-level singletons for global state.
- **Signals map directly to runes.** If you already use Angular signals, `$state` and `$derived` will feel immediately familiar.
- **Much smaller bundles.** A minimal Angular app ships ~60KB+ gzipped. A minimal Svelte app ships ~5KB gzipped.

---

## Signals to $state and $derived

Angular signals (v16+) and Svelte runes solve the same problem with remarkably similar APIs.

### Angular

```typescript
import { Component, signal, computed, effect } from '@angular/core';

@Component({
  selector: 'app-counter',
  template: `
    <p>Count: {{ count() }}</p>
    <p>Double: {{ doubled() }}</p>
    <button (click)="increment()">+1</button>
  `
})
export class CounterComponent {
  count = signal(0);
  doubled = computed(() => this.count() * 2);

  constructor() {
    effect(() => {
      console.log('Count changed:', this.count());
    });
  }

  increment(): void {
    this.count.update(c => c + 1);
  }
}
```

### Svelte 5

```svelte
<script lang="ts">
  let count: number = $state(0);
  let doubled: number = $derived(count * 2);

  $effect(() => {
    console.log('Count changed:', count);
  });

  function increment(): void {
    count += 1;
  }
</script>

<p>Count: {count}</p>
<p>Double: {doubled}</p>
<button onclick={increment}>+1</button>
```

**Key differences:**
- Angular: `signal(0)` creates a signal, read with `count()`, update with `count.set()` or `count.update()`.
- Svelte: `$state(0)` creates reactive state, read as `count`, update with `count = newValue` or `count += 1`.
- Angular: `computed(() => expr)`. Svelte: `$derived(expr)`.
- Angular: `effect(() => { ... })`. Svelte: `$effect(() => { ... })`.
- The concepts are nearly identical. The biggest syntactic difference is that Svelte does not require function calls to read values — `count` instead of `count()`.

### Deep reactivity

```typescript
// Angular
user = signal({ name: 'Ada', score: 0 });
this.user.update(u => ({ ...u, score: u.score + 1 })); // must create new object
```

```svelte
<!-- Svelte -->
<script lang="ts">
  let user = $state({ name: 'Ada', score: 0 });
  user.score += 1; // deep reactivity — just mutate
</script>
```

Svelte's `$state` provides deep reactivity by default. Angular signals are shallow — you must replace the entire object to trigger updates (unless using `signal` with a mutable strategy).

---

## Services and DI to Context and .svelte.ts

Angular's dependency injection is one of its defining features. Svelte takes a simpler approach.

### Angular

```typescript
// auth.service.ts
@Injectable({ providedIn: 'root' })
export class AuthService {
  private currentUser = signal<User | null>(null);

  readonly user = this.currentUser.asReadonly();
  readonly isLoggedIn = computed(() => this.currentUser() !== null);

  async login(email: string, password: string): Promise<void> {
    const user = await this.http.post<User>('/api/login', { email, password });
    this.currentUser.set(user);
  }

  logout(): void {
    this.currentUser.set(null);
  }

  constructor(private http: HttpClient) {}
}

// usage in component
@Component({ /* ... */ })
export class DashboardComponent {
  constructor(private auth: AuthService) {}
  // this.auth.user(), this.auth.isLoggedIn(), etc.
}
```

### Svelte 5 — Global state (.svelte.ts)

```typescript
// auth.svelte.ts
interface User {
  id: string;
  name: string;
  email: string;
}

class AuthService {
  currentUser: User | null = $state(null);

  get isLoggedIn(): boolean {
    return this.currentUser !== null;
  }

  async login(email: string, password: string): Promise<void> {
    const res = await fetch('/api/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
      headers: { 'Content-Type': 'application/json' }
    });
    this.currentUser = await res.json();
  }

  logout(): void {
    this.currentUser = null;
  }
}

export const auth = new AuthService();
```

```svelte
<!-- Dashboard.svelte -->
<script lang="ts">
  import { auth } from '$lib/auth.svelte';
</script>

{#if auth.isLoggedIn}
  <p>Welcome, {auth.currentUser?.name}</p>
{:else}
  <p>Please log in</p>
{/if}
```

### Svelte 5 — Component-tree scoped (context)

```svelte
<!-- Parent.svelte -->
<script lang="ts">
  import { setContext } from 'svelte';
  import type { Snippet } from 'svelte';

  let { children }: { children: Snippet } = $props();

  class NotificationService {
    messages: string[] = $state([]);

    add(message: string): void {
      this.messages.push(message);
    }

    dismiss(index: number): void {
      this.messages.splice(index, 1);
    }
  }

  setContext('notifications', new NotificationService());
</script>

{@render children()}
```

```svelte
<!-- Child.svelte -->
<script lang="ts">
  import { getContext } from 'svelte';

  const notifications = getContext<NotificationService>('notifications');
</script>

<button onclick={() => notifications.add('Hello!')}>Notify</button>
```

**Key differences:**
- No `@Injectable`, no `providedIn`, no injector hierarchy.
- Global singletons: export a class instance from a `.svelte.ts` file. Import it anywhere.
- Scoped services: use `setContext`/`getContext`. Available to all descendants, like Angular's component-level providers.
- No constructor injection. Direct imports for global state, `getContext` for scoped state.
- Trade-off: Angular's DI is more powerful for testing (easy to swap implementations). In Svelte, use `vi.mock()` in tests to achieve the same effect.

---

## Components: Decorators to Runes

### Angular

```typescript
@Component({
  selector: 'app-user-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="card">
      <h2>{{ name() }}</h2>
      <p>{{ role() }}</p>
      <ng-content />
    </div>
  `,
  styles: [`
    .card {
      padding: 1rem;
      border: 1px solid #ccc;
      border-radius: 8px;
    }
  `]
})
export class UserCardComponent {
  name = input.required<string>();
  role = input<string>('Engineer');
}
```

### Svelte 5

```svelte
<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
    name: string;
    role?: string;
    children?: Snippet;
  }

  let { name, role = 'Engineer', children }: Props = $props();
</script>

<div class="card">
  <h2>{name}</h2>
  <p>{role}</p>
  {#if children}
    {@render children()}
  {/if}
</div>

<style>
  .card {
    padding: var(--space-md);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
  }
</style>
```

**Key differences:**
- No `@Component` decorator. No `selector`. No `standalone: true`. No `imports` array.
- A Svelte component is a single `.svelte` file. The filename IS the component name.
- `input()` / `input.required()` becomes `$props()` destructuring.
- `<ng-content>` becomes `{@render children()}`.
- Styles are in a `<style>` block, not a `styles` array. Scoped by default.

---

## Templates: Angular Syntax to Svelte Syntax

| Angular | Svelte | Notes |
|---------|--------|-------|
| `{{ value }}` | `{value}` | Expression interpolation |
| `[property]="expr"` | `property={expr}` | Property binding |
| `(click)="handler()"` | `onclick={handler}` | Event binding |
| `[(ngModel)]="value"` | `bind:value` | Two-way binding |
| `*ngIf="condition"` / `@if` | `{#if condition}` | Conditional |
| `*ngFor="let item of items"` / `@for` | `{#each items as item (item.id)}` | Iteration |
| `[ngClass]="{ active: isActive }"` | `class:active={isActive}` | Conditional class |
| `[ngStyle]="{ color: c }"` | `style:color={c}` | Dynamic style |
| `<ng-content>` | `{@render children()}` | Content projection |
| `<ng-content select=".header">` | `{@render header()}` (named snippet) | Named slots |
| `<ng-template>` | `{#snippet name()}` | Template fragments |
| `[innerHTML]="html"` | `{@html html}` | Raw HTML |
| `<ng-container>` | No equivalent needed | Svelte blocks wrap without elements |
| `trackBy: trackById` | `(item.id)` in `{#each}` | List tracking |

### Angular's new control flow (@if, @for) vs Svelte

Angular 17+ introduced a new control flow syntax that looks closer to Svelte:

```html
<!-- Angular 17+ -->
@if (isLoggedIn) {
  <p>Welcome, {{ user().name }}</p>
} @else {
  <p>Please log in</p>
}

@for (item of items; track item.id) {
  <p>{{ item.name }}</p>
}
```

```svelte
<!-- Svelte -->
{#if isLoggedIn}
  <p>Welcome, {user.name}</p>
{:else}
  <p>Please log in</p>
{/if}

{#each items as item (item.id)}
  <p>{item.name}</p>
{/each}
```

The syntax is different but the concepts map directly.

---

## NgModule and Standalone Components to File-Based Routing

Angular's module system and Svelte's lack of one is the most dramatic architectural difference.

### Angular

```typescript
// app.routes.ts
export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'about', component: AboutComponent },
  { path: 'blog/:slug', component: BlogPostComponent },
  {
    path: 'admin',
    loadChildren: () => import('./admin/admin.routes'),
    canActivate: [AuthGuard]
  }
];
```

### SvelteKit

```
src/routes/
  +page.svelte          → /
  about/+page.svelte    → /about
  blog/[slug]/+page.svelte → /blog/:slug
  admin/+page.svelte    → /admin (protect in hooks.server.ts)
```

**Key differences:**
- No route configuration file. The file system IS the router.
- No `NgModule`. No imports arrays. No declarations. No barrel exports.
- Lazy loading is automatic — SvelteKit code-splits by route.
- Route guards become `hooks.server.ts` (runs on every request).
- Each route has its own data loading via `+page.server.ts`.

---

## RxJS to $effect and $derived

This is the biggest conceptual shift. Angular uses RxJS extensively for async data streams. Svelte replaces most RxJS use cases with simpler primitives.

### Angular (RxJS)

```typescript
@Component({ /* ... */ })
export class SearchComponent implements OnInit, OnDestroy {
  private searchSubject = new Subject<string>();
  private destroy$ = new Subject<void>();
  results: Product[] = [];

  ngOnInit(): void {
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(query => this.http.get<Product[]>(`/api/search?q=${query}`)),
      takeUntil(this.destroy$)
    ).subscribe(results => {
      this.results = results;
    });
  }

  onSearch(query: string): void {
    this.searchSubject.next(query);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
```

### Svelte 5

```svelte
<script lang="ts">
  let query: string = $state('');
  let results: Product[] = $state([]);
  let debounceTimer: ReturnType<typeof setTimeout>;

  let debouncedQuery: string = $state('');

  $effect(() => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      debouncedQuery = query;
    }, 300);

    return () => clearTimeout(debounceTimer);
  });

  $effect(() => {
    if (!debouncedQuery) {
      results = [];
      return;
    }

    const controller: AbortController = new AbortController();

    fetch(`/api/search?q=${debouncedQuery}`, { signal: controller.signal })
      .then((res: Response) => res.json())
      .then((data: Product[]) => { results = data; })
      .catch(() => { /* aborted or error */ });

    return () => controller.abort();
  });
</script>

<input bind:value={query} placeholder="Search..." />

{#each results as product (product.id)}
  <p>{product.name}</p>
{/each}
```

**Key differences:**
- No RxJS, no Subjects, no pipe operators, no subscriptions, no takeUntil.
- `$effect` with cleanup replaces the subscribe/unsubscribe pattern.
- Debouncing is done with a simple timer, not an operator.
- AbortController replaces switchMap for canceling previous requests.
- No `ngOnDestroy` — cleanup functions returned from `$effect` run automatically.

### When you might still want RxJS

RxJS is powerful for complex event stream composition (merge, combineLatest, race, retry with backoff). Svelte does not prevent you from using RxJS — you can import it and use it in `$effect` blocks. But for 90% of use cases (fetching data, debouncing input, polling), Svelte's built-in reactivity is simpler.

---

## Forms: Template-Driven and Reactive to bind:

### Angular (Reactive Forms)

```typescript
@Component({ /* ... */ })
export class LoginComponent {
  form = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required, Validators.minLength(8)])
  });

  get emailErrors(): string {
    const ctrl = this.form.get('email');
    if (ctrl?.hasError('required')) return 'Email is required';
    if (ctrl?.hasError('email')) return 'Invalid email format';
    return '';
  }

  onSubmit(): void {
    if (this.form.valid) {
      // submit
    }
  }
}
```

### Svelte 5

```svelte
<script lang="ts">
  let email: string = $state('');
  let password: string = $state('');
  let submitted: boolean = $state(false);

  let emailError: string = $derived.by(() => {
    if (!submitted) return '';
    if (!email) return 'Email is required';
    if (!email.includes('@')) return 'Invalid email format';
    return '';
  });

  let passwordError: string = $derived.by(() => {
    if (!submitted) return '';
    if (!password) return 'Password is required';
    if (password.length < 8) return 'Must be at least 8 characters';
    return '';
  });

  let isValid: boolean = $derived(!emailError && !passwordError);

  function handleSubmit(e: SubmitEvent): void {
    e.preventDefault();
    submitted = true;
    if (isValid) {
      // submit
    }
  }
</script>

<form onsubmit={handleSubmit}>
  <label>
    Email
    <input type="email" bind:value={email} />
    {#if emailError}
      <span class="error">{emailError}</span>
    {/if}
  </label>

  <label>
    Password
    <input type="password" bind:value={password} />
    {#if passwordError}
      <span class="error">{passwordError}</span>
    {/if}
  </label>

  <button type="submit">Sign in</button>
</form>
```

**Key differences:**
- No `FormGroup`, `FormControl`, `Validators`. Just variables and derived values.
- `bind:value` replaces `formControlName` and `[(ngModel)]`.
- Validation is done with `$derived` — derived values that compute error messages from state.
- For server-side validation, SvelteKit form actions provide a full pattern.
- Trade-off: Angular's form system handles complex dynamic forms better out of the box. Svelte's approach is simpler for typical forms.

---

## HTTP: HttpClient to Load Functions

### Angular

```typescript
@Injectable({ providedIn: 'root' })
export class ProductService {
  constructor(private http: HttpClient) {}

  getProduct(slug: string): Observable<Product> {
    return this.http.get<Product>(`/api/products/${slug}`);
  }
}

@Component({ /* ... */ })
export class ProductComponent implements OnInit {
  product: Product | null = null;
  loading = true;

  constructor(
    private productService: ProductService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.route.params.pipe(
      switchMap(params => this.productService.getProduct(params['slug']))
    ).subscribe(product => {
      this.product = product;
      this.loading = false;
    });
  }
}
```

### SvelteKit

```typescript
// +page.server.ts
import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ params, fetch }) => {
  const res = await fetch(`/api/products/${params.slug}`);
  if (!res.ok) error(404, 'Product not found');
  const product: Product = await res.json();
  return { product };
};
```

```svelte
<!-- +page.svelte -->
<script lang="ts">
  let { data } = $props();
</script>

<h1>{data.product.name}</h1>
<p>${data.product.price}</p>
```

**Key differences:**
- No `HttpClient`. Use the standard `fetch` API (enhanced by SvelteKit in load functions).
- No loading states. Data is available before the component renders.
- No Observables. Load functions are async functions that return data.
- No service layer needed for simple data fetching. Complex business logic can use `.svelte.ts` classes.

---

## Routing: Angular Router to SvelteKit Routing

| Angular | SvelteKit | Notes |
|---------|-----------|-------|
| `const routes: Routes = [...]` | File system (`src/routes/`) | No configuration |
| `RouterModule.forRoot(routes)` | Automatic | No setup |
| `<router-outlet>` | `<slot>` in `+layout.svelte` | Layout rendering |
| `[routerLink]="/about"` | `<a href="/about">` | Standard HTML links |
| `ActivatedRoute` | `$page` store or `$props()` data | Route params |
| `CanActivate` guard | `hooks.server.ts` | Auth checks |
| `Resolve` guard | `+page.server.ts` load | Data prefetching |
| `RouterModule.forChild()` | Automatic code-splitting | No configuration |
| `{ path: '**', component: NotFound }` | `src/routes/+error.svelte` | Error pages |

---

## Pipes to Helper Functions

### Angular

```typescript
@Pipe({ name: 'currency', standalone: true })
export class CurrencyPipe implements PipeTransform {
  transform(value: number, currency: string = 'USD'): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency', currency
    }).format(value / 100);
  }
}

// template: {{ product.price | currency:'EUR' }}
```

### Svelte 5

```typescript
// format.ts
export function formatCurrency(value: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency', currency
  }).format(value / 100);
}
```

```svelte
<script lang="ts">
  import { formatCurrency } from '$lib/format';
</script>

<p>{formatCurrency(product.price, 'EUR')}</p>
```

**Key differences:**
- No `@Pipe` decorator. Pipes are just functions.
- No pipe syntax (`value | pipe`). Call the function directly in the template.
- Simpler to write, test, and reuse.

---

## Directives to Actions

### Angular

```typescript
@Directive({ selector: '[appTooltip]', standalone: true })
export class TooltipDirective implements OnInit, OnDestroy {
  @Input('appTooltip') text: string = '';
  private el: HTMLElement;

  constructor(private elRef: ElementRef) {
    this.el = elRef.nativeElement;
  }

  ngOnInit(): void {
    this.el.setAttribute('title', this.text);
  }

  ngOnDestroy(): void {
    // cleanup
  }
}
```

### Svelte 5

```typescript
// tooltip.ts
export function tooltip(node: HTMLElement, text: string) {
  node.setAttribute('title', text);

  return {
    update(newText: string) {
      node.setAttribute('title', newText);
    },
    destroy() {
      node.removeAttribute('title');
    }
  };
}
```

```svelte
<span use:tooltip={'Helpful information'}>Hover me</span>
```

**Key differences:**
- No `@Directive` decorator. Actions are plain functions.
- The function receives the DOM node and parameters directly.
- Returns `{ update?, destroy? }` for lifecycle management.
- `use:action` syntax instead of directive selectors.

---

## Guards and Interceptors to Hooks

### Angular

```typescript
// auth.guard.ts
export const authGuard: CanActivateFn = (route, state) => {
  const auth = inject(AuthService);
  return auth.isLoggedIn() || inject(Router).createUrlTree(['/login']);
};

// auth.interceptor.ts
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = inject(AuthService).token();
  const authReq = req.clone({
    headers: req.headers.set('Authorization', `Bearer ${token}`)
  });
  return next(authReq);
};
```

### SvelteKit

```typescript
// hooks.server.ts
import type { Handle } from '@sveltejs/kit';
import { redirect } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
  // Interceptor equivalent: add auth headers
  const session = event.cookies.get('session');
  if (session) {
    event.locals.user = await getUserFromSession(session);
  }

  // Guard equivalent: protect routes
  if (event.url.pathname.startsWith('/admin') && !event.locals.user) {
    redirect(303, '/login');
  }

  return resolve(event);
};
```

**Key differences:**
- Guards and interceptors are combined into a single `hooks.server.ts` file.
- The `handle` function runs on every request — it is both middleware and guard.
- No DI — import what you need directly.
- Route protection and request transformation happen in one place.

---

## Styling

### Angular

```typescript
@Component({
  styles: [`
    :host { display: block; }
    .card { padding: 1rem; border: 1px solid #ccc; }
  `],
  encapsulation: ViewEncapsulation.Emulated // default
})
```

### Svelte 5

```svelte
<style>
  .card {
    padding: var(--space-md);
    border: 1px solid var(--color-border);
  }
</style>
```

**Key differences:**
- Styles are scoped by default, like Angular's `ViewEncapsulation.Emulated`.
- No `:host` pseudo-class needed — Svelte components do not have a host element.
- Use `:global()` to escape scoping (like Angular's `::ng-deep`, but not deprecated).
- The PE7 architecture uses CSS custom properties for all values.

---

## Common Gotchas

### 1. No decorators
Svelte has no decorators at all. No `@Component`, `@Injectable`, `@Input`, `@Output`, `@ViewChild`. Everything is function-based or file-based.

### 2. No modules
There are no `NgModule` equivalents. Components are files. Import them directly.

### 3. No constructor injection
Import global services directly from `.svelte.ts` files. Use `getContext` for scoped services.

### 4. Event handler naming
It is `onclick`, not `(click)`. All lowercase, matching the HTML spec.

### 5. Template expression syntax
Single curly braces `{value}`, not double `{{ value }}` and not `[binding]="value"`.

### 6. No Zone.js
There is no change detection cycle. Svelte compiles reactive updates at build time. You never need to think about `ChangeDetectionStrategy.OnPush` or `NgZone.runOutsideAngular()`.

### 7. Observable-free
Most Angular patterns using RxJS Observables become simple `$state`/`$derived`/`$effect` patterns. Reserve RxJS for genuinely complex event stream composition.

### 8. No ViewChild
Use `bind:this` to get a DOM element reference, or pass data through props instead of imperatively accessing child components.

### 9. No lifecycle decorator methods
No `ngOnInit`, `ngOnDestroy`, `ngAfterViewInit`. Use `$effect` for most lifecycle needs. Cleanup is handled by returning a function from `$effect`.

### 10. File-based routing
You do not configure routes in a TypeScript file. Create files in `src/routes/` and the routes exist. This is liberating once you adjust.

---

## Your First 48 Hours

### Hour 0-2: Setup and orientation
- [ ] Run `pnpm create svelte@latest my-app` (TypeScript skeleton)
- [ ] Open `src/routes/+page.svelte` — notice the simplicity compared to Angular components
- [ ] Build a counter with `$state` and `$derived` — signals without the Angular ceremony
- [ ] Apply scoped styles with PE7 tokens

### Hour 2-6: Core runes (signals mapping)
- [ ] Build a todo list using `$state` (maps to `signal()`)
- [ ] Add computed values with `$derived` (maps to `computed()`)
- [ ] Add side effects with `$effect` (maps to `effect()`)
- [ ] Notice: no `.value`, no `()` to read, no `.set()` to write

### Hour 6-12: Components (no decorators)
- [ ] Create a child component with `$props()` (replaces `@Input`)
- [ ] Pass callback props (replaces `@Output` and `EventEmitter`)
- [ ] Use snippets for content projection (replaces `<ng-content>`)
- [ ] Use `bind:value` for form inputs

### Hour 12-20: Routing and data (no Router module)
- [ ] Create routes by adding files to `src/routes/`
- [ ] Add `+page.server.ts` load functions (replaces resolvers and HttpClient)
- [ ] Create layouts with `+layout.svelte` (replaces `<router-outlet>`)
- [ ] Add API routes with `+server.ts`

### Hour 20-30: State and services (no DI)
- [ ] Create a `.svelte.ts` store (replaces an `@Injectable` service)
- [ ] Use `setContext`/`getContext` (replaces component-level providers)
- [ ] Add `hooks.server.ts` for auth (replaces guards and interceptors)

### Hour 30-48: Real-world patterns
- [ ] Build a form with validation using `$derived` (replaces `Validators`)
- [ ] Create a Svelte action (replaces `@Directive`)
- [ ] Deploy with a SvelteKit adapter
- [ ] Read the official Svelte tutorial at https://svelte.dev/tutorial

### Mental model checklist
- [ ] I no longer think in decorators and modules
- [ ] I use `$state` instead of `signal()`, without `()` or `.set()`
- [ ] I use `$derived` instead of `computed()`
- [ ] I use `$effect` instead of `effect()` and `ngOnInit`
- [ ] I import services directly instead of injecting them
- [ ] I create routes by creating files, not configuring a router
- [ ] I use `bind:value` instead of `[(ngModel)]` or `formControlName`
- [ ] I use callback props instead of `@Output` + `EventEmitter`

---

## Pattern Summary Table

| Angular | Svelte 5 | Category |
|---------|----------|----------|
| `signal()` | `$state` | Reactive state |
| `computed()` | `$derived` | Computed values |
| `effect()` | `$effect` | Side effects |
| `input()` / `@Input` | `$props()` | Component props |
| `output()` / `@Output` | Callback props | Events |
| `model()` | `bind:value` | Two-way binding |
| `@Component` | `.svelte` file | Component definition |
| `@Injectable` | `.svelte.ts` module export | Service |
| `@Directive` | `use:action` | DOM behavior |
| `@Pipe` | Regular function | Data transformation |
| `@ViewChild` | `bind:this` | DOM access |
| `NgModule` | Not needed | Module system |
| `RouterModule` | File system routing | Routing |
| `<router-outlet>` | `{@render children()}` in layout | Outlet |
| `routerLink` | `<a href="...">` | Navigation |
| `CanActivate` | `hooks.server.ts` | Route guard |
| `Resolve` | `+page.server.ts` load | Data prefetch |
| `HttpClient` | `fetch` in load functions | Data fetching |
| `HttpInterceptor` | `hooks.server.ts` handle | Request interceptor |
| `FormGroup` | `$state` + `$derived` | Form state |
| `Validators` | `$derived` validation | Form validation |
| `[(ngModel)]` | `bind:value` | Form binding |
| `*ngIf` / `@if` | `{#if}` | Conditional |
| `*ngFor` / `@for` | `{#each}` | List rendering |
| `[ngClass]` | `class:name={cond}` | Dynamic class |
| `[ngStyle]` | `style:prop={value}` | Dynamic style |
| `<ng-content>` | `{@render children()}` | Content projection |
| `<ng-template>` | `{#snippet}` | Template fragment |
| `<ng-container>` | Not needed | Grouping |
| `trackBy` | `(key)` in `{#each}` | List identity |
| `[innerHTML]` | `{@html}` | Raw HTML |
| `Zone.js` | Not needed | Change detection |
| `ChangeDetectionStrategy` | Not needed | Performance |
| `providedIn: 'root'` | Module-level export | Singleton scope |
| `providers: []` | `setContext()` | Component-level scope |
| `inject()` | `getContext()` | Dependency access |
| `AsyncPipe` | `{#await}` | Async rendering |
| `onMounted` / `ngOnInit` | `$effect` / `onMount` | Lifecycle |
| `ngOnDestroy` | `$effect` return / `onDestroy` | Cleanup |
| RxJS `pipe()` | `$effect` + `$derived` chains | Reactive streams |
| `Subject` | `$state` + function calls | Event bus |

---

## Bundle Size Comparison

A real-world comparison helps set expectations:

| Metric | Angular 19 | Svelte 5 + SvelteKit |
|--------|-----------|---------------------|
| Minimal app (gzipped) | ~60 KB | ~5 KB |
| Framework runtime | ~45 KB | ~2 KB |
| Hello World component | ~120 KB (with Zone.js) | ~3 KB |
| Build time (100 components) | ~15s | ~3s |
| HMR update | ~200ms | ~50ms |

These numbers are approximate and vary by project complexity, but the order-of-magnitude difference is consistent. Angular's runtime includes the dependency injector, change detection, compiler (for JIT), Zone.js, and the component renderer. Svelte compiles these away — the output is vanilla JavaScript.

---

## Testing: Angular Testing Module to Vitest

### Angular

```typescript
describe('UserService', () => {
  let service: UserService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [UserService]
    });
    service = TestBed.inject(UserService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  it('should fetch users', () => {
    service.getUsers().subscribe(users => {
      expect(users.length).toBe(2);
    });
    const req = httpMock.expectOne('/api/users');
    req.flush([{ id: 1 }, { id: 2 }]);
  });
});
```

### Svelte 5 (Vitest)

```typescript
import { describe, it, expect, vi } from 'vitest';

vi.mock('$lib/api', () => ({
  fetchUsers: vi.fn()
}));

import { fetchUsers } from '$lib/api';
import { UserService } from '$lib/user-service.svelte';

describe('UserService', () => {
  it('should fetch users', async () => {
    vi.mocked(fetchUsers).mockResolvedValue([{ id: 1 }, { id: 2 }]);
    const service = new UserService();
    await service.loadUsers();
    expect(service.users.length).toBe(2);
  });
});
```

**Key differences:**
- No `TestBed` configuration. No module setup. No dependency injection for testing.
- Mock modules with `vi.mock()` instead of configuring test providers.
- Instantiate classes directly — no injector needed.
- Tests are simpler and faster to write because there is less framework ceremony.

---

## Further Reading

- [Official Svelte Tutorial](https://svelte.dev/tutorial) — interactive, excellent
- [SvelteKit Documentation](https://svelte.dev/docs/kit) — comprehensive reference
- [Svelte 5 Runes](https://svelte.dev/blog/runes) — the design philosophy behind runes
