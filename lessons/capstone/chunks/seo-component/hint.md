---
chunk: seo-component
level: 1
penalty: 0
---

# Typed SEO Component + JSON-LD — Level 1 Hint (free)

The SEO component is invisible — it renders nothing to the page body. Everything it produces lives inside `<svelte:head>`. Think of it as a data-to-markup translator.

Three things to get right:

1. **Type the JSON-LD as a discriminated union.** Each schema.org type (`WebSite`, `WebPage`, `Organization`, etc.) has a `"@type"` field. Use that as the discriminator in a TypeScript union so the compiler enforces the correct properties for each type.
2. **Escape the JSON-LD output.** A malicious description containing `</script>` could break out of the JSON-LD script tag. Replace `</` with `<\/` in the serialized JSON string before injecting it into the template.
3. **Canonical URLs must be absolute.** Combine `$page.url.origin` with the pathname to produce a full URL. Never pass a relative path as the canonical — crawlers need the complete address.

The component accepts all data via `$props()` — it has no internal state. Every tag it emits is a pure function of its props.
