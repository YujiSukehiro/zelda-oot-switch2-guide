import '@testing-library/jest-dom/vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { REQUIREMENTS, STORY_PRESETS } from '../../data';
import {
  applyStoryPreset,
  computeGlobalProgress,
  computeUnlockDelta,
  createDefaultProgressState,
  deriveEffectiveRequirements,
  toggleRequirementOwned,
} from '../../lib/gating';
import { exportProgressJson } from '../../lib/storage';
import { HallOfFallenFoesModal } from './HallOfFallenFoesModal';
import {
  BackupModal,
  LoadoutDock,
  OcarinaModal,
  QuestsModal,
  SearchModal,
  Switch2DiffModal,
  TopCommandBar,
  UnlockToast,
} from './index';
import { ReferenceGuideModal } from './ReferenceGuideModal';

afterEach(() => {
  cleanup();
});

describe('TopCommandBar', () => {
  it('renders live Heart Meter + quarter-heart indicator, de-duplicates Era/Spotlight filters, and triggers Inventory, Catch Up, Reference sheets, and Cmd+K', () => {
    const state = createDefaultProgressState();
    state.completedSecretIds['hp-01'] = true;
    state.completedSecretIds['gs-001'] = true;
    const progress = computeGlobalProgress(state);

    const onOpenSheet = vi.fn();
    const onToggleTheme = vi.fn();
    const onOpenInventory = vi.fn();
    const onOpenCatchUp = vi.fn();

    render(
      <TopCommandBar
        state={state}
        globalProgress={progress}
        activeSheet={null}
        onOpenSheet={onOpenSheet}
        onToggleTheme={onToggleTheme}
        onOpenInventory={onOpenInventory}
        onOpenCatchUp={onOpenCatchUp}
      />,
    );

    const pill = screen.getByTestId('global-progress-pill');
    expect(pill).toHaveTextContent(`${progress.completedCount}/${progress.totalCount}`);
    expect(pill).toHaveTextContent('1/100');

    // Live Heart Meter: 3 base Heart Containers + 1/4 Piece of Heart
    const heartMeter = screen.getByTestId('heart-meter-pill');
    expect(heartMeter).toHaveTextContent('♥♥♥');
    expect(screen.getByTestId('heart-quarter-indicator')).toHaveTextContent('+1/4');

    // Duplicate Era & Switch 2 filter buttons are removed from TopCommandBar (kept in HyruleMapCanvas)
    expect(screen.queryByTestId('era-filter-adult')).not.toBeInTheDocument();
    expect(screen.queryByTestId('spotlight-toggle-btn')).not.toBeInTheDocument();

    fireEvent.click(screen.getByTestId('open-inventory-btn'));
    expect(onOpenInventory).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByTestId('open-catchup-btn'));
    expect(onOpenCatchUp).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByTestId('open-ocarina-btn'));
    expect(onOpenSheet).toHaveBeenCalledWith('ocarina');

    fireEvent.click(screen.getByTestId('open-quests-btn'));
    expect(onOpenSheet).toHaveBeenCalledWith('quests');

    fireEvent.click(screen.getByTestId('open-diff-btn'));
    expect(onOpenSheet).toHaveBeenCalledWith('diff');

    fireEvent.click(screen.getByTestId('open-backup-btn'));
    expect(onOpenSheet).toHaveBeenCalledWith('backup');

    fireEvent.click(screen.getByTestId('theme-toggle-btn'));
    expect(onToggleTheme).toHaveBeenCalledWith('parchment');

    fireEvent.keyDown(window, { key: 'k', metaKey: true });
    expect(onOpenSheet).toHaveBeenCalledWith('search');
  });
});

describe('LoadoutDock & UnlockToast', () => {
  it('renders all 66 requirement pills, all 7 story presets, and auto-derived Skulltula milestones', () => {
    const state = createDefaultProgressState();
    const effective = deriveEffectiveRequirements(state);
    effective.add('tokens-10');
    effective.add('tokens-20');

    const onToggleRequirement = vi.fn();
    const onSelectPreset = vi.fn();
    const onToggleLoadoutMode = vi.fn();
    const onToggleOpen = vi.fn();

    render(
      <LoadoutDock
        isOpen={true}
        onToggleOpen={onToggleOpen}
        state={state}
        effectiveRequirements={effective}
        skulltulaCount={22}
        onToggleRequirement={onToggleRequirement}
        onSelectPreset={onSelectPreset}
        onToggleLoadoutMode={onToggleLoadoutMode}
      />,
    );

    expect(screen.getByTestId('loadout-skulltula-pill')).toHaveTextContent('22/100');

    // Verify all 7 canonical presets exist and work
    for (const preset of STORY_PRESETS) {
      expect(screen.getByTestId(`preset-btn-${preset.id}`)).toBeInTheDocument();
    }
    fireEvent.click(screen.getByTestId('preset-btn-post-water-temple'));
    expect(onSelectPreset).toHaveBeenCalledWith('post-water-temple');

    // Verify every single one of the 66 requirements renders its toggle pill
    for (const req of REQUIREMENTS) {
      expect(screen.getByTestId(`loadout-req-${req.id}`)).toBeInTheDocument();
    }

    fireEvent.click(screen.getByTestId('loadout-req-hookshot'));
    expect(onToggleRequirement).toHaveBeenCalledWith('hookshot');

    fireEvent.click(screen.getByTestId('loadout-mode-switch'));
    expect(onToggleLoadoutMode).toHaveBeenCalledWith(false);
  });

  it('displays UnlockToast with newly unlocked secrets grouped by region and jumps on click', () => {
    const prev = applyStoryPreset(createDefaultProgressState(), 'fresh-adult-hookshot');
    const withoutHookshot = toggleRequirementOwned(prev, 'hookshot', false);
    const withHookshot = toggleRequirementOwned(withoutHookshot, 'hookshot', true);
    const delta = computeUnlockDelta(withoutHookshot, withHookshot, 'Hookshot');

    expect(delta.totalUnlocked).toBeGreaterThan(0);

    const onDismiss = vi.fn();
    const onSelectRegion = vi.fn();

    render(<UnlockToast delta={delta} onDismiss={onDismiss} onSelectRegion={onSelectRegion} />);

    const toast = screen.getByTestId('unlock-toast');
    expect(toast).toHaveTextContent(
      new RegExp(`Hookshot unlocked ${delta.totalUnlocked} new secrets across`, 'i'),
    );

    fireEvent.click(screen.getByTestId('unlock-toast-expand-btn'));
    const list = screen.getByTestId('unlock-toast-list');
    expect(list).toBeInTheDocument();

    const firstUnlocked = delta.newlyUnlocked[0];
    fireEvent.click(screen.getByTestId(`unlock-item-${firstUnlocked.secret.id}`));
    expect(onSelectRegion).toHaveBeenCalledWith(firstUnlocked.secret.regionId);

    fireEvent.click(screen.getByTestId('unlock-toast-dismiss-btn'));
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });
});

describe('OcarinaModal', () => {
  it('renders all 13 songs with Y/X/A/R/L badges, validates 8-note Scarecrow melody, and persists notes', () => {
    const state = createDefaultProgressState();
    const effective = deriveEffectiveRequirements(state);
    const onClose = vi.fn();
    const onToggleRequirement = vi.fn();
    const onSaveScarecrowNotes = vi.fn();
    const onSelectRegion = vi.fn();

    render(
      <OcarinaModal
        isOpen={true}
        onClose={onClose}
        state={state}
        effectiveRequirements={effective}
        onToggleRequirement={onToggleRequirement}
        onSaveScarecrowNotes={onSaveScarecrowNotes}
        onSelectRegion={onSelectRegion}
      />,
    );

    expect(screen.getByTestId('song-card-song-lullaby')).toBeInTheDocument();
    expect(screen.getByTestId('song-card-song-scarecrow')).toBeInTheDocument();

    // Rejects 8 identical notes (< 2 distinct buttons)
    const input = screen.getByTestId('scarecrow-input');
    fireEvent.change(input, { target: { value: 'Y Y Y Y Y Y Y Y' } });
    fireEvent.click(screen.getByTestId('scarecrow-save-btn'));
    expect(onSaveScarecrowNotes).not.toHaveBeenCalled();
    expect(screen.getByTestId('scarecrow-status')).toHaveTextContent(/at least 2 distinct/i);

    // Clear and compose via Switch 2 button pad + input
    fireEvent.change(input, { target: { value: '' } });
    for (const note of ['Y', 'X', 'A', 'R', 'L', 'Y', 'X', 'A'] as const) {
      fireEvent.click(screen.getByTestId(`scarecrow-pad-${note}`));
    }
    fireEvent.click(screen.getByTestId('scarecrow-save-btn'));
    expect(onSaveScarecrowNotes).toHaveBeenCalledWith('Y X A R L Y X A');

    // Learned toggle & Region jump
    fireEvent.click(screen.getByTestId('song-learned-btn-song-storms'));
    expect(onToggleRequirement).toHaveBeenCalledWith('song-storms');

    fireEvent.click(screen.getByTestId('song-jump-btn-song-storms'));
    expect(onSelectRegion).toHaveBeenCalledWith('kakariko-village');
    expect(onClose).toHaveBeenCalledTimes(1);

    // Escape & backdrop light-dismiss both invoke onClose
    const modal = screen.getByTestId('ocarina-modal');
    expect(modal).toHaveAttribute('closedby', 'any');
    fireEvent.keyDown(modal, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledTimes(2);

    fireEvent.click(modal);
    expect(onClose).toHaveBeenCalledTimes(3);
  });

  it('keeps unlearned songs at 0/13 Learned when Checklist Mode is active', () => {
    const checklistState = createDefaultProgressState();
    checklistState.loadoutModeEnabled = false;
    const effective = deriveEffectiveRequirements(checklistState);

    render(
      <OcarinaModal
        isOpen={true}
        onClose={vi.fn()}
        state={checklistState}
        effectiveRequirements={effective}
        onToggleRequirement={vi.fn()}
        onSaveScarecrowNotes={vi.fn()}
        onSelectRegion={vi.fn()}
      />,
    );

    const modal = screen.getByTestId('ocarina-modal');
    expect(modal).toHaveTextContent('(0/13 Learned)');
    expect(screen.getByTestId('song-learned-btn-song-lullaby')).toHaveAttribute(
      'aria-pressed',
      'false',
    );
  });
});

describe('QuestsModal & Switch2DiffModal', () => {
  it('renders Biggoron 4:00 / 2:30 / 3:30 timers, Switch 2 thawed Zora shortcut, and Happy Mask fees', () => {
    const state = createDefaultProgressState();
    const effective = deriveEffectiveRequirements(state);
    const onClose = vi.fn();
    const onToggleSecret = vi.fn();
    const onSelectRegion = vi.fn();

    render(
      <QuestsModal
        isOpen={true}
        onClose={onClose}
        state={state}
        effectiveRequirements={effective}
        onToggleSecret={onToggleSecret}
        onSelectRegion={onSelectRegion}
      />,
    );

    expect(screen.getByTestId('zora-shortcut-callout')).toHaveTextContent(/25 seconds/i);
    expect(screen.getByTestId('step-timer-badge-4')).toHaveTextContent('4:00');
    expect(screen.getByTestId('step-timer-badge-9')).toHaveTextContent('2:30');
    expect(screen.getByTestId('step-timer-badge-10')).toHaveTextContent('3:30');

    // Interactive countdown preset selection
    fireEvent.click(screen.getByTestId('timer-preset-2:30'));
    expect(screen.getByTestId('quest-timer-display')).toHaveTextContent('2:30');

    // Check step 10 & Happy Mask step 4
    fireEvent.click(screen.getByTestId('quest-check-biggoron-step-10'));
    expect(onToggleSecret).toHaveBeenCalledWith('biggoron-step-10');

    expect(screen.getByTestId('quest-step-mask-step-4')).toHaveTextContent('50 Rupees');
    expect(screen.getByTestId('mask-bugfix-callout')).toHaveTextContent(/Poacher’s Saw/i);
    fireEvent.click(screen.getByTestId('quest-check-mask-step-4'));
    expect(onToggleSecret).toHaveBeenCalledWith('mask-step-4');
  });

  it('renders Switch2DiffModal with 5 Bottles, 1,175 Great Fairy Rupees, 550 Bean Rupees, Echo Gem & 84 Statues', () => {
    const state = createDefaultProgressState();
    const onClose = vi.fn();
    const onToggleSecret = vi.fn();
    const onSelectRegion = vi.fn();

    render(
      <Switch2DiffModal
        isOpen={true}
        onClose={onClose}
        state={state}
        onToggleSecret={onToggleSecret}
        onSelectRegion={onSelectRegion}
      />,
    );

    const diffDialog = screen.getByTestId('switch2-diff-modal');
    expect(diffDialog.textContent).not.toMatch(/\((?:hp|gs|gf)-\d+/);
    expect(screen.getByTestId('diff-card-bottle-01')).toHaveTextContent(/Golden Bug/i);
    expect(screen.getByTestId('diff-card-skr-20')).toHaveTextContent(/Echo Gem/i);
    expect(screen.getByTestId('diff-card-sw2-hall-of-fallen-foes')).toHaveTextContent(/84/);

    fireEvent.click(screen.getByTestId('diff-check-bottle-01'));
    expect(onToggleSecret).toHaveBeenCalledWith('bottle-01');
  });
});

describe('SearchModal', () => {
  it('displays dynamic Phase 1 counts and finds "Golden Bug" -> bottle-01 and "Echo Gem" -> skr-20', () => {
    const state = createDefaultProgressState();
    const effective = deriveEffectiveRequirements(state);
    const onClose = vi.fn();
    const onSelectRegion = vi.fn();
    const onToggleSecret = vi.fn();

    const { rerender } = render(
      <SearchModal
        isOpen={true}
        onClose={onClose}
        state={state}
        effectiveRequirements={effective}
        onSelectRegion={onSelectRegion}
        onToggleSecret={onToggleSecret}
      />,
    );

    expect(screen.getByTestId('search-modal')).toHaveTextContent(
      'Search across all 276 collectibles & milestones, 34 regions & dungeons, and 69 progression items',
    );

    const searchInput = screen.getByTestId('global-search-input');

    // 1. Search "Golden Bug" -> finds bottle-01 -> jumps to market
    fireEvent.change(searchInput, { target: { value: 'Golden Bug' } });
    const bugResult = screen.getByTestId('search-result-bottle-01');
    expect(bugResult).toHaveTextContent(/Escaped Golden Bug/i);
    fireEvent.click(bugResult);
    expect(onSelectRegion).toHaveBeenCalledWith('market');
    expect(onClose).toHaveBeenCalledTimes(1);

    // 2. Reopen / continue and search "Echo Gem" -> finds skr-20 -> Enter jumps to kakariko-village
    rerender(
      <SearchModal
        isOpen={true}
        onClose={onClose}
        state={state}
        effectiveRequirements={effective}
        onSelectRegion={onSelectRegion}
        onToggleSecret={onToggleSecret}
      />,
    );

    fireEvent.change(screen.getByTestId('global-search-input'), {
      target: { value: 'Echo Gem' },
    });
    const echoResult = screen.getByTestId('search-result-skr-20');
    expect(echoResult).toHaveTextContent(/20 Gold Skulltulas — Echo Gem/i);

    fireEvent.keyDown(screen.getByTestId('global-search-input'), { key: 'Enter' });
    expect(onSelectRegion).toHaveBeenCalledWith('kakariko-village');
    expect(onClose).toHaveBeenCalledTimes(2);
  });
});

describe('BackupModal', () => {
  it('handles JSON export, valid/invalid JSON import feedback, and 2-step Reset confirmation', () => {
    const state = createDefaultProgressState();
    state.completedSecretIds['hp-01'] = true;
    const progress = computeGlobalProgress(state);

    const onClose = vi.fn();
    const onExportJson = vi.fn(() => exportProgressJson(state));
    const onImportJson = vi.fn();
    const onResetProgress = vi.fn();

    render(
      <BackupModal
        isOpen={true}
        onClose={onClose}
        state={state}
        globalProgress={progress}
        onExportJson={onExportJson}
        onImportJson={onImportJson}
        onResetProgress={onResetProgress}
      />,
    );

    // Export download trigger
    fireEvent.click(screen.getByTestId('backup-download-btn'));
    expect(onExportJson).toHaveBeenCalledTimes(1);
    expect(screen.getByTestId('backup-feedback-success')).toBeInTheDocument();

    // Invalid JSON import rejected cleanly
    const textarea = screen.getByTestId('backup-import-textarea');
    fireEvent.change(textarea, { target: { value: '{broken json' } });
    fireEvent.click(screen.getByTestId('backup-import-btn'));
    expect(onImportJson).not.toHaveBeenCalled();
    expect(screen.getByTestId('backup-feedback-error')).toHaveTextContent(/Invalid JSON/i);

    // Valid JSON import accepted
    const validPayload = exportProgressJson(state);
    fireEvent.change(textarea, { target: { value: validPayload } });
    fireEvent.click(screen.getByTestId('backup-import-btn'));
    expect(onImportJson).toHaveBeenCalledWith(validPayload);
    expect(screen.getByTestId('backup-feedback-success')).toHaveTextContent(/Successfully restored/i);

    // 2-step Reset confirmation
    fireEvent.click(screen.getByTestId('backup-reset-step1-btn'));
    expect(onResetProgress).not.toHaveBeenCalled();
    expect(screen.getByTestId('backup-reset-confirm-box')).toBeInTheDocument();

    fireEvent.click(screen.getByTestId('backup-reset-confirm-btn'));
    expect(onResetProgress).toHaveBeenCalledTimes(1);
  });
});


describe('Phase 2 Sheets: Threads of Time, Hall of Fallen Foes & Field Reference Guide', () => {
  it('exposes Hall of Fallen Foes (X/84) and Field Guide in TopCommandBar and Pierre shortcut in OcarinaModal', () => {
    const state = createDefaultProgressState();
    state.completedFoeStatueIds = { 'foe-01': true, 'foe-02': true, 'foe-75': true };
    const progress = computeGlobalProgress(state);
    const onOpenSheet = vi.fn();

    render(
      <TopCommandBar
        state={state}
        globalProgress={progress}
        activeSheet={null}
        onOpenSheet={onOpenSheet}
        onToggleTheme={vi.fn()}
      />,
    );

    const foesBtn = screen.getByTestId('open-foes-btn');
    expect(foesBtn).toHaveTextContent('Hall of Fallen Foes (3/84)');
    fireEvent.click(foesBtn);
    expect(onOpenSheet).toHaveBeenCalledWith('foes');

    const refBtn = screen.getByTestId('open-reference-btn');
    expect(refBtn).toHaveTextContent(/Field Guide/i);
    fireEvent.click(refBtn);
    expect(onOpenSheet).toHaveBeenCalledWith('reference');

    cleanup();

    const onOpenPierre = vi.fn();
    render(
      <OcarinaModal
        isOpen={true}
        onClose={vi.fn()}
        state={state}
        effectiveRequirements={deriveEffectiveRequirements(state)}
        onToggleRequirement={vi.fn()}
        onSaveScarecrowNotes={vi.fn()}
        onSelectRegion={vi.fn()}
        onOpenPierreDirectory={onOpenPierre}
      />,
    );

    fireEvent.click(screen.getByTestId('open-pierre-directory-btn'));
    expect(onOpenPierre).toHaveBeenCalledTimes(1);
  });

  it('renders all 6 checkable Threads of Time character quests in QuestsModal with zero raw ID leaks', () => {
    const state = createDefaultProgressState();
    state.completedSecretIds['sw2-thread-malon'] = true;
    const effective = deriveEffectiveRequirements(state);
    const onToggleSecret = vi.fn();
    const onSelectRegion = vi.fn();
    const onClose = vi.fn();

    render(
      <QuestsModal
        isOpen={true}
        onClose={onClose}
        state={state}
        effectiveRequirements={effective}
        onToggleSecret={onToggleSecret}
        onSelectRegion={onSelectRegion}
      />,
    );

    const threadsSection = screen.getByTestId('threads-of-time-section');
    expect(threadsSection).toHaveTextContent('Threads of Time (6 Switch 2 Character Quests) (1/6)');
    expect(threadsSection.textContent).not.toMatch(/\((?:hp|gs|sw2)-|\*\*/);

    fireEvent.click(screen.getByTestId('quest-check-sw2-thread-saria'));
    expect(onToggleSecret).toHaveBeenCalledWith('sw2-thread-saria');

    fireEvent.click(screen.getByTestId('quest-jump-sw2-thread-nabooru'));
    expect(onSelectRegion).toHaveBeenCalledWith('gerudo-fortress');
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('renders HallOfFallenFoesModal with 84 statues, Wing & Rare filters, Check All Non-Rare, and Boss Rush medals', () => {
    const completedFoes: Record<string, boolean> = { 'foe-01': true };
    const medals: Record<string, 'none' | 'bronze' | 'silver' | 'gold' | 'master'> = {};
    const onToggleFoeStatue = vi.fn((id: string, val?: boolean) => {
      completedFoes[id] = val ?? !completedFoes[id];
    });
    const onSetBossRushMedal = vi.fn((id: string, medal: 'none' | 'bronze' | 'silver' | 'gold' | 'master') => {
      medals[id] = medal;
    });
    const onSelectRegion = vi.fn();
    const onClose = vi.fn();

    render(
      <HallOfFallenFoesModal
        isOpen={true}
        onClose={onClose}
        completedFoeStatueIds={completedFoes}
        bossRushMedals={medals}
        onToggleFoeStatue={onToggleFoeStatue}
        onSetBossRushMedal={onSetBossRushMedal}
        onSelectRegion={onSelectRegion}
      />,
    );

    const dialog = screen.getByTestId('hall-of-fallen-foes-modal');
    expect(dialog.textContent).not.toMatch(/\((?:hp|gs|gf)-\d+|\*\*/);
    expect(screen.getByTestId('foes-progress-counter')).toHaveTextContent('1 / 84 Statues');

    // Filter to Rare / Easy to Miss stragglers
    fireEvent.click(screen.getByTestId('foes-rare-only-checkbox'));
    expect(screen.getByTestId('foes-statue-grid')).toHaveTextContent('Peahat Larva');
    expect(screen.getByTestId('foes-statue-grid')).not.toHaveTextContent('Withered Deku Baba');
    fireEvent.click(screen.getByTestId('foes-rare-only-checkbox'));

    // Wing filter: Bosses (10)
    fireEvent.click(screen.getByTestId('foes-wing-boss'));
    expect(screen.getByTestId('foes-statue-grid')).toHaveTextContent('Queen Gohma');
    expect(screen.getByTestId('foes-statue-grid')).toHaveTextContent('Ganon');

    // 1-click Check All Non-Rare
    fireEvent.click(screen.getByTestId('check-all-non-rare-foes-btn'));
    expect(onToggleFoeStatue).toHaveBeenCalled();

    // Jump to spawn region
    fireEvent.click(screen.getByTestId('foe-jump-foe-75'));
    expect(onSelectRegion).toHaveBeenCalledWith('deku-tree');
    expect(onClose).toHaveBeenCalledTimes(1);

    // Switch to Boss Rush Medal Tracker tab
    fireEvent.click(screen.getByTestId('foes-tab-boss-rush'));
    expect(screen.getByTestId('boss-rush-panel')).toHaveTextContent(
      /Master All-Bosses \+ Dark Link Gauntlet/i,
    );
    fireEvent.click(screen.getByTestId('boss-rush-medal-gauntlet-master-master'));
    expect(onSetBossRushMedal).toHaveBeenCalledWith('gauntlet-master', 'master');
  });

  it('renders ReferenceGuideModal across all 4 tabs (Pierre, Grottos & Echo Gem, Fishing & Loach, Smart Rupees)', () => {
    const onSelectRegion = vi.fn();
    const onClose = vi.fn();

    render(
      <ReferenceGuideModal
        isOpen={true}
        onClose={onClose}
        onSelectRegion={onSelectRegion}
        initialTab="pierre"
      />,
    );

    const dialog = screen.getByTestId('reference-guide-modal');
    expect(dialog.textContent).not.toMatch(/\((?:hp|gs|gf)-\d+|\*\*/);

    // Tab 1: Pierre Scarecrow Spots
    expect(screen.getByTestId('ref-panel-pierre')).toHaveTextContent(
      /Lakeside Laboratory Rooftop Watchtower/i,
    );
    fireEvent.click(screen.getByTestId('pierre-jump-pierre-fire-temple-boulder-maze'));
    expect(onSelectRegion).toHaveBeenCalledWith('fire-temple');

    // Tab 2: Hidden Grottos & Echo Gem
    fireEvent.click(screen.getByTestId('ref-tab-grottos'));
    expect(screen.getByTestId('echo-gem-callout')).toHaveTextContent(/20 Gold Skulltulas/i);
    fireEvent.click(screen.getByTestId('grotto-method-megaton-hammer'));
    expect(screen.getByTestId('grottos-card-grid')).toHaveTextContent(/150 Rupees Total/i);

    // Tab 3: Lake Hylia Fishing & Hylian Loach
    fireEvent.click(screen.getByTestId('ref-tab-fishing'));
    expect(screen.getByTestId('sinking-lure-section')).toHaveTextContent(/Spot 4/i);
    expect(screen.getByTestId('hylian-loach-guide')).toHaveTextContent(/30 to 35 lbs/i);

    // Tab 4: Smart Rupee & Free-Gear Cheat Sheet
    fireEvent.click(screen.getByTestId('ref-tab-gear'));
    expect(screen.getByTestId('free-gear-table')).toHaveTextContent(/Hylian Shield/i);
    expect(screen.getByTestId('free-gear-table')).toHaveTextContent(/FREE in Kakariko Graveyard/i);
    expect(screen.getByTestId('mandatory-budgets-grid')).toHaveTextContent(/1,175 Rupees/i);
    expect(screen.getByTestId('mandatory-budgets-grid')).toHaveTextContent(/550 Rupees/i);
  });
});
