import React from 'react';
import {
  Check,
  Clock,
  Coins,
  Hourglass,
  MapPin,
  Sparkles,
  Zap,
} from 'lucide-react';
import type { Era, EvaluatedSecret, SecretCategory } from '../../types/zelda';
import { RequirementPill } from './RequirementPill';
import { Switch2SongButtons } from './RequirementPopover';

const CATEGORY_BADGE_LABELS: Record<SecretCategory, string> = {
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
};

const ERA_BADGE_LABELS: Record<Era, string> = {
  child: 'Child',
  adult: 'Adult',
  both: 'Both',
  'cross-era': 'Cross-Era',
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
  onToggleSecret: (secretId: string, completed?: boolean) => void;
  onSelectRequirementPill: (reqId: string, triggerEl: HTMLButtonElement) => void;
  onOpenSongbook?: (songId?: string) => void;
}

export const SecretCard: React.FC<SecretCardProps> = ({
  evaluated,
  effectiveRequirements,
  customScarecrowNotes,
  activePopoverReqId,
  onToggleSecret,
  onSelectRequirementPill,
  onOpenSongbook,
}) => {
  const { secret, status, readyAltMethod } = evaluated;
  const isCompleted = status === 'completed';

  const categoryText =
    secret.category === 'gold-skulltula' && secret.skulltulaNumber
      ? `Skulltula #${secret.skulltulaNumber}`
      : CATEGORY_BADGE_LABELS[secret.category];

  const hasEmbeddedCrossEraProse = Boolean(
    secret.crossEraSteps && /Step\s*1\b/i.test(secret.howToGet),
  );
  const crossEraIntro = hasEmbeddedCrossEraProse
    ? extractCrossEraIntro(secret.howToGet)
    : null;

  return (
    <article
      data-testid={`secret-card-${secret.id}`}
      className={`secret-card is-${status}`}
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
            <span className={`secret-badge badge-cat cat-${secret.category}`}>
              {categoryText}
            </span>

            <span className={`secret-badge badge-era era-${secret.era}`}>
              {ERA_BADGE_LABELS[secret.era]}
            </span>

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

          <h4 className="secret-card-title">{secret.title}</h4>
          {secret.rewardText && secret.rewardText !== secret.title && (
            <p className="secret-card-reward">Reward: {secret.rewardText}</p>
          )}
        </div>
      </div>

      {status === 'available-via-alt' && readyAltMethod && (
        <div
          data-testid={`early-trick-${secret.id}`}
          className="secret-early-trick-banner"
        >
          <div className="early-trick-header">
            <Zap size={14} aria-hidden="true" />
            <span>Early Trick Ready Now</span>
          </div>
          <p className="early-trick-text">{readyAltMethod.label}</p>
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
          <span>{secret.locationHint}</span>
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
            <p className="cross-era-intro">{crossEraIntro}</p>
          )}
          {!hasEmbeddedCrossEraProse && (
            <p className="secret-how-to-get">{secret.howToGet}</p>
          )}
          <div className="cross-era-step-row">
            <span className="cross-era-step-badge">
              <Hourglass size={11} aria-hidden="true" />
              Step 1
            </span>
            <p className="cross-era-step-desc">{secret.crossEraSteps.step1}</p>
          </div>
          <div className="cross-era-step-row">
            <span className="cross-era-step-badge">
              <Hourglass size={11} aria-hidden="true" />
              Step 2
            </span>
            <p className="cross-era-step-desc">{secret.crossEraSteps.step2}</p>
          </div>
        </div>
      ) : (
        <p className="secret-how-to-get">{secret.howToGet}</p>
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
          <span>{secret.altMethods[0].label}</span>
        </div>
      )}
    </article>
  );
};
