import path from "path";
import { getTsProgram, typeParserPlugin } from "@wc-toolkit/type-parser";
import { cemInheritancePlugin } from "@wc-toolkit/cem-inheritance";
import { jsxTypesPlugin } from "@wc-toolkit/jsx-types";

/**
 * TypeScript names a source file after the import that first pulls it into the program, so a
 * component imported by an alphabetically earlier one (ibk-link via ibk-breadcrumb) gets an
 * absolute module path. Turn those back into repo-relative paths before the package link phase
 * copies them into `modulePath` / `definitionPath`.
 */
function relativeModulePathsPlugin() {
  const root = `${process.cwd().split(path.sep).join('/')}/`;
  const toRelative = (value) => (value?.startsWith(root) ? value.slice(root.length) : value);
  return {
    name: 'relative-module-paths',
    moduleLinkPhase({ moduleDoc }) {
      moduleDoc.path = toRelative(moduleDoc.path);
      for (const moduleExport of moduleDoc.exports ?? []) {
        if (moduleExport.declaration) {
          moduleExport.declaration.module = toRelative(moduleExport.declaration.module);
        }
      }
    },
  };
}

export default {
  // 1. Point to your component files
  globs: ['src/components/**/*.ts'],

  // 2. EXCLUDE story files and test files
  exclude: [
    'src/components/**/*.stories.ts',
    'src/components/**/*.test.ts',
    'src/components/**/*.spec.ts'
  ],

  // 3. Output directory (usually root or dist)
  outdir: './',

  // 4. Enable Lit support if you use Lit (Optional but recommended for Lit)
  litelement: true,

  // Give the plugin access to the TypeScript type checker
  overrideModuleCreation({ ts, globs }) {
    const program = getTsProgram(ts, globs, "tsconfig.json");
    return program
      .getSourceFiles()
      .filter((sf) => globs.find((glob) => sf.fileName.includes(glob)));
  },

  // Add the plugin to the config
  plugins: [relativeModulePathsPlugin(), typeParserPlugin({
    parseObjectTypes: 'full',
    parseParameters: true,
    debug: true,
  }),
    cemInheritancePlugin(),
    // JSX types for React 19+ consumers, shipped as the `@airluma/webcomponents/react` entry.
    // Written next to the build output, so it runs after `vite build` (see prepack and build-release).
    jsxTypesPlugin({
      outdir: './dist',
      fileName: 'react.d.ts',
      globalTypePath: './index.js',
      stronglyTypedEvents: true,
      // Keeps onClick, onFocus etc. available on every ibk-* element.
      includeDefaultDOMEvents: true,
    }),
  ],

};