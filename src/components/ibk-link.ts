import { LitElement, html, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import type { LinkVariant } from '../utils/types';

/**
 * IBK-Link Component
 * @summary A hyperlink element with variant support.
 *
 * @fires click - Fired when the link is clicked.
 */
@customElement('ibk-link')
export class IbkLink extends LitElement {
  createRenderRoot() {
    return this;
  }

  /**
   * The URL the link points to.
   */
  @property({ type: String, reflect: true }) href?: string;

  /**
   * The target attribute for the link (e.g. _blank, _self).
   * When target="_blank", rel="noopener noreferrer" is automatically added for security.
   */
  @property({ type: String, reflect: true }) target?: string;

  /**
   * The text label displayed inside the link.
   */
  @property({ type: String, reflect: true }) label?: string;

  /**
   * Visual variant of the link.
   */
  @property({ type: String, reflect: true }) variant: LinkVariant = 'regular';

  /**
   * Whether the link is disabled.
   */
  @property({ type: Boolean, reflect: true }) disabled = false;

  render() {
    const classes = {
      ibkLink: true,
      'ibkLink-regular': this.variant === 'regular' || !this.variant,
      'ibkLink-decent': this.variant === 'decent',
      disabled: this.disabled,
    };

    const ariaDisabled = this.disabled ? 'true' : nothing;
    const tabIndex = this.disabled ? -1 : nothing;

    const computedRel = this.target === '_blank' ? 'noopener noreferrer' : undefined;

    return html`
      <a
        class=${classMap(classes)}
        href=${ifDefined(this.disabled ? undefined : this.href)}
        target=${ifDefined(this.target || undefined)}
        rel=${ifDefined(computedRel)}
        aria-disabled=${ariaDisabled}
        tabindex=${ifDefined(tabIndex as number | undefined)}
      >
        <span class="ibkLinkText">${this.label}</span>
      </a>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'ibk-link': IbkLink;
  }
}