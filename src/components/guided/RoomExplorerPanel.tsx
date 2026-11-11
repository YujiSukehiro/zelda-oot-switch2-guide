import React, { useMemo } from 'react';
import { ArrowRight, Building2, Sparkles } from 'lucide-react';
import { ATTACHED_DUNGEONS_BY_REGION, REGION_BY_ID, REGIONS } from '../../data';
import type {
  AreaWalkthroughGuide,
  EvaluatedSecret,
  PlayerProgressState,
  Region,
  RegionProgressSummary,
  UnlockDelta,
} from '../../types/zelda';
import { SecretCard } from '../region';
import type { ExtendedGuidedRegionSummary } from './CoPilotPanel';

export interface SecretRoomAssignment {
  roomId: string;
  roomLabel?: string;
  floorId?: string;
  floorLabel?: string;
}

interface RoomGroup {
  roomId: string;
  label: string;
  items: EvaluatedSecret[];
}

function formatRoomIdFallback(roomId: string): string {
  return roomId
    .split('-')
    .map((part) => (part.length > 0 ? part[0].toUpperCase() + part.slice(1) : part))
    .join(' ');
}

export interface RoomExplorerPanelProps {
  region: Region;
  state: PlayerProgressState;
  effectiveRequirements: Set<string>;
  regionSummaries: Record<string, RegionProgressSummary>;
  areaGuide?: AreaWalkthroughGuide;
  evaluatedSecrets: EvaluatedSecret[];
  selectedRoomId: string | null;
  selectedSecretId: string | null;
  secretRoomMap?: Readonly<Record<string, SecretRoomAssignment>>;
  lastUnlockDelta?: UnlockDelta | null;
  activePopoverReqId: string | null;
  onSelectRoom: (roomId: string | null) => void;
  onSelectSecret: (secretId: string) => void;
  onToggleSecret: (secretId: string, completed?: boolean) => void;
  onSelectRegion: (regionId: string) => void;
  onSelectRequirementPill: (reqId: string, triggerEl: HTMLButtonElement) => void;
  onOpenSongbook?: (songId?: string) => void;
}

export const RoomExplorerPanel: React.FC<RoomExplorerPanelProps> = ({
  region,
  state,
  effectiveRequirements,
  regionSummaries,
  areaGuide,
  evaluatedSecrets,
  selectedRoomId,
  selectedSecretId,
  secretRoomMap,
  lastUnlockDelta,
  activePopoverReqId,
  onSelectRoom,
  onSelectSecret,
  onToggleSecret,
  onSelectRegion,
  onSelectRequirementPill,
  onOpenSongbook,
}) => {
  const roomGroups = useMemo<RoomGroup[]>(() => {
    const groupsMap = new Map<string, RoomGroup>();

    if (secretRoomMap && Object.keys(secretRoomMap).length > 0) {
      for (const ev of evaluatedSecrets) {
        const assignment = secretRoomMap[ev.secret.id];
        const roomId = assignment?.roomId ?? 'general-area';
        const label =
          assignment?.roomLabel ??
          (roomId === 'general-area'
            ? `${region.name} Grounds`
            : formatRoomIdFallback(roomId));
        const existing = groupsMap.get(roomId);
        if (existing) {
          existing.items.push(ev);
        } else {
          groupsMap.set(roomId, { roomId, label, items: [ev] });
        }
      }
      return Array.from(groupsMap.values());
    }

    // Fallback room/zone clustering from areaGuide phases when secretRoomMap is omitted
    if (areaGuide && areaGuide.phases.length > 0) {
      const assignedIds = new Set<string>();
      const evalById = new Map(evaluatedSecrets.map((ev) => [ev.secret.id, ev]));

      for (const phase of areaGuide.phases) {
        const phaseItems: EvaluatedSecret[] = [];
        for (const secId of phase.secretIds) {
          const ev = evalById.get(secId);
          if (ev && !assignedIds.has(secId)) {
            assignedIds.add(secId);
            phaseItems.push(ev);
          }
        }
        if (phaseItems.length > 0) {
          groupsMap.set(phase.id, {
            roomId: phase.id,
            label: phase.title,
            items: phaseItems,
          });
        }
      }

      const remaining = evaluatedSecrets.filter((ev) => !assignedIds.has(ev.secret.id));
      if (remaining.length > 0) {
        groupsMap.set('other-rooms', {
          roomId: 'other-rooms',
          label: 'Additional Rooms & Side Niches',
          items: remaining,
        });
      }

      if (groupsMap.size > 0) {
        return Array.from(groupsMap.values());
      }
    }

    return [
      {
        roomId: 'all-area',
        label: `${region.name} Collectibles & Objectives`,
        items: evaluatedSecrets,
      },
    ];
  }, [areaGuide, evaluatedSecrets, region.name, secretRoomMap]);

  const visibleGroups = useMemo<RoomGroup[]>(() => {
    if (!selectedRoomId) {
      return roomGroups;
    }
    const exactMatch = roomGroups.filter((g) => g.roomId === selectedRoomId);
    if (exactMatch.length > 0) {
      return exactMatch;
    }

    // Fuzzy token fallback when Floor Map emits a roomId without secretRoomMap
    const tokens = selectedRoomId
      .toLowerCase()
      .split(/[^a-z0-9]+/)
      .filter((t) => t.length >= 3);
    const fuzzyItems = evaluatedSecrets.filter((ev) => {
      const hay = `${ev.secret.title} ${ev.secret.locationHint} ${ev.secret.howToGet}`.toLowerCase();
      return tokens.some((tok) => hay.includes(tok));
    });

    return [
      {
        roomId: selectedRoomId,
        label: `Room: ${formatRoomIdFallback(selectedRoomId)}`,
        items: fuzzyItems.length > 0 ? fuzzyItems : evaluatedSecrets,
      },
    ];
  }, [evaluatedSecrets, roomGroups, selectedRoomId]);

  const deltaRegionIds = lastUnlockDelta ? Object.keys(lastUnlockDelta.byRegion) : [];

  const readyRadarRegions = useMemo(() => {
    const priorityIds = new Set<string>([
      ...(ATTACHED_DUNGEONS_BY_REGION[region.id]?.map((r) => r.id) ?? []),
      ...(region.parentRegionId ? [region.parentRegionId] : []),
      ...region.connectedRegions,
    ]);

    return REGIONS.filter((r) => {
      if (r.id === region.id) return false;
      const sum = regionSummaries[r.id] as
        | (RegionProgressSummary & ExtendedGuidedRegionSummary)
        | undefined;
      if (!sum || sum.isComplete || sum.isReachable === false) return false;
      return sum.readyNowCount > 0;
    })
      .sort((a, b) => {
        const aPrio = priorityIds.has(a.id) ? 1 : 0;
        const bPrio = priorityIds.has(b.id) ? 1 : 0;
        if (aPrio !== bPrio) return bPrio - aPrio;
        return (
          (regionSummaries[b.id]?.readyNowCount ?? 0) -
          (regionSummaries[a.id]?.readyNowCount ?? 0)
        );
      })
      .slice(0, 6);
  }, [region, regionSummaries]);

  return (
    <div className="guided-lens-panel-inner" data-testid="room-explorer-panel">
      {/* "✨ Newly Unlocked Across Hyrule" Radar */}
      <section
        className="unlock-radar-card"
        data-testid="unlock-radar-panel"
        aria-label="Newly Unlocked Across Hyrule Radar"
      >
        <h3 className="unlock-radar-card__title">
          <Sparkles size={14} aria-hidden="true" />
          <span>
            {lastUnlockDelta && lastUnlockDelta.totalUnlocked > 0
              ? `Newly Unlocked Across Hyrule (${lastUnlockDelta.totalUnlocked} opened!)`
              : 'Hyrule Unlock Radar — Ready Now Elsewhere'}
          </span>
        </h3>

        {lastUnlockDelta && lastUnlockDelta.totalUnlocked > 0 ? (
          <>
            <p className="copilot-complete-card__desc" data-testid="unlock-radar-delta-summary">
              <strong>{lastUnlockDelta.triggerLabel ?? 'New gear / melody'}</strong> just unlocked{' '}
              <strong>{lastUnlockDelta.totalUnlocked}</strong>{' '}
              {lastUnlockDelta.totalUnlocked === 1 ? 'secret' : 'secrets'} across{' '}
              <strong>{deltaRegionIds.length}</strong>{' '}
              {deltaRegionIds.length === 1 ? 'region' : 'regions'}:
            </p>
            <div className="unlock-radar-pills">
              {deltaRegionIds.map((regId) => {
                const targetReg = REGION_BY_ID[regId];
                const unlockedList = lastUnlockDelta.byRegion[regId] ?? [];
                return (
                  <button
                    key={regId}
                    type="button"
                    className="unlock-radar-pill"
                    data-testid={`unlock-radar-delta-region-${regId}`}
                    onClick={() => onSelectRegion(regId)}
                  >
                    <span>
                      {targetReg?.name ?? regId} (+{unlockedList.length})
                    </span>
                    <ArrowRight size={12} aria-hidden="true" />
                  </button>
                );
              })}
            </div>
          </>
        ) : readyRadarRegions.length > 0 ? (
          <div className="unlock-radar-pills" data-testid="unlock-radar-ready-regions">
            {readyRadarRegions.map((targetReg) => {
              const readyCount = regionSummaries[targetReg.id]?.readyNowCount ?? 0;
              return (
                <button
                  key={targetReg.id}
                  type="button"
                  className="unlock-radar-pill"
                  data-testid={`unlock-radar-ready-${targetReg.id}`}
                  onClick={() => onSelectRegion(targetReg.id)}
                >
                  <span>
                    {targetReg.name} (+{readyCount} Ready)
                  </span>
                  <ArrowRight size={12} aria-hidden="true" />
                </button>
              );
            })}
          </div>
        ) : (
          <p className="copilot-complete-card__desc">
            Claim new dungeon gear or songs to see newly unlocked secrets light up across Hyrule.
          </p>
        )}
      </section>

      {/* Room Filter Chips synced with Floor Map `selectedRoomId` */}
      {(roomGroups.length > 1 || selectedRoomId) && (
        <div
          className="room-filter-bar"
          data-testid="room-filter-bar"
          role="group"
          aria-label="Filter items by room"
        >
          <button
            type="button"
            className="room-filter-chip"
            data-testid="room-filter-all-btn"
            aria-pressed={selectedRoomId === null}
            onClick={() => onSelectRoom(null)}
          >
            All Rooms ({evaluatedSecrets.length})
          </button>

          {roomGroups.map((group) => (
            <button
              key={group.roomId}
              type="button"
              className="room-filter-chip"
              data-testid={`room-filter-${group.roomId}`}
              aria-pressed={selectedRoomId === group.roomId}
              onClick={() =>
                onSelectRoom(selectedRoomId === group.roomId ? null : group.roomId)
              }
            >
              {group.label} ({group.items.length})
            </button>
          ))}
        </div>
      )}

      {/* Room-Grouped Compact Expandable Secret Cards */}
      {visibleGroups.map((group) => (
        <section
          key={group.roomId}
          className="room-group-section"
          data-testid={`room-group-${group.roomId}`}
        >
          <h3 className="room-group-section__title">
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <Building2 size={14} aria-hidden="true" />
              <span>{group.label}</span>
            </span>
            <span className="guided-lens-tab__count">{group.items.length}</span>
          </h3>

          <div className="dossier-card-stack">
            {group.items.map((ev) => (
              <SecretCard
                key={ev.secret.id}
                evaluated={ev}
                effectiveRequirements={effectiveRequirements}
                customScarecrowNotes={state.customScarecrowNotes}
                activePopoverReqId={activePopoverReqId}
                compact
                isSelectedOnMap={selectedSecretId === ev.secret.id}
                onFocusOnMap={onSelectSecret}
                onToggleSecret={onToggleSecret}
                onSelectRequirementPill={onSelectRequirementPill}
                onOpenSongbook={onOpenSongbook}
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
};
