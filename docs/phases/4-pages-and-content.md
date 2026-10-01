# Phase 4 — Pages and content

Goal: every page in docs/PLAN.md exists, styled from the same components.

## Shared components first

- [ ] `PropertiesPanel.astro` — role, team, stack, dates, links, like an inspector panel
- [ ] `MiniGraph.astro` — a node's inputs and outputs as a small breadcrumb graph, using `layoutGraph` on the node's neighbourhood
- [ ] `Prose.astro` — Portable Text renderer for Sanity bodies (figures, captions, code, embeds). `@portabletext/to-html` or a small custom renderer; no React

## Pages

- [ ] `/work/[slug]` — node pages. `adobe-graph` is a short general statement about the product and Kevin's role as an early team member (no case study; Kevin writes it). `cisco`, `swivel`, `voltron-data` hold the old samples where they belong. `illuminate` re-themes the old `/caseStudy` content (needs Kevin's call on which node it hangs off)
- [ ] `/about` — career path drawn vertically (dashed spine), craft, interests, the AI philosophy blurb from the old home page
- [ ] `/reading` — Sanity books + articles, newest first, tag filter, "currently reading" pinned
- [ ] `/lab` — newest experiments from `tech.kevinhyde.com/apps.json`, each linking out; status shown with the port glyph (filled = live, hollow = WIP)
- [ ] `/blog/[slug]` — the 8 Sanity blog posts at their existing URLs; restyled; a line pointing to blog.kevinhyde.com for newer writing
- [ ] `/resume` — generated from `graph.config.ts` history nodes plus a small `resume` block (add to the schema); print stylesheet; "Download PDF" via the browser's print
- [ ] `/studio` — deferred. Until reimagined, a 301 to music.kevinhyde.com, or a one-node page linking out

## Outlet work (in the other repos)

- [ ] tech.kevinhyde.com: publish `/apps.json` — `[{ title, description, url, date, tags, status: "live" | "wip" }]`. Its index page already has these fields; generate the JSON from the same source at build
- [ ] tech.kevinhyde.com (optional): a `NOTES.md` per app ("what, why, what I learned") included in `apps.json` as `notes`
- [ ] blog.kevinhyde.com: add `@astrojs/rss` and serve `/rss.xml` (it 404s today)
- [ ] Shared package (optional, later): tokens, fonts, `Node`/`Port`/`Wire` components used by both Astro sites

## Done when

- No dead links from the graph (link checker in CI)
- Every page passes axe with no serious issues
