---
module: 22
lesson: 22.4
title: Docker for SvelteKit
duration: 55 minutes
prerequisites:
  - "22.1 — Adapter deep dive"
  - "21.1 — What Vite actually does"
  - "Basic terminal / command-line usage"
learning_objectives:
  - Explain why multi-stage Docker builds reduce image size and attack surface
  - Write a production-ready Dockerfile for a SvelteKit application using adapter-node
  - Configure .dockerignore to prevent sensitive files and unnecessary content from entering the image
  - Add health checks and graceful shutdown handling to a containerized SvelteKit app
  - Describe the relationship between adapter-node output and Docker ENTRYPOINT
status: ready
---

# Lesson 22.4 — Docker for SvelteKit

> **Atomic lesson format** — every lesson in this course follows the same four parts: **Concept**, **Style it**, **Interact**, **Mini-build**.

## 1. Concept — Packaging your app so it runs anywhere

### 1.1 The problem: "it works on my machine"

A developer builds a SvelteKit application on a MacBook with Node.js 22, pnpm 10, and a specific set of system libraries. Everything works. They push to production, which runs a different Linux distribution, a different Node.js version, and has different system packages installed. The build fails, or worse, it succeeds but behaves differently at runtime.

This "it works on my machine" problem has plagued software deployment for decades. Docker solves it by packaging your application and its entire runtime environment into a single, portable **container image** that runs identically on any machine with Docker installed.

### 1.2 What Docker actually is

A Docker **image** is a read-only template that contains everything your application needs to run: the operating system, runtime (Node.js), dependencies (node_modules), and your built application code. An image is built from a **Dockerfile** — a text file with instructions that describe, step by step, how to construct the image.

A **container** is a running instance of an image. When you `docker run` an image, Docker creates an isolated process with its own file system, network, and process tree. The container sees the file system defined by the image, not the host's file system. This isolation is what makes containers portable: the container behaves identically regardless of where it runs.

### 1.3 Multi-stage builds: why they matter

A naive Dockerfile for a SvelteKit app might look like this:

```dockerfile
FROM node:22-alpine
WORKDIR /app
COPY . .
RUN npm install -g pnpm && pnpm install && pnpm build
CMD ["node", "build/index.js"]
```

This works but produces a massive image (500MB+) because it includes everything: TypeScript source, devDependencies, Vite, the Svelte compiler, test files, documentation. In production, you only need the built output and production dependencies.

A **multi-stage build** solves this by using multiple `FROM` statements. Each stage starts fresh. You build in one stage and copy only the output to a final, minimal stage:

```dockerfile
# Stage 1: Build
FROM node:22-alpine AS builder
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN corepack enable && pnpm install --frozen-lockfile
COPY . .
RUN pnpm build

# Stage 2: Production
FROM node:22-alpine
WORKDIR /app
COPY --from=builder /app/build ./build
COPY --from=builder /app/package.json ./
COPY --from=builder /app/node_modules ./node_modules
ENV NODE_ENV=production
ENV PORT=3000
EXPOSE 3000
CMD ["node", "build/index.js"]
```

The builder stage installs everything and runs the build. The production stage copies only the build output and production dependencies. The final image is 80-150MB instead of 500MB+. Smaller images mean faster deploys, lower storage costs, and a smaller attack surface (fewer packages that could have vulnerabilities).

### 1.4 The .dockerignore file

Like `.gitignore`, `.dockerignore` prevents files from being copied into the Docker build context. Without it, `COPY . .` sends everything to the Docker daemon — including `node_modules`, `.git`, `.env` files with secrets, and test data.

```
node_modules
.git
.gitignore
.env
.env.*
*.md
tests
.svelte-kit
build
.DS_Store
```

The `.dockerignore` is critical for two reasons: (1) it prevents secrets from leaking into the image, and (2) it speeds up the build by reducing the amount of data sent to the Docker daemon.

### 1.5 Health checks

Docker supports a `HEALTHCHECK` instruction that periodically verifies your application is running and responsive. If the health check fails, Docker marks the container as unhealthy, and orchestrators like Kubernetes or Docker Swarm can restart it automatically.

```dockerfile
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api/health || exit 1
```

This checks `http://localhost:3000/api/health` every 30 seconds. If it fails 3 times in a row, the container is marked unhealthy. The `--start-period` gives the application 10 seconds to start up before health checks begin.

You pair this with a SvelteKit health endpoint:

```typescript
// src/routes/api/health/+server.ts
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async () => {
    return new Response(JSON.stringify({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    }), {
        headers: { 'Content-Type': 'application/json' }
    });
};
```

### 1.6 Graceful shutdown

When Docker stops a container, it sends a `SIGTERM` signal and waits 10 seconds before forcefully killing the process with `SIGKILL`. Your application should listen for `SIGTERM` and stop accepting new requests, finish processing in-flight requests, close database connections, and then exit cleanly.

Adapter-node's built-in server handles `SIGTERM` automatically since SvelteKit 2.50+. When it receives `SIGTERM`, it stops accepting new connections and waits for existing requests to complete (up to a configurable timeout) before exiting. You can configure the shutdown timeout in the adapter options:

```typescript
adapter({
    out: 'build',
    precompress: true,
    envPrefix: 'APP_'
})
```

The `HOST`, `PORT`, and `ORIGIN` environment variables control the server's listening address. In Docker, set `HOST=0.0.0.0` so the server accepts connections from outside the container.

### 1.7 "In Production" — Docker at a SaaS company

A B2B SaaS company deployed their SvelteKit dashboard via Docker on AWS ECS (Elastic Container Service). Their initial image was 1.2GB — they had copied the entire project including devDependencies, test fixtures, and a local SQLite database. Multi-stage builds reduced the image to 140MB. They added a health check endpoint that verified both the HTTP server and the database connection. When their PostgreSQL instance went down during maintenance, the health checks detected the failure within 30 seconds, and ECS automatically routed traffic to healthy containers in another availability zone. Without health checks, they would have served 500 errors until someone noticed.

### 1.8 The TypeScript angle

When using adapter-node, the build output in `build/index.js` is pure JavaScript — TypeScript has already been compiled away. However, your health endpoint source code should be fully typed:

```typescript
interface HealthResponse {
    status: 'healthy' | 'degraded' | 'unhealthy';
    timestamp: string;
    uptime: number;
    version: string;
    checks: HealthCheck[];
}

interface HealthCheck {
    name: string;
    status: 'pass' | 'fail';
    duration: number;
}
```

The `HealthResponse` type ensures consistency between what your health endpoint returns and what your monitoring system expects. In Lesson 22.7, we build on this pattern for full observability.

### 1.9 Common interview question

**Q: "Explain why a multi-stage Docker build is preferred over a single-stage build for a Node.js application."**

**Model answer:** A single-stage build includes everything in the final image: source code, devDependencies, build tools, and test files. This makes the image large (often 500MB-1GB), slow to deploy, and exposes unnecessary packages that could have security vulnerabilities. A multi-stage build uses one stage to install dependencies and compile the application, then copies only the build output and production dependencies to a clean, minimal final stage. The result is a smaller image (100-200MB), faster deployments, and a reduced attack surface. The build tools and source code exist only during the build — they are not shipped to production.

## Deep Dive

**Layer caching in Docker.** Each instruction in a Dockerfile creates a layer. Docker caches layers and reuses them when nothing has changed. The order of instructions matters: put instructions that change infrequently (like `COPY package.json`) before instructions that change often (like `COPY . .`). This way, `pnpm install` is cached as long as `package.json` has not changed, even if your source code has. In a CI pipeline, this can save minutes per build.

**Non-root users.** By default, Docker runs processes as root inside the container. This is a security risk — if an attacker exploits your application, they have root access. Best practice is to create a non-root user and switch to it: `RUN addgroup -S app && adduser -S app -G app` followed by `USER app`. Adapter-node does not require root privileges, so this is straightforward.

**Resource limits.** In production, set memory and CPU limits on your containers: `docker run --memory=512m --cpus=1.0`. This prevents a memory leak or CPU-intensive operation from affecting other containers on the same host. SvelteKit's SSR is lightweight, so 256-512MB is typically sufficient for the Node.js process.

**Container orchestration.** In production, you rarely run Docker containers manually. You use an orchestrator — Kubernetes, Docker Swarm, AWS ECS, or Google Cloud Run. The orchestrator manages scaling (running multiple container instances), load balancing, health check responses, rolling updates, and automatic restarts. Your Dockerfile and health endpoint are the interface between your application and the orchestrator.

**Connection to other lessons.** Lesson 22.1 explained adapter-node's output format. Lesson 22.5 covers how Docker images integrate with CI/CD pipelines for preview deployments. Lesson 22.7 adds monitoring and observability to the containerized application. Lesson 22.8 covers rollback strategies for Docker deployments.

## Going Deeper

**Official docs to read next:**

- [docs.docker.com/build/building/multi-stage](https://docs.docker.com/build/building/multi-stage/) — multi-stage build documentation.
- [svelte.dev/docs/kit/adapter-node](https://svelte.dev/docs/kit/adapter-node) — adapter-node configuration, environment variables, and graceful shutdown.
- [docs.docker.com/reference/dockerfile](https://docs.docker.com/reference/dockerfile/) — complete Dockerfile reference.

**Advanced pattern: distroless base images.** Instead of `node:22-alpine`, you can use Google's distroless images (`gcr.io/distroless/nodejs22-debian12`) which contain only the Node.js runtime — no shell, no package manager, no utilities. This further reduces the attack surface but makes debugging harder because you cannot shell into the container. Use distroless for production and Alpine for development/debugging.

**Challenge question (combines Lesson 22.4 + Lesson 22.1 + Lesson 22.7):** Your Dockerized SvelteKit application is deployed on Kubernetes with 3 replicas. During a deployment, Kubernetes sends `SIGTERM` to old pods and starts new ones. A user's request hits an old pod during shutdown. Describe what happens to that request and how you would configure the health check, readiness probe, and shutdown timeout to ensure zero-downtime deployments.

## 2. Style it — PE7 applied to the Docker config generator

The mini-build is a form-based generator that produces a Dockerfile. Form inputs use `var(--color-surface-2)` backgrounds with `var(--color-border)` borders and `var(--radius-md)` corners. Labels use `var(--text-sm)` with `var(--color-text-muted)`. The generated Dockerfile output renders in a code block with `var(--color-surface-2)` background and monospace font at `var(--text-sm)`. A "copy" button uses the brand style. The layout stacks vertically on mobile; at `min-width: 768px`, the form and output sit side by side with `var(--space-lg)` gap.

## 3. Interact — generating a Docker configuration dynamically

The problem: writing a Dockerfile from scratch requires memorizing syntax, best practices, and adapter-specific conventions. The interactive element lets you configure parameters (Node.js version, port, health check interval, non-root user toggle) and see the Dockerfile update in real time. A `$derived` computation generates the complete Dockerfile and `.dockerignore` content based on the form inputs.

```typescript
interface DockerConfig {
    nodeVersion: string;
    port: number;
    healthCheckInterval: number;
    enablePrecompress: boolean;
    useNonRootUser: boolean;
    envPrefix: string;
}
```

## 4. Mini-build — Docker config generator page

**File:** `src/routes/modules/22-devops/04-docker-sveltekit/+page.svelte`

This page renders an interactive Docker configuration generator. The student adjusts parameters and sees a complete, production-ready Dockerfile and `.dockerignore` generated in real time. The generated configuration uses multi-stage builds, health checks, and graceful shutdown.

### Run it

```bash
pnpm dev
```

Then open `http://localhost:5173/modules/22-devops/04-docker-sveltekit`.

### Prove the concept

1. Adjust the Node.js version dropdown and watch the `FROM` line update in the Dockerfile preview.
2. Toggle the "non-root user" checkbox and see the `RUN addgroup` and `USER` instructions appear.
3. Change the health check interval and see the `HEALTHCHECK` instruction update.
4. Copy the generated Dockerfile — it is valid Docker syntax that would build successfully.

## 5. Check your understanding

<details>
<summary><strong>Q1.</strong> What is the purpose of a multi-stage Docker build?</summary>

A multi-stage build separates the build process from the production image. The first stage installs all dependencies (including devDependencies) and compiles the application. The final stage copies only the build output and production dependencies into a clean base image. This produces a smaller, more secure image by excluding source code, build tools, and development packages.
</details>

<details>
<summary><strong>Q2.</strong> Why is .dockerignore important for security?</summary>

Without `.dockerignore`, `COPY . .` includes everything in the build context — including `.env` files with secrets, `.git` history, and sensitive configuration. These files get baked into the image layers and can be extracted by anyone with access to the image. `.dockerignore` prevents sensitive files from entering the build context entirely.
</details>

<details>
<summary><strong>Q3.</strong> What happens when a Docker health check fails?</summary>

Docker marks the container as "unhealthy." On its own, Docker does not restart unhealthy containers. However, orchestrators like Kubernetes, Docker Swarm, or AWS ECS watch for unhealthy status and can automatically restart the container, remove it from the load balancer, or replace it with a new instance.
</details>

<details>
<summary><strong>Q4.</strong> Why should you set HOST=0.0.0.0 in a Docker container?</summary>

By default, Node.js servers bind to `localhost` (127.0.0.1), which only accepts connections from within the same machine. Inside a Docker container, connections from outside the container come from a different network interface. Setting `HOST=0.0.0.0` makes the server listen on all network interfaces, allowing Docker's port mapping to forward external traffic to the container.
</details>

<details>
<summary><strong>Q5.</strong> Why should you put `COPY package.json pnpm-lock.yaml ./` before `COPY . .` in a Dockerfile?</summary>

Docker caches each layer and reuses it if the input has not changed. By copying `package.json` and the lockfile first and running `pnpm install`, Docker caches the dependency installation layer. On subsequent builds, if only your source code changed but dependencies did not, Docker reuses the cached `pnpm install` layer and only re-runs `COPY . .` and `pnpm build`. This saves significant build time because `pnpm install` is typically the slowest step.
</details>

## 6. Common mistakes

- **Running the container as root.** The default Docker user is root. If an attacker exploits your application, they have root access inside the container. Always add a non-root user with `adduser` and switch to it with `USER`.
- **Not setting `HOST=0.0.0.0` and wondering why the app is unreachable.** The default `localhost` binding only accepts connections from within the container. External traffic via `docker run -p 3000:3000` cannot reach a server bound to localhost.
- **Copying `node_modules` from the host into the Docker build.** Host `node_modules` may contain platform-specific binaries (compiled for macOS) that do not work in the Linux-based container. Always install dependencies inside the Docker build with `pnpm install`.
- **Not using `--frozen-lockfile` in CI/Docker builds.** Without it, `pnpm install` might update the lockfile if versions have drifted, producing inconsistent builds. `--frozen-lockfile` fails the build if the lockfile does not match `package.json`, ensuring reproducibility.

## 7. What's next

Lesson 22.5 explores preview deployments and branch deploys — how to get a unique URL for every pull request so reviewers can test changes before they reach production.
