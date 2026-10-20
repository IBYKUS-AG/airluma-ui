import { LitElement, html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
import type { PropertyValues } from 'lit';
import type { AccordionIconPosition, AccordionItem } from '../utils/types';

export type { AccordionItem } from '../utils/types';

let accordionInstanceId = 0;

/**
 * IBK-Accordion Component
 * @summary A vertically stacked list of sections whose content can be expanded
 * or collapsed. Only one section is open at a time — opening a section closes
 * the previously open one. Each section shows a legend with a chevron icon;
 * activating the legend toggles its panel with a sliding animation. The chevron
 * can sit after the legend (`trailing`, default) or before it (`leading`).
 *
 * @fires toggle - Dispatched when a section is expanded or collapsed. `detail`
 * carries `{ index, open }` for the activated section.
 */
@customElement('ibk-accordion')
export class IbkAccordion extends LitElement {
  createRenderRoot() {
    return this;
  }

  /**
   * Array of accordion items.
   */
  @property({ type: Array }) items: AccordionItem[] = [];

  /**
   * Position of the chevron icon relative to the legend.
   */
  @property({ type: String, reflect: true }) iconPosition?: AccordionIconPosition = 'trailing';

  /**
   * Index of the section currently expanded, or `null` when all are collapsed.
   */
  @state() private _openIndex: number | null = null;

  private readonly _uid = `ibkAccordion-${accordionInstanceId++}`;

  willUpdate(changed: PropertyValues<this>) {
    // Seed the open section from the first item flagged `active` whenever the
    // data changes; only one section can be open at a time.
    if (changed.has('items')) {
      const firstActive = this.items.findIndex((item) => item.active);
      this._openIndex = firstActive >= 0 ? firstActive : null;
    }
  }

  private _toggle(index: number) {
    if (this.items[index]?.disabled) return;

    const open = this._openIndex !== index;
    this._openIndex = open ? index : null;

    this.dispatchEvent(
      new CustomEvent('toggle', {
        detail: { index, open },
        bubbles: true,
        composed: true,
      }),
    );
  }

  private _renderItem(item: AccordionItem, index: number) {
    const open = this._openIndex === index;
    const triggerId = `${this._uid}-trigger-${index}`;
    const panelId = `${this._uid}-panel-${index}`;

    return html`
      <div
        class=${classMap({
          'ibkAccordion-item': true,
          active: open,
          disabled: !!item.disabled,
        })}
      >
        <button
          type="button"
          id=${triggerId}
          class=${classMap({
            'ibkAccordion-trigger': true,
            [`ibkAccordion-${this.iconPosition ?? 'trailing'}`]: true,
          })}
          aria-expanded=${open ? 'true' : 'false'}
          aria-controls=${panelId}
          ?disabled=${item.disabled}
          @click=${() => this._toggle(index)}
        >
          <span class="ibkAccordion-legend">${item.title}</span>
          <i class="ibkIcon ibkAccordion-icon" aria-hidden="true"
            >${open ? 'ChevUBig' : 'ChevDBig'}</i
          >
        </button>
        <div
          id=${panelId}
          class="ibkAccordion-panel"
          role="region"
          aria-labelledby=${triggerId}
          ?inert=${!open}
        >
          <div class="ibkAccordion-panelInner">
            <div class="ibkAccordion-content">${unsafeHTML(item.content)}</div>
          </div>
        </div>
      </div>
    `;
  }

  render() {
    return html`
      <div class="ibkAccordion">
        ${this.items.map((item, index) => this._renderItem(item, index))}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'ibk-accordion': IbkAccordion;
  }
}
