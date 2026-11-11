import { useEffect } from 'react';
import {
  Backpack,
  DatabaseBackup,
  Heart,
  Moon,
  Music,
  ScrollText,
  Search,
  Sparkles,
  Sun,
  Zap,
} from 'lucide-react';
import type {
  CompanionSheetId,
  EraFilter,
  GlobalProgressSummary,
  PlayerProgressState,
  ThemeMode,
} from '../../types/zelda';
import './sheets.css';

export interface TopCommandBarProps {
  state: PlayerProgressState;
  globalProgress: GlobalProgressSummary;
  activeSheet: CompanionSheetId | null;
  onOpenSheet: (sheet: CompanionSheetId) => void;
  onEraFilterChange: (era: EraFilter) => void;
  onSpotlightChange: (enabled: boolean) => void;
  onToggleTheme: (nextTheme: ThemeMode) => void;
  onToggleLoadoutDock: (nextOpen: boolean) => void;
  isLoadoutDockOpen: boolean;
}

const ERA_OPTIONS: ReadonlyArray<{ id: EraFilter; label: string }> = [
  { id: 'all', label: 'All' },
  { id: 'child', label: 'Child' },
  { id: 'adult', label: 'Adult' },
];

export function TopCommandBar({
  state,
  globalProgress,
  activeSheet,
  onOpenSheet,
  onEraFilterChange,
  onSpotlightChange,
  onToggleTheme,
  onToggleLoadoutDock,
  isLoadoutDockOpen,
}: TopCommandBarProps) {
  const isParchment = state.theme === 'parchment';
  const spotlightActive = Boolean(state.switch2SpotlightOnly);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        onOpenSheet('search');
        return;
      }

      if (event.key === '/' && !event.metaKey && !event.ctrlKey && !event.altKey) {
        const target = event.target as HTMLElement | null;
        const tag = target?.tagName;
        if (
          tag === 'INPUT' ||
          tag === 'TEXTAREA' ||
          tag === 'SELECT' ||
          target?.isContentEditable
        ) {
          return;
        }
        event.preventDefault();
        onOpenSheet('search');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onOpenSheet]);

  const handleThemeToggle = () => {
    const nextTheme: ThemeMode = isParchment ? 'dark' : 'parchment';
    if (typeof document !== 'undefined') {
      const metaScheme = document.querySelector('meta[name="color-scheme"]');
      if (metaScheme) {
        metaScheme.setAttribute('content', nextTheme === 'parchment' ? 'light' : 'dark');
      }
    }
    onToggleTheme(nextTheme);
  };

  return (
    <header className="zelda-topbar" role="banner" data-testid="top-command-bar">
      <div className="zelda-topbar__inner">
        {/* Brand Crest + Live 100% Global Progress Pill */}
        <div className="zelda-topbar__brand-cluster">
          <div className="zelda-brand">
            <span className="zelda-brand__crest" aria-hidden="true">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <polygon points="12,3 7,12 17,12" fill="var(--color-triforce)" />
                <polygon points="7,12 2,21 12,21" fill="var(--color-triforce)" />
                <polygon points="17,12 12,21 22,21" fill="var(--color-triforce)" />
              </svg>
            </span>
            <div className="zelda-brand__text">
              <span className="zelda-brand__title">Ocarina of Time</span>
              <span className="zelda-brand__edition">Switch 2 Companion</span>
            </div>
          </div>

          <div
            className={`zelda-progress-pill ${
              globalProgress.isComplete ? 'zelda-progress-pill--complete' : ''
            }`.trim()}
            data-testid="global-progress-pill"
            aria-label={`Global completion: ${globalProgress.completedCount} of ${globalProgress.totalCount} (${globalProgress.percent}%), Heart Pieces ${globalProgress.heartPiecesCompleted} of ${globalProgress.heartPiecesTotal}, Gold Skulltulas ${globalProgress.skulltulasCompleted} of ${globalProgress.skulltulasTotal}`}
          >
            <span className="zelda-progress-pill__main">
              {globalProgress.completedCount}/{globalProgress.totalCount} ({globalProgress.percent}%)
            </span>
            <span className="zelda-progress-pill__sep" aria-hidden="true">
              ·
            </span>
            <span className="zelda-progress-pill__stat" title="Pieces of Heart">
              <Heart size={12} aria-hidden="true" />
              {globalProgress.heartPiecesCompleted}/{globalProgress.heartPiecesTotal}
            </span>
            <span className="zelda-progress-pill__sep zelda-progress-pill__sub" aria-hidden="true">
              ·
            </span>
            <span className="zelda-progress-pill__stat" title="Gold Skulltulas">
              <span aria-hidden="true">🕷</span>
              {globalProgress.skulltulasCompleted}/{globalProgress.skulltulasTotal}
            </span>
          </div>
        </div>

        {/* Era Lens, Switch 2 Spotlight, Search, Companion Sheets, Loadout & Theme */}
        <div
          className="zelda-topbar__controls"
          role="toolbar"
          aria-label="Map filters and companion sheets"
        >
          <div className="zelda-era-segmented" role="group" aria-label="Era filter">
            {ERA_OPTIONS.map((opt) => (
              <button
                key={opt.id}
                type="button"
                className="zelda-era-segmented__btn"
                data-testid={`era-filter-${opt.id}`}
                aria-pressed={state.activeEraFilter === opt.id}
                onClick={() => onEraFilterChange(opt.id)}
              >
                {opt.label}
              </button>
            ))}
          </div>

          <button
            type="button"
            className="zelda-cmd-btn zelda-cmd-btn--spotlight"
            data-testid="spotlight-toggle-btn"
            aria-pressed={spotlightActive}
            title="Show only New & Updated Switch 2 Remake secrets"
            onClick={() => onSpotlightChange(!spotlightActive)}
          >
            <Sparkles size={14} aria-hidden="true" />
            <span className="zelda-cmd-btn__label">Switch 2</span>
          </button>

          <button
            type="button"
            className="zelda-cmd-btn"
            data-testid="open-search-btn"
            aria-pressed={activeSheet === 'search'}
            aria-label="Search secrets, regions, and items (Cmd+K or /)"
            title="Global Search (Cmd+K or /)"
            onClick={() => onOpenSheet('search')}
          >
            <Search size={14} aria-hidden="true" />
            <span className="zelda-cmd-btn__label">Search</span>
            <kbd className="zelda-cmd-btn__kbd" aria-hidden="true">
              ⌘K
            </kbd>
          </button>

          <div className="zelda-topbar__sheets-group" role="group" aria-label="Companion sheets">
            <button
              type="button"
              className="zelda-cmd-btn"
              data-testid="open-ocarina-btn"
              aria-pressed={activeSheet === 'ocarina'}
              aria-label="Open Ocarina Songbook and Scarecrow Notepad"
              title="Ocarina Songbook (Y/X/A/R/L)"
              onClick={() => onOpenSheet('ocarina')}
            >
              <Music size={14} aria-hidden="true" />
              <span className="zelda-cmd-btn__label">Songs</span>
            </button>

            <button
              type="button"
              className="zelda-cmd-btn"
              data-testid="open-quests-btn"
              aria-pressed={activeSheet === 'quests'}
              aria-label="Open Biggoron's Sword and Happy Mask Quest Trackers"
              title="Quest Chains (Biggoron & Happy Masks)"
              onClick={() => onOpenSheet('quests')}
            >
              <ScrollText size={14} aria-hidden="true" />
              <span className="zelda-cmd-btn__label">Quests</span>
            </button>

            <button
              type="button"
              className="zelda-cmd-btn"
              data-testid="open-diff-btn"
              aria-pressed={activeSheet === 'diff'}
              aria-label="Open Switch 2 Remake Changes and Economy Sheet"
              title="Switch 2 Diff, Bottles, Fairies & Hall of Fallen Foes"
              onClick={() => onOpenSheet('diff')}
            >
              <Zap size={14} aria-hidden="true" />
              <span className="zelda-cmd-btn__label zelda-cmd-btn__label--hide-tablet">
                SW2 Diff
              </span>
            </button>

            <button
              type="button"
              className="zelda-cmd-btn"
              data-testid="open-backup-btn"
              aria-pressed={activeSheet === 'backup'}
              aria-label="Open Backup Export, Import, and Reset"
              title="Backup, Restore & Reset Progress"
              onClick={() => onOpenSheet('backup')}
            >
              <DatabaseBackup size={14} aria-hidden="true" />
              <span className="zelda-cmd-btn__label zelda-cmd-btn__label--hide-tablet">
                Backup
              </span>
            </button>
          </div>

          <button
            type="button"
            className="zelda-cmd-btn zelda-cmd-btn--loadout"
            data-testid="toggle-loadout-btn"
            aria-expanded={isLoadoutDockOpen}
            aria-label="Toggle My Loadout and Story Presets dock"
            title="My Loadout & Story Checkpoint Presets"
            onClick={() => onToggleLoadoutDock(!isLoadoutDockOpen)}
          >
            <Backpack size={14} aria-hidden="true" />
            <span className="zelda-cmd-btn__label">Loadout</span>
          </button>

          <button
            type="button"
            className="zelda-cmd-btn"
            data-testid="theme-toggle-btn"
            aria-pressed={isParchment}
            aria-label={
              isParchment
                ? 'Switch to Sheikah Twilight dark theme'
                : 'Switch to Hyrule Parchment light theme'
            }
            title={isParchment ? 'Theme: Hyrule Parchment (Light)' : 'Theme: Sheikah Slate (Dark)'}
            onClick={handleThemeToggle}
          >
            {isParchment ? (
              <Moon size={14} aria-hidden="true" />
            ) : (
              <Sun size={14} aria-hidden="true" />
            )}
            <span className="zelda-cmd-btn__label zelda-cmd-btn__label--hide-tablet">
              {isParchment ? 'Dark' : 'Parchment'}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}
