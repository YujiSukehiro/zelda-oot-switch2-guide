import { useId, useMemo, useRef, useState } from 'react';
import {
  AlertTriangle,
  Award,
  Check,
  CheckCheck,
  MapPin,
  Search,
  ShieldAlert,
  Sparkles,
  Swords,
  Trophy,
} from 'lucide-react';
import {
  BOSS_RUSH_GAUNTLETS,
  FOE_GALLERY_WINGS,
  HALL_OF_FALLEN_FOES_STATUES,
  METADATA,
  REGION_BY_ID,
} from '../../data';
import type {
  BossRushMedal,
  FoeGalleryWing,
  PlayerProgressState,
} from '../../types/zelda';
import { SheetDialog } from './NoteBadge';
import './sheets.css';

export interface HallOfFallenFoesModalProps {
  isOpen: boolean;
  onClose: () => void;
  completedFoeStatueIds?: Record<string, boolean>;
  bossRushMedals?: Record<string, BossRushMedal>;
  state?: PlayerProgressState;
  onToggleFoeStatue: (statueId: string, completed?: boolean) => void;
  onSetBossRushMedal: (gauntletId: string, medal: BossRushMedal) => void;
  onSelectRegion: (regionId: string) => void;
  onToggleSecret?: (secretId: string, completed?: boolean) => void;
}

type FoesModalTab = 'statues' | 'boss-rush';
type WingFilter = 'all' | FoeGalleryWing;

const MEDAL_OPTIONS: ReadonlyArray<{
  id: BossRushMedal;
  label: string;
}> = [
  { id: 'none', label: 'No Medal' },
  { id: 'bronze', label: 'Bronze' },
  { id: 'silver', label: 'Silver' },
  { id: 'gold', label: 'Gold' },
  { id: 'master', label: 'Master' },
];

function formatFoeEra(era: 'child' | 'adult' | 'both'): string {
  if (era === 'child') return 'Child Era';
  if (era === 'adult') return 'Adult Era';
  return 'Child & Adult';
}

export function HallOfFallenFoesModal({
  isOpen,
  onClose,
  completedFoeStatueIds,
  bossRushMedals,
  state,
  onToggleFoeStatue,
  onSetBossRushMedal,
  onSelectRegion,
  onToggleSecret,
}: HallOfFallenFoesModalProps) {
  const [activeTab, setActiveTab] = useState<FoesModalTab>('statues');
  const [wingFilter, setWingFilter] = useState<WingFilter>('all');
  const [rareOnly, setRareOnly] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const searchInputId = useId();
  const rareCheckboxId = useId();
  const statuesTabId = useId();
  const bossRushTabId = useId();
  const statuesPanelId = useId();
  const bossRushPanelId = useId();
  const tabRefs = useRef<Record<FoesModalTab, HTMLButtonElement | null>>({
    statues: null,
    'boss-rush': null,
  });

  const resolvedCompletedMap = useMemo(
    () => completedFoeStatueIds ?? state?.completedFoeStatueIds ?? {},
    [completedFoeStatueIds, state?.completedFoeStatueIds],
  );
  const resolvedMedalsMap = useMemo(
    () => bossRushMedals ?? state?.bossRushMedals ?? {},
    [bossRushMedals, state?.bossRushMedals],
  );

  const totalStatues = METADATA.expectedCounts.hallOfFallenFoesStatues;
  const loggedCount = useMemo(
    () =>
      HALL_OF_FALLEN_FOES_STATUES.reduce(
        (acc, s) => acc + (resolvedCompletedMap[s.id] ? 1 : 0),
        0,
      ),
    [resolvedCompletedMap],
  );

  const nonRareStatues = useMemo(
    () => HALL_OF_FALLEN_FOES_STATUES.filter((s) => !s.isRareOrMissable),
    [],
  );
  const rareStatues = useMemo(
    () => HALL_OF_FALLEN_FOES_STATUES.filter((s) => s.isRareOrMissable),
    [],
  );

  const rareLoggedCount = useMemo(
    () => rareStatues.reduce((acc, s) => acc + (resolvedCompletedMap[s.id] ? 1 : 0), 0),
    [rareStatues, resolvedCompletedMap],
  );

  const allNonRareLogged = useMemo(
    () => nonRareStatues.every((s) => Boolean(resolvedCompletedMap[s.id])),
    [nonRareStatues, resolvedCompletedMap],
  );

  const wingCounts = useMemo(() => {
    const counts: Record<FoeGalleryWing, { logged: number; total: number }> = {
      overworld: { logged: 0, total: 0 },
      'child-dungeon': { logged: 0, total: 0 },
      'adult-temple': { logged: 0, total: 0 },
      'mini-boss': { logged: 0, total: 0 },
      boss: { logged: 0, total: 0 },
    };
    for (const s of HALL_OF_FALLEN_FOES_STATUES) {
      counts[s.wing].total += 1;
      if (resolvedCompletedMap[s.id]) {
        counts[s.wing].logged += 1;
      }
    }
    return counts;
  }, [resolvedCompletedMap]);

  const wingLabelById = useMemo(() => {
    const map: Record<FoeGalleryWing, string> = {
      overworld: 'Overworld',
      'child-dungeon': 'Child Dungeons',
      'adult-temple': 'Adult Temples',
      'mini-boss': 'Mini-Bosses',
      boss: 'Bosses',
    };
    for (const w of FOE_GALLERY_WINGS) {
      map[w.id] = w.shortLabel;
    }
    return map;
  }, []);

  const medalsEarnedCount = useMemo(
    () =>
      BOSS_RUSH_GAUNTLETS.reduce((acc, g) => {
        const medal = resolvedMedalsMap[g.id];
        return acc + (medal && medal !== 'none' ? 1 : 0);
      }, 0),
    [resolvedMedalsMap],
  );

  const filteredStatues = useMemo(() => {
    const trimmed = searchQuery.trim().toLowerCase();
    return HALL_OF_FALLEN_FOES_STATUES.filter((statue) => {
      if (wingFilter !== 'all' && statue.wing !== wingFilter) {
        return false;
      }
      if (rareOnly && !statue.isRareOrMissable) {
        return false;
      }
      if (!trimmed) {
        return true;
      }
      const regionName = (REGION_BY_ID[statue.primaryRegionId]?.name ?? '').toLowerCase();
      const haystack = [
        statue.name,
        `#${statue.number}`,
        `#${String(statue.number).padStart(2, '0')}`,
        regionName,
        statue.weakness,
        statue.howToLog,
        statue.rareTip ?? '',
        ...(statue.otherLocations ?? []),
      ]
        .join(' ')
        .toLowerCase();
      return haystack.includes(trimmed);
    });
  }, [rareOnly, searchQuery, wingFilter]);

  const handleCheckAllNonRare = () => {
    for (const statue of nonRareStatues) {
      if (!resolvedCompletedMap[statue.id]) {
        onToggleFoeStatue(statue.id, true);
      }
    }
  };

  const tabOrder: readonly FoesModalTab[] = ['statues', 'boss-rush'];
  const hallSecretDone = Boolean(state?.completedSecretIds['sw2-hall-of-fallen-foes']);

  return (
    <SheetDialog
      isOpen={isOpen}
      onClose={onClose}
      testId="hall-of-fallen-foes-modal"
      size="wide"
      title={
        <>
          <Swords size={19} aria-hidden="true" />
          <span>Hall of Fallen Foes — 84-Statue Bestiary &amp; Boss Rush</span>
        </>
      }
      subtitle={`Switch 2 Dream Gallery: ${loggedCount}/${totalStatues} Statues Sculpted · ${rareLoggedCount}/${rareStatues.length} Rare Stragglers · ${medalsEarnedCount}/${BOSS_RUSH_GAUNTLETS.length} Boss Rush Medals`}
    >
      {/* Live Bestiary Progress & Kaepora Gaebora Entry Summary */}
      <div className="zelda-foes-summary-card" data-testid="foes-progress-banner">
        <div className="zelda-foes-summary-card__top">
          <div>
            <div className="zelda-foes-summary-card__count" data-testid="foes-progress-counter">
              <Sparkles size={15} aria-hidden="true" />
              <span>
                {loggedCount} / {totalStatues} Statues
              </span>
              <span className="zelda-badge zelda-badge--new">
                {Math.round((loggedCount / totalStatues) * 100)}% Complete
              </span>
            </div>
            <p className="zelda-foes-summary-card__hint">
              Speak to <strong>Kaepora Gaebora</strong> perched in Kokiri Forest (Child) or beside
              the Temple of Time (Adult) to enter the dream gallery. Defeating any enemy once
              anywhere in Hyrule sculpts its 3D pedestal; clearing all 84 unlocks the{' '}
              <strong>Golden Gauntlets Cosmetics &amp; Master Boss Rush</strong>!
            </p>
          </div>

          <div className="zelda-foes-summary-card__actions">
            {onToggleSecret && state ? (
              <button
                type="button"
                role="checkbox"
                aria-checked={hallSecretDone}
                className="zelda-check-btn"
                data-testid="foes-master-secret-check"
                onClick={() => onToggleSecret('sw2-hall-of-fallen-foes')}
              >
                <Check size={13} aria-hidden="true" />
                <span>
                  {hallSecretDone ? '100% Milestone Checked' : 'Mark 100% Milestone'}
                </span>
              </button>
            ) : null}

            <button
              type="button"
              className="zelda-link-btn"
              data-testid="foes-jump-hub-btn"
              onClick={() => {
                onSelectRegion('hall-of-fallen-foes');
                onClose();
              }}
            >
              <MapPin size={13} aria-hidden="true" />
              <span>Open Dream Hub Map →</span>
            </button>
          </div>
        </div>

        <progress
          className="zelda-progress-bar"
          value={loggedCount}
          max={totalStatues}
          aria-label={`Hall of Fallen Foes statues logged: ${loggedCount} of ${totalStatues}`}
        />
      </div>

      {/* Primary Section Tabs (Keyboard ArrowLeft / ArrowRight / Home / End) */}
      <div
        className="zelda-tablist zelda-tablist--underline"
        role="tablist"
        aria-label="Hall of Fallen Foes sections"
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
          const idx = tabOrder.indexOf(activeTab);
          let nextIdx = idx;
          if (e.key === 'ArrowRight') nextIdx = (idx + 1) % tabOrder.length;
          if (e.key === 'ArrowLeft') nextIdx = (idx - 1 + tabOrder.length) % tabOrder.length;
          if (e.key === 'Home') nextIdx = 0;
          if (e.key === 'End') nextIdx = tabOrder.length - 1;
          const nextTab = tabOrder[nextIdx];
          setActiveTab(nextTab);
          tabRefs.current[nextTab]?.focus();
        }}
      >
        <button
          ref={(el) => {
            tabRefs.current.statues = el;
          }}
          id={statuesTabId}
          type="button"
          role="tab"
          tabIndex={activeTab === 'statues' ? 0 : -1}
          aria-selected={activeTab === 'statues'}
          aria-controls={statuesPanelId}
          className="zelda-tab zelda-tab--underline"
          data-testid="foes-tab-statues"
          onClick={() => setActiveTab('statues')}
        >
          Statue Gallery ({loggedCount}/{totalStatues})
        </button>

        <button
          ref={(el) => {
            tabRefs.current['boss-rush'] = el;
          }}
          id={bossRushTabId}
          type="button"
          role="tab"
          tabIndex={activeTab === 'boss-rush' ? 0 : -1}
          aria-selected={activeTab === 'boss-rush'}
          aria-controls={bossRushPanelId}
          className="zelda-tab zelda-tab--underline"
          data-testid="foes-tab-boss-rush"
          onClick={() => setActiveTab('boss-rush')}
        >
          <Trophy size={13} aria-hidden="true" />
          <span>
            Boss Rush Medal Tracker ({medalsEarnedCount}/{BOSS_RUSH_GAUNTLETS.length})
          </span>
        </button>
      </div>

      {/* ====================================================================
          TAB 1: 84-Statue Bestiary Gallery
         ==================================================================== */}
      {activeTab === 'statues' ? (
        <section
          id={statuesPanelId}
          role="tabpanel"
          aria-labelledby={statuesTabId}
          className="zelda-ref-panel"
        >
          <div
            role="search"
            className="zelda-filter-toolbar"
            aria-label="Filter Hall of Fallen Foes statues"
          >
            <div className="zelda-filter-search-box">
              <Search size={15} aria-hidden="true" />
              <label htmlFor={searchInputId} className="zelda-sr-only">
                Search Hall of Fallen Foes statues by name, region, or weakness
              </label>
              <input
                id={searchInputId}
                type="search"
                className="zelda-filter-search-input"
                data-testid="foes-search-input"
                autoCorrect="off"
                autoCapitalize="none"
                spellCheck={false}
                placeholder="Search 84 statues by foe, spawn region, or weakness..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="zelda-filter-toolbar__actions">
              <label htmlFor={rareCheckboxId} className="zelda-checkbox-pill">
                <input
                  id={rareCheckboxId}
                  type="checkbox"
                  checked={rareOnly}
                  data-testid="foes-rare-only-checkbox"
                  onChange={(e) => setRareOnly(e.target.checked)}
                />
                <AlertTriangle size={13} aria-hidden="true" />
                <span>Rare / Easy to Miss Only ({rareStatues.length})</span>
              </label>

              <button
                type="button"
                className="zelda-cmd-btn"
                data-testid="check-all-non-rare-foes-btn"
                disabled={allNonRareLogged}
                onClick={handleCheckAllNonRare}
              >
                <CheckCheck size={14} aria-hidden="true" />
                <span>
                  {allNonRareLogged
                    ? `Check All Non-Rare (${nonRareStatues.length}/${nonRareStatues.length} Logged)`
                    : 'Check All Non-Rare'}
                </span>
              </button>
            </div>
          </div>

          {/* 5 Gallery Wing Filter Buttons */}
          <div
            className="zelda-wing-pills"
            role="group"
            aria-label="Filter statues by gallery wing"
          >
            <button
              type="button"
              className="zelda-tab"
              data-testid="foes-wing-all"
              aria-pressed={wingFilter === 'all'}
              onClick={() => setWingFilter('all')}
            >
              All Wings ({loggedCount}/{totalStatues})
            </button>
            {FOE_GALLERY_WINGS.map((wing) => {
              const stats = wingCounts[wing.id];
              return (
                <button
                  key={wing.id}
                  type="button"
                  className="zelda-tab"
                  data-testid={`foes-wing-${wing.id}`}
                  aria-pressed={wingFilter === wing.id}
                  title={wing.description}
                  onClick={() => setWingFilter(wing.id)}
                >
                  {wing.shortLabel} ({stats.logged}/{stats.total})
                </button>
              );
            })}
          </div>

          {filteredStatues.length === 0 ? (
            <div className="zelda-callout" data-testid="foes-empty-state">
              <p style={{ margin: 0 }}>
                No statues match your active search or filter. Clear the search box or switch back
                to <strong>All Wings</strong> to inspect all 84 pedestals.
              </p>
            </div>
          ) : (
            <div className="zelda-card-grid" data-testid="foes-statue-grid">
              {filteredStatues.map((statue) => {
                const isLogged = Boolean(resolvedCompletedMap[statue.id]);
                const regionName =
                  REGION_BY_ID[statue.primaryRegionId]?.name ?? statue.primaryRegionId;

                return (
                  <article
                    key={statue.id}
                    className={`zelda-sheet-card ${isLogged ? 'zelda-sheet-card--done' : ''}`.trim()}
                    data-testid={`foe-card-${statue.id}`}
                  >
                    <div className="zelda-sheet-card__top">
                      <div>
                        <h3 className="zelda-sheet-card__title">
                          <span className="zelda-foe-number">
                            #{String(statue.number).padStart(2, '0')}
                          </span>{' '}
                          {statue.name}
                        </h3>
                        <div className="zelda-card-badges">
                          <span className="zelda-badge">{wingLabelById[statue.wing]}</span>
                          <span className="zelda-badge">{formatFoeEra(statue.era)}</span>
                          {statue.isRareOrMissable ? (
                            <span className="zelda-badge zelda-badge--timer">
                              <ShieldAlert size={11} aria-hidden="true" />
                              <span>Rare / Easy to Miss</span>
                            </span>
                          ) : null}
                        </div>
                      </div>

                      <button
                        type="button"
                        role="checkbox"
                        aria-checked={isLogged}
                        aria-label={`Log statue #${statue.number} ${statue.name}`}
                        className="zelda-check-btn"
                        data-testid={`foe-check-${statue.id}`}
                        onClick={() => onToggleFoeStatue(statue.id)}
                      >
                        <Check size={13} aria-hidden="true" />
                        <span>{isLogged ? 'Logged' : 'Log Statue'}</span>
                      </button>
                    </div>

                    <p className="zelda-sheet-card__desc">
                      <strong>Weakness:</strong> {statue.weakness}
                    </p>
                    <p className="zelda-sheet-card__desc">{statue.howToLog}</p>

                    {statue.isRareOrMissable && statue.rareTip ? (
                      <div className="zelda-foe-rare-tip">
                        <strong>Straggler Alert:</strong> {statue.rareTip}
                      </div>
                    ) : null}

                    <div className="zelda-sheet-card__footer">
                      <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
                        Primary: {regionName}
                        {statue.otherLocations?.length
                          ? ` · Also: ${statue.otherLocations.slice(0, 2).join(', ')}`
                          : ''}
                      </span>
                      <button
                        type="button"
                        className="zelda-link-btn"
                        data-testid={`foe-jump-${statue.id}`}
                        onClick={() => {
                          onSelectRegion(statue.primaryRegionId);
                          onClose();
                        }}
                      >
                        <MapPin size={13} aria-hidden="true" />
                        <span>Jump to Spawn Region</span>
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      ) : (
        /* ====================================================================
            TAB 2: Boss Rush Gauntlets & Target Times Medal Tracker
           ==================================================================== */
        <section
          id={bossRushPanelId}
          role="tabpanel"
          aria-labelledby={bossRushTabId}
          className="zelda-ref-panel"
          data-testid="boss-rush-panel"
        >
          <div className="zelda-callout zelda-callout--sapphire">
            <div className="zelda-callout__title">
              <Award size={15} aria-hidden="true" />
              <span>Kaepora Gaebora’s Dream Boss Rush Rematches</span>
            </div>
            <p style={{ margin: 0 }}>
              Step onto the luminous Triforce dais in the North Sanctum of the Hall of Fallen Foes
              to replay bosses back-to-back with standardized arena loadouts. Clearing target times
              awards Bronze, Silver, Gold, and Master crests on your Zelda Notes profile!
            </p>
          </div>

          <div className="zelda-quest-list">
            {BOSS_RUSH_GAUNTLETS.map((gauntlet) => {
              const currentMedal: BossRushMedal = resolvedMedalsMap[gauntlet.id] ?? 'none';

              return (
                <article
                  key={gauntlet.id}
                  className={`zelda-sheet-card ${
                    currentMedal !== 'none' ? 'zelda-sheet-card--done' : ''
                  }`.trim()}
                  data-testid={`boss-rush-card-${gauntlet.id}`}
                >
                  <div className="zelda-sheet-card__top">
                    <div>
                      <h3 className="zelda-sheet-card__title">{gauntlet.title}</h3>
                      <p
                        style={{
                          margin: '2px 0 0',
                          fontSize: 'var(--text-xs)',
                          color: 'var(--text-secondary)',
                        }}
                      >
                        {gauntlet.subtitle}
                      </p>
                    </div>

                    <span
                      className={`zelda-badge ${
                        currentMedal === 'master' || currentMedal === 'gold'
                          ? 'zelda-badge--new'
                          : currentMedal !== 'none'
                            ? 'zelda-badge--rupee'
                            : ''
                      }`.trim()}
                      data-testid={`boss-rush-current-medal-${gauntlet.id}`}
                    >
                      <Trophy size={11} aria-hidden="true" />
                      <span>
                        {currentMedal === 'none'
                          ? 'No Medal Yet'
                          : `${currentMedal.charAt(0).toUpperCase()}${currentMedal.slice(1)} Medal`}
                      </span>
                    </span>
                  </div>

                  <p className="zelda-sheet-card__desc">
                    <strong>Unlock Condition:</strong> {gauntlet.unlockCondition}
                  </p>
                  <p className="zelda-sheet-card__desc">
                    <strong>Arena Loadout:</strong> {gauntlet.arenaLoadout}
                  </p>

                  <div className="zelda-boss-lineup" aria-label={`${gauntlet.title} lineup`}>
                    {gauntlet.lineup.map((bossName, idx) => (
                      <span key={bossName} className="zelda-badge">
                        {idx + 1}. {bossName}
                      </span>
                    ))}
                  </div>

                  <div className="zelda-target-times-grid">
                    <div className="zelda-target-time-pill">
                      <span>Bronze</span>
                      <strong>{gauntlet.targetTimes.bronze}</strong>
                    </div>
                    <div className="zelda-target-time-pill">
                      <span>Silver</span>
                      <strong>{gauntlet.targetTimes.silver}</strong>
                    </div>
                    <div className="zelda-target-time-pill">
                      <span>Gold</span>
                      <strong>{gauntlet.targetTimes.gold}</strong>
                    </div>
                    <div className="zelda-target-time-pill zelda-target-time-pill--master">
                      <span>Master</span>
                      <strong>{gauntlet.targetTimes.master}</strong>
                    </div>
                  </div>

                  <p className="zelda-sheet-card__desc">
                    <strong>Speed Strategy:</strong> {gauntlet.strategyTip}
                  </p>

                  <div
                    className="zelda-medal-selector"
                    role="group"
                    aria-label={`Record medal for ${gauntlet.title}`}
                  >
                    <span className="zelda-medal-selector__label">Recorded Medal:</span>
                    <div className="zelda-medal-selector__btns">
                      {MEDAL_OPTIONS.map((opt) => (
                        <button
                          key={opt.id}
                          type="button"
                          className="zelda-tab"
                          data-testid={`boss-rush-medal-${gauntlet.id}-${opt.id}`}
                          aria-pressed={currentMedal === opt.id}
                          onClick={() => onSetBossRushMedal(gauntlet.id, opt.id)}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      )}
    </SheetDialog>
  );
}
