import { LitElement, html, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';

/**
 * IBK-Fieldset Component
 * @summary A fieldset to group related elements in a form.
 */
@customElement('ibk-fieldset')
export class IbkFieldset extends LitElement {
  private _contentNodes: Node[] = [];
  private _contentObserver?: MutationObserver;

  createRenderRoot() {
    return this;
  }

  /**
   * Legend for the fieldset.
   */
  @property({ type: String }) legend = '';

  /**
   * Supporting text displayed below the legend.
   */
  @property({ type: String }) supportingText?: string;

  /**
   * Whether the fieldset is disabled.
   */
  @property({ type: Boolean }) disabled = false;

  connectedCallback() {
    // Rendering ins Light-DOM (siehe createRenderRoot) heisst: ein <slot>
    // projiziert nichts, weil es keinen Shadow-Root gibt. Der Kindinhalt muss
    // deshalb eingesammelt und selbst gerendert werden -- sonst bleibt er
    // neben dem <fieldset> liegen statt darin, ist also weder gruppiert (kein
    // Bezug fuer Bedienhilfen, kein Rahmen/Innenabstand) noch von `disabled`
    // erfasst.
    if (!this.hasUpdated && this._contentNodes.length === 0) {
      this._contentNodes = Array.from(this.childNodes);
    }

    super.connectedCallback();

    // Frameworks mit asynchronem DOM-Patching (Blazor, React, Angular) fuegen
    // Kindinhalt haeufig erst nach dem ersten Render ein -- der wird hier
    // nachtraeglich aufgenommen.
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
    const ownRoot = this.querySelector(':scope > .ibkFieldset');

    const added = Array.from(this.childNodes).filter(
      (node) =>
        // Everything this component rendered itself is not user content:
        // .ibkFieldset is its own output, comments are lit's template markers,
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

    this._contentNodes = [...this._contentNodes, ...added];

    return true;
  }

  render() {
    return html`
      <fieldset class="ibkFieldset" ?disabled=${this.disabled}>
        ${this.legend ? html`<legend>${this.legend}</legend>` : nothing}
        ${this.supportingText
          ? html`<span class="supportingText"
              ><span class="content">${this.supportingText}</span></span
            >`
          : nothing}
        <div class="ibkFieldsetContent">${this._contentNodes}</div>
      </fieldset>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'ibk-fieldset': IbkFieldset;
  }
}
