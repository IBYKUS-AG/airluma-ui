import type { Meta, StoryObj } from '@storybook/web-components';
import { getStorybookHelpers } from '@wc-toolkit/storybook-helpers';
import { html } from 'lit';
import { ifDefined } from 'lit/directives/if-defined.js';
import './ibk-switch';
import { IbkSwitch } from './ibk-switch';
import { action } from '../utils/utils';

const { events, args, argTypes } = getStorybookHelpers<IbkSwitch>('ibk-switch');

const meta: Meta<IbkSwitch> = {
  title: 'Components/Switch',
  component: 'ibk-switch',
  args: {
    ...args,
    checked: false,
    state: 'default',
    labelPosition: 'trailing',
    supportingText: '',
  },
  argTypes: {
    ...argTypes,
    state: {
      control: 'select',
      options: ['default', 'alert', 'success'],
    },
    supportingText: {
      control: 'text',
    },
    checked: {
      control: 'boolean',
    },
    labelPosition: {
      control: 'select',
      options: ['trailing', 'leading'],
    },
  },
  parameters: {
    actions: {
      handles: events,
    },
  },
  render: (args) => renderSwitch(args),
};

export default meta;
type Story = StoryObj<IbkSwitch & typeof args>;

const renderSwitch = (args: IbkSwitch) => html`
  <ibk-switch
    label="${ifDefined(args.label || undefined)}"
    labelPosition="${ifDefined(args.labelPosition || undefined)}"
    ?checked="${args.checked}"
    ?disabled="${args.disabled}"
    state="${ifDefined(args.state && args.state !== 'default' ? args.state : undefined)}"
    supportingText="${ifDefined(args.supportingText || undefined)}"
    @change="${args.onchange || action}"
  ></ibk-switch>
`;

const defaultArgs: Story['args'] = {
  label: 'This is a sample switch',
  labelPosition: 'trailing',
  supportingText: 'This is a sample text support',
};

export const Default: Story = {
  args: {
    ...defaultArgs,
  },
};

export const WithAlert: Story = {
  args: {
    ...defaultArgs,
    state: 'alert',
    supportingText: 'Please select an option',
  },
};

export const WithSuccess: Story = {
  args: {
    ...defaultArgs,
    state: 'success',
    supportingText: 'Selection confirmed',
  },
};

export const LeadingLabel: Story = {
  args: {
    ...defaultArgs,
    label: 'This is a sample with leading Textlabel',
    labelPosition: 'leading',
  },
};

export const Checked: Story = {
  args: {
    label: 'This is a sample with a checked Switch',
    checked: true,
  },
};

export const Disabled: Story = {
  args: {
    label: 'This is a sample with a disabled Switch',
    disabled: true,
  },
};

export const DisabledChecked: Story = {
  args: {
    label: 'This is a sample with a disabled checked Switch',
    checked: true,
    disabled: true,
  },
};

export const LeadingLabelSwitch: Story = {
  args: {
    label: 'This is a sample with leading Textlabel',
    labelPosition: 'leading',
  },
};
