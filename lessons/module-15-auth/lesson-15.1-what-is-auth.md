---
module: 15
lesson: 15.1
title: What authentication is
duration: 40 minutes
prerequisites:
  - Module 10 (form actions)
  - Module 8 (routing basics)
  - Module 9a (load functions)
learning_objectives:
  - Explain the difference between authentication and authorization
  - Compare sessions versus tokens and state their trade-offs
  - Justify why httpOnly cookies are the production pattern for session storage
  - Describe how CSRF attacks exploit cookie-based auth and name the primary defense
  - Identify the threat model for storing credentials in localStorage versus cookies
status: ready
---

# Lesson 15.1 — What authentication is

> **Atomic lesson format** — every lesson in this course follows the same four parts: **Concept**, **Style it**, **Interact**, **Mini-build**.

## 1. Concept — Why your app needs to know who is using it

### 1.1 The problem: strangers with access

Every web application you have ever used that stores personal data — email, banking, social media, even a to-do list — must answer one question before it does anything useful: **"Who are you?"**

Without that answer, the server has no way to decide what data to show, what actions to permit, and what to refuse. Authentication is the process of proving identity. Authorization is the separate process of deciding what a proven identity is allowed to do. This module focuses on authentication; authorization follows naturally once identity is established.

Think of authentication as the front door lock. Authorization is the set of keys inside the building that open specific rooms.

### 1.2 Sessions versus tokens

There are two dominant strategies for remembering a user after they log in:

**Session-based authentication.** The server creates a record (the "session") and gives the browser a short, random string — the session ID — to hold. On every subsequent request the browser sends that ID back, and the server looks up the session record to find who this user is. The actual user data stays on the server; the browser holds only the key.

**Token-based authentication (JWT).** The server generates a self-contained token — typically a JSON Web Token — that encodes the user's identity directly. The browser stores this token and sends it with every request. The server does not need to look anything up; it just verifies the token's cryptographic signature.

| Factor | Sessions | Tokens (JWT) |
|--------|----------|--------------|
| Where state lives | Server (database, memory, Redis) | Client (the token itself) |
| Revocation | Instant — delete the record | Hard — token is valid until it expires |
| Size per request | Tiny (just an ID string) | Larger (entire payload + signature) |
| Server scaling | Needs shared session store across instances | Stateless — any server can verify |
| Security surface | Depends on cookie configuration | Depends on storage location and token lifetime |

For this course we teach **session-based auth** because it is simpler to reason about, easier to revoke, and sidesteps entire categories of security mistakes beginners make with JWTs (storing them in localStorage, not handling expiry, bloated token sizes).

### 1.3 Where the browser stores the session ID: cookies versus localStorage

The browser needs to hold the session ID somewhere. The two main options are:

**localStorage:** A key-value store accessible by any JavaScript on the page. It persists across tabs and browser restarts. Sounds convenient — but any script that runs on your page can read it. If an attacker injects even one line of JavaScript (an XSS attack), they can steal the token in milliseconds.

**Cookies:** Small pieces of data the browser automatically attaches to every request to the domain that set them. Cookies have a critical security attribute: `httpOnly`. An httpOnly cookie is **invisible to JavaScript**. No script — your own or an attacker's — can read it. The browser still sends it on every request, but it is completely sealed from the client-side environment.

The production pattern — and the one we use throughout this module — is:

```
httpOnly + secure + sameSite=lax
```

- `httpOnly` prevents JavaScript from reading the cookie.
- `secure` ensures the cookie is only sent over HTTPS.
- `sameSite=lax` prevents the cookie from being sent on cross-origin POST requests — the primary defense against CSRF attacks.

### 1.4 CSRF — the attack that cookies enable

Because cookies are sent automatically, a malicious site can craft a form that POSTs to your app. If the user is logged in, their browser attaches the session cookie to that cross-origin request and the server cannot tell it apart from a legitimate submission. This is Cross-Site Request Forgery (CSRF).

SvelteKit protects you by default: it checks the `Origin` header on every form action POST. If the `Origin` does not match your app's domain, SvelteKit rejects the request with a 403 before your action code even runs. You will see this in action in Lesson 15.8.

### 1.5 What is different in the May 2026 version

Older SvelteKit tutorials (pre-2024) often demonstrated auth with `getSession` and `$session` stores. Those APIs no longer exist. The current pattern uses:

- `hooks.server.ts` to read the cookie and set `event.locals.user`
- Layout/page `load` functions to pass `locals.user` into the client
- Form actions for login/register/logout mutations
- Typed `App.Locals` in `src/app.d.ts`

If you find a tutorial using `getSession`, `$session`, or `handle` returning a body, it is outdated.

### 1.6 The threat model — what you are defending against

Security is not abstract — it defends against specific attackers with specific capabilities. For authentication, the primary threats are:

1. **Credential stuffing** — automated scripts trying leaked username/password pairs from other breached sites against your login form. Defense: rate limiting (Lesson 15.8), password hashing, and encouraging unique passwords.
2. **Cross-Site Scripting (XSS)** — an attacker injects JavaScript into your page that steals credentials or session tokens. Defense: httpOnly cookies (invisible to JS), Content Security Policy headers, Svelte's default output escaping.
3. **Cross-Site Request Forgery (CSRF)** — a malicious site tricks the user's browser into submitting a form to your app while authenticated. Defense: SvelteKit's Origin header check, sameSite cookie attribute.
4. **Session hijacking** — an attacker captures a session cookie (via network sniffing, physical access, or XSS) and uses it. Defense: `secure` flag (HTTPS only), short session lifetimes, session invalidation on logout.
5. **Brute force** — trying every possible password until one works. Defense: rate limiting, account lockout, strong password requirements, PBKDF2/Argon2 hashing (makes each guess expensive).

Understanding these threats helps you evaluate whether a security measure is necessary or paranoid. Every attribute on your session cookie (`httpOnly`, `secure`, `sameSite`, `maxAge`) exists to block a specific attack. Nothing is arbitrary.

### 1.7 Why this module teaches from scratch instead of using a library

Many SvelteKit projects use libraries like Lucia, Auth.js (NextAuth), or Supabase Auth. These are excellent for production. But this module implements auth from scratch for a critical reason: you need to understand what the library does so you can debug it when it breaks, audit it for security, and extend it for your specific needs.

A library is an opaque box until you understand its internals. After building session-based auth by hand — reading cookies, hashing passwords, managing sessions, protecting routes — you will understand exactly what Lucia or Auth.js does under the hood. You will know why certain configuration options exist, what the library's cookies look like, and where to look when authentication mysteriously fails.

The progression is: build it by hand (this module) → understand the concepts deeply → use a library in production with confidence and competence.

## Deep Dive

**Why this matters at scale.** Authentication bugs are not like UI bugs. A misaligned button costs aesthetics. A broken auth system costs user data, legal liability, and company reputation. In a team of ten developers, if any one of them misunderstands how sessions work, they can introduce a vulnerability — leaking session tokens in URL parameters, storing them in localStorage, or creating CSRF-vulnerable endpoints. A deep understanding of auth fundamentals across the team prevents these mistakes at the architectural level rather than catching them in code review after the damage is done.

**The mental model.** Authentication is a three-party trust relationship: the **user** (proves identity), the **server** (verifies and remembers), and the **browser** (stores and transmits the proof). The session cookie is a "hall pass" — it proves the user already showed ID at the front desk (login). Every subsequent request presents the hall pass. The server checks if the hall pass is valid (not expired, not revoked). The browser's job is to present the hall pass automatically on every request (which cookies do) while keeping it safe from theft (which httpOnly does).

**Edge cases.** Cookies set with `sameSite: 'lax'` are sent on top-level GET navigations from other sites — this is by design (otherwise every link to your site from Google would be unauthenticated). But it means a CSRF attack via GET request is theoretically possible. SvelteKit mitigates this by never performing state mutations on GET requests (load functions are read-only). Another edge case: users with cookies disabled. Your auth system must detect this (the session cookie will never arrive) and show a helpful message rather than an infinite redirect loop between login and protected routes.

**Performance.** Session lookups happen on every single request (the hook runs before every load function). If your session store is a database table, that is one extra database query per page load. For most applications this is negligible (sub-millisecond for in-memory stores, 1-5ms for database lookups). At extreme scale (millions of requests per minute), teams use Redis as a session store because its sub-millisecond response time keeps the per-request overhead minimal. For this course, an in-memory Map is sufficient and avoids infrastructure complexity.

**Cross-module connections.** Authentication connects to Module 10 (form actions — login/register are form actions), Module 8 (routing — protected route groups), Module 9a (load functions — passing user data to components), and Module 16 (database — storing users and sessions in SQLite instead of in-memory). The cookie-based approach works identically whether your session store is a Map, Redis, or a database table — only the lookup implementation changes.

## 2. Style it — the auth page personality

Authentication pages benefit from a distinct visual personality that signals "you are at a security boundary." We override the brand token to a protective green:

```svelte
<style>
    section.page {
        --color-brand: oklch(65% 0.18 160);
    }
</style>
```

The login/register forms use:
- `var(--space-lg)` padding for comfortable reading on mobile
- `var(--radius-lg)` for the card container
- 44px minimum height on all interactive elements (inputs, buttons) for touch targets
- `var(--color-surface-2)` background on form cards to lift them from the page

## 3. Interact — building a mental model of request flow

The core JavaScript concept for this lesson is **the request lifecycle**. When a user submits a login form, what happens?

Here is the wrong mental model many beginners have:

```
User clicks → JavaScript sends data → server responds → page updates
```

Here is the real model with SvelteKit form actions and cookies:

```
User clicks submit →
  Browser POSTs the <form> (no JS required!) →
    SvelteKit's handle hook runs →
      Form action executes on the server →
        Server sets a cookie via Set-Cookie header →
          Browser stores the cookie automatically →
            Redirect → next request includes the cookie →
              handle hook reads cookie → sets event.locals.user
```

This entire flow works without a single line of client-side JavaScript. That is progressive enhancement. When JavaScript is available, SvelteKit enhances the form with `use:enhance` for a smoother experience — but the auth itself never depends on client JS.

## 4. Mini-build — an authentication flow diagram page

**File:** `src/routes/modules/15-auth/01-what-is-auth/+page.svelte`

This mini-build renders a visual comparison of sessions vs tokens and cookies vs localStorage, using typed data and PE7 styling.

```svelte
<script lang="ts">
    interface ComparisonItem {
        label: string;
        session: string;
        token: string;
    }

    const comparisons: ComparisonItem[] = [
        { label: 'State location', session: 'Server', token: 'Client' },
        { label: 'Revocation', session: 'Instant', token: 'Wait for expiry' },
        { label: 'Request size', session: 'Tiny (ID only)', token: 'Large (full payload)' },
        { label: 'Scaling', session: 'Shared store needed', token: 'Stateless' }
    ];

    interface StorageOption {
        name: string;
        secure: boolean;
        reason: string;
    }

    const storageOptions: StorageOption[] = [
        { name: 'localStorage', secure: false, reason: 'Readable by any script (XSS vulnerable)' },
        { name: 'httpOnly cookie', secure: true, reason: 'Invisible to JavaScript, sent automatically' }
    ];
</script>

<svelte:head>
    <title>Lesson 15.1 · What authentication is</title>
</svelte:head>

<section class="page stack">
    <header>
        <p class="eyebrow">Lesson 15.1 · Mini-build</p>
        <h1>Authentication: sessions vs tokens</h1>
    </header>

    <article class="comparison-card">
        <h2>Sessions vs Tokens</h2>
        <table class="comparison-table">
            <thead>
                <tr>
                    <th>Factor</th>
                    <th>Sessions</th>
                    <th>Tokens</th>
                </tr>
            </thead>
            <tbody>
                {#each comparisons as item (item.label)}
                    <tr>
                        <td class="factor">{item.label}</td>
                        <td>{item.session}</td>
                        <td>{item.token}</td>
                    </tr>
                {/each}
            </tbody>
        </table>
    </article>

    <article class="storage-card">
        <h2>Where to store the session ID</h2>
        <ul class="storage-list">
            {#each storageOptions as option (option.name)}
                <li class="storage-item" class:storage-item--secure={option.secure}>
                    <span class="storage-name">{option.name}</span>
                    <span class="storage-badge">
                        {option.secure ? 'Recommended' : 'Avoid'}
                    </span>
                    <p class="storage-reason">{option.reason}</p>
                </li>
            {/each}
        </ul>
    </article>
</section>

<style>
    section.page {
        --color-brand: oklch(65% 0.18 160);
    }

    .eyebrow {
        font-size: var(--text-sm);
        color: var(--color-brand);
        text-transform: uppercase;
        letter-spacing: 0.08em;
    }

    .comparison-card,
    .storage-card {
        padding: var(--space-lg);
        background: var(--color-surface-2);
        border: 1px solid var(--color-border);
        border-radius: var(--radius-lg);
    }

    .comparison-table {
        width: 100%;
        border-collapse: collapse;
        margin-block-start: var(--space-sm);
    }

    .comparison-table th,
    .comparison-table td {
        padding: var(--space-sm);
        text-align: left;
        border-block-end: 1px solid var(--color-border);
    }

    .comparison-table th {
        font-size: var(--text-sm);
        color: var(--color-text-muted);
        text-transform: uppercase;
    }

    .factor {
        font-weight: 600;
    }

    .storage-list {
        list-style: none;
        padding: 0;
        margin: 0;
        display: grid;
        gap: var(--space-sm);
        margin-block-start: var(--space-sm);
    }

    .storage-item {
        padding: var(--space-md);
        border: 1px solid var(--color-border);
        border-radius: var(--radius-md);
        display: grid;
        grid-template-columns: 1fr auto;
        gap: var(--space-xs);
    }

    .storage-item--secure {
        border-color: var(--color-success);
    }

    .storage-name {
        font-weight: 600;
        font-family: ui-monospace, monospace;
    }

    .storage-badge {
        font-size: var(--text-xs);
        padding: 0.15em 0.6em;
        border-radius: var(--radius-full);
        background: var(--color-error);
        color: oklch(98% 0 0);
        align-self: center;
    }

    .storage-item--secure .storage-badge {
        background: var(--color-success);
        color: oklch(15% 0.02 145);
    }

    .storage-reason {
        grid-column: 1 / -1;
        font-size: var(--text-sm);
        color: var(--color-text-muted);
    }
</style>
```

### DevTools moment

1. Open the Network tab and look at any request to this page. Notice there are no auth-related cookies yet — that is expected.
2. Open Application > Cookies in DevTools. The cookie jar is empty. After Lesson 15.4 you will see a session cookie appear here.

## 5. Check your understanding

<details>
<summary><strong>Q1.</strong> What is the difference between authentication and authorization?</summary>

Authentication is proving who you are (identity). Authorization is determining what you are allowed to do (permissions). Authentication happens first; authorization depends on it.
</details>

<details>
<summary><strong>Q2.</strong> Why is localStorage a poor choice for storing session tokens in production?</summary>

Any JavaScript running on the page — including injected scripts from XSS attacks — can read localStorage. An attacker who injects a single `<script>` tag can steal the token and impersonate the user. httpOnly cookies are invisible to JavaScript, making them immune to this class of attack.
</details>

<details>
<summary><strong>Q3.</strong> What does the `sameSite=lax` attribute on a cookie prevent?</summary>

It prevents the cookie from being sent on cross-origin POST requests. This is the primary defense against CSRF (Cross-Site Request Forgery) attacks, where a malicious site tricks the browser into submitting a form to your app while the user is authenticated.
</details>

<details>
<summary><strong>Q4.</strong> Why do we teach session-based auth instead of JWTs in this module?</summary>

Sessions are simpler to reason about, easier to revoke instantly (just delete the server-side record), and avoid common JWT pitfalls beginners encounter: storing tokens in localStorage, not handling expiry correctly, and token bloat. Sessions keep sensitive state on the server where it belongs.
</details>

<details>
<summary><strong>Q5.</strong> If a tutorial tells you to use `$session` or `getSession` in SvelteKit, is it current?</summary>

No. Those APIs were removed in SvelteKit 2. The current pattern uses `hooks.server.ts` to read the cookie, sets `event.locals.user`, and passes user data through load functions. Any tutorial referencing `$session` is outdated.
</details>

## 6. Common mistakes

- **Storing JWTs in localStorage and assuming they are safe.** They are not. Any XSS vulnerability — even from a compromised third-party script — gives the attacker full access to the token. Use httpOnly cookies.
- **Confusing authentication with authorization.** Students often build a login system and assume the job is done. Login proves identity; you still need route-level checks to ensure users can only access what they are permitted to see.
- **Ignoring CSRF because "I'm using fetch."** CSRF attacks target cookie-based auth via form submissions, not fetch calls. SvelteKit's built-in Origin check protects form actions, but you must understand why it exists.
- **Skipping the `secure` flag during development.** In production, `secure` ensures cookies only travel over HTTPS. During development on `localhost`, SvelteKit handles this for you — but if you deploy without `secure`, cookies are sent over plain HTTP and can be intercepted on the wire.

## 7. What's next

Lesson 15.2 shows you how SvelteKit's `hooks.server.ts` runs on every request and how you use it to read the session cookie and populate `event.locals.user` for the rest of your app.
