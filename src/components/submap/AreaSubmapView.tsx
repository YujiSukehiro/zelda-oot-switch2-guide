import React, { useEffect, useId, useMemo, useRef, useState } from 'react';
import type { EvaluatedSecret, Region } from '../../types/zelda';
import {
  resolveSubmapForRegion,
  type SubmapConnector,
  type SubmapFloor,
  type SubmapPin,
  type SubmapRoom,
} from '../../data/submaps';
import { FormattedGuideText } from '../region/FormattedGuideText';
import './AreaSubmapView.css';

type ExtendedEvaluatedSecret = EvaluatedSecret;

export interface AreaSubmapViewProps {
  region: Region;
  evaluatedSecrets: EvaluatedSecret[];
  selectedSecretId?: string | null;
  activeTrailSecretIds?: string[];
  selectedRoomId?: string | null;
  hideLaterVisits?: boolean;
  onHideLaterVisitsChange?: (hideLater: boolean) => void;
  activeFloorId?: string | null;
  onSelectFloor?: (floorId: string) => void;
  onSelectSecret?: (secretId: string) => void;
  onToggleSecret?: (secretId: string, completed: boolean) => void;
  onSelectRoom?: (roomId: string | null) => void;
  onSelectConnectedRegion?: (regionId: string) => void;
  onBackToWorldMap?: () => void;
  className?: string;
}

type VisualPinState = 'completed' | 'ready' | 'trick' | 'later' | 'locked' | 'gateway' | 'info';

const ZOOM_STEPS = [100, 125, 150, 175] as const;

function getConnectorSymbol(kind: SubmapConnector['kind']): string {
  switch (kind) {
    case 'stairs-up':
      return '▲';
    case 'stairs-down':
      return '▼';
    case 'drop-hole':
      return '◎';
    case 'climb-vines':
      return '≣';
    case 'locked-door':
      return '🔑';
    case 'boss-door':
      return '💀';
    case 'bombable-wall':
      return '✹';
    case 'fake-wall':
      return '◌';
    case 'warp-tunnel':
      return '✦';
    default:
      return '•';
  }
}

function classifyPin(
  pin: SubmapPin,
  evalItem?: ExtendedEvaluatedSecret,
): { state: VisualPinState; statusLabel: string; glyph: string } {
  if (pin.kind === 'entrance' || pin.kind === 'warp') {
    const isLaterAdultExit = !pin.secretId && pin.era === 'adult';
    return {
      state: isLaterAdultExit ? 'later' : 'gateway',
      statusLabel: pin.kind === 'warp' ? 'Shortcut Warp' : isLaterAdultExit ? 'Adult Gateway' : 'Region Exit',
      glyph: pin.kind === 'warp' ? '⇄' : '↗',
    };
  }

  if (!pin.secretId && (pin.kind === 'npc' || pin.kind === 'puzzle' || pin.kind === 'small-key' || pin.kind === 'boss-key')) {
    const glyph =
      pin.kind === 'small-key'
        ? '🗝'
        : pin.kind === 'boss-key'
          ? '💀'
          : pin.kind === 'npc'
            ? '◈'
            : '!';
    return {
      state: pin.era === 'adult' ? 'later' : 'info',
      statusLabel:
        pin.kind === 'small-key'
          ? 'Small Key'
          : pin.kind === 'boss-key'
            ? 'Boss Key'
            : pin.era === 'adult'
              ? 'Adult Landmark'
              : 'Landmark / Clue',
      glyph,
    };
  }

  if (evalItem) {
    const stage = evalItem.visitStage;
    if (evalItem.status === 'completed' || stage === 'completed') {
      return { state: 'completed', statusLabel: 'Completed', glyph: '✓' };
    }
    if (
      stage === 'later-era' ||
      (evalItem.status === 'locked' && evalItem.primaryBlockerCategory === 'cross-era')
    ) {
      return { state: 'later', statusLabel: 'Later Era Visit', glyph: '⏳' };
    }
    if (stage === 'later-gear' || evalItem.status === 'locked') {
      return {
        state: 'locked',
        statusLabel: evalItem.primaryBlockerLabel || 'Needs Gear / Song',
        glyph: '🔒',
      };
    }
    if (evalItem.status === 'available-via-alt') {
      return { state: 'trick', statusLabel: 'Early Trick Available', glyph: '★' };
    }
    const cat = evalItem.secret.category;
    const glyph =
      cat === 'heart-piece'
        ? '♥'
        : cat === 'gold-skulltula'
          ? '✦'
          : cat === 'ocarina-song'
            ? '♪'
            : cat === 'bottle'
              ? '◡'
              : cat === 'magic-bean'
                ? '❀'
                : '◆';
    return { state: 'ready', statusLabel: 'Ready Now', glyph };
  }

  if (pin.era === 'adult') {
    return { state: 'later', statusLabel: 'Adult Era Visit', glyph: '⏳' };
  }
  return {
    state: 'ready',
    statusLabel: pin.kind === 'dungeon-gear' ? 'Dungeon Treasure' : 'Available',
    glyph: pin.kind === 'dungeon-gear' ? '◆' : '•',
  };
}

function formatRegionName(regionId: string): string {
  return regionId
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

export const AreaSubmapView: React.FC<AreaSubmapViewProps> = ({
  region,
  evaluatedSecrets,
  selectedSecretId = null,
  activeTrailSecretIds = [],
  selectedRoomId,
  hideLaterVisits = false,
  onHideLaterVisitsChange,
  activeFloorId,
  onSelectFloor,
  onSelectSecret,
  onToggleSecret,
  onSelectRoom,
  onSelectConnectedRegion,
  onBackToWorldMap,
  className = '',
}) => {
  const instanceId = useId();
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const toolbarRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const [toolbarFocusIdx, setToolbarFocusIdx] = useState<number>(0);

  const baseSubmap = useMemo(
    () => resolveSubmapForRegion(region, evaluatedSecrets),
    [region, evaluatedSecrets],
  );

  const evalBySecretId = useMemo(() => {
    const map = new Map<string, ExtendedEvaluatedSecret>();
    for (const item of evaluatedSecrets) {
      map.set(item.secret.id, item as ExtendedEvaluatedSecret);
    }
    return map;
  }, [evaluatedSecrets]);

  // Ensure 100% of evaluatedSecrets for this region appear on the submap even if newly added upstream
  const allPins = useMemo<SubmapPin[]>(() => {
    const pinnedSecretIds = new Set(
      baseSubmap.pins.map((p) => p.secretId).filter((id): id is string => Boolean(id)),
    );
    const unmapped = evaluatedSecrets.filter(
      (item) => item.secret.regionId === region.id && !pinnedSecretIds.has(item.secret.id),
    );
    if (unmapped.length === 0) {
      return baseSubmap.pins;
    }
    const defaultFloor =
      baseSubmap.floors.find((f) => f.id === baseSubmap.defaultFloorId) ?? baseSubmap.floors[0];
    const fallbackRoom = defaultFloor.rooms[0];
    const extraPins: SubmapPin[] = unmapped.map((item, idx) => ({
      id: `${region.id}-auto-pin-${item.secret.id}`,
      floorId: defaultFloor.id,
      roomId: fallbackRoom?.id ?? `${region.id}-room`,
      x: 110 + (idx % 6) * 95,
      y: 525,
      secretId: item.secret.id,
      kind:
        item.secret.category === 'equipment' || item.secret.category === 'capacity-upgrade'
          ? 'dungeon-gear'
          : 'secret',
      label: item.secret.title,
      era: item.secret.era === 'adult' ? 'adult' : item.secret.era === 'child' ? 'child' : 'both',
      note: item.secret.locationHint,
    }));
    return [...baseSubmap.pins, ...extraPins];
  }, [baseSubmap, evaluatedSecrets, region.id]);

  const trailOrderBySecretId = useMemo(() => {
    const map = new Map<string, number>();
    activeTrailSecretIds.forEach((secretId, idx) => {
      if (!map.has(secretId)) {
        map.set(secretId, idx + 1);
      }
    });
    return map;
  }, [activeTrailSecretIds]);

  const step1FloorId = useMemo(() => {
    const step1Id = activeTrailSecretIds[0];
    if (!step1Id) return null;
    return allPins.find((p) => p.secretId === step1Id)?.floorId ?? null;
  }, [activeTrailSecretIds, allPins]);

  const computeInitialFloorId = (): string => {
    if (selectedSecretId) {
      const match = allPins.find((p) => p.secretId === selectedSecretId);
      if (match) return match.floorId;
    }
    if (step1FloorId) return step1FloorId;
    if (selectedRoomId) {
      const floorWithRoom = baseSubmap.floors.find((f) =>
        f.rooms.some((r) => r.id === selectedRoomId),
      );
      if (floorWithRoom) return floorWithRoom.id;
    }
    return baseSubmap.defaultFloorId ?? baseSubmap.floors[0].id;
  };

  const [internalFloorId, setInternalFloorId] = useState<string>(computeInitialFloorId);
  const [internalRoomId, setInternalRoomId] = useState<string | null>(selectedRoomId ?? null);
  const [focusedPinId, setFocusedPinId] = useState<string | null>(null);
  const [hoveredPinId, setHoveredPinId] = useState<string | null>(null);
  const [localHideLater, setLocalHideLater] = useState<boolean>(hideLaterVisits);
  const [zoomIdx, setZoomIdx] = useState<number>(0);
  const [showKeySummary, setShowKeySummary] = useState<boolean>(false);

  // Sync local hide-later toggle when parent prop or region changes
  useEffect(() => {
    setLocalHideLater(hideLaterVisits);
  }, [hideLaterVisits, region.id]);

  // Reset floor & selection cleanly when switching regions
  useEffect(() => {
    const nextFloor =
      (selectedSecretId && allPins.find((p) => p.secretId === selectedSecretId)?.floorId) ||
      step1FloorId ||
      baseSubmap.defaultFloorId ||
      baseSubmap.floors[0].id;
    setInternalFloorId(nextFloor);
    setFocusedPinId(null);
    setInternalRoomId(selectedRoomId ?? null);
    setZoomIdx(0);
    setShowKeySummary(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [region.id]);

  // Auto-jump to the floor holding externally selected secret
  useEffect(() => {
    if (!selectedSecretId) return;
    const match = allPins.find((p) => p.secretId === selectedSecretId);
    if (match) {
      setInternalFloorId(match.floorId);
      setFocusedPinId(match.id);
    }
  }, [selectedSecretId, allPins]);

  // Auto-jump to floor holding externally selected room
  useEffect(() => {
    if (selectedRoomId === undefined) return;
    setInternalRoomId(selectedRoomId);
    if (selectedRoomId) {
      const floorWithRoom = baseSubmap.floors.find((f) =>
        f.rooms.some((r) => r.id === selectedRoomId),
      );
      if (floorWithRoom) {
        setInternalFloorId(floorWithRoom.id);
      }
    }
  }, [selectedRoomId, baseSubmap.floors]);

  const effectiveFloorId =
    activeFloorId && baseSubmap.floors.some((f) => f.id === activeFloorId)
      ? activeFloorId
      : baseSubmap.floors.some((f) => f.id === internalFloorId)
        ? internalFloorId
        : baseSubmap.floors[0].id;

  const activeFloor: SubmapFloor =
    baseSubmap.floors.find((f) => f.id === effectiveFloorId) ?? baseSubmap.floors[0];

  const effectiveRoomId = selectedRoomId !== undefined ? selectedRoomId : internalRoomId;
  const effectiveHideLater = onHideLaterVisitsChange ? hideLaterVisits : localHideLater;

  const handleSelectFloor = (floorId: string) => {
    setInternalFloorId(floorId);
    onSelectFloor?.(floorId);
  };

  const handleToggleHideLater = () => {
    const next = !effectiveHideLater;
    if (onHideLaterVisitsChange) {
      onHideLaterVisitsChange(next);
    } else {
      setLocalHideLater(next);
    }
  };

  const handleRoomClick = (room: SubmapRoom) => {
    const nextRoomId = effectiveRoomId === room.id ? null : room.id;
    setInternalRoomId(nextRoomId);
    onSelectRoom?.(nextRoomId);
  };

  const handlePinActivate = (pin: SubmapPin) => {
    setFocusedPinId(pin.id);
    if (pin.secretId) {
      onSelectSecret?.(pin.secretId);
    } else if (pin.connectedRegionId) {
      onSelectConnectedRegion?.(pin.connectedRegionId);
    }
  };

  // Floor statistics & tucked later-visit pin count
  const { floorStatsById, totalReadyCount, totalCompletedCount, totalSecretCount, laterPinsCount } =
    useMemo(() => {
      const stats = new Map<string, { ready: number; completed: number; total: number }>();
      for (const floor of baseSubmap.floors) {
        stats.set(floor.id, { ready: 0, completed: 0, total: 0 });
      }
      let readyAll = 0;
      let completedAll = 0;
      let totalAll = 0;
      let laterCount = 0;

      for (const pin of allPins) {
        const evalItem = pin.secretId ? evalBySecretId.get(pin.secretId) : undefined;
        const info = classifyPin(pin, evalItem);
        if (info.state === 'later' || info.state === 'locked') {
          laterCount += 1;
        }
        if (pin.secretId) {
          totalAll += 1;
          const bucket = stats.get(pin.floorId);
          if (bucket) bucket.total += 1;
          if (info.state === 'completed') {
            completedAll += 1;
            if (bucket) bucket.completed += 1;
          } else if (info.state === 'ready' || info.state === 'trick') {
            readyAll += 1;
            if (bucket) bucket.ready += 1;
          }
        }
      }

      return {
        floorStatsById: stats,
        totalReadyCount: readyAll,
        totalCompletedCount: completedAll,
        totalSecretCount: totalAll,
        laterPinsCount: laterCount,
      };
    }, [baseSubmap.floors, allPins, evalBySecretId]);

  const activeFloorPins = useMemo(
    () => allPins.filter((pin) => pin.floorId === activeFloor.id),
    [allPins, activeFloor.id],
  );

  // Ordered Co-Pilot trail coordinates on the active floor
  const activeFloorTrailPoints = useMemo(() => {
    const ordered: Array<{ pin: SubmapPin; step: number }> = [];
    activeTrailSecretIds.forEach((secretId, idx) => {
      const match = activeFloorPins.find((p) => p.secretId === secretId);
      if (match) {
        ordered.push({ pin: match, step: idx + 1 });
      }
    });
    return ordered;
  }, [activeTrailSecretIds, activeFloorPins]);

  // Determine the active inspector target (selected secret -> focused pin -> Step 1 pin -> first pin)
  const inspectorPin: SubmapPin | null = useMemo(() => {
    if (selectedSecretId) {
      const match = allPins.find((p) => p.secretId === selectedSecretId);
      if (match) return match;
    }
    if (focusedPinId) {
      const match = allPins.find((p) => p.id === focusedPinId);
      if (match) return match;
    }
    if (activeFloorTrailPoints.length > 0) {
      return activeFloorTrailPoints[0].pin;
    }
    return activeFloorPins.find((p) => Boolean(p.secretId)) ?? activeFloorPins[0] ?? null;
  }, [selectedSecretId, focusedPinId, activeFloorTrailPoints, activeFloorPins, allPins]);

  const selectedRoomObj: SubmapRoom | null = useMemo(
    () => activeFloor.rooms.find((r) => r.id === effectiveRoomId) ?? null,
    [activeFloor.rooms, effectiveRoomId],
  );

  // Accessible roving-tabindex keyboard handler for floor tabs
  const handleTabKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>, index: number) => {
    const count = baseSubmap.floors.length;
    if (count <= 1) return;
    let nextIndex: number | null = null;
    if (e.key === 'ArrowRight') {
      nextIndex = (index + 1) % count;
    } else if (e.key === 'ArrowLeft') {
      nextIndex = (index - 1 + count) % count;
    } else if (e.key === 'Home') {
      nextIndex = 0;
    } else if (e.key === 'End') {
      nextIndex = count - 1;
    }
    if (nextIndex !== null) {
      e.preventDefault();
      const nextFloor = baseSubmap.floors[nextIndex];
      handleSelectFloor(nextFloor.id);
      tabRefs.current[nextIndex]?.focus();
    }
  };

  const zoomPercent = ZOOM_STEPS[zoomIdx];
  const canZoomOut = zoomIdx > 0;
  const canZoomIn = zoomIdx < ZOOM_STEPS.length - 1;
  const toolbarSlotCount = (laterPinsCount > 0 ? 1 : 0) + 3;

  const handleToolbarKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>, slot: number) => {
    let next: number | null = null;
    if (e.key === 'ArrowRight') {
      next = (slot + 1) % toolbarSlotCount;
    } else if (e.key === 'ArrowLeft') {
      next = (slot - 1 + toolbarSlotCount) % toolbarSlotCount;
    } else if (e.key === 'Home') {
      next = 0;
    } else if (e.key === 'End') {
      next = toolbarSlotCount - 1;
    }
    if (next !== null) {
      e.preventDefault();
      setToolbarFocusIdx(next);
      toolbarRefs.current[next]?.focus();
    }
  };

  const inspectorEval = inspectorPin?.secretId
    ? evalBySecretId.get(inspectorPin.secretId)
    : undefined;
  const inspectorInfo = inspectorPin ? classifyPin(inspectorPin, inspectorEval) : null;
  const inspectorFloor = inspectorPin
    ? baseSubmap.floors.find((f) => f.id === inspectorPin.floorId)
    : activeFloor;
  const inspectorRoom = inspectorPin
    ? inspectorFloor?.rooms.find((r) => r.id === inspectorPin.roomId)
    : selectedRoomObj;

  const activePanelId = `${instanceId}-panel-${activeFloor.id}`;
  const activeTabId = `${instanceId}-tab-${activeFloor.id}`;

  return (
    <div
      className={`area-submap area-submap--${baseSubmap.mode} ${className}`.trim()}
      data-region-id={region.id}
      data-submap-mode={baseSubmap.mode}
    >
      {/* Header & Accessible Control Toolbar */}
      <header className="area-submap__header">
        <div className="area-submap__title-group">
          {onBackToWorldMap && (
            <button
              type="button"
              className="area-submap__back-btn"
              onClick={onBackToWorldMap}
            >
              ← World Map
            </button>
          )}
          <h3 className="area-submap__heading">{baseSubmap.title}</h3>
          <span className="area-submap__mode-pill">
            {baseSubmap.mode === 'blueprint' ? 'Interactive Floor Blueprint' : 'Illustrated Area Map'}
          </span>
          {totalSecretCount > 0 && (
            <span className="area-submap__progress-pill">
              {totalReadyCount} Ready · {totalCompletedCount}/{totalSecretCount} Done
            </span>
          )}
        </div>

        <div
          role="toolbar"
          aria-label="Sub-map view controls"
          className="area-submap__toolbar"
        >
          {laterPinsCount > 0 && (
            <button
              ref={(el) => {
                toolbarRefs.current[0] = el;
              }}
              type="button"
              className="area-submap__tool-btn"
              tabIndex={toolbarFocusIdx === 0 ? 0 : -1}
              aria-pressed={!effectiveHideLater}
              onClick={() => {
                setToolbarFocusIdx(0);
                handleToggleHideLater();
              }}
              onKeyDown={(e) => handleToolbarKeyDown(e, 0)}
            >
              <span>Show Later/Adult Pins</span>
              <span className="area-submap__tool-count">{laterPinsCount}</span>
            </button>
          )}

          {(() => {
            const baseSlot = laterPinsCount > 0 ? 1 : 0;
            const activeSlot = toolbarFocusIdx < toolbarSlotCount ? toolbarFocusIdx : 0;
            return (
              <>
                <button
                  ref={(el) => {
                    toolbarRefs.current[baseSlot] = el;
                  }}
                  type="button"
                  className="area-submap__tool-btn"
                  tabIndex={activeSlot === baseSlot ? 0 : -1}
                  aria-label="Zoom out sub-map"
                  aria-disabled={!canZoomOut}
                  onClick={() => {
                    setToolbarFocusIdx(baseSlot);
                    if (canZoomOut) setZoomIdx((z) => Math.max(0, z - 1));
                  }}
                  onKeyDown={(e) => handleToolbarKeyDown(e, baseSlot)}
                >
                  −
                </button>
                <button
                  ref={(el) => {
                    toolbarRefs.current[baseSlot + 1] = el;
                  }}
                  type="button"
                  className="area-submap__tool-btn"
                  tabIndex={activeSlot === baseSlot + 1 ? 0 : -1}
                  aria-label="Reset sub-map zoom"
                  aria-disabled={zoomIdx === 0}
                  onClick={() => {
                    setToolbarFocusIdx(baseSlot + 1);
                    if (zoomIdx !== 0) setZoomIdx(0);
                  }}
                  onKeyDown={(e) => handleToolbarKeyDown(e, baseSlot + 1)}
                >
                  {zoomPercent}%
                </button>
                <button
                  ref={(el) => {
                    toolbarRefs.current[baseSlot + 2] = el;
                  }}
                  type="button"
                  className="area-submap__tool-btn"
                  tabIndex={activeSlot === baseSlot + 2 ? 0 : -1}
                  aria-label="Zoom in sub-map"
                  aria-disabled={!canZoomIn}
                  onClick={() => {
                    setToolbarFocusIdx(baseSlot + 2);
                    if (canZoomIn) setZoomIdx((z) => Math.min(ZOOM_STEPS.length - 1, z + 1));
                  }}
                  onKeyDown={(e) => handleToolbarKeyDown(e, baseSlot + 2)}
                >
                  +
                </button>
              </>
            );
          })()}
        </div>
      </header>

      {/* Dungeon Key / Map / Compass Summary Strip */}
      {baseSubmap.dungeonMeta && (
        <div className="area-submap__dungeon-strip" data-testid="dungeon-meta-strip">
          <div className="area-submap__dungeon-badges">
            <span className="area-submap__dungeon-chip">
              <span aria-hidden="true">🗝</span>
              Small Keys: {baseSubmap.dungeonMeta.smallKeysCount}
            </span>
            <span className="area-submap__dungeon-chip">
              <span aria-hidden="true">💀</span>
              Boss Key: {baseSubmap.dungeonMeta.hasBossKey ? 'Yes' : 'None'}
            </span>
            {baseSubmap.dungeonMeta.hasMap && (
              <span className="area-submap__dungeon-chip">
                <span aria-hidden="true">🗺</span> Dungeon Map
              </span>
            )}
            {baseSubmap.dungeonMeta.hasCompass && (
              <span className="area-submap__dungeon-chip">
                <span aria-hidden="true">🧭</span> Compass
              </span>
            )}
          </div>

          {baseSubmap.dungeonMeta.keyLocationsSummary.length > 0 && (
            <button
              type="button"
              className="area-submap__dungeon-keys-toggle"
              aria-expanded={showKeySummary}
              onClick={() => setShowKeySummary((prev) => !prev)}
            >
              {showKeySummary ? 'Hide Key Guide' : 'Key & Routing Notes'}
            </button>
          )}

          {showKeySummary && (
            <ul className="area-submap__dungeon-key-list">
              {baseSubmap.dungeonMeta.keyLocationsSummary.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Multi-Floor Tab Switcher (4F / 3F / 2F / 1F / B1 / B2 / B3) */}
      {baseSubmap.floors.length > 1 ? (
        <div className="area-submap__tablist-row">
          <div
            role="tablist"
            aria-label={`${region.name} floor selector`}
            className="area-submap__tablist"
          >
            {baseSubmap.floors.map((floor, idx) => {
              const isSelected = floor.id === activeFloor.id;
              const fStats = floorStatsById.get(floor.id);
              const holdsStep1 = step1FloorId === floor.id;
              return (
                <button
                  key={floor.id}
                  ref={(el) => {
                    tabRefs.current[idx] = el;
                  }}
                  id={`${instanceId}-tab-${floor.id}`}
                  type="button"
                  role="tab"
                  aria-selected={isSelected}
                  tabIndex={isSelected ? 0 : -1}
                  className="area-submap__tab"
                  onClick={() => handleSelectFloor(floor.id)}
                  onKeyDown={(e) => handleTabKeyDown(e, idx)}
                >
                  <span>{floor.label}</span>
                  {fStats && fStats.total > 0 && (
                    <span className="area-submap__tab-meta">
                      {fStats.ready > 0
                        ? `${fStats.ready} ready`
                        : `${fStats.completed}/${fStats.total}`}
                    </span>
                  )}
                  {holdsStep1 && (
                    <span
                      className="area-submap__tab-step1"
                      data-testid={`floor-step1-${floor.id}`}
                    >
                      Step 1
                    </span>
                  )}
                </button>
              );
            })}
          </div>
          <p className="area-submap__floor-caption">{activeFloor.title}</p>
        </div>
      ) : (
        <p className="area-submap__floor-caption">{activeFloor.title}</p>
      )}

      {/* Interactive SVG Sub-Map Viewport (unstyled tabpanel outer wrapper per modern-web-guidance) */}
      <div
        id={activePanelId}
        role={baseSubmap.floors.length > 1 ? 'tabpanel' : undefined}
        aria-labelledby={baseSubmap.floors.length > 1 ? activeTabId : undefined}
      >
        <div className="area-submap__viewport">
        <svg
          viewBox={baseSubmap.viewBox}
          className="area-submap__svg"
          style={{ width: `${zoomPercent}%` }}
          role="group"
          aria-label={`${region.name} — ${activeFloor.title}`}
        >
          <defs>
            <pattern
              id={`${instanceId}-bp-grid`}
              width="40"
              height="40"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 40 0 L 0 0 0 40"
                fill="none"
                className="submap-grid-line"
              />
            </pattern>
            <marker
              id={`${instanceId}-arrow`}
              viewBox="0 0 10 10"
              refX="7"
              refY="5"
              markerWidth="5"
              markerHeight="5"
              orient="auto-start-reverse"
            >
              <path d="M 0 1 L 10 5 L 0 9 z" fill="var(--color-triforce)" />
            </marker>
          </defs>

          {/* Illustrated Cartographic Backdrop OR Blueprint Architectural Grid */}
          {baseSubmap.mode === 'illustrated' && activeFloor.imageUrl ? (
            <>
              <image
                href={activeFloor.imageUrl}
                x="0"
                y="0"
                width="800"
                height="560"
                preserveAspectRatio="xMidYMid slice"
              />
              <rect
                x="0"
                y="0"
                width="800"
                height="560"
                className="submap-illustrated-scrim"
              />
            </>
          ) : (
            <>
              <rect
                x="0"
                y="0"
                width="800"
                height="560"
                className="submap-bg-blueprint"
              />
              <rect
                x="0"
                y="0"
                width="800"
                height="560"
                fill={`url(#${instanceId}-bp-grid)`}
              />
            </>
          )}

          {/* Corridor Lines Rendered Under Room Plates */}
          <g aria-hidden="true">
            {(activeFloor.connectors ?? []).map((conn) => {
              if (!conn.to && !conn.waypoints?.length) return null;
              const pts = [
                conn.from,
                ...(conn.waypoints ?? []),
                ...(conn.to ? [conn.to] : []),
              ]
                .map((pt) => `${pt.x},${pt.y}`)
                .join(' ');
              const lineMod =
                conn.kind === 'acoustic-route'
                  ? 'submap-connector__line--acoustic'
                  : conn.kind === 'warp-tunnel'
                    ? 'submap-connector__line--warp'
                    : '';
              return (
                <polyline
                  key={`${conn.id}-line`}
                  points={pts}
                  className={`submap-connector__line ${lineMod}`.trim()}
                  markerEnd={
                    conn.kind === 'acoustic-route'
                      ? `url(#${instanceId}-arrow)`
                      : undefined
                  }
                />
              );
            })}
          </g>

          {/* Named Clickable Room / Sub-Zone Polygons */}
          <g>
            {activeFloor.rooms.map((room) => {
              const isSelected = effectiveRoomId === room.id;
              const shortText = room.shortLabel ?? room.label;
              const pillWidth = Math.max(76, Math.min(210, shortText.length * 7.2 + 18));
              return (
                <g
                  key={room.id}
                  role="button"
                  tabIndex={0}
                  aria-label={`Room: ${room.label}`}
                  aria-pressed={isSelected}
                  data-room-id={room.id}
                  className={`submap-room submap-room--${room.accent ?? 'default'} ${
                    isSelected ? 'submap-room--selected' : ''
                  }`.trim()}
                  onClick={() => handleRoomClick(room)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleRoomClick(room);
                    } else if (e.key === ' ') {
                      e.preventDefault();
                    }
                  }}
                  onKeyUp={(e) => {
                    if (e.key === ' ') {
                      e.preventDefault();
                      handleRoomClick(room);
                    }
                  }}
                >
                  <polygon points={room.polygon} className="submap-room__poly" />
                  <rect
                    x={room.labelPos.x - pillWidth / 2}
                    y={room.labelPos.y - 11}
                    width={pillWidth}
                    height={22}
                    rx={6}
                    className="submap-room__label-pill"
                  />
                  <text
                    x={room.labelPos.x}
                    y={room.labelPos.y}
                    className="submap-room__label"
                  >
                    {shortText}
                  </text>
                </g>
              );
            })}
          </g>

          {/* Interactive Connector Badges (Stairs, Drop Holes, Bombable Walls, Locked/Boss Doors) */}
          <g>
            {(activeFloor.connectors ?? []).map((conn) => {
              if (conn.kind === 'corridor' && !conn.label) return null;
              const anchor =
                conn.waypoints && conn.waypoints.length > 0
                  ? conn.waypoints[Math.floor(conn.waypoints.length / 2)]
                  : conn.to
                    ? {
                        x: Math.round((conn.from.x + conn.to.x) / 2),
                        y: Math.round((conn.from.y + conn.to.y) / 2),
                      }
                    : conn.from;
              const isJumpable = Boolean(conn.targetFloorId);
              return (
                <g
                  key={conn.id}
                  role={isJumpable ? 'button' : undefined}
                  tabIndex={isJumpable ? 0 : undefined}
                  aria-label={
                    isJumpable
                      ? `${conn.label ?? conn.kind} — switch floor`
                      : undefined
                  }
                  className={`submap-connector__node ${
                    isJumpable ? 'submap-connector__node--interactive' : ''
                  }`.trim()}
                  onClick={() => {
                    if (conn.targetFloorId) {
                      handleSelectFloor(conn.targetFloorId);
                    }
                  }}
                  onKeyDown={(e) => {
                    if (!conn.targetFloorId) return;
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleSelectFloor(conn.targetFloorId);
                    } else if (e.key === ' ') {
                      e.preventDefault();
                    }
                  }}
                  onKeyUp={(e) => {
                    if (conn.targetFloorId && e.key === ' ') {
                      e.preventDefault();
                      handleSelectFloor(conn.targetFloorId);
                    }
                  }}
                >
                  {conn.kind !== 'corridor' && conn.kind !== 'acoustic-route' && (
                    <>
                      <circle
                        cx={anchor.x}
                        cy={anchor.y}
                        r={11}
                        className="submap-connector__badge"
                      />
                      <text
                        x={anchor.x}
                        y={anchor.y}
                        className="submap-connector__glyph"
                      >
                        {getConnectorSymbol(conn.kind)}
                      </text>
                    </>
                  )}
                  {conn.label && (
                    <text
                      x={anchor.x}
                      y={
                        conn.kind === 'corridor' || conn.kind === 'acoustic-route'
                          ? anchor.y - 8
                          : anchor.y + 21
                      }
                      className="submap-connector__caption"
                    >
                      {conn.label}
                    </text>
                  )}
                </g>
              );
            })}
          </g>

          {/* Co-Pilot Active Trail Dashed Path Between Pins on Active Floor */}
          {activeFloorTrailPoints.length >= 2 && (
            <polyline
              data-testid="copilot-trail-path"
              className="submap-trail-path"
              points={activeFloorTrailPoints
                .map(({ pin }) => `${pin.x},${pin.y}`)
                .join(' ')}
              markerEnd={`url(#${instanceId}-arrow)`}
            />
          )}

          {/* Room-Accurate Collectible, Gear, Key & Gateway Pins */}
          <g>
            {activeFloorPins.map((pin) => {
              const evalItem = pin.secretId ? evalBySecretId.get(pin.secretId) : undefined;
              const info = classifyPin(pin, evalItem);
              const trailStep = pin.secretId
                ? trailOrderBySecretId.get(pin.secretId)
                : undefined;
              const isSelected =
                (pin.secretId && selectedSecretId === pin.secretId) ||
                focusedPinId === pin.id;
              const isHovered = hoveredPinId === pin.id;
              const isTucked =
                effectiveHideLater &&
                (info.state === 'later' || info.state === 'locked') &&
                !isSelected &&
                !trailStep;

              const radius = trailStep || isSelected ? 13.5 : 11.5;
              const tooltipLabel =
                pin.label.length > 34 ? `${pin.label.slice(0, 32)}…` : pin.label;
              const tooltipWidth = Math.max(96, tooltipLabel.length * 6.8 + 20);
              const tooltipY = pin.y < 52 ? pin.y + 26 : pin.y - 26;

              return (
                <g
                  key={pin.id}
                  role="button"
                  tabIndex={isTucked ? -1 : 0}
                  aria-label={`${pin.label} (${info.statusLabel})`}
                  data-pin-id={pin.id}
                  data-secret-id={pin.secretId}
                  data-pin-state={info.state}
                  data-tucked={isTucked ? 'true' : 'false'}
                  className={`submap-pin submap-pin--${info.state} ${
                    isTucked ? 'submap-pin--tucked' : ''
                  }`.trim()}
                  onClick={() => handlePinActivate(pin)}
                  onMouseEnter={() => setHoveredPinId(pin.id)}
                  onMouseLeave={() =>
                    setHoveredPinId((prev) => (prev === pin.id ? null : prev))
                  }
                  onFocus={() => setHoveredPinId(pin.id)}
                  onBlur={() =>
                    setHoveredPinId((prev) => (prev === pin.id ? null : prev))
                  }
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handlePinActivate(pin);
                    } else if (e.key === ' ') {
                      e.preventDefault();
                    }
                  }}
                  onKeyUp={(e) => {
                    if (e.key === ' ') {
                      e.preventDefault();
                      handlePinActivate(pin);
                    }
                  }}
                >
                  {(isSelected || Boolean(trailStep)) && (
                    <circle
                      cx={pin.x}
                      cy={pin.y}
                      r={radius + 5}
                      className="submap-pin__halo"
                    />
                  )}

                  {/* Distinct marker shapes (diamond for dungeon gear/gateways, circle for secrets) */}
                  {pin.kind === 'dungeon-gear' || info.state === 'gateway' ? (
                    <polygon
                      points={`${pin.x},${pin.y - radius - 1} ${pin.x + radius + 1},${pin.y} ${pin.x},${pin.y + radius + 1} ${pin.x - radius - 1},${pin.y}`}
                      className="submap-pin__body"
                    />
                  ) : (
                    <circle
                      cx={pin.x}
                      cy={pin.y}
                      r={radius}
                      className="submap-pin__body"
                    />
                  )}

                  <text x={pin.x} y={pin.y} className="submap-pin__glyph">
                    {info.glyph}
                  </text>

                  {/* Glowing Co-Pilot Trail Step Badge (1, 2, 3...) */}
                  {trailStep !== undefined && (
                    <g data-testid={`trail-step-badge-${trailStep}`}>
                      <circle
                        cx={pin.x + 11}
                        cy={pin.y - 11}
                        r={9.5}
                        className="submap-pin__trail-badge"
                      />
                      <text
                        x={pin.x + 11}
                        y={pin.y - 11}
                        className="submap-pin__trail-num"
                      >
                        {trailStep}
                      </text>
                    </g>
                  )}

                  {/* Hover / Focus / Selected Callout Pill */}
                  {(isHovered || isSelected) && (
                    <g>
                      <rect
                        x={Math.max(8, Math.min(792 - tooltipWidth, pin.x - tooltipWidth / 2))}
                        y={tooltipY - 11}
                        width={tooltipWidth}
                        height={22}
                        rx={6}
                        className="submap-pin__tooltip-bg"
                      />
                      <text
                        x={Math.max(
                          8 + tooltipWidth / 2,
                          Math.min(792 - tooltipWidth / 2, pin.x),
                        )}
                        y={tooltipY}
                        className="submap-pin__tooltip-text"
                      >
                        {tooltipLabel}
                      </text>
                    </g>
                  )}
                </g>
              );
            })}
          </g>
        </svg>
        </div>
      </div>

      {/* Room Quick-Filter Chips */}
      <div className="area-submap__room-chips" aria-label="Rooms and sub-zones on current floor">
        {activeFloor.rooms.map((room) => {
          const isSelected = effectiveRoomId === room.id;
          return (
            <button
              key={room.id}
              type="button"
              className="area-submap__room-chip"
              aria-pressed={isSelected}
              onClick={() => handleRoomClick(room)}
            >
              {room.shortLabel ?? room.label}
            </button>
          );
        })}
      </div>

      {/* Interactive Pin / Room Inspector & One-Click Check-Off Bar */}
      {(inspectorPin || selectedRoomObj) && (
        <div className="area-submap__inspector" data-testid="submap-inspector">
          {selectedRoomObj && !focusedPinId && !selectedSecretId ? (
            <>
              <div className="area-submap__inspector-main">
                <div className="area-submap__inspector-eyebrow">
                  <span>{activeFloor.label}</span>
                  <span>·</span>
                  <span>Selected Zone</span>
                </div>
                <p className="area-submap__inspector-title">{selectedRoomObj.label}</p>
                {selectedRoomObj.summary && (
                  <p className="area-submap__inspector-note">
                    <FormattedGuideText text={selectedRoomObj.summary} />
                  </p>
                )}
              </div>
              <div className="area-submap__inspector-actions">
                {selectedRoomObj.connectedRegionId && onSelectConnectedRegion && (
                  <button
                    type="button"
                    className="area-submap__travel-btn"
                    onClick={() =>
                      onSelectConnectedRegion(selectedRoomObj.connectedRegionId!)
                    }
                  >
                    Travel to {formatRegionName(selectedRoomObj.connectedRegionId)} →
                  </button>
                )}
              </div>
            </>
          ) : inspectorPin && inspectorInfo ? (
            <>
              <div className="area-submap__inspector-main">
                <div className="area-submap__inspector-eyebrow">
                  <span>{inspectorFloor?.label ?? activeFloor.label}</span>
                  {inspectorRoom && (
                    <>
                      <span>·</span>
                      <span>{inspectorRoom.shortLabel ?? inspectorRoom.label}</span>
                    </>
                  )}
                  <span
                    className={`area-submap__status-tag area-submap__status-tag--${
                      inspectorInfo.state === 'completed'
                        ? 'completed'
                        : inspectorInfo.state === 'later' || inspectorInfo.state === 'locked'
                          ? 'later'
                          : 'ready'
                    }`}
                  >
                    {inspectorInfo.statusLabel}
                  </span>
                </div>
                <p className="area-submap__inspector-title">
                  {inspectorEval?.secret.title ?? inspectorPin.label}
                </p>
                {(inspectorPin.note || inspectorEval?.secret.locationHint) && (
                  <p className="area-submap__inspector-note">
                    <FormattedGuideText
                      text={(inspectorPin.note ?? inspectorEval?.secret.locationHint)!}
                    />
                  </p>
                )}
              </div>

              <div className="area-submap__inspector-actions">
                {inspectorPin.secretId && onToggleSecret && (
                  <button
                    type="button"
                    className="area-submap__check-btn"
                    aria-pressed={inspectorInfo.state === 'completed'}
                    onClick={() =>
                      onToggleSecret(
                        inspectorPin.secretId!,
                        inspectorInfo.state !== 'completed',
                      )
                    }
                  >
                    {inspectorInfo.state === 'completed' ? 'Completed ✓' : 'Mark Found'}
                  </button>
                )}

                {inspectorPin.connectedRegionId && onSelectConnectedRegion && (
                  <button
                    type="button"
                    className="area-submap__travel-btn"
                    onClick={() =>
                      onSelectConnectedRegion(inspectorPin.connectedRegionId!)
                    }
                  >
                    Travel to {formatRegionName(inspectorPin.connectedRegionId)} →
                  </button>
                )}
              </div>
            </>
          ) : null}
        </div>
      )}

      {/* Non-Color Shape + Icon Legend */}
      <div className="area-submap__legend" aria-label="Map pin legend">
        <span className="area-submap__legend-item">
          <strong aria-hidden="true">♥ / ✦ / ◆</strong> Ready Now
        </span>
        <span className="area-submap__legend-item">
          <strong aria-hidden="true">✓</strong> Completed
        </span>
        <span className="area-submap__legend-item">
          <strong aria-hidden="true">★</strong> Early Trick
        </span>
        <span className="area-submap__legend-item">
          <strong aria-hidden="true">⏳ / 🔒</strong> Later Era / Gear
        </span>
        <span className="area-submap__legend-item">
          <strong aria-hidden="true">↗ / ⇄</strong> Region Exit / Warp
        </span>
      </div>
    </div>
  );
};

export default AreaSubmapView;
