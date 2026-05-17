---
chunk: sitemap-endpoint
level: 1
penalty: 0
---

# Dynamic Sitemap Endpoint — Level 1 Hint (free)

A sitemap is just an XML document served from a `+server.ts` file. SvelteKit does not have a special sitemap API — you build it yourself with a `GET` handler that returns a `Response` with the XML body and the correct content type.

Three things to get right:

1. **Use a `+server.ts` file, not a `+page.server.ts`.** Sitemaps are not pages — they are raw HTTP responses. The file lives at `src/routes/sitemap.xml/+server.ts`. The folder name `sitemap.xml` becomes the URL path `/sitemap.xml`.
2. **Build the URL origin from the request.** The `GET` handler receives a `RequestEvent` with `url.origin`. Use this to construct absolute URLs. Never hard-code a domain — the sitemap must work in development and production.
3. **Return a `new Response()` with the right headers.** The body is a template literal containing XML. Set `Content-Type: application/xml` and add a `Cache-Control` header so crawlers do not re-fetch every second.

For the dynamic pages, import the same data-fetching logic used by your load functions and map the results into `<url>` elements.
