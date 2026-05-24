---
module: 15
exercise: 5
title: OAuth Mock Provider
difficulty: principal
estimated_time: 60
skills_tested:
  - OAuth authorization code flow
  - callback URL handling
  - token exchange simulation
  - state parameter for CSRF
  - multi-step auth architecture
---

# Exercise 15.5 — OAuth Mock Provider

## Brief

Simulate a complete OAuth 2.0 authorization code flow within your SvelteKit app. Create a mock OAuth "provider" endpoint that issues authorization codes, a callback handler that exchanges codes for tokens, and the full redirect dance that real providers like GitHub or Google use. This exercise demystifies OAuth by building both sides of the handshake.

## Requirements

1. Create a "Start OAuth Login" button at `src/routes/exercises/15-auth/05/+page.svelte`
2. Create a mock OAuth authorization endpoint at `src/routes/exercises/15-auth/05/mock-provider/authorize/+server.ts`
3. Create a mock OAuth token endpoint at `src/routes/exercises/15-auth/05/mock-provider/token/+server.ts`
4. Create an OAuth callback handler at `src/routes/exercises/15-auth/05/callback/+server.ts`
5. The flow: clicking "Login" redirects to the mock provider with `client_id`, `redirect_uri`, `state`, and `response_type=code`
6. The mock provider shows a "Grant Access" page — clicking it redirects to the callback URL with `code` and `state`
7. The callback handler exchanges the code for a mock access token by calling the token endpoint
8. The callback handler then uses the token to fetch mock user info and sets a session cookie
9. After the session is set, redirect to the dashboard page
10. Validate the `state` parameter to prevent CSRF attacks (generate it, store in a cookie, verify it matches)
11. Handle error cases: invalid state, expired code, missing parameters
12. TypeScript strict mode — type all request/response shapes

## Constraints

- No external OAuth libraries — implement the flow manually to understand it
- The state parameter must be cryptographically random (use `crypto.randomUUID()`)
- All mock endpoints must return proper HTTP status codes and content types
- The authorization code must be single-use (track used codes in memory)

## Hints (progressive)

<details>
<summary>Hint 1 (free)</summary>

OAuth has four steps: (1) redirect to provider with params, (2) user grants access on provider page, (3) provider redirects back with `code` and `state`, (4) your server exchanges `code` for an access token via a server-to-server request. The `state` parameter ties steps 1 and 3 together to prevent CSRF.
</details>

<details>
<summary>Hint 2 (conceptual)</summary>

Before redirecting to the mock provider, generate a `state` value and store it in a short-lived cookie. The mock provider's authorize endpoint renders an HTML page with a "Grant Access" button that redirects to the `redirect_uri`. In the callback, verify the `state` from the URL matches the cookie value. Then POST to the token endpoint with the `code` to get an access token.
</details>

<details>
<summary>Hint 3 (code sketch)</summary>

```typescript
// Starting the flow (page server load or action):
const state = crypto.randomUUID();
cookies.set('oauth_state', state, { path: '/', maxAge: 600, httpOnly: true });
const authUrl = `/exercises/15-auth/05/mock-provider/authorize?client_id=demo&redirect_uri=${encodeURIComponent(callbackUrl)}&state=${state}&response_type=code`;
redirect(303, authUrl);

// Callback handler:
const code = url.searchParams.get('code');
const state = url.searchParams.get('state');
const savedState = cookies.get('oauth_state');
if (state !== savedState) return new Response('Invalid state', { status: 403 });
// Exchange code for token via fetch to token endpoint...
```
</details>

## Solution

<details>
<summary>Full solution (click to reveal)</summary>

**`src/routes/exercises/15-auth/05/+page.server.ts`**

```typescript
import { redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
  return { user: locals.user };
};

export const actions: Actions = {
  'start-oauth': async ({ url, cookies }) => {
    const state = crypto.randomUUID();
    cookies.set('oauth_state', state, {
      path: '/',
      httpOnly: true,
      sameSite: 'lax',
      secure: true,
      maxAge: 600 // 10 minutes
    });

    const callbackUrl = `${url.origin}/exercises/15-auth/05/callback`;
    const authUrl = new URL('/exercises/15-auth/05/mock-provider/authorize', url.origin);
    authUrl.searchParams.set('client_id', 'demo-app');
    authUrl.searchParams.set('redirect_uri', callbackUrl);
    authUrl.searchParams.set('state', state);
    authUrl.searchParams.set('response_type', 'code');
    authUrl.searchParams.set('scope', 'user:read');

    redirect(303, authUrl.toString());
  }
};
```

**`src/routes/exercises/15-auth/05/+page.svelte`**

```svelte
<script lang="ts">
  import { enhance } from '$app/forms';

  interface Props {
    data: {
      user: { id: string; email: string; name: string } | null;
    };
  }

  let { data }: Props = $props();
</script>

<main class="page">
  <div class="card">
    {#if data.user}
      <h1>Authenticated via OAuth</h1>
      <p class="greeting">Welcome, <strong>{data.user.name}</strong></p>
      <p class="email">{data.user.email}</p>
      <p class="hint">You completed the full OAuth authorization code flow.</p>
    {:else}
      <h1>OAuth Login Demo</h1>
      <p class="subtitle">Click below to start the OAuth 2.0 authorization code flow with a mock provider.</p>

      <form method="POST" action="?/start-oauth" use:enhance>
        <button type="submit" class="btn-oauth">
          Login with Mock Provider
        </button>
      </form>

      <div class="flow-diagram">
        <p class="step">1. Redirect to provider</p>
        <p class="arrow">&#8595;</p>
        <p class="step">2. User grants access</p>
        <p class="arrow">&#8595;</p>
        <p class="step">3. Redirect to callback with code</p>
        <p class="arrow">&#8595;</p>
        <p class="step">4. Exchange code for token</p>
        <p class="arrow">&#8595;</p>
        <p class="step">5. Set session cookie</p>
      </div>
    {/if}
  </div>
</main>

<style>
  .page {
    max-inline-size: var(--content-max);
    margin-inline: auto;
    padding: var(--space-xl) var(--space-md);
    display: grid;
    place-items: center;
    min-block-size: 70vh;
  }

  .card {
    background: var(--color-surface-2);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-lg);
    padding: var(--space-xl);
    max-inline-size: 28rem;
    inline-size: 100%;
    text-align: center;
    box-shadow: var(--shadow-md);
  }

  h1 {
    font-size: var(--text-xl);
    margin-block-end: var(--space-sm);
  }

  .subtitle {
    font-size: var(--text-sm);
    color: var(--color-text-muted);
    margin-block-end: var(--space-xl);
  }

  .greeting strong {
    color: var(--color-brand);
  }

  .email {
    font-size: var(--text-sm);
    color: var(--color-text-muted);
  }

  .hint {
    font-size: var(--text-xs);
    color: var(--color-text-muted);
    margin-block-start: var(--space-md);
  }

  .btn-oauth {
    padding: var(--space-sm) var(--space-xl);
    background: var(--color-brand);
    color: var(--color-surface);
    border: none;
    border-radius: var(--radius-md);
    font-weight: 600;
    font-size: var(--text-sm);
    cursor: pointer;
    margin-block-end: var(--space-xl);
  }

  .flow-diagram {
    text-align: center;
    padding-block-start: var(--space-md);
    border-block-start: 1px solid var(--color-border);
  }

  .step {
    font-size: var(--text-xs);
    color: var(--color-text-muted);
    font-family: monospace;
  }

  .arrow {
    font-size: var(--text-sm);
    color: var(--color-brand);
    margin-block: var(--space-xs);
  }
</style>
```

**`src/routes/exercises/15-auth/05/mock-provider/authorize/+server.ts`**

```typescript
import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

// In-memory store of issued authorization codes
const issuedCodes = new Map<string, { clientId: string; redirectUri: string; createdAt: number }>();

export const GET: RequestHandler = async ({ url }) => {
  const clientId = url.searchParams.get('client_id');
  const redirectUri = url.searchParams.get('redirect_uri');
  const state = url.searchParams.get('state');
  const responseType = url.searchParams.get('response_type');

  if (!clientId || !redirectUri || !state || responseType !== 'code') {
    error(400, 'Missing or invalid OAuth parameters');
  }

  // Generate an authorization code
  const code = crypto.randomUUID();
  issuedCodes.set(code, {
    clientId,
    redirectUri,
    createdAt: Date.now()
  });

  // In a real provider, this would be a login/consent page
  // Here we render a simple HTML grant page
  const grantUrl = `${redirectUri}?code=${code}&state=${state}`;

  const html = `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><title>Mock OAuth Provider</title></head>
<body style="font-family: system-ui; display: grid; place-items: center; min-height: 100vh; margin: 0; background: #111;">
  <div style="background: #1a1a2e; padding: 2rem; border-radius: 12px; text-align: center; color: #eee; max-width: 24rem;">
    <h1 style="font-size: 1.25rem;">Mock OAuth Provider</h1>
    <p style="color: #999; font-size: 0.875rem;">App <strong>${clientId}</strong> wants to access your account.</p>
    <a href="${grantUrl}" style="display: inline-block; margin-top: 1rem; padding: 0.5rem 2rem; background: #6366f1; color: white; border-radius: 8px; text-decoration: none; font-weight: 600;">Grant Access</a>
  </div>
</body>
</html>`;

  return new Response(html, {
    headers: { 'Content-Type': 'text/html' }
  });
};

// Export the codes map for the token endpoint
export { issuedCodes };
```

**`src/routes/exercises/15-auth/05/mock-provider/token/+server.ts`**

```typescript
import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

// Shared in-memory store — in a real app this would be a database
const usedCodes = new Set<string>();

export const POST: RequestHandler = async ({ request }) => {
  const body = await request.formData();
  const grantType = body.get('grant_type')?.toString();
  const code = body.get('code')?.toString();
  const redirectUri = body.get('redirect_uri')?.toString();
  const clientId = body.get('client_id')?.toString();

  if (grantType !== 'authorization_code' || !code || !redirectUri || !clientId) {
    error(400, 'Missing required token exchange parameters');
  }

  // Check if code was already used (codes are single-use)
  if (usedCodes.has(code)) {
    error(400, 'Authorization code has already been used');
  }

  usedCodes.add(code);

  // In a real provider, verify the code against the database
  // and validate client_id, redirect_uri match what was issued
  const accessToken = `mock_token_${crypto.randomUUID()}`;

  return json({
    access_token: accessToken,
    token_type: 'bearer',
    expires_in: 3600,
    scope: 'user:read'
  });
};
```

**`src/routes/exercises/15-auth/05/callback/+server.ts`**

```typescript
import { redirect, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url, cookies, fetch }) => {
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');
  const savedState = cookies.get('oauth_state');

  // Validate state parameter (CSRF protection)
  if (!state || !savedState || state !== savedState) {
    error(403, 'Invalid state parameter — possible CSRF attack');
  }

  // Clear the state cookie (single-use)
  cookies.delete('oauth_state', { path: '/' });

  if (!code) {
    error(400, 'Missing authorization code');
  }

  // Exchange code for access token
  const tokenResponse = await fetch('/exercises/15-auth/05/mock-provider/token', {
    method: 'POST',
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: `${url.origin}/exercises/15-auth/05/callback`,
      client_id: 'demo-app'
    })
  });

  if (!tokenResponse.ok) {
    const detail = await tokenResponse.text();
    error(502, `Token exchange failed: ${detail}`);
  }

  const tokenData: { access_token: string } = await tokenResponse.json();

  // In a real app, use the access token to fetch user profile from provider API
  // Here we create a mock user based on the token
  const mockUser = {
    id: crypto.randomUUID(),
    name: 'OAuth User',
    email: 'oauth-user@example.com'
  };

  cookies.set('session', JSON.stringify(mockUser), {
    path: '/',
    httpOnly: true,
    sameSite: 'lax',
    secure: true,
    maxAge: 60 * 60 * 24 * 7
  });

  redirect(303, '/exercises/15-auth/05');
};
```

### Explanation

This exercise demystifies OAuth by implementing both the client (your SvelteKit app) and the server (the mock provider). The flow follows the OAuth 2.0 Authorization Code Grant exactly: (1) the app redirects to the provider with `client_id`, `redirect_uri`, `state`, and `response_type=code`; (2) the provider authenticates the user and redirects back with a `code` and the original `state`; (3) the app's callback handler verifies the `state` matches the cookie (CSRF protection), then exchanges the `code` for an `access_token` via a server-to-server POST; (4) the app uses the token to fetch user data and sets a session cookie. The `state` parameter is critical — without it, an attacker could craft a URL with their own authorization code and trick a user into linking the attacker's account. The authorization code is single-use (`usedCodes` Set) because replay attacks are a real threat. In production, you would use a library like `arctic` or `lucia` instead of implementing this manually, but understanding the raw flow is essential for debugging OAuth issues.
</details>
