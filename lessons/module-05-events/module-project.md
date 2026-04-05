# Module 5 Project — Interactive Form with Live Validation

## Brief

Build a multi-field registration form that demonstrates every concept in Module 5. The form should feel instant, friendly, and robust — the kind of form users finish rather than abandon.

## Requirements

### Fields

1. **Full name** — required, minimum 2 characters.
2. **Email** — required, must match a reasonable email regex, must be unique (simulate with a hard-coded list of "taken" emails and a debounced async check that returns after 400 ms).
3. **Password** — required, minimum 8 characters, must contain at least one number and one non-alphanumeric symbol. Show a live strength meter (weak / medium / strong).
4. **Confirm password** — must match the password field on every keystroke after both have been touched.
5. **Country** — a keyboard-navigable custom listbox with at least 8 options and typeahead (pressing `s` jumps to the first country starting with "s").
6. **Newsletter** — an opt-in toggle switch (built from a `<button role="switch">` with `aria-checked`).
7. **Terms accepted** — a native checkbox. Required.

### Behaviour

- **Live validation.** Each field validates on blur and continuously after the first blur. Email uniqueness is validated through a 400 ms debounced async check with a spinner.
- **Callback props.** Each field is a reusable child component that exposes its value and validity through typed callback props (`onChange`, `onValidityChange`). The parent aggregates them.
- **Closures.** The debounce helper is implemented inline with `setTimeout` and a captured timer — no library.
- **Pointer-friendly.** The toggle switch and the listbox respond to both pointer and keyboard events. 44 px minimum targets everywhere.
- **Keyboard-first.** The whole form is completable with keyboard only. Arrow keys work inside the listbox; escape closes it; the switch toggles with space.
- **Error display.** Every invalid field has a red border, an `aria-invalid="true"` attribute, and a description referenced by `aria-describedby`. Error text is in a `aria-live="polite"` region.
- **Submit flow.** On submit with errors, focus moves to the first invalid field. On submit with no errors, the form is replaced with a success panel that receives focus programmatically and shows the submitted values.
- **Reduced motion.** Any animation (strength meter fill, error shake, success slide-in) collapses to zero duration under `prefers-reduced-motion: reduce`.

## PE7 rules

- Tokens only (`var(--color-*)`, `var(--space-*)`, `var(--text-*)`, `var(--radius-*)`, `var(--dur-*)`).
- OKLCH colours, no hex.
- Mobile-first, `min-width` media queries only.
- Per-page color personality set on the root `<section>` with a scoped `--color-brand` override.
- Native CSS nesting, logical properties, scoped `<style>` blocks. No `:global()`.

## File layout

```
src/routes/modules/05-events/module-project/
├── +page.svelte          # The form page
├── TextField.svelte      # Reusable labelled input with error
├── PasswordField.svelte  # Extends TextField with strength meter
├── Listbox.svelte        # Custom keyboard-navigable select
├── Switch.svelte         # Accessible toggle switch
├── Checkbox.svelte       # Native checkbox wrapped with validation
├── validation.svelte.ts  # Validators + debounce helper + types
└── SuccessPanel.svelte   # Post-submit confirmation
```

## Grading criteria

- **A grade** — all requirements satisfied, Lighthouse accessibility 100, zero TypeScript warnings, every `.svelte` file passes the Svelte autofixer, forms completable by keyboard alone, screen reader announces all errors.
- **B grade** — above but with one or two keyboard gaps or a minor validation bug.
- **C grade** — form works with mouse only, validation is correct, but keyboard flow is broken in the listbox or switch.
- **Fail** — forms reloads the page, untyped handlers, hex colours, or any `:global()` escape hatches.

## Estimated time

6–10 hours for a student who has completed Modules 1–5.
