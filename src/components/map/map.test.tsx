import '@testing-library/jest-dom/vitest';
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, within } from '@testing-library/react';
import {
  DUNGEON_AND_SPECIAL_REGIONS,
  OVERWORLD_REGIONS,
  REGIONS,
  SECRETS_BY_REGION,
} from '../../data';
import {
  computeAllRegionSummaries,
  createDefaultProgressState,
} from '../../lib/gating';
import {
  computeNodeLayout,
  HyruleMapCanvas,
  type BoundingRect,
} from './index';

function rectsOverlap(a: BoundingRect, b: BoundingRect): boolean {
  return a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;
}

describe('HyruleMapCanvas & Map Nodes', () => {
  it('renders all 21 Overworld nodes and all 13 Dungeon/Special pins with accessible roles and labels', () => {
    const state = createDefaultProgressState();
    const summaries = computeAllRegionSummaries(state);
    const onSelectRegion = vi.fn();

    render(
      <HyruleMapCanvas
        state={state}
        regionSummaries={summaries}
        selectedRegionId="kokiri-forest"
        onSelectRegion={onSelectRegion}
      />,
    );

    expect(OVERWORLD_REGIONS).toHaveLength(21);
    expect(DUNGEON_AND_SPECIAL_REGIONS).toHaveLength(13);

    for (const region of REGIONS) {
      const node = screen.getByTestId(`map-node-${region.id}`);
      expect(node).toBeInTheDocument();
      expect(node).toHaveAttribute('data-region-kind', region.kind);
      expect(node).toHaveAttribute('role', 'button');
      expect(node).toHaveAttribute('tabindex', '0');
      expect(node).toHaveAttribute(
        'aria-pressed',
        region.id === 'kokiri-forest' ? 'true' : 'false',
      );

      const ariaLabel = node.getAttribute('aria-label') ?? '';
      expect(ariaLabel).toContain(region.name);
      expect(ariaLabel).toMatch(/completed/i);
    }
  });

  it('displays emerald +N Ready badges when readyNowCount > 0 and Triforce crest at 100% completion', () => {
    const state = createDefaultProgressState();
    // Complete every secret inside Inside the Great Deku Tree to verify 100% Triforce crest
    for (const sec of SECRETS_BY_REGION['deku-tree']) {
      state.completedSecretIds[sec.id] = true;
    }
    const summaries = computeAllRegionSummaries(state);

    render(
      <HyruleMapCanvas
        state={state}
        regionSummaries={summaries}
        selectedRegionId={null}
        onSelectRegion={vi.fn()}
      />,
    );

    // Kokiri Forest has immediate Child starter secrets ready right now
    expect(summaries['kokiri-forest'].readyNowCount).toBeGreaterThan(0);
    const kokiriReady = screen.getByTestId('map-ready-kokiri-forest');
    expect(kokiriReady).toHaveTextContent(`+${summaries['kokiri-forest'].readyNowCount} Ready`);

    // Great Deku Tree is 100% completed -> shows Triforce completion crest and no Ready badge
    expect(summaries['deku-tree'].isComplete).toBe(true);
    expect(screen.getByTestId('map-complete-deku-tree')).toBeInTheDocument();
    expect(screen.queryByTestId('map-ready-deku-tree')).not.toBeInTheDocument();
  });

  it('triggers onSelectRegion on click, Enter key, and Space key for both Overworld and Dungeon pins', () => {
    const state = createDefaultProgressState();
    const summaries = computeAllRegionSummaries(state);
    const onSelectRegion = vi.fn();

    render(
      <HyruleMapCanvas
        state={state}
        regionSummaries={summaries}
        selectedRegionId={null}
        onSelectRegion={onSelectRegion}
      />,
    );

    const hyruleField = screen.getByTestId('map-node-hyrule-field');
    fireEvent.click(hyruleField);
    expect(onSelectRegion).toHaveBeenLastCalledWith('hyrule-field');

    const waterTemple = screen.getByTestId('map-node-water-temple');
    fireEvent.keyDown(waterTemple, { key: 'Enter' });
    expect(onSelectRegion).toHaveBeenLastCalledWith('water-temple');

    const fallenFoes = screen.getByTestId('map-node-hall-of-fallen-foes');
    fireEvent.keyDown(fallenFoes, { key: ' ' });
    expect(onSelectRegion).toHaveBeenLastCalledWith('hall-of-fallen-foes');

    expect(onSelectRegion).toHaveBeenCalledTimes(3);
  });

  it('supports zoom controls and pointer drag threshold (>= 6px) without breaking clicks', () => {
    const state = createDefaultProgressState();
    const summaries = computeAllRegionSummaries(state);
    const onSelectRegion = vi.fn();

    render(
      <HyruleMapCanvas
        state={state}
        regionSummaries={summaries}
        selectedRegionId={null}
        onSelectRegion={onSelectRegion}
      />,
    );

    const zoomReset = screen.getByTestId('map-zoom-reset');
    expect(zoomReset).toHaveTextContent('100%');

    fireEvent.click(screen.getByTestId('map-zoom-in'));
    expect(zoomReset).toHaveTextContent('125%');

    fireEvent.click(screen.getByTestId('map-zoom-out'));
    expect(zoomReset).toHaveTextContent('100%');

    // Small pointer jitter (< 6px) does not suppress node clicks
    const viewport = screen.getByTestId('hyrule-map-viewport');
    fireEvent.pointerDown(viewport, { pointerId: 1, button: 0, clientX: 200, clientY: 200 });
    fireEvent.pointerMove(viewport, { pointerId: 1, clientX: 203, clientY: 202 });
    fireEvent.pointerUp(viewport, { pointerId: 1, clientX: 203, clientY: 202 });

    fireEvent.click(screen.getByTestId('map-node-kakariko-village'));
    expect(onSelectRegion).toHaveBeenCalledWith('kakariko-village');

    // Real pan drag (>= 6px) pans the camera and Reset View restores 100%
    fireEvent.pointerDown(viewport, { pointerId: 2, button: 0, clientX: 300, clientY: 300 });
    fireEvent.pointerMove(viewport, { pointerId: 2, clientX: 360, clientY: 340 });
    fireEvent.pointerUp(viewport, { pointerId: 2, clientX: 360, clientY: 340 });

    fireEvent.click(zoomReset);
    expect(zoomReset).toHaveTextContent('100%');
  });

  it('dims 0-match regions under Era / Switch 2 Spotlight filters while keeping them clickable', () => {
    const state = {
      ...createDefaultProgressState(),
      activeEraFilter: 'adult' as const,
      switch2SpotlightOnly: true,
    };
    const summaries = computeAllRegionSummaries(state);
    const onSelectRegion = vi.fn();
    const onEraFilterChange = vi.fn();
    const onSpotlightChange = vi.fn();

    render(
      <HyruleMapCanvas
        state={state}
        regionSummaries={summaries}
        selectedRegionId={null}
        onSelectRegion={onSelectRegion}
        onEraFilterChange={onEraFilterChange}
        onSpotlightChange={onSpotlightChange}
      />,
    );

    // Inside the Great Deku Tree is Child-only and has 0 Adult Switch 2 secrets -> dimmed, yet clickable!
    const dekuTree = screen.getByTestId('map-node-deku-tree');
    expect(dekuTree).toHaveAttribute('data-filtered-out', 'true');
    fireEvent.click(dekuTree);
    expect(onSelectRegion).toHaveBeenCalledWith('deku-tree');

    // Hyrule Field has Switch 2 secrets -> highlighted under Spotlight
    const hyruleField = screen.getByTestId('map-node-hyrule-field');
    expect(hyruleField).toHaveAttribute('data-spotlight-match', 'true');

    fireEvent.click(screen.getByTestId('map-era-child'));
    expect(onEraFilterChange).toHaveBeenCalledWith('child');

    fireEvent.click(screen.getByTestId('map-spotlight-toggle'));
    expect(onSpotlightChange).toHaveBeenCalledWith(false);
  });

  it('renders deduplicated roads, Lost Woods warps, Zora underwater shortcut tooltip, and node hover tooltip', () => {
    const state = createDefaultProgressState();
    const summaries = computeAllRegionSummaries(state);

    const { container } = render(
      <HyruleMapCanvas
        state={state}
        regionSummaries={summaries}
        selectedRegionId={null}
        onSelectRegion={vi.fn()}
      />,
    );

    // Lost Woods warp tunnels
    expect(container.querySelector('[data-edge="goron-city<->lost-woods"]')).toHaveAttribute(
      'data-edge-kind',
      'forest-warp',
    );
    expect(container.querySelector('[data-edge="lost-woods<->zoras-river"]')).toHaveAttribute(
      'data-edge-kind',
      'forest-warp',
    );

    // Zora's Domain <-> Lake Hylia Switch 2 underwater shortcut & tooltip
    expect(container.querySelector('[data-edge="lake-hylia<->zoras-domain"]')).toHaveAttribute(
      'data-edge-kind',
      'water-warp',
    );
    const zoraShortcut = screen.getByTestId('map-shortcut-zora-lake');
    fireEvent.focus(zoraShortcut);
    expect(screen.getByTestId('map-shortcut-tooltip')).toHaveTextContent(/unfreezes Zora's Domain/i);
    fireEvent.blur(zoraShortcut);

    // Node focus/hover HUD tooltip card with Heart Piece & Skulltula counters + Switch 2 highlight
    const kakariko = screen.getByTestId('map-node-kakariko-village');
    fireEvent.focus(kakariko);
    const tooltip = screen.getByTestId('map-node-tooltip');
    expect(within(tooltip).getByText('Kakariko Village')).toBeInTheDocument();
    expect(tooltip).toHaveTextContent('Heart Pieces');
    expect(tooltip).toHaveTextContent('Child Skulltulas');
    expect(tooltip).toHaveTextContent('Adult Skulltulas');
    expect(tooltip).toHaveTextContent(/Echo Gem/i);

    // MapLegend native disclosure renders and includes route & pin explanations
    const legend = screen.getByTestId('map-legend');
    expect(legend).toHaveTextContent('Map Legend');
    expect(legend).toHaveTextContent('Overworld (21)');
    expect(legend).toHaveTextContent('Zora Dive');
  });

  it('guarantees zero clipped or overlapping node circles, label pills, and +N Ready badges across all 34 regions', () => {
    const layouts = REGIONS.map((region) => ({
      region,
      layout: computeNodeLayout(region, 12),
    }));

    const zoraShortcutBadgeBox: BoundingRect = {
      cx: 602,
      cy: 502,
      width: 112,
      height: 17,
      left: 602 - 56,
      right: 602 + 56,
      top: 502 - 8.5,
      bottom: 502 + 8.5,
    };

    // 1. Every box stays strictly within the 1000 × 700 SVG map canvas without clipping
    for (const { region, layout } of layouts) {
      for (const [boxName, box] of [
        ['nodeBox', layout.nodeBox],
        ['pillBox', layout.pillBox],
        ['readyBox', layout.readyBox],
      ] as const) {
        expect(box.left, `${region.id} ${boxName}.left`).toBeGreaterThanOrEqual(6);
        expect(box.right, `${region.id} ${boxName}.right`).toBeLessThanOrEqual(994);
        expect(box.top, `${region.id} ${boxName}.top`).toBeGreaterThanOrEqual(6);
        expect(box.bottom, `${region.id} ${boxName}.bottom`).toBeLessThanOrEqual(694);
        expect(
          rectsOverlap(box, zoraShortcutBadgeBox),
          `${region.id} ${boxName} vs zoraShortcutBadge`,
        ).toBe(false);
      }

      // Within the same node, pill and ready badge never overlap the node circle or each other
      expect(rectsOverlap(layout.nodeBox, layout.pillBox), `${region.id} node vs pill`).toBe(false);
      expect(rectsOverlap(layout.nodeBox, layout.readyBox), `${region.id} node vs ready`).toBe(false);
      expect(rectsOverlap(layout.pillBox, layout.readyBox), `${region.id} pill vs ready`).toBe(false);
    }

    // 2. Pairwise non-intersection across ALL 34 regions (node circles, label pills, and +N Ready badges)
    for (let i = 0; i < layouts.length; i += 1) {
      for (let j = i + 1; j < layouts.length; j += 1) {
        const a = layouts[i];
        const b = layouts[j];
        const pairLabel = `${a.region.id} <-> ${b.region.id}`;

        expect(rectsOverlap(a.layout.nodeBox, b.layout.nodeBox), `${pairLabel} circles`).toBe(false);
        expect(rectsOverlap(a.layout.pillBox, b.layout.pillBox), `${pairLabel} pills`).toBe(false);
        expect(rectsOverlap(a.layout.readyBox, b.layout.readyBox), `${pairLabel} ready badges`).toBe(
          false,
        );
        expect(rectsOverlap(a.layout.pillBox, b.layout.readyBox), `${pairLabel} pillA vs readyB`).toBe(
          false,
        );
        expect(rectsOverlap(a.layout.readyBox, b.layout.pillBox), `${pairLabel} readyA vs pillB`).toBe(
          false,
        );
        expect(rectsOverlap(a.layout.pillBox, b.layout.nodeBox), `${pairLabel} pillA vs nodeB`).toBe(
          false,
        );
        expect(rectsOverlap(a.layout.nodeBox, b.layout.pillBox), `${pairLabel} nodeA vs pillB`).toBe(
          false,
        );
        expect(rectsOverlap(a.layout.readyBox, b.layout.nodeBox), `${pairLabel} readyA vs nodeB`).toBe(
          false,
        );
        expect(rectsOverlap(a.layout.nodeBox, b.layout.readyBox), `${pairLabel} nodeA vs readyB`).toBe(
          false,
        );
      }
    }
  });
});
