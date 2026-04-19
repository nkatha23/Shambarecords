import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message ?? 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={styles.page}>
      {/* Left panel */}
      <div style={styles.left}>
        <div style={styles.leftInner}>
          <div style={styles.logo}>🌾</div>
          <h1 style={styles.brand}>Shamba Records</h1>
          <p style={styles.tagline}>
            Track your fields,<br />one season at a time.
          </p>
          <div style={styles.divider} />
          <p style={styles.leftSub}>
            Monitor crop progress, coordinate agents, and stay ahead of every harvest.
          </p>
        </div>
      </div>

      {/* Right panel */}
      <div style={styles.right}>
        <div style={styles.formCard}>
          <h2 style={styles.heading}>Welcome back</h2>
          <p style={styles.sub}>Sign in to your account to continue.</p>

          <form onSubmit={handleSubmit} style={styles.form}>
            {error && <div style={styles.errorBox}>{error}</div>}

            <Field label="Email">
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                required
                placeholder="you@example.com"
                style={styles.input}
                onFocus={focusInput}
                onBlur={blurInput}
              />
            </Field>

            <Field label="Password">
              <input
                name="password"
                type="password"
                value={form.password}
                onChange={handleChange}
                required
                placeholder="••••••••"
                style={styles.input}
                onFocus={focusInput}
                onBlur={blurInput}
              />
            </Field>

            <button type="submit" disabled={loading} style={styles.btn}>
              {loading ? 'Signing in…' : 'Sign In'}
            </button>

            <p style={styles.switchText}>
              No account?{' '}
              <Link to="/register" style={styles.link}>Register →</Link>
            </p>
          </form>

        </div>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
      <label style={styles.label}>{label}</label>
      {children}
    </div>
  );
}

function focusInput(e) { e.target.style.borderColor = '#10b981'; e.target.style.boxShadow = '0 0 0 3px rgba(16,185,129,0.12)'; }
function blurInput(e)  { e.target.style.borderColor = '#e6e9f1'; e.target.style.boxShadow = 'none'; }

const styles = {
  page: {
    display: 'flex',
    minHeight: '100vh',
    fontFamily: 'Inter, sans-serif',
  },
  left: {
    width: '42%',
    background: '#101330',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '3rem 2.5rem',
    flexShrink: 0,
  },
  leftInner: {
    maxWidth: 320,
  },
  logo: {
    fontSize: '3rem',
    marginBottom: '1rem',
    display: 'block',
  },
  brand: {
    color: '#fff',
    fontSize: '1.75rem',
    fontWeight: 700,
    margin: '0 0 0.75rem',
    letterSpacing: '-0.02em',
  },
  tagline: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: '1.05rem',
    lineHeight: 1.7,
    margin: '0 0 1.5rem',
  },
  divider: {
    width: 40,
    height: 3,
    background: '#10b981',
    borderRadius: 2,
    marginBottom: '1.5rem',
  },
  leftSub: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: '0.875rem',
    lineHeight: 1.7,
    margin: 0,
  },
  right: {
    flex: 1,
    background: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '2rem',
  },
  formCard: {
    width: '100%',
    maxWidth: 400,
  },
  heading: {
    fontSize: '1.6rem',
    fontWeight: 700,
    color: '#101330',
    margin: '0 0 0.4rem',
    letterSpacing: '-0.01em',
  },
  sub: {
    color: '#687693',
    fontSize: '0.9rem',
    margin: '0 0 2rem',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.1rem',
  },
  label: {
    fontSize: '0.78rem',
    fontWeight: 600,
    color: '#101330',
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
  },
  input: {
    border: '1.5px solid #e6e9f1',
    borderRadius: '0.375rem',
    padding: '0.65rem 0.875rem',
    fontSize: '0.9375rem',
    color: '#101330',
    outline: 'none',
    width: '100%',
    background: '#fff',
    transition: 'border-color 0.15s, box-shadow 0.15s',
    fontFamily: 'inherit',
  },
  btn: {
    background: '#10b981',
    color: '#fff',
    border: 'none',
    borderRadius: '0.375rem',
    padding: '0.75rem',
    fontSize: '0.9375rem',
    fontWeight: 600,
    cursor: 'pointer',
    width: '100%',
    marginTop: '0.25rem',
    transition: 'background 0.15s',
    fontFamily: 'inherit',
  },
  errorBox: {
    background: '#fee2e2',
    color: '#b91c1c',
    padding: '0.65rem 0.875rem',
    borderRadius: '0.375rem',
    fontSize: '0.875rem',
    borderLeft: '3px solid #e74266',
  },
  switchText: {
    textAlign: 'center',
    fontSize: '0.875rem',
    color: '#687693',
    margin: '0.25rem 0 0',
  },
  link: {
    color: '#10b981',
    fontWeight: 600,
    textDecoration: 'none',
  },
};
