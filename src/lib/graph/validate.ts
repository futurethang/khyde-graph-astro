import { GraphSchema, type Graph, type GraphInput } from './schema';
import { columnIndex, layoutGraph, pointAt, yAtX, type Box, type Breakpoint, type Wire } from './layout';

export interface GraphIssue {
  code:
    | 'column-duplicate'
    | 'column-order'
    | 'node-duplicate'
    | 'node-column'
    | 'node-row'
    | 'node-position'
    | 'edge-endpoint'
    | 'edge-duplicate'
    | 'edge-direction'
    | 'stop-target'
    | 'wire-crossing'
    | 'wire-through-card';
  message: string;
}

/** Semantic checks the schema can't express. Returns [] when the graph is valid. */
export function validateGraph(graph: Graph): GraphIssue[] {
  const issues: GraphIssue[] = [];
  const push = (code: GraphIssue['code'], message: string) => issues.push({ code, message });

  // Columns: unique ids, orders 1..n per side.
  const colIds = new Set<string>();
  for (const c of graph.columns) {
    if (colIds.has(c.id)) push('column-duplicate', `Column "${c.id}" is defined twice.`);
    colIds.add(c.id);
  }
  for (const side of ['left', 'right'] as const) {
    const orders = graph.columns.filter((c) => c.side === side).map((c) => c.order).sort((a, b) => a - b);
    orders.forEach((o, i) => {
      if (o !== i + 1) push('column-order', `${side} columns must be ordered 1..${orders.length} with no gaps or repeats (got ${orders.join(', ')}).`);
    });
  }

  // Nodes: unique ids, valid column and row, one node per cell.
  const nodeIds = new Set<string>([graph.focus.id]);
  const cells = new Map<string, string>();
  for (const n of graph.nodes) {
    if (nodeIds.has(n.id)) push('node-duplicate', `Node id "${n.id}" is used more than once (or matches the focus id).`);
    nodeIds.add(n.id);
    if (!colIds.has(n.column)) push('node-column', `Node "${n.id}" is in unknown column "${n.column}".`);
    if (n.row > graph.rows) push('node-row', `Node "${n.id}" is on row ${n.row}, but the graph has ${graph.rows} rows.`);
    const cell = `${n.column}:${n.row}`;
    const taken = cells.get(cell);
    if (taken) push('node-position', `Nodes "${taken}" and "${n.id}" share column "${n.column}", row ${n.row}.`);
    cells.set(cell, n.id);
  }

  // Edges: known endpoints, no duplicates, always left to right.
  const seen = new Set<string>();
  const nodeColumn = (id: string) => (id === graph.focus.id ? graph.focus.id : graph.nodes.find((n) => n.id === id)?.column);
  for (const e of graph.edges) {
    const key = `${e.from}->${e.to}`;
    if (seen.has(key)) push('edge-duplicate', `Edge ${key} is listed twice.`);
    seen.add(key);
    const fromCol = nodeColumn(e.from);
    const toCol = nodeColumn(e.to);
    if (!fromCol || !toCol) {
      push('edge-endpoint', `Edge ${key} points at a node that doesn't exist.`);
      continue;
    }
    if (!colIds.has(fromCol) && fromCol !== graph.focus.id) continue; // reported above
    if (!colIds.has(toCol) && toCol !== graph.focus.id) continue;
    if (columnIndex(graph, fromCol) >= columnIndex(graph, toCol)) {
      push('edge-direction', `Edge ${key} must run left to right (from a column further left than its target).`);
    }
  }

  // Stops.
  for (const s of graph.stops) {
    if (s.target !== graph.focus.id && !colIds.has(s.target)) push('stop-target', `Stop "${s.id}" targets unknown column "${s.target}".`);
  }
  if (!graph.stops.some((s) => s.id === graph.initialStop)) push('stop-target', `initialStop "${graph.initialStop}" is not one of the stops.`);

  // Geometry only makes sense once the structure is sound.
  if (issues.length === 0) {
    for (const bp of ['wide', 'medium'] as Breakpoint[]) {
      for (const includeDrafts of [true, false]) {
        issues.push(...geometryIssues(graph, bp, includeDrafts));
      }
    }
  }

  // De-duplicate identical messages from the repeated geometry passes.
  return issues.filter((issue, i, all) => all.findIndex((o) => o.message === issue.message) === i);
}

function geometryIssues(graph: Graph, bp: Breakpoint, includeDrafts: boolean): GraphIssue[] {
  const issues: GraphIssue[] = [];
  const layout = layoutGraph(graph, bp, { includeDrafts });
  const { wires } = layout;

  // Crossing: two wires that don't share a node swap vertical order somewhere.
  for (let i = 0; i < wires.length; i++) {
    for (let j = i + 1; j < wires.length; j++) {
      const a = wires[i]!, b = wires[j]!;
      if (sharesNode(a, b)) continue;
      const lo = Math.max(a.start.x, b.start.x);
      const hi = Math.min(a.end.x, b.end.x);
      if (hi - lo < 1) continue;
      let sign = 0;
      for (let s = 1; s < 24; s++) {
        const x = lo + ((hi - lo) * s) / 24;
        const diff = yAtX(a, x) - yAtX(b, x);
        if (Math.abs(diff) < 0.5) continue;
        const sg = Math.sign(diff);
        if (sign !== 0 && sg !== sign) {
          issues.push({ code: 'wire-crossing', message: `Wires ${a.id} and ${b.id} cross (${bp} layout). Move one node to another row.` });
          break;
        }
        sign = sg;
      }
    }
  }

  // Through a card: a wire passes over a card that isn't one of its ends.
  const boxes: (Box & { id: string })[] = [layout.focus, ...layout.nodes];
  for (const w of wires) {
    for (const box of boxes) {
      if (box.id === w.from || box.id === w.to) continue;
      for (let s = 1; s < 48; s++) {
        const p = pointAt(w, s / 48);
        if (p.x > box.x + 2 && p.x < box.x + box.w - 2 && p.y > box.y + 2 && p.y < box.y + box.h - 2) {
          issues.push({ code: 'wire-through-card', message: `Wire ${w.id} runs through "${box.id}" (${bp} layout). Leave that lane empty or move a node.` });
          break;
        }
      }
    }
  }
  return issues;
}

function sharesNode(a: Wire, b: Wire): boolean {
  return a.from === b.from || a.from === b.to || a.to === b.from || a.to === b.to;
}

/** Parse + validate; throws one readable error listing every problem. */
export function loadGraph(input: GraphInput): Graph {
  const parsed = GraphSchema.safeParse(input);
  if (!parsed.success) {
    throw new Error(`graph.config.ts doesn't match the schema:\n${parsed.error.message}`);
  }
  const issues = validateGraph(parsed.data);
  if (issues.length) {
    throw new Error(`graph.config.ts has ${issues.length} problem(s):\n- ${issues.map((i) => i.message).join('\n- ')}`);
  }
  return parsed.data;
}
