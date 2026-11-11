import type { EvaluatedSecret, Region } from '../../types/zelda';
import { ADULT_OVERWORLD_SUBMAPS } from './adultOverworld';
import { ADULT_TEMPLE_SUBMAPS_A } from './adultTemplesA';
import { ADULT_TEMPLE_SUBMAPS_B } from './adultTemplesB';
import { BLUEPRINT_SUBMAPS } from './blueprints';
import { OVERWORLD_CHILD_A_SUBMAPS } from './overworldChildA';
import { OVERWORLD_CHILD_B_SUBMAPS } from './overworldChildB';
import { buildFallbackSubmap } from './fallbackGenerator';
import type { RegionSubmapDefinition } from './types';

export * from './types';
export { buildFallbackSubmap } from './fallbackGenerator';

export interface SubmapSecretRoomAssignment {
  roomId: string;
  roomLabel?: string;
  floorId?: string;
  floorLabel?: string;
}

const ALL_BESPOKE_SUBMAPS: RegionSubmapDefinition[] = [
  ...BLUEPRINT_SUBMAPS,
  ...ADULT_TEMPLE_SUBMAPS_A,
  ...ADULT_TEMPLE_SUBMAPS_B,
  ...OVERWORLD_CHILD_A_SUBMAPS,
  ...OVERWORLD_CHILD_B_SUBMAPS,
  ...ADULT_OVERWORLD_SUBMAPS,
];

export const SUBMAP_BY_REGION_ID: Record<string, RegionSubmapDefinition> = Object.fromEntries(
  ALL_BESPOKE_SUBMAPS.map((submap) => [submap.regionId, submap]),
);

export function hasDedicatedSubmap(regionId: string): boolean {
  return Boolean(SUBMAP_BY_REGION_ID[regionId]);
}

export function getSubmapForRegion(regionId: string): RegionSubmapDefinition | null {
  return SUBMAP_BY_REGION_ID[regionId] ?? null;
}

/**
 * Returns the bespoke submap for Child Hyrule regions (all 21 Child-accessible regions)
 * or dynamically constructs a multi-floor/zoned schematic fallback for Phase 2 Adult regions.
 */
export function resolveSubmapForRegion(
  region: Region,
  evaluatedSecrets: EvaluatedSecret[] = [],
): RegionSubmapDefinition {
  return getSubmapForRegion(region.id) ?? buildFallbackSubmap(region, evaluatedSecrets);
}

/**
 * Builds a `secretId -> { roomId, roomLabel, floorId, floorLabel }` map directly compatible
 * with `<GuidedAreaWorkspace secretRoomMap={...} />` so Room Explorer cards and Submap rooms
 * highlight and filter in unison.
 */
export function getSecretRoomMapForRegion(
  region: Region,
  evaluatedSecrets: EvaluatedSecret[] = [],
): Record<string, SubmapSecretRoomAssignment> {
  const submap = resolveSubmapForRegion(region, evaluatedSecrets);
  const floorById = new Map(submap.floors.map((f) => [f.id, f]));
  const map: Record<string, SubmapSecretRoomAssignment> = {};

  for (const pin of submap.pins) {
    if (!pin.secretId || map[pin.secretId]) continue;
    const floor = floorById.get(pin.floorId);
    const room = floor?.rooms.find((r) => r.id === pin.roomId);
    const roomTitle = room?.label ?? pin.roomId;
    const prefix = submap.floors.length > 1 && floor ? `${floor.label} — ` : '';
    map[pin.secretId] = {
      roomId: pin.roomId,
      roomLabel: `${prefix}${roomTitle}`,
      floorId: pin.floorId,
      floorLabel: floor?.label,
    };
  }

  return map;
}
