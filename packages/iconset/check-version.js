/**
 * Fails if the two stylesheets disagree with package.json about the icon font's
 * version.
 *
 * `ides.fontVersion` in package.json is the single authored location of that
 * version (build-cdn.js reads it from there). The stylesheets repeat it as
 * --ides-iconset-version and are checked against it rather than rewritten, so
 * what ships is what is committed.
 */
import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';

const dir = path.dirname(fileURLToPath(import.meta.url));
const read = p => fs.readFileSync(path.join(dir, p), 'utf8');
const VERSION = JSON.parse(read('package.json')).ides.fontVersion;

for (const css of ['iconset.css', 'iconset.woff2.css']) {
  const m = read(css).match(/--ides-iconset-version:\s*"([^"]+)"/);
  if (!m || m[1] !== VERSION) {
    console.error(
      `\n@ides/iconset: ${css} declares --ides-iconset-version ${m ? `"${m[1]}"` : '(none)'}, ` +
        `but package.json says ides.fontVersion "${VERSION}". package.json is authoritative; update the CSS.\n`
    );
    process.exit(1);
  }
}
console.log(`@ides/iconset: font version ${VERSION} ok`);
