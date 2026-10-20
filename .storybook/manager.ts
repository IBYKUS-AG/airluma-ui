import { GLOBALS_UPDATED } from 'storybook/internal/core-events';
import { addons } from 'storybook/manager-api';

import { osSchemeQuery, resolveScheme, storedScheme, type Scheme } from './color-scheme';
import { darkTheme, lightTheme } from './theme';

const applyTheme = (scheme: Scheme) =>
  addons.setConfig({ theme: scheme === 'dark' ? darkTheme : lightTheme });

/* The manager chrome is a separate document from the preview and cannot see the isLight /
   isDark class the design system reacts to. It starts from the same two sources the preview
   does - the persisted choice, the OS setting otherwise - so the sidebar is never light while
   the components are already dark, and follows the toolbar from there. */
applyTheme(resolveScheme(storedScheme()));

addons.register('ibk/scheme-sync', (api) => {
  api
    .getChannel()
    ?.on(GLOBALS_UPDATED, ({ globals }: { globals: Record<string, any> }) =>
      applyTheme(resolveScheme(globals?.backgrounds?.value)),
    );
});

// Without an explicit choice the preview keeps following the OS on its own; the manager has to
// be told when that setting changes.
osSchemeQuery()?.addEventListener('change', () => {
  if (!storedScheme()) applyTheme(resolveScheme(undefined));
});
