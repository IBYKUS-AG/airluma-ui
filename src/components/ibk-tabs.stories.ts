import type { Meta, StoryObj } from '@storybook/web-components';
import { getStorybookHelpers } from '@wc-toolkit/storybook-helpers';
import { html } from 'lit';
import type { TabItem } from './ibk-tabs';
import './ibk-tabs';
import { IbkTabs } from './ibk-tabs';

const { events, args, argTypes } = getStorybookHelpers<IbkTabs>('ibk-tabs');

// A tab and its section are paired through a shared `id`, which has to stay
// unique in the document. The docs page renders every story at once, so each one
// works off its own prefix.
const itemsFor = (prefix: string, withIcons = true): TabItem[] => [
  { label: 'Tab Text', icon: withIcons ? 'Home' : undefined, id: `${prefix}-1` },
  { label: 'Tab Text', icon: withIcons ? 'Setting' : undefined, id: `${prefix}-2` },
  {
    label: 'Tab Text',
    icon: withIcons ? 'InfoCirc' : undefined,
    id: `${prefix}-3`,
    disabled: true,
  },
];

const renderTabs = (args: IbkTabs, prefix: string) => html`
  <ibk-tabs .items="${args.items}" ?rail="${args.rail}">
    <ibk-tabs-content id="${prefix}-1">Content of the first tab.</ibk-tabs-content>
    <ibk-tabs-content id="${prefix}-2">Content of the second tab.</ibk-tabs-content>
    <ibk-tabs-content id="${prefix}-3">This tab is disabled.</ibk-tabs-content>
  </ibk-tabs>
`;

const meta: Meta<IbkTabs> = {
  title: 'Components/Tabs',
  component: 'ibk-tabs',
  args: {
    ...args,
    items: itemsFor('tabsDefault'),
    rail: false,
  },
  argTypes: {
    ...argTypes,
    // `cem analyze` records `items` as the bare type name `TabItem[]` without a
    // `parsedType`, so the helpers fall back to a plain text control that starts
    // empty and cannot round-trip an array. Force the JSON object editor.
    items: { control: 'object' },
    rail: {
      control: 'boolean',
    },
  },
  parameters: {
    actions: {
      handles: events,
    },
  },
  render: (args) => renderTabs(args, 'tabsDefault'),
};

export default meta;
type Story = StoryObj<IbkTabs & typeof args>;

/**
 * One `ibk-tabs-content` child per tab, carrying the `id` its tab points at. The
 * leading icon is part of the item (`icon`, an IBYKUS-Iconset ligature), so every
 * tab can have its own. Selecting a tab shows its section and hides the others.
 */
export const Default: Story = {
  args: {
    items: itemsFor('tabsDefault'),
  },
};

export const WithoutLeadingIcon: Story = {
  args: {
    items: itemsFor('tabsPlain', false),
  },
  render: (args) => renderTabs(args, 'tabsPlain'),
};

export const WithRail: Story = {
  args: {
    items: itemsFor('tabsRail'),
    rail: true,
  },
  render: (args) => renderTabs(args, 'tabsRail'),
};
