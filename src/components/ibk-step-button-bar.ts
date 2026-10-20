import { LitElement, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import type { StepButtonDominance, StepButtonShape, StepButtonSize } from '../utils/types';
import './ibk-step-button';

/**
 * IBK-Step-Button-Bar Component
 * @summary A pair of step buttons (`ibk-step-button`) grouped as a single
 * control. The `shape` drives the orientation: `round` lays them out horizontally
 * (previous / next chevrons), while `quad` and `rect` stack them vertically
 * (up / down chevrons). Set `framed` to wrap the pair in a bordered container.
 *
 * @fires step - Bubbled from whichever inner button is activated; `detail`
 * carries the active `{ icon }` so the direction can be told apart.
 */
@customElement('ibk-step-button-bar')
export class IbkStepButtonBar extends LitElement {
  createRenderRoot() {
    return this;
  }

  /**
   * Visual dominance applied to both buttons.
   */
  @property({ type: String, reflect: true }) dominance?: StepButtonDominance = 'prominent';

  /**
   * Size of both buttons: `40` or `20`.
   */
  @property({ type: String, reflect: true }) size?: StepButtonSize = '40';

  /**
   * Shape of both buttons. `round` renders a horizontal bar, `quad` / `rect`
   * render a vertical bar.
   */
  @property({ type: String, reflect: true }) shape?: StepButtonShape = 'round';

  /**
   * Wraps the pair in a bordered, filled frame (used with `round`).
   */
  @property({ type: Boolean, reflect: true }) framed?: boolean;

  /**
   * Disables both buttons.
   */
  @property({ type: Boolean, reflect: true }) disabled?: boolean;

  /**
   * Icon of the first button (left / up). Overrides the shape-based default.
   */
  @property({ type: String }) startIcon?: string;

  /**
   * Icon of the second button (right / down). Overrides the shape-based default.
   */
  @property({ type: String }) endIcon?: string;

  render() {
    const horizontal = this.shape === 'round';

    const [defaultStart, defaultEnd, startLabel, endLabel] = horizontal
      ? this.size === '20'
        ? ['ChevL', 'ChevR', 'Previous', 'Next']
        : ['ChevLBig', 'ChevRBig', 'Previous', 'Next']
      : ['ChevU', 'ChevD', 'Increase', 'Decrease'];

    const startIcon = this.startIcon ?? defaultStart;
    const endIcon = this.endIcon ?? defaultEnd;

    const classes = {
      ibkStepButtonBar: true,
      [`ibkStepButtonBar-${horizontal ? 'horizontal' : 'vertical'}`]: true,
      ibkStepButtonBarFramed: !!this.framed,
    };

    return html`
      <div class=${classMap(classes)} role="group">
        <ibk-step-button
          .icon=${startIcon}
          dominance=${this.dominance}
          size=${this.size}
          shape=${this.shape}
          label=${startLabel}
          ?disabled=${this.disabled}
        ></ibk-step-button>
        <ibk-step-button
          .icon=${endIcon}
          dominance=${this.dominance}
          size=${this.size}
          shape=${this.shape}
          label=${endLabel}
          ?disabled=${this.disabled}
        ></ibk-step-button>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'ibk-step-button-bar': IbkStepButtonBar;
  }
}
