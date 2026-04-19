import React from 'react';

const variants = {
  primary: {
    background: '#10b981',
    color: '#fff',
    border: 'none',
  },
  secondary: {
    background: 'var(--color-secondary)',
    color: '#fff',
    border: 'none',
  },
  outline: {
    background: 'transparent',
    color: '#10b981',
    border: '1px solid #10b981',
  },
  ghost: {
    background: 'transparent',
    color: 'var(--color-text)',
    border: '1px solid var(--color-medium)',
  },
  danger: {
    background: '#ef4444',
    color: '#fff',
    border: 'none',
  },
};

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  onClick,
  type = 'button',
  style = {},
}) {
  const base = variants[variant] ?? variants.primary;
  const padding = size === 'sm' ? '0.35rem 0.75rem' : size === 'lg' ? '0.75rem 1.5rem' : '0.5rem 1rem';
  const fontSize = size === 'sm' ? '0.8125rem' : '0.9375rem';

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      style={{
        ...base,
        padding,
        fontSize,
        borderRadius: 'var(--border-radius)',
        fontWeight: 500,
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.4rem',
        transition: 'opacity var(--transition)',
        opacity: disabled || loading ? 0.6 : 1,
        cursor: disabled || loading ? 'not-allowed' : 'pointer',
        ...style,
      }}
    >
      {loading ? <Spinner /> : null}
      {children}
    </button>
  );
}

function Spinner() {
  return (
    <span
      style={{
        width: 14,
        height: 14,
        border: '2px solid rgba(255,255,255,0.4)',
        borderTopColor: '#fff',
        borderRadius: '50%',
        animation: 'spin 0.6s linear infinite',
        display: 'inline-block',
      }}
    />
  );
}
