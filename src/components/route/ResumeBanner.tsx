import { useState } from 'react';
import { Bookmark, Clock, Compass, MapPin, Play, X } from 'lucide-react';
import { REGION_BY_ID } from '../../data';
import type { PlayerProgressState, RouteChapter, RouteStep } from '../../types/zelda';

export interface ResumeTarget {
  chapter: RouteChapter;
  step: RouteStep;
  isPinned: boolean;
}

export interface ResumeBannerProps {
  state: PlayerProgressState;
  chapters: RouteChapter[];
  onResumeRoute: (chapterId: string, stepId: string) => void;
  onOpenRegionOnMap: (regionId: string) => void;
}

export function isRouteStepComplete(step: RouteStep, state: PlayerProgressState): boolean {
  if (state.completedRouteStepIds?.[step.id]) {
    return true;
  }
  if (step.secretIds.length > 0) {
    return step.secretIds.every((id) => Boolean(state.completedSecretIds[id]));
  }
  return false;
}

export function findNextResumeTarget(
  state: PlayerProgressState,
  chapters: RouteChapter[],
): ResumeTarget | null {
  if (chapters.length === 0) return null;

  // 1. Explicit user-pinned step takes top priority
  if (state.bookmarkedRouteStepId) {
    for (const chapter of chapters) {
      const match = chapter.steps.find((s) => s.id === state.bookmarkedRouteStepId);
      if (match) {
        return { chapter, step: match, isPinned: true };
      }
    }
  }

  // 2. Earliest unfinished step inside the user's active chapter (if set)
  if (state.activeRouteChapterId) {
    const activeChapter = chapters.find((c) => c.id === state.activeRouteChapterId);
    if (activeChapter) {
      const nextInActive = activeChapter.steps.find((s) => !isRouteStepComplete(s, state));
      if (nextInActive) {
        return { chapter: activeChapter, step: nextInActive, isPinned: false };
      }
    }
  }

  // 3. Earliest unfinished step across all 18 optimal route chapters
  for (const chapter of chapters) {
    const nextStep = chapter.steps.find((s) => !isRouteStepComplete(s, state));
    if (nextStep) {
      return { chapter, step: nextStep, isPinned: false };
    }
  }

  return null;
}

function formatRelativeTimestamp(iso: string): string {
  const parsed = Date.parse(iso);
  if (Number.isNaN(parsed)) return 'recently';
  const diffSec = Math.max(0, Math.floor((Date.now() - parsed) / 1000));
  if (diffSec < 45) return 'just now';
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDays = Math.floor(diffHr / 24);
  if (diffDays < 30) return `${diffDays}d ago`;
  return new Date(parsed).toLocaleDateString();
}

export function ResumeBanner({
  state,
  chapters,
  onResumeRoute,
  onOpenRegionOnMap,
}: ResumeBannerProps) {
  const [dismissedForSession, setDismissedForSession] = useState(false);

  const hasSavedActivity =
    Object.keys(state.completedSecretIds).length > 0 ||
    Object.keys(state.completedRouteStepIds ?? {}).length > 0 ||
    Boolean(state.bookmarkedRouteStepId) ||
    Boolean(state.lastSession);

  if (!hasSavedActivity || dismissedForSession) {
    return null;
  }

  const target = findNextResumeTarget(state, chapters);
  if (!target) {
    return null;
  }

  const targetRegionName = REGION_BY_ID[target.step.regionId]?.name ?? target.step.regionId;
  const lastSession = state.lastSession;

  return (
    <aside
      className="zelda-resume-banner"
      data-testid="resume-banner"
      aria-label="Pick up where you left off"
    >
      <div className="zelda-resume-banner__info">
        <div className="zelda-resume-banner__eyebrow">
          {target.isPinned ? (
            <span className="zelda-resume-pill zelda-resume-pill--pinned">
              <Bookmark size={11} aria-hidden="true" />
              Pinned Checkpoint
            </span>
          ) : (
            <span className="zelda-resume-pill">
              <Compass size={11} aria-hidden="true" />
              Pick Up Where You Left Off
            </span>
          )}

          {lastSession && (
            <span className="zelda-resume-last" data-testid="resume-last-activity">
              <Clock size={11} aria-hidden="true" />
              <span>
                {formatRelativeTimestamp(lastSession.updatedAt)} · {lastSession.lastActionLabel}
              </span>
            </span>
          )}
        </div>

        <div className="zelda-resume-banner__headline">
          <span className="zelda-resume-banner__chapter">
            Ch. {target.chapter.number}: {target.chapter.title}
          </span>
          <span className="zelda-resume-banner__sep" aria-hidden="true">
            →
          </span>
          <strong className="zelda-resume-banner__step">{target.step.title}</strong>
          <span className="zelda-resume-banner__region">({targetRegionName})</span>
        </div>
      </div>

      <div className="zelda-resume-banner__actions">
        <button
          type="button"
          className="zelda-resume-btn zelda-resume-btn--primary"
          data-testid="resume-continue-route-btn"
          onClick={() => onResumeRoute(target.chapter.id, target.step.id)}
        >
          <Play size={12} aria-hidden="true" />
          <span>Continue Guide</span>
        </button>

        <button
          type="button"
          className="zelda-resume-btn"
          data-testid="resume-open-map-btn"
          onClick={() => onOpenRegionOnMap(target.step.regionId)}
        >
          <MapPin size={12} aria-hidden="true" />
          <span>Area on Map</span>
        </button>

        <button
          type="button"
          className="zelda-resume-dismiss"
          data-testid="resume-dismiss-btn"
          aria-label="Hide resume banner for this session"
          onClick={() => setDismissedForSession(true)}
        >
          <X size={14} aria-hidden="true" />
        </button>
      </div>
    </aside>
  );
}
