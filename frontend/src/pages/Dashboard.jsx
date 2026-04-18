import React from 'react';
import Layout from '../components/layout/Layout';
import StatCard from '../components/common/StatCard';
import StageChart from '../components/dashboard/StageChart';
import RecentUpdates from '../components/dashboard/RecentUpdates';
import { useDashboard } from '../hooks/useDashboard';
import { useAuth } from '../hooks/useAuth';

export default function Dashboard() {
  const { user } = useAuth();
  const { data, loading, error } = useDashboard();

  return (
    <Layout title="Dashboard">
      {loading && <p style={{ color: 'var(--color-text)', opacity: 0.6 }}>Loading...</p>}
      {error && <p style={{ color: '#ef4444' }}>{error}</p>}
      {data && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
          {/* Welcome */}
          <div>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--color-text-dark)', marginBottom: '0.25rem' }}>
              {user?.role === 'admin' ? 'Farm Overview' : 'My Fields'}
            </h2>
            <p style={{ fontSize: '0.875rem', color: 'var(--color-text)', opacity: 0.75 }}>
              {new Date().toLocaleDateString('en-KE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>

          {/* Stats row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))', gap: '1rem' }}>
            <StatCard label="Total Fields" value={data.totalFields} accent="var(--color-primary)" />
            <StatCard
              label="Active"
              value={data.statusBreakdown?.active ?? 0}
              accent="var(--status-active)"
              sub="on track"
            />
            <StatCard
              label="At Risk"
              value={data.statusBreakdown?.at_risk ?? 0}
              accent="var(--status-at-risk)"
              sub="need attention"
            />
            <StatCard
              label="Completed"
              value={data.statusBreakdown?.completed ?? 0}
              accent="var(--status-completed)"
              sub="harvested"
            />
            {user?.role === 'admin' && (
              <StatCard label="Agents" value={data.agentCount ?? 0} accent="var(--color-secondary)" />
            )}
          </div>

          {/* Bottom grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1.25rem' }}>
            {/* Stage breakdown */}
            <Card title="Stage Breakdown">
              <StageChart breakdown={data.stageBreakdown} />
            </Card>

            {/* Recent updates */}
            <Card title="Recent Updates">
              <RecentUpdates updates={data.recentUpdates} />
            </Card>

            {/* At risk list */}
            {(data.atRiskFields?.length > 0) && (
              <Card title="Fields Needing Attention" accent="#ef4444">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {data.atRiskFields.map((f) => (
                    <div
                      key={f.id}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        padding: '0.5rem 0.75rem',
                        background: '#fee2e2',
                        borderRadius: 'var(--border-radius)',
                        fontSize: '0.85rem',
                      }}
                    >
                      <span style={{ fontWeight: 600, color: '#7f1d1d' }}>{f.name}</span>
                      <span style={{ color: '#b91c1c' }}>{f.crop_type}</span>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>
        </div>
      )}
    </Layout>
  );
}

function Card({ title, children, accent }) {
  return (
    <div
      style={{
        background: '#fff',
        border: '1px solid var(--color-light-shade-50)',
        borderRadius: 'var(--border-radius-md)',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          padding: '0.875rem 1.25rem',
          borderBottom: '1px solid var(--color-light-shade-50)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
        }}
      >
        {accent && <span style={{ width: 3, height: 16, background: accent, borderRadius: 2, display: 'inline-block' }} />}
        <h3 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-text-dark)', margin: 0 }}>{title}</h3>
      </div>
      <div style={{ padding: '1rem 1.25rem' }}>{children}</div>
    </div>
  );
}
