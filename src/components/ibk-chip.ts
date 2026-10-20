import { LitElement, html, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import type { ChipStatus, ChipType, ChipVariant } from '../utils/types';

/**
 * IBK-Chip Component
 * @summary A compact, partly interactive element used to display or filter
 * attributes. Chips are not buttons: `passive` chips only display a value,
 * while `active` chips are removable via their trailing close icon.
 *
 * @fires remove - Dispatched from an active chip when the close icon is
 * activated (click) or the chip receives a Delete/Backspace key press.
 * `detail` carries the chip `{ label }`.
 */
@customElement('ibk-chip')
export class IbkChip extends LitElement {
  createRenderRoot() {
    return this;
  }

  /**
   * Text label for the chip.
   */
  @property({ type: String, reflect: true }) label?: string;

  /**
   * Interactivity of the chip: `passive` (display only) or `active` (removable).
   */
  @property({ type: String, reflect: true }) status?: ChipStatus = 'passive';

  /**
   * Dominance of the chip: `regular` (filled) or `decent` (outlined).
   */
  @property({ type: String, reflect: true }) variant?: ChipVariant = 'regular';

  /**
   * Semantic style of the chip (default/info/success/warning/alert).
   */
  @property({ type: String, reflect: true }) type?: ChipType = 'default';

  private _emitRemove(e: Event) {
    e.preventDefault();
    e.stopPropagation();
    this.dispatchEvent(
      new CustomEvent('remove', {
        detail: { label: this.label },
        bubbles: true,
        composed: true,
      }),
    );
  }

  private _handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Delete' || e.key === 'Backspace') {
      this._emitRemove(e);
    }
  }

  render() {
    const isActive = this.status === 'active';

    const classes = {
      ibkChip: true,
      [this.status || 'passive']: true,
      decent: this.variant === 'decent',
      [this.type as string]: !!this.type && this.type !== 'default',
    };

    if (isActive) {
      return html`
        <span class=${classMap(classes)} tabindex="0" @keydown=${this._handleKeydown}>
          <span class="ibkChipText">${this.label}</span>
          <i
            class="ibkIcon"
            role="button"
            aria-label="Remove ${this.label ?? 'chip'}"
            @click=${this._emitRemove}
            >Cls</i
          >
        </span>
      `;
    }

    return html`
      <span class=${classMap(classes)}>
        <span class="ibkChipText">${this.label ?? nothing}</span>
      </span>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'ibk-chip': IbkChip;
  }
}
