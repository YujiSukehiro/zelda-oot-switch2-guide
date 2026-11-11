import { useEffect, useState, type ChangeEvent } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Copy,
  DatabaseBackup,
  Download,
  RotateCcw,
  Upload,
} from 'lucide-react';
import { parseImportedProgressJson } from '../../lib/storage';
import type { GlobalProgressSummary, PlayerProgressState } from '../../types/zelda';
import { SheetDialog } from './NoteBadge';
import './sheets.css';

export interface BackupModalProps {
  isOpen: boolean;
  onClose: () => void;
  state: PlayerProgressState;
  globalProgress: GlobalProgressSummary;
  onExportJson: () => string;
  onImportJson: (jsonText: string) => void;
  onResetProgress: () => void;
  isStoragePersisted?: boolean;
}

export function BackupModal({
  isOpen,
  onClose,
  state,
  globalProgress,
  onExportJson,
  onImportJson,
  onResetProgress,
  isStoragePersisted = false,
}: BackupModalProps) {
  const [importText, setImportText] = useState('');
  const [confirmingReset, setConfirmingReset] = useState(false);
  const [feedback, setFeedback] = useState<{
    kind: 'success' | 'error';
    message: string;
  } | null>(null);

  useEffect(() => {
    if (isOpen) {
      setConfirmingReset(false);
      setFeedback(null);
    }
  }, [isOpen]);

  const ownedGearCount = Object.values(state.ownedRequirementIds).filter(Boolean).length;

  const handleDownloadJson = () => {
    try {
      const jsonPayload = onExportJson();
      if (typeof URL !== 'undefined' && typeof URL.createObjectURL === 'function') {
        const blob = new Blob([jsonPayload], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const anchor = document.createElement('a');
        const dateStamp = new Date().toISOString().slice(0, 10);
        anchor.href = url;
        anchor.download = `zelda-oot-switch2-backup-${dateStamp}.json`;
        document.body.appendChild(anchor);
        if (typeof navigator === 'undefined' || !/jsdom/i.test(navigator.userAgent)) {
          anchor.click();
        }
        document.body.removeChild(anchor);
        URL.revokeObjectURL(url);
      }
      setFeedback({
        kind: 'success',
        message: 'Downloaded offline JSON progress backup!',
      });
    } catch (err) {
      setFeedback({
        kind: 'error',
        message: err instanceof Error ? err.message : 'Failed to export backup JSON.',
      });
    }
  };

  const handleCopyJson = async () => {
    try {
      const jsonPayload = onExportJson();
      setImportText(jsonPayload);
      if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(jsonPayload);
      }
      setFeedback({
        kind: 'success',
        message: 'Copied backup JSON to clipboard (and loaded preview below).',
      });
    } catch {
      setFeedback({
        kind: 'success',
        message: 'Generated backup JSON in the text box below ready to copy.',
      });
    }
  };

  const runImport = (rawJson: string) => {
    try {
      const validated = parseImportedProgressJson(rawJson);
      onImportJson(rawJson);
      const importedCount = Object.values(validated.completedSecretIds).filter(Boolean).length;
      setFeedback({
        kind: 'success',
        message: `Successfully restored backup (${importedCount} completed collectibles)!`,
      });
      setConfirmingReset(false);
    } catch (err) {
      setFeedback({
        kind: 'error',
        message: err instanceof Error ? err.message : 'Invalid backup JSON file.',
      });
    }
  };

  const handleFileUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text =
        typeof file.text === 'function'
          ? await file.text()
          : await new Promise<string>((resolve, reject) => {
              const reader = new FileReader();
              reader.onload = () => resolve(String(reader.result ?? ''));
              reader.onerror = () => reject(new Error('Failed to read backup file.'));
              reader.readAsText(file);
            });
      setImportText(text);
      runImport(text);
    } catch (err) {
      setFeedback({
        kind: 'error',
        message: err instanceof Error ? err.message : 'Could not read selected file.',
      });
    } finally {
      e.target.value = '';
    }
  };

  const handleConfirmReset = () => {
    onResetProgress();
    setConfirmingReset(false);
    setImportText('');
    setFeedback({
      kind: 'success',
      message: 'All progress reset to Fresh Start (Kokiri Forest).',
    });
  };

  return (
    <SheetDialog
      isOpen={isOpen}
      onClose={onClose}
      testId="backup-modal"
      size="narrow"
      title={
        <>
          <DatabaseBackup size={19} aria-hidden="true" />
          <span>Offline Save Backup, Restore &amp; Reset</span>
        </>
      }
      subtitle="Dual localStorage + IndexedDB phone PWA persistence — export a JSON file anytime to sync across devices"
    >
      {/* Current Save Summary */}
      <div className="zelda-callout">
        <div className="zelda-callout__title">Current Save Snapshot</div>
        <div style={{ display: 'flex', gap: '0.45rem', flexWrap: 'wrap' }}>
          <span className="zelda-badge zelda-badge--rupee">
            {globalProgress.completedCount}/{globalProgress.totalCount} ({globalProgress.percent}%)
          </span>
          <span className="zelda-badge">
            Heart Pieces: {globalProgress.heartPiecesCompleted}/{globalProgress.heartPiecesTotal}
          </span>
          <span className="zelda-badge">
            Gold Skulltulas: {globalProgress.skulltulasCompleted}/{globalProgress.skulltulasTotal}
          </span>
          <span className="zelda-badge">Owned Gear Flags: {ownedGearCount}</span>
          <span className="zelda-badge" data-testid="backup-durable-storage-badge">
            {isStoragePersisted
              ? '✓ Persistent Phone Storage Protected'
              : '✓ Dual localStorage + IndexedDB Active'}
          </span>
        </div>
      </div>

      {/* Feedback Banner */}
      {feedback ? (
        <div
          role={feedback.kind === 'error' ? 'alert' : 'status'}
          data-testid={
            feedback.kind === 'error' ? 'backup-feedback-error' : 'backup-feedback-success'
          }
          className={`zelda-callout ${
            feedback.kind === 'error' ? 'zelda-callout--danger' : 'zelda-callout--emerald'
          }`}
        >
          <div className="zelda-callout__title">
            {feedback.kind === 'error' ? (
              <AlertTriangle size={15} aria-hidden="true" />
            ) : (
              <CheckCircle2 size={15} aria-hidden="true" />
            )}
            <span>{feedback.message}</span>
          </div>
        </div>
      ) : null}

      {/* 1. Export JSON Backup */}
      <section style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <h3 style={{ margin: 0, fontSize: 'var(--text-sm)', color: 'var(--color-triforce)' }}>
          1. Export Save Backup (.json)
        </h3>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button
            type="button"
            className="zelda-btn-primary"
            data-testid="backup-download-btn"
            onClick={handleDownloadJson}
          >
            <Download size={14} aria-hidden="true" />
            <span>Download JSON Backup</span>
          </button>

          <button
            type="button"
            className="zelda-cmd-btn"
            data-testid="backup-copy-btn"
            onClick={handleCopyJson}
          >
            <Copy size={14} aria-hidden="true" />
            <span>Copy JSON to Clipboard</span>
          </button>
        </div>
      </section>

      {/* 2. Import JSON Backup */}
      <section style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <h3 style={{ margin: 0, fontSize: 'var(--text-sm)', color: 'var(--color-triforce)' }}>
          2. Import / Restore Backup
        </h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <label className="zelda-cmd-btn" style={{ cursor: 'pointer' }}>
            <Upload size={14} aria-hidden="true" />
            <span>Choose .json Backup File</span>
            <input
              type="file"
              accept=".json,application/json"
              data-testid="backup-file-input"
              style={{ display: 'none' }}
              onChange={handleFileUpload}
            />
          </label>
          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
            or paste JSON payload below:
          </span>
        </div>

        <textarea
          className="zelda-backup-textarea"
          data-testid="backup-import-textarea"
          aria-label="Backup JSON text to import"
          placeholder='Paste exported {"app":"zelda-oot-switch2-pwa", ...} JSON here'
          value={importText}
          onChange={(e) => {
            setFeedback(null);
            setImportText(e.target.value);
          }}
        />

        <div>
          <button
            type="button"
            className="zelda-btn-primary"
            data-testid="backup-import-btn"
            onClick={() => runImport(importText)}
          >
            <Upload size={14} aria-hidden="true" />
            <span>Restore from Pasted JSON</span>
          </button>
        </div>
      </section>

      {/* 3. Reset All Progress (Explicit 2-Step Confirmation) */}
      <section
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '0.55rem',
          paddingTop: '0.6rem',
          borderTop: '1px solid var(--border-subtle)',
        }}
      >
        <h3
          style={{
            margin: 0,
            fontSize: 'var(--text-sm)',
            color: 'var(--color-locked-crimson-text)',
          }}
        >
          3. Danger Zone — Reset All Progress
        </h3>

        {!confirmingReset ? (
          <div>
            <button
              type="button"
              className="zelda-btn-danger"
              data-testid="backup-reset-step1-btn"
              onClick={() => setConfirmingReset(true)}
            >
              <RotateCcw size={14} aria-hidden="true" />
              <span>Reset All Progress...</span>
            </button>
          </div>
        ) : (
          <div
            className="zelda-callout zelda-callout--danger"
            data-testid="backup-reset-confirm-box"
            role="alert"
          >
            <div className="zelda-callout__title">
              <AlertTriangle size={15} aria-hidden="true" />
              <span>Are you sure? This erases all checked secrets, songs &amp; loadout flags!</span>
            </div>
            <p style={{ margin: 0 }}>
              Consider clicking <strong>Download JSON Backup</strong> first. This action cannot be
              undone unless you have a backup file.
            </p>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.25rem' }}>
              <button
                type="button"
                className="zelda-btn-danger"
                data-testid="backup-reset-confirm-btn"
                onClick={handleConfirmReset}
              >
                <RotateCcw size={14} aria-hidden="true" />
                <span>Yes, Erase All Progress</span>
              </button>
              <button
                type="button"
                className="zelda-cmd-btn"
                data-testid="backup-reset-cancel-btn"
                onClick={() => setConfirmingReset(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </section>
    </SheetDialog>
  );
}
