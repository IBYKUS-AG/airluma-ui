import type { Meta, StoryObj } from '@storybook/web-components';
import { getStorybookHelpers } from '@wc-toolkit/storybook-helpers';
import { html } from 'lit';
import { ifDefined } from 'lit/directives/if-defined.js';
import { action } from '../utils/utils';
import './ibk-progress';
import { IbkProgress } from './ibk-progress';

const { events, args, argTypes } = getStorybookHelpers<IbkProgress>('ibk-progress');

const meta: Meta<IbkProgress> = {
  title: 'Components/Progress',
  component: 'ibk-progress',
  args: {
    ...args,
    label: 'Label',
    type: 'linear',
    variant: 'regular',
    value: 40,
    max: 100,
    disabled: false,
  },
  argTypes: {
    ...argTypes,
    type: {
      control: 'select',
      options: ['linear', 'circular', 'spinner'],
    },
    variant: {
      control: 'select',
      options: ['regular', 'decent'],
    },
    value: {
      control: { type: 'number', min: 0, max: 100, step: 1 },
    },
    max: {
      control: { type: 'number', min: 1, max: 100, step: 1 },
    },
    disabled: {
      control: 'boolean',
    },
    decent: {
      table: { disable: true },
      control: false,
    },
  },
  parameters: {
    actions: {
      handles: events,
    },
  },
  render: (args) => renderProgress(args),
};

export default meta;
type Story = StoryObj<IbkProgress & typeof args>;

const renderProgress = (args: IbkProgress) => html`
  <ibk-progress
    label="${ifDefined(args.label || undefined)}"
    labelInfoIcon="${ifDefined(args.labelInfoIcon || undefined)}"
    type="${ifDefined(args.type || undefined)}"
    variant="${ifDefined(args.variant || undefined)}"
    value="${ifDefined(typeof args.value === 'number' ? args.value : undefined)}"
    max="${ifDefined(typeof args.max === 'number' ? args.max : undefined)}"
    ?disabled="${args.disabled}"
    @label-icon-click="${action}"
  ></ibk-progress>
`;

const defaultArgs: Story['args'] = {
  label: 'Label',
  value: 40,
  max: 100,
};

export const ProgressLinear: Story = {
  args: { ...defaultArgs, type: 'linear', variant: 'regular' },
};

export const ProgressCircular: Story = {
  args: { ...defaultArgs, label: undefined, type: 'circular', variant: 'regular' },
};

export const InfiniteSpinner: Story = {
  args: { label: undefined, type: 'spinner', variant: 'regular', value: 40, max: 100 },
};

/* ***************************************************************************************
 *  Linear progress
 * ***************************************************************************************/

export const LinearDecent: Story = {
  args: { ...defaultArgs, type: 'linear', variant: 'decent' },
};

export const LinearDisabled: Story = {
  args: { ...defaultArgs, type: 'linear', variant: 'regular', disabled: true },
};

/* ***************************************************************************************
 *  Circular progress
 * ***************************************************************************************/

export const CircularDecent: Story = {
  args: { ...defaultArgs, label: undefined, type: 'circular', variant: 'decent' },
};

export const CircularDisabled: Story = {
  args: { ...defaultArgs, label: undefined, type: 'circular', variant: 'regular', disabled: true },
};

/* ***************************************************************************************
 *  Infinite spinner
 * ***************************************************************************************/

export const SpinnerDecent: Story = {
  args: { label: undefined, type: 'spinner', variant: 'decent', value: 40, max: 100 },
};

export const SpinnerDisabled: Story = {
  args: {
    label: undefined,
    type: 'spinner',
    variant: 'regular',
    value: 40,
    max: 100,
    disabled: true,
  },
};
