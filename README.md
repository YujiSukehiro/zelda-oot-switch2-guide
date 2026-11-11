# Zelda: Ocarina of Time (Switch 2 Remake) — Interactive Map & Secrets PWA

Complete research dataset, master companion booklet, technical architecture, and multi-agent swarm build specification for an offline-first Progressive Web App covering ***The Legend of Zelda: Ocarina of Time* (Nintendo Switch 2 Remake — Released November 5, 2026)**.

---

## Repository Contents

| Path | Description |
| :--- | :--- |
| [`docs/SWITCH2_REMAKE_BOOKLET.md`](docs/SWITCH2_REMAKE_BOOKLET.md) | **Master Companion Booklet** detailing all 2026 Switch 2 Remake changes vs. N64/3DS (5th Bottle, Echo Gem, 200/500/1000 Wallets, Great Fairy Rupee offerings, 3 relocated cross-era/Scrub Heart Pieces, thawed Zora's Domain, Hall of Fallen Foes, Threads of Time, Zelda Notes, and Switch 2 `Y/X/A/R/L` Ocarina Songbook). |
| [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) | **PWA Technical & UX Architecture** covering the interactive `1000×700` Hyrule SVG map, Region Dossier requirement-gating categorization, Loadout & Unlock-Delta UX, offline Workbox PWA configuration, dual **Firebase Hosting + GitHub Pages** compatibility (`base: './'`), and collision-free Swarm file ownership. |
| [`docs/DATA_SCHEMA.md`](docs/DATA_SCHEMA.md) | **TypeScript Schema & Gating Engine Spec** defining `UnifiedSecret`, auto-derived Gold Skulltula milestones, alternate early-method resolution (`available-via-alt`), and requirement-blocker grouping rules. |
| [`docs/NEXT_CHAT_BUILD_PROMPT.md`](docs/NEXT_CHAT_BUILD_PROMPT.md) | **Turnkey Next-Chat Build Prompt** engineered with staged Native Swarm orchestration + automated Vitest & Playwright QA gates for guaranteed first-try completion. |
| [`data/metadata.json`](data/metadata.json) | Canonical game constants, expected 100% completion counts, 6 Requirement Gate Tiers, and Switch 2 control mappings. |
| [`data/requirements.json`](data/requirements.json) | All **66** canonical gating keys (`era`, `time`, `story`, `gear`, `item`, `quest`, `upgrade`, `economy`, `milestone`, `song`) with acquisition guides. |
| [`data/regions.json`](data/regions.json) | All **34** areas (**21 Overworld Regions** + **13 Dungeons / Mini-Dungeons / Hall of Fallen Foes**) with map coordinates, biome tags, connections, expected tallies, and Switch 2 highlights. |
| [`data/heart-pieces.json`](data/heart-pieces.json) | All **36** Switch 2 Remake Pieces of Heart (`hp-01`–`hp-36`) including primary gates, early alternate methods, and the 3 new/relocated 2026 pieces. |
| [`data/gold-skulltulas.json`](data/gold-skulltulas.json) | All **100** Gold Skulltulas (**56 Overworld** + **44 Dungeon**, `gs-001`–`gs-100`) reconciled 1-for-1 with Switch 2 regional Child/Adult map counters. |
| [`data/upgrades-and-bottles.json`](data/upgrades-and-bottles.json) | All **5 Empty Bottles** (+ 10 Big Poe spawns), **6 Great Fairies** (`1,175 Rupees`), **6 Skulltula Rewards** (incl. Echo Gem), **10 Capacity Upgrades**, and **12 Core Equipment unlocks**. |
| [`data/songs-and-quests.json`](data/songs-and-quests.json) | All **13 Ocarina Songs** (Switch 2 button combos), **10 Magic Bean plots** (`550 Rupees`), **4 Happy Mask trades**, **12 Biggoron's Sword timed steps**, **5 Cow/Fairy grottos**, and **3 Switch 2 Exclusive systems**. |
| [`data/validate-data.mjs`](data/validate-data.mjs) | Zero-dependency Node.js validator verifying 100% of counts, regional tallies, unique IDs, and requirement foreign keys. |

---

## Verify Canonical Datasets

```bash
node data/validate-data.mjs
```
