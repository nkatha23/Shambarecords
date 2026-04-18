import React from 'react';
import { stageColor, stageBg, STAGE_LABELS } from '../../utils/helpers';

const ALL_STAGES = ['planted', 'growing', 'ready', 'harvested'];

export default function StageChart({ breakdown }) {
  const total = Object.values(breakdown ?? {}).reduce((a, b) => a + b, 0);

  if (total === 0) {
    return (
      <div style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--color-text)', opacity: 0.6, fontSize: '0.875rem' }}>
        No fields yet.
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      {ALL_STAGES.map((stage) => {
        const count = breakdown?.[stage] ?? 0;
        const pct = total ? Math.round((count / total) * 100) : 0;
        return (
          <div key={stage} style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
              <span style={{ fontWeight: 500, color: 'var(--color-text-dark)' }}>{STAGE_LABELS[stage]}</span>
              <span style={{ color: 'var(--color-text)' }}>{count} field{count !== 1 ? 's' : ''}</span>
            </div>
            <div style={{ height: 8, background: 'var(--color-light-shade-50)', borderRadius: 4, overflow: 'hidden' }}>
              <div
                style={{
                  height: '100%',
                  width: `${pct}%`,
                  background: stageColor(stage),
                  borderRadius: 4,
                  transition: 'width 0.4s ease',
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
