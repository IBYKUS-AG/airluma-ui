# Airluma Web Components

Die Web Components von **Airluma**, dem offenen Designsystem. Sie sind mit [Lit](https://lit.dev/) gebaut und laufen in jedem Webprojekt, unabhängig vom Framework.

Dokumentation, Gestaltungsregeln und Beispiele: **[www.airluma.de](https://www.airluma.de)**

> **Hinweis:** Dieses Repository ist ein öffentlicher Spiegel. Entwickelt wird in einem internen Repository; bei jedem Release wird der Stand hierher übertragen. Änderungen direkt in diesem Repository werden dabei überschrieben. Wie du Fehler meldest oder etwas beiträgst, steht künftig auf [www.airluma.de](https://www.airluma.de).

## Pakete

| Paket | Inhalt | Lizenz |
|---|---|---|
| `@ides/webcomponents` | Web Components und CSS-Framework | Apache 2.0 |
| `@ides/fonts` | Schrift Asap als variable Schrift | SIL OFL 1.1 |
| `@ides/iconset` | Iconset als Webfont und `icons.json` | Apache 2.0 |

Die Pakete werden zum Start von Airluma auf [npmjs.com](https://www.npmjs.com/) veröffentlicht.

## Verwendung

```bash
npm install @ides/webcomponents
```

Ein Import registriert alle Komponenten und lädt Styles, Schrift und Icons:

```js
import '@ides/webcomponents/all';
```

```html
<ibk-button label="Speichern" type="primary"></ibk-button>
```

Der Import braucht einen Bundler, der CSS-Importe aus JavaScript versteht (z. B. Vite, webpack, Rollup, Parcel oder esbuild). Ohne einen solchen Bundler, z. B. mit Angular CLI, geht es in zwei Schritten:

```js
import '@ides/webcomponents';             // Komponenten registrieren
import '@ides/webcomponents/styles/all';  // CSS-Framework, Schrift und Iconset
```

Die einzelnen Teile lassen sich auch getrennt einbinden:

```js
import '@ides/webcomponents/styles';      // nur das CSS-Framework
import '@ides/fonts/fonts.css';           // nur die Schrift Asap
import '@ides/iconset/iconset.css';       // nur das Iconset
```

Das JavaScript-Bundle enthält keine Schriften. Fehlt das Iconset, erscheinen Icons als Klartext (z. B. „ChkM“ statt eines Häkchens), und die Komponenten melden das einmal in der Browser-Konsole.

**TypeScript und React (19+):** `import type {} from '@ides/webcomponents/react';` einmal im Projekt liefert JSX-Typen für alle `<ibk-*>`-Elemente.

## Komponenten

Accordion, Badge, Banner, Bottom Navigation, Breadcrumb, Button, Card, Checkbox, Chip, Dialog, Dropdown, Fieldset, Figure, Input, Link, Meter, Navigation Menu Item, Pagination, Pagination Dots, Progress, Radio, Range Slider, Rating, Segmented Control, Select, Step Button, Step Button Bar, Switch, Table, Tabs, Textarea, Toast, Tooltip, Top Navigation.

Der Quellcode jeder Komponente liegt unter [`src/components/`](src/components/) als `ibk-<name>.ts`. Wie eine Komponente gestaltet ist und wann man sie einsetzt, beschreibt die jeweilige Seite auf [www.airluma.de](https://www.airluma.de).

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

## Lizenz

Die Web Components stehen unter der [Apache License 2.0](LICENSE), siehe auch [NOTICE](NOTICE). Die Schrift Asap ([`packages/fonts`](packages/fonts/)) steht unter der SIL Open Font License 1.1, das Iconset ([`packages/iconset`](packages/iconset/)) unter der Apache License 2.0. Code von Dritten in den ausgelieferten Bundles ist in [THIRD-PARTY-NOTICES.txt](THIRD-PARTY-NOTICES.txt) aufgeführt.

© 2023–2026 IBYKUS AG für Informationstechnologie
