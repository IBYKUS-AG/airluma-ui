import type { Meta, StoryObj } from '@storybook/web-components';
import { getStorybookHelpers } from '@wc-toolkit/storybook-helpers';
import { html } from 'lit';
import { ifDefined } from 'lit/directives/if-defined.js';
import type { BottomNavigationItem } from '../utils/types';
import { action } from './../utils/utils';
import './ibk-bottom-navigation';
import { IbkBottomNavigation } from './ibk-bottom-navigation';

const { events, args, argTypes } =
  getStorybookHelpers<IbkBottomNavigation>('ibk-bottom-navigation');

// Every item carries an `icon` so the object control shows the field up front.
const defaultItems: BottomNavigationItem[] = [
  { label: 'Startseite', icon: 'Home', active: true },
  { label: 'Suche', icon: 'Search' },
  { label: 'Favoriten', icon: 'Fav' },
  { label: 'Einstellungen', icon: 'Setting' },
];

/** The four destinations the Figma bar is drawn with. */
const figmaItems: BottomNavigationItem[] = [
  { label: 'Eingabe', icon: 'Scan', active: true },
  { label: 'Verarbeitung', icon: 'Chip' },
  { label: 'Ausgabe', icon: 'Printer', disabled: true },
  { label: 'Speicherung', icon: 'HybStor' },
];

const meta: Meta<IbkBottomNavigation> = {
  title: 'Components/Bottom Navigation',
  component: 'ibk-bottom-navigation',
  args: {
    ...args,
    items: defaultItems,
    variant: 'regular',
    dominance: 'regular',
    label: 'Hauptnavigation',
  },
  argTypes: {
    ...argTypes,
    // `cem analyze` records `items` as the bare type name `BottomNavigationItem[]`
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
          'A bar of primary destinations pinned to the bottom of a view, each one an ' +
          'icon stacked over its label. Exactly one item is the current destination ' +
          'and carries the selected fill; `dominance` picks that fill: `regular` ' +
          '(petrol) or `prominent` (red). `variant` picks the size of the bar: ' +
          '`regular` (120x66 items, 8px gap) for a roomier bar and `decent` ' +
          '(84x52 items, 4px gap) for a compact one. The bar draws no background of ' +
          'its own, so it takes on whatever surface it is placed on. Activating an ' +
          'item fires `navigation-change` with `{ index, item }`; the bar never ' +
          'navigates on its own.',
      },
    },
  },
  render: (args) => renderBottomNavigation(args),
};

export default meta;
type Story = StoryObj<IbkBottomNavigation & typeof args>;

const renderBottomNavigation = (args: IbkBottomNavigation) => html`
  <ibk-bottom-navigation
    variant="${ifDefined(args.variant || undefined)}"
    dominance="${ifDefined(args.dominance || undefined)}"
    label="${ifDefined(args.label || undefined)}"
    .items="${args.items}"
    ?disabled="${args.disabled}"
    @navigation-change="${args['navigation-change'] || action}"
  ></ibk-bottom-navigation>
`;

/**
 * Default — four destinations with the first one current, driven by the controls
 * panel.
 */
export const Default: Story = {
  args: {
    items: defaultItems,
    variant: 'regular',
    dominance: 'regular',
    label: 'Hauptnavigation',
    disabled: false,
  },
};

/**
 * Variant — `regular` sizes the items 120x66 with an 8px gap, `decent` 84x52 with
 * a 4px gap and the smaller support type. Nothing else changes between the two.
 */
export const Variant: Story = {
  render: () => html`
    <div style="display:flex; flex-direction:column; gap:1.5rem; align-items:flex-start;">
      ${(['regular', 'decent'] as const).map(
        (variant) => html`
          <div>
            <p style="margin:0 0 0.5rem; color:#555; font-size:0.75rem; font-weight:600;">
              ${variant}
            </p>
            <ibk-bottom-navigation
              variant=${variant}
              label="Hauptnavigation"
              .items=${defaultItems}
              @navigation-change=${action}
            ></ibk-bottom-navigation>
          </div>
        `,
      )}
    </div>
  `,
};

/**
 * Dominance — `regular` fills the current item with petrol, `prominent` with red.
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
            <ibk-bottom-navigation
              dominance=${dominance}
              label="Hauptnavigation"
              .items=${defaultItems}
              @navigation-change=${action}
            ></ibk-bottom-navigation>
          </div>
        `,
      )}
    </div>
  `,
};

/**
 * The Figma bar — the four destinations the design is drawn with, "Ausgabe"
 * disabled. Disabled items are skipped by both the pointer and the arrow keys.
 */
export const DisabledItem: Story = {
  args: {
    items: figmaItems,
  },
};

/** The whole bar can be switched off with the `disabled` attribute. */
export const Disabled: Story = {
  args: {
    items: defaultItems,
    disabled: true,
  },
};

/**
 * Icon only — an item without a `label` drops the caption. Its `title` then
 * carries the accessible name, because the icon alone has nothing to read out.
 */
export const IconOnly: Story = {
  args: {
    variant: 'decent',
    items: [
      { icon: 'Home', title: 'Startseite', active: true },
      { icon: 'Search', title: 'Suche' },
      { icon: 'Fav', title: 'Favoriten' },
      { icon: 'Setting', title: 'Einstellungen' },
    ],
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
 * The colours repeat the global `--ibk-*` tokens from `bottom-navigation.css`
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

    /* Only the first item of a cell is the specimen; the second one is there so
       the "unselected" column has something to be unselected against. */
    .sb-force-hover
      .ibkBottomNavigation-listItem:first-child
      .ibkBottomNavigation-item:not(.selected):not(:disabled) {
      background: var(--ibk-neutral-grey-90);
    }
    .sb-force-pressed
      .ibkBottomNavigation-listItem:first-child
      .ibkBottomNavigation-item:not(.selected):not(:disabled) {
      background: var(--ibk-neutral-grey-74);
    }
    /* Same values as the component's own :focus-visible rule - drawn inside the
       item, see the accessibility notes above. */
    .sb-force-focus .ibkBottomNavigation-listItem:first-child .ibkBottomNavigation-item {
      outline: solid 2px var(--ibk-focusstroke);
      outline-offset: -2px;
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

/** Columns of the states reference — one per Figma "Type × Dominance" pairing. */
const STATE_COLUMNS: {
  title: string;
  variant: IbkBottomNavigation['variant'];
  dominance: IbkBottomNavigation['dominance'];
  selected: boolean;
}[] = [
  { title: 'Unselected', variant: 'regular', dominance: 'regular', selected: false },
  { title: 'Regular Selection', variant: 'regular', dominance: 'regular', selected: true },
  { title: 'Prominent Selection', variant: 'regular', dominance: 'prominent', selected: true },
  { title: 'Decent Unselected', variant: 'decent', dominance: 'regular', selected: false },
  { title: 'Decent Selection', variant: 'decent', dominance: 'regular', selected: true },
];

/**
 * States reference — the full Figma matrix: every state (enabled / disabled /
 * hover / pressed / focus) for an unselected item and for both selections, in
 * both bar variants. Hover, pressed and focus are normally interactive, so here
 * they are forced visually to show the whole matrix at once.
 *
 * The current item has no disabled state in the design and keeps its fill on
 * hover and pressed — only the focus ring is added.
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
                            <ibk-bottom-navigation
                              variant=${ifDefined(column.variant)}
                              dominance=${ifDefined(column.dominance)}
                              label="Hauptnavigation"
                              .items=${[
                                {
                                  label: 'Startseite',
                                  icon: 'Home',
                                  active: column.selected,
                                  disabled: state.disabled,
                                },
                                { label: 'Suche', icon: 'Search', active: !column.selected },
                              ]}
                            ></ibk-bottom-navigation>
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
