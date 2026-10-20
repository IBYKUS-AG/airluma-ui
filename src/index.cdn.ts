// CDN entry: components only. CSS is bundled separately by scripts/build-cdn.js
// and shipped as ibykus-design-system.css for the consumer to <link> directly.
import { warnIfIconsetMissing } from './helpers/check-iconset.ts';

warnIfIconsetMissing();

export * from './components-list.ts';
