import React from 'react';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  computeAllRegionSummaries,
  createDefaultProgressState,
  deriveEffectiveRequirements,
  toggleSecretCompleted,
} from '../../lib/gating';
import type { PlayerProgressState } from '../../types/zelda';
import { RegionDrawer } from './index';

function renderRegionDrawer(
  regionId: string | null,
  customState?: PlayerProgressState,
  callbacks?: {
    onClose?: () => void;
    onSelectRegion?: (id: string) => void;
    onToggleSecret?: (secretId: string, completed?: boolean) => void;
    onToggleRequirement?: (requirementId: string, owned?: boolean) => void;
    onOpenSongbook?: (songId?: string) => void;
  },
) {
  const state = customState ?? createDefaultProgressState();
  const effectiveRequirements = deriveEffectiveRequirements(state);
  const regionSummaries = computeAllRegionSummaries(state);
  const onClose = callbacks?.onClose ?? vi.fn();
  const onSelectRegion = callbacks?.onSelectRegion ?? vi.fn();
  const onToggleSecret = callbacks?.onToggleSecret ?? vi.fn();
  const onToggleRequirement = callbacks?.onToggleRequirement ?? vi.fn();
  const onOpenSongbook = callbacks?.onOpenSongbook ?? vi.fn();

  const view = render(
    <RegionDrawer
      regionId={regionId}
      state={state}
      effectiveRequirements={effectiveRequirements}
      regionSummaries={regionSummaries}
      onClose={onClose}
      onSelectRegion={onSelectRegion}
      onToggleSecret={onToggleSecret}
      onToggleRequirement={onToggleRequirement}
      onOpenSongbook={onOpenSongbook}
    />,
  );

  return {
    ...view,
    state,
    effectiveRequirements,
    regionSummaries,
    onClose,
    onSelectRegion,
    onToggleSecret,
    onToggleRequirement,
    onOpenSongbook,
  };
}

function mockMatchMedia(matchesMobile: boolean) {
  const originalMatchMedia = window.matchMedia;
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    configurable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: query.includes('899px') ? matchesMobile : false,
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
  return () => {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      configurable: true,
      value: originalMatchMedia,
    });
  };
}

afterEach(() => {
  cleanup();
});

describe('RegionDrawer & Secret Categorization (src/components/region)', () => {
  it('returns null when regionId is null or unknown', () => {
    const { container } = renderRegionDrawer(null);
    expect(container).toBeEmptyDOMElement();

    const unknownView = renderRegionDrawer('non-existent-region');
    expect(unknownView.container).toBeEmptyDOMElement();
  });

  it('renders Hyrule Field with Switch 2 highlights, map counters, Ready Right Now, and Cross-Era Step 1 / Step 2 buckets for hp-05 and hp-06', () => {
    renderRegionDrawer('hyrule-field');

    const dossiers = screen.getAllByTestId('region-dossier');
    expect(dossiers).toHaveLength(1);
    expect(dossiers[0].tagName).toBe('ASIDE');

    expect(screen.getByRole('heading', { name: 'Hyrule Field' })).toBeInTheDocument();
    expect(screen.getByTestId('counter-heart-pieces')).toHaveTextContent('0 / 2');
    expect(screen.getByTestId('counter-skulltulas-child')).toHaveTextContent('0 / 2');
    expect(screen.getByTestId('counter-skulltulas-adult')).toHaveTextContent('0 / 1');
    expect(screen.getByTestId('counter-skulltulas-total')).toHaveTextContent('0 / 3');

    const highlights = screen.getByTestId('switch2-highlights');
    expect(highlights).toHaveTextContent('Switch 2 Remake Highlights');
    expect(highlights).toHaveTextContent('Both old Stone of Agony grotto Heart Pieces were REMOVED');

    // Ready Right Now vs Locked Behind Specific Requirements separation
    const readySection = screen.getByTestId('section-ready-now');
    const lockedSection = screen.getByTestId('section-locked-buckets');
    expect(readySection).toBeInTheDocument();
    expect(lockedSection).toBeInTheDocument();

    // Cross-Era bucket holds hp-05, hp-06, and gs-010 with Step 1 and Step 2 timeline badges
    const crossEraBucket = within(lockedSection).getByTestId('locked-bucket-blocker:cross-era');
    expect(crossEraBucket).toHaveAttribute('open');
    expect(crossEraBucket).toHaveTextContent('Cross-Era Time-Travel Puzzles');

    const hp05Card = within(crossEraBucket).getByTestId('secret-card-hp-05');
    expect(hp05Card).toHaveTextContent('NEW IN SWITCH 2');
    const hp05Steps = within(hp05Card).getByTestId('cross-era-steps-hp-05');
    expect(hp05Steps).toHaveTextContent('Step 1');
    expect(hp05Steps).toHaveTextContent('Step 2');
    expect(hp05Steps).toHaveTextContent("Sell somethin', will ya?");

    const hp06Card = within(crossEraBucket).getByTestId('secret-card-hp-06');
    expect(hp06Card).toHaveTextContent('Western Canyon Time-Locked Chest');
    const hp06Steps = within(hp06Card).getByTestId('cross-era-steps-hp-06');
    expect(hp06Steps).toHaveTextContent('Step 1');
    expect(hp06Steps).toHaveTextContent('Step 2');
    expect(hp06Steps).toHaveTextContent('Pedestal of Time');
  });

  it('renders Kakariko Village with Early Trick Ready Now callout on hp-08 and Bottom of the Well sub-tab', () => {
    const onSelectRegion = vi.fn();
    renderRegionDrawer('kakariko-village', undefined, { onSelectRegion });

    const highlights = screen.getByTestId('switch2-highlights');
    expect(highlights).toHaveTextContent('Echo Gem');

    // Ready Right Now includes hp-08 via early Child jump trick
    const readySection = screen.getByTestId('section-ready-now');
    const hp08Card = within(readySection).getByTestId('secret-card-hp-08');
    const earlyTrick = within(hp08Card).getByTestId('early-trick-hp-08');
    expect(earlyTrick).toHaveTextContent('Early Trick Ready Now');
    expect(earlyTrick).toHaveTextContent('watchtower');
    expect(hp08Card).toHaveTextContent('UPDATED IN SWITCH 2');

    // Locked buckets separate Song of Storms, Boomerang, Token Milestones, etc.
    const lockedSection = screen.getByTestId('section-locked-buckets');
    expect(
      within(lockedSection).getByTestId('locked-bucket-blocker:gear:boomerang'),
    ).toBeInTheDocument();

    // Attached Dungeon quick-switch sub-tabs (Kakariko Village <-> Bottom of the Well)
    const subtabs = screen.getByTestId('region-subtabs');
    const kakarikoTab = within(subtabs).getByTestId('subtab-kakariko-village');
    const wellTab = within(subtabs).getByTestId('subtab-bottom-of-the-well');
    expect(kakarikoTab).toHaveAttribute('aria-selected', 'true');
    expect(wellTab).toHaveAttribute('aria-selected', 'false');
    expect(wellTab).toHaveTextContent('Bottom of the Well');

    fireEvent.click(wellTab);
    expect(onSelectRegion).toHaveBeenCalledWith('bottom-of-the-well');
  });

  it('renders Death Mountain Crater with Switch 2 highlights, locked buckets, and Fire Temple sub-tab (plus Kokiri Forest 3-tab family)', () => {
    const onSelectRegion = vi.fn();
    const { unmount } = renderRegionDrawer('death-mountain-crater', undefined, {
      onSelectRegion,
    });

    const highlights = screen.getByTestId('switch2-highlights');
    expect(highlights).toHaveTextContent('NEW HEART PIECE (#3 in Crater)');
    expect(highlights).toHaveTextContent('200 Rupees');

    const subtabs = screen.getByTestId('region-subtabs');
    const craterTab = within(subtabs).getByTestId('subtab-death-mountain-crater');
    const fireTempleTab = within(subtabs).getByTestId('subtab-fire-temple');
    expect(craterTab).toHaveAttribute('aria-selected', 'true');
    expect(fireTempleTab).toHaveTextContent('Fire Temple');

    fireEvent.click(fireTempleTab);
    expect(onSelectRegion).toHaveBeenCalledWith('fire-temple');

    // Cross-era Bolero Magic Bean #9 inside Crater has Step 1 / Step 2 badges
    const bean09 = screen.getByTestId('secret-card-bean-09');
    expect(within(bean09).getByTestId('cross-era-steps-bean-09')).toHaveTextContent(
      'Bolero of Fire',
    );

    unmount();

    // Verify Kokiri Forest renders Great Deku Tree + Hall of Fallen Foes sub-tabs
    const onSelectKokiriFamily = vi.fn();
    renderRegionDrawer('kokiri-forest', undefined, {
      onSelectRegion: onSelectKokiriFamily,
    });
    const kokiriTabs = screen.getByTestId('region-subtabs');
    expect(within(kokiriTabs).getByTestId('subtab-kokiri-forest')).toBeInTheDocument();
    expect(within(kokiriTabs).getByTestId('subtab-deku-tree')).toBeInTheDocument();
    expect(within(kokiriTabs).getByTestId('subtab-hall-of-fallen-foes')).toBeInTheDocument();
  });

  it('opens RequirementPopover on clicking a Song pill, renders Switch 2 Y/X/A/R/L button badges (and custom Scarecrow notes), and jumps to source region', () => {
    const onSelectRegion = vi.fn();
    const onToggleRequirement = vi.fn();
    const customState: PlayerProgressState = {
      ...createDefaultProgressState(),
      customScarecrowNotes: 'Y X A R L Y X A',
    };

    // Death Mountain Crater has Bolero of Fire ('song-bolero': R L R L A R A R) and Scarecrow's Song ('song-scarecrow') on Fire Temple / Lake Hylia
    const { unmount } = renderRegionDrawer('graveyard', customState, {
      onSelectRegion,
      onToggleRequirement,
    });

    // Click Sun's Song pill on ReDead / Sun's Song Grave (hp-11): notes A, R, X, A, R, X -> source region 'graveyard', and Zelda's Lullaby ('song-lullaby': Y, X, A, Y, X, A -> source region 'hyrule-castle')
    const lullabyPills = screen.getAllByTestId('req-pill-song-lullaby');
    fireEvent.click(lullabyPills[0]);

    const popover = screen.getByTestId('requirement-popover');
    expect(popover).toHaveTextContent("Zelda's Lullaby");
    expect(popover).toHaveTextContent('Ocarina Melody');

    // Verify Switch 2 Y / X / A controller button badges render inside popover
    expect(within(popover).getByTestId('song-note-badge-0')).toHaveTextContent('Y');
    expect(within(popover).getByTestId('song-note-badge-1')).toHaveTextContent('X');
    expect(within(popover).getByTestId('song-note-badge-2')).toHaveTextContent('A');

    // Toggle Mark Owned
    fireEvent.click(within(popover).getByTestId('popover-toggle-owned-btn'));
    expect(onToggleRequirement).toHaveBeenCalledWith('song-lullaby', true);

    // Jump to Hyrule Castle Grounds (Child)
    const jumpBtn = within(popover).getByTestId('popover-jump-region-btn');
    expect(jumpBtn).toHaveTextContent('Jump to Hyrule Castle Grounds (Child)');
    fireEvent.click(jumpBtn);
    expect(onSelectRegion).toHaveBeenCalledWith('hyrule-castle');

    unmount();

    // Also verify custom Scarecrow's Song notes render inside RequirementPopover (e.g. Fire Temple gs-068 requires song-scarecrow)
    renderRegionDrawer('fire-temple', customState);
    const scarecrowPills = screen.getAllByTestId('req-pill-song-scarecrow');
    fireEvent.click(scarecrowPills[0]);
    const scarecrowPopover = screen.getByTestId('requirement-popover');
    expect(scarecrowPopover).toHaveTextContent("Scarecrow's Song");
    expect(scarecrowPopover).toHaveTextContent('Y X A R L Y X A');
    expect(within(scarecrowPopover).getByTestId('song-note-badge-3')).toHaveTextContent('R');
    expect(within(scarecrowPopover).getByTestId('song-note-badge-4')).toHaveTextContent('L');
  });

  it('switches cleanly between blocker, tier, and type grouping modes and checks off secrets via onToggleSecret', () => {
    const onToggleSecret = vi.fn();
    let state = createDefaultProgressState();

    const { rerender } = render(
      <RegionDrawer
        regionId="kakariko-village"
        state={state}
        effectiveRequirements={deriveEffectiveRequirements(state)}
        regionSummaries={computeAllRegionSummaries(state)}
        onClose={vi.fn()}
        onSelectRegion={vi.fn()}
        onToggleSecret={onToggleSecret}
      />,
    );

    const switcher = screen.getByTestId('group-mode-switcher');
    expect(within(switcher).getByTestId('group-mode-blocker')).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(screen.getByTestId('section-ready-now')).toBeInTheDocument();

    // Switch to Canonical Tiers (0-5)
    fireEvent.click(within(switcher).getByTestId('group-mode-tier'));
    expect(within(switcher).getByTestId('group-mode-tier')).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(screen.getByTestId('section-tier-groups')).toBeInTheDocument();
    expect(screen.getByTestId('tier-bucket-tier-0-immediate')).toBeInTheDocument();

    // Switch to Collectible Type
    fireEvent.click(within(switcher).getByTestId('group-mode-type'));
    expect(within(switcher).getByTestId('group-mode-type')).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(screen.getByTestId('section-type-groups')).toBeInTheDocument();
    expect(screen.getByTestId('type-bucket-heart-pieces')).toBeInTheDocument();
    expect(screen.getByTestId('type-bucket-gold-skulltulas')).toBeInTheDocument();

    // Check off hp-07 ("Impa's House Cow Cage")
    const checkBtn = screen.getByTestId('secret-check-hp-07');
    expect(checkBtn).toHaveAttribute('aria-checked', 'false');
    fireEvent.click(checkBtn);
    expect(onToggleSecret).toHaveBeenCalledWith('hp-07');

    // Rerender with updated state and verify hp-07 moves into Completed section
    state = toggleSecretCompleted(state, 'hp-07', true);
    rerender(
      <RegionDrawer
        regionId="kakariko-village"
        state={state}
        effectiveRequirements={deriveEffectiveRequirements(state)}
        regionSummaries={computeAllRegionSummaries(state)}
        onClose={vi.fn()}
        onSelectRegion={vi.fn()}
        onToggleSecret={onToggleSecret}
      />,
    );

    const completedSection = screen.getByTestId('section-completed');
    expect(completedSection).toHaveTextContent('Completed (1)');
    expect(within(completedSection).getByTestId('secret-check-hp-07')).toHaveAttribute(
      'aria-checked',
      'true',
    );
    expect(screen.getByTestId('counter-heart-pieces')).toHaveTextContent('1 / 4');
  });

  it('renders mobile <dialog> bottom-sheet when viewport < 900px with only one region-dossier in DOM and light-dismiss support', () => {
    const restoreMatchMedia = mockMatchMedia(true);
    const showModalSpy = vi.fn(function (this: HTMLDialogElement) {
      this.setAttribute('open', '');
    });
    const originalShowModal = HTMLDialogElement.prototype.showModal;
    HTMLDialogElement.prototype.showModal = showModalSpy;

    try {
      const onClose = vi.fn();
      renderRegionDrawer('hyrule-field', undefined, { onClose });

      const dossiers = screen.getAllByTestId('region-dossier');
      expect(dossiers).toHaveLength(1);
      expect(dossiers[0].tagName).toBe('DIALOG');
      expect(showModalSpy).toHaveBeenCalledTimes(1);

      // Clicking backdrop directly on <dialog> triggers light-dismiss fallback onClose
      fireEvent.click(dossiers[0]);
      expect(onClose).toHaveBeenCalledTimes(1);
    } finally {
      HTMLDialogElement.prototype.showModal = originalShowModal;
      restoreMatchMedia();
    }
  });

  it('supports keyboard ArrowRight subtab switching, close button, and Escape closing RequirementPopover without closing dossier', () => {
    const onClose = vi.fn();
    const onSelectRegion = vi.fn();
    renderRegionDrawer('kokiri-forest', undefined, { onClose, onSelectRegion });

    const kokiriTab = screen.getByTestId('subtab-kokiri-forest');
    fireEvent.keyDown(kokiriTab, { key: 'ArrowRight' });
    expect(onSelectRegion).toHaveBeenCalledWith('deku-tree');

    // Open a requirement pill popover and press Escape -> closes popover, not dossier
    const pill = screen.getAllByTestId('req-pill-era-child')[0];
    fireEvent.click(pill);
    const popover = screen.getByTestId('requirement-popover');
    fireEvent.keyDown(popover, { key: 'Escape' });
    expect(screen.queryByTestId('requirement-popover')).not.toBeInTheDocument();
    expect(onClose).not.toHaveBeenCalled();

    // Clicking close-dossier-btn closes the dossier
    fireEvent.click(screen.getByTestId('close-dossier-btn'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
