import { useEffect, useRef } from 'react';
import {
  Backpack,
  BookOpen,
  ChevronDown,
  Compass,
  DatabaseBackup,
  Flag,
  Layers,
  Map as MapIcon,
  Moon,
  Music,
  ScrollText,
  Search,
  Sun,
  Swords,
  Zap,
} from 'lucide-react';
import { HALL_OF_FALLEN_FOES_STATUES, METADATA } from '../../data';
import type {
  CompanionSheetId,
  EraFilter,
  GlobalProgressSummary,
  PlayerProgressState,
  ThemeMode,
  WorkspaceViewMode,
} from '../../types/zelda';
import './sheets.css';

export type ExtendedWorkspaceViewMode = WorkspaceViewMode | 'area';

export interface ExtendedGlobalProgressFields {
  bossHeartsCompleted?: number;
  bossHeartsTotal?: number;
  currentHeartContainers?: number;
  heartPieceQuarterRemainder?: number;
}

export interface TopCommandBarProps {
  state: PlayerProgressState;
  globalProgress: GlobalProgressSummary;
  activeSheet: CompanionSheetId | null;
  onOpenSheet: (sheet: CompanionSheetId) => void;
  /** Kept optional for pre-integration caller compatibility; Era filters live in HyruleMapCanvas. */
  onEraFilterChange?: (era: EraFilter) => void;
  /** Kept optional for pre-integration caller compatibility; Switch 2 Spotlight lives in HyruleMapCanvas. */
  onSpotlightChange?: (enabled: boolean) => void;
  onToggleTheme: (nextTheme: ThemeMode) => void;
  onToggleLoadoutDock?: (nextOpen: boolean) => void;
  isLoadoutDockOpen?: boolean;
  onOpenInventory?: () => void;
  isInventoryOpen?: boolean;
  onOpenCatchUp?: () => void;
  isCatchUpOpen?: boolean;
  activeView?: ExtendedWorkspaceViewMode | string;
  onViewModeChange?:
    | ((view: WorkspaceViewMode) => void)
    | ((view: ExtendedWorkspaceViewMode) => void);
  showAreaViewOption?: boolean;
}

export function deriveHeartMeterStats(globalProgress: GlobalProgressSummary): {
  containers: number;
  quarterRemainder: number;
} {
  const ext = globalProgress as GlobalProgressSummary & ExtendedGlobalProgressFields;
  const fallbackContainers =
    3 + (ext.bossHeartsCompleted ?? 0) + Math.floor(globalProgress.heartPiecesCompleted / 4);
  const rawContainers = ext.currentHeartContainers ?? fallbackContainers;
  const containers = Math.min(20, Math.max(3, rawContainers));
  const quarterRemainder =
    ext.heartPieceQuarterRemainder ?? globalProgress.heartPiecesCompleted % 4;
  return { containers, quarterRemainder };
}

export function TopCommandBar({
  state,
  globalProgress,
  activeSheet,
  onOpenSheet,
  onToggleTheme,
  onToggleLoadoutDock,
  isLoadoutDockOpen = false,
  onOpenInventory,
  isInventoryOpen = false,
  onOpenCatchUp,
  isCatchUpOpen = false,
  activeView = 'map',
  onViewModeChange,
  showAreaViewOption = false,
}: TopCommandBarProps) {
  const isParchment = state.theme === 'parchment';
  const refMenuDetailsRef = useRef<HTMLDetailsElement | null>(null);
  const { containers: heartContainers, quarterRemainder } = deriveHeartMeterStats(globalProgress);

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

      if (event.key === 'Escape' && refMenuDetailsRef.current?.open) {
        refMenuDetailsRef.current.open = false;
      }
    };

    const handlePointerDownOutside = (event: PointerEvent) => {
      const menu = refMenuDetailsRef.current;
      if (!menu?.open) return;
      if (event.target instanceof Node && !menu.contains(event.target)) {
        menu.open = false;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('pointerdown', handlePointerDownOutside);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('pointerdown', handlePointerDownOutside);
    };
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

  const handleOpenSheetFromMenu = (sheet: CompanionSheetId) => {
    if (refMenuDetailsRef.current) {
      refMenuDetailsRef.current.open = false;
    }
    onOpenSheet(sheet);
  };

  const handleInventoryClick = () => {
    if (onOpenInventory) {
      onOpenInventory();
      return;
    }
    onToggleLoadoutDock?.(!isLoadoutDockOpen);
  };

  const handleCatchUpClick = () => {
    if (onOpenCatchUp) {
      onOpenCatchUp();
      return;
    }
    onToggleLoadoutDock?.(true);
  };

  const loggedFoesCount = HALL_OF_FALLEN_FOES_STATUES.reduce(
    (acc, statue) => acc + (state.completedFoeStatueIds?.[statue.id] ? 1 : 0),
    0,
  );
  const totalFoesCount = METADATA.expectedCounts.hallOfFallenFoesStatues;

  const hasActiveRefSheet =
    activeSheet === 'ocarina' ||
    activeSheet === 'quests' ||
    activeSheet === 'foes' ||
    activeSheet === 'reference' ||
    activeSheet === 'diff' ||
    activeSheet === 'backup';

  // Render up to 10 visible crimson ♥ glyphs inline so compact viewports never wrap
  const displayedHeartGlyphs = '♥'.repeat(Math.min(heartContainers, 10));

  return (
    <header className="zelda-topbar" role="banner" data-testid="top-command-bar">
      <div className="zelda-topbar__inner">
        {/* Brand Crest + Live Heart Meter + Skulltula & Global Completion Pill */}
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
            aria-label={`Live life & completion: ${heartContainers} Heart Containers${
              quarterRemainder > 0 ? ` plus ${quarterRemainder}/4 Piece of Heart` : ''
            }, Gold Skulltulas ${globalProgress.skulltulasCompleted} of ${
              globalProgress.skulltulasTotal
            }, ${globalProgress.completedCount} of ${globalProgress.totalCount} secrets (${
              globalProgress.percent
            }%)`}
          >
            <span
              className="zelda-heart-meter"
              data-testid="heart-meter-pill"
              title={`${heartContainers} Heart Containers (${globalProgress.heartPiecesCompleted}/${globalProgress.heartPiecesTotal} Pieces of Heart)`}
            >
              <span className="zelda-heart-meter__hearts" aria-hidden="true">
                {displayedHeartGlyphs}
              </span>
              <span className="zelda-heart-meter__count">{heartContainers}</span>
              {quarterRemainder > 0 && (
                <span
                  className="zelda-heart-meter__quarter"
                  data-testid="heart-quarter-indicator"
                  title={`${quarterRemainder}/4 toward next Heart Container`}
                >
                  +{quarterRemainder}/4
                </span>
              )}
            </span>

            <span className="zelda-progress-pill__sep" aria-hidden="true">
              ·
            </span>

            <span className="zelda-progress-pill__stat" title="Gold Skulltulas">
              <span aria-hidden="true">🕷</span>
              {globalProgress.skulltulasCompleted}/{globalProgress.skulltulasTotal}
            </span>

            <span className="zelda-progress-pill__sep zelda-progress-pill__sub" aria-hidden="true">
              ·
            </span>

            <span className="zelda-progress-pill__main">
              {globalProgress.completedCount}/{globalProgress.totalCount} ({globalProgress.percent}%)
            </span>
          </div>
        </div>

        {/* De-duplicated Controls: View Switcher, My Inventory, Catch Up, Consolidated Reference, Search, Theme */}
        <div
          className="zelda-topbar__controls"
          role="toolbar"
          aria-label="Guide workspace, inventory, and reference tools"
        >
          {onViewModeChange && (
            <div
              className="zelda-view-segmented"
              data-testid="workspace-view-switcher"
              role="group"
              aria-label="Primary guide view"
            >
              <button
                type="button"
                className="zelda-view-segmented__btn"
                data-testid="view-mode-map"
                aria-pressed={activeView === 'map'}
                onClick={() => onViewModeChange('map')}
              >
                <MapIcon size={13} aria-hidden="true" />
                <span>World Map</span>
              </button>

              {(showAreaViewOption || activeView === 'area') && (
                <button
                  type="button"
                  className="zelda-view-segmented__btn"
                  data-testid="view-mode-area"
                  aria-pressed={activeView === 'area'}
                  onClick={() =>
                    (onViewModeChange as (view: ExtendedWorkspaceViewMode) => void)('area')
                  }
                >
                  <Layers size={13} aria-hidden="true" />
                  <span>Area Co-Pilot</span>
                </button>
              )}

              <button
                type="button"
                className="zelda-view-segmented__btn"
                data-testid="view-mode-route"
                aria-pressed={activeView === 'route'}
                onClick={() => onViewModeChange('route')}
              >
                <Compass size={13} aria-hidden="true" />
                <span>Optimal Route</span>
              </button>
            </div>
          )}

          <button
            type="button"
            className="zelda-cmd-btn zelda-cmd-btn--loadout"
            data-testid="open-inventory-btn"
            aria-pressed={isInventoryOpen || (!onOpenInventory && isLoadoutDockOpen)}
            aria-label="Open My Inventory Pause Subscreen (Items, Equipment, Songs & Medallions)"
            title="My Inventory — Items, Equipment, Songs & Medallions"
            onClick={handleInventoryClick}
          >
            <Backpack size={14} aria-hidden="true" />
            <span className="zelda-cmd-btn__label">My Inventory</span>
          </button>

          <button
            type="button"
            className="zelda-cmd-btn zelda-cmd-btn--catchup"
            data-testid="open-catchup-btn"
            aria-pressed={isCatchUpOpen}
            aria-label="Sync playthrough or jump to a story checkpoint"
            title="Catch Up / Story Checkpoint Sync"
            onClick={handleCatchUpClick}
          >
            <Flag size={14} aria-hidden="true" />
            <span className="zelda-cmd-btn__label">Catch Up</span>
          </button>

          {/* Consolidated Reference Menu (Ocarina, Quests, Switch 2 Changes, Backup) */}
          <details
            ref={refMenuDetailsRef}
            className="zelda-ref-menu"
            data-testid="reference-menu"
          >
            <summary
              className={`zelda-cmd-btn zelda-ref-menu__summary${
                hasActiveRefSheet ? ' is-active-sheet' : ''
              }`}
              data-testid="open-reference-menu-btn"
              aria-label="Reference sheets: Ocarina Songbook, Quests, Hall of Fallen Foes, Field Guide, Switch 2 Changes, and Backup"
            >
              <BookOpen size={14} aria-hidden="true" />
              <span className="zelda-cmd-btn__label">Reference</span>
              <ChevronDown size={13} className="zelda-ref-menu__chevron" aria-hidden="true" />
            </summary>

            <div
              className="zelda-ref-menu__panel"
              role="group"
              aria-label="Companion reference sheets"
            >
              <button
                type="button"
                className="zelda-ref-menu__item"
                data-testid="open-ocarina-btn"
                aria-pressed={activeSheet === 'ocarina'}
                onClick={() => handleOpenSheetFromMenu('ocarina')}
              >
                <Music size={14} aria-hidden="true" />
                <div>
                  <strong>Ocarina Songbook</strong>
                  <span>All 13 Switch 2 button melodies &amp; Scarecrow notepad</span>
                </div>
              </button>

              <button
                type="button"
                className="zelda-ref-menu__item"
                data-testid="open-quests-btn"
                aria-pressed={activeSheet === 'quests'}
                onClick={() => handleOpenSheetFromMenu('quests')}
              >
                <ScrollText size={14} aria-hidden="true" />
                <div>
                  <strong>Side Quests</strong>
                  <span>Threads of Time (6), Biggoron&apos;s Sword &amp; Happy Mask chains</span>
                </div>
              </button>

              <button
                type="button"
                className="zelda-ref-menu__item"
                data-testid="open-foes-btn"
                aria-pressed={activeSheet === 'foes'}
                onClick={() => handleOpenSheetFromMenu('foes')}
              >
                <Swords size={14} aria-hidden="true" />
                <div>
                  <strong>
                    Hall of Fallen Foes ({loggedFoesCount}/{totalFoesCount})
                  </strong>
                  <span>84-statue Switch 2 bestiary, straggler tips &amp; Boss Rush medals</span>
                </div>
              </button>

              <button
                type="button"
                className="zelda-ref-menu__item"
                data-testid="open-reference-btn"
                aria-pressed={activeSheet === 'reference'}
                onClick={() => handleOpenSheetFromMenu('reference')}
              >
                <Compass size={14} aria-hidden="true" />
                <div>
                  <strong>Field Guide (Grottos, Pierre &amp; Fishing)</strong>
                  <span>Scarecrow spots, Echo Gem grottos, Hylian Loach &amp; free gear</span>
                </div>
              </button>

              <button
                type="button"
                className="zelda-ref-menu__item"
                data-testid="open-diff-btn"
                aria-pressed={activeSheet === 'diff'}
                onClick={() => handleOpenSheetFromMenu('diff')}
              >
                <Zap size={14} aria-hidden="true" />
                <div>
                  <strong>Switch 2 Changes</strong>
                  <span>Remake differences, Bottles, Great Fairies &amp; Hall of Fallen Foes</span>
                </div>
              </button>

              <button
                type="button"
                className="zelda-ref-menu__item"
                data-testid="open-backup-btn"
                aria-pressed={activeSheet === 'backup'}
                onClick={() => handleOpenSheetFromMenu('backup')}
              >
                <DatabaseBackup size={14} aria-hidden="true" />
                <div>
                  <strong>Backup &amp; Save Data</strong>
                  <span>Export JSON save, import backup, or reset playthrough</span>
                </div>
              </button>
            </div>
          </details>

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
