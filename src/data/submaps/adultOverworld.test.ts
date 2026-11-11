import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { REGION_BY_ID, SECRETS_BY_REGION } from '../index';
import { ADULT_OVERWORLD_SUBMAPS } from './adultOverworld';

const EXPECTED_ADULT_OVERWORLD_IDS = [
  'outside-ganons-castle',
  'gerudo-fortress',
  'haunted-wasteland',
  'desert-colossus',
] as const;

const RAW_ID_LEAK_REGEX =
  /\b(?:eq|hp|gs|gf|skr|cap|bottle|bean|song|sw2|grotto|biggoron|mask|trial|stone|medallion|boss-hc|bp|cow)-[a-z0-9-]+\b/i;

function readJpegDimensions(buf: Buffer): { width: number; height: number } | null {
  let offset = 2;
  while (offset + 8 < buf.length) {
    if (buf[offset] !== 0xff) {
      offset += 1;
      continue;
    }
    const marker = buf[offset + 1];
    if (marker === 0xd8 || marker === 0x01 || (marker >= 0xd0 && marker <= 0xd7)) {
      offset += 2;
      continue;
    }
    if (marker === 0xd9 || marker === 0xda) {
      break;
    }
    const segLen = buf.readUInt16BE(offset + 2);
    // SOF0 (baseline) or SOF2 (progressive)
    if (marker === 0xc0 || marker === 0xc2) {
      const height = buf.readUInt16BE(offset + 5);
      const width = buf.readUInt16BE(offset + 7);
      return { width, height };
    }
    offset += 2 + segLen;
  }
  return null;
}

describe('Phase 2 Adult Overworld Illustrated Sub-Maps', () => {
  it('exports all 4 illustrated Adult Overworld sub-maps with standardized 800x560 viewBoxes', () => {
    expect(ADULT_OVERWORLD_SUBMAPS).toHaveLength(4);
    expect(ADULT_OVERWORLD_SUBMAPS.map((s) => s.regionId)).toEqual([
      ...EXPECTED_ADULT_OVERWORLD_IDS,
    ]);

    for (const submap of ADULT_OVERWORLD_SUBMAPS) {
      expect(submap.mode).toBe('illustrated');
      expect(submap.viewBox).toBe('0 0 800 560');
      expect(submap.defaultFloorId).toBe('overworld');
      expect(submap.floors).toHaveLength(1);
      expect(submap.floors[0].id).toBe('overworld');
      expect(submap.floors[0].imageUrl).toBe(`./maps/regions/${submap.regionId}.jpg`);
    }
  });

  it('ships valid, crisp 960x672 JPEG cartographic artwork (>10 KB, valid SOI/EOI headers) on disk', () => {
    const publicDir = path.resolve(process.cwd(), 'public');

    for (const submap of ADULT_OVERWORLD_SUBMAPS) {
      const imageUrl = submap.floors[0].imageUrl!;
      expect(imageUrl).toMatch(/^\.\/maps\/regions\/[a-z0-9-]+\.jpg$/);

      const absPath = path.join(publicDir, imageUrl.replace(/^\.\//, ''));
      expect(fs.existsSync(absPath), `Missing JPEG asset at ${absPath}`).toBe(true);

      const buf = fs.readFileSync(absPath);
      expect(buf.byteLength).toBeGreaterThan(10_000);
      expect(buf.byteLength).toBeLessThan(200_000);

      // Valid JPEG SOI (0xFF 0xD8 0xFF) and EOI (0xFF 0xD9) markers
      expect(buf[0]).toBe(0xff);
      expect(buf[1]).toBe(0xd8);
      expect(buf[2]).toBe(0xff);
      expect(buf[buf.length - 2]).toBe(0xff);
      expect(buf[buf.length - 1]).toBe(0xd9);

      const dims = readJpegDimensions(buf);
      expect(dims).toEqual({ width: 960, height: 672 });
    }
  });

  it('pins 100% of canonical secrets and connected gateways at valid room-calibrated coordinates', () => {
    const globalPinIds = new Set<string>();

    for (const submap of ADULT_OVERWORLD_SUBMAPS) {
      const { regionId } = submap;
      const region = REGION_BY_ID[regionId];
      expect(region, `Unknown regionId ${regionId}`).toBeDefined();

      const floorById = new Map(submap.floors.map((f) => [f.id, f]));

      for (const floor of submap.floors) {
        expect(floor.rooms.length).toBeGreaterThanOrEqual(4);
        const roomIds = new Set<string>();

        for (const room of floor.rooms) {
          expect(roomIds.has(room.id), `Duplicate room id ${room.id}`).toBe(false);
          roomIds.add(room.id);

          const vertices = room.polygon.trim().split(/\s+/);
          expect(vertices.length).toBeGreaterThanOrEqual(3);
          for (const v of vertices) {
            const [vx, vy] = v.split(',').map(Number);
            expect(vx).toBeGreaterThanOrEqual(0);
            expect(vx).toBeLessThanOrEqual(800);
            expect(vy).toBeGreaterThanOrEqual(0);
            expect(vy).toBeLessThanOrEqual(560);
          }

          expect(room.labelPos.x).toBeGreaterThan(20);
          expect(room.labelPos.x).toBeLessThan(780);
          expect(room.labelPos.y).toBeGreaterThan(20);
          expect(room.labelPos.y).toBeLessThan(545);
        }
      }

      const pinnedSecretIds = new Set<string>();
      const gatewayTargets = new Set<string>();

      for (const pin of submap.pins) {
        expect(globalPinIds.has(pin.id), `Duplicate pin id ${pin.id}`).toBe(false);
        globalPinIds.add(pin.id);

        const floor = floorById.get(pin.floorId);
        expect(floor, `${regionId}: pin ${pin.id} missing floor ${pin.floorId}`).toBeDefined();
        expect(
          floor!.rooms.some((r) => r.id === pin.roomId),
          `${regionId}: pin ${pin.id} references unknown room ${pin.roomId}`,
        ).toBe(true);

        expect(pin.x).toBeGreaterThanOrEqual(20);
        expect(pin.x).toBeLessThanOrEqual(780);
        expect(pin.y).toBeGreaterThanOrEqual(20);
        expect(pin.y).toBeLessThanOrEqual(545);

        if (pin.secretId) {
          pinnedSecretIds.add(pin.secretId);
        }
        if (pin.connectedRegionId) {
          gatewayTargets.add(pin.connectedRegionId);
        }

        // Verify pin sits inside its assigned room's bounding box
        const room = floor!.rooms.find((r) => r.id === pin.roomId)!;
        const coords = room.polygon
          .trim()
          .split(/\s+/)
          .map((pair) => pair.split(',').map(Number));
        const xs = coords.map(([cx]) => cx);
        const ys = coords.map(([, cy]) => cy);
        expect(pin.x, `${pin.id} x outside ${room.id}`).toBeGreaterThanOrEqual(Math.min(...xs));
        expect(pin.x, `${pin.id} x outside ${room.id}`).toBeLessThanOrEqual(Math.max(...xs));
        expect(pin.y, `${pin.id} y outside ${room.id}`).toBeGreaterThanOrEqual(Math.min(...ys));
        expect(pin.y, `${pin.id} y outside ${room.id}`).toBeLessThanOrEqual(Math.max(...ys));
      }

      // Verify no two pins on the same submap collide visually (< 26px apart)
      for (let i = 0; i < submap.pins.length; i += 1) {
        for (let j = i + 1; j < submap.pins.length; j += 1) {
          const a = submap.pins[i];
          const b = submap.pins[j];
          const dist = Math.hypot(a.x - b.x, a.y - b.y);
          expect(dist, `Pins ${a.id} and ${b.id} overlap (${dist.toFixed(1)}px)`).toBeGreaterThanOrEqual(26);
        }
      }

      const canonicalSecrets = SECRETS_BY_REGION[regionId] ?? [];
      expect(canonicalSecrets.length).toBeGreaterThan(0);
      for (const secret of canonicalSecrets) {
        expect(
          pinnedSecretIds.has(secret.id),
          `${regionId} submap is missing canonical secret '${secret.id}' (${secret.title})`,
        ).toBe(true);
      }

      for (const connectedId of region.connectedRegions) {
        expect(
          gatewayTargets.has(connectedId),
          `${regionId} submap is missing gateway pin to connected region '${connectedId}'`,
        ).toBe(true);
      }
    }
  });

  it('contains zero raw secret/requirement ID slugs, JSON references, or raw backticks in user-visible prose', () => {
    for (const submap of ADULT_OVERWORLD_SUBMAPS) {
      const visibleStrings: string[] = [submap.title, submap.subtitle ?? ''];

      for (const floor of submap.floors) {
        visibleStrings.push(floor.label, floor.title);
        for (const room of floor.rooms) {
          visibleStrings.push(room.label, room.shortLabel ?? '', room.summary ?? '');
        }
        for (const conn of floor.connectors ?? []) {
          visibleStrings.push(conn.label ?? '');
        }
      }

      for (const pin of submap.pins) {
        visibleStrings.push(pin.label, pin.note ?? '');
      }

      for (const text of visibleStrings) {
        if (!text) continue;
        expect(text, `Raw ID leaked in: "${text}"`).not.toMatch(RAW_ID_LEAK_REGEX);
        expect(text, `JSON filename leaked in: "${text}"`).not.toMatch(/\.json\b/i);
        expect(text, `Raw backtick or markdown leaked in: "${text}"`).not.toMatch(/`|\*\*/);
      }
    }
  });
});
