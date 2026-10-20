#!/usr/bin/env node
/**
 * Checks that node_modules/@airluma/* actually point at packages/*.
 *
 * npm 11 links scoped workspaces wrongly for this layout: it writes
 * node_modules/@airluma/iconset -> ../iconset, which resolves to
 * node_modules/iconset and does not exist. npm 10.8 writes
 * ../../packages/iconset and is fine. CI runs node:20-bookworm (npm 10.8), but a
 * developer on a newer Node hits this -- and the symptom is a Rollup
 * "failed to resolve import @airluma/iconset/iconset.css" that says nothing about npm.
 *
 * See .nvmrc and the packageManager field; this is the guard for when neither
 * was honoured.
 */
import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
const broken = [];

for (const ws of pkg.workspaces ?? []) {
  const name = JSON.parse(fs.readFileSync(path.join(root, ws, 'package.json'), 'utf8')).name;
  const link = path.join(root, 'node_modules', name);
  if (!fs.existsSync(link)) {
    let detail = 'missing';
    try {
      detail = `points at ${fs.readlinkSync(link)}, which does not exist`;
    } catch {}
    broken.push(`${name}  (${detail}; expected ${ws})`);
  }
}

if (broken.length) {
  const npmVersion = process.env.npm_config_user_agent?.match(/npm\/(\S+)/)?.[1];
  console.error(
    `\nThe workspace links under node_modules/@airluma are broken:\n  ${broken.join('\n  ')}\n\n` +
      (npmVersion ? `You are running npm ${npmVersion}.\n` : '') +
      `npm 11 writes these links relative to the wrong directory for scoped\n` +
      `workspaces; npm 10.8 does not. Switch to the Node version in .nvmrc\n` +
      `(\`nvm use\`), then remove node_modules and run npm install again.\n`
  );
  process.exit(1);
}
