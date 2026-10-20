import type { Meta, StoryObj } from '@storybook/web-components';
import { getStorybookHelpers } from '@wc-toolkit/storybook-helpers';
import { html } from 'lit';
import { ifDefined } from 'lit/directives/if-defined.js';
import { action } from './../utils/utils';
import './ibk-chip';
import { IbkChip } from './ibk-chip';

const { events, args, argTypes } = getStorybookHelpers<IbkChip>('ibk-chip');

const meta: Meta<IbkChip> = {
  title: 'Components/Chip',
  component: 'ibk-chip',
  args,
  argTypes,
  parameters: {
    actions: {
      handles: events,
    },
    docs: {
      description: {
        component:
          'Chips are compact, partly interactive elements used to display or filter attributes. ' +
          'A `passive` chip only shows a value; an `active` chip is removable via its trailing close icon.',
      },
    },
  },
  render: (args) => renderChip(args),
};

export default meta;
type Story = StoryObj<IbkChip & typeof args>;

const renderChip = (args: IbkChip) => html`
  <ibk-chip
    label="${ifDefined(args.label || undefined)}"
    variant="${ifDefined(args.variant || undefined)}"
    status="${ifDefined(args.status || undefined)}"
    type="${ifDefined(args.type || undefined)}"
    @remove="${args.remove || action}"
  ></ibk-chip>
`;

const STYLES: IbkChip['type'][] = ['default', 'info', 'success', 'warning', 'alert'];

const row = (status: IbkChip['status'], variant: IbkChip['variant'], label = 'Schlagwort') => html`
  <div style="display:flex; gap:0.75rem; align-items:center; flex-wrap:wrap;">
    ${STYLES.map(
      (type) => html`
        <ibk-chip
          label=${label}
          status=${ifDefined(status)}
          variant=${ifDefined(variant)}
          type=${ifDefined(type)}
          @remove=${action}
        ></ibk-chip>
      `,
    )}
  </div>
`;

/** Interactive playground driven by the controls panel. */
export const Playground: Story = {
  args: {
    label: 'Schlagwort',
    status: 'active',
    variant: 'regular',
    type: 'default',
  },
};

/**
 * Active (removable) chips. Hover / press / focus each chip to see the
 * interactive states. Order per row: Standard, Info, Success, Warning, Alert.
 */
export const Active: Story = {
  render: () => html`
    <div style="display:flex; flex-direction:column; gap:1.25rem;">
      <div>
        <p style="margin:0 0 0.5rem;"><strong>Regular</strong></p>
        ${row('active', 'regular')}
      </div>
      <div>
        <p style="margin:0 0 0.5rem;"><strong>Decent</strong></p>
        ${row('active', 'decent')}
      </div>
    </div>
  `,
};

/**
 * Passive (non-interactive) chips — display only.
 * Order per row: Standard, Info, Success, Warning, Alert.
 */
export const Passive: Story = {
  render: () => html`
    <div style="display:flex; flex-direction:column; gap:1.25rem;">
      <div>
        <p style="margin:0 0 0.5rem;"><strong>Regular</strong></p>
        ${row('passive', 'regular')}
      </div>
      <div>
        <p style="margin:0 0 0.5rem;"><strong>Decent</strong></p>
        ${row('passive', 'decent')}
      </div>
    </div>
  `,
};

/** Removable chips wired to the `remove` event (see the Actions panel). */
export const Removable: Story = {
  render: () => html`
    <div style="display:flex; gap:0.75rem; align-items:center; flex-wrap:wrap;">
      <ibk-chip label="Filter A" status="active" @remove=${action}></ibk-chip>
      <ibk-chip label="Filter B" status="active" type="info" @remove=${action}></ibk-chip>
      <ibk-chip
        label="Filter C"
        status="active"
        variant="decent"
        type="success"
        @remove=${action}
      ></ibk-chip>
    </div>
  `,
};

/**
 * Live removal: clicking the close icon (or pressing Delete / Backspace while a
 * chip is focused) fires `remove`, and the handler deletes the chip from the DOM.
 * Reload the story to reset the list.
 */
export const RemovableLive: Story = {
  render: () => {
    const labels = ['React', 'Lit', 'Vue', 'Svelte', 'Angular'];
    const onRemove = (e: Event) => {
      action(e);
      // The `remove` event bubbles from the ibk-chip that was closed.
      (e.target as HTMLElement | null)?.remove();
    };
    return html`
      <div style="display:flex; gap:0.75rem; align-items:center; flex-wrap:wrap;" @remove=${onRemove}>
        ${labels.map(
          (label, i) => html`
            <ibk-chip
              label=${label}
              status="active"
              type=${['default', 'info', 'success', 'warning', 'alert'][i]}
            ></ibk-chip>
          `,
        )}
      </div>
      <p style="margin-top:1rem; color:var(--ibk-neutral-grey-42);">
        Click the ✕ on any chip to remove it. Reload the story to reset.
      </p>
    `;
  },
};
