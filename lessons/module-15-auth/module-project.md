# Module 15 — Authentication — Module Project

## Project: Authenticated Dashboard

Build a complete, production-quality authenticated application with registration, login, a protected dashboard, logout, and session expiry display. Everything you have learned in Module 15 appears in this project: form actions, password hashing, session cookies, route protection, typed responses, progressive enhancement, and PE7 styling.

This project ties together every lesson in the module. The auth flow works without JavaScript (form actions submit natively), enhances with `use:enhance` when JS is available, and is typed throughout with zero `any`.

## Learning objectives

By the end of this project you can:

- Build a complete registration-to-logout flow using SvelteKit form actions
- Hash passwords with PBKDF2 and verify them on login
- Set and read httpOnly session cookies with proper security attributes
- Protect routes using server load function guards with typed narrowing
- Display session metadata (expiry, creation time) to the authenticated user
- Style auth forms with PE7 tokens, mobile-first layout, and 44px touch targets
- Ensure the entire flow works without JavaScript (progressive enhancement)

## Required features

1. **Registration page** at `src/routes/modules/15-auth/project/register/+page.svelte` with a form action that validates name, email, and password (min 8 chars), hashes the password, stores the user, and returns typed errors on failure.

2. **Login page** at `src/routes/modules/15-auth/project/login/+page.svelte` with a form action that verifies credentials, creates a session, sets an httpOnly cookie, and redirects to the dashboard. Includes a "Remember me" checkbox that extends the session to 30 days.

3. **Protected dashboard** at `src/routes/modules/15-auth/project/dashboard/+page.svelte` that:
   - Redirects unauthenticated users to login (server load guard)
   - Displays the user's name, email, and member-since date
   - Shows session expiry time with a formatted countdown
   - Has a logout button (form action, not a link)

4. **Logout action** that deletes both the server session and the cookie, then redirects to login.

5. **Hooks integration** via `src/hooks.server.ts` reading the session cookie and populating `event.locals.user` on every request.

6. **Typed throughout.** `App.Locals` typed in `app.d.ts`. All form responses typed. All component props typed with interfaces. Zero `any`.

7. **Progressive enhancement.** Every form works without JavaScript. `use:enhance` adds smooth client-side behavior when JS is available.

8. **PE7 styled.** Per-page color personality (`oklch(65% 0.18 160)` — security green), all tokens by name, mobile-first, 44px touch targets, `prefers-reduced-motion` respected.

## Acceptance criteria

- [ ] Registration creates a user with hashed password (no plain text storage)
- [ ] Login verifies password and sets httpOnly + secure + sameSite=lax cookie
- [ ] Dashboard is inaccessible without authentication (302 redirect to login)
- [ ] Logout deletes both server session and browser cookie
- [ ] Session expiry is displayed on the dashboard
- [ ] Remember-me checkbox extends cookie maxAge to 30 days
- [ ] All forms work with JavaScript disabled (progressive enhancement)
- [ ] No `any` types, no `export let`, no `on:click`
- [ ] Every color references a PE7 token or scoped custom property
- [ ] Mobile-first layout, 44px touch targets on all interactive elements
- [ ] `prefers-reduced-motion` respected on all transitions
- [ ] Lighthouse mobile accessibility score: 100
- [ ] Error messages do not reveal whether email or password was wrong at login

## Suggested timeline

- **30 min.** Set up the route structure and server files.
- **30 min.** Build the registration form and action with validation.
- **30 min.** Build the login form with password verification and session creation.
- **20 min.** Build the protected dashboard with session expiry display.
- **15 min.** Build the logout action and button.
- **15 min.** Add remember-me checkbox logic.
- **20 min.** Style everything with PE7 tokens, test mobile layout.
- **10 min.** Test with JavaScript disabled. Run Lighthouse audit.

## Stretch goals

- Add rate limiting to the login action (block after 5 failures for 15 minutes)
- Show "last login" timestamp on the dashboard
- Add a "change password" form on the dashboard (requires current password + new password)
- Implement sliding sessions (extend expiry on each authenticated request)
- Add a session list showing all active sessions with the ability to revoke them
