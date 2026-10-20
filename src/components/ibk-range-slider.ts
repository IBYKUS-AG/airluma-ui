import { LitElement, html, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { live } from 'lit/directives/live.js';
import { styleMap } from 'lit/directives/style-map.js';
import type { RangeSliderDominance, RangeSliderState } from '../utils/types';

/**
 * IBK-Range-Slider Component
 * @summary A slider that lets the user pick a single value along a scale.
 *
 * The leading and trailing elements are presentational only: pass `leadingIcon` /
 * `trailingIcon` for the icon variant or `leadingText` / `trailingText` for the text
 * variant. Omitting all of them renders the bare track.
 *
 * @fires input - Native event, fired continuously while the value changes.
 * @fires change - Native event, fired when the user commits a value.
 * @fires label-icon-click - Fired when the label icon is clicked.
 */
@customElement('ibk-range-slider')
export class IbkRangeSlider extends LitElement {
  createRenderRoot() {
    return this;
  }

  private static _nextId = 0;
  private _defaultId = `ibk-range-slider-${IbkRangeSlider._nextId++}`;

  /**
   * The text label displayed above the slider.
   */
  @property({ type: String, reflect: true }) label?: string;

  /**
   * Icon displayed within the label.
   */
  @property({ type: String, reflect: true }) labelInfoIcon?: string;

  /**
   * The visual dominance of the slider.
   */
  @property({ type: String, reflect: true }) dominance: RangeSliderDominance = 'regular';

  /*
   * FEATURE NOT READY YET - the vertical orientation is intentionally disabled.
   * Uncomment this property together with the marked blocks in `render()`, the vertical
   * section in `src/styles/components/range-slider.css` and the vertical parts of
   * `ibk-range-slider.stories.ts` to switch it back on.
   *
   * Whether the slider runs bottom to top instead of left to right. In the vertical
   * orientation the lowest value sits at the bottom and the label is placed beside the
   * track. The track takes a default height that can be overridden with CSS.
   *
   * @property({ type: Boolean, reflect: true }) vertical = false;
   */

  /**
   * The lowest selectable value.
   */
  @property({ type: Number, reflect: true }) min = 0;

  /**
   * The highest selectable value.
   */
  @property({ type: Number, reflect: true }) max = 100;

  /**
   * The granularity the value must adhere to.
   */
  @property({ type: Number, reflect: true }) step = 1;

  /**
   * The current value of the slider.
   */
  @property({ type: Number, reflect: true }) value = 0;

  /**
   * Icon rendered in front of the track.
   */
  @property({ type: String, reflect: true }) leadingIcon?: string;

  /**
   * Icon rendered after the track.
   */
  @property({ type: String, reflect: true }) trailingIcon?: string;

  /**
   * Text rendered in front of the track. Ignored when `leadingIcon` is set.
   */
  @property({ type: String, reflect: true }) leadingText?: string;

  /**
   * Text rendered after the track. Ignored when `trailingIcon` is set.
   */
  @property({ type: String, reflect: true }) trailingText?: string;

  /**
   * Supporting text displayed below the slider.
   */
  @property({ type: String, reflect: true }) supportingText?: string;

  /**
   * Icon displayed next to the supporting text.
   */
  @property({ type: String, reflect: true }) supportingIcon?: string;

  /**
   * Semantic state (warning, default).
   */
  @property({ type: String, reflect: true }) state?: RangeSliderState = 'default';

  /**
   * Whether the slider is disabled.
   */
  @property({ type: Boolean, reflect: true }) disabled = false;

  private _handleInput(e: Event) {
    const target = e.target as HTMLInputElement;
    this.value = target.valueAsNumber;
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

  /**
   * The current value expressed as a fraction of the scale, from 0 to 1.
   */
  private get _fraction(): number {
    const span = this.max - this.min;
    if (!Number.isFinite(span) || span <= 0) return 0;
    const clamped = Math.min(Math.max(this.value, this.min), this.max);
    return (clamped - this.min) / span;
  }

  private _renderBound(icon: string | undefined, text: string | undefined) {
    if (icon) return html`<i class="ibkIcon" aria-hidden="true">${icon}</i>`;
    if (text) return html`<span class="ibkRangeSliderBoundText">${text}</span>`;
    return nothing;
  }

  render() {
    const id = this._defaultId;
    const supportingId = `${id}-supporting`;
    const hasLabel = !!(this.label || this.labelInfoIcon);
    const hasSupporting = !!(this.supportingText || this.supportingIcon);
    const hasLeading = !!(this.leadingIcon || this.leadingText);
    const hasTrailing = !!(this.trailingIcon || this.trailingText);
    const fraction = Number(this._fraction.toFixed(6));
    // The thumb centre follows the travel span of the (invisible) native thumb, which
    // is inset by half the 0.375rem overhang on both ends of the visible track.
    const thumbOffset = `calc(0.1875rem + ${fraction} * (100% - 0.375rem))`;

    /*
     * FEATURE NOT READY YET - vertical orientation. In the vertical orientation the same
     * span is measured from the bottom edge upwards, so thumb and progress run along the
     * other axis. Replace the two constants below with these lines to switch it back on:
     *
     * const thumbStyle = this.vertical ? { bottom: thumbOffset } : { left: thumbOffset };
     * const progressStyle = this.vertical
     *   ? { height: `${fraction * 100}%` }
     *   : { width: `${fraction * 100}%` };
     */
    const thumbStyle = { left: thumbOffset };
    const progressStyle = { width: `${fraction * 100}%` };

    const classes = {
      ibkRangeSlider: true,
      [`ibkRangeSlider-${this.dominance}`]: true,
      // FEATURE NOT READY YET - vertical orientation
      // 'ibkRangeSlider-vertical': this.vertical,
      disabled: this.disabled,
      warning: this.state === 'warning',
    };

    return html`
      <span class=${classMap(classes)}>
        ${hasLabel
          ? html`
              <label class="ibkLabel" for=${id}>
                <span class="ibkLabelText">${this.label}</span>
                ${this.labelInfoIcon
                  ? html`<i
                      class="ibkIcon label-info"
                      tabindex="0"
                      @click=${(e: Event) => this._dispatchLabelIconClick(e)}
                      >${this.labelInfoIcon}</i
                    >`
                  : nothing}
              </label>
            `
          : nothing}

        <div class="ibkRangeSliderControl">
          ${hasLeading
            ? html`<span class="ibkRangeSliderLeading"
                >${this._renderBound(this.leadingIcon, this.leadingText)}</span
              >`
            : nothing}

          <div class="ibkRangeSliderTrack">
            <input
              type="range"
              class="ibkRangeSliderInput"
              id=${id}
              name=${id}
              min=${this.min}
              max=${this.max}
              step=${this.step}
              .value=${live(String(this.value))}
              ?disabled=${this.disabled}
              aria-describedby=${ifDefined(hasSupporting ? supportingId : undefined)}
              @input=${(e: Event) => this._handleInput(e)}
            />
            <span class="ibkRangeSliderRail"></span>
            <span class="ibkRangeSliderProgress" style=${styleMap(progressStyle)}></span>
            <span class="ibkRangeSliderThumb" style=${styleMap(thumbStyle)}></span>
          </div>

          ${hasTrailing
            ? html`<span class="ibkRangeSliderTrailing"
                >${this._renderBound(this.trailingIcon, this.trailingText)}</span
              >`
            : nothing}
        </div>

        ${hasSupporting
          ? html`
              <span id=${supportingId} aria-live="polite" class="supportingText">
                ${this.supportingIcon
                  ? html`<i class="ibkIcon">${this.supportingIcon}</i>`
                  : nothing}
                ${this.supportingText
                  ? html`<span class="content">${this.supportingText}</span>`
                  : nothing}
              </span>
            `
          : nothing}
      </span>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'ibk-range-slider': IbkRangeSlider;
  }
}
