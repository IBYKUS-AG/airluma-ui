/**
 * Everything Storybook-specific about the colour scheme lives in `.storybook/`. The design
 * system itself knows nothing about Storybook: it exposes `color-scheme` plus the `isLight` /
 * `isDark` classes on `<html>` (see global.css) and that is the whole contract.
 *
 * The manager (manager.ts) and the preview iframe (preview.ts) are separate documents. Both
 * follow Storybook's own `GLOBALS_UPDATED` event, which the preview store broadcasts whether
 * or not a story is on screen - a decorator would miss a docs page that has no story, such as
 * the Iconset page. They are served from the same origin, so both also read and write the same
 * `localStorage` entry.
 */

export type Scheme = 'light' | 'dark';

const STORAGE_KEY = 'ibk-storybook-color-scheme';

/** The scheme picked in the toolbar, or `undefined` while the OS setting is being followed. */
export const storedScheme = (): Scheme | undefined => {
  const stored = globalThis.localStorage?.getItem(STORAGE_KEY);
  return stored === 'light' || stored === 'dark' ? stored : undefined;
};

/** Survives a reload and a Storybook restart; clearing it hands the choice back to the OS. */
export const storeScheme = (scheme: Scheme | undefined): void => {
  if (scheme) globalThis.localStorage?.setItem(STORAGE_KEY, scheme);
  else globalThis.localStorage?.removeItem(STORAGE_KEY);
};

export const osScheme = (): Scheme =>
  globalThis.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';

export const osSchemeQuery = (): MediaQueryList | undefined =>
  globalThis.matchMedia?.('(prefers-color-scheme: dark)');

/**
 * What is actually on screen. An explicit choice wins; without one the preview follows the OS
 * through `color-scheme: light dark`, so the manager and the docs body have to do the same.
 */
export const resolveScheme = (value: string | undefined): Scheme =>
  value === 'light' || value === 'dark' ? value : osScheme();
