import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { HyruleMapCanvas } from './components/map';
import { RegionDrawer } from './components/region';
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
import { REGION_BY_ID, STORY_PRESETS } from './data';
import {
  computeAllRegionSummaries,
  computeGlobalProgress,
  countCompletedSkulltulas,
  deriveEffectiveRequirements,
} from './lib/gating';
import { parseUrlHash, usePlayerProgress, useUrlHashState } from './lib/storage';
import type { CompanionSheetId, EraFilter, ThemeMode } from './types/zelda';
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
    lastUnlockDelta,
    dismissUnlockDelta,
    toggleSecret,
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

  const selectedRegionId =
    hashState.regionId && REGION_BY_ID[hashState.regionId] ? hashState.regionId : null;

  const activeSheet: CompanionSheetId | null =
    hashState.sheet && VALID_COMPANION_SHEETS.has(hashState.sheet as CompanionSheetId)
      ? (hashState.sheet as CompanionSheetId)
      : null;

  const handleSelectRegion = useCallback(
    (regionId: string) => {
      if (!REGION_BY_ID[regionId]) return;
      updateHashState({ regionId });
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

  const handleSkipToMap = () => {
    const mapStage = document.getElementById('hyrule-map-stage');
    mapStage?.focus();
  };

  return (
    <div className="zelda-app-shell" data-testid="zelda-app-shell">
      <button type="button" className="zelda-skip-link" onClick={handleSkipToMap}>
        Skip to interactive Hyrule map
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
      />

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
          />
        </div>

        <RegionDrawer
          regionId={selectedRegionId}
          state={state}
          effectiveRequirements={effectiveRequirements}
          regionSummaries={regionSummaries}
          onClose={handleCloseRegion}
          onSelectRegion={handleSelectRegion}
          onToggleSecret={toggleSecret}
          onToggleRequirement={toggleRequirement}
          onOpenSongbook={handleOpenSongbook}
        />
      </main>

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
      />
    </div>
  );
}

export default App;
