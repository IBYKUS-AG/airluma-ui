import { LitElement, html, nothing } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import './ibk-badge';

export type TabItem = {
  label: string;
  /**
   * `id` of the `ibk-tabs-content` child holding this tab's section. Without it
   * the tab has no section and only reports the selection through the event.
   */
  id?: string;
  icon?: string;
  active?: boolean;
  disabled?: boolean;
  badge?: string;
  badgeLabel?: string;
};

let tabsInstanceId = 0;

/**
 * IBK-Tabs-Content Component
 * @summary The section belonging to one tab. Pass one per tab as a child of the
 * tabs element and give it the `id` that tab points at; the section itself holds
 * any markup the page needs. The tabs element shows the section of the selected
 * tab and hides the other ones.
 */
@customElement('ibk-tabs-content')
export class IbkTabsContent extends LitElement {
  createRenderRoot() {
    return this;
  }

  connectedCallback() {
    super.connectedCallback();
    // The children of this element are the section; nothing is rendered around
    // them, so the class and the role are the whole contribution here.
    this.classList.add('ibkTabs-content');
    this.setAttribute('role', 'tabpanel');
  }
}

/**
 * IBK-Tabs Component
 * @summary A horizontal set of tabs used to sort page content into selectable
 * sections. Every tab names the `ibk-tabs-content` child it shows through a
 * shared `id`, so a section can hold any markup the page provides. Tabs without
 * a matching section only report the selection through their event. The tab
 * list is a single tab stop; the arrow keys, Home and End select another tab.
 * @fires tab-change - Dispatched when the user selects another tab. `detail`
 * carries `{ index, item }` of the selected tab.
 */
@customElement('ibk-tabs')
export class IbkTabs extends LitElement {
  createRenderRoot() {
    return this;
  }

  /**
   * Array of tab items. A tab shows the `ibk-tabs-content` child whose `id`
   * matches its own, and renders a leading icon when it carries an `icon` (an
   * IBYKUS-Iconset ligature). Because this is an array property (not a string
   * attribute), set it via JavaScript, e.g.
   * `document.querySelector('ibk-tabs').items = [{ label: 'Home', icon: 'Home', id: 'tab-home' }]`.
   */
  @property({ type: Array }) items: TabItem[] = [];

  /**
   * Whether to append the optional rail: an empty tab without label and icon that
   * continues the underline over the remaining space of the tab list.
   */
  @property({ type: Boolean, reflect: true }) rail = false;

  /**
   * Internal state to track the active tab if not controlled via props.
   */
  @state() private _activeIndex = -1;

  private readonly _uid = `ibkTabs-${tabsInstanceId++}`;

  /**
   * The `ibk-tabs-content` children, taken over before the first render. Without
   * a shadow DOM there is no slot to project them through, so they are rendered
   * as part of the template instead — below the tab list and inside the same
   * container, which is what the `.ibkTabs .ibkTabs-content` styles expect.
   */
  private _sections: HTMLElement[] = [];
  private _captured = false;

  connectedCallback() {
    if (!this._captured) {
      this._captured = true;

      // Matched by tag name, not `instanceof`: the children are not necessarily
      // upgraded yet at this point. Only direct children count, so tabs nested
      // inside a section keep their own.
      this._sections = Array.from(this.children).filter(
        (child): child is HTMLElement => child.localName === 'ibk-tabs-content',
      );
    }

    super.connectedCallback();
  }

  private _sectionFor(item: TabItem) {
    return item.id ? this._sections.find((section) => section.id === item.id) : undefined;
  }

  protected updated() {
    const activeIndex = this._getActiveIndex();

    // Paired again on every render: `items` — and with it the id a tab points
    // at — can change at any time.
    this._sections.forEach((section) => section.classList.remove('active'));

    this.items.forEach((item, index) => {
      const section = this._sectionFor(item);
      if (!section) return;

      section.setAttribute('aria-labelledby', `${this._uid}-tab-${index}`);
      section.classList.toggle('active', index === activeIndex);
    });
  }

  private _selectTab(index: number) {
    const item = this.items[index];
    if (!item || item.disabled || index === this._getActiveIndex()) return;

    this._activeIndex = index;
    this.requestUpdate();

    this.dispatchEvent(
      new CustomEvent('tab-change', {
        detail: { index, item },
        bubbles: true,
        composed: true,
      }),
    );
  }

  /**
   * Arrow keys, Home and End move through the enabled tabs and select the one
   * they land on (automatic activation, WAI-ARIA tabs pattern). The arrows wrap
   * around at both ends.
   */
  private async _handleKeydown(e: KeyboardEvent) {
    const enabled = this.items.flatMap((item, index) => (item.disabled ? [] : [index]));
    if (!enabled.length) return;

    const current = enabled.indexOf(this._getActiveIndex());
    let next: number;

    switch (e.key) {
      case 'ArrowRight':
        next = enabled[(current + 1) % enabled.length];
        break;
      case 'ArrowLeft':
        next = enabled[(current - 1 + enabled.length) % enabled.length];
        break;
      case 'Home':
        next = enabled[0];
        break;
      case 'End':
        next = enabled[enabled.length - 1];
        break;
      default:
        return;
    }

    e.preventDefault();
    this._selectTab(next);

    // The roving tabindex moves with the selection, so focus follows once the
    // new tab is rendered as the focusable one.
    await this.updateComplete;
    this.querySelector<HTMLButtonElement>(`#${this._uid}-tab-${next}`)?.focus();
  }

  private _getActiveIndex(): number {
    if (this._activeIndex >= 0 && !this.items[this._activeIndex]?.disabled) {
      return this._activeIndex;
    }

    const preset = this.items.findIndex((item) => item.active && !item.disabled);
    if (preset >= 0) return preset;

    return this.items.findIndex((item) => !item.disabled);
  }

  private _renderTab(item: TabItem, index: number, activeIndex: number) {
    const labelNode = html`<span class="ibkTabText">${item.label}</span>`;
    const ariaLabel = item.badge && item.badgeLabel ? `${item.label}, ${item.badgeLabel}` : nothing;

    return html`
      <button
        class=${classMap({
          ibkTab: true,
          selected: index === activeIndex,
        })}
        id="${this._uid}-tab-${index}"
        type="button"
        role="tab"
        aria-selected=${index === activeIndex ? 'true' : 'false'}
        tabindex=${index === activeIndex ? '0' : '-1'}
        aria-controls=${ifDefined(this._sectionFor(item)?.id)}
        aria-label=${ariaLabel}
        ?disabled=${item.disabled}
        @click=${() => this._selectTab(index)}
      >
        ${item.icon ? html`<i class="ibkIcon" aria-hidden="true">${item.icon}</i>` : nothing}
        ${item.badge ? html`<ibk-badge count=${item.badge}>${labelNode}</ibk-badge>` : labelNode}
      </button>
    `;
  }

  render() {
    const activeIndex = this._getActiveIndex();

    return html`
      <div class="ibkTabs">
        <div
          class="ibkTabs-list"
          role="tablist"
          aria-orientation="horizontal"
          @keydown=${(e: KeyboardEvent) => this._handleKeydown(e)}
        >
          ${this.items.map((item, index) => this._renderTab(item, index, activeIndex))}
          ${this.rail ? html`<span class="ibkTabs-rail" aria-hidden="true"></span>` : nothing}
        </div>

        ${this._sections}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'ibk-tabs': IbkTabs;
    'ibk-tabs-content': IbkTabsContent;
  }
}
