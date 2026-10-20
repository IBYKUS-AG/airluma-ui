import type { Meta, StoryObj } from '@storybook/web-components';
import { getStorybookHelpers } from '@wc-toolkit/storybook-helpers';
import { html } from 'lit';
import { ifDefined } from 'lit/directives/if-defined.js';
import { action } from '../utils/utils';
import './ibk-textarea';
import { IbkTextarea } from './ibk-textarea';

const { events, args, argTypes } = getStorybookHelpers<IbkTextarea>('ibk-textarea');

const meta: Meta<IbkTextarea> = {
  title: 'Components/Textarea',
  component: 'ibk-textarea',
  args: {
    ...args,
    state: 'default',
    disabled: false,
    readonly: false,
    resize: false,
  },
  argTypes: {
    ...argTypes,
    state: {
      control: 'select',
      options: ['default', 'alert', 'warning', 'success'],
    },
    supportingText: {
      control: 'text',
    },
    disabled: {
      control: 'boolean',
    },
    readonly: {
      control: 'boolean',
    },
    resize: {
      control: 'boolean',
    },
    maxlength: {
      control: 'number',
    },
  },
  parameters: {
    actions: {
      handles: events,
    },
  },
  render: (args) => renderTextarea(args),
};

export default meta;
type Story = StoryObj<IbkTextarea & typeof args>;

const renderTextarea = (args: IbkTextarea) => html`
  <ibk-textarea
    label="${ifDefined(args.label || undefined)}"
    placeholder="${ifDefined(args.placeholder || undefined)}"
    value="${ifDefined(args.value || undefined)}"
    maxlength="${ifDefined(args.maxlength || undefined)}"
    ?disabled="${args.disabled}"
    ?readonly="${args.readonly}"
    ?resize="${args.resize}"
    state="${ifDefined(args.state && args.state !== 'default' ? args.state : undefined)}"
    supportingText="${ifDefined(args.supportingText || undefined)}"
    supportingIcon="${ifDefined(args.supportingIcon || undefined)}"
    labelInfoIcon="${ifDefined(args.labelInfoIcon || undefined)}"
    @input="${args.oninput || action}"
    @label-icon-click="${action}"
  ></ibk-textarea>
`;

const defaultArgs: Story['args'] = {
  label: 'Label',
  placeholder: 'Placeholder Text',
  supportingText: 'Supporting text conveys additional information about the field.',
  supportingIcon: 'Notf',
  labelInfoIcon: 'InfoCirc',
};

export const Default: Story = {
  args: {
    ...defaultArgs,
  },
};

export const WithCounter: Story = {
  args: {
    ...defaultArgs,
    maxlength: 256,
    supportingText: 'Sie können bis zu 256 Zeichen eingeben.',
  },
};

export const Resize: Story = {
  args: {
    ...defaultArgs,
    resize: true,
  },
};

export const WithAlert: Story = {
  args: {
    ...defaultArgs,
    state: 'alert',
    supportingText: 'Alert text helps users identify mistakes and recover from them.',
    supportingIcon: 'WarnTria',
  },
};

export const WithWarning: Story = {
  args: {
    ...defaultArgs,
    state: 'warning',
    supportingText: 'This could be a warning message.',
    supportingIcon: 'Notf',
  },
};

export const WithSuccess: Story = {
  args: {
    ...defaultArgs,
    state: 'success',
    supportingText: 'Success text informs users when an action has been successfully completed.',
    supportingIcon: 'ChkMCirc',
  },
};

export const Disabled: Story = {
  args: {
    ...defaultArgs,
    label: 'Disabled Textarea',
    disabled: true,
    value: 'Some content',
  },
};

export const ReadOnly: Story = {
  args: {
    ...defaultArgs,
    readonly: true,
    value: 'Textarea content',
  },
};

export const ReadOnlyResize: Story = {
  args: {
    ...defaultArgs,
    readonly: true,
    resize: true,
    value: 'Textarea content',
  },
};
