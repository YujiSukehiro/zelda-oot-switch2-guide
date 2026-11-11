import React from 'react';
import { Check, Music, X } from 'lucide-react';
import { REQUIREMENT_BY_ID } from '../../data';

export interface RequirementPillProps {
  reqId: string;
  isSatisfied: boolean;
  isActive?: boolean;
  onSelect: (reqId: string, triggerEl: HTMLButtonElement) => void;
}

export const RequirementPill: React.FC<RequirementPillProps> = ({
  reqId,
  isSatisfied,
  isActive = false,
  onSelect,
}) => {
  const requirement = REQUIREMENT_BY_ID[reqId];
  const label = requirement?.name ?? reqId;
  const isSong = requirement?.category === 'song' || reqId.startsWith('song-');

  return (
    <button
      type="button"
      data-testid={`req-pill-${reqId}`}
      className={`req-pill ${isSatisfied ? 'is-satisfied' : 'is-missing'} ${
        isActive ? 'is-active' : ''
      }`}
      aria-expanded={isActive}
      aria-haspopup="dialog"
      title={
        isSatisfied
          ? `${label} — Owned (click for details)`
          : `${label} — Missing (click to see how to get it)`
      }
      onClick={(e) => {
        e.stopPropagation();
        onSelect(reqId, e.currentTarget);
      }}
    >
      <span className="req-pill-status-icon" aria-hidden="true">
        {isSatisfied ? <Check size={12} strokeWidth={2.75} /> : <X size={12} strokeWidth={2.75} />}
      </span>
      {isSong && <Music size={11} className="req-pill-music-icon" aria-hidden="true" />}
      <span className="req-pill-label">{label}</span>
    </button>
  );
};
