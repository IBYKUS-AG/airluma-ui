import { LitElement, html, nothing } from 'lit'
import { customElement, property } from 'lit/decorators.js'

/**
 * IBK-Figure Component
 * @summary A figure element with a caption, supporting top and bottom placement.
 */
@customElement('ibk-figure')
export class IbkFigure extends LitElement {
  createRenderRoot() {
    return this
  }

  /**
   * Source URL of the image.
   */
  @property({ type: String }) src = ''

  /**
   * Alt text for the image.
   */
  @property({ type: String }) alt = ''

  /**
   * The caption text.
   */
  @property({ type: String }) caption = ''

  /**
   * Placement of the caption (top or bottom).
   */
  @property({ type: String }) variant: 'top' | 'bottom' = 'bottom'

  /**
   * Optional inline styles for the image.
   */
  @property({ type: String, attribute: 'img-style' }) imgStyle = ''

  render() {
    const captionTemplate = this.caption
      ? html`<figcaption class=${this.variant}>${this.caption}</figcaption>`
      : nothing

    return html`
      <figure>
        ${this.variant === 'top' ? captionTemplate : nothing}
        <slot name="media">
          ${this.src
            ? html`<img src=${this.src} alt=${this.alt} style=${this.imgStyle} />`
            : nothing}
        </slot>
        ${this.variant === 'bottom' ? captionTemplate : nothing}
      </figure>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'ibk-figure': IbkFigure
  }
}
