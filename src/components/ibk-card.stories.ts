import type { Meta, StoryObj } from '@storybook/web-components';
import { getStorybookHelpers } from '@wc-toolkit/storybook-helpers';
import { html } from 'lit';
import { ifDefined } from 'lit/directives/if-defined.js';
import type { CardDelta, CardVariant } from '../utils/types';
import './ibk-card';
import { IbkCard } from './ibk-card';

const { events, args, argTypes } = getStorybookHelpers<IbkCard>('ibk-card');

const meta: Meta<IbkCard> = {
  title: 'Components/Card',
  component: 'ibk-card',
  args,
  argTypes,
  parameters: {
    actions: {
      handles: events,
    },
  },
  render: (args) => renderCard(args),
};

export default meta;
type Story = StoryObj<IbkCard & typeof args>;

const VARIANTS: CardVariant[] = ['filled', 'bordered', 'elevated'];
const DELTAS: CardDelta[] = ['0', '2', '6', '10'];

const renderCard = (args: IbkCard) => html`
  <ibk-card
    variant="${ifDefined(args.variant || undefined)}"
    delta="${ifDefined(args.delta || undefined)}"
  >
    <h3>Card Title</h3>
    <p>This is some content inside the card. It adapts to the card styling.</p>
  </ibk-card>
`;

export const Filled: Story = {
  args: {
    variant: 'filled',
    delta: '6',
  },
};

export const Bordered: Story = {
  args: {
    variant: 'bordered',
    delta: '6',
  },
};

export const Elevated: Story = {
  args: {
    variant: 'elevated',
    delta: '6',
  },
};

/**
 * Every combination of variant and surface step. The backdrop is a mid grey so
 * that the white and near-white surfaces stay visible.
 */
export const Matrix: Story = {
  parameters: { controls: { disable: true } },
  render: () => html`
    <div
      style="display: grid; grid-template-columns: repeat(${VARIANTS.length}, 12.5rem); gap: 1.5rem; padding: 1.5rem; background-color: var(--ibk-neutral-grey-50);"
    >
      ${VARIANTS.map((variant) => html`<strong style="text-align: center;">${variant}</strong>`)}
      ${DELTAS.map(
        (delta) => html`
          ${VARIANTS.map(
            (variant) => html`
              <ibk-card variant="${variant}" delta="${delta}" style="height: 12.5rem;">
                Delta-${delta}
              </ibk-card>
            `,
          )}
        `,
      )}
    </div>
  `,
};
