import type { Meta, StoryObj } from '@storybook/web-components';
import { getStorybookHelpers } from '@wc-toolkit/storybook-helpers';
import { html, nothing } from 'lit';
import { ifDefined } from 'lit/directives/if-defined.js';
import type { TopNavigationItem } from '../utils/types';
import { action } from './../utils/utils';
import './ibk-top-navigation';
import { IbkTopNavigation } from './ibk-top-navigation';

const { events, args, argTypes } = getStorybookHelpers<IbkTopNavigation>('ibk-top-navigation');

/** The four destinations the Figma bar is drawn with. */
const defaultItems: TopNavigationItem[] = [
  { label: 'Start', href: '#start', active: true },
  { label: 'Info', href: '#info' },
  { label: 'Themen', href: '#themen' },
  { label: 'Kontakt', href: '#kontakt' },
];

const meta: Meta<IbkTopNavigation> = {
  title: 'Components/Top Navigation',
  component: 'ibk-top-navigation',
  args: {
    ...args,
    items: defaultItems,
    label: 'Hauptnavigation',
  },
  argTypes: {
    ...argTypes,
    // `cem analyze` records `items` as the bare type name `TopNavigationItem[]`
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
          'A horizontal bar of text-only links to an application top-level ' +
          'destinations. Exactly one item is the current destination and carries the ' +
          'accent colour plus an underline indicator; hover and pressed underline the ' +
          'label as well, and focus draws the shared blue ring. Only for top level ' +
          'navigation and only without eIB decorations - the underline indicator ' +
          'occupies exactly the space an eIB decoration would need, so the two cannot ' +
          'be combined, and items therefore carry no icons at all. The bar draws no ' +
          'background of its own, so it takes on whatever surface it is placed on. ' +
          'An item with an `href` renders as a link, one without as a button; either ' +
          'way activating it fires `navigation-change` with `{ index, item }`.',
      },
    },
  },
  render: (args) => renderTopNavigation(args),
};

export default meta;
type Story = StoryObj<IbkTopNavigation & typeof args>;

const renderTopNavigation = (args: IbkTopNavigation) => html`
  <ibk-top-navigation
    label="${ifDefined(args.label || undefined)}"
    .items="${args.items}"
    ?disabled="${args.disabled}"
    @navigation-change="${args['navigation-change'] || action}"
  ></ibk-top-navigation>
`;

/**
 * Default — the four destinations of the Figma bar with "Start" current, driven by
 * the controls panel.
 */
export const Default: Story = {
  args: {
    items: defaultItems,
    label: 'Hauptnavigation',
    disabled: false,
  },
};

/**
 * A disabled destination — "Themen" is switched off. Disabled items are skipped by
 * both the pointer and the arrow keys, and render as an inert button rather than a
 * link so they cannot be navigated to by any means.
 */
export const DisabledItem: Story = {
  args: {
    items: [
      { label: 'Start', href: '#start', active: true },
      { label: 'Info', href: '#info' },
      { label: 'Themen', href: '#themen', disabled: true },
      { label: 'Kontakt', href: '#kontakt' },
    ],
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
 * Without `href` — items render as buttons and only report the pick through
 * `navigation-change`, for apps that route on their own.
 */
export const WithoutLinks: Story = {
  args: {
    items: [
      { label: 'Start', active: true },
      { label: 'Info' },
      { label: 'Themen' },
      { label: 'Kontakt' },
    ],
  },
};

/* -------------------------------------------------------------------------- */
/*  States reference (mirrors the Figma matrix)                               */
/* -------------------------------------------------------------------------- */

/**
 * Rows of the states reference. Hover, pressed and focus are forced visually (see
 * `forceStyles`). `inSelected` says whether the design draws this state for the
 * current destination at all: the Figma set has no Selected/Disabled and no
 * Selected/Pressed variant, so those two cells stay empty here as well.
 */
const STATE_ROWS: { key: string; cls: string; disabled?: boolean; inSelected: boolean }[] = [
  { key: 'enabled', cls: '', inSelected: true },
  { key: 'disabled', cls: '', disabled: true, inSelected: false },
  { key: 'hover', cls: 'sb-force-hover', inSelected: true },
  { key: 'pressed', cls: 'sb-force-pressed', inSelected: false },
  { key: 'focus', cls: 'sb-force-focus', inSelected: true },
];

/**
 * Freezes the interactive states so the whole matrix is readable at a glance.
 *
 * The cells are inert (`pointer-events: none`), so a real pointer can never
 * repaint a row with its own `:hover` — what you see is what the class forces.
 * The colours repeat the global `--ibk-*` tokens from `top-navigation.css`
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

    /* The padding is bar-level, not item-level; drop it so the cells line up. */
    .sb-states .ibkTopNavigation-list {
      padding: 0;
    }

    .sb-force-hover .ibkTopNavigation .ibkTopNavigation-item:not(.selected) {
      color: var(--ibk-neutral-grey-26);
    }
    .sb-force-pressed .ibkTopNavigation .ibkTopNavigation-item:not(.selected) {
      color: var(--ibk-neutral-grey-2);
    }
    /* Hover and pressed underline across the full label width, selected or not. The
       selector repeats the whole chain of the component's own .selected rule and
       adds the force class on top, so it outweighs the 20px indicator width. */
    .sb-cell.sb-force-hover .ibkTopNavigation .ibkTopNavigation-item .ibkTopNavigation-indicator,
    .sb-cell.sb-force-pressed .ibkTopNavigation .ibkTopNavigation-item .ibkTopNavigation-indicator {
      background: currentColor;
      width: 100%;
    }
    /* Same values as the shared :focus-visible rule in global.css. */
    .sb-force-focus .ibkTopNavigation-item {
      outline: solid 2px var(--ibk-focusstroke);
      outline-offset: 2px;
    }
    .sb-states {
      border-collapse: separate;
      border-spacing: 1.5rem 0.75rem;
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

/** Columns of the states reference — the Figma "Type" axis. */
const STATE_COLUMNS: { title: string; selected: boolean }[] = [
  { title: 'Unselected', selected: false },
  { title: 'Selected', selected: true },
];

/**
 * States reference — the Figma matrix cell for cell: every state (enabled /
 * disabled / hover / pressed / focus) for an unselected item, and only the three
 * the design draws for the current destination. Selected/Disabled and
 * Selected/Pressed have no variant in the Figma set, so those cells are empty.
 * Hover, pressed and focus are normally interactive, so here they are forced
 * visually to show the whole matrix at once.
 *
 * The current destination keeps its accent colour throughout; on hover its short
 * 20px indicator grows to the full label width, the same underline an unselected
 * item gets.
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
                    ${column.selected && !state.inSelected
                      ? nothing
                      : html`
                          <span class="sb-cell ${state.cls}">
                            <ibk-top-navigation
                              label="Hauptnavigation"
                              .items=${[
                                {
                                  label: 'Text',
                                  active: column.selected,
                                  disabled: state.disabled,
                                },
                              ]}
                            ></ibk-top-navigation>
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

/**
 * Keyboard operation and accessibility.
 *
 * - The bar is a `nav` landmark holding a real list, so screen readers announce
 *   it as navigation and read the item count and position from it.
 * - Give every bar a `label` (e.g. "Hauptnavigation") when a page carries more
 *   than one landmark, otherwise they cannot be told apart.
 * - **Tab / Shift+Tab** reach every enabled item: each one is its own tab stop,
 *   regardless of which item is current.
 * - **Arrow Left / Right** (and Up / Down) move focus along the bar as a
 *   shortcut, skipping disabled items and wrapping around at both ends. Moving
 *   focus does not change the current destination.
 * - **Home / End** jump to the first / last enabled item.
 * - **Enter** activates the focused item, **Space** additionally on the button
 *   form.
 * - The current destination carries `aria-current="page"`, so it is announced
 *   and not conveyed by colour and underline alone.
 * - Focus is shown with the shared 2px blue ring from `global.css`; it is never
 *   removed, and it is the only visual state added on top of the current item.
 * - A disabled item renders as a disabled button rather than a link, so it is
 *   unreachable by pointer, keyboard and assistive technology alike.
 */
export const Accessibility: Story = {
  args: {
    items: defaultItems,
  },
};
