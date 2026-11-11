import {
  ALL_SECRETS,
  METADATA,
  REGIONS,
  REQUIREMENT_BY_ID,
  SECRETS_BY_REGION,
  STORY_PRESETS,
} from '../data';
import type {
  AccessStatus,
  AltMethod,
  BlockerCategoryKind,
  CategorizedRegionSecrets,
  CollectibleTypeGroupKey,
  DrawerGroupMode,
  Era,
  EraFilter,
  EvaluatedSecret,
  GlobalProgressSummary,
  PlayerProgressState,
  RegionProgressSummary,
  RequirementBlockerBucket,
  SecretCategory,
  TierSecretBucket,
  TypeSecretBucket,
  UnifiedSecret,
  UnlockDelta,
} from '../types/zelda';

/**
 * Baseline starter state for a Fresh Start in Kokiri Forest:
 * Child Link + Daytime + 200-Rupee Switch 2 Kokiri Wallet.
 */
export const DEFAULT_OWNED_REQUIREMENTS: readonly string[] = [
  'era-child',
  'time-day',
  'rupees-100',
];

/**
 * Maps collectible secret IDs to canonical requirement IDs that are
 * automatically satisfied once that secret is checked off.
 */
export const SECRET_TO_REQUIREMENTS_MAP: Readonly<Record<string, readonly string[]>> = {
  // Equipment
  'eq-kokiri-sword': ['kokiri-sword'],
  'eq-silver-scale': ['silver-scale'],
  'eq-golden-scale': ['golden-scale'],
  'eq-goron-tunic': ['goron-tunic'],
  'eq-zora-tunic': ['zora-tunic'],
  'eq-epona': ['epona'],
  'eq-hookshot': ['hookshot'],
  'eq-lens-of-truth': ['lens-of-truth'],
  'eq-fire-arrows': ['fire-arrows'],
  'eq-ice-arrows': ['ice-arrows'],

  // Empty Bottles (all 5 Switch 2 bottles satisfy 'bottle')
  'bottle-01': ['bottle'],
  'bottle-02': ['bottle'],
  'bottle-03': ['bottle'],
  'bottle-04': ['bottle'],
  'bottle-05': ['bottle'],

  // Death Mountain Summit Great Fairy #1 grants Magic Meter & Din's Fire in Switch 2
  'gf-01': ['magic-meter', 'dins-fire'],

  // House of Skulltula Rewards
  'skr-10': ['adults-wallet'],
  'skr-20': ['echo-gem'],
  'skr-30': ['giants-wallet'],

  // Ocarina Songs
  'song-lullaby': ['song-lullaby'],
  'song-epona': ['song-epona'],
  'song-saria': ['song-saria'],
  'song-sun': ['song-sun'],
  'song-time': ['song-time'],
  'song-storms': ['song-storms'],
  'song-minuet': ['song-minuet'],
  'song-bolero': ['song-bolero'],
  'song-serenade': ['song-serenade'],
  'song-requiem': ['song-requiem'],
  'song-nocturne': ['song-nocturne'],
  'song-prelude': ['song-prelude'],
  'song-scarecrow': ['song-scarecrow'],

  // Happy Mask Quest unlocks
  'mask-step-2': ['skull-mask'],
  'mask-step-4': ['mask-of-truth'],
};

const SKULLTULA_TOKEN_MILESTONES: ReadonlyArray<{ threshold: number; reqId: string }> = [
  { threshold: 10, reqId: 'tokens-10' },
  { threshold: 20, reqId: 'tokens-20' },
  { threshold: 30, reqId: 'tokens-30' },
  { threshold: 40, reqId: 'tokens-40' },
  { threshold: 50, reqId: 'tokens-50' },
  { threshold: 100, reqId: 'tokens-100' },
];

/**
 * Priority weights for selecting the single most informative gear/item blocker
 * when multiple requirements are missing on a locked secret.
 */
const GEAR_PRIORITY_WEIGHT: Readonly<Record<string, number>> = {
  'golden-gauntlets': 100,
  'light-arrows': 98,
  'ice-arrows': 96,
  'mirror-shield': 95,
  'silver-gauntlets': 94,
  'hover-boots': 92,
  'fire-arrows': 90,
  'gerudo-card': 89,
  longshot: 88,
  'golden-scale': 87,
  'zora-thawed': 86,
  'zora-tunic': 84,
  'iron-boots': 83,
  'blue-fire': 82,
  'megaton-hammer': 80,
  'goron-tunic': 78,
  bow: 76,
  hookshot: 74,
  epona: 72,
  'lens-of-truth': 70,
  'mask-of-truth': 68,
  'skull-mask': 66,
  boomerang: 64,
  'silver-scale': 62,
  'magic-beans': 60,
  'dins-fire': 58,
  bombs: 56,
  'goron-bracelet': 54,
  slingshot: 52,
  'zeldas-letter': 48,
  'weird-egg': 46,
  ocarina: 44,
  'magic-meter': 42,
  bottle: 40,
  'deku-sticks': 38,
  'deku-shield': 36,
  'kokiri-sword': 34,
};

const COLLECTIBLE_TYPE_GROUPS: ReadonlyArray<{
  key: CollectibleTypeGroupKey;
  label: string;
  categories: SecretCategory[];
}> = [
  {
    key: 'heart-pieces',
    label: 'Pieces of Heart',
    categories: ['heart-piece'],
  },
  {
    key: 'gold-skulltulas',
    label: 'Gold Skulltulas',
    categories: ['gold-skulltula'],
  },
  {
    key: 'bottles-fairies',
    label: 'Bottles & Great Fairies',
    categories: ['bottle', 'great-fairy'],
  },
  {
    key: 'upgrades-gear',
    label: 'Upgrades & Gear',
    categories: ['capacity-upgrade', 'equipment', 'skulltula-reward'],
  },
  {
    key: 'songs-beans-quests',
    label: 'Songs, Beans & Side Quests',
    categories: [
      'ocarina-song',
      'magic-bean',
      'mask-trade',
      'biggoron-step',
      'cow-or-grotto',
      'big-poe',
      'switch2-exclusive',
    ],
  },
];

const BLOCKER_CATEGORY_ORDER: Readonly<Record<BlockerCategoryKind, number>> = {
  'cross-era': 0,
  song: 1,
  gear: 2,
  'wallet-milestone': 3,
  'time-bug': 4,
  other: 5,
};

export function createDefaultProgressState(): PlayerProgressState {
  const ownedRequirementIds: Record<string, boolean> = {};
  for (const id of DEFAULT_OWNED_REQUIREMENTS) {
    ownedRequirementIds[id] = true;
  }
  return {
    version: 1,
    completedSecretIds: {},
    ownedRequirementIds,
    activeEraFilter: 'all',
    switch2SpotlightOnly: false,
    loadoutModeEnabled: true,
    customScarecrowNotes: '',
    theme: 'dark',
  };
}

/**
 * Counts how many Gold Skulltulas (`gs-001`..`gs-100`) are marked completed.
 */
export function countCompletedSkulltulas(
  completedSecretIds: Readonly<Record<string, boolean>>,
): number {
  let count = 0;
  for (let i = 1; i <= 100; i += 1) {
    const id = `gs-${String(i).padStart(3, '0')}`;
    if (completedSecretIds[id]) {
      count += 1;
    }
  }
  return count;
}

/**
 * Derives the full active set of satisfied requirement IDs from:
 * 1. Explicitly owned requirements (`state.ownedRequirementIds`)
 * 2. Auto-counted Gold Skulltula token milestones (`tokens-10`..`tokens-100`)
 * 3. Checked equipment, bottles, songs, Great Fairy #1, Skulltula rewards, and masks
 * 4. Transitive upgrade hierarchies (Wallets, Hookshot/Longshot, Scales, Gauntlets)
 */
export function deriveEffectiveRequirements(state: PlayerProgressState): Set<string> {
  if (!state.loadoutModeEnabled) {
    return new Set(DEFAULT_OWNED_REQUIREMENTS);
  }

  const effective = new Set<string>();

  for (const [reqId, isOwned] of Object.entries(state.ownedRequirementIds)) {
    if (isOwned) {
      effective.add(reqId);
    }
  }

  // Auto-derive Gold Skulltula token milestones
  const gsCount = countCompletedSkulltulas(state.completedSecretIds);
  for (const milestone of SKULLTULA_TOKEN_MILESTONES) {
    if (gsCount >= milestone.threshold) {
      effective.add(milestone.reqId);
    }
  }

  // Sync checked collectible secrets -> owned requirements
  for (const [secretId, isCompleted] of Object.entries(state.completedSecretIds)) {
    if (!isCompleted) continue;
    const syncedReqs = SECRET_TO_REQUIREMENTS_MAP[secretId];
    if (syncedReqs) {
      for (const reqId of syncedReqs) {
        effective.add(reqId);
      }
    }
  }

  // Transitive item/upgrade hierarchies
  if (effective.has('giants-wallet')) {
    effective.add('adults-wallet');
    effective.add('rupees-100');
  } else if (effective.has('adults-wallet')) {
    effective.add('rupees-100');
  }

  if (effective.has('longshot')) {
    effective.add('hookshot');
  }

  if (effective.has('golden-scale')) {
    effective.add('silver-scale');
  }

  if (effective.has('golden-gauntlets')) {
    effective.add('silver-gauntlets');
    effective.add('goron-bracelet');
  } else if (effective.has('silver-gauntlets')) {
    effective.add('goron-bracelet');
  }

  return effective;
}

export function matchesEraFilter(secretEra: Era, eraFilter: EraFilter): boolean {
  if (eraFilter === 'all') return true;
  if (secretEra === 'both' || secretEra === 'cross-era') return true;
  return secretEra === eraFilter;
}

export function matchesSecretFilters(
  secret: UnifiedSecret,
  state: Pick<PlayerProgressState, 'activeEraFilter' | 'switch2SpotlightOnly'>,
): boolean {
  if (!matchesEraFilter(secret.era, state.activeEraFilter)) {
    return false;
  }
  if (state.switch2SpotlightOnly && secret.switch2Status === 'classic') {
    return false;
  }
  return true;
}

function resolvePrimaryBlocker(
  secret: UnifiedSecret,
  missingPrimaryIds: string[],
): {
  primaryBlockerId?: string;
  primaryBlockerGroupKey: string;
  primaryBlockerLabel: string;
  primaryBlockerCategory: BlockerCategoryKind;
} {
  if (missingPrimaryIds.length === 0) {
    return {
      primaryBlockerGroupKey: 'ready',
      primaryBlockerLabel: 'Ready Right Now',
      primaryBlockerCategory: 'other',
    };
  }

  const missingSet = new Set(missingPrimaryIds);

  // 1. Cross-Era Time-Travel Puzzles
  if (
    secret.gateTier === 'tier-4-cross-era' ||
    missingSet.has('time-travel') ||
    (missingSet.has('era-child') && missingSet.has('era-adult'))
  ) {
    const representativeId = missingSet.has('time-travel')
      ? 'time-travel'
      : missingPrimaryIds.find((id) => id !== 'era-child' && id !== 'rupees-100') ??
        missingPrimaryIds[0];
    return {
      primaryBlockerId: representativeId,
      primaryBlockerGroupKey: 'blocker:cross-era',
      primaryBlockerLabel: 'Cross-Era Time-Travel Puzzles',
      primaryBlockerCategory: 'cross-era',
    };
  }

  // 2. Specific Ocarina Song
  const missingSongs = missingPrimaryIds.filter(
    (id) => REQUIREMENT_BY_ID[id]?.category === 'song' || id.startsWith('song-'),
  );
  if (missingSongs.length > 0) {
    // Prefer warp/late songs over basic songs when multiple songs are missing
    const chosenSongId = missingSongs[missingSongs.length - 1];
    const reqName = REQUIREMENT_BY_ID[chosenSongId]?.name ?? chosenSongId;
    return {
      primaryBlockerId: chosenSongId,
      primaryBlockerGroupKey: `blocker:song:${chosenSongId}`,
      primaryBlockerLabel: `Needs ${reqName}`,
      primaryBlockerCategory: 'song',
    };
  }

  // 3. Specific Dungeon / Quest Gear & Story Unlocks
  // Exclude 'bottled-bug' (and 'bottle' when paired with 'bottled-bug') so soft-soil
  // bug Skulltulas group cleanly under 'Needs Bottled Bugs' in step 5.
  const isSoftSoilBugGate = missingSet.has('bottled-bug');
  const gearCandidates = missingPrimaryIds.filter((id) => {
    if (id === 'bottled-bug') return false;
    if (id === 'bottle' && isSoftSoilBugGate) return false;
    const cat = REQUIREMENT_BY_ID[id]?.category;
    return (
      cat === 'gear' ||
      cat === 'item' ||
      cat === 'quest' ||
      cat === 'upgrade' ||
      cat === 'story'
    );
  });

  if (gearCandidates.length > 0) {
    const sortedGear = [...gearCandidates].sort(
      (a, b) => (GEAR_PRIORITY_WEIGHT[b] ?? 50) - (GEAR_PRIORITY_WEIGHT[a] ?? 50),
    );
    const chosenGearId = sortedGear[0];
    const reqName = REQUIREMENT_BY_ID[chosenGearId]?.name ?? chosenGearId;
    return {
      primaryBlockerId: chosenGearId,
      primaryBlockerGroupKey: `blocker:gear:${chosenGearId}`,
      primaryBlockerLabel: `Needs ${reqName}`,
      primaryBlockerCategory: 'gear',
    };
  }

  // 4. Wallet Capacity or Gold Skulltula Token Milestone
  const walletOrMilestone = missingPrimaryIds.filter((id) => {
    const cat = REQUIREMENT_BY_ID[id]?.category;
    return cat === 'economy' || cat === 'milestone';
  });
  if (walletOrMilestone.length > 0) {
    const chosenWalletId =
      walletOrMilestone.find((id) => id !== 'rupees-100') ?? walletOrMilestone[0];
    const reqName = REQUIREMENT_BY_ID[chosenWalletId]?.name ?? chosenWalletId;
    return {
      primaryBlockerId: chosenWalletId,
      primaryBlockerGroupKey: `blocker:wallet:${chosenWalletId}`,
      primaryBlockerLabel: `Needs ${reqName}`,
      primaryBlockerCategory: 'wallet-milestone',
    };
  }

  // 5. Nighttime / Daytime / Bottled Bugs
  if (missingSet.has('bottled-bug')) {
    return {
      primaryBlockerId: 'bottled-bug',
      primaryBlockerGroupKey: 'blocker:time-bug:bottled-bug',
      primaryBlockerLabel: 'Needs Bottled Bugs',
      primaryBlockerCategory: 'time-bug',
    };
  }
  if (missingSet.has('time-night')) {
    return {
      primaryBlockerId: 'time-night',
      primaryBlockerGroupKey: 'blocker:time-bug:time-night',
      primaryBlockerLabel: 'Needs Nighttime',
      primaryBlockerCategory: 'time-bug',
    };
  }
  if (missingSet.has('time-day')) {
    return {
      primaryBlockerId: 'time-day',
      primaryBlockerGroupKey: 'blocker:time-bug:time-day',
      primaryBlockerLabel: 'Needs Daytime',
      primaryBlockerCategory: 'time-bug',
    };
  }

  // 6. Remaining gates (e.g. 'era-adult' or 'era-child' standalone)
  const fallbackId = missingPrimaryIds[0];
  const fallbackName = REQUIREMENT_BY_ID[fallbackId]?.name ?? fallbackId;
  return {
    primaryBlockerId: fallbackId,
    primaryBlockerGroupKey: `blocker:other:${fallbackId}`,
    primaryBlockerLabel: `Needs ${fallbackName}`,
    primaryBlockerCategory: 'other',
  };
}

/**
 * Evaluates a single `UnifiedSecret` against the player's current progression state.
 */
export function evaluateSecret(
  secret: UnifiedSecret,
  state: PlayerProgressState,
  effectiveReqs?: Set<string>,
): EvaluatedSecret {
  const activeReqs = effectiveReqs ?? deriveEffectiveRequirements(state);
  const missingPrimaryIds = secret.requiredIds.filter((reqId) => !activeReqs.has(reqId));
  const satisfiedAltMethods: AltMethod[] = secret.altMethods.filter((alt) =>
    alt.requiredIds.every((reqId) => activeReqs.has(reqId)),
  );

  if (state.completedSecretIds[secret.id]) {
    return {
      secret,
      status: 'completed',
      missingPrimaryIds,
      satisfiedAltMethods,
      readyAltMethod: satisfiedAltMethods[0],
      primaryBlockerGroupKey: 'completed',
      primaryBlockerLabel: 'Completed',
      primaryBlockerCategory: 'other',
    };
  }

  let status: AccessStatus;
  let readyAltMethod: AltMethod | undefined;

  if (missingPrimaryIds.length === 0) {
    status = 'available-now';
  } else if (satisfiedAltMethods.length > 0) {
    status = 'available-via-alt';
    readyAltMethod = satisfiedAltMethods[0];
  } else {
    status = 'locked';
  }

  if (status !== 'locked') {
    return {
      secret,
      status,
      missingPrimaryIds,
      satisfiedAltMethods,
      readyAltMethod,
      primaryBlockerGroupKey: 'ready',
      primaryBlockerLabel:
        status === 'available-via-alt' ? 'Ready via Early Trick' : 'Ready Right Now',
      primaryBlockerCategory: 'other',
    };
  }

  const blocker = resolvePrimaryBlocker(secret, missingPrimaryIds);
  return {
    secret,
    status,
    missingPrimaryIds,
    satisfiedAltMethods,
    primaryBlockerId: blocker.primaryBlockerId,
    primaryBlockerGroupKey: blocker.primaryBlockerGroupKey,
    primaryBlockerLabel: blocker.primaryBlockerLabel,
    primaryBlockerCategory: blocker.primaryBlockerCategory,
  };
}

/**
 * Evaluates and groups all secrets inside a region for the Region Dossier drawer.
 * Supports all 3 `DrawerGroupMode`s: `'blocker'` (default), `'tier'`, and `'type'`.
 */
export function categorizeRegionSecrets(
  regionId: string,
  state: PlayerProgressState,
  mode: DrawerGroupMode = 'blocker',
  options?: { respectFilters?: boolean; effectiveReqs?: Set<string> },
): CategorizedRegionSecrets {
  const respectFilters = options?.respectFilters ?? true;
  const effectiveReqs = options?.effectiveReqs ?? deriveEffectiveRequirements(state);

  const rawRegionSecrets = SECRETS_BY_REGION[regionId] ?? [];
  const filteredSecrets = respectFilters
    ? rawRegionSecrets.filter((sec) => matchesSecretFilters(sec, state))
    : rawRegionSecrets;

  const allEvaluated = filteredSecrets.map((sec) => evaluateSecret(sec, state, effectiveReqs));

  const readyNow: EvaluatedSecret[] = [];
  const completed: EvaluatedSecret[] = [];
  const bucketMap = new Map<string, RequirementBlockerBucket>();

  for (const item of allEvaluated) {
    if (item.status === 'completed') {
      completed.push(item);
      continue;
    }

    if (item.status === 'available-now' || item.status === 'available-via-alt') {
      readyNow.push(item);
      continue;
    }

    const existing = bucketMap.get(item.primaryBlockerGroupKey);
    if (existing) {
      existing.items.push(item);
    } else {
      bucketMap.set(item.primaryBlockerGroupKey, {
        key: item.primaryBlockerGroupKey,
        label: item.primaryBlockerLabel,
        category: item.primaryBlockerCategory,
        blockerRequirementId: item.primaryBlockerId,
        items: [item],
      });
    }
  }

  // Keep 'available-now' first, then 'available-via-alt' inside readyNow
  readyNow.sort((a, b) => {
    if (a.status === b.status) return 0;
    return a.status === 'available-now' ? -1 : 1;
  });

  const lockedBuckets = [...bucketMap.values()].sort((a, b) => {
    const catDiff = BLOCKER_CATEGORY_ORDER[a.category] - BLOCKER_CATEGORY_ORDER[b.category];
    if (catDiff !== 0) return catDiff;
    return a.label.localeCompare(b.label);
  });

  // Build canonical Tier buckets (Tiers 0-5)
  const tierGroups: TierSecretBucket[] = METADATA.gateTiers.map((tier) => {
    const allItems = allEvaluated.filter((ev) => ev.secret.gateTier === tier.id);
    const items = allItems.filter((ev) => ev.status !== 'completed');
    return {
      key: tier.id,
      tier,
      label: tier.label,
      items,
      allItems,
    };
  });

  // Build Collectible Type buckets (5 groups)
  const typeGroups: TypeSecretBucket[] = COLLECTIBLE_TYPE_GROUPS.map((group) => {
    const catSet = new Set<SecretCategory>(group.categories);
    const allItems = allEvaluated.filter((ev) => catSet.has(ev.secret.category));
    const items = allItems.filter((ev) => ev.status !== 'completed');
    return {
      key: group.key,
      label: group.label,
      categories: group.categories,
      items,
      allItems,
    };
  });

  return {
    regionId,
    mode,
    readyNow,
    lockedBuckets,
    completed,
    tierGroups,
    typeGroups,
    allEvaluated,
  };
}

/**
 * Computes completion & accessibility summary metrics for a single region or dungeon.
 */
export function computeRegionSummary(
  regionId: string,
  state: PlayerProgressState,
  effectiveReqs?: Set<string>,
): RegionProgressSummary {
  const activeReqs = effectiveReqs ?? deriveEffectiveRequirements(state);
  const allRegionSecrets = SECRETS_BY_REGION[regionId] ?? [];
  const visibleSecrets = allRegionSecrets.filter((sec) => matchesSecretFilters(sec, state));

  let completedCount = 0;
  let readyNowCount = 0;
  let availableViaAltCount = 0;
  let lockedCount = 0;

  for (const sec of visibleSecrets) {
    const ev = evaluateSecret(sec, state, activeReqs);
    if (ev.status === 'completed') {
      completedCount += 1;
    } else if (ev.status === 'available-now') {
      readyNowCount += 1;
    } else if (ev.status === 'available-via-alt') {
      readyNowCount += 1;
      availableViaAltCount += 1;
    } else {
      lockedCount += 1;
    }
  }

  // Canonical Switch 2 in-game map counters always reflect the region's full HPs & Skulltulas
  let heartPiecesCompleted = 0;
  let heartPiecesTotal = 0;
  let skulltulasChildCompleted = 0;
  let skulltulasChildTotal = 0;
  let skulltulasAdultCompleted = 0;
  let skulltulasAdultTotal = 0;
  let switch2ItemCount = 0;

  for (const sec of allRegionSecrets) {
    const isDone = Boolean(state.completedSecretIds[sec.id]);
    if (sec.switch2Status !== 'classic') {
      switch2ItemCount += 1;
    }
    if (sec.category === 'heart-piece') {
      heartPiecesTotal += 1;
      if (isDone) heartPiecesCompleted += 1;
    } else if (sec.category === 'gold-skulltula') {
      if (sec.era === 'child') {
        skulltulasChildTotal += 1;
        if (isDone) skulltulasChildCompleted += 1;
      } else {
        skulltulasAdultTotal += 1;
        if (isDone) skulltulasAdultCompleted += 1;
      }
    }
  }

  const skulltulasCompleted = skulltulasChildCompleted + skulltulasAdultCompleted;
  const skulltulasTotal = skulltulasChildTotal + skulltulasAdultTotal;
  const totalCount = visibleSecrets.length;
  const percent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  const isComplete = totalCount > 0 && completedCount === totalCount;

  return {
    regionId,
    completedCount,
    totalCount,
    readyNowCount,
    availableViaAltCount,
    lockedCount,
    percent,
    isComplete,
    heartPiecesCompleted,
    heartPiecesTotal,
    skulltulasChildCompleted,
    skulltulasChildTotal,
    skulltulasAdultCompleted,
    skulltulasAdultTotal,
    skulltulasCompleted,
    skulltulasTotal,
    switch2ItemCount,
  };
}

/**
 * Computes `RegionProgressSummary` across all 34 regions in one pass.
 */
export function computeAllRegionSummaries(
  state: PlayerProgressState,
): Record<string, RegionProgressSummary> {
  const effectiveReqs = deriveEffectiveRequirements(state);
  const result: Record<string, RegionProgressSummary> = {};
  for (const reg of REGIONS) {
    result[reg.id] = computeRegionSummary(reg.id, state, effectiveReqs);
  }
  return result;
}

/**
 * Computes global 100% completion and collectible category counters across Hyrule.
 */
export function computeGlobalProgress(state: PlayerProgressState): GlobalProgressSummary {
  const effectiveReqs = deriveEffectiveRequirements(state);

  let completedCount = 0;
  let totalCount = 0;
  let allCompletedCount = 0;
  const allTotalCount = ALL_SECRETS.length;

  let readyNowTotal = 0;
  let availableViaAltTotal = 0;
  let lockedTotal = 0;

  let heartPiecesCompleted = 0;
  let heartPiecesTotal = 0;
  let skulltulasChildCompleted = 0;
  let skulltulasChildTotal = 0;
  let skulltulasAdultCompleted = 0;
  let skulltulasAdultTotal = 0;
  let bottlesCompleted = 0;
  let bottlesTotal = 0;
  let greatFairiesCompleted = 0;
  let greatFairiesTotal = 0;
  let songsCompleted = 0;
  let songsTotal = 0;
  let magicBeansCompleted = 0;
  let magicBeansTotal = 0;

  for (const sec of ALL_SECRETS) {
    const ev = evaluateSecret(sec, state, effectiveReqs);
    const isDone = ev.status === 'completed';

    if (isDone) {
      allCompletedCount += 1;
    }
    if (sec.countsToward100Percent) {
      totalCount += 1;
      if (isDone) {
        completedCount += 1;
      }
    }

    if (ev.status === 'available-now') {
      readyNowTotal += 1;
    } else if (ev.status === 'available-via-alt') {
      readyNowTotal += 1;
      availableViaAltTotal += 1;
    } else if (ev.status === 'locked') {
      lockedTotal += 1;
    }

    switch (sec.category) {
      case 'heart-piece':
        heartPiecesTotal += 1;
        if (isDone) heartPiecesCompleted += 1;
        break;
      case 'gold-skulltula':
        if (sec.era === 'child') {
          skulltulasChildTotal += 1;
          if (isDone) skulltulasChildCompleted += 1;
        } else {
          skulltulasAdultTotal += 1;
          if (isDone) skulltulasAdultCompleted += 1;
        }
        break;
      case 'bottle':
        bottlesTotal += 1;
        if (isDone) bottlesCompleted += 1;
        break;
      case 'great-fairy':
        greatFairiesTotal += 1;
        if (isDone) greatFairiesCompleted += 1;
        break;
      case 'ocarina-song':
        songsTotal += 1;
        if (isDone) songsCompleted += 1;
        break;
      case 'magic-bean':
        magicBeansTotal += 1;
        if (isDone) magicBeansCompleted += 1;
        break;
      default:
        break;
    }
  }

  let completedRegionsCount = 0;
  let populatedRegionsCount = 0;
  for (const reg of REGIONS) {
    const regSecrets = SECRETS_BY_REGION[reg.id] ?? [];
    if (regSecrets.length === 0) continue;
    populatedRegionsCount += 1;
    if (regSecrets.every((s) => Boolean(state.completedSecretIds[s.id]))) {
      completedRegionsCount += 1;
    }
  }

  const skulltulasCompleted = skulltulasChildCompleted + skulltulasAdultCompleted;
  const skulltulasTotal = skulltulasChildTotal + skulltulasAdultTotal;
  const percent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  const isComplete = totalCount > 0 && completedCount === totalCount;

  return {
    completedCount,
    totalCount,
    allCompletedCount,
    allTotalCount,
    percent,
    isComplete,
    readyNowTotal,
    availableViaAltTotal,
    lockedTotal,
    heartPiecesCompleted,
    heartPiecesTotal,
    skulltulasCompleted,
    skulltulasTotal,
    skulltulasChildCompleted,
    skulltulasChildTotal,
    skulltulasAdultCompleted,
    skulltulasAdultTotal,
    bottlesCompleted,
    bottlesTotal,
    greatFairiesCompleted,
    greatFairiesTotal,
    songsCompleted,
    songsTotal,
    magicBeansCompleted,
    magicBeansTotal,
    completedRegionsCount,
    totalRegionsCount: populatedRegionsCount,
  };
}

/**
 * Computes which previously locked secrets across Hyrule became newly accessible
 * (`available-now` or `available-via-alt`) between `prevState` and `nextState`.
 */
export function computeUnlockDelta(
  prevState: PlayerProgressState,
  nextState: PlayerProgressState,
  triggerLabel?: string,
): UnlockDelta {
  const prevEffective = deriveEffectiveRequirements(prevState);
  const nextEffective = deriveEffectiveRequirements(nextState);

  const newlyUnlocked: EvaluatedSecret[] = [];
  const byRegion: Record<string, EvaluatedSecret[]> = {};

  for (const sec of ALL_SECRETS) {
    if (nextState.completedSecretIds[sec.id]) {
      continue;
    }
    const prevEval = evaluateSecret(sec, prevState, prevEffective);
    if (prevEval.status !== 'locked') {
      continue;
    }

    const nextEval = evaluateSecret(sec, nextState, nextEffective);
    if (nextEval.status === 'available-now' || nextEval.status === 'available-via-alt') {
      newlyUnlocked.push(nextEval);
      if (!byRegion[sec.regionId]) {
        byRegion[sec.regionId] = [];
      }
      byRegion[sec.regionId].push(nextEval);
    }
  }

  return {
    newlyUnlocked,
    byRegion,
    totalUnlocked: newlyUnlocked.length,
    triggerLabel,
  };
}

// ============================================================================
// Pure State Transition Helpers
// ============================================================================

export function toggleSecretCompleted(
  state: PlayerProgressState,
  secretId: string,
  completed?: boolean,
): PlayerProgressState {
  const nextValue = completed ?? !state.completedSecretIds[secretId];
  const nextCompleted = { ...state.completedSecretIds };

  if (nextValue) {
    nextCompleted[secretId] = true;
  } else {
    delete nextCompleted[secretId];
  }

  // Keep cross-listed 50-token Heart Piece (`hp-10` <-> `skr-50`) in sync automatically!
  if (secretId === 'hp-10') {
    if (nextValue) nextCompleted['skr-50'] = true;
    else delete nextCompleted['skr-50'];
  } else if (secretId === 'skr-50') {
    if (nextValue) nextCompleted['hp-10'] = true;
    else delete nextCompleted['hp-10'];
  }

  const nextOwned = { ...state.ownedRequirementIds };
  const syncedReqs = SECRET_TO_REQUIREMENTS_MAP[secretId];
  if (syncedReqs && nextValue) {
    for (const reqId of syncedReqs) {
      nextOwned[reqId] = true;
    }
  }

  return {
    ...state,
    completedSecretIds: nextCompleted,
    ownedRequirementIds: nextOwned,
  };
}

export function toggleRequirementOwned(
  state: PlayerProgressState,
  requirementId: string,
  owned?: boolean,
): PlayerProgressState {
  const nextValue = owned ?? !state.ownedRequirementIds[requirementId];
  const nextOwned = { ...state.ownedRequirementIds };
  if (nextValue) {
    nextOwned[requirementId] = true;
  } else {
    delete nextOwned[requirementId];
  }
  return {
    ...state,
    ownedRequirementIds: nextOwned,
  };
}

export function applyStoryPreset(
  state: PlayerProgressState,
  presetId: string,
): PlayerProgressState {
  const preset = STORY_PRESETS.find((p) => p.id === presetId);
  if (!preset) {
    return state;
  }
  const ownedRequirementIds: Record<string, boolean> = {};
  for (const reqId of preset.ownedRequirementIds) {
    ownedRequirementIds[reqId] = true;
  }
  return {
    ...state,
    activeEraFilter: preset.eraFilter,
    loadoutModeEnabled: true,
    ownedRequirementIds,
  };
}
