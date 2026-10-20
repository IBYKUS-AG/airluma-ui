import { LitElement, html, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { styleMap } from 'lit/directives/style-map.js';
import type { ProgressType, ProgressVariant } from '../utils/types';

const CIRCLE_RADIUS = 20;
const CIRCLE_CIRCUMFERENCE = 2 * Math.PI * CIRCLE_RADIUS;

const PROGRESS_TYPES: ProgressType[] = ['linear', 'circular', 'spinner'];
const PROGRESS_VARIANTS: ProgressVariant[] = ['regular', 'decent'];

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

/**
 * IBK-Progress Component
 * @summary A progress indicator showing task completion as a linear bar, circular meter, or spinner.
 *
 * @fires label-icon-click - Fired when the label icon is clicked.
 */
@customElement('ibk-progress')
export class IbkProgress extends LitElement {
  createRenderRoot() {
    return this;
  }

  /**
   * The text label displayed above the progress indicator.
   */
  @property({ type: String, reflect: true }) label?: string;

  /**
   * Icon displayed within the label.
   */
  @property({ type: String, reflect: true }) labelInfoIcon?: string;

  /**
   * Optional current value of the progress indicator.
   */
  @property({ type: Number, reflect: true }) value?: number;

  /**
   * The maximum value of the progress indicator.
   */
  @property({ type: Number, reflect: true }) max = 100;

  /**
   * The visual type of the progress indicator.
   */
  @property({ type: String, reflect: true }) type: ProgressType = 'linear';

  /**
   * The visual variant of the progress indicator.
   */
  @property({ type: String, reflect: true }) variant: ProgressVariant = 'regular';

  /**
   * Whether the progress indicator is disabled.
   */
  @property({ type: Boolean, reflect: true }) disabled = false;

  /**
   * @deprecated Use variant="decent" instead.
   */
  @property({ type: Boolean, reflect: true }) decent = false;

  private _getResolvedType(): ProgressType {
    return PROGRESS_TYPES.includes(this.type) ? this.type : 'linear';
  }

  private _getResolvedVariant(): ProgressVariant {
    if (this.decent) return 'decent';
    return PROGRESS_VARIANTS.includes(this.variant) ? this.variant : 'regular';
  }

  private _getResolvedProgress() {
    const max = Number.isFinite(this.max) && this.max > 0 ? this.max : 100;
    const rawValue = typeof this.value === 'number' && Number.isFinite(this.value) ? this.value : 0;
    const value = clamp(rawValue, 0, max);
    const percentage = (value / max) * 100;

    return { max, percentage, value };
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

  private _renderLabel() {
    if (!this.label && !this.labelInfoIcon) return nothing;

    return html`
      <span class="ibkProgressLabel">
        ${this.label ? html`<span class="ibkProgressLabelText">${this.label}</span>` : nothing}
        ${this.labelInfoIcon
          ? html`<i class="ibkIcon label-info" tabindex="0" @click=${this._dispatchLabelIconClick}
              >${this.labelInfoIcon}</i
            >`
          : nothing}
      </span>
    `;
  }

  private _renderLinear(percentage: number, value: number, max: number) {
    return html`
      <span
        class="ibkProgressTrack"
        role="progressbar"
        aria-label=${ifDefined(this.label || undefined)}
        aria-valuemin="0"
        aria-valuemax=${max}
        aria-valuenow=${value}
      >
        <span class="ibkProgressFill" style=${styleMap({ width: `${percentage}%` })}></span>
      </span>
    `;
  }

  private _renderCircle(type: ProgressType, percentage: number, value: number, max: number) {
    const isSpinner = type === 'spinner';
    const spinnerHasValue =
      isSpinner && typeof this.value === 'number' && Number.isFinite(this.value);
    const circleOffset = CIRCLE_CIRCUMFERENCE - (percentage / 100) * CIRCLE_CIRCUMFERENCE;
    const circleStyle = isSpinner
      ? spinnerHasValue
        ? {
            'stroke-dasharray': `${(percentage / 100) * CIRCLE_CIRCUMFERENCE} ${CIRCLE_CIRCUMFERENCE}`,
            'stroke-dashoffset': '0',
          }
        : {}
      : {
          'stroke-dasharray': `${CIRCLE_CIRCUMFERENCE}`,
          'stroke-dashoffset': `${circleOffset}`,
        };

    return html`
      <span
        class="ibkProgressCircleWrap"
        role="progressbar"
        aria-label=${ifDefined(this.label || undefined)}
        aria-valuemin=${isSpinner && !spinnerHasValue ? nothing : 0}
        aria-valuemax=${isSpinner && !spinnerHasValue ? nothing : max}
        aria-valuenow=${isSpinner && !spinnerHasValue ? nothing : value}
        aria-busy=${isSpinner ? 'true' : nothing}
      >
        <svg class="ibkProgressCircle" viewBox="0 0 48 48" aria-hidden="true">
          <circle class="ibkProgressCircleTrack" cx="24" cy="24" r=${CIRCLE_RADIUS}></circle>
          <circle
            class="ibkProgressCircleFill"
            cx="24"
            cy="24"
            r=${CIRCLE_RADIUS}
            style=${styleMap(circleStyle)}
          ></circle>
        </svg>
      </span>
    `;
  }

  render() {
    const type = this._getResolvedType();
    const variant = this._getResolvedVariant();
    const { max, percentage, value } = this._getResolvedProgress();

    const classes = {
      ibkProgress: true,
      [`ibkProgress-${type}`]: true,
      [`ibkProgress-${variant}`]: true,
      disabled: this.disabled,
      'is-empty': type !== 'spinner' && percentage === 0,
    };

    return html`
      <span class=${classMap(classes)}>
        ${this._renderLabel()}
        ${type === 'linear'
          ? this._renderLinear(percentage, value, max)
          : this._renderCircle(type, percentage, value, max)}
      </span>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'ibk-progress': IbkProgress;
  }
}
