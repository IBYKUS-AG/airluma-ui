import { LitElement, html, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { live } from 'lit/directives/live.js';
import type { InputState, SelectOption } from '../utils/types';

/**
 * IBK-Select Component
 * @summary A dropdown select field that allows the user to choose one option from a list.
 *
 * @fires change - Fired when the selected value changes. Detail: { value, label } of the selected option.
 * @fires label-icon-click - Fired when the label info icon is clicked.
 */
@customElement('ibk-select')
export class IbkSelect extends LitElement {
  createRenderRoot() {
    return this;
  }

  private static _nextId = 0;
  private _defaultId = `ibk-select-${IbkSelect._nextId++}`;

  /**
   * Label text displayed above the select field.
   */
  @property({ type: String, reflect: true }) label?: string;

  /**
   * Icon displayed next to the label text.
   */
  @property({ type: String, reflect: true }) labelInfoIcon?: string;

  /**
   * Placeholder text shown as the first disabled option when no value is selected.
   */
  @property({ type: String, reflect: true }) placeholder?: string;

  /**
   * The currently selected value.
   */
  @property({ type: String, reflect: true }) value = '';

  /**
   * Whether the select field is disabled.
   */
  @property({ type: Boolean, reflect: true }) disabled = false;

  /**
   * Whether to display the select in a prominent style.
   */
  @property({ type: Boolean, reflect: true }) prominent = false;

  /**
   * Icon displayed inside the select field (leading info icon).
   */
  @property({ type: String, reflect: true }) textInfoIcon?: string;

  private _options: SelectOption[] = [];

  /**
   * List of available options for the dropdown menu.
   */
  @property({ attribute: false })
  get options(): SelectOption[] {
    return this._options;
  }
  set options(local: SelectOption[]) {
    const oldOptionValue = this._options;
    this._options = local;
    this.requestUpdate('options', oldOptionValue);

    if (local.length > 0 && this.value !== '') {
      const valueExists = local.some((option) => option.value === this.value);
      if (!valueExists) {
        this.value = local[0].value;
      }
    }
  }

  /**
   * Supporting text displayed below the select field.
   */
  @property({ type: String, reflect: true }) supportingText?: string;

  /**
   * Visual state of the component (default, alert, warning, success).
   */
  @property({ type: String, reflect: true }) state: InputState = 'default';

  /**
   * Icon displayed next to the supporting text.
   */
  @property({ type: String, reflect: true }) supportingIcon?: string;

  private _handleChange(e: Event) {
    e.stopPropagation();

    const target = e.target as HTMLSelectElement;
    this.value = target.value;

    const selectedOption = this.options.find((opt) => opt.value === this.value);

    if (selectedOption) {
      this._dispatchChangeEvent(selectedOption);
    }
  }

  private _dispatchChangeEvent(opt: SelectOption) {
    this.dispatchEvent(
      new CustomEvent('change', {
        detail: opt,
        bubbles: true,
        composed: true,
      }),
    );
  }

  private _dispatchLabelIconClick(e: Event) {
    e.stopPropagation();
    this.dispatchEvent(
      new CustomEvent('label-icon-click', {
        bubbles: true,
        composed: true,
      }),
    );
  }

  private _handleLabelIconKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      this._dispatchLabelIconClick(e);
    }
  }

  render() {
    const classes = {
      ibkSelect: true,
      prominent: this.prominent,
      'has-info-icon': !!this.textInfoIcon && this.value === '',
      disabled: this.disabled,
      alert: this.state === 'alert',
      warning: this.state === 'warning',
      success: this.state === 'success',
    };

    const supportingClasses = {
      supportingText: true,
      alert: this.state === 'alert',
      warning: this.state === 'warning',
      success: this.state === 'success',
    };

    const options = this.options || [];
    const hasLabelContent = this.label || this.labelInfoIcon;
    const hasSupportingContent = this.supportingText || this.supportingIcon;
    const supportingId = hasSupportingContent ? `${this._defaultId}-support` : undefined;

    return html`
      <div class=${classMap(classes)}>
        ${hasLabelContent
          ? html`
              <label class="ibkLabel" for=${this._defaultId}>
                <span class="ibkLabelText">${this.label}</span>
                ${this.labelInfoIcon
                  ? html`<i
                      class="ibkIcon label-info"
                      role="button"
                      tabindex="0"
                      aria-label="More information"
                      @click=${this._dispatchLabelIconClick}
                      @keydown=${this._handleLabelIconKeydown}
                      >${this.labelInfoIcon}</i
                    >`
                  : nothing}
              </label>
            `
          : nothing}

        <div class="ibkSelectWrapper">
          <select
            id=${this._defaultId}
            name=${this._defaultId}
            .value=${live(this.value)}
            ?disabled=${this.disabled}
            aria-label=${!this.label && this.placeholder ? this.placeholder : nothing}
            aria-describedby=${supportingId ?? nothing}
            @change=${this._handleChange}
          >
            ${this.placeholder
              ? html`<option value="" disabled ?selected=${this.value === ''}>
                  ${this.placeholder}
                </option>`
              : nothing}
            ${options.map(
              (opt) => html`
                <option .value=${opt.value} ?selected=${opt.value === this.value}>
                  ${opt.label}
                </option>
              `,
            )}
          </select>
          <i class="ibkIcon dropdown-icon">ChevD</i>
          ${this.textInfoIcon
            ? html`<i class="ibkIcon info-icon">${this.textInfoIcon}</i>`
            : nothing}
        </div>

        ${hasSupportingContent
          ? html`
              <span id=${supportingId ?? nothing} class=${classMap(supportingClasses)}>
                ${this.supportingIcon
                  ? html`<i class="ibkIcon">${this.supportingIcon}</i>`
                  : nothing}
                ${this.supportingText
                  ? html`<span class="content">${this.supportingText}</span>`
                  : nothing}
              </span>
            `
          : nothing}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'ibk-select': IbkSelect;
  }
}
