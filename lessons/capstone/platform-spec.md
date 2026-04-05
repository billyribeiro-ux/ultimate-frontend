# Capstone Platform — Design Specification

> **Status:** design document, not an implementation. This file describes how
> the Ultimate Frontend capstone delivery platform should behave. The actual
> UI, editor integration, and persistence layer are a separate build.

## Goals

1. A student opens the capstone and sees a dual-pane workspace — **code editor on the left, live preview on the right** — with a **chunk map** fixed along the bottom showing their progress.
2. The student writes every line of code themselves. The only thing the platform exposes by default is a blank SvelteKit project with the PE7 token system already populated in `src/app.css`.
3. When a student is stuck on a specific chunk, they can request a **progressive reveal** in three levels. The reveal system is designed to be a safety net that prevents indefinite blockage without rewarding shortcuts.
4. The platform tracks a score across all 20 chunks and reports a summary at the end: *"You solved 16/20 chunks independently — Distinguished Engineer candidate."*

## Workspace layout

```
┌────────────────────────────────┬─────────────────────┐
│   Code editor (left)           │   Live preview      │
│                                │   (iframe)          │
├────────────────────────────────┴─────────────────────┤
│              Chunk map (bottom bar)                  │
│ ✓ component-architecture  ✓ global-tokens            │
│ ✓ mobile-first-layout     ◐ page-routing             │
│ ◑ remote-query-setup      ○ gsap-timeline            │
│ □ tanstack-table          □ seo-component            │
└─────────────────────────────────────────────────────┘
                [ I'm stuck on this chunk → ]
```

- **Top-left (editor):** Monaco. Chosen for parity with VS Code, first-class TypeScript language server, Svelte language server integration via monaco-svelte, and robust multi-file support. CodeMirror 6 is a viable alternative but its TypeScript story is weaker.
- **Top-right (preview):** an iframe pointed at a Vite dev server running the student's in-progress project. Hot reload on every save. Cross-origin isolation via the `sandbox` attribute so the student's code cannot escape the preview frame.
- **Bottom (chunk map):** horizontally scrollable list of the 20 chunks from `chunks/registry.ts`, each rendered as a status pill.

## Chunk status states

| Symbol | Meaning                                          | Score        |
| ------ | ------------------------------------------------ | ------------ |
| □      | Not started                                      | —            |
| ◐      | In progress, time gate active                    | —            |
| ✓      | Solved independently                             | full (100)   |
| ◐ ✓    | Solved after a Level 1 hint                      | full (100)   |
| ◑ ✓    | Solved after a Level 2 concept reveal            | partial (70) |
| ○ ✓    | Solved after a Level 3 code reveal               | reduced (40) |

Scoring values live in `registry.ts` as `ChunkScoring`. Changing them is a single-file edit.

## Reveal state machine

```
 idle ──► hint ──► concept ──► code
    └────────┴─────────┘
              ▲
              └── 15-minute time gate must elapse before concept/code unlock
```

Transitions:

1. **idle → hint** — Free. No time gate. Student clicks "I'm stuck".
2. **hint → concept** — Requires ≥ 15 minutes of active work on this chunk AND a hint was viewed (or explicitly skipped).
3. **concept → code** — Requires the concept reveal to have been viewed. No additional time gate.
4. **Any state → solved** — The student can mark any chunk solved at any time; the score reflects the deepest reveal they used.

"Active work" = editor focus time in files tagged as belonging to this chunk + preview interaction time. Idle/background tabs do not count toward the gate.

## Data model (TypeScript)

```ts
import type { CapstoneChunk, ChunkScoring } from './chunks/registry';

export type RevealLevel = 'none' | 'hint' | 'concept' | 'code';

export interface ChunkProgress {
	chunkId: string;
	status: 'not_started' | 'in_progress' | 'solved' | 'skipped';
	activeSecondsWorked: number;
	revealLevel: RevealLevel;
	lastActiveAt: string; // ISO timestamp
	solvedAt: string | null;
}

export interface CapstoneSession {
	studentId: string;
	startedAt: string;
	chunks: Record<string, ChunkProgress>; // keyed by chunk.id
	totalScore: number; // computed
}

export function scoreForChunk(chunk: CapstoneChunk, progress: ChunkProgress): number {
	if (progress.status !== 'solved') return 0;
	const { scoring } = chunk;
	switch (progress.revealLevel) {
		case 'none':
		case 'hint':
			return scoring.independent;
		case 'concept':
			return scoring.concept;
		case 'code':
			return scoring.code;
	}
}
```

## Persistence

- **Phase 1 (offline-first):** localStorage. Serialize `CapstoneSession` under a single key. Works immediately, zero backend.
- **Phase 2 (accounts):** POST session to a SvelteKit `+server.ts` endpoint that writes to a database. Use `query.set()` from Module 9B to drive real-time progress updates for multi-device sync.
- **Phase 3 (leaderboard):** server-side aggregate of all solved sessions, opt-in public display.

## Starter-code convention

Each capstone chunk may optionally provide starter files. The platform looks for `lessons/capstone/chunks/<id>/starter/` and copies any files it finds into the student's working project the first time they activate that chunk. If no `starter/` folder exists, the student writes everything from scratch.

## Reveal UI copy

When the student clicks "I'm stuck on this chunk":

1. **Level 1 (hint) modal.** "Here's a nudge. This won't affect your score." → content of `hint.md`.
2. **Level 2 (concept) modal.** Only shown after 15 minutes of active work OR after the student explicitly acknowledges the time gate has been waived. "This will reduce your score for this chunk to 70. Concept only — no code." → content of `concept.md`.
3. **Level 3 (code) modal.** "This shows the exact code. Your score for this chunk becomes 40, but you still receive credit." → content of `code.md`.

Each modal has a confirmation step. A single mis-click should never lock a student out of the independent solve.

## Final report

When all 20 chunks reach a terminal status (solved or skipped), show:

```
Capstone complete.

You solved 16 of 20 chunks independently.
You used 3 concept reveals and 1 code reveal.
Total score: 1,710 / 2,000.

Distinguished Engineer candidate.
```

The scoring tier names (Junior → Mid → Senior → Staff → Distinguished Engineer) are configurable and live in a separate `tiers.ts` file that the platform imports.

## Out of scope for this spec

- Authentication (handled in a separate product doc).
- Payment / enrollment.
- Video lecture integration.
- Multiplayer / pair-programming features.
