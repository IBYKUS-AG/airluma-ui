import type { Meta, StoryObj } from '@storybook/web-components';
import { getStorybookHelpers } from '@wc-toolkit/storybook-helpers';
import { html } from 'lit';
import { ifDefined } from 'lit/directives/if-defined.js';
import './ibk-tooltip';
import { IbkTooltip } from './ibk-tooltip';

const { events, args, argTypes } = getStorybookHelpers<IbkTooltip>('ibk-tooltip');

const meta: Meta<IbkTooltip> = {
  title: 'Components/Tooltip',
  component: 'ibk-tooltip',
  args: {
    ...args,
    label: 'Tooltip text with some words on several lines.',
    type: 'tooltip',
    open: true,
  },
  argTypes: {
    ...argTypes,
    label: { control: 'text' },
    type: { control: 'select', options: ['tooltip', 'toggletip'] },
    open: { control: 'boolean' },
  },
  parameters: {
    actions: { handles: events },
  },
  render: (args) => renderTooltip(args),
};

export default meta;
type Story = StoryObj<IbkTooltip & typeof args>;

const renderTooltip = (args: IbkTooltip) => html`
  <ibk-tooltip
    label="${ifDefined(args.label || undefined)}"
    type="${args.type}"
    ?open=${args.open}
  ></ibk-tooltip>
`;

export const Tooltip: Story = {
  args: {
    label: 'Tooltip text with some words on several lines.',
    type: 'tooltip',
    open: true,
  },
};

export const Toggletip: Story = {
  args: {
    label: 'Tooltip text with some words on several lines.',
    type: 'toggletip',
    open: true,
  },
};

export const ShortText: Story = {
  args: {
    label: 'Short tooltip',
    type: 'toggletip',
    open: true,
  },
};
