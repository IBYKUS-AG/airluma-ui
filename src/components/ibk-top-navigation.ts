import { LitElement, html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import type { TopNavigationItem } from '../utils/types';

/** Keys that move focus between items, mapped to the direction they move it in. */
const STEP_KEYS: Record<string, number> = {
  ArrowRight: 1,
  ArrowDown: 1,
  ArrowLeft: -1,
  ArrowUp: -1,
};

/**
 * IBK-Top-Navigation Component
 * @summary A horizontal bar of text-only links to an application's top-level
 * destinations ("Start", "Info", "Themen", "Kontakt"). Exactly one item is the
 * current destination and carries the accent colour plus an underline indicator;
 * hover and pressed underline the label as well, and focus draws the blue ring.
 *
 * Only for top level navigation, and only without eIB decorations: the underline
 * indicator sits exactly where an eIB decoration would go, so the two cannot be
 * combined. Items therefore carry no icons at all.
 *
 * The bar draws no background of its own, so it takes on whatever surface it is
 * placed on.
 *
 * @fires navigation-change - Dispatched when the user activates an item, through a
 * click or through Enter/Space on a focused one. `detail` carries `{ index, item }`.
 * An item with an `href` still follows its link; the event only reports which
 * destination was picked, and the app decides what that means.
 */
@customElement('ibk-top-navigation')
export class IbkTopNavigation extends LitElement {
  createRenderRoot() {
    return this;
  }

  /**
   * Array of destinations. Every item needs a `label` — the bar is text-only by
   * design. An item with an `href` renders as a link, one without as a button that
   * only reports the click. Because this is an array property (not a string
   * attribute), set it via JavaScript, e.g.
   * `document.querySelector('ibk-top-navigation').items = [{ label: 'Start', href: '/' }]`.
   */
  @property({ type: Array }) items: TopNavigationItem[] = [];

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
        this.querySelectorAll<HTMLElement>('.ibkTopNavigation-item')[next]?.focus();
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

  private _renderItem(item: TopNavigationItem, index: number, activeIndex: number) {
    const selected = index === activeIndex;
    const disabled = !!this.disabled || !!item.disabled;

    const classes = classMap({
      'ibkTopNavigation-item': true,
      selected,
    });

    // The same stroke carries every underline: the one marking the current
    // destination and the one hover and pressed draw. It is a child of the item
    // rather than a text-decoration so it sits on its own line below the label, and
    // it is rendered on every item (transparent until a state asks for it) so
    // underlining one never changes the height of the bar.
    const content = html`
      <span class="ibkTopNavigation-label">${item.label}</span>
      <span class="ibkTopNavigation-indicator" aria-hidden="true"></span>
    `;

    // A destination with an `href` is a real link, so it keeps the browser's own
    // navigation (middle-click, "open in new tab", the status bar). A disabled one
    // must not navigate, so it falls back to the button branch, which can carry the
    // native `disabled`.
    if (item.href && !disabled) {
      return html`
        <li class="ibkTopNavigation-listItem">
          <a
            class=${classes}
            href=${item.href}
            aria-current=${ifDefined(selected ? 'page' : undefined)}
            title=${ifDefined(item.title)}
            @click=${() => this._selectItem(index)}
            @keydown=${(e: KeyboardEvent) => this._handleKeydown(e, index)}
          >
            ${content}
          </a>
        </li>
      `;
    }

    return html`
      <li class="ibkTopNavigation-listItem">
        <button
          class=${classes}
          type="button"
          aria-current=${ifDefined(selected ? 'page' : undefined)}
          title=${ifDefined(item.title)}
          ?disabled=${disabled}
          @click=${() => this._selectItem(index)}
          @keydown=${(e: KeyboardEvent) => this._handleKeydown(e, index)}
        >
          ${content}
        </button>
      </li>
    `;
  }

  render() {
    const activeIndex = this._getActiveIndex();

    return html`
      <nav class="ibkTopNavigation" aria-label=${ifDefined(this.label)}>
        <ul class="ibkTopNavigation-list">
          ${this.items.map((item, index) => this._renderItem(item, index, activeIndex))}
        </ul>
      </nav>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'ibk-top-navigation': IbkTopNavigation;
  }
}
