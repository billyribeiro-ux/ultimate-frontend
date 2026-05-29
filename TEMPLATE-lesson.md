---
module: <number>
lesson: <number.number>
title: <lesson title>
duration: <approximate minutes>
prerequisites:
  - <explicit list of prior lessons or concepts>
learning_objectives:
  - <3 to 5 verbs a student can do after this lesson>
status: stub | ready
---

# Lesson <N.N> — <title>

> **Atomic lesson format** — every lesson in this course follows the same four parts: **Concept**, **Style it**, **Interact**, **Mini-build**. This template is the single source of truth for that format. If a lesson file deviates from this structure, it is a bug.

## 1. Concept — <short subtitle explaining what you're about to learn and why>

Write **800 to 1200 words** at university level, in plain English, for a reader who may not be a native English speaker and who has never written JavaScript before.

Rules for this section:

- **Start from the problem, not the feature.** Never begin with "Svelte has a feature called X". Always begin with the real-world problem that X solves.
- **Use analogies sparingly and only when they clarify, not confuse.** One good analogy per section is plenty.
- **Name every concept you introduce.** If you use a term like *proxy*, *hydration*, or *side effect*, define it the first time it appears in that lesson.
- **Be explicit about what is current and what is outdated.** Students search the internet and find old tutorials. Tell them what Svelte 3/4 looked like, tell them what the May 2026 version looks like, and tell them which one to trust.
- **Never say "don't worry about it for now".** If a concept isn't ready to be taught, don't mention it. If you mention it, teach it.

### Subsections recommended

1.1 What the problem is
1.2 How the feature solves it
1.3 How it connects to what you already know
1.4 What's different in the May 2026 version (if applicable)

## 2. Style it — PE7 applied to this lesson's mini-build

Show how the PE7 token system, OKLCH colors, `@layer` cascade, fluid clamps, and mobile-first approach apply to the mini-build. This section is short (≤ 300 words) and practical.

Rules:

- **Never introduce styling in isolation.** Always style the actual thing the lesson is building.
- **Reference tokens by name**, never raw values. `var(--color-brand)` not `oklch(65% 0.22 270)`.
- **Mobile baseline first, then enhance up.** `@media (min-width: 480px)` only.
- **Respect `prefers-reduced-motion`** in any animation you introduce.

## 3. Interact — the JS/TS concept introduced through a real problem

This is where the lesson's JavaScript or TypeScript concept lives. Introduce it by showing the problem it solves in the mini-build, not by listing its syntax on a slide.

Rules:

- **One new concept per lesson.** If a lesson introduces two concepts, split it into two lessons.
- **Show the mistake first.** Write code that fails or produces the wrong result, then fix it with the new concept. This proves the concept is necessary.
- **Type everything.** Every variable has a type annotation, even when TypeScript would infer it, until Lesson 1.4 teaches inference. After Lesson 1.4 you may use inference freely but must still type function parameters, return types, and component props.

Exception: **Lesson 1.1** deliberately has no Interact section because we want the student to see the simplest possible Svelte file first. Every other lesson must have one.

## 4. Mini-build — tangible working output

A complete, runnable file that the student sees on screen. Rules:

- **It must actually run.** The student types `pnpm dev`, navigates to the route, and sees the result. No pseudocode, no "fill in the rest yourself".
- **Show the file path** (e.g., `src/routes/modules/01-foundation/01-what-is-svelte/+page.svelte`).
- **Explain the DevTools moment.** What should the student look at in DevTools to *prove* the concept works? (Hash suffixes on scoped classes, compiled output, network waterfall, reactive state in the Svelte DevTools extension, etc.)
- **Compound into the module project.** Every mini-build is eventually reused in the module project. If a mini-build is a throwaway, the lesson should be redesigned.

## 5. Check your understanding — 5 questions

Use collapsible details blocks so students must attempt the answer first:

```markdown
<details>
<summary><strong>Q1.</strong> Your question here</summary>

Your answer here.
</details>
```

Questions should test **understanding**, not memorization. Prefer *"explain in your own words"* and *"what would happen if …"* over *"what is the exact syntax of …"*.

## 6. Common mistakes — 3 to 4 pitfalls

Specific traps a beginner will actually hit. Use real errors they will see in the console, not hypothetical ones.

## 7. What's next — one sentence

A single sentence that previews the next lesson. No more.

---

## Quality checklist before marking a lesson `status: ready`

- [ ] Concept section is 800–1200 words, plain English, starts from a problem
- [ ] May 2026 syntax is used throughout (runes, `onclick`, `$props()`, lowercase event attributes)
- [ ] TypeScript is strict with zero `any`
- [ ] PE7 tokens are referenced by name, no raw OKLCH or hex
- [ ] Mobile-first — base styles are mobile, enhanced with `min-width`
- [ ] `prefers-reduced-motion` is respected if any animation is present
- [ ] Mini-build actually runs in `pnpm dev`
- [ ] DevTools verification step is included
- [ ] 5 check-your-understanding questions with collapsed answers
- [ ] 3–4 common mistakes
- [ ] No "don't worry about it" statements
- [ ] Lighthouse mobile audit passes 100 on Accessibility
