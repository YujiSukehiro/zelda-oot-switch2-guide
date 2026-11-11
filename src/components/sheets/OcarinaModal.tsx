import { useEffect, useMemo, useRef, useState } from 'react';
import { Check, Delete, MapPin, Mic, Music, Save, Sparkles, Trash2 } from 'lucide-react';
import { METADATA, REGION_BY_ID, SONGS_AND_QUESTS } from '../../data';
import { deriveOwnedInventoryRequirements } from '../../lib/gating';
import type { OcarinaSong, PlayerProgressState } from '../../types/zelda';
import {
  NoteBadge,
  NoteSequence,
  parseNoteTokens,
  SheetDialog,
  type Switch2NoteButton,
} from './NoteBadge';
import './sheets.css';

export interface OcarinaModalProps {
  isOpen: boolean;
  onClose: () => void;
  state: PlayerProgressState;
  effectiveRequirements: Set<string>;
  onToggleRequirement: (requirementId: string, owned?: boolean) => void;
  onSaveScarecrowNotes: (notes: string) => void;
  onSelectRegion: (regionId: string) => void;
  initialSongId?: string | null;
}

type SongFilterTab = 'all' | 'standard' | 'warp' | 'custom';

const NOTE_PAD_BUTTONS: readonly Switch2NoteButton[] = ['Y', 'X', 'A', 'R', 'L'];
const BOLERO_SIGNATURE = 'R L R L A R A R';

export function OcarinaModal({
  isOpen,
  onClose,
  state,
  onToggleRequirement,
  onSaveScarecrowNotes,
  onSelectRegion,
  initialSongId,
}: OcarinaModalProps) {
  const [filterTab, setFilterTab] = useState<SongFilterTab>('all');
  const [draftNotes, setDraftNotes] = useState<string>(state.customScarecrowNotes ?? '');
  const [statusMessage, setStatusMessage] = useState<{
    kind: 'success' | 'error';
    text: string;
  } | null>(null);
  const highlightedCardRef = useRef<HTMLElement | null>(null);
  const ownedInventoryReqs = useMemo(
    () => deriveOwnedInventoryRequirements(state),
    [state],
  );

  useEffect(() => {
    if (isOpen) {
      setDraftNotes(state.customScarecrowNotes ?? '');
      setStatusMessage(null);
      setFilterTab('all');
    }
  }, [isOpen, state.customScarecrowNotes]);

  useEffect(() => {
    if (isOpen && initialSongId && highlightedCardRef.current) {
      if (typeof highlightedCardRef.current.scrollIntoView === 'function') {
        highlightedCardRef.current.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      }
    }
  }, [isOpen, initialSongId]);

  const parsedDraftTokens = parseNoteTokens(draftNotes).slice(0, 8);
  const savedScarecrowTokens = parseNoteTokens(state.customScarecrowNotes ?? '').slice(0, 8);

  const validateTokens = (tokens: Switch2NoteButton[]): string | null => {
    if (tokens.length !== 8) {
      return `Need exactly 8 notes using Y, X, A, R, or L (currently ${tokens.length}/8).`;
    }
    const distinctCount = new Set(tokens).size;
    if (distinctCount < 2) {
      return 'Scarecrow’s Song must use at least 2 distinct buttons (cannot repeat 1 button 8 times).';
    }
    if (tokens.join(' ') === BOLERO_SIGNATURE) {
      return 'That 8-note sequence matches Bolero of Fire—pick any other custom 8-note tune!';
    }
    return null;
  };

  const handlePadTap = (btn: Switch2NoteButton) => {
    setStatusMessage(null);
    const current = parseNoteTokens(draftNotes);
    if (current.length >= 8) return;
    const next = [...current, btn];
    setDraftNotes(next.join(' '));
  };

  const handleBackspace = () => {
    setStatusMessage(null);
    const current = parseNoteTokens(draftNotes);
    if (current.length === 0) {
      setDraftNotes('');
      return;
    }
    setDraftNotes(current.slice(0, -1).join(' '));
  };

  const handleClear = () => {
    setDraftNotes('');
    onSaveScarecrowNotes('');
    setStatusMessage({ kind: 'success', text: 'Cleared saved Scarecrow melody.' });
  };

  const handleSaveScarecrow = () => {
    const error = validateTokens(parsedDraftTokens);
    if (error) {
      setStatusMessage({ kind: 'error', text: error });
      return;
    }
    const formatted = parsedDraftTokens.join(' ');
    setDraftNotes(formatted);
    onSaveScarecrowNotes(formatted);
    setStatusMessage({
      kind: 'success',
      text: `Saved Scarecrow’s Song (${formatted}) for Adult Link!`,
    });
  };

  const visibleSongs: OcarinaSong[] = SONGS_AND_QUESTS.ocarinaSongs.filter((song) => {
    if (filterTab === 'all') return true;
    return song.type === filterTab;
  });

  const learnedTotal = SONGS_AND_QUESTS.ocarinaSongs.filter((s) =>
    ownedInventoryReqs.has(s.id),
  ).length;

  return (
    <SheetDialog
      isOpen={isOpen}
      onClose={onClose}
      testId="ocarina-modal"
      size="wide"
      title={
        <>
          <Music size={19} aria-hidden="true" />
          <span>Switch 2 Ocarina Songbook &amp; Scarecrow Notepad</span>
        </>
      }
      subtitle={`All 13 Ocarina Melodies (${learnedTotal}/13 Learned) · Switch 2 Y / X / A / R / L Controller Mapping`}
    >
      {/* Switch 2 Pitch Legend & Built-in Microphone Tip */}
      <div className="zelda-callout zelda-callout--sapphire">
        <div className="zelda-callout__title">
          <Mic size={15} aria-hidden="true" />
          <span>Switch 2 Button Pitch Legend &amp; Microphone Input</span>
        </div>
        <div className="zelda-note-legend">
          <span className="zelda-note-legend__item">
            <NoteBadge note="L" size="sm" /> Low D (D4)
          </span>
          <span className="zelda-note-legend__item">
            <NoteBadge note="R" size="sm" /> Down F (F4)
          </span>
          <span className="zelda-note-legend__item">
            <NoteBadge note="A" size="sm" /> Right B (B4)
          </span>
          <span className="zelda-note-legend__item">
            <NoteBadge note="Y" size="sm" /> Left D (D2)
          </span>
          <span className="zelda-note-legend__item">
            <NoteBadge note="X" size="sm" /> High D (D5)
          </span>
        </div>
        <p style={{ margin: 0 }}>
          <strong>Pro Tip:</strong> {METADATA.switch2Controls.ocarinaNotes.microphone} — enable{' '}
          <em>Ocarina Mic Input</em> in Switch 2 Settings to hum, whistle, or play an instrument!
        </p>
      </div>

      {/* Custom 8-Note Scarecrow's Song Interactive Notepad */}
      <section className="zelda-scarecrow-box" aria-label="Custom Scarecrow's Song Notepad">
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '0.4rem',
          }}
        >
          <div className="zelda-callout__title">
            <Sparkles size={15} aria-hidden="true" />
            <span>Custom 8-Note Scarecrow’s Song Notepad (Bonooru &amp; Pierre)</span>
          </div>
          <span className="zelda-badge zelda-badge--updated">
            {parsedDraftTokens.length}/8 Notes · {new Set(parsedDraftTokens).size} Distinct
          </span>
        </div>

        <p style={{ margin: 0, fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>
          Record the 8-note tune you played for Bonooru at Lake Hylia as Child Link so you can play
          it back 15 hours later as Adult Link (requires 8 notes using &ge; 2 distinct buttons).
        </p>

        {/* Tap-to-Compose Switch 2 Buttons */}
        <div className="zelda-scarecrow-controls" role="group" aria-label="Tap Switch 2 note buttons">
          {NOTE_PAD_BUTTONS.map((btn) => (
            <NoteBadge
              key={btn}
              note={btn}
              size="lg"
              showPitch
              testId={`scarecrow-pad-${btn}`}
              onClick={() => handlePadTap(btn)}
            />
          ))}

          <button
            type="button"
            className="zelda-cmd-btn"
            data-testid="scarecrow-backspace-btn"
            aria-label="Delete last note"
            onClick={handleBackspace}
          >
            <Delete size={14} aria-hidden="true" />
            <span>Undo</span>
          </button>

          <button
            type="button"
            className="zelda-cmd-btn"
            data-testid="scarecrow-clear-btn"
            aria-label="Clear Scarecrow notes"
            onClick={handleClear}
          >
            <Trash2 size={14} aria-hidden="true" />
            <span>Clear</span>
          </button>
        </div>

        {/* 8-Slot Visual Note Preview */}
        <div className="zelda-scarecrow-slots" data-testid="scarecrow-preview-slots">
          {Array.from({ length: 8 }).map((_, idx) => {
            const note = parsedDraftTokens[idx];
            return note ? (
              <NoteBadge key={idx} note={note} size="md" testId={`scarecrow-slot-${idx}`} />
            ) : (
              <span key={idx} className="zelda-scarecrow-slot" aria-hidden="true">
                {idx + 1}
              </span>
            );
          })}
        </div>

        {/* Text Input + Save Button */}
        <div className="zelda-scarecrow-controls">
          <input
            type="text"
            className="zelda-scarecrow-input"
            data-testid="scarecrow-input"
            aria-label="Custom 8-note Scarecrow's Song (Y, X, A, R, L)"
            placeholder="Tap buttons above or type 8 notes, e.g. Y X Y X A R L A"
            value={draftNotes}
            onChange={(e) => {
              setStatusMessage(null);
              setDraftNotes(e.target.value);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleSaveScarecrow();
              }
            }}
          />

          <button
            type="button"
            className="zelda-btn-primary"
            data-testid="scarecrow-save-btn"
            onClick={handleSaveScarecrow}
          >
            <Save size={14} aria-hidden="true" />
            <span>Save 8-Note Tune</span>
          </button>
        </div>

        {statusMessage ? (
          <p
            role={statusMessage.kind === 'error' ? 'alert' : 'status'}
            data-testid="scarecrow-status"
            style={{
              margin: 0,
              fontSize: 'var(--text-xs)',
              fontWeight: 600,
              color:
                statusMessage.kind === 'error'
                  ? 'var(--color-locked-crimson-text)'
                  : 'var(--color-ready-text)',
            }}
          >
            {statusMessage.text}
          </p>
        ) : null}
      </section>

      {/* Song Category Tabs */}
      <div className="zelda-tablist" role="tablist" aria-label="Filter Ocarina melodies">
        {(
          [
            { id: 'all', label: 'All 13 Melodies' },
            { id: 'standard', label: 'Standard Songs (6)' },
            { id: 'warp', label: 'Warp Melodies (6)' },
            { id: 'custom', label: 'Scarecrow (1)' },
          ] as const
        ).map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            className="zelda-tab"
            aria-selected={filterTab === tab.id}
            data-testid={`ocarina-tab-${tab.id}`}
            onClick={() => setFilterTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* All 13 Song Cards */}
      <div className="zelda-card-grid">
        {visibleSongs.map((song) => {
          const isLearned = ownedInventoryReqs.has(song.id);
          const isHighlighted = initialSongId === song.id;
          const regionName = REGION_BY_ID[song.regionId]?.name ?? song.regionId;
          const buttonsToRender =
            song.id === 'song-scarecrow' && savedScarecrowTokens.length === 8
              ? savedScarecrowTokens
              : song.switch2Buttons;

          return (
            <article
              key={song.id}
              ref={isHighlighted ? highlightedCardRef : undefined}
              className={[
                'zelda-sheet-card',
                isLearned ? 'zelda-sheet-card--done' : '',
                isHighlighted ? 'zelda-sheet-card--highlighted' : '',
              ]
                .filter(Boolean)
                .join(' ')}
              data-testid={`song-card-${song.id}`}
            >
              <div className="zelda-sheet-card__top">
                <div>
                  <h3 className="zelda-sheet-card__title">{song.name}</h3>
                  <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap', marginTop: 4 }}>
                    <span
                      className={`zelda-badge ${
                        song.type === 'warp' ? 'zelda-badge--sapphire' : ''
                      }`.trim()}
                    >
                      {song.type === 'warp'
                        ? 'Warp Song'
                        : song.type === 'custom'
                          ? 'Custom 8-Note'
                          : 'Standard'}
                    </span>
                    <span className="zelda-badge">Era: {song.era}</span>
                  </div>
                </div>

                <button
                  type="button"
                  className="zelda-check-btn"
                  data-testid={`song-learned-btn-${song.id}`}
                  aria-pressed={isLearned}
                  onClick={() => onToggleRequirement(song.id)}
                >
                  <Check size={13} aria-hidden="true" />
                  <span>{isLearned ? 'Learned' : 'Mark Learned'}</span>
                </button>
              </div>

              <NoteSequence buttons={buttonsToRender} size="md" />

              <p className="zelda-sheet-card__desc">
                <strong>Effect:</strong> {song.effect}
              </p>
              <p className="zelda-sheet-card__desc">
                <strong>Where Learned:</strong> {song.howToGet}
              </p>

              <div className="zelda-sheet-card__footer">
                <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
                  {regionName}
                </span>
                <button
                  type="button"
                  className="zelda-link-btn"
                  data-testid={`song-jump-btn-${song.id}`}
                  onClick={() => {
                    onSelectRegion(song.regionId);
                    onClose();
                  }}
                >
                  <MapPin size={13} aria-hidden="true" />
                  <span>Jump to {regionName}</span>
                </button>
              </div>
            </article>
          );
        })}
      </div>
    </SheetDialog>
  );
}
