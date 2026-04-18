import React from 'react';
import { useNavigate } from 'react-router-dom';
import Table from '../common/Table';
import { StageBadge, StatusBadge } from '../common/Badge';
import { formatDate, timeAgo } from '../../utils/helpers';
import Button from '../common/Button';

export default function FieldTable({ fields, onEdit, onDelete, isAdmin }) {
  const navigate = useNavigate();

  const columns = [
    { key: 'name', label: 'Field', render: (v, row) => (
      <button
        onClick={() => navigate(`/fields/${row.id}`)}
        style={{ background: 'none', border: 'none', padding: 0, color: 'var(--color-text-dark)', fontWeight: 600, cursor: 'pointer', fontSize: '0.9rem', textAlign: 'left' }}
      >
        {v}
      </button>
    )},
    { key: 'crop_type', label: 'Crop' },
    { key: 'current_stage', label: 'Stage', render: (v) => <StageBadge stage={v} /> },
    { key: 'status', label: 'Status', render: (v) => <StatusBadge status={v} /> },
    { key: 'planting_date', label: 'Planted', render: (v) => formatDate(v) },
    { key: 'last_updated_at', label: 'Last Update', render: (v) => timeAgo(v) },
    ...(isAdmin ? [{ key: 'agent_name', label: 'Agent' }] : []),
    ...(isAdmin ? [{
      key: 'actions', label: '', render: (_, row) => (
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); onEdit(row); }}>Edit</Button>
          <Button size="sm" variant="danger" onClick={(e) => { e.stopPropagation(); onDelete(row); }}>Delete</Button>
        </div>
      )
    }] : []),
  ];

  return <Table columns={columns} rows={fields} emptyMessage="No fields found." />;
}
