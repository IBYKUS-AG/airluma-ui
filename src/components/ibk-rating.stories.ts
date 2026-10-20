import type { Meta, StoryObj } from '@storybook/web-components';
import { getStorybookHelpers } from '@wc-toolkit/storybook-helpers';
import { html, nothing } from 'lit';
import { classMap } from 'lit/directives/class-map.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import type { RatingVariant } from '../utils/types';
import './ibk-rating';
import { IbkRating } from './ibk-rating';

const { events, args, argTypes } = getStorybookHelpers<IbkRating>('ibk-rating');

type RatingStoryArgs = IbkRating & typeof args;

const meta: Meta<RatingStoryArgs> = {
  title: 'Components/Rating',
  component: 'ibk-rating',
  args: {
    ...args,
    value: 4,
    max: 5,
    variant: 'red',
    allowHalf: false,
    readonly: false,
    disabled: false,
  },
  argTypes: {
    ...argTypes,
    value: {
      control: { type: 'number', min: 0, step: 0.5 },
    },
    max: {
      control: { type: 'number', min: 1 },
    },
    variant: {
      control: 'select',
      options: ['red', 'gold'],
    },
    allowHalf: {
      control: 'boolean',
    },
    readonly: {
      control: 'boolean',
    },
    disabled: {
      control: 'boolean',
    },
    ratingLabel: {
      control: false,
      table: {
        disable: true,
      },
    },
    'rating-label': {
      control: false,
      table: {
        disable: true,
      },
    },
  },
  parameters: {
    actions: {
      handles: events,
    },
  },
  render: (args) => renderRating(args),
};

export default meta;
type Story = StoryObj<RatingStoryArgs>;

const variants: Array<{ label: string; variant: RatingVariant }> = [
  { label: 'Red', variant: 'red' },
  { label: 'Gold', variant: 'gold' },
];
const steps = Array.from({ length: 11 }, (_, index) => index * 0.5);
const fills: Array<{ label: string; fill: 'empty' | 'half' | 'full' }> = [
  { label: 'Empty', fill: 'empty' },
  { label: 'Half', fill: 'half' },
  { label: 'Full', fill: 'full' },
];

const storyStyles = html`
  <style>
    .ratingStoryCanvas {
      color: var(--ibk-neutral-grey-18);
      display: grid;
      gap: var(--ibk-spacing-48, 3rem);
      padding: var(--ibk-spacing-16, 1rem);
    }

    .ratingStorySection {
      display: grid;
      gap: var(--ibk-spacing-24, 1.5rem);
      justify-items: start;
    }

    .ratingStoryTitle {
      font-size: 2rem;
      font-weight: 400;
      line-height: 1.25;
      margin: 0;
    }

    .ratingStoryMatrix {
      align-items: center;
      display: grid;
      gap: var(--ibk-spacing-16, 1rem) var(--ibk-spacing-24, 1.5rem);
      grid-template-columns: 5rem repeat(2, minmax(7rem, auto));
      justify-items: start;
    }

    .ratingStoryHeader {
      font-size: 1rem;
      font-weight: 700;
      line-height: 1.5;
    }

    .ratingStoryRowLabel {
      font-size: 1rem;
      font-weight: 700;
      line-height: 1.5;
    }
  </style>
`;

const renderRating = (args: RatingStoryArgs) => html`
  <ibk-rating
    value="${ifDefined(args.value ?? undefined)}"
    max="${ifDefined(args.max ?? undefined)}"
    variant="${ifDefined(args.variant || undefined)}"
    ?allowHalf=${args.allowHalf}
    ?readonly=${args.readonly}
    ?disabled=${args.disabled}
  ></ibk-rating>
`;

const renderStepSection = () => html`
  <section class="ratingStorySection">
    <h2 class="ratingStoryTitle">Half-star Steps</h2>
    <div class="ratingStoryMatrix">
      <span></span>
      ${variants.map(({ label }) => html`<span class="ratingStoryHeader">${label}</span>`)}
      ${steps.map(
        (step) => html`
          <span class="ratingStoryRowLabel">${step.toFixed(1)}</span>
          ${variants.map(
            ({ variant }) =>
              html`<ibk-rating
                value="${step}"
                variant="${variant}"
                allowHalf
                readonly
              ></ibk-rating>`,
          )}
        `,
      )}
    </div>
  </section>
`;

/**
 * Renders a single star cell straight from the component's CSS classes, so the story can
 * show the pressed colour without driving a real pointer press.
 */
const renderStar = (variant: RatingVariant, fill: 'empty' | 'half' | 'full', pressed: boolean) => {
  const rowClasses = {
    ibkRating: true,
    [`ibkRating-${variant}`]: true,
    'ibkRating-pressed': pressed,
  };
  const fillClasses = {
    ibkIcon: true,
    'ibkRating-starFill': true,
    'ibkRating-starFill-half': fill === 'half',
  };

  return html`
    <span class=${classMap(rowClasses)}>
      <span class="ibkRating-star">
        <i class="ibkIcon" aria-hidden="true">Star</i>
        ${fill === 'empty'
          ? nothing
          : html`<i class=${classMap(fillClasses)} aria-hidden="true"
              >${fill === 'half' ? 'StarFillHalf' : 'StarFill'}</i
            >`}
      </span>
    </span>
  `;
};

const renderItemSection = (label: string, pressed: boolean) => html`
  <section class="ratingStorySection">
    <h2 class="ratingStoryTitle">${label}</h2>
    <div class="ratingStoryMatrix">
      <span></span>
      ${variants.map(
        ({ label: variantLabel }) => html`<span class="ratingStoryHeader">${variantLabel}</span>`,
      )}
      ${fills.map(
        ({ label: fillLabel, fill }) => html`
          <span class="ratingStoryRowLabel">${fillLabel}</span>
          ${variants.map(({ variant }) => renderStar(variant, fill, pressed))}
        `,
      )}
    </div>
  </section>
`;

export const Default: Story = {
  args: {
    value: 4,
    max: 5,
    variant: 'red',
  },
};

export const Gold: Story = {
  args: {
    value: 4,
    max: 5,
    variant: 'gold',
  },
};

export const AllowHalf: Story = {
  name: 'Allow Half',
  args: {
    value: 3.5,
    max: 5,
    variant: 'red',
    allowHalf: true,
  },
};

export const Readonly: Story = {
  args: {
    value: 4,
    max: 5,
    variant: 'red',
    readonly: true,
  },
};

export const Disabled: Story = {
  args: {
    value: 4,
    max: 5,
    variant: 'red',
    disabled: true,
  },
};

export const FigmaStates: Story = {
  name: 'Figma States',
  render: () => html`
    ${storyStyles}
    <div class="ratingStoryCanvas">
      ${renderStepSection()} ${renderItemSection('Star Items — Enabled', false)}
      ${renderItemSection('Star Items — Pressed', true)}
    </div>
  `,
};
