import { setCustomElementsManifest } from '@storybook/web-components';
import type { Preview } from '@storybook/web-components-vite';
import type { Options } from '@wc-toolkit/storybook-helpers';
import { setStorybookHelpersConfig } from '@wc-toolkit/storybook-helpers';
import { GLOBALS_UPDATED } from 'storybook/internal/core-events';
import { addons } from 'storybook/preview-api';
import { spyOn } from 'storybook/test';
import manifest from "../custom-elements.json" with { type: "json" };
import '../src/index';
import { DocPage } from '../src/stories/DocumentationTemplate';
import '@airluma/fonts/fonts.css';
import '@airluma/iconset/iconset.css';
import '../src/styles/ides.css';
import '../src/styles/dev.css'; // FIXME, Das ist nur for Entwiklung

import { withActionsPlus } from '../src/utils/decorators';
import { ColorSchemeDocsContainer } from './ColorSchemeDocsContainer';
import { storeScheme, storedScheme, type Scheme } from './color-scheme';
import theme from './theme';

const options: Options = {
  hideArgRef: true,
  renderDefaultValues: true,
  typeRef: 'parsedType',
};

setCustomElementsManifest(manifest);
setStorybookHelpersConfig(options);

/* Reuse Storybook's built-in Backgrounds toolbar instead of a second toggle: whichever swatch
   it picks forces the mode via isLight/isDark on <html> (see the color-scheme block in
   global.css), so every component - not just the canvas background - switches. No class at all
   means no forced mode, and `color-scheme: light dark` follows the OS. The swatches themselves
   stay transparent, the colour comes from the design system.

   This runs at module scope rather than in a decorator on purpose: a decorator only runs when
   a story renders, which left a docs page without stories - the Iconset page - stuck in light
   mode. The preview store broadcasts GLOBALS_UPDATED either way. */
const applyScheme = (value: string | undefined) => {
  document.documentElement.classList.toggle('isDark', value === 'dark');
  document.documentElement.classList.toggle('isLight', value === 'light');
  storeScheme(value as Scheme | undefined);
};

applyScheme(storedScheme());

void addons.ready().then((channel) =>
  channel.on(GLOBALS_UPDATED, ({ globals }: { globals: Record<string, any> }) =>
    applyScheme(globals?.backgrounds?.value),
  ),
);

const preview: Preview = {
  async beforeEach() {
    spyOn(console, 'log').mockName('console.log');
  },
  // Restores the choice from the last session; `undefined` leaves the toolbar unset, which
  // is what keeps the whole page on the OS setting.
  initialGlobals: {
    backgrounds: { value: storedScheme() },
  },
  parameters: {
    backgrounds: {
      options: {
        light: { name: 'light', value: 'transparent' },
        dark: { name: 'dark', value: 'transparent' },
      },
    },
    html: {
      highlighter: {
        showLineNumbers: true, // default: false
        wrapLines: false, // default: true
      },
    },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
      expanded: true,
    },

    a11y: {
      // 'todo' - show a11y violations in the test UI only
      // 'error' - fail CI on a11y violations
      // 'off' - skip a11y checks entirely
      test: 'todo'
    },

    docs: {
      // Same 'Asap' theme as the manager chrome, so the docs pages don't fall
      // back to Storybook's built-in default font. ColorSchemeDocsContainer swaps
      // this for darkTheme when the Backgrounds toolbar is set to dark.
      theme,
      container: ColorSchemeDocsContainer,
      codePanel: true,
      canvas: {
        sourceState: 'shown',
      },
      source: {
        type: 'auto',
        transform: async (source: string, ctx: any) => {

          const prettier = await import('prettier/standalone');
          const prettierPluginBabel = await import('prettier/plugins/babel');
          const prettierEstree = (await import("prettier/plugins/estree")).default;

          /**
           * Bug
           * The following line isn't part of the docs. It seems to be a bug in the webcomponent docs generator.
           */
          const sanitized = source.length && source[0] !== "{" ? source : "";

          const formatted = await prettier.format(sanitized, {
            parser: 'babel',
            plugins: [prettierPluginBabel, prettierEstree],
            useTabs: true,
          });

          // Remove ="" from all attributes (preserve whitespace)
          // TODO: Check, if this leads to issues
          const withoutEmptyAttrs = formatted.replace(/(\s)([a-z][a-z0-9-]*)=""/gi, '$1$2');

          // Remove trailing semicolon
          return withoutEmptyAttrs.replace(/;\s*$/, '');
        },
      },
      page: DocPage,
      story: {
        forceInitialArgs: true,
        autoplay: true
      }
    },

  },
  tags: ['autodocs'],
  decorators: withActionsPlus
};

export default preview;
