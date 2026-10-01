# Phase 3 — Signature details

Goal: the wordmark easter egg, page transitions and the 404 feel finished.

## Tasks

### `<kh-wordmark>` (src/elements/kh-wordmark.ts — stub today)

Reference: the hero in `docs/design/N-pan-graph.prototype.html` (letters,
`RX = 24`, `RY = 56`, tanh rubber band, centre-to-centre S-curve wires).

- [ ] Keep the server-rendered `<h1>Kevin Hyde</h1>` as the LCP element. Upgrade only after `document.fonts.ready`
- [ ] Split into one `<span>` per letter (`aria-hidden`), keep the accessible name on the h1 (`aria-label` or an sr-only copy)
- [ ] Measure letters, then offset them with `transform` only (no layout properties) so nothing reflows
- [ ] Pointer drag per letter: offset = R · tanh(raw / R) with R = 24px x, 56px y. Letter order can never change
- [ ] Wires: one absolutely positioned SVG behind the letters, centre-to-centre cubic with control points at the midpoint x (flat tangents), RGB colours cycling; visible only while any letter is displaced
- [ ] "Reassemble" button appears when displaced; springs letters home (600ms, `--ease-out`)
- [ ] Keyboard: letters focusable only after the visitor interacts? Decide: either make each letter a button (arrow keys nudge) or leave the easter egg pointer-only and keep it out of the tab order. Document the choice
- [ ] `prefers-reduced-motion`: stays static
- [ ] Touch: works, but don't block vertical page scroll (`touch-action: none` only on letters)

### Page transitions

- [ ] `@view-transition { navigation: auto; }` in base.css
- [ ] Each graph node and its page header share `view-transition-name: node-<id>`
- [ ] Check Safari 18.2+ and Chrome; other browsers just navigate

### 404

- [ ] Scaffolded; add a tiny `<kh-wordmark>` style wobble on the "disconnected" card, or leave it still. Kevin's call

## Done when

- Wordmark adds 0 CLS and ≤ 4 KB gz JS
- Transitions run in Chrome and Safari, no errors elsewhere
