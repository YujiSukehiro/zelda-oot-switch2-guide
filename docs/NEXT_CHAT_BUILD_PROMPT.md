# First-Try-Guaranteed Build Prompt (Copy & Paste into Next Chat)

> **Tip before sending:** You can optionally start your next chat with `/goal` or `/boost` ahead of this prompt if you want extra autonomous persistence until every E2E check is green.

---

```markdown
Build the complete **Zelda: Ocarina of Time (Nintendo Switch 2 Remake, 2026) Interactive Map & Secrets Guide PWA** in `/Users/connor/Coding/Personal/Zelda` so that it works out-of-the-box on the very first attempt and deploys cleanly to **both Firebase Hosting and GitHub Pages**.

### 1. Read the Ground-Truth Specs & Data First (Do NOT Re-Research or Invent Game Data)
All research, Switch 2 Remake changes, architecture specs, and 100% verified canonical JSON datasets are already committed in this repository:
1. Read `docs/ARCHITECTURE.md`, `docs/DATA_SCHEMA.md`, and `docs/SWITCH2_REMAKE_BOOKLET.md`.
2. Run `node data/validate-data.mjs` to see the verified dataset counts (`34` Regions [21 Overworld + 13 Dungeons/Special], `66` Requirements across `6` Gate Tiers, `36` Pieces of Heart, `100` Gold Skulltulas [56 Overworld + 44 Dungeon], `5` Empty Bottles, `6` Great Fairies totaling `1,175` Rupees, `13` Ocarina Songs with Switch 2 `Y/X/A/R/L` inputs, `10` Magic Beans, `12` Biggoron steps, `4` Happy Mask trades, and Switch 2 exclusives like the Hall of Fallen Foes & cross-era Fairy's Thoughts puzzles).
3. **Data Rule:** Import `/data/*.json` directly via TypeScript (`resolveJsonModule: true`). Never hardcode, truncate, or omit any items from `/data/*.json`—every single secret in every file must be normalized and accessible in the UI.

### 2. Orchestrate via Native Swarm (`swarm` Skill) with Strict Ownership & QA Loop
Load and follow the `swarm` skill (`/Users/connor/.gemini/antigravity/builtin/skills/native_swarm/SKILL.md`). Act as the **Swarm Coordinator** (also spawn `monitor` if `swarm_monitor` is in your skill list, and `narrator` only if `swarm_narrator` is in your skill list). Keep worker boundaries collision-free:

- **Wave 1 — `foundation` Worker (`workspace: "inherit"`):**
  - Scaffold the Vite + React 19 + TypeScript (`strict: true`) + `vite-plugin-pwa` + `lucide-react` + `vitest` + `@testing-library/react` + `@playwright/test` project in `/Users/connor/Coding/Personal/Zelda` without overwriting `data/` or `docs/`.
  - Implement `src/types/zelda.ts`, `src/data/index.ts` (normalizing all records from `/data/*.json` into `UnifiedSecret[]` + lookups), `src/lib/gating.ts` (evaluating `completed` | `available-now` | `available-via-alt` | `locked`, computing `missingPrimaryIds`, grouping locked secrets by specific blocker requirement, auto-deriving `tokens-10`..`tokens-100` from checked Skulltulas and syncing checked gear/songs to `ownedRequirementIds`, plus calculating "What Just Unlocked?" deltas), `src/lib/storage.ts` (`localStorage` persistence + JSON export/import + `#region=...` hash routing), and `src/styles/tokens.css` (polished dark "Sheikah/Twilight" & light "Hyrule Parchment" themes).
  - Write comprehensive unit tests in `src/lib/gating.test.ts` verifying exact counts from `data/metadata.json`, Switch 2 cross-era puzzles (`hp-05`, `hp-06`, `gs-010`), early alternate tricks (`available-via-alt` like `hp-33`), auto-milestone derivation, and blocker grouping.
  - Ensure `npm run validate:data`, `npm run typecheck`, and `npm test` pass, then commit cleanly to git so Wave 2 workers share a warm, conflict-free baseline.

- **Wave 2 — Three Parallel Feature Workers (`workspace: "share"`, Zero Overlapping Files):**
  - **Mandatory Web Standards Rule for All UI Workers:** Before writing HTML/CSS/JS UI, run the `modern-web-guidance` skill CLI (`pnpx modern-web-guidance@latest search "<query>"` or `npx -y modern-web-guidance@latest search "<query>"`) for dialogs, popovers, container queries, dark mode, and accessible interactive controls, and apply retrieved best practices.
  - **`map-ui` Worker (`src/components/map/*`):**
    - Build the interactive `1000 × 700` illustrated topographic Hyrule SVG World Map using `data/regions.json` coordinates, biomes, and `connectedRegions` (distinguishing roads/bridges vs Lost Woods & Switch 2 thawed Zora's Domain diving shortcuts).
    - Render all 21 clickable Overworld Region nodes + 13 tethered Dungeon / Mini-Dungeon / Hall of Fallen Foes pins.
    - Display live per-region progress rings (`completed/total`, gold crest at 100%) AND an emerald `+N Ready` badge showing how many uncollected secrets in that region are `available-now` or `available-via-alt` right now.
    - Support smooth zoom/pan/reset, Era lens filter (`All` | `Child` | `Adult`), a `Switch 2 Changes Spotlight` filter, hover tooltips, and full keyboard/ARIA accessibility (`tabIndex={0}`, `Enter`/`Space`, descriptive `aria-label`s).
  - **`drawer-ui` Worker (`src/components/region/*`):**
    - Build the Region Dossier panel (right split-pane on desktop, responsive bottom sheet / `<dialog>` on mobile) when any region or dungeon is selected.
    - Render the Region Summary, Switch 2 in-game counter match (Heart Pieces + Child/Adult Skulltulas), quick-switch tabs between a parent Overworld region and its attached Dungeon(s) (e.g. `Kakariko Village` <-> `Bottom of the Well`), and a highlighted **Switch 2 Remake Highlights** callout box.
    - **Core UX Requirement — Requirement Categorization:** Default to grouping uncollected secrets into:
      1. **🟢 Ready to Grab Right Now** (`available-now` + `available-via-alt`, clearly badging early alternate tricks like Child Cucco glides vs Adult Hookshot!).
      2. **🔒 Locked Behind Specific Requirements** — cleanly sub-grouped into collapsible sections by what blocks them (*Cross-Era Time-Travel Puzzles* with Step 1/Step 2 badges, *Needs [Specific Song]*, *Needs [Specific Gear/Item]*, *Needs Adult's Wallet [500 Rupees]*, *Nighttime / Bottled Bugs*).
      3. **✅ Completed** (collapsible at bottom).
    - Also provide 1-click switcher pills to view by **Canonical Tiers (Tiers 0–5)** or **Collectible Type** (Heart Pieces, Gold Skulltulas, Bottles & Fairies, Upgrades & Gear, Songs/Beans/Quests).
    - Make every Requirement Chip interactive: green if owned, amber/red if missing; clicking any requirement chip opens a popover showing **exact instructions on how to get that item/song** (`howToGet` from `requirements.json`, plus Switch 2 `Y/X/A/R/L` button badges for songs!) and a **"Jump to Region"** button.
  - **`sheets-pwa` Worker (`src/components/sheets/*`, `public/*`, `vite.config.ts`, `firebase.json`, `.github/workflows/deploy-pages.yml`):**
    - Build the **My Loadout & Progression Dock** with 1-tap toggles for Era, Gear, Songs, and Wallets, **Story Checkpoint Presets** (*Fresh Start*, *Post-Dodongo*, *3 Spiritual Stones*, *Fresh Adult + Hookshot*, *Post-Forest Temple / Time Travel*, *Post-Water Temple / Thawed Zora*, *Endgame*), and a **"What Just Unlocked?"** toast/drawer listing newly accessible secrets whenever an item is toggled ON.
    - Build Companion Reference Modals: (1) **Switch 2 Ocarina Songbook** (`Y/X/A/R/L` visual controller badges + saved custom 8-note Scarecrow's Song input), (2) **Biggoron's Sword (12 Steps w/ 4:00, 2:30, 3:30 timers & Switch 2 thawed Zora shortcut) + Happy Mask Tracker**, (3) **Switch 2 Remake Master Diff & Economy Sheet** (5 Bottles, 6 Great Fairies = 1,175 Rupees, 10 Magic Beans = 550 Rupees, Hall of Fallen Foes 84 statues), (4) **Global Instant Search (`Cmd+K` / `/`)**, and (5) **Progress Backup (JSON Export / Import + Reset with confirmation)**.
    - Generate crisp custom SVG + PNG PWA icons (`192x192`, `512x512`, `maskable`), configure `vite-plugin-pwa` with `base: './'` and relative `start_url: './'` / `scope: './'`, and write both `firebase.json` and `.github/workflows/deploy-pages.yml` so the exact same `dist/` works at `/` (Firebase Hosting) and `/<repo>/` (GitHub Pages).

- **Wave 3 — Integration + Dedicated `qa-verifier` Worker (`workspace: "inherit"`):**
  - Merge all three Wave 2 worker branches cleanly, wire `src/App.tsx` and `src/main.tsx`, and assign a dedicated **`qa-verifier`** worker (who reports issues to authors rather than editing `src/` concurrently) to build `e2e/app.spec.ts` and verify EVERY quality gate.

### 3. Mandatory Verification & QA Gates (Do NOT Finish Until All 6 Are 100% Green)
1. `npm run validate:data` passes (`0` errors across all JSON files).
2. `npm run typecheck` (`tsc --noEmit`) passes with `0` errors.
3. `npm test` (Vitest) passes 100% of unit tests.
4. `npm run build` succeeds, producing `dist/index.html`, `dist/manifest.webmanifest`, and `dist/sw.js` with **strictly relative asset paths** (no broken root `/assets/...` paths that would 404 on GitHub Pages).
5. **Dual-Hosting Subpath + Root E2E Verification (`npm run test:e2e` with Playwright Chromium):**
   - Serve `dist/` both at `/` (Firebase Hosting simulation) AND under `/Zelda/` subpath (GitHub Pages simulation) and prove in automated Playwright tests that:
     - All 21 Overworld regions and 13 Dungeon/Special pins render and are clickable/keyboard-focusable.
     - Clicking **Hyrule Field**, **Kakariko Village**, and **Death Mountain Crater** opens the Region Dossier showing Switch 2 Remake highlights, **Ready Right Now** secrets separated from **Locked Behind Specific Requirements** buckets, and working Dungeon sub-tabs.
     - Checking off a secret updates regional & global completion percentages and persists across page reload.
     - Toggling `Hookshot` or `Bombs` in Loadout dynamically moves locked secrets into **Ready Right Now** and surfaces the unlock count.
     - Clicking a Song requirement pill displays its Switch 2 `Y/X/A/R/L` notes; `Cmd+K` search finds `"Golden Bug"` (5th Bottle) and `"Echo Gem"` and jumps to their regions.
     - Both Desktop (`1440×900`) and Mobile (`390×844`) viewports have **zero** console errors, **zero** uncaught page errors, **zero** failed network requests, and **zero** horizontal overflow.
6. Capture desktop and mobile screenshots of the finished interactive map, a populated Region Dossier showing categorized requirement locks, and the Ocarina/Loadout views, and summarize deployment commands for both Firebase Hosting and GitHub Pages.
```
