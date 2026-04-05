---
chunk: container-queries
level: 1
penalty: 0
---

# Container Queries — Level 1 Hint (free)

Media queries ask: how wide is the viewport? Container queries ask: how wide is my parent? For a component that is reused in three different grid slots, the second question is the right one.

You cannot use a container query without first declaring a container. The declaration has two parts: `container-type: inline-size;` tells the browser to measure the element, and `container-name: <name>;` gives it a label your query can target. Put both on the outer element of the component that should respond.

The query syntax is `@container <name> (min-inline-size: …) { … }`. Note it says `inline-size`, not `width`. Think in logical properties — same reason as the mobile-first chunk.

One gotcha: the element that **is** the container cannot itself be queried. So if `Card` is the container, the `@container` rule inside `Card`'s `<style>` block targets the card's **children**, not the card itself.
