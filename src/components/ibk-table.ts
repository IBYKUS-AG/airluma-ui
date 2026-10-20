import { LitElement, html, nothing } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
import type { IbkTableHeader } from '../utils/types';

/**
 * IBK-Table Component
 * @summary A professional table component following the IBYKUS design system.
 * Supports zebra rows, cross-hover effects, and professional header/footer layouts.
 */
@customElement('ibk-table')
export class IbkTable extends LitElement {
  createRenderRoot() {
    return this;
  }

  /**
   * The visual variant of the table ('regular' or 'decent').
   * 'regular' uses standard spacing, 'decent' is more compact.
   */
  @property({ type: String, reflect: true }) variant: 'regular' | 'decent' = 'regular';

  /**
   * Whether to display zebra coloring (alternating row backgrounds).
   */
  @property({ type: Boolean, reflect: true }) zebra = false;

  /**
   * Whether to enable the cross-hover effect (highlights both row and column).
   */
  @property({ type: Boolean, reflect: true }) hover = false;

  /**
   * Optional caption text displayed above the table.
   */
  @property({ type: String, reflect: true }) caption?: string;

  /**
   * Configuration for table headers.
   */
  @property({ type: Array }) headers: IbkTableHeader[] = [];

  /**
   * Data for table rows. Each element can be a string (HTML allowed) or an object.
   */
  @property({ type: Array }) rows: any[][] = [];

  /**
   * Optional data for table footer. Matches row format.
   */
  @property({ type: Array }) footers: any[] = [];

  /**
   * tracks the currently hovered column index for the cross-hover effect.
   */
  @state() private _hoveredColumnIndex: number | null = null;

  private _handleMouseOver(e: MouseEvent) {
    if (!this.hover) return;
    const target = e.target as HTMLElement;
    const cell = target.closest('td, th') as HTMLTableCellElement;
    if (cell) {
      this._hoveredColumnIndex = cell.cellIndex;
    }
  }

  private _handleMouseOut() {
    if (!this.hover) return;
    this._hoveredColumnIndex = null;
  }

  render() {
    const tableClasses = {
      ibkTable: true,
      'ibkTable-decent': this.variant === 'decent',
      'ibkTable-zebra': this.zebra,
    };

    return html`
      <div class="ibkTable-container" @mouseover=${this._handleMouseOver} @mouseout=${this._handleMouseOut}>
        <table class=${classMap(tableClasses)}>
          ${this.caption ? html`<caption>${this.caption}</caption>` : nothing}
          
          ${this.headers && this.headers.length > 0 ? html`
            <thead>
              <tr>
                ${this.headers.map((header, index) => html`
                  <th class=${classMap({
      [header.align || '']: !!header.align,
      [header.class || '']: !!header.class,
      'hovered-col': this._hoveredColumnIndex === index
    })}>
                    ${header.label ? unsafeHTML(header.label) : ''}
                    ${header.icon ? html`<i>${unsafeHTML(header.icon)}</i>` : nothing}
                  </th>
                `)}
              </tr>
            </thead>
          ` : nothing}

          <tbody>
            ${this.rows.map(row => html`
              <tr>
                ${row.map((cell, index) => {
      const isObj = typeof cell === 'object' && cell !== null;
      const content = isObj ? cell.content : cell;
      const align = isObj ? cell.align : '';
      const className = isObj ? cell.class : '';

      const cellClasses = {
        [align]: !!align,
        [className]: !!className,
        'hovered-col': this._hoveredColumnIndex === index
      };

      return html`
                    <td class=${classMap(cellClasses)}>
                      ${unsafeHTML(content)}
                    </td>
                  `;
    })}
              </tr>
            `)}
          </tbody>

          ${this.footers && this.footers.length > 0 ? html`
            <tfoot>
              <tr>
                ${this.footers.map((cell, index) => {
      const isObj = typeof cell === 'object' && cell !== null;
      const content = isObj ? cell.content : cell;
      const align = isObj ? cell.align : '';
      const className = isObj ? cell.class : '';

      return html`
                    <td class=${classMap({
        [align]: !!align,
        [className]: !!className,
        'hovered-col': this._hoveredColumnIndex === index
      })}>
                      ${unsafeHTML(content)}
                    </td>
                  `;
    })}
              </tr>
            </tfoot>
          ` : nothing}
        </table>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'ibk-table': IbkTable;
  }
}
