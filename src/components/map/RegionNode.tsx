import type { KeyboardEvent } from 'react';
import type {
  Region,
  RegionBiome,
  RegionKind,
  RegionProgressSummary,
} from '../../types/zelda';

export type LabelPlacementSide = 'top' | 'bottom' | 'left' | 'right';
export type BadgePlacementSide = 'above-pill' | 'below-pill' | 'left-of-pill' | 'right-of-pill';

export interface NodeLabelSpec {
  shortName: string;
  side: LabelPlacementSide;
  offsetX?: number;
  offsetY?: number;
  badge: BadgePlacementSide;
}

export interface BoundingRect {
  left: number;
  top: number;
  right: number;
  bottom: number;
  cx: number;
  cy: number;
  width: number;
  height: number;
}

export interface ComputedNodeLayout {
  nodeRadius: number;
  nodeBox: BoundingRect;
  pillBox: BoundingRect;
  readyBox: BoundingRect;
  shortName: string;
}

/**
 * Curated label & `+N Ready` badge placement for all 34 Hyrule regions & dungeons
 * across the 1000 × 700 SVG map, guaranteeing zero clipped or overlapping labels.
 */
export const NODE_LABEL_LAYOUT: Readonly<Record<string, NodeLabelSpec>> = {
  // Western Desert & Gerudo Canyon
  'spirit-temple': {
    shortName: 'Spirit Temple',
    side: 'top',
    offsetX: 14,
    badge: 'above-pill',
  },
  'desert-colossus': {
    shortName: 'Desert Colossus',
    side: 'bottom',
    offsetX: 0,
    badge: 'below-pill',
  },
  'haunted-wasteland': {
    shortName: 'Haunted Wasteland',
    side: 'bottom',
    offsetX: 22,
    badge: 'below-pill',
  },
  'gerudo-training-ground': {
    shortName: 'Gerudo Training Ground',
    side: 'top',
    offsetX: 0,
    badge: 'above-pill',
  },
  'gerudo-fortress': {
    shortName: "Gerudo's Fortress",
    side: 'right',
    offsetX: 0,
    offsetY: 4,
    badge: 'below-pill',
  },
  'gerudo-valley': {
    shortName: 'Gerudo Valley',
    side: 'bottom',
    offsetX: 0,
    badge: 'below-pill',
  },

  // Central Hyrule & Southern Lake
  'hyrule-field': {
    shortName: 'Hyrule Field',
    side: 'top',
    offsetX: 0,
    badge: 'above-pill',
  },
  'lon-lon-ranch': {
    shortName: 'Lon Lon Ranch',
    side: 'bottom',
    offsetX: 0,
    badge: 'below-pill',
  },
  'lake-hylia': {
    shortName: 'Lake Hylia',
    side: 'left',
    offsetX: 0,
    offsetY: -4,
    badge: 'below-pill',
  },
  'water-temple': {
    shortName: 'Water Temple',
    side: 'right',
    offsetX: 0,
    badge: 'below-pill',
  },

  // Northern Citadel & Castle Town
  'ganons-castle': {
    shortName: "Ganon's Castle",
    side: 'top',
    offsetX: -14,
    badge: 'above-pill',
  },
  'hyrule-castle': {
    shortName: 'Hyrule Castle',
    side: 'left',
    offsetX: 0,
    badge: 'above-pill',
  },
  'outside-ganons-castle': {
    shortName: "Outside Ganon's Castle",
    side: 'bottom',
    offsetX: 24,
    offsetY: 12,
    badge: 'below-pill',
  },
  market: {
    shortName: 'Castle Town Market',
    side: 'left',
    offsetX: 0,
    badge: 'below-pill',
  },

  // Death Mountain Volcanic Range
  'death-mountain-crater': {
    shortName: 'Death Mountain Crater',
    side: 'left',
    offsetX: 0,
    badge: 'above-pill',
  },
  'fire-temple': {
    shortName: 'Fire Temple',
    side: 'right',
    offsetX: 0,
    badge: 'above-pill',
  },
  'goron-city': {
    shortName: 'Goron City',
    side: 'right',
    offsetX: 0,
    badge: 'below-pill',
  },
  'death-mountain-trail': {
    shortName: 'Death Mountain Trail',
    side: 'top',
    offsetX: -24,
    offsetY: -4,
    badge: 'above-pill',
  },
  'dodongos-cavern': {
    shortName: "Dodongo's Cavern",
    side: 'right',
    offsetX: 6,
    offsetY: 4,
    badge: 'below-pill',
  },

  // Kakariko Foothills & Shadow Graveyard
  'kakariko-village': {
    shortName: 'Kakariko Village',
    side: 'left',
    offsetX: 0,
    offsetY: -6,
    badge: 'above-pill',
  },
  'bottom-of-the-well': {
    shortName: 'Bottom of the Well',
    side: 'bottom',
    offsetX: -14,
    badge: 'below-pill',
  },
  graveyard: {
    shortName: 'Kakariko Graveyard',
    side: 'top',
    offsetX: 16,
    offsetY: 2,
    badge: 'above-pill',
  },
  'shadow-temple': {
    shortName: 'Shadow Temple',
    side: 'bottom',
    offsetX: -8,
    offsetY: 6,
    badge: 'below-pill',
  },

  // Zora Waterways & Fountain
  'ice-cavern': {
    shortName: 'Ice Cavern',
    side: 'top',
    offsetX: -6,
    badge: 'above-pill',
  },
  'zoras-fountain': {
    shortName: "Zora's Fountain",
    side: 'left',
    offsetX: 2,
    offsetY: -16,
    badge: 'above-pill',
  },
  'jabu-jabus-belly': {
    shortName: "Jabu-Jabu's Belly",
    side: 'bottom',
    offsetX: 30,
    offsetY: 2,
    badge: 'below-pill',
  },
  'zoras-domain': {
    shortName: "Zora's Domain",
    side: 'left',
    offsetX: 0,
    badge: 'above-pill',
  },
  'zoras-river': {
    shortName: "Zora's River",
    side: 'left',
    offsetX: 0,
    badge: 'below-pill',
  },

  // Kokiri / Lost Woods / Sacred Forest Canopy
  'forest-temple': {
    shortName: 'Forest Temple',
    side: 'right',
    offsetX: 0,
    badge: 'above-pill',
  },
  'sacred-forest-meadow': {
    shortName: 'Sacred Forest Meadow',
    side: 'bottom',
    offsetX: 42,
    offsetY: 4,
    badge: 'below-pill',
  },
  'lost-woods': {
    shortName: 'Lost Woods',
    side: 'left',
    offsetX: 0,
    badge: 'above-pill',
  },
  'kokiri-forest': {
    shortName: 'Kokiri Forest',
    side: 'top',
    offsetX: 0,
    badge: 'above-pill',
  },
  'deku-tree': {
    shortName: 'Great Deku Tree',
    side: 'right',
    offsetX: 0,
    badge: 'below-pill',
  },
  'hall-of-fallen-foes': {
    shortName: 'Hall of Fallen Foes',
    side: 'left',
    offsetX: 0,
    badge: 'below-pill',
  },
};

export const BIOME_ACCENT_VAR: Readonly<Record<RegionBiome, string>> = {
  forest: 'var(--biome-forest)',
  field: 'var(--biome-field)',
  town: 'var(--biome-town)',
  castle: 'var(--biome-castle)',
  shadow: 'var(--biome-shadow)',
  mountain: 'var(--biome-mountain)',
  water: 'var(--biome-water)',
  desert: 'var(--biome-desert)',
  dream: 'var(--biome-dream)',
};

export function formatRegionKindLabel(kind: RegionKind): string {
  switch (kind) {
    case 'overworld':
      return 'Overworld';
    case 'dungeon':
      return 'Dungeon';
    case 'mini-dungeon':
      return 'Mini-Dungeon';
    case 'special':
      return 'Special Hub';
  }
}

export interface ExtendedMapRegionSummary {
  isReachable?: boolean;
  reachabilityBlocker?: string;
}

export function buildRegionAriaLabel(region: Region, summary: RegionProgressSummary): string {
  const ext = summary as RegionProgressSummary & ExtendedMapRegionSummary;
  const kindLabel = formatRegionKindLabel(region.kind);
  const progressPart = summary.isComplete
    ? `${summary.completedCount} of ${summary.totalCount} completed (100% complete)`
    : `${summary.completedCount} of ${summary.totalCount} completed`;
  const readyPart = summary.readyNowCount > 0 ? `, ${summary.readyNowCount} ready now` : ', 0 ready now';
  const lockPart =
    ext.isReachable === false && !summary.isComplete
      ? `, locked (${ext.reachabilityBlocker ?? 'prerequisite required'})`
      : '';
  return `${region.name} (${kindLabel}): ${progressPart}${readyPart}${lockPart}`;
}

function makeRect(cx: number, cy: number, width: number, height: number): BoundingRect {
  return {
    cx,
    cy,
    width,
    height,
    left: cx - width / 2,
    right: cx + width / 2,
    top: cy - height / 2,
    bottom: cy + height / 2,
  };
}

export interface ComputeNodeLayoutOptions {
  coords?: { x: number; y: number };
  labelOverride?: Partial<NodeLabelSpec>;
}

export function computeNodeLayout(
  region: Region,
  readyNowCount: number,
  options?: ComputeNodeLayoutOptions,
): ComputedNodeLayout {
  const baseSpec = NODE_LABEL_LAYOUT[region.id] ?? {
    shortName: region.name,
    side: 'bottom' as const,
    badge: 'below-pill' as const,
  };
  const spec: NodeLabelSpec = options?.labelOverride
    ? { ...baseSpec, ...options.labelOverride }
    : baseSpec;

  const isOverworld = region.kind === 'overworld';
  const nodeRadius = isOverworld ? 12 : 11;
  const { x, y } = options?.coords ?? region.mapCoords;

  const charAdvance = isOverworld ? 5.55 : 5.3;
  const pillWidth = Math.round(spec.shortName.length * charAdvance + 14);
  const pillHeight = 16;

  const dx = spec.offsetX ?? 0;
  const dy = spec.offsetY ?? 0;
  const gapFromCenter = nodeRadius + 5;

  let pillCx = x + dx;
  let pillCy = y + dy;

  if (spec.side === 'top') {
    pillCy = y - (nodeRadius + 11) + dy;
  } else if (spec.side === 'bottom') {
    pillCy = y + (nodeRadius + 11) + dy;
  } else if (spec.side === 'left') {
    pillCx = x - gapFromCenter - pillWidth / 2 + dx;
  } else if (spec.side === 'right') {
    pillCx = x + gapFromCenter + pillWidth / 2 + dx;
  }

  const readyLabel = `+${Math.max(1, readyNowCount)} Ready`;
  const readyWidth = Math.max(48, Math.round(readyLabel.length * 5.0 + 11));
  const readyHeight = 14;

  let readyCx = pillCx;
  let readyCy = pillCy;

  if (spec.badge === 'below-pill') {
    readyCy = pillCy + pillHeight / 2 + 1.5 + readyHeight / 2;
  } else if (spec.badge === 'above-pill') {
    readyCy = pillCy - pillHeight / 2 - 1.5 - readyHeight / 2;
  } else if (spec.badge === 'right-of-pill') {
    readyCx = pillCx + pillWidth / 2 + 3 + readyWidth / 2;
  } else {
    readyCx = pillCx - pillWidth / 2 - 3 - readyWidth / 2;
  }

  return {
    nodeRadius,
    nodeBox: makeRect(x, y, nodeRadius * 2, nodeRadius * 2),
    pillBox: makeRect(pillCx, pillCy, pillWidth, pillHeight),
    readyBox: makeRect(readyCx, readyCy, readyWidth, readyHeight),
    shortName: spec.shortName,
  };
}

export function BiomeSvgGlyph({ biome }: { biome: RegionBiome }) {
  const stroke = BIOME_ACCENT_VAR[biome];
  switch (biome) {
    case 'forest':
      return (
        <g aria-hidden="true" stroke={stroke} strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
          <path d="M0 -5.2 L4.4 1.6 L1.7 1.6 L3.6 4.8 L-3.6 4.8 L-1.7 1.6 L-4.4 1.6 Z" />
        </g>
      );
    case 'field':
      return (
        <g aria-hidden="true" stroke={stroke} strokeWidth="1.5" fill="none" strokeLinecap="round">
          <circle cx="0" cy="-1.2" r="2.6" />
          <path d="M-5 4.2 Q0 1.4 5 4.2" />
        </g>
      );
    case 'town':
      return (
        <g aria-hidden="true" stroke={stroke} strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
          <path d="M-4.6 1 L0 -4.8 L4.6 1" />
          <path d="M-3.4 0.8 V4.8 H3.4 V0.8" />
        </g>
      );
    case 'castle':
      return (
        <g aria-hidden="true" stroke={stroke} strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
          <path d="M-4.5 4.6 V-3.2 L-2.2 -1 L0 -4.5 L2.2 -1 L4.5 -3.2 V4.6 Z" />
        </g>
      );
    case 'shadow':
      return (
        <g aria-hidden="true" stroke={stroke} strokeWidth="1.5" fill="none" strokeLinecap="round">
          <path d="M-4.8 0 Q0 -4.6 4.8 0 Q0 4.6 -4.8 0 Z" />
          <circle cx="0" cy="0" r="1.4" fill={stroke} />
        </g>
      );
    case 'mountain':
      return (
        <g aria-hidden="true" stroke={stroke} strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
          <path d="M-5 4.6 L-0.8 -4.4 L1.6 0.2 L3.1 -2.2 L5.2 4.6 Z" />
        </g>
      );
    case 'water':
      return (
        <g aria-hidden="true" stroke={stroke} strokeWidth="1.5" fill="none" strokeLinecap="round">
          <path d="M-4.6 -1.2 Q-2.3 -3.6 0 -1.2 T4.6 -1.2" />
          <path d="M-4.6 2.4 Q-2.3 0 0 2.4 T4.6 2.4" />
        </g>
      );
    case 'desert':
      return (
        <g aria-hidden="true" stroke={stroke} strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
          <path d="M-5 4.2 L-1 -2.8 L3.2 4.2" />
          <path d="M0.4 4.2 L3.1 -0.8 L5.4 4.2" />
        </g>
      );
    case 'dream':
      return (
        <g aria-hidden="true" stroke={stroke} strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
          <path d="M0 -5 L1.5 -1.5 L5 0 L1.5 1.5 L0 5 L-1.5 1.5 L-5 0 L-1.5 -1.5 Z" />
        </g>
      );
  }
}

export interface RegionNodeProps {
  region: Region;
  summary: RegionProgressSummary;
  isSelected: boolean;
  isDimmed: boolean;
  isSpotlightHighlighted: boolean;
  coords?: { x: number; y: number };
  labelOverride?: Partial<NodeLabelSpec>;
  isHiddenByCompleteFilter?: boolean;
  onSelect: (regionId: string) => void;
  onHoverChange?: (regionId: string | null) => void;
}

export function RegionNode({
  region,
  summary,
  isSelected,
  isDimmed,
  isSpotlightHighlighted,
  coords,
  labelOverride,
  isHiddenByCompleteFilter = false,
  onSelect,
  onHoverChange,
}: RegionNodeProps) {
  const { x, y } = coords ?? region.mapCoords;
  const layout = computeNodeLayout(region, summary.readyNowCount, { coords, labelOverride });
  const accentColor = BIOME_ACCENT_VAR[region.biome];
  const extSummary = summary as RegionProgressSummary & ExtendedMapRegionSummary;
  const isUnreachable = extSummary.isReachable === false && !summary.isComplete;

  const ringRadius = layout.nodeRadius;
  const circumference = 2 * Math.PI * ringRadius;
  const ratio = summary.totalCount > 0 ? summary.completedCount / summary.totalCount : 0;
  const dashOffset = circumference * (1 - Math.min(1, Math.max(0, ratio)));

  const progressStroke = summary.isComplete
    ? 'var(--color-triforce)'
    : isUnreachable
      ? 'var(--color-locked-crimson)'
      : summary.readyNowCount > 0
        ? 'var(--color-ready)'
        : accentColor;

  const ariaLabel = buildRegionAriaLabel(region, summary);

  const handleKeyDown = (event: KeyboardEvent<SVGGElement>) => {
    if (event.key === 'Enter' || event.key === ' ' || event.key === 'Spacebar') {
      event.preventDefault();
      event.stopPropagation();
      onSelect(region.id);
    }
  };

  return (
    <g
      className={`map-node map-node--overworld${isDimmed ? ' is-filter-dimmed' : ''}${
        isSpotlightHighlighted ? ' is-spotlight-highlighted' : ''
      }${isUnreachable ? ' is-unreachable' : ''}${
        isHiddenByCompleteFilter ? ' is-completed-hidden' : ''
      }`}
      data-testid={`map-node-${region.id}`}
      data-region-kind={region.kind}
      data-filtered-out={isDimmed ? 'true' : undefined}
      data-spotlight-match={isSpotlightHighlighted ? 'true' : undefined}
      data-reachable={isUnreachable ? 'false' : 'true'}
      data-completed-hidden={isHiddenByCompleteFilter ? 'true' : undefined}
      role="button"
      tabIndex={0}
      aria-pressed={isSelected}
      aria-label={ariaLabel}
      onClick={(event) => {
        event.stopPropagation();
        onSelect(region.id);
      }}
      onKeyDown={handleKeyDown}
      onPointerEnter={() => onHoverChange?.(region.id)}
      onPointerLeave={() => onHoverChange?.(null)}
      onFocus={() => onHoverChange?.(region.id)}
      onBlur={() => onHoverChange?.(null)}
    >
      {/* Keyboard focus halo */}
      <circle className="map-node__focus-ring" cx={x} cy={y} r={ringRadius + 4.5} />

      {/* Switch 2 Spotlight glow halo when Spotlight mode is active */}
      {isSpotlightHighlighted && (
        <circle className="map-node__spotlight-halo" cx={x} cy={y} r={ringRadius + 3.2} />
      )}

      {/* Selected region Triforce ring */}
      {isSelected && (
        <circle className="map-node__selection-halo" cx={x} cy={y} r={ringRadius + 3.8} />
      )}

      {/* Hit & Medallion Base */}
      <circle
        className="map-node__core"
        cx={x}
        cy={y}
        r={ringRadius - 2.4}
        stroke={summary.isComplete ? 'var(--color-triforce)' : accentColor}
        strokeWidth={isSelected ? 2 : 1.35}
      />

      {/* Circular Progress Ring Track & Live Arc */}
      <circle
        className="map-node__ring-track"
        cx={x}
        cy={y}
        r={ringRadius}
        strokeWidth={2.6}
      />
      {summary.totalCount > 0 && summary.completedCount > 0 && (
        <circle
          className="map-node__ring-progress"
          cx={x}
          cy={y}
          r={ringRadius}
          stroke={progressStroke}
          strokeWidth={2.8}
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          transform={`rotate(-90 ${x} ${y})`}
        />
      )}

      {/* Biome Glyph */}
      <g transform={`translate(${x} ${y})`}>
        <BiomeSvgGlyph biome={region.biome} />
      </g>

      {/* Triforce Gold 100% Completion Crest + Checkmark */}
      {summary.isComplete && (
        <g
          className="map-node__complete-crest"
          data-testid={`map-complete-${region.id}`}
          transform={`translate(${x + 8.5} ${y - 8.5})`}
          aria-hidden="true"
        >
          <circle cx="0" cy="0" r="4.8" fill="var(--color-triforce)" stroke="var(--bg-canvas)" strokeWidth="1.15" />
          <path
            d="M-2 0.2 L-0.5 1.7 L2.2 -1.4"
            fill="none"
            stroke="var(--text-inverse)"
            strokeWidth="1.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>
      )}

      {/* Unreachable Area Lock Crest */}
      {isUnreachable && (
        <g
          className="map-node__lock-crest"
          data-testid={`map-lock-${region.id}`}
          transform={`translate(${x + 8.5} ${y - 8.5})`}
          aria-hidden="true"
        >
          <circle
            cx="0"
            cy="0"
            r="5.1"
            fill="var(--bg-surface-elevated)"
            stroke="var(--color-locked-crimson-border)"
            strokeWidth="1.2"
          />
          <rect
            x="-2.2"
            y="-0.4"
            width="4.4"
            height="3.3"
            rx="0.8"
            fill="var(--color-locked-crimson-text)"
          />
          <path
            d="M-1.3 -0.4 V-1.6 A1.3 1.3 0 0 1 1.3 -1.6 V-0.4"
            fill="none"
            stroke="var(--color-locked-crimson-text)"
            strokeWidth="1.1"
          />
        </g>
      )}

      {/* Region Name Pill */}
      <g className="map-node__pill" aria-hidden="true">
        <rect
          className="map-node__pill-bg"
          x={layout.pillBox.left}
          y={layout.pillBox.top}
          width={layout.pillBox.width}
          height={layout.pillBox.height}
          rx={8}
        />
        <text
          className="map-node__pill-text"
          x={layout.pillBox.cx}
          y={layout.pillBox.cy}
          fontSize="9.4"
          textAnchor="middle"
          dominantBaseline="central"
        >
          {layout.shortName}
        </text>
      </g>

      {/* Emerald `+N Ready` Action Badge */}
      {summary.readyNowCount > 0 && !isUnreachable && (
        <g
          className="map-node__ready-badge"
          data-testid={`map-ready-${region.id}`}
          aria-hidden="true"
        >
          <rect
            className="map-node__ready-bg"
            x={layout.readyBox.left}
            y={layout.readyBox.top}
            width={layout.readyBox.width}
            height={layout.readyBox.height}
            rx={7}
          />
          <text
            className="map-node__ready-text"
            x={layout.readyBox.cx}
            y={layout.readyBox.cy}
            textAnchor="middle"
            dominantBaseline="central"
          >
            +{summary.readyNowCount} Ready
          </text>
        </g>
      )}
    </g>
  );
}
