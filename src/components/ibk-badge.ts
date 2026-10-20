import { LitElement, html, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import type { BadgeVariant } from '../utils/types';

type BadgeType = 'regular' | 'info' | 'success' | 'warning' | 'alert';

/**
 * IBK-Badge Component
 * @summary A small badging element to indicate status or counts.
 */
@customElement('ibk-badge')
export class IbkBadge extends LitElement {
  private _contentNodes: Node[] = [];
  private _hasInitialContent = false;
  private _contentObserver?: MutationObserver;

  createRenderRoot() {
    return this;
  }

  /**
   * The icon character or ligature to display when no child content is provided.
   */
  @property({ type: String, reflect: true }) icon?: string;

  /**
   * The visual size variant of the badge dot.
   */
  @property({ type: String, reflect: true }) variant?: BadgeVariant = 'regular';

  /**
   * The semantic style of the badge dot.
   */
  @property({ type: String, reflect: true }) type?: BadgeType = 'regular';

  /**
   * The count to display in the badge indicator.
   */
  @property({ type: String, reflect: true }) count?: string;

  connectedCallback() {
    if (!this.hasUpdated && this._contentNodes.length === 0) {
      const contentNodes = Array.from(this.childNodes);

      this._hasInitialContent = contentNodes.some(
        (node) => node.nodeType !== Node.TEXT_NODE || node.textContent?.trim(),
      );
      this._contentNodes = this._hasInitialContent ? contentNodes : [];
    }

    super.connectedCallback();

    // Rendering ins Light-DOM (siehe createRenderRoot) heisst: es gibt keinen
    // <slot>, der Kindinhalt automatisch durchreicht -- die Component muss ihn
    // selbst einsammeln. Einmalig beim Verbinden reicht dafuer nicht:
    // Frameworks mit asynchronem DOM-Patching (Blazor, React, Angular) fuegen
    // Kindinhalt haeufig erst nach dem ersten Render ein. Dann bleibt
    // .ibkBadgeContent leer, der Inhalt landet als Geschwister des eigenen
    // Markups, und der Indikator sitzt daneben statt am Inhalt.
    this._contentObserver ??= new MutationObserver(() => {
      if (this._captureLateContent()) {
        this.requestUpdate();
      }
    });
    this._contentObserver.observe(this, { childList: true });
  }

  disconnectedCallback() {
    this._contentObserver?.disconnect();
    this._contentObserver = undefined;

    super.disconnectedCallback();
  }

  /**
   * Picks up content that was inserted after the first render.
   *
   * @returns whether the content changed and a re-render is needed.
   */
  private _captureLateContent(): boolean {
    const ownRoot = this.querySelector(':scope > .ibkBadge');

    const added = Array.from(this.childNodes).filter(
      (node) =>
        // Everything this component rendered itself is not user content:
        // .ibkBadge is its own output, comments are lit's template markers,
        // and the template's own indentation sits at the host as whitespace
        // text nodes.
        node !== ownRoot &&
        node.nodeType !== Node.COMMENT_NODE &&
        (node.nodeType !== Node.TEXT_NODE || !!node.textContent?.trim()) &&
        !this._contentNodes.includes(node),
    );

    if (added.length === 0) {
      return false;
    }

    this._hasInitialContent = true;
    this._contentNodes = [...this._contentNodes, ...added];

    return true;
  }

  private get _hasCount() {
    return this.count !== undefined;
  }

  private get _displayCount() {
    const numericCount = Number(this.count);

    if (Number.isFinite(numericCount)) {
      return numericCount > 99 ? '99+' : String(numericCount);
    }

    return this.count ?? '';
  }

  private get _variantClass() {
    if (this._hasCount) {
      return 'counter';
    }

    return this.variant === 'decent' ? 'decent' : 'regular';
  }

  render() {
    const badgeClasses = {
      ibkBadge: true,
      [this._variantClass]: true,
      [`type-${this.type || 'regular'}`]: true,
    };

    const iconTemplate =
      !this._hasInitialContent && this.icon ? html`<i class="ibkIcon">${this.icon}</i>` : nothing;

    return html`
      <span class=${classMap(badgeClasses)}>
        <span class="ibkBadgeContent">${this._contentNodes}${iconTemplate}</span>
        <span class="badgeWrapper">
          <i class="indicator" aria-hidden=${this._hasCount ? 'false' : 'true'}>
            ${this._hasCount ? this._displayCount : nothing}
          </i>
        </span>
      </span>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'ibk-badge': IbkBadge;
  }
}
