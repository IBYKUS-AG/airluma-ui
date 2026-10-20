// The bundle carries no CSS and no fonts. Components render icons as
// <i class="ibkIcon">ChkM</i>, so consumers have to load @ides/iconset/iconset.css
// (or @ides/webcomponents/styles/all), otherwise the ligature shows as plain text.
// @ides/webcomponents/all does both in one import.
import { warnIfIconsetMissing } from './helpers/check-iconset.ts';

warnIfIconsetMissing();

export * from './components-list.ts';
