import { useMemo, useRef, useState, type PointerEvent as ReactPointerEvent, type WheelEvent as ReactWheelEvent } from 'react';
import { RotateCcw, Sparkles, Waves, ZoomIn, ZoomOut } from 'lucide-react';
import {
  DUNGEON_AND_SPECIAL_REGIONS,
  OVERWORLD_REGIONS,
  REGIONS,
  REGION_BY_ID,
} from '../../data';
import { computeRegionSummary, deriveEffectiveRequirements } from '../../lib/gating';
import type {
  EraFilter,
  PlayerProgressState,
  Region,
  RegionProgressSummary,
} from '../../types/zelda';
import { DungeonPin } from './DungeonPin';
import { MapLegend } from './MapLegend';
import { formatRegionKindLabel, RegionNode } from './RegionNode';
import './map.css';

export interface HyruleMapCanvasProps {
  state: PlayerProgressState;
  regionSummaries: Record<string, RegionProgressSummary>;
  selectedRegionId: string | null;
  onSelectRegion: (regionId: string) => void;
  onEraFilterChange?: (era: EraFilter) => void;
  onSpotlightChange?: (enabled: boolean) => void;
}

type EdgeKind = 'road' | 'forest-warp' | 'water-warp' | 'tether' | 'dream-link';

interface MapConnectionEdge {
  key: string;
  from: Region;
  to: Region;
  kind: EdgeKind;
  pathD: string;
}

const MIN_ZOOM = 0.85;
const MAX_ZOOM = 2.5;
const ZOOM_STEP = 0.25;
const DRAG_THRESHOLD_PX = 6;

const ERA_OPTIONS: ReadonlyArray<{ id: EraFilter; label: string }> = [
  { id: 'all', label: 'All Eras' },
  { id: 'child', label: 'Child' },
  { id: 'adult', label: 'Adult' },
];

function clamp(val: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, val));
}

function buildCurvedEdgePath(from: Region, to: Region, kind: EdgeKind, key: string): string {
  const x1 = from.mapCoords.x;
  const y1 = from.mapCoords.y;
  const x2 = to.mapCoords.x;
  const y2 = to.mapCoords.y;

  if (kind === 'tether') {
    return `M ${x1} ${y1} L ${x2} ${y2}`;
  }

  if (key === 'lake-hylia<->zoras-domain') {
    // Graceful southern underwater warp curve avoiding central Hyrule Field labels
    return `M 855 340 Q 565 535 420 600`;
  }

  if (key === 'goron-city<->lost-woods') {
    return `M 780 465 Q 835 305 730 145`;
  }

  if (key === 'lost-woods<->zoras-river') {
    return `M 780 465 Q 775 415 735 375`;
  }

  if (key === 'lost-woods<->zoras-domain') {
    return `M 780 465 Q 838 418 855 340`;
  }

  const mx = (x1 + x2) / 2;
  const my = (y1 + y2) / 2;
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.hypot(dx, dy) || 1;
  const bend = kind === 'dream-link' ? 18 : Math.min(16, len * 0.08);
  const nx = (-dy / len) * bend;
  const ny = (dx / len) * bend;

  return `M ${x1} ${y1} Q ${(mx + nx).toFixed(1)} ${(my + ny).toFixed(1)} ${x2} ${y2}`;
}

function buildDeduplicatedEdges(): MapConnectionEdge[] {
  const seen = new Set<string>();
  const edges: MapConnectionEdge[] = [];

  for (const reg of REGIONS) {
    for (const neighborId of reg.connectedRegions) {
      const neighbor = REGION_BY_ID[neighborId];
      if (!neighbor) continue;

      const key = reg.id < neighbor.id ? `${reg.id}<->${neighbor.id}` : `${neighbor.id}<->${reg.id}`;
      if (seen.has(key)) continue;
      seen.add(key);

      let kind: EdgeKind = 'road';
      if (reg.parentRegionId === neighbor.id || neighbor.parentRegionId === reg.id) {
        kind = 'tether';
      } else if (reg.id === 'hall-of-fallen-foes' || neighbor.id === 'hall-of-fallen-foes') {
        kind = 'dream-link';
      } else if (key === 'lake-hylia<->zoras-domain') {
        kind = 'water-warp';
      } else if (
        key === 'goron-city<->lost-woods' ||
        key === 'lost-woods<->zoras-river' ||
        key === 'lost-woods<->zoras-domain'
      ) {
        kind = 'forest-warp';
      }

      edges.push({
        key,
        from: reg,
        to: neighbor,
        kind,
        pathD: buildCurvedEdgePath(reg, neighbor, kind, key),
      });
    }
  }

  return edges;
}

const DEDUPLICATED_MAP_EDGES: readonly MapConnectionEdge[] = buildDeduplicatedEdges();

interface DragSession {
  pointerId: number;
  startClientX: number;
  startClientY: number;
  startPanX: number;
  startPanY: number;
  exceededThreshold: boolean;
}

export function HyruleMapCanvas({
  state,
  regionSummaries,
  selectedRegionId,
  onSelectRegion,
  onEraFilterChange,
  onSpotlightChange,
}: HyruleMapCanvasProps) {
  const [zoom, setZoom] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [hoveredRegionId, setHoveredRegionId] = useState<string | null>(null);
  const [isShortcutHovered, setIsShortcutHovered] = useState<boolean>(false);
  const [uncontrolledSpotlight, setUncontrolledSpotlight] = useState<boolean>(false);

  const viewportRef = useRef<HTMLDivElement | null>(null);
  const dragSessionRef = useRef<DragSession | null>(null);
  const suppressNextClickRef = useRef<boolean>(false);

  const effectiveSpotlight = onSpotlightChange
    ? Boolean(state.switch2SpotlightOnly)
    : Boolean(state.switch2SpotlightOnly) || uncontrolledSpotlight;

  const effectiveRequirements = useMemo(() => deriveEffectiveRequirements(state), [state]);
  const isZoraThawed = effectiveRequirements.has('zora-thawed');

  const resolvedSummaries = useMemo(() => {
    const effectiveState: PlayerProgressState =
      effectiveSpotlight !== Boolean(state.switch2SpotlightOnly)
        ? { ...state, switch2SpotlightOnly: effectiveSpotlight }
        : state;

    const map: Record<string, RegionProgressSummary> = {};
    for (const region of REGIONS) {
      if (
        effectiveSpotlight === Boolean(state.switch2SpotlightOnly) &&
        regionSummaries[region.id]
      ) {
        map[region.id] = regionSummaries[region.id];
      } else {
        map[region.id] = computeRegionSummary(region.id, effectiveState, effectiveRequirements);
      }
    }
    return map;
  }, [effectiveRequirements, effectiveSpotlight, regionSummaries, state]);

  const hasActiveFilter = state.activeEraFilter !== 'all' || effectiveSpotlight;

  const handleZoomBy = (delta: number) => {
    setZoom((prev) => {
      const next = Number(clamp(prev + delta, MIN_ZOOM, MAX_ZOOM).toFixed(2));
      if (next === 1) {
        setPan((currentPan) => ({
          x: clamp(currentPan.x, -360, 360),
          y: clamp(currentPan.y, -260, 260),
        }));
      }
      return next;
    });
  };

  const handleResetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  const handleWheel = (event: ReactWheelEvent<HTMLDivElement>) => {
    event.preventDefault();
    const step = event.deltaY < 0 ? 0.14 : -0.14;
    setZoom((prev) => Number(clamp(prev + step, MIN_ZOOM, MAX_ZOOM).toFixed(2)));
  };

  const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) return;
    suppressNextClickRef.current = false;
    dragSessionRef.current = {
      pointerId: event.pointerId,
      startClientX: event.clientX,
      startClientY: event.clientY,
      startPanX: pan.x,
      startPanY: pan.y,
      exceededThreshold: false,
    };
  };

  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const session = dragSessionRef.current;
    if (!session || session.pointerId !== event.pointerId) return;

    const dxPx = event.clientX - session.startClientX;
    const dyPx = event.clientY - session.startClientY;
    const distance = Math.hypot(dxPx, dyPx);

    if (!session.exceededThreshold) {
      if (distance < DRAG_THRESHOLD_PX) {
        return;
      }
      session.exceededThreshold = true;
      suppressNextClickRef.current = true;
      setIsDragging(true);
      event.currentTarget.setPointerCapture?.(event.pointerId);
    }

    const rect = viewportRef.current?.getBoundingClientRect();
    const scaleToViewBoxX = rect && rect.width > 0 ? 1000 / rect.width : 1;
    const scaleToViewBoxY = rect && rect.height > 0 ? 700 / rect.height : 1;

    const maxPanX = 380 * zoom;
    const maxPanY = 270 * zoom;

    setPan({
      x: clamp(session.startPanX + dxPx * scaleToViewBoxX, -maxPanX, maxPanX),
      y: clamp(session.startPanY + dyPx * scaleToViewBoxY, -maxPanY, maxPanY),
    });
  };

  const endPointerDrag = (event: ReactPointerEvent<HTMLDivElement>) => {
    const session = dragSessionRef.current;
    if (!session || session.pointerId !== event.pointerId) return;

    if (session.exceededThreshold) {
      if (event.currentTarget.hasPointerCapture?.(event.pointerId)) {
        event.currentTarget.releasePointerCapture(event.pointerId);
      }
      setIsDragging(false);
      // Clear click suppression right after the pointerup click dispatch tick
      window.setTimeout(() => {
        suppressNextClickRef.current = false;
      }, 0);
    }
    dragSessionRef.current = null;
  };

  const handleNodeSelect = (regionId: string) => {
    if (suppressNextClickRef.current) {
      suppressNextClickRef.current = false;
      return;
    }
    onSelectRegion(regionId);
  };

  const handleToggleSpotlight = () => {
    if (onSpotlightChange) {
      onSpotlightChange(!Boolean(state.switch2SpotlightOnly));
    } else {
      setUncontrolledSpotlight((prev) => !prev);
    }
  };

  const hoveredRegion = hoveredRegionId ? REGION_BY_ID[hoveredRegionId] ?? null : null;
  const hoveredSummary = hoveredRegion ? resolvedSummaries[hoveredRegion.id] : null;
  const flipTooltipToTop = Boolean(
    hoveredRegion && hoveredRegion.mapCoords.x > 610 && hoveredRegion.mapCoords.y > 430,
  );

  const isDefaultCamera = zoom === 1 && pan.x === 0 && pan.y === 0;
  const cameraTransform = isDefaultCamera
    ? undefined
    : `translate(${(500 + pan.x).toFixed(2)} ${(350 + pan.y).toFixed(2)}) scale(${zoom}) translate(-500 -350)`;

  return (
    <section
      className="hyrule-map-shell"
      data-testid="hyrule-map-canvas"
      aria-label="Interactive Topographic Map of Hyrule"
    >
      {/* Top Compact HUD Controls */}
      <div className="hyrule-map-hud-top">
        <div className="hyrule-map-hud-group">
          {onEraFilterChange && (
            <div className="map-hud-pill-group" role="group" aria-label="Filter map by Era">
              {ERA_OPTIONS.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  className="map-hud-btn"
                  data-testid={`map-era-${option.id}`}
                  aria-pressed={state.activeEraFilter === option.id}
                  onClick={() => onEraFilterChange(option.id)}
                >
                  {option.label}
                </button>
              ))}
            </div>
          )}

          <button
            type="button"
            className="map-hud-btn map-hud-btn--standalone map-hud-btn--spotlight"
            data-testid="map-spotlight-toggle"
            aria-pressed={effectiveSpotlight}
            aria-label="Toggle Switch 2 Changes Spotlight"
            onClick={handleToggleSpotlight}
          >
            <Sparkles size={13} aria-hidden="true" />
            <span className="map-hud-btn__label-long">Switch 2 Spotlight</span>
            <span className="map-hud-btn__label-short">SW2 Spotlight</span>
          </button>
        </div>

        <div
          className="hyrule-map-hud-group map-hud-pill-group"
          role="toolbar"
          aria-label="Map zoom and pan controls"
        >
          <button
            type="button"
            className="map-hud-btn map-hud-btn--icon"
            data-testid="map-zoom-out"
            aria-label="Zoom out"
            disabled={zoom <= MIN_ZOOM}
            onClick={() => handleZoomBy(-ZOOM_STEP)}
          >
            <ZoomOut size={14} aria-hidden="true" />
          </button>
          <button
            type="button"
            className="map-hud-btn"
            data-testid="map-zoom-reset"
            aria-label="Reset map zoom and pan to 100%"
            onClick={handleResetView}
          >
            <RotateCcw size={12} aria-hidden="true" />
            <span className="map-hud-btn__zoom-readout">{Math.round(zoom * 100)}%</span>
          </button>
          <button
            type="button"
            className="map-hud-btn map-hud-btn--icon"
            data-testid="map-zoom-in"
            aria-label="Zoom in"
            disabled={zoom >= MAX_ZOOM}
            onClick={() => handleZoomBy(ZOOM_STEP)}
          >
            <ZoomIn size={14} aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* Interactive Pan/Zoom Topographic SVG Viewport */}
      <div
        ref={viewportRef}
        className={`hyrule-map-viewport${isDragging ? ' is-dragging' : ''}`}
        data-testid="hyrule-map-viewport"
        onWheel={handleWheel}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={endPointerDrag}
        onPointerCancel={endPointerDrag}
      >
        <svg
          className="hyrule-map-svg"
          viewBox="0 0 1000 700"
          preserveAspectRatio="xMidYMid meet"
          role="group"
          aria-label="Hyrule Regions and Dungeons"
        >
          <defs>
            <radialGradient id="hyrule-ocean-vignette" cx="50%" cy="50%" r="65%">
              <stop offset="0%" stopColor="var(--bg-map-ocean)" stopOpacity="0" />
              <stop offset="100%" stopColor="var(--bg-canvas)" stopOpacity="0.55" />
            </radialGradient>
            <radialGradient id="caldera-glow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="var(--biome-volcano)" stopOpacity="0.34" />
              <stop offset="65%" stopColor="var(--biome-mountain)" stopOpacity="0.14" />
              <stop offset="100%" stopColor="var(--biome-mountain)" stopOpacity="0" />
            </radialGradient>
          </defs>

          <g className="hyrule-map-camera" transform={cameraTransform}>
            {/* Ocean Backdrop & Subtle Cartographic Grid */}
            <rect x="0" y="0" width="1000" height="700" fill="var(--bg-map-ocean)" />
            <g aria-hidden="true" stroke="var(--map-grid-line)" strokeWidth="1">
              <line x1="200" y1="0" x2="200" y2="700" />
              <line x1="400" y1="0" x2="400" y2="700" />
              <line x1="600" y1="0" x2="600" y2="700" />
              <line x1="800" y1="0" x2="800" y2="700" />
              <line x1="0" y1="175" x2="1000" y2="175" />
              <line x1="0" y1="350" x2="1000" y2="350" />
              <line x1="0" y1="525" x2="1000" y2="525" />
            </g>

            {/* Illustrated Hyrule Continent Landmass & Topographic Contours */}
            <g className="hyrule-terrain-layer" aria-hidden="true">
              {/* Outer Coastal Shelf */}
              <path
                d="M 30 250 C 40 190, 175 168, 285 190 C 375 162, 455 82, 545 72 C 625 62, 685 38, 775 46 C 855 54, 965 168, 978 265 C 990 355, 945 458, 895 552 C 845 612, 745 625, 645 618 C 565 655, 465 678, 375 658 C 305 638, 275 512, 235 445 C 165 408, 78 378, 42 325 C 24 298, 22 275, 30 250 Z"
                fill="var(--bg-map-land)"
                stroke="var(--map-land-stroke)"
                strokeWidth="2.2"
              />

              {/* Elevation Contour Ring */}
              <path
                d="M 56 260 C 70 212, 190 192, 292 210 C 385 182, 465 104, 545 92 C 625 82, 690 58, 768 65 C 838 72, 940 182, 952 270 C 962 348, 920 445, 872 532 C 825 588, 738 600, 642 592 C 562 628, 468 650, 385 632 C 325 612, 295 495, 255 428 C 185 392, 98 362, 64 315 Z"
                fill="none"
                stroke="var(--map-contour-line)"
                strokeWidth="1.2"
              />

              {/* 1. Western Sandstone Canyon & Mirage Desert Dunes (NW/W) */}
              <path
                d="M 38 258 C 52 204, 198 184, 298 214 C 335 232, 342 355, 322 418 C 275 442, 182 405, 118 375 C 58 348, 28 302, 38 258 Z"
                fill="var(--biome-desert-soft)"
                stroke="var(--biome-canyon)"
                strokeOpacity="0.34"
                strokeWidth="1.3"
              />
              <path
                d="M 78 318 Q 135 298 190 318 T 280 345"
                fill="none"
                stroke="var(--biome-desert)"
                strokeOpacity="0.28"
                strokeWidth="1.4"
              />
              <path
                d="M 105 344 Q 165 326 225 348"
                fill="none"
                stroke="var(--biome-desert)"
                strokeOpacity="0.22"
                strokeWidth="1.2"
              />

              {/* 2. Central Hyrule Field Rolling Plains & Lon Lon Ranch Paddock */}
              <path
                d="M 342 325 C 395 288, 565 292, 635 345 C 668 395, 652 505, 575 538 C 485 558, 378 528, 345 458 C 322 412, 318 355, 342 325 Z"
                fill="var(--biome-field-soft)"
                stroke="var(--biome-field)"
                strokeOpacity="0.28"
                strokeWidth="1.3"
              />
              <ellipse
                cx="465"
                cy="445"
                rx="38"
                ry="24"
                fill="var(--biome-ranch-soft)"
                stroke="var(--biome-ranch)"
                strokeOpacity="0.38"
                strokeWidth="1.2"
                strokeDasharray="4 3"
              />

              {/* 3. Northern Royal Citadel (Market, Hyrule Castle, Outside Ganon's Castle) */}
              <path
                d="M 448 118 C 475 82, 565 78, 590 118 C 608 158, 588 258, 542 278 C 492 288, 456 262, 448 212 C 442 172, 435 142, 448 118 Z"
                fill="var(--biome-castle-soft)"
                stroke="var(--biome-castle)"
                strokeOpacity="0.34"
                strokeWidth="1.3"
              />

              {/* 4. Kakariko Foothills & Shadow Graveyard Basin */}
              <path
                d="M 608 232 C 655 212, 768 222, 808 258 C 818 288, 785 314, 712 312 C 648 310, 602 292, 608 232 Z"
                fill="var(--biome-shadow-soft)"
                stroke="var(--biome-shadow)"
                strokeOpacity="0.32"
                strokeWidth="1.3"
              />

              {/* 5. Death Mountain Volcanic Caldera & Concentric Summit Rings (NE) */}
              <path
                d="M 615 178 C 625 98, 678 48, 755 52 C 822 56, 842 122, 808 178 C 778 212, 655 218, 615 178 Z"
                fill="var(--biome-mountain-soft)"
                stroke="var(--biome-mountain)"
                strokeOpacity="0.38"
                strokeWidth="1.4"
              />
              <ellipse cx="738" cy="95" rx="74" ry="44" fill="url(#caldera-glow)" />
              <ellipse
                cx="740"
                cy="84"
                rx="48"
                ry="24"
                fill="none"
                stroke="var(--biome-volcano)"
                strokeOpacity="0.45"
                strokeWidth="1.5"
              />
              <ellipse
                cx="742"
                cy="82"
                rx="28"
                ry="13"
                fill="none"
                stroke="var(--biome-volcano)"
                strokeOpacity="0.55"
                strokeWidth="1.2"
                strokeDasharray="3 2"
              />

              {/* 6. Zora's Fountain Basin & Winding Sapphire River Channel */}
              <path
                d="M 835 288 C 858 228, 945 215, 968 258 C 982 298, 948 358, 888 368 C 845 372, 822 332, 835 288 Z"
                fill="var(--biome-water-soft)"
                stroke="var(--biome-water)"
                strokeOpacity="0.38"
                strokeWidth="1.3"
              />
              {/* Continuous Hyrule River: Zora's Fountain -> Domain -> Zora's River -> Field -> Gerudo Gorge -> Lake Hylia */}
              <path
                d="M 920 290 C 895 320, 875 335, 855 340 C 812 352, 775 365, 735 375 C 655 390, 565 372, 485 385 C 405 398, 332 375, 285 385 C 318 465, 368 545, 420 600"
                fill="none"
                stroke="var(--biome-river)"
                strokeOpacity="0.32"
                strokeWidth="8"
                strokeLinecap="round"
              />
              <path
                d="M 920 290 C 895 320, 875 335, 855 340 C 812 352, 775 365, 735 375 C 655 390, 565 372, 485 385 C 405 398, 332 375, 285 385 C 318 465, 368 545, 420 600"
                fill="none"
                stroke="var(--color-sapphire)"
                strokeOpacity="0.45"
                strokeWidth="2.4"
                strokeLinecap="round"
              />

              {/* 7. Lake Hylia Southern Azure Basin */}
              <path
                d="M 332 588 C 352 548, 468 542, 518 585 C 542 618, 505 662, 435 664 C 368 665, 315 625, 332 588 Z"
                fill="var(--biome-water-soft)"
                stroke="var(--biome-lake)"
                strokeOpacity="0.48"
                strokeWidth="1.6"
              />
              <ellipse
                cx="428"
                cy="615"
                rx="58"
                ry="30"
                fill="none"
                stroke="var(--color-sapphire)"
                strokeOpacity="0.3"
                strokeWidth="1.1"
              />

              {/* 8. Kokiri Forest, Lost Woods & Sacred Forest Meadow Emerald Canopy (SE) */}
              <path
                d="M 675 545 C 668 478, 738 408, 825 392 C 895 380, 932 428, 912 505 C 892 578, 808 608, 725 598 C 688 592, 678 572, 675 545 Z"
                fill="var(--biome-forest-soft)"
                stroke="var(--biome-forest)"
                strokeOpacity="0.4"
                strokeWidth="1.5"
              />
              <ellipse
                cx="788"
                cy="495"
                rx="82"
                ry="56"
                fill="none"
                stroke="var(--biome-forest)"
                strokeOpacity="0.25"
                strokeWidth="1.2"
                strokeDasharray="5 4"
              />

              {/* Subtle Compass Rose & Cartographic Watermark (SW Ocean Corner) */}
              <g transform="translate(115 612)" opacity="0.58">
                <circle cx="0" cy="0" r="24" fill="none" stroke="var(--map-land-stroke)" strokeWidth="1.1" />
                <circle cx="0" cy="0" r="18" fill="none" stroke="var(--map-contour-line)" strokeWidth="1" />
                <path
                  d="M0 -22 L4 -4 L22 0 L4 4 L0 22 L-4 4 L-22 0 L-4 -4 Z"
                  fill="none"
                  stroke="var(--color-triforce)"
                  strokeWidth="1.2"
                />
                <text
                  x="0"
                  y="-27"
                  textAnchor="middle"
                  fill="var(--text-muted)"
                  fontSize="8.5"
                  fontFamily="var(--font-display)"
                  fontWeight="700"
                >
                  N
                </text>
                <text
                  x="38"
                  y="4"
                  fill="var(--text-muted)"
                  fontSize="8.5"
                  fontFamily="var(--font-display)"
                  fontWeight="700"
                  letterSpacing="0.1em"
                >
                  KINGDOM OF HYRULE
                </text>
                <text
                  x="38"
                  y="15"
                  fill="var(--text-muted)"
                  fontSize="7.5"
                  fontFamily="var(--font-sans)"
                  opacity="0.85"
                >
                  SWITCH 2 TOPOGRAPHIC SURVEY
                </text>
              </g>
            </g>

            {/* Deduplicated Connection Paths (`connectedRegions`) */}
            <g className="hyrule-edges-layer" data-testid="map-connections">
              {DEDUPLICATED_MAP_EDGES.map((edge) => {
                if (edge.kind === 'road') {
                  return (
                    <g key={edge.key} data-edge={edge.key} data-edge-kind="road" aria-hidden="true">
                      <path className="map-edge-road-casing" d={edge.pathD} />
                      <path className="map-edge-road-core" d={edge.pathD} />
                    </g>
                  );
                }

                if (edge.kind === 'forest-warp') {
                  return (
                    <path
                      key={edge.key}
                      className="map-edge-forest-warp"
                      data-edge={edge.key}
                      data-edge-kind="forest-warp"
                      d={edge.pathD}
                      aria-hidden="true"
                    />
                  );
                }

                if (edge.kind === 'water-warp') {
                  return (
                    <g key={edge.key} data-edge={edge.key} data-edge-kind="water-warp">
                      <path className="map-edge-water-warp-glow" d={edge.pathD} aria-hidden="true" />
                      <path
                        className="map-edge-water-warp"
                        data-thawed={isZoraThawed ? 'true' : 'false'}
                        d={edge.pathD}
                        aria-hidden="true"
                      />
                      {/* Interactive Switch 2 Thawed Zora's Domain <-> Lake Hylia Shortcut Badge */}
                      <g
                        className="map-shortcut-badge"
                        data-testid="map-shortcut-zora-lake"
                        role="button"
                        tabIndex={0}
                        aria-label="Switch 2 Underwater Shortcut (Zora's Domain to Lake Hylia): Zora's Domain unfreezes after clearing the Water Temple"
                        transform="translate(602 502)"
                        onPointerEnter={() => setIsShortcutHovered(true)}
                        onPointerLeave={() => setIsShortcutHovered(false)}
                        onFocus={() => setIsShortcutHovered(true)}
                        onBlur={() => setIsShortcutHovered(false)}
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsShortcutHovered((prev) => !prev);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar') {
                            e.preventDefault();
                            setIsShortcutHovered((prev) => !prev);
                          }
                        }}
                      >
                        <rect
                          className="map-shortcut-badge__bg"
                          x="-56"
                          y="-8.5"
                          width="112"
                          height="17"
                          rx="8.5"
                          fill="var(--map-pill-bg)"
                          stroke="var(--color-sapphire)"
                          strokeWidth="1.2"
                        />
                        <text
                          x="0"
                          y="0"
                          textAnchor="middle"
                          dominantBaseline="central"
                          fill="var(--color-sapphire-text)"
                          fontSize="8.2"
                          fontWeight="700"
                          fontFamily="var(--font-sans)"
                        >
                          {isZoraThawed ? '💧 Thawed Zora Dive' : '❄→💧 SW2 Zora Dive'}
                        </text>
                      </g>
                    </g>
                  );
                }

                if (edge.kind === 'dream-link') {
                  return (
                    <path
                      key={edge.key}
                      className="map-edge-dream-link"
                      data-edge={edge.key}
                      data-edge-kind="dream-link"
                      d={edge.pathD}
                      aria-hidden="true"
                    />
                  );
                }

                return (
                  <path
                    key={edge.key}
                    className="map-edge-tether"
                    data-edge={edge.key}
                    data-edge-kind="tether"
                    d={edge.pathD}
                    aria-hidden="true"
                  />
                );
              })}
            </g>

            {/* 21 Overworld Regions */}
            <g className="hyrule-overworld-nodes-layer">
              {OVERWORLD_REGIONS.map((region) => {
                const summary = resolvedSummaries[region.id];
                const isDimmed = hasActiveFilter && summary.totalCount === 0;
                const isSpotlightHighlighted =
                  effectiveSpotlight && summary.totalCount > 0 && summary.switch2ItemCount > 0;

                return (
                  <RegionNode
                    key={region.id}
                    region={region}
                    summary={summary}
                    isSelected={selectedRegionId === region.id}
                    isDimmed={isDimmed}
                    isSpotlightHighlighted={isSpotlightHighlighted}
                    onSelect={handleNodeSelect}
                    onHoverChange={setHoveredRegionId}
                  />
                );
              })}
            </g>

            {/* 13 Tethered Dungeons, Mini-Dungeons & Hall of Fallen Foes */}
            <g className="hyrule-dungeon-pins-layer">
              {DUNGEON_AND_SPECIAL_REGIONS.map((region) => {
                const summary = resolvedSummaries[region.id];
                const isDimmed = hasActiveFilter && summary.totalCount === 0;
                const isSpotlightHighlighted =
                  effectiveSpotlight && summary.totalCount > 0 && summary.switch2ItemCount > 0;

                return (
                  <DungeonPin
                    key={region.id}
                    region={region}
                    summary={summary}
                    isSelected={selectedRegionId === region.id}
                    isDimmed={isDimmed}
                    isSpotlightHighlighted={isSpotlightHighlighted}
                    onSelect={handleNodeSelect}
                    onHoverChange={setHoveredRegionId}
                  />
                );
              })}
            </g>

            {/* Soft Vignette Rim */}
            <rect
              x="0"
              y="0"
              width="1000"
              height="700"
              fill="url(#hyrule-ocean-vignette)"
              pointerEvents="none"
              aria-hidden="true"
            />
          </g>
        </svg>
      </div>

      {/* Collapsible Map Legend */}
      <MapLegend isZoraThawed={isZoraThawed} />

      {/* Floating Rich HUD Tooltip Card (Node Hover / Focus OR Switch 2 Zora Dive Shortcut) */}
      {hoveredRegion && hoveredSummary ? (
        <aside
          className={`hyrule-map-tooltip${flipTooltipToTop ? ' hyrule-map-tooltip--top-right' : ''}`}
          data-testid="map-node-tooltip"
          role="status"
          aria-live="polite"
        >
          <div className="hyrule-map-tooltip__header">
            <h3 className="hyrule-map-tooltip__title">{hoveredRegion.name}</h3>
            {hoveredSummary.isComplete ? (
              <span className="hyrule-map-tooltip__badge hyrule-map-tooltip__badge--complete">
                ★ 100%
              </span>
            ) : (
              <span className="hyrule-map-tooltip__badge">
                {hoveredSummary.completedCount}/{hoveredSummary.totalCount} ({hoveredSummary.percent}%)
              </span>
            )}
          </div>

          <div className="hyrule-map-tooltip__meta">
            <span className="hyrule-map-tooltip__badge">
              {formatRegionKindLabel(hoveredRegion.kind)} · {hoveredRegion.biome}
            </span>
            <span className="hyrule-map-tooltip__badge">
              {hoveredRegion.eras.length === 2
                ? 'Child & Adult'
                : hoveredRegion.eras[0] === 'child'
                  ? 'Child Only'
                  : 'Adult Only'}
            </span>
            {hoveredSummary.readyNowCount > 0 && (
              <span className="hyrule-map-tooltip__badge hyrule-map-tooltip__badge--ready">
                +{hoveredSummary.readyNowCount} Ready
              </span>
            )}
            {hoveredSummary.switch2ItemCount > 0 && (
              <span className="hyrule-map-tooltip__badge hyrule-map-tooltip__badge--sw2">
                {hoveredSummary.switch2ItemCount} Switch 2
              </span>
            )}
          </div>

          <div className="hyrule-map-tooltip__counters">
            <div className="hyrule-map-tooltip__counter">
              <span className="hyrule-map-tooltip__counter-label">Heart Pieces</span>
              <span className="hyrule-map-tooltip__counter-val">
                {hoveredSummary.heartPiecesCompleted}/{hoveredSummary.heartPiecesTotal}
              </span>
            </div>
            <div className="hyrule-map-tooltip__counter">
              <span className="hyrule-map-tooltip__counter-label">Child Skulltulas</span>
              <span className="hyrule-map-tooltip__counter-val">
                {hoveredSummary.skulltulasChildCompleted}/{hoveredSummary.skulltulasChildTotal}
              </span>
            </div>
            <div className="hyrule-map-tooltip__counter">
              <span className="hyrule-map-tooltip__counter-label">Adult Skulltulas</span>
              <span className="hyrule-map-tooltip__counter-val">
                {hoveredSummary.skulltulasAdultCompleted}/{hoveredSummary.skulltulasAdultTotal}
              </span>
            </div>
          </div>

          {hoveredRegion.switch2Highlights[0] && (
            <p className="hyrule-map-tooltip__sw2-note">
              <strong>Switch 2:</strong> {hoveredRegion.switch2Highlights[0]}
            </p>
          )}
        </aside>
      ) : isShortcutHovered ? (
        <aside
          className="hyrule-map-tooltip"
          data-testid="map-shortcut-tooltip"
          role="status"
          aria-live="polite"
        >
          <div className="hyrule-map-tooltip__header">
            <h3 className="hyrule-map-tooltip__title">
              Zora&apos;s Domain ↔ Lake Hylia Dive Shortcut
            </h3>
            <span className="hyrule-map-tooltip__badge hyrule-map-tooltip__badge--sw2">
              <Waves size={11} aria-hidden="true" />
              Switch 2 Change
            </span>
          </div>
          <p className="hyrule-map-tooltip__sw2-note">
            <strong>Switch 2 Remake (`zora-thawed`):</strong> Clearing the Water Temple actually{' '}
            <strong>unfreezes Zora&apos;s Domain</strong> in the Adult Era, reopening this underwater
            diving tunnel for a 25-second Eyeball Frog Biggoron Sword run!
          </p>
        </aside>
      ) : null}
    </section>
  );
}
