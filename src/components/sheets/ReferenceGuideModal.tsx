import { useEffect, useId, useMemo, useRef, useState } from 'react';
import {
  Compass,
  Coins,
  Fish,
  MapPin,
  Music,
  Radio,
  Search,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import {
  ECHO_GEM_GUIDE,
  FISHING_GUIDE_DATA,
  GROTTO_OPEN_METHODS,
  HIDDEN_GROTTOS_DIRECTORY,
  MANDATORY_RUPEE_BUDGETS,
  PIERRE_SETUP_REMINDER,
  REGION_BY_ID,
  SCARECROW_SPOTS,
  SHOP_VS_FREE_GEAR,
} from '../../data';
import type { GrottoOpenMethod } from '../../types/zelda';
import { SheetDialog } from './NoteBadge';
import './sheets.css';

export type ReferenceGuideTab = 'pierre' | 'grottos' | 'fishing' | 'gear';

export interface ReferenceGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectRegion: (regionId: string) => void;
  initialTab?: ReferenceGuideTab;
}

type PierreFilter = 'all' | 'overworld' | 'dungeon' | 'Hookshot' | 'Longshot';
type GrottoMethodFilter = 'all' | GrottoOpenMethod;

const TAB_ORDER: readonly ReferenceGuideTab[] = ['pierre', 'grottos', 'fishing', 'gear'];

function formatGrottoEra(era: 'child' | 'adult' | 'both' | 'cross-era'): string {
  if (era === 'child') return 'Child Only';
  if (era === 'adult') return 'Adult Only';
  if (era === 'cross-era') return 'Child → Adult';
  return 'Any Era';
}

export function ReferenceGuideModal({
  isOpen,
  onClose,
  onSelectRegion,
  initialTab,
}: ReferenceGuideModalProps) {
  const [activeTab, setActiveTab] = useState<ReferenceGuideTab>(initialTab ?? 'pierre');
  const [pierreFilter, setPierreFilter] = useState<PierreFilter>('all');
  const [grottoMethod, setGrottoMethod] = useState<GrottoMethodFilter>('all');
  const [grottoRegion, setGrottoRegion] = useState<string>('all');
  const [grottoQuery, setGrottoQuery] = useState<string>('');

  const grottoSearchId = useId();
  const grottoRegionSelectId = useId();
  const gearTableHeadingId = useId();
  const baseTabId = useId();

  const tabRefs = useRef<Record<ReferenceGuideTab, HTMLButtonElement | null>>({
    pierre: null,
    grottos: null,
    fishing: null,
    gear: null,
  });

  useEffect(() => {
    if (isOpen && initialTab) {
      setActiveTab(initialTab);
    }
  }, [isOpen, initialTab]);

  const filteredPierreSpots = useMemo(() => {
    return SCARECROW_SPOTS.filter((spot) => {
      if (pierreFilter === 'all') return true;
      if (pierreFilter === 'overworld' || pierreFilter === 'dungeon') {
        return spot.zoneKind === pierreFilter;
      }
      return spot.hookshotTier === pierreFilter;
    });
  }, [pierreFilter]);

  const grottoRegionOptions = useMemo(() => {
    const seen = new Set<string>();
    for (const entry of HIDDEN_GROTTOS_DIRECTORY) {
      seen.add(entry.regionId);
    }
    return Array.from(seen)
      .map((id) => ({ id, name: REGION_BY_ID[id]?.name ?? id }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, []);

  const filteredGrottos = useMemo(() => {
    const trimmed = grottoQuery.trim().toLowerCase();
    return HIDDEN_GROTTOS_DIRECTORY.filter((entry) => {
      if (grottoMethod !== 'all' && entry.openMethod !== grottoMethod) {
        return false;
      }
      if (grottoRegion !== 'all' && entry.regionId !== grottoRegion) {
        return false;
      }
      if (!trimmed) {
        return true;
      }
      const regionName = (REGION_BY_ID[entry.regionId]?.name ?? '').toLowerCase();
      const haystack = [
        entry.title,
        regionName,
        entry.openMethod,
        entry.rewardSummary,
        entry.locationAndSteps,
      ]
        .join(' ')
        .toLowerCase();
      return haystack.includes(trimmed);
    });
  }, [grottoMethod, grottoQuery, grottoRegion]);

  const tabId = (tab: ReferenceGuideTab) => `${baseTabId}-tab-${tab}`;
  const panelId = (tab: ReferenceGuideTab) => `${baseTabId}-panel-${tab}`;

  return (
    <SheetDialog
      isOpen={isOpen}
      onClose={onClose}
      testId="reference-guide-modal"
      size="wide"
      title={
        <>
          <Compass size={19} aria-hidden="true" />
          <span>Hyrule Field Guide — Pierre, Grottos, Fishing &amp; Rupees</span>
        </>
      }
      subtitle="Switch 2 Companion Reference: Scarecrow Hookshot Spots, Echo Gem Grottos, Hylian Loach & Free Gear"
    >
      {/* 4-Tab Accessible Navigation */}
      <div
        className="zelda-tablist zelda-tablist--underline"
        role="tablist"
        aria-label="Field guide reference sections"
        onKeyDown={(e) => {
          if (
            e.key !== 'ArrowRight' &&
            e.key !== 'ArrowLeft' &&
            e.key !== 'Home' &&
            e.key !== 'End'
          ) {
            return;
          }
          e.preventDefault();
          const idx = TAB_ORDER.indexOf(activeTab);
          let nextIdx = idx;
          if (e.key === 'ArrowRight') nextIdx = (idx + 1) % TAB_ORDER.length;
          if (e.key === 'ArrowLeft') nextIdx = (idx - 1 + TAB_ORDER.length) % TAB_ORDER.length;
          if (e.key === 'Home') nextIdx = 0;
          if (e.key === 'End') nextIdx = TAB_ORDER.length - 1;
          const nextTab = TAB_ORDER[nextIdx];
          setActiveTab(nextTab);
          tabRefs.current[nextTab]?.focus();
        }}
      >
        <button
          ref={(el) => {
            tabRefs.current.pierre = el;
          }}
          id={tabId('pierre')}
          type="button"
          role="tab"
          tabIndex={activeTab === 'pierre' ? 0 : -1}
          aria-selected={activeTab === 'pierre'}
          aria-controls={panelId('pierre')}
          className="zelda-tab zelda-tab--underline"
          data-testid="ref-tab-pierre"
          onClick={() => setActiveTab('pierre')}
        >
          <Music size={13} aria-hidden="true" />
          <span>Pierre Scarecrow ({SCARECROW_SPOTS.length})</span>
        </button>

        <button
          ref={(el) => {
            tabRefs.current.grottos = el;
          }}
          id={tabId('grottos')}
          type="button"
          role="tab"
          tabIndex={activeTab === 'grottos' ? 0 : -1}
          aria-selected={activeTab === 'grottos'}
          aria-controls={panelId('grottos')}
          className="zelda-tab zelda-tab--underline"
          data-testid="ref-tab-grottos"
          onClick={() => setActiveTab('grottos')}
        >
          <Radio size={13} aria-hidden="true" />
          <span>Grottos &amp; Echo Gem ({HIDDEN_GROTTOS_DIRECTORY.length})</span>
        </button>

        <button
          ref={(el) => {
            tabRefs.current.fishing = el;
          }}
          id={tabId('fishing')}
          type="button"
          role="tab"
          tabIndex={activeTab === 'fishing' ? 0 : -1}
          aria-selected={activeTab === 'fishing'}
          aria-controls={panelId('fishing')}
          className="zelda-tab zelda-tab--underline"
          data-testid="ref-tab-fishing"
          onClick={() => setActiveTab('fishing')}
        >
          <Fish size={13} aria-hidden="true" />
          <span>Fishing &amp; Loach</span>
        </button>

        <button
          ref={(el) => {
            tabRefs.current.gear = el;
          }}
          id={tabId('gear')}
          type="button"
          role="tab"
          tabIndex={activeTab === 'gear' ? 0 : -1}
          aria-selected={activeTab === 'gear'}
          aria-controls={panelId('gear')}
          className="zelda-tab zelda-tab--underline"
          data-testid="ref-tab-gear"
          onClick={() => setActiveTab('gear')}
        >
          <Coins size={13} aria-hidden="true" />
          <span>Smart Rupees &amp; Free Gear</span>
        </button>
      </div>

      {/* ====================================================================
          TAB 1: Pierre Scarecrow's Song Spots Directory
         ==================================================================== */}
      {activeTab === 'pierre' ? (
        <section
          id={panelId('pierre')}
          role="tabpanel"
          aria-labelledby={tabId('pierre')}
          className="zelda-ref-panel"
          data-testid="ref-panel-pierre"
        >
          <div className="zelda-callout zelda-callout--amber">
            <div className="zelda-callout__title">
              <Sparkles size={15} aria-hidden="true" />
              <span>Two-Step Bonooru &amp; Pierre Activation (Lake Hylia)</span>
            </div>
            <p style={{ margin: 0 }}>{PIERRE_SETUP_REMINDER.childStep}</p>
            <p style={{ margin: 0 }}>{PIERRE_SETUP_REMINDER.adultStep}</p>
            <p style={{ margin: 0, color: 'var(--text-muted)' }}>
              {PIERRE_SETUP_REMINDER.jabuNote}
            </p>
          </div>

          <div
            className="zelda-wing-pills"
            role="group"
            aria-label="Filter Pierre summon ledges"
          >
            {(
              [
                { id: 'all', label: `All Spots (${SCARECROW_SPOTS.length})` },
                { id: 'overworld', label: 'Overworld Only' },
                { id: 'dungeon', label: 'Dungeons Only' },
                { id: 'Hookshot', label: 'Standard Hookshot' },
                { id: 'Longshot', label: 'Requires Longshot' },
              ] as const
            ).map((opt) => (
              <button
                key={opt.id}
                type="button"
                className="zelda-tab"
                data-testid={`pierre-filter-${opt.id}`}
                aria-pressed={pierreFilter === opt.id}
                onClick={() => setPierreFilter(opt.id)}
              >
                {opt.label}
              </button>
            ))}
          </div>

          <div className="zelda-card-grid">
            {filteredPierreSpots.map((spot) => {
              const regionName = REGION_BY_ID[spot.regionId]?.name ?? spot.regionId;
              return (
                <article
                  key={spot.id}
                  className="zelda-sheet-card"
                  data-testid={`pierre-spot-${spot.id}`}
                >
                  <div className="zelda-sheet-card__top">
                    <div>
                      <h3 className="zelda-sheet-card__title">{spot.title}</h3>
                      <div className="zelda-card-badges">
                        <span className="zelda-badge">
                          {spot.zoneKind === 'dungeon' ? 'Dungeon' : 'Overworld'}
                        </span>
                        <span
                          className={`zelda-badge ${
                            spot.hookshotTier === 'Longshot'
                              ? 'zelda-badge--sapphire'
                              : 'zelda-badge--rupee'
                          }`}
                        >
                          {spot.hookshotTier}
                        </span>
                        <span className="zelda-badge">Adult Era</span>
                      </div>
                    </div>
                  </div>

                  <p className="zelda-sheet-card__desc">
                    <strong>Reward / Shortcut:</strong> {spot.reward}
                  </p>
                  <p className="zelda-sheet-card__desc">{spot.whereToStand}</p>

                  <div className="zelda-sheet-card__footer">
                    <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
                      {regionName}
                    </span>
                    <button
                      type="button"
                      className="zelda-link-btn"
                      data-testid={`pierre-jump-${spot.id}`}
                      onClick={() => {
                        onSelectRegion(spot.regionId);
                        onClose();
                      }}
                    >
                      <MapPin size={13} aria-hidden="true" />
                      <span>Open Area Map →</span>
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      ) : null}

      {/* ====================================================================
          TAB 2: Hidden Grottos & Switch 2 Echo Gem Directory
         ==================================================================== */}
      {activeTab === 'grottos' ? (
        <section
          id={panelId('grottos')}
          role="tabpanel"
          aria-labelledby={tabId('grottos')}
          className="zelda-ref-panel"
          data-testid="ref-panel-grottos"
        >
          <div className="zelda-callout zelda-callout--switch2" data-testid="echo-gem-callout">
            <div className="zelda-callout__title">
              <Radio size={15} aria-hidden="true" />
              <span>{ECHO_GEM_GUIDE.title}</span>
            </div>
            <p style={{ margin: 0 }}>{ECHO_GEM_GUIDE.summary}</p>
            <div className="zelda-echo-signals">
              <div className="zelda-echo-signal-card">
                <strong>🕷 {ECHO_GEM_GUIDE.skulltulaSignal.split(':')[0]}:</strong>
                <span>{ECHO_GEM_GUIDE.skulltulaSignal.split(':').slice(1).join(':')}</span>
              </div>
              <div className="zelda-echo-signal-card">
                <strong>🕳 {ECHO_GEM_GUIDE.grottoSignal.split(':')[0]}:</strong>
                <span>{ECHO_GEM_GUIDE.grottoSignal.split(':').slice(1).join(':')}</span>
              </div>
            </div>
          </div>

          <div
            role="search"
            className="zelda-filter-toolbar"
            aria-label="Filter hidden grottos"
          >
            <div className="zelda-filter-search-box">
              <Search size={15} aria-hidden="true" />
              <label htmlFor={grottoSearchId} className="zelda-sr-only">
                Search hidden grottos by reward, region, or method
              </label>
              <input
                id={grottoSearchId}
                type="search"
                className="zelda-filter-search-input"
                data-testid="grottos-search-input"
                autoCorrect="off"
                autoCapitalize="none"
                spellCheck={false}
                placeholder="Search grottos by reward, password, cow, or region..."
                value={grottoQuery}
                onChange={(e) => setGrottoQuery(e.target.value)}
              />
            </div>

            <div className="zelda-filter-toolbar__actions">
              <label htmlFor={grottoRegionSelectId} className="zelda-select-label">
                <span>Region:</span>
                <select
                  id={grottoRegionSelectId}
                  className="zelda-select-control"
                  data-testid="grottos-region-select"
                  value={grottoRegion}
                  onChange={(e) => setGrottoRegion(e.target.value)}
                >
                  <option value="all">All Regions ({HIDDEN_GROTTOS_DIRECTORY.length})</option>
                  {grottoRegionOptions.map((opt) => (
                    <option key={opt.id} value={opt.id}>
                      {opt.name}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </div>

          {/* How to Open Method Pills */}
          <div
            className="zelda-wing-pills"
            role="group"
            aria-label="Filter grottos by how to open"
          >
            <button
              type="button"
              className="zelda-tab"
              data-testid="grotto-method-all"
              aria-pressed={grottoMethod === 'all'}
              onClick={() => setGrottoMethod('all')}
            >
              All Methods ({HIDDEN_GROTTOS_DIRECTORY.length})
            </button>
            {GROTTO_OPEN_METHODS.map((method) => (
              <button
                key={method}
                type="button"
                className="zelda-tab"
                data-testid={`grotto-method-${method.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}
                aria-pressed={grottoMethod === method}
                onClick={() => setGrottoMethod(method)}
              >
                {method}
              </button>
            ))}
          </div>

          <div className="zelda-card-grid" data-testid="grottos-card-grid">
            {filteredGrottos.map((grotto) => {
              const regionName = REGION_BY_ID[grotto.regionId]?.name ?? grotto.regionId;
              return (
                <article
                  key={grotto.id}
                  className="zelda-sheet-card"
                  data-testid={`grotto-card-${grotto.id}`}
                >
                  <div className="zelda-sheet-card__top">
                    <div>
                      <h3 className="zelda-sheet-card__title">{grotto.title}</h3>
                      <div className="zelda-card-badges">
                        <span className="zelda-badge zelda-badge--sapphire">
                          Open: {grotto.openMethod}
                        </span>
                        <span className="zelda-badge">{formatGrottoEra(grotto.era)}</span>
                        {grotto.isSwitch2Changed ? (
                          <span className="zelda-badge zelda-badge--new">Switch 2 Remake</span>
                        ) : null}
                      </div>
                    </div>
                  </div>

                  <p className="zelda-sheet-card__desc">
                    <strong>Inside:</strong> {grotto.rewardSummary}
                  </p>
                  <p className="zelda-sheet-card__desc">{grotto.locationAndSteps}</p>

                  <div className="zelda-sheet-card__footer">
                    <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
                      {regionName}
                    </span>
                    <button
                      type="button"
                      className="zelda-link-btn"
                      data-testid={`grotto-jump-${grotto.id}`}
                      onClick={() => {
                        onSelectRegion(grotto.regionId);
                        onClose();
                      }}
                    >
                      <MapPin size={13} aria-hidden="true" />
                      <span>Open Area Map →</span>
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      ) : null}

      {/* ====================================================================
          TAB 3: Lake Hylia Fishing Pond & Hylian Loach Guide
         ==================================================================== */}
      {activeTab === 'fishing' ? (
        <section
          id={panelId('fishing')}
          role="tabpanel"
          aria-labelledby={tabId('fishing')}
          className="zelda-ref-panel"
          data-testid="ref-panel-fishing"
        >
          <div className="zelda-callout zelda-callout--sapphire">
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '0.5rem',
              }}
            >
              <div className="zelda-callout__title">
                <Fish size={15} aria-hidden="true" />
                <span>Lake Hylia Fishing Hole — Mandatory 100% Prizes &amp; Loach Trophy</span>
              </div>
              <button
                type="button"
                className="zelda-link-btn"
                data-testid="fishing-jump-lake-hylia"
                onClick={() => {
                  onSelectRegion('lake-hylia');
                  onClose();
                }}
              >
                <MapPin size={13} aria-hidden="true" />
                <span>Open Lake Hylia Map →</span>
              </button>
            </div>
            <p style={{ margin: 0 }}>
              Crucial order tip: Catch your <strong>Child 10+ lb Heart Piece</strong> BEFORE pulling
              the Master Sword or anytime via Time Travel—each era tracks its own separate pond
              record for 20 Rupees per session!
            </p>
          </div>

          {/* Child vs Adult Prize Tiers */}
          <div className="zelda-card-grid">
            {FISHING_GUIDE_DATA.prizes.map((tier) => (
              <article
                key={tier.era}
                className="zelda-sheet-card"
                data-testid={`fishing-tier-${tier.era}`}
              >
                <div className="zelda-sheet-card__top">
                  <div>
                    <h3 className="zelda-sheet-card__title">{tier.label}</h3>
                    <div className="zelda-card-badges">
                      <span className="zelda-badge zelda-badge--rupee">
                        Reward: {tier.reward}
                      </span>
                      <span className="zelda-badge">Target: {tier.targetWeight}</span>
                      <span className="zelda-badge">{tier.entryFeeRupees} Rupees</span>
                    </div>
                  </div>
                </div>
                <p className="zelda-sheet-card__desc">{tier.bestCastSpot}</p>
              </article>
            ))}
          </div>

          {/* All 4 Sinking Lure Hidden Spawn Spots */}
          <div className="zelda-callout zelda-callout--amber" data-testid="sinking-lure-section">
            <div className="zelda-callout__title">
              <Sparkles size={15} aria-hidden="true" />
              <span>All 4 Hidden Sinking Lure Spawn Spots</span>
            </div>
            <p style={{ margin: 0 }}>{FISHING_GUIDE_DATA.sinkingLureUnlock}</p>

            <div className="zelda-card-grid" style={{ marginTop: '0.45rem' }}>
              {FISHING_GUIDE_DATA.sinkingLureSpots.map((spot) => (
                <div
                  key={spot.id}
                  className="zelda-sheet-card"
                  data-testid={`sinking-lure-${spot.id}`}
                >
                  <h4 className="zelda-sheet-card__title">{spot.title}</h4>
                  <span className="zelda-badge" style={{ alignSelf: 'flex-start' }}>
                    {spot.landmark}
                  </span>
                  <p className="zelda-sheet-card__desc">{spot.howToSpot}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Legendary Hylian Loach & Switch 2 Gyro Reel Tips */}
          <article className="zelda-sheet-card" data-testid="hylian-loach-guide">
            <div className="zelda-sheet-card__top">
              <div>
                <h3 className="zelda-sheet-card__title">
                  Legendary Hylian Loach ({FISHING_GUIDE_DATA.loachGuide.weightRange})
                </h3>
                <div className="zelda-card-badges">
                  <span className="zelda-badge zelda-badge--new">
                    {FISHING_GUIDE_DATA.loachGuide.reward}
                  </span>
                </div>
              </div>
            </div>

            <p className="zelda-sheet-card__desc">
              <strong>Spawn Conditions:</strong> {FISHING_GUIDE_DATA.loachGuide.spawnConditions}
            </p>
            <p className="zelda-sheet-card__desc">
              <strong>How to Spot It:</strong> {FISHING_GUIDE_DATA.loachGuide.visualCue}
            </p>

            <div className="zelda-loach-tips">
              <strong style={{ fontSize: 'var(--text-xs)', color: 'var(--color-triforce)' }}>
                Switch 2 Gyro &amp; HD Rumble 2 Reel Technique:
              </strong>
              <ol className="zelda-loach-tips__list">
                {FISHING_GUIDE_DATA.loachGuide.switch2GyroTips.map((tip, idx) => (
                  <li key={idx}>{tip}</li>
                ))}
              </ol>
            </div>
          </article>
        </section>
      ) : null}

      {/* ====================================================================
          TAB 4: Smart Rupee & Free-Gear Cheat Sheet
         ==================================================================== */}
      {activeTab === 'gear' ? (
        <section
          id={panelId('gear')}
          role="tabpanel"
          aria-labelledby={tabId('gear')}
          className="zelda-ref-panel"
          data-testid="ref-panel-gear"
        >
          <div className="zelda-callout zelda-callout--emerald">
            <div className="zelda-callout__title">
              <ShieldCheck size={15} aria-hidden="true" />
              <span id={gearTableHeadingId}>
                Never Overpay at Hyrule Shops — Free Gear vs. Shop Trap Prices
              </span>
            </div>
            <p style={{ margin: 0 }}>
              Skip over <strong>900+ Rupees</strong> in shop traps so your wallet stays stocked for
              Switch 2’s mandatory <strong>1,175-Rupee Great Fairy</strong> offerings and{' '}
              <strong>550-Rupee Magic Bean</strong> circuit!
            </p>
          </div>

          <div
            className="zelda-table-wrapper"
            role="region"
            aria-labelledby={gearTableHeadingId}
            tabIndex={0}
          >
            <table className="zelda-ref-table" data-testid="free-gear-table">
              <caption className="zelda-sr-only">
                Comparison of Hyrule shop prices versus free in-world locations
              </caption>
              <thead>
                <tr>
                  <th scope="col">Gear / Item</th>
                  <th scope="col">Shop Trap Price</th>
                  <th scope="col">Free / Smart Route</th>
                  <th scope="col">Where &amp; Why</th>
                  <th scope="col">Area Map</th>
                </tr>
              </thead>
              <tbody>
                {SHOP_VS_FREE_GEAR.map((entry) => {
                  const regionName = REGION_BY_ID[entry.regionId]?.name ?? entry.regionId;
                  return (
                    <tr key={entry.id} data-testid={`gear-row-${entry.id}`}>
                      <th scope="row" data-label="Gear / Item">
                        {entry.item}
                      </th>
                      <td data-label="Shop Price">
                        <span className="zelda-badge zelda-badge--timer">
                          {entry.shopPriceLabel}
                        </span>
                      </td>
                      <td data-label="Free Route">
                        <span className="zelda-badge zelda-badge--rupee">
                          {entry.freeOrSmartAlternative}
                        </span>
                      </td>
                      <td data-label="How to Claim">
                        <div>{entry.howToClaimFree}</div>
                        <small style={{ color: 'var(--text-muted)' }}>{entry.savingsNote}</small>
                      </td>
                      <td data-label="Map">
                        <button
                          type="button"
                          className="zelda-link-btn"
                          data-testid={`gear-jump-${entry.id}`}
                          onClick={() => {
                            onSelectRegion(entry.regionId);
                            onClose();
                          }}
                        >
                          <MapPin size={13} aria-hidden="true" />
                          <span>{regionName} →</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <h3
            style={{
              margin: '0.25rem 0 0',
              fontSize: 'var(--text-base)',
              color: 'var(--color-triforce)',
            }}
          >
            Mandatory 100% Rupee Budgets (Save Your Rupees For These!)
          </h3>

          <div className="zelda-card-grid" data-testid="mandatory-budgets-grid">
            {MANDATORY_RUPEE_BUDGETS.map((budget) => {
              const regionName = REGION_BY_ID[budget.regionId]?.name ?? budget.regionId;
              return (
                <article
                  key={budget.id}
                  className="zelda-sheet-card"
                  data-testid={`budget-card-${budget.id}`}
                >
                  <div className="zelda-sheet-card__top">
                    <h4 className="zelda-sheet-card__title">{budget.title}</h4>
                    <span className="zelda-badge zelda-badge--new">
                      {budget.totalRupees.toLocaleString()} Rupees
                    </span>
                  </div>
                  <p className="zelda-sheet-card__desc">{budget.breakdown}</p>
                  <p className="zelda-sheet-card__desc">
                    <strong>Smart Funding Tip:</strong> {budget.smartTip}
                  </p>
                  <div className="zelda-sheet-card__footer">
                    <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
                      {regionName}
                    </span>
                    <button
                      type="button"
                      className="zelda-link-btn"
                      data-testid={`budget-jump-${budget.id}`}
                      onClick={() => {
                        onSelectRegion(budget.regionId);
                        onClose();
                      }}
                    >
                      <MapPin size={13} aria-hidden="true" />
                      <span>Open Area Map →</span>
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      ) : null}
    </SheetDialog>
  );
}
