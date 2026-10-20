import { LitElement, html, nothing } from 'lit';
import type { PropertyValues, TemplateResult } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import type { DropdownItem, DropdownPlacement } from '../utils/types';

/** Keys that move focus between the rows of one panel, mapped to their direction. */
const STEP_KEYS: Record<string, number> = {
  ArrowDown: 1,
  ArrowUp: -1,
};

/**
 * How long a submenu survives the pointer landing on a row that is not its parent.
 * Long enough to cross a neighbouring row on the way to the submenu, short enough that
 * a submenu never looks stuck open after the pointer has settled elsewhere.
 */
const SUBMENU_COLLAPSE_DELAY = 220;

/**
 * IBK-Dropdown Component
 * @summary The panel of a dropdown - the menu, not the button that opens it. A row carries
 * an optional leading `icon` and, on its trailing edge, either a `shortcut` hint or a
 * chevron when it has nested `items`; a row marked `separator` draws a rule instead.
 *
 * The trigger belongs to the page, so any control can open one. Put it and the dropdown in
 * a `.ibkDropdownAnchor`: the panel positions against that container and counts clicks
 * inside it as its own, so opening is just `toggle()`. `focusFirstItem()` /
 * `focusLastItem()` hand the keyboard over on Arrow Down / Up. See the Storybook story for
 * the wiring against an `ibk-button`.
 *
 * Everything inside the panel is handled here: submenus to any depth, the arrow-key model,
 * dismissal on outside pointerdown / focus-out / Escape, flipping when the viewport leaves
 * no room, and returning focus to whatever opened it.
 *
 * @fires dropdown-select - Dispatched when a row without a submenu is chosen, by click or
 * by Enter/Space. Detail: `{ item, value, path }`, where `value` falls back to the label
 * and `path` is the row's index chain, e.g. `[4, 2]` for the third row of the submenu
 * belonging to the fifth top-level row.
 * @fires dropdown-open - Dispatched when the panel opens, however it was opened.
 * @fires dropdown-close - Dispatched when the panel closes, however it was closed. A
 * trigger keeps its `aria-expanded` in step by listening for these two.
 */
@customElement('ibk-dropdown')
export class IbkDropdown extends LitElement {
  createRenderRoot() {
    return this;
  }

  private static _nextId = 0;
  private _defaultId = `ibk-dropdown-${IbkDropdown._nextId++}`;

  /**
   * Rows of the panel. A row renders a leading icon when it carries an `icon`, a keyboard
   * hint when it carries a `shortcut`, and a submenu chevron when it carries `items` —
   * each sub-element is expressed by the presence of its value, so there is no separate
   * toggle for any of them. Because this is an array property (not a string attribute),
   * set it via JavaScript, e.g.
   * `document.querySelector('ibk-dropdown').items = [{ label: 'Einfügen', icon: 'Dup' }]`.
   */
  @property({ type: Array }) items: DropdownItem[] = [];

  /**
   * Accessible name of the menu as a whole (e.g. "Bearbeiten"). Worth setting because the
   * trigger lives outside this component, so the panel cannot name itself after it.
   */
  @property({ type: String }) label?: string;

  /**
   * Which edge of the anchor the panel lines up with: `bottom-start` (the leading edge) or
   * `bottom-end` (the trailing edge). Either way it hangs below — the block axis flips on
   * its own when there is not enough room down there.
   */
  @property({ type: String, reflect: true }) placement?: DropdownPlacement = 'bottom-start';

  /**
   * Whether the panel is open. Reflected, so a trigger can drive it from the outside and
   * the stylesheet can keep a closed panel out of the layout.
   */
  @property({ type: Boolean, reflect: true }) open = false;

  /**
   * Index chain of the submenus that are currently open, e.g. `[4, 2]` when the fifth
   * top-level row's submenu is open and, inside it, the third row's submenu as well. One
   * path rather than a flag per row: a row's submenu is open exactly when the path starts
   * with that row's own path, so arbitrarily deep nesting needs no extra bookkeeping.
   */
  @state() private _openPath: number[] = [];

  /** Pending submenu collapse — see `_handleRowPointerEnter`. */
  private _collapseTimer?: ReturnType<typeof setTimeout>;

  /**
   * Whatever had focus when the panel opened — the trigger, in every normal case. Kept so
   * Escape and Tab can hand the keyboard back without this component ever being told which
   * element the trigger is.
   */
  private _returnFocusTo: HTMLElement | null = null;

  protected willUpdate(changed: PropertyValues) {
    // A new set of rows invalidates the open path: its indices point into the old array.
    if (changed.has('items')) this._openPath = [];

    if (changed.has('open') && this.open) {
      // Captured before the panel renders, while focus is still on the trigger that just
      // ran `toggle()`. Reading it any later would find one of our own rows instead.
      const active = document.activeElement;
      this._returnFocusTo = active instanceof HTMLElement ? active : null;
    }

    // Closing has to fold the submenus away too, otherwise reopening the panel would
    // restore whichever branch happened to be open when it was last dismissed.
    if (!this.open) {
      this._clearCollapse();
      this._openPath = [];
    }
  }

  protected updated(changed: PropertyValues) {
    // Keyed on the current state rather than on `changed.has('open')`, because `willUpdate`
    // may have changed it. Binding is idempotent: the handlers are arrow-function class
    // fields, so the reference is stable per instance and `addEventListener` discards the
    // duplicate.
    if (this.open) this._bindGlobalListeners();
    else this._unbindGlobalListeners();

    // Dispatched here rather than from `show()` / `hide()` so that driving `open` directly
    // - as a property or as the reflected attribute - reports itself exactly like the
    // methods do. The `undefined` check skips the first update, where a dropdown that
    // starts open has not opened, it simply is.
    //
    // Two branches with literal names rather than one dispatch with a computed one: cem
    // reads event names statically, and a ternary leaves it unable to resolve either, so
    // the manifest gains a nameless event that then shows up as an empty handle in
    // Storybook and in the published types.
    if (changed.has('open') && changed.get('open') !== undefined) {
      if (this.open) {
        this.dispatchEvent(new CustomEvent('dropdown-open', { bubbles: true, composed: true }));
      } else {
        this.dispatchEvent(new CustomEvent('dropdown-close', { bubbles: true, composed: true }));
      }
    }

    this._position();
  }

  connectedCallback() {
    super.connectedCallback();

    // Lit's `connectedCallback` does not request an update, so `updated()` will not run on
    // re-insertion. A dropdown that was open when it was detached would otherwise come
    // back with no outside-click, focus-out or reposition handling at all.
    if (this.open) this._bindGlobalListeners();
  }

  disconnectedCallback() {
    this._unbindGlobalListeners();
    this._clearCollapse();
    super.disconnectedCallback();
  }

  /* ------------------------------------------------------------------------ */
  /*  Public API — what a trigger drives                                      */
  /* ------------------------------------------------------------------------ */

  /** Opens the panel. */
  show() {
    this.open = true;
  }

  /** Closes the panel and every submenu inside it. */
  hide() {
    this.open = false;
  }

  /** Closes the panel if it is open, opens it if it is not. */
  toggle() {
    this.open = !this.open;
  }

  /**
   * Opens the panel if needed and moves focus to its first reachable row — what a trigger
   * calls for Arrow Down, or for Enter and Space when it wants the keyboard to land inside
   * the menu straight away.
   */
  async focusFirstItem() {
    this.show();
    await this.updateComplete;
    this._focusEdgeRow([], 1);
  }

  /** The same for Arrow Up, landing on the last reachable row instead. */
  async focusLastItem() {
    this.show();
    await this.updateComplete;
    this._focusEdgeRow([], -1);
  }

  /* ------------------------------------------------------------------------ */
  /*  Anchor                                                                  */
  /* ------------------------------------------------------------------------ */

  /**
   * The element the panel hangs off: its parent. Everything the dropdown needs to know
   * about the trigger comes from here — where to position, and which pointerdowns belong
   * to the dropdown rather than counting as a click outside it. That second part is what
   * lets a trigger be a plain `toggle()` call: without it, the document-level dismissal
   * would close the panel on the way down and the trigger would reopen it on the way up.
   */
  private get _anchorElement(): HTMLElement | null {
    return this.parentElement;
  }

  /* ------------------------------------------------------------------------ */
  /*  Tree lookups                                                            */
  /* ------------------------------------------------------------------------ */

  /** The rows of the panel at `panelPath` — `[]` being the panel under the anchor. */
  private _itemsAt(panelPath: number[]): DropdownItem[] {
    return panelPath.reduce<DropdownItem[]>(
      (items, index) => items[index]?.items ?? [],
      this.items,
    );
  }

  /** The single row at `path`. */
  private _itemAt(path: number[]): DropdownItem | undefined {
    return this._itemsAt(path.slice(0, -1))[path[path.length - 1]];
  }

  /** Whether the submenu belonging to the row at `path` is on screen. */
  private _isSubmenuOpen(path: number[]): boolean {
    return (
      path.length <= this._openPath.length &&
      path.every((index, depth) => this._openPath[depth] === index)
    );
  }

  /* ------------------------------------------------------------------------ */
  /*  Placement                                                               */
  /* ------------------------------------------------------------------------ */

  /**
   * Flips the panel above the anchor, and a submenu back over its own panel, when the
   * viewport has no room the preferred way. Both are decided from `offsetHeight` /
   * `offsetWidth`, which describe the box regardless of where it currently sits — so the
   * measurement never depends on the flip class it is about to set, and there is no need
   * to clear that class and measure a second time.
   *
   * The classes are written straight onto the elements rather than derived from reactive
   * state: this runs *after* a render, and re-rendering to record what was just measured
   * would mean a second layout pass on every open. Nothing here is under `classMap`'s
   * control — the host's class attribute is not bound at all, and the submenu's `classMap`
   * leaves names it does not own untouched.
   */
  private _position() {
    if (!this.open) return;

    const anchor = this._anchorElement;
    if (anchor) {
      // The host is the positioned box: its top edge is the anchor's bottom edge, so the
      // anchor's rect plus the panel's own height is all the room check needs.
      const anchorRect = anchor.getBoundingClientRect();
      const height = this.offsetHeight;
      this.classList.toggle(
        'ibkDropdown-flip-block',
        anchorRect.bottom + height > window.innerHeight && anchorRect.top - height >= 0,
      );
    }

    for (const submenu of this.querySelectorAll<HTMLElement>('.ibkDropdown-submenu')) {
      // The wrapper is the submenu's positioning context and spans the full width of the
      // panel holding it, so its trailing edge is where `left: 100%` puts the submenu.
      const wrapper = submenu.parentElement;
      if (!wrapper) continue;

      const wrapperRect = wrapper.getBoundingClientRect();
      const width = submenu.offsetWidth;
      submenu.classList.toggle(
        'ibkDropdown-submenu-flip-inline',
        wrapperRect.right + width > window.innerWidth && wrapperRect.left - width >= 0,
      );
    }
  }

  /* ------------------------------------------------------------------------ */
  /*  Dismissal                                                               */
  /* ------------------------------------------------------------------------ */

  /** True when the event started inside the dropdown or inside the anchor around it. */
  private _isOwnEvent(e: Event): boolean {
    const path = e.composedPath();
    const anchor = this._anchorElement;
    return path.includes(this) || (!!anchor && path.includes(anchor));
  }

  private _onDocumentPointerDown = (e: Event) => {
    if (!this._isOwnEvent(e)) this.hide();
  };

  /** Catches focus leaving the dropdown by any route Tab does not go through. */
  private _onDocumentFocusIn = (e: FocusEvent) => {
    if (!this._isOwnEvent(e)) this.hide();
  };

  private _onViewportChange = () => this._position();

  private _bindGlobalListeners() {
    // Capture phase, so a handler on the page that stops propagation cannot leave the
    // panel stranded open over content the user has already moved on from.
    document.addEventListener('pointerdown', this._onDocumentPointerDown, true);
    document.addEventListener('focusin', this._onDocumentFocusIn, true);
    window.addEventListener('resize', this._onViewportChange);
    // Capture again: scrolling an ancestor moves the anchor, and scroll events from
    // anything other than the document do not bubble.
    window.addEventListener('scroll', this._onViewportChange, true);
  }

  private _unbindGlobalListeners() {
    document.removeEventListener('pointerdown', this._onDocumentPointerDown, true);
    document.removeEventListener('focusin', this._onDocumentFocusIn, true);
    window.removeEventListener('resize', this._onViewportChange);
    window.removeEventListener('scroll', this._onViewportChange, true);
  }

  private _clearCollapse() {
    if (this._collapseTimer === undefined) return;

    clearTimeout(this._collapseTimer);
    this._collapseTimer = undefined;
  }

  /**
   * Closes the panel and hands the keyboard back to whatever opened it. Focus moves first
   * and synchronously: the row it is sitting on is about to be removed, and letting it go
   * to `<body>` would break the tab order and, on Tab, restart it at the top of the page.
   */
  private _dismiss() {
    this._returnFocusTo?.focus();
    this.hide();
  }

  /**
   * Folds away every submenu deeper than `to`.
   *
   * When keyboard focus is sitting on one of the rows that is about to be removed, it is
   * handed to the nearest ancestor row that survives first. Skipping that hand-off would
   * drop focus onto `<body>`, and because every keydown handler lives on a row rather than
   * on the panel, the whole keyboard interface would go with it — arrows, Home/End and
   * Escape would all stop responding.
   */
  private _collapseTo(to: number[]) {
    this._clearCollapse();
    if (this._openPath.length <= to.length) return;

    // A row at `to.length + 1` is the deepest one still rendered once `to` is the open
    // path, so that is where a focused row from any deeper panel belongs.
    const focused = this._focusedRowPath();
    if (focused && focused.length > to.length + 1) {
      this._focusRow(focused.slice(0, to.length + 1));
    }

    this._openPath = to;
  }

  /** The path of the row that has focus, or `null` when focus is not on a row of ours. */
  private _focusedRowPath(): number[] | null {
    const active = document.activeElement;
    if (!(active instanceof HTMLElement) || !this.contains(active)) return null;

    const path = active.dataset.path;
    return path === undefined ? null : path.split('.').map(Number);
  }

  /* ------------------------------------------------------------------------ */
  /*  Focus movement                                                          */
  /* ------------------------------------------------------------------------ */

  private _focusRow(path: number[]) {
    this.querySelector<HTMLButtonElement>(
      `button.ibkDropdown-item[data-path="${path.join('.')}"]`,
    )?.focus();
  }

  /**
   * Moves focus `step` rows away from `from` inside the panel at `panelPath`, skipping
   * separators and disabled rows and wrapping around at both ends. Focus stays inside the
   * one panel: crossing into a submenu is ArrowRight's job, and leaving one is
   * ArrowLeft's.
   */
  private _stepFocus(panelPath: number[], from: number, step: number) {
    const items = this._itemsAt(panelPath);
    const count = items.length;
    if (!count) return;

    for (let offset = 1; offset <= count; offset++) {
      const next = (((from + step * offset) % count) + count) % count;
      const item = items[next];
      if (item && !item.separator && !item.disabled) {
        this._focusRow([...panelPath, next]);
        return;
      }
    }
  }

  /** Focuses the first (`step` 1) or last (`step` -1) reachable row of a panel. */
  private _focusEdgeRow(panelPath: number[], step: number) {
    // Step off the far end so the row at that end is the first one tried.
    const from = step === 1 ? -1 : this._itemsAt(panelPath).length;
    this._stepFocus(panelPath, from, step);
  }

  /* ------------------------------------------------------------------------ */
  /*  Row interaction                                                         */
  /* ------------------------------------------------------------------------ */

  private _handleRowClick(path: number[]) {
    const item = this._itemAt(path);
    if (!item || item.disabled) return;

    if (item.items?.length) {
      // A submenu parent is a toggle, not a command: it folds its rows away again on the
      // second click and leaves the panel around it open either way.
      if (this._isSubmenuOpen(path)) this._collapseTo(path.slice(0, -1));
      else {
        this._clearCollapse();
        this._openPath = path;
      }
      return;
    }

    this.dispatchEvent(
      new CustomEvent('dropdown-select', {
        detail: { item, value: item.value ?? item.label, path },
        bubbles: true,
        composed: true,
      }),
    );

    this._dismiss();
  }

  private _handleRowPointerEnter(path: number[]) {
    this._clearCollapse();

    const item = this._itemAt(path);
    if (item?.items?.length && !item.disabled) {
      this._openPath = path;
      return;
    }

    // A row that opens nothing: a submenu belonging to one of its siblings has to go, but
    // not on the instant. The submenu sits alongside the panel, so a pointer travelling
    // towards it often clips the row below its parent on the way, and collapsing on that
    // first crossing would pull the submenu out from under the pointer before it lands.
    const panelPath = path.slice(0, -1);
    if (this._openPath.length <= panelPath.length) return;

    this._collapseTimer = setTimeout(() => {
      this._collapseTimer = undefined;
      this._collapseTo(panelPath);
    }, SUBMENU_COLLAPSE_DELAY);
  }

  private _handleRowKeydown(e: KeyboardEvent, path: number[]) {
    const panelPath = path.slice(0, -1);
    const index = path[path.length - 1];

    // Walking along this panel abandons whatever branch was open below it, so the row that
    // focus lands on is the only one left highlighted. This also cancels a collapse the
    // pointer may have scheduled, which would otherwise fire behind the keyboard's back.
    const step = STEP_KEYS[e.key];
    if (step) {
      e.preventDefault();
      this._collapseTo(panelPath);
      this._stepFocus(panelPath, index, step);
      return;
    }

    if (e.key === 'Home' || e.key === 'End') {
      e.preventDefault();
      this._collapseTo(panelPath);
      this._focusEdgeRow(panelPath, e.key === 'Home' ? 1 : -1);
      return;
    }

    if (e.key === 'ArrowRight') {
      if (!this._itemAt(path)?.items?.length) return;

      e.preventDefault();
      this._clearCollapse();
      this._openPath = path;
      this.updateComplete.then(() => this._focusEdgeRow(path, 1));
      return;
    }

    if (e.key === 'ArrowLeft') {
      // In the panel under the anchor there is no submenu to step back out of, so the key
      // belongs to the page - a menu bar alongside the trigger, most likely.
      if (!panelPath.length) return;

      // `_collapseTo` puts focus on the parent row on its own: this row is one level
      // deeper than the deepest one that survives closing its own submenu.
      e.preventDefault();
      this._collapseTo(panelPath.slice(0, -1));
      return;
    }

    if (e.key === 'Escape') {
      e.preventDefault();
      this._dismiss();
      return;
    }

    if (e.key === 'Tab') {
      // Deliberately no preventDefault: `_dismiss` moves focus back to the trigger now,
      // synchronously, and the browser then picks the next tab stop relative to it.
      this._dismiss();
    }

    // Enter and Space need nothing here — a <button> turns both into a click, which
    // `_handleRowClick` already covers.
  }

  /* ------------------------------------------------------------------------ */
  /*  Rendering                                                               */
  /* ------------------------------------------------------------------------ */

  private _rowId(path: number[]): string {
    return `${this._defaultId}-row-${path.join('-')}`;
  }

  private _renderRow(item: DropdownItem, path: number[]) {
    const hasSubmenu = !!item.items?.length;
    const submenuOpen = hasSubmenu && this._isSubmenuOpen(path);

    return html`
      <button
        id=${this._rowId(path)}
        class=${classMap({ 'ibkDropdown-item': true, open: submenuOpen })}
        type="button"
        role="menuitem"
        data-path=${path.join('.')}
        tabindex="-1"
        aria-haspopup=${ifDefined(hasSubmenu ? 'menu' : undefined)}
        aria-expanded=${ifDefined(hasSubmenu ? String(submenuOpen) : undefined)}
        ?disabled=${item.disabled}
        @click=${() => this._handleRowClick(path)}
        @pointerenter=${() => this._handleRowPointerEnter(path)}
        @keydown=${(e: KeyboardEvent) => this._handleRowKeydown(e, path)}
      >
        <span class="ibkDropdown-itemMain">
          ${item.icon ? html`<i class="ibkIcon" aria-hidden="true">${item.icon}</i>` : nothing}
          <span class="ibkDropdown-itemLabel">${item.label}</span>
        </span>
        ${hasSubmenu
          ? html`<i class="ibkIcon" aria-hidden="true">ChevR</i>`
          : item.shortcut
            ? html`<span class="ibkDropdown-itemShortcut">${item.shortcut}</span>`
            : nothing}
      </button>
    `;
  }

  // `_renderItem` and `_renderMenu` call each other to walk the nesting, so both need the
  // return type spelled out — TypeScript cannot infer either one from the other.
  private _renderItem(item: DropdownItem, path: number[]): TemplateResult {
    if (item.separator) return html`<hr class="ibkDropdown-separator" />`;
    if (!item.items?.length) return this._renderRow(item, path);

    // `role="none"` on the wrapper: a role="menu" may only contain menu items, and this
    // div exists solely to give the submenu a row to hang off.
    return html`
      <div class="ibkDropdown-submenuWrapper" role="none">
        ${this._renderRow(item, path)}
        ${this._isSubmenuOpen(path) ? this._renderMenu(item.items, path) : nothing}
      </div>
    `;
  }

  private _renderMenu(items: DropdownItem[], path: number[]): TemplateResult {
    const isRoot = path.length === 0;

    return html`
      <div
        id=${ifDefined(isRoot ? `${this._defaultId}-menu` : undefined)}
        class=${classMap({ 'ibkDropdown-menu': true, 'ibkDropdown-submenu': !isRoot })}
        role="menu"
        aria-label=${ifDefined(isRoot ? this.label : undefined)}
        aria-labelledby=${ifDefined(isRoot ? undefined : this._rowId(path))}
        @pointerleave=${() => this._collapseTo(path)}
      >
        ${items.map((item, index) => this._renderItem(item, [...path, index]))}
      </div>
    `;
  }

  render() {
    return this.open ? this._renderMenu(this.items, []) : nothing;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'ibk-dropdown': IbkDropdown;
  }
}
