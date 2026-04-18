import React from 'react';

export default function StatCard({ label, value, accent = 'var(--color-primary)', sub }) {
  return (
    <div
      style={{
        background: '#fff',
        border: '1px solid var(--color-light-shade-50)',
        borderRadius: 'var(--border-radius-md)',
        padding: '1.25rem 1.5rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.35rem',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <span
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: 4,
          height: '100%',
          background: accent,
          borderRadius: '4px 0 0 4px',
        }}
      />
      <span style={{ fontSize: '0.8rem', color: 'var(--color-text)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        {label}
      </span>
      <span style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--color-text-dark)', lineHeight: 1 }}>
        {value}
      </span>
      {sub && (
        <span style={{ fontSize: '0.8rem', color: 'var(--color-text)', opacity: 0.75 }}>
          {sub}
        </span>
      )}
    </div>
  );
}
