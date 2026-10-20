/**
 * Minimal CSS parser used by the dark mode tests. It is deliberately small: it only needs to
 * split the framework's stylesheets into rules, declarations and at-rule blocks - it does not
 * validate CSS.
 */

export interface Declaration {
  prop: string;
  value: string;
}

export interface Rule {
  type: 'rule';
  selector: string;
  declarations: Declaration[];
}

export interface AtRule {
  type: 'atrule';
  prelude: string;
  children: Node[];
}

export type Node = Rule | AtRule;

/** At-rules whose body contains nested rules instead of declarations. */
const NESTING_AT_RULES =
  /^@(media|supports|layer|container|scope|document|keyframes|-\w+-keyframes)\b/i;

const stripComments = (input: string): string => input.replace(/\/\*[\s\S]*?\*\//g, '');

export function parseCss(source: string): Node[] {
  let index = 0;

  const skipWhitespaceAndComments = (): void => {
    while (index < source.length) {
      if (/\s/.test(source[index])) {
        index += 1;
        continue;
      }
      if (source[index] === '/' && source[index + 1] === '*') {
        const end = source.indexOf('*/', index + 2);
        index = end === -1 ? source.length : end + 2;
        continue;
      }
      break;
    }
  };

  /** Reads raw text up to the next `{`, `;` or `}` that is not inside a string or parentheses. */
  const readUntilBlockBoundary = (): string => {
    const start = index;
    let depth = 0;
    while (index < source.length) {
      const char = source[index];
      if (char === '"' || char === "'") {
        const end = source.indexOf(char, index + 1);
        index = end === -1 ? source.length : end + 1;
        continue;
      }
      if (char === '/' && source[index + 1] === '*') {
        const end = source.indexOf('*/', index + 2);
        index = end === -1 ? source.length : end + 2;
        continue;
      }
      if (char === '(') depth += 1;
      else if (char === ')') depth = Math.max(0, depth - 1);
      else if (depth === 0 && (char === '{' || char === ';' || char === '}')) break;
      index += 1;
    }
    return stripComments(source.slice(start, index)).trim();
  };

  /** Skips a balanced `{ ... }` block, starting on its opening brace. */
  const skipBlock = (): void => {
    let depth = 0;
    while (index < source.length) {
      const char = source[index];
      if (char === '"' || char === "'") {
        const end = source.indexOf(char, index + 1);
        index = end === -1 ? source.length : end + 1;
        continue;
      }
      if (char === '{') depth += 1;
      else if (char === '}') {
        depth -= 1;
        index += 1;
        if (depth <= 0) return;
        continue;
      }
      index += 1;
    }
  };

  const parseDeclarations = (): Declaration[] => {
    const declarations: Declaration[] = [];
    for (;;) {
      skipWhitespaceAndComments();
      if (index >= source.length) break;
      if (source[index] === '}') {
        index += 1;
        break;
      }
      const text = readUntilBlockBoundary();
      const terminator = source[index];
      if (terminator === '{') {
        skipBlock(); // nested block inside a declaration list - not relevant here
        continue;
      }
      if (terminator === ';') index += 1;
      if (text) {
        const colon = text.indexOf(':');
        if (colon !== -1) {
          declarations.push({
            prop: text.slice(0, colon).trim(),
            value: text
              .slice(colon + 1)
              .trim()
              .replace(/\s+/g, ' '),
          });
        }
      }
      if (terminator === '}') {
        index += 1;
        break;
      }
    }
    return declarations;
  };

  const parseNodes = (nested: boolean): Node[] => {
    const nodes: Node[] = [];
    for (;;) {
      skipWhitespaceAndComments();
      if (index >= source.length) break;
      if (source[index] === '}') {
        index += 1;
        if (nested) return nodes;
        continue;
      }
      const prelude = readUntilBlockBoundary();
      if (index >= source.length) break;
      if (source[index] === ';' || source[index] === '}') {
        index += 1;
        continue; // statement at-rule such as @import, or a stray brace
      }
      index += 1; // consume `{`
      if (NESTING_AT_RULES.test(prelude)) {
        nodes.push({
          type: 'atrule',
          prelude: prelude.replace(/\s+/g, ' '),
          children: parseNodes(true),
        });
      } else {
        nodes.push({ type: 'rule', selector: prelude, declarations: parseDeclarations() });
      }
    }
    return nodes;
  };

  return parseNodes(false);
}

/** Splits a selector list into its normalised, alphabetically sorted parts. */
export function selectorParts(selector: string): string[] {
  return selector
    .split(',')
    .map((part) => part.trim().replace(/\s+/g, ' '))
    .filter(Boolean)
    .sort();
}
