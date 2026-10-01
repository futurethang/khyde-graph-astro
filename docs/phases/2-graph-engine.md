# Phase 2 — Graph engine

Goal: the home graph matches design N at every width, feels good to pan, and
meets the performance budget on a mid-range phone.

## Already done in the scaffold

- [x] Pure `layoutGraph()` for `wide` (≥ 1280) and `medium` (768–1279), with tests
- [x] Validator: no crossing wires, no wire through a card, edges left → right
- [x] `GraphStage.astro` renders both layouts; CSS switches by media query
- [x] Scroll-snap panning, stop markers, anchor-based stop links, initial scroll to the focus before first paint
- [x] `<kh-graph>`: mouse drag-to-pan, stop sync on `scrollend`, arrow keys, wire highlight on hover/focus
- [x] Narrow (< 768): one column per screen, wires hidden

## Tasks

- [ ] Compare against `docs/design/N-pan-graph.prototype.html` at 1440 wide and tune: card height, vertical padding (there's too much empty space under the graph at medium), column label placement, port sizes
- [ ] Dim columns away from the current stop with a CSS scroll-driven animation (`animation-timeline: view(inline)` on each `.col` slot) — no JS. Fallback: no dimming
- [ ] Narrow: show edge stubs at each screen's left and right edges with a count ("3 inputs →"), so the graph idea survives on phones. Render them from the layout's wires grouped by column
- [ ] Narrow: put the focus card first in the reading order without breaking the left → right swipe (e.g. skip link + initial scroll is enough? decide and test with VoiceOver)
- [ ] Stop tabs: sticky on narrow, inline on wide; make sure `aria-current` updates in Safari (no `scrollend` before Safari 18 — fall back to a debounced `scroll` listener)
- [ ] Feed rendering: when a node's feed is fresh, show the latest item title and date; when stale, show the summary (already wired in `GraphNode`, needs design)
- [ ] Hover/focus: also brighten the ports at both ends of hot wires
- [ ] Playwright: smoke test at 1440, 1100 and 390 (page loads, initial stop is "now", clicking "Inputs" centres the inputs column, no console errors) plus screenshot snapshots
- [ ] Lighthouse CI with budgets from CLAUDE.md, run in GitHub Actions

## Done when

- Visual match with design N at 1440 (side by side screenshot)
- Works with JS disabled (pan by scroll/swipe, stop links jump)
- Lighthouse mobile: LCP < 1.5 s, CLS < 0.05, JS ≤ 30 KB gz
