import { LitElement, html, nothing } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import type {
  BottomNavigationDominance,
  BottomNavigationItem,
  BottomNavigationVariant,
} from '../utils/types';

/** Keys that move focus between items, mapped to the direction they move it in. */
const STEP_KEYS: Record<string, number> = {
  ArrowRight: 1,
  ArrowDown: 1,
  ArrowLeft: -1,
  ArrowUp: -1,
};

/**
 * IBK-Bottom-Navigation Component
 * @summary A bar of primary destinations pinned to the bottom of a view, each one
 * an icon stacked over its label. Exactly one item is the current destination and
 * carries the selected fill; `dominance` picks that fill — `regular` (petrol) or
 * `prominent` (red). `variant` picks the size of the bar: `regular` for a roomier
 * bar and `decent` for a compact one.
 *
 * The bar draws no background of its own, so it takes on whatever surface it is
 * placed on.
 *
 * @fires navigation-change - Dispatched when the user activates an item, through a
 * click or through Enter/Space on a focused one. `detail` carries `{ index, item }`.
 * The bar never navigates on its own — it only reports which destination was picked,
 * and the app decides what that means.
 */
@customElement('ibk-bottom-navigation')
export class IbkBottomNavigation extends LitElement {
  createRenderRoot() {
    return this;
  }

  /**
   * Array of destinations. An item renders an icon when it carries an `icon` (an
   * IBYKUS-Iconset ligature) and a caption when it carries a `label`; leaving one
   * out drops that part, so an icon-only or a text-only bar needs no extra flag.
   * Because this is an array property (not a string attribute), set it via
   * JavaScript, e.g.
   * `document.querySelector('ibk-bottom-navigation').items = [{ label: 'Startseite', icon: 'Home' }]`.
   */
  @property({ type: Array }) items: BottomNavigationItem[] = [];

  /**
   * Size of the bar: `regular` (120x66 items, 8px gap) or `decent` (84x52 items,
   * 4px gap).
   */
  @property({ type: String, reflect: true }) variant?: BottomNavigationVariant = 'regular';

  /**
   * Colour of the selected item: `regular` (petrol) or `prominent` (red).
   */
  @property({ type: String, reflect: true }) dominance?: BottomNavigationDominance = 'regular';

  /**
   * Accessible name of the navigation landmark as a whole (e.g. "Hauptnavigation").
   * A page with more than one landmark needs this to tell them apart.
   */
  @property({ type: String }) label?: string;

  /**
   * Disables every item.
   */
  @property({ type: Boolean, reflect: true }) disabled?: boolean;

  /**
   * Internal state to track the selected item if not controlled via props.
   */
  @state() private _activeIndex = -1;

  private _getActiveIndex(): number {
    if (this._activeIndex >= 0 && !this.items[this._activeIndex]?.disabled) {
      return this._activeIndex;
    }

    return this.items.findIndex((item) => item.active && !item.disabled);
  }

  private _selectItem(index: number) {
    if (this.disabled || this.items[index]?.disabled) return;

    this._activeIndex = index;

    this.dispatchEvent(
      new CustomEvent('navigation-change', {
        detail: { index, item: this.items[index] },
        bubbles: true,
        composed: true,
      }),
    );
  }

  /**
   * Moves focus `step` items away from `from`, skipping disabled ones and wrapping
   * around at both ends. Selection is untouched — every enabled item is its own tab
   * stop and stays that way regardless of which one is current, so Tab reaches all
   * of them and the arrow keys are only a shortcut along the bar.
   */
  private _stepFocus(from: number, step: number) {
    const count = this.items.length;
    if (!count) return;

    for (let offset = 1; offset <= count; offset++) {
      const next = (((from + step * offset) % count) + count) % count;
      if (!this.items[next]?.disabled) {
        this.querySelectorAll<HTMLElement>('.ibkBottomNavigation-item')[next]?.focus();
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
      // Step off the far end so the first / last enabled item is the first hit.
      this._stepFocus(e.key === 'Home' ? -1 : this.items.length, e.key === 'Home' ? 1 : -1);
    }
  }

  private _renderItem(item: BottomNavigationItem, index: number, activeIndex: number) {
    const selected = index === activeIndex;

    // The label doubles as the accessible name; an icon-only item has nothing to
    // read out, so its `title` (falling back to the ligature) has to stand in.
    const accessibleName = item.label ? undefined : (item.title ?? item.icon);

    return html`
      <li class="ibkBottomNavigation-listItem">
        <button
          class=${classMap({
            'ibkBottomNavigation-item': true,
            selected,
          })}
          type="button"
          aria-current=${ifDefined(selected ? 'page' : undefined)}
          aria-label=${ifDefined(accessibleName)}
          title=${ifDefined(item.title)}
          ?disabled=${this.disabled || item.disabled}
          @click=${() => this._selectItem(index)}
          @keydown=${(e: KeyboardEvent) => this._handleKeydown(e, index)}
        >
          ${item.icon ? html`<i class="ibkIcon" aria-hidden="true">${item.icon}</i>` : nothing}
          ${item.label
            ? html`<span class="ibkBottomNavigation-label">${item.label}</span>`
            : nothing}
        </button>
      </li>
    `;
  }

  render() {
    const activeIndex = this._getActiveIndex();

    const classes = {
      ibkBottomNavigation: true,
      [`ibkBottomNavigation-${this.variant}`]: !!this.variant,
      [`ibkBottomNavigation-dominance-${this.dominance}`]: !!this.dominance,
    };

    return html`
      <nav class=${classMap(classes)} aria-label=${ifDefined(this.label)}>
        <ul class="ibkBottomNavigation-list">
          ${this.items.map((item, index) => this._renderItem(item, index, activeIndex))}
        </ul>
      </nav>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'ibk-bottom-navigation': IbkBottomNavigation;
  }
}
