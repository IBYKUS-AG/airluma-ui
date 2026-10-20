import { LitElement, html, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import type { BreadcrumbItem, LinkVariant } from '../utils/types';
import './ibk-link';

/**
 * IBK-Breadcrumb Component
 * @summary A navigation breadcrumb trail showing the current page location.
 */
@customElement('ibk-breadcrumb')
export class IbkBreadcrumb extends LitElement {
  createRenderRoot() {
    return this;
  }

  /**
   * Array of breadcrumb items to display.
   * Each item should have a label and optionally an href.
   */
  @property({ type: Array, attribute: false }) items?: BreadcrumbItem[];

  /**
   * Visual variant applied to the inner links.
   */
  @property({ type: String, reflect: true }) variant: LinkVariant = 'regular';

  private readonly _iconBack = '\uE91E';
  private readonly _iconSeparator = '\uE922';

  private _renderLink(item: BreadcrumbItem) {
    return html`
      <ibk-link
        href="${item.href || '#'}"
        label="${item.label}"
        variant="${this.variant}"
      ></ibk-link>
    `;
  }

  render() {
    const items = this.items || [];
    const count = items.length;

    if (count === 0) return nothing;

    const classes = {
      ibkBreadcrumb: true,
      single: count === 1,
    };

    if (count === 1) {
      return html`
        <nav class=${classMap(classes)} aria-label="Breadcrumb">
          <span class="breadcrumb-element">
            <i class="ibkIcon" aria-hidden="true">${this._iconBack}</i>
            ${this._renderLink(items[0])}
          </span>
        </nav>
      `;
    }

    return html`
      <nav class=${classMap(classes)} aria-label="Breadcrumb">
        ${items.map((item, index) => {
          const isFirst = index === 0;
          const isLast = index === count - 1;

          const separator = isFirst
            ? nothing
            : html`<i class="ibkIcon" aria-hidden="true">${this._iconSeparator}</i>`;

          if (isLast) {
            return html`
              <span class="breadcrumb-element current" aria-current="page">
                ${separator} ${item.label}
              </span>
            `;
          }

          return html`
            <span class="breadcrumb-element">
              ${separator} ${this._renderLink(item)}
            </span>
          `;
        })}
      </nav>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'ibk-breadcrumb': IbkBreadcrumb;
  }
}
