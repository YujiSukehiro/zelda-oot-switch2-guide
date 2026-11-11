import React, { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { ArrowLeft, Building2, Compass, GitBranch } from 'lucide-react';
import {
  AREA_GUIDE_BY_REGION_ID,
  ATTACHED_DUNGEONS_BY_REGION,
  REGION_BY_ID,
  REGIONS,
} from '../../data';
import { categorizeRegionSecrets, computeRegionSummary } from '../../lib/gating';
import type {
  AreaWalkthroughGuide,
  EvaluatedSecret,
  PlayerProgressState,
  Region,
  RegionProgressSummary,
  UnlockDelta,
} from '../../types/zelda';
import { RequirementPopover } from '../region';
import {
  CoPilotPanel,
  resolveVisitStage,
  sortSecretsInOptimalOrder,
} from './CoPilotPanel';
import { QuestChainPanel } from './QuestChainPanel';
import { RoomExplorerPanel, type SecretRoomAssignment } from './RoomExplorerPanel';
import './guided.css';

export type GuidedLensId = 'copilot' | 'rooms' | 'quests';

/**
 * Render-prop contract passed from `<GuidedAreaWorkspace />` directly to
 * `<AreaSubmapView />` in `src/App.tsx` with zero circular dependencies.
 */
export interface GuidedSubmapControlProps {
  region: Region;
  evaluatedSecrets: EvaluatedSecret[];
  selectedSecretId: string | null;
  activeTrailSecretIds: string[];
  selectedRoomId: string | null;
  hideLaterVisits: boolean;
  onSelectSecret: (secretId: string) => void;
  onToggleSecret: (secretId: string, completed?: boolean) => void;
  onSelectRoom: (roomId: string | null) => void;
  onSelectConnectedRegion: (regionId: string) => void;
  onBackToWorldMap: () => void;
}

export interface GuidedAreaWorkspaceProps {
  regionId: string;
  state: PlayerProgressState;
  effectiveRequirements: Set<string>;
  regionSummaries: Record<string, RegionProgressSummary>;
  areaGuide?: AreaWalkthroughGuide;
  evaluatedSecretsOverride?: EvaluatedSecret[];
  secretRoomMap?: Readonly<Record<string, SecretRoomAssignment>>;
  lastUnlockDelta?: UnlockDelta | null;
  activeLens?: GuidedLensId;
  onLensChange?: (lens: GuidedLensId) => void;
  renderSubmap: (submapProps: GuidedSubmapControlProps) => ReactNode;
  onSelectRegion: (regionId: string) => void;
  onBackToWorldMap: () => void;
  onToggleSecret: (secretId: string, completed?: boolean) => void;
  onToggleRequirement?: (requirementId: string, owned?: boolean) => void;
  onOpenSongbook?: (songId?: string) => void;
}

export const GuidedAreaWorkspace: React.FC<GuidedAreaWorkspaceProps> = ({
  regionId,
  state,
  effectiveRequirements,
  regionSummaries,
  areaGuide,
  evaluatedSecretsOverride,
  secretRoomMap,
  lastUnlockDelta,
  activeLens,
  onLensChange,
  renderSubmap,
  onSelectRegion,
  onBackToWorldMap,
  onToggleSecret,
  onToggleRequirement,
  onOpenSongbook,
}) => {
  const [uncontrolledLens, setUncontrolledLens] = useState<GuidedLensId>('copilot');
  const [selectedSecretId, setSelectedSecretId] = useState<string | null>(null);
  const [activeStepIndex, setActiveStepIndex] = useState<number>(0);
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [hideLaterVisits, setHideLaterVisits] = useState<boolean>(true);
  const [mobilePane, setMobilePane] = useState<'guide' | 'map'>('guide');
  const [activePopoverReqId, setActivePopoverReqId] = useState<string | null>(null);

  const lensTabRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const lastPillTriggerRef = useRef<HTMLButtonElement | null>(null);

  const effectiveLens: GuidedLensId = activeLens ?? uncontrolledLens;
  const setLens = useCallback(
    (nextLens: GuidedLensId) => {
      if (onLensChange) {
        onLensChange(nextLens);
      } else {
        setUncontrolledLens(nextLens);
      }
    },
    [onLensChange],
  );

  const region = REGION_BY_ID[regionId] ?? REGIONS[0];
  const resolvedAreaGuide = areaGuide ?? AREA_GUIDE_BY_REGION_ID[region.id];

  // Reset per-area selection state when navigating to another region
  useEffect(() => {
    setSelectedSecretId(null);
    setActiveStepIndex(0);
    setSelectedRoomId(null);
    setActivePopoverReqId(null);
  }, [region.id]);

  const evaluatedSecrets = useMemo<EvaluatedSecret[]>(() => {
    if (evaluatedSecretsOverride) {
      return evaluatedSecretsOverride;
    }
    return categorizeRegionSecrets(region.id, state, 'blocker', {
      effectiveReqs: effectiveRequirements,
    }).allEvaluated;
  }, [effectiveRequirements, evaluatedSecretsOverride, region.id, state]);

  const summary = useMemo(
    () =>
      regionSummaries[region.id] ??
      computeRegionSummary(region.id, state, effectiveRequirements),
    [effectiveRequirements, region.id, regionSummaries, state],
  );

  const { doNowSecrets, laterGearSecrets, laterEraSecrets, completedSecrets } = useMemo(() => {
    const doNowRaw: EvaluatedSecret[] = [];
    const laterGear: EvaluatedSecret[] = [];
    const laterEra: EvaluatedSecret[] = [];
    const completed: EvaluatedSecret[] = [];

    for (const ev of evaluatedSecrets) {
      const stage = resolveVisitStage(ev, effectiveRequirements);
      if (stage === 'completed') {
        completed.push(ev);
      } else if (stage === 'do-now') {
        doNowRaw.push(ev);
      } else if (stage === 'later-era') {
        laterEra.push(ev);
      } else {
        laterGear.push(ev);
      }
    }

    return {
      doNowSecrets: sortSecretsInOptimalOrder(doNowRaw, resolvedAreaGuide),
      laterGearSecrets: laterGear,
      laterEraSecrets: laterEra,
      completedSecrets: completed,
    };
  }, [effectiveRequirements, evaluatedSecrets, resolvedAreaGuide]);

  const clampedStepIndex =
    doNowSecrets.length > 0
      ? Math.min(Math.max(0, activeStepIndex), doNowSecrets.length - 1)
      : 0;

  const activeTrailSecretIds = useMemo(
    () => doNowSecrets.slice(clampedStepIndex, clampedStepIndex + 3).map((ev) => ev.secret.id),
    [clampedStepIndex, doNowSecrets],
  );

  const effectiveSelectedSecretId =
    selectedSecretId && evaluatedSecrets.some((ev) => ev.secret.id === selectedSecretId)
      ? selectedSecretId
      : (doNowSecrets[clampedStepIndex]?.secret.id ?? null);

  const handleSelectSecret = useCallback(
    (secretId: string) => {
      setSelectedSecretId(secretId);
      const idx = doNowSecrets.findIndex((ev) => ev.secret.id === secretId);
      if (idx >= 0) {
        setActiveStepIndex(idx);
      }
    },
    [doNowSecrets],
  );

  const handleSelectRoom = useCallback(
    (roomId: string | null) => {
      setSelectedRoomId(roomId);
      if (roomId !== null && effectiveLens === 'copilot') {
        setLens('rooms');
      }
    },
    [effectiveLens, setLens],
  );

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

  // Family Hub <-> Attached Dungeon quick-switch pills
  const rootRegion = region.parentRegionId
    ? (REGION_BY_ID[region.parentRegionId] ?? region)
    : region;
  const attachedChildren = ATTACHED_DUNGEONS_BY_REGION[rootRegion.id] ?? [];
  const familyRegions = attachedChildren.length > 0 ? [rootRegion, ...attachedChildren] : [];

  const lenses: ReadonlyArray<{
    id: GuidedLensId;
    label: string;
    count?: number;
    icon: ReactNode;
  }> = [
    {
      id: 'copilot',
      label: 'Co-Pilot (GPS)',
      count: doNowSecrets.length,
      icon: <Compass size={14} aria-hidden="true" />,
    },
    {
      id: 'rooms',
      label: 'Room Explorer + Radar',
      count: evaluatedSecrets.length,
      icon: <Building2 size={14} aria-hidden="true" />,
    },
    {
      id: 'quests',
      label: 'Quest & Dependency Flow',
      icon: <GitBranch size={14} aria-hidden="true" />,
    },
  ];

  const handleLensTabKeyDown = (
    event: React.KeyboardEvent<HTMLButtonElement>,
    idx: number,
  ) => {
    let nextIdx: number | null = null;
    if (event.key === 'ArrowRight') {
      nextIdx = (idx + 1) % lenses.length;
    } else if (event.key === 'ArrowLeft') {
      nextIdx = (idx - 1 + lenses.length) % lenses.length;
    } else if (event.key === 'Home') {
      nextIdx = 0;
    } else if (event.key === 'End') {
      nextIdx = lenses.length - 1;
    }
    if (nextIdx !== null) {
      event.preventDefault();
      setLens(lenses[nextIdx].id);
      lensTabRefs.current[nextIdx]?.focus();
    }
  };

  const submapControlProps: GuidedSubmapControlProps = {
    region,
    evaluatedSecrets,
    selectedSecretId: effectiveSelectedSecretId,
    activeTrailSecretIds,
    selectedRoomId,
    hideLaterVisits,
    onSelectSecret: handleSelectSecret,
    onToggleSecret,
    onSelectRoom: handleSelectRoom,
    onSelectConnectedRegion: onSelectRegion,
    onBackToWorldMap,
  };

  return (
    <section
      className="guided-workspace"
      data-testid="guided-area-workspace"
      aria-label={`${region.name} Guided Area Workspace`}
    >
      {/* Top Bar: Back to World Map + Hub/Dungeon Family Pills + Mobile Pane Switcher */}
      <div className="guided-workspace__topbar">
        <div className="guided-workspace__nav-left">
          <button
            type="button"
            className="guided-back-world-btn"
            data-testid="guided-back-to-world-btn"
            onClick={onBackToWorldMap}
          >
            <ArrowLeft size={14} aria-hidden="true" />
            <span>Hyrule World Map</span>
          </button>

          {familyRegions.length > 1 && (
            <div
              className="guided-family-pills"
              role="group"
              aria-label={`${rootRegion.name} connected dungeons`}
            >
              {familyRegions.map((fam) => (
                <button
                  key={fam.id}
                  type="button"
                  className="guided-family-pill"
                  data-testid={`guided-family-${fam.id}`}
                  aria-pressed={fam.id === region.id}
                  onClick={() => onSelectRegion(fam.id)}
                >
                  <span>{fam.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div
          className="guided-mobile-pane-switcher"
          role="group"
          aria-label="Mobile layout view"
        >
          <button
            type="button"
            className="guided-mobile-pane-btn"
            data-testid="guided-mobile-pane-guide"
            aria-pressed={mobilePane === 'guide'}
            onClick={() => setMobilePane('guide')}
          >
            3-Lens Guide
          </button>
          <button
            type="button"
            className="guided-mobile-pane-btn"
            data-testid="guided-mobile-pane-map"
            aria-pressed={mobilePane === 'map'}
            onClick={() => setMobilePane('map')}
          >
            Floor Map
          </button>
        </div>
      </div>

      {/* Split-Screen Workspace: Left Interactive Area/Floor Map + Right 3-Lens Panel */}
      <div className="guided-workspace__split">
        <div
          className={`guided-workspace__map-pane${
            mobilePane === 'guide' ? ' is-mobile-hidden' : ''
          }`}
          data-testid="guided-submap-slot"
        >
          {renderSubmap(submapControlProps)}
        </div>

        <div
          className={`guided-workspace__lens-pane${
            mobilePane === 'map' ? ' is-mobile-hidden' : ''
          }`}
          data-testid="guided-lens-pane"
        >
          {/* 3-Lens Switcher (Only ONE lens visible at a time) */}
          <div
            role="tablist"
            aria-label="Area guide lenses"
            className="guided-lens-tablist"
            data-testid="guided-lens-tablist"
          >
            {lenses.map((lens, idx) => {
              const isSelected = effectiveLens === lens.id;
              return (
                <button
                  key={lens.id}
                  ref={(el) => {
                    lensTabRefs.current[idx] = el;
                  }}
                  id={`guided-lens-tab-${lens.id}`}
                  type="button"
                  role="tab"
                  data-testid={`guided-lens-tab-${lens.id}`}
                  aria-selected={isSelected}
                  tabIndex={isSelected ? 0 : -1}
                  className="guided-lens-tab"
                  onClick={() => setLens(lens.id)}
                  onKeyDown={(e) => handleLensTabKeyDown(e, idx)}
                >
                  {lens.icon}
                  <span>{lens.label}</span>
                  {typeof lens.count === 'number' && (
                    <span className="guided-lens-tab__count">{lens.count}</span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="guided-lens-panel-scroll">
            {/* Lens 1: Co-Pilot (GPS) */}
            <div
              role="tabpanel"
              aria-labelledby="guided-lens-tab-copilot"
              data-testid="guided-tabpanel-copilot"
              hidden={effectiveLens !== 'copilot'}
            >
              {effectiveLens === 'copilot' && (
                <CoPilotPanel
                  region={region}
                  summary={summary}
                  state={state}
                  effectiveRequirements={effectiveRequirements}
                  regionSummaries={regionSummaries}
                  areaGuide={resolvedAreaGuide}
                  evaluatedSecrets={evaluatedSecrets}
                  doNowSecrets={doNowSecrets}
                  laterGearSecrets={laterGearSecrets}
                  laterEraSecrets={laterEraSecrets}
                  completedSecrets={completedSecrets}
                  activeStepIndex={clampedStepIndex}
                  activeTrailSecretIds={activeTrailSecretIds}
                  hideLaterVisits={hideLaterVisits}
                  activePopoverReqId={activePopoverReqId}
                  onSelectStepIndex={setActiveStepIndex}
                  onSelectSecret={handleSelectSecret}
                  onToggleHideLaterVisits={setHideLaterVisits}
                  onToggleSecret={onToggleSecret}
                  onSelectRegion={onSelectRegion}
                  onSelectRequirementPill={handleOpenRequirementPopover}
                  onOpenSongbook={onOpenSongbook}
                />
              )}
            </div>

            {/* Lens 2: Room Explorer + Unlock Radar */}
            <div
              role="tabpanel"
              aria-labelledby="guided-lens-tab-rooms"
              data-testid="guided-tabpanel-rooms"
              hidden={effectiveLens !== 'rooms'}
            >
              {effectiveLens === 'rooms' && (
                <RoomExplorerPanel
                  region={region}
                  state={state}
                  effectiveRequirements={effectiveRequirements}
                  regionSummaries={regionSummaries}
                  areaGuide={resolvedAreaGuide}
                  evaluatedSecrets={evaluatedSecrets}
                  selectedRoomId={selectedRoomId}
                  selectedSecretId={effectiveSelectedSecretId}
                  secretRoomMap={secretRoomMap}
                  lastUnlockDelta={lastUnlockDelta}
                  activePopoverReqId={activePopoverReqId}
                  onSelectRoom={setSelectedRoomId}
                  onSelectSecret={handleSelectSecret}
                  onToggleSecret={onToggleSecret}
                  onSelectRegion={onSelectRegion}
                  onSelectRequirementPill={handleOpenRequirementPopover}
                  onOpenSongbook={onOpenSongbook}
                />
              )}
            </div>

            {/* Lens 3: Quest & Dependency Flow */}
            <div
              role="tabpanel"
              aria-labelledby="guided-lens-tab-quests"
              data-testid="guided-tabpanel-quests"
              hidden={effectiveLens !== 'quests'}
            >
              {effectiveLens === 'quests' && (
                <QuestChainPanel
                  region={region}
                  evaluatedSecrets={evaluatedSecrets}
                  effectiveRequirements={effectiveRequirements}
                  onSelectRegion={onSelectRegion}
                  onSelectSecret={handleSelectSecret}
                  onToggleSecret={onToggleSecret}
                  onSelectRequirementPill={handleOpenRequirementPopover}
                  onOpenSongbook={onOpenSongbook}
                />
              )}
            </div>
          </div>

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
      </div>
    </section>
  );
};
