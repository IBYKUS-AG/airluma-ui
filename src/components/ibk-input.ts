import { LitElement, html, nothing } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { live } from 'lit/directives/live.js';
import type { InputState, InputType } from '../utils/types';

/**
 * IBK-Input Component
 * @summary A text field that allows the user to enter and edit text.
 *
 * @fires input - Fired when the value changes.
 * @fires func-icon-1-click - Fired when the first function icon is clicked.
 * @fires func-icon-2-click - Fired when the second function icon is clicked.
 * @fires func-icon-3-click - Fired when the third function icon is clicked.
 * @fires label-icon-click - Fired when the label icon is clicked.
 */
@customElement('ibk-input')
export class IbkInput extends LitElement {
  createRenderRoot() {
    return this;
  }

  private static _nextId = 0;
  private _defaultId = `ibk-input-${IbkInput._nextId++}`;

  @state() private _passwordVisible = false;

  /**
   * The type of the input (e.g., text, password, email).
   */
  @property({ type: String, reflect: true }) type: InputType = 'text';

  /**
   * The text label displayed above the input.
   */
  @property({ type: String, reflect: true }) label?: string;

  /**
   * The current value of the input.
   */
  @property({ type: String, reflect: true }) value = '';

  /**
   * Placeholder text shown when the input is empty.
   */
  @property({ type: String, reflect: true }) placeholder?: string;

  /**
   * Whether the input is disabled.
   */
  @property({ type: Boolean, reflect: true }) disabled = false;

  /**
   * Whether the input is read-only.
   */
  @property({ type: Boolean, reflect: true }) readonly = false;

  /**
   * Whether to display the input in a prominent style.
   */
  @property({ type: Boolean, reflect: true }) prominent = false;

  /**
   * Icon displayed inside the input field (leading info icon).
   */
  @property({ type: String, reflect: true }) textInfoIcon?: string;

  /**
   * Icon displayed within the label.
   */
  @property({ type: String, reflect: true }) labelInfoIcon?: string;

  /**
   * Functional icons inside the input text area (trailing). The icons that are set line up from
   * the right edge inwards in this order, without a gap for an unset one.
   */
  @property({ type: String, reflect: true }) funcIcon1?: string;
  @property({ type: String, reflect: true }) funcIcon2?: string;
  @property({ type: String, reflect: true }) funcIcon3?: string;

  /**
   * Supporting text displayed below the input.
   */
  @property({ type: String, reflect: true }) supportingText?: string;

  /**
   * Icon displayed next to the supporting text.
   */
  @property({ type: String, reflect: true }) supportingIcon?: string;

  /**
   * Character limit, shown as a counter right of the supporting text: "{count} von {maxlength}".
   * Without it no counter is rendered. The limit is not enforced - the user can type past it,
   * and the application decides how to handle a longer value.
   */
  @property({ type: Number, reflect: true }) maxlength?: number;

  /**
   * Semantic state (alert, warning, success, default).
   */
  @property({ type: String, reflect: true }) state?: InputState = 'default';

  /**
   * The name submitted with the form data. Falls back to the internal id when not set.
   */
  @property({ type: String, reflect: true }) name?: string;

  /**
   * Accessible label for the password-visibility toggle when the password is hidden.
   */
  @property({ type: String, reflect: true }) showPasswordLabel = 'Passwort anzeigen';

  /**
   * Accessible label for the password-visibility toggle when the password is visible.
   */
  @property({ type: String, reflect: true }) hidePasswordLabel = 'Passwort verbergen';

  /**
   * Accessible name for the first function icon button. Required whenever `funcIcon1` is set,
   * because the name depends on the action the consuming application puts behind the icon.
   */
  @property({ type: String, reflect: true }) funcIcon1Label?: string;

  /**
   * Accessible name for the second function icon button. Required whenever `funcIcon2` is set.
   */
  @property({ type: String, reflect: true }) funcIcon2Label?: string;

  /**
   * Accessible name for the third function icon button. Required whenever `funcIcon3` is set.
   */
  @property({ type: String, reflect: true }) funcIcon3Label?: string;

  /**
   * Accessible name for the info icon button in the label. Required whenever `labelInfoIcon` is set.
   */
  @property({ type: String, reflect: true }) labelInfoIconLabel?: string;

  private _handleInput(e: Event) {
    const target = e.target as HTMLInputElement;
    this.value = target.value;
  }

  private _dispatchFuncIconClick(index: number, e: Event) {
    e.stopPropagation();
    this.dispatchEvent(
      new CustomEvent(`func-icon-${index}-click`, {
        bubbles: true,
        composed: true,
      }),
    );
  }

  private _togglePasswordVisibility(e: Event) {
    e.stopPropagation();
    this._passwordVisible = !this._passwordVisible;
  }

  /**
   * An icon button without an accessible name is announced by its ligature text, which is a
   * WCAG 4.1.2 violation. Surface that during development instead of letting it ship silently.
   */
  private _warnMissingIconLabel(iconProp: string, labelProp: string) {
    if (import.meta.env?.DEV) {
      console.warn(
        `<ibk-input>: "${iconProp}" is set without "${labelProp}". ` +
          `The icon button has no accessible name and will be announced by its icon ligature.`,
      );
    }
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

  render() {
    const id = this._defaultId;
    const supportingId = `${id}-supporting`;
    const counterId = `${id}-counter`;
    const hasSupporting = !!(this.supportingText || this.supportingIcon);
    const hasCounter = (this.maxlength ?? 0) > 0;
    const isPassword = this.type === 'password';
    const baseClass = isPassword ? 'ibkInputPassword' : 'ibkInputText';

    const effectiveTextInfoIcon = isPassword ? 'LockCls' : this.textInfoIcon;
    const effectiveType = isPassword && this._passwordVisible ? 'text' : this.type;
    const effectiveFuncIcon1 = isPassword
      ? this._passwordVisible ? 'UnVis' : 'Vis'
      : this.funcIcon1;
    const effectiveFuncIcon2 = isPassword ? undefined : this.funcIcon2;
    const effectiveFuncIcon3 = isPassword ? undefined : this.funcIcon3;
    const toggleAriaLabel = isPassword
      ? this._passwordVisible ? this.hidePasswordLabel : this.showPasswordLabel
      : undefined;

    if (!isPassword) {
      if (this.funcIcon1 && !this.funcIcon1Label)
        this._warnMissingIconLabel('funcIcon1', 'funcIcon1Label');
      if (this.funcIcon2 && !this.funcIcon2Label)
        this._warnMissingIconLabel('funcIcon2', 'funcIcon2Label');
      if (this.funcIcon3 && !this.funcIcon3Label)
        this._warnMissingIconLabel('funcIcon3', 'funcIcon3Label');
    }
    if (this.labelInfoIcon && !this.labelInfoIconLabel)
      this._warnMissingIconLabel('labelInfoIcon', 'labelInfoIconLabel');

    // The icons that are set take the slots from the right edge inwards in prop order, so a gap in
    // the props (only funcIcon2, or funcIcon1 and funcIcon3) leaves no hole in the row and the
    // func-N rules always find their slots filled.
    const slots = ['first', 'second', 'third'];
    let funcCount = 0;
    const slot1 = effectiveFuncIcon1 ? slots[funcCount++] : undefined;
    const slot2 = effectiveFuncIcon2 ? slots[funcCount++] : undefined;
    const slot3 = effectiveFuncIcon3 ? slots[funcCount++] : undefined;

    const classes = {
      [baseClass]: true,
      prominent: this.prominent,
      'info-icon': !!effectiveTextInfoIcon,
      disabled: this.disabled,
      readonly: this.readonly,
      [`func-${funcCount}`]: funcCount > 0,
      alert: this.state === 'alert',
      warning: this.state === 'warning',
      success: this.state === 'success',
    };

    const hasLabel = !!(this.label || this.labelInfoIcon);
    const describedBy =
      [hasSupporting && supportingId, hasCounter && counterId].filter(Boolean).join(' ') ||
      undefined;

    // `value` turns null when its attribute is removed
    const length = this.value?.length ?? 0;

    const supporting = hasSupporting
      ? html`
          <span
            id=${supportingId}
            aria-live="polite"
            class="supportingText ${this.state && this.state !== 'default' ? this.state : ''}"
          >
            ${this.supportingIcon ? html`<i class="ibkIcon">${this.supportingIcon}</i>` : nothing}
            ${this.supportingText
              ? html`<span class="content">${this.supportingText}</span>`
              : nothing}
          </span>
        `
      : nothing;

    return html`
      <span class=${classMap(classes)}>
        ${hasLabel
          ? html`
              <label class="ibkLabel" for=${id}>
                <span class="ibkLabelText">${this.label}</span>
                ${this.labelInfoIcon
                  ? html`<button
                      type="button"
                      class="ibkIcon label-info"
                      aria-label=${ifDefined(this.labelInfoIconLabel)}
                      @click=${this._dispatchLabelIconClick}
                    >
                      <i class="ibkIcon" aria-hidden="true">${this.labelInfoIcon}</i>
                    </button>`
                  : nothing}
              </label>
            `
          : nothing}

        <div class="ibkInputWrapper">
          <input
            type=${effectiveType}
            id=${id}
            name=${this.name || id}
            placeholder=${ifDefined(this.placeholder)}
            .value=${live(this.value)}
            ?disabled=${this.disabled}
            ?readonly=${this.readonly}
            aria-invalid=${this.state === 'alert' ? 'true' : 'false'}
            aria-describedby=${ifDefined(describedBy)}
            @input=${this._handleInput}
          />

          ${effectiveTextInfoIcon
            ? html`<i class="ibkIcon info-icon" aria-hidden="true">${effectiveTextInfoIcon}</i>`
            : nothing}
          ${effectiveFuncIcon3
            ? html`<button
                type="button"
                class="ibkIcon func ${slot3}"
                aria-label=${ifDefined(this.funcIcon3Label)}
                ?disabled=${this.disabled}
                @click=${(e: Event) => this._dispatchFuncIconClick(3, e)}
              >
                <i class="ibkIcon" aria-hidden="true">${effectiveFuncIcon3}</i>
              </button>`
            : nothing}
          ${effectiveFuncIcon2
            ? html`<button
                type="button"
                class="ibkIcon func ${slot2}"
                aria-label=${ifDefined(this.funcIcon2Label)}
                ?disabled=${this.disabled}
                @click=${(e: Event) => this._dispatchFuncIconClick(2, e)}
              >
                <i class="ibkIcon" aria-hidden="true">${effectiveFuncIcon2}</i>
              </button>`
            : nothing}
          ${effectiveFuncIcon1
            ? html`<button
                type="button"
                class="ibkIcon func ${slot1}"
                aria-label=${ifDefined(isPassword ? toggleAriaLabel : this.funcIcon1Label)}
                ?disabled=${this.disabled}
                @click=${(e: Event) =>
                  isPassword
                    ? this._togglePasswordVisibility(e)
                    : this._dispatchFuncIconClick(1, e)}
              >
                <i class="ibkIcon" aria-hidden="true">${effectiveFuncIcon1}</i>
              </button>`
            : nothing}
        </div>

        ${hasCounter
          ? html`
              <div class="supportingRow">
                ${supporting}
                <span id=${counterId} class="counter">${length} von ${this.maxlength}</span>
              </div>
            `
          : supporting}
      </span>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'ibk-input': IbkInput;
  }
}
