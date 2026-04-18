export function formatDate(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-KE', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function timeAgo(dateStr) {
  if (!dateStr) return '—';
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86_400_000);
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days} days ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  return formatDate(dateStr);
}

export const STAGE_LABELS = {
  planted: 'Planted',
  growing: 'Growing',
  ready: 'Ready',
  harvested: 'Harvested',
};

export const STATUS_LABELS = {
  active: 'Active',
  at_risk: 'At Risk',
  completed: 'Completed',
};

export function stageColor(stage) {
  const map = {
    planted: '#f59e0b',
    growing: '#3b82f6',
    ready: '#10b981',
    harvested: '#6b7280',
  };
  return map[stage] ?? '#687693';
}

export function statusColor(status) {
  const map = {
    active: '#10b981',
    at_risk: '#ef4444',
    completed: '#6b7280',
  };
  return map[status] ?? '#687693';
}

export function statusBg(status) {
  const map = {
    active: '#d1fae5',
    at_risk: '#fee2e2',
    completed: '#f3f4f6',
  };
  return map[status] ?? '#f2f4f8';
}

export function stageBg(stage) {
  const map = {
    planted: '#fef3c7',
    growing: '#dbeafe',
    ready: '#d1fae5',
    harvested: '#f3f4f6',
  };
  return map[stage] ?? '#f2f4f8';
}
