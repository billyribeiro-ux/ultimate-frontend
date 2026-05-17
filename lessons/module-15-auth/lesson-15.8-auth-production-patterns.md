---
module: 15
lesson: 15.8
title: Auth patterns in production
duration: 45 minutes
prerequisites:
  - Lessons 15.1 through 15.7 (complete auth flow)
  - Understanding of cookies, sessions, CSRF
learning_objectives:
  - Implement rate limiting for login attempts using an in-memory counter
  - Explain how SvelteKit's built-in Origin check provides CSRF protection
  - Describe refresh token rotation and why it limits damage from stolen tokens
  - Build a session expiry display that shows the user when their session will end
  - Implement a remember-me checkbox that extends the session cookie lifetime
status: ready
---

# Lesson 15.8 — Auth patterns in production

> **Atomic lesson format** — every lesson in this course follows the same four parts: **Concept**, **Style it**, **Interact**, **Mini-build**.

## 1. Concept — Hardening your auth for the real world

### 1.1 The problem: basic auth works, but attackers are patient

The auth system you built in Lessons 15.2-15.6 is correct — but a determined attacker has tools you have not defended against yet. They can try thousands of passwords per second (brute force), exploit timing differences to enumerate users, or steal a session and use it for days. Production auth adds layers of defense.

### 1.2 Rate limiting login attempts

Without rate limiting, an attacker can script thousands of login attempts per second. The fix is simple: track failed attempts per IP (or per email) and temporarily block requests after too many failures.

```typescript
const loginAttempts: Map<string, { count: number; blockedUntil: number }> = new Map();

const MAX_ATTEMPTS: number = 5;
const BLOCK_DURATION_MS: number = 15 * 60 * 1000; // 15 minutes

function isRateLimited(ip: string): boolean {
    const record = loginAttempts.get(ip);
    if (!record) return false;
    if (Date.now() > record.blockedUntil) {
        loginAttempts.delete(ip);
        return false;
    }
    return record.count >= MAX_ATTEMPTS;
}

function recordFailedAttempt(ip: string): void {
    const record = loginAttempts.get(ip) ?? { count: 0, blockedUntil: 0 };
    record.count += 1;
    if (record.count >= MAX_ATTEMPTS) {
        record.blockedUntil = Date.now() + BLOCK_DURATION_MS;
    }
    loginAttempts.set(ip, record);
}
```

This in-memory approach works for single-server deployments. In production with multiple servers, you would use Redis or a database for shared state.

### 1.3 CSRF protection — SvelteKit's built-in Origin check

SvelteKit automatically protects form actions from CSRF attacks. On every POST request, it checks the `Origin` header:

- If the `Origin` matches your app's URL → request is allowed
- If the `Origin` does not match → SvelteKit rejects with a 403 Forbidden

This works because browsers always send the `Origin` header on POST requests, and JavaScript cannot forge it. A malicious site that tries to POST to your form action from their domain will be blocked before your code even runs.

You do not need to implement CSRF tokens manually. SvelteKit handles it. But you should understand what it is doing so you can debug 403 errors in production (common cause: misconfigured reverse proxy stripping the Origin header).

### 1.4 Refresh tokens and token rotation

In OAuth flows, the access token has a short lifetime (often 1 hour). When it expires, you need a new one. The **refresh token** lets you get a new access token without making the user log in again.

Token rotation adds security: each time you use a refresh token, the provider issues a new refresh token and invalidates the old one. If an attacker steals a refresh token and uses it, the legitimate user's next request fails (their token was invalidated). This is a detection signal.

For session-based auth (what we teach), the equivalent is **sliding sessions**: each time the user makes a request, you extend the session's expiry time. Active users stay logged in; inactive users are automatically logged out.

### 1.5 Session expiry and the remember-me pattern

Two common patterns:

**Short sessions (default):** Cookie expires when the browser closes (no `maxAge`), and the server session expires after 24 hours. Good for banking or sensitive apps.

**Remember-me sessions:** When the user checks "Remember me," you set a longer `maxAge` on the cookie (30 days) and extend the server session accordingly. The user stays logged in across browser restarts.

```typescript
const maxAge: number = rememberMe
    ? 60 * 60 * 24 * 30  // 30 days
    : 60 * 60 * 24;      // 24 hours

cookies.set('session_id', session.id, {
    path: '/',
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    maxAge
});
```

### 1.6 What is different from older SvelteKit patterns

Some older tutorials implement CSRF protection with custom tokens (hidden form fields). This is unnecessary in SvelteKit 2 — the Origin check is automatic and sufficient. If you see a tutorial adding `csrfToken` to forms, it is either outdated or targeting a framework that does not have built-in protection.

### 1.7 Sliding sessions — extending on activity

A sliding session extends its expiry every time the user makes a request. An active user never gets logged out; an inactive user is logged out after the timeout period.

Implementation in the hook:

```typescript
export const handle: Handle = async ({ event, resolve }) => {
    const sessionId = event.cookies.get('session_id');
    if (sessionId) {
        const session = getSession(sessionId);
        if (session && !isExpired(session)) {
            event.locals.user = toSafeUser(findUserById(session.userId));

            // Extend the session
            session.expiresAt = Date.now() + SESSION_DURATION;
            event.cookies.set('session_id', sessionId, {
                path: '/',
                httpOnly: true,
                secure: true,
                sameSite: 'lax',
                maxAge: SESSION_DURATION / 1000 // seconds
            });
        }
    }
    return resolve(event);
};
```

The trade-off: sliding sessions mean a stolen session token remains valid indefinitely as long as the attacker uses it periodically. Fixed sessions force re-authentication at known intervals. High-security applications (banking) use fixed sessions. Convenience applications (social media) use sliding sessions. The choice depends on your threat model.

### 1.8 Account lockout strategies

Rate limiting blocks an IP after too many failures. Account lockout blocks the account itself regardless of source IP. The implementation is similar but keyed by email rather than IP:

```typescript
const accountLockouts: Map<string, { failedAttempts: number; lockedUntil: number }> = new Map();
```

The danger of account lockout: an attacker who knows a user's email can intentionally lock them out by sending failed login attempts (a denial-of-service attack on specific accounts). Mitigations:
- Only lock temporarily (15-30 minutes, not permanently)
- Send an email to the account owner when lockout triggers
- Allow unlock via a link in the notification email

For this course's implementation, IP-based rate limiting is sufficient. Account lockout is mentioned as a production consideration.

### 1.9 Security headers for auth pages

Auth pages benefit from additional HTTP response headers that harden the browser's behavior:

```typescript
// In your hook or middleware
const response = await resolve(event);
response.headers.set('X-Frame-Options', 'DENY');
response.headers.set('X-Content-Type-Options', 'nosniff');
response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
```

- **X-Frame-Options: DENY** — prevents your login page from being embedded in an iframe (clickjacking defense).
- **X-Content-Type-Options: nosniff** — prevents browsers from MIME-sniffing response content, which can lead to XSS in edge cases.
- **Referrer-Policy** — prevents the full URL (which might contain sensitive query parameters like `redirectTo` or `code`) from leaking to external sites via the Referer header.

These headers are defense-in-depth — each blocks a specific, documented attack vector. They cost nothing to add and provide free security.

## Deep Dive

**Why this matters at scale.** The difference between a hobby-project auth system and a production auth system is these hardening layers. Basic auth works until the first attacker finds it. Rate limiting, CSRF protection, session sliding, security headers, and monitoring are what allow an auth system to withstand real-world attack traffic — automated bots, credential stuffing, and targeted exploitation. Every security incident at a tech company traces back to one of these layers being missing or misconfigured. Teams that implement all layers from the start never make headline news for a breach.

**The mental model.** Production auth is defense in depth — multiple independent layers, each blocking a different attack. Like a medieval castle: the moat (HTTPS/secure cookies) stops casual intruders. The wall (rate limiting) stops brute force. The gate (password hashing) stops database thieves. The inner keep (CSRF protection) stops sneaky social engineering. No single layer is perfect, but together they make the cost of attack exceed the value of success.

**Edge cases.** Rate limiting by IP fails when attackers use distributed botnets (thousands of IPs, each sending one request). The defense is rate limiting by account as well — even if each IP sends only one request, the same email seeing 1000 failures across different IPs indicates an attack. IP-based rate limiting also punishes shared IPs (corporate NATs, university networks) where hundreds of legitimate users share one address. Consider using a more granular identifier (IP + email combination) or CAPTCHA after N failures rather than hard blocking.

**Performance.** Rate limiting with an in-memory Map adds nanoseconds per request (a single Map.get() lookup). Session sliding adds one cookie-set operation per request (writing the Set-Cookie header). Security headers add bytes to the response but no computation. These production patterns have negligible performance cost — the only concern is memory for the rate-limit Map, which should be bounded (periodic cleanup of old entries) to prevent unbounded growth in long-running servers.

**Cross-module connections.** Production auth connects to every previous lesson in Module 15 — it hardens registration (rate limit creation), login (rate limit attempts), sessions (sliding expiry), and the hook (security headers). It also connects to Module 12 (performance — monitoring frame rate is analogous to monitoring auth health metrics) and Module 16 (database — production session stores and rate limit stores belong in persistent storage).

## 2. Style it — The production auth dashboard

The mini-build for this lesson is a comprehensive auth status panel:

- Rate limit status displayed as a progress bar (attempts used out of max)
- Session expiry as a countdown timer
- CSRF status indicator (always "Protected" in SvelteKit)
- Remember-me toggle styled as a custom checkbox with 44px touch target
- Color coding: green for healthy, yellow for warning (>3 attempts), red for blocked

## 3. Interact — Map-based counters and Date arithmetic

The TypeScript concept is **using `Map<string, T>` for server-side state tracking**. The rate limiter maintains a Map keyed by IP address. The key operations:

```typescript
// Check if an entry exists and is still valid
const record = loginAttempts.get(ip);
if (!record) return false;

// Time comparison
if (Date.now() > record.blockedUntil) {
    loginAttempts.delete(ip); // Cleanup expired blocks
    return false;
}
```

A common mistake is forgetting that `Date.now()` returns milliseconds, not seconds. If you mix seconds and milliseconds in your arithmetic, blocks last either a thousandth of the intended time or a thousand times too long:

```typescript
// BROKEN — mixing units
record.blockedUntil = Date.now() + 15 * 60; // 15 "minutes" = 900ms = less than 1 second
```

```typescript
// CORRECT — consistent milliseconds
record.blockedUntil = Date.now() + 15 * 60 * 1000; // 15 minutes = 900,000ms
```

## 4. Mini-build — Production auth patterns dashboard

**File:** `src/routes/modules/15-auth/08-auth-production-patterns/+page.svelte`

```svelte
<script lang="ts">
    import type { SafeUser } from '$lib/auth/types';

    interface Props {
        data: {
            user: SafeUser | null;
            sessionExpiresAt: string | null;
            loginAttemptsRemaining: number;
            maxAttempts: number;
            csrfProtected: boolean;
        };
    }

    let { data }: Props = $props();

    function formatExpiry(iso: string | null): string {
        if (!iso) return 'No active session';
        const expiry: Date = new Date(iso);
        const now: Date = new Date();
        const diffMs: number = expiry.getTime() - now.getTime();
        const hours: number = Math.floor(diffMs / (1000 * 60 * 60));
        const minutes: number = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
        return `${hours}h ${minutes}m remaining`;
    }
</script>

<svelte:head>
    <title>Lesson 15.8 · Auth production patterns</title>
</svelte:head>

<section class="page stack">
    <header>
        <p class="eyebrow">Lesson 15.8 · Mini-build</p>
        <h1>Production auth patterns</h1>
    </header>

    <article class="pattern-card">
        <h2>Rate limiting</h2>
        <div class="rate-limit">
            <div class="rate-bar">
                <div
                    class="rate-fill"
                    style="width: {((data.maxAttempts - data.loginAttemptsRemaining) / data.maxAttempts) * 100}%"
                ></div>
            </div>
            <p class="rate-label">
                {data.loginAttemptsRemaining} of {data.maxAttempts} attempts remaining
            </p>
        </div>
    </article>

    <article class="pattern-card">
        <h2>Session expiry</h2>
        <p class="expiry-display">{formatExpiry(data.sessionExpiresAt)}</p>
    </article>

    <article class="pattern-card">
        <h2>CSRF protection</h2>
        <p class="csrf-status">
            <span class="csrf-badge">Active</span>
            SvelteKit Origin check protects all form actions automatically.
        </p>
    </article>

    <article class="pattern-card">
        <h2>Remember me</h2>
        <p>When checked at login, the session cookie extends from 24 hours to 30 days.
        The server session expiry is extended to match.</p>
    </article>
</section>
```

### DevTools moment

1. Open Application > Cookies and look at the `session_id` cookie's "Expires" column. That is the actual expiry time the browser will enforce.
2. Open the Network tab and make a POST request. Look at the request headers — the `Origin` header is what SvelteKit checks for CSRF protection.
3. Try submitting a form from a different origin (you can use the console: `fetch('/modules/15-auth/04-login', { method: 'POST' })`). You will see a 403 response.

## 5. Check your understanding

<details>
<summary><strong>Q1.</strong> How does SvelteKit's built-in CSRF protection work?</summary>

On every POST request to a form action, SvelteKit reads the `Origin` header sent by the browser. If the origin does not match the app's own URL, it rejects the request with a 403 Forbidden status before the action code runs. Browsers cannot forge the Origin header, so a malicious site cannot bypass this check.
</details>

<details>
<summary><strong>Q2.</strong> Why is an in-memory rate limiter insufficient for a multi-server deployment?</summary>

Each server has its own in-memory Map. An attacker can spread their attempts across servers (via load balancers) and each server only sees a fraction of the total attempts. You need a shared store (Redis, database) that all servers read from and write to for rate limiting to work at scale.
</details>

<details>
<summary><strong>Q3.</strong> What is token rotation and why does it help detect stolen refresh tokens?</summary>

Token rotation means each time a refresh token is used, the server issues a new one and invalidates the old one. If an attacker steals and uses a refresh token, the legitimate user's next refresh fails (their old token was invalidated). This failure is a signal that the token was compromised, allowing the server to revoke all sessions for that user.
</details>

<details>
<summary><strong>Q4.</strong> What is the difference between session-based "remember me" and a regular session?</summary>

A regular session sets no `maxAge` on the cookie (it expires when the browser closes) or uses a short maxAge (24 hours). A remember-me session sets a longer `maxAge` (typically 30 days) so the cookie persists across browser restarts. The server session duration is extended to match.
</details>

<details>
<summary><strong>Q5.</strong> Why should rate limiting track by IP address rather than by email alone?</summary>

If you only track by email, an attacker can try one password per email across thousands of accounts without ever hitting the limit. If you track by IP, the attacker's single connection is blocked after N failures regardless of which accounts they target. In practice, you should track both: per-IP and per-email, to cover both attack patterns.
</details>

## 6. Common mistakes

- **Mixing seconds and milliseconds in Date arithmetic.** `Date.now()` returns milliseconds. Cookie `maxAge` is in seconds. Getting these confused produces sessions that expire in milliseconds or last for years.
- **Assuming CSRF tokens are needed in SvelteKit.** They are not. The Origin check is automatic. Adding custom CSRF tokens adds complexity without additional security.
- **Not cleaning up expired rate limit records.** Without periodic cleanup, your rate limit Map grows indefinitely. In a long-running server, this is a memory leak. Clean up entries when you check them or use a periodic sweep.
- **Setting remember-me without extending the server session.** If the cookie lasts 30 days but the server session expires after 24 hours, the user has a cookie that points to a dead session. Both the cookie maxAge and the server session duration must be extended together.

## 7. What's next

You have all the pieces. The Module 15 project brings them together into an Authenticated Dashboard — registration, login, protected dashboard, logout, session expiry display, typed throughout, and PE7 styled.
