import React, { useState, useEffect, useCallback } from 'react';
import Layout from '../components/layout/Layout';
import Table from '../components/common/Table';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';
import api from '../utils/api';

export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ name: '', email: '', password: '' });

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/users');
      setUsers(data);
    } catch {
      setError('Failed to load users');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  }

  async function handleCreate(e) {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await api.post('/users', { ...form, role: 'agent' });
      setShowCreate(false);
      setForm({ name: '', email: '', password: '' });
      await fetchUsers();
    } catch (err) {
      setError(err.response?.data?.message ?? 'Failed to create agent');
    } finally {
      setSaving(false);
    }
  }

  const columns = [
    { key: 'name', label: 'Name', render: (v) => <strong style={{ color: 'var(--color-text-dark)' }}>{v}</strong> },
    { key: 'email', label: 'Email' },
    { key: 'role', label: 'Role', render: (v) => (
      <span style={{
        display: 'inline-block', padding: '0.2rem 0.55rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 600,
        background: v === 'admin' ? '#fee2e2' : '#d1fae5',
        color: v === 'admin' ? '#b91c1c' : '#065f46',
        textTransform: 'capitalize',
      }}>{v}</span>
    )},
    { key: 'field_count', label: 'Fields Assigned' },
    { key: 'created_at', label: 'Joined', render: (v) => new Date(v).toLocaleDateString('en-KE', { month: 'short', year: 'numeric' }) },
  ];

  return (
    <Layout title="Agents">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <p style={{ fontSize: '0.875rem', color: 'var(--color-text)', opacity: 0.75 }}>
          {users.filter((u) => u.role === 'agent').length} field agent{users.filter((u) => u.role === 'agent').length !== 1 ? 's' : ''} registered
        </p>
        <Button onClick={() => setShowCreate(true)}>+ Add Agent</Button>
      </div>

      {loading && <p style={{ color: 'var(--color-text)', opacity: 0.6 }}>Loading...</p>}
      {!loading && (
        <div style={{ background: '#fff', borderRadius: 'var(--border-radius-md)', border: '1px solid var(--color-light-shade-50)', overflow: 'hidden' }}>
          <Table columns={columns} rows={users} emptyMessage="No users found." />
        </div>
      )}

      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Add Field Agent" width={420}>
        <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {error && <p style={{ color: '#ef4444', fontSize: '0.85rem' }}>{error}</p>}
          {[
            { name: 'name', label: 'Full Name', placeholder: 'Jane Doe', type: 'text' },
            { name: 'email', label: 'Email', placeholder: 'jane@shamba.io', type: 'email' },
            { name: 'password', label: 'Password', placeholder: '••••••••', type: 'password' },
          ].map(({ name, label, placeholder, type }) => (
            <div key={name} style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              <label style={labelStyle}>{label}</label>
              <input
                name={name}
                type={type}
                value={form[name]}
                onChange={handleChange}
                required
                placeholder={placeholder}
                style={inputStyle}
                onFocus={(e) => (e.target.style.borderColor = 'var(--color-primary)')}
                onBlur={(e) => (e.target.style.borderColor = 'var(--color-light-shade-100)')}
              />
            </div>
          ))}
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
            <Button variant="ghost" type="button" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button type="submit" loading={saving}>Create Agent</Button>
          </div>
        </form>
      </Modal>
    </Layout>
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
  padding: '0.55rem 0.75rem',
  width: '100%',
  background: '#fff',
  color: 'var(--color-text-dark)',
  outline: 'none',
  transition: 'border-color 0.15s',
  fontFamily: 'inherit',
  fontSize: '0.9375rem',
};
