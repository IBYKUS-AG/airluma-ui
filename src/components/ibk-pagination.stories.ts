import type { Meta, StoryObj } from '@storybook/web-components';
import { getStorybookHelpers } from '@wc-toolkit/storybook-helpers';
import { html } from 'lit';
import { ifDefined } from 'lit/directives/if-defined.js';
import './ibk-pagination';
import { IbkPagination } from './ibk-pagination';
import type { PaginationMode, PaginationVariant } from './ibk-pagination';

const { events, args, argTypes } = getStorybookHelpers<IbkPagination>('ibk-pagination');

type PaginationStoryArgs = IbkPagination & typeof args;

type PaginationScenario = {
  label: string;
  currentPage: number;
  totalPages: number;
};

const meta: Meta<PaginationStoryArgs> = {
  title: 'Components/Pagination',
  component: 'ibk-pagination',
  args: {
    ...args,
    currentPage: 22,
    totalPages: 999,
    mode: 'maximum',
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
    mode: {
      control: { type: 'select' },
      options: ['minimum', 'maximum'],
    },
    variant: {
      control: { type: 'select' },
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
  render: (args) => renderPagination(args),
};

export default meta;
type Story = StoryObj<PaginationStoryArgs>;

const storyStyles = html`
  <style>
    .paginationStoryCanvas {
      color: var(--ibk-neutral-grey-18);
      display: grid;
      gap: var(--ibk-spacing-32, 2rem);
      padding: var(--ibk-spacing-16, 1rem);
    }

    .paginationStorySection {
      display: grid;
      gap: var(--ibk-spacing-16, 1rem);
    }

    .paginationStorySectionHeader {
      display: grid;
      gap: var(--ibk-spacing-4, 0.25rem);
    }

    .paginationStoryTitle {
      font-size: 1rem;
      font-weight: 700;
      line-height: 1.5;
      margin: 0;
    }

    .paginationStoryDescription {
      color: var(--ibk-neutral-grey-42);
      font-size: 0.875rem;
      line-height: 1.25rem;
      margin: 0;
    }

    .paginationStoryMatrix {
      display: grid;
      gap: var(--ibk-spacing-24, 1.5rem);
    }

    .paginationStoryVariant {
      display: grid;
      gap: var(--ibk-spacing-12, 0.75rem);
    }

    .paginationStoryVariantTitle {
      font-size: 0.875rem;
      font-weight: 700;
      line-height: 1.25rem;
    }

    .paginationStoryExamples {
      display: grid;
      gap: var(--ibk-spacing-12, 0.75rem);
    }

    .paginationStoryExample {
      align-items: center;
      display: grid;
      gap: var(--ibk-spacing-16, 1rem);
      grid-template-columns: 6rem minmax(0, 1fr);
    }

    .paginationStoryExampleLabel {
      color: var(--ibk-neutral-grey-42);
      font-size: 0.75rem;
      font-weight: 700;
      line-height: 1rem;
      text-transform: uppercase;
    }

    @media (max-width: 900px) {
      .paginationStoryExample {
        grid-template-columns: 1fr;
      }
    }
  </style>
`;

const minimumScenarios: PaginationScenario[] = [
  { label: 'START', currentPage: 1, totalPages: 99 },
  { label: 'MIDDLE', currentPage: 22, totalPages: 99 },
  { label: 'END', currentPage: 99, totalPages: 99 },
];

const maximumScenarios: PaginationScenario[] = [
  { label: 'START', currentPage: 1, totalPages: 999 },
  { label: 'MIDDLE', currentPage: 22, totalPages: 999 },
  { label: 'END', currentPage: 999, totalPages: 999 },
];

const variants: Array<{ label: string; variant: PaginationVariant }> = [
  { label: 'Prominent', variant: 'prominent' },
  { label: 'Regular', variant: 'regular' },
];

const renderPagination = (args: PaginationStoryArgs) => html`
  <ibk-pagination
    currentPage="${ifDefined(args.currentPage ?? undefined)}"
    totalPages="${ifDefined(args.totalPages ?? undefined)}"
    mode="${ifDefined(args.mode || undefined)}"
    variant="${ifDefined(args.variant || undefined)}"
    ?disabled=${args.disabled}
  ></ibk-pagination>
`;

const renderPaginationExample = (
  mode: PaginationMode,
  variant: PaginationVariant,
  scenario: PaginationScenario,
) => html`
  <div class="paginationStoryExample">
    <span class="paginationStoryExampleLabel">${scenario.label}</span>
    <ibk-pagination
      currentPage="${scenario.currentPage}"
      totalPages="${scenario.totalPages}"
      mode="${mode}"
      variant="${variant}"
    ></ibk-pagination>
  </div>
`;

const renderModeSection = (
  title: string,
  description: string,
  mode: PaginationMode,
  scenarios: PaginationScenario[],
) => html`
  <section class="paginationStorySection">
    <div class="paginationStorySectionHeader">
      <h2 class="paginationStoryTitle">${title}</h2>
      <p class="paginationStoryDescription">${description}</p>
    </div>
    <div class="paginationStoryMatrix">
      ${variants.map(
        ({ label, variant }) => html`
          <div class="paginationStoryVariant">
            <span class="paginationStoryVariantTitle">${label}</span>
            <div class="paginationStoryExamples">
              ${scenarios.map((scenario) => renderPaginationExample(mode, variant, scenario))}
            </div>
          </div>
        `,
      )}
    </div>
  </section>
`;

export const Minimum: Story = {
  args: {
    currentPage: 22,
    totalPages: 99,
    mode: 'minimum',
    variant: 'regular',
  },
};

export const Maximum: Story = {
  args: {
    currentPage: 22,
    totalPages: 999,
    mode: 'maximum',
    variant: 'regular',
  },
};

export const Prominent: Story = {
  args: {
    currentPage: 22,
    totalPages: 999,
    mode: 'maximum',
    variant: 'prominent',
  },
};

export const Disabled: Story = {
  args: {
    currentPage: 22,
    totalPages: 999,
    mode: 'maximum',
    variant: 'regular',
    disabled: true,
  },
};

export const FigmaStates: Story = {
  name: 'Figma States',
  render: () => html`
    ${storyStyles}
    <div class="paginationStoryCanvas">
      ${renderModeSection('Minimum', 'Ohne erste und letzte Seite', 'minimum', minimumScenarios)}
      ${renderModeSection(
        'Maximum',
        'Erste und letzte Seite direkt ansteuerbar',
        'maximum',
        maximumScenarios,
      )}
    </div>
  `,
};

/**
 * The compact 32px size is opt-in as of IDES-58. It used to be driven by
 * `@media (max-width: 480px)`, which asked the wrong question: the same bar can
 * sit under a wide table or inside a 20rem aside, and the viewport width says
 * nothing about which. It is now a container query.
 *
 * Add `.ibk-query-container` to a **block-level ancestor** to opt in. It cannot go
 * on the pagination itself: inline-size containment makes a box compute its width
 * as if it were empty, so any box sized by its own content - and the bar is - would
 * collapse to zero.
 *
 * ```html
 * <div class="ibk-query-container">
 *   <ibk-pagination currentPage="22" totalPages="999" mode="maximum"></ibk-pagination>
 * </div>
 * ```
 *
 * Without the wrapper the buttons stay at 40px and the bar wraps onto a second
 * line, which keeps 320px usable on its own and preserves the larger hit area
 * (WCAG 2.5.8 "Target Size").
 */
export const CompactInTightSpace: Story = {
  name: 'Compact in tight space',
  render: () => html`
    ${storyStyles}
    <div style="display: flex; flex-direction: column; gap: var(--ibk-spacing-24, 1.5rem);">
      <div>
        <p class="paginationStoryExampleLabel">With .ibk-query-container — 20rem, compact</p>
        <div
          class="ibk-query-container"
          style="inline-size: 20rem; border: 1px dashed var(--ibk-neutral-grey-74); padding: 0.75rem;"
        >
          <ibk-pagination currentPage="22" totalPages="999" mode="maximum"></ibk-pagination>
        </div>
      </div>

      <div>
        <p class="paginationStoryExampleLabel">
          Without it — 20rem, full size, wraps onto a second line
        </p>
        <div
          style="inline-size: 20rem; border: 1px dashed var(--ibk-neutral-grey-74); padding: 0.75rem;"
        >
          <ibk-pagination currentPage="22" totalPages="999" mode="maximum"></ibk-pagination>
        </div>
      </div>

      <div>
        <p class="paginationStoryExampleLabel">
          With .ibk-query-container — 48rem, above the 30rem threshold, full size
        </p>
        <div
          class="ibk-query-container"
          style="inline-size: 48rem; max-inline-size: 100%; border: 1px dashed var(--ibk-neutral-grey-74); padding: 0.75rem;"
        >
          <ibk-pagination currentPage="22" totalPages="999" mode="maximum"></ibk-pagination>
        </div>
      </div>
    </div>
  `,
};
