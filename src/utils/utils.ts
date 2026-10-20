import { action as storybookAction } from "storybook/actions";

/**
 * Custom action method that wraps "storybook action" method.
 * Allows `detail` to be displayed in Actions tab in Storybook UI.
 * @param e The CustomEvent
 */
export const action = (e: CustomEvent) => {
  const a = storybookAction(e.type); // FYI: e.type is the event name, e.g. "on-input"
  a({ event: e, detail: e.detail, target: e.target });
};
