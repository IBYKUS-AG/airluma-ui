/**
 * Warns once if the IBYKUS-Iconset stylesheet is missing. Without it, icons
 * render as plain text (e.g. "ChkM" instead of a checkmark) and nothing else
 * would tell the consumer why.
 *
 * iconset.css sets --ides-iconset-version on :root. The check waits for the
 * load event, so <link>ed stylesheets and the CSS a bundler adds at startup are
 * in place. It only reads, it never adds anything to the document.
 */
export function warnIfIconsetMissing(): void {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;

  const check = () => {
    const version = getComputedStyle(document.documentElement).getPropertyValue('--ides-iconset-version');
    if (!version.trim()) {
      console.warn(
        "[ides] The IBYKUS-Iconset stylesheet is not loaded, icons will render as text. " +
          "Add import '@airluma/webcomponents/styles/all' (or '@airluma/iconset/iconset.css'), " +
          "or import '@airluma/webcomponents/all' instead of '@airluma/webcomponents'."
      );
    }
  };

  if (document.readyState === 'complete') setTimeout(check);
  else window.addEventListener('load', check, { once: true });
}
