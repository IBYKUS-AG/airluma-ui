import { LitElement, css, html, nothing } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { frameworkClasses } from './previewClasses';

/**
 * Storybook-only "Show code" box for the Layout pages. Wraps an example, keeps it
 * in the light DOM, and adds a collapsed toggle underneath that reveals the markup
 * of that one example.
 *
 * The snippet is serialised from the live DOM rather than kept as a second, hand
 * written copy of the markup, so it cannot drift out of step with what is rendered
 * directly above it.
 *
 * Same two deviations as `<layout-inspector>`, for the same reason - this is docs
 * tooling, not a design-system component: it is not an `ibk-` element, it is never
 * exported from `src/index.ts`, and it keeps its shadow root so the dark code panel
 * cannot leak a rule into the layout it is documenting.
 */

/** Rendered without a closing tag. */
const VOID_TAGS = new Set([
  'area',
  'base',
  'br',
  'col',
  'embed',
  'hr',
  'img',
  'input',
  'link',
  'meta',
  'source',
  'track',
  'wbr',
]);

/**
 * Docs wrappers that are walked through without being printed. Without this, a
 * story-level code box would serialise the per-row boxes nested inside it as
 * `<layout-code></layout-code>` and show nothing useful.
 */
const TRANSPARENT_TAGS = new Set(['layout-code', 'layout-inspector']);

type Token = { kind: 'punct' | 'tag' | 'attr' | 'value' | 'text'; text: string };
type Line = { indent: number; tokens: Token[] };

/** Elements, and text that is more than whitespace between tags. */
const isPrintable = (node: Node) =>
  node.nodeType === Node.ELEMENT_NODE ||
  (node.nodeType === Node.TEXT_NODE && !!(node as Text).data.trim());

/**
 * Drops the `outline` the inspector writes inline while an element is selected.
 * That highlight is a reading aid, not markup, and it must not end up in a snippet
 * someone copies. Everything else in the attribute is kept: an inline
 * `--ibk-sidebar-aside-size` is part of the primitive's API.
 */
const cleanStyle = (value: string) => {
  const kept = value
    .split(';')
    .map((declaration) => declaration.trim())
    .filter((declaration) => declaration && !/^outline(-offset)?\s*:/i.test(declaration));
  return kept.length ? `${kept.join('; ')};` : '';
};

const attrTokens = (el: Element): Token[] => {
  const tokens: Token[] = [];

  for (const attr of Array.from(el.attributes)) {
    let value = attr.value;

    if (attr.name === 'class') {
      const kept = frameworkClasses(el);
      if (!kept.length) continue;
      value = kept.join(' ');
    }

    if (attr.name === 'style') {
      value = cleanStyle(value);
      if (!value) continue;
    }

    tokens.push({ kind: 'attr', text: ` ${attr.name}` });
    // A boolean attribute renders with an empty value; printing `zebra` rather than
    // `zebra=""` is how it was authored.
    if (value !== '') {
      tokens.push({ kind: 'punct', text: '="' });
      tokens.push({ kind: 'value', text: value });
      tokens.push({ kind: 'punct', text: '"' });
    }
  }

  return tokens;
};

const serialize = (node: Node, indent: number, lines: Line[]) => {
  if (node.nodeType === Node.TEXT_NODE) {
    const text = (node as Text).data.replace(/\s+/g, ' ').trim();
    if (text) lines.push({ indent, tokens: [{ kind: 'text', text }] });
    return;
  }

  // Anything else - comment nodes, and in particular the markers Lit leaves
  // behind - is not markup anybody wrote.
  if (!(node instanceof Element)) return;

  const tag = node.localName;

  if (TRANSPARENT_TAGS.has(tag)) {
    Array.from(node.childNodes).forEach((child) => serialize(child, indent, lines));
    return;
  }

  const open: Token[] = [
    { kind: 'punct', text: '<' },
    { kind: 'tag', text: tag },
    ...attrTokens(node),
  ];
  const close: Token[] = [
    { kind: 'punct', text: '</' },
    { kind: 'tag', text: tag },
    { kind: 'punct', text: '>' },
  ];

  if (VOID_TAGS.has(tag)) {
    lines.push({ indent, tokens: [...open, { kind: 'punct', text: ' />' }] });
    return;
  }

  // A custom element is printed as its own tag and nothing more. Its children are
  // whatever the component rendered for itself, not layout anybody authored -
  // serialising `<ibk-table>` would otherwise dump the entire generated table.
  const children = tag.includes('-')
    ? []
    : Array.from(node.childNodes).filter((child) => isPrintable(child));

  if (!children.length) {
    lines.push({ indent, tokens: [...open, { kind: 'punct', text: '>' }, ...close] });
    return;
  }

  // Short text-only content stays on one line, the way it was written.
  if (children.every((child) => child.nodeType === Node.TEXT_NODE)) {
    const text = children
      .map((child) => (child as Text).data)
      .join('')
      .replace(/\s+/g, ' ')
      .trim();
    lines.push({
      indent,
      tokens: [...open, { kind: 'punct', text: '>' }, { kind: 'text', text }, ...close],
    });
    return;
  }

  lines.push({ indent, tokens: [...open, { kind: 'punct', text: '>' }] });
  children.forEach((child) => serialize(child, indent + 1, lines));
  lines.push({ indent, tokens: close });
};

const toText = (lines: Line[]) =>
  lines
    .map((line) => '  '.repeat(line.indent) + line.tokens.map((token) => token.text).join(''))
    .join('\n');

@customElement('layout-code')
export class LayoutCode extends LitElement {
  @state() private _open = false;

  /**
   * True when this box already contains per-example boxes, which makes its own
   * toggle redundant - a matrix story wraps every row in its own `layout-code`, and
   * a second button for "all the rows at once" is noise stacked under the first.
   *
   * Resolved from the slotted content rather than configured per story: the story
   * that needs the story-level button is exactly the story that has no per-example
   * ones, and that is something the DOM already knows.
   */
  @state() private _redundant = false;

  static styles = css`
    :host {
      display: block;
    }

    .bar {
      display: flex;
      justify-content: flex-end;
      margin-block-start: 0.25rem;
    }

    button {
      background-color: #fff;
      border: 1px solid #bdbdbd;
      border-radius: 0.375rem;
      color: #2e2e2e;
      cursor: pointer;
      font-family: 'Asap', sans-serif;
      font-size: 0.75rem;
      padding: 0.125rem 0.5rem;
    }

    button:hover {
      border-color: #6b6b6b;
    }

    button:focus-visible {
      outline: 2px solid #425563;
      outline-offset: 2px;
    }

    /* Dark panel, in the shape of Storybook's own source block. */
    .panel {
      background-color: #1b1b1d;
      border-radius: 0.375rem;
      margin-block-start: 0.25rem;
      overflow: hidden;
    }

    .panelBar {
      align-items: center;
      display: flex;
      gap: 0.5rem;
      justify-content: space-between;
      padding: 0.375rem 0.625rem;
    }

    .panelBar button {
      background-color: transparent;
      border-color: #444;
      color: #e6edf3;
    }

    .panelBar button:hover {
      border-color: #8b949e;
    }

    .note {
      color: #8b949e;
      font-family: 'Asap', sans-serif;
      font-size: 0.6875rem;
    }

    .code {
      font-family: ui-monospace, 'SFMono-Regular', 'Consolas', monospace;
      font-size: 0.75rem;
      line-height: 1.6;
      max-block-size: 26rem;
      overflow: auto;
      padding: 0 0.625rem 0.625rem;
    }

    /* Indentation is padding, not literal spaces. Emitting repeated spaces into the
       template would need white-space: pre to survive, and that would preserve the
       newlines and indentation of the template literal itself - every line would come
       out carrying the source file's own leading whitespace. Padding on the block also
       keeps a wrapped long line aligned under its opening tag. */
    .line {
      padding-inline-start: calc(var(--indent, 0) * 2ch);
    }

    .punct {
      color: #8b949e;
    }

    .tag {
      color: #79c0ff;
    }

    .attr {
      color: #7ee787;
    }

    .value {
      color: #a5d6ff;
    }

    .text {
      color: #e6edf3;
    }
  `;

  /** Serialises the slotted example. Recomputed on open, so it is always current. */
  private _lines(): Line[] {
    const lines: Line[] = [];
    Array.from(this.childNodes).forEach((child) => serialize(child, 0, lines));
    return lines;
  }

  private async _copy(text: string) {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // Blocked in some embedding contexts. The snippet is on screen and
      // selectable either way, so a failure needs no error state.
    }
  }

  private _renderPanel() {
    const lines = this._lines();
    const text = toText(lines);
    // Data reaches a component through property bindings, which leave no trace in
    // the DOM. Saying so is better than letting `<ibk-table zebra hover>` read as
    // the complete usage.
    const hasComponent = lines.some((line) =>
      line.tokens.some((token) => token.kind === 'tag' && token.text.startsWith('ibk-')),
    );

    return html`
      <div class="panel">
        <div class="panelBar">
          <span class="note">
            ${hasComponent
              ? 'Layout markup. Component data is passed as properties and is not part of the HTML.'
              : 'Layout markup, preview-only classes removed.'}
          </span>
          <button @click=${() => this._copy(text)}>Copy</button>
        </div>
        <div class="code">
          ${lines.map(
            (line) => html`
              <div class="line" style="--indent: ${line.indent};">
                ${line.tokens.map(
                  (token) => html`<span class="${token.kind}">${token.text}</span>`,
                )}
              </div>
            `,
          )}
        </div>
      </div>
    `;
  }

  /**
   * Re-checked on slotchange rather than once in render: the slotted content is
   * assigned by the parent template, so it is not guaranteed to be in place for the
   * element's first update.
   */
  private _onSlotChange = () => {
    this._redundant = !!this.querySelector('layout-code');
  };

  render() {
    return html`
      <slot @slotchange=${this._onSlotChange}></slot>
      ${this._redundant
        ? nothing
        : html`
            <div class="bar">
              <button
                aria-expanded=${this._open ? 'true' : 'false'}
                @click=${() => {
                  this._open = !this._open;
                }}
              >
                ${this._open ? 'Hide code' : 'Show code'}
              </button>
            </div>
            ${this._open ? this._renderPanel() : nothing}
          `}
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'layout-code': LayoutCode;
  }
}

/** Wraps one example in its own collapsed code box. */
export const withCode = (example: unknown) => html`<layout-code>${example}</layout-code>`;

/** Story decorator: gives every story one code box for its whole markup. */
export const withLayoutCode = (story: () => unknown) => html`<layout-code>${story()}</layout-code>`;
