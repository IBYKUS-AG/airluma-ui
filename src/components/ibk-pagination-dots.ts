import { LitElement, html, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';

export type PaginationDotsSize = 'small' | 'medium' | 'large';
export type PaginationDotsVariant = 'regular' | 'prominent';

const paginationDotsIconNames: Record<PaginationDotsSize, 'Mark12' | 'Mark16' | 'Mark20'> = {
  small: 'Mark12',
  medium: 'Mark16',
  large: 'Mark20',
};

/**
 * IBK-PaginationDots Component
 * @summary A compact dot navigation control for paginated content.
 * @fires page-change - Dispatched when the user requests another page.
 */
@customElement('ibk-pagination-dots')
export class IbkPaginationDots extends LitElement {
  createRenderRoot() {
    return this;
  }

  /**
   * Current active page.
   */
  @property({ type: Number, reflect: true }) currentPage = 1;

  /**
   * Total number of pages.
   */
  @property({ type: Number, reflect: true }) totalPages = 1;

  /**
   * Dot size.
   */
  @property({ type: String, reflect: true }) size: PaginationDotsSize = 'medium';

  /**
   * Visual variant of the selected dot.
   */
  @property({ type: String, reflect: true }) variant: PaginationDotsVariant = 'regular';

  /**
   * Whether to use the prominent style. Kept for backwards compatibility.
   */
  @property({ type: Boolean, reflect: true }) prominent = false;

  /**
   * Whether the pagination dots are disabled.
   */
  @property({ type: Boolean, reflect: true }) disabled = false;

  /**
   * Accessible label for the pagination dots navigation.
   */
  @property({ type: String, attribute: 'navigation-label' }) navigationLabel = 'Pagination dots';

  private _onDotClick(page: number) {
    const totalPages = this._getTotalPages();
    const currentPage = this._getCurrentPage(totalPages);
    const nextPage = this._getBoundedPage(page, totalPages);

    if (this.disabled || nextPage === currentPage) return;

    this.dispatchEvent(
      new CustomEvent('page-change', {
        detail: {
          page: nextPage,
          previousPage: currentPage,
          totalPages,
        },
        bubbles: true,
        composed: true,
      }),
    );
  }

  private _getTotalPages() {
    return Math.max(1, Math.floor(this._toFiniteNumber(this.totalPages, 1)));
  }

  private _getCurrentPage(totalPages: number) {
    return this._getBoundedPage(this.currentPage, totalPages);
  }

  private _getBoundedPage(page: number, totalPages: number) {
    const numericPage = Math.floor(this._toFiniteNumber(page, 1));

    return Math.min(Math.max(numericPage, 1), totalPages);
  }

  private _toFiniteNumber(value: number, fallback: number) {
    const numericValue = Number(value);

    return Number.isFinite(numericValue) ? numericValue : fallback;
  }

  private _getSize(): PaginationDotsSize {
    if (this.size === 'small' || this.size === 'large') {
      return this.size;
    }

    return 'medium';
  }

  private _isProminent() {
    return this.prominent || this.variant === 'prominent';
  }

  private _range(end: number) {
    return Array.from({ length: end }, (_, index) => index + 1);
  }

  private _renderDot(page: number, currentPage: number, size: PaginationDotsSize) {
    const isCurrent = page === currentPage;
    const classes = {
      single: true,
      selected: isCurrent,
    };

    return html`
      <button
        type="button"
        class=${classMap(classes)}
        aria-current=${isCurrent ? 'page' : nothing}
        aria-label=${isCurrent ? `Page ${page}, current page` : `Go to page ${page}`}
        ?disabled=${this.disabled}
        @click=${() => this._onDotClick(page)}
      >
        <i class="ibkIcon" aria-hidden="true">${paginationDotsIconNames[size]}</i>
      </button>
    `;
  }

  render() {
    const totalPages = this._getTotalPages();
    const currentPage = this._getCurrentPage(totalPages);
    const size = this._getSize();
    const classes = {
      ibkPaginationDots: true,
      [size]: true,
      prominent: this._isProminent(),
      regular: !this._isProminent(),
      disabled: this.disabled,
    };

    return html`
      <nav class=${classMap(classes)} aria-label=${this.navigationLabel}>
        ${this._range(totalPages).map((page) => this._renderDot(page, currentPage, size))}
      </nav>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'ibk-pagination-dots': IbkPaginationDots;
  }
}
