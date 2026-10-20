import { LitElement, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import type { CardDelta, CardVariant } from '../utils/types';

/**
 * IBK-Card Component
 * @summary Groups related content such as text, media or actions into a clear,
 * self-contained unit.
 * @slot - The card content.
 */
@customElement('ibk-card')
export class IbkCard extends LitElement {
  /**
   * The visual type of the card: a filled surface, a bordered outline or an
   * elevated surface with a drop shadow.
   */
  @property({ type: String, reflect: true }) variant: CardVariant = 'filled';

  /**
   * The surface step of the card. Each delta maps to one level of the neutral
   * grey ramp — `0` is white, `10` is the darkest of the four steps. For the
   * bordered variant the delta colours the border instead of the background.
   */
  @property({ type: String, reflect: true }) delta: CardDelta = '6';

  render() {
    return html`<slot></slot>`;
  }

  connectedCallback() {
    super.connectedCallback();
    this.classList.add('ibkCard');
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'ibk-card': IbkCard;
  }
}
