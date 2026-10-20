import { LitElement, html, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import type { NavigationMenuItemVariant } from '../utils/types';

/**
 * IBK-NavigationMenuItem Component
 * @summary A navigation menu item button with selected and prominent states.
 */
@customElement('ibk-navigation-menu-item')
export class IbkNavigationMenuItem extends LitElement {
  createRenderRoot() {
    return this;
  }

  /**
   * The text label displayed inside the navigation menu item.
   */
  @property({ type: String, reflect: true }) label?: string;

  /**
   * The leading icon to display.
   */
  @property({ type: String, reflect: true }) icon?: string = 'Home';

  /**
   * Whether to show the trailing icon.
   */
  @property({ type: Boolean, reflect: true }) showTrailingIcon = true;

  /**
   * The trailing icon to display while `showTrailingIcon` is true.
   * Falls back to the chevron `ChevD` when not set.
   */
  @property({ type: String, reflect: true }) trailingIcon?: string;

  /**
   * Keyboard shortcut hint on the trailing edge, e.g. `Strg + S`. Ignored while
   * `showTrailingIcon` is true - an item that opens something shows that icon there
   * instead, so the two never collide (mirrors `DropdownItem.shortcut`).
   */
  @property({ type: String, reflect: true }) shortcut?: string;

  /**
   * Whether the navigation menu item is disabled.
   */
  @property({ type: Boolean, reflect: true }) disabled = false;

  /**
   * Whether the navigation menu item is selected.
   */
  @property({ type: Boolean, reflect: true }) selected = false;

  /**
   * The visual variant of the navigation menu item.
   */
  @property({ type: String, reflect: true }) variant: NavigationMenuItemVariant = 'regular';

  /**
   * Whether the navigation menu item is displayed inside a dropdown.
   */
  @property({ type: Boolean, reflect: true }) dropdown = false;

  /** Default trailing glyph, used whenever `trailingIcon` is not set. */
  private static readonly DEFAULT_TRAILING_ICON = 'ChevD';

  render() {
    // Ligature glyphs must not be surrounded by whitespace, so the fallback is
    // resolved here instead of inside the template.
    const trailingIcon = this.trailingIcon || IbkNavigationMenuItem.DEFAULT_TRAILING_ICON;

    const classes = {
      ibkButton: true,
      'ibkButton-menu': true,
      ibkNavigationMenuItem: true,
      regular: this.variant === 'regular' || !this.variant,
      prominent: this.variant === 'prominent',
      selected: this.selected,
      dropdown: this.dropdown,
      'ibkIcon-leading': !!this.icon,
      'ibkIcon-trailing': this.showTrailingIcon,
    };

    return html`
      <button type="button" class=${classMap(classes)} ?disabled=${this.disabled}>
        ${this.icon
          ? html`<i class="ibkIcon ibkNavigationMenuItem-leadingIcon">${this.icon}</i>`
          : nothing}
        <span class="ibkButtonText">${this.label}</span>
        ${this.showTrailingIcon
          ? html`<i class="ibkIcon ibkNavigationMenuItem-trailingIcon">${trailingIcon}</i>`
          : this.shortcut
            ? html`<span class="ibkNavigationMenuItem-shortcut">${this.shortcut}</span>`
            : nothing}
      </button>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'ibk-navigation-menu-item': IbkNavigationMenuItem;
  }
}
