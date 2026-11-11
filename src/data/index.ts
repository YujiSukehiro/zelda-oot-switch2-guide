import rawMetadata from '../../data/metadata.json';
import rawRequirements from '../../data/requirements.json';
import rawRegions from '../../data/regions.json';
import rawHeartPieces from '../../data/heart-pieces.json';
import rawGoldSkulltulas from '../../data/gold-skulltulas.json';
import rawUpgrades from '../../data/upgrades-and-bottles.json';
import rawQuests from '../../data/songs-and-quests.json';

import type {
  AltMethod,
  BiggoronStep,
  BossHeartContainerEntry,
  CrossEraSteps,
  GameMetadata,
  GanonTrialEntry,
  GateTierId,
  GateTierInfo,
  GoldSkulltulaEntry,
  HeartPieceEntry,
  OcarinaSong,
  Region,
  Requirement,
  SongsAndQuestsData,
  StoryPreset,
  StoryTokenEntry,
  Switch2Status,
  UnifiedSecret,
  UpgradesAndBottlesData,
} from '../types/zelda';

export const METADATA = rawMetadata as unknown as GameMetadata;
export const REQUIREMENTS = rawRequirements as unknown as Requirement[];
export const REGIONS = rawRegions as unknown as Region[];
export const HEART_PIECES = rawHeartPieces as unknown as HeartPieceEntry[];
export const GOLD_SKULLTULAS = rawGoldSkulltulas as unknown as GoldSkulltulaEntry[];
export const UPGRADES_AND_BOTTLES = rawUpgrades as unknown as UpgradesAndBottlesData;
export const SONGS_AND_QUESTS = rawQuests as unknown as SongsAndQuestsData;
export const BOSS_HEART_CONTAINERS: BossHeartContainerEntry[] =
  UPGRADES_AND_BOTTLES.bossHeartContainers;
export const STORY_TOKENS: StoryTokenEntry[] = UPGRADES_AND_BOTTLES.storyTokens;
export const GANON_TRIALS: GanonTrialEntry[] = UPGRADES_AND_BOTTLES.ganonTrials;

export const OVERWORLD_REGIONS: Region[] = REGIONS.filter((r) => r.kind === 'overworld');
export const DUNGEON_AND_SPECIAL_REGIONS: Region[] = REGIONS.filter((r) => r.kind !== 'overworld');

/**
 * Extracts structured Step 1 / Step 2 cross-era instructions from `howToGet` prose
 * (e.g. `hp-05`, `hp-06`, `gs-010`, `hp-20`, `hp-36`, `song-scarecrow`).
 */
export function parseCrossEraSteps(howToGet: string): CrossEraSteps | undefined {
  const match = howToGet.match(
    /Step\s*1\s*(\([^)]+\))?:\s*(.+?)\s+Step\s*2\s*(\([^)]+\))?:\s*(.+)$/is,
  );
  if (!match) {
    return undefined;
  }
  const prefix1 = match[1] ? `${match[1].slice(1, -1).trim()}: ` : '';
  const prefix2 = match[3] ? `${match[3].slice(1, -1).trim()}: ` : '';
  return {
    step1: `${prefix1}${match[2].trim()}`,
    step2: `${prefix2}${match[4].trim()}`,
  };
}

function getBiggoronStepGates(stepEntry: BiggoronStep): {
  requiredIds: string[];
  altMethods: AltMethod[];
  switch2Status: Switch2Status;
} {
  switch (stepEntry.step) {
    case 1:
      return {
        requiredIds: ['era-adult'],
        altMethods: [],
        switch2Status: 'classic',
      };
    case 2:
      return {
        requiredIds: ['era-adult'],
        altMethods: [
          {
            label: "Play Sun's Song to hatch the Pocket Egg immediately",
            requiredIds: ['era-adult', 'song-sun'],
          },
        ],
        switch2Status: 'updated-switch2',
      };
    case 3:
    case 4:
      return {
        requiredIds: ['era-adult'],
        altMethods: [],
        switch2Status: 'classic',
      };
    case 5:
      return {
        requiredIds: ['era-adult', 'hookshot'],
        altMethods: [
          {
            label: 'Walk through Kakariko Potion Shop back exit after Forest Temple',
            requiredIds: ['era-adult', 'bow'],
          },
        ],
        switch2Status: 'classic',
      };
    case 6:
      return {
        requiredIds: ['era-adult', 'bow'],
        altMethods: [],
        switch2Status: 'updated-switch2',
      };
    case 7:
    case 8:
      return {
        requiredIds: ['era-adult', 'epona'],
        altMethods: [
          {
            label: 'Cross broken Gerudo Valley bridge with Longshot instead of Epona',
            requiredIds: ['era-adult', 'longshot'],
          },
        ],
        switch2Status: 'classic',
      };
    case 9:
      return {
        requiredIds: ['era-adult', 'blue-fire'],
        altMethods: [
          {
            label: "Zora's Domain Unfrozen post-Water Temple (NEW in Switch 2 Remake!)",
            requiredIds: ['era-adult', 'zora-thawed'],
          },
        ],
        switch2Status: 'updated-switch2',
      };
    case 10:
      return {
        requiredIds: ['era-adult', 'epona', 'blue-fire'],
        altMethods: [
          {
            label: "Switch 2 Thawed Zora's Domain -> Lake Hylia Underwater Shortcut (25s!)",
            requiredIds: ['era-adult', 'zora-thawed'],
          },
        ],
        switch2Status: 'updated-switch2',
      };
    case 11:
      return {
        requiredIds: ['era-adult', 'epona'],
        altMethods: [
          {
            label: "Swim Lake Hylia -> Thawed Zora's Domain -> Lost Woods -> Goron City shortcut",
            requiredIds: ['era-adult', 'zora-thawed', 'bombs'],
          },
        ],
        switch2Status: 'updated-switch2',
      };
    case 12:
    default:
      return {
        requiredIds: ['era-adult', 'epona', 'song-sun'],
        altMethods: [
          {
            label: "Sleep 3 days in any bed after thawed Zora's Domain run (Switch 2)",
            requiredIds: ['era-adult', 'zora-thawed'],
          },
        ],
        switch2Status: 'classic',
      };
  }
}

// ============================================================================
// Normalize All 232 Collectibles Across All 14 Categories
// ============================================================================

const normalizedHeartPieces: UnifiedSecret[] = HEART_PIECES.map((hp) => ({
  id: hp.id,
  title: hp.title,
  subtitle: 'Piece of Heart',
  category: 'heart-piece',
  regionId: hp.regionId,
  era: hp.era,
  gateTier: hp.gateTier,
  requiredIds: hp.requiredIds,
  altMethods: hp.altMethods,
  switch2Status: hp.switch2Status,
  locationHint: hp.locationHint,
  howToGet: hp.howToGet,
  countsToward100Percent: true,
  crossEraSteps: parseCrossEraSteps(hp.howToGet),
}));

const normalizedGoldSkulltulas: UnifiedSecret[] = GOLD_SKULLTULAS.map((gs) => ({
  id: gs.id,
  title: gs.title,
  subtitle: `Gold Skulltula #${gs.number}`,
  category: 'gold-skulltula',
  regionId: gs.regionId,
  era: gs.era,
  gateTier: gs.gateTier,
  requiredIds: gs.requiredIds,
  altMethods: [],
  switch2Status: gs.switch2Status,
  howToGet: gs.howToGet,
  countsToward100Percent: true,
  skulltulaNumber: gs.number,
  crossEraSteps: parseCrossEraSteps(gs.howToGet),
}));

const normalizedBottles: UnifiedSecret[] = UPGRADES_AND_BOTTLES.bottles.map((b) => ({
  id: b.id,
  title: b.title,
  subtitle: 'Empty Bottle',
  category: 'bottle',
  regionId: b.regionId,
  era: b.era,
  gateTier: b.gateTier,
  requiredIds: b.requiredIds,
  altMethods: [],
  switch2Status: b.switch2Status,
  howToGet: b.howToGet,
  countsToward100Percent: true,
}));

const normalizedBigPoes: UnifiedSecret[] = UPGRADES_AND_BOTTLES.bigPoeLocations.map((bp, idx) => ({
  id: bp.id,
  title: `Big Poe #${idx + 1} — ${bp.spot}`,
  subtitle: 'Big Poe Hunt (100 pts)',
  category: 'big-poe',
  regionId: bp.regionId,
  era: 'adult',
  gateTier: 'tier-5-adult-gear',
  requiredIds: ['era-adult', 'epona', 'bow', 'bottle'],
  altMethods: [],
  switch2Status: 'updated-switch2',
  locationHint: bp.spot,
  howToGet: `${bp.cue} Shoot twice with the Fairy Bow while riding Epona, scoop the spirit into an Empty Bottle, and sell to the Castle Town Guardhouse Poe Collector (500 pts / 5 Big Poes = Empty Bottle in Switch 2!).`,
  countsToward100Percent: true,
}));

const normalizedGreatFairies: UnifiedSecret[] = UPGRADES_AND_BOTTLES.greatFairies.map((gf) => ({
  id: gf.id,
  title: gf.title,
  subtitle: `Reward: ${gf.reward}`,
  category: 'great-fairy',
  regionId: gf.regionId,
  era: gf.era,
  gateTier: gf.gateTier,
  requiredIds: gf.requiredIds,
  altMethods: [],
  switch2Status: gf.switch2Status,
  rupeeCost: gf.rupeeCost,
  rewardText: gf.reward,
  howToGet: gf.howToGet,
  countsToward100Percent: true,
}));

/**
 * Note on `skr-50`: The 50-Token reward inside the House of Skulltula is also
 * listed in `heart-pieces.json` as `hp-10`. Setting `countsToward100Percent: false`
 * on `skr-50` keeps it visible in the Kakariko / Skulltula trackers without
 * double-counting the Piece of Heart in overall 100% completion math.
 */
const normalizedSkulltulaRewards: UnifiedSecret[] = UPGRADES_AND_BOTTLES.skulltulaRewards.map(
  (skr) => ({
    id: skr.id,
    title: `${skr.tokens} Gold Skulltulas — ${skr.reward}`,
    subtitle: 'House of Skulltula Reward',
    category: 'skulltula-reward',
    regionId: skr.regionId,
    era: 'both',
    gateTier: skr.gateTier,
    requiredIds: skr.requiredIds,
    altMethods: [],
    switch2Status: skr.switch2Status,
    rewardText: skr.reward,
    switch2Notes: skr.notes,
    howToGet: `Collect ${skr.tokens} Gold Skulltula Tokens and speak to the freed brother inside the House of Skulltula in Kakariko Village to claim ${skr.reward}. ${skr.notes}`,
    countsToward100Percent: skr.id !== 'skr-50',
  }),
);

const normalizedCapacityUpgrades: UnifiedSecret[] = UPGRADES_AND_BOTTLES.capacityUpgrades.map(
  (cap) => ({
    id: cap.id,
    title: cap.item,
    subtitle: 'Capacity Upgrade',
    category: 'capacity-upgrade',
    regionId: cap.regionId,
    era: cap.era,
    gateTier: cap.gateTier,
    requiredIds: cap.requiredIds,
    altMethods: [],
    switch2Status: cap.switch2Status,
    rewardText: cap.item,
    howToGet: cap.howToGet,
    countsToward100Percent: true,
  }),
);

const DUNGEON_AND_PROGRESSION_EQUIPMENT_IDS = new Set([
  'eq-deku-shield',
  'eq-ocarina',
  'eq-slingshot',
  'eq-goron-bracelet',
  'eq-bomb-bag',
  'eq-boomerang',
  'eq-bow',
  'eq-megaton-hammer',
  'eq-iron-boots',
  'eq-longshot',
  'eq-hover-boots',
  'eq-gerudo-card',
  'eq-silver-gauntlets',
  'eq-mirror-shield',
  'eq-light-arrows',
  'eq-golden-gauntlets',
]);

const normalizedEquipment: UnifiedSecret[] = UPGRADES_AND_BOTTLES.gearAndEquipment.map((eq) => ({
  id: eq.id,
  title: eq.name,
  subtitle: DUNGEON_AND_PROGRESSION_EQUIPMENT_IDS.has(eq.id)
    ? 'Dungeon & Progression Gear'
    : 'Equipment & Gear',
  category: 'equipment',
  ...(DUNGEON_AND_PROGRESSION_EQUIPMENT_IDS.has(eq.id) ? { subCategory: 'dungeon-item' } : {}),
  regionId: eq.regionId,
  era: eq.era,
  gateTier: eq.gateTier,
  requiredIds: eq.requiredIds,
  altMethods: [],
  switch2Status: eq.switch2Status ?? (eq.id === 'eq-biggoron-sword' ? 'updated-switch2' : 'classic'),
  rewardText: eq.name,
  howToGet: eq.howToGet,
  countsToward100Percent: true,
}));

const normalizedBossHeartContainers: UnifiedSecret[] = BOSS_HEART_CONTAINERS.map((bhc) => ({
  id: bhc.id,
  title: bhc.title,
  subtitle: 'Boss Heart Container',
  category: 'capacity-upgrade',
  subCategory: 'boss-heart',
  regionId: bhc.regionId,
  era: bhc.era,
  gateTier: bhc.gateTier,
  requiredIds: bhc.requiredIds,
  altMethods: [],
  switch2Status: bhc.switch2Status,
  rewardText: 'Full Heart Container (+1 Max Heart)',
  howToGet: bhc.howToGet,
  countsToward100Percent: true,
}));

const normalizedStoryTokens: UnifiedSecret[] = STORY_TOKENS.map((token) => ({
  id: token.id,
  title: token.title,
  subtitle: token.tokenKind === 'spiritual-stone' ? 'Spiritual Stone' : 'Sage Medallion',
  category: 'equipment',
  subCategory: token.tokenKind,
  regionId: token.regionId,
  era: token.era,
  gateTier: token.gateTier,
  requiredIds: token.requiredIds,
  altMethods: [],
  switch2Status: token.switch2Status,
  rewardText: token.title,
  howToGet: token.howToGet,
  countsToward100Percent: true,
}));

const normalizedGanonTrials: UnifiedSecret[] = GANON_TRIALS.map((trial) => ({
  id: trial.id,
  title: trial.title,
  subtitle: "Ganon's Castle Barrier Trial",
  category: 'equipment',
  subCategory: 'ganon-trial',
  regionId: trial.regionId,
  era: trial.era,
  gateTier: trial.gateTier,
  requiredIds: trial.requiredIds,
  altMethods: [],
  switch2Status: trial.switch2Status,
  rewardText: trial.title,
  howToGet: trial.howToGet,
  countsToward100Percent: true,
}));

const normalizedOcarinaSongs: UnifiedSecret[] = SONGS_AND_QUESTS.ocarinaSongs.map((song) => ({
  id: song.id,
  title: song.name,
  subtitle:
    song.type === 'warp'
      ? 'Ocarina Warp Melody'
      : song.type === 'custom'
        ? 'Custom Ocarina Melody'
        : 'Ocarina Melody',
  category: 'ocarina-song',
  regionId: song.regionId,
  era: song.era,
  gateTier: song.gateTier,
  requiredIds: song.requiredIds,
  altMethods: [],
  switch2Status: 'updated-switch2',
  songButtons: song.switch2Buttons,
  rewardText: song.effect,
  howToGet: `${song.howToGet} Effect: ${song.effect}`,
  countsToward100Percent: true,
  crossEraSteps: parseCrossEraSteps(song.howToGet),
}));

const normalizedMagicBeans: UnifiedSecret[] = SONGS_AND_QUESTS.magicBeans.map((bean, idx) => {
  const isBoleroCrater = bean.id === 'bean-09';
  const isRequiemColossus = bean.id === 'bean-10';
  const isCrossEraWarpBean = isBoleroCrater || isRequiemColossus;

  const requiredIds = isBoleroCrater
    ? ['era-adult', 'song-bolero', 'time-travel', 'era-child', 'magic-beans', 'rupees-100']
    : isRequiemColossus
      ? ['era-adult', 'song-requiem', 'time-travel', 'era-child', 'magic-beans', 'rupees-100']
      : ['era-child', 'magic-beans', 'rupees-100'];

  const crossEraSteps: CrossEraSteps | undefined = isBoleroCrater
    ? {
        step1: 'Adult Link: Learn Bolero of Fire from Sheik inside Death Mountain Crater.',
        step2: `Child Link: Warp to the Crater pad via Bolero of Fire and plant Magic Bean #${idx + 1} (${bean.buyCost} Rupees).`,
      }
    : isRequiemColossus
      ? {
          step1: 'Adult Link: Reach Spirit Temple at Desert Colossus to learn Requiem of Spirit.',
          step2: `Child Link: Warp to Desert Colossus via Requiem of Spirit and plant Magic Bean #${idx + 1} (${bean.buyCost} Rupees).`,
        }
      : undefined;

  return {
    id: bean.id,
    title: `Magic Bean Plot #${idx + 1} (${bean.buyCost} Rupees)`,
    subtitle: bean.location,
    category: 'magic-bean',
    regionId: bean.regionId,
    era: isCrossEraWarpBean ? 'cross-era' : 'child',
    gateTier: isCrossEraWarpBean ? 'tier-4-cross-era' : 'tier-3-child-gear',
    requiredIds,
    altMethods: [],
    switch2Status: 'classic',
    rupeeCost: bean.buyCost,
    locationHint: bean.location,
    rewardText: bean.adultPayoff,
    hasSkulltulaBug: bean.hasSkulltulaBug,
    crossEraSteps,
    howToGet: `Buy a Magic Bean (${bean.buyCost} Rupees) from the Zora's River Bean Seller and plant it as Child Link: ${bean.location}. Adult Payoff: ${bean.adultPayoff}`,
    countsToward100Percent: true,
  };
});

const normalizedMaskTrades: UnifiedSecret[] = SONGS_AND_QUESTS.happyMaskQuest.map((mask) => ({
  id: `mask-step-${mask.step}`,
  title: `Happy Mask #${mask.step}: ${mask.mask}`,
  subtitle: `Deliver to ${mask.buyer}`,
  category: 'mask-trade',
  regionId: mask.regionId,
  era: 'child',
  gateTier: mask.gateTier,
  requiredIds: mask.requiredIds,
  altMethods: [],
  switch2Status: 'classic',
  rupeeCost: mask.feeToShop,
  questStep: mask.step,
  buyer: mask.buyer,
  proTip: mask.proTip,
  howToGet: `Borrow the ${mask.mask} from the Market Happy Mask Shop as Child Link, deliver it to ${mask.buyer}, and pay the ${mask.feeToShop}-Rupee fee back at the shop. ${mask.proTip}`,
  countsToward100Percent: true,
}));

const normalizedBiggoronSteps: UnifiedSecret[] = SONGS_AND_QUESTS.biggoronSwordQuest.map((step) => {
  const gates = getBiggoronStepGates(step);
  return {
    id: `biggoron-step-${step.step}`,
    title: `Biggoron Trade #${step.step}: ${step.item}`,
    subtitle: step.timer ? `Timed Run (${step.timer} — No Warp Songs!)` : 'Adult Trading Sequence',
    category: 'biggoron-step',
    regionId: step.regionId,
    era: 'adult',
    gateTier: 'tier-5-adult-gear',
    requiredIds: gates.requiredIds,
    altMethods: gates.altMethods,
    switch2Status: gates.switch2Status,
    timer: step.timer,
    questStep: step.step,
    howToGet: step.instructions,
    countsToward100Percent: true,
  };
});

const normalizedCowsAndGrottos: UnifiedSecret[] = SONGS_AND_QUESTS.cowsAndKeyGrottos.map((cg) => ({
  id: cg.id,
  title: cg.title,
  subtitle: 'Cow / Fairy Grotto',
  category: 'cow-or-grotto',
  regionId: cg.regionId,
  era: cg.era,
  gateTier: cg.gateTier,
  requiredIds: cg.requiredIds,
  altMethods: [],
  switch2Status: 'classic',
  howToGet: cg.howToGet,
  countsToward100Percent: true,
}));

const normalizedSwitch2Exclusives: UnifiedSecret[] = SONGS_AND_QUESTS.switch2Exclusives.map(
  (sw2) => ({
    id: sw2.id,
    title: sw2.title,
    subtitle: 'Switch 2 Remake Exclusive',
    category: 'switch2-exclusive',
    regionId: sw2.regionId,
    era: sw2.era,
    gateTier: sw2.gateTier,
    requiredIds: sw2.requiredIds,
    altMethods: [],
    switch2Status: 'new-switch2',
    howToGet: sw2.description,
    countsToward100Percent: true,
  }),
);

export const ALL_SECRETS: UnifiedSecret[] = [
  ...normalizedHeartPieces,
  ...normalizedGoldSkulltulas,
  ...normalizedBottles,
  ...normalizedBigPoes,
  ...normalizedGreatFairies,
  ...normalizedSkulltulaRewards,
  ...normalizedCapacityUpgrades,
  ...normalizedEquipment,
  ...normalizedBossHeartContainers,
  ...normalizedStoryTokens,
  ...normalizedGanonTrials,
  ...normalizedOcarinaSongs,
  ...normalizedMagicBeans,
  ...normalizedMaskTrades,
  ...normalizedBiggoronSteps,
  ...normalizedCowsAndGrottos,
  ...normalizedSwitch2Exclusives,
];

// ============================================================================
// Fast O(1) Lookups & Relational Maps
// ============================================================================

export const GATE_TIER_BY_ID: Record<GateTierId, GateTierInfo> = Object.fromEntries(
  METADATA.gateTiers.map((tier) => [tier.id, tier]),
) as Record<GateTierId, GateTierInfo>;

export const REGION_BY_ID: Record<string, Region> = Object.fromEntries(
  REGIONS.map((reg) => [reg.id, reg]),
);

export const REQUIREMENT_BY_ID: Record<string, Requirement> = Object.fromEntries(
  REQUIREMENTS.map((req) => [req.id, req]),
);

export const SECRET_BY_ID: Record<string, UnifiedSecret> = Object.fromEntries(
  ALL_SECRETS.map((sec) => [sec.id, sec]),
);

export const SECRETS_BY_REGION: Record<string, UnifiedSecret[]> = (() => {
  const map: Record<string, UnifiedSecret[]> = {};
  for (const reg of REGIONS) {
    map[reg.id] = [];
  }
  for (const sec of ALL_SECRETS) {
    if (!map[sec.regionId]) {
      map[sec.regionId] = [];
    }
    map[sec.regionId].push(sec);
  }
  return map;
})();

export const ATTACHED_DUNGEONS_BY_REGION: Record<string, Region[]> = (() => {
  const map: Record<string, Region[]> = {};
  for (const reg of REGIONS) {
    map[reg.id] = [];
  }
  for (const reg of REGIONS) {
    if (reg.parentRegionId && map[reg.parentRegionId]) {
      map[reg.parentRegionId].push(reg);
    }
  }
  return map;
})();

export const SONG_BY_ID: Record<string, OcarinaSong> = Object.fromEntries(
  SONGS_AND_QUESTS.ocarinaSongs.map((song) => [song.id, song]),
);

/**
 * Maps every canonical `requirementId` (all 69 in `data/requirements.json`)
 * to the primary `regionId` on the Hyrule map where the player obtains it.
 */
export const REQUIREMENT_SOURCE_REGION: Record<string, string> = {
  'era-child': 'kokiri-forest',
  'era-adult': 'market',
  'time-travel': 'market',
  'time-night': 'graveyard',
  'time-day': 'kokiri-forest',
  'zora-thawed': 'water-temple',
  'stone-emerald': 'deku-tree',
  'stone-ruby': 'dodongos-cavern',
  'stone-sapphire': 'jabu-jabus-belly',
  'kokiri-sword': 'kokiri-forest',
  'deku-shield': 'kokiri-forest',
  'deku-sticks': 'kokiri-forest',
  slingshot: 'deku-tree',
  ocarina: 'kokiri-forest',
  'weird-egg': 'hyrule-castle',
  'zeldas-letter': 'hyrule-castle',
  'goron-bracelet': 'goron-city',
  bombs: 'dodongos-cavern',
  boomerang: 'jabu-jabus-belly',
  'magic-beans': 'zoras-river',
  'magic-meter': 'death-mountain-trail',
  'dins-fire': 'death-mountain-trail',
  'silver-scale': 'zoras-domain',
  'lens-of-truth': 'bottom-of-the-well',
  'skull-mask': 'market',
  'mask-of-truth': 'market',
  bottle: 'market',
  'bottled-bug': 'kokiri-forest',
  'blue-fire': 'ice-cavern',
  'rupees-100': 'kokiri-forest',
  'adults-wallet': 'kakariko-village',
  'giants-wallet': 'kakariko-village',
  'echo-gem': 'kakariko-village',
  'tokens-10': 'kakariko-village',
  'tokens-20': 'kakariko-village',
  'tokens-30': 'kakariko-village',
  'tokens-40': 'kakariko-village',
  'tokens-50': 'kakariko-village',
  'tokens-100': 'kakariko-village',
  epona: 'lon-lon-ranch',
  hookshot: 'graveyard',
  bow: 'forest-temple',
  'megaton-hammer': 'fire-temple',
  'goron-tunic': 'goron-city',
  'iron-boots': 'ice-cavern',
  'zora-tunic': 'zoras-domain',
  longshot: 'water-temple',
  'golden-scale': 'lake-hylia',
  'fire-arrows': 'lake-hylia',
  'hover-boots': 'shadow-temple',
  'gerudo-card': 'gerudo-fortress',
  'silver-gauntlets': 'spirit-temple',
  'mirror-shield': 'spirit-temple',
  'ice-arrows': 'gerudo-training-ground',
  'light-arrows': 'market',
  'golden-gauntlets': 'ganons-castle',
  'song-lullaby': 'hyrule-castle',
  'song-epona': 'lon-lon-ranch',
  'song-saria': 'sacred-forest-meadow',
  'song-sun': 'graveyard',
  'song-time': 'market',
  'song-storms': 'kakariko-village',
  'song-minuet': 'sacred-forest-meadow',
  'song-bolero': 'death-mountain-crater',
  'song-serenade': 'ice-cavern',
  'song-requiem': 'desert-colossus',
  'song-nocturne': 'kakariko-village',
  'song-prelude': 'market',
  'song-scarecrow': 'lake-hylia',
};

// ============================================================================
// Story Checkpoint Presets (8 Canonical Checkpoints)
// ============================================================================

export const STORY_PRESETS: StoryPreset[] = [
  {
    id: 'fresh-start',
    label: 'Fresh Start (Kokiri Forest)',
    shortLabel: 'Fresh Start',
    description:
      'Brand-new adventure as Child Link with daytime & starting 200-Rupee Kokiri Wallet.',
    eraFilter: 'all',
    ownedRequirementIds: ['era-child', 'time-day', 'rupees-100'],
  },
  {
    id: 'goron-city-visit-1',
    label: "Goron City — 1st Visit (Before Dodongo's Cavern)",
    shortLabel: 'Goron City 1st Visit',
    description:
      "Arrived in Goron City for the first time with Kokiri's Emerald, Ocarina, Zelda's Letter, Lullaby, Saria's & Sun's Songs, and 1st Bottle.",
    eraFilter: 'all',
    ownedRequirementIds: [
      'era-child',
      'kokiri-sword',
      'deku-shield',
      'deku-sticks',
      'slingshot',
      'stone-emerald',
      'ocarina',
      'weird-egg',
      'zeldas-letter',
      'song-lullaby',
      'song-epona',
      'song-saria',
      'song-sun',
      'bottle',
      'rupees-100',
    ],
  },
  {
    id: 'post-dodongo',
    label: "After Dodongo's Cavern (Bombs Unlocked)",
    shortLabel: 'Post-Dodongo',
    description:
      "Child Link with Sword, Shield, Slingshot, Ocarina, Lullaby, Saria's & Sun's Songs, Bomb Bag, Din's Fire, and Bottle.",
    eraFilter: 'all',
    ownedRequirementIds: [
      'era-child',
      'time-day',
      'time-night',
      'rupees-100',
      'kokiri-sword',
      'deku-shield',
      'deku-sticks',
      'slingshot',
      'stone-emerald',
      'stone-ruby',
      'ocarina',
      'weird-egg',
      'zeldas-letter',
      'song-lullaby',
      'song-epona',
      'song-saria',
      'song-sun',
      'goron-bracelet',
      'bombs',
      'magic-meter',
      'dins-fire',
      'bottle',
      'bottled-bug',
    ],
  },
  {
    id: 'three-stones',
    label: 'All 3 Spiritual Stones (Pre-Master Sword)',
    shortLabel: '3 Spiritual Stones',
    description:
      "Cleared Jabu-Jabu's Belly with Boomerang, Silver Scale, Magic Beans, Song of Time, Adult's Wallet, and Happy Masks.",
    eraFilter: 'all',
    ownedRequirementIds: [
      'era-child',
      'time-day',
      'time-night',
      'rupees-100',
      'adults-wallet',
      'kokiri-sword',
      'deku-shield',
      'deku-sticks',
      'slingshot',
      'stone-emerald',
      'stone-ruby',
      'stone-sapphire',
      'ocarina',
      'weird-egg',
      'zeldas-letter',
      'song-lullaby',
      'song-epona',
      'song-saria',
      'song-sun',
      'song-time',
      'goron-bracelet',
      'bombs',
      'boomerang',
      'silver-scale',
      'magic-beans',
      'magic-meter',
      'dins-fire',
      'skull-mask',
      'mask-of-truth',
      'bottle',
      'bottled-bug',
    ],
  },
  {
    id: 'fresh-adult-hookshot',
    label: 'Fresh Adult Link + Hookshot',
    shortLabel: 'Fresh Adult + Hookshot',
    description:
      'Just pulled the Master Sword (Adult Era before unlocking Pedestal of Time travel) with Epona, Hookshot, and Song of Storms.',
    eraFilter: 'adult',
    ownedRequirementIds: [
      'era-adult',
      'time-day',
      'time-night',
      'rupees-100',
      'adults-wallet',
      'stone-emerald',
      'stone-ruby',
      'stone-sapphire',
      'ocarina',
      'bombs',
      'magic-meter',
      'dins-fire',
      'bottle',
      'epona',
      'hookshot',
      'song-lullaby',
      'song-epona',
      'song-saria',
      'song-sun',
      'song-time',
      'song-storms',
    ],
  },
  {
    id: 'post-forest-temple',
    label: 'Post-Forest Temple / Time Travel',
    shortLabel: 'Post-Forest / Time Travel',
    description:
      'Cleared Forest Temple with Fairy Bow, Prelude of Light, Child <-> Adult Time Travel, Lens of Truth, and Hall of Fallen Foes.',
    eraFilter: 'all',
    ownedRequirementIds: [
      'era-child',
      'era-adult',
      'time-travel',
      'time-day',
      'time-night',
      'rupees-100',
      'adults-wallet',
      'kokiri-sword',
      'deku-shield',
      'deku-sticks',
      'slingshot',
      'stone-emerald',
      'stone-ruby',
      'stone-sapphire',
      'ocarina',
      'weird-egg',
      'zeldas-letter',
      'goron-bracelet',
      'bombs',
      'boomerang',
      'silver-scale',
      'magic-beans',
      'magic-meter',
      'dins-fire',
      'skull-mask',
      'mask-of-truth',
      'lens-of-truth',
      'bottle',
      'bottled-bug',
      'epona',
      'hookshot',
      'bow',
      'goron-tunic',
      'song-lullaby',
      'song-epona',
      'song-saria',
      'song-sun',
      'song-time',
      'song-storms',
      'song-minuet',
      'song-prelude',
      'song-scarecrow',
    ],
  },
  {
    id: 'post-water-temple',
    label: 'Post-Water Temple / Thawed Zora',
    shortLabel: 'Post-Water / Thawed Zora',
    description:
      "Cleared Fire & Water Temples: Megaton Hammer, Iron Boots, Zora Tunic, Longshot, Fire Arrows, and Switch 2 Unfrozen Zora's Domain!",
    eraFilter: 'all',
    ownedRequirementIds: [
      'era-child',
      'era-adult',
      'time-travel',
      'time-day',
      'time-night',
      'zora-thawed',
      'rupees-100',
      'adults-wallet',
      'giants-wallet',
      'kokiri-sword',
      'deku-shield',
      'deku-sticks',
      'slingshot',
      'stone-emerald',
      'stone-ruby',
      'stone-sapphire',
      'ocarina',
      'weird-egg',
      'zeldas-letter',
      'goron-bracelet',
      'bombs',
      'boomerang',
      'silver-scale',
      'golden-scale',
      'magic-beans',
      'magic-meter',
      'dins-fire',
      'skull-mask',
      'mask-of-truth',
      'lens-of-truth',
      'bottle',
      'bottled-bug',
      'blue-fire',
      'epona',
      'hookshot',
      'longshot',
      'bow',
      'fire-arrows',
      'megaton-hammer',
      'goron-tunic',
      'iron-boots',
      'zora-tunic',
      'song-lullaby',
      'song-epona',
      'song-saria',
      'song-sun',
      'song-time',
      'song-storms',
      'song-minuet',
      'song-bolero',
      'song-serenade',
      'song-nocturne',
      'song-prelude',
      'song-scarecrow',
    ],
  },
  {
    id: 'endgame',
    label: 'Endgame Cleanup (All Gear & Songs)',
    shortLabel: 'Endgame',
    description:
      'All dungeon items, gauntlets, shields, arrows, wallets, and Ocarina melodies unlocked for 100% Hyrule cleanup.',
    eraFilter: 'all',
    ownedRequirementIds: REQUIREMENTS.filter((r) => r.category !== 'milestone').map((r) => r.id),
  },
];

export { AREA_GUIDES, AREA_GUIDE_BY_REGION_ID } from './areaGuides';
export {
  OPTIMAL_ROUTE_CHAPTERS,
  ROUTE_CHAPTER_BY_ID,
  ALL_ROUTE_STEPS,
  ROUTE_STEP_BY_ID,
  STEP_TO_CHAPTER_ID,
} from './optimalRoute';

