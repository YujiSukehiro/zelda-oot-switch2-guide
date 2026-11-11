import React, { useState } from 'react';
import {
  Bug,
  Check,
  ChevronDown,
  Clock,
  Coins,
  Flame,
  Hourglass,
  Lightbulb,
  Lock,
  MapPin,
  Moon,
  Sparkles,
  Sun,
  Zap,
} from 'lucide-react';
import type { Era, EvaluatedSecret } from '../../types/zelda';
import { FormattedGuideText } from './FormattedGuideText';
import { RequirementPill } from './RequirementPill';
import { Switch2SongButtons } from './RequirementPopover';

const CATEGORY_BADGE_LABELS: Record<string, string> = {
  'heart-piece': 'Heart Piece',
  'gold-skulltula': 'Gold Skulltula',
  bottle: 'Empty Bottle',
  'great-fairy': 'Great Fairy',
  'capacity-upgrade': 'Capacity Upgrade',
  equipment: 'Equipment',
  'skulltula-reward': 'Skulltula Reward',
  'ocarina-song': 'Ocarina Song',
  'magic-bean': 'Magic Bean',
  'mask-trade': 'Happy Mask',
  'biggoron-step': 'Biggoron Quest',
  'cow-or-grotto': 'Cow / Grotto',
  'big-poe': 'Big Poe',
  'switch2-exclusive': 'Switch 2 Exclusive',
  'dungeon-item': 'Dungeon Gear',
  'boss-heart': 'Boss Heart',
  'quest-token': 'Stone / Medallion',
  'spiritual-stone': 'Spiritual Stone',
  medallion: 'Sage Medallion',
  'ganon-trial': 'Barrier Trial',
};

const ERA_BADGE_LABELS: Record<Era, string> = {
  child: 'Child',
  adult: 'Adult',
  both: 'Both',
  'cross-era': 'Cross-Era',
};

export interface ExtendedEvaluatedSecretFields {
  environmentalConditions?: string[];
  isRegionLocked?: boolean;
  regionLockReason?: string;
  visitStage?: 'completed' | 'do-now' | 'later-gear' | 'later-era';
}

export type EnvironmentalConditionKind =
  | 'night'
  | 'day'
  | 'bugs'
  | 'blue-fire'
  | 'sticks'
  | 'other';

export interface EnvironmentalConditionDescriptor {
  key: string;
  label: string;
  kind: EnvironmentalConditionKind;
}

export function formatSecretCategoryLabel(
  category: string,
  skulltulaNumber?: number,
  subCategory?: string,
): string {
  if (subCategory && CATEGORY_BADGE_LABELS[subCategory]) {
    return CATEGORY_BADGE_LABELS[subCategory];
  }
  if (category === 'gold-skulltula' && skulltulaNumber) {
    return `Skulltula #${skulltulaNumber}`;
  }
  if (CATEGORY_BADGE_LABELS[category]) {
    return CATEGORY_BADGE_LABELS[category];
  }
  return category
    .split('-')
    .map((part) => (part.length > 0 ? part[0].toUpperCase() + part.slice(1) : part))
    .join(' ');
}

function classifyEnvironmentalLabel(raw: string): EnvironmentalConditionDescriptor {
  const lower = raw.toLowerCase();
  if (lower.includes('night')) {
    return { key: 'night', label: 'Night Only', kind: 'night' };
  }
  if (lower.includes('day')) {
    return { key: 'day', label: 'Daytime Only', kind: 'day' };
  }
  if (lower.includes('bug')) {
    return { key: 'bugs', label: 'Bottled Bugs', kind: 'bugs' };
  }
  if (lower.includes('blue fire') || lower.includes('blue-fire')) {
    return { key: 'blue-fire', label: 'Blue Fire', kind: 'blue-fire' };
  }
  if (lower.includes('stick')) {
    return { key: 'sticks', label: 'Deku Sticks', kind: 'sticks' };
  }
  const slug = lower.replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'condition';
  return { key: slug, label: raw, kind: 'other' };
}

/**
 * Resolves environmental condition chips from either extended `EvaluatedSecret.environmentalConditions`
 * or fallback inspection of `secret.requiredIds`.
 */
export function deriveEnvironmentalConditions(
  evaluated: EvaluatedSecret,
): EnvironmentalConditionDescriptor[] {
  const ext = evaluated as EvaluatedSecret & ExtendedEvaluatedSecretFields;
  const seen = new Set<string>();
  const result: EnvironmentalConditionDescriptor[] = [];

  const addDescriptor = (desc: EnvironmentalConditionDescriptor) => {
    if (seen.has(desc.key)) return;
    seen.add(desc.key);
    result.push(desc);
  };

  if (Array.isArray(ext.environmentalConditions)) {
    for (const raw of ext.environmentalConditions) {
      if (raw && raw.trim()) {
        addDescriptor(classifyEnvironmentalLabel(raw.trim()));
      }
    }
  }

  for (const reqId of evaluated.secret.requiredIds) {
    if (reqId === 'time-night') {
      addDescriptor({ key: 'night', label: 'Night Only', kind: 'night' });
    } else if (reqId === 'time-day') {
      addDescriptor({ key: 'day', label: 'Daytime Only', kind: 'day' });
    } else if (reqId === 'bottled-bug') {
      addDescriptor({ key: 'bugs', label: 'Bottled Bugs', kind: 'bugs' });
    } else if (reqId === 'blue-fire') {
      addDescriptor({ key: 'blue-fire', label: 'Blue Fire', kind: 'blue-fire' });
    } else if (reqId === 'deku-sticks') {
      addDescriptor({ key: 'sticks', label: 'Deku Sticks', kind: 'sticks' });
    }
  }

  return result;
}

export const EnvironmentalConditionBadge: React.FC<{
  condition: EnvironmentalConditionDescriptor;
  secretId?: string;
}> = ({ condition, secretId }) => {
  const renderIcon = () => {
    switch (condition.kind) {
      case 'night':
        return <Moon size={11} aria-hidden="true" />;
      case 'day':
        return <Sun size={11} aria-hidden="true" />;
      case 'bugs':
        return <Bug size={11} aria-hidden="true" />;
      case 'blue-fire':
      case 'sticks':
        return <Flame size={11} aria-hidden="true" />;
      default:
        return <Sparkles size={11} aria-hidden="true" />;
    }
  };

  return (
    <span
      data-testid={secretId ? `env-chip-${secretId}-${condition.key}` : undefined}
      className={`secret-badge badge-env env-${condition.kind}`}
    >
      {renderIcon()}
      <span>{condition.label}</span>
    </span>
  );
};

function extractCrossEraIntro(howToGet: string): string | null {
  const idx = howToGet.search(/Step\s*1\b/i);
  if (idx <= 0) {
    return null;
  }
  const prefix = howToGet.slice(0, idx).trim().replace(/[:\-–—]+$/, '').trim();
  return prefix.length > 0 ? prefix : null;
}

export interface SecretCardProps {
  evaluated: EvaluatedSecret;
  effectiveRequirements: Set<string>;
  customScarecrowNotes?: string;
  activePopoverReqId?: string | null;
  compact?: boolean;
  defaultExpanded?: boolean;
  isSelectedOnMap?: boolean;
  onFocusOnMap?: (secretId: string) => void;
  onToggleSecret: (secretId: string, completed?: boolean) => void;
  onSelectRequirementPill: (reqId: string, triggerEl: HTMLButtonElement) => void;
  onOpenSongbook?: (songId?: string) => void;
}

export const SecretCard: React.FC<SecretCardProps> = ({
  evaluated,
  effectiveRequirements,
  customScarecrowNotes,
  activePopoverReqId,
  compact = false,
  defaultExpanded,
  isSelectedOnMap = false,
  onFocusOnMap,
  onToggleSecret,
  onSelectRequirementPill,
  onOpenSongbook,
}) => {
  const { secret, status, readyAltMethod } = evaluated;
  const ext = evaluated as EvaluatedSecret & ExtendedEvaluatedSecretFields;
  const isCompleted = status === 'completed';

  const [isExpanded, setIsExpanded] = useState<boolean>(() =>
    defaultExpanded !== undefined ? defaultExpanded : !compact,
  );

  const extSecret = secret as typeof secret & { subCategory?: string };
  const categoryText = formatSecretCategoryLabel(
    secret.category,
    secret.skulltulaNumber,
    extSecret.subCategory,
  );
  const envConditions = deriveEnvironmentalConditions(evaluated);

  const hasEmbeddedCrossEraProse = Boolean(
    secret.crossEraSteps && /Step\s*1\b/i.test(secret.howToGet),
  );
  const crossEraIntro = hasEmbeddedCrossEraProse ? extractCrossEraIntro(secret.howToGet) : null;

  const showSwitch2NotesCallout = Boolean(
    secret.switch2Notes &&
      secret.switch2Notes.trim().length > 0 &&
      secret.switch2Notes.trim() !== secret.howToGet.trim(),
  );
  const showProTipCallout = Boolean(secret.proTip && secret.proTip.trim().length > 0);

  return (
    <article
      data-testid={`secret-card-${secret.id}`}
      data-compact={compact ? 'true' : 'false'}
      data-expanded={isExpanded ? 'true' : 'false'}
      className={`secret-card is-${status}${compact ? ' is-compact-mode' : ''}${
        !isExpanded ? ' is-collapsed' : ''
      }${isSelectedOnMap ? ' is-map-selected' : ''}`}
    >
      <div className="secret-card-top">
        <button
          type="button"
          role="checkbox"
          aria-checked={isCompleted}
          aria-label={`Mark ${secret.title} as ${isCompleted ? 'incomplete' : 'completed'}`}
          data-testid={`secret-check-${secret.id}`}
          className={`secret-check-btn ${isCompleted ? 'is-checked' : ''}`}
          onClick={() => onToggleSecret(secret.id)}
        >
          <Check size={15} strokeWidth={3} aria-hidden="true" />
        </button>

        <div className="secret-card-heading">
          <div className="secret-card-badges">
            <span className={`secret-badge badge-cat cat-${secret.category}`}>{categoryText}</span>

            <span className={`secret-badge badge-era era-${secret.era}`}>
              {ERA_BADGE_LABELS[secret.era] ?? secret.era}
            </span>

            {envConditions.map((cond) => (
              <EnvironmentalConditionBadge key={cond.key} condition={cond} secretId={secret.id} />
            ))}

            {secret.switch2Status === 'new-switch2' && (
              <span className="secret-badge badge-switch2 is-new">
                <Sparkles size={11} aria-hidden="true" />
                NEW IN SWITCH 2
              </span>
            )}

            {secret.switch2Status === 'updated-switch2' && (
              <span className="secret-badge badge-switch2 is-updated">
                <Sparkles size={11} aria-hidden="true" />
                UPDATED IN SWITCH 2
              </span>
            )}

            {typeof secret.rupeeCost === 'number' && secret.rupeeCost > 0 && (
              <span className="secret-badge badge-rupee">
                <Coins size={11} aria-hidden="true" />
                {secret.rupeeCost} Rupees
              </span>
            )}

            {secret.timer && (
              <span className="secret-badge badge-timer">
                <Clock size={11} aria-hidden="true" />
                No-Warp {secret.timer}
              </span>
            )}
          </div>

          <div className="secret-card-title-row">
            <h4 className="secret-card-title">
              {onFocusOnMap ? (
                <button
                  type="button"
                  className="secret-card-map-focus-btn"
                  data-testid={`secret-map-focus-${secret.id}`}
                  onClick={() => onFocusOnMap(secret.id)}
                >
                  {secret.title}
                </button>
              ) : (
                secret.title
              )}
            </h4>

            <button
              type="button"
              className="secret-expand-toggle-btn"
              data-testid={`secret-expand-btn-${secret.id}`}
              aria-expanded={isExpanded}
              aria-label={`${isExpanded ? 'Collapse' : 'Expand'} details for ${secret.title}`}
              onClick={() => setIsExpanded((prev) => !prev)}
            >
              <span className="secret-expand-toggle-label">{isExpanded ? 'Less' : 'Details'}</span>
              <ChevronDown
                size={14}
                className={`secret-expand-chevron${isExpanded ? ' is-open' : ''}`}
                aria-hidden="true"
              />
            </button>
          </div>

          {secret.rewardText && secret.rewardText !== secret.title && (
            <p className="secret-card-reward">Reward: {secret.rewardText}</p>
          )}

          {!isExpanded && secret.locationHint && (
            <div className="secret-location-hint is-compact-preview">
              <MapPin size={12} aria-hidden="true" />
              <span>
                <FormattedGuideText text={secret.locationHint} />
              </span>
            </div>
          )}
        </div>
      </div>

      {isExpanded && (
        <div className="secret-card-details" data-testid={`secret-details-${secret.id}`}>
          {ext.isRegionLocked && ext.regionLockReason && (
            <div
              className="secret-region-lock-banner"
              data-testid={`secret-region-lock-${secret.id}`}
            >
              <Lock size={13} aria-hidden="true" />
              <span>
                <FormattedGuideText text={ext.regionLockReason} />
              </span>
            </div>
          )}

          {status === 'available-via-alt' && readyAltMethod && (
            <div data-testid={`early-trick-${secret.id}`} className="secret-early-trick-banner">
              <div className="early-trick-header">
                <Zap size={14} aria-hidden="true" />
                <span>Early Trick Ready Now</span>
              </div>
              <p className="early-trick-text">
                <FormattedGuideText text={readyAltMethod.label} />
              </p>
              {readyAltMethod.requiredIds.length > 0 && (
                <div className="early-trick-pills">
                  {readyAltMethod.requiredIds.map((reqId) => (
                    <RequirementPill
                      key={`alt-${reqId}`}
                      reqId={reqId}
                      isSatisfied={effectiveRequirements.has(reqId)}
                      isActive={activePopoverReqId === reqId}
                      onSelect={onSelectRequirementPill}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {secret.locationHint && (
            <div className="secret-location-hint">
              <MapPin size={13} aria-hidden="true" />
              <span>
                <FormattedGuideText text={secret.locationHint} />
              </span>
            </div>
          )}

          {secret.songButtons && secret.songButtons.length > 0 && (
            <div className="secret-inline-song-row">
              <Switch2SongButtons
                notes={secret.songButtons}
                songId={secret.id}
                customScarecrowNotes={customScarecrowNotes}
                compact
              />
              {onOpenSongbook && (
                <button
                  type="button"
                  className="secret-songbook-link"
                  onClick={() => onOpenSongbook(secret.id)}
                >
                  Songbook
                </button>
              )}
            </div>
          )}

          {secret.crossEraSteps ? (
            <div
              data-testid={`cross-era-steps-${secret.id}`}
              className="secret-cross-era-timeline"
            >
              {crossEraIntro && (
                <p className="cross-era-intro">
                  <FormattedGuideText text={crossEraIntro} />
                </p>
              )}
              {!hasEmbeddedCrossEraProse && (
                <p className="secret-how-to-get">
                  <FormattedGuideText text={secret.howToGet} />
                </p>
              )}
              <div className="cross-era-step-row">
                <span className="cross-era-step-badge">
                  <Hourglass size={11} aria-hidden="true" />
                  Step 1
                </span>
                <p className="cross-era-step-desc">
                  <FormattedGuideText text={secret.crossEraSteps.step1} />
                </p>
              </div>
              <div className="cross-era-step-row">
                <span className="cross-era-step-badge">
                  <Hourglass size={11} aria-hidden="true" />
                  Step 2
                </span>
                <p className="cross-era-step-desc">
                  <FormattedGuideText text={secret.crossEraSteps.step2} />
                </p>
              </div>
            </div>
          ) : (
            <p className="secret-how-to-get">
              <FormattedGuideText text={secret.howToGet} />
            </p>
          )}

          {showSwitch2NotesCallout && secret.switch2Notes && (
            <div
              className="secret-callout secret-callout--switch2"
              data-testid={`secret-switch2-note-${secret.id}`}
            >
              <Sparkles size={13} aria-hidden="true" />
              <div>
                <strong className="secret-callout__label">Switch 2 Remake Note:</strong>{' '}
                <FormattedGuideText text={secret.switch2Notes} />
              </div>
            </div>
          )}

          {showProTipCallout && secret.proTip && (
            <div
              className="secret-callout secret-callout--protip"
              data-testid={`secret-protip-${secret.id}`}
            >
              <Lightbulb size={13} aria-hidden="true" />
              <div>
                <strong className="secret-callout__label">Pro Tip:</strong>{' '}
                <FormattedGuideText text={secret.proTip} />
              </div>
            </div>
          )}

          {secret.requiredIds.length > 0 && (
            <div className="secret-reqs-footer">
              <span className="secret-reqs-label">
                {status === 'available-via-alt' ? 'Standard Gate:' : 'Requirements:'}
              </span>
              <div className="secret-reqs-pills">
                {secret.requiredIds.map((reqId) => (
                  <RequirementPill
                    key={reqId}
                    reqId={reqId}
                    isSatisfied={effectiveRequirements.has(reqId)}
                    isActive={activePopoverReqId === reqId}
                    onSelect={onSelectRequirementPill}
                  />
                ))}
              </div>
            </div>
          )}

          {status === 'locked' && secret.altMethods.length > 0 && (
            <div className="secret-locked-alt-hint">
              <span className="secret-alt-hint-label">Early / Alt Route:</span>
              <span>
                <FormattedGuideText text={secret.altMethods[0].label} />
              </span>
            </div>
          )}
        </div>
      )}
    </article>
  );
};
