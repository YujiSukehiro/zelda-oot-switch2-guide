import '@testing-library/jest-dom/vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  computeGlobalProgress,
  createDefaultProgressState,
  deriveEffectiveRequirements,
} from '../../lib/gating';
import { InventoryModal } from './index';

afterEach(() => {
  cleanup();
});

describe('InventoryModal — Pause Subscreens', () => {
  it('renders Select Item, Equipment, and Quest Status subscreens, toggles gear/stones/medallions/songs, and switches World Lock Mode', () => {
    const state = createDefaultProgressState();
    state.completedSecretIds['hp-01'] = true;
    state.completedSecretIds['hp-02'] = true;
    state.completedSecretIds['hp-03'] = true;
    state.completedSecretIds['hp-04'] = true;
    const progress = computeGlobalProgress(state);
    const effective = deriveEffectiveRequirements(state);

    const onToggleRequirement = vi.fn();
    const onToggleSecret = vi.fn();
    const onToggleLoadoutMode = vi.fn();
    const onOpenCatchUp = vi.fn();

    render(
      <InventoryModal
        isOpen={true}
        onClose={vi.fn()}
        state={state}
        effectiveRequirements={effective}
        globalProgress={progress}
        onToggleRequirement={onToggleRequirement}
        onToggleSecret={onToggleSecret}
        onToggleLoadoutMode={onToggleLoadoutMode}
        onOpenCatchUp={onOpenCatchUp}
      />,
    );

    const dialog = screen.getByTestId('inventory-modal');
    expect(dialog).toHaveTextContent('4 Heart Containers');

    // World Lock Mode segmented switch
    expect(screen.getByTestId('world-lock-progressive-btn')).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    fireEvent.click(screen.getByTestId('world-lock-checklist-btn'));
    expect(onToggleLoadoutMode).toHaveBeenCalledWith(false);

    // Tab 1: Select Item Grid
    expect(screen.getByTestId('inventory-panel-items')).not.toHaveAttribute('hidden');
    fireEvent.click(screen.getByTestId('inventory-item-bombs'));
    expect(onToggleRequirement).toHaveBeenCalledWith('bombs');

    // Tab 2: Equipment Matrix (Swords, Shields, Tunics, Boots, Strength, Scale)
    fireEvent.click(screen.getByTestId('inventory-tab-equipment'));
    expect(screen.getByTestId('inventory-panel-equipment')).not.toHaveAttribute('hidden');
    expect(screen.getByTestId('inventory-panel-items')).toHaveAttribute('hidden');
    fireEvent.click(screen.getByTestId('inventory-equip-goron-bracelet'));
    expect(onToggleRequirement).toHaveBeenCalledWith('goron-bracelet');
    fireEvent.click(screen.getByTestId('inventory-equip-iron-boots'));
    expect(onToggleRequirement).toHaveBeenCalledWith('iron-boots');

    // Tab 3: Quest Status (3 Spiritual Stones, 6 Medallions, 13 Ocarina Songs)
    fireEvent.click(screen.getByTestId('inventory-tab-quest'));
    expect(screen.getByTestId('inventory-panel-quest')).not.toHaveAttribute('hidden');
    fireEvent.click(screen.getByTestId('inventory-quest-stone-emerald'));
    expect(onToggleRequirement).toHaveBeenCalledWith('stone-emerald');
    expect(onToggleSecret).toHaveBeenCalledWith('stone-emerald', true);
    fireEvent.click(screen.getByTestId('inventory-quest-medallion-forest'));
    expect(onToggleRequirement).toHaveBeenCalledWith('medallion-forest');
    expect(onToggleSecret).toHaveBeenCalledWith('medallion-forest', true);
    fireEvent.click(screen.getByTestId('inventory-song-song-lullaby'));
    expect(onToggleRequirement).toHaveBeenCalledWith('song-lullaby');
  });
});
