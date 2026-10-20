import type { Meta, StoryObj } from '@storybook/web-components';
import { getStorybookHelpers } from '@wc-toolkit/storybook-helpers';
import { html } from 'lit';
import { ifDefined } from 'lit/directives/if-defined.js';
import './ibk-fieldset';
import { IbkFieldset } from './ibk-fieldset';

const { events, args, argTypes } = getStorybookHelpers<IbkFieldset>('ibk-fieldset');

const meta: Meta<IbkFieldset> = {
  title: 'Components/Fieldset',
  component: 'ibk-fieldset',
  args: {
    ...args,
    legend: 'Fieldset Legend',
    supportingText: 'Supporting text conveys additional information about the field.',
    disabled: false,
  },
  argTypes: {
    ...argTypes,
    disabled: {
      control: 'boolean',
    },
  },
  parameters: {
    actions: {
      handles: events,
    },
  },
  render: (args) => renderFieldset(args),
};

export default meta;
type Story = StoryObj<IbkFieldset & typeof args>;

const renderFieldset = (args: IbkFieldset) => html`
  <ibk-fieldset
    legend="${ifDefined(args.legend || undefined)}"
    supportingText="${ifDefined(args.supportingText || undefined)}"
    ?disabled="${args.disabled}"
  ></ibk-fieldset>
`;

export const Default: Story = {};

export const Disabled: Story = {
  args: {
    disabled: true,
  },
};
