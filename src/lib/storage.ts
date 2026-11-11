import { useCallback, useEffect, useState } from 'react';
import { REGION_BY_ID, REQUIREMENT_BY_ID, SECRET_BY_ID } from '../data';
import type {
  EraFilter,
  LastSessionSnapshot,
  MapLayerMode,
  PlayerProgressState,
  ThemeMode,
  UnlockDelta,
  UrlHashState,
  WorkspaceViewMode,
} from '../types/zelda';
import {
  applyStoryPreset,
  computeUnlockDelta,
  createDefaultProgressState,
  DEFAULT_OWNED_REQUIREMENTS,
  toggleRequirementOwned,
  toggleSecretCompleted,
} from './gating';

export const STORAGE_KEY = 'zelda-oot-sw2-progress-v1';
const IDB_NAME = 'zelda-oot-sw2-idb';
const IDB_STORE = 'kv';
const IDB_KEY = 'progress-v1';

const VALID_ERAS = new Set<EraFilter>(['all', 'child', 'adult']);
const VALID_THEMES = new Set<ThemeMode>(['dark', 'parchment']);
const VALID_VIEWS = new Set<WorkspaceViewMode>(['map', 'route']);
const VALID_MAP_LAYERS = new Set<MapLayerMode>(['illustrated', 'schematic']);
const VALID_SHEETS = new Set(['ocarina', 'quests', 'diff', 'search', 'backup']);

function sanitizeBooleanMap(value: unknown): Record<string, boolean> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return {};
  }
  const cleaned: Record<string, boolean> = {};
  for (const [key, flag] of Object.entries(value as Record<string, unknown>)) {
    if (key.length > 0 && flag === true) {
      cleaned[key] = true;
    }
  }
  return cleaned;
}

function sanitizeLastSession(value: unknown): LastSessionSnapshot | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return null;
  }
  const raw = value as Record<string, unknown>;
  if (typeof raw.updatedAt !== 'string' || typeof raw.lastActionLabel !== 'string') {
    return null;
  }
  return {
    updatedAt: raw.updatedAt.slice(0, 64),
    lastActionLabel: raw.lastActionLabel.slice(0, 160),
    regionId:
      typeof raw.regionId === 'string' && REGION_BY_ID[raw.regionId] ? raw.regionId : null,
    chapterId: typeof raw.chapterId === 'string' ? raw.chapterId.slice(0, 48) : null,
    stepId: typeof raw.stepId === 'string' ? raw.stepId.slice(0, 64) : null,
  };
}

/**
 * Validates and normalizes an untrusted object into a canonical `PlayerProgressState`.
 */
export function sanitizeProgressState(raw: unknown): PlayerProgressState {
  const defaults = createDefaultProgressState();
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    return defaults;
  }

  const candidate = raw as Record<string, unknown>;

  // Unwrap backup envelope `{ version, exportedAt, state: { ... } }` if present
  const source =
    candidate.state && typeof candidate.state === 'object' && !Array.isArray(candidate.state)
      ? (candidate.state as Record<string, unknown>)
      : candidate;

  const completedSecretIds = sanitizeBooleanMap(source.completedSecretIds);
  const completedRouteStepIds = sanitizeBooleanMap(source.completedRouteStepIds);

  let ownedRequirementIds: Record<string, boolean>;
  if (
    source.ownedRequirementIds &&
    typeof source.ownedRequirementIds === 'object' &&
    !Array.isArray(source.ownedRequirementIds)
  ) {
    ownedRequirementIds = sanitizeBooleanMap(source.ownedRequirementIds);
  } else {
    ownedRequirementIds = {};
    for (const reqId of DEFAULT_OWNED_REQUIREMENTS) {
      ownedRequirementIds[reqId] = true;
    }
  }

  const activeEraFilter: EraFilter = VALID_ERAS.has(source.activeEraFilter as EraFilter)
    ? (source.activeEraFilter as EraFilter)
    : 'all';

  const switch2SpotlightOnly =
    typeof source.switch2SpotlightOnly === 'boolean' ? source.switch2SpotlightOnly : false;

  const loadoutModeEnabled =
    typeof source.loadoutModeEnabled === 'boolean' ? source.loadoutModeEnabled : true;

  const customScarecrowNotes =
    typeof source.customScarecrowNotes === 'string'
      ? source.customScarecrowNotes.slice(0, 120)
      : '';

  const theme: ThemeMode = VALID_THEMES.has(source.theme as ThemeMode)
    ? (source.theme as ThemeMode)
    : 'dark';

  const activeRouteChapterId =
    typeof source.activeRouteChapterId === 'string' && source.activeRouteChapterId.length > 0
      ? source.activeRouteChapterId.slice(0, 48)
      : undefined;

  const bookmarkedRouteStepId =
    typeof source.bookmarkedRouteStepId === 'string' && source.bookmarkedRouteStepId.length > 0
      ? source.bookmarkedRouteStepId.slice(0, 64)
      : null;

  const mapLayerMode: MapLayerMode | undefined = VALID_MAP_LAYERS.has(
    source.mapLayerMode as MapLayerMode,
  )
    ? (source.mapLayerMode as MapLayerMode)
    : undefined;

  const lastSession = sanitizeLastSession(source.lastSession);

  const next: PlayerProgressState = {
    version: 1,
    completedSecretIds,
    ownedRequirementIds,
    activeEraFilter,
    switch2SpotlightOnly,
    loadoutModeEnabled,
    customScarecrowNotes,
    theme,
  };

  if (Object.keys(completedRouteStepIds).length > 0) {
    next.completedRouteStepIds = completedRouteStepIds;
  }
  if (activeRouteChapterId) {
    next.activeRouteChapterId = activeRouteChapterId;
  }
  if (bookmarkedRouteStepId) {
    next.bookmarkedRouteStepId = bookmarkedRouteStepId;
  }
  if (mapLayerMode) {
    next.mapLayerMode = mapLayerMode;
  }
  if (lastSession) {
    next.lastSession = lastSession;
  }

  return next;
}

function getSafeStorage(explicitStorage?: Storage): Storage | null {
  if (explicitStorage) return explicitStorage;
  if (typeof window !== 'undefined' && window.localStorage) {
    return window.localStorage;
  }
  return null;
}

// ============================================================================
// Durable Mobile PWA IndexedDB Mirror + Persistent Storage Protection
// ============================================================================

function openProgressIdb(): Promise<IDBDatabase | null> {
  if (typeof indexedDB === 'undefined' || !indexedDB) {
    return Promise.resolve(null);
  }
  return new Promise((resolve) => {
    try {
      const request = indexedDB.open(IDB_NAME, 1);
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(IDB_STORE)) {
          db.createObjectStore(IDB_STORE);
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
}

async function writeProgressToIdb(state: PlayerProgressState): Promise<void> {
  const db = await openProgressIdb();
  if (!db) return;
  try {
    await new Promise<void>((resolve) => {
      const tx = db.transaction(IDB_STORE, 'readwrite');
      tx.objectStore(IDB_STORE).put(state, IDB_KEY);
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
    });
  } catch {
    // Ignore IDB quota or private-mode restrictions
  } finally {
    db.close();
  }
}

export async function loadProgressFromIdb(): Promise<PlayerProgressState | null> {
  const db = await openProgressIdb();
  if (!db) return null;
  try {
    const raw = await new Promise<unknown>((resolve) => {
      const tx = db.transaction(IDB_STORE, 'readonly');
      const req = tx.objectStore(IDB_STORE).get(IDB_KEY);
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => resolve(null);
    });
    if (!raw) return null;
    return sanitizeProgressState(raw);
  } catch {
    return null;
  } finally {
    db.close();
  }
}

async function clearProgressIdb(): Promise<void> {
  const db = await openProgressIdb();
  if (!db) return;
  try {
    await new Promise<void>((resolve) => {
      const tx = db.transaction(IDB_STORE, 'readwrite');
      tx.objectStore(IDB_STORE).delete(IDB_KEY);
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
    });
  } catch {
    // Ignore IDB errors
  } finally {
    db.close();
  }
}

/**
 * Requests durable OS-protected storage (`navigator.storage.persist()`) so mobile
 * Safari/Chrome do not evict Home Screen PWA progress during long play breaks.
 */
export async function ensurePersistentPhoneStorage(): Promise<boolean> {
  if (typeof navigator === 'undefined' || !navigator.storage) {
    return false;
  }
  try {
    if (typeof navigator.storage.persisted === 'function') {
      const already = await navigator.storage.persisted();
      if (already) return true;
    }
    if (typeof navigator.storage.persist === 'function') {
      return await navigator.storage.persist();
    }
    return false;
  } catch {
    return false;
  }
}

function hasAnyStoredProgress(state: PlayerProgressState): boolean {
  return (
    Object.keys(state.completedSecretIds).length > 0 ||
    Object.keys(state.completedRouteStepIds ?? {}).length > 0 ||
    Boolean(state.bookmarkedRouteStepId) ||
    state.customScarecrowNotes.length > 0
  );
}

export function loadProgressState(storage?: Storage): PlayerProgressState {
  const store = getSafeStorage(storage);
  if (!store) {
    return createDefaultProgressState();
  }
  try {
    const raw = store.getItem(STORAGE_KEY);
    if (!raw) {
      return createDefaultProgressState();
    }
    return sanitizeProgressState(JSON.parse(raw));
  } catch {
    return createDefaultProgressState();
  }
}

export function saveProgressState(state: PlayerProgressState, storage?: Storage): void {
  const store = getSafeStorage(storage);
  if (store) {
    try {
      store.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Ignore storage quota errors in restricted private browsing modes
    }
  }
  if (!storage) {
    void writeProgressToIdb(state);
  }
}

export function resetProgress(storage?: Storage): PlayerProgressState {
  const fresh = createDefaultProgressState();
  const store = getSafeStorage(storage);
  if (store) {
    try {
      store.setItem(STORAGE_KEY, JSON.stringify(fresh));
    } catch {
      // Ignore storage errors
    }
  }
  if (!storage) {
    void clearProgressIdb();
  }
  return fresh;
}

/**
 * Serializes player progress into a human-readable JSON backup file payload.
 */
export function exportProgressJson(state: PlayerProgressState): string {
  const payload = {
    app: 'zelda-oot-switch2-pwa',
    schemaVersion: 1,
    exportedAt: new Date().toISOString(),
    state: sanitizeProgressState(state),
  };
  return JSON.stringify(payload, null, 2);
}

/**
 * Parses and validates an imported backup JSON string (either wrapped envelope
 * or direct `PlayerProgressState` object). Throws a descriptive `Error` if invalid.
 */
export function parseImportedProgressJson(jsonText: string): PlayerProgressState {
  if (typeof jsonText !== 'string' || jsonText.trim().length === 0) {
    throw new Error('Backup JSON cannot be empty.');
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(jsonText);
  } catch {
    throw new Error('Invalid JSON syntax in backup file.');
  }

  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    throw new Error('Backup JSON must be an object.');
  }

  const envelope = parsed as Record<string, unknown>;
  const target =
    envelope.state && typeof envelope.state === 'object' && !Array.isArray(envelope.state)
      ? (envelope.state as Record<string, unknown>)
      : envelope;

  if (
    !('completedSecretIds' in target) &&
    !('ownedRequirementIds' in target) &&
    !('version' in target)
  ) {
    throw new Error(
      'Unrecognized backup format: missing completedSecretIds or ownedRequirementIds.',
    );
  }

  return sanitizeProgressState(target);
}

// ============================================================================
// URL Hash State Helpers (Zero Pathname pushState — Firebase & GitHub Pages Safe)
// ============================================================================

export function createDefaultUrlHashState(): UrlHashState {
  return {
    view: 'map',
    chapterId: null,
    regionId: null,
    era: 'all',
    sheet: null,
    spotlight: false,
  };
}

export function parseUrlHash(hashInput?: string): UrlHashState {
  const rawHash =
    hashInput ?? (typeof window !== 'undefined' ? window.location.hash : '');
  const trimmed = rawHash.startsWith('#') ? rawHash.slice(1) : rawHash;
  if (!trimmed) {
    return createDefaultUrlHashState();
  }

  const params = new URLSearchParams(trimmed);

  const rawView = params.get('view') as WorkspaceViewMode | null;
  const view: WorkspaceViewMode = rawView && VALID_VIEWS.has(rawView) ? rawView : 'map';

  const rawChapter = params.get('chapter');
  const chapterId = rawChapter && rawChapter.length > 0 ? rawChapter.slice(0, 48) : null;

  const rawRegion = params.get('region');
  const regionId = rawRegion && REGION_BY_ID[rawRegion] ? rawRegion : null;

  const rawEra = params.get('era') as EraFilter | null;
  const era: EraFilter = rawEra && VALID_ERAS.has(rawEra) ? rawEra : 'all';

  const rawSheet = params.get('sheet');
  const sheet = rawSheet && VALID_SHEETS.has(rawSheet) ? rawSheet : null;

  const rawSpotlight = params.get('spotlight');
  const spotlight = rawSpotlight === '1' || rawSpotlight === 'true';

  return {
    view,
    chapterId,
    regionId,
    era,
    sheet,
    spotlight,
  };
}

export function buildUrlHash(hashState: Partial<UrlHashState>): string {
  const params = new URLSearchParams();

  if (hashState.view && hashState.view !== 'map' && VALID_VIEWS.has(hashState.view)) {
    params.set('view', hashState.view);
  }
  if (hashState.chapterId) {
    params.set('chapter', hashState.chapterId);
  }
  if (hashState.regionId && REGION_BY_ID[hashState.regionId]) {
    params.set('region', hashState.regionId);
  }
  if (hashState.era && hashState.era !== 'all' && VALID_ERAS.has(hashState.era)) {
    params.set('era', hashState.era);
  }
  if (hashState.sheet && VALID_SHEETS.has(hashState.sheet)) {
    params.set('sheet', hashState.sheet);
  }
  if (hashState.spotlight) {
    params.set('spotlight', '1');
  }

  const serialized = params.toString();
  return serialized ? `#${serialized}` : '';
}

// ============================================================================
// React Hooks for Progress & URL Hash Synchronization
// ============================================================================

export interface RouteStepSessionMeta {
  label?: string;
  regionId?: string | null;
  chapterId?: string | null;
}

export function usePlayerProgress() {
  const [state, setState] = useState<PlayerProgressState>(() => loadProgressState());
  const [lastUnlockDelta, setLastUnlockDelta] = useState<UnlockDelta | null>(null);
  const [isStoragePersisted, setIsStoragePersisted] = useState<boolean>(false);

  // Request OS persistent storage & recover from IndexedDB if localStorage was ever cleared
  useEffect(() => {
    let cancelled = false;
    void ensurePersistentPhoneStorage().then((granted) => {
      if (!cancelled && granted) {
        setIsStoragePersisted(true);
      }
    });

    const rawLocalExists = Boolean(getSafeStorage()?.getItem(STORAGE_KEY));
    if (!rawLocalExists) {
      void loadProgressFromIdb().then((fromIdb) => {
        if (!cancelled && fromIdb && hasAnyStoredProgress(fromIdb)) {
          setState(fromIdb);
        }
      });
    }

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    saveProgressState(state);
    if (typeof document !== 'undefined') {
      document.documentElement.dataset.theme = state.theme ?? 'dark';
    }
  }, [state]);

  const dismissUnlockDelta = useCallback(() => {
    setLastUnlockDelta(null);
  }, []);

  const toggleSecret = useCallback((secretId: string, completed?: boolean): UnlockDelta => {
    let computedDelta: UnlockDelta = {
      newlyUnlocked: [],
      byRegion: {},
      totalUnlocked: 0,
    };
    setState((prev) => {
      const toggled = toggleSecretCompleted(prev, secretId, completed);
      const isNowDone = Boolean(toggled.completedSecretIds[secretId]);
      const secretMeta = SECRET_BY_ID[secretId];
      const next: PlayerProgressState = secretMeta
        ? {
            ...toggled,
            lastSession: {
              updatedAt: new Date().toISOString(),
              lastActionLabel: `${isNowDone ? 'Completed' : 'Unchecked'}: ${secretMeta.title}`,
              regionId: secretMeta.regionId,
              chapterId: prev.activeRouteChapterId ?? null,
              stepId: prev.bookmarkedRouteStepId ?? null,
            },
          }
        : toggled;

      computedDelta = computeUnlockDelta(prev, next, secretId);
      if (computedDelta.totalUnlocked > 0) {
        setLastUnlockDelta(computedDelta);
      }
      return next;
    });
    return computedDelta;
  }, []);

  const toggleRouteStep = useCallback(
    (stepId: string, meta?: RouteStepSessionMeta, completed?: boolean) => {
      setState((prev) => {
        const existing = prev.completedRouteStepIds ?? {};
        const shouldComplete = completed ?? !Boolean(existing[stepId]);
        const nextSteps = { ...existing };
        if (shouldComplete) {
          nextSteps[stepId] = true;
        } else {
          delete nextSteps[stepId];
        }

        const label = meta?.label ?? stepId;
        return {
          ...prev,
          completedRouteStepIds: nextSteps,
          activeRouteChapterId: meta?.chapterId ?? prev.activeRouteChapterId,
          lastSession: {
            updatedAt: new Date().toISOString(),
            lastActionLabel: `${shouldComplete ? 'Completed Step' : 'Reopened Step'}: ${label}`,
            regionId: meta?.regionId ?? prev.lastSession?.regionId ?? null,
            chapterId: meta?.chapterId ?? prev.activeRouteChapterId ?? null,
            stepId,
          },
        };
      });
    },
    [],
  );

  const setActiveRouteChapter = useCallback((chapterId: string) => {
    setState((prev) => ({
      ...prev,
      activeRouteChapterId: chapterId,
    }));
  }, []);

  const setBookmarkedRouteStep = useCallback(
    (stepId: string | null, meta?: RouteStepSessionMeta) => {
      setState((prev) => ({
        ...prev,
        bookmarkedRouteStepId: stepId,
        activeRouteChapterId: meta?.chapterId ?? prev.activeRouteChapterId,
        lastSession: stepId
          ? {
              updatedAt: new Date().toISOString(),
              lastActionLabel: `Pinned Checkpoint: ${meta?.label ?? stepId}`,
              regionId: meta?.regionId ?? prev.lastSession?.regionId ?? null,
              chapterId: meta?.chapterId ?? prev.activeRouteChapterId ?? null,
              stepId,
            }
          : prev.lastSession,
      }));
    },
    [],
  );

  const setMapLayerMode = useCallback((mode: MapLayerMode) => {
    setState((prev) => ({
      ...prev,
      mapLayerMode: mode,
    }));
  }, []);

  const toggleRequirement = useCallback(
    (requirementId: string, owned?: boolean): UnlockDelta => {
      const label = REQUIREMENT_BY_ID[requirementId]?.name ?? requirementId;
      let computedDelta: UnlockDelta = {
        newlyUnlocked: [],
        byRegion: {},
        totalUnlocked: 0,
        triggerLabel: label,
      };
      setState((prev) => {
        const next = toggleRequirementOwned(prev, requirementId, owned);
        computedDelta = computeUnlockDelta(prev, next, label);
        if (computedDelta.totalUnlocked > 0) {
          setLastUnlockDelta(computedDelta);
        }
        return next;
      });
      return computedDelta;
    },
    [],
  );

  const selectPreset = useCallback((presetId: string): UnlockDelta => {
    let computedDelta: UnlockDelta = {
      newlyUnlocked: [],
      byRegion: {},
      totalUnlocked: 0,
      triggerLabel: presetId,
    };
    setState((prev) => {
      const next = applyStoryPreset(prev, presetId);
      computedDelta = computeUnlockDelta(prev, next, presetId);
      if (computedDelta.totalUnlocked > 0) {
        setLastUnlockDelta(computedDelta);
      }
      return next;
    });
    return computedDelta;
  }, []);

  const setEraFilter = useCallback((era: EraFilter) => {
    setState((prev) => ({ ...prev, activeEraFilter: era }));
  }, []);

  const setSwitch2Spotlight = useCallback((enabled: boolean) => {
    setState((prev) => ({ ...prev, switch2SpotlightOnly: enabled }));
  }, []);

  const setLoadoutMode = useCallback((enabled: boolean) => {
    setState((prev) => ({ ...prev, loadoutModeEnabled: enabled }));
  }, []);

  const setScarecrowNotes = useCallback((notes: string) => {
    setState((prev) => ({ ...prev, customScarecrowNotes: notes }));
  }, []);

  const setTheme = useCallback((theme: ThemeMode) => {
    setState((prev) => ({ ...prev, theme }));
  }, []);

  const importProgress = useCallback((jsonText: string): PlayerProgressState => {
    const imported = parseImportedProgressJson(jsonText);
    setState(imported);
    setLastUnlockDelta(null);
    return imported;
  }, []);

  const exportProgress = useCallback((): string => {
    return exportProgressJson(state);
  }, [state]);

  const resetAllProgress = useCallback(() => {
    const fresh = resetProgress();
    setState(fresh);
    setLastUnlockDelta(null);
  }, []);

  return {
    state,
    setState,
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
  };
}

export function useUrlHashState(): [
  UrlHashState,
  (patch: Partial<UrlHashState> | ((prev: UrlHashState) => UrlHashState)) => void,
] {
  const [hashState, setHashState] = useState<UrlHashState>(() => parseUrlHash());

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;
    const handleHashChange = () => {
      setHashState(parseUrlHash(window.location.hash));
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);

  const updateHashState = useCallback(
    (patch: Partial<UrlHashState> | ((prev: UrlHashState) => UrlHashState)) => {
      setHashState((prev) => {
        const next: UrlHashState =
          typeof patch === 'function' ? patch(prev) : { ...prev, ...patch };
        if (typeof window !== 'undefined') {
          const nextHash = buildUrlHash(next);
          const nextUrl = `${window.location.pathname}${window.location.search}${nextHash}`;
          window.history.replaceState(null, '', nextUrl);
        }
        return next;
      });
    },
    [],
  );

  return [hashState, updateHashState];
}
