import React from 'react';
import { useAuth } from '../../hooks/useAuth';

export default function Topbar({ title }) {
  const { user } = useAuth();

  return (
    <header
      style={{
        height: 'var(--topbar-height)',
        background: '#fff',
        borderBottom: '1px solid var(--color-light-shade-50)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 1.75rem',
        position: 'sticky',
        top: 0,
        zIndex: 50,
      }}
    >
      <h1 style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--color-text-dark)' }}>
        {title}
      </h1>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--color-text)' }}>
        <span
          style={{
            display: 'inline-block',
            padding: '0.2rem 0.55rem',
            background: user?.role === 'admin' ? '#fee2e2' : '#d1fae5',
            color: user?.role === 'admin' ? '#b91c1c' : '#065f46',
            borderRadius: '999px',
            fontSize: '0.75rem',
            fontWeight: 600,
            textTransform: 'capitalize',
          }}
        >
          {user?.role}
        </span>
        <span>{user?.name}</span>
      </div>
    </header>
  );
}
