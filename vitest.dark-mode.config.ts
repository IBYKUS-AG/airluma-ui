import { defineConfig } from 'vitest/config';

/**
 * Standalone config for the CSS unit tests. They only read the stylesheets from disk, so they run
 * in Node - independent of the Storybook browser project in `vitest.config.ts`.
 */
export default defineConfig({
  test: {
    name: 'css',
    environment: 'node',
    include: ['tests/**/*.test.ts'],
  },
});
