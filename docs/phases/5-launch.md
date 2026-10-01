# Phase 5 — Launch

## Gate before launch

- [ ] Kevin confirms Adobe is fine with the public statement about Graph

## Tasks

- [ ] Final redirect pass: crawl the old site's sitemap/slug list, hit each URL on the preview, confirm 200 or 301
- [ ] Per-node OG images generated at build (satori or a static SVG template → PNG)
- [ ] `sitemap-index.xml` (already via @astrojs/sitemap) and `robots.txt`
- [ ] Analytics: privacy-friendly (Vercel Analytics or Plausible), no cookie banner needed
- [ ] Accessibility audit: keyboard-only pass, VoiceOver on Safari (iOS and macOS), axe on every page
- [ ] Lighthouse mobile on home and one node page within budget
- [ ] Move the `kevinhyde.com` domain from the `devkev-next` Vercel project to this one
- [ ] Keep `devkev-next` deployable on a subdomain for a month as a fallback, then archive the repo

## Done when

- kevinhyde.com serves the new site; old links resolve
