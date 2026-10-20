/// <reference types="vitest/config" />
import { writeFileSync } from 'fs';
import { resolve } from 'path';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

// The library build sees no CSS and no font files: consumers load the styles
// and fonts as stylesheets (@airluma/webcomponents/styles/all). That is why there
// is no CSS plugin and no assetsInlineLimit here.
export default defineConfig({
  plugins: [
    dts({
      include: [
        'src/index.ts',
        'src/index.cdn.ts',
        'src/components-list.ts',
        'src/components/**/*.ts',
        'src/helpers/**/*.ts',
        'src/utils/types.ts',
      ],
      exclude: ['src/**/*.stories.ts', 'src/**/*.test.ts', 'src/**/*.spec.ts'],
      insertTypesEntry: true,
      // The package is "type": "module", so TypeScript reads index.d.ts as ESM
      // and the require condition needs a .d.cts. It only forwards to the ESM
      // types: lit is ESM-only, so fully separate CJS types are not possible.
      afterBuild: () => {
        writeFileSync(resolve(__dirname, 'dist/index.d.cts'), "export * from './index.js';\n");
      },
    }),
  ],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'IbykusDesignSystem',
      fileName: format => `ibykus-design-system.${format}.js`,
    },
    rollupOptions: {
      output: {
        inlineDynamicImports: true,
      },
    },
  },
});
