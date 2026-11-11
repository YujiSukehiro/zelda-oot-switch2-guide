export type SubmapMode = 'blueprint' | 'illustrated';

export type SubmapRoomAccent =
  | 'default'
  | 'hub'
  | 'boss'
  | 'treasure'
  | 'water'
  | 'lava'
  | 'forest'
  | 'shortcut'
  | 'crypt';

export interface SubmapRoom {
  id: string;
  label: string;
  shortLabel?: string;
  /** SVG polygon points string ("x1,y1 x2,y2 ...") within the submap viewBox */
  polygon: string;
  /** Center coordinate for rendering the room label inside the blueprint/zone */
  labelPos: {
    x: number;
    y: number;
  };
  accent?: SubmapRoomAccent;
  summary?: string;
  /** Optional connected region ID if this zone serves as a gateway */
  connectedRegionId?: string;
}

export type SubmapConnectorKind =
  | 'corridor'
  | 'stairs-up'
  | 'stairs-down'
  | 'drop-hole'
  | 'climb-vines'
  | 'locked-door'
  | 'boss-door'
  | 'bombable-wall'
  | 'fake-wall'
  | 'warp-tunnel'
  | 'acoustic-route';

export interface SubmapConnector {
  id: string;
  kind: SubmapConnectorKind;
  from: {
    x: number;
    y: number;
  };
  to?: {
    x: number;
    y: number;
  };
  /** Optional intermediate vertices for multi-turn corridors or Lost Woods routes */
  waypoints?: Array<{
    x: number;
    y: number;
  }>;
  /** Optional floor ID jumped to when clicking stairs, drop holes, or vine climbs */
  targetFloorId?: string;
  label?: string;
}

export interface SubmapFloor {
  id: string;
  /** Compact floor tab label, e.g. '4F', '3F', '2F', '1F', 'B1', 'B2', 'B3', or 'Map' */
  label: string;
  /** Descriptive floor header, e.g. "1F — Darunia's Chamber & Central Urn" */
  title: string;
  /** Relative public asset URL for 'illustrated' mode (e.g. './maps/regions/kokiri-forest.jpg') */
  imageUrl?: string;
  rooms: SubmapRoom[];
  connectors?: SubmapConnector[];
}

export interface DungeonMeta {
  smallKeysCount: number;
  hasBossKey: boolean;
  hasMap: boolean;
  hasCompass: boolean;
  keyLocationsSummary: string[];
}

export type SubmapPinKind =
  | 'secret'
  | 'dungeon-gear'
  | 'small-key'
  | 'boss-key'
  | 'entrance'
  | 'npc'
  | 'puzzle'
  | 'warp';

export interface SubmapPin {
  id: string;
  floorId: string;
  roomId: string;
  x: number;
  y: number;
  /** Canonical UnifiedSecret ID (e.g. 'hp-17', 'gs-030', 'eq-goron-bracelet', 'cap-bombs-30') */
  secretId?: string;
  /** Connected Region ID for entrance / warp pins */
  connectedRegionId?: string;
  kind: SubmapPinKind;
  label: string;
  era?: 'child' | 'adult' | 'both';
  note?: string;
}

export interface RegionSubmapDefinition {
  regionId: string;
  title: string;
  subtitle?: string;
  mode: SubmapMode;
  /** SVG viewBox string, standardized on '0 0 800 560' */
  viewBox: string;
  /** Default floor ID selected when opening the submap (defaults to floors[0].id if omitted) */
  defaultFloorId?: string;
  floors: SubmapFloor[];
  dungeonMeta?: DungeonMeta;
  pins: SubmapPin[];
}
