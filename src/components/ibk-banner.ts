import { LitElement, html, nothing } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import { classMap } from 'lit/directives/class-map.js'

/**
 * IBK-Banner Component
 * @summary A banner display for important messages.
 */
@customElement('ibk-banner')
export class IbkBanner extends LitElement {
  createRenderRoot() {
    return this
  }

  /**
   * The title of the banner.
   */
  @property({ type: String }) title = ''

  /**
   * The visual variant of the banner ('prominent', 'regular', or 'none').
   */
  @property({ type: String, reflect: true }) variant: 'prominent' | 'regular' | 'none' = 'prominent'

  /**
   * The icon used for the banner (regular icon or prominent close button).
   */
  @property({ type: String }) icon = 'Cls'

  /**
   * The content of the banner.
   */
  @property({ type: String }) content = ''

  private _handleClose() {
    this.dispatchEvent(new CustomEvent('close', { bubbles: true, composed: true }))
    this.remove()
  }

  render() {
    const classes = {
      ibkBanner: true,
      prominent: this.variant === 'prominent',
      regular: this.variant === 'regular',
    }

    return html`
      <div class=${classMap(classes)}>
        <div class="ibkBanner-content">
          <h4>${this.title}</h4>
          <p>${this.content}</p>
          <slot></slot>
        </div>

        ${this.variant === 'prominent'
        ? html`
              <button class="ibkButton ibkButton-regular ibkButton-primary" @click=${this._handleClose}>
                <i class="ibkIcon">${this.icon}</i>
              </button>
            `
        : nothing}
        ${this.variant === 'regular'
        ? html`
              <button class="ibkButton-close" @click=${this._handleClose}>
                <i class="ibkIcon">${this.icon}</i>
              </button>
            `
        : nothing}
      </div>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'ibk-banner': IbkBanner
  }
}
