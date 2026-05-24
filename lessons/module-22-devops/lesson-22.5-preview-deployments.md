---
module: 22
lesson: 22.5
title: Preview deployments & branch deploys
duration: 50 minutes
prerequisites:
  - "22.1 — Adapter deep dive"
  - "22.3 — Vercel Edge Functions"
  - "22.4 — Docker for SvelteKit"
learning_objectives:
  - Explain the value of preview deployments in a team workflow
  - Describe how PR preview URLs are generated and isolated per branch
  - Design an environment promotion pipeline from dev through staging to production
  - Articulate the security considerations of preview deployments
  - Build a visual representation of a deployment pipeline with branch tracking
status: ready
---

# Lesson 22.5 — Preview deployments & branch deploys

> **Atomic lesson format** — every lesson in this course follows the same four parts: **Concept**, **Style it**, **Interact**, **Mini-build**.

## 1. Concept — See every change before it ships

### 1.1 The problem: reviewing code is not the same as reviewing the product

Code review catches syntax errors, logic bugs, and architectural issues. But it does not catch visual regressions, broken responsive layouts, or interaction bugs. A reviewer reading a diff cannot tell whether a CSS change broke the mobile layout or whether a new component looks right with real data. They need to see the running application.

Traditionally, this meant the reviewer would check out the branch locally, install dependencies, and run the dev server. This takes minutes, interrupts their flow, and creates friction that discourages thorough visual review. Many teams skip visual review entirely and merge based on code review alone, discovering visual bugs only after they reach production.

**Preview deployments** solve this by automatically deploying every pull request to a unique URL. When a developer pushes a branch or opens a PR, the CI/CD system builds the application and deploys it to a temporary environment with its own URL — something like `my-app-pr-42.vercel.app`. The reviewer clicks the link, sees the running application, and reviews visually. No local setup, no context switching.

### 1.2 How preview deployments work

The mechanics vary by platform, but the flow is consistent:

1. A developer pushes to a feature branch or opens a pull request.
2. A webhook triggers the deployment platform (Vercel, Cloudflare Pages, Netlify, or a custom CI pipeline).
3. The platform builds the application using the branch's code.
4. The build output is deployed to an isolated environment with a unique URL.
5. The URL is posted as a comment on the pull request (via GitHub/GitLab integration).
6. When the PR is merged or closed, the preview deployment is torn down.

Each preview deployment is isolated: it has its own URL, its own server-side code, and its own static assets. Changes to one preview do not affect another. This isolation is what makes them safe for parallel review.

### 1.3 Branch-based staging

Preview deployments are the PR-level concept. At a broader level, teams often maintain **branch-based environments**:

- **Development** (`dev` branch) — the integration environment where all feature branches merge first. Deploys automatically on every push. Used for internal testing.
- **Staging** (`staging` branch) — a production-like environment for QA and stakeholder review. Deploys when code is promoted from dev. Uses production data (or a sanitized copy).
- **Production** (`main` branch) — the live environment serving real users. Deploys when code is promoted from staging, usually after manual approval.

This **promotion model** (dev → staging → prod) ensures that code is tested in increasingly realistic environments before reaching users. Each environment has its own URL, its own environment variables, and potentially its own database.

### 1.4 Environment variables per deployment

Each environment needs different configuration: different API URLs, different database credentials, different feature flags. SvelteKit handles this through environment variables, which platforms inject at build time or runtime:

- Vercel: environment variables are configured per branch pattern (production, preview, development) in the project settings.
- Cloudflare Pages: environment variables are set per environment (production, preview) in the Pages dashboard.
- Docker/custom: environment variables are passed via `docker run -e` or a `.env` file mounted at runtime.

The critical rule: **never share production credentials with preview deployments.** A preview deployment is accessible by URL, and in some configurations, publicly accessible. If a preview deployment connects to the production database, a reviewer could accidentally modify production data.

### 1.5 Security considerations

Preview deployments introduce security risks that must be managed:

- **Public access:** By default, preview URLs are publicly accessible. Anyone with the URL can see the application. For sensitive applications, enable authentication on preview deployments (Vercel and Cloudflare both offer preview protection).
- **Environment variable exposure:** Public environment variables (like API keys for client-side services) are baked into the preview build. Ensure that preview API keys have limited permissions.
- **Database isolation:** Preview deployments should connect to a staging or development database, never production.
- **Third-party service limits:** Preview deployments consume third-party service quotas (email, SMS, payment processing). Use sandbox modes for all external services.

### 1.6 "In Production" — preview deploys at a 30-person startup

A startup with 12 engineers and 6 designers adopted preview deployments on Vercel. Before, designers would file tickets saying "the spacing looks wrong" after code reached production. After, designers reviewed every PR by clicking the preview URL, leaving visual feedback directly on the PR. The number of post-merge visual bug reports dropped by 85%. The team also used branch-based staging: the `staging` branch deployed to `staging.myapp.com` where the QA team ran manual test passes before promoting to production. The promotion was a Git merge from `staging` to `main`, which triggered the production deployment automatically.

### 1.7 The TypeScript angle

When building a deployment pipeline visualizer, typed models keep the data consistent:

```typescript
type Environment = 'development' | 'staging' | 'production';
type DeploymentStatus = 'pending' | 'building' | 'deploying' | 'live' | 'failed' | 'torn-down';

interface Deployment {
    id: string;
    branch: string;
    environment: Environment;
    status: DeploymentStatus;
    url: string;
    commitHash: string;
    timestamp: number;
    duration: number;
}

interface Pipeline {
    environments: Environment[];
    deployments: Map<Environment, Deployment>;
    promotionHistory: PromotionEvent[];
}

interface PromotionEvent {
    from: Environment;
    to: Environment;
    deploymentId: string;
    promotedBy: string;
    timestamp: number;
}
```

### 1.8 Common interview question

**Q: "Why are preview deployments valuable, and what risks do they introduce?"**

**Model answer:** Preview deployments let reviewers see a running application for every pull request without local setup. This enables visual review, interaction testing, and stakeholder feedback before code reaches production. The risks include: publicly accessible URLs exposing pre-release features, preview deployments accidentally connecting to production databases or services, API keys with excessive permissions being baked into preview builds, and third-party service quotas being consumed by preview environments. Mitigation strategies include preview authentication, environment-specific credentials with limited permissions, database isolation, and sandbox modes for external services.

## Deep Dive

**Atomic deployments.** Most modern platforms use atomic deployments: the new version is built and prepared in isolation, then traffic is switched from the old version to the new version instantaneously. There is no "uploading files while the site is half-updated" scenario. Vercel, Cloudflare Pages, and Netlify all use atomic deployments. For Docker-based deployments, you achieve atomicity through blue-green deployments (Lesson 22.8).

**Monorepo preview deployments.** In a monorepo with multiple SvelteKit applications, you want to deploy only the apps affected by a PR's changes. Vercel and Cloudflare Pages support monorepo configurations where each app has its own build command, output directory, and preview URL. Turborepo and Nx can detect which packages changed and trigger only the relevant builds.

**Preview deployment metadata.** Platforms inject deployment metadata as environment variables: `VERCEL_GIT_COMMIT_SHA`, `VERCEL_GIT_COMMIT_REF` (branch name), `CF_PAGES_COMMIT_SHA`, etc. You can display this in a footer or debug panel so reviewers know exactly which commit they are viewing. This is especially useful when a preview URL is cached in their browser and they need to confirm they are seeing the latest push.

**Cost implications.** Preview deployments consume build minutes and hosting resources. Vercel's Pro plan includes unlimited preview deployments. Cloudflare Pages offers 500 builds per month on the Free plan. For self-hosted CI/CD, each preview deployment runs a build job and occupies hosting resources until torn down. Set a retention policy to automatically tear down preview deployments older than a certain age.

**Connection to other lessons.** Lesson 22.1 covered how different adapters produce different build outputs. Lesson 22.3 explored Vercel's deployment model. Lesson 22.6 introduces feature flags, which are often evaluated differently per environment. Lesson 22.8 covers the production side — rollback strategies when a promotion goes wrong.

## Going Deeper

**Official docs to read next:**

- [vercel.com/docs/deployments/preview-deployments](https://vercel.com/docs/deployments/preview-deployments) — Vercel's preview deployment documentation.
- [developers.cloudflare.com/pages/configuration/preview-deployments](https://developers.cloudflare.com/pages/configuration/preview-deployments/) — Cloudflare Pages preview deployment configuration.
- [docs.github.com/en/actions](https://docs.github.com/en/actions) — GitHub Actions for building custom deployment pipelines.

**Advanced pattern: deploy previews with seeded databases.** For data-heavy applications, a preview deployment against an empty database is useless. Advanced teams seed preview databases automatically: when a preview is created, a CI job provisions a temporary database, runs migrations, and loads seed data. When the preview is torn down, the database is deleted. This gives reviewers a realistic experience without risking production data.

**Challenge question (combines Lesson 22.5 + Lesson 22.4 + Lesson 22.6):** Your team uses Docker-based deployments with no managed platform. Design a GitHub Actions workflow that builds a Docker image for each PR, deploys it to a shared Kubernetes cluster with a unique URL, posts the URL on the PR, and tears down the deployment when the PR is closed. What environment variables would you inject, and how would you isolate feature flags between preview deployments?

## 2. Style it — PE7 applied to the deployment pipeline visualizer

The mini-build is a vertical pipeline diagram showing environments and their deployment status. Each environment node is a card with `var(--color-surface-2)` background and `var(--radius-lg)` corners. The active environment glows with `var(--color-brand)` border and `var(--shadow-md)`. Pipeline arrows between environments use `var(--color-border)` for inactive and `var(--color-success)` for promoted. Status badges use `var(--color-success)` for "live," `var(--color-warning)` for "building," and `var(--color-error)` for "failed." The layout is vertical on mobile and horizontal at `min-width: 768px`.

## 3. Interact — promoting deployments through environments

The problem: the promotion flow (dev → staging → prod) is abstract until you interact with it. The interactive element lets you click "promote" buttons to move a deployment through environments. A `$state` tracks the current deployment in each environment, and `$derived` computes whether promotion is available (you cannot promote from dev to prod, you must go through staging). A simulated build step with a timer shows the deploy process.

```typescript
interface PipelineDeployment {
    id: string;
    branch: string;
    commitHash: string;
    environment: Environment;
    status: DeploymentStatus;
    timestamp: number;
}
```

## 4. Mini-build — deployment pipeline visualizer

**File:** `src/routes/modules/22-devops/05-preview-deployments/+page.svelte`

This page renders an interactive deployment pipeline with three environments (development, staging, production). The student can simulate promotions, see build progress, and watch deployments flow through the pipeline.

### Run it

```bash
pnpm dev
```

Then open `http://localhost:5173/modules/22-devops/05-preview-deployments`.

### Prove the concept

1. Click "Deploy to Dev" and watch the build simulation progress through pending → building → deploying → live.
2. Once the dev deployment is live, the "Promote to Staging" button enables. Click it and watch the staging build.
3. After staging is live, "Promote to Production" enables. Each promotion creates a new entry in the deployment history.
4. In Svelte DevTools, observe how `$state` for each environment updates independently and `$derived` controls button availability.

## 5. Check your understanding

<details>
<summary><strong>Q1.</strong> What is the primary value of preview deployments for a development team?</summary>

Preview deployments enable visual and interactive review of changes without requiring reviewers to set up the project locally. Every pull request gets its own URL where the running application can be seen and tested. This catches visual regressions, layout bugs, and interaction issues that code review alone cannot detect.
</details>

<details>
<summary><strong>Q2.</strong> Why should preview deployments never connect to a production database?</summary>

Preview deployments are accessible by URL and may be publicly accessible. If they connect to the production database, reviewers could accidentally create, modify, or delete production data. A bug in preview code could corrupt production data. Preview deployments should always use staging or development databases with isolated data.
</details>

<details>
<summary><strong>Q3.</strong> What is the environment promotion model, and why is it safer than deploying directly to production?</summary>

The promotion model (dev → staging → prod) moves code through increasingly realistic environments before it reaches users. Code is first tested in development (integration), then in staging (production-like with real data patterns), and only then promoted to production. Each stage catches different categories of bugs. Direct-to-production deployment skips these safety nets.
</details>

<details>
<summary><strong>Q4.</strong> How do atomic deployments prevent the "half-updated site" problem?</summary>

Atomic deployments prepare the new version completely in isolation before switching traffic. The old version continues serving all requests until the new version is fully ready, then traffic switches instantaneously. There is no window where some files are from the old version and some from the new version.
</details>

<details>
<summary><strong>Q5.</strong> What metadata should a preview deployment expose so reviewers know what they are looking at?</summary>

The branch name, commit hash, build timestamp, and deployment URL. This helps reviewers confirm they are seeing the latest code from the correct branch, especially if their browser cached an older version. Most platforms inject this metadata as environment variables that can be displayed in a debug footer.
</details>

## 6. Common mistakes

- **Making preview deployments publicly accessible for internal applications.** If your application handles sensitive data, preview URLs should require authentication. Both Vercel and Cloudflare Pages offer preview protection features that require sign-in before accessing preview deployments.
- **Using production API keys in preview environments.** Preview deployments should use sandbox or development-tier API keys for all third-party services (payment processors, email providers, analytics). Production keys should only exist in the production environment.
- **Not tearing down old preview deployments.** Each preview consumes hosting resources. If you have 50 open PRs and never clean up, you have 50 active deployments. Set a retention policy to automatically tear down preview deployments older than 7-14 days.
- **Skipping staging and promoting directly from dev to production.** The staging environment exists to catch bugs that only appear in production-like conditions (real data volumes, production configurations, external service integration). Skipping it increases the risk of production incidents.

## 7. What's next

Lesson 22.6 introduces feature flags — a runtime mechanism for controlling which features are visible to which users, without redeploying.
