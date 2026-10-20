import type { Meta, StoryObj } from "@storybook/web-components";
import { getStorybookHelpers } from "@wc-toolkit/storybook-helpers";
import { html } from "lit";
import "./ibk-button";
import "./ibk-card";
import "./ibk-dialog";
import { IbkDialog } from "./ibk-dialog";

const { events, args, argTypes } = getStorybookHelpers<IbkDialog>("ibk-dialog");

const meta: Meta<IbkDialog> = {
  title: "Components/Dialog",
  component: "ibk-dialog",
  args,
  argTypes: {
    ...argTypes,
    type: {
      control: "radio",
      options: ["horizontal", "vertical"],
      description: "Layout type of the dialog",
    },
    variant: {
      control: "radio",
      options: ["regular", "decent"],
      description: "Visual variant of the dialog",
    },
    headline: {
      control: "text",
      description: "The headline text",
    },
    open: {
      control: "boolean",
      description: "Whether the dialog is open",
    },
  },
  parameters: {
    actions: {
      handles: events,
    },
  },
};

export default meta;
type Story = StoryObj<IbkDialog & typeof args>;

// Default — vertical regular with 3 buttons
export const HorizontalRegularThree: Story = {
  tags: ["!autodocs"],
  args: {
    headline: "Title goes here",
    type: "vertical",
    variant: "regular",
    open: true,
  },
  render: (args) => html`
    <ibk-dialog
      .headline=${args.headline}
      type=${args.type}
      variant=${args.variant}
      ?open=${args.open}
    >
      Text goes here
      <div slot="actions">
        <ibk-button label="Preferred Action" type="primary"></ibk-button>
        <ibk-button label="Second Action" type="secondary"></ibk-button>
        <ibk-button label="Third Action" type="secondary"></ibk-button>
      </div>
    </ibk-dialog>
  `,
};

/**
 * Playground — mirrors the demo page. Click any trigger to open the
 * corresponding dialog. Close with Escape, backdrop click, or any action button.
 */
const openDialog = (id: string) => () => {
  const dlg = document.getElementById(id) as IbkDialog | null;
  dlg?.show();
};

const closeOwnDialog = (e: Event) => {
  const dlg = (e.currentTarget as HTMLElement).closest(
    "ibk-dialog"
  ) as IbkDialog | null;
  dlg?.close();
};

export const Playground: Story = {
  parameters: {
    controls: { disable: true },
  },
  render: () => html`
    <style>
      .demo-section {
        margin-bottom: 2rem;
        padding-bottom: 2rem;
        border-bottom: 1px solid #e0e0e0;
      }
      .demo-section:last-of-type {
        border-bottom: none;
      }
      .demo-section h3 {
        margin-top: 0;
        margin-bottom: 0.75rem;
        font-size: 1.125rem;
        font-weight: 700;
      }
      .demo-section p {
        margin-top: 0;
        margin-bottom: 0.75rem;
        font-size: 0.9rem;
      }
      .demo-row {
        display: flex;
        gap: 1rem;
        flex-wrap: wrap;
      }
    </style>

    <h2>Dialog Testseite</h2>
    <p>Folgende unterschiedliche Dialoge können hier geöffnet und getestet werden. Klickt einfach auf den entsprechenden Button, um den gewünschten Dialog zu öffnen.</p>
    <br>

    <div class="demo-section">
      <h3>Horizontaler Dialog (Regular)</h3>
      <div class="demo-row">
        <ibk-button
          label="Mit 1 Button öffnen"
          type="primary"
          @click=${openDialog("pg-h-reg-1")}
        ></ibk-button>
        <ibk-button
          label="Mit 2 Buttons öffnen"
          type="primary"
          @click=${openDialog("pg-h-reg-2")}
        ></ibk-button>
        <ibk-button
          label="Mit 3 Buttons öffnen"
          type="primary"
          @click=${openDialog("pg-h-reg-3")}
        ></ibk-button>
      </div>
    </div>

    <div class="demo-section">
      <h3>Vertikaler Dialog (Regular)</h3>
      <div class="demo-row">
        <ibk-button
          label="Mit 1 Button öffnen"
          type="primary"
          @click=${openDialog("pg-v-reg-1")}
        ></ibk-button>
        <ibk-button
          label="Mit 2 Buttons öffnen"
          type="primary"
          @click=${openDialog("pg-v-reg-2")}
        ></ibk-button>
        <ibk-button
          label="Mit 3 Buttons öffnen"
          type="primary"
          @click=${openDialog("pg-v-reg-3")}
        ></ibk-button>
      </div>
    </div>

    <div class="demo-section">
      <h3>Dialog (Decent)</h3>
      <div class="demo-row">
        <ibk-button
          label="Horizontale Version öffnen"
          type="primary"
          @click=${openDialog("pg-h-decent")}
        ></ibk-button>
        <ibk-button
          label="Vertikale Version öffnen"
          type="primary"
          @click=${openDialog("pg-v-decent")}
        ></ibk-button>
      </div>
    </div>

    <div class="demo-section">
      <h3>Persistenter Dialog (forced choice)</h3>
      <p>Ein Klick auf den Hintergrund sowie die Escape-Taste sind deaktiviert — der Nutzer muss bewusst eine der Schaltflächen auswählen.</p>
      <div class="demo-row">
        <ibk-button
          label="Öffne Dialog"
          type="primary"
          @click=${openDialog("pg-persistent")}
        ></ibk-button>
      </div>
    </div>

    <!-- Horizontal Regular — 1 / 2 / 3 -->
    <ibk-dialog id="pg-h-reg-1" headline="Title goes here" type="horizontal" variant="regular">
      Text goes here. This is a horizontal regular dialog with a single preferred action.
      <div slot="actions">
        <ibk-button label="Preferred Action" type="primary" @click=${closeOwnDialog}></ibk-button>
      </div>
    </ibk-dialog>

    <ibk-dialog id="pg-h-reg-2" headline="Title goes here" type="horizontal" variant="regular">
      Text goes here. Two buttons — the preferred one ends up on the right automatically.
      <div slot="actions">
        <ibk-button label="Preferred Action" type="primary" @click=${closeOwnDialog}></ibk-button>
        <ibk-button label="Second Action" type="secondary" @click=${closeOwnDialog}></ibk-button>
      </div>
    </ibk-dialog>

    <ibk-dialog id="pg-h-reg-3" headline="Title goes here" type="horizontal" variant="regular">
      Text goes here. Three buttons laid out right-aligned, preferred on the far right.
      <div slot="actions">
        <ibk-button label="Preferred Action" type="primary" @click=${closeOwnDialog}></ibk-button>
        <ibk-button label="Second Action" type="secondary" @click=${closeOwnDialog}></ibk-button>
        <ibk-button label="Third Action" type="secondary" @click=${closeOwnDialog}></ibk-button>
      </div>
    </ibk-dialog>

    <!-- Vertical Regular — 1 / 2 / 3 -->
    <ibk-dialog id="pg-v-reg-1" headline="Title goes here" type="vertical" variant="regular">
      Text goes here. Vertical dialog with one full-width button.
      <div slot="actions">
        <ibk-button label="Preferred Action" type="primary" @click=${closeOwnDialog}></ibk-button>
      </div>
    </ibk-dialog>

    <ibk-dialog id="pg-v-reg-2" headline="Title goes here" type="vertical" variant="regular">
      Text goes here. Two stacked full-width buttons, preferred on top.
      <div slot="actions">
        <ibk-button label="Preferred Action" type="primary" @click=${closeOwnDialog}></ibk-button>
        <ibk-button label="Second Action" type="secondary" @click=${closeOwnDialog}></ibk-button>
      </div>
    </ibk-dialog>

    <ibk-dialog id="pg-v-reg-3" headline="Title goes here" type="vertical" variant="regular">
      Text goes here. Three stacked full-width buttons, preferred on top.
      <div slot="actions">
        <ibk-button label="Preferred Action" type="primary" @click=${closeOwnDialog}></ibk-button>
        <ibk-button label="Second Action" type="secondary" @click=${closeOwnDialog}></ibk-button>
        <ibk-button label="Third Action" type="secondary" @click=${closeOwnDialog}></ibk-button>
      </div>
    </ibk-dialog>

    <!-- Decent variants -->
    <ibk-dialog id="pg-h-decent" headline="Title goes here" type="horizontal" variant="decent">
      Text goes here. Decent variant has no card background — the darker backdrop provides the contrast.
      <div slot="actions">
        <ibk-button label="Preferred Action" variant="decent" type="primary" @click=${closeOwnDialog}></ibk-button>
        <ibk-button label="Second Action" variant="decent" type="secondary" @click=${closeOwnDialog}></ibk-button>
        <ibk-button label="Third Action" variant="decent" type="secondary" @click=${closeOwnDialog}></ibk-button>
      </div>
    </ibk-dialog>

    <ibk-dialog id="pg-v-decent" headline="Title goes here" type="vertical" variant="decent">
      Text goes here. Vertical decent variant — no card, full-width decent buttons stacked.
      <div slot="actions">
        <ibk-button label="Preferred Action" variant="decent" type="primary" @click=${closeOwnDialog}></ibk-button>
        <ibk-button label="Second Action" variant="decent" type="secondary" @click=${closeOwnDialog}></ibk-button>
      </div>
    </ibk-dialog>

    <!-- Persistenter Dialog (forced choice) -->
    <ibk-dialog
      id="pg-persistent"
      headline="Bitte bestätigen"
      type="horizontal"
      variant="regular"
      persistent
    >
      Dieser Dialog ist persistent. Sie müssen eine der Schaltflächen auswählen — weder die Escape-Taste noch ein Klick auf den Hintergrund schließt ihn.
      <div slot="actions">
        <ibk-button label="Akzeptieren" type="primary" @click=${closeOwnDialog}></ibk-button>
        <ibk-button label="Ablehnen" type="secondary" @click=${closeOwnDialog}></ibk-button>
      </div>
    </ibk-dialog>
  `,
};
