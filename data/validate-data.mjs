#!/usr/bin/env node
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const load = (file) => JSON.parse(readFileSync(join(__dirname, file), 'utf8'));

const metadata = load('metadata.json');
const requirements = load('requirements.json');
const regions = load('regions.json');
const heartPieces = load('heart-pieces.json');
const goldSkulltulas = load('gold-skulltulas.json');
const upgrades = load('upgrades-and-bottles.json');
const quests = load('songs-and-quests.json');

const errors = [];
const assert = (cond, msg) => {
  if (!cond) errors.push(msg);
};

// 1. Build canonical sets
const reqIds = new Set();
for (const r of requirements) {
  assert(!reqIds.has(r.id), `Duplicate requirement ID: ${r.id}`);
  reqIds.add(r.id);
}

const gateTierIds = new Set(metadata.gateTiers.map((t) => t.id));
const regionMap = new Map();
for (const reg of regions) {
  assert(!regionMap.has(reg.id), `Duplicate region ID: ${reg.id}`);
  regionMap.set(reg.id, reg);
}

for (const reg of regions) {
  if (reg.parentRegionId !== null) {
    assert(regionMap.has(reg.parentRegionId), `Region ${reg.id} has unknown parentRegionId ${reg.parentRegionId}`);
  }
  for (const conn of reg.connectedRegions) {
    assert(regionMap.has(conn), `Region ${reg.id} has unknown connectedRegion ${conn}`);
  }
}

// 2. Validate global counts against metadata.expectedCounts
const exp = metadata.expectedCounts;
const overworldRegions = regions.filter((r) => r.kind === 'overworld');
const specialAndDungeons = regions.filter((r) => r.kind !== 'overworld');

assert(overworldRegions.length === exp.overworldRegions, `Expected ${exp.overworldRegions} overworld regions, got ${overworldRegions.length}`);
assert(specialAndDungeons.length === exp.dungeonsAndSpecialAreas, `Expected ${exp.dungeonsAndSpecialAreas} dungeons/special areas, got ${specialAndDungeons.length}`);
assert(regions.length === exp.totalRegions, `Expected ${exp.totalRegions} total regions, got ${regions.length}`);
assert(heartPieces.length === exp.heartPieces, `Expected ${exp.heartPieces} Heart Pieces, got ${heartPieces.length}`);
assert(goldSkulltulas.length === exp.goldSkulltulasTotal, `Expected ${exp.goldSkulltulasTotal} Gold Skulltulas, got ${goldSkulltulas.length}`);
assert(upgrades.bottles.length === exp.emptyBottles, `Expected ${exp.emptyBottles} Bottles, got ${upgrades.bottles.length}`);
assert(upgrades.bigPoeLocations.length === exp.bigPoesTotal, `Expected ${exp.bigPoesTotal} Big Poes, got ${upgrades.bigPoeLocations.length}`);
assert(upgrades.greatFairies.length === exp.greatFairies, `Expected ${exp.greatFairies} Great Fairies, got ${upgrades.greatFairies.length}`);

const gfCost = upgrades.greatFairies.reduce((sum, g) => sum + g.rupeeCost, 0);
assert(gfCost === exp.greatFairyTotalRupeeCost, `Expected Great Fairy total cost ${exp.greatFairyTotalRupeeCost}, got ${gfCost}`);

assert(quests.ocarinaSongs.length === exp.ocarinaSongs, `Expected ${exp.ocarinaSongs} Ocarina Songs, got ${quests.ocarinaSongs.length}`);
assert(quests.magicBeans.length === exp.magicBeanLocations, `Expected ${exp.magicBeanLocations} Magic Beans, got ${quests.magicBeans.length}`);

const beanCost = quests.magicBeans.reduce((sum, b) => sum + b.buyCost, 0);
assert(beanCost === exp.magicBeanTotalRupeeCost, `Expected Magic Bean total cost ${exp.magicBeanTotalRupeeCost}, got ${beanCost}`);

assert(quests.happyMaskQuest.length === exp.happyMaskTrades, `Expected ${exp.happyMaskTrades} Happy Mask trades, got ${quests.happyMaskQuest.length}`);
assert(quests.biggoronSwordQuest.length === exp.biggoronTradeSteps, `Expected ${exp.biggoronTradeSteps} Biggoron steps, got ${quests.biggoronSwordQuest.length}`);
assert(Array.isArray(upgrades.bossHeartContainers) && upgrades.bossHeartContainers.length === exp.bossHeartContainers, `Expected ${exp.bossHeartContainers} Boss Heart Containers, got ${upgrades.bossHeartContainers?.length}`);
assert(Array.isArray(upgrades.storyTokens) && upgrades.storyTokens.length === 9, `Expected 9 Spiritual Stones & Sage Medallions, got ${upgrades.storyTokens?.length}`);
assert(Array.isArray(upgrades.ganonTrials) && upgrades.ganonTrials.length === 6, `Expected 6 Ganon's Castle Barrier Trials, got ${upgrades.ganonTrials?.length}`);
for (const stoneReq of ['stone-emerald', 'stone-ruby', 'stone-sapphire']) {
  assert(reqIds.has(stoneReq), `Missing story requirement ID: ${stoneReq}`);
}

// 3. Validate references & clean prose on all collectible records
const rawSlugLeakPattern = /\b(songs-and-quests\.json|upgrades-and-bottles\.json|heart-pieces\.json|gold-skulltulas\.json|(?:hp|gs|gf|skr)-\d{2,3}|eq-[a-z-]+|sw2-[a-z-]+)\b/i;
const seenItemIds = new Set();
const checkRecord = (item, label) => {
  if (item.id) {
    assert(!seenItemIds.has(item.id), `Duplicate item ID across datasets: ${item.id} (${label})`);
    seenItemIds.add(item.id);
  }
  assert(regionMap.has(item.regionId), `${label} (${item.id || item.step}) references unknown regionId: ${item.regionId}`);
  if (item.gateTier) {
    assert(gateTierIds.has(item.gateTier), `${label} (${item.id}) references unknown gateTier: ${item.gateTier}`);
  }
  if (item.requiredIds) {
    for (const req of item.requiredIds) {
      assert(reqIds.has(req), `${label} (${item.id}) references unknown requirementId: ${req}`);
    }
  }
  if (item.altMethods) {
    for (const alt of item.altMethods) {
      for (const req of alt.requiredIds) {
        assert(reqIds.has(req), `${label} (${item.id} alt) references unknown requirementId: ${req}`);
      }
    }
  }
  for (const proseKey of ['howToGet', 'notes', 'reward', 'description', 'instructions']) {
    if (typeof item[proseKey] === 'string') {
      assert(
        !rawSlugLeakPattern.test(item[proseKey]),
        `${label} (${item.id || item.step}) leaks raw slug or .json filename in ${proseKey}: ${item[proseKey]}`
      );
    }
  }
};

heartPieces.forEach((x) => checkRecord(x, 'HeartPiece'));
goldSkulltulas.forEach((x) => checkRecord(x, 'GoldSkulltula'));
upgrades.bottles.forEach((x) => checkRecord(x, 'Bottle'));
upgrades.bigPoeLocations.forEach((x) => checkRecord(x, 'BigPoe'));
upgrades.greatFairies.forEach((x) => checkRecord(x, 'GreatFairy'));
upgrades.skulltulaRewards.forEach((x) => checkRecord(x, 'SkulltulaReward'));
upgrades.capacityUpgrades.forEach((x) => checkRecord(x, 'CapacityUpgrade'));
upgrades.gearAndEquipment.forEach((x) => checkRecord(x, 'Equipment'));
upgrades.bossHeartContainers.forEach((x) => checkRecord(x, 'BossHeartContainer'));
upgrades.storyTokens.forEach((x) => checkRecord(x, 'StoryToken'));
upgrades.ganonTrials.forEach((x) => checkRecord(x, 'GanonTrial'));
quests.ocarinaSongs.forEach((x) => checkRecord({ ...x, id: `song-entry-${x.id}` }, 'OcarinaSong'));
quests.magicBeans.forEach((x) => checkRecord(x, 'MagicBean'));
quests.happyMaskQuest.forEach((x) => checkRecord({ ...x, id: `mask-step-${x.step}` }, 'HappyMask'));
quests.biggoronSwordQuest.forEach((x) => checkRecord({ ...x, id: `biggoron-step-${x.step}` }, 'BiggoronStep'));
quests.cowsAndKeyGrottos.forEach((x) => checkRecord(x, 'CowOrGrotto'));
quests.switch2Exclusives.forEach((x) => checkRecord(x, 'Switch2Exclusive'));

const ganonsCastleCount =
  upgrades.gearAndEquipment.filter((x) => x.regionId === 'ganons-castle').length +
  upgrades.ganonTrials.filter((x) => x.regionId === 'ganons-castle').length;
assert(ganonsCastleCount >= 7, `Expected ganons-castle to have >= 7 checkable cards, got ${ganonsCastleCount}`);

// 4. Verify per-region Heart Piece & Gold Skulltula tallies match regions.json 1-for-1
let overworldGsCount = 0;
let dungeonGsCount = 0;

for (const reg of regions) {
  const regHps = heartPieces.filter((h) => h.regionId === reg.id);
  const regGs = goldSkulltulas.filter((g) => g.regionId === reg.id);
  const regGsChild = regGs.filter((g) => g.era === 'child');
  const regGsAdult = regGs.filter((g) => g.era === 'adult');

  assert(
    regHps.length === reg.expectedTallies.heartPieces,
    `Region ${reg.id}: expected ${reg.expectedTallies.heartPieces} Heart Pieces, found ${regHps.length}`
  );
  assert(
    regGsChild.length === reg.expectedTallies.skulltulasChild,
    `Region ${reg.id}: expected ${reg.expectedTallies.skulltulasChild} Child Skulltulas, found ${regGsChild.length}`
  );
  assert(
    regGsAdult.length === reg.expectedTallies.skulltulasAdult,
    `Region ${reg.id}: expected ${reg.expectedTallies.skulltulasAdult} Adult Skulltulas, found ${regGsAdult.length}`
  );
  assert(
    regGs.length === reg.expectedTallies.skulltulasTotal,
    `Region ${reg.id}: expected ${reg.expectedTallies.skulltulasTotal} Total Skulltulas, found ${regGs.length}`
  );

  if (reg.kind === 'overworld') overworldGsCount += regGs.length;
  else dungeonGsCount += regGs.length;
}

assert(overworldGsCount === exp.goldSkulltulasOverworld, `Expected ${exp.goldSkulltulasOverworld} overworld Skulltulas, got ${overworldGsCount}`);
assert(dungeonGsCount === exp.goldSkulltulasDungeon, `Expected ${exp.goldSkulltulasDungeon} dungeon Skulltulas, got ${dungeonGsCount}`);

if (errors.length > 0) {
  console.error(`❌ Data validation failed with ${errors.length} error(s):`);
  for (const err of errors) console.error(`  - ${err}`);
  process.exit(1);
}

console.log('✅ ALL ZELDA: OCARINA OF TIME (SWITCH 2 REMAKE) DATA VALIDATED SUCCESSFULLY!');
console.log(`   - Regions:         ${regions.length} (${overworldRegions.length} Overworld + ${specialAndDungeons.length} Dungeons/Special)`);
console.log(`   - Requirements:    ${requirements.length} canonical gating keys across ${metadata.gateTiers.length} tiers`);
console.log(`   - Heart Pieces:    ${heartPieces.length} / ${exp.heartPieces}`);
console.log(`   - Gold Skulltulas: ${goldSkulltulas.length} / ${exp.goldSkulltulasTotal} (${overworldGsCount} Overworld + ${dungeonGsCount} Dungeons)`);
console.log(`   - Empty Bottles:   ${upgrades.bottles.length} / ${exp.emptyBottles} (+ ${upgrades.bigPoeLocations.length} Big Poe spawns)`);
console.log(`   - Great Fairies:   ${upgrades.greatFairies.length} (${gfCost} Rupees total)`);
console.log(`   - Ocarina Songs:   ${quests.ocarinaSongs.length} | Magic Beans: ${quests.magicBeans.length} (${beanCost} Rupees total)`);
console.log(`   - Upgrades/Gear:   ${upgrades.capacityUpgrades.length} Capacity + ${upgrades.gearAndEquipment.length} Equipment + ${upgrades.skulltulaRewards.length} Skulltula Milestones`);
