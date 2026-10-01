import type { Graph, GraphNode } from './schema';

/**
 * Pure layout: config in, boxes + wire paths out. No DOM, no randomness.
 * Coordinates are in px with the focus card centred on (0, 0).
 *
 * Narrow screens (< 768px) don't use this: CSS stacks one column per
 * screen and draws only wire stubs. See docs/phases/2-graph-engine.md.
 */

export type Breakpoint = 'wide' | 'medium';

export interface Metrics {
  colPitch: number;
  cardW: number;
  cardH: number;
  rowPitch: number;
  focusW: number;
  focusH: number;
  /** Keeps the focus card's ports this far from its top and bottom edges. */
  portInset: number;
}

export const METRICS: Record<Breakpoint, Metrics> = {
  wide: { colPitch: 400, cardW: 280, cardH: 108, rowPitch: 132, focusW: 380, focusH: 360, portInset: 60 },
  medium: { colPitch: 320, cardW: 240, cardH: 108, rowPitch: 132, focusW: 300, focusH: 360, portInset: 60 },
};

export interface Box {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface LaidOutNode extends Box {
  id: string;
  node: GraphNode;
  colIndex: number;
}

export interface Point {
  x: number;
  y: number;
}

export interface Wire {
  id: string;
  from: string;
  to: string;
  style: 'default' | 'spine' | 'hot';
  start: Point;
  end: Point;
  /** SVG path data, a cubic with flat tangents at both ends. */
  d: string;
}

export interface Port extends Point {
  nodeId: string;
  side: 'in' | 'out';
}

export interface LaidOutColumn {
  id: string;
  label: string;
  index: number;
  /** Centre x of the column. */
  x: number;
}

export interface LaidOutStop {
  id: string;
  label: string;
  x: number;
}

export interface Layout {
  breakpoint: Breakpoint;
  metrics: Metrics;
  focus: Box & { id: string };
  nodes: LaidOutNode[];
  wires: Wire[];
  ports: Port[];
  columns: LaidOutColumn[];
  stops: LaidOutStop[];
  bounds: { minX: number; maxX: number; minY: number; maxY: number };
}

export interface LayoutOptions {
  /** Include `draft: true` nodes (dev builds). Default false. */
  includeDrafts?: boolean;
}

export function columnIndex(graph: Graph, columnId: string): number {
  if (columnId === graph.focus.id) return 0;
  const col = graph.columns.find((c) => c.id === columnId);
  if (!col) throw new Error(`Unknown column "${columnId}"`);
  return col.side === 'left' ? -col.order : col.order;
}

export function rowY(graph: Graph, row: number, m: Metrics): number {
  return (row - (graph.rows + 1) / 2) * m.rowPitch;
}

/** Where a wire meets the focus card, for a partner node at `y`. */
export function focusPortY(graph: Graph, y: number, m: Metrics): number {
  const span = (graph.rows - 1) * m.rowPitch;
  if (span === 0) return 0;
  const k = Math.min(1, (m.focusH - 2 * m.portInset) / span);
  return y * k;
}

export function curve(start: Point, end: Point): string {
  const c = (end.x - start.x) / 2;
  return `M${start.x} ${start.y} C ${start.x + c} ${start.y}, ${end.x - c} ${end.y}, ${end.x} ${end.y}`;
}

/** Point on a wire's cubic at parameter t in [0, 1]. */
export function pointAt(w: Pick<Wire, 'start' | 'end'>, t: number): Point {
  const c = (w.end.x - w.start.x) / 2;
  const p0 = w.start;
  const p1 = { x: w.start.x + c, y: w.start.y };
  const p2 = { x: w.end.x - c, y: w.end.y };
  const p3 = w.end;
  const u = 1 - t;
  const a = u * u * u, b = 3 * u * u * t, d = 3 * u * t * t, e = t * t * t;
  return {
    x: a * p0.x + b * p1.x + d * p2.x + e * p3.x,
    y: a * p0.y + b * p1.y + d * p2.y + e * p3.y,
  };
}

/** y of a wire at a given x (x is monotone along these curves). */
export function yAtX(w: Pick<Wire, 'start' | 'end'>, x: number): number {
  let lo = 0, hi = 1;
  for (let i = 0; i < 40; i++) {
    const mid = (lo + hi) / 2;
    if (pointAt(w, mid).x < x) lo = mid;
    else hi = mid;
  }
  return pointAt(w, (lo + hi) / 2).y;
}

export function visibleNodes(graph: Graph, opts: LayoutOptions = {}): GraphNode[] {
  return graph.nodes.filter((n) => opts.includeDrafts || !n.draft);
}

export function layoutGraph(graph: Graph, breakpoint: Breakpoint, opts: LayoutOptions = {}): Layout {
  const m = METRICS[breakpoint];
  const focus = { id: graph.focus.id, x: -m.focusW / 2, y: -m.focusH / 2, w: m.focusW, h: m.focusH };

  const nodes: LaidOutNode[] = visibleNodes(graph, opts).map((node) => {
    const colIndex = columnIndex(graph, node.column);
    const cx = colIndex * m.colPitch;
    const cy = rowY(graph, node.row, m);
    return { id: node.id, node, colIndex, x: cx - m.cardW / 2, y: cy - m.cardH / 2, w: m.cardW, h: m.cardH };
  });
  const byId = new Map(nodes.map((n) => [n.id, n]));
  const isFocus = (id: string) => id === graph.focus.id;

  const wires: Wire[] = [];
  for (const edge of graph.edges) {
    const a = byId.get(edge.from);
    const b = byId.get(edge.to);
    if ((!a && !isFocus(edge.from)) || (!b && !isFocus(edge.to))) continue; // hidden draft endpoint
    const aY = a ? a.y + a.h / 2 : 0;
    const bY = b ? b.y + b.h / 2 : 0;
    const start: Point = a
      ? { x: a.x + a.w, y: aY }
      : { x: focus.x + focus.w, y: focusPortY(graph, bY, m) };
    const end: Point = b
      ? { x: b.x, y: bY }
      : { x: focus.x, y: focusPortY(graph, aY, m) };
    wires.push({
      id: `${edge.from}->${edge.to}`,
      from: edge.from,
      to: edge.to,
      style: edge.style,
      start,
      end,
      d: curve(start, end),
    });
  }

  const portKey = (p: Port) => `${p.nodeId}:${p.side}:${p.x}:${p.y}`;
  const portMap = new Map<string, Port>();
  for (const w of wires) {
    for (const p of [
      { ...w.start, nodeId: w.from, side: 'out' as const },
      { ...w.end, nodeId: w.to, side: 'in' as const },
    ]) {
      portMap.set(portKey(p), p);
    }
  }

  const columns: LaidOutColumn[] = graph.columns
    .map((c) => {
      const index = columnIndex(graph, c.id);
      return { id: c.id, label: c.label, index, x: index * m.colPitch };
    })
    .sort((p, q) => p.index - q.index);

  const stops: LaidOutStop[] = graph.stops.map((s) => ({
    id: s.id,
    label: s.label,
    x: columnIndex(graph, s.target) * m.colPitch,
  }));

  const boxes: Box[] = [focus, ...nodes];
  const bounds = {
    minX: Math.min(...boxes.map((b) => b.x)),
    maxX: Math.max(...boxes.map((b) => b.x + b.w)),
    minY: Math.min(...boxes.map((b) => b.y)),
    maxY: Math.max(...boxes.map((b) => b.y + b.h)),
  };

  return { breakpoint, metrics: m, focus, nodes, wires, ports: [...portMap.values()], columns, stops, bounds };
}
