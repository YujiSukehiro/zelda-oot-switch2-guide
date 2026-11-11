import React, { useEffect, useRef } from 'react';
import {
  BookOpen,
  CheckCircle2,
  Compass,
  Music,
  Sparkles,
  X,
  XCircle,
} from 'lucide-react';
import {
  METADATA,
  REGION_BY_ID,
  REQUIREMENT_BY_ID,
  REQUIREMENT_SOURCE_REGION,
  SONG_BY_ID,
} from '../../data';
import type { RequirementCategory } from '../../types/zelda';

const VALID_SW2_NOTES = new Set(['Y', 'X', 'A', 'R', 'L']);

const CATEGORY_LABELS: Record<RequirementCategory, string> = {
  era: 'Era / Timeline',
  time: 'Time of Day',
  story: 'Story Milestone',
  gear: 'Dungeon & Tunic Gear',
  item: 'Inventory Item',
  quest: 'Quest Item',
  upgrade: 'Permanent Upgrade',
  economy: 'Wallet & Economy',
  milestone: 'Skulltula Milestone',
  song: 'Ocarina Melody',
};

export interface Switch2SongButtonsProps {
  notes: string[];
  songId?: string;
  customScarecrowNotes?: string;
  compact?: boolean;
}

export const Switch2SongButtons: React.FC<Switch2SongButtonsProps> = ({
  notes,
  songId,
  customScarecrowNotes,
  compact = false,
}) => {
  const isScarecrow = songId === 'song-scarecrow';
  const trimmedCustom = customScarecrowNotes?.trim() ?? '';
  const parsedCustomButtons = isScarecrow
    ? (trimmedCustom.toUpperCase().match(/[YXARL]/g) ?? [])
    : [];

  const isButtonSequence =
    notes.length > 0 && notes.every((n) => VALID_SW2_NOTES.has(n.trim().toUpperCase()));

  if (isScarecrow) {
    return (
      <div className={`sw2-song-notes ${compact ? 'is-compact' : ''}`}>
        {parsedCustomButtons.length > 0 ? (
          <div className="sw2-scarecrow-saved">
            <span className="sw2-notes-caption">
              Saved Scarecrow Tune ({trimmedCustom}):
            </span>
            <div className="sw2-note-sequence" aria-label={`Saved Scarecrow notes: ${parsedCustomButtons.join(' ')}`}>
              {parsedCustomButtons.map((btn, idx) => (
                <React.Fragment key={`${btn}-${idx}`}>
                  {idx > 0 && (
                    <span className="sw2-note-arrow" aria-hidden="true">
                      →
                    </span>
                  )}
                  <span
                    data-testid={`song-note-badge-${idx}`}
                    className={`sw2-note-badge sw2-note-${btn.toLowerCase()}`}
                    title={METADATA.switch2Controls.ocarinaNotes[btn] ?? btn}
                  >
                    {btn}
                  </span>
                </React.Fragment>
              ))}
            </div>
          </div>
        ) : (
          <div className="sw2-custom-melody-hint">
            <Music size={13} aria-hidden="true" />
            <span>
              {trimmedCustom
                ? `Saved Scarecrow Note: ${trimmedCustom}`
                : notes[0] ?? 'Custom 8-Note Melody (use ≥ 2 distinct Y / X / A / R / L buttons)'}
            </span>
          </div>
        )}
      </div>
    );
  }

  if (!isButtonSequence) {
    return (
      <div className={`sw2-song-notes ${compact ? 'is-compact' : ''}`}>
        <span className="sw2-custom-melody-hint">{notes.join(' ')}</span>
      </div>
    );
  }

  return (
    <div
      className={`sw2-song-notes ${compact ? 'is-compact' : ''}`}
      aria-label={`Switch 2 Ocarina buttons: ${notes.join(', ')}`}
    >
      <span className="sw2-notes-caption">Switch 2 Notes:</span>
      <div className="sw2-note-sequence">
        {notes.map((rawBtn, idx) => {
          const btn = rawBtn.trim().toUpperCase();
          return (
            <React.Fragment key={`${btn}-${idx}`}>
              {idx > 0 && (
                <span className="sw2-note-arrow" aria-hidden="true">
                  →
                </span>
              )}
              <span
                data-testid={`song-note-badge-${idx}`}
                className={`sw2-note-badge sw2-note-${btn.toLowerCase()}`}
                title={METADATA.switch2Controls.ocarinaNotes[btn] ?? btn}
              >
                {btn}
              </span>
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

export interface RequirementPopoverProps {
  reqId: string;
  isOwned: boolean;
  customScarecrowNotes?: string;
  onClose: () => void;
  onSelectRegion: (regionId: string) => void;
  onToggleRequirement?: (requirementId: string, owned?: boolean) => void;
  onOpenSongbook?: (songId?: string) => void;
}

export const RequirementPopover: React.FC<RequirementPopoverProps> = ({
  reqId,
  isOwned,
  customScarecrowNotes,
  onClose,
  onSelectRegion,
  onToggleRequirement,
  onOpenSongbook,
}) => {
  const closeBtnRef = useRef<HTMLButtonElement | null>(null);
  const requirement = REQUIREMENT_BY_ID[reqId];
  const song = SONG_BY_ID[reqId];
  const sourceRegionId = REQUIREMENT_SOURCE_REGION[reqId];
  const sourceRegion = sourceRegionId ? REGION_BY_ID[sourceRegionId] : undefined;

  useEffect(() => {
    closeBtnRef.current?.focus();
  }, [reqId]);

  const title = requirement?.name ?? song?.name ?? reqId;
  const categoryLabel = requirement
    ? CATEGORY_LABELS[requirement.category]
    : song
      ? 'Ocarina Melody'
      : 'Requirement';
  const songNotes = song?.switch2Buttons ?? requirement?.notes;
  const howToGet = requirement?.howToGet ?? song?.howToGet ?? 'Progress through Hyrule to unlock.';

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Escape') {
      event.stopPropagation();
      event.preventDefault();
      onClose();
    }
  };

  return (
    <div
      className="req-popover-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
      onKeyDown={handleKeyDown}
    >
      <div
        role="dialog"
        aria-modal="false"
        aria-labelledby={`req-popover-title-${reqId}`}
        data-testid="requirement-popover"
        className="req-popover-card"
      >
        <div className="req-popover-header">
          <div className="req-popover-meta">
            <span className="req-popover-category">{categoryLabel}</span>
            <span
              className={`req-popover-status ${isOwned ? 'is-owned' : 'is-missing'}`}
            >
              {isOwned ? (
                <>
                  <CheckCircle2 size={13} aria-hidden="true" />
                  Owned
                </>
              ) : (
                <>
                  <XCircle size={13} aria-hidden="true" />
                  Missing
                </>
              )}
            </span>
          </div>
          <button
            ref={closeBtnRef}
            type="button"
            data-testid="close-req-popover-btn"
            aria-label="Close requirement details"
            className="req-popover-close"
            onClick={onClose}
          >
            <X size={16} aria-hidden="true" />
          </button>
        </div>

        <h3 id={`req-popover-title-${reqId}`} className="req-popover-title">
          {title}
        </h3>

        {songNotes && songNotes.length > 0 && (
          <div className="req-popover-song-box">
            <Switch2SongButtons
              notes={songNotes}
              songId={reqId}
              customScarecrowNotes={customScarecrowNotes}
            />
            {song?.effect && <p className="req-popover-song-effect">{song.effect}</p>}
          </div>
        )}

        <div className="req-popover-section">
          <span className="req-popover-section-label">How to Obtain</span>
          <p className="req-popover-body">{howToGet}</p>
        </div>

        {requirement?.switch2Notes && (
          <div className="req-popover-switch2-note">
            <div className="req-popover-switch2-label">
              <Sparkles size={13} aria-hidden="true" />
              <span>Switch 2 Remake Note</span>
            </div>
            <p>{requirement.switch2Notes}</p>
          </div>
        )}

        <div className="req-popover-actions">
          {onToggleRequirement && (
            <button
              type="button"
              data-testid="popover-toggle-owned-btn"
              className={`req-popover-action-btn ${
                isOwned ? 'is-toggle-unowned' : 'is-toggle-owned'
              }`}
              onClick={() => onToggleRequirement(reqId, !isOwned)}
            >
              {isOwned ? 'Mark Unowned' : 'Mark Owned'}
            </button>
          )}

          {sourceRegion && (
            <button
              type="button"
              data-testid="popover-jump-region-btn"
              className="req-popover-action-btn is-jump-region"
              onClick={() => {
                onSelectRegion(sourceRegion.id);
                onClose();
              }}
            >
              <Compass size={14} aria-hidden="true" />
              <span>Jump to {sourceRegion.name}</span>
            </button>
          )}

          {song && onOpenSongbook && (
            <button
              type="button"
              data-testid="popover-open-songbook-btn"
              className="req-popover-action-btn is-songbook"
              onClick={() => {
                onOpenSongbook(reqId);
                onClose();
              }}
            >
              <BookOpen size={14} aria-hidden="true" />
              <span>Open Songbook</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
