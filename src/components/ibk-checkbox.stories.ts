import type { Meta, StoryObj } from '@storybook/web-components';
import { getStorybookHelpers } from '@wc-toolkit/storybook-helpers';
import { html } from 'lit';
import { ifDefined } from 'lit/directives/if-defined.js';
import { action } from '../utils/utils';
import './ibk-checkbox';
import { IbkCheckbox } from './ibk-checkbox';

const { events, args, argTypes } = getStorybookHelpers<IbkCheckbox>('ibk-checkbox');

const meta: Meta<IbkCheckbox> = {
  title: 'Components/Checkbox',
  component: 'ibk-checkbox',
  args,
  argTypes,
  parameters: {
    actions: {
      handles: events,
    },
  },
  render: (args) => renderCheckbox(args),
};

export default meta;
type Story = StoryObj<IbkCheckbox & typeof args>;

const renderCheckbox = (args: IbkCheckbox) => html`
  <ibk-checkbox
    ?checked="${args.checked}"
    ?indeterminate="${args.indeterminate}"
    label="${ifDefined(args.label || undefined)}"
    labelPosition="${ifDefined(args.labelPosition || undefined)}"
    ?disabled="${args.disabled}"
    @change="${args.onchange || action}"
    supportingText="${ifDefined(args.supportingText || undefined)}"
    state="${ifDefined(args.state || undefined)}"
    inputId="${ifDefined(args.inputId || undefined)}"
  ></ibk-checkbox>
`;

export const PrimaryStory: Story = {
  args: {
    checked: true,
    supportingText: 'Supporting Text for more information.',
    label: 'Example Label',
  },
};

export const EmptyStory: Story = {
  args: {},
};

export const ExampleNo1: Story = {
  args: {
    checked: false,
    label: 'Example Label',
    supportingText: 'Supporting Text for more information.',
  },
};

export const ExampleNo2: Story = {
  args: {
    checked: true,
    label: 'Example Label',
    supportingText: 'Supporting Text for more information.',
    state: 'alert',
    disabled: true,
  },
};

export const LeadingLabel: Story = {
  args: {
    checked: true,
    label: 'Leading Label Example',
    labelPosition: 'leading',
  },
};

export const IndeterminateStatus: Story = {
  args: {
    checked: false,
    indeterminate: true,
    label: 'Indeterminate Checkbox',
    supportingText: 'This checkbox is natively in an indeterminate state.',
  },
};


