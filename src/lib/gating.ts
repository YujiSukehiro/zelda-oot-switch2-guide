import {
  ALL_ROUTE_STEPS,
  ALL_SECRETS,
  METADATA,
  REGIONS,
  REQUIREMENTS,
  REQUIREMENT_BY_ID,
  ROUTE_STEP_BY_ID,
  SECRETS_BY_REGION,
  SECRET_BY_ID,
  STEP_TO_CHAPTER_ID,
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
  RegionReachabilityResult,
  RequirementBlockerBucket,
  SecretCategory,
  StoryPresetApplyOptions,
  TierSecretBucket,
  TypeSecretBucket,
  UnifiedSecret,
  UnlockDelta,
  VisitStage,
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
  // Core Progression & Dungeon Equipment
  'eq-kokiri-sword': ['kokiri-sword'],
  'eq-deku-shield': ['deku-shield'],
  'eq-ocarina': ['ocarina'],
  'eq-slingshot': ['slingshot'],
  'eq-goron-bracelet': ['goron-bracelet'],
  'eq-bomb-bag': ['bombs'],
  'eq-boomerang': ['boomerang'],
  'eq-silver-scale': ['silver-scale'],
  'eq-golden-scale': ['golden-scale'],
  'eq-goron-tunic': ['goron-tunic'],
  'eq-zora-tunic': ['zora-tunic'],
  'eq-epona': ['epona'],
  'eq-hookshot': ['hookshot'],
  'eq-bow': ['bow'],
  'eq-megaton-hammer': ['megaton-hammer'],
  'eq-iron-boots': ['iron-boots'],
  'eq-longshot': ['longshot'],
  'eq-hover-boots': ['hover-boots'],
  'eq-gerudo-card': ['gerudo-card'],
  'eq-lens-of-truth': ['lens-of-truth'],
  'eq-silver-gauntlets': ['silver-gauntlets'],
  'eq-mirror-shield': ['mirror-shield'],
  'eq-fire-arrows': ['fire-arrows'],
  'eq-ice-arrows': ['ice-arrows'],
  'eq-light-arrows': ['light-arrows'],
  'eq-golden-gauntlets': ['golden-gauntlets'],

  // Spiritual Stones & Story-Unlocking Sage Medallions
  'stone-emerald': ['stone-emerald'],
  'stone-ruby': ['stone-ruby'],
  'stone-sapphire': ['stone-sapphire'],
  'medallion-light': ['era-adult'],
  'medallion-forest': ['time-travel'],
  'medallion-water': ['zora-thawed'],

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
 * Environmental / consumable cues surfaced as soft badges on cards rather than
 * hard progression locks (`time-night`, `time-day`, `deku-sticks`, and—once any
 * Empty Bottle is owned—`bottled-bug` and `blue-fire`).
 */
const ENVIRONMENTAL_CONDITION_LABELS: Readonly<Record<string, string>> = {
  'time-night': 'Night Only',
  'time-day': 'Daytime Only',
  'bottled-bug': 'Bring Bottled Bugs',
  'blue-fire': 'Bring Blue Fire',
  'deku-sticks': 'Deku Sticks',
};

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
  'stone-sapphire': 65,
  boomerang: 64,
  'silver-scale': 62,
  'magic-beans': 60,
  'dins-fire': 58,
  'stone-ruby': 57,
  bombs: 56,
  'goron-bracelet': 54,
  slingshot: 52,
  'stone-emerald': 50,
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

/**
 * Maps each `STORY_PRESETS` ID to the inclusive Optimal Route step cutoff completed
 * prior to reaching that checkpoint when `markPriorSecretsAndSteps: true` is used.
 */
const PRESET_CATCHUP_CUTOFF_STEP: Readonly<Record<string, string | null>> = {
  'fresh-start': null,
  'goron-city-visit-1': 'ch-03-step-06',
  'post-dodongo': 'ch-05-step-01',
  'three-stones': 'ch-07-step-10',
  'fresh-adult-hookshot': 'ch-08-step-05',
  'post-forest-temple': 'ch-10-step-10',
  'post-water-temple': 'ch-13-step-01',
  endgame: 'ch-17-step-02',
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
 * Derives the player's actual owned progression requirements for Pause Subscreens
 * (`InventoryModal`, `OcarinaModal`) without applying the Checklist Mode unlock-all
 * override and without auto-injecting unowned environmental cues (`deku-sticks`,
 * `bottled-bug`, `blue-fire`, `time-night`, `time-day`).
 */
export function deriveOwnedInventoryRequirements(state: PlayerProgressState): Set<string> {
  const owned = new Set<string>();

  for (const [reqId, isOwned] of Object.entries(state.ownedRequirementIds)) {
    if (isOwned) {
      owned.add(reqId);
    }
  }

  // Sync completed Optimal Route steps -> unlocked requirements
  if (state.completedRouteStepIds) {
    for (const [stepId, isCompleted] of Object.entries(state.completedRouteStepIds)) {
      if (!isCompleted) continue;
      const step = ROUTE_STEP_BY_ID[stepId];
      if (step?.unlocksRequirementIds) {
        for (const reqId of step.unlocksRequirementIds) {
          owned.add(reqId);
        }
      }
    }
  }

  // Auto-derive Gold Skulltula token milestones
  const gsCount = countCompletedSkulltulas(state.completedSecretIds);
  for (const milestone of SKULLTULA_TOKEN_MILESTONES) {
    if (gsCount >= milestone.threshold) {
      owned.add(milestone.reqId);
    }
  }

  // Sync checked collectible secrets -> owned requirements
  for (const [secretId, isCompleted] of Object.entries(state.completedSecretIds)) {
    if (!isCompleted) continue;
    const syncedReqs = SECRET_TO_REQUIREMENTS_MAP[secretId];
    if (syncedReqs) {
      for (const reqId of syncedReqs) {
        owned.add(reqId);
      }
    }
  }

  // Transitive item/upgrade hierarchies
  if (owned.has('giants-wallet')) {
    owned.add('adults-wallet');
    owned.add('rupees-100');
  } else if (owned.has('adults-wallet')) {
    owned.add('rupees-100');
  }

  if (owned.has('longshot')) {
    owned.add('hookshot');
  }

  if (owned.has('golden-scale')) {
    owned.add('silver-scale');
  }

  if (owned.has('golden-gauntlets')) {
    owned.add('silver-gauntlets');
    owned.add('goron-bracelet');
  } else if (owned.has('silver-gauntlets')) {
    owned.add('goron-bracelet');
  }

  return owned;
}

/**
 * Derives the full active set of satisfied requirement IDs from:
 * 1. Checklist Mode override (`!state.loadoutModeEnabled` -> unlocks all requirements)
 * 2. Explicitly owned requirements (`state.ownedRequirementIds`)
 * 3. Completed Optimal Route steps' `unlocksRequirementIds` (`state.completedRouteStepIds`)
 * 4. Auto-counted Gold Skulltula token milestones (`tokens-10`..`tokens-100`)
 * 5. Checked equipment, stones, medallions, bottles, songs, Great Fairy #1, Skulltula rewards, and masks
 * 6. Transitive upgrade hierarchies (Wallets, Hookshot/Longshot, Scales, Gauntlets)
 * 7. Environmental / renewable cues (`time-night`, `time-day`, `deku-sticks`, plus `bottled-bug` & `blue-fire` once `bottle` is owned)
 */
export function deriveEffectiveRequirements(state: PlayerProgressState): Set<string> {
  if (!state.loadoutModeEnabled) {
    return new Set([
      ...REQUIREMENTS.map((r) => r.id),
      'stone-emerald',
      'stone-ruby',
      'stone-sapphire',
    ]);
  }

  const effective = deriveOwnedInventoryRequirements(state);

  // Environmental & renewable conditions are surfaced as soft badges on cards
  // rather than hard progression locks.
  effective.add('time-night');
  effective.add('time-day');
  effective.add('deku-sticks');
  if (effective.has('bottle')) {
    effective.add('bottled-bug');
    effective.add('blue-fire');
  }

  return effective;
}

/**
 * Evaluates canonical Ocarina of Time world-graph reachability for any of the
 * 34 overworld provinces, dungeons, mini-dungeons, or Switch 2 dream hubs.
 */
export function evaluateRegionReachability(
  regionId: string,
  effectiveReqs: ReadonlySet<string>,
): RegionReachabilityResult {
  const has = (reqId: string) => effectiveReqs.has(reqId);

  switch (regionId) {
    case 'kokiri-forest':
    case 'lost-woods':
    case 'sacred-forest-meadow': {
      if (has('era-child') || has('era-adult')) {
        return { isReachable: true };
      }
      return {
        isReachable: false,
        blockerLabel: 'Begin your adventure in Kokiri Forest',
        blockerReqId: 'era-child',
      };
    }

    case 'deku-tree': {
      if (!has('era-child')) {
        return {
          isReachable: false,
          blockerLabel: 'Return to Child Era via Prelude of Light to enter Inside the Great Deku Tree',
          blockerReqId: 'era-child',
        };
      }
      if (!has('kokiri-sword') || !has('deku-shield')) {
        return {
          isReachable: false,
          blockerLabel: 'Equip Kokiri Sword & Deku Shield to pass Mido',
          blockerReqId: !has('kokiri-sword') ? 'kokiri-sword' : 'deku-shield',
        };
      }
      return { isReachable: true };
    }

    case 'hyrule-field':
    case 'lon-lon-ranch':
    case 'market':
    case 'kakariko-village':
    case 'graveyard':
    case 'lake-hylia':
    case 'zoras-river':
    case 'gerudo-valley': {
      if (has('stone-emerald') || has('era-adult')) {
        return { isReachable: true };
      }
      return {
        isReachable: false,
        blockerLabel: 'Clear Inside the Great Deku Tree to leave Kokiri Forest',
        blockerReqId: 'stone-emerald',
      };
    }

    case 'hyrule-castle': {
      const hf = evaluateRegionReachability('hyrule-field', effectiveReqs);
      if (!hf.isReachable) return hf;
      if (!has('era-child')) {
        return {
          isReachable: false,
          blockerLabel: 'Return to Child Era via Pedestal of Time to visit Hyrule Castle Grounds',
          blockerReqId: 'era-child',
        };
      }
      return { isReachable: true };
    }

    case 'outside-ganons-castle': {
      const hf = evaluateRegionReachability('hyrule-field', effectiveReqs);
      if (!hf.isReachable) return hf;
      if (!has('era-adult')) {
        return {
          isReachable: false,
          blockerLabel: "Advance to the Adult Era to reach Outside Ganon's Castle",
          blockerReqId: 'era-adult',
        };
      }
      return { isReachable: true };
    }

    case 'death-mountain-trail':
    case 'goron-city': {
      const hf = evaluateRegionReachability('hyrule-field', effectiveReqs);
      if (!hf.isReachable) return hf;
      if (has('zeldas-letter') || has('bombs') || has('era-adult')) {
        return { isReachable: true };
      }
      return {
        isReachable: false,
        blockerLabel: "Show Zelda's Letter to the Kakariko Gate Guard",
        blockerReqId: 'zeldas-letter',
      };
    }

    case 'dodongos-cavern': {
      const dmt = evaluateRegionReachability('death-mountain-trail', effectiveReqs);
      if (!dmt.isReachable) return dmt;
      if (has('goron-bracelet') || has('bombs') || has('era-adult')) {
        return { isReachable: true };
      }
      return {
        isReachable: false,
        blockerLabel: "Obtain Goron's Bracelet from Darunia in Goron City",
        blockerReqId: 'goron-bracelet',
      };
    }

    case 'death-mountain-crater': {
      if (has('song-bolero') && (has('era-child') || has('era-adult'))) {
        const hf = evaluateRegionReachability('hyrule-field', effectiveReqs);
        if (hf.isReachable) return { isReachable: true };
      }
      const dmt = evaluateRegionReachability('death-mountain-trail', effectiveReqs);
      if (!dmt.isReachable) return dmt;
      if (has('bombs') || has('goron-bracelet') || has('era-adult') || has('song-bolero')) {
        return { isReachable: true };
      }
      return {
        isReachable: false,
        blockerLabel: "Obtain Bombs or Goron's Bracelet to reach Death Mountain Crater",
        blockerReqId: 'bombs',
      };
    }

    case 'zoras-domain': {
      const hf = evaluateRegionReachability('hyrule-field', effectiveReqs);
      if (!hf.isReachable) return hf;
      if (has('song-lullaby') || has('silver-scale')) {
        return { isReachable: true };
      }
      return {
        isReachable: false,
        blockerLabel: "Play Zelda's Lullaby at Zora's River Waterfall",
        blockerReqId: 'song-lullaby',
      };
    }

    case 'zoras-fountain': {
      const zd = evaluateRegionReachability('zoras-domain', effectiveReqs);
      if (!zd.isReachable) return zd;
      if (has('bottle') || has('era-adult')) {
        return { isReachable: true };
      }
      return {
        isReachable: false,
        blockerLabel: "Find Ruto's Letter in Lake Hylia & show King Zora",
        blockerReqId: 'bottle',
      };
    }

    case 'jabu-jabus-belly': {
      const zf = evaluateRegionReachability('zoras-fountain', effectiveReqs);
      if (!zf.isReachable) return zf;
      if (!has('era-child')) {
        return {
          isReachable: false,
          blockerLabel: "Return to Child Era to enter Inside Jabu-Jabu's Belly",
          blockerReqId: 'era-child',
        };
      }
      if (!has('bottle')) {
        return {
          isReachable: false,
          blockerLabel: 'Offer a Bottled Fish in front of Lord Jabu-Jabu',
          blockerReqId: 'bottle',
        };
      }
      return { isReachable: true };
    }

    case 'bottom-of-the-well': {
      const kak = evaluateRegionReachability('kakariko-village', effectiveReqs);
      if (!kak.isReachable) return kak;
      if (!has('era-child')) {
        return {
          isReachable: false,
          blockerLabel: 'Return to Child Era via Pedestal of Time to enter Bottom of the Well',
          blockerReqId: 'era-child',
        };
      }
      if (!has('song-storms')) {
        return {
          isReachable: false,
          blockerLabel: 'Play Song of Storms in Kakariko Windmill as Child Link to drain the Well',
          blockerReqId: 'song-storms',
        };
      }
      return { isReachable: true };
    }

    case 'forest-temple': {
      if (!has('era-adult')) {
        return {
          isReachable: false,
          blockerLabel: 'Advance to the Adult Era to enter the Forest Temple',
          blockerReqId: 'era-adult',
        };
      }
      if (!has('hookshot')) {
        return {
          isReachable: false,
          blockerLabel: "Obtain the Hookshot in Dampe's Grave to grapple into the Forest Temple",
          blockerReqId: 'hookshot',
        };
      }
      return { isReachable: true };
    }

    case 'fire-temple': {
      if (!has('era-adult')) {
        return {
          isReachable: false,
          blockerLabel: 'Advance to the Adult Era to enter the Fire Temple',
          blockerReqId: 'era-adult',
        };
      }
      if (has('song-bolero') || has('hookshot') || has('bombs')) {
        return { isReachable: true };
      }
      return {
        isReachable: false,
        blockerLabel: 'Use Hookshot or Bolero of Fire to reach the Fire Temple',
        blockerReqId: 'hookshot',
      };
    }

    case 'ice-cavern': {
      if (!has('era-adult')) {
        return {
          isReachable: false,
          blockerLabel: 'Advance to the Adult Era to enter the Ice Cavern',
          blockerReqId: 'era-adult',
        };
      }
      const zf = evaluateRegionReachability('zoras-fountain', effectiveReqs);
      if (!zf.isReachable) return zf;
      return { isReachable: true };
    }

    case 'water-temple': {
      if (!has('era-adult')) {
        return {
          isReachable: false,
          blockerLabel: 'Advance to the Adult Era to enter the Water Temple',
          blockerReqId: 'era-adult',
        };
      }
      if (!has('iron-boots')) {
        return {
          isReachable: false,
          blockerLabel: 'Obtain the Iron Boots in Ice Cavern to sink to the Water Temple',
          blockerReqId: 'iron-boots',
        };
      }
      if (!has('hookshot')) {
        return {
          isReachable: false,
          blockerLabel: 'Obtain the Hookshot to open the submerged Water Temple gate',
          blockerReqId: 'hookshot',
        };
      }
      return { isReachable: true };
    }

    case 'shadow-temple': {
      if (!has('era-adult')) {
        return {
          isReachable: false,
          blockerLabel: 'Advance to the Adult Era to enter the Shadow Temple',
          blockerReqId: 'era-adult',
        };
      }
      if (!has('song-nocturne')) {
        return {
          isReachable: false,
          blockerLabel: 'Learn Nocturne of Shadow from Sheik in Kakariko Village',
          blockerReqId: 'song-nocturne',
        };
      }
      if (!has('dins-fire')) {
        return {
          isReachable: false,
          blockerLabel: "Cast Din's Fire on the Graveyard torches to unseal the Shadow Temple",
          blockerReqId: 'dins-fire',
        };
      }
      return { isReachable: true };
    }

    case 'gerudo-fortress': {
      if (!has('era-adult')) {
        return {
          isReachable: false,
          blockerLabel: "Advance to the Adult Era to cross into Gerudo's Fortress",
          blockerReqId: 'era-adult',
        };
      }
      if (has('epona') || has('longshot') || has('gerudo-card')) {
        return { isReachable: true };
      }
      return {
        isReachable: false,
        blockerLabel: "Rescue Epona or obtain the Longshot to cross Gerudo Valley's broken bridge",
        blockerReqId: 'epona',
      };
    }

    case 'gerudo-training-ground': {
      if (!has('era-adult')) {
        return {
          isReachable: false,
          blockerLabel: 'Advance to the Adult Era to enter Gerudo Training Ground',
          blockerReqId: 'era-adult',
        };
      }
      if (!has('gerudo-card')) {
        return {
          isReachable: false,
          blockerLabel: 'Rescue all 4 Carpenters for the Gerudo Membership Card',
          blockerReqId: 'gerudo-card',
        };
      }
      return { isReachable: true };
    }

    case 'haunted-wasteland': {
      if (!has('era-adult')) {
        return {
          isReachable: false,
          blockerLabel: 'Advance to the Adult Era to cross Haunted Wasteland',
          blockerReqId: 'era-adult',
        };
      }
      if (has('gerudo-card') || has('longshot') || has('hover-boots')) {
        return { isReachable: true };
      }
      return {
        isReachable: false,
        blockerLabel: 'Earn the Gerudo Membership Card to open the Haunted Wasteland gate',
        blockerReqId: 'gerudo-card',
      };
    }

    case 'desert-colossus':
    case 'spirit-temple': {
      if (has('song-requiem') && (has('stone-emerald') || has('era-adult'))) {
        return { isReachable: true };
      }
      const hw = evaluateRegionReachability('haunted-wasteland', effectiveReqs);
      if (!hw.isReachable) {
        if (!has('era-adult')) {
          return {
            isReachable: false,
            blockerLabel: 'Learn Requiem of Spirit or cross Haunted Wasteland as Adult Link',
            blockerReqId: 'song-requiem',
          };
        }
        return hw;
      }
      if (!has('lens-of-truth')) {
        return {
          isReachable: false,
          blockerLabel: 'Obtain the Lens of Truth to follow the Poe Guide across Haunted Wasteland',
          blockerReqId: 'lens-of-truth',
        };
      }
      return { isReachable: true };
    }

    case 'ganons-castle': {
      if (!has('era-adult')) {
        return {
          isReachable: false,
          blockerLabel: "Advance to the Adult Era to enter Inside Ganon's Castle",
          blockerReqId: 'era-adult',
        };
      }
      if (!has('light-arrows')) {
        return {
          isReachable: false,
          blockerLabel: "Receive the Light Arrows in the Temple of Time to enter Inside Ganon's Castle",
          blockerReqId: 'light-arrows',
        };
      }
      return { isReachable: true };
    }

    case 'hall-of-fallen-foes': {
      if (has('song-prelude')) {
        return { isReachable: true };
      }
      return {
        isReachable: false,
        blockerLabel: 'Learn Prelude of Light after Forest Temple to unlock Hall of Fallen Foes',
        blockerReqId: 'song-prelude',
      };
    }

    default:
      return { isReachable: true };
  }
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

function extractEnvironmentalConditions(secret: UnifiedSecret): string[] {
  const conditions: string[] = [];
  const seen = new Set<string>();
  for (const reqId of secret.requiredIds) {
    const label = ENVIRONMENTAL_CONDITION_LABELS[reqId];
    if (label && !seen.has(label)) {
      seen.add(label);
      conditions.push(label);
    }
  }
  return conditions;
}

function computeMissingRequirementIds(
  requiredIds: readonly string[],
  activeReqs: ReadonlySet<string>,
): string[] {
  const missing: string[] = [];
  const seen = new Set<string>();

  for (const reqId of requiredIds) {
    // Always-available environmental conditions never block progression
    if (reqId === 'time-night' || reqId === 'time-day' || reqId === 'deku-sticks') {
      continue;
    }
    // Bottled Bugs & Blue Fire only require owning any Empty Bottle for gating
    if (reqId === 'bottled-bug' || reqId === 'blue-fire') {
      if (!activeReqs.has('bottle') && !seen.has('bottle')) {
        seen.add('bottle');
        missing.push('bottle');
      }
      continue;
    }
    if (!activeReqs.has(reqId) && !seen.has(reqId)) {
      seen.add(reqId);
      missing.push(reqId);
    }
  }

  return missing;
}

function resolveRegionBlockerCategory(blockerReqId?: string): BlockerCategoryKind {
  if (!blockerReqId) return 'other';
  if (blockerReqId === 'time-travel') return 'cross-era';
  if (blockerReqId.startsWith('song-') || REQUIREMENT_BY_ID[blockerReqId]?.category === 'song') {
    return 'song';
  }
  const cat = REQUIREMENT_BY_ID[blockerReqId]?.category;
  if (
    cat === 'gear' ||
    cat === 'item' ||
    cat === 'quest' ||
    cat === 'upgrade' ||
    cat === 'story'
  ) {
    return 'gear';
  }
  if (cat === 'economy' || cat === 'milestone') {
    return 'wallet-milestone';
  }
  return 'other';
}

function computeVisitStage(
  secret: UnifiedSecret,
  status: AccessStatus,
  missingPrimaryIds: readonly string[],
  activeReqs: ReadonlySet<string>,
  activeEraFilter: EraFilter,
  reachBlockerReqId?: string,
): VisitStage {
  if (status === 'completed') {
    return 'completed';
  }
  if (status === 'available-now' || status === 'available-via-alt') {
    return 'do-now';
  }

  const missingSet = new Set(missingPrimaryIds);
  if (reachBlockerReqId === 'era-adult' || reachBlockerReqId === 'era-child') {
    return 'later-era';
  }
  if (
    (secret.era === 'adult' && !activeReqs.has('era-adult')) ||
    (secret.era === 'child' && !activeReqs.has('era-child')) ||
    missingSet.has('era-adult') ||
    missingSet.has('era-child') ||
    missingSet.has('time-travel') ||
    (secret.era === 'cross-era' && !activeReqs.has('time-travel')) ||
    (activeEraFilter === 'child' && secret.era === 'adult') ||
    (activeEraFilter === 'adult' && secret.era === 'child')
  ) {
    return 'later-era';
  }

  return 'later-gear';
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
  const gearCandidates = missingPrimaryIds.filter((id) => {
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

  // 5. Remaining gates (e.g. 'era-adult' or 'era-child' standalone)
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
 * Evaluates a single `UnifiedSecret` against the player's current progression state
 * and world-reachability graph.
 */
export function evaluateSecret(
  secret: UnifiedSecret,
  state: PlayerProgressState,
  effectiveReqs?: Set<string>,
): EvaluatedSecret {
  const activeReqs = effectiveReqs ?? deriveEffectiveRequirements(state);
  const environmentalConditions = extractEnvironmentalConditions(secret);
  const missingPrimaryIds = computeMissingRequirementIds(secret.requiredIds, activeReqs);
  const satisfiedAltMethods: AltMethod[] = secret.altMethods.filter(
    (alt) => computeMissingRequirementIds(alt.requiredIds, activeReqs).length === 0,
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
      environmentalConditions,
      visitStage: 'completed',
    };
  }

  if (state.loadoutModeEnabled) {
    const reach = evaluateRegionReachability(secret.regionId, activeReqs);
    if (!reach.isReachable) {
      const regionBlockerLabel = reach.blockerLabel ?? 'Region Not Yet Reachable';
      const combinedMissing = [...missingPrimaryIds];
      if (
        reach.blockerReqId &&
        !activeReqs.has(reach.blockerReqId) &&
        !combinedMissing.includes(reach.blockerReqId)
      ) {
        combinedMissing.unshift(reach.blockerReqId);
      }

      return {
        secret,
        status: 'locked',
        missingPrimaryIds: combinedMissing,
        satisfiedAltMethods: [],
        primaryBlockerId: reach.blockerReqId,
        primaryBlockerGroupKey: `blocker:region:${reach.blockerReqId ?? secret.regionId}`,
        primaryBlockerLabel: regionBlockerLabel,
        primaryBlockerCategory: resolveRegionBlockerCategory(reach.blockerReqId),
        environmentalConditions,
        isRegionLocked: true,
        regionLockReason: regionBlockerLabel,
        visitStage: computeVisitStage(
          secret,
          'locked',
          combinedMissing,
          activeReqs,
          state.activeEraFilter,
          reach.blockerReqId,
        ),
      };
    }
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
      environmentalConditions,
      visitStage: 'do-now',
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
    environmentalConditions,
    visitStage: computeVisitStage(
      secret,
      status,
      missingPrimaryIds,
      activeReqs,
      state.activeEraFilter,
    ),
  };
}

/**
 * Evaluates and groups all secrets inside a region for the Region Dossier drawer
 * and Guided Co-Pilot views. Supports `'blocker'` (default), `'tier'`, and `'type'`.
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
 * Computes completion, reachability & accessibility summary metrics for a single region or dungeon.
 */
export function computeRegionSummary(
  regionId: string,
  state: PlayerProgressState,
  effectiveReqs?: Set<string>,
): RegionProgressSummary {
  const activeReqs = effectiveReqs ?? deriveEffectiveRequirements(state);
  const reachability: RegionReachabilityResult = state.loadoutModeEnabled
    ? evaluateRegionReachability(regionId, activeReqs)
    : { isReachable: true };

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
    isReachable: reachability.isReachable,
    reachabilityBlocker: reachability.blockerLabel,
    reachabilityBlockerReqId: reachability.blockerReqId,
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
 * Computes global 100% completion, live Heart Container math, and category counters across Hyrule.
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
  let bossHeartsCompleted = 0;
  let bossHeartsTotal = 0;
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

    if (sec.subCategory === 'boss-heart') {
      bossHeartsTotal += 1;
      if (isDone) bossHeartsCompleted += 1;
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

  const startingHearts = METADATA.expectedCounts.startingHearts ?? 3;
  const currentHeartContainers =
    startingHearts + bossHeartsCompleted + Math.floor(heartPiecesCompleted / 4);
  const heartPieceQuarterRemainder = heartPiecesCompleted % 4;

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
    bossHeartsCompleted,
    bossHeartsTotal,
    currentHeartContainers,
    heartPieceQuarterRemainder,
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
  if (syncedReqs) {
    if (nextValue) {
      for (const reqId of syncedReqs) {
        nextOwned[reqId] = true;
      }
    } else {
      for (const reqId of syncedReqs) {
        const stillGrantedByAnotherSecret = Object.entries(SECRET_TO_REQUIREMENTS_MAP).some(
          ([otherSecretId, reqIds]) =>
            otherSecretId !== secretId &&
            Boolean(nextCompleted[otherSecretId]) &&
            reqIds.includes(reqId),
        );
        if (!stillGrantedByAnotherSecret) {
          delete nextOwned[reqId];
        }
      }
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
  const currentlyOwned = deriveOwnedInventoryRequirements(state).has(requirementId);
  const nextValue = owned ?? !currentlyOwned;
  const nextOwned = { ...state.ownedRequirementIds };
  let nextCompleted = state.completedSecretIds;
  let nextCompletedSteps = state.completedRouteStepIds;

  if (nextValue) {
    nextOwned[requirementId] = true;
  } else {
    delete nextOwned[requirementId];

    // Also uncheck any completed secrets in SECRET_TO_REQUIREMENTS_MAP that auto-grant `requirementId`
    for (const [secId, syncedReqs] of Object.entries(SECRET_TO_REQUIREMENTS_MAP)) {
      if (nextCompleted[secId] && syncedReqs.includes(requirementId)) {
        if (nextCompleted === state.completedSecretIds) {
          nextCompleted = { ...state.completedSecretIds };
        }
        delete nextCompleted[secId];
        for (const siblingReqId of syncedReqs) {
          if (siblingReqId !== requirementId) {
            nextOwned[siblingReqId] = true;
          }
        }
      }
    }

    // Also uncheck any completed route steps whose `unlocksRequirementIds` auto-grant `requirementId`
    if (nextCompletedSteps) {
      for (const [stepId, isStepDone] of Object.entries(nextCompletedSteps)) {
        if (!isStepDone) continue;
        const step = ROUTE_STEP_BY_ID[stepId];
        if (step?.unlocksRequirementIds?.includes(requirementId)) {
          if (nextCompletedSteps === state.completedRouteStepIds) {
            nextCompletedSteps = { ...state.completedRouteStepIds };
          }
          delete nextCompletedSteps[stepId];
          for (const siblingReqId of step.unlocksRequirementIds) {
            if (siblingReqId !== requirementId) {
              nextOwned[siblingReqId] = true;
            }
          }
        }
      }
    }
  }

  return {
    ...state,
    ownedRequirementIds: nextOwned,
    completedSecretIds: nextCompleted,
    ...(nextCompletedSteps !== state.completedRouteStepIds
      ? { completedRouteStepIds: nextCompletedSteps }
      : {}),
  };
}

export function applyStoryPreset(
  state: PlayerProgressState,
  presetId: string,
  options?: StoryPresetApplyOptions,
): PlayerProgressState {
  const preset = STORY_PRESETS.find((p) => p.id === presetId);
  if (!preset) {
    return state;
  }

  const ownedRequirementIds: Record<string, boolean> = {};
  for (const reqId of preset.ownedRequirementIds) {
    ownedRequirementIds[reqId] = true;
  }

  if (!options?.markPriorSecretsAndSteps) {
    return {
      ...state,
      activeEraFilter: preset.eraFilter,
      loadoutModeEnabled: true,
      ownedRequirementIds,
      hasCompletedOnboarding: true,
    };
  }

  const cutoffStepId = PRESET_CATCHUP_CUTOFF_STEP[presetId];
  if (cutoffStepId === null) {
    return {
      ...state,
      completedSecretIds: {},
      completedRouteStepIds: {},
      activeRouteChapterId: 'ch-01',
      bookmarkedRouteStepId: 'ch-01-step-01',
      activeEraFilter: preset.eraFilter,
      loadoutModeEnabled: true,
      ownedRequirementIds,
      hasCompletedOnboarding: true,
    };
  }

  const cutoffIndex = cutoffStepId
    ? ALL_ROUTE_STEPS.findIndex((s) => s.id === cutoffStepId)
    : -1;

  const nextCompletedSteps: Record<string, boolean> = {
    ...(state.completedRouteStepIds ?? {}),
  };
  const nextCompletedSecrets: Record<string, boolean> = {
    ...state.completedSecretIds,
  };

  if (cutoffIndex >= 0) {
    for (let i = 0; i <= cutoffIndex; i += 1) {
      const step = ALL_ROUTE_STEPS[i];
      nextCompletedSteps[step.id] = true;

      const isCoreStep =
        step.kind === 'story' || step.kind === 'dungeon' || step.kind === 'boss';

      for (const secId of step.secretIds) {
        const sec = SECRET_BY_ID[secId];
        if (!sec) continue;
        const isStoryOrDungeonSecret =
          isCoreStep ||
          Boolean(sec.subCategory) ||
          Boolean(SECRET_TO_REQUIREMENTS_MAP[secId]);

        if (isStoryOrDungeonSecret) {
          nextCompletedSecrets[secId] = true;
          if (secId === 'hp-10') nextCompletedSecrets['skr-50'] = true;
          if (secId === 'skr-50') nextCompletedSecrets['hp-10'] = true;
        }
      }
    }
  }

  const nextStep =
    cutoffIndex >= 0 && cutoffIndex + 1 < ALL_ROUTE_STEPS.length
      ? ALL_ROUTE_STEPS[cutoffIndex + 1]
      : ALL_ROUTE_STEPS[Math.max(0, cutoffIndex)];
  const nextChapterId = nextStep ? STEP_TO_CHAPTER_ID[nextStep.id] : state.activeRouteChapterId;

  return {
    ...state,
    completedSecretIds: nextCompletedSecrets,
    completedRouteStepIds: nextCompletedSteps,
    activeRouteChapterId: nextChapterId ?? state.activeRouteChapterId,
    bookmarkedRouteStepId: nextStep?.id ?? state.bookmarkedRouteStepId ?? null,
    activeEraFilter: preset.eraFilter,
    loadoutModeEnabled: true,
    ownedRequirementIds,
    hasCompletedOnboarding: true,
  };
}
