import { LitElement, css, html, nothing } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import type { TemplateResult } from 'lit';
import { frameworkClasses } from './previewClasses';

/**
 * Storybook-only inspector for the Layout pages. Click any element on the stage to
 * read the classes it actually carries, walk up to its parents through the
 * breadcrumbs, and unfold the markup as a collapsible tree.
 *
 * Two deliberate deviations from the rest of the repo, both because this is tooling
 * and not a design-system component:
 *
 * - It is `<layout-inspector>`, not `<ibk-…>`, and it is never exported from
 *   `src/index.ts` or `components-list.ts`. It exists only where a story imports it.
 * - It is the one element here that *keeps* its shadow root instead of
 *   `createRenderRoot() { return this }`. The story content stays in the light DOM
 *   (so `ides.css` styles it exactly as it would on a real page) while the
 *   inspector's own chrome is sealed inside the shadow root and cannot leak a single
 *   rule into the layout it is measuring.
 *
 * The highlight is an inline `outline`, saved and restored per element: `outline`
 * never affects layout, so nothing shifts while inspecting, and no global helper
 * class has to exist that could be mistaken for a framework class.
 */

/**
 * Inspect mode is shared by every inspector on the page. A docs page renders one
 * per story, and toggling ten of them separately to read one class would be absurd -
 * so the toggle is global and each instance follows it.
 *
 * Off at load on purpose: the pages stay fully interactive (buttons, selects, and
 * the drag handles on the resizable frames) until inspection is actually asked for.
 */
let sharedActive = false;

const TOGGLE_EVENT = 'layout-inspector-toggle';

/** Direct text of an element, ignoring the text of its children. */
const ownText = (el: Element) =>
  Array.from(el.childNodes)
    .filter((node): node is Text => node.nodeType === Node.TEXT_NODE)
    .map((node) => node.data)
    .join('')
    .replace(/\s+/g, ' ')
    .trim();

/** `div.ibk-stack.gap-spacing-8` — the shape a developer reads as a selector. */
const describe = (el: Element) => {
  const all = Array.from(el.classList);
  const classes = frameworkClasses(el);
  return {
    classes,
    /** How many preview-only classes were dropped, to tell "none" from "hidden". */
    hidden: all.length - classes.length,
    label: el.tagName.toLowerCase() + classes.map((c) => `.${c}`).join(''),
  };
};

/** Depth at which the tree stops recursing - a table would otherwise unfold every cell. */
const MAX_DEPTH = 7;

/** Children listed per node before the rest is summarised. */
const MAX_CHILDREN = 24;

/** Nodes shallower than this start unfolded; deeper ones start collapsed. */
const OPEN_UNTIL = 2;

@customElement('layout-inspector')
export class LayoutInspector extends LitElement {
  @state() private _active = sharedActive;

  @state() private _selected: Element | null = null;

  @state() private _showHtml = false;

  /** Element under the pointer, kept so its outline can be cleared again. */
  private _hovered: Element | null = null;

  /**
   * Re-reads the computed layout while the selection changes size, so the numbers
   * stay true while a resizable frame is being dragged rather than freezing at
   * whatever they were when the element was clicked.
   */
  private _resizeObserver?: ResizeObserver;

  /** Inline outline values overwritten by the highlight, per element. */
  private _saved = new WeakMap<Element, { outline: string; offset: string }>();

  static styles = css`
    :host {
      display: block;
    }

    .bar {
      align-items: center;
      display: flex;
      flex-wrap: wrap;
      font-family: 'Asap', sans-serif;
      font-size: 0.8125rem;
      gap: 0.5rem;
      margin-block-end: 0.75rem;
    }

    button {
      background-color: #fff;
      border: 1px solid #bdbdbd;
      border-radius: 0.375rem;
      color: #2e2e2e;
      cursor: pointer;
      font: inherit;
      padding: 0.25rem 0.625rem;
    }

    button:hover {
      border-color: #6b6b6b;
    }

    button:focus-visible {
      outline: 2px solid #425563;
      outline-offset: 2px;
    }

    .toggle {
      align-items: center;
      display: inline-flex;
      font-weight: 600;
      gap: 0.375rem;
    }

    .toggle.on {
      background-color: #425563;
      border-color: #425563;
      color: #fff;
    }

    .dot {
      background-color: #bdbdbd;
      block-size: 0.5rem;
      border-radius: 50%;
      inline-size: 0.5rem;
    }

    .toggle.on .dot {
      background-color: #8ce99a;
    }

    .hint {
      color: #6b6b6b;
    }

    /* Sticky, so the readout stays in view while scrolling a long story. */
    .panel {
      background-color: #fff;
      border: 1px solid #bdbdbd;
      border-radius: 0.375rem;
      bottom: 0;
      display: grid;
      font-family: 'Asap', sans-serif;
      font-size: 0.8125rem;
      gap: 0.5rem;
      margin-block-start: 0.75rem;
      padding: 0.75rem;
      position: sticky;
      z-index: 5;
    }

    .row {
      align-items: baseline;
      display: grid;
      gap: 0.25rem 0.75rem;
      grid-template-columns: 4.5rem minmax(0, 1fr);
    }

    .rowLabel {
      color: #6b6b6b;
      font-size: 0.75rem;
      text-transform: uppercase;
    }

    code {
      font-family: ui-monospace, 'SFMono-Regular', 'Consolas', monospace;
      overflow-wrap: anywhere;
    }

    .element {
      color: #425563;
      font-weight: 600;
    }

    .classes {
      background-color: #f0f0f0;
      border-radius: 0.25rem;
      padding: 0.125rem 0.375rem;
    }

    .muted {
      color: #6b6b6b;
      font-style: italic;
    }

    .cell {
      align-items: center;
      display: flex;
      flex-wrap: wrap;
      gap: 0.25rem;
    }

    .chip {
      font-family: ui-monospace, 'SFMono-Regular', 'Consolas', monospace;
      font-size: 0.75rem;
      max-inline-size: 22rem;
      overflow: hidden;
      padding: 0.0625rem 0.375rem;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .sep {
      color: #bdbdbd;
    }

    .facts {
      display: flex;
      flex-wrap: wrap;
      gap: 0.25rem;
    }

    .fact {
      background-color: #f0f0f0;
      border-radius: 0.25rem;
      font-size: 0.75rem;
      max-inline-size: 26rem;
      overflow: hidden;
      padding: 0.125rem 0.375rem;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .factName {
      color: #6b6b6b;
    }

    .factName::after {
      content: ':';
    }

    .tree {
      font-size: 0.75rem;
      max-block-size: 22rem;
      overflow: auto;
    }

    /* One indent step per level. The nesting itself accumulates the offset, so the
       step stays constant instead of being computed from the depth. */
    details > *:not(summary),
    .leaf {
      padding-inline-start: 0.875rem;
    }

    /* summary keeps its default display: list-item - a summary set to flex or grid
       loses the disclosure triangle - so the flex row goes on a span inside it. */
    summary {
      cursor: pointer;
    }

    .txt {
      color: #6b6b6b;
    }

    .more {
      color: #6b6b6b;
      font-style: italic;
      padding-inline-start: 0.875rem;
    }
  `;

  connectedCallback() {
    super.connectedCallback();
    // Capture phase: the selection click has to be read before it reaches a button
    // or a select on the stage.
    this.addEventListener('click', this._onClick, true);
    this.addEventListener('mousedown', this._onMouseDown, true);
    this.addEventListener('pointerover', this._onPointerOver, true);
    this.addEventListener('pointerout', this._onPointerOut, true);
    document.addEventListener('keydown', this._onKeyDown);
    window.addEventListener(TOGGLE_EVENT, this._onSharedToggle);
    this._active = sharedActive;
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.removeEventListener('click', this._onClick, true);
    this.removeEventListener('mousedown', this._onMouseDown, true);
    this.removeEventListener('pointerover', this._onPointerOver, true);
    this.removeEventListener('pointerout', this._onPointerOut, true);
    document.removeEventListener('keydown', this._onKeyDown);
    window.removeEventListener(TOGGLE_EVENT, this._onSharedToggle);
    this._resizeObserver?.disconnect();
    // Restore the hovered element only when it is not also the selected one:
    // restoring twice would find no saved entry the second time and blank out an
    // inline outline the element may have had of its own.
    if (this._hovered !== this._selected) this._highlight(this._hovered, null);
    this._highlight(this._selected, null);
  }

  private _onSharedToggle = () => {
    this._active = sharedActive;
    if (!this._active) this._setHovered(null);
  };

  private _setActive(next: boolean) {
    sharedActive = next;
    window.dispatchEvent(new Event(TOGGLE_EVENT));
  }

  /**
   * Deepest element under the pointer, or `null` when the event came from docs
   * chrome rather than from the story. `composedPath()[0]`, not `event.target`,
   * which a listener on the host sees retargeted to the host itself.
   *
   * Two shadow roots have to be excluded, not one: this inspector's own, and that
   * of any `<layout-code>` nested inside the stage. Its "Show code" button lives in
   * a different shadow root, so without this check inspect mode would swallow the
   * click and the code box could never be opened.
   */
  private _stageTarget(event: Event): Element | null {
    const target = event.composedPath()[0];
    if (!(target instanceof Element)) return null;
    const root = target.getRootNode();
    if (
      root instanceof ShadowRoot &&
      (root === this.shadowRoot || root.host.localName === 'layout-code')
    ) {
      return null;
    }
    return target === this ? null : target;
  }

  private _onClick = (event: Event) => {
    if (!this._active) return;
    const target = this._stageTarget(event);
    if (!target) return;
    // Suppressed rather than let through: while inspecting, a click means
    // "tell me about this", not "press this".
    event.preventDefault();
    event.stopPropagation();
    this._select(target);
  };

  /**
   * A native control opens on mousedown, before any click arrives, so that one needs
   * suppressing too. Limited to form controls on purpose: the resizable frames in
   * these stories are dragged with mousedown on a plain div, and blanket suppression
   * would freeze the handles.
   */
  private _onMouseDown = (event: Event) => {
    if (!this._active) return;
    const target = this._stageTarget(event);
    if (target?.closest('button, input, select, textarea, a, [role="button"]')) {
      event.preventDefault();
      event.stopPropagation();
    }
  };

  private _onPointerOver = (event: Event) => {
    if (!this._active) return;
    const target = this._stageTarget(event);
    if (!target || target === this._hovered) return;
    this._setHovered(target);
  };

  private _onPointerOut = (event: Event) => {
    if (!this._active || !this._hovered) return;
    if (this._stageTarget(event) === this._hovered) this._setHovered(null);
  };

  private _onKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Escape' && this._active) this._setActive(false);
  };

  private _setHovered(next: Element | null) {
    if (this._hovered !== this._selected) this._highlight(this._hovered, null);
    this._hovered = next;
    if (next && next !== this._selected) this._highlight(next, '1px dashed #425563');
  }

  private _select(next: Element) {
    if (this._selected !== next) this._highlight(this._selected, null);
    this._selected = next;
    this._highlight(next, '2px solid #425563');
    this._observe(next);
  }

  private _clear() {
    if (this._selected !== this._hovered) this._highlight(this._selected, null);
    this._selected = null;
    this._showHtml = false;
    this._observe(null);
  }

  private _observe(el: Element | null) {
    this._resizeObserver?.disconnect();
    if (!el) return;
    // Safe against a resize loop: the panel is never the observed element, and
    // re-rendering it does not change the size of what is being measured.
    this._resizeObserver = new ResizeObserver(() => this.requestUpdate());
    this._resizeObserver.observe(el);
  }

  /**
   * The resolved layout of the selection - what the classes actually did. This is
   * the row that answers "why is this one taller?": the size is measured, so two
   * tiles can be compared directly, and `align-items: normal` vs `start` is the
   * whole difference between a stretched row of cards and a ragged one.
   *
   * Read through `getPropertyValue` with a physical fallback: logical properties
   * are what the stylesheets are authored in, but not every engine reports them
   * back from `getComputedStyle`.
   */
  private _layout(el: Element): Array<[string, string]> {
    const style = getComputedStyle(el);
    const read = (prop: string, fallback?: string) =>
      style.getPropertyValue(prop) || (fallback ? style.getPropertyValue(fallback) : '');

    const box = el.getBoundingClientRect();
    const round = (n: number) => Math.round(n * 10) / 10;
    const facts: Array<[string, string]> = [
      ['size', `${round(box.width)} × ${round(box.height)} px`],
      ['display', style.display],
    ];

    const isFlex = style.display.includes('flex');
    const isGrid = style.display.includes('grid');

    if (isFlex) {
      facts.push(['flex-direction', style.flexDirection], ['flex-wrap', style.flexWrap]);
    }
    if (isGrid) {
      // The resolved track list - an auto-fit grid reports the columns it actually
      // built, which is how many fit at this width.
      facts.push(['grid-template-columns', style.gridTemplateColumns]);
    }
    if (isFlex || isGrid) {
      facts.push(
        ['gap', style.gap],
        ['align-items', style.alignItems],
        ['justify-content', style.justifyContent],
      );
    }

    // How this element behaves as a child, which is where a Sidebar column or a
    // .ibk-cluster-grow child gets its width from.
    const parent = el.parentElement;
    if (parent && getComputedStyle(parent).display.includes('flex')) {
      facts.push(['flex', `${style.flexGrow} ${style.flexShrink} ${style.flexBasis}`]);
    }

    const maxInline = read('max-inline-size', 'max-width');
    if (maxInline && maxInline !== 'none') facts.push(['max-inline-size', maxInline]);

    const minInline = read('min-inline-size', 'min-width');
    if (minInline && minInline !== '0px' && minInline !== 'auto') {
      facts.push(['min-inline-size', minInline]);
    }

    return facts;
  }

  /**
   * Applies or removes the outline, restoring whatever inline value the element had
   * before. `outline-offset: -2px` draws the ring inside the box, so a highlighted
   * element never overlaps its neighbours.
   */
  private _highlight(el: Element | null, outline: string | null) {
    if (!(el instanceof HTMLElement)) return;
    if (outline) {
      if (!this._saved.has(el)) {
        this._saved.set(el, { outline: el.style.outline, offset: el.style.outlineOffset });
      }
      el.style.outline = outline;
      el.style.outlineOffset = '-2px';
      return;
    }
    const saved = this._saved.get(el);
    el.style.outline = saved?.outline ?? '';
    el.style.outlineOffset = saved?.offset ?? '';
    this._saved.delete(el);
  }

  /**
   * Ancestors between the stage root and the selection, outermost first.
   * `<layout-code>` wrappers are left out: they are docs plumbing, and listing them
   * as parents would suggest the layout depends on them.
   */
  private _parents(el: Element): Element[] {
    const chain: Element[] = [];
    let node = el.parentElement;
    while (node && node !== this) {
      if (node.localName !== 'layout-code') chain.unshift(node);
      node = node.parentElement;
    }
    return chain;
  }

  private async _copy(text: string) {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // Clipboard access is blocked in some embedding contexts. The value is on
      // screen and selectable either way, so a failure needs no error state.
    }
  }

  /** Clickable label for an element, used in the breadcrumbs, children and tree. */
  private _chip(el: Element) {
    const { label } = describe(el);
    return html`
      <button
        class="chip"
        title=${label}
        @click=${(event: Event) => {
          // A chip inside <summary> would otherwise fold the node it points at.
          event.preventDefault();
          event.stopPropagation();
          this._select(el);
        }}
      >
        ${label}
      </button>
    `;
  }

  private _renderTree(el: Element, depth: number): TemplateResult {
    const children = Array.from(el.children);
    const text = ownText(el);
    const preview = text.length > 48 ? `${text.slice(0, 48)}…` : text;

    if (!children.length || depth >= MAX_DEPTH) {
      return html`
        <div class="leaf cell">
          ${this._chip(el)}
          ${children.length
            ? html`<span class="more">+${children.length} nested</span>`
            : preview
              ? html`<span class="txt">${preview}</span>`
              : nothing}
        </div>
      `;
    }

    const shown = children.slice(0, MAX_CHILDREN);
    return html`
      <details ?open=${depth < OPEN_UNTIL}>
        <summary>
          <span class="cell">
            ${this._chip(el)}
            <span class="txt">
              ${children.length} ${children.length === 1 ? 'child' : 'children'}
            </span>
          </span>
        </summary>
        ${shown.map((child) => this._renderTree(child, depth + 1))}
        ${children.length > shown.length
          ? html`<div class="more">+${children.length - shown.length} more</div>`
          : nothing}
      </details>
    `;
  }

  private _renderPanel(el: Element) {
    const { classes, hidden, label } = describe(el);
    const parents = this._parents(el);
    const children = Array.from(el.children);
    const classAttr = classes.join(' ');

    return html`
      <div class="panel">
        <div class="row">
          <span class="rowLabel">Element</span>
          <code class="element">${label}</code>
        </div>

        <div class="row">
          <span class="rowLabel">Class</span>
          <span class="cell">
            ${classes.length
              ? html`
                  <code class="classes">${classAttr}</code>
                  <button @click=${() => this._copy(classAttr)}>Copy</button>
                `
              : hidden
                ? html`
                    <span class="muted">
                      no IDES class here — this element only carries preview styling. The
                      arrangement is on a parent.
                    </span>
                  `
                : html`<span class="muted">no class on this element</span>`}
          </span>
        </div>

        <div class="row">
          <span class="rowLabel">Layout</span>
          <span class="facts">
            ${this._layout(el).map(
              ([prop, value]) => html`
                <code class="fact"><span class="factName">${prop}</span> ${value}</code>
              `,
            )}
          </span>
        </div>

        ${parents.length
          ? html`
              <div class="row">
                <span class="rowLabel">Parents</span>
                <span class="cell">
                  ${parents.map(
                    (parent, i) => html`
                      ${this._chip(parent)}
                      ${i < parents.length - 1 ? html`<span class="sep">›</span>` : nothing}
                    `,
                  )}
                </span>
              </div>
            `
          : nothing}
        ${children.length
          ? html`
              <div class="row">
                <span class="rowLabel">Children</span>
                <span class="cell">${children.map((child) => this._chip(child))}</span>
              </div>
            `
          : nothing}
        ${this._showHtml
          ? html`
              <div class="row">
                <span class="rowLabel">HTML</span>
                <div class="tree">${this._renderTree(el, 0)}</div>
              </div>
            `
          : nothing}
      </div>
    `;
  }

  render() {
    const selected = this._selected;

    return html`
      <div class="bar">
        <button
          class="toggle ${this._active ? 'on' : ''}"
          aria-pressed=${this._active ? 'true' : 'false'}
          @click=${() => this._setActive(!this._active)}
        >
          <span class="dot"></span> Inspect ${this._active ? 'on' : 'off'}
        </button>

        ${selected
          ? html`
              <button
                aria-expanded=${this._showHtml ? 'true' : 'false'}
                @click=${() => {
                  this._showHtml = !this._showHtml;
                }}
              >
                ${this._showHtml ? 'Hide' : 'Show'} HTML
              </button>
              <button @click=${() => this._clear()}>Clear</button>
            `
          : nothing}

        <span class="hint">
          ${this._active
            ? 'Click any element for its classes · click a parent chip to step up · Esc to leave'
            : 'Turn on to read classes by clicking. The page stays interactive while off.'}
        </span>
      </div>

      <slot></slot>
      ${selected ? this._renderPanel(selected) : nothing}
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'layout-inspector': LayoutInspector;
  }
}

/**
 * Story decorator. Opt a page in with `decorators: [withLayoutInspector]`.
 *
 * Inspect mode starts off and is shared across every story on the page, so one
 * click on any "Inspect off" button turns it on everywhere in the docs view.
 */
export const withLayoutInspector = (story: () => unknown) =>
  html`<layout-inspector>${story()}</layout-inspector>`;
