import { LitElement } from 'lit';

/**
 * <kh-graph> upgrades the server-rendered graph in place (light DOM, no
 * template). Without it the graph still works: native scroll-snap panning,
 * anchor links for stops, static wires.
 *
 * Adds:
 * - drag-to-pan for mouse users (touch and trackpads already scroll natively)
 * - aria-current on the stop links, kept in sync with the scroll position
 * - Left / Right arrow keys move between stops
 * - hovering or focusing a node highlights its wires
 */
export class KhGraph extends LitElement {
  static override properties = {
    initialStop: { attribute: 'initial-stop' },
  };

  declare initialStop: string;

  #stage?: HTMLElement;
  #drag?: { x: number; scroll: number; moved: boolean };
  #ac?: AbortController;

  protected override createRenderRoot() {
    return this; // light DOM: Astro already rendered the markup
  }

  override connectedCallback() {
    super.connectedCallback();
    this.#stage = this.querySelector<HTMLElement>('[data-stage]') ?? undefined;
    if (!this.#stage) return;
    this.#ac = new AbortController();
    const opts = { signal: this.#ac.signal };
    const stage = this.#stage;

    stage.addEventListener('pointerdown', this.#onPointerDown, opts);
    window.addEventListener('pointermove', this.#onPointerMove, opts);
    window.addEventListener('pointerup', this.#onPointerUp, opts);
    stage.addEventListener('click', this.#onClickCapture, { ...opts, capture: true });
    stage.addEventListener('scrollend', this.#syncCurrent, opts);
    stage.addEventListener('keydown', this.#onKeyDown, opts);
    this.addEventListener('pointerover', this.#onHover, opts);
    this.addEventListener('focusin', this.#onHover, opts);
    this.addEventListener('pointerout', this.#clearHot, opts);
    this.addEventListener('focusout', this.#clearHot, opts);
    this.querySelectorAll<HTMLAnchorElement>('[data-stop-link]').forEach((a) =>
      a.addEventListener('click', (e) => {
        e.preventDefault();
        this.goTo(a.dataset.stopLink!);
      }, opts),
    );
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
    this.#ac?.abort();
  }

  /** Smooth-scroll the stage so the given stop is centred. */
  goTo(stopId: string) {
    const stage = this.#stage;
    const marker = this.querySelector<HTMLElement>(`[data-stop="${stopId}"]`);
    if (!stage || !marker) return;
    const r = marker.getBoundingClientRect();
    const s = stage.getBoundingClientRect();
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    stage.scrollBy({ left: r.left + r.width / 2 - (s.left + s.width / 2), behavior: reduce ? 'auto' : 'smooth' });
  }

  #stopIds(): string[] {
    return [...this.querySelectorAll<HTMLElement>('[data-stop]')]
      .sort((a, b) => a.getBoundingClientRect().left - b.getBoundingClientRect().left)
      .map((el) => el.dataset.stop!);
  }

  #currentStop(): string | undefined {
    const stage = this.#stage;
    if (!stage) return;
    const s = stage.getBoundingClientRect();
    const centre = s.left + s.width / 2;
    let best: { id: string; d: number } | undefined;
    this.querySelectorAll<HTMLElement>('[data-stop]').forEach((el) => {
      const r = el.getBoundingClientRect();
      const d = Math.abs(r.left + r.width / 2 - centre);
      if (!best || d < best.d) best = { id: el.dataset.stop!, d };
    });
    return best?.id;
  }

  #syncCurrent = () => {
    const current = this.#currentStop();
    this.querySelectorAll<HTMLElement>('[data-stop-link]').forEach((a) => {
      if (a.dataset.stopLink === current) a.setAttribute('aria-current', 'true');
      else a.removeAttribute('aria-current');
    });
  };

  #onKeyDown = (e: KeyboardEvent) => {
    if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
    const ids = this.#stopIds();
    const i = ids.indexOf(this.#currentStop() ?? '');
    const next = ids[Math.max(0, Math.min(ids.length - 1, i + (e.key === 'ArrowRight' ? 1 : -1)))];
    if (next) {
      e.preventDefault();
      this.goTo(next);
    }
  };

  #onPointerDown = (e: PointerEvent) => {
    if (e.pointerType !== 'mouse' || e.button !== 0 || !this.#stage) return;
    this.#drag = { x: e.clientX, scroll: this.#stage.scrollLeft, moved: false };
  };

  #onPointerMove = (e: PointerEvent) => {
    const d = this.#drag;
    const stage = this.#stage;
    if (!d || !stage) return;
    const dx = e.clientX - d.x;
    if (!d.moved && Math.abs(dx) < 6) return;
    d.moved = true;
    stage.dataset.dragging = '';
    stage.scrollLeft = d.scroll - dx;
  };

  #onPointerUp = () => {
    const stage = this.#stage;
    if (!this.#drag || !stage) return;
    const moved = this.#drag.moved;
    this.#drag = undefined;
    if (moved) {
      delete stage.dataset.dragging; // re-enabling snap settles on the nearest stop
      this.#suppressClick = true;
      setTimeout(() => (this.#suppressClick = false), 0);
    }
  };

  #suppressClick = false;
  #onClickCapture = (e: MouseEvent) => {
    if (this.#suppressClick) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  #onHover = (e: Event) => {
    const node = (e.target as Element).closest<HTMLElement>('[data-node]');
    this.#clearHot();
    if (!node) return;
    const id = node.dataset.node!;
    node.dataset.hot = '';
    this.querySelectorAll<SVGPathElement>(`.wires path[data-from="${id}"], .wires path[data-to="${id}"]`).forEach((p) =>
      p.setAttribute('data-hot', ''),
    );
  };

  #clearHot = () => {
    this.querySelectorAll('[data-hot]').forEach((el) => el.removeAttribute('data-hot'));
  };
}

customElements.define('kh-graph', KhGraph);

declare global {
  interface HTMLElementTagNameMap {
    'kh-graph': KhGraph;
  }
}
