---
chunk: global-token-system
level: 2
penalty: medium
---

# Global PE7 Token System — Level 2 Concept Reveal

PE7 rests on three CSS features that were all stable by 2024 and all essential by 2026:

1. **CSS `@layer`** — lets you declare an explicit cascade order. Rules inside an earlier layer always lose to rules inside a later layer, regardless of specificity. This replaces specificity wars with an ordered list you read top to bottom.
2. **OKLCH** — a perceptually uniform color space. `oklch(65% 0.22 270)` reads as "lightness 65%, chroma 0.22, hue 270". Two colors with the same `L` value look equally bright to the eye; the same is not true of HSL. OKLCH is the only correct choice for a design system in 2026.
3. **Fluid clamps** — `clamp(min, preferred, max)` gives you a single value that scales linearly between two viewport widths. One `--text-base` definition now replaces the old mobile/tablet/desktop font-size media queries.

### Structure (pseudocode)

```
@layer reset, tokens, base, layout, components, animations;

@layer tokens {
    :root {
        --bp-sm, --bp-md, --bp-lg, --bp-xl, --bp-2xl      // breakpoints
        --text-xs … --text-hero                            // fluid type clamps
        --space-xs … --space-2xl                           // fluid spacing clamps
        --color-brand, --color-surface, --color-text, …    // OKLCH palette
        --dur-instant … --dur-slower                       // motion durations
        --ease-out, --ease-in, --ease-expressive, …        // motion curves
        --radius-sm … --radius-full                        // radii
        --shadow-sm, --shadow-md, --shadow-lg              // shadows
        --content-max, --prose-max                         // layout constraints
    }

    @media (prefers-color-scheme: dark) {
        :root { /* only color tokens flipped */ }
    }
}

@layer reset { box-sizing: border-box; modern resets; }
@layer base { html { font-family … } body { background: var(--color-surface) } }
@layer animations {
    @media (prefers-reduced-motion: reduce) { * { animation-duration: 0.01ms !important } }
}
```

### Why the layer order matters

`reset` is first so its baseline rules lose to everything else. `tokens` ships no rules to the cascade at all — it only defines variables. `base` sets document defaults using those variables. `layout` and `components` are your app-specific layers. `animations` is last so the reduced-motion override wipes transitions from every earlier layer.

### Connecting it to the capstone

Every later chunk reads from this file. The tanstack table reads `--color-surface-2` for row stripes. The GSAP timeline reads `--dur-slow` for base duration. The SEO component reads `--color-brand` for its visible demo card. The **per-section color personalities** — a magenta dashboard, a teal marketing home, a violet contact form — are achieved by overriding `--color-brand` inside a scoped `<style>` block on that route. You do not add new palette entries; you change the active brand hue and let every descendant re-read it.
