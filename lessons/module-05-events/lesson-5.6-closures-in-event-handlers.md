---
module: 5
lesson: 5.6
title: Closures in event handlers
duration: 50 minutes
prerequisites:
  - Lesson 5.2 (functions deeply)
  - Lesson 5.5 (callback props)
learning_objectives:
  - Explain in your own words what a closure is
  - Identify the enclosing scope of a function by reading its source
  - Use a closure to give each button in a loop its own state
  - Recognise and fix the classic "all buttons share the last index" bug
  - Explain why Svelte runes work correctly inside closures
status: ready
---

# Lesson 5.6 — Closures in event handlers

## 1. Concept — The memory a function carries with it

### 1.1 The problem: ten buttons that all behave like the last one

Imagine you want to render ten buttons, each of which logs its own index when clicked. Naïve code:

```svelte
<script lang="ts">
    const labels: string[] = ['A', 'B', 'C', 'D', 'E'];
    let i: number;

    // WRONG: the handler uses the variable `i`, not the value it had
    // at render time. After the loop, `i` is 5. Every handler prints 5.
    const handlers: (() => void)[] = [];
    for (i = 0; i < labels.length; i++) {
        handlers.push(() => console.log(i));
    }
</script>
```

Click any button, and the console prints `5`. Every time. The bug has tortured JavaScript programmers for two decades. The fix is a single word change — `let` instead of `var`/outer scope — and understanding *why* that fix works means understanding closures.

### 1.2 The definition

A **closure** is a function plus the scope it was defined in. When JavaScript creates a function, it does not just remember the function's body; it also remembers a reference to every variable that was in scope at the moment the function was created. The function "closes over" those variables — hence the name. When you later call the function, it can read and write those same variables even if you have moved far away from where they were declared.

A simple, isolated example:

```ts
function makeCounter(): () => number {
    let count: number = 0;
    return (): number => {
        count += 1;
        return count;
    };
}

const a = makeCounter();
a(); // 1
a(); // 2
a(); // 3

const b = makeCounter();
b(); // 1 — b has its own count
```

The function returned by `makeCounter` has captured the local variable `count`. Every call to `makeCounter` creates a *new* `count` and a *new* function that closes over it. The two counters `a` and `b` do not share state because they do not share scope.

### 1.3 Why closures fix the ten-buttons bug

Go back to the broken loop. It uses `let i` declared *outside* the loop, which means every iteration writes to the same variable. Every arrow function captures a reference to *that* variable. By the time the loop ends, all five arrows point at the same `i`, whose value is now `5`. Click a button and the handler reads `i` — it sees `5`.

The fix is to put `i` *inside* the loop header:

```ts
for (let i = 0; i < labels.length; i++) {
    handlers.push(() => console.log(i));
}
```

`let` in a `for` header creates a new binding per iteration. Each iteration of the loop has its own `i`. Each arrow closes over its own copy. Click button 3 and it prints `3`.

A cleaner fix is to use `Array.prototype.forEach` or `map`, which gives you a parameter for free:

```ts
labels.forEach((label, index) => {
    handlers.push(() => console.log(index));
});
```

`index` is a parameter — a fresh binding per call — so every handler captures its own value. No ambiguity.

### 1.4 In Svelte 5: `{#each}` + inline arrow = always correct

Svelte's `{#each}` loop creates a fresh scope per iteration, and an inline arrow inside it captures the per-iteration variables correctly. You almost never have to think about the trap:

```svelte
{#each items as item, i (item.id)}
    <button onclick={() => select(item, i)}>{item.name}</button>
{/each}
```

Each rendered button gets its own arrow function closing over its own `item` and `i`. No bug, no workaround.

### 1.5 Closures and runes

A common question: do Svelte 5 runes work inside closures? Yes — and that is the whole point. `$state` variables are ordinary JavaScript identifiers (behind the scenes they are reactive proxies, but you read and write them as variables). A handler defined anywhere in your component closes over the runes it uses, and reading or writing them triggers reactivity exactly as if the handler were inline in the markup.

```svelte
<script lang="ts">
    let count: number = $state(0);

    function makeIncrementBy(delta: number): () => void {
        // Closure captures both `count` (reactive) and `delta` (local constant).
        return () => {
            count += delta;
        };
    }

    const addOne = makeIncrementBy(1);
    const addFive = makeIncrementBy(5);
</script>

<button onclick={addOne}>+1</button>
<button onclick={addFive}>+5</button>
```

Each factory call produces a new handler with its own captured `delta` but both sharing the same reactive `count`. This is closures at their most useful: they let you build parameterised handlers without global state.

### 1.6 Memory considerations

Closures hold references to their captured variables, which means the garbage collector cannot free those variables until the closure itself is unreachable. In a component that adds a handler and never removes it, this is harmless — the component and its handlers live and die together. In a long-lived module that accumulates closures in an array, it can leak. Be aware, but do not be paranoid: the trap is specific and rare.

## 2. Style it — A grid of "add N" buttons

The mini-build is a 3×3 grid of buttons, each of which adds a different amount to a counter. The amount is baked into the handler by a closure factory. Per-page colour: `oklch(68% 0.18 180)` (teal).

## 3. Interact — Watch the broken version first

Write the bug on purpose: a `for (let i = 0; i < 9; i++)` loop that pushes handlers into an array, but with `i` declared *outside* the loop. Click any button and the console shows the last number every time. Then move `let i` into the loop header and see every button print its own value. The rune-based version is added next to prove that reactive state plays nicely with captured variables.

## 4. Mini-build — The closure grid

**File:** `src/routes/modules/05-events/06-closures/+page.svelte`

The page renders nine buttons. Each button is wired to a handler produced by a `makeAdder(n)` factory that closes over `n`. Clicking any button adds `n` to a `$state` total. Every button has its own `n`; they all share the one `total`.

### DevTools verification

Open the Sources panel, add a breakpoint on the first line inside `makeAdder`, and reload. Watch the breakpoint fire nine times, once per factory call. In the Scope panel, notice that `n` has a different value each time. Then remove the breakpoint and set a new one *inside* the returned arrow. Click a button and observe that `n` in the scope chain still has the value from its original factory call — the closure kept it alive.

## 5. Check your understanding

<details>
<summary><strong>Q1.</strong> Define a closure in one sentence.</summary>

A closure is a function together with a persistent reference to the variables that were in scope when the function was created.
</details>

<details>
<summary><strong>Q2.</strong> Why does a <code>for (let i = 0; ...)</code> loop avoid the "all handlers share the same index" bug?</summary>

`let` inside a `for` header creates a fresh binding per iteration. Each iteration's arrow closes over its own `i`, so the nine handlers end up with nine independent values.
</details>

<details>
<summary><strong>Q3.</strong> If you write a handler factory <code>makeAdder(n)</code> and call it twice, do the two returned functions share state?</summary>

No. Each call creates a new `n` (a new parameter binding) and a new arrow function that closes over it. The two handlers are independent.
</details>

<details>
<summary><strong>Q4.</strong> Can a closure read a Svelte <code>$state</code> variable from an outer scope?</summary>

Yes. Runes are ordinary identifiers from the perspective of the closure — reading or writing them triggers reactivity exactly as if the handler were inline in the component.
</details>

<details>
<summary><strong>Q5.</strong> What kind of memory leak can closures cause?</summary>

They keep their captured variables alive as long as the closure itself is reachable. In long-lived modules that accumulate closures (for example, pushing handlers into a module-level array and never removing them) the captured data cannot be garbage-collected.
</details>

## 6. Common mistakes

- **Declaring the loop variable outside the `for` header.** Classic bug; every handler shares the final value.
- **Assuming closures "copy" the variables.** They do not — they capture by reference. If the outer variable changes after the closure is created, the closure sees the new value.
- **Stacking closures in long-lived arrays without cleanup.** Can cause slow memory growth.
- **Forgetting to type the factory return.** `makeAdder(n: number): () => void` is clearer than letting inference guess.

## 7. What's next

Lesson 5.7 uses closures to build debouncing and throttling helpers — the two techniques every search box, resize handler, and scroll listener needs.
