import { LitElement, html, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import type { SwitchLabelPosition, SwitchState } from '../utils/types';

/**
 * IBK-Switch Component
 * @summary A control that allows the user to toggle between checked and not checked states.
 * @fires change - Fired when the switch is toggled. Detail contains `{ checked: boolean }`.
 */
@customElement('ibk-switch')
export class IbkSwitch extends LitElement {
  createRenderRoot() {
    return this;
  }

  @property({ type: String, reflect: true }) label?: string;

  @property({ type: Boolean, reflect: true }) checked = false;

  @property({ type: Boolean, reflect: true }) disabled = false;

  @property({ type: String, reflect: true }) labelPosition?: SwitchLabelPosition = 'trailing';

  @property({ type: String, reflect: true }) state?: SwitchState;

  @property({ type: String, reflect: true }) supportingText?: string;

  connectedCallback() {
    super.connectedCallback();
    this.classList.add('ibkSwitch');
  }

  private _handleChange(e: Event) {
    const target = e.target as HTMLInputElement;
    this.checked = target.checked;

    this.dispatchEvent(
      new CustomEvent('change', {
        detail: { checked: this.checked },
        bubbles: true,
        composed: true,
      }),
    );
  }

  render() {
    const isLabelLeading = this.labelPosition === 'leading';

    const classes = {
      'ibkSwitch-leading': isLabelLeading,
      'ibkSwitch-disabled': this.disabled,
    };
    if (this.state && this.state !== 'default') {
      classes[this.state as keyof typeof classes] = true;
    }

    return html`
      <label class=${classMap(classes)}>
        ${isLabelLeading ? html`<span class="ibk-switch-label">${this.label}</span>` : nothing}
        <input
          type="checkbox"
          class="checkbox"
          .checked=${this.checked}
          ?disabled=${this.disabled}
          @change=${(e: Event) => this._handleChange(e)}
        />
        <span class="ibk-switch-toggle"></span>
        ${!isLabelLeading ? html`<span class="ibk-switch-label">${this.label}</span>` : nothing}
      </label>
      ${this.supportingText
        ? html`<span class="supportingText ${this.state || ''} ${this.disabled ? 'disabled' : ''}">${this.supportingText}</span>`
        : nothing}
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'ibk-switch': IbkSwitch;
  }
}
