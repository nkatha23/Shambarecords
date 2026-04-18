import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import { StageBadge, StatusBadge } from '../components/common/Badge';
import UpdateForm from '../components/fields/UpdateForm';
import Modal from '../components/common/Modal';
import Button from '../components/common/Button';
import { useAuth } from '../hooks/useAuth';
import api from '../utils/api';
import { formatDate, timeAgo } from '../utils/helpers';

export default function FieldDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [field, setField] = useState(null);
  const [updates, setUpdates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showUpdate, setShowUpdate] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const fetchField = useCallback(async () => {
    setLoading(true);
    try {
      const [fRes, uRes] = await Promise.all([
        api.get(`/fields/${id}`),
        api.get(`/updates/${id}`),
      ]);
      setField(fRes.data);
      setUpdates(uRes.data);
    } catch {
      setError('Field not found or access denied.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { fetchField(); }, [fetchField]);

  async function handleUpdate(payload) {
    setSaving(true);
    try {
      await api.post(`/updates/${id}`, payload);
      await fetchField();
      setShowUpdate(false);
    } catch (err) {
      setError(err.response?.data?.message ?? 'Failed to submit update');
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <Layout title="Field Detail"><p style={{ color: 'var(--color-text)', opacity: 0.6 }}>Loading...</p></Layout>;
  if (error || !field) return <Layout title="Field Detail"><p style={{ color: '#ef4444' }}>{error || 'Not found'}</p></Layout>;

  return (
    <Layout title={field.name}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

        {/* Back */}
        <button
          onClick={() => navigate('/fields')}
          style={{ background: 'none', border: 'none', color: 'var(--color-text)', cursor: 'pointer', fontSize: '0.875rem', textAlign: 'left', padding: 0, display: 'flex', alignItems: 'center', gap: '0.3rem' }}
        >
          ← Back to Fields
        </button>

        {/* Header card */}
        <div style={{ background: '#fff', borderRadius: 'var(--border-radius-md)', border: '1px solid var(--color-light-shade-50)', padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-text-dark)', marginBottom: '0.4rem' }}>
                {field.name}
              </h2>
              <p style={{ color: 'var(--color-text)', fontSize: '0.9rem' }}>{field.crop_type}</p>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <StageBadge stage={field.current_stage} />
              <StatusBadge status={field.status} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '1rem', marginTop: '1.25rem' }}>
            <InfoItem label="Planting Date" value={formatDate(field.planting_date)} />
            <InfoItem label="Assigned Agent" value={field.agent_name ?? '—'} />
            <InfoItem label="Last Updated" value={timeAgo(field.last_updated_at)} />
            <InfoItem label="Total Updates" value={updates.length} />
          </div>

          {!isAdmin && (
            <div style={{ marginTop: '1.25rem' }}>
              <Button variant="secondary" onClick={() => setShowUpdate(true)}>Add Update</Button>
            </div>
          )}
        </div>

        {/* Update history */}
        <div style={{ background: '#fff', borderRadius: 'var(--border-radius-md)', border: '1px solid var(--color-light-shade-50)', overflow: 'hidden' }}>
          <div style={{ padding: '0.875rem 1.25rem', borderBottom: '1px solid var(--color-light-shade-50)' }}>
            <h3 style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--color-text-dark)', margin: 0 }}>Update History</h3>
          </div>
          <div style={{ padding: '1rem 1.25rem' }}>
            {updates.length === 0 ? (
              <p style={{ color: 'var(--color-text)', opacity: 0.6, fontSize: '0.875rem' }}>No updates yet.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                {updates.map((u, i) => (
                  <div
                    key={u.id}
                    style={{
                      display: 'flex',
                      gap: '1rem',
                      padding: '0.875rem 0',
                      borderBottom: i < updates.length - 1 ? '1px solid var(--color-light-shade-50)' : 'none',
                    }}
                  >
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem', paddingTop: 4 }}>
                      <div style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--color-secondary)', flexShrink: 0 }} />
                      {i < updates.length - 1 && <div style={{ width: 1, flex: 1, background: 'var(--color-light-shade-50)', minHeight: 20 }} />}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.3rem' }}>
                        <StageBadge stage={u.new_stage} />
                        <span style={{ fontSize: '0.78rem', color: 'var(--color-text)', opacity: 0.7 }}>{timeAgo(u.created_at)}</span>
                      </div>
                      {u.notes && <p style={{ fontSize: '0.875rem', color: 'var(--color-text)', lineHeight: 1.5 }}>{u.notes}</p>}
                      <p style={{ fontSize: '0.75rem', color: 'var(--color-text)', opacity: 0.65, marginTop: '0.25rem' }}>by {u.agent_name}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <Modal open={showUpdate} onClose={() => setShowUpdate(false)} title="Add Field Update">
        <UpdateForm
          currentStage={field.current_stage}
          onSubmit={handleUpdate}
          onCancel={() => setShowUpdate(false)}
          loading={saving}
        />
      </Modal>
    </Layout>
  );
}

function InfoItem({ label, value }) {
  return (
    <div>
      <p style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.2rem' }}>
        {label}
      </p>
      <p style={{ fontSize: '0.9rem', color: 'var(--color-text-dark)', fontWeight: 500 }}>{value}</p>
    </div>
  );
}
