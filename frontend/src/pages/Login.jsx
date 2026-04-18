import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Button from '../components/common/Button';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message ?? 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--color-light)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 400,
          background: '#fff',
          borderRadius: 'var(--border-radius-lg)',
          boxShadow: '0 8px 32px rgba(16,19,48,0.1)',
          overflow: 'hidden',
        }}
      >
        {/* Header band */}
        <div
          style={{
            background: 'var(--color-dark)',
            padding: '2rem',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <span style={{ fontSize: '2.5rem' }}>🌾</span>
          <h1 style={{ color: '#fff', fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>
            Shamba Records
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.85rem', margin: 0 }}>
            Crop Progress Tracker
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--color-text-dark)', margin: 0 }}>
            Sign in to your account
          </h2>

          {error && (
            <div
              style={{
                background: '#fee2e2',
                color: '#b91c1c',
                padding: '0.65rem 0.875rem',
                borderRadius: 'var(--border-radius)',
                fontSize: '0.85rem',
              }}
            >
              {error}
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            <label style={labelStyle}>Email</label>
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              required
              placeholder="you@example.com"
              style={inputStyle}
              onFocus={(e) => (e.target.style.borderColor = 'var(--color-primary)')}
              onBlur={(e) => (e.target.style.borderColor = 'var(--color-light-shade-100)')}
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            <label style={labelStyle}>Password</label>
            <input
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              required
              placeholder="••••••••"
              style={inputStyle}
              onFocus={(e) => (e.target.style.borderColor = 'var(--color-primary)')}
              onBlur={(e) => (e.target.style.borderColor = 'var(--color-light-shade-100)')}
            />
          </div>

          <Button type="submit" loading={loading} style={{ width: '100%', justifyContent: 'center' }}>
            Sign In
          </Button>

          {/* Demo hint */}
          <div
            style={{
              background: 'var(--color-light)',
              borderRadius: 'var(--border-radius)',
              padding: '0.75rem',
              fontSize: '0.78rem',
              color: 'var(--color-text)',
              lineHeight: 1.6,
            }}
          >
            <strong style={{ color: 'var(--color-text-dark)' }}>Demo accounts</strong><br />
            Admin: <code>admin@shamba.io</code> / <code>admin123</code><br />
            Agent: <code>agent@shamba.io</code> / <code>agent123</code>
          </div>
        </form>
      </div>
    </div>
  );
}

const labelStyle = {
  fontSize: '0.8rem',
  fontWeight: 600,
  color: 'var(--color-text-dark)',
  textTransform: 'uppercase',
  letterSpacing: '0.04em',
};

const inputStyle = {
  border: '1px solid var(--color-light-shade-100)',
  borderRadius: 'var(--border-radius)',
  padding: '0.6rem 0.875rem',
  width: '100%',
  background: '#fff',
  color: 'var(--color-text-dark)',
  outline: 'none',
  transition: 'border-color 0.15s',
  fontFamily: 'inherit',
  fontSize: '0.9375rem',
};
