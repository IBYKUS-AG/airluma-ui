import type { Meta, StoryObj } from '@storybook/web-components';
import { getStorybookHelpers } from '@wc-toolkit/storybook-helpers';
import { html } from 'lit';
import { ifDefined } from 'lit/directives/if-defined.js';
import './ibk-radio';
import { IbkRadioGroup, IbkRadio } from './ibk-radio';
import { action } from '../utils/utils';

const { events, args, argTypes } = getStorybookHelpers<IbkRadioGroup>('ibk-radio-group');

const meta: Meta<IbkRadioGroup> = {
  title: 'Components/Radio',
  component: 'ibk-radio-group',
  args,
  argTypes,
  parameters: {
    actions: {
      handles: events,
    },
  },
  render: (args) => renderRadioGroup(args),
};

export default meta;
type Story = StoryObj<IbkRadioGroup & typeof args>;

const renderRadioGroup = (args: IbkRadioGroup) => html`
  <ibk-radio-group
    name="${ifDefined(args.name || undefined)}"
    supportingText="${ifDefined(args.supportingText || undefined)}"
    state="${ifDefined(args.state || undefined)}"
    labelPosition="${ifDefined(args.labelPosition || undefined)}"
    @change="${args.onchange || action}"
  >
    <ibk-radio label="Option 1" value="1"></ibk-radio>
    <ibk-radio label="Option 2" value="2"></ibk-radio>
    <ibk-radio label="Option 3" value="3" disabled></ibk-radio>
  </ibk-radio-group>
`;

const renderRadio = (args: IbkRadio) => html`
  <ibk-radio
    label="${ifDefined(args.label || undefined)}"
    value="${ifDefined(args.value || undefined)}"
    ?checked="${args.checked}"
    ?disabled="${args.disabled}"
    name="${ifDefined(args.name || undefined)}"
    labelPosition="${ifDefined(args.labelPosition || undefined)}"
  ></ibk-radio>
`;

const defaultArgs: Story['args'] = {
  name: 'radio-group',
  supportingText: 'Select an option',
};

export const Default: Story = {
  args: {
    ...defaultArgs,
  },
};

export const GroupWithAlert: Story = {
  args: {
    ...defaultArgs,
    state: 'alert',
    supportingText: 'Please select an option',
  },
};

export const GroupWithSuccess: Story = {
  args: {
    ...defaultArgs,
    state: 'success',
    supportingText: 'Selection confirmed',
  },
};

export const GroupLeadingLabel: Story = {
  args: {
    ...defaultArgs,
    labelPosition: 'leading',
  },
};

export const SingleRadio: StoryObj<IbkRadio & typeof args> = {
  args: {
    label: 'Single Option',
    value: 'single',
    name: 'single-radio',
  },
  render: (args) => renderRadio(args),
};

export const SingleRadioDisabled: StoryObj<IbkRadio & typeof args> = {
  args: {
    label: 'Disabled Option',
    value: 'disabled',
    disabled: true,
    name: 'disabled-radio',
  },
  render: (args) => renderRadio(args),
};

export const SingleRadioLeadingLabel: StoryObj<IbkRadio & typeof args> = {
  args: {
    label: 'Leading Label',
    value: 'leading',
    name: 'leading-radio',
    labelPosition: 'leading',
  },
  render: (args) => renderRadio(args),
};
