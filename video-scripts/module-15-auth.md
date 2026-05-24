# Module 15 — Authentication: Video Lecture Script Outlines

> **Recording note:** Set editor font to 18px minimum. Split-screen: editor (left), browser with DevTools Application tab for cookies (right). Never show real credentials or API keys.

---

## Lesson 15.1 — What is auth

**Duration:** 10 minutes
**Screen setup:** Slides for concepts, browser showing login flow

### Hook (30 seconds)
"Authentication answers one question: who are you? Authorization answers another: what can you do? Getting these wrong means strangers read your data, modify your records, or impersonate your users. This lesson builds the mental model before we write code."

### Demo sequence
1. **[0:30-2:30] Authentication vs authorization** — Define each. Show examples: login is authentication, admin-only pages are authorization.
2. **[2:30-5:00] Session-based vs token-based** — Cookies with server sessions vs JWTs. Trade-offs: simplicity vs scalability.
3. **[5:00-7:00] SvelteKit's approach** — Hooks for middleware, cookies for sessions, load functions for data, form actions for forms.
4. **[7:00-8:30] Build the mini-build** — Auth flow diagram: register → login → session → protected route → logout.
5. **[8:30-9:30] Edge case / gotcha** — "Never store passwords in plain text. Always hash with bcrypt or Argon2. This is non-negotiable."

### Key moments
- 0:30 — "Who are you? What can you do?"
- 2:30 — "Sessions vs tokens"
- 5:00 — "SvelteKit auth tools"
- 7:00 — "Auth flow diagram"
- 8:30 — "Hash passwords always"

### Callout graphics
- Auth vs authz comparison
- Session vs JWT diagram
- SvelteKit auth architecture

### Outro (30 seconds)
"Authentication is the foundation of user trust. Next lesson: hooks for auth middleware."

---

## Lesson 15.2 — Hooks for auth

**Duration:** 11 minutes
**Screen setup:** Editor with hooks.server.ts, browser showing request flow

### Hook (30 seconds)
"Every request to your SvelteKit app passes through hooks.server.ts. This is your middleware — the single place where you read the session cookie, look up the user, and attach user data to every request. One file guards your entire app."

### Demo sequence
1. **[0:30-2:30] The handle function** — Show the request → handle → resolve flow. Read the session cookie.
2. **[2:30-5:00] Attaching user data** — Look up the user from the session. Set `event.locals.user`. Access in load functions.
3. **[5:00-7:30] Multiple hooks** — Use `sequence()` to compose multiple handle functions: auth, logging, CSRF.
4. **[7:30-9:30] Build the mini-build** — Auth hook that reads a session cookie, validates it, and attaches the user to locals.
5. **[9:30-10:30] Edge case / gotcha** — "hooks.server.ts runs on EVERY request, including static assets. Keep it fast. Cache user lookups if your database is slow."

### Key moments
- 0:30 — "One file, every request"
- 2:30 — "event.locals.user"
- 5:00 — "Composing hooks"
- 7:30 — "Auth hook mini-build"
- 9:30 — "Performance on every request"

### Callout graphics
- Request flow through hooks
- event.locals data flow
- sequence() composition

### Outro (30 seconds)
"Hooks centralize auth logic. Next lesson: user registration."

---

## Lesson 15.3 — Registration

**Duration:** 11 minutes
**Screen setup:** Editor with registration form and action, browser showing form

### Hook (30 seconds)
"A user signs up: email, password, confirm password. The server validates, hashes the password, creates the account, sets a session cookie, and redirects to the dashboard. Every step has security implications. This lesson builds registration correctly."

### Demo sequence
1. **[0:30-2:30] Registration form** — Build the form with email, password, and confirmation fields.
2. **[2:30-5:00] Server action** — Validate input, check for existing email, hash password with bcrypt, create user record.
3. **[5:00-7:30] Session creation** — Generate a session ID, store it, set it as an httpOnly cookie. Redirect to dashboard.
4. **[7:30-9:30] Build the mini-build** — Complete registration flow with validation errors and success redirect.
5. **[9:30-10:30] Edge case / gotcha** — "Set the cookie with httpOnly, secure, sameSite: 'lax', and path: '/'. Missing any of these weakens security."

### Key moments
- 0:30 — "Registration flow"
- 2:30 — "Server-side validation and hashing"
- 5:00 — "Session cookie setup"
- 7:30 — "Complete registration"
- 9:30 — "Cookie security flags"

### Callout graphics
- Registration flow diagram
- Password hashing pipeline
- Cookie flag reference

### Outro (30 seconds)
"Registration creates accounts securely. Next lesson: login."

---

## Lesson 15.4 — Login

**Duration:** 10 minutes
**Screen setup:** Editor with login form and action, browser

### Hook (30 seconds)
"Login verifies credentials: find the user by email, compare the hashed password, create a session, set the cookie. The flow is simpler than registration — but the security requirements are identical."

### Demo sequence
1. **[0:30-2:30] Login form** — Email and password fields with form action.
2. **[2:30-5:00] Credential verification** — Find user by email. Compare password hash with bcrypt.compare(). Handle wrong credentials.
3. **[5:00-7:00] Session and redirect** — Create session, set cookie, redirect to the intended page (not always the dashboard).
4. **[7:00-8:30] Build the mini-build** — Login page with error messages for wrong credentials.
5. **[8:30-9:30] Edge case / gotcha** — "Never reveal whether the email or password was wrong. 'Invalid email or password' — not 'Email not found.' This prevents user enumeration attacks."

### Key moments
- 0:30 — "Verify and session"
- 2:30 — "Bcrypt comparison"
- 5:00 — "Redirect to intended page"
- 7:00 — "Login page"
- 8:30 — "No user enumeration"

### Callout graphics
- Login flow diagram
- Password comparison
- Error message security

### Outro (30 seconds)
"Secure login verifies credentials without leaking information. Next lesson: protected routes."

---

## Lesson 15.5 — Protected routes

**Duration:** 10 minutes
**Screen setup:** Editor with protected load function, browser showing redirect

### Hook (30 seconds)
"The dashboard page should only be visible to logged-in users. The admin page should only be visible to admins. Protected routes check the user in the load function and redirect unauthorized visitors — before any page content is rendered."

### Demo sequence
1. **[0:30-2:30] Load function guard** — Check `event.locals.user` in the load function. Redirect if missing.
2. **[2:30-5:00] Role-based access** — Check user.role for admin pages. Redirect non-admins.
3. **[5:00-7:00] Layout-level protection** — Protect all child routes in a layout load function.
4. **[7:00-8:30] Build the mini-build** — Dashboard with auth guard and admin section with role guard.
5. **[8:30-9:30] Edge case / gotcha** — "Client-side navigation skips hooks.server.ts on subsequent navigations. The load function must check auth independently — do not rely solely on hooks."

### Key moments
- 0:30 — "Guard before render"
- 2:30 — "Role-based access"
- 5:00 — "Layout-level guards"
- 7:00 — "Dashboard and admin"
- 8:30 — "Client navigation caveat"

### Callout graphics
- Protection flow diagram
- Role-based access matrix
- Layout guard inheritance

### Outro (30 seconds)
"Protected routes redirect unauthorized users before rendering. Next lesson: logout."

---

## Lesson 15.6 — Logout

**Duration:** 8 minutes
**Screen setup:** Editor with logout action, browser showing session clearing

### Hook (30 seconds)
"Logout is deceptively simple: delete the session cookie and redirect. But do it wrong and the session persists in the database, the cookie lingers, or the user can press Back and see protected content. Proper logout cleans up everywhere."

### Demo sequence
1. **[0:30-2:00] Server-side cleanup** — Delete the session from the database. Clear the cookie. Redirect to login.
2. **[2:00-4:00] Form action approach** — Logout as a POST form action, not a GET link. Prevent CSRF.
3. **[4:00-5:30] Client-side cleanup** — Clear any client-side state (stores, caches).
4. **[5:30-6:30] Build the mini-build** — Logout button that clears everything and redirects.
5. **[6:30-7:30] Edge case / gotcha** — "Use POST for logout, not GET. A GET logout link can be triggered by prefetchers, link crawlers, or img tags — logging users out unintentionally."

### Key moments
- 0:30 — "Clean up everywhere"
- 2:00 — "POST, not GET"
- 4:00 — "Client-side cleanup"
- 5:30 — "Logout button"
- 6:30 — "GET logout dangers"

### Callout graphics
- Logout cleanup checklist
- POST vs GET logout
- Session lifecycle

### Outro (30 seconds)
"Proper logout cleans up on server and client. Next lesson: OAuth basics."

---

## Lesson 15.7 — OAuth basics

**Duration:** 12 minutes
**Screen setup:** Slides for OAuth flow, editor with implementation

### Hook (30 seconds)
"Sign in with Google. Sign in with GitHub. Users prefer OAuth because they do not need another password. Your app prefers it because you do not store passwords. OAuth delegates authentication to a trusted provider — but the flow has moving parts."

### Demo sequence
1. **[0:30-3:00] OAuth flow** — Authorization code flow: redirect → provider login → callback with code → exchange for token → get user info.
2. **[3:00-5:30] SvelteKit implementation** — Login redirect endpoint, callback endpoint, session creation from OAuth user.
3. **[5:30-8:00] Provider configuration** — Register your app with GitHub. Set redirect URI. Get client ID and secret.
4. **[8:00-10:00] Build the mini-build** — GitHub OAuth login: redirect, callback, session, dashboard.
5. **[10:00-11:30] Edge case / gotcha** — "Always validate the state parameter in the callback to prevent CSRF attacks. Generate a random state, store it in a cookie, and verify it matches."

### Key moments
- 0:30 — "Delegated authentication"
- 3:00 — "SvelteKit OAuth endpoints"
- 5:30 — "Provider setup"
- 8:00 — "GitHub login"
- 10:00 — "State parameter CSRF"

### Callout graphics
- OAuth authorization code flow
- SvelteKit OAuth endpoints
- State parameter CSRF protection

### Outro (30 seconds)
"OAuth lets users sign in without passwords. Last lesson: production auth patterns."

---

## Lesson 15.8 — Auth production patterns

**Duration:** 11 minutes
**Screen setup:** Editor with production auth code, security checklist

### Hook (30 seconds)
"Your auth works in development. Now harden it for production: rate limiting, CSRF protection, session rotation, account lockout, and secure password reset. These patterns protect your users when attackers come — and they will come."

### Demo sequence
1. **[0:30-2:30] Rate limiting** — Limit login attempts per IP. Show the rate limiter middleware.
2. **[2:30-5:00] Session rotation** — Generate a new session ID after login to prevent session fixation.
3. **[5:00-7:30] CSRF protection** — SvelteKit's built-in CSRF protection. How it works. When to add extra protection.
4. **[7:30-9:30] Build the mini-build** — Production auth checklist component that verifies each security measure.
5. **[9:30-10:30] Edge case / gotcha** — "Password reset links must expire (15 minutes max) and be single-use. A non-expiring reset link is a permanent backdoor."

### Key moments
- 0:30 — "Hardening for production"
- 2:30 — "Session rotation"
- 5:00 — "CSRF protection"
- 7:30 — "Security checklist"
- 9:30 — "Reset link expiration"

### Callout graphics
- Production auth checklist
- Session fixation prevention
- Rate limiting implementation

### Outro (30 seconds)
"Production auth is about defense in depth. Module 15 is complete — you can build secure authentication from registration to production hardening."

---
