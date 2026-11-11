import React, { useMemo } from 'react';
import {
  ArrowDown,
  ArrowRight,
  Check,
  GitBranch,
  KeyRound,
  Lock,
  Music,
  Sparkles,
} from 'lucide-react';
import {
  ALL_SECRETS,
  REGION_BY_ID,
  REQUIREMENT_BY_ID,
  REQUIREMENT_SOURCE_REGION,
  SONGS_AND_QUESTS,
} from '../../data';
import { SECRET_TO_REQUIREMENTS_MAP } from '../../lib/gating';
import type { EvaluatedSecret, Region } from '../../types/zelda';

const KEY_PROGRESSION_CATEGORIES = new Set<string>([
  'equipment',
  'ocarina-song',
  'bottle',
  'great-fairy',
  'dungeon-item',
  'quest-token',
  'mask-trade',
  'biggoron-step',
  'capacity-upgrade',
  'switch2-exclusive',
]);

const AMBIENT_REQ_IDS = new Set<string>(['era-child', 'time-day', 'time-night']);

export interface QuestChainPanelProps {
  region: Region;
  evaluatedSecrets: EvaluatedSecret[];
  effectiveRequirements: Set<string>;
  onSelectRegion: (regionId: string) => void;
  onSelectSecret: (secretId: string) => void;
  onToggleSecret: (secretId: string, completed?: boolean) => void;
  onSelectRequirementPill: (reqId: string, triggerEl: HTMLButtonElement) => void;
  onOpenSongbook?: (songId?: string) => void;
}

export const QuestChainPanel: React.FC<QuestChainPanelProps> = ({
  region,
  evaluatedSecrets,
  effectiveRequirements,
  onSelectRegion,
  onSelectSecret,
  onToggleSecret,
  onSelectRequirementPill,
  onOpenSongbook,
}) => {
  const songIdSet = useMemo(
    () => new Set(SONGS_AND_QUESTS.ocarinaSongs.map((s) => s.id)),
    [],
  );

  // Stage 1: Unique prerequisite gear & melodies referenced in this region
  const prerequisiteIds = useMemo(() => {
    const seen = new Set<string>();
    const list: string[] = [];
    for (const ev of evaluatedSecrets) {
      for (const reqId of ev.secret.requiredIds) {
        if (AMBIENT_REQ_IDS.has(reqId) || seen.has(reqId)) continue;
        seen.add(reqId);
        list.push(reqId);
      }
    }
    // Put missing prerequisites first so blockers stand out immediately
    return list.sort((a, b) => {
      const aOwned = effectiveRequirements.has(a) ? 1 : 0;
      const bOwned = effectiveRequirements.has(b) ? 1 : 0;
      return aOwned - bOwned;
    });
  }, [effectiveRequirements, evaluatedSecrets]);

  // Stage 2: Key progression finds inside this region
  const keyFinds = useMemo(() => {
    const primary = evaluatedSecrets.filter(
      (ev) =>
        Boolean(SECRET_TO_REQUIREMENTS_MAP[ev.secret.id]?.length) ||
        KEY_PROGRESSION_CATEGORIES.has(ev.secret.category),
    );
    return primary.length > 0 ? primary : evaluatedSecrets.slice(0, 5);
  }, [evaluatedSecrets]);

  // Stage 3: Downstream regions & secrets unlocked by items/songs obtained in this region
  const downstreamUnlocks = useMemo(() => {
    const grantedReqIds = new Set<string>();

    for (const ev of evaluatedSecrets) {
      const mapped = SECRET_TO_REQUIREMENTS_MAP[ev.secret.id];
      if (mapped) {
        for (const reqId of mapped) grantedReqIds.add(reqId);
      }
    }

    for (const [reqId, srcRegionId] of Object.entries(REQUIREMENT_SOURCE_REGION)) {
      if (srcRegionId === region.id) {
        grantedReqIds.add(reqId);
      }
    }

    const byTargetRegion = new Map<
      string,
      { regionId: string; count: number; viaLabels: Set<string> }
    >();

    if (grantedReqIds.size > 0) {
      for (const sec of ALL_SECRETS) {
        if (sec.regionId === region.id) continue;
        const matchingReqs = sec.requiredIds.filter((r) => grantedReqIds.has(r));
        if (matchingReqs.length === 0) continue;

        const existing = byTargetRegion.get(sec.regionId) ?? {
          regionId: sec.regionId,
          count: 0,
          viaLabels: new Set<string>(),
        };
        existing.count += 1;
        for (const rId of matchingReqs) {
          existing.viaLabels.add(REQUIREMENT_BY_ID[rId]?.name ?? rId);
        }
        byTargetRegion.set(sec.regionId, existing);
      }
    }

    const sorted = Array.from(byTargetRegion.values()).sort((a, b) => b.count - a.count);
    if (sorted.length > 0) {
      return sorted.slice(0, 8);
    }

    // Fallback to connected areas when a hub holds pure collectibles (Heart Pieces / Skulltulas)
    return region.connectedRegions.slice(0, 5).map((neighborId) => ({
      regionId: neighborId,
      count: 0,
      viaLabels: new Set<string>(['Connected Route']),
    }));
  }, [evaluatedSecrets, region.connectedRegions, region.id]);

  return (
    <div className="guided-lens-panel-inner" data-testid="quest-chain-panel">
      <div className="quest-flow">
        {/* Stage 1: Prerequisite Gear & Melodies */}
        <section className="quest-flow-stage" data-testid="quest-stage-prerequisites">
          <h3 className="quest-flow-stage__title">
            <KeyRound size={15} aria-hidden="true" />
            <span>1. Prerequisite Gear &amp; Songs</span>
          </h3>

          {prerequisiteIds.length > 0 ? (
            <div className="quest-flow-nodes">
              {prerequisiteIds.map((reqId) => {
                const req = REQUIREMENT_BY_ID[reqId];
                const label = req?.name ?? reqId;
                const satisfied = effectiveRequirements.has(reqId);
                const isSong = songIdSet.has(reqId);
                const sourceRegionId = REQUIREMENT_SOURCE_REGION[reqId];

                return (
                  <button
                    key={reqId}
                    type="button"
                    className={`quest-node-btn ${satisfied ? 'is-satisfied' : 'is-missing'}`}
                    data-testid={`quest-prereq-node-${reqId}`}
                    title={
                      req
                        ? `${req.name} — ${req.howToGet}`
                        : sourceRegionId
                          ? `Source: ${REGION_BY_ID[sourceRegionId]?.name ?? sourceRegionId}`
                          : label
                    }
                    onClick={(e) => {
                      if (isSong && onOpenSongbook) {
                        onOpenSongbook(reqId);
                        return;
                      }
                      onSelectRequirementPill(reqId, e.currentTarget);
                    }}
                  >
                    {satisfied ? (
                      <Check size={13} aria-hidden="true" />
                    ) : isSong ? (
                      <Music size={13} aria-hidden="true" />
                    ) : (
                      <Lock size={13} aria-hidden="true" />
                    )}
                    <span>{label}</span>
                  </button>
                );
              })}
            </div>
          ) : (
            <p className="copilot-complete-card__desc">
              No special dungeon gear or melodies required — accessible with starting equipment!
            </p>
          )}
        </section>

        <div className="quest-flow-connector" aria-hidden="true">
          <ArrowDown size={16} />
        </div>

        {/* Stage 2: Current Area Key Finds */}
        <section className="quest-flow-stage" data-testid="quest-stage-current-finds">
          <h3 className="quest-flow-stage__title">
            <Sparkles size={15} aria-hidden="true" />
            <span>2. Key Finds in {region.name}</span>
          </h3>

          <div className="quest-downstream-list">
            {keyFinds.map((ev) => {
              const checked = ev.status === 'completed';
              const grants = (SECRET_TO_REQUIREMENTS_MAP[ev.secret.id] ?? []).map(
                (id) => REQUIREMENT_BY_ID[id]?.name ?? id,
              );

              return (
                <div
                  key={ev.secret.id}
                  className="quest-downstream-card"
                  data-testid={`quest-key-find-${ev.secret.id}`}
                >
                  <button
                    type="button"
                    className="secret-card-map-focus-btn"
                    onClick={() => onSelectSecret(ev.secret.id)}
                  >
                    <strong>{ev.secret.title}</strong>
                    {grants.length > 0 && (
                      <span
                        style={{
                          display: 'block',
                          fontSize: '0.7rem',
                          color: 'var(--text-secondary)',
                        }}
                      >
                        Unlocks: {grants.join(', ')}
                      </span>
                    )}
                  </button>

                  <button
                    type="button"
                    className={`quest-node-btn ${checked ? 'is-satisfied' : ''}`}
                    data-testid={`quest-toggle-find-${ev.secret.id}`}
                    aria-pressed={checked}
                    onClick={() => onToggleSecret(ev.secret.id)}
                  >
                    {checked ? (
                      <>
                        <Check size={12} aria-hidden="true" />
                        <span>Claimed</span>
                      </>
                    ) : (
                      <span>Mark Claimed</span>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </section>

        <div className="quest-flow-connector" aria-hidden="true">
          <ArrowDown size={16} />
        </div>

        {/* Stage 3: What Checking This Unlocks Next */}
        <section className="quest-flow-stage" data-testid="quest-stage-downstream">
          <h3 className="quest-flow-stage__title">
            <GitBranch size={15} aria-hidden="true" />
            <span>3. What Checking This Unlocks Next</span>
          </h3>

          <div className="quest-downstream-list">
            {downstreamUnlocks.map((entry) => {
              const targetReg = REGION_BY_ID[entry.regionId];
              if (!targetReg) return null;
              const viaText = Array.from(entry.viaLabels).slice(0, 2).join(', ');

              return (
                <button
                  key={entry.regionId}
                  type="button"
                  className="quest-downstream-card"
                  data-testid={`quest-downstream-region-${entry.regionId}`}
                  onClick={() => onSelectRegion(entry.regionId)}
                >
                  <div>
                    <strong style={{ display: 'block', fontSize: 'var(--text-xs)' }}>
                      {targetReg.name}
                    </strong>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                      {entry.count > 0
                        ? `Opens ${entry.count} ${
                            entry.count === 1 ? 'secret' : 'secrets'
                          } via ${viaText}`
                        : viaText}
                    </span>
                  </div>
                  <ArrowRight size={14} aria-hidden="true" />
                </button>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
};
