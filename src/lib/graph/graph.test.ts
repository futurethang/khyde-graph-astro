import { describe, expect, it } from 'vitest';
import config from '../../content/graph.config';
import { GraphSchema, type GraphInput } from './schema';
import { layoutGraph, METRICS, pointAt } from './layout';
import { loadGraph, validateGraph } from './validate';

const parse = (input: GraphInput) => GraphSchema.parse(input);
const clone = (): GraphInput => structuredClone(config);
const codes = (input: GraphInput) => validateGraph(parse(input)).map((i) => i.code);

describe('the site config', () => {
  it('passes the schema and every semantic rule', () => {
    expect(() => loadGraph(config)).not.toThrow();
  });

  it('opens on the focus', () => {
    const g = loadGraph(config);
    const stop = g.stops.find((s) => s.id === g.initialStop);
    expect(stop?.target).toBe(g.focus.id);
  });
});

describe('layoutGraph', () => {
  const g = loadGraph(config);

  for (const bp of ['wide', 'medium'] as const) {
    it(`centres the focus card on the origin (${bp})`, () => {
      const { focus } = layoutGraph(g, bp);
      const m = METRICS[bp];
      expect(focus).toMatchObject({ x: -m.focusW / 2, y: -m.focusH / 2 });
    });
  }

  it('places rows as evenly spaced lanes around y = 0', () => {
    const layout = layoutGraph(g, 'wide');
    const centres = new Set(layout.nodes.map((n) => n.y + n.h / 2));
    const m = METRICS.wide;
    for (const y of centres) expect(Math.abs(y) % m.rowPitch).toBe(0);
  });

  it('leaves drafts out unless asked', () => {
    const prod = layoutGraph(g, 'wide');
    const dev = layoutGraph(g, 'wide', { includeDrafts: true });
    expect(prod.nodes.some((n) => n.node.draft)).toBe(false);
    expect(dev.nodes.length).toBeGreaterThan(prod.nodes.length);
    expect(prod.wires.every((w) => !w.to.startsWith('role-'))).toBe(true);
  });

  it('draws every wire left to right with flat tangents', () => {
    for (const w of layoutGraph(g, 'wide', { includeDrafts: true }).wires) {
      expect(w.end.x).toBeGreaterThan(w.start.x);
      const nearStart = pointAt(w, 0.01);
      const nearEnd = pointAt(w, 0.99);
      expect(Math.abs(nearStart.y - w.start.y)).toBeLessThan(0.5);
      expect(Math.abs(nearEnd.y - w.end.y)).toBeLessThan(0.5);
    }
  });

  it('keeps focus ports inside the focus card', () => {
    const layout = layoutGraph(g, 'wide', { includeDrafts: true });
    const { focus } = layout;
    for (const p of layout.ports.filter((p) => p.nodeId === g.focus.id)) {
      expect(p.y).toBeGreaterThan(focus.y);
      expect(p.y).toBeLessThan(focus.y + focus.h);
    }
  });

  it('is deterministic', () => {
    expect(layoutGraph(g, 'wide')).toEqual(layoutGraph(g, 'wide'));
  });
});

describe('validateGraph catches mistakes', () => {
  it('two nodes in one cell', () => {
    const c = clone();
    c.nodes[1]!.column = c.nodes[0]!.column;
    c.nodes[1]!.row = c.nodes[0]!.row;
    expect(codes(c)).toContain('node-position');
  });

  it('an edge to nowhere', () => {
    const c = clone();
    c.edges.push({ from: 'craft', to: 'nope' });
    expect(codes(c)).toContain('edge-endpoint');
  });

  it('an edge running right to left', () => {
    const c = clone();
    c.edges.push({ from: 'lab', to: 'craft' });
    expect(codes(c)).toContain('edge-direction');
  });

  it('a row outside the grid', () => {
    const c = clone();
    c.nodes[0]!.row = 99;
    expect(codes(c)).toContain('node-row');
  });

  it('crossing wires', () => {
    const c = clone();
    // Swap the rows of two inputs that both feed the focus, then cross-wire
    // them to outputs in the opposite order.
    c.edges.push({ from: 'craft', to: 'studio' }, { from: 'reading', to: 'role-architecture' });
    expect(codes(c)).toContain('wire-crossing');
  });

  it('a wire through a card', () => {
    const c = clone();
    // Lab sits two columns right of the focus; row 1 of the role column is occupied.
    const lab = c.nodes.find((n) => n.id === 'lab')!;
    lab.row = 1;
    c.nodes.find((n) => n.id === 'role-architecture')!.row = 3;
    expect(codes(c)).toContain('wire-through-card');
  });

  it('gaps in column order', () => {
    const c = clone();
    c.columns.find((col) => col.id === 'earlier-2')!.order = 5;
    expect(codes(c)).toContain('column-order');
  });
});
