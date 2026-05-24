---
module: 22
lesson: 22.8
title: Rollback & incident response
duration: 55 minutes
prerequisites:
  - "22.7 — Monitoring & observability"
  - "22.6 — Feature flags"
  - "22.5 — Preview deployments & branch deploys"
learning_objectives:
  - Explain blue-green deployments and canary releases as risk-reduction strategies
  - Describe instant rollback mechanisms for different deployment targets
  - Design an incident response runbook template for a SvelteKit application
  - Build a deployment history timeline that shows version progression and rollback points
  - Articulate why rollback speed is more important than rollback perfection
status: ready
---

# Lesson 22.8 — Rollback & incident response

> **Atomic lesson format** — every lesson in this course follows the same four parts: **Concept**, **Style it**, **Interact**, **Mini-build**.

## 1. Concept — When things go wrong, speed is everything

### 1.1 The problem: every deployment can break production

No matter how thorough your testing, preview deployments, and staging environment, production deployments can fail. A dependency upgrade introduces a subtle bug. A database migration locks a table. An external API changes its response format. A configuration change enables a code path that was never tested with real data.

The question is not whether production will break. The question is how quickly you detect the breakage (Lesson 22.7) and how quickly you recover. The difference between a 2-minute incident and a 2-hour incident is often the difference between "our monitoring caught it and we rolled back automatically" and "we did not know until a customer emailed support and then we spent an hour figuring out what changed."

### 1.2 Rollback strategies

**Instant revert** is the fastest strategy. On managed platforms (Vercel, Cloudflare Pages, Netlify), every deployment is atomic and immutable. The previous deployment still exists. Rolling back means pointing traffic at the previous deployment — no build, no deploy, just a traffic switch. Vercel's dashboard has a "Promote to Production" button on any past deployment. Cloudflare Pages has "Rollback to this deployment." This takes seconds.

**Feature flag disable** is the next fastest. If the broken behavior is behind a feature flag (Lesson 22.6), you disable the flag. The code is still deployed, but the broken feature is hidden. This takes seconds and requires no deployment infrastructure — just a cookie or database change.

**Git revert and redeploy** is slower but more permanent. You create a Git revert commit that undoes the problematic changes, push it, and let the CI/CD pipeline build and deploy. This takes 2-10 minutes depending on build time. Use this when the instant revert or flag disable is not available, or after the immediate recovery to formally remove the broken code.

**Docker image rollback** applies to containerized deployments. If you tagged your Docker images with version numbers or commit hashes, you can redeploy the previous image version. Kubernetes does this with `kubectl rollout undo`. Docker Swarm does it with `docker service rollback`. This takes 30-60 seconds.

### 1.3 Blue-green deployments

A **blue-green deployment** maintains two identical production environments: Blue and Green. At any time, one is live (serving traffic) and one is idle. When you deploy a new version, you deploy it to the idle environment, run smoke tests against it, and then switch traffic from the live environment to the newly deployed one. The previously-live environment becomes idle — and remains ready for instant rollback.

```
Before deployment:
  [Blue - v1.2 - LIVE] ← traffic
  [Green - v1.1 - idle]

After deployment to Green:
  [Blue - v1.2 - LIVE] ← traffic (still)
  [Green - v1.3 - idle, tested]

After traffic switch:
  [Blue - v1.2 - idle] ← rollback target
  [Green - v1.3 - LIVE] ← traffic
```

If v1.3 has problems, you switch traffic back to Blue (v1.2). The switch is instant because Blue is still running with the old version.

### 1.4 Canary releases

A **canary release** sends a small percentage of traffic to the new version while the majority continues to hit the old version. You monitor error rates, response times, and business metrics for the canary group. If everything looks good, you gradually increase the canary percentage until 100% of traffic hits the new version.

```
Phase 1: 5% canary    → monitor for 10 minutes
Phase 2: 25% canary   → monitor for 30 minutes
Phase 3: 50% canary   → monitor for 1 hour
Phase 4: 100% canary  → new version is fully deployed
```

Canary releases are like feature flag percentage rollouts (Lesson 22.6) but at the infrastructure level. Feature flags control which features a user sees within the same deployment. Canary releases control which deployment a user hits. They complement each other: you can use canary releases for infrastructure confidence and feature flags for product confidence.

### 1.5 Incident response: the runbook

When an incident occurs, engineers are under stress. Stress impairs decision-making. A **runbook** is a pre-written checklist that tells the on-call engineer exactly what to do. It removes the need to think through steps under pressure.

A SvelteKit application runbook template:

```
## Incident Response Runbook

### 1. Confirm the incident
- Check health endpoint: GET /api/health
- Check error rate in monitoring dashboard
- Check uptime monitor alerts

### 2. Assess severity
- P1 (Critical): Site is down or data loss occurring
- P2 (High): Major feature broken for all users
- P3 (Medium): Feature broken for some users
- P4 (Low): Minor issue, workaround exists

### 3. Immediate mitigation
- If feature flag related: disable the flag
- If recent deploy: rollback to previous deployment
- If infrastructure: check platform status page

### 4. Communicate
- Post in #incidents channel
- Update status page
- Notify affected customers (P1/P2)

### 5. Root cause analysis
- Identify the change that caused the incident
- Determine why testing did not catch it
- Create action items to prevent recurrence

### 6. Post-mortem
- Write blameless post-mortem within 48 hours
- Share with the team
- Track action items to completion
```

### 1.6 "In Production" — the 3-minute rollback

An e-commerce site deployed a new product recommendation engine on Black Friday (another classic mistake). Within 2 minutes, monitoring showed that the `/api/recommendations` endpoint was returning 500 errors for 40% of requests. The on-call engineer's runbook directed them to: (1) check if the feature was behind a flag — it was, (2) disable the flag — done in 15 seconds via the flag dashboard, (3) verify error rates dropped — they did within 30 seconds. Total incident duration: 3 minutes. The root cause (a null pointer when a product had no reviews) was fixed the next week and re-rolled out with a proper null check. Without the flag and the runbook, the rollback would have required a Git revert and redeploy — at least 10 minutes during the highest-traffic day of the year.

### 1.7 The TypeScript angle

A deployment history model with rollback capabilities:

```typescript
type DeploymentStrategy = 'direct' | 'blue-green' | 'canary';
type IncidentSeverity = 'p1' | 'p2' | 'p3' | 'p4';

interface DeploymentRecord {
    id: string;
    version: string;
    commitHash: string;
    environment: string;
    strategy: DeploymentStrategy;
    timestamp: number;
    duration: number;
    status: 'success' | 'failed' | 'rolled-back';
    canaryPercentage?: number;
    rolledBackTo?: string;
}

interface Incident {
    id: string;
    severity: IncidentSeverity;
    title: string;
    detectedAt: number;
    resolvedAt?: number;
    deploymentId: string;
    mitigationAction: 'flag-disable' | 'rollback' | 'hotfix';
    postMortemUrl?: string;
}
```

### 1.8 Common interview question

**Q: "A deployment just broke production. Walk me through your first five minutes."**

**Model answer:** First, I confirm the incident by checking the health endpoint and monitoring dashboard — I need to know the scope and severity before acting. Second, I check if the broken behavior is behind a feature flag. If so, I disable the flag immediately (15 seconds to mitigation). If not, I check if the managed platform supports instant rollback (Vercel, Cloudflare — click "rollback to previous deployment," 30 seconds to mitigation). If I am on Docker/Kubernetes, I run `kubectl rollout undo` or deploy the previous Docker image tag (60 seconds). Third, I verify the mitigation worked by checking error rates and the health endpoint. Fourth, I communicate in the incidents channel and update the status page. Fifth, I start investigating root cause while the immediate fire is out. The key principle: restore service first, investigate second.

## Deep Dive

**Immutable deployments.** The reason instant rollback works on managed platforms is that deployments are immutable. When you deploy v1.3, v1.2 is not deleted — it remains available as a complete, functional deployment. Rolling back means changing a pointer (which deployment is "production"), not rebuilding anything. This immutability is also why you can audit exactly what was running at any point in time.

**Database rollbacks are harder.** Application rollbacks are straightforward because they are stateless — you swap code. Database migrations are stateful — they modify data. If v1.3 includes a migration that drops a column, rolling back to v1.2 does not recreate the column. For this reason, production database migrations should always be backward-compatible: add columns before removing old ones, use default values, never drop columns in the same release that stops using them.

**Blameless post-mortems.** An effective post-mortem asks "what in our process allowed this to happen?" not "who caused this?" If a developer deploys broken code, the process failure is in testing, code review, or deployment safeguards — not in the developer. Blameless post-mortems encourage honest reporting and systemic improvements.

**Mean Time to Recovery (MTTR).** MTTR is the average time from incident detection to resolution. It is more important than Mean Time Between Failures (MTBF) because failures are inevitable. A team with frequent, quickly-resolved incidents (MTTR < 5 minutes) is healthier than a team with rare, hours-long incidents. Feature flags, instant rollback, and runbooks all reduce MTTR.

**Connection to other lessons.** Lesson 22.6 provided the feature flag infrastructure for instant mitigation. Lesson 22.7 provided the monitoring that detects incidents. Lesson 22.5 covered the deployment pipeline that creates immutable, rollback-ready deployments. All three feed into this lesson's incident response framework.

## Going Deeper

**Official docs to read next:**

- [vercel.com/docs/deployments/instant-rollback](https://vercel.com/docs/deployments/) — Vercel instant rollback.
- [kubernetes.io/docs/concepts/workloads/controllers/deployment/#rolling-back-a-deployment](https://kubernetes.io/docs/concepts/workloads/controllers/deployment/) — Kubernetes rollback documentation.
- [sre.google/sre-book/postmortem-culture](https://sre.google/sre-book/postmortem-culture/) — Google's guide to blameless post-mortems.

**Advanced pattern: automated rollback.** Combine monitoring metrics with deployment automation to create automated rollback. If the error rate exceeds 3x baseline within 5 minutes of a deployment, the CI/CD system automatically rolls back to the previous version and alerts the team. This reduces MTTR to near zero for straightforward failures.

**Challenge question (combines Lesson 22.8 + Lesson 22.7 + Lesson 22.4):** Your Dockerized SvelteKit application deploys a database migration that adds a new `preferences` column (nullable) and a code change that reads from it. After deployment, you discover a bug where the code crashes when `preferences` is null for existing users. Explain: (a) why rolling back the code without rolling back the migration is safe, (b) why rolling back the migration without rolling back the code would be dangerous, and (c) how you would fix this without downtime.

## 2. Style it — PE7 applied to the deployment history timeline

The mini-build is a vertical timeline of deployments. Each timeline entry is a card with `var(--color-surface-2)` background and `var(--radius-md)` corners connected by a vertical line in `var(--color-border)`. Successful deployments have a `var(--color-success)` left accent, failed ones use `var(--color-error)`, and rolled-back ones use `var(--color-warning)`. Rollback buttons use a secondary style: `var(--color-surface)` background with `var(--color-brand)` border. The timeline connector line uses `var(--color-border)` and sits behind the cards with `position: absolute`.

## 3. Interact — rolling back deployments in a simulated timeline

The problem: rollback is something you practice in production, which is the worst time to learn it. The interactive element lets you trigger deployments, simulate failures, and practice rolling back. A deployment timeline grows with each action, and rollback buttons on previous deployments demonstrate instant revert. A `$state` array tracks the deployment history, and `$derived` computes the current live version.

```typescript
interface TimelineEntry {
    id: string;
    version: string;
    timestamp: number;
    strategy: DeploymentStrategy;
    status: 'success' | 'failed' | 'rolled-back';
    isLive: boolean;
}
```

## 4. Mini-build — deployment history timeline with rollback buttons

**File:** `src/routes/modules/22-devops/08-rollback-incident/+page.svelte`

This page renders an interactive deployment history timeline. The student can deploy new versions, simulate failures, and roll back to previous versions. The timeline visually shows the progression of deployments and the current live version.

### Run it

```bash
pnpm dev
```

Then open `http://localhost:5173/modules/22-devops/08-rollback-incident`.

### Prove the concept

1. Click "Deploy New Version" several times to build a timeline with multiple deployments.
2. Click "Simulate Failure" on the latest deployment — it changes to red (failed) status.
3. Click "Rollback" on a previous deployment — it becomes the new live version, and the failed one is marked "rolled-back."
4. In Svelte DevTools, watch the `$state` array of timeline entries and the `$derived` current live version update.

## 5. Check your understanding

<details>
<summary><strong>Q1.</strong> What is the difference between a blue-green deployment and a canary release?</summary>

A blue-green deployment maintains two complete environments and switches all traffic at once from one to the other. A canary release gradually shifts traffic from the old version to the new version (5% → 25% → 50% → 100%). Blue-green is simpler and provides instant rollback, but all users see the new version simultaneously. Canary is more cautious, exposing only a fraction of users to the new version while monitoring for issues.
</details>

<details>
<summary><strong>Q2.</strong> Why is disabling a feature flag the fastest rollback mechanism?</summary>

Disabling a feature flag requires no deployment, no build, and no infrastructure changes. It is a runtime configuration change (a cookie update, database toggle, or API call) that takes effect immediately. The broken code remains deployed but is hidden behind the disabled flag. All other rollback mechanisms require some deployment step, even if it is just switching a traffic pointer.
</details>

<details>
<summary><strong>Q3.</strong> Why should database migrations be backward-compatible?</summary>

Because application rollbacks are faster and more common than database rollbacks. If you deploy code v1.3 with a migration that drops a column, then need to roll back to v1.2, the column is gone and v1.2 crashes trying to read it. Backward-compatible migrations (add columns before removing, use defaults, deprecate before dropping) ensure the old code still works against the new schema.
</details>

<details>
<summary><strong>Q4.</strong> What is MTTR, and why is it more important than preventing all failures?</summary>

MTTR (Mean Time to Recovery) is the average time from incident detection to resolution. It is more important than eliminating all failures because failures are inevitable in complex systems. A team that recovers in 2 minutes from frequent minor incidents has better availability than a team that has rare catastrophic 4-hour outages. Reducing MTTR is achieved through monitoring, feature flags, instant rollback, and practiced runbooks.
</details>

<details>
<summary><strong>Q5.</strong> What is a blameless post-mortem, and why does it produce better outcomes?</summary>

A blameless post-mortem analyzes what process failures allowed the incident to happen without blaming individuals. It asks "why did our testing not catch this?" instead of "who deployed the broken code?" Blameless post-mortems produce better outcomes because engineers are willing to report honestly when they are not at risk of punishment. Honest reporting leads to systemic improvements (better tests, safer deployment pipelines, more monitoring) rather than blame-driven changes (restricting who can deploy).
</details>

## 6. Common mistakes

- **Not having a runbook before the first incident.** Writing a runbook during an incident is worse than having none — you spend critical recovery time on documentation instead of mitigation. Write the runbook during a calm period and practice it with simulated incidents.
- **Rolling back both the code and the database migration simultaneously.** If the migration added a column and the code reads it, rolling back the migration (dropping the column) while the new code is still serving some requests will cause errors. Always roll back the code first, verify stability, then decide whether to revert the migration.
- **Not verifying the rollback worked.** After clicking "rollback," check the health endpoint, error rates, and a few key user flows. Rollbacks can fail too — the previous deployment might have its own issues that were not noticed because it was only live briefly.
- **Deploying on Fridays, before holidays, or during peak traffic.** If a deployment goes wrong, you want your full team available to respond. Deploy during low-traffic hours when the team is at full strength.

## 7. What's next

This completes Module 22 — DevOps & Edge Deployment. The module project combines everything: Docker configuration, Cloudflare Workers adapter, feature flags, health endpoint, structured logging, and a deployment dashboard. Continue to the module project or proceed to Module 23 — Design System Engineering.
