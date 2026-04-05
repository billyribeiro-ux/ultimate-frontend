---
chunk: reveal-action
level: 1
penalty: 0
---

# use:revealOnScroll action — Level 1 Hint (free)

A Svelte action is a function with the signature `(node: HTMLElement, params?: T) => { update?(params: T): void; destroy?(): void }`. The framework calls it once when the element mounts and invokes `destroy` when the element unmounts. That gives you a perfect place to set up and tear down anything that needs a DOM node.

For a one-shot reveal you do not need GSAP — `IntersectionObserver` is lighter, zero-dependency, and supported everywhere. Create an observer that fires once when the element crosses a threshold, applies a class that triggers a CSS transition, and then unobserves itself.

Two questions to settle:

1. **CSS or JS for the actual animation?** CSS, always, when it works. A class toggle is simpler, faster, and honours reduced-motion through your existing `@media` block.
2. **Who owns the initial state?** The action adds a `data-reveal="pending"` attribute on mount, and the CSS reads that attribute to hide the element. No state leak outside the directive.
