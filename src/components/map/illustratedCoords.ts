import type { MapLayerMode, Region } from '../../types/zelda';
import type { NodeLabelSpec } from './RegionNode';

/**
 * Calibrated `{ x, y }` coordinates in the `1000 × 700` SVG viewBox matching the
 * painted landmarks in `public/maps/hyrule-illustrated.jpg` (rendered uncropped).
 * Covers all 34 Hyrule overworld regions, dungeons, mini-dungeons, and Switch 2 hubs.
 */
export const ILLUSTRATED_COORDS: Readonly<Record<string, { x: number; y: number }>> = {
  // Western Desert & Gerudo Canyon
  'spirit-temple': { x: 78, y: 232 },
  'desert-colossus': { x: 112, y: 286 },
  'haunted-wasteland': { x: 118, y: 392 },
  'gerudo-training-ground': { x: 184, y: 298 },
  'gerudo-fortress': { x: 212, y: 348 },
  'gerudo-valley': { x: 262, y: 472 },

  // Northern Citadel & Castle Town
  'ganons-castle': { x: 416, y: 122 },
  'outside-ganons-castle': { x: 420, y: 176 },
  'hyrule-castle': { x: 500, y: 215 },
  market: { x: 500, y: 295 },

  // Central Hyrule & Southern Lake
  'hyrule-field': { x: 428, y: 430 },
  'lon-lon-ranch': { x: 518, y: 405 },
  'lake-hylia': { x: 500, y: 585 },
  'water-temple': { x: 516, y: 636 },

  // Death Mountain Volcanic Range
  'death-mountain-crater': { x: 745, y: 80 },
  'fire-temple': { x: 786, y: 88 },
  'goron-city': { x: 758, y: 146 },
  'death-mountain-trail': { x: 692, y: 158 },
  'dodongos-cavern': { x: 642, y: 184 },

  // Kakariko Foothills & Shadow Graveyard
  'kakariko-village': { x: 675, y: 225 },
  'bottom-of-the-well': { x: 662, y: 274 },
  graveyard: { x: 748, y: 245 },
  'shadow-temple': { x: 786, y: 278 },

  // Zora Waterways & Fountain
  'ice-cavern': { x: 878, y: 168 },
  'zoras-fountain': { x: 924, y: 208 },
  'jabu-jabus-belly': { x: 938, y: 256 },
  'zoras-domain': { x: 842, y: 306 },
  'zoras-river': { x: 738, y: 378 },

  // Kokiri / Lost Woods / Sacred Forest Canopy
  'sacred-forest-meadow': { x: 868, y: 416 },
  'forest-temple': { x: 926, y: 462 },
  'lost-woods': { x: 736, y: 470 },
  'deku-tree': { x: 846, y: 498 },
  'kokiri-forest': { x: 808, y: 534 },
  'hall-of-fallen-foes': { x: 848, y: 582 },
};

/**
 * Label placement overrides specifically tuned for the painted `hyrule-illustrated.jpg`
 * layout so edge-anchored landmarks (`spirit-temple`, `forest-temple`, `zoras-fountain`,
 * `jabu-jabus-belly`) never clip outside the `1000 × 700` viewBox.
 */
export const ILLUSTRATED_LABEL_OVERRIDES: Readonly<Record<string, Partial<NodeLabelSpec>>> = {
  'spirit-temple': { side: 'right', offsetX: 0, badge: 'above-pill' },
  'desert-colossus': { side: 'bottom', offsetX: 0, badge: 'below-pill' },
  'gerudo-training-ground': { side: 'right', offsetX: 0, badge: 'above-pill' },
  'outside-ganons-castle': { side: 'left', offsetX: 0, offsetY: 0, badge: 'below-pill' },
  'hyrule-castle': { side: 'right', offsetX: 0, badge: 'above-pill' },
  market: { side: 'right', offsetX: 0, badge: 'below-pill' },
  'hyrule-field': { side: 'left', offsetX: 0, badge: 'above-pill' },
  'lon-lon-ranch': { side: 'right', offsetX: 0, badge: 'below-pill' },
  'dodongos-cavern': { side: 'left', offsetX: 0, offsetY: 0, badge: 'above-pill' },
  'death-mountain-trail': { side: 'left', offsetX: 0, offsetY: -4, badge: 'above-pill' },
  'zoras-fountain': { side: 'left', offsetX: 0, offsetY: 0, badge: 'above-pill' },
  'jabu-jabus-belly': { side: 'left', offsetX: 0, offsetY: 0, badge: 'below-pill' },
  'zoras-domain': { side: 'right', offsetX: 0, offsetY: 0, badge: 'below-pill' },
  'sacred-forest-meadow': { side: 'left', offsetX: 0, offsetY: 0, badge: 'above-pill' },
  'forest-temple': { side: 'left', offsetX: 0, offsetY: 0, badge: 'below-pill' },
  'deku-tree': { side: 'right', offsetX: 0, offsetY: -4, badge: 'above-pill' },
  'kokiri-forest': { side: 'left', offsetX: 0, offsetY: 0, badge: 'below-pill' },
  'hall-of-fallen-foes': { side: 'left', offsetX: 0, offsetY: 0, badge: 'below-pill' },
};

export function resolveRegionMapCoords(
  region: Region,
  mapStyle: MapLayerMode,
): { x: number; y: number } {
  if (mapStyle === 'illustrated') {
    return ILLUSTRATED_COORDS[region.id] ?? region.mapCoords;
  }
  return region.mapCoords;
}
