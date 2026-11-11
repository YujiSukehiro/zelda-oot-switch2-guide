import React from 'react';
import {
  ArrowRight,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  EyeOff,
  Hourglass,
  Lightbulb,
  Lock,
  MapPin,
  PartyPopper,
  Sparkles,
  Wrench,
  Zap,
} from 'lucide-react';
import {
  ATTACHED_DUNGEONS_BY_REGION,
  REGION_BY_ID,
  REGIONS,
  REQUIREMENT_SOURCE_REGION,
  SONGS_AND_QUESTS,
} from '../../data';
import type {
  AreaWalkthroughGuide,
  EvaluatedSecret,
  PlayerProgressState,
  Region,
  RegionProgressSummary,
} from '../../types/zelda';
import {
  EnvironmentalConditionBadge,
  FormattedGuideText,
  RequirementPill,
  SecretCard,
  deriveEnvironmentalConditions,
  formatSecretCategoryLabel,
  type ExtendedEvaluatedSecretFields,
} from '../region';
import { NoteSequence, parseNoteTokens } from '../sheets';

export interface ExtendedGuidedRegionSummary {
  isReachable?: boolean;
  reachabilityBlocker?: string;
  reachabilityBlockerReqId?: string;
}

export type VisitStage = 'completed' | 'do-now' | 'later-gear' | 'later-era';

export function resolveVisitStage(
  evaluated: EvaluatedSecret,
  effectiveRequirements: Set<string>,
): VisitStage {
  const ext = evaluated as EvaluatedSecret & ExtendedEvaluatedSecretFields;
  if (ext.visitStage) {
    return ext.visitStage;
  }
  if (evaluated.status === 'completed') {
    return 'completed';
  }
  if (evaluated.status === 'available-now' || evaluated.status === 'available-via-alt') {
    return 'do-now';
  }
  const { era } = evaluated.secret;
  if (
    (era === 'adult' && !effectiveRequirements.has('era-adult')) ||
    (era === 'cross-era' && !effectiveRequirements.has('time-travel')) ||
    (era === 'child' && !effectiveRequirements.has('era-child')) ||
    evaluated.missingPrimaryIds.includes('era-adult') ||
    evaluated.missingPrimaryIds.includes('time-travel')
  ) {
    return 'later-era';
  }
  return 'later-gear';
}

const REGION_PREREQUISITE_FALLBACK: Readonly<Record<string, string>> = {
  'hyrule-field': 'deku-tree',
  market: 'deku-tree',
  'hyrule-castle': 'market',
  'lon-lon-ranch': 'hyrule-field',
  'kakariko-village': 'hyrule-castle',
  'graveyard': 'kakariko-village',
  'death-mountain-trail': 'hyrule-castle',
  'goron-city': 'hyrule-castle',
  'dodongos-cavern': 'goron-city',
  'death-mountain-crater': 'goron-city',
  'fire-temple': 'goron-city',
  'zoras-river': 'kakariko-village',
  'zoras-domain': 'hyrule-castle',
  'zoras-fountain': 'lake-hylia',
  'jabu-jabus-belly': 'zoras-fountain',
  'ice-cavern': 'zoras-fountain',
  'forest-temple': 'graveyard',
  'bottom-of-the-well': 'kakariko-village',
  'water-temple': 'ice-cavern',
  'shadow-temple': 'bottom-of-the-well',
  'gerudo-fortress': 'gerudo-valley',
  'gerudo-training-ground': 'gerudo-fortress',
  'haunted-wasteland': 'gerudo-fortress',
  'desert-colossus': 'haunted-wasteland',
  'spirit-temple': 'desert-colossus',
  'ganons-castle': 'outside-ganons-castle',
};

export function resolveRegionLockDetails(
  region: Region,
  summary: RegionProgressSummary,
  evaluatedSecrets: EvaluatedSecret[],
): {
  isRegionLocked: boolean;
  reason: string | null;
  prerequisiteRegionId: string | null;
} {
  const extSummary = summary as RegionProgressSummary & ExtendedGuidedRegionSummary;
  const lockedEval = evaluatedSecrets.find(
    (ev) => (ev as EvaluatedSecret & ExtendedEvaluatedSecretFields).isRegionLocked,
  ) as (EvaluatedSecret & ExtendedEvaluatedSecretFields) | undefined;

  const isRegionLocked = extSummary.isReachable === false || Boolean(lockedEval);
  if (!isRegionLocked) {
    return { isRegionLocked: false, reason: null, prerequisiteRegionId: null };
  }

  const reason =
    extSummary.reachabilityBlocker ??
    lockedEval?.regionLockReason ??
    'Complete earlier story prerequisites to reach this area.';

  // Try explicit reachabilityBlockerReqId from engine-data first, then text/missingIds heuristics
  const BLOCKER_REQ_REGION_OVERRIDES: Record<string, string> = {
    'stone-emerald': 'deku-tree',
    'stone-ruby': 'dodongos-cavern',
    'stone-sapphire': 'jabu-jabus-belly',
  };
  const lower = reason.toLowerCase();
  let prereqRegionId: string | null = null;
  if (extSummary.reachabilityBlockerReqId) {
    prereqRegionId =
      BLOCKER_REQ_REGION_OVERRIDES[extSummary.reachabilityBlockerReqId] ??
      REQUIREMENT_SOURCE_REGION[extSummary.reachabilityBlockerReqId] ??
      null;
  }
  if (!prereqRegionId) {
    if (lower.includes('deku tree') || lower.includes('emerald')) {
      prereqRegionId = 'deku-tree';
    } else if (lower.includes("zelda's letter") || lower.includes('hyrule castle')) {
      prereqRegionId = 'hyrule-castle';
    } else if (lower.includes('bracelet') || lower.includes('darunia')) {
      prereqRegionId = 'goron-city';
    } else if (lower.includes('ruto') || lower.includes('letter in a bottle')) {
      prereqRegionId = 'lake-hylia';
    } else if (lower.includes('hookshot')) {
      prereqRegionId = 'graveyard';
    } else if (lower.includes('iron boots')) {
      prereqRegionId = 'ice-cavern';
    } else if (
      lower.includes('nocturne') ||
      lower.includes('dins fire') ||
      lower.includes("din's fire")
    ) {
      prereqRegionId = 'kakariko-village';
    } else if (lockedEval) {
      for (const reqId of lockedEval.missingPrimaryIds) {
        const src = BLOCKER_REQ_REGION_OVERRIDES[reqId] ?? REQUIREMENT_SOURCE_REGION[reqId];
        if (src && src !== region.id) {
          prereqRegionId = src;
          break;
        }
      }
    }
  }

  if (!prereqRegionId) {
    prereqRegionId = REGION_PREREQUISITE_FALLBACK[region.id] ?? 'kokiri-forest';
  }
  if (prereqRegionId === region.id) {
    prereqRegionId = region.parentRegionId ?? 'kokiri-forest';
  }

  return {
    isRegionLocked: true,
    reason,
    prerequisiteRegionId: prereqRegionId,
  };
}

export function sortSecretsInOptimalOrder(
  items: EvaluatedSecret[],
  areaGuide?: AreaWalkthroughGuide,
): EvaluatedSecret[] {
  if (!areaGuide || areaGuide.phases.length === 0) {
    return items;
  }
  const orderIndex = new Map<string, number>();
  let rank = 0;
  for (const phase of areaGuide.phases) {
    for (const secretId of phase.secretIds) {
      if (!orderIndex.has(secretId)) {
        orderIndex.set(secretId, rank);
        rank += 1;
      }
    }
  }

  return [...items].sort((a, b) => {
    const ra = orderIndex.get(a.secret.id) ?? 9999;
    const rb = orderIndex.get(b.secret.id) ?? 9999;
    if (ra !== rb) return ra - rb;
    return 0;
  });
}

export function suggestNextDestinationRegion(
  currentRegion: Region,
  regionSummaries: Record<string, RegionProgressSummary>,
): Region | null {
  const isCandidateReady = (id: string): boolean => {
    if (id === currentRegion.id) return false;
    const sum = regionSummaries[id] as
      | (RegionProgressSummary & ExtendedGuidedRegionSummary)
      | undefined;
    if (!sum || sum.isComplete || sum.isReachable === false) return false;
    return sum.readyNowCount > 0;
  };

  // 1. Attached dungeons of current hub
  const attached = ATTACHED_DUNGEONS_BY_REGION[currentRegion.id] ?? [];
  for (const child of attached) {
    if (isCandidateReady(child.id)) return child;
  }

  // 2. Parent hub if currently inside a dungeon
  if (currentRegion.parentRegionId && isCandidateReady(currentRegion.parentRegionId)) {
    return REGION_BY_ID[currentRegion.parentRegionId] ?? null;
  }

  // 3. Directly connected neighbors with ready items
  const readyNeighbors = currentRegion.connectedRegions
    .filter(isCandidateReady)
    .map((id) => REGION_BY_ID[id])
    .filter((r): r is Region => Boolean(r))
    .sort(
      (a, b) =>
        (regionSummaries[b.id]?.readyNowCount ?? 0) -
        (regionSummaries[a.id]?.readyNowCount ?? 0),
    );
  if (readyNeighbors[0]) {
    return readyNeighbors[0];
  }

  // 4. Any reachable region across Hyrule with ready items
  const globalReady = REGIONS.filter((r) => isCandidateReady(r.id)).sort(
    (a, b) =>
      (regionSummaries[b.id]?.readyNowCount ?? 0) -
      (regionSummaries[a.id]?.readyNowCount ?? 0),
  );
  return globalReady[0] ?? null;
}

export interface CoPilotPanelProps {
  region: Region;
  summary: RegionProgressSummary;
  state: PlayerProgressState;
  effectiveRequirements: Set<string>;
  regionSummaries: Record<string, RegionProgressSummary>;
  areaGuide?: AreaWalkthroughGuide;
  evaluatedSecrets: EvaluatedSecret[];
  doNowSecrets: EvaluatedSecret[];
  laterGearSecrets: EvaluatedSecret[];
  laterEraSecrets: EvaluatedSecret[];
  completedSecrets: EvaluatedSecret[];
  activeStepIndex: number;
  activeTrailSecretIds: string[];
  hideLaterVisits: boolean;
  activePopoverReqId: string | null;
  onSelectStepIndex: (index: number) => void;
  onSelectSecret: (secretId: string) => void;
  onToggleHideLaterVisits: (hide: boolean) => void;
  onToggleSecret: (secretId: string, completed?: boolean) => void;
  onSelectRegion: (regionId: string) => void;
  onSelectRequirementPill: (reqId: string, triggerEl: HTMLButtonElement) => void;
  onOpenSongbook?: (songId?: string) => void;
}

export const CoPilotPanel: React.FC<CoPilotPanelProps> = ({
  region,
  summary,
  state,
  effectiveRequirements,
  regionSummaries,
  evaluatedSecrets,
  doNowSecrets,
  laterGearSecrets,
  laterEraSecrets,
  completedSecrets,
  activeStepIndex,
  activeTrailSecretIds,
  hideLaterVisits,
  activePopoverReqId,
  onSelectStepIndex,
  onSelectSecret,
  onToggleHideLaterVisits,
  onToggleSecret,
  onSelectRegion,
  onSelectRequirementPill,
  onOpenSongbook,
}) => {
  const lockDetails = resolveRegionLockDetails(region, summary, evaluatedSecrets);
  const prereqRegion = lockDetails.prerequisiteRegionId
    ? REGION_BY_ID[lockDetails.prerequisiteRegionId]
    : undefined;

  const clampedIndex =
    doNowSecrets.length > 0
      ? Math.min(Math.max(0, activeStepIndex), doNowSecrets.length - 1)
      : 0;
  const activeEvaluated = doNowSecrets[clampedIndex] ?? null;

  const totalLaterCount = laterGearSecrets.length + laterEraSecrets.length;
  const suggestedNextRegion =
    doNowSecrets.length === 0 ? suggestNextDestinationRegion(region, regionSummaries) : null;

  const eraStatusText = effectiveRequirements.has('era-adult')
    ? effectiveRequirements.has('time-travel')
      ? 'Child & Adult Eras Active'
      : 'Adult Era Active'
    : 'Child Era Active';

  const resolveSongButtonsForSecret = (ev: EvaluatedSecret): string[] => {
    if (ev.secret.songButtons && ev.secret.songButtons.length > 0) {
      if (ev.secret.id === 'song-scarecrow' && state.customScarecrowNotes) {
        return parseNoteTokens(state.customScarecrowNotes);
      }
      return ev.secret.songButtons;
    }
    for (const reqId of ev.secret.requiredIds) {
      const song = SONGS_AND_QUESTS.ocarinaSongs.find((s) => s.id === reqId);
      if (song) {
        if (song.id === 'song-scarecrow' && state.customScarecrowNotes) {
          return parseNoteTokens(state.customScarecrowNotes);
        }
        if (song.switch2Buttons.length > 0) {
          return song.switch2Buttons;
        }
      }
    }
    return [];
  };

  const handleMarkDoneAndNext = () => {
    if (!activeEvaluated) return;
    const nextItem = doNowSecrets[clampedIndex + 1] ?? doNowSecrets[0] ?? null;
    onToggleSecret(activeEvaluated.secret.id, true);
    if (nextItem && nextItem.secret.id !== activeEvaluated.secret.id) {
      onSelectSecret(nextItem.secret.id);
    }
  };

  return (
    <div className="guided-lens-panel-inner" data-testid="copilot-panel">
      {/* "Where You Are" Header */}
      <header className="copilot-where-header" data-testid="copilot-where-header">
        <div className="copilot-where-header__top">
          <div>
            <span className="copilot-where-eyebrow">Where You Are · {eraStatusText}</span>
            <h2 className="copilot-where-title">{region.name}</h2>
          </div>

          <button
            type="button"
            className="copilot-map-declutter-btn"
            data-testid="copilot-hide-later-toggle"
            aria-pressed={hideLaterVisits}
            onClick={() => onToggleHideLaterVisits(!hideLaterVisits)}
          >
            <EyeOff size={12} aria-hidden="true" />
            <span>{hideLaterVisits ? 'Map: Current Visit Only' : 'Map: Showing All Pins'}</span>
          </button>
        </div>

        <div className="copilot-progress-row">
          <span>
            <strong>
              {summary.completedCount}/{summary.totalCount}
            </strong>{' '}
            Secrets Done ({summary.percent}%)
          </span>
          <span>
            {lockDetails.isRegionLocked
              ? '🔒 Area Locked'
              : doNowSecrets.length > 0
                ? `${doNowSecrets.length} Doable Right Now`
                : '✓ Visit Cleared'}
          </span>
        </div>
      </header>

      {/* Whole-Region Locked Banner with 1-Click Prerequisite Jump */}
      {lockDetails.isRegionLocked && (
        <section
          className="copilot-region-lock-card"
          data-testid="copilot-region-locked-banner"
          aria-label="Area reachability lock"
        >
          <div className="copilot-region-lock-card__head">
            <Lock size={16} aria-hidden="true" />
            <span>Cannot Reach {region.name} Yet</span>
          </div>
          <p className="copilot-region-lock-card__desc">
            <FormattedGuideText text={lockDetails.reason ?? ''} />
          </p>
          {prereqRegion && (
            <button
              type="button"
              className="copilot-jump-prereq-btn"
              data-testid="copilot-jump-prereq-btn"
              onClick={() => onSelectRegion(prereqRegion.id)}
            >
              <span>Jump to Prerequisite: {prereqRegion.name}</span>
              <ArrowRight size={14} aria-hidden="true" />
            </button>
          )}
        </section>
      )}

      {/* Single Focused "Do This Next" Step Card OR Visit Complete Card */}
      {!lockDetails.isRegionLocked && activeEvaluated ? (
        <article className="copilot-step-card" data-testid="copilot-active-step-card">
          <div className="copilot-step-card__eyebrow-row">
            <span className="copilot-step-pill">
              <span>🧭 Do This Next</span>
              <span>
                · Step {clampedIndex + 1} of {doNowSecrets.length}
              </span>
            </span>

            {doNowSecrets.length > 1 && (
              <div className="copilot-step-pager" role="group" aria-label="Step navigation">
                <button
                  type="button"
                  className="copilot-pager-btn"
                  data-testid="copilot-prev-step-btn"
                  aria-label="Previous ready objective"
                  disabled={clampedIndex <= 0}
                  onClick={() => {
                    const nextIdx = Math.max(0, clampedIndex - 1);
                    onSelectStepIndex(nextIdx);
                    if (doNowSecrets[nextIdx]) {
                      onSelectSecret(doNowSecrets[nextIdx].secret.id);
                    }
                  }}
                >
                  <ChevronLeft size={14} aria-hidden="true" />
                </button>
                <button
                  type="button"
                  className="copilot-pager-btn"
                  data-testid="copilot-next-step-btn"
                  aria-label="Next ready objective"
                  disabled={clampedIndex >= doNowSecrets.length - 1}
                  onClick={() => {
                    const nextIdx = Math.min(doNowSecrets.length - 1, clampedIndex + 1);
                    onSelectStepIndex(nextIdx);
                    if (doNowSecrets[nextIdx]) {
                      onSelectSecret(doNowSecrets[nextIdx].secret.id);
                    }
                  }}
                >
                  <ChevronRight size={14} aria-hidden="true" />
                </button>
              </div>
            )}
          </div>

          {/* Category + Era + Environmental Condition Badges */}
          <div className="secret-card-badges">
            <span className={`secret-badge badge-cat cat-${activeEvaluated.secret.category}`}>
              {formatSecretCategoryLabel(
                activeEvaluated.secret.category,
                activeEvaluated.secret.skulltulaNumber,
                (activeEvaluated.secret as typeof activeEvaluated.secret & { subCategory?: string })
                  .subCategory,
              )}
            </span>
            <span className={`secret-badge badge-era era-${activeEvaluated.secret.era}`}>
              {activeEvaluated.secret.era === 'child'
                ? 'Child'
                : activeEvaluated.secret.era === 'adult'
                  ? 'Adult'
                  : activeEvaluated.secret.era === 'cross-era'
                    ? 'Cross-Era'
                    : 'Both Eras'}
            </span>
            {deriveEnvironmentalConditions(activeEvaluated).map((cond) => (
              <EnvironmentalConditionBadge
                key={cond.key}
                condition={cond}
                secretId={activeEvaluated.secret.id}
              />
            ))}
            {activeEvaluated.secret.switch2Status === 'new-switch2' && (
              <span className="secret-badge badge-switch2 is-new">
                <Sparkles size={11} aria-hidden="true" />
                NEW IN SWITCH 2
              </span>
            )}
          </div>

          <h3 className="copilot-step-title">{activeEvaluated.secret.title}</h3>

          {activeEvaluated.secret.locationHint && (
            <div className="secret-location-hint">
              <MapPin size={13} aria-hidden="true" />
              <span>
                <FormattedGuideText text={activeEvaluated.secret.locationHint} />
              </span>
            </div>
          )}

          {activeEvaluated.status === 'available-via-alt' && activeEvaluated.readyAltMethod && (
            <div className="secret-early-trick-banner" data-testid="copilot-early-trick-banner">
              <div className="early-trick-header">
                <Zap size={14} aria-hidden="true" />
                <span>Early Trick Ready Now</span>
              </div>
              <p className="early-trick-text">
                <FormattedGuideText text={activeEvaluated.readyAltMethod.label} />
              </p>
            </div>
          )}

          {(() => {
            const notes = resolveSongButtonsForSecret(activeEvaluated);
            if (notes.length === 0) return null;
            return (
              <div className="secret-inline-song-row" data-testid="copilot-inline-song-notes">
                <NoteSequence buttons={notes} size="sm" />
                {onOpenSongbook && (
                  <button
                    type="button"
                    className="secret-songbook-link"
                    onClick={() => onOpenSongbook(activeEvaluated.secret.id)}
                  >
                    Songbook
                  </button>
                )}
              </div>
            );
          })()}

          <p className="copilot-step-prose">
            <FormattedGuideText text={activeEvaluated.secret.howToGet} />
          </p>

          {activeEvaluated.secret.switch2Notes &&
            activeEvaluated.secret.switch2Notes.trim() !==
              activeEvaluated.secret.howToGet.trim() && (
              <div
                className="secret-callout secret-callout--switch2"
                data-testid="copilot-switch2-note"
              >
                <Sparkles size={13} aria-hidden="true" />
                <div>
                  <strong className="secret-callout__label">Switch 2 Remake:</strong>{' '}
                  <FormattedGuideText text={activeEvaluated.secret.switch2Notes} />
                </div>
              </div>
            )}

          {activeEvaluated.secret.proTip && (
            <div className="secret-callout secret-callout--protip" data-testid="copilot-protip">
              <Lightbulb size={13} aria-hidden="true" />
              <div>
                <strong className="secret-callout__label">Pro Tip:</strong>{' '}
                <FormattedGuideText text={activeEvaluated.secret.proTip} />
              </div>
            </div>
          )}

          {activeEvaluated.secret.requiredIds.length > 0 && (
            <div className="secret-reqs-footer">
              <span className="secret-reqs-label">Gear / Melodies Used:</span>
              <div className="secret-reqs-pills">
                {activeEvaluated.secret.requiredIds.map((reqId) => (
                  <RequirementPill
                    key={reqId}
                    reqId={reqId}
                    isSatisfied={effectiveRequirements.has(reqId)}
                    isActive={activePopoverReqId === reqId}
                    onSelect={onSelectRequirementPill}
                  />
                ))}
              </div>
            </div>
          )}

          <button
            type="button"
            className="copilot-mark-done-btn"
            data-testid="copilot-mark-done-next-btn"
            onClick={handleMarkDoneAndNext}
          >
            <Check size={17} strokeWidth={3} aria-hidden="true" />
            <span>
              {doNowSecrets.length > 1 ? 'Mark Done & Next →' : 'Mark Done & Complete Visit ✓'}
            </span>
          </button>

          {activeTrailSecretIds.length > 1 && (
            <div className="copilot-trail-strip" aria-label="Upcoming floor map trail">
              <span className="secret-reqs-label">Map Trail:</span>
              {activeTrailSecretIds.map((trailId, idx) => {
                const match = doNowSecrets.find((s) => s.secret.id === trailId);
                if (!match) return null;
                const isCurrent = idx === 0;
                return (
                  <button
                    key={trailId}
                    type="button"
                    className={`copilot-trail-chip${isCurrent ? ' is-current' : ''}`}
                    data-testid={`copilot-trail-chip-${idx + 1}`}
                    onClick={() => {
                      const targetIdx = doNowSecrets.findIndex((s) => s.secret.id === trailId);
                      if (targetIdx >= 0) onSelectStepIndex(targetIdx);
                      onSelectSecret(trailId);
                    }}
                  >
                    <strong>#{idx + 1}</strong>
                    <span>{match.secret.title}</span>
                  </button>
                );
              })}
            </div>
          )}
        </article>
      ) : !lockDetails.isRegionLocked ? (
        <section className="copilot-complete-card" data-testid="copilot-visit-complete-card">
          <h3 className="copilot-complete-card__title">
            <PartyPopper
              size={16}
              style={{ display: 'inline', verticalAlign: '-2px', marginRight: 6 }}
              aria-hidden="true"
            />
            {summary.isComplete ? `100% ${region.name} Complete!` : 'Visit Complete!'}
          </h3>
          <p className="copilot-complete-card__desc">
            {summary.isComplete
              ? `Every collectible and objective in ${region.name} is checked off!`
              : totalLaterCount > 0
                ? `You have grabbed everything doable in ${region.name} with your current gear! ${totalLaterCount} ${
                    totalLaterCount === 1 ? 'item is' : 'items are'
                  } safely saved below for a future visit.`
                : `Nothing else is left to grab right now in ${region.name}.`}
          </p>
          {suggestedNextRegion && (
            <button
              type="button"
              className="copilot-next-dest-btn"
              data-testid="copilot-next-destination-btn"
              onClick={() => onSelectRegion(suggestedNextRegion.id)}
            >
              <span>Suggested Next Destination → {suggestedNextRegion.name}</span>
              <ArrowRight size={14} aria-hidden="true" />
            </button>
          )}
        </section>
      ) : null}

      {/* Collapsed "Save for Later Visits" Accordion */}
      {totalLaterCount > 0 && (
        <details className="guided-later-accordion" data-testid="copilot-later-accordion">
          <summary
            className="guided-later-accordion__summary"
            data-testid="copilot-later-summary"
          >
            <span>🔒 Save for Later Visits ({totalLaterCount})</span>
            <ChevronDown
              size={15}
              className="guided-later-accordion__chevron"
              aria-hidden="true"
            />
          </summary>

          <div className="guided-later-accordion__body">
            {laterGearSecrets.length > 0 && (
              <div className="guided-later-subgroup" data-testid="copilot-later-gear-group">
                <p className="guided-later-subgroup__title">
                  <Wrench size={14} aria-hidden="true" />
                  <span>Come Back With New Gear ({laterGearSecrets.length})</span>
                </p>
                <div className="dossier-card-stack">
                  {laterGearSecrets.map((ev) => (
                    <SecretCard
                      key={ev.secret.id}
                      evaluated={ev}
                      effectiveRequirements={effectiveRequirements}
                      customScarecrowNotes={state.customScarecrowNotes}
                      activePopoverReqId={activePopoverReqId}
                      compact
                      onFocusOnMap={onSelectSecret}
                      onToggleSecret={onToggleSecret}
                      onSelectRequirementPill={onSelectRequirementPill}
                      onOpenSongbook={onOpenSongbook}
                    />
                  ))}
                </div>
              </div>
            )}

            {laterEraSecrets.length > 0 && (
              <div className="guided-later-subgroup" data-testid="copilot-later-era-group">
                <p className="guided-later-subgroup__title">
                  <Hourglass size={14} aria-hidden="true" />
                  <span>Unlocks in Adult / Other Era ({laterEraSecrets.length})</span>
                </p>
                <div className="dossier-card-stack">
                  {laterEraSecrets.map((ev) => (
                    <SecretCard
                      key={ev.secret.id}
                      evaluated={ev}
                      effectiveRequirements={effectiveRequirements}
                      customScarecrowNotes={state.customScarecrowNotes}
                      activePopoverReqId={activePopoverReqId}
                      compact
                      onFocusOnMap={onSelectSecret}
                      onToggleSecret={onToggleSecret}
                      onSelectRequirementPill={onSelectRequirementPill}
                      onOpenSongbook={onOpenSongbook}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </details>
      )}

      {/* Optional Collapsed Completed List */}
      {completedSecrets.length > 0 && (
        <details className="guided-later-accordion" data-testid="copilot-completed-accordion">
          <summary className="guided-later-accordion__summary">
            <span>✓ Completed in {region.name} ({completedSecrets.length})</span>
            <ChevronDown
              size={15}
              className="guided-later-accordion__chevron"
              aria-hidden="true"
            />
          </summary>
          <div className="guided-later-accordion__body">
            <div className="dossier-card-stack">
              {completedSecrets.map((ev) => (
                <SecretCard
                  key={ev.secret.id}
                  evaluated={ev}
                  effectiveRequirements={effectiveRequirements}
                  customScarecrowNotes={state.customScarecrowNotes}
                  activePopoverReqId={activePopoverReqId}
                  compact
                  onFocusOnMap={onSelectSecret}
                  onToggleSecret={onToggleSecret}
                  onSelectRequirementPill={onSelectRequirementPill}
                  onOpenSongbook={onOpenSongbook}
                />
              ))}
            </div>
          </div>
        </details>
      )}
    </div>
  );
};
