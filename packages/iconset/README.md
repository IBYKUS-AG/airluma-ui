# @airluma/iconset

Das IBYKUS-Iconset als Icon-Webfont, plus das kuratierte Icon-Manifest.

Icons werden als **Ligaturen** gesetzt, nicht über Klassennamen: der Ligaturname
steht im Textinhalt, die Klasse `.ibkIcon` schaltet die Schriftart um.

```html
<i class="ibkIcon">ChevRBig</i>
```

## Verwendung

### npm

```js
import '@airluma/iconset/iconset.css';        // woff2 -> woff -> ttf
import '@airluma/iconset/iconset.woff2.css';  // nur woff2, deutlich weniger zu hosten
```

Das Paket ist reines CSS plus Font-Dateien, ohne JS-Einstieg. Die Font wird als
eigene Datei geladen und vom Browser gecacht; das funktioniert auch unter einer
strikten Content Security Policy (kein Inline-`<style>`, keine `data:`-Fonts).

### CDN

```html
<link rel="stylesheet" href="https://<host>/ides/iconset/v1.0.0/iconset.css">
```

## Was im Paket liegt

| Datei | |
|---|---|
| `iconset.css` | `@font-face` mit voller Fallback-Kette + `.ibkIcon` |
| `iconset.woff2.css` | dasselbe, nur woff2 |
| `assets/IBYKUS-Iconset.{woff2,woff,ttf}` | die Font-Dateien |
| `icons.json` | kuratiertes Manifest, siehe unten |

Nicht ausgeliefert, aber im Repository: `IBYKUS-Iconset.eot` (nur IE ≤ 8) und
`source/IBYKUS-Iconset.svg` (die IcoMoon-Quelle, 1,9 MB — ihre Metadaten sind
die autoritative Quelle für Glyphennamen). Beide referenziert kein CSS.

## `icons.json`

Handkuratiert, nicht generiert: deutsche Spaltennamen (`SVG ID mit Bindestrichen`,
`Ligatur`, `Beschreibung`, `Übersetzung ins Englische`, `Version`) mit
Beschreibungen und der Information, seit welcher Iconset-Version es ein Icon
gibt. Die Font-Datei enthält mehr Glyphen als `icons.json` Einträge hat — das ist
so gewollt, dokumentiert ist die kuratierte Auswahl.

Die Datei lässt sich **nicht** aus dem Font regenerieren; die Kuratierung wäre
verloren.

## Versionen

Zwei Nummern, die nichts miteinander zu tun haben:

- die **Paketversion** (`package.json` → `version`) folgt dem Design System,
- die **Font-Version** (`package.json` → `ides.fontVersion`, aktuell `2.0`) ist
  die des Iconsets selbst. Sie steht genau an dieser einen Stelle;
  `check-version.js` prüft die Stylesheets dagegen und bricht bei Abweichung ab.

## Lizenz

Apache License 2.0, siehe [`LICENSE`](./LICENSE) und [`NOTICE`](./NOTICE).
