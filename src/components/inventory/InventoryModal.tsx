import React, { useRef, useState } from 'react';
import { Backpack, Check, Flag, Lock, Music, Shield, Unlock } from 'lucide-react';
import { REQUIREMENT_BY_ID, SONGS_AND_QUESTS } from '../../data';
import type { GlobalProgressSummary, PlayerProgressState } from '../../types/zelda';
import {
  NoteSequence,
  SheetDialog,
  deriveHeartMeterStats,
  parseNoteTokens,
} from '../sheets';
import './inventory.css';

export type InventorySubscreenTab = 'items' | 'equipment' | 'quest';

export interface InventoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  state: PlayerProgressState;
  effectiveRequirements: Set<string>;
  globalProgress: GlobalProgressSummary;
  onToggleRequirement: (requirementId: string, owned?: boolean) => void;
  onToggleSecret?: (secretId: string, completed?: boolean) => void;
  onToggleLoadoutMode: (enabled: boolean) => void;
  onOpenCatchUp?: () => void;
  onOpenSongbook?: (songId?: string) => void;
  initialTab?: InventorySubscreenTab;
}

interface ItemSlotDescriptor {
  id: string;
  fallbackName: string;
  glyph: string;
  eraTag: string;
}

const SELECT_ITEM_SLOTS: readonly ItemSlotDescriptor[] = [
  { id: 'deku-sticks', fallbackName: 'Deku Sticks', glyph: '🪵', eraTag: 'Child' },
  { id: 'slingshot', fallbackName: 'Fairy Slingshot', glyph: '🎯', eraTag: 'Child' },
  { id: 'bombs', fallbackName: 'Bomb Bag', glyph: '💣', eraTag: 'Both' },
  { id: 'boomerang', fallbackName: 'Boomerang', glyph: '🪃', eraTag: 'Child' },
  { id: 'ocarina', fallbackName: 'Ocarina', glyph: '🪈', eraTag: 'Both' },
  { id: 'magic-beans', fallbackName: 'Magic Beans', glyph: '🌱', eraTag: 'Child' },
  { id: 'hookshot', fallbackName: 'Hookshot', glyph: '🪝', eraTag: 'Adult' },
  { id: 'longshot', fallbackName: 'Longshot', glyph: '⛓️', eraTag: 'Adult' },
  { id: 'bow', fallbackName: 'Fairy Bow', glyph: '🏹', eraTag: 'Adult' },
  { id: 'fire-arrows', fallbackName: 'Fire Arrows', glyph: '🔥', eraTag: 'Adult' },
  { id: 'ice-arrows', fallbackName: 'Ice Arrows', glyph: '❄️', eraTag: 'Adult' },
  { id: 'light-arrows', fallbackName: 'Light Arrows', glyph: '✨', eraTag: 'Adult' },
  { id: 'megaton-hammer', fallbackName: 'Megaton Hammer', glyph: '🔨', eraTag: 'Adult' },
  { id: 'dins-fire', fallbackName: "Din's Fire", glyph: '☄️', eraTag: 'Both' },
  { id: 'lens-of-truth', fallbackName: 'Lens of Truth', glyph: '👁️', eraTag: 'Both' },
  { id: 'bottle', fallbackName: 'Empty Bottle', glyph: '🧪', eraTag: 'Both' },
  { id: 'bottled-bug', fallbackName: 'Bottled Bugs', glyph: '🪲', eraTag: 'Both' },
  { id: 'blue-fire', fallbackName: 'Blue Fire', glyph: '🩵', eraTag: 'Adult' },
  { id: 'weird-egg', fallbackName: 'Weird Egg', glyph: '🥚', eraTag: 'Child' },
  { id: 'zeldas-letter', fallbackName: "Zelda's Letter", glyph: '✉️', eraTag: 'Child' },
  { id: 'skull-mask', fallbackName: 'Skull Mask', glyph: '💀', eraTag: 'Child' },
  { id: 'mask-of-truth', fallbackName: 'Mask of Truth', glyph: '🎭', eraTag: 'Child' },
  { id: 'epona', fallbackName: 'Epona (Horse)', glyph: '🐎', eraTag: 'Adult' },
];

const EQUIPMENT_ROWS: ReadonlyArray<{
  label: string;
  items: ReadonlyArray<{ id: string; fallbackName: string; glyph: string }>;
}> = [
  {
    label: 'Swords & Magic',
    items: [
      { id: 'kokiri-sword', fallbackName: 'Kokiri Sword', glyph: '🗡️' },
      { id: 'magic-meter', fallbackName: 'Magic Meter', glyph: '💚' },
    ],
  },
  {
    label: 'Shields',
    items: [
      { id: 'deku-shield', fallbackName: 'Deku Shield', glyph: '🛡️' },
      { id: 'mirror-shield', fallbackName: 'Mirror Shield', glyph: '🪞' },
    ],
  },
  {
    label: 'Tunics',
    items: [
      { id: 'goron-tunic', fallbackName: 'Goron Tunic (Fire)', glyph: '🟥' },
      { id: 'zora-tunic', fallbackName: 'Zora Tunic (Water)', glyph: '🟦' },
    ],
  },
  {
    label: 'Boots',
    items: [
      { id: 'iron-boots', fallbackName: 'Iron Boots', glyph: '🥾' },
      { id: 'hover-boots', fallbackName: 'Hover Boots', glyph: '🪽' },
    ],
  },
  {
    label: 'Strength Upgrades',
    items: [
      { id: 'goron-bracelet', fallbackName: "Goron's Bracelet", glyph: '💪' },
      { id: 'silver-gauntlets', fallbackName: 'Silver Gauntlets', glyph: '🥈' },
      { id: 'golden-gauntlets', fallbackName: 'Golden Gauntlets', glyph: '🥇' },
    ],
  },
  {
    label: 'Diving Scale',
    items: [
      { id: 'silver-scale', fallbackName: 'Silver Scale', glyph: '🐟' },
      { id: 'golden-scale', fallbackName: 'Golden Scale', glyph: '🐠' },
    ],
  },
  {
    label: 'Wallets & Passes',
    items: [
      { id: 'rupees-100', fallbackName: '100+ Rupees', glyph: '💎' },
      { id: 'adults-wallet', fallbackName: "Adult's Wallet (200)", glyph: '👛' },
      { id: 'giants-wallet', fallbackName: "Giant's Wallet (500)", glyph: '💰' },
      { id: 'gerudo-card', fallbackName: 'Gerudo Token', glyph: '🏜️' },
      { id: 'echo-gem', fallbackName: 'Echo Gem (Switch 2)', glyph: '🔮' },
    ],
  },
];

const SPIRITUAL_STONES: ReadonlyArray<{
  id: string;
  label: string;
  source: string;
  color: string;
}> = [
  {
    id: 'stone-emerald',
    label: "Kokiri's Emerald",
    source: 'Great Deku Tree',
    color: 'var(--color-ready)',
  },
  {
    id: 'stone-ruby',
    label: "Goron's Ruby",
    source: "Dodongo's Cavern",
    color: 'var(--color-locked-crimson)',
  },
  {
    id: 'stone-sapphire',
    label: "Zora's Sapphire",
    source: "Jabu-Jabu's Belly",
    color: 'var(--color-sapphire)',
  },
];

const SAGE_MEDALLIONS: ReadonlyArray<{
  id: string;
  label: string;
  color: string;
}> = [
  { id: 'medallion-light', label: 'Light Medallion', color: 'var(--color-triforce)' },
  { id: 'medallion-forest', label: 'Forest Medallion', color: 'var(--color-ready)' },
  { id: 'medallion-fire', label: 'Fire Medallion', color: 'var(--color-locked-crimson)' },
  { id: 'medallion-water', label: 'Water Medallion', color: 'var(--color-sapphire)' },
  { id: 'medallion-shadow', label: 'Shadow Medallion', color: 'var(--color-locked-violet-text)' },
  { id: 'medallion-spirit', label: 'Spirit Medallion', color: 'var(--color-amber-text)' },
];

const WORLD_STATE_CHIPS: ReadonlyArray<{ id: string; label: string }> = [
  { id: 'era-child', label: 'Child Era Active' },
  { id: 'era-adult', label: 'Adult Era Unlocked' },
  { id: 'time-travel', label: 'Master Sword Time Travel' },
  { id: 'zora-thawed', label: "Thawed Zora's Domain (SW2)" },
];

export const InventoryModal: React.FC<InventoryModalProps> = ({
  isOpen,
  onClose,
  state,
  effectiveRequirements,
  globalProgress,
  onToggleRequirement,
  onToggleSecret,
  onToggleLoadoutMode,
  onOpenCatchUp,
  initialTab = 'items',
}) => {
  const [activeTab, setActiveTab] = useState<InventorySubscreenTab>(initialTab);
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const { containers: heartContainers, quarterRemainder } = deriveHeartMeterStats(globalProgress);

  const isOwned = (reqId: string): boolean =>
    Boolean(state.ownedRequirementIds[reqId]) ||
    effectiveRequirements.has(reqId) ||
    Boolean(state.completedSecretIds[reqId]);

  const handleToggleQuestToken = (tokenId: string) => {
    const nextOwned = !isOwned(tokenId);
    onToggleRequirement(tokenId);
    onToggleSecret?.(tokenId, nextOwned);
  };

  const tabs: ReadonlyArray<{ id: InventorySubscreenTab; label: string; icon: React.ReactNode }> = [
    { id: 'items', label: 'Select Item', icon: <Backpack size={15} aria-hidden="true" /> },
    { id: 'equipment', label: 'Equipment', icon: <Shield size={15} aria-hidden="true" /> },
    { id: 'quest', label: 'Quest Status & Songs', icon: <Music size={15} aria-hidden="true" /> },
  ];

  const handleTabKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>, idx: number) => {
    let nextIdx: number | null = null;
    if (event.key === 'ArrowRight') {
      nextIdx = (idx + 1) % tabs.length;
    } else if (event.key === 'ArrowLeft') {
      nextIdx = (idx - 1 + tabs.length) % tabs.length;
    } else if (event.key === 'Home') {
      nextIdx = 0;
    } else if (event.key === 'End') {
      nextIdx = tabs.length - 1;
    }
    if (nextIdx !== null) {
      event.preventDefault();
      setActiveTab(tabs[nextIdx].id);
      tabRefs.current[nextIdx]?.focus();
    }
  };

  return (
    <SheetDialog
      isOpen={isOpen}
      onClose={onClose}
      testId="inventory-modal"
      size="wide"
      title="My Inventory — Pause Subscreens"
      subtitle={`♥ ${heartContainers} Heart Containers${
        quarterRemainder > 0 ? ` (+${quarterRemainder}/4 Piece)` : ''
      } · 🕷 ${globalProgress.skulltulasCompleted}/100 Gold Skulltulas`}
    >
      <div className="oot-inventory">
        {/* Clear Player-Friendly World Lock Mode Switch */}
        <div className="oot-inventory__mode-banner" data-testid="inventory-world-lock-banner">
          <div className="oot-inventory__mode-copy">
            <span className="oot-inventory__mode-title">World Lock Mode</span>
            <span className="oot-inventory__mode-desc">
              {state.loadoutModeEnabled
                ? 'Progressive Mode hides unreachable areas & secrets until you mark the needed gear or songs.'
                : 'Checklist Mode shows every secret unlocked so you can browse freely.'}
            </span>
          </div>

          <div className="oot-inventory__mode-actions">
            <div
              className="oot-world-lock-segmented"
              role="group"
              aria-label="World Lock Mode"
              data-testid="inventory-world-lock-toggle"
            >
              <button
                type="button"
                className="oot-world-lock-btn"
                data-testid="world-lock-progressive-btn"
                aria-pressed={state.loadoutModeEnabled}
                onClick={() => onToggleLoadoutMode(true)}
              >
                <Lock size={12} aria-hidden="true" />
                <span>Progressive (Hide Unreachable)</span>
              </button>
              <button
                type="button"
                className="oot-world-lock-btn"
                data-testid="world-lock-checklist-btn"
                aria-pressed={!state.loadoutModeEnabled}
                onClick={() => onToggleLoadoutMode(false)}
              >
                <Unlock size={12} aria-hidden="true" />
                <span>Checklist Mode (Show All Unlocked)</span>
              </button>
            </div>

            {onOpenCatchUp && (
              <button
                type="button"
                className="oot-catchup-shortcut-btn"
                data-testid="inventory-open-catchup-btn"
                onClick={() => {
                  onClose();
                  onOpenCatchUp();
                }}
              >
                <Flag size={12} aria-hidden="true" />
                <span>Sync Checkpoint</span>
              </button>
            )}
          </div>
        </div>

        {/* 3 Pause Subscreen Tabs */}
        <div
          role="tablist"
          aria-label="Pause Subscreens"
          className="oot-subscreen-tablist"
          data-testid="inventory-subscreen-tabs"
        >
          {tabs.map((tab, idx) => {
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                ref={(el) => {
                  tabRefs.current[idx] = el;
                }}
                id={`inventory-tab-${tab.id}`}
                type="button"
                role="tab"
                data-testid={`inventory-tab-${tab.id}`}
                aria-selected={isSelected}
                tabIndex={isSelected ? 0 : -1}
                className="oot-subscreen-tab"
                onClick={() => setActiveTab(tab.id)}
                onKeyDown={(e) => handleTabKeyDown(e, idx)}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Subscreen 1: Select Item Grid */}
        <div
          role="tabpanel"
          aria-labelledby="inventory-tab-items"
          data-testid="inventory-panel-items"
          hidden={activeTab !== 'items'}
        >
          <div className="oot-subscreen-panel-inner">
            <div className="oot-item-grid">
              {SELECT_ITEM_SLOTS.map((slot) => {
                const req = REQUIREMENT_BY_ID[slot.id];
                const name = req?.name ?? slot.fallbackName;
                const owned = isOwned(slot.id);

                return (
                  <button
                    key={slot.id}
                    type="button"
                    className="oot-item-slot"
                    data-testid={`inventory-item-${slot.id}`}
                    aria-pressed={owned}
                    title={req ? `${req.name} — ${req.howToGet}` : name}
                    onClick={() => onToggleRequirement(slot.id)}
                  >
                    <div className="oot-item-slot__top">
                      <span className="oot-item-slot__glyph" aria-hidden="true">
                        {slot.glyph}
                      </span>
                      <span className="oot-item-slot__state">{owned ? 'Owned ✓' : 'Missing'}</span>
                    </div>
                    <span className="oot-item-slot__name">{name}</span>
                    <span className="oot-item-slot__era">{slot.eraTag}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Subscreen 2: Equipment Matrix */}
        <div
          role="tabpanel"
          aria-labelledby="inventory-tab-equipment"
          data-testid="inventory-panel-equipment"
          hidden={activeTab !== 'equipment'}
        >
          <div className="oot-subscreen-panel-inner">
            <div className="oot-status-strip" data-testid="inventory-equipment-summary">
              <span>
                <strong>Life Meter:</strong> {heartContainers} Heart Containers (
                {globalProgress.heartPiecesCompleted}/{globalProgress.heartPiecesTotal} Heart Pieces)
              </span>
              <span aria-hidden="true">·</span>
              <span>
                <strong>House of Skulltula:</strong> {globalProgress.skulltulasCompleted}/100 Tokens
                (auto-unlocks 10/20/30/40/50/100 milestones)
              </span>
            </div>

            <div className="oot-equip-rows">
              {EQUIPMENT_ROWS.map((row) => (
                <div key={row.label} className="oot-equip-row">
                  <div className="oot-equip-row__label">{row.label}</div>
                  <div className="oot-equip-row__slots">
                    {row.items.map((item) => {
                      const req = REQUIREMENT_BY_ID[item.id];
                      const name = req?.name ?? item.fallbackName;
                      const owned = isOwned(item.id);
                      return (
                        <button
                          key={item.id}
                          type="button"
                          className="oot-equip-chip"
                          data-testid={`inventory-equip-${item.id}`}
                          aria-pressed={owned}
                          title={req ? `${req.name} — ${req.howToGet}` : name}
                          onClick={() => onToggleRequirement(item.id)}
                        >
                          <span aria-hidden="true">{item.glyph}</span>
                          <span>{name}</span>
                          {owned && <Check size={13} aria-hidden="true" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Subscreen 3: Quest Status (3 Spiritual Stones, 6 Medallions, 13 Songs) */}
        <div
          role="tabpanel"
          aria-labelledby="inventory-tab-quest"
          data-testid="inventory-panel-quest"
          hidden={activeTab !== 'quest'}
        >
          <div className="oot-subscreen-panel-inner">
            <div className="oot-quest-grid">
              <section className="oot-quest-card" aria-label="3 Spiritual Stones">
                <h3 className="oot-quest-card__title">3 Spiritual Stones</h3>
                <div className="oot-crest-grid">
                  {SPIRITUAL_STONES.map((stone) => {
                    const owned = isOwned(stone.id);
                    const req = REQUIREMENT_BY_ID[stone.id];
                    return (
                      <button
                        key={stone.id}
                        type="button"
                        className="oot-crest-btn"
                        data-testid={`inventory-quest-${stone.id}`}
                        aria-pressed={owned}
                        title={req?.howToGet ?? `Obtained by clearing ${stone.source}`}
                        onClick={() => handleToggleQuestToken(stone.id)}
                      >
                        <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true">
                          <polygon
                            points="12,2 21,9 17,21 7,21 3,9"
                            fill={owned ? stone.color : 'transparent'}
                            stroke={stone.color}
                            strokeWidth="2"
                          />
                        </svg>
                        <span>{stone.label}</span>
                      </button>
                    );
                  })}
                </div>
              </section>

              <section className="oot-quest-card" aria-label="6 Sage Medallions">
                <h3 className="oot-quest-card__title">6 Sage Medallions</h3>
                <div className="oot-crest-grid">
                  {SAGE_MEDALLIONS.map((med) => {
                    const owned = isOwned(med.id);
                    const req = REQUIREMENT_BY_ID[med.id];
                    return (
                      <button
                        key={med.id}
                        type="button"
                        className="oot-crest-btn"
                        data-testid={`inventory-quest-${med.id}`}
                        aria-pressed={owned}
                        title={req?.howToGet ?? med.label}
                        onClick={() => handleToggleQuestToken(med.id)}
                      >
                        <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true">
                          <polygon
                            points="12,2 20,6.5 20,17.5 12,22 4,17.5 4,6.5"
                            fill={owned ? med.color : 'transparent'}
                            stroke={med.color}
                            strokeWidth="2"
                          />
                        </svg>
                        <span>{med.label.replace(' Medallion', '')}</span>
                      </button>
                    );
                  })}
                </div>
              </section>
            </div>

            <section className="oot-quest-card" aria-label="Era and World State">
              <h3 className="oot-quest-card__title">Era &amp; World State</h3>
              <div className="oot-equip-row__slots">
                {WORLD_STATE_CHIPS.map((ws) => {
                  const owned = isOwned(ws.id);
                  return (
                    <button
                      key={ws.id}
                      type="button"
                      className="oot-equip-chip"
                      data-testid={`inventory-world-${ws.id}`}
                      aria-pressed={owned}
                      onClick={() => onToggleRequirement(ws.id)}
                    >
                      <span>{ws.label}</span>
                      {owned && <Check size={13} aria-hidden="true" />}
                    </button>
                  );
                })}
              </div>
            </section>

            <section className="oot-quest-card" aria-label="13 Ocarina Melodies">
              <h3 className="oot-quest-card__title">13 Ocarina Melodies (Switch 2 Buttons)</h3>
              <div className="oot-songs-grid">
                {SONGS_AND_QUESTS.ocarinaSongs.map((song) => {
                  const owned = isOwned(song.id);
                  const notes =
                    song.id === 'song-scarecrow' && state.customScarecrowNotes
                      ? parseNoteTokens(state.customScarecrowNotes)
                      : song.switch2Buttons;

                  return (
                    <button
                      key={song.id}
                      type="button"
                      className="oot-song-row"
                      data-testid={`inventory-song-${song.id}`}
                      aria-pressed={owned}
                      onClick={() => onToggleRequirement(song.id)}
                    >
                      <div className="oot-song-row__head">
                        <span>{song.name}</span>
                        <span>{owned ? '✓ Learned' : '+ Learn'}</span>
                      </div>
                      {notes.length > 0 ? (
                        <NoteSequence buttons={notes} size="sm" />
                      ) : (
                        <span className="oot-item-slot__era">Custom 8-note melody</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </section>
          </div>
        </div>
      </div>
    </SheetDialog>
  );
};
