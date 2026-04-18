import React, { useState } from 'react';
import Layout from '../components/layout/Layout';
import FieldTable from '../components/fields/FieldTable';
import FieldCard from '../components/fields/FieldCard';
import FieldForm from '../components/fields/FieldForm';
import Modal from '../components/common/Modal';
import Button from '../components/common/Button';
import { useFields } from '../hooks/useFields';
import { useAuth } from '../hooks/useAuth';

export default function Fields() {
  const { user } = useAuth();
  const { fields, loading, error, createField, updateField, deleteField } = useFields();
  const isAdmin = user?.role === 'admin';

  const [view, setView] = useState('table'); // 'table' | 'grid'
  const [showCreate, setShowCreate] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  async function handleCreate(payload) {
    setSaving(true);
    setFormError('');
    try {
      await createField(payload);
      setShowCreate(false);
    } catch (err) {
      setFormError(err.response?.data?.message ?? 'Failed to create field');
    } finally {
      setSaving(false);
    }
  }

  async function handleUpdate(payload) {
    setSaving(true);
    setFormError('');
    try {
      await updateField(editTarget.id, payload);
      setEditTarget(null);
    } catch (err) {
      setFormError(err.response?.data?.message ?? 'Failed to update field');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    setSaving(true);
    try {
      await deleteField(deleteTarget.id);
      setDeleteTarget(null);
    } catch {
      // ignore
    } finally {
      setSaving(false);
    }
  }

  return (
    <Layout title="Fields">
      {/* Toolbar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <ViewToggle active={view === 'table'} onClick={() => setView('table')} label="Table" />
          <ViewToggle active={view === 'grid'} onClick={() => setView('grid')} label="Grid" />
        </div>
        {isAdmin && (
          <Button onClick={() => setShowCreate(true)}>+ New Field</Button>
        )}
      </div>

      {loading && <p style={{ color: 'var(--color-text)', opacity: 0.6 }}>Loading fields...</p>}
      {error && <p style={{ color: '#ef4444' }}>{error}</p>}

      {!loading && view === 'table' && (
        <div style={{ background: '#fff', borderRadius: 'var(--border-radius-md)', border: '1px solid var(--color-light-shade-50)', overflow: 'hidden' }}>
          <FieldTable
            fields={fields}
            isAdmin={isAdmin}
            onEdit={setEditTarget}
            onDelete={setDeleteTarget}
          />
        </div>
      )}

      {!loading && view === 'grid' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
          {fields.length === 0
            ? <p style={{ color: 'var(--color-text)', opacity: 0.6 }}>No fields yet.</p>
            : fields.map((f) => <FieldCard key={f.id} field={f} />)}
        </div>
      )}

      {/* Create modal */}
      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="New Field">
        {formError && <p style={{ color: '#ef4444', marginBottom: '1rem', fontSize: '0.85rem' }}>{formError}</p>}
        <FieldForm onSubmit={handleCreate} onCancel={() => setShowCreate(false)} loading={saving} />
      </Modal>

      {/* Edit modal */}
      <Modal open={!!editTarget} onClose={() => setEditTarget(null)} title="Edit Field">
        {formError && <p style={{ color: '#ef4444', marginBottom: '1rem', fontSize: '0.85rem' }}>{formError}</p>}
        {editTarget && (
          <FieldForm initial={editTarget} onSubmit={handleUpdate} onCancel={() => setEditTarget(null)} loading={saving} />
        )}
      </Modal>

      {/* Delete confirm modal */}
      <Modal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Delete Field" width={380}>
        <p style={{ fontSize: '0.9rem', marginBottom: '1.25rem', lineHeight: 1.6 }}>
          Are you sure you want to delete <strong>{deleteTarget?.name}</strong>? This cannot be undone.
        </p>
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
          <Button variant="ghost" onClick={() => setDeleteTarget(null)}>Cancel</Button>
          <Button variant="danger" onClick={handleDelete} loading={saving}>Delete</Button>
        </div>
      </Modal>
    </Layout>
  );
}

function ViewToggle({ active, onClick, label }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: '0.4rem 0.85rem',
        borderRadius: 'var(--border-radius)',
        border: `1px solid ${active ? 'var(--color-primary)' : 'var(--color-medium)'}`,
        background: active ? 'var(--color-primary)' : '#fff',
        color: active ? '#fff' : 'var(--color-text)',
        fontSize: '0.85rem',
        fontWeight: 500,
        cursor: 'pointer',
        transition: 'all var(--transition)',
      }}
    >
      {label}
    </button>
  );
}
