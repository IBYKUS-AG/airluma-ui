# @ides/fonts

Asap als Variable Font für das IBYKUS Design System — zwei Schnitte einer Familie
(aufrecht und kursiv), jeweils mit den Achsen `wght 100..900` und `wdth 75..125`.

## Verwendung

### npm

```js
import '@ides/fonts/fonts.css';
```

Die `@font-face`-Regeln laden die Dateien relativ aus `./assets/`; jeder Bundler
löst diese `url()` selbst auf. Einen `.`-Export gibt es bewusst nicht — es gibt
nichts als JS zu importieren, und `"." -> "./fonts.css"` würde zwar in Bundlern,
aber nicht in Node auflösen.

### CDN

```html
<link rel="stylesheet" href="https://<host>/ides/fonts/v1.0.0/fonts.css">
```

### Eigene Einbindung

```css
font-family: 'Asap', sans-serif;
```

Kursiv braucht **keine** eigene Familie: `font-style: italic` wählt automatisch
den kursiven Schnitt, es wird nie ein Faux-Italic synthetisiert.

## Lizenz

Asap steht unter der **SIL Open Font License, Version 1.1**.

> Copyright 2018 The Asap Project Authors (https://github.com/Omnibus-Type/Asap)

Die vollständige Lizenz liegt diesem Paket als [`OFL.txt`](./OFL.txt) bei (und
bytegleich als `LICENSE`, damit npm, GitLab und Lizenz-Scanner sie finden).

Was das praktisch heißt, wenn du diese Dateien weitergibst:

- **Weitergabe ist erlaubt**, einzeln oder gebündelt, kommerziell oder nicht.
- **Die Lizenz muss mitreisen.** Jede Kopie der Font-Dateien braucht die
  Copyright-Zeile und den OFL-Text daneben — als Datei, als lesbarer Header oder
  in den Metadaten. Deshalb steht der Hinweis zusätzlich im Kopf von `fonts.css`.
- **Die Schriften dürfen nicht für sich allein verkauft werden.**
- **Abgeleitete Fassungen bleiben unter der OFL.** Eine Formatkonvertierung
  (z. B. TTF → WOFF2) oder ein Subset ist bereits eine abgeleitete Fassung:
  erlaubt, aber sie muss die Lizenz ebenfalls mitführen.
- Asap deklariert **keinen Reserved Font Name**, eine abgeleitete Fassung darf
  den Familiennamen also behalten.

Das IBYKUS Design System selbst steht unter einer anderen Lizenz — siehe die
`LICENSE` im Repository-Root.
