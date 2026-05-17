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
