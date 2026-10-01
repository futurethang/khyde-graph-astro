# Phase 0 — Audit and setup

Goal: a repo that deploys a preview to Vercel, with every old URL accounted for.

## Already done in the scaffold

- [x] Astro + Lit + TypeScript project, static output
- [x] Vitest, `astro check`, build all passing
- [x] `vercel.json` with 301s for the known old routes
- [x] Sanity client wired to env vars, category ids copied from `devkev-next`

## Tasks

- [ ] Push to a new GitHub repo (`futurethang/kevinhyde-com`)
- [ ] New Vercel project from it; set `SANITY_PROJECT_ID` and `SANITY_DATASET` (copy from the `devkev-next` project); confirm the preview URL builds
- [ ] Add a Sanity webhook (on publish) that hits a Vercel deploy hook for this project
- [ ] Export the Sanity dataset as a backup: `npx sanity dataset export production backup.tar.gz` from the studio project
- [ ] List every live URL on the old site: all `post` slugs per category (samples, blog, books, articles, art) plus static routes. Add a 301 for each one that changes. `/blog/[slug]` stays as is
- [x] GitHub Actions CI (`.github/workflows/ci.yml`): test, check, build

## Done when

- A push to `main` deploys a preview on Vercel
- Every old URL either still resolves or has a 301 in `vercel.json`
- CI is green
