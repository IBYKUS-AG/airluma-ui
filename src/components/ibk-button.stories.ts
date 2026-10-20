import type { Meta, StoryObj } from '@storybook/web-components';
import { getStorybookHelpers } from '@wc-toolkit/storybook-helpers';
import { html } from 'lit';
import { ifDefined } from 'lit/directives/if-defined.js';
import './ibk-button';
import { IbkButton } from './ibk-button';
import { action } from '../utils/utils';

const { events, args, argTypes } = getStorybookHelpers<IbkButton>('ibk-button');

const meta: Meta<IbkButton> = {
  title: 'Components/Button',
  component: 'ibk-button',
  args,
  argTypes,
  parameters: {
    actions: {
      handles: events,
    },
  },
  render: (args) => renderButton(args),
};

export default meta;
type Story = StoryObj<IbkButton & typeof args>;

const renderButton = (args: IbkButton) => html`
  <ibk-button
    label="${ifDefined(args.label || undefined)}"
    type="${ifDefined(args.type || undefined)}"
    htmlType="${ifDefined(args.htmlType || undefined)}"
    variant="${ifDefined(args.variant || undefined)}"
    icon="${ifDefined(args.icon || undefined)}"
    iconPosition="${ifDefined(args.iconPosition || undefined)}"
    ?disabled="${args.disabled}"
    @click="${args.onclick || action}"
  ></ibk-button>
`;

const defaultArgs: Story['args'] = {
  label: 'Button Text',
  icon: 'Home',
};

export const LeadingIconButtonRegularPrimary: Story = {
  args: {
    ...defaultArgs,
  },
};

export const LeadingIconButtonRegularSecondary: Story = {
  args: {
    ...defaultArgs,
    type: 'secondary',
  },
};

export const LeadingIconButtonDecentPrimary: Story = {
  args: {
    ...defaultArgs,
    variant: 'decent',
  },
};

export const LeadingIconButtonDecentSecondary: Story = {
  args: {
    ...defaultArgs,
    type: 'secondary',
    variant: 'decent',
  },
};

export const LeadingIconButtonDestructive: Story = {
  args: {
    ...defaultArgs,
    type: 'destructive',
  },
};

export const LeadingIconButtonSuccess: Story = {
  args: {
    ...defaultArgs,
    type: 'success',
  },
};

export const TrailingIconButtonRegularPrimary: Story = {
  args: {
    ...defaultArgs,
    iconPosition: 'trailing',
  },
};

export const TrailingIconButtonRegularSecondary: Story = {
  args: {
    ...defaultArgs,
    iconPosition: 'trailing',
    type: 'secondary',
  },
};

export const TrailingIconButtonDecentPrimary: Story = {
  args: {
    ...defaultArgs,
    variant: 'decent',
    iconPosition: 'trailing',
  },
};

export const TrailingIconButtonDecentSecondary: Story = {
  args: {
    ...defaultArgs,
    variant: 'decent',
    iconPosition: 'trailing',
    type: 'secondary',
  },
};

export const TrailingIconButtonDestructive: Story = {
  args: {
    ...defaultArgs,
    iconPosition: 'trailing',
    type: 'destructive',
  },
};

export const TrailingIconButtonSuccess: Story = {
  args: {
    ...defaultArgs,
    iconPosition: 'trailing',
    type: 'success',
  },
};

export const OnlyText: Story = {
  args: {
    label: 'Button Text',
    type: 'primary',
    iconPosition: 'text',
  },
};

export const OnlyButton: Story = {
  args: {
    ...defaultArgs,
    iconPosition: 'solo',
    type: 'primary',
  },
};
