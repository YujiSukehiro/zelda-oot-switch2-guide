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
  buildNodeHitBridgePoints,
  buildReadyBadgeHitBridgePoints,
  computeNodeLayout,
  HyruleMapCanvas,
  ILLUSTRATED_COORDS,
  ILLUSTRATED_LABEL_OVERRIDES,
  resolveRegionMapCoords,
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

  it('supports Illustrated vs Topo map layer switching, 2-finger pinch-to-zoom, double-click zoom, and Focus Selected camera centering', () => {
    const state = createDefaultProgressState();
    const summaries = computeAllRegionSummaries(state);
    const onMapLayerModeChange = vi.fn();

    render(
      <HyruleMapCanvas
        state={state}
        regionSummaries={summaries}
        selectedRegionId="zoras-domain"
        onSelectRegion={vi.fn()}
        mapLayerMode="illustrated"
        onMapLayerModeChange={onMapLayerModeChange}
      />,
    );

    const layerToggle = screen.getByTestId('map-layer-toggle');
    expect(layerToggle).toHaveAttribute('aria-pressed', 'true');
    fireEvent.click(layerToggle);
    expect(onMapLayerModeChange).toHaveBeenCalledWith('schematic');

    const viewport = screen.getByTestId('hyrule-map-viewport');
    const zoomReset = screen.getByTestId('map-zoom-reset');
    expect(zoomReset).toHaveTextContent('100%');

    // Simulate 2-finger pinch-to-zoom spreading from 100px apart to 200px apart -> ~200% zoom
    fireEvent.pointerDown(viewport, {
      pointerId: 10,
      pointerType: 'touch',
      clientX: 200,
      clientY: 200,
    });
    fireEvent.pointerDown(viewport, {
      pointerId: 11,
      pointerType: 'touch',
      clientX: 300,
      clientY: 200,
    });
    fireEvent.pointerMove(viewport, {
      pointerId: 11,
      pointerType: 'touch',
      clientX: 400,
      clientY: 200,
    });
    fireEvent.pointerUp(viewport, {
      pointerId: 11,
      pointerType: 'touch',
      clientX: 400,
      clientY: 200,
    });
    fireEvent.pointerUp(viewport, {
      pointerId: 10,
      pointerType: 'touch',
      clientX: 200,
      clientY: 200,
    });
    expect(zoomReset).toHaveTextContent('200%');

    // Double-click resets back to 100%, and double-clicking again zooms to 200%
    fireEvent.doubleClick(viewport, { clientX: 250, clientY: 200 });
    expect(zoomReset).toHaveTextContent('100%');
    fireEvent.doubleClick(viewport, { clientX: 250, clientY: 200 });
    expect(zoomReset).toHaveTextContent('200%');

    // Focus Selected centers on Zora's Domain
    const focusBtn = screen.getByTestId('map-focus-selected');
    fireEvent.click(focusBtn);
    expect(zoomReset).not.toHaveTextContent('100%');
  });

  it('calibrates all 34 regions in ILLUSTRATED_COORDS, hides brown road edges in illustrated mode, and supports Hide Completed, unreachable lock state, and Enter Area Map CTA', () => {
    // Every region has calibrated illustrated coordinates within the 1000x700 viewBox
    for (const region of REGIONS) {
      const pt = ILLUSTRATED_COORDS[region.id];
      expect(pt, `Missing ILLUSTRATED_COORDS for ${region.id}`).toBeDefined();
      expect(pt.x).toBeGreaterThanOrEqual(40);
      expect(pt.x).toBeLessThanOrEqual(965);
      expect(pt.y).toBeGreaterThanOrEqual(50);
      expect(pt.y).toBeLessThanOrEqual(665);
    }

    const state = createDefaultProgressState();
    const summaries = computeAllRegionSummaries(state) as Record<
      string,
      ReturnType<typeof computeAllRegionSummaries>[string] & {
        isReachable?: boolean;
        reachabilityBlocker?: string;
      }
    >;
    summaries['ganons-castle'] = {
      ...summaries['ganons-castle'],
      isReachable: false,
      reachabilityBlocker: 'Awaken all 6 Sages',
    };
    summaries['kokiri-forest'] = {
      ...summaries['kokiri-forest'],
      completedCount: summaries['kokiri-forest'].totalCount,
      isComplete: true,
      percent: 100,
    };

    const onEnterAreaMap = vi.fn();
    const { container, rerender } = render(
      <HyruleMapCanvas
        state={state}
        regionSummaries={summaries}
        selectedRegionId="goron-city"
        onSelectRegion={vi.fn()}
        onEnterAreaMap={onEnterAreaMap}
        mapLayerMode="illustrated"
      />,
    );

    // Road edges are hidden in illustrated mode so painted roads aren't double-drawn
    expect(container.querySelectorAll('[data-edge-kind="road"]')).toHaveLength(0);

    // Unreachable region displays lock crest and data-reachable="false"
    expect(screen.getByTestId('map-node-ganons-castle')).toHaveAttribute(
      'data-reachable',
      'false',
    );
    expect(screen.getByTestId('map-lock-ganons-castle')).toBeInTheDocument();

    // Hide Completed toggle pill hides 100% completed areas
    const hideCompletedBtn = screen.getByTestId('map-hide-completed-toggle');
    expect(hideCompletedBtn).toHaveAttribute('aria-pressed', 'false');
    fireEvent.click(hideCompletedBtn);
    expect(hideCompletedBtn).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByTestId('map-node-kokiri-forest')).toHaveAttribute(
      'data-completed-hidden',
      'true',
    );

    // Prominent "Enter Area / Floor Map ->" action triggers onEnterAreaMap
    fireEvent.click(screen.getByTestId('map-enter-area-btn'));
    expect(onEnterAreaMap).toHaveBeenCalledWith('goron-city');

    // Switching to schematic mode restores vector road edges
    rerender(
      <HyruleMapCanvas
        state={state}
        regionSummaries={summaries}
        selectedRegionId="goron-city"
        onSelectRegion={vi.fn()}
        onEnterAreaMap={onEnterAreaMap}
        mapLayerMode="schematic"
      />,
    );
    expect(container.querySelectorAll('[data-edge-kind="road"]').length).toBeGreaterThan(0);
  });

  it('guarantees every node <g> bbox center lands inside its own painted hit geometry (and never inside a neighbor) across illustrated & schematic modes', () => {
    const parsePolygon = (pts: string) =>
      pts.split(' ').map((pair) => {
        const [px, py] = pair.split(',').map(Number);
        return { x: px, y: py };
      });

    const pointInConvexQuad = (px: number, py: number, poly: Array<{ x: number; y: number }>) => {
      // Ray-casting point-in-polygon with tiny boundary tolerance
      let inside = false;
      for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
        const xi = poly[i].x;
        const yi = poly[i].y;
        const xj = poly[j].x;
        const yj = poly[j].y;
        // Check exact segment proximity (<= 0.05px)
        const dx = xj - xi;
        const dy = yj - yi;
        const lenSq = dx * dx + dy * dy;
        const t = lenSq > 0 ? Math.max(0, Math.min(1, ((px - xi) * dx + (py - yi) * dy) / lenSq)) : 0;
        if (Math.hypot(px - (xi + t * dx), py - (yi + t * dy)) <= 0.05) {
          return true;
        }
        const intersect =
          yi > py !== yj > py && px < ((xj - xi) * (py - yi)) / (yj - yi) + xi;
        if (intersect) inside = !inside;
      }
      return inside;
    };

    const pointInRect = (px: number, py: number, r: BoundingRect) =>
      px >= r.left - 0.05 && px <= r.right + 0.05 && py >= r.top - 0.05 && py <= r.bottom + 0.05;

    const failures: string[] = [];

    for (const mode of ['illustrated', 'schematic'] as const) {
      for (const withReadyBadge of [false, true]) {
        const orderedRegions = [...OVERWORLD_REGIONS, ...DUNGEON_AND_SPECIAL_REGIONS];
        const geometries = orderedRegions.map((region) => {
          const coords = resolveRegionMapCoords(region, mode);
          const labelOverride =
            mode === 'illustrated' ? ILLUSTRATED_LABEL_OVERRIDES[region.id] : undefined;
          const layout = computeNodeLayout(region, withReadyBadge ? 3 : 0, {
            coords,
            labelOverride,
          });
          const focusHaloR = layout.nodeRadius + (region.kind === 'overworld' ? 4.5 : 4.4);
          let left = Math.min(coords.x - focusHaloR, layout.pillBox.left);
          let right = Math.max(coords.x + focusHaloR, layout.pillBox.right);
          let top = Math.min(coords.y - focusHaloR, layout.pillBox.top);
          let bottom = Math.max(coords.y + focusHaloR, layout.pillBox.bottom);
          if (withReadyBadge) {
            left = Math.min(left, layout.readyBox.left);
            right = Math.max(right, layout.readyBox.right);
            top = Math.min(top, layout.readyBox.top);
            bottom = Math.max(bottom, layout.readyBox.bottom);
          }
          const bboxCx = (left + right) / 2;
          const bboxCy = (top + bottom) / 2;
          const bridgePoly = parsePolygon(buildNodeHitBridgePoints(coords.x, coords.y, layout));
          const readyBridgePoly = parsePolygon(buildReadyBadgeHitBridgePoints(layout));

          const hitsNode = (px: number, py: number) =>
            Math.hypot(px - coords.x, py - coords.y) <= layout.nodeRadius + 0.05 ||
            pointInRect(px, py, layout.pillBox) ||
            pointInConvexQuad(px, py, bridgePoly) ||
            (withReadyBadge &&
              (pointInRect(px, py, layout.readyBox) ||
                pointInConvexQuad(px, py, readyBridgePoly)));

          return { region, coords, layout, bboxCx, bboxCy, hitsNode };
        });

        for (let i = 0; i < geometries.length; i += 1) {
          const g = geometries[i];
          if (!g.hitsNode(g.bboxCx, g.bboxCy)) {
            failures.push(
              `${mode} (ready=${withReadyBadge}): ${g.region.id} <g> bbox center (${g.bboxCx.toFixed(1)}, ${g.bboxCy.toFixed(1)}) missed its own hit target`,
            );
          }

          // Ensure no node rendered later in SVG order intercepts this node's bbox center
          for (let j = i + 1; j < geometries.length; j += 1) {
            const later = geometries[j];
            if (later.hitsNode(g.bboxCx, g.bboxCy)) {
              failures.push(
                `${mode} (ready=${withReadyBadge}): ${later.region.id} intercepts ${g.region.id} <g> bbox center (${g.bboxCx.toFixed(1)}, ${g.bboxCy.toFixed(1)})`,
              );
            }
          }
        }
      }
    }

    expect(failures).toEqual([]);
  });
});
