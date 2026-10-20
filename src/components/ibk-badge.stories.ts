import type { Meta, StoryObj } from '@storybook/web-components';
import { getStorybookHelpers } from '@wc-toolkit/storybook-helpers';
import { html, nothing } from 'lit';
import { ifDefined } from 'lit/directives/if-defined.js';
import './ibk-badge';
import { IbkBadge } from './ibk-badge';

const { events, args, argTypes } = getStorybookHelpers<IbkBadge>('ibk-badge');

type BadgeStoryArgs = IbkBadge &
  typeof args & {
    icon?: string;
    iconSize?: string;
  };

const meta: Meta<BadgeStoryArgs> = {
  title: 'Components/Badge',
  component: 'ibk-badge',
  args: {
    ...args,
    variant: 'regular',
    type: 'regular',
    icon: 'Mail',
    iconSize: '2rem',
  },
  argTypes: {
    ...argTypes,
    variant: {
      control: 'select',
      options: ['decent', 'regular'],
    },
    type: {
      control: 'select',
      options: ['regular', 'info', 'success', 'warning', 'alert'],
    },
    count: {
      control: 'text',
    },
    icon: {
      control: 'text',
    },
    iconSize: {
      control: 'text',
    },
  },
  parameters: {
    actions: {
      handles: events,
    },
  },
  render: (args) => renderBadge(args),
};

export default meta;
type Story = StoryObj<BadgeStoryArgs>;

const storyStyles = html`
  <style>
    .badgeStoryIcon {
      color: var(--ibk-neutral-grey-18);
    }

    .badgeStoryOverview {
      align-items: center;
      display: flex;
      flex-wrap: wrap;
      gap: 2rem;
      padding: 1rem;
    }

    .badgeStorySizeExamples {
      align-items: center;
      display: flex;
      flex-wrap: wrap;
      gap: 2rem;
      padding: 1rem;
    }
  </style>
`;

const renderStoryIcon = (icon?: string, iconSize = '2rem') =>
  icon
    ? html` <i class="ibkIcon badgeStoryIcon" style="font-size: ${iconSize};">${icon}</i> `
    : nothing;

const renderBadge = (args: BadgeStoryArgs) => {
  const count = args.count === undefined || args.count === '' ? undefined : args.count;

  return html`
    ${storyStyles}
    <ibk-badge
      variant=${ifDefined(args.variant || undefined)}
      type=${ifDefined(args.type || undefined)}
      count=${ifDefined(count)}
    >
      ${renderStoryIcon(args.icon, args.iconSize)}
    </ibk-badge>
  `;
};

const sourceCode = {
  decent: `<ibk-badge variant="decent" type="regular">
  <i class="ibkIcon" style="font-size: 1rem;">Mail</i>
</ibk-badge>`,
  regular: `<ibk-badge variant="regular" type="regular">
  <i class="ibkIcon" style="font-size: 2rem;">Mail</i>
</ibk-badge>`,
  styles: `<ibk-badge variant="regular" type="regular">
  <i class="ibkIcon" style="font-size: 2rem;">Mail</i>
</ibk-badge>
<ibk-badge variant="regular" type="info">
  <i class="ibkIcon" style="font-size: 2rem;">Mail</i>
</ibk-badge>
<ibk-badge variant="regular" type="success">
  <i class="ibkIcon" style="font-size: 2rem;">Mail</i>
</ibk-badge>
<ibk-badge variant="regular" type="warning">
  <i class="ibkIcon" style="font-size: 2rem;">Mail</i>
</ibk-badge>
<ibk-badge variant="regular" type="alert">
  <i class="ibkIcon" style="font-size: 2rem;">Mail</i>
</ibk-badge>`,
  iconSizes: `<ibk-badge variant="decent" type="regular">
  <i class="ibkIcon" style="font-size: 12px;">Mail</i>
</ibk-badge>
<ibk-badge variant="decent" type="regular">
  <i class="ibkIcon" style="font-size: 17px;">Mail</i>
</ibk-badge>
<ibk-badge variant="regular" type="regular">
  <i class="ibkIcon" style="font-size: 25px;">Mail</i>
</ibk-badge>`,
  count: `<ibk-badge variant="regular" type="regular" count="42">
  <i class="ibkIcon" style="font-size: 2rem;">Mail</i>
</ibk-badge>`,
  countOverflow: `<ibk-badge variant="regular" type="regular" count="120">
  <i class="ibkIcon" style="font-size: 2rem;">Mail</i>
</ibk-badge>`,
  empty: `<ibk-badge variant="regular" type="regular"></ibk-badge>`,
};

const sourceParameters = (code: string) => ({
  docs: {
    source: {
      code,
      language: 'html',
      type: 'code',
    },
  },
});

const renderSourceCode = (args: BadgeStoryArgs) => {
  const attributes = [
    args.variant ? `variant="${args.variant}"` : '',
    args.type ? `type="${args.type}"` : '',
    args.count ? `count="${args.count}"` : '',
  ].filter(Boolean);
  const attributesSource = attributes.length ? ` ${attributes.join(' ')}` : '';

  if (!args.icon) {
    return `<ibk-badge${attributesSource}></ibk-badge>`;
  }

  return `<ibk-badge${attributesSource}>
  <i class="ibkIcon" style="font-size: ${args.iconSize || '2rem'};">${args.icon}</i>
</ibk-badge>`;
};

const dynamicSourceParameters = () => ({
  docs: {
    source: {
      language: 'html',
      type: 'dynamic',
      transform: (_source: string, context: { args: BadgeStoryArgs }) =>
        renderSourceCode(context.args),
    },
  },
});

export const Decent: Story = {
  args: {
    variant: 'decent',
    type: 'regular',
    icon: 'Mail',
    iconSize: '1rem',
  },
  parameters: dynamicSourceParameters(),
};

export const Regular: Story = {
  args: {
    variant: 'regular',
    type: 'regular',
    icon: 'Mail',
    iconSize: '2rem',
  },
  parameters: dynamicSourceParameters(),
};

export const Styles: Story = {
  render: () => html`
    ${storyStyles}
    <div class="badgeStoryOverview">
      <ibk-badge variant="regular" type="regular"> ${renderStoryIcon('Mail', '2rem')} </ibk-badge>
      <ibk-badge variant="regular" type="info"> ${renderStoryIcon('Mail', '2rem')} </ibk-badge>
      <ibk-badge variant="regular" type="success"> ${renderStoryIcon('Mail', '2rem')} </ibk-badge>
      <ibk-badge variant="regular" type="warning"> ${renderStoryIcon('Mail', '2rem')} </ibk-badge>
      <ibk-badge variant="regular" type="alert"> ${renderStoryIcon('Mail', '2rem')} </ibk-badge>
    </div>
  `,
  parameters: sourceParameters(sourceCode.styles),
};

export const IconSizes: Story = {
  render: () => html`
    ${storyStyles}
    <div class="badgeStorySizeExamples">
      <ibk-badge variant="decent" type="regular">
        <i class="ibkIcon badgeStoryIcon" style="font-size: 12px;">Mail</i>
      </ibk-badge>
      <ibk-badge variant="decent" type="regular">
        <i class="ibkIcon badgeStoryIcon" style="font-size: 17px;">Mail</i>
      </ibk-badge>
      <ibk-badge variant="regular" type="regular">
        <i class="ibkIcon badgeStoryIcon" style="font-size: 25px;">Mail</i>
      </ibk-badge>
    </div>
  `,
  parameters: sourceParameters(sourceCode.iconSizes),
};

export const BadgeWithCounter: Story = {
  name: 'Badge with Counter',
  args: {
    variant: 'regular',
    type: 'regular',
    count: '42',
    icon: 'Mail',
    iconSize: '2rem',
  },
  parameters: dynamicSourceParameters(),
};

export const CounterOverflow: Story = {
  args: {
    variant: 'regular',
    type: 'regular',
    count: '120',
    icon: 'Mail',
    iconSize: '2rem',
  },
  parameters: dynamicSourceParameters(),
};

export const Empty: Story = {
  args: {
    variant: 'regular',
    type: 'regular',
    icon: undefined,
  },
  parameters: dynamicSourceParameters(),
};
