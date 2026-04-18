import React, { useState } from 'react';
import Button from '../common/Button';

const STAGES = ['planted', 'growing', 'ready', 'harvested'];

export default function UpdateForm({ currentStage, onSubmit, onCancel, loading }) {
  const [form, setForm] = useState({ stage: currentStage, notes: '' });

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!form.notes.trim() && form.stage === currentStage) return;
    onSubmit(form);
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
        <label style={labelStyle}>Stage</label>
        <select
          name="stage"
          value={form.stage}
          onChange={handleChange}
          style={inputStyle}
        >
          {STAGES.map((s) => (
            <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
          ))}
        </select>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
        <label style={labelStyle}>
          Notes / Observations <span style={{ color: 'var(--color-primary)' }}>*</span>
        </label>
        <textarea
          name="notes"
          value={form.notes}
          onChange={handleChange}
          required
          rows={4}
          placeholder="Describe what you observed in the field..."
          style={{ ...inputStyle, resize: 'vertical' }}
        />
      </div>
      <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
        <Button variant="ghost" onClick={onCancel} type="button">Cancel</Button>
        <Button type="submit" variant="secondary" loading={loading}>Submit Update</Button>
      </div>
    </form>
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
  padding: '0.5rem 0.75rem',
  width: '100%',
  background: '#fff',
  color: 'var(--color-text-dark)',
  outline: 'none',
  fontFamily: 'inherit',
  fontSize: 'inherit',
};
