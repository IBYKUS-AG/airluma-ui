import type { Meta, StoryObj } from "@storybook/web-components";
import { getStorybookHelpers } from "@wc-toolkit/storybook-helpers";
import { html } from "lit";
import "./ibk-banner";
import { IbkBanner } from "./ibk-banner";

const { events, args, argTypes } = getStorybookHelpers<IbkBanner>("ibk-banner");

const meta: Meta<IbkBanner> = {
  title: "Components/Banner",
  component: "ibk-banner",
  args,
  argTypes: {
    ...argTypes,
    variant: {
      control: 'radio',
      options: ['prominent', 'regular', 'none'],
      description: 'The visual variant of the banner',
    },
    title: {
      control: 'text',
      description: 'The headline text',
    },
    content: {
      control: 'text',
      description: 'The body text',
    },
    icon: {
      control: 'text',
      description: 'The icon character (e.g. Cls)',
    }
  },
  parameters: {
    actions: {
      handles: events,
    },
  },
  render: (args) => html`
    <ibk-banner
      title="${args.title}"
      variant="${args.variant}"
      icon="${args.icon}"
      content="${args.content}"
    >
    </ibk-banner>
  `,
};

export default meta;
type Story = StoryObj<IbkBanner & typeof args>;

export const Prominent: Story = {
  args: {
    title: "Headline goes here",
    content: "Text goes here",
    variant: "prominent",
  },
};

export const Regular: Story = {
  args: {
    title: "Headline goes here",
    content: "Text goes here",
    variant: "regular",
  },
};
