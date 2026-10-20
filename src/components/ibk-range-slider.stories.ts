import type { Meta, StoryObj } from '@storybook/web-components';
import { getStorybookHelpers } from '@wc-toolkit/storybook-helpers';
import { html } from 'lit';
import { ifDefined } from 'lit/directives/if-defined.js';
import { useArgs } from 'storybook/preview-api';
import { action } from '../utils/utils';
import './ibk-range-slider';
import { IbkRangeSlider } from './ibk-range-slider';

const { events, args, argTypes } = getStorybookHelpers<IbkRangeSlider>('ibk-range-slider');

const meta: Meta<IbkRangeSlider> = {
  title: 'Components/Range Slider',
  component: 'ibk-range-slider',
  args: {
    ...args,
    dominance: 'regular',
    state: 'default',
    disabled: false,
    // FEATURE NOT READY YET - vertical orientation
    // vertical: false,
    min: 0,
    max: 100,
    step: 1,
  },
  argTypes: {
    ...argTypes,
    dominance: {
      control: 'select',
      options: ['regular', 'decent'],
    },
    // FEATURE NOT READY YET - vertical orientation
    // vertical: {
    //   control: 'boolean',
    // },
    state: {
      control: 'select',
      options: ['default', 'warning'],
    },
    disabled: {
      control: 'boolean',
    },
    value: {
      control: { type: 'number', min: 0, max: 100, step: 1 },
    },
  },
  parameters: {
    actions: {
      handles: events,
    },
  },
  render: (args) => {
    // Keep the Controls table in sync with the value the user drags to. Without this the
    // slider moves but `args.value` — and therefore the Controls panel and the Docs HTML
    // snippet — would stay at its initial value.
    const [, updateArgs] = useArgs();
    return renderRangeSlider(args, (value) => updateArgs({ value }));
  },
};

export default meta;
type Story = StoryObj<IbkRangeSlider & typeof args>;

/*
 * FEATURE NOT READY YET - vertical orientation. To switch it back on, bind the property
 * on the element with `?vertical="${args.vertical}"` and let the wrapper drop its fixed
 * width in the vertical case with `style=${args.vertical ? '' : 'width: 9.75rem;'}`.
 */
const renderRangeSlider = (args: IbkRangeSlider, onValueChange: (value: number) => void) => html`
  <div style="width: 9.75rem;">
    <ibk-range-slider
      label="${ifDefined(args.label || undefined)}"
      labelInfoIcon="${ifDefined(args.labelInfoIcon || undefined)}"
      dominance="${ifDefined(args.dominance || undefined)}"
      min="${ifDefined(typeof args.min === 'number' ? args.min : undefined)}"
      max="${ifDefined(typeof args.max === 'number' ? args.max : undefined)}"
      step="${ifDefined(typeof args.step === 'number' ? args.step : undefined)}"
      value="${ifDefined(typeof args.value === 'number' ? args.value : undefined)}"
      leadingIcon="${ifDefined(args.leadingIcon || undefined)}"
      trailingIcon="${ifDefined(args.trailingIcon || undefined)}"
      leadingText="${ifDefined(args.leadingText || undefined)}"
      trailingText="${ifDefined(args.trailingText || undefined)}"
      supportingText="${ifDefined(args.supportingText || undefined)}"
      supportingIcon="${ifDefined(args.supportingIcon || undefined)}"
      state="${ifDefined(args.state || undefined)}"
      ?disabled="${args.disabled}"
      @label-icon-click="${action}"
      @input="${(e: CustomEvent) => {
        action(e);
        onValueChange((e.target as HTMLInputElement).valueAsNumber);
      }}"
      @change="${action}"
    ></ibk-range-slider>
  </div>
`;

const supportingArgs: Story['args'] = {
  supportingIcon: 'Notf',
  supportingText: 'Supporting text conveys additional information about the field.',
};

const warningArgs: Story['args'] = {
  state: 'warning',
  supportingIcon: 'Notf',
  supportingText: 'Warning text alerts users to potential risks or consequences.',
};

const iconArgs: Story['args'] = {
  label: 'Label',
  labelInfoIcon: 'InfoCirc',
  leadingIcon: 'Minus',
  trailingIcon: 'Plus',
};

const textArgs: Story['args'] = {
  label: 'Label',
  labelInfoIcon: 'InfoCirc',
  leadingText: '0%',
  trailingText: '100%',
};

/* ***************************************************************************************
 *  Dominance regular - type icon
 * ***************************************************************************************/

export const RegularIconEnabled: Story = {
  args: { ...iconArgs, ...supportingArgs, dominance: 'regular', value: 0 },
};

export const RegularIconWarning: Story = {
  args: { ...iconArgs, ...warningArgs, dominance: 'regular', value: 0 },
};

export const RegularIconDisabled: Story = {
  args: { ...iconArgs, ...supportingArgs, dominance: 'regular', value: 0, disabled: true },
};

/* ***************************************************************************************
 *  Dominance regular - type text
 * ***************************************************************************************/

export const RegularTextEnabled: Story = {
  args: { ...textArgs, ...supportingArgs, dominance: 'regular', value: 0 },
};

export const RegularTextWarning: Story = {
  args: { ...textArgs, ...warningArgs, dominance: 'regular', value: 0 },
};

export const RegularTextDisabled: Story = {
  args: { ...textArgs, ...supportingArgs, dominance: 'regular', value: 0, disabled: true },
};

/* ***************************************************************************************
 *  Dominance decent - type icon
 * ***************************************************************************************/

export const DecentIconEnabled: Story = {
  args: { ...iconArgs, ...supportingArgs, dominance: 'decent', value: 0 },
};

export const DecentIconWarning: Story = {
  args: { ...iconArgs, ...warningArgs, dominance: 'decent', value: 0 },
};

export const DecentIconDisabled: Story = {
  args: { ...iconArgs, ...supportingArgs, dominance: 'decent', value: 0, disabled: true },
};

/* ***************************************************************************************
 *  Dominance decent - type text
 * ***************************************************************************************/

export const DecentTextEnabled: Story = {
  args: { ...textArgs, ...supportingArgs, dominance: 'decent', value: 0 },
};

export const DecentTextWarning: Story = {
  args: { ...textArgs, ...warningArgs, dominance: 'decent', value: 0 },
};

export const DecentTextDisabled: Story = {
  args: { ...textArgs, ...supportingArgs, dominance: 'decent', value: 0, disabled: true },
};

/* ***************************************************************************************
 *  Track positions
 * ***************************************************************************************/

export const TrackStart: Story = {
  args: { ...iconArgs, dominance: 'regular', value: 0 },
};

export const TrackMid: Story = {
  args: { ...iconArgs, dominance: 'regular', value: 50 },
};

export const TrackEnd: Story = {
  args: { ...iconArgs, dominance: 'regular', value: 100 },
};

/* ***************************************************************************************
 *  Bare track - no leading or trailing element
 * ***************************************************************************************/

export const WithoutLeadingAndTrailing: Story = {
  args: { label: 'Label', labelInfoIcon: 'InfoCirc', dominance: 'regular', value: 40 },
};

/* ***************************************************************************************
 *  Vertical - one box with every state, bare track only (no label, no supporting text)
 *
 *  FEATURE NOT READY YET - the vertical orientation is disabled, so this story stays
 *  commented out. To switch it back on, uncomment the block below together with the
 *  `vertical` property in ibk-range-slider.ts, the two marked blocks in its `render()`
 *  and the vertical section in src/styles/components/range-slider.css.
 * ***************************************************************************************/

/*
const verticalColumns = [
  { caption: 'enabled', state: 'default', disabled: false },
  { caption: 'disabled', state: 'default', disabled: true },
  { caption: 'warning', state: 'warning', disabled: false },
] as const;

const verticalRows = [
  { caption: 'regular / icon', dominance: 'regular', icon: true },
  { caption: 'regular / plain', dominance: 'regular', icon: false },
  { caption: 'decent / icon', dominance: 'decent', icon: true },
  { caption: 'decent / plain', dominance: 'decent', icon: false },
] as const;

const captionStyle = 'color: var(--ibk-neutral-grey-45); font-size: 0.75rem; white-space: nowrap;';

export const VerticalMatrix: Story = {
  name: 'Vertical - all states',
  parameters: { controls: { disable: true } },
  render: () => html`
    <div
      style="align-items: center; display: grid; gap: 1.5rem var(--ibk-spacing-24, 1.5rem);
             grid-template-columns: auto repeat(3, auto); justify-content: start;
             justify-items: center;"
    >
      <span></span>
      ${verticalColumns.map((column) => html`<span style=${captionStyle}>${column.caption}</span>`)}
      ${verticalRows.map(
        (row) => html`
          <span style="${captionStyle} justify-self: start;">${row.caption}</span>
          ${verticalColumns.map(
            (column) => html`
              <ibk-range-slider
                vertical
                dominance=${row.dominance}
                state=${column.state}
                value="50"
                leadingIcon=${ifDefined(row.icon ? 'Minus' : undefined)}
                trailingIcon=${ifDefined(row.icon ? 'Plus' : undefined)}
                ?disabled=${column.disabled}
              ></ibk-range-slider>
            `,
          )}
        `,
      )}
    </div>
  `,
};
*/
