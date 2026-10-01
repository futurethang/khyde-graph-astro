import { LitElement } from 'lit';

/**
 * <kh-wordmark> — PHASE 3. The name as constrained, draggable letter-nodes.
 *
 * Contract (see docs/phases/3-signature-details.md and design M/N):
 * - The page ships `<kh-wordmark><h1>Kevin Hyde</h1></kh-wordmark>` as plain text.
 *   That text is the LCP element; nothing here may delay or shift it.
 * - After `document.fonts.ready`, split the h1 into one span per letter
 *   (keep an sr-only copy of the full name), measure each, then position.
 * - Drag a letter within ±24px x / ±56px y with a tanh rubber band.
 *   Order can never change, so the name always reads.
 * - Wires run centre to centre as S-curves (flat tangents), visible only
 *   while a letter is displaced. "Reassemble" springs them home.
 * - Arrow keys move a focused letter; prefers-reduced-motion = static.
 *
 * Until then this is a no-op so the h1 renders untouched.
 */
export class KhWordmark extends LitElement {
  protected override createRenderRoot() {
    return this;
  }
}

customElements.define('kh-wordmark', KhWordmark);
