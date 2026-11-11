import { describe, expect, it } from 'vitest';
import { REGION_BY_ID, SECRETS_BY_REGION } from '../index';
import { BLUEPRINT_SUBMAPS } from './blueprints';
import { OVERWORLD_CHILD_A_SUBMAPS } from './overworldChildA';
import { OVERWORLD_CHILD_B_SUBMAPS } from './overworldChildB';
import { ADULT_TEMPLE_SUBMAPS_A } from './adultTemplesA';
import { ADULT_TEMPLE_SUBMAPS_B } from './adultTemplesB';
import type { RegionSubmapDefinition } from './types';

const ALL_ADULT_TEMPLE_SUBMAPS: RegionSubmapDefinition[] = [
  ...ADULT_TEMPLE_SUBMAPS_A,
  ...ADULT_TEMPLE_SUBMAPS_B,
];

const RAW_SECRET_ID_PATTERN =
  /\b(?:eq|hp|gs|gf|skr|cap|bottle|bean|song|sw2|boss-hc|medallion|stone|trial|biggoron-step|mask-step|grotto)-[a-z0-9-]+\b/i;

function parsePolygon(polygon: string): Array<{ x: number; y: number }> {
  return polygon
    .trim()
    .split(/\s+/)
    .map((pair) => {
      const [xStr, yStr] = pair.split(',');
      return { x: Number(xStr), y: Number(yStr) };
    });
}

function pointInPolygon(x: number, y: number, vertices: Array<{ x: number; y: number }>): boolean {
  let inside = false;
  for (let i = 0, j = vertices.length - 1; i < vertices.length; j = i++) {
    const xi = vertices[i].x;
    const yi = vertices[i].y;
    const xj = vertices[j].x;
    const yj = vertices[j].y;
    const intersect = yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}

function getBoundingBox(vertices: Array<{ x: number; y: number }>) {
  return {
    minX: Math.min(...vertices.map((v) => v.x)),
    maxX: Math.max(...vertices.map((v) => v.x)),
    minY: Math.min(...vertices.map((v) => v.y)),
    maxY: Math.max(...vertices.map((v) => v.y)),
  };
}

describe('Phase 2 Adult Temples, Mini-Dungeons & Dream Hub Blueprints', () => {
  it('exports all 9 expected blueprint regions across ADULT_TEMPLE_SUBMAPS_A and ADULT_TEMPLE_SUBMAPS_B', () => {
    expect(ADULT_TEMPLE_SUBMAPS_A.map((s) => s.regionId)).toEqual([
      'forest-temple',
      'fire-temple',
      'ice-cavern',
      'water-temple',
    ]);
    expect(ADULT_TEMPLE_SUBMAPS_B.map((s) => s.regionId)).toEqual([
      'shadow-temple',
      'spirit-temple',
      'gerudo-training-ground',
      'ganons-castle',
      'hall-of-fallen-foes',
    ]);

    for (const submap of ALL_ADULT_TEMPLE_SUBMAPS) {
      expect(REGION_BY_ID[submap.regionId], `Unknown regionId ${submap.regionId}`).toBeDefined();
      expect(submap.mode).toBe('blueprint');
      expect(submap.viewBox).toBe('0 0 800 560');
    }
  });

  it('models exact multi-floor hierarchies, dungeon key counts, and signature companion landmarks', () => {
    const byId = Object.fromEntries(ALL_ADULT_TEMPLE_SUBMAPS.map((s) => [s.regionId, s]));

    // 1. Forest Temple (4 Floors, 5 Small Keys)
    const forest = byId['forest-temple'];
    expect(forest.floors.map((f) => f.label)).toEqual(['2F', '1F', 'B1', 'B2']);
    expect(forest.dungeonMeta?.smallKeysCount).toBe(5);
    expect(forest.dungeonMeta?.hasBossKey).toBe(true);
    expect(forest.pins.filter((p) => p.kind === 'small-key')).toHaveLength(5);
    expect(forest.pins.filter((p) => p.kind === 'boss-key')).toHaveLength(1);

    // 2. Fire Temple (5 Floors, 8 Small Keys)
    const fire = byId['fire-temple'];
    expect(fire.floors.map((f) => f.label)).toEqual(['5F', '4F', '3F', '2F', '1F']);
    expect(fire.dungeonMeta?.smallKeysCount).toBe(8);
    expect(fire.dungeonMeta?.hasBossKey).toBe(true);
    expect(fire.pins.filter((p) => p.kind === 'small-key')).toHaveLength(8);
    expect(fire.pins.filter((p) => p.kind === 'boss-key')).toHaveLength(1);

    // 3. Ice Cavern (1F, 0 Small Keys)
    const ice = byId['ice-cavern'];
    expect(ice.floors.map((f) => f.label)).toEqual(['1F']);
    expect(ice.dungeonMeta?.smallKeysCount).toBe(0);
    expect(ice.dungeonMeta?.hasBossKey).toBe(false);
    expect(ice.dungeonMeta?.hasMap).toBe(true);
    expect(ice.dungeonMeta?.hasCompass).toBe(true);

    // 4. Water Temple (4 Floors, 6 Small Keys + 3 Water Plaques + Under-Float-Block Key)
    const water = byId['water-temple'];
    expect(water.floors.map((f) => f.label)).toEqual(['3F', '2F', '1F', 'B1']);
    expect(water.dungeonMeta?.smallKeysCount).toBe(6);
    expect(water.dungeonMeta?.hasBossKey).toBe(true);
    expect(water.pins.filter((p) => p.kind === 'small-key')).toHaveLength(6);
    expect(water.pins.filter((p) => p.kind === 'boss-key')).toHaveLength(1);
    const waterLabels = water.pins.map((p) => p.label).join(' | ');
    expect(waterLabels).toMatch(/LOW \(1F\) Triforce Water Plaque/i);
    expect(waterLabels).toMatch(/MID \(2F\) Triforce Water Plaque/i);
    expect(waterLabels).toMatch(/HIGH \(3F\) Triforce Water Plaque/i);
    expect(waterLabels).toMatch(/Hidden Under-Float-Block/i);

    // 5. Shadow Temple (4 Floors, 5 Small Keys)
    const shadow = byId['shadow-temple'];
    expect(shadow.floors.map((f) => f.label)).toEqual(['B1', 'B2', 'B3', 'B4']);
    expect(shadow.dungeonMeta?.smallKeysCount).toBe(5);
    expect(shadow.dungeonMeta?.hasBossKey).toBe(true);
    expect(shadow.pins.filter((p) => p.kind === 'small-key')).toHaveLength(5);
    expect(shadow.pins.filter((p) => p.kind === 'boss-key')).toHaveLength(1);

    // 6. Spirit Temple (4 Floors, 5 Small Keys, Dual-Era Colossus Hands)
    const spirit = byId['spirit-temple'];
    expect(spirit.floors.map((f) => f.label)).toEqual(['1F', '2F', '3F', '4F']);
    expect(spirit.dungeonMeta?.smallKeysCount).toBe(5);
    expect(spirit.dungeonMeta?.hasBossKey).toBe(true);
    expect(spirit.pins.filter((p) => p.kind === 'small-key')).toHaveLength(5);
    expect(spirit.pins.filter((p) => p.kind === 'boss-key')).toHaveLength(1);

    // 7. Gerudo Training Ground (2 Floors, all 9 Small Keys + Ice Arrows)
    const gtg = byId['gerudo-training-ground'];
    expect(gtg.floors.map((f) => f.label)).toEqual(['1F', '2F']);
    expect(gtg.dungeonMeta?.smallKeysCount).toBe(9);
    expect(gtg.dungeonMeta?.hasBossKey).toBe(false);
    expect(gtg.pins.filter((p) => p.kind === 'small-key')).toHaveLength(9);

    // 8. Inside Ganon's Castle (3 Floors, 6 Trials + Golden Gauntlets + 2 Small Keys + Boss Key)
    const ganon = byId['ganons-castle'];
    expect(ganon.floors.map((f) => f.label)).toEqual(['1F', 'B1', '2F–5F']);
    expect(ganon.dungeonMeta?.smallKeysCount).toBe(2);
    expect(ganon.dungeonMeta?.hasBossKey).toBe(true);
    expect(ganon.pins.filter((p) => p.kind === 'small-key')).toHaveLength(2);
    expect(ganon.pins.filter((p) => p.kind === 'boss-key')).toHaveLength(1);

    // 9. Hall of Fallen Foes (1F Rotunda, 6 Museum Wings/Arenas + 3 Green-Bed Exits)
    const foes = byId['hall-of-fallen-foes'];
    expect(foes.floors.map((f) => f.label)).toEqual(['1F']);
    expect(foes.floors[0].rooms).toHaveLength(6);
    const exitRegions = foes.pins
      .filter((p) => p.kind === 'entrance')
      .map((p) => p.connectedRegionId);
    expect(exitRegions).toEqual(
      expect.arrayContaining(['kokiri-forest', 'kakariko-village', 'lake-hylia']),
    );
  });

  it('pins 100% of canonical SECRETS_BY_REGION[id] secrets to valid floor + room polygons without duplicates or unknown IDs', () => {
    const globalPinIds = new Set<string>();

    for (const submap of ALL_ADULT_TEMPLE_SUBMAPS) {
      const { regionId } = submap;
      const floorById = new Map(submap.floors.map((f) => [f.id, f]));
      expect(
        submap.defaultFloorId && floorById.has(submap.defaultFloorId),
        `${regionId}: invalid defaultFloorId`,
      ).toBe(true);

      const canonicalSecrets = SECRETS_BY_REGION[regionId] ?? [];
      const canonicalIds = new Set(canonicalSecrets.map((s) => s.id));
      const pinnedSecrets = new Set<string>();

      for (const pin of submap.pins) {
        expect(globalPinIds.has(pin.id), `Duplicate pin ID '${pin.id}'`).toBe(false);
        globalPinIds.add(pin.id);

        const floor = floorById.get(pin.floorId);
        expect(floor, `${regionId}: pin '${pin.id}' missing floor '${pin.floorId}'`).toBeDefined();

        const room = floor!.rooms.find((r) => r.id === pin.roomId);
        expect(
          room,
          `${regionId}: pin '${pin.id}' missing room '${pin.roomId}' on '${pin.floorId}'`,
        ).toBeDefined();

        expect(pin.x).toBeGreaterThanOrEqual(30);
        expect(pin.x).toBeLessThanOrEqual(770);
        expect(pin.y).toBeGreaterThanOrEqual(30);
        expect(pin.y).toBeLessThanOrEqual(530);

        const vertices = parsePolygon(room!.polygon);
        expect(
          pointInPolygon(pin.x, pin.y, vertices),
          `${regionId}: pin '${pin.id}' (${pin.x},${pin.y}) lies outside room '${room!.id}' polygon`,
        ).toBe(true);

        if (pin.connectedRegionId) {
          expect(
            REGION_BY_ID[pin.connectedRegionId],
            `${regionId}: pin '${pin.id}' references unknown connectedRegionId '${pin.connectedRegionId}'`,
          ).toBeDefined();
        }

        if (pin.secretId) {
          expect(
            canonicalIds.has(pin.secretId),
            `${regionId}: pin '${pin.id}' references non-canonical secretId '${pin.secretId}' for this region`,
          ).toBe(true);
          expect(
            pinnedSecrets.has(pin.secretId),
            `${regionId}: duplicate secret pin for '${pin.secretId}'`,
          ).toBe(false);
          pinnedSecrets.add(pin.secretId);
        }
      }

      for (const sec of canonicalSecrets) {
        expect(
          pinnedSecrets.has(sec.id),
          `${regionId}: missing canonical secret pin '${sec.id}' (${sec.title})`,
        ).toBe(true);
      }

      // Every region's connectedRegions in regions.json is reachable via at least one entrance/warp pin
      for (const connRegionId of REGION_BY_ID[regionId].connectedRegions) {
        const hasGateway = submap.pins.some((p) => p.connectedRegionId === connRegionId);
        expect(
          hasGateway,
          `${regionId}: missing gateway pin to connected region '${connRegionId}'`,
        ).toBe(true);
      }
    }
  });

  it('enforces clean SVG room geometry, valid connectors, non-overlapping rooms, and collision-free pin spacing', () => {
    for (const submap of ALL_ADULT_TEMPLE_SUBMAPS) {
      const floorById = new Map(submap.floors.map((f) => [f.id, f]));
      const roomIds = new Set<string>();

      for (const floor of submap.floors) {
        expect(floor.rooms.length, `${submap.regionId}/${floor.id}: empty rooms`).toBeGreaterThan(0);
        const boxes: Array<{ id: string; minX: number; maxX: number; minY: number; maxY: number }> =
          [];

        for (const room of floor.rooms) {
          expect(roomIds.has(room.id), `Duplicate room id ${room.id}`).toBe(false);
          roomIds.add(room.id);

          const vertices = parsePolygon(room.polygon);
          expect(vertices.length).toBeGreaterThanOrEqual(3);
          for (const v of vertices) {
            expect(Number.isFinite(v.x) && v.x >= 0 && v.x <= 800).toBe(true);
            expect(Number.isFinite(v.y) && v.y >= 0 && v.y <= 560).toBe(true);
          }

          expect(
            pointInPolygon(room.labelPos.x, room.labelPos.y, vertices),
            `${submap.regionId}: room '${room.id}' labelPos lies outside its polygon`,
          ).toBe(true);

          if (room.connectedRegionId) {
            expect(REGION_BY_ID[room.connectedRegionId]).toBeDefined();
          }

          const box = { id: room.id, ...getBoundingBox(vertices) };
          for (const prev of boxes) {
            const overlapsX = box.minX < prev.maxX && box.maxX > prev.minX;
            const overlapsY = box.minY < prev.maxY && box.maxY > prev.minY;
            expect(
              overlapsX && overlapsY,
              `${submap.regionId}/${floor.id}: rooms '${prev.id}' and '${box.id}' overlap`,
            ).toBe(false);
          }
          boxes.push(box);
        }

        for (const conn of floor.connectors ?? []) {
          expect(conn.from.x >= 0 && conn.from.x <= 800).toBe(true);
          expect(conn.from.y >= 0 && conn.from.y <= 560).toBe(true);
          if (conn.to) {
            expect(conn.to.x >= 0 && conn.to.x <= 800).toBe(true);
            expect(conn.to.y >= 0 && conn.to.y <= 560).toBe(true);
          }
          if (conn.targetFloorId) {
            expect(
              floorById.has(conn.targetFloorId),
              `${submap.regionId}/${conn.id}: invalid targetFloorId '${conn.targetFloorId}'`,
            ).toBe(true);
          }
        }

        const floorPins = submap.pins.filter((p) => p.floorId === floor.id);
        for (let i = 0; i < floorPins.length; i++) {
          const a = floorPins[i];
          const room = floor.rooms.find((r) => r.id === a.roomId)!;
          const distToLabel = Math.hypot(a.x - room.labelPos.x, a.y - room.labelPos.y);
          expect(
            distToLabel,
            `${submap.regionId}: pin '${a.id}' collides with room label '${room.id}' (${distToLabel.toFixed(1)}px)`,
          ).toBeGreaterThanOrEqual(24);

          for (let j = i + 1; j < floorPins.length; j++) {
            const b = floorPins[j];
            const dist = Math.hypot(a.x - b.x, a.y - b.y);
            expect(
              dist,
              `${submap.regionId}/${floor.id}: pins '${a.id}' and '${b.id}' are too close (${dist.toFixed(1)}px)`,
            ).toBeGreaterThanOrEqual(28);
          }
        }
      }
    }
  });

  it('contains zero raw secret IDs in any user-visible title, label, summary, or note', () => {
    for (const submap of ALL_ADULT_TEMPLE_SUBMAPS) {
      const textsToScan: Array<{ where: string; text?: string }> = [
        { where: `${submap.regionId}.title`, text: submap.title },
        { where: `${submap.regionId}.subtitle`, text: submap.subtitle },
      ];

      for (const note of submap.dungeonMeta?.keyLocationsSummary ?? []) {
        textsToScan.push({ where: `${submap.regionId}.dungeonMeta`, text: note });
      }

      for (const floor of submap.floors) {
        textsToScan.push({ where: `${submap.regionId}/${floor.id}.title`, text: floor.title });
        for (const room of floor.rooms) {
          textsToScan.push({ where: `${room.id}.label`, text: room.label });
          textsToScan.push({ where: `${room.id}.shortLabel`, text: room.shortLabel });
          textsToScan.push({ where: `${room.id}.summary`, text: room.summary });
        }
        for (const conn of floor.connectors ?? []) {
          textsToScan.push({ where: `${conn.id}.label`, text: conn.label });
        }
      }

      for (const pin of submap.pins) {
        textsToScan.push({ where: `${pin.id}.label`, text: pin.label });
        textsToScan.push({ where: `${pin.id}.note`, text: pin.note });
      }

      for (const { where, text } of textsToScan) {
        if (!text) continue;
        expect(text, `Raw secret ID leaked in ${where}: "${text}"`).not.toMatch(
          RAW_SECRET_ID_PATTERN,
        );
      }
    }
  });

  it('has zero regionId, roomId, connectorId, or pinId collisions with Phase 1 bespoke submaps', () => {
    const phase1Submaps: RegionSubmapDefinition[] = [
      ...BLUEPRINT_SUBMAPS,
      ...OVERWORLD_CHILD_A_SUBMAPS,
      ...OVERWORLD_CHILD_B_SUBMAPS,
    ];
    const phase1Regions = new Set(phase1Submaps.map((s) => s.regionId));
    const phase1Rooms = new Set<string>();
    const phase1Conns = new Set<string>();
    const phase1Pins = new Set<string>();

    for (const s of phase1Submaps) {
      for (const f of s.floors) {
        for (const r of f.rooms) phase1Rooms.add(r.id);
        for (const c of f.connectors ?? []) phase1Conns.add(c.id);
      }
      for (const p of s.pins) phase1Pins.add(p.id);
    }

    for (const s of ALL_ADULT_TEMPLE_SUBMAPS) {
      expect(phase1Regions.has(s.regionId), `Duplicate regionId ${s.regionId}`).toBe(false);
      for (const f of s.floors) {
        for (const r of f.rooms) {
          expect(phase1Rooms.has(r.id), `Colliding roomId ${r.id}`).toBe(false);
        }
        for (const c of f.connectors ?? []) {
          expect(phase1Conns.has(c.id), `Colliding connectorId ${c.id}`).toBe(false);
        }
      }
      for (const p of s.pins) {
        expect(phase1Pins.has(p.id), `Colliding pinId ${p.id}`).toBe(false);
      }
    }
  });
});
