# Plan

The living version of this plan is the "kevinhyde.com overhaul — implementation
plan" doc in Claude. This file is the snapshot the code is built against.

## The concept

One anchored focus node in the middle: **Design Engineer, Adobe Graph**.
Inputs and history sit to the left (where it comes from), outcomes to the
right (what it makes). Visitors pan left and right; nodes never appear,
disappear or get dragged around. The name in the hero is a quiet easter egg:
its letters are nodes you can nudge, constrained so the name always reads.

## Decisions

| Area | Decision |
| --- | --- |
| Framework | Astro, static output, Lit custom elements for interactivity |
| Hosting | Vercel (where the old site and Sanity already run) |
| Graph content | `src/content/graph.config.ts`, typed and validated |
| Rich content | Sanity, existing project, free tier, generic `post` type with category refs |
| Outlets | tech.kevinhyde.com (Lab), blog.kevinhyde.com (Writing), music.kevinhyde.com (Dismal Nitch) stay separate; the hub pulls their latest items at build time |
| Panning | Native horizontal scroll + CSS scroll-snap; JS adds drag, keys, stop sync |
| Adobe Graph | A general statement about the product and Kevin's role as an early team member; not a case study |
| History | Cisco → Swivel → Voltron Data → Adobe, editable; earlier non-software career left out for now |
| Timeline | No deadline; build phase by phase |

## Pages

| Page | URL | Status |
| --- | --- | --- |
| Home | / | Scaffolded (graph renders; wordmark is phase 3) |
| Node page | /work/[slug] | Phase 4: adobe-graph, cisco, swivel, voltron-data, illuminate |
| About | /about | Phase 4 |
| Reading | /reading | Phase 4, from Sanity books + articles |
| Lab | /lab | Phase 4, from tech.kevinhyde.com/apps.json |
| Blog | /blog/[slug] | Phase 4, the 8 Sanity posts at their existing URLs |
| Resume | /resume | Phase 4, generated from the config |
| Studio | /studio | Deferred; links to music.kevinhyde.com meanwhile |
| 404 | — | Scaffolded ("disconnected node") |

## Deferred decisions

- What goes in the "In the role" column (draft nodes hold the space).
- How Studio and the graphic design and art story are reimagined.
- Whether the 8 Sanity blog posts move into the Astro blog.
- Where Illuminate Finance sits in the history chain.
