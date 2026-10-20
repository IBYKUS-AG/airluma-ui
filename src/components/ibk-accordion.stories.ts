import type { Meta, StoryObj } from '@storybook/web-components';
import { getStorybookHelpers } from '@wc-toolkit/storybook-helpers';
import { html } from 'lit';
import './ibk-accordion';
import { IbkAccordion } from './ibk-accordion';

const { events, args, argTypes } = getStorybookHelpers<IbkAccordion>('ibk-accordion');

const sampleContent =
  'Weit hinten, hinter den Wortbergen, fern der Länder Vokalien und Konsonantien leben die Blindtexte. Abgeschieden wohnen sie in Buchstabhausen an der Küste des Semantik, eines großen Sprachozeans.';

const meta: Meta<IbkAccordion> = {
  title: 'Components/Accordion',
  component: 'ibk-accordion',
  args: {
    ...args,
    iconPosition: 'trailing',
  },
  argTypes: {
    ...argTypes,
    // `cem analyze` records `items` as the bare type name `AccordionItem[]` without
    // a `parsedType`, so the helpers fall back to a plain text control that starts
    // empty and cannot round-trip an array. Force the JSON object editor.
    items: { control: 'object' },
  },
  parameters: {
    actions: {
      handles: events,
    },
  },
  // The accordion has no width of its own - it fills whatever the layout gives it
  // (IDES-58). The wrapper here is `.ibk-container-sm` (40rem) rather than a magic
  // pixel value, so the stories show a realistic reading measure while the
  // component itself stays fluid. See the "Fluid" story for the proof.
  render: (args) => html`
    <div class="ibk-container ibk-container-sm ibk-container-flush">
      <ibk-accordion .items="${args.items}" iconPosition="${args.iconPosition}"></ibk-accordion>
    </div>
  `,
};

export default meta;
type Story = StoryObj<IbkAccordion & typeof args>;

const items = [
  { title: 'The Legend goes here', content: sampleContent },
  { title: 'The Legend goes here', content: sampleContent, active: true },
  { title: 'The Legend goes here', content: sampleContent },
];

export const Default: Story = {
  args: {
    iconPosition: 'trailing',
    items,
  },
};

export const LeadingIcon: Story = {
  args: {
    iconPosition: 'leading',
    items,
  },
};

export const WithDisabled: Story = {
  args: {
    iconPosition: 'trailing',
    items: [
      { title: 'Enabled section', content: sampleContent },
      { title: 'Opened section', content: sampleContent, active: true },
      { title: 'Disabled section', content: sampleContent, disabled: true },
    ],
  },
};

/**
 * The answer to "how wide may an accordion get?" (IDES-48): as wide as its
 * container, and no wider. The component carries no `max-width`, so the layout
 * decides - here the same accordion sits in the main column and in the aside of
 * one `.ibk-sidebar`. Drag the canvas narrower and the aside wraps below the main
 * column on its own, without a breakpoint.
 */
export const Fluid: Story = {
  render: (args) => html`
    <div class="ibk-sidebar">
      <div class="ibk-sidebar-main ibk-stack gap-spacing-8">
        <h5 style="margin: 0;">Main column</h5>
        <ibk-accordion .items="${args.items}" iconPosition="${args.iconPosition}"></ibk-accordion>
      </div>
      <div class="ibk-sidebar-aside ibk-stack gap-spacing-8">
        <h5 style="margin: 0;">Aside</h5>
        <ibk-accordion .items="${args.items}" iconPosition="${args.iconPosition}"></ibk-accordion>
      </div>
    </div>
  `,
  args: {
    iconPosition: 'trailing',
    items,
  },
};
