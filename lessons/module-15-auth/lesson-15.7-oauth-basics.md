---
module: 15
lesson: 15.7
title: OAuth basics
duration: 50 minutes
prerequisites:
  - Lesson 15.4 (login, session cookies)
  - Lesson 15.2 (hooks)
  - Understanding of HTTP redirects
learning_objectives:
  - Explain the OAuth2 Authorization Code flow step by step
  - Build a redirect-to-provider route that sends the user to an authorization URL
  - Handle the callback route that exchanges the authorization code for a token
  - Create a session from the provider's user data
  - Describe why a state parameter prevents CSRF in OAuth flows
status: ready
---

# Lesson 15.7 — OAuth basics

> **Atomic lesson format** — every lesson in this course follows the same four parts: **Concept**, **Style it**, **Interact**, **Mini-build**.

## 1. Concept — Letting someone else verify identity

### 1.1 The problem: passwords are a liability

Every password you store is a security liability. Users reuse passwords across sites. They choose weak ones. They forget them. Password reset flows are complex. Breaches happen.

OAuth solves this by delegating authentication to a trusted third party — Google, GitHub, Microsoft, etc. The user proves their identity to Google (which already has their account), and Google tells your app "yes, this person is who they say they are." Your app never sees a password.

### 1.2 The OAuth2 Authorization Code flow

OAuth2 has several "flows" (ways to authenticate). The Authorization Code flow is the one you use for server-rendered web apps. Here it is step by step:

1. **User clicks "Log in with Provider."** Your app redirects them to the provider's authorization URL.
2. **Provider shows a consent screen.** "App X wants to access your email. Allow?"
3. **User approves.** Provider redirects back to your app's callback URL with a short-lived `code` parameter.
4. **Your server exchanges the code for tokens.** Your server makes a POST request (server-to-server, not visible to the user) to the provider's token endpoint, sending the code + your client secret.
5. **Provider returns an access token (and optionally a refresh token).** The access token lets you fetch the user's profile data from the provider's API.
6. **Your server fetches user info.** Using the access token, you call the provider's user-info endpoint to get name, email, avatar, etc.
7. **Your server creates a session.** Same as credential login — you create a session record and set a cookie.

The user never typed a password on your site. The provider handled all of that.

### 1.3 Key components

| Component | What it is |
|-----------|------------|
| Client ID | Your app's public identifier, given by the provider when you register |
| Client Secret | A private key that proves your server is really your app (never expose this to the client) |
| Authorization URL | Where you redirect the user (e.g., `https://accounts.google.com/o/oauth2/auth`) |
| Callback URL | Where the provider redirects back to your app (e.g., `https://yourapp.com/auth/callback`) |
| State parameter | A random string you generate before redirecting, verify on callback — prevents CSRF |
| Scope | What data you are requesting (e.g., `email profile`) |

### 1.4 The state parameter: CSRF protection for OAuth

Without a state parameter, an attacker can craft a callback URL with their own authorization code and trick a victim into loading it. The victim's browser would exchange the attacker's code, linking the attacker's provider account to the victim's session.

The state parameter prevents this:
1. Before redirecting, generate a random string and store it in a cookie
2. Include it in the authorization URL as `&state=abc123`
3. When the provider redirects back, check that the returned `state` matches the one in the cookie
4. If it does not match, reject the request

### 1.5 Mock provider for this lesson

Real OAuth requires registering with Google/GitHub and configuring credentials. For teaching, we use a mock provider — a local API endpoint that simulates the OAuth flow. The concepts are identical; only the URLs differ.

In production, you would replace the mock URLs with real provider URLs and add proper error handling for network failures, revoked tokens, and rate limits.

### 1.6 Linking OAuth accounts to existing users

A user registers with email/password, then later clicks "Log in with Google." Their Google email matches their existing account. What happens?

Two strategies:
1. **Auto-link** — if the OAuth email matches an existing user, link the OAuth identity to that user. They can now log in with either method. This is convenient but has a security risk: if the attacker controls a Google account with the victim's email, they can hijack the account.
2. **Explicit link** — require the user to log in with their existing credentials first, then link the OAuth identity from their settings page. This is more secure but adds friction.

Most consumer applications use auto-linking because the risk is low (email providers verify ownership). Security-sensitive applications require explicit linking.

In our data model, this means a user can have multiple authentication methods. The `users` table holds the user identity; a separate `auth_methods` or `oauth_accounts` table holds the provider-specific data (provider name, provider user ID, access token).

### 1.7 The callback route in detail

The OAuth callback is a SvelteKit `+server.ts` GET handler (because the provider redirects back via a GET request with query parameters):

```typescript
// src/routes/auth/callback/+server.ts
export const GET: RequestHandler = async ({ url, cookies }) => {
    const code = url.searchParams.get('code');
    const state = url.searchParams.get('state');
    const error = url.searchParams.get('error');

    // 1. Check for error (user denied consent)
    if (error) redirect(302, '/login?error=oauth_denied');

    // 2. Verify state
    const savedState = cookies.get('oauth_state');
    if (!state || state !== savedState) error(403, 'Invalid state');

    // 3. Exchange code for token (server-to-server)
    const tokenResponse = await fetch(PROVIDER_TOKEN_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
            grant_type: 'authorization_code',
            code,
            redirect_uri: CALLBACK_URL,
            client_id: CLIENT_ID,
            client_secret: CLIENT_SECRET
        })
    });

    // 4. Fetch user info
    const { access_token } = await tokenResponse.json();
    const userInfo = await fetch(PROVIDER_USERINFO_URL, {
        headers: { Authorization: `Bearer ${access_token}` }
    }).then(r => r.json());

    // 5. Find or create user, create session
    const user = findOrCreateUser(userInfo);
    const session = createSession(user.id);
    cookies.set('session_id', session.id, { /* ... */ });

    // 6. Clean up OAuth state cookie
    cookies.delete('oauth_state', { path: '/' });

    redirect(302, '/dashboard');
};
```

Every step can fail: the provider might return an error, the state might not match, the token exchange might fail (expired code, revoked client), or the user-info endpoint might be down. Production code needs `try/catch` around each network call with appropriate error responses.

### 1.8 Access tokens versus session cookies

After OAuth completes, you have two tokens: the **access token** from the provider (used to call the provider's API) and the **session cookie** from your app (used to authenticate with your server).

These serve different purposes:
- The **access token** lets your server call Google/GitHub APIs on behalf of the user (read their repos, access their calendar). It has a short lifetime (1 hour) and can be refreshed.
- The **session cookie** authenticates the user with YOUR app. It has your configured lifetime and is independent of the provider.

A common mistake: using the access token as your session token. This is wrong because (1) it expires quickly, forcing constant re-authentication, (2) revoking it requires calling the provider's revocation endpoint, and (3) you lose control over your own session management.

The correct flow: use OAuth to verify identity, then create your own session — exactly as you do with password login. The access token is stored server-side (in the user record or a separate table) for when you need to call the provider's API.

## Deep Dive

**Why this matters at scale.** OAuth is how most users expect to log in to modern applications. Implementing it incorrectly can result in account takeover vulnerabilities (missing state validation), token leakage (exposing client secret), or poor UX (broken flows that leave users stranded on error pages). At scale, you also need to handle provider outages gracefully — if Google's auth servers are down, your "Login with Google" button should display a helpful message, not crash.

**The mental model.** OAuth is a trust delegation chain: Your user trusts Google. You trust Google to verify identity. Google trusts you (verified by client secret) to handle the user's data responsibly. The authorization code is the "handshake" — a short-lived voucher that proves the user approved the connection. The token exchange is you redeeming that voucher with Google. The resulting access token is your permission slip to act on the user's behalf.

**Edge cases.** The authorization code is single-use and short-lived (typically 10 minutes). If the callback takes too long (server hangs, user pauses mid-flow), the code expires. The token exchange fails with "invalid_grant." Your callback must handle this gracefully and redirect to login with a "session expired, try again" message. Another edge case: the user's provider account email changes between logins. If you link accounts by email, the user cannot log in after changing their email. Linking by provider user ID (a stable identifier) is more robust.

**Performance.** OAuth login is inherently slower than credential login because it involves multiple network round-trips: redirect to provider (browser hop), user authenticates with provider, redirect back (browser hop), server exchanges code for token (server-to-server HTTP), server fetches user info (server-to-server HTTP). Total latency: 2-5 seconds for a typical flow. This is acceptable because login happens infrequently. Caching the user-info response server-side avoids re-fetching on every session refresh.

**Cross-module connections.** OAuth connects to Module 15.4 (login — after OAuth, you create a session identically to credential login), Module 10 (API endpoints — the callback is a `+server.ts` handler), Module 9b (server-to-server fetch — the token exchange is a `fetch` call from your server to the provider), and Module 15.8 (production patterns — refresh token rotation and token storage). The URL construction pattern with `URLSearchParams` connects to Module 1's TypeScript fundamentals.

## 2. Style it — The social login button

Social login buttons have distinct visual conventions:

- Provider-branded buttons (we use a generic "Mock Provider" button for teaching)
- A separator ("or") between credential login and social login
- The button uses `var(--color-surface-2)` background with a border, not the brand color — distinguishing it from your app's primary action
- Icon + text layout with `gap: var(--space-sm)` for readability
- 44px minimum height for touch targets

## 3. Interact — URL construction with URLSearchParams

The TypeScript concept is **building URLs programmatically with `URLSearchParams`**. OAuth requires constructing authorization URLs with multiple query parameters. String concatenation is error-prone (forgetting to encode special characters, getting the `?` vs `&` wrong):

```typescript
// BROKEN — manual URL construction
const url = `https://provider.com/auth?client_id=${clientId}&redirect_uri=${callbackUrl}&state=${state}`;
// If callbackUrl contains & or = characters, this breaks silently
```

The correct approach:

```typescript
const authUrl: URL = new URL('https://provider.com/auth');
authUrl.searchParams.set('client_id', clientId);
authUrl.searchParams.set('redirect_uri', callbackUrl);
authUrl.searchParams.set('response_type', 'code');
authUrl.searchParams.set('scope', 'email profile');
authUrl.searchParams.set('state', state);

redirect(302, authUrl.toString());
```

`URLSearchParams` handles encoding automatically. Characters like `@`, `/`, and `=` in the callback URL are properly percent-encoded.

## 4. Mini-build — OAuth flow demonstration

**File:** `src/routes/modules/15-auth/07-oauth-basics/+page.svelte`

This mini-build demonstrates the OAuth flow visually, showing each step and its current status. It includes a mock "Login with Provider" button that initiates the flow.

```svelte
<script lang="ts">
    import { enhance } from '$app/forms';
    import type { SafeUser } from '$lib/auth/types';

    interface OAuthStep {
        number: number;
        label: string;
        description: string;
    }

    const steps: OAuthStep[] = [
        { number: 1, label: 'Redirect to provider', description: 'User is sent to the authorization URL' },
        { number: 2, label: 'User approves', description: 'Provider shows consent, user clicks Allow' },
        { number: 3, label: 'Callback with code', description: 'Provider redirects back with ?code=...' },
        { number: 4, label: 'Exchange code for token', description: 'Server POST to provider token endpoint' },
        { number: 5, label: 'Fetch user info', description: 'Server uses token to get profile data' },
        { number: 6, label: 'Create session', description: 'Session cookie set, user is logged in' }
    ];

    interface Props {
        data: {
            user: SafeUser | null;
            oauthComplete: boolean;
        };
    }

    let { data }: Props = $props();
</script>

<svelte:head>
    <title>Lesson 15.7 · OAuth basics</title>
</svelte:head>

<section class="page stack">
    <header>
        <p class="eyebrow">Lesson 15.7 · Mini-build</p>
        <h1>OAuth2 Authorization Code Flow</h1>
    </header>

    <article class="flow-card">
        <h2>The flow</h2>
        <ol class="flow-steps">
            {#each steps as step (step.number)}
                <li class="flow-step">
                    <span class="step-num">{step.number}</span>
                    <div class="step-content">
                        <strong>{step.label}</strong>
                        <p>{step.description}</p>
                    </div>
                </li>
            {/each}
        </ol>
    </article>

    <article class="action-card">
        <h2>Try it (mock provider)</h2>
        {#if data.user}
            <p class="status status--success">
                Logged in as <strong>{data.user.email}</strong> via mock OAuth.
            </p>
        {:else}
            <p>Click below to simulate the OAuth flow with a mock provider.</p>
            <form method="POST" action="?/initiate" use:enhance>
                <button type="submit" class="oauth-btn">
                    <span class="oauth-icon" aria-hidden="true">&#x1f511;</span>
                    Log in with Mock Provider
                </button>
            </form>
        {/if}
    </article>
</section>
```

### DevTools moment

1. After clicking "Log in with Mock Provider," check the Network tab. You will see a 302 redirect (simulated), then the callback with a `?code=...` parameter.
2. Open Application > Cookies. A `session_id` cookie appears after the flow completes — identical to the cookie from credential login.

## 5. Check your understanding

<details>
<summary><strong>Q1.</strong> Why does the OAuth flow use a server-to-server token exchange instead of sending tokens directly to the browser?</summary>

The token exchange requires the client secret, which must never be exposed to the browser. If tokens were sent directly to the browser via a redirect, they would be visible in the URL bar and browser history. The server-to-server exchange keeps the client secret and access tokens secure.
</details>

<details>
<summary><strong>Q2.</strong> What attack does the state parameter prevent?</summary>

CSRF in the OAuth callback. Without state, an attacker can craft a callback URL with their own authorization code and trick a victim into loading it, potentially linking the attacker's provider account to the victim's session. The state parameter ensures the callback was initiated by the same browser session that started the flow.
</details>

<details>
<summary><strong>Q3.</strong> What is the difference between the Client ID and the Client Secret?</summary>

The Client ID is public — it identifies your app and is visible in the authorization URL the user is redirected to. The Client Secret is private — it proves your server is truly your app and must never be sent to the browser. It is only used in the server-to-server token exchange.
</details>

<details>
<summary><strong>Q4.</strong> Why use URLSearchParams instead of string concatenation for building OAuth URLs?</summary>

URLSearchParams automatically handles percent-encoding of special characters (like `@`, `/`, `=`, `&` in values). String concatenation can produce broken URLs if any parameter value contains URL-reserved characters, leading to silently incorrect requests.
</details>

<details>
<summary><strong>Q5.</strong> After the OAuth flow completes, how does your app remember the user on subsequent requests?</summary>

The same way as credential login: by creating a session record on the server and setting an httpOnly session cookie. The OAuth flow is just the method of proving identity — once identity is established, session management is identical to password-based auth.
</details>

## 6. Common mistakes

- **Exposing the client secret in client-side code.** The secret must only exist on the server — in environment variables, never in a `.svelte` file or any code that ships to the browser.
- **Not validating the state parameter on callback.** Skipping state validation opens the door to CSRF attacks on your OAuth flow. Always compare the returned state with the one you stored in a cookie before redirecting.
- **Using the implicit flow instead of authorization code.** The implicit flow sends tokens directly in the URL fragment — acceptable for SPAs with no server, but inferior for SvelteKit apps that have a server. Always use the authorization code flow.
- **Forgetting to handle the case where the user denies consent.** The provider redirects back with an `error` parameter instead of a `code`. If you do not check for this, your callback crashes trying to exchange a non-existent code.

## 7. What's next

Lesson 15.8 covers production auth patterns — rate limiting login attempts, SvelteKit's built-in CSRF protection, refresh tokens, session expiry strategies, and the remember-me checkbox.
