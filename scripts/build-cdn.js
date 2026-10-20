/**
 * Builds the CDN tree into dist-cdn/.
 *
 * Layout mirrors the npm packages, one directory each, so a consumer can take the
 * whole design system or just the iconset:
 *
 *   dist-cdn/webcomponents/  ides.min.css, ides.bundle.min.css,
 *                           assets/<fonts>, the two JS bundles, a demo page
 *   dist-cdn/iconset/        exactly what @ides/iconset publishes
 *   dist-cdn/fonts/          exactly what @ides/fonts publishes
 *
 * The asset packages are copied verbatim, filtered by their own package.json
 * "files" list -- the same rule that decides what npm ships, so the .eot and the
 * 1.9 MB IcoMoon SVG stay out of both by construction, and a licence file can
 * never be dropped again by an extension regex.
 *
 * CSS is bundled with esbuild. ides.css has no url() of its own since the fonts
 * moved out, and cdn/bundle.css pulls in the two asset packages' stylesheets so
 * esbuild copies their fonts to assets/ and rewrites the url()s.
 *
 * Vite and esbuild run through their JS APIs rather than node_modules/.bin: on
 * Windows those are .cmd shims, which execFileSync refuses to start without a shell.
 */
import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import { build as esbuild } from 'esbuild';
import { build as viteBuild } from 'vite';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dist = path.join(root, 'dist-cdn');
process.chdir(root);

const bundleCss = (entry, outfile, { copyAssets = false } = {}) =>
  esbuild({
    entryPoints: [entry],
    bundle: true,
    minify: true,
    logLevel: 'info',
    ...(copyAssets
      ? {
          loader: { '.woff2': 'copy', '.woff': 'copy', '.ttf': 'copy' },
          assetNames: 'assets/[name]',
        }
      : {}),
    outfile,
  });

/** Expands a package.json "files" entry, which may name a file or a directory. */
const expand = (pkgDir, entry) => {
  const abs = path.join(pkgDir, entry);
  if (!fs.existsSync(abs)) return [];
  if (!fs.statSync(abs).isDirectory()) return [entry];
  const out = [];
  const walk = rel => {
    for (const e of fs.readdirSync(path.join(pkgDir, rel), { withFileTypes: true })) {
      const next = path.posix.join(rel, e.name);
      if (e.isDirectory()) walk(next);
      else out.push(next);
    }
  };
  walk(entry);
  return out;
};

const copyPackage = (name, outName) => {
  const pkgDir = path.join(root, 'packages', name);
  const pkg = JSON.parse(fs.readFileSync(path.join(pkgDir, 'package.json'), 'utf8'));
  const target = path.join(dist, outName);
  let count = 0;
  let bytes = 0;
  for (const entry of pkg.files) {
    for (const rel of expand(pkgDir, entry)) {
      const from = path.join(pkgDir, rel);
      const to = path.join(target, rel);
      fs.mkdirSync(path.dirname(to), { recursive: true });
      fs.copyFileSync(from, to);
      count += 1;
      bytes += fs.statSync(from).size;
    }
  }
  console.log(`  ${outName}/  ${count} files, ${(bytes / 1024).toFixed(1)} kB`);
  return pkg;
};

console.log('--- CDN build ---');
fs.rmSync(dist, { recursive: true, force: true });

console.log('\n[1/4] JS bundles (vite)');
await viteBuild({ configFile: path.join(root, 'vite.config.cdn.ts') });

console.log('\n[2/4] stylesheets (esbuild)');
const wc = path.join(dist, 'webcomponents');
await bundleCss('src/styles/ides.css', path.join(wc, 'ides.min.css'));
await bundleCss('cdn/bundle.css', path.join(wc, 'ides.bundle.min.css'), { copyAssets: true });

console.log('\n[3/4] asset packages');
const iconset = copyPackage('iconset', 'iconset');
copyPackage('fonts', 'fonts');

console.log('\n[4/4] docs and demo page');
for (const f of ['LICENSE', 'THIRD-PARTY-NOTICES.txt', 'README.md']) {
  const from = path.join(root, f);
  if (fs.existsSync(from)) fs.copyFileSync(from, path.join(wc, f));
}

const demo = `<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>IBYKUS Design System — CDN Demo</title>

  <!-- One self-contained stylesheet: framework, Asap and the icon font. -->
  <link rel="stylesheet" href="./ides.bundle.min.css" />
  <script src="./ibykus-design-system.umd.min.js"></script>
</head>
<body style="padding: 2rem;">
  <h1>IBYKUS Design System — CDN</h1>

  <p>Ein Stylesheet, ein Script:</p>
  <pre><code>&lt;link rel="stylesheet" href="https://&lt;host&gt;/ides/webcomponents/&lt;version&gt;/ides.bundle.min.css"&gt;
&lt;script src="https://&lt;host&gt;/ides/webcomponents/&lt;version&gt;/ibykus-design-system.umd.min.js"&gt;&lt;/script&gt;</code></pre>

  <div style="display: flex; gap: 1rem; flex-wrap: wrap; margin-block: 1.5rem;">
    <ibk-button label="Primary" type="primary"></ibk-button>
    <ibk-button label="Secondary" type="secondary"></ibk-button>
    <ibk-button label="Destructive" type="destructive"></ibk-button>
    <ibk-button label="Success" type="success"></ibk-button>
  </div>

  <ibk-input label="Benutzername" placeholder="Hier tippen"></ibk-input>

  <h2>Nur das Iconset</h2>
  <p>Ohne Framework, ohne JavaScript:</p>
  <pre><code>&lt;link rel="stylesheet" href="https://&lt;host&gt;/ides/iconset/&lt;version&gt;/iconset.css"&gt;
&lt;i class="ibkIcon"&gt;ChevRBig&lt;/i&gt;</code></pre>
  <p style="font-size: 2rem;">
    <i class="ibkIcon">ChevLBig</i>
    <i class="ibkIcon">ChevRBig</i>
    <i class="ibkIcon">ChkM</i>
    <i class="ibkIcon">Cls</i>
  </p>
</body>
</html>
`;
fs.writeFileSync(path.join(wc, 'index.html'), demo, 'utf8');

console.log(`\n--- done: ${path.relative(root, dist)}/ ---`);
let total = 0;
const list = (dir, indent = '  ') => {
  for (const e of fs.readdirSync(dir, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      console.log(`${indent}${e.name}/`);
      list(full, indent + '  ');
    } else {
      const size = fs.statSync(full).size;
      total += size;
      console.log(`${indent}${e.name} (${(size / 1024).toFixed(1)} kB)`);
    }
  }
};
list(dist);
console.log(`\nTotal: ${(total / 1024 / 1024).toFixed(2)} MB`);
console.log(`Iconset font version: ${iconset.ides.fontVersion}`);
