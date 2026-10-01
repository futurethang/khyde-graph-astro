import { z } from 'zod';

/**
 * The graph config schema. `src/content/graph.config.ts` is validated against
 * this at build time (and in tests). Structural rules live here; semantic rules
 * (unique positions, edge direction, no crossing wires) live in validate.ts.
 */

const id = z
  .string()
  .regex(/^[a-z0-9][a-z0-9-]*$/, 'ids are lowercase kebab-case');

export const FeedSchema = z.discriminatedUnion('source', [
  z.object({
    source: z.literal('sanity'),
    /** Category key from src/lib/sanity/categories.ts */
    category: z.enum(['books', 'articles', 'blog', 'samples', 'art']),
    limit: z.number().int().positive().max(10).default(3),
    /** Hide dates once the newest item is older than this many days. */
    freshForDays: z.number().int().positive().default(180),
  }),
  z.object({
    source: z.literal('tech-apps'),
    url: z.url(),
    limit: z.number().int().positive().max(10).default(3),
    freshForDays: z.number().int().positive().default(180),
  }),
  z.object({
    source: z.literal('rss'),
    url: z.url(),
    limit: z.number().int().positive().max(10).default(1),
    freshForDays: z.number().int().positive().default(180),
  }),
]);

export const LinkSchema = z.union([
  /** Internal page, e.g. "/work/cisco" */
  z.string().startsWith('/'),
  /** External site, e.g. "https://tech.kevinhyde.com" */
  z.url(),
]);

export const ColumnSchema = z.object({
  id,
  side: z.enum(['left', 'right']),
  /** 1 = adjacent to the focus, 2 = next out, and so on. */
  order: z.number().int().positive(),
  label: z.string().min(1),
});

export const NodeKind = z.enum(['history', 'input', 'output']);

export const DatesSchema = z.object({
  start: z.string().min(4),
  end: z.string().min(4).optional(),
});

export const NodeSchema = z.object({
  id,
  kind: NodeKind,
  column: id,
  /** 1-based row; rows are lanes shared across every column. */
  row: z.number().int().positive(),
  kicker: z.string().min(1),
  title: z.string().min(1),
  summary: z.string().min(1),
  href: LinkSchema.optional(),
  glyph: z
    .enum(['nodes', 'pages', 'signal', 'column', 'wave', 'code', 'shapes', 'book'])
    .optional(),
  dates: DatesSchema.optional(),
  feed: FeedSchema.optional(),
  /** Draft nodes render in `astro dev` only, never in production builds. */
  draft: z.boolean().default(false),
});

export const FocusSchema = z.object({
  id,
  kicker: z.string().min(1),
  title: z.string().min(1),
  summary: z.string().min(1),
  href: LinkSchema.optional(),
  cta: z.string().optional(),
});

export const EdgeStyle = z.enum(['default', 'spine', 'hot']);

export const EdgeSchema = z.object({
  from: id,
  to: id,
  style: EdgeStyle.default('default'),
});

export const StopSchema = z.object({
  id,
  label: z.string().min(1),
  /** Column id to centre on, or the focus id. */
  target: id,
});

export const GraphSchema = z.object({
  rows: z.number().int().min(1).max(8),
  focus: FocusSchema,
  columns: z.array(ColumnSchema).min(1),
  nodes: z.array(NodeSchema),
  edges: z.array(EdgeSchema),
  stops: z.array(StopSchema).min(1),
  /** The stop the page opens on. */
  initialStop: id,
});

export type GraphInput = z.input<typeof GraphSchema>;
export type Graph = z.output<typeof GraphSchema>;
export type GraphNode = z.output<typeof NodeSchema>;
export type GraphEdge = z.output<typeof EdgeSchema>;
export type GraphColumn = z.output<typeof ColumnSchema>;
export type Feed = z.output<typeof FeedSchema>;

/** Identity helper so the config file gets types and autocomplete. */
export function defineGraph(input: GraphInput): GraphInput {
  return input;
}
