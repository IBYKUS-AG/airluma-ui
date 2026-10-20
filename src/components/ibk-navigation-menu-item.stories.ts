import type { Meta, StoryObj } from '@storybook/web-components';
import { getStorybookHelpers } from '@wc-toolkit/storybook-helpers';
import { html } from 'lit';
import { ifDefined } from 'lit/directives/if-defined.js';
import { action } from '../utils/utils';
import './ibk-navigation-menu-item';
import { IbkNavigationMenuItem } from './ibk-navigation-menu-item';

const { events, args, argTypes } = getStorybookHelpers<IbkNavigationMenuItem>(
  'ibk-navigation-menu-item',
);

const meta: Meta<IbkNavigationMenuItem> = {
  title: 'Components/Navigation Menu Item',
  component: 'ibk-navigation-menu-item',
  args: {
    ...args,
    label: 'Nutzerverwaltung',
    icon: 'Home',
    showTrailingIcon: true,
    shortcut: '',
    variant: 'regular',
    selected: true,
    disabled: false,
    dropdown: false,
  },
  argTypes: {
    ...argTypes,
    variant: {
      control: 'select',
      options: ['regular', 'prominent'],
    },
    selected: {
      control: 'boolean',
    },
    disabled: {
      control: 'boolean',
    },
    showTrailingIcon: {
      control: 'boolean',
    },
    trailingIcon: {
      control: 'text',
      description:
        'Ligature name of the trailing icon. Leave empty for the default chevron `ChevD`.',
    },
    dropdown: {
      control: 'boolean',
    },
  },
  parameters: {
    actions: {
      handles: events,
    },
  },
  render: (args) => renderNavigationMenuItem(args),
};

export default meta;
type Story = StoryObj<IbkNavigationMenuItem & typeof args>;

const renderNavigationMenuItem = (args: IbkNavigationMenuItem) => html`
  <ibk-navigation-menu-item
    label="${ifDefined(args.label || undefined)}"
    icon="${ifDefined(args.icon ?? undefined)}"
    variant="${ifDefined(args.variant || undefined)}"
    .showTrailingIcon="${args.showTrailingIcon}"
    trailingIcon="${ifDefined(args.trailingIcon || undefined)}"
    shortcut="${ifDefined(args.shortcut || undefined)}"
    ?selected="${args.selected}"
    ?disabled="${args.disabled}"
    ?dropdown="${args.dropdown}"
    @click="${args.onclick || action}"
  ></ibk-navigation-menu-item>
`;

const defaultArgs: Story['args'] = {
  label: 'Nutzerverwaltung',
  icon: 'Home',
  showTrailingIcon: true,
};

export const UnselectedRegular: Story = {
  args: {
    ...defaultArgs,
    selected: false,
  },
};

export const UnselectedProminent: Story = {
  args: {
    ...defaultArgs,
    selected: false,
    variant: 'prominent',
  },
};

export const WithoutLeadingIcon: Story = {
  args: {
    ...defaultArgs,
    icon: '',
  },
};

export const ShowTrailingIcon: Story = {
  name: 'showTrailingIcon true',
  args: {
    ...defaultArgs,
    showTrailingIcon: true,
  },
};

export const WithCustomTrailingIcon: Story = {
  name: 'custom trailingIcon',
  args: {
    ...defaultArgs,
    showTrailingIcon: true,
    trailingIcon: 'ChevR',
  },
};

export const ShowTrailingIconFalse: Story = {
  name: 'showTrailingIcon false',
  args: {
    ...defaultArgs,
    showTrailingIcon: false,
  },
  parameters: {
    docs: {
      source: {
        code: `<ibk-navigation-menu-item
  label="Nutzerverwaltung"
  icon="Home"
  variant="regular"
  selected
  .showTrailingIcon=\${false}
></ibk-navigation-menu-item>`,
      },
    },
  },
};

export const SelectedStandaloneRegular: Story = {
  args: {
    ...defaultArgs,
    selected: true,
  },
};

export const SelectedStandaloneProminent: Story = {
  args: {
    ...defaultArgs,
    selected: true,
    variant: 'prominent',
  },
};

export const SelectedDropdownRegular: Story = {
  args: {
    ...defaultArgs,
    selected: true,
    dropdown: true,
  },
};

export const SelectedDropdownProminent: Story = {
  args: {
    ...defaultArgs,
    selected: true,
    variant: 'prominent',
    dropdown: true,
  },
};

export const Disabled: Story = {
  args: {
    ...defaultArgs,
    disabled: true,
  },
};

export const WithShortcut: Story = {
  name: 'with keyboard shortcut (no trailing icon)',
  args: {
    ...defaultArgs,
    label: 'Speichern',
    icon: 'Save',
    showTrailingIcon: false,
    shortcut: 'Strg + S',
    selected: false,
  },
};
