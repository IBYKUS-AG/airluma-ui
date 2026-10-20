import { LitElement, html, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';

export type PaginationMode = 'minimum' | 'maximum';
export type PaginationVariant = 'regular' | 'prominent';

type PaginationItem =
  | {
      type: 'page';
      page: number;
    }
  | {
      type: 'ellipsis';
      key: string;
    };

/**
 * IBK-Pagination Component
 * @summary A navigation control for multi-page content.
 * @fires page-change - Dispatched when the user requests another page.
 */
@customElement('ibk-pagination')
export class IbkPagination extends LitElement {
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
   * Pagination density. Minimum shows only the moving page window; maximum keeps first and
   * last page directly reachable.
   */
  @property({ type: String, reflect: true }) mode: PaginationMode = 'minimum';

  /**
   * Visual variant of the selected page.
   */
  @property({ type: String, reflect: true }) variant: PaginationVariant = 'regular';

  /**
   * Whether to use the prominent style. Kept for backwards compatibility.
   */
  @property({ type: Boolean, reflect: true }) prominent = false;

  /**
   * Whether the pagination is disabled.
   */
  @property({ type: Boolean, reflect: true }) disabled = false;

  /**
   * Accessible label for the pagination navigation.
   */
  @property({ type: String, attribute: 'navigation-label' }) navigationLabel = 'Pagination';

  private readonly _iconPrevious = 'ChevLBig';
  private readonly _iconNext = 'ChevRBig';

  private _onPageClick(page: number) {
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

  private _getMode(): PaginationMode {
    return this.mode === 'maximum' ? 'maximum' : 'minimum';
  }

  private _isProminent() {
    return this.prominent || this.variant === 'prominent';
  }

  private _getPageWindow(currentPage: number, totalPages: number) {
    const windowSize = Math.min(3, totalPages);
    const maxStart = Math.max(totalPages - windowSize + 1, 1);
    const start = Math.min(Math.max(currentPage - 1, 1), maxStart);
    const end = Math.min(start + windowSize - 1, totalPages);

    return this._range(start, end);
  }

  private _getPaginationItems(currentPage: number, totalPages: number): PaginationItem[] {
    const windowPages = this._getPageWindow(currentPage, totalPages);

    if (this._getMode() === 'minimum') {
      return windowPages.map((page) => ({ type: 'page', page }));
    }

    const pages = Array.from(new Set([1, ...windowPages, totalPages])).sort((a, b) => a - b);
    const items: PaginationItem[] = [];

    pages.forEach((page, index) => {
      const previousPage = pages[index - 1];

      if (previousPage !== undefined) {
        const gap = page - previousPage;

        if (gap === 2) {
          items.push({ type: 'page', page: previousPage + 1 });
        } else if (gap > 2) {
          items.push({ type: 'ellipsis', key: `ellipsis-${previousPage}-${page}` });
        }
      }

      items.push({ type: 'page', page });
    });

    return items;
  }

  private _range(start: number, end: number) {
    return Array.from({ length: end - start + 1 }, (_, index) => start + index);
  }

  private _renderPageButton(page: number, currentPage: number) {
    const isCurrent = page === currentPage;
    const classes = {
      ibkButton: true,
      'ibkPagination-button': true,
      'ibkPagination-page': true,
      current: isCurrent,
    };

    return html`
      <button
        type="button"
        class=${classMap(classes)}
        aria-current=${isCurrent ? 'page' : nothing}
        aria-label=${isCurrent ? `Page ${page}, current page` : `Go to page ${page}`}
        ?disabled=${this.disabled}
        @click=${() => this._onPageClick(page)}
      >
        ${page}
      </button>
    `;
  }

  private _renderPaginationItem(item: PaginationItem, currentPage: number) {
    if (item.type === 'ellipsis') {
      return html`
        <span class="ibkPagination-ellipsis" aria-hidden="true" role="presentation">
          <i class="ibkIcon" aria-hidden="true">TriPtHor</i>
        </span>
      `;
    }

    return this._renderPageButton(item.page, currentPage);
  }

  render() {
    const totalPages = this._getTotalPages();
    const currentPage = this._getCurrentPage(totalPages);
    const mode = this._getMode();
    const classes = {
      ibkPagination: true,
      minimum: mode === 'minimum',
      maximum: mode === 'maximum',
      prominent: this._isProminent(),
      regular: !this._isProminent(),
      disabled: this.disabled,
    };
    const previousDisabled = this.disabled || currentPage === 1;
    const nextDisabled = this.disabled || currentPage === totalPages;
    const items = this._getPaginationItems(currentPage, totalPages);

    return html`
      <nav class=${classMap(classes)} aria-label=${this.navigationLabel}>
        <button
          type="button"
          class="ibkButton ibkPagination-button ibkPagination-arrow"
          aria-label="Previous page"
          ?disabled=${previousDisabled}
          @click=${() => this._onPageClick(currentPage - 1)}
        >
          <i class="ibkIcon" aria-hidden="true">${this._iconPrevious}</i>
        </button>

        ${items.map((item) => this._renderPaginationItem(item, currentPage))}

        <button
          type="button"
          class="ibkButton ibkPagination-button ibkPagination-arrow"
          aria-label="Next page"
          ?disabled=${nextDisabled}
          @click=${() => this._onPageClick(currentPage + 1)}
        >
          <i class="ibkIcon" aria-hidden="true">${this._iconNext}</i>
        </button>
      </nav>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'ibk-pagination': IbkPagination;
  }
}
