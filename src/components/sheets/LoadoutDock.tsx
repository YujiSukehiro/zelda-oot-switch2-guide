import { ChevronDown, ChevronUp, Check, RotateCcw, Sparkles, X } from 'lucide-react';
import {
  REGION_BY_ID,
  REQUIREMENTS,
  REQUIREMENT_BY_ID,
  SONGS_AND_QUESTS,
  STORY_PRESETS,
} from '../../data';
import type { PlayerProgressState, UnlockDelta } from '../../types/zelda';
import './sheets.css';

export interface LoadoutDockProps {
  isOpen: boolean;
  onToggleOpen: (nextOpen: boolean) => void;
  state: PlayerProgressState;
  effectiveRequirements: Set<string>;
  skulltulaCount: number;
  onToggleRequirement: (requirementId: string, owned?: boolean) => void;
  onSelectPreset: (presetId: string) => void;
  onToggleLoadoutMode: (enabled: boolean) => void;
  lastUnlockDelta?: UnlockDelta | null;
  onDismissUnlockDelta?: () => void;
  onSelectRegion?: (regionId: string) => void;
}

const ERA_WORLD_STATE_IDS: readonly string[] = [
  'era-child',
  'era-adult',
  'time-travel',
  'time-day',
  'time-night',
  'zora-thawed',
];

const CHILD_GEAR_IDS: readonly string[] = [
  'kokiri-sword',
  'deku-shield',
  'deku-sticks',
  'slingshot',
  'ocarina',
  'weird-egg',
  'zeldas-letter',
  'goron-bracelet',
  'bombs',
  'boomerang',
  'silver-scale',
  'magic-beans',
  'magic-meter',
  'dins-fire',
  'lens-of-truth',
  'skull-mask',
  'mask-of-truth',
  'bottle',
  'bottled-bug',
  'stone-emerald',
  'stone-ruby',
  'stone-sapphire',
];

const ADULT_GEAR_IDS: readonly string[] = [
  'epona',
  'hookshot',
  'longshot',
  'bow',
  'fire-arrows',
  'ice-arrows',
  'light-arrows',
  'megaton-hammer',
  'goron-tunic',
  'iron-boots',
  'zora-tunic',
  'blue-fire',
  'golden-scale',
  'hover-boots',
  'gerudo-card',
  'silver-gauntlets',
  'golden-gauntlets',
  'mirror-shield',
];

const WALLET_UPGRADE_IDS: readonly string[] = [
  'rupees-100',
  'adults-wallet',
  'giants-wallet',
  'echo-gem',
];

const SKULLTULA_MILESTONES: ReadonlyArray<{ id: string; threshold: number }> = [
  { id: 'tokens-10', threshold: 10 },
  { id: 'tokens-20', threshold: 20 },
  { id: 'tokens-30', threshold: 30 },
  { id: 'tokens-40', threshold: 40 },
  { id: 'tokens-50', threshold: 50 },
  { id: 'tokens-100', threshold: 100 },
];

export function LoadoutDock({
  isOpen,
  onToggleOpen,
  state,
  effectiveRequirements,
  skulltulaCount,
  onToggleRequirement,
  onSelectPreset,
  onToggleLoadoutMode,
  lastUnlockDelta,
  onDismissUnlockDelta,
  onSelectRegion,
}: LoadoutDockProps) {
  const songIds = SONGS_AND_QUESTS.ocarinaSongs.map((s) => s.id);
  const categorizedIdSet = new Set<string>([
    ...ERA_WORLD_STATE_IDS,
    ...CHILD_GEAR_IDS,
    ...ADULT_GEAR_IDS,
    ...WALLET_UPGRADE_IDS,
    ...SKULLTULA_MILESTONES.map((m) => m.id),
    ...songIds,
  ]);
  const extraWorldIds = REQUIREMENTS.map((r) => r.id).filter((id) => !categorizedIdSet.has(id));
  const isRequirementActive = (reqId: string): boolean =>
    state.loadoutModeEnabled
      ? effectiveRequirements.has(reqId)
      : Boolean(state.ownedRequirementIds[reqId]);

  const renderRequirementPill = (reqId: string) => {
    const req = REQUIREMENT_BY_ID[reqId];
    if (!req) return null;
    const active = isRequirementActive(reqId);
    const explicitlyOwned = Boolean(state.ownedRequirementIds[reqId]);
    const isAutoSynced = active && !explicitlyOwned;

    return (
      <button
        key={req.id}
        type="button"
        className="zelda-req-toggle"
        data-testid={`loadout-req-${req.id}`}
        aria-pressed={active}
        title={`${req.name}: ${req.howToGet}`}
        onClick={() => onToggleRequirement(req.id)}
      >
        <span aria-hidden="true">{active ? '✓' : '+'}</span>
        <span>{req.name}</span>
        {isAutoSynced ? <span className="zelda-req-toggle__auto">Auto</span> : null}
      </button>
    );
  };

  const activePresetId = (() => {
    const ownedKeys = Object.keys(state.ownedRequirementIds).filter(
      (k) => state.ownedRequirementIds[k],
    );
    for (const preset of STORY_PRESETS) {
      if (
        preset.ownedRequirementIds.length === ownedKeys.length &&
        preset.ownedRequirementIds.every((id) => Boolean(state.ownedRequirementIds[id]))
      ) {
        return preset.id;
      }
    }
    return null;
  })();

  const unlockRegionIds = lastUnlockDelta ? Object.keys(lastUnlockDelta.byRegion) : [];

  return (
    <section
      className="zelda-loadout-dock"
      data-testid="loadout-dock"
      data-open={isOpen ? 'true' : 'false'}
      aria-label="My Loadout and Story Progression"
    >
      <div className="zelda-loadout-dock__bar">
        <div className="zelda-loadout-dock__bar-left">
          <button
            type="button"
            className="zelda-loadout-dock__toggle"
            data-testid="loadout-dock-expand-btn"
            aria-expanded={isOpen}
            onClick={() => onToggleOpen(!isOpen)}
          >
            {isOpen ? (
              <ChevronDown size={15} aria-hidden="true" />
            ) : (
              <ChevronUp size={15} aria-hidden="true" />
            )}
            <span>My Inventory &amp; Story Checkpoints</span>
          </button>

          <span className="zelda-loadout-dock__meta-pill" data-testid="loadout-owned-summary">
            <Check size={12} aria-hidden="true" />
            {effectiveRequirements.size} Gear &amp; Songs Owned
          </span>

          <span className="zelda-loadout-dock__meta-pill" data-testid="loadout-skulltula-pill">
            <span aria-hidden="true">🕷</span>
            Gold Skulltulas: {skulltulaCount}/100
          </span>
        </div>

        <button
          type="button"
          role="switch"
          aria-checked={state.loadoutModeEnabled}
          className="zelda-loadout-dock__mode-btn"
          data-testid="loadout-mode-switch"
          title="Progressive Mode hides unreachable items until you own the required gear & songs; Checklist Mode shows all items unlocked."
          onClick={() => onToggleLoadoutMode(!state.loadoutModeEnabled)}
        >
          <Sparkles size={13} aria-hidden="true" />
          <span>
            {state.loadoutModeEnabled
              ? 'World Lock: Progressive (Hide Unreachable)'
              : 'Checklist Mode (Show All Unlocked)'}
          </span>
        </button>
      </div>

      {isOpen ? (
        <div className="zelda-loadout-dock__body">
          {/* Optional inline summary when a newly unlocked delta exists */}
          {lastUnlockDelta && lastUnlockDelta.totalUnlocked > 0 ? (
            <div className="zelda-loadout-dock__unlock-inline" data-testid="loadout-unlock-summary">
              <span>
                <strong>{lastUnlockDelta.triggerLabel ?? 'Loadout update'}</strong> unlocked{' '}
                <strong>{lastUnlockDelta.totalUnlocked}</strong> secrets across{' '}
                <strong>{unlockRegionIds.length}</strong>{' '}
                {unlockRegionIds.length === 1 ? 'region' : 'regions'}!
              </span>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                {onSelectRegion && unlockRegionIds[0] ? (
                  <button
                    type="button"
                    className="zelda-link-btn"
                    onClick={() => onSelectRegion(unlockRegionIds[0])}
                  >
                    Jump to {REGION_BY_ID[unlockRegionIds[0]]?.name ?? unlockRegionIds[0]}
                  </button>
                ) : null}
                {onDismissUnlockDelta ? (
                  <button
                    type="button"
                    className="zelda-modal-close-btn"
                    style={{ width: 24, height: 24 }}
                    aria-label="Dismiss inline unlock summary"
                    onClick={onDismissUnlockDelta}
                  >
                    <X size={13} aria-hidden="true" />
                  </button>
                ) : null}
              </div>
            </div>
          ) : null}

          {/* 7 Canonical Story Checkpoint Presets */}
          <div className="zelda-presets-strip">
            <p className="zelda-section-eyebrow">
              <span>Story Checkpoint Presets (1-Click Mid-Playthrough Setup)</span>
              <RotateCcw size={12} aria-hidden="true" />
            </p>
            <div className="zelda-presets-strip__list" role="group" aria-label="Story presets">
              {STORY_PRESETS.map((preset) => {
                const isActive = activePresetId === preset.id;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    className={`zelda-preset-btn ${isActive ? 'zelda-preset-btn--active' : ''}`.trim()}
                    data-testid={`preset-btn-${preset.id}`}
                    aria-pressed={isActive}
                    title={`${preset.label} — ${preset.description}`}
                    onClick={() => onSelectPreset(preset.id)}
                  >
                    <span>{preset.shortLabel}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 5 Categorized Requirement Pill Groups */}
          <div className="zelda-loadout-groups">
            <div className="zelda-loadout-group">
              <h3 className="zelda-section-eyebrow">Era &amp; World State</h3>
              <div className="zelda-req-pills">
                {ERA_WORLD_STATE_IDS.map(renderRequirementPill)}
                {extraWorldIds.map(renderRequirementPill)}
              </div>
            </div>

            <div className="zelda-loadout-group">
              <h3 className="zelda-section-eyebrow">
                Wallets &amp; Auto-Derived Skulltula Milestones ({skulltulaCount} / 100)
              </h3>
              <div className="zelda-req-pills">
                {WALLET_UPGRADE_IDS.map(renderRequirementPill)}
                {SKULLTULA_MILESTONES.map(({ id, threshold }) => {
                  const req = REQUIREMENT_BY_ID[id];
                  if (!req) return null;
                  const autoReached = skulltulaCount >= threshold;
                  const active = isRequirementActive(id);
                  return (
                    <button
                      key={id}
                      type="button"
                      className="zelda-req-toggle zelda-req-toggle--milestone"
                      data-testid={`loadout-req-${id}`}
                      aria-pressed={active}
                      title={`${req.name} — Auto-unlocks at ${threshold} checked Gold Skulltulas (currently ${skulltulaCount}/100), or tap to toggle manually.`}
                      onClick={() => onToggleRequirement(id)}
                    >
                      <span aria-hidden="true">🕷</span>
                      <span>{threshold} Tokens</span>
                      {autoReached ? <span className="zelda-req-toggle__auto">Auto ✓</span> : null}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="zelda-loadout-group">
              <h3 className="zelda-section-eyebrow">Child Gear &amp; Quest Items</h3>
              <div className="zelda-req-pills">{CHILD_GEAR_IDS.map(renderRequirementPill)}</div>
            </div>

            <div className="zelda-loadout-group">
              <h3 className="zelda-section-eyebrow">Adult Dungeon Gear</h3>
              <div className="zelda-req-pills">{ADULT_GEAR_IDS.map(renderRequirementPill)}</div>
            </div>

            <div className="zelda-loadout-group zelda-loadout-group--wide">
              <h3 className="zelda-section-eyebrow">Ocarina Songs (All 13 Melodies)</h3>
              <div className="zelda-req-pills">{songIds.map(renderRequirementPill)}</div>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
