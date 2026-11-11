import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type MouseEvent as ReactMouseEvent,
  type PointerEvent as ReactPointerEvent,
  type WheelEvent as ReactWheelEvent,
} from 'react';
import {
  EyeOff,
  Layers,
  LocateFixed,
  Lock,
  Map as MapIcon,
  RotateCcw,
  Sparkles,
  Waves,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import {
  DUNGEON_AND_SPECIAL_REGIONS,
  OVERWORLD_REGIONS,
  REGIONS,
  REGION_BY_ID,
} from '../../data';
import { computeRegionSummary, deriveEffectiveRequirements } from '../../lib/gating';
import type {
  EraFilter,
  MapLayerMode,
  PlayerProgressState,
  Region,
  RegionProgressSummary,
} from '../../types/zelda';
import { DungeonPin } from './DungeonPin';
import {
  ILLUSTRATED_COORDS,
  ILLUSTRATED_LABEL_OVERRIDES,
  resolveRegionMapCoords,
} from './illustratedCoords';
import { MapLegend } from './MapLegend';
import {
  formatRegionKindLabel,
  RegionNode,
  type ExtendedMapRegionSummary,
} from './RegionNode';
import './map.css';

export interface HyruleMapCanvasProps {
  state: PlayerProgressState;
  regionSummaries: Record<string, RegionProgressSummary>;
  selectedRegionId: string | null;
  onSelectRegion: (regionId: string) => void;
  onEnterAreaMap?: (regionId: string) => void;
  onEraFilterChange?: (era: EraFilter) => void;
  onSpotlightChange?: (enabled: boolean) => void;
  hideCompleted?: boolean;
  onHideCompletedChange?: (hide: boolean) => void;
  mapLayerMode?: MapLayerMode;
  onMapLayerModeChange?: (mode: MapLayerMode) => void;
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
const MAX_ZOOM = 3.0;
const ZOOM_STEP = 0.25;
const DRAG_THRESHOLD_PX = 6;
const DOUBLE_TAP_MAX_DELAY_MS = 300;
const DOUBLE_TAP_MAX_DIST_PX = 28;

const ERA_OPTIONS: ReadonlyArray<{ id: EraFilter; label: string }> = [
  { id: 'all', label: 'All Eras' },
  { id: 'child', label: 'Child' },
  { id: 'adult', label: 'Adult' },
];

function clamp(val: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, val));
}

function clampPanForZoom(pan: { x: number; y: number }, zoom: number): { x: number; y: number } {
  const maxPanX = 420 * zoom;
  const maxPanY = 300 * zoom;
  return {
    x: clamp(pan.x, -maxPanX, maxPanX),
    y: clamp(pan.y, -maxPanY, maxPanY),
  };
}

function buildCurvedEdgePath(
  from: Region,
  to: Region,
  kind: EdgeKind,
  key: string,
  mapStyle: MapLayerMode,
): string {
  const fromPt = resolveRegionMapCoords(from, mapStyle);
  const toPt = resolveRegionMapCoords(to, mapStyle);
  const x1 = fromPt.x;
  const y1 = fromPt.y;
  const x2 = toPt.x;
  const y2 = toPt.y;

  if (kind === 'tether') {
    return `M ${x1} ${y1} L ${x2} ${y2}`;
  }

  if (mapStyle === 'schematic') {
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
  } else {
    if (key === 'lake-hylia<->zoras-domain') {
      return `M ${x2} ${y2} Q 685 520 ${x1} ${y1}`;
    }
    if (key === 'goron-city<->lost-woods') {
      return `M ${x2} ${y2} Q 838 308 ${x1} ${y1}`;
    }
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

function buildDeduplicatedEdges(mapStyle: MapLayerMode): MapConnectionEdge[] {
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

      const first = reg.id < neighbor.id ? reg : neighbor;
      const second = reg.id < neighbor.id ? neighbor : reg;

      edges.push({
        key,
        from: first,
        to: second,
        kind,
        pathD: buildCurvedEdgePath(first, second, kind, key, mapStyle),
      });
    }
  }

  return edges;
}

const SCHEMATIC_MAP_EDGES: readonly MapConnectionEdge[] = buildDeduplicatedEdges('schematic');
const ILLUSTRATED_MAP_EDGES: readonly MapConnectionEdge[] = buildDeduplicatedEdges('illustrated');

interface DragSession {
  pointerId: number;
  startClientX: number;
  startClientY: number;
  startPanX: number;
  startPanY: number;
  exceededThreshold: boolean;
}

interface PinchSession {
  startDistPx: number;
  startMidVx: number;
  startMidVy: number;
  startZoom: number;
  startPanX: number;
  startPanY: number;
}

interface TapRecord {
  time: number;
  clientX: number;
  clientY: number;
}

export function HyruleMapCanvas({
  state,
  regionSummaries,
  selectedRegionId,
  onSelectRegion,
  onEnterAreaMap,
  onEraFilterChange,
  onSpotlightChange,
  hideCompleted,
  onHideCompletedChange,
  mapLayerMode,
  onMapLayerModeChange,
}: HyruleMapCanvasProps) {
  const [zoom, setZoom] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [hoveredRegionId, setHoveredRegionId] = useState<string | null>(null);
  const [isShortcutHovered, setIsShortcutHovered] = useState<boolean>(false);
  const [uncontrolledSpotlight, setUncontrolledSpotlight] = useState<boolean>(false);
  const [uncontrolledHideCompleted, setUncontrolledHideCompleted] = useState<boolean>(false);
  const [uncontrolledLayerMode, setUncontrolledLayerMode] = useState<MapLayerMode>('illustrated');

  const viewportRef = useRef<HTMLDivElement | null>(null);
  const activePointersRef = useRef<Map<number, { clientX: number; clientY: number }>>(new Map());
  const dragSessionRef = useRef<DragSession | null>(null);
  const pinchSessionRef = useRef<PinchSession | null>(null);
  const lastTouchTapRef = useRef<TapRecord | null>(null);
  const suppressNextClickRef = useRef<boolean>(false);

  const effectiveSpotlight = onSpotlightChange
    ? Boolean(state.switch2SpotlightOnly)
    : Boolean(state.switch2SpotlightOnly) || uncontrolledSpotlight;

  const effectiveHideCompleted =
    hideCompleted !== undefined ? hideCompleted : uncontrolledHideCompleted;

  const effectiveLayerMode: MapLayerMode =
    mapLayerMode ?? state.mapLayerMode ?? uncontrolledLayerMode;

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

  /**
   * Maps a viewport client coordinate `(clientX, clientY)` to the `1000 × 700`
   * SVG `xMidYMid meet` coordinate space (with a 1:1 fallback in headless JSDOM).
   */
  const clientToViewBox = (clientX: number, clientY: number): { vx: number; vy: number; scale: number } => {
    const rect = viewportRef.current?.getBoundingClientRect();
    if (!rect || rect.width <= 0 || rect.height <= 0) {
      return { vx: clientX, vy: clientY, scale: 1 };
    }
    const scale = Math.min(rect.width / 1000, rect.height / 700);
    const renderedW = 1000 * scale;
    const renderedH = 700 * scale;
    const offsetX = (rect.width - renderedW) / 2;
    const offsetY = (rect.height - renderedH) / 2;
    return {
      vx: (clientX - rect.left - offsetX) / scale,
      vy: (clientY - rect.top - offsetY) / scale,
      scale,
    };
  };

  /**
   * Zooms smoothly around a focal point `(vx, vy)` in viewBox coordinates so the
   * map terrain beneath the cursor or fingers stays anchored in place.
   */
  const zoomAroundViewBoxPoint = (nextZoomRaw: number, vx: number, vy: number) => {
    const nextZoom = Number(clamp(nextZoomRaw, MIN_ZOOM, MAX_ZOOM).toFixed(2));
    setZoom((prevZoom) => {
      setPan((prevPan) => {
        if (nextZoom === 1 && Math.abs(vx - 500) < 1 && Math.abs(vy - 350) < 1) {
          return clampPanForZoom(prevPan, 1);
        }
        const ratio = nextZoom / (prevZoom || 1);
        const nextPanX = vx - 500 - ratio * (vx - 500 - prevPan.x);
        const nextPanY = vy - 350 - ratio * (vy - 350 - prevPan.y);
        return clampPanForZoom({ x: nextPanX, y: nextPanY }, nextZoom);
      });
      return nextZoom;
    });
  };

  const handleZoomBy = (delta: number) => {
    zoomAroundViewBoxPoint(zoom + delta, 500, 350);
  };

  const handleResetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  const handleFocusRegion = (targetRegionId?: string | null) => {
    const id = targetRegionId ?? selectedRegionId;
    if (!id) {
      handleResetView();
      return;
    }
    const region = REGION_BY_ID[id];
    if (!region) return;
    const coords = resolveRegionMapCoords(region, effectiveLayerMode);
    const targetZoom = Math.max(zoom, 1.65);
    const nextZoom = Number(clamp(targetZoom, MIN_ZOOM, MAX_ZOOM).toFixed(2));
    const nextPan = clampPanForZoom(
      {
        x: -nextZoom * (coords.x - 500),
        y: -nextZoom * (coords.y - 350),
      },
      nextZoom,
    );
    setZoom(nextZoom);
    setPan(nextPan);
  };

  // Gently recenter when selecting a region while zoomed in so the selected pin stays in frame
  useEffect(() => {
    if (!selectedRegionId || zoom <= 1.08) return;
    const region = REGION_BY_ID[selectedRegionId];
    if (!region) return;
    const coords = resolveRegionMapCoords(region, effectiveLayerMode);
    const currentVx = 500 + pan.x + zoom * (coords.x - 500);
    const currentVy = 350 + pan.y + zoom * (coords.y - 350);
    if (currentVx < 120 || currentVx > 880 || currentVy < 100 || currentVy > 600) {
      setPan(
        clampPanForZoom(
          {
            x: -zoom * (coords.x - 500),
            y: -zoom * (coords.y - 350),
          },
          zoom,
        ),
      );
    }
    // Only evaluate when selectedRegionId changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedRegionId]);

  const handleWheel = (event: ReactWheelEvent<HTMLDivElement>) => {
    event.preventDefault();
    const step = event.deltaY < 0 ? 0.16 : -0.16;
    const { vx, vy } = clientToViewBox(event.clientX, event.clientY);
    zoomAroundViewBoxPoint(zoom + step, vx, vy);
  };

  const handleDoubleClick = (event: ReactMouseEvent<HTMLDivElement>) => {
    const target = event.target as Element | null;
    if (target?.closest('.map-node, .map-shortcut-badge, button')) {
      return;
    }
    const { vx, vy } = clientToViewBox(event.clientX, event.clientY);
    if (zoom >= 1.65) {
      handleResetView();
    } else {
      zoomAroundViewBoxPoint(2.0, vx, vy);
    }
  };

  const beginPinchFromActivePointers = () => {
    const pts = Array.from(activePointersRef.current.values());
    if (pts.length < 2) return;
    const [p1, p2] = pts;
    const dist = Math.max(12, Math.hypot(p2.clientX - p1.clientX, p2.clientY - p1.clientY));
    const midClientX = (p1.clientX + p2.clientX) / 2;
    const midClientY = (p1.clientY + p2.clientY) / 2;
    const { vx, vy } = clientToViewBox(midClientX, midClientY);

    dragSessionRef.current = null;
    suppressNextClickRef.current = true;
    setIsDragging(true);
    pinchSessionRef.current = {
      startDistPx: dist,
      startMidVx: vx,
      startMidVy: vy,
      startZoom: zoom,
      startPanX: pan.x,
      startPanY: pan.y,
    };
  };

  const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.pointerType === 'mouse' && event.button !== 0) return;

    activePointersRef.current.set(event.pointerId, {
      clientX: event.clientX,
      clientY: event.clientY,
    });

    if (activePointersRef.current.size >= 2) {
      event.currentTarget.setPointerCapture?.(event.pointerId);
      beginPinchFromActivePointers();
      return;
    }

    suppressNextClickRef.current = false;
    pinchSessionRef.current = null;
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
    if (activePointersRef.current.has(event.pointerId)) {
      activePointersRef.current.set(event.pointerId, {
        clientX: event.clientX,
        clientY: event.clientY,
      });
    }

    // Two-finger pinch-to-zoom + simultaneous two-finger pan
    if (activePointersRef.current.size >= 2 && pinchSessionRef.current) {
      const pts = Array.from(activePointersRef.current.values());
      const [p1, p2] = pts;
      const currentDist = Math.max(
        12,
        Math.hypot(p2.clientX - p1.clientX, p2.clientY - p1.clientY),
      );
      const midClientX = (p1.clientX + p2.clientX) / 2;
      const midClientY = (p1.clientY + p2.clientY) / 2;
      const { vx: midVx, vy: midVy } = clientToViewBox(midClientX, midClientY);

      const session = pinchSessionRef.current;
      const rawZoom = session.startZoom * (currentDist / session.startDistPx);
      const nextZoom = Number(clamp(rawZoom, MIN_ZOOM, MAX_ZOOM).toFixed(2));
      const zoomRatio = nextZoom / (session.startZoom || 1);

      const nextPanX = midVx - 500 - zoomRatio * (session.startMidVx - 500 - session.startPanX);
      const nextPanY = midVy - 350 - zoomRatio * (session.startMidVy - 350 - session.startPanY);

      setZoom(nextZoom);
      setPan(clampPanForZoom({ x: nextPanX, y: nextPanY }, nextZoom));
      return;
    }

    // Single-pointer pan drag
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

    const { scale } = clientToViewBox(event.clientX, event.clientY);
    const invScale = scale > 0 ? 1 / scale : 1;

    setPan(
      clampPanForZoom(
        {
          x: session.startPanX + dxPx * invScale,
          y: session.startPanY + dyPx * invScale,
        },
        zoom,
      ),
    );
  };

  const endPointerInteraction = (event: ReactPointerEvent<HTMLDivElement>) => {
    const wasPinching = pinchSessionRef.current !== null;
    const dragSession = dragSessionRef.current;

    activePointersRef.current.delete(event.pointerId);
    if (event.currentTarget.hasPointerCapture?.(event.pointerId)) {
      try {
        event.currentTarget.releasePointerCapture(event.pointerId);
      } catch {
        // Ignore release errors on synthetic test events
      }
    }

    // Transition smoothly from 2-finger pinch down to 1 remaining finger without jumping
    if (wasPinching) {
      pinchSessionRef.current = null;
      if (activePointersRef.current.size === 1) {
        const [[remainingId, remainingPt]] = Array.from(activePointersRef.current.entries());
        dragSessionRef.current = {
          pointerId: remainingId,
          startClientX: remainingPt.clientX,
          startClientY: remainingPt.clientY,
          startPanX: pan.x,
          startPanY: pan.y,
          exceededThreshold: true,
        };
        return;
      }
      setIsDragging(false);
      window.setTimeout(() => {
        suppressNextClickRef.current = false;
      }, 0);
      return;
    }

    if (dragSession && dragSession.pointerId === event.pointerId) {
      if (dragSession.exceededThreshold) {
        setIsDragging(false);
        window.setTimeout(() => {
          suppressNextClickRef.current = false;
        }, 0);
      } else if (event.pointerType === 'touch') {
        // Handle mobile single-finger double-tap to zoom on empty map terrain
        const target = event.target as Element | null;
        if (!target?.closest('.map-node, .map-shortcut-badge, button')) {
          const now = Date.now();
          const prevTap = lastTouchTapRef.current;
          if (
            prevTap &&
            now - prevTap.time <= DOUBLE_TAP_MAX_DELAY_MS &&
            Math.hypot(event.clientX - prevTap.clientX, event.clientY - prevTap.clientY) <=
              DOUBLE_TAP_MAX_DIST_PX
          ) {
            lastTouchTapRef.current = null;
            const { vx, vy } = clientToViewBox(event.clientX, event.clientY);
            if (zoom >= 1.65) {
              handleResetView();
            } else {
              zoomAroundViewBoxPoint(2.0, vx, vy);
            }
          } else {
            lastTouchTapRef.current = {
              time: now,
              clientX: event.clientX,
              clientY: event.clientY,
            };
          }
        }
      }
      dragSessionRef.current = null;
    }
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

  const handleToggleHideCompleted = () => {
    const next = !effectiveHideCompleted;
    if (onHideCompletedChange) {
      onHideCompletedChange(next);
    } else {
      setUncontrolledHideCompleted(next);
    }
  };

  const handleToggleLayerMode = () => {
    const nextMode: MapLayerMode =
      effectiveLayerMode === 'illustrated' ? 'schematic' : 'illustrated';
    if (onMapLayerModeChange) {
      onMapLayerModeChange(nextMode);
    } else {
      setUncontrolledLayerMode(nextMode);
    }
  };

  const hoveredRegion = hoveredRegionId ? REGION_BY_ID[hoveredRegionId] ?? null : null;
  const hoveredSummary = hoveredRegion ? resolvedSummaries[hoveredRegion.id] : null;
  const hoveredCoords = hoveredRegion
    ? resolveRegionMapCoords(hoveredRegion, effectiveLayerMode)
    : null;
  const flipTooltipToTop = Boolean(
    hoveredCoords && hoveredCoords.x > 610 && hoveredCoords.y > 430,
  );
  const selectedRegion = selectedRegionId ? REGION_BY_ID[selectedRegionId] ?? null : null;
  const selectedSummary = selectedRegion ? resolvedSummaries[selectedRegion.id] : null;
  const activeEdges =
    effectiveLayerMode === 'illustrated' ? ILLUSTRATED_MAP_EDGES : SCHEMATIC_MAP_EDGES;
  const zoraDiveBadgeTransform =
    effectiveLayerMode === 'illustrated' ? 'translate(682 482)' : 'translate(602 502)';

  const isDefaultCamera = zoom === 1 && pan.x === 0 && pan.y === 0;
  const cameraTransform = isDefaultCamera
    ? undefined
    : `translate(${(500 + pan.x).toFixed(2)} ${(350 + pan.y).toFixed(2)}) scale(${zoom}) translate(-500 -350)`;

  return (
    <section
      className="hyrule-map-shell"
      data-testid="hyrule-map-canvas"
      data-map-layer={effectiveLayerMode}
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

          <button
            type="button"
            className="map-hud-btn map-hud-btn--standalone"
            data-testid="map-hide-completed-toggle"
            aria-pressed={effectiveHideCompleted}
            aria-label="Hide 100% completed areas on map"
            onClick={handleToggleHideCompleted}
          >
            <EyeOff size={13} aria-hidden="true" />
            <span className="map-hud-btn__label-long">Hide Completed</span>
            <span className="map-hud-btn__label-short">Hide Done</span>
          </button>

          <button
            type="button"
            className="map-hud-btn map-hud-btn--standalone"
            data-testid="map-layer-toggle"
            aria-pressed={effectiveLayerMode === 'illustrated'}
            aria-label={
              effectiveLayerMode === 'illustrated'
                ? 'Switch to schematic topographic map'
                : 'Switch to illustrated Hyrule artwork map'
            }
            title="Switch between Illustrated Hyrule Map & Schematic Contours"
            onClick={handleToggleLayerMode}
          >
            <Layers size={13} aria-hidden="true" />
            <span className="map-hud-btn__label-long">
              {effectiveLayerMode === 'illustrated' ? 'Illustrated Art' : 'Topo Contours'}
            </span>
            <span className="map-hud-btn__label-short">
              {effectiveLayerMode === 'illustrated' ? 'Art' : 'Topo'}
            </span>
          </button>
        </div>

        <div
          className="hyrule-map-hud-group map-hud-pill-group hyrule-map-zoom-cluster"
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
          {selectedRegionId && (
            <button
              type="button"
              className="map-hud-btn map-hud-btn--icon"
              data-testid="map-focus-selected"
              aria-label="Zoom to selected region"
              title="Zoom & center on selected region"
              onClick={() => handleFocusRegion(selectedRegionId)}
            >
              <LocateFixed size={14} aria-hidden="true" />
            </button>
          )}
        </div>
      </div>

      {/* Interactive Multi-Touch Pinch/Zoom/Pan Hyrule Viewport */}
      <div
        ref={viewportRef}
        className={`hyrule-map-viewport${isDragging ? ' is-dragging' : ''}`}
        data-testid="hyrule-map-viewport"
        onWheel={handleWheel}
        onDoubleClick={handleDoubleClick}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={endPointerInteraction}
        onPointerCancel={endPointerInteraction}
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
            {/* Ocean Backdrop */}
            <rect x="0" y="0" width="1000" height="700" fill="var(--bg-map-ocean)" />

            {effectiveLayerMode === 'illustrated' ? (
              <g className="hyrule-illustrated-layer" aria-hidden="true">
                <image
                  className="hyrule-illustrated-image"
                  data-testid="hyrule-illustrated-backdrop"
                  href="./maps/hyrule-illustrated.jpg"
                  x="0"
                  y="0"
                  width="1000"
                  height="700"
                  preserveAspectRatio="none"
                />
                {/* Subtle contrast scrim so crisp vector pins, labels & routes pop cleanly */}
                <rect
                  x="0"
                  y="0"
                  width="1000"
                  height="700"
                  fill="var(--map-art-scrim)"
                  pointerEvents="none"
                />
              </g>
            ) : (
              <>
                <g aria-hidden="true" stroke="var(--map-grid-line)" strokeWidth="1">
                  <line x1="200" y1="0" x2="200" y2="700" />
                  <line x1="400" y1="0" x2="400" y2="700" />
                  <line x1="600" y1="0" x2="600" y2="700" />
                  <line x1="800" y1="0" x2="800" y2="700" />
                  <line x1="0" y1="175" x2="1000" y2="175" />
                  <line x1="0" y1="350" x2="1000" y2="350" />
                  <line x1="0" y1="525" x2="1000" y2="525" />
                </g>

                {/* Schematic Topographic Contours */}
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
                </g>
              </>
            )}

            {/* Subtle Compass Rose & Cartographic Watermark (SW Ocean Corner) */}
            <g className="hyrule-compass-rose" transform="translate(115 612)" aria-hidden="true">
              <circle cx="0" cy="0" r="24" fill="var(--map-pill-bg)" stroke="var(--map-land-stroke)" strokeWidth="1.1" />
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
                fill="var(--text-primary)"
                fontSize="8.5"
                fontFamily="var(--font-display)"
                fontWeight="700"
              >
                N
              </text>
              <text
                x="34"
                y="4"
                fill="var(--text-primary)"
                fontSize="8.5"
                fontFamily="var(--font-display)"
                fontWeight="700"
                letterSpacing="0.1em"
              >
                KINGDOM OF HYRULE
              </text>
              <text
                x="34"
                y="15"
                fill="var(--text-secondary)"
                fontSize="7.5"
                fontFamily="var(--font-sans)"
              >
                PINCH OR DOUBLE-TAP TO ZOOM
              </text>
            </g>

            {/* Deduplicated Connection Paths (`connectedRegions`) */}
            <g className="hyrule-edges-layer" data-testid="map-connections">
              {activeEdges.map((edge) => {
                if (edge.kind === 'road') {
                  if (effectiveLayerMode === 'illustrated') {
                    return null;
                  }
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
                        transform={zoraDiveBadgeTransform}
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
                const coords =
                  effectiveLayerMode === 'illustrated'
                    ? (ILLUSTRATED_COORDS[region.id] ?? region.mapCoords)
                    : region.mapCoords;
                const labelOverride =
                  effectiveLayerMode === 'illustrated'
                    ? ILLUSTRATED_LABEL_OVERRIDES[region.id]
                    : undefined;
                const isHiddenByCompleteFilter =
                  effectiveHideCompleted && summary.isComplete && selectedRegionId !== region.id;

                return (
                  <RegionNode
                    key={region.id}
                    region={region}
                    summary={summary}
                    isSelected={selectedRegionId === region.id}
                    isDimmed={isDimmed}
                    isSpotlightHighlighted={isSpotlightHighlighted}
                    coords={coords}
                    labelOverride={labelOverride}
                    isHiddenByCompleteFilter={isHiddenByCompleteFilter}
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
                const coords =
                  effectiveLayerMode === 'illustrated'
                    ? (ILLUSTRATED_COORDS[region.id] ?? region.mapCoords)
                    : region.mapCoords;
                const labelOverride =
                  effectiveLayerMode === 'illustrated'
                    ? ILLUSTRATED_LABEL_OVERRIDES[region.id]
                    : undefined;
                const isHiddenByCompleteFilter =
                  effectiveHideCompleted && summary.isComplete && selectedRegionId !== region.id;

                return (
                  <DungeonPin
                    key={region.id}
                    region={region}
                    summary={summary}
                    isSelected={selectedRegionId === region.id}
                    isDimmed={isDimmed}
                    isSpotlightHighlighted={isSpotlightHighlighted}
                    coords={coords}
                    labelOverride={labelOverride}
                    isHiddenByCompleteFilter={isHiddenByCompleteFilter}
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

      {/* Prominent Selected Area CTA Bar ("Enter Area / Floor Map →") */}
      {selectedRegion && selectedSummary && (
        <div
          className="hyrule-map-selected-bar"
          data-testid="map-selected-bar"
          role="region"
          aria-label={`Selected area: ${selectedRegion.name}`}
        >
          <div className="hyrule-map-selected-bar__info">
            <span className="hyrule-map-selected-bar__name">{selectedRegion.name}</span>
            <span className="hyrule-map-selected-bar__meta">
              {selectedSummary.completedCount}/{selectedSummary.totalCount} done
              {(selectedSummary as RegionProgressSummary & ExtendedMapRegionSummary).isReachable ===
                false && !selectedSummary.isComplete
                ? ' · Locked'
                : selectedSummary.readyNowCount > 0
                  ? ` · +${selectedSummary.readyNowCount} Ready`
                  : ''}
            </span>
          </div>
          <button
            type="button"
            className="hyrule-map-enter-area-btn"
            data-testid="map-enter-area-btn"
            onClick={() => (onEnterAreaMap ?? onSelectRegion)(selectedRegion.id)}
          >
            <MapIcon size={14} aria-hidden="true" />
            <span>Enter Area / Floor Map →</span>
          </button>
        </div>
      )}

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
            {(hoveredSummary as RegionProgressSummary & ExtendedMapRegionSummary).isReachable ===
              false && !hoveredSummary.isComplete ? (
              <span className="hyrule-map-tooltip__badge hyrule-map-tooltip__badge--locked">
                <Lock size={10} aria-hidden="true" />
                {(hoveredSummary as RegionProgressSummary & ExtendedMapRegionSummary)
                  .reachabilityBlocker ?? 'Area Locked'}
              </span>
            ) : (
              hoveredSummary.readyNowCount > 0 && (
                <span className="hyrule-map-tooltip__badge hyrule-map-tooltip__badge--ready">
                  +{hoveredSummary.readyNowCount} Ready
                </span>
              )
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
