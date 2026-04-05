---
chunk: global-token-system
title: Global PE7 Token System
module: 1, 6
---

# Global PE7 Token System — Brief

Every pixel in the capstone reads from one OKLCH token file. Your job in this chunk is to author `src/app.css` with the full PE7 architecture:

- Six `@layer` declarations in order: `reset, tokens, base, layout, components, animations`.
- A `tokens` layer with fluid typography (`--text-xs` through `--text-hero`), fluid spacing (`--space-xs` through `--space-2xl`), an OKLCH color palette (`--color-brand`, `--color-surface`, `--color-text`, `--color-border`, `--color-error`, `--color-success`, etc.), motion tokens (`--dur-*`, `--ease-*`), radii, and shadows.
- A `@media (prefers-color-scheme: dark)` override for the colors.
- A `reset` layer with a modern box-sizing reset.
- A `base` layer with document-level typography.
- An `animations` layer that honours `prefers-reduced-motion: reduce`.

## Acceptance criteria

- Zero hex colors, zero `rgb()`, zero `hsl()`. OKLCH only.
- Typography scales fluidly with `clamp()`.
- `prefers-reduced-motion: reduce` wipes all transitions.
- Imported once in `src/routes/+layout.svelte`.

## How it connects to the capstone

Every other chunk reads these tokens. If a later chunk hard-codes a color, the capstone has failed the PE7 rule. Per-section color personalities in the marketing home and dashboard come from **overriding** `--color-brand` inside a scoped `<style>` block — never from new raw values.
