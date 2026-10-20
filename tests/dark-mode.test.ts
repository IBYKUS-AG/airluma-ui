/**
 * Guards the dark mode architecture (IDES-36): every colour that differs between light and dark
 * mode is written as `light-dark(light, dark)` directly in the declaration that uses it. There
 * are no `*-dark.css` files and no `prefers-color-scheme` media queries anywhere - which of the
 * two values applies is decided by `color-scheme` alone: `light dark` on `:root` follows the
 * operating system, and an application can force a mode with `.isLight` / `.isDark` on `<html>`.
 *
 * `dark-mode.reference.json` is the snapshot of every light-dark() pair of the design system.
 * It is the contract for the dark mode - if a colour pair is changed, added or removed, the
 * snapshot has to be updated deliberately:
 *
 *     UPDATE_DARK_REFERENCE=1 npx vitest run --config vitest.dark-mode.config.ts
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { parseCss, type Node, type Rule } from './css-parser';

interface ReferenceEntry {
  selector: string;
  prop: string;
  value: string;
}

const testsDir = path.dirname(fileURLToPath(import.meta.url));
const stylesDir = path.join(testsDir, '..', 'src', 'styles');
const componentsDir = path.join(stylesDir, 'components');
const referencePath = path.join(testsDir, 'dark-mode.reference.json');

/**
 * Only colours may differ between light and dark mode - never layout or typography.
 * `color-scheme` and the custom properties of the token layer in `global.css` are allowed on top.
 */
const ALLOWED_PROPERTIES = new Set([
  'color',
  'background',
  'background-color',
  'background-image',
  'border',
  'border-color',
  'border-top',
  'border-right',
  'border-bottom',
  'border-left',
  'border-top-color',
  'border-right-color',
  'border-bottom-color',
  'border-left-color',
  'outline-color',
  'box-shadow',
  'text-shadow',
  'fill',
  'stroke',
  'text-decoration-color',
  'caret-color',
  'accent-color',
  '--standard-fontcolor',
  '--ibk-focusstroke',
]);

const componentFiles = fs
  .readdirSync(componentsDir)
  .filter((file) => file.endsWith('.css'))
  .sort();

const allStyleFiles = (dir: string): string[] =>
  fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return allStyleFiles(full);
    return entry.name.endsWith('.css') ? [full] : [];
  });

/** every rule of a stylesheet, including rules nested in at-rules; keyframes are skipped */
const flattenRules = (nodes: Node[]): Rule[] =>
  nodes.flatMap((node) => {
    if (node.type === 'rule') return [node];
    if (/^@(-\w+-)?keyframes\b/i.test(node.prelude)) return [];
    return flattenRules(node.children);
  });

/** all light-dark() declarations of one file, in document order */
function extractPairs(file: string): ReferenceEntry[] {
  const source = fs.readFileSync(path.join(componentsDir, file), 'utf8');
  const entries: ReferenceEntry[] = [];
  for (const rule of flattenRules(parseCss(source))) {
    for (const declaration of rule.declarations) {
      if (declaration.value.includes('light-dark(')) {
        entries.push({
          selector: rule.selector.replace(/\s+/g, ' '),
          prop: declaration.prop,
          value: declaration.value,
        });
      }
    }
  }
  return entries;
}

const extracted: Record<string, ReferenceEntry[]> = {};
for (const file of componentFiles) {
  const entries = extractPairs(file);
  if (entries.length > 0) extracted[path.basename(file, '.css')] = entries;
}

if (process.env.UPDATE_DARK_REFERENCE) {
  fs.writeFileSync(referencePath, JSON.stringify(extracted, null, 2) + '\n');
}

const reference: Record<string, ReferenceEntry[]> = JSON.parse(
  fs.readFileSync(referencePath, 'utf8'),
);

describe('dark mode architecture', () => {
  it('has no *-dark.css files left', () => {
    const darkFiles = allStyleFiles(stylesDir).filter((file) => file.endsWith('-dark.css'));
    expect(darkFiles).toEqual([]);
  });

  it('has no prefers-color-scheme media query anywhere', () => {
    const offenders = allStyleFiles(stylesDir).filter((file) =>
      fs
        .readFileSync(file, 'utf8')
        .replace(/\/\*[\s\S]*?\*\//g, '') // comments may mention it
        .includes('prefers-color-scheme'),
    );
    expect(offenders).toEqual([]);
  });

  it('keeps the color-scheme contract in global.css', () => {
    const source = fs.readFileSync(path.join(componentsDir, 'global.css'), 'utf8');
    const rules = flattenRules(parseCss(source));
    const declarationsOf = (selector: string) =>
      rules
        .filter((rule) => rule.selector === selector)
        .flatMap((rule) => rule.declarations.map((d) => `${d.prop}: ${d.value}`));
    expect(declarationsOf(':root')).toContain('color-scheme: light dark');
    expect(declarationsOf('html.isLight')).toContain('color-scheme: light');
    expect(declarationsOf('html.isDark')).toContain('color-scheme: dark');
  });
});

describe.each(componentFiles)('%s', (file) => {
  const source = fs.readFileSync(path.join(componentsDir, file), 'utf8');
  const rules = flattenRules(parseCss(source));
  const name = path.basename(file, '.css');

  it('uses light-dark() only in colour declarations, well-formed', () => {
    for (const rule of rules) {
      for (const declaration of rule.declarations) {
        const value = declaration.value;
        if (!value.includes('light-dark(')) continue;
        expect(
          ALLOWED_PROPERTIES.has(declaration.prop),
          `${rule.selector} { ${declaration.prop} } is not a colour property`,
        ).toBe(true);
        // every light-dark() call carries exactly two non-empty arguments
        let index = value.indexOf('light-dark(');
        while (index !== -1) {
          let depth = 0;
          let commas = 0;
          let cursor = index + 'light-dark'.length;
          const argStart = cursor + 1;
          let commaAt = -1;
          for (; cursor < value.length; cursor += 1) {
            const char = value[cursor];
            if (char === '(') depth += 1;
            else if (char === ')') {
              depth -= 1;
              if (depth === 0) break;
            } else if (char === ',' && depth === 1) {
              commas += 1;
              commaAt = cursor;
            }
          }
          expect(depth, `${rule.selector} { ${declaration.prop} } unbalanced light-dark()`).toBe(0);
          expect(commas, `${rule.selector} { ${declaration.prop} } needs two arguments`).toBe(1);
          const light = value.slice(argStart, commaAt).trim();
          const dark = value.slice(commaAt + 1, cursor).trim();
          expect(
            light.length,
            `${rule.selector} { ${declaration.prop} } empty light value`,
          ).toBeGreaterThan(0);
          expect(
            dark.length,
            `${rule.selector} { ${declaration.prop} } empty dark value`,
          ).toBeGreaterThan(0);
          index = value.indexOf('light-dark(', cursor);
        }
      }
    }
  });

  it('matches the dark mode reference snapshot', () => {
    expect(extracted[name] ?? []).toEqual(reference[name] ?? []);
  });
});

describe('reference snapshot', () => {
  it('covers exactly the files that carry light-dark() pairs', () => {
    expect(Object.keys(extracted).sort()).toEqual(Object.keys(reference).sort());
  });
});
