import { LitElement, html, nothing } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import type { RatingVariant } from '../utils/types';

/**
 * A star is filled either whole or up to its midpoint. This is the geometry of the glyph,
 * not the increment the rating moves in — see `_getStep()` for that.
 */
const RATING_HALF = 0.5;

/**
 * IBK-Rating Component
 * @summary A row of stars showing a rating from 0 to `max`, with the unfilled stars
 * remaining as grey outlines. Whole stars by default; set `allowHalf` to pick half stars
 * too. Hovering a star previews the rating a click would commit, filled in the same
 * colour as a committed one.
 * @fires change - Dispatched when the user picks another rating. Detail contains
 * `{ value: number, previousValue: number, max: number }`.
 */
@customElement('ibk-rating')
export class IbkRating extends LitElement {
  createRenderRoot() {
    return this;
  }

  /**
   * Current rating, in half-star steps.
   */
  @property({ type: Number, reflect: true }) value = 0;

  /**
   * Number of stars in the row.
   */
  @property({ type: Number, reflect: true }) max = 5;

  /**
   * Colour of the filled stars.
   */
  @property({ type: String, reflect: true }) variant: RatingVariant = 'red';

  /**
   * Whether the rating can be set in half-star steps. Whole stars only by default, so a
   * `value` of 3.5 is rounded to 4 unless this is set.
   *
   * The attribute name deliberately matches the property name, as with `currentPage` on
   * `ibk-pagination-dots` — a differing attribute makes the Storybook helpers list the
   * attribute and the property as two separate rows.
   */
  @property({ type: Boolean, reflect: true }) allowHalf = false;

  /**
   * Whether the rating shows a value instead of accepting input.
   */
  @property({ type: Boolean, reflect: true }) readonly = false;

  /**
   * Whether the rating is disabled.
   */
  @property({ type: Boolean, reflect: true }) disabled = false;

  /**
   * Accessible label for the rating.
   */
  @property({ type: String, attribute: 'rating-label' }) ratingLabel = 'Rating';

  /**
   * Rating previewed while a star half is held down, so the press shows the value it is
   * about to commit rather than the one it replaces.
   */
  @state() private _pressedValue: number | null = null;

  /**
   * Rating previewed while the pointer hovers a star half. The row then reads as the
   * value the next click would commit, in the same colour as a committed rating.
   */
  @state() private _hoveredValue: number | null = null;

  private _toFiniteNumber(value: number, fallback: number) {
    const numericValue = Number(value);

    return Number.isFinite(numericValue) ? numericValue : fallback;
  }

  private _getMax() {
    return Math.max(1, Math.floor(this._toFiniteNumber(this.max, 5)));
  }

  private _getStep() {
    return this.allowHalf ? RATING_HALF : 1;
  }

  private _snap(value: number, max: number) {
    const step = this._getStep();
    const bounded = Math.min(Math.max(this._toFiniteNumber(value, 0), 0), max);

    return Math.round(bounded / step) * step;
  }

  private _isInteractive() {
    return !this.disabled && !this.readonly;
  }

  private _range(end: number) {
    return Array.from({ length: end }, (_, index) => index + 1);
  }

  private _commit(next: number) {
    const max = this._getMax();
    const value = this._snap(next, max);
    const previousValue = this._snap(this.value, max);

    if (!this._isInteractive() || value === previousValue) return;

    this.value = value;

    this.dispatchEvent(
      new CustomEvent('change', {
        detail: { value, previousValue, max },
        bubbles: true,
        composed: true,
      }),
    );
  }

  private _onKeyDown(event: KeyboardEvent) {
    if (!this._isInteractive()) return;

    const max = this._getMax();
    const current = this._snap(this.value, max);
    const step = this._getStep();
    let next: number;

    switch (event.key) {
      case 'ArrowRight':
      case 'ArrowUp':
        next = current + step;
        break;
      case 'ArrowLeft':
      case 'ArrowDown':
        next = current - step;
        break;
      case 'Home':
        next = 0;
        break;
      case 'End':
        next = max;
        break;
      default:
        return;
    }

    event.preventDefault();
    this._commit(next);
  }

  private _onHitZonePointerDown(event: PointerEvent, value: number) {
    if (!this._isInteractive() || event.button !== 0) return;

    this._pressedValue = this._snap(value, this._getMax());
  }

  /**
   * Committing on `pointerup` rather than `click` keeps the preview and the new value in
   * the same event: the zone's handler runs before the row clears the preview, so the
   * stars never flash back to the previous value in between.
   */
  private _onHitZonePointerUp(event: PointerEvent, value: number) {
    if (!this._isInteractive() || event.button !== 0) return;

    this._pressedValue = null;
    this._commit(value);
  }

  /**
   * Touch pointers fire `pointerenter` on tap rather than on hover, so previewing them
   * would flash a value the finger never hovered over.
   */
  private _onHitZonePointerEnter(event: PointerEvent, value: number) {
    if (!this._isInteractive() || event.pointerType === 'touch') return;

    this._hoveredValue = this._snap(value, this._getMax());
  }

  private _onPointerUp() {
    this._pressedValue = null;
  }

  private _onPointerLeave() {
    this._pressedValue = null;
    this._hoveredValue = null;
  }

  private _renderHitZone(value: number, position: 'left' | 'right' | 'full') {
    const classes = {
      'ibkRating-hit': true,
      'ibkRating-hit-left': position === 'left',
      'ibkRating-hit-right': position === 'right',
    };

    return html`
      <span
        class=${classMap(classes)}
        @pointerenter=${(event: PointerEvent) => this._onHitZonePointerEnter(event, value)}
        @pointerdown=${(event: PointerEvent) => this._onHitZonePointerDown(event, value)}
        @pointerup=${(event: PointerEvent) => this._onHitZonePointerUp(event, value)}
      ></span>
    `;
  }

  private _renderHitZones(index: number) {
    if (!this.allowHalf) return this._renderHitZone(index, 'full');

    return html`
      ${this._renderHitZone(index - RATING_HALF, 'left')} ${this._renderHitZone(index, 'right')}
    `;
  }

  private _renderStar(index: number, displayValue: number, showHitZones: boolean) {
    const isFull = displayValue >= index;
    const isHalf = !isFull && displayValue >= index - RATING_HALF;
    const fillClasses = {
      ibkIcon: true,
      'ibkRating-starFill': true,
      'ibkRating-starFill-half': isHalf,
    };

    return html`
      <span class="ibkRating-star">
        <i class="ibkIcon" aria-hidden="true">Star</i>
        ${isFull || isHalf
          ? html`<i class=${classMap(fillClasses)} aria-hidden="true"
              >${isHalf ? 'StarFillHalf' : 'StarFill'}</i
            >`
          : nothing}
        ${showHitZones ? this._renderHitZones(index) : nothing}
      </span>
    `;
  }

  render() {
    const max = this._getMax();
    const value = this._snap(this.value, max);
    const interactive = this._isInteractive();
    const classes = {
      ibkRating: true,
      [`ibkRating-${this.variant === 'gold' ? 'gold' : 'red'}`]: true,
      'ibkRating-pressed': this._pressedValue !== null,
      'ibkRating-disabled': this.disabled,
    };

    return html`
      <div
        class=${classMap(classes)}
        role="slider"
        tabindex=${interactive ? 0 : nothing}
        aria-label=${this.ratingLabel}
        aria-orientation="horizontal"
        aria-valuemin="0"
        aria-valuemax=${max}
        aria-valuenow=${value}
        aria-valuetext=${`${value} of ${max} stars`}
        aria-readonly=${this.readonly ? 'true' : nothing}
        aria-disabled=${this.disabled ? 'true' : nothing}
        @keydown=${(event: KeyboardEvent) => this._onKeyDown(event)}
        @pointerup=${() => this._onPointerUp()}
        @pointercancel=${() => this._onPointerLeave()}
        @pointerleave=${() => this._onPointerLeave()}
      >
        ${this._range(max).map((index) =>
          this._renderStar(
            index,
            this._pressedValue ?? this._hoveredValue ?? value,
            !this.readonly,
          ),
        )}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'ibk-rating': IbkRating;
  }
}
