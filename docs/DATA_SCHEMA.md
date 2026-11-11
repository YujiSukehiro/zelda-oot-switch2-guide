# Data Schema & Requirement Gating Specification

All canonical game content for *The Legend of Zelda: Ocarina of Time (Switch 2 Remake)* lives in `/data/*.json` and is verified by `node data/validate-data.mjs`. **Do not duplicate, hardcode, or rewrite collectible entries in UI components**—the PWA must import `/data/*.json` directly through a typed normalization layer (`src/data/index.ts`).

---

## 1. Source Files in `/data/`

| File | Records | Purpose |
| :--- | :--- | :--- |
| `data/metadata.json` | Singleton | Game metadata, `expectedCounts` assertions, canonical `gateTiers` (Tiers 0–5), and Switch 2 button mappings. |
| `data/requirements.json` | 66 items | Canonical dictionary of every gating requirement (`era`, `time`, `story`, `gear`, `item`, `quest`, `upgrade`, `economy`, `milestone`, `song`). |
| `data/regions.json` | 34 regions | 21 Overworld regions + 13 Dungeons/Mini-Dungeons/Special Hubs, normalized `(x, y)` coordinates on a `1000x700` Hyrule canvas, `connectedRegions`, `parentRegionId`, `expectedTallies`, and `switch2Highlights`. |
| `data/heart-pieces.json` | 36 items | All 36 Switch 2 Remake Pieces of Heart (`hp-01`..`hp-36`), including `altMethods` and `switch2Status`. |
| `data/gold-skulltulas.json` | 100 items | All 100 Gold Skulltulas (`gs-001`..`gs-100`: 56 Overworld + 44 Dungeon). |
| `data/upgrades-and-bottles.json` | 49 items | `bottles` (5), `bigPoeLocations` (10), `greatFairies` (6 w/ Rupee costs), `skulltulaRewards` (6), `capacityUpgrades` (10), `gearAndEquipment` (12). |
| `data/songs-and-quests.json` | 47 items | `ocarinaSongs` (13 w/ Switch 2 button combos), `magicBeans` (10 w/ prices), `happyMaskQuest` (4), `biggoronSwordQuest` (12 w/ timers), `cowsAndKeyGrottos` (5), `switch2Exclusives` (3). |
| `data/validate-data.mjs` | CLI Script | Zero-dependency integrity validator verifying counts, regional tallies, unique IDs, and foreign keys. |

---

## 2. Unified TypeScript Domain Types (`src/types/zelda.ts`)

```ts
export type Era = 'child' | 'adult' | 'both' | 'cross-era';

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

/**
 * Normalized item consumed by the Region Drawer, Map Badges, Search, and Unlock Feed.
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
}
```

---

## 3. Requirement Gating & Categorization Engine (`src/lib/gating.ts`)

This is the core logic answering the user's requirement: *"click on a region and it has all the secrets I should do and for ones locked behind a specific req, it has those categorized differently."*

### 3.1 Player Progression State

```ts
export interface PlayerProgressState {
  version: 1;
  /** Completed secret IDs (e.g. "hp-01", "gs-014", "bottle-01") */
  completedSecretIds: Record<string, boolean>;
  /** Owned/unlocked requirement IDs from requirements.json */
  ownedRequirementIds: Record<string, boolean>;
  /** Active Era filter on map/drawer: 'all' | 'child' | 'adult' */
  activeEraFilter: 'all' | 'child' | 'adult';
  /** Whether Loadout-Aware Dynamic Gating is enabled (default: true, with baseline Child gear pre-seeded) */
  loadoutModeEnabled: boolean;
  /** Optional custom 8-note Scarecrow's Song saved by the user! */
  customScarecrowNotes: string;
}
```

### 3.2 Automatic Milestone Derivation

Whenever `completedSecretIds` changes, automatically derive token milestones in `ownedRequirementIds` so the user never has to toggle token counts manually:
- Count completed `gs-001`..`gs-100` -> `skulltulaCount`:
  - `>= 10` automatically satisfies `tokens-10` (and prompts/marks `adults-wallet` once `skr-10` is checked)
  - `>= 20` -> `tokens-20`
  - `>= 30` -> `tokens-30`
  - `>= 40` -> `tokens-40`
  - `>= 50` -> `tokens-50`
  - `=== 100` -> `tokens-100`
- Checking an equipment/song/bottle secret (e.g., `eq-hookshot`, `song-storms`, `bottle-01`) automatically toggles the corresponding `requirementId` (`hookshot`, `song-storms`, `bottle`) in `ownedRequirementIds`!

### 3.3 Evaluating Accessibility & Grouping Locked Items

```ts
export type AccessStatus =
  | 'completed'
  | 'available-now'      // Primary requiredIds are 100% satisfied
  | 'available-via-alt'  // Primary is locked, but >= 1 altMethod has 100% satisfied requiredIds
  | 'locked';            // Missing >= 1 requiredId on primary and all altMethods

export interface EvaluatedSecret {
  secret: UnifiedSecret;
  status: AccessStatus;
  missingPrimaryIds: string[];     // Exact requirementIds still needed
  readyAltMethod?: AltMethod;      // Populated when status === 'available-via-alt'
  primaryBlockerGroupKey: string;  // Used to group locked items cleanly!
}
```

#### Grouping Rules Inside Any Region Drawer
1. **Grouping Mode A — "By Accessibility & Specific Blocker" (Default):**
   - **Section 1: `Ready Right Now`** (`available-now` + `available-via-alt`, badged clearly if using an early trick like Cucco-glide!)
   - **Section 2..N: `Locked Behind Specific Requirements` — Sub-grouped by Primary Blocker Category:**
     - Determine each locked item's highest-priority missing requirement (ignoring trivial `era-child` / `rupees-100` when a harder dungeon item/song is also missing) so locked items cluster into intuitive, actionable buckets:
       - *"Locked: Cross-Era Time Travel Puzzle"* (`time-travel` or `gateTier === 'tier-4-cross-era'`)
       - *"Locked: Needs Ocarina Song — [Song Name]"* (`category === 'song'`)
       - *"Locked: Needs [Specific Gear/Item — e.g. Hookshot, Bombs, Boomerang, Megaton Hammer, Iron Boots, Lens of Truth]"*
       - *"Locked: Needs Adult's Wallet (500 Rupees) / Token Milestone"*
       - *"Locked: Needs Nighttime / Bottled Bugs"*
   - **Final Collapsible Section: `Completed (X)`** (dimmed, collapsible so finished secrets stay out of your way).
2. **Grouping Mode B — "By Progression Tier (Tiers 0–5)":**
   - Cleanly renders the 6 canonical `gateTiers` from `metadata.json` (`Immediate` → `Night/Bugs/Rupees` → `Song Gate` → `Child Gear` → `Cross-Era` → `Adult Gear`), ideal when browsing without tracking inventory.
3. **Grouping Mode C — "By Collectible Type":**
   - Groups into `Pieces of Heart`, `Gold Skulltulas`, `Bottles & Great Fairies`, `Upgrades & Gear`, and `Songs, Beans & Side Quests`.
