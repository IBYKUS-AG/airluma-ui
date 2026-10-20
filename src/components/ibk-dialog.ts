import { LitElement, html, nothing } from 'lit'
import type { PropertyValues } from 'lit'
import { customElement, property, state } from 'lit/decorators.js'
import { classMap } from 'lit/directives/class-map.js'
import { ifDefined } from 'lit/directives/if-defined.js'

export type DialogType = 'horizontal' | 'vertical'
export type DialogVariant = 'regular' | 'decent'

/**
 * Elements a Tab press can land on - the boundary the focus trap below cycles between.
 * Matches the common "focusable selector" used by native modal-dialog polyfills; a
 * `visibility`/`display` check still has to happen at call time, since a selector alone
 * cannot see computed style.
 */
const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(', ')

/**
 * IBK-Dialog Component
 * @summary A modal dialog that opens centered in the viewport with a backdrop.
 *          Reuses the card design tokens (`.ibkCard.elevated`) for the regular variant
 *          and accepts slotted ibk-buttons for the actions.
 *
 *          Not a native `<dialog>`/`showModal()` - `show()` only toggles a CSS class on a
 *          backdrop `<div>` - so all of the modal behaviour a native dialog gets for free
 *          is implemented here instead: focus moves into the dialog on open and back to
 *          whatever opened it on close, Tab/Shift+Tab cycle inside the dialog rather than
 *          escaping into the page, and everything outside the dialog's own ancestor chain
 *          is marked `inert` for the duration (removed from the accessibility tree and the
 *          tab order, not just visually covered by the backdrop).
 *
 * @slot - Default slot for the dialog body content (text, paragraphs, etc.).
 * @slot actions - Wrap action buttons here. List them in priority order (preferred first);
 *                 the dialog flips the row in horizontal mode so the preferred button ends up on the right.
 *
 * @fires ibk-dialog-close - Dispatched when the dialog is closed (via Escape, backdrop click, or close()).
 */
@customElement('ibk-dialog')
export class IbkDialog extends LitElement {
  createRenderRoot() {
    return this
  }

  private static _nextId = 0
  private _defaultId = `ibk-dialog-${IbkDialog._nextId++}`

  /**
   * The headline of the dialog, rendered as an h4 and wired up as the dialog's
   * accessible name (`aria-labelledby`). A consumer that renders its own header instead
   * (an icon next to the title, say) can set `aria-label` or `aria-labelledby` directly
   * on `<ibk-dialog>` - that attribute is read at render time and forwarded to the actual
   * `role="dialog"` element, since that element is not the host itself (see `render()`).
   */
  @property({ type: String }) headline = ''

  /**
   * Layout type. 'vertical' stacks action buttons full-width; 'horizontal' lays them
   * out in a right-aligned row with the preferred (red) button on the right.
   */
  @property({ type: String, reflect: true }) type: DialogType = 'vertical'

  /**
   * Visual variant. 'regular' wraps the content in an elevated card; 'decent' has no
   * card background and uses a more opaque backdrop for contrast.
   */
  @property({ type: String, reflect: true }) variant: DialogVariant = 'regular'

  /**
   * Whether the dialog is open. Toggle this to show/hide, or use show()/close().
   */
  @property({ type: Boolean, reflect: true }) open = false

  /**
   * When true, the dialog cannot be dismissed by the Escape key or by clicking
   * the backdrop. The user is forced to pick one of the slotted action buttons
   * (which must call close() programmatically).
   */
  @property({ type: Boolean, reflect: true }) persistent = false

  private _contentNodes: Node[] = []
  private _actionNodes: Node[] = []
  private _captured = false

  @state() private _shaking = false
  private _shakeTimer: number | undefined

  /**
   * Whatever had focus right before the dialog opened - the trigger, in every normal
   * case. Handed the keyboard back on close, same idea as `ibk-dropdown`'s
   * `_returnFocusTo`.
   */
  private _returnFocusTo: HTMLElement | null = null

  /**
   * Elements this instance made `inert` while open, so closing removes exactly those and
   * nothing a differently-timed nested dialog already inerted on its own.
   */
  private _inertedSiblings: HTMLElement[] = []

  protected willUpdate(changed: PropertyValues) {
    if (changed.has('open') && this.open) {
      // Captured before the dialog box itself can receive focus - reading this any later
      // would find our own container instead of the real trigger.
      const active = document.activeElement
      this._returnFocusTo = active instanceof HTMLElement ? active : null
    }
  }

  protected updated(changed: PropertyValues) {
    if (!changed.has('open')) return

    if (this.open) {
      this._applyInert()
      this._focusContainer()
    } else {
      this._releaseInert()
      this._returnFocusTo?.focus()
      this._returnFocusTo = null
    }
  }

  connectedCallback() {
    if (!this._captured) {
      this._captureChildren()
    }
    super.connectedCallback()
    document.addEventListener('keydown', this._handleKeyDown)
  }

  disconnectedCallback() {
    super.disconnectedCallback()
    document.removeEventListener('keydown', this._handleKeyDown)
    // Belt and braces: a dialog removed from the DOM while still open would otherwise
    // leave its siblings permanently inert.
    this._releaseInert()
  }

  private _captureChildren() {
    this._captured = true
    const childNodes = Array.from(this.childNodes)
    for (const node of childNodes) {
      if (
        node.nodeType === Node.ELEMENT_NODE &&
        (node as Element).getAttribute('slot') === 'actions'
      ) {
        for (const actionChild of Array.from(node.childNodes)) {
          this._actionNodes.push(actionChild)
        }
      } else {
        this._contentNodes.push(node)
      }
    }
  }

  /** Escape closes (or shakes, if persistent); Tab is handed to the focus trap below. */
  private _handleKeyDown = (e: KeyboardEvent) => {
    if (!this.open) return

    if (e.key === 'Escape') {
      if (this.persistent) {
        this._triggerShake()
        return
      }
      this.close()
      return
    }

    if (e.key === 'Tab') this._trapTab(e)
  }

  /**
   * Keeps Tab/Shift+Tab cycling inside the dialog box, wrapping at either end. Nothing
   * else stops focus from leaving - this is a plain `<div>`, not a native
   * `<dialog>`/`showModal()`, which would trap focus on its own.
   */
  private _trapTab(e: KeyboardEvent) {
    const box = this.querySelector<HTMLElement>('.ibkDialog')
    if (!box) return

    const focusable = this._focusableElements(box)

    // No focusable content at all (an alert with no action buttons, say) - keep focus
    // pinned on the box itself rather than let it wander into the page.
    if (!focusable.length) {
      e.preventDefault()
      box.focus()
      return
    }

    const first = focusable[0]
    const last = focusable[focusable.length - 1]
    const active = document.activeElement

    if (e.shiftKey && active === first) {
      e.preventDefault()
      last.focus()
    } else if (!e.shiftKey && active === last) {
      e.preventDefault()
      first.focus()
    } else if (!box.contains(active)) {
      // Focus already left the box by some other route (a click on an element with a
      // negative tabindex, say) - pull it back in rather than let the next Tab wander
      // further from where the user actually is.
      e.preventDefault()
      first.focus()
    }
  }

  /** Focusable descendants of `box`, in DOM/tab order, skipping anything not laid out. */
  private _focusableElements(box: HTMLElement): HTMLElement[] {
    return Array.from(box.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(
      (el) => el.offsetParent !== null,
    )
  }

  private _handleBackdropClick = (e: MouseEvent) => {
    if (e.target !== e.currentTarget) return
    if (this.persistent) {
      this._triggerShake()
      return
    }
    this.close()
  }

  private _triggerShake() {
    if (this._shakeTimer !== undefined) {
      window.clearTimeout(this._shakeTimer)
    }
    this._shaking = true
    this._shakeTimer = window.setTimeout(() => {
      this._shaking = false
      this._shakeTimer = undefined
    }, 400)
  }

  show() {
    this.open = true
  }

  close() {
    if (!this.open) return
    this.open = false
    this.dispatchEvent(
      new CustomEvent('ibk-dialog-close', { bubbles: true, composed: true })
    )
  }

  /** Moves focus into the dialog box once it is open - the first focusable element, or the box itself when there is none. */
  private _focusContainer() {
    const box = this.querySelector<HTMLElement>('.ibkDialog')
    if (!box) return

    const first = this._focusableElements(box)[0]
    ;(first ?? box).focus()
  }

  /**
   * Removes the rest of the page from the accessibility tree and the tab order for as
   * long as this dialog is open. The dialog can sit anywhere in the tree (it is not
   * teleported to the end of `<body>`), so this walks from `this` up to `<body>` and
   * inerts every sibling along the way rather than assuming a fixed structure - the
   * backdrop only *covers* that content for a pointer, it does not remove it for a
   * keyboard or a screen reader on its own.
   */
  private _applyInert() {
    let node: Element = this
    while (node.parentElement) {
      const parent: Element = node.parentElement
      for (const sibling of Array.from(parent.children)) {
        if (
          sibling !== node &&
          sibling instanceof HTMLElement &&
          !sibling.hasAttribute('inert')
        ) {
          sibling.setAttribute('inert', '')
          this._inertedSiblings.push(sibling)
        }
      }
      node = parent
    }
  }

  private _releaseInert() {
    for (const el of this._inertedSiblings) el.removeAttribute('inert')
    this._inertedSiblings = []
  }

  render() {
    const backdropClasses = {
      'ibkDialog-backdrop': true,
      open: this.open,
    }

    const isRegular = this.variant === 'regular'
    const dialogClasses = {
      ibkDialog: true,
      ibkCard: isRegular,
      elevated: isRegular,
      [this.type]: true,
      [this.variant]: true,
      shake: this._shaking,
    }

    // The host itself carries no role, so an `aria-label`/`aria-labelledby`/
    // `aria-describedby` a consumer sets directly on `<ibk-dialog>` would otherwise never
    // reach an accessibility tree - it has to be forwarded onto the element that actually
    // carries `role="dialog"` below. The `headline` property wins for `aria-labelledby`
    // when set, since it is guaranteed to exist and point at *this* dialog's own title;
    // `.ibkDialog-content` (the default slot, never the headline) is the fallback for
    // `aria-describedby` for the same reason - it is the one thing here guaranteed to
    // hold the dialog's actual message, whatever a consumer put in the default slot. A
    // consumer that wants a *different* description (only part of the content, say) can
    // still override it by setting `aria-describedby` directly on `<ibk-dialog>`.
    const headlineId = this.headline ? `${this._defaultId}-headline` : undefined
    const contentId = `${this._defaultId}-content`
    const ariaLabel = this.getAttribute('aria-label') ?? undefined
    const ariaLabelledby = headlineId ?? this.getAttribute('aria-labelledby') ?? undefined
    const ariaDescribedby = this.getAttribute('aria-describedby') ?? contentId

    return html`
      <div class=${classMap(backdropClasses)} @click=${this._handleBackdropClick}>
        <div
          class=${classMap(dialogClasses)}
          role="dialog"
          aria-modal="true"
          tabindex="-1"
          aria-label=${ifDefined(ariaLabel)}
          aria-labelledby=${ifDefined(ariaLabelledby)}
          aria-describedby=${ariaDescribedby}
        >
          ${this.headline ? html`<h4 id=${ifDefined(headlineId)}>${this.headline}</h4>` : nothing}
          <div id=${contentId} class="ibkDialog-content">${this._contentNodes}</div>
          <div class="ibkDialog-actions">${this._actionNodes}</div>
        </div>
      </div>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'ibk-dialog': IbkDialog
  }
}
