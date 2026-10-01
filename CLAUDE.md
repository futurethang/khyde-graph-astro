# kevinhyde.com

Kevin Hyde's personal site, rebuilt as a static Astro site around one idea: a
node graph where experience, craft, interests and reading flow into the current
focus (Design Engineer, Adobe Graph) and out into the work. Visitors pan left
and right; the focus stays anchored in the middle.

Read `docs/PLAN.md` for the why. Work phase by phase from `docs/phases/`.

## Commands

```sh
npm run dev       # astro dev — draft nodes visible
npm run build     # static build to dist/ — drafts hidden
npm run preview   # serve dist/
npm test          # vitest: graph schema, validator, layout, feeds
npm run check     # astro check (needs TypeScript 6; TS 7 isn't supported yet)
```

Run `npm test && npm run check && npm run build` before calling anything done.

## Architecture

- **Astro, static output, deployed on Vercel.** No SSR, no adapter. Old-URL
  301s live in `vercel.json`.
- **The graph is data.** `src/content/graph.config.ts` is the single source for
  every node, column, edge and stop on the home page. It is validated with zod
  (`src/lib/graph/schema.ts`) plus semantic rules (`validate.ts`). Importing
  `src/lib/graph` throws if the config is broken, so the build fails loudly.
- **Layout is a pure function.** `layoutGraph(graph, 'wide' | 'medium')` returns
  boxes, wire paths and ports with the focus centred on (0, 0). Astro renders
  both layouts and CSS switches between them. Under 768px, CSS stacks one
  column per screen instead.
- **HTML first, Lit second.** Astro renders all markup. Lit custom elements in
  `src/elements/` upgrade it in place (light DOM, `createRenderRoot() { return
  this }`, no templates over server markup). Everything must work with JS off.
- **Content.** Sanity (existing project, generic `post` type, category refs in
  `src/lib/sanity/queries.ts`) for reading items, old blog posts and rich
  pages. Outlet feeds (`src/lib/feeds/`) pull from tech.kevinhyde.com and
  blog.kevinhyde.com at build time and fail soft to `[]`.

## Rules

- No React, no Tailwind, no CSS-in-JS. Plain CSS with tokens from
  `src/styles/tokens.css`, cascade layers, scoped `<style>` in components.
- Never hard-code a color, font or spacing value in a component; add a token.
- Rows are lanes. Wires may not cross or pass through a card; the validator
  enforces this. Fix layout problems in the config, never by special-casing
  the renderer.
- Edges run left to right. History nodes are dashed. The focus card is the only
  light card.
- Anything in `[BRACKETS]` in content is a placeholder for Kevin. Don't invent
  facts, dates, metrics or project details to fill it.
- `draft: true` nodes show in dev only. Use them for structure that isn't
  decided yet.
- Accessibility: real links and buttons, visible focus, DOM order = reading
  order, `aria-hidden` on decorative SVG, everything usable by keyboard,
  `prefers-reduced-motion` respected.
- Budgets (fail the change if exceeded): home page JS ≤ 30 KB gzipped,
  CSS ≤ 20 KB gzipped, fonts ≤ 90 KB transferred, LCP < 1.5 s and CLS < 0.05 on
  Lighthouse mobile. Current: ~8 KB JS; fonts ~128 KB (subsetting is a phase 1
  task).

## Design reference

- `docs/design/N-pan-graph.prototype.html` is the approved design (round 5,
  design N). It's a Design-canvas component file, not production code: read it
  for layout, copy, interaction and the constrained-letter wordmark; don't copy
  its inline-style approach.
- Tokens in `src/styles/tokens.css` were taken from it. Fonts: Archivo
  (variable, wdth + wght) and Martian Mono, self-hosted via Fontsource.
- Illustration palette: amber, rust, navy, bone. Flat vector, no gradients.

## Map

```
src/content/graph.config.ts   the graph (edit this to change the home page)
src/lib/graph/                schema, validate, layout (+ tests)
src/lib/sanity/               client + GROQ queries (category ids)
src/lib/feeds/                build-time feeds from Sanity and the outlets
src/components/graph/         GraphStage, GraphNode, FocusCard
src/elements/                 Lit: kh-graph (pan/stops/hover), kh-wordmark (phase 3)
src/styles/                   tokens.css, base.css
docs/PLAN.md                  decisions and information architecture
docs/phases/                  task lists with acceptance criteria
```
