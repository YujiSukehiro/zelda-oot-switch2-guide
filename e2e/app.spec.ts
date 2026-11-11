import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { expect, test, type Locator, type Page } from '@playwright/test';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DIST_DIR = path.resolve(__dirname, '..', 'dist');

const DEFAULT_COORDINATOR_ARTIFACT_DIR =
  '/Users/connor/.gemini/antigravity/brain/6888419f-6808-4df7-b370-7872f82dde88';

const DEPLOY_TARGETS = [
  {
    name: 'Firebase Hosting Root (/)',
    baseUrl: 'http://127.0.0.1:4173/',
    expectedPathname: '/',
  },
  {
    name: 'GitHub Pages Strict Subpath (/Zelda/)',
    baseUrl: 'http://127.0.0.1:4174/Zelda/',
    expectedPathname: '/Zelda/',
  },
] as const;

interface TelemetryLog {
  consoleErrors: string[];
  pageErrors: string[];
  badResponses: string[];
  failedRequests: string[];
  assertClean: () => void;
}

function attachZeroErrorTelemetry(page: Page): TelemetryLog {
  const consoleErrors: string[] = [];
  const pageErrors: string[] = [];
  const badResponses: string[] = [];
  const failedRequests: string[] = [];

  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });

  page.on('pageerror', (err) => {
    pageErrors.push(err.stack || err.message);
  });

  page.on('response', (res) => {
    if (res.status() >= 400) {
      badResponses.push(`${res.status()} ${res.url()}`);
    }
  });

  page.on('requestfailed', (req) => {
    const errText = req.failure()?.errorText ?? 'unknown network failure';
    failedRequests.push(`${errText} ${req.url()}`);
  });

  return {
    consoleErrors,
    pageErrors,
    badResponses,
    failedRequests,
    assertClean: () => {
      expect(consoleErrors, 'Expected zero console.error messages').toEqual([]);
      expect(pageErrors, 'Expected zero uncaught pageerror exceptions').toEqual([]);
      expect(badResponses, 'Expected zero HTTP 4xx/5xx responses').toEqual([]);
      expect(failedRequests, 'Expected zero failed network requests').toEqual([]);
    },
  };
}

async function assertZeroHorizontalOverflow(page: Page, contextLabel: string): Promise<void> {
  const metrics = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    innerWidth: window.innerWidth,
  }));
  expect(
    metrics.scrollWidth,
    `Horizontal overflow detected during "${contextLabel}" (scrollWidth=${metrics.scrollWidth}, innerWidth=${metrics.innerWidth})`,
  ).toBeLessThanOrEqual(metrics.innerWidth);
}

async function dismissCatchUpIfOpen(page: Page): Promise<void> {
  const modal = page.getByTestId('catch-up-modal');
  if ((await modal.count()) > 0 && (await modal.isVisible())) {
    await page.getByTestId('catchup-cancel-btn').click();
    await expect(modal).toHaveCount(0);
  }
}

async function ensureLoadoutOpen(page: Page, shouldBeOpen: boolean): Promise<void> {
  const dock = page.getByTestId('loadout-dock');
  await expect(dock).toBeVisible();
  const isOpen = (await dock.getAttribute('data-open')) === 'true';
  if (isOpen !== shouldBeOpen) {
    await page.getByTestId('loadout-dock-expand-btn').click();
    await expect(dock).toHaveAttribute('data-open', shouldBeOpen ? 'true' : 'false');
  }
}

async function openReferenceSheet(
  page: Page,
  btnTestId:
    | 'open-ocarina-btn'
    | 'open-quests-btn'
    | 'open-foes-btn'
    | 'open-reference-btn'
    | 'open-diff-btn'
    | 'open-backup-btn',
): Promise<void> {
  const refMenu = page.getByTestId('reference-menu');
  const isOpen = await refMenu.evaluate((el) => (el as HTMLDetailsElement).open);
  if (!isOpen) {
    await page.getByTestId('open-reference-menu-btn').click();
  }
  await page.getByTestId(btnTestId).click();
}

async function ensureCardExpanded(card: Locator, secretId: string): Promise<void> {
  await expect(card).toBeVisible();
  const isExpanded = (await card.getAttribute('data-expanded')) === 'true';
  if (!isExpanded) {
    await card.getByTestId(`secret-expand-btn-${secretId}`).click();
    await expect(card).toHaveAttribute('data-expanded', 'true');
  }
}

test.describe('Static Build Artifacts & Strict Subpath Server Guard', () => {
  test('dist/index.html, dist/manifest.webmanifest, and dist/sw.js exist with strictly relative asset paths', async ({
    request,
  }) => {
    const indexHtmlPath = path.join(DIST_DIR, 'index.html');
    const manifestPath = path.join(DIST_DIR, 'manifest.webmanifest');
    const swPath = path.join(DIST_DIR, 'sw.js');

    expect(fs.existsSync(indexHtmlPath), 'dist/index.html must exist').toBe(true);
    expect(fs.existsSync(manifestPath), 'dist/manifest.webmanifest must exist').toBe(true);
    expect(fs.existsSync(swPath), 'dist/sw.js must exist').toBe(true);

    const indexHtml = fs.readFileSync(indexHtmlPath, 'utf8');
    // Every href/src in dist/index.html must be relative (no leading single slash '/')
    const rootEscapedAttrs = [...indexHtml.matchAll(/\b(?:src|href)=["'](\/(?!\/)[^"']*)["']/g)];
    expect(
      rootEscapedAttrs.map((m) => m[0]),
      'dist/index.html must not contain root-anchored src="/..." or href="/..." attributes',
    ).toEqual([]);
    expect(indexHtml).toContain('./assets/');
    expect(indexHtml).toContain('manifest.webmanifest');

    const manifestRaw = fs.readFileSync(manifestPath, 'utf8');
    const manifest = JSON.parse(manifestRaw) as {
      start_url?: string;
      scope?: string;
      icons?: Array<{ src: string }>;
    };
    expect(manifest.start_url).toBe('./');
    expect(manifest.scope).toBe('./');
    expect(manifest.icons && manifest.icons.length).toBeGreaterThanOrEqual(3);
    for (const icon of manifest.icons ?? []) {
      expect(
        icon.src.startsWith('/'),
        `Manifest icon "${icon.src}" must not start with "/"`,
      ).toBe(false);
    }

    const swContent = fs.readFileSync(swPath, 'utf8');
    expect(swContent.length).toBeGreaterThan(200);
    expect(swContent).toContain('index.html');
    expect(swContent).toContain('icons/icon-192.png');
    expect(swContent).toContain('maps/hyrule-illustrated.jpg');
    expect(swContent).toContain('maps/regions/kokiri-forest.jpg');
    expect(swContent).toContain('maps/regions/desert-colossus.jpg');
    expect(swContent).not.toContain('"/assets/');

    // Confirm port 4174 strictly returns HTTP 404 for root-escaped paths outside /Zelda/*
    const rootOnSubpathServer = await request.get('http://127.0.0.1:4174/');
    expect(rootOnSubpathServer.status()).toBe(404);

    const escapedManifest = await request.get('http://127.0.0.1:4174/manifest.webmanifest');
    expect(escapedManifest.status()).toBe(404);

    const escapedFavicon = await request.get('http://127.0.0.1:4174/favicon.svg');
    expect(escapedFavicon.status()).toBe(404);

    const validSubpathIndex = await request.get('http://127.0.0.1:4174/Zelda/');
    expect(validSubpathIndex.status()).toBe(200);
  });
});

for (const target of DEPLOY_TARGETS) {
  test.describe(`Dual-Hosting E2E Verification — ${target.name}`, () => {
    test('renders all 21 Overworld regions and 13 Dungeon/Special pins (34 total) with click & keyboard Enter/Space support', async ({
      page,
    }) => {
      const telemetry = attachZeroErrorTelemetry(page);
      await page.setViewportSize({ width: 1440, height: 900 });
      await page.goto(target.baseUrl, { waitUntil: 'networkidle' });
      await dismissCatchUpIfOpen(page);

      await expect(page.getByTestId('hyrule-map-canvas')).toBeVisible();

      const allNodes = page.locator('[data-testid^="map-node-"][data-region-kind]');
      const overworldNodes = page.locator('[data-testid^="map-node-"][data-region-kind="overworld"]');
      const dungeonAndSpecialPins = page.locator(
        '[data-testid^="map-node-"][data-region-kind="dungeon"], ' +
          '[data-testid^="map-node-"][data-region-kind="mini-dungeon"], ' +
          '[data-testid^="map-node-"][data-region-kind="special"]',
      );

      await expect(allNodes).toHaveCount(34);
      await expect(overworldNodes).toHaveCount(21);
      await expect(dungeonAndSpecialPins).toHaveCount(13);

      // Verify all 34 nodes have role="button", tabIndex=0, aria-label, and non-zero rendered bounds
      const nodeAudit = await allNodes.evaluateAll((elements) =>
        elements.map((el) => {
          const rect = el.getBoundingClientRect();
          return {
            testId: el.getAttribute('data-testid'),
            role: el.getAttribute('role'),
            tabIndex: (el as HTMLElement | SVGElement).tabIndex,
            ariaLabel: el.getAttribute('aria-label') ?? '',
            width: rect.width,
            height: rect.height,
          };
        }),
      );

      expect(nodeAudit).toHaveLength(34);
      for (const item of nodeAudit) {
        expect(item.role, `${item.testId} role`).toBe('button');
        expect(item.tabIndex, `${item.testId} tabIndex`).toBe(0);
        expect(item.ariaLabel.length, `${item.testId} aria-label`).toBeGreaterThan(5);
        expect(item.width, `${item.testId} width`).toBeGreaterThan(0);
        expect(item.height, `${item.testId} height`).toBeGreaterThan(0);
      }

      // Collapse loadout dock if open so no bottom dock overlaps southern map pins during click checks
      await ensureLoadoutOpen(page, false);

      // Keyboard focus + Enter on an Overworld node (Kokiri Forest)
      const kokiriNode = page.getByTestId('map-node-kokiri-forest');
      await kokiriNode.focus();
      await expect(kokiriNode).toBeFocused();
      await page.keyboard.press('Enter');

      const dossier = page.getByTestId('region-dossier');
      await expect(dossier).toBeVisible();
      await expect(dossier.getByRole('heading', { level: 2, name: 'Kokiri Forest' })).toBeVisible();
      expect(new URL(page.url()).pathname).toBe(target.expectedPathname);
      expect(new URL(page.url()).hash).toContain('region=kokiri-forest');

      // Keyboard focus + Space on a Dungeon pin (Inside the Great Deku Tree)
      const dekuPin = page.getByTestId('map-node-deku-tree');
      await dekuPin.focus();
      await expect(dekuPin).toBeFocused();
      await page.keyboard.press(' ');
      await expect(
        dossier.getByRole('heading', { level: 2, name: 'Inside the Great Deku Tree' }),
      ).toBeVisible();
      expect(new URL(page.url()).hash).toContain('region=deku-tree');

      // Pointer click on Hall of Fallen Foes special pin
      await page.getByTestId('map-node-hall-of-fallen-foes').click();
      await expect(
        dossier.getByRole('heading', { level: 2, name: /Hall of Fallen Foes/i }),
      ).toBeVisible();

      telemetry.assertClean();
    });

    test('enforces Fresh Start Kokiri reachability lock on Hyrule Field while marking gs-001 Ready Now with Night Only badge', async ({
      page,
    }) => {
      const telemetry = attachZeroErrorTelemetry(page);
      await page.setViewportSize({ width: 1440, height: 900 });
      await page.goto(target.baseUrl, { waitUntil: 'networkidle' });
      await page.evaluate(() => window.localStorage.clear());
      await page.reload({ waitUntil: 'networkidle' });

      // Catch-Up Wizard auto-prompts on clean unconfigured visit; select Fresh Start on World Map
      const catchUpModal = page.getByTestId('catch-up-modal');
      await expect(catchUpModal).toBeVisible();
      await catchUpModal.getByTestId('catchup-style-map').click();
      await catchUpModal.getByTestId('catchup-preset-fresh-start').click();
      await catchUpModal.getByTestId('catchup-apply-btn').click();
      await expect(catchUpModal).toHaveCount(0);

      // Kokiri Forest is immediately open & reachable
      const dossier = page.getByTestId('region-dossier');
      await expect(dossier.getByRole('heading', { level: 2, name: 'Kokiri Forest' })).toBeVisible();
      await expect(page.getByTestId('dossier-reachability-banner')).toHaveCount(0);

      // Equip Kokiri Sword (eq-kokiri-sword is Ready Right Now in Kokiri Forest) so gs-001 is Ready Now with Night Only tag!
      await page.getByTestId('secret-check-eq-kokiri-sword').click();
      const readyKokiri = page.getByTestId('section-ready-now');
      const gs001Card = readyKokiri.getByTestId('secret-card-gs-001');
      await expect(gs001Card).toBeVisible();
      await expect(gs001Card.getByTestId('env-chip-gs-001-night')).toContainText('Night Only');

      // Clicking Hyrule Field before clearing Great Deku Tree shows reachability lock banner
      await page.getByTestId('map-node-hyrule-field').click();
      await expect(dossier.getByRole('heading', { level: 2, name: 'Hyrule Field' })).toBeVisible();
      await expect(page.getByTestId('dossier-reachability-banner')).toContainText(
        'Clear Inside the Great Deku Tree to leave Kokiri Forest',
      );

      telemetry.assertClean();
    });

    test('Catch-Up Wizard syncs "Goron City — 1st Visit", opens 4-floor Goron City blueprint (4F–1F), and switches cleanly across all 3 Guided lenses', async ({
      page,
    }) => {
      const telemetry = attachZeroErrorTelemetry(page);
      await page.setViewportSize({ width: 1440, height: 900 });
      await page.goto(target.baseUrl, { waitUntil: 'networkidle' });
      await page.evaluate(() => window.localStorage.clear());
      await page.reload({ waitUntil: 'networkidle' });

      // Use Catch-Up Wizard -> "Goron City — 1st Visit" with Guided Co-Pilot + Floor Maps
      const catchUpModal = page.getByTestId('catch-up-modal');
      await expect(catchUpModal).toBeVisible();
      await catchUpModal.getByTestId('catchup-style-guided').click();
      await catchUpModal.getByTestId('catchup-preset-goron-city-visit-1').click();
      await catchUpModal.getByTestId('catchup-apply-btn').click();
      await expect(catchUpModal).toHaveCount(0);

      // Lands directly in #view=area&region=goron-city&lens=copilot
      expect(new URL(page.url()).pathname).toBe(target.expectedPathname);
      expect(new URL(page.url()).hash).toContain('view=area');
      expect(new URL(page.url()).hash).toContain('region=goron-city');
      expect(new URL(page.url()).hash).toContain('lens=copilot');

      const workspace = page.getByTestId('guided-area-workspace');
      await expect(workspace).toBeVisible();
      await assertZeroHorizontalOverflow(page, 'Desktop 1440×900 Goron City Guided Workspace');

      // Verify Goron City's 4-floor blueprint tabs (4F, 3F, 2F, 1F) render and switch cleanly
      const submapSlot = page.getByTestId('guided-submap-slot');
      const tab4F = submapSlot.getByRole('tab', { name: /4F/i });
      const tab3F = submapSlot.getByRole('tab', { name: /3F/i });
      const tab2F = submapSlot.getByRole('tab', { name: /2F/i });
      const tab1F = submapSlot.getByRole('tab', { name: /1F/i });
      await expect(tab4F).toBeVisible();
      await expect(tab3F).toBeVisible();
      await expect(tab2F).toBeVisible();
      await expect(tab1F).toBeVisible();

      await tab4F.click();
      await expect(tab4F).toHaveAttribute('aria-selected', 'true');
      await tab3F.click();
      await expect(tab3F).toHaveAttribute('aria-selected', 'true');
      await tab2F.click();
      await expect(tab2F).toHaveAttribute('aria-selected', 'true');
      await tab1F.click();
      await expect(tab1F).toHaveAttribute('aria-selected', 'true');

      // Lens 1 (Co-Pilot GPS) shows focused step + "Save for Later Visits" tucking post-Bomb/Adult items
      const copilotPanel = page.getByTestId('guided-tabpanel-copilot');
      await expect(copilotPanel).toBeVisible();
      await expect(copilotPanel).toContainText(/Save for Later Visits/i);

      // Switch to Lens 2 (Room Explorer + Unlock Radar)
      await page.getByTestId('guided-lens-tab-rooms').click();
      expect(new URL(page.url()).hash).toContain('lens=rooms');
      await expect(page.getByTestId('guided-tabpanel-rooms')).toBeVisible();
      await expect(page.getByTestId('guided-tabpanel-copilot')).toBeHidden();

      // Switch to Lens 3 (Quest & Dependency Flow)
      await page.getByTestId('guided-lens-tab-quests').click();
      expect(new URL(page.url()).hash).toContain('lens=quests');
      await expect(page.getByTestId('guided-tabpanel-quests')).toBeVisible();
      await expect(page.getByTestId('guided-tabpanel-rooms')).toBeHidden();

      // Switch back to Lens 1 (Co-Pilot GPS)
      await page.getByTestId('guided-lens-tab-copilot').click();
      expect(new URL(page.url()).hash).toContain('lens=copilot');
      await expect(copilotPanel).toBeVisible();

      telemetry.assertClean();
    });

    test('completing Optimal Route story steps unlocks unlocksRequirementIds on the World Map, and ganons-castle has >0 checkable items', async ({
      page,
    }) => {
      const telemetry = attachZeroErrorTelemetry(page);
      await page.setViewportSize({ width: 1440, height: 900 });
      await page.goto(target.baseUrl, { waitUntil: 'networkidle' });
      await page.evaluate(() => window.localStorage.clear());
      await page.reload({ waitUntil: 'networkidle' });
      await dismissCatchUpIfOpen(page);
      await ensureLoadoutOpen(page, false);

      // Verify Inside Ganon's Castle has 7 checkable items (Golden Gauntlets + 6 Elemental Barrier Trials, NOT 0/0!)
      await page.getByTestId('map-node-ganons-castle').click();
      const dossier = page.getByTestId('region-dossier');
      await expect(
        dossier.getByRole('heading', { level: 2, name: "Inside Ganon's Castle" }),
      ).toBeVisible();
      await expect(dossier).toContainText('0 / 7');
      await expect(dossier.getByTestId('secret-card-eq-golden-gauntlets')).toBeVisible();
      await expect(dossier.getByTestId('secret-card-trial-shadow')).toBeVisible();

      // Verify Goron City initially locked behind Kokiri's Emerald, then Zelda's Letter
      await page.getByTestId('map-node-goron-city').click();
      await expect(page.getByTestId('dossier-reachability-banner')).toContainText(
        'Clear Inside the Great Deku Tree to leave Kokiri Forest',
      );

      // Switch to Optimal Route -> complete Ch. 1 Step 5 (Queen Gohma -> stone-emerald)
      await page.getByTestId('view-mode-route').click();
      await page.getByTestId('route-step-check-ch-01-step-05').check();

      // Switch to Ch. 2 -> complete Step 5 (Courtyard Stealth -> unlocksRequirementIds: ['zeldas-letter', 'song-lullaby'])
      await page.getByTestId('route-next-chapter-btn').click();
      await expect(page).toHaveURL(/chapter=ch-02/);
      await page.getByTestId('route-step-check-ch-02-step-05').check();

      // Return to World Map -> both Hyrule Field AND Goron City are now reachable (no reachability lock banner)!
      await page.getByTestId('view-mode-map').click();
      await page.getByTestId('map-node-goron-city').click();
      await expect(dossier.getByRole('heading', { level: 2, name: 'Goron City' })).toBeVisible();
      await expect(page.getByTestId('dossier-reachability-banner')).toHaveCount(0);

      telemetry.assertClean();
    });

    test('opens Hyrule Field, Kakariko Village, and Death Mountain Crater dossiers with Switch 2 highlights, Ready vs Locked buckets, and working Dungeon sub-tabs', async ({
      page,
    }) => {
      const telemetry = attachZeroErrorTelemetry(page);
      await page.setViewportSize({ width: 1440, height: 900 });
      await page.goto(target.baseUrl, { waitUntil: 'networkidle' });
      await dismissCatchUpIfOpen(page);

      // Apply Post-Dodongo preset via LoadoutDock so Child overworld + Crater are reachable
      await ensureLoadoutOpen(page, true);
      await page.getByTestId('preset-btn-post-dodongo').click();
      await ensureLoadoutOpen(page, false);

      const dossier = page.getByTestId('region-dossier');

      // 1. Hyrule Field
      await page.getByTestId('map-node-hyrule-field').click();
      await expect(dossier).toBeVisible();
      await expect(dossier.getByRole('heading', { level: 2, name: 'Hyrule Field' })).toBeVisible();
      await expect(page.getByTestId('switch2-highlights')).toContainText('Stone of Agony');
      await expect(page.getByTestId('section-ready-now')).toBeVisible();
      await expect(page.getByTestId('section-locked-buckets')).toBeVisible();
      const hp05Card = page.getByTestId('section-locked-buckets').getByTestId('secret-card-hp-05');
      await ensureCardExpanded(hp05Card, 'hp-05');
      await expect(page.getByTestId('cross-era-steps-hp-05')).toContainText('Step 1');
      await expect(page.getByTestId('cross-era-steps-hp-05')).toContainText('Step 2');

      // 2. Kakariko Village + Bottom of the Well sub-tab
      await page.getByTestId('map-node-kakariko-village').click();
      await expect(
        dossier.getByRole('heading', { level: 2, name: 'Kakariko Village' }),
      ).toBeVisible();
      await expect(page.getByTestId('switch2-highlights')).toContainText('Echo Gem');
      const hp08Card = page.getByTestId('section-ready-now').getByTestId('secret-card-hp-08');
      await ensureCardExpanded(hp08Card, 'hp-08');
      await expect(page.getByTestId('early-trick-hp-08')).toContainText('Early Trick Ready Now');
      await expect(
        page.getByTestId('section-locked-buckets').getByTestId('locked-bucket-blocker:gear:boomerang'),
      ).toBeVisible();

      const kakarikoSubtabs = page.getByTestId('region-subtabs');
      await expect(kakarikoSubtabs.getByTestId('subtab-kakariko-village')).toHaveAttribute(
        'aria-selected',
        'true',
      );
      await kakarikoSubtabs.getByTestId('subtab-bottom-of-the-well').click();
      await expect(
        dossier.getByRole('heading', { level: 2, name: 'Bottom of the Well' }),
      ).toBeVisible();
      await expect(
        page.getByTestId('region-subtabs').getByTestId('subtab-bottom-of-the-well'),
      ).toHaveAttribute('aria-selected', 'true');

      // Switch back via sub-tab
      await page.getByTestId('region-subtabs').getByTestId('subtab-kakariko-village').click();
      await expect(
        dossier.getByRole('heading', { level: 2, name: 'Kakariko Village' }),
      ).toBeVisible();

      // 3. Death Mountain Crater + Fire Temple sub-tab
      await page.getByTestId('map-node-death-mountain-crater').click();
      await expect(
        dossier.getByRole('heading', { level: 2, name: 'Death Mountain Crater' }),
      ).toBeVisible();
      await expect(page.getByTestId('switch2-highlights')).toContainText('NEW HEART PIECE');
      await expect(page.getByTestId('section-ready-now')).toBeVisible();
      await expect(page.getByTestId('section-locked-buckets')).toBeVisible();

      const craterSubtabs = page.getByTestId('region-subtabs');
      await expect(craterSubtabs.getByTestId('subtab-death-mountain-crater')).toHaveAttribute(
        'aria-selected',
        'true',
      );
      await craterSubtabs.getByTestId('subtab-fire-temple').click();
      await expect(dossier.getByRole('heading', { level: 2, name: 'Fire Temple' })).toBeVisible();
      await expect(
        page.getByTestId('region-subtabs').getByTestId('subtab-fire-temple'),
      ).toHaveAttribute('aria-selected', 'true');

      telemetry.assertClean();
    });

    test('checking off secrets updates regional & global completion counts, Live Heart Meter, and persists across page.reload()', async ({
      page,
    }) => {
      const telemetry = attachZeroErrorTelemetry(page);
      await page.setViewportSize({ width: 1440, height: 900 });
      await page.goto(target.baseUrl, { waitUntil: 'networkidle' });
      await page.evaluate(() => window.localStorage.clear());
      await page.reload({ waitUntil: 'networkidle' });
      await dismissCatchUpIfOpen(page);
      await ensureLoadoutOpen(page, false);

      const globalPill = page.getByTestId('global-progress-pill');
      await expect(globalPill).toContainText('0/275 (0%)');
      await expect(globalPill).toContainText('0/100');
      await expect(page.getByTestId('heart-meter-pill')).toContainText('3');

      await page.getByTestId('map-node-kakariko-village').click();
      await expect(page.getByTestId('counter-heart-pieces')).toContainText('0 / 4');
      await expect(page.getByTestId('counter-skulltulas-total')).toContainText('0 / 6');

      // Check off Heart Piece hp-07 and Gold Skulltula gs-018
      await page.getByTestId('secret-check-hp-07').click();
      await page.getByTestId('secret-check-gs-018').click();

      await expect(globalPill).toContainText('2/275 (1%)');
      await expect(globalPill).toContainText('1/100');
      await expect(page.getByTestId('heart-quarter-indicator')).toContainText('+1/4');
      await expect(page.getByTestId('counter-heart-pieces')).toContainText('1 / 4');
      await expect(page.getByTestId('counter-skulltulas-total')).toContainText('1 / 6');
      await expect(page.getByTestId('section-completed')).toContainText('Completed (2)');

      // Reload and confirm full persistence of both localStorage progress and hash deep-link
      await page.reload({ waitUntil: 'networkidle' });
      expect(new URL(page.url()).pathname).toBe(target.expectedPathname);
      await expect(globalPill).toContainText('2/275 (1%)');
      await expect(globalPill).toContainText('1/100');
      await expect(page.getByTestId('heart-quarter-indicator')).toContainText('+1/4');
      await expect(page.getByTestId('counter-heart-pieces')).toContainText('1 / 4');
      await expect(page.getByTestId('counter-skulltulas-total')).toContainText('1 / 6');
      await expect(page.getByTestId('section-completed')).toContainText('Completed (2)');

      telemetry.assertClean();
    });

    test('toggling Hookshot (+ Adult Link) and Bombs in Loadout moves locked secrets into Ready Right Now and surfaces unlock-toast', async ({
      page,
    }) => {
      const telemetry = attachZeroErrorTelemetry(page);
      await page.setViewportSize({ width: 1440, height: 900 });
      await page.goto(target.baseUrl, { waitUntil: 'networkidle' });
      await page.evaluate(() => window.localStorage.clear());
      await page.reload({ waitUntil: 'networkidle' });
      await dismissCatchUpIfOpen(page);
      await ensureLoadoutOpen(page, false);

      // Open Kakariko Village and verify gs-023 & hp-09 start in Locked Behind Specific Requirements
      await page.getByTestId('map-node-kakariko-village').click();
      const readySection = page.getByTestId('section-ready-now');
      const lockedSection = page.getByTestId('section-locked-buckets');

      await expect(lockedSection.getByTestId('secret-card-gs-023')).toBeVisible();
      await expect(lockedSection.getByTestId('secret-card-hp-09')).toBeVisible();
      await expect(readySection.getByTestId('secret-card-gs-023')).toHaveCount(0);

      // Expand Loadout Dock and toggle Adult Link + Hookshot
      await ensureLoadoutOpen(page, true);
      await page.getByTestId('loadout-req-era-adult').click();
      await page.getByTestId('loadout-req-hookshot').click();

      // Verify unlock-toast surfaces newly unlocked count
      const unlockToast = page.getByTestId('unlock-toast');
      await expect(unlockToast).toBeVisible();
      await expect(unlockToast).toContainText(/Hookshot unlocked \d+ new secrets across \d+ regions/);

      // Verify gs-023 and hp-09 dynamically moved into Ready Right Now
      await expect(readySection.getByTestId('secret-card-gs-023')).toBeVisible();
      await expect(readySection.getByTestId('secret-card-hp-09')).toBeVisible();
      await expect(lockedSection.getByTestId('secret-card-gs-023')).toHaveCount(0);

      // Also verify toggling Bombs unlocks bomb-gated secrets (e.g. gs-019 / hp-22 in Zora's River)
      await page.getByTestId('unlock-toast-dismiss-btn').click();
      await ensureLoadoutOpen(page, false);
      await page.getByTestId('map-node-zoras-river').click();
      await expect(lockedSection.getByTestId('secret-card-hp-22')).toBeVisible();

      await ensureLoadoutOpen(page, true);
      await page.getByTestId('loadout-req-bombs').click();
      await expect(unlockToast).toBeVisible();
      await expect(unlockToast).toContainText(/unlocked \d+ new secrets/);
      await expect(readySection.getByTestId('secret-card-hp-22')).toBeVisible();

      telemetry.assertClean();
    });

    test('clicking Song requirement pills opens requirement-popover with Switch 2 Y/X/A/R/L notes and jumps to source region, and Cmd+K / "/" Search finds Golden Bug & Echo Gem', async ({
      page,
    }) => {
      const telemetry = attachZeroErrorTelemetry(page);
      await page.setViewportSize({ width: 1440, height: 900 });
      await page.goto(target.baseUrl, { waitUntil: 'networkidle' });
      await dismissCatchUpIfOpen(page);
      await ensureLoadoutOpen(page, true);
      await page.getByTestId('preset-btn-post-dodongo').click();
      await ensureLoadoutOpen(page, false);

      // 1. Song requirement pill -> RequirementPopover -> Switch 2 Y / X / A / R / L badges -> Region Jump
      await page.getByTestId('map-node-death-mountain-crater').click();
      const bean09Card = page.getByTestId('secret-card-bean-09');
      await ensureCardExpanded(bean09Card, 'bean-09');
      const boleroPill = bean09Card.getByTestId('req-pill-song-bolero');
      await boleroPill.click();

      const popover = page.getByTestId('requirement-popover');
      await expect(popover).toBeVisible();
      await expect(popover).toContainText('Bolero of Fire');
      await expect(popover.getByTestId('song-note-badge-0')).toHaveText('R');
      await expect(popover.getByTestId('song-note-badge-1')).toHaveText('L');
      await expect(popover.getByTestId('song-note-badge-4')).toHaveText('A');
      await popover.getByTestId('close-req-popover-btn').click();
      await expect(popover).toHaveCount(0);

      // Also test Zelda's Lullaby pill (Y / X / A) in Kakariko Graveyard -> Jump to Hyrule Castle Grounds (Child)
      await page.getByTestId('map-node-graveyard').click();
      const sunSongCard = page.getByTestId('secret-card-song-sun');
      await ensureCardExpanded(sunSongCard, 'song-sun');
      await sunSongCard.getByTestId('req-pill-song-lullaby').click();
      await expect(popover).toBeVisible();
      await expect(popover).toContainText("Zelda's Lullaby");
      await expect(popover.getByTestId('song-note-badge-0')).toHaveText('Y');
      await expect(popover.getByTestId('song-note-badge-1')).toHaveText('X');
      await expect(popover.getByTestId('song-note-badge-2')).toHaveText('A');

      await popover.getByTestId('popover-jump-region-btn').click();
      await expect(popover).toHaveCount(0);
      await expect(
        page.getByTestId('region-dossier').getByRole('heading', {
          level: 2,
          name: 'Hyrule Castle Grounds (Child)',
        }),
      ).toBeVisible();

      // 2. "/" Global Search -> "Golden Bug" -> 5th Bottle in Market
      await page.keyboard.press('/');
      const searchModal = page.getByTestId('search-modal');
      const searchInput = page.getByTestId('global-search-input');
      await expect(searchModal).toBeVisible();
      await expect(searchInput).toBeFocused();

      await searchInput.fill('Golden Bug');
      const goldenBugResult = page.getByTestId('search-result-bottle-01');
      await expect(goldenBugResult).toBeVisible();
      await goldenBugResult.click();

      await expect(searchModal).toHaveCount(0);
      await expect(
        page.getByTestId('region-dossier').getByRole('heading', {
          level: 2,
          name: 'Hyrule Castle Town Market',
        }),
      ).toBeVisible();
      expect(new URL(page.url()).hash).toContain('region=market');

      // 3. Cmd+K / Ctrl+K Global Search -> "Echo Gem" -> skr-20 in Kakariko Village
      await page.keyboard.press('Control+k');
      await expect(searchModal).toBeVisible();
      await searchInput.fill('Echo Gem');
      const echoGemResult = page.getByTestId('search-result-skr-20');
      await expect(echoGemResult).toBeVisible();
      await echoGemResult.click();

      await expect(searchModal).toHaveCount(0);
      await expect(
        page.getByTestId('region-dossier').getByRole('heading', {
          level: 2,
          name: 'Kakariko Village',
        }),
      ).toBeVisible();
      expect(new URL(page.url()).hash).toContain('region=kakariko-village');

      telemetry.assertClean();
    });

    test('maintains zero horizontal overflow and zero errors across Desktop (1440×900) and Mobile (390×844) viewports, dossier, inventory, and modals', async ({
      page,
    }) => {
      const telemetry = attachZeroErrorTelemetry(page);

      // --- Desktop 1440×900 ---
      await page.setViewportSize({ width: 1440, height: 900 });
      await page.goto(target.baseUrl, { waitUntil: 'networkidle' });
      await dismissCatchUpIfOpen(page);
      await assertZeroHorizontalOverflow(page, 'Desktop 1440×900 initial map');

      // Check My Inventory Modal + Checklist Mode toggle on Desktop
      await page.getByTestId('open-inventory-btn').click();
      await expect(page.getByTestId('inventory-modal')).toBeVisible();
      await assertZeroHorizontalOverflow(page, 'Desktop 1440×900 Inventory modal');
      await page.getByTestId('inventory-modal-close-btn').click();
      await expect(page.getByTestId('inventory-modal')).toHaveCount(0);

      await ensureLoadoutOpen(page, true);
      await assertZeroHorizontalOverflow(page, 'Desktop 1440×900 expanded Loadout dock');
      await ensureLoadoutOpen(page, false);

      await page.getByTestId('map-node-kakariko-village').click();
      const desktopDossier = page.getByTestId('region-dossier');
      await expect(desktopDossier).toBeVisible();
      expect(await desktopDossier.evaluate((el) => el.tagName)).toBe('ASIDE');
      await assertZeroHorizontalOverflow(page, 'Desktop 1440×900 split-pane Region Dossier');

      // Check Companion Modals via consolidated Reference menu on Desktop
      for (const [btnTestId, modalTestId] of [
        ['open-ocarina-btn', 'ocarina-modal'],
        ['open-quests-btn', 'quests-modal'],
        ['open-diff-btn', 'switch2-diff-modal'],
        ['open-backup-btn', 'backup-modal'],
      ] as const) {
        await openReferenceSheet(page, btnTestId);
        await expect(page.getByTestId(modalTestId)).toBeVisible();
        await assertZeroHorizontalOverflow(page, `Desktop 1440×900 ${modalTestId}`);
        await page.getByTestId(`${modalTestId}-close-btn`).click();
        await expect(page.getByTestId(modalTestId)).toHaveCount(0);
      }

      // Close dossier before switching to mobile
      await page.getByTestId('close-dossier-btn').click();
      await expect(page.getByTestId('region-dossier')).toHaveCount(0);

      // --- Mobile 390×844 ---
      await page.setViewportSize({ width: 390, height: 844 });
      await assertZeroHorizontalOverflow(page, 'Mobile 390×844 initial map');

      await ensureLoadoutOpen(page, true);
      await assertZeroHorizontalOverflow(page, 'Mobile 390×844 expanded Loadout dock');
      await ensureLoadoutOpen(page, false);

      await page.getByTestId('map-node-kakariko-village').click();
      const mobileDossiers = page.getByTestId('region-dossier');
      await expect(mobileDossiers).toHaveCount(1);
      await expect(mobileDossiers).toBeVisible();
      expect(await mobileDossiers.evaluate((el) => el.tagName)).toBe('DIALOG');
      await assertZeroHorizontalOverflow(page, 'Mobile 390×844 Region Dossier <dialog>');

      await page.getByTestId('close-dossier-btn').click();
      await expect(page.getByTestId('region-dossier')).toHaveCount(0);

      await openReferenceSheet(page, 'open-ocarina-btn');
      await expect(page.getByTestId('ocarina-modal')).toBeVisible();
      await assertZeroHorizontalOverflow(page, 'Mobile 390×844 Ocarina Songbook modal');
      await page.getByTestId('ocarina-modal-close-btn').click();
      await expect(page.getByTestId('ocarina-modal')).toHaveCount(0);

      // Verify Service Worker registration succeeded cleanly without errors
      const swReady = await page.evaluate(async () => {
        if (!('serviceWorker' in navigator)) return false;
        const reg = await navigator.serviceWorker.getRegistration();
        return Boolean(reg);
      });
      expect(swReady).toBe(true);

      telemetry.assertClean();
    });

    test('verifies Illustrated Hyrule Map asset loading, regional submap asset loading, Area Guide walkthrough tab, Horizontal Optimal Route carousel, and durable Resume Banner across reloads', async ({
      page,
    }) => {
      const telemetry = attachZeroErrorTelemetry(page);
      await page.setViewportSize({ width: 1440, height: 900 });
      await page.goto(target.baseUrl, { waitUntil: 'networkidle' });
      await dismissCatchUpIfOpen(page);
      await ensureLoadoutOpen(page, false);

      // 1. Verify Illustrated Map SVG <image> rendered cleanly under both / and /Zelda/
      const mapLayerToggle = page.getByTestId('map-layer-toggle');
      await expect(mapLayerToggle).toHaveAttribute('aria-pressed', 'true');
      const artBackdrop = page.getByTestId('hyrule-illustrated-backdrop');
      await expect(artBackdrop).toBeVisible();
      const artBox = await artBackdrop.boundingBox();
      expect(artBox && artBox.width).toBeGreaterThan(200);

      // 1b. Drill into Kokiri Forest Sub-Map under both / and /Zelda/ to verify relative ./maps/regions/*.jpg loads without 404s
      await page.getByTestId('map-node-kokiri-forest').click();
      await page.getByTestId('dossier-open-area-map-btn').click();
      await expect(page.getByTestId('guided-area-workspace')).toBeVisible();
      await page.getByTestId('guided-back-to-world-btn').click();
      await expect(page.getByTestId('hyrule-map-canvas')).toBeVisible();

      // 2. Open Inside the Great Deku Tree -> switch to In-Depth Area Guide -> check off gs-057 inline
      await page.getByTestId('map-node-deku-tree').click();
      await page.getByTestId('dossier-tab-guide').click();
      const guidePanel = page.getByTestId('dossier-guide-panel');
      await expect(guidePanel).toBeVisible();
      await expect(guidePanel).toContainText('Gohma');
      await guidePanel.getByTestId('guide-secret-check-gs-057').check();
      await expect(page.getByTestId('global-progress-pill')).toContainText('1/275');

      // 3. Jump directly from the Area Guide into the Horizontal Optimal Route
      await guidePanel.getByTestId('dossier-jump-to-route-btn').click();
      const routeView = page.getByTestId('optimal-route-view');
      await expect(routeView).toBeVisible();
      expect(new URL(page.url()).pathname).toBe(target.expectedPathname);
      expect(new URL(page.url()).hash).toContain('view=route');
      await assertZeroHorizontalOverflow(page, 'Desktop 1440×900 Optimal Route view');

      // Verify gs-057 is already checked inside Optimal Route (shared checkbox sync!)
      await expect(routeView.getByTestId('route-secret-check-gs-057')).toBeChecked();

      // Navigate to Chapter 2 via Next chapter button
      await page.getByTestId('route-next-chapter-btn').click();
      expect(new URL(page.url()).hash).toContain('chapter=ch-02');

      // Verify Resume Banner is visible, reload page, and verify durable persistence + mobile layout
      const resumeBanner = page.getByTestId('resume-banner');
      await expect(resumeBanner).toBeVisible();
      await expect(resumeBanner).toContainText('Pick Up Where You Left Off');

      await page.reload({ waitUntil: 'networkidle' });
      await expect(page.getByTestId('resume-banner')).toBeVisible();
      await expect(page.getByTestId('global-progress-pill')).toContainText('1/275');

      // Check Mobile 390×844 zero horizontal overflow in Optimal Route view
      await page.setViewportSize({ width: 390, height: 844 });
      await assertZeroHorizontalOverflow(page, 'Mobile 390×844 Optimal Route view');

      // 4. Phase 2 Water Temple 4-floor blueprint, Hall of Fallen Foes (84 statues), Field Reference & 6 Threads of Time
      await page.setViewportSize({ width: 1440, height: 900 });
      await page.goto(`${target.baseUrl}#view=area&region=water-temple&lens=copilot`, {
        waitUntil: 'networkidle',
      });
      await expect(page.getByTestId('dungeon-meta-strip')).toContainText('Small Keys: 6');
      await expect(page.getByRole('tab', { name: /3F/i })).toBeVisible();
      await expect(page.getByRole('tab', { name: /B1/i })).toBeVisible();

      await openReferenceSheet(page, 'open-foes-btn');
      await expect(page.getByTestId('hall-of-fallen-foes-modal')).toBeVisible();
      await expect(page.getByTestId('foes-progress-counter')).toContainText('0 / 84');
      await page.getByTestId('foe-check-foe-01').click();
      await expect(page.getByTestId('foes-progress-counter')).toContainText('1 / 84');
      await page.getByTestId('hall-of-fallen-foes-modal-close-btn').click();

      await openReferenceSheet(page, 'open-reference-btn');
      await expect(page.getByTestId('reference-guide-modal')).toBeVisible();
      await page.getByTestId('ref-tab-fishing').click();
      await expect(page.getByTestId('sinking-lure-section')).toBeVisible();
      await page.getByTestId('reference-guide-modal-close-btn').click();

      telemetry.assertClean();
    });
  });
}

test.describe('Visual QA Screenshot Suite (Desktop 1440×900 & Mobile 390×844)', () => {
  test('captures crisp verification screenshots on strict /Zelda/ subpath', async ({
    page,
  }, testInfo) => {
    const telemetry = attachZeroErrorTelemetry(page);
    const outDir =
      process.env.QA_SCREENSHOT_DIR ||
      (fs.existsSync(DEFAULT_COORDINATOR_ARTIFACT_DIR)
        ? DEFAULT_COORDINATOR_ARTIFACT_DIR
        : testInfo.outputDir);

    fs.mkdirSync(outDir, { recursive: true });

    // 1. Desktop 1440×900 — Catch-Up Wizard -> Goron City 1st Visit -> 4-Floor Blueprint + Co-Pilot
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('http://127.0.0.1:4174/Zelda/', { waitUntil: 'networkidle' });
    await page.evaluate(() => window.localStorage.clear());
    await page.reload({ waitUntil: 'networkidle' });

    const catchUpModal = page.getByTestId('catch-up-modal');
    await expect(catchUpModal).toBeVisible();
    await catchUpModal.getByTestId('catchup-preset-goron-city-visit-1').click();
    await page.screenshot({
      path: path.join(outDir, 'desktop-catchup-wizard.png'),
      fullPage: false,
    });
    await catchUpModal.getByTestId('catchup-apply-btn').click();
    await expect(page.getByTestId('guided-area-workspace')).toBeVisible();
    await page.screenshot({
      path: path.join(outDir, 'desktop-goron-city-copilot.png'),
      fullPage: false,
    });

    // 2. Desktop 1440×900 — Calibrated Illustrated Hyrule Map
    await page.getByTestId('guided-back-to-world-btn').click();
    await expect(page.getByTestId('hyrule-map-canvas')).toBeVisible();
    await page.screenshot({
      path: path.join(outDir, 'desktop-hyrule-map.png'),
      fullPage: false,
    });

    // 3. Desktop 1440×900 — Split-Pane Kakariko Village Dossier
    await page.getByTestId('map-node-kakariko-village').click();
    await expect(page.getByTestId('region-dossier')).toBeVisible();
    await page.screenshot({
      path: path.join(outDir, 'desktop-region-dossier.png'),
      fullPage: false,
    });

    // 4. Desktop 1440×900 — Switch 2 Ocarina Songbook Modal
    await openReferenceSheet(page, 'open-ocarina-btn');
    await expect(page.getByTestId('ocarina-modal')).toBeVisible();
    for (const btn of ['Y', 'X', 'A', 'R', 'L', 'Y', 'X', 'A'] as const) {
      await page.getByTestId(`scarecrow-pad-${btn}`).click();
    }
    await page.getByTestId('scarecrow-save-btn').click();
    await page.screenshot({
      path: path.join(outDir, 'desktop-ocarina-songbook.png'),
      fullPage: false,
    });
    await page.getByTestId('ocarina-modal-close-btn').click();
    await page.getByTestId('close-dossier-btn').click();

    // 5. Mobile 390×844 — Responsive Region Dossier Bottom-Sheet <dialog>
    await page.setViewportSize({ width: 390, height: 844 });
    await page.getByTestId('map-node-kakariko-village').click();
    await expect(page.getByTestId('region-dossier')).toBeVisible();
    await page.screenshot({
      path: path.join(outDir, 'mobile-map-and-dossier.png'),
      fullPage: false,
    });
    await page.getByTestId('close-dossier-btn').click();

    telemetry.assertClean();
  });
});
