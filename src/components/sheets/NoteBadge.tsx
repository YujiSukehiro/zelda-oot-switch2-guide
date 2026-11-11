import { useEffect, useId, useLayoutEffect, useRef, type ReactNode } from 'react';
import { X } from 'lucide-react';
import './sheets.css';

export type Switch2NoteButton = 'Y' | 'X' | 'A' | 'R' | 'L';

const VALID_NOTE_SET = new Set<Switch2NoteButton>(['Y', 'X', 'A', 'R', 'L']);

const NOTE_META: Record<
  Switch2NoteButton,
  {
    glyph: string;
    pitch: string;
    direction: string;
    shape: 'face' | 'bumper';
  }
> = {
  Y: { glyph: '◀', pitch: 'D2', direction: 'Left Note', shape: 'face' },
  X: { glyph: '▲', pitch: 'D5', direction: 'High Note', shape: 'face' },
  A: { glyph: '▶', pitch: 'B4', direction: 'Right Note', shape: 'face' },
  R: { glyph: '▼', pitch: 'F4', direction: 'Down Note', shape: 'bumper' },
  L: { glyph: '●', pitch: 'D4', direction: 'Low Note', shape: 'bumper' },
};

export function isSwitch2NoteButton(value: string): value is Switch2NoteButton {
  return VALID_NOTE_SET.has(value.trim().toUpperCase() as Switch2NoteButton);
}

/**
 * Extracts valid Switch 2 note tokens (`Y`, `X`, `A`, `R`, `L`) from user input
 * such as `"Y X A R L Y X A"`, `"YXARLYXA"`, or `"y -> x -> a"`.
 */
export function parseNoteTokens(input: string): Switch2NoteButton[] {
  const matches = input.toUpperCase().match(/[YXARL]/g);
  if (!matches) return [];
  return matches as Switch2NoteButton[];
}

export interface NoteBadgeProps {
  note: string;
  size?: 'sm' | 'md' | 'lg';
  showPitch?: boolean;
  onClick?: () => void;
  testId?: string;
}

export function NoteBadge({
  note,
  size = 'md',
  showPitch = false,
  onClick,
  testId,
}: NoteBadgeProps) {
  const normalized = note.trim().toUpperCase();

  if (!isSwitch2NoteButton(normalized)) {
    return (
      <span className="zelda-note-badge--custom" data-testid={testId}>
        {note}
      </span>
    );
  }

  const meta = NOTE_META[normalized];
  const classes = [
    'zelda-note-badge',
    `zelda-note-badge--${normalized}`,
    `zelda-note-badge--${meta.shape}`,
    `zelda-note-badge--${size}`,
    onClick ? 'zelda-note-badge--interactive' : '',
  ]
    .filter(Boolean)
    .join(' ');

  const content = (
    <>
      <span className="zelda-note-badge__glyph" aria-hidden="true">
        {meta.glyph}
      </span>
      <span>{normalized}</span>
      {showPitch ? <small style={{ opacity: 0.8 }}>({meta.pitch})</small> : null}
    </>
  );

  if (onClick) {
    return (
      <button
        type="button"
        className={classes}
        onClick={onClick}
        data-testid={testId}
        data-note={normalized}
        aria-label={`Add Switch 2 ${normalized} button (${meta.direction}, ${meta.pitch})`}
      >
        {content}
      </button>
    );
  }

  return (
    <span
      className={classes}
      data-testid={testId}
      data-note={normalized}
      title={`Switch 2 ${normalized} — ${meta.direction} (${meta.pitch})`}
    >
      {content}
    </span>
  );
}

export interface NoteSequenceProps {
  buttons: string[];
  size?: 'sm' | 'md' | 'lg';
}

export function NoteSequence({ buttons, size = 'md' }: NoteSequenceProps) {
  return (
    <div className="zelda-note-seq" aria-label={`Switch 2 notes: ${buttons.join(' ')}`}>
      {buttons.map((btn, idx) => (
        <span
          key={`${btn}-${idx}`}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.26rem' }}
        >
          <NoteBadge note={btn} size={size} />
          {idx < buttons.length - 1 && isSwitch2NoteButton(btn) ? (
            <span className="zelda-note-seq__arrow" aria-hidden="true">
              →
            </span>
          ) : null}
        </span>
      ))}
    </div>
  );
}

/**
 * Shared accessible native `<dialog>` wrapper for Companion Sheets.
 * Implements `modern-web-guidance` patterns:
 * - `light-dismiss-a-dialog`: `closedby="any"` + `showModal()` + bounding-box backdrop fallback for Safari
 * - `platform-controls-dismiss-dialog`: native `Esc` / `cancel` / `close` synchronization
 * - `prevent-page-scroll-under-modal-dialog`: CSS `overscroll-behavior: contain` on dialog & backdrop
 */
export interface SheetDialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: ReactNode;
  subtitle?: ReactNode;
  testId: string;
  size?: 'narrow' | 'default' | 'wide';
  children: ReactNode;
}

export function SheetDialog({
  isOpen,
  onClose,
  title,
  subtitle,
  testId,
  size = 'default',
  children,
}: SheetDialogProps) {
  const dialogRef = useRef<HTMLDialogElement | null>(null);
  const suppressNativeCloseRef = useRef(false);
  const titleId = useId();

  const invokeCloseFromHandler = () => {
    suppressNativeCloseRef.current = true;
    queueMicrotask(() => {
      suppressNativeCloseRef.current = false;
    });
    onClose();
  };

  useLayoutEffect(() => {
    if (!isOpen) return;
    suppressNativeCloseRef.current = false;
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (typeof dialog.showModal === 'function') {
      if (!dialog.open) {
        try {
          dialog.showModal();
        } catch {
          dialog.setAttribute('open', '');
        }
      }
    } else {
      dialog.setAttribute('open', '');
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return undefined;
    const dialog = dialogRef.current;
    return () => {
      if (dialog && dialog.open && typeof dialog.close === 'function') {
        try {
          dialog.close();
        } catch {
          // Ignore cleanup close errors in non-modal/jsdom teardown
        }
      }
    };
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  const sizeClass =
    size === 'narrow'
      ? 'zelda-modal-dialog--narrow'
      : size === 'wide'
        ? 'zelda-modal-dialog--wide'
        : '';

  return (
    <dialog
      ref={dialogRef}
      className={`zelda-modal-dialog ${sizeClass}`.trim()}
      data-testid={testId}
      aria-labelledby={titleId}
      {...({ closedby: 'any' } as Record<string, string>)}
      onClose={() => {
        if (!suppressNativeCloseRef.current) {
          onClose();
        }
      }}
      onCancel={(e) => {
        e.preventDefault();
        invokeCloseFromHandler();
      }}
      onKeyDown={(e) => {
        if (e.key === 'Escape' && !e.defaultPrevented) {
          e.stopPropagation();
          invokeCloseFromHandler();
        }
      }}
      onClick={(e) => {
        const dialog = dialogRef.current;
        if (!dialog || e.target !== dialog) return;
        const rect = dialog.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0) {
          const isInsideDialogBox =
            rect.top <= e.clientY &&
            e.clientY <= rect.top + rect.height &&
            rect.left <= e.clientX &&
            e.clientX <= rect.left + rect.width;
          if (isInsideDialogBox) return;
        }
        invokeCloseFromHandler();
      }}
    >
      <div className="zelda-modal-shell">
        <header className="zelda-modal-header">
          <div className="zelda-modal-header__titles">
            <h2 id={titleId} className="zelda-modal-title">
              {title}
            </h2>
            {subtitle ? <p className="zelda-modal-subtitle">{subtitle}</p> : null}
          </div>
          <button
            type="button"
            className="zelda-modal-close-btn"
            data-testid={`${testId}-close-btn`}
            aria-label="Close modal"
            onClick={invokeCloseFromHandler}
          >
            <X size={17} aria-hidden="true" />
          </button>
        </header>
        <div className="zelda-modal-body">{children}</div>
      </div>
    </dialog>
  );
}
