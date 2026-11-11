import { useState } from 'react';
import { Check, Coins, FlaskConical, MapPin, ShieldAlert, Sparkles, Sprout, Trophy, Zap } from 'lucide-react';
import {
  METADATA,
  REGION_BY_ID,
  SONGS_AND_QUESTS,
  UPGRADES_AND_BOTTLES,
} from '../../data';
import type { PlayerProgressState } from '../../types/zelda';
import { SheetDialog } from './NoteBadge';
import './sheets.css';

export interface Switch2DiffModalProps {
  isOpen: boolean;
  onClose: () => void;
  state: PlayerProgressState;
  onToggleSecret: (secretId: string, completed?: boolean) => void;
  onSelectRegion: (regionId: string) => void;
}

type DiffSectionTab = 'all' | 'comparison' | 'bottles' | 'fairies' | 'beans' | 'exclusives';

const REMAKE_COMPARISON_CARDS: ReadonlyArray<{
  title: string;
  classic: string;
  switch2: string;
  badge: string;
}> = [
  {
    title: 'Empty Bottles & Big Poe Hunt',
    classic: '4 Bottles total; 1,000 points (10 Big Poes) required for 4th Bottle.',
    switch2:
      '5 Bottles total! Brand-new Child Bottle in Market Potion Shop (Escaped Golden Bug) + Big Poe Bottle cut in half to 500 points (5 Big Poes)!',
    badge: 'NEW 5th Bottle',
  },
  {
    title: 'Wallet Capacities',
    classic: '99 → 200 → 500 Rupees.',
    switch2:
      '200 → 500 → 1,000 Rupees! Starting Kokiri Wallet holds 200; 10 Skulltulas = 500 Adult’s Wallet; 30 Skulltulas = 1,000 Giant’s Wallet.',
    badge: '2x Capacity',
  },
  {
    title: 'All 6 Great Fairy Fountains',
    classic: 'Free upon playing Zelda’s Lullaby; DMT = Spin Attack, Castle = Din’s Fire.',
    switch2:
      'Charge escalating offerings totaling 1,175 Rupees (25 → 50 → 100 → 200 → 300 → 500)! DMT Summit (25) grants Magic Meter + Din’s Fire; Hyrule Castle (50) grants Spin Attack.',
    badge: '1,175 Rupees',
  },
  {
    title: '20-Skulltula Relic (Echo Gem)',
    classic: 'Stone / Shard of Agony grotto rumble indicator.',
    switch2:
      'Echo Gem — equipable Gold Skulltula radar using dynamic glow, spatial audio cues, and HD Rumble 2 (grottos now show subtle surface cues).',
    badge: 'NEW Relic',
  },
  {
    title: 'Pieces of Heart (36 Total)',
    classic: '1 in Ice Cavern + 2 Stone of Agony grottos in Hyrule Field.',
    switch2:
      'Zero Heart Pieces inside dungeons! Added 2 cross-era "Fairy’s Thoughts" puzzles in Hyrule Field + 1 Death Mountain Crater Business Scrub, and Gerudo Valley’s crate is now a Hookshot-able Chest.',
    badge: '3 Relocated',
  },
  {
    title: 'Zora’s Domain (Adult Era)',
    classic: 'Remained permanently frozen forever even after beating Water Temple.',
    switch2:
      'Actually unfreezes after clearing the Water Temple! Restores Zora NPCs and reopens the 25-second Zora’s Domain ↔ Lake Hylia diving shortcut.',
    badge: 'World Thaws!',
  },
  {
    title: 'Hall of Fallen Foes & QoL',
    classic: 'Auto-jump only; Poacher’s Saw glitched out Deku Nut Upgrade #2.',
    switch2:
      'Dedicated Jump (X), Dash (Hold A), 360° Camera, Mic Ocarina, Threads of Time journal (-), fixed Deku Nut #2 bug, and Hall of Fallen Foes (84 automatic statues & Boss Rush)!',
    badge: '84 Statues',
  },
];

export function Switch2DiffModal({
  isOpen,
  onClose,
  state,
  onToggleSecret,
  onSelectRegion,
}: Switch2DiffModalProps) {
  const [activeTab, setActiveTab] = useState<DiffSectionTab>('all');

  const bottlesDone = UPGRADES_AND_BOTTLES.bottles.filter(
    (b) => state.completedSecretIds[b.id],
  ).length;
  const bigPoesDone = UPGRADES_AND_BOTTLES.bigPoeLocations.filter(
    (bp) => state.completedSecretIds[bp.id],
  ).length;
  const fairiesDone = UPGRADES_AND_BOTTLES.greatFairies.filter(
    (gf) => state.completedSecretIds[gf.id],
  ).length;
  const beansDone = SONGS_AND_QUESTS.magicBeans.filter(
    (bean) => state.completedSecretIds[bean.id],
  ).length;

  const remainingFairyRupees = UPGRADES_AND_BOTTLES.greatFairies.reduce(
    (sum, gf) => (state.completedSecretIds[gf.id] ? sum : sum + gf.rupeeCost),
    0,
  );
  const remainingBeanRupees = SONGS_AND_QUESTS.magicBeans.reduce(
    (sum, bean) => (state.completedSecretIds[bean.id] ? sum : sum + bean.buyCost),
    0,
  );

  const showSection = (tab: DiffSectionTab) => activeTab === 'all' || activeTab === tab;

  return (
    <SheetDialog
      isOpen={isOpen}
      onClose={onClose}
      testId="switch2-diff-modal"
      size="wide"
      title={
        <>
          <Zap size={19} aria-hidden="true" />
          <span>Switch 2 Remake Master Diff, Economy &amp; Hall of Fallen Foes</span>
        </>
      }
      subtitle={`Patch ${METADATA.game.latestPatch} · 5 Bottles · 6 Great Fairies (1,175 Rupees) · 10 Magic Beans (550 Rupees) · 84 Statues`}
    >
      {/* Section Tabs */}
      <div className="zelda-tablist" role="tablist" aria-label="Switch 2 Remake Guide Sections">
        {(
          [
            { id: 'all', label: 'All Changes & Trackers' },
            { id: 'comparison', label: 'N64/3DS vs Switch 2' },
            { id: 'bottles', label: `5 Bottles & Poes (${bottlesDone}/5)` },
            { id: 'fairies', label: `6 Great Fairies (${fairiesDone}/6)` },
            { id: 'beans', label: `10 Magic Beans (${beansDone}/10)` },
            { id: 'exclusives', label: 'Echo Gem & Fallen Foes' },
          ] as const
        ).map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            className="zelda-tab"
            aria-selected={activeTab === tab.id}
            data-testid={`diff-tab-${tab.id}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 1. N64/3DS vs Switch 2 Comparison Cards */}
      {showSection('comparison') ? (
        <section style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
          <h3 style={{ margin: 0, fontSize: 'var(--text-base)', color: 'var(--color-triforce)' }}>
            N64 (1998) / 3DS (2011) vs. Switch 2 Remake (Nov 2026)
          </h3>
          <div className="zelda-card-grid">
            {REMAKE_COMPARISON_CARDS.map((card) => (
              <article key={card.title} className="zelda-sheet-card">
                <div className="zelda-sheet-card__top">
                  <h4 className="zelda-sheet-card__title">{card.title}</h4>
                  <span className="zelda-badge zelda-badge--new">{card.badge}</span>
                </div>
                <p className="zelda-sheet-card__desc">
                  <strong>N64 / 3DS:</strong> {card.classic}
                </p>
                <p className="zelda-sheet-card__desc" style={{ color: 'var(--text-primary)' }}>
                  <strong>Switch 2:</strong> {card.switch2}
                </p>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      {/* 2. All 5 Empty Bottles + 10 Big Poe Hunt Spots */}
      {showSection('bottles') ? (
        <section style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '0.4rem',
            }}
          >
            <h3 style={{ margin: 0, fontSize: 'var(--text-base)', color: 'var(--color-triforce)' }}>
              <FlaskConical
                size={16}
                style={{ display: 'inline', verticalAlign: '-2px', marginRight: 6 }}
                aria-hidden="true"
              />
              All 5 Empty Bottles ({bottlesDone}/5) &amp; 10 Big Poe Locations ({bigPoesDone * 100}
              /500 Pts for Bottle!)
            </h3>
            <span className="zelda-badge zelda-badge--new">
              500 Pts = 5 Big Poes (Down from 1,000!) · 1,000 Pts = 200-Rupee Gold Rupee
            </span>
          </div>

          <div className="zelda-card-grid">
            {UPGRADES_AND_BOTTLES.bottles.map((b) => {
              const isDone = Boolean(state.completedSecretIds[b.id]);
              const regionName = REGION_BY_ID[b.regionId]?.name ?? b.regionId;
              return (
                <article
                  key={b.id}
                  className={`zelda-sheet-card ${isDone ? 'zelda-sheet-card--done' : ''}`.trim()}
                  data-testid={`diff-card-${b.id}`}
                >
                  <div className="zelda-sheet-card__top">
                    <div>
                      <h4 className="zelda-sheet-card__title">{b.title}</h4>
                      {b.switch2Status !== 'classic' ? (
                        <span
                          className={`zelda-badge ${
                            b.switch2Status === 'new-switch2'
                              ? 'zelda-badge--new'
                              : 'zelda-badge--updated'
                          }`}
                          style={{ marginTop: 4 }}
                        >
                          {b.switch2Status === 'new-switch2'
                            ? 'NEW IN SWITCH 2'
                            : 'UPDATED IN SWITCH 2'}
                        </span>
                      ) : null}
                    </div>
                    <button
                      type="button"
                      role="checkbox"
                      aria-checked={isDone}
                      className="zelda-check-btn"
                      data-testid={`diff-check-${b.id}`}
                      onClick={() => onToggleSecret(b.id)}
                    >
                      <Check size={13} aria-hidden="true" />
                      <span>{isDone ? 'Owned' : 'Check'}</span>
                    </button>
                  </div>
                  <p className="zelda-sheet-card__desc">{b.howToGet}</p>
                  <div className="zelda-sheet-card__footer">
                    <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
                      Era: {b.era}
                    </span>
                    <button
                      type="button"
                      className="zelda-link-btn"
                      onClick={() => {
                        onSelectRegion(b.regionId);
                        onClose();
                      }}
                    >
                      <MapPin size={13} aria-hidden="true" />
                      <span>{regionName}</span>
                    </button>
                  </div>
                </article>
              );
            })}
          </div>

          <details className="zelda-callout" open>
            <summary style={{ cursor: 'pointer', fontWeight: 700, color: 'var(--text-primary)' }}>
              Hyrule Field 10 Big Poe Hunt Checklist ({bigPoesDone}/10 Hunted · {bigPoesDone * 100}{' '}
              Points — Need 5 Poes / 500 Pts for Bottle #5)
            </summary>
            <div className="zelda-card-grid" style={{ marginTop: '0.6rem' }}>
              {UPGRADES_AND_BOTTLES.bigPoeLocations.map((bp, idx) => {
                const isDone = Boolean(state.completedSecretIds[bp.id]);
                return (
                  <div
                    key={bp.id}
                    className={`zelda-quest-step ${isDone ? 'zelda-quest-step--done' : ''}`.trim()}
                  >
                    <div className="zelda-sheet-card__top">
                      <strong style={{ fontSize: 'var(--text-xs)' }}>
                        #{idx + 1}: {bp.spot}
                      </strong>
                      <button
                        type="button"
                        role="checkbox"
                        aria-checked={isDone}
                        className="zelda-check-btn"
                        data-testid={`diff-check-${bp.id}`}
                        onClick={() => onToggleSecret(bp.id)}
                      >
                        <Check size={12} aria-hidden="true" />
                        <span>100 pts</span>
                      </button>
                    </div>
                    <p className="zelda-sheet-card__desc">{bp.cue}</p>
                  </div>
                );
              })}
            </div>
          </details>
        </section>
      ) : null}

      {/* 3. All 6 Great Fairies = 1,175 Rupees */}
      {showSection('fairies') ? (
        <section style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '0.4rem',
            }}
          >
            <h3 style={{ margin: 0, fontSize: 'var(--text-base)', color: 'var(--color-triforce)' }}>
              <Coins
                size={16}
                style={{ display: 'inline', verticalAlign: '-2px', marginRight: 6 }}
                aria-hidden="true"
              />
              All 6 Great Fairy Fountains = 1,175 Rupees Total (25 + 50 + 100 + 200 + 300 + 500)
            </h3>
            <span className="zelda-badge zelda-badge--rupee">
              Remaining Offering: {remainingFairyRupees} Rupees
            </span>
          </div>

          <div className="zelda-callout zelda-callout--amber">
            <div className="zelda-callout__title">
              <ShieldAlert size={15} aria-hidden="true" />
              <span>Swapped Early Rewards &amp; Mandatory 500-Rupee Adult’s Wallet Gate</span>
            </div>
            <p style={{ margin: 0 }}>
              <strong>DMT Summit (25 Rupees)</strong> now grants{' '}
              <strong>Magic Meter + Din’s Fire</strong> immediately, while{' '}
              <strong>Hyrule Castle (50 Rupees)</strong> grants{' '}
              <strong>Charged Spin Attack</strong>! Claim the{' '}
              <strong>Adult’s Wallet (10 Gold Skulltulas)</strong> before visiting Desert Colossus
              (300 Rupees) or Outside Ganon’s Castle (500 Rupees).
            </p>
          </div>

          <div className="zelda-card-grid">
            {UPGRADES_AND_BOTTLES.greatFairies.map((gf) => {
              const isDone = Boolean(state.completedSecretIds[gf.id]);
              const regionName = REGION_BY_ID[gf.regionId]?.name ?? gf.regionId;
              return (
                <article
                  key={gf.id}
                  className={`zelda-sheet-card ${isDone ? 'zelda-sheet-card--done' : ''}`.trim()}
                  data-testid={`diff-card-${gf.id}`}
                >
                  <div className="zelda-sheet-card__top">
                    <div>
                      <h4 className="zelda-sheet-card__title">{gf.title}</h4>
                      <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap', marginTop: 4 }}>
                        <span className="zelda-badge zelda-badge--rupee">
                          {gf.rupeeCost} Rupees
                        </span>
                        <span className="zelda-badge zelda-badge--updated">{gf.reward}</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      role="checkbox"
                      aria-checked={isDone}
                      className="zelda-check-btn"
                      data-testid={`diff-check-${gf.id}`}
                      onClick={() => onToggleSecret(gf.id)}
                    >
                      <Check size={13} aria-hidden="true" />
                      <span>{isDone ? 'Blessed' : 'Check'}</span>
                    </button>
                  </div>
                  <p className="zelda-sheet-card__desc">{gf.howToGet}</p>
                  <div className="zelda-sheet-card__footer">
                    <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
                      Era: {gf.era}
                    </span>
                    <button
                      type="button"
                      className="zelda-link-btn"
                      onClick={() => {
                        onSelectRegion(gf.regionId);
                        onClose();
                      }}
                    >
                      <MapPin size={13} aria-hidden="true" />
                      <span>{regionName}</span>
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      ) : null}

      {/* 4. All 10 Magic Beans = 550 Rupees */}
      {showSection('beans') ? (
        <section style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '0.4rem',
            }}
          >
            <h3 style={{ margin: 0, fontSize: 'var(--text-base)', color: 'var(--color-triforce)' }}>
              <Sprout
                size={16}
                style={{ display: 'inline', verticalAlign: '-2px', marginRight: 6 }}
                aria-hidden="true"
              />
              All 10 Magic Bean Plots = 550 Rupees (10, 20, 30, 40, 50, 60, 70, 80, 90, 100)
            </h3>
            <span className="zelda-badge zelda-badge--rupee">
              Remaining Bean Cost: {remainingBeanRupees} Rupees
            </span>
          </div>

          <div className="zelda-card-grid">
            {SONGS_AND_QUESTS.magicBeans.map((bean, idx) => {
              const isDone = Boolean(state.completedSecretIds[bean.id]);
              const regionName = REGION_BY_ID[bean.regionId]?.name ?? bean.regionId;
              return (
                <article
                  key={bean.id}
                  className={`zelda-sheet-card ${isDone ? 'zelda-sheet-card--done' : ''}`.trim()}
                  data-testid={`diff-card-${bean.id}`}
                >
                  <div className="zelda-sheet-card__top">
                    <div>
                      <h4 className="zelda-sheet-card__title">
                        Bean #{idx + 1} — {regionName}
                      </h4>
                      <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap', marginTop: 4 }}>
                        <span className="zelda-badge zelda-badge--rupee">
                          {bean.buyCost} Rupees
                        </span>
                        {bean.hasSkulltulaBug ? (
                          <span className="zelda-badge">🕷 Soft Soil Skulltula</span>
                        ) : null}
                      </div>
                    </div>
                    <button
                      type="button"
                      role="checkbox"
                      aria-checked={isDone}
                      className="zelda-check-btn"
                      data-testid={`diff-check-${bean.id}`}
                      onClick={() => onToggleSecret(bean.id)}
                    >
                      <Check size={13} aria-hidden="true" />
                      <span>{isDone ? 'Planted' : 'Check'}</span>
                    </button>
                  </div>
                  <p className="zelda-sheet-card__desc">
                    <strong>Soil Plot:</strong> {bean.location}
                  </p>
                  <p className="zelda-sheet-card__desc">
                    <strong>Adult Payoff:</strong> {bean.adultPayoff}
                  </p>
                  <div className="zelda-sheet-card__footer">
                    <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
                      Child Plant → Adult Ride
                    </span>
                    <button
                      type="button"
                      className="zelda-link-btn"
                      onClick={() => {
                        onSelectRegion(bean.regionId);
                        onClose();
                      }}
                    >
                      <MapPin size={13} aria-hidden="true" />
                      <span>{regionName}</span>
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      ) : null}

      {/* 5. Echo Gem (20 Skulltulas) & Hall of Fallen Foes (84 Statues + Boss Rush) */}
      {showSection('exclusives') ? (
        <section style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
          <h3 style={{ margin: 0, fontSize: 'var(--text-base)', color: 'var(--color-triforce)' }}>
            <Trophy
              size={16}
              style={{ display: 'inline', verticalAlign: '-2px', marginRight: 6 }}
              aria-hidden="true"
            />
            Echo Gem (20 Skulltulas), Skulltula Milestones &amp; Hall of Fallen Foes (84 Statues)
          </h3>

          <div className="zelda-card-grid">
            {UPGRADES_AND_BOTTLES.skulltulaRewards.map((skr) => {
              const isDone = Boolean(state.completedSecretIds[skr.id]);
              return (
                <article
                  key={skr.id}
                  className={`zelda-sheet-card ${isDone ? 'zelda-sheet-card--done' : ''}`.trim()}
                  data-testid={`diff-card-${skr.id}`}
                >
                  <div className="zelda-sheet-card__top">
                    <div>
                      <h4 className="zelda-sheet-card__title">
                        {skr.tokens} Skulltulas — {skr.reward}
                      </h4>
                      {skr.switch2Status !== 'classic' ? (
                        <span
                          className={`zelda-badge ${
                            skr.switch2Status === 'new-switch2'
                              ? 'zelda-badge--new'
                              : 'zelda-badge--updated'
                          }`}
                          style={{ marginTop: 4 }}
                        >
                          {skr.switch2Status === 'new-switch2'
                            ? 'NEW IN SWITCH 2'
                            : 'UPDATED IN SWITCH 2'}
                        </span>
                      ) : null}
                    </div>
                    <button
                      type="button"
                      role="checkbox"
                      aria-checked={isDone}
                      className="zelda-check-btn"
                      data-testid={`diff-check-${skr.id}`}
                      onClick={() => onToggleSecret(skr.id)}
                    >
                      <Check size={13} aria-hidden="true" />
                      <span>{isDone ? 'Claimed' : 'Check'}</span>
                    </button>
                  </div>
                  <p className="zelda-sheet-card__desc">{skr.notes}</p>
                  <div className="zelda-sheet-card__footer">
                    <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
                      House of Skulltula
                    </span>
                    <button
                      type="button"
                      className="zelda-link-btn"
                      onClick={() => {
                        onSelectRegion(skr.regionId);
                        onClose();
                      }}
                    >
                      <MapPin size={13} aria-hidden="true" />
                      <span>Kakariko Village</span>
                    </button>
                  </div>
                </article>
              );
            })}

            {SONGS_AND_QUESTS.switch2Exclusives.map((sw2) => {
              const isDone = Boolean(state.completedSecretIds[sw2.id]);
              const regionName = REGION_BY_ID[sw2.regionId]?.name ?? sw2.regionId;
              return (
                <article
                  key={sw2.id}
                  className={`zelda-sheet-card ${isDone ? 'zelda-sheet-card--done' : ''}`.trim()}
                  data-testid={`diff-card-${sw2.id}`}
                >
                  <div className="zelda-sheet-card__top">
                    <div>
                      <h4 className="zelda-sheet-card__title">{sw2.title}</h4>
                      <span className="zelda-badge zelda-badge--new" style={{ marginTop: 4 }}>
                        <Sparkles size={11} aria-hidden="true" />
                        <span>NEW SWITCH 2 HUB</span>
                      </span>
                    </div>
                    <button
                      type="button"
                      role="checkbox"
                      aria-checked={isDone}
                      className="zelda-check-btn"
                      data-testid={`diff-check-${sw2.id}`}
                      onClick={() => onToggleSecret(sw2.id)}
                    >
                      <Check size={13} aria-hidden="true" />
                      <span>{isDone ? 'Unlocked' : 'Check'}</span>
                    </button>
                  </div>
                  <p className="zelda-sheet-card__desc">{sw2.description}</p>
                  <div className="zelda-sheet-card__footer">
                    <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
                      {sw2.id === 'sw2-hall-of-fallen-foes'
                        ? '84 Automatic Statues + Boss Rush'
                        : 'Switch 2 Feature'}
                    </span>
                    <button
                      type="button"
                      className="zelda-link-btn"
                      onClick={() => {
                        onSelectRegion(sw2.regionId);
                        onClose();
                      }}
                    >
                      <MapPin size={13} aria-hidden="true" />
                      <span>{regionName}</span>
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      ) : null}
    </SheetDialog>
  );
}
