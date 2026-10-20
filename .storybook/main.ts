import type { StorybookConfig } from '@storybook/web-components-vite';
import { mergeConfig } from 'vite';
import 'storybook/test';

const config: StorybookConfig = {
  "stories": [
    "../src/stories/*.mdx",
    "../src/stories/Layout.stories.ts",
    "../src/stories/LayoutDemo.stories.ts",
    "../src/components/ibk-accordion.stories.ts",
    "../src/components/ibk-button.stories.ts",
    "../src/components/ibk-step-button.stories.ts",
    "../src/components/ibk-step-button-bar.stories.ts",
    "../src/components/ibk-table.stories.ts",
    "../src/components/ibk-input.stories.ts",
    "../src/components/ibk-fieldset.stories.ts",
    "../src/components/ibk-select.stories.ts",
    "../src/components/ibk-textarea.stories.ts",
    "../src/components/ibk-checkbox.stories.ts",
    "../src/components/ibk-radio.stories.ts",
    "../src/components/ibk-switch.stories.ts",
    "../src/components/ibk-tabs.stories.ts",
    "../src/components/ibk-segmented-control.stories.ts",
    "../src/components/ibk-pagination.stories.ts",
    "../src/components/ibk-pagination-dots.stories.ts",
    "../src/components/ibk-dialog.stories.ts",
    "../src/components/ibk-banner.stories.ts",
    "../src/components/ibk-toast.stories.ts",
    "../src/components/ibk-tooltip.stories.ts",
    "../src/components/ibk-link.stories.ts",
    "../src/components/ibk-breadcrumb.stories.ts",
    "../src/components/ibk-navigation-menu-item.stories.ts",
    "../src/components/ibk-bottom-navigation.stories.ts",
    "../src/components/ibk-top-navigation.stories.ts",
    "../src/components/ibk-badge.stories.ts",
    "../src/components/ibk-progress.stories.ts",
    "../src/components/ibk-meter.stories.ts",
    "../src/components/ibk-chip.stories.ts",
    "../src/components/ibk-range-slider.stories.ts",
    "../src/components/ibk-rating.stories.ts",
    "../src/components/ibk-dropdown.stories.ts",
    "../src/components/ibk-card.stories.ts",
  ],
  "addons": [
    "@chromatic-com/storybook",
    "@storybook/addon-vitest",
    "@storybook/addon-a11y",
    "@storybook/addon-docs",
  ],
  "framework": "@storybook/web-components-vite",
  "staticDirs": [
    { from: '../src/styles', to: '/resources/styles' },
    // The Asap faces live in the @ides/fonts package. The preview iframe imports
    // them through Vite (preview.ts), but the manager is its own document and can
    // only reach them through this static mapping.
    { from: '../packages/fonts', to: '/resources/fonts' },
    // Only the font files, not the whole @ides/iconset package: the preloads in
    // preview-head.html / manager-head.html need a static URL, everything else the
    // Iconset page uses (icons.json included) goes through Vite.
    { from: '../packages/iconset/assets', to: '/resources/iconset/assets' },
  ],
  "viteFinal": async (config) => {
    /**
     * This is a fix for storybook in combination with vite and addon-docs. 
     * Copy-pasted from the this comment:
     * https://github.com/storybookjs/storybook/issues/21716
     */
    // vite-plugin-dts from vite.config.ts is only meant for the library build; inside Storybook
    // it would write a declaration file per component into storybook-static.
    config.plugins = config.plugins?.filter(
      (plugin) =>
        !(plugin && typeof plugin === 'object' && 'name' in plugin && plugin.name === 'vite:dts')
    );
    // Clear specific build config options from vite.config.ts that conflict with Storybook
    if (config.build) {
      delete config.build.lib;
      config.build.assetsDir = 'resources';
      // The IBYKUS-Iconset font and the Asap variable fonts (via `iconset.css` and
      // `fonts.css`, both imported in `preview.ts`) end up injected into
      // iframe.html as CSS-in-JS rather than loaded as their own linked
      // stylesheet. Relative url()s in injected CSS resolve against iframe.html's
      // location, not the font's actual output path (`resources/...`), so as a
      // normal hashed asset they always 404 and the glyphs render as plain
      // letters. Force these to inline as base64 instead, so there's no path to
      // get wrong regardless of deploy
      // depth (main branch vs. nested MR review URLs).
      const FORCE_INLINE_FONTS = /(IBYKUS-Iconset|Asap(-Italic)?_wdth-wght)\.(woff2?|ttf|eot)$/;
      config.build.assetsInlineLimit = (filePath: string, content: Buffer) => {
        if (FORCE_INLINE_FONTS.test(filePath)) {
          console.log(`[storybook base-path fix] Force-inlining ${filePath.split(/[\\/]/).pop()} as base64 (avoids broken relative url() in injected CSS)`);
          return true;
        }
        return content.length < 4096;
      };
      config.build.cssCodeSplit = true;
      // Reset rollupOptions to avoid inlineDynamicImports: true from vite.config.ts
      config.build.rollupOptions = {
        output: {
          inlineDynamicImports: false
        }
      }
    }
    return mergeConfig(config, {
      base: './',
      optimizeDeps: {
        include: ["@storybook/addon-docs"],
      },
      plugins: [
        {
          name: "fix-mdx-react-shim",
          enforce: "pre",
          resolveId(source: any) {
            if (
              source.startsWith("file://") &&
              source.includes("mdx-react-shim.js")
            ) {
              // Convert file:///... path to normal filesystem path for Vite
              const url = new URL(source);
              if (process.platform === 'win32') {
                return url.pathname.substring(1);
              }
              return url.pathname;
            }
            return null;
          },
        },
      ],
    });
  }
};

export default config;
