import type { Meta, StoryObj } from '@storybook/web-components';
import { getStorybookHelpers } from '@wc-toolkit/storybook-helpers';
import { html } from 'lit';
import { ifDefined } from 'lit/directives/if-defined.js';
import { action } from '../utils/utils';
import './ibk-link';
import { IbkLink } from './ibk-link';

const { events, args, argTypes } = getStorybookHelpers<IbkLink>('ibk-link');

const meta: Meta<IbkLink> = {
  title: 'Components/Link',
  component: 'ibk-link',
  args: {
    ...args,
    variant: 'regular',
    disabled: false,
  },
  argTypes: {
    ...argTypes,
    variant: {
      control: 'select',
      options: ['regular', 'decent'],
    },
    disabled: {
      control: 'boolean',
    },
  },
  parameters: {
    actions: {
      handles: events,
    },
  },
  render: (args) => renderLink(args),
};

export default meta;
type Story = StoryObj<IbkLink & typeof args>;

const renderLink = (args: IbkLink) => html`
  <ibk-link
    href="${ifDefined(args.href || undefined)}"
    target="${ifDefined(args.target || undefined)}"
    label="${ifDefined(args.label || undefined)}"
    variant="${ifDefined(args.variant || undefined)}"
    ?disabled="${args.disabled}"
    @click="${args.onclick || action}"
  ></ibk-link>
`;

export const Regular: Story = {
  args: {
    label: 'Hyperlink',
    href: '#regular-link',
    variant: 'regular',
  },
};

export const Decent: Story = {
  args: {
    label: 'Hyperlink',
    href: '#decent-link',
    variant: 'decent',
  },
};

export const RegularExternal: Story = {
  args: {
    label: 'Hyperlink',
    href: 'https://example.com',
    target: '_blank',
    variant: 'regular',
  },
};

export const DecentExternal: Story = {
  args: {
    label: 'Hyperlink',
    href: 'https://example.com',
    target: '_blank',
    variant: 'decent',
  },
};

export const Disabled: Story = {
  args: {
    label: 'Hyperlink',
    href: '#disabled-link',
    disabled: true,
    variant: 'regular',
  },
};

export const DisabledDecent: Story = {
  args: {
    label: 'Hyperlink',
    href: '#disabled-decent-link',
    disabled: true,
    variant: 'decent',
  },
};