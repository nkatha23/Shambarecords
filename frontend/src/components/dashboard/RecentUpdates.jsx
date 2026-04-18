import React from 'react';
import { StageBadge } from '../common/Badge';
import { timeAgo } from '../../utils/helpers';

export default function RecentUpdates({ updates = [] }) {
  if (updates.length === 0) {
    return (
      <p style={{ color: 'var(--color-text)', opacity: 0.6, fontSize: '0.875rem', padding: '0.5rem 0' }}>
        No recent updates.
      </p>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
      {updates.map((u, i) => (
        <div
          key={u.id ?? i}
          style={{
            display: 'flex',
            gap: '0.75rem',
            padding: '0.75rem 0',
            borderBottom: i < updates.length - 1 ? '1px solid var(--color-light-shade-50)' : 'none',
            alignItems: 'flex-start',
          }}
        >
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              background: 'var(--color-light)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              fontSize: '0.85rem',
              color: 'var(--color-secondary)',
              fontWeight: 700,
            }}
          >
            {u.agent_name?.[0]?.toUpperCase() ?? '?'}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              <span style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--color-text-dark)' }}>
                {u.field_name}
              </span>
              <span style={{ fontSize: '0.75rem', color: 'var(--color-text)', opacity: 0.7, whiteSpace: 'nowrap' }}>
                {timeAgo(u.created_at)}
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.25rem', flexWrap: 'wrap' }}>
              <StageBadge stage={u.new_stage} />
              {u.agent_name && (
                <span style={{ fontSize: '0.78rem', color: 'var(--color-text)', opacity: 0.7 }}>by {u.agent_name}</span>
              )}
            </div>
            {u.notes && (
              <p style={{ fontSize: '0.8rem', color: 'var(--color-text)', marginTop: '0.3rem', lineHeight: 1.5 }}>
                {u.notes}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
