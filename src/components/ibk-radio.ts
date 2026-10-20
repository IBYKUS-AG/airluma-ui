import { LitElement, html, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import type { RadioGroupState, RadioLabelPosition } from '../utils/types';

/**
 * IBK-Radio-Group Component
 * @summary A container for radio buttons that manages selection state.
 * @fires change - Fired when the selected radio changes. Detail contains `{ value: string, label: string, name: string }`.
 */
@customElement('ibk-radio-group')
export class IbkRadioGroup extends LitElement {
  createRenderRoot() {
    return this;
  }

  @property({ type: String, reflect: true }) name?: string;

  @property({ type: String, reflect: true }) supportingText?: string;

  @property({ type: String, reflect: true }) state?: RadioGroupState = 'default';

  @property({ type: String, reflect: true }) labelPosition?: RadioLabelPosition;

  connectedCallback() {
    super.connectedCallback();
    this.classList.add('ibkRadioGroup');
    this.addEventListener('ibk-radio-change', this._handleRadioChange as EventListener);
    this.updateComplete.then(() => this._syncProperties());
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.removeEventListener('ibk-radio-change', this._handleRadioChange as EventListener);
  }

  updated(changedProperties: Map<string, unknown>) {
    super.updated(changedProperties);
    if (
      changedProperties.has('name') ||
      changedProperties.has('labelPosition') ||
      changedProperties.has('state')
    ) {
      this._syncProperties();
    }
  }

  private _syncProperties() {
    const radios = this.querySelectorAll('ibk-radio');
    radios.forEach((radio) => {
      if (radio instanceof IbkRadio) {
        if (this.name) radio.name = this.name;
        if (this.labelPosition) radio.labelPosition = this.labelPosition;
        radio.state = this.state || 'default';
      }
    });
  }

  private _handleRadioChange(e: CustomEvent) {
    const selectedRadio = e.target as IbkRadio;
    e.stopPropagation();

    const radios = this.querySelectorAll('ibk-radio');
    radios.forEach((radio) => {
      if (radio !== selectedRadio && radio instanceof IbkRadio) {
        radio.checked = false;
      }
    });

    this.dispatchEvent(
      new CustomEvent('change', {
        detail: {
          value: selectedRadio.value,
          label: selectedRadio.label,
          name: this.name,
        },
        bubbles: true,
        composed: true,
      }),
    );
  }

  render() {
    return html`
      ${this.supportingText
        ? html`<span class="supportingText ${this.state || ''}">${this.supportingText}</span>`
        : nothing}
    `;
  }
}

/**
 * IBK-Radio Component
 * @summary A single radio button element with label.
 * @fires ibk-radio-change - Fired when the radio is selected.
 */
@customElement('ibk-radio')
export class IbkRadio extends LitElement {
  createRenderRoot() {
    return this;
  }

  @property({ type: String, reflect: true }) label?: string;

  @property({ type: String, reflect: true }) value?: string;

  @property({ type: Boolean, reflect: true }) checked = false;

  @property({ type: Boolean, reflect: true }) disabled = false;

  @property({ type: String, reflect: true }) name?: string;

  @property({ type: String, reflect: true }) labelPosition?: RadioLabelPosition = 'trailing';

  @property({ type: String, reflect: true }) state?: RadioGroupState;

  connectedCallback() {
    super.connectedCallback();
    this.classList.add('ibkRadio');
  }

  private _handleChange(e: Event) {
    const target = e.target as HTMLInputElement;
    this.checked = target.checked;

    this.dispatchEvent(
      new CustomEvent('ibk-radio-change', {
        detail: { value: this.value, checked: this.checked },
        bubbles: true,
        composed: true,
      }),
    );
  }

  render() {
    const isLabelLeading = this.labelPosition === 'leading';

    const classes = {
      'ibkRadio-leading': isLabelLeading,
      'ibkRadio-disabled': this.disabled,
    };
    if (this.state && this.state !== 'default') {
      classes[this.state as keyof typeof classes] = true;
    }

    return html`
      <label class=${classMap(classes)}>
        ${isLabelLeading ? html`<span class="ibk-radio-label">${this.label}</span>` : nothing}
        <input
          type="radio"
          name=${ifDefined(this.name)}
          value=${ifDefined(this.value)}
          .checked=${this.checked}
          ?disabled=${this.disabled}
          @change=${this._handleChange}
        />
        ${!isLabelLeading ? html`<span class="ibk-radio-label">${this.label}</span>` : nothing}
      </label>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'ibk-radio-group': IbkRadioGroup;
    'ibk-radio': IbkRadio;
  }
}
