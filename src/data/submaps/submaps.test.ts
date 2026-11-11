import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { REGIONS, REGION_BY_ID, SECRETS_BY_REGION } from '../index';
import type { EvaluatedSecret } from '../../types/zelda';
import {
  SUBMAP_BY_REGION_ID,
  buildFallbackSubmap,
  getSecretRoomMapForRegion,
  getSubmapForRegion,
  hasDedicatedSubmap,
  resolveSubmapForRegion,
} from './index';

const CHILD_HYRULE_BESPOKE_REGION_IDS = [
  // 5 Multi-Floor Interactive Blueprints
  'goron-city',
  'deku-tree',
  'dodongos-cavern',
  'jabu-jabus-belly',
  'bottom-of-the-well',
  // 2 Maze / Labyrinth Blueprints
  'lost-woods',
  'sacred-forest-meadow',
  // 14 Illustrated Regional Sub-Maps
  'kokiri-forest',
  'hyrule-field',
  'lon-lon-ranch',
  'market',
  'hyrule-castle',
  'kakariko-village',
  'graveyard',
  'death-mountain-trail',
  'death-mountain-crater',
  'zoras-river',
  'zoras-domain',
  'zoras-fountain',
  'lake-hylia',
  'gerudo-valley',
] as const;

describe('Sub-Map Registry & Phase 1 Child Hyrule Coverage', () => {
  it('provides bespoke submaps for all 21 Child-accessible regions', () => {
    for (const regionId of CHILD_HYRULE_BESPOKE_REGION_IDS) {
      expect(hasDedicatedSubmap(regionId), `Missing submap for ${regionId}`).toBe(true);
      const submap = getSubmapForRegion(regionId);
      expect(submap).not.toBeNull();
      expect(submap?.regionId).toBe(regionId);
      expect(submap?.viewBox).toBe('0 0 800 560');
      expect(submap!.floors.length).toBeGreaterThanOrEqual(1);
    }
  });

  it('models exact multi-floor dungeon & hub blueprints (Goron City, Deku Tree, Dodongo, Jabu, Well)', () => {
    const goron = getSubmapForRegion('goron-city')!;
    expect(goron.mode).toBe('blueprint');
    expect(goron.floors.map((f) => f.label)).toEqual(['4F', '3F', '2F', '1F']);
    const goronSecretIds = goron.pins.map((p) => p.secretId).filter(Boolean);
    expect(goronSecretIds).toEqual(
      expect.arrayContaining([
        'gs-030',
        'gs-031',
        'cap-bombs-30',
        'hp-17',
        'eq-goron-bracelet',
        'eq-goron-tunic',
      ]),
    );

    const deku = getSubmapForRegion('deku-tree')!;
    expect(deku.mode).toBe('blueprint');
    expect(deku.floors.map((f) => f.label)).toEqual(['3F', '2F', '1F', 'B1', 'B2']);
    expect(deku.dungeonMeta?.hasCompass).toBe(true);
    expect(deku.pins.map((p) => p.secretId)).toEqual(
      expect.arrayContaining(['eq-slingshot', 'boss-hc-deku', 'stone-emerald', 'gs-057', 'gs-060']),
    );

    const dodongo = getSubmapForRegion('dodongos-cavern')!;
    expect(dodongo.floors.map((f) => f.label)).toEqual(['2F', '1F']);
    expect(dodongo.pins.map((p) => p.secretId)).toEqual(
      expect.arrayContaining(['eq-bomb-bag', 'boss-hc-dodongo', 'stone-ruby', 'gs-061', 'gs-065']),
    );

    const jabu = getSubmapForRegion('jabu-jabus-belly')!;
    expect(jabu.floors.map((f) => f.label)).toEqual(['1F', 'B1']);
    expect(jabu.pins.map((p) => p.secretId)).toEqual(
      expect.arrayContaining(['eq-boomerang', 'boss-hc-jabu', 'stone-sapphire', 'gs-066', 'gs-069']),
    );

    const well = getSubmapForRegion('bottom-of-the-well')!;
    expect(well.floors.map((f) => f.label)).toEqual(['B1', 'B2', 'B3']);
    expect(well.dungeonMeta?.smallKeysCount).toBe(3);
    expect(well.pins.map((p) => p.secretId)).toEqual(
      expect.arrayContaining(['eq-lens-of-truth', 'gs-088', 'gs-089', 'gs-090']),
    );
  });

  it('maintains strict room, floor, connector, coordinate, and secret-ID integrity across every bespoke submap', () => {
    for (const [regionId, submap] of Object.entries(SUBMAP_BY_REGION_ID)) {
      const floorById = new Map(submap.floors.map((f) => [f.id, f]));
      if (submap.defaultFloorId) {
        expect(floorById.has(submap.defaultFloorId), `${regionId}: invalid defaultFloorId`).toBe(
          true,
        );
      }

      for (const floor of submap.floors) {
        expect(floor.rooms.length, `${regionId}/${floor.id}: empty rooms`).toBeGreaterThan(0);
        for (const conn of floor.connectors ?? []) {
          if (conn.targetFloorId) {
            expect(
              floorById.has(conn.targetFloorId),
              `${regionId}/${conn.id}: invalid targetFloorId ${conn.targetFloorId}`,
            ).toBe(true);
          }
        }
      }

      const pinIds = new Set<string>();
      const pinnedSecrets = new Set<string>();

      for (const pin of submap.pins) {
        expect(pinIds.has(pin.id), `Duplicate pin id ${pin.id}`).toBe(false);
        pinIds.add(pin.id);

        const floor = floorById.get(pin.floorId);
        expect(floor, `${regionId}: pin ${pin.id} references missing floor ${pin.floorId}`).toBeDefined();

        const roomExists = floor!.rooms.some((r) => r.id === pin.roomId);
        expect(
          roomExists,
          `${regionId}: pin ${pin.id} references missing room ${pin.roomId} on ${pin.floorId}`,
        ).toBe(true);

        expect(pin.x).toBeGreaterThanOrEqual(0);
        expect(pin.x).toBeLessThanOrEqual(800);
        expect(pin.y).toBeGreaterThanOrEqual(0);
        expect(pin.y).toBeLessThanOrEqual(560);

        if (pin.secretId) {
          pinnedSecrets.add(pin.secretId);
        }
      }

      // Every canonical secret currently in data/*.json for this region must be pinned!
      const regionSecrets = SECRETS_BY_REGION[regionId] ?? [];
      for (const sec of regionSecrets) {
        expect(
          pinnedSecrets.has(sec.id),
          `Region ${regionId} submap is missing canonical secret pin '${sec.id}' (${sec.title})`,
        ).toBe(true);
      }
    }
  });

  it('ships crisp illustrated cartographic JPEGs on disk for all 14 illustrated overworld submaps', () => {
    const publicDir = path.resolve(process.cwd(), 'public');
    const illustratedSubmaps = Object.values(SUBMAP_BY_REGION_ID).filter(
      (s) => s.mode === 'illustrated',
    );
    expect(illustratedSubmaps).toHaveLength(14);

    for (const submap of illustratedSubmaps) {
      for (const floor of submap.floors) {
        expect(floor.imageUrl).toMatch(/^\.\/maps\/regions\/[a-z0-9-]+\.jpg$/);
        const relPath = floor.imageUrl!.replace(/^\.\//, '');
        const absPath = path.join(publicDir, relPath);
        expect(fs.existsSync(absPath), `Missing illustrated asset: ${absPath}`).toBe(true);
        const sizeBytes = fs.statSync(absPath).size;
        expect(sizeBytes).toBeGreaterThan(15_000);
        expect(sizeBytes).toBeLessThan(250_000);
      }
    }
  });

  it('generates clean schematic multi-floor fallbacks for all 13 Phase 2 Adult regions (34/34 total coverage)', () => {
    expect(REGIONS).toHaveLength(34);
    const toAvailableEval = (sec: (typeof SECRETS_BY_REGION)[string][number]): EvaluatedSecret => ({
      secret: sec,
      status: 'available-now',
      missingPrimaryIds: [],
      satisfiedAltMethods: [],
      primaryBlockerGroupKey: 'ready',
      primaryBlockerLabel: 'Ready Now',
      primaryBlockerCategory: 'other',
    });

    for (const region of REGIONS) {
      const mockEvaluated = (SECRETS_BY_REGION[region.id] ?? []).map(toAvailableEval);
      const resolved = resolveSubmapForRegion(region, mockEvaluated);
      expect(resolved.regionId).toBe(region.id);
      expect(resolved.floors.length).toBeGreaterThanOrEqual(1);
    }

    const waterTemple = REGION_BY_ID['water-temple'];
    const waterEvaluated = (SECRETS_BY_REGION['water-temple'] ?? []).map(toAvailableEval);
    const fallback = buildFallbackSubmap(waterTemple, waterEvaluated);
    expect(fallback.mode).toBe('blueprint');
    expect(fallback.dungeonMeta?.smallKeysCount).toBe(6);
    expect(fallback.floors.length).toBeGreaterThan(1);
    const fallbackSecretIds = fallback.pins.map((p) => p.secretId).filter(Boolean);
    for (const sec of SECRETS_BY_REGION['water-temple']) {
      expect(fallbackSecretIds).toContain(sec.id);
    }

    const goronRoomMap = getSecretRoomMapForRegion(REGION_BY_ID['goron-city']);
    expect(goronRoomMap['eq-goron-bracelet']?.floorLabel).toBe('1F');
    expect(goronRoomMap['cap-bombs-30']?.floorLabel).toBe('3F');
  });
});
