# AIRLUMA Web Components

Die Web Components von **AIRLUMA**, dem offenen Designsystem. Sie sind mit [Lit](https://lit.dev/) gebaut und laufen in jedem Webprojekt, unabhängig vom Framework.

Dokumentation, Gestaltungsregeln und Beispiele: **[Website von AIRLUMA](https://ibykus-ag.github.io/airluma-web/)**

> **Hinweis:** Dieses Repository ist ein öffentlicher Spiegel. Entwickelt wird in einem internen Repository; bei jedem Release wird der Stand hierher übertragen. Änderungen direkt in diesem Repository werden dabei überschrieben. Beiträge von außen können wir deshalb im Moment noch nicht annehmen. Wie du Fehler meldest oder etwas beiträgst, beschreiben wir, sobald der Ablauf feststeht. Sicherheitslücken meldest du schon jetzt wie in [SECURITY.md](SECURITY.md) beschrieben.

## Pakete

| Paket | Inhalt | Lizenz |
|---|---|---|
| `@airluma/webcomponents` | Web Components und CSS-Framework | Apache 2.0 |
| `@airluma/fonts` | Schrift Asap als variable Schrift | SIL OFL 1.1 |
| `@airluma/iconset` | Iconset als Webfont und `icons.json` | Apache 2.0 |

Alle drei Pakete gibt es auf [npmjs.com](https://www.npmjs.com/org/airluma).

## Verwendung

```bash
npm install @airluma/webcomponents
```

Ein Import registriert alle Komponenten und lädt Styles, Schrift und Icons:

```js
import '@airluma/webcomponents/all';
```

```html
<ibk-button label="Speichern" type="primary"></ibk-button>
```

Der Import braucht einen Bundler, der CSS-Importe aus JavaScript versteht (z. B. Vite, webpack, Rollup, Parcel oder esbuild). Ohne einen solchen Bundler, z. B. mit Angular CLI, geht es in zwei Schritten:

```js
import '@airluma/webcomponents';             // Komponenten registrieren
import '@airluma/webcomponents/styles/all';  // CSS-Framework, Schrift und Iconset
```

Die einzelnen Teile lassen sich auch getrennt einbinden:

```js
import '@airluma/webcomponents/styles';      // nur das CSS-Framework
import '@airluma/fonts/fonts.css';           // nur die Schrift Asap
import '@airluma/iconset/iconset.css';       // nur das Iconset
```

Das JavaScript-Bundle enthält keine Schriften. Fehlt das Iconset, erscheinen Icons als Klartext (z. B. „ChkM“ statt eines Häkchens), und die Komponenten melden das einmal in der Browser-Konsole.

### Ohne Build-Werkzeug

Die Pakete lassen sich auch direkt über ein öffentliches CDN wie [jsDelivr](https://www.jsdelivr.com/) einbinden, ohne Installation:

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@airluma/fonts@0.32/fonts.css">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@airluma/iconset@0.32/iconset.css">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@airluma/webcomponents@0.32/src/styles/ides.css">
<script type="module" src="https://cdn.jsdelivr.net/npm/@airluma/webcomponents@0.32/dist/ibykus-design-system.es.js"></script>

<ibk-button label="Speichern" type="primary"></ibk-button>
```

Die Versionsangabe `@0.32` lädt immer die neueste 0.32.x. Für den Produktivbetrieb empfiehlt sich eine feste Version wie `@0.32.1`.

**TypeScript und React (19+):** `import type {} from '@airluma/webcomponents/react';` einmal im Projekt liefert JSX-Typen für alle `<ibk-*>`-Elemente.

## Komponenten

Accordion, Badge, Banner, Bottom Navigation, Breadcrumb, Button, Card, Checkbox, Chip, Dialog, Dropdown, Fieldset, Figure, Input, Link, Meter, Navigation Menu Item, Pagination, Pagination Dots, Progress, Radio, Range Slider, Rating, Segmented Control, Select, Step Button, Step Button Bar, Switch, Table, Tabs, Textarea, Toast, Tooltip, Top Navigation.

Der Quellcode jeder Komponente liegt unter [`src/components/`](src/components/) als `ibk-<name>.ts`. Wie eine Komponente gestaltet ist und wann man sie einsetzt, beschreibt die jeweilige Seite unter [Komponenten](https://ibykus-ag.github.io/airluma-web/komponenten.html) auf der Website.

## Lokal entwickeln

Voraussetzung: Node.js 20.19 oder neuer (siehe `.nvmrc`).

```bash
npm ci
npm run storybook   # Storybook mit allen Komponenten auf Port 6006
npm run dev         # Vite-Dev-Server mit einer Übersichtsseite (index.html)
npm run build       # baut Asset-Pakete und Library nach dist/
npm run build:cdn   # eigenständiger CDN-Build nach dist-cdn/
npm test            # Tests mit Vitest im Browser
```

## Sicherheit

Sicherheitslücken bitte nicht öffentlich melden, sondern wie in [SECURITY.md](SECURITY.md) beschrieben.

## Lizenz

Die Web Components stehen unter der [Apache License 2.0](LICENSE), siehe auch [NOTICE](NOTICE). Die Schrift Asap ([`packages/fonts`](packages/fonts/)) steht unter der SIL Open Font License 1.1, das Iconset ([`packages/iconset`](packages/iconset/)) unter der Apache License 2.0. Code von Dritten in den ausgelieferten Bundles ist in [THIRD-PARTY-NOTICES.txt](THIRD-PARTY-NOTICES.txt) aufgeführt.

© 2023–2026 IBYKUS AG für Informationstechnologie
