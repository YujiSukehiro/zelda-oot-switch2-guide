import { useEffect, useState } from 'react';
import {
  Check,
  Clock,
  Droplets,
  MapPin,
  Pause,
  Play,
  RotateCcw,
  ScrollText,
  Sparkles,
  Sword,
} from 'lucide-react';
import { REGION_BY_ID, SONGS_AND_QUESTS } from '../../data';
import type { PlayerProgressState } from '../../types/zelda';
import { SheetDialog } from './NoteBadge';
import './sheets.css';

export interface QuestsModalProps {
  isOpen: boolean;
  onClose: () => void;
  state: PlayerProgressState;
  effectiveRequirements: Set<string>;
  onToggleSecret: (secretId: string, completed?: boolean) => void;
  onSelectRegion: (regionId: string) => void;
}

type QuestViewTab = 'all' | 'biggoron' | 'masks';

const TIMER_PRESETS: ReadonlyArray<{ label: string; durationSec: number; stepHint: string }> = [
  { label: '4:00', durationSec: 240, stepHint: 'Step 4: Odd Mushroom' },
  { label: '2:30', durationSec: 150, stepHint: 'Step 9: Eyeball Frog' },
  { label: '3:30', durationSec: 210, stepHint: 'Step 10: Eye Drops' },
];

function formatCountdown(seconds: number): string {
  const clamped = Math.max(0, seconds);
  const mins = Math.floor(clamped / 60);
  const secs = clamped % 60;
  return `${mins}:${String(secs).padStart(2, '0')}`;
}

function parseTimerSeconds(timerStr: string): number {
  const [m, s] = timerStr.split(':').map((n) => Number.parseInt(n, 10));
  if (Number.isNaN(m) || Number.isNaN(s)) return 180;
  return m * 60 + s;
}

export function QuestsModal({
  isOpen,
  onClose,
  state,
  effectiveRequirements,
  onToggleSecret,
  onSelectRegion,
}: QuestsModalProps) {
  const [activeTab, setActiveTab] = useState<QuestViewTab>('all');
  const [selectedPresetLabel, setSelectedPresetLabel] = useState<string>('4:00');
  const [remainingSeconds, setRemainingSeconds] = useState<number>(240);
  const [isRunning, setIsRunning] = useState<boolean>(false);

  useEffect(() => {
    if (!isOpen) {
      setIsRunning(false);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isRunning) return undefined;
    const id = window.setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= 1) {
          setIsRunning(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => window.clearInterval(id);
  }, [isRunning]);

  const loadTimerPreset = (label: string, autoStart = false) => {
    const duration = parseTimerSeconds(label);
    setSelectedPresetLabel(label);
    setRemainingSeconds(duration);
    setIsRunning(autoStart);
  };

  const biggoronCompletedCount = SONGS_AND_QUESTS.biggoronSwordQuest.filter(
    (step) => state.completedSecretIds[`biggoron-step-${step.step}`],
  ).length;

  const masksCompletedCount = SONGS_AND_QUESTS.happyMaskQuest.filter(
    (m) => state.completedSecretIds[`mask-step-${m.step}`],
  ).length;

  const totalMaskFees = SONGS_AND_QUESTS.happyMaskQuest.reduce((acc, m) => acc + m.feeToShop, 0);
  const zoraThawed = effectiveRequirements.has('zora-thawed');
  const biggoronSwordClaimed = Boolean(state.completedSecretIds['eq-biggoron-sword']);

  const showBiggoron = activeTab === 'all' || activeTab === 'biggoron';
  const showMasks = activeTab === 'all' || activeTab === 'masks';

  const tabOrder: readonly QuestViewTab[] = ['all', 'biggoron', 'masks'];

  return (
    <SheetDialog
      isOpen={isOpen}
      onClose={onClose}
      testId="quests-modal"
      size="wide"
      title={
        <>
          <ScrollText size={19} aria-hidden="true" />
          <span>Quest Chains Tracker — Biggoron’s Sword &amp; Happy Mask Shop</span>
        </>
      }
      subtitle={`Biggoron Trade: ${biggoronCompletedCount}/12 Steps · Happy Mask Sequence: ${masksCompletedCount}/4 Deliveries`}
    >
      {/* Accessible Tab Switcher (ArrowLeft / ArrowRight keyboard support) */}
      <div
        className="zelda-tablist"
        role="tablist"
        aria-label="Quest chain sections"
        onKeyDown={(e) => {
          if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
          e.preventDefault();
          const idx = tabOrder.indexOf(activeTab);
          const nextIdx =
            e.key === 'ArrowRight'
              ? (idx + 1) % tabOrder.length
              : (idx - 1 + tabOrder.length) % tabOrder.length;
          setActiveTab(tabOrder[nextIdx]);
        }}
      >
        <button
          type="button"
          role="tab"
          className="zelda-tab"
          aria-selected={activeTab === 'all'}
          data-testid="quests-tab-all"
          onClick={() => setActiveTab('all')}
        >
          All Quest Chains
        </button>
        <button
          type="button"
          role="tab"
          className="zelda-tab"
          aria-selected={activeTab === 'biggoron'}
          data-testid="quests-tab-biggoron"
          onClick={() => setActiveTab('biggoron')}
        >
          Biggoron’s Sword ({biggoronCompletedCount}/12)
        </button>
        <button
          type="button"
          role="tab"
          className="zelda-tab"
          aria-selected={activeTab === 'masks'}
          data-testid="quests-tab-masks"
          onClick={() => setActiveTab('masks')}
        >
          Happy Mask Shop ({masksCompletedCount}/4)
        </button>
      </div>

      {/* ====================================================================
          SECTION 1: 12-Step Biggoron's Sword Trading Sequence
         ==================================================================== */}
      {showBiggoron ? (
        <section
          aria-label="12-Step Biggoron's Sword Quest"
          style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '0.5rem',
            }}
          >
            <h3 style={{ margin: 0, fontSize: 'var(--text-base)', color: 'var(--color-triforce)' }}>
              <Sword
                size={16}
                style={{ display: 'inline', verticalAlign: '-2px', marginRight: 6 }}
                aria-hidden="true"
              />
              12-Step Biggoron’s Sword Trading Sequence ({biggoronCompletedCount}/12)
            </h3>

            <button
              type="button"
              role="checkbox"
              aria-checked={biggoronSwordClaimed}
              className="zelda-check-btn"
              data-testid="quest-check-eq-biggoron-sword"
              onClick={() => onToggleSecret('eq-biggoron-sword')}
            >
              <Check size={13} aria-hidden="true" />
              <span>
                {biggoronSwordClaimed
                  ? 'Biggoron’s Sword Claimed!'
                  : 'Mark Biggoron’s Sword Claimed'}
              </span>
            </button>
          </div>

          {/* Highlighted Switch 2 Thawed Zora's Domain 25-Second Shortcut Callout */}
          <div
            className="zelda-callout zelda-callout--sapphire"
            data-testid="zora-shortcut-callout"
          >
            <div className="zelda-callout__title">
              <Droplets size={15} aria-hidden="true" />
              <span>
                Switch 2 Remake Exclusive: Thawed Zora’s Domain 25-Second Diving Shortcut!
              </span>
              <span className="zelda-badge zelda-badge--new">
                {zoraThawed ? '✓ Active in Loadout' : 'Unlocks Post-Water Temple'}
              </span>
            </div>
            <p style={{ margin: 0 }}>
              Unlike N64/3DS where Zora’s Domain stayed frozen forever, beating the{' '}
              <strong>Water Temple</strong> in Switch 2 completely unfreezes Zora’s Domain! On{' '}
              <strong>Steps 9–11</strong>, skip Epona across Hyrule Field: dive straight through the{' '}
              <strong>Zora’s Domain ↔ Lake Hylia underwater tunnel</strong> to reach the Lakeside
              Laboratory in <strong>25 seconds</strong>, then swim back through{' '}
              <strong>Zora’s Domain → Lost Woods → Goron City → Death Mountain Trail</strong> with
              over 90 seconds to spare!
            </p>
          </div>

          {/* Interactive No-Warp Countdown Timer Widget */}
          <div className="zelda-timer-widget" data-testid="quest-timer-widget">
            <div>
              <div
                style={{
                  fontSize: 'var(--text-xs)',
                  fontWeight: 700,
                  color: 'var(--text-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                <Clock size={14} aria-hidden="true" />
                <span>No-Warp Timed Run Companion Timer ({selectedPresetLabel})</span>
              </div>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                Playing any Ocarina Warp Song spoils timed trade items instantly!
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', flexWrap: 'wrap' }}>
              {TIMER_PRESETS.map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  className="zelda-cmd-btn"
                  data-testid={`timer-preset-${preset.label}`}
                  aria-pressed={selectedPresetLabel === preset.label}
                  title={preset.stepHint}
                  onClick={() => loadTimerPreset(preset.label, false)}
                >
                  {preset.label}
                </button>
              ))}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
              <span className="zelda-timer-readout" data-testid="quest-timer-display">
                {formatCountdown(remainingSeconds)}
              </span>

              <button
                type="button"
                className="zelda-btn-primary"
                data-testid="quest-timer-start-btn"
                onClick={() => setIsRunning((r) => !r)}
              >
                {isRunning ? (
                  <>
                    <Pause size={13} aria-hidden="true" />
                    <span>Pause</span>
                  </>
                ) : (
                  <>
                    <Play size={13} aria-hidden="true" />
                    <span>Start</span>
                  </>
                )}
              </button>

              <button
                type="button"
                className="zelda-cmd-btn"
                data-testid="quest-timer-reset-btn"
                aria-label="Reset countdown timer"
                onClick={() => loadTimerPreset(selectedPresetLabel, false)}
              >
                <RotateCcw size={13} aria-hidden="true" />
                <span>Reset</span>
              </button>
            </div>
          </div>

          {/* 12 Interactive Step Cards */}
          <div className="zelda-quest-list">
            {SONGS_AND_QUESTS.biggoronSwordQuest.map((step) => {
              const secretId = `biggoron-step-${step.step}`;
              const isDone = Boolean(state.completedSecretIds[secretId]);
              const regionName = REGION_BY_ID[step.regionId]?.name ?? step.regionId;
              const isZoraShortcutStep = step.step >= 9 && step.step <= 11;

              return (
                <div
                  key={secretId}
                  className={`zelda-quest-step ${isDone ? 'zelda-quest-step--done' : ''}`.trim()}
                  data-testid={`quest-step-${secretId}`}
                >
                  <div className="zelda-sheet-card__top">
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.4rem',
                        flexWrap: 'wrap',
                      }}
                    >
                      <span className="zelda-badge">Step {step.step}/12</span>
                      <strong style={{ fontSize: 'var(--text-sm)' }}>{step.item}</strong>
                      {step.timer ? (
                        <button
                          type="button"
                          className="zelda-badge zelda-badge--timer"
                          data-testid={`step-timer-badge-${step.step}`}
                          title="Click to load this No-Warp countdown timer"
                          onClick={() => loadTimerPreset(step.timer!, true)}
                        >
                          <Clock size={11} aria-hidden="true" />
                          <span>{step.timer} No-Warp Timer</span>
                        </button>
                      ) : null}
                      {isZoraShortcutStep ? (
                        <span className="zelda-badge zelda-badge--sapphire">
                          Switch 2 Thawed Zora 25s Shortcut
                        </span>
                      ) : null}
                    </div>

                    <button
                      type="button"
                      role="checkbox"
                      aria-checked={isDone}
                      className="zelda-check-btn"
                      data-testid={`quest-check-${secretId}`}
                      onClick={() => onToggleSecret(secretId)}
                    >
                      <Check size={13} aria-hidden="true" />
                      <span>{isDone ? 'Done' : 'Check Step'}</span>
                    </button>
                  </div>

                  <p className="zelda-sheet-card__desc">{step.instructions}</p>

                  <div className="zelda-sheet-card__footer">
                    <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
                      Region: {regionName}
                    </span>
                    <button
                      type="button"
                      className="zelda-link-btn"
                      data-testid={`quest-jump-${secretId}`}
                      onClick={() => {
                        onSelectRegion(step.regionId);
                        onClose();
                      }}
                    >
                      <MapPin size={13} aria-hidden="true" />
                      <span>Jump to {regionName}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      ) : null}

      {/* ====================================================================
          SECTION 2: 4-Step Happy Mask Shop Sequence
         ==================================================================== */}
      {showMasks ? (
        <section
          aria-label="4-Step Happy Mask Shop Tracker"
          style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '0.5rem',
            }}
          >
            <h3 style={{ margin: 0, fontSize: 'var(--text-base)', color: 'var(--color-triforce)' }}>
              4-Step Happy Mask Shop Delivery Tracker ({masksCompletedCount}/4 · {totalMaskFees}{' '}
              Rupees Total Fees)
            </h3>
            <span className="zelda-badge zelda-badge--rupee">
              Fees: 10 + 20 + 30 + 50 = 110 Rupees → Unlocks Mask of Truth
            </span>
          </div>

          <div className="zelda-callout zelda-callout--switch2" data-testid="mask-bugfix-callout">
            <div className="zelda-callout__title">
              <Sparkles size={15} aria-hidden="true" />
              <span>Switch 2 Bug Fix: Poacher’s Saw No Longer Breaks Deku Nut Upgrade #2!</span>
            </div>
            <p style={{ margin: 0 }}>
              In 1998 N64, claiming the <strong>Poacher’s Saw</strong> permanently glitched the Lost
              Woods Forest Stage Scrubs so you could never earn the{' '}
              <strong>40-Deku Nut Capacity Upgrade</strong> with the Mask of Truth. Nintendo fixed
              this in Switch 2—you can claim both upgrades in any order!
            </p>
          </div>

          <div className="zelda-quest-list">
            {SONGS_AND_QUESTS.happyMaskQuest.map((mask) => {
              const secretId = `mask-step-${mask.step}`;
              const isDone = Boolean(state.completedSecretIds[secretId]);
              const regionName = REGION_BY_ID[mask.regionId]?.name ?? mask.regionId;

              return (
                <div
                  key={secretId}
                  className={`zelda-quest-step ${isDone ? 'zelda-quest-step--done' : ''}`.trim()}
                  data-testid={`quest-step-${secretId}`}
                >
                  <div className="zelda-sheet-card__top">
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.4rem',
                        flexWrap: 'wrap',
                      }}
                    >
                      <span className="zelda-badge">Trade #{mask.step}</span>
                      <strong style={{ fontSize: 'var(--text-sm)' }}>{mask.mask}</strong>
                      <span className="zelda-badge zelda-badge--rupee">
                        Shop Fee: {mask.feeToShop} Rupees
                      </span>
                    </div>

                    <button
                      type="button"
                      role="checkbox"
                      aria-checked={isDone}
                      className="zelda-check-btn"
                      data-testid={`quest-check-${secretId}`}
                      onClick={() => onToggleSecret(secretId)}
                    >
                      <Check size={13} aria-hidden="true" />
                      <span>{isDone ? 'Delivered' : 'Mark Sold'}</span>
                    </button>
                  </div>

                  <p className="zelda-sheet-card__desc">
                    <strong>Buyer:</strong> {mask.buyer}
                  </p>
                  <p className="zelda-sheet-card__desc">
                    <strong>Pro Tip:</strong> {mask.proTip}
                  </p>

                  <div className="zelda-sheet-card__footer">
                    <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
                      Delivery Region: {regionName}
                    </span>
                    <button
                      type="button"
                      className="zelda-link-btn"
                      data-testid={`quest-jump-${secretId}`}
                      onClick={() => {
                        onSelectRegion(mask.regionId);
                        onClose();
                      }}
                    >
                      <MapPin size={13} aria-hidden="true" />
                      <span>Jump to {regionName}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      ) : null}
    </SheetDialog>
  );
}
