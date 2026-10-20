import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import type { IbkTableHeader, SelectOption } from '../utils/types';
import '../components/ibk-button';
import '../components/ibk-card';
import '../components/ibk-checkbox';
import '../components/ibk-chip';
import '../components/ibk-fieldset';
import '../components/ibk-input';
import '../components/ibk-pagination';
import '../components/ibk-select';
import '../components/ibk-textarea';
import '../components/ibk-table';
import { withLayoutCode } from './LayoutCode';
import { withLayoutInspector } from './LayoutInspector';
import './LayoutPreview.css';

/**
 * The same four primitives from *Design System → Layout*, but built out of real
 * components instead of dummy boxes (IDES-58). Each story is a page you could ship;
 * the code panel under the canvas is the markup, unedited.
 *
 * Nothing here sets a width on a component. Every width in these pages comes from
 * exactly two places: a `.ibk-container*` class, or a `--ibk-*-min` / `--ibk-*-size`
 * value on a primitive.
 */

const meta: Meta = {
  title: 'Design System/Layout Demo',
  decorators: [withLayoutInspector, withLayoutCode],
  parameters: {
    layout: 'fullscreen',
    docs: {
      // Same as the Layout page: the "Show code" box below each story prints the
      // real markup, so Storybook's own source toggle would only add a second
      // button showing the render function instead.
      canvas: { sourceState: 'none' },
      codePanel: false,
      description: {
        component: `
Every page below follows the same three-line skeleton:

\`\`\`html
<div class="ibk-container ibk-container-lg">   <!-- how wide may the page get -->
  <div class="ibk-stack gap-spacing-32">      <!-- the page's sections -->
    …                                          <!-- each section picks its own primitive -->
  </div>
</div>
\`\`\`

Pick the primitive per section, never per page:

| The section is… | Primitive |
| --- | --- |
| a form, an article, the content of a card | \`.ibk-stack\` |
| a button bar, a filter row, a toolbar, a header | \`.ibk-cluster\` |
| a set of equal tiles (cards, KPIs) | \`.ibk-auto-grid\` |
| content plus a filter or detail panel | \`.ibk-sidebar\` |

Resize the canvas on any story. Nothing below uses a media query — the pages
re-flow because the primitives react to the space they get.

### Reading a page

**Show code**, under each story, prints that whole page's markup — the container,
the stack of sections, and the primitive each section uses. That is the granularity
that matters here: on a page demo the useful thing is the skeleton, not one row in
isolation. (The *Layout* reference page puts a box on every single example instead,
because there each row is one isolated idea.)

Component data is passed as properties, so it does not appear in the HTML — an
\`<ibk-table>\` prints as its own tag. The layout around it is the point.

**Inspect**, above each story, is the other direction: turn it on and click into
the page to see which primitive and which gap class any part uses, with **Layout**
showing what those classes resolved to. Click a chip under "Parents" to step up to
a container. Inspect mode suppresses clicks on the stage, so switch it off again to
use the buttons, selects and checkboxes normally.
        `,
      },
    },
  },
};

export default meta;
type Story = StoryObj;

/* ***************************************************************************************
 *  Shared demo data
 * ***************************************************************************************/

const tableHeaders: IbkTableHeader[] = [
  { label: 'Order' },
  { label: 'Customer' },
  { label: 'Status' },
  { label: 'Amount', align: 'right' },
];

const tableRows = [
  ['#4711', 'Bergmann GmbH', 'Shipped', '1.240,00 €'],
  ['#4712', 'Ostwald & Söhne', 'In review', '890,50 €'],
  ['#4713', 'Kranich Logistik', 'Shipped', '3.120,00 €'],
  ['#4714', 'Weiss Metallbau', 'Open', '460,00 €'],
  ['#4715', 'Nordlicht AG', 'Shipped', '2.075,90 €'],
];

const countries: SelectOption[] = [
  { value: 'de', label: 'Deutschland' },
  { value: 'at', label: 'Österreich' },
  { value: 'ch', label: 'Schweiz' },
];

const salutations: SelectOption[] = [
  { value: 'none', label: 'Keine Angabe' },
  { value: 'ms', label: 'Frau' },
  { value: 'mr', label: 'Herr' },
];

const kpis = [
  { label: 'Open orders', value: '128' },
  { label: 'Shipped today', value: '46' },
  { label: 'In review', value: '9' },
  { label: 'Revenue (month)', value: '184 k€' },
];

/* ***************************************************************************************
 *  Dashboard - Container + Stack + Cluster + Auto-Grid + Sidebar in one page
 * ***************************************************************************************/

/**
 * **All four primitives in one page.** Reading from the outside in:
 *
 * 1. `.ibk-container-xl` caps the page at 100rem and supplies the page margin.
 * 2. `.ibk-stack gap-spacing-32` separates the page's sections.
 * 3. The page header is a `.ibk-cluster ibk-cluster-between` — title left, actions
 *    right, and it survives the wrap because it uses `space-between` rather than an
 *    auto margin.
 * 4. The KPI row is a `.ibk-auto-grid ibk-auto-grid-narrow` (12rem minimum): four
 *    columns on a monitor, two on a tablet, one on a phone. No breakpoint.
 * 5. The body is a `.ibk-sidebar`: the table takes the rest, the filter panel keeps
 *    its ~18rem and drops below the table when the space runs out.
 *
 * The table is the one thing that may scroll horizontally — rows and columns belong
 * together and must not wrap, which is the documented exception in WCAG 1.4.10.
 * `min-inline-size: 0` on `.ibk-sidebar-main` is what lets the table scroll inside
 * its column instead of widening the whole page.
 */
export const Dashboard: Story = {
  name: '01 · Dashboard page',
  render: () => html`
    <div class="lp-page">
      <div class="ibk-container ibk-container-xl">
        <div class="ibk-stack gap-spacing-32">
          <!-- Page header — Cluster, split to both edges -->
          <div class="ibk-cluster ibk-cluster-between">
            <div class="ibk-stack gap-spacing-4">
              <h3 style="margin: 0;">Orders</h3>
              <span class="lp-label">Week 35 · 2026</span>
            </div>
            <div class="ibk-cluster gap-spacing-8">
              <ibk-button label="Export" variant="decent" icon="Export"></ibk-button>
              <ibk-button label="New order" icon="Plus"></ibk-button>
            </div>
          </div>

          <!-- KPIs — Auto-Grid, 12rem minimum tile -->
          <div class="ibk-auto-grid ibk-auto-grid-narrow gap-spacing-16">
            ${kpis.map(
              (kpi) => html`
                <ibk-card variant="filled" delta="0">
                  <div class="ibk-stack gap-spacing-4">
                    <span class="lp-label">${kpi.label}</span>
                    <span class="lp-metric">${kpi.value}</span>
                  </div>
                </ibk-card>
              `,
            )}
          </div>

          <!-- Body — Sidebar: table beside the filter panel -->
          <div class="ibk-sidebar" style="--ibk-sidebar-aside-size: 18rem;">
            <div class="ibk-sidebar-main ibk-stack gap-spacing-16">
              <div class="lp-surface ibk-stack gap-spacing-16">
                <ibk-table
                  .headers="${tableHeaders}"
                  .rows="${tableRows}"
                  caption="Recent orders"
                  zebra
                  hover
                ></ibk-table>
                <!-- .ibk-query-container opts the pagination into its compact size.
                     It sits on this block-level wrapper, not on the pagination
                     itself: a contained box may not be sized by its content. -->
                <div class="ibk-query-container">
                  <div class="ibk-cluster ibk-cluster-between gap-spacing-8">
                    <span class="lp-label">5 of 128</span>
                    <ibk-pagination currentPage="2" totalPages="26" mode="maximum"></ibk-pagination>
                  </div>
                </div>
              </div>
            </div>

            <div class="ibk-sidebar-aside">
              <div class="lp-surface ibk-stack gap-spacing-16">
                <h5 style="margin: 0;">Filter</h5>
                <ibk-select label="Country" .options="${countries}" value="de"></ibk-select>
                <ibk-input label="Customer" placeholder="Search…" funcIcon1="Search"></ibk-input>
                <div class="ibk-stack gap-spacing-8">
                  <ibk-checkbox label="Shipped" checked></ibk-checkbox>
                  <ibk-checkbox label="In review"></ibk-checkbox>
                  <ibk-checkbox label="Open"></ibk-checkbox>
                </div>
                <div class="ibk-cluster ibk-cluster-end gap-spacing-8">
                  <ibk-button label="Apply"></ibk-button>
                  <ibk-button label="Reset" type="secondary"></ibk-button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
};

/* ***************************************************************************************
 *  Form page - Stack all the way down
 * ***************************************************************************************/

/**
 * **A form is a Stack of Stacks.** The nesting is where the proximity scale earns
 * its keep — three levels, each one tighter than the one around it:
 *
 * | Level | Gap | Why |
 * | --- | --- | --- |
 * | between fieldsets | `.gap-spacing-32` | independent sections |
 * | between fields of one fieldset | `.gap-spacing-16` | siblings of one group |
 * | inside one field (label, input, hint) | `.gap-spacing-6` | one field and its own label |
 *
 * The last one is already built into `ibk-input`, so a form never sets it — it is
 * listed to show that the scale continues below what the page controls.
 *
 * `.ibk-container-sm` (40rem) is the width: a single-column form that runs wider
 * than that stops being readable, and no input carries a width of its own to
 * enforce it.
 *
 * The two fields that belong on one line sit in a `.ibk-cluster` with
 * `.ibk-cluster-grow` on both — they share the row and wrap onto two lines when the
 * container gets narrow, which is what makes this work at 320px.
 */
export const FormPage: Story = {
  name: '02 · Form page',
  render: () => html`
    <div class="lp-page">
      <div class="ibk-container ibk-container-sm">
        <form
          class="lp-surface ibk-stack gap-spacing-32"
          @submit="${(e: Event) => e.preventDefault()}"
        >
          <div class="ibk-stack gap-spacing-4">
            <h3 style="margin: 0;">New customer</h3>
            <span class="lp-label">All fields marked * are required</span>
          </div>

          <ibk-fieldset legend="Contact">
            <div class="ibk-stack gap-spacing-16">
              <ibk-select label="Salutation" .options="${salutations}" value="none"></ibk-select>
              <!-- Two fields on one row: both grow, both may wrap -->
              <div class="ibk-cluster ibk-cluster-align-start gap-spacing-16">
                <ibk-input
                  class="ibk-cluster-grow"
                  label="First name *"
                  placeholder="Erika"
                ></ibk-input>
                <ibk-input
                  class="ibk-cluster-grow"
                  label="Last name *"
                  placeholder="Mustermann"
                ></ibk-input>
              </div>
              <ibk-input
                label="E-mail *"
                type="email"
                placeholder="erika@example.com"
                supportingText="We only use this for order confirmations."
                supportingIcon="InfoCirc"
              ></ibk-input>
            </div>
          </ibk-fieldset>

          <ibk-fieldset legend="Address">
            <div class="ibk-stack gap-spacing-16">
              <ibk-input label="Street and number *" placeholder="Bahnhofstraße 1"></ibk-input>
              <div class="ibk-cluster ibk-cluster-align-start gap-spacing-16">
                <ibk-input
                  class="ibk-cluster-grow"
                  label="Postcode *"
                  placeholder="99084"
                ></ibk-input>
                <ibk-input class="ibk-cluster-grow" label="City *" placeholder="Erfurt"></ibk-input>
              </div>
              <ibk-select label="Country *" .options="${countries}" value="de"></ibk-select>
            </div>
          </ibk-fieldset>

          <ibk-fieldset legend="Notes">
            <div class="ibk-stack gap-spacing-16">
              <ibk-textarea
                label="Internal note"
                placeholder="Anything the team should know…"
              ></ibk-textarea>
              <ibk-checkbox label="Send a welcome e-mail"></ibk-checkbox>
            </div>
          </ibk-fieldset>

          <!-- Footer — Cluster at the end. spacing-16, because the buttons are
               independent blocks, not parts of one control. -->
          <div class="ibk-cluster ibk-cluster-end gap-spacing-16">
            <ibk-button label="Cancel" type="secondary"></ibk-button>
            <ibk-button label="Create customer" htmlType="submit"></ibk-button>
          </div>
        </form>
      </div>
    </div>
  `,
};

/* ***************************************************************************************
 *  Card overview - Auto-Grid + .ibk-stack-push
 * ***************************************************************************************/

/**
 * **The Auto-Grid case the card article describes:** the width stays the same from
 * one card to the next, the heights may differ. Set the minimum tile width to the
 * point where the card's *content* stops being readable — here 18rem — and the grid
 * takes it from there.
 *
 * The cards are the same height because grid items stretch by default; their
 * *content* is not, which is why each card is a `.ibk-stack` with
 * `.ibk-stack-push` on the action row. The buttons line up along the bottom
 * however long the description is, with no fixed height anywhere.
 */
export const CardOverview: Story = {
  name: '03 · Card overview',
  render: () => {
    const products = [
      {
        title: 'Basic',
        badge: 'Active',
        type: 'success',
        text: 'Everything a small team needs to get started.',
      },
      {
        title: 'Professional',
        badge: 'Trial',
        type: 'info',
        text: 'Adds reporting, the audit log and single sign-on. The description here is deliberately longer so the cards end up with different amounts of text.',
      },
      {
        title: 'Enterprise',
        badge: 'Quote',
        type: 'warning',
        text: 'Dedicated hosting and a named contact.',
      },
      {
        title: 'Education',
        badge: 'Active',
        type: 'success',
        text: 'For schools and universities.',
      },
      {
        title: 'Non-profit',
        badge: 'Active',
        type: 'success',
        text: 'Same as Professional, at a reduced rate, for registered charities.',
      },
    ];

    return html`
      <div class="lp-page">
        <div class="ibk-container ibk-container-lg">
          <div class="ibk-stack gap-spacing-32">
            <div class="ibk-cluster ibk-cluster-between">
              <h3 style="margin: 0;">Plans</h3>
              <ibk-button label="Compare all" variant="decent"></ibk-button>
            </div>

            <div class="ibk-auto-grid" style="--ibk-auto-grid-min: 18rem;">
              ${products.map(
                (product) => html`
                  <ibk-card variant="filled" delta="0">
                    <div class="ibk-stack gap-spacing-12" style="block-size: 100%;">
                      <div class="ibk-cluster ibk-cluster-between gap-spacing-8">
                        <h5 style="margin: 0;">${product.title}</h5>
                        <ibk-chip
                          label="${product.badge}"
                          status="passive"
                          type="${product.type}"
                        ></ibk-chip>
                      </div>
                      <p class="lp-label" style="margin: 0;">${product.text}</p>
                      <div class="ibk-stack-push ibk-cluster ibk-cluster-end gap-spacing-8">
                        <ibk-button label="Details" type="secondary"></ibk-button>
                        <ibk-button label="Select"></ibk-button>
                      </div>
                    </div>
                  </ibk-card>
                `,
              )}
            </div>
          </div>
        </div>
      </div>
    `;
  },
};

/* ***************************************************************************************
 *  Reflow proof
 * ***************************************************************************************/

/**
 * **The 320px check, run on a real page.** Same markup as *01 · Dashboard page*,
 * inside a 320px frame — the width WCAG 1.4.10 "Reflow" is measured at.
 *
 * What happens without a single media query:
 *
 * - the header Cluster wraps, so the buttons move under the title
 * - the KPI Auto-Grid collapses to one column (`min()` beats the 12rem minimum)
 * - the Sidebar drops the filter panel below the table
 * - the button rows wrap instead of overflowing
 * - the **table** scrolls horizontally, which is the explicit exception for
 *   two-dimensional content
 *
 * The frame has `resize: horizontal` — drag its bottom-right corner. It reacts at
 * every width, not at four of them, which is the difference between this and a
 * column grid.
 */
export const Reflow320: Story = {
  name: '04 · Reflow at 320px',
  parameters: { layout: 'padded' },
  render: () => html`
    <div class="ibk-stack gap-spacing-16">
      <p class="lp-note">
        Drag the bottom-right corner of the frame to change its width. Nothing in this page reads
        the viewport.
      </p>
      <div class="lp-viewport lp-viewport-320">
        <div class="ibk-stack gap-spacing-24">
          <div class="ibk-cluster ibk-cluster-between gap-spacing-8">
            <h5 style="margin: 0;">Orders</h5>
            <div class="ibk-cluster gap-spacing-8">
              <ibk-button label="Export" variant="decent"></ibk-button>
              <ibk-button label="New"></ibk-button>
            </div>
          </div>

          <div class="ibk-auto-grid ibk-auto-grid-narrow gap-spacing-8">
            ${kpis.map(
              (kpi) => html`
                <ibk-card variant="filled" delta="4">
                  <div class="ibk-stack gap-spacing-4">
                    <span class="lp-label">${kpi.label}</span>
                    <span class="lp-metric">${kpi.value}</span>
                  </div>
                </ibk-card>
              `,
            )}
          </div>

          <div class="ibk-sidebar gap-spacing-16" style="--ibk-sidebar-aside-size: 18rem;">
            <div class="ibk-sidebar-main ibk-stack gap-spacing-16">
              <ibk-table
                .headers="${tableHeaders}"
                .rows="${tableRows}"
                caption="Recent orders"
                zebra
              ></ibk-table>
              <div class="ibk-query-container">
                <ibk-pagination currentPage="2" totalPages="26" mode="maximum"></ibk-pagination>
              </div>
            </div>
            <div class="ibk-sidebar-aside ibk-stack gap-spacing-8">
              <h5 style="margin: 0;">Filter</h5>
              <ibk-select label="Country" .options="${countries}" value="de"></ibk-select>
              <ibk-checkbox label="Shipped" checked></ibk-checkbox>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
};

/* ***************************************************************************************
 *  How wide may a component get
 * ***************************************************************************************/

/**
 * **The question from the ticket: fixed or variable widths?** *Variable.* A
 * component fills what the layout gives it and carries no `max-width` of its own —
 * because the same component sits in a 40rem form, in an 18rem aside and in a
 * 100rem dashboard, and only the layout knows which.
 *
 * The same select is shown at four widths below without a single change to its
 * markup. Where a cap *is* wanted, it goes on the container:
 *
 * | Want | Put it here |
 * | --- | --- |
 * | a readable single-column form | `.ibk-container-sm` on the form |
 * | a narrow panel next to content | `.ibk-sidebar-aside` |
 * | a tile that must stay readable | `--ibk-auto-grid-min` on the grid |
 * | running text | `.ibk-container-prose` |
 *
 * The two documented exceptions stay: an overlay (dialog, toast, tooltip,
 * dropdown) lies *over* the layout and caps itself, and a table may scroll.
 */
export const FluidComponents: Story = {
  name: '05 · Fixed or variable widths?',
  parameters: { layout: 'padded' },
  render: () => html`
    <div class="ibk-stack gap-spacing-24">
      ${[
        { width: '320px', note: 'phone / 1.4.10 Reflow' },
        { width: '18rem', note: 'in a .ibk-sidebar-aside' },
        { width: '40rem', note: 'in a .ibk-container-sm' },
        { width: '100%', note: 'unconstrained' },
      ].map(
        (frame) => html`
          <div class="ibk-stack gap-spacing-4">
            <p class="lp-caption">${frame.width} — ${frame.note}</p>
            <div class="lp-frame" style="inline-size: ${frame.width}; max-inline-size: 100%;">
              <div class="ibk-stack gap-spacing-16">
                <ibk-select label="Country" .options="${countries}" value="de"></ibk-select>
                <ibk-input
                  label="Customer"
                  placeholder="Search…"
                  supportingText="The field grows and shrinks with its container."
                ></ibk-input>
                <div class="ibk-cluster ibk-cluster-end gap-spacing-16">
                  <ibk-button label="Cancel" type="secondary"></ibk-button>
                  <ibk-button label="Apply"></ibk-button>
                </div>
              </div>
            </div>
          </div>
        `,
      )}
    </div>
  `,
};
