import type { Meta, StoryObj } from '@storybook/web-components';
import { getStorybookHelpers } from '@wc-toolkit/storybook-helpers';
import { html } from 'lit';
import { ifDefined } from 'lit/directives/if-defined.js';
import { ref } from 'lit/directives/ref.js';
import { action } from './../utils/utils';
import './ibk-step-button-bar';
import { IbkStepButtonBar } from './ibk-step-button-bar';

/** Moves keyboard focus onto the first inner button so `:focus-visible` shows. */
const autofocusFirst = (el?: Element) => {
  if (!el) return;
  const btn = (el as HTMLElement).querySelector('button');
  if (btn && !(el as HTMLElement).contains(document.activeElement)) {
    requestAnimationFrame(() => btn.focus());
  }
};

const { events, args, argTypes } = getStorybookHelpers<IbkStepButtonBar>('ibk-step-button-bar');

const meta: Meta<IbkStepButtonBar> = {
  title: 'Components/Step Button Bar',
  component: 'ibk-step-button-bar',
  args,
  argTypes,
  parameters: {
    actions: {
      handles: events,
    },
    docs: {
      description: {
        component:
          'Two step buttons grouped as one control. `shape` sets the layout: ' +
          '`round` is a horizontal previous / next bar, `quad` and `rect` are ' +
          'vertical up / down bars. `framed` wraps the pair in a bordered frame. ' +
          '`startIcon` / `endIcon` override the two chevron icons.',
      },
    },
  },
  render: (args) => renderBar(args),
};

export default meta;
type Story = StoryObj<IbkStepButtonBar & typeof args>;

const renderBar = (args: IbkStepButtonBar) => html`
  <ibk-step-button-bar
    dominance="${ifDefined(args.dominance || undefined)}"
    size="${ifDefined(args.size || undefined)}"
    shape="${ifDefined(args.shape || undefined)}"
    .startIcon=${args.startIcon || undefined}
    .endIcon=${args.endIcon || undefined}
    ?framed="${args.framed}"
    ?disabled="${args.disabled}"
    @step="${args.step || action}"
  ></ibk-step-button-bar>
`;

const DOMINANCES: IbkStepButtonBar['dominance'][] = ['prominent', 'regular', 'decent'];

/** One labelled row: the same bar config across every dominance. */
const row = (
  label: string,
  size: IbkStepButtonBar['size'],
  shape: IbkStepButtonBar['shape'],
  framed = false,
) => html`
  <div style="display:flex; gap:2rem; align-items:center;">
    <span style="width:6rem; color:#777; font-size:0.8125rem;">${label}</span>
    ${DOMINANCES.map(
      (dominance) => html`
        <ibk-step-button-bar
          dominance=${ifDefined(dominance)}
          size=${ifDefined(size)}
          shape=${ifDefined(shape)}
          ?framed=${framed}
          @step=${action}
        ></ibk-step-button-bar>
      `,
    )}
  </div>
`;

/** Interactive playground driven by the controls panel. */
export const Playground: Story = {
  args: {
    dominance: 'prominent',
    size: '40',
    shape: 'round',
    framed: true,
    disabled: false,
  },
};

/**
 * Horizontal (Round) bars — previous / next. Order per row: Prominent, Regular, Decent.
 */
export const Horizontal: Story = {
  render: () => html`
    <div style="display:flex; flex-direction:column; gap:1.5rem;">
      ${row('40h framed', '40', 'round', true)} ${row('40h', '40', 'round', false)}
      ${row('20h framed', '20', 'round', true)} ${row('20h', '20', 'round', false)}
    </div>
  `,
};

/**
 * Vertical (Quad / Rect) bars — up / down. Order per row: Prominent, Regular, Decent.
 */
export const Vertical: Story = {
  render: () => html`
    <div style="display:flex; flex-direction:column; gap:1.5rem;">
      ${row('20v quad', '20', 'quad', false)} ${row('20v rect', '20', 'rect', false)}
    </div>
  `,
};

/**
 * Focus state — the blue focus ring on a round bar (framed and unframed). The
 * first button is auto-focused; press Tab to move focus between the buttons.
 */
export const Focus: Story = {
  render: () => html`
    <div ${ref(autofocusFirst)} style="display:flex; gap:2rem; align-items:center;">
      <ibk-step-button-bar dominance="prominent" shape="round" framed></ibk-step-button-bar>
      <ibk-step-button-bar dominance="prominent" shape="round"></ibk-step-button-bar>
    </div>
    <p style="margin-top:1rem; color:#666; font-size:0.875rem;">
      The blue ring is the keyboard focus state (<code>:focus-visible</code>). Press
      <kbd>Tab</kbd> to move focus between buttons.
    </p>
  `,
};
