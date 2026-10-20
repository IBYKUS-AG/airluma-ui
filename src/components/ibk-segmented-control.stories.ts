import type { Meta, StoryObj } from '@storybook/web-components';
import { getStorybookHelpers } from '@wc-toolkit/storybook-helpers';
import { html } from 'lit';
import { ifDefined } from 'lit/directives/if-defined.js';
import type { SegmentedControlItem } from '../utils/types';
import { action } from './../utils/utils';
import './ibk-segmented-control';
import { IbkSegmentedControl } from './ibk-segmented-control';

const { events, args, argTypes } =
  getStorybookHelpers<IbkSegmentedControl>('ibk-segmented-control');

// The first segment carries an `icon` so the object control shows the field up
// front — that is the only place an icon can be set.
const defaultItems: SegmentedControlItem[] = [
  { label: 'Segment One', active: true, icon: 'Home' },
  { label: 'Segment Two' },
  { label: 'Segment Three' },
  { label: 'Segment Four' },
  { label: 'Segment Five' },
];

const meta: Meta<IbkSegmentedControl> = {
  title: 'Components/Segmented Control',
  component: 'ibk-segmented-control',
  args: {
    ...args,
    items: defaultItems,
    dominance: 'regular',
    label: 'Segment',
  },
  argTypes: {
    ...argTypes,
    // `cem analyze` records `items` as the bare type name `SegmentedControlItem[]`
    // without a `parsedType`, so the helpers fall back to a plain text control that
    // starts empty and cannot round-trip an array. Force the JSON object editor.
    items: { control: 'object' },
  },
  parameters: {
    actions: {
      handles: events,
    },
    docs: {
      description: {
        component:
          'A pill-shaped row of mutually exclusive segments for switching between a ' +
          'small set of closely related views. Exactly one segment is selected at a ' +
          'time and `dominance` picks its fill: `regular` (petrol) or `prominent` ' +
          '(red). A segment shows a leading icon when its object carries an `icon` ' +
          'ligature, so icons are chosen per segment rather than for the whole group. ' +
          'Every enabled segment is its own tab stop, like a toolbar of toggle ' +
          'buttons, rather than a native radio group where only the checked input ' +
          'is tabbable: Tab cycles through them one at a time, the arrow keys and ' +
          'Home/End do the same while skipping disabled segments, and a click or ' +
          'Enter/Space is what actually selects the focused segment.',
      },
    },
  },
  render: (args) => renderSegmentedControl(args),
};

export default meta;
type Story = StoryObj<IbkSegmentedControl & typeof args>;

const renderSegmentedControl = (args: IbkSegmentedControl) => html`
  <ibk-segmented-control
    dominance="${ifDefined(args.dominance || undefined)}"
    label="${ifDefined(args.label || undefined)}"
    .items="${args.items}"
    ?disabled="${args.disabled}"
    @segment-change="${args['segment-change'] || action}"
  ></ibk-segmented-control>
`;

/** Interactive playground driven by the controls panel. */
export const Playground: Story = {
  args: {
    items: defaultItems,
    dominance: 'regular',
    label: 'Segment',
    disabled: false,
  },
};

/** Default — five segments with the first one selected. */
export const Default: Story = {
  args: {
    items: defaultItems,
  },
};

/**
 * Dominance — `regular` fills the selected segment with petrol, `prominent`
 * with red. Everything else is identical.
 */
export const Dominance: Story = {
  render: () => html`
    <div style="display:flex; flex-direction:column; gap:1.5rem; align-items:flex-start;">
      ${(['regular', 'prominent'] as const).map(
        (dominance) => html`
          <div>
            <p style="margin:0 0 0.5rem; color:#555; font-size:0.75rem; font-weight:600;">
              ${dominance}
            </p>
            <ibk-segmented-control
              dominance=${dominance}
              label="Segment"
              .items=${defaultItems}
              @segment-change=${action}
            ></ibk-segmented-control>
          </div>
        `,
      )}
    </div>
  `,
};

/**
 * Leading icon — each segment picks its own IBYKUS-Iconset ligature through its
 * `icon`. A segment without one, like "Segment Three" here, renders text only.
 */
export const WithLeadingIcon: Story = {
  args: {
    items: [
      { label: 'Segment One', icon: 'Home', active: true },
      { label: 'Segment Two', icon: 'InfoCirc' },
      { label: 'Segment Three' },
    ],
  },
};

/** Disabled segments are skipped by both the pointer and the arrow keys. */
export const DisabledSegment: Story = {
  args: {
    items: [
      { label: 'Segment One', active: true },
      { label: 'Segment Two', disabled: true },
      { label: 'Segment Three' },
    ],
  },
};

/** The whole control can be switched off with the `disabled` attribute. */
export const Disabled: Story = {
  args: {
    items: defaultItems,
    disabled: true,
  },
};

/* -------------------------------------------------------------------------- */
/*  States reference (mirrors the Figma matrix)                               */
/* -------------------------------------------------------------------------- */

/** Rows of the states reference. Middle three are forced visually (see `forceStyles`). */
const STATE_ROWS: { key: string; cls: string; disabled?: boolean }[] = [
  { key: 'enabled', cls: '' },
  { key: 'disabled', cls: '', disabled: true },
  { key: 'hover', cls: 'sb-force-hover' },
  { key: 'pressed', cls: 'sb-force-pressed' },
  { key: 'focus', cls: 'sb-force-focus' },
];

/**
 * Freezes the interactive states so the whole matrix is readable at a glance.
 *
 * The cells are inert (`pointer-events: none`), so a real pointer can never
 * repaint a row with its own `:hover` — what you see is what the class forces.
 * The colours repeat the global `--ibk-*` tokens from `segmented-control.css`
 * because the component exposes no per-state custom properties to read back;
 * this duplication stays inside the story instead of adding demo-only hooks to
 * the shipped CSS.
 */
const forceStyles = html`
  <style>
    /* A static reference matrix — no cell reacts to the pointer. */
    .sb-states .sb-cell {
      display: inline-flex;
      pointer-events: none;
    }

    /* Only the first segment of a cell is the specimen; the second one is there
       so the "unselected" column has something to be unselected against.
       :first-of-type rather than :first-child - the selection thumb is the
       first child of the container. */
    .sb-force-hover .ibkSegmentedControl-segment:first-of-type:not(.selected):not(:disabled) {
      background: var(--ibk-neutral-grey-90);
    }
    .sb-force-pressed .ibkSegmentedControl-segment:first-of-type:not(.selected):not(:disabled) {
      background: var(--ibk-neutral-grey-74);
    }
    /* Same values as the shared ::focus-visible rule in global.css - the
       component itself no longer overrides focus styling at all. */
    .sb-force-focus .ibkSegmentedControl-segment:first-of-type {
      outline: 2px solid var(--ibk-focusstroke);
      outline-offset: 2px;
    }
    .sb-states {
      border-collapse: separate;
      border-spacing: 0.75rem 0.5rem;
    }
    .sb-states th {
      color: #555;
      font-size: 0.75rem;
      font-weight: 600;
    }
    .sb-states .sb-row-label {
      color: #777;
      font-size: 0.8125rem;
      padding-right: 0.5rem;
      text-align: right;
      text-transform: capitalize;
    }
  </style>
`;

/** Columns of the states reference — one per Figma "Style × Dominance" pairing. */
const STATE_COLUMNS: {
  title: string;
  dominance: IbkSegmentedControl['dominance'];
  selected: boolean;
}[] = [
  { title: 'Unselected Segment', dominance: 'regular', selected: false },
  { title: 'Regular Selection', dominance: 'regular', selected: true },
  { title: 'Prominent Selection', dominance: 'prominent', selected: true },
];

/**
 * States reference — the full Figma matrix: every state (enabled / disabled /
 * hover / pressed / focus) for an unselected segment and for both selections.
 * Hover, pressed and focus are normally interactive, so here they are forced
 * visually to show the whole matrix at once.
 *
 * The selected segment has no disabled state in the design and keeps its fill
 * on hover and pressed — only the focus ring is added.
 */
export const States: Story = {
  render: () => html`
    ${forceStyles}
    <table class="sb-states">
      <thead>
        <tr>
          <th></th>
          ${STATE_COLUMNS.map((column) => html`<th>${column.title}</th>`)}
        </tr>
      </thead>
      <tbody>
        ${STATE_ROWS.map(
          (state) => html`
            <tr>
              <td class="sb-row-label">${state.key}</td>
              ${STATE_COLUMNS.map(
                (column) => html`
                  <td>
                    ${column.selected && state.disabled
                      ? html`<span class="sb-row-label">—</span>`
                      : html`
                          <span class="sb-cell ${state.cls}">
                            <ibk-segmented-control
                              dominance=${ifDefined(column.dominance)}
                              label="Segment"
                              .items=${[
                                {
                                  label: 'Segment name',
                                  icon: 'Home',
                                  active: column.selected,
                                  disabled: state.disabled,
                                },
                                { label: 'Other', icon: 'Home', active: !column.selected },
                              ]}
                            ></ibk-segmented-control>
                          </span>
                        `}
                  </td>
                `,
              )}
            </tr>
          `,
        )}
      </tbody>
    </table>
  `,
};
