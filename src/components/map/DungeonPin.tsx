import type { KeyboardEvent } from 'react';
import type { Region, RegionProgressSummary } from '../../types/zelda';
import {
  BIOME_ACCENT_VAR,
  buildNodeHitBridgePoints,
  buildReadyBadgeHitBridgePoints,
  buildRegionAriaLabel,
  computeNodeLayout,
  type ExtendedMapRegionSummary,
  type NodeLabelSpec,
} from './RegionNode';

function buildOctagonPoints(cx: number, cy: number, r: number): string {
  const pts: string[] = [];
  for (let i = 0; i < 8; i += 1) {
    const angle = ((i * 45 + 22.5) * Math.PI) / 180;
    pts.push(`${(cx + r * Math.cos(angle)).toFixed(2)},${(cy + r * Math.sin(angle)).toFixed(2)}`);
  }
  return pts.join(' ');
}

function buildDiamondPoints(cx: number, cy: number, r: number): string {
  return `${cx},${cy - r} ${cx + r},${cy} ${cx},${cy + r} ${cx - r},${cy}`;
}

function buildStarCrestPoints(cx: number, cy: number, outerR: number, innerR: number): string {
  const pts: string[] = [];
  for (let i = 0; i < 16; i += 1) {
    const r = i % 2 === 0 ? outerR : innerR;
    const angle = ((i * 22.5 - 90) * Math.PI) / 180;
    pts.push(`${(cx + r * Math.cos(angle)).toFixed(2)},${(cy + r * Math.sin(angle)).toFixed(2)}`);
  }
  return pts.join(' ');
}

export interface DungeonPinProps {
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

export function DungeonPin({
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
}: DungeonPinProps) {
  const { x, y } = coords ?? region.mapCoords;
  const layout = computeNodeLayout(region, summary.readyNowCount, { coords, labelOverride });
  const extSummary = summary as RegionProgressSummary & ExtendedMapRegionSummary;
  const isUnreachable = extSummary.isReachable === false && !summary.isComplete;

  const kindStroke =
    region.kind === 'special'
      ? 'var(--biome-special)'
      : region.kind === 'mini-dungeon'
        ? BIOME_ACCENT_VAR[region.biome]
        : 'var(--biome-dungeon)';

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
        : kindStroke;

  const ariaLabel = buildRegionAriaLabel(region, summary);

  const handleKeyDown = (event: KeyboardEvent<SVGGElement>) => {
    if (event.key === 'Enter' || event.key === ' ' || event.key === 'Spacebar') {
      event.preventDefault();
      event.stopPropagation();
      onSelect(region.id);
    }
  };

  const innerR = ringRadius - 2.3;

  return (
    <g
      className={`map-node map-node--pin map-node--${region.kind}${
        isDimmed ? ' is-filter-dimmed' : ''
      }${isSpotlightHighlighted ? ' is-spotlight-highlighted' : ''}${
        isUnreachable ? ' is-unreachable' : ''
      }${isHiddenByCompleteFilter ? ' is-completed-hidden' : ''}`}
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
      {/* Tight transparent hit bridge eliminating the 3px-5px dead gap between pin & offset pill */}
      <polygon
        className="map-node__hit-bridge"
        points={buildNodeHitBridgePoints(x, y, layout)}
        fill="transparent"
        aria-hidden="true"
      />

      {/* Keyboard focus halo */}
      <circle className="map-node__focus-ring" cx={x} cy={y} r={ringRadius + 4.4} />

      {/* Switch 2 Spotlight glow halo */}
      {isSpotlightHighlighted && (
        <circle className="map-node__spotlight-halo" cx={x} cy={y} r={ringRadius + 3.1} />
      )}

      {/* Selected pin Triforce ring */}
      {isSelected && (
        <circle className="map-node__selection-halo" cx={x} cy={y} r={ringRadius + 3.6} />
      )}

      {/* Distinct Pin Crest Silhouette by Kind (never color alone) */}
      {region.kind === 'special' ? (
        <polygon
          className="map-node__core"
          points={buildStarCrestPoints(x, y, innerR + 0.6, innerR * 0.66)}
          stroke={summary.isComplete ? 'var(--color-triforce)' : kindStroke}
          strokeWidth={isSelected ? 1.9 : 1.3}
        />
      ) : region.kind === 'mini-dungeon' ? (
        <polygon
          className="map-node__core"
          points={buildDiamondPoints(x, y, innerR + 0.4)}
          stroke={summary.isComplete ? 'var(--color-triforce)' : kindStroke}
          strokeWidth={isSelected ? 1.9 : 1.3}
        />
      ) : (
        <polygon
          className="map-node__core"
          points={buildOctagonPoints(x, y, innerR)}
          stroke={summary.isComplete ? 'var(--color-triforce)' : kindStroke}
          strokeWidth={isSelected ? 1.9 : 1.35}
        />
      )}

      {/* Circular Progress Ring Track & Live Arc */}
      <circle
        className="map-node__ring-track"
        cx={x}
        cy={y}
        r={ringRadius}
        strokeWidth={2.3}
      />
      {summary.totalCount > 0 && summary.completedCount > 0 && (
        <circle
          className="map-node__ring-progress"
          cx={x}
          cy={y}
          r={ringRadius}
          stroke={progressStroke}
          strokeWidth={2.5}
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          transform={`rotate(-90 ${x} ${y})`}
        />
      )}

      {/* Inner Emblem */}
      <g transform={`translate(${x} ${y})`} aria-hidden="true">
        {region.kind === 'special' ? (
          <path
            d="M0 -3.8 L1.1 -1.1 L3.8 0 L1.1 1.1 L0 3.8 L-1.1 1.1 L-3.8 0 L-1.1 -1.1 Z"
            fill={kindStroke}
          />
        ) : region.kind === 'mini-dungeon' ? (
          <path
            d="M0 -3.6 L3.2 0 L0 3.6 L-3.2 0 Z"
            fill="none"
            stroke={kindStroke}
            strokeWidth="1.4"
          />
        ) : (
          <g stroke={kindStroke} strokeWidth="1.35" fill="none" strokeLinejoin="round">
            <path d="M0 -3.8 L3.6 2.8 H-3.6 Z" />
          </g>
        )}
      </g>

      {/* Triforce Gold 100% Completion Crest + Checkmark */}
      {summary.isComplete && (
        <g
          className="map-node__complete-crest"
          data-testid={`map-complete-${region.id}`}
          transform={`translate(${x + 7.8} ${y - 7.8})`}
          aria-hidden="true"
        >
          <circle cx="0" cy="0" r="4.5" fill="var(--color-triforce)" stroke="var(--bg-canvas)" strokeWidth="1.15" />
          <path
            d="M-1.9 0.2 L-0.5 1.6 L2 -1.3"
            fill="none"
            stroke="var(--text-inverse)"
            strokeWidth="1.35"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>
      )}

      {/* Unreachable Pin Lock Crest */}
      {isUnreachable && (
        <g
          className="map-node__lock-crest"
          data-testid={`map-lock-${region.id}`}
          transform={`translate(${x + 7.8} ${y - 7.8})`}
          aria-hidden="true"
        >
          <circle
            cx="0"
            cy="0"
            r="4.8"
            fill="var(--bg-surface-elevated)"
            stroke="var(--color-locked-crimson-border)"
            strokeWidth="1.2"
          />
          <rect
            x="-2.1"
            y="-0.4"
            width="4.2"
            height="3.1"
            rx="0.8"
            fill="var(--color-locked-crimson-text)"
          />
          <path
            d="M-1.2 -0.4 V-1.5 A1.2 1.2 0 0 1 1.2 -1.5 V-0.4"
            fill="none"
            stroke="var(--color-locked-crimson-text)"
            strokeWidth="1.05"
          />
        </g>
      )}

      {/* Dungeon / Pin Name Pill */}
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
          fontSize="8.9"
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
          <polygon
            className="map-node__hit-bridge"
            points={buildReadyBadgeHitBridgePoints(layout)}
            fill="transparent"
          />
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
