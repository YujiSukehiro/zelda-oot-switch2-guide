import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Bookmark,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Compass,
  Filter,
  MapPin,
  Music,
  Sparkles,
} from 'lucide-react';
import { REGION_BY_ID, SECRET_BY_ID } from '../../data';
import type { RouteStepSessionMeta } from '../../lib/storage';
import type { PlayerProgressState, RouteChapter, RouteStep, UnifiedSecret } from '../../types/zelda';
import { NoteSequence } from '../sheets/NoteBadge';
import { findNextResumeTarget, isRouteStepComplete } from './ResumeBanner';
import './route.css';

export interface OptimalRouteViewProps {
  chapters: RouteChapter[];
  state: PlayerProgressState;
  activeChapterId: string | null;
  highlightedStepId?: string | null;
  onSelectChapter: (chapterId: string) => void;
  onToggleRouteStep: (stepId: string, meta?: RouteStepSessionMeta, completed?: boolean) => void;
  onBookmarkStep: (stepId: string | null, meta?: RouteStepSessionMeta) => void;
  onToggleSecret: (secretId: string, completed?: boolean) => void;
  onOpenRegionOnMap: (regionId: string) => void;
  onOpenSongbook?: (songId?: string) => void;
}

interface ChapterStats {
  completedSteps: number;
  totalSteps: number;
  completedSecrets: number;
  totalSecrets: number;
  percent: number;
  isComplete: boolean;
}

function computeChapterStats(chapter: RouteChapter, state: PlayerProgressState): ChapterStats {
  const totalSteps = chapter.steps.length;
  let completedSteps = 0;
  const uniqueSecretIds = new Set<string>();

  for (const step of chapter.steps) {
    if (isRouteStepComplete(step, state)) {
      completedSteps += 1;
    }
    for (const secId of step.secretIds) {
      if (SECRET_BY_ID[secId]) {
        uniqueSecretIds.add(secId);
      }
    }
  }

  let completedSecrets = 0;
  for (const secId of uniqueSecretIds) {
    if (state.completedSecretIds[secId]) {
      completedSecrets += 1;
    }
  }

  const totalSecrets = uniqueSecretIds.size;
  const denom = totalSteps + totalSecrets;
  const numer = completedSteps + completedSecrets;
  const percent = denom > 0 ? Math.round((numer / denom) * 100) : 0;
  const isComplete =
    totalSteps > 0 && completedSteps === totalSteps && completedSecrets === totalSecrets;

  return {
    completedSteps,
    totalSteps,
    completedSecrets,
    totalSecrets,
    percent,
    isComplete,
  };
}

const CATEGORY_SHORT_LABELS: Record<string, string> = {
  'heart-piece': 'Heart Piece',
  'gold-skulltula': 'Skulltula',
  bottle: 'Bottle',
  'great-fairy': 'Great Fairy',
  'capacity-upgrade': 'Upgrade',
  equipment: 'Gear',
  'skulltula-reward': 'Token Reward',
  'ocarina-song': 'Song',
  'magic-bean': 'Magic Bean',
  'mask-trade': 'Happy Mask',
  'biggoron-step': 'Biggoron',
  'cow-or-grotto': 'Cow/Grotto',
  'big-poe': 'Big Poe',
  'switch2-exclusive': 'Switch 2',
};

export function OptimalRouteView({
  chapters,
  state,
  activeChapterId,
  highlightedStepId,
  onSelectChapter,
  onToggleRouteStep,
  onBookmarkStep,
  onToggleSecret,
  onOpenRegionOnMap,
  onOpenSongbook,
}: OptimalRouteViewProps) {
  const [showRemainingOnly, setShowRemainingOnly] = useState<boolean>(false);
  const [settledAnnouncement, setSettledAnnouncement] = useState<string>('');

  const trackRef = useRef<HTMLDivElement | null>(null);
  const cardRefs = useRef<Record<string, HTMLElement | null>>({});
  const stepRefs = useRef<Record<string, HTMLElement | null>>({});

  const chapterStatsMap = useMemo(() => {
    const map: Record<string, ChapterStats> = {};
    for (const ch of chapters) {
      map[ch.id] = computeChapterStats(ch, state);
    }
    return map;
  }, [chapters, state]);

  const resumeTarget = useMemo(
    () => findNextResumeTarget(state, chapters),
    [chapters, state],
  );

  const resolvedChapter: RouteChapter | undefined = useMemo(() => {
    if (activeChapterId) {
      const found = chapters.find((c) => c.id === activeChapterId);
      if (found) return found;
    }
    if (state.activeRouteChapterId) {
      const fromState = chapters.find((c) => c.id === state.activeRouteChapterId);
      if (fromState) return fromState;
    }
    if (resumeTarget) {
      return resumeTarget.chapter;
    }
    return chapters[0];
  }, [activeChapterId, chapters, resumeTarget, state.activeRouteChapterId]);

  const activeIndex = useMemo(() => {
    if (!resolvedChapter) return 0;
    const idx = chapters.findIndex((c) => c.id === resolvedChapter.id);
    return idx >= 0 ? idx : 0;
  }, [chapters, resolvedChapter]);

  // Center the active chapter card inside the horizontal carousel track without scrolling the page
  const scrollChapterCardIntoTrack = useCallback((chapterId: string, instant = false) => {
    const track = trackRef.current;
    const card = cardRefs.current[chapterId];
    if (!track || !card || typeof track.scrollTo !== 'function') return;

    const prefersReduced =
      typeof window !== 'undefined' &&
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const targetLeft =
      card.offsetLeft - Math.max(0, (track.clientWidth - card.offsetWidth) / 2);

    track.scrollTo({
      left: Math.max(0, targetLeft),
      behavior: instant || prefersReduced ? 'auto' : 'smooth',
    });
  }, []);

  useEffect(() => {
    if (!resolvedChapter) return;
    scrollChapterCardIntoTrack(resolvedChapter.id);
  }, [resolvedChapter, scrollChapterCardIntoTrack]);

  // Scroll highlighted step card into view when resuming from banner
  useEffect(() => {
    if (!highlightedStepId) return;
    const stepEl = stepRefs.current[highlightedStepId];
    if (stepEl && typeof stepEl.scrollIntoView === 'function') {
      stepEl.scrollIntoView({ block: 'center', behavior: 'smooth' });
    }
  }, [highlightedStepId, resolvedChapter]);

  // Announce settled slide position for assistive technologies (modern-web-guidance: carousel)
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return undefined;

    let debounceTimer: number | undefined;
    const onSettle = () => {
      if (!resolvedChapter) return;
      setSettledAnnouncement(
        `Chapter ${resolvedChapter.number} of ${chapters.length}: ${resolvedChapter.title}`,
      );
    };

    const handleScroll = () => {
      if (debounceTimer !== undefined) {
        window.clearTimeout(debounceTimer);
      }
      debounceTimer = window.setTimeout(onSettle, 140);
    };

    track.addEventListener('scrollend', onSettle);
    track.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      track.removeEventListener('scrollend', onSettle);
      track.removeEventListener('scroll', handleScroll);
      if (debounceTimer !== undefined) {
        window.clearTimeout(debounceTimer);
      }
    };
  }, [chapters.length, resolvedChapter]);

  if (!resolvedChapter) {
    return null;
  }

  const activeStats = chapterStatsMap[resolvedChapter.id];
  const totalRouteSteps = chapters.reduce((acc, c) => acc + c.steps.length, 0);
  const completedRouteSteps = chapters.reduce(
    (acc, c) => acc + (chapterStatsMap[c.id]?.completedSteps ?? 0),
    0,
  );

  const handleStepAdjacentChapter = (delta: -1 | 1) => {
    if (chapters.length === 0) return;
    const nextIdx = (activeIndex + delta + chapters.length) % chapters.length;
    const target = chapters[nextIdx];
    if (target) {
      onSelectChapter(target.id);
    }
  };

  const handleJumpToNextUnfinished = () => {
    if (!resumeTarget) return;
    onSelectChapter(resumeTarget.chapter.id);
    window.setTimeout(() => {
      const el = stepRefs.current[resumeTarget.step.id];
      el?.scrollIntoView?.({ block: 'center', behavior: 'smooth' });
    }, 60);
  };

  const handleCheckAllStepItems = (step: RouteStep, targetCompleted: boolean) => {
    for (const secId of step.secretIds) {
      if (SECRET_BY_ID[secId]) {
        onToggleSecret(secId, targetCompleted);
      }
    }
    onToggleRouteStep(
      step.id,
      {
        label: step.title,
        regionId: step.regionId,
        chapterId: resolvedChapter.id,
      },
      targetCompleted,
    );
  };

  const visibleSteps = showRemainingOnly
    ? resolvedChapter.steps.filter((s) => !isRouteStepComplete(s, state))
    : resolvedChapter.steps;

  const primaryRegionName =
    REGION_BY_ID[resolvedChapter.primaryRegionId]?.name ?? resolvedChapter.primaryRegionId;

  return (
    <div className="optimal-route-shell" data-testid="optimal-route-view">
      {/* Horizontal 18-Chapter Scroll-Snap Carousel (modern-web-guidance: carousel) */}
      <section
        className="route-carousel-section"
        aria-roledescription="carousel"
        aria-label="100% Optimal Playthrough Chapters"
      >
        <div className="route-carousel-header">
          <div className="route-carousel-title-group">
            <span className="route-carousel-kicker">
              <Compass size={14} aria-hidden="true" />
              <span>100% Optimal Playthrough Route</span>
            </span>
            <span className="route-carousel-overall-pill" data-testid="route-overall-progress">
              {completedRouteSteps}/{totalRouteSteps} Route Steps Completed
            </span>
          </div>

          <div className="route-carousel-controls">
            {resumeTarget && (
              <button
                type="button"
                className="route-jump-next-btn"
                data-testid="route-jump-unfinished-btn"
                onClick={handleJumpToNextUnfinished}
              >
                <span>
                  Up Next: Ch. {resumeTarget.chapter.number}
                </span>
              </button>
            )}

            <button
              type="button"
              className="route-nav-btn"
              data-testid="route-prev-chapter-btn"
              aria-label="Previous chapter"
              onClick={() => handleStepAdjacentChapter(-1)}
            >
              <ChevronLeft size={16} aria-hidden="true" />
              <span className="route-nav-btn__text">Prev</span>
            </button>
            <button
              type="button"
              className="route-nav-btn"
              data-testid="route-next-chapter-btn"
              aria-label="Next chapter"
              onClick={() => handleStepAdjacentChapter(1)}
            >
              <span className="route-nav-btn__text">Next</span>
              <ChevronRight size={16} aria-hidden="true" />
            </button>
          </div>
        </div>

        <div
          ref={trackRef}
          className="route-carousel-track"
          data-testid="route-carousel-track"
          role="group"
          aria-label="Walkthrough chapters"
        >
          {chapters.map((ch) => {
            const stats = chapterStatsMap[ch.id];
            const isSelected = ch.id === resolvedChapter.id;
            const isUpNext = resumeTarget?.chapter.id === ch.id && !stats.isComplete;

            return (
              <article
                key={ch.id}
                ref={(el) => {
                  cardRefs.current[ch.id] = el;
                }}
                role="group"
                aria-roledescription="slide"
                aria-label={`${ch.number} of ${chapters.length}: ${ch.title}`}
                data-testid={`route-chapter-card-${ch.id}`}
                className={`route-chapter-slide${isSelected ? ' is-selected' : ''}${
                  stats.isComplete ? ' is-complete' : ''
                }`}
              >
                <button
                  type="button"
                  className="route-chapter-slide__btn"
                  aria-pressed={isSelected}
                  onClick={() => onSelectChapter(ch.id)}
                >
                  <div className="route-chapter-slide__top">
                    <span className="route-chapter-slide__num">Ch. {ch.number}</span>
                    <div className="route-chapter-slide__badges">
                      <span className={`route-era-pill is-${ch.era}`}>
                        {ch.era === 'cross-era'
                          ? 'Cross-Era'
                          : ch.era === 'child'
                            ? 'Child'
                            : 'Adult'}
                      </span>
                      {isUpNext && <span className="route-upnext-pill">Up Next</span>}
                      {stats.isComplete && (
                        <span className="route-complete-pill">
                          <CheckCircle2 size={11} aria-hidden="true" />
                          Done
                        </span>
                      )}
                    </div>
                  </div>

                  <h3 className="route-chapter-slide__title">{ch.title}</h3>
                  <p className="route-chapter-slide__subtitle">{ch.subtitle}</p>

                  <div className="route-chapter-slide__footer">
                    <span className="route-chapter-slide__stat">
                      {stats.completedSteps}/{stats.totalSteps} steps · {stats.completedSecrets}/
                      {stats.totalSecrets} secrets
                    </span>
                    <span className="route-chapter-slide__pct">{stats.percent}%</span>
                  </div>

                  <div className="route-chapter-slide__bar" aria-hidden="true">
                    <div
                      className="route-chapter-slide__bar-fill"
                      style={{ width: `${stats.percent}%` }}
                    />
                  </div>
                </button>
              </article>
            );
          })}
        </div>

        <p className="sr-only" role="status" aria-live="polite">
          {settledAnnouncement}
        </p>

        <nav className="route-carousel-markers" aria-label="Choose a chapter">
          {chapters.map((ch) => {
            const stats = chapterStatsMap[ch.id];
            const isCurrent = ch.id === resolvedChapter.id;
            return (
              <button
                key={ch.id}
                type="button"
                className={`route-marker-dot${stats.isComplete ? ' is-complete' : ''}`}
                data-testid={`route-marker-${ch.id}`}
                aria-current={isCurrent ? 'true' : undefined}
                aria-label={`Go to Chapter ${ch.number}: ${ch.title}`}
                onClick={() => onSelectChapter(ch.id)}
              >
                {ch.number}
              </button>
            );
          })}
        </nav>
      </section>

      {/* Active Chapter Step-by-Step Guide & Shared Collectible Checklist */}
      <section
        className="route-active-chapter"
        data-testid="route-active-chapter-panel"
        aria-label={`Chapter ${resolvedChapter.number}: ${resolvedChapter.title}`}
      >
        <header className="route-active-header">
          <div className="route-active-header__main">
            <div className="route-active-header__meta">
              <span className="route-active-header__kicker">
                Chapter {resolvedChapter.number} of {chapters.length}
              </span>
              <span className="route-active-header__time">
                <Clock size={12} aria-hidden="true" />
                ~{resolvedChapter.estimatedMinutes} min
              </span>
              <span className="route-active-header__progress">
                {activeStats.completedSecrets}/{activeStats.totalSecrets} Collectibles Checked
              </span>
            </div>
            <h2 className="route-active-header__title">{resolvedChapter.title}</h2>
            <p className="route-active-header__summary">{resolvedChapter.summary}</p>
          </div>

          <div className="route-active-header__actions">
            <button
              type="button"
              className="route-action-btn"
              data-testid="route-filter-remaining-btn"
              aria-pressed={showRemainingOnly}
              onClick={() => setShowRemainingOnly((prev) => !prev)}
            >
              <Filter size={13} aria-hidden="true" />
              <span>{showRemainingOnly ? 'Showing Remaining' : 'Hide Completed Steps'}</span>
            </button>

            <button
              type="button"
              className="route-action-btn route-action-btn--gold"
              data-testid="route-open-primary-region-btn"
              onClick={() => onOpenRegionOnMap(resolvedChapter.primaryRegionId)}
            >
              <MapPin size={13} aria-hidden="true" />
              <span>{primaryRegionName} on Map</span>
            </button>
          </div>
        </header>

        {visibleSteps.length === 0 ? (
          <div className="route-empty-complete">
            <CheckCircle2 size={22} aria-hidden="true" />
            <p>
              Every step in <strong>{resolvedChapter.title}</strong> is complete! Advance to the
              next chapter above or toggle off &ldquo;Hide Completed Steps&rdquo; to review.
            </p>
          </div>
        ) : (
          <ol className="route-steps-list">
            {visibleSteps.map((step, idx) => {
              const stepDone = isRouteStepComplete(step, state);
              const isPinned = state.bookmarkedRouteStepId === step.id;
              const isHighlighted = highlightedStepId === step.id;
              const stepRegion = REGION_BY_ID[step.regionId];
              const stepSecrets: UnifiedSecret[] = step.secretIds
                .map((id) => SECRET_BY_ID[id])
                .filter((s): s is UnifiedSecret => Boolean(s));
              const doneSecCount = stepSecrets.filter(
                (s) => state.completedSecretIds[s.id],
              ).length;

              return (
                <li
                  key={step.id}
                  ref={(el) => {
                    stepRefs.current[step.id] = el;
                  }}
                  data-testid={`route-step-${step.id}`}
                  className={`route-step-card${stepDone ? ' is-complete' : ''}${
                    isPinned ? ' is-pinned' : ''
                  }${isHighlighted ? ' is-highlighted' : ''}`}
                >
                  <div className="route-step-card__header">
                    <label className="route-step-check-label">
                      <input
                        type="checkbox"
                        className="route-step-checkbox"
                        data-testid={`route-step-check-${step.id}`}
                        checked={stepDone}
                        onChange={(e) => {
                          if (stepSecrets.length > 0 && e.target.checked) {
                            handleCheckAllStepItems(step, true);
                          } else if (stepSecrets.length > 0 && !e.target.checked) {
                            handleCheckAllStepItems(step, false);
                          } else {
                            onToggleRouteStep(
                              step.id,
                              {
                                label: step.title,
                                regionId: step.regionId,
                                chapterId: resolvedChapter.id,
                              },
                              e.target.checked,
                            );
                          }
                        }}
                      />
                      <span className="route-step-index">Step {idx + 1}</span>
                      <span className="route-step-title">{step.title}</span>
                    </label>

                    <div className="route-step-card__actions">
                      <button
                        type="button"
                        className={`route-mini-btn${isPinned ? ' is-pinned' : ''}`}
                        data-testid={`route-pin-${step.id}`}
                        aria-pressed={isPinned}
                        title={
                          isPinned
                            ? 'Clear pinned checkpoint'
                            : 'Pin this step to pick up here next time'
                        }
                        onClick={() =>
                          onBookmarkStep(isPinned ? null : step.id, {
                            label: step.title,
                            regionId: step.regionId,
                            chapterId: resolvedChapter.id,
                          })
                        }
                      >
                        <Bookmark size={12} aria-hidden="true" />
                        <span>{isPinned ? 'Pinned' : 'Pin Spot'}</span>
                      </button>

                      <button
                        type="button"
                        className="route-mini-btn"
                        data-testid={`route-open-map-${step.id}`}
                        onClick={() => onOpenRegionOnMap(step.regionId)}
                      >
                        <MapPin size={12} aria-hidden="true" />
                        <span>{stepRegion?.name ?? step.regionId}</span>
                      </button>
                    </div>
                  </div>

                  <p className="route-step-instructions">{step.instructions}</p>

                  {step.proTip && (
                    <div className="route-step-protip">
                      <Sparkles size={13} aria-hidden="true" />
                      <span>{step.proTip}</span>
                    </div>
                  )}

                  {stepSecrets.length > 0 && (
                    <div className="route-step-secrets">
                      <div className="route-step-secrets__head">
                        <span>
                          Collectibles in this Sweep ({doneSecCount}/{stepSecrets.length})
                        </span>
                      </div>
                      <ul className="route-step-secrets__grid">
                        {stepSecrets.map((sec) => {
                          const checked = Boolean(state.completedSecretIds[sec.id]);
                          return (
                            <li
                              key={sec.id}
                              className={`route-secret-item${checked ? ' is-checked' : ''}`}
                            >
                              <label className="route-secret-item__label">
                                <input
                                  type="checkbox"
                                  data-testid={`route-secret-check-${sec.id}`}
                                  checked={checked}
                                  onChange={(e) => onToggleSecret(sec.id, e.target.checked)}
                                />
                                <div className="route-secret-item__body">
                                  <div className="route-secret-item__top">
                                    <span className="route-secret-cat">
                                      {CATEGORY_SHORT_LABELS[sec.category] ?? sec.category}
                                    </span>
                                    {sec.switch2Status !== 'classic' && (
                                      <span className="route-secret-sw2">
                                        {sec.switch2Status === 'new-switch2'
                                          ? 'NEW SW2'
                                          : 'SW2'}
                                      </span>
                                    )}
                                    <span className="route-secret-title">{sec.title}</span>
                                  </div>
                                  {sec.locationHint && (
                                    <span className="route-secret-hint">{sec.locationHint}</span>
                                  )}
                                  {sec.songButtons && sec.songButtons.length > 0 && (
                                    <div className="route-secret-song-row">
                                      <NoteSequence buttons={sec.songButtons} size="sm" />
                                      {onOpenSongbook && (
                                        <button
                                          type="button"
                                          className="route-songbook-link"
                                          onClick={(e) => {
                                            e.preventDefault();
                                            onOpenSongbook(sec.id);
                                          }}
                                        >
                                          <Music size={11} aria-hidden="true" />
                                          Songbook
                                        </button>
                                      )}
                                    </div>
                                  )}
                                </div>
                              </label>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  )}
                </li>
              );
            })}
          </ol>
        )}

        {/* Bottom Chapter Footer Navigation */}
        <footer className="route-chapter-footer">
          {activeIndex > 0 ? (
            <button
              type="button"
              className="route-action-btn"
              onClick={() => onSelectChapter(chapters[activeIndex - 1].id)}
            >
              <ChevronLeft size={14} aria-hidden="true" />
              <span>
                Ch. {chapters[activeIndex - 1].number}: {chapters[activeIndex - 1].title}
              </span>
            </button>
          ) : (
            <span />
          )}

          {activeIndex < chapters.length - 1 && (
            <button
              type="button"
              className="route-action-btn route-action-btn--gold"
              data-testid="route-advance-next-chapter-btn"
              onClick={() => onSelectChapter(chapters[activeIndex + 1].id)}
            >
              <span>
                Next → Ch. {chapters[activeIndex + 1].number}: {chapters[activeIndex + 1].title}
              </span>
              <ChevronRight size={14} aria-hidden="true" />
            </button>
          )}
        </footer>
      </section>
    </div>
  );
}
