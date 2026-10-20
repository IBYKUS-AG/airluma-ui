import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { resolve } from 'path';
import { defineConfig } from 'vite';

const dirname =
  typeof __dirname !== 'undefined' ? __dirname : path.dirname(fileURLToPath(import.meta.url));

/**
 * CDN build — produces standalone JS files for plain HTML usage.
 * CSS is bundled separately by scripts/build-cdn.js, with esbuild.
 *
 * Output (dist-cdn/webcomponents/):
 *   ibykus-design-system.umd.min.js   — drop into <script src="...">
 *   ibykus-design-system.es.min.js    — for <script type="module">
 */
export default defineConfig({
  build: {
    outDir: 'dist-cdn/webcomponents',
    emptyOutDir: true,
    minify: 'esbuild',
    lib: {
      entry: resolve(dirname, 'src/index.cdn.ts'),
      name: 'IbykusDesignSystem',
      formats: ['es', 'umd'],
      fileName: format => `ibykus-design-system.${format}.min.js`,
    },
    rollupOptions: {
      output: {
        inlineDynamicImports: true,
      },
    },
  },
});
