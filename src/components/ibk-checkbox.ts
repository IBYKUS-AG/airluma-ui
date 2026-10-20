import { LitElement, html, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { live } from 'lit/directives/live.js';

import type { CheckboxState, CheckboxLabelPosition } from '../utils/types';


/**
 * IBK-Checkbox Component
 * @summary A checkbox input element that adheres to layout similar to ibk-radio.
 * @fires change - Fired when the checkbox value is toggled.
 */
@customElement('ibk-checkbox')
export class IbkCheckbox extends LitElement {
  createRenderRoot() {
    return this; // Opt-out of shadow DOM for global CSS styling
  }

  /**
   * The ID to be used for the internal input element.
   * If not provided, a unique ID will be generated.
   */
  @property({ type: String, reflect: true }) inputId?: string;
  private static _nextId = 0;
  private _defaultId = `ibk-checkbox-${IbkCheckbox._nextId++}`;

  /**
   * Der Text für das Label, das neben der Checkbox angezeigt wird.
   */
  @property({ type: String, reflect: true }) label?: string;

  /**
   * Ob die Checkbox ausgewählt ist.
   */
  @property({ type: Boolean, reflect: true }) checked = false;
  
  /**
   * Deaktiviert die Checkbox.
   */
  @property({ type: Boolean, reflect: true }) disabled = false;
  
  /**
   * The indeterminate state for the checkbox.
   */
  @property({ type: Boolean }) indeterminate = false;

  /**
   * Unterstützender Text (Hilfstext), der unter der Checkbox angezeigt wird.
   */
  @property({ type: String, reflect: true }) supportingText?: string;

  /**
   * Der visuelle Status der Komponente.
   */
  @property({ type: String, reflect: true }) state?: CheckboxState;
  
  /**
   * Label position ('leading' or 'trailing')
   */
  @property({ type: String, reflect: true }) labelPosition?: CheckboxLabelPosition = 'trailing';

  connectedCallback() {
    super.connectedCallback();
    this.classList.add('ibkCheckboxComponent');
  }

  private _handleChange(e: Event) {
    e.stopPropagation();

    const target = e.target as HTMLInputElement;
    this.checked = target.checked;
    this.indeterminate = false; // usually un-indeterminates when clicked

    this.dispatchEvent(
      new CustomEvent('change', {
        detail: { checked: this.checked },
        bubbles: true,
        composed: true,
      }),
    );
  }

  render() {
    const id = this.inputId || (this.id ? `${this.id}-input` : this._defaultId);
    const isLabelLeading = this.labelPosition === 'leading';
    const hasLabelText = this.label && this.label !== '';

    const classes = {
      'ibkCheckbox-leading': isLabelLeading,
      'ibkCheckbox-disabled': this.disabled,
    };

    const labelNode = hasLabelText 
      ? html`<span class="ibk-checkbox-label">${this.label}</span>` 
      : nothing;

    const checkboxHtml = html`
      <div class="ibkCheckbox ${this.state || ''}">
        <label class=${classMap(classes)} for=${id}>
          ${isLabelLeading ? labelNode : nothing}
          <input
            id=${id}
            type="checkbox"
            ?disabled=${this.disabled}
            .checked=${live(this.checked)}
            .indeterminate=${this.indeterminate}
            @change=${this._handleChange}
          />
          ${!isLabelLeading ? labelNode : nothing}
        </label>
      </div>
    `;

    return html`
      ${this.supportingText || this.state
        ? html`
            <div class="ibkCheckboxContainer">
              ${checkboxHtml}
              ${this.supportingText
                ? html`<span class="supportingText ${this.state || ''}">
                    <span class="content">${this.supportingText}</span>
                  </span>`
                : nothing}
            </div>
          `
        : checkboxHtml}
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'ibk-checkbox': IbkCheckbox;
  }
}
