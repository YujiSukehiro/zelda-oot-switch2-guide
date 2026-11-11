import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  BookOpen,
  CheckCircle2,
  ChevronDown,
  Coins,
  Compass,
  Heart,
  Hourglass,
  Layers,
  ListChecks,
  Lock,
  Map as MapIcon,
  Moon,
  Music,
  Shield,
  Skull,
  Sparkles,
  Swords,
  Wrench,
  X,
} from 'lucide-react';
import { ATTACHED_DUNGEONS_BY_REGION, REGION_BY_ID, SECRET_BY_ID } from '../../data';
import { categorizeRegionSecrets, computeRegionSummary } from '../../lib/gating';
import type {
  AreaWalkthroughGuide,
  BlockerCategoryKind,
  DrawerGroupMode,
  PlayerProgressState,
  RegionBiome,
  RegionKind,
  RegionProgressSummary,
} from '../../types/zelda';
import { FormattedGuideText } from './FormattedGuideText';
import { RequirementPopover } from './RequirementPopover';
import { SecretCard } from './SecretCard';
import './region.css';

interface ExtendedRegionProgressSummary {
  isReachable?: boolean;
  reachabilityBlocker?: string;
}

export interface RegionDrawerProps {
  regionId: string | null;
  state: PlayerProgressState;
  effectiveRequirements: Set<string>;
  regionSummaries: Record<string, RegionProgressSummary>;
  areaGuide?: AreaWalkthroughGuide;
  onClose: () => void;
  onSelectRegion: (regionId: string) => void;
  onToggleSecret: (secretId: string, completed?: boolean) => void;
  onToggleRequirement?: (requirementId: string, owned?: boolean) => void;
  onOpenSongbook?: (songId?: string) => void;
  onOpenOptimalRouteForRegion?: (regionId: string) => void;
  onOpenAreaWorkspace?: (regionId: string) => void;
}

const MOBILE_MEDIA_QUERY = '(max-width: 899px)';

const KIND_LABELS: Record<RegionKind, string> = {
  overworld: 'Overworld Province',
  dungeon: 'Major Dungeon',
  'mini-dungeon': 'Mini-Dungeon',
  special: 'Switch 2 Special Hub',
};

const BIOME_LABELS: Record<RegionBiome, string> = {
  forest: 'Forest',
  field: 'Field',
  town: 'Town',
  castle: 'Castle',
  shadow: 'Shadow',
  mountain: 'Volcanic Mountain',
  water: 'Waterway',
  desert: 'Desert Canyon',
  dream: 'Dream Sanctum',
};

function readIsMobileViewport(): boolean {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return false;
  }
  return window.matchMedia(MOBILE_MEDIA_QUERY).matches;
}

function useIsMobileViewport(): boolean {
  const [isMobile, setIsMobile] = useState<boolean>(() => readIsMobileViewport());

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
      return undefined;
    }
    const mql = window.matchMedia(MOBILE_MEDIA_QUERY);
    setIsMobile(mql.matches);

    const handleChange = (event: MediaQueryListEvent) => {
      setIsMobile(event.matches);
    };

    if (typeof mql.addEventListener === 'function') {
      mql.addEventListener('change', handleChange);
      return () => mql.removeEventListener('change', handleChange);
    }
    // Legacy MediaQueryList fallback
    mql.addListener(handleChange);
    return () => mql.removeListener(handleChange);
  }, []);

  return isMobile;
}

function renderBlockerIcon(category: BlockerCategoryKind): React.ReactNode {
  switch (category) {
    case 'cross-era':
      return <Hourglass size={15} aria-hidden="true" />;
    case 'song':
      return <Music size={15} aria-hidden="true" />;
    case 'gear':
      return <Wrench size={15} aria-hidden="true" />;
    case 'wallet-milestone':
      return <Coins size={15} aria-hidden="true" />;
    case 'time-bug':
      return <Moon size={15} aria-hidden="true" />;
    default:
      return <Shield size={15} aria-hidden="true" />;
  }
}

export const RegionDrawer: React.FC<RegionDrawerProps> = ({
  regionId,
  state,
  effectiveRequirements,
  regionSummaries,
  areaGuide,
  onClose,
  onSelectRegion,
  onToggleSecret,
  onToggleRequirement,
  onOpenSongbook,
  onOpenOptimalRouteForRegion,
  onOpenAreaWorkspace,
}) => {
  const [activeDossierTab, setActiveDossierTab] = useState<'checklist' | 'guide'>('checklist');
  const [groupMode, setGroupMode] = useState<DrawerGroupMode>('blocker');
  const [activePopoverReqId, setActivePopoverReqId] = useState<string | null>(null);

  const isMobile = useIsMobileViewport();
  const dialogRef = useRef<HTMLDialogElement | null>(null);
  const bodyScrollRef = useRef<HTMLDivElement | null>(null);
  const lastPillTriggerRef = useRef<HTMLButtonElement | null>(null);
  const subtabRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const modeTabRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const isUnmountingDialogRef = useRef<boolean>(false);

  const region = regionId ? REGION_BY_ID[regionId] : undefined;

  // Reset popover and scroll dossier body to top when switching regions
  useEffect(() => {
    setActivePopoverReqId(null);
    lastPillTriggerRef.current = null;
    if (bodyScrollRef.current && typeof bodyScrollRef.current.scrollTo === 'function') {
      bodyScrollRef.current.scrollTo({ top: 0 });
    }
  }, [regionId]);

  // Open mobile <dialog> via native showModal() so top-layer focus trap, Esc, & closedby="any" activate
  useEffect(() => {
    if (!isMobile || !region) {
      return undefined;
    }
    const dialog = dialogRef.current;
    if (!dialog) {
      return undefined;
    }

    isUnmountingDialogRef.current = false;
    if (!dialog.open) {
      if (typeof dialog.showModal === 'function') {
        try {
          dialog.showModal();
        } catch {
          dialog.setAttribute('open', '');
        }
      } else {
        dialog.setAttribute('open', '');
      }
    }

    return () => {
      isUnmountingDialogRef.current = true;
      if (dialog.open && typeof dialog.close === 'function') {
        try {
          dialog.close();
        } catch {
          dialog.removeAttribute('open');
        }
      }
    };
  }, [isMobile, region]);

  const handleOpenRequirementPopover = useCallback(
    (reqId: string, triggerEl: HTMLButtonElement) => {
      lastPillTriggerRef.current = triggerEl;
      setActivePopoverReqId((prev) => (prev === reqId ? null : reqId));
    },
    [],
  );

  const handleCloseRequirementPopover = useCallback(() => {
    setActivePopoverReqId(null);
    const trigger = lastPillTriggerRef.current;
    if (trigger && trigger.isConnected) {
      trigger.focus();
    }
  }, []);

  const categorized = useMemo(() => {
    if (!region) {
      return null;
    }
    return categorizeRegionSecrets(region.id, state, groupMode, {
      effectiveReqs: effectiveRequirements,
    });
  }, [region, state, groupMode, effectiveRequirements]);

  if (!region || !categorized) {
    return null;
  }

  const summary =
    regionSummaries[region.id] ??
    computeRegionSummary(region.id, state, effectiveRequirements);

  // Compute Parent Overworld <-> Attached Dungeon quick-switch family tabs
  const rootRegion = region.parentRegionId
    ? (REGION_BY_ID[region.parentRegionId] ?? region)
    : region;
  const attachedChildren = ATTACHED_DUNGEONS_BY_REGION[rootRegion.id] ?? [];
  const familyTabs = attachedChildren.length > 0 ? [rootRegion, ...attachedChildren] : [];

  const lockedSecretsCount = categorized.lockedBuckets.reduce(
    (acc, bucket) => acc + bucket.items.length,
    0,
  );

  const handleSubtabKeyDown = (
    event: React.KeyboardEvent<HTMLButtonElement>,
    currentIndex: number,
  ) => {
    if (familyTabs.length <= 1) return;
    let nextIndex: number | null = null;

    if (event.key === 'ArrowRight') {
      nextIndex = (currentIndex + 1) % familyTabs.length;
    } else if (event.key === 'ArrowLeft') {
      nextIndex = (currentIndex - 1 + familyTabs.length) % familyTabs.length;
    } else if (event.key === 'Home') {
      nextIndex = 0;
    } else if (event.key === 'End') {
      nextIndex = familyTabs.length - 1;
    }

    if (nextIndex !== null) {
      event.preventDefault();
      const targetRegion = familyTabs[nextIndex];
      subtabRefs.current[nextIndex]?.focus();
      onSelectRegion(targetRegion.id);
    }
  };

  const handleDialogCancel = (event: React.SyntheticEvent<HTMLDialogElement>) => {
    event.preventDefault();
    if (activePopoverReqId) {
      handleCloseRequirementPopover();
      return;
    }
    onClose();
  };

  const handleDialogNativeClose = () => {
    if (isUnmountingDialogRef.current) {
      return;
    }
    onClose();
  };

  // Fallback light-dismiss for browsers without native <dialog closedby="any"> support (e.g. Safari)
  const handleDialogBackdropClick = (event: React.MouseEvent<HTMLDialogElement>) => {
    const dialog = dialogRef.current;
    if (!dialog || event.target !== dialog) {
      return;
    }
    const rect = dialog.getBoundingClientRect();
    if (rect.width > 0 && rect.height > 0) {
      const isInsideContent =
        rect.top <= event.clientY &&
        event.clientY <= rect.top + rect.height &&
        rect.left <= event.clientX &&
        event.clientX <= rect.left + rect.width;
      if (isInsideContent) {
        return;
      }
    }
    onClose();
  };

  const renderSecretList = (items: typeof categorized.readyNow, forceCompact = false) => {
    const shouldCompact = forceCompact || items.length > 6;
    return (
      <div className="dossier-card-stack">
        {items.map((ev) => (
          <SecretCard
            key={ev.secret.id}
            evaluated={ev}
            effectiveRequirements={effectiveRequirements}
            customScarecrowNotes={state.customScarecrowNotes}
            activePopoverReqId={activePopoverReqId}
            compact={shouldCompact}
            onToggleSecret={onToggleSecret}
            onSelectRequirementPill={handleOpenRequirementPopover}
            onOpenSongbook={onOpenSongbook}
          />
        ))}
      </div>
    );
  };

  const extSummary = summary as RegionProgressSummary & ExtendedRegionProgressSummary;
  const isRegionUnreachable = extSummary.isReachable === false;

  const dossierInner = (
    <div className="region-dossier-surface">
      {isMobile && <div className="dossier-drag-pill" aria-hidden="true" />}

      <header className="region-dossier-header">
        <div className="dossier-header-top">
          <div className="dossier-meta-badges">
            <span className={`dossier-kind-badge kind-${region.kind}`}>
              {KIND_LABELS[region.kind]}
            </span>
            <span className={`dossier-biome-badge biome-${region.biome}`}>
              {BIOME_LABELS[region.biome]}
            </span>
          </div>

          <button
            type="button"
            data-testid="close-dossier-btn"
            aria-label="Close region dossier"
            className="dossier-close-btn"
            onClick={onClose}
          >
            <X size={18} aria-hidden="true" />
          </button>
        </div>

        <h2 className="dossier-region-title">{region.name}</h2>

        {onOpenAreaWorkspace && (
          <button
            type="button"
            className="dossier-enter-area-btn"
            data-testid="dossier-open-area-map-btn"
            onClick={() => onOpenAreaWorkspace(region.id)}
          >
            <MapIcon size={15} aria-hidden="true" />
            <span>Enter Area / Floor Map →</span>
          </button>
        )}

        {isRegionUnreachable && (
          <div
            className="dossier-reachability-banner"
            data-testid="dossier-reachability-banner"
            role="status"
          >
            <Lock size={14} aria-hidden="true" />
            <span>
              <strong>Area Currently Unreachable:</strong>{' '}
              <FormattedGuideText
                text={
                  extSummary.reachabilityBlocker ??
                  'Requires story progression or prerequisite gear to enter.'
                }
              />
            </span>
          </div>
        )}

        <div className="dossier-progress-block">
          <div className="dossier-progress-stats">
            <span className="dossier-progress-fraction">
              <strong>
                {summary.completedCount} / {summary.totalCount}
              </strong>{' '}
              Secrets ({summary.percent}%)
            </span>
            <div className="dossier-progress-pills">
              {summary.isComplete ? (
                <span className="dossier-status-pill is-complete">
                  <CheckCircle2 size={12} aria-hidden="true" />
                  100% Complete
                </span>
              ) : (
                summary.readyNowCount > 0 && (
                  <span className="dossier-status-pill is-ready">
                    +{summary.readyNowCount} Ready
                  </span>
                )
              )}
            </div>
          </div>

          <div
            role="progressbar"
            aria-label={`${region.name} completion`}
            aria-valuenow={summary.percent}
            aria-valuemin={0}
            aria-valuemax={100}
            className="dossier-progress-track"
          >
            <div
              className={`dossier-progress-fill ${summary.isComplete ? 'is-complete' : ''}`}
              style={{ width: `${summary.percent}%` }}
            />
          </div>
        </div>

        {/* Switch 2 In-Game Map Counter Match Pills */}
        <div
          className="dossier-map-counters"
          aria-label="Switch 2 in-game map counters"
        >
          <div data-testid="counter-heart-pieces" className="map-counter-pill">
            <Heart size={13} className="counter-icon is-heart" aria-hidden="true" />
            <span className="counter-label">Heart Pieces</span>
            <strong className="counter-value">
              {summary.heartPiecesCompleted} / {summary.heartPiecesTotal}
            </strong>
          </div>

          <div data-testid="counter-skulltulas-child" className="map-counter-pill">
            <Skull size={13} className="counter-icon is-skull-child" aria-hidden="true" />
            <span className="counter-label">Child Skulltulas</span>
            <strong className="counter-value">
              {summary.skulltulasChildCompleted} / {summary.skulltulasChildTotal}
            </strong>
          </div>

          <div data-testid="counter-skulltulas-adult" className="map-counter-pill">
            <Skull size={13} className="counter-icon is-skull-adult" aria-hidden="true" />
            <span className="counter-label">Adult Skulltulas</span>
            <strong className="counter-value">
              {summary.skulltulasAdultCompleted} / {summary.skulltulasAdultTotal}
            </strong>
          </div>

          <div data-testid="counter-skulltulas-total" className="map-counter-pill">
            <Skull size={13} className="counter-icon is-skull-total" aria-hidden="true" />
            <span className="counter-label">Total Skulltulas</span>
            <strong className="counter-value">
              {summary.skulltulasCompleted} / {summary.skulltulasTotal}
            </strong>
          </div>
        </div>

        {/* Parent Overworld <-> Attached Dungeon Quick-Switch Sub-Tabs */}
        {familyTabs.length > 0 && (
          <div
            role="tablist"
            aria-label={`${rootRegion.name} area switcher`}
            data-testid="region-subtabs"
            className="dossier-subtabs"
          >
            {familyTabs.map((tabRegion, idx) => {
              const isSelected = tabRegion.id === region.id;
              const tabSum =
                regionSummaries[tabRegion.id] ??
                computeRegionSummary(tabRegion.id, state, effectiveRequirements);
              return (
                <button
                  key={tabRegion.id}
                  ref={(el) => {
                    subtabRefs.current[idx] = el;
                  }}
                  type="button"
                  role="tab"
                  data-testid={`subtab-${tabRegion.id}`}
                  aria-selected={isSelected}
                  tabIndex={isSelected ? 0 : -1}
                  className={`dossier-subtab ${isSelected ? 'is-selected' : ''}`}
                  onClick={() => onSelectRegion(tabRegion.id)}
                  onKeyDown={(e) => handleSubtabKeyDown(e, idx)}
                >
                  <span className="subtab-name">{tabRegion.name}</span>
                  <span className="subtab-badge">
                    ({tabSum.completedCount}/{tabSum.totalCount})
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </header>

      <div ref={bodyScrollRef} className="region-dossier-body">
        {/* Switch 2 Remake Highlights & Regional Overview */}
        <section
          data-testid="switch2-highlights"
          aria-label="Region overview and Switch 2 Remake highlights"
          className="dossier-highlights-section"
        >
          <p className="dossier-region-summary">
            <FormattedGuideText text={region.summary} />
          </p>

          {region.switch2Highlights.length > 0 && (
            <div className="dossier-switch2-callout">
              <div className="switch2-callout-header">
                <Sparkles size={15} aria-hidden="true" />
                <span>Switch 2 Remake Highlights</span>
              </div>
              <ul className="switch2-callout-list">
                {region.switch2Highlights.map((bullet, idx) => (
                  <li key={idx}>
                    <FormattedGuideText text={bullet} />
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>

        {/* Primary Dossier Mode Tabs: Checklist & Locks vs. In-Depth Area Guide (modern-web-guidance: tabs) */}
        <div
          role="tablist"
          aria-label="Region dossier view"
          data-testid="dossier-mode-tabs"
          className="dossier-mode-tablist"
        >
          <button
            ref={(el) => {
              modeTabRefs.current[0] = el;
            }}
            id="dossier-tab-checklist"
            type="button"
            role="tab"
            data-testid="dossier-tab-checklist"
            aria-selected={activeDossierTab === 'checklist'}
            tabIndex={activeDossierTab === 'checklist' ? 0 : -1}
            className="dossier-mode-tab"
            onClick={() => setActiveDossierTab('checklist')}
            onKeyDown={(e) => {
              if (e.key === 'ArrowRight' || e.key === 'End') {
                e.preventDefault();
                setActiveDossierTab('guide');
                modeTabRefs.current[1]?.focus();
              }
            }}
          >
            <ListChecks size={14} aria-hidden="true" />
            <span>
              Secrets &amp; Locks ({summary.completedCount}/{summary.totalCount})
            </span>
          </button>

          <button
            ref={(el) => {
              modeTabRefs.current[1] = el;
            }}
            id="dossier-tab-guide"
            type="button"
            role="tab"
            data-testid="dossier-tab-guide"
            aria-selected={activeDossierTab === 'guide'}
            tabIndex={activeDossierTab === 'guide' ? 0 : -1}
            className="dossier-mode-tab"
            onClick={() => setActiveDossierTab('guide')}
            onKeyDown={(e) => {
              if (e.key === 'ArrowLeft' || e.key === 'Home') {
                e.preventDefault();
                setActiveDossierTab('checklist');
                modeTabRefs.current[0]?.focus();
              }
            }}
          >
            <BookOpen size={14} aria-hidden="true" />
            <span>In-Depth Area Guide</span>
          </button>
        </div>

        {/* Tab Panel 1: Categorized Secrets & Locks Checklist */}
        <div
          role="tabpanel"
          aria-labelledby="dossier-tab-checklist"
          hidden={activeDossierTab !== 'checklist'}
        >
          <div className="dossier-tabpanel-inner">
            {/* 1-Click Grouping Mode Switcher */}
            <div className="dossier-grouping-bar">
              <span className="grouping-bar-label">
                <Layers size={13} aria-hidden="true" />
                Group Secrets:
              </span>
              <div
                data-testid="group-mode-switcher"
                role="group"
                aria-label="Secret grouping mode"
                className="dossier-group-switcher"
              >
                <button
                  type="button"
                  data-testid="group-mode-blocker"
                  aria-pressed={groupMode === 'blocker'}
                  className={`group-mode-pill ${groupMode === 'blocker' ? 'is-active' : ''}`}
                  onClick={() => setGroupMode('blocker')}
                >
                  By Requirement Gate
                </button>
                <button
                  type="button"
                  data-testid="group-mode-tier"
                  aria-pressed={groupMode === 'tier'}
                  className={`group-mode-pill ${groupMode === 'tier' ? 'is-active' : ''}`}
                  onClick={() => setGroupMode('tier')}
                >
                  Canonical Tiers (0–5)
                </button>
                <button
                  type="button"
                  data-testid="group-mode-type"
                  aria-pressed={groupMode === 'type'}
                  className={`group-mode-pill ${groupMode === 'type' ? 'is-active' : ''}`}
                  onClick={() => setGroupMode('type')}
                >
                  Collectible Type
                </button>
              </div>
            </div>

            {/* Mode 1 (Default): By Requirement Gate ('blocker') */}
            {groupMode === 'blocker' && (
              <div className="dossier-sections-stack">
                <section
                  data-testid="section-ready-now"
                  aria-label="Secrets ready to grab right now"
                  className="dossier-ready-section"
                >
                  <div className="section-banner-header is-ready">
                    <span className="status-dot is-ready" aria-hidden="true" />
                    <h3>Ready Right Now ({categorized.readyNow.length})</h3>
                  </div>

                  {categorized.readyNow.length > 0 ? (
                    renderSecretList(categorized.readyNow)
                  ) : (
                    <p className="dossier-empty-hint">
                      {categorized.allEvaluated.length === 0
                        ? 'No collectibles match your active filter in this area.'
                        : categorized.lockedBuckets.length === 0 &&
                            categorized.completed.length > 0
                          ? 'All secrets in this region are completed!'
                          : 'No remaining secrets are ready with your current loadout — inspect the specific requirement gates below or toggle gear in your Loadout.'}
                    </p>
                  )}
                </section>

                <section
                  data-testid="section-locked-buckets"
                  aria-label="Secrets locked behind specific requirements"
                  className="dossier-locked-section"
                >
                  <div className="section-banner-header is-locked">
                    <Lock size={14} aria-hidden="true" />
                    <h3>Locked Behind Specific Requirements ({lockedSecretsCount})</h3>
                  </div>

                  {categorized.lockedBuckets.length > 0 ? (
                    <div className="dossier-buckets-stack">
                      {categorized.lockedBuckets.map((bucket) => (
                        <details
                          key={bucket.key}
                          open
                          data-testid={`locked-bucket-${bucket.key}`}
                          className={`dossier-disclosure locked-bucket cat-${bucket.category}`}
                        >
                          <summary className="dossier-disclosure-summary">
                            <span className="disclosure-summary-left">
                              <span className="disclosure-cat-icon">
                                {renderBlockerIcon(bucket.category)}
                              </span>
                              <span className="disclosure-title">{bucket.label}</span>
                              <span className="disclosure-count">({bucket.items.length})</span>
                            </span>
                            <ChevronDown
                              size={16}
                              className="disclosure-chevron"
                              aria-hidden="true"
                            />
                          </summary>
                          <div className="dossier-disclosure-content">
                            {renderSecretList(bucket.items)}
                          </div>
                        </details>
                      ))}
                    </div>
                  ) : (
                    <p className="dossier-empty-hint">
                      Nothing locked — your current loadout satisfies every remaining secret here!
                    </p>
                  )}
                </section>
              </div>
            )}

            {/* Mode 2: Canonical Progression Tiers (0–5) */}
            {groupMode === 'tier' && (
              <section
                data-testid="section-tier-groups"
                aria-label="Secrets grouped by canonical progression tiers"
                className="dossier-buckets-stack"
              >
                {categorized.tierGroups
                  .filter((tg) => tg.items.length > 0)
                  .map((tierGroup) => (
                    <details
                      key={tierGroup.key}
                      open
                      data-testid={`tier-bucket-${tierGroup.key}`}
                      className="dossier-disclosure tier-bucket"
                    >
                      <summary className="dossier-disclosure-summary">
                        <span className="disclosure-summary-left">
                          <span
                            className="tier-color-dot"
                            style={{ backgroundColor: tierGroup.tier.badgeColor }}
                            aria-hidden="true"
                          />
                          <span className="disclosure-title">{tierGroup.label}</span>
                          <span className="disclosure-count">({tierGroup.items.length})</span>
                        </span>
                        <ChevronDown
                          size={16}
                          className="disclosure-chevron"
                          aria-hidden="true"
                        />
                      </summary>
                      <div className="dossier-disclosure-content">
                        <p className="tier-bucket-desc">{tierGroup.tier.description}</p>
                        {renderSecretList(tierGroup.items)}
                      </div>
                    </details>
                  ))}
              </section>
            )}

            {/* Mode 3: Collectible Type */}
            {groupMode === 'type' && (
              <section
                data-testid="section-type-groups"
                aria-label="Secrets grouped by collectible type"
                className="dossier-buckets-stack"
              >
                {categorized.typeGroups
                  .filter((tg) => tg.items.length > 0)
                  .map((typeGroup) => (
                    <details
                      key={typeGroup.key}
                      open
                      data-testid={`type-bucket-${typeGroup.key}`}
                      className="dossier-disclosure type-bucket"
                    >
                      <summary className="dossier-disclosure-summary">
                        <span className="disclosure-summary-left">
                          <span className="disclosure-title">{typeGroup.label}</span>
                          <span className="disclosure-count">({typeGroup.items.length})</span>
                        </span>
                        <ChevronDown
                          size={16}
                          className="disclosure-chevron"
                          aria-hidden="true"
                        />
                      </summary>
                      <div className="dossier-disclosure-content">
                        {renderSecretList(typeGroup.items)}
                      </div>
                    </details>
                  ))}
              </section>
            )}

            {/* Collapsible Completed Section at Bottom */}
            <details
              data-testid="section-completed"
              className="dossier-disclosure completed-bucket"
            >
              <summary className="dossier-disclosure-summary">
                <span className="disclosure-summary-left">
                  <CheckCircle2
                    size={15}
                    className="completed-summary-icon"
                    aria-hidden="true"
                  />
                  <span className="disclosure-title">
                    Completed ({categorized.completed.length})
                  </span>
                </span>
                <ChevronDown size={16} className="disclosure-chevron" aria-hidden="true" />
              </summary>
              <div className="dossier-disclosure-content">
                {categorized.completed.length > 0 ? (
                  renderSecretList(categorized.completed)
                ) : (
                  <p className="dossier-empty-hint">
                    No secrets checked off in {region.name} yet.
                  </p>
                )}
              </div>
            </details>
          </div>
        </div>

        {/* Tab Panel 2: In-Depth Area & Dungeon Walkthrough Guide */}
        <div
          role="tabpanel"
          aria-labelledby="dossier-tab-guide"
          data-testid="dossier-guide-panel"
          hidden={activeDossierTab !== 'guide'}
        >
          <div className="dossier-guide-stack">
            {areaGuide ? (
              <>
                <div className="area-guide-banner">
                  <p className="area-guide-tagline">
                    <FormattedGuideText text={areaGuide.tagline} />
                  </p>
                  <div className="area-guide-visit-order">
                    <Compass size={13} aria-hidden="true" />
                    <span>
                      <strong>Optimal Timing:</strong>{' '}
                      <FormattedGuideText text={areaGuide.recommendedVisitOrder} />
                    </span>
                  </div>
                  {onOpenOptimalRouteForRegion && (
                    <button
                      type="button"
                      className="area-guide-route-jump-btn"
                      data-testid="dossier-jump-to-route-btn"
                      onClick={() => onOpenOptimalRouteForRegion(region.id)}
                    >
                      <Compass size={13} aria-hidden="true" />
                      <span>Open {region.name} in Horizontal Optimal Route</span>
                    </button>
                  )}
                </div>

                {areaGuide.entrancesAndShortcuts.length > 0 && (
                  <section className="area-guide-card">
                    <h3 className="area-guide-card__title">Entrances, Warps &amp; Shortcuts</h3>
                    <ul className="area-guide-bullets">
                      {areaGuide.entrancesAndShortcuts.map((line, i) => (
                        <li key={i}>
                          <FormattedGuideText text={line} />
                        </li>
                      ))}
                    </ul>
                  </section>
                )}

                {areaGuide.phases.map((phase) => {
                  const phaseSecrets = phase.secretIds
                    .map((id) => SECRET_BY_ID[id])
                    .filter((s): s is NonNullable<typeof s> => Boolean(s));
                  const doneInPhase = phaseSecrets.filter(
                    (s) => state.completedSecretIds[s.id],
                  ).length;

                  return (
                    <section
                      key={phase.id}
                      className="area-guide-card"
                      data-testid={`area-guide-phase-${phase.id}`}
                    >
                      <div className="area-guide-phase-head">
                        <h3 className="area-guide-card__title">{phase.title}</h3>
                        <span className={`secret-badge badge-era era-${phase.era}`}>
                          {phase.era === 'child'
                            ? 'Child Link'
                            : phase.era === 'adult'
                              ? 'Adult Link'
                              : 'Both Eras'}
                        </span>
                      </div>

                      <ol className="area-guide-steps">
                        {phase.steps.map((stepText, idx) => (
                          <li key={idx}>
                            <FormattedGuideText text={stepText} />
                          </li>
                        ))}
                      </ol>

                      {phaseSecrets.length > 0 && (
                        <div className="area-guide-phase-secrets">
                          <div className="area-guide-phase-secrets__label">
                            Check Off as You Go ({doneInPhase}/{phaseSecrets.length})
                          </div>
                          <ul className="area-guide-secret-checks">
                            {phaseSecrets.map((sec) => {
                              const checked = Boolean(state.completedSecretIds[sec.id]);
                              return (
                                <li
                                  key={sec.id}
                                  className={`area-guide-secret-row${checked ? ' is-checked' : ''}`}
                                >
                                  <label>
                                    <input
                                      type="checkbox"
                                      data-testid={`guide-secret-check-${sec.id}`}
                                      checked={checked}
                                      onChange={(e) => onToggleSecret(sec.id, e.target.checked)}
                                    />
                                    <span>{sec.title}</span>
                                  </label>
                                </li>
                              );
                            })}
                          </ul>
                        </div>
                      )}
                    </section>
                  );
                })}

                {areaGuide.bossStrategy && (
                  <section className="area-guide-card area-guide-boss-card">
                    <div className="area-guide-phase-head">
                      <h3 className="area-guide-card__title">
                        <Swords size={15} aria-hidden="true" />
                        <span>Boss Strategy: {areaGuide.bossStrategy.bossName}</span>
                      </h3>
                    </div>
                    <p className="area-guide-boss-weakness">
                      <strong>Weakness:</strong>{' '}
                      <FormattedGuideText text={areaGuide.bossStrategy.weakness} />
                    </p>
                    <p className="area-guide-boss-text">
                      <FormattedGuideText text={areaGuide.bossStrategy.strategy} />
                    </p>
                  </section>
                )}

                {areaGuide.proTips.length > 0 && (
                  <section className="area-guide-card">
                    <h3 className="area-guide-card__title">Switch 2 &amp; Optimization Pro Tips</h3>
                    <ul className="area-guide-bullets">
                      {areaGuide.proTips.map((tip, i) => (
                        <li key={i}>
                          <FormattedGuideText text={tip} />
                        </li>
                      ))}
                    </ul>
                  </section>
                )}
              </>
            ) : (
              <p className="dossier-empty-hint">
                Select Secrets &amp; Locks above to view and check off collectibles in {region.name}.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Requirement How-To-Get & Switch 2 Notes Popover (rendered inside active container so top-layer <dialog> never marks it inert) */}
      {activePopoverReqId && (
        <RequirementPopover
          reqId={activePopoverReqId}
          isOwned={effectiveRequirements.has(activePopoverReqId)}
          customScarecrowNotes={state.customScarecrowNotes}
          onClose={handleCloseRequirementPopover}
          onSelectRegion={onSelectRegion}
          onToggleRequirement={onToggleRequirement}
          onOpenSongbook={onOpenSongbook}
        />
      )}
    </div>
  );

  if (isMobile) {
    return (
      <dialog
        ref={dialogRef}
        data-testid="region-dossier"
        aria-label={`${region.name} Dossier`}
        className="region-dossier region-dossier-dialog"
        data-biome={region.biome}
        {...({ closedby: 'any' } as Record<string, string>)}
        onCancel={handleDialogCancel}
        onClose={handleDialogNativeClose}
        onClick={handleDialogBackdropClick}
      >
        {dossierInner}
      </dialog>
    );
  }

  return (
    <aside
      data-testid="region-dossier"
      aria-label={`${region.name} Dossier`}
      className="region-dossier region-dossier-aside"
      data-biome={region.biome}
      onKeyDown={(e) => {
        if (e.key === 'Escape' && !activePopoverReqId) {
          onClose();
        }
      }}
    >
      {dossierInner}
    </aside>
  );
};
