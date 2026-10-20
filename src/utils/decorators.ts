// import { withActions } from "storybook/actions/decorator";
import { makeDecorator, useArgs } from 'storybook/preview-api';
import { html } from 'lit';

// ----------------------------------------------------------------------------------
/**
 * I left this piece of code as an example, in case somebody want's to extend the decorators.
 */
export const argChangeDecorator = makeDecorator({
  name: 'argChangeDecorator',
  parameterName: 'argChangeDecorator',
  skipIfNoParametersOrOptions: true,
  wrapper: (getStory, context) => {
    const [_, updateArgs] = useArgs();

    const handleArgSync = (e: CustomEvent) => {
      if (e.type === 'change') {
        updateArgs({ checked: e.detail.checked });
      }
    };

    const { args } = context;
    const argChange = new CustomEvent('argChangeForceDocUpdate', {
      detail: { ...args },
    });

    setTimeout(() => window.dispatchEvent(argChange), 0);

    // withActions(getStory(context))
    return html`
      <div style="display: contents" @change=${handleArgSync}>${getStory(context)}</div>
    `;
  },
});

// ----------------------------------------------------------------------------------

export const withActionsPlus = [
  // withActions
];
