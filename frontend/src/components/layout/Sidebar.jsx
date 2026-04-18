import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: '▦' },
  { to: '/fields', label: 'Fields', icon: '◱' },
];

const adminItems = [
  { to: '/users', label: 'Agents', icon: '◈' },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  const items = user?.role === 'admin' ? [...navItems, ...adminItems] : navItems;

  return (
    <aside
      style={{
        width: 'var(--sidebar-width)',
        minHeight: '100vh',
        background: 'var(--color-dark)',
        display: 'flex',
        flexDirection: 'column',
        position: 'fixed',
        top: 0,
        left: 0,
        zIndex: 100,
      }}
    >
      {/* Logo */}
      <div
        style={{
          padding: '1.25rem 1.5rem',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
        }}
      >
        <span style={{ fontSize: '1.25rem' }}>🌾</span>
        <span style={{ color: '#fff', fontWeight: 700, fontSize: '1rem', letterSpacing: '-0.01em' }}>
          Shamba Records
        </span>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '1rem 0' }}>
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '0.65rem 1.5rem',
              color: isActive ? '#fff' : 'rgba(255,255,255,0.55)',
              fontWeight: isActive ? 600 : 400,
              fontSize: '0.9rem',
              background: isActive ? 'rgba(231,66,102,0.18)' : 'transparent',
              borderLeft: isActive ? '3px solid var(--color-primary)' : '3px solid transparent',
              transition: 'all var(--transition)',
              textDecoration: 'none',
            })}
          >
            <span style={{ fontSize: '1rem' }}>{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* User */}
      <div
        style={{
          padding: '1rem 1.5rem',
          borderTop: '1px solid rgba(255,255,255,0.08)',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              background: 'var(--color-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontWeight: 700,
              fontSize: '0.8rem',
              flexShrink: 0,
            }}
          >
            {user?.name?.[0]?.toUpperCase() ?? '?'}
          </div>
          <div style={{ overflow: 'hidden' }}>
            <p style={{ color: '#fff', fontSize: '0.85rem', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {user?.name}
            </p>
            <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.75rem', textTransform: 'capitalize' }}>
              {user?.role}
            </p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          style={{
            background: 'rgba(239,68,68,0.15)',
            border: 'none',
            borderRadius: 'var(--border-radius)',
            color: '#fca5a5',
            padding: '0.4rem 0.75rem',
            fontSize: '0.8rem',
            fontWeight: 500,
            textAlign: 'left',
            cursor: 'pointer',
            transition: 'background var(--transition)',
          }}
        >
          Sign out
        </button>
      </div>
    </aside>
  );
}
