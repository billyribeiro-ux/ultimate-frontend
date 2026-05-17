---
module: 15
lesson: 15.4
title: Login
duration: 45 minutes
prerequisites:
  - Lesson 15.3 (registration, password hashing)
  - Lesson 15.2 (hooks, event.locals)
  - Module 10 (form actions, use:enhance)
learning_objectives:
  - Build a login form action that verifies a password against the stored hash
  - Create a session cookie with httpOnly, secure, sameSite, and path attributes
  - Explain why timing-safe comparison matters for password verification
  - Use redirect() after successful login to send the user to a protected page
  - Display login errors without revealing whether the email or password was wrong
status: ready
---

# Lesson 15.4 — Login

> **Atomic lesson format** — every lesson in this course follows the same four parts: **Concept**, **Style it**, **Interact**, **Mini-build**.

## 1. Concept — Proving identity and creating a session

### 1.1 The problem: turning credentials into trust

The user registered in Lesson 15.3. Their password hash is stored. Now they return and claim to be that same person. Your job is to verify the claim and, if correct, issue them a session — a temporary proof of identity that travels with every future request via a cookie.

The login flow:

1. User submits email + password
2. Server finds the user by email
3. Server verifies the submitted password against the stored hash
4. If correct: create a session record, set a cookie with the session ID, redirect
5. If incorrect: return a generic error (never reveal which field was wrong)

### 1.2 Verifying the password

The `verifyPassword` function in `$lib/auth/password.ts` takes the submitted password and the stored hash string (`salt:hash`). It extracts the salt, re-derives the hash with the same parameters, and compares. If they match, the password is correct.

```typescript
const isValid: boolean = await verifyPassword(submittedPassword, user.passwordHash);
```

An important security principle: never tell the user "email not found" or "password incorrect" separately. Always say "Invalid email or password." If you differentiate, an attacker can enumerate valid emails on your system by checking which error message they get.

### 1.3 Setting the session cookie

Once the password is verified, you create a session and set a cookie:

```typescript
import { createSession } from '$lib/auth/session';

const session = createSession(user.id);

event.cookies.set('session_id', session.id, {
    path: '/',
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 // 24 hours in seconds
});
```

Each attribute matters:
- **`path: '/'`** — the cookie is sent on every route, not just `/login`
- **`httpOnly: true`** — JavaScript cannot read this cookie (XSS protection)
- **`secure: true`** — only sent over HTTPS (SvelteKit allows non-secure on localhost in dev)
- **`sameSite: 'lax'`** — not sent on cross-origin POST (CSRF protection)
- **`maxAge: 86400`** — the cookie expires after 24 hours; the browser deletes it automatically

### 1.4 Redirecting after login

After setting the cookie, you do not render the login page again — you redirect:

```typescript
import { redirect } from '@sveltejs/kit';

redirect(302, '/modules/15-auth/05-protected-routes');
```

A 302 redirect tells the browser to issue a new GET request to the target URL. That GET request includes the session cookie you just set, so the hook picks it up and the user arrives authenticated.

### 1.5 Why redirect instead of returning data

If you return data from a login action on success, the user sees the login form again (briefly) with a success message, then has to navigate manually. Redirect is the correct UX pattern:

- The URL changes to the destination
- The back button goes back to the login form (but if they are already logged in, the hook knows)
- Refreshing the page does not re-submit the login form (the POST/Redirect/GET pattern)

### 1.6 The POST/Redirect/GET pattern explained

This is a web design pattern that prevents accidental form re-submissions. Without it, if a user refreshes the page after submitting a login form, the browser re-sends the POST request (potentially creating duplicate sessions or showing confusing "confirm re-submission" dialogs).

The pattern:
1. User POSTs the form (login credentials)
2. Server processes the action (verifies password, creates session)
3. Server responds with a 302 Redirect (not a page render)
4. Browser issues a new GET request to the redirect target
5. Server renders the target page (dashboard)

Now if the user refreshes, they are refreshing the GET request (step 4/5), which is harmless — it just re-renders the dashboard. The original POST is gone from the browser's history.

SvelteKit implements this automatically when you call `redirect()` from a form action. The `use:enhance` enhancement makes the redirect seamless (SvelteKit navigates client-side), but even without JavaScript, the native browser redirect works correctly.

### 1.7 Timing-safe password comparison

When comparing a submitted password hash against the stored hash, a naive comparison (`hash1 === hash2`) is vulnerable to timing attacks. The `===` operator in most languages short-circuits: it returns `false` the moment it finds the first differing character. An attacker can measure how long the comparison takes and deduce how many characters matched — gradually guessing the hash one character at a time.

The fix is **timing-safe comparison**: always compare every character regardless of mismatches, taking the same amount of time whether the hashes are identical or completely different.

Node.js provides `crypto.timingSafeEqual(a, b)` for this purpose. Our `verifyPassword` function uses it internally. You do not need to implement it yourself, but you should understand why it exists — it is the difference between "theoretically secure" and "actually secure" password verification.

### 1.8 Session ID generation

The session ID must be unpredictable. If an attacker can guess valid session IDs, they can hijack sessions without knowing the password. Our implementation uses `crypto.randomUUID()` which generates a v4 UUID — 122 bits of randomness from a cryptographically secure random number generator.

Is 122 bits enough? An attacker trying to guess a valid session ID must try, on average, 2^121 possibilities (half the space). At one billion guesses per second, this would take approximately 10^27 years. This is sufficient.

What is NOT sufficient: sequential IDs (`session_1`, `session_2`), timestamp-based IDs, or `Math.random()` (which is not cryptographically secure and has only 52 bits of entropy on V8). Always use `crypto.randomUUID()` or `crypto.getRandomValues()` for security-critical random values.

### 1.9 Session storage considerations

In this course, sessions are stored in a JavaScript `Map` inside a server module. This works for learning but has limitations:

- **Lost on restart** — all users are logged out when the server restarts.
- **Not shared across instances** — in a multi-server deployment, a session created on Server A does not exist on Server B.
- **No persistence** — there is no audit trail of when sessions were created or revoked.

In Module 16, when you add a database, you can move sessions to a SQLite table. In production, Redis is the gold standard for session storage: fast (sub-millisecond lookups), shared (all server instances access the same Redis), persistent (survives server restarts), and supports TTL (automatic session expiry).

## Deep Dive

**Why this matters at scale.** Login is the most attacked endpoint in any web application. It is the gateway to user accounts, personal data, and administrative privileges. Attackers run credential-stuffing bots that try millions of username/password combinations from breached databases. A login endpoint that reveals whether an email exists, does not rate limit, or uses non-timing-safe comparison is a gift to these attackers. Teams that understand the security properties of every step in the login flow build systems that withstand automated attacks without impacting legitimate users.

**The mental model.** Login is a proof-verification ceremony followed by a trust-token issuance. The user presents a claim ("I am user@example.com with password X"). The server verifies the claim cryptographically (re-derives the hash, compares it timing-safely). If the proof checks out, the server issues a trust token (the session cookie) that the user carries on future requests. The cookie is like a wristband at a concert — it proves you passed the security check without requiring you to show ID again on every trip to the bar.

**Edge cases.** A user logs in from two different devices simultaneously. Both receive valid session cookies. Both sessions coexist — this is normal and expected. But what if you want "single-session" enforcement (logging in on a new device invalidates the old session)? You would delete all existing sessions for that user before creating the new one. Another edge case: the session cookie exists but the session record has been deleted (expired, manually revoked). The hook finds no record, sets `locals.user = null`, and the user appears logged out even though their browser still holds the cookie. The cookie persists until its `maxAge` expires, but it is effectively dead.

**Performance.** The login action is the one place where slowness is acceptable — password verification takes 50-200ms by design. But the session creation and cookie-setting that follow should be fast (Map insertion is O(1), cookie setting is just a header). The redirect response should be immediate. Total login latency: ~200-300ms, which users perceive as "instant button response."

**Cross-module connections.** Login connects to Module 15.2 (hooks — the session cookie created here is what the hook reads), Module 15.5 (protected routes — the redirect target after login is typically a protected page), Module 10 (form actions — login is a form action with the same mechanics as any other), and Module 15.8 (production patterns — rate limiting and remember-me both modify the login action).

## 2. Style it — The login form

The login form mirrors the registration form from Lesson 15.3 for visual consistency:

- Same `28rem` max width, same `var(--radius-lg)` card, same field spacing
- A link below the form pointing to the registration page for new users
- Error messages appear at the top of the form in a `var(--color-error)` banner
- The submit button uses the security green brand personality

## 3. Interact — the redirect() throw pattern

The TypeScript concept here is **SvelteKit's throw-based control flow**. The `redirect()` function does not return — it throws an exception that SvelteKit catches internally to trigger the redirect response.

Common mistake:

```typescript
// BROKEN — code after redirect still runs
const session = createSession(user.id);
event.cookies.set('session_id', session.id, { /* ... */ });
redirect(302, '/dashboard');
console.log('This still executes!'); // No it doesn't — redirect throws
doSomethingElse(); // This never runs either
```

Because `redirect()` throws, any code after it is unreachable. TypeScript 6 with strict mode does not always catch this — the return type of `redirect()` is `never`, but if you wrap it in a conditional, subsequent code may still appear reachable to the compiler. Put the redirect as the very last operation in your success path.

## 4. Mini-build — Login form with session creation

**File:** `src/routes/modules/15-auth/04-login/+page.svelte`

```svelte
<script lang="ts">
    import { enhance } from '$app/forms';

    interface Props {
        form: {
            error?: string;
            email?: string;
        } | null;
    }

    let { form }: Props = $props();
</script>

<svelte:head>
    <title>Lesson 15.4 · Login</title>
</svelte:head>

<section class="page stack">
    <header>
        <p class="eyebrow">Lesson 15.4 · Mini-build</p>
        <h1>Log in</h1>
    </header>

    <form method="POST" use:enhance class="login-form">
        {#if form?.error}
            <p class="form-error">{form.error}</p>
        {/if}

        <div class="field">
            <label for="email">Email</label>
            <input
                type="email"
                id="email"
                name="email"
                value={form?.email ?? ''}
                required
                autocomplete="email"
            />
        </div>

        <div class="field">
            <label for="password">Password</label>
            <input
                type="password"
                id="password"
                name="password"
                required
                autocomplete="current-password"
            />
        </div>

        <button type="submit">Log in</button>
    </form>

    <p class="register-link">
        No account? <a href="/modules/15-auth/03-registration">Register here</a>
    </p>
</section>
```

### DevTools moment

1. Submit the login form with valid credentials (register first via Lesson 15.3).
2. Open Application > Cookies. You should now see a `session_id` cookie with a UUID value.
3. Check the cookie attributes: httpOnly should be checked, SameSite should be "Lax", Secure should be checked (or shown as localhost-exempt in dev).
4. Navigate to Lesson 15.2's hook diagnostic page — it should now show "Authenticated" with your email.

## 5. Check your understanding

<details>
<summary><strong>Q1.</strong> Why should the login error message say "Invalid email or password" instead of specifying which one was wrong?</summary>

Specific error messages enable user enumeration attacks. An attacker can submit random emails and check whether the error says "email not found" — confirming which emails exist in your system. A generic message prevents this information leakage.
</details>

<details>
<summary><strong>Q2.</strong> What does the maxAge cookie attribute control?</summary>

It sets the cookie's lifetime in seconds. After that many seconds pass, the browser automatically deletes the cookie. For our session cookie, `maxAge: 86400` means the cookie (and thus the login) expires after 24 hours, even if the session record on the server is still valid.
</details>

<details>
<summary><strong>Q3.</strong> Why do we redirect(302, '/dashboard') after login instead of returning { success: true }?</summary>

The redirect implements the POST/Redirect/GET pattern. It prevents the browser from re-submitting the login form if the user refreshes the page. It also moves the user to their intended destination immediately and ensures the new request includes the freshly set session cookie.
</details>

<details>
<summary><strong>Q4.</strong> What is the type of the value returned by redirect() in SvelteKit?</summary>

`never`. The `redirect()` function throws an exception internally — it never returns a value. This means any code after a redirect call is unreachable. SvelteKit catches the thrown redirect and converts it into an HTTP 302 response.
</details>

<details>
<summary><strong>Q5.</strong> If you set a cookie with path: '/admin', can a request to /profile read that cookie?</summary>

No. The `path` attribute restricts which routes the browser sends the cookie to. A cookie with `path: '/admin'` is only included in requests whose URL starts with `/admin`. That is why we use `path: '/'` for session cookies — the hook needs to read the cookie on every route.
</details>

## 6. Common mistakes

- **Revealing whether the email or password was wrong.** Always use a single generic error message. Never help attackers enumerate your users.
- **Forgetting `path: '/'` on the cookie.** Without it, the cookie defaults to the current path (`/login`), meaning the hook cannot read it on other routes. The user appears logged in on `/login` but unauthenticated everywhere else.
- **Not awaiting verifyPassword.** Like `hashPassword`, verification is async. If you forget `await`, the result is a Promise (truthy!), and every login attempt succeeds regardless of the password.
- **Putting code after redirect().** Since `redirect()` throws, code after it never executes. If you need to do cleanup, do it before the redirect call.

## 7. What's next

Lesson 15.5 shows how to protect routes so that only authenticated users can access them — using layout load functions and SvelteKit's `redirect` to bounce unauthenticated visitors back to the login page.
