import '@testing-library/jest-dom/vitest';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { App } from './App';
import { STORAGE_KEY } from './lib/storage';

beforeEach(() => {
  window.localStorage.clear();
  window.history.replaceState(null, '', '/');
});

afterEach(() => {
  cleanup();
});

describe('App Wave 3 Integration', () => {
  it('syncs regionId, era, and spotlight with window.location.hash without mutating pathname and persists secret checkoffs', () => {
    window.history.replaceState(
      null,
      '',
      '/Zelda/#region=kakariko-village&era=child&spotlight=1',
    );

    render(<App />);

    expect(window.location.pathname).toBe('/Zelda/');
    expect(screen.getByTestId('era-filter-child')).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByTestId('spotlight-toggle-btn')).toHaveAttribute('aria-pressed', 'true');

    const dossier = screen.getByTestId('region-dossier');
    expect(within(dossier).getByRole('heading', { name: 'Kakariko Village' })).toBeInTheDocument();

    // Disable spotlight to reveal all Kakariko secrets and check off hp-07
    fireEvent.click(screen.getByTestId('spotlight-toggle-btn'));
    expect(window.location.pathname).toBe('/Zelda/');
    expect(window.location.hash).not.toContain('spotlight=1');

    fireEvent.click(screen.getByTestId('secret-check-hp-07'));
    expect(screen.getByTestId('global-progress-pill')).toHaveTextContent('1/231');
    expect(window.localStorage.getItem(STORAGE_KEY)).toContain('"hp-07":true');
  });

  it('opens OcarinaModal with initialSongId when Songbook is triggered from RegionDrawer', () => {
    window.history.replaceState(null, '', '/#region=kakariko-village');

    render(<App />);

    const stormsCard = screen.getByTestId('secret-card-song-storms');
    const songbookBtn = within(stormsCard).getByRole('button', { name: /songbook/i });
    fireEvent.click(songbookBtn);

    expect(screen.getByTestId('ocarina-modal')).toBeInTheDocument();
    expect(window.location.hash).toContain('region=kakariko-village');
    expect(window.location.hash).toContain('sheet=ocarina');
    expect(screen.getByTestId('song-card-song-storms')).toBeInTheDocument();
  });

  it('expands LoadoutDock and surfaces UnlockToast when toggling Adult Link + Hookshot', () => {
    render(<App />);

    fireEvent.click(screen.getByTestId('loadout-dock-expand-btn'));
    fireEvent.click(screen.getByTestId('loadout-req-era-adult'));
    fireEvent.click(screen.getByTestId('loadout-req-hookshot'));

    const toast = screen.getByTestId('unlock-toast');
    expect(toast).toHaveTextContent(/Hookshot unlocked \d+ new secrets/i);
  });

  it('switches between World Map and Horizontal Optimal Route, syncs shared secret checkboxes, and surfaces Pick Up Where You Left Off banner', () => {
    render(<App />);

    // Initially no activity -> no resume banner
    expect(screen.queryByTestId('resume-banner')).not.toBeInTheDocument();

    // Switch to Optimal Route view via TopCommandBar
    fireEvent.click(screen.getByTestId('view-mode-route'));
    expect(window.location.hash).toContain('view=route');
    expect(screen.getByTestId('optimal-route-view')).toBeInTheDocument();

    // Check off the first collectible in Ch. 1 (Kokiri Sword eq-kokiri-sword) directly from Optimal Route
    const swordCheckbox = screen.getByTestId('route-secret-check-eq-kokiri-sword');
    fireEvent.click(swordCheckbox);
    expect(screen.getByTestId('global-progress-pill')).toHaveTextContent('1/231');

    // Resume banner now appears with Pick Up Where You Left Off
    const resumeBanner = screen.getByTestId('resume-banner');
    expect(resumeBanner).toHaveTextContent(/Pick Up Where You Left Off/i);

    // Clicking "Area on Map" on the resume banner jumps back to World Map and opens the Region Dossier
    fireEvent.click(screen.getByTestId('resume-open-map-btn'));
    expect(window.location.hash).not.toContain('view=route');
    expect(screen.getByTestId('region-dossier')).toBeInTheDocument();

    // Clicking "Continue Guide" returns right back to the Optimal Route chapter & step
    fireEvent.click(screen.getByTestId('resume-continue-route-btn'));
    expect(window.location.hash).toContain('view=route');
    expect(screen.getByTestId('optimal-route-view')).toBeInTheDocument();
  });
});
