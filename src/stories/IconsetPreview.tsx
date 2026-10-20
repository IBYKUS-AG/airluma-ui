import React, { useEffect, useMemo, useRef, useState } from 'react';
import iconData from '@airluma/iconset/icons.json';
import iconsJsonUrl from '@airluma/iconset/icons.json?url';
import '../components/ibk-card';
import './IconsetPreview.css';

/**
 * Port of the standalone "Iconset Preview" pages (index.html + detail.html) into Storybook.
 * The overview grid and the icon detail view are rendered as two states of one component
 * instead of two separate documents, so no page navigation is needed inside the docs iframe.
 */

/** Icons rendered per batch, both for the initial grid and each time the scroll sentinel fires. */
const BATCH_SIZE = 120;

type IconEntry = {
  'SVG ID mit Bindestrichen': string;
  Codepoint: string;
  'Hex als Dez': string;
  Ligatur: string;
  'Ligatur 2': string;
  Beschreibung: string;
  'Übersetzung ins Englische': string;
  Version: string;
};

const icons = iconData as IconEntry[];

/** Vite emits the untouched icons.json as an asset and gives us its URL, so
 *  "JSON laden" hands out the source file rather than a re-serialised copy. */
const JSON_URL = iconsJsonUrl;

const charOf = (icon: IconEntry) => String.fromCodePoint(parseInt(icon.Codepoint, 16));

const IconDetail = ({ icon, onBack }: { icon: IconEntry; onBack: () => void }) => {
  const [copied, setCopied] = useState<string | null>(null);

  const hex = icon.Codepoint;
  const id = icon['SVG ID mit Bindestrichen'];
  const ligatures = [icon.Ligatur, icon['Ligatur 2']].filter(Boolean).join(', ');

  const copyToClipboard = (key: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied((current) => (current === key ? null : current)), 1200);
  };

  const CopyCell = ({
    copyKey,
    value,
    children,
  }: {
    copyKey: string;
    value: string;
    children: React.ReactNode;
  }) => (
    <td onClick={() => copyToClipboard(copyKey, value)}>
      {children}{' '}
      <span className="ibkChip passive info">
        <span className="ibkChipText copy-badge">
          {copied === copyKey ? 'Kopiert!' : 'Kopieren'}
        </span>
      </span>
    </td>
  );

  return (
    <div className="ibkIconsetPreview">
      <nav className="ibkBreadcrumb single" aria-label="Breadcrumb">
        <span className="breadcrumb-element">
          <i className="ibkIcon" aria-hidden="true">
            {''}
          </i>
          <a
            className="ibkLink ibkLink-regular"
            href="#"
            onClick={(event) => {
              event.preventDefault();
              onBack();
            }}
          >
            <span className="ibkLinkText">Zurück zur Übersicht</span>
          </a>
        </span>
      </nav>

      <h1 className="detail-title">{id}</h1>

      <div className="detail-layout ibk-sidebar ibk-sidebar-aside-first">
        <div className="ibkIcon big-preview ibk-sidebar-aside">{charOf(icon)}</div>

        <table className="info-table ibk-sidebar-main">
          <tbody>
            <tr>
              <th>SVG-ID</th>
              <td>{id}</td>
            </tr>
            <tr>
              <th>Beschreibung (DE)</th>
              <td>{icon.Beschreibung}</td>
            </tr>
            <tr>
              <th>Beschreibung (EN)</th>
              <td>{icon['Übersetzung ins Englische']}</td>
            </tr>
            <tr>
              <th>Unicode Hex</th>
              <td>U+{hex.toUpperCase()}</td>
            </tr>
            <tr>
              <th>Unicode Dezimal</th>
              <td>{icon['Hex als Dez']}</td>
            </tr>
            <tr>
              <th>Ligaturen</th>
              <td>{ligatures}</td>
            </tr>
            <tr>
              <th>Seit Version</th>
              <td>{icon.Version}</td>
            </tr>
            <tr>
              <th>HTML Entity</th>
              <CopyCell copyKey="entity" value={`&#x${hex};`}>
                &amp;#x{hex};
              </CopyCell>
            </tr>
            <tr>
              <th>CSS Content</th>
              <CopyCell copyKey="css" value={`content: "\\${hex}";`}>
                content: "\{hex}";
              </CopyCell>
            </tr>
            <tr>
              <th>Icon-Tag</th>
              <CopyCell copyKey="tag" value={`<i class="ibkIcon">&#x${hex};</i>`}>
                &lt;i class="ibkIcon"&gt;&amp;#x{hex};&lt;/i&gt;
              </CopyCell>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export const IconsetPreview = () => {
  const [selected, setSelected] = useState<IconEntry | null>(null);
  const [search, setSearch] = useState('');
  const [version, setVersion] = useState('');
  /** Filters are applied on submit (button / Enter), mirroring `applyFilters()` in index.html. */
  const [filters, setFilters] = useState({ search: '', version: '' });

  const versions = useMemo(() => [...new Set(icons.map((i) => i.Version))].sort(), []);

  const filtered = useMemo(() => {
    const query = filters.search.toLowerCase();
    return icons.filter((icon) => {
      const matchesSearch = Object.values(icon).some(
        (value) => value && value.toLowerCase().includes(query),
      );
      const matchesVersion = filters.version === '' || icon.Version === filters.version;
      return matchesSearch && matchesVersion;
    });
  }, [filters]);

  const [visibleCount, setVisibleCount] = useState(BATCH_SIZE);
  const sentinelRef = useRef<HTMLDivElement>(null);

  /** New filter results start from the first batch again instead of staying expanded. */
  useEffect(() => {
    setVisibleCount(BATCH_SIZE);
  }, [filtered]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        setVisibleCount((count) => Math.min(count + BATCH_SIZE, filtered.length));
      }
    });

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [filtered]);

  const visibleIcons = filtered.slice(0, visibleCount);

  const applyFilters = () => setFilters({ search, version });

  const resetFilters = () => {
    setSearch('');
    setVersion('');
    setFilters({ search: '', version: '' });
  };

  const downloadJson = () => {
    const link = document.createElement('a');
    link.href = JSON_URL;
    link.download = 'IBYKUS-Iconset.json';
    link.click();
  };

  return (
    <>
      {selected ? (
        <IconDetail icon={selected} onBack={() => setSelected(null)} />
      ) : (
        <div className="ibkIconsetPreview">
          <div id="formular" className="ibk-cluster gap-spacing-8">
            <span className="ibkSelect">
              <span className="ibkSelectWrapper">
                <select
                  name="version"
                  id="version"
                  value={version}
                  tabIndex={1}
                  onChange={(event) => {
                    setVersion(event.target.value);
                    setFilters({ search, version: event.target.value });
                  }}
                >
                  <option value="">Alle Versionen</option>
                  {versions.map((v) => (
                    <option key={v} value={v}>
                      {v}
                    </option>
                  ))}
                </select>
                <i className="ibkIcon dropdown-icon">ChevD</i>
              </span>
            </span>

            <i className="ibkIcon filter-separator" aria-hidden="true">
              ArrwLR
            </i>

            <span className="ibkInputText info-icon func-1 ibk-cluster-grow">
              {/* `.ibkInputWrapper` is what makes the ides CSS position the search and reset
                  icons absolutely over the input; without it they stack below it. */}
              <span className="ibkInputWrapper">
                <input
                  type="text"
                  name="search"
                  id="search"
                  value={search}
                  placeholder="Suchbegriff eingeben"
                  tabIndex={2}
                  onChange={(event) => setSearch(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                      event.preventDefault();
                      applyFilters();
                    }
                  }}
                />
                <i className="ibkIcon info-icon">&#x1f50d;</i>
                <i
                  className="ibkIcon func first reset-icon"
                  role="button"
                  tabIndex={3}
                  title="Filter zurücksetzen"
                  onClick={resetFilters}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault();
                      resetFilters();
                    }
                  }}
                >
                  &#x232b;
                </i>
              </span>
            </span>

            <button
              className="ibkButton ibkButton-regular ibkButton-primary"
              type="submit"
              tabIndex={4}
              onClick={applyFilters}
            >
              <span className="ibkButtonText">Icon finden</span>
            </button>

            <button
              className="ibkButton ibkButton-regular ibkButton-secondary"
              id="downloadJson"
              type="submit"
              tabIndex={5}
              onClick={downloadJson}
            >
              <span className="ibkButtonText">JSON laden</span>
            </button>
          </div>

          <div className="grid ibk-auto-grid ibk-auto-grid-fill gap-spacing-16">
            {visibleIcons.map((icon) => (
              <ibk-card
                variant="filled"
                delta="2"
                class="icon-card"
                // Keyed by codepoint, not SVG-ID: a handful of IDs occur twice in icons.json
                // (e.g. Arrow-Triangle-Left), while the codepoints are unique.
                key={icon.Codepoint}
                role="button"
                tabIndex={0}
                onClick={() => setSelected(icon)}
                onKeyDown={(event: React.KeyboardEvent) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    setSelected(icon);
                  }
                }}
              >
                <span className="icon-symbol">{charOf(icon)}</span>
                <div className="icon-name">{icon['SVG ID mit Bindestrichen']}</div>
              </ibk-card>
            ))}
          </div>

          {/* Loading the next batch of BATCH_SIZE icons when this scrolls into view. */}
          {visibleCount < filtered.length && <div ref={sentinelRef} className="scroll-sentinel" />}
        </div>
      )}
    </>
  );
};
