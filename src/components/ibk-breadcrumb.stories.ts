import type { Meta, StoryObj } from '@storybook/web-components';
import { getStorybookHelpers } from '@wc-toolkit/storybook-helpers';
import { html } from 'lit';
import { ifDefined } from 'lit/directives/if-defined.js';
import type { BreadcrumbItem } from '../utils/types';
import './ibk-breadcrumb';
import { IbkBreadcrumb } from './ibk-breadcrumb';

const { events, args, argTypes } = getStorybookHelpers<IbkBreadcrumb>('ibk-breadcrumb');

const meta: Meta<IbkBreadcrumb> = {
  title: 'Components/Breadcrumb',
  component: 'ibk-breadcrumb',
  args,
  argTypes: {
    ...argTypes,
    variant: {
      control: 'select',
      options: ['regular', 'decent'],
    },
  },
  parameters: {
    actions: {
      handles: events,
    },
  },
  render: (args) => renderBreadcrumb(args),
};

export default meta;
type Story = StoryObj<IbkBreadcrumb & typeof args>;

const renderBreadcrumb = (args: IbkBreadcrumb) => html`
  <ibk-breadcrumb
    .items="${args.items}"
    variant="${ifDefined(args.variant || undefined)}"
  ></ibk-breadcrumb>
`;

const buildItems = (levels: number): BreadcrumbItem[] => {
  const labels = [
    'First Level',
    'Second Level',
    'Third Level',
    'Fourth Level',
    'Fifth Level',
    'Sixth Level',
  ];
  const items: BreadcrumbItem[] = labels
    .slice(0, levels - 1)
    .map((label, i) => ({ label, href: `#level-${i + 1}` }));
  items.push({ label: 'Current Level' });
  return items;
};

export const Single: Story = {
  args: {
    items: [{ label: 'First Level', href: '#level-1' }],
  },
};

export const ThreeLevel: Story = {
  args: { items: buildItems(3) },
};

export const FourLevel: Story = {
  args: { items: buildItems(4) },
};

export const FiveLevel: Story = {
  args: { items: buildItems(5) },
};

export const SixLevel: Story = {
  args: { items: buildItems(6) },
};

export const SevenLevel: Story = {
  args: { items: buildItems(7) },
};

export const SingleDecent: Story = {
  args: {
    variant: 'decent',
    items: [{ label: 'First Level', href: '#level-1' }],
  },
};

export const ThreeLevelDecent: Story = {
  args: { variant: 'decent', items: buildItems(3) },
};

export const FourLevelDecent: Story = {
  args: { variant: 'decent', items: buildItems(4) },
};

export const FiveLevelDecent: Story = {
  args: { variant: 'decent', items: buildItems(5) },
};

export const SixLevelDecent: Story = {
  args: { variant: 'decent', items: buildItems(6) },
};

export const SevenLevelDecent: Story = {
  args: { variant: 'decent', items: buildItems(7) },
};
