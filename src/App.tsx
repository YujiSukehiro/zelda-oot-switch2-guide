import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { GuidedAreaWorkspace, type GuidedLensId } from './components/guided';
import { InventoryModal } from './components/inventory';
import { HyruleMapCanvas } from './components/map';
import { CatchUpModal, type CatchUpSelection } from './components/onboarding';
import { RegionDrawer } from './components/region';
import { isRouteStepComplete, OptimalRouteView, ResumeBanner } from './components/route';
import {
  BackupModal,
  LoadoutDock,
  OcarinaModal,
  QuestsModal,
  SearchModal,
  Switch2DiffModal,
  TopCommandBar,
  UnlockToast,
} from './components/sheets';
import { AreaSubmapView } from './components/submap';
import {
  AREA_GUIDE_BY_REGION_ID,
  OPTIMAL_ROUTE_CHAPTERS,
  REGIONS,
  REGION_BY_ID,
  ROUTE_CHAPTER_BY_ID,
  STORY_PRESETS,
} from './data';
import { getSecretRoomMapForRegion } from './data/submaps';
import {
  categorizeRegionSecrets,
  computeAllRegionSummaries,
  computeGlobalProgress,
  countCompletedSkulltulas,
  deriveEffectiveRequirements,
} from './lib/gating';
import { parseUrlHash, usePlayerProgress, useUrlHashState } from './lib/storage';
import type {
  CompanionSheetId,
  EraFilter,
  PlayerProgressState,
  ThemeMode,
  WorkspaceViewMode,
} from './types/zelda';
import './App.css';

const VALID_COMPANION_SHEETS = new Set<CompanionSheetId>([
  'ocarina',
  'quests',
  'diff',
  'search',
  'backup',
]);

const VALID_GUIDED_LENSES = new Set<GuidedLensId>(['copilot', 'rooms', 'quests']);

function shouldAutoPromptCatchUp(state: PlayerProgressState): boolean {
  if (state.hasCompletedOnboarding) return false;
  if (Object.keys(state.completedSecretIds).length > 0) return false;
  if (Object.keys(state.completedRouteStepIds ?? {}).length > 0) return false;
  if (state.bookmarkedRouteStepId || state.lastSession) return false;
  if (state.customScarecrowNotes.length > 0) return false;

  if (typeof window !== 'undefined') {
    const rawHash = window.location.hash.startsWith('#')
      ? window.location.hash.slice(1)
      : window.location.hash;
    if (rawHash.trim().length > 0) {
      return false;
    }
  }

  return true;
}

export function App() {
  const {
    state,
    isStoragePersisted,
    lastUnlockDelta,
    dismissUnlockDelta,
    toggleSecret,
    toggleRouteStep,
    setActiveRouteChapter,
    setBookmarkedRouteStep,
    setMapLayerMode,
    toggleRequirement,
    selectPreset,
    completeOnboarding,
    setEraFilter,
    setSwitch2Spotlight,
    setLoadoutMode,
    setScarecrowNotes,
    setTheme,
    importProgress,
    exportProgress,
    resetAllProgress,
  } = usePlayerProgress();

  const [hashState, updateHashState] = useUrlHashState();
  const [isLoadoutDockOpen, setIsLoadoutDockOpen] = useState<boolean>(false);
  const [isInventoryOpen, setIsInventoryOpen] = useState<boolean>(false);
  const [isCatchUpOpen, setIsCatchUpOpen] = useState<boolean>(() =>
    shouldAutoPromptCatchUp(state),
  );
  const [hideCompletedOnMap, setHideCompletedOnMap] = useState<boolean>(false);
  const [initialSongId, setInitialSongId] = useState<string | null>(null);
  const [highlightedStepId, setHighlightedStepId] = useState<string | null>(null);

  const didBootstrapHashSyncRef = useRef<boolean>(false);
  const wasAutoCatchUpPromptRef = useRef<boolean>(isCatchUpOpen);

  // If IndexedDB recovers an existing save asynchronously on mount, close auto-prompted onboarding
  useEffect(() => {
    if (wasAutoCatchUpPromptRef.current && !shouldAutoPromptCatchUp(state)) {
      wasAutoCatchUpPromptRef.current = false;
      setIsCatchUpOpen(false);
    }
  }, [state]);

  // Derived memoized progression views
  const effectiveRequirements = useMemo(() => deriveEffectiveRequirements(state), [state]);
  const regionSummaries = useMemo(() => computeAllRegionSummaries(state), [state]);
  const globalProgress = useMemo(() => computeGlobalProgress(state), [state]);
  const skulltulaCount = useMemo(
    () => countCompletedSkulltulas(state.completedSecretIds),
    [state.completedSecretIds],
  );

  // Bootstrap URL hash <-> persisted filter synchronization once on mount
  useEffect(() => {
    if (didBootstrapHashSyncRef.current || typeof window === 'undefined') {
      return;
    }
    didBootstrapHashSyncRef.current = true;

    const rawTrimmed = window.location.hash.startsWith('#')
      ? window.location.hash.slice(1)
      : window.location.hash;
    const rawParams = new URLSearchParams(rawTrimmed);
    const parsed = parseUrlHash(window.location.hash);

    const hasExplicitEra = rawParams.has('era');
    const hasExplicitSpotlight = rawParams.has('spotlight');

    if (hasExplicitEra && parsed.era !== state.activeEraFilter) {
      setEraFilter(parsed.era);
    }
    if (hasExplicitSpotlight && parsed.spotlight !== Boolean(state.switch2SpotlightOnly)) {
      setSwitch2Spotlight(parsed.spotlight);
    }

    const effectiveEra = hasExplicitEra ? parsed.era : state.activeEraFilter;
    const effectiveSpotlight = hasExplicitSpotlight
      ? parsed.spotlight
      : Boolean(state.switch2SpotlightOnly);

    if (effectiveEra !== parsed.era || effectiveSpotlight !== parsed.spotlight) {
      updateHashState({
        era: effectiveEra,
        spotlight: effectiveSpotlight,
      });
    }
  }, [
    setEraFilter,
    setSwitch2Spotlight,
    state.activeEraFilter,
    state.switch2SpotlightOnly,
    updateHashState,
  ]);

  // Keep persisted filters aligned when user navigates Back/Forward or edits location.hash
  useEffect(() => {
    if (typeof window === 'undefined') return undefined;
    const handleExternalHashChange = () => {
      const next = parseUrlHash(window.location.hash);
      setEraFilter(next.era);
      setSwitch2Spotlight(next.spotlight);
    };
    window.addEventListener('hashchange', handleExternalHashChange);
    return () => window.removeEventListener('hashchange', handleExternalHashChange);
  }, [setEraFilter, setSwitch2Spotlight]);

  // Sync theme attribute and browser chrome metadata (<meta name="color-scheme"> & theme-color)
  useEffect(() => {
    if (typeof document === 'undefined') return;
    const activeTheme: ThemeMode = state.theme === 'parchment' ? 'parchment' : 'dark';
    document.documentElement.dataset.theme = activeTheme;

    const colorSchemeMeta = document.querySelector('meta[name="color-scheme"]');
    if (colorSchemeMeta) {
      colorSchemeMeta.setAttribute('content', activeTheme === 'parchment' ? 'light' : 'dark');
    }

    const themeColorMeta = document.querySelector('meta[name="theme-color"]');
    if (themeColorMeta) {
      themeColorMeta.setAttribute(
        'content',
        activeTheme === 'parchment' ? '#f5efe0' : '#0b111e',
      );
    }
  }, [state.theme]);

  const activeView: WorkspaceViewMode =
    hashState.view === 'route'
      ? 'route'
      : hashState.view === 'area'
        ? 'area'
        : 'map';

  const activeLens: GuidedLensId =
    hashState.lens && VALID_GUIDED_LENSES.has(hashState.lens as GuidedLensId)
      ? (hashState.lens as GuidedLensId)
      : 'copilot';

  const activeChapterId: string | null = useMemo(() => {
    if (hashState.chapterId && ROUTE_CHAPTER_BY_ID[hashState.chapterId]) {
      return hashState.chapterId;
    }
    if (state.activeRouteChapterId && ROUTE_CHAPTER_BY_ID[state.activeRouteChapterId]) {
      return state.activeRouteChapterId;
    }
    return null;
  }, [hashState.chapterId, state.activeRouteChapterId]);

  const selectedRegionId =
    hashState.regionId && REGION_BY_ID[hashState.regionId] ? hashState.regionId : null;

  const areaRegionId = useMemo(() => {
    if (selectedRegionId) return selectedRegionId;
    if (state.lastSession?.regionId && REGION_BY_ID[state.lastSession.regionId]) {
      return state.lastSession.regionId;
    }
    return 'kokiri-forest';
  }, [selectedRegionId, state.lastSession?.regionId]);

  const areaRegion = REGION_BY_ID[areaRegionId] ?? REGIONS[0];

  const areaEvaluatedSecrets = useMemo(
    () =>
      categorizeRegionSecrets(areaRegion.id, state, 'blocker', {
        effectiveReqs: effectiveRequirements,
      }).allEvaluated,
    [areaRegion.id, effectiveRequirements, state],
  );

  const areaSecretRoomMap = useMemo(
    () => getSecretRoomMapForRegion(areaRegion, areaEvaluatedSecrets),
    [areaEvaluatedSecrets, areaRegion],
  );

  const activeSheet: CompanionSheetId | null =
    hashState.sheet && VALID_COMPANION_SHEETS.has(hashState.sheet as CompanionSheetId)
      ? (hashState.sheet as CompanionSheetId)
      : null;

  const handleViewModeChange = useCallback(
    (nextView: WorkspaceViewMode) => {
      if (nextView === 'route') {
        updateHashState({
          view: 'route',
          chapterId: activeChapterId ?? undefined,
          lens: undefined,
        });
      } else if (nextView === 'area') {
        updateHashState({
          view: 'area',
          chapterId: null,
          regionId: areaRegionId,
          lens: activeLens,
        });
      } else {
        updateHashState({
          view: 'map',
          chapterId: null,
          lens: undefined,
        });
      }
    },
    [activeChapterId, activeLens, areaRegionId, updateHashState],
  );

  const handleEnterAreaWorkspace = useCallback(
    (regionId: string, lens?: GuidedLensId) => {
      if (!REGION_BY_ID[regionId]) return;
      updateHashState({
        view: 'area',
        chapterId: null,
        regionId,
        lens: lens ?? activeLens,
      });
    },
    [activeLens, updateHashState],
  );

  const handleLensChange = useCallback(
    (nextLens: GuidedLensId) => {
      updateHashState({
        view: 'area',
        chapterId: null,
        regionId: areaRegionId,
        lens: nextLens,
      });
    },
    [areaRegionId, updateHashState],
  );

  const handleBackToWorldMap = useCallback(() => {
    updateHashState({
      view: 'map',
      chapterId: null,
      regionId: null,
      lens: undefined,
    });
  }, [updateHashState]);

  const handleSelectRouteChapter = useCallback(
    (chapterId: string) => {
      if (!ROUTE_CHAPTER_BY_ID[chapterId]) return;
      setActiveRouteChapter(chapterId);
      setHighlightedStepId(null);
      updateHashState({
        view: 'route',
        chapterId,
        lens: undefined,
      });
    },
    [setActiveRouteChapter, updateHashState],
  );

  const handleResumeRoute = useCallback(
    (chapterId: string, stepId: string) => {
      setActiveRouteChapter(chapterId);
      setHighlightedStepId(stepId);
      updateHashState({
        view: 'route',
        chapterId,
        lens: undefined,
      });
    },
    [setActiveRouteChapter, updateHashState],
  );

  const handleOpenOptimalRouteForRegion = useCallback(
    (regionId: string) => {
      let matchedChapterId: string | null = null;
      let matchedStepId: string | null = null;

      // Prefer the earliest unfinished step in that region
      for (const chapter of OPTIMAL_ROUTE_CHAPTERS) {
        const unfinished = chapter.steps.find(
          (s) => s.regionId === regionId && !isRouteStepComplete(s, state),
        );
        if (unfinished) {
          matchedChapterId = chapter.id;
          matchedStepId = unfinished.id;
          break;
        }
      }

      // Fallback: first step in that region across the route
      if (!matchedChapterId) {
        for (const chapter of OPTIMAL_ROUTE_CHAPTERS) {
          const firstMatch = chapter.steps.find((s) => s.regionId === regionId);
          if (firstMatch) {
            matchedChapterId = chapter.id;
            matchedStepId = firstMatch.id;
            break;
          }
        }
      }

      const targetChapter = matchedChapterId ?? OPTIMAL_ROUTE_CHAPTERS[0]?.id ?? null;
      if (targetChapter) {
        setActiveRouteChapter(targetChapter);
      }
      setHighlightedStepId(matchedStepId);
      updateHashState({
        view: 'route',
        chapterId: targetChapter,
        lens: undefined,
      });
    },
    [setActiveRouteChapter, state, updateHashState],
  );

  const handleSelectRegionOnMap = useCallback(
    (regionId: string) => {
      if (!REGION_BY_ID[regionId]) return;
      updateHashState({
        view: 'map',
        chapterId: null,
        regionId,
        lens: undefined,
      });
    },
    [updateHashState],
  );

  const handleSelectRegionFromToast = useCallback(
    (regionId: string) => {
      if (!REGION_BY_ID[regionId]) return;
      if (activeView === 'area') {
        handleEnterAreaWorkspace(regionId);
      } else {
        handleSelectRegionOnMap(regionId);
      }
    },
    [activeView, handleEnterAreaWorkspace, handleSelectRegionOnMap],
  );

  const handleCloseRegion = useCallback(() => {
    updateHashState({ regionId: null });
  }, [updateHashState]);

  const handleEraFilterChange = useCallback(
    (era: EraFilter) => {
      setEraFilter(era);
      updateHashState({ era });
    },
    [setEraFilter, updateHashState],
  );

  const handleSpotlightChange = useCallback(
    (enabled: boolean) => {
      setSwitch2Spotlight(enabled);
      updateHashState({ spotlight: enabled });
    },
    [setSwitch2Spotlight, updateHashState],
  );

  const handleOpenSheet = useCallback(
    (sheet: CompanionSheetId) => {
      setInitialSongId(null);
      setIsInventoryOpen(false);
      setIsCatchUpOpen(false);
      updateHashState({ sheet });
    },
    [updateHashState],
  );

  const handleCloseSheet = useCallback(() => {
    setInitialSongId(null);
    updateHashState({ sheet: null });
  }, [updateHashState]);

  const handleOpenSongbook = useCallback(
    (songId?: string) => {
      setIsInventoryOpen(false);
      setInitialSongId(songId ?? null);
      updateHashState({ sheet: 'ocarina' });
    },
    [updateHashState],
  );

  const handleOpenInventory = useCallback(() => {
    setIsCatchUpOpen(false);
    if (activeSheet) {
      updateHashState({ sheet: null });
    }
    setIsInventoryOpen((prev) => !prev);
  }, [activeSheet, updateHashState]);

  const handleOpenCatchUp = useCallback(() => {
    wasAutoCatchUpPromptRef.current = false;
    setIsInventoryOpen(false);
    if (activeSheet) {
      updateHashState({ sheet: null });
    }
    setIsCatchUpOpen(true);
  }, [activeSheet, updateHashState]);

  const handleCloseCatchUp = useCallback(() => {
    wasAutoCatchUpPromptRef.current = false;
    setIsCatchUpOpen(false);
    completeOnboarding();
  }, [completeOnboarding]);

  const handleApplyCatchUp = useCallback(
    (selection: CatchUpSelection) => {
      wasAutoCatchUpPromptRef.current = false;
      selectPreset(selection.presetId, {
        markPriorSecretsAndSteps: selection.markPriorSecretsAndSteps,
      });
      completeOnboarding();
      setIsCatchUpOpen(false);

      const matchedPreset = STORY_PRESETS.find((p) => p.id === selection.presetId);
      const nextEra = matchedPreset?.eraFilter ?? state.activeEraFilter;
      const validTargetRegion = REGION_BY_ID[selection.targetRegionId]
        ? selection.targetRegionId
        : 'kokiri-forest';

      if (selection.playStyle === 'guided') {
        updateHashState({
          view: 'area',
          chapterId: null,
          regionId: validTargetRegion,
          lens: 'copilot',
          era: nextEra,
        });
      } else if (selection.playStyle === 'route') {
        let targetChapterId: string | null = null;
        for (const chapter of OPTIMAL_ROUTE_CHAPTERS) {
          if (chapter.steps.some((s) => s.regionId === validTargetRegion)) {
            targetChapterId = chapter.id;
            break;
          }
        }
        if (targetChapterId) {
          setActiveRouteChapter(targetChapterId);
        }
        updateHashState({
          view: 'route',
          chapterId: targetChapterId ?? OPTIMAL_ROUTE_CHAPTERS[0]?.id ?? null,
          regionId: validTargetRegion,
          lens: undefined,
          era: nextEra,
        });
      } else {
        updateHashState({
          view: 'map',
          chapterId: null,
          regionId: validTargetRegion,
          lens: undefined,
          era: nextEra,
        });
      }
    },
    [
      completeOnboarding,
      selectPreset,
      setActiveRouteChapter,
      state.activeEraFilter,
      updateHashState,
    ],
  );

  const handleSelectPreset = useCallback(
    (presetId: string) => {
      selectPreset(presetId);
      completeOnboarding();
      const matchedPreset = STORY_PRESETS.find((p) => p.id === presetId);
      if (matchedPreset) {
        updateHashState({ era: matchedPreset.eraFilter });
      }
    },
    [completeOnboarding, selectPreset, updateHashState],
  );

  const handleImportJson = useCallback(
    (jsonText: string) => {
      const imported = importProgress(jsonText);
      updateHashState({
        era: imported.activeEraFilter,
        spotlight: Boolean(imported.switch2SpotlightOnly),
      });
    },
    [importProgress, updateHashState],
  );

  const handleResetProgress = useCallback(() => {
    resetAllProgress();
    setHighlightedStepId(null);
    updateHashState({
      era: 'all',
      spotlight: false,
    });
  }, [resetAllProgress, updateHashState]);

  const handleToggleTheme = useCallback(
    (nextTheme: ThemeMode) => {
      setTheme(nextTheme);
    },
    [setTheme],
  );

  const handleSkipToWorkspace = () => {
    const stageId =
      activeView === 'route'
        ? 'optimal-route-stage'
        : activeView === 'area'
          ? 'guided-area-stage'
          : 'hyrule-map-stage';
    const stage = document.getElementById(stageId);
    stage?.focus();
  };

  return (
    <div className="zelda-app-shell" data-testid="zelda-app-shell">
      <button type="button" className="zelda-skip-link" onClick={handleSkipToWorkspace}>
        {activeView === 'route'
          ? 'Skip to horizontal optimal route guide'
          : activeView === 'area'
            ? 'Skip to guided area co-pilot & floor map'
            : 'Skip to interactive Hyrule map'}
      </button>

      <TopCommandBar
        state={state}
        globalProgress={globalProgress}
        activeSheet={activeSheet}
        onOpenSheet={handleOpenSheet}
        onEraFilterChange={handleEraFilterChange}
        onSpotlightChange={handleSpotlightChange}
        onToggleTheme={handleToggleTheme}
        onToggleLoadoutDock={setIsLoadoutDockOpen}
        isLoadoutDockOpen={isLoadoutDockOpen}
        onOpenInventory={handleOpenInventory}
        isInventoryOpen={isInventoryOpen}
        onOpenCatchUp={handleOpenCatchUp}
        isCatchUpOpen={isCatchUpOpen}
        activeView={activeView}
        onViewModeChange={handleViewModeChange}
        showAreaViewOption={true}
      />

      <ResumeBanner
        state={state}
        chapters={OPTIMAL_ROUTE_CHAPTERS}
        onResumeRoute={handleResumeRoute}
        onOpenRegionOnMap={handleSelectRegionOnMap}
      />

      {activeView === 'map' ? (
        <main
          className={`zelda-workspace ${
            selectedRegionId ? 'zelda-workspace--with-drawer' : ''
          }`.trim()}
        >
          <div
            id="hyrule-map-stage"
            className="zelda-map-stage"
            tabIndex={-1}
            aria-label="Hyrule Interactive Map Workspace"
          >
            <HyruleMapCanvas
              state={state}
              regionSummaries={regionSummaries}
              selectedRegionId={selectedRegionId}
              onSelectRegion={handleSelectRegionOnMap}
              onEnterAreaMap={handleEnterAreaWorkspace}
              onEraFilterChange={handleEraFilterChange}
              onSpotlightChange={handleSpotlightChange}
              hideCompleted={hideCompletedOnMap}
              onHideCompletedChange={setHideCompletedOnMap}
              mapLayerMode={state.mapLayerMode}
              onMapLayerModeChange={setMapLayerMode}
            />
          </div>

          <RegionDrawer
            regionId={selectedRegionId}
            state={state}
            effectiveRequirements={effectiveRequirements}
            regionSummaries={regionSummaries}
            areaGuide={selectedRegionId ? AREA_GUIDE_BY_REGION_ID[selectedRegionId] : undefined}
            onClose={handleCloseRegion}
            onSelectRegion={handleSelectRegionOnMap}
            onToggleSecret={toggleSecret}
            onToggleRequirement={toggleRequirement}
            onOpenSongbook={handleOpenSongbook}
            onOpenOptimalRouteForRegion={handleOpenOptimalRouteForRegion}
            onOpenAreaWorkspace={handleEnterAreaWorkspace}
          />
        </main>
      ) : activeView === 'area' ? (
        <main
          id="guided-area-stage"
          tabIndex={-1}
          aria-label="Guided Area Co-Pilot and Floor Map Workspace"
          className="zelda-workspace zelda-workspace--area"
        >
          <GuidedAreaWorkspace
            regionId={areaRegion.id}
            state={state}
            effectiveRequirements={effectiveRequirements}
            regionSummaries={regionSummaries}
            areaGuide={AREA_GUIDE_BY_REGION_ID[areaRegion.id]}
            evaluatedSecretsOverride={areaEvaluatedSecrets}
            secretRoomMap={areaSecretRoomMap}
            lastUnlockDelta={lastUnlockDelta}
            activeLens={activeLens}
            onLensChange={handleLensChange}
            onSelectRegion={handleEnterAreaWorkspace}
            onBackToWorldMap={handleBackToWorldMap}
            onToggleSecret={toggleSecret}
            onToggleRequirement={toggleRequirement}
            onOpenSongbook={handleOpenSongbook}
            renderSubmap={(submapProps) => (
              <AreaSubmapView
                {...submapProps}
                onToggleSecret={(secretId, completed) => {
                  toggleSecret(secretId, completed);
                }}
              />
            )}
          />
        </main>
      ) : (
        <main
          id="optimal-route-stage"
          tabIndex={-1}
          aria-label="Optimal 100% Route Workspace"
          className="zelda-workspace zelda-workspace--route"
        >
          <OptimalRouteView
            chapters={OPTIMAL_ROUTE_CHAPTERS}
            state={state}
            activeChapterId={activeChapterId}
            highlightedStepId={highlightedStepId}
            onSelectChapter={handleSelectRouteChapter}
            onToggleRouteStep={toggleRouteStep}
            onBookmarkStep={setBookmarkedRouteStep}
            onToggleSecret={toggleSecret}
            onOpenRegionOnMap={handleSelectRegionOnMap}
            onOpenSongbook={handleOpenSongbook}
          />
        </main>
      )}

      <LoadoutDock
        isOpen={isLoadoutDockOpen}
        onToggleOpen={setIsLoadoutDockOpen}
        state={state}
        effectiveRequirements={effectiveRequirements}
        skulltulaCount={skulltulaCount}
        onToggleRequirement={toggleRequirement}
        onSelectPreset={handleSelectPreset}
        onToggleLoadoutMode={setLoadoutMode}
        lastUnlockDelta={lastUnlockDelta}
        onDismissUnlockDelta={dismissUnlockDelta}
        onSelectRegion={handleSelectRegionFromToast}
      />

      <UnlockToast
        delta={lastUnlockDelta}
        onDismiss={dismissUnlockDelta}
        onSelectRegion={handleSelectRegionFromToast}
      />

      <CatchUpModal
        isOpen={isCatchUpOpen}
        onClose={handleCloseCatchUp}
        onApplyCatchUp={handleApplyCatchUp}
        defaultPlayStyle={
          activeView === 'route' ? 'route' : activeView === 'map' ? 'guided' : 'guided'
        }
      />

      <InventoryModal
        isOpen={isInventoryOpen}
        onClose={() => setIsInventoryOpen(false)}
        state={state}
        effectiveRequirements={effectiveRequirements}
        globalProgress={globalProgress}
        onToggleRequirement={toggleRequirement}
        onToggleSecret={toggleSecret}
        onToggleLoadoutMode={setLoadoutMode}
        onOpenCatchUp={handleOpenCatchUp}
        onOpenSongbook={handleOpenSongbook}
      />

      <OcarinaModal
        isOpen={activeSheet === 'ocarina'}
        onClose={handleCloseSheet}
        state={state}
        effectiveRequirements={effectiveRequirements}
        onToggleRequirement={toggleRequirement}
        onSaveScarecrowNotes={setScarecrowNotes}
        onSelectRegion={handleSelectRegionOnMap}
        initialSongId={initialSongId}
      />

      <QuestsModal
        isOpen={activeSheet === 'quests'}
        onClose={handleCloseSheet}
        state={state}
        effectiveRequirements={effectiveRequirements}
        onToggleSecret={toggleSecret}
        onSelectRegion={handleSelectRegionOnMap}
      />

      <Switch2DiffModal
        isOpen={activeSheet === 'diff'}
        onClose={handleCloseSheet}
        state={state}
        onToggleSecret={toggleSecret}
        onSelectRegion={handleSelectRegionOnMap}
      />

      <SearchModal
        isOpen={activeSheet === 'search'}
        onClose={handleCloseSheet}
        state={state}
        effectiveRequirements={effectiveRequirements}
        onSelectRegion={handleSelectRegionFromToast}
        onToggleSecret={toggleSecret}
      />

      <BackupModal
        isOpen={activeSheet === 'backup'}
        onClose={handleCloseSheet}
        state={state}
        globalProgress={globalProgress}
        onExportJson={exportProgress}
        onImportJson={handleImportJson}
        onResetProgress={handleResetProgress}
        isStoragePersisted={isStoragePersisted}
      />
    </div>
  );
}

export default App;
