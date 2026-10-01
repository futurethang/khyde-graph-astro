# Phase 1 — Foundations

Goal: tokens, type and the page shell are final, and the config holds real content.

## Already done in the scaffold

- [x] `tokens.css` from design N; `base.css` with cascade layers
- [x] Fontsource Archivo (wdth + wght) and Martian Mono
- [x] `Base.astro`, `SiteHeader`, `SiteFooter`
- [x] Graph schema, validator and tests

## Tasks

- [ ] Fonts under budget (≤ 90 KB transferred on home). Today Archivo latin is ~90 KB and Martian Mono latin ~38 KB. Options: subset Archivo to Latin basic and the weights/widths actually used (glyphhanger or `pyftsubset` on the variable file, keeping the axes); use Martian Mono at one weight (non-variable 400 file). Self-host the results in `public/fonts/` and drop the Fontsource imports
- [ ] `<link rel="preload">` the Archivo file used by the wordmark
- [ ] Fallback metrics: `@font-face` for a local Arial/Helvetica fallback with `size-adjust`, `ascent-override`, `descent-override` matched to Archivo so the swap doesn't shift layout
- [ ] Fill the placeholders in `graph.config.ts` with Kevin: Voltron Data summary, dates for Cisco, Swivel and Voltron Data
- [ ] Footer email (`[EMAIL]` in `SiteFooter.astro`) — decide on a plain address or an obfuscated one
- [ ] Glyph set: the eight small illustrations (`nodes`, `pages`, `signal`, `column`, `wave`, `code`, `shapes`, `book`) from the prototype as one SVG sprite in `public/glyphs.svg`, rendered by `GraphNode` when `node.glyph` is set
- [ ] OG image: one static 1200×630 for now (focus card on the dot grid)

## Done when

- Fonts ≤ 90 KB, no layout shift on font swap (check with Lighthouse CLS)
- No `[BRACKETS]` left in non-draft nodes
