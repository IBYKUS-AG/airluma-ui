import { LitElement, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import type { ButtonHtmlType, ButtonType, ButtonVariant, IconPosition } from '../utils/types';

/**
 * IBK-Button Component
 * @summary A clickable button element with various styles and icon support.
 */
@customElement('ibk-button')
export class IbkButton extends LitElement {
  createRenderRoot() {
    return this;
  }

  /**
   * The text label displayed inside the button.
   */
  @property({ type: String, reflect: true }) label?: string;

  /**
   * The icon to display. expecting HTML string or simple text char for now.
   * Can be an SVG string or a unicdoe character.
   */
  @property({ type: String, reflect: true }) icon?: string;

  /**
   * Whether the button is disabled.
   */
  @property({ type: Boolean, reflect: true }) disabled?: boolean;

  /**
   * The visual variant of the button.
   */
  @property({ type: String, reflect: true }) variant?: ButtonVariant = 'regular';

  /**
   * The semantic type of the button.
   */
  @property({ type: String, reflect: true }) type?: ButtonType = 'primary';

  /**
   * The native HTML button type, forwarded to the rendered <button>.
   * Defaults to 'button' so existing usages keep their current behavior.
   */
  @property({ type: String, reflect: true }) htmlType?: ButtonHtmlType = 'button';

  /**
   * The position of the icon relative to the label.
   */
  @property({ type: String, reflect: true }) iconPosition?: IconPosition = 'leading';

  render() {
    const isIconSolo = (!this.label && !!this.icon) || this.iconPosition === 'solo'; // Boolean
    const computedIconPos = isIconSolo ? 'solo' : this.iconPosition; // Value

    const classes = {
      ibkButton: true,
      [`ibkButton-${this.variant}`]: !!this.variant,
      [`ibkButton-${this.type}`]:
        !!this.type && this.type !== 'destructive' && this.type !== 'success',
      'ibkButton-destructive': this.type === 'destructive',
      'ibkButton-success': this.type === 'success',
      'ibkIcon-leading': !isIconSolo && !!this.icon && computedIconPos === 'leading',
      'ibkIcon-trailing': !isIconSolo && !!this.icon && computedIconPos === 'trailing',
      'ibkIcon-solo': isIconSolo,
    };

    // Helper for safe rendering of the icon (allows HTML Entities & SVGs)
    const iconTemplate = this.icon ? this.icon : '';

    return html`
      <button type=${this.htmlType} class=${classMap(classes)} ?disabled=${this.disabled}>
        ${this.icon && (computedIconPos === 'leading' || computedIconPos === 'solo')
          ? html`<i class="ibkIcon">${iconTemplate}</i>`
          : ''}
          
        ${!isIconSolo ? html`<span class="ibkButtonText">${this.label}</span>` : ''}
        ${this.icon && computedIconPos === 'trailing'
          ? html`<i class="ibkIcon">${iconTemplate}</i>`
          : ''}
      </button>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'ibk-button': IbkButton;
  }
}
