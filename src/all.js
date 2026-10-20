/**
 * @airluma/webcomponents/all - components and the whole look in one import.
 *
 * The consumer's bundler turns the CSS import into a regular stylesheet with
 * the fonts as separate files; nothing is injected at runtime. Needs a bundler
 * that handles CSS imports from JS (Vite, webpack, Rollup, Parcel, esbuild).
 * Angular CLI does not: there, list the stylesheets in angular.json instead.
 */
import './styles/all.js';
export * from '../dist/ibykus-design-system.es.js';
