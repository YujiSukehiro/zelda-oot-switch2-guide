import '@testing-library/jest-dom/vitest';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { App } from './App';
import { STORAGE_KEY } from './lib/storage';

beforeEach(() => {
  window.localStorage.clear();
  window.history.replaceState(null, '', '/');
});

afterEach(() => {
  cleanup();
});

describe('App Phase 1 Integration', () => {
  it('syncs regionId, era, and spotlight with window.location.hash via Map HUD without mutating pathname and persists secret checkoffs', () => {
    window.history.replaceState(
      null,
      '',
      '/Zelda/#region=kakariko-village&era=child&spotlight=1',
    );

    render(<App />);

    // Deep-linked URL should not auto-block with CatchUpModal
    expect(screen.queryByTestId('catch-up-modal')).not.toBeInTheDocument();
    expect(window.location.pathname).toBe('/Zelda/');
    expect(screen.getByTestId('map-era-child')).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByTestId('map-spotlight-toggle')).toHaveAttribute('aria-pressed', 'true');

    const dossier = screen.getByTestId('region-dossier');
    expect(within(dossier).getByRole('heading', { name: 'Kakariko Village' })).toBeInTheDocument();

    // Disable spotlight to reveal all Kakariko secrets and check off hp-07
    fireEvent.click(screen.getByTestId('map-spotlight-toggle'));
    expect(window.location.pathname).toBe('/Zelda/');
    expect(window.location.hash).not.toContain('spotlight=1');

    fireEvent.click(screen.getByTestId('secret-check-hp-07'));
    expect(screen.getByTestId('global-progress-pill')).toHaveTextContent('1/275');
    expect(window.localStorage.getItem(STORAGE_KEY)).toContain('"hp-07":true');
  });

  it('opens OcarinaModal with initialSongId when Songbook is triggered from RegionDrawer', () => {
    window.history.replaceState(null, '', '/#region=kakariko-village');

    render(<App />);

    const stormsCard = screen.getByTestId('secret-card-song-storms');
    if (stormsCard.getAttribute('data-expanded') === 'false') {
      fireEvent.click(within(stormsCard).getByTestId('secret-expand-btn-song-storms'));
    }
    const songbookBtn = within(stormsCard).getByRole('button', { name: /songbook/i });
    fireEvent.click(songbookBtn);

    expect(screen.getByTestId('ocarina-modal')).toBeInTheDocument();
    expect(window.location.hash).toContain('region=kakariko-village');
    expect(window.location.hash).toContain('sheet=ocarina');
    expect(screen.getByTestId('song-card-song-storms')).toBeInTheDocument();
  });

  it('auto-prompts CatchUpModal on unconfigured first visit, applies Goron City — 1st Visit preset, and opens 4-floor blueprint & 3-Lens GuidedAreaWorkspace', () => {
    render(<App />);

    // First unconfigured visit auto-opens CatchUpModal
    const catchUpModal = screen.getByTestId('catch-up-modal');
    expect(catchUpModal).toBeInTheDocument();

    // Select Goron City — 1st Visit preset & apply (default play style is Guided Co-Pilot + Floor Maps)
    fireEvent.click(within(catchUpModal).getByTestId('catchup-preset-goron-city-visit-1'));
    fireEvent.click(within(catchUpModal).getByTestId('catchup-apply-btn'));

    expect(screen.queryByTestId('catch-up-modal')).not.toBeInTheDocument();
    expect(window.location.hash).toContain('view=area');
    expect(window.location.hash).toContain('region=goron-city');
    expect(window.location.hash).toContain('lens=copilot');

    // GuidedAreaWorkspace + Goron City 4-floor blueprint (4F, 3F, 2F, 1F) are rendered
    const workspace = screen.getByTestId('guided-area-workspace');
    expect(workspace).toBeInTheDocument();
    expect(within(workspace).getByRole('tab', { name: /4F/i })).toBeInTheDocument();
    expect(within(workspace).getByRole('tab', { name: /3F/i })).toBeInTheDocument();
    expect(within(workspace).getByRole('tab', { name: /2F/i })).toBeInTheDocument();
    expect(within(workspace).getByRole('tab', { name: /1F/i })).toBeInTheDocument();

    // Switch cleanly across the 3 lenses and sync URL hash lens param
    fireEvent.click(screen.getByTestId('guided-lens-tab-rooms'));
    expect(window.location.hash).toContain('lens=rooms');
    expect(screen.getByTestId('guided-tabpanel-rooms')).not.toHaveAttribute('hidden');

    fireEvent.click(screen.getByTestId('guided-lens-tab-quests'));
    expect(window.location.hash).toContain('lens=quests');
    expect(screen.getByTestId('guided-tabpanel-quests')).not.toHaveAttribute('hidden');

    fireEvent.click(screen.getByTestId('guided-lens-tab-copilot'));
    expect(window.location.hash).toContain('lens=copilot');
    expect(screen.getByTestId('guided-tabpanel-copilot')).not.toHaveAttribute('hidden');
  });

  it('connects InventoryModal, LoadoutDock, UnlockToast, and Room Explorer Unlock Radar when acquiring progression gear', () => {
    window.history.replaceState(null, '', '/#view=area&region=goron-city&lens=rooms');

    render(<App />);

    // Open InventoryModal from TopCommandBar and grant Adult Era + Hookshot
    fireEvent.click(screen.getByTestId('open-inventory-btn'));
    expect(screen.getByTestId('inventory-modal')).toBeInTheDocument();
    fireEvent.click(screen.getByTestId('inventory-modal-close-btn'));
    expect(screen.queryByTestId('inventory-modal')).not.toBeInTheDocument();

    fireEvent.click(screen.getByTestId('loadout-dock-expand-btn'));
    fireEvent.click(screen.getByTestId('loadout-req-era-adult'));
    fireEvent.click(screen.getByTestId('loadout-req-hookshot'));

    // UnlockDelta surfaces in both UnlockToast and Room Explorer's Unlock Radar
    const toast = screen.getByTestId('unlock-toast');
    expect(toast).toHaveTextContent(/Hookshot unlocked \d+ new secrets/i);
    expect(screen.getByTestId('guided-tabpanel-rooms')).toHaveTextContent(/Hookshot/i);
  });

  it('switches between World Map and Horizontal Optimal Route, syncs shared secret checkboxes, and unlocks requirements from route steps', () => {
    render(<App />);

    // Dismiss initial CatchUpModal ("Keep Current Save")
    fireEvent.click(screen.getByTestId('catchup-cancel-btn'));
    expect(screen.queryByTestId('catch-up-modal')).not.toBeInTheDocument();

    // Initially no activity -> no resume banner
    expect(screen.queryByTestId('resume-banner')).not.toBeInTheDocument();

    // Switch to Optimal Route view via TopCommandBar
    fireEvent.click(screen.getByTestId('view-mode-route'));
    expect(window.location.hash).toContain('view=route');
    expect(screen.getByTestId('optimal-route-view')).toBeInTheDocument();

    // Check off the first collectible in Ch. 1 (Kokiri Sword eq-kokiri-sword) directly from Optimal Route
    const swordCheckbox = screen.getByTestId('route-secret-check-eq-kokiri-sword');
    fireEvent.click(swordCheckbox);
    expect(screen.getByTestId('global-progress-pill')).toHaveTextContent('1/275');

    // Resume banner now appears with Pick Up Where You Left Off
    const resumeBanner = screen.getByTestId('resume-banner');
    expect(resumeBanner).toHaveTextContent(/Pick Up Where You Left Off/i);

    // Clicking "Area on Map" on the resume banner jumps back to World Map and opens the Region Dossier
    fireEvent.click(screen.getByTestId('resume-open-map-btn'));
    expect(window.location.hash).not.toContain('view=route');
    expect(screen.getByTestId('region-dossier')).toBeInTheDocument();

    // Drilling down from Region Dossier enters GuidedAreaWorkspace
    fireEvent.click(screen.getByTestId('dossier-open-area-map-btn'));
    expect(window.location.hash).toContain('view=area');
    expect(screen.getByTestId('guided-area-workspace')).toBeInTheDocument();

    // Clicking "Continue Guide" returns right back to the Optimal Route chapter & step
    fireEvent.click(screen.getByTestId('resume-continue-route-btn'));
    expect(window.location.hash).toContain('view=route');
    expect(screen.getByTestId('optimal-route-view')).toBeInTheDocument();
  });

  it('enforces Fresh Start Kokiri reachability lock on Hyrule Field while marking gs-001 Ready Now with Night Only badge', () => {
    render(<App />);

    // Apply Fresh Start in World Map mode via CatchUpModal
    const catchUpModal = screen.getByTestId('catch-up-modal');
    fireEvent.click(within(catchUpModal).getByTestId('catchup-style-map'));
    fireEvent.click(within(catchUpModal).getByTestId('catchup-preset-fresh-start'));
    fireEvent.click(within(catchUpModal).getByTestId('catchup-apply-btn'));

    // Kokiri Forest is reachable; equipping Kokiri Sword puts gs-001 in Ready Right Now with Night Only badge
    expect(screen.queryByTestId('dossier-reachability-banner')).not.toBeInTheDocument();
    fireEvent.click(screen.getByTestId('secret-check-eq-kokiri-sword'));
    const readySection = screen.getByTestId('section-ready-now');
    const gs001 = within(readySection).getByTestId('secret-card-gs-001');
    expect(within(gs001).getByTestId('env-chip-gs-001-night')).toHaveTextContent('Night Only');

    // Hyrule Field is locked until Inside the Great Deku Tree is cleared
    fireEvent.click(screen.getByTestId('map-node-hyrule-field'));
    expect(screen.getByTestId('dossier-reachability-banner')).toHaveTextContent(
      /Clear Inside the Great Deku Tree to leave Kokiri Forest/i,
    );
  });

  it('unlocks World Map reachability via Optimal Route unlocksRequirementIds, populates ganons-castle (7 items), syncs hp-10 <-> skr-50, and supports Checklist Mode', () => {
    window.history.replaceState(null, '', '/#region=ganons-castle');
    render(<App />);

    // Inside Ganon's Castle has 7 checkable secrets (Golden Gauntlets + 6 Elemental Trials)
    const dossier = screen.getByTestId('region-dossier');
    expect(dossier).toHaveTextContent('0 / 7');
    expect(within(dossier).getByTestId('secret-card-eq-golden-gauntlets')).toBeInTheDocument();
    expect(within(dossier).getByTestId('secret-card-trial-shadow')).toBeInTheDocument();
    expect(screen.getByTestId('dossier-reachability-banner')).toBeInTheDocument();

    // Toggling Checklist Mode in InventoryModal unlocks all regions immediately
    fireEvent.click(screen.getByTestId('open-inventory-btn'));
    fireEvent.click(screen.getByTestId('world-lock-checklist-btn'));
    fireEvent.click(screen.getByTestId('inventory-modal-close-btn'));
    expect(screen.queryByTestId('dossier-reachability-banner')).not.toBeInTheDocument();

    // Re-enable Progressive Mode -> Goron City locked until Deku Tree + Zelda's Letter
    fireEvent.click(screen.getByTestId('open-inventory-btn'));
    fireEvent.click(screen.getByTestId('world-lock-progressive-btn'));
    fireEvent.click(screen.getByTestId('inventory-modal-close-btn'));

    fireEvent.click(screen.getByTestId('map-node-goron-city'));
    expect(screen.getByTestId('dossier-reachability-banner')).toBeInTheDocument();

    // Complete Ch. 1 Step 5 (stone-emerald) and Ch. 2 Step 5 (unlocksRequirementIds: zeldas-letter, song-lullaby)
    fireEvent.click(screen.getByTestId('view-mode-route'));
    fireEvent.click(screen.getByTestId('route-step-check-ch-01-step-05'));
    fireEvent.click(screen.getByTestId('route-next-chapter-btn'));
    fireEvent.click(screen.getByTestId('route-step-check-ch-02-step-05'));

    // Return to World Map -> Goron City is now unlocked via unlocksRequirementIds!
    fireEvent.click(screen.getByTestId('view-mode-map'));
    fireEvent.click(screen.getByTestId('map-node-goron-city'));
    expect(screen.queryByTestId('dossier-reachability-banner')).not.toBeInTheDocument();

    // Verify hp-10 <-> skr-50 bidirectional sync and Live Heart Meter math (boss-hc-deku = 4 hearts, +1/4 from hp-10)
    expect(screen.getByTestId('heart-meter-pill')).toHaveTextContent('4');
    fireEvent.click(screen.getByTestId('map-node-kakariko-village'));
    fireEvent.click(screen.getByTestId('secret-check-hp-10'));
    expect(screen.getByTestId('secret-check-skr-50')).toHaveAttribute('aria-checked', 'true');
    expect(screen.getByTestId('heart-quarter-indicator')).toHaveTextContent('+1/4');
  });

  it('cleanly un-syncs unchecked progression secrets and keeps InventoryModal & OcarinaModal accurate across Checklist Mode and secret-backed toggles', () => {
    window.history.replaceState(null, '', '/#region=deku-tree');
    render(<App />);

    // Check stone-emerald -> unlocks Hyrule Field; uncheck stone-emerald -> re-locks Hyrule Field
    fireEvent.click(screen.getByTestId('secret-check-stone-emerald'));
    fireEvent.click(screen.getByTestId('map-node-hyrule-field'));
    expect(screen.queryByTestId('dossier-reachability-banner')).not.toBeInTheDocument();

    fireEvent.click(screen.getByTestId('map-node-deku-tree'));
    fireEvent.click(screen.getByTestId('secret-check-stone-emerald'));
    fireEvent.click(screen.getByTestId('map-node-hyrule-field'));
    expect(screen.getByTestId('dossier-reachability-banner')).toBeInTheDocument();

    // Check eq-hookshot on Graveyard dossier, then toggle Hookshot OFF inside InventoryModal
    fireEvent.click(screen.getByTestId('map-node-graveyard'));
    fireEvent.click(screen.getByTestId('secret-check-eq-hookshot'));
    expect(screen.getByTestId('secret-check-eq-hookshot')).toHaveAttribute('aria-checked', 'true');

    fireEvent.click(screen.getByTestId('open-inventory-btn'));
    const hookshotBtn = screen.getByTestId('inventory-item-hookshot');
    expect(hookshotBtn).toHaveAttribute('aria-pressed', 'true');
    fireEvent.click(hookshotBtn);
    expect(hookshotBtn).toHaveAttribute('aria-pressed', 'false');

    // Deku Sticks starts Missing and toggles ON -> OFF cleanly
    const sticksBtn = screen.getByTestId('inventory-item-deku-sticks');
    expect(sticksBtn).toHaveAttribute('aria-pressed', 'false');
    fireEvent.click(sticksBtn);
    expect(sticksBtn).toHaveAttribute('aria-pressed', 'true');
    fireEvent.click(sticksBtn);
    expect(sticksBtn).toHaveAttribute('aria-pressed', 'false');

    // Medallion toggles ON -> OFF cleanly on Quest Status tab
    fireEvent.click(screen.getByTestId('inventory-tab-quest'));
    const forestMedBtn = screen.getByTestId('inventory-quest-medallion-forest');
    expect(forestMedBtn).toHaveAttribute('aria-pressed', 'false');
    fireEvent.click(forestMedBtn);
    expect(forestMedBtn).toHaveAttribute('aria-pressed', 'true');
    fireEvent.click(forestMedBtn);
    expect(forestMedBtn).toHaveAttribute('aria-pressed', 'false');

    // Enable Checklist Mode -> InventoryModal items stay Missing & OcarinaModal stays at 0/13 Learned
    fireEvent.click(screen.getByTestId('world-lock-checklist-btn'));
    fireEvent.click(screen.getByTestId('inventory-tab-items'));
    expect(screen.getByTestId('inventory-item-bombs')).toHaveAttribute('aria-pressed', 'false');
    fireEvent.click(screen.getByTestId('inventory-modal-close-btn'));

    // Graveyard eq-hookshot was also unchecked when Hookshot was toggled off in InventoryModal
    expect(screen.getByTestId('secret-check-eq-hookshot')).toHaveAttribute('aria-checked', 'false');

    fireEvent.click(screen.getByTestId('open-ocarina-btn'));
    expect(screen.getByTestId('ocarina-modal')).toHaveTextContent('(0/13 Learned)');
  });

  it('wires Phase 2 Water Temple 4-floor blueprint, 84-statue HallOfFallenFoesModal, Ocarina -> Pierre ReferenceGuideModal jump, and 6 Threads of Time quests', () => {
    window.history.replaceState(null, '', '/#view=area&region=water-temple&lens=copilot');
    render(<App />);

    // 1. Water Temple 4-floor blueprint (3F, 2F, 1F, B1 + 6 Small Keys) inside GuidedAreaWorkspace
    const workspace = screen.getByTestId('guided-area-workspace');
    expect(within(workspace).getByRole('tab', { name: /3F/i })).toBeInTheDocument();
    expect(within(workspace).getByRole('tab', { name: /2F/i })).toBeInTheDocument();
    expect(within(workspace).getByRole('tab', { name: /1F/i })).toBeInTheDocument();
    expect(within(workspace).getByRole('tab', { name: /B1/i })).toBeInTheDocument();
    expect(within(workspace).getByTestId('dungeon-meta-strip')).toHaveTextContent('Small Keys: 6');

    // 2. Open Hall of Fallen Foes (84 statues) from TopCommandBar Reference menu & log statue #1
    fireEvent.click(screen.getByTestId('open-foes-btn'));
    expect(window.location.hash).toContain('sheet=foes');
    const foesModal = screen.getByTestId('hall-of-fallen-foes-modal');
    expect(foesModal).toBeInTheDocument();
    expect(screen.getByTestId('foes-progress-counter')).toHaveTextContent('0 / 84');
    fireEvent.click(screen.getByTestId('foe-check-foe-01'));
    expect(screen.getByTestId('foes-progress-counter')).toHaveTextContent('1 / 84');
    expect(screen.getByTestId('open-foes-btn')).toHaveTextContent('1/84');
    fireEvent.click(screen.getByTestId('hall-of-fallen-foes-modal-close-btn'));

    // 3. Open Ocarina Songbook -> click Scarecrow's Song "Pierre Spots" button -> opens ReferenceGuideModal on 'pierre' tab
    fireEvent.click(screen.getByTestId('open-ocarina-btn'));
    expect(screen.getByTestId('ocarina-modal')).toBeInTheDocument();
    fireEvent.click(screen.getByTestId('open-pierre-directory-btn'));
    expect(window.location.hash).toContain('sheet=reference');
    const refModal = screen.getByTestId('reference-guide-modal');
    expect(refModal).toBeInTheDocument();
    expect(screen.getByTestId('ref-panel-pierre')).not.toHaveAttribute('hidden');

    // Switch across Hidden Grottos, Lake Hylia Fishing, and Smart Rupee / Free Gear tabs
    fireEvent.click(screen.getByTestId('ref-tab-grottos'));
    expect(screen.getByTestId('echo-gem-callout')).toBeInTheDocument();
    fireEvent.click(screen.getByTestId('ref-tab-fishing'));
    expect(screen.getByTestId('sinking-lure-section')).toBeInTheDocument();
    fireEvent.click(screen.getByTestId('ref-tab-gear'));
    expect(screen.getByTestId('free-gear-table')).toBeInTheDocument();
    fireEvent.click(screen.getByTestId('reference-guide-modal-close-btn'));

    // 4. Open Side Quests -> check off Malon's Threads of Time quest (sw2-thread-malon) -> increments global 100% counter
    fireEvent.click(screen.getByTestId('open-quests-btn'));
    expect(screen.getByTestId('threads-of-time-section')).toBeInTheDocument();
    fireEvent.click(screen.getByTestId('quest-check-sw2-thread-malon'));
    expect(screen.getByTestId('global-progress-pill')).toHaveTextContent('1/275');
  });
});
