import { LitElement, html, nothing, type PropertyValues } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { styleMap } from 'lit/directives/style-map.js';
import type { MeterLevel, MeterVariant } from '../utils/types';

const DEFAULT_VALUE_BY_LEVEL: Record<MeterLevel, number> = {
  max: 100,
  highPos: 75,
  highNeg: 75,
  optimal: 50,
  low: 20,
  min: 0,
};

function deriveLevelFromValue(value: number): MeterLevel {
  if (value >= 90) return 'max';
  if (value >= 65) return 'highPos';
  if (value >= 40) return 'optimal';
  if (value >= 1) return 'low';
  return 'min';
}

/**
 * IBK-Meter Component
 * @summary A meter element showing a value within a known range with semantic level coloring.
 *
 * @fires label-icon-click - Fired when the label icon is clicked.
 */
@customElement('ibk-meter')
export class IbkMeter extends LitElement {
  createRenderRoot() {
    return this;
  }

  /**
   * The text label displayed above the meter.
   */
  @property({ type: String, reflect: true }) label?: string;

  /**
   * Icon displayed within the label.
   */
  @property({ type: String, reflect: true }) labelInfoIcon?: string;

  /**
   * Semantic level driving the bar color and default fill width.
   */
  @property({ type: String, reflect: true }) level: MeterLevel = 'optimal';

  /**
   * Optional explicit fill value from 0 to 100. When omitted, defaults to the level preset.
   */
  @property({ type: Number, reflect: true }) value?: number;

  /**
   * The visual variant of the meter.
   */
  @property({ type: String, reflect: true }) variant: MeterVariant = 'regular';

  /**
   * Whether the meter is disabled.
   */
  @property({ type: Boolean, reflect: true }) disabled = false;

  private _hasRenderedOnce = false;

  willUpdate(changedProperties: PropertyValues) {
    const valueChanged = changedProperties.has('value');
    if (valueChanged && typeof this.value === 'number') {
      if (!this._hasRenderedOnce) {
        if (!this.hasAttribute('level')) {
          this.level = deriveLevelFromValue(this.value);
        }
      } else if (!changedProperties.has('level')) {
        this.level = deriveLevelFromValue(this.value);
      }
    }
    this._hasRenderedOnce = true;
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
    const resolvedValue =
      typeof this.value === 'number'
        ? Math.max(0, Math.min(100, this.value))
        : DEFAULT_VALUE_BY_LEVEL[this.level];

    const classes = {
      ibkMeter: true,
      [`ibkMeter-${this.variant}`]: true,
      [`level-${this.level}`]: true,
      disabled: this.disabled,
    };

    return html`
      <span class=${classMap(classes)}>
        <span class="ibkMeterLabel">
          <span class="ibkMeterLabelText">${this.label}</span>
          ${this.labelInfoIcon
            ? html`<i
                class="ibkIcon label-info"
                tabindex="0"
                @click=${this._dispatchLabelIconClick}
                >${this.labelInfoIcon}</i
              >`
            : nothing}
        </span>

        <span class="ibkMeterTrack">
          <span
            class="ibkMeterFill"
            style=${styleMap({ width: `${resolvedValue}%` })}
          ></span>
        </span>
      </span>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'ibk-meter': IbkMeter;
  }
}
