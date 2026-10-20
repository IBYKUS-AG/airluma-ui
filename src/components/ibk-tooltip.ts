import { LitElement, html, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import type { TooltipType } from '../utils/types';

/**
 * IBK-Tooltip Component
 * @summary A small contextual message bubble. The `tooltip` type carries read-only text, the
 * `toggletip` type adds a close (X) button.
 *
 * @tag ibk-tooltip
 *
 * @fires ibk-tooltip-close - Dispatched when the user clicks the close button.
 */
@customElement('ibk-tooltip')
export class IbkTooltip extends LitElement {
  createRenderRoot() {
    return this;
  }

  /**
   * Tooltip text content.
   */
  @property({ type: String, reflect: true }) label = 'Tooltip text';

  /**
   * Which type to render: `tooltip` is plain read-only text, `toggletip` adds the close (X)
   * button and may therefore hold interactive content.
   */
  @property({ type: String, reflect: true }) type: TooltipType = 'tooltip';

  private readonly _closeIcon = 'Cls';

  /**
   * Whether the tooltip is open.
   */
  @property({ type: Boolean, reflect: true }) open = true;

  private _handleClose = (e: Event) => {
    e.stopPropagation();
    this.open = false;
    this.dispatchEvent(
      new CustomEvent('ibk-tooltip-close', { bubbles: true, composed: true })
    );
  };

  render() {
    if (!this.open) return nothing;

    const isToggletip = this.type === 'toggletip';

    const classes = {
      ibkTooltip: true,
      'ibkTooltip-toggletip': isToggletip,
    };

    return html`
      <div class=${classMap(classes)} role=${isToggletip ? 'status' : 'tooltip'}>
        <span class="ibkTooltip-text">${this.label}</span>
        ${isToggletip
          ? html`
              <button
                type="button"
                class="ibkButton-close"
                aria-label="Close"
                @click=${(e: Event) => this._handleClose(e)}
              >
                <i class="ibkIcon">${this._closeIcon}</i>
              </button>
            `
          : nothing}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'ibk-tooltip': IbkTooltip;
  }
}
