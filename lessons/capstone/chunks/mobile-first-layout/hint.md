---
chunk: mobile-first-layout
level: 1
penalty: 0
---

# Mobile-First Layout — Level 1 Hint (free)

Your base rule is mobile. Your media queries only ever add, they never subtract. If a rule belongs only on desktop, put it inside `@media (min-width: 768px) { … }`. If a rule belongs only on mobile, put it in the base rule with no media query at all.

A dashboard with three cards has exactly one layout problem: how to express "1 column on phone, 2 columns on tablet, 3 columns on desktop" in a single CSS Grid rule. The answer is not three separate grid definitions — it is `grid-template-columns: repeat(auto-fit, minmax(X, 1fr))` where `X` is the smallest width a card should ever be. CSS Grid computes the column count for you.

Remember the 44 px touch target rule from the component architecture chunk. It applies to the cards themselves when they are also links.
