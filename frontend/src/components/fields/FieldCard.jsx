import React from 'react';
import { useNavigate } from 'react-router-dom';
import { StageBadge, StatusBadge } from '../common/Badge';
import { formatDate, timeAgo } from '../../utils/helpers';

export default function FieldCard({ field }) {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate(`/fields/${field.id}`)}
      style={{
        background: '#fff',
        border: '1px solid var(--color-light-shade-50)',
        borderRadius: 'var(--border-radius-md)',
        padding: '1.25rem',
        cursor: 'pointer',
        transition: 'box-shadow var(--transition), transform var(--transition)',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.6rem',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = '0 4px 16px rgba(16,19,48,0.1)';
        e.currentTarget.style.transform = 'translateY(-1px)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = 'none';
        e.currentTarget.style.transform = 'translateY(0)';
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
        <h3 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--color-text-dark)' }}>
          {field.name}
        </h3>
        <StatusBadge status={field.status} />
      </div>
      <p style={{ fontSize: '0.85rem', color: 'var(--color-text)' }}>
        {field.crop_type}
      </p>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
        <StageBadge stage={field.current_stage} />
      </div>
      <div style={{ borderTop: '1px solid var(--color-light-shade-50)', paddingTop: '0.6rem', display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: 'var(--color-text)', opacity: 0.75 }}>
        <span>Planted {formatDate(field.planting_date)}</span>
        <span>Updated {timeAgo(field.last_updated_at)}</span>
      </div>
      {field.agent_name && (
        <p style={{ fontSize: '0.78rem', color: 'var(--color-text)', opacity: 0.7 }}>
          Agent: {field.agent_name}
        </p>
      )}
    </div>
  );
}
