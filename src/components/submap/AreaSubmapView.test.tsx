import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { REGION_BY_ID, SECRETS_BY_REGION } from '../../data';
import type { EvaluatedSecret } from '../../types/zelda';
import { AreaSubmapView } from './AreaSubmapView';

function toMockEvaluated(
  secret: (typeof SECRETS_BY_REGION)[string][number],
  forceAvailable = false,
): EvaluatedSecret {
  const isAdult = !forceAvailable && secret.era === 'adult';
  return {
    secret,
    status: isAdult ? 'locked' : 'available-now',
    missingPrimaryIds: isAdult ? ['era-adult'] : [],
    satisfiedAltMethods: [],
    primaryBlockerGroupKey: isAdult ? 'era-adult' : 'ready',
    primaryBlockerLabel: isAdult ? 'Adult Era Visit' : 'Ready Now',
    primaryBlockerCategory: isAdult ? 'cross-era' : 'other',
  };
}

function makeGoronEvaluatedSecrets(): EvaluatedSecret[] {
  const baseSecrets = SECRETS_BY_REGION['goron-city'] ?? [];
  return baseSecrets.map((secret) => toMockEvaluated(secret));
}

describe('<AreaSubmapView />', () => {
  it('renders Goron City 4-floor blueprint tabs and switches floors via click, keyboard, and stair connectors', () => {
    const goronRegion = REGION_BY_ID['goron-city'];
    const onSelectFloor = vi.fn();

    render(
      <AreaSubmapView
        region={goronRegion}
        evaluatedSecrets={makeGoronEvaluatedSecrets()}
        onSelectFloor={onSelectFloor}
      />,
    );

    const tab4F = screen.getByRole('tab', { name: /4F/i });
    const tab3F = screen.getByRole('tab', { name: /3F/i });
    const tab2F = screen.getByRole('tab', { name: /2F/i });
    const tab1F = screen.getByRole('tab', { name: /1F/i });

    expect(tab4F.getAttribute('aria-selected')).toBe('true');
    expect(tab1F.getAttribute('aria-selected')).toBe('false');

    // Switch to 3F via tab click
    fireEvent.click(tab3F);
    expect(tab3F.getAttribute('aria-selected')).toBe('true');
    expect(onSelectFloor).toHaveBeenCalledWith('3f');

    // Switch from 3F -> 2F via ArrowRight keyboard navigation
    fireEvent.keyDown(tab3F, { key: 'ArrowRight' });
    expect(tab2F.getAttribute('aria-selected')).toBe('true');

    // Jump straight from 4F -> 1F via the Chasm Drop SVG connector
    fireEvent.click(tab4F);
    const chasmDrop = screen.getByRole('button', { name: /Chasm Drop → 1F/i });
    fireEvent.click(chasmDrop);
    expect(tab1F.getAttribute('aria-selected')).toBe('true');
  });

  it('highlights the floor holding Co-Pilot Step 1 and renders numbered trail badges & dashed path', () => {
    const goronRegion = REGION_BY_ID['goron-city'];

    render(
      <AreaSubmapView
        region={goronRegion}
        evaluatedSecrets={makeGoronEvaluatedSecrets()}
        activeTrailSecretIds={['eq-goron-bracelet', 'hp-17']}
      />,
    );

    // Step 1 ('eq-goron-bracelet') is on 1F — auto-opens 1F and tags the 1F tab with "Step 1"
    expect(screen.getByTestId('floor-step1-1f')).toBeDefined();
    expect(screen.getByRole('tab', { name: /1F/i }).getAttribute('aria-selected')).toBe('true');

    // Both Step 1 and Step 2 are on 1F, so badges 1 & 2 AND the dashed trail path render
    expect(screen.getByTestId('trail-step-badge-1')).toBeDefined();
    expect(screen.getByTestId('trail-step-badge-2')).toBeDefined();
    expect(screen.getByTestId('copilot-trail-path')).toBeDefined();
  });

  it('tucks Adult/locked pins when hideLaterVisits is true and toggles them via "Show Later/Adult Pins"', () => {
    const goronRegion = REGION_BY_ID['goron-city'];
    const { container } = render(
      <AreaSubmapView
        region={goronRegion}
        evaluatedSecrets={makeGoronEvaluatedSecrets()}
        hideLaterVisits={true}
      />,
    );

    // On 4F, Child GS #30 ('gs-030') is untucked while Adult GS #31 ('gs-031') is tucked
    const childPin = container.querySelector('[data-secret-id="gs-030"]');
    const adultPin = container.querySelector('[data-secret-id="gs-031"]');
    expect(childPin?.getAttribute('data-tucked')).toBe('false');
    expect(adultPin?.getAttribute('data-tucked')).toBe('true');

    const toggleBtn = screen.getByRole('button', { name: /Show Later\/Adult Pins/i });
    expect(toggleBtn.getAttribute('aria-pressed')).toBe('false');

    fireEvent.click(toggleBtn);
    expect(toggleBtn.getAttribute('aria-pressed')).toBe('true');
    expect(adultPin?.getAttribute('data-tucked')).toBe('false');
  });

  it('fires room, secret, check-off, connected-region, and back-to-world callbacks cleanly', () => {
    const goronRegion = REGION_BY_ID['goron-city'];
    const onSelectRoom = vi.fn();
    const onSelectSecret = vi.fn();
    const onToggleSecret = vi.fn();
    const onSelectConnectedRegion = vi.fn();
    const onBackToWorldMap = vi.fn();

    const { container } = render(
      <AreaSubmapView
        region={goronRegion}
        evaluatedSecrets={makeGoronEvaluatedSecrets()}
        onSelectRoom={onSelectRoom}
        onSelectSecret={onSelectSecret}
        onToggleSecret={onToggleSecret}
        onSelectConnectedRegion={onSelectConnectedRegion}
        onBackToWorldMap={onBackToWorldMap}
      />,
    );

    // Click room polygon
    const boulderMazeRoom = container.querySelector('[data-room-id="gc-4f-boulder-maze"]')!;
    fireEvent.click(boulderMazeRoom);
    expect(onSelectRoom).toHaveBeenCalledWith('gc-4f-boulder-maze');

    // Click secret pin ('gs-030') and then 1-click "Mark Found"
    const gs30Pin = container.querySelector('[data-secret-id="gs-030"]')!;
    fireEvent.click(gs30Pin);
    expect(onSelectSecret).toHaveBeenCalledWith('gs-030');

    const markFoundBtn = screen.getByRole('button', { name: /Mark Found/i });
    fireEvent.click(markFoundBtn);
    expect(onToggleSecret).toHaveBeenCalledWith('gs-030', true);

    // Click gateway pin to Death Mountain Trail
    const trailExitPin = container.querySelector('[data-pin-id="gc-pin-dmt-exit"]')!;
    fireEvent.click(trailExitPin);
    expect(onSelectConnectedRegion).toHaveBeenCalledWith('death-mountain-trail');

    // Click Back to World Map
    fireEvent.click(screen.getByRole('button', { name: /World Map/i }));
    expect(onBackToWorldMap).toHaveBeenCalledTimes(1);
  });

  it('renders Dungeon Key/Map/Compass metadata strip for dungeons and dynamic fallback for Phase 2 temples', () => {
    const wellRegion = REGION_BY_ID['bottom-of-the-well'];
    const wellSecrets: EvaluatedSecret[] = (SECRETS_BY_REGION['bottom-of-the-well'] ?? []).map(
      (secret) => toMockEvaluated(secret, true),
    );

    const { unmount } = render(
      <AreaSubmapView region={wellRegion} evaluatedSecrets={wellSecrets} />,
    );

    expect(screen.getByTestId('dungeon-meta-strip').textContent).toContain('Small Keys: 3');
    fireEvent.click(screen.getByRole('button', { name: /Key & Routing Notes/i }));
    expect(screen.getByText(/0 Keys needed for Lens of Truth/i)).toBeDefined();
    unmount();

    // Verify Phase 2 Adult dungeon fallback ('forest-temple') renders smoothly
    const forestTemple = REGION_BY_ID['forest-temple'];
    const forestSecrets: EvaluatedSecret[] = (SECRETS_BY_REGION['forest-temple'] ?? []).map(
      (secret) => toMockEvaluated(secret, true),
    );
    render(<AreaSubmapView region={forestTemple} evaluatedSecrets={forestSecrets} />);
    expect(screen.getByText(/Forest Temple — Schematic Sub-Map/i)).toBeDefined();
    expect(screen.getByTestId('dungeon-meta-strip').textContent).toContain('Small Keys: 5');
  });
});
