import type { Meta, StoryObj } from '@storybook/web-components';
import { getStorybookHelpers } from '@wc-toolkit/storybook-helpers';
import { html } from 'lit';
import { ifDefined } from 'lit/directives/if-defined.js';
import { action } from '../utils/utils';
import './ibk-input';
import { IbkInput } from './ibk-input';

const { events, args, argTypes } = getStorybookHelpers<IbkInput>('ibk-input');

const meta: Meta<IbkInput> = {
  title: 'Components/Input',
  component: 'ibk-input',
  args: {
    ...args,
    type: 'text',
    state: 'default',
    disabled: false,
    readonly: false,
    prominent: false,
  },
  argTypes: {
    ...argTypes,
    type: {
      control: 'select',
      options: ['text', 'password', 'email', 'number', 'search', 'tel', 'url'],
    },
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
    prominent: {
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
  render: (args) => renderInput(args),
};

export default meta;
type Story = StoryObj<IbkInput & typeof args>;

const renderInput = (args: IbkInput) => html`
  <ibk-input
    label="${ifDefined(args.label || undefined)}"
    type="${ifDefined(args.type || undefined)}"
    placeholder="${ifDefined(args.placeholder || undefined)}"
    value="${ifDefined(args.value || undefined)}"
    maxlength="${ifDefined(args.maxlength || undefined)}"
    ?disabled="${args.disabled}"
    ?readonly="${args.readonly}"
    ?prominent="${args.prominent}"
    state="${ifDefined(args.state && args.state !== 'default' ? args.state : undefined)}"
    supportingText="${ifDefined(args.supportingText || undefined)}"
    supportingIcon="${ifDefined(args.supportingIcon || undefined)}"
    textInfoIcon="${ifDefined(args.textInfoIcon || undefined)}"
    labelInfoIcon="${ifDefined(args.labelInfoIcon || undefined)}"
    labelInfoIconLabel="${ifDefined(args.labelInfoIconLabel || undefined)}"
    funcIcon1="${ifDefined(args.funcIcon1 || undefined)}"
    funcIcon1Label="${ifDefined(args.funcIcon1Label || undefined)}"
    funcIcon2="${ifDefined(args.funcIcon2 || undefined)}"
    funcIcon2Label="${ifDefined(args.funcIcon2Label || undefined)}"
    funcIcon3="${ifDefined(args.funcIcon3 || undefined)}"
    funcIcon3Label="${ifDefined(args.funcIcon3Label || undefined)}"
    @input="${args.oninput || action}"
    @func-icon-1-click="${action}"
    @func-icon-2-click="${action}"
    @func-icon-3-click="${action}"
    @label-icon-click="${action}"
  ></ibk-input>
`;

const defaultArgs: Story['args'] = {
  label: 'Bezeichnung des Textfeldes',
  type: 'text',
  placeholder: 'Please type here',
  supportingText: 'This is a sample supporting text.',
  supportingIcon: 'Notf',
  textInfoIcon: 'Search',
};

export const Default: Story = {
  args: {
    ...defaultArgs,
    labelInfoIcon: 'InfoCirc',
    labelInfoIconLabel: 'Weitere Informationen',
    funcIcon1: 'Backspace',
    funcIcon1Label: 'Eingabe löschen',
    funcIcon2: 'Mic',
    funcIcon2Label: 'Spracheingabe starten',
    funcIcon3: 'Cls',
    funcIcon3Label: 'Eingabe löschen',
  },
};

export const WithCounter: Story = {
  args: {
    ...defaultArgs,
    maxlength: 65,
    supportingText: 'Sie können bis zu 65 Zeichen eingeben.',
  },
};

export const WithAlert: Story = {
  args: {
    ...defaultArgs,
    state: 'alert',
    supportingText: 'This could be an alert message.',
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
    supportingText: 'Selection confirmed',
    supportingIcon: 'ChkMCirc',
  },
};

export const Disabled: Story = {
  args: {
    ...defaultArgs,
    label: 'Disabled Input',
    disabled: true,
    value: 'Some content',
  },
};

export const ReadOnly: Story = {
  args: {
    ...defaultArgs,
    label: 'Label',
    readonly: true,
    value: 'Input Text',
    funcIcon1: 'Backspace',
    funcIcon1Label: 'Eingabe löschen',
    funcIcon2: 'Mic',
    funcIcon2Label: 'Spracheingabe starten',
    funcIcon3: 'Cls',
    funcIcon3Label: 'Eingabe löschen',
    supportingText: 'Supporting text conveys additional information about the field.',
  },
};

export const WithIcons: Story = {
  args: {
    ...defaultArgs,
    label: 'With Icons',
    labelInfoIcon: 'InfoCirc',
    labelInfoIconLabel: 'Weitere Informationen',
    supportingIcon: 'Notf',
    supportingText: 'Icon example',
  },
};

export const Password: Story = {
  args: {
    label: 'Label',
    type: 'password',
    placeholder: 'Password',
    labelInfoIcon: 'InfoCirc',
    labelInfoIconLabel: 'Weitere Informationen',
    supportingText: 'Supporting text conveys additional information about the field.',
    supportingIcon: 'Notf',
  },
};

export const PasswordAlert: Story = {
  args: {
    label: 'Label',
    type: 'password',
    value: 'password12',
    labelInfoIcon: 'InfoCirc',
    labelInfoIconLabel: 'Weitere Informationen',
    state: 'alert',
    supportingText: 'Alert text helps users identify mistakes and recover from them.',
    supportingIcon: 'WarnTria',
  },
};

export const PasswordSuccess: Story = {
  args: {
    label: 'Label',
    type: 'password',
    value: 'password12',
    labelInfoIcon: 'InfoCirc',
    labelInfoIconLabel: 'Weitere Informationen',
    state: 'success',
    supportingText: 'Success text informs users when an action has been successfully completed.',
    supportingIcon: 'ChkMCirc',
  },
};

export const PasswordProminent: Story = {
  args: {
    label: 'Label',
    type: 'password',
    prominent: true,
    placeholder: 'Password',
    labelInfoIcon: 'InfoCirc',
    labelInfoIconLabel: 'Weitere Informationen',
    supportingText: 'Supporting text conveys additional information about the field.',
    supportingIcon: 'Notf',
  },
};

export const Prominent: Story = {
  args: {
    label: 'Prominent Text',
    type: 'text',
    prominent: true,
    placeholder: 'Prominent style',
    textInfoIcon: 'Search',
    supportingText: 'Prominent input variant.',
    supportingIcon: 'Notf',
  },
};

export const ProminentAlert: Story = {
  args: {
    label: 'Prominent Text',
    type: 'text',
    prominent: true,
    value: 'Invalid entry',
    textInfoIcon: 'Search',
    labelInfoIcon: 'InfoCirc',
    labelInfoIconLabel: 'Weitere Informationen',
    state: 'alert',
    supportingText: 'Alert text helps users identify mistakes and recover from them.',
    supportingIcon: 'WarnTria',
  },
};

export const ProminentSuccess: Story = {
  args: {
    label: 'Prominent Text',
    type: 'text',
    prominent: true,
    value: 'Valid entry',
    textInfoIcon: 'Search',
    labelInfoIcon: 'InfoCirc',
    labelInfoIconLabel: 'Weitere Informationen',
    state: 'success',
    supportingText: 'Success text informs users when an action has been successfully completed.',
    supportingIcon: 'ChkMCirc',
  },
};

export const ProminentReadOnly: Story = {
  args: {
    label: 'Prominent Text',
    type: 'text',
    prominent: true,
    readonly: true,
    value: 'Input Text',
    textInfoIcon: 'Search',
    labelInfoIcon: 'InfoCirc',
    labelInfoIconLabel: 'Weitere Informationen',
    supportingText: 'Supporting text conveys additional information about the field.',
    supportingIcon: 'Notf',
  },
};

export const ProminentThreeFuncs: Story = {
  args: {
    label: 'Prominent Text',
    type: 'text',
    prominent: true,
    funcIcon1: 'Edit',
    funcIcon1Label: 'Eingabe bearbeiten',
    funcIcon2: 'Search',
    funcIcon2Label: 'Suche starten',
    funcIcon3: 'Cls',
    funcIcon3Label: 'Eingabe löschen',
    textInfoIcon: 'Search',
    supportingText: 'This could be a warning message.',
    state: 'warning',
    supportingIcon: 'Notf',
  },
};
