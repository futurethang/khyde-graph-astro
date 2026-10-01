import { defineGraph } from '../lib/graph/schema';

/**
 * The home page graph. Everything on the graph comes from here.
 *
 * - Columns are numbered outward from the focus: left side = where it comes
 *   from, right side = what it makes.
 * - Rows are lanes shared by every column. Wires may not cross each other or
 *   run through a card; `npm test` fails if they do.
 * - Edges always run left to right.
 * - `draft: true` nodes show in `astro dev` only.
 * - Anything in [BRACKETS] is a placeholder waiting on Kevin.
 */
export default defineGraph({
  rows: 5,

  focus: {
    id: 'adobe-graph',
    kicker: 'Now · focus',
    title: 'Design Engineer, Adobe Graph',
    summary:
      "Early team member on Adobe's node-based canvas for orchestrating generative AI in creative work. Front-end squad lead and co-inventor on the team's patent.",
    href: '/work/adobe-graph',
    cta: 'About the product',
  },

  columns: [
    { id: 'earlier-2', side: 'left', order: 3, label: 'Earlier' },
    { id: 'earlier-1', side: 'left', order: 2, label: 'Earlier' },
    { id: 'inputs', side: 'left', order: 1, label: 'Inputs' },
    { id: 'role', side: 'right', order: 1, label: 'In the role' },
    { id: 'beyond', side: 'right', order: 2, label: 'Beyond the role' },
  ],

  nodes: [
    // History: the spine runs along row 3 straight into the focus.
    {
      id: 'cisco',
      kind: 'history',
      column: 'earlier-2',
      row: 3,
      kicker: 'Earlier',
      title: 'Cisco',
      summary: 'Momentum Web Components for enterprise platform GUIs.',
      href: '/work/cisco',
      dates: { start: '[YYYY]', end: '[YYYY]' },
    },
    {
      id: 'swivel',
      kind: 'history',
      column: 'earlier-1',
      row: 3,
      kicker: 'Earlier',
      title: 'Swivel',
      summary: 'DeFi product and UX: orderbook, markets, network switching.',
      href: '/work/swivel',
      dates: { start: '[YYYY]', end: '[YYYY]' },
    },
    {
      id: 'voltron',
      kind: 'history',
      column: 'inputs',
      row: 3,
      kicker: 'Previously',
      title: 'Voltron Data',
      summary: '[ONE LINE ON THE ROLE]',
      href: '/work/voltron-data',
      dates: { start: '[YYYY]', end: '[YYYY]' },
    },

    // Inputs
    {
      id: 'craft',
      kind: 'input',
      column: 'inputs',
      row: 1,
      kicker: 'Input · craft',
      title: 'Design ↔ Engineering',
      summary: 'Lit · TypeScript · Web Components · CSS systems',
      glyph: 'code',
      href: '/about',
    },
    {
      id: 'interests',
      kind: 'input',
      column: 'inputs',
      row: 2,
      kicker: 'Input · interests',
      title: 'Off the clock',
      summary: 'Music production, guitar, generative art, 3D printing',
      glyph: 'shapes',
      href: '/about',
    },
    {
      id: 'reading',
      kind: 'input',
      column: 'inputs',
      row: 4,
      kicker: 'Input · reading',
      title: 'On the nightstand',
      summary: 'Books and articles, with notes.',
      glyph: 'book',
      href: '/reading',
      feed: { source: 'sanity', category: 'books', limit: 3 },
    },

    // In the role: structure deferred, so these stay drafts.
    {
      id: 'role-architecture',
      kind: 'output',
      column: 'role',
      row: 1,
      kicker: 'In the role',
      title: '[STORY FROM THE ROLE]',
      summary: '[ONE LINE]',
      draft: true,
    },
    {
      id: 'role-leadership',
      kind: 'output',
      column: 'role',
      row: 2,
      kicker: 'In the role',
      title: '[STORY FROM THE ROLE]',
      summary: '[ONE LINE]',
      draft: true,
    },

    // Beyond the role: the outlets.
    {
      id: 'lab',
      kind: 'output',
      column: 'beyond',
      row: 3,
      kicker: 'Beyond · lab',
      title: 'Lab',
      summary: 'Apps and experiments on tech.kevinhyde.com',
      glyph: 'signal',
      href: '/lab',
      feed: { source: 'tech-apps', url: 'https://tech.kevinhyde.com/apps.json', limit: 3 },
    },
    {
      id: 'writing',
      kind: 'output',
      column: 'beyond',
      row: 4,
      kicker: 'Beyond · writing',
      title: 'Writing',
      summary: 'Notes and essays on blog.kevinhyde.com',
      glyph: 'pages',
      href: 'https://blog.kevinhyde.com',
      feed: { source: 'rss', url: 'https://blog.kevinhyde.com/rss.xml', limit: 1 },
    },
    {
      id: 'studio',
      kind: 'output',
      column: 'beyond',
      row: 5,
      kicker: 'Beyond · studio',
      title: 'Dismal Nitch',
      summary: 'Music and recording studio',
      glyph: 'wave',
      href: 'https://music.kevinhyde.com',
    },
  ],

  edges: [
    { from: 'cisco', to: 'swivel', style: 'spine' },
    { from: 'swivel', to: 'voltron', style: 'spine' },
    { from: 'voltron', to: 'adobe-graph', style: 'spine' },
    { from: 'craft', to: 'adobe-graph' },
    { from: 'interests', to: 'adobe-graph' },
    { from: 'reading', to: 'adobe-graph' },
    { from: 'adobe-graph', to: 'role-architecture' },
    { from: 'adobe-graph', to: 'role-leadership' },
    { from: 'adobe-graph', to: 'lab' },
    { from: 'adobe-graph', to: 'writing' },
    { from: 'adobe-graph', to: 'studio' },
  ],

  stops: [
    { id: 'origins', label: 'Origins', target: 'earlier-1' },
    { id: 'inputs', label: 'Inputs', target: 'inputs' },
    { id: 'now', label: 'Now', target: 'adobe-graph' },
    { id: 'outputs', label: 'Outputs', target: 'role' },
  ],
  initialStop: 'now',
});
