import React, { useMemo, useState } from 'react';
import { ArrowRight, Check, Compass, Layers, Map as MapIcon } from 'lucide-react';
import { REGION_BY_ID, STORY_PRESETS } from '../../data';
import type { StoryPreset } from '../../types/zelda';
import { SheetDialog } from '../sheets';
import './onboarding.css';

export type CatchUpPlayStyle = 'guided' | 'map' | 'route';

export interface CatchUpSelection {
  presetId: string;
  playStyle: CatchUpPlayStyle;
  markPriorSecretsAndSteps: boolean;
  targetRegionId: string;
  ownedRequirementIds: string[];
}

export interface CatchUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyCatchUp: (selection: CatchUpSelection) => void;
  defaultPlayStyle?: CatchUpPlayStyle;
  defaultPresetId?: string;
}

const PRESET_TARGET_REGION: Readonly<Record<string, string>> = {
  'fresh-start': 'kokiri-forest',
  'goron-city-visit-1': 'goron-city',
  'post-dodongo': 'goron-city',
  'three-stones': 'market',
  'fresh-adult-hookshot': 'kakariko-village',
  'post-forest-temple': 'goron-city',
  'post-water-temple': 'kakariko-village',
  endgame: 'ganons-castle',
};

const PRESET_DISPLAY_TITLE_OVERRIDES: Readonly<Record<string, string>> = {
  'fresh-start': 'Fresh Start (Kokiri Forest)',
  'goron-city-visit-1': 'Goron City — 1st Visit',
  'post-dodongo': "After Dodongo's Cavern",
  'three-stones': '3 Spiritual Stones',
  'fresh-adult-hookshot': 'Fresh Adult + Hookshot',
  'post-forest-temple': 'Post-Forest Temple',
  'post-water-temple': 'Post-Water Temple',
  endgame: "Endgame (Ganon's Castle)",
};

const FALLBACK_GORON_VISIT_1_PRESET: StoryPreset = {
  id: 'goron-city-visit-1',
  label: 'Goron City — 1st Visit (Before Bombs)',
  shortLabel: 'Goron City — 1st Visit',
  description:
    "Child Link arriving in Goron City with Kokiri's Emerald, Zelda's Lullaby & Saria's Song before unlocking Dodongo's Cavern.",
  eraFilter: 'child',
  ownedRequirementIds: [
    'era-child',
    'time-day',
    'time-night',
    'kokiri-sword',
    'deku-shield',
    'deku-sticks',
    'slingshot',
    'ocarina',
    'weird-egg',
    'zeldas-letter',
    'song-lullaby',
    'song-saria',
    'stone-emerald',
  ],
};

export function buildCatchUpPresetList(presets: readonly StoryPreset[]): StoryPreset[] {
  const hasGoronVisit1 = presets.some((p) => p.id === 'goron-city-visit-1');
  if (hasGoronVisit1) {
    return [...presets];
  }
  const result: StoryPreset[] = [];
  let inserted = false;
  for (const preset of presets) {
    result.push(preset);
    if (preset.id === 'fresh-start') {
      result.push(FALLBACK_GORON_VISIT_1_PRESET);
      inserted = true;
    }
  }
  if (!inserted) {
    result.unshift(FALLBACK_GORON_VISIT_1_PRESET);
  }
  return result;
}

const PLAY_STYLE_OPTIONS: ReadonlyArray<{
  id: CatchUpPlayStyle;
  name: string;
  description: string;
  recommended?: boolean;
  icon: React.ReactNode;
}> = [
  {
    id: 'guided',
    name: 'Guided Co-Pilot + Floor Maps',
    description:
      'Interactive area & dungeon floor maps paired with a focused "Do This Next" GPS card.',
    recommended: true,
    icon: <Layers size={18} aria-hidden="true" />,
  },
  {
    id: 'map',
    name: 'World Map Explorer',
    description:
      'Free-roam across all 34 painted Hyrule regions & dungeons at your own pace.',
    icon: <MapIcon size={18} aria-hidden="true" />,
  },
  {
    id: 'route',
    name: 'Full 11-Chapter Route',
    description:
      'Follow the complete 100% Switch 2 Remake chapter-by-chapter linear walkthrough.',
    icon: <Compass size={18} aria-hidden="true" />,
  },
];

export const CatchUpModal: React.FC<CatchUpModalProps> = ({
  isOpen,
  onClose,
  onApplyCatchUp,
  defaultPlayStyle = 'guided',
  defaultPresetId = 'fresh-start',
}) => {
  const presets = useMemo(() => buildCatchUpPresetList(STORY_PRESETS), []);
  const [playStyle, setPlayStyle] = useState<CatchUpPlayStyle>(defaultPlayStyle);
  const [selectedPresetId, setSelectedPresetId] = useState<string>(defaultPresetId);
  const [markPriorSecretsAndSteps, setMarkPriorSecretsAndSteps] = useState<boolean>(true);

  const selectedPreset =
    presets.find((p) => p.id === selectedPresetId) ?? presets[0] ?? FALLBACK_GORON_VISIT_1_PRESET;
  const targetRegionId =
    (selectedPreset as StoryPreset & { recommendedRegionId?: string }).recommendedRegionId ??
    PRESET_TARGET_REGION[selectedPreset.id] ??
    'kokiri-forest';
  const targetRegionName = REGION_BY_ID[targetRegionId]?.name ?? 'Kokiri Forest';

  const handleSubmit = () => {
    onApplyCatchUp({
      presetId: selectedPreset.id,
      playStyle,
      markPriorSecretsAndSteps:
        selectedPreset.id === 'fresh-start' ? false : markPriorSecretsAndSteps,
      targetRegionId,
      ownedRequirementIds: [...selectedPreset.ownedRequirementIds],
    });
    onClose();
  };

  return (
    <SheetDialog
      isOpen={isOpen}
      onClose={onClose}
      testId="catch-up-modal"
      size="wide"
      title="Welcome & Sync Your Playthrough"
      subtitle="Pick how you want to use the companion and sync to your exact spot in Ocarina of Time (Switch 2)."
    >
      <div className="catchup-wizard">
        {/* Step 1: Play Style */}
        <section className="catchup-step" aria-labelledby="catchup-step-1-heading">
          <div className="catchup-step__header">
            <span className="catchup-step__num" aria-hidden="true">
              1
            </span>
            <h3 id="catchup-step-1-heading" className="catchup-step__title">
              Choose How You Want to Play
            </h3>
          </div>

          <div
            className="catchup-playstyle-grid"
            role="group"
            aria-label="Companion play style"
          >
            {PLAY_STYLE_OPTIONS.map((opt) => {
              const selected = playStyle === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  className="catchup-playstyle-card"
                  data-testid={`catchup-style-${opt.id}`}
                  aria-pressed={selected}
                  onClick={() => setPlayStyle(opt.id)}
                >
                  <div className="catchup-playstyle-card__top">
                    <span className="catchup-playstyle-card__icon">{opt.icon}</span>
                    {opt.recommended ? (
                      <span className="catchup-playstyle-card__rec">Recommended</span>
                    ) : selected ? (
                      <Check size={14} aria-hidden="true" />
                    ) : null}
                  </div>
                  <span className="catchup-playstyle-card__name">{opt.name}</span>
                  <span className="catchup-playstyle-card__desc">{opt.description}</span>
                </button>
              );
            })}
          </div>
        </section>

        {/* Step 2: Story Checkpoint */}
        <section className="catchup-step" aria-labelledby="catchup-step-2-heading">
          <div className="catchup-step__header">
            <span className="catchup-step__num" aria-hidden="true">
              2
            </span>
            <h3 id="catchup-step-2-heading" className="catchup-step__title">
              Choose Where You Are in the Story
            </h3>
          </div>

          <div
            className="catchup-presets-grid"
            role="group"
            aria-label="Story progression checkpoints"
          >
            {presets.map((preset) => {
              const selected = selectedPreset.id === preset.id;
              const displayTitle =
                PRESET_DISPLAY_TITLE_OVERRIDES[preset.id] ?? preset.shortLabel ?? preset.label;
              const eraLabel =
                preset.eraFilter === 'child'
                  ? 'Child Era'
                  : preset.eraFilter === 'adult'
                    ? 'Adult Era'
                    : 'Endgame';

              return (
                <button
                  key={preset.id}
                  type="button"
                  className="catchup-preset-card"
                  data-testid={`catchup-preset-${preset.id}`}
                  aria-pressed={selected}
                  onClick={() => setSelectedPresetId(preset.id)}
                >
                  <div className="catchup-preset-card__top">
                    <span className="catchup-preset-card__era">{eraLabel}</span>
                    {selected && <Check size={14} aria-hidden="true" />}
                  </div>
                  <span className="catchup-preset-card__title">{displayTitle}</span>
                  <span className="catchup-preset-card__desc">{preset.description}</span>
                </button>
              );
            })}
          </div>

          <label className="catchup-sync-option">
            <input
              type="checkbox"
              data-testid="catchup-mark-prior-checkbox"
              checked={selectedPreset.id === 'fresh-start' ? false : markPriorSecretsAndSteps}
              disabled={selectedPreset.id === 'fresh-start'}
              onChange={(e) => setMarkPriorSecretsAndSteps(e.target.checked)}
            />
            <span className="catchup-sync-option__text">
              <strong>Also mark earlier story steps &amp; key items complete</strong>
              <span>
                Automatically checks off prior dungeons, songs, and story rewards up to{' '}
                {PRESET_DISPLAY_TITLE_OVERRIDES[selectedPreset.id] ?? selectedPreset.shortLabel} so
                your Co-Pilot starts right at your next objective.
              </span>
            </span>
          </label>
        </section>

        {/* Footer */}
        <div className="catchup-footer">
          <span className="catchup-footer__hint">
            Starting destination: <strong>{targetRegionName}</strong>
          </span>

          <div className="catchup-footer__actions">
            <button
              type="button"
              className="catchup-secondary-btn"
              data-testid="catchup-cancel-btn"
              onClick={onClose}
            >
              Keep Current Save
            </button>

            <button
              type="button"
              className="catchup-primary-btn"
              data-testid="catchup-apply-btn"
              onClick={handleSubmit}
            >
              <span>Start from {PRESET_DISPLAY_TITLE_OVERRIDES[selectedPreset.id] ?? selectedPreset.shortLabel}</span>
              <ArrowRight size={15} aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </SheetDialog>
  );
};
