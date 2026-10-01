// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// Static output on Vercel. Redirects from the old Next.js URLs live in
// vercel.json so they are real 301s at the edge.
export default defineConfig({
  site: 'https://kevinhyde.com',
  output: 'static',
  integrations: [sitemap()],
  prefetch: { defaultStrategy: 'hover' },
  build: { inlineStylesheets: 'auto' },
});
