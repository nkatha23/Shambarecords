import React from 'react';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

export default function Layout({ title, children }) {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--color-light)' }}>
      <Sidebar />
      <div
        style={{
          marginLeft: 'var(--sidebar-width)',
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          minHeight: '100vh',
        }}
      >
        <Topbar title={title} />
        <main style={{ flex: 1, padding: '1.75rem', maxWidth: 1200 }}>
          {children}
        </main>
      </div>
    </div>
  );
}
