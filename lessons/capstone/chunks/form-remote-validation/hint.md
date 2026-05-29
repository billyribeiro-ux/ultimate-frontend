---
chunk: form-remote-validation
level: 1
penalty: 0
---

# Form Remote + Valibot — Level 1 Hint (free)

A `form` Remote Function is the May 2026 successor to `export const actions` in `+page.server.ts`. It is declared with the `form()` wrapper from `$app/server` and it accepts a Valibot schema that describes the expected form fields. The schema does three jobs at once: it validates at runtime, it shapes the TypeScript types for your handler, and it drives the per-field error payload shipped back to the client.

Two mental checkpoints:

1. **The schema is a type.** `v.object({ email: v.pipe(v.string(), v.email()) })` is both runtime validation and a static type. Do not write a separate TypeScript interface — derive it from the schema with `v.InferOutput<typeof schema>`.
2. **Progressive enhancement is a progressive enhancement.** Start with the no-JS path: a plain `<form method="POST" action={sendContact}>` that fully reloads on submit. Then layer JS-enhanced behaviour on top. Not the other way around.
