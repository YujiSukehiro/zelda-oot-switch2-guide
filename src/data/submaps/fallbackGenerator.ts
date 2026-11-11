import type { EvaluatedSecret, Region, UnifiedSecret } from '../../types/zelda';
import type {
  DungeonMeta,
  RegionSubmapDefinition,
  SubmapConnector,
  SubmapFloor,
  SubmapPin,
  SubmapRoom,
} from './types';

const FLOOR_TOKEN_ORDER = ['5F', '4F', '3F', '2F', '1F', 'B1', 'B2', 'B3', 'B4'] as const;

const PHASE2_DUNGEON_META: Record<string, DungeonMeta> = {
  'forest-temple': {
    smallKeysCount: 5,
    hasBossKey: true,
    hasMap: true,
    hasCompass: true,
    keyLocationsSummary: [
      '1F Entrance Tree Branch Chest (before even entering lobby!)',
      '1F Stalfos Arena Chest',
      'Courtyard Time-Block Underwater Well Chest',
      '2F Block-Push Puzzle Chest',
      'Twisted HallwayFloormaster Room Chest',
    ],
  },
  'fire-temple': {
    smallKeysCount: 8,
    hasBossKey: true,
    hasMap: true,
    hasCompass: true,
    keyLocationsSummary: [
      '1F Near Darunia Boss Door Cell',
      '1F Lava Bridge Left & Right Goron Cells (2 keys)',
      '3F Boulder Maze Left, Right & Bomb Crack Cells (3 keys)',
      '4F Shortcut Drop Goron Cell & Upper Hammer Switch Cell (2 keys)',
    ],
  },
  'ice-cavern': {
    smallKeysCount: 0,
    hasBossKey: false,
    hasMap: true,
    hasCompass: true,
    keyLocationsSummary: [
      'No Small Keys — collect Silver Rupees in Spinning Blade & Push-Block rooms + bottle extra Blue Fire!',
    ],
  },
  'water-temple': {
    smallKeysCount: 6,
    hasBossKey: true,
    hasMap: true,
    hasCompass: true,
    keyLocationsSummary: [
      'B1 Torch-Lock Room (from Low Water)',
      'B1 Bombable Cracked Floor under Central Tower (Mid Water!)',
      '1F Dragon Statue Jet Room',
      '1F Rolling Boulders Whirlpool Channel',
      '3F Behind Dark Link / Longshot River Chest',
      '1F North Bomb-Switch Gate Room',
    ],
  },
  'shadow-temple': {
    smallKeysCount: 5,
    hasBossKey: true,
    hasMap: true,
    hasCompass: true,
    keyLocationsSummary: [
      'B2 Gibdo Scythe Trap Room',
      'B2 Bombable Dirt Pile Room (Lens of Truth)',
      'B3 Falling Spikes Wooden Crate Pull',
      'B4 Invisible Floormaster Room',
      'B4 Three Spinning Skulls / Fire Walls Room',
    ],
  },
  'spirit-temple': {
    smallKeysCount: 5,
    hasBossKey: true,
    hasMap: true,
    hasCompass: true,
    keyLocationsSummary: [
      'Child 1F Boomerang-Switch Torches / Iron Knuckle Wing (2 keys)',
      'Adult 1F Silver Rupee Boulder Room',
      'Adult 2F Mirror-Shield Sun Statue Room',
      'Adult 3F Invisible Floormaster / Zelda’s Lullaby Hand Chest',
    ],
  },
  'gerudo-training-ground': {
    smallKeysCount: 9,
    hasBossKey: false,
    hasMap: false,
    hasCompass: false,
    keyLocationsSummary: [
      '7 keys earnable on first Child/Adult gear pass suffices via Left-Path shortcut to Ice Arrows (skip outer doors if desired!)',
    ],
  },
  'ganons-castle': {
    smallKeysCount: 2,
    hasBossKey: true,
    hasMap: false,
    hasCompass: false,
    keyLocationsSummary: [
      'Light Trial Invisible Ceiling Lullaby Chest + Spirit Trial Bombchu Sun Switch',
    ],
  },
};

function detectSecretFloorLabel(secret: UnifiedSecret, isDungeon: boolean): string {
  if (!isDungeon) return 'Map';
  const text = `${secret.title} ${secret.locationHint ?? ''} ${secret.howToGet}`;
  const match = text.match(/\b([1-5]F|B[1-4])\b/i);
  if (match) {
    return match[1].toUpperCase();
  }
  return '1F';
}

function formatRegionLabel(regionId: string): string {
  return regionId
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

/**
 * Generates a structured, multi-floor or zoned interactive schematic submap
 * for Phase 2 Adult regions & temples so all 34 regions render cleanly in `<AreaSubmapView />`.
 */
export function buildFallbackSubmap(
  region: Region,
  evaluatedSecrets: EvaluatedSecret[] = [],
): RegionSubmapDefinition {
  const isDungeon = region.kind === 'dungeon' || region.kind === 'mini-dungeon';
  const secrets = evaluatedSecrets.map((item) => item.secret);

  const groupedByFloor = new Map<string, UnifiedSecret[]>();
  for (const secret of secrets) {
    const floorLabel = detectSecretFloorLabel(secret, isDungeon);
    const bucket = groupedByFloor.get(floorLabel) ?? [];
    bucket.push(secret);
    groupedByFloor.set(floorLabel, bucket);
  }

  let floorLabels: string[];
  if (isDungeon) {
    const detected = FLOOR_TOKEN_ORDER.filter((token) => groupedByFloor.has(token));
    if (detected.length === 0) {
      floorLabels = ['1F'];
    } else {
      if (!detected.includes('1F')) {
        detected.push('1F');
        detected.sort(
          (a, b) =>
            FLOOR_TOKEN_ORDER.indexOf(a as (typeof FLOOR_TOKEN_ORDER)[number]) -
            FLOOR_TOKEN_ORDER.indexOf(b as (typeof FLOOR_TOKEN_ORDER)[number]),
        );
      }
      floorLabels = detected;
    }
  } else {
    floorLabels = ['Map'];
  }

  const floors: SubmapFloor[] = [];
  const pins: SubmapPin[] = [];
  const entryFloorLabel = floorLabels.includes('1F') ? '1F' : floorLabels[0];

  floorLabels.forEach((floorLabel, floorIdx) => {
    const floorId = floorLabel.toLowerCase();
    const floorSecrets = groupedByFloor.get(floorLabel) ?? [];
    const isEntryFloor = floorLabel === entryFloorLabel;

    const childWingSecrets = floorSecrets.filter((s) => s.era === 'child');
    const mainWingSecrets = floorSecrets.filter((s) => s.era !== 'child');

    const rooms: SubmapRoom[] = [
      {
        id: `${region.id}-${floorId}-hub`,
        label: isEntryFloor
          ? `${region.name} — Entrance & Regional Gateways`
          : `${region.name} (${floorLabel}) — Central Landing`,
        shortLabel: isEntryFloor ? 'Entrance & Gateways' : `${floorLabel} Landing`,
        polygon: '65,375 735,375 735,515 65,515',
        labelPos: { x: 400, y: 488 },
        accent: 'hub',
        summary: isEntryFloor
          ? region.summary
          : `Stairwell & central connector tier on ${floorLabel}.`,
      },
      {
        id: `${region.id}-${floorId}-west`,
        label:
          childWingSecrets.length > 0
            ? `${floorLabel} West Wing — Early & Side Chambers`
            : `${floorLabel} West Sanctum Chambers`,
        shortLabel: childWingSecrets.length > 0 ? 'Early / West Wing' : 'West Chambers',
        polygon: '65,75 375,75 375,335 65,335',
        labelPos: { x: 220, y: 112 },
        accent: isDungeon ? 'treasure' : 'forest',
        summary: `Schematic chamber group for ${region.name} (${floorLabel}).`,
      },
      {
        id: `${region.id}-${floorId}-east`,
        label: isDungeon
          ? `${floorLabel} East Sanctum & Inner Vaults`
          : `${region.name} — Upper & Inner Landmarks`,
        shortLabel: isDungeon ? 'East Sanctum' : 'Inner Landmarks',
        polygon: '425,75 735,75 735,335 425,335',
        labelPos: { x: 580, y: 112 },
        accent: isDungeon ? 'boss' : 'treasure',
        summary: `Collectibles, Skulltulas, and key objectives in ${region.name} (${floorLabel}).`,
      },
    ];

    const connectors: SubmapConnector[] = [
      {
        id: `${region.id}-${floorId}-c-west`,
        kind: 'corridor',
        from: { x: 220, y: 375 },
        to: { x: 220, y: 335 },
      },
      {
        id: `${region.id}-${floorId}-c-east`,
        kind: 'corridor',
        from: { x: 580, y: 375 },
        to: { x: 580, y: 335 },
      },
      {
        id: `${region.id}-${floorId}-c-mid`,
        kind: 'corridor',
        from: { x: 375, y: 205 },
        to: { x: 425, y: 205 },
      },
    ];

    if (floorIdx > 0) {
      const upperLabel = floorLabels[floorIdx - 1];
      connectors.push({
        id: `${region.id}-${floorId}-stairs-up`,
        kind: 'stairs-up',
        from: { x: 675, y: 425 },
        targetFloorId: upperLabel.toLowerCase(),
        label: `To ${upperLabel}`,
      });
    }
    if (floorIdx < floorLabels.length - 1) {
      const lowerLabel = floorLabels[floorIdx + 1];
      connectors.push({
        id: `${region.id}-${floorId}-stairs-down`,
        kind: 'stairs-down',
        from: { x: 125, y: 425 },
        targetFloorId: lowerLabel.toLowerCase(),
        label: `To ${lowerLabel}`,
      });
    }

    floors.push({
      id: floorId,
      label: floorLabel,
      title: isDungeon
        ? `${floorLabel} — ${region.name} Schematic Floor Layout`
        : `${region.name} — Interactive Schematic Overview`,
      rooms,
      connectors,
    });

    // Place gateway pins on the entry floor hub
    if (isEntryFloor && region.connectedRegions.length > 0) {
      const count = region.connectedRegions.length;
      region.connectedRegions.forEach((connId, idx) => {
        const span = 440;
        const startX = 400 - span / 2;
        const x = count === 1 ? 400 : Math.round(startX + (span * idx) / (count - 1));
        pins.push({
          id: `${region.id}-fb-conn-${connId}`,
          floorId,
          roomId: `${region.id}-${floorId}-hub`,
          x,
          y: 438,
          connectedRegionId: connId,
          kind: 'entrance',
          label: `To ${formatRegionLabel(connId)}`,
          era: 'both',
        });
      });
    }

    // Place secrets across West and East schematic chambers in clean non-overlapping grids
    const westList =
      childWingSecrets.length > 0
        ? childWingSecrets
        : floorSecrets.slice(0, Math.ceil(floorSecrets.length / 2));
    const eastList =
      childWingSecrets.length > 0
        ? mainWingSecrets
        : floorSecrets.slice(Math.ceil(floorSecrets.length / 2));

    const placeInBox = (
      items: UnifiedSecret[],
      roomId: string,
      minX: number,
      maxX: number,
      minY: number,
      maxY: number,
    ) => {
      if (items.length === 0) return;
      const cols = Math.min(3, Math.max(1, Math.ceil(Math.sqrt(items.length))));
      const rows = Math.ceil(items.length / cols);
      items.forEach((secret, idx) => {
        const col = idx % cols;
        const row = Math.floor(idx / cols);
        const x =
          cols === 1
            ? Math.round((minX + maxX) / 2)
            : Math.round(minX + ((maxX - minX) * col) / (cols - 1));
        const y =
          rows === 1
            ? Math.round((minY + maxY) / 2)
            : Math.round(minY + ((maxY - minY) * row) / (rows - 1));
        pins.push({
          id: `${region.id}-fb-pin-${secret.id}`,
          floorId,
          roomId,
          x,
          y,
          secretId: secret.id,
          kind:
            secret.category === 'equipment' || secret.category === 'capacity-upgrade'
              ? 'dungeon-gear'
              : 'secret',
          label: secret.title,
          era: secret.era === 'adult' ? 'adult' : secret.era === 'child' ? 'child' : 'both',
          note: secret.locationHint,
        });
      });
    };

    placeInBox(westList, `${region.id}-${floorId}-west`, 125, 315, 165, 295);
    placeInBox(eastList, `${region.id}-${floorId}-east`, 485, 675, 165, 295);
  });

  return {
    regionId: region.id,
    title: `${region.name} — Schematic Sub-Map`,
    subtitle: isDungeon
      ? 'Interactive Multi-Floor Temple Schematic & Collectible Tracker'
      : 'Interactive Regional Schematic & Collectible Tracker',
    mode: 'blueprint',
    viewBox: '0 0 800 560',
    defaultFloorId: entryFloorLabel.toLowerCase(),
    floors,
    dungeonMeta: PHASE2_DUNGEON_META[region.id],
    pins,
  };
}
