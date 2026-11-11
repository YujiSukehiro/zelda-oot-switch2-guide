export type Era = 'child' | 'adult' | 'both' | 'cross-era';

export type EraFilter = 'all' | 'child' | 'adult';

export type ThemeMode = 'dark' | 'parchment';

export type GateTierId =
  | 'tier-0-immediate'
  | 'tier-1-utility'
  | 'tier-2-song'
  | 'tier-3-child-gear'
  | 'tier-4-cross-era'
  | 'tier-5-adult-gear';

export type Switch2Status = 'classic' | 'new-switch2' | 'updated-switch2';

export type SecretCategory =
  | 'heart-piece'
  | 'gold-skulltula'
  | 'bottle'
  | 'great-fairy'
  | 'capacity-upgrade'
  | 'equipment'
  | 'skulltula-reward'
  | 'ocarina-song'
  | 'magic-bean'
  | 'mask-trade'
  | 'biggoron-step'
  | 'cow-or-grotto'
  | 'big-poe'
  | 'switch2-exclusive';

export interface AltMethod {
  label: string;
  requiredIds: string[];
}

export interface CrossEraSteps {
  step1: string;
  step2: string;
}

/**
 * Normalized secret/collectible record consumed by the Map, Region Dossier,
 * Search modal, Quest trackers, and Unlock Delta engine.
 */
export interface UnifiedSecret {
  id: string;
  title: string;
  subtitle?: string;
  category: SecretCategory;
  regionId: string;
  era: Era;
  gateTier: GateTierId;
  requiredIds: string[];
  altMethods: AltMethod[];
  switch2Status: Switch2Status;
  rupeeCost?: number;
  timer?: string | null;
  songButtons?: string[];
  locationHint?: string;
  howToGet: string;
  countsToward100Percent: boolean;
  skulltulaNumber?: number;
  rewardText?: string;
  questStep?: number;
  crossEraSteps?: CrossEraSteps;
  switch2Notes?: string;
  proTip?: string;
  buyer?: string;
  hasSkulltulaBug?: boolean;
}

// ============================================================================
// Raw JSON Entity Interfaces (/data/*.json)
// ============================================================================

export interface GateTierInfo {
  id: GateTierId;
  order: number;
  label: string;
  shortLabel: string;
  badgeColor: string;
  description: string;
}

export interface GameMetadata {
  game: {
    title: string;
    edition: string;
    platform: string;
    releaseDate: string;
    latestPatch: string;
    summary: string;
  };
  expectedCounts: {
    overworldRegions: number;
    dungeonsAndSpecialAreas: number;
    totalRegions: number;
    heartPieces: number;
    bossHeartContainers: number;
    startingHearts: number;
    maxHearts: number;
    goldSkulltulasTotal: number;
    goldSkulltulasOverworld: number;
    goldSkulltulasDungeon: number;
    emptyBottles: number;
    greatFairies: number;
    greatFairyTotalRupeeCost: number;
    ocarinaSongs: number;
    magicBeanLocations: number;
    magicBeanTotalRupeeCost: number;
    happyMaskTrades: number;
    biggoronTradeSteps: number;
    hallOfFallenFoesStatues: number;
    bigPoesTotal: number;
    bigPoeBottlePoints: number;
  };
  gateTiers: GateTierInfo[];
  switch2Controls: {
    jump: string;
    dash: string;
    camera: string;
    aiming: string;
    questLog: string;
    ocarinaNotes: Record<string, string>;
  };
}

export type RequirementCategory =
  | 'era'
  | 'time'
  | 'story'
  | 'gear'
  | 'item'
  | 'quest'
  | 'upgrade'
  | 'economy'
  | 'milestone'
  | 'song';

export interface Requirement {
  id: string;
  name: string;
  category: RequirementCategory;
  icon: string;
  notes?: string[];
  howToGet: string;
  switch2Notes?: string;
}

export type RegionKind = 'overworld' | 'dungeon' | 'mini-dungeon' | 'special';

export type RegionBiome =
  | 'forest'
  | 'field'
  | 'town'
  | 'castle'
  | 'shadow'
  | 'mountain'
  | 'water'
  | 'desert'
  | 'dream';

export interface RegionExpectedTallies {
  heartPieces: number;
  skulltulasChild: number;
  skulltulasAdult: number;
  skulltulasTotal: number;
}

export interface Region {
  id: string;
  name: string;
  kind: RegionKind;
  biome: RegionBiome;
  parentRegionId: string | null;
  eras: ('child' | 'adult')[];
  mapCoords: {
    x: number;
    y: number;
  };
  connectedRegions: string[];
  expectedTallies: RegionExpectedTallies;
  summary: string;
  switch2Highlights: string[];
}

export interface HeartPieceEntry {
  id: string;
  title: string;
  regionId: string;
  era: Era;
  gateTier: GateTierId;
  requiredIds: string[];
  altMethods: AltMethod[];
  switch2Status: Switch2Status;
  locationHint: string;
  howToGet: string;
}

export interface GoldSkulltulaEntry {
  id: string;
  number: number;
  title: string;
  regionId: string;
  era: 'child' | 'adult';
  gateTier: GateTierId;
  requiredIds: string[];
  switch2Status: Switch2Status;
  howToGet: string;
}

export interface BottleEntry {
  id: string;
  title: string;
  regionId: string;
  era: Era;
  gateTier: GateTierId;
  requiredIds: string[];
  switch2Status: Switch2Status;
  howToGet: string;
}

export interface BigPoeLocation {
  id: string;
  regionId: string;
  spot: string;
  cue: string;
}

export interface GreatFairy {
  id: string;
  title: string;
  reward: string;
  regionId: string;
  era: Era;
  gateTier: GateTierId;
  requiredIds: string[];
  rupeeCost: number;
  switch2Status: Switch2Status;
  howToGet: string;
}

export interface SkulltulaReward {
  id: string;
  tokens: number;
  reward: string;
  regionId: string;
  gateTier: GateTierId;
  requiredIds: string[];
  switch2Status: Switch2Status;
  notes: string;
}

export interface CapacityUpgradeEntry {
  id: string;
  item: string;
  regionId: string;
  era: Era;
  gateTier: GateTierId;
  requiredIds: string[];
  switch2Status: Switch2Status;
  howToGet: string;
}

export interface EquipmentEntry {
  id: string;
  name: string;
  regionId: string;
  era: Era;
  gateTier: GateTierId;
  requiredIds: string[];
  howToGet: string;
  switch2Status?: Switch2Status;
}

export interface UpgradesAndBottlesData {
  bottles: BottleEntry[];
  bigPoeLocations: BigPoeLocation[];
  greatFairies: GreatFairy[];
  skulltulaRewards: SkulltulaReward[];
  capacityUpgrades: CapacityUpgradeEntry[];
  gearAndEquipment: EquipmentEntry[];
}

export interface OcarinaSong {
  id: string;
  name: string;
  type: 'standard' | 'warp' | 'custom';
  regionId: string;
  era: Era;
  gateTier: GateTierId;
  requiredIds: string[];
  switch2Buttons: string[];
  effect: string;
  howToGet: string;
}

export interface MagicBeanSpot {
  id: string;
  buyCost: number;
  regionId: string;
  location: string;
  adultPayoff: string;
  hasSkulltulaBug: boolean;
}

export interface HappyMaskStep {
  step: number;
  mask: string;
  regionId: string;
  gateTier: GateTierId;
  requiredIds: string[];
  buyer: string;
  feeToShop: number;
  proTip: string;
}

export interface BiggoronStep {
  step: number;
  item: string;
  regionId: string;
  timer: string | null;
  instructions: string;
}

export interface CowOrGrottoEntry {
  id: string;
  title: string;
  regionId: string;
  era: Era;
  gateTier: GateTierId;
  requiredIds: string[];
  howToGet: string;
}

export interface Switch2ExclusiveEntry {
  id: string;
  title: string;
  regionId: string;
  era: Era;
  gateTier: GateTierId;
  requiredIds: string[];
  description: string;
}

export interface SongsAndQuestsData {
  ocarinaSongs: OcarinaSong[];
  magicBeans: MagicBeanSpot[];
  happyMaskQuest: HappyMaskStep[];
  biggoronSwordQuest: BiggoronStep[];
  cowsAndKeyGrottos: CowOrGrottoEntry[];
  switch2Exclusives: Switch2ExclusiveEntry[];
}

// ============================================================================
// State, Gating & Categorization Interfaces
// ============================================================================

export interface PlayerProgressState {
  version: 1;
  completedSecretIds: Record<string, boolean>;
  ownedRequirementIds: Record<string, boolean>;
  activeEraFilter: 'all' | 'child' | 'adult';
  switch2SpotlightOnly?: boolean;
  loadoutModeEnabled: boolean;
  customScarecrowNotes: string;
  theme?: 'dark' | 'parchment';
  completedRouteStepIds?: Record<string, boolean>;
  activeRouteChapterId?: string;
  bookmarkedRouteStepId?: string | null;
  mapLayerMode?: MapLayerMode;
  lastSession?: LastSessionSnapshot | null;
}

export type WorkspaceViewMode = 'map' | 'route';

export type MapLayerMode = 'illustrated' | 'schematic';

export interface LastSessionSnapshot {
  updatedAt: string;
  lastActionLabel: string;
  regionId: string | null;
  chapterId: string | null;
  stepId?: string | null;
}

export interface AreaGuidePhase {
  id: string;
  title: string;
  era: 'child' | 'adult' | 'both';
  steps: string[];
  secretIds: string[];
}

export interface AreaWalkthroughGuide {
  regionId: string;
  tagline: string;
  recommendedVisitOrder: string;
  entrancesAndShortcuts: string[];
  phases: AreaGuidePhase[];
  bossStrategy?: {
    bossName: string;
    weakness: string;
    strategy: string;
  };
  proTips: string[];
}

export type RouteStepKind = 'story' | 'dungeon' | 'sweep' | 'boss' | 'quest' | 'switch2';

export interface RouteStep {
  id: string;
  title: string;
  regionId: string;
  era: Era;
  kind: RouteStepKind;
  instructions: string;
  proTip?: string;
  secretIds: string[];
  requiredIds?: string[];
  unlocksRequirementIds?: string[];
}

export interface RouteChapter {
  id: string;
  number: number;
  title: string;
  subtitle: string;
  era: 'child' | 'adult' | 'cross-era';
  primaryRegionId: string;
  estimatedMinutes: number;
  summary: string;
  steps: RouteStep[];
}

export type AccessStatus = 'completed' | 'available-now' | 'available-via-alt' | 'locked';

export type BlockerCategoryKind =
  | 'cross-era'
  | 'song'
  | 'gear'
  | 'wallet-milestone'
  | 'time-bug'
  | 'other';

export interface EvaluatedSecret {
  secret: UnifiedSecret;
  status: AccessStatus;
  missingPrimaryIds: string[];
  satisfiedAltMethods: AltMethod[];
  readyAltMethod?: AltMethod;
  primaryBlockerId?: string;
  primaryBlockerGroupKey: string;
  primaryBlockerLabel: string;
  primaryBlockerCategory: BlockerCategoryKind;
}

export interface RequirementBlockerBucket {
  key: string;
  label: string;
  category: BlockerCategoryKind;
  blockerRequirementId?: string;
  items: EvaluatedSecret[];
}

export type DrawerGroupMode = 'blocker' | 'tier' | 'type';

export type CollectibleTypeGroupKey =
  | 'heart-pieces'
  | 'gold-skulltulas'
  | 'bottles-fairies'
  | 'upgrades-gear'
  | 'songs-beans-quests';

export interface TierSecretBucket {
  key: GateTierId;
  tier: GateTierInfo;
  label: string;
  items: EvaluatedSecret[];
  allItems: EvaluatedSecret[];
}

export interface TypeSecretBucket {
  key: CollectibleTypeGroupKey;
  label: string;
  categories: SecretCategory[];
  items: EvaluatedSecret[];
  allItems: EvaluatedSecret[];
}

export interface CategorizedRegionSecrets {
  regionId: string;
  mode: DrawerGroupMode;
  readyNow: EvaluatedSecret[];
  lockedBuckets: RequirementBlockerBucket[];
  completed: EvaluatedSecret[];
  tierGroups: TierSecretBucket[];
  typeGroups: TypeSecretBucket[];
  allEvaluated: EvaluatedSecret[];
}

export interface RegionProgressSummary {
  regionId: string;
  completedCount: number;
  totalCount: number;
  readyNowCount: number;
  availableViaAltCount: number;
  lockedCount: number;
  percent: number;
  isComplete: boolean;
  heartPiecesCompleted: number;
  heartPiecesTotal: number;
  skulltulasChildCompleted: number;
  skulltulasChildTotal: number;
  skulltulasAdultCompleted: number;
  skulltulasAdultTotal: number;
  skulltulasCompleted: number;
  skulltulasTotal: number;
  switch2ItemCount: number;
}

export interface GlobalProgressSummary {
  completedCount: number;
  totalCount: number;
  allCompletedCount: number;
  allTotalCount: number;
  percent: number;
  isComplete: boolean;
  readyNowTotal: number;
  availableViaAltTotal: number;
  lockedTotal: number;
  heartPiecesCompleted: number;
  heartPiecesTotal: number;
  skulltulasCompleted: number;
  skulltulasTotal: number;
  skulltulasChildCompleted: number;
  skulltulasChildTotal: number;
  skulltulasAdultCompleted: number;
  skulltulasAdultTotal: number;
  bottlesCompleted: number;
  bottlesTotal: number;
  greatFairiesCompleted: number;
  greatFairiesTotal: number;
  songsCompleted: number;
  songsTotal: number;
  magicBeansCompleted: number;
  magicBeansTotal: number;
  completedRegionsCount: number;
  totalRegionsCount: number;
}

export interface UnlockDelta {
  newlyUnlocked: EvaluatedSecret[];
  byRegion: Record<string, EvaluatedSecret[]>;
  totalUnlocked: number;
  triggerLabel?: string;
}

export interface StoryPreset {
  id: string;
  label: string;
  shortLabel: string;
  description: string;
  eraFilter: 'all' | 'child' | 'adult';
  ownedRequirementIds: string[];
}

export type CompanionSheetId = 'ocarina' | 'quests' | 'diff' | 'search' | 'backup';

export interface UrlHashState {
  view?: WorkspaceViewMode;
  chapterId?: string | null;
  regionId: string | null;
  era: 'all' | 'child' | 'adult';
  sheet: string | null;
  spotlight: boolean;
}
