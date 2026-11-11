import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import {
  buildUrlHash,
  parseImportedProgressJson,
  parseUrlHash,
  sanitizeProgressState,
  syncCrossListedSecrets,
  usePlayerProgress,
} from './storage';

describe('Player Progress Hook, Cross-Listed Sync & Catch-Up Presets (src/lib/storage.ts)', () => {
  beforeEach(() => {
    window.localStorage.clear();
    window.history.replaceState(null, '', '/');
  });

  it('keeps hp-10 and skr-50 bidirectionally synchronized across toggleSecret and JSON import', () => {
    // Pure helper checks
    expect(syncCrossListedSecrets({}, 'hp-10', true)).toEqual({
      'hp-10': true,
      'skr-50': true,
    });
    expect(
      syncCrossListedSecrets({ 'hp-10': true, 'skr-50': true, 'hp-01': true }, 'skr-50', false),
    ).toEqual({
      'hp-01': true,
    });
    expect(
      sanitizeProgressState({
        version: 1,
        completedSecretIds: { 'skr-50': true },
      }).completedSecretIds,
    ).toEqual({
      'hp-10': true,
      'skr-50': true,
    });

    const { result } = renderHook(() => usePlayerProgress());

    // Toggle hp-10 ON -> skr-50 automatically turns ON
    act(() => {
      result.current.toggleSecret('hp-10', true);
    });
    expect(result.current.state.completedSecretIds['hp-10']).toBe(true);
    expect(result.current.state.completedSecretIds['skr-50']).toBe(true);

    // Toggle skr-50 OFF -> hp-10 automatically turns OFF
    act(() => {
      result.current.toggleSecret('skr-50', false);
    });
    expect(result.current.state.completedSecretIds['hp-10']).toBeUndefined();
    expect(result.current.state.completedSecretIds['skr-50']).toBeUndefined();

    // Toggle skr-50 ON -> hp-10 automatically turns ON
    act(() => {
      result.current.toggleSecret('skr-50', true);
    });
    expect(result.current.state.completedSecretIds['hp-10']).toBe(true);
    expect(result.current.state.completedSecretIds['skr-50']).toBe(true);

    // Importing legacy JSON with only hp-10 checked populates skr-50 automatically
    const legacyBackup = JSON.stringify({
      version: 1,
      completedSecretIds: { 'hp-10': true },
      ownedRequirementIds: { 'era-child': true },
    });
    const parsed = parseImportedProgressJson(legacyBackup);
    expect(parsed.completedSecretIds['hp-10']).toBe(true);
    expect(parsed.completedSecretIds['skr-50']).toBe(true);
  });

  it('supports selectPreset with markPriorSecretsAndSteps catch-up for Goron City — 1st Visit', () => {
    const { result } = renderHook(() => usePlayerProgress());

    // Without markPriorSecretsAndSteps: grants Goron City 1st Visit loadout without marking secrets completed
    act(() => {
      result.current.selectPreset('goron-city-visit-1', { markPriorSecretsAndSteps: false });
    });
    expect(result.current.state.ownedRequirementIds['stone-emerald']).toBe(true);
    expect(result.current.state.ownedRequirementIds['zeldas-letter']).toBe(true);
    expect(result.current.state.hasCompletedOnboarding).toBe(true);
    expect(Object.keys(result.current.state.completedSecretIds)).toHaveLength(0);

    // With markPriorSecretsAndSteps: marks Chapters 1-3 steps and prior story/dungeon cards completed!
    act(() => {
      result.current.selectPreset('goron-city-visit-1', { markPriorSecretsAndSteps: true });
    });
    expect(result.current.state.completedRouteStepIds?.['ch-01-step-01']).toBe(true);
    expect(result.current.state.completedRouteStepIds?.['ch-01-step-05']).toBe(true);
    expect(result.current.state.completedRouteStepIds?.['ch-03-step-06']).toBe(true);
    expect(result.current.state.completedRouteStepIds?.['ch-04-step-01']).toBeUndefined();

    // Prior story/dungeon secrets (Deku Tree, Castle, Lost Woods songs) are checked off
    expect(result.current.state.completedSecretIds['eq-kokiri-sword']).toBe(true);
    expect(result.current.state.completedSecretIds['eq-deku-shield']).toBe(true);
    expect(result.current.state.completedSecretIds['eq-slingshot']).toBe(true);
    expect(result.current.state.completedSecretIds['boss-hc-deku']).toBe(true);
    expect(result.current.state.completedSecretIds['stone-emerald']).toBe(true);
    expect(result.current.state.completedSecretIds['eq-ocarina']).toBe(true);
    expect(result.current.state.completedSecretIds['song-lullaby']).toBe(true);
    expect(result.current.state.completedSecretIds['song-saria']).toBe(true);

    // Upcoming Goron City items remain uncompleted and Chapter 4 Step 1 is bookmarked next!
    expect(result.current.state.completedSecretIds['eq-goron-bracelet']).toBeUndefined();
    expect(result.current.state.activeRouteChapterId).toBe('ch-04');
    expect(result.current.state.bookmarkedRouteStepId).toBe('ch-04-step-01');
  });

  it('computes UnlockDelta when completing an Optimal Route step with unlocksRequirementIds and persists onboarding', () => {
    const { result } = renderHook(() => usePlayerProgress());

    let deltaTotal = 0;
    act(() => {
      const delta = result.current.toggleRouteStep('ch-01-step-05', {
        chapterId: 'ch-01',
        regionId: 'deku-tree',
      });
      deltaTotal = delta.totalUnlocked;
    });

    // Clearing ch-01-step-05 grants stone-emerald, unlocking Hyrule Field & central overworld secrets!
    expect(deltaTotal).toBeGreaterThanOrEqual(20);
    expect(result.current.lastUnlockDelta?.totalUnlocked).toBe(deltaTotal);

    act(() => {
      result.current.completeOnboarding();
    });
    expect(result.current.state.hasCompletedOnboarding).toBe(true);
  });

  it('round-trips Guided Area view and lens parameters in URL hash helpers', () => {
    const hash = buildUrlHash({
      view: 'area',
      regionId: 'goron-city',
      era: 'child',
      lens: 'copilot',
    });
    expect(hash).toBe('#view=area&region=goron-city&era=child&lens=copilot');

    expect(parseUrlHash(hash)).toEqual({
      view: 'area',
      chapterId: null,
      regionId: 'goron-city',
      era: 'child',
      sheet: null,
      spotlight: false,
      lens: 'copilot',
    });
  });
});
