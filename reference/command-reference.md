# Command Reference

## Project Scaffolding

| Command | Purpose |
|---------|---------|
| `pnpm create svelte@latest my-app` | Create new SvelteKit project (interactive) |
| `pnpm create svelte@latest my-app -- --template minimal` | Minimal template (no demo content) |
| `pnpm create svelte@latest my-app -- --template skeleton` | Skeleton with TypeScript |

## Development Commands

| Command | Purpose |
|---------|---------|
| `pnpm dev` | Start dev server (default: localhost:5173) |
| `pnpm dev --open` | Start dev server and open browser |
| `pnpm dev --host` | Expose to network (mobile testing) |
| `pnpm dev --port 3000` | Custom port |
| `pnpm build` | Production build |
| `pnpm preview` | Preview production build locally |
| `pnpm check` | Run svelte-check (type checking) |
| `pnpm check:watch` | svelte-check in watch mode |

## Package Management (pnpm)

| Command | Purpose |
|---------|---------|
| `pnpm add <pkg>` | Add production dependency |
| `pnpm add -D <pkg>` | Add dev dependency |
| `pnpm remove <pkg>` | Remove dependency |
| `pnpm update --latest` | Update all deps to latest |
| `pnpm update <pkg> --latest` | Update specific dep to latest |
| `pnpm install --frozen-lockfile` | Install exactly from lockfile (CI) |
| `pnpm ls` | List installed packages |
| `pnpm why <pkg>` | Show why a package is installed |
| `pnpm store prune` | Clean unused packages from store |

## SvelteKit Sync

| Command | Purpose |
|---------|---------|
| `npx svelte-kit sync` | Regenerate types ($types, app.d.ts) |

Run after: adding routes, changing params, modifying `app.d.ts`.

## Database (Drizzle ORM)

| Command | Purpose |
|---------|---------|
| `pnpm drizzle-kit generate` | Generate SQL migration from schema changes |
| `pnpm drizzle-kit migrate` | Apply pending migrations to database |
| `pnpm drizzle-kit studio` | Open Drizzle Studio (GUI for DB) |
| `pnpm drizzle-kit push` | Push schema directly (dev only, no migration file) |
| `pnpm drizzle-kit drop` | Drop a migration file |
| `pnpm drizzle-kit check` | Check migration consistency |

## Testing — Vitest (Unit/Integration)

| Command | Purpose |
|---------|---------|
| `pnpm vitest` | Run tests in watch mode |
| `pnpm vitest run` | Run tests once (CI) |
| `pnpm vitest --ui` | Open browser UI |
| `pnpm vitest run --coverage` | Run with coverage report |
| `pnpm vitest run src/lib/utils` | Run tests in specific directory |
| `pnpm vitest run -t "test name"` | Run test by name pattern |
| `pnpm vitest --reporter=verbose` | Detailed output |

## Testing — Playwright (E2E)

| Command | Purpose |
|---------|---------|
| `pnpm playwright test` | Run all E2E tests |
| `pnpm playwright test --ui` | Open interactive test UI |
| `pnpm playwright codegen` | Record tests by clicking in browser |
| `pnpm playwright test --project=chromium` | Run in specific browser |
| `pnpm playwright test tests/auth.spec.ts` | Run specific test file |
| `pnpm playwright show-report` | Open HTML test report |
| `pnpm playwright install` | Install browser binaries |
| `pnpm playwright test --debug` | Debug mode (step through) |

## Linting & Formatting

| Command | Purpose |
|---------|---------|
| `pnpm lint` | Run ESLint |
| `pnpm lint --fix` | Auto-fix lint errors |
| `pnpm format` | Run Prettier |
| `pnpm format --check` | Check formatting (CI) |

## Git Workflow

| Command | Purpose |
|---------|---------|
| `git checkout -b feature/name` | Create feature branch |
| `git add -p` | Stage changes interactively (patch mode) |
| `git commit -m "type: description"` | Conventional commit |
| `git push -u origin feature/name` | Push + set upstream |
| `git pull --rebase` | Pull with rebase (linear history) |
| `git stash` / `git stash pop` | Temporarily shelve changes |
| `git log --oneline -20` | Recent commit history |
| `git diff --stat main` | Summary of changes vs main |
| `git rebase main` | Rebase branch onto latest main |

### Commit Message Convention

```
type(scope): description

feat:     New feature
fix:      Bug fix
docs:     Documentation
style:    Formatting (no logic change)
refactor: Code restructuring
test:     Adding/fixing tests
chore:    Build, deps, tooling
perf:     Performance improvement
```

## Deployment

| Command | Purpose |
|---------|---------|
| `npx vercel` | Deploy to Vercel (interactive) |
| `npx vercel --prod` | Deploy to production |
| `npx wrangler pages deploy build` | Deploy to Cloudflare Pages |
| `npx netlify deploy --prod` | Deploy to Netlify |
| `docker build -t app .` | Build Docker image (adapter-node) |
| `docker run -p 3000:3000 app` | Run containerized app |

## Useful npx One-offs

| Command | Purpose |
|---------|---------|
| `npx sv add` | Add Svelte integration (Tailwind, Drizzle, etc.) |
| `npx lighthouse http://localhost:4173` | Run Lighthouse audit |
| `npx vite-bundle-visualizer` | Analyze bundle composition |
| `npx tsc --noEmit` | Type-check without emitting |
| `npx update-browserslist-db@latest` | Update browserslist data |

## Environment Info

| Command | Purpose |
|---------|---------|
| `node --version` | Node.js version |
| `pnpm --version` | pnpm version |
| `npx svelte-kit version` | SvelteKit version |
| `cat package.json \| jq .devDependencies` | See dev deps |

## Common Mistakes

- **Running `npm` instead of `pnpm`** — creates `package-lock.json` conflicts; always use pnpm.
- **Forgetting `svelte-kit sync` after route changes** — types become stale; run it or restart dev server.
- **Using `pnpm install` in CI without `--frozen-lockfile`** — may resolve different versions.
- **Running `playwright test` without building first** — E2E tests need a built app or running dev server.
- **`drizzle-kit push` in production** — destructive; use `generate` + `migrate` for production databases.
- **Missing `--` before flags in create** — `pnpm create svelte@latest app --template` passes flag to pnpm, not create-svelte.
- **Running `vitest` without stopping dev server** — port conflicts; vitest has its own server.
- **Forgetting `pnpm playwright install`** — browsers not downloaded; tests fail with "executable not found".
