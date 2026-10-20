import { LitElement, html, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';

type ToastVariant = 'regular' | 'decent';
type ToastType = 'default' | 'alert' | 'success' | 'warning';

/**
 * IBK-Toast Component
 * @summary A compact status message for short feedback.
 */
@customElement('ibk-toast')
export class IbkToast extends LitElement {
  createRenderRoot() {
    return this;
  }

  /**
   * Semantic state.
   */
  @property({ type: String, reflect: true }) state?: ToastType;

  /**
   * @deprecated Use `state` instead. Will be removed in a future version.
   */
  @property({ type: String, reflect: true }) status?: ToastType;

  /**
   * Visual variant (regular/decent).
   */
  @property({ type: String, reflect: true }) variant: ToastVariant = 'regular';

  /**
   * @deprecated Use `state` instead. Will be removed in a future version.
   */
  @property({ type: String, reflect: true }) type?: ToastType;

  /**
   * Icon ligature from the IBYKUS icon font.
   * Legacy unicode values are normalized to project icons.
   */
  @property({ type: String, reflect: true }) icon?: string;

  /**
   * Main label content. If omitted, the default slot is used.
   */
  @property({ type: String, reflect: true }) label?: string;

  /**
   * Optional trailing label for the two-label variant.
   */
  @property({ type: String, attribute: 'secondary-label', reflect: true }) secondaryLabel?: string;

  private _getEffectiveType(): ToastType {
    return this.state ?? this.type ?? this.status ?? 'default';
  }

  private _getEffectiveIcon(): string {
    if (!this.icon) return '';

    switch (this.icon) {
      case '✔':
      case '✓':
        return 'ChkM';
      case '⚠':
        return 'WarnTria';
      case 'ℹ':
        return 'InfoCirc';
      default:
        return this.icon;
    }
  }

  render() {
    const effectiveType = this._getEffectiveType();
    const effectiveIcon = this._getEffectiveIcon();

    const classes = {
      ibkToast: true,
      [this.variant]: true,
      [effectiveType]: true,
      eIB: !!effectiveIcon,
      twoLabel: !!this.secondaryLabel,
    };

    return html`
      <div class=${classMap(classes)} role="status" aria-live="polite" aria-atomic="true">
        <span class="ibkToastContent">
          ${effectiveIcon ? html`<i class="ibkIcon ibkToastIcon">${effectiveIcon}</i>` : nothing}
          <span class="ibkToastText">
            ${this.label != null
              ? html`<span class="ibkToastLabel">${this.label}</span>`
              : html`<span class="ibkToastLabel"><slot>Text goes here</slot></span>`}
            ${this.secondaryLabel
              ? html`<span class="ibkToastSecondary">${this.secondaryLabel}</span>`
              : nothing}
          </span>
        </span>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'ibk-toast': IbkToast;
  }
}
