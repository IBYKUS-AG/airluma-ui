/**
 * Prefix of the Storybook-only preview styles in `LayoutPreview.css`.
 *
 * Every readout on the Layout pages hides these - the inspector and the code boxes
 * alike. They exist purely to make a primitive visible in the docs (the dashed
 * frames, the coloured dummy boxes) and are not part of IDES, so listing them would
 * offer a developer a class to copy that does not exist outside this Storybook.
 * Filtering on the prefix is exact rather than heuristic: `lp-` was reserved for
 * that namespace and nothing else uses it.
 *
 * Note that plenty of real IDES classes do NOT start with `ibk` - `elevated`,
 * `border`, `zebra`, `supportingText` - which is why this is an explicit exclude
 * list and not an `ibk` allow list.
 */
export const PREVIEW_PREFIX = 'lp-';

/** The element's classes with the docs-only preview styles removed. */
export const frameworkClasses = (el: Element) =>
  Array.from(el.classList).filter((name) => !name.startsWith(PREVIEW_PREFIX));
