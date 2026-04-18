import React, { useState, useEffect } from 'react';
import Button from '../common/Button';
import api from '../../utils/api';

const STAGES = ['planted', 'growing', 'ready', 'harvested'];

export default function FieldForm({ initial, onSubmit, onCancel, loading }) {
  const [agents, setAgents] = useState([]);
  const [form, setForm] = useState({
    name: initial?.name ?? '',
    crop_type: initial?.crop_type ?? '',
    planting_date: initial?.planting_date?.slice(0, 10) ?? '',
    current_stage: initial?.current_stage ?? 'planted',
    assigned_agent_id: initial?.assigned_agent_id ?? '',
    notes: initial?.notes ?? '',
  });

  useEffect(() => {
    api.get('/users?role=agent').then(({ data }) => setAgents(data)).catch(() => {});
  }, []);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    onSubmit(form);
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <Field label="Field Name" required>
        <input name="name" value={form.name} onChange={handleChange} required placeholder="e.g. Block A — North" />
      </Field>
      <Field label="Crop Type" required>
        <input name="crop_type" value={form.crop_type} onChange={handleChange} required placeholder="e.g. Maize, Tomatoes" />
      </Field>
      <Field label="Planting Date" required>
        <input type="date" name="planting_date" value={form.planting_date} onChange={handleChange} required />
      </Field>
      <Field label="Current Stage">
        <select name="current_stage" value={form.current_stage} onChange={handleChange}>
          {STAGES.map((s) => (
            <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
          ))}
        </select>
      </Field>
      <Field label="Assign Agent">
        <select name="assigned_agent_id" value={form.assigned_agent_id} onChange={handleChange}>
          <option value="">— Unassigned —</option>
          {agents.map((a) => (
            <option key={a.id} value={a.id}>{a.name}</option>
          ))}
        </select>
      </Field>
      <Field label="Notes">
        <textarea name="notes" value={form.notes} onChange={handleChange} rows={3} placeholder="Initial observations..." />
      </Field>
      <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
        <Button variant="ghost" onClick={onCancel} type="button">Cancel</Button>
        <Button type="submit" loading={loading}>{initial ? 'Save Changes' : 'Create Field'}</Button>
      </div>
    </form>
  );
}

function Field({ label, required, children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
      <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-dark)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
        {label}{required && <span style={{ color: 'var(--color-primary)', marginLeft: 2 }}>*</span>}
      </label>
      {React.cloneElement(children, {
        style: {
          border: '1px solid var(--color-light-shade-100)',
          borderRadius: 'var(--border-radius)',
          padding: '0.5rem 0.75rem',
          width: '100%',
          background: '#fff',
          color: 'var(--color-text-dark)',
          outline: 'none',
          transition: 'border-color var(--transition)',
          resize: 'vertical',
          ...children.props.style,
        },
        onFocus: (e) => (e.target.style.borderColor = 'var(--color-primary)'),
        onBlur: (e) => (e.target.style.borderColor = 'var(--color-light-shade-100)'),
      })}
    </div>
  );
}
