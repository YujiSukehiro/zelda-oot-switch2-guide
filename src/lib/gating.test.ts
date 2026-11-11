import { beforeEach, describe, expect, it } from 'vitest';
import {
  ALL_ROUTE_STEPS,
  ALL_SECRETS,
  AREA_GUIDE_BY_REGION_ID,
  AREA_GUIDES,
  ATTACHED_DUNGEONS_BY_REGION,
  BOSS_HEART_CONTAINERS,
  DUNGEON_AND_SPECIAL_REGIONS,
  GANON_TRIALS,
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
  STORY_TOKENS,
  THREADS_OF_TIME_QUEST_IDS,
  THREADS_OF_TIME_SECRETS,
  UPGRADES_AND_BOTTLES,
  HALL_OF_FALLEN_FOES_STATUES,
  FOE_GALLERY_WINGS,
  BOSS_RUSH_GAUNTLETS,
  SCARECROW_SPOTS,
  HIDDEN_GROTTOS_DIRECTORY,
  FISHING_GUIDE_DATA,
  SHOP_VS_FREE_GEAR,
  MANDATORY_RUPEE_BUDGETS,
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
  deriveOwnedInventoryRequirements,
  evaluateRegionReachability,
  evaluateSecret,
  SECRET_TO_REQUIREMENTS_MAP,
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
  it('matches every expected count in METADATA.expectedCounts and totals 276 normalized secrets (275 countable)', () => {
    const exp = METADATA.expectedCounts;

    expect(OVERWORLD_REGIONS).toHaveLength(exp.overworldRegions); // 21
    expect(DUNGEON_AND_SPECIAL_REGIONS).toHaveLength(exp.dungeonsAndSpecialAreas); // 13
    expect(REGIONS).toHaveLength(exp.totalRegions); // 34
    expect(REQUIREMENTS).toHaveLength(69); // 66 original + 3 Spiritual Stones

    const byCat = (cat: string) => ALL_SECRETS.filter((s) => s.category === cat);
    const bySubCat = (sub: string) => ALL_SECRETS.filter((s) => s.subCategory === sub);

    expect(byCat('heart-piece')).toHaveLength(exp.heartPieces); // 36
    expect(byCat('gold-skulltula')).toHaveLength(exp.goldSkulltulasTotal); // 100
    expect(byCat('bottle')).toHaveLength(exp.emptyBottles); // 5
    expect(byCat('big-poe')).toHaveLength(exp.bigPoesTotal); // 10
    expect(byCat('great-fairy')).toHaveLength(exp.greatFairies); // 6
    expect(byCat('skulltula-reward')).toHaveLength(6);
    expect(byCat('capacity-upgrade')).toHaveLength(18); // 10 capacity + 8 Boss Heart Containers
    expect(byCat('equipment')).toHaveLength(43); // 28 gear/items + 9 stones/medallions + 6 Ganon trials
    expect(byCat('ocarina-song')).toHaveLength(exp.ocarinaSongs); // 13
    expect(byCat('magic-bean')).toHaveLength(exp.magicBeanLocations); // 10
    expect(byCat('mask-trade')).toHaveLength(exp.happyMaskTrades); // 4
    expect(byCat('biggoron-step')).toHaveLength(exp.biggoronTradeSteps); // 12
    expect(byCat('cow-or-grotto')).toHaveLength(5);
    expect(byCat('switch2-exclusive')).toHaveLength(8); // 6 Threads of Time + Hall of Fallen Foes + Thawed Zora's Domain
    expect(THREADS_OF_TIME_SECRETS).toHaveLength(exp.threadsOfTimeQuests ?? 6);
    expect(SECRET_BY_ID['sw2-threads-of-time']).toBeUndefined();

    // Phase 1 Core Subcategories (39 newly checkable cards)
    expect(bySubCat('dungeon-item')).toHaveLength(16);
    expect(bySubCat('boss-heart')).toHaveLength(8);
    expect(bySubCat('spiritual-stone')).toHaveLength(3);
    expect(bySubCat('medallion')).toHaveLength(6);
    expect(bySubCat('ganon-trial')).toHaveLength(6);
    expect(BOSS_HEART_CONTAINERS).toHaveLength(8);
    expect(STORY_TOKENS).toHaveLength(9);
    expect(GANON_TRIALS).toHaveLength(6);

    expect(ALL_SECRETS).toHaveLength(276);
    expect(Object.keys(SECRET_BY_ID)).toHaveLength(276);

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
    expect(ALL_SECRETS.filter((s) => s.countsToward100Percent)).toHaveLength(275);
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

    // Every core dungeon/progression item & spiritual stone maps in SECRET_TO_REQUIREMENTS_MAP
    const expectedProgressionMappings: Record<string, string[]> = {
      'eq-deku-shield': ['deku-shield'],
      'eq-ocarina': ['ocarina'],
      'eq-slingshot': ['slingshot'],
      'eq-goron-bracelet': ['goron-bracelet'],
      'eq-bomb-bag': ['bombs'],
      'eq-boomerang': ['boomerang'],
      'eq-bow': ['bow'],
      'eq-megaton-hammer': ['megaton-hammer'],
      'eq-iron-boots': ['iron-boots'],
      'eq-longshot': ['longshot'],
      'eq-hover-boots': ['hover-boots'],
      'eq-gerudo-card': ['gerudo-card'],
      'eq-silver-gauntlets': ['silver-gauntlets'],
      'eq-mirror-shield': ['mirror-shield'],
      'eq-light-arrows': ['light-arrows'],
      'eq-golden-gauntlets': ['golden-gauntlets'],
      'stone-emerald': ['stone-emerald'],
      'stone-ruby': ['stone-ruby'],
      'stone-sapphire': ['stone-sapphire'],
      'medallion-light': ['era-adult'],
      'medallion-forest': ['time-travel'],
      'medallion-water': ['zora-thawed'],
    };
    for (const [secId, expectedReqs] of Object.entries(expectedProgressionMappings)) {
      expect(SECRET_BY_ID[secId]).toBeDefined();
      expect(SECRET_TO_REQUIREMENTS_MAP[secId]).toEqual(expectedReqs);
    }

    for (const req of REQUIREMENTS) {
      const sourceRegionId = REQUIREMENT_SOURCE_REGION[req.id];
      expect(sourceRegionId).toBeDefined();
      expect(REGION_BY_ID[sourceRegionId]).toBeDefined();
    }

    expect(STORY_PRESETS).toHaveLength(8);
    expect(STORY_PRESETS.some((p) => p.id === 'goron-city-visit-1')).toBe(true);
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

  it('extracts Step 1 / Step 2 crossEraSteps, preserves timers/song buttons, and strips all raw .json or secret-ID leaks', () => {
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

    // Ensure eq-biggoron-sword and all Area Walkthrough Guides contain zero raw .json or backtick secret IDs
    expect(SECRET_BY_ID['eq-biggoron-sword']?.howToGet).toContain(
      'Open the Quests & Trading sheet for all 12 timed steps',
    );
    expect(SECRET_BY_ID['eq-biggoron-sword']?.howToGet).not.toContain('.json');

    const rawSecretSlugPattern =
      /`(?:eq|hp|gs|gf|skr|cap|bottle|bean|song|poe|mask|biggoron|cow|grotto|sw2|boss-hc|stone|medallion|trial)-[a-z0-9-]+`|\((?:eq|hp|gs|gf|skr|cap|bottle|bean|song|poe|mask|biggoron|cow|grotto|sw2|boss-hc|stone|medallion|trial)-[a-z0-9-]+\)/;
    for (const sec of ALL_SECRETS) {
      for (const prose of [
        sec.howToGet,
        sec.locationHint ?? '',
        sec.rewardText ?? '',
        sec.switch2Notes ?? '',
        sec.proTip ?? '',
      ]) {
        expect(prose).not.toMatch(/\.json\b/i);
        expect(prose).not.toMatch(rawSecretSlugPattern);
      }
    }
    for (const bean of SONGS_AND_QUESTS.magicBeans) {
      expect(bean.adultPayoff).not.toMatch(rawSecretSlugPattern);
    }
    for (const guide of AREA_GUIDES) {
      const proseChunks = [
        guide.tagline,
        guide.recommendedVisitOrder,
        ...guide.entrancesAndShortcuts,
        ...guide.proTips,
        ...(guide.bossStrategy
          ? [guide.bossStrategy.bossName, guide.bossStrategy.weakness, guide.bossStrategy.strategy]
          : []),
        ...guide.phases.flatMap((p) => [p.title, ...p.steps]),
      ];
      for (const text of proseChunks) {
        expect(text).not.toMatch(/\.json\b/i);
        expect(text).not.toMatch(rawSecretSlugPattern);
      }
    }
  });
});

describe('World-Reachability Graph, Progression Fixes & Environmental Tags (src/lib/gating.ts)', () => {
  it('enforces Kokiri Fresh Start world-reachability locks (Mido & Pokey) and unlocks Hyrule Field via Deku Tree clear', () => {
    const fresh = createDefaultProgressState();
    const freshEff = deriveEffectiveRequirements(fresh);

    // Only Kokiri Forest, Lost Woods, and Sacred Forest Meadow are reachable on a true Fresh Start
    const reachableOnFreshStart = REGIONS.filter(
      (r) => evaluateRegionReachability(r.id, freshEff).isReachable,
    ).map((r) => r.id);
    expect(reachableOnFreshStart.sort()).toEqual([
      'kokiri-forest',
      'lost-woods',
      'sacred-forest-meadow',
    ]);

    // Mido blocks Inside the Great Deku Tree until BOTH Kokiri Sword and Deku Shield are equipped
    const dekuLocked = evaluateRegionReachability('deku-tree', freshEff);
    expect(dekuLocked.isReachable).toBe(false);
    expect(dekuLocked.blockerLabel).toBe('Equip Kokiri Sword & Deku Shield to pass Mido');
    expect(dekuLocked.blockerReqId).toBe('kokiri-sword');

    const withSwordOnly = toggleSecretCompleted(fresh, 'eq-kokiri-sword', true);
    const dekuStillLocked = evaluateRegionReachability(
      'deku-tree',
      deriveEffectiveRequirements(withSwordOnly),
    );
    expect(dekuStillLocked.isReachable).toBe(false);
    expect(dekuStillLocked.blockerReqId).toBe('deku-shield');

    const withSwordAndShield = toggleSecretCompleted(withSwordOnly, 'eq-deku-shield', true);
    expect(
      evaluateRegionReachability('deku-tree', deriveEffectiveRequirements(withSwordAndShield))
        .isReachable,
    ).toBe(true);

    // Pokey blocks leaving Kokiri Forest until Kokiri's Emerald (stone-emerald) is earned
    const hfLockedSummary = computeRegionSummary('hyrule-field', fresh);
    expect(hfLockedSummary.isReachable).toBe(false);
    expect(hfLockedSummary.reachabilityBlocker).toBe(
      'Clear Inside the Great Deku Tree to leave Kokiri Forest',
    );
    expect(hfLockedSummary.reachabilityBlockerReqId).toBe('stone-emerald');
    expect(hfLockedSummary.readyNowCount).toBe(0);

    const kakarikoHpOnFresh = evaluateSecret(SECRET_BY_ID['hp-07']!, fresh);
    expect(kakarikoHpOnFresh.status).toBe('locked');
    expect(kakarikoHpOnFresh.isRegionLocked).toBe(true);
    expect(kakarikoHpOnFresh.regionLockReason).toBe(
      'Clear Inside the Great Deku Tree to leave Kokiri Forest',
    );
    expect(kakarikoHpOnFresh.primaryBlockerLabel).toBe(
      'Clear Inside the Great Deku Tree to leave Kokiri Forest',
    );

    // Checking stone-emerald unlocks Hyrule Field & central overworld hubs
    const postDeku = toggleSecretCompleted(withSwordAndShield, 'stone-emerald', true);
    const postDekuEff = deriveEffectiveRequirements(postDeku);
    for (const regionId of [
      'hyrule-field',
      'lon-lon-ranch',
      'market',
      'hyrule-castle',
      'kakariko-village',
      'graveyard',
      'lake-hylia',
      'zoras-river',
      'gerudo-valley',
    ]) {
      expect(evaluateRegionReachability(regionId, postDekuEff).isReachable).toBe(true);
    }
    expect(evaluateSecret(SECRET_BY_ID['hp-07']!, postDeku).status).toBe('available-now');
  });

  it('enforces canonical gate rules across Child & Adult dungeons and special regions', () => {
    let state = toggleSecretCompleted(createDefaultProgressState(), 'stone-emerald', true);

    // Death Mountain Trail & Goron City require Zelda's Letter (or Bombs / Adult)
    expect(
      evaluateRegionReachability('goron-city', deriveEffectiveRequirements(state)),
    ).toMatchObject({
      isReachable: false,
      blockerLabel: "Show Zelda's Letter to the Kakariko Gate Guard",
      blockerReqId: 'zeldas-letter',
    });
    state = toggleRequirementOwned(state, 'zeldas-letter', true);
    expect(
      evaluateRegionReachability('goron-city', deriveEffectiveRequirements(state)).isReachable,
    ).toBe(true);

    // Dodongo's Cavern requires Goron's Bracelet (or Bombs / Adult)
    expect(
      evaluateRegionReachability('dodongos-cavern', deriveEffectiveRequirements(state)),
    ).toMatchObject({
      isReachable: false,
      blockerLabel: "Obtain Goron's Bracelet from Darunia in Goron City",
      blockerReqId: 'goron-bracelet',
    });
    state = toggleSecretCompleted(state, 'eq-goron-bracelet', true);
    expect(
      evaluateRegionReachability('dodongos-cavern', deriveEffectiveRequirements(state)).isReachable,
    ).toBe(true);
    expect(
      evaluateRegionReachability('death-mountain-crater', deriveEffectiveRequirements(state))
        .isReachable,
    ).toBe(true);

    // Zora's Domain -> Zora's Fountain -> Jabu-Jabu's Belly
    expect(
      evaluateRegionReachability('zoras-domain', deriveEffectiveRequirements(state)),
    ).toMatchObject({
      isReachable: false,
      blockerLabel: "Play Zelda's Lullaby at Zora's River Waterfall",
      blockerReqId: 'song-lullaby',
    });
    state = toggleSecretCompleted(state, 'song-lullaby', true);
    expect(
      evaluateRegionReachability('zoras-domain', deriveEffectiveRequirements(state)).isReachable,
    ).toBe(true);
    expect(
      evaluateRegionReachability('zoras-fountain', deriveEffectiveRequirements(state)),
    ).toMatchObject({
      isReachable: false,
      blockerLabel: "Find Ruto's Letter in Lake Hylia & show King Zora",
      blockerReqId: 'bottle',
    });
    state = toggleSecretCompleted(state, 'bottle-01', true);
    expect(
      evaluateRegionReachability('zoras-fountain', deriveEffectiveRequirements(state)).isReachable,
    ).toBe(true);
    expect(
      evaluateRegionReachability('jabu-jabus-belly', deriveEffectiveRequirements(state))
        .isReachable,
    ).toBe(true);

    // Bottom of the Well requires Child + Song of Storms
    expect(
      evaluateRegionReachability('bottom-of-the-well', deriveEffectiveRequirements(state))
        .blockerReqId,
    ).toBe('song-storms');
    state = toggleSecretCompleted(state, 'song-storms', true);
    expect(
      evaluateRegionReachability('bottom-of-the-well', deriveEffectiveRequirements(state))
        .isReachable,
    ).toBe(true);

    // Requiem of Spirit warps Child Link directly to Desert Colossus & Spirit Temple!
    expect(
      evaluateRegionReachability('spirit-temple', deriveEffectiveRequirements(state)).isReachable,
    ).toBe(false);
    const childRequiem = toggleSecretCompleted(state, 'song-requiem', true);
    expect(
      evaluateRegionReachability('desert-colossus', deriveEffectiveRequirements(childRequiem))
        .isReachable,
    ).toBe(true);
    expect(
      evaluateRegionReachability('spirit-temple', deriveEffectiveRequirements(childRequiem))
        .isReachable,
    ).toBe(true);

    // Adult dungeon progression checks
    let adultState = applyStoryPreset(createDefaultProgressState(), 'fresh-adult-hookshot');
    expect(
      evaluateRegionReachability('forest-temple', deriveEffectiveRequirements(adultState))
        .isReachable,
    ).toBe(true);
    expect(
      evaluateRegionReachability('fire-temple', deriveEffectiveRequirements(adultState))
        .isReachable,
    ).toBe(true);
    expect(
      evaluateRegionReachability('ice-cavern', deriveEffectiveRequirements(adultState)).isReachable,
    ).toBe(true);
    expect(
      evaluateRegionReachability('water-temple', deriveEffectiveRequirements(adultState))
        .blockerReqId,
    ).toBe('iron-boots');

    adultState = toggleSecretCompleted(adultState, 'eq-iron-boots', true);
    expect(
      evaluateRegionReachability('water-temple', deriveEffectiveRequirements(adultState))
        .isReachable,
    ).toBe(true);

    expect(
      evaluateRegionReachability('shadow-temple', deriveEffectiveRequirements(adultState))
        .blockerReqId,
    ).toBe('song-nocturne');
    adultState = toggleSecretCompleted(adultState, 'song-nocturne', true);
    adultState = toggleSecretCompleted(adultState, 'gf-01', true); // Din's Fire
    expect(
      evaluateRegionReachability('shadow-temple', deriveEffectiveRequirements(adultState))
        .isReachable,
    ).toBe(true);

    expect(
      evaluateRegionReachability('gerudo-training-ground', deriveEffectiveRequirements(adultState))
        .blockerReqId,
    ).toBe('gerudo-card');
    adultState = toggleSecretCompleted(adultState, 'eq-gerudo-card', true);
    expect(
      evaluateRegionReachability('gerudo-training-ground', deriveEffectiveRequirements(adultState))
        .isReachable,
    ).toBe(true);
    expect(
      evaluateRegionReachability('haunted-wasteland', deriveEffectiveRequirements(adultState))
        .isReachable,
    ).toBe(true);
    expect(
      evaluateRegionReachability('spirit-temple', deriveEffectiveRequirements(adultState))
        .blockerReqId,
    ).toBe('lens-of-truth');
    adultState = toggleSecretCompleted(adultState, 'eq-lens-of-truth', true);
    expect(
      evaluateRegionReachability('spirit-temple', deriveEffectiveRequirements(adultState))
        .isReachable,
    ).toBe(true);

    expect(
      evaluateRegionReachability('ganons-castle', deriveEffectiveRequirements(adultState))
        .blockerReqId,
    ).toBe('light-arrows');
    adultState = toggleSecretCompleted(adultState, 'eq-light-arrows', true);
    expect(
      evaluateRegionReachability('ganons-castle', deriveEffectiveRequirements(adultState))
        .isReachable,
    ).toBe(true);

    expect(
      evaluateRegionReachability('hall-of-fallen-foes', deriveEffectiveRequirements(adultState))
        .blockerReqId,
    ).toBe('song-prelude');
    adultState = toggleSecretCompleted(adultState, 'song-prelude', true);
    expect(
      evaluateRegionReachability('hall-of-fallen-foes', deriveEffectiveRequirements(adultState))
        .isReachable,
    ).toBe(true);
  });

  it('surfaces environmentalConditions as soft badges instead of hard progression locks', () => {
    const fresh = createDefaultProgressState();

    // gs-001 in Kokiri Forest is immediately available-now with ['Night Only'] badge on Fresh Start!
    const gs001 = evaluateSecret(SECRET_BY_ID['gs-001']!, fresh);
    expect(gs001.status).toBe('available-now');
    expect(gs001.visitStage).toBe('do-now');
    expect(gs001.environmentalConditions).toEqual(['Night Only']);

    // gs-002 (Kokiri Shop Soft Soil) requires an Empty Bottle + surfaces ['Bring Bottled Bugs']
    const gs002BeforeBottle = evaluateSecret(SECRET_BY_ID['gs-002']!, fresh);
    expect(gs002BeforeBottle.status).toBe('locked');
    expect(gs002BeforeBottle.missingPrimaryIds).toEqual(['bottle']);
    expect(gs002BeforeBottle.environmentalConditions).toEqual(['Bring Bottled Bugs']);
    expect(gs002BeforeBottle.visitStage).toBe('later-gear');

    // Owning any Empty Bottle unlocks gs-002 without needing a separate 'bottled-bug' toggle
    const withBottle = toggleSecretCompleted(fresh, 'bottle-01', true);
    const gs002AfterBottle = evaluateSecret(SECRET_BY_ID['gs-002']!, withBottle);
    expect(gs002AfterBottle.status).toBe('available-now');
    expect(gs002AfterBottle.visitStage).toBe('do-now');
    expect(gs002AfterBottle.environmentalConditions).toEqual(['Bring Bottled Bugs']);
  });

  it('wires completedRouteStepIds -> unlocksRequirementIds and unlocks 100% of Hyrule when loadoutModeEnabled === false', () => {
    const fresh = createDefaultProgressState();
    expect(deriveEffectiveRequirements(fresh).has('stone-emerald')).toBe(false);

    // Completing Route Steps ch-01-step-05 & ch-02-step-05 grants stone-emerald & zeldas-letter
    const withRouteStep: ReturnType<typeof createDefaultProgressState> = {
      ...fresh,
      completedRouteStepIds: {
        'ch-01-step-05': true,
        'ch-02-step-04': true,
        'ch-02-step-05': true,
      },
    };
    const routeEff = deriveEffectiveRequirements(withRouteStep);
    expect(routeEff.has('stone-emerald')).toBe(true);
    expect(routeEff.has('weird-egg')).toBe(true);
    expect(routeEff.has('zeldas-letter')).toBe(true);
    expect(evaluateRegionReachability('goron-city', routeEff).isReachable).toBe(true);

    // Turning Loadout Gating OFF ("Checklist Mode") unlocks all 69 requirements, all 34 regions, and all 276 secrets!
    const checklistModeState = {
      ...fresh,
      loadoutModeEnabled: false,
    };
    const checklistEff = deriveEffectiveRequirements(checklistModeState);
    expect(checklistEff.size).toBe(69);
    for (const req of REQUIREMENTS) {
      expect(checklistEff.has(req.id)).toBe(true);
    }

    const allSummaries = computeAllRegionSummaries(checklistModeState);
    for (const summary of Object.values(allSummaries)) {
      expect(summary.isReachable).toBe(true);
      expect(summary.lockedCount).toBe(0);
      expect(summary.readyNowCount).toBe(summary.totalCount);
    }
  });

  it('separates visitStage cleanly on the Goron City — 1st Visit preset and computes Live Heart Container math', () => {
    const goronPresetState = applyStoryPreset(createDefaultProgressState(), 'goron-city-visit-1');
    const goronEff = deriveEffectiveRequirements(goronPresetState);

    expect(evaluateRegionReachability('goron-city', goronEff).isReachable).toBe(true);
    expect(evaluateRegionReachability('dodongos-cavern', goronEff).isReachable).toBe(false);

    // Inside Goron City on Visit 1:
    // - eq-goron-bracelet & hp-16 (Lit Urn) are 'do-now'
    // - cap-bombs-30 & gs-030 (Boulder Maze) are 'later-gear' (need Bombs)
    // - eq-goron-tunic & gs-031 (Center Platform) are 'later-era' (Adult Era)
    expect(evaluateSecret(SECRET_BY_ID['eq-goron-bracelet']!, goronPresetState).visitStage).toBe(
      'do-now',
    );
    expect(evaluateSecret(SECRET_BY_ID['hp-16']!, goronPresetState).visitStage).toBe('do-now');
    expect(evaluateSecret(SECRET_BY_ID['cap-bombs-30']!, goronPresetState).visitStage).toBe(
      'later-gear',
    );
    expect(evaluateSecret(SECRET_BY_ID['gs-030']!, goronPresetState).visitStage).toBe(
      'later-gear',
    );
    expect(evaluateSecret(SECRET_BY_ID['eq-goron-tunic']!, goronPresetState).visitStage).toBe(
      'later-era',
    );
    expect(evaluateSecret(SECRET_BY_ID['gs-031']!, goronPresetState).visitStage).toBe(
      'later-era',
    );

    // Live Heart Meter math: 3 starting + bossHeartsCompleted + floor(heartPiecesCompleted / 4)
    let heartState = createDefaultProgressState();
    const freshGlobal = computeGlobalProgress(heartState);
    expect(freshGlobal.bossHeartsTotal).toBe(8);
    expect(freshGlobal.bossHeartsCompleted).toBe(0);
    expect(freshGlobal.currentHeartContainers).toBe(3);
    expect(freshGlobal.heartPieceQuarterRemainder).toBe(0);

    // Check 2 Boss Hearts + 7 Heart Pieces -> 3 + 2 + 1 = 6 full hearts, 3/4 remainder
    heartState = toggleSecretCompleted(heartState, 'boss-hc-deku', true);
    heartState = toggleSecretCompleted(heartState, 'boss-hc-dodongo', true);
    for (const hpId of ['hp-01', 'hp-02', 'hp-03', 'hp-04', 'hp-07', 'hp-08', 'hp-10']) {
      heartState = toggleSecretCompleted(heartState, hpId, true);
    }
    // Verify hp-10 auto-synced skr-50 without double-counting Heart Pieces!
    expect(heartState.completedSecretIds['skr-50']).toBe(true);
    const midGlobal = computeGlobalProgress(heartState);
    expect(midGlobal.bossHeartsCompleted).toBe(2);
    expect(midGlobal.heartPiecesCompleted).toBe(7);
    expect(midGlobal.currentHeartContainers).toBe(6);
    expect(midGlobal.heartPieceQuarterRemainder).toBe(3);

    // Complete all 8 Boss Hearts + all 36 Heart Pieces -> 20 Heart Containers, 0 remainder
    for (const bossHc of BOSS_HEART_CONTAINERS) {
      heartState = toggleSecretCompleted(heartState, bossHc.id, true);
    }
    for (const hp of HEART_PIECES) {
      heartState = toggleSecretCompleted(heartState, hp.id, true);
    }
    const maxGlobal = computeGlobalProgress(heartState);
    expect(maxGlobal.bossHeartsCompleted).toBe(8);
    expect(maxGlobal.heartPiecesCompleted).toBe(36);
    expect(maxGlobal.currentHeartContainers).toBe(20);
    expect(maxGlobal.heartPieceQuarterRemainder).toBe(0);
  });
});

describe('Gating Engine, Cross-Era Puzzles & Alternate Tricks (src/lib/gating.ts)', () => {
  it('places Switch 2 cross-era puzzles (hp-05, hp-06, gs-010) in Cross-Era blocker bucket until unlocked', () => {
    const postDekuChild = toggleSecretCompleted(
      createDefaultProgressState(),
      'stone-emerald',
      true,
    );
    const hyruleFieldCats = categorizeRegionSecrets('hyrule-field', postDekuChild, 'blocker');

    const crossBucket = hyruleFieldCats.lockedBuckets.find((b) => b.category === 'cross-era');
    expect(crossBucket).toBeDefined();
    const crossIds = crossBucket?.items.map((i) => i.secret.id) ?? [];
    expect(crossIds).toEqual(expect.arrayContaining(['hp-05', 'hp-06', 'gs-010']));

    // Grant Time Travel + prerequisites -> all 3 move to readyNow
    let unlockedState = toggleRequirementOwned(postDekuChild, 'era-adult', true);
    unlockedState = toggleRequirementOwned(unlockedState, 'time-travel', true);
    unlockedState = toggleRequirementOwned(unlockedState, 'bombs', true);
    unlockedState = toggleRequirementOwned(unlockedState, 'hookshot', true);

    const afterCats = categorizeRegionSecrets('hyrule-field', unlockedState, 'blocker');
    const readyIds = afterCats.readyNow.map((i) => i.secret.id);
    expect(readyIds).toEqual(expect.arrayContaining(['hp-05', 'hp-06', 'gs-010']));
  });

  it('evaluates early alternate tricks (available-via-alt) in both Child and Adult directions', () => {
    let postDekuChild = toggleSecretCompleted(createDefaultProgressState(), 'stone-emerald', true);
    postDekuChild = toggleRequirementOwned(postDekuChild, 'zeldas-letter', true);

    // Once Hyrule Field & Death Mountain Trail are reachable as Child Link:
    // - hp-33 (Gerudo Valley Gorge Chest) is available-now via primary ['era-child']
    // - hp-08 (Kakariko Rooftop Man) is available-via-alt (primary needs Adult + Hookshot)
    // - hp-18 (Dodongo's Cavern Cliff) is available-via-alt (primary needs Child + Beans + Adult)
    const hp33AsChild = evaluateSecret(SECRET_BY_ID['hp-33']!, postDekuChild);
    expect(hp33AsChild.status).toBe('available-now');

    const hp08AsChild = evaluateSecret(SECRET_BY_ID['hp-08']!, postDekuChild);
    expect(hp08AsChild.status).toBe('available-via-alt');
    expect(hp08AsChild.readyAltMethod?.requiredIds).toEqual(['era-child']);

    const hp18AsChild = evaluateSecret(SECRET_BY_ID['hp-18']!, postDekuChild);
    expect(hp18AsChild.status).toBe('available-via-alt');
    expect(hp18AsChild.readyAltMethod?.requiredIds).toEqual(['era-child']);

    // On Fresh Adult + Hookshot (era-adult + hookshot, WITHOUT era-child):
    // - hp-33 becomes available-via-alt via Adult Hookshot onto the new Switch 2 chest!
    // - hp-08 becomes available-now via primary ['era-adult', 'hookshot']!
    const adultHookshotState = applyStoryPreset(postDekuChild, 'fresh-adult-hookshot');
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
    const goronVisit = applyStoryPreset(createDefaultProgressState(), 'goron-city-visit-1');
    const craterReachable = toggleSecretCompleted(goronVisit, 'eq-goron-bracelet', true);

    const kakariko = categorizeRegionSecrets('kakariko-village', craterReachable, 'blocker');
    expect(kakariko.readyNow.map((i) => i.secret.id)).toEqual(
      expect.arrayContaining(['hp-07', 'hp-08', 'bottle-03', 'gs-018', 'gs-019', 'gs-020']),
    );
    const kakarikoBucketCategories = new Set(kakariko.lockedBuckets.map((b) => b.category));
    expect(kakarikoBucketCategories.has('gear')).toBe(true);
    expect(kakarikoBucketCategories.has('wallet-milestone')).toBe(true);
    // Environmental conditions (time-night / bottled-bug) never create hard 'time-bug' locks!
    expect(kakarikoBucketCategories.has('time-bug')).toBe(false);

    const crater = categorizeRegionSecrets('death-mountain-crater', craterReachable, 'blocker');
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
    let state = toggleSecretCompleted(createDefaultProgressState(), 'stone-emerald', true);

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

    // Secret-to-requirement sync (including Medallions & Dungeon Gear)
    let syncState = createDefaultProgressState();
    syncState = toggleSecretCompleted(syncState, 'eq-hookshot', true);
    syncState = toggleSecretCompleted(syncState, 'bottle-01', true);
    syncState = toggleSecretCompleted(syncState, 'skr-10', true);
    syncState = toggleSecretCompleted(syncState, 'gf-01', true);
    syncState = toggleSecretCompleted(syncState, 'mask-step-4', true);
    syncState = toggleSecretCompleted(syncState, 'medallion-light', true);
    syncState = toggleSecretCompleted(syncState, 'medallion-forest', true);
    syncState = toggleSecretCompleted(syncState, 'medallion-water', true);

    const eff = deriveEffectiveRequirements(syncState);
    expect(eff.has('hookshot')).toBe(true);
    expect(eff.has('bottle')).toBe(true);
    expect(eff.has('adults-wallet')).toBe(true);
    expect(eff.has('magic-meter')).toBe(true);
    expect(eff.has('dins-fire')).toBe(true);
    expect(eff.has('mask-of-truth')).toBe(true);
    expect(eff.has('era-adult')).toBe(true);
    expect(eff.has('time-travel')).toBe(true);
    expect(eff.has('zora-thawed')).toBe(true);

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

    // Unchecking progression secrets cleanly removes synced ownedRequirementIds (Bug #3 regression guard)
    let toggleBackState = createDefaultProgressState();
    toggleBackState = toggleSecretCompleted(toggleBackState, 'stone-emerald', true);
    expect(toggleBackState.ownedRequirementIds['stone-emerald']).toBe(true);
    expect(
      evaluateRegionReachability('hyrule-field', deriveEffectiveRequirements(toggleBackState))
        .isReachable,
    ).toBe(true);

    toggleBackState = toggleSecretCompleted(toggleBackState, 'stone-emerald', false);
    expect(toggleBackState.completedSecretIds['stone-emerald']).toBeUndefined();
    expect(toggleBackState.ownedRequirementIds['stone-emerald']).toBeUndefined();
    expect(
      evaluateRegionReachability('hyrule-field', deriveEffectiveRequirements(toggleBackState))
        .isReachable,
    ).toBe(false);

    // Multi-secret requirement (bottle-01 + bottle-02 -> 'bottle'): stays owned until last bottle is unchecked
    toggleBackState = toggleSecretCompleted(toggleBackState, 'bottle-01', true);
    toggleBackState = toggleSecretCompleted(toggleBackState, 'bottle-02', true);
    toggleBackState = toggleSecretCompleted(toggleBackState, 'bottle-01', false);
    expect(toggleBackState.ownedRequirementIds['bottle']).toBe(true);
    toggleBackState = toggleSecretCompleted(toggleBackState, 'bottle-02', false);
    expect(toggleBackState.ownedRequirementIds['bottle']).toBeUndefined();

    // Unowning a secret-backed requirement via toggleRequirementOwned also clears completedSecretIds (Bug #4c guard)
    let invState = toggleSecretCompleted(createDefaultProgressState(), 'eq-hookshot', true);
    invState = toggleSecretCompleted(invState, 'gf-01', true);
    expect(deriveOwnedInventoryRequirements(invState).has('hookshot')).toBe(true);
    expect(deriveOwnedInventoryRequirements(invState).has('deku-sticks')).toBe(false);

    invState = toggleRequirementOwned(invState, 'hookshot');
    expect(invState.completedSecretIds['eq-hookshot']).toBeUndefined();
    expect(deriveOwnedInventoryRequirements(invState).has('hookshot')).toBe(false);

    // Turning off 'dins-fire' unchecks 'gf-01' while preserving sibling 'magic-meter'
    invState = toggleRequirementOwned(invState, 'dins-fire');
    expect(invState.completedSecretIds['gf-01']).toBeUndefined();
    expect(deriveOwnedInventoryRequirements(invState).has('dins-fire')).toBe(false);
    expect(deriveOwnedInventoryRequirements(invState).has('magic-meter')).toBe(true);
  });

  it('computes accurate unlock deltas when toggling Bombs or Hookshot ON, and computes regional/global summaries', () => {
    const goronVisit = applyStoryPreset(createDefaultProgressState(), 'goron-city-visit-1');
    const withBombs = toggleRequirementOwned(goronVisit, 'bombs', true);
    const bombDelta = computeUnlockDelta(goronVisit, withBombs, 'Bomb Bag (Bombs)');

    expect(bombDelta.totalUnlocked).toBeGreaterThanOrEqual(12);
    expect(bombDelta.triggerLabel).toBe('Bomb Bag (Bombs)');
    const bombUnlockedIds = bombDelta.newlyUnlocked.map((i) => i.secret.id);
    expect(bombUnlockedIds).toEqual(
      expect.arrayContaining([
        'hp-03',
        'hp-22',
        'hp-23',
        'gs-030',
        'cap-bombs-30',
        'boss-hc-dodongo',
        'stone-ruby',
      ]),
    );
    expect(bombDelta.byRegion['zoras-river']?.map((i) => i.secret.id)).toEqual(
      expect.arrayContaining(['hp-22', 'hp-23']),
    );

    // Toggling Hookshot ON as Adult Link
    const adultBase: ReturnType<typeof createDefaultProgressState> = {
      ...goronVisit,
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
    const fresh = createDefaultProgressState();
    const allSummaries = computeAllRegionSummaries(fresh);
    expect(Object.keys(allSummaries)).toHaveLength(34);
    for (const summary of Object.values(allSummaries)) {
      expect(summary.completedCount + summary.readyNowCount + summary.lockedCount).toBe(
        summary.totalCount,
      );
      expect(Number.isNaN(summary.percent)).toBe(false);
    }

    // Inside Ganon's Castle now tracks Golden Gauntlets + all 6 Elemental Barrier Trials (7 cards)
    const ganonSummary = computeRegionSummary('ganons-castle', fresh);
    expect(ganonSummary.totalCount).toBe(7);
    expect(ganonSummary.percent).toBe(0);
    expect(ganonSummary.isComplete).toBe(false);
    expect(ganonSummary.isReachable).toBe(false);

    const global = computeGlobalProgress(fresh);
    expect(global.totalCount).toBe(275);
    expect(global.allTotalCount).toBe(276);
    expect(global.heartPiecesTotal).toBe(36);
    expect(global.bossHeartsTotal).toBe(8);
    expect(global.skulltulasTotal).toBe(100);
    expect(global.totalRegionsCount).toBe(34);
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
  it('validates all 34 AreaWalkthroughGuides and 276 regional secret mappings', () => {
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

  it('validates all 18 Optimal Route chapters and 275/275 100% countable secret coverage', () => {
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


describe('Phase 2 Switch 2 Deep Content: 6 Threads of Time, 84 Foe Statues & Companion Reference', () => {
  it('validates all 6 individual Threads of Time quests and their progression gating', () => {
    expect(THREADS_OF_TIME_QUEST_IDS).toEqual([
      'sw2-thread-malon',
      'sw2-thread-darunia',
      'sw2-thread-ruto',
      'sw2-thread-nabooru',
      'sw2-thread-impa',
      'sw2-thread-saria',
    ]);
    expect(THREADS_OF_TIME_SECRETS).toHaveLength(6);

    const fresh = createDefaultProgressState();
    for (const quest of THREADS_OF_TIME_SECRETS) {
      expect(quest.countsToward100Percent).toBe(true);
      expect(quest.category).toBe('switch2-exclusive');
      expect(evaluateSecret(quest, fresh).status).toBe('locked');
    }

    // Unlocking Zora's Domain reachability + Adult + Zora Thawed makes Ruto's quest available-now!
    const zoraState = {
      ...fresh,
      ownedRequirementIds: {
        ...fresh.ownedRequirementIds,
        'era-adult': true,
        'stone-emerald': true,
        ocarina: true,
        'song-lullaby': true,
        bombs: true,
        'zora-thawed': true,
      },
    };
    expect(evaluateSecret(SECRET_BY_ID['sw2-thread-ruto'], zoraState).status).toBe('available-now');
    expect(evaluateSecret(SECRET_BY_ID['sw2-thread-nabooru'], zoraState).status).toBe('locked');
  });

  it('validates all 84 Hall of Fallen Foes statues, 5 gallery wings, Boss Rush gauntlets & companion reference datasets', () => {
    expect(HALL_OF_FALLEN_FOES_STATUES).toHaveLength(
      METADATA.expectedCounts.hallOfFallenFoesStatues,
    );
    expect(HALL_OF_FALLEN_FOES_STATUES).toHaveLength(84);
    expect(FOE_GALLERY_WINGS).toHaveLength(5);
    expect(BOSS_RUSH_GAUNTLETS).toHaveLength(3);

    const seenIds = new Set<string>();
    const seenNums = new Set<number>();
    const wingSet = new Set<string>();
    const rawSlugPattern = /\((?:hp|gs|gf|skr|sw2)-\d+|\.json|\*\*/;

    for (const statue of HALL_OF_FALLEN_FOES_STATUES) {
      expect(seenIds.has(statue.id)).toBe(false);
      expect(seenNums.has(statue.number)).toBe(false);
      seenIds.add(statue.id);
      seenNums.add(statue.number);
      wingSet.add(statue.wing);

      expect(statue.number).toBeGreaterThanOrEqual(1);
      expect(statue.number).toBeLessThanOrEqual(84);
      expect(REGION_BY_ID[statue.primaryRegionId]).toBeDefined();
      expect(statue.howToLog).not.toMatch(rawSlugPattern);
      expect(statue.rareTip ?? '').not.toMatch(rawSlugPattern);
    }
    expect(wingSet.size).toBe(5);
    expect(HALL_OF_FALLEN_FOES_STATUES.filter((s) => s.isRareOrMissable).length).toBeGreaterThanOrEqual(7);

    // Companion Reference integrity
    expect(SCARECROW_SPOTS.length).toBeGreaterThanOrEqual(10);
    for (const spot of SCARECROW_SPOTS) {
      expect(REGION_BY_ID[spot.regionId]).toBeDefined();
      expect(spot.whereToStand).not.toMatch(rawSlugPattern);
      expect(spot.reward).not.toMatch(rawSlugPattern);
    }

    expect(HIDDEN_GROTTOS_DIRECTORY.length).toBeGreaterThanOrEqual(16);
    for (const grotto of HIDDEN_GROTTOS_DIRECTORY) {
      expect(REGION_BY_ID[grotto.regionId]).toBeDefined();
      expect(grotto.locationAndSteps).not.toMatch(rawSlugPattern);
    }

    expect(FISHING_GUIDE_DATA.sinkingLureSpots).toHaveLength(4);
    expect(SHOP_VS_FREE_GEAR.length).toBeGreaterThanOrEqual(6);
    expect(MANDATORY_RUPEE_BUDGETS.map((b) => b.totalRupees)).toContain(550);
    expect(MANDATORY_RUPEE_BUDGETS.map((b) => b.totalRupees)).toContain(1175);
  });
});
