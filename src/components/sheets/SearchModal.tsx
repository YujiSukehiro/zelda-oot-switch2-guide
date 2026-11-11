import { useEffect, useMemo, useRef, useState } from 'react';
import { Check, MapPin, Search, X } from 'lucide-react';
import {
  ALL_SECRETS,
  REGIONS,
  REGION_BY_ID,
  REQUIREMENTS,
  REQUIREMENT_BY_ID,
  REQUIREMENT_SOURCE_REGION,
  SECRET_BY_ID,
} from '../../data';
import { evaluateSecret } from '../../lib/gating';
import type { PlayerProgressState, UnifiedSecret } from '../../types/zelda';
import { SheetDialog } from './NoteBadge';
import './sheets.css';

export interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  state: PlayerProgressState;
  effectiveRequirements: Set<string>;
  onSelectRegion: (regionId: string) => void;
  onToggleSecret: (secretId: string, completed?: boolean) => void;
}

interface SearchResultEntry {
  id: string;
  kind: 'secret' | 'region' | 'requirement';
  title: string;
  subtitle: string;
  snippet: string;
  regionId: string;
  regionName: string;
  searchBlob: string;
  titleLower: string;
  secret?: UnifiedSecret;
}

function buildSearchCorpus(): SearchResultEntry[] {
  const entries: SearchResultEntry[] = [];

  for (const sec of ALL_SECRETS) {
    const regionName = REGION_BY_ID[sec.regionId]?.name ?? sec.regionId;
    // Include paired requirement notes if this secret is also a canonical song ID
    const pairedReq = REQUIREMENT_BY_ID[sec.id];
    const parts = [
      sec.id,
      sec.title,
      sec.subtitle ?? '',
      sec.category,
      regionName,
      sec.howToGet,
      sec.rewardText ?? '',
      sec.locationHint ?? '',
      sec.switch2Notes ?? '',
      sec.proTip ?? '',
      sec.buyer ?? '',
      pairedReq?.howToGet ?? '',
      pairedReq?.switch2Notes ?? '',
    ];

    entries.push({
      id: sec.id,
      kind: 'secret',
      title: sec.title,
      subtitle: `${sec.subtitle ?? sec.category} · ${regionName}`,
      snippet: sec.howToGet,
      regionId: sec.regionId,
      regionName,
      searchBlob: parts.join(' ').toLowerCase(),
      titleLower: sec.title.toLowerCase(),
      secret: sec,
    });
  }

  for (const reg of REGIONS) {
    const parts = [
      reg.id,
      reg.name,
      reg.kind,
      reg.biome,
      reg.summary,
      ...reg.switch2Highlights,
    ];
    entries.push({
      id: reg.id,
      kind: 'region',
      title: reg.name,
      subtitle: `${reg.kind === 'overworld' ? 'Overworld Region' : 'Dungeon / Hub'} · ${reg.biome}`,
      snippet: reg.summary,
      regionId: reg.id,
      regionName: reg.name,
      searchBlob: parts.join(' ').toLowerCase(),
      titleLower: reg.name.toLowerCase(),
    });
  }

  for (const req of REQUIREMENTS) {
    // Avoid colliding IDs with the 13 Ocarina songs already indexed in ALL_SECRETS
    if (SECRET_BY_ID[req.id]) continue;
    const sourceRegionId = REQUIREMENT_SOURCE_REGION[req.id] ?? 'kokiri-forest';
    const regionName = REGION_BY_ID[sourceRegionId]?.name ?? sourceRegionId;
    const parts = [
      req.id,
      req.name,
      req.category,
      regionName,
      req.howToGet,
      req.switch2Notes ?? '',
      ...(req.notes ?? []),
    ];
    entries.push({
      id: req.id,
      kind: 'requirement',
      title: req.name,
      subtitle: `Progression Gate (${req.category}) · Found in ${regionName}`,
      snippet: req.howToGet,
      regionId: sourceRegionId,
      regionName,
      searchBlob: parts.join(' ').toLowerCase(),
      titleLower: req.name.toLowerCase(),
    });
  }

  return entries;
}

const SEARCH_CORPUS: readonly SearchResultEntry[] = buildSearchCorpus();

function scoreEntry(entry: SearchResultEntry, normalizedQuery: string, tokens: string[]): number {
  for (const token of tokens) {
    if (!entry.searchBlob.includes(token)) {
      return -1;
    }
  }

  let score = 10;

  if (entry.id.toLowerCase() === normalizedQuery) {
    score += 120;
  }
  if (entry.titleLower === normalizedQuery) {
    score += 90;
  } else if (entry.titleLower.includes(normalizedQuery)) {
    score += 75;
  }

  if (entry.searchBlob.includes(normalizedQuery)) {
    score += 35;
  }

  for (const token of tokens) {
    if (entry.titleLower.includes(token)) {
      score += 18;
    }
  }

  // Prefer actionable collectibles & regions slightly ahead of abstract gate entries on ties
  if (entry.kind === 'secret') {
    score += 20;
  } else if (entry.kind === 'region') {
    score += 12;
  }

  return score;
}

export function SearchModal({
  isOpen,
  onClose,
  state,
  effectiveRequirements,
  onSelectRegion,
  onToggleSecret,
}: SearchModalProps) {
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setActiveIndex(0);
      queueMicrotask(() => {
        inputRef.current?.focus();
      });
    }
  }, [isOpen]);

  const results = useMemo(() => {
    const trimmed = query.trim().toLowerCase();
    if (!trimmed) {
      // Curated starter highlights when query is empty
      const featuredIds = [
        'bottle-01',
        'skr-20',
        'hp-05',
        'hp-06',
        'sw2-hall-of-fallen-foes',
        'gf-01',
        'kakariko-village',
        'hyrule-field',
      ];
      return featuredIds
        .map((id) => SEARCH_CORPUS.find((item) => item.id === id))
        .filter((item): item is SearchResultEntry => Boolean(item));
    }

    const tokens = trimmed.split(/\s+/).filter(Boolean);
    const matches: Array<{ entry: SearchResultEntry; score: number }> = [];

    for (const entry of SEARCH_CORPUS) {
      const s = scoreEntry(entry, trimmed, tokens);
      if (s > 0) {
        matches.push({ entry, score: s });
      }
    }

    matches.sort((a, b) => b.score - a.score || a.entry.title.localeCompare(b.entry.title));
    return matches.slice(0, 40).map((m) => m.entry);
  }, [query]);

  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  const jumpToResult = (entry: SearchResultEntry) => {
    onSelectRegion(entry.regionId);
    onClose();
  };

  return (
    <SheetDialog
      isOpen={isOpen}
      onClose={onClose}
      testId="search-modal"
      title={
        <>
          <Search size={18} aria-hidden="true" />
          <span>Global Hyrule Search</span>
        </>
      }
      subtitle="Search across all 232 collectibles, 34 regions & dungeons, and 66 progression items"
    >
      <div className="zelda-search-bar">
        <Search size={17} aria-hidden="true" style={{ color: 'var(--color-triforce)' }} />
        <input
          ref={inputRef}
          type="search"
          autoFocus
          className="zelda-search-input"
          data-testid="global-search-input"
          aria-label="Search secrets, regions, songs, and Switch 2 changes"
          placeholder='Try "Golden Bug", "Echo Gem", "Biggoron", "Hookshot", or "Kakariko"...'
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'ArrowDown') {
              e.preventDefault();
              setActiveIndex((prev) => (results.length > 0 ? (prev + 1) % results.length : 0));
            } else if (e.key === 'ArrowUp') {
              e.preventDefault();
              setActiveIndex((prev) =>
                results.length > 0 ? (prev - 1 + results.length) % results.length : 0,
              );
            } else if (e.key === 'Enter') {
              e.preventDefault();
              const target = results[activeIndex] ?? results[0];
              if (target) {
                jumpToResult(target);
              }
            }
          }}
        />
        {query.length > 0 ? (
          <button
            type="button"
            className="zelda-modal-close-btn"
            style={{ width: 26, height: 26 }}
            aria-label="Clear search query"
            onClick={() => {
              setQuery('');
              inputRef.current?.focus();
            }}
          >
            <X size={14} aria-hidden="true" />
          </button>
        ) : null}
      </div>

      <div className="zelda-section-eyebrow">
        <span>
          {query.trim()
            ? `${results.length} matching ${results.length === 1 ? 'result' : 'results'}`
            : 'Featured Switch 2 Remake Highlights'}
        </span>
        <span>Enter ↵ to jump to region</span>
      </div>

      {results.length === 0 ? (
        <div className="zelda-callout" data-testid="search-empty-state">
          No secrets, regions, or gear matched <strong>“{query}”</strong>. Try searching by item
          name, song, or region!
        </div>
      ) : (
        <div className="zelda-search-results" role="listbox" aria-label="Search results">
          {results.map((item, idx) => {
            const isSelected = idx === activeIndex;
            const evaluated = item.secret
              ? evaluateSecret(item.secret, state, effectiveRequirements)
              : null;
            const isDone = evaluated?.status === 'completed';

            return (
              <div
                key={`${item.kind}-${item.id}`}
                role="option"
                aria-selected={isSelected}
                className={`zelda-search-row ${
                  isSelected ? 'zelda-search-row--active' : ''
                }`.trim()}
              >
                <button
                  type="button"
                  className="zelda-search-row__main"
                  data-testid={`search-result-${item.id}`}
                  onClick={() => jumpToResult(item)}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      flexWrap: 'wrap',
                    }}
                  >
                    <strong style={{ fontSize: 'var(--text-sm)', color: 'var(--text-primary)' }}>
                      {item.title}
                    </strong>
                    {item.secret && item.secret.switch2Status !== 'classic' ? (
                      <span
                        className={`zelda-badge ${
                          item.secret.switch2Status === 'new-switch2'
                            ? 'zelda-badge--new'
                            : 'zelda-badge--updated'
                        }`}
                      >
                        {item.secret.switch2Status === 'new-switch2' ? 'NEW SW2' : 'UPDATED SW2'}
                      </span>
                    ) : null}
                    {evaluated ? (
                      <span
                        className={`zelda-badge ${
                          evaluated.status === 'completed' ||
                          evaluated.status === 'available-now'
                            ? 'zelda-badge--rupee'
                            : evaluated.status === 'available-via-alt'
                              ? 'zelda-badge--updated'
                              : ''
                        }`}
                      >
                        {evaluated.status === 'completed'
                          ? '✓ Completed'
                          : evaluated.status === 'available-now'
                            ? 'Ready Now'
                            : evaluated.status === 'available-via-alt'
                              ? 'Early Trick'
                              : evaluated.primaryBlockerLabel}
                      </span>
                    ) : (
                      <span className="zelda-badge">
                        {item.kind === 'region' ? 'Map Region' : 'Loadout Item'}
                      </span>
                    )}
                  </div>

                  <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-sapphire-text)' }}>
                    <MapPin
                      size={11}
                      style={{ display: 'inline', verticalAlign: '-1px', marginRight: 3 }}
                      aria-hidden="true"
                    />
                    {item.subtitle}
                  </span>

                  <span
                    style={{
                      fontSize: 'var(--text-xs)',
                      color: 'var(--text-secondary)',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}
                  >
                    {item.snippet}
                  </span>
                </button>

                {item.secret ? (
                  <button
                    type="button"
                    role="checkbox"
                    aria-checked={Boolean(isDone)}
                    className="zelda-check-btn"
                    data-testid={`search-check-${item.id}`}
                    aria-label={`Mark ${item.title} completed`}
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleSecret(item.id);
                    }}
                  >
                    <Check size={13} aria-hidden="true" />
                    <span>{isDone ? 'Done' : 'Check'}</span>
                  </button>
                ) : null}
              </div>
            );
          })}
        </div>
      )}
    </SheetDialog>
  );
}
