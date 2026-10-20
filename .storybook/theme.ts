import { create } from 'storybook/theming/create';

/**
 * Storybook ships its own default UI font. Overriding `fontBase` with the house
 * font 'Asap' makes the manager chrome (sidebar, toolbar, buttons) and the docs
 * body text match the components themselves.
 *
 * `fontCode` covers the code blocks only, and mirrors what the design system
 * itself declares for `code`, `pre` and `samp` in `htmlelements.css`: the
 * generic `monospace` keyword rather than a named family.
 *
 * The font faces are declared in CSS, not here: `global.css` covers the preview
 * iframe, `manager-head.html` the manager document.
 *
 * Two variants exist so the manager chrome (sidebar, toolbar) can follow the
 * colour scheme the Backgrounds toolbar forces on the preview - see manager.ts
 * and preview.ts, which pass the scheme across the addons channel.
 */
const shared = {
  fontBase: '"Asap", sans-serif',
  fontCode: 'monospace',
} as const;

export const lightTheme = create({ base: 'light', ...shared });
export const darkTheme = create({ base: 'dark', ...shared });

export default lightTheme;
