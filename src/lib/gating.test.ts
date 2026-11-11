import { beforeEach, describe, expect, it } from 'vitest';
import {
  ALL_ROUTE_STEPS,
  ALL_SECRETS,
  AREA_GUIDE_BY_REGION_ID,
  AREA_GUIDES,
  ATTACHED_DUNGEONS_BY_REGION,
  DUNGEON_AND_SPECIAL_REGIONS,
  GOLD_SKULLTULAS,
  HEART_PIECES,
  METADATA,
  OPTIMAL_ROUTE_CHAPTERS,
  OVERWORLD_REGIONS,
  REGION_BY_ID,
  REGIONS,
  REQUIREMENT_BY_ID,
  REQUIREMENT_SOURCE_REGION,
  REQUIREMENTS,
  ROUTE_CHAPTER_BY_ID,
  SECRET_BY_ID,
  SONGS_AND_QUESTS,
  STORY_PRESETS,
  UPGRADES_AND_BOTTLES,
} from '../data';
import {
  applyStoryPreset,
  categorizeRegionSecrets,
  computeAllRegionSummaries,
  computeGlobalProgress,
  computeRegionSummary,
  computeUnlockDelta,
  createDefaultProgressState,
  deriveEffectiveRequirements,
  evaluateSecret,
  toggleRequirementOwned,
  toggleSecretCompleted,
} from './gating';
import {
  buildUrlHash,
  exportProgressJson,
  loadProgressState,
  parseImportedProgressJson,
  parseUrlHash,
  resetProgress,
  saveProgressState,
  STORAGE_KEY,
} from './storage';

describe('Canonical Dataset & Normalization Integrity (src/data/index.ts)', () => {
  it('matches every expected count in METADATA.expectedCounts and totals 232 normalized secrets', () => {
    const exp = METADATA.expectedCounts;

    expect(OVERWORLD_REGIONS).toHaveLength(exp.overworldRegions); // 21
    expect(DUNGEON_AND_SPECIAL_REGIONS).toHaveLength(exp.dungeonsAndSpecialAreas); // 13
    expect(REGIONS).toHaveLength(exp.totalRegions); // 34
    expect(REQUIREMENTS).toHaveLength(66);

    const byCat = (cat: string) => ALL_SECRETS.filter((s) => s.category === cat);

    expect(byCat('heart-piece')).toHaveLength(exp.heartPieces); // 36
    expect(byCat('gold-skulltula')).toHaveLength(exp.goldSkulltulasTotal); // 100
    expect(byCat('bottle')).toHaveLength(exp.emptyBottles); // 5
    expect(byCat('big-poe')).toHaveLength(exp.bigPoesTotal); // 10
    expect(byCat('great-fairy')).toHaveLength(exp.greatFairies); // 6
    expect(byCat('skulltula-reward')).toHaveLength(6);
    expect(byCat('capacity-upgrade')).toHaveLength(10);
    expect(byCat('equipment')).toHaveLength(12);
    expect(byCat('ocarina-song')).toHaveLength(exp.ocarinaSongs); // 13
    expect(byCat('magic-bean')).toHaveLength(exp.magicBeanLocations); // 10
    expect(byCat('mask-trade')).toHaveLength(exp.happyMaskTrades); // 4
    expect(byCat('biggoron-step')).toHaveLength(exp.biggoronTradeSteps); // 12
    expect(byCat('cow-or-grotto')).toHaveLength(5);
    expect(byCat('switch2-exclusive')).toHaveLength(3);

    expect(ALL_SECRETS).toHaveLength(232);
    expect(Object.keys(SECRET_BY_ID)).toHaveLength(232);

    // 56 Overworld + 44 Dungeon Gold Skulltulas (51 Child + 49 Adult)
    const overworldGs = GOLD_SKULLTULAS.filter(
      (gs) => REGION_BY_ID[gs.regionId]?.kind === 'overworld',
    );
    const dungeonGs = GOLD_SKULLTULAS.filter(
      (gs) => REGION_BY_ID[gs.regionId]?.kind !== 'overworld',
    );
    expect(overworldGs).toHaveLength(exp.goldSkulltulasOverworld); // 56
    expect(dungeonGs).toHaveLength(exp.goldSkulltulasDungeon); // 44
    expect(GOLD_SKULLTULAS.filter((gs) => gs.era === 'child')).toHaveLength(51);
    expect(GOLD_SKULLTULAS.filter((gs) => gs.era === 'adult')).toHaveLength(49);

    // Economy totals: Great Fairies = 1,175 Rupees, Magic Beans = 550 Rupees
    const totalFairyRupees = byCat('great-fairy').reduce(
      (sum, f) => sum + (f.rupeeCost ?? 0),
      0,
    );
    expect(totalFairyRupees).toBe(exp.greatFairyTotalRupeeCost); // 1175

    const totalBeanRupees = byCat('magic-bean').reduce(
      (sum, b) => sum + (b.rupeeCost ?? 0),
      0,
    );
    expect(totalBeanRupees).toBe(exp.magicBeanTotalRupeeCost); // 550

    // skr-50 cross-lists hp-10 so countsToward100Percent is false only on skr-50
    expect(SECRET_BY_ID['skr-50']?.countsToward100Percent).toBe(false);
    expect(ALL_SECRETS.filter((s) => s.countsToward100Percent)).toHaveLength(231);
  });

  it('validates that every secret, preset, and requirement maps to valid regions and requirement IDs', () => {
    const seenIds = new Set<string>();

    for (const secret of ALL_SECRETS) {
      expect(seenIds.has(secret.id)).toBe(false);
      seenIds.add(secret.id);

      expect(REGION_BY_ID[secret.regionId]).toBeDefined();
      for (const reqId of secret.requiredIds) {
        expect(REQUIREMENT_BY_ID[reqId]).toBeDefined();
      }
      for (const alt of secret.altMethods) {
        for (const reqId of alt.requiredIds) {
          expect(REQUIREMENT_BY_ID[reqId]).toBeDefined();
        }
      }
    }

    for (const req of REQUIREMENTS) {
      const sourceRegionId = REQUIREMENT_SOURCE_REGION[req.id];
      expect(sourceRegionId).toBeDefined();
      expect(REGION_BY_ID[sourceRegionId]).toBeDefined();
    }

    expect(STORY_PRESETS).toHaveLength(7);
    for (const preset of STORY_PRESETS) {
      for (const reqId of preset.ownedRequirementIds) {
        expect(REQUIREMENT_BY_ID[reqId]).toBeDefined();
      }
    }

    // Verify attached dungeons map under parent overworld regions
    expect(
      ATTACHED_DUNGEONS_BY_REGION['kokiri-forest']?.map((r) => r.id),
    ).toEqual(expect.arrayContaining(['deku-tree', 'hall-of-fallen-foes']));
    expect(
      ATTACHED_DUNGEONS_BY_REGION['kakariko-village']?.map((r) => r.id),
    ).toContain('bottom-of-the-well');
  });

  it('extracts Step 1 / Step 2 crossEraSteps and preserves timers, song buttons, and warp bean gates', () => {
    for (const crossId of ['hp-05', 'hp-06', 'gs-010', 'hp-20', 'hp-36', 'song-scarecrow']) {
      const sec = SECRET_BY_ID[crossId];
      expect(sec?.crossEraSteps).toBeDefined();
      expect(sec?.crossEraSteps?.step1.length).toBeGreaterThan(10);
      expect(sec?.crossEraSteps?.step2.length).toBeGreaterThan(10);
    }

    expect(SECRET_BY_ID['song-lullaby']?.songButtons).toEqual(['Y', 'X', 'A', 'Y', 'X', 'A']);
    expect(SECRET_BY_ID['bean-09']?.requiredIds).toEqual([
      'era-adult',
      'song-bolero',
      'time-travel',
      'era-child',
      'magic-beans',
      'rupees-100',
    ]);
    expect(SECRET_BY_ID['bean-10']?.requiredIds).toEqual([
      'era-adult',
      'song-requiem',
      'time-travel',
      'era-child',
      'magic-beans',
      'rupees-100',
    ]);
    expect(SECRET_BY_ID['biggoron-step-4']?.timer).toBe('4:00');
    expect(SECRET_BY_ID['biggoron-step-9']?.timer).toBe('2:30');
    expect(SECRET_BY_ID['biggoron-step-10']?.timer).toBe('3:30');
    expect(
      SECRET_BY_ID['biggoron-step-10']?.altMethods.some((a) =>
        a.requiredIds.includes('zora-thawed'),
      ),
    ).toBe(true);

    // Ensure raw exports remain intact
    expect(HEART_PIECES).toHaveLength(36);
    expect(UPGRADES_AND_BOTTLES.bottles).toHaveLength(5);
    expect(SONGS_AND_QUESTS.ocarinaSongs).toHaveLength(13);
  });
});

describe('Gating Engine, Cross-Era Puzzles & Alternate Tricks (src/lib/gating.ts)', () => {
  it('places Switch 2 cross-era puzzles (hp-05, hp-06, gs-010) in Cross-Era blocker bucket until unlocked', () => {
    const fresh = createDefaultProgressState();
    const hyruleFieldCats = categorizeRegionSecrets('hyrule-field', fresh, 'blocker');

    const crossBucket = hyruleFieldCats.lockedBuckets.find((b) => b.category === 'cross-era');
    expect(crossBucket).toBeDefined();
    const crossIds = crossBucket?.items.map((i) => i.secret.id) ?? [];
    expect(crossIds).toEqual(expect.arrayContaining(['hp-05', 'hp-06', 'gs-010']));

    // Grant Time Travel + prerequisites -> all 3 move to readyNow
    let unlockedState = toggleRequirementOwned(fresh, 'era-adult', true);
    unlockedState = toggleRequirementOwned(unlockedState, 'time-travel', true);
    unlockedState = toggleRequirementOwned(unlockedState, 'bombs', true);
    unlockedState = toggleRequirementOwned(unlockedState, 'hookshot', true);

    const afterCats = categorizeRegionSecrets('hyrule-field', unlockedState, 'blocker');
    const readyIds = afterCats.readyNow.map((i) => i.secret.id);
    expect(readyIds).toEqual(expect.arrayContaining(['hp-05', 'hp-06', 'gs-010']));
  });

  it('evaluates early alternate tricks (available-via-alt) in both Child and Adult directions', () => {
    const freshChild = createDefaultProgressState();

    // On Fresh Start (era-child only):
    // - hp-33 (Gerudo Valley Gorge Chest) is available-now via primary ['era-child']
    // - hp-08 (Kakariko Rooftop Man) is available-via-alt (primary needs Adult + Hookshot)
    // - hp-18 (Dodongo's Cavern Cliff) is available-via-alt (primary needs Child + Beans + Adult)
    const hp33AsChild = evaluateSecret(SECRET_BY_ID['hp-33']!, freshChild);
    expect(hp33AsChild.status).toBe('available-now');

    const hp08AsChild = evaluateSecret(SECRET_BY_ID['hp-08']!, freshChild);
    expect(hp08AsChild.status).toBe('available-via-alt');
    expect(hp08AsChild.readyAltMethod?.requiredIds).toEqual(['era-child']);

    const hp18AsChild = evaluateSecret(SECRET_BY_ID['hp-18']!, freshChild);
    expect(hp18AsChild.status).toBe('available-via-alt');
    expect(hp18AsChild.readyAltMethod?.requiredIds).toEqual(['era-child']);

    // On Fresh Adult + Hookshot (era-adult + hookshot, WITHOUT era-child):
    // - hp-33 becomes available-via-alt via Adult Hookshot onto the new Switch 2 chest!
    // - hp-08 becomes available-now via primary ['era-adult', 'hookshot']!
    const adultHookshotState = applyStoryPreset(freshChild, 'fresh-adult-hookshot');
    expect(adultHookshotState.ownedRequirementIds['era-child']).toBeUndefined();
    expect(adultHookshotState.ownedRequirementIds['era-adult']).toBe(true);
    expect(adultHookshotState.ownedRequirementIds['hookshot']).toBe(true);

    const hp33AsAdult = evaluateSecret(SECRET_BY_ID['hp-33']!, adultHookshotState);
    expect(hp33AsAdult.status).toBe('available-via-alt');
    expect(hp33AsAdult.readyAltMethod?.requiredIds).toEqual(['era-adult', 'hookshot']);

    const hp08AsAdult = evaluateSecret(SECRET_BY_ID['hp-08']!, adultHookshotState);
    expect(hp08AsAdult.status).toBe('available-now');
  });

  it('surfaces Ready Right Now alongside distinct locked blocker categories in Kakariko & Death Mountain Crater', () => {
    const fresh = createDefaultProgressState();

    const kakariko = categorizeRegionSecrets('kakariko-village', fresh, 'blocker');
    expect(kakariko.readyNow.map((i) => i.secret.id)).toEqual(
      expect.arrayContaining(['hp-07', 'hp-08', 'bottle-03', 'gs-018']),
    );
    const kakarikoBucketCategories = new Set(kakariko.lockedBuckets.map((b) => b.category));
    expect(kakarikoBucketCategories.has('gear')).toBe(true);
    expect(kakarikoBucketCategories.has('wallet-milestone')).toBe(true);
    expect(kakarikoBucketCategories.has('time-bug')).toBe(true);

    const crater = categorizeRegionSecrets('death-mountain-crater', fresh, 'blocker');
    expect(crater.readyNow.map((i) => i.secret.id)).toEqual(
      expect.arrayContaining(['hp-19', 'gs-032']),
    );
    const craterBucketCategories = new Set(crater.lockedBuckets.map((b) => b.category));
    expect(craterBucketCategories.has('cross-era')).toBe(true);
    expect(craterBucketCategories.has('song')).toBe(true);
    expect(craterBucketCategories.has('gear')).toBe(true);

    // Verify 'tier' and 'type' grouping modes cover 100% of regional items cleanly
    expect(kakariko.tierGroups).toHaveLength(6);
    expect(kakariko.typeGroups).toHaveLength(5);
    const tierSum = kakariko.tierGroups.reduce((s, g) => s + g.allItems.length, 0);
    const typeSum = kakariko.typeGroups.reduce((s, g) => s + g.allItems.length, 0);
    expect(tierSum).toBe(kakariko.allEvaluated.length);
    expect(typeSum).toBe(kakariko.allEvaluated.length);
  });

  it('auto-derives Gold Skulltula token milestones (10/20/30/40/50/100), secret syncs, and transitive gear', () => {
    let state = createDefaultProgressState();

    const markSkulltulas = (upTo: number) => {
      const nextCompleted = { ...state.completedSecretIds };
      for (let i = 1; i <= upTo; i += 1) {
        nextCompleted[`gs-${String(i).padStart(3, '0')}`] = true;
      }
      state = { ...state, completedSecretIds: nextCompleted };
    };

    markSkulltulas(10);
    expect(deriveEffectiveRequirements(state).has('tokens-10')).toBe(true);
    expect(deriveEffectiveRequirements(state).has('tokens-20')).toBe(false);
    expect(evaluateSecret(SECRET_BY_ID['skr-10']!, state).status).toBe('available-now');

    markSkulltulas(20);
    expect(deriveEffectiveRequirements(state).has('tokens-20')).toBe(true);

    markSkulltulas(30);
    expect(deriveEffectiveRequirements(state).has('tokens-30')).toBe(true);

    markSkulltulas(40);
    expect(deriveEffectiveRequirements(state).has('tokens-40')).toBe(true);

    markSkulltulas(50);
    expect(deriveEffectiveRequirements(state).has('tokens-50')).toBe(true);
    expect(evaluateSecret(SECRET_BY_ID['hp-10']!, state).status).toBe('available-now');

    markSkulltulas(100);
    expect(deriveEffectiveRequirements(state).has('tokens-100')).toBe(true);
    expect(evaluateSecret(SECRET_BY_ID['skr-100']!, state).status).toBe('available-now');

    // Secret-to-requirement sync
    let syncState = createDefaultProgressState();
    syncState = toggleSecretCompleted(syncState, 'eq-hookshot', true);
    syncState = toggleSecretCompleted(syncState, 'bottle-01', true);
    syncState = toggleSecretCompleted(syncState, 'skr-10', true);
    syncState = toggleSecretCompleted(syncState, 'gf-01', true);
    syncState = toggleSecretCompleted(syncState, 'mask-step-4', true);

    const eff = deriveEffectiveRequirements(syncState);
    expect(eff.has('hookshot')).toBe(true);
    expect(eff.has('bottle')).toBe(true);
    expect(eff.has('adults-wallet')).toBe(true);
    expect(eff.has('magic-meter')).toBe(true);
    expect(eff.has('dins-fire')).toBe(true);
    expect(eff.has('mask-of-truth')).toBe(true);

    // Transitive upgrade hierarchy (Giant's Wallet -> Adult's Wallet & Rupees; Longshot -> Hookshot; Golden Gauntlets -> Silver & Bracelet)
    let transState = createDefaultProgressState();
    transState = {
      ...transState,
      ownedRequirementIds: {
        'giants-wallet': true,
        longshot: true,
        'golden-scale': true,
        'golden-gauntlets': true,
      },
    };
    const transEff = deriveEffectiveRequirements(transState);
    expect(transEff.has('adults-wallet')).toBe(true);
    expect(transEff.has('rupees-100')).toBe(true);
    expect(transEff.has('hookshot')).toBe(true);
    expect(transEff.has('silver-scale')).toBe(true);
    expect(transEff.has('silver-gauntlets')).toBe(true);
    expect(transEff.has('goron-bracelet')).toBe(true);
  });

  it('computes accurate unlock deltas when toggling Bombs or Hookshot ON, and computes regional/global summaries', () => {
    const fresh = createDefaultProgressState();
    const withBombs = toggleRequirementOwned(fresh, 'bombs', true);
    const bombDelta = computeUnlockDelta(fresh, withBombs, 'Bomb Bag (Bombs)');

    expect(bombDelta.totalUnlocked).toBeGreaterThanOrEqual(7);
    expect(bombDelta.triggerLabel).toBe('Bomb Bag (Bombs)');
    const bombUnlockedIds = bombDelta.newlyUnlocked.map((i) => i.secret.id);
    expect(bombUnlockedIds).toEqual(
      expect.arrayContaining(['hp-03', 'hp-22', 'hp-23', 'gs-030', 'cap-bombs-30']),
    );
    expect(bombDelta.byRegion['zoras-river']?.map((i) => i.secret.id)).toEqual(
      expect.arrayContaining(['hp-22', 'hp-23']),
    );

    // Toggling Hookshot ON as Adult Link
    const adultBase: ReturnType<typeof createDefaultProgressState> = {
      ...fresh,
      ownedRequirementIds: {
        'era-adult': true,
        'time-day': true,
        'time-night': true,
        'rupees-100': true,
      },
    };
    const adultWithHookshot = toggleRequirementOwned(adultBase, 'hookshot', true);
    const hookshotDelta = computeUnlockDelta(adultBase, adultWithHookshot, 'Hookshot');

    expect(hookshotDelta.totalUnlocked).toBeGreaterThanOrEqual(15);
    expect(Object.keys(hookshotDelta.byRegion).length).toBeGreaterThanOrEqual(8);
    expect(hookshotDelta.newlyUnlocked.map((i) => i.secret.id)).toEqual(
      expect.arrayContaining(['hp-08', 'hp-14', 'hp-33', 'gs-003', 'gs-023', 'song-minuet']),
    );

    // Summaries invariant: completedCount + readyNowCount + lockedCount === totalCount
    const allSummaries = computeAllRegionSummaries(fresh);
    expect(Object.keys(allSummaries)).toHaveLength(34);
    for (const summary of Object.values(allSummaries)) {
      expect(summary.completedCount + summary.readyNowCount + summary.lockedCount).toBe(
        summary.totalCount,
      );
      expect(Number.isNaN(summary.percent)).toBe(false);
    }

    // Empty-secret dungeon (ganons-castle) never divides by zero
    const ganonSummary = computeRegionSummary('ganons-castle', fresh);
    expect(ganonSummary.totalCount).toBe(0);
    expect(ganonSummary.percent).toBe(0);
    expect(ganonSummary.isComplete).toBe(false);

    const global = computeGlobalProgress(fresh);
    expect(global.totalCount).toBe(231);
    expect(global.allTotalCount).toBe(232);
    expect(global.heartPiecesTotal).toBe(36);
    expect(global.skulltulasTotal).toBe(100);
  });
});

describe('Storage, Backup JSON Export/Import & URL Hash Routing (src/lib/storage.ts)', () => {
  beforeEach(() => {
    window.localStorage.clear();
    window.history.replaceState(null, '', '/');
  });

  it('persists to localStorage, round-trips JSON export/import, and resets cleanly', () => {
    let state = createDefaultProgressState();
    state = toggleSecretCompleted(state, 'hp-01', true);
    state = toggleSecretCompleted(state, 'bottle-01', true);
    state = {
      ...state,
      activeEraFilter: 'child',
      switch2SpotlightOnly: true,
      customScarecrowNotes: 'Y X A R Y X A R',
      theme: 'parchment',
    };

    saveProgressState(state);
    expect(window.localStorage.getItem(STORAGE_KEY)).toBeTruthy();

    const loaded = loadProgressState();
    expect(loaded.completedSecretIds['hp-01']).toBe(true);
    expect(loaded.completedSecretIds['bottle-01']).toBe(true);
    expect(loaded.ownedRequirementIds['bottle']).toBe(true);
    expect(loaded.customScarecrowNotes).toBe('Y X A R Y X A R');
    expect(loaded.theme).toBe('parchment');

    const exported = exportProgressJson(loaded);
    const reimported = parseImportedProgressJson(exported);
    expect(reimported).toEqual(loaded);

    expect(() => parseImportedProgressJson('')).toThrow();
    expect(() => parseImportedProgressJson('{bad json')).toThrow();
    expect(() => parseImportedProgressJson('{"foo":"bar"}')).toThrow();

    const afterReset = resetProgress();
    expect(Object.keys(afterReset.completedSecretIds)).toHaveLength(0);
    expect(afterReset.ownedRequirementIds['era-child']).toBe(true);
  });

  it('round-trips URL hash state cleanly without touching pathname', () => {
    expect(parseUrlHash('')).toEqual({
      view: 'map',
      chapterId: null,
      regionId: null,
      era: 'all',
      sheet: null,
      spotlight: false,
    });

    const built = buildUrlHash({
      regionId: 'death-mountain-crater',
      era: 'child',
      sheet: 'ocarina',
      spotlight: true,
    });
    expect(built).toBe('#region=death-mountain-crater&era=child&sheet=ocarina&spotlight=1');

    const parsed = parseUrlHash(built);
    expect(parsed).toEqual({
      view: 'map',
      chapterId: null,
      regionId: 'death-mountain-crater',
      era: 'child',
      sheet: 'ocarina',
      spotlight: true,
    });

    const routeHash = buildUrlHash({
      view: 'route',
      chapterId: 'ch-06',
      era: 'adult',
    });
    expect(routeHash).toBe('#view=route&chapter=ch-06&era=adult');
    expect(parseUrlHash(routeHash)).toEqual({
      view: 'route',
      chapterId: 'ch-06',
      regionId: null,
      era: 'adult',
      sheet: null,
      spotlight: false,
    });

    // Default values produce a clean empty hash
    expect(
      buildUrlHash({
        view: 'map',
        chapterId: null,
        regionId: null,
        era: 'all',
        sheet: null,
        spotlight: false,
      }),
    ).toBe('');

    // Unknown region IDs safely resolve to null
    expect(parseUrlHash('#region=non-existent-zone').regionId).toBeNull();
  });
});

describe('Area Walkthrough Guides & Optimal 100% Route Integrity', () => {
  it('validates all 34 AreaWalkthroughGuides and 232 regional secret mappings', () => {
    expect(AREA_GUIDES).toHaveLength(34);
    const seenSecrets = new Set<string>();

    for (const region of REGIONS) {
      const guide = AREA_GUIDE_BY_REGION_ID[region.id];
      expect(guide, `missing area guide for ${region.id}`).toBeDefined();
      expect(guide.tagline.length).toBeGreaterThan(10);
      expect(guide.recommendedVisitOrder.length).toBeGreaterThan(10);
      expect(guide.entrancesAndShortcuts.length).toBeGreaterThanOrEqual(2);
      expect(guide.phases.length).toBeGreaterThanOrEqual(2);
      expect(guide.proTips.length).toBeGreaterThanOrEqual(2);

      if (region.kind !== 'overworld') {
        expect(guide.bossStrategy, `missing bossStrategy for ${region.id}`).toBeDefined();
      }

      for (const phase of guide.phases) {
        expect(phase.steps.length).toBeGreaterThanOrEqual(1);
        for (const secId of phase.secretIds) {
          const sec = SECRET_BY_ID[secId];
          expect(sec, `unknown secret ${secId} in ${region.id}`).toBeDefined();
          expect(sec.regionId).toBe(region.id);
          expect(seenSecrets.has(secId), `duplicate secret ${secId} across area guides`).toBe(false);
          seenSecrets.add(secId);
        }
      }
    }

    expect(seenSecrets.size).toBe(ALL_SECRETS.length);
  });

  it('validates all 18 Optimal Route chapters and 231/231 100% countable secret coverage', () => {
    expect(OPTIMAL_ROUTE_CHAPTERS).toHaveLength(18);
    expect(ALL_ROUTE_STEPS.length).toBeGreaterThanOrEqual(100);

    const coveredCountable = new Set<string>();
    for (const chapter of OPTIMAL_ROUTE_CHAPTERS) {
      expect(ROUTE_CHAPTER_BY_ID[chapter.id]).toBe(chapter);
      expect(chapter.steps.length).toBeGreaterThanOrEqual(5);

      for (const step of chapter.steps) {
        expect(REGION_BY_ID[step.regionId], `invalid region ${step.regionId}`).toBeDefined();
        for (const reqId of step.unlocksRequirementIds ?? []) {
          expect(REQUIREMENT_BY_ID[reqId], `invalid req ${reqId}`).toBeDefined();
        }
        for (const secId of step.secretIds) {
          const sec = SECRET_BY_ID[secId];
          expect(sec, `invalid secret ${secId}`).toBeDefined();
          expect(sec.regionId).toBe(step.regionId);
          if (sec.countsToward100Percent) {
            expect(coveredCountable.has(secId), `duplicate countable secret ${secId}`).toBe(false);
            coveredCountable.add(secId);
          }
        }
      }
    }

    const expectedCountable = ALL_SECRETS.filter((s) => s.countsToward100Percent);
    expect(coveredCountable.size).toBe(expectedCountable.length);
  });
});
