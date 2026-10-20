// The bundle carries no CSS and no fonts. Components render icons as
// <i class="ibkIcon">ChkM</i>, so consumers have to load @airluma/iconset/iconset.css
// (or @airluma/webcomponents/styles/all), otherwise the ligature shows as plain text.
// @airluma/webcomponents/all does both in one import.
import { warnIfIconsetMissing } from './helpers/check-iconset.ts';

warnIfIconsetMissing();

export * from './components-list.ts';
