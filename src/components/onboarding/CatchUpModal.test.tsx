import '@testing-library/jest-dom/vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { CatchUpModal } from './index';

afterEach(() => {
  cleanup();
});

describe('CatchUpModal — Playthrough Sync Wizard', () => {
  it('renders play-style options, story presets including Goron City — 1st Visit, and submits markPriorSecretsAndSteps', () => {
    const onClose = vi.fn();
    const onApplyCatchUp = vi.fn();

    render(
      <CatchUpModal
        isOpen={true}
        onClose={onClose}
        onApplyCatchUp={onApplyCatchUp}
      />,
    );

    const dialog = screen.getByTestId('catch-up-modal');
    expect(dialog).toBeInTheDocument();

    // Step 1 defaults to Guided Co-Pilot + Floor Maps
    expect(screen.getByTestId('catchup-style-guided')).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByTestId('catchup-style-map')).toHaveAttribute('aria-pressed', 'false');
    expect(screen.getByTestId('catchup-style-route')).toHaveAttribute('aria-pressed', 'false');

    // Step 2 includes Fresh Start, Goron City — 1st Visit, Post-Dodongo, 3 Stones, Post-Forest, Post-Water, Endgame
    expect(screen.getByTestId('catchup-preset-fresh-start')).toBeInTheDocument();
    const goronVisitCard = screen.getByTestId('catchup-preset-goron-city-visit-1');
    expect(goronVisitCard).toHaveTextContent(/Goron City — 1st Visit/i);
    expect(screen.getByTestId('catchup-preset-post-dodongo')).toBeInTheDocument();
    expect(screen.getByTestId('catchup-preset-three-stones')).toBeInTheDocument();
    expect(screen.getByTestId('catchup-preset-post-forest-temple')).toBeInTheDocument();
    expect(screen.getByTestId('catchup-preset-post-water-temple')).toBeInTheDocument();
    expect(screen.getByTestId('catchup-preset-endgame')).toBeInTheDocument();

    // Select Goron City — 1st Visit and verify markPriorSecretsAndSteps checkbox is checked
    fireEvent.click(goronVisitCard);
    const markPriorCheckbox = screen.getByTestId(
      'catchup-mark-prior-checkbox',
    ) as HTMLInputElement;
    expect(markPriorCheckbox.checked).toBe(true);

    // Apply checkpoint
    fireEvent.click(screen.getByTestId('catchup-apply-btn'));
    expect(onApplyCatchUp).toHaveBeenCalledWith(
      expect.objectContaining({
        presetId: 'goron-city-visit-1',
        playStyle: 'guided',
        markPriorSecretsAndSteps: true,
        targetRegionId: 'goron-city',
      }),
    );
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('allows switching playStyle to World Map or Optimal Route and unchecking markPriorSecretsAndSteps', () => {
    const onApplyCatchUp = vi.fn();

    render(
      <CatchUpModal
        isOpen={true}
        onClose={vi.fn()}
        onApplyCatchUp={onApplyCatchUp}
      />,
    );

    fireEvent.click(screen.getByTestId('catchup-style-route'));
    fireEvent.click(screen.getByTestId('catchup-preset-post-water-temple'));
    fireEvent.click(screen.getByTestId('catchup-mark-prior-checkbox'));
    fireEvent.click(screen.getByTestId('catchup-apply-btn'));

    expect(onApplyCatchUp).toHaveBeenCalledWith(
      expect.objectContaining({
        presetId: 'post-water-temple',
        playStyle: 'route',
        markPriorSecretsAndSteps: false,
      }),
    );
  });
});
