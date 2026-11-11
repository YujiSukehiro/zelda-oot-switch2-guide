import { useState } from 'react';
import { ChevronDown, ChevronUp, MapPin, Sparkles, X } from 'lucide-react';
import { REGION_BY_ID, REQUIREMENT_BY_ID, SECRET_BY_ID, STORY_PRESETS } from '../../data';
import type { UnlockDelta } from '../../types/zelda';
import './sheets.css';

export interface UnlockToastProps {
  delta: UnlockDelta | null;
  onDismiss: () => void;
  onSelectRegion: (regionId: string) => void;
}

function formatTriggerTitle(triggerLabel?: string): string {
  if (!triggerLabel) return 'Loadout update';
  const preset = STORY_PRESETS.find((p) => p.id === triggerLabel);
  if (preset) return preset.shortLabel;
  const req = REQUIREMENT_BY_ID[triggerLabel];
  if (req) return req.name;
  const secret = SECRET_BY_ID[triggerLabel];
  if (secret) return secret.title;
  return triggerLabel;
}

export function UnlockToast({ delta, onDismiss, onSelectRegion }: UnlockToastProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!delta || delta.totalUnlocked <= 0) {
    return null;
  }

  const regionEntries = Object.entries(delta.byRegion).filter(([, list]) => list.length > 0);
  const regionCount = regionEntries.length;
  const triggerTitle = formatTriggerTitle(delta.triggerLabel);
  const secretsWord = delta.totalUnlocked === 1 ? 'secret' : 'secrets';
  const regionsWord = regionCount === 1 ? 'region' : 'regions';

  return (
    <aside
      className="zelda-unlock-toast"
      role="status"
      aria-live="polite"
      data-testid="unlock-toast"
    >
      <div className="zelda-unlock-toast__header">
        <div>
          <p className="zelda-unlock-toast__title">
            <Sparkles
              size={14}
              style={{ display: 'inline', verticalAlign: '-2px', marginRight: '0.3rem' }}
              aria-hidden="true"
            />
            {triggerTitle} unlocked {delta.totalUnlocked} new {secretsWord} across {regionCount}{' '}
            {regionsWord}
          </p>
          <p className="zelda-unlock-toast__sub">
            Ready to collect right now across Hyrule based on your updated loadout.
          </p>
        </div>

        <button
          type="button"
          className="zelda-modal-close-btn"
          style={{ width: 28, height: 28 }}
          data-testid="unlock-toast-dismiss-btn"
          aria-label="Dismiss unlock notification"
          onClick={onDismiss}
        >
          <X size={15} aria-hidden="true" />
        </button>
      </div>

      <div className="zelda-unlock-toast__actions">
        <button
          type="button"
          className="zelda-link-btn"
          data-testid="unlock-toast-expand-btn"
          aria-expanded={isExpanded}
          onClick={() => setIsExpanded((prev) => !prev)}
        >
          {isExpanded ? (
            <ChevronDown size={14} aria-hidden="true" />
          ) : (
            <ChevronUp size={14} aria-hidden="true" />
          )}
          <span>
            {isExpanded ? 'Hide Unlocked Secrets' : `View Unlocked Secrets (${delta.totalUnlocked})`}
          </span>
        </button>

        {regionEntries[0] ? (
          <button
            type="button"
            className="zelda-link-btn"
            data-testid="unlock-toast-first-region-btn"
            onClick={() => onSelectRegion(regionEntries[0][0])}
          >
            <MapPin size={13} aria-hidden="true" />
            <span>{REGION_BY_ID[regionEntries[0][0]]?.name ?? regionEntries[0][0]}</span>
          </button>
        ) : null}
      </div>

      {isExpanded ? (
        <div className="zelda-unlock-toast__drawer" data-testid="unlock-toast-list">
          {regionEntries.map(([regionId, items]) => {
            const regionName = REGION_BY_ID[regionId]?.name ?? regionId;
            return (
              <div key={regionId} className="zelda-unlock-region-group">
                <button
                  type="button"
                  className="zelda-unlock-region-btn"
                  data-testid={`unlock-region-${regionId}`}
                  onClick={() => onSelectRegion(regionId)}
                >
                  <span>
                    <MapPin
                      size={12}
                      style={{ display: 'inline', verticalAlign: '-1px', marginRight: 4 }}
                      aria-hidden="true"
                    />
                    {regionName}
                  </span>
                  <span>+{items.length} Ready →</span>
                </button>

                {items.map((ev) => (
                  <button
                    key={ev.secret.id}
                    type="button"
                    className="zelda-unlock-item-btn"
                    data-testid={`unlock-item-${ev.secret.id}`}
                    onClick={() => onSelectRegion(ev.secret.regionId)}
                  >
                    <span>{ev.secret.title}</span>
                    {ev.status === 'available-via-alt' ? (
                      <span className="zelda-badge zelda-badge--updated">Early Trick</span>
                    ) : (
                      <span className="zelda-badge zelda-badge--rupee">Ready</span>
                    )}
                  </button>
                ))}
              </div>
            );
          })}
        </div>
      ) : null}
    </aside>
  );
}
