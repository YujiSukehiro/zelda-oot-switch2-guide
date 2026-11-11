import '@testing-library/jest-dom/vitest';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  applyStoryPreset,
  categorizeRegionSecrets,
  computeAllRegionSummaries,
  computeUnlockDelta,
  createDefaultProgressState,
  deriveEffectiveRequirements,
  toggleRequirementOwned,
} from '../../lib/gating';
import type { EvaluatedSecret, PlayerProgressState, RegionProgressSummary } from '../../types/zelda';
import {
  GuidedAreaWorkspace,
  type GuidedSubmapControlProps,
} from './index';

afterEach(() => {
  cleanup();
});

function renderGuidedWorkspace(
  regionId: string,
  options?: {
    state?: PlayerProgressState;
    summariesOverride?: Record<string, RegionProgressSummary & { isReachable?: boolean; reachabilityBlocker?: string }>;
    evaluatedSecretsOverride?: EvaluatedSecret[];
    lastUnlockDelta?: ReturnType<typeof computeUnlockDelta> | null;
    onSelectRegion?: (regionId: string) => void;
    onToggleSecret?: (secretId: string, completed?: boolean) => void;
    onOpenSongbook?: (songId?: string) => void;
  },
) {
  const state = options?.state ?? createDefaultProgressState();
  const effectiveRequirements = deriveEffectiveRequirements(state);
  const regionSummaries = options?.summariesOverride ?? computeAllRegionSummaries(state);
  const onSelectRegion = options?.onSelectRegion ?? vi.fn();
  const onToggleSecret = options?.onToggleSecret ?? vi.fn();
  const onOpenSongbook = options?.onOpenSongbook ?? vi.fn();
  const onBackToWorldMap = vi.fn();

  let latestSubmapProps: GuidedSubmapControlProps | null = null;

  const view = render(
    <GuidedAreaWorkspace
      regionId={regionId}
      state={state}
      effectiveRequirements={effectiveRequirements}
      regionSummaries={regionSummaries}
      evaluatedSecretsOverride={options?.evaluatedSecretsOverride}
      lastUnlockDelta={options?.lastUnlockDelta}
      onSelectRegion={onSelectRegion}
      onBackToWorldMap={onBackToWorldMap}
      onToggleSecret={onToggleSecret}
      onOpenSongbook={onOpenSongbook}
      renderSubmap={(submapProps) => {
        latestSubmapProps = submapProps;
        return (
          <div data-testid="mock-submap">
            <span data-testid="mock-submap-region">{submapProps.region.id}</span>
            <span data-testid="mock-submap-selected">{submapProps.selectedSecretId ?? 'none'}</span>
            <span data-testid="mock-submap-trail">{submapProps.activeTrailSecretIds.join(',')}</span>
            <span data-testid="mock-submap-room">{submapProps.selectedRoomId ?? 'all'}</span>
            <button
              type="button"
              data-testid="mock-submap-click-room"
              onClick={() => submapProps.onSelectRoom('boulder-maze')}
            >
              Select Boulder Maze Room
            </button>
          </div>
        );
      }}
    />,
  );

  return {
    ...view,
    getLatestSubmapProps: () => latestSubmapProps,
    onSelectRegion,
    onToggleSecret,
    onOpenSongbook,
    onBackToWorldMap,
  };
}

describe('GuidedAreaWorkspace — 3-Lens Architecture', () => {
  it('renders only Co-Pilot (GPS) lens by default, syncs 1-2-3 activeTrailSecretIds to renderSubmap, and keeps Save for Later Visits collapsed', () => {
    let state = createDefaultProgressState();
    state = {
      ...state,
      ownedRequirementIds: {
        ...state.ownedRequirementIds,
        'kokiri-sword': true,
        'deku-shield': true,
        'stone-emerald': true,
        'zeldas-letter': true,
        'time-night': true,
      },
    };

    const onToggleSecret = vi.fn();
    const { getLatestSubmapProps } = renderGuidedWorkspace('kakariko-village', {
      state,
      onToggleSecret,
    });

    // Only Co-Pilot tabpanel is visible; Room Explorer & Quest Flow are hidden
    expect(screen.getByTestId('guided-lens-tab-copilot')).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByTestId('guided-tabpanel-copilot')).not.toHaveAttribute('hidden');
    expect(screen.getByTestId('guided-tabpanel-rooms')).toHaveAttribute('hidden');
    expect(screen.getByTestId('guided-tabpanel-quests')).toHaveAttribute('hidden');

    // Focused "Do This Next" card is present and drives 1 -> 2 -> 3 submap trail
    const stepCard = screen.getByTestId('copilot-active-step-card');
    expect(stepCard).toHaveTextContent(/Do This Next/i);

    const submapProps = getLatestSubmapProps();
    expect(submapProps).not.toBeNull();
    expect(submapProps!.activeTrailSecretIds).toHaveLength(3);
    expect(submapProps!.selectedSecretId).toBe(submapProps!.activeTrailSecretIds[0]);

    // Clicking "Mark Done & Next ->" checks off the focused secret
    const firstSecretId = submapProps!.selectedSecretId!;
    fireEvent.click(screen.getByTestId('copilot-mark-done-next-btn'));
    expect(onToggleSecret).toHaveBeenCalledWith(firstSecretId, true);

    // "Save for Later Visits" native <details> is collapsed by default and separates New Gear vs Adult Era
    const laterAccordion = screen.getByTestId('copilot-later-accordion');
    expect(laterAccordion).not.toHaveAttribute('open');
    expect(within(laterAccordion).getByTestId('copilot-later-gear-group')).toBeInTheDocument();
    expect(within(laterAccordion).getByTestId('copilot-later-era-group')).toBeInTheDocument();
  });

  it('displays whole-region reachability lock banner with 1-click jump to prerequisite region when area is unreachable', () => {
    const state = createDefaultProgressState();
    const summaries = computeAllRegionSummaries(state) as Record<
      string,
      RegionProgressSummary & { isReachable?: boolean; reachabilityBlocker?: string }
    >;
    summaries['hyrule-field'] = {
      ...summaries['hyrule-field'],
      isReachable: false,
      reachabilityBlocker: "Beat Inside the Great Deku Tree to claim Kokiri's Emerald first.",
    };

    const onSelectRegion = vi.fn();
    renderGuidedWorkspace('hyrule-field', {
      state,
      summariesOverride: summaries,
      onSelectRegion,
    });

    const lockBanner = screen.getByTestId('copilot-region-locked-banner');
    expect(lockBanner).toHaveTextContent(/Cannot Reach Hyrule Field Yet/i);
    expect(lockBanner).toHaveTextContent(/Great Deku Tree/i);

    const jumpBtn = screen.getByTestId('copilot-jump-prereq-btn');
    fireEvent.click(jumpBtn);
    expect(onSelectRegion).toHaveBeenCalledWith('deku-tree');
  });

  it('shows Visit Complete card with Suggested Next Destination when all doable current-visit secrets are done', () => {
    const base = createDefaultProgressState();
    const state: PlayerProgressState = {
      ...base,
      ownedRequirementIds: {
        ...base.ownedRequirementIds,
        'kokiri-sword': true,
        'deku-shield': true,
        'stone-emerald': true,
        'zeldas-letter': true,
      },
    };
    const rawEval = categorizeRegionSecrets('goron-city', state, 'blocker').allEvaluated.map(
      (ev) =>
        ev.status === 'available-now' || ev.status === 'available-via-alt'
          ? ({
              ...ev,
              status: 'completed' as const,
              visitStage: 'completed' as const,
            } as EvaluatedSecret)
          : ev,
    );

    const onSelectRegion = vi.fn();
    renderGuidedWorkspace('goron-city', {
      state,
      evaluatedSecretsOverride: rawEval,
      onSelectRegion,
    });

    const completeCard = screen.getByTestId('copilot-visit-complete-card');
    expect(completeCard).toHaveTextContent(/Visit Complete!/i);

    const nextBtn = screen.getByTestId('copilot-next-destination-btn');
    fireEvent.click(nextBtn);
    expect(onSelectRegion).toHaveBeenCalledTimes(1);
  });

  it('switches to Room Explorer + Unlock Radar when clicking a room on the Floor Map and surfaces UnlockDelta regions', () => {
    const base = applyStoryPreset(createDefaultProgressState(), 'fresh-adult-hookshot');
    const withoutHookshot = toggleRequirementOwned(base, 'hookshot', false);
    const withHookshot = toggleRequirementOwned(withoutHookshot, 'hookshot', true);
    const delta = computeUnlockDelta(withoutHookshot, withHookshot, 'Hookshot');

    const onSelectRegion = vi.fn();
    renderGuidedWorkspace('goron-city', {
      state: withHookshot,
      lastUnlockDelta: delta,
      onSelectRegion,
    });

    // Clicking a room on the Floor Map switches into Room Explorer filtered to that room
    fireEvent.click(screen.getByTestId('mock-submap-click-room'));
    expect(screen.getByTestId('guided-lens-tab-rooms')).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByTestId('guided-tabpanel-rooms')).not.toHaveAttribute('hidden');

    const radar = screen.getByTestId('unlock-radar-panel');
    expect(radar).toHaveTextContent(/Newly Unlocked Across Hyrule/i);
    expect(radar).toHaveTextContent(/Hookshot/i);

    const firstUnlockedRegionId = Object.keys(delta.byRegion)[0];
    fireEvent.click(screen.getByTestId(`unlock-radar-delta-region-${firstUnlockedRegionId}`));
    expect(onSelectRegion).toHaveBeenCalledWith(firstUnlockedRegionId);
  });

  it('renders Quest & Dependency Flow 3-stage chain and navigates to downstream unlocked regions', () => {
    const onSelectRegion = vi.fn();
    renderGuidedWorkspace('goron-city', { onSelectRegion });

    fireEvent.click(screen.getByTestId('guided-lens-tab-quests'));
    expect(screen.getByTestId('guided-lens-tab-quests')).toHaveAttribute('aria-selected', 'true');

    const questPanel = screen.getByTestId('quest-chain-panel');
    expect(within(questPanel).getByTestId('quest-stage-prerequisites')).toBeInTheDocument();
    expect(within(questPanel).getByTestId('quest-stage-current-finds')).toBeInTheDocument();
    expect(within(questPanel).getByTestId('quest-stage-downstream')).toBeInTheDocument();

    // Goron's Bracelet unlocks secrets in Dodongo's Cavern / Death Mountain Trail / etc.
    const downstreamButtons = within(
      screen.getByTestId('quest-stage-downstream'),
    ).getAllByRole('button');
    expect(downstreamButtons.length).toBeGreaterThan(0);
    fireEvent.click(downstreamButtons[0]);
    expect(onSelectRegion).toHaveBeenCalledTimes(1);
  });
});
