# kevinhyde.com

Kevin Hyde's site: a node graph where experience, craft, interests and reading
flow into what he's building now, and out into the work.

Astro (static) · Lit · Sanity · Vercel.

```sh
cp .env.example .env   # add SANITY_PROJECT_ID to pull reading/blog content
npm install
npm run dev
```

- Change the home page graph: `src/content/graph.config.ts`, then `npm test`
- Conventions and architecture: `CLAUDE.md`
- Plan and phases: `docs/PLAN.md`, `docs/phases/`
- Approved design: `docs/design/N-pan-graph.prototype.html`
