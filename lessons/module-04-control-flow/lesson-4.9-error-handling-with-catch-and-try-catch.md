---
module: 4
lesson: 4.9
title: "Error handling with {:catch} and try/catch"
duration: 50 minutes
prerequisites:
  - Lesson 4.8 ({#await})
  - Lesson 4.7 (async/await)
learning_objectives:
  - Narrow an `unknown` error down to a specific type before using it
  - Create custom `Error` subclasses for different failure categories
  - Use discriminated unions on error fields to branch on error type in the catch block
  - Design error messages that are useful for the user *and* the developer
  - Recognise why empty `catch` blocks are one of the worst bugs in a codebase
status: ready
---

# Lesson 4.9 — Error handling with {:catch} and try/catch

## 1. Concept — Failure is a feature, not an exception

### 1.1 The problem: "it worked on my machine"

The happy path is easy. The network is up, the server responds in 40 ms, the JSON parses, the data has the shape you expected. Every mini-build so far has followed that path.

Real applications spend most of their lifetime *not* on the happy path. The server returns 500. The user's Wi-Fi drops for three seconds. The JSON has an extra field the client has not seen before. The token expired. The disk quota is full. The request was CORS-blocked because an env var is misconfigured in staging. A production app handles all of these with specific, visible, actionable UI — not with a white screen and a console error the user cannot see.

Error handling is not a bolt-on. It is a first-class responsibility of every function that can fail.

### 1.2 TypeScript's `unknown` forces you to narrow

In a catch block (or a Svelte `{:catch}` branch), the error variable is typed `unknown`. That is deliberate. JavaScript permits any value to be thrown — including strings, numbers, plain objects, or error instances. Even the same codebase may throw different types from different places.

Before you can read `.message`, you must prove the value is something with a `.message` field. The standard way is `instanceof Error`:

```ts
try {
    await load();
} catch (err: unknown) {
    if (err instanceof Error) {
        console.error(err.message);
    } else {
        console.error('Unknown error:', err);
    }
}
```

Narrowing like this is a one-liner and it catches 95% of real situations. If you need to branch on error type — "if it's a NetworkError show this, if it's an AuthError show that" — you define your own subclasses.

### 1.3 Custom Error subclasses

Create a subclass per category of failure you want to distinguish:

```ts
export class NetworkError extends Error {
    override name = 'NetworkError';
}

export class AuthError extends Error {
    override name = 'AuthError';
}

export class NotFoundError extends Error {
    override name = 'NotFoundError';
}
```

Now the function that can fail throws the right subclass for each condition:

```ts
async function loadProfile(id: string): Promise<Profile> {
    let res: Response;
    try {
        res = await fetch(`/api/profiles/${id}`);
    } catch {
        throw new NetworkError('Could not reach the server');
    }

    if (res.status === 401) throw new AuthError('Sign in required');
    if (res.status === 404) throw new NotFoundError(`No profile ${id}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    return res.json();
}
```

And the catch branch dispatches:

```ts
try {
    profile = await loadProfile(id);
} catch (err: unknown) {
    if (err instanceof NetworkError) showBanner('You appear to be offline.');
    else if (err instanceof AuthError) goto('/sign-in');
    else if (err instanceof NotFoundError) show404();
    else logAndReport(err);
}
```

The user sees a specific message for a specific situation. The developer gets a call-stack trail for the unknown case.

### 1.4 Discriminated unions for plain-object errors

Sometimes you would rather return a discriminated-union result:

```ts
type Result<T> =
    | { ok: true; value: T }
    | { ok: false; error: { kind: 'network' | 'auth' | 'not-found'; message: string } };
```

A function returns `Result<Profile>` instead of throwing, and the caller narrows on `result.ok`. This is "Railway Oriented Programming". It is lovely for pure logic but noisy for HTTP layers that already throw. Pick one style per layer and stay consistent.

### 1.5 The empty-catch anti-pattern

`catch { }` silences every error. The app continues running as if nothing failed, data is missing, UI is blank, and nobody knows why. Every `catch` block must do *something*: log, report, retry, re-throw, or surface a visible message. If you genuinely cannot think of what to do, log to `console.error` and re-throw. Never swallow silently.

### 1.6 Error messages for humans and for developers

A good error message is two things at once:

- **For the user**, it is brief, kind, and actionable. "We could not load your profile. Try again in a few moments." No stack traces, no error codes the user cannot act on.
- **For the developer**, it is specific, technical, and logged. Stack trace, request id, response body, current route. Log it and send it to your error-reporting service with enough context to reproduce the bug.

The Svelte `{:catch}` branch is a good place for the user-facing message; a `$effect` or a dedicated logger service is the place for the developer side.

## Deep Dive

**Why this matters at scale.** In production apps, errors are not edge cases — they are certainties. Networks fail, APIs return 500s, users submit invalid data, third-party scripts crash. A 50-component app without a systematic error-handling strategy shows blank screens, frozen UIs, or cryptic console messages that users cannot act on. Structured error handling — catching at the right level, displaying the right message, logging the right context — is what separates a professional app from a prototype. This lesson establishes the pattern that carries through every async operation in the course.

**The mental model.** Think of error handling as a safety net system in a circus. The performer (your async operation) might fall at any point. The net (try/catch or `{:catch}`) catches the fall and converts it into a safe landing (an error UI the user can understand). Without the net, the fall crashes the entire show (unhandled promise rejection, blank screen). The key design decision is *where* to place the net: too high (catching at the page level) and you lose context about which operation failed; too low (catching inside every function) and you drown in error-handling code. The right level is usually the component that initiated the operation.

**Edge cases.** A common mistake: catching an error and swallowing it silently (`catch (e) { /* do nothing */ }`). The user sees no feedback and assumes the operation succeeded. Always either display an error UI or re-throw. Another edge case: the `catch` block in `{#await}` receives `unknown`, not `Error`. Network failures might throw `TypeError`, API errors might throw a custom object, and some libraries throw strings. Always narrow the caught value before accessing `.message`. A third subtlety: errors thrown during rendering (inside a component's `$derived` or template expression) are not caught by `{:catch}` — they are component-level errors that need Svelte's `<svelte:boundary>` (Module 12). `{:catch}` only catches promise rejections.

**Performance implications.** Try/catch itself has negligible performance cost in modern JavaScript engines — the "try/catch is slow" myth comes from very old engines (pre-2015). The real performance consideration is *recovery*: when an error occurs, what does the UI do? If it destroys a complex component tree and shows an error message, the user loses scroll position, form state, and context. Consider partial error boundaries (Module 12) that isolate the failure to a small section of the page while keeping the rest functional. This localised failure pattern is critical for dashboards where one failing widget should not take down the entire page.

**Cross-module connections.** Error handling patterns established here carry through Module 9 (load function errors with SvelteKit's `error()` helper), Module 10 (form action validation errors returned as ActionData), Module 12 (error boundaries with `<svelte:boundary>`), and Module 9b (remote function errors). The two-sided approach — user-facing message in the UI, developer-facing details in logs — is the pattern you will implement at every async boundary in the course.

### 1.7 The TypeScript angle — `unknown` forces correctness

In TypeScript strict mode, the `catch` variable is typed `unknown`, not `Error`. This forces you to narrow before accessing any properties:

```ts
catch (err: unknown) {
    // err.message  ← Compile error: 'message' does not exist on 'unknown'
    
    if (err instanceof Error) {
        console.error(err.message);  // ← OK, narrowed to Error
    } else if (typeof err === 'string') {
        console.error(err);  // ← OK, narrowed to string
    } else {
        console.error('Unknown error:', err);
    }
}
```

The `unknown` type is TypeScript's way of saying "I do not know what this is — prove it before you use it." This prevents the common bug of accessing `.message` on a thrown string or number, which would crash at runtime. Older TypeScript versions typed `catch` variables as `any`, which let every access through without checking. The `unknown` approach is strictly safer and is the default in strict mode.

### 1.8 Common interview question

**Q: "Why should you never write an empty `catch { }` block, and what should you do instead?"**

**Model answer:** An empty `catch` block silently swallows errors. The operation failed, but the app continues as if it succeeded — data is missing, state is inconsistent, and the user sees a blank or broken UI with no explanation. Worse, the developer has no telemetry to diagnose the problem. Every `catch` block should do at least one of five things: (1) display a user-facing error message, (2) log the error with `console.error` or an error-reporting service, (3) re-throw the error for a higher-level handler, (4) return a fallback value with a clear comment explaining why silence is intentional, or (5) retry the operation. If you genuinely cannot think of what to do, log and re-throw — at minimum, the error reaches someone who can investigate.

## Going Deeper

**Official docs to read next:**

- [svelte.dev/docs/svelte/await](https://svelte.dev/docs/svelte/await) — the `{:catch}` branch in `{#await}`.
- [svelte.dev/docs/kit/errors](https://svelte.dev/docs/kit/errors) — SvelteKit's error handling system for load functions and routes.
- [typescriptlang.org/docs/handbook/2/narrowing.html](https://www.typescriptlang.org/docs/handbook/2/narrowing.html) — narrowing `unknown` with `instanceof` and `typeof`.

**Advanced pattern: centralized error reporting.** Instead of duplicating error handling in every component, create a shared reporter:

```ts
// src/lib/errors.ts
export function reportError(error: unknown, context: string): string {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error(`[${context}]`, error);
    // In production: send to Sentry, Datadog, or similar
    // errorReporter.captureException(error, { tags: { context } });
    return message;
}
```

Every `catch` block calls `reportError(err, 'loadProducts')` and gets back a user-safe message to display. The reporter handles logging, service reporting, and message extraction in one place.

**Challenge question (combines Lesson 4.9 + Lesson 4.8 + Lesson 1.8):** Define three custom error classes: `NetworkError`, `ValidationError`, and `AuthError`. Write a function `loadProfile(id: string)` that throws the appropriate error class for different failure modes (network down, malformed response, 401 status). Then write a `{:catch}` branch that uses `{#if err instanceof NetworkError}` / `{:else if}` to show a different UI for each error type. What type is `err` inside the `{#if err instanceof NetworkError}` branch?

## 2. Style it — Four error UIs for four error types

The mini-build triggers four different errors — network down, auth required, not found, and a generic failure — and renders a differently-styled panel for each. Each panel uses PE7 tokens but changes the accent colour. The user sees at a glance that the app knows what kind of problem it hit.

## 3. Interact — Trigger each error and watch the branch fire

Click each of the four buttons. Each triggers a different subclass of `Error`, and the `{:catch}` branch's narrowing chain selects the correct panel. The same `{#await}` block shows all four failure modes without any extra state.

## 4. Mini-build — Four error types, one catch branch

### File

`src/routes/modules/04-control-flow/09-catch/+page.svelte`

### Key excerpt

```svelte
<script lang="ts">
    class NetworkError extends Error { override name = 'NetworkError'; }
    class AuthError extends Error { override name = 'AuthError'; }
    class NotFoundError extends Error { override name = 'NotFoundError'; }
</script>

{#await promise}
    <p>Working…</p>
{:then value}
    <p>{value}</p>
{:catch err}
    {#if err instanceof NetworkError}
        <p class="panel panel--network">{err.message}</p>
    {:else if err instanceof AuthError}
        <p class="panel panel--auth">{err.message}</p>
    {:else if err instanceof NotFoundError}
        <p class="panel panel--404">{err.message}</p>
    {:else}
        <p class="panel panel--error">
            {err instanceof Error ? err.message : 'Unknown error'}
        </p>
    {/if}
{/await}
```

### DevTools verification

1. Open the Console.
2. Click each button. Watch the `{:catch}` branch select a different panel for each error class.
3. Add a `console.error` inside the catch chain; you can see the thrown error's `name` and `message` proving the subclass survived the Promise boundary.

## 5. Check your understanding

<details>
<summary><strong>Q1.</strong> Why is the `err` in `catch (err: unknown)` not automatically typed `Error`?</summary>

Because JavaScript permits any value to be thrown, including strings and numbers. TypeScript forces you to narrow before reading error-specific fields.
</details>

<details>
<summary><strong>Q2.</strong> How do you make a custom error class that `instanceof` checks still recognise?</summary>

Extend the built-in `Error` class with `class MyError extends Error`. Set `name` so logs are readable. `instanceof` works because of the prototype chain.
</details>

<details>
<summary><strong>Q3.</strong> What is a discriminated-union `Result<T>` and when would you use it instead of throwing?</summary>

A union like `{ ok: true; value: T } | { ok: false; error: E }`. Use it when you want the caller to handle failure as a value rather than a thrown exception.
</details>

<details>
<summary><strong>Q4.</strong> Why is an empty `catch { }` one of the worst patterns?</summary>

Because it silently hides bugs. The app keeps running with missing data, the user sees nothing, and the developer has no clue.
</details>

<details>
<summary><strong>Q5.</strong> What are the two different audiences an error message serves?</summary>

The user (short, kind, actionable) and the developer (specific, technical, logged with enough context to reproduce).
</details>

## 6. Common mistakes

- **Leaving `catch` blocks empty.** Never.
- **Reading `err.message` before checking the type.** TypeScript rejects it, and it would crash on non-Error throws.
- **Throwing plain strings.** `throw 'nope'` works but it is a nightmare to handle. Throw `new Error(...)` or a subclass.
- **Forgetting to differentiate errors in the UI.** A generic "Something went wrong" when you know it was an auth error is user-hostile.

## 7. What's next

Lesson 4.10 brings TypeScript back to the front and focuses on typing asynchronous code end-to-end: `Promise<T>` return types, `Awaited<T>` helper, and the type flow through the `{#await}` block.
