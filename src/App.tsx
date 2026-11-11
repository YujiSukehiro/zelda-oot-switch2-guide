import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { HyruleMapCanvas } from './components/map';
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
import {
  AREA_GUIDE_BY_REGION_ID,
  OPTIMAL_ROUTE_CHAPTERS,
  REGION_BY_ID,
  ROUTE_CHAPTER_BY_ID,
  STORY_PRESETS,
} from './data';
import {
  computeAllRegionSummaries,
  computeGlobalProgress,
  countCompletedSkulltulas,
  deriveEffectiveRequirements,
} from './lib/gating';
import { parseUrlHash, usePlayerProgress, useUrlHashState } from './lib/storage';
import type {
  CompanionSheetId,
  EraFilter,
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
  const [initialSongId, setInitialSongId] = useState<string | null>(null);
  const [highlightedStepId, setHighlightedStepId] = useState<string | null>(null);
  const didBootstrapHashSyncRef = useRef<boolean>(false);

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

  const activeView: WorkspaceViewMode = hashState.view === 'route' ? 'route' : 'map';

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
        });
      } else {
        updateHashState({
          view: 'map',
          chapterId: null,
        });
      }
    },
    [activeChapterId, updateHashState],
  );

  const handleSelectRouteChapter = useCallback(
    (chapterId: string) => {
      if (!ROUTE_CHAPTER_BY_ID[chapterId]) return;
      setActiveRouteChapter(chapterId);
      setHighlightedStepId(null);
      updateHashState({
        view: 'route',
        chapterId,
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
      });
    },
    [setActiveRouteChapter, state, updateHashState],
  );

  const handleSelectRegion = useCallback(
    (regionId: string) => {
      if (!REGION_BY_ID[regionId]) return;
      updateHashState({
        view: 'map',
        chapterId: null,
        regionId,
      });
    },
    [updateHashState],
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
      setInitialSongId(songId ?? null);
      updateHashState({ sheet: 'ocarina' });
    },
    [updateHashState],
  );

  const handleSelectPreset = useCallback(
    (presetId: string) => {
      selectPreset(presetId);
      const matchedPreset = STORY_PRESETS.find((p) => p.id === presetId);
      if (matchedPreset) {
        updateHashState({ era: matchedPreset.eraFilter });
      }
    },
    [selectPreset, updateHashState],
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
    const stageId = activeView === 'route' ? 'optimal-route-stage' : 'hyrule-map-stage';
    const stage = document.getElementById(stageId);
    stage?.focus();
  };

  return (
    <div className="zelda-app-shell" data-testid="zelda-app-shell">
      <button type="button" className="zelda-skip-link" onClick={handleSkipToWorkspace}>
        {activeView === 'route'
          ? 'Skip to horizontal optimal route guide'
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
        activeView={activeView}
        onViewModeChange={handleViewModeChange}
      />

      <ResumeBanner
        state={state}
        chapters={OPTIMAL_ROUTE_CHAPTERS}
        onResumeRoute={handleResumeRoute}
        onOpenRegionOnMap={handleSelectRegion}
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
              onSelectRegion={handleSelectRegion}
              onEraFilterChange={handleEraFilterChange}
              onSpotlightChange={handleSpotlightChange}
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
            onSelectRegion={handleSelectRegion}
            onToggleSecret={toggleSecret}
            onToggleRequirement={toggleRequirement}
            onOpenSongbook={handleOpenSongbook}
            onOpenOptimalRouteForRegion={handleOpenOptimalRouteForRegion}
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
            onOpenRegionOnMap={handleSelectRegion}
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
        onSelectRegion={handleSelectRegion}
      />

      <UnlockToast
        delta={lastUnlockDelta}
        onDismiss={dismissUnlockDelta}
        onSelectRegion={handleSelectRegion}
      />

      <OcarinaModal
        isOpen={activeSheet === 'ocarina'}
        onClose={handleCloseSheet}
        state={state}
        effectiveRequirements={effectiveRequirements}
        onToggleRequirement={toggleRequirement}
        onSaveScarecrowNotes={setScarecrowNotes}
        onSelectRegion={handleSelectRegion}
        initialSongId={initialSongId}
      />

      <QuestsModal
        isOpen={activeSheet === 'quests'}
        onClose={handleCloseSheet}
        state={state}
        effectiveRequirements={effectiveRequirements}
        onToggleSecret={toggleSecret}
        onSelectRegion={handleSelectRegion}
      />

      <Switch2DiffModal
        isOpen={activeSheet === 'diff'}
        onClose={handleCloseSheet}
        state={state}
        onToggleSecret={toggleSecret}
        onSelectRegion={handleSelectRegion}
      />

      <SearchModal
        isOpen={activeSheet === 'search'}
        onClose={handleCloseSheet}
        state={state}
        effectiveRequirements={effectiveRequirements}
        onSelectRegion={handleSelectRegion}
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
