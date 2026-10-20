/**
 * @ides/webcomponents/styles/all - the whole look in one import.
 *
 * A JS module rather than a CSS file on purpose: a JS `import` of a bare
 * specifier resolves identically in Vite, webpack, Rollup, Parcel and esbuild,
 * whereas a cross-package `@import` inside a stylesheet does not resolve in the
 * browser at all and is version-dependent in webpack. That is also why
 * ides.css itself never references another package.
 *
 * Import the three parts separately if you want to skip one -- Asap in
 * particular, if your application already loads it from elsewhere.
 */
import '@ides/fonts/fonts.css';
import '@ides/iconset/iconset.css';
import './ides.css';
