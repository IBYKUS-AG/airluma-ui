import type { Meta, StoryObj } from '@storybook/web-components';
import { getStorybookHelpers } from '@wc-toolkit/storybook-helpers';
import { html } from 'lit';
import { classMap } from 'lit/directives/class-map.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import './ibk-pagination-dots';
import { IbkPaginationDots } from './ibk-pagination-dots';
import type { PaginationDotsSize, PaginationDotsVariant } from './ibk-pagination-dots';

const { events, args, argTypes } = getStorybookHelpers<IbkPaginationDots>('ibk-pagination-dots');

type PaginationDotsStoryArgs = IbkPaginationDots & typeof args;
type PaginationDotsState = 'enabled' | 'hover' | 'pressed' | 'focus';

const meta: Meta<PaginationDotsStoryArgs> = {
  title: 'Components/Pagination Dots',
  component: 'ibk-pagination-dots',
  args: {
    ...args,
    currentPage: 3,
    totalPages: 5,
    size: 'medium',
    variant: 'regular',
    disabled: false,
  },
  argTypes: {
    ...argTypes,
    currentPage: {
      control: { type: 'number', min: 1 },
    },
    totalPages: {
      control: { type: 'number', min: 1 },
    },
    size: {
      control: 'select',
      options: ['small', 'medium', 'large'],
    },
    variant: {
      control: 'select',
      options: ['regular', 'prominent'],
    },
    prominent: {
      control: false,
      table: {
        disable: true,
      },
    },
    disabled: {
      control: 'boolean',
    },
    navigationLabel: {
      control: false,
      table: {
        disable: true,
      },
    },
    'navigation-label': {
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
  render: (args) => renderPaginationDots(args),
};

export default meta;
type Story = StoryObj<PaginationDotsStoryArgs>;

const sizes: PaginationDotsSize[] = ['small', 'medium', 'large'];
const states: Array<{ label: string; state: PaginationDotsState }> = [
  { label: 'Enabled', state: 'enabled' },
  { label: 'Hover', state: 'hover' },
  { label: 'Pressed', state: 'pressed' },
  { label: 'Focus', state: 'focus' },
];
const variants: Array<{ label: string; variant: PaginationDotsVariant }> = [
  { label: 'Prominent States', variant: 'prominent' },
  { label: 'Regular States', variant: 'regular' },
];
const paginationDotsIconNames: Record<PaginationDotsSize, 'Mark12' | 'Mark16' | 'Mark20'> = {
  small: 'Mark12',
  medium: 'Mark16',
  large: 'Mark20',
};

const storyStyles = html`
  <style>
    .paginationDotsStoryCanvas {
      color: var(--ibk-neutral-grey-18);
      display: grid;
      gap: var(--ibk-spacing-48, 3rem);
      padding: var(--ibk-spacing-16, 1rem);
    }

    .paginationDotsStorySection {
      align-items: start;
      display: grid;
      gap: var(--ibk-spacing-24, 1.5rem);
      grid-template-columns: 12rem minmax(0, 1fr);
    }

    .paginationDotsStoryTitle {
      font-size: 2rem;
      font-weight: 400;
      line-height: 1.25;
      margin: 0;
      padding-top: 7rem;
      text-align: right;
    }

    .paginationDotsStoryMatrix {
      align-items: center;
      display: grid;
      gap: var(--ibk-spacing-16, 1rem) var(--ibk-spacing-24, 1.5rem);
      grid-template-columns: 6rem repeat(6, minmax(4.5rem, 1fr));
      justify-items: center;
    }

    .paginationDotsStoryHeader {
      font-size: 1rem;
      font-weight: 700;
      line-height: 1.5;
      text-align: center;
    }

    .paginationDotsStoryHeader.size {
      grid-column: span 2;
    }

    .paginationDotsStoryRowLabel {
      font-size: 1rem;
      font-weight: 700;
      justify-self: start;
      line-height: 1.5;
    }

    .paginationDotsStory-hover:not(.selected) {
      color: var(--ibk-neutral-grey-90);
    }

    .paginationDotsStory-pressed:not(.selected) {
      color: var(--ibk-neutral-grey-74);
    }

    .paginationDotsStory-focus {
      outline: solid var(--ibk-spacing-2, 2px) var(--ibk-focusstroke);
      outline-offset: 0;
    }

    @media (max-width: 900px) {
      .paginationDotsStorySection {
        grid-template-columns: 1fr;
      }

      .paginationDotsStoryTitle {
        padding-top: 0;
        text-align: left;
      }

      .paginationDotsStoryMatrix {
        grid-template-columns: 5rem repeat(6, minmax(3rem, 1fr));
        overflow-x: auto;
      }
    }
  </style>
`;

const renderPaginationDots = (args: PaginationDotsStoryArgs) => html`
  <ibk-pagination-dots
    currentPage="${ifDefined(args.currentPage ?? undefined)}"
    totalPages="${ifDefined(args.totalPages ?? undefined)}"
    size="${ifDefined(args.size || undefined)}"
    variant="${ifDefined(args.variant || undefined)}"
    ?disabled=${args.disabled}
  ></ibk-pagination-dots>
`;

const renderStateDot = (
  variant: PaginationDotsVariant,
  size: PaginationDotsSize,
  selected: boolean,
  state: PaginationDotsState,
) => {
  const dotClasses = {
    single: true,
    selected,
    [`paginationDotsStory-${state}`]: state !== 'enabled',
  };

  return html`
    <span class="ibkPaginationDots ${variant} ${size}">
      <button type="button" class=${classMap(dotClasses)} aria-label="Pagination state">
        <i class="ibkIcon" aria-hidden="true">${paginationDotsIconNames[size]}</i>
      </button>
    </span>
  `;
};

const renderStateSection = (label: string, variant: PaginationDotsVariant) => html`
  <section class="paginationDotsStorySection">
    <h2 class="paginationDotsStoryTitle">${label}</h2>
    <div class="paginationDotsStoryMatrix">
      <span></span>
      ${sizes.map((size) => html`<span class="paginationDotsStoryHeader size">${size}</span>`)}
      <span></span>
      ${sizes.map(
        () => html`
          <span class="paginationDotsStoryHeader">Selected</span>
          <span class="paginationDotsStoryHeader">Unselected</span>
        `,
      )}
      ${states.map(
        ({ label: stateLabel, state }) => html`
          <span class="paginationDotsStoryRowLabel">${stateLabel}</span>
          ${sizes.map(
            (size) => html`
              ${renderStateDot(variant, size, true, state)}
              ${renderStateDot(variant, size, false, state)}
            `,
          )}
        `,
      )}
    </div>
  </section>
`;

export const Default: Story = {
  args: {
    currentPage: 3,
    totalPages: 5,
    size: 'medium',
    variant: 'regular',
  },
};

export const Prominent: Story = {
  args: {
    currentPage: 3,
    totalPages: 5,
    size: 'medium',
    variant: 'prominent',
  },
};

export const Small: Story = {
  args: {
    currentPage: 3,
    totalPages: 5,
    size: 'small',
    variant: 'regular',
  },
};

export const Medium: Story = {
  args: {
    currentPage: 3,
    totalPages: 5,
    size: 'medium',
    variant: 'regular',
  },
};

export const Large: Story = {
  args: {
    currentPage: 3,
    totalPages: 5,
    size: 'large',
    variant: 'regular',
  },
};

export const Disabled: Story = {
  args: {
    currentPage: 3,
    totalPages: 5,
    size: 'medium',
    variant: 'regular',
    disabled: true,
  },
};

export const FigmaStates: Story = {
  name: 'Figma States',
  render: () => html`
    ${storyStyles}
    <div class="paginationDotsStoryCanvas">
      ${variants.map(({ label, variant }) => renderStateSection(label, variant))}
    </div>
  `,
};
