---
module: 6
lesson: 6.2
title: OKLCH color system in depth (L, C, H explained)
duration: 50 minutes
prerequisites:
  - Lesson 6.1 (@layer stack)
learning_objectives:
  - Explain why hex and rgb are perceptually non-uniform and why that matters for accessibility
  - Name the three OKLCH components and state the unit of each
  - Build a colour palette that maintains consistent apparent brightness across hues
  - Use the oklch(from ... calc(l - 0.1) c h) relative syntax to derive shades
  - Handle prefers-color-scheme: dark cleanly by overriding tokens
status: ready
---

# Lesson 6.2 — OKLCH color system in depth

## 1. Concept — The colour space your eye actually uses

### 1.1 The problem: hex and rgb lie to your eye

Pick two colours with the same "brightness value" in hex — `#ff0000` (red) and `#00ff00` (green). They both have the maximum value 255 on one channel and zero on the others. On the math, they are symmetric. To your eye they are nothing alike: the green looks dramatically brighter than the red. That is because `rgb()` and hex are based on how computer monitors emit light, not on how human eyes perceive it. The human visual system is far more sensitive to yellow-green than to red or blue, and rgb has no idea.

This matters every time you build a design system. If you pick a brand colour and then try to produce a "slightly dimmer" version by subtracting 10% from each channel, the dim version will shift hue in a way you did not ask for. If you pick a palette of six colours with the same hex lightness, one will look washed out and another will punch you in the face. Designers spend hours nudging values by hand to compensate. Accessibility contrast tools compensate with complicated weighted formulas.

### 1.2 The fix: OKLCH

**OKLCH** is a colour space released in 2020 (Björn Ottosson's Oklab, cylindrically remapped) and shipped in every browser by 2023. It is designed to be **perceptually uniform**: a change of 0.1 in lightness looks the same amount brighter regardless of hue. If you build a palette of twelve hues and give them all the same lightness, they will all look equally bright. If you want a dimmer version of any of them, you subtract from L and the hue stays exactly where it was.

OKLCH has three components and they match how humans talk about colour:

- **L — Lightness.** A percentage from `0%` (pure black) to `100%` (pure white). Unlike HSL's "lightness", OKLCH L is perceptually uniform. 50% really is halfway between black and white *to your eye*, not on the math.
- **C — Chroma.** Roughly "saturation" or "colour intensity". A number, usually between 0 and 0.4 for displayable colours. `0` is grey. Higher numbers are more vivid. The maximum displayable chroma depends on lightness and hue — deep yellows cannot be very saturated at low L, for example — and the browser gracefully clamps if you ask for too much.
- **H — Hue.** An angle from `0` to `360`. `0` is red, `120` is green, `240` is blue, and the wheel continues. Same convention as HSL.

```css
--color-brand: oklch(65% 0.22 270);
```

Read that as: 65% perceptual lightness, fairly saturated (0.22), hue 270° (a cool blue-violet).

### 1.3 Why the course refuses hex

In `src/app.css` you will not see a single hex value. Every colour is OKLCH. Three reasons:

1. **Consistency across a palette.** Give all your tokens the same `L` and they will read as the same weight to the eye. Mix hex tokens and one will always feel off.
2. **Easy shades without guessing.** Want a darker variant? Subtract from `L`. Want a dimmer variant? Subtract from `C`. The hue stays locked.
3. **Accessibility contrast is meaningful.** WCAG contrast ratios are computed from relative luminance, which is closer to perceptual L than to rgb. An OKLCH palette tends to land on correct contrast ratios on the first try.

### 1.4 Relative colour syntax: `oklch(from ...)`

CSS Color 5 added the `from` keyword, which lets you derive a colour from another colour by modifying one component. This is the single most useful feature for a token system:

```css
/* A 10% darker brand colour */
background: oklch(from var(--color-brand) calc(l - 0.1) c h);

/* A desaturated version at the same lightness */
background: oklch(from var(--color-brand) l calc(c * 0.5) h);

/* An opposite hue (complement) */
background: oklch(from var(--color-brand) l c calc(h + 180));
```

Inside the `from` parentheses, `l`, `c`, and `h` are substituted with the source colour's values and `calc()` lets you modify them. You will use this constantly in the course — especially for hover states, which are usually "the brand colour, 5% darker".

### 1.5 Dark mode: override tokens, not rules

The PE7 pattern for dark mode is to override a handful of surface/text tokens inside `@media (prefers-color-scheme: dark)` and let every component pick up the new values automatically:

```css
@media (prefers-color-scheme: dark) {
    :root {
        --color-surface:   oklch(18% 0.02 270);
        --color-surface-2: oklch(24% 0.02 270);
        --color-text:      oklch(96% 0.01 270);
        --color-border:    oklch(32% 0.02 270);
    }
}
```

Notice we keep the hue (`270`) consistent with light mode and the chroma low (`0.01–0.02`) so the dark surfaces are nearly neutral with a subtle violet undertone. We do *not* override `--color-brand`; it is a brand colour and should read the same in both modes. Only the surface/text/border tokens flip.

### 1.6 Picking values in practice

A cheat sheet for fast colour decisions:

- Backgrounds: `L` between 92% and 98%, `C` between 0.01 and 0.03. Nearly neutral.
- Text on light backgrounds: `L` between 15% and 25%, `C` below 0.04.
- Vivid brand colours: `L` between 60% and 72%, `C` between 0.15 and 0.25.
- Error red: `oklch(60% 0.22 25)`. Warm and readable.
- Success green: `oklch(65% 0.18 145)`. Slightly desaturated so it doesn't dominate.

You will memorise these from practice. For now, play with the mini-build's sliders and watch L / C / H work independently.

### 1.7 Gamut mapping and the P3 display

Modern displays (MacBook Pro, iPhone, many Samsung phones) support the P3 color gamut, which is significantly wider than sRGB. OKLCH can express colors outside sRGB — and the browser will display them correctly on P3 screens. On sRGB screens, the browser automatically gamut-maps (clamps) the color to the closest displayable equivalent. This means you can write `oklch(70% 0.35 150)` (an extremely saturated green) and trust that P3 users see the full saturation while sRGB users see the closest approximation, with no fallback code needed.

In PE7, we keep chroma values below 0.25 for brand colors to ensure they look excellent on both sRGB and P3 displays. Chroma above 0.3 is reserved for intentional "accent pop" moments (error red, success green) where the extra saturation on P3 displays is a feature, not a risk.

### 1.8 Accessibility and OKLCH contrast

WCAG contrast requirements (4.5:1 for normal text, 3:1 for large text) are defined in terms of relative luminance, which OKLCH's L component approximates closely. Two OKLCH colors with L values that differ by at least 0.4 (e.g., L=90% text on L=20% background) will almost always pass WCAG AA contrast requirements. This is a useful heuristic during design — you can estimate contrast from the L values alone without needing to run a contrast checker for every pair. Of course, always verify with a real contrast tool before shipping, but OKLCH makes the initial palette design dramatically less trial-and-error.

## Deep Dive

**Why this matters at scale.** In a 50-component design system, color consistency is the difference between "everything looks cohesive" and "every page feels like a different website." With hex or HSL, maintaining consistent perceived brightness across a palette of eight hues requires manual tuning — every hue needs different lightness values to *look* the same brightness. With OKLCH, you set L once and rotate H, and every hue genuinely looks the same weight. This means a junior designer can extend the palette (add a new category color, a new status color) without breaking the visual hierarchy. The system *enforces* perceptual consistency rather than *requiring* expert judgment.

**The mental model.** Think of OKLCH as a perfect cylindrical paint-mixing machine. You set three dials: the brightness dial (L), the vividness dial (C), and the hue wheel (H). Unlike older machines where turning the hue wheel would accidentally shift brightness (making blue look darker than yellow), this machine guarantees that brightness stays exactly where you set it regardless of hue. When you want a darker variant, you turn only the brightness dial — the color stays put. When you want a muted variant, you turn only the vividness dial — the brightness stays put. No cross-contamination between controls.

**Edge cases.** Not all L+C+H combinations produce displayable colors. Very high chroma at very high or very low lightness exceeds what monitors can display. For example, `oklch(95% 0.4 120)` (extremely bright, extremely saturated green) is outside even the P3 gamut. The browser gamut-maps it, but the result may not match your intent. The practical limit: at L=50%, maximum displayable chroma is about 0.32 for most hues. At L=90% or L=10%, maximum chroma drops to about 0.1-0.15. The `from` syntax helps here — deriving colors from an already-displayable token guarantees the result stays in gamut.

**Performance implications.** OKLCH color parsing has zero measurable performance impact. The browser converts OKLCH to its internal representation (usually linear sRGB or display P3) once during style computation. Subsequent paints use the converted value. There is no per-frame OKLCH calculation. The `oklch(from ...)` relative syntax adds one extra computation during style resolution (evaluating the `calc()` expression), which is negligible. You can use hundreds of relative-color derivations without any rendering penalty.

**Connection to other modules.** OKLCH was introduced in Module 1 Lesson 1.5 and is reinforced here in Module 6. Module 7 Lesson 7.14 bridges OKLCH to Three.js (which does not understand OKLCH natively, requiring a conversion helper). Module 12 uses OKLCH contrast awareness for accessibility audits. Module 13 uses OKLCH-based tokens to ensure structured data markup (like star ratings) meets color contrast requirements. The PE7 token system's insistence on OKLCH is what makes dark mode a three-line change, what makes per-page color personalities possible, and what makes the entire design system extensible without expert intervention.

## 2. Style it — A live OKLCH picker

The mini-build is three sliders (L, C, H) and a big preview square. The current OKLCH string is displayed in a monospace panel so students can copy-paste it. Per-page colour starts at `oklch(72% 0.2 200)` (teal) and the sliders mutate it.

## 3. Interact — Build a palette

Below the picker, render a row of 6 swatches that share the same L and C but differ in H by 60° each. Changing the sliders changes all six together. This is the single most compelling demonstration of perceptual uniformity: the swatches stay equally bright as you move the L slider.

## 4. Mini-build — OKLCH studio

**File:** `src/routes/modules/06-styling/02-oklch-system/+page.svelte`

Three range inputs, one live preview, six synced swatches, and a readout of the CSS value.

### DevTools verification

Inspect the preview square in Chrome. The computed `background-color` should show the full OKLCH string. Toggle Chrome's dark-mode emulation in Rendering → Emulate CSS media; observe that only the surface and text tokens flip — the preview swatch stays exactly where you set it.

## 5. Check your understanding

<details>
<summary><strong>Q1.</strong> Why is OKLCH perceptually uniform and why does it matter?</summary>

Because the lightness component is scaled to human perception rather than monitor output. A 0.1 change in L looks the same amount brighter regardless of hue. This means palettes are consistent, shades are predictable, and contrast calculations are meaningful.
</details>

<details>
<summary><strong>Q2.</strong> What are the units of L, C, and H?</summary>

L is a percentage (0–100). C is a unitless number (0 to ~0.4 for displayable colours). H is degrees (0–360).
</details>

<details>
<summary><strong>Q3.</strong> Write a CSS expression for "the brand colour, 10% darker".</summary>

`oklch(from var(--color-brand) calc(l - 0.1) c h)`.
</details>

<details>
<summary><strong>Q4.</strong> Which tokens does the PE7 dark-mode block override and which does it leave alone?</summary>

Surface, text, and border tokens flip. The brand colour stays the same across light and dark mode.
</details>

<details>
<summary><strong>Q5.</strong> Why does the course forbid hex colours?</summary>

Because hex is not perceptually uniform, palettes become inconsistent, and shade derivation requires guessing. OKLCH solves all three problems.
</details>

## 6. Common mistakes

- **Setting C above the displayable gamut.** The browser will clamp silently and the colour will not match what you typed. Keep C under ~0.3 for most hues.
- **Using L like HSL's "lightness".** OKLCH L is bigger and more uniform; 50% OKLCH is genuinely mid-grey, whereas 50% HSL depends on the hue.
- **Overriding `--color-brand` in dark mode.** Breaks brand consistency across themes.
- **Writing raw `oklch(...)` in component styles instead of `var(--color-*)`.** Defeats the token system.

## 7. What's next

Lesson 6.3 steps back and looks at the whole design-token system — spacing, typography, motion, radii, shadows — and how tokens compose into a scalable design language.
