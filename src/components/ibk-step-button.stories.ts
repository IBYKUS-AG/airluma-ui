import type { Meta, StoryObj } from '@storybook/web-components';
import { getStorybookHelpers } from '@wc-toolkit/storybook-helpers';
import { html } from 'lit';
import { ifDefined } from 'lit/directives/if-defined.js';
import { ref } from 'lit/directives/ref.js';
import { action } from './../utils/utils';
import './ibk-step-button';
import { IbkStepButton } from './ibk-step-button';

/** Moves keyboard focus onto the first inner button so `:focus-visible` shows. */
const autofocusFirst = (el?: Element) => {
  if (!el) return;
  const btn = (el as HTMLElement).querySelector('button');
  if (btn && !(el as HTMLElement).contains(document.activeElement)) {
    requestAnimationFrame(() => btn.focus());
  }
};

const { events, args, argTypes } = getStorybookHelpers<IbkStepButton>('ibk-step-button');

const meta: Meta<IbkStepButton> = {
  title: 'Components/Step Button',
  component: 'ibk-step-button',
  args,
  argTypes,
  parameters: {
    actions: {
      handles: events,
    },
    docs: {
      description: {
        component:
          'A compact icon-only stepper button. `dominance` sets the colour ramp ' +
          '(prominent / regular / decent), `size` the icon scale (40 / 20) and ' +
          '`shape` the corner style (round / quad / rect — rect is size 20 only). ' +
          'Hover, pressed, focus and disabled states are handled automatically. ' +
          'For a grouped previous/next or up/down pair, see Step Button Bar.',
      },
    },
  },
  render: (args) => renderStepButton(args),
};

export default meta;
type Story = StoryObj<IbkStepButton & typeof args>;

const renderStepButton = (args: IbkStepButton) => html`
  <ibk-step-button
    icon="${ifDefined(args.icon || undefined)}"
    dominance="${ifDefined(args.dominance || undefined)}"
    size="${ifDefined(args.size || undefined)}"
    shape="${ifDefined(args.shape || undefined)}"
    label="${ifDefined(args.label || undefined)}"
    ?disabled="${args.disabled}"
    @step="${args.step || action}"
  ></ibk-step-button>
`;

const DOMINANCES: IbkStepButton['dominance'][] = ['prominent', 'regular', 'decent'];

/** Interactive playground driven by the controls panel. */
export const Playground: Story = {
  args: {
    icon: 'JmpU',
    dominance: 'prominent',
    size: '40',
    shape: 'round',
    label: 'Increase value',
    disabled: false,
  },
};

/** Default — a single stepper button. */
export const Default: Story = {
  render: () => html`
    <ibk-step-button
      dominance="prominent"
      size="40"
      shape="round"
      icon="JmpU"
      label="Increase value"
      @step=${action}
    ></ibk-step-button>
  `,
};

/* -------------------------------------------------------------------------- */
/*  States reference (mirrors the Figma matrix)                               */
/* -------------------------------------------------------------------------- */

/** Rows of the states reference. Middle three are forced visually (see `forceStyles`). */
const STATE_ROWS: { key: string; cls: string; disabled?: boolean }[] = [
  { key: 'enabled', cls: '' },
  { key: 'hover', cls: 'sb-force-hover' },
  { key: 'pressed', cls: 'sb-force-pressed' },
  { key: 'focus', cls: 'sb-force-focus' },
  { key: 'disabled', cls: '', disabled: true },
];

/**
 * Freezes the interactive states so the whole matrix is readable at a glance.
 *
 * The cells are inert (`pointer-events: none`), so a real pointer can never
 * repaint a row with its own `:hover` — what you see is what the class forces.
 * The colours repeat the global `--ibk-*` tokens from `step-button.css`: the
 * component no longer exposes per-state custom properties to read back (they
 * were removed in the IDES-52 design review), and this duplication stays inside
 * the story instead of adding demo-only hooks to the shipped CSS.
 */
const forceStyles = html`
  <style>
    /* A static reference matrix — no cell reacts to the pointer. */
    .sb-states .sb-cell {
      display: inline-flex;
      pointer-events: none;
    }

    .sb-force-hover .ibkStepButton-prominent {
      background: var(--ibk-red-49);
      border-color: var(--ibk-red-49);
    }
    /* Regular hover has no palette token — same literal ramp as step-button.css. */
    .sb-force-hover .ibkStepButton-regular {
      background: rgb(82, 105, 122);
      border-color: rgb(82, 105, 122);
    }
    .sb-force-hover .ibkStepButton-decent {
      background: var(--ibk-neutral-grey-90);
      border-color: var(--ibk-neutral-grey-90);
    }

    .sb-force-pressed .ibkStepButton-prominent {
      background: var(--ibk-red-33);
      border-color: var(--ibk-red-33);
    }
    .sb-force-pressed .ibkStepButton-regular {
      background: var(--ibk-petrol-26);
      border-color: var(--ibk-petrol-26);
    }
    .sb-force-pressed .ibkStepButton-decent {
      background: var(--ibk-neutral-grey-74);
      border-color: var(--ibk-neutral-grey-74);
    }

    .sb-force-focus .ibkStepButton {
      outline: 2px solid var(--ibk-focusstroke);
      outline-offset: 2px;
    }
    .sb-states {
      border-collapse: separate;
      border-spacing: 0.75rem 0.5rem;
    }
    .sb-states th {
      font-weight: 600;
      font-size: 0.75rem;
      color: #555;
    }
    .sb-states td {
      text-align: center;
    }
    .sb-states .sb-row-label {
      text-align: right;
      color: #777;
      font-size: 0.8125rem;
      text-transform: capitalize;
      padding-right: 0.5rem;
    }
  </style>
`;

const statesSection = (
  title: string,
  shape: IbkStepButton['shape'],
  sizes: IbkStepButton['size'][],
) => html`
  <div style="margin-bottom:2rem;">
    <p style="margin:0 0 0.5rem;"><strong>Style: ${title}</strong></p>
    <table class="sb-states">
      <thead>
        <tr>
          <th></th>
          ${DOMINANCES.map(
            (dom) =>
              html`<th colspan=${sizes.length} style="text-transform:capitalize;">${dom}</th>`,
          )}
        </tr>
        <tr>
          <th></th>
          ${DOMINANCES.map(() => sizes.map((size) => html`<th>${size}</th>`))}
        </tr>
      </thead>
      <tbody>
        ${STATE_ROWS.map(
          (state) => html`
            <tr>
              <td class="sb-row-label">${state.key}</td>
              ${DOMINANCES.map((dom) =>
                sizes.map(
                  (size) => html`
                    <td>
                      <span class="sb-cell ${state.cls}">
                        <ibk-step-button
                          dominance=${ifDefined(dom)}
                          size=${ifDefined(size)}
                          shape=${ifDefined(shape)}
                          icon="JmpU"
                          label="${state.key}"
                          ?disabled=${state.disabled}
                        ></ibk-step-button>
                      </span>
                    </td>
                  `,
                ),
              )}
            </tr>
          `,
        )}
      </tbody>
    </table>
  </div>
`;

/**
 * States reference — the full Figma matrix: every state (enabled / hover /
 * pressed / focus / disabled) across dominance and size, per style. Hover,
 * pressed and focus are normally interactive, so here they are forced visually
 * to show the whole matrix at once.
 */
export const States: Story = {
  render: () => html`
    ${forceStyles} ${statesSection('Round', 'round', ['40', '20'])}
    ${statesSection('Quad', 'quad', ['40', '20'])} ${statesSection('Rect', 'rect', ['20'])}
  `,
};

/**
 * Focus state — the blue focus ring on round buttons, matching the Figma
 * "focus" row. The first button is auto-focused so the ring shows immediately;
 * press Tab to move focus between them.
 */
export const Focus: Story = {
  render: () => html`
    <div ${ref(autofocusFirst)} style="display:flex; gap:1.5rem; align-items:center;">
      <ibk-step-button
        icon="JmpU"
        dominance="prominent"
        shape="round"
        label="Prominent"
      ></ibk-step-button>
      <ibk-step-button
        icon="JmpU"
        dominance="regular"
        shape="round"
        label="Regular"
      ></ibk-step-button>
      <ibk-step-button
        icon="JmpU"
        dominance="decent"
        shape="round"
        label="Decent"
      ></ibk-step-button>
    </div>
    <p style="margin-top:1rem; color:#666; font-size:0.875rem;">
      The blue ring is the keyboard focus state (<code>:focus-visible</code>). Press
      <kbd>Tab</kbd> to move focus between buttons.
    </p>
  `,
};
