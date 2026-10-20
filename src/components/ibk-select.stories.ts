import type { Meta, StoryObj } from '@storybook/web-components';
import { getStorybookHelpers } from '@wc-toolkit/storybook-helpers';
import { html } from 'lit';
import { ifDefined } from 'lit/directives/if-defined.js';
import { action } from '../utils/utils';
import './ibk-select';
import { IbkSelect } from './ibk-select';

const { events, args, argTypes } = getStorybookHelpers<IbkSelect>('ibk-select');

const meta: Meta<IbkSelect> = {
  title: 'Components/Select',
  component: 'ibk-select',
  args: {
    ...args,
    state: 'default',
    disabled: false,
    prominent: false,
  },
  argTypes: {
    ...argTypes,
    value: {
      table: {
        disable: true,
      },
    },
    state: {
      control: 'select',
      options: ['default', 'alert', 'warning', 'success'],
    },
    supportingText: {
      control: 'text',
    },
    disabled: {
      control: 'boolean',
    },
    prominent: {
      control: 'boolean',
    },
  },
  parameters: {
    actions: {
      handles: events,
    },
  },
  render: (args) => renderSelect(args),
};

export default meta;
type Story = StoryObj<IbkSelect & typeof args>;

const renderSelect = (args: IbkSelect) => html`
  <ibk-select
    label="${ifDefined(args.label || undefined)}"
    labelInfoIcon="${ifDefined(args.labelInfoIcon || undefined)}"
    placeholder="${ifDefined(args.placeholder || undefined)}"
    value="${ifDefined(args.value || undefined)}"
    ?disabled="${args.disabled}"
    ?prominent="${args.prominent}"
    state="${ifDefined(args.state && args.state !== 'default' ? args.state : undefined)}"
    supportingText="${ifDefined(args.supportingText || undefined)}"
    supportingIcon="${ifDefined(args.supportingIcon || undefined)}"
    textInfoIcon="${ifDefined(args.textInfoIcon || undefined)}"
    .options="${args.options}"
    @change="${args.onchange || action}"
    @label-icon-click="${action}"
  ></ibk-select>
`;

const defaultOptions = [
  { label: 'Option 1', value: '1' },
  { label: 'Option 2', value: '2' },
  { label: 'Option 3', value: '3' },
];

export const Default: Story = {
  args: {
    label: 'Select Label',
    placeholder: 'Please choose',
    value: '',
    options: defaultOptions,
    supportingText: 'This is a sample supporting text.',
    supportingIcon: 'Notf',
    textInfoIcon: '',
    labelInfoIcon: 'InfoCirc',
  },
};

export const WithAlert: Story = {
  args: {
    label: 'Select Label',
    placeholder: 'Please choose',
    value: '1',
    options: defaultOptions,
    state: 'alert',
    supportingText: 'This could be an alert message.',
    supportingIcon: 'WarnTria',
  },
};

export const WithWarning: Story = {
  args: {
    label: 'Select Label',
    placeholder: 'Please choose',
    value: '1',
    options: defaultOptions,
    state: 'warning',
    supportingText: 'This could be a warning message.',
    supportingIcon: 'Notf',
  },
};

export const WithSuccess: Story = {
  args: {
    label: 'Select Label',
    placeholder: 'Please choose',
    value: '1',
    options: defaultOptions,
    state: 'success',
    supportingText: 'Selection confirmed',
    supportingIcon: 'ChkMCirc',
  },
};

export const Disabled: Story = {
  args: {
    label: 'Disabled Select',
    placeholder: 'Please choose',
    value: '1',
    options: defaultOptions,
    disabled: true,
    supportingText: 'This field is disabled.',
    supportingIcon: 'Notf',
  },
};

export const WithoutLabel: Story = {
  args: {
    placeholder: 'Please choose',
    value: '',
    options: defaultOptions,
    supportingText: 'Select without a label.',
    supportingIcon: 'Notf',
  },
};

export const LongOptions: Story = {
  args: {
    label: 'Select Label',
    placeholder: 'Please choose',
    value: '',
    options: [
      {
        label: 'Option 1 with a very long text, to show the selectable default state.',
        value: '1',
      },
      { label: 'Option 2', value: '2' },
    ],
    supportingText: 'This is a sample supporting text.',
    supportingIcon: 'Notf',
  },
};

export const WithInfoIcon: Story = {
  args: {
    label: 'With Info Icon',
    placeholder: 'Please choose',
    value: '',
    options: defaultOptions,
    textInfoIcon: 'Search',
    labelInfoIcon: 'InfoCirc',
    supportingText: 'Select with an info icon inside.',
    supportingIcon: 'Notf',
  },
};

export const Prominent: Story = {
  args: {
    label: 'Prominent Select',
    placeholder: 'Please choose',
    value: '',
    options: defaultOptions,
    prominent: true,
    supportingText: 'Prominent select variant.',
    supportingIcon: 'Notf',
  },
};

export const ProminentAlert: Story = {
  args: {
    label: 'Prominent Select',
    placeholder: 'Please choose',
    value: '1',
    options: defaultOptions,
    prominent: true,
    state: 'alert',
    supportingText: 'Alert text helps users identify mistakes and recover from them.',
    supportingIcon: 'WarnTria',
    labelInfoIcon: 'InfoCirc',
  },
};

export const ProminentSuccess: Story = {
  args: {
    label: 'Prominent Select',
    placeholder: 'Please choose',
    value: '1',
    options: defaultOptions,
    prominent: true,
    state: 'success',
    supportingText: 'Success text informs users when an action has been successfully completed.',
    supportingIcon: 'ChkMCirc',
    labelInfoIcon: 'InfoCirc',
  },
};