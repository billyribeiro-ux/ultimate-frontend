---
module: 22
lesson: 22.6
title: Feature flags
duration: 55 minutes
prerequisites:
  - "22.5 — Preview deployments & branch deploys"
  - "2.7 — $derived() — pure functions introduced naturally"
  - "11.3 — .svelte.ts files — universal reactive state"
learning_objectives:
  - Explain the purpose of feature flags and why they decouple deployment from release
  - Implement cookie-based, URL-param-based, and percentage-based feature flag mechanisms
  - Build a typed feature flag system using $derived for reactive flag evaluation
  - Design a feature flag dashboard for toggling flags at runtime
  - Articulate the maintenance burden of feature flags and when to remove them
status: ready
---

# Lesson 22.6 — Feature flags

> **Atomic lesson format** — every lesson in this course follows the same four parts: **Concept**, **Style it**, **Interact**, **Mini-build**.

## 1. Concept — Ship code without shipping features

### 1.1 The problem: deployment and release are the same thing

In a traditional workflow, deploying code to production immediately makes it available to all users. If you deploy a new checkout flow, every user sees it the moment the deploy completes. If the new checkout flow has a bug, every user is affected. Rolling back means redeploying the old code, which takes minutes and may cause downtime.

This coupling between **deployment** (putting code on the server) and **release** (making features visible to users) creates risk. Teams avoid deploying frequently because each deploy is a release, and each release is a risk. Long-lived feature branches accumulate merge conflicts. Large, infrequent deploys are harder to debug when something goes wrong.

**Feature flags** decouple deployment from release. You deploy code that includes the new feature, but the feature is hidden behind a flag. The flag controls whether the feature is visible. You can deploy the code on Monday and release the feature on Wednesday. You can release to 5% of users first and scale up gradually. If something goes wrong, you flip the flag off — instantly, without redeploying.

### 1.2 Types of feature flags

**Boolean flags** are the simplest: a feature is either on or off. Use them for new features that are ready for some users but not all.

**Cookie-based flags** store the flag value in a browser cookie. The flag persists across page loads and sessions. This is the simplest implementation for client-side flags. The user's flag assignment is sticky — they see the same variant every time.

**URL-parameter flags** read the flag from the URL query string (`?feature=new-header`). This is useful for manual testing and QA: share a URL with the flag enabled and anyone who clicks it sees the feature. URL flags do not persist across navigation unless you propagate them.

**Percentage rollout flags** assign users to a variant based on a hash of their user ID (or a random cookie). If the flag is set to 20%, roughly 20% of users see the feature. You can increase the percentage gradually: 5% → 20% → 50% → 100%. If error rates spike at any stage, you reduce the percentage.

### 1.3 Building a typed flag system in SvelteKit

A feature flag system needs three parts: (1) a flag definition with metadata, (2) a mechanism for reading flag values, and (3) reactive evaluation so components update when flags change.

```typescript
// src/lib/flags.svelte.ts
interface FlagDefinition {
    id: string;
    label: string;
    description: string;
    defaultValue: boolean;
    rolloutPercentage: number;
}

const FLAG_DEFINITIONS: FlagDefinition[] = [
    {
        id: 'new-header',
        label: 'New Header Design',
        description: 'Updated header with search and notifications',
        defaultValue: false,
        rolloutPercentage: 100
    },
    {
        id: 'dark-mode-beta',
        label: 'Dark Mode Beta',
        description: 'Enable dark mode toggle in settings',
        defaultValue: false,
        rolloutPercentage: 30
    }
];
```

The flag system reads values from cookies and exposes them as reactive `$derived` values:

```typescript
function getFlagValue(flagId: string, cookies: string): boolean {
    const cookieValue: string | undefined = parseCookie(cookies, `flag_${flagId}`);
    if (cookieValue !== undefined) {
        return cookieValue === 'true';
    }
    const definition: FlagDefinition | undefined = FLAG_DEFINITIONS.find(
        (f: FlagDefinition) => f.id === flagId
    );
    return definition?.defaultValue ?? false;
}
```

### 1.4 Percentage rollout mechanics

Percentage rollout uses a deterministic hash to assign users. Given a user identifier (from a cookie or session), you hash it and check whether the hash falls within the rollout percentage:

```typescript
function isInRollout(userId: string, percentage: number): boolean {
    let hash: number = 0;
    for (let i: number = 0; i < userId.length; i++) {
        hash = ((hash << 5) - hash + userId.charCodeAt(i)) | 0;
    }
    const normalized: number = Math.abs(hash) % 100;
    return normalized < percentage;
}
```

The deterministic hash ensures that the same user always gets the same result for a given percentage. If the percentage increases from 20% to 50%, all users who were in the 20% group are still in the 50% group — no one gets the feature removed.

### 1.5 Flag lifecycle and cleanup

Feature flags are not permanent. Every flag has a lifecycle:

1. **Created** — the flag is added to the codebase, defaulting to off.
2. **Rolled out** — the flag is gradually enabled for increasing percentages of users.
3. **Fully enabled** — the flag is on for 100% of users. The feature is released.
4. **Removed** — the flag is deleted from the code, and all conditional logic is replaced with the enabled path.

Step 4 is the most commonly skipped step, and it is the most important. Unremoved flags accumulate as **technical debt**. A codebase with 50 active flags has 2^50 possible feature combinations — it is impossible to test all of them. Set a policy: every flag has an expiration date. When the date passes, the flag is either removed (if the feature is stable) or the feature is reverted (if it is not).

### 1.6 "In Production" — feature flags at a B2B SaaS

A B2B SaaS company used feature flags to manage their transition from a legacy billing system to a new one. They created a `new-billing` flag and rolled it out to 5% of accounts (selected by account ID hash). The new system had a bug in invoice rounding that caused discrepancies of a few cents. Because only 5% of accounts were affected, the impact was small. They fixed the bug, verified with the 5% group, then scaled to 25%, 50%, and finally 100% over three weeks. Without flags, the bug would have affected all 2,000 accounts simultaneously, requiring an emergency rollback and customer communication.

### 1.7 The TypeScript angle

A well-typed flag system prevents using nonexistent flags:

```typescript
type FlagId = 'new-header' | 'dark-mode-beta' | 'analytics-v2' | 'experimental-cache';

interface TypedFlags {
    get(id: FlagId): boolean;
    set(id: FlagId, value: boolean): void;
    getAll(): Record<FlagId, boolean>;
}
```

Using a union type for `FlagId` means that `flags.get('nonexistent')` is a compile-time error. When you add a new flag, you add it to the union type, and TypeScript tells you everywhere that needs updating.

### 1.8 Common interview question

**Q: "Why do feature flags exist if you can just deploy when a feature is ready?"**

**Model answer:** Feature flags decouple deployment from release. Deployment puts code on servers; release makes features visible to users. Without flags, these happen simultaneously, meaning every deploy is a risk event. With flags, you can deploy code with a feature hidden, then release it gradually (percentage rollout), instantly (flag flip), or conditionally (per-user, per-account). If a problem is discovered, you disable the flag in seconds without redeploying. Flags also enable trunk-based development: everyone commits to the main branch, hiding incomplete features behind flags, which eliminates long-lived feature branches and merge conflicts.

## Deep Dive

**Server-side vs client-side flag evaluation.** Flags can be evaluated on the server (in hooks or load functions) or on the client (in components). Server-side evaluation prevents the feature from flickering — the HTML delivered to the browser already reflects the flag state. Client-side evaluation is simpler but can cause a flash of the wrong variant. For visual features (new header, redesigned component), evaluate on the server. For behavioral features (enable analytics, change API endpoint), client-side evaluation is fine.

**Flag dependencies.** Some flags depend on others: you cannot enable `analytics-v2` without `new-header` because the new analytics are triggered by events in the new header. Model these dependencies explicitly in your flag definitions and validate them when flags change.

**Gradual rollout math.** If a flag is at 20% and you increase to 50%, you want the same users who were in the 20% group to remain in the 50% group. The deterministic hash achieves this: users with hash values 0-19 are in the 20% group, and users with hash values 0-49 are in the 50% group. The 20% group is a subset of the 50% group. This prevents users from being included, excluded, then re-included as the percentage increases.

**Feature flags vs environment variables.** Environment variables are set at deploy time and require a redeploy to change. Feature flags are evaluated at runtime and can change instantly. Use environment variables for configuration that differs between environments (API URLs, database connections). Use feature flags for features that differ between users or that need instant toggling.

**Connection to other lessons.** Lesson 22.5 covered how different environments have different configurations. Lesson 11.3 introduced `.svelte.ts` files for shared reactive state — the same pattern used here for the flag system. Lesson 22.7 covers monitoring, which is essential for evaluating whether a flag rollout is causing problems. Lesson 22.8 covers rollback strategies, where disabling a feature flag is the fastest rollback mechanism.

## Going Deeper

**Official docs to read next:**

- [svelte.dev/docs/svelte/$state](https://svelte.dev/docs/svelte/$state) — reactive state for flag values.
- [developer.mozilla.org/en-US/docs/Web/API/Document/cookie](https://developer.mozilla.org/en-US/docs/Web/API/Document/cookie) — cookie API for flag persistence.
- [martinfowler.com/articles/feature-toggles.html](https://martinfowler.com/articles/feature-toggles.html) — Martin Fowler's comprehensive guide to feature toggles.

**Advanced pattern: multi-variant flags.** Boolean flags support two states (on/off). Multi-variant flags support multiple states (variant-a, variant-b, variant-c) for A/B/C testing. The rollout percentage becomes a distribution: 33% variant-a, 33% variant-b, 34% variant-c. This is how teams test multiple designs simultaneously without multiple deployments.

**Challenge question (combines Lesson 22.6 + Lesson 22.5 + Lesson 22.7):** You roll out a new checkout flow to 10% of users using a feature flag. Your monitoring (Lesson 22.7) shows that the error rate for the checkout API increases by 2x for flagged users. Describe the steps you would take, including: how you would confirm the flag is the cause, how you would roll back, and what you would do before attempting the rollout again.

## 2. Style it — PE7 applied to the feature flag dashboard

The mini-build is a dashboard showing all flags as toggle cards. Each flag card uses `var(--color-surface-2)` with `var(--radius-lg)` and a left border colored by status: `var(--color-success)` for enabled, `var(--color-border)` for disabled. Toggle switches use `var(--color-brand)` when active and `var(--color-text-muted)` when inactive with `var(--dur-fast)` transition. The rollout percentage uses a progress bar with `var(--color-brand)` fill. Typography: flag labels in `var(--text-base)` bold, descriptions in `var(--text-sm)` muted.

## 3. Interact — toggling flags and adjusting rollout percentages

The problem: feature flags are abstract until you interact with them. The interactive element lets you toggle flags on/off, adjust rollout percentages with a slider, and see the effect on a simulated user population. A grid of simulated user avatars shows which users would see the feature at the current rollout percentage, updating reactively via `$derived`.

```typescript
interface Flag {
    id: string;
    label: string;
    description: string;
    enabled: boolean;
    rolloutPercentage: number;
    source: 'cookie' | 'url-param' | 'percentage';
}
```

## 4. Mini-build — feature flag dashboard

**File:** `src/routes/modules/22-devops/06-feature-flags/+page.svelte`

This page renders a feature flag management dashboard. The student can toggle flags, adjust rollout percentages, and see the simulated effect on a user population. The flags persist via the flag system pattern demonstrated in the lesson.

### Run it

```bash
pnpm dev
```

Then open `http://localhost:5173/modules/22-devops/06-feature-flags`.

### Prove the concept

1. Toggle the "New Header" flag and watch the flag status and border color update reactively.
2. Adjust the rollout percentage slider for "Dark Mode Beta" and watch the simulated user grid update — more user dots become active as the percentage increases.
3. Open Svelte DevTools and observe the `$derived` values recomputing as you change flag settings.
4. Open DevTools Application tab and check cookies — flag values are persisted as `flag_*` cookies.

## 5. Check your understanding

<details>
<summary><strong>Q1.</strong> What is the difference between deployment and release, and how do feature flags separate them?</summary>

Deployment is putting code on servers. Release is making features visible to users. Without flags, deployment and release happen simultaneously — every deploy is a release. Feature flags let you deploy code with a feature hidden behind a conditional check. You control when the feature becomes visible by toggling the flag, independently of when the code was deployed.
</details>

<details>
<summary><strong>Q2.</strong> Why is deterministic hashing important for percentage rollout?</summary>

Deterministic hashing ensures that the same user always gets the same result for a given flag and percentage. If the rollout is at 20%, user "alice" is either always in or always out. When the percentage increases to 50%, everyone who was in the 20% group remains in the 50% group. Without deterministic hashing, users would randomly flip between seeing and not seeing the feature on each request.
</details>

<details>
<summary><strong>Q3.</strong> Why is removing old feature flags important?</summary>

Unremoved flags accumulate as technical debt. Each flag adds a conditional branch in the code, doubling the number of possible code paths. A codebase with 50 flags has 2^50 possible combinations — impossible to test comprehensively. Old flags also confuse new team members who do not know if the flag is still relevant or if it can be removed. Set expiration dates on flags and remove them once the feature is stable.
</details>

<details>
<summary><strong>Q4.</strong> When would you evaluate a feature flag on the server vs the client?</summary>

Evaluate on the server when the flag controls visual features (new header, redesigned page) to prevent a flash of the wrong variant. The server renders the correct HTML from the start. Evaluate on the client when the flag controls behavior (enable analytics, change API endpoint) where a brief delay is acceptable and SSR is not involved.
</details>

<details>
<summary><strong>Q5.</strong> How do feature flags enable trunk-based development?</summary>

In trunk-based development, all developers commit directly to the main branch (or merge short-lived branches within 1-2 days). Without flags, incomplete features would be visible to users. With flags, developers commit incomplete feature code behind a disabled flag, keeping the main branch always deployable while features are built incrementally.
</details>

## 6. Common mistakes

- **Leaving flags in the codebase permanently.** Every flag should have an expiration date. After the feature is fully rolled out and stable, remove the flag and all its conditional logic. Treat flag cleanup as a required part of the feature lifecycle.
- **Not testing both flag states.** If you only test with the flag enabled, you do not know if the disabled state is broken. Always test both paths, especially before increasing rollout percentage.
- **Using Math.random() for percentage rollout.** `Math.random()` produces different results on every call, so the same user would see different variants on every page load. Use a deterministic hash of the user ID instead.
- **Storing sensitive data in flag names or values.** Flag cookies are visible in DevTools. Never use flag names that reveal business strategy (like `acquisition-price-increase`) or flag values that contain user data.

## 7. What's next

Lesson 22.7 introduces monitoring and observability — how to know when something goes wrong in production, which is essential for safely rolling out features with flags.
