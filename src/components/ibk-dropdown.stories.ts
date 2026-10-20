import type { Meta, StoryObj } from '@storybook/web-components';
import { getStorybookHelpers } from '@wc-toolkit/storybook-helpers';
import { html } from 'lit';
import { ifDefined } from 'lit/directives/if-defined.js';
import type { DropdownItem } from '../utils/types';
import { action } from './../utils/utils';
import './ibk-button';
import './ibk-dropdown';
import { IbkDropdown } from './ibk-dropdown';

const { events, args, argTypes } = getStorybookHelpers<IbkDropdown>('ibk-dropdown');

/**
 * The command menu from the design, verbatim: two separators grouping the clipboard
 * commands, one row opening a submenu, and the commands that are unavailable in this
 * context left disabled rather than removed.
 */
const editItems: DropdownItem[] = [
  { label: 'Rückgängig', icon: 'Undo', shortcut: 'Strg / Command + Z', disabled: true },
  { separator: true },
  { label: 'Ausschneiden', icon: 'Cut', shortcut: 'Strg / Command + X', disabled: true },
  { label: 'Kopieren', icon: 'Paste', shortcut: 'Strg / Command + C', disabled: true },
  { label: 'Einfügen', icon: 'Dup', shortcut: 'Strg / Command + V' },
  { separator: true },
  {
    label: 'Letzten Wert einfügen',
    icon: 'BklgAdd',
    items: [
      { label: 'Aus diesem Formular', icon: 'FTypDoc' },
      { label: 'Aus der Vorlage', icon: 'Copy' },
      { label: 'Aus dem Zwischenspeicher', icon: 'Paste' },
    ],
  },
  { label: 'Liste der letzten Werte zeigen', icon: 'List', shortcut: 'Umsch + F5' },
  { label: 'Letzte Formularwerte einfügen', icon: 'RowAddD', shortcut: 'Strg / Command + F5' },
  { label: 'Wert rücksetzen', icon: 'UndoAll', shortcut: 'Alt + F5', disabled: true },
];

/* -------------------------------------------------------------------------- */
/*  Trigger wiring                                                            */
/*                                                                            */
/*  ibk-dropdown is the menu, not the button — so opening it is the page's     */
/*  job. Everything below is that page code, shown here against an            */
/*  ibk-button. It is delegated on the anchor rather than bound to the button, */
/*  which is why the same three handlers drive every trigger in the Triggers   */
/*  story without knowing what any of them are.                               */
/* -------------------------------------------------------------------------- */

/** The dropdown sitting inside the anchor this event was handled on. */
const menuOf = (e: Event): IbkDropdown | null =>
  (e.currentTarget as HTMLElement).querySelector('ibk-dropdown');

/** True for an event that came out of the panel — a row doing its job, not the trigger. */
const fromMenu = (e: Event, menu: IbkDropdown) => e.composedPath().includes(menu);

const onAnchorClick = (e: Event) => {
  const menu = menuOf(e);
  if (!menu || fromMenu(e, menu)) return;

  menu.toggle();
};

/**
 * Arrow Down and Arrow Up open the panel and hand the keyboard straight to a row, the way
 * a native select does. Enter and Space need nothing: they fire a click on the button, and
 * `onAnchorClick` already covers that.
 */
const onAnchorKeydown = (e: KeyboardEvent) => {
  const menu = menuOf(e);
  if (!menu || fromMenu(e, menu)) return;

  if (e.key === 'ArrowDown') {
    e.preventDefault();
    void menu.focusFirstItem();
  } else if (e.key === 'ArrowUp') {
    e.preventDefault();
    void menu.focusLastItem();
  }
};

/**
 * Keeps the trigger's ARIA in step with the panel, listening for the dropdown's own open
 * and close events so it stays correct however the panel was dismissed.
 *
 * Note the reach into `button.ibkButton`: `ibk-button` renders its own inner `<button>` and
 * exposes no way to set `aria-haspopup` or `aria-expanded` on it, so a page using it as a
 * menu trigger has to do this by hand. That is a real gap in `ibk-button` rather than
 * something this story invented — a trigger built from a plain `<button class="ibkButton">`
 * would simply carry the attributes in its markup.
 */
const syncTriggerAria = (e: Event) => {
  const anchor = e.currentTarget as HTMLElement;
  const menu = anchor.querySelector('ibk-dropdown');
  const trigger = anchor.querySelector('button.ibkButton');
  if (!menu || !trigger) return;

  trigger.setAttribute('aria-haspopup', 'menu');
  trigger.setAttribute('aria-expanded', String(menu.open));
};

const meta: Meta<IbkDropdown> = {
  title: 'Components/Dropdown',
  component: 'ibk-dropdown',
  args: {
    ...args,
    items: editItems,
    label: 'Bearbeiten',
    placement: 'bottom-start',
  },
  argTypes: {
    ...argTypes,
    // `cem analyze` records `items` as the bare type name `DropdownItem[]` without a
    // `parsedType`, so the helpers fall back to a plain text control that starts empty and
    // cannot round-trip an array. Force the JSON object editor.
    items: { control: 'object' },
  },
  parameters: {
    actions: {
      handles: events,
    },
    docs: {
      description: {
        component:
          "**The menu, not the button.** The trigger is the page's — an `ibk-button`, a " +
          'step button, a bare icon. Wrap it and the `ibk-dropdown` in one ' +
          '`.ibkDropdownAnchor`: the panel hangs off that container and counts clicks ' +
          'inside it as its own, so opening is just `toggle()`. `focusFirstItem()` / ' +
          '`focusLastItem()` hand the keyboard over on Arrow Down / Up, and ' +
          "`dropdown-open` / `dropdown-close` keep the trigger's `aria-expanded` in step. " +
          '\n\nEach row is an object in `items`, every optional part expressed by its ' +
          'presence: `icon` for a leading glyph, `shortcut` for a trailing keyboard hint, ' +
          'nested `items` for a submenu (which replaces the hint with a chevron), ' +
          '`separator: true` for a rule. Hover and pressed share one fill, so the parent ' +
          'row of an open submenu stays highlighted. ' +
          '\n\nKeyboard: Up/Down and Home/End walk the rows, skipping separators and ' +
          'disabled ones; Right/Left step into and out of a submenu; Enter/Space choose; ' +
          'Escape, Tab or an outside click close and return focus to the trigger.',
      },
    },
  },
  render: (args) => renderDropdown(args),
};

export default meta;
type Story = StoryObj<IbkDropdown & typeof args>;

/**
 * Holds a display story's panel up. Dismissing on an outside click or on Tab is exactly
 * what the component should do, but a docs page puts every story in one document: a single
 * click anywhere would collapse all of them at once, and in `States` there is no trigger to
 * bring them back with. Re-asserting `open` turns those stories into static specimens.
 * `Default` and `Triggers` are deliberately left alone so the real behaviour stays
 * testable.
 */
const keepOpen = (e: Event) => {
  (e.target as IbkDropdown).open = true;
};

/**
 * The trigger plus the panel, in one anchor. The outer wrapper reserves room because the
 * panel is absolutely positioned and would otherwise be clipped by the short canvas the
 * docs page gives a story.
 */
const renderDropdown = (args: IbkDropdown, staticPanel = false) => html`
  <div style="min-height: 26rem;">
    <div
      class="ibkDropdownAnchor"
      @click=${onAnchorClick}
      @keydown=${onAnchorKeydown}
      @dropdown-open=${syncTriggerAria}
      @dropdown-close=${syncTriggerAria}
    >
      <ibk-button
        label="${ifDefined(args.label || undefined)}"
        icon="ChevD"
        iconPosition="trailing"
        type="secondary"
      ></ibk-button>
      <ibk-dropdown
        label="${ifDefined(args.label || undefined)}"
        placement="${ifDefined(args.placement || undefined)}"
        .items="${args.items}"
        ?open="${args.open}"
        @dropdown-select="${args['dropdown-select'] || action}"
        @dropdown-open="${args['dropdown-open'] || action}"
        @dropdown-close="${staticPanel ? keepOpen : args['dropdown-close'] || action}"
      ></ibk-dropdown>
    </div>
  </div>
`;

/**
 * Default — the command menu from the design, closed. Click the button, or focus it and
 * press Enter or Arrow Down, to open it; Escape, Tab or a click outside closes it again and
 * hands focus back to the button. The controls panel drives this story like any other, so
 * `label`, `placement` and `items` can be changed here directly.
 */
export const Default: Story = {
  args: {
    items: editItems,
    label: 'Bearbeiten',
  },
};

/**
 * Submenus — nest `items` on a row to hang another panel off it. The parent row keeps the
 * hover fill for as long as its submenu is open, which is what marks the branch you are
 * currently inside. Submenus nest as deep as the data does; here "Regionen" carries one of
 * its own.
 */
export const Submenu: Story = {
  render: (args) => renderDropdown(args, true),
  args: {
    label: 'Berichte',
    open: true,
    items: [
      { label: 'Übersicht', icon: 'Dash' },
      { separator: true },
      {
        label: 'Nach Zeitraum',
        icon: 'Cal',
        items: [
          { label: 'Diese Woche' },
          { label: 'Dieser Monat' },
          { label: 'Dieses Jahr' },
          { separator: true },
          { label: 'Eigener Zeitraum', icon: 'CalEdit' },
        ],
      },
      {
        label: 'Nach Region',
        icon: 'Globe',
        items: [
          { label: 'Deutschland' },
          {
            label: 'Regionen',
            items: [{ label: 'Nord' }, { label: 'Süd' }, { label: 'Ost' }, { label: 'West' }],
          },
          { label: 'Nicht zugeordnet', disabled: true },
        ],
      },
      { label: 'Archiv', icon: 'TimeHist', disabled: true },
    ],
  },
};

/**
 * Triggers — the dropdown does not care what opens it. All four of these are `ibk-button`
 * in different guises, including an icon-only one, and every one of them is driven by the
 * same three delegated handlers at the top of this file. Swapping in a step button or a
 * plain `<button>` would need no change to either the component or the wiring.
 */
export const Triggers: Story = {
  render: () => html`
    <div style="display:flex; align-items:flex-start; gap:1rem; flex-wrap:wrap; min-height:26rem;">
      ${(
        [
          { label: 'Primary', type: 'primary', variant: 'regular' },
          { label: 'Secondary', type: 'secondary', variant: 'regular' },
          { label: 'Decent', type: 'secondary', variant: 'decent' },
          { label: '', type: 'primary', variant: 'regular' },
        ] as const
      ).map(
        (trigger) => html`
          <div
            class="ibkDropdownAnchor"
            @click=${onAnchorClick}
            @keydown=${onAnchorKeydown}
            @dropdown-open=${syncTriggerAria}
            @dropdown-close=${syncTriggerAria}
          >
            <ibk-button
              label=${ifDefined(trigger.label || undefined)}
              icon=${trigger.label ? 'ChevD' : 'BrgrMenu'}
              iconPosition="trailing"
              type=${trigger.type}
              variant=${trigger.variant}
            ></ibk-button>
            <ibk-dropdown
              label=${trigger.label || 'Menü'}
              .items=${editItems}
              @dropdown-select=${action}
            ></ibk-dropdown>
          </div>
        `,
      )}
    </div>
  `,
};

/**
 * Placement — `bottom-start` lines the panel up with the anchor's leading edge and
 * `bottom-end` with its trailing edge. The block axis is not a choice: the panel always
 * hangs below and only flips above the anchor when the viewport leaves no room, which is
 * why its top corners are the square ones.
 */
export const Placement: Story = {
  render: () => html`
    <div
      style="display:flex; align-items:flex-start; justify-content:space-between; min-height:26rem; gap:1.5rem;"
    >
      ${(['bottom-start', 'bottom-end'] as const).map(
        (placement) => html`
          <div>
            <p style="margin:0 0 0.5rem; color:#555; font-size:0.75rem; font-weight:600;">
              ${placement}
            </p>
            <div class="ibkDropdownAnchor" @click=${onAnchorClick} @keydown=${onAnchorKeydown}>
              <ibk-button
                label="Bearbeiten"
                icon="ChevD"
                iconPosition="trailing"
                type="secondary"
              ></ibk-button>
              <ibk-dropdown
                label="Bearbeiten"
                placement=${placement}
                open
                .items=${editItems}
                @dropdown-select=${action}
                @dropdown-close=${keepOpen}
              ></ibk-dropdown>
            </div>
          </div>
        `,
      )}
    </div>
  `,
};

/* -------------------------------------------------------------------------- */
/*  States reference (mirrors the Figma matrix)                               */
/* -------------------------------------------------------------------------- */

/**
 * Freezes the interactive states so the whole matrix is readable at a glance.
 *
 * These are real `ibk-dropdown` elements carrying the shipped CSS, with two things
 * neutralised. They are laid out in flow rather than absolutely positioned under a trigger,
 * because a positioned panel would stack on top of the next grid row instead of sitting in
 * its own cell — and there is no trigger here at all, since this matrix is about the rows.
 * And the cells are inert (`pointer-events: none`), so a real pointer can never repaint a
 * row with its own `:hover` — what you see is what the class forces.
 *
 * The forced colours repeat the global `--ibk-*` tokens from `dropdown.css` because the
 * component exposes no per-state custom properties to read back; this duplication stays
 * inside the story instead of adding demo-only hooks to the shipped CSS.
 */
const forceStyles = html`
  <style>
    /* A static reference matrix — no cell reacts to the pointer. */
    .sb-states .sb-cell {
      display: inline-flex;
      pointer-events: none;
    }

    /* Lay the panel out in flow: this matrix is about the rows, not the positioning. */
    .sb-states ibk-dropdown {
      position: static;
    }

    /* Once the panel is static, the component's viewport flip has nothing meaningful to
       measure — a cell low on the page can still pick up the flipped class, and with it
       the flipped corners. Pin the corners the design specifies for a panel hanging
       below its trigger, so every cell in the matrix reads the same. */
    .sb-states ibk-dropdown.ibkDropdown-flip-block > .ibkDropdown-menu {
      border-radius: 0 0 var(--ibk-radius-10, 0.625rem) var(--ibk-radius-10, 0.625rem);
    }

    /* Hover and pressed are one fill by design, so one rule covers both rows. The full
       selector chain is repeated on purpose: dropdown.css resets the row background
       through ibk-dropdown .ibkDropdown-menu button.ibkDropdown-item, so anything
       shorter than that loses on specificity no matter where it sits in the cascade. */
    .sb-force-hover ibk-dropdown .ibkDropdown-menu button.ibkDropdown-item:not(:disabled) {
      background: var(--ibk-neutral-grey-94);
    }
    /* Same 2px ring the component draws, inset so it lands inside the edge-to-edge row
       rather than over the panel border — see the focus block in dropdown.css. */
    .sb-force-focus ibk-dropdown .ibkDropdown-menu button.ibkDropdown-item {
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

/** Rows of the states reference. The last two are forced visually (see `forceStyles`). */
const STATE_ROWS: { key: string; cls: string; disabled?: boolean }[] = [
  { key: 'enabled', cls: '' },
  { key: 'disabled', cls: '', disabled: true },
  { key: 'hover / pressed', cls: 'sb-force-hover' },
  { key: 'focus', cls: 'sb-force-focus' },
];

/** Columns of the states reference — one per Figma "Style" of a Dropdown-Item. */
const STATE_COLUMNS: { title: string; trailing: Partial<DropdownItem> }[] = [
  { title: 'Trailing Text', trailing: { shortcut: 'Strg + V' } },
  { title: 'Trailing Icon', trailing: { items: [{ label: 'Untermenü' }] } },
];

/**
 * States reference — the full Figma matrix: every state (enabled / disabled / hover and
 * pressed / focus) for a row ending in a keyboard hint and for one ending in a submenu
 * chevron. Hover and focus are normally interactive, so here they are forced visually to
 * show the whole matrix at once.
 *
 * Hover and pressed share a row because they share a fill in the design — that is what
 * lets the parent row of an open submenu stay highlighted while its submenu is up.
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
                    <span class="sb-cell ${state.cls}">
                      <ibk-dropdown
                        open
                        @dropdown-close=${keepOpen}
                        .items=${[
                          {
                            label: 'Text goes here',
                            icon: 'TriPtVert',
                            disabled: state.disabled,
                            ...column.trailing,
                          },
                        ]}
                      ></ibk-dropdown>
                    </span>
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
