import { LitElement, html, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { live } from 'lit/directives/live.js';
import type { TextareaState } from '../utils/types';

/**
 * IBK-Textarea Component
 * @summary A multi-line plain-text editing control.
 *
 * @fires input - Fired when the value changes.
 * @fires label-icon-click - Fired when the label icon is clicked.
 */
@customElement('ibk-textarea')
export class IbkTextarea extends LitElement {
  createRenderRoot() {
    return this;
  }

  private static _nextId = 0;
  private _defaultId = `ibk-textarea-${IbkTextarea._nextId++}`;

  /**
   * The text label displayed above the textarea.
   */
  @property({ type: String, reflect: true }) label?: string;

  /**
   * The current value of the textarea.
   */
  @property({ type: String }) value = '';

  /**
   * Placeholder text shown when the textarea is empty.
   */
  @property({ type: String, reflect: true }) placeholder?: string;

  /**
   * Whether the textarea is disabled.
   */
  @property({ type: Boolean, reflect: true }) disabled = false;

  /**
   * Whether the textarea is read-only.
   */
  @property({ type: Boolean, reflect: true }) readonly = false;

  /**
   * Whether the user can resize the textarea vertically. Without it the size is fixed.
   */
  @property({ type: Boolean, reflect: true }) resize = false;

  /**
   * Icon displayed within the label.
   */
  @property({ type: String, reflect: true }) labelInfoIcon?: string;

  /**
   * Supporting text displayed below the textarea.
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
  @property({ type: String, reflect: true }) state?: TextareaState = 'default';


  private _handleInput(e: Event) {
    const target = e.target as HTMLTextAreaElement;
    this.value = target.value;
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
    const counterId = `${id}-counter`;
    const hasSupporting = !!(this.supportingText || this.supportingIcon);
    const hasCounter = (this.maxlength ?? 0) > 0;

    const classes = {
      ibkTextarea: true,
      disabled: this.disabled,
      readonly: this.readonly,
      resize: this.resize,
      alert: this.state === 'alert',
      warning: this.state === 'warning',
      success: this.state === 'success',
    };

    // `value` turns null when its attribute is removed
    const length = this.value?.length ?? 0;

    const supporting = hasSupporting
      ? html`
          <span class="supportingText ${this.state && this.state !== 'default' ? this.state : ''}">
            ${this.supportingIcon ? html`<i class="ibkIcon">${this.supportingIcon}</i>` : nothing}
            ${this.supportingText
              ? html`<span class="content">${this.supportingText}</span>`
              : nothing}
          </span>
        `
      : nothing;

    return html`
      <span class=${classMap(classes)}>
        <label class="ibkLabel" for=${id}>
          <span class="ibkLabelText">${this.label}</span>
          ${this.labelInfoIcon
            ? html`<i
                class="ibkIcon label-info"
                tabindex="0"
                @click=${this._dispatchLabelIconClick}
                >${this.labelInfoIcon}</i
              >`
            : nothing}
        </label>

        <div class="ibkTextareaWrapper">
          <textarea
            id=${id}
            name=${id}
            placeholder=${ifDefined(this.placeholder)}
            .value=${live(this.value)}
            ?disabled=${this.disabled}
            ?readonly=${this.readonly}
            aria-describedby=${ifDefined(hasCounter ? counterId : undefined)}
            @input=${this._handleInput}
          ></textarea>
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
    'ibk-textarea': IbkTextarea;
  }
}
