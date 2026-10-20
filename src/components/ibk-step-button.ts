import { LitElement, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import type { StepButtonDominance, StepButtonShape, StepButtonSize } from '../utils/types';

/**
 * IBK-Step-Button Component
 * @summary A compact icon-only stepper button used to increment / decrement or
 * move step-by-step (e.g. spinners, carousels, paginated views). Renders a
 * single icon from the IBYKUS-Iconset.
 *
 * @fires step - Dispatched on click (unless disabled). `detail` carries the
 * active `{ icon }` so a surrounding bar can tell the two buttons apart.
 */
@customElement('ibk-step-button')
export class IbkStepButton extends LitElement {
  createRenderRoot() {
    return this;
  }

  /**
   * The IBYKUS-Iconset ligature to display (e.g. `JmpU`, `JmpD`, `JmpNxt`).
   */
  @property({ type: String, reflect: true }) icon?: string = 'JmpU';

  /**
   * Visual dominance: `prominent` (red), `regular` (petrol) or `decent` (ghost).
   */
  @property({ type: String, reflect: true }) dominance?: StepButtonDominance = 'prominent';

  /**
   * Size of the button: `40` (1.5rem icon) or `20` (1.25rem icon).
   */
  @property({ type: String, reflect: true }) size?: StepButtonSize = '40';

  /**
   * Corner style: `round` (pill), `quad` (rounded square) or `rect`
   * (compact 1.25rem × 1rem rectangle, size `20` only).
   */
  @property({ type: String, reflect: true }) shape?: StepButtonShape = 'round';

  /**
   * Accessible label describing the action (e.g. "Increase value").
   */
  @property({ type: String }) label?: string;

  /**
   * Whether the button is disabled.
   */
  @property({ type: Boolean, reflect: true }) disabled?: boolean;

  private _handleClick(e: Event) {
    if (this.disabled) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    this.dispatchEvent(
      new CustomEvent('step', {
        detail: { icon: this.icon },
        bubbles: true,
        composed: true,
      }),
    );
  }

  render() {
    const classes = {
      ibkStepButton: true,
      [`ibkStepButton-${this.dominance}`]: !!this.dominance,
      [`ibkStepButton-${this.size}`]: !!this.size,
      [`ibkStepButton-${this.shape}`]: !!this.shape,
    };

    return html`
      <button
        type="button"
        class=${classMap(classes)}
        aria-label=${this.label ?? this.icon ?? 'step'}
        ?disabled=${this.disabled}
        @click=${(e: Event) => this._handleClick(e)}
      >
        <i class="ibkIcon">${this.icon}</i>
      </button>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'ibk-step-button': IbkStepButton;
  }
}
