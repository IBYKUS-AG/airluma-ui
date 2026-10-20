import type { Meta, StoryObj } from '@storybook/web-components';
import { getStorybookHelpers } from '@wc-toolkit/storybook-helpers';
import { html } from 'lit';
import { ifDefined } from 'lit/directives/if-defined.js';
import { action } from '../utils/utils';
import './ibk-meter';
import { IbkMeter } from './ibk-meter';

const { events, args, argTypes } = getStorybookHelpers<IbkMeter>('ibk-meter');

const meta: Meta<IbkMeter> = {
  title: 'Components/Meter',
  component: 'ibk-meter',
  args: {
    ...args,
    level: 'optimal',
    variant: 'regular',
    disabled: false,
  },
  argTypes: {
    ...argTypes,
    level: {
      control: 'select',
      options: ['max', 'highPos', 'highNeg', 'optimal', 'low', 'min'],
    },
    variant: {
      control: 'select',
      options: ['regular', 'decent'],
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
  render: (args) => renderMeter(args),
};

export default meta;
type Story = StoryObj<IbkMeter & typeof args>;

const renderMeter = (args: IbkMeter) => html`
  <ibk-meter
    label="${ifDefined(args.label || undefined)}"
    labelInfoIcon="${ifDefined(args.labelInfoIcon || undefined)}"
    level="${ifDefined(args.level || undefined)}"
    variant="${ifDefined(args.variant || undefined)}"
    value="${ifDefined(typeof args.value === 'number' ? args.value : undefined)}"
    ?disabled="${args.disabled}"
    @label-icon-click="${action}"
  ></ibk-meter>
`;

const defaultArgs: Story['args'] = {
  label: 'Label',
  labelInfoIcon: 'InfoCirc',
};

/* ***************************************************************************************
 *  Regular variant
 * ***************************************************************************************/

export const RegularMax: Story = {
  args: { ...defaultArgs, variant: 'regular', level: 'max' },
};

export const RegularHighPos: Story = {
  args: { ...defaultArgs, variant: 'regular', level: 'highPos' },
};

export const RegularHighNeg: Story = {
  args: { ...defaultArgs, variant: 'regular', level: 'highNeg' },
};

export const RegularOptimal: Story = {
  args: { ...defaultArgs, variant: 'regular', level: 'optimal' },
};

export const RegularLow: Story = {
  args: { ...defaultArgs, variant: 'regular', level: 'low' },
};

export const RegularMin: Story = {
  args: { ...defaultArgs, variant: 'regular', level: 'min' },
};

export const RegularDisabled: Story = {
  args: { ...defaultArgs, variant: 'regular', level: 'optimal', disabled: true },
};

/* ***************************************************************************************
 *  Decent variant
 * ***************************************************************************************/

export const DecentMax: Story = {
  args: { ...defaultArgs, variant: 'decent', level: 'max' },
};

export const DecentHighPos: Story = {
  args: { ...defaultArgs, variant: 'decent', level: 'highPos' },
};

export const DecentHighNeg: Story = {
  args: { ...defaultArgs, variant: 'decent', level: 'highNeg' },
};

export const DecentOptimal: Story = {
  args: { ...defaultArgs, variant: 'decent', level: 'optimal' },
};

export const DecentLow: Story = {
  args: { ...defaultArgs, variant: 'decent', level: 'low' },
};

export const DecentMin: Story = {
  args: { ...defaultArgs, variant: 'decent', level: 'min' },
};

export const DecentDisabled: Story = {
  args: { ...defaultArgs, variant: 'decent', level: 'optimal', disabled: true },
};
