---
chunk: sitemap-endpoint
title: Dynamic Sitemap Endpoint
module: 13
---

# Dynamic Sitemap Endpoint — Brief

Build a dynamic XML sitemap endpoint at `/sitemap.xml` that programmatically generates a valid sitemap from the capstone's route structure and server-side data. Search engines use this to discover and prioritize pages for crawling.

## What to build

- In `src/routes/sitemap.xml/+server.ts`, create a `GET` request handler that returns a well-formed XML sitemap with `Content-Type: application/xml`.
- The sitemap must include all static pages (home, dashboard, contact) with absolute URLs built from the request origin.
- It must dynamically query for any data-driven pages (e.g., blog posts or dashboard sub-pages) and include them with their `<lastmod>` dates.
- Each `<url>` entry should include `<loc>`, `<lastmod>` (ISO 8601 date), `<changefreq>`, and `<priority>`.
- The endpoint must set appropriate cache headers (`Cache-Control: public, max-age=3600`) so crawlers don't hammer it.
- In `src/routes/robots.txt/+server.ts`, create a companion robots.txt endpoint that references the sitemap URL.

## Acceptance criteria

- `GET /sitemap.xml` returns valid XML that passes the W3C XML validator and Google Search Console sitemap validation.
- The sitemap includes all pages with correct absolute URLs (protocol + domain + path).
- Dynamic pages (from server data) appear in the sitemap with real `<lastmod>` timestamps.
- The response has `Content-Type: application/xml` and `Cache-Control` headers.
- `GET /robots.txt` returns a valid robots.txt that references the sitemap.
- No `any` types in either endpoint.
- The endpoint is prerenderable — `export const prerender = true` works if all data is available at build time.

## How it connects to the capstone

The canonical URLs in this sitemap match exactly those produced by the `seo-component` chunk. The `page-routing-setup` chunk determines which routes exist. The `load-function-typing` chunk provides the typed data queries that supply `lastmod` dates for dynamic pages.
