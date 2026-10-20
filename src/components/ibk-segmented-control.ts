import { LitElement, html, nothing } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import type { SegmentedControlDominance, SegmentedControlItem } from '../utils/types';

/** Keys that move focus between segments, mapped to the direction they move it in. */
const STEP_KEYS: Record<string, number> = {
  ArrowRight: 1,
  ArrowDown: 1,
  ArrowLeft: -1,
  ArrowUp: -1,
};

/**
 * IBK-Segmented-Control Component
 * @summary A pill-shaped row of mutually exclusive segments, used to switch
 * quickly between a small set of closely related views. Exactly one segment is
 * selected at a time; `dominance` picks the fill of that selected segment —
 * `regular` (petrol) or `prominent` (red).
 *
 * @fires segment-change - Dispatched when the user selects another segment, via a
 * click or via Enter/Space on a focused one. Tab and the arrow keys only move
 * focus between segments (like a toolbar of toggle buttons) and never select on
 * their own — Home and End jump to the first / last enabled segment.
 */
@customElement('ibk-segmented-control')
export class IbkSegmentedControl extends LitElement {
  createRenderRoot() {
    return this;
  }

  /**
   * Array of segments. A segment renders a leading icon when it carries an
   * `icon` (an IBYKUS-Iconset ligature), and none when it does not. Because this
   * is an array property (not a string attribute), set it via JavaScript, e.g.
   * `document.querySelector('ibk-segmented-control').items = [{ label: 'Segment One', icon: 'Home' }]`.
   */
  @property({ type: Array }) items: SegmentedControlItem[] = [];

  /**
   * Colour of the selected segment: `regular` (petrol) or `prominent` (red).
   */
  @property({ type: String, reflect: true }) dominance?: SegmentedControlDominance = 'regular';

  /**
   * Accessible name of the group as a whole (e.g. "View mode").
   */
  @property({ type: String }) label?: string;

  /**
   * Disables every segment.
   */
  @property({ type: Boolean, reflect: true }) disabled?: boolean;

  /**
   * Internal state to track the selected segment if not controlled via props.
   */
  @state() private _activeIndex = -1;

  /**
   * Whether the next thumb placement should animate. Only a user-driven change
   * slides; the first paint and any relayout jump straight to the new position.
   */
  private _animateThumb = false;

  /** Keeps the thumb aligned when the control is resized or a webfont lands. */
  private _resizeObserver?: ResizeObserver;

  protected firstUpdated() {
    const root = this.querySelector('.ibkSegmentedControl');
    if (!root || !('ResizeObserver' in window)) return;

    this._resizeObserver = new ResizeObserver(() => this._placeThumb(false));
    this._resizeObserver.observe(root);
  }

  protected updated() {
    this._placeThumb(this._animateThumb);
    this._animateThumb = false;
  }

  disconnectedCallback() {
    this._resizeObserver?.disconnect();
    this._resizeObserver = undefined;
    super.disconnectedCallback();
  }

  /**
   * Lays the thumb over the selected segment. The segments themselves are
   * transparent — the thumb is the only thing carrying the selected fill, which
   * is what lets it slide between them instead of blinking from one to the next.
   */
  private _placeThumb(animate: boolean) {
    const root = this.querySelector<HTMLElement>('.ibkSegmentedControl');
    const thumb = this.querySelector<HTMLElement>('.ibkSegmentedControl-thumb');
    if (!root || !thumb) return;

    const segment = this.querySelectorAll<HTMLElement>('button.ibkSegmentedControl-segment')[
      this._getActiveIndex()
    ];

    // Every segment disabled: there is nothing to sit under.
    if (!segment) {
      thumb.style.opacity = '0';
      return;
    }

    // `offsetWidth` / `offsetLeft` round to whole pixels. Under a fractional OS
    // or browser zoom that rounding can leave the thumb up to 1px narrower or
    // shifted than the segment underneath it, uncovering a sliver of the pill
    // corner behind the focus ring. `getBoundingClientRect()` keeps the
    // sub-pixel value the browser actually painted, so the two line up exactly.
    // The border is a fixed integer (2px), so `clientLeft` safely converts from
    // the border box `getBoundingClientRect()` returns to the padding box the
    // absolutely positioned thumb is placed against.
    const rootRect = root.getBoundingClientRect();
    const segmentRect = segment.getBoundingClientRect();

    // Suppressing the transition needs the new geometry flushed before the
    // property is handed back to the stylesheet, otherwise the browser coalesces
    // both writes and animates anyway.
    if (!animate) thumb.style.transition = 'none';
    thumb.style.opacity = '';
    thumb.style.width = `${segmentRect.width}px`;
    thumb.style.transform = `translateX(${segmentRect.left - rootRect.left - root.clientLeft}px)`;
    if (!animate) {
      thumb.getBoundingClientRect();
      thumb.style.transition = '';
    }
  }

  private _getActiveIndex(): number {
    if (this._activeIndex >= 0 && !this.items[this._activeIndex]?.disabled) {
      return this._activeIndex;
    }

    const preset = this.items.findIndex((item) => item.active && !item.disabled);
    if (preset >= 0) return preset;

    return this.items.findIndex((item) => !item.disabled);
  }

  private _selectSegment(index: number) {
    if (this.disabled || this.items[index]?.disabled || index === this._getActiveIndex()) return;

    this._animateThumb = true;
    this._activeIndex = index;

    this.dispatchEvent(
      new CustomEvent('segment-change', {
        detail: { index, item: this.items[index] },
        bubbles: true,
        composed: true,
      }),
    );
  }

  /**
   * Moves focus `step` segments away from `from`, skipping disabled ones and
   * wrapping around at both ends. Selection is untouched — every segment is its
   * own tab stop and stays that way regardless of which one is selected, unlike
   * a native radio group where only the checked input is tabbable.
   */
  private _stepFocus(from: number, step: number) {
    const count = this.items.length;
    if (!count) return;

    for (let offset = 1; offset <= count; offset++) {
      const next = (((from + step * offset) % count) + count) % count;
      if (!this.items[next]?.disabled) {
        this.querySelectorAll<HTMLButtonElement>('button.ibkSegmentedControl-segment')[
          next
        ]?.focus();
        return;
      }
    }
  }

  private _handleKeydown(e: KeyboardEvent, index: number) {
    if (this.disabled) return;

    const step = STEP_KEYS[e.key];
    if (step) {
      e.preventDefault();
      this._stepFocus(index, step);
      return;
    }

    if (e.key === 'Home' || e.key === 'End') {
      e.preventDefault();
      // Step off the far end so the first / last enabled segment is the first hit.
      this._stepFocus(e.key === 'Home' ? -1 : this.items.length, e.key === 'Home' ? 1 : -1);
    }
  }

  private _renderSegment(item: SegmentedControlItem, index: number, activeIndex: number) {
    const selected = index === activeIndex;

    return html`
      <button
        class=${classMap({
          'ibkSegmentedControl-segment': true,
          selected,
        })}
        type="button"
        aria-pressed=${selected ? 'true' : 'false'}
        ?disabled=${this.disabled || item.disabled}
        @click=${() => this._selectSegment(index)}
        @keydown=${(e: KeyboardEvent) => this._handleKeydown(e, index)}
      >
        ${item.icon ? html`<i class="ibkIcon" aria-hidden="true">${item.icon}</i>` : nothing}
        <span class="ibkSegmentedControl-label">${item.label}</span>
      </button>
    `;
  }

  render() {
    const activeIndex = this._getActiveIndex();

    const classes = {
      ibkSegmentedControl: true,
      [`ibkSegmentedControl-${this.dominance}`]: !!this.dominance,
    };

    return html`
      <div class=${classMap(classes)} role="group" aria-label=${ifDefined(this.label)}>
        <span class="ibkSegmentedControl-thumb" aria-hidden="true"></span>
        ${this.items.map((item, index) => this._renderSegment(item, index, activeIndex))}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'ibk-segmented-control': IbkSegmentedControl;
  }
}
