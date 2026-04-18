import React from 'react';
import { stageColor, stageBg, statusColor, statusBg, STAGE_LABELS, STATUS_LABELS } from '../../utils/helpers';

export function StageBadge({ stage }) {
  return (
    <span
      style={{
        display: 'inline-block',
        padding: '0.2rem 0.6rem',
        borderRadius: '999px',
        fontSize: '0.75rem',
        fontWeight: 600,
        background: stageBg(stage),
        color: stageColor(stage),
        letterSpacing: '0.02em',
        textTransform: 'capitalize',
      }}
    >
      {STAGE_LABELS[stage] ?? stage}
    </span>
  );
}

export function StatusBadge({ status }) {
  return (
    <span
      style={{
        display: 'inline-block',
        padding: '0.2rem 0.6rem',
        borderRadius: '999px',
        fontSize: '0.75rem',
        fontWeight: 600,
        background: statusBg(status),
        color: statusColor(status),
        letterSpacing: '0.02em',
        textTransform: 'capitalize',
      }}
    >
      {STATUS_LABELS[status] ?? status}
    </span>
  );
}
