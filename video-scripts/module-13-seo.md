# Module 13 — SEO: Video Lecture Script Outlines

> **Recording note:** Set editor font to 18px minimum. Keep View Source and Google Search Console visible. Split-screen: editor (left), browser (right).

---

## Lesson 13.1 — Why SvelteKit is already an SEO advantage

**Duration:** 10 minutes
**Screen setup:** Split-screen: SvelteKit page source vs SPA page source

### Hook (30 seconds)
"View the source of a React SPA. You see an empty `<div id="root">`. View the source of a SvelteKit page. You see the full content — headings, text, images, data. Search engines see what you see. That is why SvelteKit starts with an SEO advantage."

### Demo sequence
1. **[0:30-2:30] SSR by default** — View source of a SvelteKit page. Show the full HTML with content, not empty shells.
2. **[2:30-5:00] Hydration** — SSR sends HTML. JavaScript hydrates it for interactivity. Search engines get content. Users get interactivity.
3. **[5:00-7:00] Performance benefits** — Faster FCP and LCP from SSR. Core Web Vitals improve. Google rewards performance.
4. **[7:00-8:30] Build the mini-build** — Side-by-side comparison: SPA empty source vs SvelteKit full source.
5. **[8:30-9:30] Edge case / gotcha** — "SvelteKit is SSR by default, but you can opt out with `ssr = false`. If you do, you lose the SEO advantage. Only disable SSR when you have a specific reason."

### Key moments
- 0:30 — "View source tells the truth"
- 2:30 — "SSR + hydration"
- 5:00 — "Performance and ranking"
- 7:00 — "Source comparison"
- 8:30 — "Don't disable SSR"

### Callout graphics
- SSR vs SPA source comparison
- Hydration timeline
- Core Web Vitals impact

### Outro (30 seconds)
"SvelteKit's SSR gives you SEO by default. Next lesson: the `<svelte:head>` element."

---

## Lesson 13.2 — <svelte:head> — the foundation

**Duration:** 9 minutes
**Screen setup:** Editor with svelte:head usage, browser showing head elements

### Hook (30 seconds)
"The `<head>` element controls what search engines and social media see: your title, description, canonical URL, and robots directives. `<svelte:head>` lets you set these from any component, and they merge into the final HTML head."

### Demo sequence
1. **[0:30-2:00] Basic usage** — Add `<svelte:head>` with title and meta description. Show in View Source.
2. **[2:00-4:00] Per-page head** — Different title and description on each page. Show them updating on navigation.
3. **[4:00-6:00] Layout head** — Set global head elements in the layout, override in pages.
4. **[6:00-7:30] Build the mini-build** — Blog with dynamic titles from load function data.
5. **[7:30-8:30] Edge case / gotcha** — "Multiple svelte:head blocks merge. If two components set the same meta tag, the last one wins. Be intentional about which component owns which tags."

### Key moments
- 0:30 — "Controlling the head"
- 2:00 — "Per-page metadata"
- 4:00 — "Layout-level defaults"
- 6:00 — "Dynamic blog titles"
- 7:30 — "Merge behavior"

### Callout graphics
- svelte:head merge flow
- Head element priority
- Essential meta tags checklist

### Outro (30 seconds)
"svelte:head gives you full control over page metadata. Next lesson: building a reusable SEO component."

---

## Lesson 13.3 — Building a reusable typed SEO component

**Duration:** 11 minutes
**Screen setup:** Editor with SEO component, browser showing meta output

### Hook (30 seconds)
"Every page needs a title, description, canonical URL, and Open Graph tags. Writing them by hand on every page is tedious and error-prone. A reusable `<SEO>` component with typed props ensures consistency and catches missing fields at compile time."

### Demo sequence
1. **[0:30-3:00] Component design** — Create `SEO.svelte` with typed props: title, description, canonicalUrl, ogImage.
2. **[3:00-5:00] Rendering head elements** — Use svelte:head inside the component. Generate title, meta, and OG tags.
3. **[5:00-7:30] Default values and overrides** — Site-level defaults in the component, page-level overrides via props.
4. **[7:30-9:30] Build the mini-build** — Drop `<SEO>` into three pages with different metadata.
5. **[9:30-10:30] Edge case / gotcha** — "Canonical URLs must be absolute (https://...), not relative. Relative URLs confuse search engines."

### Key moments
- 0:30 — "Consistent metadata"
- 3:00 — "Head element generation"
- 5:00 — "Defaults and overrides"
- 7:30 — "Three-page SEO"
- 9:30 — "Absolute canonical URLs"

### Callout graphics
- SEO component prop table
- Generated head element output
- Canonical URL rules

### Outro (30 seconds)
"A typed SEO component ensures every page has correct metadata. Next lesson: Open Graph and social sharing."

---

## Lesson 13.4 — Open Graph & Twitter Cards — social sharing

**Duration:** 10 minutes
**Screen setup:** Editor with OG tags, social media preview tools

### Hook (30 seconds)
"Someone shares your blog post on Twitter. Instead of a bare URL, they see a rich card: image, title, description. Open Graph and Twitter Card meta tags control this preview. Without them, your shares look like plain text links."

### Demo sequence
1. **[0:30-2:30] Open Graph basics** — og:title, og:description, og:image, og:url. Show the preview on social media.
2. **[2:30-5:00] Twitter Cards** — twitter:card, twitter:title, twitter:description, twitter:image. Summary vs summary_large_image.
3. **[5:00-7:00] Dynamic OG images** — Generate OG images from page data using a server route.
4. **[7:00-8:30] Build the mini-build** — Blog post with full Open Graph and Twitter Card metadata.
5. **[8:30-9:30] Edge case / gotcha** — "og:image must be an absolute URL with a minimum size of 1200x630 pixels. Relative URLs and small images are ignored by social platforms."

### Key moments
- 0:30 — "Rich social previews"
- 2:30 — "Twitter Card types"
- 5:00 — "Dynamic OG images"
- 7:00 — "Blog post cards"
- 8:30 — "Image requirements"

### Callout graphics
- OG tag to preview mapping
- Twitter Card types comparison
- Image size requirements

### Outro (30 seconds)
"Open Graph and Twitter Cards make your content shareable. Next lesson: SEO data from load functions."

---

## Lesson 13.5 — SEO data from load functions

**Duration:** 10 minutes
**Screen setup:** Editor with load function and SEO component, View Source

### Hook (30 seconds)
"Your SEO metadata comes from your data: the blog post title IS the page title, the product description IS the meta description. Load functions give you the data before render — so the SEO tags are in the HTML when search engines arrive."

### Demo sequence
1. **[0:30-2:30] Data-driven metadata** — Load function returns title and description. Page passes them to the SEO component.
2. **[2:30-5:00] Dynamic routes** — Blog post: load function fetches the post, SEO component uses post.title and post.excerpt.
3. **[5:00-7:00] Fallbacks** — Handle missing data gracefully. Default title, fallback description.
4. **[7:00-8:30] Build the mini-build** — Product page with SEO from load: name, description, image, price.
5. **[8:30-9:30] Edge case / gotcha** — "SEO tags must be in the server-rendered HTML. If you set them in $effect or onMount, search engines will not see them."

### Key moments
- 0:30 — "Data IS metadata"
- 2:30 — "Dynamic blog SEO"
- 5:00 — "Fallback values"
- 7:00 — "Product page SEO"
- 8:30 — "SSR or invisible"

### Callout graphics
- Data flow: load → props → SEO component → head
- Dynamic metadata generation
- SSR requirement diagram

### Outro (30 seconds)
"Load function data powers your SEO. Next lesson: structured data with JSON-LD."

---

## Lesson 13.6 — JSON-LD structured data — rich results

**Duration:** 11 minutes
**Screen setup:** Editor with JSON-LD, Google Rich Results Test

### Hook (30 seconds)
"Google shows star ratings, recipe cards, FAQ accordions, and product prices directly in search results. These rich results come from structured data — JSON-LD embedded in your HTML. Without it, you get a plain blue link."

### Demo sequence
1. **[0:30-2:30] What JSON-LD is** — A script tag with structured data in JSON format. Schema.org vocabulary.
2. **[2:30-5:00] Common schemas** — Article, Product, FAQ, BreadcrumbList. Show the JSON-LD for each.
3. **[5:00-7:30] Testing** — Paste the page URL into Google's Rich Results Test. Show validation and preview.
4. **[7:30-9:30] Build the mini-build** — Product page with JSON-LD: name, price, availability, reviews.
5. **[9:30-10:30] Edge case / gotcha** — "JSON-LD must match the visible content. If your page says $29.99 but the JSON-LD says $19.99, Google may penalize you."

### Key moments
- 0:30 — "Rich results from structured data"
- 2:30 — "Common schemas"
- 5:00 — "Rich Results Test"
- 7:30 — "Product page JSON-LD"
- 9:30 — "Content must match markup"

### Callout graphics
- JSON-LD to rich result mapping
- Schema.org hierarchy
- Rich Results Test screenshot

### Outro (30 seconds)
"JSON-LD unlocks rich results in search. Next lesson: E-E-A-T signals."

---

## Lesson 13.7 — E-E-A-T signals in markup

**Duration:** 10 minutes
**Screen setup:** Editor with author and credibility markup

### Hook (30 seconds)
"Google evaluates Experience, Expertise, Authoritativeness, and Trustworthiness. Your HTML can signal these: author bios, publication dates, citations, organization details. These are not ranking factors per se — they are signals that quality raters evaluate."

### Demo sequence
1. **[0:30-2:30] What E-E-A-T means** — Define each letter. Explain quality rater guidelines.
2. **[2:30-5:00] Markup signals** — Author schema, organization schema, publication dates, citations.
3. **[5:00-7:00] Practical implementation** — Add author bio, date, and organization to a blog post.
4. **[7:00-8:30] Build the mini-build** — Article page with full E-E-A-T markup.
5. **[8:30-9:30] Edge case / gotcha** — "E-E-A-T is not a direct ranking algorithm. It is a framework for quality raters. But pages that demonstrate E-E-A-T tend to rank better in practice."

### Key moments
- 0:30 — "Expertise signals"
- 2:30 — "Markup patterns"
- 5:00 — "Implementation"
- 7:00 — "Article mini-build"
- 8:30 — "Not a direct ranking factor"

### Callout graphics
- E-E-A-T components
- Author/org schema examples
- Quality rater checklist

### Outro (30 seconds)
"E-E-A-T signals build trust with Google. Next lesson: dynamic sitemap generation."

---

## Lesson 13.8 — Dynamic sitemap generation

**Duration:** 10 minutes
**Screen setup:** Editor with sitemap endpoint, browser showing XML output

### Hook (30 seconds)
"A sitemap tells search engines every URL on your site, when it was last modified, and how important it is. For a dynamic site with hundreds of pages, generating the sitemap from your data is essential — and SvelteKit makes it a single server route."

### Demo sequence
1. **[0:30-2:30] Sitemap XML format** — Show the sitemap XML structure. URL, lastmod, changefreq, priority.
2. **[2:30-5:00] Server route** — Create `sitemap.xml/+server.ts`. Fetch all URLs from the database. Generate XML.
3. **[5:00-7:00] Dynamic pages** — Include blog posts, product pages, and category pages with their lastmod dates.
4. **[7:00-8:30] Build the mini-build** — Complete sitemap with static and dynamic URLs.
5. **[8:30-9:30] Edge case / gotcha** — "Sitemaps have a 50,000 URL limit. For larger sites, use a sitemap index that points to multiple sitemap files."

### Key moments
- 0:30 — "Tell search engines about your pages"
- 2:30 — "Server route generation"
- 5:00 — "Dynamic page inclusion"
- 7:00 — "Complete sitemap"
- 8:30 — "50,000 URL limit"

### Callout graphics
- Sitemap XML structure
- Dynamic generation flow
- Sitemap index for large sites

### Outro (30 seconds)
"Dynamic sitemaps keep search engines informed. Next lesson: robots.txt."

---

## Lesson 13.9 — robots.txt

**Duration:** 8 minutes
**Screen setup:** Editor with robots.txt route, browser showing output

### Hook (30 seconds)
"robots.txt tells search engines which pages to crawl and which to skip. Admin pages, API routes, draft content — some things should not be indexed. A single file controls crawler behavior for your entire site."

### Demo sequence
1. **[0:30-2:00] robots.txt format** — User-agent, Allow, Disallow, Sitemap directive.
2. **[2:00-4:00] Server route** — Create `robots.txt/+server.ts`. Return the robots.txt content with correct content type.
3. **[4:00-5:30] Common rules** — Block admin, API routes, search results pages. Allow everything else. Point to sitemap.
4. **[5:30-6:30] Build the mini-build** — Dynamic robots.txt that blocks staging environments.
5. **[6:30-7:30] Edge case / gotcha** — "robots.txt is advisory, not enforced. Malicious bots ignore it. Do not rely on it for security — use authentication and authorization."

### Key moments
- 0:30 — "Crawler instructions"
- 2:00 — "Server route approach"
- 4:00 — "Common rules"
- 5:30 — "Environment-aware robots"
- 6:30 — "Advisory, not security"

### Callout graphics
- robots.txt directive reference
- Common rule patterns
- Security vs robots.txt

### Outro (30 seconds)
"robots.txt guides crawlers to your important content. Next lesson: Core Web Vitals optimization."

---

## Lesson 13.10 — Core Web Vitals optimization in SvelteKit

**Duration:** 10 minutes
**Screen setup:** Lighthouse results, Performance panel

### Hook (30 seconds)
"You know what LCP, CLS, and INP are. Now fix them in SvelteKit. This lesson is a practical checklist: the five most common SvelteKit-specific improvements that move your Core Web Vitals scores from orange to green."

### Demo sequence
1. **[0:30-2:30] LCP fixes** — Preload hero images, inline critical CSS, avoid blocking resources.
2. **[2:30-5:00] CLS fixes** — Set image dimensions, avoid layout-shifting dynamic content, use skeleton loaders.
3. **[5:00-7:00] INP fixes** — Defer heavy JavaScript, use requestIdleCallback, optimize event handlers.
4. **[7:00-8:30] Build the mini-build** — Before/after Lighthouse scores for a product page.
5. **[8:30-9:30] Edge case / gotcha** — "Third-party scripts (analytics, chat widgets) are the #1 cause of poor INP. Load them after the page is interactive."

### Key moments
- 0:30 — "Orange to green"
- 2:30 — "CLS zero-shift"
- 5:00 — "INP under 200ms"
- 7:00 — "Before/after scores"
- 8:30 — "Third-party scripts"

### Callout graphics
- CWV optimization checklist
- Before/after Lighthouse comparison
- Third-party loading strategy

### Outro (30 seconds)
"Core Web Vitals optimization is a checklist, not a mystery. Next lesson: prerendering for SEO."

---

## Lesson 13.11 — Prerendering for SEO

**Duration:** 10 minutes
**Screen setup:** Editor with prerender config, build output

### Hook (30 seconds)
"Blog posts never change after publication. Product pages update rarely. Why render them on every request? Prerendering generates static HTML at build time — fastest possible load, best possible SEO, zero server cost per page view."

### Demo sequence
1. **[0:30-2:30] prerender = true** — Set it on a page. Build. Show the HTML file in the output.
2. **[2:30-5:00] entries() for dynamic routes** — List all blog post slugs. Prerender each one.
3. **[5:00-7:00] Hybrid rendering** — Some pages prerendered (blog), some SSR (dashboard). Show the configuration.
4. **[7:00-8:30] Build the mini-build** — Prerendered blog index and detail pages.
5. **[8:30-9:30] Edge case / gotcha** — "Prerendered pages cannot use cookies, request headers, or form actions. They are static files. For personalization, use client-side JavaScript after the static page loads."

### Key moments
- 0:30 — "Static at build time"
- 2:30 — "entries() for slugs"
- 5:00 — "Hybrid rendering"
- 7:00 — "Blog prerender"
- 8:30 — "No server features"

### Callout graphics
- Prerender build flow
- Hybrid rendering diagram
- SSR vs prerender decision

### Outro (30 seconds)
"Prerendering gives maximum speed at zero runtime cost. Next lesson: AI search optimization."

---

## Lesson 13.12 — AI search optimization — AEO & GEO

**Duration:** 10 minutes
**Screen setup:** Slides with AI search examples, editor with markup

### Hook (30 seconds)
"ChatGPT, Perplexity, Google AI Overviews — AI is changing how people find information. Your content needs to be structured for AI consumption, not just traditional search. Answer Engine Optimization and Generative Engine Optimization are the new frontier."

### Demo sequence
1. **[0:30-2:30] What AI search reads** — Clean HTML, structured data, FAQ sections, clear headings. Show what AI extracts.
2. **[2:30-5:00] AEO patterns** — Question-answer format, concise definitions, numbered steps. Content AI can directly quote.
3. **[5:00-7:00] GEO patterns** — Citation-ready content, statistics with sources, expert attributions.
4. **[7:00-8:30] Build the mini-build** — FAQ section with schema markup and AI-friendly formatting.
5. **[8:30-9:30] Edge case / gotcha** — "AI search optimization does not replace traditional SEO. It layers on top. If your traditional SEO is poor, AI search will not find your content either."

### Key moments
- 0:30 — "AI is reading your site"
- 2:30 — "Answer-first content"
- 5:00 — "Citation-ready writing"
- 7:00 — "FAQ mini-build"
- 8:30 — "Layers on traditional SEO"

### Callout graphics
- AI search extraction example
- AEO content structure
- Traditional SEO + AEO checklist

### Outro (30 seconds)
"AI search optimization prepares your content for the next era of search. Next lesson: trailing slashes and canonical issues."

---

## Lesson 13.13 — Trailing slashes, redirects, canonical issues

**Duration:** 9 minutes
**Screen setup:** Editor with SvelteKit config, browser showing redirects

### Hook (30 seconds)
"Is your page at /about or /about/? If both work, you have duplicate content — and search engines penalize that. Trailing slashes, redirect chains, and canonical confusion are silent SEO killers."

### Demo sequence
1. **[0:30-2:00] The trailing slash problem** — /about and /about/ serve the same content. Google sees two pages.
2. **[2:00-4:00] SvelteKit config** — `trailingSlash: 'never'` or `'always'`. Show automatic redirects.
3. **[4:00-5:30] Canonical tags** — `<link rel="canonical">` tells Google which URL is the real one.
4. **[5:30-7:00] Build the mini-build** — Site with consistent trailing slash policy and canonical tags.
5. **[7:00-8:30] Edge case / gotcha** — "Redirect chains (A → B → C) waste crawl budget. Always redirect to the final URL directly."

### Key moments
- 0:30 — "Duplicate content"
- 2:00 — "SvelteKit config"
- 4:00 — "Canonical tags"
- 5:30 — "Consistent policy"
- 7:00 — "No redirect chains"

### Callout graphics
- Duplicate content problem
- trailingSlash options
- Redirect chain vs direct redirect

### Outro (30 seconds)
"Consistent URLs and canonical tags prevent duplicate content. Next lesson: Google Search Console."

---

## Lesson 13.14 — Google Search Console integration

**Duration:** 9 minutes
**Screen setup:** Google Search Console dashboard, SvelteKit verification

### Hook (30 seconds)
"Google Search Console tells you exactly what Google sees: which pages are indexed, which have errors, what queries bring traffic, and how your Core Web Vitals perform in the real world. If you are doing SEO without Search Console, you are flying blind."

### Demo sequence
1. **[0:30-2:00] Verification** — Verify your site via HTML meta tag or DNS record.
2. **[2:00-4:00] Core reports** — Performance, Coverage, Sitemaps. What each tells you.
3. **[4:00-5:30] Fixing issues** — Index coverage errors, mobile usability issues, Core Web Vitals failures.
4. **[5:30-7:00] Build the mini-build** — Add Search Console verification to the SvelteKit app.
5. **[7:00-8:30] Edge case / gotcha** — "Search Console data is delayed by 2-3 days. Do not panic about sudden drops — check back in a week."

### Key moments
- 0:30 — "See what Google sees"
- 2:00 — "Core reports"
- 4:00 — "Fixing issues"
- 5:30 — "Verification setup"
- 7:00 — "Data delay"

### Callout graphics
- Search Console report overview
- Common index coverage errors
- Core Web Vitals field data

### Outro (30 seconds)
"Search Console is your SEO dashboard. Last lesson: 3D and SEO."

---

## Lesson 13.15 — 3D SEO — invisible canvas content and LCP fixes

**Duration:** 10 minutes
**Screen setup:** Editor with 3D component and SEO fallback, View Source

### Hook (30 seconds)
"A 3D product viewer is beautiful — but search engines cannot see inside a canvas element. Your hero is a Three.js scene? Google sees an empty rectangle. You need invisible content that mirrors what the canvas shows."

### Demo sequence
1. **[0:30-2:30] The canvas SEO problem** — View source of a page with a 3D hero. No text, no image, no content.
2. **[2:30-5:00] Invisible content strategy** — Add visually hidden text and images that mirror the 3D content. Screen readers benefit too.
3. **[5:00-7:00] LCP fixes for canvas** — Canvas elements do not trigger LCP. Add a poster image or preload the first frame.
4. **[7:00-8:30] Build the mini-build** — Product page with 3D viewer, invisible alt content, and LCP-friendly poster.
5. **[8:30-9:30] Edge case / gotcha** — "Do not hide content with display:none — Google ignores it. Use sr-only/visually-hidden CSS that keeps content accessible but invisible."

### Key moments
- 0:30 — "Canvas is invisible to SEO"
- 2:30 — "Invisible content mirrors"
- 5:00 — "LCP and canvas"
- 7:00 — "Product viewer mini-build"
- 8:30 — "sr-only, not display:none"

### Callout graphics
- Canvas vs HTML content SEO comparison
- Invisible content CSS pattern
- LCP poster image strategy

### Outro (30 seconds)
"Invisible content and poster images make 3D scenes SEO-friendly. Module 13 is complete — you now have comprehensive SEO skills for SvelteKit."

---
