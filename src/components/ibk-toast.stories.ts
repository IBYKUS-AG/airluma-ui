import type { Meta, StoryObj } from '@storybook/web-components';
import { getStorybookHelpers } from '@wc-toolkit/storybook-helpers';
import { html } from 'lit';
import { ifDefined } from 'lit/directives/if-defined.js';
import './ibk-toast';
import { IbkToast } from './ibk-toast';

const { events, args, argTypes } = getStorybookHelpers<IbkToast>('ibk-toast');

const meta: Meta<IbkToast> = {
  title: 'Components/Toast',
  component: 'ibk-toast',
  args: {
    ...args,
    variant: 'regular',
    state: 'default',
    label: 'Text goes here',
    secondaryLabel: undefined,
    icon: undefined,
  },
  argTypes: {
    ...argTypes,
    variant: {
      control: 'select',
      options: ['regular', 'decent'],
    },
    state: {
      control: 'select',
      options: ['default', 'alert', 'warning', 'success'],
    },
    type: { table: { disable: true } },
    status: { table: { disable: true } },
    icon: {
      control: 'text',
      description: 'IBYKUS icon ligature, for example Time, ChkM, InfoCirc or WarnTria.',
    },
    label: {
      control: 'text',
    },
    secondaryLabel: {
      control: 'text',
    },
  },
  parameters: {
    actions: {
      handles: events,
    },
  },
  render: (args) => renderToast(args),
};

export default meta;
type Story = StoryObj<IbkToast & typeof args>;

const renderToast = (args: IbkToast) => html`
  <ibk-toast
    variant="${ifDefined(args.variant || undefined)}"
    state="${ifDefined(args.state || undefined)}"
    icon="${ifDefined(args.icon || undefined)}"
    label="${ifDefined(args.label || undefined)}"
    secondary-label="${ifDefined(args.secondaryLabel || undefined)}"
  ></ibk-toast>
`;

export const Default: Story = {
  args: {
    variant: 'regular',
    state: 'default',
    icon: undefined,
    label: 'Text goes here',
  },
};

export const RegularWithIcon: Story = {
  args: {
    variant: 'regular',
    state: 'default',
    icon: 'Time',
    label: 'Text goes here',
  },
};

export const RegularSuccess: Story = {
  args: {
    variant: 'regular',
    state: 'success',
    icon: 'ChkM',
    label: 'Text goes here',
  },
};

export const RegularWarning: Story = {
  args: {
    variant: 'regular',
    state: 'warning',
    icon: 'Time',
    label: 'Text goes here',
  },
};

export const RegularAlert: Story = {
  args: {
    variant: 'regular',
    state: 'alert',
    icon: 'Time',
    label: 'Text goes here',
  },
};

export const DecentDefault: Story = {
  args: {
    variant: 'decent',
    state: 'default',
    icon: undefined,
    label: 'Text goes here',
  },
};

export const DecentSuccess: Story = {
  args: {
    variant: 'decent',
    state: 'success',
    icon: 'ChkM',
    label: 'Text goes here',
  },
};

export const DecentTwoLabel: Story = {
  args: {
    variant: 'decent',
    state: 'default',
    icon: 'Time',
    label: 'Available until',
    secondaryLabel: '14:30',
  },
};

export const RegularEIBTowLines: Story = {
  args: {
    variant: 'regular',
    state: 'default',
    icon: 'Time',
    label: 'Text goes here new line',
  },
};

export const RegularTowLines: Story = {
  args: {
    variant: 'regular',
    state: 'default',
    icon: undefined,
    label: 'Text goes here new line',
  },
};