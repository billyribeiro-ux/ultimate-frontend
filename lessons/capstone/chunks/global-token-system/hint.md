---
chunk: global-token-system
level: 1
penalty: 0
---

# Global PE7 Token System — Level 1 Hint (free)

PE7 is not a one-file thing — it is a **cascade contract**. The contract is that your `@layer` order determines who wins, not specificity. Write the layers in the order `reset, tokens, base, layout, components, animations` and the cascade will behave the same way whether the author is you today or you six months from now.

Three checkpoints while you write this file:

1. **Every token name has a purpose.** `--text-base` is body copy; `--text-lg` is card titles; `--text-2xl` is page `h1`. If you cannot state the purpose of a token in one sentence, you do not need the token yet.
2. **Fluid clamps take three arguments:** a minimum (mobile), a scaling factor (`vw`), and a maximum (desktop). The maximum is where the token stops growing — do not forget it or your hero text fills the viewport on 4K monitors.
3. **Dark mode is one media query, not a theme switcher.** Override only the color tokens inside `@media (prefers-color-scheme: dark)`. Everything else stays the same.

One existing file in this course already shows you exactly what a passing `app.css` looks like — the course's own starter `src/app.css`. You are building the capstone version, which differs only in the accent hue you choose for `--color-brand`.
